---
name: hig-platforms
version: 1.0.0
description: >-
  Apple Human Interface Guidelines for platform-specific design. Use this skill when the user asks about
  "designing for iOS", "iPad app design", "macOS design", "tvOS", "visionOS", "watchOS", "Apple platform",
  "which platform", platform differences, platform-specific conventions, or multi-platform app design.
  Also use when the user says "should I design differently for iPad vs iPhone", "how does my app work
  on visionOS", "what's different about macOS apps", "porting my app to another platform",
  "universal app design", or "what input methods does this platform use".
  Cross-references: hig-foundations for shared design foundations, hig-patterns for interaction patterns,
  hig-components-layout for navigation structures, hig-components-content for content display.
---
# Apple HIG：平台设计

在提出问题之前，先检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **每个平台都有独特的身份。** 不要在不同平台之间直接移植设计。遵循每个平台的惯例、交互模型和用户预期。

2. **iOS：触控优先。** 在手持屏幕上进行直接操作。针对单手使用进行优化。导航使用标签栏和 push/pop 堆栈。

3. **iPadOS：扩展画布。** 支持 Split View、Slide Over 和 Stage Manager。使用侧边栏和多栏布局。在触控之外，同时支持指针和键盘。

4. **macOS：指针和键盘。** 可以接受高密度的信息展示。广泛使用菜单栏、工具栏和键盘快捷键。窗口可调整大小，并支持精确控制。

5. **tvOS：遥控器和焦点。** 用户从远处观看。针对 Siri Remote 采用基于焦点的导航进行设计。使用大字号、简单布局和线性导航。

6. **visionOS：空间交互。** 使用窗口、体积和空间构成 3D 环境。通过眼动追踪进行目标定位，通过间接手势进行交互。注意符合人体工程学的舒适区域。

7. **watchOS：一瞥可见且简短。** 信息应可一瞥获取。交互应简短。使用 Digital Crown、触觉反馈和复杂功能及时呈现内容。

8. **游戏：拥有自身范式。** 可以自由定义游戏内交互模型，但仍应遵循系统交互的平台惯例（通知、辅助功能、控制器）。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [designing-for-ios.md](references/designing-for-ios.md) | iOS | 触控、标签栏、导航堆栈、手势、屏幕尺寸、安全区域 |
| [designing-for-ipados.md](references/designing-for-ipados.md) | iPadOS | 多任务处理、侧边栏、指针、键盘、Apple Pencil、Stage Manager |
| [designing-for-macos.md](references/designing-for-macos.md) | macOS | 菜单栏、工具栏、窗口管理、键盘快捷键、高密度布局、Dock |
| [designing-for-tvos.md](references/designing-for-tvos.md) | tvOS | 焦点引擎、Siri Remote、放松观看体验、内容优先、视差 |
| [designing-for-visionos.md](references/designing-for-visionos.md) | visionOS | 空间计算、窗口/体积/空间、眼动追踪、手部手势、深度 |
| [designing-for-watchos.md](references/designing-for-watchos.md) | watchOS | 一瞥式 UI、Digital Crown、复杂功能、通知、触觉反馈 |
| [designing-for-games.md](references/designing-for-games.md) | 游戏 | 控制器、沉浸式体验、平台特定惯例、辅助功能 |

## 决策框架

1. **确定主要使用场景。** 移动途中（iOS/watchOS）、在办公桌前（macOS）、在沙发上（tvOS），还是处于空间环境中（visionOS）？

2. **让输入方式匹配交互方式。** 直接操作使用触控，精确操作使用指针，空间交互使用注视+手势，快速滚动使用 Digital Crown，焦点导航使用遥控器。

3. **进行适配，而不是复制。** macOS 的侧边栏在 iPhone 上应转化为标签栏。visionOS 中的体积在 watchOS 上没有对应形式。转换的是意图，而不是实现方式。

4. **发挥平台优势。** iOS 上的 Live Activities、macOS 上的 Desktop Widgets、watchOS 上的 complications、visionOS 上的沉浸式空间。

5. **保持品牌一致性**，同时遵循各个平台的视觉语言和交互模式。

## 输出格式

1. **针对平台的建议**，引用相关的 HIG 章节。
2. **平台差异表**，比较导航、输入、布局和约定。
3. **各平台的实现注意事项**，包括推荐的 API 和适配策略。

## 需要询问的问题

1. 你计划支持哪些平台？
2. 是新应用，还是要适配现有应用？如果是现有应用，基础平台是哪个？
3. 使用 SwiftUI 还是 UIKit/AppKit？
4. 是否需要支持较旧的 OS 版本？
5. 主要使用场景是什么？（移动中、办公桌前、沙发上、空间环境、快速查看？）

## 相关技能

- **hig-foundations** -- 跨平台共享的原则（颜色、排版、辅助功能、布局）
- **hig-patterns** -- 在不同平台上呈现方式各异的交互模式
- **hig-components-layout** -- 因平台而异的导航结构（标签栏、侧边栏、分栏视图）
- **hig-components-content** -- 可跨平台适配的内容展示方式

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*