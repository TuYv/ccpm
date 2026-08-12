---
name: akka-net-aspire-configuration
description: Configure Akka.NET with .NET Aspire for local development and production deployments. Covers actor system setup, clustering, persistence, Akka.Management integration, and Aspire orchestration patterns.
invocable: false
---
# 使用 .NET Aspire 配置 Akka.NET

## 何时使用此技能

在以下场景中使用此技能：
- 使用 .NET Aspire 编排搭建新的 Akka.NET 项目
- 使用集群引导和发现机制配置 Akka.Cluster
- 将 Akka.Persistence 与 SQL Server 集成
- 设置 Akka.Management 以进行集群管理
- 在本地开发环境中配置多副本 Actor 系统
- 使用 Aspire 将 Akka.NET 应用程序部署到 Kubernetes

## 相关技能

- **`akka-net-management`** - 深入了解 Akka.Management、集群引导和发现提供程序（Kubernetes、Azure、Config）
- **`microsoft-extensions-configuration`** - 用于配置验证的 IValidateOptions 模式
- **`akka-net-best-practices`** - 用于构建可测试 Actor 系统的集群/本地模式抽象
- **`aspire-integration-testing`** - 使用真实基础设施测试 Aspire 应用程序

## 核心原则

1. **通过 Microsoft.Extensions.Configuration 进行配置** - 使用从 appsettings.json 绑定的强类型设置类（请参阅 `microsoft-extensions-configuration` 技能）
2. **使用 Akka.Hosting 进行 DI 集成** - 使用 Akka.Hosting 库与 ASP.NET Core 无缝集成
3. **使用 Aspire 进行编排** - 让 Aspire 管理服务依赖项、网络和环境配置
4. **健康检查** - 始终为集群、持久化和就绪状态配置健康检查
5. **关注点分离** - 将 Actor 定义、配置和 Aspire 编排置于不同层中
6. **在启动时验证配置** - 使用 `IValidateOptions<T>` 和 `.ValidateOnStart()`，在配置错误时快速失败

## 项目结构

```
YourSolution/
├── src/
│   ├── YourApp.Actors/              # Actor definitions and business logic
│   │   ├── YourActor.cs
│   │   └── YourApp.Actors.csproj
│   ├── YourApp/                     # ASP.NET Core web application
│   │   ├── Config/
│   │   │   ├── AkkaConfiguration.cs  # Akka setup extension methods
│   │   │   └── AkkaSettings.cs       # Configuration model
│   │   ├── Program.cs
│   │   ├── appsettings.json
│   │   └── YourApp.csproj
│   └── YourApp.AppHost/             # Aspire orchestration
│       ├── Program.cs
│       ├── AkkaManagementExtensions.cs
│       └── YourApp.AppHost.csproj
```

## 必需的 NuGet 包

### Actor 项目所需的包 (YourApp.Actors.csproj)
```xml
<ItemGroup>
  <PackageReference Include="Akka.Cluster.Hosting" />
  <PackageReference Include="Akka.Streams" />
</ItemGroup>
```

### Web 应用程序所需的包 (YourApp.csproj)
```xml
<ItemGroup>
  <PackageReference Include="Akka.Hosting" />
  <PackageReference Include="Akka.Cluster.Hosting" />
  <PackageReference Include="Akka.Persistence.Sql.Hosting" />
  <PackageReference Include="Akka.Management" />
  <PackageReference Include="Akka.Management.Cluster.Bootstrap" />
  <PackageReference Include="Akka.Discovery.KubernetesApi" />
  <PackageReference Include="Akka.Discovery.Azure" />
  <PackageReference Include="Akka.Discovery.Config.Hosting" />
  <PackageReference Include="Petabridge.Cmd.Host" />
  <PackageReference Include="Petabridge.Cmd.Cluster" />
</ItemGroup>
```

### 对于 AppHost (YourApp.AppHost.csproj)
```xml
<Sdk Name="Aspire.AppHost.Sdk" Version="$(AspireVersion)" />

<ItemGroup>
  <PackageReference Include="Aspire.Hosting.AppHost" />
  <PackageReference Include="Aspire.Hosting.Azure.Storage" />
  <PackageReference Include="Aspire.Hosting.SqlServer" />
</ItemGroup>
```

## 配置模型 (AkkaSettings.cs)

创建一个强类型配置类：

```csharp
using System.Net;
using System.Security.Cryptography.X509Certificates;
using Akka.Cluster.Hosting;
using Akka.Remote.Hosting;
using Petabridge.Cmd.Host;

namespace YourApp.Config;

public class AkkaSettings
{
    public string ActorSystemName { get; set; } = "YourSystem";

    public bool LogConfigOnStart { get; set; } = false;

    public RemoteOptions RemoteOptions { get; set; } = new()
    {
        PublicHostName = Dns.GetHostName(),
        HostName = "0.0.0.0",
        Port = 8081
    };

    public ClusterOptions ClusterOptions { get; set; } = new()
    {
        SeedNodes = [$"akka.tcp://YourSystem@{Dns.GetHostName()}:8081"],
        Roles = ["your-role"]
    };

    public ShardOptions ShardOptions { get; set; } = new();

    public AkkaManagementOptions? AkkaManagementOptions { get; set; }

    public PetabridgeCmdOptions PbmOptions { get; set; } = new()
    {
        Host = "0.0.0.0",
        Port = 9110
    };

    public TlsSettings? TlsSettings { get; set; }
}

public class TlsSettings
{
    public bool Enabled { get; set; } = false;
    public string? CertificatePath { get; set; }
    public string? CertificatePassword { get; set; }
    public bool ValidateCertificates { get; set; } = true;

    public X509Certificate2? LoadCertificate()
    {
        if (string.IsNullOrWhiteSpace(CertificatePath))
            return null;

        if (!File.Exists(CertificatePath))
            throw new FileNotFoundException($"Certificate file not found at: {CertificatePath}");

        return !string.IsNullOrWhiteSpace(CertificatePassword)
            ? X509CertificateLoader.LoadPkcs12FromFile(CertificatePath, CertificatePassword)
            : X509CertificateLoader.LoadCertificateFromFile(CertificatePath);
    }
}

public class AkkaManagementOptions
{
    public bool Enabled { get; set; }
    public string? Hostname { get; set; }
    public int Port { get; set; } = 8558;
    public string ServiceName { get; set; } = "your-service";
    public string PortName { get; set; } = "management";
    public int RequiredContactPointsNr { get; set; } = 1;
    public bool FilterOnFallbackPort { get; set; } = true;
    public DiscoveryMethod DiscoveryMethod { get; set; } = DiscoveryMethod.Config;
}

public enum DiscoveryMethod
{
    Config,
    Kubernetes,
    AzureTableStorage,
    AwsEcsTagBased,
    AwsEc2TagBased
}
```

## Akka 配置扩展方法 (AkkaConfiguration.cs)

```csharp
using Akka.Cluster.Hosting;
using Akka.Discovery.Azure;
using Akka.Discovery.Config.Hosting;
using Akka.Discovery.KubernetesApi;
using Akka.Hosting;
using Akka.Management;
using Akka.Management.Cluster.Bootstrap;
using Akka.Persistence.Sql.Config;
using Akka.Persistence.Sql.Hosting;
using Akka.Remote.Hosting;
using LinqToDB;

namespace YourApp.Config;

public static class AkkaConfiguration
{
    public static IServiceCollection ConfigureAkka(
        this IServiceCollection services,
        IConfiguration configuration,
        Action<AkkaConfigurationBuilder, IServiceProvider> additionalConfig)
    {
        var akkaSettings = BindAkkaSettings(services, configuration);

        var connectionString = configuration.GetConnectionString("DefaultConnection");
        if (connectionString is null)
            throw new Exception("DefaultConnection ConnectionString is missing");

        const string roleName = "your-role";

        services.AddAkka(akkaSettings.ActorSystemName, (builder, provider) =>
        {
            builder.ConfigureNetwork(provider)
                .WithAkkaClusterReadinessCheck()
                .WithActorSystemLivenessCheck()
                .WithSqlPersistence(
                    connectionString: connectionString,
                    providerName: ProviderName.SqlServer2022,
                    databaseMapping: DatabaseMapping.SqlServer,
                    tagStorageMode: TagMode.TagTable,
                    deleteCompatibilityMode: true,
                    useWriterUuidColumn: true,
                    autoInitialize: true,
                    journalBuilder: journalBuilder =>
                    {
                        journalBuilder.WithHealthCheck(name: "Akka.Persistence.Sql.Journal[default]");
                    },
                    snapshotBuilder: snapshotBuilder =>
                    {
                        snapshotBuilder.WithHealthCheck(name: "Akka.Persistence.Sql.SnapshotStore[default]");
                    });

            // Add your actors here
            // Example: builder.WithActors((system, registry) => { ... });

            additionalConfig(builder, provider);
        });

        return services;
    }

    public static AkkaSettings BindAkkaSettings(IServiceCollection services, IConfiguration configuration)
    {
        var akkaSettings = new AkkaSettings();
        configuration.GetSection(nameof(AkkaSettings)).Bind(akkaSettings);
        services.AddSingleton(akkaSettings);
        return akkaSettings;
    }

    public static AkkaConfigurationBuilder ConfigureNetwork(
        this AkkaConfigurationBuilder builder,
        IServiceProvider serviceProvider)
    {
        var settings = serviceProvider.GetRequiredService<AkkaSettings>();
        var configuration = serviceProvider.GetRequiredService<IConfiguration>();

        // Apply TLS configuration if enabled
        if (settings.TlsSettings is { Enabled: true })
        {
            ConfigureRemoteOptionsWithTls(settings);
        }

        builder.WithRemoting(settings.RemoteOptions);

        if (settings.AkkaManagementOptions is { Enabled: true })
        {
            // Clear seed nodes when using Akka.Management
            var clusterOptions = settings.ClusterOptions;
            clusterOptions.SeedNodes = [];

            builder
                .WithClustering(clusterOptions)
                .WithAkkaManagement(setup =>
                {
                    setup.Http.HostName = settings.AkkaManagementOptions.Hostname?.ToLower();
                    setup.Http.Port = settings.AkkaManagementOptions.Port;
                    setup.Http.BindHostName = "0.0.0.0";
                    setup.Http.BindPort = settings.AkkaManagementOptions.Port;
                })
                .WithClusterBootstrap(options =>
                {
                    options.ContactPointDiscovery.ServiceName = settings.AkkaManagementOptions.ServiceName;
                    options.ContactPointDiscovery.PortName = settings.AkkaManagementOptions.PortName;
                    options.ContactPointDiscovery.RequiredContactPointsNr =
                        settings.AkkaManagementOptions.RequiredContactPointsNr;
                    options.ContactPointDiscovery.ContactWithAllContactPoints = true;
                    options.ContactPointDiscovery.StableMargin = TimeSpan.FromSeconds(5);
                    options.ContactPoint.FilterOnFallbackPort =
                        settings.AkkaManagementOptions.FilterOnFallbackPort;
                }, autoStart: true);

            ConfigureDiscovery(builder, settings, configuration);
        }
        else
        {
            builder.WithClustering(settings.ClusterOptions);
        }

        return builder;
    }

    private static void ConfigureDiscovery(
        AkkaConfigurationBuilder builder,
        AkkaSettings settings,
        IConfiguration configuration)
    {
        switch (settings.AkkaManagementOptions!.DiscoveryMethod)
        {
            case DiscoveryMethod.Kubernetes:
                builder.WithKubernetesDiscovery();
                break;

            case DiscoveryMethod.AzureTableStorage:
                var connectionString = configuration.GetConnectionString("AkkaManagementAzure");
                if (connectionString is null)
                    throw new Exception("AkkaManagement table storage connection string [AkkaManagementAzure] is missing");

                builder
                    .WithAzureDiscovery(options =>
                    {
                        options.ServiceName = settings.AkkaManagementOptions.ServiceName;
                        options.ConnectionString = connectionString;
                        options.HostName = settings.RemoteOptions.PublicHostName?.ToLower() ?? "localhost";
                        options.Port = settings.AkkaManagementOptions.Port;
                    })
                    .AddHocon(AzureDiscovery.DefaultConfiguration(), HoconAddMode.Append);
                break;

            case DiscoveryMethod.Config:
                builder.WithConfigDiscovery(options =>
                {
                    options.Services.Add(new Service
                    {
                        Name = settings.AkkaManagementOptions.ServiceName,
                        Endpoints =
                        [
                            $"{settings.AkkaManagementOptions.Hostname}:{settings.AkkaManagementOptions.Port}"
                        ]
                    });
                });
                break;

            default:
                throw new ArgumentOutOfRangeException();
        }
    }

    private static void ConfigureRemoteOptionsWithTls(AkkaSettings settings)
    {
        var tlsSettings = settings.TlsSettings!;
        var remoteOptions = settings.RemoteOptions;

        var certificate = tlsSettings.LoadCertificate();
        if (certificate is null)
            throw new InvalidOperationException("TLS is enabled but no certificate could be loaded");

        remoteOptions.EnableSsl = true;
        remoteOptions.Ssl = new SslOptions
        {
            X509Certificate = certificate,
            SuppressValidation = !tlsSettings.ValidateCertificates
        };

        // Update seed nodes to use akka.ssl.tcp:// protocol
        if (settings.ClusterOptions.SeedNodes?.Length > 0)
        {
            settings.ClusterOptions.SeedNodes = settings.ClusterOptions.SeedNodes
                .Select(node => node.Replace("akka.tcp://", "akka.ssl.tcp://"))
                .ToArray();
        }
    }
}
```

## Program.cs 集成

```csharp
using YourApp.Config;
using Petabridge.Cmd.Host;
using Petabridge.Cmd.Cluster;

var builder = WebApplication.CreateBuilder(args);

// Add services
builder.Services.AddRazorPages(); // or whatever your app needs

// Configure Akka.NET
builder.Services.ConfigureAkka(builder.Configuration,
    (configurationBuilder, provider) =>
    {
        var options = provider.GetRequiredService<AkkaSettings>();

        // Add Petabridge.Cmd for cluster management
        configurationBuilder.AddPetabridgeCmd(
            options: options.PbmOptions,
            hostConfiguration: cmd =>
            {
                cmd.RegisterCommandPalette(ClusterCommands.Instance);
            });
    });

var app = builder.Build();

// Configure middleware
app.MapRazorPages();
app.Run();
```

## Aspire AppHost 配置（Program.cs）

```csharp
using System.Net.Sockets;

var builder = DistributedApplication.CreateBuilder(args);

var config = builder.Configuration.GetSection("YourApp")
    .Get<YourAppConfiguration>() ?? new YourAppConfiguration();

var saPassword = builder.AddParameter(
    "sql-sa-password",
    () => "YourStrong!Passw0rd",
    secret: true);

var sqlServer = builder.AddSqlServer("sql", saPassword);

if (config.UseVolumes)
{
    sqlServer.WithDataVolume();
}

var db = sqlServer.AddDatabase("YourDb");

var app = builder.AddProject<Projects.YourApp>("yourapp")
    .WithReplicas(config.Replicas)
    .WithReference(db, "DefaultConnection")
    .ConfigureAkkaManagementForApp(config);

builder.Build().Run();

public class YourAppConfiguration
{
    public int Replicas { get; set; } = 1;
    public bool UseVolumes { get; set; } = false;
    public bool UseAkkaManagement { get; set; } = false;
}
```

## Aspire Akka.Management 扩展（AkkaManagementExtensions.cs）

```csharp
using System.Net.Sockets;
using Aspire.Hosting.Azure;

namespace YourApp.AppHost;

public static class AkkaManagementExtensions
{
    public static IResourceBuilder<ProjectResource> ConfigureAkkaManagementForApp(
        this IResourceBuilder<ProjectResource> appBuilder,
        YourAppConfiguration config)
    {
        if (!config.UseAkkaManagement) return appBuilder;

        var builder = appBuilder.ApplicationBuilder;

        // Setup Azure Table Storage for discovery
        var azureStorage = builder.AddAzureStorage("storage")
            .RunAsEmulator();

        var tableStorage = azureStorage.AddTables("akka-discovery");

        appBuilder.WaitFor(tableStorage)
            .WithReference(tableStorage, "AkkaManagementAzure");

        // Setup network endpoint ports
        appBuilder
            .WithEndpoint(name: "remote", protocol: ProtocolType.Tcp,
                env: "AkkaSettings__RemoteOptions__Port")
            .WithEndpoint(name: "management", protocol: ProtocolType.Tcp,
                env: "AkkaSettings__AkkaManagementOptions__Port")
            .WithEndpoint(name: "pbm", protocol: ProtocolType.Tcp,
                env: "AkkaSettings__PbmOptions__Port");

        // Configure Akka.Management settings via environment variables
        appBuilder
            .WithEnvironment("AkkaSettings__RemoteOptions__PublicHostName", "localhost")
            .WithEnvironment("AkkaSettings__AkkaManagementOptions__Enabled", "true")
            .WithEnvironment("AkkaSettings__AkkaManagementOptions__Hostname", "localhost")
            .WithEnvironment("AkkaSettings__AkkaManagementOptions__DiscoveryMethod", "AzureTableStorage")
            .WithEnvironment("AkkaSettings__AkkaManagementOptions__RequiredContactPointsNr",
                config.Replicas.ToString())
            .WithEnvironment("AkkaSettings__AkkaManagementOptions__FilterOnFallbackPort", "false");

        return appBuilder;
    }
}
```

## appsettings.json 配置

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=YourDb;User Id=sa;Password=YourStrong!Passw0rd;"
  },
  "AkkaSettings": {
    "ActorSystemName": "YourSystem",
    "LogConfigOnStart": false,
    "RemoteOptions": {
      "PublicHostName": null,
      "HostName": "0.0.0.0",
      "Port": 8081
    },
    "ClusterOptions": {
      "Roles": ["your-role"],
      "SeedNodes": []
    },
    "PbmOptions": {
      "Host": "0.0.0.0",
      "Port": 9110
    }
  }
}
```

## 常用模式

### 模式 1：使用依赖注入注册 Actor

```csharp
// In your actor project
public static class ActorRegistration
{
    public static AkkaConfigurationBuilder AddYourActor(
        this AkkaConfigurationBuilder builder,
        string roleName)
    {
        builder.WithActors((system, registry, resolver) =>
        {
            var props = resolver.Props<YourActor>();
            var actor = system.ActorOf(props, "your-actor");
            registry.Register<YourActor>(actor);
        });

        return builder;
    }
}

// In AkkaConfiguration.cs
builder
    .ConfigureNetwork(provider)
    .WithSqlPersistence(...)
    .AddYourActor(roleName);  // Register your actor
```

### 模式 2：集群分片设置

```csharp
builder.WithShardRegion<YourEntityActor>(
    typeName: "your-entity",
    entityPropsFactory: (_, _, resolver) => resolver.Props<YourEntityActor>(),
    extractEntityId: ExtractEntityId,
    extractShardId: ExtractShardId,
    shardOptions: new ShardOptions
    {
        Role = "your-role",
        StateStoreMode = StateStoreMode.Persistence
    });

private static string ExtractEntityId(object message)
{
    return message switch
    {
        IEntityMessage msg => msg.EntityId,
        _ => null
    };
}

private static string ExtractShardId(object message)
{
    return message switch
    {
        IEntityMessage msg => (msg.EntityId.GetHashCode() % 10).ToString(),
        _ => null
    };
}
```

### 模式 3：健康检查

始终在 Program.cs 中配置健康检查：

```csharp
builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy("Application is running"),
        tags: new[] { "liveness" });

// Akka health checks are added automatically by:
// - .WithAkkaClusterReadinessCheck()
// - .WithActorSystemLivenessCheck()
// - journalBuilder.WithHealthCheck()
// - snapshotBuilder.WithHealthCheck()
```

## 常见问题及解决方案

### 问题 1：集群节点无法相互发现

**症状：** 节点在集群状态中始终显示为 "Unreachable"

**解决方案：**
1. 验证 `RequiredContactPointsNr` 是否与副本数量一致
2. 检查所有节点是否在 AkkaManagementOptions 中使用相同的 `ServiceName`
3. 确保 Azure Table Storage 连接字符串正确
4. 验证防火墙/网络是否允许远程端口和管理端口上的 TCP 通信

### 问题 2：持久化初始化失败

**症状：** 应用程序因 SQL 连接错误而无法启动

**解决方案：**
1. 确保 SQL Server 正在运行（检查 Aspire 仪表板）
2. 验证连接字符串配置正确
3. 在 WithSqlPersistence 中设置 `autoInitialize: true`
4. 检查数据库是否存在且可访问

### 问题 3：开发环境中的脑裂

**症状：** 形成了多个彼此独立的集群，而不是一个统一的集群

**解决方案：**
1. 在本地开发环境中使用 `FilterOnFallbackPort = false`
2. 确保所有副本都使用相同的发现配置
3. 设置 `ContactWithAllContactPoints = true`
4. 对于速度较慢的开发机器，增大 `StableMargin`

## 测试 Akka.NET Actor

有关使用 **Akka.Hosting.TestKit** 的完整 Akka.NET 测试模式，请参阅 `akka-net-testing-patterns` 技能。

该技能涵盖：
- 使用 Akka.Hosting.TestKit 和依赖注入进行现代化测试
- 用于验证 Actor 交互的 TestProbe 模式
- 测试持久化 Actor 和事件溯源
- 使用 `AkkaExecutionMode.LocalTest` 进行本地集群分片测试
- 基于场景的集成测试
- 最佳实践和反模式

### 快速示例：测试 Akka + Aspire 集成

使用 Akka.NET Actor 测试 Aspire 应用程序时，将 `aspire-integration-testing` 模式与 `akka-net-testing-patterns` 结合使用：

```csharp
// Use Aspire's DistributedApplicationTestingBuilder for infrastructure
// Use Akka.Hosting.TestKit for actor testing
public class AkkaAspireIntegrationTests : IAsyncLifetime
{
    private DistributedApplication? _app;

    public async Task InitializeAsync()
    {
        var appHost = await DistributedApplicationTestingBuilder
            .CreateAsync<Projects.YourApp_AppHost>();

        _app = await appHost.BuildAsync();
        await _app.StartAsync();
    }

    [Fact]
    public async Task ActorSystem_WithRealDatabase_ShouldPersistEvents()
    {
        // Get SQL connection string from Aspire
        var dbResource = _app!.GetResource("yourdb");
        var connectionString = await dbResource.GetConnectionStringAsync();

        // Create HttpClient to test actor endpoints
        var httpClient = _app.CreateHttpClient("yourapp");

        // Test actor behavior through HTTP API
        var response = await httpClient.PostAsJsonAsync("/orders", new
        {
            OrderId = "ORDER-001",
            Amount = 100.00m
        });

        response.Should().BeSuccessStatusCode();

        // Verify data was persisted to real database
        await using var connection = new SqlConnection(connectionString);
        await connection.OpenAsync();

        var events = await connection.QueryAsync<string>(
            "SELECT EventType FROM EventJournal WHERE PersistenceId = 'order-ORDER-001'");

        events.Should().Contain("OrderCreated");
    }

    public async Task DisposeAsync()
    {
        if (_app is not null)
            await _app.DisposeAsync();
    }
}
```

**对于单个 Actor 的单元测试**，请使用采用内存持久化的 `akka-net-testing-patterns`（无需 Aspire）。

## 最佳实践总结

1. **始终使用健康检查** - 为所有组件配置就绪检查和存活检查
2. **从配置绑定设置** - 切勿硬编码主机名、端口或连接字符串
3. **对多节点使用 Akka.Management** - 对于副本数大于 1 的集群，不要使用静态种子节点
4. **为生产环境配置 TLS** - 在生产环境中始终使用 TLS
5. **将 Actor 逻辑与配置分离** - 保持 Actor 的纯粹性，并将配置放在扩展方法中
6. **使用 Petabridge.Cmd** - 这是调试和管理集群的必备工具
7. **使用多个副本进行测试** - 始终使用 `Replicas > 1` 进行测试，以发现集群问题
8. **监控持久化运行状况** - 为日志存储和快照存储配置健康检查