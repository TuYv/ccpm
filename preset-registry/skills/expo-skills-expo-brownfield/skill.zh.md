---
name: expo-brownfield
description: Framework (OSS). Integrate Expo and React Native into an existing native iOS or Android app. Use for brownfield, embedding a React Native screen in SwiftUI/UIKit or Kotlin, or AAR/XCFramework packaging. Covers isolated and integrated approaches. For building or distributing a purely native app with EAS, use eas-app-stores.
---
# Expo Brownfield

**Brownfield** 应用是指在现有原生 iOS 或 Android 应用中逐步采用 React Native 的应用，与从第一天起就使用 React Native 的 **greenfield** 应用相对。

## 先检查宿主应用

确定现有的应用入口点、导航所有者、原生构建系统、部署目标，以及当前已链接的任何 React Native 运行时。从 lockfile 中记录已安装的 Expo、React Native 和 brownfield 软件包版本。仅向 Swift 应用添加 EAS Build 或 Submit 并不需要 React Native；应将此类任务交由 `eas-app-stores` 处理。

嵌入功能时，保留宿主应用的 SwiftUI `App` / UIKit window 以及原生界面。**不要在手动维护的原生宿主应用中运行 prebuild**，包括在故障排查期间。独立的 Expo producer 可以使用 CNG；将其生成的 `ios/` 和 `android/` 与使用它的应用分开保存。

Expo 支持两种向 brownfield 项目添加 React Native 的方式：

| 方式       | 原生应用中交付的内容                                      | 选择时机                                                                   |
| ---------- | --------------------------------------------------------- | -------------------------------------------------------------------------- |
| **隔离式** | 预构建的 AAR / XCFramework                              | 原生团队不需要 Node 或 RN 工具链；RN 代码可以位于单独的仓库中              |
| **集成式** | 添加到现有 Gradle / CocoaPods 构建中的 React Native 源码 | 一个团队负责所有内容；熟悉 RN 工具链；希望使用单一构建流程                 |

完整的决策矩阵请参阅 [./references/comparison.md](./references/comparison.md)。

## 选择一种方式

使用以下快速规则；遇到任何不明确的情况时，继续查看 `comparison.md`。

- **选择隔离式**，如果 iOS/Android 团队必须将 RN 作为常规库依赖（AAR 或 XCFramework）使用，且不安装 Node、Yarn 或 React Native 构建工具链。
- **选择隔离式**，如果 RN 代码和原生代码位于不同的仓库中，或按照相互独立的节奏发布。
- **选择集成式**，如果同一个团队负责原生代码和 RN 代码，并且愿意将 React Native + Expo 添加到原生项目的 Gradle 和 CocoaPods 配置中。
- 两种方式都支持 Debug 中的 Metro 和 Fast Refresh。选择集成式应基于构建所有权由同一团队共享，而不是因为隔离式缺少实时 JS 迭代能力。

## 参考资料

- ./references/brownfield-isolated.md -- 将 RN 构建为 AAR/XCFramework，并在原生应用中使用（BrownfieldActivity、ReactNativeViewController、ReactNativeView）
- ./references/brownfield-integrated.md -- 将 RN 和 Expo 直接添加到现有的 Gradle 和 CocoaPods 构建中，同时保留原生应用外壳
- ./references/feature-integration.md -- 传递输入、返回结果、关闭、清理监听器以及转发生命周期事件；包含 SwiftUI 宿主示例
- ./references/comparison.md -- 用于选择方式的决策标准、权衡因素和场景映射
- ./references/troubleshooting.md -- 两种方式常见的 Metro 连接、构建、签名和模块解析问题

更多信息请参阅 https://docs.expo.dev/brownfield/overview/

## 共享前置条件

两种方式都要求在_构建_ React Native 端的环境中具备：

- **Node.js (LTS)** — 用于运行 Expo CLI 和 JavaScript 代码。
- 项目的包管理器和锁文件 — npm、Yarn、pnpm 或 Bun。不要仅为遵循示例而切换包管理器。

iOS 构建环境需要 Xcode 和 CocoaPods（存在项目的 Gemfile/Bundler 配置时，请使用该配置）。隔离的使用方应用只需要 Xcode 即可使用这些构建产物，不需要 CocoaPods 或 RN 工具链。

## 选择兼容的版本

对于现有的 Expo/RN 项目，保留其选定的 SDK，并使用 `npx expo install` 对齐依赖项。不要仅为遵循此技能而升级项目。对于新的生产方项目，请使用与宿主操作系统支持范围、依赖项和构建工具链兼容的**当前稳定 SDK**；选定之前请确认该版本已稳定发布。

在进行原生设置之前，请阅读 [./references/version-compatibility.md](./references/version-compatibility.md)，了解不同 SDK 版本对应的原生模板、工具链/操作系统要求和构建默认值。纯原生使用方没有需要固定的 Expo SDK 版本，但必须满足构建产物的要求。

## 在宿主中验证功能

打开带有输入内容的 RN 屏幕，将结果返回给原生端，关闭该屏幕，然后使用新的输入内容重新打开。检查监听器清理情况以及宿主原有的导航功能。然后使用 Release 构建宿主，并配合 Release 构建产物，同时停止 Metro。仅在 Expo Go 或生产方的示例应用中渲染，不能验证集成是否成功。完整的验收场景请参阅 [./references/feature-integration.md](./references/feature-integration.md)。

## 提交反馈
如果遇到此技能中的错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-brownfield" "<actionable feedback>"
```
仅在有具体且可执行的反馈内容时提交。请尽可能包含相关上下文。
如果 AI agent 反复失败，或者用户不得不接管 Expo 任务，请加载 expo-skill-feedback 技能，并遵循其 eval-candidate 流程，而不要重复使用上面的命令。