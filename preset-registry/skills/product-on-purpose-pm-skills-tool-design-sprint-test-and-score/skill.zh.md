---
name: tool-design-sprint-test-and-score
description: Day 5 (Friday) sprint-closing move of a Design Sprint that produces the bundled Friday artifact covering per-customer interview observations, best quotes, scorecard grid (sprint questions by customers), observed patterns, hot takes from each team member, and the Decider summary (build, iterate, pivot, or stop, plus highest-confidence learning, most important revision, and next artifact). Use Friday after Thursday's prototype passes trial run and during/after the 5 customer interviews. The sprint's payoff artifact.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: design-sprint
  move: test-and-score
  category: discovery
  frameworks:
    - design-sprint
    - sprint
  timebox_minutes: 270
  roles:
    - facilitator
    - researcher
    - decider
    - pm
    - design
    - engineering
  prerequisites:
    - tool-design-sprint-prototype-plan
  inputs:
    - prototype (built Thursday; NOT produced by this skill)
    - interview script (from tool-design-sprint-prototype-plan)
    - sprint questions (from Monday's map-and-target)
    - founding hypothesis (optional; from a prior Foundation Sprint)
    - participant schedule
  outputs:
    - per-customer interview observation notes
    - best quotes
    - scorecard grid
    - observed patterns
    - hot takes
    - decider summary
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 设计冲刺测试与评分（星期五）

星期五是冲刺的成果检验日。5 位目标画像客户运行原型，团队进行观察；团队将观察结果综合为针对冲刺问题的评分卡；负责人在当天结束前决定是构建 / 迭代 / 转向 / 停止。本周投入的 35-40 人日加上客户招募成本，最终转化为一个可执行的决策。

系列契约：[`docs/reference/skill-families/design-sprint-skills-contract.md`](../../docs/reference/skill-families/design-sprint-skills-contract.md)。此技能属于 `design-sprint-skills`。

## 适用场景

- 现在是设计冲刺的第 5 天，且星期四的原型通过了试运行。
- 已安排 5 位确认参加的参与者（规范数量；如果 1 人取消且没有候补，则为 4 人；少于 4 人时暂停）。
- 团队能够实时观察访谈（线下或通过 Zoom 分组讨论室），并在当天完成综合分析。
- 负责人星期五下午在场，参加访谈后的复盘（规范时间为太平洋时间 14:00-18:00，涵盖对第 4-5 场访谈的观察，以及在太平洋时间 17:30 前完成负责人的复盘）。

## 不适用场景

- 星期四的原型未通过试运行。重新运行试验；如果星期四太平洋时间 19:00 时仍然失败，则推迟星期五的安排。
- 确认参加的客户少于 3 位。根据已批准的决策 3，规范指导人数为 5 位客户；3-4 位或 6-7 位会触发记录在案的警告；少于 3 位或多于 7 位则应触发重新决策（推迟测试或拆分测试）。注意：v0.1.0 系列验证器不会机械地强制执行这些阈值（队列数量位于 EXAMPLE 工件中，而不在 frontmatter 中）；强制执行将作为 v2.16 验证器扩展候选项。
- 负责人无法参加访谈后的复盘时间段。没有负责人，这一天只能产出观察结果，无法做出决策。
- 团队计划使用此技能撰写高管备忘录。根据已批准的决策 4：高管备忘录的撰写委托给 `foundation-stakeholder-update`（现有的 pm-skills 基础技能）；此技能仅产出负责人的总结。

## 此技能产出什么

一个包含六个部分的单一打包工件：

1. **每位客户的访谈观察笔记**：每位客户对应一个部分；涵盖对 Context（Act 2）的反应、Tasks（Act 4）中的行为及时间戳、Debrief（Act 5）中的反应，包括定价。于当天访谈期间实时记录。
2. **最佳引述**：团队标记为最具信号价值的 5-15 条客户逐字引述。用于负责人的总结，以及任何下游的宣传或规划工件。
3. **评分卡网格**：行是冲刺问题（来自星期一）；列是 5 位客户；每个单元格填写 Y / N / partial / unclear，并附一行简短备注；最右侧列是团队当天针对每个问题做出的决定（Validated / Invalidated / Inconclusive）。
4. **观察到的模式**：包含 4 个类别（有效、犹豫、失去信任、意外），每个类别包含 2-4 个模式。每个模式都注明表现出该模式的客户数量。
5. **直觉判断**：在团队综合分析使判断产生偏差之前，为每位团队成员记录其星期五的个人判断，每人一段简短文字。团队成员并行默写。
6. **负责人总结**：负责人的决策（build / iterate / pivot / stop / reframe），以及最有把握的学习、团队会对原型方向做出的最重要修改，以及团队将产出的下一个工件（冲刺后的交付物）。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 图书目录周五产物示例。

## 周五时间结构

周五是时间最长的一天：客户访谈一早开始（规范时间为太平洋时间 09:00），并由决策者评审为一天画上句号（规范时间为太平洋时间 17:30）。

- **09:00-16:30**：进行 5 场客户访谈，每场 50-60 分钟，时间安排为 09:00 / 10:30 / 12:00 / 14:00 / 15:30。每个时段包括：10 分钟准备 + 50-55 分钟访谈 + 5 分钟团队碰头会，用于在下一位客户到来前记录观察结果。
- **13:00-14:00**：午餐（第 3 场约 13:00 结束；午餐与第 3 场到第 4 场之间的缓冲时间重叠）
- **16:30-16:45**：最后一位客户访谈收尾；整理观察记录
- **16:45-17:00**：团队成员同时安静地写下关键判断
- **17:00-17:30**：决策者评审评分卡和关键判断；做出决策
- **17:30-18:00**：记录决策者总结；团队开始进行冲刺后续安排（下一步日历安排、下游交付物分配）

此技能的 270 分钟时间盒涵盖综合分析部分（评分卡、模式、关键判断、决策者总结）。5 场访谈本身（约 5 小时的访谈时间）与持续的观察记录同步进行。

## 评分卡机制

评分卡是一个二维网格。行是周一进行地图梳理与目标设定时提出的冲刺问题（通常为 3-7 个）。列是 5 位客户（匿名 ID）。每个单元格回答：这位客户的访谈是否验证、否定，或无法确定该行问题？

| | C1 | C2 | C3 | C4 | C5 | 当天结束时的决策 |
|---|---|---|---|---|---|---|
| Q1 | Y | Y | N | Y | partial | 已验证（5 个中有 4 个） |
| Q2 | N | Y | unclear | N | N | 已否定（5 个中有 3 个为 N，5 个中有 1 个为 Y） |
| ... | ... | ... | ... | ... | ... | ... |

当天结束时的决策规则：
- **已验证**：5 个中有 4 个或 5 个 Y（强信号）；5 个中有 3 个 Y 且没有 N（方向性信号）。对于 4 人客户组：4 个 Y 为已验证；3 个 Y 且没有 N 为方向性信号。
- **已否定**：5 个中有 4 个或 5 个 N。对于 4 人客户组：4 个 N 为已否定；3 个 N 且没有 Y 为方向性信号。
- **无法确定**：其他所有模式。无法确定的问题会安排后续跟进（规模更小的测试、定量实验或第二次设计冲刺）。

决策者可以推翻当天结束时的决策，但应记录推理过程。

## 常见陷阱

- **观察记录过于叙事化，而不是行为化。**“客户似乎感到困惑”是叙事；“客户在捕获按钮上悬停了 4 秒却没有点击，随后快速连续点击了两次”是行为。行为是数据；叙事是解读。
- **通过共识填写评分卡单元格。**每位观察者都应写下自己对单元格的判断；差异应被呈现，而不是被平均掉。如果团队中有 2 人认为 C1 对 Q1 的判断为 Y，另有 2 人认为是 N，则该单元格应标记为“分歧”，并附上解释性说明。
- **在团队综合分析后才写关键判断。**关键判断应在团队综合分析之前，由每个人同时、安静地写下。在团队复盘后再写，会产生共识，而不是信号。
- **决策者因为“我们想要更多数据”而迟迟无法做出决策。**周五的任务是基于现有数据做出决策。如果确实无法做出决定，那么决定就是“迭代”（调整后重新进行冲刺）。“暂缓”不是答案。
- **因为“我们周一再整理”而跳过决策者总结。**团队离开前应在周五完成总结记录。周一已经太晚；上下文会快速消退。
- **把“5 位客户”当作一个软性目标。**根据规范研究，5 位客户是对模式的信心跨过临界点的数量。少于 4 位会产生嘈杂的信号；多于 7 位则会导致综合分析过载，却不会带来多少额外信号。

## 跨技能使用

前置条件：`tool-design-sprint-prototype-plan`。周五环节使用周四环节产出的原型和访谈脚本。如果没有经过试运行且可正常工作的原型，周五环节无法进行。

此技能不会调用 `tool-note-and-vote`。周五环节没有投票环节；评分卡单元格是个人填写结果，Decider 摘要则由 Decider 决定。

根据已批准的决策 4，此技能不会编写高管备忘录。如果团队需要高管备忘录或利益相关者更新，下一次调用应为 `foundation-stakeholder-update`，该技能会使用 Decider 摘要作为输入。

冲刺结束后的下游调用：如果 Decider 的决定是“构建”，则调用 `deliver-prd`；如果“迭代”需要进行规模更小的后续实验，则调用 `measure-experiment-design`；如果“转向”需要记录转向理由，则调用 `iterate-pivot-decision`；如果上述任一事项需要与利益相关者沟通，则调用 `foundation-stakeholder-update`。

## 权威来源

- Knapp, J., Zeratsky, J., and Kowitz, B. *Sprint*. Simon and Schuster, 2016. 周五章节（第 18–20 章）。
- GV Design Sprint Guide. “Sprint Week Friday.” https://www.gv.com/sprint/
- Character Capital. “Design Sprint Day 5.” https://www.character.vc
- Google Design Sprint Kit. “Friday scorecard template + interview observation worksheet.” https://designsprintkit.withgoogle.com/
- Nielsen, J. (2000). “Why You Only Need to Test with 5 Users.” Nielsen Norman Group. https://www.nngroup.com/articles/why-you-only-need-to-test-with-5-users/（关于 5 人客户队列规模的权威研究）。

## 决策者检查点

此技能以 `references/TEMPLATE.md` 中的决策者检查点结束。Decider 的决定（构建 / 迭代 / 转向 / 停止 / 重新定义）就是该检查点；没有这一决定，冲刺就无法结束。该检查点还会记录团队接下来负责产出的工件（PRD、规模更小的实验、转向备忘录或利益相关者更新），这正是触发周一冲刺后工作顺利开始的条件。