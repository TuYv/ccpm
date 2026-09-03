---
name: llama-factory
description: Expert guidance for fine-tuning LLMs with LLaMA-Factory - WebUI no-code, 100+ models, 2/3/4/5/6/8-bit QLoRA, multimodal support
version: 1.0.0
author: Orchestra Research
license: MIT
tags: [Fine-Tuning, LLaMA Factory, LLM, WebUI, No-Code, QLoRA, LoRA, Multimodal, HuggingFace, Llama, Qwen, Gemma]
dependencies: [llmtuner, torch, transformers, datasets, peft, accelerate, gradio]
---
# Llama-Factory 技能

为 llama-factory 开发提供全面协助，基于官方文档生成。

## 何时使用此技能

在以下情况下应触发此技能：
- 使用 llama-factory 进行开发
- 询问 llama-factory 的功能或 API
- 实现 llama-factory 解决方案
- 调试 llama-factory 代码
- 学习 llama-factory 最佳实践

## 快速参考

### 常见模式

*随着技能的使用，将逐步添加快速参考模式。*

## 参考文件

此技能在 `references/` 中包含全面的文档：

- **_images.md** -  图像文档
- **advanced.md** - 高级文档
- **getting_started.md** - 入门文档
- **other.md** - 其他文档

当需要详细信息时，使用 `view` 读取特定参考文件。

## 使用此技能

### 针对初学者
从 getting_started 或 tutorials 参考文件开始，了解基础概念。

### 针对特定功能
使用相应的类别参考文件（api、guides 等）获取详细信息。

### 针对代码示例
上方的快速参考部分包含从官方文档中提取的常见模式。

## 资源

### references/
从官方来源提取并整理好的文档。这些文件包含：
- 详细的说明
- 带有语言标注的代码示例
- 指向原始文档的链接
- 用于快速导航的目录

### scripts/
在此处添加用于常见自动化任务的辅助脚本。

### assets/
在此处添加模板、样板代码或示例项目。

## 注意事项

- 此技能由官方文档自动生成
- 参考文件保留了源文档的结构和示例
- 代码示例包含语言检测，以实现更好的语法高亮
- 快速参考模式提取自文档中的常见用法示例

## 更新

要使用更新的文档刷新此技能：
1. 使用相同的配置重新运行抓取器
2. 技能将使用最新信息重新构建
