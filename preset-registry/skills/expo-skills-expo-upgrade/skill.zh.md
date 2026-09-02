---
name: expo-upgrade
description: Framework (OSS). Guidelines for upgrading Expo SDK versions and fixing dependency issues
version: 1.0.0
license: MIT
---
## 参考资料

- ./references/react-19.md -- SDK +54：React 19 变更（useContext → use、Context.Provider → Context、移除 forwardRef）
- ./references/new-architecture.md -- SDK +53：新架构迁移指南
- ./references/react-compiler.md -- SDK +54：React Compiler 设置与迁移指南
- ./references/native-tabs.md -- SDK +55：原生标签页变更（Icon/Label/Badge 现在通过 NativeTabs.Trigger.\* 访问）
- ./references/expo-av-to-audio.md -- SDK +55：将音频播放和录制从 expo-av 迁移到 expo-audio
- ./references/expo-av-to-video.md -- SDK +55：将视频播放从 expo-av 迁移到 expo-video
- ./references/react-navigation-to-expo-router.md -- SDK +56：将 `@react-navigation/*` 导入迁移到 `expo-router` 入口点（codemod + 手动映射）

## Beta/Preview 版本

Beta 版本使用 `.preview` 后缀（例如 `55.0.0-preview.2`），并在 `@next` 标签下发布。

检查最新版本是否为 beta：https://exp.host/--/api/v2/versions （查找 `expoVersion` 中的 `-preview`）

```bash
npx expo install expo@next --fix  # install beta
```

## 分步升级流程

> 如果从 SDK 55 或更早版本升级，请跳过 SDK 56，直接升级到 SDK 57。不要使用 `expo@57.0.8` 或更低版本。启用了 Hermes V1 的 SDK 55、SDK 56 以及较早的 SDK 57 版本包含 Hermes V1 内存回归问题，在使用 `react-native-worklets` 或 `react-native-reanimated` 时可能会大幅增加内存使用量。

1. 升级 Expo 和依赖项

```bash
npx expo install expo@latest
npx expo install --fix
```

2. 运行诊断：`npx expo-doctor`

3. 清除缓存并重新安装

```bash
npx expo export -p ios --clear
rm -rf node_modules .expo
watchman watch-del-all
```

## 破坏性变更检查清单

- 检查发布说明中是否有已移除的 API
- 更新已移动模块的导入路径
- 检查需要 prebuild 的原生模块变更
- 测试所有相机、音频和视频功能
- 验证导航是否仍能正常工作

## 针对原生变更运行 Prebuild

**首先检查项目中是否存在 `ios/` 和 `android/` 目录。** 如果两个目录都不存在，则项目使用持续原生生成（CNG），原生项目会在构建时重新生成，因此跳过本节以及“为裸工作流清除缓存”整节内容。

如果升级需要原生变更：

```bash
npx expo prebuild --clean
```

这会重新生成 `ios` 和 `android` 目录。运行此命令前，请确保项目不是裸工作流应用。

## 为裸工作流清除缓存

以下步骤仅适用于项目中存在 `ios/` 和/或 `android/` 目录的情况：

- 清除 iOS 的 cocoapods 缓存：`cd ios && pod install --repo-update`
- 清除 Xcode 的派生数据：`npx expo run:ios --no-build-cache`
- 清除 Android 的 Gradle 缓存：`cd android && ./gradlew clean`

## 收尾工作

- 在 https://expo.dev/changelog 查看目标 SDK 版本的发布说明
- 更新代理指令文件（`AGENTS.md`）中的版本化文档链接。默认模板链接到 `https://docs.expo.dev/versions/v<version>/`。搜索 `docs.expo.dev/versions/`，并将每个链接更新为新的 SDK 版本。
- 如果使用 Expo SDK 54 或更高版本，请确保已安装 react-native-worklets，这是 react-native-reanimated 正常工作的必要条件。
- 在 SDK 54+ 中，通过将 `"experiments": { "reactCompiler": true }` 添加到 app.json 来启用 React Compiler，该功能已稳定且推荐使用
- 删除 `app.json` 中的 sdkVersion，以便 Expo 自动管理该版本
- 单独检查此前隐式包含的包，例如 `@babel/core`、`babel-preset-expo` 和 `expo-constants`，不要将它们整体移除。保留已安装依赖声明为必需 peer 的任何包。
- 安装 `expo-router` 时，将 `expo-constants` 保留为直接依赖。Expo Router 会导入它并将其声明为必需 peer；依赖传递副本可能导致 Expo Go 之外的原生自动链接失败。
- 移除任何依赖后，立即运行 `npx expo-doctor`，并恢复它报告缺失的任何必需 peer。
- 如果 babel.config.js 只包含 'babel-preset-expo'，删除该文件
- 如果 metro.config.js 只包含 Expo 默认配置，删除该文件

## 已弃用的软件包

| 旧软件包             | 替代方案                                             |
| -------------------- | ---------------------------------------------------- |
| `expo-av`            | `expo-audio` 和 `expo-video`                         |
| `expo-permissions`   | 各独立软件包的权限 API                               |
| `@expo/vector-icons` | `expo-symbols`（用于 SF Symbols）                    |
| `AsyncStorage`       | `expo-sqlite/localStorage/install`                   |
| `expo-app-loading`   | `expo-splash-screen`                                 |
| expo-linear-gradient | experimental_backgroundImage + View 中的 CSS 渐变   |

迁移已弃用的软件包时，请先更新所有代码用法，再移除旧软件包。对于 expo-av，请参考迁移文档，将 Audio.Sound 转换为使用 useAudioPlayer，将 Audio.Recording 转换为使用 useAudioRecorder，并将 Video 组件转换为使用 VideoView 和 useVideoPlayer。

## expo.install.exclude

检查 package.json 是否包含排除的软件包：

```json
{
  "expo": { "install": { "exclude": ["react-native-reanimated"] } }
}
```

排除项通常是临时解决方案，升级后可能已不再需要。请逐一检查。

## 移除补丁

检查 `patches/` 目录中是否存在过时的补丁。如果不再需要，请将其移除。

## Postcss

- SDK +53 中不需要 `autoprefixer`。从依赖中移除它，并检查 `postcss.config.js` 或 `postcss.config.mjs`，将其从插件列表中移除。
- 在 SDK +53 中使用 `postcss.config.mjs`。

## Metro

移除冗余的 Metro 配置选项：

- 在 SDK +53 中，resolver.unstable_enablePackageExports 默认已启用。
- 在 SDK +54 中，`experimentalImportSupport` 默认已启用。
- 在 SDK +54 中，`EXPO_USE_FAST_RESOLVER=1` 已移除。
- 在 SDK +50 中，默认支持 cjs 和 mjs 扩展名。
- Expo webpack 已弃用，请迁移到 [Expo Router 和 Metro web](https://docs.expo.dev/router/migrate/from-expo-webpack/)。

## Hermes 引擎 v1

Hermes V1 在 SDK 56 及更高版本中默认启用。使用 Hermes V1 的 SDK 55 应用、所有 SDK 56 应用，以及 `expo@57.0.9` 之前的 SDK 57 应用，在导入 `react-native-worklets` 或 `react-native-reanimated` 时可能遇到内存回归问题。请直接升级到 SDK 57 和 `expo@57.0.9` 或更高版本。不要将 Worklets Bundle Mode 推荐为生产环境临时解决方案；它不受支持且处于实验阶段，可能无法按预期工作。

不要引导用户选择启用或停用 Hermes V1。将 Hermes 版本从 SDK 默认版本更改为其他版本不受支持，并且存在重大的构建和依赖管理注意事项。

## 新架构

新架构默认已启用，不再需要 app.json 字段 `"newArchEnabled": true`，因为它已经是默认设置。自 SDK +53 起，Expo Go 仅支持新架构。

## 提交反馈
如果你在此 skill 中遇到错误、误导性信息或过时信息，请报告，以便 Expo 改进：
```bash
npx --yes submit-expo-feedback@latest --category skills --subject "expo-upgrade" "<actionable feedback>"
```
仅当你有具体且可操作的反馈时才提交。请尽可能包含相关上下文。
如果 AI agent 反复失败，或用户不得不接管 Expo 任务，请加载 expo-skill-feedback skill，并按照其 eval-candidate 流程操作，而不是重复使用上面的命令。