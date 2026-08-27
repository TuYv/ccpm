---
name: compose-state-and-effects
description: Use when writing or reviewing Jetpack Compose state ownership, remember state, state hoisting, screen state holders, LaunchedEffect, DisposableEffect, SideEffect, Flow collection, navigation, snackbar, analytics, or focus requests.
---
# Compose 状态与副作用

## 核心原则

为每一块 UI 状态指定一个最低层级的负责所有者，然后通过生命周期跟随该所有者的副作用来执行命令式工作。组合负责渲染；状态和副作用让渲染能够安全地发生变化。

## 流程

1. 明确所请求的范围和可见的行为要求。只有当代码或任务证据表明存在生命周期、可测试性、业务或协调需求时，才将所有权变更视为一个发现。
2. 清点受影响屏幕或组件中的可变 UI 状态、应用状态、事件流、应用依赖和命令式工作。
3. 将每个状态值放置在其必要的最低层级所有者中：本地 UI 状态、提升后的状态、普通 UI 状态持有者或屏幕状态持有者。
4. 对于屏幕边界，将持久数据和意图保留在连接所有者中，将 Compose 运行时对象放在组合中或普通 UI 状态持有者中，并在可预览的内容 composable 中进行渲染，该 composable 接收不可变状态和回调。阅读 [状态提升](references/state-hoisting.md) 以了解实现形式；仅命名状态和意图并不构成该边界。
5. 选择生命周期与工作相匹配的副作用 API，并使用应触发其重启或释放的语义输入作为 key。
6. 对以下每个重要主题加载对应的专门参考资料。不要仅因为某个参考资料的主题相邻就使用它。
7. 将帧率读取、跨阶段回写和
   `@ReadOnlyComposable` 契约转交给 [Compose 性能](../compose-performance/SKILL.md)。
8. 在响应屏幕所有权审查之前，如果可见代码需要步骤 4 中的内容，请验证其中的三个屏幕接缝。
9. 当每个状态值都有一个所有者、每个副作用都有合理的生命周期和 key，并且 UI 无需应用依赖即可进行预览和测试时完成。对于仅审查的工作，如果没有剩余的、有证据支持的问题，则报告无需变更；不要臆造产品需求。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 裸露的本地 `var`、`remember { mutableStateOf(...) }`、状态列表/映射或重置状态 | [本地状态](references/local-state.md) |
| 由兄弟组件共享的状态、UI 状态持有者、ViewModel/组件连接，或可预览的屏幕边界 | [状态提升](references/state-hoisting.md) |
| `LaunchedEffect`、`DisposableEffect`、`SideEffect`、`snapshotFlow`、`rememberCoroutineScope`、`rememberUpdatedState`、`produceState`、命令式的 `requestFocus`、回调、事件 Flow 收集、snackbar、导航或分析 | [副作用](references/side-effects.md) |
| 焦点所有权以及键盘/电视/D-pad 行为 | [Compose 焦点导航](../compose-focus-navigation/SKILL.md) |
| 由此产生的 UI 契约的测试或预览 | [Compose UI 测试模式](../compose-ui-testing-patterns/SKILL.md) |