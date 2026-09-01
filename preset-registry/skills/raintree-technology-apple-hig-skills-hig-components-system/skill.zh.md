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

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中未涵盖的信息。

## 核心原则

1. **一目了然，立即提供价值。** 系统体验会将应用中最重要的内容带到用户无需启动应用即可看到的界面上。应针对几秒钟的注意力进行设计。

2. **尊重平台环境。** 锁定屏幕小组件与主屏幕小组件具有不同的限制条件。复杂功能远小于顶部架位项目。

3. **小组件：展示相关信息，而不是全部信息。** 展示最有用的信息子集，并进行适当更新。

4. **支持多种小组件尺寸，并为每种尺寸设计独特布局。** 每种尺寸都应经过周密设计，而不是另一种尺寸的缩放版本。

5. **点击时进行深层链接。** 将用户带到相关内容，而不是应用的根屏幕。

6. **实时活动：追踪具有明确开始和结束时间的事件。** 例如配送、比分、计时器和乘车。应同时针对灵动岛和锁定屏幕进行设计。

7. **保持更新并及时结束。** 过时的数据会削弱信任感。事件结束后应及时终止。

8. **通过通知尊重用户注意力。** 仅针对用户真正关心的信息发送通知。不要发送推广性或低价值通知。

9. **通知：可操作且自包含。** 包含足够的上下文，让用户无需打开应用即可理解并采取行动。支持通知操作。使用线程和分组。

10. **复杂功能：在表盘上展示聚焦的数据。** 针对最小但有用的呈现形式进行设计。支持多种样式。合理规划更新预算。

11. **主屏幕快捷操作：提供 3-4 个最常见的任务。** 使用简短标题、可选副标题和相关的 SF Symbol 图标。

12. **顶部架位：tvOS 的展示位。** 展示能够吸引用户的内容：新剧集、精选项目和最近内容。

13. **App Clips：在严格的大小限制内提供即时且聚焦的功能。** 无需从 App Store 下载即可快速加载。仅提供完成当前任务所需的内容，然后提供安装完整应用的选项。

14. **App Shortcuts：将关键操作呈现给 Siri 和 Spotlight。** 为常见任务定义快捷指令。使用自然、对话式的触发短语。

## 参考索引

| 参考 | 主题 | 核心内容 |
|---|---|---|
| [widgets.md](references/widgets.md) | 小组件 | 一目了然的信息、尺寸、深层链接、时间线 |
| [live-activities.md](references/live-activities.md) | 实时活动 | 实时追踪、灵动岛、锁定屏幕 |
| [notifications.md](references/notifications.md) | 通知 | 注意力、操作、分组、内容 |
| [complications.md](references/complications.md) | 复杂功能 | 表盘数据、样式、规划更新预算 |
| [home-screen-quick-actions.md](references/home-screen-quick-actions.md) | 快捷操作 | 触感触控、常见任务、SF Symbols |
| [top-shelf.md](references/top-shelf.md) | 顶部架位 | 精选内容、展示位 |
| [app-clips.md](references/app-clips.md) | App Clips | 即时使用、轻量、聚焦任务、NFC/QR |
| [watch-faces.md](references/watch-faces.md) | 表盘 | 自定义复杂功能、表盘共享 |
| [app-shortcuts.md](references/app-shortcuts.md) | App Shortcuts | Siri、Spotlight、语音触发 |

## 输出格式

1. **系统体验建议** -- 哪种界面最适合该使用场景。
2. **内容策略** -- 显示哪些内容、优先级如何、忽略哪些内容。
3. **更新频率** -- 刷新频率，包括系统预算限制。
4. **尺寸/系列变体** -- 支持哪些尺寸和系列，以及布局如何适配。
5. **深层链接行为** -- 用户点击后将跳转到哪里。

## 要询问的问题

1. 哪些信息需要在应用外呈现？
2. 使用哪个平台？
3. 数据更新的频率是多少？
4. 首要的快速查看需求是什么？

## 相关技能

- **hig-components-status** -- 小组件或实时活动中的进度指示器
- **hig-inputs** -- 系统体验的交互模式（复杂功能使用 Digital Crown）
- **hig-technologies** -- App Shortcuts 使用 Siri，复杂功能使用 HealthKit，App Clips 使用 NFC

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*