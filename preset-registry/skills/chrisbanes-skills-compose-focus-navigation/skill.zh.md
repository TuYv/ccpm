---
name: compose-focus-navigation
description: Use when writing or reviewing Jetpack Compose UI for TV, keyboard, desktop, accessibility focus, D-pad navigation, FocusRequester, focusProperties, key events, or initial focus behavior.
---
# Compose：焦点导航

## 核心原则

焦点是有状态的 UI 行为：明确目标和例外边界，然后通过用户的键盘、D-pad 或遥控器输入来驱动和验证它。

## 操作步骤

1. 从已经参与焦点处理的组件开始。只有在需要特定行为时才添加钩子：

| 需求 | 添加内容 |
|---|---|
| 普通按钮/文本字段/可点击组件的焦点 | 无需额外内容；使用可聚焦组件 |
| 以编程方式设置初始焦点/恢复焦点 | `FocusRequester` + `Modifier.focusRequester(...)` |
| 对焦点变化做出视觉或状态响应 | `Modifier.onFocusChanged { ... }` |
| 自定义且原本不可聚焦的交互表面 | `Modifier.focusable()`，并酌情添加 role/semantics |

2. 从 `LaunchedEffect` 请求初始焦点或恢复焦点，并将其 keyed 到使目标出现的条件上。对于懒加载内容，按稳定的 item id 保存 requesters，并且只在 item 完成组合后请求焦点。
3. 除非存在具体的边界、跳转或陷阱错误，否则保留默认的空间搜索。仅使用 `focusProperties` 编码这些例外情况。
4. 仅针对非普通点击或遍历行为处理按键。只消费确实处理的事件；在执行高开销操作的所有者处限制快速 D-pad 操作，而不是在整个屏幕范围内限制。
5. 刷新后按语义身份恢复焦点：如果焦点所在的 id 仍然存在，则保留它；否则选择一个确定性的回退目标。
6. 使用按键/D-pad 输入和焦点语义进行测试。仅使用截图检查焦点外观。
7. 当所有有意设置的目标和例外边界都已编码，加载/刷新行为具有稳定的焦点策略，并且测试使用与用户相同的输入模型时，即可完成。

例如，仅在同时需要请求焦点和观察焦点时才执行以下操作：

```kotlin
val requester = remember { FocusRequester() }

Button(
    onClick = onClick,
    modifier = Modifier
        .focusRequester(requester)
        .onFocusChanged { state -> isFocused = state.isFocused },
) {
    Text("Play")
}
```

从 effect 中调用焦点请求，而不是在可组合函数体中调用：

```kotlin
val initialFocus = remember { FocusRequester() }

LaunchedEffect(initialFocus) {
    initialFocus.requestFocus()
}
```

如果目标在加载后出现，则将请求 keyed 到该条件：

```kotlin
LaunchedEffect(items.isNotEmpty()) {
    if (items.isNotEmpty()) {
        firstItemRequester.requestFocus()
    }
}
```

仅当默认的空间搜索不正确时才使用 `focusProperties`：

```kotlin
Modifier.focusProperties {
    up = headerRequester
    down = firstRowRequester
    left = FocusRequester.Cancel
}
```

过多的硬编码链接会创建过时的焦点图。对于特殊的按键行为，只消费确实处理的事件：

```kotlin
Modifier.onPreviewKeyEvent { event ->
    if (event.type == KeyEventType.KeyUp && event.key == Key.Back) {
        onBack()
        true
    } else {
        false
    }
}
```

通过用户输入测试焦点：

```kotlin
composeTestRule.onNodeWithTag("screen").performKeyInput {
    pressKey(Key.DirectionDown)
}

composeTestRule.onNodeWithTag("play-button").assertIsFocused()
```

更广泛的测试形态选择请参阅[Compose UI 测试模式](../compose-ui-testing-patterns/SKILL.md)。