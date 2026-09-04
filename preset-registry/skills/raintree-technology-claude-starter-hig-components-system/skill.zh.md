---
name: hig-components-system
version: 1.0.0
description: >-
  Apple HIG guidance for system experience components: widgets, live activities,
  notifications, complications, home screen quick actions, top shelf, watch faces,
  app clips, and app shortcuts. Use when asked about: "widget design", "live activity",
  "notification design", "complication", "home screen quick action",
  "top shelf", "watch face", "app clip", "app shortcut", "system experience".
  Also use when the user says "how do I design a widget," "what should my notification
  look like," "how do Live Activities work," "should I make an App Clip," or asks about
  surfaces outside the main app.
  Cross-references: hig-components-status for progress in widgets, hig-inputs for
  interaction patterns, hig-technologies for Siri and system integration.
---
# Apple HIG：系统体验

提问前先检查 `.claude/apple-design-context.md`。使用已有的上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **一目了然、即时价值。** 系统体验将应用最重要的内容带到用户无需启动应用即可看到的界面上。请为几秒钟的注意力进行设计。

2. **尊重平台情境。** 锁定屏幕小组件与主屏幕小组件的约束条件不同。复杂功能比顶部栏项目小得多。

3. **小组件：展示相关信息，而非全部内容。** 展示最有用的子集，并适度更新。

4. **以各具特色的布局支持多种小组件尺寸。** 每种尺寸都应是经过深思熟虑的设计，而不是其他尺寸的缩放版本。

5. **点按即深度链接。** 将用户带到相关内容，而非应用的根屏幕。

6. **实时活动：跟踪有明确开始和结束的事件。** 配送、比分、计时器、行程。需同时为灵动岛和锁定屏幕进行设计。

7. **保持更新、及时呈现。** 过期数据会损害信任。事件结束后应立即结束展示。

8. **通过通知尊重用户注意力。** 只为用户真正关心的信息发送通知。不发送促销类或低价值通知。

9. **通知：可操作且自包含。** 提供足够的上下文，让用户无需打开应用即可理解并采取行动。支持通知操作。使用线程和分组。

10. **复杂功能：在表盘上呈现聚焦的数据。** 按最小可用的呈现形态进行设计。支持多个系列。明智地规划更新预算。

11. **主屏幕快捷操作：3-4 个最常见任务。** 标题简短、副标题可选、图标使用相关的 SF Symbol。

12. **顶部栏：tvOS 的展示橱窗。** 重点展示有吸引力的内容：新剧集、精选项目、最近的内容。

13. **轻App：在严格的大小预算内提供即时、聚焦的功能。** 无需从 App Store 下载即可快速加载。只包含完成当前任务所需的功能，随后再提供完整应用的安装。

14. **App 快捷指令：将关键操作呈现给 Siri 和 Spotlight。** 为高频任务定义快捷指令。使用自然、对话式的触发短语。

## 参考索引

| 参考资料 | 主题 | 关键内容 |
|---|---|---|
| [widgets.md](references/widgets.md) | 小组件 | 一目了然的信息、尺寸、深度链接、时间线 |
| [live-activities.md](references/live-activities.md) | 实时活动 | 实时跟踪、灵动岛、锁定屏幕 |
| [notifications.md](references/notifications.md) | 通知 | 注意力、操作、分组、内容 |
| [complications.md](references/complications.md) | 复杂功能 | 表盘数据、系列、预算内更新 |
| [home-screen-quick-actions.md](references/home-screen-quick-actions.md) | 快捷操作 | 触感触控、常见任务、SF Symbols |
| [top-shelf.md](references/top-shelf.md) | 顶部栏 | 精选内容、展示 |
| [app-clips.md](references/app-clips.md) | 轻App | 即时使用、轻量、聚焦任务、NFC/二维码 |
| [watch-faces.md](references/watch-faces.md) | 表盘 | 自定义复杂功能、表盘共享 |
| [app-shortcuts.md](references/app-shortcuts.md) | App 快捷指令 | Siri、Spotlight、语音触发 |

## 输出格式

1. **系统体验推荐** -- 哪种界面最适合该用例。
2. **内容策略** -- 展示什么、优先级如何、省略什么。
3. **更新频率** -- 刷新频率，包括系统预算限制。
4. **尺寸/系列变体** -- 支持哪些变体，以及布局如何适配。
5. **深度链接行为** -- 点按后将用户带往何处。

## 需要提出的问题

1. 哪些信息需要在应用之外呈现？
2. 面向哪个平台？
3. 数据多久更新一次？
4. 主要的快速浏览需求是什么？

## 相关技能

- **hig-components-status** -- 小组件或实时活动中的进度指示器
- **hig-inputs** -- 系统体验的交互模式（复杂功能对应数码表冠）
- **hig-technologies** -- App 快捷指令对应 Siri、复杂功能对应 HealthKit、轻App 对应 NFC

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
