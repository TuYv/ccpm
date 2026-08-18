---
name: compose-state-and-effects
description: Use when writing or reviewing Jetpack Compose state ownership, remember state, state hoisting, screen state holders, LaunchedEffect, DisposableEffect, SideEffect, Flow collection, navigation, snackbar, analytics, or focus requests.
---
# Compose 状态与副作用

## 核心原则

为每一部分 UI 状态指定一个最低层级且职责适当的所有者，然后通过生命周期跟随该所有者的副作用来执行命令式工作。组合负责渲染；状态和副作用让渲染能够安全地发生变化。

## 过程

1. 明确所请求的范围和可见的行为要求。只有当代码或任务证据表明存在生命周期、可测试性、业务或协调方面的需求时，才将所有权变更视为发现项。
2. 清点受影响屏幕或组件中的可变 UI 状态、应用状态、事件流、应用依赖项以及命令式工作。
3. 将每个状态值放置在其所需的最低层级所有者中：本地 UI 状态、提升后的状态、普通 UI 状态持有者或屏幕状态持有者。
4. 将应用接线和业务状态保留在屏幕边界。当屏幕持有者拥有 Compose 运行时对象时，明确建议使用一个单独且可预览的内容 composable，该 composable 接收不可变状态和事件回调；将运行时对象保留在组合中或普通 UI 状态持有者中。仅仅建议使用不可变状态和意图，并不能建立这一渲染边界。
5. 选择生命周期与工作相匹配的副作用 API，并使用应触发其重启或释放的语义输入作为 key。
6. 为以下每个实质性关注点加载对应的重点参考资料。不要仅因为某个参考资料的主题相邻就使用它。
7. 将帧速率读取、跨阶段回写以及 `@ReadOnlyComposable` 契约交给 [Compose 性能](../compose-performance/SKILL.md)。
8. 在回应屏幕所有权审查之前，当可见代码需要时，确认答案明确指出全部三个必需的接缝：屏幕边界处的持久数据和意图、组合中或普通 UI 状态持有者中的运行时 UI 对象，以及其输入为不可变状态和事件回调的可预览内容 composable。
9. 当每个状态值都有一个所有者、每个副作用都有合理的生命周期和 key，并且 UI 无需应用依赖即可进行预览和测试时完成。对于仅审查性质的工作，如果没有基于证据的问题遗留，则报告无需更改；不要臆造产品需求。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 裸露的本地 `var`、`remember { mutableStateOf(...) }`、状态列表/映射或重置状态 | [本地状态](references/local-state.md) |
| 由兄弟组件共享的状态、UI 状态持有者、ViewModel/组件接线或可预览的屏幕边界 | [状态提升](references/state-hoisting.md) |
| `LaunchedEffect`、`DisposableEffect`、`SideEffect`、`snapshotFlow`、`rememberCoroutineScope`、`rememberUpdatedState`、`produceState`、命令式的 `requestFocus`、回调、事件 Flow 收集、snackbar、导航或分析 | [副作用](references/side-effects.md) |
| 焦点所有权以及键盘/TV/D-pad 行为 | [Compose 焦点导航](../compose-focus-navigation/SKILL.md) |
| 生成的 UI 契约的测试或预览 | [Compose UI 测试模式](../compose-ui-testing-patterns/SKILL.md) |

## RED/GREEN 代理场景

1. RED 将组件、收集到的 `StateFlow`、导航事件和屏幕布局放在同一个可组合函数中。GREEN 将连接逻辑和副作用留在屏幕边界，并向普通渲染提供不可变状态和回调。
2. 新颖案例：查询驱动仓库建议，同时列表状态和焦点请求器协调 UI 行为。GREEN 将查询和建议放入屏幕状态持有器，但将 Compose 运行时对象保留在普通 UI 状态中。
3. 反例：一次性的可展开徽章只有一个私有 Boolean。GREEN 将其保留在本地，不引入状态持有器或副作用。
4. 反例：访问器读取共享快照状态，且没有要求每个实例相互独立。GREEN 不会凭空造成所有权泄漏。