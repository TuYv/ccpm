---
name: nuxt
description: Nuxt application development and maintenance. Use for project structure, pages and routing, data fetching, SSR-safe state, middleware, plugins, server routes, runtime config, route rules, layers, built-in components, hydration, upgrades, and testing.
license: MIT
---
# Nuxt

对于 Nuxt 生命周期、渲染、路由和服务器行为，请使用 Nuxt 自有的原语。特定于模块的行为应交由对应的模块技能处理，而不是在此重复其 API。

## 从这里开始

1. 在选择 API 之前，检查 `package.json`、锁文件、`nuxt.config.*` 和目录布局。Nuxt 功能会发生变化，因此应核实已安装的版本，而不是假定使用的是最新版本。
2. 仅打开与任务对应的参考文档。
3. 优先选择能够保留 SSR、hydration 和生成类型的最小 Nuxt 原语。
4. 在配置、模块、别名或生成类型发生更改后运行 `nuxt prepare`，然后验证受影响的运行时路径。

## 参考文档索引

- 项目结构、升级、部署模式和测试：[project-setup.md](references/project-setup.md)
- 数据获取、状态、请求上下文、cookie、head 和 hydration：[nuxt-composables.md](references/nuxt-composables.md)
- 页面、布局、导航、路由元数据和错误：[routing.md](references/routing.md)
- 路由中间件、应用插件和运行时钩子：[middleware-plugins.md](references/middleware-plugins.md)
- API 路由、服务器中间件、验证、缓存和 Nitro：[server.md](references/server.md)
- 内置组件、资源、图像和延迟 hydration：[nuxt-components.md](references/nuxt-components.md)
- Nuxt 配置、运行时配置、路由规则、层、模块、Vite 和 Nitro 选项：[nuxt-config.md](references/nuxt-config.md)

## 职责边界

- 编写或发布 Nuxt 模块时，请使用 `nuxt-modules` 技能。
- 对于 Nuxt UI、Nuxt Content、Nuxt Studio、NuxtHub、Nuxt Image、Nuxt Scripts、Nuxt SEO 或其他已安装的模块，请使用对应的模块技能。
- 对于 VueUse composable，请遵循 VueUse 官方指南。当名称重叠时，Nuxt 负责 Nuxt 生命周期和 SSR 语义；请参阅 [nuxt-composables.md](references/nuxt-composables.md#vueuse-boundary)。
- 对于不涉及 Nuxt 生命周期或渲染的组件局部响应式逻辑，请遵循 Vue 指南。

## 基础示例

```vue
<script setup lang="ts">
const { data: products, status, error } = await useFetch('/api/products')

useSeoMeta({
  title: 'Products',
  description: 'Browse the product catalog.',
})
</script>

<template>
  <main>
    <p v-if="status === 'pending'">Loading…</p>
    <p v-else-if="error">Could not load products.</p>
    <ProductList v-else :products="products ?? []" />
  </main>
</template>
```

`useFetch` 将请求与 Nuxt 的 SSR payload 集成，而 `useSeoMeta` 则参与 Nuxt 的 head 生命周期。仅当任务需要这些原语无法提供的行为时，才使用更底层的原语。