---
name: hig-components-menus
version: 1.0.0
description: >-
  Apple HIG guidance for menu and button components including menus, context menus,
  dock menus, edit menus, the menu bar, toolbars, action buttons, pop-up buttons,
  pull-down buttons, disclosure controls, and standard buttons. Use this skill
  when the user says "how should my buttons look," "what goes in the menu bar,"
  "should I use a context menu or action sheet," "how do I design a toolbar," or
  asks about button design, menu design, context menu, toolbar, menu bar, action
  button, pop-up button, pull-down button, disclosure control, dock menu, edit
  menu, or any menu/button component layout and behavior. Cross-references:
  hig-components-search, hig-components-controls, hig-components-dialogs.
---
# Apple HIG：菜单与按钮

在提问之前先检查 `.claude/apple-design-context.md`。使用已有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **菜单应与上下文相关且可预测。** 标准项目位于标准位置。在排序和分组上遵循平台惯例。

2. **使用标准按钮样式。** 系统定义的样式能传达可供性并保持视觉一致性。优先使用它们而非自定义设计。

3. **工具栏用于高频操作。** 最常用的命令放在工具栏中。很少使用的操作应归入菜单。

4. **菜单栏是 macOS 上的主要命令界面。** 每条命令都应可以从菜单栏访问。工具栏和上下文菜单是补充，而非替代。

5. **上下文菜单用于次要操作。** 通过右键点击或长按触发，与指针所指的项目相关。绝不要将某条命令只放在上下文菜单中。

6. **弹出式按钮用于互斥选择。** 从一组选项中恰好选择一项。

7. **下拉按钮用于操作列表。** 没有当前选中项；它们提供一组命令。

8. **操作按钮将相关操作整合**在工具栏或标题栏中的单个图标之后。

9. **展开控件用于渐进式披露。** 显示或隐藏额外内容。

10. **Dock 菜单：简短且聚焦**于应用运行时最有用的操作。

## 参考索引

| 参考资料 | 主题 | 关键内容 |
|---|---|---|
| [menus.md](references/menus.md) | 通用菜单设计 | 项目排序、分组、快捷键 |
| [context-menus.md](references/context-menus.md) | 上下文菜单 | 右键点击、长按、次要操作 |
| [dock-menus.md](references/dock-menus.md) | Dock 菜单 | macOS 应用级操作、运行状态 |
| [edit-menus.md](references/edit-menus.md) | 编辑菜单 | 撤销、拷贝、粘贴、标准项目 |
| [the-menu-bar.md](references/the-menu-bar.md) | 菜单栏 | macOS 主要命令界面、结构 |
| [toolbars.md](references/toolbars.md) | 工具栏 | 高频操作、自定义、放置位置 |
| [buttons.md](references/buttons.md) | 按钮 | 系统样式、尺寸、可供性 |
| [action-button.md](references/action-button.md) | 操作按钮 | 分组的次要操作、工具栏用法 |
| [pop-up-buttons.md](references/pop-up-buttons.md) | 弹出式按钮 | 互斥的选项选择 |
| [pull-down-buttons.md](references/pull-down-buttons.md) | 下拉按钮 | 操作列表、无当前选中项 |
| [disclosure-controls.md](references/disclosure-controls.md) | 展开控件 | 渐进式披露、显示/隐藏 |

## 输出格式

1. **组件建议**——选择哪种菜单或按钮类型以及原因。
2. **视觉层级**——在界面中的放置、尺寸、分组。
3. **平台特定行为**——跨 iOS、iPadOS、macOS、visionOS。
4. **键盘快捷键（macOS）**——菜单项和工具栏操作的标准及自定义快捷键。

## 需要询问的问题

1. 面向哪些平台？
2. 是主要操作还是次要操作？
3. 需要提供多少个操作？
4. 是否为 macOS 菜单栏应用？

## 相关技能

- **hig-components-search**——与工具栏和菜单搭配使用的搜索栏、页面控件
- **hig-components-controls**——与按钮互补的开关、选择器、分段控件
- **hig-components-dialogs**——由菜单项或按钮触发的警告、浮层、弹出窗口
- **hig-inputs**——与菜单和工具栏相关的键盘快捷键及指针交互

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
