---
name: opportunity-solution-tree
description: "Build an Opportunity Solution Tree (OST) to structure product discovery — map a desired outcome to customer opportunities, possible solutions, and experiments. Based on Teresa Torres' Continuous Discovery Habits. Use when the team is unclear what to build next, when multiple opportunities compete, or before writing a PRD for a complex feature space."
when_to_use: |
  Apply when:
  - The team knows the outcome to improve but not which opportunity to chase
  - Multiple feature ideas exist and the team isn't sure which solves the right problem
  - CTO asks "what should we build to improve retention / conversion / NPS?"
  - Starting discovery on a new product area
  Guards — do NOT apply when:
  - The feature and problem are already well-defined (go straight to /prd)
  - You have a single, validated user story (use /prd directly)
  - This is a bug fix or technical debt item
effort: medium
allowed-tools: Read, Write, WebFetch, WebSearch
paths:
  - "docs/discovery/**"
---
# 机会解决方案树（OST）

通过将期望成果 → 客户机会 → 解决方案 → 实验连接起来，系统化地组织产品发现。避免在验证问题空间之前就直接跳到解决方案。

基于 Teresa Torres 的 *Continuous Discovery Habits*（2021）。

---

## 四层结构

```
                    ┌─────────────────────┐
                    │   DESIRED OUTCOME   │  ← single measurable metric
                    └──────────┬──────────┘
               ┌───────────────┼────────────────┐
        ┌──────┴─────┐  ┌──────┴─────┐  ┌──────┴─────┐
        │Opportunity │  │Opportunity │  │Opportunity │  ← customer pain/need
        │     A      │  │     B      │  │     C      │
        └──────┬─────┘  └──────┬─────┘  └────────────┘
        ┌──────┴───┐    ┌──────┴───┐
    ┌───┴──┐ ┌───┴──┐ ┌───┴──┐ ┌───┴──┐
    │Sol 1 │ │Sol 2 │ │Sol 3 │ │Sol 4 │  ← possible solutions
    └───┬──┘ └──────┘ └───┬──┘ └──────┘
  ┌────┴────┐         ┌───┴────┐
  │ Exp 1   │         │ Exp 2  │          ← fast experiments
  └─────────┘         └────────┘
```

**关键原则：**
- 每次只聚焦一个期望成果——不要试图解决所有问题
- 机会是客户的问题或需求，绝不是解决方案
- 在选择某个解决方案之前，针对每个机会生成 ≥3 个解决方案
- 实验是验证假设成本最低的方式
- 这棵树是一份动态文档——随着认知的增加，每周更新

---

## 如何构建 OST

### 第 1 步——定义期望成果

确认或帮助用户明确树顶部的一个可衡量成果。

好的成果：
- “将 7 日留存率从 20% 提高到 35%”
- “将首次实现价值所需的时间从 3 天缩短到 1 天”
- “将免费用户到付费用户的转化率从 2% 提高到 5%”

不好的成果（应拒绝这些）：
- “构建更好的新手引导”——这是一个解决方案
- “改进产品”——无法衡量
- “发布功能 X”——这是一个产出

如果用户无法给出指标，请询问：“需要达到什么条件，你才会认为这项工作取得了成功？”

### 第 2 步——根据研究梳理机会

从客户访谈、数据分析、支持工单或 NPS 反馈中，识别 3–7 个客户机会（痛点、未满足的需求、愿望）。

**从客户的视角描述每个机会：**
- ✅ “我很难弄清楚哪个套餐适合我”
- ✅ “我无法快速找到过去的购买记录”
- ✅ “我担心自己的数据是否安全”
- ❌ “用户需要更好的搜索功能”——这是一个解决方案

**使用机会得分确定优先级（Dan Olsen，*The Lean Product Playbook*）：**
```
Opportunity Score = Importance × (1 − Satisfaction)
```
对客户进行调查：让他们为每项需求的重要性（0–1）和当前满意度（0–1）评分。
- 高重要性 + 低满意度 = 最高得分 = 最佳机会
- 绘制重要性与满意度对比图——左上象限是最佳区域

### 第 3 步——生成解决方案（先发散，再收敛）

针对每个最高优先级的机会，从三个角度进行头脑风暴，提出 ≥3 个解决方案：
- **产品经理视角**：哪些用户体验或产品变更可以解决这一问题？
- **设计师视角**：可以进行哪些交互或视觉变更？
- **工程师视角**：可以采用什么技术方法？（往往最具创造力）

规则：
- 不要执着于第一个想法——要进行比较和权衡
- “最好的想法往往来自工程师”——要包含技术解决方案
- 各解决方案应相互独立（针对同一机会提出不同的解决方案）

### 第 4 步——设计实验

针对最有前景的解决方案，设计 1–2 个快速实验：

| 实验 | 待验证的假设 | 方法 | 成功指标 | 工作量 |
|------------|------------------|--------|---------------|--------|
| <实验名称> | <此实验要验证的认知> | <A/B 测试 / 假门测试 / 原型 / 访谈> | <指标 + 阈值> | <1 天 / 3 天 / 1 周> |

**假设类别（按以下顺序确定优先级）：**
1. **价值**：用户会想要它吗？（最重要，应最先测试）
2. **可用性**：用户能弄明白如何使用吗？
3. **可行性**：我们能构建它吗？
4. **商业可持续性**：商业上可行吗？

**低成本实验类型：**
- 现有产品：A/B 测试、假门测试、原型、用户访谈、数据分析
- 新产品：XYZ 假设（“至少 X% 的 Y 会做 Z”）、落地页、礼宾式 MVP

### 第 5 步——可视化并记录

编写 `docs/discovery/OST-<outcome-slug>.md`：

```markdown
# Opportunity Solution Tree: <Outcome>

**Desired outcome**: <metric> from <current> to <target> by <date>
**Last updated**: <date>

## Opportunity map

| # | Opportunity | Importance | Satisfaction | Opportunity Score | Priority |
|---|------------|-----------|-------------|-------------------|---------|
| A | <customer need> | 0.8 | 0.3 | 0.56 | 1st |
| B | <customer need> | 0.7 | 0.6 | 0.28 | 3rd |
| C | <customer need> | 0.6 | 0.2 | 0.48 | 2nd |

## Solutions for top opportunities

### Opportunity A: <name>
| Solution | Description | Experiment |
|---------|-------------|-----------|
| Sol A1 | <description> | <experiment> |
| Sol A2 | <description> | <experiment> |
| Sol A3 | <description> | <experiment> |

## Active experiments

| Experiment | Assumption | Status | Result |
|-----------|-----------|--------|--------|
| <name> | <assumption> | Running / Done | <result or pending> |

## Learning log

- <date>: Discovered <insight> from <source>. Killed <solution> / promoted <opportunity>.
```

---

## 与 /prd 集成

当某个机会通过验证并选定解决方案后：
→ 使用已验证的机会作为问题陈述来运行 `/prd`
→ OST 的机会评分数据会直接用于 PRD 第 3 节（成功指标）和第 4 节（目标用户）

---

## 反模式

❌ **机会是伪装后的解决方案**：“用户需要一个搜索栏”是解决方案。“用户找不到过去的购买记录”才是机会。

❌ **跳过发散阶段**：为每个机会选择想到的第一个解决方案。做出选择前，始终要生成 ≥3 个解决方案。

❌ **实验耗时超过 1 周**：如果需要超过一周才能获得认知，那它就不是实验——而是功能。

❌ **只更新一次机会解决方案树**：OST 是一项持续性实践。随着认知的积累，每周更新一次。

❌ **结果过多**：每棵树只对应一个结果。如果有多个结果，应建立多棵树，或选择优先级最高的结果。