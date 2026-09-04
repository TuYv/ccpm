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

在提问之前，先检查 `.claude/apple-design-context.md`。使用已有的上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **每个平台都有独特的身份。** 不要在平台之间直接移植设计。尊重每个平台的惯例、交互模型和用户预期。

2. **iOS：以触摸为先。** 在手持屏幕上进行直接操作。针对单手使用进行优化。导航使用标签栏和 push/pop 栈。

3. **iPadOS：扩展画布。** 支持“分屏浏览”、“侧拉”和“台前调度”。使用边栏和多栏布局。在触摸之外同时支持指针和键盘。

4. **macOS：指针和键盘。** 可以接受高密度的信息展示。大量使用菜单栏、工具栏和键盘快捷键。窗口可调整大小并精确控制。

5. **tvOS：遥控器和焦点。** 适合远距离观看。针对 Siri 遥控器和基于焦点的导航进行设计。大字号文本、简洁布局、线性导航。

6. **visionOS：空间交互。** 由窗口、体积和空间构成的 3D 环境。用眼动追踪进行目标定位，用间接手势进行交互。尊重人体工学的舒适区。

7. **watchOS：可一览、够简短。** 信息一眼即可浏览。交互短暂精炼。利用数码表冠、触感反馈和复杂功能来及时传递内容。

8. **游戏：自成一派的范式。** 可自由定义游戏内交互模型，但在系统交互（通知、辅助功能、控制器）方面仍需遵守平台惯例。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [designing-for-ios.md](references/designing-for-ios.md) | iOS | 触摸、标签栏、导航栈、手势、屏幕尺寸、安全区域 |
| [designing-for-ipados.md](references/designing-for-ipados.md) | iPadOS | 多任务、边栏、指针、键盘、Apple Pencil、台前调度 |
| [designing-for-macos.md](references/designing-for-macos.md) | macOS | 菜单栏、工具栏、窗口管理、键盘快捷键、高密度布局、Dock |
| [designing-for-tvos.md](references/designing-for-tvos.md) | tvOS | 焦点引擎、Siri 遥控器、后仰体验、内容优先、视差效果 |
| [designing-for-visionos.md](references/designing-for-visionos.md) | visionOS | 空间计算、窗口/体积/空间、眼动追踪、手势、深度 |
| [designing-for-watchos.md](references/designing-for-watchos.md) | watchOS | 可一览 UI、数码表冠、复杂功能、通知、触感反馈 |
| [designing-for-games.md](references/designing-for-games.md) | 游戏 | 控制器、沉浸式体验、平台特定惯例、辅助功能 |

## 决策框架

1. **确定主要使用情境。** 移动中（iOS/watchOS）、办公桌前（macOS）、沙发上（tvOS）、空间环境（visionOS）？

2. **让输入方式匹配交互方式。** 触摸用于直接操作，指针用于精确定位，注视+手势用于空间环境，数码表冠用于快速滚动，遥控器用于焦点导航。

3. **做适配，而非照搬。** macOS 的边栏在 iPhone 上应变为标签栏。visionOS 的体积在 watchOS 上没有对等物。转换的是意图，而非实现。

4. **发挥平台优势。** iOS 的实时活动、macOS 的桌面小组件、watchOS 的复杂功能、visionOS 的沉浸式空间。

5. **保持品牌一致性**，同时尊重每个平台的视觉语言和交互模式。

## 输出格式

1. **针对具体平台的建议**，引用相关的 HIG 章节。
2. **平台差异表**，比较各平台的导航、输入、布局和惯例。
3. 每个平台的**实现说明**，包括推荐的 API 和适配策略。

## 需要提出的问题

1. 你的目标平台是哪些？
2. 是新应用，还是在为现有应用做适配？如果是现有应用，以哪个平台为基础？
3. 使用 SwiftUI 还是 UIKit/AppKit？
4. 是否需要支持较旧的 OS 版本？
5. 主要使用情境是什么？（移动中、办公桌前、沙发上、空间环境、一瞥即知？）

## 相关技能

- **hig-foundations** -- 各平台通用的共享原则（颜色、字体排印、辅助功能、布局）
- **hig-patterns** -- 在各平台上有不同表现形式的交互模式
- **hig-components-layout** -- 因平台而异的导航结构（标签栏、边栏、分栏视图）
- **hig-components-content** -- 可跨平台适配的内容展示

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
