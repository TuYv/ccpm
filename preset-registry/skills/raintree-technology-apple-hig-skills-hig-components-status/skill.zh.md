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

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **对于持续时间超过一两秒的操作，显示进度。**

2. **已知持续时间或百分比时，使用确定性进度指示器。** 填充式进度条可以让用户清楚地了解剩余工作量。用于下载、上传或任何可测量的过程。

3. **未知持续时间时，使用不确定性进度指示器。** 旋转指示器可以传达操作正在进行，同时不承诺具体的时间范围。用于不可预测的网络请求。

4. **优先使用进度条，而不是旋转指示器。** 确定性进度会让用户感觉更快、更值得信赖。

5. **将指示器放置在内容即将出现的位置。** 将内联进度指示器放在内容区域附近，而不是放在模态窗口中或距离较远的位置。

6. **不要叠加多个指示器。** 将同时进行的操作汇总为一个表示，或仅显示最相关的操作。

7. **没有充分理由时，不要隐藏状态栏。** 仅在沉浸式体验（全屏媒体、游戏、AR）中考虑隐藏状态栏。

8. **让状态栏样式与内容相匹配。** 使用浅色或深色样式以确保足够的对比度。

9. **遵循安全区域。** 不要将交互式内容放置在状态栏后方。

10. **退出沉浸式场景时，及时恢复状态栏。**

11. **活动圆环用于活动、锻炼和站立目标。** 不要将圆环隐喻用于无关数据。

12. **遵循圆环颜色惯例。** 红色（活动）、绿色（锻炼）和蓝色（站立）与 Apple Fitness 有着紧密关联。

13. **使用 HealthKit API** 获取活动数据，而不是手动跟踪。

14. **在圆环闭合时，通过动画和触觉反馈庆祝目标完成。**

## 参考索引

| 参考 | 主题 | 主要内容 |
|---|---|---|
| [progress-indicators.md](references/progress-indicators.md) | 进度条和旋转指示器 | 确定性、不确定性、内联放置、持续时间 |
| [status-bars.md](references/status-bars.md) | iOS/iPadOS 状态栏 | 系统信息、可见性、样式、安全区域 |
| [activity-rings.md](references/activity-rings.md) | watchOS 活动圆环 | 活动/锻炼/站立、HealthKit、健身跟踪、颜色 |

## 输出格式

1. **指示器类型建议**，并说明理由（确定性与不确定性）。
2. **时机和动画指导** -- 持续时间阈值、动画样式、过渡效果。
3. **辅助功能** -- VoiceOver 进度播报、实时区域更新。
4. **特定平台的行为**，涵盖目标平台。

## 要提出的问题

1. 持续时间是已知还是未知？
2. 适用于哪些平台？
3. 该操作通常需要多长时间？
4. 是系统级指示器还是应用内指示器？

## 相关技能

- **hig-components-system** -- 显示进度或状态的小组件和复杂功能
- **hig-inputs** -- 触发进度状态的手势（下拉刷新）
- **hig-technologies** -- 用于活动圆环数据的 HealthKit；用于进度播报的 VoiceOver

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*