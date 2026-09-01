---
name: hig-components-content
version: 1.0.0
description: >-
  Apple Human Interface Guidelines for content display components. Use this skill when the user asks about
  "charts component", "collection view", "image view", "web view", "color well", "image well",
  "activity view", "lockup", "data visualization", "content display", displaying images, rendering
  web content, color pickers, or presenting collections of items in Apple apps.
  Also use when the user says "how should I display charts", "what's the best way to show images",
  "should I use a web view", "how do I build a grid of items", "what component shows media",
  or "how do I present a share sheet".
  Cross-references: hig-foundations for color/typography/accessibility, hig-patterns for data
  visualization patterns, hig-components-layout for structural containers, hig-platforms for
  platform-specific component behavior.
---
# Apple HIG：内容组件

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **适应不同的尺寸和场景。** 内容组件必须适用于不同的屏幕尺寸、方向和多任务配置。使用 Auto Layout 和尺寸类别。

2. **确保内容无障碍。** 图表需要支持音频图表。图像需要替代文本。集合需要正确的 VoiceOver 导航顺序。所有内容组件都需要标签和描述。

3. **保持视觉层级。** 使用间距、尺寸和分组来建立清晰的信息层级。主要内容应在视觉上更加突出。

4. **优先使用系统组件。** 在构建自定义组件之前，先评估 UICollectionView、SwiftUI Charts 和 WKWebView。系统组件自带无障碍支持和平台适配功能。

5. **遵循平台规范。** tvOS 上的集合使用带视差效果的大型锁定单元。同一个集合在 iOS 上使用紧凑单元和触控目标。在 visionOS 上，内容会增加深度和悬停效果。

6. **处理空状态。** 显示有意义的空状态，并提供如何填充内容的指导，而不是显示空白屏幕。

7. **优化性能。** 对于大型数据集，使用延迟加载、单元复用、分页和预取。

## 参考索引

| 参考资料 | 主题 | 主要内容 |
|---|---|---|
| [charts.md](references/charts.md) | 图表 | Swift Charts、柱状/折线/面积/点标记、图表无障碍、音频图表 |
| [collections.md](references/collections.md) | 集合 | 网格/列表布局、组合布局、选择、重新排序、可差异化数据源 |
| [image-views.md](references/image-views.md) | 图像视图 | 宽高比处理、内容模式、SF Symbol 图像、无障碍 |
| [image-wells.md](references/image-wells.md) | 图像井 | 通过拖放选择图像、macOS 特定功能、占位内容 |
| [color-wells.md](references/color-wells.md) | 颜色井 | 颜色选择界面、系统颜色选择器、自定义颜色空间 |
| [web-views.md](references/web-views.md) | Web 视图 | WKWebView、SFSafariViewController、导航控件、内容限制 |
| [activity-views.md](references/activity-views.md) | 活动视图 | 分享表单、活动项目、自定义活动、操作扩展 |
| [lockups.md](references/lockups.md) | 锁定单元 | 图像+文本元素、tvOS 卡片布局、焦点效果、架布局 |

## 组件选择指南

| 内容需求 | 推荐组件 | 平台说明 |
|---|---|---|
| 可视化定量数据 | 图表（Swift Charts） | iOS 16+、macOS 13+、watchOS 9+ |
| 浏览项目网格或列表 | 集合视图 | 对于复杂排列，使用组合布局 |
| 显示单个图像 | 图像视图 | 支持宽高比适配；提供无障碍描述 |
| 通过拖放或浏览选择图像 | 图像井 | 主要用于 macOS；在 iOS 上使用图像选择器 |
| 选择颜色 | 颜色井 | 触发系统颜色选择器；macOS、iOS 14+ |
| 在应用内显示 Web 内容 | Web 视图（WKWebView） | 对于外部浏览，使用 SFSafariViewController |
| 将内容分享至其他应用 | 活动视图 | 可配置活动类型的系统分享表单 |
| 内容卡片（图像 + 文本） | 锁定单元 | 主要用于 tvOS；可适配其他平台 |

## 输出格式

1. **组件推荐及理由**，引用相关的 HIG 参考文件。
2. **配置指南** -- 关键属性和设置。
3. **推荐组件的无障碍要求**。
4. **特定平台说明**，针对目标平台。

## 要提出的问题

1. 内容类型是什么？（定量数据、图像、网页内容、可浏览集合、分享操作？）
2. 面向哪些平台？
3. 内容是静态的还是动态的？
4. 内容量有多少？（少量项目与数百/数千个项目会影响组件选择和优化。）

## 相关技能

- **hig-foundations** -- 颜色、排版、无障碍和图像指南
- **hig-patterns** -- 数据可视化、分享和加载模式
- **hig-components-layout** -- 承载内容的结构容器（滚动视图、列表、分栏视图）
- **hig-platforms** -- 特定平台的组件行为（tvOS 上的锁定组合、macOS 上的网页视图）

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*