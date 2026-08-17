---
name: vue-pinia-best-practices
description: "Pinia stores, state management patterns, store setup, and reactivity with stores."
version: 1.0.0
license: MIT
author: github.com/vuejs-ai
---
Pinia 最佳实践、常见陷阱和状态管理模式。

### Store 设置
- 启动时出现“getActivePinia was called”错误 → 参见 [pinia-no-active-pinia-error](reference/pinia-no-active-pinia-error.md)
- Setup stores 中的状态未出现在 DevTools 或 SSR 中 → 参见 [pinia-setup-store-return-all-state](reference/pinia-setup-store-return-all-state.md)

### 响应式
- 解构 Store 后，UI 不再响应式更新 → 参见 [pinia-store-destructuring-breaks-reactivity](reference/pinia-store-destructuring-breaks-reactivity.md)
- 在模板中调用 Store 方法时丢失上下文 → 参见 [store-method-binding-parentheses](reference/store-method-binding-parentheses.md)

### 状态模式
- 筛选条件在刷新后重置或无法共享 → 参见 [state-url-for-ephemeral-filters](reference/state-url-for-ephemeral-filters.md)
- 在没有 DevTools 或约定的情况下构建生产应用 → 参见 [state-use-pinia-for-large-apps](reference/state-use-pinia-for-large-apps.md)