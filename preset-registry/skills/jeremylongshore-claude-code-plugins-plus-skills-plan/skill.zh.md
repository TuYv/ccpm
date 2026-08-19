---
name: plan
description: |
  Use when a request needs shaping before any code is written — a rough or vague prompt to sharpen, an ambiguous idea to design, or a clear-enough task to decompose. One chain-starter that amplifies the prompt, designs the approach, and decomposes it into a batched task file, skipping whichever phases the request doesn't need, then STOPS at a build-location gate (build here, hand off to another session, or just keep the plan). Plan never implements.
  Trigger with /hyperflow:plan, "design this", "plan this", "decompose this", "how should we", "what's the best way to", "break this down", "enhance this prompt".
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(python3:*), Bash(mv:*), Glob, Grep, Agent, AskUserQuestion, Skill
argument-hint: "<idea, prompt, or task> [--thorough | depth=max] [briefs=auto|terse] [noamplify]"
version: 2.0.1
license: MIT
compatibility: Designed for Claude Code
tags: [prompt-engineering, design, brainstorming, planning, decomposition, multi-agent]
---
# Plan

一个链式启动器，将三个阶段——**增强**（明确提示词）、**设计**（头脑风暴并制定方案规格）、**分解**（编写批处理任务文件）——合并为一个流程，然后在**构建位置关卡**（步骤 12）处停止。每个阶段在请求不需要时都会跳过自身：清晰的任务会直接进入分解；已经结构化的提示词则跳过增强。

**Plan 永远不会实现。** 它是**思考，而非构建**——这里不会编写源代码，也不会默默串联到 `/hyperflow:dispatch`。唯一的写入位置是 `.hyperflow/specs/`、`.hyperflow/tasks/`、`.hyperflow/features/`、`.hyperflow/memory/`，以及（另一会话模式下）已提交的 `.hyperflow-handoff/` 包。任务文件准备好后，plan **始终**会询问在哪里构建它（本会话 / 另一会话 / 停止）——该关卡每次运行都会触发，只有用户的选择才会真正启动构建。它驱动 **第 0.5 层（分流）**、**第 4 层（头脑风暴/规格制定）**、**第 0 层（项目分析）**、**第 6 层（记忆）**以及**第 7 层（任务模板）**。

**Plan 以最高思考深度运行。** 在分流、分析、设计和分解过程中启用扩展 / 超强推理——plan 是链路中唯一需要大量思考的前置入口，并一次性承担推理成本，以确保构建能够忠实执行。每个实质性步骤都**使用工具**（使用 Agents 执行工作，使用 `Write` 持久化产物）；只存在于聊天中的 plan 违反要求。

**每个 agent 都运行在当前会话模型上——不存在模型层级路由，也没有模型配置。** 各角色（Classifier、Searcher、Writer、Analyst、Planner、Reviewer）的差异在于职责，而不是模型。

## 铁律

- **Plan 永远不会实现。** 它始终会在构建位置关卡（步骤 12）处停止，并询问在哪里构建——本会话 / 另一会话 / 停止。它不会默默串联到 `dispatch`。该关卡**每次运行都会触发**，即使某种方式传播了 `session=` / `commit=` / `branch=` 参数，也绝不能跳过。
- **始终最大化思考。** 在分流、分析、设计和分解过程中，以最高推理深度（ultrathink）运行。Plan 是唯一需要大量思考的阶段；不要为了节省 token 而缩短推理。
- **始终在磁盘上生成产物。** 每次执行到分解阶段的运行都必须使用工具来 `Write` 规格（如果执行了设计阶段）以及任务文件和 briefs。只在聊天中描述 plan——没有写入 `.hyperflow/tasks/<slug>.md`——属于失败运行，而不是 plan。
- **设计阶段不得编写代码。** Plan 生成提示词、规格和任务文件；`dispatch` 执行它们。
- **编写可直接用于构建的 briefs（`briefs=auto`）。** 每个非平凡子任务都必须在 plan 阶段（步骤 9c）获得完整、自包含的实现 brief，并存储在 `.hyperflow/tasks/<slug>/T<id>.md`。强大的规划模型一次性承担编写成本，使构建能够在更便宜的模型或第二个会话中忠实运行——dispatch 负责转录，而不是重新推导。平凡子任务保持简洁。
- **发生冲突时以项目规则为准。** `CLAUDE.md` / `AGENTS.md` / `.hyperflow/memory/` 中的规则覆盖通用角色规范——那是用户的明确指令。
- **必须保持经济性。** 增强应将内容提升到任务所需的层级，绝不能把一句话的请求膨胀成规格说明（评分标准第 8 项）。
- **指定负责的专家；绝不执行他们的网络调研。** `Responsible specialists:` 注释只是声明——每位专家的先网络调研流程会在之后的 `dispatch` 中触发，而不是在这里触发。
- **任何提示词、规格、任务文件或记忆条目中都不得注明 AI 归属**——描述工作，而不是描述作者。
- **失败恢复（规则 14）。** Worker/Reviewer 错误、格式错误的输出以及 NEEDS_REVISION 节奏遵循 [`../hyperflow/failure-recovery.md`](../hyperflow/failure-recovery.md)。重试 → 升级 → 中止。链路预算：累计 3 次中止。

## 分步骤 Agent 映射（DOCTRINE 规则 12 + 12.2）

每个实质性步骤至少调度一个 Agent；琐碎步骤（§12.1）和单对原子步骤（§12.2.8）按说明执行。所有角色均运行在会话模型上——此表分配的是职责，而非层级。

| 步骤 | 子阶段 | 工作者 | 审查者 / 决策 Agent | 备注 |
|---|---|---|---|---|
| 0 — 设置 | 原子 | — | — | 静默执行：解析 flags、设置 max-thinking。不设置启动门禁，不提问 |
| 1 — 分流 | 原子 | 分类器 | **分流审查者** | P4 跳过审查者；与步骤 3 以 P3 并发执行 |
| 2 — 扩展（可跳过） | 原子 | 写作者 — 重写 prompt | **审查者** — 8 维评分标准，进行一次修订 | prompt 清晰且结构化时跳过 |
| 3 — 上下文 | 3a + 3b（P1） | 每个子阶段各 Searcher ×2 | 每个子阶段各 **审查者** | 3a 表层映射 · 3b 语义与约定扫描 |
| 4 — 多维分析（P4） | 4a + 4b + 4c（P1） | 每个子阶段各 Writer ×1–2 | 每个子阶段各 **审查者** + **分析师** 综合 | 当歧义度 < 0.6 且复杂度 ≠ high 时跳过 |
| 5 — 澄清（门禁） | 原子 | — | — | `AskUserQuestion`；设计路径下限为 2 · bounce 路径为 0–3 |
| 6 — 综合 + 方案（P4） | 6a + 6b | 每个子阶段各 Writer ×1–2 | **审查者**（批量） | 当歧义度 < 0.6 且复杂度 ≠ high 时跳过方案阶段 |
| 7 — 设计章节（P1+P2） | 7a + 7b + 7c | 每个子阶段各 Writer ×1–2（在架构师类型 / 高复杂度 / 多子系统任务中，**`architect`** 负责撰写 7a §1/§2——嵌入 Mermaid 图；在 ui/创意类型任务中，**`designer`** 负责视觉/体验决策——以 `.hyperflow/design/system.md` 为依据；在 mobile/native 类型任务中，**`mobile`** 负责平台/设备决策——以 `../hyperflow/mobile.md` 为依据） | 每个子阶段各 **审查者** + 1 个批量审查者 | 文件优先；一个合并审批门禁 |
| 8 — 规格定稿 | 原子 | Writer | **审查者**（最终集成） | 将 draft 重命名为 `.hyperflow/specs/<slug>.md` |
| 9 — 分解 | 9a + 9b + 9c | Planner ×1（9a） · Searcher ×2（9b） · 每个非平凡子任务各 **brief Writer ×1**（9c） | 每个子阶段各 **审查者** | 9a 批量生成图 → 9b 规模评估 → 9c 为每个非平凡子任务撰写完整的、可直接构建的 brief（`briefs=auto`） |
| 10 — 编写任务文件（与 11 以 P3 协同） | 10a + 10b + 10c | 每个子阶段各 Writer ×2 | 每个子阶段各 **审查者** + 1 个最终验证者 | 平面任务文件或 feature/phase 树 |
| 11 — 记忆（与 10 以 P3 协同） | 原子 | Writer 追加内容 | **审查者**：重复/矛盾检查 | 与步骤 10 并发执行 |
| 12 — 构建位置门禁 | 原子 | — | — | `AskUserQuestion`（始终触发）：本会话 → `Skill` 调度 · 其他会话 → 写入交接包 · 停止 |

**可跳过 / bounce 摘要：**对于清晰的 prompt，步骤 2 会跳过；步骤 4 和步骤 6-方案阶段可按 P4 跳过；当请求清晰时，步骤 5 会让设计阶段（步骤 6–8）**bounce**，直接跳转到步骤 9。`--thorough` / `depth=max` 会禁用 P1/P2/P4（改为顺序执行、运行每个步骤、启用逐章节审查者，并额外增加独立的最终集成阶段）；P3/P5 保持启用。**没有任何步骤是启动门禁**——在步骤 5 的澄清问题之前，计划不会向用户询问任何内容；构建决策则会等到步骤 12。

## 审批门

| 门 | 时机 | 格式 |
|---|---|---|
| 智能问题 | 步骤 5，设计路径 | `AskUserQuestion` — 2–5 个问题（最低 2 个） |
| 综合 + 方法 | 步骤 6，批量审查之后 | `AskUserQuestion` — 确认综合结果 · 选择方法 |
| 设计部分审批 | 步骤 7，一个合并门 | `AskUserQuestion` — 全部批准 / 修改 §N |
| **构建位置** | 步骤 12，任务文件写入之后 — **始终执行** | `AskUserQuestion` — 本次会话 / 另一会话 / 停止（+ 当选择另一会话时：交接：审查 / 部署） |

构建位置门在**每次**运行时都会触发（它是唯一会启动构建的环节）；设计阶段的门每个最多触发一次，并且在回弹路径上会跳过。Plan **不询问任何启动门**——会话/构建决策以及操作选择（提交频率 · 分支 · 推送）不再预先进行。当用户选择“本次会话”时，`dispatch` 会在构建前通过自身的操作门（步骤 0.5）进行询问。标记遵循 DOCTRINE 规则 8：多选项/命名工作流选择带有 `(Recommended)`；二元操作门（批准/修改）不带任何标记。

## 流程

### 步骤 0 — 设置（静默 · 最大思考 · 无门）

Plan 在启动时不询问用户任何问题。这里没有会话策略门，也没有操作门——这两个决策都会移至步骤 12 的构建位置门（而当构建实际开始时，操作门由 `dispatch` 负责）。静默采用默认值是正确的：Plan 仅负责思考，因此在任务文件存在之前没有任何需要决定的事项。

在步骤 0，编排器只执行以下操作：

1. **启用最大思考深度**（超强推理），让整个运行过程——分类、分析、设计和拆解——都以完整深度进行推理。
2. **从参数中解析标志**：`--thorough` / `depth=max`（禁用 P1/P2/P4 — 参见可跳过项摘要）、`noamplify`（跳过步骤 2）、`briefs=auto|terse`（步骤 9c）。记录这些标志，不要询问相关问题。**GitHub 原生透传：**`gh_issue=` / `pr=` / `comment=`（由 `/hyperflow:issue` 设置）以及 `spec=`（预构建的 spec 路径，例如来自 `/hyperflow:issue` 或审计修复门）都按原样记录——Plan 不会对它们执行任何操作，而是在步骤 12 将它们转发给 dispatch。

然后直接继续步骤 1。任何碰巧存在的 `session=` / `commit=` / `branch=` / `push=` 参数都将被**忽略，不用于门控**——构建决策始终在步骤 12 重新作出。

### 步骤 1 — 分类（第 0.5 层 · 与步骤 3 并发执行的 P3）

步骤 1（Classifier）和步骤 3（上下文 Searchers）彼此独立——在一条消息中同时 dispatch，等待两者完成。在 `--thorough` 下，先运行步骤 1，再运行步骤 3。

按照 [`../hyperflow/task-triage.md`](../hyperflow/task-triage.md) dispatch `Classifier — triaging request`，生成 `{ types[], complexity, risk, scope, ambiguity, flow, personas[], specialists[] }`。这将驱动：P4 门（步骤 4/6）和回弹门（步骤 5）；步骤 5 的问题预算（`0.0–0.5` → 2，`0.5–0.8` → 3，`0.8–1.0` → 4–5）；后续流程配置（[`../hyperflow/flow-profiles.md`](../hyperflow/flow-profiles.md)）；以及 persona/specialist 的拼接。在有门控的流程中，负责的 specialist roster 通过 [Brain](../../agents/brain.md)（DOCTRINE 规则 17）最终确定一次，并由后续每个阶段继承。将其持久化并传播为 `triage=<base64-json>`。

**分流审查员（规则 15）。** 当 `complexity == low`、`ambiguity < 0.2`、`scope ∈ {0-file, 1-file}`、`risk != high` 全部满足时，P4-跳过——直接使用 Classifier 的输出并打印跳过行。否则调度 `**分流审查员** — 根据请求和项目配置进行分类校验`（读取请求 + `.hyperflow/profile.md`）。判定结果 ∈ {`PASS`、`RECLASSIFY`（使用修正后的分流结果，打印一行）、`ESCALATE`（将歧义加入步骤 5 的队列）}。Reviewer 出错时遵循故障恢复 §5——绝不使用未经校验的分流结果。

### 步骤 2 — 扩充 / 提示词卫生（原子操作 · 可跳过）

**当** `ambiguity < 0.4`，或传入的提示词已经结构良好（包含角色/任务/约束/输出），或设置了 `noamplify` 标志时**跳过**——打印 `Amplify skipped — prompt already specific.`，并使用原提示词直接进入步骤 4。扩充的作用是在设计前让粗略输入变得更清晰；清晰的提示词不会从中获益。

否则，执行一次 Writer → Reviewer 配对，并进行一次性修订循环：

1. `Writer — drafting the amplified prompt` 按照 [`references/prompt-rubric.md`](references/prompt-rubric.md) 中的骨架，将原始提示词重写为唯一最强版本：角色 · 任务 · 上下文 · 约束（来自分流结果 `personas[]` 的角色设定原则 + 项目规则）· 输出规范 · 范围外内容。简洁性是一项约束。
2. `**Reviewer** — scoring against the prompt-quality rubric` 按提示词质量量规对全部 8 个维度进行 1–5 分评分。**全部 ≥ 4** → `PASS`。**任意一项 < 4** → `NEEDS_REVISION` 并给出具体问题；Writer 修订**一次**后直接交付（不允许无限循环）。Reviewer 还会生成 2–4 行的理由，指出其中注入的领域原则和项目规则。

扩充后的提示词将成为分析和设计所使用的工作提示词。将其连同理由以及一行 `Responsible specialists:` 一并放在可直接复制的代码块中打印一次（没有适用的 specialist 时省略该行）。

### 步骤 3 — 上下文探索（P1 子阶段 · 与步骤 1 并发执行 P3）

在调度之前读取 `.hyperflow/profile.md`、`architecture.md`、`conventions.md`、`.hyperflow/memory/index.md`，以便发现过往经验。子阶段彼此独立——在一条消息中调度，分别运行各子阶段的 Reviewer，然后继续推进。不设置步骤级覆盖范围 Reviewer；下游 Writer 会标记 `MISSING CONTEXT: <subsystem>`，编排器将重新调度相关 Searcher（最多重试 2 次）。不要询问用户代码揭示了什么。

- **3a — 表面映射：** `Searcher — glob discovery: file tree + entry points`；`Searcher — import-graph traversal: dependency edges`。→ `**Reviewer**`。
- **3b — 语义 + 约定扫描：** `Searcher — type/symbol probe: interfaces, schemas, call sites, re-exports`；`Searcher — test patterns + lint/config: naming, runner, lint rules`。→ `**Reviewer**`。

### 步骤 4 — 多维度分析（P4 可跳过）

**P4 门控：** 当 `ambiguity < 0.6 AND complexity != high` 时完全跳过（跳转至步骤 5）——边界值向上取整（0.59 → 执行）。`--thorough` 始终执行。若执行，则子阶段以并行方式扇出（P1），随后由 Analyst 汇总：

- **4a — 意图 + 技术适配性：** `Writer — user-intent: real need + success` ∥ `Writer — technical-fit: how it fits existing architecture`。→ `**Reviewer**`。
- **4b — 范围 + 风险：** `Writer — scope/constraints: MVP vs max, limits` ∥ `Writer — risks: failure modes, irreversibility`。→ `**Reviewer**`。
- **4c — 备选方案：** `Writer — alternatives: ≥3 distinct solutions, brief notes`（单一规范集合）。→ `**Reviewer**`。
- **4d — Analyst 综合（串行）：** `**Analyst** — 6-dimension aggregation` 将 4a/4b/4c 整合为统一简报；未知项转化为步骤 5 的问题。

### 步骤 5 — 澄清（`AskUserQuestion` · 两种模式）

预检：读取 `.hyperflow/memory/project-decisions.md`；跳过其中已经回答的候选问题（打印一行），除非缓存的答案与当前任务冲突（此时询问“决策记录显示为 X——当前任务是否改变了这一点？”）。

**跳转门（仅分解路径）：** 当 `ambiguity < 0.4 AND complexity == low` 时，请求足够明确——跳过设计阶段（步骤 6–8）。询问 **0–3** 个与 Searchers 发现的具体结果相关的分析后问题（没有最低数量要求——研究结论充分时为零），然后跳转到**步骤 9**。打印 `That's clear enough to skip the design phase — decomposing directly.`

**设计路径（其他所有情况）：** 通过 `AskUserQuestion` 提问，**始终至少提出 2 个问题**（即使请求看起来明确，这两个最低问题也能让用户有机会重新引导方向）。根据分诊深度分配问题数量：轻量 2 个 · 标准 3 个 · 深入 4–5 个。每次调用最多提出 2 个问题。多选项列表（3 个及以上）要标记一个 `(Recommended)` 选项（优先放置 Analyst 的首要假设）；二选一列表不添加标记。问题顺序：意图 → 约束 → 假设 → 范围 → 边界情况立场（深度为 N 时取前 N 项）。

获得回答后，将结构性决策（数据库、身份验证、测试、框架默认设置）追加到 `.hyperflow/memory/project-decisions.md`，置于带日期 + 来源 slug 的类别标题下——内联写入，§12.1-trivial。跳过特定于任务的回答。

### 步骤 6 — 综合 + 方案（P3 + P2 · 可跳过 P4）

步骤 5（综合）和 6a 都依赖于这些回答，但彼此不相互依赖——并发调度（P3）；由一个批处理 Reviewer 同时覆盖两者（P2）。`--thorough` 会按顺序运行它们。

- **综合：** `Writer — requirement synthesis` 生成一段“目标是 X，约束为 Y，不包括 Z”的文字。
- **6a — 方案候选（当 `ambiguity < 0.6 ∧ complexity != high` 时跳过 P4）：** `Writer — lightweight candidates` ∥ `Writer — heavyweight candidates`。每个方案包括：名称 · 内容 · 优点 · 缺点 · 适配性。
- **6b — 权衡评估（基于 6a 串行执行）：** `Writer — fit analysis` ∥ `Writer — risk analysis`，为每个候选方案评分。

`**Reviewer** — batched: synthesis + approaches`（[`../hyperflow/reviewer-prompt-batched.md`](../hyperflow/reviewer-prompt-batched.md)）返回各草稿的判定结果；仅重新调度失败的草稿。当 6a/6b 跳过 P4 时，标注“方案：根据综合结果推导（歧义度低）”。然后呈现综合结果 + 方案，并通过 `AskUserQuestion` 进行确认——推荐一个方案，但由用户做出选择。

### 第 7 步 — 按章节设计（P1 + P2 · 文件优先 · 一个合并门禁）

**文件优先（规则 8）：**每个章节 Writer 都直接将内容写入 `.hyperflow/specs/<slug>.draft.md` 中稳定的 H2 锚点位置——绝不返回内容供内联粘贴。在调度前，先为文件预置 5 个 H2 标题。运行一次 `python3 $PLUGIN_ROOT/scripts/resolve-mode.py $PROJECT_ROOT --from-args "$CHAIN_ARGS"`，并传递 `mode=<default|lean|thorough>`（lean → workers 获取仅包含路径的 Project Context 块，参见 [`../hyperflow/worker-prompt-lean.md`](../hyperflow/worker-prompt-lean.md)）。

在一条并行消息中调度各子阶段（P1），每个子阶段配备一个 Reviewer，并在其返回时立即启动；随后由一个批量 Reviewer（P2）读取全部 5 个章节，检查跨章节的一致性。每个章节 Writer 都会记录一行来自 Brain 最终确定的人员名单的 `Responsible specialist(s):`，并将其带入第 8 步的状态块中。

**系统设计任务生成架构图。**对于架构师类型、高复杂度或多子系统工作，[`architect`](../../agents/architect.md) agent 负责 §1/§2，并在草稿中直接嵌入 Mermaid 组件/容器图（§1）和 Mermaid 数据流图（§2）——图表位于实现之前。第 7 步的审批门禁已经将用户指向草稿文件，因此无需额外门禁，用户可直接在那里审阅这些图表。

**设计阶段咨询。**此阶段中的任何决策 agent 都可以直接咨询同伴：使用其自身的 `Agent` 工具，最多 3 次咨询，深度为 1，允许列表为 `agents/` 注册表，具体规则见 [`../hyperflow/consultation.md`](../hyperflow/consultation.md)——例如，`architect` 可以在将某项交互提交到 §2 之前询问 `motion` 其可行性，或 `designer` 可以针对高度依赖动效的屏幕询问 `motion`。该机制与 agent 类型无关：未来的决策 agent 无需在此处修改即可继承这一能力。

**设计类型任务以设计系统为基础。**对于 ui/creative 类型工作，[`designer`](../../agents/designer.md) agent 负责视觉与体验决策：它首先确保 `.hyperflow/design/system.md` 存在（缺失时创建，存在时依据 [`../hyperflow/design-system.md`](../hyperflow/design-system.md) 扩展），研究项目所属领域中至少 2 个真实世界的参考案例，并将它们与一个经过审慎设计的标志性元素结合，应用匹配的本地 taste skill，并在 §3 中记录绑定的设计系统 tokens。当范围内包含**动效界面**（动画 / 过渡 / 滚动驱动 / 手势）时，designer 会引入 [`motion`](../../agents/motion.md) agent，在 §3 中编写 Motion 语言决策（仅使用合成器属性、库选择、spring 参数、根据 [`../hyperflow/motion.md`](../hyperflow/motion.md) 制定的 reduced-motion  fallback）——组合在 §3 中，而不是单独设立章节。不得编写源代码——只能编写设计系统和规格草稿。

**移动类型任务定义平台与设备策略。**对于移动 / 原生 / 响应式应用工作，[`mobile`](../../agents/mobile.md) agent 将移动端决策写入 §1（架构，与 `architect` 协作）和 §3（决策）中，包括框架选择及理由（React Native / Flutter / 原生 iOS / Android）、应用架构（导航 / 离线优先 / 生命周期感知状态）、平台无障碍最低标准（VoiceOver/TalkBack、44pt/48dp 目标尺寸、Dynamic Type），以及设备尺寸测试矩阵与工具（Maestro/Detox/XCUITest/Espresso），并以 [`../hyperflow/mobile.md`](../hyperflow/mobile.md) 为依据。不得编写源代码。

- **7a — 结构设计：** 当分诊 `types` 包含 `architect`、或 `complexity == high`、或界面跨越 ≥ 2 个子系统时，调度 [`architect`](../../agents/architect.md) agent 编写两个部分 — `architect — §1 Architecture (C4 decomposition + Mermaid component/container graph)` ∥ `architect — §2 Data flow (Mermaid data-flow diagram per new cross-boundary path)`；当涉及前端界面时，它会将大规模前端决策（防抖/虚拟化/分页/缓存/代码分割/状态拓扑）纳入 §1 或 §3，并将每个难以逆转的选择标记为 §3 中的 ADR。否则（明确的单组件任务）使用 `Writer — §1 Architecture` ∥ `Writer — §2 Data flow`。→ `**Reviewer**`（该部分的审阅者是独立 agent；architect 的审阅者角色稍后适用于 `dispatch`/`audit` 中的结构性变更）。
- **7b — 决策：** 当分诊 `types` 包含 `ui` 或 `creative` 时，调度 [`designer`](../../agents/designer.md) agent 编写视觉/体验部分 — `designer — §3 Design decisions (design-system tokens + signature + references)` ∥ `Writer — §4 Edge cases`；designer 首先确保 `.hyperflow/design/system.md` 存在，并应用匹配的 taste skill。否则使用 `Writer — §3 Key decisions` ∥ `Writer — §4 Edge cases`。→ `**Reviewer**`。
- **7c — 文件结构：** `Writer — §5 File structure`。→ `**Reviewer**`。

对于某个部分批量出现 `NEEDS_FIX` 的情况，只重新调度该部分的 Writer（重写其自身的 H2 区块）。**5 个部分中有 4 个或以上 NEEDS_FIX** → 该方案可能是错误的；返回 Step 6 并重新选择。Worker 失败：重试（最多 2 次），然后 `ESCALATE` — 禁止在聊天中直接起草（违反 file-first）。`--thorough`：按顺序逐个起草每个部分，并为每个部分设置独立的批准/修改关卡，然后由独立的最终整合 Reviewer 进行审阅。

审阅通过后，发起一次合并的 `AskUserQuestion` — 正文是一行部分清单加文件路径（不是内容）：

```
Design draft ready at .hyperflow/specs/<slug>.draft.md
§1 Architecture · §2 Data flow · §3 Key decisions · §4 Edge cases · §5 File structure
  Approve all   — finalize and decompose
  Revise §<N>   — send the named section back with your feedback (free-form)
```

按部分进行的修改循环只会重新处理该部分的 Writer（每个部分最多 3 个周期）；文件的其余部分保持不变。

### 第 8 步 — 规格定稿（原子操作）

`Writer — finalizing spec at .hyperflow/specs/<slug>.draft.md` 在文档开头添加状态块和 TL;DR（根据综合结果编写的 2–3 句通俗英语句子）以及 Components，在 §3 末尾追加 `Trade-offs accepted/rejected`，然后执行 `mv .hyperflow/specs/<slug>.draft.md .hyperflow/specs/<slug>.md` 重命名。格式遵循 [`../hyperflow/artefact-format.md`](../hyperflow/artefact-format.md)：状态表（包括 `Specialists` 行）、TL;DR、Components、§1–5。随后始终运行 `**Reviewer** — final spec sanity check`，检查状态块、TL;DR 长度、所有部分是否存在、H2 顺序是否为 1–5、是否存在 trade-offs、各部分之间是否存在矛盾，以及 — 当由 `architect` agent 编写设计时 — §1/§2 中的 Mermaid 图。没有内联摘要回退方案 — 规格内容保存在文件中。

### 第 9 步 — 分解（规划器 · 先按顺序执行 9a，再并行执行 9b/9c）

先执行 9a；9b/9c 依赖于 9a，并发运行。

- **9a — 批次图：** `**Planner** — producing batch graph`，使用第 3 步的上下文聚合、分类结果和适用模板——当 `architect` 代理编写了 §1 时，规划器使用其分解结果作为批次边界来源，而不是从 [`../hyperflow/task-templates.md`](../hyperflow/task-templates.md) 重新推导（CRUD / API / UI / Migration / Refactor / Bug Fix，否则使用定制方案）。每个子任务包括：Worker 角色 · 要读取/修改/创建的文件 · 并行与顺序依赖 · 复杂度估算 · **至少 1 名负责的专员**（来自 Brain 最终确定的分类结果 `specialists[]`；当设计阶段运行时，该信息继承自规格状态块）。随后由 `**Reviewer** — validating decomposition completeness + batch boundaries`（每个发现都映射到 ≥1 个子任务；没有任何子任务在未拆分的情况下跨越多个子系统；符合拓扑顺序）。**超大任务拆分要求（第 3 层）：** 对任何满足以下条件的子任务进行拆分：超过 5 个文件、超过 500 行代码、涉及 2 个或更多子系统、`complexity=high`、包含混合关注点，或需要超过 10 分钟的人工审查——持续拆分，直到每个部分都属于低/中复杂度。拆分同时是成本和质量优化。**模式：** 规划器根据 [`../hyperflow/feature-phases.md`](../hyperflow/feature-phases.md) 输出 `mode: flat | feature`——仅当存在 ≥2 个按顺序依赖的阶段/里程碑时才使用 `feature`；只有 1 个阶段的“feature”属于 `NEEDS_REVISION`。
- **9b — 复杂度评估：** `Searcher — LOC estimation` ∥ `Searcher — subsystem cross-cut check`。→ `**Reviewer**`。
- **9c — 每个子任务的简报（主要工作；默认 `briefs=auto`）：** 对每个**非简单**子任务，`Writer — authoring brief T<id>` 将完整的 [`../hyperflow/worker-prompt.md`](../hyperflow/worker-prompt.md) 正文写入 `.hyperflow/tasks/<slug>/T<id>.md`——任务 · 原因 · 范围（IN/OUT）· 范围内文件及**准确的变更描述**（规格级文字，不包含代码骨架）· 验收标准 · **真实的测试用例集 + 至少 1 个端到端/集成场景**（指定工具名称、真实输入→结果；或明确写出 `E2E: N/A — <why>`）· 相关上下文（需要仿照的 file:line 模式）· 注意事项。内容以第 3 步的上下文聚合和规格为依据，并注明至少 1 名负责的专员。**简单**子任务（1 个文件 ∧ 约 ≤10 行代码 ∧ 显而易见）不生成简报——仅保留简短的任务清单行。简报撰写者并行展开（每个非简单子任务一个），随后由 `**Reviewer** — briefs vs design + completeness` 审查：每个非简单子任务都有简报；每份简报都包含验收标准 + 至少 1 个 E2E 用例 + 已填写的专员；没有简报与规格矛盾。`briefs=terse` 会完全跳过 9c（仅输出单行任务清单——旧版输出）；当由同一个高能力模型负责构建时使用。

### 第 10 步 — 编写任务文件（P3 子阶段 · 与第 11 步并发）

先执行 10a 锚定内容（状态 + 目标 + 原因）；随后并发执行 10b/10c。`--thorough` 仅在此处禁用 P1（顺序撰写草稿）——P3（第 10 步 + 第 11 步）仍然执行。

- **10a — 状态 + 目标 + 原因：** `Writer — status block` ∥ `Writer — goal + why`。→ `**Reviewer**`。
- **10b — 范围 + 受影响的文件：** `Writer — scope-at-a-glance table` ∥ `Writer — affected-file listing`。→ `**Reviewer**`。
- **10c — 执行计划 + 批次 + 验证：** `Writer — execution plan + batch checklist (terse roster, each non-trivial line carrying a `Brief: <slug>/T<id>.md` pointer)` ∥ `Writer — open questions + verification plan`。→ `**Reviewer**`。
- **10d — 最终验证：** `**Reviewer** — assembled task file vs design + briefs`——任务文件中的每项设计要求都映射到 ≥1 个子任务；不存在孤立项；每个子任务都注明至少 1 名专员；`Specialists` 状态行已填写；并且**任务清单↔简报保持一致**（每个非简单任务清单行都能解析到一个现有的 `<slug>/T<id>.md`；每份简报都能反向映射到一个任务清单行）。

**模式分支：**`flat` → 简洁的 roster `.hyperflow/tasks/<slug>.md` + 简要目录 `.hyperflow/tasks/<slug>/T<id>.md`（每个非琐碎子任务一份完整 brief，以 9c 编写；模板 + 生命周期见 [`../hyperflow/task-tracking.md`](../hyperflow/task-tracking.md)；brief 格式见 [`../hyperflow/artefact-format.md`](../hyperflow/artefact-format.md) + [`../hyperflow/worker-prompt.md`](../hyperflow/worker-prompt.md)）；`feature` → 按 [`../hyperflow/feature-phases.md`](../hyperflow/feature-phases.md) 组织的 feature tree（brief 放在每个 `phase-*/tasks/T<id>.md` 中）（`feature.md` + `phase-<n>-<name>/` 文件夹，每个文件夹包含 `phase.md` + `tasks/`），final-verify 还会额外检查阶段顺序、`Depends on` 引用，以及每个任务是否放置在唯一阶段中。每个子任务 PASS 后，由 `dispatch` 更新状态块。

### 第 11 步 — Memory（P3 · 与第 10 步并发）

`Writer — appending decisions to .hyperflow/memory/decisions.md`（琐碎事项跳过；对于复杂 feature，还要初始化 `.hyperflow/specs/<feature-slug>.md`，并在任务文件中引用）→ `**Reviewer** — checking memory entries` 以检查 memory 条目是否存在重复或矛盾。两位 Writer（第 10 步 + 第 11 步）都从 Planner 输出中推导内容，彼此独立——并发 dispatch。

### 第 12 步 — Build-location gate（始终触发 · plan 从不自动实现）

任务文件已写入；plan 的思考工作已完成。触发一次 `AskUserQuestion`——该 gate 在**每次**运行中都会触发，也是唯一能够启动 build 的步骤。绝不要跳过、不要设为默认、不要静默串联到 `dispatch`，无论是否存在任何传递的参数或 autonomy 指令。Q1 是命名工作流选择 → 首先显示推荐选项，并附带 `(Recommended)`：

```
Plan ready — .hyperflow/tasks/<slug>.md (N batches, M sub-tasks)
Where should this be built?
  This session (Recommended) — run /hyperflow:dispatch here now, straight through.
  Another session            — write a committed handoff package and STOP; a second
                               session (another environment, e.g. Codex/Gemini) builds it.
  Stop                       — keep the plan only; build later with /hyperflow:dispatch <slug>.
```

**仅当 Q1 = Another session 时才触发 Q2**——二元操作 gate，**不**添加 `(Recommended)` 标记，结构化默认选项为 `Return for review`：

```
When the second session finishes building, what should it do?
  Return for review   — stop after the build; come back to THIS session and run /hyperflow:audit on the diff.
  Complete to deploy  — the second session continues to /hyperflow:deploy after the build.
```

根据回答进行分支：

- **This session** → 使用 `skill: dispatch` 调用 `Skill`，参数为 `args: "<slug> triage=… mode=… briefs=…"`——存在 `gh_issue=… pr=… comment=…` 时，逐字追加这些参数（这是从第 0 步传递的 GitHub-native 参数；dispatch 的第 5 步 PR 退出需要它们）。不要传递 `commit=` / `branch=` / `push=`——`dispatch` 会在 build 前通过自身的操作 gate（第 0.5 步）处理这些参数。打印 `Building here — handing to /hyperflow:dispatch…`。
- **Another session** → 不要调用 dispatch。写入已提交的 handoff package，并在 dispatch 边界处 STOP（完整约定见 [`../hyperflow/session-handoff.md`](../hyperflow/session-handoff.md)）——创建 `.hyperflow-handoff/<slug>/`，其中包含 `HANDOFF.md`（清单：slug、artefact type/path、已解析的 chain args、Q2 中的 `on_complete`、起始 commit、`Specialists` roster）、`STATUS`（`planned`）、一份已提交的、来自被 gitignore 的 artefact 的副本，以及 `.hyperflow/{conventions,profile,architecture}.md` + memory index 的 `context/` 副本；执行 `git add` + 提交 `chore(handoff): plan <slug> for second-session build`；然后打印启动 session-2 的说明。
- **Stop** → 不再写入任何内容。打印 `Plan kept at .hyperflow/tasks/<slug>.md — run /hyperflow:dispatch <slug> when you're ready to build.`

可移植界面回退（Codex / OpenCode / Grok）：将同一门控打印为 `Hyperflow Question` 聊天块并等待；如果不存在交互式通道，则报错并停止（绝不静默地默认开始构建）。

## 反模式

- 在设计阶段编写代码，或让 plan 实现任何内容——plan 在第 12 步构建位置门控处停止，仅此而已。
- 未触发构建位置门控就自动链式进入 `dispatch`，或将传播的 `session=` 参数视为跳过它的许可——该门控在**每次**运行时都会触发。
- 在启动时前置会话策略或操作（提交/分支/推送）门控——这些已被移除；构建决策等待到第 12 步，而 `dispatch` 负责操作。
- 仅在聊天中产出计划——每次进行分解的运行都必须将任务文件 `Write` 到 `.hyperflow/tasks/<slug>.md`。
- 为节省 token 而走捷径简化推理——plan 以最大思考深度运行。
- 总计提问 > 5 个，或在设计路径上提问 < 2 个（即使请求看起来很清晰，下限也是强制性的），或在一次调用中堆叠 3+ 个问题。
- 除非 P4 跳过或跳转路径生效，否则跳过备选方案。
- 询问代码库揭示了什么；添加用户未请求的功能（YAGNI）。
- 当 P1/P3 适用时，将独立的同级项（步骤 1+3、7a/7b/7c、9b/9c、10 + 11）串行化。
- 当一个批量 Reviewer 可覆盖相同的审查级别上限时，改为使用按章节划分的 Reviewer。
- 对多文件工作产出单批次计划；遗漏验证计划。
- 将 §12.1 的简单步骤（交接、内存追加）包装在 Agent dispatch 中。

## 概述

`plan` 是链路唯一的入口，并以最大思考深度运行。它在启动时不提问。分诊和上下文映射并发执行（P3）；仅当提供了粗略提示时，amplify 才会将其细化；多维分析和方法提案会在低歧义情况下跳过（P4）。足够清晰的请求会跳过设计阶段直接进入分解；存在歧义的请求则在强制 2 个问题下限的约束下，按章节逐一完成规范设计（文件优先，P1+P2）。随后 Planner 产出批次图（强制拆分超大批次），Writers 输出扁平任务文件或功能/阶段树（P3，同时追加内存）。然后 Plan **停止**并触发构建位置门控——它绝不实现：用户选择在此处构建（交给 `/hyperflow:dispatch`）、在另一个会话中构建（写入已提交的交接包），或将计划保留至稍后。

## 前置条件

- `.hyperflow/` 缓存（如果缺失，先运行 `/hyperflow:scaffold`——可改善分诊和规划上下文）。
- `AskUserQuestion` 可用——门控所必需。无头/非交互模式会在 plan 到达的第一个门控处被拒绝（第 5 步澄清问题，或跳转路径中的第 12 步构建位置门控）。
- 一个想法、提示或任务。纯粹的“我们是否应该？”设计问题会执行完整流程；清晰的分解会自动跳过设计阶段。

## 错误处理

| 失败 | 行为 |
|---|---|
| `AskUserQuestion` 不可用（无头模式） | 在到达的第一个门控处拒绝（第 5 步澄清，否则第 12 步构建位置）；打印错误并退出。绝不静默构建。 |
| 分类器拒绝请求（跑题/滥用） | 停止。打印中性的原因。 |
| 用户在设计章节中选择“revise” | 带着反馈循环该 Writer。每个章节最多 3 个周期，然后建议不同的方法。 |
| Searcher 返回无/空上下文 | 下游 Writer 标记 `MISSING CONTEXT`；带着缺口重新分派。最多重试 2 次，然后附带注意事项继续。 |
| 用户拒绝所有提议的方法 | Writer 起草第 4 个方案，纳入已说明的异议。 |
| 批量 Reviewer 在 4+/5 个章节上给出 NEEDS_FIX | 方法可能有误——跳回第 6 步并重新选择。 |
| Planner 针对多文件工作产出单批次计划 | Reviewer 拒绝；带着拆分反馈重新分派。 |
| 任务文件写入失败（路径锁定/磁盘已满） | 以明确错误中止；不得到达构建门控。 |
| 用户在构建位置门控处选择“Stop” | 保留任务文件；打印 `/hyperflow:dispatch <slug>` 恢复提示并正常退出。 |
| 并发分派受到速率限制 | 将并行章节草稿限制为 5 个，并发前置条件限制为 2 个；降级为串行——质量不变，延迟恢复。 |

## 资源

- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 共享规则（规则 8 结构门控、规则 12 每步代理、规则 17 Brain 名单）。
- [prompt-rubric.md](references/prompt-rubric.md) — 8 维提示质量评估标准 + 领域注入框架（步骤 2）。
- [examples.md](references/examples.md) — 完整示例记录（用于说明，不是关键依据）。
- [latency-patterns.md](../hyperflow/latency-patterns.md) — P1–P5 模式、墙上时钟表格、`--thorough` 规则。
- [task-triage.md](../hyperflow/task-triage.md) · [flow-profiles.md](../hyperflow/flow-profiles.md) — 分类器架构 + 执行配置。
- [brainstorming-advanced.md](../hyperflow/brainstorming-advanced.md) — 更深入的问题框架（步骤 5）。
- [task-templates.md](../hyperflow/task-templates.md) · [feature-phases.md](../hyperflow/feature-phases.md) — 分解模式 + 阶段模式（步骤 9）。
- [task-tracking.md](../hyperflow/task-tracking.md) · [artefact-format.md](../hyperflow/artefact-format.md) — 任务文件格式 + 工件模板（步骤 8/10）。
- [worker-prompt.md](../hyperflow/worker-prompt.md) · [worker-prompt-lean.md](../hyperflow/worker-prompt-lean.md) · [reviewer-prompt-batched.md](../hyperflow/reviewer-prompt-batched.md) — 已调度代理模板。
- [memory-system.md](../hyperflow/memory-system.md) · [session-handoff.md](../hyperflow/session-handoff.md) — 持久化 + 双会话契约。
- [output-style.md](../hyperflow/output-style.md) — 代理标签 + 状态行格式。