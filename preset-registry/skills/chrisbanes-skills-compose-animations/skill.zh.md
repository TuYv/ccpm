---
name: compose-animations
description: "Use when writing or reviewing Jetpack Compose motion: visibility enter/exit, animating one property toward a target, color or size transitions, multiple properties from one state, switching composable content, or choosing between AnimatedVisibility, animate*AsState, rememberTransition, AnimatedContent, and Crossfade."
---
# Compose：动画

## 核心原则

选择能够表达动效及其生命周期的最小 API。

## 流程

1. 明确任务：显示或隐藏一个子树、为单个值设置动画、协调来自同一状态的多个值、调整内容大小、替换内容，或处理用户驱动的动效。
2. 从表格中选择匹配的 API。优先使用目标状态 API；只有在手势、中断或命令式控制有要求时才使用 `Animatable`。
3. 检查生命周期：alpha 动画会保持内容处于组合状态；`AnimatedVisibility` 会在退出动画完成后移除内容。需要卸载内容时，不要使用淡出动画。
4. 对于 `AnimatedContent`，从内容 lambda 的目标状态进行渲染，并且仅当视觉身份与载荷相等性不同时才选择 `contentKey`。有关状态持有者的详细信息，请阅读 [AnimatedContent 身份](references/animated-content.md)。
5. 当动画 `State` 以帧率变化时，将其保留在布局或绘制块修饰符中；更深入的诊断请参阅 [Compose 性能](../compose-performance/SKILL.md)。
6. 对于由 Navigation Compose 负责的目标页面切换，使用 Navigation Compose 过渡；对于基于艺术素材的动效，使用专用库。
7. 当 API、生命周期和内容身份与 UI 相匹配，不存在更简单的 API，并且已验证相关行为时完成。

## API 选择

| 需求 | 优先使用 |
|---|---|
| 使用进入/退出语义显示或隐藏子树 | [`AnimatedVisibility`](https://developer.android.com/develop/ui/compose/animation/composables-modifiers#animatedvisibility) |
| 一个值跟随状态变化 | `animate*AsState` |
| 多个值跟随同一个布尔值、枚举或密封状态变化 | `rememberTransition` 加子动画 |
| 子项大小变化 | `Modifier.animateContentSize()` |
| 不同的可组合树填充同一区域 | `AnimatedContent`，简单场景使用 `Crossfade` |
| 拖动、fling、中断或命令式控制 | [`Animatable`](https://developer.android.com/reference/kotlin/androidx/compose/animation/core/Animatable) |

当默认动效不合适时使用 `AnimationSpec`；当多个动画需要在工具中可见时，为它们使用不同的 `label`。

```kotlin
val width by animateDpAsState(
    targetValue = if (expanded) 200.dp else 56.dp,
    animationSpec = spring(dampingRatio = 0.7f),
    label = "fabWidth",
)
```

对于必须保持同步的值，应在同一个 transition 上定义它们，而不是使用多个相互独立的 `animate*AsState` 调用：

```kotlin
val transition = rememberTransition(targetState = phase, label = "phase")
val alpha by transition.animateFloat(label = "alpha") { target ->
    if (target == Phase.Visible) 1f else 0f
}
val offset by transition.animateDp(label = "offset") { target ->
    if (target == Phase.Visible) 0.dp else 24.dp
}
```

对于动画填充，当颜色每帧更新时，优先使用 `drawBehind { drawRect(color.value) }`，而不是使用值形式的 background。对于 API 存在歧义的情况，请先参考官方的[选择动画 API](https://developer.android.com/develop/ui/compose/animation/choose-api)指南；使用 [`rememberInfiniteTransition`](https://developer.android.com/reference/kotlin/androidx/compose/animation/core/rememberInfiniteTransition) 实现重复循环，使用 [`SeekableTransitionState`](https://developer.android.com/reference/kotlin/androidx/compose/animation/core/SeekableTransitionState) 实现可跳转或由测试控制的进度。

## 不应使用此技能的场景

- 对于副作用时机或由点击触发的工作，请使用 [Compose 状态与副作用](../compose-state-and-effects/SKILL.md)。
- 对于深入的状态读取或重组诊断，请使用 [Compose 性能](../compose-performance/SKILL.md)。