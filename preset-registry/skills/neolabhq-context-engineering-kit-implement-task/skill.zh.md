---
name: implement-task
description: Implement a task step by step with automated LLM-as-Judge verification at the end of each phase
---
# 实现任务并进行验证

你的工作是根据任务规范并使用子代理，以最佳质量实现解决方案。除非确实必要或已经完成，否则**不得停止**！除非确实必要，否则避免提问！每个步骤分派一个实现代理，然后——当某个实现阶段的所有步骤都完成后——为该阶段启动**一个** `sdd:code-reviewer`，持续迭代直到问题修复，再进入下一阶段！

使用每个实现阶段一个 `sdd:code-reviewer` 代理，通过自动化质量验证执行任务实现步骤。

## 用户输入

```text
$ARGUMENTS
```

---

## 术语（先阅读此部分——“phase”指代两种不同的内容）

| 术语 | 含义 |
|------|------|
| **工作流阶段 0-5** | 此技能的各个阶段（选择任务、加载、执行、完成定义、推进、报告）。 |
| **实现阶段** / `Phase N` | TASK 文件中 `### Phase Overview` 下的一个里程碑。它将步骤分组，指定一个 `Reviewer model`，并列出该里程碑需要满足的验收标准。这是代码审查的单位。 |
| **步骤** | `.specs/sub-tasks/<task-name>/<NN>-<step-slug>.md` 中的一个子任务文件。这是实现代理分派的单位。**步骤名称**是该文件去掉 `.md` 后的基本名称。 |

---

## 命令参数

从 `$ARGUMENTS` 中解析以下参数：

### 参数定义

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `task-file` | 路径或文件名 | 自动检测 | 任务文件名或路径（例如 `add-validation.feature.md`） |
| `--continue` | `--continue` | 无 | 从上次完成的步骤继续实现：解析正在进行中的实现阶段，完成其未完成的步骤，然后审查该阶段——参见[ `--continue` 的上下文解析](#context-resolution-for---continue)。 |
| `--refine` | `--refine` | `false` | 增量优化模式——检测相对于 git 的更改，将其映射到步骤，并从包含最早受影响步骤的实现阶段开始重新验证。 |
| `--human-in-the-loop` | `--human-in-the-loop [Phase 1,Phase 3,...]` | 无 | 在指定实现阶段完成审查后暂停，以便人工验证。如果未指定阶段，则在每个实现阶段之后暂停。 |
| `--target-quality` | `--target-quality X.X` | `4.0` | 应用于每个实现阶段审查的单一目标阈值（满分 5.0）。 |
| `--max-iterations` | `--max-iterations N` | `3` | 每个实现阶段允许的最大修复→重新审查循环次数。默认迭代 3 次。设置为 `unlimited` 表示不设限制。 |
| `--skip-reviews` | `--skip-reviews` | `false` | 跳过所有阶段审查——步骤将不经过质量门禁直接推进。 |
| `--model` | `opus\|sonnet\|haiku` | 未设置 | 所有子代理（实现代理和 `sdd:code-reviewer`）所使用的模型；指定后会覆盖任务文件中的所有模型；未指定时，实现代理使用 Parallelization Overview 中的步骤模型，审查代理使用 Phase Overview 中的审查模型。 |
| `--strict` | `--strict` | `false` | 禁用[迭代裁量规则](#iteration-discretion-rule)——只有当 `combined_score >= THRESHOLD` 时，阶段才会被标记为 PASS，否则持续迭代直到达到 `MAX_ITERATIONS`。 |

### 配置解析

解析 `$ARGUMENTS` 并按如下方式解析配置：

```
# Extract task file (first positional argument, optional - auto-detect if not provided)
TASK_FILE = first argument that is a file path or filename

# Single quality threshold — there is exactly one, and it is NEVER read from the task file
THRESHOLD = --target-quality value || 4.0

# Initialize other defaults
MODEL_OVERRIDE = --model value (opus|sonnet|haiku) || none  # none = no override; models come from the task file
MAX_ITERATIONS = --max-iterations || 3  # default is 3 iterations
HUMAN_IN_THE_LOOP_PHASES = --human-in-the-loop || [] (empty = none, "*" = all implementation phases)
SKIP_REVIEWS = --skip-reviews || false
REFINE_MODE = --refine || false
CONTINUE_MODE = --continue || false
STRICT_MODE = --strict || false

# Special handling for --human-in-the-loop without a phase list
if --human-in-the-loop present without phase identifiers:
    HUMAN_IN_THE_LOOP_PHASES = "*" (all implementation phases)
```

**`THRESHOLD` 是此工作流中唯一的质量阈值。** 不存在单独的 standard/critical/lenient 值、不支持逗号分隔的形式，任务文件中也不允许存在任何阈值——规划代理不得写入阈值。

### `--continue` 的上下文解析

使用 `--continue` 时，状态按**实现阶段，然后步骤**的顺序解析：

1. **阶段和步骤解析：**
   - 读取任务文件中的 `### Parallelization Overview` 步骤表和 `### Phase Overview`。
   - 当步骤表中的对应行标记为 `[DONE]` 时，该步骤完成。
   - 当实现阶段的 `#### Phase N` 标题带有以下任一标记时，该实现阶段完成：`[REVIEWED]`（其审查已运行且通过）或 `[REVIEWED-SKIPPED]`（其步骤已完成，且审查在之前一次使用 `--skip-reviews` 的运行中被有意抑制）。
   - `RESUME_PHASE` = 第一个既未标记为 `[REVIEWED]`、也未标记为 `[REVIEWED-SKIPPED]` 的实现阶段。将 `[REVIEWED-SKIPPED]` 视为未完成会重新运行用户已抑制的审查。
   - `RESUME_STEPS` = `RESUME_PHASE` 中尚未标记为 `[DONE]` 的步骤，按依赖顺序排列。
2. **验证恢复阶段中已有的工作：**
   - 如果 `RESUME_PHASE` 已有一些标记为 `[DONE]` 的步骤，但没有任何一个阶段标记，并且 `RESUME_STEPS` 为空（所有步骤都已完成，但审查从未运行）：
     - **如果 `SKIP_REVIEWS` 为 true：不启动任何操作。** 将该阶段标记为 `[REVIEWED-SKIPPED]`，并从下一个实现阶段继续。
     - 否则：为 `RESUME_PHASE` 启动 `sdd:code-reviewer`（传入 Workflow Phase 2 中记录的 4 个输入）——**模型**：如果设置了 `MODEL_OVERRIDE`，则使用 `MODEL_OVERRIDE`；否则使用该阶段的 `Reviewer model`。
       - 如果根据 [Iteration Discretion Rule](#iteration-discretion-rule) 该阶段通过：将其标记为 `[REVIEWED]`，并从下一个实现阶段继续。
       - 否则：进入该阶段的 [Failure Handling](#failure-handling-reason-about-blast-radius-your-most-critical-judgement) 流程。
   - 如果 `RESUME_STEPS` 非空：先调度这些步骤，然后像平常一样审查该阶段——此时 `SKIP_REVIEWS` 仍会抑制该审查，并将阶段标记为 `[REVIEWED-SKIPPED]`。
3. **状态恢复：**
   - 检查任务文件的位置（`in-progress/`、`todo/`、`done/`）
   - 如果位于 `todo/`，则在继续之前将其移动到 `in-progress/`
   - 根据现有工件预先填充已捕获的值

### Refine 模式行为（`--refine`）

使用 `--refine` 时，它会检测**项目文件**的更改（而不是任务文件），并将这些更改映射到步骤，然后从拥有最早受影响步骤的实现阶段开始重新验证。

1. **检测已更改的项目文件：**

   首先，根据 git 状态确定要进行比较的对象：

   ```bash
   # Check for staged changes
   STAGED=$(git diff --cached --name-only)

   # Check for unstaged changes
   UNSTAGED=$(git diff --name-only)
   ```

   **比较逻辑：**

   | 已暂存 | 未暂存 | 比较对象 | 命令 |
   |--------|--------|----------|---------|
   | 是 | 是 | 已暂存（仅未暂存的更改） | `git diff --name-only` |
   | 是 | 否 | 上一次提交 | `git diff HEAD --name-only` |
   | 否 | 是 | 上一次提交 | `git diff HEAD --name-only` |
   | 否 | 否 | 无更改 | Exit with message |

   - 如果**既有已暂存更改又有未暂存更改**：将工作目录与暂存区进行比较（仅比较未暂存的更改）
   - 如果**只有已暂存更改或只有未暂存更改**：与上一次提交进行比较
   - 这确保 refine 操作针对最近的进行中工作

2. **将更改映射到步骤：**
   - 读取任务文件的 `### Parallelization Overview`，获取每个步骤的名称、其实现阶段以及对应的 `Sub-Task File` 路径。
   - **Refine 模式是唯一可以读取子任务文件的情况**：它们是规范产物（与任务文件类似），而不是实现输出；每个步骤的文件路径只记录在其 `#### Expected Output` 部分。只读取所需的 `#### Expected Output` 和 `#### Subtasks` 部分。
   - 构建映射：`{changed_file → step name → implementation phase}`

3. **确定受影响的范围：**
   - 找出所有具有关联已更改文件的步骤
   - `REFINE_FROM_PHASE` = 包含受影响步骤的最早实现阶段
   - 从该阶段开始的所有实现阶段都需要重新验证
   - 较早的阶段（未受影响）按原样保留

4. **Refine 执行：**
   - 对于每个受影响的实现阶段（按顺序）：
     - 启动一个**`sdd:code-reviewer` agent**来验证该阶段（包括用户的更改），传入 4 个标准输入 — **Model**：如果设置了 `MODEL_OVERRIDE`，则使用 `MODEL_OVERRIDE`；否则使用该阶段的 `Reviewer model`
     - 如果根据[迭代裁量规则](#iteration-discretion-rule)通过：将其标记为 `[REVIEWED]`，继续下一个阶段
     - 否则：进入[失败处理](#failure-handling-reason-about-blast-radius-your-most-critical-judgement)流程，然后重新审查
   - 保留用户的手动修复——实现 agent 应在此基础上继续构建，而不是覆盖这些修复

5. **示例：**

   ```bash
   # User manually fixed src/validation/validation.service.ts
   # (This file is the Expected Output of step `02-validation-service`, in Phase 1)

   /implement my-task.feature.md --refine

   # Detects: src/validation/validation.service.ts modified
   # Maps to: step `02-validation-service` → Phase 1
   # Action: Launch ONE sdd:code-reviewer for Phase 1
   #   - If PASS: User's fix is good, proceed to Phase 2
   #   - If FAIL: reason about blast radius, dispatch fixes for the affected
   #     steps only, without overwriting the user's changes, then re-review
   # Continues: Phase 2, Phase 3... (re-verify all subsequent phases)
   ```

6. **更改了多个文件：**

   ```bash
   # User edited an output of a Phase 1 step AND an output of a Phase 3 step

   /implement my-task.feature.md --refine

   # Earliest affected phase: Phase 1
   # Re-verifies: Phase 1, Phase 2, Phase 3...
   # (Phase 2 re-verified even though no direct changes, because it builds on Phase 1)
   ```

7. **已暂存与未暂存的更改：**

   ```bash
   # Scenario: User staged some changes, then made more edits
   # Staged: src/validation/validation.service.ts (git add done)
   # Unstaged: src/validation/validators/email.validator.ts (still editing)

   /implement my-task.feature.md --refine

   # Detects: Both staged AND unstaged changes exist
   # Mode: Compares unstaged only (working dir vs staging)
   # Only email.validator.ts is considered for refine

   # --

   # Scenario: User only has staged changes (ready to commit)
   # Staged: src/validation/validation.service.ts
   # Unstaged: none

   /implement my-task.feature.md --refine

   # Detects: Only staged changes
   # Mode: Compares against last commit
   ```

### 人机协作行为

人工验证检查点以**实现阶段**为键，而不是以单个步骤为键。

1. **触发条件：**
   - 在 `HUMAN_IN_THE_LOOP_PHASES` 中某个实现阶段的审查经编排器判定为 **PASS** 后
   - 对此类阶段完成一次修复迭代后（下一次重新审查之前）
   - 如果 `HUMAN_IN_THE_LOOP_PHASES` 为 `"*"`，则在每个实现阶段之后触发

2. **在检查点：**
   - 显示该阶段的步骤结果摘要
   - 显示生成的工件及其路径
   - 显示审查者的 `combined_score` 和汇总问题
   - 询问用户："Review phase output. Continue? [Y/n/feedback]"
   - 如果用户提供反馈，则将其纳入下一次迭代或阶段
   - 如果用户输入 `"n"`，则暂停工作流

3. **检查点消息格式：**

   ```markdown
   ---
   ## 🔍 Human Review Checkpoint - Phase N

   **Phase:** {phase heading}
   **Steps:** {step names}
   **Reviewer model:** {model used}
   **Combined Score:** {combined_score}/5.0 (threshold: {THRESHOLD})
   **Status:** ✅ PASS / ☑️ ACCEPTED / 🔄 ITERATING (attempt {n})

   **Artifacts Created/Modified:**
   - {artifact_path_1}
   - {artifact_path_2}

   **Reviewer Feedback (top issues):**
   {feedback summary — High/Medium issues from reviewer.issues, with the step each belongs to}

   **Action Required:** Review the above artifacts and provide feedback or continue.

   > Continue? [Y/n/feedback]:
   ---
   ```

---

## 任务选择与状态管理

### 任务状态文件夹

任务状态通过文件夹位置进行管理：

- `.specs/tasks/todo/` - 等待实现的任务
- `.specs/tasks/in-progress/` - 当前正在处理的任务
- `.specs/tasks/done/` - 已完成的任务

任务的子任务文件夹 `.specs/sub-tasks/<task-name>/` **永远不会移动**，任务文件会在这些文件夹之间移动，因此任务文件中记录的 `Sub-Task File` 路径始终有效。

### 状态转换

| 何时 | 操作 |
|------|--------|
| 开始实现 | 将任务从 `todo/` 移动到 `in-progress/` |
| 最终验证通过 | 将任务从 `in-progress/` 移动到 `done/` |
| 实现失败（用户中止） | 保持在 `in-progress/` 中 |

---

## 关键：你只能作为编排器

**你的角色是分派和汇总。你不执行实际工作。**

正确构建子代理的上下文！

关键要求：对于你分派的每个子代理，你**必须**提供：

**对于实现代理（每个步骤一个）：**

- 任务文件路径
- **该步骤的子任务文件路径**——必须是从并行化概览的 `Sub-Task File` 列中准确取得的唯一一个路径
- `${CLAUDE_PLUGIN_ROOT}` 的值，以便代理能够解析类似 `@${CLAUDE_PLUGIN_ROOT}/scripts/create-scratchpad.sh` 的路径

**对于 `sdd:code-reviewer`（每个实现阶段一个）：**

- 任务文件路径
- 阶段标识符
- 该阶段实现代理报告的制品路径
- `CLAUDE_PLUGIN_ROOT`

### 你要做的事情

- 仅在工作流阶段 1 读取一次任务文件
- 通过 Task 工具启动子代理
- 接收子代理的报告
- 根据审查者输出中的编排器级通过规则，将步骤和实现阶段标记为完成，标记为 [DONE]
- 在阶段审查失败时推理影响范围，并选择相应的修复/重新审查模型
- 汇总结果并向用户报告

### 你绝不能做的事情

| 禁止的操作 | 原因 | 应改为 |
|-------------------|-----|-------------------|
| 读取实现输出 | 上下文膨胀 → 可能丢失命令 | 由子代理报告其创建的内容 |
| 读取子任务文件（`--refine` 映射除外） | 实现代理会读取自己的子任务文件 | 传递并行化概览中的路径 |
| 读取参考文件 | 理解模式是子代理的工作 | 在子代理提示中包含路径 |
| 读取制品以“检查”它们 | 上下文膨胀 → 忘记验证 | 启动 `sdd:code-reviewer` 代理 |
| 自行评估代码质量 | 这不是你的工作，会导致遗忘 | 启动 `sdd:code-reviewer` 代理 |
| 单独审查某个步骤 | 审查是阶段级门禁 | 在阶段结束时只审查一次 |
| 因为简单就跳过阶段审查 | 除非使用 `--skip-reviews`，否则每个实现阶段都必须进行审查 | 无论如何都要启动 `sdd:code-reviewer` |
| 永远不要将审查、临时记录、迭代等结果添加为任务文件中的评论/标记/备注。 | 任务文件是规范制品，而不是日志。如果任务未完成，应只能从代码中看出！ | 你只能写入 [DONE] 标记，或者什么也不写！ |

### 反合理化规则

**如果你想：“我应该读取这个文件来了解创建了什么”**
→ **停下。** 子代理的报告会告诉你创建了什么。使用该信息。

**如果你想：“我快速验证一下这看起来是否正确”**
→ **停下。** 启动 `sdd:code-reviewer` 代理。这不是你的工作。

**如果你想：“这个阶段太简单了，不需要验证”**
→ **停下。** 除非 `SKIP_REVIEWS` 为 true，否则每个实现阶段都必须进行且只能进行一次审查。没有例外。

**如果你认为：**“这一步看起来有风险，我会在阶段结束前检查它”
**→ 停止。** 逐步检查正是此工作流所移除的做法。等待阶段完成。

**如果你认为：**“我需要阅读子任务文件，才能写出好的提示词”
**→ 停止。** 将子任务文件的 PATH 放入子代理提示词中。子代理会读取它。

### 为什么这很重要

编排器自行读取文件 = 上下文溢出 = 命令丢失 = 忘记步骤。每次都是如此。

编排器“快速验证” = 跳过 `sdd:code-reviewer` 代理 = 质量崩溃 = 产物失败。

**你的上下文窗口非常宝贵。保护它。委托一切。**

---

## 重要

### 配置规则

- **模型优先级（`MODEL_OVERRIDE`）：如果提供了 `--model`，该模型将优先于任务文件以及此技能中的所有默认值——使用它调度每一个子代理（任何类型的实现代理以及 `sdd:code-reviewer`），忽略并行化概览中的 `Model` 列和阶段概览中的 `Reviewer model`。它是覆盖值，而不是回退值。如果未提供 `--model`（`MODEL_OVERRIDE = none`），模型选择保持不变：每个步骤使用其并行化概览行所指定的 `Model`，每个阶段审查使用该阶段的 `Reviewer model`，如果未指定，则回退到各调度块中指定的默认值。**
- 对每个实现阶段的审查统一使用单一的 `THRESHOLD`（默认值为 4.0）。不存在按组件、按关键程度或宽松版本区分的变体。
- **绝不要从任务文件中读取阈值。** 规划代理不会写入阈值；如果其中不知何故出现了阈值，请忽略。
- 阈值由本编排器层针对代码审查员返回的 `combined_score` 应用。**绝不要将任何阈值传递给代码审查员代理——否则它会试图达到目标分数，从而变得主观。**
- 如果 `combined_score >= THRESHOLD`，阶段即**通过**。如果 `3.0 <= combined_score < THRESHOLD`，只有在[迭代裁量规则](#iteration-discretion-rule)允许的情况下阶段才通过——绝不能低于固定下限 `3.0`。如果 `combined_score < 3.0`，阶段无条件**失败**。
- **默认迭代次数为 3 次**——对于一个实现阶段，在 3 次修复→重新审查循环后停止，并继续下一个阶段（同时发出警告）！
- 如果 `MAX_ITERATIONS` 设置为 `unlimited`：持续迭代，直到达到质量阈值（无上限）
- 仅在 `HUMAN_IN_THE_LOOP_PHASES` 中指定的实现阶段之后触发人工介入检查点（如果为 `"*"`，则适用于所有阶段）！
- **如果 `SKIP_REVIEWS` 为 true：跳过所有代码审查员调度——在该阶段的步骤完成后直接继续下一个实现阶段！**
- **如果 `CONTINUE_MODE` 为 true：跳转至 `RESUME_PHASE` / `RESUME_STEPS`——不要重新实现已经完成的步骤！**
- **如果 `REFINE_MODE` 为 true：检测发生变更的项目文件，将其映射到步骤，并从 `REFINE_FROM_PHASE` 开始重新验证——保留用户的修复！**
- **如果 `STRICT_MODE` 为 true：[迭代裁量规则](#iteration-discretion-rule)将被禁用——阶段只有在 `combined_score >= THRESHOLD` 时才会通过，否则持续迭代，直到达到 `MAX_ITERATIONS`！**

### 执行与评估规则

- **仅使用前台代理**：不要使用后台代理。尽可能启动并行代理。后台代理经常会遇到权限问题和其他错误。
- **并行性来自任务文件**：`Parallel with:` 列中互相列出的步骤 MUST 在同一条消息中同时调度。计划规定并行执行的步骤绝不能串行执行。
- **绝不并行跨越阶段边界**：`Phase N+1` 的步骤只能在 `Phase N` 已完成审查并标记为 `[REVIEWED]`（或在 `SKIP_REVIEWS` 为 true 时标记为 `[REVIEWED-SKIPPED]`）之后开始。

如果发生以下情况，请重新启动 code-reviewer，直到获得有效结果：

- 拒绝冗长报告：如果 code-reviewer 返回了很长的报告，而不是按要求使用 scratchpad，则拒绝该结果。这表明该代理未遵循“使用 scratchpad”的指令。
- 综合得分 5.0 属于幻觉：如果 code-reviewer 返回的 `combined_score` 恰好为 5.0/5.0，则将其视为幻觉或敷衍评估。拒绝该结果并重新运行代理。这仅适用于**加权汇总分**——单个标准可以合法地获得 5 分，且不得进行分数配给；但 spec compliance、code quality 和 Muda waste analysis 的每个标准都同时严格超过各自的 `score_4` 锚点，并不符合合理的审查结果。绝不能以此为理由质疑某个单独的高分标准。
- 拒绝缺少分数的结果：如果 code-reviewer 的报告缺少 `combined_score`（或任何子分数：`spec_compliance_score`、`builtin_score`），则拒绝该结果。这表明该代理未遵循评分标准中的指令。
- 拒绝报告中的 PASS/FAIL 判定：如果 code-reviewer 的输出包含 PASS/FAIL 判定或提及阈值，则拒绝该结果。是否通过由编排器负责；代理必须对阈值保持盲态。
- 拒绝超出范围的发现：如果审查者对该阶段的验收标准进行扣分，而该阶段的 `#### Phase N` 块并未列出这些标准——例如将后续阶段交付的工作报告为“缺失”或“不完整”——则拒绝该报告并重新运行代理，同时重申阶段是检查点，而不是最终完成状态。

#### 迭代裁量规则

你的主要任务是在目标质量内完成任务。以下两种失败模式同样真实存在：

- 因为在细枝末节上消耗迭代次数和上下文，导致整体任务无法完成 → **任务失败**。
- 接受质量确实过低、不能被视为完成的结果 → **更严重的失败**。

将以下规则应用于每个实现阶段的 `combined_score`：

- `combined_score < 3.0` → **无条件 FAIL**。在阶段通过或达到 `MAX_ITERATIONS` 之前，根据审查者反馈持续迭代。
- `3.0 <= combined_score < THRESHOLD` → **裁量区间**。只有在此区间内，才可以决定接受低于目标的阶段结果。固定下限为 `3.0`，区间上限为 `THRESHOLD`。如果设置 `--target-quality` 时 `THRESHOLD <= 3.0`，则该区间为空：所有分数要么属于无条件 FAIL（`< 3.0`），要么属于 PASS，不存在可以行使裁量权的情况。
- 在该区间内，仅当尚存问题全部为 `Low`/`Medium` 优先级（任何 `High` 或 `Critical` 发现都会取消裁量权），并且这些问题均未违反该阶段负责的验收标准，也未造成有意义的缺陷（即仅为细枝末节问题）时，你 MUST 先进行推理——在调度下一轮迭代之前——判断继续迭代（或将阶段标记为失败）是否值得付出时间和上下文成本。
- 最多允许进行**一次由细枝末节问题驱动的迭代**，且该迭代计入 `MAX_ITERATIONS`。如果再次只发现细枝末节问题，则 MUST 将阶段标记为 PASS（在汇总表中标记为 ☑️ ACCEPTED），在最终报告中报告尚存的问题，并继续下一阶段。如果返回的 `combined_score` 低于 `3.0`，则适用 FAIL 路径。
- 阶段如果未能通过构建、lint 或测试，绝不属于裁量区间，无论分数如何。每个阶段都必须留下可工作、可提交且 CI 通过的状态。
- 你 MUST 保持批判性，**不能**宽松处理。在未达到目标时停止迭代 MUST 是基于不存在真实的、违反要求的问题而作出的有意决定。阻碍在 `MAX_ITERATIONS` 内完成阶段的真实问题必须报告为失败，绝不能掩盖。
- 如果 `STRICT_MODE` 为 true，则整条规则**禁用**：只有在 `combined_score >= THRESHOLD` 或达到 `MAX_ITERATIONS` 时才停止。`--strict` 不会改变其他任何内容——`THRESHOLD`、`MAX_ITERATIONS`、`< 3.0` 无条件 FAIL、人机协作检查点、code-reviewer 调度以及 `--skip-reviews` 均不受影响。使用 `--skip-reviews` 时根本不会生成 `combined_score`，因此本规则和 `--strict` 均不生效。

---

## 概述

此命令负责编排多步骤任务的实现，包括：

1. **按顺序执行**，遵循步骤依赖关系
2. **并行执行**，在计划的 `Parallel with:` 列允许时进行
3. **每个步骤对应一个实现代理**，调度时同时传入任务文件路径和其子任务文件路径
4. **每个实现阶段执行一次自动化验证**，使用该阶段指定的 `Reviewer model`
5. **进行影响范围推理**，在阶段审查失败时选择修复模型和重新审查模型
6. **跟踪进度**，在编排器级别每次 PASS 后进行确认

---

## 完整工作流概览

```
Workflow Phase 0: Select Task & Move to In-Progress
    │
    ├─── Use provided task file name or auto-select from todo/ (if only 1 task)
    ├─── Move task: todo/ → in-progress/
    │
    ▼
Workflow Phase 1: Load Task
    │   Parse ### Parallelization Overview (steps, models, agents, sub-task paths)
    │   Parse ### Phase Overview (phases, steps, reviewer models, criteria due)
    │
    ▼
Workflow Phase 2: Execute Implementation Phases
    │
    ├─── For each implementation phase, in order:
    │    │
    │    ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ For each step of the phase, in dependency order │
    │    │ (parallel steps dispatched simultaneously):     │
    │    │   Launch its agent at its Model with            │
    │    │   task file path + sub-task file path           │
    │    └─────────────────┬───────────────────────────────┘
    │                      │  all steps of the phase reported complete
    │                      ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ Launch ONE sdd:code-reviewer for the PHASE      │
    │    │ at the phase's Reviewer model                   │
    │    └─────────────────┬───────────────────────────────┘
    │                      │
    │                      ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ Orchestrator reads combined_score and applies   │
    │    │ THRESHOLD:                                      │
    │    │  PASS → Mark phase [REVIEWED], next phase       │
    │    │  FAIL → Reason about BLAST RADIUS, choose fix   │
    │    │         model + scope + re-review model,        │
    │    │         re-review (max MAX_ITERATIONS)          │
    │    └─────────────────────────────────────────────────┘
    │
    ▼
Workflow Phase 3: Definition of Done Verification
    │
    ├─── Verify all Definition of Done items
    │    │
    │    ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ Launch sdd:developer agent                      │
    │    │ (verify all DoD items)                          │
    │    └─────────────────┬───────────────────────────────┘
    │                      │
    │                      ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ All DoD PASS? → Proceed to Workflow Phase 4     │
    │    │ Any FAIL? → Fix and re-verify (iterate)         │
    │    └─────────────────────────────────────────────────┘
    │
    ▼
Workflow Phase 4: Move Task to Done
    │
    ├─── Move task: in-progress/ → done/
    │
    ▼
Workflow Phase 5: Final Report
```

---

## 工作流阶段 0：解析用户输入并选择任务

解析用户输入，以获取任务文件路径和参数。

### 步骤 0.1：解析任务文件

**如果 `$ARGUMENTS` 为空或仅包含标志：**

1. **优先检查进行中的文件夹：**

   ```bash
   ls .specs/tasks/in-progress/*.md 2>/dev/null
   ```

   - 如果恰好有 1 个文件 → 将 `$TASK_FILE` 设置为该文件，将 `$TASK_FOLDER` 设置为 `in-progress`
   - 如果有多个文件 → 列出这些文件并询问用户："有多个正在进行的任务。要继续哪一个？"
   - 如果没有文件 → 继续执行第 2 步

2. **检查待办文件夹：**

   ```bash
   ls .specs/tasks/todo/*.md 2>/dev/null
   ```

   - 如果恰好有 1 个文件 → 将 `$TASK_FILE` 设置为该文件，将 `$TASK_FOLDER` 设置为 `todo`
   - 如果有多个文件 → 列出这些文件并询问用户："有多个待办任务。要实现哪一个？"
   - 如果没有文件 → 报告 "没有可用任务。请先使用 /add-task 创建一个任务。" 并停止

**如果 `$ARGUMENTS` 包含任务文件名：**

1. 按以下顺序搜索文件：`in-progress/` → `todo/` → `done/`
2. 相应地设置 `$TASK_FILE` 和 `$TASK_FOLDER`
3. 如果未找到，则报告错误并停止

### 步骤 0.2：移至进行中状态（如有需要）

**如果任务位于 `todo/` 文件夹中：**

```bash
git mv .specs/tasks/todo/$TASK_FILE .specs/tasks/in-progress/
# 如果 git 不可用：mv .specs/tasks/todo/$TASK_FILE .specs/tasks/in-progress/
```

将 `$TASK_PATH` 更新为 `.specs/tasks/in-progress/$TASK_FILE`

**如果任务已经位于 `in-progress/` 中：**
将 `$TASK_PATH` 设置为 `.specs/tasks/in-progress/$TASK_FILE`

**不要移动子任务文件夹。** `.specs/sub-tasks/<task-name>/` 保持规划时创建的位置不变；任务文件中的 `Sub-Task File` 路径已经指向该位置。

### 步骤 0.3：解析标志并初始化配置

解析 `$ARGUMENTS` 中的所有标志并初始化配置。
**显示解析后的配置：**

```markdown
### Configuration

| Setting | Value |
|---------|-------|
| **Task File** | {TASK_PATH} |
| **Model Override** | {MODEL_OVERRIDE or "None (models from task file)"} |
| **Threshold** | {THRESHOLD}/5.0 |
| **Max Iterations** | {MAX_ITERATIONS or "3"} |
| **Human Checkpoints** | {HUMAN_IN_THE_LOOP_PHASES as comma-separated or "All phases" or "None"} |
| **Skip Reviews** | {SKIP_REVIEWS} |
| **Continue Mode** | {CONTINUE_MODE} |
| **Refine Mode** | {REFINE_MODE} |
| **Strict Mode** | {STRICT_MODE} |
```

### 步骤 0.4：处理继续模式

**如果 `CONTINUE_MODE` 为 true：** 根据[`--continue` 的上下文解析](#context-resolution-for---continue)解析 `RESUME_PHASE` 和 `RESUME_STEPS`，然后在工作流阶段 2 中跳过 `RESUME_PHASE` 之前的每个实现阶段，以及其中每个标记为 `[DONE]` 的步骤。

### 步骤 0.5：处理优化模式

**如果 `REFINE_MODE` 为 true：**

1. **检测已更改的项目文件：**

   ```bash
   # 检查已暂存和未暂存的更改
   STAGED=$(git diff --cached --name-only)
   UNSTAGED=$(git diff --name-only)
   ```

   **确定比较模式：**

   ```
   if STAGED is not empty AND UNSTAGED is not empty:
       # 同时存在已暂存和未暂存的更改 - 仅使用未暂存的更改
       CHANGED_FILES = git diff --name-only  # 工作目录与暂存区的比较
       COMPARISON_MODE = "unstaged_only"
   elif STAGED is not empty OR UNSTAGED is not empty:
       # 仅存在其中一种类型的更改 - 与上一次提交进行比较
       CHANGED_FILES = git diff HEAD --name-only
       COMPARISON_MODE = "vs_last_commit"
   else:
       # 没有更改
       Report: "No project changes detected. Make edits first, then run --refine."
       Exit
   ```

2. **构建步骤→文件映射：**
   - 阅读任务文件中的 `### Parallelization Overview`，获取步骤名称、阶段和 `Sub-Task File` 路径
   - 阅读这些子任务文件中的 `#### Expected Output` 和 `#### Subtasks` 部分，获取文件路径（这是上下文保护唯一允许的例外——参见[优化模式行为](#refine-mode-behavior---refine)）
   - 构建映射：`STEP_FILE_MAP = {step name → [file paths]}` 和 `STEP_PHASE_MAP = {step name → implementation phase}`

3. **将已更改文件映射到步骤：**

   ```
   AFFECTED_STEPS = []
   for each changed_file:
       for step_name, file_list in STEP_FILE_MAP:
           if changed_file matches any path in file_list:
               AFFECTED_STEPS.append(step_name)
   ```

   - 如果没有匹配到任何步骤："Changed files don't map to any step's Expected Output. Verify manually."

4. **确定优化范围：**
   - `REFINE_FROM_PHASE` = `STEP_PHASE_MAP[AFFECTED_STEPS]` 中最早的实现阶段
   - 从 `REFINE_FROM_PHASE` 开始的所有实现阶段都需要重新验证
   - `REFINE_FROM_PHASE` 之前的阶段保持原样

5. **存储已更改文件的上下文：**
   - `CHANGED_FILES` = 已更改文件路径的列表
   - `USER_CHANGES_CONTEXT` = 受影响文件的 git diff 输出
   - 将此上下文传递给你为修复而调度的实现代理
   - 代理应基于用户的修复继续工作，而不是覆盖它们

## 工作流阶段 1：加载并分析任务

**这是你读取文件的唯一阶段**（在 `--refine` 模式下还可读取子任务的 `#### Expected Output` 部分）。

### 步骤 1.1：加载任务详情

读取任务文件一次：

```bash
Read $TASK_PATH
```

**完成此次读取后，在余下的执行过程中不得读取任何其他文件。**

### 步骤 1.2：解析实现流程

将 `## Implementation Process` 部分解析为两个工作结构。

**来自 `### Parallelization Overview`**——步骤表包含 `| Step | Phase | Model | Agent | Depends on | Parallel with | Sub-Task File |` 列。为每个步骤名称构建以下信息：

| 字段 | 来源 | 用途 |
|-------|--------|----------|
| 步骤名称 | `Step` 列（以反引号括起的子任务基本名称） | 在所有其他列表中用作标识 |
| 实现阶段 | `Phase` 列 | 确定其所属的审查关卡 |
| 模型 | `Model` 列 | 其调度的 `model`（除非设置了 `MODEL_OVERRIDE`） |
| 代理 | `Agent` 列 | 要调度的 `sdd:` 代理类型 |
| 依赖项 | `Depends on` 列 | 排定顺序 |
| 可并行项 | `Parallel with` 列 | 确定哪些步骤应在一条消息中调度 |
| 子任务文件 | `Sub-Task File` 列 | 传递给代理的路径 |

**来自 `### Phase Overview`**——对于每个 `#### Phase N` 块，记录 `Steps:`、`Reviewer model:`、`Checklist items:` 列表和 `Rubrics:` 列表。使用 `Reviewer model:` 调度审查；条件列表由审查者负责，而不是你——不要将它们粘贴到任何提示词中。

任务文件中**没有阈值、没有验证级别，也没有评判者数量**。不要查找这些内容。

### 步骤 1.3：创建待办事项列表

创建 TodoWrite，每个步骤对应一个条目，每个实施阶段评审也对应一个条目：

```json
{
  "todos": [
    {"content": "Phase 1 / Step 01-foundation [haiku]", "status": "pending", "activeForm": "Implementing 01-foundation"},
    {"content": "Phase 1 / Step 02a-service [sonnet]", "status": "pending", "activeForm": "Implementing 02a-service"},
    {"content": "Phase 1 review [reviewer: sonnet]", "status": "pending", "activeForm": "Reviewing Phase 1"},
    {"content": "Phase 2 / Step 03-integration [sonnet]", "status": "pending", "activeForm": "Implementing 03-integration"},
    {"content": "Phase 2 review [reviewer: opus]", "status": "pending", "activeForm": "Reviewing Phase 2"}
  ]
}
```

---

## 工作流阶段 2：执行实施阶段

**按顺序**处理各个实施阶段。在一个阶段内，按照依赖顺序处理步骤，同时分派标记为 `Parallel with:` 的步骤组。当该阶段的所有步骤都报告完成后，执行一次阶段评审。

分派模式只有一种，且无一例外地适用于每个实施阶段。

### 阶段评审模式

```
for each implementation phase P, in order:
    for each dependency-ordered group G of steps in P:
        dispatch every step of G in ONE message (parallel), each with:
            agent type   = its Agent column
            model        = MODEL_OVERRIDE if set, else its Model column
            prompt       = task file path + its sub-task file path
        collect each agent's reported artifact paths

    if SKIP_REVIEWS:
        mark P [REVIEWED-SKIPPED]; continue to the next phase

    dispatch ONE sdd:code-reviewer for P with the 4 inputs
        model = MODEL_OVERRIDE if set, else P's `Reviewer model`

    apply THRESHOLD to combined_score
        PASS      → mark P [REVIEWED]; human checkpoint if due; next phase
        FAIL      → Failure Handling (blast radius) → re-review; up to MAX_ITERATIONS
```

### 步骤分派（每个步骤对应一个实施代理）

使用 Task 工具，每个步骤调用一次（将一个 `Parallel with:` 组中的所有步骤放在同一条消息中）：

- **代理类型**：步骤的 `Agent` 列，以 `sdd:` 为前缀（例如 `sdd:developer`、`sdd:tech-writer`）
- **模型**：如果设置了 `MODEL_OVERRIDE`，则使用它；否则使用步骤的 `Model` 列；若仍未指定，则使用 `sonnet`
- **描述**："Implement step [step-name]"
- **提示词**：

```
CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

Implement step `[step-name]`.

Task File: $TASK_PATH
Sub-Task File: [the Sub-Task File path from the Parallelization Overview]

Your task:
- Read the sub-task file first — it IS your step
- Read the task file for Description, Acceptance Criteria (including the Test Strategy) and Architecture Overview
- Execute ONLY this step. Do NOT execute any other step, even one you can see in the Parallelization Overview
- Follow the sub-task file's Expected Output, Success Criteria and Subtasks exactly
- Your phase is a checkpoint, not the finish line: implement what this step delivers, and do not pull later phases' work forward
- Leave the tree building, linting and testing green

When complete, report:
1. What files were created/modified (paths)
2. Confirmation that the sub-task's success criteria are met
3. Self-critique summary
4. Any issues encountered
```

**不要**将步骤目标、预期输出、成功标准或子任务粘贴到提示词中。代理会读取其子任务文件。传递路径即为契约；粘贴内容只会造成上下文膨胀和偏移。

从每份报告中收集制品路径。**不要读取制品。**

### 代码审查器输入契约（不可协商）

每次派发 `sdd:code-reviewer` 时都必须且只能包含以下 4 项输入，除此之外，不得包含任何类似阈值或通过/失败预期的内容（Task 工具的 `model` 参数属于派发设置，而非提示词输入——参见 `MODEL_OVERRIDE`）：

1. **任务文件路径**：`$TASK_PATH`
2. **阶段标识符**：正在审查的阶段，必须与 `### Phase Overview` 中的写法完全一致（例如 `Phase 2`）
3. **制品路径**：该阶段的实现代理报告为已创建或已修改的每个文件路径
4. **CLAUDE_PLUGIN_ROOT**：插件根路径

**派发提示词：**

```
CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

Apply your full evaluation process (Stages 0-12) and return a single combined report.

Inputs:

1. Task file path:
   $TASK_PATH

2. Phase identifier:
   [e.g. Phase 2]

3. Artifact path(s):
   [every file path reported by this phase's implementation agents]

4. CLAUDE_PLUGIN_ROOT: ${CLAUDE_PLUGIN_ROOT}
```

**绝不能向代码审查器传递：**

- 任何分数阈值、目标质量或及格线数值
- 任何通过/失败预期
- 任何由你自行编写的评分标准或检查清单（只有任务文件中的 `## Acceptance Criteria` 才具有权威性，并由 Phase Overview 限定范围）
- 子任务文件路径——**审查器会自行解析这些路径**，依据是 Phase Overview 中的 `Steps:` 行和 Parallelization Overview 中的 `Sub-Task File` 列
- 任务描述或验收标准文本——代理会自行读取任务文件

### 阈值应用（仅限编排器层级）

收到代码审查器的报告后，编排器（即此技能）应用阈值：

```
combined_score = reviewer.combined_score
all_issues     = reviewer.issues          # each carries the step it belongs to
blast_radius   = reviewer.blast_radius

# PASS rule (orchestrator decides):
if combined_score >= THRESHOLD:
    PASS
elif 3.0 <= combined_score < THRESHOLD and not STRICT_MODE:
    apply the Iteration Discretion Rule → accepted: PASS | declined: FAIL → fix
else:
    FAIL → fix
```

`combined_score` 已经包含 spec_compliance + code_quality + Muda 浪费分析（审查器会在内部按照其 STAGE 9 对这些内容进行汇总）。编排器无需重新汇总各子分数；对于关卡判定，只有 `combined_score`、`issues` 和 `blast_radius` 具有影响。

### 失败处理：判断影响范围（你最关键的判断）

**这是你在此工作流中需要做出的最重要判断。在派发任何任务之前，请充分思考。**

这里没有规则表，你也绝不能自行构建一个。这里只有一项原则：

> **应根据审查器发现问题的影响范围来匹配负责修复该阶段的代理以及负责重新审查修复结果的代理的能力，而不是根据最初构建该阶段时所使用的模型来匹配。**

在分派任何单项修复之前，先按以下顺序进行**明确的书面**推理：

1. **范围** — 这些发现涉及哪些步骤？使用 `issues[].step` 和 `blast_radius.affected_steps`。哪些步骤已被证明是可靠的？
2. **深度** — 这是步骤内部的局部缺陷，还是整个阶段在结构上就有问题（`blast_radius.requires_phase_rework`）？
3. **耦合** — 修复受影响的步骤是否会迫使你重写未受影响的步骤？如果会，那么修复单元应是阶段，而不是步骤。
4. **严重性** — 是破坏了该阶段所负责验收标准的高危/严重发现，还是低危/中危的细枝末节？
5. **能力上限** — 这次失败是否看起来是实现模型的能力已经不足？如果某个模型已经在同一项发现上失败过一次，那么再次以相同层级分派给它，仍会失败。应提升模型层级。

然后决定三件事：

- **修复模型** — 它可以高于或低于最初构建该步骤的模型，也可以因步骤而异。
- **修复范围** — 要重新分派哪些子任务文件。绝不要重新分派工作本身没有问题的步骤；否则只会破坏原本良好的工作成果。
- **复审模型** — 至少应达到该阶段的 `Reviewer model` 层级。当你因为阶段在结构上存在问题而提升修复模型层级时，也要提升复审模型层级：使用曾让该缺陷漏过的层级进行复审，不能算作有效检查。

**完整示例（基准案例）。** 一个包含三个步骤的阶段，全部由 `haiku` 构建、由 `sonnet` 审查，但未通过审查。仅因影响范围不同，相同的失败结论就会指向两种截然不同的修复方式：

- *情况 A — 整个阶段均告失败。* 审查者报告三个步骤中都存在高危发现，`requires_phase_rework: true`，且该阶段共享抽象的设计有误。影响范围 = 整个阶段；深度 = 结构性；耦合 = 完全耦合；能力上限 = `haiku` 显然无法胜任此设计。**决策：** 将整个阶段的所有步骤重新分派给 `sonnet`（如果该抽象确实很难，则分派给 `opus`），并改由 `opus` 复审，而不是继续使用该阶段的 `sonnet`——正是 `sonnet` 的审查把这个有缺陷的结构放到了你面前。
- *情况 B — 一个步骤失败。* 审查者只报告一项高危发现，`affected_steps: [02b-token-service]`、`requires_phase_rework: false`，且另外两个步骤没有问题。影响范围 = 一个步骤；深度 = 局部；耦合 = 无；能力上限 = 尚未触及，该缺陷只是遗漏了一个边缘情况，而非设计失败。**决策：** 仅重新分派 `02b-token-service`，仍使用 `haiku`，并附上审查者针对该步骤提出的问题；其余两个步骤保持不动；使用该阶段的 `sonnet` 复审。

**其他所有情况都应从这一原则中推导，而不是逐项枚举。** 混合模型阶段、仅因测试而失败的阶段、第二次失败的阶段、五个步骤中有两个相互耦合的阶段——这些情况都没有预先写好的答案。依次分析范围 → 深度 → 耦合 → 严重性 → 能力上限，写下你的推理过程，然后做出选择。不要诉诸决策矩阵；实际情况千差万别，不适合用同一个矩阵处理，而矩阵恰恰会让你在最需要思考的地方停止思考。

在最终报告中记录推理过程和选择，以便用户了解为何选择各个修复模型。

### 重试反馈构建

对于你决定重新分派的每个步骤，构建以下提示词（每个步骤一个；若步骤相互独立，则并行处理）：

```
CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

Fix step `[step-name]` — Phase [N] review iteration [K] of [MAX_ITERATIONS]

Task File: $TASK_PATH
Sub-Task File: [that step's Sub-Task File path]

The phase this step belongs to failed its quality review. Reviewer combined_score: [X.XX] / threshold [THRESHOLD]

Issues attributed to THIS step:
[paste the reviewer.issues entries whose `step` is this step (plus any `phase-wide` entries), verbatim: source, priority, description, evidence (file:line), impact, suggestion]

Full reviewer report (for additional context, do NOT skim — use the issues list as your primary work list):
[path to reviewer's scratchpad report file under .specs/scratchpad/<hex>.md]

Your task:
- Address every High priority issue attributed to this step
- Address every Medium priority issue attributed to this step
- Do NOT introduce functionality beyond your sub-task file's Expected Output
- Do NOT modify files owned by steps that were NOT re-dispatched
- Re-run tests/lint/build to ensure no regressions

When complete, report:
1. Files changed (paths)
2. Per-issue resolution status (Fixed / Partially Fixed / Skipped with justification)
3. Any new concerns introduced by the fix
```

每个重新分派的步骤都报告完成后，使用相同的 4 个输入，为同一阶段再次分派代码审查器（产物列表可能有所增加——传入其并集）。持续迭代，直到通过或达到 `MAX_ITERATIONS`。

如果达到 `MAX_ITERATIONS`：

- 记录警告："阶段 [N] 在 {MAX_ITERATIONS} 次迭代后仍未通过（最终 combined_score：X.XX，阈值：{THRESHOLD}）"
- 继续进入下一个实现阶段（不要无限期阻塞）

### 通过时：将阶段标记为完成

- 更新任务文件：
  - 在 `### Parallelization Overview` 表格中每个已完成步骤的名称旁标记 `[DONE]`
  - 将阶段标题标记为 `[REVIEWED]`（例如 `#### Phase 1: Foundation [REVIEWED]`）；当 `SKIP_REVIEWS` 为 true 时，标记为 `[REVIEWED-SKIPPED]`
- 将待办事项更新为 `completed`
- 在跟踪记录中记录 `combined_score`

各步骤自身的 `#### Subtasks` 和 `#### Success Criteria` 复选框由实现代理在其子任务文件中勾选，而不是由你勾选。

### 人工介入检查点（如适用）

**仅在实现阶段通过后**，如果阶段标识符包含在 `HUMAN_IN_THE_LOOP_PHASES` 中（或 `HUMAN_IN_THE_LOOP_PHASES == "*"`），则显示[人工介入行为](#human-in-the-loop-behavior)中的检查点。

- 如果用户提供反馈：保存反馈以供下一阶段使用，或根据反馈重新分派受影响的步骤
- 如果用户回复 "n"：暂停工作流并报告当前进度
- 如果用户回复 "Y" 或继续操作：进入下一个实现阶段

---

## ⚠️ 检查点：继续进行完成定义验证之前

在进入 DoD 验证之前，请确认你遵循了以下规则：

- [ ] 你是否为每个步骤分派了一个实现代理，并同时提供了任务文件路径及其子任务文件路径？
- [ ] 你是否按照并行化概览中对应行指定的模型分派了每个步骤（除非设置了 `MODEL_OVERRIDE`）？
- [ ] 你是否在每个实现阶段结束时仅启动了一个 `sdd:code-reviewer`（除非设置了 `SKIP_REVIEWS`），并使用该阶段的 `Reviewer model`？
- [ ] 你是否避免审查任何单独的步骤？
- [ ] 你是否自行将 `THRESHOLD` 应用于 `combined_score`，且未向审查代理传递任何阈值？
- [ ] 在为每次修复和重新审查选择模型之前，你是否以书面形式分析了影响范围？
- [ ] 你是否仅在满足编排器级别的 PASS 规则后，才将阶段标记为 `[REVIEWED]`？
- [ ] 你是否避免自行读取任何产物文件？

**如果你读取了任务文件（以及 `--refine` 模式下子任务的 Expected Outputs）之外的文件，就说明你的做法是错误的。立即停止并重新开始。**

---

## 工作流阶段 3：完成定义验证

完成所有实现阶段后，验证任务是否满足所有完成定义标准。

### 步骤 3.1：启动完成定义验证

**使用 Task 工具，并提供以下参数：**

- **代理类型**：`sdd:developer`
- **模型**：如果设置了 `MODEL_OVERRIDE`，则使用它；否则使用 `opus`
- **描述**："Verify Definition of Done"
- **提示词**：

```
CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

Verify all Definition of Done items in the task file.

Task File: $TASK_PATH

Your task:
1. Read the task file and locate the `## Acceptance Criteria` section, then its `**Definition of Done:**` sub-block
2. Go through each checkbox item one by one
3. For each item, verify if it passes by:
   - Running appropriate tests (unit tests, E2E tests)
   - Checking build/compilation status
   - Verifying file existence and correctness
   - Checking code patterns and linting
4. You MUST mark each item in the task file that passed verification with `[X]`
5. Return a structured report:
- List ALL Definition of Done items
- Status for each:
   - ✅ PASS - if the item is complete and verified
   - ❌ FAIL - if the item fails verification, with specific reason why
   - ⚠️ BLOCKED - if the item cannot be verified due to a blocker
- Evidence for each status
- Specific issues for any failures
- Overall pass rate

This is the TASK-LEVEL check, run once, after every implementation phase is done. Unlike a phase review, nothing here is "not yet due" — every Definition of Done item must hold now.

Be thorough - check everything the task requires.
```

### 步骤 3.2：审查验证结果

- 接收完成定义验证报告
- 记录哪些 DoD 项为 PASS，哪些为 FAIL
- 如果验证代理报告所有 DoD 项均为 PASS，你必须确认任务文件末尾的所有 DoD 项都已标记为 `[X]`

### 步骤 3.3：修复失败的 DoD 项（如有）

如果有任何完成定义项为 FAIL：

**1. 为每个失败项启动一个实现代理** — **模型**：如果已设置 `MODEL_OVERRIDE`，则使用该模型 — 否则使用 `opus`：

```
修复 Definition of Done 项：[Item Description]

任务文件：$TASK_PATH

当前状态：
[粘贴验证报告中的失败详情]

你的任务：
1. 修复所识别的具体问题
2. 验证修复已解决该问题
3. 确保没有回归问题（所有测试仍然通过）

返回：
- 修复了什么
- 确认该项现在已通过
- 所做的任何相关更改
```

**2. 修复后重新验证：**

再次启动验证代理（步骤 3.1），确认所有项现在均为 PASS。

**3. 必要时迭代：**

重复修复 → 验证循环，直到所有 Definition of Done 项均为 PASS。

---

## 工作流阶段 4：将任务移至完成状态

当所有 Definition of Done 项均为 PASS 后，将任务移至完成文件夹。

### 步骤 4.1：验证完成情况

确认任务文件中的所有 Definition of Done 项均已标记为完成。

### 步骤 4.2：移动任务

```bash
# Extract just the filename from $TASK_PATH
TASK_FILENAME=$(basename $TASK_PATH)

# Move from in-progress to done
git mv .specs/tasks/in-progress/$TASK_FILENAME .specs/tasks/done/
# Fallback if git not available: mv .specs/tasks/in-progress/$TASK_FILENAME .specs/tasks/done/
```

**不要移动 `.specs/sub-tasks/<task-name>/`。**它应保留在原位置；这样任务文件中记录的路径才能继续正确解析。

---

## 工作流阶段 5：汇总与报告

### 最终报告

在所有实现阶段完成并且 DoD 验证通过后：

```markdown
## Implementation Summary

### Task Status
- Task Status: `done` ✅
- All Definition of Done items: X/X PASS (100%)

### Configuration Used

| Setting | Value |
|---------|-------|
| **Model Override** | {MODEL_OVERRIDE or "None (models from task file)"} |
| **Threshold** | {THRESHOLD}/5.0 |
| **Max Iterations** | {MAX_ITERATIONS or "3"} |
| **Human Checkpoints** | {HUMAN_IN_THE_LOOP_PHASES or "None"} |
| **Skip Reviews** | {SKIP_REVIEWS} |
| **Continue Mode** | {CONTINUE_MODE} |
| **Refine Mode** | {REFINE_MODE} |
| **Strict Mode** | {STRICT_MODE} |

### Steps Completed

| Step | Phase | Model Used | Status |
|------|-------|------------|--------|
| `01-foundation` | Phase 1 | haiku | ✅ |
| `02a-service` | Phase 1 | sonnet | ✅ |
| `03-integration` | Phase 2 | sonnet | ✅ (re-dispatched at opus in iteration 1) |

### Phase Reviews

| Phase | Steps | Reviewer Model | Combined Score | Iterations | Status |
|-------|-------|----------------|----------------|------------|--------|
| Phase 1 | 2 | sonnet | 4.3/5 | 1 | ✅ |
| Phase 2 | 1 | opus | 3.6/5 | 2 | ☑️ |

**图例：**
- ✅ PASS - `combined_score >= THRESHOLD`
- ☑️ ACCEPTED - 根据[迭代酌情处理规则](#iteration-discretion-rule)，分数处于酌情处理区间 `3.0 <= combined_score < THRESHOLD`，因此予以接受（未解决的细小问题列于 Recommendations 下）
- ⚠️ MAX_ITER - 未通过，但已达到 MAX_ITERATIONS，因此继续执行
- ⏭️ SKIPPED - 已跳过评审（`--skip-reviews`、continue 或 refine 模式）；阶段标题带有 `[REVIEWED-SKIPPED]`，而不是 `[REVIEWED]`

### 修复决策（影响范围推理）

| Phase | Iteration | Findings scope | Fix model chosen | Re-review model | Reasoning |
|-------|-----------|----------------|------------------|-----------------|-----------|
| Phase 2 | 1 | 1 of 1 step, structural | opus (was sonnet) | opus (was opus) | Shared abstraction wrong; sonnet had already failed on it |

### 评审摘要

- 实现阶段总数：X
- 已评审阶段数：Y
- 首次评审即通过的阶段数：Z
- 根据迭代酌情处理规则，在目标分数以下被接受的阶段数：U（未解决的细小问题列于 Recommendations 下）
- 所需的修复迭代次数：W
- 所有阶段的迭代总次数：V
- 最终通过率：100%

### Definition of Done 验证

| Item | Status | Evidence |
|------|--------|----------|
| [DoD Item 1] | ✅ PASS | [Brief evidence] |
| [DoD Item 2] | ✅ PASS | [Brief evidence] |
| ... | ... | ... |

**验证期间修复的问题：**
1. [Issue]：[How it was fixed]
2. [Issue]：[How it was fixed]

### 人工评审摘要（如果使用了 --human-in-the-loop）

| Phase | Checkpoint | User Action | Feedback Incorporated |
|-------|------------|-------------|----------------------|
| Phase 1 | After PASS | Continued | - |
| Phase 2 | After iteration 1 | Feedback | "Improve error messages" |

### 任务文件已更新

- 任务已从 `in-progress/` 文件夹移至 `done/` 文件夹
- Parallelization Overview 中的所有步骤行均已标记为 `[DONE]`
- Phase Overview 中的所有阶段标题均已标记为 `[REVIEWED]`；对于因 `--skip-reviews` 而跳过评审的阶段，则标记为 `[REVIEWED-SKIPPED]`
- 所有 Definition of Done 项均已标记为 `[X]`
- 子任务文件中的子任务已由其实现代理标记为 `[X]`

### 建议

1. [Any follow-up actions]
2. [Suggested improvements]
```

---

## 执行流程图

```
┌──────────────────────────────────────────────────────────────┐
│                IMPLEMENT TASK WITH VERIFICATION               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  Workflow Phase 0: Select Task                                │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Use provided name or auto-select from todo/ (if 1 task) │  │
│  │ → Move task from todo/ to in-progress/                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Workflow Phase 1: Load Task                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Read $TASK_PATH → Parse Parallelization Overview        │  │
│  │ (steps, models, agents, sub-task paths) + Phase         │  │
│  │ Overview (phases, reviewer models) → TodoWrite          │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Workflow Phase 2: Execute Implementation Phases              │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  For each implementation phase:                          │  │
│  │                                                          │  │
│  │  ┌──────────────┐                                        │  │
│  │  │ step agent   │─┐                                      │  │
│  │  ├──────────────┤ │ (parallel where the plan says so)    │  │
│  │  │ step agent   │─┤                                      │  │
│  │  ├──────────────┤ │                                      │  │
│  │  │ step agent   │─┘                                      │  │
│  │  └──────────────┘ │                                      │  │
│  │                   ▼                                      │  │
│  │        ┌─────────────────────┐    ┌───────────┐          │  │
│  │        │ ONE code-reviewer   │───▶│ PASS?     │          │  │
│  │        │ for the whole phase │    │           │          │  │
│  │        └─────────────────────┘    └───────────┘          │  │
│  │                                     │      │             │  │
│  │                                   PASS   FAIL            │  │
│  │                                     │      │             │  │
│  │                                     ▼      ▼             │  │
│  │                            ┌──────────┐  Blast-radius    │  │
│  │                            │ Mark     │  reasoning →     │  │
│  │                            │[REVIEWED]│  fix model +     │  │
│  │                            └──────────┘  scope + re-     │  │
│  │                                          review model ↺  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Workflow Phase 3: Definition of Done Verification            │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │  ┌──────────────┐    ┌───────────────┐    ┌───────────┐ │  │
│  │  │ DoD Verifier │───▶│ All DoD       │───▶│ All PASS? │ │  │
│  │  │ Agent        │    │ items checked │    │           │ │  │
│  │  └──────────────┘    └───────────────┘    └───────────┘ │  │
│  │                                                │   │    │  │
│  │                                               Yes  No   │  │
│  │                                                │   │    │  │
│  │                                                ▼   ▼    │  │
│  │                                                Fix &    │  │
│  │                                                Retry    │  │
│  │                                                ↺        │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Workflow Phase 4: Move Task to Done                          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ mv in-progress/$TASK → done/$TASK                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Workflow Phase 5: Aggregate & Report                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Collect all phase review results                        │  │
│  │ → Calculate aggregate metrics                           │  │
│  │ → Generate final report                                 │  │
│  │ → Present to user                                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 使用示例

### 基本用法

```bash
# Implement a specific task
/implement add-validation.feature.md

# Auto-select task from todo/ or in-progress/ (if only 1 task)
/implement

# Continue from the last completed step
/implement add-validation.feature.md --continue

# Refine after user fixes project files (detects changes, re-verifies affected phases)
/implement add-validation.feature.md --refine

# Human review after every implementation phase
/implement add-validation.feature.md --human-in-the-loop

# Human review after specific phases only
/implement add-validation.feature.md --human-in-the-loop "Phase 1,Phase 3"

# Higher quality threshold (stricter)
/implement add-validation.feature.md --target-quality 4.5

# Lower quality threshold (faster convergence)
/implement add-validation.feature.md --target-quality 3.5

# Unlimited iterations (default is 3)
/implement add-validation.feature.md --max-iterations unlimited

# Skip all phase reviews (fast but no quality gates)
/implement add-validation.feature.md --skip-reviews

# Strict mode: never accept a phase below target - iterate until threshold or MAX_ITERATIONS
/implement add-validation.feature.md --strict

# Force ALL sub-agents (implementers + code-reviewer) onto one model, overriding the task file
/implement add-validation.feature.md --model sonnet

# Combined: continue with human review
/implement add-validation.feature.md --continue --human-in-the-loop
```

### 示例 1：实现功能

```
User: /implement add-validation.feature.md

Workflow Phase 0: Task Selection...
Found task in: .specs/tasks/todo/add-validation.feature.md
Moving to in-progress: .specs/tasks/in-progress/add-validation.feature.md

Workflow Phase 1: Loading task...
Task: "Add form validation service"
Parallelization Overview: 4 steps
Phase Overview: 2 implementation phases
- Phase 1: 01-validation-types, 02-validation-service — reviewer sonnet
- Phase 2: 03a-email-validator, 03b-phone-validator — reviewer opus
Threshold: 4.0/5.0

Workflow Phase 2: Executing...

Phase 1 / step 01-validation-types [haiku]
  Prompt: task file + .specs/sub-tasks/add-validation/01-validation-types.md
  Result: ✅ src/validation/types.ts

Phase 1 / step 02-validation-service [sonnet]
  Prompt: task file + .specs/sub-tasks/add-validation/02-validation-service.md
  Result: ✅ src/validation/validation.service.ts + spec

  Launching 1 sdd:code-reviewer for Phase 1 (model: sonnet)...
  Inputs: task file path, "Phase 1", 3 artifact paths, CLAUDE_PLUGIN_ROOT
  combined_score 4.3/5.0 ≥ threshold 4.0 → PASS ✅
  Marking Phase 1 [REVIEWED]

Phase 2 / steps 03a-email-validator, 03b-phone-validator [haiku, haiku] — dispatched in parallel
  Result: ✅ 2 validators + specs

  Launching 1 sdd:code-reviewer for Phase 2 (model: opus)...
  combined_score 4.5/5.0 ≥ threshold 4.0 → PASS ✅

Workflow Phase 3: Definition of Done Verification...
  Result: 4/4 items PASS ✅

Workflow Phase 4: Moving task to done...

Workflow Phase 5: Final Report
Implementation complete.
- 4/4 steps completed, 2/2 phases reviewed
- All passed first review
- Definition of Done: 4/4 PASS
- Task location: .specs/tasks/done/add-validation.feature.md ✅
```

### 示例 2：处理 DoD 条目失败

```
[所有实现阶段均已完成并经过审查……]

工作流阶段 3：完成定义验证……
正在启动 DoD 验证代理……
  结果：4 个条目中 3 个通过，1 个失败 ❌

失败条目：
- “代码遵循 ESLint 规则”：发现 356 个错误

是否应尝试修复此问题？[Y/n]

用户：Y

正在启动 sdd:developer 代理……
  结果：已修复 356 个错误，0 个警告 ✅

正在重新启动 DoD 验证代理……
  结果：4 个条目全部通过 ✅

工作流阶段 4：将任务移至完成状态……
所有 DoD 复选框均已标记为完成 ✅
```

下面的示例 3 和示例 4 是[失败处理](#failure-handling-reason-about-blast-radius-your-most-critical-judgement)中同一个锚点案例的两个部分，以会话日志的形式展示了完整过程。它们**不是**情形目录——所有其他失败都应根据该原则进行推理，而不是查表得出。

### 示例 3：阶段审查失败——锚点案例 A，以会话日志形式展示

```
阶段 2 完成：步骤 03a、03b、03c——均由 haiku 构建。
正在为阶段 2 启动 1 个 sdd:code-reviewer（模型：sonnet）……

combined_score 2.1/5.0——低于阈值 4.0 且低于 3.0 下限 → 失败（无酌处权）

审查者的 blast_radius：
  affected_steps: [03a-parser, 03b-evaluator, 03c-formatter]
  unaffected_steps: []
  requires_phase_rework: true

爆炸半径推理：
- 范围：全部 3 个步骤都存在 High 级问题
- 深度：结构性问题——这 3 个步骤共同约定的 Rule 接口是错误的
- 耦合性：完全耦合——修复其中一个会迫使另外两个也重写
- 严重性：4 个 High 级问题，其中 2 个会破坏 CK-3 和 CK-4，而这两项由阶段 2 负责
- 能力上限：haiku 对同一接口给出了 3 个彼此不一致的实现
→ 修复模型：sonnet，用于全部 3 个步骤（原为 haiku）
→ 修复范围：整个阶段
→ 重新审查模型：opus（原为 sonnet）——正是 sonnet 的审查让这种形态得以通过

迭代 1/3：正在以 sonnet 重新分派 03a、03b、03c，并附带各步骤的问题……
正在以 opus 重新启动阶段 2 的 sdd:code-reviewer……
combined_score 4.4/5.0 ≥ 阈值 4.0 → 通过 ✅
将阶段 2 标记为[已审查]
```

### 示例 4：阶段审查失败——锚点案例 B，以会话日志形式展示

```
阶段 1 完成：步骤 01a、01b、01c——均由 haiku 构建。
正在为阶段 1 启动 1 个 sdd:code-reviewer（模型：sonnet）……

combined_score 3.4/5.0——低于阈值 4.0，处于酌处区间内 → 但一个 High 级问题取消了酌处权 → 失败

审查者的 blast_radius：
  affected_steps: [01b-token-service]
  unaffected_steps: [01a-user-model, 01c-config]
  requires_phase_rework: false

爆炸半径推理：
- 范围：3 个步骤中只有 1 个步骤
- 深度：局部问题——遗漏了一个过期边界情况，而不是设计失败
- 耦合性：无——01a 和 01c 不涉及令牌路径
- 严重性：1 个 High 级问题，会破坏 CK-2，而这项由阶段 1 负责
- 能力上限：尚未触及——该步骤的设计是正确的，只缺少一个分支
→ 修复模型：haiku（不变）
→ 修复范围：仅 01b-token-service——不重新分派 01a 和 01c
→ 重新审查模型：sonnet（阶段的审查模型，不变）

迭代 1/3：正在以 haiku 重新分派 01b-token-service……
正在以 sonnet 重新启动阶段 1 的 sdd:code-reviewer……
combined_score 4.2/5.0 ≥ 阈值 4.0 → 通过 ✅
```

### 示例 5：从中断处继续

```
User: /implement add-validation.feature.md --continue

Workflow Phase 0: Parsing flags...
Configuration:
- Continue Mode: true
- Threshold: 4.0/5.0 (default)

Scanning task file...
Parallelization Overview: 01-... [DONE], 02-... [DONE], 03-..., 04-...
Phase Overview: Phase 1 [REVIEWED], Phase 2 (not reviewed)
RESUME_PHASE = Phase 2
RESUME_STEPS = 03-..., 04-...

Resuming: dispatching 03-... and 04-... (parallel per the plan)...
[both complete]

Launching 1 sdd:code-reviewer for Phase 2 (model: opus)...
combined_score 4.3/5.0 ≥ threshold 4.0 → PASS ✅
```

### 示例 6：用户修复后进行优化

```
# User manually fixed src/validation/validation.service.ts
# (Expected Output of step 02-validation-service, in Phase 1)

User: /implement add-validation.feature.md --refine

Workflow Phase 0: Parsing flags...
Configuration:
- Refine Mode: true

Detecting changed project files...
- src/validation/validation.service.ts (modified)

Mapping files to steps (reading sub-task Expected Output sections)...
- src/validation/validation.service.ts → 02-validation-service → Phase 1

Earliest affected phase: Phase 1
Preserving: nothing earlier
Re-verifying from: Phase 1 onwards

Launching 1 sdd:code-reviewer for Phase 1...
combined_score 4.3/5.0 ≥ threshold 4.0 → PASS ✅

Launching 1 sdd:code-reviewer for Phase 2...
combined_score 2.8/5.0 — High finding "typescript error in src/validation/index.ts" → FAIL
Blast radius: 1 step (04-barrel-exports), local, no coupling, ceiling not reached
→ re-dispatch 04-barrel-exports at its original model with the user's diff as context

Re-launching sdd:code-reviewer for Phase 2...
combined_score 4.5/5.0 → PASS ✅

All phases verified with user's changes incorporated ✅
```

### 示例 7：人机协同评审

```
User: /implement add-validation.feature.md --human-in-the-loop

Configuration:
- Human Checkpoints: All phases

Phase 1 / steps 01-..., 02-... dispatched...
Result: ✅ complete

Launching 1 sdd:code-reviewer for Phase 1 (model: sonnet)...
combined_score 4.4/5.0 ≥ threshold 4.0 → PASS ✅

---
## 🔍 Human Review Checkpoint - Phase 1

**Phase:** Phase 1: Validation Core
**Steps:** `01-validation-types`, `02-validation-service`
**Reviewer model:** sonnet
**Combined Score:** 4.4/5.0 (threshold: 4.0)
**Status:** ✅ PASS

**Artifacts Created/Modified:**
- src/validation/types.ts
- src/validation/validation.service.ts
- src/validation/tests/validation.service.spec.ts

**Reviewer Feedback (top issues):**
- [Low] `02-validation-service` — Error messages could be more descriptive

**Action Required:** Review the above artifacts and provide feedback or continue.

> Continue? [Y/n/feedback]: The error messages could be more descriptive
---

Incorporating feedback: re-dispatching 02-validation-service with the feedback...
[iteration continues]
```

### 示例 8：严格质量阈值

```
User: /implement add-validation.feature.md --strict

Configuration:
- Strict Mode: true (Iteration Discretion Rule DISABLED)
- Threshold: 4.0/5.0 (default)
- Max Iterations: 3 (default)

Phase 1 / steps 01-..., 02-... dispatched...

Launching 1 sdd:code-reviewer for Phase 1 (model: sonnet)...
combined_score 3.6/5.0 — outstanding issues are 2 Low nitpicks only
Without --strict this would sit in the discretion band (3.0 <= 3.6 < 4.0) and be ☑️ ACCEPTED.
--strict disables that discretion → FAIL, iterate.

Blast radius: 1 step (02-validation-service), local → re-dispatch it with the reviewer feedback
Re-launching sdd:code-reviewer for Phase 1 (iteration 2)...
combined_score 4.2/5.0 ≥ threshold 4.0 → PASS ✅
Marking Phase 1 [REVIEWED]
```

---

## 错误处理

### 实现失败

如果实现代理报告失败：

1. 向用户展示失败详情
2. 提出有助于解决问题的澄清问题
3. 使用这些澄清信息重新调度该步骤的代理
4. 步骤失败会延迟该阶段的评审，但绝不会跳过评审。阶段中的每个步骤都报告完成后，阶段评审将完全按正常流程运行（除非设置了 `SKIP_REVIEWS`）。

### 评审者返回无效报告

如果 `sdd:code-reviewer` 返回的报告触发了[执行与评估规则](#execution--evaluation-rules)中的任一规则 — `combined_score` 为 5.0、缺少 `combined_score`、包含 PASS/FAIL 判定，或针对该阶段不负责的验收标准提出发现 — 则拒绝该报告，并使用相同的 4 个输入重新运行代理。绝不要自行修复其报告。

### Refine 模式：未检测到更改

如果 `--refine` 模式在项目中未发现 git 更改：

1. 报告："No project file changes detected since last commit."
2. 建议："Make edits to project files first, then run --refine again."
3. 或者："Run without --refine to re-implement all steps."

### Refine 模式：更改无法映射到步骤

如果 `--refine` 模式发现有更改的文件，但没有任何文件能够映射到某个步骤的 Expected Output：

1. 报告："Changed files don't match any step's Expected Output."
2. 列出检测到的更改文件
3. 建议："Verify manually or run without --refine to re-verify all phases."

### 缺少子任务文件

如果并行化概览中的 `Sub-Task File` 路径不存在：

1. 尝试 `.specs/sub-tasks/<task-file-basename-without-extension>/<step-name>.md` — 该文件夹不会移动，因此通常可以恢复过期路径
2. 如果仍然缺失，将其报告给用户并停止。不要臆造步骤内容，也不要仅凭任务文件调度代理。

---

## 检查清单

完成实现前：

### 配置处理

- [ ] 正确解析 `$ARGUMENTS` 中的所有标志
- [ ] 应用 `--model` 的 `MODEL_OVERRIDE` 优先级规则（参见[配置规则](#configuration-rules)）
- [ ] 对每个实现阶段评审使用同一个 `THRESHOLD`（默认值为 4.0）
- [ ] 不从任务文件中读取任何阈值
- [ ] 持续迭代，直到满足编排器级别的 PASS 规则（或达到 `MAX_ITERATIONS`，默认值为 3）
- [ ] 仅在 `3.0 <= combined_score < THRESHOLD` 的裁量区间内应用[迭代裁量规则](#iteration-discretion-rule)，绝不接受低于 `3.0` 的分数，将 `< 3.0` 视为无条件 FAIL，并且最多只进行一次由细枝末节问题驱动的迭代
- [ ] 不向 code-reviewer 传递任何阈值、下限或区间值 — 代理始终不了解阈值
- [ ] 如果 `STRICT_MODE` 为 true：忽略迭代裁量规则，并持续迭代直到达到 `THRESHOLD` 或 `MAX_ITERATIONS`
- [ ] 仅对 `HUMAN_IN_THE_LOOP_PHASES` 中的实现阶段触发人工介入检查点
- [ ] 如果 `SKIP_REVIEWS` 为 true：跳过所有 code-reviewer 调度
- [ ] 如果 `CONTINUE_MODE` 为 true：解析 `RESUME_PHASE` + `RESUME_STEPS` 并正确恢复执行
- [ ] 如果 `REFINE_MODE` 为 true：检测更改的项目文件，将其映射到步骤，并从最早受影响的实现阶段开始重新验证

### 上下文保护（关键）

- [ ] 仅阅读任务文件（`.specs/tasks/in-progress/` 中的 `$TASK_PATH`）——以及 `--refine` 模式下子任务的 `#### Expected Output` 部分，不阅读其他内容
- [ ] 未阅读实现输出、参考文件或构件
- [ ] 使用子代理报告获取状态——未通过读取文件来“检查”

### 委派

- [ ] 每个步骤均通过 Task 工具由其自己的子代理实现，并传入任务文件路径和子任务文件路径
- [ ] 每个步骤均由其 Parallelization Overview 行中指定的模型和代理类型执行（除非使用 `MODEL_OVERRIDE`）
- [ ] 每个实现阶段恰好分派一个 `sdd:code-reviewer`，并使用该阶段的 `Reviewer model`（除非使用 `SKIP_REVIEWS`）
- [ ] 未审查任何单独步骤
- [ ] 未自行执行任何验证

### 进度跟踪

- [ ] 每个步骤的代理报告完成后，将 Parallelization Overview 中对应的步骤行标记为 `[DONE]`
- [ ] 仅在编排器级别通过审查后，才将每个阶段标题标记为 `[REVIEWED]`（如果使用 `SKIP_REVIEWS`，则标记为 `[REVIEWED-SKIPPED]`）
- [ ] 每个步骤和每个阶段审查后更新 Todo 列表

### 执行质量

- [ ] 所有步骤均按依赖顺序执行
- [ ] `Parallel with:` 分组在同一条消息中同时启动（而非按顺序启动）
- [ ] 在前一阶段完成审查前，不得启动后续阶段的任何步骤
- [ ] 在选择每个修复模型、修复范围和重新审查模型之前，先写明影响范围分析
- [ ] 仅重新分派受影响的步骤——保持正确的步骤不变
- [ ] 根据审查者的 `issues`（按步骤归属）迭代处理审查失败，直到编排器级别通过
- [ ] 生成包含阶段审查结果和修复决策的最终报告

### 人机协作（如已启用）

- [ ] 在每个实现阶段之后显示检查点，该阶段位于 `HUMAN_IN_THE_LOOP_PHASES` 中
- [ ] 将用户反馈纳入后续迭代/阶段
- [ ] 用户要求暂停时暂停工作流

### 最终验证与完成

- [ ] 启动定义完成标准验证代理，读取 `## Acceptance Criteria` → `**Definition of Done:**`
- [ ] 验证所有 DoD 项目（状态为 PASS/FAIL/BLOCKED）
- [ ] 通过实现代理修复失败的 DoD 项目
- [ ] 修复后重新执行验证
- [ ] 将任务从 `in-progress/` 文件夹移动到 `done/` 文件夹（保留子任务文件夹）
- [ ] 将任务文件中的所有 DoD 复选框标记为 `[X]`
- [ ] 向用户呈现最终验证报告

---

## 附录 A：任务文件和子任务文件提供的内容

本附录介绍此技能所使用的构件，是一份阅读指南，并不表示在工作流阶段 1 之外阅读更多文件。

### 任务文件结构

规划好的任务文件恰好包含以下部分：

| 部分 | 编写者 | 此技能的用途 |
|---------|-----------|--------------|
| `# Description` | `sdd:business-analyst` | 不直接使用——由子代理读取 |
| `## Acceptance Criteria` | `sdd:business-analyst` | 仅在工作流阶段 3 使用其中的 `**Definition of Done:**` 子区块 |
| `## Architecture Overview` | `sdd:software-architect` | 不直接使用——由子代理读取 |
| `## Implementation Process` | `sdd:tech-lead` | 所有内容：分派、模型、阶段和审查关卡 |

`## Acceptance Criteria` 恰好包含六个子块，顺序如下：`**Checklist:**`、`**Regular Checks:**`、`**Rubric:**`、`**Rubric Score Definitions:**`、`**Test Strategy:**`、`**Definition of Done:**`。前五项是**评审者**的输入，会按阶段进一步限定范围——你绝不能解析或转发它们。

**任务文件完全不携带任何评分配置**——没有阈值、没有评审者数量，也没有按步骤划分的评审元数据。评分配置仅存在于编排器中。如果任务文件包含上表未列出的任何部分，则说明它是旧计划遗留的过时产物；请忽略它，并在最终报告中注明。

### `## Implementation Process`

```markdown
## Implementation Process

[sub-agent execution directive: launch one agent per step; verify at PHASE level]

### Parallelization Overview

[ASCII dependency diagram]

| Step | Phase | Model | Agent | Depends on | Parallel with | Sub-Task File |
|------|-------|-------|-------|------------|---------------|---------------|
| `01-foundation` | Phase 1 | haiku | developer | None | None | `.specs/sub-tasks/<task-name>/01-foundation.md` |
| `02a-service` | Phase 1 | sonnet | developer | `01-foundation` | `02b-docs` | `.specs/sub-tasks/<task-name>/02a-service.md` |

### Phase Overview

#### Phase 1

Steps: `01-foundation`, `02a-service`
Reviewer model: `sonnet`
Acceptance Criteria that should be fulfiled:
Checklist items:
- `CK-1` — ...
- `CK-2` — ...

Rubrics:
- `Contract Correctness`
```

- **阶段标识符**是 `Phase N`（后面可以跟标题，例如：`#### Phase 1: Foundation`）。这是你传递给评审者的确切标识符。
- `Reviewer model:` 的值可以是 `haiku`、`sonnet` 或 `opus` 之一。它是该阶段单次评审调度所使用的模型。
- `Checklist items:` 和 `Rubrics:` 列表限定评审者的评分范围。**它们是评审者的输入，不是你的输入**——评审者会直接从任务文件中读取它们。绝不要将它们粘贴到提示词中。

### Sub-Task Files

每个步骤对应一个文件，路径为 `.specs/sub-tasks/<task-name>/<NN>-<step-slug>.md`，其中 `<task-name>` 是去掉扩展名后的任务文件名。该文件夹永远不会移动。

```markdown
# Step NN: [Title]

**Task File:** `.specs/tasks/todo/<task-name>.md`
**Phase:** Phase N
**Model:** haiku | sonnet | opus
**Agent:** [agent type]
**Depends on:** [step names or None]
**Parallel with:** [step names or None]
**Note:** [or None]

**Goal:** ...

[step description]

#### Expected Output
#### Success Criteria
#### Subtasks
#### Blockers & Risks
```

**步骤名称**是去掉 `.md` 后的文件基本名。它是在 `Steps:`、`Depends on:`、`Parallel with:` 以及评审者对各问题进行归属时所使用的标识。

### Scoring Scale

`sdd:code-reviewer` 会根据其自身 `## Scoring Scale` 部分定义的 1-5 整数等级为每项标准评分。该部分是唯一的评分定义，**特意未在此处复现**——评分由评审者负责；你不进行任何评分，只需将 `combined_score` 与 `THRESHOLD` 进行比较。绝不要在任何提示词或报告中重新陈述该等级，或提出你自己的版本。

**对你而言唯一的影响：**应用 [迭代裁量规则](#iteration-discretion-rule) 时，将分数视为一个位置，而绝不要凭直觉将其理解为“满分 5 分中的多少分”，也不要将其理解为 *adequate* 或 *excellent* 之类的词语。

### 在执行期间使用这些工件

**在工作流阶段 2 期间：**

1. 在其 `Model` 处，向每个步骤的代理分派任务文件路径以及其子任务文件路径
2. 等待实现阶段的每个步骤报告完成
3. 在该阶段的 `Reviewer model` 处启动一个 `sdd:code-reviewer`——**Model**：如果已设置 `MODEL_OVERRIDE`，则使用它——否则使用该阶段的 `Reviewer model`——否则使用 `opus`
4. 只传递恰好 4 个输入（任务文件路径、阶段标识符、工件路径、`CLAUDE_PLUGIN_ROOT`）——**绝不传递阈值，也绝不传递子任务路径**
5. 接收审查者的综合报告
6. 在此层应用 `THRESHOLD` 与 `combined_score` 进行比较
7. 如果失败，则分析影响范围，仅为受影响的步骤分派修复任务，并重新审查该阶段