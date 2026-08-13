---
name: "cfo-review"
description: "/cs:cfo-review <plan> — Numerate-skeptic interrogation of any plan that touches money. Unit economics, runway, dilution, capital allocation. Use when a plan commits meaningful spend — e.g. a hiring wave, a fundraise decision, or a new channel budget."
---
# /cs:cfo-review — CFO 强制审查问题

**命令：** `/cs:cfo-review <plan>`

由精于数字的怀疑者对任何涉及资金的事项进行压力测试。任何支出或融资之前都要回答六个问题。

## 何时运行

- 批准任何超过营收 1% 的支出之前
- 新增任何招聘职位之前
- 开展任何融资对话之前
- 调整定价或单位经济模型之前
- 签署多年期合同之前

## 六个 CFO 问题

### 1. 资金消耗与现金跑道
**资金消耗倍数是多少？在基准 / 乐观 / 悲观情景下，现金还能维持多少个月？**
- 资金消耗倍数 = 净资金消耗 ÷ 净新增 ARR。高于 2x 就有问题。
- 如果悲观情景下的现金跑道不足 12 个月，你就已经进入融资模式。

### 2. 单位经济模型
**各渠道的 LTV / CAC 分别是多少？排名前两位渠道的回收周期是多少？**
- LTV / CAC > 3x 属于健康水平。回收周期 < 12 个月属于健康水平。
- 如果其中任何一项不达标，就不要扩大该渠道的投入。

### 3. 股权稀释路径
**如果该计划需要融资，在基准估值和悲观估值下，股权稀释比例分别是多少？**
- 每轮融资中创始人的股权稀释比例。
- 未来两轮融资后的累计股权稀释比例。

### 4. 资本配置替代方案
**如果这笔资金不花在这里，还可以投向哪里？预期回报是多少？**
- 三种替代方案：招聘、产品、营销。
- 明确说明机会成本。

### 5. 收入质量
**毛利率是多少？随着规模扩大，其趋势如何？**
- 如果毛利率随规模扩大而下降，说明该模型存在根本问题。
- 收入成本的增长速度应低于收入增长速度。

### 6. 悲观情景下的生存能力
**如果收入只有计划的 50%，公司能否生存 18 个月？**
- 默认可存续是不可妥协的要求。
- 如果不能，提前确定触发削减的条件。

## 工作流程

1. **运行计算：**
   ```bash
   python ../../../skills/cfo-advisor/scripts/burn_rate_calculator.py
   python ../../../skills/cfo-advisor/scripts/unit_economics_analyzer.py
   python ../../../skills/cfo-advisor/scripts/fundraising_model.py
   ```
2. **回答全部六个问题**，使用数字，而不是形容词。
3. **给出结论：**
   - 🟢 GREEN — 予以投入
   - 🟡 YELLOW — 予以投入，但设置削减触发条件
   - 🔴 RED — 终止或修改

## 输出格式

```markdown
# CFO Review: <plan>
**Date:** YYYY-MM-DD
**Reviewer:** cs-cfo-advisor

## Numbers
- Burn multiple: X.Xx
- Runway (base/bull/bear): X / X / X months
- LTV/CAC top channel: X.Xx, payback Y months
- Gross margin: X% (trend: Y)
- Dilution this round: X%
- Bear-case survival: PASS / FAIL

## Verdict
🟢 GREEN | 🟡 YELLOW | 🔴 RED

## Conditions (if YELLOW)
- Cut trigger: <metric> < <threshold> → <action>
- Review checkpoint: <date>

## Recommendation
[3 concrete next steps]
```

## 路由

- `/cs:decide` — 记录结论
- `/cs:execute` — 如果结论为 GREEN，则制定 90 天计划
- `/cs:boardroom` — 如果涉及多个角色，则升级处理

## 相关内容

- 智能体：[`cs-cfo-advisor`](../../agents/cs-cfo-advisor.md)
- 技能：[`cfo-advisor`](../../../skills/cfo-advisor/SKILL.md)

---

**版本：** 1.0.0