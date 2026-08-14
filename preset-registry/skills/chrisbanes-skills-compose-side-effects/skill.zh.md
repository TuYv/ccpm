---
name: compose-side-effects
description: Use when writing or reviewing Jetpack Compose code with LaunchedEffect, DisposableEffect, SideEffect, rememberCoroutineScope, rememberUpdatedState, snapshotFlow, snackbar, navigation, focus requests, analytics, or event Flow collection.
---
# Compose：副作用

## 核心原则

可组合函数体用于描述 UI。它们可能会被重组、跳过或放弃。会改变外部世界的工作应放在生命周期与该工作相匹配的 effect API 中。

## 选择最精简的 effect

| 需求 | API |
|---|---|
| 在每次成功重组后，将 Compose 状态发布给非 Compose 代码 | `SideEffect` |
| 注册/注销监听器、回调、观察者或资源 | `DisposableEffect(keys...)` |
| 执行挂起、延迟或基于键的一次性工作 | `LaunchedEffect(keys...)` |
| 从用户事件回调中启动挂起工作 | `rememberCoroutineScope()` |
| 在协程内将 Compose 快照读取转换为 Flow | `LaunchedEffect` 内的 `snapshotFlow { ... }` |

## Effect 键

键定义了重启标识。当任意键发生变化时，旧 effect 会被取消/清理，并启动一个新 effect。

```kotlin
// ✅ Restart collection when userId changes
LaunchedEffect(userId) {
    repository.events(userId).collect { event -> handle(event) }
}

// ❌ Unit hides a changing input; collection keeps using the first userId
LaunchedEffect(Unit) {
    repository.events(userId).collect { event -> handle(event) }
}
```

使用稳定且具有语义的键：

- 使用 effect 生命周期所跟随的对象：`userId`、`screenId`、`lifecycleOwner`、`focusRequester`。
- 当只有某个属性相关时，不要使用范围过大的对象（`state`、`viewModel`）。
- 不要将会变化的 lambda 添加为键，除非你确实希望每次 lambda 变化时都重启。

## 避免捕获过期值

对于不应重启、但需要使用最新回调或值的长时间运行 effect，请使用 `rememberUpdatedState`。

```kotlin
@Composable
fun Timeout(onTimeout: () -> Unit) {
    val latestOnTimeout by rememberUpdatedState(onTimeout)

    LaunchedEffect(Unit) {
        delay(1_000)
        latestOnTimeout()
    }
}
```

当生命周期是“仅启动一次”，但被调用的 lambda 应始终保持最新时，请使用此方法。常见情况包括：

- 超时或启动画面 effect 不应在 `onTimeout` 变化时重启，但应调用最新的回调。
- 生命周期观察者应保持注册到同一个 owner，但调用最新的 `onStart` / `onStop` lambda。
- 长时间运行的收集器应保持其收集生命周期，但调用最新的事件处理程序。

不要使用 `rememberUpdatedState` 来回避选择正确的键。如果某个值发生变化时工作应重启，请改为将其用作键：

```kotlin
// BAD: userId changes should restart the collection, not update a captured value.
val latestUserId by rememberUpdatedState(userId)
LaunchedEffect(Unit) {
    repository.events(latestUserId).collect { event -> handle(event) }
}

// GOOD: the collection lifecycle follows userId.
LaunchedEffect(userId) {
    repository.events(userId).collect { event -> handle(event) }
}
```

### `rememberUpdatedState` 的值在 `remember {}` 块内是过期的

`rememberUpdatedState` 返回一个 `State` 对象，其 `.value` 会在每次重组时更新。“最新”行为仅在延迟读取 State 时才有帮助——即在 effect 函数体内，或在稍后运行的 lambda 内——而不是在立即捕获该值时。

在 `remember {}` 块内，producer lambda 只运行一次。在其中读取委托会将当前 `.value` 快照保存到被记忆的对象中——后续的 State 更新永远不会传递给它：

```kotlin
val latestChannelId by rememberUpdatedState(channelId)

// ❌ BAD — channelId is read once when remember's lambda executes;
// the destination holds the initial value forever
val destination = remember {
    Destination(channelId = latestChannelId)
}

// ✅ GOOD — skip rememberUpdatedState; key remember on the changing value
val destination = remember(channelId) {
    Destination(channelId = channelId)
}

// ✅ ALSO GOOD — wrapping lambda defers the read to each invocation
val destination = remember {
    Destination(channelId = { latestChannelId })
}
```

只要 `rememberUpdatedState` 委托被**立即读取**，而不是推迟到 lambda 或 effect body 中读取，就会遇到相同的陷阱：在 `remember` 中构造的 data class、在 `DisposableEffect` 的 setup block 中仅构建一次的对象，或任何在创建时求值的表达式。

当捕获的值应触发被记忆对象的重新创建时，请将其设为 `remember` 的 key，并完全跳过 `rememberUpdatedState`。仅当值需要在长生命周期的作用域（effect coroutine、event callback）内保持最新，且**不应**重启该作用域时，才使用 `rememberUpdatedState`。

`rememberUpdatedState` 也不会让 render state 变得“不触发重组”。如果 UI 需要显示一个不断变化的值，请在 composition 中读取普通的 `State`，或者对于 frame-rate values，使用 [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md) 中的延迟读取模式。

## 收集 Flow

对于**副作用/事件 Flow**，请使用 `LaunchedEffect`：snackbar、导航事件、分析事件、焦点命令，或其他每次发射都会触发命令式工作的流。

```kotlin
LaunchedEffect(events) {
    events.collect { event ->
        snackbarHostState.showSnackbar(event.message)
    }
}
```

不要为了修改 local state 而以命令式方式收集 render state。对于 UI state，请在靠近 state holder 的位置进行收集，并将普通值传入 UI composable——**state-holder 与 UI 的分离**、`collectAsStateWithLifecycle()` / `collectAsState()` 以及便于 preview 的连接方式，已在 [`compose-state-hoisting`](../compose-state-hoisting/SKILL.md) 中介绍。不要在这里重复该架构。

在 Android 上，如果存在支持 lifecycle 的收集方式，请优先使用；在没有 lifecycle-aware API 的 target 上使用 `collectAsState()`。

对于 Compose state 读取，请使用 `snapshotFlow`：

```kotlin
LaunchedEffect(listState) {
    snapshotFlow { listState.firstVisibleItemIndex }
        .distinctUntilChanged()
        .collect { index -> analytics.visibleIndex(index) }
}
```

没有终止操作 `collect` 的 `snapshotFlow { ... }.map { ... }` 不会执行任何操作。

## 用户事件

当点击或手势启动 suspending work 时，请使用 `rememberCoroutineScope()`：

```kotlin
@Composable
fun SaveButton(snackbarHostState: SnackbarHostState) {
    val scope = rememberCoroutineScope()

    Button(
        onClick = {
            scope.launch {
                snackbarHostState.showSnackbar("Saved")
            }
        },
    ) {
        Text("Save")
    }
}
```

避免仅仅为了触发 `LaunchedEffect` 而使用“事件标志”状态。点击本身就是事件。

## 注册与清理

使用 `DisposableEffect` 进行成对的设置和清理：

```kotlin
@Composable
fun ObserveLifecycle(owner: LifecycleOwner, observer: LifecycleObserver) {
    DisposableEffect(owner, observer) {
        owner.lifecycle.addObserver(observer)
        onDispose {
            owner.lifecycle.removeObserver(observer)
        }
    }
}
```

每条注册路径都应该有对应的 `onDispose` 清理路径。

## 常见错误

| 错误 | 诊断 | 修复 |
|---|---|---|
| 直接在可组合函数主体中发起网络请求 | 在组合期间执行副作用 | 通常应移至 ViewModel/状态持有者；仅将 `LaunchedEffect` 用于由 UI 负责且带键的工作 |
| 从可组合函数主体中写入分析属性 | 在组合期间执行副作用 | 如果应在每次成功重组后发布，请使用 `SideEffect` |
| 从可组合函数主体中记录曝光/事件 | 在组合期间执行副作用 | 如果应针对该键运行一次，请使用 `LaunchedEffect(key)` |
| `LaunchedEffect(Unit)` 捕获了会变化的 `id` | 缺少键 | 使用 `id` 作为键；如果它不能重启，则使用 `rememberUpdatedState` |
| 使用 `rememberUpdatedState(id)` 让 `LaunchedEffect(Unit)` 在 `id` 变化后继续运行 | 隐藏的生命周期错误 | 使用 `id` 作为该 effect 的键 |
| 长期运行的 effect 在重组后调用旧的回调 | 捕获了过期值 | 使用 `rememberUpdatedState` 包装回调，并在 effect 内调用该包装器 |
| 直接在 `remember {}` 中读取 `rememberUpdatedState` 委托（例如 `Destination(id = latestId)`） | 值只被捕获一次，永远不会刷新 | 将该值用作 `remember` 的键：`remember(id) { Destination(id = id) }` |
| `LaunchedEffect(state) { ... }` 重启过于频繁 | 键的范围过宽 | 使用具体属性作为键 |
| `LaunchedEffect(...) { nonSuspendSetter() }` | effect 类型错误 | 通常应使用 `SideEffect`；仅将 `LaunchedEffect` 用于带键的一次性/延迟工作 |
| 在 `LaunchedEffect` 中添加监听器但不清理 | 缺少释放操作 | 使用 `DisposableEffect` |
| 通过设置 `shouldShowSnackbar = true` 从点击事件中启动 | 事件标志反模式 | 在点击回调中使用 `rememberCoroutineScope()` |
| 为了执行副作用而在可组合函数主体中使用 `if (isFocused) { … }` 或读取焦点 | 在组合期间执行副作用 | 使用 `LaunchedEffect(focused) { … }` 或 `snapshotFlow` |
| 在被测量的可组合项上使用 `onSizeChanged { heightState = it.height }` | 如果同级项在组合期间读取 `heightState`，就会发生从布局到组合的反向写入 | 同级项必须在测量阶段使用高度，而不是在组合期间使用 `Modifier.height(state.dp)` |

## 焦点与测量

**焦点：** 在可组合函数主体中读取焦点以驱动**副作用**（预加载、分析、Toast），会导致这些工作在组合期间运行。应改为在 effect 中观察焦点：

```kotlin
// ❌ BAD — side work runs during composition every time `focused` is true,
// including transient focus passes; `SideEffect` re-runs after every successful recomposition
@Composable
fun Preloader(interactionSource: MutableInteractionSource) {
    val focused by interactionSource.collectIsFocusedAsState()
    if (focused) {
        preloadImages()
    }
}

// ✅ GOOD — side work in a keyed effect
@Composable
fun Preloader(interactionSource: MutableInteractionSource) {
    val focused by interactionSource.collectIsFocusedAsState()
    LaunchedEffect(focused) {
        if (focused) preloadImages()
    }
}
```

当你需要对多个快照读取进行采样，或对快速变化进行防抖，而不希望将每个派生值都用作 effect 的 key 时，请在 `LaunchedEffect` 内使用 `snapshotFlow { … }`。有关 TV/D-pad 焦点导航语义，请参阅 [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)。

**测量：**`onSizeChanged` / `onGloballyPositioned` 是有效的**回调**，但它们会在布局阶段触发。只有在更早的阶段没有读取相应状态时，才可以安全地在这些回调中写入快照状态。如果某个同级项在组合阶段读取了该状态，布局阶段就会反向写入组合阶段，从而导致该同级项在每次测量过程中都重新组合。请在 `Modifier.layout` 中应用捕获的尺寸（参阅 [`compose-modifier-and-layout-style`](../compose-modifier-and-layout-style/SKILL.md) §7 和 [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md)）。

## 审查期间的危险信号

- 对可组合项函数体中的代码声称“这只会运行一次”。
- 在参数会发生变化的函数中使用 `LaunchedEffect(Unit)`。
- effect 内的 flow 链没有终止收集操作。
- effect 的 key 是为了消除 lint 警告而选择的，而不是为了建模生命周期。
- 长期运行的 effect 使用回调 lambda，却既未将其作为 key，也未使用 `rememberUpdatedState`。
- 在 `remember {}` 块或对象构造函数中立即读取 `rememberUpdatedState` 委托——该值只会被捕获一次，之后永远不会更新。