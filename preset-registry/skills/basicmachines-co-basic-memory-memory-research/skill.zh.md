---
name: memory-research
description: "Research an external subject using web search, synthesize findings into a structured Basic Memory entity. Use when asked to research a company, person, technology, or topic — or when a bare name or URL is provided that implies a research request."
---
# 记忆研究

研究一个外部主题，综合整理所发现的信息，并在获得用户批准后创建结构化的 Basic Memory 实体。

## 使用时机

**显式触发方式：**
- “研究 [主题]”
- “查找 [主题]”
- “你对 [主题] 了解多少？”
- “评估 [主题]”

**隐式触发方式（也会激活此技能）：**
- 仅提供一个名称：“Terraform”
- 一个 URL：“https://example.com”
- 带有上下文的名称：“Acme Corp — 在会议上见过他们”

## 工作流程

### 第 1 步：Web 研究

跨多个来源搜索最新信息。建议进行 3-5 次搜索，以形成全面的认识：

```
[subject name] site
[subject name] overview
[subject name] news [current year]
[subject name] [relevant domain keywords]
```

**按实体类型需要收集的信息：**

| 实体类型 | 关键信息 |
|-------------|----------------|
| **组织** | 业务内容、产品/服务、发展阶段（初创/成长/上市）、融资情况、领导团队、总部、员工人数、重要合作伙伴关系或合同 |
| **人物** | 当前职位、所属组织、背景、专业领域、重要工作、公开影响力 |
| **技术** | 功能、维护者、成熟度、生态系统、替代方案、采用情况 |
| **主题/领域** | 定义、当前状态、主要参与者、趋势、与用户情境的相关性 |

### 第 2 步：检查现有知识

在提出创建新实体之前，先搜索 Basic Memory：

```python
search_notes(query="Acme Corp")
search_notes(query="acme")
```

尝试不同的名称形式——全称、缩写、首字母缩略词、域名。

如果实体已存在：
- 将在 Basic Memory 中找到的内容与 Web 研究结果一并报告
- 提议使用新信息更新现有笔记
- 使用 `edit_note` 追加新的观察结果或更新已过时的信息

如果实体不存在，则继续进行评估。

### 第 3 步：评估并总结

以结构化摘要的形式呈现研究结果。按章节组织并包含所有相关信息：

```markdown
## [Subject Name]

**Type:** [Organization / Person / Technology / Topic]

**Summary:** [2-4 sentences: what this is, why it matters, key distinguishing facts]

**Key Details:**
- [Organized by what's relevant for the entity type]
- [Stage, funding, leadership for orgs]
- [Role, expertise, affiliations for people]
- [Maturity, ecosystem, alternatives for tech]

**Relevance:** [Why this matters to the user — connection to their work, domain, or interests.
If no obvious connection: "No specific connection identified."]

**Sources:**
- [URLs of key sources consulted]
```

### 评估准则

**使用保留性措辞。** Web 研究只是某一时点的信息快照，并非绝对事实：
- “似乎是”“根据公开信息”“估计”
- “截至 [日期]”“根据 [来源]”
- 除非引用的是一手来源，否则切勿将融资金额、员工人数或营收表述为精确数据

**不要捏造。** 如果无法获取相关信息，请明确说明：
- “领导团队信息未公开”
- “融资详情未披露”

**让用户定义相关性。** 不要强加固定的评估框架。相反，应突出事实，让用户自行得出结论。如果用户有特定的评估标准（战略契合度、购买/合作/竞争等），他们会告诉你——在被要求时应用该标准。

### 第 4 步：提议创建实体

展示摘要后，请求用户批准：

```
Create Basic Memory entity for [Subject]?
  Location: [suggested-folder]/[entity-name].md
  Type: [entity type]

  [yes / no / modify]
```

如果用户在请求中提供了上下文（“在会议上见过他们”），请将该上下文包含在提议创建的实体中。

### 第 5 步：创建实体

获得批准后，创建结构化笔记。根据实体类型调整模板：

#### 组织

```python
write_note(
  title="Acme Corp",
  directory="organizations",
  note_type="organization",
  tags=["organization", "relevant-tags"],
  content="""# Acme Corp

## Overview
[2-3 sentence description from research]

## Products & Services
- [Key offerings discovered in research]

## Background
**Stage:** [Startup / Growth / Public]
**Headquarters:** [Location]
**Employees:** [Estimate, hedged]
**Leadership:** [Key people if found]
**Founded:** [Year if found]

## Observations
- [relevance] Why this entity matters in user's context
- [source] Researched on YYYY-MM-DD
- [additional observations from research findings]

## Relations
- [Link to related entities already in the knowledge graph]"""
)
```

#### 人物

```python
write_note(
  title="Jane Smith",
  directory="people",
  note_type="person",
  tags=["person", "relevant-tags"],
  content="""# Jane Smith

## Overview
[Current role and affiliation. Brief background.]

## Background
**Role:** [Title at Organization]
**Expertise:** [Key domains]
**Notable:** [Publications, talks, projects if found]

## Observations
- [role] Title at Organization
- [expertise] Key technical or domain expertise
- [source] Researched on YYYY-MM-DD

## Relations
- works_at [[Organization]]"""
)
```

#### 技术

```python
write_note(
  title="Technology Name",
  directory="concepts",
  note_type="concept",
  tags=["concept", "technology", "relevant-tags"],
  content="""# Technology Name

## Overview
[What it is and what problem it solves]

## Key Details
**Maintained by:** [Organization or community]
**Maturity:** [Experimental / Stable / Mature]
**License:** [If applicable]
**Alternatives:** [Comparable tools or approaches]

## Observations
- [definition] What this technology does in one sentence
- [maturity] Current state and adoption level
- [source] Researched on YYYY-MM-DD

## Relations
- [Link to related concepts, tools, or projects in the knowledge graph]"""
)
```

可自由调整这些模板。关键要素包括：note_type/tags 参数、概述、结构化详细信息、带类别的观察记录以及关系。

### 第 6 步：存储来源上下文

如果用户在请求中提供了上下文，请将其记录在实体中：

```python
# User said: "Acme Corp — saw their demo at the conference last week"
edit_note(
  identifier="Acme Corp",
  operation="append",
  section="Observations",
  content="- [context] Saw their demo at conference, week of 2026-02-17"
)
```

这些上下文通常是最有价值的部分——它体现了用户与该实体的关系，而这是网络研究无法提供的。

## 指南

- **始终进行网络搜索。** 不要仅依赖训练数据。研究结果应反映当前且可验证的信息。
- **首先搜索 Basic Memory。** 创建新实体之前，先检查是否已有相关实体。应更新现有实体，而不是重复创建。
- **对不确定的信息使用保留性表述。** 对估算、未经核实的说法和推断出的细节使用限定语。
- **保存来源 URL。** 在观察记录或 Sources 部分中包含你查阅过的 URL。这样用户便可进行核实和深入了解。
- **创建前先获得批准。** 展示你的研究结果，让用户决定是否创建该实体以及应包含哪些内容。
- **记录用户上下文。** 如果用户告诉了你进行研究的*原因*（例如在会议上见过、正在评估是否将其作为供应商等），这些上下文应写入实体。
- **不要过度研究。** 通常进行 3-5 次网络搜索就足够了。目标是创建一个有用的知识图谱条目，而不是一份详尽无遗的报告。
- **链接到现有知识。** 将新实体与知识图谱中已有的内容关联起来。连接会产生复利价值。