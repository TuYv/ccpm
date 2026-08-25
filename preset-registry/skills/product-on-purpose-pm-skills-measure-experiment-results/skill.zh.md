---
name: measure-experiment-results
description: Documents the results of a completed experiment or A/B test with statistical analysis, learnings, and recommendations. Use after experiments conclude to communicate findings, inform decisions, and build organizational knowledge.
license: Apache-2.0
metadata:
  phase: measure
  version: "2.1.0"
  updated: 2026-06-10
  category: reflection
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 实验结果

实验结果文档记录测试假设时发生的情况，包括统计结果、分群分析、经验总结和明确的建议。优秀的结果文档能够将单个实验转化为组织知识，从而改进未来的决策。

## 适用场景

- A/B 测试或实验达到统计显著性之后
- 实验提前结束时（无论出于何种原因）
- 向未参与实验的利益相关者传达发现
- 决定是否发布、迭代或终止某项功能时
- 建立经验总结库，为未来的实验提供参考

## 不适用场景

- 实验尚未设计或运行 -> 使用 `measure-experiment-design`
- 结果要求做出方向性决策 -> 使用 `iterate-pivot-decision`；此技能负责报告证据，另一个技能负责做出决策
- 希望将可迁移的经验纳入组织知识库 -> 后续使用 `iterate-lessons-log`
- 数据是调查回复，而不是受控实验 -> 使用 `measure-survey-analysis`

## 说明

当被要求记录实验结果时，请遵循以下步骤：

1. **总结实验**
   提供背景信息：测试了什么、何时运行、获得了多少流量。如果存在原始实验设计文档，请添加链接。

2. **重述假设**
   提醒读者你原本认为会发生什么，以及原因是什么。这有助于理解结果。

3. **呈现主要结果**
   清晰展示主要指标结果：对照组和处理组的数值分别是多少？包括统计显著性（p 值）、置信区间和样本量。诚实说明结果是否具有结论性。

4. **分析次要指标**
   展示用于确保没有造成意外损害的护栏指标。注意任何意外变化的次要指标——无论是正向还是负向。

5. **细分数据**
   查找不同用户分群之间的差异化影响（平台、使用时长、套餐类型等）。有时整体结果会掩盖重要的分群层面洞察。

6. **提炼经验**
   除了数字之外，你还学到了什么？包括意外发现、引发的问题，以及对产品假设的影响。负面结果同样具有宝贵的学习价值。

7. **提出建议**
   明确说明：我们应该发布、迭代，还是终止？用证据支持建议。如果决策较为复杂，请解释其中的权衡。

8. **定义后续步骤**
   明确接下来会发生什么：用于发布的工程工作、后续实验、需要继续监测的指标，或需要更新的文档。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的结果报告应填写模板中的每个部分：Summary；Hypothesis Recap；Results；Segment Analysis；Visualization；Learnings；Recommendation；Next Steps；以及 Appendix。

## 质量检查清单

定稿前，请确认：

- [ ] 已清晰说明统计方法和显著性
- [ ] 已包含置信区间（而不仅仅是 p 值）
- [ ] 已检查分群分析中的差异化影响
- [ ] 已报告次要指标或护栏指标
- [ ] 得出的经验不止停留在数字层面
- [ ] 建议明确且可执行
- [ ] 如实报告负面或无法得出结论的结果

## 示例

请参阅 `references/EXAMPLE.md`，其中提供了一个完整示例。