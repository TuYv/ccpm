---
name: research
description: Research a topic thoroughly and produce a structured report saved to Basic Memory - investigate concepts, gather context, and document findings
---
# 研究

此技能有助于对某个主题开展深入研究，并生成结构化报告，将其保存到 Basic Memory 中以供日后参考。

## 何时使用

在以下情况下使用此技能：
- 用户要求研究或调查某件事
- 用户希望理解某个概念、技术或方法
- 用户需要在做出决策前收集背景信息
- 用户询问“……是什么”“……如何运作”“探索……”“调查……”
- 用户希望将研究结果记录下来以供日后使用
- 出现“研究这个”“深入了解”“查明……”“探索……的可选方案”等表达

## 研究流程

### 1. 理解研究问题

明确具体需要调查的内容：
- 核心问题或主题是什么？
- 范围如何——是概览还是深入探究？
- 是否有需要重点关注的特定方面？
- 研究结果将用于什么目的（决策、实施、理解）？

### 2. 收集信息

使用可用工具收集信息：

**对于代码库研究：**
- 在代码库中搜索相关代码
- 阅读文档和注释
- 追踪各部分之间的连接方式
- 查看测试以获取用法示例

**对于概念研究：**
- 使用网页搜索获取最新信息
- 从官方来源获取文档
- 查找示例和最佳实践
- 在相关情况下比较替代方案

**对于 Basic Memory 上下文：**
```python
# Check what we already know
mcp__basic-memory__search_notes(
    query="topic keywords",
    project="main"
)

# Build context from related notes
mcp__basic-memory__build_context(
    url="memory://related-topic",
    depth=2,
    project="main"
)
```

### 3. 分析与综合

将研究结果整理为连贯的见解：
- 识别关键概念及其相互关系
- 记录模式、权衡因素和注意事项
- 突出显示与用户需求最相关的内容
- 标记不确定之处或需要进一步调查的领域

### 4. 生成报告

创建结构化研究报告：

```markdown
---
title: "Research: [Topic]"
type: research
tags:
- research
- [topic-tags]
---

# Research: [Topic]

## Summary

[2-3 sentence executive summary of findings]

## Research Question

[What we set out to understand]

## Key Findings

### [Finding 1]
[Details, evidence, implications]

### [Finding 2]
[Details, evidence, implications]

### [Finding 3]
[Details, evidence, implications]

## Analysis

[Synthesis of findings - patterns, trade-offs, recommendations]

## Open Questions

- [Things that need more investigation]
- [Uncertainties or assumptions]

## Sources

- [Where information came from]
- [[Related Note]] - relevant prior knowledge

## Observations

- [finding] Key insight discovered #research
- [pattern] Pattern identified during research
- [recommendation] Suggested approach based on findings

## Relations

- researches [[Topic]]
- informs [[Decision or Implementation]]
- relates-to [[Related Concepts]]
```

### 5. 保存到 Basic Memory

```python
mcp__basic-memory__write_note(
    title="Research: [Topic]",
    content="[Full report content]",
    folder="research",  # placement skill may override based on project conventions
    tags=["research", "topic-tags"],
    project="main"
)
```

`placement` 技能会在写入前自动运行（通过 PreToolUse hook），并且可能会调整 `folder`，以匹配 `basic-memory.md` 中定义的项目约定。

## 报告风格

根据研究类型进行调整：

### 快速调查
- 聚焦式摘要
- 2-3 项关键发现
- 直接给出建议
- 保存到 `research/` 文件夹

### 深入研究
- 全面分析
- 多个章节
- 详细证据
- 方案比较
- 保存到 `research/` 文件夹

### 决策支持
- 对选项进行评估
- 每个选项的优缺点
- 给出明确建议及理由
- 保存到 `decisions/` 或 `research/` 文件夹

### 技术探索
- 工作原理
- 架构/设计
- 代码示例
- 集成注意事项
- 保存到 `research/` 文件夹

## 最佳实践

1. **从已知信息开始** - 检查 Basic Memory 中的现有上下文
2. **全面但聚焦** - 充分涵盖主题，同时避免偏离重点
3. **引用来源** - 链接到信息来源
4. **如实说明不确定性** - 标明不清楚或需要验证的内容
5. **确保可执行** - 在适当情况下提供建议
6. **链接相关知识** - 与现有笔记建立关联
7. **保存以供日后参考** - 始终将报告保存到 Basic Memory

## 对话示例

**用户：**“研究其他项目如何处理数据库迁移”

**Claude：**
1. 在代码库中搜索迁移模式
2. 检查 Basic Memory 中的相关决策
3. 在线查找最佳实践
4. 生成方案对比报告
5. 保存到 `research/Database Migration Approaches.md`
6. 展示摘要和建议

**用户：**“调查 MCP 协议”

**Claude：**
1. 获取 MCP 文档
2. 在代码库中搜索示例
3. 检查 Basic Memory 中的先前上下文
4. 生成关于 MCP 的综合报告
5. 保存到 `research/MCP Protocol Overview.md`
6. 介绍关键概念及其使用方法

**用户：**“研究 API 的身份验证选项”

**Claude：**
1. 研究常见的身份验证模式（JWT、OAuth、API 密钥）
2. 检查代码库中现有的身份验证实现
3. 评估适用于该用例的权衡因素
4. 生成决策支持报告
5. 保存到 `research/API Authentication Options.md`
6. 给出建议方案及理由