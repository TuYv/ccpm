---
name: compose-ui-testing-patterns
description: Use when writing or reviewing Jetpack Compose UI tests, screenshot tests, previews, semantics assertions, fake image loading, keyboard input, focus assertions, interaction state (hover/pressed/focused), or tests for plain state-driven UI composables.
---
# Compose：UI 测试模式

## 核心原则

测试能够证明行为的最小 UI 契约。优先使用由状态驱动并带有回调的普通 UI 测试。仅当生命周期、导航、DI 或平台行为本身是测试对象时，才添加集成测试。

## 测试目标选择

| 需要证明的内容 | 测试形式 |
|---|---|
| 文本、按钮、加载/错误分支、条件内容 | 普通 UI Compose 测试 |
| 点击/输入与回调的连接 | 普通 UI Compose 测试 |
| 焦点导航或键盘行为 | 带按键输入的 Compose 测试 |
| 视觉布局、裁剪、海拔、排版、图像构图 | 截图测试 |
| 状态持有者能否正确更新 UI | 状态持有者/单元测试，再加一个连接冒烟测试 |
| 悬停、按下、聚焦、拖动交互状态 | 使用 MutableInteractionSource 的普通 UI 测试 |
| 导航、生命周期、DI 集成 | 集成测试 |

## 优先使用普通 UI 测试

如果屏幕采用状态持有者/UI 分离结构，请测试普通 UI 可组合项：

```kotlin
composeTestRule.setContent {
    ProfileScreen(
        state = ProfileUiState(name = "Ada", canSave = true),
        onNameChange = {},
        onSaveClick = { saved = true },
        onBackClick = {},
    )
}

composeTestRule.onNodeWithText("Ada").assertIsDisplayed()
composeTestRule.onNodeWithText("Save").performClick()

assertThat(saved).isTrue()
```

这样可以避免为了测试布局行为而构造 ViewModel、组件、仓库、导航和依赖关系图。

## 语义优先

当行为属于语义行为时，应断言语义：

- 文本存在：`onNodeWithText`。
- 按钮已启用/禁用：`assertIsEnabled`、`assertIsNotEnabled`。
- 内容已选中/聚焦/切换：使用语义断言。
- 内容不存在：`assertDoesNotExist`。

对于没有稳定的用户可见文本，或多个节点共享相同文本的节点，请使用测试标签。不要把标签作为所有断言的首选；用户可见语义通常更可靠。

## 回调测试

使用简单的计数器或捕获的值：

```kotlin
var selectedId: String? = null

composeTestRule.setContent {
    ItemList(
        items = listOf(ItemUi("movie-1", "Movie")),
        onItemClick = { selectedId = it },
    )
}

composeTestRule.onNodeWithText("Movie").performClick()

assertThat(selectedId).isEqualTo("movie-1")
```

对于普通的回调捕获值，通常在操作后直接断言即可。当断言需要 Compose 完成快照状态应用、重组或排队的 UI 工作后再读取结果时，请使用 `runOnIdle`。

## 使用 MutableInteractionSource 测试交互状态

当可组合项的外观或行为依赖于交互状态（悬停、聚焦、按下、拖动）时，注入一个 `MutableInteractionSource` 并直接发出所需状态。不要尝试通过模拟指针/鼠标事件来触发交互状态——这种方法很脆弱、依赖环境，并且会产生不稳定的测试。

```kotlin
val interactionSource = MutableInteractionSource()

composeTestRule.setContent {
    OutlinedButton(
        onClick = {},
        interactionSource = interactionSource,
    )
}

// Assert default (un-hovered) state
composeTestRule.onNodeWithText("OutlinedButton").assertIsDisplayed()

// Emit hover — interactionSource.emit is a suspend function,
// so call it from a test coroutine scope.
TestScope().launch {
    interactionSource.emit(HoverInteraction.Enter())
}

composeTestRule.waitForIdle()

// Assert the visual/semantic change that hover produces
// (e.g., border color, elevation, or capture for screenshot test)
composeTestRule.onNodeWithText("OutlinedButton").assertIsDisplayed()
```

同样的模式也适用于 `PressInteraction.Press` / `Release` / `Cancel`、`FocusInteraction.Focus` / `Unfocus`，以及 `DragInteraction.Start` / `Stop` / `Cancel`。发出进入交互，执行 `waitForIdle`，然后断言结果。

要点：

- **始终注入 `MutableInteractionSource`**，而不是依赖默认的内部源。这样你就能完全控制状态转换。
- **从协程作用域中发出交互**（例如 `TestScope().launch { }`），因为 `emit` 是一个挂起函数。不要使用 `LaunchedEffect`——它是生产环境中的 Compose effect，而不是测试工具。
- **断言交互的*结果***（视觉变化、语义变化、启用状态），而不是交互本身。交互源是测试*驱动器*，不是断言目标。
- **这也适用于截图测试**——发出交互状态，然后捕获截图，从而获得确定性的悬停/按下/聚焦视觉效果。

## 键盘和焦点

对于键盘、电视和桌面端 UI，应使用与用户相同的输入模型（按键/方向键）来驱动导航，而不能仅依赖点击。断言焦点语义，而不是颜色或缩放；截图应仅用于验证焦点的视觉呈现。

详细信息——焦点图、`FocusRequester`、恢复、按键处理程序和测试模式：[`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)。

## 截图测试

使用截图验证语义无法证明的视觉契约：

- 布局间距/对齐。
- 主题颜色、排版、海拔、阴影。
- 图像构图、渐变、叠加层。
- 焦点高亮的外观。
- 加载骨架屏或密集的视觉状态。

保持截图状态具有确定性：

- 使用固定的状态数据。
- 尽可能冻结时钟或动画进度。
- 使用伪造或预览处理程序替代网络/图像加载。
- 除非动态文本可控，否则避免断言当前时间等动态文本。

## 伪造图像和平台服务

当图像内容无关紧要时，伪造加载器；如果请求的模型属于待验证行为，则断言该模型。具体的挂接方式取决于所使用的图像库；项目辅助函数可能如下所示：

```kotlin
val requestedModels = mutableListOf<Any?>()

// Example helper, not a Compose API.
setContentWithFakeImageLoader { request ->
    requestedModels += request.data
    errorPainter()
}
```

当图像外观很重要时，应提供具有确定性的本地 painter/bitmap，而不是网络数据。

## 常见错误

| 错误 | 修正方式 |
|---|---|
| 为测试错误行而构建完整的应用图 | 使用 `state = Error` 测试纯 UI |
| 通过 ViewModel mock 测试点击行为 | 传入回调并断言它已被调用 |
| 使用截图测试验证简单文本是否存在 | 使用语义断言 |
| 使用语义测试验证内边距/颜色/焦点环 | 使用截图测试 |
| 到处使用测试标签 | 当文本/内容描述/角色稳定时，优先使用它们 |
| UI 测试依赖真实的图像加载/网络/时间 | 伪造或冻结数据源 |
| 使用鼠标或触摸事件模拟悬停/按下/聚焦 | 注入 `MutableInteractionSource` 并发出交互 |
| 在测试中依赖默认的 `InteractionSource` | 传入 `MutableInteractionSource`，以便控制状态 |
| 仅使用 `performClick` 测试电视/键盘 UI | 使用按键输入和焦点断言；参见 [compose-focus-navigation](../compose-focus-navigation/SKILL.md) |

## 审查期间的危险信号

- “这个 UI 测试不稳定，是因为图片加载缓慢。”
- 测试使用生产环境 DI 来进行简单渲染。
- 截图中包含随机日期、时钟、远程图片或实时数据。
- 执行操作后，断言只检查节点是否存在，而不检查回调或状态变更是否发生。
- 仅通过目视检查焦点行为，而未使用断言进行验证。
- 测试使用 `performMouseInput` 或触摸注入来触发悬停/按下状态，而不是使用 `MutableInteractionSource.emit`。
- composable 接受 `interactionSource`，但测试没有注入 `MutableInteractionSource`。