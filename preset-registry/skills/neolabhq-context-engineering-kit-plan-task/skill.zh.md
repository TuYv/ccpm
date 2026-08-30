---
name: plan-task
description: Refine a draft task specification into a fully planned, implementation-ready task with acceptance criteria, architecture, per-step sub-task files and verifiable phases
---
# 完善任务工作流

## 角色

你是一名任务完善编排器。接收由 `/add-task` 创建的任务草稿文件，并通过一个在每个阶段之后设置质量门禁的协调式多智能体工作流对其进行完善。

## 目标

此工作流命令通过以下步骤完善现有任务草稿：

1. **并行分析** - 并行开展研究、代码库分析和业务分析（描述、验收标准、测试策略）
2. **架构综合** - 将各项发现整合为架构概览
3. **任务分解** - 将任务拆分为按步骤划分的子任务文件，分组为可独立验证的阶段，并指定依赖关系、并行组、智能体/模型分配以及每个阶段的评审模型
4. **提升** - 将完善后的任务从 `draft/` 移动到 `todo/`

所有分配了模型的阶段都包含评审验证，以防止错误传播，并确保达到质量阈值。

## 用户输入

```text
$ARGUMENTS
```

---

## 命令参数

解析 `$ARGUMENTS` 中的以下参数：

### 参数定义

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `task-file` | 任务文件路径 | **必需** | 草稿任务文件的路径（例如 `.specs/tasks/draft/add-validation.feature.md`） |
| `--continue` | `--continue [stage]` | 无 | 从指定阶段继续完善。阶段为可选参数；如果未提供，则根据上下文确定。 |
| `--target-quality` | `--target-quality X.X` | `3.5` | 用于评审通过/失败判断的目标阈值（满分 5.0）。 |
| `--max-iterations` | `--max-iterations N` | `3` | 每个阶段在进入下一阶段之前，最多进行的实现 + 评审重试周期数（无论通过还是失败）。 |
| `--included-stages` | `--included-stages stage1,stage2,...` | 所有阶段 | 要包含的阶段列表，以逗号分隔。 |
| `--skip` | `--skip stage1,stage2,...` | 无 | 要排除的阶段列表，以逗号分隔。 |
| `--fast` | `--fast` | 不适用 | `--target-quality 3.0 --max-iterations 1 --included-stages business analysis,decomposition` 的别名 - 与 `--one-shot` 使用相同的阶段，但评审仍会运行，只是采用较低阈值并进行单次重试。 |
| `--one-shot` | `--one-shot` | 不适用 | `--included-stages business analysis,decomposition --skip-judges` 的别名 - 与 `--fast` 使用相同的阶段，但完全不运行评审，也不应用质量门禁。 |
| `--human-in-the-loop` | `--human-in-the-loop phase1,phase2,...` | 无 | 在指定阶段之后暂停，以便人工验证。 |
| `--skip-judges` | `--skip-judges` | `false` | 跳过所有评审验证检查 - 各阶段不经过质量门禁即可继续。 |
| `--refine` | `--refine` | `false` | 增量完善模式 - 检测相对于 git 的变更，并仅重新运行受影响的阶段（自上而下传播）。 |
| `--model` | `haiku\|sonnet\|opus` | *根据策略自动选择* | 对所有子智能体进行显式用户覆盖。当省略时，根据[模型选择策略](#model-selection-policy)确定各阶段的层级。有关覆盖的影响，请参阅[角色配对](#role-pairing)；有关升级如何与其交互，请参阅[升级规则](#escalation-rule)。 |
| `--strict` | `--strict` | `false` | 禁用[迭代裁量规则](#iteration-discretion-rule) - 阶段只有在 `score >= THRESHOLD` 时才会通过，否则会一直重试，直到达到 `MAX_ITERATIONS`。 |

### 阶段名称（用于 `--included-stages` / `--skip`）

| 阶段名称 | 阶段 | 描述 |
|------------|-------|-------------|
| `research` | 2a | 收集相关资源、文档和库 |
| `codebase analysis` | 2b | 确定受影响的文件、接口和集成点 |
| `business analysis` | 2c | 细化描述并创建验收标准（检查清单、常规检查、评分标准、测试策略、完成定义） |
| `architecture synthesis` | 3 | 将研究和分析综合为架构 |
| `decomposition` | 4 | 拆分为按步骤划分的子任务文件，并归入可验证的阶段，同时明确依赖关系、并行组以及代理/模型分配 |

### 配置解析

解析 `$ARGUMENTS`，并按如下方式解析配置：

```

# Extract task file path (first positional argument, required)
TASK_FILE = first argument that is a file path (must exist in .specs/tasks/draft/)

# Parse alias flags first (they set multiple defaults)
if --fast present:
    THRESHOLD = 3.0
    MAX_ITERATIONS = 1
    INCLUDED_STAGES = ["business analysis", "decomposition"]

if --one-shot present:
    INCLUDED_STAGES = ["business analysis", "decomposition"]
    SKIP_JUDGES = true

# Initialize defaults
THRESHOLD ?= --target-quality || 3.5
MAX_ITERATIONS ?= --max-iterations || 3
INCLUDED_STAGES ?= --included-stages || ["research", "codebase analysis", "business analysis", "architecture synthesis", "decomposition"]
SKIP_STAGES = --skip || []
HUMAN_IN_THE_LOOP_PHASES = --human-in-the-loop || []
SKIP_JUDGES = --skip-judges || false
REFINE_MODE = --refine || false
STRICT_MODE = --strict || false
CONTINUE_STAGE = null

# Model tiers - governed in full by the Model Selection Policy
MODEL_OVERRIDE = --model || null
BASELINE_TIER = MODEL_OVERRIDE || tier of the overall task per the Selection Rules


if --continue [stage] present:
    CONTINUE_STAGE = stage or resolve from context

# Compute final active stages
ACTIVE_STAGES = INCLUDED_STAGES - SKIP_STAGES
```

### `--continue` 的上下文解析

在不提供显式阶段的情况下使用 `--continue` 时：

1. **阶段解析：**
   - 解析任务文件中的完成标记（例如 `[x]` 复选框）
   - 确定最后一个已完成的阶段/评审
   - 从下一个未完成的阶段继续

### `--refine` 的行为

使用 `--refine` 时：

1. **变更检测：**
   - 首先检查文件状态：`git status --porcelain -- <TASK_FILE>`
   - 将当前任务文件与上一次 Git 提交进行比较：`git diff HEAD -- <TASK_FILE>`
     - 这会捕获相对于 HEAD 的已暂存和未暂存变更
   - 如果文件未被跟踪或没有 Git 历史记录，则与原始任务结构进行比较
   - 确定用户修改了哪些部分
   - 查找表示用户反馈/修正的 `//` 注释标记

2. **从上到下传播：**
   - 确定**最早的已修改部分**（在文档中的位置最高）
   - 仅重新运行与已修改部分对应或位于其**之后**的阶段
   - 修改部分之前的阶段（位于修改部分上方）保持不变

3. **章节到阶段的映射：**

   | 修改的章节 | 从哪个阶段重新运行 |
   |------------------|-------------------|
   | 描述 / 验收标准（检查清单、常规检查、评分标准、测试策略、完成定义） | `business analysis`（阶段 2c） |
   | 架构概览 | `architecture synthesis`（阶段 3） |
   | 实现流程（并行化概览 / 阶段概览），或 `.specs/sub-tasks/<task-name>/` 下的任何子任务文件 | `decomposition`（阶段 4） |

   实现流程章节和子任务文件由同一阶段生成，因此修改其中任一项都会重新运行整个阶段 4。

4. **细化执行：**
   - 除非明确要求，否则跳过研究（2a）和代码库分析（2b）
   - 将用户修改和 `//` 注释作为额外上下文传递给代理
   - 代理应在保留未修改内容的同时纳入用户反馈

5. **示例：**

   ```bash
   # User edited the Architecture Overview section
   /plan .specs/tasks/todo/my-task.feature.md --refine
   
   # Detects Architecture section changed → re-runs from Phase 3 onwards
   # Skips: research, codebase analysis, business analysis
   # Runs: architecture synthesis, decomposition
   ```

### 人机协作行为

人工验证检查点发生在：

1. **触发条件：**
   - `HUMAN_IN_THE_LOOP_PHASES` 中某个阶段的实现 + 评审验证**通过**后
   - 实现 + 评审 + 实现重试之后（下一次评审重试之前）

2. **在检查点：**
   - 显示当前阶段结果摘要
   - 显示生成的产物及其路径
   - 显示评审得分和反馈
   - 向用户询问：“Review phase output. Continue? [Y/n/feedback]”
   - 如果用户提供反馈，则将其纳入下一次迭代
   - 如果用户输入“n”，则暂停工作流

3. **检查点消息格式：**

   ```markdown
   ---
   ## 🔍 Human Review Checkpoint - Phase X

   **Phase:** {phase name}
   **Judge Score:** {score}/{THRESHOLD} threshold
   **Status:** ✅ PASS / ☑️ ACCEPTED / ⚠️ RETRY {n}/{MAX_ITERATIONS}

   **Artifacts:**
   - {artifact_path_1}
   - {artifact_path_2}

   **Judge Feedback:**
   {feedback summary}

   **Action Required:** Review the above artifacts and provide feedback or continue.

   > Continue? [Y/n/feedback]:
   ---
   ```

---

## 使用示例

```bash
# Refine a draft task with all stages
/plan .specs/tasks/draft/add-validation.feature.md

# Fast refinement with minimal stages
/plan .specs/tasks/draft/quick-fix.bug.md --fast

# Continue from a specific stage
/plan .specs/tasks/draft/complex-feature.feature.md --continue decomposition

# High-quality refinement with checkpoints
/plan .specs/tasks/draft/critical-api.feature.md --target-quality 4.5 --human-in-the-loop 2,3,4

# Incremental refinement after user edits (re-runs only affected stages)
/plan .specs/tasks/todo/my-task.feature.md --refine

# Strict mode: never accept a phase below target - retry until THRESHOLD or MAX_ITERATIONS
/plan .specs/tasks/draft/critical-api.feature.md --strict
```

## 启动前检查

开始工作流之前：

1. **验证任务文件存在：**
   - 如果 `REFINE_MODE` 为 false：检查 `TASK_FILE` 是否存在于 `.specs/tasks/draft/`
   - 如果 `REFINE_MODE` 为 true：检查 `TASK_FILE` 是否存在于 `.specs/tasks/todo/` 或 `.specs/tasks/draft/`
   - 如果未找到，显示错误并退出

2. **解析并显示已解析的配置：**

   ```markdown
   ### Configuration

   | Setting | Value |
   |---------|-------|
   | **Task File** | {TASK_FILE} |
   | **Target Quality** | {THRESHOLD}/5.0 |
   | **Max Iterations** | {MAX_ITERATIONS} |
   | **Active Stages** | {ACTIVE_STAGES as comma-separated list} |
   | **Human Checkpoints** | Phase {HUMAN_IN_THE_LOOP_PHASES as comma-separated} |
   | **Skip Judges** | {SKIP_JUDGES} |
   | **Refine Mode** | {REFINE_MODE} |
   | **Strict Mode** | {STRICT_MODE} |
   | **Continue From** | {CONTINUE_STAGE} or "Start" |
   | **Model** | `{MODEL_OVERRIDE}` (user override) or "auto — baseline `{BASELINE_TIER}`: {one-line justification}" |
   ```

3. **处理 `--continue` 模式：**

   如果设置了 `CONTINUE_STAGE`：
   - 读取任务文件以获取当前状态
   - 根据任务文件内容识别已完成的阶段
   - 跳转到 `CONTINUE_STAGE`（或自动检测的下一个未完成阶段）
   - 从现有产物中预先填充已捕获的值
   - 从适当的阶段恢复工作流

4. **处理 `--refine` 模式：**

   如果 `REFINE_MODE` 为 true：
   - 检查文件状态：`git status --porcelain -- <TASK_FILE>`
     - `M`（已暂存）或 `M`（未暂存）或 `MM`（两者）→ 使用 diff 继续
     - `??`（未跟踪）→ 错误："File not tracked by git, cannot detect changes"
     - 输出为空 → 未检测到更改
   - 运行 `git diff HEAD -- <TASK_FILE>`，获取相对于上次提交的所有更改（已暂存 + 未暂存）
   - 解析 diff 以识别已修改的章节
   - 收集所有 `//` 注释标记作为用户反馈
   - 使用 Section-to-Stage Mapping 确定最早修改的章节
   - 将 `ACTIVE_STAGES` 设置为仅包含从确定的起始点开始的阶段
   - 将检测到的更改和用户评论作为额外上下文传递给 agents
   - 如果未检测到更改，通知用户："No changes detected in task file. Edit the file first, then run --refine." 并退出

5. **从文件中提取任务信息：**
   - 从文件名中读取任务文件以提取标题和类型
   - 解析 frontmatter 以获取 title 和 depends_on

6. **使用 TodoWrite 初始化工作流进度跟踪：**

   仅包含 `ACTIVE_STAGES` 中的阶段。如果是继续执行，将已完成的阶段标记为 `completed`。

   ```json
   {
     "todos": [
       {"content": "Ensure directories exist", "status": "pending", "activeForm": "Ensuring directories exist"},
       {"content": "Phase 2a: Research relevant resources and documentation", "status": "pending", "activeForm": "Researching resources"},
       {"content": "Judge 2a: PASS research quality (> {THRESHOLD})", "status": "pending", "activeForm": "Validating research"},
       {"content": "Phase 2b: Analyze codebase impact and affected files", "status": "pending", "activeForm": "Analyzing codebase impact"},
       {"content": "Judge 2b: PASS codebase analysis (> {THRESHOLD})", "status": "pending", "activeForm": "Validating codebase analysis"},
       {"content": "Phase 2c: Business analysis and acceptance criteria", "status": "pending", "activeForm": "Analyzing business requirements"},
       {"content": "Judge 2c: PASS business analysis (> {THRESHOLD})", "status": "pending", "activeForm": "Validating business analysis"},
       {"content": "Phase 3: Architecture synthesis from research and analysis", "status": "pending", "activeForm": "Synthesizing architecture"},
       {"content": "Judge 3: PASS architecture synthesis (> {THRESHOLD})", "status": "pending", "activeForm": "Validating architecture"},
       {"content": "Phase 4: Decompose into sub-task files and verifiable phases", "status": "pending", "activeForm": "Decomposing into steps and phases"},
       {"content": "Judge 4: PASS decomposition (> {THRESHOLD})", "status": "pending", "activeForm": "Validating decomposition"},
       {"content": "Move task to todo folder", "status": "pending", "activeForm": "Promoting task"},
       {"content": "Human checkpoint reviews", "status": "pending", "activeForm": "Awaiting human review"}
     ]
   }
   ```

**注意：** 根据配置筛选待办事项：
   - 如果 `SKIP_JUDGES` 为 true，则省略所有 Judge 待办事项（Judge 2a、2b、2c、3、4）
   - 如果 `research` 不在 `ACTIVE_STAGES` 中，则省略 Phase 2a 和 Judge 2a 待办事项
   - 如果 `codebase analysis` 不在 `ACTIVE_STAGES` 中，则省略 Phase 2b 和 Judge 2b 待办事项
   - 如果 `business analysis` 不在 `ACTIVE_STAGES` 中，则省略 Phase 2c 和 Judge 2c 待办事项
   - 如果 `architecture synthesis` 不在 `ACTIVE_STAGES` 中，则省略 Phase 3 和 Judge 3 待办事项
   - 如果 `decomposition` 不在 `ACTIVE_STAGES` 中，则省略 Phase 4 和 Judge 4 待办事项
   - 如果 `HUMAN_IN_THE_LOOP_PHASES` 为空，则省略人工检查点待办事项

7. **确保目录存在**：

   运行文件夹创建脚本，以创建任务目录并配置 gitignore：

   ```bash
   bash ${CLAUDE_PLUGIN_ROOT}/scripts/create-folders.sh
   ```

   该脚本会创建：

   - `.specs/tasks/draft/` - 等待分析的新任务
   - `.specs/tasks/todo/` - 准备实现的任务
   - `.specs/tasks/in-progress/` - 当前正在处理的任务
   - `.specs/tasks/done/` - 已完成的任务
   - `.specs/sub-tasks/` - 由 Phase 4 写入的、按步骤拆分的子任务文件（纳入 git 跟踪）
   - `.specs/scratchpad/` - 临时工作文件（已加入 gitignore）
   - `.specs/analysis/` - 代码库影响分析文件
   - `.claude/skills/` - 可复用的 skill 文档

开始某个阶段时，将每个待办事项更新为 `in_progress`；judge 通过后，将其更新为 `completed`。

## 关键要求

- 绝不要记录 judge 报告不支持的结论：没有通过评审规则的结果时不得记录 PASS，也不得在 [Iteration Discretion Rule](#iteration-discretion-rule) 实际允许之前记录 ☑️ ACCEPTED。否则，在每次实现变更后都要重新运行 judge，直到通过检查！
- 不要读取 `.claude` 或 `.specs` 目录中的任务文件，你的工作是编排负责执行工作的 agent，而不是亲自完成这些工作！
- 所有 judge 的通过/失败判定都使用 `THRESHOLD`（默认为 3.5），不要使用硬编码值！
- 重试次数限制使用 `MAX_ITERATIONS`（默认为 3），不要使用硬编码值！
- **达到 `MAX_ITERATIONS` 后：自动继续进入下一阶段——除非该阶段位于 `HUMAN_IN_THE_LOOP_PHASES` 中，否则不要询问用户！**
- 完全跳过不在 `ACTIVE_STAGES` 中的阶段——不要为被排除的阶段启动 agent！
- 仅在 `HUMAN_IN_THE_LOOP_PHASES` 中的阶段结束后触发人工介入检查点！
- **如果 `SKIP_JUDGES` 为 true：跳过所有 judge 验证——每个实现阶段完成后直接进入下一阶段！**
- **运行此命令前，任务文件必须存在于 `.specs/tasks/draft/` 中（`--refine` 模式除外）！**
- **如果 `REFINE_MODE` 为 true：通过 git diff 检测变更，跳过未发生变化的阶段，并将用户反馈传递给 agent！**
- **如果 `STRICT_MODE` 为 true：则禁用 [Iteration Discretion Rule](#iteration-discretion-rule)——阶段只有在 `score >= THRESHOLD` 时才算通过，否则持续重试直到 `MAX_ITERATIONS`！**

### 执行与评估规则

- **仅使用前台 agent**：不要使用后台 agent。尽可能启动并行 agent。后台 agent 经常会遇到权限问题和其他错误。

反复重新启动 judge，直到获得有效结果，或发生以下情况：

- 拒绝过长报告：如果 agent 返回了非常长的报告，而不是按要求使用 scratchpad，则拒绝该结果。这表明 agent 未能遵循“使用 scratchpad”的指令。
- Judge 评分 5.0 属于幻觉：如果 judge 返回 5.0/5.0 的评分，则将其视为幻觉或敷衍式评估。拒绝该结果并重新运行 judge。在这一严格框架下，满分几乎不可能出现。
- 拒绝缺少评分的结果：如果 judge 报告缺少数值评分，则拒绝该报告。这表明 judge 未能阅读或遵循评分标准说明。

#### 迭代裁量规则

你的主要任务是在目标质量范围内**完成**规划。以下两种失败模式同样真实存在：

- 因为在细枝末节上反复迭代，耗尽迭代次数和上下文，导致整体任务始终无法完成 → **任务失败**。
- 推进一个质量确实过低、不能视为已完成的计划 → **更严重的失败**。

该规则约束每个阶段的 `**Decision Logic:**` 区块：

- **`score < 3.0` → 无条件 FAIL。** 使用 judge 反馈重新启动该阶段，直到通过或达到 `MAX_ITERATIONS`。
- **`3.0 <= score < 5.0` → 裁量区间。** 只有在此区间内，才可以决定接受低于 `THRESHOLD`（默认值为 3.5）的阶段。
- **有界下降：** 永远不得接受低于 `THRESHOLD` 超过 `1.0` 的评分——有效下限为 `max(3.0, THRESHOLD - 1.0)`，即默认 `THRESHOLD` 为 3.5 时下限为 `3.0`，使用 `--target-quality 4.5` 时下限为 `3.5`。当 `THRESHOLD <= 3.0`（例如 `--fast`）时，完全不存在裁量区间。
- 在该区间内，只有当剩余问题**仅**属于低/中优先级（任何高或严重级别的问题都会完全取消裁量权），并且这些问题均未违反该阶段的目标要求或造成有意义的缺陷（即只是细枝末节），你才**必须先进行推理**——在重新启动该阶段之前，先考虑继续迭代（或将阶段标记为失败）是否值得投入相应的时间和上下文成本。
- **最多进行一次由细枝末节问题驱动的迭代**，且该迭代计入 `MAX_ITERATIONS`。如果该次迭代仍然只发现细枝末节问题，则你**必须**将阶段标记为 PASS（在汇总表中标记为 ☑️ ACCEPTED），在完成摘要中报告剩余问题，然后继续下一个阶段。如果返回的评分低于下限 `max(3.0, THRESHOLD - 1.0)`，则适用 FAIL 路径。
- 你**必须**保持批判性，**不能**宽松处理。停止在目标分数之前必须是有意为之的决定，并且要以不存在真正的、违反要求的问题为依据。阻碍阶段在 `MAX_ITERATIONS` 内完成的真实阻塞问题必须报告为失败，绝不能掩盖。
- **如果 `STRICT_MODE` 为 true，则禁用整条规则**：只有在 `score >= THRESHOLD` 或达到 `MAX_ITERATIONS` 时才停止。`--strict` 不会改变其他任何内容——`THRESHOLD`、`MAX_ITERATIONS`、`< 3.0` 无条件 FAIL、人工介入检查点、judge 调度以及 `--skip-judges` 均不受影响。使用 `--skip-judges`（或 `--one-shot`）时根本不会生成评分，因此该规则和 `--strict` 均不起作用。

## 模型选择策略

选择模型是你所做的**最高杠杆决策**——它比提示词的措辞更重要，决定了计划能否正确返回，以及运行需要多长时间。你绝对不能把这当作例行程序：在派遣**每个**阶段代理之前，必须说明层级并给出一行理由。仅仅因为你不想思考就直接选择最强模型，这不是谨慎，而是失败。

**层级默认值：**`sonnet` 是工作默认值，`sonnet`/`haiku` 覆盖绝大多数运行场景。`opus` 是保留级别，必须主动选择——它必须由下表中的触发条件“赢得”，绝不能因为你不确定就选择它。

### 选择规则

根据下表评估**正在规划的整体任务**——草稿任务文件的标题和类型，以及用户输入。匹配的行就是本次运行的 `BASELINE_TIER`。（同一张表也会对*单个工作单元*进行分级，这正是第 4 阶段要原样接收它、为每个实现步骤分配模型的依据，也是 Judge 4 对这些分配进行评分的依据。）

| 任务形态 | 层级 | 示例 |
|---|---|---|
| **简单直接**——一个已经理解、形态明确的变更：单个文件，遵循既有模式，没有新依赖，也没有悬而未决的设计问题，并且从草稿中已经可以明确判断何时算“完成” | `haiku` | 修正文档中一个 README 的拼写错误，添加一个配置标志，升级依赖版本，修正日志消息 |
| **典型**——普通的功能、修复或重构工作：一个模块或服务内的少量文件，遵循既有模式，仅涉及局部设计选择 | `sonnet` | 为现有服务添加 REST 端点，添加表单验证，提取一个辅助函数及其测试 |
| **复杂**——**广度**（约 3 个或更多模块/服务，或任何涉及共享契约变更的广度）或**关键领域**（身份验证、支付/计费、数据完整性、不可逆迁移、公共 API 破坏性变更）或**开放式设计**（并发、非平凡算法、新子系统、架构尚未确定） | `opus` | 跨 12 个模块重新设计支付子系统，设计新的事件管道，规划架构迁移 |

**优先级（强制要求）：**必须评估每一行，而不只是匹配第一行。当多行匹配时，选择**匹配层级中最高的一个**——关键性和开放式设计始终优先于规模。**关键领域**列表是完整列举，而非示例：发布到生产环境、影响真实用户，或向现有公共 API 中*添加*内容，都不是触发条件，因此在单个服务中添加带验证的新端点仍然属于 `sonnet`。**机械式广度例外：**单纯的广度不构成复杂性——对于在多个文件中重复进行的同一项、由规则驱动且不包含逻辑变化和契约变更的编辑，仅有**广度**这一触发条件不适用（关键领域和开放式设计仍然适用）；应根据**单次出现**的情况进行分级。因此，跨 40 个文件执行机械式重命名属于 `haiku`，而将同样的重命名限定在 `src/auth/` 中则属于 `opus`。

**平局决胜规则：**只有在没有任何一行能够明确匹配时——任务确实介于两个层级之间——才选择 `sonnet`，即工作默认值。绝不能为了留有余地而倾向于选择 `opus`；[升级规则](#escalation-rule)会让一个适度的初始判断有机会得到纠正，而恢复一个阶段的成本远低于为每次运行的每个阶段都过度配置资源。

### 阶段权重

`BASELINE_TIER` 是**每个**由模型分配的阶段所使用的层级，只有一个明确的例外：

| 阶段 | 权重 | 层级 |
|---|---|---|
| 阶段 3：架构综合 | **Heavy** — 唯一一个需要做出开放式设计决策而非应用既定决策的阶段；三个输入在此处综合，之后的每个阶段以及实现本身都会继承其结果 | **比 `BASELINE_TIER` 高一个层级**，上限为 `opus` |
| 阶段 2a、2b、2c、4 | Standard | `BASELINE_TIER` |

每个由模型分配的阶段都恰好出现在一行中，因此每个阶段都会解析为恰好一个层级。上限意味着，当基线为 `opus` 时，所有阶段都保持为 `opus`。[Promotion](#promote-task) 是由你自行执行的文件移动操作——不涉及子代理，也不涉及层级。关于 `--model` 覆盖规则，请参阅 [Role Pairing](#role-pairing)。

**不要将其与计划内每个步骤的层级混淆。**上述层级规定的是你启动的*规划*代理所使用的层级。每个子任务文件中记录的 `Model:` 以及每个阶段记录的 `Reviewer model:`，由阶段 4 根据阶段 4 的启动提示所携带的逐步策略，为*实现*运行决定；它们与 `BASELINE_TIER` 相互独立。

### 角色配对

此流水线每个阶段有两个由模型分配的角色：**生产者**（阶段代理）和**评估者**（其评审者）。**评审者始终以其所验证阶段的层级运行**，包括升级之后。你绝不能为评审者单独设置不同于其阶段的层级。

**显式的 `--model` 会覆盖整套策略（关于此规则的唯一表述）：**每个阶段代理和每个评审者都以用户指定的层级运行，不执行 `BASELINE_TIER` 评估，并且 [Phase Weighting](#phase-weighting) 不会偏离该层级。

### 升级规则

当以下任一触发条件生效时，在该阶段的下一次迭代中，将**阶段代理和其评审者同时**提升一个层级：

1. **首次迭代质量较低**——得分较低，或评审者指出模型误解了阶段目标，而不仅仅是遗漏细节。
2. **用户提出质量过低或结果错误的抱怨**——无论何时，包括在报告 PASS 或运行结束之后。

层级阶梯：`haiku` → `sonnet` → `opus`。`opus` 是**上限**——不存在更高层级。如果 `opus` 层级的工作仍然失败，则报告该情况并将问题升级给**用户**；绝不能循环重试。

- **唯一例外——保持层级（关于此规则的唯一表述，仅适用于触发条件 (1)）：**当触发条件 (1) 生效，但评审者指出的是具体且可修复的缺陷，而非能力缺口（即模型显然理解了目标，只是存在范围狭窄且描述精确的问题）时，你**可以**保持当前层级，并将评审者的准确反馈传入，以**相同**层级重新启动该阶段，而不是提升层级。这是触发条件 (1) 下不强制提升的唯一情形；在其他所有情况下，触发条件 (1) 都必须提升层级。触发条件 (2) **没有**此类例外——根据下面的特殊规定，它始终会立即提升层级。
- **显式 `--model` 特殊规定（关于此规则的唯一表述）：**显式的 `--model` 是用户覆盖设置，因此触发条件 (1) **不得**在未告知的情况下覆盖它——报告低质量证据，*提出*提升层级的建议，并在用户批准前以用户指定的层级重新启动。触发条件 (2) 即表示用户已批准，因此会立即提升层级。
- **`--skip-judges` 特殊规定（关于此规则的唯一表述）：**没有运行评审者时，不存在可供触发条件 (1) 读取的得分或评审意见，因此触发条件 (1) 无法生效。触发条件 (2) 由用户发起，而非由评审者得出，因此不受影响——在 `--skip-judges`（或 `--one-shot`）下，用户提出抱怨仍会提升该阶段重新启动时所使用的层级。
- **仅作用于失败的阶段。**升级后的层级仅适用于该阶段剩余的迭代；之后的每个阶段都从其自身 [Phase Weighting](#phase-weighting) 所规定的层级开始。
- 升级是对真正根因修复的补充，而不是替代。你仍然**必须**将评审者的具体反馈传入重新启动过程；禁止仅以更高层级重新发送相同提示并寄希望于成功。
- 升级与 `THRESHOLD`、`MAX_ITERATIONS`、`STRICT_MODE` 以及 [Iteration Discretion Rule](#iteration-discretion-rule) 相互独立——它只改变下一次迭代由哪个模型运行，从不改变是否有必要进行迭代。当 Iteration Discretion Rule 接受某个阶段时，不会发生迭代，因此也不会触发升级。
- **已完成阶段的重新进入（关于此规则的唯一表述）：**✅ PASS 或 ☑️ ACCEPTED **不会**关闭工作。之后用户提出的质量抱怨会根据触发条件 (2) 重新进入该阶段——通过 `--continue` 或 `--refine`——并且该阶段的 `MAX_ITERATIONS` **会重置**，同时阶段代理和其评审者都以提升后的层级运行。

### 跨提供商等效性

当此技能在 Anthropic 模型上下文之外运行时，将层级映射到同一类别中最接近的模型：

| 层级 | 角色 | 其他提供商的可比模型 |
|---|---|---|
| `haiku` | 快速且廉价；机械性工作 | `gemini-flash-lite`、`gemma` 类、`gpt-oss` 类、小型开放权重模型 |
| `sonnet` | 均衡的主力模型；适用于大多数规划阶段 | `gemini-pro` 类和完整的 `gemini-flash`（**不是** `-lite` 变体，后者属于 `haiku` 层级）、`GPT-5-mini` 类、大型 `Qwen` / `DeepSeek` 类模型 |
| `opus` | 前沿推理；关键或复杂工作 | 该提供商所提供的扩展式 / 深思熟虑推理层级——当前包括 `GPT-5.5`、深度思考模式、`Kimi K3` 类，以及任何优势在于更长时间审慎推理而非吞吐量的模型 |

映射依据是**能力层级，而不是名称**——随着供应商发布新模型，具体名称会不断变化。上面的每条规则都以层级表示，因此在其他提供商上：将层级映射到该提供商中对应类别的模型，然后原样应用选择、加权、配对和升级规则。

## 工作流执行

对于每个步骤，你**必须**启动一个单独的代理，而不是自行执行所有步骤。

**重要：** 对于每个代理，你**必须**：

1. 使用阶段中指定的 **Agent** 类型，以及根据[模型选择策略](#model-selection-policy)确定的 **Model** 层级
2. 将任务文件路径和用户输入作为上下文提供给代理
3. **提供 `${CLAUDE_PLUGIN_ROOT}` 的值，以便代理能够解析 `@${CLAUDE_PLUGIN_ROOT}/scripts/create-scratchpad.sh` 等路径**
4. 要求代理严格执行该步骤，不多做，也不少做
5. 在每个子阶段之后，启动一个评审代理，在继续之前验证质量

### 完整工作流概览

**注意：** 不在 `ACTIVE_STAGES` 中的阶段将被跳过。如果 `SKIP_JUDGES` 为 true，则所有评审步骤都会被完全跳过。人工检查点（🔍）会在 `HUMAN_IN_THE_LOOP_PHASES` 中的阶段之后出现。

```
Input: Draft Task File (.specs/tasks/draft/*.md)
    │
    ▼
Phase 2: Parallel Analysis
    │
    ├─────────────────────┬─────────────────────┐
    ▼                     ▼                     ▼
Phase 2a:             Phase 2b:             Phase 2c:
Research              Codebase Analysis     Business Analysis
[sdd:researcher]      [sdd:code-explorer]   [sdd:business-analyst]
all three at baseline tier
Judge 2a              Judge 2b              Judge 2c
(pass: >THRESHOLD)     (pass: >THRESHOLD)     (pass: >THRESHOLD)
    │                     │                     │
    └─────────────────────┴─────────────────────┘
                          │
                          ▼
                    Phase 3: Architecture Synthesis
                    [sdd:software-architect] baseline+1 (cap opus)
                    Judge 3 (pass: >THRESHOLD)
                          │
                          ▼
                    Phase 4: Decomposition
                    [sdd:tech-lead] baseline
                    → task file: ## Implementation Process
                    → .specs/sub-tasks/<task-name>/NN-<step-slug>.md
                    Judge 4 (pass: >THRESHOLD)
                          │
                          ▼
                    Move task: draft/ → todo/
                          │
                          ▼
                    Complete
```

---

## 阶段 2：并行分析

阶段 2 并行启动三个分析阶段，每个阶段都有各自的评审验证。

### 阶段 2a/2b/2c：并行子阶段

立即**并行**启动以下三个阶段：

---

#### 阶段 2a：研究

**模型：** 根据 [阶段权重](#phase-weighting) 使用 `BASELINE_TIER` — 标准权重：为范围已确定的任务收集和总结资源，不涉及设计决策。  
**Agent：** `sdd:researcher`  
**依赖：** 任务文件存在  
**目的：** 收集相关资源、文档、库和现有方案。创建或更新可复用的 skill。

启动 agent：

- **描述**："研究任务资源并创建/更新 skill"
- **提示**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>
  Task Title: <title from task file>

  CRITICAL: DO NOT OUTPUT YOUR RESEARCH, ONLY CREATE THE SCRATCHPAD AND SKILL FILE.
  ```

**记录：**

- Skill 文件路径（例如 `.claude/skills/<skill-name>/SKILL.md`）
- Skill 操作（新建 / 更新现有）
- Scratchpad 文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 收集的资源数量
- 关键建议摘要

重要：如果未创建预期文件，则使用相同提示再次启动该 agent。

---

#### 阶段 2b：代码库影响分析

**模型：** 根据 [阶段权重](#phase-weighting) 使用 `BASELINE_TIER` — 标准权重：读取代码库以定位文件和集成点，其工作量与任务自身的范围相匹配，基线已经反映了这一点。  
**Agent：** `sdd:code-explorer`  
**依赖：** 任务文件存在  
**目的：** 确定受影响的文件、接口和集成点

启动 agent：

- **描述**："分析代码库影响"
- **提示**：

  ```text
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>
  Task Title: <title from task file>

  CRITICAL: DO NOT OUTPUT YOUR ANALYSIS, ONLY CREATE THE SCRATCHPAD AND ANALYSIS FILE.
  ```

**记录：**

- 分析文件路径（例如 `.specs/analysis/analysis-{name}.md`）
- Scratchpad 文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 受影响的文件数量（修改/创建/删除）
- 风险级别评估
- 关键集成点

重要：如果未创建预期文件，则使用相同提示再次启动该 agent。

---

#### 阶段 2c：业务分析

**模型：** 根据 [阶段权重](#phase-weighting) 使用 `BASELINE_TIER` — 标准权重：由 agent 自身的 STAGES 1-10 端到端驱动结构化信息提取，以及检查清单/评分标准/测试策略的推导，而不是开放式综合分析——这里的严谨性来自流程，而非模型。  
**Agent：** `sdd:business-analyst`  
**依赖：** 任务文件存在  
**目的：** 细化描述，并生成唯一的 `## Acceptance Criteria` 部分——包括检查清单、常规检查、评分标准、评分定义、测试策略和完成定义，混合业务与技术标准

启动 agent：

- **描述**："业务分析"
- **提示**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>
  Task Title: <title from task file>

  Execute your own Core Process (STAGES 1-10) in full. 

  CRITICAL: DO NOT OUTPUT YOUR BUSINESS ANALYSIS. Create the scratchpad, then write the task file's `# Description` and the single `## Acceptance Criteria` section at your STAGE 10.
  ```

**捕获：**

- Scratchpad 文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 是否定义了范围（是/否）
- 是否记录了用户场景
- 检查清单项目数量（必需 / 重要 / 可选 / 陷阱）
- 常规检查数量
- 评估标准维度数量（权重总和：1.0）
- 测试策略是否适用（true/false）以及所选测试类型
- 是否发现质量门禁和项目指南

关键：如果任务文件的 `# Description` 或 `## Acceptance Criteria` 部分尚未编写，则使用相同的提示词再次启动该代理。

---

### Judge 2a/2b/2c：验证并行阶段

每个并行阶段完成后，使用与该阶段相同的代理类型，并按照 [角色配对](#role-pairing) 指定的层级启动相应的评审代理。

#### Judge 2a：验证研究/技能

**模型：** Phase 2a 的层级 — 参见 [角色配对](#role-pairing)  
**代理：** `sdd:researcher`  
**依赖：** Phase 2a 完成  
**目的：** 验证技能的完整性和相关性

启动评审代理：

- **描述**："评审技能质量"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to skill file from Phase 2a}

  ### Context
  This is a skill document for task: {task title}. Evaluate comprehensiveness and reusability.

  ### Rubric
  1. Resource Coverage (weight: 0.30)
     - Documentation and references gathered?
     - Libraries and tools identified with recommendations?
     - 1=Missing critical resources, 2=Basic coverage, 3=Adequate, 4=Comprehensive, 5=Excellent

  2. Pattern Relevance (weight: 0.25)
     - Are identified patterns applicable?
     - Are recommendations actionable?
     - 1=Irrelevant, 2=Somewhat useful, 3=Adequate, 4=Well-targeted, 5=Perfect fit

  3. Issue Anticipation (weight: 0.20)
     - Common pitfalls identified with solutions?
     - 1=None identified, 2=Few issues, 3=Adequate, 4=Good coverage, 5=Comprehensive

  4. Reusability (weight: 0.15)
     - Is the skill general enough to help multiple tasks?
     - Does it avoid task-specific details?
     - 1=Too specific, 2=Limited reuse, 3=Adequate, 4=Good, 5=Highly reusable

  5. Task Integration (weight: 0.10)
     - Was task file updated with skill reference?
     - 1=Not updated, 3=Updated, 5=Updated with clear instructions
  ```

关键：严格按原样使用提示词，不要添加任何其他内容。包括实现代理的输出！！！

**决策逻辑：**

- **PASS**（得分 >= `THRESHOLD`）：研究完成，继续执行
- **FAIL**（得分 < `THRESHOLD`）：根据 [升级规则](#escalation-rule) 中规定的层级，使用反馈重新启动 Phase 2a（除非根据 [迭代酌情处理规则](#iteration-discretion-rule) 接受）
- **达到 MAX_ITERATIONS**：无论得分如何都继续进入下一阶段（记录警告）

---

#### Judge 2b：验证代码库分析

**模型：** Phase 2b 的层级 — 参见 [角色配对](#role-pairing)  
**代理：** `sdd:code-explorer`  
**依赖：** Phase 2b 完成  
**目的：** 验证文件识别的准确性和集成映射-vesm

启动评审器：

- **描述**："评审代码库分析质量"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to analysis file from Phase 2b}

  ### Context
  This is codebase impact analysis for task: {task title}. Evaluate accuracy and completeness.

  ### Rubric
  1. File Identification Accuracy (weight: 0.35)
     - All affected files identified with specific paths?
     - New files and modifications distinguished?
     - 1=Major files missing, 2=Mostly correct, 3=Adequate, 4=Precise, 5=Complete

  2. Interface Documentation (weight: 0.25)
     - Key functions/classes documented with signatures?
     - Change requirements clear?
     - 1=Missing, 2=Partial, 3=Adequate, 4=Good, 5=Complete

  3. Integration Point Mapping (weight: 0.25)
     - Integration points identified with impact?
     - Similar patterns in codebase found?
     - 1=Missing, 2=Partial, 3=Adequate, 4=Good, 5=Comprehensive

  4. Risk Assessment (weight: 0.15)
     - High risk areas identified with mitigations?
     - 1=No assessment, 2=Basic, 3=Adequate, 4=Good, 5=Thorough
  ```

**关键要求：**严格按原样使用提示词，不要添加任何其他内容。包括实现代理的输出!!!

**决策逻辑：**

- **通过**（分数 >= `THRESHOLD`）：分析完成，继续执行
- **失败**（分数 < `THRESHOLD`）：根据 [升级规则](#escalation-rule) 中指定的层级重新启动 Phase 2b（除非根据 [迭代裁量规则](#iteration-discretion-rule) 接受）
- **达到 `MAX_ITERATIONS`**：无论分数如何都继续下一阶段（记录警告）

---

#### 评审器 2c：验证业务分析

**模型：**Phase 2c 的层级 — 参见 [角色配对](#role-pairing)  
**代理：**`sdd:business-analyst`  
**依赖：**Phase 2c 完成  
**目的：**验证经过细化的描述以及整个 `## Acceptance Criteria` 部分——检查清单、常规检查、评分标准、分数定义、测试策略和完成定义  
**权重推导：**标准 1-4 是原业务分析标准，按其原有比例（0.30/0.35/0.20/0.15）乘以 0.60 后得出，四舍五入产生的 0.01 余数分配给其中权重最高的标准，总计为 0.61；标准 5-7——在将评分标准和测试策略审查合并到此评审器时引入——将剩余的 0.39 平均分配，每项为 0.13。添加或删除标准时，保持 0.61/0.39 的分配比例，使权重总和仍为 1.00。

启动评审器：

- **描述**："评审业务分析质量"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to task file from Phase 2c}

  ### Context
  This is business analysis output. The task file should contain a refined `# Description`
  (with Scope Included/Excluded and User Scenarios) and exactly one `## Acceptance Criteria`
  section holding six sub-blocks in this order: `**Checklist:**` (table
  `| ID | Question | Category | Importance |`, IDs `CK-n`/`HR-n`), `**Regular Checks:**`
  (checkbox list), `**Rubric:**` (table `| Criterion | Weight |`), `**Rubric Score Definitions:**`
  (one `###` section per criterion, each ending in an `Anchors` list carrying `score_2`, `score_4`
  and `contrast` — excerpt anchors that pin 2 and 4, NOT 1-5 bins), `**Test Strategy:**` (Criticality + Test Matrix
  table + `Test Cases to Cover` grouped under `#### CK-N:` headings) and `**Definition of Done:**`.
  Business and technical criteria are mixed inside each sub-block — there is no separate business
  criteria list, and no section other than `## Acceptance Criteria` may carry evaluation content.

  ### Rubric
  1. Description Clarity (weight: 0.18)
     - What/Why/Who clearly explained?
     - Business value stated, constraints named?
     - 1=Vague, 2=Basic, 3=Adequate, 4=Clear, 5=Excellent

  2. Criteria Quality (weight: 0.22)
     - Is every `**Checklist:**` row a boolean YES/NO question that is specific and testable?
     - Are Category (`hard_rule`/`principle`) and Importance filled for every row, with stable `CK-n`/`HR-n` IDs?
     - Do business and technical criteria appear mixed, rather than as a separate business list?
     - Is `**Definition of Done:**` present and derived from those criteria?
     - 1=Missing/vague, 2=Basic, 3=Adequate, 4=Good, 5=Excellent

  3. Scenario Coverage (weight: 0.12)
     - Primary, alternative and error flows documented under **User Scenarios**?
     - Are the error and edge scenarios actually represented by checklist items or test cases?
     - 1=Missing, 2=Basic, 3=Adequate, 4=Good, 5=Comprehensive

  4. Scope Definition (weight: 0.09)
     - In-scope/out-of-scope explicit?
     - No implementation details in the description?
     - No invented file paths — artifacts cited only where the user prompt named them?
     - 1=Missing, 2=Partial, 3=Adequate, 4=Good, 5=Clear

  5. Rubric Quality (weight: 0.13)
     - Are `**Rubric:**` criteria specific to this task (not generic)?
     - Do the weights sum to 1.0?
     - Does EVERY criterion in `**Rubric Score Definitions:**` carry an `Anchors` list naming all three of `score_2`, `score_4` and `contrast`, with no 1-5 bins, ratios, percentages or quality bands in its description or classification/instruction paragraph? (A `score_2`/`score_4` anchor excerpt may legitimately quote a figure — this restriction does not reach the anchors themselves.)
     - Is each `score_2` / `score_4` a concrete excerpt of the deliverable a reader could point at (fenced text), NEVER a description of quality — `score_2` obviously FAILING that dimension and `score_4` obviously SATISFYING it?
     - Do a criterion's two anchors differ on EXACTLY ONE observable thing, with its one-line `contrast` naming that single difference, so a judge can place an artifact between or past them on that axis alone?
     - Is `Project Guidelines Alignment` present when project guideline files exist?
     - 1=Generic/broken rubrics, 2=Adequate, 3=Acceptable, 4=Good custom rubrics, 5=Excellent custom rubrics

  6. Coverage Completeness (weight: 0.13)
     - Are all six sub-blocks present, in order, under a single `## Acceptance Criteria`?
     - Does `**Regular Checks:**` use the project's actual discovered build/lint/test commands rather than placeholders?
     - Is every checklist item carried by at least one rubric criterion, regular check or test case — no orphans?
     - Is the task file free of scoring configuration (threshold values, judge counts, evaluation modes) and of any evaluation section other than `## Acceptance Criteria`?
     - 1=Missing sub-blocks or orphans, 2=Most covered, 3=Acceptable, 4=Good, 5=100% coverage

  7. Test Strategy Coverage (weight: 0.13)
     - When the task carries testable behaviour, is `**Test Strategy:**` present with Criticality, a Test Matrix table (`| Type | Size | Framework | Dependencies | Gate |`) and a `Test Cases to Cover` list?
     - Is every group headed `#### CK-N:` naming a checklist item that exists, with cases in `- [type] description` form?
     - Does every testable checklist item have at least one test case (no orphans), and every Test Matrix row a corresponding case?
     - If the strategy does not apply, is that stated with a reason rather than silently omitted?
     - 1=Missing/empty Test Strategy, 2=Present but orphaned or unheaded groups, 3=All blocks present, 4=Full coverage of testable items, 5=Ideal coverage with boundary cases enumerated
  ```

关键要求：按原样使用 prompt，不得添加任何其他内容。包括 implementation agent 的输出！！！

**决策逻辑：**

- **PASS**（score >= `THRESHOLD`）：业务分析完成，继续执行
- **FAIL**（score < `THRESHOLD`）：根据 [升级规则](#escalation-rule)，在相应层级重新启动阶段 2c，并附带反馈（除非根据 [迭代裁量规则](#iteration-discretion-rule) 接受）
- 已达到 **MAX_ITERATIONS**：无论得分如何都继续进入下一阶段（记录警告）

---

### 同步点

**等待全部三个并行阶段（2a、2b、2c）及其评审者均通过后，再继续执行阶段 3。**

---

## 阶段 3：架构综合

**模型：** 比 `BASELINE_TIER` 高一个层级，最高限制为 `opus`，具体依据 [阶段权重](#phase-weighting) — 唯一的**重型**阶段：它决定解决方案策略和权衡，后续每个阶段以及实现都将继承这些决策。  
**Agent：** `sdd:software-architect`  
**依赖：** 阶段 2a + 评审者 2a PASS、阶段 2b + 评审者 2b PASS、阶段 2c + 评审者 2c PASS  
**目的：** 将研究、分析和业务需求综合为架构概览

启动 agent：

- **Description**："架构综合"
- **Prompt**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>
  Skill File: <skill file path from Phase 2a>
  Analysis File: <analysis file path from Phase 2b>

  CRITICAL: DO NOT OUTPUT YOUR ARCHITECTURE SYNTHESIS, ONLY CREATE THE SCRATCHPAD AND UPDATE THE TASK FILE.
  ```

**记录：**

- Scratchpad 文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 添加到任务文件中的章节
- 关键架构决策数量
- 已识别的组件（如适用）
- 已定义的契约（如适用）

---

### 评审者 3：验证架构综合

**模型：** 阶段 3 的层级 — 参见 [角色配对](#role-pairing)  
**Agent：** `sdd:software-architect`  
**依赖：** 阶段 3 完成  
**目的：** 验证架构的一致性和完整性

启动评审者：

- **Description**："评审架构综合质量"
- **Prompt**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to task file after Phase 3}

  ### Context
  This is architecture synthesis output. The Architecture Overview section should contain
  solution strategy, key decisions, and only relevant architectural sections.

  ### Rubric
  1. Solution Strategy Clarity (weight: 0.30)
     - Approach clearly explained?
     - Key decisions documented with reasoning?
     - Trade-offs stated?
     - 1=Missing/unclear, 2=Basic, 3=Adequate, 4=Clear, 5=Excellent

  2. Reference Integration (weight: 0.20)
     - Links to research and analysis files?
     - Insights from both integrated?
     - 1=No links, 2=Partial, 3=Adequate, 4=Good, 5=Fully integrated

  3. Section Relevance (weight: 0.25)
     - Only relevant sections included (not all)?
     - Sections appropriate for task complexity?
     - 1=Wrong sections, 2=Mostly appropriate, 3=Adequate, 4=Good, 5=Precisely targeted

  4. Expected Changes Accuracy (weight: 0.25)
     - Files to create/modify listed?
     - Consistent with codebase analysis?
     - 1=Missing/inconsistent, 2=Partial, 3=Adequate, 4=Good, 5=Complete

  ```

关键：完全按原样使用提示词，不要添加任何其他内容。包括实现代理的输出!!!

**决策逻辑：**

- **PASS**（得分 >= `THRESHOLD`）：架构综合完成，继续执行
- **FAIL**（得分 < `THRESHOLD`）：根据[升级规则](#escalation-rule)中规定的层级重新启动第 3 阶段（除非根据[迭代裁量规则](#iteration-discretion-rule)予以接受）
- **达到 MAX_ITERATIONS**：无论得分如何，都继续执行第 4 阶段（记录警告）

---

## 第 4 阶段：分解

**模型：** 根据[阶段权重](#phase-weighting)使用 `BASELINE_TIER` — 标准权重：该阶段应用的是已经确定的架构，而不是做开放式设计决策，但仍然要求对每个步骤进行实质性判断——针对该任务自身步骤的风险与缓解措施、既不过度约束也不约束不足的依赖关系图，以及每个阶段边界都落在一个可正常运行且可验证的里程碑上（参见 Judge 4 的风险覆盖、依赖准确性和阶段设计标准）。  
**代理：** `sdd:tech-lead`  
**依赖：** 第 3 阶段 + Judge 3 PASS  
**目的：** 将架构拆分为实现步骤，将每个步骤编写为独立的子任务文件，并将这些步骤分组为具有独立可验证性的阶段，同时为每个阶段指定依赖关系、并行组、每个步骤的代理/模型分配以及审查者模型

启动代理：

- **描述**："分解为子任务文件和阶段"
- **提示词：**

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>

  Use agents only from this list: {list ALL available agents with plugin prefix if available, e.g. sdd:developer, review:bug-hunter. Also include general agents: opus, sonnet, haiku}

  Assign each step's model tier per this policy:
  {paste the Selection Rules table plus its Precedence and Tie-breaker paragraphs from the orchestrator's Model Selection Policy verbatim, applied per implementation step; drop the cross-reference links, which do not resolve outside that file}

  CRITICAL: DO NOT OUTPUT YOUR DECOMPOSITION. Create the scratchpad, write ONLY the `## Implementation Process` section (Parallelization Overview + Phase Overview) into the task file, and write every step as its own file under `.specs/sub-tasks/<task-name>/`.
  ```

**记录：**

- 临时记录文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 子任务目录（`.specs/sub-tasks/<task-name>/`）以及已写入的子任务文件
- 实现步骤数量（以及其中合并的数量）
- 子任务总数
- 阶段数量，以及每个阶段的步骤和审查者模型
- 关键路径步骤
- 最大并行宽度（峰值并发步骤数 — 必须为 1–5）
- 代理/模型分布
- 高优先级风险数量

关键：如果缺少 `## Implementation Process` 部分，或并行化概览中列出的任何子任务文件缺失，则使用相同的提示词再次启动代理。

---

### Judge 4：验证分解

**模型：** 第 4 阶段的层级 — 参见[角色配对](#role-pairing)  
**代理：** `sdd:tech-lead`  
**依赖：** 第 4 阶段完成  
**目的：** 验证步骤质量、子任务文件完整性、依赖关系和并行化的准确性、代理/模型分配以及阶段设计

启动评审器：

- **Description**: "评估分解质量"
- **Prompt**:

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to task file after Phase 4}
  {path to the sub-task directory from Phase 4, e.g. .specs/sub-tasks/<task-name>/} — evaluate EVERY file in it

  ### Context
  This is decomposition output, written across two places. The task file carries ONLY the
  `## Implementation Process` section: the sub-agent execution directive that governs how each step
  is launched and how each phase is reviewed (its required content is spelled out under Completeness
  below), a `### Parallelization Overview` (ASCII diagram with phase boundaries plus a step table
  with columns `Step | Phase | Model | Agent | Depends on | Parallel with | Sub-Task File`) and a
  `### Phase Overview` (per phase: `#### Phase N`, `Steps:`, `Reviewer model:`,
  `Acceptance Criteria that should be fulfiled:`, a `Checklist items:` list citing `CK-n`/`HR-n` IDs from
  the task file's `**Checklist:**` table, and a `Rubrics:` list citing criterion names from its
  `**Rubric:**` table). Every step body lives in its own sub-task file at
  `.specs/sub-tasks/<task-name>/<NN>-<step-slug>.md` with the fields `**Task File:**`, `**Phase:**`,
  `**Model:**`, `**Agent:**`, `**Depends on:**`, `**Parallel with:**`, `**Note:**`, `**Goal:**`, a step
  description, `#### Expected Output`, `#### Success Criteria`, `#### Subtasks` and `#### Blockers & Risks`.

  By design these do NOT belong in the task file and MUST NOT be scored as missing: `### Implementation
  Strategy`, a least-to-most decomposition chain, `### Step N:` bodies, `## Implementation Summary`,
  `## Risks & Blockers Summary`, and a task-level Definition of Done (the Definition of Done lives in
  `## Acceptance Criteria`, written by an earlier phase). Verification is PHASE-level: each phase names
  one reviewer model; there are no per-step verification sections.

  Use agents only from this list: {list ALL available agents with plugin prefix if available, e.g. sdd:developer, review:bug-hunter. Also include general agents: opus, sonnet, haiku}

  ### Rubric
  1. Step Quality (weight: 0.15)
     - Does every sub-task file carry ALL required fields, with `None` written rather than a field omitted?
     - Does each have a clear `**Goal:**`, a real step description, and `#### Expected Output`?
     - Is each step meaningfully sized — neither so large it hides risk nor so small it wastes an agent run?
     - Is each sub-task file standalone-readable, naming every path, symbol and decision it builds on rather than relying on a neighbouring step?
     - 1=Vague/missing fields, 2=Basic, 3=Adequate, 4=Good, 5=Excellent

  2. Success Criteria Testability (weight: 0.12)
     - Are `#### Success Criteria` specific and verifiable, using actual file paths and function names?
     - Are `#### Subtasks` actionable, each naming what it changes and where?
     - Does every step include writing its own tests as a subtask?
     - 1=Vague, 2=Partially testable, 3=Adequate, 4=Good, 5=All testable

  3. Risk Coverage (weight: 0.10)
     - Does each sub-task file's `#### Blockers & Risks` table name blockers with resolutions and risks with mitigations, rated for Impact and Likelihood?
     - Are they specific to this step rather than a generic checklist restated per file?
     - 1=None, 2=Basic, 3=Adequate, 4=Good, 5=Comprehensive

  4. Completeness (weight: 0.15)
     - Does every architecture component and expected change have a corresponding step?
     - Does every row of the Parallelization Overview table have a sub-task file at the recorded path, and every sub-task file a row — no orphans either way?
     - Is the sub-agent execution directive present in `## Implementation Process` — launch one agent per step, parallel steps in parallel, pass the task file path AND the step's sub-task file path, use the step's own Model and Agent, implement exactly that step, and run the code reviewer ONCE per phase at that phase's reviewer model?
     - Is the task file free of the sections listed as out of scope in the Context above?
     - 1=Incomplete, 2=Partial, 3=Adequate, 4=Good, 5=Complete

  5. Dependency Accuracy (weight: 0.15)
     - Are `**Depends on:**` values correct — no false dependencies (steps sequenced that need not be), no missing ones (steps that truly need an earlier artifact)?
     - Do the sub-task files, the Parallelization Overview table and the diagram agree on every dependency?
     - Does each step's dependencies resolve to steps in the same or an earlier phase?
     - 1=Major dependency errors, 2=Mostly correct, 3=Acceptable, 4=Accurate, 5=Precise dependencies

  6. Parallelization Maximized (weight: 0.10)
     - Are genuinely independent steps marked with `**Parallel with:**` rather than left sequential?
     - Is the ASCII diagram logical and does it show the phase boundaries?
     - Is peak concurrent width within 1–5 (target ~3) rather than unbounded?
     - 1=No parallelization/wrong, 2=Some optimization, 3=Acceptable, 4=Well optimized, 5=Maximum parallelization within the width bound

  7. Agent/Model Selection Correctness (weight: 0.08)
     - Are agent types appropriate for what each step OUTPUTS, and drawn only from the provided available agents list?
     - Does each step's `**Model:**` follow the per-step model policy — `opus` earned by a breadth, critical-domain or open-design trigger rather than picked to be safe, `haiku` only for mechanical work?
     - 1=Wrong agents/tiers, 2=Mostly appropriate, 3=Acceptable, 4=Optimal selection, 5=Perfect selection

  8. Phase Design (weight: 0.15)
     - Does EACH phase leave an independently verifiable milestone — a working application/service/solution that could be committed and run, PLUS the tests or other verification artifacts that let a reviewer judge it against the criteria listed for that phase?
     - Is EACH phase's `Reviewer model:` appropriate — never below the highest implementation tier used in that phase, and one tier above it unless the phase is small, uniform and mechanical?
     - Are phase sizes sensible — not one step per phase (review churn), not so many steps that a reviewer's findings force rewriting the whole phase? A single phase for the whole task is acceptable ONLY when no earlier point yields a working, verifiable state.
     - Does every checklist item and every rubric criterion in `## Acceptance Criteria` appear against at least one phase, and does each phase list only criteria genuinely due at that checkpoint rather than end-of-task criteria?
     - Is the task file free of threshold values, scores and judge configuration, which belong to the orchestrator?
     - 1=Phases are arbitrary cuts or leave a broken state, 2=Milestones partly hold or reviewer tiers are off, 3=Acceptable, 4=Well-designed milestones with justified reviewer tiers, 5=Every phase a clean, self-contained, correctly reviewed milestone
  ```

关键：严格按原样使用 prompt，不要添加任何其他内容。包括 implementation agent 的输出！！！

**决策逻辑：**

- **通过**（分数 >= `THRESHOLD`）：分解完成，工作流结束——提升任务
- **失败**（分数 < `THRESHOLD`）：根据[升级规则](#escalation-rule)指定的层级，使用反馈重新启动第 4 阶段（除非根据[迭代裁量规则](#iteration-discretion-rule)接受）
- **达到 MAX_ITERATIONS**：无论分数如何都提升任务（记录警告）

**在提升任务之前等待通过。**

---

## 提升任务

**目的：** 将完善后的任务从 draft 文件夹移动到 todo 文件夹。这是你自行执行的文件移动操作——不使用子代理、不使用模型层级、不使用评审器。

所有阶段完成后：

1. **将任务文件从 draft 移动到 todo：**

   ```bash
   git mv <TASK_FILE> .specs/tasks/todo/
   # 如果 git 不可用：mv <TASK_FILE> .specs/tasks/todo/
   ```

2. **不要移动 `.specs/sub-tasks/<task-name>/`。** 子任务文件夹在规划时创建，并在任务文件从 `draft/` → `todo/` → `in-progress/` → `done/` 移动期间保持原位，因此 Parallelization Overview 中记录的路径不会失效。

3. **如有需要，更新 research 和 analysis 文件中的所有引用**

---

## 完成

所有已执行的阶段和评审器完成后：

1. 使用 git 工具暂存任务文件、`.specs/sub-tasks/<task-name>/` 下的子任务文件、skill 文件、analysis 文件，以及 scratchpad 文件（仅限创建过的文件）
2. 向用户总结工作流结果并输出：

```markdown
### 任务已完善

| 属性 | 值 |
|----------|-------|
| **原始文件** | `<original TASK_FILE path>` |
| **最终位置** | `.specs/tasks/todo/<filename>`（已准备好进行实现） |
| **标题** | `<task title>` |
| **类型** | `<feature/bug/refactor/test/docs/chore/ci>`（根据文件名确定） |
| **Skill** | `<skill file path or "Skipped">` |
| **Skill 操作** | `<Created new / Updated existing / Skipped>` |
| **分析** | `<analysis file path or "Skipped">` |
| **Scratchpad** | `<scratchpad file path>` |
| **实现步骤** | `<count or "N/A">` |
| **阶段** | `<count, each with its reviewer model, or "N/A">` |
| **最大并行宽度** | `<peak concurrent steps, 1–5, or "N/A">` |
| **子任务文件** | `.specs/sub-tasks/<task-name>/ — <count> files` 或 `"N/A"` |

### 使用的配置

| 设置 | 值 |
|---------|-------|
| **目标质量** | {THRESHOLD}/5.0 |
| **最大迭代次数** | {MAX_ITERATIONS} |
| **启用的阶段** | {ACTIVE_STAGES as comma-separated list} |
| **跳过的阶段** | {SKIP_STAGES or stages not in ACTIVE_STAGES} |
| **人工检查点** | 阶段 {HUMAN_IN_THE_LOOP_PHASES as comma-separated} |
| **跳过评审器** | {SKIP_JUDGES} |
| **完善模式** | {REFINE_MODE} |
| **严格模式** | {STRICT_MODE} |

### 质量门禁摘要

| 阶段 | 评审器分数 | 判定 |
|-------|-------------|---------|
| 阶段 2a：Research | X.X/5.0 | ✅ 通过 / ☑️ 已接受 / ⚠️ 已继续（达到最大迭代次数） / ⏭️ 已跳过 |
| 阶段 2b：Codebase Analysis | X.X/5.0 | ✅ 通过 / ☑️ 已接受 / ⚠️ 已继续（达到最大迭代次数） / ⏭️ 已跳过 |
| 阶段 2c：Business Analysis | X.X/5.0 | ✅ 通过 / ☑️ 已接受 / ⚠️ 已继续（达到最大迭代次数） / ⏭️ 已跳过 |
| 阶段 3：Architecture Synthesis | X.X/5.0 | ✅ 通过 / ☑️ 已接受 / ⚠️ 已继续（达到最大迭代次数） / ⏭️ 已跳过 |
| 阶段 4：Decomposition | X.X/5.0 | ✅ 通过 / ☑️ 已接受 / ⚠️ 已继续（达到最大迭代次数） / ⏭️ 已跳过 |

**使用的阈值：** {THRESHOLD}/5.0（如果为 SKIP_JUDGES，则为 N/A）

**图例：**
- ✅ 通过 - 分数 >= THRESHOLD
- ☑️ 已接受 - 分数在 `max(3.0, THRESHOLD - 1.0)..THRESHOLD` 范围内，并根据[迭代裁量规则](#iteration-discretion-rule)接受（剩余的 nitpicks 列在下表之后）
- ⚠️ 已继续（达到最大迭代次数） - 分数 < THRESHOLD，但已达到 MAX_ITERATIONS，仍继续执行
- ⏭️ 已跳过 - 阶段不在 ACTIVE_STAGES 中

**未解决的问题（低于阈值但已接受）：**

{For each ☑️ ACCEPTED phase: phase, remaining nitpicks with priority — omit this block when no phase was accepted}

### 生成的制品

```

.claude/
└── skills/
    └── <skill-name>/
        └── SKILL.md             # 可复用的技能文档（如果运行了研究阶段）

.specs/
├── tasks/
│   ├── draft/                   # 已创建但尚未完善的任务（本任务的来源现已为空）
│   ├── todo/
│   │   └── <name>.<type>.md     # 完整的任务规格（可供实现）
│   ├── in-progress/             # 正在实现的任务（为空）
│   └── done/                    # 已完成的任务（为空）
├── sub-tasks/
│   └── <task-name>/             # 每个任务对应一个文件夹——绝不会随任务文件移动
│       ├── 01-<step-slug>.md    # 每个实现步骤对应一个子任务文件
│       └── 02a-<step-slug>.md
├── analysis/
│   └── analysis-<name>.md       # 代码库影响分析（如果运行了代码库分析阶段）
└── scratchpad/
    └── <hex-id>.md              # 架构思考草稿

```

### 任务状态管理

任务状态通过文件夹位置进行管理：
- `draft/` - 已创建但尚未完善的任务
- `todo/` - 已准备好进行实现的任务
- `in-progress/` - 当前正在处理的任务
- `done/` - 已完成的任务

### 后续步骤

1. 查看任务：`.specs/tasks/todo/<filename>`
   - 直接编辑任务文件以进行修正
   - 在需要澄清或更改的行中添加 `//` 注释
   - 再次运行 `/plan` 并加上 `--refine`，以纳入你的反馈——它会检测相对于 git 的更改，并**自上而下**传播更新（编辑某个部分只会影响其下方的部分，不会影响上方的部分）
2. 如果一切正常，开始实现：`/implement`（会自动从 todo/ 中选择任务）
```

---

## 错误处理

### 阶段代理失败（异常/崩溃）

如果任何阶段代理意外失败：

1. 报告失败情况以及代理输出
2. 向用户提出有助于解决问题的澄清问题
3. 携带问题列表及其答案再次启动阶段代理，以解决问题

### Judge 返回 FAIL

如果任何 Judge 返回 FAIL（分数 < `THRESHOLD`）：

0. **首先应用[迭代裁量规则](#iteration-discretion-rule)**：如果 `score < 3.0`（或 `STRICT_MODE` 为 true），始终重试。如果 `max(3.0, THRESHOLD - 1.0) <= score < THRESHOLD` 且只剩下细枝末节的问题，则应审慎决定是否值得重试——如果接受，则将该阶段标记为 ☑️ ACCEPTED，在摘要中列出尚未解决的细枝末节问题，并进入下一阶段，而不是执行步骤 1-4；否则继续执行步骤 1
1. **自动重试**：根据 Judge 的反馈，按照[升级规则](#escalation-rule)所决定的层级重新启动阶段代理——该规则完整适用，包括其唯一的保持例外以及 `--model` 特例。重试专用的附加条件如下：触发条件 (1) 在此处固定为 `score < 3.0`（或 Judge 提出表明模型误解了该阶段的问题）；在同一层级重新启动阶段后，以相同层级重新进行 Judge；在阶段摘要中说明层级决策
2. **人工参与检查**：如果该阶段属于 `HUMAN_IN_THE_LOOP_PHASES`，则在下一次 Judge 重试之前触发人工检查点（在实现重试之后、重新 Judge 之前）
3. **达到 `MAX_ITERATIONS` 后**：自动进入下一阶段（除非 `--human-in-the-loop` 包含该阶段，否则不要询问用户）
4. 在完成摘要中记录警告：`⚠️ Phase X did not pass quality threshold (X.X/THRESHOLD) after MAX_ITERATIONS iterations`

### 重试流程

```
Implementation → Judge FAIL → Implementation Retry → Judge Retry
                                                          ↓
                              PASS → Continue to next stage
                              FAIL → Repeat until MAX_ITERATIONS
                                          ↓
                              MAX_ITERATIONS reached → Proceed to next stage (with warning)
```

### 包含人工介入的重试流程

当阶段处于 `HUMAN_IN_THE_LOOP_PHASES` 中时：

```
Implementation → Judge FAIL → Implementation Retry
                                    ↓
                    🔍 Human Checkpoint (optional feedback)
                                    ↓
                              Judge Retry
                                    ↓
                    PASS → Continue | FAIL → Repeat until MAX_ITERATIONS
                                                    ↓
                              MAX_ITERATIONS → 🔍 Final Human Checkpoint
                                                    ↓
                                    User confirms → Proceed to next stage
```