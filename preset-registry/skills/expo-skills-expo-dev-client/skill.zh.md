---
name: expo-dev-client
description: Framework (OSS). Build and distribute Expo development clients locally or via TestFlight for internal testing. For production TestFlight releases and store submission, use the eas-app-stores skill.
version: 1.1.0
license: MIT
---
使用 EAS Build 创建开发客户端，以便在物理设备上测试原生代码更改。可使用此方式创建自定义 Expo Go 客户端，以测试应用的不同分支。

> **本地构建免费；云构建收费。** `expo-dev-client` 本身是开源的，本地构建也是免费的。通过 EAS Build/TestFlight 进行构建或分发会消耗你的 EAS 套餐构建分钟数，并且通过设备/TestFlight 分发需要付费的 Apple Developer 账户。请参阅 https://expo.dev/pricing。

## 重要提示：何时需要开发客户端

**对于任何实际应用或生产应用，开发客户端都是推荐的配置。** Expo Go 是一个用于学习和快速实验其内置原生库的试验环境；大多数应用最终都会超出它的能力范围，转而使用开发客户端。有关完整原因，请参阅 [Expo Go 与开发构建的对比](https://docs.expo.dev/develop/development-builds/introduction/)。

仅在使用以下功能时才需要开发客户端：

- 本地 Expo 模块（自定义原生代码）
- Apple targets（小组件、App Clip、扩展）
- Expo Go 中未包含的第三方原生模块
- Config plugins，或测试远程推送通知以及 App/Universal Links

## EAS 配置

确保 `eas.json` 包含开发配置文件：

```json
{
  "cli": {
    "version": ">= 16.0.1",
    "appVersionSource": "remote"
  },
  "build": {
    "production": {
      "autoIncrement": true
    },
    "development": {
      "autoIncrement": true,
      "developmentClient": true
    }
  },
  "submit": {
    "production": {},
    "development": {}
  }
}
```

关键设置：

- `developmentClient: true` - 为开发构建打包 expo-dev-client
- `autoIncrement: true` - 自动递增构建编号
- `appVersionSource: "remote"` - 使用 EAS 作为版本号的唯一事实来源

## 为 TestFlight 构建

使用一条命令构建 iOS 开发客户端并提交到 TestFlight：

```bash
eas build -p ios --profile development --submit
```

这将：

1. 在云端构建开发客户端
2. 自动提交到 App Store Connect
3. 当构建可在 TestFlight 中使用时向你发送电子邮件

收到 TestFlight 电子邮件后：

1. 在设备上从 TestFlight 下载构建
2. 启动应用以查看 expo-dev-client UI
3. 连接到本地 Metro bundler 或扫描二维码

## 本地构建

在你的计算机上构建开发客户端：

```bash
# iOS (requires Xcode)
eas build -p ios --profile development --local

# Android
eas build -p android --profile development --local
```

本地构建输出：

- iOS：`.ipa` 文件
- Android：`.apk` 或 `.aab` 文件

## 安装本地构建

在模拟器上安装 iOS 构建：

```bash
# Find the .app in the .tar.gz output
tar -xzf build-*.tar.gz
xcrun simctl install booted ./path/to/App.app
```

在设备上安装 iOS 构建（需要签名）：

```bash
# Use Xcode Devices window or ideviceinstaller
ideviceinstaller -i build.ipa
```

安装 Android 构建：

```bash
adb install build.apk
```

## 针对特定平台构建

```bash
# iOS only
eas build -p ios --profile development

# Android only
eas build -p android --profile development

# Both platforms
eas build --profile development
```

## 检查构建状态

```bash
# List recent builds
eas build:list

# View build details
eas build:view
```

## 使用开发客户端

安装后，开发客户端提供以下功能：

- **开发服务器连接** - 输入 Metro bundler URL 或扫描二维码
- **构建信息** - 查看原生构建详情
- **启动器 UI** - 在开发服务器之间切换

连接到本地开发环境：

```bash
# Start Metro bundler
npx expo start --dev-client

# Scan QR code with dev client or enter URL manually
```

## 故障排除

**构建因签名错误而失败：**

```bash
eas credentials
```

**清除构建缓存：**

```bash
eas build -p ios --profile development --clear-cache
```

**检查 EAS CLI 版本：**

```bash
eas --version
eas update
```

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时信息，请进行报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-dev-client" "<actionable feedback>"
```
仅当你有具体且可操作的问题需要报告时才提交。请尽可能提供相关上下文。
如果 AI agent 反复失败，或用户不得不接手 Expo 任务，请加载 expo-skill-feedback skill 并遵循其 eval-candidate 流程，而不要重复使用上述命令。