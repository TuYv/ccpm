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

提问前先检查 `.claude/apple-design-context.md`。使用已有上下文，只询问其中尚未涵盖的信息。

## 核心原则

1. **Apple 技术通过系统集成扩展应用能力。**每项技术都有既定的面向用户的模式；偏离这些模式会造成困惑并削弱信任。

2. **隐私和用户控制至上。**对于健康、支付和身份技术尤其如此。只请求必要的数据，说明原因，尊重用户的选择。

3. **Siri：自然、可预测、可恢复。**意图短语应清晰、口语化，能快速完成操作并确认结果。支持 App Shortcuts 以提供主动建议。通过明确的降级方案处理错误。

4. **支付：透明且顺畅。**使用标准的 Apple Pay 按钮样式。当 Apple Pay 可用时，绝不询问银行卡信息。清晰描述用户所购买的内容、价格，以及是一次性购买还是订阅。

5. **健康数据高度私密。**在请求访问权限前先说明其健康益处。CareKit 任务应具有鼓励性。ResearchKit 的知情同意流程必须详尽、易读，并尊重用户自主权。

6. **HomeKit：简单且可靠。**控制设备时立即响应。设备状态清晰。妥善处理连接问题。

7. **AR：真正的价值，而非噱头。**在空间上下文能增进理解时使用 AR。引导完成设置（表面、光照、空间）。提供清晰的方式退出并返回标准交互。

8. **机器学习和生成式 AI：带来增强而不造成意外。**智能建议、图像识别、文本预测。清晰标注 AI 生成的内容。提供可编辑、重新生成或关闭的控件。让用户能够纠正错误。

9. **将 Sign in with Apple 作为首选选项。**使用标准按钮样式。尊重隐藏邮箱的偏好。ID Verifier：采用引导式流程，除验证所需外不存储敏感数据。

10. **iCloud：无感且可靠的同步。**数据无需人工干预即可出现在所有设备上。妥善处理冲突。绝不丢失数据。

11. **SharePlay：实时参与。**支持多名参与者、显示在线状态、处理延迟。AirPlay：提供合适的 Now Playing 元数据。

12. **CarPlay：驾驶安全第一。**尽量降低交互复杂度、提供大触控目标、不含令人分心的内容。仅允许以下应用类型：音频、信息、电动汽车充电、导航、停车、快餐点餐。

13. **无障碍功能是基本要求。**每个元素都应有有意义的 VoiceOver 标签、特性和操作。支持 Dynamic Type、Switch Control 及其他辅助技术。全程在启用 VoiceOver 的情况下进行测试。

## 参考索引

| 参考 | 主题 | 关键内容 |
|---|---|---|
| [siri.md](references/siri.md) | Siri | Intents、快捷指令、语音交互、App Shortcuts |
| [apple-pay.md](references/apple-pay.md) | Apple Pay | 支付按钮、结账流程、安全性 |
| [tap-to-pay-on-iphone.md](references/tap-to-pay-on-iphone.md) | Tap to Pay | 商家流程、非接触式支付 |
| [in-app-purchase.md](references/in-app-purchase.md) | 应用内购买 | 订阅、一次性购买、透明度 |
| [healthkit.md](references/healthkit.md) | HealthKit | 健康数据访问、隐私、权限 |
| [carekit.md](references/carekit.md) | CareKit | 护理计划、任务、健康管理 |
| [researchkit.md](references/researchkit.md) | ResearchKit | 研究、知情同意、数据收集 |
| [homekit.md](references/homekit.md) | HomeKit | 智能家居控制、设备状态、场景 |
| [augmented-reality.md](references/augmented-reality.md) | ARKit | 空间上下文、表面检测、设置 |
| [machine-learning.md](references/machine-learning.md) | Core ML | 预测、智能功能、置信度处理 |
| [generative-ai.md](references/generative-ai.md) | 生成式 AI | 来源标注、编辑、负责任的 AI、不确定性 |
| [icloud.md](references/icloud.md) | iCloud | CloudKit、跨设备同步、冲突解决 |
| [sign-in-with-apple.md](references/sign-in-with-apple.md) | Sign in with Apple | 身份认证、隐私、按钮样式 |
| [id-verifier.md](references/id-verifier.md) | ID Verifier | 身份验证、证件扫描 |
| [shareplay.md](references/shareplay.md) | SharePlay | 共享体验、参与者在线状态 |
| [airplay.md](references/airplay.md) | AirPlay | 媒体串流、Now Playing、无线显示 |
| [carplay.md](references/carplay.md) | CarPlay | 驾驶安全、允许的应用类型、大触控目标 |
| [game-center.md](references/game-center.md) | Game Center | 成就、排行榜、多人游戏 |
| [voiceover.md](references/voiceover.md) | VoiceOver | 屏幕阅读器、标签、特性、无障碍 |
| [wallet.md](references/wallet.md) | Wallet | 凭证、票券、会员卡 |
| [nfc.md](references/nfc.md) | NFC | 标签读取、快速交互、App Clips |
| [maps.md](references/maps.md) | Maps | 位置显示、标注、路线指引 |
| [mac-catalyst.md](references/mac-catalyst.md) | Mac Catalyst | iPad 到 Mac、菜单栏、键盘、指针 |
| [live-photos.md](references/live-photos.md) | Live Photos | 动态捕捉、播放、编辑 |
| [imessage-apps-and-stickers.md](references/imessage-apps-and-stickers.md) | iMessage 应用 | 信息扩展、贴纸、紧凑 UI |
| [shazamkit.md](references/shazamkit.md) | ShazamKit | 音频识别、音乐识别 |
| [always-on.md](references/always-on.md) | 常亮显示 | 调暗状态、能效、降低更新频率 |
| [photo-editing.md](references/photo-editing.md) | 照片编辑 | 系统照片编辑器、滤镜、调整 |

## 输出格式

1. **实施清单** -- 依据 Apple 准则的逐步要求。
2. 供审批参考的**必需功能与可选功能**。
3. **隐私与权限要求** -- 数据访问、用途说明。
4. **面向用户的流程**，从权限提示直至任务完成。
5. **测试指南** -- 关键场景（包括边界情况）。

## 需要询问的问题

1. 使用哪项 Apple 技术？
2. 核心使用场景是什么？
3. 面向哪些平台？
4. 是否已审查 API 要求和 entitlements？
5. 需要哪些数据或权限？

## 相关技能

- **hig-inputs** -- 与各项技术交互的输入方式（Siri 的语音、AR 的 Pencil、Maps 的手势）
- **hig-components-system** -- 呈现技术数据的 Widget、复杂功能、Live Activities
- **hig-components-status** -- 用于技术操作的进度指示器（同步、支付、AR 加载）

---

*由 [Raintree Technology](https://raintree.technology) 构建 · [更多开发者工具](https://raintree.technology)*
