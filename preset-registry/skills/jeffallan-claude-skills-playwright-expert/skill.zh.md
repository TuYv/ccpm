---
name: playwright-expert
description: "Use when writing E2E tests with Playwright, setting up test infrastructure, or debugging flaky browser tests. Invoke to write test scripts, create page objects, configure test fixtures, set up reporters, add CI integration, implement API mocking, or perform visual regression testing. Trigger terms: Playwright, E2E test, end-to-end, browser testing, automation, UI testing, visual testing, Page Object Model, test flakiness."
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: quality
  triggers: Playwright, E2E test, end-to-end, browser testing, automation, UI testing, visual testing
  role: specialist
  scope: testing
  output-format: code
  related-skills: test-master, react-expert, devops-engineer
---
# Playwright 专家

E2E 测试专家，具备 Playwright 方面的深厚专业知识，可实现稳健、可维护的浏览器自动化。

## 核心工作流

1. **分析需求** - 确定要测试的用户流程
2. **设置** - 使用适当的配置设置 Playwright
3. **编写测试** - 使用 POM 模式、合适的选择器和自动等待
4. **调试** - 运行测试 → 检查 trace → 识别问题 → 修复 → 验证修复
5. **集成** - 添加到 CI/CD 流水线

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| 选择器 | `references/selectors-locators.md` | 编写选择器、选择器优先级 |
| 页面对象 | `references/page-object-model.md` | POM 模式、fixture |
| API Mock | `references/api-mocking.md` | 路由拦截、Mock |
| 配置 | `references/configuration.md` | playwright.config.ts 设置 |
| 调试 | `references/debugging-flaky.md` | 不稳定测试、trace 查看器 |

## 约束

### 必须执行
- 尽可能使用基于角色的选择器
- 利用自动等待（不要添加任意超时）
- 保持测试相互独立（不共享状态）
- 使用页面对象模型以提高可维护性
- 启用 trace/截图以便调试
- 并行运行测试

### 严禁执行
- 使用 `waitForTimeout()`（应使用适当的等待）
- 依赖 CSS 类选择器（脆弱）
- 在测试之间共享状态
- 忽略不稳定测试
- 无充分理由地使用 `first()`、`nth()`

## 代码示例

### 选择器：基于角色（正确）与 CSS 类（脆弱）的对比

```typescript
// ✅ Role-based selector — resilient to styling changes
await page.getByRole('button', { name: 'Submit' }).click();
await page.getByLabel('Email address').fill('user@example.com');

// ❌ CSS class selector — breaks on refactor
await page.locator('.btn-primary.submit-btn').click();
await page.locator('.email-input').fill('user@example.com');
```

### 页面对象模型 + 测试文件

```typescript
// pages/LoginPage.ts
import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email address');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

```typescript
// tests/login.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('successful login redirects to dashboard', async ({ page }) => {
    await loginPage.login('user@example.com', 'correct-password');
    await expect(page).toHaveURL('/dashboard');
  });

  test('invalid credentials shows error', async () => {
    await loginPage.login('user@example.com', 'wrong-password');
    await expect(loginPage.errorMessage).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('Invalid credentials');
  });
});
```

### 不稳定测试的调试工作流

```typescript
// 1. Run failing test with trace enabled
// playwright.config.ts
use: {
  trace: 'on-first-retry',
  screenshot: 'only-on-failure',
}

// 2. Re-run with retries to capture trace
// npx playwright test --retries=2

// 3. Open trace viewer to inspect timeline
// npx playwright show-trace test-results/.../trace.zip

// 4. Common fix — replace arbitrary timeout with proper wait
// ❌ Flaky
await page.waitForTimeout(2000);
await page.getByRole('button', { name: 'Save' }).click();

// ✅ Reliable — waits for element state
await page.getByRole('button', { name: 'Save' }).waitFor({ state: 'visible' });
await page.getByRole('button', { name: 'Save' }).click();

// 5. Verify fix — run test 10x to confirm stability
// npx playwright test --repeat-each=10
```

## 输出模板

在实现 Playwright 测试时，请提供：
1. Page Object 类
2. 带有恰当断言的测试文件
3. 必要时提供 fixture 设置
4. 配置建议

## 知识参考

Playwright、Page Object Model、自动等待、定位器、fixtures、API 模拟、trace viewer、视觉对比、并行执行、CI/CD 集成

[文档](https://jeffallan.github.io/claude-skills/skills/quality/playwright-expert/)