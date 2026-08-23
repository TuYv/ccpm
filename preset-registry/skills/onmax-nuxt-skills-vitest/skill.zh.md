---
name: vitest
description: Use when writing unit/integration tests for Vite projects - configure vitest.config.ts, write test suites with describe/it, create mock implementations with vi.fn and vi.mock, set up code coverage thresholds, and run tests in parallel
license: MIT
---
# Vitest

原生支持 Vite、具有 Jest 兼容 API 的测试框架。

## 适用场景

- 为 Vite 项目编写单元测试/集成测试
- 测试 Vue/React/Svelte 组件
- 模拟模块、计时器或日期
- 运行并发/并行测试
- 使用 TypeScript 进行类型测试

## 快速开始

```bash
npm i -D vitest
```

```ts
// vitest.config.ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',  // or 'jsdom' for DOM tests
  },
})
```

```ts
// example.test.ts
import { describe, expect, it, vi } from 'vitest'

describe('math', () => {
  it('adds numbers', () => {
    expect(1 + 1).toBe(2)
  })
})
```

## 参考文件

| 任务                                     | 文件                                    |
| ---------------------------------------- | --------------------------------------- |
| 配置、CLI、项目             | [config.md](references/config.md)       |
| test/describe、钩子、fixture           | [test-api.md](references/test-api.md)   |
| vi.fn、vi.mock、计时器、spy            | [mocking.md](references/mocking.md)     |
| expect、快照、覆盖率、筛选   | [utilities.md](references/utilities.md) |
| 环境、类型测试、浏览器模式 | [advanced.md](references/advanced.md)   |

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/config.md](references/config.md) - 如果要设置 vitest.config.ts、CLI 或工作区项目
- [ ] [references/test-api.md](references/test-api.md) - 如果要编写 test/describe 块、使用钩子或测试 fixture
- [ ] [references/mocking.md](references/mocking.md) - 如果要模拟模块、计时器、日期或使用 spy
- [ ] [references/utilities.md](references/utilities.md) - 如果要编写断言、快照或配置覆盖率
- [ ] [references/advanced.md](references/advanced.md) - 如果要配置测试环境、类型测试或浏览器模式

**不要一次性加载所有文件。** 只加载与你当前任务相关的文件。

## 跨 Skill 引用

- **Vue 组件测试** → 使用 `vue` skill 获取组件模式
- **库测试** → 使用 `ts-library` skill 获取库模式
- **Vite 配置** → 使用 `vite` skill 获取共享配置