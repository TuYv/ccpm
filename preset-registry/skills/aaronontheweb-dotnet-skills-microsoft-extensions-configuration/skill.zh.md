---
name: microsoft-extensions-configuration
description: Microsoft.Extensions.Options patterns including IValidateOptions, strongly-typed settings, validation on startup, and the Options pattern for clean configuration management.
invocable: false
---
# Microsoft.Extensions 配置模式

## 何时使用此技能

在以下情况下使用此技能：
- 将 appsettings.json 中的配置绑定到强类型类
- 在应用程序启动时验证配置（快速失败）
- 为设置实现复杂的验证逻辑
- 设计可测试且易于维护的配置类
- 理解 IOptions<T>、IOptionsSnapshot<T> 和 IOptionsMonitor<T>

## 参考文件

- [advanced-patterns.md](advanced-patterns.md)：带依赖项的验证器、命名选项、完整的生产环境示例（AkkaSettings），以及验证器测试

## 配置验证为何重要

**问题：** 应用程序经常因配置错误而在运行时失败，例如缺少连接字符串、URL 无效或值超出范围。这些故障发生在业务逻辑深处，远离加载配置的位置。

**解决方案：** 在启动时验证配置。如果配置无效，则立即失败并显示清晰的错误消息。

```csharp
// BAD: Fails at runtime when someone tries to use the service
public class EmailService
{
    public EmailService(IOptions<SmtpSettings> options)
    {
        var settings = options.Value;
        // Throws NullReferenceException 10 minutes into production
        _client = new SmtpClient(settings.Host, settings.Port);
    }
}

// GOOD: Fails at startup with clear error
// "SmtpSettings validation failed: Host is required"
```

---

## 模式 1：基本选项绑定

### 定义设置类

```csharp
public class SmtpSettings
{
    public const string SectionName = "Smtp";

    public string Host { get; set; } = string.Empty;
    public int Port { get; set; } = 587;
    public string? Username { get; set; }
    public string? Password { get; set; }
    public bool UseSsl { get; set; } = true;
}
```

### 从配置进行绑定

```csharp
builder.Services.AddOptions<SmtpSettings>()
    .BindConfiguration(SmtpSettings.SectionName);

// appsettings.json
{
  "Smtp": {
    "Host": "smtp.example.com",
    "Port": 587,
    "Username": "user@example.com",
    "Password": "secret",
    "UseSsl": true
  }
}
```

### 在服务中使用

```csharp
public class EmailService
{
    private readonly SmtpSettings _settings;

    // IOptions<T> - singleton, read once at startup
    public EmailService(IOptions<SmtpSettings> options)
    {
        _settings = options.Value;
    }
}
```

---

## 模式 2：数据注解验证

对于简单的验证规则，请使用数据注解：

```csharp
using System.ComponentModel.DataAnnotations;

public class SmtpSettings
{
    public const string SectionName = "Smtp";

    [Required(ErrorMessage = "SMTP host is required")]
    public string Host { get; set; } = string.Empty;

    [Range(1, 65535, ErrorMessage = "Port must be between 1 and 65535")]
    public int Port { get; set; } = 587;

    [EmailAddress(ErrorMessage = "Username must be a valid email address")]
    public string? Username { get; set; }

    public string? Password { get; set; }
    public bool UseSsl { get; set; } = true;
}
```

### 启用数据注解验证

```csharp
builder.Services.AddOptions<SmtpSettings>()
    .BindConfiguration(SmtpSettings.SectionName)
    .ValidateDataAnnotations()  // Enable attribute-based validation
    .ValidateOnStart();         // Validate immediately at startup
```

**关键点：** `.ValidateOnStart()` 至关重要。若不使用它，验证只会在首次访问选项时运行。

---

## 模式 3：使用 IValidateOptions<T> 进行复杂验证

数据注解适用于简单规则，但复杂验证需要使用 `IValidateOptions<T>`：

| 场景 | 数据注解 | IValidateOptions |
|----------|------------------|------------------|
| 必填字段 | 是 | 是 |
| 范围检查 | 是 | 是 |
| 跨属性验证 | 否 | 是 |
| 条件验证 | 否 | 是 |
| 外部服务检查 | 否 | 是 |
| 在验证器中使用依赖注入 | 否 | 是 |

### 实现 IValidateOptions

```csharp
using Microsoft.Extensions.Options;

public class SmtpSettingsValidator : IValidateOptions<SmtpSettings>
{
    public ValidateOptionsResult Validate(string? name, SmtpSettings options)
    {
        var failures = new List<string>();

        if (string.IsNullOrWhiteSpace(options.Host))
            failures.Add("Host is required");

        if (options.Port is < 1 or > 65535)
            failures.Add($"Port {options.Port} is invalid. Must be between 1 and 65535");

        // Cross-property validation
        if (!string.IsNullOrEmpty(options.Username) && string.IsNullOrEmpty(options.Password))
            failures.Add("Password is required when Username is specified");

        // Conditional validation
        if (options.UseSsl && options.Port == 25)
            failures.Add("Port 25 is typically not used with SSL. Consider port 465 or 587");

        return failures.Count > 0
            ? ValidateOptionsResult.Fail(failures)
            : ValidateOptionsResult.Success;
    }
}
```

### 注册验证器

```csharp
builder.Services.AddOptions<SmtpSettings>()
    .BindConfiguration(SmtpSettings.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.AddSingleton<IValidateOptions<SmtpSettings>, SmtpSettingsValidator>();
```

**顺序很重要：** 数据注解首先运行，随后运行 IValidateOptions 验证器。所有验证失败信息都会汇总在一起。

有关带依赖项的验证器、命名选项和完整生产示例，请参阅 [advanced-patterns.md](advanced-patterns.md)。

---

## 模式 4：选项的生命周期

| 接口 | 生命周期 | 更改时重新加载 | 使用场景 |
|-----------|----------|-------------------|----------|
| `IOptions<T>` | 单例 | 否 | 静态配置，只读取一次 |
| `IOptionsSnapshot<T>` | 作用域 | 是（每个请求） | 需要最新配置的 Web 应用 |
| `IOptionsMonitor<T>` | 单例 | 是（带回调） | 后台服务、实时更新 |

### 在后台服务中使用 IOptionsMonitor

```csharp
public class BackgroundWorker : BackgroundService
{
    private readonly IOptionsMonitor<WorkerSettings> _optionsMonitor;
    private WorkerSettings _currentSettings;

    public BackgroundWorker(IOptionsMonitor<WorkerSettings> optionsMonitor)
    {
        _optionsMonitor = optionsMonitor;
        _currentSettings = optionsMonitor.CurrentValue;

        _optionsMonitor.OnChange(settings =>
        {
            _currentSettings = settings;
        });
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await DoWorkAsync();
            await Task.Delay(_currentSettings.PollingInterval, stoppingToken);
        }
    }
}
```

---

## 模式 5：配置后处理

在绑定之后、验证之前修改选项：

```csharp
builder.Services.AddOptions<ApiSettings>()
    .BindConfiguration("Api")
    .PostConfigure(options =>
    {
        if (!string.IsNullOrEmpty(options.BaseUrl) && !options.BaseUrl.EndsWith('/'))
            options.BaseUrl += '/';

        options.Timeout ??= TimeSpan.FromSeconds(30);
    })
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

---

## 应避免的反模式

### 1. 手动访问配置

```csharp
// BAD: Bypasses validation, hard to test
public class MyService
{
    public MyService(IConfiguration configuration)
    {
        var host = configuration["Smtp:Host"]; // No validation!
    }
}

// GOOD: Strongly-typed, validated
public class MyService
{
    public MyService(IOptions<SmtpSettings> options)
    {
        var host = options.Value.Host; // Validated at startup
    }
}
```

### 2. 在构造函数中进行验证

```csharp
// BAD: Validation happens at runtime, not startup
public class MyService
{
    public MyService(IOptions<Settings> options)
    {
        if (string.IsNullOrEmpty(options.Value.Required))
            throw new ArgumentException("Required is missing"); // Too late!
    }
}

// GOOD: Validation at startup via IValidateOptions + ValidateOnStart()
```

### 3. 忘记调用 ValidateOnStart

```csharp
// BAD: Validation only runs when first accessed
builder.Services.AddOptions<Settings>()
    .ValidateDataAnnotations(); // Missing ValidateOnStart!

// GOOD: Fails immediately if invalid
builder.Services.AddOptions<Settings>()
    .ValidateDataAnnotations()
    .ValidateOnStart();
```

### 4. 在 IValidateOptions 中抛出异常

```csharp
// BAD: Throws exception, breaks validation chain
public ValidateOptionsResult Validate(string? name, Settings options)
{
    if (options.Value < 0)
        throw new ArgumentException("Value cannot be negative"); // Wrong!
    return ValidateOptionsResult.Success;
}

// GOOD: Return failure result
public ValidateOptionsResult Validate(string? name, Settings options)
{
    if (options.Value < 0)
        return ValidateOptionsResult.Fail("Value cannot be negative");
    return ValidateOptionsResult.Success;
}
```

---

## 总结

| 原则 | 实现方式 |
|-----------|----------------|
| 快速失败 | `.ValidateOnStart()` |
| 强类型 | 绑定到 POCO 类 |
| 简单验证 | 数据注解 |
| 复杂验证 | `IValidateOptions<T>` |
| 跨属性规则 | `IValidateOptions<T>` |
| 感知环境 | 注入 `IHostEnvironment` |
| 可测试 | 验证器是普通类 |