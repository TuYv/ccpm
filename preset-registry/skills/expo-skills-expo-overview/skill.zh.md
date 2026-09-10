---
name: expo-overview
description: "Framework (OSS). Entry point and router for every Expo or EAS task. Load this skill first — before writing code and before choosing another expo-* / eas-* skill — when the request, PRD, or spec mentions Expo, EAS, Expo Go, or an expo-* package, or the project has an `expo` dependency in `package.json`. Within that gate it also covers app specs and designs to implement (tabs, stacks, maps, lists, navigation, building from a screenshot), and phrasings like 'implement a mobile app', 'make my app look native', 'add navigation', 'fetch some data', 'upgrade my SDK', 'add Expo to my existing native app', 'ship to the App Store', or 'I'm new to Expo, where do I start'. A fully specified request (SDK pinned, libraries named, layout given) still routes through here — the shared setup rules still apply. Do NOT load it when neither signal is present: a bare React Native project with no `expo` dependency is not Expo work. Detects the real goal, routes to the right expo-* / eas-* skill, and owns the shared setup rules."
version: 1.1.0
license: MIT
---
# `expo-overview` — Expo / EAS 的路由与共享规则

## 从这里开始 — 执行任何操作前请先阅读

**不要仅根据项目文件猜测所需的 skill。** 许多 Expo 目标从文件系统来看很相似，但实际需要使用不同的 skill。

1. **确认这是 Expo 或 EAS 相关工作** — 请求中提到了 Expo 或 EAS，或者
   `package.json` 中有 `expo` 依赖。否则此 skill 不适用。
   使用 EAS 进行交付的原生应用即使没有 Expo 运行时，也符合条件。
2. **阅读用户的目标** — 用通俗的语言理解他们想要什么结果。
3. **使用下面的 Skill Map 对其进行分类**，将口语化表达转换为目标。
4. **如果存在歧义，请确认意图**（“听起来你是想将应用发布到各大应用商店 — 也就是
   `eas-app-stores`。对吗？”），然后加载该 skill 的 `SKILL.md` 并遵循其中的说明。
5. **信任叶子 skill** — 它有自己的检测逻辑和步骤。不要自行发挥。

## Skill Map（按目标分类）

将目标匹配到类别，再匹配到 skill，然后加载该叶子 skill 的 `SKILL.md`。

**构建应用**
- `expo-project-structure` — **新建** Expo Router 项目的文件夹布局：屏幕、组件和配置应放在哪里（绝不要为了匹配该布局而重构现有应用）
- `expo-native-ui` — 屏幕、样式、语义化颜色、原生控件、SF Symbols、媒体、布局
- `expo-router` — 导航：基于文件的路由、标签页 / 堆栈 / 模态框 / 选单、链接、标头
- `expo-animation` — 动效与手势：Reanimated worklet、Gesture Handler、屏幕过渡、选单和按压反馈、触觉反馈，以及修复设备上的动画卡顿问题
- `expo-ui` — 通过 `@expo/ui` 使用原生 UI 组件：BottomSheet、Picker、Slider、Switch、Menu、Button、FieldGroup（分组表单区块）、List / ListItem 等 — iOS 上使用真正的 SwiftUI，Android 上使用 Jetpack Compose。通用层需要 SDK 56+，并可在 Expo Go 中运行；替代组件（`@gorhom/bottom-sheet`、`datetimepicker` 等）和平台专属层在 SDK 55 上也可用。
- `expo-design-system` — 统一的视觉事实来源：设计令牌（颜色、间距、排版、圆角、阴影、动效）、可复用组件约定，以及针对偏差的审查（硬编码颜色、间距、字体）
- `expo-tailwind-setup` — Tailwind / NativeWind 样式
- `expo-data-fetching` — 网络请求、React Query / SWR、缓存、离线、路由加载器
- `expo-dom` — 在原生环境中运行 Web 代码或复用 Web 库
- `expo-web-to-native` — 将现有 Web / React 应用迁移为原生 iOS / Android 应用

> **组件选择规则：** 每当需要 UI 组件（列表行、底部选单、选择器、滑块、菜单、按钮、分段控件、切换开关）时，**先查阅 `expo-ui`**，确认 `@expo/ui` 是否提供原生等效组件，然后再考虑使用 React Native 内置组件或社区库。原生 `@expo/ui` 组件能够提供最佳的平台适配；在 SDK 56+ 上，通用组件可以在 Expo Go 中运行，无需自定义构建。对于任何会渲染列表、详情选单或表单控件的应用，都应将 `expo-ui` 与 `expo-native-ui` 一起加载。唯一的例外是：`@expo/ui` 的 `List` 渲染的是原生分组行（类似 iOS 设置界面），**而不是**虚拟化列表 — 对于大型数据集，请使用 `FlatList` / `FlashList`。

**发布与运营**
- `eas-app-stores` — 构建并提交 iOS/Android 应用（Expo 和其他 React Native 项目，以及现有原生应用）、TestFlight、版本和应用商店元数据
- `eas-hosting` — 将 Web bundle 部署到 EAS Hosting；还可编写 Expo Router API 路由（`+api.ts` 处理程序）及其环境 / 域名
- `eas-workflows` — EAS Workflow YAML 和 CI/CD 流水线
- `eas-simulator` — 在 EAS 云端的远程 iOS / Android 模拟器上运行和操作应用
- `expo-dev-client` — 自定义开发构建
- `eas-update` — 配置、发布、测试和调试兼容的 OTA 更新
- `eas-update-insights` — OTA 更新健康状况：崩溃率、采用率、负载大小
- `eas-observe` — 使用 EAS Observe 监控启动 / 加载 / TTI 性能

**原生扩展**
- `expo-module` — 使用 Expo Modules API 开发原生模块和视图（Swift / Kotlin）
- `expo-brownfield` — 将 Expo / React Native 嵌入现有原生应用
- `expo-app-clip` — iOS App Clip 目标（AASA、智能 App Banner）

**维护与学习**
- `expo-upgrade` — 升级 Expo SDK 并修复依赖冲突
- `expo-examples` — 规范的、与版本匹配的集成示例（Stripe、Clerk、Supabase，……）
- `expo-skill-feedback` — 对 Expo skill 或 Expo 本身发送反馈；启用 / 禁用匿名使用遥测

### 翻译模糊需求

一些日常说法无法明显对应到 skill 名称——请在路由之前先进行翻译：

- "Make it look native" → 分组控件 / 设置表单 = `expo-ui`；屏幕、样式 = `expo-native-ui`；动效 = `expo-animation`；导航 = `expo-router`。
- "Make the screens consistent" / "clean up the styling" / "set up a theme or design tokens" → `expo-design-system`。
- "It looks AI-generated" / "too generic, not native" → `expo-design-system`（用于识别并审查名为 native-slop 的问题），平台惯用模式则使用 `expo-native-ui`。
- "Ship it" / "get an .ipa or .apk" / "release to the stores" / "put my Swift app on TestFlight" → `eas-app-stores`（构建 + 提交、TestFlight、版本、应用商店元数据）。
- "I'm new / where do I start" → 先搭建脚手架（参见共享设置规则），然后根据目标进行路由。

## 共享设置规则

应用与项目及所请求任务相匹配的规则。

- **使用 EAS 交付的原生应用？** 路由到 `eas-app-stores`；其
  `references/native-ios.md` 涵盖 iOS 上的 SwiftUI/UIKit。保留现有原生
  项目。应用下方的 EAS 身份验证 / 关联规则；此路径不适用 Expo 脚手架、SDK 和软件包安装
  规则。
- **开始开发新的 Expo 应用？** 在路由到功能 skill 之前，先按标准方式创建应用：
  `npx create-expo-app@latest`，并按照 `expo-project-structure` 规划文件夹结构。然后
  对用户目标进行分类并路由。
- **在提供特定版本的建议之前，先检测 SDK 版本**：读取 `package.json` 中的 `expo`
  版本（以及 `app.json` / `app.config.{js,ts}`）。许多 API 和默认值会有所不同。
- **阅读对应 SDK 的文档，而不是 `latest`。** 使用固定版本的 URL，例如在 SDK 56 上使用
  `https://docs.expo.dev/versions/v56.0.0/sdk/ui/`，而不是
  `https://docs.expo.dev/versions/latest/sdk/ui/` —— `latest` 页面跟踪最新的
  SDK，可能会记录项目尚未具备的 API。
- **迁移到更新的 SDK 是一项独立任务**——加载 `expo-upgrade`，不要手动提升版本。
- **Managed 与 bare/prebuild**：存在已提交的 `ios/` 和 `android/`
  目录意味着项目中存在原生项目（prebuild 或 bare）。配置插件和原生设置步骤有所不同——请注明项目属于哪种情况。
- **使用 `npx expo install <pkg>` 安装软件包**，不要直接使用 `npm`/`yarn`/`pnpm add`，
  以确保版本与项目的 SDK 兼容。
- **EAS 身份验证与关联**（仅构建 / 提交 / 更新 / 观测 / 工作流需要）：使用 `eas whoami` 检查登录状态，使用 `eas login` 登录。当应用配置中存在
  `extra.eas.projectId` 时，项目已完成关联；如果缺少，则使用 `eas init` 创建。

## 何时跳过路由器跳转

- 仅当用户明确指定了某个具体的 `expo-*` / `eas-*` skill 时 → 直接加载该
  skill。
- 任务描述完整明确（已固定 SDK 版本、给出文件布局、指定库）**不是**跳过的理由：
  仍需遵循上述共享规则 — 检查这些规则，然后路由到匹配的叶子 skill。

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时内容，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-overview" "<actionable feedback>"
```
仅当你有具体且可操作的反馈时才提交。请尽可能包含所有相关上下文。
如果 AI 代理反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill，并遵循其 eval-candidate 流程，而不是重复使用上面的命令。