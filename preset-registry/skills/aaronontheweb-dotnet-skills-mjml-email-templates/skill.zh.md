---
name: mjml-email-templates
description: Build responsive email templates using MJML markup language. Compiles to cross-client HTML that works in Outlook, Gmail, and Apple Mail. Includes template renderer, layout patterns, and variable substitution.
invocable: false
---
# MJML 电子邮件模板

## 何时使用此技能

在以下情况下使用此技能：
- 构建事务性电子邮件（注册、密码重置、发票、通知）
- 创建可跨客户端运行的响应式电子邮件模板
- 在 .NET 中设置 MJML 模板渲染

**相关技能：**
- `aspire/mailpit-integration` - 使用 Mailpit 在本地测试电子邮件
- `testing/verify-email-snapshots` - 对渲染后的 HTML 进行快照测试

---

## 为什么选择 MJML？

**问题**：电子邮件 HTML 的处理非常困难。每个电子邮件客户端（Outlook、Gmail、Apple Mail）的渲染方式都不同，因此需要复杂的基于表格的布局和内联样式。

**解决方案**：[MJML](https://mjml.io/) 是一种标记语言，可以编译为响应式、跨客户端的 HTML：

```mjml
<!-- MJML - simple and readable -->
<mj-section>
  <mj-column>
    <mj-text>Hello {{UserName}}</mj-text>
    <mj-button href="{{ActionUrl}}">Click Here</mj-button>
  </mj-column>
</mj-section>
```

它会被编译为约 200 行包含内联样式、基于表格的 HTML，并可在各种客户端中正常运行。

---

## 安装

### 添加 Mjml.Net

```bash
dotnet add package Mjml.Net
```

### 将模板嵌入为资源

在你的 `.csproj` 中：

```xml
<ItemGroup>
  <EmbeddedResource Include="Templates\**\*.mjml" />
</ItemGroup>
```

---

## 项目结构

```
src/
  Infrastructure/
    MyApp.Infrastructure.Mailing/
      Templates/
        _Layout.mjml              # Shared layout (header, footer)
        UserInvitations/
          UserSignupInvitation.mjml
          InvitationExpired.mjml
        PasswordReset/
          PasswordReset.mjml
        Billing/
          PaymentReceipt.mjml
          RenewalReminder.mjml
      Mjml/
        IMjmlTemplateRenderer.cs
        MjmlTemplateRenderer.cs
        MjmlEmailMessage.cs
      Composers/
        IUserEmailComposer.cs
        UserEmailComposer.cs
      MyApp.Infrastructure.Mailing.csproj
```

---

## 布局模板 (_Layout.mjml)

```mjml
<mjml>
  <mj-head>
    <mj-title>MyApp</mj-title>
    <mj-preview>{{PreviewText}}</mj-preview>
    <mj-attributes>
      <mj-all font-family="'Helvetica Neue', Helvetica, Arial, sans-serif" />
      <mj-text font-size="14px" color="#555555" line-height="20px" />
      <mj-section padding="20px" />
    </mj-attributes>
    <mj-style inline="inline">
      a { color: #2563eb; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </mj-style>
  </mj-head>
  <mj-body background-color="#f3f4f6">
    <!-- Header -->
    <mj-section background-color="#ffffff" padding-bottom="0">
      <mj-column>
        <mj-image
          src="https://myapp.com/logo.png"
          alt="MyApp"
          width="150px"
          href="{{SiteUrl}}"
          padding="30px 25px 20px 25px" />
      </mj-column>
    </mj-section>

    <!-- Content injected here -->
    <mj-section background-color="#ffffff" padding-top="20px" padding-bottom="40px">
      <mj-column>
        {{Content}}
      </mj-column>
    </mj-section>

    <!-- Footer -->
    <mj-section background-color="#f9fafb" padding="20px 25px">
      <mj-column>
        <mj-text align="center" font-size="12px" color="#9ca3af">
          &copy; 2025 MyApp Inc. All rights reserved.
        </mj-text>
      </mj-column>
    </mj-section>
  </mj-body>
</mjml>
```

---

## 内容模板

```mjml
<!-- UserInvitations/UserSignupInvitation.mjml -->
<!-- Wrapped in _Layout.mjml automatically -->

<mj-text font-size="16px" color="#111827" font-weight="600" padding-bottom="20px">
  You've been invited to join {{OrganizationName}}
</mj-text>

<mj-text padding-bottom="15px">
  Hi {{InviteeName}},
</mj-text>

<mj-text padding-bottom="15px">
  {{InviterName}} has invited you to join <strong>{{OrganizationName}}</strong>.
</mj-text>

<mj-text padding-bottom="25px">
  Click the button below to accept your invitation:
</mj-text>

<mj-button background-color="#2563eb" color="#ffffff" font-size="16px" href="{{InvitationLink}}">
  Accept Invitation
</mj-button>

<mj-text padding-top="25px" font-size="13px" color="#6b7280">
  This invitation expires on {{ExpirationDate}}.
</mj-text>
```

---

## 模板渲染器

```csharp
public interface IMjmlTemplateRenderer
{
    Task<string> RenderTemplateAsync(
        string templateName,
        IReadOnlyDictionary<string, string> variables,
        CancellationToken ct = default);
}

public sealed partial class MjmlTemplateRenderer : IMjmlTemplateRenderer
{
    private readonly MjmlRenderer _mjmlRenderer = new();
    private readonly Assembly _assembly;
    private readonly string _siteUrl;

    public MjmlTemplateRenderer(IConfiguration config)
    {
        _assembly = typeof(MjmlTemplateRenderer).Assembly;
        _siteUrl = config["SiteUrl"] ?? "https://myapp.com";
    }

    public async Task<string> RenderTemplateAsync(
        string templateName,
        IReadOnlyDictionary<string, string> variables,
        CancellationToken ct = default)
    {
        // Load content template
        var contentMjml = await LoadTemplateAsync(templateName, ct);

        // Load layout and inject content
        var layoutMjml = await LoadTemplateAsync("_Layout", ct);
        var combinedMjml = layoutMjml.Replace("{{Content}}", contentMjml);

        // Merge variables (layout + template-specific)
        var allVariables = new Dictionary<string, string>
        {
            { "SiteUrl", _siteUrl }
        };
        foreach (var kvp in variables)
            allVariables[kvp.Key] = kvp.Value;

        // Substitute variables
        var processedMjml = SubstituteVariables(combinedMjml, allVariables);

        // Compile to HTML
        var result = await _mjmlRenderer.RenderAsync(processedMjml, null, ct);

        if (result.Errors.Any())
            throw new InvalidOperationException(
                $"MJML compilation failed: {string.Join(", ", result.Errors.Select(e => e.Error))}");

        return result.Html;
    }

    private async Task<string> LoadTemplateAsync(string templateName, CancellationToken ct)
    {
        var resourceName = $"MyApp.Infrastructure.Mailing.Templates.{templateName.Replace('/', '.')}.mjml";

        await using var stream = _assembly.GetManifestResourceStream(resourceName)
            ?? throw new FileNotFoundException($"Template '{templateName}' not found");

        using var reader = new StreamReader(stream);
        return await reader.ReadToEndAsync(ct);
    }

    private static string SubstituteVariables(string mjml, IReadOnlyDictionary<string, string> variables)
    {
        return VariableRegex().Replace(mjml, match =>
        {
            var name = match.Groups[1].Value;
            return variables.TryGetValue(name, out var value) ? value : match.Value;
        });
    }

    [GeneratedRegex(@"\{\{([^}]+)\}\}", RegexOptions.Compiled)]
    private static partial Regex VariableRegex();
}
```

---

## 邮件组合器模式

使用强类型值对象，将模板渲染与邮件组合分离：

```csharp
public interface IUserEmailComposer
{
    Task<EmailMessage> ComposeSignupInvitationAsync(
        EmailAddress recipientEmail,
        PersonName recipientName,
        PersonName inviterName,
        OrganizationName organizationName,
        AbsoluteUri invitationUrl,
        DateTimeOffset expiresAt,
        CancellationToken ct = default);
}

public sealed class UserEmailComposer : IUserEmailComposer
{
    private readonly IMjmlTemplateRenderer _renderer;

    public UserEmailComposer(IMjmlTemplateRenderer renderer)
    {
        _renderer = renderer;
    }

    public async Task<EmailMessage> ComposeSignupInvitationAsync(
        EmailAddress recipientEmail,
        PersonName recipientName,
        PersonName inviterName,
        OrganizationName organizationName,
        AbsoluteUri invitationUrl,
        DateTimeOffset expiresAt,
        CancellationToken ct = default)
    {
        var variables = new Dictionary<string, string>
        {
            { "PreviewText", $"You've been invited to join {organizationName.Value}" },
            { "InviteeName", recipientName.Value },
            { "InviterName", inviterName.Value },
            { "OrganizationName", organizationName.Value },
            { "InvitationLink", invitationUrl.ToString() },
            { "ExpirationDate", expiresAt.ToString("MMMM d, yyyy") }
        };

        var html = await _renderer.RenderTemplateAsync(
            "UserInvitations/UserSignupInvitation",
            variables,
            ct);

        return new EmailMessage(
            To: recipientEmail,
            Subject: $"You've been invited to join {organizationName.Value}",
            HtmlBody: html);
    }
}
```

---

## 邮件预览端点

添加一个管理员端点，以便在开发期间预览邮件：

```csharp
app.MapGet("/admin/emails/preview/{template}", async (
    string template,
    IMjmlTemplateRenderer renderer) =>
{
    var sampleVariables = GetSampleVariables(template);
    var html = await renderer.RenderTemplateAsync(template, sampleVariables);

    return Results.Content(html, "text/html");
})
.RequireAuthorization("AdminOnly");
```

---

## 最佳实践

### 模板设计

```mjml
<!-- DO: Use MJML components for layout -->
<mj-section>
  <mj-column>
    <mj-text>Content</mj-text>
  </mj-column>
</mj-section>

<!-- DON'T: Use raw HTML tables -->
<table><tr><td>Content</td></tr></table>

<!-- DO: Use production URLs for images -->
<mj-image src="https://myapp.com/logo.png" />

<!-- DON'T: Use relative paths -->
<mj-image src="/img/logo.png" />
```

### 变量处理

```csharp
// DO: Use strongly-typed value objects
Task<EmailMessage> ComposeAsync(
    EmailAddress to,
    PersonName name,
    AbsoluteUri actionUrl);

// DON'T: Use raw strings
Task<EmailMessage> ComposeAsync(
    string email,
    string name,
    string url);
```

---

## MJML 组件参考

| 组件 | 用途 |
|-----------|---------|
| `<mj-section>` | 水平容器（类似一行） |
| `<mj-column>` | 区段内的垂直容器 |
| `<mj-text>` | 带样式的文本内容 |
| `<mj-button>` | 行动号召按钮 |
| `<mj-image>` | 响应式图像 |
| `<mj-divider>` | 水平线 |
| `<mj-spacer>` | 垂直间距 |
| `<mj-table>` | 数据表格 |
| `<mj-social>` | 社交媒体图标 |

---

## 资源

- **MJML 文档**：https://documentation.mjml.io/
- **MJML 在线演练场**：https://mjml.io/try-it-live
- **Mjml.Net**：https://github.com/ArtZab/Mjml.Net