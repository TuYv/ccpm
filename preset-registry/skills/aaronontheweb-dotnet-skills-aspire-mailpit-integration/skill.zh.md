---
name: mailpit-integration
description: Test email sending locally using Mailpit with .NET Aspire. Captures all outgoing emails without sending them. View rendered HTML, inspect headers, and verify delivery in integration tests.
invocable: false
---
# 使用 Mailpit 和 .NET Aspire 测试电子邮件

## 何时使用此技能

在以下情况下使用此技能：
- 在不发送真实电子邮件的情况下测试本地电子邮件投递
- 在 .NET Aspire 中设置电子邮件基础设施
- 编写用于验证电子邮件是否已发送的集成测试
- 调试电子邮件渲染和邮件头

**相关技能：**
- `aspnetcore/mjml-email-templates` - MJML 模板编写
- `testing/verify-email-snapshots` - 对渲染后的 HTML 进行快照测试
- `aspire/integration-testing` - 通用 Aspire 测试模式

---

## 什么是 Mailpit？

[Mailpit](https://github.com/axllent/mailpit) 是一款轻量级电子邮件测试工具，它可以：
- 捕获所有 SMTP 流量，而不实际投递电子邮件
- 提供用于查看所捕获电子邮件的 Web UI
- 提供用于程序化访问的 API
- 支持 HTML 渲染、邮件头和附件

非常适合开发和集成测试。

---

## Aspire AppHost 配置

在 AppHost 中将 Mailpit 添加为容器：

```csharp
// AppHost/Program.cs
var builder = DistributedApplication.CreateBuilder(args);

// Add Mailpit for email testing
var mailpit = builder.AddContainer("mailpit", "axllent/mailpit")
    .WithHttpEndpoint(port: 8025, targetPort: 8025, name: "ui")
    .WithEndpoint(port: 1025, targetPort: 1025, name: "smtp");

// Reference in your API project
var api = builder.AddProject<Projects.MyApp_Api>("api")
    .WithReference(mailpit.GetEndpoint("smtp"))
    .WithEnvironment("Smtp__Host", mailpit.GetEndpoint("smtp"));

builder.Build().Run();
```

---

## SMTP 配置

### appsettings.json

```json
{
  "Smtp": {
    "Host": "localhost",
    "Port": 1025,
    "EnableSsl": false,
    "FromAddress": "noreply@myapp.com",
    "FromName": "MyApp"
  }
}
```

### 配置类

```csharp
public class SmtpSettings
{
    public string Host { get; set; } = "localhost";
    public int Port { get; set; } = 1025;
    public bool EnableSsl { get; set; } = false;
    public string FromAddress { get; set; } = "noreply@myapp.com";
    public string FromName { get; set; } = "MyApp";

    // Optional: For production SMTP
    public string? Username { get; set; }
    public string? Password { get; set; }
}
```

### 服务注册

```csharp
// In Program.cs or extension method
services.Configure<SmtpSettings>(configuration.GetSection("Smtp"));

services.AddSingleton<IEmailSender>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<SmtpSettings>>().Value;
    return new SmtpEmailSender(settings);
});
```

---

## 电子邮件发送器实现

```csharp
public interface IEmailSender
{
    Task SendEmailAsync(EmailMessage message, CancellationToken ct = default);
}

public sealed class SmtpEmailSender : IEmailSender
{
    private readonly SmtpSettings _settings;

    public SmtpEmailSender(SmtpSettings settings)
    {
        _settings = settings;
    }

    public async Task SendEmailAsync(EmailMessage message, CancellationToken ct = default)
    {
        using var client = new SmtpClient();

        await client.ConnectAsync(
            _settings.Host,
            _settings.Port,
            _settings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None,
            ct);

        if (!string.IsNullOrEmpty(_settings.Username))
        {
            await client.AuthenticateAsync(_settings.Username, _settings.Password, ct);
        }

        var mailMessage = new MimeMessage();
        mailMessage.From.Add(new MailboxAddress(_settings.FromName, _settings.FromAddress));
        mailMessage.To.Add(new MailboxAddress(message.ToName, message.To));
        mailMessage.Subject = message.Subject;

        var bodyBuilder = new BodyBuilder { HtmlBody = message.HtmlBody };
        mailMessage.Body = bodyBuilder.ToMessageBody();

        await client.SendAsync(mailMessage, ct);
        await client.DisconnectAsync(true, ct);
    }
}
```

需要 `MailKit` 包：

```bash
dotnet add package MailKit
```

---

## 查看捕获的电子邮件

### Web UI

访问 `http://localhost:8025` 可查看：

- **收件箱** - 所有捕获的电子邮件
- **HTML 视图** - 渲染后的电子邮件
- **源代码视图** - 原始 HTML/MJML 输出
- **邮件头** - 完整的电子邮件头
- **附件** - 所有附件文件

### Aspire 仪表板

Mailpit UI 端点会显示在 Aspire 仪表板的 Resources 下。

---

## 集成测试

### 使用 Aspire 的测试夹具

```csharp
public class EmailIntegrationTests : IClassFixture<AspireFixture>
{
    private readonly HttpClient _client;
    private readonly MailpitClient _mailpit;

    public EmailIntegrationTests(AspireFixture fixture)
    {
        _client = fixture.CreateClient();
        _mailpit = new MailpitClient(fixture.GetMailpitUrl());
    }

    [Fact]
    public async Task SignupFlow_SendsWelcomeEmail()
    {
        // Arrange
        await _mailpit.ClearMessagesAsync();

        // Act - Trigger signup flow
        var response = await _client.PostAsJsonAsync("/api/auth/signup", new
        {
            Email = "test@example.com",
            Password = "SecurePassword123!"
        });
        response.EnsureSuccessStatusCode();

        // Assert - Verify email was sent
        var messages = await _mailpit.GetMessagesAsync();

        var welcomeEmail = messages.Should().ContainSingle()
            .Which;

        welcomeEmail.To.Should().Contain("test@example.com");
        welcomeEmail.Subject.Should().Contain("Welcome");
        welcomeEmail.HtmlBody.Should().Contain("Thank you for signing up");
    }
}
```

### Mailpit API 客户端

```csharp
public class MailpitClient
{
    private readonly HttpClient _client;

    public MailpitClient(string baseUrl)
    {
        _client = new HttpClient { BaseAddress = new Uri(baseUrl) };
    }

    public async Task<List<MailpitMessage>> GetMessagesAsync()
    {
        var response = await _client.GetFromJsonAsync<MailpitResponse>("/api/v1/messages");
        return response?.Messages ?? new List<MailpitMessage>();
    }

    public async Task ClearMessagesAsync()
    {
        await _client.DeleteAsync("/api/v1/messages");
    }

    public async Task<MailpitMessage?> WaitForMessageAsync(
        Func<MailpitMessage, bool> predicate,
        TimeSpan timeout)
    {
        var deadline = DateTime.UtcNow + timeout;

        while (DateTime.UtcNow < deadline)
        {
            var messages = await GetMessagesAsync();
            var match = messages.FirstOrDefault(predicate);

            if (match != null)
                return match;

            await Task.Delay(100);
        }

        return null;
    }
}

public class MailpitResponse
{
    public List<MailpitMessage> Messages { get; set; } = new();
}

public class MailpitMessage
{
    public string Id { get; set; } = "";
    public List<string> To { get; set; } = new();
    public string Subject { get; set; } = "";
    public string HtmlBody { get; set; } = "";
}
```

---

## Aspire 测试夹具

```csharp
public class AspireFixture : IAsyncLifetime
{
    private DistributedApplication? _app;
    private string _mailpitUrl = "";

    public async Task InitializeAsync()
    {
        var appHost = await DistributedApplicationTestingBuilder
            .CreateAsync<Projects.MyApp_AppHost>();

        // Disable persistence for clean tests
        appHost.Configuration["MyApp:UseVolumes"] = "false";

        _app = await appHost.BuildAsync();
        await _app.StartAsync();

        // Get Mailpit URL from Aspire
        var mailpit = _app.GetContainerResource("mailpit");
        _mailpitUrl = await mailpit.GetEndpointAsync("ui");
    }

    public HttpClient CreateClient()
    {
        var api = _app!.GetProjectResource("api");
        return api.CreateHttpClient();
    }

    public string GetMailpitUrl() => _mailpitUrl;

    public async Task DisposeAsync()
    {
        if (_app != null)
            await _app.DisposeAsync();
    }
}
```

---

## 常见测试模式

### 等待异步邮件

有些邮件是异步发送的。请等待它们：

```csharp
[Fact]
public async Task AsyncWorkflow_EventuallySendsEmail()
{
    await _mailpit.ClearMessagesAsync();

    // Trigger async workflow
    await _client.PostAsync("/api/workflows/start", null);

    // Wait for email (with timeout)
    var email = await _mailpit.WaitForMessageAsync(
        m => m.Subject.Contains("Workflow Complete"),
        timeout: TimeSpan.FromSeconds(10));

    email.Should().NotBeNull();
}
```

### 验证多封邮件

```csharp
[Fact]
public async Task BulkOperation_SendsMultipleEmails()
{
    await _mailpit.ClearMessagesAsync();

    await _client.PostAsJsonAsync("/api/invitations/bulk", new
    {
        Emails = new[] { "a@test.com", "b@test.com", "c@test.com" }
    });

    var messages = await _mailpit.WaitForMessagesAsync(
        expectedCount: 3,
        timeout: TimeSpan.FromSeconds(10));

    messages.Should().HaveCount(3);
    messages.Select(m => m.To.First())
        .Should().BeEquivalentTo("a@test.com", "b@test.com", "c@test.com");
}
```

### 验证邮件内容

```csharp
[Fact]
public async Task PasswordReset_ContainsValidResetLink()
{
    await _mailpit.ClearMessagesAsync();

    await _client.PostAsJsonAsync("/api/auth/forgot-password", new
    {
        Email = "user@test.com"
    });

    var email = await _mailpit.WaitForMessageAsync(
        m => m.Subject.Contains("Password Reset"),
        timeout: TimeSpan.FromSeconds(5));

    // Extract reset link from HTML
    var resetLink = Regex.Match(email!.HtmlBody, @"href=""([^""]+/reset/[^""]+)""")
        .Groups[1].Value;

    resetLink.Should().StartWith("https://myapp.com/reset/");

    // Verify the link works
    var resetResponse = await _client.GetAsync(resetLink);
    resetResponse.StatusCode.Should().Be(HttpStatusCode.OK);
}
```

---

## 生产环境与开发环境

```csharp
services.AddSingleton<IEmailSender>(sp =>
{
    var settings = sp.GetRequiredService<IOptions<SmtpSettings>>().Value;
    var env = sp.GetRequiredService<IHostEnvironment>();

    if (env.IsDevelopment())
    {
        // Mailpit - no auth, no SSL
        return new SmtpEmailSender(settings);
    }
    else
    {
        // Production SMTP (SendGrid, Postmark, etc.)
        return new SmtpEmailSender(settings with
        {
            EnableSsl = true
        });
    }
});
```

---

## 故障排查

### 未显示电子邮件

1. 检查 Aspire 仪表板中的 Mailpit 容器是否正在运行
2. 验证 SMTP 主机/端口配置
3. 检查应用程序日志中是否存在异常

### 连接被拒绝

```bash
# Verify Mailpit is listening
curl http://localhost:8025/api/v1/messages
```

### 无法解析 Aspire 端点

```csharp
// Ensure endpoint reference is correct
.WithEnvironment("Smtp__Host", mailpit.GetEndpoint("smtp").Property(EndpointProperty.Host))
.WithEnvironment("Smtp__Port", mailpit.GetEndpoint("smtp").Property(EndpointProperty.Port))
```

---

## 资源

- **Mailpit**: https://github.com/axllent/mailpit
- **Mailpit API**: https://mailpit.axllent.org/docs/api-v1/
- **MailKit**: https://github.com/jstedfast/MailKit
- **Aspire 容器**: https://learn.microsoft.com/en-us/dotnet/aspire/fundamentals/container-resources