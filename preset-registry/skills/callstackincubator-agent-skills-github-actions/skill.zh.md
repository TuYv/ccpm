---
name: github-actions
description: GitHub Actions workflow patterns for React Native iOS simulator and Android emulator cloud builds with downloadable artifacts. Use when setting up CI build pipelines or downloading GitHub Actions artifacts via gh CLI and GitHub API.
license: MIT
---
# GitHub Actions 构建产物

## 概述

可复用的 GitHub Actions 模式，用于在云端构建面向 iOS 模拟器和 Android 模拟器的 React Native 应用，然后发布可通过 `gh` CLI 或 GitHub API 获取的构建产物。

## 适用场景

在以下情况下使用此技能：
- 创建用于构建 React Native 模拟器构建产物的 CI 工作流。
- 从 PR 或手动触发的运行中上传 iOS 模拟器和 Android 模拟器的可安装文件。
- 使用可下载的 CI 构建产物替代仅限本地的移动应用构建。
- 需要稳定的构建产物 ID/名称，以便通过 `gh` 或 REST API 使用脚本获取。

## 快速参考

1. 添加 [gha-ios-composite-action.md][gha-ios-composite-action] 和 [gha-android-composite-action.md][gha-android-composite-action] 中的复合操作。
2. 按照 [gha-workflow-and-downloads.md][gha-workflow-and-downloads] 将它们接入 `.github/workflows/mobile-build.yml`。
3. 使用 `actions/upload-artifact@v4` 上传，并捕获 `artifact-id` 输出。
4. 使用 `gh run download` 或 `GET /repos/{owner}/{repo}/actions/artifacts/{artifact_id}/{archive_format}` 下载。

## 参考资料

| 文件 | 说明 |
|------|-------------|
| [gha-ios-composite-action.md][gha-ios-composite-action] | 用于构建 iOS 模拟器 `.app.tar.gz` 文件并上传构建产物的复合 `action.yml` |
| [gha-android-composite-action.md][gha-android-composite-action] | 用于构建 Android 模拟器 `.apk` 文件并上传构建产物的复合 `action.yml` |
| [gha-workflow-and-downloads.md][gha-workflow-and-downloads] | 端到端工作流接入，以及 `gh` 和 REST 下载命令 |

## 问题 -> 技能映射

| 问题 | 从此处开始 |
|---------|------------|
| 需要 CI 生成的 iOS 模拟器 `.app.tar.gz` 构建产物 | [gha-ios-composite-action.md][gha-ios-composite-action] |
| 需要 CI 生成的 Android 模拟器 `.apk` 构建产物 | [gha-android-composite-action.md][gha-android-composite-action] |
| 需要一个工作流来触发两个平台的作业 | [gha-workflow-and-downloads.md][gha-workflow-and-downloads] |
| 需要使用脚本下载构建产物 | [gha-workflow-and-downloads.md][gha-workflow-and-downloads] |

## 灵感来源

- [callstackincubator/ios/action.yml](https://github.com/callstackincubator/ios/blob/main/action.yml)
- [callstackincubator/android/action.yml](https://github.com/callstackincubator/android/blob/main/action.yml)

[gha-ios-composite-action]: references/gha-ios-composite-action.md
[gha-android-composite-action]: references/gha-android-composite-action.md
[gha-workflow-and-downloads]: references/gha-workflow-and-downloads.md