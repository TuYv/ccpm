---
name: foundation-okr-writer
description: Drafts, reviews, rewrites, and coaches outcome-based OKR sets across team, department, product, or company scopes. Supports five entry modes (Guided default, One-Shot via --oneshot, Sustained Coach, Audit Only, Rewrite). Diagnoses empowered-team context and adjusts framing; refuses to fabricate baselines or targets; refuses to use OKR scores for compensation; reframes feature-delivery KRs into outcome KRs. Use when planning quarterly OKRs, translating strategy into team outcomes, reviewing draft OKRs for quality, or converting roadmap-as-OKR drafts into proper OKR sets.
license: Apache-2.0
metadata:
  classification: foundation
  version: "1.1.0"
  updated: 2026-04-30
  category: coordination
  frameworks: [triple-diamond, okrs, lean-startup]
  author: product-on-purpose
---
<!-- PM-Skills | https://github.com/product-on-purpose/pm-skills | Apache 2.0 -->
# OKR 撰写者

OKR（Objectives and Key Results，目标与关键结果）集合是一项季度产物，用于将战略转化为团队承诺推动的可衡量成果。OKR 是一个聚焦与学习系统，而不是项目计划、KPI 仪表板、绩效评审工具或路线图包装器。做好后，它们能明确优先级、迫使团队进行取舍、促成跨团队协同，并创造清晰可见的进展证据。做得不好时，它们会制造路线图表演、薪酬博弈和虚假的精确性。

这项技能是教练，而不是模板填充器。它依据从 Doerr（`Measure What Matters`）、Wodtke（`Radical Focus`）、Cagan（SVPG 团队目标）、Castro（结果与产出之别）、Grove（`High Output Management`）、Torres（持续发现）以及 Gothelf 和 Seiden（`Outcomes Over Output`）的实证共识中提炼出的标准，对 OKR 集合进行起草、评审、重写和审计。

## 支持的模式

五种进入模式支持不同程度的参与。模式根据用户的措辞进行检测；存在歧义时，默认为 Guided。在响应开头说明检测到的模式。

- `Guided`（默认，中等参与度）- 进行简短诊断，根据评分标准起草并评分，指出问题，并请用户确认。用户使用类似“帮我为 X 撰写 OKR”的措辞时选择此模式。
- `One-Shot`（低参与度）- 一次性生成完整的 OKR 集合，并标注所有假设。用户使用 `--oneshot` 标志或类似“根据这些背景直接起草 OKR”的措辞时选择此模式。
- `Sustained Coach`（高参与度）- 逐个处理组件的迭代循环，每轮重新评分，直到达到质量阈值。用户使用“带我一步步完成 X 的 OKR 教练过程”时选择此模式。
- `Audit Only` - 用户粘贴现有 OKR，由技能进行评分和批评；除非用户要求，否则不生成新的草案。用户使用“评审这些 OKR”时选择此模式。
- `Rewrite` - 将有缺陷的 OKR、功能列表或路线图条目转换为结果导向的 OKR。用户使用“修复这些 OKR”或“将这个路线图转换为 OKR”时选择此模式。

## 适用场景

- 在公司、部门、产品、产品领域、团队或计划范围内规划 OKR
- 将上级 OKR 或战略转化为团队 OKR
- 评审 OKR 草案的质量（Audit Only 模式）
- 将功能、路线图或计划列表重新构建为基于结果的 OKR（Rewrite 模式）
- 为利益相关者评审准备 OKR
- 识别 KR 是否可衡量且有证据支撑

## 不适用场景

- 你只需要仪表板规范 - 使用 `measure-dashboard-requirements`
- 你只需要事件跟踪 - 使用 `measure-instrumentation-spec`
- 你只需要实验 - 使用 `measure-experiment-design`
- 你只需要假设 - 使用 `define-hypothesis`
- 周期已经结束，你需要基于证据进行正式评分并综合学习成果 - 使用 `measure-okr-grader`
- 团队完全属于日常业务运营，需要的是稳定状态 KPI，而不是有挑战性的成果 - OKR 不是合适的产物

## 指令

当被要求撰写或评审 OKR 时，遵循以下步骤：

1. **检测模式**
   阅读用户的措辞，将其分类为 Guided、One-Shot、Sustained Coach、Audit Only 或 Rewrite。查找明确的信号（`--oneshot`、“review these”、“fix these”、“coach me”）。存在歧义时，默认为 Guided。在响应开头说明检测到的模式。

2. **运行赋能团队诊断**（在 Audit Only 模式下，如果没有进行新的起草工作，则跳过）
   简要询问：
   - 本周期是否已经承诺了功能、项目或日期？
   - 如果 KRs 没有进展，团队能否在周期中途调整计划？
   - 由谁决定构建什么，是这个团队还是其他人？

   将答案记录为 `empowerment_signal: empowered | feature-team | mixed | unknown`。这会影响后续步骤中的输出表述。当出现 feature-team 信号时，**不要**拒绝继续；相反，应计划在产物中添加 Disclosure 部分。

3. **确定 OKR 是否是合适的产物**
   如果请求本质上是项目计划、KPI 仪表板、发布清单、假设、实验或状态更新，则应转向适当的 pm-skill 或进行链式处理。不要将非 OKR 工作强行套用 OKR 结构。

4. **对运营背景进行分类**
   记录范围（company | department | product | product-area | team | initiative）、周期（quarter | half | annual | launch window | custom）、层级和 OKR 类型（committed | aspirational | learning | operational_health | compliance_or_safety）。如果缺少背景信息，默认周期为季度。

5. **提取或推断战略意图**
   确定促成这组 OKR 的上级目标、战略支柱、客户问题或业务压力。如果没有提供任何信息，则在起草前询问一次。

6. **区分结果与工作**
   将功能、任务、项目、发布、招聘数量和活动数量移入 Initiatives。OKR 描述的是世界发生了什么变化；Initiatives 是促成这种变化的行动下注。应用 Castro 的试金石：“如果它可以放进你的待办列表，那它就不是结果。”

7. **起草或改进 Objective**
   Objective 应当是定性的、具体的、具有方向性的，并且适合当前周期。它描述的是期望达成的状态变化，而不是项目。它应与战略建立联系。避免在其中嵌入指标（数字应放在 KRs 中）。除非该产物定义了空泛形容词的含义，否则应避免使用这类形容词。

8. **起草或改进 Key Results**
   对于每个 KR，包含：指标定义、基线（如果缺失则使用 `recommended-to-measure`）、目标值、截止日期、证据来源、适用时的负责人、指标类别（`leading | lagging | guardrail | health | evidence_generation`）以及信心程度（`high | medium | low | unknown`）。对于任何可能损害配对指标的优化，都应包含一个 guardrail KR（例如参与度与质量、增长与留存、速度与可靠性之间的权衡）。

   应用下一节中的约束规则。

9. **将 initiatives 映射为行动下注**
   每个 initiative 都应说明预期推动哪些 KR，以及这一预期所依据的假设。Initiatives 是假设，而不是承诺。不要将 initiatives 列为 KRs。

10. **运行 OKR 质量审计**
    根据下方的评分标准对草案进行评分。将问题直接呈现在相应位置，而不是埋在附录中。对于每个评为 `risk` 或 `fail` 的项目，都应包含具体的改进建议。

11. **应用赋能团队 Disclosure**（需要时）
    如果 `empowerment_signal == feature-team` 或 `mixed`，则添加一个 Disclosure 部分：“This OKR set frames pre-committed work as outcome bets. If the metrics do not move when the work ships, that is a learning, not a delivery failure. The team's lever this cycle is to keep shipping; the OKR's lever is to update next-cycle planning.” 当信号为 `empowered` 时，完全省略此部分。

12. **明确尚未解决的问题**
    记录用户必须作出、且技能无法根据上下文解决的决策。例如：KR 的度量窗口延伸至周期结束之后、计划的分阶段决策、群组定义边界。

13. **注明事实来源**
    该产物是规划输入，而不是权威的 OKR 系统。包含一个 `source_of_truth` 字段，指向用户实际使用的 OKR 跟踪工具（公司 OKR 文档、Confluence 页面、仪表板、专用平台、电子表格，或实时状态所在的其他位置）。

14. **整理为可直接使用的内容**
    从最终产物中移除所有技能指令说明。最终输出应面向读者。

## 项目记忆契约

仅当 `.claude/pm-skills.local.md` 存在时启用。没有该文件时，完全忽略本节，
并严格按照上述描述执行。

- **读取：**读取 `phase`、`active_initiative` 以及任何先前的 `decision` 产物，使目标与已经作出的承诺保持一致，而不是重复陈述这些承诺。
- **写入：**将 OKR 集合作为 `decision` 产物写入。
- **处理方式：**提出条目并等待确认后再写入；除非设置了 `memory_auto_append: true`，在这种情况下追加内容并回显所写入的内容。
- **写入纪律：**在写入前立即重新读取文件，绝不要使用生成提案的副本。如果期间文件发生变化，应将你的条目合并到当前状态中，并重新提出，而不是覆盖文件；只能添加你自己的条目，并让其他所有字段和部分逐字节保持不变。运行时没有任何机制强制执行这一点，而且该文件被 gitignore 忽略，因此粗心地写入整个文件会丢失另一会话的工作，且无法恢复。

记忆永远不会提供基线或目标。无论记录了什么，都必须拒绝捏造这些内容。
## 约束规则（MUST / MUST NOT）

这些规则不可协商。该技能在所有模式下都会执行这些规则。

- **MUST** 衡量结果（客户行为变化、业务 KPI 变化、运营健康状况变化），而不是功能、任务、里程碑或活动数量。
- **MUST NOT** 默默捏造基线、目标、当前值或基准。明确将缺失值标记为 `assumption`、`placeholder`、`recommended-to-measure` 或 `not-enough-evidence`。
- **MUST NOT** 将 OKR 得分用作个人绩效评级或薪酬依据。如果用户提出此类要求，应拒绝并说明原因。
- 对于任何会激励增长、速度或数量的 KR，**MUST** 至少包含一个护栏指标或反向指标 KR。
- **MUST** 将 0.6 至 0.7 的最佳区间视为仅适用于有抱负的 OKR。承诺型、合规型、安全型、可靠性型以及合同约束型 KR 的目标值应为 1.0。
- **MUST** 默认使用团队级 OKR。当用户请求个人 OKR 时发出警告，并解释其带来的保守设目标和虚假精确风险。
- **MUST NOT** 成为权威事实来源。始终包含一个 `source_of_truth` 指针，指向用户实际使用的 OKR 跟踪工具。
- 当出现功能团队信号时，**MUST** 应用赋能团队 Disclosure。不要拒绝用户；应调整表述方式。

## 质量审计评分标准

该技能会将此评分标准应用于其起草或审查的每组 OKR。每项标准都会获得 `pass`、`risk` 或 `fail` 评级，并附上一句理由。

- 战略契合度：与战略、上级 OKR 或客户问题存在清晰关联
- 目标质量：具体、定性、能够指导取舍（不是口号、任务、指标集合或项目名称）
- KR 结果质量：衡量结果或行为变化（不是任务、功能或里程碑）
- 衡量质量：包含基线、目标、截止日期、证据来源（或标记为占位符）
- 产品影响力：团队能够合理地影响该结果
- 聚焦程度：1 到 3 个目标，每个目标包含 2 到 4 个 KR
- 护栏：任何优化类 KR 都考虑质量、可靠性或风险
- 对齐：上级、同级和依赖关系清晰
- 运营节奏：明确周期、检查点和评审节点
- 完整性：不与薪酬挂钩，不捏造数据
- Empowered-team 披露：出现 feature-team 信号时必须包含，处于 empowered 状态时省略

## 该技能检测的反模式

该技能会扫描以下反模式，并采取拒绝、重新构建或在审计评级中标记为 `fail` 的处理方式：

- 功能交付型 KR（例如“发布 X”，而不是“将 Y 从 A 提升到 B”）——重新构建为结果型 KR；将功能移至 Initiatives
- 任务数量型 KR（例如没有学习成果的“完成 10 次访谈”）——重新构建，或移至证据生成类
- 虚荣指标型 KR（指标有所改善，但没有客户或业务价值）——标记并提出替代方案
- 活动型目标（目标描述的是工作，而不是变化）——重新构建
- 指标堆砌型目标（目标只是将 KPI 粘贴在一起）——重新构建
- OKR 过多（超过 3 个目标，或每个目标超过 4 个 KR）——强制排序
- 级联表演（上级 KR 被复制到本地，但没有明确的所有权逻辑）——重写为网络化对齐
- 路线图包装（OKR 只是重新格式化路线图）——使用完整 Rewrite 模式
- 缺少基线（目标无法解读）——标记为 `recommended-to-measure`
- 缺少证据来源（没人知道评分将从何处获得）——标记为 `not-enough-evidence`
- 仅有滞后指标的产品 OKR（团队负责收入，但没有产品结果）——添加一个领先的产品结果型 KR
- 没有护栏（优化可能损害质量、信任或留存）——添加护栏 KR
- 与薪酬挂钩（人员会故意降低目标或隐藏学习成果）——拒绝并解释原因
- 个人 OKR 默认设置——默认使用团队 OKR；如果请求个人 OKR，则发出警告
- 不受支持的基准（没有证据支撑的通用目标）——标记并要求提供来源
- PMF 之前过度指标化（真正目标是学习，却虚构量化精确度）——重新构建为学习型 OKR

## 输出契约（v1.0.0）

- 所有必需部分均存在，并按规范顺序排列：Context、Objective、Key Results、Initiatives as Bets、Guardrails and Health Checks、Alignment Notes、Quality Audit、Open Questions、Suggested Next Step
- 当 `empowerment_signal == feature-team | mixed` 时，必须包含 Disclosure 部分；当处于 `empowered` 状态时省略
- 每个 KR 都包含指标定义、基线（或标记为占位符）、目标、截止日期、证据来源、指标类别和置信度
- Initiatives 与 KRs 分开列出，并明确说明其旨在推动哪些 KR
- 对于任何优化类主要 KR，至少存在一个护栏 KR
- 存在真实来源说明，并指向技能之外的位置
- Quality Audit 覆盖所有评分标准，并明确给出 `pass` / `risk` / `fail` 评级
- 仅输出 Markdown。不使用 JSON。
- Foundation 分类：frontmatter 中不包含 `phase:` 字段；使用 `classification: foundation`

## 质量检查清单

定稿前，请验证：

- [ ] 已检测并在响应开头说明模式
- [ ] 起草时已运行赋能团队诊断；已捕获信号
- [ ] 所有必需章节均已按规范顺序呈现
- [ ] 当存在功能团队信号时，已包含披露章节
- [ ] 每个 KR 均包含指标、基线（或占位符）、目标、截止日期、证据来源、指标类别和置信度
- [ ] 对于任何以优化为主要目标的 KR，至少包含一个护栏 KR
- [ ] 已提供事实来源说明
- [ ] 未捏造基线或目标——缺失值已明确标记
- [ ] 未采用与薪酬挂钩的表述
- [ ] 已应用质量审计，并明确标注通过 / 风险 / 失败评级
- [ ] 已扫描反模式目录——已检测到的反模式均已标记或重新表述
- [ ] 已对 OKR 类型进行分类（承诺型 | 愿景型 | 学习型 | 运营健康型 | 合规或安全型）
- [ ] 已从最终产物中移除技能指令说明
- [ ] 仅使用 Markdown——不输出 JSON

## 示例

请参见 `references/EXAMPLE.md`，其中包含 storevine 示例线程中的一组完整 OKR（Campaigns 团队，2026 年第三季度），展示了在具备真实跨团队协作依赖的赋能团队产品场景中使用引导模式的情况。配套的 `measure-okr-grader` 技能负责周期结束时的评分；二者共同覆盖完整的季度流程。