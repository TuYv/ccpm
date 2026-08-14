---
name: compose-state-holder-ui-split
description: Use when a Jetpack Compose screen-level composable takes a ViewModel/component/controller, collects state or effects, handles navigation/snackbars, or wires callbacks while also rendering layout.
---
# Compose：状态持有者/UI 分离

## 核心原则

将状态持有者的接线逻辑与 UI 渲染分离。状态持有者 composable 负责与 ViewModel、组件、Flow、导航和副作用交互。UI composable 接收普通的不可变 UI 状态和回调，并描述布局。

这样可以让屏幕更易于预览、测试，也更易于在 Android、Desktop、TV 和 KMP/CMP 目标平台之间复用。

## 何时使用此 Skill

当 Compose 屏幕存在以下情况时，请使用此 Skill：

- 直接接收 ViewModel、组件、控制器、导航器、仓库或服务。
- 在负责大部分 UI 布局的同一个函数中收集应用/业务状态或副作用。
- 将整个状态持有者传递给子 composable，而不是显式传递状态和回调。
- 由于需要依赖注入、导航、生命周期或伪服务而难以预览。
- UI 测试必须构建完整的应用栈，才能验证一个简单的布局分支。

## 模式

使用一个小型的公开状态持有者 composable：

```kotlin
@Composable
fun ProfileScreen(component: ProfileComponent, modifier: Modifier = Modifier) {
    val state by component.state.collectAsStateWithLifecycle()

    ProfileScreen(
        state = state,
        onNameChange = component::onNameChange,
        onSaveClick = component::save,
        onBackClick = component::back,
        modifier = modifier,
    )
}
```

然后将 UI 放入一个完全不了解状态持有者的普通 composable 中：

```kotlin
@Composable
fun ProfileScreen(
    state: ProfileUiState,
    onNameChange: (String) -> Unit,
    onSaveClick: () -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    ProfileContent(
        name = state.name,
        isSaving = state.isSaving,
        canSave = state.canSave,
        onNameChange = onNameChange,
        onSaveClick = onSaveClick,
        onBackClick = onBackClick,
        modifier = modifier,
    )
}
```

可以使用私有内容函数拆分布局：

```kotlin
@Composable
private fun ProfileContent(
    name: String,
    isSaving: Boolean,
    canSave: Boolean,
    onNameChange: (String) -> Unit,
    onSaveClick: () -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Layout only.
}
```

## 经验法则

| 关注点 | 状态持有者 composable | UI composable |
|---|---|---|
| 收集 ViewModel/组件状态 | 是 | 否 |
| 收集一次性副作用 | 是，或者使用一个小型的同级副作用处理器 | 通常不 |
| 持有通过依赖注入获得的对象 | 是 | 否 |
| 接收不可变 UI 状态 | 通常将其透传 | 是 |
| 接收用于处理用户事件的 lambda | 负责接线 | 负责调用 |
| 负责布局、修饰符、语义和测试标签 | 否/尽量少 | 是 |
| 负责滚动、焦点、文本输入、动画和交互等 UI 局部状态 | 有时为其提供初始值 | 是 |
| 便于预览/截图 | 不一定 | 是 |

“UI composable 中不进行收集”这一规则针对的是应用/业务状态和副作用流。普通 UI composable 仍然可以持有 UI 局部的框架状态：`rememberScrollState`、`rememberLazyListState`、`FocusRequester`、焦点状态、动画状态、`TextFieldState`、`MutableInteractionSource.collectIsPressedAsState()`，以及其他属于所渲染控件的类似行为。

如果这类 UI 局部状态逐渐演变为包含多个相关字段和操作的协调行为，请使用 [`compose-state-hoisting`](../compose-state-hoisting/SKILL.md) 判断是否应将其改为在组合中记住的普通状态持有者类。

## 应传递什么

传递最小且实用的 UI 契约：

- 当屏幕具有实际状态时，相比传递许多互不相关的基本类型值，应优先使用专用的 `UiState`/`State` 对象。
- 相比传递整个组件，应优先使用显式 lambda（`onRetryClick`、`onItemSelected`）。
- 如果领域模型会迫使 UI 包含业务规则，请不要将其传入 UI 可组合项。当 UI 需要不同的数据结构时，应将其映射为 UI 模型。
- 将导航保留为回调。UI 可组合项表达的是“用户点击了返回”，而不是“导航到路由 X”。
- 对于不应在发生变化时触发整棵树重组的帧率相关值或 UI 局部值：按照 [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md) 的说明，优先使用提供者 lambda 和延迟读取。

## 副作用

[`compose-side-effects`](../compose-side-effects/SKILL.md) 介绍了副作用 API（`LaunchedEffect`、`DisposableEffect`、`SideEffect`）、键、清理以及 `rememberUpdatedState`。

在状态持有者附近处理副作用，因为那里同时具备副作用源和命令式目标：

```kotlin
@Composable
fun ProfileScreen(component: ProfileComponent, snackbarHostState: SnackbarHostState) {
    val state by component.state.collectAsStateWithLifecycle()

    LaunchedEffect(component) {
        component.effects.collect { effect ->
            when (effect) {
                ProfileEffect.Saved -> snackbarHostState.showSnackbar("Saved")
            }
        }
    }

    ProfileScreen(state = state, onSaveClick = component::save)
}
```

如果副作用处理逻辑变得复杂，请提取 `ProfileEffects(component, snackbarHostState)`，而不是将组件传入 UI 可组合项。

## 常见错误

| 错误 | 有何危害 | 修复方法 |
|---|---|---|
| `fun Screen(viewModel: MyViewModel)` 包含所有布局 | 如果没有 Android 生命周期和 DI，就难以预览/测试 | 添加一个接收 `state` 和回调的纯 UI 重载 |
| 子可组合项接收 `component` | 依赖会泄漏到整棵树中 | 只传递子项所需的状态和回调 |
| UI 可组合项发起导航 | UI 会与应用路由耦合 | 暴露 `onBackClick`、`onItemClick` 等 |
| UI 可组合项收集应用/业务流 | 收集操作的生命周期隐藏在布局中 | 在状态持有者附近收集，并将值向下传递 |
| 无缘无故将 UI 局部状态提升到状态持有者中 | 状态持有者开始负责布局机制 | 当滚动、焦点、动画和文本字段交互状态仅属于 UI 行为时，将其保留在 UI 可组合项中 |
| 每个微小的可组合项都有一个状态持有者重载 | 产生过多样板流程 | 在屏幕/区块边界处拆分，而不是为每个 `Row` 都拆分 |

## 不适用的情况

- 已经接收普通值和回调的小型一次性可组合项。
- `Button`、`Card` 或 `ListItem` 等设计系统基础组件；它们应暴露插槽和修饰符，而不是状态持有者。
- 状态持有者可组合项只会转发一个基本类型值，无法提供任何隔离的情况。

## 相关内容

- [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) — 在不使用完整应用依赖图的情况下，测试由纯状态驱动的 UI composable。
- [`compose-state-hoisting`](../compose-state-hoisting/SKILL.md) — 确定 UI 元素状态和 UI 逻辑应放置在何处，包括普通状态持有者类。
- [`kotlin-multiplatform-expect-actual`](../kotlin-multiplatform-expect-actual/SKILL.md) — 当共享 UI 与平台特定的末端实现交汇时，平台服务、原生视图以及 expect/interface 边界。