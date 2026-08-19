---
name: dispatch
description: |
  Use when a task file exists in .hyperflow/tasks/ and workers need dispatching. Fans out parallel workers under per-batch Reviewers, runs a final integration review, and commits per sub-task. Endpoint of the auto-chain — no auto-deploy.
  Trigger with /hyperflow:dispatch, "run the plan", "execute the task", "build it", "run the batches".
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(gh:*), Bash(grep:*), Bash(rm:*), Bash(bash:*), Bash(python3:*), Agent, Skill, AskUserQuestion
argument-hint: "[task-file | handoff-slug] [session=one|two] [--phases=all|next] [--from-batch N] [--final-only] [--thorough]"
version: 3.2.0
license: MIT
compatibility: Designed for Claude Code
tags: [execution, parallel, review, multi-agent, orchestration]
---
# 调度

主力阶段。从 `/hyperflow:plan` 获取任务文件，并通过并行工作者调度和多级审查的编排器模式执行任务。

此技能会执行教义中的 **第 3 层（编排器）**、**第 5 层（质量门）**、**第 6 层（项目记忆）**、**第 8 层（Git 工作流）** 和 **第 9 层（安全性）**。根据分诊的流程配置应用多级审查（L1–L5）。

## 每步 Agent 映射（DOCTRINE 规则 12 — §12.1 允许将简单步骤内联执行 · §12.2 子阶段分解）

每个实质性步骤至少调度一个 Agent。简单步骤（≤ 2 次工具调用、不生成内容、不进行决策、可机械验证）**可以**由编排器根据 §12.1 内联执行。非简单步骤根据 §12.2 分解为 ≥ 2 个具名子阶段。

| 步骤 | 子阶段 | Workers | Reviewer | 备注 |
|---|---|---|---|---|
| 0 — 模式确认 | —（豁免） | — | — | 仅使用 `AskUserQuestion` |
| 0.5 — 操作选择 | —（豁免） | — | — | 仅使用 `AskUserQuestion` |
| 1 — 加载任务 | —（原子操作 · §12.2.8） | — | — | 读取 + 模式检查 = 单一机械决策；不需要并行角度 |
| 2a — 调度前准备 | Composer × N 并行 — 每个子任务一个；拼接 persona + 注入学习成果 | **Reviewer** — 审查提示词集的完整性 | 在任何 fan-out 启动前构建并行工作者提示词 |
| 2b — 工作者 fan-out | Implementer / Searcher / Writer × N 并行 | **领域专家 Reviewer** — 与 `Specialist:` 匹配的 agent，在完整批次上执行（P2），或在必要时按子任务执行回退审查 | 每个批次调用一次 Reviewer；安全性/正确性专家使用 `--thorough` 运行 |
| 2c — 门检查运行 | Worker — 在受影响的文件上运行 lint/typecheck/tests | **Reviewer** — 评判门检查输出 | 小范围、聚焦的差异 |
| 2d — 学习成果 + 提交 | Writer — 综合每批次的学习成果 | —（机械提交 · §12.1） | 每个子任务的 PASS 提交在此处落地；学习成果追加到上下文中 |
| 3 — 最终集成审查 | —（原子操作 · §12.2.8） | **Reviewer** — 最广泛匹配的专家，在完整差异上执行 L1–L<n> | 单次 Reviewer 调度；在 D7 下跳过，包括单专家覆盖（规则 17） |
| 4 — 收尾 | Writer — 仅当记忆文本并非简单内容时可选 | — | §12.1 简单内容内联执行；不使用 Reviewer（D5） |
| 5 — 链结束 | —（豁免） | — | 执行一次 `AskUserQuestion`，同时询问审计 + 部署问题 |

铁律 — `review agents ≥ batches + 1`（每个批次一个批处理 Reviewer + 未跳过时的最终集成审查）。无论一个批次中包含多少个子任务，批处理 Reviewer 均按每批次 1 个计数。如果数量更少，则说明某个步骤跳过了 Reviewer。

## 审查级别（根据流程配置进行调整）

每个批次 Reviewer 和最终集成 Reviewer 都使用以下级别集合。配置来自 `/hyperflow:plan` 分诊，并通过链式参数（`triage=`）传递。

| 配置 | 级别 | Workers | Reviewers |
|---|---|---|---|
| `fast` | L1 | 1 | 仅内联自审 |
| `standard` | **默认 L1–L2** | 1–2 | 每个批次 1 个 Reviewer |
| `deep` | L1–L5 | 3+ | 每个批次 + 最终集成 |
| `research` | L1–L2 + 综合 | 3+ 个 searchers | 内联综合 |
| `creative` | L1–L3 + UX | 1–2 | 1 个 Reviewer |
| `scientific` | L1–L5 + TDD | 2–3 | 每个批次 + 最终审查 |

L1 语法/格式 · L2 规范/命名/边界 · L3 集成/安全 · L4 性能/规模 · L5 无障碍/用户体验。完整检查清单请参阅 [review-levels.md](references/review-levels.md)。

**默认上限为 L1-L2。** Triage 的输出可能会标记 `security: true` 或 `integration_risk: true`；当任一项被设置时，对于每批次审查器和最终集成审查器，上限都会提升至 L1-L3。Workers 不得请求提升——只有上游 triage 分类可以提升上限。请参阅 `reviewer-prompt-batched.md`——workers 必须遵守传递给它们的上限（上限执行位于 reviewer-prompt 侧）。

## 审批门

| 门 | 时机 | 格式 |
|---|---|---|
| 会话上下文 | 步骤 0，已解析（不询问） | 继承的 `session=` / 交接 `HANDOFF.md` / 默认值 `one` |
| 阶段分派范围 | 步骤 1.5，功能模式下存在 ≥ 2 个未完成阶段 | `AskUserQuestion` — 所有阶段 / 逐阶段 |
| 批次间（仅手动模式） | 每个批次的门通过后 | `AskUserQuestion` — 继续 / 停止。**自动模式不会触发批次间问题**——参见 DOCTRINE 规则 8（禁止虚构门）。 |
| 硬停止 | 审查器返回任何 `SECURITY_VIOLATION` 时 | 停止链路，呈现该发现 |
| **审计提示** | 步骤 5，收尾后 | `AskUserQuestion` — 运行 `/hyperflow:audit`？（是/否，基于流程配置推荐切换项） |
| **部署提示** | 步骤 5，审计门之后 | `AskUserQuestion` — 运行 `/hyperflow:deploy`？（是/否，基于门状态推荐切换项） |

## 输入

- **任务工件** — 位置参数（slug 或路径）：可以是扁平的 `.hyperflow/tasks/<slug>.md` **或**功能文件夹 `.hyperflow/features/<slug>/`（参见 [`../hyperflow/feature-phases.md`](../hyperflow/feature-phases.md)）。默认使用两者中最近修改的一个。
- **交接包** — 解析到 `.hyperflow-handoff/<slug>/` 的位置参数 slug/路径（参见 [`../hyperflow/session-handoff.md`](../hyperflow/session-handoff.md)）。存在时，分派属于**第二会话构建**：它会在步骤 1.0 将 `artefact/` 重新灌入 `.hyperflow/`，并从 `HANDOFF.md` 读取 `session`/`handoff`/链路参数。`on_complete`（review|deploy）控制步骤 5 的行为。
- **`session=<one|two>`** — 由 `/hyperflow:plan` 传入（或从交接包的 `HANDOFF.md` 中读取）。如果缺失，则假定为 `one`。在双会话构建中，`handoff=<review|deploy>` 控制步骤 5 结束时的行为。
- **`--from-batch <n>`** — 从指定批次恢复（跳过之前的批次）。
- **`--final-only`** — 跳过批次分派，仅运行最终集成审查。
- **`--thorough`** — 禁用 P2 批次审查；对每个批次中的每个子任务改为使用逐子任务审查器，并始终运行最终集成审查（禁用 D7 跳过）。当高风险运行需要更加全面的深度保障时使用。P3（并发前置条件）和 P5（精简 worker 提示）仍然启用。传入 `--thorough` 时，D5（收尾 Reviewer drop）和 D7（跳过集成审查）均会被禁用——完整的第二轮前置流程会运行。D2 组合门保持不变（不牺牲质量），D6 默认 L1-L2 保持不变（上限仍可由 triage 标记提升）。

## 流程

### 步骤 0 — 解析会话上下文（仅在直接调用时）

Dispatch 是**构建端点**——它位于规划→构建拆分的另一侧，因此**不会**询问单会话/双会话问题（该决策已在上游的 spec/scope 中做出，或包含在交接包中）。它会解析会话上下文：

- 已传播 `session=<one|two>` 参数（来自 scope）→ 使用该参数。
- 直接在**交接包**上调用（slug 解析为 `.hyperflow-handoff/<slug>/`）→ 从其 `HANDOFF.md` 中读取 `session`/`handoff`/链参数；这是第二会话构建（参见 [`../hyperflow/session-handoff.md`](../hyperflow/session-handoff.md)）。
- 直接在普通任务文件上调用，且没有 `session=` 参数 → 默认为 `session=one`（在此处构建，然后在步骤 5 提供审计/部署门）。不会触发会话问题——已经没有需要拆分的内容。

### 步骤 0.5 — 操作选择（结构性门 · 紧接步骤 0 后立即触发）

当操作参数（`commit=`、`branch=`、`push=`）尚未从之前的链启动器或交接包中传播过来时，调用一次包含 3 个问题的 `AskUserQuestion`，涵盖 dispatch 所需的全部操作决策。在这一批问题之后，dispatch 将静默运行，直到链末尾的审计 + 部署门。

当操作参数已经传播时跳过（重新询问属于人为添加门）。

Dispatch 负责此门（plan 不再在启动时询问操作选择——它会停在构建位置门，让 dispatch 在构建实际开始时决定 commit/branch/push）。这 3 个问题是**提交节奏 · 分支行为 · 末尾推送**，包含 [`../hyperflow/git-workflow.md`](../hyperflow/git-workflow.md) 中的规范选项文本、推荐默认值逻辑、`Per-task (deferred)` 队列行为，以及 `commit=/branch=/push=` 传播契约。推荐默认值：commit 使用 `Per-task`（除非 `complexity=low ∧ sub-tasks≤2` → `Single`）；branch 在 main/master 上使用 `Create`，否则使用 `Stay`；push 始终使用 `Ask at deploy gate`。仅当参数已经传播时跳过（重新询问属于人为添加门）。

### 步骤 1.0 — 交接重新水合（仅交接包接管时）

在交接包（`.hyperflow-handoff/<slug>/`）上调用时，在加载任务之前：
1. 读取 `HANDOFF.md` → 工件类型、链参数（`commit=/branch=/push=/triage=/mode=`，以及计划为 GitHub 原生计划时的 `gh_issue=/pr=/comment=`）、`on_complete`。
2. 如果 `.hyperflow/` 缓存不存在 → 先运行 `/hyperflow:scaffold`（使 worker 获得 Layer-0 上下文）。如果无法在此处运行 scaffold，则回退到交接包中的 `context/` 副本。
3. 将 `artefact/tasks/<slug>.md` → `.hyperflow/tasks/<slug>.md`（扁平），或将 `artefact/features/<slug>/` → `.hyperflow/features/<slug>/`（特性）复制到本地（如果本地尚不存在）。
4. 在构建完成前保留 `STATUS=planned`（步骤 5 会将其翻转）。

然后继续正常执行步骤 1。（非交接运行跳过步骤 1.0。）

### 步骤 1 — 加载任务（原子操作 · §12.2.8）

检测工件模式：
- **扁平** — `.hyperflow/tasks/<slug>.md`（简要任务清单）。读取它；提取批次、子任务、flow-profile 和操作参数。对于每一条包含 `Brief: <slug>/T<id>.md` 指针的清单行，记下 brief 路径——步骤 2a 会逐字加载它（不要在此处内联其正文）。
- **特性（多阶段）** — `.hyperflow/features/<slug>/`。读取 `feature.md` 中的**有序阶段清单** +
  依赖图 + `Specialists`。每个 `phase-<n>-<name>/` 都会**作为任务文件来执行**：其
  `phase.md` 携带批次/任务清单，其 `tasks/T*.md` 是子任务。还要读取每个阶段的 `spec.md`
  / `research.md`（如果存在），并将它们作为阶段的设计上下文注入步骤 2a 的编排器。

确认结构完整性：batches/tasks 非空，且每个 task 都包含 `id`、`title`、`files`、`complexity`、`Specialist`。如果缺失或格式错误，则停止并建议先运行 `/hyperflow:plan`。

> 根据 §12.2.8，原子操作豁免——文件/文件夹存在性检查与架构验证是一个不涉及并行角度的机械决策。不派遣 Worker 或 Reviewer。

### 步骤 1.5 — 阶段循环（仅限 feature 模式）

**阶段派遣范围门控（结构门控 · feature 模式，≥ 2 个未完成阶段）。** 在循环开始前，发出一次 `AskUserQuestion`——这是一个命名工作流选择，因此推荐选项应排在第一位并标注 `(Recommended)`：

```
This feature has <N> phases. How should I build them?

  All phases (Recommended)  — build every phase in order, straight through to the end.

  Phase by phase            — build only the NEXT phase, then stop so you can review it
                              before the next one starts. Re-run /hyperflow:dispatch
                              <slug> to continue with the following phase.
```

以下情况跳过该门控（默认 `all`）：只有一个阶段未完成；传入了 `--phases=all|next`；或者这是一个 `on_complete=deploy` 的双会话构建（完全自主运行——`all`）。不带弹窗的便携界面（Codex / OpenCode / Grok）→ 使用 `Hyperflow Question` 聊天块回退方案；完全没有可用通道 → 默认使用 `All phases`。将选择传递为 `--phases=<all|next>`。

在 **feature 模式**下，步骤 2 按阶段顺序表逐阶段运行。只有当某阶段的 `Depends on`
阶段已为 `completed` 时，该阶段才会开始。对于每个阶段：
1. 在该阶段的 batches 上运行步骤 2（阶段内部并行，完全按照 flat 模式）。
2. 当所有任务均为 PASS 且满足退出条件时 → 将 `phase.md` 状态设为 `completed`，推进 `feature.md` 的 Phases 进度条，并将该阶段 `decisions.md` 中的经验追加到 `.hyperflow/memory/`（步骤 2d 的经验综合会写入此处）。
3. 在该阶段的累计 diff 上运行步骤 3（最终集成审查）（每个阶段应用 D7 + 单专家跳过规则）。在**最后一个**阶段之后，如果至少有 2 个阶段触及互不相交的表面，再额外运行一次 feature 级别的集成检查，覆盖完整 diff。
4. **如果是 `--phases=next`** —— 该阶段完成后停止。打印：`Phase <name> done (<k>/<N>). Review it, then run /hyperflow:dispatch <slug> to build the next phase.` 不要推进到下一个阶段。**如果是 `--phases=all`** —— 立即继续下一个阶段。

在 **flat 模式**下，跳过步骤 1.5——步骤 2 像之前一样，在单个 task 文件的 batches 上运行一次。

### 步骤 2 — 对每个 batch

打印 batch 标题：`Batch <n> — <one-line description>`。

**模式解析（每条链执行一次，在首次执行步骤 2a 之前）：**运行 `python3 $PLUGIN_ROOT/scripts/resolve-mode.py $PROJECT_ROOT --from-args "$CHAIN_ARGS"`，并缓存返回的单词（`default` / `lean` / `thorough`）。后续 batches 使用缓存值。

子阶段 2a–2d 按顺序对每个 batch 运行（P1 顺序执行——每个子阶段都依赖前一个子阶段的输出）。在每个子阶段内，Workers 并行运行。

#### 步骤 2a —— 调度前（P1 · 模式解析后依次执行）

对于批次中的每个子任务，并行调度一个 Composer Worker（每个子任务对应一个 Composer —— 共 N 个）。每个 Composer：

- **在预先编写的 brief 存在时，逐字加载它。** 如果 roster 行带有 `Brief: <slug>/T<id>.md` 指针（计划的 `briefs=auto` 默认设置），读取该文件并使用其正文——Task / Why / Scope / Files / Acceptance criteria / Test cases（包括 E2E case）/ Gotchas——作为 worker prompt 的正文，**保持不变**。不要重新推导这些部分；计划已经在强模型上编写了这些内容。Composer 唯一需要做的就是追加上下文（如下）。**回退情况（没有 brief）：** 对于简单子任务或旧版简短任务文件，按照 [worker-prompt.md](references/worker-prompt.md) 内的要求以内联方式编写 brief，保持原有行为。该加载路径使调度能够可靠地在成本更低的模型或第二个会话中运行。
- 根据子任务 brief 选择 worker persona（Implementer / Searcher / Writer）。
- 根据解析后的模式拼接 persona header + Project Context：
  - **mode = default / thorough** → 内联摘录与 worker 角色匹配的 `.hyperflow/profile.md`、`architecture.md`、`conventions.md` 内容。
  - **mode = lean** → 渲染 lean Project Context 块：使用 `Project Context (load on demand):` 标题，并列出 `.hyperflow/memory/session-context.md`、`.hyperflow/profile.md`、`.hyperflow/architecture.md`、`.hyperflow/conventions.md`、`.hyperflow/testing.md`、`.hyperflow/memory/index.md` 的路径，每个路径附带一行描述。Worker 按需读取。每个 N 约节省 2k tokens；内容相同，只是延迟访问。
- 在所有模式下都注入累积的 `Learnings from prior batches`。
- 输出可直接扇出使用的完整 worker prompt。

对每个 Composer 的输出使用 [worker-prompt.md](references/worker-prompt.md) 模板。无论模式如何，persona stitching（top-3）、memory injection（所有标签匹配项）以及所有 clarification gates 均保持不变。

每个 Composer 还会读取任务文件中子任务的 `Specialist:` 字段，并将该 specialist 的**输出契约要求**（[`../../agents/README.md`](../../agents/README.md)）拼接到 worker prompt 中，从而使 worker 产出可供负责评审该结果的 specialist 直接审查的输出（例如，`api-reviewer` 子任务会要求 worker 预先记录状态码和验证规则）。它还会根据该 specialist 的 `Composes with:` 行（推荐的协作对象）填充 worker-prompt 中的 `{{CONSULT_PEER_HINT}}` 插槽；如果该行不存在，则渲染为 "any specialist as needed"。该提示只用于对协作对象进行排序——worker 可以咨询 `agents/` 中的任何 agent（[consultation.md](../hyperflow/consultation.md)）。

所有 Composer 返回后，再针对完整的 prompt 集合调度一个 **Reviewer**：确认 persona 选择正确、context block 格式良好、learnings 已注入。结论：`PASS` / `NEEDS_REVISION`。`NEEDS_REVISION` 将仅重新调度受影响的 Composer。

#### 步骤 2b —— Worker 扇出（P1 · 2a 后依次执行 · 内部并行度 P1）

使用 Step 2a 中组合的提示词，通过并行的 `Agent` 调用，在**单条消息**中分派全部 N 个子任务 Worker。Worker 的角色为 Implementer / Searcher / Writer，并完全并行运行。

当所有 Worker 返回后，为每个批次分派**一个**覆盖整个批次的批次级 Reviewer（P2 — 批次级单次审查）：
- **以匹配的领域专家身份分派。** 读取该批次子任务的 `Specialist:` 字段（由任务文件决定）。将每个批次的 Reviewer **作为该专家 Agent 分派**（[`../../agents/README.md`](../../agents/README.md)）——在 `reviewer-prompt-batched.md` 之上注入其职责说明、严格检查清单和输出契约。当批次涵盖多个界面时，注入匹配职责说明的并集。在门控流程中，该专家需先执行其网页研究优先流程（[`web-research.md`](../hyperflow/web-research.md)），然后再给出判定。
- **先检查审查级别上限是否一致。** 如果每个子任务共享相同的审查级别上限 → 执行批次级审查。如果任何子任务带有不同的上限（罕见的混合配置）→ 回退到逐子任务 Reviewer。
- 传入了 `--thorough` 时，也**回退到逐子任务 Reviewer**。
- **批次级 Reviewer 分派：** 使用 [`reviewer-prompt-batched.md`](../hyperflow/reviewer-prompt-batched.md)。输出 `**Reviewer** — batched review Batch <n> (L1–L<n>, <k> sub-tasks)`。每个子任务返回一个判定。
- **逐子任务回退（上限不一致或传入了 `--thorough`）：** 按照 [`reviewer-prompt.md`](references/reviewer-prompt.md)，为每个子任务分别分派一个 Reviewer。输出 `**Reviewer** — reviewing <subtask> (L1–L<n>)`。
- **批次级审查与最终集成的分工：** 批次级 Reviewer 以单个批次的 diff 为审查范围，并在其中捕获 L1–L<n> 级别的问题。Step 3 的最终集成 Reviewer 会查看所有批次的累积 diff，并捕获任何单个批次审查无法发现的跨批次矛盾。同时运行这两轮审查，比单独运行任一轮覆盖更全面。

_（路径说明：`reviewer-prompt-batched.md` 位于 `skills/hyperflow/`，因为它是整个链路共享的跨技能模板；`reviewer-prompt.md` 按照此前约定仍位于 `dispatch/references/`。这些不对称的路径是有意设计的。）_

**失败恢复：** DOCTRINE 规则 14 — [`skills/hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md)。当 Worker 出错（工具崩溃、OOM、5xx、超时）或返回格式错误的输出时：重试 → 升级（增加一轮更深入的审查）→ 中止。在链路中累计发生 3 次中止后，链路本身中止，并输出完整的失败轨迹。

解析每个子任务的判定：
- `SECURITY_VIOLATION` — **立即暂停链路**。报告该发现；不要在该批次中提交任何内容。
- Worker 返回 `OVERSIZE: <reason>` 并附带 `SUGGESTED-SPLIT:` — 不要继续。分派 Planner 咨询：`**Planner — mid-flight split** — split <sub-task-id> per Worker's OVERSIZE signal`。传递 Worker 给出的原因、建议拆分方案、原始 brief 以及批次上下文。Planner 返回最终拆分计划（N 个新子任务，每个 `complexity = low | medium`）。移除原始子任务；将 N 个新子任务作为新的子批次分派。新子批次完成后，再触发批次级 Reviewer。无需询问用户——拆分过大的 brief 属于机械式重塑。
- Worker（或批次级 Reviewer）返回 `CONSULT: <peer> — <question>` — 不要将该子任务标记为完成。按照 [`consultation.md`](../hyperflow/consultation.md) 进行协调：将 `<peer>` 解析为 `agents/<name>.md`（任何已注册的 Agent），使用咨询 brief 分派该 Agent（`CONSULT-CONTEXT` + “answer in ≤8 lines, you are consulted not taking over”），然后仅重新分派该 Worker/Reviewer，并注入 `Consultation answer from <peer>:`。每个 Worker 最多进行 2 次咨询；被咨询的 peer 不得自行发起咨询（深度为 1）。如果无法解析 `<peer>` 或其执行出错，则回退到失败恢复（ESCALATE）——绝不要阻塞。无需询问用户——咨询属于机械式交接。
- `NEEDS_FIX` — 仅使用修复列表重新分派该子任务的 Worker。修复完成后，仅针对该子任务分派一个专门的 Reviewer（而不是重新进行完整的批次审查）。重复此过程，直到得到 `PASS`（最多重试 3 次，之后重新规划该子任务）。
- `PASS` — 将子任务交给 Step 2d 提交。

#### 步骤 2c — Gate 运行（P1 · 在 2b 判定完成后顺序执行）

批次中的所有子任务通过审查后，按照 [quality-gates.md](references/quality-gates.md) 对受影响的文件运行 **Layer 5 质量门禁**（lint / typecheck / tests）。

派发一个 Worker 运行门禁命令。派发一个 **Reviewer** 判断门禁输出。判定结果：`PASS` / `NEEDS_FIX`。如果为 NEEDS_FIX，Worker 应应用修复（绝不修改每个子任务的提交——修复应作为小型附加提交落地），然后重新运行门禁。最多执行 3 个门禁周期，之后升级处理。

**失败恢复：** DOCTRINE 规则 14 — [`skills/hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md)。当批次级 Reviewer 返回 NEEDS_REVISION 时，向 Worker 注入 `## Learnings from review` 后重试一次。第二次 NEEDS_REVISION 将该子任务标记为 partial；链路继续执行，并将最新输出标记为 partial——不再派发第三个 Worker。

#### 步骤 2d — 经验总结 + 提交（P1 · 在 2c PASS 后顺序执行）

对于判定为 `PASS` 的每个子任务：
- 根据 [git-workflow.md](references/git-workflow.md) 规则 2（每个子任务的提交节奏）立即提交。只暂存该子任务修改过的文件。编写 conventional commit（从任务文件中派生 `feat(<scope>): <title>`）。一个子任务对应一个提交。即使在一次批量 Reviewer 调用中完成审查，包含 3 个并行子任务的批次仍应产生 3 个提交。
- 每次提交落地后，更新任务文件的 `## Status` 块：将 `[ ]` → `[x]`，递增 `Sub-tasks: <done>/<total>`，将 token 添加到 `Tokens used:` 的累计总数中，刷新 `Wall-clock:` 和 `Last update:`，在完成 ≥3 个子任务后重新计算 `ETA:`。`/hyperflow:status` 正是读取这些内容来显示实时进度。

并行派发一个 Writer，根据所有 Worker 输出和 Reviewer 的备注总结每批次的经验。将这些经验追加到内存中的 `Learnings from prior batches` 上下文中（并在后续批次的步骤 2a 注入）。Writer 还会勾选完成该批次——在 **flat mode** 下更新任务文件；在 **feature mode** 下更新当前阶段的 `phase.md` 任务清单（并将持久化经验写入该阶段的 `decisions.md`）。

这两项活动（提交 + 经验总结）并发执行——Writer 进行总结的同时，提交按照提交节奏参数顺序落地。

步骤 2d 完成后，打印一行状态更新——*"批次 1 完成 · 9/36 个子任务 · 下一步：B2 依赖"*——然后立即继续下一个批次。根据 DOCTRINE 规则 8，禁止使用“透明度检查点”/“中途健全性检查”/“范围重新确认”/“成本提示”。批次之间唯一的门禁是：(a) `SECURITY_VIOLATION` → 硬停止；(b) `ESCALATE: <reason>` 跨越不可逆边界 → 按照 [escalation.md](../hyperflow/escalation.md) 触发升级门禁。如果均不适用，则立即启动下一个批次。

### 步骤 3 — 最终集成审查

**跳过条件（D7）：** 如果以下所有条件均满足，则跳过最终集成审查，并打印 `Final integration review skipped — all batches PASSed first try`：
- 每个批次级 Reviewer 首次都返回 PASS（没有 NEEDS_FIX 重试）
- 没有触发升级（步骤 2 中没有 `ESCALATE:` 标记）
- 没有提出安全标记（没有 `security: true` 的分类结果，也没有 Reviewer 的安全警告）
- 没有任何批次级 Reviewer 提出 `[Important]` 超出能力上限的备注（通过 `reviewer-prompt-batched.md` 的 “Honor the Level Cap” 逃生通道提出——这些备注表明 Reviewer 想要标记某个问题，但无法在能力上限内升级；D7 绝不能忽略它们）
- **单一专家覆盖（DOCTRINE 规则 17 扩展）：** 一个专家覆盖了整个变更面（所有批次都映射到同一位负责专家）。当多个专家处理了**互不相交**的变更面时，该条件不成立——保留最终审查，以捕获任何单个锚定专家都无法发现的跨变更面矛盾。

如果这些条件中有任何一项不满足，就会运行最终集成审查。

> **风险提示：**跳过是第 2 轮中风险最高的 D 决策——跨批次交互 bug 可能会漏掉。守卫条件被刻意设定得很严格（首次尝试 PASS + 无升级 + 无安全标记），以将风险控制在较低水平。传入 `--thorough` 可禁用跳过，并始终运行集成审查。

> 根据 §12.2.8，此步骤免于原子性要求——这是一次针对累计 diff 的单一 Reviewer 调度，不包含并行视角。不需要进行子阶段拆分。

**失败恢复：**DOCTRINE 规则 14 — [`skills/hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md)。如果集成 Reviewer 出错，则注入此前的错误并重试一次。第二次失败时，在上下文中包含此前的错误并重新调度。第三次失败 → 中止集成审查；链以部分集成判定结束，并向用户展示该判定。

针对所有批次中完整的变更文件集合（包括第 2d 步的所有子任务提交）调度一个 **Reviewer**。将其作为任务文件 `Specialists` 名单中匹配度最高的专员（由 Brain 决定）进行调度——当 diff 跨越多个表面时，注入这些专员职责的并集，使集成审查具备正确的领域视角。使用与批次 Reviewer 相同的级别上限（依据流程配置）。在受门控的流程中，专员会在给出判定前先进行联网研究。

打印：`**Reviewer** — final integration review (L1–L<n>)`

集成 Reviewer 返回一个包含适用时各子任务发现的单一结构化判定。这是唯一能够捕获跨批次矛盾的一轮审查——各批次 Reviewer 受限于单个批次的 diff，无法看到跨批次集成问题。

解析该判定：
- `PASS` → 继续执行第 4 步。
- `NEEDS_FIX` → 仅针对受影响的子任务重新调度其 Worker，并提供修复列表。修复完成后，针对更新后的 diff 重新执行第 3 步。
- `SECURITY_VIOLATION` → **立即停止链。**打印发现；不要自动继续。

### 第 4 步 — 收尾

根据 §12.1（D5 + D9），收尾符合琐事任务条件。收尾是机械性工作：删除任务文件 + 追加记忆 + 创建 chore 提交。各批次 Reviewer 和最终集成审查（未根据 D7 跳过时）已经验证了实质性变更。

**名义路径（内联编排器）：**直接执行以下操作，无需使用 Agent 调度包装器：
1. **Flat 模式** — 从 `.hyperflow/tasks/` 中删除已完成的任务文件。**Feature 模式** — 将 `feature.md` 的状态设置为 `completed`（不要在 feature 期间删除）；当每个阶段都为 `completed` 时，feature 文件夹将符合归档条件，可归档至 `.hyperflow/archive/features/YYYY-MM/<slug>/`（会话开始时的归档器会移动它）。
2. 追加前：针对 `.hyperflow/memory/*.md` 文件，使用 `grep -F` 搜索拟追加条目的首行标题（内联去重检查——取代已移除的 Reviewer 去重步骤）。如果存在匹配项，则编辑现有条目，而不是追加重复项。
3. 根据 [memory-system.md](references/memory-system.md) 将持久化模式/决策追加到 `.hyperflow/memory/`。
4. 将记忆和任务文件删除作为一个 `chore(memory):` 提交提交（与第 2 步中各子任务的提交分开——将记忆写入排除在 feature 提交之外，可以保持 diff 整洁）。
5. 根据 [output-style.md](references/output-style.md) 打印使用情况摘要。
6. 通过写入包含当前 UTC 时间戳的 `.hyperflow/.dispatch-auto-compact-ready`，标记调度结束时已准备好进行紧凑化。这个短期标记由 `PreCompact` hook 使用，也是唯一允许自动紧凑化的信号；不要在每个子任务、批次、门控步骤或部分停止之前写入它。

**需要 Writer 调度的情况：**如果记忆追加需要生成非平凡的 prose（例如从包含跨批次模式的多批次运行中综合提炼经验），则为记忆写入调度 `Writer — finalizing dispatch artifacts`。此时该步骤不再属于 §12.1 中的简单步骤，由 Writer Agent 负责。chore 提交仍会紧接着进行；收尾时不调度 Reviewer。

> **不调度收尾 Reviewer（D5）：**此前负责对 chore 提交和记忆条目进行合理性检查的 Reviewer 已被移除。收尾过程可通过机械方式验证——`git status` 干净、任务文件不存在、记忆文件存在。编排器的直接观察已足够。

### 步骤 5 — 构建结束

**交接构建（第二个会话）——先写入完成标记。**当本次运行来自交接接续时，在执行常规 gate 之前：写入完成标记，然后根据 `on_complete` 分支：
1. 写入 `.hyperflow-handoff/<slug>/COMPLETION.md`（built-by provider、base = `HANDOFF.md` 中记录的 originating commit、head = 当前 `HEAD`、`Diff range = <base>..<head>`、提交数量、分支、`Result: built | partial (<done>/<total>)`）。
2. 设置 `STATUS=built`。
3. `git add .hyperflow-handoff/<slug>/` + 提交 `chore(handoff): build complete <slug>`；如果 `handoff.autoPush` 且 `push != never` → push（失败时显示 push 命令）。
4. 分支：
   - **`on_complete=deploy`** → 使用 `skill: deploy` 调用 `Skill`（其自身的 push gate 仍然适用）。不要再触发下面的 audit/deploy `AskUserQuestion` —— `on_complete` 已经编码了该处置方式。
   - **`on_complete=review`** → 停止。打印：`Build complete — committed + pushed (range <base>..<head>). Return to session 1 and run /hyperflow:audit <base>..<head> (or /hyperflow:handoff review <slug>).`

**常规（单会话）链末尾——Audit + Deploy gates。**调度是自动链的终点。使用 `questions[]` 数组中的**两个问题**触发**一次** `AskUserQuestion`（D2 —— 组合 gate）。DOCTRINE 规则 8 —— 结构性 gate 始终触发，绝不静默采用默认值。`AskUserQuestion` 工具每次调用最多接受 4 个问题；此组合 gate 使用 2 个问题（audit + deploy）——如果链是 **GitHub-native**（存在 `gh_issue=` 链参数且 `pr=ask`），则使用 3 个问题：下面的 PR 退出问题。不要在此处塞入其他无关问题；该 gate 的范围仅限于链末尾的处置。在便携式界面（Codex / OpenCode / Grok）上，如果弹窗 UI 不可用，则在一个 `Hyperflow Question` 聊天块中呈现这些问题，并等待用户回答。

> **DOCTRINE 规则 8 保持不变：**每个 gate 问题仍然都会触发；只是将它们批量合并到一次往返中，而不是两次或三次。组合 gate 可降低链末尾人工介入的延迟。

```
?  End-of-chain gates

   [1] Run /hyperflow:audit on the cumulative diff?
       Yes — outside-eye L3 review, independent of per-batch reviewers
       No  — skip; per-batch L1–L<n> reviews were enough

   [2] Run /hyperflow:deploy now? (lint + typecheck + build + tests + security sweep, then asks before push)
       Yes — gates pass · ready to ship
       No  — keep commits local · push manually later

   [3] Open a pull request for this chain?           (GitHub-native chains only — gh_issue= present, pr=ask)
       Yes — push feature branch · gh pr create · Closes #<n>
       No  — keep the branch local · print the gh pr create command
```

根据 DOCTRINE 规则 8，门控问题是二元操作门控——任何选项都不得添加 `(Recommended)` 标记。双结果表述是对称的；编排器的分析会反映在周围的状态输出中（门控结果、重试次数、安全判定），而不是通过预先标记选项来体现。

**按顺序处理答案：**

审计回答 `Yes` → 使用 `skill: audit` 和 `args: "level=3"`（科学任务使用 `level=5`）调用 `Skill`。等待其完成。然后处理部署回答。

接着，处理部署回答。选项标签必须各自为一个简短分句（≤ 12 个单词）——绝不能写成包含推理过程的段落。

**内部推荐信号（用于状态表述，而非选项标记）：**

编排器仍会计算链路处于“绿色”还是“边缘”状态——这会驱动用户在门控问题上方看到的状态行，而不是在选项上添加 `(Recommended)` 标记。当存在以下任一*具体*信号时，链路属于**边缘**状态（状态行应明确说明这一点）：

- 调度期间引发了 `SECURITY_VIOLATION`（并已解决）
- 一个 worker 的 `ESCALATE:` 越过了不可逆边界
- 对*同一*子任务发生 ≥ 2 次 Hyperflow 批次审查器重试（`NEEDS_FIX` → 重新调度）——这表示 Layer 5 质量门控确实发生了重复失败
- 发生了未能确凿确定根因的易失败测试失败
- 任何审查者留下的 `[Critical]` 发现尚未解决

以下情况**不是**“边缘”信号，绝不能因此将推荐切换为 `No`：

| 信号 | 这是正常情况的原因 |
|---|---|
| 预提交钩子自动修复了风格问题（commitlint subject-case、prettier、eslint --fix） | 这些是编辑器层的提交时 lint 工具，而不是 Hyperflow 质量门控。钩子自行修复是正常现象。 |
| 运行了 `/hyperflow:audit`，并通过 `/hyperflow:plan → :dispatch` 应用了修复 | 这是审计修复门控按设计运行的结果。代码现在比审计前更好。这是强烈的正面信号。 |
| 质量门控首次尝试通过（或经过一次自动修复重试后通过） | 首次通过是正常的理想路径。 |
| 单批次调度且没有升级处理 | 运行越简单，通常越干净，并不更可疑。 |
| 子任务很多（例如 27 个提交），但没有出现上述任何具体信号导致的失败 | 数量本身不是风险信号。 |

编排器不是用户的风险顾问。用户已经在滚动记录中看到了每一位审查者的判定、每个门控结果以及审计发现。在推荐标签中编造风险叙事（“在推送前仔细查看差异更稳妥”）是家长式作风，而不是指导。

部署回答 `Yes` → 使用 `skill: deploy` 调用 `Skill`。部署流程在其第 6 步有自己的推送确认门控。

**PR 退出（仅限 GitHub 原生链路——存在 `gh_issue=<n>`）。** 在处理完部署回答后触发：

- `pr=ask`（默认）→ 在合并门控中的问题 [3] 提问：为此链路创建拉取请求吗？`Yes / No`（二元选项，不添加标记）。`pr=auto` → 链路门控通过后直接创建，无需询问。`pr=never` → 跳过；在收尾信息中打印可直接运行的 `gh pr create` 命令。
- PR 选择 `Yes`/自动创建时：执行 `git push -u origin <branch>`（绝不强制推送，也绝不直接推送到 `main`/`master`——功能分支是唯一的外发面），然后使用主导提交类型生成符合约定的标题，并通过 `gh pr create` 创建 PR；正文包含做了什么 / 为什么做 / 验证摘要，以及 `Closes #<n>`。PR 中任何位置都不得出现 AI 署名。
- PR 创建后：当 `comment=ask` 时，提供一次在问题 `#<n>` 下发布礼貌评论的选项，并链接到该 PR；`comment=never` 时静默跳过。只发布一条批量评论——绝不发布增量更新。
- `gh` 未通过身份验证或推送被拒绝 → 打印准确的恢复命令（`gh auth login`、`git push -u origin <branch>`、`gh pr create …`），然后干净退出。绝不进行半完成式发布。

在两个门控问题上都选择 `No` → 干净地停止。打印一行：

```
Dispatch complete — <n> batches, <m> agents, <p> per-sub-task commits on branch <branch>.
Next: invoke /hyperflow:audit or /hyperflow:deploy manually when ready.
```

编排器**不会**自动调用 audit 或 deploy。两个门控都必须等待用户明确选择。静默采用默认值违反工作准则。

## Agent Label Style

不使用图标，不使用方括号。使用破折号分隔。Reviewer 和 Debugger 角色使用粗体：

```
Implementer — creating auth middleware
Searcher — finding related test files
Writer — generating API documentation
**Reviewer** — reviewing auth middleware output
**Debugger** — investigating test failure in auth.test.ts
```

## Operational Args (from Scope Step 0.5 pre-elections)

Scope 在其 Step 0.5 中对三个操作性预选项（`commit`/`branch`/`push`）进行批量处理，并将它们作为链参数传递（或者在双会话模式下，将它们嵌入交接包的 `HANDOFF.md` 中）；GitHub 原生参数（`pr`/`comment`）以同样的方式从 `/hyperflow:issue` 传入。Dispatch 在 Step 1 读取这些参数，并在不再次询问的情况下遵循它们。缺失的参数回退到所示默认值。

| Arg | Values | Default | Honored at |
|---|---|---|---|
| `commit` | `per-task` / `per-batch` / `per-task-deferred` / `single` / `none` | `per-task` | Step 2 (commit cadence after each PASS) |
| `branch` | `new` / `current` | `new` if currently on `main` or `master`, else `current` | Step 2 (before first commit) |
| `push` | `ask` / `auto` / `never` | `ask` | Forwarded to Deploy Step 6 via chain args |
| `pr` | `ask` / `auto` / `never` | `ask` | Step 5 PR exit — only meaningful when `gh_issue=<n>` is present (set by `/hyperflow:issue`) |
| `comment` | `ask` / `never` | `ask` | Step 5 PR exit — courtesy comment on the originating issue |

**`commit=per-task`**（默认）——按照现有流程，在每个子任务 PASS 后提交。提交会随着流程进行直接落到用户的工作分支上。  
**`commit=per-batch`**——累积子任务变更；在一个批次中的所有子任务都 PASS 后，每个批次提交一次，并使用汇总该批次的提交消息（`feat(<scope>): batch <n> — <one-line summary>`）。每个批次对应一个批次提交。  
**`commit=per-task-deferred`**——像 `per-task` 一样生成 N 个逐任务提交，但在链执行期间将它们排队到私有的 `hyperflow/staging-<chain-id>` 分支，并在 Step 4 收尾时全部刷新到用户的工作分支上。当用户希望在链执行期间不产生用户可见的提交（在末尾以原子方式一次性显示所有累积变更），或希望使用崩溃安全的清单恢复路径时，这一模式很有用。在每个子任务 PASS 后，调用 `bash $PLUGIN_ROOT/scripts/queue-commit.sh $PROJECT_ROOT $CHAIN_ID "<msg>" <file>...`，而不是执行 `git add` + `git commit`。该脚本会在首次调用时自动创建暂存分支和清单，使用启用钩子的方式运行 `git commit`（绝不使用 `--no-verify`——这是 DOCTRINE Layer 8 的要求），并追加到 `.hyperflow/commits-queue/manifest.json`。如果钩子拒绝某个子任务的提交，编排器会显示错误并停止；用户修复问题后，从受影响的子任务继续。在 Step 4 收尾时，dispatch 运行 `bash $PLUGIN_ROOT/scripts/flush-commits.sh $PROJECT_ROOT`，将暂存分支快速前向合并到用户的分支上（每个排队的提交都会按顺序落地，保留原始 SHA，并保留原始消息）。如果用户的分支已发生分叉（链执行期间在同一分支上进行了手动提交），flush 会显示错误和恢复建议（`git rebase` / `git cherry-pick`）；暂存分支和清单会保留，以便手动处理。崩溃恢复：`/hyperflow:flush` 会针对持久化的清单重新运行同一脚本。

**权衡诚实性：**钩子会按子任务触发（负载与 `per-task` immediate 相同）。延迟模式不会跳过预提交钩子——从未跳过，任何早先暗示这一点的草稿都违反了原则，现已纠正。使用此模式是为了 UX 优势（直到结束前不产生用户可见的提交）和崩溃安全性（清单可在会话丢失后保留）；不要将其用于规避钩子。  
**`commit=single`** — 累积所有变更；在第 4 步收尾时提交一次，提交消息汇总整个链（`feat(<scope>): <feature name> · <n> sub-tasks`）。总共一个提交。  
**`commit=none`** — 分派期间永不提交；保留脏工作树。完全跳过每个子任务的提交步骤。在第 4 步打印：`Working tree intentionally left dirty (commit=none); review and commit manually before deploy.`

**`branch=new`** — 在第 2 步第一次提交之前，如果当前位于 `main` / `master` / `develop`，则创建 `feat/<task-slug>` 并切换到该分支。如果已经位于功能分支，则按 `branch=current` 处理。  
**`branch=current`** — 永不自动创建分支。所有提交都落在调用编排器时所在的分支上。

**`push=…`** — 分派不会将提交推送到用户的分支。它只会将所选值传递给链中的部署第 6 步参数；部署会在那里执行该值。**唯一的例外：**GitHub 原生 PR 退出路径（存在 `gh_issue=`）会在执行 `gh pr create` 之前推送*功能分支*本身——该推送是 PR 的出站界面，由 `pr=` 控制（而不是 `push=`），并且绝不会指向 `main`/`master`。

## 铁律

- **失败恢复（规则 14）。**Worker 错误、格式错误的输出、NEEDS_REVISION 以及门禁失败，都遵循 [`skills/hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md) 中的规范策略。重试 → 升级 → 中止。链预算：累计 3 次中止。
- Worker 永不审查、永不协调、永不向用户提问。
- 每个批次产生**一次**按批次执行的 Reviewer 分派——覆盖该批次中的所有子任务（P2）；如果存在混合级别上限或使用了 `--thorough`，则按子任务执行。无论哪种情况：正常情况下每个批次调用一次 Reviewer。
- 此外，在第 3 步末尾再进行**一次**最终集成 Reviewer，**除非根据 D7 跳过**——这是负责查看跨批次累计差异的 Reviewer。
- **第 4 步不进行收尾 Reviewer（D5）。**收尾属于 §12.1 中的简单操作——删除任务文件 + 追加记忆 + 创建 chore 提交都是机械性操作，由编排器内联执行。之前第 4 步的 Reviewer 已删除。
- 因此——使用情况摘要中的 `review agents >= batches + 1`。根据第 2 轮 D5，底线从 +2 降至 +1：收尾 Reviewer 被删除，因为收尾属于 §12.1 中的简单操作。如果你的分派运行包含最终集成审查（未满足 D7 跳过条件），则底线仍为 `>= batches + 1`，因为集成审查就是这个“+1”。如果集成审查被跳过且所有批次均通过，则 `review agents = batches` 恰好成立——这仍满足底线，因为这个 +1 就是隐含执行的集成审查。无论子任务数量多少，每个批次的批量 Reviewer 都计为 **1**。如果少于此数，说明跳过了某个步骤级 Reviewer。任务执行错误。
- 批量 Reviewer（或按子任务执行的 Reviewer）返回任何 `SECURITY_VIOLATION` 判定时，都必须立即停止链——不得提交，不得自动继续。无论审查采用批量还是按子任务执行，行为都相同。
- **使用情况摘要只在链的最末尾触发——在第 4 步收尾之后。绝不能在批次中途触发。绝不能在部分子任务完成后触发。**当仍有子任务待处理时，打印 `── Hyperflow Usage ──` 并附带“仅完成 B1W1”或“已完成 `<n>/<m>` 个子任务”，属于违反原则，而不是状态更新。在 `auto` 模式下，使用情况摘要是终止信号——它意味着链已完成。如果在仍有子任务待处理时打印了摘要，则链处于损坏状态。
- **自动压缩就绪状态只在分派结束时生成。**`.hyperflow/.dispatch-auto-compact-ready` 必须在第 4 步收尾和最终使用情况摘要之后准确写入一次。`PreCompact` 钩子会阻止自动压缩，直到该标记存在且仍然有效；手动执行 `/compact` 可随时进行。
- `auto` 模式必须在生成任何摘要、状态转换或链结束产物之前，完成每个批次中的每个子任务。禁止输出“如需恢复”说明、部分使用情况表或“暂时停在这里”之类的文字。在链中途唯一合法的终止情况是：(a) `SECURITY_VIOLATION`；(b) 越过不可逆边界的 `ESCALATE: <reason>`；(c) Worker 重试 3 次后，按子任务执行的 Reviewer 返回 `NEEDS_FIX` 且未解决。如果这些情况均未发生而链停止，则应显示为 `ESCALATE: dispatch halted with N/M sub-tasks remaining — root cause unknown` 并询问用户——不要打印部分使用情况摘要，假装链已正常结束。
- **如果批次分派被中断（令牌耗尽、运行时崩溃、手动中止），则保留任务文件的 Status 块及其中部分 `[x]` 勾选状态，不要打印使用情况摘要，也不要打印“To resume”交接说明。**用户可以自行重新调用 `/hyperflow:dispatch --from-batch <n> <slug>`；任务文件已经反映出哪些子任务已完成。半途结束的链所打印的交接说明本身就是缺陷——它会让用户误以为链是正常自行暂停的，而实际上链已经中断。

## 原则

完整规则见 [DOCTRINE.md](../hyperflow/DOCTRINE.md)。此技能是 `/hyperflow:plan` 末尾调用的执行阶段。

## 概览

`/hyperflow:dispatch` 是实际执行阶段——它从 `/hyperflow:plan` 读取任务文件，并通过编排器模式执行任务。

在单条消息中调度并行 Worker；每批次的 Reviewer 在发现问题时通过 `NEEDS_FIX` 将工作退回；条件性执行最终集成审查（当所有批次首次尝试即通过且没有升级处理时跳过）；内联收尾；并且在自动链结束时，通过一个同时包含审计和部署问题的 **单个** `AskUserQuestion` 闸门。

原则最低要求：审查代理数量 ≥ 批次数 + 1（每批次一个 Reviewer；当未根据 D7 跳过时再加一个最终集成 Reviewer；根据 D5 / §12.1 不再设置收尾 Reviewer）。

## 前置条件

- `.hyperflow/tasks/<slug>.md` 中存在任务文件（由 `/hyperflow:plan` 生成）。
- `.hyperflow/profile.md`、`architecture.md`、`conventions.md` 已填充（Layer 0 上下文会注入 Worker 提示词）。
- 用于各子任务提交的 Git 仓库。
- 对于 Step 5：`AskUserQuestion` 弹窗可用，或可使用 Codex 聊天回退方案——审计 + 部署闸门需要其中之一。无交互通道的无头模式会跳过闸门，并明确发出警告。

## 指令

编号步骤位于上方的 [Step 0 — 选择模式](#step-0--choose-mode-only-if-invoked-directly--structural-gate) 至 [Step 5 — 自动链结束](#step-5--end-of-auto-chain--audit--deploy-gates) 中。摘要如下：

1. 解析会话上下文（继承的 `session=` / 交接用的 `HANDOFF.md` / 默认值 `one`）——dispatch 是构建终点，不询问会话。
2. 从 `.hyperflow/tasks/` 加载任务文件——内联执行读取 + schema 检查（原子操作 · §12.2.8）。
3. 对每个批次，依次运行四个子阶段：
   - **Step 2a** — Composer Workers 并行构建 Worker 提示词；Reviewer 确认提示词集合。
   - **Step 2b** — Worker 扇出（N 个并行 Worker）；Reviewer 对该批次进行批量审查；解析判定结果（PASS / NEEDS_FIX / SECURITY_VIOLATION / OVERSIZE）。
   - **Step 2c** — 通过 Worker + Reviewer 执行 Layer 5 质量闸门。
   - **Step 2d** — 提交各子任务 + 通过 Writer 综合经验。
4. 最终集成审查——条件性执行（D7）：如果所有批次首次尝试均已 PASS，且没有升级处理和安全标记，则跳过。否则：针对累计差异调度 Reviewer；判定结果将分别路由至 Step 4（PASS）、重新调度（NEEDS_FIX）或停止（SECURITY_VIOLATION）。依据 §12.2.8 执行原子操作。
5. 收尾（§12.1 内联）——编排器删除任务文件 + 追加记忆 + 创建 `chore(memory):` 提交，然后在使用情况摘要之后写入 `.hyperflow/.dispatch-auto-compact-ready`。不使用 Reviewer（D5）。仅当记忆文本生成并非简单任务时才需要 Writer Agent。
6. 使用一个同时包含审计和部署问题的 **单个** `AskUserQuestion` 闸门——按顺序处理回答。

## 输出

各批次和各子任务的代理标签会在启动时打印（`Implementer — creating auth middleware`、`**Reviewer** — reviewing auth middleware output (L1-L3)`）。完整链路结束后，会打印使用情况摘要：

```
── Hyperflow Usage ──────────────────────
11 agents  206.4k tokens  (5 implementers + 1 writer + 1 searcher + 3 batch reviewers + 1 final)
─────────────────────────────────────────
```

（根据 D5，Wrap-up Reviewer 不再出现。如果根据 D7 跳过了集成审查，审查 agent 数量将与批次数量完全一致。）

此外，还有 End-of-Chain 区块，其中列出了批次、agent 以及每个子任务的提交。

## 错误处理

| 失败 | 行为 |
|---|---|
| `.hyperflow/tasks/` 中没有任务文件 | 停止并建议先运行 `/hyperflow:plan`。 |
| Worker 超时或未返回任何内容 | 将子任务重新拆分为更小的部分；重新分派。最多尝试 2 次重新拆分，之后再报告失败。 |
| Reviewer 返回 `NEEDS_FIX` | 根据修复列表重新分派 worker。最多重试 3 次，之后再向用户报告失败。 |
| Reviewer 返回 `SECURITY_VIOLATION` | **立即停止整个链路。** 输出发现的问题；不要提交，不要自动继续。由用户决定如何修复。 |
| 第 5 层门禁失败（lint/typecheck/test） | 修复 worker 的问题并重新运行。最多进行 3 个门禁周期，之后升级处理。 |
| 每个子任务的提交失败（钩子拒绝、冲突） | 停止；报告钩子错误。不要使用 `--no-verify`。不要修改每个子任务的提交。 |
| Wrap-up memory append 存在重复条目（提交后检测到） | 使用 `git revert HEAD` 回退 `chore(memory)` 提交；编排器重写并重新提交。没有 Reviewer 可以在线捕获此问题——恢复路径是使用 `git log` 和 `git revert`。 |
| `AskUserQuestion` 弹窗不可用（Codex / OpenCode / Grok） | 将审计/部署内容打印为 `Hyperflow Question` 聊天区块，并等待用户回答。 |
| 审计/部署门禁没有交互式通道 | 打印包含 `Audit/Deploy gates skipped — interactive mode required` 的链路结束区块。不要静默地自动调用任一门禁。 |
| 结束时思考型 agent 数量 < 批次数 + 1（集成审查运行时） | 在使用情况摘要中打印明确的规约违反警告。提示可能跳过了逐步审查。 |

## 示例

完整的交互记录已移至 [examples.md](references/examples.md)，以保持 SKILL 正文精简。示例仅用于说明，并非行为所依赖的内容。想查看端到端交互记录时，请阅读配套文件。

## 资源

- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 编排规则（尤其是 #8 结构性门禁、#12 逐步 agent）。
- [worker-prompt.md](references/worker-prompt.md) — implementer/searcher/writer 模板。
- [reviewer-prompt.md](references/reviewer-prompt.md) — reviewer 模板（每个子任务的回退方案）。
- [reviewer-prompt-batched.md](../hyperflow/reviewer-prompt-batched.md) — 批量 reviewer 模板（P2）。
- [latency-patterns.md](../hyperflow/latency-patterns.md) — P1–P5 延迟模式；P2 分派可将 reviewer 阶段延迟降低约 75%。
- [review-levels.md](references/review-levels.md) — L1-L5 检查清单。
- [memory-system.md](references/memory-system.md) — Wrap-up memory append 格式。
- [quality-gates.md](references/quality-gates.md) — 第 5 层 lint/typecheck/test 策略。
- [git-workflow.md](references/git-workflow.md) — 每个子任务的提交节奏，不添加 AI attribution。
- [output-style.md](references/output-style.md) — agent 标签 + 使用情况摘要格式。