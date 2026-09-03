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

提问前先检查 `.claude/apple-design-context.md`。使用已有上下文，只询问尚未涵盖的信息。

## 关键原则

1. **搜索：可发现且即时反馈。** 将搜索字段放在用户期望的位置（列表顶部、工具栏/导航栏）。在用户输入时即显示结果。

2. **页面控件：标示在扁平页面序列中的位置。** 用于离散、权重相等的页面（新手引导、照片图库）。显示当前页码和总页数。

3. **路径控件：文件层级导航。** macOS 路径控件显示在目录结构中的位置，并允许跳转到任意上级目录。

4. **搜索范围收窄大型结果集。** 提供范围按钮，让用户无需复杂查询即可筛选。

5. **清晰的搜索空状态。** 显示有帮助的提示信息，建议修正或替代方案，而不是空白屏幕。

6. **页面控件不用于层级导航。** 仅适用于扁平、线性的序列。层级导航请使用导航控制器、标签栏或侧边栏。

7. **保持路径控件简洁。** 只显示有意义的分段。用户可以点击任意分段直接导航。

8. **为搜索提供键盘支持。** Command-F 和系统搜索快捷键应能激活搜索。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [search-fields.md](references/search-fields.md) | 搜索字段 | 范围、令牌、即时结果、位置 |
| [page-controls.md](references/page-controls.md) | 页面控件 | 圆点指示器、扁平页面序列 |
| [path-controls.md](references/path-controls.md) | 路径控件 | 面包屑、上级导航 |

## 输出格式

1. **组件推荐**——搜索字段、页面控件或路径控件，以及原因。
2. **行为规范**——交互模型（边输入边搜索、滑动翻页、点击导航路径）。
3. **平台差异**——iOS、iPadOS、macOS、visionOS 之间的区别。

## 需要询问的问题

1. 被搜索或导航的内容是什么类型？
2. 面向哪些平台？
3. 数据集有多大？
4. 搜索是否是主要交互方式？

## 相关技能

- **hig-components-menus** -- 承载搜索和导航控件的工具栏与菜单栏
- **hig-components-controls** -- 搜索界面中的文本字段、选择器、分段控件
- **hig-components-dialogs** -- 用于扩展搜索或筛选的弹出窗口与浮层
- **hig-patterns** -- 导航模式与信息架构
- **hig-foundations** -- 导航组件的排版与布局

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
