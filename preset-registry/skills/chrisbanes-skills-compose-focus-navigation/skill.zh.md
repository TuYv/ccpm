---
name: compose-focus-navigation
description: Use when writing or reviewing Jetpack Compose UI for TV, keyboard, desktop, accessibility focus, D-pad navigation, FocusRequester, focusProperties, key events, or initial focus behavior.
---
# Compose：焦点导航

## 核心原则

焦点是一种有状态的 UI 行为。应明确指定焦点目标，在组合成功后请求焦点，并使用与用户相同的输入方式测试导航：键盘、方向键或遥控器按键。

## 何时使用此技能

当 UI 符合以下情况时，请使用此技能：

- 运行在电视、桌面设备、ChromeOS、以键盘操作为主的 Android 设备或遥控设备上。
- 使用 `FocusRequester`、`focusRequester`、`focusProperties`、`onFocusChanged` 或按键处理器。
- 需要初始焦点、焦点恢复、方向导航或返回/退出行为。
- 包含轮播、网格、惰性列表、菜单、对话框或带焦点陷阱的模态界面。
- 包含断言某个项目是否获得焦点的测试。

## 有意识地构建焦点目标

从已经支持焦点的组件开始，然后仅添加相应行为所需的焦点钩子：

| 需求 | 添加 |
|---|---|
| 普通按钮/文本字段/可点击元素的焦点 | 无需额外添加；使用可聚焦组件 |
| 以编程方式设置初始焦点/恢复焦点 | `FocusRequester` + `Modifier.focusRequester(...)` |
| 根据焦点变化更新视觉效果或状态 | `Modifier.onFocusChanged { ... }` |
| 尚不可聚焦的自定义交互式界面 | `Modifier.focusable()`，并根据需要添加角色/语义 |

例如，仅当同时需要请求焦点和观察焦点这两种行为时，才进行相应处理：

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

与其为非交互式布局手动添加 `focusable()`，不如优先使用可聚焦组件（`Button`、`TextField`、可点击/可选择界面）。仅当元素确实具有交互性或参与导航时，才手动添加焦点支持。

## 在组合后请求焦点

应从副作用中调用焦点请求，而不是从可组合项的主体中调用：

```kotlin
val initialFocus = remember { FocusRequester() }

LaunchedEffect(initialFocus) {
    initialFocus.requestFocus()
}
```

如果目标在加载后才出现，请以相应条件作为请求的键：

```kotlin
LaunchedEffect(items.isNotEmpty()) {
    if (items.isNotEmpty()) {
        firstItemRequester.requestFocus()
    }
}
```

对于惰性内容，仅在项目实际完成组合后请求焦点。应将请求器保存在以项目 ID 为键的稳定项目状态中；如果列表可以重新排序，不要仅使用索引作为键。

## 方向导航

当默认的空间搜索结果不正确时，请使用 `focusProperties`：

```kotlin
Modifier.focusProperties {
    up = headerRequester
    down = firstRowRequester
    left = FocusRequester.Cancel
}
```

请谨慎使用。布局发生变化时，过多硬编码的链接会产生过时的焦点关系图。除非设计要求特定的跳转或焦点陷阱，否则应优先采用自然焦点顺序。

## 按键事件

对于普通点击或焦点遍历以外的行为，请使用按键处理器：

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

仅在事件被消费时返回 `true`。过于宽泛地返回 `true` 会破坏文本输入、无障碍快捷键和父级导航。

对于快速的方向键输入，应在负责高开销行为的边界处进行节流（例如行滚动或分页），而不是在整个屏幕范围内全局节流。

## 焦点恢复

按语义标识保留焦点：

- 跟踪选中/聚焦项的 id，而不仅仅是索引。
- 在惰性列表和网格中使用稳定的 `key` 值。
- 当内容刷新时，如果相同 id 仍然存在，则重新为其请求焦点。
- 如果该 id 已不存在，则选择一个确定性的回退目标：最近的相邻项、第一项或父容器。

## 常见错误

| 错误 | 修复方式 |
|---|---|
| 为每个按钮添加 `focusRequester` 和 `onFocusChanged` | 仅在需要请求或观察焦点时添加 |
| 在可组合项主体中调用 `requestFocus()` | 移至 `LaunchedEffect` |
| 初始焦点以 `Unit` 为键，但目标稍后才出现 | 以已加载/可见条件为键 |
| 按惰性列表索引存储焦点请求器 | 按稳定的项 id 存储 |
| 所有内容都设置自定义 `focusProperties` | 让空间搜索正常工作；仅覆盖有问题的边界 |
| 按键处理程序对所有按键都返回 `true` | 仅消费已处理的按键 |
| 测试在电视/方向键 UI 中点击节点 | 发送按键输入并断言焦点 |

## 测试

通过用户输入测试焦点：

```kotlin
composeTestRule.onNodeWithTag("screen").performKeyInput {
    pressKey(Key.DirectionDown)
}

composeTestRule.onNodeWithTag("play-button").assertIsFocused()
```

优先断言焦点语义，而不是视觉样式。仅将截图测试用于验证焦点外观，不要用于验证确定性的焦点归属。

更广泛的测试形式选择（纯 UI 与集成测试、语义优先）：[`compose-ui-testing-patterns`](../compose-ui-testing-patterns/SKILL.md)。

## 审查期间的危险信号

- 对于键盘/电视 UI，声称“我点击它时，它能正确获得焦点”。
- 初始焦点仅在数据固定时有效，并在加载/刷新后失效。
- 当焦点和选择是不同概念时，却根据选中的数据状态推断焦点状态。
- 焦点图仅在注释中描述，却未在代码中实现或进行测试。