---
name: react-navigation
description: Provides React Navigation UI patterns for stacks, tabs, drawers etc. Use when building navigation UIs with React Navigation, configuring headers, bottom sheets or handling safe areas and insets.
license: MIT
---
# React Navigation

## 概述

使用 React Navigation 枪建导航 UI 的指南。

此技能仅适用于 React Navigation 7。相关 API 和模式可能不适用于其他版本。

## API 选择

React Navigation 提供两种 API——基于对象的 `Static API` 和基于组件的 `Dynamic API`。

- **现有应用**：检查当前的导航设置，并在使用参考资料时遵循相同的 API 风格
- **新应用**：如果应用尚无现有导航设置，优先使用 `Static API`

## 适用场景

在以下情况下参考此技能：

- 构建堆栈、标签页、抽屉、浮层等导航 UI 模式
- 配置标题栏和其他内置导航器 UI
- 处理导航 UI 中的安全区域和边距

## 参考资料

| 文件                                        | 说明                         |
| ------------------------------------------- | ---------------------------- |
| [stacks.md][stacks]                         | 基于堆栈的导航               |
| [form-sheet.md][form-sheet]                 | 底部浮层和表单浮层           |
| [bottom-tabs.md][bottom-tabs]               | 跨平台底部标签页             |
| [native-bottom-tabs.md][native-bottom-tabs] | 原生底部标签页               |
| [material-top-tabs.md][material-top-tabs]   | 可滑动顶部标签页             |
| [drawers.md][drawers]                       | 抽屉导航和侧边栏             |
| [header.md][header]                         | 配置标题栏                   |
| [safe-areas.md][safe-areas]                 | 安全区域处理                 |

## 问题 -> 技能映射

| 问题                                                                      | 从这里开始                                  |
| ------------------------------------------------------------------------- | ------------------------------------------- |
| 在堆栈中显示屏幕和模态窗口                                                | [stacks.md][stacks]                         |
| 显示底部浮层或表单浮层                                                    | [form-sheet.md][form-sheet]                 |
| 在底部标签页或支持 Web 的响应式侧边栏中显示屏幕                           | [bottom-tabs.md][bottom-tabs]               |
| 在 iOS 和 Android 的原生标签页中显示屏幕                                  | [native-bottom-tabs.md][native-bottom-tabs] |
| 在可滑动顶部标签页中显示内容                                              | [material-top-tabs.md][material-top-tabs]   |
| 使用抽屉或侧边栏                                                          | [drawers.md][drawers]                       |
| 配置底部标签页或抽屉导航器中的标题栏                                      | [header.md][header]                         |
| 处理状态栏、标题栏边距、标签栏边距等安全区域                              | [safe-areas.md][safe-areas]                 |

[stacks]: references/stacks.md
[form-sheet]: references/form-sheet.md
[safe-areas]: references/safe-areas.md
[bottom-tabs]: references/bottom-tabs.md
[native-bottom-tabs]: references/native-bottom-tabs.md
[material-top-tabs]: references/material-top-tabs.md
[drawers]: references/drawers.md
[header]: references/header.md