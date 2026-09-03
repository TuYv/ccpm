---
name: e2e-testing-patterns
description: Master end-to-end testing with Playwright and Cypress to build reliable test suites that catch bugs, improve confidence, and enable fast deployment. Use when implementing E2E tests, debugging flaky tests, or establishing testing standards.
---
# E2E 测试模式

构建可靠、快速且易于维护的端到端测试套件，让团队有信心快速发布代码，并在用户之前发现回归问题。

## 何时使用此技能

- 实现端到端测试自动化
- 调试不稳定或不可靠的测试
- 测试关键用户工作流
- 搭建 CI/CD 测试流水线
- 跨多种浏览器进行测试
- 验证无障碍要求
- 测试响应式设计
- 制定 E2E 测试标准

## 核心概念

### 1. E2E 测试基础

**适合用 E2E 测试的内容：**

- 关键用户旅程（登录、结账、注册）
- 复杂交互（拖放、多步表单）
- 跨浏览器兼容性
- 真实 API 集成
- 认证流程

**不适合用 E2E 测试的内容：**

- 单元级逻辑（使用单元测试）
- API 契约（使用集成测试）
- 边缘情况（太慢）
- 内部实现细节

### 2. 测试理念

**测试金字塔：**

```
        /\
       /E2E\         ← Few, focused on critical paths
      /─────\
     /Integr\        ← More, test component interactions
    /────────\
   /Unit Tests\      ← Many, fast, isolated
  /────────────\
```

**最佳实践：**

- 测试用户行为，而非实现
- 保持测试相互独立
- 让测试具有确定性
- 为速度做优化
- 使用 data-testid，而非 CSS 选择器

## 详细模式与示例

详细的模式文档位于 `references/details.md`。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

1. **使用数据属性**：使用 `data-testid` 或 `data-cy` 作为稳定的选择器
2. **避免脆弱的选择器**：不要依赖 CSS 类或 DOM 结构
3. **测试用户行为**：点击、输入、查看结果——而非实现细节
4. **保持测试独立**：每个测试都应隔离运行
5. **清理测试数据**：在每个测试中创建并销毁测试数据
6. **使用页面对象（Page Objects）**：封装页面逻辑
7. **有意义的断言**：检查用户实际可见的行为
8. **为速度做优化**：尽可能使用 Mock，并行执行

```typescript
// ❌ Bad selectors
cy.get(".btn.btn-primary.submit-button").click();
cy.get("div > form > div:nth-child(2) > input").type("text");

// ✅ Good selectors
cy.getByRole("button", { name: "Submit" }).click();
cy.getByLabel("Email address").type("user@example.com");
cy.get('[data-testid="email-input"]').type("user@example.com");
```

## 常见陷阱

- **不稳定（Flaky）的测试**：使用正确的等待方式，而非固定超时
- **缓慢的测试**：Mock 外部 API，使用并行执行
- **过度测试**：不要用 E2E 测试每一个边缘情况
- **耦合的测试**：测试之间不应相互依赖
- **糟糕的选择器**：避免使用 CSS 类和 nth-child
- **不清理**：每个测试后清理测试数据
- **测试实现细节**：测试用户行为，而非内部实现

## 调试失败的测试

```typescript
// Playwright debugging
// 1. Run in headed mode
npx playwright test --headed

// 2. Run in debug mode
npx playwright test --debug

// 3. Use trace viewer
await page.screenshot({ path: 'screenshot.png' });
await page.video()?.saveAs('video.webm');

// 4. Add test.step for better reporting
test('checkout flow', async ({ page }) => {
    await test.step('Add item to cart', async () => {
        await page.goto('/products');
        await page.getByRole('button', { name: 'Add to Cart' }).click();
    });

    await test.step('Proceed to checkout', async () => {
        await page.goto('/cart');
        await page.getByRole('button', { name: 'Checkout' }).click();
    });
});

// 5. Inspect page state
await page.pause();  // Pauses execution, opens inspector
```
