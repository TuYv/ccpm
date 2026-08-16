---
name: writing-plans
description: "Use when you have an approved spec or written requirements for a multi-step task that needs a durable plan document before touching code. Small, single-owner, or fast-path tasks do not need this skill."
---
<EXPLICIT-MODE-GATE>
如果激活模式为显式（`~/.config/aegis/config.toml` 中包含
`activation_mode = "explicit"`，或者环境中可见
`AEGIS_ACTIVATION_MODE=explicit`），且当前用户请求未按名称显式调用
Aegis 或此技能，则退回快速路径：简洁回答，不使用此工作流的检查清单、仪式或文档要求。如果用户显式提到了 Aegis 或此技能，则正常继续。
</EXPLICIT-MODE-GATE>

# 执行

→ 已有父级计划/规范，并且只有一个很小的执行切片？→ **使用无计划切片通道。**
  1. 输出一份精简的切片卡：目标、父级计划/规范、文件、边界、验证、停止条件
  2. 如果需要持久状态，更新父级工作流的检查点/证据/偏移状态
  3. 不要为微切片保存新计划
→ 不存在持久边界（没有新的所有者、契约、模式、公共 API、迁移或兼容性表面）的机械性或有界变更？→ **使用
  不带父级文档的无计划切片通道。** 输出精简的切片卡，
  跳过计划文件，并在提交消息中记录该变更。
→ 已有获批的新工作流规范/需求，或存在升级触发条件？→ **编写实施计划。假设工程师完全不了解上下文。**
  1. 范围检查：事实/假设/未知项、基线、需求就绪检查、波及信号分类、兼容性边界、双轨需求
  2. 文件映射：创建/修改哪些文件、清晰的边界、遵循现有模式
  3. 小粒度任务（每项 2-5 分钟）：确切的文件路径、完整代码、确切命令、预期输出
  4. 自我审查：规范覆盖度、占位符、类型一致性、兼容性、验证、双轨
  5. 保存 → 选择并宣布执行路径；继续执行，除非存在真正需要用户介入的授权或安全边界
→ 计划必须回答：问题、基线、文件、兼容性、验证、风险、退役。
→ 当切片新增所有者、契约、模式、公共 API、架构边界、迁移、持久化、安全/权限、分发/发布表面，或验证边界不明确时，从无计划切片通道升级为持久计划。

# 编写计划

## 概述

编写全面的实施计划，假设工程师对我们的代码库完全不了解，而且品味堪忧。记录他们需要知道的一切：每项任务要修改哪些文件、代码、测试、可能需要查阅的文档，以及如何测试。将完整计划拆分成小粒度任务交给他们。DRY。YAGNI。采用选定的 TDD 路径。每个连贯的任务或切片对应一次经过验证的提交。

假设他们是熟练的开发者，但对我们的工具集或问题领域几乎一无所知。假设他们不太懂良好的测试设计。

此技能是多步骤实施工作的规范规划工作流。使用它将已获批准的规范或需求转化为可执行、可测试、具备影响感知能力，并受兼容性与权限约束限定的计划。

严格的 RED / GREEN 步骤仅适用于用户/项目明确要求 TDD，或
`TDD Route: strict` 的情况。当 TDD 模式为 `off` 且没有严格路径时，应规划最小化实现和与之相称的回归/验证步骤；不要仅因风险而规定 TDD 循环。

### TDD 路由守卫

在任务分解之前，每个包含实施工作的计划都必须记录：

```text
TDD Route:
- Mode: off | auto
- Decision: strict | light | skipped
- Strict authority: explicit user/project request | recorded auto decision | not applicable
- Test posture: diagnostic reproduction | post-change regression | strict RED test
- Reason:
- Verification:
```

在 `off` 模式下，应记录 `Decision: skipped`，除非用户或项目明确提出严格要求并覆盖该决定。这条记录使边界可供审查；它不会加载 `test-driven-development`。已获批准的计划、缺陷标签、架构风险、契约风险或共享模块标签，都不构成严格模式的授权依据。

只有在 `Decision: strict` 且已说明严格模式授权依据的情况下，才能将 `Write failing test`、`Verify RED`、`GREEN` 或 `REFACTOR` 规定为任务步骤。否则，应根据情况编写最小变更，并辅以诊断性复现或变更后回归验证。在 `auto` 模式下，如果计划缺少已记录的决定，则应在编写实施任务之前返回路由选择阶段；切勿在分解过程中推断为 `strict`。

**开始时声明：**“我正在使用 writing-plans 技能来创建实施计划。”

**执行上下文：**默认复用当前分支/工作区。只有在需要独立历史记录时才需要分支；只有在需要并发检出、隔离无关的未提交状态，或获得用户/仓库明确授权时才需要工作树。

**输入：**已获批准的需求、Spec Brief 或 Design Spec。

**计划保存至：**`docs/aegis/plans/YYYY-MM-DD-<feature-name>.md`
计划始终保存到 `plans/`，绝不能保存到 `work/`。
（用户对计划位置的偏好会覆盖此默认设置。）

例外：如果现有父计划/规范已经涵盖当前这个微小的执行切片，则使用无计划切片通道。不要保存新计划。改为在对话或当前长期任务检查点中输出一份精简的 `Slice Card`：

```text
Slice Card:
- Goal:
- Parent plan/spec:
- Files:
- Boundary:
- Verification:
- Stop:
```

如果 `docs/aegis/` 不存在，且已配置的 Aegis 工作区支持可用，请先初始化目标项目：

```bash
python <aegis-workspace-helper> init --root <target-project-root>
```

项目授权优先于工作区初始化。尤其是，Aegis Method Pack 仓库不得创建或发布实际使用的 `docs/aegis/` 工作区；应使用其正式的 `docs/adr/`、`docs/current/` 和当前会话计划。

如果已安装的 Aegis 工作区支持不可用，请手动初始化工作区：
  1. 创建 `docs/aegis/README.md` 和 `docs/aegis/INDEX.md`
  2. 根据模板创建 `docs/aegis/BASELINE-GOVERNANCE.md`
  3. 如果项目包含代码，则创建 `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md`
然后保存计划并追加到 `docs/aegis/INDEX.md`。优先使用：

```bash
python <aegis-workspace-helper> append-index --root <target-project-root> --path docs/aegis/plans/<filename>.md --kind plan --title "<title>"
python <aegis-workspace-helper> check --root <target-project-root>
```

## 范围检查

如果输入是规格简报，请将计划限定在已确定的事项/原因/验收范围内，除非出现新的架构、契约、迁移或跨模块不确定性，否则不要将其扩展为正式设计。

在编写计划之前，采用以下紧凑输出契约：`Aegis Visibility`、`Plan Basis`、`BaselineUsageDraft`、`Requirement Ready Check`、`Files`、`Compatibility`、`Change Necessity`、`Existence Check`、`Architecture Integrity Lens`、`Plan Pressure Test`、`Plan-Time Complexity Check`、`Execution Readiness View`、`Tasks`、`Risks` 和 `Retirement`。仅在已批准的范围、风险或验证覆盖面有需要时展开。

此工作流中的 `Aegis Visibility` 用于说明，是哪项所有者、契约、退役、兼容性或验证压力使得在执行前进行规划具有价值。对于普通计划，使用一句自然语言；仅在审计、调试、发布、长任务审查或用户明确要求时使用结构化追踪。

当计划依赖特定基线文档或当前权威参考资料时，使用紧凑的 `BaselineUsageDraft`：

```text
BaselineUsageDraft:
- Required baseline refs:
- Delivered context refs:
- Acknowledged before plan refs:
- Cited in plan refs:
- Missing refs:
- Decision: continue | needs-baseline-readback | needs-verification | pause-for-user | blocked
```

`Delivered context refs` 仅是可选的、由宿主投射的记录信息。它并不是宿主已注入上下文载荷或模型已在内部使用该载荷的权威证明。此工件旨在让基线/上下文注意力的偏移在规划前和规划过程中变得可见。

在分解任务之前，使用紧凑的 `Requirement Ready Check`，除非输入已经是验收边界明确的已批准计划/规格：

```text
Requirement Ready Check:
- Requirement source refs:
- Goals and scope refs:
- User / scenario refs:
- Requirement item refs:
- Acceptance / verification criteria refs:
- Open blocker questions:
- Decision: ready | needs-source | needs-goal-alignment | needs-scenario | needs-acceptance-criteria | needs-clarification | needs-user-decision | blocked
```

如果决策不是 `ready`，则不要创建实施任务。将最少量的缺失证据或待定决策反馈给需求/规格所有者。任务意图、对话或智能体推断可以作为候选来源引用，但其本身并不是持久的需求权威依据。

当计划将认可任何新的源代码路径或非简单的源代码编辑时，请在任务分解之前使用紧凑的 `Change Necessity`。这是“究竟是否应该更改代码？”检查；它不是新的工件，也不是 `using-aegis` 热路径的扩展。

这由行为触发，而非由提示词触发。如果计划即将添加任何新的源代码路径或创建非简单的源代码编辑任务，即使用户没有要求，也要给出自然语言形式的检查结果。极小的辅助函数、小型守卫逻辑、新分支、回退逻辑、适配器或所有者均不能豁免。例如：“代码必要性检查：非代码路径不足以解决问题，因为 <reason>；最小变更边界是 <owner/files>，因此决策为更改代码。”

```text
Change Necessity:
- User-visible need:
- No-change / non-code option:
- Why code change is necessary:
- Minimum change boundary:
- Decision: no-change | docs/config-only | code-change | needs-clarification
```

如果决策为 `no-change`，不要编写代码编辑任务。如果决策为
`docs/config-only`，将计划限定在该范围内。如果决策为
`needs-clarification`，返回需求/规范负责人处。如果决策为
`code-change`，则将最小变更边界落实到 `Files`、任务步骤和
验证中。已获批准的需求本身并不能证明有必要新增源代码路径。

当计划将新增负责人、技能、产物、宿主适配器、回退机制、兼容路径、
工作流步骤或基准指标时，请在任务分解之前使用精简的 `Existence Check`。
以 `docs/current/AEGIS_MINIMALITY_REFERENCE.md` 作为参考，并确保该检查
仅具建议性质。对于仅复用现有负责人和现有范围的计划，不要强制执行此检查。

```text
Existence Check:
- Proposed new surface:
- Existing owner / reuse candidate:
- Why existing surface is insufficient:
- Creation proof:
- Entropy / retirement impact:
- Decision: reuse-existing | add-with-proof | defer | reject | needs-first-principles-review
```

如果决策为 `reuse-existing`，应针对现有负责人编写任务，而不是创建新的范围。
如果决策为 `add-with-proof`，则将证明、验证信号以及任何退役触发条件落实到
相关任务中。

当一个可执行计划仍可能包含职责重叠、错误的规范负责人、调用方回退、承载实际
逻辑的陈旧路径，或遗漏对更高层级负责人/契约/事实来源的简化时，请在任务分解
之前使用 `Architecture Integrity Lens`。内容应保持精简：不变量、规范负责人/
契约、职责重叠、更高层级的简化、退役条件/证伪条件，以及结论。

在任务分解之前使用精简的 `Plan Pressure Test`：

```text
Plan Pressure Test:
- Owner / contract / retirement:
- Architecture integrity / higher-level path:
- Verification scope:
- Task executability:
- Pressure result: proceed | revise plan | return to design
```

压力测试不是审批关卡，不应在没有正当理由的情况下重新设计已获批准的规范。
它用于发现负责人/契约/退役风险、缺失的验证，以及过于模糊、无法安全执行的任务。

在将中等/高复杂度、由子代理驱动、容易发生交接、长时间运行、涉及架构、契约、
兼容性或对退役敏感的计划交付执行之前，请呈现一个 `Execution Readiness View`。
该视图是现有运行时就绪草案和计划内容的可供人类阅读的投影。它不是一种新的
JSON 产物类型、审批关卡、权威 `GateDecision`、`PolicySnapshot` 或完成权限。
在将任何任务批次交付执行之前，该视图必须展示 Intent Lock、Scope Fence 和
Baseline Lock。

```text
Execution Readiness View:
- Intent Lock:
- Scope Fence:
- Baseline Lock:
- Approved Behavior:
- Owner / Contract Constraints:
- Compatibility Boundary:
- Retirement Boundary:
- Task Batches:
- Test Obligations:
- Review Gates:
- Drift / Rewind Rules:
- Evidence Required Before Completion:
- Advisory Boundary: method-pack execution guidance only; not GateDecision, PolicySnapshot, or completion authority
```

为该视图使用现有输入：`TaskIntentDraft`、`BaselineUsageDraft`、
`ImpactStatementDraft`、`GateInputPack`、计划中的任务批次、
兼容性 / 退役章节以及验证命令。对于微小的快速路径任务，除非用户要求执行交接回读，
否则跳过该视图。

当计划会更改维护中的源文件、核心所有者、处理器、路由器、管理器、
共享实用工具、适配器或回退路径时，在编写任务步骤之前使用精简的
`Plan-Time Complexity Check`：

使用 `using-aegis/references/complexity-governance.md` 中的共享工件
分类、压力信号和超出预算处理规则。

```text
Complexity Budget:
- Artifact class:
- Target files / artifacts:
- Current pressure:
- Projected post-change pressure:
- Budget result: within-budget | at-risk | over-budget
- Planned governance:

Plan-Time Complexity Check:
- Target files:
- Existing size / shape signals:
- Owner fit:
- Add-in-place risk:
- Better file boundary:
- Recommendation: edit-in-place | extract helper | add owner file | split task | defer refactor
```

如果预计的预算结果为 `over-budget`，不要编写一个默认可以原地扩展却不加说明的原子任务。
应调整任务边界、添加治理工作，或明确标记该切片在实现开始前需要进行后续处理。

如果规范涵盖多个相互独立的子系统，建议拆分成多个计划。在编写任务之前，检查：
事实/假设/未知项、基线文档、兼容性边界，以及是否适用双轨（修复 + 退役）。
如果已批准的需求或设计中带有 ADR 信号，则保留 ADR 信号、来源引用、实际备选方案、
兼容性边界，以及完成阶段预期提出的基线同步问题，以便 ADR 自动回填能够运行，
而无须从头重新发现该决策。

如果任务分解会引入规范尚未明确的新所有者、重复所有者、回退机制、
适配器、仅用于兼容性的载体、优先删除问题、未经验证的假设或长期稳定性声明，
请先使用 `Existence Check`。如果新的表面仍有合理依据，但所有者、
契约或退役决策仍存在风险，则在任务分解之前使用 `first-principles-review`
及其 `Decision Hygiene Review` 或 `Architecture Integrity Lens`。

当计划必须在删除旧内部路径、为已证实的外部边界保留兼容性，或因需要确认持久状态而停止
这几种选择之间作出决定时，组合使用 `anti-entropy-governance`。将其限定为狭义的分类和
护栏所有者；它不授权执行破坏性操作。

当以下所有条件均成立时，在编写或保存计划之前使用 `Planless Slice Lane`：

- 父级规范或父级计划已经定义了工作流
- 当前请求是在执行或细化该父级中的一个有界任务
- 未出现新的所有者、契约、模式、公共 API、架构边界、迁移、
  持久化、安全/权限、分发/发布表面或不明确的验证边界
- 该切片可以用 `Slice Card` 描述

该通道可在不将执行记录转化为持久规划产物的情况下，保持长时间任务的连续性。

## Aegis 项目工作区

工作区创建由计划保存步骤触发。有关严格的二元规则，请参阅 `using-aegis/SKILL.md` 中的工作区支持规则。如果项目已有 docs/adr/ 或架构文档，请引用它们——不要建立重复的权威来源。

## 文件结构

在定义任务之前先梳理文件。设计边界清晰且职责单一的单元。需要一起变更的文件应放在一起。遵循现有代码库的模式。每个任务都应产生自包含、可独立审查的变更。

对于非简单项目计划，如果存在 `CONTEXT-MAP.md`/`CONTEXT.md`，请以被动方式读取其中相关的当前有效语言。在计划标题、任务、验收表述和所有者引用中一致使用规范术语。如果规划过程中发现已明确的语义变更、歧义或冲突，请组合使用 `establishing-project-context`，而不是仅在计划中记录术语表决策。仅进行被动读取不会加载主动建模。

## 必需的规划输出

在离开此工作流之前，书面计划必须能够回答以下问题：

1. **此计划正在实施什么问题或已批准的范围**
2. **哪些基线文档、ADR 或需求影响了该计划**
3. **需求就绪检查是否已就绪，或仍缺少哪些需求来源、场景、验收条件、澄清信息或用户决策**
4. **规划前明确确认了哪些必需的基线引用，以及计划中实际引用了哪些内容**
5. **哪些文件负责承载该变更**
6. **必须维持什么兼容性边界**
7. **为何必须变更代码，或为何计划被收窄为无需变更、仅变更文档/配置或仅进行澄清**
8. **任何新表层是否通过了存在性检查，或是否已被转交给现有所有者**
9. **架构完整性检查是否在任务分解之前找到了更高层级的所有者/契约路径**
10. **规划阶段存在哪些复杂度压力，以及哪种编辑边界更安全**
11. **此次交接是否需要 `Execution Readiness View`；如果需要，它呈现了哪些意图、范围、基线、兼容性、退役、测试、审查和漂移边界**
12. **哪些验证能够证明每个主要工作切片**
13. **仍存在哪些风险、回滚范围、旧所有者/回退处理、ADR 信号保留以及基线同步信号**

## 小粒度任务划分

**每个步骤只执行一个操作（2-5 分钟）：**
- 在 `TDD Route: strict` 下：编写失败测试 → 验证 RED → 实现最少量代码 → 验证 GREEN。
- 否则：进行最小变更 → 运行能够证明该变更的针对性回归测试或验证。

步骤是执行单元，而不是 Git 历史记录单元。每完成并重新验证一个连贯的任务，或完成一个可独立验证/回退的长任务切片后，提交一次。不要为每个 2-5 分钟的步骤分别提交。

## 计划文档标题

每份计划都必须以以下内容开头：目标、架构、技术栈、基线/权威引用、兼容性边界、TDD 路线、验证。请参阅此目录中的模板。

## 任务结构

每个任务均须包含：文件（创建/修改/测试路径）、原因（用户/业务价值）、变更必要性（为何需要修改源代码以及最小变更边界）、影响/兼容性、验证（确切命令），随后是与 TDD 路线匹配的步骤。严格路线采用编写测试 → 验证 RED → 最小化代码 → 验证 GREEN；`off`、轻量和跳过路线采用最小变更，并辅以与之相称的回归测试/验证。执行协调者在首次写入前捕获 `TaskStartSnapshot`，并且仅在整个任务通过审查和验证后创建一个限定范围的提交。每个步骤都必须包含完整代码和确切命令。

对于错误修复、重构、契约变更或治理清理，应在相关任务中添加修复轨道（根本原因、规范所有者、充分且稳定的最小修复、兼容性边界、验证）和退役轨道（旧所有者/回退机制、活动状态、保留原因或删除触发条件）。如果触发了涟漪信号分诊，请在同一任务中包含受影响的下游使用方和扩展后的验证路径。

## 禁止占位符

绝不要写："TBD"、"TODO"、"implement later"、"fill in details"、"Add appropriate error handling"、没有实际测试代码的 "Write tests for the above"，或不重复代码的 "Similar to Task N"。每个步骤都必须包含完整且可直接复制粘贴使用的内容。

## 自我审查

根据规范检查计划：1）规范覆盖——能否为每项要求指出对应的任务？2）占位符扫描——是否存在任何 TBD/TODO/含糊指令？3）类型一致性——各任务间的签名是否匹配？4）兼容性——是否标明了不变量、非目标和稳定接口？5）变更必要性——每个代码编辑任务是否说明了为何不做变更或仅修改文档/配置不足以解决问题，并指出最小边界？6）存在性检查——任何新的所有者、工件、适配器、回退机制、工作流步骤或基准指标是否有存在性证明和复用决策？7）计划阶段的复杂度与最小化——是否采用了能够修复此类错误的最低熵所有者/文件边界，而非仅追求最小文本差异？8）架构完整性——是否跳过了任何更高层级的所有者/契约/事实来源简化？9）验证——是否提供了确切命令？10）是否在需要时保留了双轨、决策规范以及 ADR/基线同步信号？

就地修复问题。无需重新审查——直接修复并继续。

## 执行交接

保存计划后，当符合上述交接条件时，呈现 `Execution Readiness View`。代理负责决定执行路线；不要仅仅因为两种路线都可行就要求用户进行选择。

当子代理可用、计划中存在所有权边界明确且真正相互独立的任务，并且审查/上下文收益足以抵消协调成本时，选择 `subagent-driven`。否则选择 `inline`。缺少子代理支持或子代理支持被拒绝时，应回退到内联执行，而不是阻塞任务。仅工作区存在未提交变更并不能决定采用哪条路线；应分别应用 Git 所有权、重叠和隔离规则。

仅当执行路径的选择触及尚未解决的授权、隐私、付费资源、外部操作或不可逆边界；改变已批准的范围或验收契约；或者没有任何安全路径能够保留现有工作区的所有权时，才询问用户。如果不存在此类边界，则立即继续。

简明说明决策：

```text
Execution Route:
- Decision: subagent-driven | inline
- Evidence:
- Fallback:
- User confirmation required: no | yes — <specific unresolved boundary>
```

**如果为 `subagent-driven`：**
- **必需的子技能：** 使用 aegis:subagent-driven-development
- 每项任务使用一个全新的子代理，并进行两阶段审查

**如果为 `inline`：**
- **必需的子技能：** 使用 aegis:executing-plans
- 分批执行，并设置审查检查点

## 规划边界

- 计划可以定义实施切片、验证、回滚范围和退役预期
- `Execution Readiness View` 可以在执行前明确展示实施启动条件、验证义务以及偏移 / 回退规则
- 计划不能授予权威性的完成认定
- 计划应为可在运行时直接执行做好准备，而不是假装自己拥有运行时权威性