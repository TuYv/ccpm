---
name: tool-design-sprint-sketch
description: Day 2 (Tuesday) move of a Design Sprint that structures lightning demos and the four-step independent solution sketch protocol (Notes, Ideas, Crazy 8s, Solution Sketch). Each team member produces one solution sketch individually; the skill orchestrates the day but does not author the sketches themselves. Use Tuesday morning after Monday's target moment is locked. Output is the lightning demo board, sketch assignments, and the cohort of independent sketches that become Wednesday's heat-map material.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: design-sprint
  move: sketch
  category: discovery
  frameworks:
    - design-sprint
    - sprint
  timebox_minutes: 180
  roles:
    - facilitator
    - decider
    - pm
    - design
    - engineering
    - researcher
    - customer-expert
  prerequisites:
    - tool-design-sprint-map-and-target
  inputs:
    - map and target (from Monday)
    - lightning demo sources (each person brings 3 examples)
    - sketch assignment (divide vs swarm)
  outputs:
    - lightning demo board
    - sketch assignment plan
    - four-step sketches from each team member
    - recruiting tracker update
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 设计冲刺草图（星期二）

组织星期二独自但协同的工作。每位团队成员独立且安静地工作，上午制作闪电演示，下午完成四步解决方案草图。该技能负责组织活动；草图由人来完成。星期三的热力图环节依赖于一组彼此独立的草图，且这些草图没有因小组头脑风暴而相互污染。

系列约定：[`docs/reference/skill-families/design-sprint-skills-contract.md`](../../docs/reference/skill-families/design-sprint-skills-contract.md)。此技能属于 `design-sprint-skills`。

## 适用时机

- 现在是设计冲刺第 2 天，星期一的地图和目标产物已经签字确认。
- 每位团队成员至少带来 3 个闪电演示来源（与挑战相关的现有产品、参考资料、类比案例）。
- 团队已经接受安静、独立绘制草图的约束，并且不会退回到小组头脑风暴。
- 草图应在星期二结束前完成，以便星期三上午进行热力图环节。

## 不适用时机

- 星期一的工作尚未结束。返回 `tool-design-sprint-map-and-target`。
- 团队本能地想要以小组形式进行头脑风暴。冲刺方法明确避免这种做法；如果团队不愿承诺独立工作，冲刺就无法产出多样化的草图，热力图也会变成一场人气竞赛。
- 草图步骤被当作原型。草图是纸面或 Figma 画板上的概念探索，不是星期四的可运行原型。
- 草图要求在星期二上午完成。星期二是一整天；赶在午餐前完成，会产出团队星期三无法读懂的草图。

## 此技能产出的内容

一个包含四个部分的整合产物：

1. **闪电演示板**：每位团队成员展示 3 个演示（每个 3 分钟）；引导者从每个演示中提炼出可复用的模式，并记录为一行文字。结果是一个包含 12-21 个模式的板面（4-7 名团队成员 x 每人 3 个演示）。
2. **草图分配计划**：分拆（每个人绘制目标时刻的不同部分）或协同聚焦（所有人绘制同一个目标）。对于 v0.1 设计冲刺，默认采用协同聚焦；分拆适用于使用同一目标进行第二次冲刺、希望扩大覆盖面的团队。
3. **每位团队成员完成的四步草图**：笔记（20 分钟，复习星期一的产出和闪电演示）、创意（20 分钟，绘制粗略草图）、疯狂八法（8 分钟，为最强的创意绘制 8 个变体）、解决方案草图（30-90 分钟，完成最终的 3 格故事板式草图）。
4. **招募跟踪器更新**：Riley（或招募人员）确认星期五的时间段；发现任何取消情况，并在需要时触发备用时间段启用。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 图书目录星期二产物示例。

## 星期二的时间结构

星期二的完整工作坊大约持续 7 小时（09:00-12:30 + 13:30-17:00）。该技能的整合产物将在一天的过程中逐步形成：

- **09:00-09:15**：欢迎致辞 + 星期一回顾 + 星期二议程
- **09:15-10:45**：闪电演示（每人进行 3 次演示，每次 3 分钟 + 主持人提炼 1 分钟 = 每人约 12 分钟；4 人团队 = 约 50 分钟；7 人团队 = 约 85 分钟）
- **10:45-11:00**：休息
- **11:00-11:30**：绘图任务分配 + 笔记步骤（每个人默默回顾星期一的产出和闪电演示板）
- **11:30-12:30**：构思步骤（每个人在自己的笔记本或 Figma 画板中默默涂鸦记录想法）
- **12:30-13:30**：午餐 +（并行进行）招募跟踪表检查
- **13:30-13:40**：疯狂 8 分钟（用 8 分钟绘制最强想法的 8 种变体）
- **13:40-15:30**：解决方案草图（最终的 3 面板草图；全程保持安静；由主持人计时）
- **15:30-15:45**：休息
- **15:45-16:30**：收集草图 + 命名 + 拍照，为星期三的展示板做准备；隐藏绘图者署名（星期三的热力图采用盲评）
- **16:30-17:00**：日终检查；确认草图已上传；确认星期三上午的出席情况

此技能的 180 分钟时间盒涵盖由主持人带领的环节（闪电演示 + 任务分配 + 收集）。默默进行的绘图步骤（笔记、构思、疯狂 8 分钟、解决方案草图）属于个人工作，并行进行；团队成员会一起待在会议室（或视频通话中），但不会协作。

## 常见问题

- **集体头脑风暴。** 这是最常见的失败模式。Sprint 方法明确禁止集体绘图，因为这样产生的草图会向最响亮的声音趋同，而不是产出最佳想法。主持人的职责是在绘图步骤中强制保持安静。
- **草图不够具体。** 一份解决方案草图必须做到：即使没有创作者的讲解，也能让人在星期三早上看懂。如果热力图团队不得不询问“这是什么？”，就说明草图没有达到可读性标准。
- **跳过闪电演示。** 闪电演示不是可有可无的热身环节；它会引入团队原本不会产生的外部模式。跳过它会导致草图只关注内部视角。
- **演示主持人未能提炼可复用模式。** 必须记录每个演示中可复用的模式（而不是完整演示）。“Spotify 的主屏幕”不是一种模式；“带有个性化卡片和一键操作的动态信息流”才是。
- **绘制原型。** 解决方案草图是一个概念；原型是星期四要构建的内容。试图直接绘制原型的草图，会在错误的维度上过度详细（视觉润色、文案），而在正确的维度上细节不足（交互顺序、用户反应）。
- **绘图者署名泄露到星期三的热力图中。** 星期三的热力图采用盲评（不显示绘图者姓名），这样团队投票的是草图，而不是绘图者。如果草图在星期三提交时带有姓名，主持人会将其移除。

## 跨技能使用

前置条件：`tool-design-sprint-map-and-target`。绘图步骤使用星期一确定的目标时刻，作为四步绘图协议的设计目标。没有目标时刻，草图就会在没有共同方向的情况下各自发散。

此技能不会调用 `tool-note-and-vote`。星期二没有投票环节；所有投票都会在草图完成后的星期三进行。

本冲刺中的下一次调用：周三上午的 `tool-design-sprint-decide-and-storyboard`。

## 权威来源

- Knapp, J., Zeratsky, J. 和 Kowitz, B. *Sprint*。Simon and Schuster，2016 年。星期二章节（第 8–10 章），尤其是四步草图流程（第 9 章）。
- GV Design Sprint Guide。“Sprint Week Tuesday。”https://www.gv.com/sprint/
- Character Capital。“Design Sprint Day 2。”https://www.character.vc
- Google Design Sprint Kit。“Tuesday agenda template + four-step sketch handout。”https://designsprintkit.withgoogle.com/

## 决策者检查点

此技能以 `references/TEMPLATE.md` 中的决策者检查点结束。星期二不存在日间决策；决策者在星期二的角色是与其他绘图者一样参与绘制草图（决策者和其他所有人一样独立绘制草图）。星期二结束时的决策者检查点是对后勤事项的确认：所有草图均已收集、已去除署名，并确认周三上午的出席情况。实质性的决策者决断将在周三上午的超级投票环节进行。