---
name: tool-foundation-sprint-founding-hypothesis
description: Day 2 end capstone move of a Foundation Sprint. Compresses the sprint's full strategic frame into a single canonical sentence (the Founding Hypothesis) plus an assumption scorecard, why-we-believe, what-could-prove-us-wrong, and recommended next validation step. Use after Magic Lenses is signed. Strict canonical template; paraphrase is not accepted in v0.1.0. The Founding Hypothesis is the spine artifact the sprint exists to produce.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: foundation-sprint
  move: founding-hypothesis
  category: problem-framing
  frameworks:
    - foundation-sprint
    - click
  timebox_minutes: 45
  roles:
    - facilitator
    - decider
    - pm
  prerequisites:
    - tool-foundation-sprint-basics
    - tool-foundation-sprint-differentiation
    - tool-foundation-sprint-magic-lenses
  inputs:
    - basics bundled artifact
    - differentiation bundled artifact
    - top bet and backup
  outputs:
    - founding hypothesis statement
    - assumption scorecard
    - why we believe this
    - what could prove us wrong
    - recommended next validation step
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# Foundation Sprint 创始假设

Foundation Sprint 第 2 天结束时。团队将整个 Sprint 的输出压缩为一个规范单句和一份可测试的评分卡。这正是该 Sprint 要产出的成果；在此技能之前的一切都是准备工作。如果没有一个可批准的创始假设，这次 Sprint 就失败了。

Family contract：[`docs/reference/skill-families/foundation-sprint-skills-contract.md`](../../docs/reference/skill-families/foundation-sprint-skills-contract.md)。此技能属于 `foundation-sprint-skills`。

## 适用时机

- Foundation Sprint 第 2 天结束时。
- Magic Lenses 已签署；首要下注项和备选下注项已经确定。
- 团队在第 2 天还剩 30-45 分钟，并且有足够精力认真斟酌这句话。

## 不适用时机

- Magic Lenses 没有产出明确的首要下注项。返回 Magic Lenses；创始假设无法建立在一个不稳定的首要下注项之上。
- 团队想要“之后再润色假设”。假设必须在第 2 天结束前获得批准，否则 Sprint 的产出就不完整。之后再润色意味着重新争论；这会违背 Sprint 的目的。
- 团队想要批准一个模糊的假设来“交付 Sprint”。模糊的假设比没有假设更糟；它会带来虚假的信心，并在验证失败时消耗信任。

## 此技能产出的内容

一个包含五个部分的整合成果：

1. **创始假设陈述**：唯一的规范句子（严格模板，不得改写）。
2. **假设评分卡**：从假设中提取 5-7 个假设，分别根据当前信心程度评分，并标注最佳下一步测试（可接受范围为 3-10；推荐范围为 5-7）。
3. **我们为什么相信这一点**：以 3-5 个项目符号列出证据基础。
4. **什么可能证明我们错了**：以 3-5 个项目符号列出风险。该部分用于检验团队究竟是爱上了这个假设，还是以校准后的信心持有它。
5. **建议的下一步验证**：Design Sprint、客户研究、实验、落地页测试或其他方式。明确具体测试、负责人和时间安排。

参见 `references/TEMPLATE.md` 获取规范模板，参见 `references/EXAMPLE.md` 获取 Brainshelf 示例。

## 规范模板（严格）

```text
If we help [target customer] solve [important problem]
with [approach], they will choose it over [competitors or alternatives]
because our solution is [differentiators].
```

此模板适用于 v0.1.0（根据已批准的规范决策）。不接受改写。类似“Because we help X with Y...”或将两个槽位压缩为一个（“solve [problem] with [approach]”）的变体，都会被该技能拒绝。严格性是有意为之：强制使用该模板，会迫使团队具体填写每个槽位。

五个槽位如下：

| 槽位 | 来源 | 规范检查 |
|---|---|---|
| 目标客户 | Basics 目标客户陈述 | 必须具体（描述特征，而不是细分市场） |
| 重要问题 | Basics 重要问题陈述 | 必须足够痛苦，能够驱动用户转向其他方案 |
| 方法 | Magic Lenses 首要下注项 | 必须是首要下注项，而不是弱化后的版本 |
| 竞争者或替代方案 | Basics 竞争者地图 | 如果其中列出了“什么都不做”，则必须包含它 |
| 差异化因素 | Differentiation 选定的两个因素 | 必须包含两个差异化因素，而不只是其中一个 |

如果任何一个槽位含糊不清，该技能会拒绝这一假设并提示修改。

## 优秀创始假设的特征

| 质量 | 含义 |
|---|---|
| 具体 | 指明真实的客户和真实的问题；而不是“用户”和“挫败感” |
| 有比较性 | 解释客户如今会选择什么，包括什么都不做 |
| 有差异化 | 说明为什么这个解决方案应该胜出，而不只是说它应该胜出 |
| 可验证 | 能转化为评分卡问题和实验 |
| 简单 | 客户能够快速理解这一承诺 |
| 足够令人不适，从而具有实用价值 | 如果没有人表示反对或感到暴露，这一假设可能过于含糊 |

“令人不适”这一特征最难强制执行：团队会在无意识中弱化假设，使其更容易获得批准。该技能会在讨论阶段通过提问来进行反制：“如果你们不属于这个团队，现场有谁会对这一点提出异议？”一片沉默意味着这一假设过于保守。

## 假设评分卡

将假设拆解为 5-7 个假设（推荐数量；根据已批准的规格决策，可接受范围为 3-10 个）。对于每一个假设：

| 字段 | 填写内容 |
|---|---|
| 假设 | 一句话，源自假设中的某个具体槽位 |
| 为什么重要 | 如果这一假设错误，什么内容会被推翻 |
| 当前信心度 | 高 / 中高 / 中 / 中低 / 低 |
| 下一项最佳测试 | 能够改变信心度的具体测试 |

风险最高的假设（当前信心度最低，且错误时影响范围最大）就是下一步验证（通常是设计冲刺）应该首先测试的假设。

## 流程（45 分钟）

### 第 1 步：起草假设（10-15 分钟）

决策者根据之前冲刺的产出，填写 5 个槽位，起草规范句子。团队进行评审，识别含糊之处，并持续修改，直到每个槽位都具体明确。这是冲刺中最重要的 15 分钟。

### 第 2 步：建立评分卡（15-20 分钟）

将假设拆解为 5-7 个假设。为每个假设评分。找出风险最高的假设。

### 第 3 步：我们为什么相信 / 什么可能证明我们错了（5-10 分钟）

分别列出项目符号列表，每组 3-5 条。团队同时撰写两组内容；第二组列表（证明错误的依据）用于检验团队是否以校准后的态度持有这一假设。

### 第 4 步：推荐下一项测试（5 分钟）

决策者确定下一步验证措施：设计冲刺、客户研究、实验等。推荐的测试应该针对评分卡中风险最高的假设。

### 第 5 步：批准（1 分钟）

决策者签字。冲刺结束。

## 常见陷阱

- **客户或问题含糊不清。** “读者”或“挫败感”不是槽位。该技能会拒绝这些内容。
- **不可证伪的假设。** “我们会成功”不是假设。“如果我们帮助 X 解决 Y，他们就会选择我们”才是。该技能会强制执行这一结构。
- **把假设当作战略文档。** 假设是测试目标，而不是战略计划。团队的战略决策存在于《小宣言》和决策原则中；假设是你要去测试的内容。
- **跳过评分卡。** 假设只体现了一半价值；测试计划（评分卡 + 推荐的下一项测试）体现了另一半价值。没有评分卡，假设就只是墙上的装饰。
- **为了获得批准而弱化假设。** 团队会本能地弱化假设，使其减少争议。该技能通过“是否有人会提出异议”的检查来进行反制。
- **之后再润色。** 假设必须在第 2 天结束前获得批准。之后再润色意味着重新争论；冲刺纪律会因此崩溃。

## 决策者角色

决策者在创始假设阶段的职责：

1. 起草规范句（或与 PM 共同起草）。
2. 主导修订环节；对含糊的槽位提出质疑。
3. 与团队一起为评分卡假设打分；当信心评级存在争议时进行超级投票。
4. 明确指出建议采取的下一步验证。
5. 在第 2 天结束前批准该假设，即使部分槽位的措辞还不够完善；后续润色应通过编辑评分卡完成，而不是修改假设。

## 权威来源

- Knapp, J. 和 Zeratsky, J. *Click*。《创始假设》模板及其原理。
- Character Capital。《Foundation Sprint 指南》。《创始假设》部分。
- Knapp, J. 和 Zeratsky, J. “Introducing the Foundation Sprint。”Lenny's Newsletter。包含《创始假设》的结构及完整示例。

## 跨技能使用

前置条件：`tool-foundation-sprint-magic-lenses`。首要赌注、备选方案和决策依据是承重输入。

该技能继承 Basics 捆绑产物（目标客户、重要问题、竞争对手）以及 Differentiation 捆绑产物（选定的差异化因素）。五个假设槽位均源自此前冲刺的产出。

在冲刺之外的下一次调用：建议采取的下一步验证。最常见的是 `tool-design-sprint-readiness`，前提是 Design Sprint 是下一项测试。有时，如果下一步更适合进行非冲刺测试，则会使用 `pm-skills:measure-experiment-design` 或 `pm-skills:discover-interview-synthesis`。

Foundation Sprint 与 Design Sprint 之间没有正式的衔接技能；过渡内容以叙事形式写在 `_workflows/foundation-to-design.md` 以及两份用户指南中。

## 决策者检查点

该技能以 `references/TEMPLATE.md` 中的决策者检查点结束。决策者批准假设句、评分卡和建议的下一项测试。批准标志着 Foundation Sprint 的结束。没有批准，冲刺产出就不完整，团队也没有完成其原定目标。