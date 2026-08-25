---
name: tool-foundation-sprint-approach-options
description: Day 2 morning move of a Foundation Sprint. Forces generation of 3 to 7 candidate approaches as one-page summaries before the team converges on a top bet. Use after Day 1 is signed and before Magic Lenses on Day 2 afternoon. Enforces a minimum of 3 approaches to prevent first-idea anchoring. Each approach summary names what it is, why it serves the differentiators, and includes a simple visual.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: foundation-sprint
  move: approach-options
  category: ideation
  frameworks:
    - foundation-sprint
    - click
  timebox_minutes: 75
  roles:
    - facilitator
    - decider
    - pm
    - design
    - engineering
  prerequisites:
    - tool-foundation-sprint-basics
    - tool-foundation-sprint-differentiation
  inputs:
    - basics bundled artifact
    - differentiation bundled artifact
    - approach candidates
  outputs:
    - 3 to 7 one-page approach summaries
    - approach set summary table
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 基础冲刺方案选项

基础冲刺第 2 天上午。团队强制自己在确定其中一个方案之前，先生成多个合理的方案。该技能强制要求至少生成 3 个方案；锚定在单一方案上是第 2 天最常见的失败模式。

系列契约：[`docs/reference/skill-families/foundation-sprint-skills-contract.md`](../../docs/reference/skill-families/foundation-sprint-skills-contract.md)。此技能属于 `foundation-sprint-skills`。

## 适用时机

- 基础冲刺第 2 天上午。
- 第 1 天已签字确认；Mini Manifesto、决策原则和差异化图表均已确定。
- 团队准备在下午通过魔法透镜评估候选方案之前，先生成候选方案。

## 不适用时机

- 第 1 天尚未解决。没有差异化背景的方案选项会产生偏离战略定位的方案。
- 团队脑中只有一个方案，并且不愿意生成替代方案。该技能强制要求至少 3 个；如果团队拒绝，问题在于冲刺纪律，而不是工具。
- 自然产生的方案超过 7 个。该技能将生成数量限制为 7 个；超过这个数量，团队生成的就不是战略方案，而是功能。

## 此技能产出什么

一个包含以下内容的完整工件：

1. **3 至 7 份单页方案摘要**，每份包括：
   - 名称和标签（颜色、字母、ID）
   - 一句话说明“它是什么”
   - “为什么这是个好主意”的理由（1 个简短段落）
   - 简单的涂鸦或文字视觉描述
   - 该方案如何服务于选定的两个差异化点
2. **方案集摘要表**，一览比较所有方案（标签、名称、捕获机制、回忆机制、主要权衡）。

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 示例。

## 流程（75 分钟）

### 步骤 1：界定方案空间（5 分钟）

主持人重申差异化：“我们将专注于 [差异化点 1] 和 [差异化点 2]。不满足其中任一项的方案都不在范围内。”这设定了边界；团队在边界内生成方案，而不是在边界之外生成。

### 步骤 2：静默构思（15–20 分钟）

每位团队成员静默生成 2–4 个候选方案。将重复方案归类。整理出 8–12 个候选方案。

### 步骤 3：归类并选出 3–7 个方案（通过 Decider call，用时 15–25 分钟）

团队将相似方案归类，Decider 将候选方案收窄至 3–7 个，并为这些方案撰写单页摘要。强制要求至少 3 个；如果团队归类后只产生 2 个候选方案，就让团队回到构思环节，至少再生成一个。

### 步骤 4：为每个方案撰写单页摘要（25–40 分钟）

每位团队成员负责 1–2 个方案，并撰写单页摘要。每份摘要应包含：

- **标签**：颜色、字母或简短标识符（Yellow、Blue、Approach A 等）
- **它是什么**：客户能够理解的一句话
- **为什么这是个好主意**：简短段落，说明客户价值以及团队交付该方案的能力
- **视觉呈现**：对客户所看到或执行内容的简单涂鸦或文字描述
- **它如何服务于差异化点**：针对每个选定的差异化点，用一两行进行说明】【。

### 第 5 步：交叉摘要审查（5-10 分钟）

团队审查完整的候选集，标记那些不符合差异化标准的摘要，或与另一种方法高度重叠、实际上构成重复方案的摘要。Decider 批准进入 Magic Lenses 的候选集。

## 方法生成规范

该 skill 在决策点强制执行五项规则：

1. **最少 3 个，最多 7 个。** 少于 3 个意味着团队被一个想法锚定；多于 7 个意味着团队正在生成功能。
2. **每种方法都必须是一条战略路径，而不是一个功能。** “添加设置界面”是一个功能；“让捕获成为主屏幕”是一条战略路径。
3. **每种方法都必须同时服务于选定的两个差异化因素（而不只是其中一个）。** 如果一种方法在差异化因素 1 上胜出，却无法满足差异化因素 2，就应当修改或舍弃。
4. **每种方法都必须能够用视觉方式描述。** 如果团队无法把它画在一张卡片上，那么这种方法对于冲刺来说就过于抽象。
5. **不得受第一个想法的偏见影响。** 团队最先想到的方法，只有在通过差异化检查后才应被纳入；许多团队在生成备选方案后会发现，最初的想法并不是最有力的方案。

## 推理输入

| 输入 | 该 skill 对其的处理 |
|---|---|
| Basics bundled artifact | 读取目标客户，确保方法是为他们设计的，而不是为相邻客户设计的 |
| Differentiation bundled artifact | 读取选定的 2 个差异化因素和 2x2 定位；标记遗漏任一差异化因素的方法 |
| Approach candidates (optional) | 如果预先提供，则预填充静默构思板；团队在此基础上添加和完善，而不是从零开始 |

## 常见陷阱

- **生成功能而不是方法。** “添加通知”不是一种方法，而是一个功能。该 skill 强制采用战略路径的表述方式。
- **选项过少。** 因为“显然只有这两个选择”而停留在 2 种方法，会让团队被锚定。即使第三种方法是有意设置得较弱，也要强制生成它；这样可以显现各种权衡。
- **无法满足某个差异化因素的方法。** 一种方法在差异化因素 1 上胜出，却在差异化因素 2 上落败，这违背了第 1 天的战略承诺。要么舍弃它，要么修改它。
- **跳过视觉呈现。** “我可以用文字描述”违背了这一环节的目的。视觉呈现会迫使方案变得具体。
- **以不同方法为表象的重叠。** 两个仅在实现细节上有所不同的摘要，其实是一种方法。将它们归为一组。

## Decider 的职责

Decider 在 Approach Options 期间的职责是：

1. 在开始时重申差异化边界。
2. 将聚类后的候选方案收敛为 3-7 个，以便制作单页摘要。
3. 批准最终进入 Magic Lenses 的候选集；拒绝偏离差异化标准的摘要。

Decider 在此 skill 中**不会**选出最优方法。Magic Lenses 会产生最值得下注的方案；Approach Options 则会产出供 Magic Lenses 评估的候选方案。

## 权威来源

- Character Capital。《Foundation Sprint guide》。方法生成议程。
- Knapp, J. 和 Zeratsky, J. *Click*。第 2 天上午流程。

## 技能间使用

前置条件：`tool-foundation-sprint-differentiation`。第 1 天的战略定位是关键输入。

下一次调用：下午调用 `tool-foundation-sprint-magic-lenses`。此处产出的方案集将作为 Magic Lenses 评分的输入。

## 决策者检查点

此技能以 `references/TEMPLATE.md` 中的决策者检查点结束。决策者确认进入 Magic Lenses 的方案集，确保其中没有超出范围的方案，也没有重复方案。若未获得签字确认，Magic Lenses 将从不稳定的候选方案集开始。