---
name: blog-brand
description: >
  Establish durable brand and voice context for cross-skill consumption.
  Generates BRAND.md (audience, positioning, do/don't editorial rules, taboo
  phrases, competitor differentiation) and VOICE.md (existing persona JSON
  re-expressed as readable prose), both written to the project root. When
  present, the blog orchestrator auto-loads these files for write, rewrite,
  brief, outline, calendar, and strategy workflows. Pairs with blog-persona, which manages the structured persona
  JSON. Use when user says "blog brand", "create brand context", "brand
  voice doc", "BRAND.md", "VOICE.md", "establish editorial brand",
  "brand guidelines for blog".
user-invokable: true
argument-hint: "[init|show|update]"
license: MIT
---
# 博客品牌：持久化编辑语境

生成两个项目根目录文件。当这些文件存在时，博客编排器会针对受支持的写作和规划命令自动加载它们：

- `BRAND.md`：受众是谁、品牌主张什么、绝不能说什么
- `VOICE.md`：品牌在结构和措辞上的表达方式

它们在编辑工作中相当于 Impeccable 的 PRODUCT.md / DESIGN.md 模式：一种能够跨会话保留并传播到每条命令的持久化语境。

## 为什么需要它

目前，部分技能会加载来自 `blog-persona` 的 persona JSON，其他技能则不会。主题集群语境位于集群资料库中。竞品定位没有任何存放位置。每条博客命令都会根据各自拥有的语境，重新推导“品牌是什么”。

`BRAND.md` 和 `VOICE.md` 解决了这个问题：它们作为唯一的规范来源，由 `blog` 编排器在每条命令开始时加载。

如果两个文件都不存在，则行为与 v1.7.1 相比保持不变。向后兼容。

## 命令

| 命令 | 用途 |
|---|---|
| `/blog brand init` | 进行交互式访谈，并将 BRAND.md 和 VOICE.md 写入项目根目录 |
| `/blog brand show` | 显示当前内容（或报告文件缺失） |
| `/blog brand update` | 以当前值作为默认值，重新进行访谈 |

## 初始化工作流

进行包含 5 个步骤的交互式访谈。逐步提问，等待回答后再继续。如果 `blog-persona` JSON 已存在，则使用其中的数据预填表达风格相关的答案。

### 第 1 步：受众

询问：
- **主要受众角色**（例如，“一家拥有 50 至 500 名员工的 B2B SaaS 公司的营销负责人”）
- **次要受众**（可选）
- **读者专业水平**：初级 / 中级 / 高级 / 混合
- **读者正在积极尝试解决的问题**（3 至 5 个要点）
- **受众常见的误解**（用于确定信息增益的基准）

### 第 2 步：定位与规范实体

询问：
- **官方实体名称**（法定名称或公开品牌名称）
- **主页 URL**（品牌的规范入口）
- **Logo URL 或文件路径**（优先使用正方形或 SVG 资源）
- **sameAs 资料页**（LinkedIn、X、YouTube、Crunchbase、GitHub 或其他官方资料页）
- **Wikidata Q-ID**（如果存在）；如果知名度不足则留空
- **一句话品牌使命**（品牌帮助人们完成什么）
- **独特观点**（塑造内容的逆向或非显而易见的理念）
- **这个品牌不是什么**（反向定位，绝不能与什么混淆）
- **排名前 3 的直接竞争对手**，以及与每个竞争对手相比的一句话差异化说明

### 第 3 步：编辑规则

询问：
- **应做事项清单**（博客始终会做的 3 至 7 件事；例如，“仅引用一手来源”“提及从业者而非产品”）
- **禁做事项清单**（博客绝不会做的 3 至 7 件事；例如，“不使用标题党式标题”“不用清单体填充内容”）
- **禁忌措辞**（该品牌绝不使用的特定词语或短语；与代码仓库中可选的项目风格清单分开）
- **必要披露**（例如联盟营销披露、AI 内容披露、利益冲突相关披露模式）

### 第 4 步：主题边界

询问：
- **完全属于范围内的主题**（核心内容支柱）
- **部分属于范围内的主题**（相邻主题；仅在具备原创角度时覆盖）
- **范围外的主题**（不会覆盖；引导至合作伙伴内容）
- **固定形式/栏目名称**（如有）（例如“Monthly Field Notes”“Reader Q&A”）

### 第 5 步：语调（如存在 blog-persona，则自动填充）

询问：
- **代词立场**：第一人称（we / I）、第二人称（you）、第三人称（the team）或混合使用
- **可接受的缩略形式**：全部/部分/不使用
- **句子长度上限**：每个句子的最大词数，作为硬性限制
- **段落长度上限**：每个段落的最大词数（默认 150）
- **优先采用的标题模式**：数字式/疑问式/承诺式/陈述式
- **应避免的标题模式**：该品牌禁止使用的任何模式
- **摘要框标签**：从 blog-persona 获取，或选择一个

## 输出文件

### BRAND.md 模板

写入项目根目录，内容如下：

```markdown
# Brand Context

> This file is auto-loaded by all blog sub-skills. Last updated: YYYY-MM-DD.

## Audience

- **Primary**: [role + context]
- **Secondary**: [if any]
- **Expertise**: [level]
- **Active problems**:
  - [problem 1]
  - [problem 2]
  - [problem 3]
- **Common misconceptions**:
  - [misconception 1]
  - [misconception 2]

## Positioning

- **Official entity name**: [brand/entity]
- **Homepage**: [canonical URL]
- **Logo**: [URL or file path]
- **sameAs profiles**:
  - [profile URL 1]
  - [profile URL 2]
- **Wikidata Q-ID**: [QID or none]
- **Mission**: [one sentence]
- **Distinctive POV**: [contrarian or non-obvious belief]
- **What we are NOT**: [anti-positioning]
- **Competitors**:
  - [Competitor A]: [our one-line differentiator]
  - [Competitor B]: [our one-line differentiator]
  - [Competitor C]: [our one-line differentiator]

## Editorial Rules

### Always do
- [rule 1]
- [rule 2]
- [rule 3]

### Never do
- [rule 1]
- [rule 2]
- [rule 3]

### Taboo phrases
- [phrase 1]
- [phrase 2]

### Required disclosures
- [disclosure rule]

## Topic Scope

- **In scope**: [pillars]
- **Partial scope**: [adjacent topics]
- **Out of scope**: [topics to refuse]
- **Recurring formats**: [if any]
```

### VOICE.md 模板

写入项目根目录，内容如下：

```markdown
# Voice Context

> This file is auto-loaded by all blog sub-skills. Last updated: YYYY-MM-DD.

## Pronoun stance
[first-person / second-person / third-person / mixed]

## Lexical rules
- **Contractions**: [full / partial / none]
- **Sentence ceiling**: [N words max]
- **Paragraph ceiling**: [N words max, default 150]
- **Summary label**: [Key Takeaways / TL;DR / etc.]

## Headline patterns
- **Favor**: [list]
- **Avoid**: [list]

## Voice fingerprint (from blog-persona)
- Funny vs serious: [0.0 to 1.0]
- Formal vs casual: [0.0 to 1.0]
- Respectful vs irreverent: [0.0 to 1.0]
- Enthusiastic vs matter-of-fact: [0.0 to 1.0]

## Readability target
- Audience tier: [consumer / professional / technical]
- Flesch Grade: [range]
- Flesch Ease: [range]

## Reference samples
- [URL 1] (extracted patterns: [summary])
- [URL 2] (extracted patterns: [summary])
```

## 查看工作流

1. 检查项目根目录中是否存在 `BRAND.md` 和 `VOICE.md`。
2. 如果两者都存在，则输出摘要表格（仅包含关键部分）和文件路径。
3. 如果缺少其中一个或两个，则输出缺少哪些文件，并建议运行 `/blog brand init`。

## 更新工作流

与初始化流程相同，但会使用当前值预填每个答案。用户可以按 Enter 键接受，也可以输入新值。收集完所有答案后，使用新内容覆盖这两个文件，并更新 `Last updated:` 行。

## 与博客编排器的集成

运行 `/blog write`、`/blog rewrite`、`/blog brief`、`/blog outline`、`/blog calendar` 或 `/blog strategy` 时，编排器（`skills/blog/SKILL.md`）会检查项目根目录中是否存在 `BRAND.md` 和 `VOICE.md`。如果存在，其内容会被注入下游智能体（`blog-researcher`、`blog-writer`、`blog-seo`、`blog-reviewer`）的系统提示词中。

如果不存在，则行为保持不变。编排器不会提示用户创建这些文件；它们是可选择启用的上下文。

## 与 blog-persona 的关系

| 关注点 | blog-persona | blog-brand |
|---|---|---|
| 用于程序化使用的结构化角色 JSON | 是 | 否 |
| 用于跨 Skill 提示词的可读品牌上下文 | 否 | 是 |
| 受众与定位 | 否 | 是 |
| 禁用短语和编辑禁忌 | 部分（禁用列表） | 完整（禁忌 + 披露要求 + 范围） |
| 竞品差异化 | 否 | 是 |
| 主题边界 | 否 | 是 |
| 语言风格指纹（语气滑块） | 是（权威来源） | 镜像（只读） |

`blog-brand` 不会取代 `blog-persona`；它会使用后者。角色 JSON 仍是语气维度、句长分布和缩写词使用频率的事实来源。`VOICE.md` 会镜像其中便于阅读的部分，使提示词能够自包含。

如果运行 `/blog brand init` 时不存在角色，语言风格问题仍会生成 `VOICE.md`。希望进行程序化约束的用户可以随后运行 `/blog persona create`。

## 错误处理

- **项目根目录不明确**：询问用户应将文件写入何处。默认为当前工作目录。
- **初始化时文件已存在**：询问是覆盖文件，还是改为运行更新流程。
- **引用了角色但角色不存在**：询问是将角色引用留空，还是创建一个角色。
- **读者提供的答案过于简单**：提示其至少提供 2 条受众要点和 3 条编辑规则；拒绝写入仅含框架的文件。