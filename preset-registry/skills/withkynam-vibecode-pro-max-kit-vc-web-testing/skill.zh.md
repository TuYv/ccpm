---
name: vc-web-testing
description: Web testing with Playwright, Vitest, k6. E2E/unit/integration/load/security/visual/a11y testing. Use for test automation, flakiness, Core Web Vitals, mobile gestures, cross-browser.
license: Apache-2.0
argument-hint: "[test-type] [target]"
trigger_keywords: tests, e2e, integration test, performance test
layer: helper
metadata:
  author: claudekit
  version: "3.0.0"
---
# Web 测试技能

> **输出风格：**遵循 `process/development-protocols/communication-standards.md` —— 先给答案、语言平实、不使用未解释的术语，长回复附上 TL;DR。

全面的 Web 测试：单元测试、集成测试、E2E、负载测试、安全测试、视觉回归测试、无障碍测试。

## 快速开始

```bash
npx vitest run                    # Unit tests
npx playwright test               # E2E tests
npx playwright test --ui          # E2E with UI
k6 run load-test.js               # Load tests
npx @axe-core/cli https://example.com  # Accessibility
npx lighthouse https://example.com     # Performance
```

## 测试策略（选择你的模型）

| 模型 | 结构 | 最适合 |
|-------|-----------|----------|
| 金字塔 | 单元 70% > 集成 20% > E2E 10% | 单体应用 |
| 奖杯 | 以集成为主 | 现代 SPA |
| 蜂窝 | 以契约为中心 | 微服务 |

→ `./references/testing-pyramid-strategy.md`

## 参考文档

### 核心测试
- `./references/unit-integration-testing.md` - Vitest、浏览器模式、AAA
- `./references/e2e-testing-playwright.md` - 夹具、分片、选择器
- `./references/playwright-component-testing.md` - CT 模式（生产就绪）
- `./references/component-testing.md` - React/Vue/Angular 模式

### 测试基础设施
- `./references/test-data-management.md` - 工厂、夹具、数据播种
- `./references/database-testing.md` - Testcontainers、事务
- `./references/ci-cd-testing-workflows.md` - GitHub Actions、分片
- `./references/contract-testing.md` - Pact、MSW 模式

### 跨浏览器与移动端
- `./references/cross-browser-checklist.md` - 浏览器/设备矩阵
- `./references/mobile-gesture-testing.md` - 触摸、滑动、屏幕方向

### 性能与质量
- `./references/performance-core-web-vitals.md` - LCP/CLS/INP、Lighthouse CI
- `./references/visual-regression.md` - 截图对比
- `./references/test-flakiness-mitigation.md` - 稳定性策略

### 无障碍与安全
- `./references/accessibility-testing.md` - WCAG、axe-core
- `./references/security-testing-overview.md` - OWASP Top 10
- `./references/security-checklists.md` - 认证、API、请求头

### API 与负载
- `./references/api-testing.md` - Supertest、GraphQL
- `./references/load-testing-k6.md` - k6 模式

### 检查清单
- `./references/pre-release-checklist.md` - 完整的发布检查清单
- `./references/functional-testing-checklist.md` - 功能测试

## 脚本

### 初始化 Playwright 项目
```bash
node ./scripts/init-playwright.js [--ct] [--dir <path>]
```
创建符合最佳实践的 Playwright 设置：配置、夹具、示例测试。

### 分析测试结果
```bash
node ./scripts/analyze-test-results.js \
  --playwright test-results/results.json \
  --vitest coverage/vitest.json \
  --output markdown
```
将 Playwright/Vitest/JUnit 结果解析为统一的摘要。

## CI/CD 集成

```yaml
jobs:
  test:
    steps:
      - run: pnpm run test:unit      # Gate 1: Fast fail
      - run: pnpm run test:e2e
