---
name: tool-foundation-sprint-readiness
description: Pre-sprint diagnostic that determines whether a team should run a Foundation Sprint now, postpone it, or do prerequisite work first. Produces a Go / Conditional Go / Wait verdict with diagnosis, recommended preconditions, attendee list, and pre-sprint activities. Use when a team is considering starting a Foundation Sprint and wants a fast yes/no diagnosis before committing two days of facilitated work.
license: Apache-2.0
metadata:
  classification: tool
  version: "1.0.0"
  updated: 2026-07-04
  tool: foundation-sprint
  move: readiness
  category: coordination
  frameworks:
    - foundation-sprint
    - click
    - character-note-and-vote
  timebox_minutes: 45
  roles:
    - facilitator
    - pm
    - decider
  prerequisites: []
  inputs:
    - initiative description
    - team composition draft
    - decider name and availability
    - existing customer or market knowledge level
  outputs:
    - readiness verdict
    - diagnosis
    - recommended preconditions
    - recommended attendee list
    - pre-sprint activities
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->

# Foundation Sprint 就绪度

评估 Foundation Sprint 是否适合团队当前的情况。大多数失败的 Sprint，都是本不该开展的 Sprint。一次 30-45 分钟的就绪度诊断，可以在投入两天的引导式工作之前，提前发现这种失败模式。

系列契约：[`docs/reference/skill-families/foundation-sprint-skills-contract.md`](../../docs/reference/skill-families/foundation-sprint-skills-contract.md)。此技能属于 `foundation-sprint-skills`，并遵循该系列的 frontmatter 和决策者检查点要求。

## 适用场景

- 团队正在考虑启动 Foundation Sprint，需要在承诺投入两天之前进行快速诊断。
- 创始人或 PM 在问“我们是否应该开展 Foundation Sprint？”，希望获得结构化意见，而不是凭感觉检查。
- 现有 Sprint 已排入日程，团队希望确认前置条件已经具备。
- 在假设失效后重新开展 Foundation Sprint：用于确认新的背景信息已经准备就绪。

## 不适用场景

- 团队已经决定开展 Sprint，只需要 brief。请改用 `tool-foundation-sprint-brief`。
- 团队需要深入的客户探索：应先开展客户研究或问题框定；Foundation Sprint 依赖现有的客户知识。
- 决策规模较小，完整的 Foundation Sprint 属于过度投入。请使用更轻量的优先级排序或决策工具。
- 没有可用的决策者，且无法指定一名决策者。Foundation Sprint 要求快速做出战略决策；没有决策权，就只能产出选项而无法形成承诺。

## 此技能产出的内容

一个包含五个部分的单一打包产物：

1. **就绪度结论**：Go / Conditional Go / Wait
2. **诊断**：哪些已经到位、哪些缺失、哪些尚不确定
3. **建议的前置条件**（当结论为 Wait 或 Conditional Go 时）：团队在 Sprint 开始前应完成的前置工作
4. **建议的参会人员名单**（当结论为 Go 或 Conditional Go 时）：应参与会议的 3-5 人及其角色预期
5. **Sprint 前活动**（当结论为 Go 时）：Day 1 前几天内应完成的准备工作

参见 `references/TEMPLATE.md` 了解规范结构，参见 `references/EXAMPLE.md` 了解使用 Brainshelf 图书目录讨论串编写的完整示例。

## 推理输入

该技能会基于以下输入执行推理过程，以生成结论：

| 输入 | 技能如何处理该输入 |
|---|---|
| 计划描述 | 判断 Foundation Sprint 是否是合适的工具（相对于问题框定、客户研究或 Design Sprint） |
| 团队构成草案 | 根据 Foundation Sprint 的角色要求检查人员名单；标记缺失的角色 |
| 决策者姓名及可用时间 | 确认决策者能参加两天的活动；将部分时间可用标记为 Conditional Go 风险 |
| 现有客户/市场知识水平（自评 1-10） | 低于 5 表示需要先进行深入探索；5-7 表示需要准备研究工作的 Conditional Go；8+ 表示 Go |
| （可选）现有竞争对手及替代方案知识 | 标记可以通过隔夜准备弥补的知识缺口 |
| （可选）后勤约束 | 确认确实可以空出两天时间 |

如果缺少承重输入或其置信度较低，该 skill 会明确标记出来，并提出如何在冲刺开始前弥补这一缺口。

## 准备就绪标准（8 项规范检查）

该 skill 根据 Knapp/Zeratsky（《Click》）以及 Character Capital 的 Foundation Sprint 指南中提出的标准，从以下八项指标评估团队：

1. **已明确且具体地命名倡议。** 团队能够说出项目、产品领域或战略问题的名称。
2. **相关利害关系足够重要。** 错误的起始方向会造成高昂代价。
3. **团队具备现有知识。** 团队拥有真实的客户、市场、竞争对手或领域背景，能够据此做出明智选择。
4. **决策者可以参与。** 冲刺期间能够做出战略决策。
5. **团队规模足够小。** 最好不超过五名核心决策参与者。
6. **已收集输入信息。** 现有研究、客户案例、竞争对手记录和指标都已准备就绪。
7. **输出结果有测试路径。** 团队之后可以使用 Design Sprint、实验、客户研究或其他验证方法。
8. **组织能够接受明确的权衡取舍。** Foundation Sprint 要求选出一个首要押注方向和一个备选方向，而不是保留所有可能性。

| 模式 | 结论 |
|---|---|
| 8 项标准全部明确满足 | **可以开始** |
| 有 1-2 项标准是“黄色警示”，但可以通过晚间准备加以解决 | **有条件开始**，并记录准备事项 |
| 有 3 项或更多标准不满足，或第 1-4 项中任意一项完全不满足 | **等待**，并建议先完成前置工作 |

应将这些标准视为承重结构，而不是可以钻空子的清单。团队若用“是的，从技术上说满足”来掩盖实际缺口，应判定为有条件开始，并明确指出该缺口。

## 常见陷阱

- **因为“反正我们还是要执行”而跳过诊断。** 这是冲刺失败最常见的原因。诊断耗时 45 分钟；失败的冲刺则会耗费团队 16 小时，加上机会成本。
- **把有条件开始当成可以开始，却不完成准备工作。** 有条件开始意味着“弥补这些缺口后再开始”。如果在第 1 天早上之前没有弥补这些缺口，冲刺就会进入该诊断本来要避免的失败模式。
- **将准备度评估与问题界定混为一谈。** 该 skill 评估的是是否应执行 Foundation Sprint，而不是团队是否找对了问题。如果问题尚不明确，结论就是等待，前置条件是“先完成问题界定”。
- **没有决策者，就不要进行冲刺。** 没有可参与的决策者的团队，无论如何都尚未准备好。指定一个缺乏真实决策权的“当日决策者”并不能解决问题。
- **机械照搬准备度。** 阅读这些标准后，不经核实就对八项全部回答“是”，并不能带来真正的准备就绪。该 skill 的价值在于诚实地进行诊断。

## 规范来源

- Knapp, J. 和 Zeratsky, J. *Click: How to Make What People Want*。Foundation Sprint 准备度指南。
- Character Capital。《Foundation Sprint guide》。https://www.character.vc/guide/foundation-sprint
- Design Sprint Academy。《Foundation Sprint readiness criteria for enterprise》。用于针对企业场景对规范准备度标准进行调整。

## 跨技能使用

此技能是 foundation-sprint-skills 系列的入口。它没有前置条件（`metadata.prerequisites` 字段特意留空）。

当裁定为 Go 时，通常下一步调用 `tool-foundation-sprint-brief` 来设置冲刺流程。当裁定为 Wait 时，团队通常会先完成前置工作（问题定义、客户研究），然后再次调用此技能。

如果团队对 Foundation Sprint 是否是合适的工具存在分歧，可以在准备度讨论期间调用一次 `tool-note-and-vote`。实际上，这种情况很少见；诊断通常能够得出明确结论。

## 决策者检查点

此技能以 `references/TEMPLATE.md` 中的决策者检查点结束。决策者会对裁定结果（Go / Conditional Go / Wait）签字确认，并明确接受该诊断。没有决策者签字确认时，裁定仅供参考；完成签字确认后，该裁定才是触发（或推迟）冲刺的正式承诺。