---
name: upgrading-expo
description: Guidelines for upgrading Expo SDK versions and fixing dependency issues
version: 1.0.0
license: MIT
---
## 参考资料

- ./references/react-19.md -- SDK +54：React 19 变更（useContext → use、Context.Provider → Context、移除 forwardRef）
- ./references/new-architecture.md -- SDK +53：新架构迁移指南
- ./references/react-compiler.md -- SDK +54：React Compiler 设置和迁移指南
- ./references/native-tabs.md -- SDK +55：原生标签页变更（Icon/Label/Badge 现在通过 NativeTabs.Trigger.\* 访问）
- ./references/expo-av-to-audio.md -- SDK +55：将音频播放和录制从 expo-av 迁移到 expo-audio
- ./references/expo-av-to-video.md -- SDK +55：将视频播放从 expo-av 迁移到 expo-video
- ./references/react-navigation-to-expo-router.md -- SDK +56：将 `@react-navigation/*` 导入迁移到 `expo-router` 入口点（codemod + 手动映射）

## Beta/预览版本

Beta 版本使用 `.preview` 后缀（例如 `55.0.0-preview.2`），并发布在 `@next` 标签下。

检查最新版本是否为 Beta：https://exp.host/--/api/v2/versions（查看 `expoVersion` 中是否包含 `-preview`）

```bash
npx expo install expo@next --fix  # install beta
```

## 分步升级流程

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

- 检查发行说明中已移除的 API
- 更新已移动模块的导入路径
- 检查需要执行 prebuild 的原生模块变更
- 测试所有相机、音频和视频功能
- 验证导航是否仍能正常工作

## 针对原生变更执行 Prebuild

**首先检查项目中是否存在 `ios/` 和 `android/` 目录。** 如果两个目录都不存在，则项目使用持续原生生成（CNG），原生项目会在构建时重新生成——完全跳过本节和“清除裸工作流的缓存”一节。

如果升级需要原生变更：

```bash
npx expo prebuild --clean
```

这会重新生成 `ios` 和 `android` 目录。运行此命令前，请确保项目不是裸工作流应用。

## 清除裸工作流的缓存

以下步骤仅适用于项目中存在 `ios/` 和/或 `android/` 目录的情况：

- 清除 iOS 的 CocoaPods 缓存：`cd ios && pod install --repo-update`
- 清除 Xcode 的派生数据：`npx expo run:ios --no-build-cache`
- 清除 Android 的 Gradle 缓存：`cd android && ./gradlew clean`

## 日常维护

- 在 https://expo.dev/changelog 查看目标 SDK 版本的发行说明
- 如果使用 Expo SDK 54 或更高版本，请确保已安装 react-native-worklets——这是 react-native-reanimated 正常工作所必需的。
- 在 SDK 54+ 中，通过向 app.json 添加 `"experiments": { "reactCompiler": true }` 来启用 React Compiler——它已稳定并推荐使用
- 从 `app.json` 中删除 sdkVersion，让 Expo 自动管理它
- 从 `package.json` 中移除隐式包：`@babel/core`、`babel-preset-expo`、`expo-constants`。
- 如果 babel.config.js 仅包含 'babel-preset-expo'，请删除该文件
- 如果 metro.config.js 仅包含 Expo 默认配置，请删除该文件

## 已弃用的软件包

| 旧软件包             | 替代方案                                             |
| -------------------- | ---------------------------------------------------- |
| `expo-av`            | `expo-audio` 和 `expo-video`                         |
| `expo-permissions`   | 各个软件包各自的权限 API                             |
| `@expo/vector-icons` | `expo-symbols`（用于 SF Symbols）                    |
| `AsyncStorage`       | `expo-sqlite/localStorage/install`                   |
| `expo-app-loading`   | `expo-splash-screen`                                 |
| expo-linear-gradient | experimental_backgroundImage + View 中的 CSS 渐变   |

迁移已弃用的软件包时，请先更新所有代码用法，再移除旧软件包。对于 expo-av，请参考迁移资料，将 Audio.Sound 转换为使用 useAudioPlayer，将 Audio.Recording 转换为使用 useAudioRecorder，并将 Video 组件转换为搭配 useVideoPlayer 使用的 VideoView。

## expo.install.exclude

检查 package.json 是否包含被排除的软件包：

```json
{
  "expo": { "install": { "exclude": ["react-native-reanimated"] } }
}
```

排除项通常是临时解决方案，升级后可能已不再需要。请逐一检查。

## 移除补丁

检查 `patches/` 目录中是否存在任何过时的补丁。如果不再需要，请将其移除。

## Postcss

- SDK +53 中不再需要 `autoprefixer`。请将其从依赖项中移除，并检查 `postcss.config.js` 或 `postcss.config.mjs`，将其从插件列表中移除。
- 在 SDK +53 中使用 `postcss.config.mjs`。

## Metro

移除多余的 metro 配置选项：

- resolver.unstable_enablePackageExports 在 SDK +53 中默认启用。
- `experimentalImportSupport` 在 SDK +54 中默认启用。
- `EXPO_USE_FAST_RESOLVER=1` 在 SDK +54 中已被移除。
- 从 SDK +50 开始，默认支持 cjs 和 mjs 扩展名。
- Expo webpack 已弃用，请迁移到 [Expo Router 和 Metro web](https://docs.expo.dev/router/migrate/from-expo-webpack/)。

## Hermes engine v1

从 SDK 55 开始，用户可以选择启用 Hermes engine v1，以提升运行时性能。这需要在 `expo-build-properties` config plugin 中设置 `useHermesV1: true`，并且可能需要特定版本的 `hermes-compiler` npm package。Hermes v1 将在未来的某个 SDK 版本中成为默认选项。

## 新架构

新架构已默认启用，因此 app.json 字段 `"newArchEnabled": true` 不再需要，因为它已经是默认设置。从 SDK +53 开始，Expo Go 仅支持新架构。