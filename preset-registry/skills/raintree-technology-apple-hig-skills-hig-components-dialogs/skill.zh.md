---
name: hig-components-dialogs
version: 1.0.0
description: >-
  Apple HIG guidance for presentation components including alerts, action sheets,
  popovers, sheets, and digit entry views. Use this skill when the user says
  "should I use an alert or a sheet," "how do I show a confirmation dialog,"
  "when should I use a popover," "my modals are annoying users," or asks about
  alert design, action sheet, popover, sheet, modal, dialog, digit entry,
  confirmation dialog, warning dialog, modal presentation, non-modal content,
  destructive action confirmation, or overlay UI patterns. Cross-references:
  hig-components-menus, hig-components-controls, hig-components-search,
  hig-patterns.
---
# Apple HIG：演示组件

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **谨慎使用警告框，仅用于关键情况。** 需要用户注意的错误、破坏性操作确认，或需要用户确认的信息。它们会打断流程并要求用户作出响应。

2. **表单用于保持上下文的专注任务。** 从边缘滑入（或在 macOS 上附着到窗口）。适用于创建项目、编辑设置、多步骤表单。

3. **在 iPad 和 Mac 上，弹出框是非模态的。** 它们显示在触发元素旁边，点击外部即可关闭。适用于提供额外信息、选项或控件，而不会占据整个屏幕。

4. **操作菜单用于在多个操作中进行选择。** 在用户需要从多个操作中进行选择时显示，尤其是在其中一个操作具有破坏性时。iPhone：从底部向上滑出。iPad：以弹出框形式显示。

5. **尽量减少打断。** 在使用模态呈现之前，考虑采用内联呈现，或让操作支持撤销。

6. **警告文本应简洁且具有可操作性。** 使用简短且描述性的标题。如有需要，提供简短的消息正文。按钮标签应使用具体的动词（“删除”、“保存”），而不是“确定”。

7. **明确标记破坏性操作。** 使用破坏性按钮样式（红色文本）。将破坏性按钮放置在用户不太容易下意识点击的位置。

8. **为包含多个操作的警告框和操作菜单提供取消选项。** 在操作菜单中，取消选项显示在底部，并与其他选项分隔开。

9. **数字输入应专注且易于访问。** 输入字段应具有适当的尺寸，数字之间应自动前进，并支持粘贴和自动填充。

10. **根据平台调整呈现方式。** 同一交互在 iPhone、iPad、Mac 和 visionOS 上可能使用不同的组件。

## 参考索引

| 参考 | 主题 | 主要内容 |
|---|---|---|
| [alerts.md](references/alerts.md) | 警告框 | 按钮顺序、标题/消息文本、确认、破坏性操作 |
| [action-sheets.md](references/action-sheets.md) | 操作菜单 | 多个操作、取消选项、破坏性操作处理 |
| [popovers.md](references/popovers.md) | 弹出框 | 非模态、点击外部关闭、iPad/Mac |
| [sheets.md](references/sheets.md) | 表单 | 模态任务、保持上下文 |
| [digit-entry-views.md](references/digit-entry-views.md) | 数字输入 | PIN 输入、自动填充、自动前进 |

## 输出格式

1. **推荐的呈现类型及其理由**，以及为什么替代方案不太合适。
2. **内容指南** —— 遵循 Apple 的语气和简洁规则，说明标题、消息和按钮标签。
3. **关闭行为** —— 用户如何关闭，以及会发生什么（保存、放弃、取消）。
4. **替代方案** —— 说明在什么情况下场景可能完全不需要模态呈现（内联反馈、撤销、渐进式披露）。

## 要提出的问题

1. 呈现需要提供哪些信息或操作？
2. 是阻塞式还是非阻塞式？
3. 支持哪些平台？
4. 该呈现出现的频率如何？

## 相关技能

- **hig-components-menus** -- 触发呈现的按钮和工具栏项目
- **hig-components-controls** -- 选取框和弹出框中的输入控件
- **hig-components-search** -- 在呈现的视图中进行搜索和导航
- **hig-patterns** -- 模态、打断和用户流程管理
- **hig-foundations** -- 呈现组件的颜色、字体排版和布局

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*