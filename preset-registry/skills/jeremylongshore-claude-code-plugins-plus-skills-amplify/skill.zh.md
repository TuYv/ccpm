---
name: amplify
description: |
  Use when a prompt is rough, vague, or under-specified and you want it rewritten to high quality before running it. Domain-aware: detects the prompt's domain, stitches the matching specialist standards, reads project rules, and scores the result against an 8-dimension rubric. Standalone — ends with a handoff gate to push the amplified prompt into the chain.
  Trigger with /hyperflow:amplify, "enhance this prompt", "make this prompt better", "improve my prompt", "rewrite this prompt".
allowed-tools: Read, Glob, Grep, Agent, AskUserQuestion, Skill
argument-hint: "<raw prompt to enhance> (omit to amplify your previous message)"
version: 1.0.0
license: MIT
compatibility: Designed for Claude Code
tags: [prompt-engineering, enhancement, quality, personas, multi-agent]
---
# Amplify

将粗略的提示词转化为高信号提示词。识别领域，注入该领域所要求的标准，根据评分标准对其进行评分，然后提出运行该提示词。

调度器和审阅者 — Opus 4.8（思考层级）。搜索器/写作者 — Sonnet 4.6（工作层级）。

Amplify 只专注于做好**一件事**：将你提供的提示词重写为最强的单一版本，然后交接出去。它本身不编写代码，而是生成由其他技能（或你）执行的提示词。

## 分步骤 Agent 映射（DOCTRINE 规则 12）

每个实质性步骤至少调度一个 Agent。原子步骤（DOCTRINE 12.2.8）由单个 Worker → Reviewer 配对组成，不包含独立角度的并行展开。

| 步骤 | 状态 | Worker 层级 | 思考层级 | 备注 |
|---|---|---|---|---|
| 1 — 读取意图 | 原子（12.2.8） | Searcher（Sonnet）— 领域信号 + 项目规则 | **Analyst**（Opus）— 分流 + 差距分析 + 角色选择 | 单个 Worker → Reviewer；读取 `CLAUDE.md`、`AGENTS.md`、`.hyperflow/memory/*` |
| 2 — Amplify | 原子（12.2.8） | Writer（Sonnet）— 起草增强后的提示词 | **Reviewer**（Opus）— 根据 8 维评分标准评分，进行一次针对性修订 | Writer 起草 → Opus 根据 8 维评分标准评分 → 如果任一维度 < 4，则修订一次 |
| 3 — 呈现 + 交接 | §12.1 内联 | — | — | 输出增强后的提示词 + 理由；触发交接门控（`AskUserQuestion`） |

## 输入

- `$ARGUMENTS` — 要增强的原始提示词。如果为空，则增强当前对话中用户的上一条消息。
- 无标志。Amplify 始终生成单一最佳版本（根据设计决策）；深度由评分标准而非标志控制。

## 流程

### 步骤 1 — 读取意图（原子 · 12.2.8）

原子步骤 — 单个 Searcher → Analyst 配对。不展开并行角度：理解一个提示词属于一个范围。

1. 调度 `Searcher — detecting prompt domain + gathering project rules`（Sonnet）。它返回：
   - **领域信号** — 提示词是否涉及 frontend/ui/creative、api/db backend、mobile、security、performance、refactor/bugfix/test、devops、docs？（一个提示词可以跨越多个领域。）
   - **项目规则** — 在存在时读取：`CLAUDE.md`、`AGENTS.md`、`.hyperflow/memory/conventions.md`、`.hyperflow/memory/project-decisions.md`、`.hyperflow/memory/anti-patterns.md`。提取任何应约束该提示词的规则。
   - **原始提示词的缺口** — 高级工程师要据此采取行动时必须猜测的内容。

2. 调度 `**Analyst** — triaging intent + selecting personas`（Opus）。它返回 `{ domain[], intent, ambiguities[], personas[], project_rules[] }` — 来自 [`../hyperflow/personas-A.md`](../hyperflow/personas-A.md) / [`personas-B.md`](../hyperflow/personas-B.md) 的匹配 hyperflow 角色，以及要叠加在其上的项目规则。

如果提示词过于含糊，无法在不作出某个重写本身无法决定的决策的情况下进行增强（即某个会改变交付物的维度上的 `ambiguity` 较高），Analyst 会将其标记出来 — 步骤 3 的交接门控会将其作为澄清说明呈现，而不是自行猜测。

### 步骤 2 — Amplify（原子 · 12.2.8）

原子步骤 — 单个 Writer → Reviewer 配对，包含一次性修订循环。

1. 使用 Step 1 输出调度 `Writer — drafting the amplified prompt` (Sonnet)。Writer 按照 [`references/prompt-rubric.md`](references/prompt-rubric.md) 中的框架，将原始提示词重写为唯一的最强版本：角色设定 · 精确任务 · 上下文 · 约束（人格准则 + 项目规则）· 输出规范 · 范围外事项。**简洁是一项约束** — 应提升到任务所需的程度，绝不将一行请求膨胀成一份规范。

2. 使用草稿调度 `**Reviewer** — scoring against the prompt-quality rubric` (Opus)。它对全部 8 个维度（见 [`references/prompt-rubric.md`](references/prompt-rubric.md)）按 1–5 分评分。判定：
   - **所有维度 ≥ 4** → `PASS`。交付草稿。
   - **任一维度 < 4** → `NEEDS_REVISION`，附上具体维度 + 缺失内容。Writer 注入这些发现后**仅**修订一次，随后无论结果如何均交付（无无限循环 — DOCTRINE 规则 14 的 NEEDS_REVISION 节奏：第二次通过后呈现）。

Reviewer 同时还会生成**理由说明** — 用 2–4 行说明“变更了什么以及原因”，并点明所注入的领域准则和项目规则。

### Step 3 — 呈现 + 交接（内联 · §12.1）

琐碎任务内联处理 — 不调度 Agent。编排器先输出，再进行门控。

1. 在单个可直接复制的围栏代码块中**输出增强后的提示词**。
2. 在其下方**输出理由说明** — 变更内容、注入了哪些人格标准 + 项目规则，以及 Analyst 标记的任何歧义。
3. **触发交接门控** — `AskUserQuestion`：

   > **现在运行这条增强后的提示词吗？**
   > - **发送至 spec** *(推荐)* — 以设计优先方式启动链路；spec 使用增强后的提示词进行头脑风暴 + 设计，然后自动串联至 scope → dispatch
   > - **发送至 scope** — 方法已经明确，直接进入分解阶段（`/hyperflow:scope`）
   > - **发送至 dispatch** — 已存在任务文件（`/hyperflow:dispatch`）
   > - **仅复制** — 保留提示词，不运行任何操作

   这是一个多选项门控（4 个选项）→ **发送至 spec** 带有 `(Recommended)` 标记（DOCTRINE 规则 8 — 命名工作流选择）。

   当选择 `Send to …` 时，通过 `Skill` 工具调用所选技能，并将**增强后的提示词**作为参数传入。Spec 是默认选项，因为新近增强的提示词是一个设计起点 — spec 的头脑风暴 + 逐节设计正是它所服务的内容。选择 `Copy only` 时，停止 — 提示词已经输出，用户可自行使用。

   **Codex 回退：**如果宿主未提供 `AskUserQuestion` 弹窗 UI，则以 `Hyperflow Question` 聊天块输出相同的门控及四个编号选项，并等待用户回复。不要自动选择 `Send to spec`。

## 强制规则

- **Amplify 绝不编写代码。**它只生成提示词；下游技能负责执行。若用户想要代码，交接门控会将请求路由至对应位置。
- **项目规则优先于冲突项。**`CLAUDE.md` / `AGENTS.md` / `.hyperflow/memory/` 中的规则覆盖通用人格标准 — 这是用户的明确指令。
- **简洁是强制要求（评分标准维度 8）。**绝不膨胀一个琐碎提示词。评分标准仅将任务增强到所需程度，不会超出。
- **故障恢复（规则 14）。**Worker/Reviewer 错误及 NEEDS_REVISION 节奏遵循 [`../hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md)。
- 增强后的提示词或理由说明中不得出现**AI 归属表述** — 描述工作本身，绝不描述作者。

## 准则

共享规则见 [`../hyperflow/DOCTRINE.md`](../hyperflow/DOCTRINE.md)。角色设定见 [`../hyperflow/personas-A.md`](../hyperflow/personas-A.md) + [`personas-B.md`](../hyperflow/personas-B.md)。评分标准见 [`references/prompt-rubric.md`](references/prompt-rubric.md)。