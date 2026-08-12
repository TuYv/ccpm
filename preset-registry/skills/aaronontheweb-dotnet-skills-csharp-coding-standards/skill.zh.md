---
name: modern-csharp-coding-standards
description: Write modern, high-performance C# code using records, pattern matching, value objects, async/await, Span<T>/Memory<T>, and best-practice API design patterns. Emphasizes functional-style programming with C# 12+ features.
invocable: false
---
# 现代 C# 编码标准

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 编写新的 C# 代码或重构现有代码
- 为库或服务设计公共 API
- 优化性能关键型代码路径
- 使用强类型实现领域模型
- 构建大量使用 async/await 的应用程序
- 处理二进制数据、缓冲区或高吞吐量场景

## 参考文件

- [value-objects-and-patterns.md](value-objects-and-patterns.md)：完整的值对象示例和模式匹配代码
- [performance-and-api-design.md](performance-and-api-design.md)：Span<T>/Memory<T> 示例和 API 设计原则
- [composition-and-error-handling.md](composition-and-error-handling.md)：组合优于继承、Result 类型、测试模式
- [anti-patterns-and-reflection.md](anti-patterns-and-reflection.md)：避免使用反射和常见反模式

## 核心原则

1. **默认不可变** - 使用 `record` 类型和仅支持 `init` 的属性
2. **类型安全** - 利用可空引用类型和值对象
3. **现代模式匹配** - 广泛使用 `switch` 表达式和模式
4. **全面异步** - 优先使用支持正确取消机制的异步 API
5. **零分配模式** - 对性能关键型代码使用 `Span<T>` 和 `Memory<T>`
6. **API 设计** - 接受抽象类型，返回具有适当具体程度的类型
7. **组合优于继承** - 避免使用抽象基类，优先使用组合
8. **将值对象实现为结构体** - 对值对象使用 `readonly record struct`

---

## 语言模式

### 使用记录表示不可变数据（C# 9+）

对 DTO、消息、事件和领域实体使用 `record` 类型。

```csharp
// Simple immutable DTO
public record CustomerDto(string Id, string Name, string Email);

// Record with validation in constructor
public record EmailAddress
{
    public string Value { get; init; }

    public EmailAddress(string value)
    {
        if (string.IsNullOrWhiteSpace(value) || !value.Contains('@'))
            throw new ArgumentException("Invalid email address", nameof(value));

        Value = value;
    }
}

// Records with collections - use IReadOnlyList
public record ShoppingCart(
    string CartId,
    string CustomerId,
    IReadOnlyList<CartItem> Items
)
{
    public decimal Total => Items.Sum(item => item.Price * item.Quantity);
}
```

**何时使用 `record class` 与 `record struct`：**
- `record class`（默认）：引用类型，用于实体、聚合以及具有多个属性的 DTO
- `record struct`：值类型，用于值对象（请参阅下一节）

### 使用 readonly record struct 实现值对象

为获得更好的性能和值语义，值对象应**始终使用 `readonly record struct`**。请使用显式转换，切勿使用隐式运算符。

```csharp
public readonly record struct OrderId(string Value)
{
    public OrderId(string value) : this(
        !string.IsNullOrWhiteSpace(value)
            ? value
            : throw new ArgumentException("OrderId cannot be empty", nameof(value)))
    { }
    public override string ToString() => Value;
}

public readonly record struct Money(decimal Amount, string Currency);
public readonly record struct CustomerId(Guid Value)
{
    public static CustomerId New() => new(Guid.NewGuid());
}
```

有关多值对象、工厂模式和禁止隐式转换规则的完整示例，请参阅 [value-objects-and-patterns.md](value-objects-and-patterns.md)。

### 模式匹配（C# 8-12）

使用 switch 表达式、属性模式、关系模式和列表模式，使代码更加简洁。

```csharp
public decimal CalculateDiscount(Order order) => order switch
{
    { Total: > 1000m } => order.Total * 0.15m,
    { Total: > 500m } => order.Total * 0.10m,
    { Total: > 100m } => order.Total * 0.05m,
    _ => 0m
};
```

有关完整的模式匹配示例，请参阅 [value-objects-and-patterns.md](value-objects-and-patterns.md)。

---

### 可空引用类型（C# 8+）

在项目中启用可空引用类型，并显式处理 null。

```csharp
// In .csproj
<PropertyGroup>
    <Nullable>enable</Nullable>
</PropertyGroup>

// Explicit nullability
public string? FindUserName(string userId)
{
    var user = _repository.Find(userId);
    return user?.Name;
}

// Pattern matching with null checks
public decimal GetDiscount(Customer? customer) => customer switch
{
    null => 0m,
    { IsVip: true } => 0.20m,
    { OrderCount: > 10 } => 0.10m,
    _ => 0.05m
};

// Guard clauses with ArgumentNullException.ThrowIfNull (C# 11+)
public void ProcessOrder(Order? order)
{
    ArgumentNullException.ThrowIfNull(order);
    // order is now non-nullable in this scope
    Console.WriteLine(order.Id);
}
```

---

## 组合优于继承

**避免使用抽象基类。** 使用接口 + 组合。使用静态辅助方法实现共享逻辑。使用带工厂方法的记录来表示变体。

有关完整示例，请参阅 [composition-and-error-handling.md](composition-and-error-handling.md)。

---

## 性能模式

### Async/Await 最佳实践

```csharp
// Async all the way - always accept CancellationToken
public async Task<Order> GetOrderAsync(string orderId, CancellationToken cancellationToken)
{
    var order = await _repository.GetAsync(orderId, cancellationToken);
    return order;
}

// ValueTask for frequently-called, often-synchronous methods
public ValueTask<Order?> GetCachedOrderAsync(string orderId, CancellationToken cancellationToken)
{
    if (_cache.TryGetValue(orderId, out var order))
        return ValueTask.FromResult<Order?>(order);
    return GetFromDatabaseAsync(orderId, cancellationToken);
}

// IAsyncEnumerable for streaming
public async IAsyncEnumerable<Order> StreamOrdersAsync(
    string customerId,
    [EnumeratorCancellation] CancellationToken cancellationToken = default)
{
    await foreach (var order in _repository.StreamAllAsync(cancellationToken))
    {
        if (order.CustomerId == customerId)
            yield return order;
    }
}
```

**关键规则：**
- 始终接受带有 `= default` 的 `CancellationToken`
- 在库代码中使用 `ConfigureAwait(false)`
- 切勿阻塞异步代码（不要使用 `.Result` 或 `.Wait()`）
- 使用链接的 CancellationTokenSource 实现超时

### Span<T> 和 Memory<T>

将 `Span<T>` 用于同步零分配操作，将 `Memory<T>` 用于异步操作，并将 `ArrayPool<T>` 用于大型临时缓冲区。

有关完整的 Span/Memory 示例和 API 设计部分，请参阅 [performance-and-api-design.md](performance-and-api-design.md)。

---

## 错误处理：Result 类型

对于预期内的错误，使用 `Result<T, TError>` 而不是异常。仅对意外错误或系统错误使用异常。

有关 Result 类型的完整实现和使用示例，请参阅 [composition-and-error-handling.md](composition-and-error-handling.md)。

---

## 避免基于反射的元编程

**禁止使用：** AutoMapper、Mapster、ExpressMapper。改用显式映射扩展方法。仅在确实需要访问私有成员时使用 `UnsafeAccessorAttribute`（.NET 8+）。

有关完整指南，请参阅 [anti-patterns-and-reflection.md](anti-patterns-and-reflection.md)。

---

## 代码组织

```csharp
// File: Domain/Orders/Order.cs

namespace MyApp.Domain.Orders;

// 1. Primary domain type
public record Order(
    OrderId Id,
    CustomerId CustomerId,
    Money Total,
    OrderStatus Status,
    IReadOnlyList<OrderItem> Items
)
{
    public bool IsCompleted => Status is OrderStatus.Completed;

    public Result<Order, OrderError> AddItem(OrderItem item)
    {
        if (Status is not OrderStatus.Draft)
            return Result<Order, OrderError>.Failure(
                new OrderError("ORDER_NOT_DRAFT", "Can only add items to draft orders"));

        var newItems = Items.Append(item).ToList();
        var newTotal = new Money(
            Items.Sum(i => i.Total.Amount) + item.Total.Amount,
            Total.Currency);

        return Result<Order, OrderError>.Success(
            this with { Items = newItems, Total = newTotal });
    }
}

// 2. Enums for state
public enum OrderStatus { Draft, Submitted, Processing, Completed, Cancelled }

// 3. Related types
public record OrderItem(ProductId ProductId, Quantity Quantity, Money UnitPrice)
{
    public Money Total => new(UnitPrice.Amount * Quantity.Value, UnitPrice.Currency);
}

// 4. Value objects
public readonly record struct OrderId(Guid Value)
{
    public static OrderId New() => new(Guid.NewGuid());
}

// 5. Errors
public readonly record struct OrderError(string Code, string Message);
```

---

## 最佳实践总结

### 应该做的
- 对 DTO、消息和领域实体使用 `record`
- 对值对象使用 `readonly record struct`
- 通过 `switch` 表达式利用模式匹配
- 启用并遵循可空引用类型
- 对所有 I/O 操作使用 async/await
- 在所有异步方法中接受 `CancellationToken`
- 在高性能场景中使用 `Span<T>` 和 `Memory<T>`
- 接受抽象类型（`IEnumerable<T>`、`IReadOnlyList<T>`）
- 对预期内的错误使用 `Result<T, TError>`
- 对大型分配使用 `ArrayPool<T>` 复用缓冲区
- 优先使用组合而非继承

### 不应该做的
- 能使用记录时，不要使用可变类
- 不要对值对象使用类（应使用 `readonly record struct`）
- 不要创建过深的继承层次结构
- 不要忽略可空引用类型警告
- 不要阻塞异步代码（`.Result`、`.Wait()`）
- 当 `Span<byte>` 足够时，不要使用 `byte[]`
- 不要忘记添加 `CancellationToken` 参数
- 不要从 API 返回可变集合
- 不要为预期内的业务错误抛出异常
- 不要反复分配大型数组（应使用 `ArrayPool`）

有关详细的反模式示例，请参阅 [anti-patterns-and-reflection.md](anti-patterns-and-reflection.md)。

---

## 其他资源

- **C# 语言规范**：https://learn.microsoft.com/en-us/dotnet/csharp/
- **模式匹配**：https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/functional/pattern-matching
- **Span<T> 和 Memory<T>**：https://learn.microsoft.com/en-us/dotnet/standard/memory-and-spans/
- **异步最佳实践**：https://learn.microsoft.com/en-us/archive/msdn-magazine/2013/march/async-await-best-practices-in-asynchronous-programming
- **.NET 性能提示**：https://learn.microsoft.com/en-us/dotnet/framework/performance/