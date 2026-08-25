---
name: tool-design-sprint-decide-and-storyboard
description: Day 3 (Wednesday) move of a Design Sprint that runs the art museum layout, heat map, speed critique, straw poll, Decider supervote, rumble-vs-all-in-one decision, and the storyboard that drives Thursday's prototype build. The most decision-heavy day of the sprint. Use Wednesday morning and afternoon after Tuesday's sketches are collected and attribution-stripped. Produces the canonical 5-15 step storyboard that becomes the build spec.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: design-sprint
  move: decide-and-storyboard
  category: decision
  frameworks:
    - design-sprint
    - sprint
    - character-note-and-vote
  timebox_minutes: 210
  roles:
    - facilitator
    - decider
    - pm
    - design
    - engineering
    - researcher
  prerequisites:
    - tool-design-sprint-sketch
  inputs:
    - all solution sketches (from Tuesday)
    - map and target (for storyboard framing)
  outputs:
    - art museum layout
    - heat map
    - speed critique notes per sketch
    - straw poll results
    - supervote (Decider's choice)
    - rumble vs all-in-one decision
    - storyboard (5-15 step)
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 设计冲刺：决策与故事板（星期三）

星期三是设计冲刺中决策最密集的一天。该技能依次执行艺术博物馆布局（将草图匿名张贴在墙上）、热力图（在有潜力的部分上静默贴圆点投票贴纸）、快速评议（每张草图 3 分钟，总结团队所看到的内容）、非正式投票（每位团队成员的首选）以及决策者的超级投票（触发故事板制作的最终决定）。随后，团队决定采用对比方案（将两张草图制作成相互竞争的原型故事板），还是一体化方案（制作一张草图的故事板）。这一天最终产出一个 5-15 步的故事板，用于推动星期四的构建工作。

系列契约：[`docs/reference/skill-families/design-sprint-skills-contract.md`](../../docs/reference/skill-families/design-sprint-skills-contract.md)。此技能属于 `design-sprint-skills`。

## 何时使用

- 现在是设计冲刺的第 3 天，星期二的草图已经收集完毕、去除作者信息，并上传到共享工作区。
- 决策者会全程参加上午的活动（热力图、评议、非正式投票和超级投票按惯例在 09:00-12:30 进行）。
- 团队已经接受：超级投票由决策者作出，而不是通过共识平均得出。
- 星期四的原型构建需要在星期三结束前拿到故事板，否则星期四早上就无法顺利开始构建。

## 何时不要使用

- 星期二的工作尚未结束。返回 `tool-design-sprint-sketch`；没有独立完成的草图，热力图就没有意义。
- 草图作者的信息泄露到了星期三上午。促导者必须在热力图开始前重新去除作者信息；根据草图作者进行投票会污染整个流程。
- 决策者缺席。星期三的超级投票不能委托他人代行；没有决策者，这一天只能产出建议，而不是决定。
- 团队把超级投票当作咨询性意见。超级投票就是最终决定。星期四早上重新争论该决定，意味着冲刺失败。

## 此技能产出什么

一个包含七个部分的整合产物：

1. **艺术博物馆布局**：用于展示草图的排列方式（通常使用墙面或共享 Figma 看板）；去除作者信息；以随机顺序将草图标记为 A / B / C / D / 等。
2. **热力图**：静默放置圆点投票贴纸（通常每位投票者有 3 个小圆点），贴在任意草图中最具吸引力的部分上；投票者可以将多个圆点叠加在同一个元素上。
3. **快速评议记录**：由促导者（或轮换的团队成员）对每张草图进行 3 分钟的结构化讲解，总结团队所看到的内容；草图作者不得解释自己的草图；疑虑以“让我担心的是”记录下来。
4. **非正式投票结果**：每位团队成员在自己作决定时会选择的草图上放置一张较大的贴纸（通常每位投票者有 1 个大圆点）。该投票不具约束力，用于向决策者提供信息。
5. **超级投票**：决策者放置自己的超级投票贴纸（通常为 3 个大圆点或一张颜色明显不同的贴纸）。超级投票就是最终决定。如果采用对比方案，决策者可以在不同草图上放置多个超级投票。
6. **对比方案与一体化方案的决定**：决策者选择为一张草图制作故事板（一体化方案；默认选项），或为两张草图制作相互竞争的原型故事板（对比方案；当超级投票明确分散在两种不同的方法上时采用）。
7. **故事板**：根据获得超级投票的草图制作 5-15 步的故事板；每个面板展示客户看到了什么以及他们会做什么；具体程度应足以让星期四的构建工作无需重新争论设计即可开始。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 图书目录周三产物示例。

## 周三时间结构

完整的周三工作坊约 7 小时（09:00-12:30 + 13:30-17:00）。该 Skill 随着一天的推进逐步产出配套产物：

- **09:00-09:15**：欢迎致辞 + 回顾周二内容 + 介绍周三议程
- **09:15-09:30**：布置艺术博物馆；Facilitator 确认草图已去除署名信息，并标记为 A/B/C/D
- **09:30-09:45**：热图（静默进行；15 分钟；团队在有吸引力的部分贴圆点贴纸）
- **09:45-10:45**：快速评议（每张草图 3 分钟；评议自己的草图时，绘制者保持沉默）
- **10:45-11:00**：休息
- **11:00-11:15**：无记名投票（静默进行；每人将 1 个大圆点贴在自己的选择上）
- **11:15-11:30**：Decider 进行超级投票，并决定采用 Rumble 还是 all-in-one
- **11:30-12:30**：确定故事板框架（哪些面板最重要；要覆盖地图中的哪些步骤；故事板范围）
- **12:30-13:30**：午餐
- **13:30-16:30**：构建故事板（由 Facilitator 主导；团队贡献面板内容；故事板最终达到 5-15 个面板）
- **16:30-17:00**：日终回顾；准备周四构建启动（谁负责构建、谁提供支持、使用哪些工具、哪些内容要在夜间预先构建）

该 Skill 的 210 分钟时间盒涵盖由 Facilitator 主导的环节（热图设置、评议、无记名投票、超级投票、故事板构建）。

## 常见陷阱

- **用共识漂移取代 Decider 的超级投票。** 最常见的失败模式是：团队进行投票，Facilitator 取平均结果，而 Decider 对平均结果盖章认可。Decider 的决定就是 Decider 的决定；无记名投票只是输入，不是结果。
- **故事板过于模糊。** “用户拍摄一本书”不是一个故事板面板；“用户打开相机界面，将相机对准手臂伸直拿着的书，在 1.5 秒内看到底部卡片中出现已识别的封面，然后点击该卡片进行确认”才是。模糊的故事板会迫使周四的构建者重新讨论设计。
- **为了节省时间而跳过评议。** 评议会暴露故事板必须解决的问题。跳过评议会产出一个故事板，到了周四，这些本应在周三解决的问题会再次全部浮现。
- **绘制者解释自己的草图。** 在评议期间，绘制者应保持沉默。这样做的目的是测试草图在没有艺术家讲解的情况下是否能够传达意图。如果团队无法读懂草图，这是数据，而不是问题。
- **在 all-in-one 更合适时选择了 Rumble（或反之）。** 当两个经过超级投票的不同方案都值得测试，并且团队有能力在周四构建两个原型时，Rumble 才是合适的选择。默认选择是 all-in-one。Rumble 是例外，而不是常规做法。
- **故事板范围过大。** 应为 5-15 个面板，而不是 50 个。故事板覆盖周一确定的目标时刻，外加 1-2 个设置面板和 1-2 个结果面板；它不覆盖完整产品。

## 跨 Skill 使用

前置条件：`tool-design-sprint-sketch`。Decide 和 Storyboard 会使用周二的草图作为输入。没有独立完成的草图，该 Skill 就没有可用于绘制热图的素材。

此技能在上午调用 `tool-note-and-vote` 两次：一次用于热力图（小圆点投票），一次用于草案投票（大圆点投票）。超级投票本身是决策者在查看两种投票分布后的决定；它不会委托给 note-and-vote。

本冲刺中的下一次调用：周四上午调用 `tool-design-sprint-prototype-plan`。

## 规范来源

- Knapp, J., Zeratsky, J., and Kowitz, B. *《Sprint》*. Simon and Schuster, 2016. 周三章节（第 11-13 章）。
- GV Design Sprint Guide. “冲刺周三。” https://www.gv.com/sprint/
- Character Capital. “设计冲刺第 3 天。” https://www.character.vc
- Google Design Sprint Kit. “周三议程模板 + 故事板工作表。” https://designsprintkit.withgoogle.com/

## 决策者检查点

此技能以 `references/TEMPLATE.md` 中的决策者检查点结束。当天较早时候由决策者进行的超级投票才是实质性决策；日终检查点用于确认故事板已经可以开始构建（足够具体；涵盖目标时刻以及准备面板和结果面板；不再有含糊其辞之处）。如果没有签字确认，周四的构建就会从模糊不清开始，而周五的测试则可能变成对错误产物的测试。