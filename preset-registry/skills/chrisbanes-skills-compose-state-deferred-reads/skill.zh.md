---
name: compose-state-deferred-reads
description: Use when Jetpack Compose code reads scroll, animation, gesture, or other frame-rate State in composition, passes changing values across composable boundaries, uses value-form layout/draw modifiers, or back-writes observable state from a later phase into one that's already run.
---
# Compose 状态延迟读取

## 核心原则

状态读取会使读取它的阶段失效。如果在可组合项主体中读取 `State<T>`，其变化会使组合失效。如果在布局或绘制阶段读取，则变化可以只使布局或绘制失效。滚动偏移、动画和拖动位置等帧率级状态通常应放在布局/绘制阶段，而不是组合阶段。

**反向写入**是与之对称的失效模式：在某个阶段写入可观察状态，却触发更早阶段的失效。Compose 各阶段按组合 → 布局 → 绘制的顺序运行。从布局或绘制阶段写入由快照支持、且在组合阶段读取的状态，会使组合失效；在组合期间写入同一次组合中更早读取的状态，也会产生相同结果。两者都会安排额外的工作——通常还会级联影响同级的惰性列表项。

解决方法是调整结构：保留 `State<T>` 或提供器 lambda，并在布局/绘制回调内读取值；在回调中捕获测量结果，并在测量阶段应用这些结果，而不是在同级可组合项主体中读取测量状态。

## 何时使用此技能

- `val x by animate*AsState(...)` 被传递给 `Modifier.offset(x = ...)`、`Modifier.size(...)`、`Modifier.graphicsLayer(...)` 或其他值形式的修饰符。
- 在可组合项主体中读取 `LazyListState.firstVisibleItemScrollOffset`、`ScrollState.value`、`Animatable.value` 或手势状态。
- 可组合项接收 `scrollOffset: Int`、`progress: Float`、`dragOffset: Offset` 或类似的帧率级值。
- 即使数据保持稳定，重组计数器仍会在滚动、动画或手势期间持续增加。
- 可组合项主体在每次重组时调用 `stateMap[key] = …`、`list.addAll(…)` 或类似操作（反向写入：组合 → 组合）。
- 一个惰性列表项通过 `onSizeChanged` / `onGloballyPositioned` 捕获尺寸，而同级项在组合阶段读取该高度（`Modifier.height(state.dp)`）——反向写入：布局 → 组合。

## 0. 反向写入

**反向写入** = 在某个阶段写入可观察状态，进而触发更早阶段（或当前阶段）的失效。Compose 按组合 → 布局 → 绘制的顺序运行，因此包括：

- 在组合期间写入同一次组合中读取的快照状态。
- 在布局期间（例如从 `Modifier.layout`、`onSizeChanged`、`onGloballyPositioned`）写入组合期间读取的快照状态。
- 在绘制期间写入组合或布局期间读取的快照状态。

在所有这些情况下，写入方都会安排额外的失效轮次——通常还会级联影响同级的惰性列表项。

不要在每次执行可组合项主体时写入 `mutableStateOf`、`mutableStateListOf`、`mutableStateMapOf` 或其他由快照支持的状态：

```kotlin
// ❌ BAD — mutates observable map during composition; siblings recompose repeatedly
@Composable
fun MergeOverlay(parent: Map<Key, ViewState>, overlay: Map<Key, ViewState>): Map<Key, ViewState> {
    val merged = remember { mutableStateMapOf<Key, ViewState>() }
    merged.clear()
    merged.putAll(parent)
    merged.putAll(overlay)   // back-writing composition → composition
    return merged
}

// ✅ GOOD — read-only merge; no composition-time writes
@Composable
fun MergeOverlay(parent: Map<Key, ViewState>, overlay: Map<Key, ViewState>): Map<Key, ViewState> =
    remember(parent, overlay) {
        if (overlay.isEmpty()) parent else parent + overlay
    }
```

对于派生的只读快照，优先使用 `remember(keys) { … }`。仅在事件回调（`onClick`）或 effect 中写入 `mutableState*`，不要在每次组合时通过写入它来重新构建派生数据。

像 `onSizeChanged` 这样的回调会在*布局期间*写入。只有在更早的阶段没有读取所产生状态的情况下，这才是安全的——请参阅下文的跨行测量。

### 跨行测量（布局 → 组合反向写入）

当 A 行进行测量且 B 行必须与 A 行高度一致时，不要在 B 的可组合项主体中读取 A 捕获的尺寸。`onSizeChanged` 会在布局期间写入；如果 B 在组合中读取它，就意味着布局刚刚反向写入了组合：

```kotlin
var anchorHeightPx by remember { mutableIntStateOf(0) }

// ❌ BAD — B reads measurement state in composition; insertion/focus can double-recompose B
RowA(Modifier.onSizeChanged { anchorHeightPx = it.height })
RowB(Modifier.height(with(LocalDensity.current) { anchorHeightPx.toDp() }))  // composition read

// ✅ GOOD — capture on A; apply on B in measure phase only
RowA(Modifier.onSizeChanged { if (it.height != anchorHeightPx) anchorHeightPx = it.height })
RowB(
    Modifier.decorateMeasureConstraints { incoming ->
        if (anchorHeightPx > 0) incoming.copy(minHeight = anchorHeightPx, maxHeight = anchorHeightPx)
        else incoming
    },
)
```

`decorateMeasureConstraints` 是一个小型布局辅助工具（参见 [`compose-modifier-and-layout-style`](../compose-modifier-and-layout-style/SKILL.md)）。高度未知时，同级项在组合中使用固定的回退值；高度一旦确定，就只会使布局失效，而不会触发额外的组合级联。

## 1. 优先使用块形式的修饰符

一些修饰符同时具有值形式和块形式。值形式接收已在组合中读取的值；块形式则可以在布局或绘制期间读取值。

```kotlin
// Before: animated value read in composition by the `by` delegate
@Composable
fun SelectionPill(selectedIndex: Int) {
    val offsetX by animateDpAsState(120.dp * selectedIndex)
    Box(Modifier.offset(x = offsetX))
}

// After: State is kept, value is read in the layout-phase offset block
@Composable
fun SelectionPill(selectedIndex: Int) {
    val offsetX = animateDpAsState(120.dp * selectedIndex)
    Box(
        Modifier.offset {
            IntOffset(offsetX.value.roundToPx(), 0)
        },
    )
}
```

常见替换方式：

| 组合阶段读取 | 延迟读取 |
|---|---|
| `Modifier.offset(x = animatedX)` | `Modifier.offset { IntOffset(animatedX.value.roundToPx(), 0) }` |
| `Modifier.graphicsLayer(translationY = y)` | `Modifier.graphicsLayer { translationY = yProvider() }` |
| `val radius by animateFloatAsState(...); drawBehind { drawCircle(radius = radius) }` | `val radius = animateFloatAsState(...); drawBehind { drawCircle(radius = radius.value) }` |

`drawBehind` 块本身已经处于绘制阶段；关键在于 `State.value` 的读取也发生在该块内部。

## 2. 跨可组合项边界传递提供器

如果快速变化的值需要跨越可组合项边界，请传递提供器 lambda，而不是快照值：

```kotlin
// Before: HomeScreen reads scroll offset in composition and passes the value down
@Composable
fun HomeScreen() {
    val listState = rememberLazyListState()
    LazyColumn(state = listState) {
        item { HeroImage(scrollOffset = listState.firstVisibleItemScrollOffset) }
    }
}

@Composable
fun HeroImage(scrollOffset: Int, modifier: Modifier = Modifier) {
    AsyncImage(
        model = "...",
        modifier = modifier.graphicsLayer(translationY = -scrollOffset / 2f),
    )
}

// After: the only read happens inside graphicsLayer
@Composable
fun HomeScreen() {
    val listState = rememberLazyListState()
    LazyColumn(state = listState) {
        item {
            HeroImage(
                scrollOffsetProvider = {
                    if (listState.firstVisibleItemIndex == 0) {
                        listState.firstVisibleItemScrollOffset
                    } else {
                        0
                    }
                },
            )
        }
    }
}

@Composable
fun HeroImage(scrollOffsetProvider: () -> Int, modifier: Modifier = Modifier) {
    AsyncImage(
        model = "...",
        modifier = modifier.graphicsLayer {
            translationY = -scrollOffsetProvider() / 2f
        },
    )
}
```

当添加 `Provider` 后缀有助于明确延迟读取约定时，请为提供者参数添加该后缀。

## 3. 其他布局/绘制读取位置

状态读取也可以延迟到以下位置：

- `Modifier.layout { measurable, constraints -> ... }`
- 自定义 `Alignment.align(...)`
- `drawWithContent`、`drawBehind` 以及其他绘制修饰符
- 块形式的图层/布局修饰符，例如 `graphicsLayer { ... }` 和 `offset { ... }`

当状态会改变某个元素的放置或绘制位置时，请使用这些方式。如果状态决定了*哪些可组合项存在*，则应在组合阶段读取。

## 快速参考

| 表现 | 诊断 | 修复方式 |
|---|---|---|
| `val x by animateFloatAsState(...)`，然后使用 `Modifier.offset(...)` | `by` 在组合阶段读取 | 保留 `State<Float>`，并在 `offset {}` 中读取 `.value` |
| `Modifier.graphicsLayer(translationY = animatedY)` | 属性参数形式使用组合阶段的值 | 使用 `graphicsLayer { translationY = ... }` |
| `Child(scrollOffset = listState.firstVisibleItemScrollOffset)` | 快速变化的值跨越边界传递 | `Child(scrollOffsetProvider = { ... })` |
| 绘制块仍然每帧都重组 | 值在进入绘制块之前已被读取 | 将 `State.value` 的读取移入绘制块 |
| 状态用于在不同 UI 分支之间进行选择 | 组合阶段决策 | 保留在组合阶段的读取 |
| 可组合项主体中的 `mergedMap.putAll(overlay)` | 从组合阶段回写至组合阶段 | `remember(parent, overlay) { parent + overlay }` |
| 同级项中的 `Modifier.height(measuredPx.toDp())` | 从布局阶段回写至组合阶段 | 测量阶段的约束修饰 |
| 用于只读合并的标识缓存 | 覆盖层过期风险 | 对不可变结果使用 `remember(keys)` |

## 不适用的情况

- 状态控制要发出哪些可组合项。
- 动画是一次性的、开销很小，并且代码清晰度更重要。
- 你正在编写测试，直接断言值更简单。
- 运行时证据表明重组并非瓶颈。

## 相关内容

- [`compose-state-authoring`](../compose-state-authoring/SKILL.md) — 判断 `mutableState*` 应该位于组合过程还是回调中。
- [`compose-state-hoisting`](../compose-state-hoisting/SKILL.md) — 跨边界传递提供器/lambda 时，状态持有者与纯 UI 的拆分应如何应用。
- [`compose-stability-diagnostics`](../compose-stability-diagnostics/SKILL.md) — 参数稳定性和编译器报告。
- [`compose-modifier-and-layout-style`](../compose-modifier-and-layout-style/SKILL.md) — 测量阶段的约束修饰辅助工具。