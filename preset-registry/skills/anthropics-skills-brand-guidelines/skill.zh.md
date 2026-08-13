---
name: brand-guidelines
description: Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.
license: Complete terms in LICENSE.txt
---
# Anthropic 品牌样式

## 概述

要访问 Anthropic 的官方品牌身份和样式资源，请使用此技能。

**关键词**：品牌设计、企业身份、视觉识别、后处理、样式处理、品牌颜色、排版、Anthropic 品牌、视觉格式化、视觉设计

## 品牌指南

### 颜色

**主要颜色：**

- 深色：`#141413` - 主要文本和深色背景
- 浅色：`#faf9f5` - 浅色背景和深色文字
- 中灰：`#b0aea5` - 次要元素
- 浅灰：`#e8e6dc` - 微妙背景

**强调色：**

- 橙色：`#d97757` - 主要强调色
- 蓝色：`#6a9bcc` - 次要强调色
- 绿色：`#788c5d` - 第三强调色

### 排版

- **标题**：Poppins（回退到 Arial）
- **正文**：Lora（回退到 Georgia）
- **注意**：字体在环境中应预先安装以达到最佳效果

## 特性

### 智能字体应用

- 对标题（24pt及以上）应用 Poppins 字体
- 对正文应用 Lora 字体
- 若无自定义字体则自动回退到 Arial/Georgia
- 在所有系统上保持可读性

### 文本样式

- 标题（24pt+）：Poppins 字体
- 正文：Lora 字体
- 根据背景智能选择颜色
- 保持文本层级和格式

### 形状与强调色

- 非文本形状使用强调色
- 在橙色、蓝色和绿色强调色之间循环使用
- 在保持品牌一致的同时维持视觉吸引力

## 技术细节

### 字体管理

- 在可用时使用系统内置的 Poppins 和 Lora 字体
- 为标题与正文分别自动回退到 Arial 和 Georgia
- 无需安装字体——使用现有系统字体即可使用
- 为获得最佳效果，请在环境中预先安装 Poppins 和 Lora 字体

### 颜色应用

- 使用 RGB 颜色值以确保精确的品牌匹配
- 通过 python-pptx 的 RGBColor 类应用
- 在不同系统之间保持色彩一致性
