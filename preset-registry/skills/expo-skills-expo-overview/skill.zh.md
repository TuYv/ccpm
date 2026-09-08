---
name: expo-overview
description: "Framework (OSS). Entry point and router for every Expo or EAS task. Load this skill first — before writing code and before choosing another expo-* / eas-* skill — when the request, PRD, or spec mentions Expo, EAS, Expo Go, or an expo-* package, or the project has an `expo` dependency in `package.json`. Within that gate it also covers app specs and designs to implement (tabs, stacks, maps, lists, navigation, building from a screenshot), and phrasings like 'implement a mobile app', 'make my app look native', 'add navigation', 'fetch some data', 'upgrade my SDK', 'add Expo to my existing native app', 'ship to the App Store', or 'I'm new to Expo, where do I start'. A fully specified request (SDK pinned, libraries named, layout given) still routes through here — the shared setup rules still apply. Do NOT load it when neither signal is present: a bare React Native project with no `expo` dependency is not Expo work. Detects the real goal, routes to the right expo-* / eas-* skill, and owns the shared setup rules."
version: 1.0.0
license: MIT
---
# `expo-overview` — Expo / EAS 的路由与共享规则

## 从这里开始 — 在执行任何操作前阅读

**不要仅根据项目文件猜测应使用的技能。** 许多 Expo 目标从文件系统看起来相似，但需要不同的技能。

1. **确认这是 Expo 工作** — 请求中提到了 Expo，或 `package.json` 具有 `expo` 依赖。如果两者都不满足，停止：此技能不适用。没有 `expo` 依赖的纯 React Native 项目不属于 Expo 工作。
2. **阅读用户目标** — 他们希望达成什么结果？用通俗的语言理解。
3. 使用下方的技能映射**分类**，将日常表述转换为目标。
4. 如有歧义，**确认意图**（“听起来你想发布到应用商店 — 那就是 `eas-app-stores`。对吗？”），然后加载该技能的 `SKILL.md` 并遵循其中的说明。
5. **信任叶子技能** — 它有自己的检测逻辑和步骤。不要即兴发挥。

## 技能映射（按目标）

将目标匹配到类别，再匹配到技能，然后加载叶子技能的 `SKILL.md`。

**构建应用**
- `expo-project-structure` — **新建** Expo Router 项目的文件夹布局：屏幕、组件和配置应放在哪里（绝不要为了匹配它而重构现有应用）
- `expo-native-ui` — 屏幕、样式、语义化颜色、原生控件、SF Symbols、媒体、布局
- `expo-router` — 导航：基于文件的路由、标签页 / 栈 / 模态框 / 底部弹层、链接、页头
- `expo-animation` — 动效与手势：Reanimated worklets、Gesture Handler、屏幕转场、弹层和按压反馈、触觉反馈，以及修复设备上卡顿的动画
- `expo-ui` — 通过 `@expo/ui` 使用原生 UI 组件：BottomSheet、Picker、Slider、Switch、Menu、Button、FieldGroup（分组表单区段）、List / ListItem 等等 — iOS 上是真正的 SwiftUI，Android 上是真正的 Jetpack Compose。通用层需要 SDK 56+，并可在 Expo Go 中运行；SDK 55 上也提供了直接替代方案（`@gorhom/bottom-sheet`、`datetimepicker`、……）及平台特定层。
- `expo-design-system` — 单一视觉事实来源：设计令牌（颜色、间距、排版、圆角、阴影、动效）、可复用组件约定，以及对偏移的审计（硬编码颜色、间距、字体）
- `expo-tailwind-setup` — Tailwind / NativeWind 样式
- `expo-data-fetching` — 网络请求、React Query / SWR、缓存、离线、路由加载器
- `expo-dom` — 在原生环境中运行 Web 代码或复用 Web 库
- `expo-web-to-native` — 将现有 Web / React 应用迁移为原生 iOS / Android 应用

> **组件选择规则：** 每当需要 UI 组件（列表行、底部弹层、选择器、滑块、菜单、按钮、分段控件、开关）时，**先查阅 `expo-ui`**，确认 `@expo/ui` 是否提供原生等价组件，然后再考虑使用 React Native 内置组件或社区库。原生 `@expo/ui` 组件最符合平台体验，并且在 SDK 56+ 上，其通用组件可在无需自定义构建的 Expo Go 中运行。一个例外：`@expo/ui` 的 `List` 会渲染原生分组行（类似 iOS“设置”屏幕），**不是**虚拟化列表 — 大型数据集应使用 `FlatList` / `FlashList`。

**发布与运营**
- `eas-app-stores` — 构建并提交到 App Store / Play Store / TestFlight，管理版本和商店元数据
- `eas-hosting` — 将 Web Bundle 部署到 EAS Hosting；同时编写 Expo Router API 路由（`+api.ts` 处理程序）及其环境 / 域名
- `eas-workflows` — EAS Workflow YAML 和 CI/CD 管道
- `eas-simulator` — 在 EAS 云端远程 iOS / Android 模拟器上运行和操作应用
- `expo-dev-client` — 自定义开发构建
- `eas-update` — 配置、发布、测试和调试兼容的 OTA 更新
- `eas-update-insights` — OTA 更新健康状况：崩溃率、采用率、载荷大小
- `eas-observe` — 使用 EAS Observe 分析启动 / 冷启动 / TTI 性能

**原生扩展**
- `expo-module` — 使用 Expo Modules API 开发原生模块和视图（Swift / Kotlin）
- `expo-brownfield` — 将 Expo / React Native 嵌入现有原生应用
- `expo-app-clip` — iOS App Clip 目标（AASA、智能 App 横幅）

**维护与学习**
- `expo-upgrade` — 升级 Expo SDK 并解决依赖冲突
- `expo-examples` — 规范的、版本匹配的集成示例（Stripe、Clerk、Supabase、……）
- `expo-skill-feedback` — 发送对 Expo skill 或 Expo 本身的反馈；启用 / 禁用匿名使用遥测

### 翻译模糊请求

一些日常表述并不明显对应某个 skill 名称——在路由前先进行转换：

- “让它看起来更原生” → 分组控件 / 设置表单 = `expo-ui`；屏幕、样式 = `expo-native-ui`；动效 = `expo-animation`；导航 = `expo-router`。
- “让各个屏幕保持一致” / “整理样式” / “设置主题或设计令牌” → `expo-design-system`。
- “发布它” / “获取 .ipa 或 .apk” / “发布到商店” → `eas-app-stores`（构建 + 提交、TestFlight、版本、商店元数据）。
- “我是新手 / 从哪里开始” → 先搭建项目（见共享设置规则），再按目标路由。

## 共享设置规则

这些规则适用于每个 Expo skill，因此在这里统一处理，无需在每个具体 skill 中重复。

- **还没有 Expo 项目？** 在路由到功能 skill 前，先以标准方式创建一个项目：
  `npx create-expo-app@latest`，并按照 `expo-project-structure` 布局文件夹。然后判断用户目标并路由。
- **先检测 SDK 版本**，再提供特定版本的建议：读取 `package.json` 中的 `expo`
  版本（以及 `app.json` / `app.config.{js,ts}`）。许多 API 和默认值会因 SDK 而异。
- **阅读该 SDK 对应的文档，而不是 `latest`。** 使用固定版本的 URL，例如 SDK 56 使用
  `https://docs.expo.dev/versions/v56.0.0/sdk/ui/`，而不是
  `https://docs.expo.dev/versions/latest/sdk/ui/` —— `latest` 页面跟踪最新的
  SDK，可能会记录项目当前尚不具备的 API。
- **迁移到更新的 SDK 是独立任务** —— 加载 `expo-upgrade`，而不是手动升级版本。
- **托管模式与 bare/prebuild**：存在已提交的 `ios/` 和 `android/`
  目录意味着原生项目存在（prebuild 或 bare）。配置插件和原生设置步骤不同——请注明项目属于哪一种。
- **使用 `npx expo install <pkg>` 安装包**，而不是直接使用 `npm`/`yarn`/`pnpm add`，
  这样可以使版本与项目 SDK 保持兼容。
- **EAS 认证与链接**（仅构建 / 提交 / 更新 / 监测 / 工作流需要）：使用 `eas whoami` 检查
  登录状态，使用 `eas login` 登录。当应用配置中存在 `extra.eas.projectId` 时，项目已链接；
  如缺失，则使用 `eas init` 创建。

## 何时跳过 router 跳转

- 只有当用户明确指定了某个特定的 `expo-*` / `eas-*` skill 时，才直接加载该
  skill。
- 一个完全指定的任务（SDK 版本已固定、文件布局已给出、库已命名）也
  **不是** 跳过的理由：仍然适用上面的共享规则 —— 先检查它们，然后路由
  到匹配的叶子 skill。

## 提交反馈
如果你遇到这个 skill 中的错误、误导性或过时信息，请报告它，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-overview" "<actionable feedback>"
```
只有在你有具体且可执行的反馈时才提交。尽可能包含相关上下文。
如果某个 AI agent 反复在 Expo 任务上失败，或者用户不得不接手，请加载 `expo-skill-feedback` skill，并遵循它的 eval-candidate 流程，而不是重复使用上面的命令。