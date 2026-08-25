---
name: tool-foundation-sprint-basics
description: Day 1 morning move of a Foundation Sprint. Forces explicit team choices on target customer, important problem, team advantage, and competitors and alternatives. Produces a single coherent strategic frame that becomes the input to Day 1 afternoon Differentiation. Use after the sprint brief is signed and Day 1 morning is scheduled. Bundled artifact, not four separate decisions.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: foundation-sprint
  move: basics
  category: problem-framing
  frameworks:
    - foundation-sprint
    - click
    - character-note-and-vote
  timebox_minutes: 105
  roles:
    - facilitator
    - decider
    - pm
    - customer-expert
  prerequisites:
    - tool-foundation-sprint-brief
  inputs:
    - sprint brief
    - existing customer and market context packet
    - competitor and alternatives knowledge
    - team advantage notes
  outputs:
    - target customer statement
    - important problem statement
    - team advantage inventory
    - competitor and alternative map
    - note-and-vote trace per decision
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# 基础冲刺基础知识

基础冲刺第 1 天上午。团队明确做出四项基础选择：产品服务的对象是谁、它解决了什么重要问题、为什么这支团队有获胜的资格，以及客户目前用什么替代方案。产出是一套连贯的战略框架，而不是四个彼此分离的决策。

家族契约：[`docs/reference/skill-families/foundation-sprint-skills-contract.md`](../../docs/reference/skill-families/foundation-sprint-skills-contract.md)。此技能属于 `foundation-sprint-skills`。

## 何时使用

- 基础冲刺第 1 天上午，且简报已经签署之后。
- 团队具备足够的客户和市场知识（根据准备度结论），能够做出有依据的选择。
- 四项子决策中的每一项都尚未确定或存在争议；团队尚未就其中任何一项预先达成一致。
- 决策者在场，并准备在午餐前对打包产出签字确认。

## 何时不要使用

- 团队缺乏足够的客户知识，无法选择目标客户或明确重要问题。先开展客户研究或问题框定；待准备度标准 3 通过后再重新进行。
- 团队已经确定了某个具体的客户—问题组合，只是想对其进行验证。请使用更轻量的验证工具；Basics 用于真正的决策，而不是批准既定结论的表演。
- 第 1 天上午已经拖到了下午。差异化取决于 Basics 是否完成；如果 Basics 没有在午餐前产出连贯的框架，就不要开始 Differentiation。重新框定或推迟。

## 此技能产出什么

一份包含五个部分的单一打包产出：

1. **目标客户陈述**：一个具体且明确的客户，并附带特征标记（人口统计、行为、情境）。
2. **重要问题陈述**：客户感知到的痛点，强烈到足以促使其从替代方案切换。
3. **团队优势清单**：使这支团队能够可信地应对该问题的能力、洞察、关系、数据和时机优势。
4. **竞争者与替代方案地图**：直接竞争者、替代性工作流程、手动变通方案、内部工具，以及最强的基准方案：什么都不做。
5. **Note-and-Vote 过程记录**：记录每项子决策是如何做出的，包括考虑过的替代方案和决策者的理由。

该产出被视为一个连贯的整体，而不是四个独立产出。团队对打包后的框架签字确认，而不是分别认可其中的各个组成部分。参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解 Brainshelf 示例。

## 四项子决策

每项子决策都使用 `tool-note-and-vote`（静默构思 + 投票 + 决策者超级投票协议）。此技能负责安排流程顺序，但决策协议本身是独立的 note-and-vote 工具。

### 1. 目标客户（25-35 分钟）

团队通过静默构思产出 3-7 个候选客户描述，然后进行投票，最后由决策者通过超级投票选定一个。所选客户必须具体明确（不能是“软件即服务产品经理”，而应是“工程师人数在 20 到 100 人之间的 B 轮软件即服务公司的产品经理”）。该技能会拒绝模糊的细分群体，并提示团队不断补充特征标记，直到描述能够明确指出团队可以识别的对象。

### 2. 重要问题（20-30 分钟）

团队列出所选客户正在经历的 3-7 个候选痛点。进行投票，然后由决策者进行超级投票。所选问题 MUST 足够痛苦，能够驱动客户改变当前行为（包括什么都不做）。轻微的不便不属于重要问题；该技能通过明确询问以下问题来强制验证这一点：“客户目前在做什么？为什么他们会放弃当前做法，转而采用我们的解决方案？”

### 3. 团队优势盘点（20-30 分钟）

团队列举自身的具体优势：能力、洞察、人脉、数据、技术、分销渠道和时机。通过多选投票选出排名最前的 2-3 项，再由决策者确认。该技能会拒绝泛泛而谈的优势（“优秀的团队”“充满热情”），并要求提供具体证据（“Sam 曾在 Y 公司构建过 X”；“Riley 在我们的目标细分市场中拥有一个 1.2 万名成员的人脉网络”）。

### 4. 竞争者与替代方案地图（20-30 分钟）

团队绘制完整的替代方案空间：直接竞争者、替代性工作流、手动变通方案、内部工具，以及“什么都不做”。对于每一种替代方案，团队记录客户用它来做什么，以及人们为什么会离开（或继续使用）它。该技能强制将“什么都不做”纳入竞争者之中；许多团队会忘记这一点，因为惯性往往是最强的替代方案。

## 推理输入

| 输入 | 技能如何使用 |
|---|---|
| Sprint brief | 读取 Decision Target，以确定哪些客户和问题属于范围之内；范围之外的候选项会在投票前被标记 |
| 客户/市场背景资料包 | 使用此前发现的候选项预填静默构思板，避免团队重复发明已有内容 |
| 竞争者知识 | 使用已知竞争者预填替代方案地图；团队在此基础上补充和讨论，而不是从零开始 |
| 团队优势笔记 | 展示团队已有的自我评估；通过投票进行细化和排序 |

## 常见陷阱

- **客户过于模糊。** “SaaS 产品经理”或“读者”并不是目标客户。该技能会持续要求提供特征，直到团队能够说出一种具体的人物原型。
- **把轻微不便误认为痛点。** 如果客户不会因为这个问题而放弃什么都不做，或放弃某个付费替代方案，那么这个问题就不够痛苦。该技能会对此进行明确测试。
- **泛泛而谈的团队优势。** “优秀的工程师”不是优势；“Sam 构建了 Pocket 最初的同步引擎，并且熟悉离线优先模式”才是优势。该技能会拒绝不具体的优势，并要求提供证据。
- **忽略“什么都不做”这一竞争者。** 这是最常见的疏漏。许多团队跳过它，因为他们将竞争者理解为有名称的产品；该技能会强制将其纳入其中。
- **将四个子决策视为彼此独立。** 一个重要问题无法由团队优势解决的目标客户不可能胜出。该技能确认的是捆绑后的整体产物，而不是各个组成部分；如果这些组成部分无法形成一致整体，团队就需要重新审视。
- **跳过记录与投票的追踪过程。** 决策节点是承重结构。没有这些记录，第 1 天下午的差异化工作就会建立在脆弱的基础上，最终可能只是换一个名字，重新争论基础问题。

## 决策者角色

决策者在基础阶段的职责是：

1. 为四个子决策分别设定框架（或批准引导者设定的框架）。
2. 在静默构思和投票讨论期间倾听，但不主导讨论。
3. 对每个子决策进行超级投票；当超级投票结果与团队的首选不一致时，明确说明理由。
4. 在差异化阶段开始前，确认打包产物构成一个连贯的战略框架。

一个对所有事项都不加质疑地认可的决策者没有发挥价值；一个在没有说明理由的情况下强行推翻决策的决策者无法建立信任。

## 权威来源

- Character Capital。《基础冲刺指南》。基础阶段议程和决策顺序。
- Knapp, J. 和 Zeratsky, J. *Click*。第 1 天上午的流程。
- Knapp, J. 和 Zeratsky, J.《介绍基础冲刺》。Lenny's Newsletter。目标客户和重要问题的框定。

## 跨技能使用

前置条件：`tool-foundation-sprint-brief`。Brief 中的 Decision Target 会告知该技能当前涵盖的客户—问题空间。

该技能会调用 `tool-note-and-vote` 四次（每个子决策调用一次）。每次调用都会生成独立的决策记录；四条记录会汇总到打包产物中。

冲刺中的下一次调用：第 1 天下午午餐后立即调用 `tool-foundation-sprint-differentiation`。

## 决策者检查点

该技能以 `references/TEMPLATE.md` 中的决策者检查点结束。决策者确认的是打包产物作为一个连贯战略框架的整体，而不是分别确认其中的各个组成部分。没有确认，差异化阶段就无法顺利开始，因为各项输入仍处于协商之中。