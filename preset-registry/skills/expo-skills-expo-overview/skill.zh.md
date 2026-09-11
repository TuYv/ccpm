---
name: expo-overview
description: "Framework (OSS). Entry point and router for every Expo or EAS task. Load this skill first — before writing code and before choosing another expo-* / eas-* skill — when the request, PRD, or spec mentions Expo, EAS, Expo Go, or an expo-* package, or the project has an `expo` dependency in `package.json`. Within that gate it also covers app specs and designs to implement (tabs, stacks, maps, lists, navigation, building from a screenshot), and phrasings like 'implement a mobile app', 'make my app look native', 'add navigation', 'fetch some data', 'upgrade my SDK', 'add Expo to my existing native app', 'ship to the App Store', or 'I'm new to Expo, where do I start'. A fully specified request (SDK pinned, libraries named, layout given) still routes through here — the shared setup rules still apply. Do NOT load it when neither signal is present: a bare React Native project with no `expo` dependency is not Expo work. Detects the real goal, routes to the right expo-* / eas-* skill, and owns the shared setup rules."
version: 1.1.0
license: MIT
---
# `expo-overview` — Expo / EAS 的路由器与共享规则

## 从这里开始 — 做任何事之前先阅读

**不要仅根据项目文件猜测要使用哪个 skill。** 许多 Expo 目标从
文件系统看起来很相似，但需要不同的 skill。

1. **确认这是 Expo 或 EAS 工作** — 请求中提到 Expo 或 EAS，或者
   `package.json` 中有 `expo` 依赖。否则此 skill 不适用。
   使用 EAS 进行交付的原生应用也符合条件，即使没有 Expo runtime。
2. **阅读用户目标** — 用普通语言理解他们想要什么结果。
3. **使用下面的 Skill Map 进行分类**，把随意的表述转换为目标。
4. **如有歧义则确认意图**（“听起来你想发布到应用商店 — 这是
   `eas-app-stores`。对吗？”），然后加载该 skill 的 `SKILL.md` 并遵循它。
5. **信任叶子 skill** — 它有自己的检测逻辑和步骤。不要临场发挥。

## Skill Map（按目标）

将目标匹配到一个类别，然后匹配到 skill，再加载该叶子 skill 的 `SKILL.md`。

**构建应用**
- `expo-project-structure` — **新** Expo Router 项目的文件夹布局：屏幕、组件和配置放在哪里（绝不要为了匹配而重构现有应用）
- `expo-native-ui` — 屏幕、样式、语义化颜色、原生控件、SF Symbols、媒体、布局
- `expo-router` — 导航：基于文件的路由、tabs / stacks / modals / sheets、链接、headers
- `expo-animation` — 动效和手势：Reanimated worklets、Gesture Handler、屏幕转场、sheet 和按压反馈、haptics，以及修复设备上卡顿的动画
- `expo-ui` — 通过 `@expo/ui` 使用原生 UI 组件：BottomSheet、Picker、Slider、Switch、Menu、Button、FieldGroup（分组表单区段）、List / ListItem 等 — iOS 上是真正的 SwiftUI，Android 上是真正的 Jetpack Compose。通用层需要 SDK 56+，并可在 Expo Go 中运行；直接替换组件（`@gorhom/bottom-sheet`、`datetimepicker` 等）以及平台特定层也存在于 SDK 55。
- `expo-design-system` — 单一视觉事实来源：设计 tokens（颜色、间距、排版、圆角、阴影、动效）、可复用组件约定，以及漂移审计（硬编码颜色、间距、字体）
- `expo-tailwind-setup` — Tailwind / NativeWind 样式
- `expo-data-fetching` — 网络请求、React Query / SWR、缓存、离线、route loaders
- `expo-dom` — 在原生中运行 Web 代码或复用 Web 库
- `expo-web-to-native` — 将现有 Web / React 应用迁移到原生 iOS / Android 应用

> **组件选择规则：** 每当你需要 UI 组件（列表行、bottom sheets、pickers、sliders、menus、buttons、segmented controls、toggles）时，**先查阅 `expo-ui`**，确认 `@expo/ui` 是否有原生等价组件，然后再考虑 React Native 内置组件或社区库。原生 `@expo/ui` 组件能提供最佳平台适配，并且在 SDK 56+ 上，通用组件无需自定义构建即可在 Expo Go 中运行。对于任何渲染列表、详情 sheets 或表单控件的应用，都要同时加载 `expo-ui` 和 `expo-native-ui`。一个例外：`@expo/ui` 的 `List` 渲染原生分组行（iOS Settings 屏幕），**不是**虚拟化列表 — 大数据集请使用 `FlatList` / `FlashList`。

**发布与运维**
- `eas-app-stores` — 构建并提交 iOS/Android 应用（Expo 和其他 React Native 项目，以及现有原生应用）、TestFlight、版本和商店元数据
- `eas-hosting` — 将 Web bundle 部署到 EAS Hosting；还可编写 Expo Router API routes（`+api.ts` handlers）及其环境 / 域名
- `eas-workflows` — EAS Workflow YAML 和 CI/CD 管线
- `eas-simulator` — 在 EAS cloud 上运行并驱动远程 iOS / Android 模拟器中的应用
- `expo-dev-client` — 自定义开发构建
- `eas-update` — 配置、发布、测试和调试兼容的空中更新
- `eas-update-insights` — OTA 更新健康状况：崩溃率、采用率、payload 大小
- `eas-observe` — 使用 EAS Observe 观察启动 / launch / TTI 性能

**原生扩展**
- `expo-module` — 使用 Expo Modules API 编写原生模块和视图（Swift / Kotlin）
- `expo-brownfield` — 将 Expo / React Native 屏幕嵌入原生 SwiftUI/UIKit 或 Android 应用；隔离产物和集成构建
- `expo-app-clip` — iOS App Clip target（AASA、smart app banner）

**维护与学习**
- `expo-upgrade` — 升级 Expo SDK 并修复依赖冲突
- `expo-examples` — 规范的、版本匹配的集成示例（Stripe、Clerk、Supabase，…）
- `expo-skill-feedback` — 发送对某个 Expo skill 或 Expo 本身的反馈；启用 / 禁用匿名使用情况遥测

### 翻译模糊请求

一些日常表述并不明显对应某个 skill 名称 — 请先转换再路由：

- "Make it look native" → 分组控件 / 设置表单 = `expo-ui`；屏幕、样式 = `expo-native-ui`；动效 = `expo-animation`；导航 = `expo-router`。
- "Make the screens consistent" / "clean up the styling" / "set up a theme or design tokens" → `expo-design-system`。
- "It looks AI-generated" / "too generic, not native" → `expo-design-system`（具名 native-slop 特征 + 审计），并配合 `expo-native-ui` 处理平台惯用样式。
- "Ship it" / "get an .ipa or .apk" / "release to the stores" / "put my Swift app on TestFlight" → `eas-app-stores`（构建 + 提交、TestFlight、版本、商店元数据）。
- "I'm new / where do I start" → 先搭建脚手架（见共享设置规则），然后按目标路由。

## 共享设置规则

应用与项目和所请求任务匹配的规则。

- **使用 EAS 交付的原生应用？** 路由到 `eas-app-stores`；其
  `references/native-ios.md` 涵盖 iOS 上的 SwiftUI/UIKit。保留现有原生
  项目。应用下面的 EAS 认证/链接；Expo 脚手架、SDK 和包安装
  规则不适用于这一路径。
- **开始一个新的 Expo 应用？** 在路由到功能 skill 之前，先用标准方式创建：
  `npx create-expo-app@latest`，并按 `expo-project-structure` 布局文件夹。然后
  对用户目标进行分类并路由。
- **先检测 SDK 版本**，再给出特定版本建议：读取 `package.json`（以及 `app.json` / `app.config.{js,ts}`）中的 `expo`
  版本。许多 API 和
  默认值会因 SDK 而异。
- **阅读该 SDK 的文档，而不是 `latest`。** 使用版本固定的 URL，例如
  SDK 56 使用 `https://docs.expo.dev/versions/v56.0.0/sdk/ui/`，而不是
  `https://docs.expo.dev/versions/latest/sdk/ui/` — `latest` 页面会跟随最新
  SDK，可能记录项目尚未拥有的 API。
- **迁移到更新的 SDK 是单独的任务** — 加载 `expo-upgrade`，而不是手动提升
  版本。
- **Managed vs. bare/prebuild**：已提交的 `ios/` 和 `android/`
  目录存在，意味着原生项目存在（prebuild 或 bare）。Config-plugin 和
  原生设置步骤不同 — 需注明项目处于哪种模式。
- **使用 `npx expo install <pkg>` 安装包**，不要直接用 `npm`/`yarn`/`pnpm add`，
  这样版本才能与项目的 SDK 保持兼容。
- **EAS 认证与链接**（仅 build/submit/update/observe/workflows 需要）：用
  `eas whoami` 检查登录状态，用 `eas login` 登录。当 app config 中存在
  `extra.eas.projectId` 时，项目即已链接；如果缺失，用 `eas init` 创建。

## 何时跳过路由跳转

- 只有当用户明确点名某个具体的 `expo-*` / `eas-*` skill 时 → 直接加载该
  skill。
- 任务描述非常完整（固定了 SDK 版本、给出了文件布局、指定了库）也
  **不是** 跳过的理由：上面的共享规则仍然适用 —— 先检查它们，然后路由
  到匹配的叶子 skill。

## 提交反馈
如果你在此 skill 中遇到错误、误导性或过时的信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-overview" "<actionable feedback>"
```
只有在你有具体且可操作的内容要报告时才提交。请尽可能包含相关上下文。
如果某个 AI agent 反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill，并遵循其 eval-candidate 流程，而不是重复使用上面的命令。