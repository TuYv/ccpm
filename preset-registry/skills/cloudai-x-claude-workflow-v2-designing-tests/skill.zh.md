---
name: designing-tests
description: Designs and implements testing strategies for any codebase. Use when adding tests, improving coverage, setting up testing infrastructure, debugging test failures, or when asked about unit tests, integration tests, or E2E testing.
---
# 设计测试

### 何时加载

- **触发条件**：添加测试、规划测试策略、提升覆盖率、搭建测试基础设施
- **跳过条件**：不涉及测试任务的非测试代码变更

## 测试实施工作流

复制此检查清单并跟踪进度：

```
Test Implementation Progress:
- [ ] Step 1: Identify what to test
- [ ] Step 2: Select appropriate test type
- [ ] Step 3: Write tests following templates
- [ ] Step 4: Run tests and verify passing
- [ ] Step 5: Check coverage meets targets
- [ ] Step 6: Fix any failing tests
```

## 测试金字塔

应用测试金字塔以实现均衡的覆盖：

```
        /\
       /  \     E2E Tests (10%)
      /----\    - Critical user journeys
     /      \   - Slow but comprehensive
    /--------\  Integration Tests (20%)
   /          \ - Component interactions
  /------------\ - API contracts
 /              \ Unit Tests (70%)
/________________\ - Fast, isolated
                   - Business logic focus
```

## 框架选择

### JavaScript/TypeScript

| 类型     | 推荐            | 替代方案         |
| -------- | --------------- | ---------------- |
| 单元测试 | Vitest          | Jest             |
| 集成测试 | Vitest + MSW    | Jest + SuperTest |
| E2E 测试 | Playwright      | Cypress          |
| 组件测试 | Testing Library | Enzyme           |

### Python

| 类型     | 推荐                        | 替代方案          |
| -------- | --------------------------- | ----------------- |
| 单元测试 | pytest                      | unittest          |
| 集成测试 | pytest + httpx              | pytest + requests |
| E2E 测试 | Playwright                  | Selenium          |
| API 测试 | pytest + FastAPI TestClient | -                 |

### Go

| 类型     | 推荐               |
| -------- | ------------------ |
| 单元测试 | testing + testify  |
| 集成测试 | testing + httptest |
| E2E 测试 | testing + chromedp |

## 测试结构模板

### 单元测试

```javascript
describe("[Unit] ComponentName", () => {
  describe("methodName", () => {
    it("should [expected behavior] when [condition]", () => {
      // Arrange
      const input = createTestInput();

      // Act
      const result = methodName(input);

      // Assert
      expect(result).toEqual(expectedOutput);
    });

    it("should throw error when [invalid condition]", () => {
      expect(() => methodName(invalidInput)).toThrow(ExpectedError);
    });
  });
});
```

### 集成测试

```javascript
describe("[Integration] API /users", () => {
  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  it("should create user and return 201", async () => {
    const response = await request(app)
      .post("/users")
      .send({ name: "Test", email: "test@example.com" });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });
});
```

### E2E 测试

```javascript
describe("[E2E] User Registration Flow", () => {
  it("should complete registration successfully", async ({ page }) => {
    await page.goto("/register");

    await page.fill('[data-testid="email"]', "new@example.com");
    await page.fill('[data-testid="password"]', "SecurePass123!");
    await page.click('[data-testid="submit"]');

    await expect(page.locator(".welcome-message")).toBeVisible();
    await expect(page).toHaveURL("/dashboard");
  });
});
```

## 覆盖率策略

### 覆盖内容

- ✅ 业务逻辑（100%）
- ✅ 边界情况和错误处理（90% 以上）
- ✅ API 契约（100%）
- ✅ 关键用户路径（E2E）
- ⚠️ UI 组件（快照 + 交互）
- ❌ 第三方库内部实现
- ❌ 简单的 getter/setter

### 覆盖率阈值

```json
{
  "coverageThreshold": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    },
    "src/core/": {
      "branches": 95,
      "functions": 95
    }
  }
}
```

## 测试数据管理

### 工厂/构建器

```javascript
// factories/user.js
export const userFactory = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.person.fullName(),
  email: faker.internet.email(),
  createdAt: new Date(),
  ...overrides,
});

// Usage
const admin = userFactory({ role: "admin" });
```

### 固定测试数据

```javascript
// fixtures/users.json
{
  "validUser": { "name": "Test", "email": "test@example.com" },
  "invalidUser": { "name": "", "email": "invalid" }
}
```

## 模拟策略

### 何时进行模拟

- ✅ 外部 API 和服务
- ✅ 单元测试中的数据库
- ✅ 为保证确定性而模拟时间/日期
- ✅ 随机值
- ❌ 内部模块（通常不模拟）
- ❌ 被测代码

### 模拟示例

```javascript
// API mocking with MSW
import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("/api/users", () => {
    return HttpResponse.json([{ id: 1, name: "John" }]);
  }),
];

// Time mocking
vi.useFakeTimers();
vi.setSystemTime(new Date("2024-01-01"));
```

## 测试验证循环

编写测试后，运行以下验证：

```
Test Validation:
- [ ] All tests pass: `npm test`
- [ ] Coverage meets thresholds: `npm test -- --coverage`
- [ ] No flaky tests (run multiple times)
- [ ] Tests are independent (order doesn't matter)
- [ ] Test names clearly describe behavior
```

如果有任何测试失败，请先修复再继续。如果覆盖率低于目标，请为未覆盖的代码路径添加更多测试。

```bash
# Run tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- path/to/test.spec.ts

# Run in watch mode during development
npm test -- --watch
```