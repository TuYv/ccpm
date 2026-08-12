---
name: playwright-blazor-testing
description: Write UI tests for Blazor applications (Server or WebAssembly) using Playwright. Covers navigation, interaction, authentication, selectors, and common Blazor-specific patterns.
invocable: false
---
# 使用 Playwright 测试 Blazor 应用程序

## 何时使用此技能

在以下情况下使用此技能：
- 为 Blazor Server 或 WebAssembly 应用程序编写端到端 UI 测试
- 测试交互式组件、表单和用户工作流
- 验证身份认证和授权流程
- 测试 Blazor Server 中基于 SignalR 的实时更新
- 捕获用于视觉回归测试的屏幕截图
- 测试响应式设计和移动设备模拟
- 使用浏览器开发者工具调试 UI 问题

## 核心原则

1. **等待渲染** - Blazor 以异步方式渲染；应使用适当的等待策略
2. **测试属性** - 使用 `data-test` 或 `data-testid` 属性作为稳定的选择器
3. **默认使用无头模式** - 在 CI 中以无头模式运行测试，在本地调试时以有头模式运行
4. **处理错误 UI** - 始终检查 `#blazor-error-ui`，以捕获未处理的异常
5. **避免等待网络状态** - Blazor 导航不会触发网络加载；应等待 DOM 发生变化
6. **固定浏览器通道** - 使用特定的浏览器通道（msedge、chrome）以确保可复现性

## 所需的 NuGet 包

```xml
<ItemGroup>
  <PackageReference Include="Microsoft.Playwright" Version="*" />
  <PackageReference Include="Microsoft.Playwright.MSTest" Version="*" />
  <!-- OR for xUnit -->
  <PackageReference Include="xunit" Version="*" />
  <PackageReference Include="xunit.runner.visualstudio" Version="*" />
</ItemGroup>
```

## 安装

运行测试之前，请安装 Playwright 浏览器：

```bash
pwsh -Command "playwright install --with-deps"
```

## 模式 1：Playwright 基本设置

```csharp
using Microsoft.Playwright;

public class PlaywrightFixture : IAsyncLifetime
{
    private IPlaywright? _playwright;
    private IBrowser? _browser;

    public IBrowser Browser => _browser
        ?? throw new InvalidOperationException("Browser not initialized");

    public async Task InitializeAsync()
    {
        _playwright = await Playwright.CreateAsync();

        _browser = await _playwright.Chromium.LaunchAsync(new()
        {
            Headless = true,
            // For CI/debugging, you might want:
            // Headless = Environment.GetEnvironmentVariable("CI") != null,
            // SlowMo = 100 // Slow down actions for debugging
        });
    }

    public async Task DisposeAsync()
    {
        if (_browser is not null)
            await _browser.DisposeAsync();

        _playwright?.Dispose();
    }
}
```

## 模式 2：Blazor 应用中的导航

### 初始页面加载（传统导航）

```csharp
[Fact]
public async Task InitialPageLoad()
{
    var page = await _fixture.Browser.NewPageAsync();

    // First load is classic HTTP navigation
    await page.GotoAsync("https://localhost:5001");

    // Wait for Blazor to initialize
    await page.WaitForSelectorAsync("h1:has-text('Welcome')");

    Assert.True(await page.IsVisibleAsync("h1:has-text('Welcome')"));
}
```

### 应用内导航（不重新加载页面）

Blazor 使用客户端路由，因此后续导航不会触发页面重新加载：

```csharp
[Fact]
public async Task InternalNavigation()
{
    var page = await _fixture.Browser.NewPageAsync();
    await page.GotoAsync("https://localhost:5001");

    // Method 1: Click a navigation link
    await page.GetByRole(AriaRole.Link, new() { Name = "Counter" })
        .ClickAsync();

    // Wait for the new page content (NOT network idle!)
    await page.WaitForSelectorAsync("h1:has-text('Counter')");

    // Method 2: Programmatic navigation (Blazor 8+)
    await page.EvaluateAsync("window.Blazor.navigateTo('/fetchdata')");
    await page.WaitForSelectorAsync("h1:has-text('Weather')");

    // Method 3: Direct URL navigation (causes full reload)
    await page.GotoAsync("https://localhost:5001/counter");
    await page.WaitForSelectorAsync("h1:has-text('Counter')");
}
```

### Blazor 的等待策略

```csharp
// ❌ DON'T: Wait for network idle (Blazor doesn't reload pages)
await page.WaitForLoadStateAsync(LoadState.NetworkIdle);

// ✅ DO: Wait for specific DOM elements
await page.WaitForSelectorAsync("h1:has-text('My Page')");

// ✅ DO: Wait for element visibility
await page.Locator("[data-test='content']").WaitForAsync();

// ✅ DO: Wait for URL change
await page.WaitForURLAsync("**/counter");
```

## 模式 3：使用测试属性实现稳定的选择器

### 在 Blazor 组件中

```razor
<!-- Add data-test attributes for stable selectors -->
<button data-test="submit-button" @onclick="HandleSubmit">
    Submit
</button>

<input data-test="username-input" @bind="Username" />

<div data-test="result-container">
    @Result
</div>
```

### 在测试中

```csharp
[Fact]
public async Task FormSubmission()
{
    var page = await _fixture.Browser.NewPageAsync();
    await page.GotoAsync(baseUrl);

    // Use GetByTestId for elements with data-test attributes
    await page.GetByTestId("username-input").FillAsync("testuser");
    await page.GetByTestId("password-input").FillAsync("password123");
    await page.GetByTestId("submit-button").ClickAsync();

    // Verify result
    var result = await page.GetByTestId("result-container").TextContentAsync();
    Assert.Contains("Success", result);
}
```

## 模式 4：处理身份验证

### 交互式登录

```csharp
[Fact]
public async Task LoginFlow()
{
    var page = await _fixture.Browser.NewPageAsync();
    await page.GotoAsync($"{baseUrl}/login");

    // Fill login form
    await page.FillAsync("input[name='username']", "alice");
    await page.FillAsync("input[name='password']", "P@ssw0rd");
    await page.ClickAsync("button[type='submit']");

    // Wait for redirect to dashboard
    await page.WaitForURLAsync("**/dashboard");

    // Verify logged in
    var username = await page.TextContentAsync("[data-test='user-name']");
    Assert.Equal("alice", username);
}
```

### Cookie 注入（更快）

```csharp
[Fact]
public async Task AuthenticatedAccess_ViaCookie()
{
    var page = await _fixture.Browser.NewPageAsync();

    // Inject authentication cookie
    await page.Context.AddCookiesAsync(new[]
    {
        new Cookie
        {
            Name = ".AspNetCore.Cookies",
            Value = GenerateAuthCookie("alice"),
            Url = baseUrl,
            Secure = true,
            HttpOnly = true
        }
    });

    // Navigate directly to protected page
    await page.GotoAsync($"{baseUrl}/dashboard");

    // Already authenticated!
    var username = await page.TextContentAsync("[data-test='user-name']");
    Assert.Equal("alice", username);
}

private string GenerateAuthCookie(string username)
{
    // Generate a valid authentication cookie
    // This requires access to your app's cookie encryption keys
    // OR use a test endpoint that generates valid cookies
    // OR perform actual login once and reuse the cookie
}
```

### OAuth/外部提供商模拟

```csharp
// Use route interception to mock OAuth redirects
await page.RouteAsync("**/signin-microsoft", async route =>
{
    // Intercept OAuth redirect and return mock response
    await route.FulfillAsync(new()
    {
        Status = 302,
        Headers = new Dictionary<string, string>
        {
            ["Location"] = $"{baseUrl}/signin-callback?code=mock_auth_code"
        }
    });
});
```

## 模式 5：点击事件和触摸交互

```csharp
[Fact]
public async Task ClickInteractions()
{
    var page = await _fixture.Browser.NewPageAsync();
    await page.GotoAsync(baseUrl);

    // Standard click
    await page.GetByText("Click Me").ClickAsync();

    // Right-click
    await page.ClickAsync("[data-test='context-menu']", new()
    {
        Button = MouseButton.Right
    });

    // Double-click
    await page.DblClickAsync("[data-test='item']");

    // Hover then click dropdown
    var menu = page.Locator("#profile-menu");
    await menu.HoverAsync();
    await menu.GetByText("Sign out").ClickAsync();

    // Touch events (mobile emulation)
    await page.EmulateMediaAsync(new() { Media = Media.Screen });
    await page.Touchscreen.TapAsync(150, 300);
}
```

## 模式 6：表单处理

```csharp
[Fact]
public async Task ComplexForm()
{
    var page = await _fixture.Browser.NewPageAsync();
    await page.GotoAsync($"{baseUrl}/form");

    // Text input
    await page.FillAsync("[data-test='name']", "John Doe");

    // Select dropdown
    await page.SelectOptionAsync("[data-test='country']", "US");

    // Checkbox
    await page.CheckAsync("[data-test='terms']");

    // Radio button
    await page.CheckAsync("[data-test='option-a']");

    // File upload
    await page.SetInputFilesAsync("[data-test='file-input']",
        "/path/to/test-file.pdf");

    // Submit
    await page.ClickAsync("[data-test='submit']");

    // Wait for success message
    await page.WaitForSelectorAsync("[data-test='success-message']");
}
```

## 模式 7：处理 Blazor 错误 UI

发生未处理的异常时，Blazor 会显示一个错误浮层。请始终检查此情况：

```csharp
public static async Task AssertNoBlazorErrors(this IPage page)
{
    var errorUi = page.Locator("#blazor-error-ui");

    if (await errorUi.IsVisibleAsync())
    {
        var errorText = await errorUi.InnerTextAsync();
        Assert.Fail($"Blazor error occurred: {errorText}");
    }
}

[Fact]
public async Task Page_ShouldNotHaveErrors()
{
    var page = await _fixture.Browser.NewPageAsync();
    await page.GotoAsync(baseUrl);

    // Perform some actions
    await page.ClickAsync("[data-test='action-button']");

    // Verify no errors occurred
    await page.AssertNoBlazorErrors();
}
```

## 模式 8：测试实时更新（SignalR）

Blazor Server 使用 SignalR 进行实时通信：

```csharp
[Fact]
public async Task RealTimeUpdates()
{
    // Open two browser contexts (simulating two users)
    var page1 = await _fixture.Browser.NewPageAsync();
    var page2 = await _fixture.Browser.NewPageAsync();

    await page1.GotoAsync($"{baseUrl}/drawing");
    await page2.GotoAsync($"{baseUrl}/drawing");

    // User 1 draws something
    await page1.ClickAsync("[data-test='draw-button']");
    await page1.Mouse.ClickAsync(100, 100);

    // User 2 should see the update
    await page2.WaitForSelectorAsync("[data-test='drawing-canvas']");

    // Verify both pages show the same content
    var canvas1 = await page1.GetByTestId("drawing-canvas")
        .GetAttributeAsync("data-strokes");
    var canvas2 = await page2.GetByTestId("drawing-canvas")
        .GetAttributeAsync("data-strokes");

    Assert.Equal(canvas1, canvas2);
}
```

## 模式 9：截图和视觉测试

```csharp
[Fact]
public async Task CaptureScreenshots()
{
    var page = await _fixture.Browser.NewPageAsync();
    await page.GotoAsync(baseUrl);

    // Full page screenshot
    await page.ScreenshotAsync(new()
    {
        Path = "screenshots/homepage.png",
        FullPage = true
    });

    // Element screenshot
    var header = page.Locator("header");
    await header.ScreenshotAsync(new()
    {
        Path = "screenshots/header.png"
    });

    // Screenshot with viewport size
    await page.SetViewportSizeAsync(1920, 1080);
    await page.ScreenshotAsync(new()
    {
        Path = "screenshots/desktop.png"
    });

    // Mobile viewport
    await page.SetViewportSizeAsync(375, 667);
    await page.ScreenshotAsync(new()
    {
        Path = "screenshots/mobile.png"
    });
}
```

## 模式 10：使用开发证书针对 HTTPS 运行

```csharp
public async Task InitializeAsync()
{
    _playwright = await Playwright.CreateAsync();

    _browser = await _playwright.Chromium.LaunchAsync(new()
    {
        Headless = true,
        // Ignore certificate errors for local dev certs
        Args = new[] { "--ignore-certificate-errors" }
    });
}
```

对于更严格的设置，请导出并信任开发证书：

```bash
dotnet dev-certs https --export-path cert.pfx -p YourPassword
```

## Blazor 组件的常用选择器

```csharp
// By role (best for accessibility)
await page.GetByRole(AriaRole.Button, new() { Name = "Submit" });
await page.GetByRole(AriaRole.Link, new() { Name = "Home" });
await page.GetByRole(AriaRole.Heading, new() { Name = "Welcome" });

// By test ID
await page.GetByTestId("user-profile");

// By text content
await page.GetByText("Hello, World!");

// By label (for inputs)
await page.GetByLabel("Email Address");

// By placeholder
await page.GetByPlaceholder("Enter your name");

// CSS selectors (use sparingly)
await page.Locator(".mud-button-primary");
await page.Locator("#login-form");

// XPath (use as last resort)
await page.Locator("xpath=//button[contains(text(), 'Submit')]");
```

## 并行化注意事项

Blazor Server 使用 SignalR WebSocket。多个 Playwright 测试可能会使连接达到饱和：

```csharp
// Limit parallel execution for Blazor Server tests
[Collection("Blazor Server")]
public class BlazorServerTests { }

// In AssemblyInfo.cs or test startup
[assembly: CollectionBehavior(MaxParallelThreads = 2)]
```

Blazor WebAssembly 没有此限制，可以完全并行运行。

## CI/CD 集成

### GitHub Actions

```yaml
name: Playwright Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v3

    - name: Setup .NET
      uses: actions/setup-dotnet@v3
      with:
        dotnet-version: 9.0.x

    - name: Install Playwright Browsers
      run: pwsh -Command "playwright install --with-deps"

    - name: Build
      run: dotnet build -c Release

    - name: Run Playwright Tests
      run: |
        dotnet test tests/YourApp.UITests \
          --no-build \
          -c Release \
          --logger trx

    - name: Upload Screenshots
      uses: actions/upload-artifact@v3
      if: failure()
      with:
        name: playwright-screenshots
        path: "**/screenshots/"

    - name: Upload Test Results
      uses: actions/upload-artifact@v3
      if: always()
      with:
        name: test-results
        path: "**/TestResults/*.trx"
```

## 调试技巧

1. **以有头模式运行** - 设置 `Headless = false` 以观察测试执行过程
2. **慢动作** - 添加 `SlowMo = 500` 以减慢操作速度
3. **暂停执行** - 调用 `await page.PauseAsync()` 以打开 Playwright Inspector
4. **控制台日志** - 捕获浏览器控制台：`page.Console += (_, msg) => Console.WriteLine(msg.Text);`
5. **网络流量** - 监控请求：`page.Request += (_, req) => Console.WriteLine(req.Url);`
6. **失败时截图** - 始终在 catch 块中捕获截图

## 最佳实践

1. **使用 data-test 属性** - 比 CSS 类或 ID 更稳定
2. **优先使用语义选择器** - 使用角色、标签和文本内容
3. **等待特定元素** - 不要使用笼统的延迟
4. **检查 Blazor 错误** - 始终验证 `#blazor-error-ui` 不可见
5. **使用多个视口进行测试** - 验证响应式设计
6. **复用浏览器上下文** - 比创建新浏览器更快
7. **清理资源** - 始终释放页面和浏览器
8. **为 Blazor Server 使用集合** - 避免 SignalR 连接饱和
9. **失败时捕获截图** - 对调试 CI 失败至关重要
10. **固定浏览器通道** - 使用特定通道以确保可复现性

## 高级：自定义等待辅助方法

```csharp
public static class PlaywrightExtensions
{
    public static async Task WaitForBlazorAsync(this IPage page)
    {
        // Wait for Blazor to finish rendering
        await page.EvaluateAsync(@"
            () => new Promise(resolve => {
                if (typeof Blazor !== 'undefined') {
                    resolve();
                } else {
                    const interval = setInterval(() => {
                        if (typeof Blazor !== 'undefined') {
                            clearInterval(interval);
                            resolve();
                        }
                    }, 100);
                }
            })
        ");
    }

    public static async Task WaitForNoSpinnersAsync(
        this IPage page,
        int timeout = 5000)
    {
        var locator = page.Locator(".spinner, .loading");
        await locator.WaitForAsync(new()
        {
            State = WaitForSelectorState.Hidden,
            Timeout = timeout
        });
    }

    public static async Task FillWithValidationAsync(
        this IPage page,
        string selector,
        string value)
    {
        await page.FillAsync(selector, value);

        // Trigger blur to activate validation
        await page.Locator(selector).BlurAsync();

        // Wait a bit for validation to complete
        await Task.Delay(100);
    }
}
```