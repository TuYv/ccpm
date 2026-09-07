---
name: swiftui-expert-dev
description: "Provide focused SwiftUI implementation expertise for native iOS work: state ownership, composition, navigation, concurrency, performance, accessibility, and testability. Use when the product direction is known and the question is how to implement or refactor SwiftUI safely; route product shaping and build orchestration to their owner skills."
metadata:
  short-description: "Implement SwiftUI safely"
---
# SwiftUI 实现专长

将此技能作为原生 iOS 任务中的一项聚焦实现能力来使用。它提升 SwiftUI 与 Swift 并发的实现功底，但不接管产品方向、跨平台设计、API 授权或构建编排。

## 受保护的不变量

- 在编辑之前，先阅读最近的仓库与 iOS 指导。遵循现有的 Swift 6、iOS 26、文件系统同步式 Xcode 工程以及零第三方依赖等约束。
- 让 CompanionKit 继续负责模型、Cododable/API 契约、认证、安全会话状态、轮询与领域逻辑。将视图组合与平台呈现保留在 app target 中。不要在 View 中重复传输或认证代码。
- 保持共享的 /v1 契约与完整的产品功能对等。不要添加仅限移动端的 API、客户端层面的判别器、能力缩减模式或直接的 Box/Pi 访问。
- 绝不要为了添加普通 Swift 文件而手工编辑 Companion.xcodeproj/project.pbxproj。
- 不要使用装饰性的自定义玻璃效果、着色器、模糊堆叠、渐变或第三方 UI 组件。原生 iOS 26 Liquid Glass 仅限用于系统导航和交互控件；内容在系统材质上必须保持可读，并在启用 Reduce Transparency 时变为不透明。
- 无障碍是正确性的一部分：支持 Dynamic Type、VoiceOver 标签/特征、Reduce Motion 与 Reduce Transparency、相关的键盘/焦点导航、充足的点击目标，以及不单靠颜色传达的状态含义。

## 范围与交接

- 请 ios-product-dev 负责用户意图、角色/授权行为、API 对等与最终产品决策。将实现结论与聚焦的补丁交回给该负责人。
- 请 design-frontend-dev 负责视觉基调、层级、文案、颜色、动效与反模式决策。将其最小粒度的相关决策转换为原生系统控件；不要在这里再造第二套设计系统。
- 请 xcodebuildmcp-cli 负责项目发现、构建、测试、模拟器启动、截图、日志与 UI 检查。本技能可以建议检查项，但不替代该工作流。
- 在聚焦实现完成后，使用 review-code-dev 进行宽泛的只读审查。

## 实现手册

### 状态与标识

- 为每一段状态确定唯一的真值来源。将视图本地的瞬态状态保持在本地；将会话、线程和服务器状态保存在具有稳定生命周期的注入式 model/store 中。
- 优先使用项目现有的 Observation 方式。在引入新的观察机制时，使用能保持标识的最小所有权；仅在编辑状态的边界处使用绑定。避免在频繁重算的 View body 中创建引用类型模型。
- 让导航、sheet、alert、确认对话框与焦点状态保持显式且数据驱动。优先使用带有稳定、基于值路由的 NavigationStack 或 NavigationSplitView。深层链接与状态恢复应映射到同一路由状态，而不是特例视图。
- 为 ForEach 和列表提供稳定的领域 ID。不要将数组偏移量用作可变服务器数据的标识，也不要用 AnyView 掩盖标识问题。

### 并发与数据流

- 将 UI 变更保持在 main actor 上，并使跨 actor 的值符合 Sendable。将可变的网络/缓存状态隔离在现有的 actor 或 service 中，而不是在视图间散布锁。
- 使用 async/await 与结构化任务。当输入变化时，通过任务取消和任务 ID 将工作绑定到相应的模型或视图生命周期。被取消的任务不得将过期结果或错误发布到更新的状态之上。
- 避免从 View 初始化器或 body 求值中启动网络工作。防止 onAppear 中的重复工作，在现有 store 预期之处合并刷新，并保留服务器持久的排序与幂等标识符。
- 将轮询视为状态同步而非动画。仅当响应属于当前资源/版本且不会将更新的状态向后推移时才应用它。Viewer 的读取操作绝不能启动生命周期工作。
- 将客户端、时钟、UUID 生成及其他副作用注入到可测试的边界。当注入的时钟或确定性 continuation 能够表达该行为时，绝不要在测试中 sleep。

### 组合与性能

- 依据行为边界而非任意行数保持视图小巧。当某个部分拥有有意义的状态或无障碍契约时再提取为组件，并让样式贴近组件的用途。
- 在使用自定义手势机制之前，优先使用原生控件、label、contentShape、safeAreaInset 与布局工具。保留系统导航、键盘、焦点与 Dynamic Type 行为，而不是与布局引擎对抗。
- 对真正很长的集合使用 LazyVStack、LazyHStack 和懒加载网格。优化之前先测量；当稳定的布局或记忆化的值就足够时，避免宽泛的类型擦除、重复的高开销格式化、GeometryReader 驱动的布局以及隐式动画的频繁变动。
- 将高开销的解析、图像处理与排序移出 body。渲染有界预览并保留稳定 ID，使更新不会重建整个线程。

### 交互与无障碍

- 为每个操作提供可见的标签，以及描述结果的 VoiceOver 标签。仅当整行合并为单次朗读摘要更清晰时才合并该行；否则保留子操作。
- 将状态颜色与诸如 Online、Starting、Asleep、Error、Healthy 或 Unknown 的文字搭配使用。不要用脉冲、发光或仅颜色的圆点来传达实时状态。
- 遵循减弱动效与减弱透明度的环境值。当用户请求这些减弱设置时，用瞬时状态变化替代动效，用不透明的高对比度表面替代玻璃/材质。
- 保持加载、空、错误、重试/取消、权限与禁用状态的显式。仅对有意义的变化使用无障碍通知，而不是每次轮询都通知。
- 为重要控件保留 UI 自动化标识符。测试行为与无障碍标签，而不只是像素快照。

## 验证交接

对于聚焦的变更，返回：状态模型与所有权决策、并发/取消的推理、已考虑的无障碍状态、受影响的测试，以及仍需要的任何视觉或工具检查。然后将模拟器/构建/测试的执行交给 xcodebuildmcp-cli，将完整的产品决策交给 ios-product-dev。如果某个前置条件不可用，请如实报告，而不是使用原生 Xcode 命令行工具或编造通过的结果。
