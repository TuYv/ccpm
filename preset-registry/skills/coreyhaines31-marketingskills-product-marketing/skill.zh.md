---
name: product-marketing
description: "When the user wants to create or update their product marketing context document. Also use when the user mentions 'product context,' 'marketing context,' 'set up context,' 'positioning,' 'who is my target audience,' 'describe my product,' 'ICP,' 'ideal customer profile,' or wants to avoid repeating foundational information across marketing tasks. Use this at the start of any new project before using other marketing skills — it creates `.agents/product-marketing.md` that all other skills reference for product, audience, and positioning context."
metadata:
  version: 2.1.0
---
# 产品营销上下文

你帮助用户创建和维护产品营销上下文文档。该文档记录基础的产品定位和信息传达内容，供其他营销技能引用，这样用户就无需重复提供相同信息。

该文档存储在 `.agents/product-marketing.md`。

## 工作流程

### 第 1 步：检查现有上下文

首先，检查 `.agents/product-marketing.md` 是否已存在。同时检查 `.claude/product-marketing.md` 以及旧版文件名 `product-marketing-context.md`（可能位于 `.agents/` 或 `.claude/` 中），以识别旧版配置——如果在 `.agents/product-marketing.md` 之外的任何位置找到该文档，提议将其移动到规范位置。

**如果文档已存在：**
- 阅读文档并总结已记录的内容——注明当前的**文档版本**以及最近几条**变更日志**，让用户了解文档目前的状态和近期变更
- 询问用户想更新哪些部分
- 仅收集这些部分所需的信息
- 每次进行实质性保存时，都要提升版本号并添加一条变更日志记录（参见第 4 步）。该文档是所有其他营销技能都会读取的共享上下文，因此保留一份注明日期、记录*变更内容及变更原因*的历史记录很有价值。

**如果文档不存在，提供两个选项：**

1. **根据代码库自动起草**（推荐）：研究代码仓库——README、落地页、营销文案、package.json 等——并起草上下文文档的 V1 版本。然后由用户审核、纠正并补充缺失信息。这比从头开始更快。

2. **从头开始**：以对话方式逐一梳理各个部分，每次收集一个部分的信息。

大多数用户更喜欢选项 1。展示草稿后，询问：“哪些内容需要纠正？还缺少什么？”

### 第 2 步：收集信息

**如果自动起草：**
1. 阅读代码库：README、落地页、营销文案、关于页面、元描述、package.json 以及任何现有文档
2. 根据找到的信息起草所有部分
3. 展示草稿，并询问哪些内容需要纠正或还有遗漏
4. 持续迭代，直到用户满意为止

**如果从头开始：**
以对话方式逐一完成以下各部分，每次处理一个部分。不要一次性抛出所有问题。

对于每个部分：
1. 简要说明你正在记录什么
2. 提出相关问题
3. 确认信息准确无误
4. 进入下一个部分

尽量获取客户的原话——准确的措辞比经过润色的描述更有价值，因为它们能反映客户真实的思考和表达方式，从而让文案更能引起共鸣。

---

## 要记录的部分

### 1. 产品概述
- 一句话描述
- 产品的功能（2-3 句话）
- 产品类别（你位于哪个“货架”上——客户会如何搜索你的产品）
- 产品类型（SaaS、市场平台、电子商务、服务等）
- 商业模式和定价

### 2. 目标受众
- 目标公司类型（行业、规模、发展阶段）
- 目标决策者（职位、部门）
- 主要使用场景（你解决的核心问题）
- 待完成的任务（客户“雇用”你的产品完成的 2-3 件事）
- 具体使用场景或情境

### 3. 用户角色（仅限 B2B）
如果购买过程中涉及多个利益相关者，请为每个角色记录以下信息：
- 用户、支持者、决策者、财务购买者、技术影响者
- 每个角色关注什么、面临什么挑战，以及你向他们承诺的价值

### 4. 问题与痛点
- 客户在找到你之前面临的核心挑战
- 当前解决方案为何无法满足需求
- 这会给他们带来哪些成本（时间、金钱、机会）
- 情绪张力（压力、恐惧、怀疑）

### 5. 竞争格局
- **直接竞争对手**：相同的解决方案，相同的问题（例如，Calendly 与 SavvyCal）
- **次要竞争对手**：不同的解决方案，相同的问题（例如，Calendly 与 Superhuman 的日程安排功能）
- **间接竞争对手**：相冲突的解决方式（例如，Calendly 与私人助理）
- 各自在哪些方面无法满足客户需求

### 6. 差异化
- 关键差异化优势（替代方案不具备的能力）
- 你如何以不同的方式解决问题
- 为什么这种方式更好（优势）
- 客户为何选择你而非替代方案

### 7. 异议与反向用户画像
- 销售过程中最常听到的 3 个异议，以及如何应对
- 哪些人并不适合（反向用户画像）

### 8. 转换动力
JTBD 四力模型：
- **推动力**：哪些不满促使他们放弃当前解决方案
- **吸引力**：你的哪些方面吸引他们
- **习惯**：什么让他们继续受困于当前方式
- **焦虑**：他们对转换解决方案有哪些担忧

### 9. 客户语言
- 客户如何描述问题（原话）
- 客户如何描述你的解决方案（原话）
- 应使用的词语/短语
- 应避免的词语/短语
- 产品特定术语表

### 10. 品牌声音
- 语气（专业、轻松、活泼等）
- 沟通风格（直接、对话式、技术型）
- 品牌个性（3-5 个形容词）

### 11. 证明材料
- 可引用的关键指标或成果
- 知名客户/品牌标识
- 客户评价摘录
- 核心价值主题及佐证材料

### 12. 目标
- 主要业务目标
- 关键转化行动（你希望人们采取什么行动）
- 当前指标（如已知）

---

## 第 3 步：创建文档

收集信息后，按照以下结构创建 `.agents/product-marketing.md`：

```markdown
# Product Marketing Context

**Document version:** v1
**Last updated:** [date]

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

## Changelog
*Newest first. One line per revision: what changed and why.*
- v1 ([date]) — Initial context.
```

---

## 第 4 步：确认、设置版本并保存

- 展示完成的文档
- 询问是否有任何需要调整的地方
- **设置版本和变更日志**——这是供其他所有技能读取的文档所必需的变更记录：
  - **新文档：**设置 `Document version: v1`，并添加一条 Changelog 条目——`- v1 ([today]) — Initial context.`
  - **更新现有文档：**递增版本号（v2 → v3 …），将 `Last updated` 更新为今天，并在列表顶部**前置添加一条新的 Changelog 条目**（最新的在前），用一行概括说明*更改了什么以及为什么更改*。绝不要改写或重新排列过去的条目。
  - 好的条目应指出涉及的章节和更改原因，而不是只写「更新了文档」。示例：
    - `- v3 (2026-07-16) — Repositioned from "email tool" to "deliverability platform"; added RevOps to the ICP.`
    - `- v2 (2026-06-02) — Rewrote value prop and objections after 5 customer interviews; added competitor Acme.`
  - 条目和 `Last updated` 均使用今天的日期，并采用 ISO 格式（YYYY-MM-DD）。
  - **仅修正拼写错误：**不要递增版本号，也不要添加变更日志条目——只需保存修正。其他所有更改都必须递增版本号并添加条目。如果更改属于真正的重新定位，请明确说明——下游技能之后将基于新的上下文生成内容。
- 保存到 `.agents/product-marketing.md`
- 告诉他们：「其他营销技能现在会自动使用此上下文。底部的 Changelog 会记录每次修订——查看它即可了解你的定位是如何演变的。随时运行 `/product-marketing` 进行更新。」

---

## 提示

- **要具体**：问「让他们来找你的首要困扰是什么？」而不是「他们解决什么问题？」
- **记录原话**：客户的语言胜过经过润色的描述
- **要求举例**：「能举个例子吗？」可以引出更好的答案
- **边进行边验证**：总结每个部分并确认无误后再继续
- **跳过不适用的内容**：并非每个产品都需要所有部分（例如，B2C 不一定需要 Personas）