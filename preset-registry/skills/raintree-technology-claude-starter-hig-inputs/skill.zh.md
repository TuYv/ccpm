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

提问前先检查 `.claude/apple-design-context.md`。使用已有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **支持多种输入方式。** 触控、指针、键盘、笔、语音、眼睛、手、控制器。针对每个平台上可用的输入方式来设计。在 iPadOS 上同时支持触控和指针；在 macOS 上同时支持指针和键盘。

2. **每次输入操作都有一致的反馈。** 视觉、听觉或触觉响应。

3. **标准手势必须行为一致。** 轻点以激活，轻扫以滚动/导航，捏合以缩放，长按以打开情境菜单，拖移以移动。不要覆盖系统手势（用于返回、主屏幕、通知的边缘轻扫）。

4. **使用标准识别器；保持自定义手势的可发现性。** Apple 内置的识别器能够处理边缘情况和辅助功能。如果添加非标准手势，应提供提示或引导来教会用户。

5. **Apple Pencil：精准绘图、标注和选择。** 支持压力、倾斜和悬停。在适当情况下区分手指与 Pencil（手指平移、Pencil 绘图）。

6. **在文本栏中支持随手写。** 用户期望在任何文本输入中都能用 Pencil 书写。

7. **键盘快捷键和完整导航。** 标准快捷键（Cmd+C/V/Z）加上在 iPadOS Command 键快捷键叠层中可见的自定义快捷键。符合逻辑的 Tab 键焦点顺序。

8. **尊重软件键盘。** 键盘出现时调整布局。使用键盘避让 API。

9. **游戏控制器：MFi 控制器并提供屏幕内后备方案。** 映射到扩展游戏手柄配置档，提供合理的默认设置，支持重新映射。始终提供触控或键盘替代方案。

10. **指针和触控板：原生质感。** 悬停效果、指针形状自适应、标准光标行为。双指滚动、捏合缩放、轻扫导航。

11. **数码表冠：watchOS 上主要的滚动和值调节输入。** 滚动列表、调节数值、导航视图。在卡位处提供触觉反馈。

12. **眼睛与空间输入（visionOS）：注视并捏合。** 提供宽裕的命中目标（眼动追踪不如触控精准）。避免以持续注视来激活。在沉浸式体验中支持手的直接操作。

13. **焦点系统：对 tvOS 和 visionOS 至关重要。** 可预测的焦点移动。每个可交互元素都可获得焦点。清晰的视觉指示（缩放、高亮、高度提升）。符合逻辑的焦点分组。

14. **Siri 遥控器：交互面有限。** 触控区域用于轻扫，点按板用于选择，物理按钮很少。保持交互简单。

15. **陀螺仪、加速计、UWB：审慎使用。** 适用于游戏、健身和 AR。不要用于关键任务。提供校准和重置功能。对于 UWB，用视觉或触觉提示传达距离和方向。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [gestures.md](references/gestures.md) | 触控手势 | 轻点、轻扫、捏合、长按、拖移、系统手势 |
| [apple-pencil-and-scribble.md](references/apple-pencil-and-scribble.md) | Apple Pencil | 精准度、压力、倾斜、悬停、手写 |
| [keyboards.md](references/keyboards.md) | 键盘 | 快捷键、导航、软件键盘、Command 键 |
| [game-controls.md](references/game-controls.md) | 游戏控制器 | MFi、扩展游戏手柄、重新映射、后备方案 |
| [pointing-devices.md](references/pointing-devices.md) | 指针/触控板 | 悬停、光标变形、触控板手势 |
| [digital-crown.md](references/digital-crown.md) | 数码表冠 | 滚动、值调节、触觉卡位 |
| [eyes.md](references/eyes.md) | 眼动追踪 | 注视并轻点、注视定位、命中目标大小 |
| [spatial-interactions.md](references/spatial-interactions.md) | 空间输入 | 手势、直接操作、沉浸式输入 |
| [focus-and-selection.md](references/focus-and-selection.md) | 焦点系统 | tvOS/visionOS 导航、焦点指示器、分组 |
| [remotes.md](references/remotes.md) | 遥控器 | 触控表面、点按板、简单交互 |
| [gyro-and-accelerometer.md](references/gyro-and-accelerometer.md) | 运动传感器 | 陀螺仪、加速计、校准、游戏 |
| [nearby-interactions.md](references/nearby-interactions.md) | 近距离交互 | U1 芯片、方向查找、邻近触发 |
| [camera-control.md](references/camera-control.md) | 相机控制 | iPhone 相机硬件按钮、快速启动 |

## 输出格式

1. **按平台给出输入方式建议**以及它们之间的交互方式。
2. **手势规格表** —— 标准手势和自定义手势及其预期行为。
3. **遵循系统惯例的键盘快捷键建议**。
4. **辅助功能输入替代方案**，适用于 VoiceOver、切换控制等。

## 需要提出的问题

1. 面向哪些平台和输入设备？
2. 是效率类还是休闲类应用？
3. 设计中是否有自定义手势？
4. 是否需要游戏控制器支持？

## 相关技能

- **hig-components-status** —— 响应输入的进度指示器（下拉刷新）
- **hig-components-system** —— 具有独特输入约束的系统体验
- **hig-technologies** —— VoiceOver、Siri 语音输入、ARKit 空间手势上下文

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
