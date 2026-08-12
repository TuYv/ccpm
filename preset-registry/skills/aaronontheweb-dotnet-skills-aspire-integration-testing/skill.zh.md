---
name: aspire-integration-testing
description: Write integration tests using .NET Aspire's testing facilities with xUnit. Covers test fixtures, distributed application setup, endpoint discovery, and patterns for testing ASP.NET Core apps with real dependencies.
invocable: false
---
# 使用 .NET Aspire + xUnit 进行集成测试

## 何时使用此技能

在以下情况下使用此技能：
- 为 .NET Aspire 应用程序编写集成测试
- 使用真实数据库连接测试 ASP.NET Core 应用
- 验证分布式应用中的服务间通信
- 使用容器中的实际基础设施（SQL Server、Redis、消息队列）进行测试
- 将 Playwright UI 测试与 Aspire 编排的服务相结合
- 使用正确的服务发现和网络配置测试微服务

## 参考文件

- [高级模式](advanced-patterns.md)：端点发现、数据库测试、Playwright、条件配置、Respawn、服务通信、消息队列
- [CI 与工具](ci-and-tooling.md)：CI/CD 集成、自定义资源等待器、结合 MCP 使用 Aspire CLI

## 核心原则

1. **真实依赖项** - 通过 Aspire 使用实际基础设施（数据库、缓存），而非模拟对象
2. **动态端口绑定** - 让 Aspire 动态分配端口（`127.0.0.1:0`），以避免冲突
3. **夹具生命周期** - 使用 `IAsyncLifetime` 正确设置和拆卸测试夹具
4. **端点发现** - 切勿硬编码 URL；应在运行时从 Aspire 发现端点
5. **并行隔离** - 使用 xUnit 集合控制测试并行化
6. **健康检查** - 运行测试前，始终等待服务进入健康状态

## 高层测试架构

```
┌─────────────────┐                    ┌──────────────────────┐
│ xUnit test file │──uses────────────►│  AspireFixture       │
└─────────────────┘                    │  (IAsyncLifetime)    │
                                       └──────────────────────┘
                                               │
                                               │ starts
                                               ▼
                                    ┌───────────────────────────┐
                                    │  DistributedApplication   │
                                    │  (from AppHost)           │
                                    └───────────────────────────┘
                                               │ exposes
                                               ▼
                                  ┌──────────────────────────────┐
                                  │   Dynamic HTTP Endpoints     │
                                  └──────────────────────────────┘
                                               │ consumed by
                                               ▼
                                   ┌─────────────────────────┐
                                   │  HttpClient / Playwright│
                                   └─────────────────────────┘
```

## 所需的 NuGet 包

```xml
<ItemGroup>
  <PackageReference Include="Aspire.Hosting.Testing" Version="$(AspireVersion)" />
  <PackageReference Include="xunit" Version="*" />
  <PackageReference Include="xunit.runner.visualstudio" Version="*" />
  <PackageReference Include="Microsoft.NET.Test.Sdk" Version="*" />
</ItemGroup>
```

## 关键：集成测试的文件监视器修复

运行大量集成测试且每个测试都会启动一个 IHost 时，默认的 .NET 主机构建器会启用文件监视器，以便在配置发生更改时重新加载配置。这会耗尽 Linux 上的文件描述符限额。

**在运行任何测试之前，将以下内容添加到测试项目中：**

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

## 模式 1：基本的 Aspire 测试固件（现代 API）

```csharp
using Aspire.Hosting;
using Aspire.Hosting.Testing;

public sealed class AspireAppFixture : IAsyncLifetime
{
    private DistributedApplication? _app;

    public DistributedApplication App => _app
        ?? throw new InvalidOperationException("App not initialized");

    public async Task InitializeAsync()
    {
        var builder = await DistributedApplicationTestingBuilder
            .CreateAsync<Projects.YourApp_AppHost>([
                "YourApp:UseVolumes=false",
                "YourApp:Environment=IntegrationTest",
                "YourApp:Replicas=1"
            ]);

        _app = await builder.BuildAsync();

        using var startupCts = new CancellationTokenSource(TimeSpan.FromMinutes(10));
        await _app.StartAsync(startupCts.Token);

        using var healthCts = new CancellationTokenSource(TimeSpan.FromMinutes(5));
        await _app.ResourceNotifications.WaitForResourceHealthyAsync("api", healthCts.Token);
    }

    public Uri GetEndpoint(string resourceName, string scheme = "https")
    {
        return _app?.GetEndpoint(resourceName, scheme)
            ?? throw new InvalidOperationException($"Endpoint for '{resourceName}' not found");
    }

    public async Task DisposeAsync()
    {
        if (_app is not null)
        {
            await _app.DisposeAsync();
        }
    }
}
```

## 模式 2：在测试中使用固件

```csharp
[CollectionDefinition("Aspire collection")]
public class AspireCollection : ICollectionFixture<AspireAppFixture> { }

[Collection("Aspire collection")]
public class IntegrationTests
{
    private readonly AspireAppFixture _fixture;

    public IntegrationTests(AspireAppFixture fixture)
    {
        _fixture = fixture;
    }

    [Fact]
    public async Task Application_ShouldStart()
    {
        var httpClient = _fixture.App.CreateHttpClient("yourapp");
        var response = await httpClient.GetAsync("/");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
```

有关端点发现、数据库测试、Playwright UI 测试、条件式资源配置、Respawn 数据库重置、服务间通信以及消息队列测试模式，请参阅 [advanced-patterns.md](advanced-patterns.md)。

## 常见模式汇总

| 模式 | 使用场景 |
|---------|----------|
| 基础夹具 | 简单的 HTTP 端点测试 |
| 端点发现 | 避免硬编码 URL |
| 数据库测试 | 验证数据访问层 |
| Playwright 集成 | 使用真实后端进行完整的 UI 测试 |
| 配置覆盖 | 测试专用设置 |
| 健康检查 | 确保服务已准备就绪 |
| 服务通信 | 测试分布式系统交互 |
| 消息队列测试 | 验证异步消息传递 |

## 棘手或不明显的技巧

| 问题 | 解决方案 |
|---------|----------|
| 测试立即超时 | 调用 `await _app.StartAsync()` 并等待服务进入健康状态 |
| 测试之间发生端口冲突 | 使用 xUnit `CollectionDefinition` 共享夹具 |
| 因时序问题导致测试不稳定 | 实现适当的健康检查轮询，而不是使用 `Task.Delay()` |
| 无法连接到 SQL Server | 通过 `GetConnectionStringAsync()` 动态获取连接字符串 |
| 并行测试相互干扰 | 使用 `[Collection]` 属性按顺序运行相关测试 |
| Aspire 仪表板发生冲突 | 同一时间只能运行一个仪表板；测试会复用同一个实例 |

## 最佳实践

1. **使用 `IAsyncLifetime`** - 确保正确执行异步初始化和清理
2. **通过集合共享夹具** - 通过复用应用实例缩短测试执行时间
3. **动态发现端点** - 切勿硬编码 localhost:5000 或类似地址
4. **等待健康检查** - 不要假定服务会立即准备就绪
5. **使用真实依赖项进行测试** - Aspire 让使用真实的 SQL、Redis 等服务变得简单
6. **清理资源** - 始终正确实现 `DisposeAsync`
7. **使用有意义的测试数据** - 使用贴近实际的测试数据填充数据库
8. **测试失败场景** - 验证错误处理和恢复能力
9. **保持测试隔离** - 每个测试都应相互独立，且不依赖执行顺序
10. **监控测试执行时间** - 如果测试速度较慢，请考虑并行化

有关 GitHub Actions 设置、自定义资源等待器以及 Aspire CLI/MCP 集成，请参阅 [ci-and-tooling.md](ci-and-tooling.md)。

---

## 调试技巧

1. **运行 Aspire 仪表板** - 测试失败时，请查看位于 `http://localhost:15888` 的仪表板
2. **将 Aspire CLI 与 MCP 配合使用** - 让 AI 助手查询真实的应用程序状态
3. **启用详细日志记录** - 设置 `ASPIRE_ALLOW_UNSECURED_TRANSPORT=true` 以获得更详细的输出
4. **检查容器日志** - 使用 `docker logs` 检查容器输出
5. **在夹具中使用断点** - 调试夹具初始化过程，以捕获启动问题
6. **验证资源名称** - 确保 AppHost 与测试中的资源名称一致