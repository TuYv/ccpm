---
name: expo-overview
description: "Framework (OSS). Entry point and router for every Expo or EAS task. Load this skill first — before writing code and before choosing another expo-* / eas-* skill — when the request, PRD, or spec mentions Expo, EAS, Expo Go, or an expo-* package, or the project has an `expo` dependency in `package.json`. Within that gate it also covers app specs and designs to implement (tabs, stacks, maps, lists, navigation, building from a screenshot), and phrasings like 'implement a mobile app', 'make my app look native', 'add navigation', 'fetch some data', 'upgrade my SDK', 'add Expo to my existing native app', 'ship to the App Store', or 'I'm new to Expo, where do I start'. A fully specified request (SDK pinned, libraries named, layout given) still routes through here — the shared setup rules still apply. Do NOT load it when neither signal is present: a bare React Native project with no `expo` dependency is not Expo work. Detects the real goal, routes to the right expo-* / eas-* skill, and owns the shared setup rules."
version: 1.0.0
license: MIT
---
# `expo-overview` — Expo / EAS 的路由与共享规则

## 从这里开始 — 执行任何操作前请先阅读

**不要仅根据项目文件猜测应使用哪个技能。** 许多 Expo 目标从文件系统来看很相似，
但需要使用不同的技能。

1. **确认这是 Expo 工作** — 请求中提到了 Expo，或者 `package.json` 中存在
   `expo` 依赖。如果两者都不满足，请停止：此技能不适用。没有 `expo` 依赖的纯 React
   Native 项目不属于 Expo 工作。
2. **阅读用户的目标** — 用直白的话来说，他们想要什么结果？
3. **使用下方的技能映射进行分类**，将口语化表述转换为具体目标。
4. 如果意图不明确，**确认意图**（“听起来你想把应用发布到应用商店 — 对应的是
   `eas-app-stores`。对吗？”），然后加载该技能的 `SKILL.md` 并遵循其中的说明。
5. **信任叶级技能** — 它有自己的检测逻辑和步骤。不要自行发挥。

## 技能映射（按目标分类）

先将目标与类别匹配，再与技能匹配，然后加载该叶级技能的 `SKILL.md`。

**构建应用**
- `expo-project-structure` — **新建** Expo Router 项目的文件夹布局：屏幕、组件和配置应放在哪里（切勿为了与其保持一致而重构现有应用）
- `expo-native-ui` — 屏幕、样式、语义化颜色、原生控件、SF Symbols、媒体、动画、布局
- `expo-router` — 导航：基于文件的路由、标签页 / 堆栈 / 模态框 / 底部弹层、链接、标题栏
- `expo-animation` — 动效与手势：Reanimated worklets、Gesture Handler、屏幕转场、底部弹层和按压反馈、触觉反馈，以及修复真机上卡顿的动画
- `expo-ui` — 通过 `@expo/ui` 使用原生 UI 组件：BottomSheet、Picker、Slider、Switch、Menu、Button、FieldGroup（分组表单区段）、List / ListItem 等 — 在 iOS 上使用真正的 SwiftUI，在 Android 上使用 Jetpack Compose。通用层需要 SDK 56+，并可在 Expo Go 中运行；即插即用的替代方案（`@gorhom/bottom-sheet`、`datetimepicker`、……）和平台专用层也可用于 SDK 55。
- `expo-design-system` — 单一视觉事实来源：设计令牌（颜色、间距、排版、圆角、阴影、动效）、可复用组件规范，以及针对偏差的审查（硬编码颜色、间距、字体）
- `expo-tailwind-setup` — Tailwind / NativeWind 样式
- `expo-data-fetching` — 网络请求、React Query / SWR、缓存、离线、路由加载器
- `expo-dom` — 在原生应用中运行 Web 代码或复用 Web 库
- `expo-web-to-native` — 将现有 Web / React 应用迁移为原生 iOS / Android 应用

> **组件选择规则：**每当需要 UI 组件（列表行、底部弹层、选择器、滑块、菜单、按钮、分段控件、开关）时，**请先查阅 `expo-ui`**，确认 `@expo/ui` 是否提供原生等效组件，然后再考虑使用 React Native 内置组件或社区库。原生 `@expo/ui` 组件能提供最佳的平台适配效果，而且在 SDK 56+ 上，通用组件无需自定义构建即可在 Expo Go 中运行。对于任何会渲染列表、详情弹层或表单控件的应用，请同时加载 `expo-ui` 和 `expo-native-ui`。有一个例外：`@expo/ui` 的 `List` 会渲染原生分组行（类似 iOS 的“设置”屏幕），**而不是**虚拟化列表 — 对于大型数据集，请使用 `FlatList` / `FlashList`。

**发布与运维**
- `eas-app-stores` — 构建并提交到 App Store / Play Store / TestFlight，以及管理版本和商店元数据
- `eas-hosting` — 将 Web 包部署到 EAS Hosting；也可编写 Expo Router API 路由（`+api.ts` 处理程序）及其环境 / 域名
- `eas-workflows` — EAS Workflow YAML 和 CI/CD 流水线
- `eas-simulator` — 在 EAS 云端的远程 iOS / Android 模拟器上运行和操控应用
- `expo-dev-client` — 自定义开发构建
- `eas-update-insights` — OTA 更新运行状况：崩溃率、采用率、负载大小
- `eas-observe` — 使用 EAS Observe 监测启动 / 拉起 / TTI 性能

**原生扩展**
- `expo-module` — 使用 Expo Modules API 开发原生模块和视图（Swift / Kotlin）
- `expo-brownfield` — 将 Expo / React Native 嵌入现有原生应用
- `expo-app-clip` — iOS App Clip 目标（AASA、智能应用横幅）

**维护与学习**
- `expo-upgrade` — 升级 Expo SDK 并修复依赖冲突
- `expo-examples` — 规范且版本匹配的集成示例（Stripe、Clerk、Supabase……）
- `expo-skill-feedback` — 提交关于 Expo 技能或 Expo 本身的反馈；启用 / 禁用匿名使用情况遥测

### 转换模糊的请求

有些日常表达无法明显对应到某个技能名称——请先转换再路由：

- “让它看起来像原生应用” → 分组控件 / 设置表单 = `expo-ui`；屏幕、样式、动画 = `expo-native-ui`；导航 = `expo-router`。
- “让各个屏幕保持一致” / “整理样式” / “设置主题或设计令牌” → `expo-design-system`。
- “发布它” / “获取 .ipa 或 .apk” / “发布到应用商店” → `eas-app-stores`（构建 + 提交、TestFlight、版本、商店元数据）。
- “我是新手 / 应该从哪里开始” → 先搭建项目（参见共享设置规则），然后按目标路由。

## 共享设置规则

这些规则适用于所有 Expo 技能，因此在这里统一处理，而不是在每个叶级技能中重复。

- **还没有 Expo 项目？** 在路由到功能技能之前，先以标准方式创建项目：
  `npx create-expo-app@latest`，并按照 `expo-project-structure` 组织文件夹。然后
  对用户的目标进行分类并路由。
- **检测 SDK 版本**，然后再提供特定于版本的建议：读取 `package.json` 中的 `expo`
  版本（以及 `app.json` / `app.config.{js,ts}`）。许多 API 和
  默认值会因 SDK 而异。
- **阅读对应 SDK 的文档，而不是 `latest`。** 使用固定版本的 URL，例如
  SDK 56 应使用 `https://docs.expo.dev/versions/v56.0.0/sdk/ui/`，而不是
  `https://docs.expo.dev/versions/latest/sdk/ui/`——`latest` 页面跟踪最新的
  SDK，其中可能记录了项目尚未具备的 API。
- **迁移到较新的 SDK 是一项独立任务**——应加载 `expo-upgrade`，而不是手动提升
  版本。
- **托管式与裸工作流/预构建**：存在已提交的 `ios/` 和 `android/`
  目录意味着原生项目已存在（预构建或裸工作流）。配置插件和
  原生设置步骤有所不同——请明确项目采用的是哪一种。
- **使用 `npx expo install <pkg>` 安装软件包**，而不是直接使用 `npm`/`yarn`/`pnpm add`，
  以确保版本与项目的 SDK 保持兼容。
- **EAS 身份验证与关联**（仅构建/提交/更新/监测/工作流需要）：使用
  `eas whoami` 检查登录状态，使用 `eas login` 登录。当应用配置中存在
  `extra.eas.projectId` 时，项目即已关联；如果缺失，请使用 `eas init` 创建。

## 何时跳过路由步骤

- 仅当用户明确指定了某个特定的 `expo-*` / `eas-*` skill 时 → 直接加载该
  skill。
- 任务描述完整（已指定 SDK 版本、给出文件布局、指明所用库）**不**
  是跳过此步骤的理由：上述共享规则仍然适用——先检查这些规则，再路由
  到匹配的叶级 skill。

## 提交反馈
如果你在此 skill 中遇到错误、误导性或过时的信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-overview" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供更多相关上下文。
如果 AI 代理反复失败，或者用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill 并遵循其 eval-candidate 流程，而不要重复使用上述命令。