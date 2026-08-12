---
name: verify-email-snapshots
description: Snapshot test email templates using Verify to catch regressions. Validates rendered HTML output matches approved baseline. Works with MJML templates and any email renderer.
invocable: false
---
# 使用 Verify 对电子邮件模板进行快照测试

## 何时使用此技能

在以下场景中使用此技能：
- 测试电子邮件模板渲染是否出现回归
- 验证 MJML 模板是否编译为预期的 HTML
- 在代码审查中检查电子邮件相关变更（差异以可视化方式呈现）
- 确保变量替换正常工作

**相关技能：**
- `aspnetcore/mjml-email-templates` - MJML 模板编写
- `aspire/mailpit-integration` - 在本地测试电子邮件投递
- `testing/snapshot-testing` - 通用 Verify 模式

---

## 为什么要对电子邮件进行快照测试？

电子邮件模板具有以下特点：
1. **可视化** - 微小的变更就可能破坏其在不同客户端中的渲染效果
2. **难以进行单元测试** - 输出是复杂的 HTML，而不是简单值
3. **容易出现回归** - 模板变更可能会产生意外影响

快照测试会捕获渲染后的 HTML，并在其发生意外变化时使测试失败。

---

## 安装

```bash
dotnet add package Verify.Xunit  # or Verify.NUnit, Verify.MSTest
```

---

## 基本的电子邮件快照测试

```csharp
[Fact]
public async Task UserSignupInvitation_RendersCorrectly()
{
    // Arrange
    var renderer = _services.GetRequiredService<IMjmlTemplateRenderer>();

    var variables = new Dictionary<string, string>
    {
        { "PreviewText", "You've been invited to join Acme Corp" },
        { "OrganizationName", "Acme Corporation" },
        { "InviteeName", "John Doe" },
        { "InviterName", "Jane Admin" },
        { "InvitationLink", "https://example.com/invite/abc123" },
        { "ExpirationDate", "December 31, 2025" }
    };

    // Act
    var html = await renderer.RenderTemplateAsync(
        "UserInvitations/UserSignupInvitation",
        variables);

    // Assert
    await Verify(html, extension: "html");
}
```

首次运行时，这会创建 `UserSignupInvitation_RendersCorrectly.verified.html`。

---

## 审查电子邮件变更

模板发生变更时，测试会失败并显示差异。审查方式包括：

### 1. 可视化差异工具

```bash
# Configure diff tool (one-time)
dotnet tool install -g verify.tool
verify accept  # Accept all pending changes
verify review  # Open diff tool
```

### 2. 浏览器预览

在浏览器中打开 `.received.html` 文件以查看实际渲染效果。

### 3. IDE 集成

大多数 IDE 都可以显示 `.verified.html` 与 `.received.html` 文件之间的内联差异。

---

## 测试每种模板变体

为每个电子邮件模板创建测试，以捕获回归：

```csharp
public class EmailTemplateSnapshotTests : IClassFixture<EmailTestFixture>
{
    private readonly IMjmlTemplateRenderer _renderer;

    public EmailTemplateSnapshotTests(EmailTestFixture fixture)
    {
        _renderer = fixture.Services.GetRequiredService<IMjmlTemplateRenderer>();
    }

    [Fact]
    public async Task WelcomeEmail_NewUser() =>
        await VerifyTemplate("Welcome/NewUser", new Dictionary<string, string>
        {
            { "UserName", "John Doe" },
            { "LoginUrl", "https://example.com/login" }
        });

    [Fact]
    public async Task WelcomeEmail_InvitedUser() =>
        await VerifyTemplate("Welcome/InvitedUser", new Dictionary<string, string>
        {
            { "UserName", "John Doe" },
            { "InviterName", "Jane Admin" },
            { "OrganizationName", "Acme Corp" }
        });

    [Fact]
    public async Task PasswordReset() =>
        await VerifyTemplate("PasswordReset/PasswordReset", new Dictionary<string, string>
        {
            { "UserName", "John Doe" },
            { "ResetLink", "https://example.com/reset/abc123" },
            { "ExpirationMinutes", "30" }
        });

    [Fact]
    public async Task PaymentReceipt() =>
        await VerifyTemplate("Billing/PaymentReceipt", new Dictionary<string, string>
        {
            { "UserName", "John Doe" },
            { "Amount", "$10.00" },
            { "InvoiceNumber", "INV-2025-001" },
            { "Date", "January 15, 2025" }
        });

    private async Task VerifyTemplate(
        string templateName,
        Dictionary<string, string> variables)
    {
        var html = await _renderer.RenderTemplateAsync(templateName, variables);
        await Verify(html, extension: "html")
            .UseMethodName(templateName.Replace("/", "_"));
    }
}
```

---

## 清理动态值

某些值会在不同的测试运行之间发生变化。请将其清理：

```csharp
[Fact]
public async Task EmailWithTimestamp_ScrubsDynamicValues()
{
    var html = await _renderer.RenderTemplateAsync("Welcome", variables);

    await Verify(html, extension: "html")
        .ScrubLinesContaining("Generated at:")
        .ScrubInlineGuids();  // Scrubs GUIDs in URLs
}
```

### 常用清理器

```csharp
// Scrub dates
.ScrubLinesContaining("Date:")
.AddScrubber(s => Regex.Replace(s, @"\d{4}-\d{2}-\d{2}", "SCRUBBED-DATE"))

// Scrub URLs with tokens
.AddScrubber(s => Regex.Replace(s, @"token=[a-zA-Z0-9]+", "token=SCRUBBED"))

// Scrub GUIDs
.ScrubInlineGuids()
```

---

## 电子邮件测试的测试夹具

```csharp
public class EmailTestFixture : IAsyncLifetime
{
    public IServiceProvider Services { get; private set; } = null!;

    public async Task InitializeAsync()
    {
        var services = new ServiceCollection();

        services.AddSingleton<IConfiguration>(new ConfigurationBuilder()
            .AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["SiteUrl"] = "https://example.com"
            })
            .Build());

        services.AddSingleton<IMjmlTemplateRenderer, MjmlTemplateRenderer>();

        Services = services.BuildServiceProvider();

        await Task.CompletedTask;
    }

    public Task DisposeAsync() => Task.CompletedTask;
}
```

---

## Composer 快照测试

测试完整的 Composer 输出，包括主题和元数据：

```csharp
[Fact]
public async Task SignupInvitation_ComposesCorrectEmail()
{
    var composer = _services.GetRequiredService<IUserEmailComposer>();

    var email = await composer.ComposeSignupInvitationAsync(
        recipientEmail: new EmailAddress("john@example.com"),
        recipientName: new PersonName("John Doe"),
        inviterName: new PersonName("Jane Admin"),
        organizationName: new OrganizationName("Acme Corp"),
        invitationUrl: new AbsoluteUri("https://example.com/invite/abc123"),
        expiresAt: new DateTimeOffset(2025, 12, 31, 0, 0, 0, TimeSpan.Zero));

    // Verify the full email object (subject, to, body)
    await Verify(new
    {
        email.To,
        email.Subject,
        HtmlBody = email.HtmlBody  // Will be stored as .html extension
    });
}
```

---

## CI 集成

### 缺少基准文件时失败

在 CI 中，如果不存在 `.verified.html` 文件则失败（防止意外接受）：

```csharp
// In test setup or ModuleInitializer
VerifierSettings.ThrowOnMissingVerifiedFile();
```

### Git 配置

添加到 `.gitattributes` 中以改进差异处理：

```gitattributes
*.verified.html linguist-language=HTML
*.verified.html diff=html
```

---

## 最佳实践

### 推荐做法

```csharp
// DO: Test each template variant
[Fact] Task WelcomeEmail_NewUser_RendersCorrectly()
[Fact] Task WelcomeEmail_InvitedUser_RendersCorrectly()

// DO: Use descriptive test names
[Fact] Task PaymentReceipt_WithRefund_ShowsRefundAmount()

// DO: Scrub dynamic values consistently
.ScrubLinesContaining("Generated at:")

// DO: Review diffs carefully before accepting
verify review
```

### 不要这样做

```csharp
// DON'T: Skip email testing
// DON'T: Auto-accept changes without review
verify accept --all  // Dangerous!

// DON'T: Test only happy path
// DON'T: Ignore snapshot test failures
```

---

## 工作流程

1. **创建模板** - 编写 MJML 模板
2. **编写测试** - 使用示例变量添加快照测试
3. **运行测试** - 首次运行会创建 `.verified.html`
4. **审查** - 在浏览器中打开并验证渲染结果
5. **提交** - 将 `.verified.html` 纳入源代码管理
6. **迭代** - 更改会导致测试失败，审查差异，确认无误后接受

---

## 资源

- **Verify**: https://github.com/VerifyTests/Verify
- **Verify.Xunit**: https://github.com/VerifyTests/Verify#xunit
- **差异工具**: https://github.com/VerifyTests/DiffEngine