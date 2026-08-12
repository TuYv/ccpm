---
name: snapshot-testing
description: Use Verify for snapshot testing in .NET. Approve API surfaces, HTTP responses, rendered emails, and serialized outputs. Detect unintended changes through human-reviewed baseline files.
invocable: false
---
# 使用 Verify 进行快照测试

## 何时使用此技能

在以下情况下使用快照测试：
- 验证渲染输出（HTML 电子邮件、报告、生成的代码）
- 审批公共 API 接口，以检测破坏性变更
- 测试 HTTP 响应正文和响应头
- 验证序列化输出
- 捕获复杂对象中的意外变更

---

## 什么是快照测试？

快照测试会捕获输出，并将其与经人工批准的基准进行比较：

1. **首次运行**：测试生成一个包含实际输出的 `.received.` 文件
2. **人工审核**：开发者批准该文件，从而创建一个 `.verified.` 文件
3. **后续运行**：测试将输出与 `.verified.` 文件进行比较
4. **检测到变更**：测试失败，差异比较工具显示差异以供审核

这样既能捕获**意外变更**，又能通过明确审批允许**有意变更**。

---

## 安装

### 添加 Verify 包

```bash
dotnet add package Verify.Xunit
# or for other test frameworks:
dotnet add package Verify.NUnit
dotnet add package Verify.MSTest
```

### 配置 ModuleInitializer

在测试项目中创建一个 `ModuleInitializer.cs`：

```csharp
using System.Runtime.CompilerServices;

public static class ModuleInitializer
{
    [ModuleInitializer]
    public static void Init()
    {
        // Use source-file-relative paths for verified files
        VerifyBase.UseProjectRelativeDirectory("Snapshots");

        // Configure diff tool (optional - auto-detected)
        // DiffTools.UseOrder(DiffTool.Rider, DiffTool.VisualStudioCode);
    }
}
```

---

## 基本用法

### 简单对象验证

```csharp
[Fact]
public Task VerifyUserDto()
{
    var user = new UserDto(
        Id: "user-123",
        Name: "John Doe",
        Email: "john@example.com",
        CreatedAt: new DateTime(2025, 1, 15));

    return Verify(user);
}
```

创建 `VerifyUserDto.verified.txt`：
```json
{
  Id: user-123,
  Name: John Doe,
  Email: john@example.com,
  CreatedAt: 2025-01-15T00:00:00
}
```

### 字符串/HTML 验证

```csharp
[Fact]
public async Task VerifyRenderedEmail()
{
    var html = await _emailRenderer.RenderAsync("Welcome", new { Name = "John" });

    // Use extension parameter for proper file naming
    await Verify(html, extension: "html");
}
```

创建 `VerifyRenderedEmail.verified.html`——可在浏览器中查看。

---

## 电子邮件模板测试

使用 Verify 捕获已渲染电子邮件模板中的意外变更：

```csharp
[Fact]
public async Task UserSignupInvitation_RendersCorrectly()
{
    var renderer = _services.GetRequiredService<IMjmlTemplateRenderer>();

    var variables = new Dictionary<string, string>
    {
        { "OrganizationName", "Acme Corporation" },
        { "InviteeName", "John Doe" },
        { "InviterName", "Jane Admin" },
        { "InvitationLink", "https://example.com/invite/abc123" },
        { "ExpirationDate", "December 31, 2025" }
    };

    var html = await renderer.RenderTemplateAsync(
        "UserInvitations/UserSignupInvitation",
        variables);

    await Verify(html, extension: "html");
}
```

**电子邮件测试的优势：**
- 捕获 CSS/布局回归问题
- 检测损坏的模板变量
- 在差异比较工具中进行可视化审查
- 通过版本控制跟踪电子邮件的变更

---

## API 表面审批

防止公共 API 出现意外的破坏性变更：

```csharp
[Fact]
public Task ApprovePublicApi()
{
    var assembly = typeof(MyLibrary.PublicClass).Assembly;

    var publicApi = assembly.GetExportedTypes()
        .OrderBy(t => t.FullName)
        .Select(t => new
        {
            Type = t.FullName,
            Members = t.GetMembers(BindingFlags.Public | BindingFlags.Instance | BindingFlags.Static)
                .Where(m => m.DeclaringType == t)
                .OrderBy(m => m.Name)
                .Select(m => m.ToString())
        });

    return Verify(publicApi);
}
```

或者使用专用的 ApiApprover 包：

```bash
dotnet add package PublicApiGenerator
dotnet add package Verify.Xunit
```

```csharp
[Fact]
public Task ApproveApi()
{
    var api = typeof(MyPublicClass).Assembly.GeneratePublicApi();
    return Verify(api);
}
```

这会创建包含完整 API 表面的 `.verified.txt` 文件——任何变更都需要显式审批。

---

## HTTP 响应测试

```csharp
[Fact]
public async Task GetUser_ReturnsExpectedResponse()
{
    var client = _factory.CreateClient();

    var response = await client.GetAsync("/api/users/123");

    // Verify status, headers, and body together
    await Verify(new
    {
        StatusCode = response.StatusCode,
        Headers = response.Headers
            .Where(h => h.Key.StartsWith("X-"))  // Custom headers only
            .ToDictionary(h => h.Key, h => h.Value.First()),
        Body = await response.Content.ReadAsStringAsync()
    });
}
```

---

## 清理动态值

处理时间戳、GUID 和其他动态内容：

```csharp
[Fact]
public Task VerifyOrder()
{
    var order = new Order
    {
        Id = Guid.NewGuid(),  // Different every run
        CreatedAt = DateTime.UtcNow,  // Different every run
        Total = 99.99m
    };

    return Verify(order)
        .ScrubMember("Id")  // Replace with placeholder
        .ScrubMember("CreatedAt");
}
```

输出：
```json
{
  Id: Guid_1,
  CreatedAt: DateTime_1,
  Total: 99.99
}
```

### 全局清理

在 `ModuleInitializer` 中配置：

```csharp
[ModuleInitializer]
public static void Init()
{
    VerifierSettings.ScrubMembersWithType<DateTime>();
    VerifierSettings.ScrubMembersWithType<DateTimeOffset>();
    VerifierSettings.ScrubMembersWithType<Guid>();

    // Scrub specific patterns
    VerifierSettings.AddScrubber(s =>
        Regex.Replace(s, @"token=[a-zA-Z0-9]+", "token=SCRUBBED"));
}
```

---

## 文件组织

### 推荐结构

```
tests/
  MyApp.Tests/
    Snapshots/           # All verified files
      EmailTests/
        WelcomeEmail.verified.html
        PasswordReset.verified.html
      ApiTests/
        GetUser.verified.txt
    EmailTests.cs
    ApiTests.cs
    ModuleInitializer.cs
```

### .gitignore

```gitignore
# Verify - ignore received files (only commit verified)
*.received.*
```

### .gitattributes

```gitattributes
# Treat verified files as generated (collapse in PR diffs)
*.verified.txt linguist-generated=true
*.verified.html linguist-generated=true
*.verified.json linguist-generated=true
```

---

## CI/CD 集成

### 缺少已验证文件时失败

```csharp
[ModuleInitializer]
public static void Init()
{
    // In CI, fail instead of launching diff tool
    if (Environment.GetEnvironmentVariable("CI") == "true")
    {
        VerifyDiffPlex.UseDiffPlex(OutputType.Minimal);
        DiffRunner.Disabled = true;
    }
}
```

### GitHub Actions

```yaml
- name: Run tests
  run: dotnet test
  env:
    CI: true

- name: Upload snapshots on failure
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: snapshots
    path: |
      **/*.received.*
      **/*.verified.*
```

---

## 何时使用快照测试

| 场景 | 是否使用快照测试？ | 原因 |
|----------|----------------------|-----|
| 渲染后的 HTML/电子邮件 | 是 | 捕获视觉回归 |
| API 接口 | 是 | 防止意外的破坏性变更 |
| 序列化输出 | 是 | 验证传输格式 |
| 复杂对象图 | 是 | 比手动断言更容易 |
| 简单值检查 | 否 | 使用常规断言 |
| 业务逻辑 | 否 | 使用显式断言 |
| 性能测试 | 否 | 使用基准测试 |

---

## 最佳实践

### 应该做

```csharp
// Use descriptive test names - they become file names
[Fact]
public Task UserRegistration_WithValidData_ReturnsConfirmation()

// Scrub dynamic values consistently
VerifierSettings.ScrubMembersWithType<Guid>();

// Use extension parameter for non-text content
await Verify(html, extension: "html");

// Keep verified files in source control
git add *.verified.*
```

### 不应该做

```csharp
// Don't verify random/dynamic data without scrubbing
var order = new Order { Id = Guid.NewGuid() };  // Fails every run!
await Verify(order);

// Don't commit .received files
git add *.received.*  // Wrong!

// Don't use for simple assertions
await Verify(result.Count);  // Just use Assert.Equal(5, result.Count)
```

---

## 与 MJML 电子邮件测试集成

有关完整模式，请参阅 `aspnetcore/transactional-emails` skill：

1. 使用 `{{variable}}` 占位符的 MJML 模板
2. 使用测试数据渲染为 HTML
3. 对渲染后的输出进行快照测试
4. 批准前在差异比较工具中审查变更

这可以捕获：
- 变量替换错误
- CSS/布局回归
- 电子邮件客户端兼容性问题
- 非预期的内容变更

---

## 资源

- **Verify GitHub**：https://github.com/VerifyTests/Verify
- **Verify.Xunit**：https://github.com/VerifyTests/Verify.Xunit
- **ApiApprover**：https://github.com/JakeGinnivan/ApiApprover
- **DiffPlex 集成**：https://github.com/VerifyTests/Verify.DiffPlex