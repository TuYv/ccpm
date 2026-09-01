---
name: brand-guidelines
description: Applies Anthropic's official brand colors and typography to any sort of artifact that may benefit from having Anthropic's look-and-feel. Use it when brand colors or style guidelines, visual formatting, or company design standards apply.
license: Complete terms in LICENSE.txt
---
# Anthropic 品牌样式

## 概览

要访问 Anthropic 官方品牌识别与样式资源，请使用此技能。

**关键词**：品牌、企业形象、视觉识别、后处理、样式化、品牌色彩、排版、Anthropic 品牌、视觉排版、视觉设计

## 品牌指南

### 颜色

**主色：**

- 深色：`#141413` - 主要文本和深色背景
- 浅色：`#faf9f5` - 浅色背景和深色背景上的文本
- 中灰色：`#b0aea5` - 次要元素
- 浅灰色：`#e8e6dc` - 细微背景

**强调色：**

- 橙色：`#d97757` - 主要强调色
- 蓝色：`#6a9bcc` - 次要强调色
- 绿色：`#788c5d` - 第三级强调色

### 字体

- **标题**：Poppins（如不可用则回退到 Arial）
- **正文**：Lora（如不可用则回退到 Georgia）
- **注意**：为达到最佳效果，字体应预先安装在你的环境中

## 功能

### 智能字体应用

- 将 Poppins 字体应用于标题（24pt 及以上）
- 将 Lora 字体应用于正文
- 如果自定义字体不可用，自动回退到 Arial/Georgia
- 在所有系统中保持可读性

### 文本样式

- 标题（24pt+）：Poppins 字体
- 正文：Lora 字体
- 基于背景自动选择颜色
- 保持文本层级与格式

### 形状与强调色

- 非文本形状使用强调色
- 在橙色、蓝色和绿色强调色之间循环
- 在保持品牌一致性的同时维持视觉吸引力

## 技术细节

### 字体管理

- 在可用时使用系统已安装的 Poppins 和 Lora 字体
- 为标题和正文分别提供自动回退到 Arial 和 Georgia
- 无需安装字体——可与现有系统字体配合使用
- 为了达到最佳效果，请在你的环境中预先安装 Poppins 和 Lora 字体

### 颜色应用

- 使用 RGB 颜色值实现精确的品牌匹配
- 通过 python-pptx 的 RGBColor class 进行应用
- 保持不同系统间的颜色一致性
