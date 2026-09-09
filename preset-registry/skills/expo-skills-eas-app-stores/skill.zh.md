---
name: eas-app-stores
description: EAS service (paid). Build and submit iOS and Android apps with EAS to TestFlight, the App Store, or Google Play. Supports Expo and other React Native projects, plus existing native apps. Use for eas.json setup, release pipelines, signing, app versions and build numbers, store submissions, and listing metadata. For Expo websites and API routes, use eas-hosting; for adding React Native screens to a native app, use expo-brownfield.
version: 1.1.0
license: MIT
---
# 应用商店部署

> **EAS 服务——需付费。** 云端构建会使用 EAS 计划资源，且 EAS 服务受免费层级和付费计划限制。Apple Developer 和 Google Play 会员资格需要分别购买。请访问 https://expo.dev/pricing 查看所请求服务的价格。

此技能涵盖使用 EAS 构建和发布 iOS 与 Android 应用：包括 Expo 和其他 React Native 项目，以及现有的原生应用。EAS 是一项交付服务；原生应用可以使用它，而无需在其运行时中添加 Expo 或 React Native。目前，原生设置指南涵盖 iOS 上的 SwiftUI/UIKit。

## 选择项目路径

- **不包含 React Native 运行时的 SwiftUI/UIKit 应用：** 在更改其构建配置前，先阅读 [references/native-ios.md](references/native-ios.md)。将 Xcode 项目和 Swift 代码作为应用的唯一事实来源。下面的 Expo/React Native 快速入门和开发客户端示例不适用于此路径。
- **不包含 React Native 运行时的原生 Android 应用：** 保留其现有的原生构建设置。提交应用请参阅 [references/play-store.md](references/play-store.md)；Swift/iOS 设置说明不适用。目前尚未提供专门的原生 Android 设置指南。
- **Expo/React Native 应用：** 使用下面的快速入门，然后参阅相关应用商店参考文档。
- **向现有原生应用添加 React Native 屏幕：** 使用 `expo-brownfield` 完成该集成；然后返回此处进行分发。

在初始原生 iOS 设置期间、修改版本号、bundle ID 或图标后，或诊断被拒绝的上传时，使用 [references/native-ios.md](references/native-ios.md) 中的归档和图标检查。常规发布遵循 EAS 构建/提交流程，以及 [references/testflight.md](references/testflight.md) 中的处理状态和可用性检查。EAS 构建成功或提交进入队列，并不代表 Apple 已接受、测试人员可以访问，或应用已在 App Store 发布。

## 参考资料

根据需要查阅以下资源：

- ./references/workflows.md -- 用于自动发布到应用商店和生成 PR 预览的 CI/CD 工作流
- ./references/testflight.md -- 将 iOS 构建提交到 TestFlight 进行 Beta 测试
- ./references/app-store-metadata.md -- 管理 App Store 元数据并优化 ASO
- ./references/play-store.md -- 将 Android 构建提交到 Google Play Store
- ./references/ios-app-store.md -- iOS App Store 提交和审核流程
- ./references/native-ios.md -- 不使用 Expo 运行时的原生 Swift/SwiftUI/UIKit 设置、版本管理和归档验证

## Expo / React Native 快速入门

### 安装 EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 初始化 EAS

```bash
npx eas-cli@latest init
```

`eas init` 会关联或创建 EAS 项目。运行 `eas build:configure` 以在 `eas.json` 中创建构建配置文件；如果已有发布设置，请保留现有的项目和应用商店标识符。

## 构建命令

### 生产构建

```bash
# iOS App Store build
npx eas-cli@latest build -p ios --profile production

# Android Play Store build
npx eas-cli@latest build -p android --profile production

# Both platforms
npx eas-cli@latest build --profile production
```

### 提交到应用商店

```bash
# iOS: Build and submit to App Store Connect
npx eas-cli@latest build -p ios --profile production --auto-submit

# Android: Build and submit to Play Store
npx eas-cli@latest build -p android --profile production --auto-submit

# Expo / React Native shortcut for iOS TestFlight
npx testflight
```

## Web 与 API 路由托管

将 Expo 网站或 Expo Router API 路由部署到 EAS Hosting（`npx expo export -p web`，然后执行 `eas deploy`）的内容由 `eas-hosting` skill 负责。本 skill 专注于原生应用商店发布。

## EAS 配置

Expo / React Native 项目的示例（原生 Swift 配置文件位于 `references/native-ios.md`）：

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m-medium"
      }
    },
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your@email.com",
        "ascAppId": "1234567890"
      },
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

## 特定平台指南

### iOS

- 对于原生 Swift 应用，使用 `references/native-ios.md` 中明确的构建/提交流程
- 对于 Expo / React Native 应用，`npx testflight` 提供了快速的 TestFlight 流程
- 通过 `eas credentials` 配置 Apple 凭证
- 请参阅 ./references/testflight.md 了解凭证设置
- 请参阅 ./references/ios-app-store.md 了解 App Store 提交

### Android

- 设置 Google Play Console 服务账号
- 配置发布轨道：internal → closed → open → production
- 请参阅 ./references/play-store.md 了解详细设置

## 自动化发布

EAS Workflows 可自动执行构建 → 提交 → 更新流程，用于 CI/CD。请参阅 ./references/workflows.md 了解应用商店发布示例。要编写或验证 workflow YAML，请使用 `eas-workflows` skill——它基于实时工作流 schema 运行。

## 版本管理

EAS 通过 `appVersionSource: "remote"` 自动管理版本号：

```bash
# Check current versions
eas build:version:get

# Manually set version
eas build:version:set -p ios
```

version-set 命令会提示输入值。在设置或更改原生 iOS 版本号，或诊断重复构建号时，请检查已归档的 `CFBundleVersion`：仅凭远程计数器无法证明 Xcode 使用了该值。

## 监控

```bash
# List recent builds
eas build:list

# Check build status
eas build:view BUILD_ID

# Inspect submissions (verified with EAS CLI 23.2.0)
eas submit:list -p ios --json
eas submit:view SUBMISSION_ID --json
```

在解读缺少的命令之前，请检查 CLI 版本：这些提交命令在 23.2.0 中可用，但在经过测试的 18.6.0 安装中不可用。固定使用 `npx eas-cli@23.2.0` 可以调用这些命令，而无需更改全局安装。请参阅 `references/testflight.md` 了解实时 Apple 状态和重试指导。当 JSON 结果省略底层失败原因时，请根据返回的日志 URL 继续查看。报告确切的构建 ID/版本以及已验证的最远发布状态。

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时内容，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "eas-app-stores" "<actionable feedback>"
```
只有在你有具体且可执行的反馈时才提交。请尽可能包含所有相关上下文。
如果 AI agent 反复失败，或用户不得不接管 Expo 任务，请加载 `expo-skill-feedback` skill，并遵循其 eval-candidate 流程，而不要重复使用上面的命令。