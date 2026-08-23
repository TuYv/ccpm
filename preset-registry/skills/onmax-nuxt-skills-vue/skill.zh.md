---
name: vue
description: Use when editing .vue files, creating Vue 3 components, writing composables, or testing Vue code - provides Composition API patterns, props/emits best practices, VueUse integration, and reactive destructuring guidance
license: MIT
---
# Vue 3 开发

Vue 3 Composition API 模式、组件架构和测试实践参考。

**当前稳定版本：** Vue 3.5+，具备增强的响应式性能（内存占用减少 56%，数组追踪速度提升 10 倍）、新的 SSR 功能，以及更出色的开发者体验。

## 概述

适用于 Vue 3 项目的渐进式参考系统。仅加载与当前任务相关的文件，以尽量减少上下文用量（基础约 250 个 token，每个子文件 500-1500 个 token）。

## 何时使用

**在以下情况使用此 skill：**

- 编写 `.vue` 组件
- 创建组合式函数（`use*` 函数）
- 构建客户端工具
- 测试 Vue 组件/组合式函数

**以下情况改用 `nuxt` skill：**

- 服务器路由、API 端点
- 基于文件的路由、中间件
- Nuxt 特有模式

**对于带样式的 UI 组件：** 使用 `nuxt-ui` skill
**对于无头无障碍组件：** 使用 `reka-ui` skill
**对于 VueUse 组合式函数：** 使用 `vueuse` skill

## 快速参考

| 正在处理的内容...        | 加载文件                     |
| ------------------------ | ---------------------------- |
| `components/` 中的 `.vue` | references/components.md     |
| `composables/` 中的文件   | references/composables.md    |
| `utils/` 中的文件         | references/utils-client.md   |
| `.spec.ts` 或 `.test.ts` | references/testing.md        |
| TypeScript 模式          | references/typescript.md     |
| Vue Router 类型定义      | references/router.md         |
| 响应式（ref、watch）     | references/reactivity.md     |
| 自定义指令               | references/directives.md     |
| 提供/注入                | references/provide-inject.md |
| 边界情况、vue-tsc        | references/gotchas.md        |

## 加载文件

**根据你的任务，考虑加载以下参考文件：**

- [ ] [references/components.md](references/components.md) - 如果在 `components/` 中工作或编写 `.vue` 文件
- [ ] [references/composables.md](references/composables.md) - 如果创建组合式函数（`use*` 函数）
- [ ] [references/utils-client.md](references/utils-client.md) - 如果在 `utils/` 中工作或编写客户端工具
- [ ] [references/testing.md](references/testing.md) - 如果编写 `.spec.ts` 或 `.test.ts` 文件
- [ ] [references/typescript.md](references/typescript.md) - 如果使用 Vue TypeScript 模式或泛型
- [ ] [references/router.md](references/router.md) - 如果使用 Vue Router 或路由类型定义
- [ ] [references/reactivity.md](references/reactivity.md) - 如果使用 ref、reactive、computed、watch 或 watchEffect
- [ ] [references/directives.md](references/directives.md) - 如果创建或使用自定义指令
- [ ] [references/provide-inject.md](references/provide-inject.md) - 如果使用 provide/inject 模式
- [ ] [references/gotchas.md](references/gotchas.md) - 如果调试边界情况或水合问题

**不要一次性加载所有文件。** 仅加载与你当前任务相关的文件。

## 快速开始

```vue
<script setup lang="ts">
const { count = 0 } = defineProps<{ count?: number }>()
const emit = defineEmits<{ update: [value: number] }>()
</script>

<template>
  <button @click="emit('update', count + 1)">
    Count: {{ count }}
  </button>
</template>
```

## 可用指南

**[references/components.md](references/components.md)** - 使用响应式解构的 Props、emits 模式、用于 v-model 的 defineModel、插槽简写

**[references/composables.md](references/composables.md)** - Composition API 结构、VueUse 集成、生命周期钩子、异步模式、响应式陷阱

**[references/utils-client.md](references/utils-client.md)** - 纯函数、格式化器、验证器、转换器，以及何时不应使用工具函数

**[references/testing.md](references/testing.md)** - Vitest + @vue/test-utils、组件测试、组合式函数测试、路由模拟

**[references/typescript.md](references/typescript.md)** - 用于 provide/inject 的 InjectionKey、vue-tsc 严格模板、tsconfig 设置、泛型组件

**[references/router.md](references/router.md)** - 路由元信息类型、使用 unplugin-vue-router 的类型化参数、滚动行为、导航守卫

**[references/reactivity.md](references/reactivity.md)** - ref、reactive、computed、watch、watchEffect、响应式基础

**[references/directives.md](references/directives.md)** - 自定义指令钩子、v-focus、v-click-outside、v-tooltip 模式

**[references/provide-inject.md](references/provide-inject.md)** - InjectionKey 类型标注、应用级 provide、readonly 模式

**[references/gotchas.md](references/gotchas.md)** - 常见陷阱、vue-tsc 边缘情况、水合问题、竞态条件（来自 vuejs-ai/skills）