---
name: compose-ui-testing-patterns
description: Use when writing or reviewing Jetpack Compose UI tests, screenshot tests, previews, semantics assertions, fake image loading, keyboard input, focus assertions, interaction state (hover/pressed/focused), or tests for plain state-driven UI composables.
---
# Compose：UI 测试模式

## 核心原则

测试能够证明该行为的最小 UI 契约。优先使用带回调的纯状态驱动 UI 测试。只有当生命周期、导航、DI 或平台行为本身是测试对象时，才添加集成测试。

## 操作步骤

1. 说明任务要求你证明的行为和测试关注点。
2. 针对该关注点检查现有测试，并从下表中选择足够的最小测试切入点。
3. 将聚焦的修改限制在请求的测试关注点内。不要将仅供测试使用的辅助项移入生产代码，也不要扩大生产 API，除非该生产边界本身就是测试对象。
4. 驱动受控状态或输入，在需要时通过 Compose 进行同步，并断言可观察的语义、视觉或回调结果。
5. 如果现有测试已经使用了最狭窄的有效测试切入点，并且证明了所请求的行为，则不做修改。

## 测试目标选择

| 需要证明的内容 | 测试形式 |
|---|---|
| 文本、按钮、加载/错误分支、条件内容 | 纯 UI Compose 测试 |
| 点击/输入的回调连接 | 纯 UI Compose 测试 |
| 焦点导航或键盘行为 | 使用按键输入的 Compose 测试 |
| 视觉布局、裁剪、阴影、字体排印、图像组合 | 截图测试 |
| 状态持有者是否正确更新 UI | 状态持有者/单元测试，加一个连接冒烟测试 |
| 悬停、按下、聚焦、拖动交互状态 | 使用 MutableInteractionSource 的纯 UI 测试 |
| 导航、生命周期、DI 集成 | 集成测试 |

## 优先使用纯 UI 测试

如果屏幕采用状态持有者/UI 分离的结构，请测试纯 UI composable：

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

这样可以避免为了测试布局行为而构造 ViewModels、组件、仓库、导航和依赖关系图。

## 优先使用语义

当行为属于语义行为时，断言语义：

- 文本存在：`onNodeWithText`。
- 按钮已启用/已禁用：`assertIsEnabled`、`assertIsNotEnabled`。
- 内容已选中/已聚焦/已切换：使用语义断言。
- 内容不存在：`assertDoesNotExist`。

对于没有稳定的用户可见文本的节点，或多个节点共享相同文本的情况，使用测试标签。不要将标签作为所有断言的首选；用户可见的语义通常更可靠。

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

对于直接捕获的回调值，操作后直接断言通常就足够了。当断言需要 Compose 在读取结果前完成快照状态的应用、重组或排队的 UI 工作时，使用 `runOnIdle`。

## 保持 UI 测试的确定性

对于布局、分支和回调行为，使用 `setContent` 渲染受控状态，而不是构建生产应用图。生产环境中的 DI、存储库、生命周期观察者和后台副作用会增加与普通 UI 契约无关的异步工作，并可能导致测试不稳定。

不要使用 `Thread.sleep` 等待 Compose。将 UI 驱动到已知状态，然后使用语义断言和 Compose 同步机制（`waitForIdle`、`runOnIdle`，或针对真实异步条件使用有界的 `waitUntil`）。仅当行为确实依赖导航、生命周期、DI 或平台连接时，才使用完整应用集成测试。

## 使用 MutableInteractionSource 处理交互状态

当可组合项的外观或行为取决于交互状态（悬停、聚焦、按下、拖动）时，注入 `MutableInteractionSource` 并直接发出所需状态。不要尝试模拟指针/鼠标事件来触发交互状态——这种方式不稳定、依赖环境，并且会产生不稳定的测试。

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

相同的模式也适用于 `PressInteraction.Press` / `Release` / `Cancel`、`FocusInteraction.Focus` / `Unfocus`，以及 `DragInteraction.Start` / `Stop` / `Cancel`。发出进入交互，执行 `waitForIdle`，然后断言结果。

要点：

- **始终注入 `MutableInteractionSource`**，而不是依赖默认的内部 source。这样可以完全控制状态转换。
- **从协程作用域发出交互**（例如 `TestScope().launch { }`），因为 `emit` 是挂起函数。不要使用 `LaunchedEffect`——那是生产环境中的 Compose effect，不是测试工具。
- **断言交互的*结果***（视觉变化、语义变化、启用状态），而不是交互本身。交互 source 是测试*驱动器*，不是断言目标。
- **截图测试同样适用**——发出交互状态，然后捕获截图，以获得确定性的悬停/按下/聚焦视觉效果。

## 键盘与焦点

对于键盘、电视和桌面 UI，使用用户所采用的相同输入模型（按键/D-pad）来驱动导航，而不只是点击。断言聚焦语义，而不是颜色或缩放；将截图留给视觉焦点效果。

详细信息——焦点图、`FocusRequester`、恢复、按键处理器和测试模式：[`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)。

## 截图测试

对于语义无法验证的视觉契约，使用截图进行测试：

- 布局间距/对齐。
- 主题颜色、字体排版、立体效果、阴影。
- 图像构图、渐变、叠加层。
- 焦点高亮的外观。
- 加载骨架屏或密集的视觉状态。

保持截图状态具有确定性：

- 使用固定的状态数据。
- 尽可能冻结时钟或动画进度。
- 使用伪造的或预览用的处理器替代网络/图像加载。
- 除非受到控制，否则避免断言当前时间等动态文本。

## 伪造图像和平台服务

当图像内容无关紧要时，伪造加载器，并在该行为需要验证时断言所请求的模型。具体 hook 取决于你的图像库；项目辅助函数可能如下所示：

```kotlin
val requestedModels = mutableListOf<Any?>()

// Example helper, not a Compose API.
setContentWithFakeImageLoader { request ->
    requestedModels += request.data
    errorPainter()
}
```

当图像外观很重要时，提供确定性的本地 painter/bitmap，而不是网络数据。