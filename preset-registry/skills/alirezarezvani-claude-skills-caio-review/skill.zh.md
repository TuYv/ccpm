---
name: "caio-review"
description: "/cs:caio-review <plan> — Eval-demanding Chief AI Officer interrogation of any plan that involves AI: model selection, risk classification, cost economics, or AI hiring. Use when shipping an AI feature without an eval set, choosing between API, fine-tune, and self-hosted, or classifying a use case under the EU AI Act."
---
# /cs:caio-review — CAIO 强制审查问题

**命令：** `/cs:caio-review <plan>`

负责评估把关的 CAIO 会对任何涉及 AI 的计划进行压力测试。任何 AI 功能发布、任何多年期供应商承诺或任何 AI 团队扩张之前，都必须回答六个问题。

## 何时运行

- 发布任何新的 AI 驱动功能之前
- 签署多年期 AI 供应商合同（API 或自托管基础设施）之前
- 在欧盟发布任何 AI 功能之前
- 招聘重要 AI 团队成员之前（尤其是机器学习工程师或研究科学家）
- 承诺开展微调项目之前
- 在受监管领域（就业、信贷、医疗、教育等）采用 AI 之前
- 当创始人把“AI”与“竞争优势”或“护城河”放在一起谈论时

## CAIO 的六个问题

### 1. 这个 AI 需要擅长什么，你将如何衡量？
**没有评估集，就不能发布。** 在部署任何 AI 功能之前，先定义评估标准。
- 至少 50-100 个有代表性的输入
- 预期输出，或用于评分的量表
- 边缘案例：歧义、对抗性、格式边界
- 如果你无法明确写出什么算“好”，那你拥有的就不是一项功能，而只是一种感觉。

### 2. 对幻觉率／错误率的 SLO 是什么，后备方案是什么？
**每项 AI 功能都有失败模式。要为此做好规划。**
- 量化的 SLO：“事实性查询的幻觉率低于 5%”
- 检测机制：监控、抽样、客户反馈闭环
- 后备方案：人工参与审核、默认提供风险较低的响应、拒绝回答
- 违反 SLO 时的影响范围：会影响多少用户，成本是多少？

### 3. 根据《欧盟人工智能法案》，它属于哪个风险等级，是否需要进行合规性评估？
**如果会影响任何欧盟居民，或所处领域受到监管，请运行 `ai_risk_classifier.py`。**
- 禁止级 → 不能在欧盟发布；重新界定范围
- 高风险级 → 合规性评估 + 欧盟数据库注册 + 10 项条款义务（3-12 个月，5 万至 20 万美元）
- 有限风险级 → 透明度义务（披露聊天机器人身份、标记 AI 生成内容）
- 最低风险级 → 无特定义务；可自愿采用 NIST AI RMF

### 4. 使用 API、微调，还是自行构建？
**针对具体用例运行 `model_buildvsbuy_calculator.py`。**
- 80% 的 B2B SaaS 用例：API
- 15%：微调（适用于需要特定领域行为，并且拥有标注数据、机器学习团队和较高使用量的情况）
- 不到 1%：从头构建
- 决策必须同时考虑经济盈亏平衡点和实际可行性（数据、团队、合规）

### 5. 在预期规模下，未来 12 个月的成本走势如何？
**针对该工作负载运行 `ai_cost_economics.py`。**
- API：可变成本，随使用规模线性增长
- 自托管：大部分为固定成本；对于 70B 级模型，盈亏平衡点通常为每月 10 亿至 100 亿个 token
- 自托管的隐性成本：运维、监控、模型更新、容量、故障转移、安全
- API 的隐性成本：供应商锁定、能力漂移、速率限制、数据驻留
- 提示词缓存是最被低估的杠杆；检查供应商是否支持

### 6. 什么角色能解除这一阻碍——我们是否先招聘了必备的前置角色？
**将 AI 能力对应到具体角色。创始人常常混淆 AI 工程师、机器学习工程师和研究科学家。**
- AI 工程师：应用开发 + 全栈 + 提示词 + 评估 + 部署（大多数初创公司需要的角色）
- 机器学习工程师：微调 + 再训练基础设施（仅应在已有平台工程师和标注数据之后招聘）
- 研究科学家：模型创新（仅当模型本身就是产品时才需要）
- 不要把研究科学家作为首位 AI 员工招聘——他们需要基础设施才能高效工作

## 工作流

```bash
# 1. Model selection check
python ../../../skills/chief-ai-officer-advisor/scripts/model_buildvsbuy_calculator.py use_case.json

# 2. Regulatory classification
python ../../../skills/chief-ai-officer-advisor/scripts/ai_risk_classifier.py use_case.json

# 3. Cost projection
python ../../../skills/chief-ai-officer-advisor/scripts/ai_cost_economics.py workload.json
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

- `/cs:cdo-review` — 用于任何涉及训练数据的事项
- `/cs:gc-review` — 用于 AI 供应商合同、输出责任和训练数据许可
- `/cs:ciso-review` — 用于提示词注入 / 越狱 / 训练数据投毒威胁模型
- `/cs:cfo-review` — 用于多年期供应商或 GPU 承诺的 TCO
- `cs-chro-advisor` 智能体 — 用于 AI 团队招聘（薪酬、职级体系、定级）
- `/cs:decide` — 记录结论
- `/cs:freeze 60` — 用于多年期 AI 承诺

## 相关内容

- 智能体：[`cs-caio-advisor`](../../agents/cs-caio-advisor.md)
- 技能：[`chief-ai-officer-advisor`](../../../skills/chief-ai-officer-advisor/SKILL.md)
- 相邻领域：`../../../skills/chief-data-officer-advisor/`（训练数据权利、数据战略）

---

**版本：** 1.0.0