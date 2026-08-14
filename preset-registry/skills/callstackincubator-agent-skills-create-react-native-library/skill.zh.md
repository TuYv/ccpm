---
name: create-react-native-library
description: Scaffolds React Native libraries with create-react-native-library for standalone libraries or local native modules and views. Use when creating or working on React Native libraries or adding native functionality in an existing app.
license: MIT
---
# 创建 React Native 库

## 概述

使用此技能搭建独立的 React Native 库，或在现有应用中搭建本地库，然后继续查阅对应的实现文档。

示例：

- 可能使用其他 React Native 库的纯 JS 库
- 将原生功能暴露给 JavaScript 的原生模块
- 在 React Native 中渲染原生视图的原生 UI 组件

请先选择一种流程：

- 创建可能发布到 npm 的新库时，使用 [scaffold-library.md][scaffold-library]
- 在 React Native 应用中暴露原生功能时，使用 [local-library.md][local-library]

## 适用场景

在以下情况下使用此技能：

- 使用 `create-react-native-library` 创建或开发 React Native 库
- 在现有应用中创建原生模块或视图
- 封装原生 SDK 并将其暴露给 React Native

## 快速参考

```bash
# Inspect current options before scaffolding
npx create-react-native-library@latest --help

# Scaffold a library with turbo modules and the Expo example app
npx create-react-native-library@latest awesome-library \
  --no-interactive \
  --yes \
  --description "A brief description of the library" \
  --type turbo-module \
  --languages kotlin-objc \
  --example expo

# Scaffold a local Turbo Module inside an existing app
cd MyApp
npx create-react-native-library@latest awesome-library \
  --local \
  --no-interactive \
  --yes \
  --description "A brief description of the library" \
  --type turbo-module \
  --languages kotlin-objc
```

## 参考资料

| 文件                                    | 描述                                             |
| --------------------------------------- | ------------------------------------------------------- |
| [scaffold-library.md][scaffold-library] | 搭建新库，并默认使用 Expo 示例应用  |
| [local-library.md][local-library]       | 通过自动链接将本地库添加到现有应用中 |

## 问题 -> 技能映射

| 问题                                      | 从这里开始                           |
| -------------------------------------------- | ------------------------------------ |
| 需要搭建新库                  | [scaffold-library][scaffold-library] |
| 需要将本地原生库添加到应用中 | [local-library][local-library]       |

[scaffold-library]: references/scaffold-library.md
[local-library]: references/local-library.md