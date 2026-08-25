---
name: "cdo-review"
description: "/cs:cdo-review <plan> — Decision-driven Chief Data Officer interrogation of any plan that touches training data, data architecture, data productization, or data team hiring. Use when validating training-data rights before model work, choosing warehouse vs lakehouse vs mesh, or valuing data assets for productization or M&A."
---
# /cs:cdo-review — CDO 强制追问

**命令：** `/cs:cdo-review <plan>`

以决策为导向的 CDO 会对任何涉及数据战略的计划进行压力测试。在对数据架构、AI 训练任务、数据产品化或数据团队招聘做出任何承诺之前，先回答六个问题。

## 运行时机

- 在批准任何使用客户数据的新 ML 模型训练任务之前
- 在签署多年期数据基础设施 SaaS 合同（Snowflake、Databricks、Fivetran）之前
- 在将任何客户数据产品化（基准报告、embedding 端点、许可证）之前
- 在进行重大数据团队招聘（head of data、CDO、data PM、ML engineer）之前
- 在开展 M&A 尽职调查之前——无论是你方还是对方
- 当创始人在“data”附近使用“monetize”一词时

## CDO 的六个问题

### 1. 这些数据会驱动什么决策？
**如果没有任何决策因此得到推进，我们为什么要收集、训练使用或将其产品化？**
- “以后可能会用到”不是决策。
- “感觉像是一道护城河”不是决策。
- 真正的答案应明确指出一个需要这些数据的具体业务决策。

### 2. 每个数据源的同意来源是什么？
**对于每个数据源：来源、同意流程、数据类别、预期用途。**
- 仅依靠 1st-party-TOS 弱于 1st-party-explicit-opt-in。
- 捆绑式 TOS 不涵盖实质性的新用途（例如使用 PII 训练基础模型）。
- 如果范围内包含任何 AI 用例，请运行 `ai_training_data_audit.py`。

### 3. 内部有哪些人会使用这些数据——以及涉及多少个不同的职能领域？
**这将推动集中式与嵌入式架构，以及数据仓库与数据网格之间的决策。**
- 少于 5 个使用方：仅数据仓库。
- 5–25 个使用方：湖仓一体。
- 25 个以上使用方 + 联邦式文化：数据网格。
- 过早选择架构是数据团队倦怠的首要原因。

### 4. 这会对 M&A 尽职调查产生什么影响？
**如果收购方明天询问这批数据，我们准备好了吗？**
- 是否有记录完备的匿名化流程？
- 有多少比例的客户包含 MSA 例外条款？
- 训练数据来源日志是否为最新？
- 每季度运行 `data_asset_valuator.py`。

### 5. 如果没有这个数据源，模型、决策或报告还能重新训练、重新运行或重新发布吗？
**用于测试你对某个特定数据源的依赖程度。**
- 如果可以 → 爆炸半径较小；之后仍可更改同意机制。
- 如果不可以 → 爆炸半径较大；你已经在结构上承诺依赖该数据源。需要进行更严格的审查。

### 6. 什么角色能够推进这项工作——以及这是否是下一位正确的招聘人选？
**当正确答案是 analytics engineer 时却招聘了 data scientist，会导致 12 个月的生产力损失。**
- 将需要推进的决策映射到具体角色。
- 确认前置角色已经到位（先有 data engineer，再有 ML engineer；先有 analyst，再有 data scientist）。

## 工作流

```bash
# 1. AI training audit (if any ML / AI use case)
python ../../../c-level-advisor/skills/chief-data-officer-advisor/scripts/ai_training_data_audit.py sources.json

# 2. Architecture decision (if changing the stack)
python ../../../c-level-advisor/skills/chief-data-officer-advisor/scripts/data_product_strategy_picker.py profile.json

# 3. Data asset valuation (if productizing or pre-M&A)
python ../../../c-level-advisor/skills/chief-data-officer-advisor/scripts/data_asset_valuator.py corpus.json
```

## 输出格式

```markdown
# CDO Review: <plan>
**Date:** YYYY-MM-DD

## The Decision Being Made
[one sentence — which of the four CDO decisions: training | architecture | asset | hire]

## Training Audit (if applicable)
- NO-GO sources: N
- MITIGATE sources: N
- GO sources: N
- Top remediation: <one line>

## Architecture (if applicable)
- Recommended: WAREHOUSE / LAKEHOUSE / MESH
- Build-vs-buy summary: <one line>
- Kill criteria: <when to revisit>

## Asset Value (if applicable)
- Strategic value: X/10 | Moat: STRONG / MEDIUM / WEAK
- M&A multiplier: X.Xx – X.Xx ARR
- Recommended productization path: <name>

## Org (if applicable)
- Next hire: <role>
- Why this, not that: <one line>
- Prerequisite hires in place: yes/no

## Verdict
🟢 SHIP | 🟡 SHARPEN | 🔴 BLOCK

## Next Steps
[3 concrete actions]
```

## 路由

- `/cs:gc-review` — 用于任何产品化或许可路径
- `/cs:ciso-review` — 用于任何涉及客户数据的架构变更
- `/cs:cfo-review` — 用于构建与购买的 TCO 及并购估值计算
- `cs-chro-advisor` agent — 用于数据团队招聘（薪酬、职级通道、定级）
- `/cs:decide` — 记录裁决结果
- `/cs:freeze 90` — 用于多年期基础设施合同

## 相关内容

- Agent：[`cs-cdo-advisor`](../../agents/cs-cdo-advisor.md)
- Skill：[`chief-data-officer-advisor`](../../../c-level-advisor/skills/chief-data-officer-advisor/SKILL.md)
- 相邻内容：`../../../c-level-advisor/skills/general-counsel-advisor/`（合同约束）、`../../../c-level-advisor/skills/cto-advisor/`（架构能力）

---

**版本：** 1.0.0。