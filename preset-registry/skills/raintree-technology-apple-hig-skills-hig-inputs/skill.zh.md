---
name: hig-inputs
version: 1.0.0
description: >-
  Apple HIG guidance for input methods and interaction patterns: gestures, Apple Pencil,
  keyboards, game controllers, pointers, Digital Crown, eye tracking, focus system,
  remotes, spatial interactions, gyroscope, accelerometer, and nearby interactions.
  Use when asked about: "gesture design", "Apple Pencil", "keyboard shortcuts",
  "game controller", "pointer support", "mouse support", "trackpad", "Digital Crown",
  "eye tracking", "visionOS input", "focus system", "remote control", "gyroscope",
  "spatial interaction". Also use when the user says "what gestures should I support,"
  "how do I add keyboard shortcuts," "how does input work on Apple TV," "should I
  support Apple Pencil," or asks about input device handling.
  Cross-references: hig-components-status, hig-components-system,
  hig-technologies for VoiceOver and Siri.
---
# Apple HIG：输入

在提问前检查 `.claude/apple-design-context.md`。使用已有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **支持多种输入方式。**触控、指针、键盘、触控笔、语音、眼睛、手部、控制器。针对各个平台可用的输入方式进行设计。在 iPadOS 上，同时支持触控和指针；在 macOS 上，同时支持指针和键盘。

2. **为每次输入操作提供一致的反馈。**可视、听觉或触觉反馈。

3. **标准手势的行为必须保持一致。**轻点以激活，滑动以滚动/导航，捏合以缩放，长按以显示上下文菜单，拖动以移动。不要覆盖系统手势（用于返回、主屏幕和通知的边缘滑动）。

4. **使用标准识别器；确保自定义手势易于发现。**Apple 的内置识别器能够处理边缘情况和辅助功能。如果添加非标准手势，应提供提示或引导来教用户使用。

5. **Apple Pencil：用于精确绘图、标记和选择。**支持压力、倾斜和悬停。在适当情况下区分手指和 Pencil（手指平移，Pencil 绘图）。

6. **在文本字段中支持随手写。**用户希望能够在任何文本输入中使用 Pencil 书写。

7. **键盘快捷键和完整导航。**除标准快捷键（Cmd+C/V/Z）外，还要提供自定义快捷键，并在 iPadOS 的 Command 键叠加层中显示。设置合理的 Tab 顺序。

8. **尊重软件键盘。**键盘出现时调整布局。使用键盘避让 API。

9. **游戏控制器：使用带有屏幕操作备用方案的 MFi 控制器。**映射到扩展游戏手柄配置，提供合理的默认设置，并支持重新映射。始终提供触控或键盘替代方案。

10. **指针和触控板：提供原生体验。**悬停效果、指针形状自适应、标准光标行为。双指滚动、捏合缩放、滑动导航。

11. **Digital Crown：在 watchOS 上用于滚动和调整数值的主要输入方式。**滚动列表、调整数值、浏览视图。在刻度点提供触觉反馈。

12. **眼睛和空间交互（visionOS）：注视和捏合。**提供足够大的命中目标（眼动追踪的精度低于触控）。避免使用持续注视来激活。在沉浸式体验中进行直接手部操控。

13. **焦点系统：对 tvOS 和 visionOS 至关重要。**确保焦点移动可预测。每个交互元素都应可获得焦点。提供清晰的视觉指示（缩放、高亮、悬浮）。设置合理的焦点组。

14. **Siri Remote：交互表面有限。**触控区域用于滑动，Clickpad 用于选择，实体按钮较少。保持交互简单。

15. **谨慎使用陀螺仪、加速度计和 UWB。**适用于游戏、健身和 AR。不应将其用于关键任务。提供校准和重置功能。对于 UWB，通过视觉或触觉提示传达距离和方向。

## 参考索引

| 参考 | 主题 | 主要内容 |
|---|---|---|
| [gestures.md](references/gestures.md) | 触控手势 | 轻点、滑动、捏合、长按、拖动、系统手势 |
| [apple-pencil-and-scribble.md](references/apple-pencil-and-scribble.md) | Apple Pencil | 精确度、压力、倾斜、悬停、手写 |
| [keyboards.md](references/keyboards.md) | 键盘 | 快捷键、导航、软件键盘、Command 键 |
| [game-controls.md](references/game-controls.md) | 游戏控制器 | MFi、扩展游戏手柄、重新映射、备用方案 |
| [pointing-devices.md](references/pointing-devices.md) | 指针/触控板 | 悬停、光标变形、触控板手势 |
| [digital-crown.md](references/digital-crown.md) | Digital Crown | 滚动、调整数值、触觉刻度点 |
| [eyes.md](references/eyes.md) | 眼动追踪 | 注视和轻点、注视定位、命中目标大小 |
| [spatial-interactions.md](references/spatial-interactions.md) | 空间输入 | 手部手势、直接操控、沉浸式输入 |
| [focus-and-selection.md](references/focus-and-selection.md) | 焦点系统 | tvOS/visionOS 导航、焦点指示器、焦点组 |
| [remotes.md](references/remotes.md) | 遥控器 | 触控表面、Clickpad、简单交互 |
| [gyro-and-accelerometer.md](references/gyro-and-accelerometer.md) | 运动传感器 | 陀螺仪、加速度计、校准、游戏 |
| [nearby-interactions.md](references/nearby-interactions.md) | 附近交互 | U1 芯片、方向查找、邻近触发器 |
| [camera-control.md](references/camera-control.md) | Camera Control | iPhone 相机硬件按钮、快速启动 |

## 输出格式

1. **按平台提供输入方式建议**，以及它们之间的交互方式。
2. **手势规范表**——标准手势和自定义手势及其预期行为。
3. **键盘快捷键建议**，遵循系统惯例。
4. **无障碍输入替代方案**，适用于 VoiceOver、切换控制等。

## 需要询问的问题

1. 支持哪些平台和输入设备？
2. 这是生产力应用还是休闲应用？
3. 设计中是否包含自定义手势？
4. 是否需要支持游戏控制器？

## 相关技能

- **hig-components-status** -- 响应输入的进度指示器（下拉刷新）
- **hig-components-system** -- 具有独特输入限制的系统体验
- **hig-technologies** -- VoiceOver、Siri 语音输入、ARKit 空间手势上下文

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*