---
name: akka-net-best-practices
description: Critical Akka.NET best practices including EventStream vs DistributedPubSub, supervision strategies, error handling, Props vs DependencyResolver, work distribution patterns, and cluster/local mode abstractions for testability.
invocable: false
---
# Akka.NET 最佳实践

## 何时使用此技能

在以下情况下使用此技能：
- 设计 Actor 通信模式
- 在 EventStream 和 DistributedPubSub 之间进行选择
- 在 Actor 中实现错误处理
- 理解监督策略
- 在 Props 模式和 DependencyResolver 之间进行选择
- 设计跨节点的工作分发
- 创建可在有或无集群基础设施的情况下运行且可测试的 Actor 系统
- 对 Cluster Sharding 进行抽象，以支持本地测试场景

## 参考文件

- [工作分发模式](work-distribution-patterns.md)：数据库队列、Akka.Streams 限流、发件箱模式
- [集群与本地抽象](cluster-local-abstractions.md)：GenericChildPerEntityParent、IPubSubMediator、执行模式接线
- [异步取消模式](async-cancellation-patterns.md)：Actor 作用域的 CancellationToken、关联的 CTS、超时处理

---

## 1. EventStream 与 DistributedPubSub 对比

### 重要：EventStream 仅限本地使用

`Context.System.EventStream` **仅限于单个 ActorSystem 进程内使用**。它无法跨集群节点工作。

```csharp
// BAD: This only works on a single server
// When you add a second server, subscribers on server 2 won't receive events from server 1
Context.System.EventStream.Subscribe(Self, typeof(PostCreated));
Context.System.EventStream.Publish(new PostCreated(postId, authorId));
```

**适合使用 EventStream 的场景：**
- 单个进程内的日志记录和诊断
- 真正的单进程应用程序所使用的本地事件总线
- 开发/测试场景

### 多节点场景使用 DistributedPubSub

对于必须到达多个集群节点上 Actor 的事件，请使用 `Akka.Cluster.Tools.PublishSubscribe`：

```csharp
using Akka.Cluster.Tools.PublishSubscribe;

public class TimelineUpdatePublisher : ReceiveActor
{
    private readonly IActorRef _mediator;

    public TimelineUpdatePublisher()
    {
        // Get the DistributedPubSub mediator
        _mediator = DistributedPubSub.Get(Context.System).Mediator;

        Receive<PublishTimelineUpdate>(msg =>
        {
            // Publish to a topic - reaches all subscribers across all nodes
            _mediator.Tell(new Publish($"timeline:{msg.UserId}", msg.Update));
        });
    }
}
```

### DistributedPubSub 的 Akka.Hosting 配置

```csharp
builder.WithDistributedPubSub(role: null); // Available on all roles, or specify a role
```

### 主题设计模式

| 模式 | 主题格式 | 使用场景 |
|---------|--------------|----------|
| 每用户 | `timeline:{userId}` | 时间线更新、通知 |
| 每实体 | `post:{postId}` | 帖子互动更新 |
| 广播 | `system:announcements` | 全系统通知 |
| 基于角色 | `workers:rss-poller` | 工作分发 |

---

## 2. 监督策略

### 关键说明：监督是针对子 Actor 的

在 Actor 上定义的监督策略规定的是**该 Actor 如何监督其子 Actor**，而不是该 Actor 自身如何被监督。

```csharp
public class ParentActor : ReceiveActor
{
    // This strategy applies to children of ParentActor, NOT to ParentActor itself
    protected override SupervisorStrategy SupervisorStrategy()
    {
        return new OneForOneStrategy(
            maxNrOfRetries: 10,
            withinTimeRange: TimeSpan.FromSeconds(30),
            decider: ex => ex switch
            {
                ArithmeticException => Directive.Resume,
                NullReferenceException => Directive.Restart,
                ArgumentException => Directive.Stop,
                _ => Directive.Escalate
            });
    }
}
```

### 默认监督策略

默认的 `OneForOneStrategy` 已包含速率限制：
- **1 秒内重启 10 次** = actor 将被永久停止
- 这可以防止无限重启循环

**你很少需要自定义策略**，除非有特定需求。

### 何时定义自定义监督策略

**合理的理由：**
- Actor 抛出的异常表明状态已发生不可恢复的损坏 -> Restart
- Actor 抛出的异常不应导致重启（预期内的失败）-> Resume
- 子 actor 的失败应影响其兄弟 actor -> 使用 `AllForOneStrategy`
- 需要与默认值不同的重试限制

**不合理的理由：**
- “只是为了保险”——默认策略已经足够安全
- 不了解 actor 的作用——应先理解它

---

## 3. 错误处理：监督机制与 Try-Catch

### 何时使用 Try-Catch（大多数情况）

**在以下情况下使用 try-catch：**
- 失败是**预期内的**（网络超时、无效输入、外部服务宕机）
- 你**确切知道**异常发生的原因
- 你可以**妥善处理**它（重试、返回错误响应、记录日志后继续）
- 重启**无济于事**（相同的错误会再次发生）

```csharp
public class RssFeedPollerActor : ReceiveActor
{
    public RssFeedPollerActor()
    {
        ReceiveAsync<PollFeed>(async msg =>
        {
            try
            {
                var feed = await _httpClient.GetStringAsync(msg.FeedUrl);
                var items = ParseFeed(feed);
                // Process items...
            }
            catch (HttpRequestException ex)
            {
                // Expected failure - log and schedule retry
                _log.Warning("Feed {Url} unavailable: {Error}", msg.FeedUrl, ex.Message);
                Context.System.Scheduler.ScheduleTellOnce(
                    TimeSpan.FromMinutes(5), Self, msg, Self);
            }
            catch (XmlException ex)
            {
                // Invalid feed format - log and mark as bad
                _log.Error("Feed {Url} has invalid format: {Error}", msg.FeedUrl, ex.Message);
                Sender.Tell(new FeedPollResult.InvalidFormat(msg.FeedUrl));
            }
        });
    }
}
```

### 何时交由监督机制处理

**在以下情况下，让异常继续传播（触发监督机制）：**
- 你**完全不知道**异常发生的原因
- Actor 的**状态可能已损坏**
- **重启可能会有帮助**（恢复全新状态、重新连接资源）
- 这是一个**编程错误**（NullReferenceException、由错误逻辑引发的 InvalidOperationException）

### 反模式：吞掉未知异常

```csharp
// BAD: Swallowing exceptions hides problems
catch (Exception ex)
{
    _log.Error(ex, "Error processing work");
    // Actor continues with potentially corrupt state
}

// GOOD: Handle known exceptions, let unknown ones propagate
catch (HttpRequestException ex)
{
    // Known, expected failure - handle gracefully
    _log.Warning("HTTP request failed: {Error}", ex.Message);
    Sender.Tell(new WorkResult.TransientFailure());
}
// Unknown exceptions propagate to supervision
```

---

## 4. Props 与 DependencyResolver

### 何时使用普通 Props

**在以下情况下使用 `Props.Create()`：**
- Actor 不需要 `IServiceProvider` 或 `IRequiredActor<T>`
- 所有依赖项都可以通过构造函数传入
- Actor 简单且自包含

```csharp
// Simple actor with no DI needs
public static Props Props(PostId postId, IPostWriteStore store)
    => Akka.Actor.Props.Create(() => new PostEngagementActor(postId, store));
```

### 何时使用 DependencyResolver

**在以下情况下使用 `resolver.Props<T>()`：**
- Actor 需要使用 `IServiceProvider` 创建作用域服务
- Actor 使用 `IRequiredActor<T>` 获取其他 Actor 的引用
- Actor 有许多已注册到 DI 容器中的依赖项

```csharp
// Registration with DI
builder.WithActors((system, registry, resolver) =>
{
    var actor = system.ActorOf(resolver.Props<OrderProcessorActor>(), "order-processor");
    registry.Register<OrderProcessorActor>(actor);
});
```

### 远程部署注意事项

**你几乎永远不需要远程部署。** 如果你不进行远程部署（而且你很可能确实不需要）：
- 使用带闭包的 `Props.Create(() => new Actor(...))` 没有问题
- “序列化问题”警告并不适用

对于大多数应用程序，应使用**集群分片**而非远程部署——它会自动处理分布式部署。

---

## 5. 工作分发模式

当你有大量后台任务（RSS 订阅源、电子邮件发送等）时，不要一次性处理所有任务——这会导致惊群问题。

**可用于解决此问题的三种模式：**
1. **数据库驱动的工作队列**——使用 `FOR UPDATE SKIP LOCKED` 实现自然的跨节点分发
2. **Akka.Streams 限流**——限制单个节点内的处理速率
3. **持久化队列（发件箱模式）**——使用数据库支持的发件箱实现可靠处理

完整代码示例请参阅 [work-distribution-patterns.md](work-distribution-patterns.md)。

---

## 6. 常见错误汇总

| 错误 | 错误原因 | 修复方法 |
|---------|----------------|-----|
| 使用 EventStream 实现跨节点发布/订阅 | EventStream 仅限本地使用 | 使用 DistributedPubSub |
| 定义监督策略来“保护”某个 Actor | 监督机制保护的是子 Actor | 理解 Actor 层级结构 |
| 捕获所有异常 | 会掩盖缺陷并破坏状态 | 仅捕获预期错误 |
| 总是使用 DependencyResolver | 增加了不必要的复杂性 | 尽可能使用普通 Props |
| 一次性处理所有后台任务 | 会导致惊群和资源耗尽 | 使用数据库队列和限流 |
| 针对预期失败抛出异常 | 会触发不必要的重启 | 返回结果类型并使用消息传递 |

---

## 7. 快速参考

### 通信模式决策树

```
Need to communicate between actors?
├── Same process only? -> EventStream is fine
├── Across cluster nodes?
│   ├── Point-to-point? -> Use ActorSelection or known IActorRef
│   └── Pub/sub? -> Use DistributedPubSub
└── Fire-and-forget to external system? -> Consider outbox pattern
```

### 错误处理决策树

```
Exception occurred in actor?
├── Expected failure (HTTP timeout, invalid input)?
│   └── Try-catch, handle gracefully, continue
├── State might be corrupt?
│   └── Let supervision restart
├── Unknown cause?
│   └── Let supervision restart
└── Programming error (null ref, bad logic)?
    └── Let supervision restart, fix the bug
```

### Props 决策树

```
Creating actor Props?
├── Actor needs IServiceProvider?
│   └── Use resolver.Props<T>()
├── Actor needs IRequiredActor<T>?
│   └── Use resolver.Props<T>()
├── Simple actor with constructor params?
│   └── Use Props.Create(() => new Actor(...))
└── Remote deployment needed?
    └── Probably not - use cluster sharding instead
```

---

## 8. 集群/本地模式抽象

对于需要同时在集群生产环境和本地/测试环境中运行的应用程序，请使用抽象模式在不同实现之间切换：

- **`AkkaExecutionMode` 枚举** - 控制使用哪些实现（LocalTest 或 Clustered）
- **`GenericChildPerEntityParent`** - 使用相同的 `IMessageExtractor` 在本地模拟分片行为
- **`IPubSubMediator`** - 对 DistributedPubSub 进行抽象，以便替换本地/集群实现

完整的实现代码请参阅 [cluster-local-abstractions.md](cluster-local-abstractions.md)。

---

## 9. Actor 日志记录

### 使用 ILoggingAdapter，而不是 ILogger<T>

在 actor 中，请使用来自 `Context.GetLogger()` 的 `ILoggingAdapter`，而不是通过 DI 注入的 `ILogger<T>`：

```csharp
public class MyActor : ReceiveActor
{
    private readonly ILoggingAdapter _log = Context.GetLogger();

    public MyActor()
    {
        Receive<MyMessage>(msg =>
        {
            _log.Info("Processing message for user {UserId}", msg.UserId);
            _log.Error(ex, "Failed to process {MessageType}", msg.GetType().Name);
        });
    }
}
```

**为什么使用 ILoggingAdapter：**
- 与 Akka 的日志管道和监督机制集成
- 从 v1.5.57 开始支持语义化/结构化日志记录
- 方法名称：`Info()`、`Debug()`、`Warning()`、`Error()`（而不是 `Log*` 变体）
- 无需 DI——直接从 actor 上下文获取

**不要将 ILogger<T> 注入 actor**——这会绕过 Akka 的日志基础设施。

### 语义化日志记录（v1.5.57+）

```csharp
// Named placeholders for better log aggregation and querying
_log.Info("Order {OrderId} processed for customer {CustomerId}", order.Id, order.CustomerId);

// Prefer named placeholders over positional
// Good: {OrderId}, {CustomerId}
// Avoid: {0}, {1}
```

---

## 10. 使用 CancellationToken 管理异步操作

当 actor 通过 `PipeTo` 启动异步操作时，如果未妥善管理，这些操作的生命周期可能会超过 actor。关键实践：

- **在 PostStop 中处理 Actor CTS** - 始终在 `PostStop()` 中取消并释放
- **每次操作使用新的 CTS** - 开始新工作前先取消上一次操作
- **在所有位置传递令牌** - EF Core 查询、HTTP 调用等
- **使用关联 CTS 实现超时** - 为外部调用设置较短的超时时间，以防止挂起
- **优雅处理** - 在 catch 块中区分超时与关闭

完整实现代码请参阅 [async-cancellation-patterns.md](async-cancellation-patterns.md)。