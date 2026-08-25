---
name: tool-foundation-sprint-differentiation
description: Day 1 afternoon move of a Foundation Sprint. Converts the morning's Basics frame into a defensible strategic position by scoring differentiator candidates against customer-perceived value, choosing two committed differentiators, plotting alternatives on a 2x2 chart, writing decision principles, and producing a one-page Mini Manifesto. Use after Basics is signed; before Approach Options the next morning.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: foundation-sprint
  move: differentiation
  category: problem-framing
  frameworks:
    - foundation-sprint
    - click
    - character-note-and-vote
  timebox_minutes: 150
  roles:
    - facilitator
    - decider
    - pm
    - design
  prerequisites:
    - tool-foundation-sprint-basics
  inputs:
    - basics bundled artifact
    - differentiation candidates
  outputs:
    - scored differentiator candidates
    - 2 chosen differentiators
    - 2x2 differentiation chart with competitors plotted
    - decision principles list
    - one-page Mini Manifesto
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 基础冲刺差异化

基础冲刺第 1 天下午。团队将上午的基础框架（客户、问题、优势、竞争对手）转化为一个可守御的战略定位。产出是一页式迷你宣言，团队和决策者将在第 1 天战略总结上签字。

系列契约：[`docs/reference/skill-families/foundation-sprint-skills-contract.md`](../../docs/reference/skill-families/foundation-sprint-skills-contract.md)。此技能属于 `foundation-sprint-skills`。

## 何时使用

- 基础冲刺第 1 天下午，午餐后立即进行。
- 基础部分的捆绑产物已由决策者签署；客户、问题、优势和竞争对手地图均已确定。
- 团队已准备好确定产品将占据的战略位置。

## 何时不使用

- 基础部分尚未解决或仍在协商中。差异化依赖于一个稳定的输入框架。
- 团队已经预先选定了差异化因素，只想获得批准。此技能是为真正的决策而设计的；走过场式的批准会浪费整个下午。
- 团队已经失去会议掌控：能量低迷、没有决策者、时间紧迫。与其仓促进行，不如推迟或拆分成更短的环节。
- 这是一次后续冲刺，且现有差异化仍然成立。直接使用 Magic Lenses 和现有定位。

## 此技能产出的内容

一个包含五个部分的单一捆绑产物：

1. **已评分的差异化候选项**：一张包含 8-15 个差异化候选项的表格，按照三个客户感知维度进行评分（客户吸引力、团队交付能力、难以复制）。得分最高的候选项进入 2x2 图表。
2. **两个选定的差异化因素**：团队确定作为战略定位的两个差异化因素。
3. **2x2 差异化图表**：一张以客户感知为基础的图表，将选定的差异化因素与基础部分中的竞争对手集合进行对照绘制。为团队的产品定位命名。
4. **决策原则**：3-5 条将差异化落到实际行动中的原则。每条原则都是一条未来产品规则（“我们始终会优先选择 X，而不是 Y”）。
5. **迷你宣言**：一页式战略总结，以团队的口吻撰写，明确客户、问题、定位，以及产品不是什么。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 示例。

## 流程（150 分钟）

### 步骤 1：生成差异化候选项（15-25 分钟）

每位团队成员静默地产出 3-5 个差异化候选项。合并重复项，然后展示完整集合（通常为 8-15 个候选项）。候选项可以是经典维度（速度、价格、简单性、广度、深度、信任），也可以是定制维度（特定于该产品或市场）。

### 步骤 2：为候选项评分（25-40 分钟）

按照三个维度对每个候选项进行评分，采用 1-5 分制：

- **客户吸引力**：这个客户感知到的维度是否真的会促使客户转而选择其他产品？
- **团队交付能力**：这个团队能否在该维度上以具有竞争力的水平进行构建和运营？
- **难以复制**：如果竞争对手转向，这项优势能持续多久？

将三项分数相加，得出一个粗略评分。排名前 5-7 的候选方案晋级。

### 第 3 步：选择两个差异化因素（通过 note-and-vote，用时 30-45 分钟）

团队通过 `tool-note-and-vote` 将范围缩小到两个差异化因素。这两个因素 MUST 能被客户观察到（而不是内部团队的价值观），并且团队能够交付（而不是理想化目标）。如果评分出现平局或团队意见分裂，由决策者进行超级投票。

### 第 4 步：绘制 2x2 图表（用时 15-25 分钟）

将两个差异化因素作为图表的坐标轴。根据 Basics 中的内容绘制竞争者集合（包括“什么都不做”）。将产品定位在能够占据未被占用空间的位置。如果未被占用的位置距离竞争者聚集区域太远，团队可能正在偏向一个客户无法识别的细分市场；如果该位置与强大的竞争者重叠，则说明差异化还不够强。

### 第 5 步：编写决策原则（用时 20-30 分钟）

将两个差异化因素转化为 3-5 条可执行原则。例如：

- “捕捉是第一优先级的操作。其他所有功能都必须排在快速捕捉路径之后。”
- “默认私密。分享需要主动选择。”
- “在相关内容真正重要时呈现它，而不是按照通知时间表呈现。”

原则不是营销文案，而是未来产品决策所遵循的规则。

### 第 6 步：迷你宣言（用时 15-25 分钟）

决策者以团队的口吻起草一页纸的迷你宣言。语气应朴实、明确、直接说明产品不是什么（这部分是团队经常跳过、但不应该跳过的内容）。

## 推理输入

| 输入 | 该 skill 对其的处理方式 |
|---|---|
| Basics 捆绑产物 | 读取目标客户（用于“客户感知”检查）、问题（用于判断“该差异化因素是否能解决问题”）、优势（用于判断“团队是否能够交付”）以及竞争者地图（用于绘制图表） |
| 差异化候选方案 | 如果预先提供，则预先填充静默构思板；否则团队会在第 1 步中生成这些候选方案 |

## 常见陷阱

- **产品无法交付的营销式主张差异化。** “业内最佳”“由 AI 驱动”“令人愉悦”都不是差异化因素，而是理想化目标。该 skill 会拒绝这些表述，并要求提供团队能够交付的证据。
- **客户无法感知的差异化因素。** “架构优美的代码”对工程师很重要，但对客户并不重要。该 skill 会强制进行“客户能在 30 秒内注意到这一点吗？”检查。
- **泛泛而谈的决策原则。** “简单”和“快速”并没有将任何事情变成可执行的规则。原则必须具有可操作性：“我们会选择 X，而不是 Y。”
- **将图表、原则和宣言视为彼此分离的产物。** 图表确定产品定位；原则将定位转化为可执行内容；宣言则传达这一定位。如果三者缺乏一致性，Day 1 PM 的产出就会变成一堆演示文稿，而不是一份战略总结。
- **跳过迷你宣言。** 许多团队会在图表完成后停下来。宣言很重要，因为它迫使团队写出产品不是什么，而这正是检验差异化是否真实的标准。

## 决策者角色

决策者在差异化阶段的职责：

1. 确认在本技能开始前，基础环节已签字确认。
2. 在评分过程中倾听，但不要显露偏好。
3. 如果团队意见分裂，针对已承诺的两个差异化方向进行超级投票，并说明理由。
4. 撰写或共同撰写小宣言（其中体现决策者的声音）。
5. 在第 1 天结束前，签字确认打包产物。

## 规范来源

- Character Capital。《基础冲刺指南》。差异化议程和小宣言的框架。
- Knapp, J. 和 Zeratsky, J. *《Click》*。第 1 天下午的流程和差异化规范。
- Knapp, J. 和 Zeratsky, J.《Introducing the Foundation Sprint》。《Lenny's Newsletter》。差异化部分和图表逻辑。

## 跨技能使用

前置条件：`tool-foundation-sprint-basics`。基础环节的打包产物是承重输入。

该技能至少调用一次 `tool-note-and-vote`（用于选择两个差异化方向）。如果团队在原则列表上意见分裂，也可能额外调用 `tool-note-and-vote`。

下一次调用：第 2 天上午调用 `tool-foundation-sprint-approach-options`。选定的差异化方向和决策原则会限定哪些方案选项属于范围之内。

## 决策者检查点

该技能以 `references/TEMPLATE.md` 中的决策者检查点结束。决策者需签字确认两个差异化方向、2x2 定位、原则以及小宣言，将其作为第 1 天的战略总结。没有签字确认，第 2 天将基于不稳定的战略基础开始。