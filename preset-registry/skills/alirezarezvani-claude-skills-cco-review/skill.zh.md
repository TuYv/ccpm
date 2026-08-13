---
name: "cco-review"
description: "/cs:cco-review <plan> — Retention-obsessed Chief Customer Officer interrogation of any plan that touches customer retention, segmentation, CS team sizing, or CS team hiring. Use when gross retention is slipping, before approving CSM headcount, or when deciding which customer segments to keep or fire."
---
# /cs:cco-review — CCO 压力测试问题

**命令：** `/cs:cco-review <plan>`

极度关注留存的 CCO 会对任何涉及客户体验的计划进行压力测试。在提出任何留存主张、调整客户分层、扩充 CS 团队或招聘重要 CS 岗位之前，必须回答六个问题。

## 何时运行

- 在任何包含留存率数据的董事会叙事之前
- 在批准扩充 CS 团队编制之前
- 在重新划分客户群或更改层级定义之前
- 在启动客户营销或客户倡导计划之前
- 在招聘重要 CS 岗位（CSM、AM、实施、客户营销）之前
- 当 NRR 看起来“很棒”，但 CSM 反馈的客户流失问题却在增加时
- 在决定是否增设独立于 CSM 的 AM 角色之前

## CCO 的六个问题

### 1. 客户总留存率是多少？
**不是 NRR，而是总留存率。** NRR 可能会用扩张收入掩盖客户持续流失的问题。
- 在增长阶段，GRR 健康值 ≥ 90%；在规模化阶段，GRR 健康值 ≥ 95%
- 如果 GRR < 85% 但 NRR > 100%，说明产品未能满足 15% 以上客户的需求；扩张收入掩盖了这一失败
- 运行 `retention_decomposition_analyzer.py`

### 2. 客户离开的首要原因是什么？
**如果你说不出来，就说明你不了解客户流失。**
- 7 类分类体系：product_fit / competitor_loss / no_value_realized / pricing / champion_left / company_event / tactical_failure
- 可预防流失 = product_fit + no_value_realized + tactical_failure
- 如果可预防流失 > 50%，CS 有明确的改善空间；如果 < 30%，流失属于结构性问题（ICP、市场、竞争）

### 3. 各客户分层的价值实现时间（TTV）中位数是多少？
**TTV 过长在不同客户分层中意味着不同的问题。**
- 低层级客户的 TTV 过长 = ICP 不匹配；降级或淘汰
- 高层级客户的 TTV 过长 = 客户引导流程存在问题；修复实施经理的交接流程
- TTV 是 GRR 的领先指标

### 4. 你今天会放弃哪个客户？
**如果答案是“一个都没有”——说明你的客户分层存在问题。**
- 某些客户带来的成本高于收入（支持成本 > ARR 的 50% + ICP 匹配度低）
- 运行 `customer_segmentation_designer.py` 找出淘汰名单
- 淘汰候选客户有 3 种处理路径：不续约 / 降级为技术触达 / 提价以覆盖成本

### 5. ARR 与 CSM 的比例是多少？采用共享模式还是指定负责人模式？
**错误的模式会浪费团队产能。**
- 战略客户：指定负责人 + 高管支持，$300K-$1M ARR/CSM
- 企业客户：指定负责人，$500K-$2M
- 中型市场客户：共享模式，$2M-$5M
- SMB：技术触达，$5M+
- 运行 `cs_coverage_calculator.py` 确定团队规模

### 6. 薪酬计划是否涵盖 CS？它与销售薪酬有何不同？
**目标不一致是 CS 失败的领先指标。**
- CS 薪酬：通常为 70/30 的基本薪资/浮动薪资比例
- 浮动部分：50% 客户总留存率 + 30% 客户净留存率 + 20% 活动指标
- 反模式：根据 NPS 向 CSM 计薪——他们会操纵该指标
- 反模式：CSM 与销售采用相同的薪酬方案——他们会只顾销售而非服务客户

## 工作流程

```bash
# 1. Retention decomposition (always start here)
python ../../../skills/chief-customer-officer-advisor/scripts/retention_decomposition_analyzer.py cohorts.json

# 2. Segmentation audit
python ../../../skills/chief-customer-officer-advisor/scripts/customer_segmentation_designer.py customers.json

# 3. Coverage sizing (if making CS team changes)
python ../../../skills/chief-customer-officer-advisor/scripts/cs_coverage_calculator.py book.json
```

## 输出格式

```markdown
# CCO Review: <plan>
**Date:** YYYY-MM-DD

## The Decision Being Made
[one sentence — retention | segmentation | coverage | next hire]

## Retention (if applicable)
- GRR: X% (vs vanity NRR of Y%)
- Top churn driver: <category> at X% of churn
- Preventable churn: X% (CS-controllable)
- Leaky-bucket pattern? yes/no

## Segmentation (if applicable)
- Tier distribution: Strategic X / Enterprise X / Mid-market X / SMB X
- Kill list size: N customers (X% of customers, Y% of ARR)
- Upgrade candidates: N

## Coverage (if applicable)
- Current CSMs: N | Required now: M | Required 12mo: P
- Annual cost (12mo): $X
- Manager trigger fired: yes/no

## Org (if applicable)
- Next hire: <CSM | Support | AM | IM | CS Ops | Customer Marketing>
- Why this, not the alternative: <one line>
- Customer outcome unblocked: <specific>

## Verdict
🟢 SHIP | 🟡 SHARPEN | 🔴 BLOCK

## Next Steps
[3 concrete actions]
```

## 路由

- `/cs:cpo-review` — 如果客户流失的根本原因是 product_fit 或 no_value_realized
- `/cs:cro-review` — 如果扩展收入计算或薪酬一致性存在疑问
- `/cs:cfo-review` — 用于 CS 成本承诺及客户留存对收入的影响
- `cs-chro-advisor` 智能体 — 用于 CS 招聘、薪酬和职级体系
- `/cs:decide` — 记录裁决
- `/cs:freeze 30` — 用于多年期 CS 薪酬计划变更

## 相关内容

- 智能体：[`cs-cco-advisor`](../../agents/cs-cco-advisor.md)
- 技能：[`chief-customer-officer-advisor`](../../../skills/chief-customer-officer-advisor/SKILL.md)
- 相邻内容：`../../../../business-growth/`（战术性 CS 执行）

---

**版本：** 1.0.0