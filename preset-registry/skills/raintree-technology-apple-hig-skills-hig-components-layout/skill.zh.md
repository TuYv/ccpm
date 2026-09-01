---
name: hig-components-layout
version: 1.0.0
description: >-
  Apple Human Interface Guidelines for layout and navigation components. Use this skill when the user
  asks about "sidebar", "split view", "tab bar", "tab view", "scroll view", "window design", "panel",
  "list view", "table view", "column view", "outline view", "navigation structure", "app layout",
  "boxes", "ornaments", or organizing content hierarchically in Apple apps.
  Also use when the user says "how should I organize my app", "what navigation pattern should I use",
  "my layout breaks on iPad", "how do I build a sidebar", "should I use tabs or a sidebar",
  or "my app doesn't adapt to different screen sizes".
  Cross-references: hig-foundations for layout/spacing principles, hig-platforms for platform-specific
  navigation, hig-patterns for multitasking and full-screen, hig-components-content for content display.
---
# Apple HIG：布局与导航组件

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，仅询问其中未涵盖的信息。

## 核心原则

1. **按层级组织。** 将信息从宽泛的类别组织到具体的细节。使用侧边栏展示顶层部分，使用列表展示可浏览的项目，使用详情视图展示单个内容。

2. **使用标准导航模式。** 使用标签栏在同级部分之间进行扁平导航（iPhone）。使用侧边栏进行深层级导航（iPad、Mac）。让导航模式与信息架构和平台相匹配。

3. **适应屏幕尺寸。** iPad 上的三栏布局在 iPhone 上折叠为单栏。使用尺寸类别和自适应 API（NavigationSplitView）实现自动适配。

4. **支持 iPad 多任务处理。** 以良好的方式响应分屏视图、Slide Over 和台前调度。在每种分屏比例和尺寸类别转换下进行测试。

5. **在 visionOS 上保持空间一致性。** 窗口、体积窗口和装饰元素处于共享空间中。以可预测的方式定位。使用装饰元素放置工具栏和控件，同时避免遮挡内容。

6. **使用滚动视图处理溢出内容。** 为离散的内容单元启用分页。在适当的情况下支持下拉刷新。遵守安全区域。

7. **让导航保持可预测。** 用户应始终知道自己在哪里、如何到达这里，以及如何返回。使用返回按钮、面包屑和清晰的部分标题。

8. **优先使用系统组件。** UINavigationController、UISplitViewController、NavigationSplitView 和 TabView 提供内置的自适应能力、辅助功能支持和状态恢复。

## 参考索引

| 参考 | 主题 | 核心内容 |
|---|---|---|
| [sidebars.md](references/sidebars.md) | 侧边栏 | 源列表、选择状态、可折叠部分、iPad/Mac 模式 |
| [column-views.md](references/column-views.md) | 列视图 | Finder 风格的浏览、通过列逐步展示详细信息 |
| [outline-views.md](references/outline-views.md) | 大纲视图 | 可展开的层级结构、展开三角形、树形结构 |
| [split-views.md](references/split-views.md) | 分栏视图 | 两栏/三栏布局、NavigationSplitView、自适应折叠 |
| [tab-views.md](references/tab-views.md) | 标签视图 | 分段式标签、页面样式标签、macOS 标签分组 |
| [tab-bars.md](references/tab-bars.md) | 标签栏 | 底部标签栏（iOS）、徽章计数、标签数量上限 |
| [scroll-views.md](references/scroll-views.md) | 滚动视图 | 分页、滚动指示器、内容内嵌间距、下拉刷新 |
| [windows.md](references/windows.md) | 窗口 | macOS/visionOS 窗口管理、尺寸、全屏、恢复 |
| [panels.md](references/panels.md) | 面板 | 检查器面板、实用工具面板、浮动面板、macOS 约定 |
| [lists-and-tables.md](references/lists-and-tables.md) | 列表和表格 | 普通/分组/嵌入分组样式、滑动操作、部分标题 |
| [boxes.md](references/boxes.md) | 框 | 内容分组容器、带标签的框、macOS 分组 |
| [ornaments.md](references/ornaments.md) | 装饰元素 | visionOS 工具栏附着、定位、可见性 |

## 导航模式选择

| 应用结构 | 推荐模式 | 平台适配 |
|---|---|---|
| 3-5 个同级顶层分区 | 标签栏 | iPhone：底部标签栏。iPad：侧边栏（`.sidebarAdaptable`，iPadOS 18+）。Mac：侧边栏或工具栏标签 |
| 深层级内容 | 侧边栏 + NavigationSplitView | iPhone：单列堆栈。iPad：两列/三列。Mac：完整多列 |
| 深层级文件/文件夹树 | 列视图 | Mac：Finder 风格。iPad：自适应。iPhone：推入式导航 |
| 带详情的扁平列表 | 分栏视图（两列） | iPhone：推入/弹出堆栈。iPad/Mac：主列 + 详情列 |
| 基于文档且带检查器 | 窗口 + 面板 | Mac：带检查器的主窗口。iPad：工作表或弹出框 |
| 带工具的空间应用 | 窗口 + 装饰元素 | visionOS：窗口上的装饰元素。其他平台：工具栏 |

## 布局适配检查清单

- [ ] **紧凑宽度（iPhone 竖屏）：** 导航是否折叠为单一堆栈？标签栏是否可见？
- [ ] **常规宽度（iPad 横屏、Mac）：** 导航是否扩展为侧边栏 + 详情？空间利用是否合理？
- [ ] **多任务处理（iPad）：** 是否能在每种分屏比例下进行适配？是否支持 Slide Over？
- [ ] **辅助功能：** 是否在所有字号下支持动态字体？VoiceOver 顺序是否合理？
- [ ] **方向：** 内容是否能在竖屏和横屏之间重新布局？
- [ ] **visionOS：** 窗口位置是否符合人体工学？装饰元素是否易于访问？深度是否有意义？

## 输出格式

1. **推荐的导航模式**，并说明其与应用信息架构的关系。
2. **布局层级**，从根容器向下列出（例如：TabView > NavigationSplitView > List > Detail）。
3. **平台适配**，涵盖目标平台和尺寸类别。
4. **尺寸类别行为**，说明每次转换时的表现。

## 要提出的问题

1. 应用的信息架构是什么？（分区、层级深度、顶层类别？）
2. 有多少个顶层分区？
3. 目标平台有哪些？
4. 是否需要在 iPad 上支持多任务处理？
5. 使用 SwiftUI 还是 UIKit？

## 相关技能

- **hig-foundations** -- 布局间距、边距、安全区域、对齐
- **hig-platforms** -- 特定平台的导航惯例
- **hig-patterns** -- 多任务处理、全屏和启动模式
- **hig-components-content** -- 布局容器中显示的内容

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*