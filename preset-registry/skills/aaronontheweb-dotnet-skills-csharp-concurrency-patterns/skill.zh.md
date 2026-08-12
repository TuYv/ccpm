---
name: csharp-concurrency-patterns
description: Choosing the right concurrency abstraction in .NET - from async/await for I/O to Channels for producer/consumer to Akka.NET for stateful entity management. Avoid locks and manual synchronization unless absolutely necessary.
invocable: false
---
# .NET 并发：选择合适的工具

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 决定如何在 .NET 中处理并发操作
- 评估是否使用 async/await、Channels、Akka.NET 或其他抽象
- 想要使用锁、信号量或其他同步原语
- 需要以背压、批处理或防抖方式处理数据流
- 管理多个并发实体的状态

## 参考文件

- [advanced-concurrency.md](advanced-concurrency.md)：Akka.NET Streams、Reactive Extensions、Akka.NET Actors（每实体一个 Actor、状态机、集群分片）以及异步局部函数模式

## 设计理念

**从简单方案开始，仅在必要时升级。**

大多数并发问题都可以使用 `async/await` 解决。只有当你有明确的需求，且 async/await 无法简洁地满足该需求时，才应采用更复杂的工具。

**尽量避免共享可变状态。** 处理并发的最佳方式是通过设计消除它。不可变数据、消息传递和隔离状态（例如 Actor）可以彻底消除多类错误。

**锁应该是例外，而非常规选择。** 当你无法避免共享可变状态时：
1. **首选：** 重新设计以避免共享可变状态（不可变性、消息传递、Actor 隔离）
2. **第二选择：** 使用 `System.Collections.Concurrent`（ConcurrentDictionary 等）
3. **第三选择：** 使用 `Channel<T>`，通过消息传递将访问串行化
4. **最后手段：** 对简单、短暂的临界区使用 `lock`

---

## 决策树

```
What are you trying to do?
│
├─► Wait for I/O (HTTP, database, file)?
│   └─► Use async/await
│
├─► Process a collection in parallel (CPU-bound)?
│   └─► Use Parallel.ForEachAsync
│
├─► Producer/consumer pattern (work queue)?
│   └─► Use System.Threading.Channels
│
├─► UI event handling (debounce, throttle, combine)?
│   └─► Use Reactive Extensions (Rx)
│
├─► Server-side stream processing (backpressure, batching)?
│   └─► Use Akka.NET Streams
│
├─► State machines with complex transitions?
│   └─► Use Akka.NET Actors (Become pattern)
│
├─► Manage state for many independent entities?
│   └─► Use Akka.NET Actors (entity-per-actor)
│
├─► Coordinate multiple async operations?
│   └─► Use Task.WhenAll / Task.WhenAny
│
└─► None of the above fits?
    └─► Ask yourself: "Do I really need shared mutable state?"
        ├─► Yes → Consider redesigning to avoid it
        └─► Truly unavoidable → Use Channels or Actors to serialize access
```

---

## 第 1 级：async/await（默认选择）

**适用于：** I/O 密集型操作、非阻塞等待以及大多数日常并发场景。

```csharp
// Simple async I/O
public async Task<Order> GetOrderAsync(string orderId, CancellationToken ct)
{
    var order = await _database.GetAsync(orderId, ct);
    var customer = await _customerService.GetAsync(order.CustomerId, ct);
    return order with { Customer = customer };
}

// Parallel async operations (when independent)
public async Task<Dashboard> LoadDashboardAsync(string userId, CancellationToken ct)
{
    var ordersTask = _orderService.GetRecentOrdersAsync(userId, ct);
    var notificationsTask = _notificationService.GetUnreadAsync(userId, ct);
    var statsTask = _statsService.GetUserStatsAsync(userId, ct);

    await Task.WhenAll(ordersTask, notificationsTask, statsTask);

    return new Dashboard(
        Orders: await ordersTask,
        Notifications: await notificationsTask,
        Stats: await statsTask);
}
```

**关键原则：** 始终接受 `CancellationToken`。在库代码中使用 `ConfigureAwait(false)`。不要阻塞异步代码。

---

## 第 2 级：Parallel.ForEachAsync（CPU 密集型并行）

**适用于：** 当工作负载为 CPU 密集型或需要控制并发度时，并行处理集合。

```csharp
public async Task ProcessOrdersAsync(
    IEnumerable<Order> orders,
    CancellationToken ct)
{
    await Parallel.ForEachAsync(
        orders,
        new ParallelOptions
        {
            MaxDegreeOfParallelism = Environment.ProcessorCount,
            CancellationToken = ct
        },
        async (order, token) =>
        {
            await ProcessOrderAsync(order, token);
        });
}
```

**不适用的情况：** 纯 I/O 操作、处理顺序很重要，或需要背压时。

---

## 第 3 级：System.Threading.Channels（生产者/消费者）

**适用于：** 工作队列、生产者/消费者模式，以及将生产者与消费者解耦。

```csharp
public class OrderProcessor
{
    private readonly Channel<Order> _channel;

    public OrderProcessor()
    {
        _channel = Channel.CreateBounded<Order>(new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.Wait
        });
    }

    // Producer
    public async Task EnqueueOrderAsync(Order order, CancellationToken ct)
    {
        await _channel.Writer.WriteAsync(order, ct);
    }

    // Consumer (run as background task)
    public async Task ProcessOrdersAsync(CancellationToken ct)
    {
        await foreach (var order in _channel.Reader.ReadAllAsync(ct))
        {
            await ProcessOrderAsync(order, ct);
        }
    }

    public void Complete() => _channel.Writer.Complete();
}
```

**Channels 适用于：** 处理速度解耦、带背压的缓冲、将工作扇出至多个工作器，以及后台队列。

**Channels 不适用于：** 复杂的流操作（批处理、窗口处理）、按实体维护状态的处理，以及复杂的监督机制。

---

## 第 4 级及以上：Akka.NET Streams、Reactive Extensions、Actors

对于需要流处理、UI 事件组合或有状态实体管理的高级场景，请参阅 [advanced-concurrency.md](advanced-concurrency.md)。

**Akka.NET Streams** 擅长服务端批处理、限流和背压。**Reactive Extensions** 非常适合 UI 事件组合。**Akka.NET Actors** 可处理每个实体对应一个 Actor 的模式、使用 `Become()` 的状态机，以及通过 Cluster Sharding 实现的分布式系统。

---

## 反模式：应避免的做法

### 对业务逻辑使用锁

```csharp
// BAD: Using locks to protect shared state
private readonly object _lock = new();
private Dictionary<string, Order> _orders = new();

public void UpdateOrder(string id, Action<Order> update)
{
    lock (_lock) { if (_orders.TryGetValue(id, out var order)) update(order); }
}

// GOOD: Use an actor or Channel to serialize access
```

### 手动管理线程

```csharp
// BAD: Creating threads manually
var thread = new Thread(() => ProcessOrders());
thread.Start();

// GOOD: Use Task.Run or better abstractions
_ = Task.Run(() => ProcessOrdersAsync(cancellationToken));
```

### 在异步代码中阻塞

```csharp
// BAD: Blocking on async - deadlock risk!
var result = GetDataAsync().Result;

// GOOD: Async all the way
var result = await GetDataAsync();
```

### 未受保护的共享可变状态

```csharp
// BAD: Multiple tasks mutating shared state
var results = new List<Result>();
await Parallel.ForEachAsync(items, async (item, ct) =>
{
    var result = await ProcessAsync(item, ct);
    results.Add(result); // Race condition!
});

// GOOD: Use ConcurrentBag
var results = new ConcurrentBag<Result>();
```

---

## 快速参考：何时使用哪种工具？

| 需求 | 工具 | 示例 |
|------|------|---------|
| 等待 I/O | `async/await` | HTTP 调用、数据库查询 |
| 并行执行 CPU 工作 | `Parallel.ForEachAsync` | 图像处理、计算 |
| 工作队列 | `Channel<T>` | 后台作业处理 |
| 带防抖/节流的 UI 事件 | Reactive Extensions | 输入时搜索、自动保存 |
| 服务端批处理/节流 | Akka.NET Streams | 事件聚合、速率限制 |
| 状态机 | Akka.NET Actors | 支付流程、订单生命周期 |
| 实体状态管理 | Akka.NET Actors | 订单管理、用户会话 |
| 发起多个异步操作 | `Task.WhenAll` | 加载仪表板数据 |
| 竞速执行多个异步操作 | `Task.WhenAny` | 带回退机制的超时处理 |
| 周期性工作 | `PeriodicTimer` | 健康检查、轮询 |

---

## 升级路径

```
async/await (start here)
    │
    ├─► Need parallelism? → Parallel.ForEachAsync
    │
    ├─► Need producer/consumer? → Channel<T>
    │
    ├─► Need UI event composition? → Reactive Extensions
    │
    ├─► Need server-side stream processing? → Akka.NET Streams
    │
    └─► Need state machines or entity management? → Akka.NET Actors
```

**仅在有明确需求时才升级。** 不要“以防万一”就使用 Actor 或流。