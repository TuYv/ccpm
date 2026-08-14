---
name: compose-state-hoisting
description: "Use when adding or refactoring interactive Jetpack Compose UI that introduces or moves remember state or coordinated UI logic, or when a screen mixes app dependencies or state holders with state or effect collection and layout."
---
# Compose 状态提升

## 核心原则

只将状态提升到逻辑所需的层级。将简单的 UI 元素状态保留在局部；将共享的 UI 元素状态移动到最低层级的共同可组合项所有者；当纯 UI 行为形成一个独立概念时，提取普通状态持有者；当涉及业务逻辑或应用数据时，使用屏幕状态持有者。在屏幕边界处，将状态持有者的接线逻辑与由状态驱动的普通 UI 渲染分离。

## 审查流程

1. 列出涉及的状态、操作、应用依赖、事件流和命令式副作用。
2. 使用下方的决策指南，将每一项分配给需要读取或更改它的最低层级所有者。
3. 仅当相互协调的纯 UI 行为已经形成一个独立概念时，才提取普通状态持有者。
4. 当屏幕将应用接线逻辑与布局混合在一起时，保留一个小型状态持有者可组合项，并将渲染移至由状态驱动的普通可组合项。
5. 跨越该边界传递不可变 UI 状态和显式事件回调；除非业务逻辑需要 UI 机制的值，否则将其保留在组合中。
6. 当这些关注点需要更深入的处理时，加载针对副作用、测试、焦点或延迟读取的专项技能。
7. 当 UI 可以在不依赖应用依赖项的情况下进行预览和测试、业务工作仍保留在屏幕状态持有者中，并且没有任何状态被提升到超出其逻辑所需的层级时，即可结束。

## 决策指南

| 情况 | 所有者 |
|---|---|
| 一个可组合项读取/写入简单状态 | 使用 `remember` / `rememberSaveable` 将其保留在局部 |
| 同级或父级可组合项需要读取/写入它 | 将状态和事件提升到它们最低层级的共同可组合项祖先 |
| 相关的 UI 元素状态和 UI 逻辑使可组合项难以阅读、预览或测试 | 提取一个在组合中记忆的普通状态持有者类 |
| 涉及存储库调用、持久化、业务规则或屏幕 UI 状态生成 | 使用屏幕级状态持有者，例如 `ViewModel` 或组件 |
| 一个屏幕可组合项既收集应用状态/副作用，又负责大部分布局 | 保留一个小型接线可组合项，并提取一个接收不可变状态和回调的普通 UI 可组合项 |

UI 元素状态包括展开状态、工作表可见性、滚动位置、焦点、文本字段编辑状态、选择状态以及动画/交互状态等。屏幕 UI 状态是为显示而准备的应用数据。

如果 UI 元素状态是业务逻辑的输入，它可能也需要存在于屏幕状态持有者中。例如，用于查询由存储库支持的建议的文本，应归属于生成这些建议的状态持有者。

## 提取普通状态持有者的触发条件

当以下多项条件成立时，提取普通状态持有者：

- 多个相关的 `remember` 值由相同的回调进行协调。
- 滚动、焦点、文本、选择或工作表状态需要诸如 `clear`、`submit`、`jumpToTop` 或 `openFilters` 之类的具名操作。
- 派生的 UI 标志散布在整个可组合项中。
- 子可组合项接收了它们在概念上并不拥有的 UI 机制。
- 预览或测试必须驱动一长串 UI 细节，才能检查某一种行为。
- 辅助函数需要大量状态参数，只是为了保持可组合项的可读性。

不要为了一个布尔值、一个文本字段或简单的显示/隐藏逻辑而进行抽取。形式上的繁文缛节并不等同于关注点分离。

## 模式

使用普通类来保存 UI 元素状态和 UI 逻辑，并为由组合拥有的对象提供一个 `remember...State` 函数：

```kotlin
@Stable
class ProductSearchState(
    query: String,
    private val listState: LazyListState,
    private val focusRequester: FocusRequester,
) {
    var query by mutableStateOf(query)
        private set

    var filtersOpen by mutableStateOf(false)
        private set

    val canClear: Boolean
        get() = query.isNotEmpty()

    fun updateQuery(value: String) {
        query = value
    }

    fun clear() {
        query = ""
        focusRequester.requestFocus()
    }

    suspend fun jumpToTop() {
        listState.animateScrollToItem(0)
    }
}

@Composable
fun rememberProductSearchState(
    initialQuery: String = "",
    listState: LazyListState = rememberLazyListState(),
    focusRequester: FocusRequester = remember { FocusRequester() },
): ProductSearchState {
    return remember(listState, focusRequester) {
        ProductSearchState(initialQuery, listState, focusRequester)
    }
}
```

可组合项根据状态持有者进行渲染，并调用意图式方法。如果父级需要协调相同的 UI 行为，则将状态持有者作为参数接收，并提供默认值：

```kotlin
@Composable
fun ProductSearchPanel(
    state: ProductSearchState = rememberProductSearchState(),
    modifier: Modifier = Modifier,
) {
    val scope = rememberCoroutineScope()

    SearchField(
        query = state.query,
        onQueryChange = state::updateQuery,
        onClear = state::clear,
    )

    JumpToTopButton(onClick = {
        scope.launch { state.jumpToTop() }
    })
}
```

## 组合所有权

使用 `remember` 创建的普通状态持有者会遵循可组合项的生命周期。因此，它们非常适合存放 `LazyListState`、`FocusRequester`、`PagerState`、`DrawerState` 和 `TextFieldState` 等 Compose UI 对象。

将需要帧时钟的挂起式 UI 操作（例如滚动或抽屉动画）保留在组合作用域的协程中（`rememberCoroutineScope`、`LaunchedEffect` 或其他由组合拥有的作用域）。不要将这些调用移至 `viewModelScope`。

## 保存状态

仅对应该在 Activity 或进程重新创建后继续保留的值使用 `rememberSaveable` 或自定义 `Saver`，例如查询字符串、选中的筛选器 ID 或当前标签页键。

不要尝试直接保存 `LazyListState`、`FocusRequester`、协程作用域或回调等运行时对象。只保存重建行为所需的最少可序列化值。

## 将屏幕接线与 UI 渲染分离

当屏幕接收 `ViewModel`、组件、控制器、导航器、仓库或服务时，请将该依赖项保留在一个小型状态持有可组合项中。在其中收集应用状态和副作用，然后将不可变 UI 状态和显式事件回调传递给普通 UI 可组合项。

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

@Composable
fun ProfileScreen(
    state: ProfileUiState,
    onNameChange: (String) -> Unit,
    onSaveClick: () -> Unit,
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    // Layout only.
}
```

请有意识地使用这一边界：

| 关注点 | 状态持有者可组合项 | 纯 UI 可组合项 |
|---|---|---|
| 收集应用/业务状态和一次性副作用 | 是 | 否 |
| 持有通过依赖注入获得的对象 | 是 | 否 |
| 接受不可变 UI 状态和事件回调 | 通常将其透传 | 是 |
| 负责布局、修饰符、语义和测试标签 | 否，或仅负责少量内容 | 是 |
| 持有 Compose 运行时对象，例如 `LazyListState` 或 `FocusRequester` | 否 | 是，直接持有或通过纯 UI 状态持有者持有 |
| 接收由 UI 机制派生、与业务相关的值或意图 | 是 | 提供这些值或意图，而不暴露运行时对象 |

传递满足需要的最小 UI 契约：

- 当屏幕具有内聚状态时，优先使用专用的不可变 `UiState`。
- 优先使用显式事件回调，而不是将整个状态持有者沿组件树向下传递。
- 将导航保留为描述用户意图的回调。
- 当直接使用领域模型会把业务规则带入渲染逻辑时，将领域模型映射为 UI 模型。
- 对于应在布局或绘制阶段读取的逐帧值，传递提供者 lambda，具体参见 [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md)。

在状态持有者附近处理导航、snackbar、分析统计或事件收集，因为在那里可以同时访问事件源和命令式目标。如果副作用处理逻辑不断增长，应提取一个小型的同级副作用处理器，而不是将状态持有者传入 UI 可组合项。有关副作用 API、键、清理和陈旧捕获，请使用 [`compose-side-effects`](../compose-side-effects/SKILL.md)。

不要为每个小型可组合项都创建一组状态持有者/UI 重载。应在屏幕或内聚区段的边界进行拆分，前提是这样做能够从需要预览、测试或复用的有意义 UI 中移除应用依赖。

不要将这种拆分应用于以下情况：已经接收普通值和回调的微型一次性可组合项；应公开插槽和修饰符的设计系统基础组件；或者仅转发一个基础值、却无法隔离应用依赖的包装器。

## RED/GREEN 智能体场景

对于每个场景，先通过省略或还原相关规则来建立 RED，然后恢复该技能并要求获得 GREEN 结果。

1. 一个屏幕接收组件、收集 `StateFlow`、处理导航事件，并负责大部分布局。GREEN 会将组件、收集逻辑和副作用处理保留在一个小型接线可组合项中，然后提取一个接收不可变状态和回调的纯 UI 可组合项。
2. 新颖案例：搜索查询驱动由存储库支持的建议，同时由 `LazyListState` 和 `FocusRequester` 协调 UI。GREEN 会将查询和建议逻辑移至屏幕状态持有者，但将 Compose 运行时对象保留在纯 UI 或纯 UI 状态持有者中。
3. 过度应用的反例：一个无状态的设计系统徽章接收普通值、插槽和修饰符。GREEN 不会仅仅为了结构对称而创建状态持有者/UI 重载或引入 `ViewModel`。

## 常见错误

| 错误 | 修复方式 |
|---|---|
| “以防万一”而将每个局部状态值都提升到父级 | 将状态提升到实际读取或写入它的最低层级所有者 |
| 为一个布尔值提取纯状态持有者 | 将简单的私有 UI 状态保留在局部 |
| 将存储库调用或产品规则放入 Compose 状态持有者 | 将该逻辑移至屏幕状态持有者，例如 `ViewModel` 或组件 |
| 当文本或选择项驱动由存储库支持的屏幕状态时，仍将其保留在局部 | 将该输入连同业务逻辑一起移至屏幕状态持有者 |
| 将状态持有者深度传入不相关的子项 | 传递普通值和回调，除非子项确实需要协调状态持有者的行为 |
| 将状态持有者当作整个屏幕的杂物箱 | 按内聚的 UI 行为拆分，例如搜索输入、面板协调或列表控件 |
| 从 `viewModelScope` 调用动画挂起函数 | 使用组合范围内的协程 |
| 屏幕可组合项接收组件并渲染所有布局 | 提取一个接收状态和回调的纯 UI 重载 |
| 子可组合项接收 `ViewModel` 或组件 | 仅传递每个子项所需的值和回调 |
| UI 渲染逻辑执行导航或收集应用事件流 | 在屏幕状态持有者旁边处理副作用 |
| 每个小型可组合项都获得一个状态持有者重载 | 仅在屏幕或内聚区段的边界进行拆分 |

## 相关内容

- [`compose-state-authoring`](../compose-state-authoring/SKILL.md) — 正确编写局部 `remember` 和可变状态。
- [`compose-side-effects`](../compose-side-effects/SKILL.md) — 选择副作用 API 和以组合为作用域的协程边界。
- [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md) — 焦点状态、请求器，以及键盘/D-pad 行为。
- [`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md) — 无需构建完整应用图即可测试由纯状态驱动的 UI。
- [`kotlin-multiplatform-expect-actual`](../kotlin-multiplatform-expect-actual/SKILL.md) — 保持共享 UI 简洁，同时将平台服务置于语义边界之后。