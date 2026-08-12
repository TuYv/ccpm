---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.
---
# 测试驱动开发工作流

此技能确保所有代码开发都遵循 TDD 原则，并具备全面的测试覆盖率。

## 何时启用

- 编写新特性或新功能
- 修复缺陷或问题
- 重构现有代码
- 添加 API 端点
- 创建新组件

## 核心原则

### 1. 先写测试，再写代码
始终先编写测试，然后实现代码以使测试通过。

### 2. 覆盖率要求
- 最低 80% 覆盖率（单元测试 + 集成测试 + E2E 测试）
- 覆盖所有边缘情况
- 测试错误场景
- 验证边界条件

### 3. 测试类型

#### 单元测试
- 独立函数和工具
- 组件逻辑
- 纯函数
- 辅助函数和工具

#### 集成测试
- API 端点
- 数据库操作
- 服务交互
- 外部 API 调用

#### E2E 测试（Playwright）
- 关键用户流程
- 完整工作流
- 浏览器自动化
- UI 交互

## TDD 工作流步骤

### 步骤 0：检测测试运行器

不要假定使用 `npm test`。以下步骤和示例中的命令使用 `<test>`、`<test-watch>` 和 `<coverage>` 作为项目实际运行器的占位符。开始之前先确定一次：

1. **运行包管理器检测器**（随 ECC 提供）：

   ```bash
   node scripts/setup-package-manager.js --detect
   ```

   它会按以下顺序确定包管理器（npm / pnpm / yarn / bun）：`CLAUDE_PACKAGE_MANAGER`、`.claude/package-manager.json`、`package.json` 的 `packageManager` 字段、锁文件，最后是全局配置。

2. **区分包管理器和测试运行器——它们并不相同。** 项目可以使用 Bun 安装依赖项，但仍然运行 Jest 或 Vitest。检查 `package.json` 中的 `scripts.test` 和测试文件：
   - `scripts.test` 调用 `jest` / `vitest` -> 通过检测到的包管理器运行（`npm test`、`pnpm test`、`yarn test` 或 `bun run test`）。
   - `scripts.test` 是 `bun test`，或者测试文件包含 `import { test, expect } from "bun:test"`，又或者不存在 jest/vitest 配置但存在 Bun -> 使用 **Bun 原生运行器**（`bun test`）。请参阅下方的 [Bun 原生测试模式](#bun-native-test-pattern-buntest)。

运行器命令矩阵：

| 运行器 | `<test>` | `<test-watch>` | `<coverage>` | `<lint>` |
|--------|----------|----------------|--------------|----------|
| npm | `npm test` | `npm test -- --watch` | `npm run test:coverage` | `npm run lint` |
| pnpm | `pnpm test` | `pnpm test --watch` | `pnpm test:coverage` | `pnpm lint` |
| yarn | `yarn test` | `yarn test --watch` | `yarn test:coverage` | `yarn lint` |
| Bun（脚本运行 jest/vitest） | `bun run test` | `bun run test --watch` | `bun run test:coverage` | `bun run lint` |
| Bun（原生 `bun:test`） | `bun test` | `bun test --watch` | `bun test --coverage` | `bun run lint` |

> `bun test`（Bun 的内置运行器）与 `bun run test`（运行 `package.json` 中的 `test` 脚本）**并不相同**。选错是常见的失败原因——例如，在仅支持 ESM 的项目中通过 `npx`/`bun run` 调用 Jest 会导致运行失败，而 `bun test` 则可以原生运行测试套件。在 RED 阶段的门禁检查之前，确认项目预期使用哪一种，然后在下文所有出现 `npm test` 的位置替换 `<test>` / `<coverage>`。

### 第 1 步：编写用户旅程
```
As a [role], I want to [action], so that [benefit]

Example:
As a user, I want to search for markets semantically,
so that I can find relevant markets even without exact keywords.
```

### 第 2 步：生成测试用例
针对每个用户旅程，创建全面的测试用例：

```typescript
describe('Semantic Search', () => {
  it('returns relevant markets for query', async () => {
    // Test implementation
  })

  it('handles empty query gracefully', async () => {
    // Test edge case
  })

  it('falls back to substring search when Redis unavailable', async () => {
    // Test fallback behavior
  })

  it('sorts results by similarity score', async () => {
    // Test sorting logic
  })
})
```

### 第 3 步：运行测试（测试应该失败）
```bash
<test>
# Tests should fail - we haven't implemented yet
```

### 第 4 步：实现代码
编写使测试通过所需的最少代码：

```typescript
// Implementation guided by tests
export async function searchMarkets(query: string) {
  // Implementation here
}
```

### 第 5 步：再次运行测试
```bash
<test>
# Tests should now pass
```

### 第 6 步：重构
在保持测试通过的同时改进代码质量：
- 消除重复
- 改进命名
- 优化性能
- 增强可读性

### 第 7 步：验证覆盖率
```bash
<coverage>
# Verify 80%+ coverage achieved
```

## 测试模式

### 单元测试模式（Jest/Vitest）
```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)

    fireEvent.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

### Bun 原生测试模式（`bun:test`）

当项目使用 Bun 的内置运行器时（参见[第 0 步](#step-0-detect-the-test-runner)），从 `bun:test` 导入并使用 `bun test` 运行，而不是 `bun run test`。其 API 类似 Jest，因此 `describe` / `it` / `expect` 和大多数匹配器都可以沿用。有关运行时、安装和打包器的详细信息，请参阅 `bun-runtime` skill。

```typescript
import { describe, it, expect, mock } from 'bun:test'
import { searchMarkets } from './search'

describe('searchMarkets', () => {
  it('returns an empty list for an empty query', async () => {
    expect(await searchMarkets('')).toEqual([])
  })

  it('sorts results by similarity score', async () => {
    const results = await searchMarkets('election')
    expect(results).toEqual([...results].sort((a, b) => b.score - a.score))
  })
})
```

```bash
bun test              # run once (RED/GREEN gate)
bun test --watch      # watch mode during development
bun test --coverage   # coverage report
```

- 使用 `bun:test` 中的 `mock.module(...)` / `mock(...)` 模拟模块，而不是使用 `jest.mock(...)`。
- 在 `bunfig.toml` 的 `[test]` 下配置覆盖率阈值（例如 `coverageThreshold`），而不是使用 Jest 的 `coverageThresholds` 配置块。

### API 集成测试模式
```typescript
import { NextRequest } from 'next/server'
import { GET } from './route'

describe('GET /api/markets', () => {
  it('returns markets successfully', async () => {
    const request = new NextRequest('http://localhost/api/markets')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(Array.isArray(data.data)).toBe(true)
  })

  it('validates query parameters', async () => {
    const request = new NextRequest('http://localhost/api/markets?limit=invalid')
    const response = await GET(request)

    expect(response.status).toBe(400)
  })

  it('handles database errors gracefully', async () => {
    // Mock database failure
    const request = new NextRequest('http://localhost/api/markets')
    // Test error handling
  })
})
```

### E2E 测试模式（Playwright）
```typescript
import { test, expect } from '@playwright/test'

test('user can search and filter markets', async ({ page }) => {
  // Navigate to markets page
  await page.goto('/')
  await page.click('a[href="/markets"]')

  // Verify page loaded
  await expect(page.locator('h1')).toContainText('Markets')

  // Search for markets
  await page.fill('input[placeholder="Search markets"]', 'election')

  // Wait for debounce and results
  await page.waitForTimeout(600)

  // Verify search results displayed
  const results = page.locator('[data-testid="market-card"]')
  await expect(results).toHaveCount(5, { timeout: 5000 })

  // Verify results contain search term
  const firstResult = results.first()
  await expect(firstResult).toContainText('election', { ignoreCase: true })

  // Filter by status
  await page.click('button:has-text("Active")')

  // Verify filtered results
  await expect(results).toHaveCount(3)
})

test('user can create a new market', async ({ page }) => {
  // Login first
  await page.goto('/creator-dashboard')

  // Fill market creation form
  await page.fill('input[name="name"]', 'Test Market')
  await page.fill('textarea[name="description"]', 'Test description')
  await page.fill('input[name="endDate"]', '2025-12-31')

  // Submit form
  await page.click('button[type="submit"]')

  // Verify success message
  await expect(page.locator('text=Market created successfully')).toBeVisible()

  // Verify redirect to market page
  await expect(page).toHaveURL(/\/markets\/test-market/)
})
```

## 测试文件组织结构

```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   ├── Button.test.tsx          # Unit tests
│   │   └── Button.stories.tsx       # Storybook
│   └── MarketCard/
│       ├── MarketCard.tsx
│       └── MarketCard.test.tsx
├── app/
│   └── api/
│       └── markets/
│           ├── route.ts
│           └── route.test.ts         # Integration tests
└── e2e/
    ├── markets.spec.ts               # E2E tests
    ├── trading.spec.ts
    └── auth.spec.ts
```

## 模拟外部服务

### Supabase 模拟
```typescript
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => Promise.resolve({
          data: [{ id: 1, name: 'Test Market' }],
          error: null
        }))
      }))
    }))
  }
}))
```

### Redis 模拟
```typescript
jest.mock('@/lib/redis', () => ({
  searchMarketsByVector: jest.fn(() => Promise.resolve([
    { slug: 'test-market', similarity_score: 0.95 }
  ])),
  checkRedisHealth: jest.fn(() => Promise.resolve({ connected: true }))
}))
```

### OpenAI 模拟
```typescript
jest.mock('@/lib/openai', () => ({
  generateEmbedding: jest.fn(() => Promise.resolve(
    new Array(1536).fill(0.1) // Mock 1536-dim embedding
  ))
}))
```

## 测试覆盖率验证

### 运行覆盖率报告
```bash
<coverage>
```

### 覆盖率阈值
```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## 应避免的常见测试错误

### 失败：错误：测试实现细节
```typescript
// Don't test internal state
expect(component.state.count).toBe(5)
```

### 通过：正确：测试用户可见的行为
```typescript
// Test what users see
expect(screen.getByText('Count: 5')).toBeInTheDocument()
```

### 失败：错误：脆弱的选择器
```typescript
// Breaks easily
await page.click('.css-class-xyz')
```

### 通过：正确：语义化选择器
```typescript
// Resilient to changes
await page.click('button:has-text("Submit")')
await page.click('[data-testid="submit-button"]')
```

### 失败：错误：测试未隔离
```typescript
// Tests depend on each other
test('creates user', () => { /* ... */ })
test('updates same user', () => { /* depends on previous test */ })
```

### 通过：正确：相互独立的测试
```typescript
// Each test sets up its own data
test('creates user', () => {
  const user = createTestUser()
  // Test logic
})

test('updates user', () => {
  const user = createTestUser()
  // Update logic
})
```

## 持续测试

### 开发期间的监听模式
```bash
<test-watch>
# Tests run automatically on file changes
```

### 提交前钩子
```bash
# Runs before every commit
<test> && <lint>
```

### CI/CD 集成
```yaml
# GitHub Actions
- name: Run Tests
  run: <coverage>
- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## 最佳实践

1. **先编写测试** - 始终采用 TDD
2. **每个测试只进行一次断言** - 聚焦单一行为
3. **使用描述性的测试名称** - 说明测试的内容
4. **准备-执行-断言** - 清晰的测试结构
5. **模拟外部依赖项** - 隔离单元测试
6. **测试边界情况** - Null、undefined、空值、大值
7. **测试错误路径** - 不只测试正常路径
8. **保持测试快速** - 每个单元测试 < 50ms
9. **测试后进行清理** - 不产生副作用
10. **审查覆盖率报告** - 识别缺口

## 成功指标

- 代码覆盖率达到 80% 以上
- 所有测试均通过（绿色）
- 没有跳过或禁用的测试
- 测试执行速度快（单元测试 < 30s）
- E2E 测试覆盖关键用户流程
- 测试能在生产环境出现错误之前捕获错误

---

**请记住**：测试不是可选项。它们是一张安全网，让你能够放心地进行重构、快速开发，并保障生产环境的可靠性。