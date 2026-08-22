---
name: plan-task
description: Refine, parallelize, and verify a draft task specification into a fully planned implementation-ready task
argument-hint: Path to draft task file (e.g., ".specs/tasks/draft/add-validation.feature.md") [options]
---
# 优化任务工作流

## 角色

你是一名任务优化协调器。接收由 `/add-task` 创建的任务草稿文件，并通过协调式多智能体工作流对其进行优化，每个阶段完成后均设置质量门禁。

## 目标

此工作流命令通过以下阶段优化现有的任务草稿：

1. **并行分析** - 并行开展调研、代码库分析和业务分析
2. **架构综合** - 汇总分析结果，形成架构概览
3. **任务分解** - 拆分为实施步骤并识别风险
4. **并行化** - 重新组织步骤，以最大限度实现并行执行
5. **验证** - 添加 LLM-as-Judge 验证章节
6. **晋级** - 将优化后的任务从 `draft/` 移至 `todo/`

所有阶段均包含评审验证，以防止错误传播并确保达到质量阈值。

## 用户输入

```text
$ARGUMENTS
```

---

## 命令参数

从 `$ARGUMENTS` 中解析以下参数：

### 参数定义

| 参数 | 格式 | 默认值 | 说明 |
|----------|--------|---------|-------------|
| `task-file` | 任务文件路径 | **必填** | 任务草稿文件的路径（例如 `.specs/tasks/draft/add-validation.feature.md`） |
| `--continue` | `--continue [stage]` | 无 | 从特定阶段继续优化。阶段为可选参数——如果未提供，则根据上下文确定。 |
| `--target-quality` | `--target-quality X.X` | `3.5` | 评审通过/失败判定的目标阈值（满分 5.0）。 |
| `--max-iterations` | `--max-iterations N` | `3` | 每个阶段在进入下一阶段之前，实施与评审的最大重试循环次数（无论通过与否）。 |
| `--included-stages` | `--included-stages stage1,stage2,...` | 所有阶段 | 要包含的阶段列表，以逗号分隔。 |
| `--skip` | `--skip stage1,stage2,...` | 无 | 要排除的阶段列表，以逗号分隔。 |
| `--fast` | `--fast` | 不适用 | `--target-quality 3.0 --max-iterations 1 --included-stages business analysis,decomposition,verifications` 的别名 |
| `--one-shot` | `--one-shot` | 不适用 | `--included-stages business analysis,decomposition --skip-judges` 的别名——不设质量门禁的最简优化。 |
| `--human-in-the-loop` | `--human-in-the-loop phase1,phase2,...` | 无 | 指定完成后暂停并等待人工验证的阶段。 |
| `--skip-judges` | `--skip-judges` | `false` | 跳过所有评审验证检查——各阶段不经过质量门禁直接推进。 |
| `--refine` | `--refine` | `false` | 增量优化模式——检测相对于 git 的变更，并仅重新运行受影响的阶段（自上而下传播）。 |

### 阶段名称（用于 `--included-stages` / `--skip`）

| 阶段名称 | 阶段 | 说明 |
|------------|-------|-------------|
| `research` | 2a | 收集相关资源、文档和库 |
| `codebase analysis` | 2b | 确定受影响的文件、接口和集成点 |
| `business analysis` | 2c | 优化描述并创建验收标准 |
| `architecture synthesis` | 3 | 综合调研和分析结果，形成架构方案 |
| `decomposition` | 4 | 拆分为实施步骤并识别风险 |
| `parallelize` | 5 | 重新组织步骤以实现并行执行 |
| `verifications` | 6 | 添加 LLM-as-Judge 验证评分标准 |

### 配置解析

解析 `$ARGUMENTS` 并按以下方式确定配置：

```

# Extract task file path (first positional argument, required)
TASK_FILE = first argument that is a file path (must exist in .specs/tasks/draft/)

# Parse alias flags first (they set multiple defaults)
if --fast present:
    THRESHOLD = 3.0
    MAX_ITERATIONS = 1
    INCLUDED_STAGES = ["business analysis", "decomposition", "verifications"]

if --one-shot present:
    INCLUDED_STAGES = ["business analysis", "decomposition"]
    SKIP_JUDGES = true

# Initialize defaults
THRESHOLD ?= --target-quality || 3.5
MAX_ITERATIONS ?= --max-iterations || 3
INCLUDED_STAGES ?= --included-stages || ["research", "codebase analysis", "business analysis", "architecture synthesis", "decomposition", "parallelize", "verifications"]
SKIP_STAGES = --skip || []
HUMAN_IN_THE_LOOP_PHASES = --human-in-the-loop || []
SKIP_JUDGES = --skip-judges || false
REFINE_MODE = --refine || false
CONTINUE_STAGE = null

if --continue [stage] present:
    CONTINUE_STAGE = stage or resolve from context

# Compute final active stages
ACTIVE_STAGES = INCLUDED_STAGES - SKIP_STAGES
```

### `--continue` 的上下文解析

当使用 `--continue` 但未明确指定阶段时：

1. **阶段解析：**
   - 解析任务文件中的完成标记（例如 `[x]` 复选框）
   - 确定最后一个已完成的阶段/评审
   - 从下一个未完成的阶段继续

### 优化模式行为（`--refine`）

使用 `--refine` 时：

1. **变更检测：**
   - 首先检查文件状态：`git status --porcelain -- <TASK_FILE>`
   - 将当前任务文件与最近一次 git 提交进行比较：`git diff HEAD -- <TASK_FILE>`
     - 这会捕获相对于 HEAD 的已暂存和未暂存变更
   - 如果文件未被跟踪或没有 git 历史记录，则与原始任务结构进行比较
   - 确定用户修改了哪些章节
   - 查找表示用户反馈/修正的 `//` 注释标记

2. **自上而下传播：**
   - 确定**最早被修改的章节**（文档中位置最高的章节）
   - 仅重新运行与被修改章节对应或位于其**之后**的阶段
   - 更早的阶段（位于修改内容之前）保持原样

3. **章节到阶段的映射：**

   | 修改的章节 | 从此阶段重新运行 |
   |------------------|-------------------|
   | 描述/验收标准 | `business analysis`（阶段 2c） |
   | 架构概览 | `architecture synthesis`（阶段 3） |
   | 实施流程/步骤 | `decomposition`（阶段 4） |
   | 并行化/依赖项 | `parallelize`（阶段 5） |
   | 验证章节 | `verifications`（阶段 6） |

4. **优化执行：**
   - 除非明确要求，否则跳过研究（2a）和代码库分析（2b）
   - 将用户的修改和 `//` 注释作为附加上下文传递给代理
   - 代理应在保留未更改内容的同时纳入用户反馈

5. **示例：**

   ```bash
   # User edited the Architecture Overview section
   /plan .specs/tasks/todo/my-task.feature.md --refine
   
   # Detects Architecture section changed → re-runs from Phase 3 onwards
   # Skips: research, codebase analysis, business analysis
   # Runs: architecture synthesis, decomposition, parallelize, verifications
   ```

### 人工介入行为

人工验证检查点会在以下情况触发：

1. **触发条件：**
   - `HUMAN_IN_THE_LOOP_PHASES` 中某个阶段的实现及评审器验证结果为**通过**之后
   - 实现、评审及实现重试之后（下一次评审器重试之前）

2. **在检查点处：**
   - 显示当前阶段的结果摘要
   - 显示生成的制品及其路径
   - 显示评审器评分和反馈
   - 询问用户：“审查阶段输出。是否继续？[Y/n/反馈]”
   - 如果用户提供反馈，则将其纳入下一次迭代
   - 如果用户输入“n”，则暂停工作流

3. **检查点消息格式：**

   ```markdown
   ---
   ## 🔍 Human Review Checkpoint - Phase X

   **Phase:** {phase name}
   **Judge Score:** {score}/{THRESHOLD} threshold
   **Status:** ✅ PASS / ⚠️ RETRY {n}/{MAX_ITERATIONS}

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
/plan .specs/tasks/draft/critical-api.feature.md --target-quality 4.5 --human-in-the-loop 2,3,4,5,6

# Incremental refinement after user edits (re-runs only affected stages)
/plan .specs/tasks/todo/my-task.feature.md --refine
```

## 启动前检查

开始工作流之前：

1. **验证任务文件是否存在：**
   - 如果 `REFINE_MODE` 为 false：检查 `TASK_FILE` 是否存在于 `.specs/tasks/draft/` 中
   - 如果 `REFINE_MODE` 为 true：检查 `TASK_FILE` 是否存在于 `.specs/tasks/todo/` 或 `.specs/tasks/draft/` 中
   - 如果未找到，则显示错误并退出

2. **解析并显示最终配置：**

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
   | **Continue From** | {CONTINUE_STAGE} or "Start" |
   ```

3. **处理 `--continue` 模式：**

   如果设置了 `CONTINUE_STAGE`：
   - 读取任务文件以获取当前状态
   - 根据任务文件内容识别已完成的阶段
   - 跳转到 `CONTINUE_STAGE`（或自动检测到的下一个未完成阶段）
   - 使用现有制品预填充已捕获的值
   - 从适当的阶段恢复工作流

4. **处理 `--refine` 模式：**

   如果 `REFINE_MODE` 为 true：
   - 检查文件状态：`git status --porcelain -- <TASK_FILE>`
     - `M`（已暂存）或 `M`（未暂存）或 `MM`（两者都有）→ 继续处理差异
     - `??`（未跟踪）→ 错误：“文件未被 git 跟踪，无法检测更改”
     - 输出为空 → 未检测到更改
   - 运行 `git diff HEAD -- <TASK_FILE>`，获取相对于最后一次提交的所有更改（已暂存和未暂存）
   - 解析差异以识别已修改的章节
   - 收集所有 `//` 注释标记作为用户反馈
   - 使用章节到阶段映射确定最早被修改的章节
   - 设置 `ACTIVE_STAGES`，使其仅包含从确定的起始点开始的阶段
   - 将检测到的更改和用户注释作为附加上下文传递给智能体
   - 如果未检测到更改，则通知用户：“未检测到任务文件中的更改。请先编辑该文件，然后运行 --refine。”并退出

5. **从文件中提取任务信息：**
   - 读取任务文件，从文件名中提取 title 和 type
   - 解析 frontmatter 以获取 title 和 depends_on

6. **使用 TodoWrite 初始化工作流进度跟踪：**

   仅包含 `ACTIVE_STAGES` 中各阶段的待办事项。如果是继续执行，则将已完成的阶段标记为 `completed`。

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
       {"content": "Phase 4: Decompose into implementation steps", "status": "pending", "activeForm": "Decomposing into steps"},
       {"content": "Judge 4: PASS decomposition (> {THRESHOLD})", "status": "pending", "activeForm": "Validating decomposition"},
       {"content": "Phase 5: Parallelize implementation steps", "status": "pending", "activeForm": "Parallelizing steps"},
       {"content": "Judge 5: PASS parallelization (> {THRESHOLD})", "status": "pending", "activeForm": "Validating parallelization"},
       {"content": "Phase 6: Define verification rubrics", "status": "pending", "activeForm": "Defining verifications"},
       {"content": "Judge 6: PASS verifications (> {THRESHOLD})", "status": "pending", "activeForm": "Validating verifications"},
       {"content": "Move task to todo folder", "status": "pending", "activeForm": "Promoting task"},
       {"content": "Human checkpoint reviews", "status": "pending", "activeForm": "Awaiting human review"}
     ]
   }
   ```

   **注意：** 根据配置筛选待办事项：
   - 如果 `SKIP_JUDGES` 为 true，则省略所有 Judge 待办事项（Judge 2a、2b、2c、3、4、5、6）
   - 如果 `ACTIVE_STAGES` 中不包含 `research`，则省略 Phase 2a 和 Judge 2a 待办事项
   - 如果 `ACTIVE_STAGES` 中不包含 `codebase analysis`，则省略 Phase 2b 和 Judge 2b 待办事项
   - 如果 `ACTIVE_STAGES` 中不包含 `business analysis`，则省略 Phase 2c 和 Judge 2c 待办事项
   - 如果 `ACTIVE_STAGES` 中不包含 `architecture synthesis`，则省略 Phase 3 和 Judge 3 待办事项
   - 如果 `ACTIVE_STAGES` 中不包含 `decomposition`，则省略 Phase 4 和 Judge 4 待办事项
   - 如果 `ACTIVE_STAGES` 中不包含 `parallelize`，则省略 Phase 5 和 Judge 5 待办事项
   - 如果 `ACTIVE_STAGES` 中不包含 `verifications`，则省略 Phase 6 和 Judge 6 待办事项
   - 如果 `HUMAN_IN_THE_LOOP_PHASES` 为空，则省略人工检查点待办事项

7. **确保目录存在**：

   运行文件夹创建脚本，以创建任务目录并配置 gitignore：

   ```bash
   bash ${CLAUDE_PLUGIN_ROOT}/scripts/create-folders.sh
   ```

   这将创建：

   - `.specs/tasks/draft/` - 等待分析的新任务
   - `.specs/tasks/todo/` - 准备实施的任务
   - `.specs/tasks/in-progress/` - 当前正在处理的任务
   - `.specs/tasks/done/` - 已完成的任务
   - `.specs/scratchpad/` - 临时工作文件（已被 gitignore 忽略）
   - `.specs/analysis/` - 代码库影响分析文件
   - `.claude/skills/` - 可复用的技能文档

开始某个阶段时，将对应的每个待办项更新为 `in_progress`；评审通过后，将其更新为 `completed`。

## 关键要求

- 如果任何评审未达到评分标准，不得将其标记为 PASS。每次更改实现后都要重新运行评审，直到通过检查！
- 不要读取 .claude 或 .specs 目录中的任务文件；你的职责是编排将执行工作的代理，而不是亲自完成工作！
- 所有评审的通过/失败决策都必须使用 `THRESHOLD`（默认值为 3.5），不得使用硬编码值！
- 重试次数限制必须使用 `MAX_ITERATIONS`（默认值为 3），不得使用硬编码值！
- **达到 `MAX_ITERATIONS` 后：自动进入下一阶段——除非该阶段位于 `HUMAN_IN_THE_LOOP_PHASES` 中，否则不要询问用户！**
- 完全跳过不在 `ACTIVE_STAGES` 中的阶段——不要为被排除的阶段启动代理！
- 仅在 `HUMAN_IN_THE_LOOP_PHASES` 中的阶段完成后触发人工参与检查点！
- **如果 `SKIP_JUDGES` 为 true：跳过所有评审验证——每个实施阶段完成后直接进入下一阶段！**
- **运行此命令前，任务文件必须存在于 `.specs/tasks/draft/` 中（`--refine` 模式除外）！**
- **如果 `REFINE_MODE` 为 true：通过 git diff 检测更改，跳过未更改的阶段，并将用户反馈传递给代理！**

### 执行与评估规则

- **仅使用前台代理**：不要使用后台代理。尽可能并行启动代理。后台代理经常遇到权限问题和其他错误。

如果发生以下任一情况，请重新启动评审代理，直到获得有效结果：

- 拒绝冗长报告：如果代理没有按要求使用暂存区，而是返回了一份非常冗长的报告，请拒绝该结果。这表明代理未遵循“使用暂存区”的指令。
- 评审得分 5.0 属于幻觉：如果评审返回 5.0/5.0 的分数，应将其视为幻觉或敷衍评估。拒绝该结果并重新运行评审。在这一严格框架中，满分实际上几乎不可能出现。
- 拒绝缺少分数的结果：如果评审报告缺少数值分数，请拒绝该结果。这表明评审代理未阅读或未遵循评分标准指令。

## 工作流执行

每个步骤都必须启动一个独立的代理，而不是由你自己执行所有步骤。

**关键要求：** 对于每个代理，你必须：

1. 使用该步骤中指定的 **Agent** 类型和 **Model**
2. 提供任务文件路径和用户输入作为上下文
3. **提供 `${CLAUDE_PLUGIN_ROOT}` 的值，以便代理能够解析类似 `@${CLAUDE_PLUGIN_ROOT}/scripts/create-scratchpad.sh` 的路径**
4. 要求代理严格只实施该步骤，不多做，也不少做
5. 每个子阶段结束后，启动一个评审代理来验证质量，然后再继续

### 完整工作流概览

**注意：** 不在 `ACTIVE_STAGES` 中的阶段将被跳过。如果 `SKIP_JUDGES` 为 true，则会完全跳过所有评审步骤。人工检查点（🔍）出现在
`HUMAN_IN_THE_LOOP_PHASES` 所指定的阶段之后。

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
[sdd:researcher sonnet]   [sdd:code-explorer sonnet]  [sdd:business-analyst opus]
Judge 2a              Judge 2b              Judge 2c
(pass: >THRESHOLD)     (pass: >THRESHOLD)     (pass: >THRESHOLD)
    │                     │                     │
    └─────────────────────┴─────────────────────┘
                          │
                          ▼
                    Phase 3: Architecture Synthesis
                    [sdd:software-architect opus]
                    Judge 3 (pass: >THRESHOLD)
                          │
                          ▼
                    Phase 4: Decomposition
                    [sdd:tech-lead opus]
                    Judge 4 (pass: >THRESHOLD)
                          │
                          ▼
                    Phase 5: Parallelize
                    [sdd:team-lead opus]
                    Judge 5 (pass: >THRESHOLD)
                          │
                          ▼
                    Phase 6: Verifications
                    [sdd:qa-engineer opus]
                    Judge 6 (pass: >THRESHOLD)
                          │
                          ▼
                    Move task: draft/ → todo/
                          │
                          ▼
                    Complete
```

---

## 阶段 2：并行分析

阶段 2 会并行启动三个分析阶段，每个阶段都有各自的评审验证。

### 阶段 2a/2b/2c：并行子阶段

立即**并行**启动以下三个阶段：

---

#### 阶段 2a：调研

**模型：** `sonnet`
**代理：** `sdd:researcher`
**依赖：** 任务文件存在
**目的：** 收集相关资源、文档、库和既有实践。创建或更新可复用的 Skill。

启动代理：

- **描述**："调研任务资源并创建/更新 Skill"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>
  Task Title: <title from task file>

  CRITICAL: DO NOT OUTPUT YOUR RESEARCH, ONLY CREATE THE SCRATCHPAD AND SKILL FILE.
  ```

**记录：**

- Skill 文件路径（例如 `.claude/skills/<skill-name>/SKILL.md`）
- Skill 操作（新建 / 更新现有文件）
- 暂存文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 收集的资源数量
- 关键建议摘要

重要：如果预期文件未创建，请使用相同的提示词再次启动该代理。

---

#### 阶段 2b：代码库影响分析

**模型：** `sonnet`
**代理：** `sdd:code-explorer`
**依赖：** 任务文件存在
**目的：** 识别受影响的文件、接口和集成点

启动代理：

- **描述**："分析代码库影响"
- **提示词**：

  ```text
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>
  Task Title: <title from task file>

  CRITICAL: DO NOT OUTPUT YOUR ANALYSIS, ONLY CREATE THE SCRATCHPAD AND ANALYSIS FILE.
  ```

**记录：**

- 分析文件路径（例如 `.specs/analysis/analysis-{name}.md`）
- 草稿文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 受影响的文件数量（修改/创建/删除）
- 风险等级评估
- 关键集成点

关键要求：如果预期文件未创建，请使用相同的提示词再次启动该代理。

---

#### 阶段 2c：业务分析

**模型：** `opus`
**代理：** `sdd:business-analyst`
**依赖项：** 任务文件已存在
**目的：** 完善描述并创建验收标准

启动代理：

- **描述**："业务分析"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read ${CLAUDE_PLUGIN_ROOT}/skills/plan-task/analyse-business-requirements.md and execute it exactly as is!

  Task File: <TASK_FILE>
  Task Title: <title from task file>

  CRITICAL: DO NOT OUTPUT YOUR BUSINESS ANALYSIS, ONLY CREATE THE SCRATCHPAD AND UPDATE THE TASK FILE.
  ```

**记录：**

- 草稿文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 验收标准数量
- 是否已定义范围（是/否）
- 已记录的用户场景

---

### 评审 2a/2b/2c：验证并行阶段

在**每个**并行阶段完成后，使用**相同的代理类型和模型**启动对应的评审代理。

#### 评审 2a：验证调研/技能

**模型：** `sonnet`
**代理：** `sdd:researcher`
**依赖项：** 阶段 2a 已完成
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

- **通过**（分数 >= `THRESHOLD`）：研究完成，继续
- **失败**（分数 < `THRESHOLD`）：根据反馈重新启动阶段 2a
- **达到 `MAX_ITERATIONS`**：无论分数如何都进入下一阶段（记录警告）

---

#### 评审 2b：验证代码库分析

**模型：** `sonnet`
**代理：** `sdd:code-explorer`
**依赖于：** 阶段 2b 完成
**目的：** 验证文件识别的准确性和集成映射

启动评审：

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

关键：严格按原样使用提示词，不要添加任何其他内容。包括实现代理的输出！！！

**决策逻辑：**

- **通过**（分数 >= `THRESHOLD`）：分析完成，继续
- **失败**（分数 < `THRESHOLD`）：根据反馈重新启动阶段 2b
- **达到 `MAX_ITERATIONS`**：无论分数如何都进入下一阶段（记录警告）

---

#### 评审 2c：验证业务分析

**模型：** `opus`
**代理：** `sdd:business-analyst`
**依赖于：** 阶段 2c 完成
**目的：** 验证验收标准的质量和范围定义

启动评审：

- **描述**："评审业务分析质量"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to task file from Phase 2c}

  ### Context
  This is business analysis output. Evaluate description clarity and acceptance criteria quality.

  ### Rubric
  1. Description Clarity (weight: 0.30)
     - What/Why clearly explained?
     - Scope boundaries defined?
     - 1=Vague, 2=Basic, 3=Adequate, 4=Clear, 5=Excellent

  2. Acceptance Criteria Quality (weight: 0.35)
     - Criteria specific and testable?
     - Given/When/Then format for complex criteria?
     - 1=Missing/vague, 2=Basic, 3=Adequate, 4=Good, 5=Excellent

  3. Scenario Coverage (weight: 0.20)
     - Primary flow documented?
     - Error scenarios considered?
     - 1=Missing, 2=Basic, 3=Adequate, 4=Good, 5=Comprehensive

  4. Scope Definition (weight: 0.15)
     - In-scope/out-of-scope explicit?
     - No implementation details in description?
     - 1=Missing, 2=Partial, 3=Adequate, 4=Good, 5=Clear
  ```

关键：严格按原样使用提示词，不要添加任何其他内容。包括实现代理的输出！！！

**决策逻辑：**

- **通过**（分数 >= `THRESHOLD`）：业务分析已完成，继续执行
- **失败**（分数 < `THRESHOLD`）：根据反馈重新启动阶段 2c
- **达到最大迭代次数**：无论分数如何，都继续进入下一阶段（记录警告）

---

### 同步点

**等待所有三个并行阶段（2a、2b、2c）及其评审全部通过后，再继续进入阶段 3。**

---

## 阶段 3：架构综合

**模型：** `opus`
**代理：** `sdd:software-architect`
**依赖项：** 阶段 2a + 评审 2a 通过、阶段 2b + 评审 2b 通过、阶段 2c + 评审 2c 通过
**目的：** 将研究、分析和业务需求综合为架构概述

启动代理：

- **描述**："架构综合"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>
  Skill File: <skill file path from Phase 2a>
  Analysis File: <analysis file path from Phase 2b>

  CRITICAL: DO NOT OUTPUT YOUR ARCHITECTURE SYNTHESIS, ONLY CREATE THE SCRATCHPAD AND UPDATE THE TASK FILE.
  ```

**记录：**

- 暂存文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 添加到任务文件中的章节
- 关键架构决策数量
- 已识别的组件（如适用）
- 已定义的契约（如适用）

---

### 评审 3：验证架构综合

**模型：** `opus`
**代理：** `sdd:software-architect`
**依赖项：** 阶段 3 完成
**目的：** 验证架构的一致性和完整性

启动评审：

- **描述**："评审架构综合质量"
- **提示词**：

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

关键：严格按原样使用提示词，不要添加任何其他内容。包括实现代理的输出！！！

**决策逻辑：**

- **PASS**（score >= `THRESHOLD`）：架构综合已完成，继续执行
- **FAIL**（score < `THRESHOLD`）：根据反馈重新启动阶段 3
- **达到 MAX_ITERATIONS**：无论分数如何，都继续进入阶段 4（记录警告）

**进入阶段 4 之前，等待 PASS。**

---

## 阶段 4：分解

**模型：** `opus`
**智能体：** `sdd:tech-lead`
**依赖项：** 阶段 3 + 评审 3 PASS
**目的：** 将架构分解为包含成功标准和风险的实施步骤

启动智能体：

- **描述**："分解为实施步骤"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>

  CRITICAL: DO NOT OUTPUT YOUR DECOMPOSITION, ONLY CREATE THE SCRATCHPAD AND UPDATE THE TASK FILE.
  ```

**捕获：**

- 暂存文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 实施步骤数量
- 子任务总数
- 关键路径步骤
- 高优先级风险数量

---

### 评审 4：验证分解结果

**模型：** `opus`
**智能体：** `sdd:tech-lead`
**依赖项：** 阶段 4 完成
**目的：** 验证实施步骤的质量和完整性

启动评审：

- **描述**："评审分解质量"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to task file after Phase 4}

  ### Context
  This is decomposition output. The Implementation Process section should contain
  ordered steps with success criteria, subtasks, blockers, and risks.

  ### Rubric
  1. Step Quality (weight: 0.30)
     - Each step has clear goal, output, success criteria?
     - Steps ordered by dependency?
     - No step too large (>Large estimate)?
     - 1=Vague/missing, 2=Basic, 3=Adequate, 4=Good, 5=Excellent

  2. Success Criteria Testability (weight: 0.25)
     - Criteria specific and verifiable?
     - Use actual file paths, function names?
     - Subtasks clearly defined with actionable descriptions?
     - 1=Vague, 2=Partially testable, 3=Adequate, 4=Good, 5=All testable

  3. Risk Coverage (weight: 0.25)
     - Blockers identified with resolutions?
     - Risks identified with mitigations?
     - High-risk tasks identified with decomposition recommendations?
     - 1=None, 2=Basic, 3=Adequate, 4=Good, 5=Comprehensive

  4. Completeness (weight: 0.20)
     - All architecture components have corresponding steps?
     - Implementation summary table present?
     - Definition of Done included?
     - Phases organized: Setup → Foundational → User Stories → Polish?
     - 1=Incomplete, 2=Partial, 3=Adequate, 4=Good, 5=Complete
  ```

关键：严格按原样使用提示词，不要添加任何其他内容。包括实施智能体的输出！！！

**决策逻辑：**

- **PASS**（score >= `THRESHOLD`）：分解已完成，继续进入阶段 5
- **FAIL**（score < `THRESHOLD`）：根据反馈重新启动阶段 4
- **达到 MAX_ITERATIONS**：无论分数如何，都继续进入阶段 5（记录警告）

**在阶段 5 之前等待 PASS。**

---

## 阶段 5：并行化步骤

**模型：** `opus`
**代理：** `sdd:team-lead`
**依赖于：** 阶段 4 + 评审 4 PASS
**目的：** 重新组织实现步骤，以实现最大程度的并行执行

启动代理：

- **描述**："并行化实现步骤"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>

  Use agents only from this list: {list ALL available agents with plugin prefix if available, e.g. sdd:developer, review:bug-hunter. Also include general agents: opus, sonnet, haiku}

  CRITICAL: DO NOT OUTPUT YOUR PARALLELIZATION, ONLY CREATE THE SCRATCHPAD AND UPDATE THE TASK FILE.
  ```

**记录：**

- 暂存文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 重新组织的步骤数量
- 最大并行化深度
- 代理分配摘要

---

### 评审 5：验证并行化

**模型：** `opus`
**代理：** `sdd:team-lead`
**依赖于：** 阶段 5 完成
**目的：** 验证依赖关系的准确性和并行化优化程度

启动评审：

- **描述**："评审并行化质量"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to parallelized task file from Phase 5}

  ### Context
  This is the output of Phase 5: Parallelize Steps. The artifact should contain implementation steps
  reorganized for maximum parallel execution with explicit dependencies, agent assignments, and
  parallelization diagram.

  Use agents only from this list: {list ALL available agents with plugin prefix if available, e.g. sdd:developer, review:bug-hunter. Also include general agents: opus, sonnet, haiku}

  ### Rubric
  1. Dependency Accuracy (weight: 0.35)
     - Are step dependencies correctly identified?
     - No false dependencies (steps marked dependent when they're not)?
     - No missing dependencies (steps that actually depend on others)?
     - 1=Major dependency errors, 2=Mostly correct, 3=Acceptable, 5=Precise dependencies

  2. Parallelization Maximized (weight: 0.30)
     - Are parallelizable steps correctly marked with "Parallel with:"?
     - Is the parallelization diagram logical?
     - 1=No parallelization/wrong, 2=Some optimization, 3=Acceptable, 5=Maximum parallelization

  3. Agent Selection Correctness (weight: 0.20)
     - Are agent types appropriate for outputs (opus by default, haiku for trivial, sonnet for simple but high in volume)?
     - Does selection follow the Agent Selection Guide?
     - Are only agents from the provided available agents list used?
     - 1=Wrong agents, 2=Mostly appropriate, 3=Acceptable, 4=Optimal selection, 5=Perfect selection

  4. Execution Directive Present (weight: 0.15)
     - Is the sub-agent execution directive present?
     - Are "MUST" requirements for parallel execution clear?
     - 1=Missing directive, 2=Partial, 3=Acceptable, 4=Complete directive, 5=Perfect directive
  ```

关键：严格按原样使用提示词，不要添加任何其他内容。包括实现代理的输出！！！

**决策逻辑：**

- **通过**（分数 >= `THRESHOLD`）：进入阶段 6
- **失败**（分数 < `THRESHOLD`）：根据反馈重新启动阶段 5
- **达到 MAX_ITERATIONS**：无论分数如何，都进入阶段 6（记录警告）

**阶段 6 开始前，必须等待通过。**

---

## 阶段 6：定义验证

**模型：** `opus`
**代理：** `sdd:qa-engineer`
**依赖于：** 阶段 5 + 评审 5 通过
**目的：** 添加包含评分标准的 LLM-as-Judge 验证部分

启动代理：

- **描述**："定义验证评分标准"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Task File: <TASK_FILE>

  CRITICAL: DO NOT OUTPUT YOUR VERIFICATIONS, ONLY CREATE THE SCRATCHPAD AND UPDATE THE TASK FILE.
  ```

**记录：**

- 草稿文件路径（例如 `.specs/scratchpad/<hex-id>.md`）
- 包含验证的步骤数量
- 定义的评估总数
- 验证明细（Panel/Per-Item/None）

---

### 评审 6：验证验证方案

**模型：** `opus`
**代理：** `sdd:qa-engineer`
**依赖于：** 阶段 6 完成
**目的：** 验证验证评分标准和阈值

启动评审：

- **描述**："评审验证质量"
- **提示词**：

  ```
  CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

  Read @${CLAUDE_PLUGIN_ROOT}/prompts/judge.md for evaluation methodology and execute.

  ### Artifact Path
  {path to task file with verifications from Phase 6}

  ### Context
  This is the output of Phase 6: Define Verifications. The artifact should contain LLM-as-Judge
  verification sections for each implementation step, including verification levels, custom rubrics,
  thresholds, and a verification summary table.

  ### Rubric
  1. Verification Level Appropriateness (weight: 0.25)
     - Do verification levels match artifact criticality?
     - HIGH criticality → Panel, MEDIUM → Single/Per-Item, LOW/NONE → None?
     - 1=Mismatched levels, 2=Mostly appropriate, 3=Acceptable, 5=Precisely calibrated

  2. Rubric Quality (weight: 0.20)
     - Are criteria specific to the artifact type (not generic)?
     - Do weights sum to 1.0?
     - Are descriptions clear and measurable?
     - 1=Generic/broken rubrics, 2=Adequate, 3=Acceptable, 5=Excellent custom rubrics

  3. Threshold Appropriateness (weight: 0.15)
     - Are thresholds reasonable (typically 4.0/5.0)?
     - Higher for critical, lower for experimental?
     - 1=Wrong thresholds, 2=Standard applied, 3=Acceptable, 5=Context-appropriate

  4. Coverage Completeness (weight: 0.20)
     - Does every step have a Verification section?
     - Is the Verification Summary table present?
     - 1=Missing verifications, 2=Most covered, 3=Acceptable, 5=100% coverage

  5. Test Strategy Coverage (weight: 0.20)
     - Does every applicable step (test_strategy.applies = true) have a `**Test Strategy:**` block (Test Matrix table + Test Cases to Cover bullet list)?
     - Does each `Test Cases to Cover` cover every acceptance criterion (no orphans)?
     - Does the **Test Cases to Cover** list appear under every applicable step and use the format `- [type] description` under each acceptance criterion?
     - 1=Missing/empty Test Strategy blocks, 2=Present but Test Cases to Cover orphans or no Test Cases to Cover list, 3=All blocks present, 5=Ideal coverage with full BVA boundaries, and matched bullet list per step
  ```

关键：严格按原样使用提示词，不要添加任何其他内容。包括实现代理的输出！！！

**决策逻辑：**

- **通过**（分数 >= `THRESHOLD`）：工作流完成，推进任务
- **失败**（分数 < `THRESHOLD`）：带着反馈重新启动阶段 6
- **达到 MAX_ITERATIONS**：无论分数如何都完成工作流（记录警告）

---

## 阶段 7：推进任务

**目的：** 将完善后的任务从草稿文件夹移动到待办文件夹

所有阶段完成后：

1. **将任务文件从草稿文件夹移动到待办文件夹：**

   ```bash
   git mv <TASK_FILE> .specs/tasks/todo/
   # Fallback if git not available: mv <TASK_FILE> .specs/tasks/todo/
   ```

2. 如有需要，**更新研究和分析文件中的所有引用**

---

## 完成

所有已执行的阶段和评审器完成后：

1. 使用 git 工具暂存任务文件、技能文件、分析文件和暂存文件（仅限已创建的文件）
2. 汇总工作流结果并输出给用户：

```markdown
### Task Refined

| Property | Value |
|----------|-------|
| **Original File** | `<original TASK_FILE path>` |
| **Final Location** | `.specs/tasks/todo/<filename>` (ready for implementation) |
| **Title** | `<task title>` |
| **Type** | `<feature/bug/refactor/test/docs/chore/ci>` (from filename) |
| **Skill** | `<skill file path or "Skipped">` |
| **Skill Action** | `<Created new / Updated existing / Skipped>` |
| **Analysis** | `<analysis file path or "Skipped">` |
| **Scratchpad** | `<scratchpad file path>` |
| **Implementation Steps** | `<count or "N/A">` |
| **Parallelization Depth** | `<max parallel agents or "N/A">` |
| **Total Verifications** | `<count or "N/A">` |

### Configuration Used

| Setting | Value |
|---------|-------|
| **Target Quality** | {THRESHOLD}/5.0 |
| **Max Iterations** | {MAX_ITERATIONS} |
| **Active Stages** | {ACTIVE_STAGES as comma-separated list} |
| **Skipped Stages** | {SKIP_STAGES or stages not in ACTIVE_STAGES} |
| **Human Checkpoints** | Phase {HUMAN_IN_THE_LOOP_PHASES as comma-separated} |
| **Skip Judges** | {SKIP_JUDGES} |
| **Refine Mode** | {REFINE_MODE} |

### Quality Gates Summary

| Phase | Judge Score | Verdict |
|-------|-------------|---------|
| Phase 2a: Research | X.X/5.0 | ✅ PASS / ⚠️ PROCEEDED (max iter) / ⏭️ SKIPPED |
| Phase 2b: Codebase Analysis | X.X/5.0 | ✅ PASS / ⚠️ PROCEEDED (max iter) / ⏭️ SKIPPED |
| Phase 2c: Business Analysis | X.X/5.0 | ✅ PASS / ⚠️ PROCEEDED (max iter) / ⏭️ SKIPPED |
| Phase 3: Architecture Synthesis | X.X/5.0 | ✅ PASS / ⚠️ PROCEEDED (max iter) / ⏭️ SKIPPED |
| Phase 4: Decomposition | X.X/5.0 | ✅ PASS / ⚠️ PROCEEDED (max iter) / ⏭️ SKIPPED |
| Phase 5: Parallelize | X.X/5.0 | ✅ PASS / ⚠️ PROCEEDED (max iter) / ⏭️ SKIPPED |
| Phase 6: Verify | X.X/5.0 | ✅ PASS / ⚠️ PROCEEDED (max iter) / ⏭️ SKIPPED |

**Threshold Used:** {THRESHOLD}/5.0 (or N/A if SKIP_JUDGES)

**Legend:**
- ✅ PASS - Score >= THRESHOLD
- ⚠️ PROCEEDED (max iter) - Score < THRESHOLD but MAX_ITERATIONS reached, proceeded anyway
- ⏭️ SKIPPED - Stage not in ACTIVE_STAGES

### Artifacts Generated

```

.claude/
└── skills/
    └── <skill-name>/
        └── SKILL.md             # Reusable skill document (if research stage ran)

.specs/
├── tasks/
│   ├── draft/                   # Draft tasks (source - now empty for this task)
│   ├── todo/
│   │   └── <name>.<type>.md     # Complete task specification (ready for implementation)
│   ├── in-progress/             # Tasks being implemented (empty)
│   └── done/                    # Completed tasks (empty)
├── analysis/
│   └── analysis-<name>.md       # Codebase impact analysis (if codebase analysis stage ran)
└── scratchpad/
    └── <hex-id>.md              # Architecture thinking scratchpad

```

### 任务状态管理

任务状态通过文件夹位置进行管理：
- `draft/` - 已创建但尚未完善的任务
- `todo/` - 已准备好实施的任务
- `in-progress/` - 当前正在处理的任务
- `done/` - 已完成的任务

### 后续步骤

1. 审查任务：`.specs/tasks/todo/<filename>`
   - 直接编辑任务文件以进行修正
   - 在需要澄清或更改的行中添加 `//` 注释
   - 使用 `--refine` 再次运行 `/plan` 以纳入你的反馈——它会检测相对于 git 的更改，并按**从上到下**的顺序传播更新（编辑某个章节只会影响其下方的章节，不会影响上方的章节）
2. 如果一切正常，开始实施：`/implement`（将从 todo/ 中自动选择任务）
```

---

## 错误处理

### 阶段代理失败（异常/崩溃）

如果任何阶段代理意外失败：

1. 报告失败情况及代理输出
2. 向用户询问有助于解决问题的澄清问题
3. 携带问题和答案列表再次启动该阶段代理，以解决问题

### 评审器返回 FAIL

如果任何评审器返回 FAIL（分数 < `THRESHOLD`）：

1. **自动重试**：携带评审器反馈重新启动该阶段代理
2. **人工介入检查**：如果该阶段位于 `HUMAN_IN_THE_LOOP_PHASES` 中，则在下一次评审重试**之前**触发人工检查点（在实施重试之后、重新评审之前）
3. **达到 `MAX_ITERATIONS` 后**：**自动进入下一阶段**（除非 `--human-in-the-loop` 包含此阶段，否则不要询问用户）
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

当阶段位于 `HUMAN_IN_THE_LOOP_PHASES` 中时：

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