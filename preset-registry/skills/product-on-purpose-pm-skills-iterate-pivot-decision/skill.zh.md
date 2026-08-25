---
name: iterate-pivot-decision
description: Documents a strategic pivot or persevere decision with the evidence, analysis, and rationale. Use when evaluating whether to change direction on a product, feature, or strategy based on market feedback.
license: Apache-2.0
metadata:
  phase: iterate
  version: "2.1.1"
  updated: 2026-06-22
  category: reflection
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 转向决策

转向决策文档记录战略方向变更背后的分析和理由，或记录继续坚持当前方向的决定。基于精益创业中的“转向还是坚持”理念，这份文档确保重大战略决策是基于证据做出的、得到清晰传达的，并为组织学习而保留下来。

## 使用时机

- 经过重要的验证性学习，表明当前方向可能行不通之后
- 在计划好的转向还是坚持检查点（例如 MVP 发布之后）
- 关键假设已被市场反馈证伪时
- 在考虑重大方向变更的战略评审期间
- 当利益相关者正在讨论是否改变方向时

## 不使用时机

- 你正在汇报实验结果，但没有附带方向决策 -> 使用 `measure-experiment-results`
- 该决策属于技术或架构决策，而非方向决策 -> 使用 `develop-adr`
- 你希望在做出任何决定之前探索候选方向 -> 使用 `define-opportunity-tree`
- 团队需要开展阶段结束时的反思仪式 -> 使用 `iterate-retrospective`；转向讨论是决策文档，而不是回顾会议
- 产品尚未构建完成，问题是是否要构建一个全新的想法、功能或范围变更（构建 / 验证 / 砍掉的裁决）-> 使用 `foundation-build-risk-review`；转向决策权衡的是已经发布的内容所获得的市场反馈

## 指令

当被要求记录转向决策时，请遵循以下步骤：

1. **总结当前状态**
   记录你当前正在做什么、已经持续了多久、投入了什么，以及取得了哪些结果。这能让决策立足于现实。

2. **呈现证据**
   汇总所有相关数据：指标、用户反馈、实验结果、市场信号。要全面.include 支持坚持当前方向和改变方向的证据。

3. **审视假设**
   重新审视那些为当前方向提供依据的原始假设。哪些已得到验证？哪些已被证伪？哪些仍未经过测试？

4. **定义选项**
   至少明确三种选项：坚持（继续当前方向），以及两个或更多彼此不同的转向选项。具体描述每个选项.what would change？

5. **分析每个选项**
   根据关键标准评估各个选项：市场机会、竞争优势、团队能力、资源需求和风险。使用证据，而不是观点。

6. **做出决策**
   清晰陈述所选择的方向。解释决策理由，同时承认其中的权衡。如果团队存在分歧，请记录持不同意见的观点。

7. **规划实施**
   概述接下来要发生什么：立即行动、资源需求、新方向的成功标准，以及沟通计划。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的决策文档应填写模板中的每个部分：概览；执行摘要；当前状态；证据摘要；假设审查；考虑过的选项；分析；决策；实施计划；沟通计划；以及附录。

## 质量检查清单

在最终确定之前，请验证：

- [ ] 当前状态包含对结果的客观评估
- [ ] 证据全面，而非经过挑选的片面证据
- [ ] 公平地分析了多个选项
- [ ] 决策依据清晰且基于证据
- [ ] 实施计划具有可操作性
- [ ] 记录了持不同意见的观点

## 示例

请参阅 `references/EXAMPLE.md` 获取完整示例。