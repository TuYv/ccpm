---
name: compose-ui-testing-patterns
description: Use when writing or reviewing Jetpack Compose UI tests, screenshot tests, previews, semantics assertions, fake image loading, keyboard input, focus assertions, interaction state (hover/pressed/focused), or tests for plain state-driven UI composables.
---
# Compose：UI 测试模式

## 核心原则

测试能够证明行为的最小 UI 契约。优先使用带回调的纯状态驱动 UI 测试。只有当生命周期、导航、DI 或平台行为本身是测试对象时，才添加集成测试。

## 流程

1. 陈述任务要求你证明的行为和测试关注点。
2. 针对该关注点检查现有测试，并从下表中选择足够的最小接缝。
3. 将聚焦的修改限制在请求的测试关注点内。不要将仅供测试使用的辅助工具移入生产代码，也不要扩大生产 API，除非该生产边界本身就是测试对象。
4. 驱动受控状态或输入，在需要时通过 Compose 进行同步，并断言一个可观察的语义、视觉或回调结果。
5. 如果现有测试已经使用最窄的有效接缝并证明了请求的行为，则无需进行修改。

## 测试目标选择

| 需要证明的内容 | 测试形式 |
|---|---|
| 文本、按钮、加载/错误分支、条件内容 | 纯 UI Compose 测试 |
| 点击/输入产生的回调连接 | 纯 UI Compose 测试 |
| 焦点导航或键盘行为 | 带按键输入的 Compose 测试 |
| 视觉布局、裁剪、仰角、排版、图像组合 | 截图测试 |
| 状态持有者正确更新 UI | 状态持有者/单元测试，加一项连接冒烟测试 |
| 悬停、按下、聚焦、拖动交互状态 | 使用 MutableInteractionSource 的纯 UI 测试 |
| 导航、生命周期、DI 集成 | 集成测试 |

## 优先使用纯 UI 测试

如果屏幕采用状态持有者/UI 分离的结构，则测试纯 UI 可组合项：

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

这样可以避免为了布局行为而构造 ViewModels、组件、存储库、导航和依赖关系图。

## 语义优先

当行为属于语义行为时，断言语义：

- 文本存在：`onNodeWithText`。
- 按钮已启用/已禁用：`assertIsEnabled`、`assertIsNotEnabled`。
- 内容已选中/已聚焦/已切换：使用语义断言。
- 内容不存在：`assertDoesNotExist`。

对于没有稳定的用户可见文本的节点，或多个节点共享相同文本的情况，使用测试标签。不要将标签作为所有断言的首选；用户可见的语义通常更强。

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

对于直接捕获的回调值，操作后直接断言通常就足够了。当断言需要 Compose 完成快照状态应用、重组或排队的 UI 工作后才能读取结果时，使用 `runOnIdle`。

## 保持 UI 测试的确定性

对于布局、分支和回调行为，使用 `setContent` 渲染受控状态，而不是构建生产应用图。生产环境中的 DI、存储库、生命周期观察者和后台副作用会增加与纯 UI 契约无关的异步工作，并可能导致测试不稳定。

不要使用 `Thread.sleep` 等待 Compose。将 UI 驱动到已知状态，然后使用语义断言和 Compose 同步机制（`waitForIdle`、`runOnIdle`，或针对真实异步条件使用有界的 `waitUntil`）。只有对于确实依赖导航、生命周期、DI 或平台连接的行为，才使用完整应用集成测试。

## 使用 MutableInteractionSource 管理交互状态

当可组合项的外观或行为取决于交互状态（悬停、焦点、按下、拖动）时，注入一个 `MutableInteractionSource`，并直接发出所需状态。不要尝试通过模拟指针/鼠标事件来触发交互状态——这种方法很脆弱，依赖环境，并且会产生不稳定的测试。

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

同样的模式适用于 `PressInteraction.Press` / `Release` / `Cancel`、`FocusInteraction.Focus` / `Unfocus`，以及 `DragInteraction.Start` / `Stop` / `Cancel`。发出进入交互，执行 `waitForIdle`，然后断言结果。

要点：

- **始终注入 `MutableInteractionSource`**，而不是依赖默认的内部 source。这样你可以完全控制状态转换。
- **从协程作用域中发出交互**（例如 `TestScope().launch { }`），因为 `emit` 是一个挂起函数。不要使用 `LaunchedEffect`——那是生产环境中的 Compose effect，不是测试工具。
- **断言交互的*结果***（视觉变化、语义变化、启用状态），而不是交互本身。交互源是测试的*驱动器*，不是断言目标。
- **截图测试也使用此方法**——发出交互状态，然后捕获截图，以获得确定性的悬停/按下/焦点视觉效果。

## 键盘和焦点

对于键盘、电视和桌面 UI，使用用户实际采用的相同输入模型（按键/D-pad）驱动导航，而不是只使用点击。断言获得焦点的语义，而不是颜色或缩放；将截图留给视觉上的焦点样式。

详细信息——焦点图、`FocusRequester`、恢复、按键处理器和测试模式：[`compose-focus-navigation`](../compose-focus-navigation/SKILL.md)。

## 截图测试

对于语义无法证明的视觉契约，使用截图：

- 布局间距/对齐。
- 主题颜色、字体排版、层级、阴影。
- 图像构图、渐变、叠加层。
- 焦点高亮的外观。
- 加载骨架屏或密集视觉状态。

保持截图状态具有确定性：

- 使用固定的状态数据。
- 尽可能冻结时钟或动画进度。
- 使用虚假的或预览用的处理器替代网络/图像加载。
- 除非已加以控制，否则避免断言当前时间等动态文本。

## 虚假图像和平台服务

当图像内容无关紧要时，伪造加载器，并在该行为对应时断言所请求的模型。具体 hook 取决于你的图像库；项目辅助函数可能类似于：

```kotlin
val requestedModels = mutableListOf<Any?>()

// Example helper, not a Compose API.
setContentWithFakeImageLoader { request ->
    requestedModels += request.data
    errorPainter()
}
```

当图像外观很重要时，提供确定性的本地 painter/bitmap，而不是网络数据。

## 常见错误

| 错误 | 修复 |
|---|---|
| 构建完整的应用图来测试错误行 | 使用 `state = Error` 测试纯 UI |
| 通过 ViewModel mock 测试点击行为 | 传入回调并断言该回调已被调用 |
| 为简单的文本存在性编写截图测试 | 使用语义断言 |
| 为内边距/颜色/焦点环编写语义测试 | 使用截图测试 |
| 到处使用测试标签 | 当文本/内容描述/角色稳定时，优先使用它们 |
| UI 测试依赖真实的图像加载/网络/时间 | 伪造或冻结数据源 |
| 操作后休眠一段时间再断言 UI | 使用语义断言以及 `waitForIdle`、`runOnIdle` 或有界的 `waitUntil` |
| 为状态/渲染断言使用生产环境 DI 或应用接线 | 使用 `setContent` 渲染受控状态；仅当该接线本身处于测试范围内时才使用集成测试 |
| 使用鼠标或触摸事件模拟悬停/按下/焦点 | 注入 `MutableInteractionSource` 并发出交互 |
| 在测试中依赖默认的 `InteractionSource` | 传入 `MutableInteractionSource`，以便控制状态 |
| 仅使用 `performClick` 测试 TV/键盘 UI | 使用按键输入和焦点断言；参见 [compose-focus-navigation](../compose-focus-navigation/SKILL.md) |

## 审查期间的危险信号

- “这个 UI 测试不稳定，因为图像加载很慢。”
- 测试为简单渲染使用生产环境 DI。
- 截图包含随机日期、时钟、远程图像或实时数据。
- 断言只检查执行操作后节点是否存在，而不检查回调/状态变化是否发生。
- 只通过视觉检查焦点行为，却没有进行断言。
- 测试使用 `performMouseInput` 或注入触摸来触发悬停/按下状态，而不是使用 `MutableInteractionSource.emit`。
- 可组合项接受 `interactionSource`，但测试没有注入 `MutableInteractionSource`。
- 纯渲染测试启动生产应用，或在断言前使用 `Thread.sleep`。

## RED/GREEN 代理场景

1. RED 启动生产应用，使用 `Thread.sleep` 等待，并且只断言节点存在。GREEN 使用 `setContent` 渲染固定状态，执行操作，通过 Compose 进行同步，并断言语义状态或回调结果。
2. 新颖案例：某个屏幕的仓库支持状态持有器启动后台工作，但测试只需要证明 Save 按钮处于禁用状态。GREEN 直接测试纯 UI 状态；如有需要，另行使用集成测试覆盖状态持有器的接线。
3. 反例：导航行为依赖真实的 `NavController` 生命周期。GREEN 使用集成测试，而不是假装纯渲染测试能够证明该契约。
4. 聚焦反例：一个仅涉及值的格式化器测试已经使用纯单元测试，而任务只询问是否需要 UI 测试框架。GREEN 保持测试本地辅助函数和工作区不变。