---
name: expo-deployment
description: Deploy Expo apps to production with EAS — build and submit to the iOS App Store, Google Play Store, and TestFlight, configure eas.json build and submit profiles, manage app versions and build numbers, publish App Store metadata and ASO, and deploy web bundles and API routes via EAS Hosting. Use whenever the user is preparing a production build, running eas build or eas submit, shipping to TestFlight, releasing or rolling out to the app stores, bumping version or build numbers, or setting up store listing metadata for an Expo app.
version: 1.0.0
license: MIT
---
# 部署

此技能涵盖使用 EAS（Expo Application Services）在所有平台上部署 Expo 应用程序。

## 参考资料

根据需要查阅以下资源：

- ./references/workflows.md -- 用于自动部署和 PR 预览的 CI/CD 工作流
- ./references/testflight.md -- 将 iOS 构建提交到 TestFlight 进行 Beta 测试
- ./references/app-store-metadata.md -- 管理 App Store 元数据和 ASO 优化
- ./references/play-store.md -- 将 Android 构建提交到 Google Play Store
- ./references/ios-app-store.md -- iOS App Store 提交与审核流程

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

### 生产环境构建

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

## Web 部署

使用 EAS Hosting 部署 Web 应用：

```bash
# Deploy to production
npx expo export -p web
npx eas-cli@latest deploy --prod

# Deploy PR preview
npx eas-cli@latest deploy
```

Expo Router API 路由会与 Web 包一起部署到 EAS Hosting——`eas deploy` 会同时发布两者。若要编写或配置 API 路由本身，请使用 `expo-api-routes` 技能。

## EAS 配置

用于生产环境部署的标准 `eas.json`：

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

## 平台专属指南

### iOS

- 使用 `npx testflight` 快速提交到 TestFlight
- 通过 `eas credentials` 配置 Apple 凭据
- 有关凭据设置，请参阅 ./references/testflight.md
- 有关 App Store 提交，请参阅 ./references/ios-app-store.md

### Android

- 设置 Google Play Console 服务账号
- 配置发布轨道：internal → closed → open → production
- 有关详细设置，请参阅 ./references/play-store.md

### Web

- EAS Hosting 为 PR 提供预览 URL
- 生产环境部署到你的自定义域名
- 有关 CI/CD 自动化，请参阅 ./references/workflows.md

## 自动化部署

EAS Workflows 可自动执行 CI/CD 的构建 → 提交 → 更新 → 部署流水线。有关面向部署的示例，请参阅 ./references/workflows.md。若要编写或验证工作流 YAML，请使用 `expo-cicd-workflows` 技能——该技能基于实时工作流 schema 运行。

## 版本管理

EAS 使用 `appVersionSource: "remote"` 自动管理版本号：

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