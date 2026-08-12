---
name: dependency-injection-patterns
description: Organize DI registrations using IServiceCollection extension methods. Group related services into composable Add* methods for clean Program.cs and reusable configuration in tests.
invocable: false
---
# 依赖注入模式

## 何时使用此 Skill

在以下情况下使用此 Skill：
- 组织 ASP.NET Core 应用程序中的服务注册
- 避免 Program.cs/Startup.cs 文件因包含数百项注册而变得极其庞大
- 使服务配置能够在生产环境与测试之间复用
- 设计与 Microsoft.Extensions.DependencyInjection 集成的库

## 参考文件

- [advanced-patterns.md](advanced-patterns.md)：使用 DI 扩展进行测试、Akka.NET Actor 作用域管理，以及条件注册、工厂注册和键控注册模式

---

## 问题

如果缺乏组织，Program.cs 会变得难以管理：

```csharp
// BAD: 200+ lines of unorganized registrations
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IOrderRepository, OrderRepository>();
builder.Services.AddScoped<IProductRepository, ProductRepository>();
builder.Services.AddScoped<IUserService, UserService>();
// ... 150 more lines ...
```

问题：难以找到相关注册、缺乏清晰边界、无法在测试中复用，并且容易产生合并冲突。

---

## 解决方案：扩展方法组合

将相关注册分组到扩展方法中：

```csharp
// GOOD: Clean, composable Program.cs
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddUserServices()
    .AddOrderServices()
    .AddEmailServices()
    .AddPaymentServices()
    .AddValidators();

var app = builder.Build();
```

---

## 扩展方法模式

### 基本结构

```csharp
namespace MyApp.Users;

public static class UserServiceCollectionExtensions
{
    public static IServiceCollection AddUserServices(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IUserReadStore, UserReadStore>();
        services.AddScoped<IUserWriteStore, UserWriteStore>();
        services.AddScoped<IUserService, UserService>();
        services.AddScoped<IUserValidationService, UserValidationService>();

        return services;
    }
}
```

### 使用配置

```csharp
namespace MyApp.Email;

public static class EmailServiceCollectionExtensions
{
    public static IServiceCollection AddEmailServices(
        this IServiceCollection services,
        string configSectionName = "EmailSettings")
    {
        services.AddOptions<EmailOptions>()
            .BindConfiguration(configSectionName)
            .ValidateDataAnnotations()
            .ValidateOnStart();

        services.AddSingleton<IMjmlTemplateRenderer, MjmlTemplateRenderer>();
        services.AddSingleton<IEmailLinkGenerator, EmailLinkGenerator>();
        services.AddScoped<IUserEmailComposer, UserEmailComposer>();
        services.AddScoped<IEmailSender, SmtpEmailSender>();

        return services;
    }
}
```

---

## 文件组织

将扩展方法放在其所注册服务的附近：

```
src/
  MyApp.Api/
    Program.cs                    # Composes all Add* methods
  MyApp.Users/
    Services/
      UserService.cs
    UserServiceCollectionExtensions.cs   # AddUserServices()
  MyApp.Orders/
    OrderServiceCollectionExtensions.cs  # AddOrderServices()
  MyApp.Email/
    EmailServiceCollectionExtensions.cs  # AddEmailServices()
```

**约定**：将 `{Feature}ServiceCollectionExtensions.cs` 放在该功能的服务旁边。

---

## 命名约定

| 模式 | 用途 |
|---------|---------|
| `Add{Feature}Services()` | 常规功能注册 |
| `Add{Feature}()` | 含义明确时使用的简短形式 |
| `Configure{Feature}()` | 主要用于设置选项时 |
| `Use{Feature}()` | 中间件（用于 IApplicationBuilder） |

---

## 测试优势

`Add*` 模式允许你在测试中**复用生产环境配置**，并且只覆盖不同的部分。它适用于 WebApplicationFactory、Akka.Hosting.TestKit 和独立的 ServiceCollection。

完整的测试示例请参阅 [advanced-patterns.md](advanced-patterns.md)。

---

## 分层扩展

对于较大型的应用程序，可以按层级组合扩展：

```csharp
public static class AppServiceCollectionExtensions
{
    public static IServiceCollection AddAppServices(this IServiceCollection services)
    {
        return services
            .AddDomainServices()
            .AddInfrastructureServices()
            .AddApiServices();
    }
}

public static class DomainServiceCollectionExtensions
{
    public static IServiceCollection AddDomainServices(this IServiceCollection services)
    {
        return services
            .AddUserServices()
            .AddOrderServices()
            .AddProductServices();
    }
}
```

---

## Akka.Hosting 集成

同一模式也适用于 Akka.NET Actor 配置：

```csharp
public static class OrderActorExtensions
{
    public static AkkaConfigurationBuilder AddOrderActors(
        this AkkaConfigurationBuilder builder)
    {
        return builder
            .WithActors((system, registry, resolver) =>
            {
                var orderProps = resolver.Props<OrderActor>();
                var orderRef = system.ActorOf(orderProps, "orders");
                registry.Register<OrderActor>(orderRef);
            });
    }
}

// Usage in Program.cs
builder.Services.AddAkka("MySystem", (builder, sp) =>
{
    builder
        .AddOrderActors()
        .AddInventoryActors()
        .AddNotificationActors();
});
```

完整的 Akka.Hosting 模式请参阅 `akka-hosting-actor-patterns` skill。

---

## 反模式

### 不要：在 Program.cs 中注册所有内容

```csharp
// BAD: Massive Program.cs with 200+ lines of registrations
```

### 不要：创建过于通用的扩展

```csharp
// BAD: Too vague, doesn't communicate what's registered
public static IServiceCollection AddServices(this IServiceCollection services) { ... }
```

### 不要：隐藏重要配置

```csharp
// BAD: Buried settings
public static IServiceCollection AddDatabase(this IServiceCollection services)
{
    services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer("hardcoded-connection-string"));  // Hidden!
}

// GOOD: Accept configuration explicitly
public static IServiceCollection AddDatabase(
    this IServiceCollection services,
    string connectionString)
{
    services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(connectionString));
}
```

---

## 最佳实践总结

| 实践 | 收益 |
|----------|---------|
| 将相关服务归组到 `Add*` 方法中 | 保持 Program.cs 简洁，边界清晰 |
| 将扩展放在其注册的服务附近 | 易于查找和维护 |
| 返回 `IServiceCollection` 以支持链式调用 | 流畅的 API |
| 接受配置参数 | 灵活性 |
| 使用一致的命名方式（`Add{Feature}Services`） | 易于发现 |
| 通过复用生产环境扩展进行测试 | 提升信心，减少重复 |

---

## 生命周期管理

| 生命周期 | 适用场景 | 示例 |
|----------|----------|----------|
| **单例** | 无状态、线程安全、创建成本高 | 配置、HttpClient 工厂、缓存 |
| **作用域** | 每个请求具有独立状态、数据库上下文 | DbContext、存储库、用户上下文 |
| **瞬时** | 轻量、有状态、创建成本低 | 验证器、短生命周期辅助程序 |

```csharp
// SINGLETON: Stateless services, shared safely
services.AddSingleton<IMjmlTemplateRenderer, MjmlTemplateRenderer>();

// SCOPED: Database access, per-request state
services.AddScoped<IUserRepository, UserRepository>();

// TRANSIENT: Cheap, short-lived
services.AddTransient<CreateUserRequestValidator>();
```

**作用域服务需要作用域。** ASP.NET Core 会为每个 HTTP 请求创建一个作用域。在后台服务和 Actor 中，需要手动创建作用域。

有关 Actor 作用域管理模式，请参阅 [advanced-patterns.md](advanced-patterns.md)。

---

## 常见错误

### 将作用域服务注入单例服务

```csharp
// BAD: Singleton captures scoped service - stale DbContext!
public class CacheService  // Registered as Singleton
{
    private readonly IUserRepository _repo;  // Scoped - captured at startup!
}

// GOOD: Inject IServiceProvider, create scope per operation
public class CacheService
{
    private readonly IServiceProvider _serviceProvider;

    public async Task<User> GetUserAsync(string id)
    {
        using var scope = _serviceProvider.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        return await repo.GetByIdAsync(id);
    }
}
```

### 后台工作中没有作用域

```csharp
// BAD: No scope for scoped services
public class BadBackgroundService : BackgroundService
{
    private readonly IOrderService _orderService;  // Scoped - will throw!
}

// GOOD: Create scope for each unit of work
public class GoodBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var scope = _scopeFactory.CreateScope();
        var orderService = scope.ServiceProvider.GetRequiredService<IOrderService>();
        // ...
    }
}
```

---

## 资源

- **Microsoft.Extensions.DependencyInjection**：https://learn.microsoft.com/en-us/dotnet/core/extensions/dependency-injection
- **Akka.Hosting**：https://github.com/akkadotnet/Akka.Hosting
- **Akka.DependencyInjection**：https://getakka.net/articles/actors/dependency-injection.html
- **选项模式**：请参阅 `microsoft-extensions-configuration` 技能