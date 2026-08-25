---
name: "cco-review"
description: "/cs:cco-review <plan> — Retention-obsessed Chief Customer Officer interrogation of any plan that touches customer retention, segmentation, CS team sizing, or CS team hiring. Use when gross retention is slipping, before approving CSM headcount, or when deciding which customer segments to keep or fire."
---
# /cs:cco-review — CCO 强制提问

**命令：** `/cs:cco-review <plan>`

这位极度关注留存的 CCO，会对任何涉及客户体验的计划进行压力测试。在提出任何留存声明、调整客户分群、扩充 CS 团队或进行重大 CS 招聘之前，必须回答六个问题。

## 运行时机

- 在任何包含留存数字的董事会叙事之前
- 在批准扩充 CS 团队编制之前
- 在重新划分客户群或更改层级定义之前
- 在启动客户营销或客户倡导计划之前
- 在进行重大 CS 招聘之前（CSM、AM、实施、客户营销）
- 当 NRR “很棒”，但 CSM 对客户流失的抱怨却在增加时
- 在决定是否新增一个独立于 CSM 的 AM 职位之前

## CCO 的六个问题

### 1. GROSS 留存率是多少？
**不是 NRR，而是 Gross。** NRR 可能通过扩张收入掩盖一个不断漏水的桶。
- 成长期的 GRR 健康标准 ≥ 90%，规模化阶段 ≥ 95%
- 如果 GRR < 85% 但 NRR > 100%，说明有 15%+ 的客户正在遭遇产品失败；扩张收入掩盖了这一失败
- 运行 `retention_decomposition_analyzer.py`

### 2. 客户离开的首要原因是什么？
**如果你说不出来，就说明你不了解流失。**
- 7 类分类法：product_fit / competitor_loss / no_value_realized / pricing / champion_left / company_event / tactical_failure
- 可预防流失 = product_fit + no_value_realized + tactical_failure
- 如果可预防流失 > 50%，CS 有明确的发力空间；如果 < 30%，则流失具有结构性（ICP、市场、竞争）

### 3. 各客户分群的价值实现中位时间（TTV）是多少？
**不同客户分群的 TTV 较长，意味着不同的问题。**
- 低层级客户的 TTV 较长 = ICP 不匹配；降级或放弃
- 高层级客户的 TTV 较长 = 上手流程存在问题；修复移交给实施经理的流程
- TTV 是 GRR 的领先指标

### 4. 今天你会解雇哪个客户？
**如果答案是“没有”——说明你的客户分群存在问题。**
- 有些客户账户的成本高于其带来的收益（支持成本 > ARR 的 50% 且 ICP 匹配度低）
- 运行 `customer_segmentation_designer.py` 以识别应淘汰客户名单
- 淘汰候选客户有 3 条路径：不续约 / 降级为技术触达 / 涨价以回收成本

### 5. ARR/CSM 比率是多少，采用的是共享服务模式还是指定客户模式？
**错误的模式会浪费产能。**
- 战略客户：指定 CSM + 高管赞助，$300K-$1M ARR/CSM
- 企业客户：指定 CSM，$500K-$2M
- 中端市场：共享服务，$2M-$5M
- SMB：技术触达，$5M+
- 运行 `cs_coverage_calculator.py` 以确定团队规模

### 6. CS 是否纳入了你的薪酬计划，其方式与 Sales 薪酬有何不同？
**错位是 CS 失败的领先指标。**
- CS 薪酬：通常为 70/30 的固定薪酬/浮动薪酬
- 浮动薪酬：50% 毛留存 + 30% 净留存 + 20% 活动
- 反模式：按 NPS 对 CSM 进行薪酬考核——他们会操纵 NPS
- 反模式：让 CSM 与 Sales 采用相同的薪酬方案——他们会去销售，而不是服务

## 工作流

```bash
# 1. 留存分解（始终从这里开始）
python ../../../c-level-advisor/skills/chief-customer-officer-advisor/scripts/retention_decomposition_analyzer.py cohorts.json

# 2. 客户分群审计
python ../../../c-level-advisor/skills/chief-customer-officer-advisor/scripts/customer_segmentation_designer.py customers.json

# 3. 覆盖规模测算（如果要调整 CS 团队）
python ../../../c-level-advisor/skills/chief-customer-officer-advisor/scripts/cs_coverage_calculator.py book.json
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

- `/cs:cpo-review` — 如果流失根因是 product_fit 或 no_value_realized
- `/cs:cro-review` — 如果扩张计算或薪酬方案一致性存在疑问
- `/cs:cfo-review` — 用于 CS 成本承诺以及留存对收入的影响
- `cs-chro-advisor` agent — 用于 CS 招聘、薪酬和职级体系
- `/cs:decide` — 记录结论
- `/cs:freeze 30` — 在变更多年期 CS 薪酬计划时使用

## 相关内容

- Agent：[`cs-cco-advisor`](../../agents/cs-cco-advisor.md)
- Skill：[`chief-customer-officer-advisor`](../../../c-level-advisor/skills/chief-customer-officer-advisor/SKILL.md)
- 相邻内容：`../../../business-growth/`（战术性 CS 执行）

---

**版本：** 1.0.0