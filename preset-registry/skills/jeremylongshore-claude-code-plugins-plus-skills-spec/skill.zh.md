---
name: spec
description: |
  Use when the user is exploring a design idea, weighing approaches, or has an ambiguous request. Asks structured questions, proposes 2-3 approaches, walks the design section-by-section. On approval, auto-chains into /hyperflow:scope.
  Trigger with /hyperflow:spec, "should I", "how should we", "what's the best way to", "design this", "explore the approach".
allowed-tools: Write, AskUserQuestion
argument-hint: "<design question or feature idea> [chain-mode=auto|manual] [--thorough | depth=max]"
version: 3.1.2
license: MIT
compatibility: Designed for Claude Code
tags: [design, brainstorming, planning, multi-agent]
---
# 规范

此阶段是**思考，而非构建**。在用户批准设计之前不得编写代码。获得批准后，链条将推进至 `scope` → `dispatch`。用户在步骤 0 选择推进模式。

此技能根据原则驱动**第 0.5 层（任务分诊）**和**第 4 层（头脑风暴/规范）**。多层级审查（L1–L5）将在 `/hyperflow:dispatch` 期间，根据分诊所选的流程配置文件于后续运行。

## 铁律

- **故障恢复（规则 14）。** 所有已派发代理（Classifier、Triage Reviewer、Searchers、Writers、Analyst、批量 Reviewer）中的 Worker 错误、格式错误的输出、NEEDS_REVISION 裁决以及 Reviewer 错误，均遵循 [`skills/hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md) 中的规范策略。重试 → 升级 → 中止。链条预算：3 次累计中止。

## 每步骤代理映射（DOCTRINE 规则 12）

根据 DOCTRINE 规则 12，每个实质性步骤都至少派发一个 Agent。根据 §12.1，琐碎步骤可由编排器内联执行。

| 步骤 | 子阶段 | Worker 层级 | 思考层级 | 备注 |
|---|---|---|---|---|
| 0 — 链条模式 | —（原子） | — | — | 仅 `AskUserQuestion`（豁免） |
| 0.5 — 操作选择 | —（原子） | — | — | 仅 `AskUserQuestion`（豁免） |
| 1 — 分诊 | —（原子） | — | **Classifier**（Opus）· **Triage Reviewer**（Sonnet） | 根据 §12.2.8 为原子操作：单个 Worker → Reviewer 配对，无独立视角。Reviewer 裁决：`PASS` / `RECLASSIFY` / `ESCALATE`（DOCTRINE 规则 15）。在 P4 条件下跳过；见正文 |
| 2 — 上下文探索 | 2a + 2b（P1 并行） | 每个子阶段 Searcher ×2 [P3 与步骤 1 并发] | 每个子阶段 **Reviewer**（Sonnet） | P3：步骤 1+2 在同一条消息中派发；不在步骤层级进行覆盖范围 Reviewer 审查（D4） |
| | 2a — 代码库表面映射 | Searcher ×2（glob 发现 + 依赖关系图） | **Reviewer**（Sonnet） | 与 2b 并行 |
| | 2b — 约定与测试模式扫描 | Searcher ×2（测试模式探测 + lint/config 扫描） | **Reviewer**（Sonnet） | 与 2a 并行 |
| 3 — 多维分析 | 3a + 3b + 3c（P1 并行） | 每个子阶段 Writer ×1–2 | 每个子阶段 **Reviewer**（Sonnet）+ **Analyst**（Opus）最终综合 | 可在 P4 中跳过；`--thorough` 始终运行 |
| | 3a — 意图与技术契合度分析 | Writer ×2（用户意图视角 + 技术契合度视角） | **Reviewer**（Sonnet） | 与 3b 和 3c 并行 |
| | 3b — 范围、约束与风险分析 | Writer ×2（范围/约束视角 + 风险视角） | **Reviewer**（Sonnet） | 与 3a 和 3c 并行 |
| | 3c — 备选方案综合 | Writer ×1（单一规范聚合——无并行视角） | **Reviewer**（Sonnet） | 与 3a 和 3b 并行；单 Worker 的理由：仅有一组备选方案 |
| | 3d — Analyst 综合 | — | **Analyst**（Opus），将 3a + 3b + 3c 整合为统一的 6 维简报 | 顺序执行——依赖于 3a + 3b + 3c 全部 `PASS` |
| 4 — 智能问题 | —（原子） | — | — | 仅 `AskUserQuestion`（豁免）· 始终至少：2 个 · 飞行前检查 `.hyperflow/memory/project-decisions.md`，以跳过已回答的问题 |
| 5 — 需求综合 | —（原子） | Writer（Sonnet） | **Reviewer**（Sonnet · 与步骤 6 批量处理） | 原子操作：单一规范的一段式重述；无独立视角 |
| 6 — 方法提案 | 6a + 6b（顺序执行；P3 与步骤 5 并发） | 每个子阶段 Writer ×2 | **Reviewer**（Sonnet · 覆盖步骤 5+6 的批量处理） | 可在 P4 中跳过；6b 依赖于 6a |
| | 6a — 方法候选方案起草 | Writer ×2（轻量级方法视角 + 重量级方法视角） | **Reviewer**（Sonnet） | 与步骤 5 并行；在 6b 之前顺序执行 |
| | 6b — 权衡与契合度评估 | Writer ×2（契合度分析视角 + 风险分析视角） | **Reviewer**（Sonnet） | 在 6a 之后顺序执行；依赖于 6a 候选方案作为输入 |
| 7 — 设计章节 | 7a + 7b + 7c（P1 并行） | 每个子阶段 Writer ×1–2 [P1] | **Reviewer**（Sonnet · 按批次）覆盖子阶段聚合结果 [P2] | 在完整批次审查后设置一个合并的用户关卡 |
| | 7a — 结构章节（Architecture + Data flow） | Writer ×2（Architecture Writer + Data flow Writer） | **Reviewer**（Sonnet） | 与 7b 和 7c 并行 |
| | 7b — 决策章节（Key decisions + Edge cases） | Writer ×2（Key decisions Writer + Edge cases Writer） | **Reviewer**（Sonnet） | 与 7a 和 7c 并行 |
| | 7c — 文件结构章节 | Writer ×1（单一规范章节——无并行视角） | **Reviewer**（Sonnet） | 与 7a 和 7b 并行；单 Worker 的理由 |
| 8 — 规范定稿 | —（原子） | Writer（Sonnet） | **Reviewer**（Opus · 最终审查层级） | 原子操作：单一规范的最终定稿；无独立视角 |
| 9 — 移交 | —（原子） | — | — | Skill 工具调用——根据 §12.1 作为琐碎操作内联执行（一次工具调用、无生成、无审查） |

实质性步骤 = 1、2、3、5、6、7、8。每个步骤都会出现在使用摘要中。  
分解为子阶段的步骤（12.2）：2（→ 2a、2b）、3（→ 3a、3b、3c）、6（→ 6a、6b）、7（→ 7a、7b、7c）。  
原子豁免步骤（12.2.8）：0、0.5、4、9（AskUserQuestion / 单次 Skill 调用）；1（单次 Classifier，无角度）；5（单次规范综合）；8（单次规范最终化）。

## 审批门

| 门 | 时机 | 格式 |
|---|---|---|
| 链模式 | 步骤 0，每条链一次 | `AskUserQuestion` — 自动 / 手动 |
| 设计部分审批 | 步骤 7，批量审查后设置一个组合门 | `AskUserQuestion` — 按部分批准 / 修改 |
| 阶段推进（如果是 `manual` 模式） | 步骤 9，在调用 `scope` 之前 | `AskUserQuestion` — 继续 / 停止 |

## 流程

### 步骤 0 — 选择链模式（第一次工具调用 · 结构性门）

根据 DOCTRINE 规则 8，这是一个**结构性门**。每次直接调用该 skill 时都必须触发。 “不提澄清问题”/“自动驾驶”/“始终启用”/任何其他自主性指令都**不会**跳过它。智能体必须在此处调用 `AskUserQuestion`——不询问便默认使用 `auto` 属于违反规约。

如果调用时带有 `chain-mode=<auto|manual>` 参数（来自链中的前一个 skill），则跳过此步骤——之前的链启动器已经询问过。

否则，在进行任何研究、分类或分析**之前**，通过 `AskUserQuestion` 提问。根据 DOCTRINE 规则 8，推荐选项放在第一项，并附带 `(Recommended)`：

```
How should I advance through the chain after each phase?

  Auto (Recommended)  — chain forward through spec → scope → dispatch with no gates.
                        Fewer interruptions, faster end-to-end.

  Manual              — pause between phases and ask before advancing.
                        More control, more confirmations.
```

`Auto` 是推荐的默认选项，因为启动链的大多数用户都希望保持推进势头；`Manual` 适用于高风险或探索性工作。等待用户回答。未得到回答前不要继续。保存所选模式，并通过 `args: "chain-mode=<mode>"` 传递。

如果智能体无法将 `AskUserQuestion` 呈现为弹窗，则使用 Codex 备用方案：以带编号选项的 `Hyperflow Question` 聊天块打印相同的门，然后停止并等待用户回答。如果完全没有可用的交互渠道，则打印错误并停止——绝不能静默默认。

### 步骤 0.5 — 操作选择（仅自动模式 · 结构性门 · 紧接步骤 0 触发）

当用户在步骤 0 选择 `Auto`，且操作参数（`commit=`、`branch=`、`push=`）尚未传递时，调用一次 `AskUserQuestion`，提出 3 个问题，涵盖该链所需的所有操作决策。完成这一批提问后，链将静默运行，直到链末审计和部署门——用户在启动时恰好被打断两次（步骤 0 的链模式、步骤 0.5 的操作选择），之后直到完成前不再被打断。

当 `chain-mode=manual` 时跳过（每个阶段的暂停会覆盖操作决策），或者操作参数已经传递时跳过（重新询问属于人为臆造的门）。

这 3 个问题的批次与 scope Step 0.5 完全相同——完整的问题文本、选项文本、推荐默认值逻辑以及链式参数传播契约，请参见 [scope/SKILL.md § Step 0.5](../scope/SKILL.md#step-05--operational-choices-auto-mode-only--structural-gate--fires-immediately-after-step-0)。Spec、scope、dispatch 共用一个规范定义；谁先触发（通常是作为链入口的 spec）谁就负责该批次，其他组件会看到已传播的参数并跳过。

**`--thorough` / `depth=max` flag：** 传入该标志时，禁用模式 P1、P2 和 P4，运行原始的顺序流程（一次一个 Writer、每个 section 一个 Reviewer、所有步骤始终运行）。P3 和 P5 保持启用——它们不会带来质量权衡。在 Step 0 记录该标志并向后传播；下面每个引用 P1、P2 或 P4 的步骤，在应用相应模式之前都应检查该标志。

### Steps 1+2 — 分诊与上下文探索（P3 — 并发 dispatch）

**P3 applies：** Step 1（Classifier 分诊）和 Step 2（Searcher 上下文映射）相互独立——Searcher 无需等待分诊输出即可开始。通过一条消息同时 dispatch 两者，然后等待两者都返回后再进入 Reviewer。

**If `--thorough` / `depth=max`：** 先运行 Step 1（等待其完成），然后按顺序运行 Step 2。

#### Step 1 — 分诊（Layer 0.5）

Agents — **Classifier**（Opus, thinking-tier）。

根据 [task-triage.md](references/task-triage.md) dispatch `**Classifier** — triaging request`。Classifier 生成 `{ types[], complexity, risk, scope, ambiguity, flow, personas[] }` JSON。该分类结果用于：

- **P4 gate** — 在此处读取 `ambiguity` 和 `complexity`；由分诊驱动的跳过逻辑应用于 Step 3 和 Step 6（见下文）
- **Spec depth** at Step 4 — **floor: 2 questions always**：
  - `ambiguity 0.0–0.5` → light：**2 questions**
  - `0.5–0.8` → standard：**3 questions**
  - `0.8–1.0` → deep：**4–5 questions**
- **Flow profile** for the downstream `dispatch` phase — `fast`、`standard`、`deep`、`research`、`creative` 或 `scientific`（参见 [flow-profiles.md](references/flow-profiles.md)）
- **Persona stitching** for worker prompts later（完整 personas 定义于 DOCTRINE）

持久化分诊输出，并通过 `chain-mode=<mode> triage=<base64-json>` args 向后传播。输出：

```
**Classifier** — triaging request  [concurrent with Searcher]
Triage — types: [<types>] · flow: <profile> · ambiguity: <score>
```

##### Triage Reviewer（DOCTRINE rule 15）

**P4 skip（DOCTRINE §13.P4）：** 在 dispatch 之前检查 Classifier 的输出。如果以下条件**全部**满足——`triage.complexity == low`、`triage.ambiguity < 0.2`、`triage.scope ∈ {0-file, 1-file}`、`triage.risk != high`——则完全跳过 Triage Reviewer，并直接使用 Classifier 输出。输出：

```
Triage Reviewer skipped (P4: low complexity + low ambiguity + single-file scope). Direct triage consumed.
```

然后继续 Step 2。在这一置信度层级，误分类成本受小任务 token 预算限制，并低于 Reviewer 约 2k token 的成本。

如果任何条件未通过，请按如下方式调度 Triage Reviewer。

Classifier 返回后立即调度 `**Triage Reviewer** — validating classification against request and project profile`（Sonnet）。Reviewer 阅读：
- 用户的原始请求（分类是否反映了用户实际提出的需求？）
- `.hyperflow/profile.md`（分类是否符合代码库实际使用的技术栈和约定？）

判定结果 ∈ {`PASS`、`RECLASSIFY`、`ESCALATE`}：

- **`PASS`** — 原样采用 Classifier 的输出，继续执行第 2 步。
- **`RECLASSIFY`** — Reviewer 返回修正后的分类及其理由；编排器使用修正后的版本，并打印一行：
  ```
  Triage reclassified: complexity high → medium · personas added: [security]
  ```
- **`ESCALATE`** — Reviewer 无法作出决定；将该歧义添加到第 4 步的 Smart Questions 队列中（作为该组问题中的第一个问题）。

如果 Reviewer 出错（工具失败、超时）：遵循 [failure-recovery.md](../hyperflow/failure-recovery.md) §5——重试一次，提升层级，然后以 `REVIEWER_ABORT: triage-reviewer` 中止。不要采用未经验证的分诊输出。

调度前打印：
```
**Triage Reviewer** — validating classification against request and project profile
```

#### 第 2 步——上下文探索

**子阶段 2a 和 2b 并行调度（P1）。** 两个子阶段彼此独立，不共享数据依赖。通过一条消息同时调度两者，等待所有 Searcher 返回，然后运行各子阶段的 Reviewer，再继续后续流程。

不设置 Step 级别的 coverage Reviewer——如果遗漏了任何内容，下游 Writer 会标记 `MISSING CONTEXT: <subsystem>`。

**回退方案：**如果下游 Writer 标记了 `MISSING CONTEXT: <subsystem>`，编排器会在继续之前，带着该缺口重新调度 Searcher。这样用较小的坏情况路径代价，换取较大的好情况路径收益。

##### 第 2a 步——代码库表面映射

代理——`Searcher` ×2（Sonnet）。

并行调度：
- `Searcher — glob discovery: mapping file tree and entry points relevant to <idea>`
- `Searcher — dependency graph traversal: tracing import paths and module dependencies`

不要询问用户你可以在代码中找到的信息。相信 Searcher 的输出。

两个 Searcher 返回后：`**Reviewer** — reviewing surface mapping coverage (Step 2a)`（Sonnet · 每个子阶段一个）。判定结果 ∈ {`PASS`、`NEEDS_REVISION`、`ESCALATE`}。如果为 `NEEDS_REVISION`：仅针对第 2a 步重新调度 Searcher，并提供已识别的缺口。

##### 第 2b 步——约定和测试模式扫描

代理——`Searcher` ×2（Sonnet）。

并行调度（与第 2a 步同时进行）：
- `Searcher — test pattern probe: finding existing test conventions, helpers, and fixture patterns`
- `Searcher — lint and config scan: reading project config, lint rules, naming conventions`

两个 Searcher 返回后：`**Reviewer** — reviewing convention scan completeness (Step 2b)`（Sonnet · 每个子阶段一个）。判定结果 ∈ {`PASS`、`NEEDS_REVISION`、`ESCALATE`}。如果为 `NEEDS_REVISION`：仅重新调度第 2b 步的 Searcher。

### 第 3 步 — 多维度分析（P4 可跳过）

**P4 门控条件：** 如果 `triage.ambiguity < 0.6 AND triage.complexity != high`，则完全跳过此步骤——直接进入第 4 步。没有需要分析的歧义，6 维简报不会带来额外价值。边界取整规则：**向上取整**——如果 ambiguity 为 0.59，则按 0.6 处理并运行此步骤。犹豫不决时，倾向于运行可选步骤。

**如果使用 `--thorough` / `depth=max`：** 无论 triage 分数如何，始终运行此步骤。

如果未跳过：**子阶段 3a、3b 和 3c 并行调度（P1）。** 每个子阶段分派两个 Writer 角度，探索分析的不同维度。所有子阶段 Reviewer 返回后，Analyst（Opus）将这些维度简报汇总为统一的 6 维输出，供第 4 步使用。

#### 第 3a 步 — 意图与技术适配性分析

代理 — `Writer` ×2（Sonnet）。

并行调度：
- `Writer — user-intent analysis: what is the real underlying need and what success looks like`
- `Writer — technical-fit analysis: how this fits the existing architecture and patterns from Step 2 context`

两位 Writer 返回后：`**Reviewer** — reviewing intent and fit analysis (Step 3a)`（Sonnet · 每个子阶段一个）。判定结果 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。如果为 `NEEDS_REVISION`：仅重新调度第 3a 步的 Writer。

#### 第 3b 步 — 范围、约束与风险分析

代理 — `Writer` ×2（Sonnet）。与第 3a 步和第 3c 步并行调度。

并行调度：
- `Writer — scope and constraints analysis: minimum viable vs maximum scope, time/deps/perf/compatibility limits`
- `Writer — risks analysis: what could go wrong, what is irreversible, failure modes`

两位 Writer 返回后：`**Reviewer** — reviewing scope, constraints, and risks analysis (Step 3b)`（Sonnet · 每个子阶段一个）。判定结果 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。如果为 `NEEDS_REVISION`：仅重新调度第 3b 步的 Writer。

#### 第 3c 步 — 方案综合

代理 — `Writer` ×1（Sonnet）。与第 3a 步和第 3b 步并行调度。

`Writer — alternatives synthesis: at least 3 distinct ways to solve this, with brief notes on each`（顺序综合——不采用并行角度：提供一组规范的方案，而不是两个相互独立的视角）

Writer 返回后：`**Reviewer** — reviewing alternatives completeness (Step 3c)`（Sonnet · 每个子阶段一个）。判定结果 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。如果为 `NEEDS_REVISION`：仅重新调度第 3c 步的 Writer。

#### 第 3 步汇总 — Analyst 综合（顺序执行——依赖 3a、3b、3c 全部为 `PASS`）

`**Analyst** — 6-dimension aggregation: consolidating sub-phase briefs into unified analysis`（Opus · 思考层级）。Analyst 读取 3a、3b 和 3c 的 Writer 输出，并生成最终的 6 维简报，同时标记哪些维度存在需要用户解决的未知项。这些未知项将成为第 4 步的问题集。

### 第 4 步 — 智能提问（`AskUserQuestion` — 强制执行 · 下限 2）

#### 预检记忆化检查

在生成问题列表之前，如果 `.hyperflow/memory/project-decisions.md` 存在，则读取该文件。此文件保存项目中先前链记录的结构性答案（例如 `"database: Postgres + Drizzle"`、`"auth: session cookies, not JWT"`、`"test framework: vitest"`）。

对于 Step 3 中的每个候选问题（如果跳过了 Step 3，则使用分流 + 上下文中的候选问题）：

- 如果答案已经存在于 `project-decisions.md` 中，**并且**与当前任务的要求不冲突 → 跳过该问题并打印一行：
  ```
  Skipping question '<question topic>' — already answered in project-decisions.md: <answer>
  ```
- 如果缓存的答案与当前任务的要求**冲突**（例如，项目决定“no SSR”，但此任务明确需要 SSR）→ 仍将其作为 Smart Question 提出。措辞应为：“project-decisions.md 说明 X——此任务是否要改变这一点？”
- 如果 `project-decisions.md` 不存在，或没有匹配的条目 → 正常包含该问题。

跳过问题后，下面的 2-question floor 仍然适用。如果记忆机制消除了 floor 之上的所有候选问题，floor 问题仍必须提出。

使用 `AskUserQuestion` 工具。绝不能使用纯文本提问。询问 Step 3 中发现的未知事项（如果跳过了 Step 3，则询问分流 + 上下文中的未知事项）。

**硬性下限：每次 spec 运行至少提出 2 个问题**，无论分流结果有多确定。这两个最低限度的问题为用户提供了一个结构化的重新定向机会，然后才能运行任何分解流程。此下限不可协商——P4 的回跳到 scope 路径（如下所述）是唯一可以跳过 Step 4 的方式，并且该路径会直接退出 spec 阶段。在 spec 阶段内，绝不能跳过或减少到少于 2 个问题。

**P4 回跳门槛：** 如果 `triage.ambiguity < 0.4 AND triage.complexity == low`，则不要运行 Step 4——直接跳转到 `/hyperflow:scope`。打印：

```
That's clear enough to skip the design phase. Auto-chaining to /hyperflow:scope...
```

然后立即使用 `Skill` 并指定 `skill: scope`。这会将“足够明确，可以跳回 scope”的理想示例强制为硬性规则。

问题数量限制（运行 Step 4 时）：

- 轻量深度（ambiguity 0.0–0.5）——**恰好 2 个问题**
- 标准深度（0.5–0.8）——**3 个问题**
- 深度模式（0.8–1.0）——**4–5 个问题**

每次 `AskUserQuestion` 调用最多连续提出 2 个问题。

**多选项列表（3 个或更多选项）必须标记推荐选项；二选一列表（2 个选项）不得标记推荐选项**——遵循 DOCTRINE 规则 8 的二元门控条款。对于多选项问题，Step 3 中 Analyst 的主导假设（如果跳过了 Step 3，则使用分流阶段的主导假设）放在首位，并附加 `(Recommended)`；随后列出其他选项。用户可以选择任意选项——该标记仅用于提供指导，并非默认值。Step 7 中的分节审批门控（`Approve / Revise`）是二选一——不得添加标记。

问题类别（按顺序——深度为 N 时选择前 N 类）：

1. **意图澄清** — 确认真正目标（始终提问）
2. **约束发现** — 必须发生 / 不得发生什么（始终提问）
3. **假设质疑** — “你说的是 X，实际想表达的是不是 Y？”
4. **范围边界** — 哪些内容属于范围内，哪些不属于
5. **边缘情况立场** — 对非理想路径应采取多严格的处理方式

如果请求看起来“完全明确”——仍然要提问。前两个问题的存在，是为了让用户有机会发现 Agent 遗漏的错位。

示例结构（不要省略推荐标记）：

```
?  Where should auth state live?
   Server sessions (Recommended)  — revocable, refreshable, fits this project's DB conventions
   JWT stateless                  — simpler, no DB, harder to revoke
```

#### 收集完成后的记忆追加

用户回答完第 4 步的问题后，扫描答案中的结构性决策——包括关于数据库、身份验证、测试、部署、框架模式，或任何未来链路不应再次询问的项目级默认设置。对于每个结构性答案：

1. 将其追加到 `.hyperflow/memory/project-decisions.md` 中相应的类别标题下。如果文件不存在，则创建该文件。
2. 格式：
   ```markdown
   ## <Category>
   - <decision> (recorded <YYYY-MM-DD>, source chain: <task-slug>)
   ```
3. 不要追加临时性或特定任务的答案（例如，“此功能使用模态框”属于特定任务；“通过 Radix Dialog 实现模态框模式”则属于结构性决策，因为它确立了项目级的模态框方案）。

此写入操作是内联操作（编排器工具调用）——根据 §12.1，这属于简单操作，不需要派发 Agent。

### 步骤 5+6——需求综合与方案提议（P3 + P2）

**P3 适用：**步骤 5（综合撰写者）和步骤 6（第一子阶段 6a 的撰写者）都依赖步骤 4 的答案，但彼此不依赖。通过单条消息派发步骤 5 撰写者和步骤 6a 撰写者，然后继续执行 6b（依赖 6a 的输出），之后等待所有任务返回，再派发批量审查者。

**P2 适用：**步骤 5 撰写者以及步骤 6 的子阶段（6a + 6b）全部返回后，使用 `reviewer-prompt-batched.md` 派发一名审查者，在单次审查中同时审查两份草稿，并分别返回每份草稿的结论。

**如果使用 `--thorough` / `depth=max`：**依次执行步骤 5（撰写者 → 审查者），然后依次执行步骤 6 的子阶段（6a 撰写者 → 审查者，再执行 6b 撰写者 → 审查者）。

#### 步骤 5——需求综合

1. 派发 `Writer — drafting requirement synthesis`（与步骤 6 撰写者并发执行）。撰写者生成一段话的重述：“所以目标是 X，约束条件为 Y，不包括 Z。”
2. （在下方的批量审查中进行审查。）
3. 批量审查者批准后，打印综合结果，并通过 `AskUserQuestion` 请求明确确认，然后再继续。

#### 步骤 6——提议 2–3 个方案及其权衡（可由 P4 跳过）

**P4 门槛：**如果 `triage.ambiguity < 0.6 AND triage.complexity != high`，则跳过步骤 6——继续执行步骤 7，使用综合结果所隐含的默认方案。不触发方案选择门槛；编排器在规格说明中标注“方案：由综合结果推导（歧义程度低，单一方案）”。

**如果使用 `--thorough` / `depth=max`：**无论 triage 分数如何，都始终执行步骤 6。

如果未跳过：**子阶段 6a 和 6b 依次执行**——6b 依赖 6a 生成的候选方案。步骤 6 整体与步骤 5 并发执行（P3）。

##### 步骤 6a——候选方案撰写

Agents — `Writer` ×2 (Sonnet)。与步骤 5 撰写者并发派发（P3）。

并行调度：
- `Writer — lightweight-approach candidates: drafting 1–2 lower-complexity approaches for this problem`
- `Writer — heavyweight-approach candidates: drafting 1–2 higher-complexity or more thorough approaches`

每个 Writer 针对每种方法产出：**名称**（简短标签） · **内容**（1–2 句摘要） · **优点** · **缺点** · **适配度**（与目标/约束的匹配程度）。

两位 Writer 返回后：`**Reviewer** — reviewing approach candidate coverage (Step 6a)`（Sonnet · 按子阶段）。判定结果 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。如果为 `NEEDS_REVISION`：仅重新调度 Step 6a 的 Writers。

##### Step 6b —— 权衡与适配度评估（依赖 Step 6a 的输出）

Agents — `Writer` ×2（Sonnet）。在 Step 6a `PASS` 后按顺序执行。

并行调度：
- `Writer — fit analysis: scoring each 6a candidate against stated goals, constraints, and context from Step 2`
- `Writer — risk analysis: surfacing failure modes and irreversible consequences per 6a candidate`

两位 Writer 返回后：`**Reviewer** — reviewing trade-off evaluation completeness (Step 6b)`（Sonnet · 按子阶段）。判定结果 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。如果为 `NEEDS_REVISION`：仅重新调度 Step 6b 的 Writers。

**批量 Reviewer（P2）：** 在 Step 5 Writer 以及 Step 6 的子阶段（6a + 6b）全部返回后，调度一个 `**Reviewer** (Sonnet · per-batch tier) — batched review: synthesis + approaches`（`reviewer-prompt-batched.md`，`model: "<resolved-worker>"`）。根据 DOCTRINE 的层级划分，由于差异较小（一个综合段落 + 2–3 个方法段落），按批次 Reviewer 默认使用 Sonnet。`--thorough` 会升级为 Opus。Reviewer 返回：

```
§1 Synthesis:  PASS
§2 Approaches: NEEDS_FIX — [specific feedback]
```

如果任一草稿为 `NEEDS_FIX`：仅重新调度对应的 Writer（或失败的 Step 6 子阶段）；仅对该草稿进行一次 Opus 复审。通过的草稿直接接受。

批量 Reviewer 批准后：向用户展示综合内容和方法。推荐一种方法，但由用户做出选择。通过 `AskUserQuestion` 提问。

### Step 7 —— 按章节设计（P1 + P2 · 文件优先 · 一个合并门禁）

**文件优先工件规则（DOCTRINE 规则 8 的文件优先条款）：** 每个章节 Writer 都必须直接将其草稿写入 `.hyperflow/specs/<slug>.draft.md` —— 绝不将章节内容返回给编排器再以内联方式粘贴。Reviewer 从文件中读取章节。审批门禁引用文件路径，而不是内容。将章节文本内联粘贴到聊天中违反 doctrine —— 聊天输出是临时的且无法滚动查看；文件可供审阅、编辑，并可跨会话持久保存。

**P1 在子阶段层级生效：** 3 个子阶段共享相同的上游输入（选定的方法），彼此之间没有依赖关系。在一条并行消息中调度子阶段 7a、7b 和 7c。调度前，编排器预先使用 5 个 H2 标题初始化文件，以便各 Writer 能够以标题作为唯一锚点使用 `Edit`，从而避免追加顺序竞争。

**模式解析（每条链执行一次）。** 在调度 5 个 Writer 之前，运行 `python3 $PLUGIN_ROOT/scripts/resolve-mode.py $PROJECT_ROOT --from-args "$CHAIN_ARGS"`，并通过链参数传递结果（`mode=<default|lean|thorough>`）。当 `mode=lean` 时，Writer 按照 `worker-prompt.md` 的 lean 变体接收精简版 Project Context 区块（指向 `.hyperflow/memory/session-context.md` 等文件的路径，而不是内联内容）。无论模式如何，规范章节内容、2 个问题的最低要求、章节审批门槛、角色拼接、记忆注入、审查器模型与模板，以及安全阻止列表均保持不变。

**子阶段 7a、7b 和 7c** 按关注点对 5 个章节进行分组——结构（架构 + 数据流）、决策（关键决策 + 边界情况）以及文件布局——这样每个子阶段的 Reviewer 都能在最终批量审查之前发现组内冲突。

**每个子阶段的 Writer 返回后，立即启动该子阶段的 Reviewer**（不受其他子阶段是否完成的限制）。这样可以让较早子阶段中的遗漏在最终批量审查之前暴露出来。

**适用 P2：** 在全部 3 个子阶段完成后（所有子阶段 Reviewer 均返回 `PASS`），使用 `reviewer-prompt-batched.md` 调度一个最终的每批次 Reviewer（`model: "<resolved-worker>"` ——默认为 Sonnet；使用 `--thorough` 时为 Opus），读取 `.hyperflow/specs/<slug>.draft.md`，并在一次审查中审查全部 5 个章节，返回逐章节的判定：

```
§1 Architecture:   PASS
§2 Data flow:      NEEDS_FIX — [specific feedback]
§3 Key decisions:  PASS
§4 Edge cases:     PASS
§5 File structure: PASS
```

**跨章节一致性优势：** 批量 Reviewer 可以同时看到所有章节，从而发现逐子阶段审查遗漏的冲突（例如 §1 Architecture 与 §5 File structure 之间的矛盾）。

#### 步骤 7a ——结构章节（Architecture + Data flow）

Agents — `Writer` ×2（Sonnet）。与步骤 7b 和 7c 并行调度。

并行调度：
- `Writer — architecture section: drafting §1 Architecture at H2 anchor in .hyperflow/specs/<slug>.draft.md`
- `Writer — data flow section: drafting §2 Data flow at H2 anchor in .hyperflow/specs/<slug>.draft.md`

两个 Writer 返回后：`**Reviewer** — reviewing architecture and data flow sections (Step 7a)`（Sonnet · 子阶段审查）。判定 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。当判定为 `NEEDS_REVISION` 时：仅在步骤 7a 内重新调度失败的 Writer。

#### 步骤 7b ——决策章节（Key decisions + Edge cases）

Agents — `Writer` ×2（Sonnet）。与步骤 7a 和 7c 并行调度。

并行调度：
- `Writer — key decisions section: drafting §3 Key decisions at H2 anchor in .hyperflow/specs/<slug>.draft.md`
- `Writer — edge cases section: drafting §4 Edge cases at H2 anchor in .hyperflow/specs/<slug>.draft.md`

两个 Writer 返回后：`**Reviewer** — reviewing key decisions and edge cases sections (Step 7b)`（Sonnet · 子阶段审查）。判定 ∈ {`PASS`, `NEEDS_REVISION`, `ESCALATE`}。当判定为 `NEEDS_REVISION` 时：仅在步骤 7b 内重新调度失败的 Writer。

#### 步骤 7c — 文件结构部分

代理 — `Writer` ×1（Sonnet）。与步骤 7a 和 7b 并行调度（顺序合成 — 不采用并行角度：单一规范文件布局部分）。

`Writer — file structure section: drafting §5 File structure at H2 anchor in .hyperflow/specs/<slug>.draft.md`

Writer 返回后：`**Reviewer** — reviewing file structure section (Step 7c)`（Sonnet · 每个子阶段）。判定结果 ∈ {`PASS`、`NEEDS_REVISION`、`ESCALATE`}。如果为 `NEEDS_REVISION`：重新调度步骤 7c Writer。

**如果最终批量 Reviewer 返回 `NEEDS_FIX`：**仅重新调度失败部分的 Writer，并提供 Reviewer 的反馈；该 Writer 只重写草稿文件中其自身以 H2 为锚点的代码块。仅对该部分进行一次批次内层级复审（默认使用 Sonnet，与原批量评审使用相同层级）。不要重新起草通过评审的同级部分。

**特殊情况 — 4 个或更多部分为 NEEDS_FIX：**很可能是所选方案本身有误。返回步骤 6，重新选择方案，而不是逐个重新起草 4 个部分。

**资格检查：**之所以采用此 P1+P2 结构，是因为 5 个部分共享相同的评审级别上限。如果未来的流程为不同部分分配不同的评审级别上限（例如，一个部分需要 L5 安全评审，而其他部分为 L3），则对这些部分改用逐部分 Reviewer。

**如果使用 `--thorough` / `depth=max`：**依次处理每个部分 — (1) 调度 Writer（仍写入 H2 锚点处的文件），(2) 调度 Reviewer（读取文件），(3) 打印一行 `Section <N> ready — review at .hyperflow/specs/<slug>.draft.md` + `AskUserQuestion` 进行批准 / 修改，然后再进入下一个部分。

**Worker 速率限制处理 — 禁止内联回退：**如果 Writer 失败（速率限制、超时、运行时错误），编排器 MUST 重试 Writer（最多重试 2 次）；如果仍然失败，则显示 `ESCALATE: section-<N> writer failed after 2 retries — chain paused, run /hyperflow:status to inspect`。在聊天中将该部分作为“回退方案”内联起草违反文件优先规则，并会生成下游 Writer/Reviewer 在草稿文件中看不到的、缺乏依据的部分。

批量 Reviewer 批准后（或 `NEEDS_FIX` 的部分解决后），编排器发起一次合并的 `AskUserQuestion`。门控内容应为一行部分清单 + 文件路径 — 而不是部分内容：

```
?  Design draft ready at .hyperflow/specs/<slug>.draft.md
   §1 Architecture · §2 Data flow · §3 Key decisions · §4 Edge cases · §5 File structure
   Review the file, then choose:

   Approve all   — finalize and chain to /hyperflow:scope
   Revise §<N>   — send the named section back to the Writer with your feedback (free-form)
```

允许按部分修改 — 用户可以指定单个部分进行修改。只有被修改部分的 Writer 会重新循环；其余草稿文件内容保持不变。

部分（始终按此顺序）：

1. **架构** — 组件如何组合在一起
2. **数据流** — 数据从哪里流向哪里
3. **关键决策** — 做出了哪些权衡，以及原因
4. **边界情况** — 可能出现哪些问题
5. **文件结构** — 会创建 / 修改哪些内容

### 第 8 步 — 规范定稿

代理 — `Writer` (Sonnet) ⇒ **Reviewer** (Opus)。

保持串行执行 — 这是交接前的最终健全性检查；不适用并行处理。

草稿已位于 `.hyperflow/specs/<slug>.draft.md`（在第 7 步中逐步写入）。本步骤将按照 [`artefact-format.md`](../hyperflow/artefact-format.md) 对其进行定稿：

```markdown
# <Feature name>

## Status

| Field    | Value                                          |
|----------|------------------------------------------------|
| Status   | approved                                       |
| Sections | 5 / 5 approved                                 |
| Date     | <YYYY-MM-DD>                                   |
| Trigger  | `<slash command or trigger phrase>`            |
| Approach | <one-line approach name from Step 6>           |

## TL;DR

<2–3 sentences in plain English: what the feature does + the single
most important design decision. The user should be able to read this
and decide if the design is on track without scrolling further.>

## Components

- **<name>** — <one-line role>
- **<name>** — <one-line role>
...

## 1. Architecture

<section content — written progressively by Step 7 Writers at this H2 anchor>

## 2. Data flow

<section content>

## 3. Key decisions

<numbered decisions with rationale>

**Trade-offs accepted:**
- <what the design says yes to and why>

**Trade-offs rejected:**
- <what the design said no to and why>

## 4. Edge cases

<numbered cases with Scenario / Behaviour / Fallback>

## 5. File structure

### 5.1 Files created
| Path | Purpose | Created by |
|---|---|---|
| `<path>` | <one-line> | <agent or milestone> |

### 5.2 Files modified
| Path | Purpose | Created by |
|---|---|---|

### 5.3 Runtime artefacts (not committed)
| Path | Purpose | Created by |
|---|---|---|
```

定稿流程：

1. 向以下代理派发 `Writer — finalizing spec at .hyperflow/specs/<slug>.draft.md`：
   - 在开头添加状态块、TL;DR 和 Components 部分（TL;DR 根据第 5 步中已批准的综合内容提取；Components 根据第 1 节架构中的名称提取）。
   - 如果第 3 节末尾尚未包含 `Trade-offs accepted/rejected` 块，则添加这些块（Writer 从第 3 节的正文中提取；如果第 3 节 Writer 尚未将其单独列出）。
   - 重命名：`mv .hyperflow/specs/<slug>.draft.md .hyperflow/specs/<slug>.md`（使用普通的 `mv` — `.hyperflow/` 已被 gitignore）。
2. 派发 `**Reviewer** (Opus · final-pass tier) — final spec sanity check`（`model: "<resolved-thinking>"` — 始终使用 Opus，无论是否启用了 `--thorough`），让其读取最终文件并验证：状态块存在且正确，TL;DR 为 2–3 句简明英文（不是大段文字），每个已批准的章节均已纳入，H2 顺序正确（1–5），存在 Trade-offs 块，各章节之间不存在矛盾。Opus 层级是强制要求，因为这是唯一一个能够看到完整规范的 Reviewer，也是规范离开设计阶段前最终负责的检查环节。

**不提供内联摘要回退。** 即使是“简单”设计，规范也必须存放在文件中。仅在聊天中总结是早期版本中的一种违反原则模式；现已移除。

### 步骤 9 — 移交给 `/hyperflow:scope`

设计获批准后：

**如果 `chain-mode=auto`** — 立即调用 `Skill`，传入 `skill: scope` 和 `args: "chain-mode=auto <spec-ref>"`。输出：

```
Spec complete — design approved
Auto-chaining to /hyperflow:scope…
```

**如果 `chain-mode=manual`** — 通过 `AskUserQuestion` 提问："Spec done. Continue to /hyperflow:scope?" → yes / no / stop。选择 yes 后，调用 `Skill`，传入 `skill: scope` 和 `args: "chain-mode=manual <spec-ref>"`。输出：

```
Spec complete — design approved
Awaiting your go-ahead for /hyperflow:scope…
```

在两种模式下，`scope` skill 都会将设计分解为 worker 批次；随后 `dispatch` 会接手任务文件（遵循相同的链式模式）。

## 反模式

- 在规范阶段编写代码
- 总共提问超过 5 个问题（步骤 0 的链式模式问题不计入）
- **提问少于 2 个问题** —— 即使请求看起来没有歧义，也必须满足最低数量
- 在一次 `AskUserQuestion` 调用中堆叠 3 个或更多问题
- 跳过备选方案步骤（始终提供 2–3 个），除非启用了 P4 跳过
- 询问可以从代码库中发现的信息
- 添加用户未请求的功能（严格遵循 YAGNI）
- 在 `chain-mode=auto` 时暂停询问“是否应该继续制定计划？”——这在步骤 0 中已经回答过了
- **在没有相互依赖的情况下将同级步骤串行化** —— 步骤 1+2、步骤 5 Writer + 步骤 6a Writers、步骤 7 的子阶段 7a/7b/7c，以及步骤 3 的子阶段 3a/3b/3c，在各自组内都是相互独立的；当适用 P3/P1 时逐个调度会造成延迟违规
- **在单个批处理 Reviewer 已覆盖相同审查级别上限的情况下使用按章节划分的 Reviewer** —— 将 N 次 Opus 调用合并为 1 次可以提升跨章节的一致性并降低延迟；只有当同级步骤具有不同的级别上限时，才回退到按章节划分的 Reviewer
- **将一次 Skill 调用的移交（或任何 §12.1 中定义的琐碎步骤）包装在 Agent 调度中** —— 琐碎步骤（≤ 2 次工具调用、无生成、无决策、可机械验证、符合编排器执行方式）应内联运行；添加 Agent 包装只会增加延迟，不会带来质量收益

## 记忆集成

设计获批准后：
- 将关键决策持久化到 `.hyperflow/memory/decisions.md`，并添加标签
- 发现的陷阱 → `.hyperflow/memory/pitfalls.md`

## 概览

`/hyperflow:spec` 是设计阶段——思考，而不是构建。在用户逐节批准设计部分之前，不得提交任何代码。

Opus Classifier 和步骤 2 的 Searcher 并发运行（P3）。步骤 2 分解为子阶段 2a（界面映射，Searcher ×2）和 2b（约定与测试模式扫描，Searcher ×2），每个子阶段各配备一个 Sonnet Reviewer。步骤级别的 coverage Reviewer 不存在——下游 Writer 会通过 `MISSING CONTEXT` 暴露缺口。Opus Analyst 根据步骤 3 的子阶段 3a/3b/3c 生成六维分析（当歧义度 < 0.6 且复杂度 != high 时，可按 P4 跳过）。编排器通过 2–5 次 `AskUserQuestion` 调用（一次一个）来解决歧义。

第 6 步的方案提议拆分为子阶段 6a（方案候选，Writer ×2）和 6b（权衡评估，Writer ×2）。第 7 步的设计章节拆分为子阶段 7a（架构 + 数据流）、7b（关键决策 + 边界情况）和 7c（文件结构），全部并行调度（P1），每个子阶段配备一个 Sonnet Reviewer，随后由一个最终批处理 Reviewer 进行审查（P2）。最终批准后，自动串联到 `/hyperflow:scope` → `/hyperflow:dispatch`。

## 前置条件

- 已通过 `/hyperflow:scaffold` 初始化项目（推荐——分析员会使用 `.hyperflow/profile.md` 及相关文件）。
- 一个想法、功能请求或设计问题——任何模糊到需要探索的内容。明确的分解应直接跳转到 `/hyperflow:scope`。
- `AskUserQuestion` 可用——2-5 个规格问题 + 每个章节的批准门控都需要使用它。无头 / 非交互模式会在第 0 步被拒绝。

## 指令

编号为 10 的步骤位于上方的[第 0 步——选择链模式](#step-0--choose-chain-mode-first-tool-call--structural-gate)至[第 9 步——交接给 /hyperflow:scope](#step-9--hand-off-to-hyperflowscope)之间。摘要如下：

1. 询问 `chain-mode`（auto / manual）——结构门控，每次直接调用时都会触发。如果存在 `--thorough` / `depth=max` 标志，则记录下来。
2. 并发执行第 1 步（分类器）和第 2 步（上下文，子阶段 2a + 2b）（P3）。第 2 步的每个子阶段分别调度 Searcher ×2 + 每个子阶段一个 Sonnet Reviewer。信任 Searcher 的输出——不设置第 2 步级别的覆盖率 Reviewer。
3. 并行执行第 3 步的子阶段 3a + 3b + 3c（可跳过 P4）：每个子阶段分别使用维度对 Writer ×2 + 一个子阶段级 Sonnet Reviewer。分析员（Opus）将结果汇总为 6 维简报。
4. 如果歧义度 < 0.4 且复杂度 == low：直接跳转到 scope。否则：逐个询问 2-5 个 `AskUserQuestion`，每次一个，并使用 `(Recommended)` 标记——始终至少询问 2 个。
5. 并发执行第 5 步综合 Writer（原子操作）和第 6 步的子阶段 6a + 6b（P3）。第 6 步的每个子阶段分别顺序调度 Writer ×2 + 一个子阶段级 Sonnet Reviewer（6b 依赖于 6a）。由一个最终批处理 Reviewer 覆盖第 5 步 + 第 6 步（P2）。用户确认综合结果并选择方案。
6. 并行执行第 7 步的子阶段 7a + 7b + 7c（P1）：章节 Writer + 每个子阶段的 Sonnet Reviewer。由一个最终批处理 Reviewer 覆盖全部 5 个章节（P2）。将全部 5 个章节一次性呈现给用户进行统一批准。
7. 第 8 步：Writer 在 `.hyperflow/specs/<slug>.md` 中编写规格文件；Reviewer（Opus · final-pass tier）进行合理性检查——原子操作，不包含子阶段。
8. 交接给 `/hyperflow:scope`（根据链模式自动执行，或通过确认门控执行）。

## 输出

两个输出：

1. 已批准的设计——直接内联在对话中（简单功能），或保存到 `.hyperflow/specs/<slug>.md`（涉及 3 个以上文件的功能）。格式为：架构、数据流、关键决策、边界情况、文件结构——每项各自作为一个 H2 章节。
2. 交接行：
   ```
   Spec complete — design approved
   Auto-chaining to /hyperflow:scope...        (chain-mode=auto)
   Awaiting your go-ahead for /hyperflow:scope...   (chain-mode=manual)
   ```

## 错误处理

| 失败情况 | 行为 |
|---|---|
| `AskUserQuestion` 不可用（无头模式） | 在步骤 0 拒绝；打印错误并退出。规范要求进行交互式设计探索。 |
| 分流分类器拒绝请求（偏离主题、滥用） | 停止。打印中性的原因。 |
| 用户在某个设计部分选择“修改” | 针对该部分返回 Writer，并附带用户反馈。每个部分最多进行 3 次修改循环，之后建议采用不同的方法。 |
| Searcher 未返回相关上下文 | 下游 Writer 标记 `MISSING CONTEXT: <subsystem>`；编排器针对该缺口重新调度 Searcher。重试 2 次后，向用户说明：设计将在上下文不足的情况下继续，并附带相应限制。 |
| 用户未选择提出的 2–3 种方法中的任何一种 | Writer 起草第 4 种方法，并纳入用户明确说明的异议。 |
| 用户对 `AskUserQuestion` 回答“Other”并附带自由文本 | 将其视为新约束，并整合到下一部分的草稿中。 |
| 批量 Reviewer 对 5 个部分中的 4 个或更多返回 NEEDS_FIX | 很可能是所选方法不正确。返回步骤 6，重新选择方法，而不是重写 4 个部分。 |
| 并发调度受到速率限制（并行 Agent 调用过多） | 将并行部分草稿数限制为 5（这已经是自然上限）；将并发前置条件限制为 2。如果平台进一步施加速率限制，则平稳降级为串行处理——质量不变，延迟恢复到当前水平。 |

## 示例

完整的对话记录已移至 [examples.md](references/examples.md)，以保持 SKILL 正文精简。示例仅用于说明，不是行为的必要依据。想查看端到端的对话记录时，请阅读配套文件。

## 资源

- [brainstorming-advanced.md](references/brainstorming-advanced.md) — 更深入的问题框架。
- [memory-system.md](references/memory-system.md) — 决策 / 陷阱的持久化格式。
- [DOCTRINE.md](references/DOCTRINE.md) — 共享规则（尤其是第 #8 条结构性门槛）。
- [output-style.md](references/output-style.md) — 优雅的标签格式。
- [task-triage.md](references/task-triage.md) — 分类器输出模式。
- [flow-profiles.md](references/flow-profiles.md) — fast/standard/deep/research/creative/scientific 配置。
- [latency-patterns.md](references/latency-patterns.md) — P1–P5 延迟降低模式参考。
- [worker-prompt-lean.md](../hyperflow/worker-prompt-lean.md) — P5 精简 worker 模板。
- [reviewer-prompt-batched.md](../hyperflow/reviewer-prompt-batched.md) — P2 批量 reviewer 模板。