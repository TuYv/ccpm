---
name: react-native-tv-best-practices
description: Reviews React Native TV apps for focus/D-pad navigation, 10-foot UI layout, TV playback/DRM integration, low-memory TV performance, and TV accessibility. Use when building, debugging, or reviewing react-native-tvos, Expo TV, Amazon Vega/Kepler, or React Native web TV targets where the issue depends on remote input, TV focus, TV packaging, TV hardware, or TV playback constraints.
license: MIT
---
# React Native TV 最佳实践

## 概述

适用于以 React Native 为基础、运行在 Apple TV、Android TV、Fire TV、Amazon Vega/Kepler 以及 Tizen 或 webOS 等基于 Web 的电视目标平台上的应用的电视专项审查指南。

仅将此技能用于电视平台差异：遥控器输入、焦点引擎、10 英尺观看距离布局、平台打包、播放/DRM、低内存电视硬件以及电视无障碍功能。对于常规的 React Native 性能或架构问题，请使用 [react-native-best-practices](../react-native-best-practices/SKILL.md)。

## 技能格式

参考文件按主题前缀分组：

- `focus-*`：焦点引擎、焦点引导、焦点事件性能
- `nav-*`：方向键导航、Back/Menu 行为、键盘/搜索输入
- `design-*`：10 英尺观看距离下的排版、布局、颜色、焦点可见性
- `perf-*`：电视硬件上的启动、内存、列表、动画和网络限制
- `video-*`：播放架构、DRM/协议选择、调试
- `a11y-*`：电视无障碍功能实现和审计检查
- `setup-*`：技术栈检测、设置、架构、跨平台行为
- `test-*` 和 `release-*`：测试覆盖率、E2E 以及 CI/发布工作流

## 何时应用

当应用面向电视平台，并且相关工作涉及以下内容时，请应用此技能：

- 焦点移动、可见焦点、焦点恢复或遥控器/方向键输入
- 电视布局可读性、过扫描/安全区域或 10 英尺观看距离下的 UI 密度
- 电视播放器控件、清单、DRM、解码器支持或播放错误
- 低内存电视硬件上的性能，尤其是涉及视频或大型轮播列表时
- 使用屏幕阅读器、字幕、焦点顺序或仅遥控器交互的电视无障碍功能
- `react-native-tvos`、Expo TV、Amazon Vega/Kepler、Tizen 或 webOS 的平台设置

## 开始之前——识别电视技术栈

此技能涵盖多种电视技术栈。**在标记设置问题之前，请先检测应用面向哪一种技术栈**——如果要求 Vega/Kepler 或基于 Web 的电视应用使用 `react-native-tvos`、tvOS Podfile 或 Android TV 清单，就会产生误报。

| 技术栈                                                | 检测方式                                                                                          | 设置要求                                                                                                                       |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **react-native-tvos**（Apple TV、Android TV、Fire TV） | package.json 中包含 `"react-native": "npm:react-native-tvos@…"`                                   | tvOS Podfile（`platform :tvos`）；Android TV 清单中的 `leanback`/`LEANBACK_LAUNCHER` 条目；电视模拟器                           |
| **Expo + react-native-tvos**                          | 除上述内容外，app.json 中还包含 `@react-native-tvos/config-tv`                                    | 使用 `EXPO_TV=1` 进行预构建；`react-native-tvos` 版本必须与 Expo SDK 匹配；并非所有 Expo 功能/库都可用于电视平台                |
| **Amazon Vega / Kepler**                              | Vega/Kepler SDK 和工具（`@amazon-devices/*` 依赖项、Kepler 清单）；**不使用** `react-native-tvos` | Amazon 的 Vega/Kepler 工具链——`react-native-tvos`、tvOS Podfile 和 Android TV 清单均**不适用**                                 |
| **基于 Web 的电视平台**（Tizen、webOS）               | Web 打包工具（Rsbuild/webpack）+ 平台打包；空间导航库                                             | 平台 SDK 打包；使用 `@noriginmedia/norigin-spatial-navigation` 实现焦点导航                                                    |

焦点、十英尺体验设计、性能、无障碍和播放器指导适用于所有这些技术栈——只有 **setup/build** 方面的要求因技术栈而异。

## 审查规则

- 在提供设置建议之前，先确定目标技术栈。
- 优先采用自然的焦点顺序和焦点引导，而不是强制调用焦点或使用大范围的 `nextFocus*` 映射。
- 将焦点丢失、焦点不可见以及 Back/Menu 行为异常视为导航缺陷。
- 在调整视觉细节之前，先从电视观看距离检查可读性、安全区域和焦点状态。
- 在将性能修复报告为已完成之前，先在支持的最低性能电视设备上进行性能分析。
- 按层区分播放故障：清单请求、DRM 许可证交换、解码器能力、播放器状态和 React UI 控件。

## 按优先级排序的指南

| 优先级 | 类别 | 影响 | 前缀 |
|----------|----------|--------|--------|
| 1 | 焦点和方向键导航 | CRITICAL | `focus-*`, `nav-*` |
| 2 | 列表、动画和输入性能 | CRITICAL | `perf-*` |
| 3 | 播放和 DRM 故障 | HIGH | `video-*` |
| 4 | 十英尺距离下的可读性和布局 | HIGH | `design-*` |
| 5 | 电视无障碍 | HIGH | `a11y-*` |
| 6 | 技术栈设置、测试和发布 | MEDIUM | `setup-*`, `test-*`, `release-*` |

## 快速参考

1. 从包文件、清单、原生目录和平台工具中识别电视技术栈。
2. 使用遥控器或方向键操作路径复现导航问题，不要基于鼠标或触摸操作的假设。
3. 确认获得焦点的元素始终可见、可达，并能在模态框或路由切换后恢复焦点。
4. 在更改 React 控件之前，先从网络/DRM 层开始向上排查播放故障。
5. 在支持的最低性能电视目标设备上测量列表、动画、内存和启动任务的性能。

## 参考资料

### 焦点和导航

| 文件 | 影响 | 描述 |
|------|--------|-------------|
| [focus-management.md](references/focus-management.md) | CRITICAL | 焦点引擎、焦点引导、`nextFocus*` 和焦点恢复 |
| [focus-performance.md](references/focus-performance.md) | CRITICAL | 避免焦点事件处理导致丢帧 |
| [nav-directional.md](references/nav-directional.md) | CRITICAL | 跨电视平台的方向导航规则 |
| [nav-patterns.md](references/nav-patterns.md) | CRITICAL | 全局/局部导航、模态框、选项卡和 Back 行为 |
| [nav-keyboard.md](references/nav-keyboard.md) | MEDIUM | 使用遥控器进行搜索和文本输入 |

### 设计

| 文件 | 影响 | 描述 |
|------|--------|-------------|
| [design-10foot.md](references/design-10foot.md) | HIGH | 十英尺体验审查启发式方法 |
| [design-typography.md](references/design-typography.md) | HIGH | 电视端字号和可读性 |
| [design-layout.md](references/design-layout.md) | HIGH | 安全区域、间距、轮播和焦点空间 |
| [design-color.md](references/design-color.md) | MEDIUM | 对比度和电视显示器的色彩限制 |

### 性能

| 文件 | 影响 | 描述 |
|------|--------|-------------|
| [perf-overview.md](references/perf-overview.md) | HIGH | 电视性能目标和性能分析顺序 |
| [perf-lists.md](references/perf-lists.md) | CRITICAL | 虚拟化行和包含大量海报的列表 |
| [perf-animations.md](references/perf-animations.md) | CRITICAL | 焦点和过渡动画性能 |
| [perf-memory.md](references/perf-memory.md) | HIGH | 低内存电视崩溃以及图像/视频压力 |
| [perf-network.md](references/perf-network.md) | HIGH | 遥控器输入、请求停滞和网络韧性 |

### 视频、无障碍、设置、测试

| 文件 | 影响 | 描述 |
|------|--------|-------------|
| [video-streaming.md](references/video-streaming.md) | 高 | TV 平台协议/DRM 选择 |
| [video-players.md](references/video-players.md) | 高 | 播放器选择和自定义控件 |
| [video-debugging.md](references/video-debugging.md) | 高 | 清单、DRM、编解码器和播放调试 |
| [a11y-overview.md](references/a11y-overview.md) | 中 | TV 特有的无障碍差异 |
| [a11y-implementation.md](references/a11y-implementation.md) | 高 | 无障碍标签、角色、实时区域和焦点 |
| [a11y-checklist.md](references/a11y-checklist.md) | 中 | 发布前无障碍审核清单 |
| [setup-getting-started.md](references/setup-getting-started.md) | 中 | `react-native-tvos` 和 Expo TV 设置 |
| [setup-cross-platform.md](references/setup-cross-platform.md) | 中 | 平台检测和跨平台注意事项 |
| [setup-architecture.md](references/setup-architecture.md) | 中 | 代码共享和项目结构 |
| [test-strategy.md](references/test-strategy.md) | 中 | TV 测试范围和覆盖划分 |
| [test-javascript.md](references/test-javascript.md) | 中 | JS 层级的遥控器/焦点测试辅助工具 |
| [test-e2e.md](references/test-e2e.md) | 中 | Appium 和 TV 端到端测试覆盖 |
| [release-cicd.md](references/release-cicd.md) | 中 | CI、构建指纹识别和发布检查 |

## 问题 → Skill 映射

| 症状                              | 从这里开始                                                                   |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| “焦点跳转到错误的元素”       | [focus-management.md](references/focus-management.md) → 调试部分    |
| “滚动列表时应用卡死”   | [perf-lists.md](references/perf-lists.md) → 虚拟化                   |
| “动画在 Fire TV 上卡顿”      | [perf-animations.md](references/perf-animations.md) → 原生驱动          |
| “TV 上的文本太小”               | [design-typography.md](references/design-typography.md) → 最小字号      |
| “视频无法播放/出现 DRM 错误”      | [video-streaming.md](references/video-streaming.md) → DRM 部分            |
| “屏幕阅读器跳过元素”       | [a11y-implementation.md](references/a11y-implementation.md) → 角色和标签 |
| “返回按钮无法正常工作”     | [nav-patterns.md](references/nav-patterns.md) → 返回导航              |
| “键盘遮挡内容”            | [nav-keyboard.md](references/nav-keyboard.md) → 内置与自定义方案           |
| “应用启动耗时过长”         | [perf-overview.md](references/perf-overview.md) → 启动时间               |
| “图片导致内存崩溃”      | [perf-memory.md](references/perf-memory.md) → 图片优化             |
| “CI 流水线耗时数小时”            | [release-cicd.md](references/release-cicd.md) → 指纹识别               |
| “如何跨平台共享代码” | [setup-architecture.md](references/setup-architecture.md) → 代码共享     |

## 安全性（TV 特定）

与任何 RN 应用一样，通用的依赖项/输入卫生措施同样适用；值得指出的 TV 特定差异如下：

- 切勿在客户端代码中嵌入 FairPlay/Widevine/PlayReady 密钥——将许可证服务器视为信任边界，并确保 DRM 令牌由服务器签发。