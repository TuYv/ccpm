---
name: articulate
description: Precise, shared design vocabulary for articulating design decisions, critiques, and reviews — "say precisely what you mean." Covers ~188 terms across 12 domains (typography, color, iconography, layout, interaction, motion, accessibility, information architecture, copywriting, tools, analysis, components). Use when naming a UI or design property precisely, writing or sharpening design critique / review / handoff copy, describing a visual or interaction issue, or when the exact term is unclear.
metadata:
  source: "Index — index.how/to/articulate (Emil Kowalski & Glenn Menu)"
  url: "https://index.how/to/articulate"
---
# Articulate — 设计词汇

**准确表达你的意思。** 模糊的设计反馈（“让它更出彩”“感觉不对”“更简洁些”）会浪费迭代次数。一套共享且精确的词汇，可以让你明确指出存在问题的具体属性、状态或模式，从而让评审、批评和交接一次到位。

使用此技能来**选择正确的词语**：无论是描述 UI 问题、撰写批评或评审意见、命名令牌，还是寻找一个记不太清的术语，都适用。请使用下方的精确术语，而不是近似说法；如果此处没有所需术语，请查阅完整参考资料 `index.how/to/articulate`。

## 何时使用

- 撰写或完善**批评 / 评审 / 审计**文案——指出具体属性，而不是模糊感受。
- **设计交接 / 理由说明**——使用设计师和工程师都理解的术语来沟通决策。
- 准确**描述 UI/交互问题**（例如，“禁用状态依赖不透明度，而不是柔和色令牌”）。
- 想使用某个术语，但不确定准确说法时（字偶距与字距、品牌声音与语气、WCAG 与 APCA）。

可与 `frontend:impeccable`（设计执行）、`frontend:impeccable`（参数：`critique`，启发式评审）以及 `frontend:web-design-guidelines`（标准）搭配使用——Articulate 为这些技能的发现提供准确的表述词汇。

## 12 个领域（快速参考）

每个领域的代表性术语；完整的约 188 个条目请参阅来源。

| 领域 | 用它来描述…… | 代表性术语 |
|--------|-----------------|----------------------|
| **字体排印** | 字形间距、度量指标、文本行为 | 字偶距、字距、行距、x 字高、大写字母高度、连字、可变字体、断字、孤行/寡行、溢出 |
| **颜色** | 色彩空间、对比度、语义 | sRGB、P3、OKLCH、WCAG、APCA、语义令牌、饱和度、混合模式、深色模式 |
| **图标设计** | 图标形式与清晰度 | 描边粗细、视觉居中、实心与轮廓、像素微调、含义冲突 |
| **布局** | 空间组织 | 弹性盒、网格、溢出处理、宽高比、断点、响应式 |
| **交互** | 反馈与可供性 | 悬停、焦点、激活、禁用、可供性、触控目标、确认模式 |
| **动效** | 时序与协调 | 缓动曲线、持续时间、交错、减少动态效果、动效编排 |
| **无障碍** | 包容性访问 | WCAG、APCA、屏幕阅读器、键盘导航、语义化 HTML、状态传达 |
| **信息架构** | 结构与寻路 | 导航标签、渐进式披露、寻路、卡片分类 |
| **文案写作** | UI 语言 | 微文案、错误消息、品牌声音与语气、可扫读性、破坏性操作的清晰度 |
| **工具** | 系统与流程 | 设计系统、令牌、变量、原型设计、交接 |
| **分析** | 衡量 | A/B 测试、热力图、漏斗、留存率、NPS、滚动深度 |
| **组件** | UI 构建块（每个组件都有状态要求） | 按钮、输入框、选择器、对话框、提示消息、工具提示、数据表格、…… |

## 值得准确引用的原则

- **可供性就是信号。** “按钮看起来可以按下。”当缺少这种信号时，用户就会犹豫——应指出缺失的可供性，而不是称其“令人困惑”。
- **状态需要自己的令牌。** 禁用状态需要一个专门的弱化令牌，**而不能只依靠不透明度**——不透明度会让所有内容都变暗（包括焦点环和文本对比度），而不是传达“不可用”。
- **焦点状态不可或缺。** 必须提供可见的焦点状态；“移除焦点状态是一种无障碍缺陷”，而不是一种样式选择。
- **为 GPU 属性添加动画。** “不透明度和变换由 GPU 处理”；为布局属性（width、height、top、left）添加动画“会迫使浏览器在每一帧都重新计算布局”——在指出卡顿问题时，应明确说“这里对布局应用了动画”。
- **语言风格与语气。** “无论上下文如何，语言风格都保持一致。语气则会在这种风格内发生变化。”用这两个词指代不同的事物：语言风格 = 品牌常量，语气 = 情境化表达方式。

## 如何应用

1. 当你准备使用模糊的词语（“干净”“现代”“醒目”“不对劲”）时，应改用能够准确描述实际发生变化之属性的术语。
2. 在批评或评审中，**明确指出领域 + 术语 + 状态**（例如，“交互：主按钮没有 `focus-visible` 状态”优于“这个按钮感觉没有完成”）。
3. 在命名设计令牌或描述系统时，优先使用既有术语（语义令牌、行距、视觉居中），而不是自行创造术语。
4. 如果上文没有确切的术语，请查阅完整参考资料，而不是使用近似说法：https://index.how/to/articulate

> 来源：**Index**——由 Emil Kowalski 与 Glenn Menu 编写的设计词汇指南，https://index.how/to/articulate。本技能总结了其中的分类体系和关键原则；包含约 188 个条目的完整参考资料可在该来源中查看。