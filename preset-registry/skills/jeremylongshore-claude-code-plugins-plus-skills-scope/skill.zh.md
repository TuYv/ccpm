---
name: scope
description: |
  Use when the user has a clear-enough task and wants it decomposed into batched worker sub-tasks before any code is written. Writes a task file under .hyperflow/tasks/ and auto-chains into /hyperflow:dispatch.
  Trigger with /hyperflow:scope, "plan this", "decompose this task", "break this down", "write the task file".
allowed-tools: Read, Write, Edit, Bash(git:*), Glob, Grep, AskUserQuestion
argument-hint: "<task description> [chain-mode=auto|manual]"
version: 3.1.2
license: MIT
compatibility: Designed for Claude Code
tags: [planning, decomposition, task-graph, multi-agent]
---
# 范围

分解，不构建。相对于源代码只读。唯一允许写入的是 `.hyperflow/tasks/`、`.hyperflow/memory/` 和 `.hyperflow/specs/`。任务文件准备就绪后，移交给 `dispatch`（自动移交或带门禁移交，取决于链模式）。

此技能使用 **第 0 层（项目分析）**获取上下文，使用 **第 6 层（项目记忆）**呈现过往经验，并使用 **第 7 层（任务模板）**获取分解模式。它还继承了 `/hyperflow:spec` 中的分流分类，以便正确确定每个批次的规模。

## 铁律

- **失败恢复（规则 14）。** Worker 错误、格式错误的输出、NEEDS_REVISION 和 Reviewer 错误均遵循 [`skills/hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md) 中的规范策略。重试 → 升级 → 中止。链预算：3 次累计中止。

## 每步骤 Agent 映射（DOCTRINE 规则 12 + 12.2）

每个实质性步骤均按照 DOCTRINE 规则 12 调度至少一个 Agent。§12.1 中定义的简单步骤可由编排器内联执行。非简单步骤按照 DOCTRINE 规则 12.2 分解为 ≥ 2 个具名子阶段。

| 步骤 | 子阶段 | Worker 层级 | 思考层级 | 备注 |
|---|---|---|---|---|
| 0 — 链模式 | —（原子） | — | — | 仅 `AskUserQuestion`；12.2.8-豁免 |
| 0.4 — 分流（Classifier + Reviewer） | —（原子） | Classifier (Sonnet) [如未继承] | **Triage Reviewer** (Sonnet) [如未继承 + 不满足 P4 条件] | 从 spec 链式调用时完全跳过（spec 已验证的分流结果为规范结果）；直接调用时，调度其自身的 Classifier，然后是 Triage Reviewer；在 P4 条件下跳过 Triage Reviewer；12.2.8-豁免 |
| 0.5 — 运维选项 | —（原子） | — | — | 单个 `AskUserQuestion` 批次；12.2.8-豁免 |
| 1 — 路由 | —（原子） | — | — | 单个机械式路由决策；12.2.8-豁免 |
| 2 — 调研 | 2a + 2b + 2c（P1 并行） | | | 子阶段聚合结果交给步骤 3 |
| | 2a — 表层映射 | Searcher × 2（glob 发现 + 导入图遍历） | **Reviewer** (Sonnet) | P1；与 2b/2c 无相互依赖 |
| | 2b — 语义索引 | Searcher × 2（类型系统探查 + 符号图探查） | **Reviewer** (Sonnet) | P1；与 2a/2c 无相互依赖 |
| | 2c — 约定扫描 | Searcher × 1（测试模式 + lint 配置；单角度合理：配置没有独立探查角度） | **Reviewer** (Sonnet) | P1；根据 12.2.3 例外，单个 Worker |
| 2.5 — 澄清 | —（原子） | — | — | 最多一个 `AskUserQuestion`；12.2.8-豁免 |
| 2.6 — 残留项 | — | — | — | 不执行任何操作；编号为向后兼容保留 |
| 3 — 分解 | 3a + 3b + 3c | | | 先执行 3a；3a 完成后并行执行 3b/3c |
| | 3a — 批次图 | — | **Planner** × 1（Opus；依赖分析 + 并行/顺序映射；单角度：规范聚合，无独立角度）+ **Reviewer**（Sonnet · 每子阶段：完整性 + 合理的批次边界；结论 ∈ {PASS, NEEDS_REVISION, ESCALATE}） | 顺序综合；根据 12.2.3，Planner 使用单个 Worker 是合理的；根据 12.2.4，Reviewer 为必需 |
| | 3b — 复杂度估算 | Searcher × 2（子任务 LOC 估算 + 子系统交叉检查） | **Reviewer** (Sonnet) | 并行；依赖 3a 输出 |
| | 3c — 验收标准 | Writer × 2（每子任务标准 + 验证钩子） | **Reviewer** (Sonnet) | 并行；依赖 3a 输出；3b 和 3c 并发 |
| 4 — 编写任务文件 | 4a + 4b + 4c（与步骤 6 P3 并发） | | | 先执行 4a；4a 完成后并行执行 4b/4c |
| | 4a — 状态 + 目标 + 原因 | Writer × 2（状态块草稿 + 目标/原因叙述） | **Reviewer** (Sonnet) | 顺序的首个子阶段；为 4b/4c 提供锚点 |
| | 4b — 范围 + 受影响文件 | Writer × 2（范围概览表 + 受影响文件列表） | **Reviewer** (Sonnet) | 并行；依赖 4a 输出；与 4c 并发运行 |
| | 4c — 执行计划 + 批次 + 验证 | Writer × 2（执行计划 ASCII + 批次检查清单） | **Reviewer** (Sonnet) | 并行；依赖 4a 输出；与 4b 并发运行 |
| | 4d — 最终任务文件验证 | — | **Reviewer**（Sonnet · 每步骤）根据设计验证整个任务文件 | 在所有子阶段完成后执行；确保每项设计要求均映射到 ≥1 个子任务，且不存在孤立子任务 |
| 4+6 — 并行 | — | Writer（步骤 4）∥ Writer（步骤 6）在步骤 3 后启动（P3） | — | 并发调度；两者均等待步骤 3 聚合结果 |
| 5 — 输出 | —（原子） | — | — | 仅打印；§12.1-豁免 |
| 6 — 记忆 | —（原子；单角度） | Writer (Sonnet) 追加到记忆文件 | **Reviewer** (Sonnet) 检查重复项/矛盾 | 单个 Worker → Reviewer，无独立角度；12.2.8-豁免 |
| 7 — 移交 | —（原子） | — | — | `Skill` 工具调用；§12.1-豁免 |

**延迟标志：**`--thorough` 仅在 **Step 4** 中禁用 P1（顺序执行 Writer 内部的章节草稿，而不是并行执行）。Step 2 的子阶段（同样属于 P1）不受影响——由于它们是相互独立的读取操作，不存在质量权衡，因此在所有标志配置下都保持并行。P3（Step 4 + Step 6 并发）始终开启。有关模式定义，请参阅 [`../spec/references/latency-patterns.md`](../spec/references/latency-patterns.md)。

## 审批门

| 门 | 时机 | 格式 |
|---|---|---|
| 链式模式 | Step 0，仅在直接调用时 | `AskUserQuestion` — 自动 / 手动 |
| 分解合理性检查 | Step 4，写入任务文件之后 | 打印批次摘要；由用户阅读 |
| 阶段推进（`manual` 模式下） | Step 7，调用 `dispatch` 之前 | `AskUserQuestion` — 继续 / 停止 |

## 流程

### Step 0 — 选择链式模式（第一个工具调用 · 结构性门）

根据 DOCTRINE 规则 8，这是一个**结构性门**。每次直接调用此 skill 时都**必须**触发该门。“不提澄清问题”/“自动驾驶”/“始终开启”/任何其他自主性指令都**不能**跳过此门。不询问而默认使用 `auto` 属于违反 doctrine 的行为。

**延迟参数：**`--thorough`（或 `depth=max`）仅在 **Step 4** 中禁用 P1（顺序执行 Writer 内部的章节草稿，而不是并行执行）。Step 2 的并行 Searcher 不受影响——由于它们是相互独立的读取操作，不存在质量权衡，因此在所有标志配置下都保持并行。P3（Step 4 + Step 6 并发 dispatch）始终保持开启。如果用户传入 `--thorough`，请记录该参数，并仅将其应用于 Step 4 的 dispatch。

如果调用时带有 `chain-mode=<auto|manual>` 参数（来自 `/hyperflow:spec` 或之前的 skill），则跳过此步骤——前一个链式启动器已经询问过。

否则，在**研究之前**通过 `AskUserQuestion` 提问。根据 DOCTRINE 规则 8，推荐选项必须排在第一位，并标注 `(Recommended)`：

```
How should I advance through the chain after this phase?

  Auto (Recommended)  — chain forward through scope → dispatch with no gate.
                        Fewer interruptions, faster end-to-end.

  Manual              — pause between phases and ask before advancing.
                        More control, more confirmations.
```

等待用户回答。未获得回答前不要继续。保存用户选择的模式，并在调用 dispatch 时通过 `args: "chain-mode=<mode>"` 传递该模式。

如果代理无法将 `AskUserQuestion` 作为弹窗呈现，请使用 Codex 备用方案：以带编号选项的 `Hyperflow Question` 聊天块打印相同的门，然后停止并等待用户回答。如果完全没有可用的交互渠道，请打印错误并停止——绝不能静默使用默认值。

### Step 0.4 — 分流（分类器 + 审核者）（DOCTRINE 规则 15 · 原子豁免）

原子豁免：不存在可并行的探测维度。根据范围是从 spec 链式传入还是直接调用，采用两条不同路径。

**路径 A — 从 `/hyperflow:spec` 链式传入：**spec 已经运行了自己的分类器和分流审核者，并通过链式参数传递了经过验证的分流 JSON。Scope 完全跳过此步骤——重新分类 spec 已经审核过的分流结果既多余又浪费。打印：

```
Triage Reviewer skipped — spec's validated triage inherited via chain args.
```

然后继续执行步骤 0.5。

**路径 B — 直接调用（链参数中没有继承的分流结果）：** scope 首先调度其自身的 Classifier，然后（除非满足 P4 条件）使用 Triage Reviewer 对其进行验证。

1. 调度 `Classifier — triaging request`（Sonnet）。Classifier 生成 `{ types[], complexity, risk, scope, ambiguity, flow, personas[] }` JSON，其结构与规范步骤 1 中 Classifier 的输出一致。通过链参数将其持久化并向后传递，形式为 `triage=<base64-json>`。

2. **P4 跳过（DOCTRINE §13.P4）：** 如果以下所有条件均满足 — `triage.complexity == low`、`triage.ambiguity < 0.2`、`triage.scope ∈ {0-file, 1-file}`、`triage.risk != high` — 则完全跳过 Triage Reviewer，并直接使用 Classifier 的输出。打印：

   ```
   Triage Reviewer skipped (P4: low complexity + low ambiguity + single-file scope). Direct triage consumed.
   ```

   然后继续执行步骤 0.5。此置信度层级下的误分类成本受小任务 token 预算限制，低于 Reviewer 约 2k token 的成本。

3. 如果任一 P4 条件不满足，则调度 Triage Reviewer。Reviewer 根据以下内容验证分流分类（在路径 A 中通过链参数继承，或在路径 B 的第 1 步中由 Classifier 生成）：

   1. 用户的原始请求 — 该分类是否反映了用户实际提出的要求？
   2. `.hyperflow/profile.md` — 该分类是否符合代码库的技术栈、风险级别以及已知的复杂度模式？

   ```
   **Triage Reviewer** — validating classification against request and project profile
   ```

   Verdict ∈ {`PASS`, `RECLASSIFY`, `ESCALATE`}：

   - **PASS** — 原样使用分流结果；继续执行步骤 0.5。
   - **RECLASSIFY** — Reviewer 返回带有推理过程的修正分类。编排器使用修正后的版本，并打印一行：`Triage reclassified: complexity high → medium · personas added: [security]`。然后使用修正后的分流结果继续执行步骤 0.5。
   - **ESCALATE** — Reviewer 无法确定正确的分类；该歧义将在步骤 2.5（研究完成后，依据 DOCTRINE 规则 8 的分析后澄清条款）作为澄清问题提出。使用原始分流结果作为临时回退继续执行步骤 0.5 — 将其标记为 `provisional=true`，以便步骤 3 Planner 知道应保守地处理复杂度估算。

成本（路径 B，非 P4）：Classifier 约 2k token + Triage Reviewer 约 2k token。它可以捕获原本会悄然级联为错误流程配置、错误 personas 以及失败批处理图的误分类。

### 步骤 0.5 — 操作选择（仅 auto-mode · 结构性门控 · 在步骤 0 之后立即触发）

当用户在步骤 0 选择 `Auto`，且操作参数（`commit=`、`branch=`、`push=`）尚未从先前的链启动器传递过来时，发起一次包含 3 个问题的 `AskUserQuestion` 调用，涵盖该链所需的每项操作决策。在此批处理之后，链将静默运行，直到链末审计和部署门控 — 用户在启动时恰好被打断两次（步骤 0 中的链模式，以及步骤 0.5 中的操作选择），此后直到完成前不再被打断。

跳过此步骤的情况：
- `chain-mode=manual` — 手动用户会审查每个阶段，因此操作选择应交由每阶段的门控处理
- 操作参数已经传递（链参数中包含 `commit=…`、`branch=…`、`push=…`）— 根据 DOCTRINE 规则 8，重复询问属于虚构门控违规

这 3 个问题的批量询问：

```
Commit cadence?
  Per-task (Recommended)   — one commit per sub-task; cleanest bisectable history
  Per-batch                — one commit per batch; tidier branch graph, less granular
  Per-task (deferred)      — queue per-task commits on hyperflow/staging-<id> during chain;
                             flush all onto user's branch at end (atomic cumulative reveal;
                             crash-safe via manifest at .hyperflow/commits-queue/)
  Single                   — one commit at end of chain; smallest log footprint
  None                     — leave dirty working tree; you'll commit manually

Branch behaviour?
  Create feat/<slug> (Recommended on main/master) — new feature branch
  Stay on <current>                                — direct commits on the current branch

Push at end?
  Ask at deploy gate (Recommended) — standard push confirmation after release.sh
  Auto-push                        — push branch + tag without asking at end
  Never                            — always hold local; user pushes manually
```

推荐的默认值会进行自适应：
- 提交：除非分诊显示 `complexity=low AND sub-tasks<=2`（此时推荐 `Single`），否则为 `Per-task`
- 分支：如果当前位于 `main` 或 `master`，则为 `Create`；否则为 `Stay`（已经位于功能分支）
- 推送：始终为 `Ask at deploy gate` — 未经用户明确同意就提升为自动推送，违反 DOCTRINE 规则 8

保存所选值，并通过链参数传递：`commit=<per-task|per-batch|per-task-deferred|single|none> branch=<new|current> push=<ask|auto|never>`。调度（步骤 2）读取 commit + branch；部署（步骤 6）读取 push。

**关于 Per-task (deferred)：** 每个子任务 PASS 后，调度会通过 `scripts/queue-commit.sh`，而不是直接执行 `git commit`。提交会落在启用钩子的私有 `hyperflow/staging-<chain-id>` 分支上（绝不使用 `--no-verify`，遵循 DOCTRINE 规则 9），并保留原始的每个任务文件范围和提交消息。在步骤 4 的收尾阶段，`scripts/flush-commits.sh` 会将 staging 快进合并到用户的工作分支——每个排队的提交都会按顺序落地，并保留原始 SHA。与立即执行 Per-task 相同，都是 N 个提交，只是在末尾以原子方式完成。崩溃恢复：`/hyperflow:flush` 会针对持久化的 `.hyperflow/commits-queue/manifest.json` 重新执行相同的 flush。

### 步骤 1 — 路由

纯路由决策——此处不提出澄清问题。澄清会在步骤 2.5 触发，即研究根据代码库分析完需求之后。

- 纯设计问题（用户询问的是*是否应该这样做*，而不是*如何实现*）→ 建议改用 `/hyperflow:spec`，然后停止
- 其他情况 → 继续执行步骤 2（先研究，然后只询问研究无法解决的问题）

### 步骤 2 — 研究（3 个并行子阶段 · P1）

所有三个子阶段（2a、2b、2c）在**单条消息**中调度——它们共享相同的上游任务描述，彼此之间没有依赖关系。调度前，先阅读 `.hyperflow/profile.md`、`architecture.md`、`conventions.md` 和 `.hyperflow/memory/index.md`，以发现相关的过往经验。步骤 2 的输出 = 各子阶段 Worker 输出的并集 + 3 个子阶段审查器的裁决，并交给步骤 3。

**步骤 2a — 表面映射**

并行调度（无依赖）：
- `Searcher — glob discovery: enumerate all files touched by the task description`
- `Searcher — import-graph traversal: trace dependency edges from entry points`

然后基于两份 Searcher 输出调度 `**Reviewer** — verifying surface-mapping coverage`。如果仍存在缺口，则重新调度一个 Searcher，针对该缺口进行搜索。

**步骤 2b — 语义索引**

并行调度（不依赖 2a）：
- `Searcher — type-system probe: enumerate interfaces, types, and schemas relevant to the change`
- `Searcher — symbol-graph probe: locate call sites, re-exports, and aliased references`

然后基于两份 Searcher 输出调度 `**Reviewer** — verifying semantic coverage`。

**步骤 2c — 约定扫描**

采用单角度是合理的：lint 配置和测试模式文件没有独立的探查维度——两者都从固定配置路径读取。根据 DOCTRINE 12.2.3 的例外规定，只使用一个 Worker。

- `Searcher — test patterns and lint config: read test file naming, runner config, lint rules`

然后基于 Searcher 输出调度 `**Reviewer** — verifying convention capture`。

**P1 原理：**子阶段 2a、2b、2c 是彼此独立的同级阶段——没有任何一个阶段的输出会提供给另一个阶段。在一条消息中同时启动这三个阶段，可以将总耗时缩短至耗时最长的子阶段。参见 [`../spec/references/latency-patterns.md`](../spec/references/latency-patterns.md) §P1。

注意：`--thorough` 不会影响步骤 2。无论采用何种标志配置，子阶段 2a/2b/2c 都会保持并行，因为它们是彼此独立的读取操作，不存在质量权衡。`--thorough` 只会在步骤 4 中禁用 P1 内部并行。

### 步骤 2.5 — 澄清（分析后 · 最多 3 个问题）

只有步骤 2 的研究未能解决的歧义才会变成问题。根据 DOCTRINE 规则 8（分析后澄清条款），澄清阶段会在编排器读取相关代码并分析需求之后触发——绝不会提前触发。

- 如果研究已经充分依据事实确定了每个假设 → 完全跳过此步骤。不要为了提问而提问。
- 如果仍存在 ≥1 个歧义（目标文件不明确、两个同样合理的接口、代码库未能揭示先例的某项配置）→ 调用 `AskUserQuestion`，最多提出 3 个问题，并且每个问题都必须关联到 Searcher 发现的具体结果。
- 每个问题都应引用研究发现来进行表述：*"Searcher 已映射出 `src/auth/middleware.ts` 和 `src/api/auth/route.ts` 两个文件——哪个才是新增 guard 的目标文件？"*——绝不能抽象地问*"新增 guard 应该放在哪里？"*。

`/hyperflow:spec` 中的 2 个问题下限不适用于范围界定。研究结论明确时，范围界定可以不提任何问题；只有在分析后确实仍存在歧义时，才提出 1-3 个问题。

### 步骤 2.6 — 操作选项（已移至步骤 0.5）

此步骤已移至步骤 0.5（紧接在步骤 0 chain-mode 之后），这样操作决策就会与唯一的其他启动问题一并处理——用户只会在链启动时被打断一次，之后链会静默运行。步骤 2.6 作为一个 NUMBER 保留，仅用于向后引用；它有意不执行任何操作。

如果此前的链启动器未能完成传播，并且在当前作用域到达此处时仍缺少操作参数，则使用默认值（`commit=per-task branch=new push=ask`）继续执行步骤 3，而不是触发一个凭空产生的链中途询问。编排器绝不能在此处触发 `AskUserQuestion`——步骤 0.5 是这一组问题唯一正确的位置。

### 步骤 3 — 分解（3 个子阶段 · 先依次执行 3a，再并行执行 3b/3c）

子阶段 3a 首先触发——3b 和 3c 依赖其输出，随后并发运行。步骤 3 的输出 = 各子阶段输出的并集 + 3 个子阶段 Reviewer 的裁决，并传递给步骤 4 和步骤 6。

**步骤 3a — 批次图（先依次执行；单一角度有充分理由）**

单一角度有充分理由：批次图是基于研究输出进行的规范化综合——不存在可供分散执行的独立角度。根据 DOCTRINE 12.2.3 的例外规定，仅使用单个 Worker。

使用步骤 2 的汇总信息（表层映射 + 语义索引 + 约定）、分流分类，以及 [task-templates.md](references/task-templates.md) 中适用的模板（CRUD Feature、API Endpoint、UI Component、Database Migration、Refactor、Bug Fix——否则使用 bespoke），调度 `**Planner** — producing batch graph`。

Planner 输出批次图后，调度 `**Reviewer** — validating decomposition completeness and batch boundaries`，对 Planner 的输出进行审查。Reviewer 检查：每项研究发现至少映射到一个子任务；没有任何子任务在未拆分的情况下跨越超过 1 个子系统边界；批次顺序在拓扑上合理。裁决 ∈ {PASS, NEEDS_REVISION, ESCALATE}。如果为 `NEEDS_REVISION`，则根据 Reviewer 的反馈重新调度 Planner，针对具体缺口进行修订（而不是重新生成整个批次图）。

Planner 为每个子任务生成：
- Worker 角色 — Implementer / Searcher / Writer
- 要读取 / 修改 / 创建的文件
- 依赖关系 — 并行或依次执行
- 复杂度估计（驱动下游的审查级别上限）

**超大任务拆分要求（DOCTRINE 第 3 层 · 思考负责人 — Planner）。** 在最终确定批次图之前，Planner 必须对每个候选子任务执行拆分检查清单。任何子任务只要触发以下任一信号，就**必须**拆分为 2 个或更多较小的子任务（每个子任务的 `complexity = low | medium`）：

| 信号 | 阈值 |
|---|---|
| 文件范围 | 涉及的文件数 > 5 |
| 变更量 | 预计变更 > 500 LOC |
| 跨子系统 | 涉及 2 个或更多不同子系统（auth + UI + DB、frontend + API + migration 等） |
| 复杂度标签 | 分流时标记为 `complexity = high` |
| 关注点混杂 | 一个子任务同时涵盖数据模型 + 业务逻辑 + UI + 测试 |
| 可审查性 | 人工审查生成的提交时，需要超过 10 分钟才能理解 |

拆分目标：每个生成的子任务都应当满足：(a) 人工审核用时少于 10 分钟；(b) 能够完整容纳在单个 Worker 提示词及合理的响应中；(c) 具有一个连贯的单一目的，可以用一条 conventional-commit subject line 命名。检查清单完成后，Planner 绝不会保留 `complexity = high`；高复杂度工作会持续拆分，直到每个部分都属于低/中复杂度。

拆分不仅是质量优化，也是**成本优化**：三个小型子任务并行分发给三个 Sonnet Worker，其墙钟时间成本和总 token 成本都低于让一个 Worker 处理一份过大的任务说明（并行处理 + 聚焦的提示词 + 更少的重试）。

**Step 3b — 复杂度评估（与 3c 并行 · 依赖 3a）**

并行分发：
- `Searcher — LOC estimation: estimate change volume per sub-task against the batch graph`
- `Searcher — subsystem cross-cut check: verify each sub-task does not span > 1 subsystem boundary`

然后基于两个 Searcher 的输出分发 `**Reviewer** — validating complexity sizing`。如果任何子任务超过了过大任务阈值，且在 3a 中尚未拆分，Reviewer 将返回 `NEEDS_REVISION`，3b 会针对该缺口重新分发（而不是重新执行整个 Step 3）。

**Step 3c — 验收标准（与 3b 并行 · 依赖 3a）**

并行分发：
- `Writer — per-sub-task acceptance criteria: one concrete verifiable condition per sub-task`
- `Writer — verification hooks: map each criterion to a test file path or smoke step`

然后基于两个 Writer 的输出分发 `**Reviewer** — verifying acceptance criteria completeness`。`NEEDS_REVISION` 只会重新分发 3c。

### Step 4 — 编写任务文件（3 个子阶段 · P3 与 Step 6 并发）

**P3 — 并发分发：**Step 3 完成后，Step 4（任务文件）和 Step 6（记忆）彼此独立。在 Step 3 返回后，立即在同一条消息中分发两者。等待两者都完成后，再进入 Step 5。

**模式解析（每条链路仅执行一次）。**分发前，运行 `python3 $PLUGIN_ROOT/scripts/resolve-mode.py $PROJECT_ROOT --from-args "$CHAIN_ARGS"`，并通过链路参数将结果（`mode=<default|lean|thorough>`）传递给下游技能。当 `mode=lean` 时，对于小型任务（`triage.complexity == low` 且预计子任务数 ≤ 5），Writer 使用**产物格式最小模板**进行渲染——仅包含状态表、Goal、每个任务的行以及成本表。当任务子任务数超过 5 个，或任何子任务的 `complexity != low` 时，将自动恢复完整的丰富模板。无论模式如何，Persona 拼接、记忆注入、Reviewer 模型与模板、澄清关卡以及安全阻止列表均保持不变。

子阶段 4a 首先执行，用于确定章节编号和状态块。子阶段 4b 与 4c 彼此独立，在 4a 完成后并发运行。所有子阶段完成后，最终的逐 Step Reviewer 会根据完整设计检查组装完成的任务文件。

**Step 4a — Status + Goal + Why（首先顺序执行）**

并行分发：
- `Writer — status block: emit Status table, branch, commit cadence`
- `Writer — goal and why: draft the Goal one-liner and Why paragraph`

然后对两位 Writer 发送 `**Reviewer** — verifying status/goal/why section`，以核验状态/目标/原因部分。这些锚定部分必须在 4b/4c 可以引用它们之前完成。

**Step 4b — Scope + Affected files (parallel with 4c · depends on 4a)**

并行发送：
- `Writer — scope-at-a-glance table: surface, file counts, risk ratings`
- `Writer — affected-file listing: Created / Modified / Skipped with one-line purpose per path`

然后对两位 Writer 发送 `**Reviewer** — verifying scope coverage against Step 2 surface map`，以核验范围是否覆盖 Step 2 的界面映射。`NEEDS_REVISION` 只重新派发 4b。

**Step 4c — Execution plan + Batches + Verification (parallel with 4b · depends on 4a)**

使用 `--thorough` 时禁用（Writer 按顺序分轮起草各部分，而不是并行起草）。

并行发送：
- `Writer — execution plan and batches: ASCII batch graph + per-batch task checklist with role, files, complexity`
- `Writer — open questions and verification plan: any unresolved items + concrete smoke/test steps`

然后对两位 Writer 发送 `**Reviewer** — verifying execution plan matches Step 3 batch graph`，以核验执行计划是否与 Step 3 批次图匹配。`NEEDS_REVISION` 只重新派发 4c。

**Step 4 final verify.** 所有子阶段完成后，发送 `**Reviewer** — verifying assembled task file vs design`，以确认设计中的每项要求都至少对应一个子任务，并且不存在无对应设计要求的子任务。Writer 使用下面的模板将内容写入 `.hyperflow/tasks/<task-slug>.md`。

任务文件模板——遵循 [`artefact-format.md`](../hyperflow/artefact-format.md)。Writer 默认应用完整模板；只有在分类将 `complexity=low AND sub-tasks<=2` 判定为分诊类别时，才缩减为 `fast` 变体。

```markdown
# <Name>

## Status

| Field      | Value                                                 |
|------------|-------------------------------------------------------|
| Status     | pending                                               |
| Progress   | `░░░░░░░░░░░░░░░░░░░░`  0 / <total> sub-tasks (0%)    |
| Branch     | `<feat/slug or current branch>`                       |
| Commits    | 0 since main · per-task cadence                       |
| Wall-clock | not started                                           |
| Tokens     | thinking 0k · worker 0k · total 0k                    |

## Goal

<用通俗英语写的一行说明，描述交付此变更后会实现什么>

## Why

<一段话：该变更完成后用户 / 系统将看到什么；设计所遵循的最重要约束>

## Scope at a glance

| Surface       | Files | Created | Modified | Risk   |
|---------------|------:|--------:|---------:|--------|
| <surface>      |     N |       N |        N | low    |
| **Total**     |  **N**|    **N**|     **N**|        |

## Affected files

**Created (N)**
- `<path>` — <每个路径用途的一行说明>

**Modified (N)**
- `<path>` — <每个路径变更的一行说明>

**Skipped (confirmed N)** *(如果 N=0 则省略此部分)*
- `<path>` — <未修改该路径的原因>

## Execution plan

```
Batch 1 — <theme>                       (<N> parallel)
  T1 · T2 · T3 · T4
       ↓
Batch 2 — <theme>                       (<N> parallel · depends on Batch 1)
  T5 · T6 · T7
       ↓
Batch 3 — <theme>                       (<N> sequential)
  T8
       ↓
Batch N — Final integration review      (1 sequential)
  T<N>
```

## Batches

### Batch 1 — <theme> (<parallel|sequential>)

- [ ] T1 — <Role> · <一行任务说明>
       Read: `<file>` · Modify: `<file>` · Complexity: <low|medium|high>
- [ ] T2 — <Role> · <一行任务说明>
       Create: `<file>` · Complexity: <low|medium|high>

### Batch 2 — <theme> (depends on Batch 1)
...

## Open questions

None. *(or numbered list if any remain)*

## Verification plan

1. <具体测试或 smoke 步骤>
2. <具体测试或 smoke 步骤>

## Estimated cost

| Tier      | Agents | Tokens   |
|-----------|-------:|---------:|
| Thinking  |      N |     ~Nk  |
| Worker    |      N |     ~Nk  |
| **Total** |  **N** | **~Nk**  |
```

Status 块在每个子任务 PASS 后由 dispatch 更新 — 参见 dispatch/SKILL.md 步骤 2。进度条使用 20 个单元格：已完成使用 `█`，待处理使用 `░`；百分比四舍五入为整数。墙上时钟从首次分派 worker 时开始计时；当完成的子任务数 ≥ 3 时计算 ETA（根据已完成任务的平均值进行线性外推）。

### 步骤 5 — 输出

打印任务文件路径和批次摘要表：

```
计划就绪 — .hyperflow/tasks/<slug>.md（3 个批次，7 个子任务）
```

### 步骤 6 — 记忆（P3 与步骤 4 并发）

Agents — `Writer`（Sonnet）⇒ **Reviewer**（Opus）。

**P3 — 并发分派：** 此步骤与步骤 4 并行执行（见上方步骤 4）。两位 Writer 都接收 Planner 的输出，并且彼此独立 — 记忆 Writer 不需要先写入任务文件，任务文件 Writer 也不需要先更新记忆。两者都必须在步骤 5 输出前完成。

1. 分派 `Writer — appending decisions to .hyperflow/memory/decisions.md`（与步骤 4 的 Writer — P3 并行）。琐碎事项跳过。对于复杂功能（3 个以上文件、多个子系统），Writer 还会生成 `.hyperflow/specs/<feature-slug>.md`，并由任务文件引用。
2. 分派 `**Reviewer** — checking memory entries`，在记忆条目写入 `.hyperflow/memory/` 前检查其是否与现有条目重复或矛盾。

**P3 原理：** 任务文件和记忆条目都源自 Planner 的批次图，但彼此不相互依赖。并发运行可以从流程中省去一轮串行 Writer 往返。参见 [`../spec/references/latency-patterns.md`](../spec/references/latency-patterns.md) §P3。

参见 [task-tracking.md](references/task-tracking.md) 和 [worker-prompt.md](references/worker-prompt.md)。

### 步骤 7 — 交接给 `/hyperflow:dispatch`

根据 §12.1，此步骤属于简单内联操作：调用一次 Skill 工具，不需要生成内容，也不需要审查。编排器直接调用 dispatch skill，不使用 Agent 分派包装器。

**如果 `chain-mode=auto`** — 立即调用 `Skill`，参数为 `skill: dispatch` 和 `args: "chain-mode=auto <task-slug>"`。打印：

```
自动链式调用 /hyperflow:dispatch…
```

**如果 `chain-mode=manual`** — 通过 `AskUserQuestion` 询问："计划已完成。是否继续执行 /hyperflow:dispatch？" → 是 / 否 / 停止。若选择是，则调用 `Skill`，参数为 `skill: dispatch` 和 `args: "chain-mode=manual <task-slug>"`。

## 反模式

- 编写实现代码
- 修改 `.hyperflow/` 和 `.hyperflow/specs/` 之外的源文件
- 跳过研究步骤
- 对多文件工作使用单批次计划
- 省略验证计划
- 当 `chain-mode=auto` 时暂停询问“是否执行？” — 这已在步骤 0 中得到回答
- 传入 `chain-mode=<…>` 参数后再次询问链模式问题

## 概述

`/hyperflow:scope` 将足够明确的任务分解为分批 worker 计划，并将其写入 `.hyperflow/tasks/<slug>.md`。并行 Sonnet 搜索者负责梳理受影响范围，Opus Planner 生成批次图，Sonnet Writer 输出任务文件。相对于源代码为只读 — 只会写入 `.hyperflow/tasks/`、`.hyperflow/memory/` 和 `.hyperflow/specs/`。完成后，自动链式调用 `/hyperflow:dispatch`（或者在 `chain-mode=manual` 时先询问）。

## 前置条件

- 对要构建的内容有足够清晰的描述。如果存在歧义，scope 将重定向到 `/hyperflow:spec` 并停止。
- `.hyperflow/` 缓存（推荐 — 可改善规划上下文）。如果缺少，请先运行 `/hyperflow:scaffold`。
- 可选：通过 `chain-mode` 参数传入之前的 `/hyperflow:spec` 输出，以传递 triage 分类和建议的流程配置。

## 指令

编号步骤位于上方的[步骤 0 — 选择链模式](#step-0--choose-chain-mode-first-tool-call--structural-gate)至[步骤 7 — 交接给 /hyperflow:dispatch](#step-7--hand-off-to-hyperflowdispatch)之间。摘要：

1. 如果之前的 chain-starter 未传递 `chain-mode`，则询问 `chain-mode`（auto / manual）。
2. 确认任务可构建，而不是设计问题（否则交接给 `/hyperflow:spec`）。
3. 步骤 2 的子阶段（2a 表面映射、2b 语义索引、2c 约定扫描）并行执行。
4. 步骤 3a Opus Planner 生成批次图；Sonnet Reviewer 验证拆解结果；3b/3c（复杂度评估、验收标准）在 3a 之后并行执行。
5. 步骤 4 的子阶段（4a 状态/目标/原因，然后 4b 范围/文件 ∥ 4c 执行/验证）生成 `.hyperflow/tasks/<slug>.md`；最终 Reviewer 根据设计验证计划。
6. 将决策追加到 `.hyperflow/memory/decisions.md`（与步骤 4 并发 — P3）。
7. 交接给 `/hyperflow:dispatch`（自动执行或通过确认门控）。

## 输出

单行输出加任务文件路径：

```
Plan ready — .hyperflow/tasks/<slug>.md (N batches, M sub-tasks)
Auto-chaining to /hyperflow:dispatch...
```

写入的任务文件遵循[步骤 4](#step-4--write-task-file)中的模板 — 目标、上下文、受影响的文件、批次（带有 `[ ]` 复选框）、待解决问题、验证计划、预计成本、状态块。

## 错误处理

| 失败 | 行为 |
|---|---|
| 请求存在歧义（需要进行设计探索） | 停止并建议使用 `/hyperflow:spec`。打印：`This needs design exploration first. Try /hyperflow:spec`，然后退出。 |
| Searcher 返回空结果（未找到受影响的文件） | Reviewer 标记范围缺失；使用更宽泛的查询重新分派。最多重试 2 次。 |
| Planner 为多文件工作生成单批次计划 | Reviewer 拒绝；向 Planner 重新分派，并反馈需要拆分为并行批次和顺序批次。 |
| 任务文件写入失败（路径被锁定、磁盘已满） | 输出明确错误并中止；不要自动链式执行。用户修复后重试。 |
| `chain-mode` 参数格式错误 | 拒绝并通过 `AskUserQuestion` 重新询问。绝不静默使用默认值。 |
| Codex 中的 `AskUserQuestion` 弹窗不可用 | 将门控作为 `Hyperflow Question` 聊天块打印出来，并等待用户回答。 |
| 完全没有交互通道 | 打印错误，说明无法触发 chain-mode 门控；退出。 |

## 示例

### 直接调用（首先询问 chain-mode）

```
/hyperflow:scope add a rate-limit middleware: token bucket, per-IP, env-configurable

?  How should I advance through the chain after this phase?
   Auto (Recommended)  — chain forward through scope → dispatch with no gate.
   Manual              — pause between phases and ask before advancing.

[user picks Auto]

Step 2a: Searcher — glob discovery · Searcher — import-graph traversal → **Reviewer**
Step 2b: Searcher — type-system probe · Searcher — symbol-graph probe → **Reviewer**
Step 2c: Searcher — test patterns and lint config → **Reviewer**
Step 3a: **Planner** — producing batch graph → **Reviewer** — validating decomposition completeness and batch boundaries
Step 3b: Searcher — LOC estimation · Searcher — subsystem cross-cut check → **Reviewer**
Step 3c: Writer — acceptance criteria · Writer — verification hooks → **Reviewer**
Step 4a: Writer — status block · Writer — goal and why → **Reviewer**
Step 4b: Writer — scope-at-a-glance · Writer — affected-file listing → **Reviewer**
Step 4c: Writer — execution plan and batches · Writer — open questions and verification → **Reviewer**
**Reviewer** — verifying assembled task file vs design
Writer — appending decisions to .hyperflow/memory/decisions.md
**Reviewer** — checking memory entries

Plan ready — .hyperflow/tasks/rate-limit-middleware.md (3 batches, 7 sub-tasks)
Auto-chaining to /hyperflow:dispatch...
```

### 从 spec 传递而来（无 chain-mode 提示）

```
[Invoked from /hyperflow:spec with args: chain-mode=auto triage=<base64>]

Searcher — mapping affected files
...
Plan ready — .hyperflow/tasks/<slug>.md (2 batches, 4 sub-tasks)
Auto-chaining to /hyperflow:dispatch...
```

### 存在歧义时返回 spec

```
/hyperflow:scope should we switch to event sourcing?

This needs design exploration first. Try /hyperflow:spec — it'll ask the
right questions before any decomposition happens.
```

## 资源

- [DOCTRINE.md](references/DOCTRINE.md) — 编排规则（第 7 层任务模板、规则 8 结构闸门）。
- [task-templates.md](references/task-templates.md) — CRUD、API、UI、迁移、重构、错误修复模板。
- [task-tracking.md](references/task-tracking.md) — 任务文件格式和生命周期。
- [worker-prompt.md](references/worker-prompt.md) — dispatch 将注入每个 Sonnet worker 的内容。
- [output-style.md](references/output-style.md) — 代理标签格式。
- [../spec/references/latency-patterns.md](../spec/references/latency-patterns.md) — P1–P5 延迟模式定义、墙上时钟影响表以及 `--thorough` 禁用规则。