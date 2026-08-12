---
name: akka-net-testing-patterns
description: Write unit and integration tests for Akka.NET actors using modern Akka.Hosting.TestKit patterns. Covers dependency injection, TestProbes, persistence testing, and actor interaction verification. Includes guidance on when to use traditional TestKit.
invocable: false
---
# Akka.NET 测试模式

## 何时使用此技能

在以下情况下使用此技能：
- 为 Akka.NET Actor 编写单元测试
- 使用事件溯源测试持久化 Actor
- 验证 Actor 交互和消息流
- 测试 Actor 监督机制和生命周期
- 在 Actor 测试中模拟外部依赖项
- 在本地测试集群分片行为
- 验证 Actor 状态恢复和持久化

## 参考文件

- [examples.md](examples.md)：所有测试模式的完整代码示例（模式 1-8 以及注意事项）
- [anti-patterns-and-reference.md](anti-patterns-and-reference.md)：反模式、传统 TestKit、CI/CD 集成

## 选择测试方法

### 使用 Akka.Hosting.TestKit（推荐用于 95% 的用例）

**适用情况：**
- 使用 `Microsoft.Extensions.DependencyInjection` 构建现代 .NET 应用程序
- 在生产环境中使用 Akka.Hosting 配置 Actor
- 需要将服务注入 Actor（`IOptions`、`DbContext`、`ILogger`、HTTP 客户端等）
- 测试使用 ASP.NET Core、Worker Services 或 .NET Aspire 的应用程序
- 开发现代 Akka.NET 项目（Akka.NET v1.5+）

**优势：**
- 原生依赖注入支持——可在测试中使用伪实现替换服务
- 与生产环境的配置保持一致（相同的扩展方法也可用于测试）
- Actor 逻辑与基础设施清晰分离
- 使用类型安全的 Actor 注册表获取 Actor

### 使用传统 Akka.TestKit

**适用情况：**
- 参与 Akka.NET 核心库开发
- 在不使用 `Microsoft.Extensions` 的环境中工作（控制台应用程序、遗留系统）
- 遗留代码库使用手动创建 `Props` 的方式，而不使用依赖注入

有关传统 TestKit 模式，请参阅 [anti-patterns-and-reference.md](anti-patterns-and-reference.md)。

---

## 核心原则（Akka.Hosting.TestKit）

1. **继承 `Akka.Hosting.TestKit.TestKit`**——这是框架基类，而不是用户自定义的基类
2. **重写 `ConfigureServices()`**——使用伪实现或模拟对象替换真实服务
3. **重写 `ConfigureAkka()`**——使用与生产环境相同的扩展方法配置 Actor
4. **使用 `ActorRegistry`**——以类型安全的方式获取 Actor 引用
5. **组合优于继承**——将伪服务作为字段，而不是基类
6. **不要使用自定义基类**——使用方法重写，而不是继承层次结构
7. **一次测试一个 Actor**——使用 TestProbe 作为依赖项
8. **与生产模式保持一致**——使用相同的扩展方法，但采用不同的 `AkkaExecutionMode`

---

## 必需的 NuGet 包

```xml
<ItemGroup>
  <!-- Core testing framework -->
  <PackageReference Include="Akka.Hosting.TestKit" Version="*" />

  <!-- xUnit (or your preferred test framework) -->
  <PackageReference Include="xunit" Version="*" />
  <PackageReference Include="xunit.runner.visualstudio" Version="*" />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="*" />

  <!-- Assertions (recommended) -->
  <PackageReference Include="FluentAssertions" Version="*" />

  <!-- In-memory persistence for testing -->
  <PackageReference Include="Akka.Persistence.Hosting" Version="*" />

  <!-- If testing cluster sharding -->
  <PackageReference Include="Akka.Cluster.Hosting" Version="*" />
</ItemGroup>
```

---

## 关键：测试项目的文件监视器修复

Akka.Hosting.TestKit 会启动真实的 `IHost` 实例，而这些实例默认会启用文件监视器，以便在配置发生变化时重新加载配置。运行大量测试时，这会耗尽 Linux 上的文件描述符限额（inotify 监视限额）。

**将以下代码添加到测试项目中——它会在任何测试执行之前运行：**

```csharp
// TestEnvironmentInitializer.cs
using System.Runtime.CompilerServices;

namespace YourApp.Tests;

internal static class TestEnvironmentInitializer
{
    [ModuleInitializer]
    internal static void Initialize()
    {
        // Disable config file watching in test hosts
        // Prevents file descriptor exhaustion (inotify watch limit) on Linux
        Environment.SetEnvironmentVariable("DOTNET_HOSTBUILDER__RELOADCONFIGONCHANGE", "false");
    }
}
```

**这为什么很重要：**
- `[ModuleInitializer]` 会在任何测试代码执行之前自动运行
- 为所有 `IHost` 实例全局设置环境变量
- 防止运行 100 多个测试时出现难以理解的 `inotify` 错误
- 同样适用于使用 `IHost` 的 Aspire 集成测试

---

## 测试模式概览

下面对每种模式进行了简要说明。完整代码示例请参阅 [examples.md](examples.md)。

### 模式 1：基本 Actor 测试

这是基础模式。重写 `ConfigureServices()` 以注入伪对象，重写 `ConfigureAkka()` 以使用与生产环境相同的扩展方法注册 Actor。

```csharp
public class OrderActorTests : TestKit
{
    private readonly FakeOrderRepository _fakeRepository = new();

    protected override void ConfigureServices(HostBuilderContext context, IServiceCollection services)
    {
        services.AddSingleton<IOrderRepository>(_fakeRepository);
    }

    protected override void ConfigureAkka(AkkaConfigurationBuilder builder, IServiceProvider provider)
    {
        builder.WithInMemoryJournal().WithInMemorySnapshotStore();
        builder.WithActors((system, registry, resolver) =>
        {
            registry.Register<OrderActor>(system.ActorOf(resolver.Props<OrderActor>(), "order-actor"));
        });
    }

    [Fact]
    public async Task CreateOrder_Success_SavesToRepository()
    {
        var orderActor = ActorRegistry.Get<OrderActor>();
        var response = await orderActor.Ask<OrderCommandResult>(
            new CreateOrder("ORDER-123", "CUST-456", 99.99m), RemainingOrDefault);
        response.Status.Should().Be(CommandStatus.Success);
        _fakeRepository.SaveCallCount.Should().Be(1);
    }
}
```

### 模式 2：使用 TestProbe 测试 Actor 交互

在 `ActorRegistry` 中注册一个 `TestProbe`，作为依赖 Actor 的替代对象。使用 `ExpectMsgAsync<T>()` 验证消息是否已发送。

### 模式 3：自动响应的 TestProbe

当被测 Actor 使用 `Ask` 与依赖项通信时，创建一个自动响应 Actor，将消息转发给探针并同时进行回复，以避免超时。

### 模式 4：测试持久化 Actor

使用 `WithInMemoryJournal()` 和 `WithInMemorySnapshotStore()`。通过使用 `PoisonPill` 终止 Actor，然后执行查询以强制其从日志中恢复，从而测试恢复过程。

### 模式 5：复用生产环境配置

在测试中**始终复用生产环境的扩展方法**，而不是重复编写 HOCON 配置。这样可以确保测试使用与生产环境完全相同的配置。

```csharp
protected override void ConfigureAkka(AkkaConfigurationBuilder builder, IServiceProvider provider)
{
    builder
        .AddDraftSerializer()                                    // Same as production
        .AddOrderDomainActors(AkkaExecutionMode.LocalTest)      // Same, but local mode
        .WithInMemoryJournal().WithInMemorySnapshotStore();      // Test-specific overrides
}
```

### 模式 6：在本地使用集群分片

结合使用 `AkkaExecutionMode.LocalTest` 和 `GenericChildPerEntityParent`，无需实际集群即可测试分片行为。使用相同的扩展方法，但采用不同的模式。

### 模式 7：对异步操作使用 AwaitAssertAsync

当 Actor 执行异步操作时，使用 `AwaitAssertAsync`。它会反复执行断言，直到断言通过或超时，从而避免测试结果不稳定。

```csharp
await AwaitAssertAsync(() =>
{
    _fakeReadModelService.SyncCallCount.Should().BeGreaterOrEqualTo(1);
}, TimeSpan.FromSeconds(3));
```

### 模式 8：基于场景的集成测试

使用多个 Actor 和状态转换，端到端测试完整的业务工作流。注册所有领域 Actor，并验证每个步骤的状态。

---

## 常见模式总结

| 模式 | 使用场景 |
|---------|----------|
| 基础 Actor 测试 | 测试注入了服务的单个 Actor |
| TestProbe | 验证 Actor 是否向依赖项发送消息 |
| 自动响应器 | 在测试时避免 `Ask` 超时 |
| 持久化 Actor | 测试事件溯源和恢复 |
| 集群分片 | 在本地测试分片行为 |
| AwaitAssertAsync | 处理 Actor 中的异步操作 |
| 场景测试 | 端到端业务工作流 |

---

## 最佳实践

1. **每个 Actor 对应一个测试类** - 保持测试专注
2. **重写 ConfigureServices/ConfigureAkka** - 不要创建基类
3. **使用 Fake，而不是 Mock** - 更简单、更易维护
4. **一次测试一个 Actor** - 对依赖项使用 TestProbe
5. **与生产环境模式保持一致** - 使用相同的扩展方法，但采用不同的 `AkkaExecutionMode`
6. **对异步操作使用 AwaitAssertAsync** - 避免测试结果不稳定
7. **测试恢复机制** - 终止并重启 Actor，以验证持久化
8. **对工作流使用场景测试** - 端到端测试完整的业务流程
9. **保持测试快速运行** - 使用内存持久化，不使用真实数据库
10. **使用有意义的名称** - `Scenario_FirstTimePurchase_SuccessfulPayment`

---

## 调试技巧

1. **启用调试日志** - 将 `LogLevel.Debug` 传递给 TestKit 构造函数
2. **使用 ITestOutputHelper** - 在测试输出中查看 Actor 系统日志
3. **检查 TestProbe** - 检查 `probe.Messages`，了解发送了哪些内容
4. **查询 Actor 状态** - 添加状态查询消息以进行调试
5. **结合日志使用 AwaitAssertAsync** - 了解断言失败的原因
6. **检查 ActorRegistry** - 验证 Actor 是否已正确注册

```csharp
// Constructor with debug logging
public OrderActorTests(ITestOutputHelper output)
    : base(output: output, logLevel: LogLevel.Debug)
{
}
```