---
name: tool-design-sprint-readiness
description: Pre-sprint diagnostic that determines whether a team should run a Design Sprint now, postpone it, or do prerequisite work first. Produces a Go / Conditional Go / Wait verdict with diagnosis, recommended preconditions, attendee list, customer recruiting plan, and pre-sprint activities. Use when a team is considering starting a Design Sprint and wants a fast yes/no diagnosis before committing five days of team time and customer recruiting cost.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: design-sprint
  move: readiness
  category: coordination
  frameworks:
    - design-sprint
    - sprint
    - character-note-and-vote
  timebox_minutes: 45
  roles:
    - facilitator
    - pm
    - decider
  prerequisites: []
  inputs:
    - challenge description
    - existing hypothesis (from Foundation Sprint or other source)
    - customer access status
    - decider availability
    - team composition draft
  outputs:
    - readiness verdict
    - diagnosis
    - recommended preconditions
    - recommended attendee list
    - customer recruiting plan
    - pre-sprint activities
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 设计冲刺准备度

评估设计冲刺是否适合团队当前的情况。设计冲刺的失败代价很高：一个由 4-7 人组成的团队连续投入五天，再加上招募客户的成本（通常需要向 5 名陌生人支付酬金），以及原型构建成本。一次 30-45 分钟的准备度诊断，可以在做出这项投入之前识别出这些失败模式。

系列契约：[`docs/reference/skill-families/design-sprint-skills-contract.md`](../../docs/reference/skill-families/design-sprint-skills-contract.md)。此技能属于 `design-sprint-skills`，并遵循该系列的 frontmatter 和 Decider Checkpoint 要求。

## 适用时机

- 团队正在考虑启动一次设计冲刺，需要在投入五天时间和客户招募工作之前快速进行诊断。
- 团队刚刚完成 Foundation Sprint，正在决定下一次测试应采用设计冲刺、更小规模的实验，还是直接构建。Founding Hypothesis 作为可选的输入上下文使用（不需要单独的桥接技能产物）。
- 日程上已经安排了设计冲刺，团队希望确认前置条件（Decider、客户、原型媒介）是否已经就绪。
- 在第一次设计冲刺结果不明确后重新进行设计冲刺：用于确认新的挑战定义和客户触达渠道已经准备就绪。

## 不适用时机

- 团队已经决定运行设计冲刺，只需要准备简报。请改用 `tool-design-sprint-brief`。
- 团队没有明确的挑战，仍处于探索阶段。请先进行问题定义或 Foundation Sprint；设计冲刺依赖一个值得进行冲刺的挑战。
- 低风险的小幅调整，此时投入五天团队时间并不相称。请改用更轻量的实验设计。
- 无法获得周五测试所需的客户，也没有现实可行的招募计划。无法在周五进行测试的设计冲刺，只是一个没有学习环节的四天工作坊。
- 没有可用的 Decider，且无法任命一位。设计冲刺要求在周三和测试前的周四快速做出决策；没有决策权，冲刺最终只会产出选项，而无法形成承诺。

## 此技能产出的内容

一个包含六个部分的单一打包产物：

1. **准备度结论**：Go / Conditional Go / Wait
2. **诊断**：哪些已经到位，哪些仍然缺失，哪些尚不确定
3. **建议的前置条件**（当结论为 Wait 或 Conditional Go 时）：团队在冲刺开始前应完成的前置工作
4. **建议的参与者名单**（当结论为 Go 或 Conditional Go 时）：应在场的 4-7 人及其角色预期
5. **客户招募计划**（当结论为 Go 或 Conditional Go 时）：目标画像、来源、人数、激励、招募负责人、招募截止时间（通常为周五前 7-10 天）
6. **冲刺前活动**（当结论为 Go 时）：周一之前几天内需要完成的准备工作

请参阅 `references/TEMPLATE.md` 了解规范结构，并参阅 `references/EXAMPLE.md` 查看使用 Brainshelf 图书目录线程编写的完整示例。

## 推演输入

该技能会基于以下输入执行一次推演，以生成评定结果：

| 输入 | 技能如何处理该输入 |
|---|---|
| 挑战描述 | 判断该挑战是否值得进行冲刺（是否足够具体，能够在 4 天内制作原型；是否足够重要，值得投入 5 个团队日） |
| 既有假设（来自 Foundation Sprint 或其他来源） | 确认存在可测试的赌注，而不是探索性发现。FS 评分卡中风险最高的假设会成为候选冲刺问题 |
| 客户接触状态 | 关键因素。如果无法在周五现实地接触客户，冲刺就无法进行测试 |
| 决策者姓名及整周可用情况 | 确认决策者至少能够参加周一上午、周三上午（热图 + 超级投票）以及周五下午（决策者评审）；理想情况下参加全部 5 天 |
| 团队组成草案 | 根据 4-7 人的规模范围检查团队名单；标记缺失的角色（负责构建原型的工程人员、负责绘制草图的设计人员、负责客户访谈的研究员或 PM） |
| 原型媒介的可行性 | 确认能够使用所选媒介在 1 天内完成原型（可点击原型、幻灯片、服务角色扮演、纸质原型、实体模型） |
| （可选）后勤限制 | 确认所有参与者实际上都能够腾出连续五天的时间 |

如果缺少某项承重输入，或该输入的可信度较低，该技能会明确标记出来，并提出如何在周一之前补齐信息。

## 准备度标准（8 项规范检查）

该技能依据以下八项标准评估团队，这些标准源自 Sprint（Knapp、Zeratsky、Kowitz）、GV 的《你的想法值得进行冲刺吗？》以及 Character Capital 的 Design Sprint 指南：

1. **挑战已明确且值得进行冲刺。** 足够具体，能够在 4 天内制作原型；也足够重要，以至于走错方向会付出高昂代价。
2. **利害关系足够重大。** 否则团队会犹豫、争论，或默认盲目构建。冲刺的合理性取决于它所替代的事项。
3. **决策者能够参加承重环节。** 最低要求：周一上午（确定方向）、周三上午（热图 + 超级投票）、周五下午（决策者评审）。理想情况下参加全部 5 天。
4. **团队规模合适（4-7 人）。** 少于 4 人会削弱技能覆盖；多于 7 人会减慢决策速度。
5. **团队能够腾出连续 5 天。** 核心参与者不得部分出席；临时专家可以参加特定环节。
6. **已确保周五测试所需的客户接触（或能够在 7-10 天内招募到客户）。** 需要 5 名符合目标画像的客户，支付酬金，并安排在周五上午至下午早些时候参加测试。
7. **原型媒介能够在 1 天内完成。** 可点击原型（Figma）、幻灯片（Keynote）、服务角色扮演、纸质原型、实体模型，或其他能够由 2 人在周四完成构建的媒介。
8. **冲刺产出有后续推进路径。** 团队已准备好在周五评分卡结果出来后采取行动（构建、迭代、转向备选方案或停止）。没有后续承诺的冲刺最终会变成无人承接的学习成果。

| 模式 | 评定结果 |
|---|---|
| 8 项标准均明确满足 | **进行** |
| 有 1-2 项标准属于“黄色警示”，但可以在周一前的 1-2 周内解决 | **有条件进行**，并记录准备工作 |
| 有 3 项或更多标准未通过，或第 1、3、6 项中的任何一项完全未通过 | **等待**，并开展建议的前置工作 |

将这些标准视为承重结构，而不是可以钻空子的清单。一个用“我们会在周四之前想办法”来掩盖无法接触客户的团队，应该得到 Wait，而不是 Conditional Go。

## 常见陷阱

- **冲刺作秀。** 领导层早已决定要构建什么；开展冲刺只是为了获得政治掩护。周五的评分卡无法改变这一决定。如果情况如此，诚实的裁决是 Wait，团队应该升级处理这种错位，而不是白白耗费 5 天时间。
- **没有决策者，或由委员会充当决策者。** 一个缺乏真正授权的“本周决策者”无法让周三的超级投票真正生效。如果真正的决策者无法参加那些承重时刻，就应推迟。
- **周五无法接触客户。** 这是冲刺失败最常见的原因。招募 5 个陌生人需要 7-10 天；一旦准备状态为 Go，就应立即开始招募，而不是等到周一。如果客户接触渠道不确定，在确认招募人员和来源之前，裁决应为 Wait。
- **挑战范围过大，无法在一周内完成。** “重新设计入门流程”范围太大；“为 B2B 试用客户设计并测试首次注册流程”则符合冲刺规模。如果无法界定挑战范围，应先进行问题框定。
- **将 Design Sprint 与 Foundation Sprint 混为一谈。** Foundation Sprint 用于选择战略方向（2 天、无原型、无客户）。Design Sprint 用于验证已选定的方向（5 天、制作原型、接触客户）。如果团队尚未选择方向，他们首先需要的是 Foundation Sprint，而不是 Design Sprint。
- **因为“反正我们要做”而跳过诊断。** 这与 FS 准备度检查中的失败模式相同：诊断成本是 45 分钟；一次失败冲刺的成本则是 35-40 个工作日的人力、客户酬金以及机会成本。

## 规范来源

- Knapp, J., Zeratsky, J., and Kowitz, B. *Sprint: How to Solve Big Problems and Test New Ideas in Just Five Days*. Simon and Schuster, 2016. 第 2 章 “Set the Stage”，介绍判断项目是否值得进行冲刺的标准。
- GV Design Sprint Guide. “Is Your Idea Sprint-Worthy?” https://www.gv.com/sprint/
- Character Capital. “When to Sprint.” https://www.character.vc
- Google Design Sprint Kit. 冲刺前检查清单。 https://designsprintkit.withgoogle.com/

## 跨技能使用

此技能是 design-sprint-skills 系列的入口。它没有前置条件（`metadata.prerequisites` 字段特意留空）。

当裁决为 Go 时，下一步自然应调用 `tool-design-sprint-brief`，以锁定挑战、团队、招募计划、原型媒介和后勤安排。当裁决为 Wait 时，团队通常会先完成前置工作（问题框定、Foundation Sprint、客户招募准备），然后再次调用此技能。

直接从 Foundation Sprint 进入的团队，应将 Founding Hypothesis 作为输入上下文。该假设中风险最高的假设（通常标记在 FS assumption scorecard 中）会成为 `tool-design-sprint-brief` 的首要候选冲刺问题（该工具会锁定冲刺问题）；随后，周一的 `tool-design-sprint-map-and-target` 会在上午进一步细化已锁定的问题。不存在也不需要桥接技能；相关叙事交接过程在 `_workflows/foundation-to-design.md` 以及两份用户指南中均有说明。

`tool-note-and-vote` may be invoked once during the readiness conversation if the team disagrees on whether a Design Sprint is the right tool (vs. a smaller experiment or direct build). In practice, the diagnostic is usually conclusive.

## 决策者检查点

此技能以 `references/TEMPLATE.md` 中的决策者检查点结束。决策者需对结论（通过 / 有条件通过 / 暂缓）签字确认，接受诊断结果，并明确承诺在关键出席时段参加。没有决策者签字确认时，结论仅供参考；签字确认后，该结论即成为触发（或推迟）冲刺及招募工作的正式承诺。