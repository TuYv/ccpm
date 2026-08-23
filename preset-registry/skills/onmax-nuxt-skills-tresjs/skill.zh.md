---
name: tresjs
description: Use when building 3D scenes with TresJS (Vue Three.js) - provides TresCanvas, composables (useTres, useLoop), Cientos helpers (OrbitControls, useGLTF, Environment), and post-processing effects
license: MIT
---
# TresJS

用于通过 Three.js 构建 3D 场景的 Vue 3 框架。提供封装 Three.js 对象的声明式组件。

**软件包：** `@tresjs/core`（必需）、`@tresjs/cientos`（辅助工具）、`@tresjs/post-processing`（特效）

## 安装

```bash
# Core (required)
pnpm add three @tresjs/core

# Helpers - controls, loaders, materials, staging
pnpm add @tresjs/cientos

# Post-processing effects
pnpm add @tresjs/post-processing
```

## 快速参考

| 正在处理...                  | 加载文件               |
| ---------------------------- | ---------------------- |
| TresCanvas、useTres、useLoop | references/core.md     |
| 控制器、加载器、材质         | references/cientos.md  |
| 泛光、故障、景深特效         | references/effects.md  |
| 常见模式、范例               | references/cookbook.md |

## 加载文件

**根据你的任务加载：**

- [ ] [references/core.md](references/core.md) - TresCanvas 设置、组合式函数、事件、图元
- [ ] [references/cientos.md](references/cientos.md) - OrbitControls、useGLTF、Environment、材质
- [ ] [references/effects.md](references/effects.md) - EffectComposer、泛光、故障、景深
- [ ] [references/cookbook.md](references/cookbook.md) - 加载模型、相机设置、动画

**不要一次加载所有文件。** 仅加载相关文件。

## 核心概念

### TresCanvas

创建 WebGL 渲染器和场景的根组件：

```vue
<script setup lang="ts">
import { TresCanvas } from '@tresjs/core'
</script>

<template>
  <TresCanvas shadows alpha>
    <TresPerspectiveCamera :position="[5, 5, 5]" />
    <TresMesh>
      <TresBoxGeometry />
      <TresMeshStandardMaterial color="orange" />
    </TresMesh>
    <TresAmbientLight :intensity="0.5" />
    <TresDirectionalLight :position="[3, 3, 3]" :intensity="1" />
  </TresCanvas>
</template>
```

### 组件命名

所有 Three.js 类都可以用带有 `Tres` 前缀的 Vue 组件形式使用：

- `THREE.PerspectiveCamera` → `<TresPerspectiveCamera />`
- `THREE.Mesh` → `<TresMesh />`
- `THREE.BoxGeometry` → `<TresBoxGeometry />`
- `THREE.MeshStandardMaterial` → `<TresMeshStandardMaterial />`

通过 `:args` prop 传递构造函数参数：

```vue
<TresPerspectiveCamera :args="[75, 1, 0.1, 1000]" />
```

### 响应式

Props 是响应式的——发生变化时会更新 3D 场景：

```vue
<script setup>
const color = ref('orange')
const position = ref([0, 0, 0])
</script>

<template>
  <TresMesh :position="position">
    <TresMeshStandardMaterial :color="color" />
  </TresMesh>
</template>
```

### Primitive 组件

直接注入现有的 Three.js 对象：

```vue
<script setup>
import { useGLTF } from '@tresjs/cientos'
const { scene } = await useGLTF('/model.glb')
</script>

<template>
  <primitive :object="scene" />
</template>
```

## 可用指南

**[references/core.md](references/core.md)** - TresCanvas props、useTres、useLoop、useGraph、事件、性能

**[references/cientos.md](references/cientos.md)** - OrbitControls、useGLTF、useTexture、Environment、Sky、材质、形状

**[references/effects.md](references/effects.md)** - EffectComposer 与 EffectComposerPmndrs 的对比、辉光、故障效果、景深、效果堆叠

**[references/cookbook.md](references/cookbook.md)** - 加载 3D 模型、带控制器的相机、动画循环、后期处理