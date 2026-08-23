---
name: reka-ui
description: Use when building with Reka UI (headless Vue components) - provides component API, accessibility patterns, composition (asChild), controlled/uncontrolled state, virtualization, and styling integration. Formerly Radix Vue.
license: MIT
---
# Reka UI

无样式、具备无障碍支持的 Vue 3 组件原语。符合 WAI-ARIA 标准。前身为 Radix Vue。

**当前版本：** v2.8.0（2026 年 1 月）

## 何时使用

- 从头构建无头/无样式组件
- 需要符合 WAI-ARIA 标准的组件
- 使用 Nuxt UI、shadcn-vue 或其他基于 Reka 的库
- 实现无障碍表单、对话框、菜单、弹出框

**关于 Vue 模式：** 使用 `vue` skill

## 可用指南

| 文件                                                     | 主题                                                              |
| -------------------------------------------------------- | ----------------------------------------------------------------- |
| **[references/components.md](references/components.md)** | 按类别划分的组件索引（表单、日期、浮层、菜单、数据等）            |
| **components/\*.md**                                     | 各组件的详细说明（dialog.md、select.md 等）                       |

**指南**（参见 [reka-ui.com](https://reka-ui.com)）：样式、动画、组合、SSR、命名空间、日期、国际化、受控状态、上下文注入、虚拟化、迁移

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/components.md](references/components.md) - 按类别浏览组件索引或搜索特定组件时

**不要一次加载所有文件。** 只加载与当前任务相关的文件。

**对于基于 Reka UI 构建的带样式 Nuxt 组件：** 使用 **nuxt-ui** skill

## 核心概念

| 概念                    | 描述                                                               |
| ----------------------- | ------------------------------------------------------------------ |
| `asChild`               | 渲染为子元素而非包装元素，并合并 props/行为                        |
| 受控/非受控             | 受控模式使用 `v-model`，非受控模式使用 `default*` props            |
| 部件                    | 组件拆分为 Root、Trigger、Content、Portal 等                        |
| `forceMount`            | 将元素保留在 DOM 中，以供动画库使用                                |
| 虚拟化                  | 通过虚拟滚动优化大型列表（Combobox、Listbox、Tree）                |
| 上下文注入              | 从子组件访问组件上下文                                             |

## 安装

```ts
// nuxt.config.ts (auto-imports all components)
export default defineNuxtConfig({
  modules: ['reka-ui/nuxt']
})
```

```ts
import { RekaResolver } from 'reka-ui/resolver'
// vite.config.ts (with auto-import resolver)
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    Components({ resolvers: [RekaResolver()] })
  ]
})
```

## 基本模式

```vue
<!-- Dialog with controlled state -->
<script setup>
import { DialogRoot, DialogTrigger, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogDescription, DialogClose } from 'reka-ui'
const open = ref(false)
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogTrigger>Open</DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-black/50" />
      <DialogContent class="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded">
        <DialogTitle>Title</DialogTitle>
        <DialogDescription>Description</DialogDescription>
        <DialogClose>Close</DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
```

```vue
<!-- Select with uncontrolled default -->
<SelectRoot default-value="apple">
  <SelectTrigger>
    <SelectValue placeholder="Pick fruit" />
  </SelectTrigger>
  <SelectPortal>
    <SelectContent>
      <SelectViewport>
        <SelectItem value="apple"><SelectItemText>Apple</SelectItemText></SelectItem>
        <SelectItem value="banana"><SelectItemText>Banana</SelectItemText></SelectItem>
      </SelectViewport>
    </SelectContent>
  </SelectPortal>
</SelectRoot>
```

```vue
<!-- asChild for custom trigger element -->
<DialogTrigger as-child>
  <button class="my-custom-button">Open</button>
</DialogTrigger>
```

## 近期更新（v2.6.0-v2.8.0）

- **新组件**：Rating（v2.8.0）
- **ScrollArea**：新增「glimpse」滚动条模式（v2.8.0）
- **PopperContent**：新增 `hideShiftedArrow` prop（v2.8.0）
- **TimeField**：新增 `stepSnapping` 支持（v2.8.0）
- **破坏性变更**：日期组件的 `weekStartsOn` 现在与区域设置无关（v2.8.0）
- **虚拟化**：Listbox/Tree 的 `estimateSize` 接受函数（v2.7.0）
- **组合式函数**：开放 `useLocale`、`useDirection`（v2.6.0）
- **Select**：Content 新增 `disableOutsidePointerEvents` prop（v2.7.0）
- **Toast**：新增 `disableSwipe` prop（v2.6.0）

## 资源

- [Reka UI 文档](https://reka-ui.com)
- [GitHub](https://github.com/unovue/reka-ui)
- [Nuxt UI](https://ui.nuxt.com)（带样式的 Reka 组件）
- [shadcn-vue](https://www.shadcn-vue.com)（带样式的 Reka 组件）

---

_Token 效率：基础约 350 个 token，components.md 索引约 100 个 token，每个组件约 50-150 个 token_