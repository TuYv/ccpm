---
name: vue-router-best-practices
description: "Vue Router 4 patterns, navigation guards, route params, and route-component lifecycle interactions."
version: 1.0.0
license: MIT
author: github.com/vuejs-ai
---
Vue Router 最佳实践、常见陷阱和导航模式。

### 导航守卫
- 使用不同参数在同一路由之间导航 → 参见 [router-beforeenter-no-param-trigger](reference/router-beforeenter-no-param-trigger.md)
- 在 beforeRouteEnter 守卫中访问组件实例 → 参见 [router-beforerouteenter-no-this](reference/router-beforerouteenter-no-this.md)
- 导航守卫发起 API 调用但未等待其完成 → 参见 [router-guard-async-await-pattern](reference/router-guard-async-await-pattern.md)
- 用户陷入无限重定向循环 → 参见 [router-navigation-guard-infinite-loop](reference/router-navigation-guard-infinite-loop.md)
- 导航守卫使用已弃用的 next() 函数 → 参见 [router-navigation-guard-next-deprecated](reference/router-navigation-guard-next-deprecated.md)

### 路由生命周期
- 在同一路由之间导航时数据陈旧 → 参见 [router-param-change-no-lifecycle](reference/router-param-change-no-lifecycle.md)
- 组件卸载后事件监听器仍然存在 → 参见 [router-simple-routing-cleanup](reference/router-simple-routing-cleanup.md)

### 设置
- 构建生产环境单页应用 → 参见 [router-use-vue-router-for-production](reference/router-use-vue-router-for-production.md)