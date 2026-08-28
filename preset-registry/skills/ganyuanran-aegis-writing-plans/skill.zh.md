---
name: writing-plans
description: "Use when you have an approved spec or written requirements for a multi-step task that needs a durable plan document before touching code. Small, single-owner, or fast-path tasks do not need this skill."
---
<EXPLICIT-MODE-GATE>
如果激活模式为显式模式（`~/.config/aegis/config.toml` 中包含
`activation_mode = "explicit"`，或环境中存在可见的
`AEGIS_ACTIVATION_MODE=explicit`），且当前用户请求未明确通过名称调用
Aegis 或此 skill，则退出并返回快速路径：简洁作答，不使用此工作流的检查清单、
仪式性流程或文档要求。如果用户明确提到了 Aegis 或此 skill，则正常继续。
</EXPLICIT-MODE-GATE>

# 执行

→ 已有父级计划/规格说明，并且当前是一个很小的执行切片？→ **使用无计划切片路径。**
  1. 输出一张简明的切片卡：目标、父级计划/规格说明、文件、边界、验证、停止条件
  2. 如果需要持久化状态，则更新父级工作流的检查点/证据/偏差状态
  3. 不要为微型切片保存新计划

→ 属于机械性或有边界的变更，且没有持久化边界（不会新增所有者、
契约、架构、公共 API、迁移或兼容性表面）？→ **使用无计划切片路径，
且无需父级文档。** 输出简明的切片卡，跳过计划文件，并在提交信息中记录变更。

→ 已有针对新工作流或升级触发条件的获批规格/需求？→ **编写实现计划。假设工程师不了解任何上下文。**
  1. 范围检查：事实/假设/未知项、基线、需求就绪检查、影响信号分类、兼容性边界、双轨需求
  2. 文件映射：创建/修改哪些文件，明确边界，并遵循现有模式
  3. 细粒度任务（每项 2-5 分钟）：确切的文件路径、完整代码、确切命令、预期输出
  4. 自我审查：规格覆盖率、占位符、类型一致性、兼容性、验证、双轨
  5. 保存 → 选择并宣布执行路径；除非确实需要用户授权或存在安全边界，否则继续执行

→ 计划必须回答：问题、基线、文件、兼容性、验证、风险、退役。

→ 当切片新增所有者、契约、架构、公共 API、迁移、持久化、安全/权限、
分发/发布表面，或验证边界不明确时，从无计划切片路径升级为持久化计划。

# 编写计划

## 概述

编写全面的实现计划，假设工程师不了解我们的代码库，且品味存疑。记录他们需要了解的一切：
每项任务要修改哪些文件、代码、测试、可能需要检查的文档，以及如何进行测试。
将完整计划拆分为细粒度任务。DRY。YAGNI。选择 TDD 路径。
每个连贯的任务或切片都应有一个经过验证的提交。

假设他们是一名熟练的开发者，但几乎不了解我们的工具集或问题领域。
假设他们不太了解良好的测试设计。

此 skill 是多步骤实现工作的规范计划工作流。使用它将获批的规格或需求转换为
可执行、可测试、能够识别影响范围，并受兼容性和权限约束的计划。

严格的 RED / GREEN 步骤仅适用于明确的用户/项目 TDD 请求或
`TDD Route: strict`。当 TDD 模式为 `off` 且没有严格路径时，应规划最小实现和
与风险相称的回归/验证步骤；不要仅因风险而规定 TDD 循环。

### TDD 路由守卫

在任务分解之前，任何包含实现工作的计划都必须记录：

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

在 `off` 模式下，记录 `Decision: skipped`，除非明确的用户/项目严格请求覆盖该设置。该记录使边界可供审查；它不会加载 `test-driven-development`。已批准的计划或风险标签本身不构成严格授权；匹配的风险只是一个信号，需要此负责人将 `recorded auto decision` 记录为授权。

在 `auto` 模式下，只要适用任何行为、错误修复、共享/核心、契约、持久化、权限、迁移、生产者/消费者或有意义的回归信号，就选择 `strict`。仅当以下条件全部满足时，才选择 `light`：改动微小、风险低、只有单一负责人、不改变行为、不存在严格信号，并且有明确的针对性检查。缺少明确的用户 TDD 请求绝不能作为选择 `light` 的依据。风险未知时，返回需求、调试或计划审查阶段。

只有带有已声明严格授权的 `Decision: strict`，才能将 `Write
failing test`、`Verify RED`、`GREEN` 或 `REFACTOR` 规定为任务步骤。否则，应根据情况编写最小改动，并进行诊断性复现或变更后的回归。在 `auto` 模式下，如果计划缺少已记录的决策，则应在编写实现任务之前返回路由选择阶段；在分解过程中绝不能推断为 `strict`。

**开始时宣布：** “I'm using the writing-plans skill to create the implementation plan.”

**执行上下文：** 默认复用当前分支/工作区。只有在需要独立历史记录、并发检出、阻塞无关的脏状态，或存在明确的用户/仓库授权时，才需要使用分支或工作树。

**输入：** 已批准的需求、Spec Brief 或 Design Spec。

**将计划保存至：** `docs/aegis/plans/YYYY-MM-DD-<feature-name>.md`
计划始终放在 `plans/` 中——绝不能放在 `work/` 中。
（用户对计划位置的偏好会覆盖此默认设置。）

例外：如果现有的父级计划/规范已经负责当前的微小执行切片，则使用 `Planless Slice Lane`。不要保存新计划。改为在对话中或当前长任务检查点中发出一张精简的 `Slice Card`：

```text
Slice Card:
- Goal:
- Parent plan/spec:
- Files:
- Boundary:
- Verification:
- Stop:
```

如果 `docs/aegis/` 不存在且已配置的 Aegis 工作区支持可用，则首先初始化目标项目：

```bash
python <aegis-workspace-helper> init --root <target-project-root>
```

项目权威高于工作区初始化。特别是，Aegis Method Pack 仓库不得创建或提交一个实际运行的 `docs/aegis/` 工作区；应使用其正式的 `docs/adr/`、`docs/current/` 和当前活动会话计划。

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

如果输入是规范简述，请将计划限定在已确定的
what/why/acceptance 范围内，除非出现新的架构、契约、迁移或跨模块不确定性，
否则不要扩展为正式设计。

在编写计划之前，先输出紧凑的契约：`Aegis Visibility`、`Plan Basis`、
`BaselineUsageDraft`、`Requirement Ready Check`、`Files`、`Compatibility`、
`Change Necessity`、`Existence Check`、`Architecture Integrity Lens`、
`Plan Pressure Test`、`Plan-Time Complexity Check`、
`Execution Readiness View`、`Tasks`、`Risks` 和 `Retirement`。仅在
已批准的范围、风险或验证面需要时展开。

对于此工作流，`Aegis Visibility` 说明在执行前进行规划时，哪些所有者、
契约、退役、兼容性或验证压力使规划变得有用。
普通计划使用一个自然句；审计、调试、发布、长任务评审或用户明确要求时，
才使用结构化追踪。

当计划依赖特定的基线文档或当前权威引用时，使用紧凑的
`BaselineUsageDraft`：

```text
BaselineUsageDraft:
- Required baseline refs:
- Delivered context refs:
- Acknowledged before plan refs:
- Cited in plan refs:
- Missing refs:
- Decision: continue | needs-baseline-readback | needs-verification | pause-for-user | blocked
```

`Delivered context refs` 仅是宿主投影的可选记录。它并不是宿主注入了上下文
载荷或模型在内部使用了上下文载荷的权威证明。该产物用于让基线/上下文注意力
在规划前和规划期间的漂移变得可见。

除非输入已经是批准的计划/规范，且其验收边界明确，否则在任务分解前使用紧凑的
`Requirement Ready Check`：

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

如果决定不是 `ready`，则不要创建实现任务。应带着最小缺失证据或决策返回
需求/规范所有者。任务意图、对话或代理推断可以作为候选来源引用，但其本身
不是持久的需求权威。

当计划将认可任何新的源代码路径或非平凡的源代码修改时，在任务分解前使用紧凑的
`Change Necessity`。这是“是否应该进行代码变更？”检查；它不是新产物，
也不是 `using-aegis` 热路径扩展。

这是由行为触发的，而不是由提示触发的。如果计划即将添加任何新的源代码路径
或创建非平凡的源代码编辑任务，即使用户没有要求，也要公开进行自然语言回读。
微小辅助函数、小型保护逻辑、新分支、回退逻辑、适配器或所有者都不例外。
示例：“代码必要性检查：非代码路径不足够，因为 <reason>；最小变更边界是
<owner/files>，因此决定为 code-change。”

```text
Change Necessity:
- User-visible need:
- No-change / non-code option:
- Why code change is necessary:
- Minimum change boundary:
- Decision: no-change | docs/config-only | code-change | needs-clarification
```

如果决策为 `no-change`，不要编写代码编辑任务。如果决策为
`docs/config-only`，将计划范围限定在该表面。如果决策为
`needs-clarification`，返回需求/规范负责人。如果决策为
`code-change`，将最小变更边界落实到 `Files`、任务步骤和验证中。已批准的需求本身并不能证明必须新增源代码路径。

当计划需要新增 owner、skill、artifact、host adapter、fallback、兼容性路径、工作流步骤或基准指标时，在任务分解前使用简要的 `Existence Check`。使用
`docs/current/AEGIS_MINIMALITY_REFERENCE.md` 作为参考，并将检查结果作为建议。对于仅复用现有 owner 和表面的计划，不要强制执行该检查。

```text
Existence Check:
- Proposed new surface:
- Existing owner / reuse candidate:
- Why existing surface is insufficient:
- Creation proof:
- Entropy / retirement impact:
- Decision: reuse-existing | add-with-proof | defer | reject | needs-first-principles-review
```

如果决策为 `reuse-existing`，针对现有 owner 编写任务，而不是创建新表面。如果决策为 `add-with-proof`，将证明、验证信号以及任何退役触发条件落实到相关任务中。

当可执行计划可能仍然编码了职责重叠、错误的规范 owner、调用方侧 fallback、承载实际逻辑的陈旧路径，或遗漏了更高层级的 owner / contract / source-of-truth 简化时，在任务分解前使用 `Architecture Integrity Lens`。保持其简洁：不变量、规范 owner / contract、职责重叠、更高层级的简化、退役 / 证伪条件，以及结论。

在任务分解前使用简要的 `Plan Pressure Test`：

```text
Plan Pressure Test:
- Owner / contract / retirement:
- Architecture integrity / higher-level path:
- Verification scope:
- Task executability:
- Pressure result: proceed | revise plan | return to design
```

压力测试不是审批门槛，不应在没有理由的情况下重新设计已批准的规范。它用于发现 owner / contract / retirement 风险、遗漏的验证，以及过于模糊而无法安全执行的任务。

在将中/高风险、由子代理驱动、易于交接、长时间运行、涉及架构、contract、兼容性或退役的计划交付执行前，渲染 `Execution Readiness View`。此视图是现有运行时就绪草稿和计划内容的面向人类的投影。它不是一种新的 JSON artifact 类型、审批门槛、权威的 `GateDecision`、`PolicySnapshot` 或完成权威。
在将任何任务批次交付执行前，此视图必须暴露 Intent Lock、Scope Fence 和 Baseline Lock。

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

使用现有输入来生成视图：`TaskIntentDraft`、`BaselineUsageDraft`、
`ImpactStatementDraft`、`GateInputPack`、计划中的任务批次、
兼容性 / 退役部分，以及验证命令。对于微小的快速路径任务，跳过该视图，除非用户要求执行交接回读。

当计划会修改受维护的源文件、核心所有者、处理器、路由器、管理器、
共享工具、适配器或回退路径时，在编写任务步骤之前使用紧凑的
`Plan-Time Complexity Check`：

使用 `using-aegis/references/complexity-governance.md` 获取共享工件
类别、压力信号以及超预算处理规则。

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

如果预计的预算结果为 `over-budget`，不要编写会默默假设原地增长的原子任务。
应调整任务边界、增加治理工作，或明确标记该切片在实现开始前需要后续处理。

如果规范涵盖多个相互独立的子系统，建议拆分为多个计划。在编写任务之前，检查：事实 / 假设 / 未知项、基线文档、兼容性边界、是否适用双轨（修复 + 退役）。如果已批准的需求或设计携带 ADR 信号，应保留 ADR 信号、源引用、实际替代方案、兼容性边界，以及完成时预期的基线同步问题，以便 ADR Auto Backfill 无需从头重新发现该决策即可运行。

如果任务分解会编码新的所有者、重复所有者、回退路径、适配器、仅用于兼容性的载体、先删除问题、未经验证的假设或长期稳定性声明，而规范此前并未解决这些问题，则首先使用
`Existence Check`。如果新表面仍然合理，但所有者、契约或退役决策仍存在风险，则在任务分解之前使用
`first-principles-review` 及其 `Decision Hygiene Review` 或 `Architecture Integrity Lens`。

当计划必须在删除旧的内部路径、为已证实的外部边界保留兼容性，或因持久化状态确认而暂停之间作出决定时，组合使用
`anti-entropy-governance`。将其保持为范围狭窄的分类与护栏所有者；它无权授权破坏性执行。

在编写或保存计划之前使用 `Planless Slice Lane`，前提是以下所有条件均满足：

- 父规范或父计划已经定义了该工作流
- 当前请求正在执行或细化该父级中的一个有界任务
- 没有出现新的所有者、契约、模式、公共 API、架构边界、迁移、持久化、安全 / 权限、分发 / 发布表面，或不明确的验证边界
- 可以通过 `Slice Card` 描述该切片

该通道可在不将执行记录转变为持久规划产物的情况下，保持长时间任务的连续性。

## Aegis 项目工作区

保存计划步骤会触发工作区创建。有关严格的二元规则，请参阅 `using-aegis/SKILL.md` 中的工作区支持规则。如果项目已有 docs/adr/ 或架构文档，请引用它们——不要重复建立权威来源。

## 文件结构

在定义任务之前先梳理文件。设计边界清晰、职责单一的单元。需要一起变更的文件应放在一起。遵循现有代码库的模式。每项任务都应产生自成一体、可独立审查的变更。

对于非简单项目计划，如果存在 `CONTEXT-MAP.md`/`CONTEXT.md`，请被动读取其中相关的当前有效语言。在计划标题、任务、验收表述和所有者引用中一致使用规范术语。如果规划过程中发现已解决的语义变更、歧义或冲突，请组合使用 `establishing-project-context`，而不是仅在计划中记录术语表决定。仅进行被动读取不会加载主动建模。

## 必需的规划输出

在离开此工作流之前，书面计划必须能够回答以下问题：

1. **此计划正在实现什么问题或已批准的范围**
2. **哪些基线文档、ADR 或需求塑造了该计划**
3. **需求就绪检查是否已就绪，或者仍缺少哪个需求来源、
   场景、验收条件、澄清或用户决定**
4. **规划前明确确认了哪些必需的基线引用，以及计划中实际引用了哪些**
5. **哪些文件负责承载该变更**
6. **必须维持什么兼容性边界**
7. **为什么需要代码变更，或者为什么计划被缩小为无变更、
   仅文档/配置或澄清**
8. **任何新表面是否通过了存在性检查，或者是否已转交给
   现有所有者**
9. **架构完整性检查是否在任务分解之前找到了更高层级的所有者/
   契约路径**
10. **规划阶段存在哪些复杂性压力，以及哪种编辑边界更安全**
11. **此次交接是否需要 `Execution Readiness View`；如果
   需要，它呈现了哪些意图、范围、基线、兼容性、退役、测试、
   审查和漂移边界**
12. **哪些验证能够证明每个主要切片**
13. **仍存在哪些风险、回滚范围、旧所有者/回退处理、ADR 信号保留和基线同步信号**

## 小粒度任务

**每个步骤都是一个操作（2-5 分钟）：**
- 在 `TDD Route: strict` 下：编写失败测试 → 验证 RED → 实现最小代码 → 验证 GREEN。
- 否则：进行最小变更 → 运行能够证明该变更的聚焦回归测试或验证。

步骤是执行单元，而不是 Git 历史记录单元。每个连贯的任务完成并重新验证后提交一次，或者在长任务中每完成一个可独立验证/回滚的切片后提交一次。不要为每个 2-5 分钟的步骤都提交。

## 计划文档头部

每份计划都必须以以下内容开头：目标、架构、技术栈、基线/权威参考、兼容性边界、TDD 路径、验证。请参阅本目录中的模板。

## 任务结构

每个任务都应包含：文件（创建/修改/测试路径）、原因（用户/业务价值）、变更必要性（为何需要修改源代码以及最小边界）、影响/兼容性、验证（确切命令），然后是与 TDD 路径匹配的步骤。严格路径采用编写测试 → 验证 RED → 最小化代码 → 验证 GREEN；`off`、轻量和跳过路径采用最小变更以及与之相称的回归测试/验证。执行协调者在首次写入前捕获 `TaskStartSnapshot`，并且仅在整个任务通过审查和验证后创建一个限定范围的提交。每个步骤都必须包含完整代码和确切命令。

对于错误修复、重构、契约变更或治理清理，请在相关任务中添加修复
轨道（根本原因、规范所有者、最小充分且稳定的修复、兼容性
边界、验证）和退役轨道（旧所有者/回退方案、活动状态、
保留原因或删除触发条件）。如果触发了涟漪信号
分诊，请在同一任务中包含受影响的下游使用方和扩展后的
验证路径。

## 禁止占位符

绝不写入："TBD"、"TODO"、"implement later"、"fill in details"、"Add appropriate error handling"、没有实际测试代码的 "Write tests for the above"，以及没有重复给出代码的 "Similar to Task N"。每个步骤都必须包含完整且可直接复制粘贴使用的内容。

## 自我审查

根据规范检查计划：1）规范覆盖——能否为每项
要求指出对应的任务？2）占位符扫描——是否存在任何 TBD/TODO/含糊指令？3）类型
一致性——各任务之间的签名是否匹配？4）兼容性——是否标明了不变量、
非目标和稳定接口？5）变更必要性——每个代码编辑任务是否
说明了为何不进行变更或仅修改文档/配置不足以解决问题，并指出最小
边界？6）存在性检查——每个新的所有者、
制品、适配器、回退方案、工作流步骤或基准指标是否都有证据及复用
决策？7）计划阶段的复杂度与最小化——是否选择了能够修复此类错误的
最低熵所有者/文件边界，而非仅追求最小文本差异？8）架构完整性——是否
遗漏了任何更高层级的所有者/契约/事实来源简化？9）验证——是否有确切
命令？10）是否在需要时保留了双轨、决策规范以及 ADR/基线同步信号？

直接修复问题。无需重新审查——只需修复并继续。

## 执行交接

保存计划后，在满足上述交接
条件时呈现 `Execution Readiness View`。代理负责决定执行路径；不要
仅仅因为两条路径都可行就要求用户选择。

当子代理可用、计划中包含
所有权边界明确且真正相互独立的任务，并且审查/上下文收益足以证明协调成本合理时，选择 `subagent-driven`。否则选择 `inline`。
子代理支持缺失或遭拒时，应回退到内联执行，而不是阻塞任务。
工作区存在未提交更改本身并不能决定选择哪条路径；应分别应用 Git 所有权、
重叠和隔离规则。

仅在路线选择涉及尚未解决的授权、隐私、付费资源、外部操作或不可逆边界；改变已批准的范围或验收约定；或不存在能够保留现有工作区所有权的安全路线时，才询问用户。如果不存在此类边界，请立即继续。

简洁说明决策：

```text
Execution Route:
- Decision: subagent-driven | inline
- Evidence:
- Fallback:
- User confirmation required: no | yes — <specific unresolved boundary>
```

**如果选择 `subagent-driven`：**
- **必需的子技能：** 使用 aegis:subagent-driven-development
- 每个任务使用一个全新的子代理，并进行两阶段审查

**如果选择 `inline`：**
- **必需的子技能：** 使用 aegis:executing-plans
- 采用批量执行，并设置审查检查点

## 规划边界

- 计划可以定义实施切片、验证、回滚范围和退役预期
- `Execution Readiness View` 可以在执行前明确展示实施启动条件、验证义务以及偏移 / 回退规则
- 计划不能授予权威性的完成认定
- 计划应为运行时就绪的执行做好准备，而不是假装自己拥有运行时权威性