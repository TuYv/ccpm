---
name: vue-testing-best-practices
version: 1.0.0
license: MIT
author: github.com/vuejs-ai
description: Use for Vue.js testing. Covers Vitest, Vue Test Utils, component testing, mocking, testing patterns, and Playwright for E2E testing.
---
Vue.js 测试最佳实践、模式和常见陷阱。

### 测试
- 为 Vue 3 项目搭建测试基础设施 → 参见 [testing-vitest-recommended-for-vue](reference/testing-vitest-recommended-for-vue.md)
- 重构组件内部实现时测试总是失败 → 参见 [testing-component-blackbox-approach](reference/testing-component-blackbox-approach.md)
- 测试因竞态条件而间歇性失败 → 参见 [testing-async-await-flushpromises](reference/testing-async-await-flushpromises.md)
- 使用生命周期钩子或 inject 的组合式函数无法测试 → 参见 [testing-composables-helper-wrapper](reference/testing-composables-helper-wrapper.md)
- 测试中出现 "injection Symbol(pinia) not found" 错误 → 参见 [testing-pinia-store-setup](reference/testing-pinia-store-setup.md)
- 使用异步 setup 的组件无法在测试中渲染 → 参见 [testing-suspense-async-components](reference/testing-suspense-async-components.md)
- 即使功能已损坏，快照测试仍然通过 → 参见 [testing-no-snapshot-only](reference/testing-no-snapshot-only.md)
- 为 Vue 应用选择端到端测试框架 → 参见 [testing-e2e-playwright-recommended](reference/testing-e2e-playwright-recommended.md)
- 测试需要验证计算后的样式或真实 DOM 事件 → 参见 [testing-browser-vs-node-runners](reference/testing-browser-vs-node-runners.md)
- 测试使用 defineAsyncComponent 创建的组件时失败 → 参见 [async-component-testing](reference/async-component-testing.md)
- 无法在 wrapper 查询中找到传送后的模态框内容 → 参见 [teleport-testing-complexity](reference/teleport-testing-complexity.md)

## 参考资料

- [Vue.js 测试指南](https://vuejs.org/guide/scaling-up/testing)
- [Vue Test Utils](https://test-utils.vuejs.org/)
- [Vitest 文档](https://vitest.dev/)
- [Playwright 文档](https://playwright.dev/)