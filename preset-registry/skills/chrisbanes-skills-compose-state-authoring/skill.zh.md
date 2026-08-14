---
name: compose-state-authoring
description: Use when writing or reviewing Jetpack Compose code with bare local var in a @Composable, remember { mutableStateOf(...) }, mutableStateListOf/mutableStateMapOf, or @ReadOnlyComposable.
---
# Compose 状态编写

并非每个 `remember { … }` 都属于这里。本技能涵盖**局部 UI 状态**（`remember { mutableStateOf(…) }`、`mutableStateListOf` / `mutableStateMapOf`）和 **`@ReadOnlyComposable`**。其他 remembered API 分别归入更有针对性的技能：

- **`rememberCoroutineScope` / `rememberUpdatedState`** → [`compose-side-effects`](../compose-side-effects/SKILL.md)
- **用于帧率级读取的 `rememberLazyListState` / `rememberScrollState`** → [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md)
- **焦点导航、焦点状态、`FocusRequester` 所有权、行为** → [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)

## 核心原则

`@Composable` 是一个函数，每当其输入发生变化时，运行时都会重新运行它。正确编写局部状态归结为两个问题：

1. **可变局部状态**——我的 `var` 是否能在重组后继续存在，*并且*触发重组？如果不能，它会在每次重组时悄然重置，而且写入操作对运行时不可见。
2. **这是什么类型的 composable？**——我是对组合进行*修改*（放置布局节点、分配槽位、`remember`），还是只对其进行*读取*？如果只是读取，`@ReadOnlyComposable` 可以让运行时跳过一些工作。

任何一个问题处理错误，症状都很隐蔽：状态消失，或者优化无法生效。

## 何时使用本技能

当你正在编写或审查 Compose 代码，并看到以下任一情况时：

- `@Composable fun` 或任何 composable lambda（`Column { var x = … }`）中的 `var x = …`
- 函数体从不进行任何布局的 `@Composable fun`（或 `@Composable get()` 属性访问器）
- 调用 `Text`、`Box`、`Column`、`remember` 等的函数上标注了 `@ReadOnlyComposable`
- composable 的可见状态在旋转屏幕、更改主题或重组时莫名其妙地重置

## 1. composable 中的 `var` 必须由 State 支持

重组会从头开始重新执行 composable。局部 `var` 会在每次执行时被*重新初始化*——上一次重组中的值会丢失，而且对它的写入不会通知运行时进行重组。

```kotlin
// ❌ BAD — counter resets on every recomposition; clicks never update the UI
@Composable
fun Counter() {
    var count = 0
    Button(onClick = { count++ }) { Text("$count") }
}

// ❌ ALSO BAD — same rule applies inside composable content lambdas
@Composable
fun Wrapper() {
    Row {
        var count = 0         // Row's content lambda is @Composable too
        // …
    }
}
```

```kotlin
// ✅ GOOD — `remember` survives recomposition, `mutableStateOf` triggers it
@Composable
fun Counter() {
    var count by remember { mutableStateOf(0) }
    Button(onClick = { count++ }) { Text("$count") }
}
```

这里包含两个部分，二者都很重要：

- `remember { … }`——*在重组后继续存在*。如果没有它，每次都会重新创建该值。
- `mutableStateOf(…)`——*触发重组*。如果没有它，运行时无法感知修改。

对于集合，优先使用 `mutableStateListOf` / `mutableStateMapOf`（同样需要进行 `remember`）。它们会在每次读取时发出 Snapshot 读取，并在每次修改时发出 Snapshot 写入。先执行 `remember { mutableStateOf(mutableListOf<X>()) }`，再调用 `list.add(x)`，并*不会*触发重组，因为 `MutableList.add` 不会经过 State setter——你必须替换该值（`state = state + x`）。

### 在组合期间回写快照状态

**回写（Back-writing）**是指在某个阶段写入可观察状态，从而触发更早阶段（或当前阶段）失效。在可组合函数主体中修改 `mutableState*`，会回写到同一次组合过程中，并调度另一次组合。不要以这种方式重新构建派生数据：

```kotlin
// ❌ BAD — clear + putAll on every composition
val merged = remember { mutableStateMapOf<Key, ViewState>() }
merged.clear()
merged.putAll(parent)
merged.putAll(overlay)

// ✅ GOOD — immutable snapshot remembered from inputs
val merged = remember(parent, overlay) {
    if (overlay.isEmpty()) parent else parent + overlay
}
```

如果结果对于当前输入是只读的，使用 `remember(keys) { … }` 就足够了。有关跨行测量和测量阶段的修复方法，请参阅 [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md)。

### 此规则不适用的情况

- **在 `remember { … }` 的生成器块内。**它只会在每次键发生变化时运行一次，而不是在每次重组时运行。其中的局部 `var` 没有问题：`val builder = remember { mutableListOf<X>().apply { var n = 0; … } }`。
- **在从可组合函数中传出的非 `@Composable` lambda 中。**`onClick = { var a = 0; … }` 是普通的 `() -> Unit`。其中的局部变量属于正常的 Kotlin 用法。
- **在普通的（非 `@Composable`）辅助函数中。**只有可组合作用域会受到影响。

## 2. `@ReadOnlyComposable` 契约

`@ReadOnlyComposable` 声明某个可组合函数*只读取*组合状态——没有 `Text`、没有 `Box`、没有 `remember`、没有布局节点，也没有位置槽位。这样，运行时便可以跳过为该调用分配组，这对于快速的访问器式可组合函数（`MaterialTheme.colorScheme`、`LocalDensity.current`、设计系统令牌访问器）很重要。

该契约是**双向的**：

- 当函数主体进行的每个可组合调用本身都标有 `@ReadOnlyComposable` 时，**添加 `@ReadOnlyComposable`**（或者根本没有可组合调用——例如，函数只读取 `LocalFoo.current` 并返回一个值）。
- 如果调用了任何非只读可组合函数，**不要添加该注解**。此项优化假定你不参与组合；违反该假定会导致调用方出现错误的重组行为。

```kotlin
// ✅ GOOD — only reads composition locals, no layout, no remember
@Composable
@ReadOnlyComposable
fun appSpacing(): Dp = LocalDimensions.current.spacing

// ✅ GOOD — composable property getter; same rule
val accent: Color
    @Composable @ReadOnlyComposable
    get() = MaterialTheme.colorScheme.tertiary
```

```kotlin
// ❌ BAD — annotated read-only but lays out a Box; contract violated
@Composable
@ReadOnlyComposable
fun Header(): Int {
    Box {}                  // ← non-read-only composable call
    return 42
}

// ❌ BAD — calls a normal composable from a read-only one
@Composable
@ReadOnlyComposable
fun computed(): Int = nonReadOnlyHelper()
```

### 判断“是否应该添加该注解”的启发式规则

如果函数主体包含以下任何内容，**不要**添加 `@ReadOnlyComposable`：

- 布局调用：`Box`、`Column`、`Row`、`LazyColumn`、`Text`，以及来自 `androidx.compose.foundation.layout` 或 `androidx.compose.material*` 的任何内容。
- 副作用调用：`LaunchedEffect`、`DisposableEffect`、`SideEffect`、`produceState`。
- `remember { … }`——位置记忆化属于组合状态。
- 调用 `@Composable` lambda（`content()`）。
- 调用非 `@ReadOnlyComposable` 的可组合函数。

如果函数体只读取 `Local*.current`、调用其他 `@ReadOnlyComposable` 函数或执行纯计算，**请添加**该注解。

### 此规则不适用的情况

- **`override fun` 声明。** 该注解是契约的一部分；如果基类不是 `@ReadOnlyComposable`，就不能将覆盖函数设为 `@ReadOnlyComposable`。请重构基类，或者接受覆盖函数需承担创建分组的开销。
- **抽象声明。** 没有函数体可供检查。

## 相关内容：副作用有其独立的技能

如果可组合项需要 `LaunchedEffect`、`DisposableEffect`、`SideEffect`、`rememberCoroutineScope`、`rememberUpdatedState`、`snapshotFlow`、snackbar/导航处理、分析埋点或 Flow 收集，请使用 [`compose-side-effects`](../compose-side-effects/SKILL.md)。

根据问题划分关注点：**导航、焦点状态、`FocusRequester` 所有权、行为** → [`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)；**何时**调用命令式 `requestFocus`（副作用时机、生命周期、键、API 选择）→ [`compose-side-effects`](../compose-side-effects/SKILL.md)。

此技能关注如何正确编写 Compose 状态。`rememberUpdatedState` 是用于副作用捕获的状态，并不能普遍替代 `remember { mutableStateOf(...) }`。副作用有独立的生命周期和键规则，将其放在一个专门的技能中可避免出现两个事实来源。

## 快速参考

| 症状 | 诊断 | 修复方法 |
|---|---|---|
| `@Composable fun` 函数体内存在 `var x = …` | 无法安全应对重组（§1） | `var x by remember { mutableStateOf(…) }` |
| `Column { … }` / `Row { … }` 内容 lambda 内存在 `var x = …` | 同样如此——内容 lambda 是 `@Composable`（§1） | 使用相同的修复方法 |
| `remember { mutableStateOf(list) }` 后调用 `.add(x)` 不会触发重组 | 变更绕过了 State setter | 使用 `mutableStateListOf`，或替换该值：`state = state + x` |
| 在可组合函数体内调用 `stateMap.clear(); stateMap.putAll(...)` | 将组合结果反写入组合 | `remember(keys) { derivedSnapshot }` |
| `@Composable fun` 中没有 `Text`/`Box`/`remember`/副作用调用 | 可以使用 `@ReadOnlyComposable`（§2） | 在 `@Composable` 上方添加 `@ReadOnlyComposable` |
| `@ReadOnlyComposable` 函数调用了 `Box {}` / `Column {}` / 普通可组合函数 | 违反契约（§2） | 移除 `@ReadOnlyComposable` |

## 不适用的情况

- 使用 `composeTestRule.setContent { … }` 的**测试**遵循相同规则——其中的可组合项与生产代码中的可组合项无异。
- **`produceState`** 有自己的生产者块，该块在协程中运行；无需在其中使用 `LaunchedEffect`。
- **`derivedStateOf`** 在稳定性和相等性方面有其自身的注意事项——不在此处的讨论范围内；它关注的是*防止*重组，而非编写状态。
- 只读可组合声明的 **`override`**：注解由基类决定，不能在局部添加或移除。

## 审查期间的危险信号

| 想法 | 事实 |
|---|---|
| “这是一个很小的可组合项，直接使用 `var` 没问题” | 重组随时都可能发生。这种重置本身就是非确定性的——之后迟早会收到一份相关的错误报告。 |
| “这个函数看起来很简单，所以我要添加 `@ReadOnlyComposable`” | 判断标准不是“简单”，而是“仅进行只读调用”。 |
| “我总是直接使用 `LaunchedEffect`，因为我只熟悉这一个” | 使用 `compose-side-effects`；Effect API 的选择取决于生命周期和键。 |
| “我直接对记住的列表调用 `.add()` 就行了” | `mutableStateOf(List)` 不会观察内部变更——应使用 `mutableStateListOf` 或替换该值。 |
| “这个覆盖项需要使用 `@ReadOnlyComposable`，以匹配它的实际行为” | 如果基类没有使用 `@ReadOnlyComposable`，就不能将其添加到覆盖项中。应改为重构基类。 |