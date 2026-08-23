---
name: motion
description: Use when adding animations with Motion Vue (motion-v) - provides motion component API, gesture animations, scroll-linked effects, layout transitions, and composables for Vue 3/Nuxt
license: MIT
---
# Motion Vue (motion-v)

适用于 Vue 3 和 Nuxt 的动画库。以极小的包体积提供可用于生产环境的硬件加速动画。

**当前稳定版本：** motion-v 1.x——Motion（原 Framer Motion）的 Vue 移植版

## 概述

Motion Vue 动画的渐进式参考文档。仅加载与当前任务相关的文件（基础内容约 200 个 token，每个子文件约 500-1500 个 token）。

## 使用场景

**以下情况使用 Motion Vue：**

- 简单的声明式动画（淡入淡出、滑动、缩放）
- 基于手势的交互（悬停、点击、拖拽）
- 与滚动联动的动画
- 布局动画和共享元素过渡
- 弹簧物理动画

**可考虑的替代方案：**

- **GSAP**——复杂时间轴、SVG 变形、滚动触发序列
- **@vueuse/motion**——API 更简单、功能更少、包体积更小
- **CSS 动画**——无需 JS 的简单过渡

## 安装

```bash
# Vue 3
pnpm add motion-v

# Nuxt 3
pnpm add motion-v @vueuse/nuxt
```

```ts
// nuxt.config.ts - Nuxt 3 setup
export default defineNuxtConfig({
  modules: ['motion-v/nuxt'],
})
```

## 快速参考

| 当前任务                     | 加载文件                  |
| ---------------------------- | ------------------------- |
| Motion 组件、手势            | references/components.md  |
| useMotionValue、useScroll    | references/composables.md |
| 动画示例、模式               | references/examples.md    |

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/components.md](references/components.md)——使用 Motion 组件、手势或布局动画时
- [ ] [references/composables.md](references/composables.md)——使用 useMotionValue、useScroll、useSpring 或 animate() 时
- [ ] [references/examples.md](references/examples.md)——查找动画模式或灵感时

**不要一次性加载所有文件。** 仅加载与你当前任务相关的文件。

## 核心概念

### Motion 组件

渲染任何具备动画能力的 HTML/SVG 元素：

```vue
<script setup lang="ts">
import { motion } from 'motion-v'
</script>

<template>
  <motion.div
    :initial="{ opacity: 0, y: 20 }"
    :animate="{ opacity: 1, y: 0 }"
    :exit="{ opacity: 0, y: -20 }"
    :transition="{ duration: 0.3 }"
  >
    Animated content
  </motion.div>
</template>
```

### 手势动画

```vue
<motion.button
  :whileHover="{ scale: 1.05 }"
  :whilePress="{ scale: 0.95 }"
  :transition="{ type: 'spring', stiffness: 400 }"
>
  Click me
</motion.button>
```

### 滚动动画

```vue
<motion.div
  :initial="{ opacity: 0 }"
  :whileInView="{ opacity: 1 }"
  :viewport="{ once: true, margin: '-100px' }"
>
  Appears on scroll
</motion.div>
```

## 可用指南

**[references/components.md](references/components.md)**——Motion 组件变体、动画属性、手势属性、布局动画、过渡配置

**[references/composables.md](references/composables.md)**——useMotionValue、useSpring、useTransform、useScroll、useInView、animate()

**[references/examples.md](references/examples.md)**——外部资源、组件库、动画模式和灵感