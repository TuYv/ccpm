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

提问前先检查 `.claude/apple-design-context.md`。使用已有的上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **内容优先于界面装饰。** 减少视觉杂乱。使用系统提供的材质和细微的分隔线，而不是厚重的边框和背景。

2. **从一开始就内建辅助功能。** 从第一天起就针对 VoiceOver、Dynamic Type、Reduce Motion、Increase Contrast 和 Switch Control 进行设计。每个交互元素都需要辅助功能标签。

3. **使用系统颜色和材质。** 系统颜色会自动适应浅色/深色模式、增强对比度和鲜活效果。优先使用语义颜色（`label`、`secondaryLabel`、`systemBackground`），而非硬编码的值。

4. **使用平台字体和图标。** 默认使用 SF Pro、SF Compact、SF Mono。衬线字体使用 New York。按推荐尺寸遵循字体层级。图标设计使用 SF Symbols。

5. **遵循平台惯例。** 使外观与行为和系统标准保持一致。为每个操作提供直接、响应及时的操控和清晰的反馈。

6. **尊重隐私。** 仅在需要时请求权限，清晰地解释原因，并在请求数据之前先提供价值。以最少的数据收集为原则进行设计。

7. **支持国际化。** 适应文本扩展、从右到左的书写系统以及不同的日期/数字格式。使用 Auto Layout 进行动态内容尺寸调整。

8. **有目的地使用动效。** 动画应传达含义和空间关系。通过提供交叉淡入淡出的替代方案来尊重 Reduce Motion 设置。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [accessibility.md](references/accessibility.md) | 辅助功能 | VoiceOver、Dynamic Type、颜色对比度、运动障碍辅助、Switch Control、音频描述 |
| [app-icons.md](references/app-icons.md) | 应用图标 | 图标网格、平台专属尺寸、单一视觉焦点、无透明度 |
| [branding.md](references/branding.md) | 品牌塑造 | 在 Apple 设计语言中融入品牌识别、低调的品牌呈现、自定义色调 |
| [color.md](references/color.md) | 颜色 | 系统颜色、动态颜色、语义颜色、自定义调色板、对比度 |
| [dark-mode.md](references/dark-mode.md) | 深色模式 | 浮起表面、语义颜色、适配的调色板、鲜活效果、双模式测试 |
| [icons.md](references/icons.md) | 图标 | 字形图标、SF Symbols 集成、自定义图标设计、图标字重、光学对齐 |
| [images.md](references/images.md) | 图像 | 图像分辨率、@2x/@3x 资源、矢量资源、图像辅助功能 |
| [immersive-experiences.md](references/immersive-experiences.md) | 沉浸式体验 | AR/VR 设计、空间沉浸、舒适区域、渐进式沉浸级别 |
| [inclusion.md](references/inclusion.md) | 包容性 | 多元化呈现、非性别化用语、文化敏感性、包容性默认设置 |
| [layout.md](references/layout.md) | 布局 | 边距、间距、对齐、安全区域、自适应布局、可读内容参考线 |
| [materials.md](references/materials.md) | 材质 | 鲜活效果、模糊、半透明、系统材质、材质厚度 |
| [motion.md](references/motion.md) | 动效 | 动画曲线、转场、连续性、Reduce Motion 支持、基于物理的动效 |
| [privacy.md](references/privacy.md) | 隐私 | 权限请求、用途描述、隐私营养标签、最少数据收集 |
| [right-to-left.md](references/right-to-left.md) | 从右到左 | RTL 布局镜像、双向文本、会翻转的图标、例外情况 |
| [sf-symbols.md](references/sf-symbols.md) | SF Symbols | 符号类别、渲染模式、可变颜色、自定义符号、字重匹配 |
| [spatial-layout.md](references/spatial-layout.md) | 空间布局 | visionOS 窗口摆放、深度、人体工学区域、Z 轴设计 |
| [typography.md](references/typography.md) | 排版 | SF Pro、Dynamic Type 字号、文本样式、自定义字体、字重层级、行距 |
| [writing.md](references/writing.md) | 文案写作 | UI 文案指南、语气、大小写规则、错误消息、按钮标签、简洁性 |

## 综合运用设计基础

考虑各原则之间如何相互作用：

1. **颜色 + 深色模式 + 辅助功能** —— 自定义调色板必须在两种模式下都能正常工作，同时保持 WCAG 对比度。从系统语义颜色开始。

2. **排版 + 辅助功能 + 布局** —— Dynamic Type 必须能在不破坏布局的情况下缩放。使用文本样式和 Auto Layout 覆盖完整的字号范围。

3. **图标 + 品牌塑造 + SF Symbols** —— 自定义图标应与 SF Symbols 的字重和光学尺寸相匹配。品牌元素应融入设计而不覆盖系统惯例。

4. **动效 + 辅助功能 + 反馈** —— 每个动画都必须提供 Reduce Motion 替代方案。动效应强化空间关系，而非用于装饰。

5. **隐私 + 文案写作 + 新手引导** —— 权限请求需要清晰、具体的用途描述。将时机安排在用户能够理解其价值的时候。

## 输出格式

1. **引用具体的 HIG 基础条目**，注明文件和章节。
2. 针对用户的目标平台，**指出平台差异**。
3. **提供具体的代码模式**（SwiftUI/UIKit/AppKit）。
4. **说明对辅助功能的影响**（对比度、Dynamic Type 缩放、VoiceOver 行为）。

## 需要询问的问题

1. 你的目标平台是哪些？
2. 你是否已有现成的品牌指南？
3. 你的辅助功能目标级别是什么？（WCAG AA、AAA，还是 Apple 基线？）
4. 使用系统颜色还是自定义颜色？

## 相关技能

- **hig-platforms** —— 各项设计基础在不同平台上的应用方式（例如 watchOS 与 macOS 的字号比例差异）

- **hig-patterns** —— 文案写作和辅助功能等设计基础至关重要的交互模式

- **hig-components-layout** —— 实现布局原则的结构组件

- **hig-components-content** —— 使用颜色、排版和图像展示内容

---

*由 [Raintree Technology](https://raintree.technology) 打造 · [更多开发者工具](https://raintree.technology)*
