---
name: hig-components-status
version: 1.0.0
description: >-
  Apple HIG guidance for status and progress UI components including progress indicators,
  status bars, and activity rings. Use this skill when asked about: "progress indicator",
  "progress bar", "loading spinner", "status bar", "activity ring", "progress display",
  determinate vs indeterminate progress, loading states, or fitness tracking rings.
  Also use when the user says "how do I show loading state," "should I use a spinner
  or progress bar," "what goes in the status bar," or asks about activity indicators.
  Cross-references: hig-components-system for widgets and complications,
  hig-inputs for gesture-driven progress controls, hig-technologies for HealthKit
  and activity ring data integration.
---
# Apple HIG：状态组件

在提问之前先检查 `.claude/apple-design-context.md`。利用已有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **对于持续一两秒以上的操作，要显示进度。**

2. **在已知时长/百分比时使用确定型（determinate）指示器。** 不断填充的进度条能让用户对剩余工作量有清晰的感知。适用于下载、上传或任何可度量的过程。

3. **在时长未知时使用不确定型（indeterminate）指示器。** 旋转指示器（spinner）传达工作正在进行，但不承诺时间范围。适用于不可预测的网络请求。

4. **优先使用进度条而非 spinner。** 确定型进度让人感觉更快、更可信。

5. **将指示器放在内容将要出现的位置。** 在内容区域附近使用内联进度，而不是采用模态形式或放置在远处。

6. **不要堆叠多个指示器。** 将同时进行的操作聚合为一个统一的呈现，或只显示最相关的一个。

7. **没有充分理由不要隐藏状态栏。** 隐藏仅保留给沉浸式体验（全屏媒体、游戏、AR）。

8. **让状态栏样式与内容匹配。** 选择浅色或深色以确保足够的对比度。

9. **遵守安全区域。** 状态栏背后不要放置任何可交互内容。

10. 退出沉浸式场景时**及时恢复状态栏**。

11. **活动圆环专用于“活动”、“锻炼”和“站立”目标。** 不要将圆环这一隐喻挪用于无关的数据。

12. **遵守圆环颜色惯例。** 红色（活动）、绿色（锻炼）、蓝色（站立）与 Apple Fitness 有强烈的关联。

13. **使用 HealthKit API** 获取活动数据，而不是手动追踪。

14. 当圆环闭合时，用动画和触觉反馈来**庆祝完成**。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [progress-indicators.md](references/progress-indicators.md) | 进度条与 spinner | 确定型、不确定型、内联放置、时长 |
| [status-bars.md](references/status-bars.md) | iOS/iPadOS 状态栏 | 系统信息、可见性、样式、安全区域 |
| [activity-rings.md](references/activity-rings.md) | watchOS 活动圆环 | 活动/锻炼/站立、HealthKit、健身追踪、颜色 |

## 输出格式

1. **指示器类型建议**，并附理由（确定型 vs 不确定型）。
2. **时机与动画指南** —— 时长阈值、动画风格、过渡。
3. **无障碍** —— VoiceOver 进度播报、实时区域（live region）更新。
4. **平台特定行为**，覆盖各目标平台。

## 需要询问的问题

1. 时长是已知还是未知？
2. 针对哪些平台？
3. 该操作通常需要多长时间？
4. 使用系统级还是应用内指示器？

## 相关技能

- **hig-components-system** —— 显示进度或状态的小组件与复杂功能
- **hig-inputs** —— 触发进度状态的手势（下拉刷新）
- **hig-technologies** —— 用于活动圆环数据的 HealthKit；用于进度播报的 VoiceOver

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
