---
name: "cfo-review"
description: "/cs:cfo-review <plan> — Numerate-skeptic interrogation of any plan that touches money. Unit economics, runway, dilution, capital allocation. Use when a plan commits meaningful spend — e.g. a hiring wave, a fundraise decision, or a new channel budget."
---
# /cs:cfo-review — CFO 强制提问

**命令：** `/cs:cfo-review <plan>`

精于计算的怀疑论者会对任何涉及资金的事项进行压力测试。在任何支出或融资之前，先回答六个问题。

## 何时运行

- 批准任何超过收入 1% 的支出之前
- 新增招聘申请之前
- 进行任何融资谈话之前
- 调整定价或单位经济模型之前
- 签署多年期合同之前

## CFO 的六个问题

### 1. 消耗率与现金跑道
**消耗倍数是多少？在基准 / 乐观 / 悲观情景下还剩几个月的现金？**
- 消耗倍数 = 净消耗 ÷ 净新增 ARR。高于 2 倍就是问题。
- 如果悲观情景少于 12 个月，你已经处于融资模式。

### 2. 单位经济模型
**每个渠道的 LTV / CAC 是多少？排名前 2 的渠道回本周期是多少？**
- LTV / CAC > 3 倍是健康的。回本周期 < 12 个月是健康的。
- 如果其中任何一项不达标，不要扩大该渠道的规模。

### 3. 稀释路径
**如果该计划需要融资，在基准估值和悲观估值下的稀释是多少？**
- 每轮融资的创始人稀释比例。
- 到未来 2 轮融资为止的累计稀释比例。

### 4. 资本配置替代方案
**如果这笔钱不花在这里，还可以投向哪里？预期回报是什么？**
- 三个替代方案：招聘、产品、营销。
- 明确说明机会成本。

### 5. 收入质量
**毛利率是多少？在规模扩大时如何变化？**
- 如果毛利率随着规模扩大而下降，说明商业模式存在问题。
- 收入成本的增长速度应低于收入。

### 6. 悲观情景下的存续能力
**如果收入只有计划的 50%，公司能否存活 18 个月？**
- 默认存活是不可妥协的要求。
- 如果不能，提前确定触发削减的条件。

## 工作流

1. **运行计算：**
   ```bash
   python ../../../c-level-advisor/skills/cfo-advisor/scripts/burn_rate_calculator.py
   python ../../../c-level-advisor/skills/cfo-advisor/scripts/unit_economics_analyzer.py
   python ../../../c-level-advisor/skills/cfo-advisor/scripts/fundraising_model.py
   ```
2. **回答全部六个问题**，使用数字而不是形容词。
3. **应用结论：**
   - 🟢 GREEN — 批准资金
   - 🟡 YELLOW — 在设置削减触发条件的前提下批准资金
   - 🔴 RED — 否决或修改

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
- `/cs:execute` — 如果为 GREEN，则制定 90 天计划
- `/cs:boardroom` — 如果涉及多个角色，则升级处理

## 相关内容

- Agent：[`cs-cfo-advisor`](../../agents/cs-cfo-advisor.md)
- Skill：[`cfo-advisor`](../../../c-level-advisor/skills/cfo-advisor/SKILL.md)

---

**版本：** 1.0.0