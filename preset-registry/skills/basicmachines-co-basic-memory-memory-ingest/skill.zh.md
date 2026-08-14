---
name: memory-ingest
description: "Process unstructured external input (meeting transcripts, conversation logs, pasted documents) into structured Basic Memory entities. Extracts entities, searches for existing matches, proposes new entities with approval, creates notes with observations and relations, and captures action items."
---
# 记忆摄取

将原始的非结构化输入转换为结构化的 Basic Memory 实体。会议记录、对话日志、粘贴的文档、电子邮件线程——任何包含值得保留的信息的内容都会被解析、与现有知识交叉引用，并写成规范的笔记。

## 使用时机

- 用户粘贴会议记录或对话日志
- 用户说“处理这些笔记”或“将其添加到 Basic Memory”
- 用户粘贴文档、文章或电子邮件，以便提取知识
- 任何需要将原始外部文本转化为结构化知识的时候

## 工作流概览

```
1. Parse raw input           → identify structure, extract key info
2. Extract entities          → people, orgs, topics, action items
3. Search existing entities  → multi-variation queries
4. Research new entities     → optional web research (see memory-research)
5. Present entity proposal   → get approval before creating
6. Create source note        → verbatim content + observations + relations
7. Create approved entities  → structured notes for each new entity
8. Extract action items      → follow-ups and commitments
```

## 第 1 步：解析原始输入

阅读粘贴的内容并识别其结构：

- **格式**：会议记录、电子邮件线程、对话日志、文章、自由格式笔记
- **日期**：事件发生的时间（从内容中提取或询问用户）
- **参与者**：参与人员（姓名、角色、组织）
- **章节**：任何已有结构（标题、发言者标签、时间戳）

不要改写或总结源内容。在笔记中逐字保留它——你将在其旁边添加结构化观察结果。

## 第 2 步：提取实体

扫描内容，找出值得在知识图谱中跟踪的实体：

| 实体类型 | 识别信号 |
|-------------|---------|
| **人物** | 提及的姓名及其角色、职称或所属机构 |
| **组织** | 公司名称、机构、组织 |
| **主题/概念** | 被实质性讨论的技术领域、方法论、标准 |
| **行动项** | 承诺、截止日期、“我会在 Y 之前完成 X”之类的陈述 |

**根据上下文推断类型。** 如果某人被介绍为“Acme Corp 的 CTO”，那么这同时对应一个人物实体和一个组织实体。如果某项技术被深入讨论，它可能值得作为一个概念实体。

**排除噪声。** 并非提到的每个名字都值得建立实体。筛选以下内容：
- 具有实质性角色或互动的人物（而非顺带提及）
- 在业务或技术语境中讨论的组织
- 具有足够细节、值得单独建立笔记的主题

## 第 3 步：搜索现有实体

对于每个提取出的实体，使用多种查询变体搜索 Basic Memory：

```python
# Person — try full name, last name
search_notes(query="Sarah Chen")
search_notes(query="Chen")

# Organization — try full name, abbreviation, acronym
search_notes(query="National Renewable Energy Laboratory")
search_notes(query="NREL")

# Topic — try the full term and keywords
search_notes(query="edge computing")
search_notes(query="edge inference")
```

将每个实体分类为：
- **Existing** — 已在 Basic Memory 中找到。将使用 `[[wiki-link]]` 链接到该实体。
- **Proposed** — 未找到。将提议创建，等待批准。

## 第 4 步：研究新实体（可选）

对于需要更多上下文的拟议实体，进行简短的网络搜索（每个实体最多 2-3 次查询）：

- **组织**：业务内容、规模、上市或非上市、主要产品
- **人物**：当前职位、背景、专业领域
- **主题**：简要定义、相关性

使用保留性措辞（“似乎是”“据估计”“根据公开信息”）。切勿编造细节。

此步骤为可选步骤——如果源材料已经提供了足够的上下文，或者用户时间紧迫，则跳过此步骤。有关更深入的研究工作流，请参阅 **memory-research** 技能。

## 第 5 步：提交实体提案

在创建任何内容之前，先展示你找到的实体以及希望创建的实体：

```
Entities found in Basic Memory:
  - [[Sarah Chen]] (Person — existing)
  - [[Acme Corp]] (Organization — existing)

Proposed new entities:
  - Jordan Rivera (Person — VP Engineering at NovaTech, mentioned as project lead)
  - NovaTech (Organization — SaaS platform, Series B, discussed as integration partner)
  - Federated Learning (Concept — core technical topic of the discussion)

Approve all / select individually / skip entity creation?
```

为每个拟议实体提供足够的上下文，以便用户快速做出决定。

## 第 6 步：创建源笔记

为摄取的内容创建主笔记。这是“所发生事件的记录”——它会保留原始材料并添加结构化元数据。

### 会议/对话笔记

```python
write_note(
  title="NovaTech Meeting - Jordan Rivera - Feb 22, 2026",
  directory="meetings/2026",
  note_type="meeting",
  tags=["meeting", "novatech", "federated-learning"],
  metadata={"date": "2026-02-22"},
  content="""
# NovaTech Meeting - Jordan Rivera - Feb 22, 2026

Brief one-sentence summary of what this meeting was about.

## Transcript
[Preserve all source content verbatim — do not summarize or rewrite]

## Observations
- [opportunity] NovaTech interested in integration partnership
- [insight] Their platform handles 10K concurrent sessions, relevant to our scale needs
- [next_step] Send technical spec document by Friday
- [sentiment] Strong enthusiasm from their engineering team
- [decision] Agreed to start with a proof-of-concept integration

## Relations
- attended [[Jordan Rivera]]
- with [[NovaTech]]
- discussed [[Federated Learning]]
- follow_up [[Send NovaTech Technical Spec]]
"""
)
```

### 文档/文章笔记

```python
write_note(
  title="Edge Computing Architecture Whitepaper",
  directory="references",
  note_type="reference",
  tags=["edge-computing", "architecture", "reference"],
  metadata={"source": "https://example.com/whitepaper.pdf", "date_ingested": "2026-02-22"},
  content="""
# Edge Computing Architecture Whitepaper

## Source Content
[Preserve relevant content — for long documents, include key sections rather than the entire text]

## Observations
- [key_finding] Latency drops 40% with edge inference vs cloud-only
- [technique] Model sharding across heterogeneous edge nodes
- [limitation] Requires minimum 8GB RAM per edge node

## Relations
- relates_to [[Edge Computing]]
- relates_to [[Model Optimization]]
"""
)
```

### 观察类别

使用能够体现信息性质的类别。摄取内容的常见类别：

| 类别 | 用途 |
|----------|---------|
| `opportunity` | 识别出的业务或合作机会 |
| `decision` | 已做出或达成一致的决定 |
| `insight` | 获得的非显而易见的理解 |
| `next_step` | 具体的行动项或后续事项 |
| `sentiment` | 表达出的热情、担忧或犹豫 |
| `risk` | 识别出的风险或问题 |
| `requirement` | 发现的要求或约束 |
| `key_finding` | 参考材料中的重要事实 |
| `technique` | 所描述的方法、途径或模式 |
| `context` | 以后可能有用的背景信息 |

根据需要创建类别——这些只是建议，并非固定列表。

## 第 7 步：创建已批准的实体

为用户批准的每个实体创建一条结构化笔记。将实体类型与适当的模板相匹配。

### 人物

```python
write_note(
  title="Jordan Rivera",
  directory="people",
  note_type="person",
  tags=["person", "novatech", "engineering"],
  content="""
# Jordan Rivera

## Overview
VP of Engineering at NovaTech. Met during integration partnership discussion.

## Background
[Role, expertise, context from meeting + any web research]

## Observations
- [role] VP Engineering at NovaTech
- [expertise] Distributed systems, federated learning
- [met] 2026-02-22 during integration discussion

## Relations
- works_at [[NovaTech]]
- discussed_in [[NovaTech Meeting - Jordan Rivera - Feb 22, 2026]]
"""
)
```

### 组织

```python
write_note(
  title="NovaTech",
  directory="organizations",
  note_type="organization",
  tags=["organization", "saas", "integration-partner"],
  content="""
# NovaTech

## Overview
SaaS platform company. Series B stage.
[Additional context from meeting + web research]

## Products & Services
[What they offer, if discussed or researched]

## Observations
- [stage] Series B, ~200 employees
- [relevance] Potential integration partner for our platform
- [first_contact] 2026-02-22

## Relations
- employs [[Jordan Rivera]]
- discussed_in [[NovaTech Meeting - Jordan Rivera - Feb 22, 2026]]
"""
)
```

### 概念 / 主题

```python
write_note(
  title="Federated Learning",
  directory="concepts",
  note_type="concept",
  tags=["concept", "machine-learning", "distributed-systems"],
  content="""
# Federated Learning

## Overview
[Brief description of the concept from the discussion context]

## Observations
- [definition] Machine learning approach where models train across decentralized data sources
- [relevance] Core technique discussed in NovaTech integration

## Relations
- discussed_in [[NovaTech Meeting - Jordan Rivera - Feb 22, 2026]]
"""
)
```

根据你的领域调整模板。关键要素包括：作为参数的类型和标签、概述部分、带类别的观察，以及链接回来源的关系。

## 第 8 步：提取行动项

检查源内容中的承诺和后续事项：

```
Action Items:
  - Send NovaTech technical spec document by Friday (your commitment)
  - Jordan will share their API documentation by next week (their commitment)

Follow-Up Reminders:
  - 1 week: Check if Jordan sent API docs
  - 2 weeks: Schedule follow-up call to discuss POC scope
```

如果使用 **memory-tasks** Skill，请为你的行动项创建 Task 笔记。否则，将它们作为观察记录在来源笔记中。

## 指南

- **逐字保留来源内容。** 原始文本是事实依据。结构和观察是叠加在其上的解读。
- **创建前先搜索。** 始终检查实体是否已存在（参见 memory-notes 的“创建前先搜索”模式）。使用新信息更新现有实体，而不是创建重复实体。
- **创建新实体前须获批准。** 展示拟创建的实体，并让用户决定要创建哪些实体。不要在用户不知情的情况下填充知识图谱。
- **推断，而非盘问。** 根据上下文提取实体类型和关系。只有在确实存在歧义时才询问用户。
- **有选择地创建实体。** 并非提及的每个名称都值得拥有单独的笔记。重点关注用户以后会希望再次引用的实体。
- **对调研信息使用保留性措辞。** Web 调研只是补充——不要将其表述为事实。使用“似乎是”“估计”“根据公开信息”等措辞。
- **将所有内容链接回来源。** 每个创建的实体都应关联回来源笔记。来源笔记应链接到讨论过的所有实体。
- **叙述文本与观察并用。** 同时包含叙述性上下文和结构化观察时，笔记效果最佳。叙述文本赋予内容含义并讲述来龙去脉；观察则使单个事实可被搜索。使用正文提供上下文，然后将关键事实提炼为分类观察。