---
name: hig-technologies
version: 1.0.0
description: >-
  Apple HIG guidance for Apple technology integrations: Siri, Apple Pay, HealthKit,
  HomeKit, ARKit, machine learning, generative AI, iCloud, Sign in with Apple,
  SharePlay, CarPlay, Game Center, in-app purchase, NFC, Wallet, VoiceOver, Maps,
  Mac Catalyst, and more. Use when asked about: "Siri integration", "Apple Pay",
  "HealthKit", "HomeKit", "ARKit", "augmented reality", "machine learning",
  "generative AI", "iCloud sync", "Sign in with Apple", "SharePlay", "CarPlay",
  "in-app purchase", "NFC", "VoiceOver", "Maps", "Mac Catalyst". Also use when
  the user says "how do I integrate Siri," "what are the Apple Pay guidelines,"
  "how should my AR experience work," "how do I use Sign in with Apple," or asks
  about any Apple framework or service integration.
  Cross-references: hig-inputs for input methods, hig-components-system for widgets.
---
# Apple HIG：技术

在提问前检查 `.claude/apple-design-context.md`。使用现有上下文，仅询问其中未涵盖的信息。

## 核心原则

1. **Apple 技术通过系统集成扩展 App 的能力。** 每项技术都有既定的面向用户的使用模式；偏离这些模式会造成困惑并削弱信任。

2. **隐私和用户控制至关重要。** 对于健康、支付和身份技术尤其如此。只请求所需的数据，说明请求原因，并尊重用户的选择。

3. **Siri：自然、可预测、可恢复。** 使用清晰的对话式意图短语，使操作能够快速完成并确认结果。支持 App Shortcuts 以提供主动建议。通过明确的回退方案处理错误。

4. **支付：透明且流畅。** 使用标准的 Apple Pay 按钮样式。Apple Pay 可用时，绝不要要求用户输入卡片详细信息。清楚说明用户购买的内容、价格，以及这是一次性购买还是订阅。

5. **健康数据具有高度私密性。** 在请求访问权限之前，先解释健康方面的益处。CareKit 任务应具有鼓励性。ResearchKit 的知情同意流程必须全面、易读，并尊重用户的自主权。

6. **HomeKit：简单且可靠。** 控制设备时应立即响应。清晰显示设备状态。妥善处理连接问题。

7. **AR：提供真正的价值，而不是噱头。** 在空间环境有助于提升理解时使用 AR。引导用户完成设置（表面、光照、空间）。提供清晰的退出方式，以返回标准交互。

8. **ML 和生成式 AI：在不造成意外的前提下增强体验。** 提供智能建议、图像识别和文本预测。清楚标注 AI 生成的内容。提供编辑、重新生成或关闭的控件。允许用户纠正错误。

9. **将 Sign in with Apple 作为首选项。** 使用标准按钮样式。尊重用户隐藏电子邮件的偏好。ID Verifier：提供引导式流程，除验证所需内容外，不要存储敏感数据。

10. **iCloud：无感且可靠的同步。** 数据应在所有设备上显示，无需手动干预。妥善处理冲突。绝不要丢失数据。

11. **SharePlay：实时参与。** 支持多名参与者，显示参与者状态，并处理延迟。AirPlay：提供适当的 Now Playing 元数据。

12. **CarPlay：驾驶员安全优先。** 尽量降低交互复杂度，使用较大的触控目标，不提供会分散注意力的内容。仅允许以下 App 类型：音频、信息、电动汽车充电、导航、停车、快速点餐。

13. **无障碍是基础要求。** 每个元素都应具有有意义的 VoiceOver 标签、特征和操作。支持动态字体、切换控制和其他辅助技术。完全启用 VoiceOver 进行测试。

## 参考索引

| 参考 | 主题 | 主要内容 |
|---|---|---|
| [siri.md](references/siri.md) | Siri | 意图、快捷指令、语音交互、App Shortcuts |
| [apple-pay.md](references/apple-pay.md) | Apple Pay | 支付按钮、结账流程、安全性 |
| [tap-to-pay-on-iphone.md](references/tap-to-pay-on-iphone.md) | Tap to Pay | 商户流程、非接触式支付 |
| [in-app-purchase.md](references/in-app-purchase.md) | App 内购买 | 订阅、一次性购买、透明度 |
| [healthkit.md](references/healthkit.md) | HealthKit | 健康数据访问、隐私、权限 |
| [carekit.md](references/carekit.md) | CareKit | 护理计划、任务、健康管理 |
| [researchkit.md](references/researchkit.md) | ResearchKit | 研究、知情同意、数据收集 |
| [homekit.md](references/homekit.md) | HomeKit | 智能家居控制、设备状态、场景 |
| [augmented-reality.md](references/augmented-reality.md) | ARKit | 空间环境、表面检测、设置 |
| [machine-learning.md](references/machine-learning.md) | Core ML | 预测、智能功能、置信度处理 |
| [generative-ai.md](references/generative-ai.md) | 生成式 AI | 归属标注、编辑、负责任的 AI、不确定性 |
| [icloud.md](references/icloud.md) | iCloud | CloudKit、跨设备同步、冲突解决 |
| [sign-in-with-apple.md](references/sign-in-with-apple.md) | Sign in with Apple | 身份验证、隐私、按钮样式 |
| [id-verifier.md](references/id-verifier.md) | ID Verifier | 身份验证、证件扫描 |
| [shareplay.md](references/shareplay.md) | SharePlay | 共享体验、参与者状态 |
| [airplay.md](references/airplay.md) | AirPlay | 媒体流式传输、Now Playing、无线显示 |
| [carplay.md](references/carplay.md) | CarPlay | 驾驶员安全、允许的 App 类型、大型触控目标 |
| [game-center.md](references/game-center.md) | Game Center | 成就、排行榜、多人游戏 |
| [voiceover.md](references/voiceover.md) | VoiceOver | 屏幕阅读器、标签、特征、无障碍 |
| [wallet.md](references/wallet.md) | Wallet | 卡券、票券、会员卡 |
| [nfc.md](references/nfc.md) | NFC | 标签读取、快速交互、App Clips |
| [maps.md](references/maps.md) | Maps | 位置显示、标注、路线 |
| [mac-catalyst.md](references/mac-catalyst.md) | Mac Catalyst | 从 iPad 到 Mac、菜单栏、键盘、指针 |
| [live-photos.md](references/live-photos.md) | Live Photos | 动态捕捉、播放、编辑 |
| [imessage-apps-and-stickers.md](references/imessage-apps-and-stickers.md) | iMessage App | 信息扩展、贴纸、紧凑型 UI |
| [shazamkit.md](references/shazamkit.md) | ShazamKit | 音频识别、音乐识别 |
| [always-on.md](references/always-on.md) | 始终显示 | 调暗状态、能效、减少更新 |
| [photo-editing.md](references/photo-editing.md) | 照片编辑 | 系统照片编辑器、滤镜、调整 |

## 输出格式

1. **实现检查清单** -- 根据 Apple 指南列出分步要求。
2. **审核所需与可选功能**。
3. **隐私与权限要求** -- 数据访问、使用说明。
4. **面向用户的流程** -- 从权限提示到任务完成。
5. **测试指导** -- 包括边缘情况在内的关键场景。

## 需要询问的问题

1. 使用哪项 Apple 技术？
2. 核心用例是什么？
3. 支持哪些平台？
4. 是否已审核 API 要求和 entitlements？
5. 需要哪些数据或权限？

## 相关技能

- **hig-inputs** -- 与技术交互的输入方式（Siri 使用语音、AR 使用 Pencil、Maps 使用手势）
- **hig-components-system** -- 用于呈现技术数据的小组件、复杂功能和实时活动
- **hig-components-status** -- 用于显示技术操作进度的进度指示器（同步、支付、AR 加载）

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*