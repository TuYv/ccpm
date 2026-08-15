---
name: teams-channel-post-writer
description: Creates educational Teams channel posts for internal knowledge sharing about Claude Code features, tools, and best practices. Applies when writing posts, announcements, or documentation to teach colleagues effective Claude Code usage, announce new features, share productivity tips, or document lessons learned. Provides templates, writing guidelines, and structured approaches emphasizing concrete examples, underlying principles, and connections to best practices like context engineering. Activates for content involving Teams posts, channel announcements, feature documentation, or tip sharing.
---
# Teams 频道帖子撰写器

## 概述

为关于 Claude Code 功能和最佳实践的内部知识分享创建结构清晰、具有教育意义的 Teams 频道帖子。本技能提供模板、写作指南和结构化工作流，用于产出一致且可操作的内容，帮助同事学习如何有效使用 Claude Code。

## 何时使用本技能

在创建用于以下目的的 Teams 频道帖子时，本技能会被激活：
- 宣布并解释 Claude Code 的新功能
- 分享 Claude Code 技巧和最佳实践
- 讲解有效的提示模式和工作流
- 将功能与更广泛的工程原则联系起来（例如上下文工程）
- 记录使用 Claude Code 时总结的经验教训

## 工作流

### 1. 了解主题

收集与写作主题相关的信息：
- 使用官方文档全面研究相关功能/主题
- 通过变更日志核实发布日期和版本号
- 确定帖子应传达的核心收益或原则
- 收集实际使用中的具体示例

**研究检查清单：**
- [ ] 已找到官方发布日期/版本号
- [ ] 已通过测试或文档验证功能行为
- [ ] 已确定要链接的权威来源
- [ ] 已理解背后的原则或最佳实践

### 2. 规划内容

根据 `references/writing-guidelines.md` 中的写作指南，规划：
- **引子**：该主题有哪些新内容或重要之处？
- **核心原则**：该主题体现了什么最佳实践？
- **示例**：哪些具体提示或工作流可以展示这一点？
- **行动号召**：读者接下来应该尝试什么？

### 3. 使用模板起草

从 `assets/post-template.md` 中的模板开始，并填写：

1. **标题**：使用一个表情符号和清晰的描述
2. **引言**：包含发布日期和简要背景
3. **它是什么**：用 1-2 句话进行说明
4. **如何使用**：通过明确的说明展示“普通做法与更佳做法”模式
5. **为何使用**：结合 4 项关键收益解释背后的原则
6. **示例**：提供 3 个以上真实、具体的提示
7. **选项/设置**：列出关键配置或参数
8. **行动号召**：以可执行的下一步作为结尾
9. **了解更多**：链接到权威资源

### 4. 应用写作指南

根据 `references/writing-guidelines.md` 中的质量检查清单审阅草稿：
- 采用具有教育意义且乐于助人的语气
- 使用“普通做法/更佳做法”模式（而不是“错误/正确”）
- 提供具体、真实的示例
- 结合原则解释“为什么”
- 使用项目符号和格式建立清晰的结构
- 事实和日期均已核实

### 5. 保存并分享

将最终帖子保存到团队的文档位置，并使用描述性文件名，例如 "Claude Code Tips.md" 或 "[Topic Name].md"

## 关键原则

### 展示，而不只是讲述
始终包含用户可以调整使用的具体示例。使用“普通做法与更佳做法”的对比来展示改进，同时避免让读者感到被批评。

### 联系原则
不要只描述功能，还要解释背后的最佳实践。例如，将 Explore agent 与上下文工程中的“上下文卸载”原则联系起来。

### 确保可操作性
明确说明调用模式。用户应能够复制/粘贴示例并立即使用。

### 验证所有内容
始终调研发布日期、验证功能行为，并链接到权威来源。准确性能够建立信任。

## 资源

### references/writing-guidelines.md
全面的写作指南，包括：
- 语气和风格标准
- 不同帖子类型的结构模式
- 格式约定
- 调研要求
- 质量检查清单

有关语气、结构和质量标准的详细指导，请参阅此文件。

### assets/post-template.md
可直接使用的 Markdown 模板，包含以下内容的占位结构：
- 标题和介绍
- 功能说明
- 使用示例
- 优势和原则
- 选项和设置
- 行动号召和资源

复制此模板作为新帖子的起点，然后在保持这一成熟结构的同时自定义内容。