---
name: develop-spike-summary
description: Documents the results of a completed technical or design spike, capturing the original question, approach, evidence-backed findings, and a clear proceed-or-not recommendation so the team does not re-litigate the exploration. Use once a time-boxed investigation has concluded. For the architecture decision the spike informs, use develop-adr instead; for research-based exploration, use discover-interview-synthesis.
license: Apache-2.0
metadata:
  phase: develop
  version: "2.2.0"
  updated: 2026-07-04
  category: coordination
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 技术预研总结

技术预研总结记录限时探索的结果——这是一项在承诺实施之前，为减少不确定性而进行的聚焦调查。技术预研回答诸如“我们能否与这个 API 集成？”或“这项技术是否适用于我们的使用场景？”等具体问题。总结会记录调查结果，以便团队做出明智的决策，而无需技术预研参与者重复说明。

## 适用场景

- 完成限时技术探索之后
- 评估技术选型或供应商选项时
- 完成需要为团队决策提供依据的概念验证工作之后
- 调查拟议解决方案的可行性时
- 在承诺投入工程资源采用新方法之前

## 不适用场景

- 你要记录的是最终形成的架构决策本身 -> 使用 `develop-adr`；技术预研提供信息，ADR 做出决策
- 探索内容是用户研究，而不是技术或设计可行性研究 -> 使用 `discover-interview-synthesis`
- 你想提出技术预研所指向的解决方案 -> 使用 `develop-solution-brief`
- 技术预研尚未开展：此技能用于记录结果；请先设定时间限制并开展探索

## Instructions

当被要求记录一次技术预研时，请遵循以下步骤：

1. **清晰陈述问题**
   说明该技术预研旨在回答的具体问题。好的技术预研问题应当聚焦，并且能够在可用的时间限制内得到回答。如果问题在技术预研过程中发生了变化，请同时记录原始版本和最终版本。

2. **定义时间限制**
   记录分配的时间（例如 3 天）以及实际花费的时间。如果技术预研超出了时间限制，请解释原因，并注明任何剩余工作。

3. **描述方法**
   说明尝试了什么、按什么顺序尝试，以及为什么这样做。这有助于未来的读者理解所采用的方法，以及是否考虑过其他方法。

4. **提供有证据支持的发现**
   记录所了解到的内容，并以具体证据作为支持——代码示例、性能基准、截图或 API 响应。区分已验证的发现与仍需进一步测试的假设。

5. **给出明确建议**
   直接回答原始问题：继续推进、不应推进，或在满足条件的情况下推进。避免含糊其辞——团队需要可执行的指导。

6. **记录产物**
   链接到技术预研期间创建的任何代码、原型、图表或文档。这些产物在总结之外通常也具有持续价值。

7. **记录开放问题**
   说明技术预研未能回答的问题，以及可能需要开展的额外调查。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的技术预研总结应填写模板中的每个部分：概述；背景；方法；发现；建议；产物；开放问题；以及后续事项。

## 质量检查清单

定稿前，请确认：

- [ ] 原始问题已清晰陈述
- [ ] 已记录时间限制（分配时间与实际时间）
- [ ] 发现有证据支持，而不仅仅是观点
- [ ] 建议直接回答了该问题
- [ ] 产物（代码、图表）已链接或附加
- [ ] 开放问题明确指出了剩余的未知事项

## 示例

请参阅 `references/EXAMPLE.md`，其中包含一个完整示例。