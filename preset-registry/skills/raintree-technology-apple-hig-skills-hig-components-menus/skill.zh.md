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
# Apple HIG：菜单和按钮

在提问之前，检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **菜单应具有上下文相关性且可预测。** 标准项目应位于标准位置。遵循平台惯例进行排序和分组。

2. **使用标准按钮样式。** 系统定义的样式能够传达可操作性，并保持视觉一致性。优先使用这些样式，而不是自定义设计。

3. **使用工具栏承载高频操作。** 将最常用的命令放在工具栏中。不常使用的操作应放在菜单中。

4. **菜单栏是 macOS 的主要命令界面。** 每个命令都应能从菜单栏访问。工具栏和上下文菜单是补充，而不是替代。

5. **使用上下文菜单承载次要操作。** 通过右键单击或长按访问，并且应与指针所指向的项目相关。绝不要将某个命令仅放在上下文菜单中。

6. **使用弹出按钮提供互斥选项。** 从一组选项中准确选择一个选项。

7. **使用下拉按钮提供操作列表。** 不存在当前选择；它们提供一组命令。

8. **操作按钮将相关操作整合到工具栏或标题栏中的单个图标后。**

9. **使用 disclosure 控件实现渐进式披露。** 显示或隐藏其他内容。

10. **Dock 菜单：简短且聚焦** 于应用运行时最有用的操作。

## 参考索引

| 参考 | 主题 | 核心内容 |
|---|---|---|
| [menus.md](references/menus.md) | 通用菜单设计 | 项目排序、分组、快捷键 |
| [context-menus.md](references/context-menus.md) | 上下文菜单 | 右键单击、长按、次要操作 |
| [dock-menus.md](references/dock-menus.md) | Dock 菜单 | macOS 应用级操作、运行状态 |
| [edit-menus.md](references/edit-menus.md) | 编辑菜单 | 撤销、复制、粘贴、标准项目 |
| [the-menu-bar.md](references/the-menu-bar.md) | 菜单栏 | macOS 主要命令界面、结构 |
| [toolbars.md](references/toolbars.md) | 工具栏 | 高频操作、自定义、放置位置 |
| [buttons.md](references/buttons.md) | 按钮 | 系统样式、尺寸、可操作性 |
| [action-button.md](references/action-button.md) | 操作按钮 | 分组的次要操作、工具栏使用 |
| [pop-up-buttons.md](references/pop-up-buttons.md) | 弹出按钮 | 互斥选项选择 |
| [pull-down-buttons.md](references/pull-down-buttons.md) | 下拉按钮 | 操作列表、不存在当前选择 |
| [disclosure-controls.md](references/disclosure-controls.md) | disclosure 控件 | 渐进式披露、显示/隐藏 |

## 输出格式

1. **组件建议** —— 使用哪种菜单或按钮类型，以及原因。
2. **视觉层级** —— 在界面中的放置位置、尺寸和分组。
3. **平台特定行为** —— 在 iOS、iPadOS、macOS、visionOS 上的行为。
4. **键盘快捷键**（macOS）—— 菜单项目和工具栏操作的标准快捷键与自定义快捷键。

## 要询问的问题

1. 面向哪些平台？
2. 是主要操作还是次要操作？
3. 需要提供多少个可用操作？
4. 是 macOS 菜单栏应用吗？

## 相关技能

- **hig-components-search** -- 与工具栏和菜单搭配使用的搜索字段、页面控件
- **hig-components-controls** -- 与按钮相辅相成的切换开关、选择器、分段控件
- **hig-components-dialogs** -- 由菜单项或按钮触发的警告框、面板、弹出框
- **hig-inputs** -- 菜单和工具栏的键盘快捷键与指针交互

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*