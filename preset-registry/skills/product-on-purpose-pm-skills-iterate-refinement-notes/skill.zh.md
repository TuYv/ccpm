---
name: iterate-refinement-notes
description: Documents backlog refinement session outcomes including stories refined, estimates, questions raised, and decisions made. Use during or after refinement to capture the results and share with absent team members.
license: Apache-2.0
metadata:
  phase: iterate
  version: "2.1.0"
  updated: 2026-06-10
  category: coordination
  frameworks: [triple-diamond, lean-startup, design-thinking]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# Refinement Notes

精炼记录记录待办事项精炼（梳理）会议的结果：讨论了什么、进行了怎样的估算，以及做出了哪些决策。它们可供错过会议的团队成员快速了解情况，也可作为历史记录，追踪用户故事如何从想法逐步演变为已准备好进入 Sprint 的状态。

## When to Use

- 在精炼会议期间实时记录决策
- 精炼完成后与缺席的团队成员分享结果
- 新团队成员入职时，用于说明待办事项的背景
- Sprint 规划前，回顾已经完成精炼的内容
- 由于时间经过较久，用户故事需要再次精炼时

## When NOT to Use

- 你需要编写用户故事本身 -> 使用 `deliver-user-stories`
- 你需要的是一般性的会议总结，而不是待办事项精炼记录 -> 使用 `foundation-meeting-recap`
- 你正在进行回顾会议 -> 使用 `iterate-retrospective`
- 已精炼的用户故事需要列举其失败场景 -> 使用 `deliver-edge-cases`

## Instructions

当被要求记录精炼笔记时，请遵循以下步骤：

1. **Record Session Metadata**
   记录日期、参会者和会议时长。这有助于追踪哪些人参与了决策，以及讨论发生的时间。

2. **List Stories Discussed**
   对于每个用户故事，记录结果：估算点数、精炼状态、关键讨论点，以及对原始范围所做的任何修改。

3. **Document Questions Raised**
   记录会议期间无法回答的问题，并为其指定负责人和截止日期。不要让这些问题被遗忘；它们经常会阻碍 Sprint 规划。

4. **Capture Decisions Made**
   记录任何范围决策、达成一致的技术方案或优先级变更。如果没有文档记录，这些决策所包含的宝贵背景信息很容易丢失。

5. **Note Action Items**
   记录用户故事达到可进入 Sprint 状态前所需的任何后续工作：需要创建的原型图、需要开展的技术预研、需要咨询的利益相关者。

6. **Flag Blocked Stories**
   清楚标识在阻塞因素解决前无法推进的用户故事。说明阻塞因素是什么，以及由谁负责解决。

7. **Plan Next Session**
   记录下一步应精炼的内容，以及所需的准备工作。

## Output Format

使用 `references/TEMPLATE.md` 中的模板来组织输出。完整的笔记应填写模板中的每个部分：Session Info；Summary；Stories Refined；Stories Summary Table；Questions Raised；Decisions Made；Action Items；Blocked Stories；Parking Lot；以及 Next Session。

## Quality Checklist

完成前，请确认：

- [ ] 所有讨论过的用户故事都已记录结果
- [ ] 未解决的问题都已指定负责人
- [ ] 决策已记录，并包含足够的背景信息
- [ ] 阻塞的用户故事已清楚标识
- [ ] 错过会议的读者无需询问他人，就能了解每个用户故事的结果以及接下来要做什么

## Examples

请参阅 `references/EXAMPLE.md` 中的完整示例。