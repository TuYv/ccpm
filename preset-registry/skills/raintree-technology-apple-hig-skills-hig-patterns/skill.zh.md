---
name: hig-patterns
version: 1.0.0
description: >-
  Apple Human Interface Guidelines interaction and UX patterns. Use this skill when the user asks about
  "onboarding flow", "user onboarding", "app launch", "loading state", "drag and drop", "search pattern",
  "settings design", "notifications", "modality", "multitasking", "feedback pattern", "haptics",
  "undo redo", "file management", data entry, sharing, collaboration, full screen, audio, video,
  haptic feedback, ratings, printing, help, or account management in Apple apps.
  Also use when the user says "how should onboarding work", "my app takes too long to load",
  "should I use a modal here", "how do I handle errors", "when should I ask for permissions",
  "how to show progress", or "what's the right way to confirm a delete".
  Cross-references: hig-foundations for underlying principles, hig-platforms for platform specifics,
  hig-components-layout for navigation, hig-components-content for data display.
---
# Apple HIG：交互模式

在提问之前检查 `.claude/apple-design-context.md`。使用现有上下文，只询问其中尚未涵盖的信息。

## 关键原则

1. **尽量减少模态。** 仅在必须引起用户注意、必须完成或放弃某项任务，或保存更改至关重要时使用模态。优先采用非模态替代方案。

2. **提供清晰的反馈。** 每个操作都应产生可见、可听见或触觉上的响应。不确定等待时间使用活动指示器，确定等待时间使用进度条，物理确认使用触觉反馈。

3. **优先支持撤销，而不是确认对话框。** 在可能的情况下，破坏性操作应当可逆。撤销几乎总是优于“确定吗？”

4. **快速启动。** 显示一个能够无缝过渡到首个屏幕的启动画面。不要使用带有徽标的闪屏。恢复之前的状态。

5. **延后登录。** 让用户在要求创建帐户之前先进行探索。支持 Sign in with Apple 和 passkeys。

6. **保持引导简洁。** 最多三个屏幕。允许用户跳过。通过渐进式披露和上下文提示进行教学。

7. **使用渐进式披露。** 首先显示必要信息，让用户逐步深入查看详细内容。不要在一个屏幕上展示所有选项，以免造成信息过载。

8. **尊重用户注意力。** 合并通知，尽量减少打扰，让用户控制提醒。绝不要使用通知进行营销。

## 参考索引

| 参考 | 主题 | 主要内容 |
|---|---|---|
| [图表数据](references/charting-data.md) | 图表数据 | 数据可视化模式、无障碍图表、交互元素 |
| [协作与共享](references/collaboration-and-sharing.md) | 协作与共享 | 共享表单、活动视图、协作编辑、SharePlay |
| [拖放](references/drag-and-drop.md) | 拖放 | 拖动源、放置目标、弹簧加载、多项目拖动、视觉反馈 |
| [输入数据](references/entering-data.md) | 输入数据 | 文本字段、选择器、步进器、输入验证、键盘类型、自动填充 |
| [反馈](references/feedback.md) | 反馈 | 警告、操作表、触觉模式、声音反馈、视觉指示器 |
| [文件管理](references/file-management.md) | 文件管理 | 文稿浏览器、文件提供程序、iCloud 集成、文稿生命周期 |
| [进入全屏](references/going-full-screen.md) | 进入全屏 | 全屏过渡、沉浸式内容、退出全屏 |
| [启动](references/launching.md) | 启动 | 启动画面、状态恢复、冷启动与热启动 |
| [实时查看类 App](references/live-viewing-apps.md) | 实时查看类 App | 实时内容显示、实时更新、实时活动、灵动岛 |
| [加载](references/loading.md) | 加载 | 活动指示器、进度视图、骨架屏、延迟加载、占位符 |
| [管理帐户](references/managing-accounts.md) | 管理帐户 | Sign in with Apple、passkeys、帐户创建、凭据自动填充、帐户删除 |
| [管理通知](references/managing-notifications.md) | 管理通知 | 权限请求、分组、可操作通知、临时投递 |
| [模态](references/modality.md) | 模态 | Sheet、警告、弹出框、全屏模态、各自的适用场景 |
| [多任务处理](references/multitasking.md) | 多任务处理 | iPad 分屏视图、Slide Over、台前调度、响应式布局、尺寸类别转换 |
| [提供帮助](references/offering-help.md) | 提供帮助 | 上下文提示、引导提示、帮助菜单、支持链接 |
| [引导](references/onboarding.md) | 引导 | 欢迎屏幕、功能亮点、渐进式引导、跳过选项 |
| [播放音频](references/playing-audio.md) | 播放音频 | 音频会话、后台音频、播放中、音频路由、中断 |
| [播放触觉反馈](references/playing-haptics.md) | 播放触觉反馈 | Core Haptics、UIFeedbackGenerator、触觉模式、自定义触觉反馈 |
| [播放视频](references/playing-video.md) | 播放视频 | 视频播放器控件、画中画、AirPlay、全屏视频 |
| [打印](references/printing.md) | 打印 | 打印对话框、页面设置、AirPrint 集成 |
| [评分与评价](references/ratings-and-reviews.md) | 评分与评价 | SKStoreReviewController、时机、频率限制、App 内反馈 |
| [搜索](references/searching.md) | 搜索 | 搜索栏、建议、限定范围的搜索、结果显示、最近项目 |
| [设置](references/settings.md) | 设置 | App 内设置与“设置”App、偏好设置组织、切换开关、默认值 |
| [撤销与重做](references/undo-and-redo.md) | 撤销与重做 | 摇动以撤销、撤销/重做堆栈、多级撤销 |
| [训练](references/workouts.md) | 训练 | 训练会话、实时指标、常亮显示、摘要、HealthKit |

## 模式选择指南

| 用户目标 | 推荐模式 | 避免 |
|---|---|---|
| 首次使用应用 | 简短的引导流程（最多 3 个屏幕）+ 渐进式披露 | 冗长的教程、强制注册 |
| 等待内容加载 | 骨架屏或进度指示器 | 没有上下文说明的阻塞式加载动画 |
| 确认破坏性操作 | 支持撤销 | 过多的“确定吗？”对话框 |
| 收集用户输入 | 内联验证、智能默认值、自动填充 | 为简单输入使用模态表单 |
| 请求权限 | 提供上下文说明，在需要时即时请求 | 在应用启动时请求所有权限 |
| 提供反馈 | 触觉反馈 + 视觉指示器 | 执行后没有任何确认的静默操作 |
| 组织偏好设置 | 在应用内为常用项目提供设置 | 将所有设置隐藏在系统“设置”应用中 |

## 输出格式

1. **推荐模式及其理由**，引用相关参考文件。
2. **分步骤的实现方案**，涵盖每个屏幕或状态。
3. **针对目标平台的平台差异**。
4. **违反此模式 HIG 的常见问题**。

## 需要提出的问题

1. 此模式出现在应用的什么位置？前后分别是什么？
2. 目标平台有哪些？
3. 是从头开始设计，还是改进现有流程？
4. 是否涉及敏感操作？（破坏性操作、支付、权限）

## 相关技能

- **hig-foundations** -- 每种模式所依赖的无障碍、颜色、排版和隐私原则
- **hig-platforms** -- 特定平台的模式实现
- **hig-components-layout** -- 用于导航模式的结构化组件（标签栏、侧边栏、分栏视图）
- **hig-components-content** -- 模式中的内容展示（图表、内容集合、搜索结果）

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*