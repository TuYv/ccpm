---
name: akka-hosting-actor-patterns
description: Patterns for building entity actors with Akka.Hosting - GenericChildPerEntityParent, message extractors, cluster sharding abstraction, akka-reminders, and ITimeProvider. Supports both local testing and clustered production modes.
invocable: false
---
# Akka.Hosting Actor 模式

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 构建表示领域对象（用户、订单、发票等）的实体 Actor
- 需要 Actor 同时适用于单元测试（无集群）和生产环境（集群分片）
- 使用 akka-reminders 设置计划任务
- 使用 Akka.Hosting 扩展方法注册 Actor
- 创建可复用的 Actor 配置模式

## 核心原则

1. **执行模式抽象** - 相同的 Actor 代码可在本地（测试）或集群（生产）环境中运行
2. **本地模式使用 GenericChildPerEntityParent** - 在没有集群开销的情况下模拟分片语义
3. **使用消息提取器进行路由** - 复用 Akka.Cluster.Sharding 的 `IMessageExtractor` 接口
4. **Akka.Hosting 扩展方法** - 可良好组合的流式配置
5. **使用 ITimeProvider 实现可测试性** - 使用 `ActorSystem.Scheduler` 而非 `DateTime.Now`

## 执行模式

定义一个枚举来控制 Actor 行为：

```csharp
/// <summary>
/// Determines how Akka.NET should be configured
/// </summary>
public enum AkkaExecutionMode
{
    /// <summary>
    /// Pure local actor system - no remoting, no clustering.
    /// Use GenericChildPerEntityParent instead of ShardRegion.
    /// Ideal for unit tests and simple scenarios.
    /// </summary>
    LocalTest,

    /// <summary>
    /// Full clustering with ShardRegion.
    /// Use for integration testing and production.
    /// </summary>
    Clustered
}
```

## GenericChildPerEntityParent

一种轻量级父 Actor，它将消息路由到子实体，无需集群即可模拟集群分片语义：

```csharp
using Akka.Actor;
using Akka.Cluster.Sharding;

/// <summary>
/// A generic "child per entity" parent actor.
/// </summary>
/// <remarks>
/// Reuses Akka.Cluster.Sharding's IMessageExtractor for consistent routing.
/// Ideal for unit tests where clustering overhead is unnecessary.
/// </remarks>
public sealed class GenericChildPerEntityParent : ReceiveActor
{
    public static Props CreateProps(
        IMessageExtractor extractor,
        Func<string, Props> propsFactory)
    {
        return Props.Create(() =>
            new GenericChildPerEntityParent(extractor, propsFactory));
    }

    private readonly IMessageExtractor _extractor;
    private readonly Func<string, Props> _propsFactory;

    public GenericChildPerEntityParent(
        IMessageExtractor extractor,
        Func<string, Props> propsFactory)
    {
        _extractor = extractor;
        _propsFactory = propsFactory;

        ReceiveAny(message =>
        {
            var entityId = _extractor.EntityId(message);
            if (entityId is null) return;

            // Get existing child or create new one
            Context.Child(entityId)
                .GetOrElse(() => Context.ActorOf(_propsFactory(entityId), entityId))
                .Forward(_extractor.EntityMessage(message));
        });
    }
}
```

## 消息提取器

创建实现 Akka.Cluster.Sharding 中 `IMessageExtractor` 的提取器：

```csharp
using Akka.Cluster.Sharding;

/// <summary>
/// Routes messages to entity actors based on a strongly-typed ID.
/// </summary>
public sealed class OrderMessageExtractor : HashCodeMessageExtractor
{
    public const int DefaultShardCount = 40;

    public OrderMessageExtractor(int maxNumberOfShards = DefaultShardCount)
        : base(maxNumberOfShards)
    {
    }

    public override string? EntityId(object message)
    {
        return message switch
        {
            IWithOrderId msg => msg.OrderId.Value.ToString(),
            _ => null
        };
    }
}

// Define an interface for messages that target a specific entity
public interface IWithOrderId
{
    OrderId OrderId { get; }
}

// Use strongly-typed IDs
public readonly record struct OrderId(Guid Value)
{
    public static OrderId New() => new(Guid.NewGuid());
    public override string ToString() => Value.ToString();
}
```

## Akka.Hosting 扩展方法

创建对执行模式进行抽象的扩展方法：

```csharp
using Akka.Cluster.Hosting;
using Akka.Cluster.Sharding;
using Akka.Hosting;

public static class OrderActorHostingExtensions
{
    /// <summary>
    /// Adds OrderActor with support for both local and clustered modes.
    /// </summary>
    public static AkkaConfigurationBuilder WithOrderActor(
        this AkkaConfigurationBuilder builder,
        AkkaExecutionMode executionMode = AkkaExecutionMode.Clustered,
        string? clusterRole = null)
    {
        if (executionMode == AkkaExecutionMode.LocalTest)
        {
            // Non-clustered mode: Use GenericChildPerEntityParent
            builder.WithActors((system, registry, resolver) =>
            {
                var parent = system.ActorOf(
                    GenericChildPerEntityParent.CreateProps(
                        new OrderMessageExtractor(),
                        entityId => resolver.Props<OrderActor>(entityId)),
                    "orders");

                registry.Register<OrderActor>(parent);
            });
        }
        else
        {
            // Clustered mode: Use ShardRegion
            builder.WithShardRegion<OrderActor>(
                "orders",
                (system, registry, resolver) =>
                    entityId => resolver.Props<OrderActor>(entityId),
                new OrderMessageExtractor(),
                new ShardOptions
                {
                    StateStoreMode = StateStoreMode.DData,
                    Role = clusterRole
                });
        }

        return builder;
    }
}
```

## 组合多个 Actor

创建一个用于注册所有领域 Actor 的便捷方法：

```csharp
public static class DomainActorHostingExtensions
{
    /// <summary>
    /// Adds all order domain actors with sharding support.
    /// </summary>
    public static AkkaConfigurationBuilder WithOrderDomainActors(
        this AkkaConfigurationBuilder builder,
        AkkaExecutionMode executionMode = AkkaExecutionMode.Clustered,
        string? clusterRole = null)
    {
        return builder
            .WithOrderActor(executionMode, clusterRole)
            .WithPaymentActor(executionMode, clusterRole)
            .WithShipmentActor(executionMode, clusterRole)
            .WithNotificationActor(); // Singleton, no sharding needed
    }
}
```

## 使用 ITimeProvider 进行调度

将 ActorSystem 的 Scheduler 注册为 `ITimeProvider`，以实现可测试的基于时间的逻辑：

```csharp
public static class SharedAkkaHostingExtensions
{
    public static IServiceCollection AddAkkaWithTimeProvider(
        this IServiceCollection services,
        Action<AkkaConfigurationBuilder, IServiceProvider> configure)
    {
        // Register ITimeProvider using the ActorSystem's Scheduler
        services.AddSingleton<ITimeProvider>(sp =>
            sp.GetRequiredService<ActorSystem>().Scheduler);

        return services.ConfigureAkka((builder, sp) =>
        {
            configure(builder, sp);
        });
    }
}

// In your actor, inject ITimeProvider
public class SubscriptionActor : ReceiveActor
{
    private readonly ITimeProvider _timeProvider;

    public SubscriptionActor(ITimeProvider timeProvider)
    {
        _timeProvider = timeProvider;

        // Use _timeProvider.GetUtcNow() instead of DateTime.UtcNow
        // This allows tests to control time
    }
}
```

## Akka.Reminders 集成

对于需要在重启后仍然保留的持久化调度任务，请使用 akka-reminders：

```csharp
using Akka.Reminders;
using Akka.Reminders.Sql;
using Akka.Reminders.Sql.Configuration;
using Akka.Reminders.Storage;

public static class ReminderHostingExtensions
{
    /// <summary>
    /// Configures akka-reminders with PostgreSQL storage.
    /// </summary>
    public static AkkaConfigurationBuilder WithPostgresReminders(
        this AkkaConfigurationBuilder builder,
        string connectionString,
        string schemaName = "reminders",
        string tableName = "scheduled_reminders",
        bool autoInitialize = true)
    {
        return builder.WithLocalReminders(reminders => reminders
            .WithResolver(sys => new GenericChildPerEntityResolver(sys))
            .WithStorage(system =>
            {
                var settings = SqlReminderStorageSettings.CreatePostgreSql(
                    connectionString,
                    schemaName,
                    tableName,
                    autoInitialize);
                return new SqlReminderStorage(settings, system);
            })
            .WithSettings(new ReminderSettings
            {
                MaxSlippage = TimeSpan.FromSeconds(30),
                MaxDeliveryAttempts = 3,
                RetryBackoffBase = TimeSpan.FromSeconds(10)
            }));
    }

    /// <summary>
    /// Configures akka-reminders with in-memory storage for testing.
    /// </summary>
    public static AkkaConfigurationBuilder WithInMemoryReminders(
        this AkkaConfigurationBuilder builder)
    {
        return builder.WithLocalReminders(reminders => reminders
            .WithResolver(sys => new GenericChildPerEntityResolver(sys))
            .WithStorage(system => new InMemoryReminderStorage())
            .WithSettings(new ReminderSettings
            {
                MaxSlippage = TimeSpan.FromSeconds(1),
                MaxDeliveryAttempts = 3,
                RetryBackoffBase = TimeSpan.FromMilliseconds(100)
            }));
    }
}
```

### Child-Per-Entity 的自定义提醒解析器

将提醒回调路由到 GenericChildPerEntityParent actor：

```csharp
using Akka.Actor;
using Akka.Hosting;
using Akka.Reminders;

/// <summary>
/// Resolves reminder targets to GenericChildPerEntityParent actors.
/// </summary>
public sealed class GenericChildPerEntityResolver : IReminderActorResolver
{
    private readonly ActorSystem _system;

    public GenericChildPerEntityResolver(ActorSystem system)
    {
        _system = system;
    }

    public IActorRef ResolveActorRef(ReminderEntry entry)
    {
        var registry = ActorRegistry.For(_system);

        return entry.Key switch
        {
            var k when k.StartsWith("order-") =>
                registry.Get<OrderActor>(),
            var k when k.StartsWith("subscription-") =>
                registry.Get<SubscriptionActor>(),
            _ => throw new InvalidOperationException(
                $"Unknown reminder key format: {entry.Key}")
        };
    }
}
```

## 单例 Actor（非分片）

对于只应有一个实例的 actor：

```csharp
public static AkkaConfigurationBuilder WithEmailSenderActor(
    this AkkaConfigurationBuilder builder)
{
    return builder.WithActors((system, registry, resolver) =>
    {
        var actor = system.ActorOf(
            resolver.Props<EmailSenderActor>(),
            "email-sender");
        registry.Register<EmailSenderActor>(actor);
    });
}
```

## 用于注册表的标记类型

当需要引用以父级身份注册的 actor 时：

```csharp
/// <summary>
/// Marker type for ActorRegistry to retrieve the order manager
/// (GenericChildPerEntityParent for OrderActors).
/// </summary>
public sealed class OrderManagerActor;

// Usage in extension method
registry.Register<OrderManagerActor>(parent);

// Usage in controller/service
public class OrderService
{
    private readonly IActorRef _orderManager;

    public OrderService(IRequiredActor<OrderManagerActor> orderManager)
    {
        _orderManager = orderManager.ActorRef;
    }

    public async Task<OrderResponse> CreateOrder(CreateOrderCommand cmd)
    {
        return await _orderManager.Ask<OrderResponse>(cmd);
    }
}
```

## Actor 中的 DI 作用域管理

**Actor 不具备自动 DI 作用域。** 与 ASP.NET 控制器（每个 HTTP 请求都会创建一个作用域）不同，actor 是长期存活的。如果需要使用作用域服务（如 `DbContext`），请注入 `IServiceProvider` 并手动创建作用域。

### 模式：每条消息一个作用域

```csharp
public sealed class OrderProcessingActor : ReceiveActor
{
    private readonly IServiceProvider _serviceProvider;
    private readonly IActorRef _notificationActor;

    public OrderProcessingActor(
        IServiceProvider serviceProvider,
        IRequiredActor<NotificationActor> notificationActor)
    {
        _serviceProvider = serviceProvider;
        _notificationActor = notificationActor.ActorRef;

        ReceiveAsync<ProcessOrder>(HandleProcessOrder);
    }

    private async Task HandleProcessOrder(ProcessOrder msg)
    {
        // Create scope for this message - disposed after processing
        using var scope = _serviceProvider.CreateScope();

        // Resolve scoped services within the scope
        var orderRepository = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
        var paymentService = scope.ServiceProvider.GetRequiredService<IPaymentService>();
        var emailComposer = scope.ServiceProvider.GetRequiredService<IOrderEmailComposer>();

        // Do work with scoped services
        var order = await orderRepository.GetByIdAsync(msg.OrderId);
        var payment = await paymentService.ProcessAsync(order);

        // DbContext changes committed when scope disposes
    }
}
```

### 为什么采用此模式

| 优势 | 说明 |
|---------|-------------|
| **每条消息使用全新的 DbContext** | 消息之间不会残留过时的实体跟踪状态 |
| **正确释放资源** | 处理完每条消息后都会释放数据库连接 |
| **隔离性** | 一条消息中的错误不会破坏另一条消息的状态 |
| **可测试性** | 可以在测试中注入模拟的 IServiceProvider |

### 单例服务——直接注入

对于无状态且线程安全的服务，可以直接注入（无需作用域）：

```csharp
public sealed class NotificationActor : ReceiveActor
{
    private readonly IEmailLinkGenerator _linkGenerator;  // Singleton - OK!
    private readonly IMjmlTemplateRenderer _renderer;     // Singleton - OK!

    public NotificationActor(
        IEmailLinkGenerator linkGenerator,
        IMjmlTemplateRenderer renderer)
    {
        _linkGenerator = linkGenerator;
        _renderer = renderer;

        Receive<SendWelcomeEmail>(Handle);
    }
}
```

### 常见错误：直接注入作用域服务

```csharp
// BAD: Scoped service injected into long-lived actor
public sealed class BadActor : ReceiveActor
{
    private readonly IOrderRepository _repo;  // Scoped! DbContext lives forever!

    public BadActor(IOrderRepository repo)  // Captured at actor creation
    {
        _repo = repo;  // This DbContext will become stale
    }
}

// GOOD: Inject IServiceProvider, create scope per message
public sealed class GoodActor : ReceiveActor
{
    private readonly IServiceProvider _sp;

    public GoodActor(IServiceProvider sp)
    {
        _sp = sp;
        ReceiveAsync<ProcessOrder>(async msg =>
        {
            using var scope = _sp.CreateScope();
            var repo = scope.ServiceProvider.GetRequiredService<IOrderRepository>();
            // Fresh DbContext for this message
        });
    }
}
```

有关 DI 生命周期和作用域管理的更多信息，请参阅 `microsoft-extensions/dependency-injection` skill。

---

## 集群分片配置

### RememberEntities：几乎始终为 False

`RememberEntities` 控制分片区域是否会记住并自动重启所有曾创建过的实体。**该值几乎始终应为 `false`。**

```csharp
builder.WithShardRegion<OrderActor>(
    "orders",
    (system, registry, resolver) => entityId => resolver.Props<OrderActor>(entityId),
    new OrderMessageExtractor(),
    new ShardOptions
    {
        StateStoreMode = StateStoreMode.DData,
        RememberEntities = false,  // DEFAULT - almost always correct
        Role = clusterRole
    });
```

**`RememberEntities = true` 会导致的问题：**

| 问题 | 说明 |
|---------|-------------|
| **内存无限增长** | 所有曾创建过的实体都会被永久记住并重启 |
| **集群启动缓慢** | 集群启动时必须重启数千乃至数百万个实体 |
| **陈旧实体复活** | 已过期的会话、已发送的邮件和旧订单都会被重新启动 |
| **无法钝化** | 空闲实体会无限期占用内存（钝化已被禁用） |

### 何时使用各项设置

| 实体类型 | RememberEntities | 原因 |
|-------------|------------------|--------|
| `UserSessionActor` | **false** | 会话会过期，并在登录时创建 |
| `DraftActor` | **false** | 草稿会被发送或丢弃，属于临时实体 |
| `EmailSenderActor` | **false** | 即发即弃操作 |
| `OrderActor` | **false** | 订单会完成，并且会不断创建新订单 |
| `ShoppingCartActor` | **false** | 购物车会过期，弃用购物车很常见 |
| `TenantActor` | *可能为 true* | 租户集合固定，并且始终需要可用 |
| `AccountActor` | *可能为 true* | 账户集合有界，并且长期存在 |

**经验法则：** 仅在以下情况下使用 `RememberEntities = true`：
1. **有界的**实体集合（已知上限）
2. 应始终可用的**长期存在的**领域实体
3. **记住实体的成本 < 延迟创建实体的成本**的实体

### 与 WithShardRegion<T> 配合使用的标记类型

使用 `WithShardRegion<T>` 时，泛型参数 `T` 用作 `ActorRegistry` 的标记类型。请使用专用标记类型（而不是 actor 类本身），以便以一致的方式访问注册表：

```csharp
/// <summary>
/// Marker type for ActorRegistry. Use this to retrieve the OrderActor shard region.
/// </summary>
public sealed class OrderActorRegion;

// Registration - use marker type as generic parameter
builder.WithShardRegion<OrderActorRegion>(
    "orders",
    (system, registry, resolver) => entityId => resolver.Props<OrderActor>(entityId),
    new OrderMessageExtractor(),
    new ShardOptions { StateStoreMode = StateStoreMode.DData });

// Retrieval - same marker type
var orderRegion = ActorRegistry.Get<OrderActorRegion>();
orderRegion.Tell(new CreateOrder(orderId, amount));
```

**为什么使用标记类型？**
- `WithShardRegion<T>` 会自动以类型 `T` 注册分片区域
- 直接使用 actor 类可能会造成混淆（注册表返回的是区域，而不是 actor）
- 标记类型能够明确表达意图，并且在 LocalTest 和 Clustered 模式下都能保持一致的工作方式

### 避免冗余的注册表调用

`WithShardRegion<T>` 会自动在 `ActorRegistry` 中注册分片区域。不要再次调用 `registry.Register<T>()`：

```csharp
// BAD - redundant registration
builder.WithShardRegion<OrderActorRegion>("orders", ...)
    .WithActors((system, registry, resolver) =>
    {
        var region = registry.Get<OrderActorRegion>();
        registry.Register<OrderActorRegion>(region);  // UNNECESSARY!
    });

// GOOD - WithShardRegion already registers
builder.WithShardRegion<OrderActorRegion>("orders", ...);
// That's it - OrderActorRegion is now in the registry
```

---

## 最佳实践

1. **始终支持两种执行模式** - 无需更改代码即可轻松进行测试
2. **使用强类型 ID** - 使用 `OrderId`，而不是 `string` 或 `Guid`
3. **基于接口的消息路由** - 使用 `IWithOrderId` 实现类型安全的提取
4. **注册父 actor，而不是子 actor** - 对于每个实体一个子 actor 的模式，在 ActorRegistry 中注册父 actor
5. **使用标记类型提高明确性** - 使用空标记类进行注册表查找
6. **组合优于继承** - 链式调用扩展方法，不要创建层级过深的继承体系
7. **使用 ITimeProvider 进行调度** - 切勿在 actor 中直接使用 `DateTime.Now`
8. **使用 akka-reminders 实现持久性** - 用于必须在重启后继续有效的计划任务
9. **RememberEntities 默认设为 false** - 仅对有界且长期存在的实体设为 true