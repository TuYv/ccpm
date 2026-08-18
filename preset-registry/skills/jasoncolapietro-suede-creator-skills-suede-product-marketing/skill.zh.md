---
name: suede-product-marketing
description: "Suede-owned product-marketing context discipline. Use when a project needs a shared record of product, audience, ICP, positioning, objections, customer language, proof, and goals, or when that record needs updating. NOT FOR: writing a campaign (use suede-campaign-in-a-box), conducting new customer interviews (use suede-customer-research), or publishing brand claims."
metadata:
  version: 2.1.0
---
# Suede 产品营销上下文

Suede 产品营销维护受众、定位、异议、客户语言和证明材料的共享证据层。Suede 增长套件会读取此上下文，因此每个下游技能都从同一份经过验证的产品叙事开始。

文档存储在 `.agents/product-marketing.md`。

## 工作流

### 步骤 1：检查现有上下文

首先，检查 `.agents/product-marketing.md` 是否已经存在。同时检查 `.claude/product-marketing.md` 和旧版文件名 `product-marketing-context.md`（位于 `.agents/` 或 `.claude/` 中），以兼容较早的设置——如果在 `.agents/product-marketing.md` 以外的任何位置找到这些文件，请提议将其移动到规范位置。

**如果存在：**
- 读取该文件并总结其中记录的内容——注明当前的 **文档版本** 以及最近几条 **变更日志** 条目，让用户了解文档当前所处的状态以及近期发生了哪些变化
- 询问他们希望更新哪些部分
- 仅收集这些部分的信息
- 每次进行实质性保存时，递增版本号并添加一条变更日志记录（参见步骤 4）。这份文档是所有其他营销技能都会读取的共享上下文，因此保留一份记录*变更内容及原因*的带日期变更轨迹很有价值。

**如果不存在，请提供两个选项：**

1. **从代码库自动起草**（推荐）：研究代码库——README、落地页、营销文案、package.json 等，并起草一份 V1 版本的上下文文档。随后用户可以进行审阅、纠正并补充遗漏。这比从头开始更快。

2. **从头开始**：以对话方式逐节进行，逐次收集信息。

大多数用户更倾向于选项 1。展示草稿后，询问：“需要纠正什么？还缺少什么？”

### 步骤 2：收集信息

**如果自动起草：**
1. 阅读代码库：README、落地页、营销文案、关于页面、元描述、package.json 以及任何现有文档
2. 仅根据来源实际表述的内容起草。**每个自动起草的字段都必须以 `[src: path/to/file.md]` 的形式标注来源**——即该主张所来自的文件。没有来源的字段不应起草：留空并标记为 `[unverified]`。
3. 绝不要根据推断为字段提供来源。如果 README 暗示了某项差异化优势却没有明确表述，如果根据所属类别猜测竞争对手，或者营销文案中类似客户证言的句子没有归属到具体客户，则该字段应标记为 `[unverified]`——而不是添加保留意见后将其作为草稿。差异化、竞争格局、证明要点和客户语言尤其适用这条规则；在这些位置编造内容，会传播到读取此文档的每个技能中。
4. 展示草稿，并明确说明有多少字段带有来源、多少字段标记为 `[unverified]`，然后询问需要纠正或补充什么
5. 持续迭代，直到用户满意为止。用户在对话中确认的字段，其来源标记为 `[src: user]`

**如果从头开始：**
按照下面的各个部分，以对话方式逐次进行，一次处理一个部分。不要一次性抛出所有问题。

对于每个部分：
1. 简要解释你要记录的内容
2. 提出相关问题
3. 确认准确性
4. 进入下一部分

推动客户使用原话——准确的措辞比润色后的描述更有价值，因为它们反映了客户实际的思考和表达方式，从而让文案更能引起共鸣。

---

## 需要收集的部分

### 1. 产品概览
- 一句话描述
- 产品做什么（2-3句话）
- 产品类别（你所在的“货架”——客户会如何搜索你）
- 产品类型（SaaS、marketplace、电子商务、服务等）
- 商业模式和定价

### 2. 目标受众
- 目标公司类型（行业、规模、发展阶段）
- 目标决策者（角色、部门）
- 主要用例（你解决的核心问题）
- 待完成的工作（客户“雇用”你来完成的2-3件事）
- 具体用例或场景

### 3. 用户画像（仅限 B2B）
如果购买过程中涉及多个利益相关者，请分别收集：
- 使用者、倡导者、决策者、财务买方、技术影响者
- 每个人关注什么、面临什么挑战，以及你向他们承诺的价值

### 4. 问题与痛点
- 客户找到你之前面临的核心挑战
- 当前解决方案为何无法满足需求
- 这给他们带来的代价（时间、金钱、机会）
- 情绪上的压力（压力、恐惧、怀疑）

### 5. 竞争格局
- **直接竞争对手**：相同的解决方案，相同的问题（例如 Calendly 与 SavvyCal）
- **次级竞争对手**：不同的解决方案，相同的问题（例如 Calendly 与 Superhuman scheduling）
- **间接竞争对手**：相互冲突的方法（例如 Calendly 与个人助理）
- 每种方案在哪些方面无法满足客户需求

### 6. 差异化
- 关键差异化因素（替代方案所不具备的能力）
- 你如何以不同方式解决问题
- 为什么这样更好（带来的益处）
- 客户为什么选择你而不是替代方案

### 7. 异议与反向用户画像
- 销售过程中听到的排名前三的异议，以及如何应对
- 哪些人不适合你（反向用户画像）

### 8. 转换动态
JTBD 四种力量：
- **推动力**：哪些挫折促使他们离开当前解决方案
- **拉力**：哪些因素吸引他们选择你
- **惯性**：什么让他们继续停留在当前方式上
- **焦虑**：他们担心切换会带来什么问题

### 9. 客户语言
- 客户如何描述问题（原话）
- 客户如何描述你的解决方案（原话）
- 应使用的词语/短语
- 应避免的词语/短语
- 产品专属术语表

### 10. 品牌声音
- 语气（专业、随和、活泼等）
- 沟通风格（直接、对话式、技术性）
- 品牌个性（3-5个形容词）

### 11. 证明要点
- 可引用的关键指标或结果
- 知名客户/Logo
- 客户评价摘录
- 主要价值主题及支持证据

### 12. 目标
- 主要业务目标
- 关键转化行为（你希望人们做什么）
- 当前指标（如已知）

---

## 第 3 步：创建文档

收集信息后，使用以下结构创建 `.agents/product-marketing.md`：

```markdown
# Product Marketing Context

**Document version:** v1
**Last updated:** [date]
**Status:** complete | partial — missing: [required sections still empty]

*Every field ends with its source — `[src: README.md]`, `[src: interview
2026-05-04]`, `[src: user]` — or the marker `[unverified]` if nothing on record
supports it. An unsourced field is empty by definition; do not fill it to make
the document look finished.*

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
**Testimonials:** *(verbatim only — a quote with no attributable source is `[unverified]`, never paraphrased into existence)*
> "[quote]" — [who] [src: where this quote was published or collected]
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

## 第 4 步：确认、版本控制并保存

- 展示完成的文档
- 询问是否需要调整
- **保存前检查 v1 最低要求。** 要让文档作为共享上下文值得信赖，以下六个部分必须非空且有来源：产品概览、目标受众、问题与痛点、差异化、客户语言和目标。其他内容可根据产品类型选择性填写。如果这六个部分中有任何一个为空或全部标记为 `[unverified]`，请设置 `Status: partial`，并在该行准确列出缺失的部分。绝不要将部分文档保存为 `complete`。
- **下游如何处理部分文档。** 读取 `.agents/product-marketing.md` 的技能如果发现 `Status: partial`，必须在生成任何依赖这些内容的内容之前，向用户询问其中指定的缺失部分，并且不得从文档的其他内容中推断这些部分。在保存消息中说明这一点，让用户知道为什么之后还会再次被询问。
- **设置版本和变更日志**——这是每个其他技能都会读取的文档留痕：
  - **新建文档：**设置 `Document version: v1`，并添加一条 Changelog 条目——`- v1 ([today]) — 初始上下文。`
  - **更新现有文档：**递增版本号（v2 → v3 ……），将 `Last updated` 更新为今天，并在列表顶部**添加一条新的 Changelog 条目**（最新的在前），用一行总结*变更内容及原因*。绝不要重写或重新排序过去的条目。
  - 好的条目应说明修改了哪些部分以及修改原因，而不是写“更新了文档”。示例：
    - `- v3 (2026-07-16) — 从“电子邮件工具”重新定位为“送达率平台”；将 RevOps 加入 ICP。`
    - `- v2 (2026-06-02) — 在 5 次客户访谈后重写价值主张和异议处理；新增竞争对手 Acme。`
  - 条目和 `Last updated` 使用 ISO 格式（YYYY-MM-DD）的今天日期。
  - **纯拼写错误修复：**不要递增版本号或添加变更日志条目——只需保存修正。其他所有变更都必须递增版本号并添加条目。如果变更是实际的重新定位，请明确说明——下游技能现在将基于新的上下文生成内容。
- 保存到 `.agents/product-marketing.md`
- 告诉用户：“Suede 增长套件现在将自动使用此上下文。
  底部的 Changelog 会记录每次修订——查看它即可了解你的
  定位如何演变。随时运行 `/suede-product-marketing` 进行更新。”

---

## 提示

- **跳过不适用的内容**，但第 4 步中的六个部分 v1 最低要求除外：并非每个产品都需要 Personas（B2C）、Switching Dynamics 或 Glossary。跳过六个部分中的任何一个都不算跳过——这会使文档成为 `partial` 文档。

## 边界

- 不要在未读取现有上下文文件、保留其中受支持的事实并向用户展示重大变更的情况下覆盖该文件。
- 不要捏造客户语言、差异化、证明材料、市场定位或持久性的品牌规则；对假设和缺失的证据进行标注。
- 不要发布外部文案，也不要修改产品、CRM、分析或营销活动系统。此技能只负责共享上下文文档。

## 路由

- 使用 `suede-customer-research` 收集新的客户证据。
- 使用 `suede-competitor-profiling` 获取有关指定竞争对手的证据。
- 使用 `suede-marketing-plan` 将已批准的背景信息转化为渠道计划。
- 使用 `suede-campaign-in-a-box` 打包已批准的营销活动。