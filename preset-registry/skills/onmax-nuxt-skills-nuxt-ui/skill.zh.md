---
name: nuxt-ui
description: Use when building styled UI with @nuxt/ui v4 components - create forms with validation, implement data tables with sorting, build modal dialogs and overlays, configure Tailwind Variants theming. Use vue skill for raw component patterns, reka-ui for headless primitives.
license: MIT
---
# Nuxt UI v4

基于 Reka UI（无头组件）+ Tailwind CSS v4 + Tailwind Variants 构建的 Vue 3 和 Nuxt 4+ 组件库。

**当前稳定版本：** v4.4.0（2026 年 1 月）

## 适用场景

- 安装/配置 @nuxt/ui
- 使用 UI 组件（Button、Card、Table、Form 等）
- 自定义主题（颜色、变体、CSS 变量）
- 构建带验证的表单
- 使用浮层（Modal、Toast、CommandPalette）
- 使用组合式函数（useToast、useOverlay）

**关于 Vue 组件模式：** 使用 `vue` skill
**关于 Nuxt 路由/服务端：** 使用 `nuxt` skill

## 可用指南

| 文件                                                         | 主题                                                                             |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| **[references/installation.md](references/installation.md)** | Nuxt/Vue 设置、pnpm 注意事项、UApp 包装器、模块选项、前缀、摇树优化              |
| **[references/theming.md](references/theming.md)**           | 语义化颜色、CSS 变量、app.config.ts、Tailwind Variants                           |
| **[references/components.md](references/components.md)**     | 按类别划分的组件索引（125+ 个组件）                                              |
| **components/\*.md**                                         | 各组件的详细信息（button.md、modal.md 等）                                       |
| **[references/forms.md](references/forms.md)**               | 表单组件、验证（Zod/Valibot）、useFormField                                      |
| **[references/overlays.md](references/overlays.md)**         | Toast、Modal、Slideover、Drawer、CommandPalette                                  |
| **[references/composables.md](references/composables.md)**   | useToast、useOverlay、defineShortcuts、useScrollspy                              |

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/installation.md](references/installation.md) - 安装或配置 @nuxt/ui 时
- [ ] [references/theming.md](references/theming.md) - 自定义主题、颜色或 Tailwind Variants 时
- [ ] [references/components.md](references/components.md) - 浏览组件索引或按类别查找组件时
- [ ] [references/forms.md](references/forms.md) - 构建带验证（Zod/Valibot）的表单时
- [ ] [references/overlays.md](references/overlays.md) - 使用 Toast、Modal、Slideover、Drawer 或 CommandPalette 时
- [ ] [references/composables.md](references/composables.md) - 使用 useToast、useOverlay 或其他组合式函数时

**不要一次加载所有文件。** 只加载与你当前任务相关的文件。

## 核心概念

| 概念              | 描述                                                       |
| ----------------- | ---------------------------------------------------------- |
| UApp              | Toast、Tooltip 和浮层所必需的包装器组件                    |
| Tailwind Variants | 使用插槽、变体和 compoundVariants 实现类型安全的样式       |
| Semantic Colors   | primary、secondary、success、error、warning、info、neutral |
| Reka UI           | 无头组件原语（内置无障碍支持）                             |

> 有关无头组件原语（API 详情、无障碍模式、asChild）：请阅读 **reka-ui** skill

## 快速参考

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css']
})
```

```css
/* assets/css/main.css */
@import 'tailwindcss';
@import '@nuxt/ui';
```

```vue
<!-- app.vue - UApp wrapper required -->
<template>
  <UApp>
    <NuxtPage />
  </UApp>
</template>
```

## 资源

- [Nuxt UI 文档](https://ui.nuxt.com)
- [组件参考](https://ui.nuxt.com/components)
- [主题自定义](https://ui.nuxt.com/getting-started/theme)

---

_Token 效率：主 skill 约 300 个 token，每个子文件约 800-1200 个 token_