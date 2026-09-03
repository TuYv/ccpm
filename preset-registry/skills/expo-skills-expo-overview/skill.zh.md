---
name: expo-overview
description: "Framework (OSS). Entry point and router for every Expo or EAS task. Load this skill first — before writing code and before choosing another expo-* / eas-* skill — when the request, PRD, or spec mentions Expo, EAS, Expo Go, or an expo-* package, or the project has an `expo` dependency in `package.json`. Within that gate it also covers app specs and designs to implement (tabs, stacks, maps, lists, navigation, building from a screenshot), and phrasings like 'implement a mobile app', 'make my app look native', 'add navigation', 'fetch some data', 'upgrade my SDK', 'add Expo to my existing native app', 'ship to the App Store', or 'I'm new to Expo, where do I start'. A fully specified request (SDK pinned, libraries named, layout given) still routes through here — the shared setup rules still apply. Do NOT load it when neither signal is present: a bare React Native project with no `expo` dependency is not Expo work. Detects the real goal, routes to the right expo-* / eas-* skill, and owns the shared setup rules."
version: 1.0.0
license: MIT
---
# `expo-overview` — Expo / EAS 路由器与共享规则

## 从这里开始 — 执行任何操作前请先阅读

**不要仅根据项目文件猜测所需技能。** 许多 Expo 目标从文件系统来看很相似，但实际需要不同的技能。

1. **确认这是 Expo 工作** — 用户请求中提到了 Expo，或 `package.json` 中存在
   `expo` 依赖。如果两者都不满足，请停止：此技能不适用。没有 `expo` 依赖的纯 React
   Native 项目不属于 Expo 工作。
2. **阅读用户目标** — 用通俗的语言理解他们想要什么结果。
3. **使用下面的技能映射进行分类**，将口语化的描述转换为目标。
4. **如果存在歧义，请确认意图**（“听起来你是想发布到应用商店 — 也就是
   `eas-app-stores`。对吗？”），然后加载该技能的 `SKILL.md` 并遵循其中的步骤。
5. **信任叶子技能** — 它有自己的检测逻辑和步骤。不要自行发挥。

## 技能映射（按目标）

将用户目标匹配到类别，然后匹配到技能，最后加载对应叶子技能的 `SKILL.md`。

**构建应用**
- `expo-project-structure` — 新建 Expo Router 项目的文件夹布局：屏幕、组件和配置文件应放置的位置（绝不要重构现有应用以匹配此布局）
- `expo-native-ui` — 屏幕、样式、语义化颜色、原生控件、SF Symbols、媒体、动画和布局
- `expo-router` — 导航：基于文件的路由、标签页 / 堆栈 / 模态框 / bottom sheets、链接和标题栏
- `expo-animation` — 动效和手势：Reanimated worklet、Gesture Handler、屏幕转场、sheet 和按压反馈、触觉反馈，以及修复设备上的动画卡顿
- `expo-ui` — 通过 `@expo/ui` 使用原生 UI 组件：BottomSheet、Picker、Slider、Switch、Menu、Button、FieldGroup（分组表单区段）、List / ListItem 等 — iOS 上使用真正的 SwiftUI，Android 上使用 Jetpack Compose。通用层需要 SDK 56+，并可在 Expo Go 中运行；替代组件（`@gorhom/bottom-sheet`、`datetimepicker` 等）和平台专属层在 SDK 55 上也可用。
- `expo-design-system` — 统一的视觉事实来源：设计令牌（颜色、间距、排版、圆角、阴影、动效）、可复用组件约定，以及针对偏差的审计（硬编码颜色、间距和字体）
- `expo-tailwind-setup` — Tailwind / NativeWind 样式
- `expo-data-fetching` — 网络请求、React Query / SWR、缓存、离线和路由加载器
- `expo-dom` — 在原生环境中运行 Web 代码或复用 Web 库
- `expo-web-to-native` — 将现有 Web / React 应用迁移为原生 iOS / Android 应用

> **组件选择规则：** 每当需要 UI 组件（列表行、bottom sheets、选择器、滑块、菜单、按钮、分段控件、切换开关）时，**优先查阅 `expo-ui`**，确认 `@expo/ui` 是否提供原生等效组件，然后再考虑使用 React Native 内置组件或第三方库。原生 `@expo/ui` 组件能够最好地适配平台；在 SDK 56+ 上，通用组件无需自定义构建即可在 Expo Go 中运行。对于任何渲染列表、详情 sheet 或表单控件的应用，请将 `expo-ui` 与 `expo-native-ui` 一起加载。一个例外是：`@expo/ui` 的 `List` 用于渲染原生分组行（类似 iOS 设置页面），**而不是**虚拟化列表 — 对于大型数据集，请使用 `FlatList` / `FlashList`。

**发布与运营**
- `eas-app-stores` — 构建并提交到 App Store / Play Store / TestFlight，管理版本和商店元数据
- `eas-hosting` — 将 Web bundle 部署到 EAS Hosting；同时编写 Expo Router API 路由（`+api.ts` handlers）及其环境 / 域名
- `eas-workflows` — EAS Workflow YAML 和 CI/CD 管道
- `eas-simulator` — 在 EAS cloud 上运行并驱动远程 iOS / Android simulator 中的应用
- `expo-dev-client` — 自定义开发构建
- `eas-update` — 配置、发布、测试和调试兼容的空中更新
- `eas-update-insights` — OTA 更新健康状况：崩溃率、采用率、payload 大小
- `eas-observe` — 使用 EAS Observe 监测启动 / launch / TTI 性能

**原生扩展**
- `expo-module` — 使用 Expo Modules API 编写原生模块和视图（Swift / Kotlin）
- `expo-brownfield` — 将 Expo / React Native 嵌入现有原生应用
- `expo-app-clip` — iOS App Clip target（AASA、smart app banner）

**维护与学习**
- `expo-upgrade` — 升级 Expo SDK 并修复依赖冲突
- `expo-examples` — 与版本匹配的规范集成示例（Stripe、Clerk、Supabase、……）
- `expo-skill-feedback` — 发送关于 Expo skill 或 Expo 本身的反馈；启用 / 禁用匿名使用遥测

### 翻译模糊请求

有些日常说法无法明显映射到 skill 名称，需要先进行翻译再路由：

- "Make it look native" → 分组控件 / 设置表单 = `expo-ui`；屏幕、样式、动画 = `expo-native-ui`；导航 = `expo-router`。
- "Make the screens consistent" / "clean up the styling" / "set up a theme or design tokens" → `expo-design-system`。
- "Ship it" / "get an .ipa or .apk" / "release to the stores" → `eas-app-stores`（构建 + 提交、TestFlight、版本、商店元数据）。
- "I'm new / where do I start" → 先搭建脚手架（参见共享设置规则），然后根据目标进行路由。

## 共享设置规则

这些规则适用于所有 Expo skill，因此统一在此处处理，而不是在每个叶子 skill 中重复
这些内容。

- **还没有 Expo 项目？** 在路由到功能 skill 之前，先按标准方式创建一个：
  `npx create-expo-app@latest`，并按照 `expo-project-structure` 规划文件夹。然后
  对用户目标进行分类并路由。
- **在提供特定版本的建议之前，先检测 SDK 版本：** 读取 `package.json` 中的 `expo`
  版本（以及 `app.json` / `app.config.{js,ts}`）。不同 SDK 的许多 API 和默认值有所差异。
- **阅读对应 SDK 的文档，而不是 `latest`。** 使用固定版本的 URL，例如：
  在 SDK 56 上使用 `https://docs.expo.dev/versions/v56.0.0/sdk/ui/`，而不是
  `https://docs.expo.dev/versions/latest/sdk/ui/` —— `latest` 页面跟踪最新 SDK，可能会记录项目尚未具备的 API。
- **迁移到更新的 SDK 是独立任务** —— 加载 `expo-upgrade`，不要手动修改版本。
- **Managed 与 bare/prebuild：** 存在已提交的 `ios/` 和 `android/`
  目录表示原生项目已存在（prebuild 或 bare）。配置插件和原生设置步骤有所不同 —— 请注明项目属于哪种情况。
- **使用 `npx expo install <pkg>` 安装软件包**，不要直接使用 `npm`/`yarn`/`pnpm add`，
  以确保版本与项目的 SDK 保持兼容。
- **EAS 身份验证与关联**（仅构建 / 提交 / 更新 / observe / workflows 需要）：使用 `eas whoami` 检查登录状态，使用 `eas login` 登录。当 app config 中存在 `extra.eas.projectId` 时，项目已完成关联；如果缺失，请使用 `eas init` 创建。

## 何时跳过路由层

- 仅当用户明确指定了某个特定的 `expo-*` / `eas-*` skill 时，才直接加载该
  skill。
- 任务描述完整（已固定 SDK 版本、给出文件布局、指定库）**不是**跳过的理由：
  仍应遵循上述共享规则，检查这些规则，然后路由到匹配的叶技能。

## 提交反馈
如果你遇到此 skill 中的错误、误导性信息或过时内容，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-overview" "<actionable feedback>"
```
仅在有具体且可执行的反馈时提交。请尽可能包含相关上下文。
如果 AI agent 反复执行 Expo 任务失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill，并遵循其 eval-candidate 流程，而不是重复使用上面的命令。