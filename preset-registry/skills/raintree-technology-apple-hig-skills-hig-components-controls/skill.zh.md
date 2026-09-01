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

在提问前，检查 `.claude/apple-design-context.md`。使用现有上下文，仅询问其中未涵盖的信息。

## 核心原则

1. **清晰显示当前状态。** 用户必须始终能看到当前选中的内容。切换开关显示开启/关闭状态，分段控件高亮当前分段，选择器显示当前选项。

2. **优先使用标准系统控件。** 内置控件能够提供一致性和可访问性。自定义控件会引入学习成本，并可能破坏辅助功能。

3. **二元状态使用切换开关。** 表示开启或关闭。在设置样式的屏幕中，更改会立即生效。在模态表单中，更改会在确认时提交。

4. **互斥选项使用分段控件。** 包含 2-5 个项目，重要性大致相等，并使用简短标签。

5. **连续数值使用滑块。** 适用于不要求精确数值输入的场景。为范围两端提供最小值/最大值标签或图标。

6. **选项列表较长时使用选择器。** 当选项过多而不适合使用分段控件时使用。非常适合日期、时间和结构化数据。

7. **小幅、精确调整使用步进器。** 按固定步长递增/递减。将当前值显示在步进器旁边，并设置合理的最小值/最大值范围。

8. **短文本、单行输入使用文本字段。** 多行文本使用文本视图。配置与预期输入相匹配的键盘类型（电子邮件、URL、数字）。

9. **组合框：文本输入 + 选择列表。** macOS。允许用户输入值，或从预定义列表中选择；适用于允许自定义值的场景。

10. **标记字段：将离散值显示为可视标记。** macOS。适用于电子邮件收件人、标签或由多个离散项目组成的集合。

11. **仪表和评分指示器用于显示数值。** 仪表显示范围内的数值。评分指示器显示评分（通常为星级）。它们仅用于显示；如需输入，请使用交互式变体。

## 参考索引

| 参考 | 主题 | 主要内容 |
|---|---|---|
| [controls.md](references/controls.md) | 通用控件 | 状态、可供性、系统控件 |
| [toggles.md](references/toggles.md) | 切换开关 | 开启/关闭、立即生效 |
| [segmented-controls.md](references/segmented-controls.md) | 分段控件 | 2-5 个选项、权重相等 |
| [sliders.md](references/sliders.md) | 滑块 | 连续范围、最小值/最大值标签 |
| [steppers.md](references/steppers.md) | 步进器 | 固定步长、有界值 |
| [pickers.md](references/pickers.md) | 选择器 | 日期、时间、较长的选项集 |
| [combo-boxes.md](references/combo-boxes.md) | 组合框 | macOS、输入或选择、自定义值 |
| [text-fields.md](references/text-fields.md) | 文本字段 | 短文本输入、键盘类型、验证 |
| [text-views.md](references/text-views.md) | 文本视图 | 多行文本、评论、描述 |
| [labels.md](references/labels.md) | 标签 | 放置、VoiceOver 支持 |
| [token-fields.md](references/token-fields.md) | 标记字段 | macOS、芯片、标签、收件人 |
| [virtual-keyboards.md](references/virtual-keyboards.md) | 虚拟键盘 | 电子邮件、URL、数字键盘类型 |
| [rating-indicators.md](references/rating-indicators.md) | 评分指示器 | 星级评分、仅用于显示 |
| [gauges.md](references/gauges.md) | 仪表 | 级别指示器、范围显示 |

## 输出格式

1. **控制项建议及其依据**，以及为什么其他替代方案不太合适。
2. **状态管理**——控制项如何传达当前状态，以及更改是立即生效还是在确认后生效。
3. **验证方式**——何时显示错误，以及如何传达规则。
4. **可访问性**——VoiceOver 使用的标签、特征和提示。

## 要提出的问题

1. 数据类型是什么？（布尔值、从固定集合中选择、数值、自由格式文本？）
2. 有多少个选项？
3. 支持哪些平台？（组合框和令牌字段仅适用于 macOS）
4. 是设置界面还是内联表单？

## 相关技能

- **hig-components-menus** -- 用于补充选择控制项的按钮和弹出按钮
- **hig-components-dialogs** -- 包含表单的工作表和弹出框
- **hig-components-search** -- 共享文本输入模式的搜索字段
- **hig-inputs** -- 与控制项交互的键盘、指针和手势
- **hig-foundations** -- 控制项样式所用的排版、颜色和布局

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*