---
name: deliver-launch-checklist
description: Creates a cross-functional pre-launch checklist covering engineering, design, marketing, support, legal, and operations readiness, with owners, dates, and go/no-go criteria so nothing is missed before release. Use for significant or cross-team launches, not a small single-team change. For the customer-facing announcement of what shipped, use deliver-release-notes instead.
license: Apache-2.0
metadata:
  phase: deliver
  version: "2.2.0"
  updated: 2026-07-04
  category: coordination
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# 上线检查清单

上线检查清单是一份全面的验证文档，用于确保在发布功能或产品之前所有功能均已准备就绪。它协调工程、QA、设计、市场、支持、法务和运营等团队，以避免上线当天出现意外。优秀的上线检查清单能够尽早暴露阻塞项，并为上线准备情况建立共同责任。

## 适用场景

- 在任何重要发布前 1-2 周
- 在上线规划启动会议期间
- 协调跨职能发布时
- 在重大版本发布或功能推出之前
- 事故发生后，用于改进上线流程

## 不适用场景

- 你正在通过实验验证是否应该发布 -> 使用 `measure-experiment-design`
- 你需要面向客户发布已上线内容的公告 -> 使用 `deliver-release-notes`
- 上线已经完成，你想了解结果或进行复盘 -> 使用 `measure-experiment-results` 或 `iterate-retrospective`
- 变更规模较小、由单个团队完成，且不涉及跨职能协作：上线检查清单会增加流程负担却无法带来价值；应在迭代中进行跟踪

## 说明

当被要求创建上线检查清单时，请遵循以下步骤：

1. **定义上线背景**
   记录上线内容、上线时间以及关键利益相关者。确定上线级别（重大版本、小型功能、实验），因为这会影响检查清单的范围。

2. **收集功能需求**
   针对每个职能团队（工程、QA、市场等），明确上线前必须完成、验证或到位的事项。区分阻塞项（必须完成）和锦上添花项。

3. **分配负责人和日期**
   每个检查清单项目都需要一名负责人和目标完成日期。明确负责人可以建立责任归属；日期则便于跟踪进度。

4. **识别依赖项和阻塞项**
   标记会阻塞其他工作或受外部因素阻塞的事项。尽早暴露这些问题，以便团队解除阻塞。

5. **定义上线/不上线标准**
   建立明确的上线决策标准。必须满足哪些条件？由谁做最终决定？

6. **记录回滚计划**
   每次上线都应有回滚策略。记录在上线后出现严重问题时如何恢复。

7. **安排同步节奏**
   确定团队何时检查清单进度（每日站会、T-2 天评审、上线日同步）。

## 输出格式

使用 `references/TEMPLATE.md` 中的模板来组织输出。一份完整的检查清单应填写模板中的每个部分：上线概览；工程准备情况；QA 与测试；设计与 UX；市场与沟通；客户支持；法务与合规；运营与基础设施；分析与监控；上线/不上线标准；回滚计划；同步安排；以及待解决问题。

## 质量检查清单

在最终确定之前，请验证：

- [ ] 已涵盖所有功能领域
- [ ] 每个项目都有负责人和目标日期
- [ ] 已明确区分阻塞项和锦上添花项
- [ ] 上线/不上线标准具体且可衡量
- [ ] 已记录并测试回滚计划
- [ ] 已安排同步节奏

## 示例

请参阅 `references/EXAMPLE.md` 以获取完整示例。