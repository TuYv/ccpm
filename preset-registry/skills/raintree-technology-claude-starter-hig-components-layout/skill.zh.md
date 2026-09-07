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

提问前先检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **分层组织。** 将信息从宽泛的类别结构化到具体的细节。顶层分区使用侧边栏，可浏览的项目使用列表，单项内容使用详情视图。

2. **使用标准导航模式。** 同级分区之间的扁平导航使用标签栏（iPhone）。深层级导航使用侧边栏（iPad、Mac）。根据信息架构和平台选择匹配的导航模式。

3. **适应屏幕尺寸。** iPad 上的三栏布局在 iPhone 上折叠为单栏。使用尺寸类别和自适应 API（NavigationSplitView）实现自动适配。

4. **支持 iPad 多任务。** 优雅地响应 Split View、Slide Over 和 Stage Manager。在每个分屏比例和尺寸类别切换点进行测试。

5. **在 visionOS 上保持空间一致性。** 共享空间中的窗口、体积和装饰件。位置应可预测。使用装饰件承载工具栏和控件，且不遮挡内容。

6. **对溢出内容使用滚动视图。** 为离散的内容单元启用分页。在适当之处支持下拉刷新。遵守安全区域。

7. **保持导航可预测。** 用户应始终知道自己在哪、如何到达这里、如何返回。使用返回按钮、面包屑和清晰的分区标题。

8. **优先使用系统组件。** UINavigationController、UISplitViewController、NavigationSplitView 和 TabView 提供内置的自适应能力、辅助功能支持和状态恢复。

## 参考索引

| 参考资料 | 主题 | 关键内容 |
|---|---|---|
| [sidebars.md](references/sidebars.md) | 侧边栏 | 源列表、选中状态、可折叠分区、iPad/Mac 模式 |
| [column-views.md](references/column-views.md) | 分栏视图 | Finder 风格的浏览、通过分栏实现渐进式披露 |
| [outline-views.md](references/outline-views.md) | 大纲视图 | 可展开的层级结构、展开三角形、树形结构 |
| [split-views.md](references/split-views.md) | 分割视图 | 两栏/三栏布局、NavigationSplitView、自适应折叠 |
| [tab-views.md](references/tab-views.md) | 标签视图 | 分段式标签、页面式标签、macOS 标签分组 |
| [tab-bars.md](references/tab-bars.md) | 标签栏 | 底部标签栏（iOS）、角标数量、最大标签数 |
| [scroll-views.md](references/scroll-views.md) | 滚动视图 | 分页、滚动指示器、内容边距、下拉刷新 |
| [windows.md](references/windows.md) | 窗口 | macOS/visionOS 窗口管理、尺寸调整、全屏、恢复 |
| [panels.md](references/panels.md) | 面板 | 检查器面板、实用工具面板、浮动面板、macOS 惯例 |
| [lists-and-tables.md](references/lists-and-tables.md) | 列表和表格 | 普通/分组/内嵌分组样式、滑动操作、分区标题 |
| [boxes.md](references/boxes.md) | 盒子 | 内容分组容器、带标签的盒子、macOS 分组 |
| [ornaments.md](references/ornaments.md) | 装饰件 | visionOS 工具栏附件、定位、可见性 |

## 导航模式选择

| 应用结构 | 推荐模式 | 平台适配 |
|---|---|---|
| 3-5 个同级顶层分区 | 标签栏 | iPhone：底部标签栏。iPad：侧边栏（`.sidebarAdaptable`，iPadOS 18+）。Mac：侧边栏或工具栏标签 |
| 深层级内容 | 侧边栏 + NavigationSplitView | iPhone：单栏堆栈。iPad：两栏/三栏。Mac：完整多栏 |
| 深层文件/文件夹树 | 分栏视图 | Mac：Finder 风格。iPad：可适配。iPhone：推入式导航 |
| 带详情的扁平列表 | 分割视图（两栏） | iPhone：推入/弹出堆栈。iPad/Mac：主栏 + 详情栏 |
| 带检查器的文档型应用 | 窗口 + 面板 | Mac：带检查器的主窗口。iPad：sheet 或 popover |
| 带工具的空间应用 | 窗口 + 装饰件 | visionOS：窗口上的装饰件。其他平台：工具栏 |

## 布局适配检查清单

- [ ] **紧凑宽度（iPhone 竖屏）：** 导航折叠为单一堆栈？标签栏可见？
- [ ] **常规宽度（iPad 横屏、Mac）：** 导航展开为侧边栏 + 详情？空间使用充分？
- [ ] **多任务（iPad）：** 在每个分屏比例下都能适配？在 Slide Over 中可用？
- [ ] **辅助功能：** 在所有尺寸下都支持 Dynamic Type？VoiceOver 顺序合乎逻辑？
- [ ] **屏幕方向：** 内容在竖屏和横屏之间重新排版？
- [ ] **visionOS：** 窗口定位符合人体工学？装饰件易于触及？景深有意义？

## 输出格式

1. **推荐的导航模式**，并给出基于应用信息架构的选型理由。
2. **布局层级**，从根容器逐层向下（例如 TabView > NavigationSplitView > List > Detail）。
3. **平台适配**，涵盖目标平台和各尺寸类别。
4. **尺寸类别行为**，说明每个尺寸过渡点的表现。

## 需要提出的问题

1. 应用的信息架构是什么？（分区、层级深度、顶层类别？）
2. 有多少个顶层分区？
3. 面向哪些平台？
4. 是否需要 iPad 多任务？
5. 使用 SwiftUI 还是 UIKit？

## 相关技能

- **hig-foundations** -- 布局间距、边距、安全区域、对齐
- **hig-platforms** -- 平台专属的导航惯例
- **hig-patterns** -- 多任务、全屏和启动模式
- **hig-components-content** -- 布局容器中显示的内容

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
