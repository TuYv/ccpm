---
name: react-native-brownfield-migration
description: Implements an accepted incremental brownfield migration from native iOS or Android to React Native or Expo using @callstack/react-native-brownfield. Use after the brownfield path has been selected, when setting up the integration, packaging XCFramework or AAR artifacts, or adding React Native surfaces to native hosts.
license: MIT
---
# 迁移到 React Native

仅在已经决定采用棕地迁移后使用此技能。当用户仍在棕地迁移、绿地迁移、基于检查点的路径、推迟迁移或不迁移之间进行选择时，请先使用 [assess-react-native-migration](../assess-react-native-migration/SKILL.md)。

## 概述

使用 `@callstack/react-native-brownfield` 在现有原生应用中渐进式采用 React Native 的规范化工作流，涵盖从初始设置到分阶段宿主集成的全过程。

- Expo 路径
- 裸 React Native 路径

每项任务仅使用一条路径，除非用户明确要求迁移或比较路径。

## 迁移策略

使用以下策略规划和执行棕地迁移：

1. 评估应用状态，并选择 Expo 或裸 React Native 路径。
2. 使用 `@callstack/react-native-brownfield` 执行初始设置。
3. 从 RN 源应用打包 RN 构件（`XCFramework`/`AAR`）。
4. 将一个 RN 界面集成到宿主应用中，并验证启动和运行时行为。
5. 按功能或屏幕重复集成，以实现渐进式发布。

## 智能体防护规则（全局）

在所有参考文件中应用以下规则：

1. 首先选择一条路径（Expo 或裸 React Native），不要混用步骤。
2. 使用文档中的占位符（`<framework_target_name>`、`<android_module_name>`、`<registered_module_name>`），并根据项目文件确定其具体值。
3. 在继续进行宿主集成之前，验证每条打包命令。
4. 对于较长的平台代码片段和 CLI 选项详情，优先参考官方文档。
5. 尽可能避免宿主应用直接使用 React Native API（采用外观模式）。
6. 对于启动和运行时验证，使用 `agent-device` 打开宿主应用、导航至 RN 界面、捕获快照/屏幕截图，并收集设备端证据。如果缺少该工具且验证需要使用它，请通过环境批准或信任的途径安装，或者请用户安装或启用它。

## 规范文档

- [快速入门](https://oss.callstack.com/react-native-brownfield/docs/getting-started/quick-start.md)
- [Expo 集成](https://oss.callstack.com/react-native-brownfield/docs/getting-started/expo.md)
- [iOS 集成](https://oss.callstack.com/react-native-brownfield/docs/getting-started/ios.md)
- [Android 集成](https://oss.callstack.com/react-native-brownfield/docs/getting-started/android.md)
- [Brownfield CLI](https://oss.callstack.com/react-native-brownfield/docs/cli/brownfield.md)
- [指南](https://oss.callstack.com/react-native-brownfield/docs/guides/guidelines.md)
- [故障排除](https://oss.callstack.com/react-native-brownfield/docs/guides/troubleshooting.md)

## 路径选择关卡（必须首先执行）

在选择任何参考文件之前，对项目进行分类：

1. 如果尚不存在 React Native 应用，请使用 Expo 创建路径：
   - [expo-create-app.md][expo-create-app] -> [expo-quick-start.md][expo-quick-start]
2. 如果已存在 React Native 应用，请检查 `package.json` 和 `app.json`：
   - 如果存在 `expo`，或者要求使用 Expo 插件工作流，则选择 Expo。
   - 如果使用原生目录和直接 RN CLI 工作流，且没有 Expo 路径要求，则选择裸 RN。
3. 如果仍不明确，请提出一个用于消除歧义的问题。
4. 仅沿一条路径继续。

## 适用场景

在以下情况下参考此包：

- 实施已获认可的从纯原生应用到 React Native 或 Expo 的渐进式迁移
- 为 Expo 或裸 React Native 项目创建棕地集成流程
- 使用 `@callstack/react-native-brownfield` 执行初始设置
- 从 React Native 应用生成 iOS XCFramework 构件
- 从 React Native 应用生成并发布 Android AAR 构件
- 将生成的构件集成到宿主 iOS/Android 应用中

## 快速参考

| 文件 | 说明 |
|------|-------------|
| [quick-start.md][quick-start] | 通用前置检查和强制路径选择关卡 |
| [expo-create-app.md][expo-create-app] | 在设置 Expo 棕地集成之前搭建新的 Expo 应用 |
| [expo-quick-start.md][expo-quick-start] | Expo 插件设置和打包就绪准备 |
| [expo-ios-integration.md][expo-ios-integration] | Expo iOS 打包和宿主启动集成 |
| [expo-android-integration.md][expo-android-integration] | Expo Android 打包、发布和宿主集成 |
| [bare-quick-start.md][bare-quick-start] | 裸 React Native 基线设置 |
| [bare-ios-xcframework-generation.md][bare-ios-xcframework-generation] | 裸 iOS XCFramework 生成 |
| [bare-android-aar-generation.md][bare-android-aar-generation] | 裸 Android AAR 生成和发布 |
| [bare-ios-native-integration.md][bare-ios-native-integration] | 裸 iOS 宿主集成 |
| [bare-android-native-integration.md][bare-android-native-integration] | 裸 Android 宿主集成 |

## 问题 -> Skill 映射

| 问题 | 从此处开始 |
|---------|------------|
| 需要先决定迁移路径 | [评估 React Native 迁移](../assess-react-native-migration/SKILL.md) |
| 需要决定选择 Expo 还是裸项目路径 | [quick-start.md][quick-start] |
| 需要为棕地集成创建新的 Expo 应用 | [expo-create-app.md][expo-create-app] |
| 需要设置 Expo 棕地集成并连接插件 | [expo-quick-start.md][expo-quick-start] |
| 需要进行 Expo iOS 棕地集成 | [expo-ios-integration.md][expo-ios-integration] |
| 需要进行 Expo Android 棕地集成 | [expo-android-integration.md][expo-android-integration] |
| 需要设置裸 RN 基线 | [bare-quick-start.md][bare-quick-start] |
| 需要生成裸 RN iOS XCFramework | [bare-ios-xcframework-generation.md][bare-ios-xcframework-generation] |
| 需要生成/发布裸 RN Android AAR | [bare-android-aar-generation.md][bare-android-aar-generation] |
| 需要进行裸 RN iOS 宿主集成 | [bare-ios-native-integration.md][bare-ios-native-integration] |
| 需要进行裸 RN Android 宿主集成 | [bare-android-native-integration.md][bare-android-native-integration] |

## 相关 Skill

- 在选择迁移路径之前，请先[评估 React Native 迁移](../assess-react-native-migration/SKILL.md)。

[quick-start]: references/quick-start.md
[expo-create-app]: references/expo-create-app.md
[expo-quick-start]: references/expo-quick-start.md
[expo-ios-integration]: references/expo-ios-integration.md
[expo-android-integration]: references/expo-android-integration.md
[bare-quick-start]: references/bare-quick-start.md
[bare-ios-xcframework-generation]: references/bare-ios-xcframework-generation.md
[bare-android-aar-generation]: references/bare-android-aar-generation.md
[bare-ios-native-integration]: references/bare-ios-native-integration.md
[bare-android-native-integration]: references/bare-android-native-integration.md