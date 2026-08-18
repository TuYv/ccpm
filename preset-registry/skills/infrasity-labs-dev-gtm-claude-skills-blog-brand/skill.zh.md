---
name: blog-brand
description: >
  Establish durable brand and voice context for cross-skill consumption.
  Generates BRAND.md (audience, positioning, do/don't editorial rules, taboo
  phrases, competitor differentiation) and VOICE.md (existing persona JSON
  re-expressed as readable prose), both written to the project root. When
  present, all blog sub-skills auto-load these files before writing or
  reviewing. Pairs with blog-persona, which manages the structured persona
  JSON. Use when user says "blog brand", "create brand context", "brand
  voice doc", "BRAND.md", "VOICE.md", "establish editorial brand",
  "brand guidelines for blog".
user-invokable: true
argument-hint: "[init|show|update]"
---
# 博客品牌：持久化编辑上下文

生成两个位于项目根目录的文件；这些文件存在时，每个博客子技能都会自动加载：

- `BRAND.md`：受众是谁、品牌代表什么、绝不能说什么
- `VOICE.md`：品牌在结构和用词上的表达方式

它们提供持久化的编辑上下文，可跨会话保留并传播到每个命令。

## 为什么需要此功能

目前，来自 `blog-persona` 的 persona JSON 仅由部分技能加载，其他技能则不会加载。主题集群上下文存放在集群资料库中。竞品定位信息无处存放。每个博客命令都会根据自身拥有的上下文，重新推导“品牌是什么”。

`BRAND.md` 和 `VOICE.md` 解决了这个问题：它们提供单一的权威来源，由 `blog` 编排器在每个命令开始时加载。

当这两个文件都不存在时，行为保持不变。向后兼容。

## 命令

| 命令 | 用途 |
|---|---|
| `/blog brand init` | 进行交互式访谈，并将 BRAND.md 和 VOICE.md 写入项目根目录 |
| `/blog brand show` | 显示当前内容（或报告文件缺失） |
| `/blog brand update` | 以当前值作为默认值，重新进行访谈 |

## 初始化工作流

执行包含 5 个步骤的交互式访谈。逐步提问，等待回答后再继续。如果 `blog-persona` JSON 已存在，则使用其中的数据预填充语调答案。

### 第 1 步：受众

询问：
- **主要受众角色**（例如，“拥有 50 至 500 名员工的 B2B SaaS 企业的营销负责人”）
- **次要受众**（可选）
- **读者专业水平**：初级 / 中级 / 高级 / 混合
- **读者正在积极尝试解决的问题**（3 至 5 个要点）
- **受众常见的误解**（用于确定信息增益的基点）

### 第 2 步：定位

询问：
- **一句话品牌使命**（品牌帮助人们完成什么）
- **独特观点**（塑造内容的逆向或非显而易见的理念）
- **这个品牌不是什么**（反向定位，绝不能与什么混淆）
- **排名前 3 的直接竞争对手**，以及相对于每个竞争对手的一句话差异化说明

### 第 3 步：编辑规则

询问：
- **要做事项列表**（博客始终会做的 3 至 7 件事；例如，“仅引用一手来源”“点出从业者而非产品的名称”）
- **禁止事项列表**（博客绝不会做的 3 至 7 件事；例如，“不使用标题党标题”“不用清单式文章的填充内容”）
- **禁忌用语**（该品牌绝不使用的特定词语或短语；这是对 AI 检测禁用词列表的补充，但与其相互独立）
- **必要披露**（例如，联盟营销披露、AI 内容披露、利益冲突披露模式）

### 第 4 步：主题边界

询问：
- **完全在范围内的主题**（核心内容支柱）
- **部分在范围内的主题**（相邻主题；仅在有原创角度时涉及）
- **范围外的主题**（不会涉及；引导至合作伙伴内容）
- **固定形式 / 专栏名称**（如有；例如，“每月一线笔记”“读者问答”）

### 第 5 步：语调（如果存在 blog-persona，则自动填充）

询问：
- **代词立场**：第一人称（我们 / 我）、第二人称（你）、第三人称（团队）或混合使用
- **可接受的缩略形式**：全部 / 部分 / 不使用
- **句子长度上限**：每句话的最大单词数，作为硬性上限
- **段落长度上限**：每段的最大单词数（默认 150）
- **优先采用的标题模式**：数字型 / 问题型 / 承诺型 / 陈述型
- **应避免的标题模式**：该品牌禁用的任何模式
- **摘要框标签**：沿用 blog-persona 中的标签，或选择一个标签

## 输出文件

### BRAND.md 模板

写入项目根目录，格式如下：

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

写入项目根目录，格式如下：

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
2. 如果两者都存在，则输出摘要表（仅包含关键部分）和文件路径。
3. 如果缺少其中一个或两个，则输出缺少的文件，并建议运行 `/blog brand init`。

## 更新工作流

与初始化相同，但会使用当前值预填每个答案。用户可以按 Enter 接受，也可以输入新值。收集完所有答案后，使用新内容覆盖这两个文件，并更新 `Last updated:` 行。

## 与博客编排器的集成

当运行 `/blog write`、`/blog rewrite`、`/blog brief`、`/blog outline`、`/blog calendar` 或 `/blog strategy` 时，编排器（`skills/blog/SKILL.md`）会检查项目根目录中是否存在 `BRAND.md` 和 `VOICE.md`。如果存在，其内容会被注入下游代理（`blog-researcher`、`blog-writer`、`blog-seo`、`blog-reviewer`）的系统提示词中。

如果不存在，则行为保持不变。编排器不会提示用户创建这些文件；它们是可选启用的上下文。

## 与 blog-persona 的关系

| 关注点 | blog-persona | blog-brand |
|---|---|---|
| 用于编程调用的结构化人物画像 JSON | 是 | 否 |
| 用于跨 Skill 提示词的可读品牌上下文 | 否 | 是 |
| 受众与定位 | 否 | 是 |
| 禁用短语与编辑禁忌 | 部分涵盖（禁忌列表） | 完整涵盖（禁忌事项 + 披露要求 + 范围） |
| 竞品差异化 | 否 | 是 |
| 主题边界 | 否 | 是 |
| 文风指纹（语气调节参数） | 是（权威来源） | 镜像（只读） |

`blog-brand` 不会取代 `blog-persona`，而是使用它。人物画像 JSON 仍是语气维度、句子长度分布和缩写词使用频率的事实来源。`VOICE.md` 会镜像其中可读的部分，使提示词能够自成一体。

如果运行 `/blog brand init` 时不存在人物画像，语气相关问题仍会生成 `VOICE.md`。希望以编程方式强制执行这些规则的用户可以随后运行 `/blog persona create`。

## 错误处理

- **项目根目录不明确**：询问用户应将文件写入何处。默认使用当前工作目录。
- **初始化时文件已存在**：询问是覆盖文件，还是改为运行更新。
- **引用的人物画像缺失**：询问是将人物画像引用留空，还是创建一个。
- **读者提供的回答过于简略**：提示其至少提供 2 条受众要点和 3 条编辑规则；拒绝写入仅含框架的内容。