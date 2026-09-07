---
name: ios-product-dev
description: "Own end-to-end native iOS product work in SwiftUI: shape, implement, and verify beautiful, accessible Companion features while preserving the shared API and platform boundaries. Use for iOS feature work, product-facing UI changes, and native client reviews; route pure visual design or build-only requests to the focused skills."
metadata:
  short-description: "Own native iOS product work"
---
# 原生 iOS 产品开发

将本技能用作原生 iOS 产品变更的负责技能。它涵盖产品意图、平台转译、SwiftUI 实现协调以及发布级质量验证。它不取代跨平台视觉负责技能，也不取代聚焦的 SwiftUI 和 XcodeBuildMCP 技能。

## 受保护的不变量

- 在修改代码之前，先阅读仓库和 apps/ios 的指导文档。将这些文档、现有实现和共享 API 契约视为事实来源。
- 使用 Swift 6，目标为 iOS 26 或更高版本，并保持应用不包含第三方运行时依赖。将模型、网络、认证、安全会话状态和轮询保留在 CompanionKit 中；将 SwiftUI 呈现和平台集成保留在应用 target 中。
- 保留完整的 Companion 客户端契约。使用现有的 /v1 API 和共享模型；绝不发明仅限移动端的端点，不发送客户端界面判别符，也不因为当前界面是移动端而隐藏 Skills、Plugins、MCP 连接、附件、例程、触发器、分享、设置或其他产品工作流。
- API 负责持久化并读取控制面意图。iOS 客户端从不直接联系 Box 或 Pi，从不处理 Box 凭据，也从不把输入、轮询或 Viewer 读取变成唤醒动作。发送是正常的唤醒路径；Viewer 始终保持只读。
- 不要手工编辑 Companion.xcodeproj/project.pbxproj。该项目使用文件系统同步组，因此常规的 Swift 文件添加应遵循现有布局。
- 保留现有的应用身份和配置：Debug 使用本地开发 bundle 和 URL scheme，Release 使用生产 bundle 和 API URL；除非用户明确更改，否则文档中记载的显示名称、bundle 名称、团队和 App Store 记录保持不变。
- 遵循 Companion 设计语言：系统字体排印和动态颜色、扁平的细线结构、简洁的句首大写风格文案、明确的状态文本，以及无障碍的焦点和内容状态。唯一的玻璃例外是用于导航和交互控件的原生 iOS 26 系统 Liquid Glass。内容使用系统材质，为“降低透明度”提供不透明回退，并且不要用自定义着色器、模糊堆栈、渐变或第三方组件来模仿玻璃。
- 尊重动态字体、VoiceOver、减弱动态效果、降低透明度、足够大的点击目标、适用情况下的键盘/焦点导航，以及不依赖颜色的状态传达。

## 所有权与交接

- 对于视觉方向、交互层级、文案、颜色、动效、响应式构图或反模式审查，与 design-frontend-dev 协调。只阅读相关的 register 或聚焦的参考资料，并将其决策转换为原生控件；不要在本技能内部复制它的设计 register。
- 对于 SwiftUI 状态所有权、视图组合、async/await、性能或可测试性，将聚焦的实现问题移交给 swiftui-expert-dev。
- 对于发现、模拟器构建、测试、启动、截图、日志或 UI 检查，使用 xcodebuildmcp-cli。不要退回使用原始的 xcodebuild、xcrun 或 simctl。
- 对于大范围的只读代码审查，在实现之后使用 review-code-dev。对于仓库交付或 PR，在 iOS 检查完成后移交给 ship-pr-dev。

## 工作流程

1. 建立上下文。阅读最近的 AGENTS.md、apps/ios/README.md、DESIGN.md、docs/product.md、docs/design.md，以及被更改的界面、模型或测试。判断该请求是更改 CompanionKit、应用呈现、API 假设，还是仅更改视觉处理。
2. 塑造产品行为。明确用户、授权角色、持久状态，以及加载、空、错误、中断、离线和无障碍状态。保持操作真实情况可见：例如，只有已获确认的进行中尝试才可以说 Companion 正在回复，而过期的轮询不得让较新的状态倒退。
3. 协调设计。当请求涉及大量视觉或交互内容时，向 design-frontend-dev 询问最小的相关设计决策。优先使用原生 NavigationStack 或 NavigationSplitView、系统控件和平台惯例。保持 Companion 产品冷静、紧凑、易读的层级结构，而不是添加装饰性的界面修饰。
4. 在正确的层级实现。将 API 契约、Codable 模型、会话/认证行为、轮询和确定性的领域逻辑放在 CompanionKit 中。将视图状态投影、导航、sheet、平台集成和无障碍呈现放在应用 target 中。保持依赖通过注入提供，并显式处理取消。
5. 覆盖整个状态面。在相关情况下，包括加载、空、成功、失败、重试/取消、权限差异（Owner、Editor、Viewer）、动态字体、减弱动效/降低透明度、长内容、键盘或安全区域变化，以及网络丢失。让文件保持在拥有它们的消息上；不要创建文件库或 artifact 界面。
6. 使用 xcodebuildmcp-cli 进行验证。运行受影响的 CompanionKit 测试、一次模拟器构建，以及最小有用的模拟器/UI 检查。使用截图或 UI 断言来验证层级结构、可读的对比度、状态标签以及被更改的交互。检查实际结果，而不仅仅是进程退出状态。
7. 清晰地交接。报告用户可见的行为、已更改的文件、测试/构建/UI 检查、已知的环境限制，以及任何属于 design-frontend-dev、swiftui-expert-dev、review-code-dev 或 ship-pr-dev 的后续事项。

## 原生质量标准

优先使用具有稳定标识和状态驱动导航的小型可组合视图。使用现有的 APIClient 和会话抽象，而不是重复实现认证或传输逻辑。使异步工作可取消，并与相关视图或模型的生命周期绑定。在 UI 自动化需要时，为每个交互控件提供有意义的无障碍标签和标识符。保持产品文案简练且面向操作，并在机器值承载关键作用时按字面原样展示。

在交接之前，运行受影响的 CompanionKit 测试和一次模拟器构建。对于仓库范围的更改，还应运行仓库的 verify:change 门禁。如果所需的模拟器、CLI、凭据或服务不可用，应在安全边界处停止，报告确切缺失的前置条件，并且不要用未经批准的工具替代，也不要捏造通过的结果。
