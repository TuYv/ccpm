---
name: hig-components-controls
version: 1.0.0
description: >-
  Apple HIG guidance for selection and input controls including pickers, toggles,
  sliders, steppers, segmented controls, combo boxes, text fields, text views,
  labels, token fields, virtual keyboards, rating indicators, and gauges. Use
  this skill when the user says "picker or segmented control," "how should my
  form look," "what keyboard type should I use," "toggle vs checkbox," or asks
  about picker design, toggle, switch, slider, stepper, text field, text input,
  segmented control, combo box, label, token field, virtual keyboard, rating
  indicator, gauge, form design, input validation, or control state management.
  Cross-references: hig-components-menus, hig-components-dialogs,
  hig-components-search.
---
# Apple HIG：选择与输入控件

提问前先检查 `.claude/apple-design-context.md`。使用已有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **当前状态清晰。** 用户必须始终能看到当前选中了什么。开关显示开/关状态，分段控件高亮当前激活的区段，选取器显示当前所选内容。

2. **优先使用标准系统控件。** 内置控件提供一致性与无障碍支持。自定义控件会带来学习成本，且可能破坏辅助功能。

3. **开关适用于二元状态。** 开或关。在设置类界面中，更改立即生效。在模态表单中，更改在确认时提交。

4. **分段控件适用于互斥选项。** 2-5 个选项，重要性大致相当，标签简短。

5. **滑块适用于连续值。** 适用于精确数值输入并不关键的场合。为范围端点提供最小/最大值标签或图标。

6. **选取器适用于长选项列表。** 当选项多到不适合分段控件时使用。适合日期、时间和结构化数据。

7. **步进器适用于小幅、精确的调整。** 以固定步长递增/递减。在步进器旁显示当前值，并设置合理的最小/最大边界。

8. **文本字段适用于简短的单行输入。** 多行输入使用文本视图。配置键盘类型以匹配预期输入（邮箱、URL、数字）。

9. **组合框：文本输入 + 选择列表。** macOS。当允许自定义值时，可键入一个值或从预定义列表中选择。

10. **标记字段：以可视化标记呈现离散值。** macOS。适用于邮件收件人、标签或离散条目的集合。

11. **仪表与评级指示符用于显示值。** 仪表显示某个范围内的值。评级指示符显示评级（通常为星形）。仅用于展示；需要输入时请使用可交互的变体。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [controls.md](references/controls.md) | 通用控件 | 状态、可供性、系统控件 |
| [toggles.md](references/toggles.md) | 开关 | 开/关、即时生效 |
| [segmented-controls.md](references/segmented-controls.md) | 分段控件 | 2-5 个选项、同等权重 |
| [sliders.md](references/sliders.md) | 滑块 | 连续范围、最小/最大值标签 |
| [steppers.md](references/steppers.md) | 步进器 | 固定步长、有界数值 |
| [pickers.md](references/pickers.md) | 选取器 | 日期、时间、长选项集 |
| [combo-boxes.md](references/combo-boxes.md) | 组合框 | macOS、键入或选择、自定义值 |
| [text-fields.md](references/text-fields.md) | 文本字段 | 简短输入、键盘类型、校验 |
| [text-views.md](references/text-views.md) | 文本视图 | 多行、评论、描述 |
| [labels.md](references/labels.md) | 标签 | 位置、VoiceOver 支持 |
| [token-fields.md](references/token-fields.md) | 标记字段 | macOS、标签块、标签、收件人 |
| [virtual-keyboards.md](references/virtual-keyboards.md) | 虚拟键盘 | 邮箱、URL、数字键盘类型 |
| [rating-indicators.md](references/rating-indicators.md) | 评级指示符 | 星级评分、仅显示 |
| [gauges.md](references/gauges.md) | 仪表 | 等级指示器、范围显示 |

## 输出格式

1. **控件推荐及其理由**，并说明备选方案为何不太合适。
2. **状态管理** —— 控件如何传达当前状态，更改是立即生效还是在确认时提交。
3. **校验方式** —— 何时显示错误以及如何传达规则。
4. **无障碍** —— 面向 VoiceOver 的标签、特性与提示。

## 需要询问的问题

1. 数据是什么类型？（布尔值、从固定集合中选择、数值、自由文本？）
2. 有多少个选项？
3. 面向哪些平台？（组合框和标记字段仅限 macOS）
4. 是设置界面还是内嵌表单？

## 相关技能

- **hig-components-menus** —— 与选择控件互补的按钮和弹出式按钮
- **hig-components-dialogs** —— 承载表单的浮层与弹出窗口
- **hig-components-search** —— 复用文本输入模式的搜索字段
- **hig-inputs** —— 键盘、指针、手势与控件的交互
- **hig-foundations** —— 用于控件样式设计的排版、颜色与布局

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
