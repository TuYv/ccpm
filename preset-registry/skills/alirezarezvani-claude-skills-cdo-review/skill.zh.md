---
name: "cdo-review"
description: "/cs:cdo-review <plan> — Decision-driven Chief Data Officer interrogation of any plan that touches training data, data architecture, data productization, or data team hiring. Use when validating training-data rights before model work, choosing warehouse vs lakehouse vs mesh, or valuing data assets for productization or M&A."
---
# /cs:cdo-review — CDO 强制审视问题

**命令：** `/cs:cdo-review <plan>`

以决策为导向的 CDO 会对任何涉及数据战略的计划进行压力测试。在对数据架构、AI 训练任务、数据产品化或数据团队招聘作出任何承诺之前，必须回答六个问题。

## 何时运行

- 在批准任何使用客户数据的新 ML 模型训练任务之前
- 在签署多年期数据基础设施 SaaS 合同（Snowflake、Databricks、Fivetran）之前
- 在将任何客户数据产品化（基准报告、嵌入端点、许可证）之前
- 在招聘重要数据团队职位（数据负责人、CDO、数据产品经理、ML 工程师）之前
- 在开展并购尽职调查之前——无论是你方调查对方，还是对方调查你方
- 当创始人在谈论“数据”时使用“变现”一词

## 六个 CDO 问题

### 1. 这些数据会驱动什么决策？
**如果没有任何决策因此得以推进，我们为什么要收集这些数据、使用它们进行训练或将其产品化？**
- “我们以后可能会需要”不是决策。
- “感觉它能形成护城河”不是决策。
- 真正的答案会明确指出一项必须依赖这些数据才能作出的具体业务决策。

### 2. 每个来源的同意授权可追溯信息是什么？
**对于每个数据来源：来源、同意流程、数据类别、预期用途。**
- 仅依赖第一方服务条款的授权，弱于第一方明确选择加入的授权。
- 捆绑式服务条款无法涵盖实质性的新用途（例如使用 PII 训练基础模型）。
- 如果范围内包含任何 AI 用例，请运行 `ai_training_data_audit.py`。

### 3. 内部由谁使用这些数据——涉及多少个不同的职能领域？
**这决定了集中式与嵌入式模式，以及数据仓库与数据网格之间的选择。**
- 少于 5 个使用方：仅使用数据仓库。
- 5–25 个使用方：使用湖仓一体架构。
- 25 个以上使用方且具备联邦式文化：使用数据网格。
- 过早选择架构是导致数据团队倦怠的首要原因。

### 4. 对并购尽职调查有何影响？
**如果收购方明天询问这个数据语料库，我们准备好了吗？**
- 是否有成文的匿名化流程？
- 有多少百分比的客户在 MSA 中设有例外条款？
- 训练数据来源日志是否为最新状态？
- 每季度运行 `data_asset_valuator.py`。

### 5. 缺少这个来源时，模型能否重新训练、决策能否重新执行、报告能否重新发布？
**用于检验你对特定数据来源的依赖程度。**
- 如果可以 → 影响范围小；你以后可以调整同意授权策略。
- 如果不可以 → 影响范围大；你已在结构上绑定该来源。需要进行更严格的审查。

### 6. 哪个角色能够解除这一阻碍——它是接下来应该招聘的正确职位吗？
**如果正确答案是招聘分析工程师，却错误地招聘了数据科学家，将造成 12 个月的生产力损失。**
- 将待推进的决策映射到具体角色。
- 确认前置角色已经到位（先招聘数据工程师，再招聘 ML 工程师；先招聘分析师，再招聘数据科学家）。

## 工作流程

```bash
# 1. AI training audit (if any ML / AI use case)
python ../../../skills/chief-data-officer-advisor/scripts/ai_training_data_audit.py sources.json

# 2. Architecture decision (if changing the stack)
python ../../../skills/chief-data-officer-advisor/scripts/data_product_strategy_picker.py profile.json

# 3. Data asset valuation (if productizing or pre-M&A)
python ../../../skills/chief-data-officer-advisor/scripts/data_asset_valuator.py corpus.json
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

- `/cs:gc-review` — 适用于任何产品化或许可路径
- `/cs:ciso-review` — 适用于任何涉及客户数据的架构变更
- `/cs:cfo-review` — 适用于自建与购买的 TCO 以及并购估值计算
- `cs-chro-advisor` agent — 适用于数据团队招聘（薪酬、职级体系、定级）
- `/cs:decide` — 记录裁决
- `/cs:freeze 90` — 适用于多年期基础设施合同

## 相关内容

- 智能体：[`cs-cdo-advisor`](../../agents/cs-cdo-advisor.md)
- 技能：[`chief-data-officer-advisor`](../../../skills/chief-data-officer-advisor/SKILL.md)
- 相邻内容：`../../../skills/general-counsel-advisor/`（合同约束）、`../../../skills/cto-advisor/`（架构能力）

---

**版本：** 1.0.0