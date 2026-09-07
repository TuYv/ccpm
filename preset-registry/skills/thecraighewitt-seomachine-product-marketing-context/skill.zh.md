---
name: product-marketing-context
version: 1.0.0
description: "When the user wants to create or update their product marketing context document. Also use when the user mentions 'product context,' 'marketing context,' 'set up context,' 'positioning,' or wants to avoid repeating foundational information across marketing tasks. Creates `.claude/product-marketing-context.md` that other marketing skills reference."
---
# 产品营销背景

你帮助用户创建并维护一份产品营销背景文档。它记录基础性的定位与信息传递内容，供其他营销技能引用，这样用户就不必重复说明。

该文档存储于 `.claude/product-marketing-context.md`。

## 工作流程

### 步骤 1：检查是否已有背景文档

首先，检查 `.claude/product-marketing-context.md` 是否已存在。

**如果已存在：**
- 读取并总结其中已记录的内容
- 询问用户想更新哪些部分
- 只针对这些部分收集信息

**如果不存在，提供两种选择：**

1. **从代码库自动起草**（推荐）：你将研究仓库——README、落地页、营销文案、package.json 等——并起草一版 V1 的背景文档。用户随后进行审阅、更正并补全缺口。这比从零开始更快。

2. **从零开始**：以对话方式逐一走完每个部分，一次收集一个部分的信息。

大多数用户更倾向于选项 1。展示草稿后，询问：“哪里需要更正？还缺什么？”

### 步骤 2：收集信息

**如果是自动起草：**
1. 阅读代码库：README、落地页、营销文案、关于页面、meta 描述、package.json、任何现有文档
2. 根据你的发现起草所有部分
3. 展示草稿并询问哪里需要更正或缺失了什么
4. 迭代直到用户满意

**如果是从零开始：**
以对话方式逐一走完下面每个部分，一次一个。不要一次性抛出所有问题。

对每个部分：
1. 简要说明当前正在收集什么
2. 提出相关问题
3. 确认准确性
4. 进入下一部分

**重要：** 坚持获取客户的原话。精确的措辞比润色过的描述更有价值。

---

## 需要收集的部分

### 1. 产品概览
- 一句话描述
- 产品做什么（2-3 句话）
- 产品类别（你处于哪个“货架”上——客户如何搜索到你）
- 产品类型（SaaS、市场平台、电商、服务等）
- 商业模式与定价

### 2. 目标受众
- 目标公司类型（行业、规模、阶段）
- 目标决策者（角色、部门）
- 主要用例（你解决的核心问题）
- 待完成任务（客户“雇用”你去做的 2-3 件事）
- 具体用例或场景

### 3. 人物角色（仅限 B2B）
如果购买过程涉及多个利益相关者，为每类角色记录：
- 使用者、拥护者、决策者、财务买家、技术影响者
- 每类角色关心什么、面临的挑战，以及你向他们承诺的价值

### 4. 问题与痛点
- 客户在找到你之前面临的核心挑战
- 为什么现有解决方案不够好
- 这让他们付出了什么代价（时间、金钱、机会）
- 情绪张力（压力、恐惧、怀疑）

### 5. 竞争格局
- **直接竞争者**：相同解决方案、相同问题（例如 Calendly vs SavvyCal）
- **次级竞争者**：不同解决方案、相同问题（例如 Calendly vs Superhuman 的日程安排功能）
- **间接竞争者**：相互冲突的方式（例如 Calendly vs 私人助理）
- 每一类在哪些方面无法满足客户

### 6. 差异化
- 关键差异化因素（替代方案所不具备的能力）
- 你如何以不同方式解决问题
- 为什么这样更好（收益）
- 客户为什么选择你而不是替代方案

### 7. 异议与反向画像
- 销售中听到的三大异议及应对方法
- 哪些人并不适合（反向画像）

### 8. 转换动态
JTBD 的四种作用力：
- **推力（Push）**：哪些挫败感驱使他们离开现有解决方案
- **拉力（Pull）**：哪些因素吸引他们选择你
- **习惯（Habit）**：哪些因素让他们困在现有做法中
- **焦虑（Anxiety）**：哪些顾虑让他们担心切换

### 9. 客户语言
- 客户如何描述问题（原话）
- 他们如何描述你的解决方案（原话）
- 应使用的词汇/短语
- 应避免的词汇/短语
- 产品专有术语表

### 10. 品牌语调
- 语气（专业、随意、俏皮等）
- 沟通风格（直接、对话式、技术性）
- 品牌个性（3-5 个形容词）

### 11. 佐证材料
- 可引用的关键指标或成果
- 知名客户/标识
- 客户证言片段
- 主要价值主题及支撑证据

### 12. 目标
- 主要业务目标
- 关键转化动作（你希望人们做什么）
- 当前指标（如果已知）

---

## 步骤 3：创建文档

收集完信息后，创建 `.claude/product-marketing-context.md`，结构如下：

```markdown
# Product Marketing Context

*Last updated: [date]*

## Product Overview
**One-liner:**
**What it does:**
**Product category:**
**Product type:**
**Business model:**

## Target Audience
**Target companies:**
**Decision-makers:**
**Primary use case:**
**Jobs to be done:**
-
**Use cases:**
-

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| | | | |

## Problems & Pain Points
**Core problem:**
**Why alternatives fall short:**
-
**What it costs them:**
**Emotional tension:**

## Competitive Landscape
**Direct:** [Competitor] — falls short because...
**Secondary:** [Approach] — falls short because...
**Indirect:** [Alternative] — falls short because...

## Differentiation
**Key differentiators:**
-
**How we do it differently:**
**Why that's better:**
**Why customers choose us:**

## Objections
| Objection | Response |
|-----------|----------|
| | |

**Anti-persona:**

## Switching Dynamics
**Push:**
**Pull:**
**Habit:**
**Anxiety:**

## Customer Language
**How they describe the problem:**
- "[verbatim]"
**How they describe us:**
- "[verbatim]"
**Words to use:**
**Words to avoid:**
**Glossary:**
| Term | Meaning |
|------|---------|
| | |

## Brand Voice
**Tone:**
**Style:**
**Personality:**

## Proof Points
**Metrics:**
**Customers:**
**Testimonials:**
> "[quote]" — [who]
**Value themes:**
| Theme | Proof |
|-------|-------|
| | |

## Goals
**Business goal:**
**Conversion action:**
**Current metrics:**
```

---

## 步骤 4：确认并保存

- 展示完成的文档
- 询问是否需要调整
- 保存到 `.claude/product-marketing-context.md`
- 告诉用户：“其他营销技能现在会自动使用这份背景。随时运行 `/product-marketing-context` 即可更新它。”

---

## 小贴士

- **要具体**：问“吸引他们找你的第一大挫败感是什么？”而不是“他们解决什么问题？”
- **记录原话**：客户的语言胜过润色的描述
- **索要例子**：“能举个例子吗？”能引出更好的回答
- **边做边验证**：总结每个部分并在继续之前确认
- **跳过不适用的部分**：并非每个产品都需要所有部分（例如 B2C 产品不需要人物角色）
