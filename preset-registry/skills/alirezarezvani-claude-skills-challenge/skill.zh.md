---
name: "challenge"
description: "Pre-mortem plan analysis. Imagine the plan failed 12 months from now and work backwards to find the weaknesses. Surfaces assumptions, dependencies, and execution risks before committing resources. Use when before significant resource commitment, before presenting to a board or investors, when feedback has been one-sidedly positive, or when there is pressure to move fast and figure it out later."
---
# /em:challenge — 预演失败计划分析

**命令：** `/em:challenge <plan>`

在现实暴露任何计划的弱点之前，系统性地找出它们。目的不是扼杀计划，而是让它经得起现实的考验。

---

## 核心理念

大多数计划都因可预见的原因而失败。不是运气不好，而是错误的假设。高估了需求。低估了复杂性。存在无人质疑的依赖关系。时间安排在电子表格中看似合理，在现实世界中却并非如此。

预演失败法：**想象现在是 12 个月后，而这个计划遭遇了惨败。然后倒推原因。为什么？**

这不是悲观主义。而是构建不会崩塌之物的方法。

---

## 何时进行挑战

- 在为计划投入大量资源之前
- 在向董事会或投资者展示之前
- 当你发现自己听到的全是对计划的正面反馈时
- 当计划需要多个外部依赖条件同时到位时
- 当存在快速推进并“以后再想办法”的压力时
- 当你对计划感到兴奋时（兴奋意味着需要更严格地审视）

---

## 挑战框架

### 第 1 步：提取核心假设
在检验计划之前，需要揭示它所假定为真的一切。

针对计划的每个部分，提出以下问题：
- 要让它奏效，哪些条件必须成立？
- 我们对客户行为做出了哪些假设？
- 我们对竞争对手的反应做出了哪些假设？
- 我们对自身的执行能力做出了哪些假设？
- 它依赖哪些外部因素？

**常见假设类别：**
- **市场假设** — 市场规模、增长率、客户付费意愿、购买周期
- **执行假设** — 团队能力、执行速度、不需要进行重要招聘
- **客户假设** — 他们存在这个问题、他们知道自己存在这个问题、他们愿意付费解决它
- **竞争假设** — 现有企业不会做出回应、不会有新进入者、护城河依然有效
- **财务假设** — 资金消耗率、收入实现时间、CAC、LTV 比率
- **依赖项假设** — 合作伙伴会按约交付、API 不会发生变化、监管规定不会改变

### 第 2 步：评估每项假设

对提取出的每项假设，从两个维度进行评估：

**置信水平（你有多确定它是真的）：**
- **高** — 已通过数据、客户访谈、市场调研验证
- **中** — 大方向正确，但尚未验证
- **低** — 看似合理，但未经检验
- **未知** — 我们完全不知道

**假设错误时的影响（如果这项假设不成立，会发生什么）：**
- **致命** — 计划彻底失败
- **高** — 严重延期或成本超支
- **中** — 需要进行大量返工
- **低** — 可控的调整

### 第 3 步：绘制脆弱性图谱

低/未知置信度 × 致命/高影响构成的矩阵，代表风险最高的假设。

**脆弱性 = 低置信度 + 高影响**

这些不是应该忽略的问题，而是你正在下注的地方。问题在于：你是否在有意识地下注？

### 第 4 步：找出依赖链

许多计划失败，并非因为某一项假设出错，而是因为多项假设必须同时成立。

梳理依赖链：
- 假设 B 是否依赖于假设 A 先成立？
- 如果最先出问题的环节失败，会导致多少个下游环节出问题？
- 关键路径是什么？哪些环节没有任何余量？

### 第 5 步：测试可逆性

对于每个关键脆弱点：如果这个假设在第 3 个月被证明是错误的，你会怎么做？

- 能否转向？
- 能否缩减范围？
- 资金是否已经花出？
- 是否已经作出承诺？

可逆性越低，就越需要在投入之前进行更严格的验证。

---

## 输出格式

**挑战报告：[计划名称]**

```
CORE ASSUMPTIONS (extracted)
1. [Assumption] — Confidence: [H/M/L/?] — Impact if wrong: [Critical/High/Medium/Low]
2. ...

VULNERABILITY MAP
Critical risks (act before proceeding):
• [#N] [Assumption] — WHY it might be wrong — WHAT breaks if it is

High risks (validate before scaling):
• ...

DEPENDENCY CHAIN
[Assumption A] → depends on → [Assumption B] → which enables → [Assumption C]
Weakest link: [X] — if this breaks, [Y] and [Z] also fail

REVERSIBILITY ASSESSMENT
• Reversible bets: [list]
• Irreversible commitments: [list — treat with extreme care]

KILL SWITCHES
What would have to be true at [30/60/90 days] to continue vs. kill/pivot?
• Continue if: ...
• Kill/pivot if: ...

HARDENING ACTIONS
1. [Specific validation to do before proceeding]
2. [Alternative approach to consider]
3. [Contingency to build into the plan]
```

---

## 按计划类型分类的挑战模式

### 产品路线图
- 我们正在构建的是客户愿意付费购买的产品，还是他们口头上说想要的产品？
- 速度估算是否考虑了团队的实际产能，而不是理论产能？
- 如果核心功能所需时间是预估的 3 倍，会发生什么？
- 当需求发生冲突时，谁负责作出决策？

### 市场进入计划
- ICP 的实际转化率是多少，而不是期望的转化率是多少？
- 成交需要接触多少次？你是否具备与之匹配的销售能力？
- 如果前 10 笔交易需要 3 个月而不是 1 个月，会发生什么？
- “先切入再扩张”是真正可行的策略，还是仅仅一种期望？

### 招聘计划
- 如果关键岗位需要 4 个月而不是 6 周才能招到合适的人，会发生什么？
- 计划是否依赖于留住某些可能离职的特定人员？
- 计划是否考虑了适应期，通常需要 3～6 个月才能达到完全生产力？
- 如果人员扩张比收入增长提前 6 个月，会对资金消耗产生什么影响？

### 融资计划
- 如果领投方拒绝投资，你的备选方案是什么？
- 你是否对融资耗时 6 个月而不是 3 个月的情况进行了建模？
- 如果本轮融资以目标区间的低位金额完成，按照当前资金消耗速度，你还有多长的资金续航期？
- 如果最终只融到目标金额的 50%，哪些假设会失效？

---

## 最难回答的问题

这些是人们往往会跳过的问题：
- “悲观情景是什么，而不是基准情景是什么？”
- “如果完全相同的计划由一支我们不信任的团队执行，它还能奏效吗？”
- “有哪些事情因为令人不适而没有被我们公开说出来？”
- “谁有动机让这个计划听起来比实际情况更好？”
- “这个计划的敌对者会首先攻击什么？”

---

## 交付成果

`/em:challenge` 的输出并不是停止行动的许可，而是一张脆弱性地图。现在，你可以有意识地作出决策：验证高风险假设、对冲关键风险，或者在充分知情的情况下接受你正在进行的押注。

未知风险是危险的。已知风险是可控的。