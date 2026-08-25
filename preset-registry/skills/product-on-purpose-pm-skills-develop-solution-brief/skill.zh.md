---
name: develop-solution-brief
description: Creates a concise one-page solution overview that communicates the proposed approach, key decisions, and trade-offs. Use when pitching solutions to stakeholders, aligning teams on approach, or documenting solution intent before detailed specification.
license: Apache-2.0
metadata:
  phase: develop
  version: "2.1.0"
  updated: 2026-06-10
  category: ideation
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 解决方案简报

解决方案简报是一份简洁的单页文档，用于传达针对某个问题提出的解决方案。它连接了问题理解与详细规格说明，为利益相关者提供足够的背景，以便就方案达成共识，同时避免陷入实现细节。单页限制能够迫使内容保持清晰并突出重点。

## 适用场景

- 向利益相关者推介解决方案方案，以获得支持
- 让跨职能团队就要构建什么以及为什么构建达成一致
- 在编写详细 PRD 之前记录解决方案意图
- 在较高层次上比较多个解决方案选项
- 向管理层传达产品方向

## 不适用场景

- 利益相关者已经达成一致，而工程团队需要完整规格说明 -> 使用 `deliver-prd`；简报用于推介，PRD 用于规定
- 问题尚未完成定义或达成共识 -> 先使用 `define-problem-statement`
- 你正在记录一个已经作出的决策 -> 使用 `develop-adr`（技术）或 `develop-design-rationale`（设计）
- 你需要比较整个商业模式中的战略选项 -> 使用 `foundation-lean-canvas`

## 指令

当被要求创建解决方案简报时，请遵循以下步骤：

1. **回顾问题**
   用不超过 2-3 句话总结问题。不要重新解释完整的问题陈述——如有需要，引用它即可。读者应立即理解该解决方案要解决的痛点。

2. **描述拟议解决方案**
   用清晰、非技术性的语言解释你要构建什么。重点关注用户体验和核心价值主张。避免实现细节——这里关注的是*做什么*，而不是*怎么做*。

3. **列出关键功能**
   确定构成该解决方案的 3-5 项关键功能。这些应是解决问题所需的最小集合。不要轻易加入锦上添花的功能——单页限制要求内容聚焦。

4. **定义成功指标**
   将解决方案与可衡量的结果联系起来。你将如何判断它是否有效？引用问题陈述中的指标，并设定目标。

5. **承认权衡**
   记录你明确**不**会做什么，以及原因。优秀的解决方案简报会如实说明范围限制，以及经过考虑但被否决的替代方案。

6. **识别风险与缓解措施**
   揭示成功面临的最大风险，以及你应对这些风险的计划。这有助于建立利益相关者的信心，并尽早暴露疑虑。

7. **概述后续步骤**
   提供 3-5 项推动解决方案向前发展的即时行动。明确说明由谁负责什么。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的简报应填写模板中的每个部分：问题回顾；拟议解决方案；关键功能；成功指标；已考虑的权衡；风险与缓解措施；以及后续步骤。

## 质量检查清单

完成定稿前，请确认：

- [ ] 打印时简报适合放在一页内（约 500-700 个单词）
- [ ] 问题回顾简洁明了（最多 2-3 句话）
- [ ] 解决方案描述避免使用技术术语
- [ ] 功能限制在 3-5 项关键能力以内
- [ ] 明确说明了权衡
- [ ] 后续步骤具体且可执行

## 示例

请参阅 `references/EXAMPLE.md` 以查看完整示例。