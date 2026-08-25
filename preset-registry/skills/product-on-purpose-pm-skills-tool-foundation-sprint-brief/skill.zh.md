---
name: tool-foundation-sprint-brief
description: Pre-sprint brief that locks scope, the decision the sprint must unlock, team and role assignments, logistics, inputs to bring, and success criteria before Day 1 of a Foundation Sprint. Use after the readiness verdict is Go and before the sprint begins. Produces a one-page artifact the team and Decider sign off on as the contract for the next two days.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: foundation-sprint
  move: brief
  category: coordination
  frameworks:
    - foundation-sprint
    - click
  timebox_minutes: 60
  roles:
    - facilitator
    - pm
    - decider
  prerequisites:
    - tool-foundation-sprint-readiness
  inputs:
    - readiness verdict and recommendations
    - initiative description
    - team roster
    - logistics constraints
  outputs:
    - initiative statement and stakes
    - decision the sprint must unlock
    - team roster with role assignments
    - logistics plan
    - existing inputs to bring
    - readiness reaffirmation
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 基础冲刺简报

制作一份单页简报，在第 1 天开始前，让团队就范围、决策目标、参与者、后勤安排和成功标准达成一致。一份精心编写的简报可以避免第 1 天一开始就重新争论“我们为什么要做这件事”；而缺失或含糊不清的简报几乎肯定会导致这种情况。

系列契约：[`docs/reference/skill-families/foundation-sprint-skills-contract.md`](../../docs/reference/skill-families/foundation-sprint-skills-contract.md)。此技能属于 `foundation-sprint-skills`。

## 使用时机

- `tool-foundation-sprint-readiness` 给出的准备度结论为 Go（或前置条件已清除的 Conditional Go）。
- 冲刺的日期已经在日历上锁定，而你需要一份明确说明冲刺目标的文档。
- 团队已经安排了准备活动，而你需要一份书面参考，说明应带来哪些材料。
- 一位持怀疑态度的高管想知道“团队要用两天做什么？”，而你需要一个能放在一页纸上的答案。

## 不要使用的时机

- 冲刺已经开始。简报是准备阶段的产物，而不是冲刺期间的交付物。如果第 1 天正在进行，请改为运行 `tool-foundation-sprint-basics`。
- 准备度结论为 Wait。简报无法解决团队尚未准备就绪的问题；先完成前置条件，然后重新运行准备度评估，再调用此技能。
- 团队想要一份战略文档。简报是内部准备材料，而不是面向利益相关者的交付物。如果需要利益相关者文档，那是下游产物。
- 简报有演变成多页战略文档的风险。停止并重新定义：规范简报只有一页。

## 此技能产出的内容

一份包含以下六个部分的单一整合产物：

1. **项目说明与利害关系**：用一段话说明团队要围绕什么开展冲刺，以及方向错误为何会带来高昂代价。
2. **冲刺必须解锁的决策**：冲刺需要解决的开放性战略问题。用一个句子表达。
3. **包含角色分工的团队名单**：列出参与会议的人员，以及每个人在冲刺各部分中承担的角色。
4. **后勤计划**：日期、时间、地点、形式（线下、远程、混合）、工具和每日节奏。
5. **需要带来的现有输入材料**：团队在冲刺期间应参考的研究、客户案例、竞品记录、指标和约束。
6. **再次确认准备就绪状态**：最后检查 `tool-foundation-sprint-readiness` 给出的 Go 结论是否仍然成立。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 图书目录简报示例。

## 推断输入

| 输入 | 此技能对其的处理方式 |
|---|---|
| 准备度结论和建议（来自 `tool-foundation-sprint-readiness`） | 将建议的参会者、前置条件和冲刺前活动提取到简报中；标记任何尚未完成的前置条件 |
| 项目描述 | 将其压缩为“项目说明”部分中的一段话 |
| 团队名单 | 将人员映射到所需的基础冲刺角色（决策者、引导者、产品经理、设计、工程、客户专家） |
| 后勤约束 | 生成日期/时间/地点/形式/工具矩阵；标记任何会迫使冲刺延长至两天以上的约束 |
|（可选）面向持怀疑态度高管的沟通要点 | 收紧“利害关系”段落，以回应“为什么是现在”以及“为什么是这件事”的疑问 |

## 简报长度规范

简报**必须**控制在一页（或一个屏幕）以内。该技能通过结构设计而非单纯限制字符数来实现这一点：

- 启动陈述：一段话，最多四句话。
- 本次冲刺必须促成的决策：一句话。
- 团队成员名单：每人一行的表格。
- 后勤安排：表格。
- 需携带的输入材料：项目符号列表，最多五项。
- 准备就绪情况再次确认：检查清单。

如果简报超出这一范围，说明冲刺还没开始就已经被过度设计了。解决办法不是写一份更长的简报，而是明确决策目标。

## 常见陷阱

- **过度设计简报。** 简报是准备材料，而不是战略文档。如果其中包含执行摘要、附录，或长度超过一段的“背景”部分，就说明它已经偏离了方向。
- **把简报当作要交付给利益相关者的成果物。** 利益相关者不会阅读简报；他们会阅读最后的创始假设。简报是给团队使用的。公开分享简报会引发冲刺前的争论，而这正是冲刺本应解决的问题。
- **决策目标模糊。** “我们会弄清楚我们的战略”不是一个决策。“我们会在[选项 A]和[选项 B]之间确定一个首选方案”才是。
- **后勤安排失控。** “日期到时候再确定”或“我们有时会采用混合形式开会”，都传达出团队实际上还没有承诺投入本次冲刺。日期和形式要么已经确定，要么之前的准备就绪结论是错误的。
- **跳过准备就绪情况再次确认。** 准备就绪结论只是一个快照。如果某项前置条件有所变化，或决策者自完成准备就绪评估以来可参与的时间发生了变化，简报就需要将其呈现出来，而不是掩盖过去。

## 权威来源

- Character Capital。“Foundation Sprint 指南。”关于冲刺前准备和团队范围界定的章节。
- Knapp, J. 和 Zeratsky, J. *Click: How to Make What People Want*。关于冲刺前准备的建议。
- pm-skills `foundation-meeting-brief` 先例：将适用于会议的简报结构模式调整为适用于 Foundation Sprint 战略场景的模式。

## 跨技能使用

前置条件：`tool-foundation-sprint-readiness`。该简报将准备就绪输出作为其主要输入。当 `prerequisites` 得到遵循时，简报会继承准备就绪结论、参会者建议和冲刺前活动；随后，该技能会对这些内容进行细化并予以确定。

如果团队已经完成了等效的准备工作，但没有明确运行准备就绪技能（例如，熟悉准备就绪标准的经验丰富的冲刺引导者），则可以直接调用简报技能。在这种情况下，技能正文会提示团队确认已满足准备就绪标准，然后再生成简报。

冲刺中的下一次调用：`tool-foundation-sprint-basics`，第 1 天上午。

## 决策者检查点

该技能以 `references/TEMPLATE.md` 中的决策者检查点结束。决策者需要批准范围（决策目标）、团队（成员名单和角色分配）、成功标准（什么情况意味着冲刺成功或不成功），以及冲刺将迫使团队确定一个首选方案而不是保留所有方向这一明确取舍。没有批准，简报只是建议；获得批准后，它就是接下来两天的契约。