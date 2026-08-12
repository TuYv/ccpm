---
name: type-design-performance
description: Design .NET types for performance. Seal classes, use readonly structs, prefer static pure functions, avoid premature enumeration, and choose the right collection types.
invocable: false
---
# 面向性能的类型设计

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 设计新的类型和 API
- 审查代码中的性能问题
- 在 class、struct 和 record 之间进行选择
- 使用集合和可枚举对象

---

## 核心原则

1. **密封你的类型** - 除非明确设计为可继承
2. **优先使用 readonly struct** - 适用于小型、不可变的值类型
3. **优先使用静态纯函数** - 性能和可测试性更好
4. **延迟枚举** - 在真正需要之前不要将其物化
5. **返回不可变集合** - 从 API 边界返回

---

## 默认密封类

密封类可以让 JIT 执行去虚拟化，并明确传达 API 的设计意图。

```csharp
// DO: Seal classes not designed for inheritance
public sealed class OrderProcessor
{
    public void Process(Order order) { }
}

// DO: Seal records (they're classes)
public sealed record OrderCreated(OrderId Id, CustomerId CustomerId);

// DON'T: Leave unsealed without reason
public class OrderProcessor  // Can be subclassed - intentional?
{
    public virtual void Process(Order order) { }  // Virtual = slower
}
```

**优点：**
- JIT 可以对方法调用执行去虚拟化
- 明确传达“这不是一个扩展点”
- 防止意外引入破坏性变更

---

## 对值类型使用 Readonly Struct

不可变的 struct 应声明为 `readonly`。这可以避免防御性复制。

```csharp
// DO: Readonly struct for immutable value types
public readonly record struct OrderId(Guid Value)
{
    public static OrderId New() => new(Guid.NewGuid());
    public override string ToString() => Value.ToString();
}

// DO: Readonly struct for small, short-lived data
public readonly struct Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }
}

// DON'T: Mutable struct (causes defensive copies)
public struct Point  // Not readonly!
{
    public int X { get; set; }  // Mutable!
    public int Y { get; set; }
}
```

### 何时使用 Struct

| 使用 Struct 的情况 | 使用 Class 的情况 |
|-----------------|----------------|
| 较小（通常 ≤16 字节） | 较大的对象 |
| 生命周期短 | 生命周期长 |
| 频繁分配 | 需要共享引用 |
| 需要值语义 | 需要标识语义 |
| 不可变 | 可变状态 |

---

## 优先使用静态纯函数

没有副作用的静态方法速度更快，也更易于测试。

```csharp
// DO: Static pure function
public static class OrderCalculator
{
    public static Money CalculateTotal(IReadOnlyList<OrderItem> items)
    {
        var total = items.Sum(i => i.Price * i.Quantity);
        return new Money(total, "USD");
    }
}

// Usage - predictable, testable
var total = OrderCalculator.CalculateTotal(items);
```

**优点：**
- 无需查找 vtable（速度更快）
- 没有隐藏状态
- 更易于测试（纯输入 → 输出）
- 设计上即为线程安全
- 强制显式声明依赖项

```csharp
// DON'T: Instance method hiding dependencies
public class OrderCalculator
{
    private readonly ITaxService _taxService;  // Hidden dependency
    private readonly IDiscountService _discountService;  // Hidden dependency

    public Money CalculateTotal(IReadOnlyList<OrderItem> items)
    {
        // What does this actually depend on?
    }
}

// BETTER: Explicit dependencies via parameters
public static class OrderCalculator
{
    public static Money CalculateTotal(
        IReadOnlyList<OrderItem> items,
        decimal taxRate,
        decimal discountPercent)
    {
        // All inputs visible
    }
}
```

**不要做过头** - 只有在确实需要状态或多态时才使用实例方法。

---

## 延迟枚举

在确有必要之前，不要将可枚举对象具体化。避免过长的 LINQ 调用链。

```csharp
// BAD: Premature materialization
public IReadOnlyList<Order> GetActiveOrders()
{
    return _orders
        .Where(o => o.IsActive)
        .ToList()  // Materialized!
        .OrderBy(o => o.CreatedAt)  // Another iteration
        .ToList();  // Materialized again!
}

// GOOD: Defer until the end
public IReadOnlyList<Order> GetActiveOrders()
{
    return _orders
        .Where(o => o.IsActive)
        .OrderBy(o => o.CreatedAt)
        .ToList();  // Single materialization
}

// GOOD: Return IEnumerable if caller might not need all items
public IEnumerable<Order> GetActiveOrders()
{
    return _orders
        .Where(o => o.IsActive)
        .OrderBy(o => o.CreatedAt);
    // Caller decides when to materialize
}
```

### 异步枚举

使用异步和 IEnumerable 时要格外小心：

```csharp
// BAD: Async in LINQ - hidden allocations
var results = orders
    .Select(async o => await ProcessOrderAsync(o))  // Task per item!
    .ToList();
await Task.WhenAll(results);

// GOOD: Use IAsyncEnumerable for streaming
public async IAsyncEnumerable<OrderResult> ProcessOrdersAsync(
    IEnumerable<Order> orders,
    [EnumeratorCancellation] CancellationToken ct = default)
{
    foreach (var order in orders)
    {
        ct.ThrowIfCancellationRequested();
        yield return await ProcessOrderAsync(order, ct);
    }
}

// GOOD: Batch processing for parallelism
var results = await Task.WhenAll(
    orders.Select(o => ProcessOrderAsync(o)));
```

---

## ValueTask 与 Task

对于通常会同步完成的热路径，使用 `ValueTask`。对于真正的 I/O，直接使用 `Task`。

```csharp
// DO: ValueTask for cached/synchronous paths
public ValueTask<User?> GetUserAsync(UserId id)
{
    if (_cache.TryGetValue(id, out var user))
    {
        return ValueTask.FromResult<User?>(user);  // No allocation
    }

    return new ValueTask<User?>(FetchUserAsync(id));
}

// DO: Task for real I/O (simpler, no footguns)
public Task<Order> CreateOrderAsync(CreateOrderCommand cmd)
{
    // This always hits the database
    return _repository.CreateAsync(cmd);
}
```

**ValueTask 规则：**
- 切勿多次等待同一个 ValueTask
- 切勿在完成之前使用 `.Result` 或 `.GetAwaiter().GetResult()`
- 如有疑问，请使用 Task

---

## 用于字节操作的 Span 和 Memory

对于底层操作，使用 `Span<T>` 和 `Memory<T>`，而不是 `byte[]`。

```csharp
// DO: Accept Span for synchronous operations
public static int ParseInt(ReadOnlySpan<char> text)
{
    return int.Parse(text);
}

// DO: Accept Memory for async operations
public async Task WriteAsync(ReadOnlyMemory<byte> data)
{
    await _stream.WriteAsync(data);
}

// DON'T: Force array allocation
public static int ParseInt(string text)  // String allocated
{
    return int.Parse(text);
}
```

### 常见 Span 模式

```csharp
// Slice without allocation
ReadOnlySpan<char> span = "Hello, World!".AsSpan();
var hello = span[..5];  // No allocation

// Stack allocation for small buffers
Span<byte> buffer = stackalloc byte[256];

// Use ArrayPool for larger buffers
var buffer = ArrayPool<byte>.Shared.Rent(4096);
try
{
    // Use buffer...
}
finally
{
    ArrayPool<byte>.Shared.Return(buffer);
}
```

---

## 集合返回类型

### 从 API 返回不可变集合

```csharp
// DO: Return immutable collection
public IReadOnlyList<Order> GetOrders()
{
    return _orders.ToList();  // Caller can't modify internal state
}

// DO: Use frozen collections for static data (.NET 8+)
private static readonly FrozenDictionary<string, Handler> _handlers =
    new Dictionary<string, Handler>
    {
        ["create"] = new CreateHandler(),
        ["update"] = new UpdateHandler(),
    }.ToFrozenDictionary();

// DON'T: Return mutable collection
public List<Order> GetOrders()
{
    return _orders;  // Caller can modify!
}
```

### 内部可变没有问题

```csharp
public IReadOnlyList<OrderItem> BuildOrderItems(Cart cart)
{
    var items = new List<OrderItem>();  // Mutable internally

    foreach (var cartItem in cart.Items)
    {
        items.Add(CreateOrderItem(cartItem));
    }

    return items;  // Return as IReadOnlyList
}
```

### 集合指南

| 场景 | 返回类型 |
|----------|-------------|
| API 边界 | `IReadOnlyList<T>`、`IReadOnlyCollection<T>` |
| 静态查找数据 | `FrozenDictionary<K,V>`、`FrozenSet<T>` |
| 内部构建 | `List<T>`，然后以只读形式返回 |
| 单个项目或无项目 | `T?`（可空） |
| 零个或多个，惰性求值 | `IEnumerable<T>` |

---

## 快速参考

| 模式 | 优点 |
|---------|---------|
| `sealed class` | 去虚拟化、清晰的 API |
| `readonly record struct` | 无防御性复制、值语义 |
| 静态纯函数 | 无虚方法表、可测试、线程安全 |
| 推迟 `.ToList()` | 仅具体化一次 |
| 对热路径使用 `ValueTask` | 避免分配 Task |
| 对字节使用 `Span<T>` | 栈分配、无需复制 |
| 返回 `IReadOnlyList<T>` | 不可变的 API 契约 |
| `FrozenDictionary` | 静态数据的最快查找方式 |

---

## 反模式

```csharp
// DON'T: Unsealed class without reason
public class OrderService { }  // Seal it!

// DON'T: Mutable struct
public struct Point { public int X; public int Y; }  // Make readonly

// DON'T: Instance method that could be static
public int Add(int a, int b) => a + b;  // Make static

// DON'T: Multiple ToList() calls
items.Where(...).ToList().OrderBy(...).ToList();  // One ToList at end

// DON'T: Return List<T> from public API
public List<Order> GetOrders();  // Return IReadOnlyList<T>

// DON'T: ValueTask for always-async operations
public ValueTask<Order> CreateOrderAsync();  // Just use Task
```

---

## 资源

- **性能最佳实践**：https://learn.microsoft.com/en-us/dotnet/standard/performance/
- **Span<T> 指南**：https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/
- **冻结集合**：https://learn.microsoft.com/en-us/dotnet/api/system.collections.frozen