---
name: tool-foundation-sprint-magic-lenses
description: Day 2 afternoon move of a Foundation Sprint. Evaluates the candidate approach set through multiple lenses (4 classic plus at least 1 custom) to surface trade-offs, identify consistent winners and contradictions, and produce a top bet plus a backup plan. Use after Approach Options is signed. Lens scoring is a sense-making tool, not mathematical truth; arbitrary precision is a smell.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: foundation-sprint
  move: magic-lenses
  category: validation
  frameworks:
    - foundation-sprint
    - click
    - character-note-and-vote
  timebox_minutes: 105
  roles:
    - facilitator
    - decider
    - pm
  prerequisites:
    - tool-foundation-sprint-approach-options
  inputs:
    - approach summaries
    - team-specific custom lenses
  outputs:
    - classic lens charts (customer, pragmatic, growth, money)
    - custom lens charts
    - pattern review
    - top bet
    - backup plan
    - decision rationale
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 基础冲刺魔法透镜

基础冲刺第 2 天下午。团队从多个角度评估每种候选方案，发现其中的矛盾，并产出一个首选方案和一个备用计划。决策者需要同时确定两者；如果没有明确的备用方案，一旦首选方案被证伪，团队就会重新陷入模糊的争论。

系列契约：[`docs/reference/skill-families/foundation-sprint-skills-contract.md`](../../docs/reference/skill-families/foundation-sprint-skills-contract.md)。此技能属于 `foundation-sprint-skills`。

## 适用时机

- 基础冲刺第 2 天下午。
- Approach Options 已签署；团队有 3-7 个候选方案进入下一阶段。
- 团队至少准备了 1 个团队专属的自定义透镜（根据已批准的规范决策）；仅使用经典透镜是不够的。

## 不适用时机

- Approach Options 尚未解决或选项数量不足（少于 3 个）。先通过 approach-options 技能强制提出第三个选项。
- 团队已经预先决定了首选方案。Magic Lenses 是一项意义建构练习；如果决策已经做出，那么将时间用于 Founding Hypothesis 会更有价值。
- 团队已经精疲力竭，无法进行清晰评估。与其仓促进行，不如推迟到后续冲刺的第 2 天上午。

## 此技能产出的内容

一个包含六个部分的整合产物：

1. **经典透镜图表**：客户、务实、增长、金钱透镜分别以 2x2 图或定性位置的形式呈现每种方案。
2. **自定义透镜图表**：至少 1 个团队专属透镜（防御性、使命契合度、创始人兴奋度、学习速度等）。
3. **模式回顾**：各透镜下持续胜出的方案、存在的矛盾，以及团队正在做出的最大权衡。
4. **首选方案**：决策者选择的方案及其理由。
5. **备用计划**：如果首选方案失效，团队将退回采用的亚军方案。
6. **决策理由**：用一段话解释为什么选择首选方案而不是备用方案。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 示例。

## 五个规范透镜

| 透镜 | 它要回答的问题 | 为什么重要 |
|---|---|---|
| 客户 | 哪种方案能让目标客户立即理解并产生需求？ | 如果客户无法理解，其他一切都无关紧要 |
| 务实 | 团队能在[构建窗口]内以足够高的质量交付哪种方案？ | 团队无法交付的漂亮方案并不是真正的选项 |
| 增长 | 哪种方案能为团队提供足够有力的故事，使其无需付费渠道也能获取用户？ | 进入门槛上的阻力会告诉你口碑传播的潜力 |
| 金钱 | 哪种方案能最顺畅地走向付费客户？ | 战略清晰度必须包含收入路径 |
| 自定义（至少 1 个） | 能够捕捉其他方式会遗漏之处的团队专属透镜 | 每个团队都有值得专门审视的独特约束或机会 |

自定义透镜示例：针对特定竞争对手的防御性、创始人兴奋度、使命契合度、学习速度、监管风险、合作伙伴契合度、招聘杠杆。

## 流程（105 分钟）

### 第 1 步：确定视角（5 分钟）

引导者重述 4 个经典视角，并确认团队准备好的 1 个或多个自定义视角。如果没有准备自定义视角，则此 skill 会提示团队在继续之前生成一个（依据已批准的规范决策）。

### 第 2 步：按视角为每种方案评分（40-60 分钟）

对于每个视角，将每种方案放置在一个 2x2 矩阵中，矩阵的两个维度分别是（在该视角下的价值高/低）和（在该视角下的可行性高/低）。使用点的位置，而不是数值评分；任意精确到小数的评分（3.7 对 3.8）说明团队混淆了意义建构与数学计算。

团队在绘制之前，先简要讨论每个视角。Decider 在此步骤不投票；Decider 会在最后进行超级投票。

### 第 3 步：审视模式（15-25 分钟）

绘制完所有视角后，团队识别：

- **持续胜出者**：在 3 个或更多视角中得分位于前半区的方案。
- **持续落败者**：在 3 个或更多视角中得分位于后半区的方案。这些方案被淘汰。
- **矛盾项**：在一个视角中明显胜出、但在另一个视角中落败的方案。这些方案会暴露出 Decider 必须做出的权衡。
- **最大的权衡**：明确说出它。"无聊但可交付 vs 冒险且与众不同。""大众市场 vs 可由利基市场守住。"说出权衡，可以避免 Decider 凭感觉做选择。

### 第 4 步：Decider 对最佳赌注进行超级投票（10-15 分钟）

Decider 说出最佳赌注。选定的方案应当：

- 是一个持续胜出者，或是一个存在矛盾、但 Decider 明确选择押注的方案。
- 在表述上具有可辩护性（"我们押注 [权衡]，因为 [原因]"）。
- 与第 1 天的 Mini Manifesto 保持一致。

### 第 5 步：Decider 说出备用方案（5-10 分钟）

Decider 说出备用方案。备用方案不是为了安抚支持该方案的人而选择的第二名方案；它是团队在最佳赌注未通过验证时将转向的方案。备用方案 MUST 在战略方向上与最佳赌注有所区别。

如果最佳赌注和备用方案过于相似，说明 Decider 并没有真正说出一个备用方案。此 skill 会提示选择一个区别更明显的替代方案。

### 第 6 步：决策依据（5-10 分钟）

Decider 撰写一段话，解释为什么选择这个最佳赌注而不是这个备用方案。这段依据将成为 Founding Hypothesis 中"我们为什么相信这一点"部分的主干。

## 常见陷阱

- **把视角评分当作数学真理。** 视角是意义建构工具；如果团队争论某个方案在一个视角下究竟得 3.7 分还是 3.8 分，就说明团队已经偏离了重点。
- **跳过自定义视角。** 4 个经典视角从设计上就是通用的。自定义视角才是团队具体情况的体现；跳过它会产生一个通用的最佳赌注。
- **爱上最佳赌注。** Magic Lenses 之后的信心应该经过校准，而不应过高。下一个 skill——Founding Hypothesis——会问"什么能够证明我们错了"；已经爱上最佳赌注的团队无法诚实地回答这个问题。
- **跳过备用方案。** 没有明确的备用方案，验证失败会把团队带回模糊的争论。备用方案迫使团队承认最佳赌注可能会失败。
- **备用方案与最佳赌注过于相似。** "在方案 Yellow 的基础上增加一个功能"不是备用方案；它是一次迭代。备用方案必须是不同的战略方向。
- **Decider 凭热情而不是凭分析说出最佳赌注。** 审视模式的存在，是为了给 Decider 的决策提供结构化依据。如果 Decider 在审视模式之前就做出选择，那么这个 skill 就没有发挥任何价值。

## 决策者角色

在 Magic Lenses 期间，决策者的职责：

1. 在镜头评分期间倾听，不流露偏好。
2. 在模式评审期间参与讨论，明确呈现权衡。
3. 说明理由，对最优赌注进行超级投票。
4. 将备选方案命名为一个独立的战略方向。
5. 撰写一段话的决策理由。

## 规范来源

- Character Capital。《Foundation Sprint guide》。Magic Lenses 部分及镜头定义。
- Knapp, J. 和 Zeratsky, J. *Click*。第 2 天下午的流程。
- Knapp, J. 和 Zeratsky, J.《Introducing the Foundation Sprint》。Lenny's Newsletter。Magic Lenses 部分。

## 跨技能使用

前置条件：`tool-foundation-sprint-approach-options`。方法集合是承载性输入。

该技能至少调用一次 `tool-note-and-vote`（当评分结果存在歧义时，用于对最优赌注进行超级投票）。如果团队尚未预先准备自定义镜头定义，则可能会进行额外调用。

下一次调用：第 2 天结束时调用 `tool-foundation-sprint-founding-hypothesis`。最优赌注、备选方案和决策理由将直接流入 Founding Hypothesis 模板。

## 决策者检查点

该技能在 `references/TEMPLATE.md` 中以决策者检查点结束。决策者需正式确认最优赌注、备选方案和决策理由。没有签字确认，Founding Hypothesis 就无法顺利开始。