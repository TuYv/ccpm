---
name: hig-components-search
version: 1.0.0
description: >-
  Apple HIG guidance for navigation-related components including search fields,
  page controls, and path controls. Use this skill when the user says "how should
  search work in my app," "I need a breadcrumb," "how do I paginate content," or
  asks about search field, search bar, page control, path control, breadcrumb,
  navigation component, search UX, search suggestions, search scopes, paginated
  content navigation, or file path hierarchy display. Cross-references:
  hig-components-menus, hig-components-controls, hig-components-dialogs,
  hig-patterns.
---
# Apple HIG：导航组件

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **搜索：易于发现并即时反馈。** 将搜索字段放置在用户预期的位置（列表顶部、工具栏/导航栏）。在用户输入时显示结果。

2. **页面控件：在扁平的页面序列中定位。** 适用于离散且权重相同的页面（引导流程、照片图库）。显示当前页面和总页数。

3. **路径控件：文件层级导航。** macOS 路径控件显示目录结构中的位置，并允许跳转到任意祖先级目录。

4. **搜索范围可缩小较大的结果集。** 提供范围按钮，让用户无需编写复杂查询即可进行筛选。

5. **为搜索提供清晰的空状态。** 显示建议用户更正内容或尝试替代方案的有用消息，而不是空白屏幕。

6. **页面控件不用于层级导航。** 页面控件仅适用于扁平的线性序列。对于层级结构，应使用导航控制器、标签栏或边栏。

7. **保持路径控件简洁。** 仅显示有意义的路径段。用户可以点击任意路径段直接导航到对应位置。

8. **为搜索提供键盘支持。** Command-F 和系统搜索快捷键应能激活搜索。

## 参考索引

| 参考 | 主题 | 主要内容 |
|---|---|---|
| [search-fields.md](references/search-fields.md) | 搜索字段 | 范围、标记、即时结果、放置位置 |
| [page-controls.md](references/page-controls.md) | 页面控件 | 圆点指示器、扁平页面序列 |
| [path-controls.md](references/path-controls.md) | 路径控件 | 面包屑、祖先级导航 |

## 输出格式

1. **组件建议** -- 搜索字段、页面控件或路径控件，以及选择它的原因。
2. **行为规范** -- 交互模型（输入时搜索、滑动切换页面、点击路径导航）。
3. **平台差异** -- iOS、iPadOS、macOS、visionOS 之间的差异。

## 要提出的问题

1. 要搜索或导航的内容类型是什么？
2. 面向哪些平台？
3. 数据集有多大？
4. 搜索是否是主要交互方式？

## 相关技能

- **hig-components-menus** -- 承载搜索和导航控件的工具栏与菜单栏
- **hig-components-controls** -- 搜索界面中的文本字段、选择器、分段控件
- **hig-components-dialogs** -- 用于展开搜索或筛选的弹出框和工作表
- **hig-patterns** -- 导航模式和信息架构
- **hig-foundations** -- 导航组件的排版和布局

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*