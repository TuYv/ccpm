---
name: tool-design-sprint-map-and-target
description: Day 1 (Monday) move of a Design Sprint that produces the bundled Monday artifact containing long-term goal, sprint questions (3-7 testable risks), customer or system map (5-15 step flow), expert interview notes, HMW (How Might We) cluster board, and the Decider's chosen target moment. Use Day 1 morning and afternoon after the sprint brief is locked. Sets the design target for Tuesday's sketches and Wednesday's storyboard.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: design-sprint
  move: map-and-target
  category: discovery
  frameworks:
    - design-sprint
    - sprint
    - character-note-and-vote
  timebox_minutes: 105
  roles:
    - facilitator
    - decider
    - pm
    - design
    - engineering
    - researcher
    - customer-expert
  prerequisites:
    - tool-design-sprint-brief
  inputs:
    - sprint brief
    - existing research
    - analytics
    - customer examples
    - expert interview transcripts (run during Monday)
  outputs:
    - long-term goal
    - sprint questions
    - customer or system map
    - expert interview notes
    - HMW cluster board
    - target moment
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 设计冲刺地图与目标（周一）

产出周一的整合产物：定义 1-5 年后成功状态的长期目标；将团队担忧转化为可测试风险的 3-7 个冲刺问题；从关键参与者到结果的 5-15 步客户或系统地图；并行开展的专家访谈笔记；从团队中综合提炼的 HMW（How Might We，我们可以如何）聚类；以及决策者选定的目标时刻。周一的产出将成为周二的设计目标。

系列契约：[`docs/reference/skill-families/design-sprint-skills-contract.md`](../../docs/reference/skill-families/design-sprint-skills-contract.md)。此技能属于 `design-sprint-skills`。

## 何时使用

- 这是设计冲刺的第 1 天，且简报已锁定（通过 `tool-design-sprint-brief`）。
- 团队在整个周一工作坊期间齐聚一堂（线下、远程或混合形式均可）。
- 专家访谈已安排在周一下午进行（特邀专家角色；每次 15-30 分钟）。
- 团队需要从“接下来还有五天的工作”收敛到“这个具体的目标时刻就是我们要制作原型的对象”。

## 何时不要使用

- 简报尚未锁定。返回 `tool-design-sprint-brief`；没有冲刺问题，此技能就没有收敛的方向。
- 挑战范围过于宽泛，以至于“长期目标”会超过 5 年。返回问题框定。
- 团队缺少决策者。周一结束时选择目标时刻是决策者的职责；没有这一决策，团队会在周二分散行动，且没有达成一致的方向。
- 团队已经预先决定了目标时刻。周一的价值在于达成共识；如果目标时刻已经预先决定，周一就会变成走过场式的批准仪式。

## 此技能产出的内容

一个包含六个部分的整合产物：

1. **长期目标**：用一句话定义 1-5 年后的成功状态。具有愿景性质；不可能在本次冲刺中实现，但应当能从目标时刻看见它。
2. **冲刺问题**：将团队担忧转化为可测试风险的 3-7 个问题。表述为“我们能否……？”或“……是否会……？”或“如何……？”；不得表述为解决方案。
3. **客户或系统地图**：从左侧的关键参与者到右侧的结果（长期目标）的 5-15 步流程。包括主要参与者、决策点和当前替代方案。
4. **专家访谈笔记**：综合周一下午访谈的 2-4 位特邀专家的观察结果。以 HMW 候选项的形式呈现，供聚类板使用。
5. **HMW 聚类板**：团队提出的 30-100+ 条 HMW 笔记，聚类为 4-8 个主题；使用 `tool-note-and-vote` 的热力图机制进行投票，以凸显排名靠前的聚类。
6. **目标时刻**：地图上的单个点（或一组紧密相邻的点），由决策者选定为制作原型的目标。周三的故事板从这里开始。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 图书目录周一产物示例。

## 推断输入

| 输入 | 此技能对其的处理方式 |
|---|---|
| 冲刺简报（来自 `tool-design-sprint-brief`） | 提取已锁定的冲刺问题，作为细化的种子；提取挑战陈述，作为长期目标的种子；提取团队名册，用于笔记与投票中的角色分配 |
| 现有研究 | 用于起草客户或系统地图；研究人员在地图环节向团队讲解关键发现 |
| 分析数据 | 为地图中的决策点分支和用户放弃时刻提供定量依据 |
| 客户示例 | 用于验证地图中的关键参与者，并发现地图步骤中的缺口的具体故事 |
| 专家访谈记录（周一期间开展） | 由主持人（通常是 PM 或研究人员）在下午综合为 HMW 候选项 |

## 周一时间结构

完整的周一工作坊约 7 小时（09:00-12:30 + 13:30-17:00）。该技能所需的整套产物会在一天中逐步形成：

- **09:00-09:30**：欢迎致辞 + 简短回顾 + 介绍（不产出任何产物内容）
- **09:30-10:30**：长期目标（一句话）+ 冲刺问题初稿（3-7 个）
- **10:30-12:30**：客户或系统地图初稿（持续进行的白板工作；团队共同构建）
- **12:30-13:30**：午餐 + 第一场专家访谈（客串环节）
- **13:30-15:30**：其余专家访谈（3 场；每场 25 分钟）；团队在访谈过程中持续记录 HMW
- **15:30-16:30**：HMW 聚类板综合；团队补充最终 HMW；引导者进行聚类；团队通过 `tool-note-and-vote` 进行热图投票
- **16:30-17:00**：决策者选定目标时刻；签字确认；团队解散，为周二的草图绘制做准备

该技能的 105 分钟限时涵盖由引导者主持的综合环节（长期目标 + 冲刺问题 + 地图初稿 + HMW 聚类 + 目标选择）。专家访谈和安静的地图扩展工作会并行进行，不计入这段限时。

## 常见陷阱

- **长期目标过于短期。**“在第三季度前发布 Brainshelf MVP”是路线图目标，而不是长期目标。长期目标应着眼于未来 1-5 年，并具有愿景性（“成为 25 岁以上读者记忆和回想书籍的默认方式”）。
- **将冲刺问题表述为解决方案。**“构建相机拍摄流程”是解决方案；“我们能否在不导致用户放弃的情况下，将拍摄时间控制在 3 秒以内？”才是冲刺问题。团队必须将担忧转化为问题，而不是预先确定答案。
- **地图过于详细。**应包含 5-15 个步骤，而不是 50 个。地图用于帮助决策者建立方向认知，而不是用于工程文档。如果地图不断膨胀，引导者必须强制压缩。
- **因为“我们已经知道机会在哪里”而跳过 HMW。**HMW 的价值在于先发散地挖掘机会，再通过投票收敛。预先决定机会所在，会跳过这两个环节。
- **目标时刻选择时决策者缺席。**周一的核心目的就是让决策者选择目标。如果决策者必须提前离开，就必须在其离开前完成目标选择，即使这意味着要压缩 HMW 聚类环节。
- **跳过专家访谈，或由错误的人来主持。**专家能够带来团队无法在内部生成的外部背景信息。跳过专家访谈会让周一的讨论变得闭门造车。将访谈组织成集体会议（而不是小规模的客串式对话）会浪费专家的时间，也会产生价值更低的 HMW 输入。

## 跨技能使用

前置条件：`tool-design-sprint-brief`。Map-and-Target 会使用已锁定的冲刺简报，并在上午对冲刺问题进行细化。没有简报，该技能就没有收敛目标。

该技能会在当天两次调用 `tool-note-and-vote`：一次用于 HMW 聚类热图投票（匿名点投票，以找出排名靠前的 4-8 个聚类），如果决策者希望在做决定前听取团队意见，还可以选择再调用一次，用于目标时刻的超级投票。无论团队投票如何分布，最终决定始终由决策者作出。

Sprint 中的下一次调用：星期二上午的 `tool-design-sprint-sketch`。

## 权威来源

- Knapp, J., Zeratsky, J. 和 Kowitz, B. *Sprint*。Simon and Schuster，2016 年。星期一章节（第 4–7 章）。
- GV Design Sprint Guide。《Sprint Week Monday》。https://www.gv.com/sprint/
- Character Capital。《Design Sprint Day 1》。https://www.character.vc
- Google Design Sprint Kit。《Monday agenda template》。https://designsprintkit.withgoogle.com/

## 决策者检查点

此技能以 `references/TEMPLATE.md` 中的决策者检查点结束。星期一结束时，决策者要做出的决定是选择目标时刻：在客户地图或系统地图上的一个单独节点（或一组紧密相邻的节点），作为星期二的设计目标。如果不做出这一选择，星期二的草图就会在没有共同方向的情况下各自发散。决策者还要确认长期目标、冲刺问题以及排名最高的 HMW 集群；这些内容将成为星期三热力图的导向。