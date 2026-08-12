---
name: akka-net-management
description: Akka.Management for cluster bootstrapping, service discovery (Kubernetes, Azure, Config), health checks, and dynamic cluster formation without static seed nodes.
invocable: false
---
# Akka.NET 管理与服务发现

## 何时使用此技能

在以下情况下使用此技能：
- 将 Akka.NET 集群部署到 Kubernetes 或云环境
- 使用动态服务发现替代静态种子节点
- 配置集群引导以自动组建集群
- 为负载均衡器设置健康检查端点
- 与 Azure Table Storage、Kubernetes API 或基于配置的服务发现集成

## 参考文件

- [服务发现提供程序](discovery-providers.md)：Config、Kubernetes 和 Azure 服务发现的设置，包含完整代码和部署 YAML
- [配置参考](configuration-reference.md)：强类型配置模型类

## 概述

**Akka.Management** 提供用于集群管理的 HTTP 端点，并与 **Akka.Cluster.Bootstrap** 集成，从而使用服务发现而非静态种子节点来实现动态集群组建。

### 为什么使用 Akka.Management？

| 方式 | 优点 | 缺点 |
|----------|------|------|
| 静态种子节点 | 简单、无依赖 | 无法扩展、需要已知 IP |
| Akka.Management | 动态发现、可扩展至 N 个节点 | 配置更多、有外部依赖 |

**使用静态种子节点**的场景：开发环境、单节点部署、固定基础设施。

**使用 Akka.Management** 的场景：Kubernetes、自动扩缩容组、动态环境、生产集群。

---

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│                    Cluster Bootstrap                         │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Node 1     │    │  Node 2     │    │  Node 3     │     │
│  │             │    │             │    │             │     │
│  │ Management  │◄──►│ Management  │◄──►│ Management  │     │
│  │ HTTP :8558  │    │ HTTP :8558  │    │ HTTP :8558  │     │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘     │
│         │                  │                  │             │
│         └──────────────────┼──────────────────┘             │
│                            │                                │
│                    ┌───────▼───────┐                        │
│                    │   Discovery   │                        │
│                    │   Provider    │                        │
│                    └───────────────┘                        │
│                            │                                │
└────────────────────────────┼────────────────────────────────┘
                             │
              ┌──────────────┼──────────────┐
              │              │              │
        ┌─────▼─────┐ ┌──────▼─────┐ ┌─────▼──────┐
        │ Kubernetes│ │   Azure    │ │   Config   │
        │    API    │ │   Tables   │ │   (HOCON)  │
        └───────────┘ └────────────┘ └────────────┘
```

---

## 所需的 NuGet 包

```xml
<ItemGroup>
  <!-- Core management -->
  <PackageReference Include="Akka.Management" />
  <PackageReference Include="Akka.Management.Cluster.Bootstrap" />

  <!-- Choose ONE discovery provider -->
  <PackageReference Include="Akka.Discovery.KubernetesApi" />    <!-- For Kubernetes -->
  <PackageReference Include="Akka.Discovery.Azure" />            <!-- For Azure -->
  <PackageReference Include="Akka.Discovery.Config.Hosting" />   <!-- For static config -->
</ItemGroup>
```

---

## Akka.Hosting 配置

### 带模式选择的基本设置

```csharp
public static class AkkaConfiguration
{
    public static IServiceCollection ConfigureAkka(
        this IServiceCollection services,
        Action<AkkaConfigurationBuilder, IServiceProvider>? additionalConfig = null)
    {
        services.AddOptions<AkkaSettings>()
            .BindConfiguration("AkkaSettings")
            .ValidateDataAnnotations()
            .ValidateOnStart();

        return services.AddAkka("MySystem", (builder, sp) =>
        {
            var settings = sp.GetRequiredService<IOptions<AkkaSettings>>().Value;
            var configuration = sp.GetRequiredService<IConfiguration>();

            ConfigureNetwork(builder, settings, configuration);
            ConfigureHealthChecks(builder);

            additionalConfig?.Invoke(builder, sp);
        });
    }

    private static void ConfigureNetwork(
        AkkaConfigurationBuilder builder,
        AkkaSettings settings,
        IConfiguration configuration)
    {
        if (settings.ExecutionMode == AkkaExecutionMode.LocalTest)
            return;

        builder.WithRemoting(settings.RemoteOptions);

        if (settings.ClusterBootstrapOptions.Enabled)
            ConfigureAkkaManagement(builder, settings, configuration);
        else
            builder.WithClustering(settings.ClusterOptions);
    }
}
```

### Akka.Management 配置

```csharp
private static void ConfigureAkkaManagement(
    AkkaConfigurationBuilder builder,
    AkkaSettings settings,
    IConfiguration configuration)
{
    var mgmtOptions = settings.AkkaManagementOptions;
    var bootstrapOptions = settings.ClusterBootstrapOptions;

    // IMPORTANT: Clear seed nodes when using Akka.Management
    settings.ClusterOptions.SeedNodes = [];

    builder
        .WithClustering(settings.ClusterOptions)
        .WithAkkaManagement(setup =>
        {
            setup.Http.HostName = mgmtOptions.HostName;
            setup.Http.Port = mgmtOptions.Port;
            setup.Http.BindHostName = "0.0.0.0";
            setup.Http.BindPort = mgmtOptions.Port;
        })
        .WithClusterBootstrap(options =>
        {
            options.ContactPointDiscovery.ServiceName = bootstrapOptions.ServiceName;
            options.ContactPointDiscovery.PortName = bootstrapOptions.PortName;
            options.ContactPointDiscovery.RequiredContactPointsNr = bootstrapOptions.RequiredContactPointsNr;
            options.ContactPointDiscovery.Interval = bootstrapOptions.ContactPointProbingInterval;
            options.ContactPointDiscovery.StableMargin = bootstrapOptions.StableMargin;
            options.ContactPointDiscovery.ContactWithAllContactPoints = bootstrapOptions.ContactWithAllContactPoints;
            options.ContactPoint.FilterOnFallbackPort = bootstrapOptions.FilterOnFallbackPort;
            options.ContactPoint.ProbeInterval = bootstrapOptions.BootstrapperDiscoveryPingInterval;
        });

    // Configure the discovery provider
    ConfigureDiscovery(builder, settings, configuration);
}
```

有关 Config、Kubernetes 和 Azure 发现机制的完整设置代码，请参阅 [discovery-providers.md](discovery-providers.md)。

有关完整的强类型配置模型类，请参阅 [configuration-reference.md](configuration-reference.md)。

---

## 健康检查端点

Akka.Management 为负载均衡器和编排器提供健康检查端点：

| 端点 | 用途 | 返回 200 的条件 |
|----------|---------|------------------|
| `/alive` | 存活检查 | ActorSystem 正在运行 |
| `/ready` | 就绪检查 | 集群成员处于 Up 状态 |
| `/cluster/members` | 调试 | 返回集群成员信息 |

### ASP.NET Core 健康检查集成

```csharp
// Register Akka health checks
builder.Services.AddHealthChecks();

// In Akka configuration
builder
    .WithActorSystemLivenessCheck()     // Adds "akka-liveness" health check
    .WithAkkaClusterReadinessCheck();   // Adds "akka-cluster-readiness" health check

// Map endpoints
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("liveness")
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("readiness")
});
```

---

## 故障排查

### 集群无法形成

**症状：** 节点保持为彼此独立的单节点集群。

**检查清单：**
1. 所有节点使用相同的 `ServiceName`
2. `RequiredContactPointsNr` 与实际副本数一致
3. 发现提供程序已正确配置
4. 网络允许管理端口（8558）上的流量
5. 对于 Kubernetes：已设置 RBAC 权限

### 脑裂

**症状：** 形成了多个集群，而不是一个集群。

**解决方案：**
1. 设置 `ContactWithAllContactPoints = true`
2. 对于速度较慢的环境，增大 `StableMargin`
3. 对于 Aspire：设置 `FilterOnFallbackPort = false`（动态端口）
4. 对于 Kubernetes：设置 `FilterOnFallbackPort = true`（固定端口）

### Azure 发现问题

**症状：** 节点无法通过 Azure Tables 找到彼此。

**检查清单：**
1. 连接字符串有效
2. 存储帐户允许表操作
3. 所有节点使用相同的 `ServiceName`
4. 防火墙允许访问 Azure Storage

---

## Aspire 集成

有关 Aspire 特有模式的详细信息，请参阅 `akka-net-aspire-configuration` skill。

Aspire 快速参考：

```csharp
// In AppHost
appBuilder
    .WithEndpoint(name: "remote", protocol: ProtocolType.Tcp,
        env: "AkkaSettings__RemoteOptions__Port")
    .WithEndpoint(name: "management", protocol: ProtocolType.Tcp,
        env: "AkkaSettings__AkkaManagementOptions__Port")
    .WithEnvironment("AkkaSettings__ClusterBootstrapOptions__Enabled", "true")
    .WithEnvironment("AkkaSettings__ClusterBootstrapOptions__DiscoveryMethod", "AzureTableStorage")
    .WithEnvironment("AkkaSettings__ClusterBootstrapOptions__FilterOnFallbackPort", "false");
```

---

## 总结：何时使用何种方式

| 场景 | 发现方法 | FilterOnFallbackPort |
|----------|------------------|---------------------|
| 本地开发（单节点） | 无（使用种子节点） | 不适用 |
| Aspire 多节点 | AzureTableStorage | `false` |
| Kubernetes | Kubernetes | `true` |
| Azure VM/VMSS | AzureTableStorage | `true` |
| 固定基础设施 | Config | `true` |
| AWS ECS/EC2 | AWS 发现插件 | `true` |