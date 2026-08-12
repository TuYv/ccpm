---
name: aspire-configuration
description: Configure Aspire AppHost to emit explicit app config via environment variables; keep app code free of Aspire clients and service discovery.
invocable: false
---
# Aspire 配置

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 在基于 Aspire 的仓库中，将 AppHost 资源连接到应用程序配置
- 确保生产环境配置透明，并且可移植到 Aspire 之外
- 避免在应用程序代码中使用 Aspire 客户端/服务发现包
- 为开发/测试环境设计功能开关，而无需更改应用程序代码路径

---

## 核心原则

1. **AppHost 负责管理 Aspire 基础设施包**
   - Aspire Hosting 包只能放在 AppHost 中。
   - 应用项目不应引用 Aspire 客户端/服务发现包。

2. **仅使用显式配置**
   - AppHost 必须将资源输出转换为显式配置键（环境变量）。
   - 应用程序代码只能绑定到 `IOptions<T>` 或 `Configuration`。

3. **生产环境一致性与透明性**
   - AppHost 注入的每个值都必须能够在不使用 Aspire 的情况下，通过环境变量
     或配置文件在生产环境中表示。
   - 避免不透明的服务发现和隐式配置。

---

## 配置流

```
AppHost resource -> WithEnvironment(...) -> app config keys -> IOptions<T> in app
```

AppHost 负责将 Aspire 资源转换为显式的应用程序设置。
应用程序绝不直接使用 Aspire 客户端或服务发现。

---

## AppHost 模式（显式映射）

### 示例：数据库 + Blob 存储

```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres");
var db = postgres.AddDatabase("appdb");

var minio = builder.AddContainer("minio", "minio/minio")
    .WithArgs("server", "/data")
    .WithHttpEndpoint(targetPort: 9000, name: "http")
    .WithHttpEndpoint(targetPort: 9001, name: "console")
    .WithEnvironment("MINIO_ROOT_USER", "minioadmin")
    .WithEnvironment("MINIO_ROOT_PASSWORD", "minioadmin");

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(db, "Postgres")
    .WithEnvironment("BlobStorage__Enabled", "true")
    .WithEnvironment("BlobStorage__ServiceUrl", minio.GetEndpoint("http"))
    .WithEnvironment("BlobStorage__AccessKey", "minioadmin")
    .WithEnvironment("BlobStorage__SecretKey", "minioadmin")
    .WithEnvironment("BlobStorage__Bucket", "attachments")
    .WithEnvironment("BlobStorage__ForcePathStyle", "true");

builder.Build().Run();
```

**要点**
- `WithReference(db, "Postgres")` 会显式设置 `ConnectionStrings__Postgres`。
- 每个外部依赖项都通过显式配置键表示。
- API 项目只读取 `Configuration` 值。

---

## 应用程序代码模式（无 Aspire 客户端）

应用程序代码绑定到选项并直接初始化 SDK。它绝不依赖
Aspire 客户端包或服务发现。

```csharp
// Api/Program.cs
builder.Services
    .AddOptions<BlobStorageOptions>()
    .BindConfiguration("BlobStorage")
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSingleton<IBlobStorageService>(sp =>
{
    var options = sp.GetRequiredService<IOptions<BlobStorageOptions>>().Value;
    return new S3BlobStorageService(options); // uses explicit options only
});
```

**不要**向应用添加 Aspire 客户端包（或 `AddServiceDiscovery`）。
这些属于编排层面的关注点，应保留在 AppHost 中。

---

## 功能开关和测试覆盖

将开关保存在配置中，并通过 AppHost 和测试夹具对其进行控制。
这样可以使开发/测试环境与生产环境的配置保持一致。

```csharp
// AppHost: disable persistence in tests via config overrides
var config = builder.Configuration.GetSection("App")
    .Get<AppHostConfiguration>() ?? new AppHostConfiguration();

if (!config.UseVolumes)
{
    postgres.WithDataVolume(false);
}

api.WithEnvironment("BlobStorage__Enabled", config.EnableBlobStorage.ToString());
```

有关如何将配置覆盖传递给 `DistributedApplicationTestingBuilder` 的模式，
请参阅 `skills/aspire/integration-testing/SKILL.md`。

---

## 应做/不应做检查清单

**应做**
- 将每个 Aspire 资源输出映射到显式配置键
- 对所有基础设施设置使用带验证的 `IOptions<T>`
- 确保 AppHost 是唯一引用 Aspire 托管包的位置
- 确保 AppHost 注入的任何值都可以通过生产环境变量进行设置

**不应做**
- 在应用程序项目中引用 Aspire 客户端包或服务发现包
- 依赖无法在生产环境中复现的不透明服务发现机制
- 将配置隐藏在仅限 Aspire 使用的抽象之后

---

## 相关技能

- `skills/aspire/service-defaults/SKILL.md`
- `skills/aspire/integration-testing/SKILL.md`
- `skills/akka/aspire-configuration/SKILL.md`

---

## 资源

- Aspire AppHost 环境配置：https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/app-host
- .NET 中的配置：https://learn.microsoft.com/en-us/dotnet/core/extensions/configuration