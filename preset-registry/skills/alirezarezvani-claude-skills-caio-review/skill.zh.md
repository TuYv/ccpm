---
name: "caio-review"
description: "/cs:caio-review <plan> — Eval-demanding Chief AI Officer interrogation of any plan that involves AI: model selection, risk classification, cost economics, or AI hiring. Use when shipping an AI feature without an eval set, choosing between API, fine-tune, and self-hosted, or classifying a use case under the EU AI Act."
---
# /cs:caio-review — CAIO 追问清单

**命令：** `/cs:caio-review <plan>`

这套要求评估的 CAIO 方法会对任何涉及 AI 的计划进行压力测试。在任何 AI 功能上线、签订多年期供应商承诺或扩充 AI 团队之前，先回答六个问题。

## 何时运行

- 上线任何新的 AI 驱动功能之前
- 签署多年期 AI 供应商合同（API 或自托管基础设施）之前
- 任何 AI 功能在欧盟上线之前
- 进行重大 AI 团队招聘之前（尤其是 ML 工程师或研究科学家）
- 承诺开展微调项目之前
- 在受监管领域采用 AI 之前（就业、信贷、医疗、教育等）
- 当创始人在“竞争优势”或“护城河”附近使用“AI”一词时

## CAIO 六问

### 1. 这个 AI 需要擅长什么，以及你将如何衡量它？

**没有评估集 = 不得上线。** 在部署任何 AI 功能之前，先定义评估标准。

- 至少准备 50-100 个具有代表性的输入
- 准备预期输出或评分标准
- 边界情况：含糊输入、对抗性输入、格式边界情况
- 如果你无法写下“什么算好”，那你就没有一个功能，只有一种感觉。

### 2. 幻觉率 / 错误率的 SLO 是多少，备用方案是什么？

**每个 AI 功能都有失败模式。要提前规划。**

- 量化的 SLO：“事实性查询的幻觉率 <5%”
- 检测机制：监控、抽样、客户反馈闭环
- 备用方案：人工介入审核、风险更低的默认响应、拒绝回答
- 如果 SLO 被违反，影响范围有多大：会影响多少用户，成本是多少？

### 3. 根据欧盟《人工智能法案》，风险等级是什么，是否需要合规性评估？

**如果有任何欧盟居民受到影响，或所属领域受到监管，请运行 `ai_risk_classifier.py`。**

- PROHIBITED → 无法在欧盟上线；重新界定范围
- HIGH → 合规性评估 + 欧盟数据库登记 + 10 项条款规定的义务（3-12 个月，$50-200K）
- LIMITED → 透明度义务（披露聊天机器人身份、标注 AI 生成内容）
- MINIMAL → 无具体义务；可自愿采用 NIST AI RMF

### 4. 使用 API、微调，还是自行构建？

**针对具体用例运行 `model_buildvsbuy_calculator.py`。**

- 80% 的 B2B SaaS 用例：API
- 15%：微调（需要领域特定行为 + 已标注数据 + ML 团队 + 高调用量时）
- <1%：从头构建
- 决策必须同时考虑经济上的盈亏平衡点和实际可行性（数据、团队、合规）

### 5. 在预期规模下，未来 12 个月的成本走势是什么？

**针对该工作负载运行 `ai_cost_economics.py`。**

- API：可变成本，随规模线性增长
- 自托管：主要是固定成本；对于 70B 级模型，盈亏平衡点通常为每月 1-10B tokens
- 自托管的隐性成本：运维、监控、模型更新、容量、故障转移、安全
- API 的隐性成本：供应商锁定、能力漂移、速率限制、数据驻留
- 提示词缓存是最被低估的杠杆；检查供应商是否支持

### 6. 什么角色能解除当前阻塞——我们是否先招聘了前置所需的人才？

**将 AI 能力映射到具体角色。创始人常常混淆 AI 工程师、ML 工程师和研究科学家。**

- AI 工程师：应用开发 + 全栈 + 提示词 + 评估 + 部署（大多数初创公司需要这个角色）
- ML 工程师：微调 + 再训练基础设施（只有在已有平台工程师和已标注数据之后才需要）
- 研究科学家：模型创新（只有当模型本身就是产品时才需要）
- 不要把研究科学家作为第一个 AI 招聘对象——他们需要基础设施才能高效工作

## 工作流

```bash
# 1. Model selection check
python ../../../c-level-advisor/skills/chief-ai-officer-advisor/scripts/model_buildvsbuy_calculator.py use_case.json

# 2. Regulatory classification
python ../../../c-level-advisor/skills/chief-ai-officer-advisor/scripts/ai_risk_classifier.py use_case.json

# 3. Cost projection
python ../../../c-level-advisor/skills/chief-ai-officer-advisor/scripts/ai_cost_economics.py workload.json
```

## 输出格式

```markdown
# CAIO Review: <plan>
**Date:** YYYY-MM-DD

## The Decision Being Made
[one sentence — which CAIO decision: model selection | risk classification | economics | next hire]

## Eval Discipline
- Eval set committed: yes/no
- SLO defined: <metric> < <threshold>
- Fallback behavior: <one line>

## Model Selection (if applicable)
- Recommended: API / FINE_TUNE / BUILD
- 3-year TCO: $X (chosen path) vs $Y (alternatives)
- Breakeven: <volume>

## Risk Classification (if applicable)
- EU AI Act tier: PROHIBITED / HIGH / LIMITED / MINIMAL
- Conformity assessment required: yes/no
- US state triggers: [list]
- Required controls open: N

## Cost Economics (if applicable)
- Monthly cost at current volume: $X
- Breakeven for self-hosted migration: <volume>
- Migration cost if applicable: $X (3-6 months)

## Org (if applicable)
- Next hire: <role>
- Why this, not the alternative: <one line>
- Prerequisite hires in place: yes/no

## Verdict
🟢 SHIP | 🟡 SHARPEN | 🔴 BLOCK

## Next Steps
[3 concrete actions]
```

## 路由

- `/cs:cdo-review` — 用于任何训练数据相关影响
- `/cs:gc-review` — 用于 AI 供应商合同、输出责任、训练数据许可
- `/cs:ciso-review` — 用于提示注入 / 越狱 / 训练数据投毒威胁模型
- `/cs:cfo-review` — 用于多年期供应商或 GPU 承诺的 TCO
- `cs-chro-advisor` agent — 用于 AI 团队招聘（薪酬、职级梯度、定级）
- `/cs:decide` — 记录裁决
- `/cs:freeze 60` — 用于多年期 AI 承诺

## 相关内容

- 代理：[`cs-caio-advisor`](../../agents/cs-caio-advisor.md)
- 技能：[`chief-ai-officer-advisor`](../../../c-level-advisor/skills/chief-ai-officer-advisor/SKILL.md)
- 相邻技能：`../../../c-level-advisor/skills/chief-data-officer-advisor/`（训练数据权利、数据战略）

---

**版本：** 1.0.0。