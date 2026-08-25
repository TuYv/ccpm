---
name: discover-competitive-analysis
description: Creates a structured competitive analysis comparing features, pricing, and positioning across 3-5 direct and indirect competitors, with a 2x2 map and actionable strategic recommendations. Use before entering a market, planning differentiation, or after losing deals. For market size rather than competitor positioning, use discover-market-sizing instead.
license: Apache-2.0
metadata:
  phase: discover
  version: "2.2.1"
  updated: 2026-07-31
  category: research
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 竞争分析

竞争分析能够深入了解竞争格局，帮助产品团队理解自身相对于替代方案所处的位置，并发现实现差异化的机会。有效的分析并不追求穷尽所有竞争对手，而是聚焦于能够为产品战略提供依据的可行动洞察。

## 适用场景

- 进入新市场或推出新产品之前
- 为现有产品制定差异化战略时
- 进行季度或年度战略规划评审期间
- 评估自建还是采购的决策时
- 输掉交易后，以了解自身的竞争定位
- 帮助新加入的产品团队成员了解市场背景时

## 不适用场景

- 你需要了解市场规模，而不是竞争对手定位 -> 使用 `discover-market-sizing`
- 你要在整个商业模式层面压力测试战略差异化 -> 使用 `foundation-lean-canvas`，或在 Foundation Sprint 中使用 `tool-foundation-sprint-differentiation`
- 你想了解客户为何更换产品 -> 使用 `define-jtbd-canvas`；它通过用户任务视角审视竞争方案
- 竞争格局已经完成梳理，而你需要界定问题 -> 使用 `define-problem-statement`

## 说明

当被要求创建竞争分析时，请遵循以下步骤：

1. **定义范围**
   明确你要分析的内容：特定功能领域、整体产品定位，还是定价策略。确定 3-5 个关键竞争对手：直接竞争对手（提供相同解决方案）、间接竞争对手（针对相同问题提供不同解决方案）以及潜在颠覆者。

2. **收集情报**
   通过公开来源研究每个竞争对手：官方网站、定价页面、G2/Capterra 评价、新闻稿、招聘信息和客户证言。记录哪些内容是你能够验证的，哪些内容是你的推断。

3. **构建功能矩阵**
   创建关键能力的对比表格。聚焦于对目标客户重要的功能，而不是罗列详尽的检查清单。使用一致的评级标准（例如：完整、部分、无、未知）。

4. **分析定位**
   使用与你的市场相关的维度，将竞争对手绘制在 2x2 定位矩阵上（例如：价格与功能、易用性与能力、SMB 与企业级）。识别尚未被满足的市场空间。

5. **评估优势与劣势**
   针对每个竞争对手，记录其真正的优势（他们在哪些方面做得比你更好）和劣势（他们在哪些方面存在不足）。避免贬低竞争对手。保持尊重有助于制定更好的战略。

6. **识别战略影响**
   将观察结果转化为可执行的建议：在哪些领域正面竞争，在哪些领域实现差异化，应当重点强调哪些信息，以及哪些空白代表着机会。

7. **注明置信度**
   标明哪些结论基于已验证的数据，哪些结论属于推断。竞争情报的可靠性各不相同。要如实说明不确定性。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。完整的分析应填写模板中的每个部分：概览；市场背景；已分析的竞争对手；功能对比矩阵；定价对比；定位图；竞争对手深度分析；竞争差距与机会；战略建议；来源与置信度；以及后续步骤。

## 质量检查清单

定稿前，请确认：

- [ ] 明确定义范围（面向哪个市场、细分领域和使用场景）
- [ ] 分析 3-5 个竞争对手，包括直接竞争对手和间接竞争对手
- [ ] 功能对比聚焦于与客户相关的能力
- [ ] 定位图采用有意义且具有差异化的维度
- [ ] 如实认可竞争对手真正具备优势的方面
- [ ] 建议具体且可执行
- [ ] 记录来源和置信度等级

## 示例

请参阅 `references/EXAMPLE.md` 中的完整示例。