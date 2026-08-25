---
name: measure-okr-grader
description: Scores completed OKR sets at cycle close with KR-level scoring per the canonical OKR type enum (committed | aspirational | learning | operational_health | compliance_or_safety), committed-vs-aspirational interpretation, evidence quality assessment, learning synthesis, and next-cycle recommendations. Refuses to retroactively change targets or shrink committed scope, average away guardrail KRs, treat 0.7 as success for committed or compliance_or_safety KRs, equate effort with impact, or use scores for individual performance. Hands off to iterate-lessons-log, iterate-retrospective, define-hypothesis, measure-dashboard-requirements, measure-instrumentation-spec, and foundation-okr-writer.
license: Apache-2.0
metadata:
  phase: measure
  version: "1.0.1"
  updated: 2026-07-04
  category: reflection
  frameworks: [triple-diamond, okrs, lean-startup]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# OKR 评分器

OKR 周期复盘是一份回顾性产物，用于为已完成的一组 OKR 完成闭环。它根据基线和目标为每个 KR 评分，区分承诺型与愿景型解读，揭示哪些内容有证据支持、哪些没有，明确团队学到了什么，并为下一周期的起草准备输入。做好周期复盘，意味着拒绝把未达成的承诺包装成愿景型挑战，拒绝庆祝投入而非结果，也拒绝让评分承担它无法承受的权重，从而维护 OKR 运行系统的完整性。

这项技能是证据解读器，而不是算术引擎。它的职责是读取 KR 的最终值，将其与原始 OKR 集的意图进行比较，并生成一份如实陈述学习成果的复盘。它执行源自 Doerr（`Measure What Matters`）、Wodtke（`Radical Focus`）、Castro（承诺型与愿景型解读）、Grove（`High Output Management`）以及 OKR 社群长期实践中关于误用失败模式的经验性评分约定。它与 `foundation-okr-writer` 配合使用（后者负责产出被评分的 OKR 集），并将此处产生的学习成果交接给使用这些成果的迭代类技能。

## 适用场景

- OKR 周期已经结束（或你正在进行部分周期收尾评分）
- 你拥有最终或阶段性的 KR 值、基线和目标
- 利益相关者需要一份包含评分、证据和学习成果的清晰复盘
- 团队正在决定要继续、停止、改变或延续哪些事项
- 对某个评分是好是坏存在分歧
- 各 KR 的证据质量不均，需要将其明确呈现出来

## 不适用场景

- 你仍在起草 OKR——请使用 `foundation-okr-writer`
- 你想进行通用的团队复盘——请使用 `iterate-retrospective`
- 你正在汇报单个实验结果——请使用 `measure-experiment-results`
- 你需要在不评分的情况下向利益相关者更新进展——请使用 `foundation-stakeholder-update`
- OKR 集从未达成一致或从未被跟踪——评分需要一组已编写的 OKR；请先通过 `foundation-okr-writer` 补全
- 你想使用评分来评估个人——此技能拒绝这样做

## Instructions

当被要求为已完成的 OKR 评分时，请遵循以下步骤：

1. **验证评分准备情况**
   检查输入：原始 OKR 集、周期日期、最终 KR 值（或部分收尾时的阶段性值）、基线、目标、证据来源以及 OKR 类型（committed | aspirational | learning | operational_health | compliance_or_safety）。如果某个值缺失，请明确标记为（`not-yet-observable`、`not-instrumented`、`not-supplied`）；绝不捏造。对于原始定义完全缺失的 KR，拒绝评分。

2. **分类每个 KR 的类型和指标类别**
   OKR 类型是 `committed | aspirational | learning | operational_health | compliance_or_safety` 中的一种（这是 `foundation-okr-writer` 产出的五个值）。指标类别是 `leading | lagging | guardrail | health | evidence_generation` 中的一种。如果原始 OKR 集中已有这两项信息，则沿用；如果未指定，则分配默认值。OKR 类型决定评分约定：`aspirational` 使用 0.6 到 0.7 的理想区间；`committed` 以 1.0 为目标；`compliance_or_safety` 为二元评分；`operational_health` 根据阈值区间判定为 pass | fail | drift-within-tolerance；`learning` 根据已验证或已证伪进行评定，而不是按分数评分。指标类别会在类型评分规则之上增加独立规则（见步骤 3）。

3. **为每个 KR 打分**
   根据其 OKR 类型所对应的约定为每个 KR 打分，然后在此基础上应用指标类别规则；完整的分类型约定表和护栏规则请参见下方的 Scoring Rules 部分（此处不要重复说明）。对于每个分数，说明计算过程或判断依据，以及证据置信度（high | medium | low | unknown）。

4. **解读目标分数**
   当某个 KR 是护栏、合规阈值或学习型 KR 时，避免进行简单平均。除了给出任何粗略的数值平均值外，还要对目标进行定性解读。明确说明该分数意味着什么，以及不意味着什么。

5. **评估证据质量**
   对于每个 KR，说明证据的可靠性及任何注意事项（埋点缺口、周期中途的目标调整、群组定义变化、测量窗口不匹配、样本量限制）。为下一周期的测量计划提出改进建议。

6. **将 initiatives 作为赌注进行复盘**
   对于团队执行的每项 initiative，说明其预期推动哪个 KR、是否交付、表面上产生了什么贡献，以及证据是否支持继续、退役或重新设计。采用 Castro 的“initiatives are bets, not commitments”框架。将交付状态与 KR 影响分开；按时交付但未推动其 KR 的 initiative 不算部分成功。

7. **综合学习成果**
   记录已验证的假设、被证伪的假设、意外发现以及对决策的影响。区分以下类型的学习：关于客户或产品的学习（延续保留）、关于团队流程的学习（交给 `iterate-retrospective`）、以及关于测量的学习（交给 `measure-instrumentation-spec` 或 `measure-dashboard-requirements`）。

8. **准备下一周期建议**
   对于每个目标，给出继续、修订、退役或升级处理的建议。为 `foundation-okr-writer` 提议候选的下一周期 OKR 或待解决问题。将测量缺口交给 `measure-dashboard-requirements` 或 `measure-instrumentation-spec`。将假设测试交给 `define-hypothesis`。将团队流程相关工作交给 `iterate-retrospective`。将组织记忆交给 `iterate-lessons-log`。将下一周期的起草工作交给 `foundation-okr-writer`。

9. **揭示解读中的风险**
   明确指出分数可能误导读者的地方：对尚不可观测的 KR 强行给出数值分数、initiative 结果受到混杂因素影响、利益相关者的表述弱化了证据、需要第二个周期进行确认的单周期结果。

10. **注明事实来源**
    该文档是复盘文档，而不是权威的 OKR 系统。包含一个 `source_of_truth` 字段，指向原始 OKR 跟踪器。

11. **完成最终稿以便直接使用**
    从最终产物中删除所有 skill 指令性评论。最终输出应面向读者。

## 约束规则（MUST / MUST NOT）

这些规则不可协商。该 skill 会在每次评分运行中强制执行这些规则。

- **MUST NOT** 事后更改基线、目标或 KR 定义。如果团队在周期中途调整了这些内容，必须明确记录该变更，并同时根据原始版本和调整后的版本进行评分。
- **MUST NOT** 事后缩小 `committed` 或 `compliance_or_safety` KR 的范围，以便将部分覆盖标记为通过。如果原始承诺指定了 3 个 healthcare 账户，而只有 1 个完成了审计，则该 KR 属于 `not-yet-fully-observable`。这 1 个账户的结果是一个子信号，而不是该 KR 的分数。
- **MUST NOT** 将 0.7 视为 `committed`、`compliance_or_safety` 或 `operational_health` KR 的成功。这些 KR 的目标是 1.0（或阈值区间）。
- **MUST NOT** 用平均值抵消失败的护栏。失败的护栏是一个独立信号，不会被主要 KR 的成功稀释。
- **MUST NOT** 将投入等同于影响。按时交付但未推动其 KR 的 initiative 不算部分成功。
- **MUST NOT** 将 OKR 分数用作个人绩效评级或薪酬依据。如果用户提出此类要求，应拒绝并解释其中导致目标保守设定和抑制学习的风险。
- **MUST NOT** 在明确表达并于 OKR 编写时披露了挑战性意图的情况下，惩罚诚实的挑战目标。0.6 的 aspirational 分数正是预期的理想结果。
- **MUST NOT** 将错失的 committed 目标庆祝为雄心勃勃的失败。未达成的 committed 目标就是未达成。
- **MUST** 明确标记任何尚不可观测的 KR（例如，90 天留存群组的观测窗口延伸至周期结束之后）。对尚不可观测的 KR 强行给出数值分数会产生误导。
- **MUST** 在每个 KR 分数中包含证据置信度（high | medium | low | unknown）。
- **MUST NOT** 成为权威的事实来源。始终包含一个 `source_of_truth` 指针，指向用户实际使用的 OKR 跟踪器。

## 评分规则

该技能将这些约定应用于每次周期复盘。评分约定遵循 OKR 类型，而不是评分时团队的偏好。OKR 类型和指标类别是彼此独立的维度；类型决定评分方式，指标类别增加报告规则。

OKR 类型决定评分约定：

- **`aspirational`**：采用 0 到 1 的数值评分 = (实际值 - 基线) / (目标值 - 基线)。理想区间为 0.6 到 0.7。低于 0.4 表示未达标；连续多个周期高于 0.8，说明目标可能设置得过于保守，需要重新校准。
- **`committed`**：根据目标判定通过或未通过。任何低于 1.0 的结果都表示未达标，需要进行复盘。不要用 `aspirational` 的解释方式弱化这一结论。
- **`compliance_or_safety`**：二元判定。达到或未达到。不提供部分得分。不允许事后缩小范围。如果承诺的范围只能部分观测（部分审计仍在等待、部分账户被延期），将该 KR 标记为 `not-yet-fully-observable`；已观测子集是一个子信号，而不是 KR 的评分。
- **`operational_health`**：根据阈值区间判定为通过 | 未通过 | 容差范围内发生漂移。
- **`learning`**：已验证 | 已证伪 | 部分验证 | 证据不足。不采用数值评分。

指标类别规则叠加在 OKR 类型的评分规则之上：

- **指标类别 `guardrail`**：KR 按其 OKR 类型进行评分，同时还要作为独立信号报告，绝不能计入主要目标得分的平均值。无论该 guardrail 本身属于 `committed`、`aspirational`、`operational_health` 还是 `compliance_or_safety`，失败的 guardrail 都不会稀释较高的主要 KR 得分。

特殊状态：

- **`not-yet-observable`**：暂缓评分。不要强行给出数值评分；标记中期信号和预估得分，并明确标注置信度以及最终得分可用的日期。
- **`not-yet-fully-observable`**：存在部分覆盖范围的 `committed` 或 `compliance_or_safety` KR。在完整覆盖范围可观测之前，暂缓对该 KR 评分。不要将子信号提升为 KR 层级的通过结论。

## 该技能检测的反模式

该技能会扫描以下情况，并进行标记或拒绝：

- 事后调整目标（因为我们改了目标，所以达成了）——记录变更；根据两种定义分别评分
- 对 `committed` 或 `compliance_or_safety` KR 事后缩小范围（承诺完成 3 项医疗保健审计，完成了 1 项，却按“通过已纳入范围”评分）——拒绝，并标记为 not-yet-fully-observable
- 将 guardrail 的失败平均掉（将失败的 guardrail 消解在较高的主要得分中）——单独报告 guardrail 信号
- 将 committed 按 aspirational 方式评分（将 committed KR 的 0.7 视为成功）——拒绝并说明原因
- 将投入等同于影响（计划已上线，得分没有变化，却将其评分为部分成功）——将上线状态与 KR 影响分开
- 绩效关联（将该得分用于绩效评估）——拒绝并说明原因
- 将未达成的 committed 说成挑战目标（我们没有完全赶上合同约定的截止日期，但团队确实很努力）——拒绝这种表述
- 过于保守的目标（在 aspirational 目标上持续取得高于 0.85 的得分）——标记出来，以便在下一个周期重新校准目标
- 强行为 not-yet-observable 打分（为 90 天窗口尚未结束的 KR 给出数值评分）——标记为 deferred
- 在缺乏证据时将计划说成原因（声称计划 X 推动了 KR Y，但时间关系或数据采集无法支持这一结论）——将表面贡献与因果主张分开
- 隐藏低置信度（证据薄弱却给出精确的数值评分）——呈现置信度；不要让精确度掩盖不确定性
- 利益相关者叙事覆盖证据（领导者偏好的表述优先于证据）——评分者的判断应独立于利益相关者的表述
- 单周期确认（将一个周期的信号视为证据确凿）——当证据具有提示性但不够稳健时，建议再观察一个周期

## 输出契约（v1.0.0）

- 所有必需章节均已按规范顺序呈现：Summary、Scorecard、Objective Interpretation、Evidence Quality、Initiative Review、Learning、Next-cycle Recommendations、Risks in Interpretation
- Scorecard 中的每个 KR 均包含：实际值（或 `not-yet-observable` / `not-yet-fully-observable` 标记）、使用与类型相适配的约定得出的分数、证据置信度、解读
- `aspirational` KR 使用 0 到 1 的数值范围；`committed` KR 为通过或失败；`compliance_or_safety` KR 为二元结果；`operational_health` KR 为 pass | fail | drift-within-tolerance；`learning` KR 使用 validated 或 invalidated 表述
- 指标类别为 `guardrail` 的 KR 单独列出，无论 OKR 类型为何，均不得计入主要目标得分的平均值
- `committed` 或 `compliance_or_safety` KR 的部分覆盖应标记为 `not-yet-fully-observable`，而不是 `pass-on-in-scope`
- 存在真实来源说明，并且指向 skill 之外的位置
- Hand-off 章节应为学习、团队流程工作、假设测试和度量缺口分别列出具体的下游 skill
- 仅输出 Markdown。不得输出 JSON。
- Measure 阶段分类：frontmatter 中使用 `phase: measure`；不得包含 `classification:` 字段

## 质量检查清单

最终确定前，请验证：

- [ ] 每个 KR 都有最终值、明确的 `not-yet-observable` 标记，或明确的 `not-yet-fully-observable` 标记（适用于 `committed` 或 `compliance_or_safety` KR 的部分覆盖）
- [ ] 每个 KR 都有证据置信度评级
- [ ] 每个 KR 的分数都使用其 OKR 类型对应的规范枚举约定：`committed | aspirational | learning | operational_health | compliance_or_safety`
- [ ] `guardrail` 被视为指标类别，而不是 OKR 类型
- [ ] 指标类别为 `guardrail` 的 KR 单独列出，且绝不计入主要得分的平均值
- [ ] 没有静默吸收追溯性目标变更
- [ ] `committed` 或 `compliance_or_safety` KR 没有追溯性缩小范围（部分覆盖应为 `not-yet-fully-observable`，而不是 `pass-on-in-scope`）
- [ ] 没有将任何 committed KR 按 aspirational KR 评分
- [ ] 没有将投入等同于影响的表述
- [ ] 没有与薪酬挂钩的表述
- [ ] Risks-in-interpretation 章节指出分数可能误导读者的情形
- [ ] Hand-off 章节列出具体的下游 skill 及其理由
- [ ] 存在真实来源说明
- [ ] 最终产物中已移除 skill 指令性评论
- [ ] 仅限 Markdown——不得输出 JSON

## 示例

请参阅 `references/EXAMPLE.md`，其中提供了 storevine 示例线程（Campaigns 团队，2026 年第三季度结项）中一份已完成的周期复盘，展示了包含一个尚不可观测 KR、一个暂缓处理的 guardrail，以及“模板是留存驱动因素”这一论点被证伪时的 aspirational 评分。配套的 `foundation-okr-writer` skill 负责生成本 skill 评分所需的 OKR 集合；二者共同覆盖完整的季度周期。