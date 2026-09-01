---
name: hig-foundations
version: 1.0.0
description: >-
  Apple Human Interface Guidelines design foundations. Use this skill when the user asks about
  "HIG color", "Apple typography", "SF Symbols", "dark mode guidelines", "accessible design",
  "Apple design foundations", "app icon", "layout guidelines", "materials", "motion", "privacy",
  "right to left", "RTL", "inclusive design", branding, images, spatial layout, or writing style.
  Also use when the user says "my colors look wrong in dark mode", "what font should I use",
  "is my app accessible enough", "how do I support Dynamic Type", "what contrast ratio do I need",
  "how do I pick system colors", or "my icons don't match the system style".
  Cross-references: hig-platforms for platform-specific guidance, hig-patterns for interaction
  patterns, hig-components-layout for structural components, hig-components-content for display.
---
# Apple HIG：设计基础

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，仅询问其中尚未涵盖的信息。

## 核心原则

1. **内容优先于装饰。** 减少视觉杂乱。使用系统提供的材质和细微分隔线，而不是厚重的边框和背景。

2. **从一开始就融入无障碍设计。** 从第一天起就针对 VoiceOver、Dynamic Type、Reduce Motion、Increase Contrast 和 Switch Control 进行设计。每个交互元素都需要无障碍标签。

3. **使用系统颜色和材质。** 系统颜色会适配浅色/深色模式、更高对比度和活力效果。优先使用语义颜色（`label`、`secondaryLabel`、`systemBackground`），而不是硬编码的值。

4. **使用平台字体和图标。** 默认使用 SF Pro、SF Compact、SF Mono。衬线字体使用 New York。按照建议的字号遵循字体层级。使用 SF Symbols 作为图标。

5. **遵循平台惯例。** 让外观和行为与系统标准保持一致。提供直接、响应迅速的操作方式，并为每个操作提供清晰的反馈。

6. **尊重隐私。** 仅在需要时请求权限，清楚地解释原因，在请求数据前先提供价值。以最少的数据收集为设计目标。

7. **支持国际化。** 适应文本扩展、从右到左的文字脚本，以及不同的日期/数字格式。使用 Auto Layout 实现动态内容尺寸调整。

8. **有目的地使用动效。** 动画应传达含义和空间关系。通过提供交叉淡化替代方案来遵循 Reduce Motion 设置。

## 参考索引

| 参考资料 | 主题 | 核心内容 |
|---|---|---|
| [accessibility.md](references/accessibility.md) | 无障碍 | VoiceOver、Dynamic Type、颜色对比度、运动无障碍、Switch Control、音频描述 |
| [app-icons.md](references/app-icons.md) | App 图标 | 图标网格、平台特定尺寸、单一焦点、不透明背景 |
| [branding.md](references/branding.md) | 品牌 | 在 Apple 的设计语言中融入品牌标识、低调的品牌呈现、自定义色调 |
| [color.md](references/color.md) | 颜色 | 系统颜色、动态颜色、语义颜色、自定义调色板、对比度 |
| [dark-mode.md](references/dark-mode.md) | 深色模式 | 提升层级的表面、语义颜色、适配调色板、活力效果、在两种模式下进行测试 |
| [icons.md](references/icons.md) | 图标 | 字形图标、SF Symbols 集成、自定义图标设计、图标字重、视觉对齐 |
| [images.md](references/images.md) | 图像 | 图像分辨率、@2x/@3x 资源、矢量资源、图像无障碍 |
| [immersive-experiences.md](references/immersive-experiences.md) | 沉浸式体验 | AR/VR 设计、空间沉浸、舒适区域、渐进式沉浸级别 |
| [inclusion.md](references/inclusion.md) | 包容性 | 多元化呈现、不带性别色彩的语言、文化敏感性、包容性默认设置 |
| [layout.md](references/layout.md) | 布局 | 边距、间距、对齐、安全区域、自适应布局、可读内容指南 |
| [materials.md](references/materials.md) | 材质 | 活力效果、模糊、半透明、系统材质、材质厚度 |
| [motion.md](references/motion.md) | 动效 | 动画曲线、过渡、连续性、Reduce Motion 支持、基于物理的动效 |
| [privacy.md](references/privacy.md) | 隐私 | 权限请求、用途说明、隐私营养标签、最少的数据收集 |
| [right-to-left.md](references/right-to-left.md) | 从右到左 | RTL 布局镜像、双向文本、可翻转的图标、例外情况 |
| [sf-symbols.md](references/sf-symbols.md) | SF Symbols | 符号类别、渲染模式、可变颜色、自定义符号、字重匹配 |
| [spatial-layout.md](references/spatial-layout.md) | 空间布局 | visionOS 窗口放置、深度、符合人体工学的区域、Z 轴设计 |
| [typography.md](references/typography.md) | 排版 | SF Pro、Dynamic Type 字号、文本样式、自定义字体、字体字重层级、行距 |
| [writing.md](references/writing.md) | 文案 | UI 文案指南、语气、大小写规则、错误消息、按钮标签、简洁性 |

## 将基础原则结合应用

考虑各项原则如何相互作用：

1. **颜色 + 深色模式 + 无障碍** -- 自定义调色板必须在两种模式下都能正常工作，同时保持 WCAG 对比度要求。请从系统语义颜色开始。

2. **排版 + 无障碍 + 布局** -- 动态字体必须能够缩放，同时不破坏布局。使用文本样式和 Auto Layout，以适配完整的字体大小范围。

3. **图标 + 品牌 + SF Symbols** -- 自定义图标应匹配 SF Symbols 的字重和光学尺寸。品牌元素应在不覆盖系统规范的前提下融入其中。

4. **动效 + 无障碍 + 反馈** -- 每个动画都必须提供“减少动态效果”替代方案。动效应强化空间关系，而不是仅用于装饰。

5. **隐私 + 文案 + 引导流程** -- 权限请求需要清晰、具体的使用说明。应在用户能够理解其益处时提出请求。

## 输出格式

1. **引用具体的 HIG 基础原则**，并注明文件和章节。
2. **说明平台差异**，针对用户的目标平台进行描述。
3. **提供具体的代码模式**（SwiftUI/UIKit/AppKit）。
4. **解释对无障碍的影响**（对比度、动态字体缩放、VoiceOver 行为）。

## 需要提出的问题

1. 你的目标平台有哪些？
2. 是否已有现成的品牌指南？
3. 目标无障碍级别是什么？（WCAG AA、AAA，还是 Apple 基线？）
4. 使用系统颜色还是自定义颜色？

## 相关技能

- **hig-platforms** -- 介绍基础原则如何应用于各个平台（例如 watchOS 与 macOS 上的字体比例差异）
- **hig-patterns** -- 介绍交互模式，其中文案和无障碍等基础原则至关重要
- **hig-components-layout** -- 介绍实现布局原则的结构化组件
- **hig-components-content** -- 介绍使用颜色、排版和图像展示内容

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*