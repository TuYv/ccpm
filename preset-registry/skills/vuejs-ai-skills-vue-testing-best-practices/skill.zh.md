---
name: vue-testing-best-practices
version: 1.0.0
license: MIT
author: github.com/vuejs-ai
description: Use for Vue.js testing. Covers Vitest, Vue Test Utils, component testing, mocking, testing patterns, and Playwright for E2E testing.
---
Vue.js 测试的最佳实践、模式和常见陷阱。

### 测试
- 为 Vue 3 项目搭建测试基础设施 → 参见 [testing-vitest-recommended-for-vue](reference/testing-vitest-recommended-for-vue.md)
- 重构组件内部实现时测试不断失败 → 参见 [testing-component-blackbox-approach](reference/testing-component-blackbox-approach.md)
- 测试因竞态条件而间歇性失败 → 参见 [testing-async-await-flushpromises](reference/testing-async-await-flushpromises.md)
- 使用了生命周期钩子或 inject 的 Composable 无法测试 → 参见 [testing-composables-helper-wrapper](reference/testing-composables-helper-wrapper.md)
- 测试中出现 "injection Symbol(pinia) not found" 错误 → 参见 [testing-pinia-store-setup](reference/testing-pinia-store-setup.md)
- 使用 async setup 的组件在测试中无法渲染 → 参见 [testing-suspense-async-components](reference/testing-suspense-async-components.md)
- 功能已损坏但快照测试仍然通过 → 参见 [testing-no-snapshot-only](reference/testing-no-snapshot-only.md)
- 为 Vue 应用选择端到端测试框架 → 参见 [testing-e2e-playwright-recommended](reference/testing-e2e-playwright-recommended.md)
- 测试需要验证计算样式或真实 DOM 事件 → 参见 [testing-browser-vs-node-runners](reference/testing-browser-vs-node-runners.md)
- 测试使用 defineAsyncComponent 创建的组件时失败 → 参见 [async-component-testing](reference/async-component-testing.md)
- 通过 Teleport 传送的模态框内容在 wrapper 查询中找不到 → 参见 [teleport-testing-complexity](reference/teleport-testing-complexity.md)

## 参考

- [Vue.js 测试指南](https://vuejs.org/guide/scaling-up/testing)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)
