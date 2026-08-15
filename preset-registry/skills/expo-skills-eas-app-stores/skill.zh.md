---
name: eas-app-stores
description: EAS service (paid). Deploy Expo apps to the app stores with EAS - build and submit to the iOS App Store, Google Play Store, and TestFlight, configure eas.json build and submit profiles, manage app versions and build numbers, and publish App Store metadata and ASO. Use whenever the user wants to deploy, release, or ship an app to production or the app stores, is preparing a production build, running eas build or eas submit, shipping to TestFlight, bumping version or build numbers, or setting up store listing metadata. For deploying an Expo website or API routes, use the eas-hosting skill.
version: 1.0.0
license: MIT
---
# App Store 部署

> **EAS 服务——会产生费用。** 此技能使用 Expo Application Services (EAS)，这是一项设有免费套餐限制的付费产品。`eas build` 和 `eas submit` 会消耗你的套餐构建分钟数，提交到应用商店还需要付费的 Apple Developer 和 Google Play 账号。运行云端命令前，请查看 https://expo.dev/pricing。

此技能涵盖使用 EAS (Expo Application Services) 构建 Expo 应用并将其发布到 iOS App Store、Google Play Store 和 TestFlight。若要将 Expo 网站或 API 路由部署到 EAS Hosting，请使用 `eas-hosting` 技能。

## 参考资料

根据需要查阅以下资源：

- ./references/workflows.md -- 用于自动发布应用商店版本和生成 PR 预览的 CI/CD 工作流
- ./references/testflight.md -- 将 iOS 构建提交到 TestFlight 进行 Beta 测试
- ./references/app-store-metadata.md -- 管理 App Store 元数据和 ASO 优化
- ./references/play-store.md -- 将 Android 构建提交到 Google Play Store
- ./references/ios-app-store.md -- iOS App Store 提交和审核流程

## 快速开始

### 安装 EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 初始化 EAS

```bash
npx eas-cli@latest init
```

这会创建包含构建配置文件的 `eas.json`。

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
npx eas-cli@latest build -p ios --profile production --submit

# Android: Build and submit to Play Store
npx eas-cli@latest build -p android --profile production --submit

# Shortcut for iOS TestFlight
npx testflight
```

## Web 和 API 路由托管

将 Expo 网站或 Expo Router API 路由部署到 EAS Hosting（先运行 `npx expo export -p web`，然后运行 `eas deploy`）的相关内容由 `eas-hosting` 技能涵盖。此技能专注于原生应用商店发布。

## EAS 配置

用于生产部署的标准 `eas.json`：

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

## 平台特定指南

### iOS

- 使用 `npx testflight` 快速提交到 TestFlight
- 通过 `eas credentials` 配置 Apple 凭据
- 有关凭据设置，请参阅 ./references/testflight.md
- 有关 App Store 提交，请参阅 ./references/ios-app-store.md

### Android

- 设置 Google Play Console 服务账号
- 配置发布轨道：internal → closed → open → production
- 有关详细设置，请参阅 ./references/play-store.md

## 自动发布

EAS Workflows 可自动执行 CI/CD 的构建 → 提交 → 更新流水线。有关应用商店发布的示例，请参阅 ./references/workflows.md。要编写或验证工作流 YAML，请使用 `eas-workflows` 技能——它基于实时工作流架构运行。

## 版本管理

EAS 通过 `appVersionSource: "remote"` 自动管理版本号：

```bash
# Check current versions
eas build:version:get

# Manually set version
eas build:version:set -p ios --build-number 42
```

## 监控

```bash
# List recent builds
eas build:list

# Check build status
eas build:view

# View submission status
eas submit:list
```

## 提交反馈
如果你在此技能中遇到错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "eas-app-stores" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供更多相关上下文。
如果 AI 代理反复失败，或者用户不得不接手 Expo 任务，请加载 expo-skill-feedback 技能并遵循其 eval-candidate 流程，而不要重复使用上述命令。