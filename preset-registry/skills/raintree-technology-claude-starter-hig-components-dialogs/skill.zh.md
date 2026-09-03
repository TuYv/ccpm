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
# Apple HIG：呈现组件

在提问之前，先检查 `.claude/apple-design-context.md`。利用已有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **警告（Alerts）：仅在关键情形下克制使用。** 用于需要用户关注的错误、破坏性操作的确认，或需要用户确认知悉的信息。警告会打断操作流程并要求用户作出响应。

2. **浮层（Sheets）：用于保持上下文的专注任务。** 从边缘滑入（或在 macOS 上附着到窗口）。用于创建项目、编辑设置、多步骤表单。

3. **弹出层（Popovers）：在 iPad 和 Mac 上是非模态的。** 出现在触发元素旁边，点击外部即可关闭。用于在不接管整个屏幕的情况下提供额外信息、选项或控件。

4. **操作列表（Action sheets）：用于在多个操作之间进行选择。** 当用户需要从多个操作中做出选择时呈现，尤其是其中包含破坏性操作时。在 iPhone 上从底部向上滑出。在 iPad 上以弹出层形式出现。

5. **尽量减少打断。** 在选择模态呈现之前，先考虑改用内联呈现，或让操作可以撤销。

6. **警告文案应简洁且可操作。** 使用简短的描述性标题；如有需要，配以简短的消息正文。按钮标签应使用具体的动词（"Delete"、"Save"），而不是"OK"。

7. **清晰标记破坏性操作。** 采用破坏性按钮样式（红色文字）。将破坏性按钮放在用户不易下意识点按的位置。

8. **为包含多个操作的警告和操作列表提供取消选项。** 在操作列表中，取消按钮位于底部，与其他操作分隔开。

9. **数字输入：专注且无障碍。** 大小合适的输入框、数字之间自动前进、支持粘贴和自动填充。

10. **让呈现方式适配平台。** 同一交互在 iPhone、iPad、Mac 和 visionOS 上可能采用不同的组件。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [alerts.md](references/alerts.md) | 警告 | 按钮排列顺序、标题/消息文本、确认操作、破坏性操作 |
| [action-sheets.md](references/action-sheets.md) | 操作列表 | 多个操作、取消选项、破坏性操作处理 |
| [popovers.md](references/popovers.md) | 弹出层 | 非模态、点击外部关闭、iPad/Mac |
| [sheets.md](references/sheets.md) | 浮层 | 模态任务、上下文保持 |
| [digit-entry-views.md](references/digit-entry-views.md) | 数字输入 | PIN 码输入、自动填充、自动前进 |

## 输出格式

1. **推荐的呈现类型及其理由**，并说明备选方案为何不太合适。
2. **内容准则** —— 标题、消息、按钮标签，需符合 Apple 的语气与简洁规则。
3. **关闭行为** —— 用户如何关闭，以及关闭后会发生什么（保存、放弃、取消）。
4. **备选方案** —— 什么情况下该场景可能根本不需要模态呈现（内联反馈、撤销、渐进式披露）。

## 需要询问的问题

1. 该呈现需要传达什么信息或执行什么操作？
2. 是阻塞式还是非阻塞式？
3. 针对哪些平台？
4. 它出现的频率如何？

## 相关技能

- **hig-components-menus** —— 用于触发呈现的按钮和工具栏项
- **hig-components-controls** —— 浮层和弹出层中的输入控件
- **hig-components-search** —— 呈现视图中的搜索与导航
- **hig-patterns** —— 模态、打断、用户流程管理
- **hig-foundations** —— 呈现组件的颜色、排版、布局

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
