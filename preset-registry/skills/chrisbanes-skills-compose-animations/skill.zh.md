---
name: compose-animations
description: "Use when writing or reviewing Jetpack Compose motion: visibility enter/exit, animating one property toward a target, color or size transitions, multiple properties from one state, switching composable content, or choosing between AnimatedVisibility, animate*AsState, rememberTransition, AnimatedContent, and Crossfade."
---
# Compose：动画

## 核心原则

选择**与问题匹配的最小 API**：首先使用内置的可见性和布局过渡，然后使用单个动画值；当多个值必须协同变化时，使用共享过渡对象；只有当框架无法表达该运动时，才使用手势级或命令式 API。

## 审查流程

1. 确定视觉任务：显示/隐藏、单个值、多个值协同变化、内容切换、尺寸变化或手势驱动的运动。
2. 从下表中选择最小的 API。
3. 检查生命周期语义：隐藏的内容应该离开组合、保留焦点/状态，还是仅变为透明？
4. 检查标识：对于状态持有器包装器，应根据视觉形态而非载荷的频繁变化来选择 `AnimatedContent.contentKey`。
5. 检查性能：将逐帧变化的动画值保留为 `State`，并尽可能在布局/绘制块修饰符中读取它们。
6. 仅当目标状态动画无法表达所需运动时，才升级到 `Animatable` 或更底层的 API。

## 选择最小的动画 API

| 需求 | API |
|---|---|
| 使用进入/退出语义显示或隐藏子树；内容在退出完成后被移除 | [`AnimatedVisibility`](https://developer.android.com/develop/ui/compose/animation/composables-modifiers#animatedvisibility) |
| 将单个属性以动画方式过渡到由状态派生的目标值 | [`animateFloatAsState`](https://developer.android.com/develop/ui/compose/animation/value-based#animate-as-state) / `animateDpAsState` / `animateColorAsState` / `animateOffsetAsState` / … |
| 多个动画值由同一个布尔值、枚举或密封状态驱动 | `rememberTransition` + 过渡子动画（`animateFloat`、`animateDp`、`animateColor`、`animateValue`、…） |
| 当子布局的高度/宽度发生变化时平滑调整尺寸（例如文本换行） | `Modifier.animateContentSize()` |
| 在同一个槽位中切换不同的可组合项树 | `AnimatedContent` 或 `Crossfade` |
| 用户驱动的运动（拖动、快速滑动、可中断的弹簧动画） | [`Animatable`](https://developer.android.com/reference/kotlin/androidx/compose/animation/core/Animatable) 及相关协程 API（参见高级指引） |

## 出现和消失

当 UI 应通过进入/退出过渡离开或加入树时，**优先使用 `AnimatedVisibility`**。

```kotlin
AnimatedVisibility(visible = expanded) {
    Text("Details…")
}
```

对 alpha 使用 **`animateFloatAsState`** 只会实现淡入淡出；可组合项会**保留在组合中**并继续参与布局，除非你自行控制它。仅当你有意让子项保持挂载（保留状态、焦点）但在视觉上隐藏时，才应接受这种权衡。若需要真正将其从树中移除，请使用 `AnimatedVisibility`（或采用[快速指南](https://developer.android.com/develop/ui/compose/animation/quick-guide)中的 `AnimatedVisibility` / `AnimatedContent` 模式进行条件组合）。

## 背景颜色

使用 `animateColorAsState` 平滑过渡到目标颜色。

对于子项背后的动画填充，[快速指南](https://developer.android.com/develop/ui/compose/animation/quick-guide)建议使用 **`Modifier.drawBehind`** 而不是 `Modifier.background()` 进行绘制，以便动画颜色在绘制阶段应用，从而获得适当的性能。

```kotlin
val background = animateColorAsState(
    targetValue = if (selected) selectedColor else idleColor,
    label = "background",
)
Box(
    Modifier.drawBehind { drawRect(background.value) },
) { /* content */ }
```

## 尺寸变化

`Modifier.animateContentSize()` 可为布局尺寸变化添加动画——常用于文本展开/折叠或动态标签——无需手动实现宽度/高度动画。

## 基于值的动画（`animate*AsState`）

Compose 为 `Float`、`Dp`、`Color`、`Size`、`Offset`、`Rect`、`Int`、`IntOffset`、`IntSize` 等类型提供了 `animate*AsState`。你只需提供**目标值**；API 会管理动画状态。

- 当默认值不适合 UI 时，通过 `animationSpec` 传入 [`AnimationSpec`](https://developer.android.com/reference/kotlin/androidx/compose/animation/core/AnimationSpec)（例如 `spring`、`tween`）。
- 当一个可组合项中存在多个动画时，请为每个动画设置不同的 **`label`**，以便进行调试和使用工具。
- 有关完成回调或动画顺序的详细信息，请参阅[基于值的动画](https://developer.android.com/develop/ui/compose/animation/value-based)。

```kotlin
val width by animateDpAsState(
    targetValue = if (expanded) 200.dp else 56.dp,
    animationSpec = spring(dampingRatio = 0.7f, stiffness = Spring.StiffnessMedium),
    label = "fabWidth",
)
```

## 多个属性：`rememberTransition`

当一份状态（例如 `enum class Phase { A, B, C }`）需要同步驱动**多个**动画值时，请使用 `rememberTransition`，并在该过渡上定义子动画：

```kotlin
val transition = rememberTransition(targetState = phase, label = "phase")
val alpha by transition.animateFloat(label = "alpha") { target ->
    if (target == Phase.Visible) 1f else 0f
}
val offset by transition.animateDp(label = "offset") { target ->
    if (target == Phase.Visible) 0.dp else 24.dp
}
```

应避免使用多个本应在视觉上保持同步的独立 `animate*AsState` 调用，因为当动画规格或目标值不一致时，它们可能会失去同步。旧代码可能使用 `updateTransition`；新代码应优先使用 `rememberTransition`。

## 在内容级 API 之间进行选择

当此表不足以帮助你做出选择时，请使用官方的[选择动画 API](https://developer.android.com/develop/ui/compose/animation/choose-api) 决策树。简要规则如下：

| 情况 | 优先选择 |
|---|---|
| 同一个可组合项，布局属性具有不同的**目标值** | `animate*AsState` 或 `rememberTransition` |
| 同一区域显示不同的**可组合内容**（标签页、步骤） | `AnimatedContent`（自定义 `transitionSpec`、`contentKey`）或更简单的 `Crossfade` |
| 类似分页器的**页面间滑动** | 动画文档 / Material 中的水平分页器 API——遵循选择 API 的指导 |
| 由 Navigation Compose **负责管理的过渡** | 使用导航内置的过渡，而不是在同一个目标页面切换外再叠加 `AnimatedContent` |

**基于美术资源的动效**（插图、Lottie、复杂的矢量时间轴）不属于此技能的范围；请使用专用库。

## 决策流程（概览）

```mermaid
flowchart TD
  start[Animation_need]
  start --> showHide{Show_or_hide_subtree}
  showHide -->|yes| av[AnimatedVisibility]
  showHide -->|no| oneProp{Single_property_to_target}
  oneProp -->|yes| asState["animate*AsState"]
  oneProp -->|no| multiProp{Many_props_one_state}
  multiProp -->|yes| rt[rememberTransition]
  multiProp -->|no| swapTree{Different_composable_content}
  swapTree -->|yes| ac[AnimatedContent_or_Crossfade]
  swapTree -->|no| advanced[Animatable_or_lower_level]
```

## 状态容器的 AnimatedContent 键

当 `AnimatedContent` 接收诸如 `AsyncResult<T>`、`Result<T>` 或密封的 `UiState` 等状态容器包装器时，需要确定究竟应由什么来触发过渡。通常，动画应在**内容形态**发生变化（加载 → 内容 → 错误）时运行，而不是在同一形态内的载荷发生变化时运行。

使用 `contentKey` 将丰富状态映射为动画标识：

```kotlin
AnimatedContent(
    targetState = result,
    contentKey = { state ->
        when (state) {
            AsyncResult.Loading -> "loading"
            is AsyncResult.Success -> "content"
            is AsyncResult.Error -> "error"
        }
    },
    label = "profile-content",
) { state ->
    when (state) {
        AsyncResult.Loading -> Loading()
        is AsyncResult.Success -> Profile(state.value)
        is AsyncResult.Error -> ErrorMessage(state.throwable)
    }
}
```

如果不使用 `contentKey`，每个不相等的 `Success(value)` 都可能被视为新内容。如果载荷变化应触发动画，这很有用；但当新数据只是更新同一屏幕形态时，就会显得过于频繁。

根据视觉形态选择键：

| 状态变化 | 典型的 `contentKey` |
|---|---|
| Loading → Success → Error | 分支键：`"loading"`、`"content"`、`"error"` |
| Success 条目 A → Success 条目 B 应交叉淡化 | 稳定的条目 id |
| Success 数据刷新应原地更新 | 为 `Success` 使用恒定的内容键 |
| 错误消息文本发生变化，但错误 UI 形态保持不变 | 为 `Error` 使用恒定的内容键 |

## 动画值与组合性能

`animate*AsState` 返回一个会频繁更新的 `State`。如果该值用于 `Modifier.offset`、`Modifier.graphicsLayer`、滚动相关的布局或其他**帧率级**路径，请避免在可组合函数主体中使用 `by` 读取它，然后将其传入值形式的修饰符——应改用**延迟读取**（块形式的修饰符、绘制/布局 lambda）。请参阅 [Compose 性能](../compose-performance/SKILL.md)。

如果在运动期间重组计数器激增，且与稳定性不佳无关，请参阅 [Compose 性能](../compose-performance/SKILL.md)。

## 需进一步查阅资料的情况

遇到以下任一情况时，请查阅官方文档：

| 需求 | 从这里开始 |
|---|---|
| API 决策树仍然不明确 | [选择动画 API](https://developer.android.com/develop/ui/compose/animation/choose-api) |
| 手势驱动、可中断或可取消的运动 | [`Animatable`](https://developer.android.com/reference/kotlin/androidx/compose/animation/core/Animatable)、指针输入、衰减 |
| 无限或重复循环 | [`rememberInfiniteTransition`](https://developer.android.com/reference/kotlin/androidx/compose/animation/core/rememberInfiniteTransition) |
| 可定位或由测试控制的进度 | [`SeekableTransitionState`](https://developer.android.com/reference/kotlin/androidx/compose/animation/core/SeekableTransitionState) 及相关 API |

## 常见错误

| 错误 | 修复方法 |
|---|---|
| 使用 `animateFloatAsState(alpha)` 实现淡出，却期望子项从组合中卸载 | 使用 `AnimatedVisibility`，或在隐藏时从组合中移除该子树 |
| 三个必须与同一枚举保持同步的 `animateDpAsState` 调用 | 使用一个 `rememberTransition` + 子动画 |
| 在 `Modifier.background` 上使用颜色动画，导致额外开销 | 根据快速指南，优先使用 `drawBehind { drawRect(animatedColor) }` |
| 对简单的目标值动画串联使用 `LaunchedEffect` + 手动 `Animatable` | 除非手势操作需要 `Animatable`，否则优先使用 `animate*AsState` 或 `rememberTransition` |
| 忽略 Navigation 自身的过渡动画 | 使用 Nav API 实现目标页面过渡；不要再使用 `AnimatedContent` 重复实现同一次切换 |
| `AnimatedContent(targetState = asyncResult)` 在每次数据刷新时都执行动画 | 根据视觉形态或稳定的项目标识添加 `contentKey` |

## 不应使用此技能的情况

- **副作用时序**（`LaunchedEffect`、点击后启动任务）：使用 [Compose 状态与副作用](../compose-state-and-effects/SKILL.md)。
- **深度性能调优**，例如调整快照状态的读取位置：应优先参考 [Compose 性能](../compose-performance/SKILL.md)。