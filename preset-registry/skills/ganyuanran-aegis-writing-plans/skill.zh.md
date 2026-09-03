---
name: writing-plans
description: "Use when you have an approved spec or written requirements for a multi-step task that needs a durable plan document before touching code. Small, single-owner, or fast-path tasks do not need this skill."
---
<显式模式门控>
如果激活模式为显式模式（`~/.config/aegis/config.toml` 中的
`activation_mode = "explicit"`，或环境中可见 `AEGIS_ACTIVATION_MODE=explicit`），且当前用户请求没有明确按名称调用 Aegis 或此技能，则退出并返回快速路径：简洁作答，不执行此工作流的检查清单、流程仪式或文档要求。如果用户明确提到了 Aegis 或此技能，则正常继续。
</显式模式门控>

# 执行

→ 已有父计划/规范，并且当前是一个很小的执行切片？→ **使用无计划切片路径。**
  1. 输出紧凑的切片卡：目标、父计划/规范、文件、边界、验证、停止条件
  2. 如果需要持久化状态，则更新父工作流的检查点/证据/偏差状态
  3. 不为该微型切片保存新计划

→ 属于没有持久边界的机械性或有界变更（不涉及新负责人、
契约、架构、公共 API、迁移或兼容性范围）？→ **使用
无计划切片路径，不依赖父文档。** 输出紧凑的切片卡，
跳过计划文件，并在提交消息中记录该变更。

→ 已有获批准的规范/需求，适用于新的工作流或触发了升级条件？→ **编写实施计划。假设工程师没有任何上下文。**
  1. 范围检查：事实/假设/未知项、基线、需求就绪检查、影响信号分类、兼容性边界、双轨需求
  2. 文件映射：要创建/修改的文件、清晰的边界、遵循现有模式
  3. 细粒度任务（每项 2-5 分钟）：确切的文件路径、完整代码、确切命令、预期输出
  4. 自我审查：规范覆盖情况、占位内容、类型一致性、兼容性、验证、双轨
  5. 保存 → 选择并宣布执行路径；除非存在实际的授权或安全边界，否则继续执行

→ 计划必须回答：问题、基线、文件、兼容性、验证、风险、退役。

→ 如果切片新增负责人、契约、架构、公共 API、迁移、持久化、安全/权限、分发/发布范围，或验证边界不明确，则从无计划切片路径升级为持久计划。

# 编写计划

## 概述

编写全面的实施计划，假设工程师没有任何代码库上下文且判断力存疑。记录他们需要了解的所有内容：每项任务要修改哪些文件、代码、测试方式、可能需要检查的文档。将完整计划拆分为细粒度任务。遵循 DRY 和 YAGNI 原则。采用选定的 TDD 路径。每个完整任务或切片对应一个经过验证的提交。

假设对方是一名熟练开发者，但对我们的工具链或问题领域几乎一无所知。假设他们不太了解良好的测试设计。

此技能是多步骤实现工作的规范计划流程。它用于将获批准的规范或需求转换为可执行、可测试、考虑影响范围并受兼容性与权限约束的计划。

严格的 RED / GREEN 步骤仅适用于明确的用户/项目 TDD 请求或
`TDD Route: strict`。在 TDD 模式为 `off` 且不存在严格路径时，根据风险规划最低限度的实现和按比例配置的回归/验证步骤；不要仅因风险而规定 TDD 周期。

### TDD 路由守卫

在任务分解之前，所有包含实现工作的计划都必须记录：

```text
TDD Route:
- Mode: off | auto
- Decision: strict | light | skipped
- Strict authority: explicit user/project request | recorded auto decision | not applicable
- Strict signals:
- Light eligibility:
- TDD-fit exception:
- Test posture: diagnostic reproduction | post-change regression | strict RED test
- Reason:
- Verification:
```

在 `off` 模式下，记录 `Decision: skipped`，除非存在明确的用户/项目严格请求覆盖该设置。该记录使边界可供审查；它不会加载 `test-driven-development`。已批准的计划或风险标签本身不属于严格权限；匹配的风险只是一个信号，需要此负责人将 `recorded auto decision` 记录为权限来源。

在 `auto` 模式下，只要存在任何行为、错误修复、共享/核心、契约、持久化、权限、迁移、生产者/消费者或有意义的回归信号，就选择 `strict`。仅当以下条件全部满足时，才选择 `light`：改动极小、风险低、仅涉及单一负责人、不改变行为、不存在严格信号，并且有明确且集中的检查方式。缺少明确的用户 TDD 请求绝不能作为选择 `light` 的依据。风险未知时，应回到需求、调试或计划审查阶段。

只有带有明确严格权限的 `Decision: strict`，才能将 `Write failing test`、`Verify RED`、`GREEN` 或 `REFACTOR` 规定为任务步骤。否则，应执行最小改动，并根据情况进行诊断性复现或变更后的回归验证。在 `auto` 模式下，如果计划缺少已记录的决策，应在编写实现任务之前回到路由选择阶段；绝不能在分解过程中推断为 `strict`。

**开始时宣布：**“I'm using the writing-plans skill to create the implementation plan.”

**执行上下文：**默认复用当前分支/工作区。只有在需要独立历史记录、并发检出、阻塞无关的脏状态，或存在明确的用户/仓库权限时，才需要使用分支或工作树。

**输入：**已批准的需求、Spec Brief 或 Design Spec。

**计划保存至：**`docs/aegis/plans/YYYY-MM-DD-<feature-name>.md`  
计划始终保存到 `plans/`，绝不能保存到 `work/`。  
（用户对计划位置的偏好优先于此默认设置。）

例外：如果现有的父级计划/规范已经负责当前的微小执行切片，则使用 `Planless Slice Lane`。不要保存新计划。改为在对话中或当前长期任务检查点中输出一份简要的 `Slice Card`：

```text
Slice Card:
- Goal:
- Parent plan/spec:
- Files:
- Boundary:
- Verification:
- Stop:
```

如果 `docs/aegis/` 不存在，且已配置的 Aegis 工作区支持可用，则先初始化目标项目：

```bash
python <aegis-workspace-helper> init --root <target-project-root>
```

项目权限优先于工作区初始化。特别是，Aegis Method Pack 仓库不得创建或提交一个生效中的 `docs/aegis/` 工作区；应使用其正式的 `docs/adr/`、`docs/current/` 和当前会话计划。

如果已安装的 Aegis 工作区支持不可用，则手动初始化工作区：
  1. 创建 `docs/aegis/README.md` 和 `docs/aegis/INDEX.md`
  2. 根据模板创建 `docs/aegis/BASELINE-GOVERNANCE.md`
  3. 如果项目包含代码，则创建 `docs/aegis/baseline/YYYY-MM-DD-initial-baseline.md`
然后保存计划，并追加到 `docs/aegis/INDEX.md`。优先：

```bash
python <aegis-workspace-helper> append-index --root <target-project-root> --path docs/aegis/plans/<filename>.md --kind plan --title "<title>"
python <aegis-workspace-helper> check --root <target-project-root>
```

## 范围检查

如果输入是 Spec Brief，请将计划范围限定在已固定的
内容/原因/验收标准内；除非出现新的架构、契约、迁移或跨模块不确定性，否则不要扩展为正式设计。

在编写计划前，应遵循紧凑的输出约定：`Aegis Visibility`、`Plan Basis`、
`BaselineUsageDraft`、`Requirement Ready Check`、`Files`、`Compatibility`、
`Change Necessity`、`Existence Check`、`Architecture Integrity Lens`、
`Plan Pressure Test`、`Plan-Time Complexity Check`、
`Execution Readiness View`、`Tasks`、`Risks` 和 `Retirement`。仅在已批准的范围、风险或验证面要求时扩展内容。

对于此工作流，`Aegis Visibility` 应说明哪些所有者、契约、退役、兼容性或验证压力使得在执行前进行规划有用。对于普通计划，使用一句自然语言；仅在审计、调试、发布、长任务审查或用户明确要求时保留结构化追踪。

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

`Delivered context refs` 是可选的、由宿主投射的记录信息。它并非宿主已注入上下文载荷或模型已在内部使用该载荷的权威证明。该产物用于使规划前和规划期间对基线/上下文的关注偏移变得可见。

除非输入已经是验收边界明确的已批准计划/规格，否则请在任务拆分前使用紧凑的 `Requirement Ready Check`：

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

如果决策不是 `ready`，请不要创建实现任务。应携带最小缺失证据或决策，返回给需求/规格所有者。任务意图、对话或代理推断可以作为候选来源引用，但它们本身并不是持久的需求权威来源。

当计划会认可任何新的源代码路径或非平凡的源代码编辑时，请在任务拆分前使用紧凑的 `Change Necessity`。这是“是否根本需要修改代码”的检查；它不是新的产物，也不是 `using-aegis` 热路径扩展。

这是行为触发的，而非提示触发的。如果计划即将新增任何源代码路径或创建非平凡的源代码编辑任务，即使用户未提出要求，也应给出自然语言回读。微小辅助函数、小型防护、新分支、回退、适配器或所有者均不例外。示例：“代码必要性检查：由于 <reason>，非代码路径不足以解决问题；最小变更边界是 <owner/files>，因此决策为 code-change。”

```text
Change Necessity:
- User-visible need:
- No-change / non-code option:
- Why code change is necessary:
- Minimum change boundary:
- Decision: no-change | docs/config-only | code-change | needs-clarification
```

如果决策为 `no-change`，则不要编写代码编辑任务。如果决策为
`docs/config-only`，则将计划范围限定在该表面。如果决策为
`needs-clarification`，则返回需求/规范负责人。如果决策为
`code-change`，则将最小变更边界带入 `Files`、任务步骤和
验证中。已批准的需求本身并不能证明必须新增源代码路径。

在任务分解前，当计划需要新增所有者、技能、制品、宿主适配器、回退方案、兼容性路径、工作流步骤或基准指标时，使用简要的
`Existence Check`。使用
`docs/current/AEGIS_MINIMALITY_REFERENCE.md` 作为参考，并将检查结果作为建议。对于仅复用现有所有者和表面的计划，不要强制执行该检查。

如果决策为 `reuse-existing`，则针对现有所有者编写任务，而不是创建新表面。如果决策为 `add-with-proof`，则将证明、验证信号以及任何退役触发条件带入相关任务。

在任务分解前，当可执行计划仍可能编码责任重叠、错误的规范所有者、调用方回退、承载实际逻辑的过时路径，或遗漏更高层级的所有者/契约/事实来源简化时，使用 `Architecture Integrity Lens`。保持其简洁：不变量、规范所有者/契约、责任重叠、更高层级的简化、退役/证伪条件，以及结论。

在任务分解前使用简要的 `Plan Pressure Test`：

```text
Plan Pressure Test:
- Owner / contract / retirement:
- Architecture integrity / higher-level path:
- Verification scope:
- Task executability:
- Pressure result: proceed | revise plan | return to design
```

压力测试不是批准门槛，也不应无故重新设计已批准的规范。它用于发现所有者/契约/退役风险、遗漏的验证，以及过于模糊而无法安全执行的任务。

在将中/高风险、由子代理驱动、易于交接、长时间运行、涉及架构、契约、兼容性或退役敏感的计划交付执行前，渲染 `Execution Readiness View`。此视图是现有运行时就绪草稿和计划内容的人类可读投影。它不是一种新的 JSON 制品类型、批准门槛、权威的 `GateDecision`、`PolicySnapshot` 或完成裁决依据。
在将任何任务批次交付执行前，该视图必须展现 Intent Lock、Scope Fence 和 Baseline Lock。

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

对于微小的快速路径任务，跳过该视图，除非用户要求执行交接复述。

当计划会变更受维护的源文件、核心所有者、处理器、路由器、管理器、共享工具、适配器或回退路径时，请在编写任务步骤前使用紧凑的 `Plan-Time Complexity Check`：

使用 `using-aegis/references/complexity-governance.md` 获取共享工件类别、压力信号和超预算处理规则。

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

如果预测的预算结果为 `over-budget`，不要编写一个暗中假定原地增长的原子任务。应修订任务边界、增加治理工作，或在实施开始前明确将该切片标记为需要后续跟进。

如果规范涵盖多个相互独立的子系统，建议拆分为独立的计划。在编写任务前，检查：事实/假设/未知项、基线文档、兼容性边界，以及是否适用双轨（修复 + 退役）。如果已批准的需求或设计包含 ADR 信号，请保留 ADR 信号、来源引用、真实备选方案、兼容性边界，以及完成时预期的基线同步问题，以便 ADR Auto Backfill 无需从头重新发现该决策即可运行。

如果任务分解会编码规范尚未明确的新所有者、重复所有者、回退、适配器、仅兼容性载体、先删除问题、未经验证的假设或长期稳定性声明，先使用 `Existence Check`。如果新表面仍有合理性，但所有者、契约或退役决策仍有风险，请在任务分解前使用 `first-principles-review` 及其 `Decision Hygiene Review` 或 `Architecture Integrity Lens`。

当计划必须在删除旧内部路径、为已证明的外部边界保留兼容性，或因持久化状态确认而暂停之间做出决定时，组合使用 `anti-entropy-governance`。将其保持为狭窄的分类和护栏所有者；它不授权执行破坏性操作。

当以下所有条件均满足时，在编写或保存计划前使用 `Planless Slice Lane`：

- 父规范或父计划已定义该工作流
- 当前请求是在执行或细化该父级中的一个有界任务
- 未出现新的所有者、契约、模式、公共 API、架构边界、迁移、持久化、安全性/权限、分发/发布表面，或不明确的验证边界
- 该切片可以通过 `Slice Card` 描述

该通道保留长任务的连续性，同时不会将执行记录转变为持久化的规划产物。

## Aegis 项目工作区

工作区创建由计划保存步骤触发。关于硬性二元规则，请参阅 `using-aegis/SKILL.md` 中的工作区支持规则。如果项目已有 docs/adr/ 或架构文档，请引用它们，不要重复创建权威来源。

## 文件结构

在定义任务之前先梳理文件。设计具有清晰边界和单一职责的单元。共同变更的文件应放在一起。遵循现有代码库的模式。每个任务都应产生自包含、可独立审查的变更。

对于非平凡的项目计划，在适用时被动读取
`CONTEXT-MAP.md`/`CONTEXT.md` 中相关的活动语言。请在计划标题、任务、验收语言和负责人引用中一致使用规范术语。如果规划发现已解决的语义变更、歧义或冲突，请编写
`establishing-project-context`，而不是仅在计划中记录词汇表决策。仅进行被动读取不会加载活动建模。

## 必需的规划输出

在离开此工作流之前，书面计划必须能够回答以下事项：

1. **该计划正在实现什么问题或已批准的范围**
2. **哪些基线文档、ADR 或需求影响了该计划**
3. **需求就绪检查是否已就绪，或者仍缺少哪个需求来源、场景、验收条件、澄清事项或用户决策**
4. **哪些必需的基线引用已在规划前得到明确确认，以及哪些实际被计划引用**
5. **哪些文件负责承载变更**
6. **必须保持的兼容性边界**
7. **为什么需要进行代码变更，或者为什么计划被缩小为无变更、仅文档/配置变更或澄清**
8. **任何新表面是否通过了存在性检查，或者是否已交由现有负责人处理**
9. **架构完整性检查是否在任务分解之前发现了更高层级的负责人/契约路径**
10. **规划时存在哪些复杂度压力，以及哪个编辑边界更安全**
11. **此次交接是否需要 `Execution Readiness View`，如果需要，它呈现了哪些意图、范围、基线、兼容性、退役、测试、审查和漂移边界**
12. **哪些验证能够证明每个主要切片**
13. **仍有哪些风险、回滚范围、旧负责人/回退处理、ADR 信号保留和基线同步信号**

## 适当粒度的任务

**每个步骤都是一个动作（2-5 分钟）：**
- 在 `TDD Route: strict` 下：编写失败测试 → 验证 RED → 实现最小代码 → 验证 GREEN。
- 否则：完成最小变更 → 运行能够证明结果的聚焦回归测试或验证。

步骤是执行单元，不是 Git 历史单元。在每个连贯的任务完成并经过最新验证后，或者在一个可独立验证/回退的长任务切片完成后提交一次。不要为每个 2-5 分钟的步骤分别提交。

## 计划文档标头

每份计划 MUST 以以下内容开头：Goal、Architecture、Tech Stack、Baseline/Authority Refs、Compatibility Boundary、TDD Route、Verification。请参阅本目录中的模板。

## 任务结构

每项任务都必须包含：Files（创建/修改/测试路径）、Why（用户/业务价值）、Change Necessity（为什么需要修改源代码以及最小边界）、Impact/Compatibility、Verification（确切命令），然后是与 TDD 路线匹配的步骤。严格路线使用“编写测试 → 验证 RED → 最小化代码 → 验证 GREEN”；`off`、light 和 skipped 路线使用最小变更，并进行与之相称的回归/验证。执行协调器在首次写入前记录 `TaskStartSnapshot`，并且只有在整个任务通过审查和验证后，才创建一个限定范围的提交。每个步骤都必须包含完整代码和确切命令。

对于 bug 修复、重构、契约变更或治理清理，需在相关任务中加入 Repair Track（根因、规范所有者、足够且稳定的最小修复、兼容性边界、验证）以及 Retirement Track（旧所有者/回退方案、活跃状态、保留原因或删除触发条件）。如果触发了 Ripple Signal Triage，需在同一任务中包含受影响的下游使用者以及扩展后的验证路径。

## 禁止使用占位符

绝不写入：“TBD”、“TODO”、“implement later”、“fill in details”、“Add appropriate error handling”、“Write tests for the above”，也不得写“Similar to Task N”而不重复完整代码。每个步骤都必须包含完整、可复制粘贴执行的内容。

## 自审

根据规范检查计划：1）规范覆盖率——能否为每项要求指出对应任务？2）占位符扫描——是否存在 TBD/TODO/含糊不清的指示？3）类型一致性——各任务中的签名是否匹配？4）兼容性——是否标记了不变量、非目标和稳定接口？5）变更必要性——每个代码编辑任务是否说明了为什么仅不变更代码或仅修改文档/配置是不够的，并指出最小边界？6）存在性检查——任何新的所有者、工件、适配器、回退方案、工作流步骤或基准指标是否都有依据以及复用决策？7）计划阶段的复杂度和最小性——是否选择了能够修复整个 bug 类别的最低熵所有者/文件边界，而不只是最小文本差异？8）架构完整性——是否跳过了更高层次的所有者、契约或事实来源简化？9）验证——是否提供了确切命令？10）在需要时，是否保留了双轨、决策卫生以及 ADR/基线同步信号？

直接在计划中修复问题。无需重新审查，修复后继续推进。

## 执行交接

保存计划后，在满足上述交接条件时渲染 `Execution Readiness View`。由代理负责执行路线决策；不要仅仅因为两条路线都可行就要求用户选择。

当有可用的子代理、计划包含真正独立且所有权边界明确的任务，并且审查/上下文收益足以证明协调成本合理时，选择 `subagent-driven`。否则选择 `inline`。缺少子代理支持或子代理支持被拒绝时，回退到 inline 执行，不要因此阻塞任务。工作区存在未提交变更本身不会决定选择哪条路线；应分别应用 Git 所有权、重叠和隔离规则。

在理解最低基线后重新考虑委派，而不是仅凭关键词决定。可用的事件信号包括：明确隔离的发现切片、可独立检查的冲突证据、适合进行只读审查的高风险变更，或已阻塞/恢复的切片，且下一次尝试将使用实质性不同的上下文。这些信号仅供参考；未知依赖、共享事务/资源、过时状态、不受信任的输入、不明确的主机能力或经济性处于边界情况时，仍应采用内联路径。

仅当路径选择跨越尚未解决的授权、隐私、付费资源、外部操作或不可逆边界；改变已批准的范围或验收契约；或不存在能够保留现有工作区所有权的安全路径时，才询问用户。在不存在此类边界时，立即继续执行。

简要说明决策：

```text
Execution Route:
- Decision: subagent-driven | inline
- Evidence:
- Fallback:
- User confirmation required: no | yes — <specific unresolved boundary>
```

**如果为 `subagent-driven`：**
- **REQUIRED SUB-SKILL：** 使用 aegis:subagent-driven-development
- 每个任务使用新的子代理 + 两阶段审查

**如果为 `inline`：**
- **REQUIRED SUB-SKILL：** 使用 aegis:executing-plans
- 分批执行，并设置检查点供审查

## 规划边界

- 计划可以定义实现切片、验证、回滚范围和退役预期
- `Execution Readiness View` 可以在执行前明确实现启动条件、验证义务以及漂移/回退规则
- 计划不能授予权威性的完成状态
- 计划应为运行时就绪的执行做好准备，而不是假装自己拥有运行时权限。