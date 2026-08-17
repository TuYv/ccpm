---
name: vue-best-practices
description: MUST be used for Vue.js tasks. Strongly recommends Composition API with `<script setup>` and TypeScript as the standard approach. Covers Vue 3, SSR, Volar, vue-tsc. Load for any Vue, .vue files, Vue Router, Pinia, or Vite with Vue work. ALWAYS use Composition API unless the project explicitly requires Options API.
license: MIT
metadata:
  author: github.com/vuejs-ai
  version: "18.0.0"
---
# Vue 最佳实践工作流

将此技能作为一套指令使用。除非用户明确要求采用不同的顺序，否则请按顺序执行此工作流。

## 核心原则
- **保持状态可预测：** 确保单一事实来源，其余所有内容均由此派生。
- **让数据流清晰明确：** 大多数情况下采用 Props 向下传递、Events 向上传递。
- **优先使用小型、职责集中的组件：** 更易于测试、复用和维护。
- **避免不必要的重新渲染：** 合理使用计算属性和侦听器。
- **可读性很重要：** 编写清晰且具有自解释性的代码。

## 1) 编码前确认架构（必需）

- 默认技术栈：Vue 3 + Composition API + `<script setup lang="ts">`。
- 如果项目明确使用 Options API，请加载 `vue-options-api-best-practices` 技能（如可用）。
- 如果项目明确使用 JSX，请加载 `vue-jsx-best-practices` 技能（如可用）。

### 1.1 必读的核心参考资料（必需）

- 在实现任何 Vue 任务之前，确保阅读并应用以下核心参考资料：
  - `references/reactivity.md`
  - `references/sfc.md`
  - `references/component-data-flow.md`
  - `references/composables.md`
- 在整个任务期间，始终将这些参考资料保留在当前工作上下文中，而不是仅在出现特定问题时才使用。

### 1.2 编码前规划组件边界（必需）

对于任何非简单功能，在实现之前创建一份简要的组件结构图。

- 用一句话定义每个组件的单一职责。
- 默认将入口/根组件和路由级视图组件作为组合界面。
- 除非任务有意设计为一个微型单文件演示，否则应将功能 UI 和功能逻辑移出入口/根组件/视图组件。
- 在结构图中定义每个子组件的 props/emits 契约。
- 添加多个组件时，优先采用功能文件夹布局（`components/<feature>/...`、`composables/use<Feature>.ts`）。

## 2) 应用 Vue 必备基础知识（必需）

这些是必须掌握的基础知识。在每个 Vue 任务中，都应使用第 `1.1` 节已加载的核心参考资料来应用以下所有内容。

### 响应式

- 第 `1.1` 节中的必读参考资料：[reactivity](references/reactivity.md)
- 尽量减少源状态（`ref`/`reactive`），所有可派生的内容都使用 `computed`。
- 如有需要，使用侦听器处理副作用。
- 避免在模板中重复执行开销较大的逻辑。

### SFC 结构与模板安全

- 第 `1.1` 节中的必读参考资料：[sfc](references/sfc.md)
- 按以下顺序组织 SFC 各部分：`<script>` → `<template>` → `<style>`。
- 确保 SFC 职责集中；拆分大型组件。
- 保持模板声明式；将分支逻辑和派生逻辑移至脚本中。
- 应用 Vue 模板安全规则（`v-html`、列表渲染、条件渲染选项）。

### 保持组件职责集中

当一个组件具有**多个明确职责**时（例如数据编排 + UI，或多个相互独立的 UI 区域），应将其拆分。

- 优先采用**较小的组件 + 可组合函数**，而不是一个“巨型组件”
- 将 **UI 区域**移至子组件中（props 传入，events 传出）。
- 将**状态/副作用**移至可组合函数（`useXxx()`）中。

应用客观的拆分触发条件。如果满足**任一**条件，则拆分组件：

- 它同时负责编排/状态，以及多个区块的大量展示性标记。
- 它包含 3 个以上不同的 UI 区块（例如：表单、筛选器、列表、页脚/状态）。
- 某个模板块被重复使用，或可以变为可复用内容（条目行、卡片、列表项）。

入口/根组件和路由视图规则：

- 保持入口/根组件和路由视图组件精简：仅包含应用外壳/布局、提供者连接以及功能组合。
- 当功能包含相互独立的部分时，不要在入口/根组件/视图组件中放置完整的功能实现。
- 对于 CRUD/列表功能（待办事项、表格、目录、收件箱），至少拆分为：
  - 功能容器组件
  - 输入/表单组件
  - 列表（和/或条目）组件
  - 页脚/操作或筛选/状态组件
- 仅允许非常小的一次性演示采用单文件实现；如果选择这种方式，请明确说明无须拆分的原因。

### 组件数据流

- `1.1` 中的必读参考资料：[component-data-flow](references/component-data-flow.md)
- 使用属性向下传递、事件向上触发作为主要模型。
- 仅将 `v-model` 用于真正的双向组件契约。
- 仅将提供/注入用于深层组件树依赖或共享上下文。
- 根据需要使用 `defineProps`、`defineEmits` 和 `InjectionKey`，确保契约明确且具有类型。

### 组合式函数

- `1.1` 中的必读参考资料：[composables](references/composables.md)
- 当逻辑可复用、有状态或涉及大量副作用时，将其提取到组合式函数中。
- 保持组合式函数的 API 小巧、类型明确且行为可预测。
- 将功能逻辑与展示性组件分离。

## 3) 仅在需求要求时考虑可选功能

### 3.1 标准可选功能

不要默认添加以下功能。仅当存在相应需求时，才加载匹配的参考资料。

- 插槽：父组件需要控制子组件的内容/布局 -> [component-slots](references/component-slots.md)
- 透传属性：包装器/基础组件必须安全地转发属性/事件 -> [component-fallthrough-attrs](references/component-fallthrough-attrs.md)
- 内置组件 `<KeepAlive>`，用于缓存有状态视图 -> [component-keep-alive](references/component-keep-alive.md)
- 内置组件 `<Teleport>`，用于覆盖层/传送门 -> [component-teleport](references/component-teleport.md)
- 内置组件 `<Suspense>`，用于异步子树的回退边界 -> [component-suspense](references/component-suspense.md)
- 动画相关功能：选择符合所需运动行为的最简单方法。
  - 内置组件 `<Transition>`，用于进入/离开效果 -> [transition](references/component-transition.md)
  - 内置组件 `<TransitionGroup>`，用于为列表变更添加动画 -> [transition-group](references/component-transition-group.md)
  - 基于类的动画，用于非进入/离开效果 -> [animation-class-based-technique](references/animation-class-based-technique.md)
  - 状态驱动的动画，用于由用户输入驱动的动画 -> [animation-state-driven-technique](references/animation-state-driven-technique.md)

### 3.2 较少使用的可选功能

仅在有明确的产品或技术需求时使用这些功能。

- 指令：行为是 DOM 特有的，不适合通过组合式函数/组件实现 -> [directives](references/directives.md)
- 异步组件：体积较大或很少使用的 UI 应采用懒加载 -> [component-async](references/component-async.md)
- 仅当模板无法表达需求时才使用渲染函数 -> [render-functions](references/render-functions.md)
- 当行为必须在整个应用范围内安装时使用插件 -> [plugins](references/plugins.md)
- 状态管理模式：应用范围内的共享状态跨越了功能边界 -> [state-management](references/state-management.md)

## 4) 在行为正确后再进行性能优化

性能工作应在功能实现之后进行。在核心行为实现并验证之前，不要进行优化。

- 大型列表的渲染瓶颈 -> [perf-virtualize-large-lists](references/perf-virtualize-large-lists.md)
- 静态子树发生不必要的重新渲染 -> [perf-v-once-v-memo-directives](references/perf-v-once-v-memo-directives.md)
- 高频列表路径中的过度抽象 -> [perf-avoid-component-abstraction-in-lists](references/perf-avoid-component-abstraction-in-lists.md)
- 开销较大的更新触发过于频繁 -> [updated-hook-performance](references/updated-hook-performance.md)

## 5) 完成前的最终自检

- 核心行为正常工作并符合需求。
- 已阅读并应用所有必读参考资料。
- 响应式模型精简且可预测。
- 遵循 SFC 结构和模板规则。
- 组件职责集中且拆分合理，并在需要时进行拆分。
- 除非存在明确的小型演示例外，否则入口/根组件和路由视图组件应保持为组合层。
- 组件拆分决策明确且合理（职责边界清晰）。
- 数据流契约明确且具有类型。
- 在复用需求或复杂度足以证明其必要性时使用组合式函数。
- 如适用，已将状态/副作用移入组合式函数
- 仅在需求明确要求时使用可选功能。
- 仅在功能完成后才应用性能改动。