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

提问前先检查是否存在 `.claude/apple-design-context.md`。利用已有上下文，只询问其中尚未涵盖的信息。

## 关键原则

1. **适应不同的尺寸和情境。** 内容组件必须在各种屏幕尺寸、方向和多任务配置下都能正常工作。使用 Auto Layout 和尺寸类别。

2. **确保内容可访问。** 图表需要支持音频图表。图像需要替代文本。集合需要合理的 VoiceOver 导航顺序。所有内容组件都需要标签和描述。

3. **保持视觉层级。** 使用间距、尺寸和分组来建立清晰的信息层级。主要内容应在视觉上突出。

4. **优先使用系统组件。** 在自行构建自定义组件之前，先评估 UICollectionView、SwiftUI Charts、WKWebView。系统组件自带内置的辅助功能和平台适配。

5. **遵循平台惯例。** tvOS 上的集合使用带视差效果的大型 lockup。iOS 上的同一集合则使用带触摸目标的紧凑单元格。在 visionOS 上，内容会获得景深和悬停效果。

6. **处理空状态。** 展示有意义的空状态，并给出如何填充内容的指引，而不是一片空白的屏幕。

7. **针对性能进行优化。** 针对大型数据集使用懒加载、单元格重用、分页和预取。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [charts.md](references/charts.md) | 图表 | Swift Charts、柱形/折线/面积/点标记、图表辅助功能、音频图表 |
| [collections.md](references/collections.md) | 集合 | 网格/列表布局、组合式布局、选择、重新排序、可差分数据源 |
| [image-views.md](references/image-views.md) | 图像视图 | 宽高比处理、内容模式、SF Symbol 图像、辅助功能 |
| [image-wells.md](references/image-wells.md) | 图像井 | 拖放图像选择、macOS 特有、占位内容 |
| [color-wells.md](references/color-wells.md) | 颜色井 | 颜色选择界面、系统颜色选择器、自定义颜色空间 |
| [web-views.md](references/web-views.md) | 网页视图 | WKWebView、SFSafariViewController、导航控件、内容限制 |
| [activity-views.md](references/activity-views.md) | 活动视图 | 共享面板、活动项、自定义活动、操作扩展 |
| [lockups.md](references/lockups.md) | Lockup | 图像+文本元素、tvOS 卡片布局、焦点效果、货架布局 |

## 组件选择指南

| 内容需求 | 推荐组件 | 平台说明 |
|---|---|---|
| 可视化定量数据 | 图表（Swift Charts） | iOS 16+、macOS 13+、watchOS 9+ |
| 浏览网格或列表形式的条目 | 集合视图 | 复杂排布可使用组合式布局 |
| 显示单张图像 | 图像视图 | 支持宽高比适配；提供辅助功能描述 |
| 通过拖放或浏览选择图像 | 图像井 | 主要用于 macOS；iOS 上请使用图像选择器 |
| 选择颜色 | 颜色井 | 触发系统颜色选择器；macOS、iOS 14+ |
| 内嵌展示网页内容 | 网页视图（WKWebView） | 外部浏览请使用 SFSafariViewController |
| 向其他应用共享内容 | 活动视图 | 系统共享面板，活动类型可配置 |
| 内容卡片（图像 + 文本） | Lockup | 主要用于 tvOS；可适配其他平台 |

## 输出格式

1. **组件推荐及其理由**，并引用相关的 HIG 参考文件。
2. **配置指导** —— 关键属性与设置。
3. 推荐组件的**辅助功能要求**。
4. 针对目标平台的**平台特定说明**。

## 需要询问的问题

1. 内容是什么类型？（定量数据、图像、网页内容、可浏览的集合、共享操作？）
2. 面向哪些平台？
3. 内容是静态还是动态的？
4. 内容量有多大？（是少量条目还是成百上千条，会影响组件选择和优化。）

## 相关技能

- **hig-foundations** —— 颜色、字体排印、辅助功能和图像准则
- **hig-patterns** —— 数据可视化、共享和加载模式
- **hig-components-layout** —— 承载内容的结构性容器（滚动视图、列表、分栏视图）
- **hig-platforms** —— 平台特定的组件行为（tvOS 上的 lockup、macOS 上的网页视图）

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
