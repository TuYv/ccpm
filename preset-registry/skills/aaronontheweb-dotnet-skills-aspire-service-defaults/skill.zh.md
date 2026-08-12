---
name: aspire-service-defaults
description: Create a shared ServiceDefaults project for Aspire applications. Centralizes OpenTelemetry, health checks, resilience, and service discovery configuration across all services.
invocable: false
---
# Aspire 服务默认配置

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 构建基于 Aspire 的分布式应用程序
- 需要跨服务实现一致的可观测性（日志、跟踪和指标）
- 希望共享健康检查配置
- 配置 HttpClient 弹性和服务发现

---

## 什么是 ServiceDefaults？

ServiceDefaults 是一个共享项目，为 Aspire 应用程序中的所有服务提供通用配置：

- **OpenTelemetry** - 日志、跟踪和指标
- **健康检查** - 就绪和存活端点
- **服务发现** - 自动解析服务
- **HTTP 弹性** - 重试和断路器策略

每个服务都会引用此项目并调用 `AddServiceDefaults()`。

---

## 项目结构

```
src/
  MyApp.ServiceDefaults/
    Extensions.cs
    MyApp.ServiceDefaults.csproj
  MyApp.Api/
    Program.cs  # Calls AddServiceDefaults()
  MyApp.Worker/
    Program.cs  # Calls AddServiceDefaults()
  MyApp.AppHost/
    Program.cs
```

---

## ServiceDefaults 项目

### 项目文件

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <IsAspireSharedProject>true</IsAspireSharedProject>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
    <PackageReference Include="Microsoft.Extensions.Http.Resilience" />
    <PackageReference Include="Microsoft.Extensions.ServiceDiscovery" />
    <PackageReference Include="OpenTelemetry.Exporter.OpenTelemetryProtocol" />
    <PackageReference Include="OpenTelemetry.Extensions.Hosting" />
    <PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" />
    <PackageReference Include="OpenTelemetry.Instrumentation.Http" />
    <PackageReference Include="OpenTelemetry.Instrumentation.Runtime" />
  </ItemGroup>
</Project>
```

### Extensions.cs

```csharp
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using OpenTelemetry;
using OpenTelemetry.Metrics;
using OpenTelemetry.Trace;

namespace Microsoft.Extensions.Hosting;

public static class Extensions
{
    private const string HealthEndpointPath = "/health";
    private const string AlivenessEndpointPath = "/alive";

    /// <summary>
    /// Adds common Aspire services: OpenTelemetry, health checks,
    /// service discovery, and HTTP resilience.
    /// </summary>
    public static TBuilder AddServiceDefaults<TBuilder>(this TBuilder builder)
        where TBuilder : IHostApplicationBuilder
    {
        builder.ConfigureOpenTelemetry();
        builder.AddDefaultHealthChecks();

        builder.Services.AddServiceDiscovery();

        builder.Services.ConfigureHttpClientDefaults(http =>
        {
            // Resilience: retries, circuit breaker, timeouts
            http.AddStandardResilienceHandler();

            // Service discovery: resolve service names to addresses
            http.AddServiceDiscovery();
        });

        return builder;
    }

    public static TBuilder ConfigureOpenTelemetry<TBuilder>(this TBuilder builder)
        where TBuilder : IHostApplicationBuilder
    {
        // Logging
        builder.Logging.AddOpenTelemetry(logging =>
        {
            logging.IncludeFormattedMessage = true;
            logging.IncludeScopes = true;
        });

        builder.Services.AddOpenTelemetry()
            // Metrics
            .WithMetrics(metrics =>
            {
                metrics
                    .AddAspNetCoreInstrumentation()
                    .AddHttpClientInstrumentation()
                    .AddRuntimeInstrumentation();
            })
            // Tracing
            .WithTracing(tracing =>
            {
                tracing
                    .AddSource(builder.Environment.ApplicationName)
                    .AddAspNetCoreInstrumentation(options =>
                        // Exclude health checks from traces
                        options.Filter = context =>
                            !context.Request.Path.StartsWithSegments(HealthEndpointPath) &&
                            !context.Request.Path.StartsWithSegments(AlivenessEndpointPath))
                    .AddHttpClientInstrumentation();
            });

        builder.AddOpenTelemetryExporters();

        return builder;
    }

    private static TBuilder AddOpenTelemetryExporters<TBuilder>(this TBuilder builder)
        where TBuilder : IHostApplicationBuilder
    {
        // Use OTLP exporter if endpoint is configured (Aspire Dashboard, Jaeger, etc.)
        var useOtlp = !string.IsNullOrWhiteSpace(
            builder.Configuration["OTEL_EXPORTER_OTLP_ENDPOINT"]);

        if (useOtlp)
        {
            builder.Services.AddOpenTelemetry().UseOtlpExporter();
        }

        return builder;
    }

    public static TBuilder AddDefaultHealthChecks<TBuilder>(this TBuilder builder)
        where TBuilder : IHostApplicationBuilder
    {
        builder.Services.AddHealthChecks()
            .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"]);

        return builder;
    }

    /// <summary>
    /// Maps health check endpoints. Call after UseRouting().
    /// </summary>
    public static WebApplication MapDefaultEndpoints(this WebApplication app)
    {
        // Only expose in development - see security note below
        if (app.Environment.IsDevelopment())
        {
            // Readiness: all health checks must pass
            app.MapHealthChecks(HealthEndpointPath);

            // Liveness: only "live" tagged checks
            app.MapHealthChecks(AlivenessEndpointPath, new HealthCheckOptions
            {
                Predicate = r => r.Tags.Contains("live")
            });
        }

        return app;
    }
}
```

---

## 在服务中使用

### API 服务

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add all service defaults
builder.AddServiceDefaults();

// Add your services
builder.Services.AddControllers();

var app = builder.Build();

// Map health endpoints
app.MapDefaultEndpoints();

app.MapControllers();
app.Run();
```

### Worker 服务

```csharp
var builder = Host.CreateApplicationBuilder(args);

// Works for non-web hosts too
builder.AddServiceDefaults();

builder.Services.AddHostedService<MyWorker>();

var host = builder.Build();
host.Run();
```

---

## 添加自定义健康检查

```csharp
public static TBuilder AddDefaultHealthChecks<TBuilder>(this TBuilder builder)
    where TBuilder : IHostApplicationBuilder
{
    builder.Services.AddHealthChecks()
        // Basic liveness
        .AddCheck("self", () => HealthCheckResult.Healthy(), ["live"])

        // Database readiness
        .AddNpgSql(
            builder.Configuration.GetConnectionString("postgres")!,
            name: "postgres",
            tags: ["ready"])

        // Redis readiness
        .AddRedis(
            builder.Configuration.GetConnectionString("redis")!,
            name: "redis",
            tags: ["ready"])

        // Custom check
        .AddCheck<MyCustomHealthCheck>("custom", tags: ["ready"]);

    return builder;
}
```

---

## 添加自定义跟踪源

对于 Akka.NET 或自定义 ActivitySources：

```csharp
public static TBuilder ConfigureOpenTelemetry<TBuilder>(this TBuilder builder)
    where TBuilder : IHostApplicationBuilder
{
    builder.Services.AddOpenTelemetry()
        .WithTracing(tracing =>
        {
            tracing
                .AddSource(builder.Environment.ApplicationName)
                // Akka.NET tracing
                .AddSource("Akka.NET")
                // Custom sources
                .AddSource("MyApp.Orders")
                .AddSource("MyApp.Payments")
                .AddAspNetCoreInstrumentation()
                .AddHttpClientInstrumentation();
        });

    return builder;
}
```

---

## 生产环境健康检查

对于生产环境，请保护健康检查端点或使用不同的路径：

```csharp
public static WebApplication MapDefaultEndpoints(this WebApplication app)
{
    // Always map for Kubernetes probes, but consider:
    // - Using internal-only ports
    // - Adding authorization
    // - Rate limiting

    app.MapHealthChecks("/health", new HealthCheckOptions
    {
        // Only return status, not details
        ResponseWriter = (context, report) =>
        {
            context.Response.ContentType = "text/plain";
            return context.Response.WriteAsync(report.Status.ToString());
        }
    });

    app.MapHealthChecks("/alive", new HealthCheckOptions
    {
        Predicate = r => r.Tags.Contains("live"),
        ResponseWriter = (context, report) =>
        {
            context.Response.ContentType = "text/plain";
            return context.Response.WriteAsync(report.Status.ToString());
        }
    });

    return app;
}
```

---

## 与 AppHost 集成

AppHost 会自动配置 OTLP 端点：

```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

var postgres = builder.AddPostgres("postgres");
var redis = builder.AddRedis("redis");

var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(postgres)
    .WithReference(redis);

builder.Build().Run();
```

服务会自动接收 `OTEL_EXPORTER_OTLP_ENDPOINT`，并将遥测数据发送到 Aspire Dashboard。

---

## 最佳实践

| 实践 | 原因 |
|----------|--------|
| **仅使用一个 ServiceDefaults 项目** | 确保所有服务的配置一致 |
| **从跟踪中筛除健康检查** | 减少可观测性数据中的噪声 |
| **为健康检查添加标签** | 区分存活检查与就绪检查 |
| **使用 StandardResilienceHandler** | 内置重试、断路器和超时机制 |
| **添加自定义跟踪源** | 捕获特定于领域的跨度 |

---

## 资源

- **Aspire 服务默认配置**：https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/service-defaults
- **OpenTelemetry .NET**：https://opentelemetry.io/docs/languages/net/
- **健康检查**：https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks