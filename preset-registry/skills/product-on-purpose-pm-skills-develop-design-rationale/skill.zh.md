---
name: develop-design-rationale
description: Documents the reasoning behind design decisions including alternatives considered, trade-offs evaluated, and principles applied. Use when making significant UX decisions, aligning with stakeholders on design direction, or preserving design context for future reference.
license: Apache-2.0
metadata:
  phase: develop
  version: "2.1.0"
  updated: 2026-06-10
  category: specification
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 设计决策依据

设计决策依据文档记录设计决策背后的“原因”：促成特定方案的背景、约束条件、考虑过的替代方案以及推理过程。设计本身展示了构建了什么，而决策依据文档则保存了关于为什么要这样构建的组织知识。

## 适用场景

- 做出会影响用户体验的重要 UX 决策时
- 在设计评审前准备利益相关者讨论时
- 存在多个有效方案，且需要说明选择理由时
- 帮助新团队成员了解现有设计决策时
- 重新审视过去的决策，以理解最初的推理过程时
- 设计系统演进过程中记录模式选择时

## 不适用场景

- 决策属于架构决策或技术选型 -> 使用 `develop-adr`（Nygard 格式）
- 需要就整体解决方案方向与利益相关者达成一致 -> 使用 `develop-solution-brief`
- 记录的是探索发现，而不是某项决策 -> 使用 `develop-spike-summary`
- 决策可以轻易撤销且风险较低：决策依据文档会增加流程负担；改为在 PR 或工单中记录推理过程

## 指引

当被要求记录设计决策依据时，请遵循以下步骤：

1. **陈述决策**
   以一句清晰的话概括所做出的设计决策。这句话将作为文档的标题和参考依据。

2. **描述背景**
   说明促成这一决策的情况。你要解决什么问题？存在哪些约束？哪些用户需求影响了方向？包括相关的研究发现。

3. **列出考虑过的选项**
   记录至少 2-3 个经过评估的替代方案。对于每个选项，描述它将呈现的形式及其关键特征。公平地对待所有选项，避免树立稻草人。

4. **定义评估标准**
   明确说明如何评估这些选项：可用性启发式、技术可行性、品牌一致性、用户研究发现、业务需求或设计原则。

5. **解释推理过程**
   逐步说明为什么所选方案最符合这些标准。明确说明权衡取舍——你获得了什么，又牺牲了什么。说明该决策哪些部分可逆，哪些部分不可逆。

6. **记录接受的权衡**
   每项设计决策都包含权衡。说明你放弃了什么，以及为什么这是可以接受的。这种坦诚有助于未来的团队了解当时的约束条件。

7. **记录后续考虑事项**
   记录之后需要关注的事项：需要观察的指标、可能促使重新审视该决策的条件，或需要做出的相关决策。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的决策依据文档应填写模板中的每个部分：决策摘要；背景；考虑过的选项；评估；决策依据；接受的权衡；可逆性；后续考虑事项；支持材料；以及决策历史。

## 质量检查清单

最终确定前，请验证：

- [ ] 决策已在一句话中清晰陈述
- [ ] 上下文说明了“为什么是现在”以及约束条件
- [ ] 公平地记录了多个备选方案
- [ ] 明确列出了评估标准
- [ ] 推理说明了所选方案为何优于备选方案
- [ ] 诚实地承认了权衡
- [ ] 继承该设计的读者无需询问任何人，便能还原所选方案胜出的原因

## 示例

请参阅 `references/EXAMPLE.md`，其中提供了一个完整示例。