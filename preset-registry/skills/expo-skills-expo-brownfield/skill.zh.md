---
name: expo-brownfield
description: Framework (OSS). Integrate Expo and React Native into an existing native iOS or Android app. Use when the user mentions brownfield, embedding React Native in a native app, AAR/XCFramework, or adding Expo to an existing Kotlin/Swift project. Covers both the isolated approach and the integrated approach.
---
# Expo 棕地项目

**棕地**应用是指以渐进方式采用 React Native 的现有原生 iOS 或 Android 应用，与从一开始就使用 React Native 的**绿地**应用相对。

Expo 支持通过两种不同的方式将 React Native 添加到棕地项目中：

| 方式           | 交付给原生应用的内容                                                  | 适用场景                                                                         |
| -------------- | ------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **隔离式**     | 预构建的 AAR / XCFramework                                          | 原生团队不需要 Node 或 RN 工具链；RN 代码可以位于单独的仓库中                    |
| **集成式**     | 将 React Native 源代码添加到现有的 Gradle / CocoaPods 构建中         | 由一个团队负责所有内容；熟悉 RN 工具链；希望使用单一构建流程                     |

有关完整的决策矩阵，请参阅 [./references/comparison.md](./references/comparison.md)。

## 选择一种方式

使用以下快速判断规则——对于任何难以明确判断的情况，请进一步参阅 `comparison.md`。

- 如果 iOS/Android 团队必须将 RN 作为常规库依赖项（AAR 或 XCFramework）使用，而无需安装 Node、Yarn 或 React Native 构建工具链，请**选择隔离式**。
- 如果 RN 代码和原生代码位于不同的仓库中，或者各自按照独立的发布周期发布，请**选择隔离式**。
- 如果由单一团队同时负责原生代码和 RN 代码，并且愿意将 React Native + Expo 添加到原生项目的 Gradle 和 CocoaPods 配置中，请**选择集成式**。
- 如果希望热重载和 JS 源码映射能够在现有原生构建流程中无缝工作，请**选择集成式**。

## 参考资料

- ./references/brownfield-isolated.md -- 将 RN 构建为 AAR/XCFramework，并由原生应用使用（BrownfieldActivity、ReactNativeViewController、ReactNativeView）
- ./references/brownfield-integrated.md -- 将 RN 和 Expo 直接添加到现有的 Gradle 和 CocoaPods 构建中（ReactActivity、RCTRootView、Podfile）
- ./references/comparison.md -- 用于选择集成方式的决策标准、权衡因素和场景映射
- ./references/troubleshooting.md -- 两种方式共有的 Metro 连接、构建、签名和模块解析问题

更多信息请参阅 https://docs.expo.dev/brownfield/overview/

## 共同的前置条件

两种方式都要求在_构建_ React Native 部分的环境中具备：

- **Node.js (LTS)** — 用于运行 Expo CLI 和 JavaScript 代码。
- **Yarn** — 用于管理 JavaScript 依赖项。

集成式方式还要求在 iOS 上安装 **CocoaPods**（`sudo gem install cocoapods`）。隔离式方式**不**要求使用方原生应用安装 CocoaPods 或任何 RN 工具链。

## 版本说明

**Expo SDK 55 是棕地集成支持的最低版本。** 更早的 SDK 缺少 `expo-brownfield`、必需的 `ExpoReactHostFactory` / `ExpoReactNativeFactory` 入口点，以及当前的自动链接接口。创建 Expo 项目时，务必显式固定 SDK 版本：

```sh
npx create-expo-app@latest my-project --template default@sdk-55
```

在 RN 项目和所有嵌入式依赖项中锁定使用同一 Expo SDK 版本。

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-brownfield" "<actionable feedback>"
```
仅当你有具体且可执行的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI agent 反复失败，或者用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill 并遵循其 eval-candidate 流程，而不要重复使用上述命令。