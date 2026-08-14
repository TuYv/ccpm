---
name: compose-state-and-effects
description: Use when writing or reviewing Jetpack Compose state ownership, remember state, state hoisting, screen state holders, LaunchedEffect, DisposableEffect, SideEffect, Flow collection, navigation, snackbar, analytics, or focus requests.
---
# 组合状态与副作用

## 核心原则

为每一份 UI 状态指定一个职责范围最小的所有者，然后通过生命周期与该所有者一致的副作用来执行命令式工作。组合负责渲染；状态和副作用负责安全地改变渲染结果。

## 流程

1. 盘点受影响的界面或组件中的可变 UI 状态、应用状态、事件流、应用依赖项和命令式工作。
2. 将每个状态值放在满足需求的最低层级所有者中：局部 UI 状态、提升后的状态、普通 UI 状态持有者或界面状态持有者。
3. 将应用装配和业务状态保留在界面边界；向可预览的渲染部分暴露普通 UI 状态和显式回调。
4. 选择生命周期与工作相匹配的副作用 API，并使用应触发其重启或释放的语义输入作为键。
5. 针对下述每个实质性关注点加载对应的专项参考资料。不要仅仅因为主题相近就使用某份参考资料。
6. 将帧率级读取、跨阶段回写和 `@ReadOnlyComposable` 契约交由 [Compose 性能](../compose-performance/SKILL.md)处理。
7. 当每个状态值都有唯一所有者、每个副作用都有合理的生命周期和键，并且 UI 无需应用依赖项即可预览和测试时，即可结束。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 裸露的局部 `var`、`remember { mutableStateOf(...) }`、状态列表/映射或重置状态 | [局部状态](references/local-state.md) |
| 兄弟组件共享的状态、UI 状态持有者、ViewModel/组件装配或可预览的界面边界 | [状态提升](references/state-hoisting.md) |
| `LaunchedEffect`、`DisposableEffect`、`SideEffect`、`snapshotFlow`、`rememberCoroutineScope`、`rememberUpdatedState`、`produceState`、命令式 `requestFocus`、回调、事件 Flow 收集、snackbar、导航或分析 | [副作用](references/side-effects.md) |
| 焦点所有权和键盘/电视/方向键行为 | [Compose 焦点导航](../compose-focus-navigation/SKILL.md) |
| 针对最终 UI 契约的测试或预览 | [Compose UI 测试模式](../compose-ui-testing-patterns/SKILL.md) |

## RED/GREEN 智能体场景

1. RED 将组件、收集的 `StateFlow`、导航事件和界面布局都保留在同一个可组合项中。GREEN 将装配和副作用留在界面边界，并向纯渲染部分提供不可变状态和回调。
2. 新颖案例：查询驱动仓库建议，而列表状态和焦点请求器共同协调 UI 行为。GREEN 将查询和建议放在界面状态持有者中，但将 Compose 运行时对象保留在普通 UI 状态中。
3. 反例：一个一次性的可展开徽章只有一个私有布尔值。GREEN 将其保留在局部，不引入状态持有者或副作用。