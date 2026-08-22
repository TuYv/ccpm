---
name: implement-task
description: Implement a task with automated LLM-as-Judge verification per step
argument-hint: Task file [options] (e.g., "add-validation.feature.md --continue --human-in-the-loop")
---
# 实现任务并进行验证

你的工作是根据任务规范并使用子代理，以最高质量实现解决方案。在确有必要或任务完成之前，你绝不能停止！除非确有必要，否则不要提问！先启动开发者代理，然后启动 `sdd:code-reviewer`，持续迭代直至问题全部修复，再进入下一步！

执行任务实现步骤，并使用 `sdd:code-reviewer` 代理对关键产物进行自动化质量验证。

## 用户输入

```text
$ARGUMENTS
```

---

## 命令参数

从 `$ARGUMENTS` 中解析以下参数：

### 参数定义

| 参数 | 格式 | 默认值 | 描述 |
|----------|--------|---------|-------------|
| `task-file` | 路径或文件名 | 自动检测 | 任务文件名或路径（例如 `add-validation.feature.md`） |
| `--continue` | `--continue` | 无 | 从上次完成的步骤继续实现。首先启动 `sdd:code-reviewer` 验证当前状态，然后与开发者代理进行迭代。 |
| `--refine` | `--refine` | `false` | 增量优化模式——检测相对于 git 的变更，仅重新实现受影响的步骤（从修改过的步骤开始）。 |
| `--human-in-the-loop` | `--human-in-the-loop [step1,step2,...]` | 无 | 指定完成哪些步骤后暂停，等待人工验证。如果未指定步骤，则在每个步骤后暂停。 |
| `--target-quality` | `--target-quality X.X` 或 `--target-quality X.X,Y.Y` | `4.0`（标准）/ `4.5`（关键） | 目标阈值（满分 5.0）。单个值同时设置两类阈值。两个以逗号分隔的值分别设置标准阈值和关键阈值。 |
| `--max-iterations` | `--max-iterations N` | `3` | 每个步骤最多进行的修复→验证循环次数。默认迭代 3 次。设置为 `unlimited` 可取消限制。 |
| `--skip-reviews` | `--skip-reviews` | `false` | 跳过所有逐步骤的代码审查器检查——各步骤不经过质量门禁即可继续。 |
| `--lenient-threshold` | `--lenient-threshold X.X` | `3.5` | 宽松阈值（满分 5.0），用于由质量保证工程师明确标记为宽松验证级别的步骤。 |

### 配置解析

解析 `$ARGUMENTS` 并按如下方式解析配置：

```
# Extract task file (first positional argument, optional - auto-detect if not provided)
TASK_FILE = first argument that is a file path or filename

# Parse --target-quality (supports single value or two comma-separated values)
if --target-quality has single value X.X:
    THRESHOLD_FOR_STANDARD_COMPONENTS = X.X
    THRESHOLD_FOR_CRITICAL_COMPONENTS = X.X
elif --target-quality has two values X.X,Y.Y:
    THRESHOLD_FOR_STANDARD_COMPONENTS = X.X
    THRESHOLD_FOR_CRITICAL_COMPONENTS = Y.Y
else:
    THRESHOLD_FOR_STANDARD_COMPONENTS = 4.0  # default
    THRESHOLD_FOR_CRITICAL_COMPONENTS = 4.5  # default

# Initialize other defaults
MAX_ITERATIONS = --max-iterations || 3  # default is 3 iterations
HUMAN_IN_THE_LOOP_STEPS = --human-in-the-loop || [] (empty = none, "*" = all)
SKIP_REVIEWS = --skip-reviews || false
LENIENT_THRESHOLD = --lenient-threshold || 3.5
REFINE_MODE = --refine || false
CONTINUE_MODE = --continue || false

# Special handling for --human-in-the-loop without step list
if --human-in-the-loop present without step numbers:
    HUMAN_IN_THE_LOOP_STEPS = "*" (all steps)
```

### `--continue` 的上下文解析

使用 `--continue` 时：

1. **步骤解析：**
   - 解析任务文件中步骤标题上的 `[DONE]` 标记
   - 确定最后一个未完成的步骤
   - 启动 `sdd:code-reviewer` 智能体，验证最后一个 INCOMPLETE 步骤的产物（使用任务文件中该步骤内嵌的 `#### Verification` 规范）
   - 如果 `combined_score >= threshold`（或 `>= 3.0` 且仅存在低优先级问题）：将步骤标记为已完成，并从下一步骤恢复执行
   - 否则：将审查者指出的问题作为反馈，重新实现该步骤并反复迭代，直至 PASS

2. **状态恢复：**
   - 检查任务文件所在位置（`in-progress/`、`todo/`、`done/`）
   - 如果位于 `todo/`，则在继续之前将其移至 `in-progress/`
   - 从现有产物中预填充已捕获的值

### 优化模式行为（`--refine`）

使用 `--refine` 时，它会检测**项目文件**（而非任务文件）的更改，并将其映射到实现步骤，以确定哪些内容需要重新验证。

1. **检测已更改的项目文件：**

   首先，根据 git 状态确定比较基准：

   ```bash
   # Check for staged changes
   STAGED=$(git diff --cached --name-only)
   
   # Check for unstaged changes
   UNSTAGED=$(git diff --name-only)
   ```

   **比较逻辑：**

   | 已暂存 | 未暂存 | 比较基准 | 命令 |
   |--------|----------|-----------------|---------|
   | 是 | 是 | 暂存区（仅未暂存更改） | `git diff --name-only` |
   | 是 | 否 | 上一次提交 | `git diff HEAD --name-only` |
   | 否 | 是 | 上一次提交 | `git diff HEAD --name-only` |
   | 否 | 否 | 无更改 | 显示消息后退出 |

   - 如果**既有已暂存更改，也有未暂存更改**：比较工作目录与暂存区（仅比较未暂存更改）
   - 如果**只有已暂存更改或只有未暂存更改**：与上一次提交进行比较
   - 这可确保优化操作针对最近正在进行的工作

2. **将更改映射到实现步骤：**
   - 读取任务文件以获取实现步骤列表
   - 对于每个已更改的文件，确定由哪个步骤创建或修改：
     - 检查步骤的“预期输出”部分中是否包含该文件路径
     - 检查步骤的子任务中是否引用了该文件
     - 检查步骤的 `#### Verification` 部分中的产物
   - 构建映射：`{changed_file → step_number}`

3. **确定受影响的步骤：**
   - 找出所有关联了已更改文件的步骤
   - **最早受影响的步骤**即为起点
   - 从该步骤开始的所有后续步骤都需要重新验证
   - 更早的步骤（未受影响）保持不变

4. **优化执行：**
   - 按顺序处理每个受影响的步骤：
     - 启动 **`sdd:code-reviewer` 智能体**来验证该步骤的产物（包括用户的更改），并传入 5 个标准输入
     - 如果 `combined_score >= threshold`（或 `>= 3.0` 且仅存在低优先级问题）：将步骤标记为已完成，然后继续下一步骤
     - 否则：启动开发者智能体，将用户的更改和审查者指出的问题一并作为反馈，然后重新验证
   - 保留用户的手动修复——开发者智能体应在这些修复的基础上继续工作，而不是将其覆盖

5. **示例：**

   ```bash
   # User manually fixed src/validation/validation.service.ts
   # (This file was created in Step 2)
   
   /implement my-task.feature.md --refine
   
   # Detects: src/validation/validation.service.ts modified
   # Maps to: Step 2 (Create ValidationService)
   # Action: Launch sdd:code-reviewer for Step 2
   #   - If PASS: User's fix is good, proceed to Step 3
   #   - If FAIL: Developer agent aligns rest of the code with user changes (using reviewer's issues feedback) without overwriting user's changes
   # Continues: Step 3, Step 4... (re-verify all subsequent steps)
   ```

6. **多个文件发生更改：**

   ```bash
   # User edited files from Step 2 AND Step 4
   
   /implement my-task.feature.md --refine
   
   # Detects: Files from Step 2 and Step 4 modified
   # Earliest affected: Step 2
   # Re-verifies: Step 2, Step 3, Step 4, Step 5...
   # (Step 3 re-verified even though no direct changes, because it depends on Step 2)
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
   # Staged changes are preserved, not re-verified
   
   # --
   
   # Scenario: User only has staged changes (ready to commit)
   # Staged: src/validation/validation.service.ts
   # Unstaged: none
   
   /implement my-task.feature.md --refine
   
   # Detects: Only staged changes
   # Mode: Compares against last commit
   # validation.service.ts changes are verified
   ```

### 人机协同工作流行为

人工验证检查点会在以下情况下触发：

1. **触发条件：**
   - 对 `HUMAN_IN_THE_LOOP_STEPS` 中的某个步骤，开发者和 `sdd:code-reviewer` 在编排器层级给出 **PASS** 后
   - 开发者、审查者及开发者重试之后（下一次审查者重试之前）
   - 如果 `HUMAN_IN_THE_LOOP_STEPS` 为 `"*"`，则在每个步骤之后触发

2. **检查点操作：**
   - 显示当前步骤的结果摘要
   - 显示生成的产物及其路径
   - 显示审查者的 `combined_score` 和汇总后的问题
   - 询问用户：“审查步骤输出。是否继续？[Y/n/反馈]”
   - 如果用户提供反馈，则将其纳入下一次迭代或下一步骤
   - 如果用户回答“n”，则暂停工作流

3. **检查点消息格式：**

   ```markdown
   ---
   ## 🔍 Human Review Checkpoint - Step X

   **Step:** {step title}
   **Verification Level:** {None / Single Judge / Panel of 2 Judges / Per-Item Judges}
   **Combined Score:** {combined_score}/5.0 (threshold: {threshold})
   **Status:** ✅ PASS / 🔄 ITERATING (attempt {n})

   **Artifacts Created/Modified:**
   - {artifact_path_1}
   - {artifact_path_2}

   **Reviewer Feedback (top issues):**
   {feedback summary — High/Medium issues from reviewer.issues}

   **Action Required:** Review the above artifacts and provide feedback or continue.

   > Continue? [Y/n/feedback]:
   ---
   ```

---

## 任务选择和状态管理

### 任务状态文件夹

任务状态通过文件夹位置进行管理：

- `.specs/tasks/todo/` - 等待实施的任务
- `.specs/tasks/in-progress/` - 当前正在处理的任务
- `.specs/tasks/done/` - 已完成的任务

### 状态转换

| 时机 | 操作 |
|------|--------|
| 开始实施 | 将任务从 `todo/` 移动到 `in-progress/` |
| 最终验证通过 | 将任务从 `in-progress/` 移动到 `done/` |
| 实施失败（用户中止） | 保留在 `in-progress/` 中 |

---

## 关键：你只是一名编排器

**你的职责是分派和聚合。你不亲自执行工作。**

为子智能体正确构建上下文！

关键：对于每个子智能体（实施和评估），你都需要提供：

- 任务文件路径
- 步骤编号
- 条目编号（如适用）
- 产物路径（如适用）
- **`${CLAUDE_PLUGIN_ROOT}` 的值，以便智能体能够解析 `@${CLAUDE_PLUGIN_ROOT}/scripts/create-scratchpad.sh` 之类的路径**

### 你要做的事情

- 仅阅读一次任务文件（仅限阶段 1）
- 通过 Task 工具启动子智能体
- 接收子智能体的报告
- 根据审查者输出应用编排器层级的通过规则后，将阶段标记为完成
- 聚合结果并向用户报告

### 你绝对不能做的事情

| 禁止的操作 | 原因 | 替代做法 |
|-------------------|-----|-------------------|
| 阅读实施输出 | 上下文膨胀 → 命令丢失 | 由子智能体报告其创建的内容 |
| 阅读参考文件 | 理解模式是子智能体的职责 | 在子智能体提示词中包含路径 |
| 阅读产物来“检查”它们 | 上下文膨胀 → 遗忘验证 | 启动 `sdd:code-reviewer` 智能体 |
| 自行评估代码质量 | 这不是你的职责，并会导致遗忘 | 启动 `sdd:code-reviewer` 智能体 |
| 因为“很简单”而跳过验证 | 所有非 `None` 的验证都是强制性的 | 无论如何都要启动 `sdd:code-reviewer` 智能体 |

### 反合理化规则

**如果你在想：**“我应该阅读这个文件，以了解创建了什么”
**→ 停止。** 子智能体的报告会告诉你创建了什么。使用这些信息。

**如果你在想：**“我快速验证一下它看起来是否正确”
**→ 停止。** 启动一个 `sdd:code-reviewer` 智能体。那不是你的职责。

**如果你在想：**“这太简单了，不需要验证”
**→ 停止。** 如果任务指定了验证（Level 不是 `None`），就启动 `sdd:code-reviewer`。没有例外。

**如果你在想：**“我需要阅读参考文件，才能写出好的提示词”
**→ 停止。** 将参考文件的路径放入子智能体提示词中。由子智能体读取它。

### 为什么这很重要

编排器自行读取文件 = 上下文溢出 = 命令丢失 = 遗忘步骤。每次都会如此。

编排器进行“快速验证” = 跳过 `sdd:code-reviewer` 智能体 = 质量崩溃 = 产物失败。

**你的上下文窗口非常宝贵。保护好它。将一切都委派出去。**

---

## 关键

### 配置规则

- 对标准步骤使用 `THRESHOLD_FOR_STANDARD_COMPONENTS`（默认值为 4.0）！
- 对任务文件中标记为关键的步骤使用 `THRESHOLD_FOR_CRITICAL_COMPONENTS`（默认值为 4.5）。
- 仅当步骤的验证规范明确将其标记为宽松时，才使用 `LENIENT_THRESHOLD`（默认值为 3.5）。
- 阈值由当前编排器层级应用于代码审查者返回的 `combined_score`。**绝不要将任何阈值传递给代码审查者智能体——否则它会试图达到目标分数，从而导致评估变得主观。**
- 如果 `combined_score >= threshold`，或者（`combined_score >= 3.0` 且代码审查者报告中的每个问题的优先级均为 `Low`），则该步骤通过。
- **默认迭代 3 次**——在 3 次修复→验证循环后停止，并继续执行下一步骤（同时发出警告）！
- 如果 `MAX_ITERATIONS` 设置为 `unlimited`：持续迭代，直到达到质量阈值（无次数限制）
- 仅在 `HUMAN_IN_THE_LOOP_STEPS` 中的步骤之后触发人在回路检查点（如果设置为 `"*"`，则在所有步骤之后触发）！
- **如果 `SKIP_REVIEWS` 为 true：跳过所有代码审查者分派——每次实施完成后直接继续执行下一步骤！**
- **如果 `CONTINUE_MODE` 为 true：跳转到 `RESUME_FROM_STEP`——不要重新实施已完成的步骤！**
- **如果 `REFINE_MODE` 为 true：检测发生更改的项目文件，将其映射到对应步骤，并从 `REFINE_FROM_STEP` 开始重新验证——保留用户的修复！**

### 执行与评估规则

- **仅使用前台智能体**：不要使用后台智能体。尽可能并行启动智能体。后台智能体经常遇到权限问题和其他错误。

如果出现以下情况，请重新启动 code-reviewer，直到获得有效结果：

- 拒绝冗长报告：如果 code-reviewer 没有按要求使用 scratchpad，而是返回了一份非常长的报告，请拒绝该结果。这表明智能体未能遵循“使用 scratchpad”的指令。
- `combined_score` 为 5.0 是幻觉：如果 code-reviewer 返回的 `combined_score` 为 5.0/5.0，请将其视为幻觉或敷衍的评估。拒绝该结果并重新运行智能体。在这一严格框架下，满分几乎是不可能的。
- 拒绝缺少评分的报告：如果 code-reviewer 的报告缺少 `combined_score`（或任何子评分：`spec_compliance_score`、`builtin_score`），请拒绝该结果。这表明智能体未能遵循评分细则的指令。
- 拒绝报告中的 PASS/FAIL 判定：如果 code-reviewer 的输出包含 PASS/FAIL 判定或提及阈值，请拒绝该结果。该决定由编排器负责；智能体不得知晓阈值。

---

## 概述

此命令通过以下机制编排多步骤任务实现：

1. **顺序执行**，遵循步骤依赖关系
2. 在依赖关系允许时进行**并行执行**
3. 每个步骤使用 `sdd:code-reviewer` 智能体进行**自动验证**
4. 对高风险产物使用**大语言模型评审组（PoLL）**
5. 通过**聚合投票**缓解位置偏差
6. 进行**阶段跟踪**，并在每次编排器层级判定为 PASS 后确认

---

## 完整工作流概述

```
Phase 0: Select Task & Move to In-Progress
    │
    ├─── Use provided task file name or auto-select from todo/ (if only 1 task)
    ├─── Move task: todo/ → in-progress/
    │
    ▼
Phase 1: Load Task
    │
    ▼
Phase 2: Execute Steps
    │
    ├─── For each step in dependency order:
    │    │
    │    ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ Launch sdd:developer agent                      │
    │    │ (implementation)                                │
    │    └─────────────────┬───────────────────────────────┘
    │                      │
    │                      ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ Launch sdd:code-reviewer agent(s)               │
    │    │ Count depends on Verification Level:            │
    │    │  None → 0 reviewers (skip)                      │
    │    │  Single Judge → 1 reviewer                      │
    │    │  Panel of 2 Judges → 2 reviewers (median vote)  │
    │    │  Per-Item → 1 reviewer per item                 │
    │    └─────────────────┬───────────────────────────────┘
    │                      │
    │                      ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ Orchestrator reads combined_score and applies   │
    │    │ threshold:                                      │
    │    │  PASS → Mark step complete in task file         │
    │    │  FAIL → Fix using reviewer's issues feedback    │
    │    │         and re-verify (max MAX_ITERATIONS)      │
    │    └─────────────────────────────────────────────────┘
    │
    ▼
Phase 3: Definition of Done Verification
    │
    ├─── Verify all Definition of Done items
    │    │
    │    ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ Launch sdd:core-reviewer agent                   │
    │    │ (verify all DoD items)                          │
    │    └─────────────────┬───────────────────────────────┘
    │                      │
    │                      ▼
    │    ┌─────────────────────────────────────────────────┐
    │    │ All DoD PASS? → Proceed to Phase 4              │
    │    │ Any FAIL? → Fix and re-verify (iterate)         │
    │    └─────────────────────────────────────────────────┘
    │
    ▼
Phase 4: Move Task to Done
    │
    ├─── Move task: in-progress/ → done/
    │
    ▼
Phase 5: Final Report
```

---

## 阶段 0：解析用户输入并选择任务

解析用户输入以获取任务文件路径和参数。

### 步骤 0.1：解析任务文件

**如果 `$ARGUMENTS` 为空或仅包含标志：**

1. **首先检查进行中任务文件夹：**

   ```bash
   ls .specs/tasks/in-progress/*.md 2>/dev/null
   ```

   - 如果恰好有 1 个文件 → 将 `$TASK_FILE` 设置为该文件，将 `$TASK_FOLDER` 设置为 `in-progress`
   - 如果有多个文件 → 列出这些文件并询问用户：“有多个任务正在进行中。要继续哪一个？”
   - 如果没有文件 → 继续执行步骤 2

2. **检查待办任务文件夹：**

   ```bash
   ls .specs/tasks/todo/*.md 2>/dev/null
   ```

   - 如果恰好有 1 个文件 → 将 `$TASK_FILE` 设置为该文件，将 `$TASK_FOLDER` 设置为 `todo`
   - 如果有多个文件 → 列出这些文件并询问用户：“待办列表中有多个任务。要实现哪一个？”
   - 如果没有文件 → 报告“没有可用任务。请先使用 /add-task 创建一个。”并停止

**如果 `$ARGUMENTS` 包含任务文件名：**

1. 按以下顺序搜索文件：`in-progress/` → `todo/` → `done/`
2. 相应地设置 `$TASK_FILE` 和 `$TASK_FOLDER`
3. 如果未找到，则报告错误并停止

### 步骤 0.2：移至进行中状态（如果需要）

**如果任务位于 `todo/` 文件夹中：**

```bash
git mv .specs/tasks/todo/$TASK_FILE .specs/tasks/in-progress/
# Fallback if git not available: mv .specs/tasks/todo/$TASK_FILE .specs/tasks/in-progress/
```

将 `$TASK_PATH` 更新为 `.specs/tasks/in-progress/$TASK_FILE`

**如果任务已位于 `in-progress/` 中：**
将 `$TASK_PATH` 设置为 `.specs/tasks/in-progress/$TASK_FILE`

### 步骤 0.3：解析标志并初始化配置

解析 `$ARGUMENTS` 中的所有标志并初始化配置。
**显示解析后的配置：**

```markdown
### Configuration

| Setting | Value |
|---------|-------|
| **Task File** | {TASK_PATH} |
| **Standard Components Threshold** | {THRESHOLD_FOR_STANDARD_COMPONENTS}/5.0 |
| **Critical Components Threshold** | {THRESHOLD_FOR_CRITICAL_COMPONENTS}/5.0 |
| **Lenient Components Threshold** | {LENIENT_THRESHOLD}/5.0 |
| **Max Iterations** | {MAX_ITERATIONS or "3"} |
| **Human Checkpoints** | {HUMAN_IN_THE_LOOP_STEPS as comma-separated or "All steps" or "None"} |
| **Skip Reviews** | {SKIP_REVIEWS} |
| **Continue Mode** | {CONTINUE_MODE} |
| **Refine Mode** | {REFINE_MODE} |
```

### 步骤 0.4：处理继续模式

**如果 `CONTINUE_MODE` 为 true：**

1. **确定最后完成的步骤：**
   - 解析任务文件中步骤标题上的 `[DONE]` 标记
   - 找出标记为 `[DONE]` 的最大步骤编号
   - 将 `LAST_COMPLETED_STEP` 设置为该编号（如果没有，则设置为 0）

2. **验证最后完成的步骤（如果有）：**
   - 如果 `LAST_COMPLETED_STEP > 0`：
     - 启动 `sdd:code-reviewer` 代理来验证该步骤的产物（传入阶段 2 中记录的 5 个输入）
     - 如果审查器的 `combined_score >= threshold`（或仅存在低优先级问题且 `>= 3.0`）：设置 `RESUME_FROM_STEP = LAST_COMPLETED_STEP + 1`
     - 否则：设置 `RESUME_FROM_STEP = LAST_COMPLETED_STEP`（使用审查器反馈重新实现）

3. **跳转到恢复点：**
   - 在阶段 2 中，跳过 `RESUME_FROM_STEP` 之前的所有步骤
   - 从 `RESUME_FROM_STEP` 继续执行

### 步骤 0.5：处理优化模式

**如果 `REFINE_MODE` 为 true：**

1. **检测已更改的项目文件：**

   ```bash
   # Check for staged and unstaged changes
   STAGED=$(git diff --cached --name-only)
   UNSTAGED=$(git diff --name-only)
   ```

   **确定比较模式：**

   ```
   if STAGED is not empty AND UNSTAGED is not empty:
       # Both staged and unstaged - use unstaged only
       CHANGED_FILES = git diff --name-only  # working dir vs staging
       COMPARISON_MODE = "unstaged_only"
   elif STAGED is not empty OR UNSTAGED is not empty:
       # Only one type - compare against last commit
       CHANGED_FILES = git diff HEAD --name-only
       COMPARISON_MODE = "vs_last_commit"
   else:
       # No changes
       Report: "No project changes detected. Make edits first, then run --refine."
       Exit
   ```

2. **加载任务文件并提取步骤→文件映射：**
   - 读取任务文件以获取实现步骤
   - 对于每个步骤，从以下位置提取该步骤创建/修改的文件：
     - “预期输出”部分
     - 提及文件路径的子任务描述
     - `#### Verification` 构件路径
   - 构建映射：`STEP_FILE_MAP = {step_number → [file_paths]}`

3. **将已更改的文件映射到步骤：**

   ```
   AFFECTED_STEPS = []
   for each changed_file:
       for step_number, file_list in STEP_FILE_MAP:
           if changed_file matches any path in file_list:
               AFFECTED_STEPS.append(step_number)
   ```

   - 如果没有匹配到任何步骤：“已更改的文件未映射到任何实现步骤。请手动验证。”

4. **确定优化范围：**
   - `REFINE_FROM_STEP` = min(AFFECTED_STEPS)  # 最早受影响的步骤
   - 从 `REFINE_FROM_STEP` 开始的所有步骤都需要重新验证
   - `REFINE_FROM_STEP` 之前的步骤保持原样

5. **存储已更改文件的上下文：**
   - `CHANGED_FILES` = 已更改文件路径的列表
   - `USER_CHANGES_CONTEXT` = 受影响文件的 git diff 输出
   - 将此上下文传递给代码审查代理和开发代理
   - 代理应基于用户的修复继续工作，而不是将其覆盖

## 阶段 1：加载并分析任务

**这是唯一允许读取文件的阶段。**

### 步骤 1.1：加载任务详情

读取任务文件一次：

```bash
Read $TASK_PATH
```

**完成此次读取后，在后续整个执行过程中不得再读取任何其他文件。**

### 步骤 1.2：识别实现步骤

解析 `## Implementation Process` 部分：

- 列出所有步骤及其依赖关系
- 识别哪些步骤带有 `Parallel with:` 注解
- 根据 `#### Verification` 部分对每个步骤的验证需求进行分类：

| 验证级别 | 代码审查代理调度 | 阈值 |
|-----------------------------------|-------------|------------------------|-----------|
| `None` | 完全跳过代码审查代理 | 不适用 |
| `Single Judge` | 1 个 `sdd:code-reviewer` 代理 | `THRESHOLD_FOR_STANDARD_COMPONENTS`（默认值 4.0） |
| `Panel of 2 Judges`（又称 `Panel of 2`） | 并行运行 2 个 `sdd:code-reviewer` 代理；通过对 `combined_score` 进行中位数投票来汇总 | `THRESHOLD_FOR_CRITICAL_COMPONENTS`（默认值 4.5） |
| `Per-Item Judges`（又称 `Per-Item`） | 每个项目使用 1 个 `sdd:code-reviewer`，全部并行运行 | 每个项目的阈值与步骤标记的级别一致（标准或关键） |

严格遵循任务文件中显示的标签——`Single Judge`、`Panel of 2 Judges`、`Per-Item Judges`、`None`——这些是 qa-engineer 模板生成的标签。

### 步骤 1.3：创建待办事项列表

使用所有实施步骤创建 TodoWrite，并标明验证要求：

```json
{
  "todos": [
    {"content": "Step 1: [Title] - [Verification Level]", "status": "pending", "activeForm": "Implementing Step 1"},
    {"content": "Step 2: [Title] - [Verification Level]", "status": "pending", "activeForm": "Implementing Step 2"}
  ]
}
```

---

## 阶段 2：执行实施步骤

按照依赖顺序处理每个步骤，通过读取步骤的 `#### Verification` 级别来选择分派模式：

| 验证级别 | 模式 |
|--------------------|---------|
| `None` | **模式 A** — 仅 developer，不使用 code-reviewer |
| `Single Judge` | **模式 B** — developer + 1 个 `sdd:code-reviewer` |
| `Panel of 2 Judges` | **模式 B-Panel** — developer + 2 个并行运行的 `sdd:code-reviewer` agent（取中位数投票） |
| `Per-Item Judges` | **模式 C** — 每个项目配备 1 个 developer + 1 个 `sdd:code-reviewer`，全部并行运行 |


### Code-Reviewer 输入契约（不可协商）

每次分派 `sdd:code-reviewer`——无论采用哪种模式——都必须且只能包含以下 5 项输入，不得包含任何其他类似阈值或通过/失败预期的内容：

1. **产物路径**：developer 报告的、在此步骤（或模式 C 中的项目）中创建或修改的文件路径
2. **步骤编号**：要审查的步骤编号
3. **规范路径**：规范文件的路径。
4. **CLAUDE_PLUGIN_ROOT**：插件根路径

**绝对不得向 code-reviewer 传递：**

- 任何分数阈值、目标质量或及格线数值
- 任何通过/失败预期
- 任何由你自行编写的评分标准或检查清单（只有 qa-engineer 的逐步骤规范才具有权威性）
- 任务描述和验收标准，agent 应自行读取任务文件

### 阈值应用（仅限 Orchestrator 层级）

收到 code-reviewer 的报告后，orchestrator（本 skill）应用阈值：

```
threshold = THRESHOLD_FOR_CRITICAL_COMPONENTS  if Verification Level is "Panel of 2 Judges"
          = THRESHOLD_FOR_STANDARD_COMPONENTS  if Verification Level is "Single Judge" or "Per-Item Judges"
          = LENIENT_THRESHOLD                  if the verification spec explicitly marks the step as lenient

# For Panel of 2: aggregate first
combined_score = median(reviewer1.combined_score, reviewer2.combined_score)
                  # for Single Judge / Per-Item: combined_score = reviewer.combined_score

all_issues = reviewer.issues  (or merged issues from both reviewers in Panel)

# PASS rule (orchestrator decides):
if combined_score >= threshold:
    PASS
elif combined_score >= 3.0 and every issue.priority == "Low":
    PASS  (acceptable: minor polish only, no high/medium issues)
else:
    FAIL → retry
```

`combined_score` 已包含 spec_compliance + code_quality + Muda 浪费分析（reviewer 会按照其 STAGE 8 在内部聚合这些指标）。orchestrator 无需重新聚合各项子分数；门禁决策只需考虑 `combined_score` 和 `issues`。

### 重试反馈构造

当某个步骤未达到编排器级阈值，且尚未用尽 `MAX_ITERATIONS` 时，使用以下反馈结构再次派遣开发者：

```
Re-implement Step [N]: [Step Title] — Iteration [K] of [MAX_ITERATIONS]

Task File: $TASK_PATH
Step Number: [N]

Previous attempt failed quality review. Reviewer combined_score: [X.XX] / threshold [Y.Y]

Issues to fix:
[paste reviewer.issues list verbatim, including source field, priority, description, evidence (file:line), impact, and suggestion]

Full reviewer report (for additional context, do NOT skim — use issues list as primary work list):
[path to reviewer's scratchpad report file under .specs/scratchpad/<hex>.md]

Your task:
- Address every High priority issue
- Address every Medium priority issue
- Do NOT introduce new functionality beyond the original step's Expected Output
- Re-run tests/lint/build to ensure no regressions

When complete, report:
1. Files changed (paths)
2. Per-issue resolution status (Fixed / Partially Fixed / Skipped with justification)
3. Any new concerns introduced by the fix
```

开发者完成重试后，使用相同的 4 项输入再次派遣代码审查者（规范并未发生变化）。持续迭代，直到通过或达到 `MAX_ITERATIONS`。

### 模式 A：简单步骤（无需验证）

**1. 启动开发者代理：**

使用 Task 工具，并提供：

- **代理类型**：`sdd:developer`
- **模型**：步骤中指定的模型，默认使用 `opus`
- **描述**："Implement Step [N]: [Title]"
- **提示词**：

```
Implement Step [N]: [Step Title]

Task File: $TASK_PATH
Step Number: [N]

Your task:
- Execute ONLY Step [N]: [Step Title]
- Do NOT execute any other steps
- Follow the Expected Output and Success Criteria exactly

When complete, report:
1. What files were created/modified (paths)
2. Confirmation that success criteria are met
3. Any issues encountered
```

**2. 使用代理的报告（无需验证）**

- 代理报告创建了哪些内容 → 使用这些信息
- **不要亲自读取所创建的文件**
- 此模式不包含验证（简单操作）

**3. 将步骤标记为完成**

- 更新任务文件：
  - 使用 `[DONE]` 标记步骤标题（例如 `### Step 1: Setup [DONE]`）
  - 使用 `[X]` 将步骤的子任务标记为完成
- 将待办事项更新为 `completed`

---

### 模式 B：关键步骤（单个审查者或 2 人评审组）

此模式适用于验证级别为 `Single Judge`（1 名审查者）或 `Panel of 2 Judges`（2 名审查者并行）的步骤。

**1. 启动开发者代理：**

使用 Task 工具，并提供：

- **代理类型**：`sdd:developer`
- **模型**：步骤中指定的模型，默认使用 `opus`
- **描述**："Implement Step [N]: [Title]"
- **提示词**：

```
Implement Step [N]: [Step Title]

Task File: $TASK_PATH
Step Number: [N]

Your task:
- Execute ONLY Step [N]: [Step Title]
- Do NOT execute any other steps
- Follow the Expected Output and Success Criteria exactly

When complete, report:
1. What files were created/modified (paths)
2. Confirmation of completion
3. Self-critique summary
```

**2. 等待完成**

- 接收代理的报告
- 记录报告中的产物路径
- **不要自行读取产物**

**3. 并行启动代码审查代理（强制）：**

**⚠️ 强制要求：你必须启动审查代理。不得跳过。不得自行验证。**

- 对于 `Single Judge`：启动 **1** 个 `sdd:code-reviewer` 代理。
- 对于 `Panel of 2 Judges`：使用相同的提示词并行启动 **2** 个 `sdd:code-reviewer` 代理。

**审查者 1 和 2**（使用相同的提示词结构并行启动两者）：

```
CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

Apply your full evaluation process (Stages 0-11) and return a single combined report.

Inputs:

1. Artifact Path(s):
   [list of file paths from the developer's report]

2. Step number:
   [the step number to review]

3. Specification Path:
   [path to the specification file]

5. CLAUDE_PLUGIN_ROOT: ${CLAUDE_PLUGIN_ROOT}
```

**5. 汇总审查结果（编排器端）：**

- 对于 `Single Judge`：
  - `combined_score = reviewer.combined_score`
  - `all_issues = reviewer.issues`
- 对于 `Panel of 2 Judges`：
  - `combined_score = median(reviewer1.combined_score, reviewer2.combined_score)`
  - `all_issues = reviewer1.issues + reviewer2.issues`（按描述和证据去重）
  - 标记 `|reviewer1.score − reviewer2.score| > 2.0` 的高方差标准（按照阶段 5 中的专家组投票算法）

**6. 确定阈值并应用门禁：**

- 检查该步骤是否在任务文件中标记为关键步骤（位于 `#### Verification` 部分或步骤元数据中）
- 如果是关键步骤：使用 `THRESHOLD_FOR_CRITICAL_COMPONENTS`
- 如果是标准步骤：使用 `THRESHOLD_FOR_STANDARD_COMPONENTS`

- 应用编排器级别的通过规则：
  - 如果 `combined_score >= threshold`，则通过
  - 如果 `combined_score >= 3.0` 且 `all_issues` 中每个条目的 `priority == "Low"`，则通过
  - 否则失败 → 重试

**失败时：迭代直至通过（最多 `MAX_ITERATIONS` 次，默认为 3）**

- 根据上文的[重试反馈构建](#retry-feedback-construction)部分构建重试反馈
- 使用该反馈重新启动开发代理
- 开发者报告完成后，使用相同的输入重新启动代码审查代理
- **迭代直至通过**或达到 `MAX_ITERATIONS`
- 如果达到 `MAX_ITERATIONS`：
  - 记录警告："Step [N] did not pass after {MAX_ITERATIONS} iterations (final combined_score: X.XX, threshold: Y.Y)"
  - 继续执行下一步骤（不要无限期阻塞）

**7. 通过时：将步骤标记为完成**

- 更新任务文件：
  - 在步骤标题中标记 `[DONE]`（例如，`### Step 2: Create Service [DONE]`）
  - 将步骤的子任务标记为 `[X]` 已完成
- 将待办事项更新为 `completed`
- 在跟踪记录中记录 `combined_score`

**8. 人工介入检查点（如适用）：**

**仅在步骤通过后**，如果步骤编号位于 `HUMAN_IN_THE_LOOP_STEPS` 中（或 `HUMAN_IN_THE_LOOP_STEPS == "*"`）：

```markdown
---
## 🔍 Human Review Checkpoint - Step [N]

**Step:** [Step Title]
**Combined Score:** [combined_score]/5.0 (threshold: [threshold])
**Status:** ✅ PASS

**Artifacts Created/Modified:**
- [artifact_path_1]
- [artifact_path_2]

**Reviewer Feedback (issues):**
[feedback summary — high/medium issues from reviewer.issues, even though step passed]

**Action Required:** Review the above artifacts and provide feedback or continue.

> Continue? [Y/n/feedback]:
---
```

- 如果用户提供反馈：保存反馈以供下一步使用，或根据反馈重新实现当前步骤
- 如果用户说“n”：暂停工作流，报告当前进度
- 如果用户说“Y”或继续操作：进入下一步

---

### 模式 C：多项目步骤（逐项评估）

对于创建多个相似项目的步骤：

**1. 并行启动开发者代理（每个项目一个）：**

对每个项目使用 Task 工具（全部并行启动）：

- **代理类型**：`sdd:developer`
- **模型**：使用指定模型，默认使用 `opus`
- **描述**：“实现步骤 [N]，项目：[Name]”
- **提示词**：

```
Implement Step [N], Item: [Item Name]

Task File: $TASK_PATH
Step Number: [N]
Item: [Item Name]

Your task:
- Create ONLY [item_name] from Step [N]
- Do NOT create other items or steps
- Follow the Expected Output and Success Criteria exactly

When complete, report:
1. File path created
2. Confirmation of completion
3. Self-critique summary
```

**2. 等待所有任务完成**

- 收集所有代理报告
- 记录所有产物路径
- **不要自行读取任何已创建的文件**

**3. 并行启动审查者代理（每个项目一个）**

**⚠️ 强制要求：必须启动代码审查者代理。不得跳过。不得自行验证。**


对于每个项目：

```
CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

Apply your full evaluation process (Stages 0-11) and return a single combined report.

Inputs:

1. Artifact Path(s):
   [list of file paths from the developer's report]

2. Step number:
   [the step number to review]

3. Specification Path:
   [path to the specification file]

5. CLAUDE_PLUGIN_ROOT: ${CLAUDE_PLUGIN_ROOT}
```

**5. 收集所有结果并逐项应用门禁：**

对于每个项目的审查者报告，应用编排器级别的阈值（遵循[阈值应用](#threshold-application-orchestrator-level-only)规则——逐项评估使用 `THRESHOLD_FOR_STANDARD_COMPONENTS`，除非规范将该步骤标记为宽松或关键）：

- 如果 `combined_score >= threshold`，或者（`combined_score >= 3.0` 且所有问题的优先级均为 Low），则通过
- 否则失败 → 该特定项目需要重试

**6. 报告汇总结果：**

- 通过的项目：X/Y
- 需要修订的项目：[列出每个失败项目的 combined_score 及最主要的 3 个问题]

**7. 如果存在任何失败项：迭代直至全部通过**

- 对每个失败项目，按照[重试反馈构建](#retry-feedback-construction)构建重试反馈
- 仅为失败项目重新启动开发者代理（如果处于优化模式，则保留用户的更改）
- 使用相同的 5 项输入，为每个重新实现的项目重新启动代码审查者
- **持续迭代，直至所有项目均通过**或达到 `MAX_ITERATIONS`
- 如果达到 `MAX_ITERATIONS`：
  - 记录警告：“步骤 [N] 中有 {X} 个项目在 {MAX_ITERATIONS} 次迭代后仍未通过”
  - 进入下一步（不要无限期阻塞）

**8. 全部通过后：将步骤标记为完成**

- 更新任务文件：
  - 在步骤标题中标记 `[DONE]`（例如，`### Step 3: Create Items [DONE]`）
  - 将步骤的子任务标记为 `[X]` 已完成
- 将待办事项更新为 `completed`
- 在跟踪记录中记录通过率和各项目的 `combined_score` 值

**9. 人工参与检查点（如适用）：**

**仅在所有项目均通过后**，如果步骤编号位于 `HUMAN_IN_THE_LOOP_STEPS` 中（或 `HUMAN_IN_THE_LOOP_STEPS == "*"`）：

```markdown
---
## 🔍 Human Review Checkpoint - Step [N]

**Step:** [Step Title]
**Items Passed:** X/Y
**Status:** ✅ ALL PASS

**Artifacts Created:**
- [item_1_path] — combined_score: X.XX
- [item_2_path] — combined_score: X.XX
- ...

**Action Required:** Review the above artifacts and provide feedback or continue.

> Continue? [Y/n/feedback]:
---
```

- 如果用户提供反馈：存储反馈以供下一步骤使用，或根据反馈重新实现项目
- 如果用户输入 "n"：暂停工作流，并报告当前进度
- 如果用户输入 "Y" 或继续：进入下一步骤

---

## ⚠️ 检查点：进入完成定义验证之前

在进入 DoD 验证之前，请确认你遵循了以下规则：

- [ ] 是否为所有实现启动了 `sdd:developer` 代理？
- [ ] 是否为所有验证级别非 `None` 的项目启动了 `sdd:code-reviewer` 代理？
- [ ] 是否亲自根据 `combined_score` 应用了阈值？
- [ ] 是否仅在满足编排器级别的通过规则后才将步骤标记为完成？
- [ ] 是否避免亲自读取任何工件文件？

**如果你读取了任务文件以外的文件，则说明你的操作有误。请停止并重新开始。**

---

## 阶段 3：完成定义验证

所有实现步骤完成后，验证任务是否满足所有完成定义标准。

### 步骤 3.1：启动完成定义验证

**使用 Task 工具，并提供：**

- **代理类型**：`sdd:developer`
- **模型**：`opus`
- **描述**："Verify Definition of Done"
- **提示词**：

```
CLAUDE_PLUGIN_ROOT=${CLAUDE_PLUGIN_ROOT}

Verify all Definition of Done items in the task file.

Task File: $TASK_PATH

Your task:
1. Read the task file and locate the "## Definition of Done (Task Level)" section
2. Go through each checkbox item one by one
3. For each item, verify if it passes by:
   - Running appropriate tests (unit tests, E2E tests)
   - Checking build/compilation status
   - Verifying file existence and correctness
   - Checking code patterns and linting
4. You MUST mark each item in task file that passed verification with `[X]`
5. Return a structured report:
- List ALL Definition of Done items
- Status for each:
   - ✅ PASS - if the item is complete and verified
   - ❌ FAIL - if the item fails verification, with specific reason why
   - ⚠️ BLOCKED - if the item cannot be verified due to a blocker
- Evidence for each status
- Specific issues for any failures
- Overall pass rate

Be thorough - check everything the task requires.
```

### 步骤 3.2：审查验证结果

- 接收完成定义验证报告
- 记录哪些 DoD 项目通过，哪些失败
- 如果验证代理报告所有 DoD 项目均通过，则必须确认任务文件末尾的所有 DoD 项目均已使用 `[X]` 标记

### 步骤 3.3：修复失败的 DoD 项目（如有）

如果任何完成定义项目失败：

**1. 为每个未通过的条目启动开发者代理：**

```
Fix Definition of Done item: [Item Description]

Task File: $TASK_PATH

Current Status:
[paste failure details from verification report]

Your task:
1. Fix the specific issue identified
2. Verify the fix resolves the problem
3. Ensure no regressions (all tests still pass)

Return:
- What was fixed
- Confirmation the item now passes
- Any related changes made
```

**2. 修复后重新验证：**

再次启动验证代理（步骤 3.1），确认所有条目现在均为 PASS。

**3. 根据需要迭代：**

重复修复 → 验证循环，直到所有完成定义条目均为 PASS。

---

## 阶段 4：将任务移至已完成

所有完成定义条目均为 PASS 后，将任务移至 done 文件夹。

### 步骤 4.1：验证完成情况

确认任务文件中的所有完成定义条目均已标记为完成。

### 步骤 4.2：移动任务

```bash
# Extract just the filename from $TASK_PATH
TASK_FILENAME=$(basename $TASK_PATH)

# Move from in-progress to done
git mv .specs/tasks/in-progress/$TASK_FILENAME .specs/tasks/done/
# Fallback if git not available: mv .specs/tasks/in-progress/$TASK_FILENAME .specs/tasks/done/
```

---

## 阶段 5：汇总与报告

### 评审组投票算法（`Panel of 2 Judges`）

并行调度 2 个 `sdd:code-reviewer` 代理时，按如下方式汇总其报告：

- 分步骤思考，分别输出每一步的结果
- 不要跳过步骤

#### 步骤 1：收集 combined_score 和各项标准得分

每位审查者都会返回一份完整报告（按照 `sdd:code-reviewer` 的阶段 11）。创建两个表格：

**顶层得分：**

| 得分 | 审查者 1 | 审查者 2 | 中位数 | 差值 |
|-------|------------|------------|--------|------------|
| `combined_score` | X.X | X.X | ? | ? |
| `spec_compliance_score`（子得分） | X.X | X.X | ? | ? |
| `builtin_score`（子得分） | X.X | X.X | ? | ? |

**各项标准得分**（来自 `spec_compliance_report.rubric_scores` 和 `code_quality_report.rubric_scores`）：

| 来源 | 标准 | 审查者 1 | 审查者 2 | 中位数 | 差值 |
|--------|-----------|------------|------------|--------|------------|
| spec_compliance | [名称 1] | X.X | X.X | ? | ? |
| code_quality | [名称 2] | X.X | X.X | ? | ? |

#### 步骤 2：计算中位数

对于 2 位审查者：**中位数 =（得分 1 + 得分 2）/ 2**

编排器的门禁使用 `median(combined_score)`，而不是对子得分进行重新汇总。每位审查者都应该已在内部完成汇总。

#### 步骤 3：检查高方差

**高方差** = 审查者之间存在显著分歧（任何得分的差值 > 2.0 分）。

公式：`|Reviewer1 - Reviewer2| > 2.0` → 标记。

#### 步骤 4：合并问题列表

拼接 `reviewer1.issues` 和 `reviewer2.issues`，然后按（描述、证据）对去重。对于重复项，保留最高优先级。这个合并后的列表将作为重试反馈传递给开发者。

#### 步骤 5：应用编排器级门禁

- `panel_combined_score = median(reviewer1.combined_score, reviewer2.combined_score)`
- 如果 `panel_combined_score >= threshold`，则 PASS
- 如果 `panel_combined_score >= 3.0` 且合并后问题列表中的每个条目均满足 `priority == "Low"`，则 PASS
- 否则 FAIL → 重试

---

### 处理意见分歧

如果审查者之间存在显著分歧（`combined_score` 或任何评分标准上的差值 > 2.0）：

1. 标记该评分标准（或 combined_score 差距）
2. 展示两位审查者的推理和问题，并提供证据
3. 询问用户：“审查者在 [criterion] 上意见不一致。是否手动审查？”
4. 如果是：展示证据并获取用户决定
5. 如果否：使用中位数（保守方法）

### 最终报告

所有步骤完成且 DoD 验证通过后：

```markdown
## Implementation Summary

### Task Status
- Task Status: `done` ✅
- All Definition of Done items: X/X PASS (100%)

### Configuration Used

| Setting | Value |
|---------|-------|
| **Standard Components Threshold** | {THRESHOLD_FOR_STANDARD_COMPONENTS}/5.0 |
| **Critical Components Threshold** | {THRESHOLD_FOR_CRITICAL_COMPONENTS}/5.0 |
| **Lenient Threshold** | {LENIENT_THRESHOLD}/5.0 |
| **Max Iterations** | {MAX_ITERATIONS or "3"} |
| **Human Checkpoints** | {HUMAN_IN_THE_LOOP_STEPS or "None"} |
| **Skip Reviews** | {SKIP_REVIEWS} |
| **Continue Mode** | {CONTINUE_MODE} |
| **Refine Mode** | {REFINE_MODE} |

### Steps Completed

| Step | Title | Status | Verification | Combined Score | Iterations | Reviewer Confirmed |
|------|-------|--------|--------------|----------------|------------|--------------------|
| 1    | [Title] | ✅ | None | N/A | 1 | - |
| 2    | [Title] | ✅ | Panel of 2 | 4.5/5 | 1 | ✅ |
| 3    | [Title] | ✅ | Per-Item | 5/5 passed | 2 | ✅ |
| 4    | [Title] | ✅ | Single Judge | 4.2/5 | 3 | ✅ |

**Legend:**
- ✅ PASS - Score >= threshold for step type
- ⚠️ MAX_ITER - Did not pass but MAX_ITERATIONS reached, proceeded anyway
- ⏭️ SKIPPED - Step skipped (continue/refine mode)

### Verification Summary

- Total steps: X
- Steps with verification: Y
- Passed on first try: Z
- Required iteration: W
- Total iterations across all steps: V
- Final pass rate: 100%

### Definition of Done Verification

| Item | Status | Evidence |
|------|--------|----------|
| [DoD Item 1] | ✅ PASS | [Brief evidence] |
| [DoD Item 2] | ✅ PASS | [Brief evidence] |
| ... | ... | ... |

**Issues Fixed During Verification:**
1. [Issue]: [How it was fixed]
2. [Issue]: [How it was fixed]

### High-Variance Criteria (Reviewers Disagreed)

- [Criterion] in [Step]: Reviewer 1 scored X, Reviewer 2 scored Y

### Human Review Summary (if --human-in-the-loop used)

| Step | Checkpoint | User Action | Feedback Incorporated |
|------|------------|-------------|----------------------|
| 2    | After PASS | Continued | - |
| 4    | After iteration 2 | Feedback | "Improve error messages" |
| 6    | After PASS | Continued | - |

### Task File Updated

- Task moved from `in-progress/` to `done/` folder
- All step titles marked `[DONE]`
- All step subtasks marked `[X]`
- All Definition of Done items marked `[X]`

### Recommendations

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
│  Phase 0: Select Task                                         │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Use provided name or auto-select from todo/ (if 1 task) │  │
│  │ → Move task from todo/ to in-progress/                  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Phase 1: Load Task                                           │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Read $TASK_PATH → Parse steps                           │  │
│  │ → Extract #### Verification specs → Create TodoWrite    │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Phase 2: Execute Steps (Respecting Dependencies)             │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  For each step:                                          │  │
│  │                                                          │  │
│  │  ┌──────────────┐    ┌───────────────┐    ┌───────────┐ │  │
│  │  │ developer    │───▶│ Reviewer Agent│───▶│ PASS?     │ │  │
│  │  │ Agent        │    │ (verify)      │    │           │ │  │
│  │  └──────────────┘    └───────────────┘    └───────────┘ │  │
│  │                                                │   │     │  │
│  │                                               PASS FAIL  │  │
│  │                                                │   │     │  │
│  │                                                ▼   ▼     │  │
│  │                                    ┌────────┐  Retry  │  │  │
│  │                                    │ Mark   │  with   │  │  │
│  │                                    │Complete│  issues │  │  │
│  │                                    └────────┘  ↺     │  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Phase 3: Definition of Done Verification                     │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │  ┌──────────────┐    ┌───────────────┐    ┌───────────┐ │  │
│  │  │ DoD Reviewer │───▶│ All DoD       │───▶│ All PASS? │ │  │
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
│  Phase 4: Move Task to Done                                   │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ mv in-progress/$TASK → done/$TASK                       │  │
│  └─────────────────────────────────────────────────────────┘  │
│                           │                                   │
│                           ▼                                   │
│  Phase 5: Aggregate & Report                                  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Collect all verification results                        │  │
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

# Continue from last completed step
/implement add-validation.feature.md --continue

# Refine after user fixes project files (detects changes, re-verifies affected steps)
/implement add-validation.feature.md --refine

# Human review after every step
/implement add-validation.feature.md --human-in-the-loop

# Human review after specific steps only
/implement add-validation.feature.md --human-in-the-loop 2,4,6

# Higher quality threshold (stricter) - sets both standard and critical to 4.5
/implement add-validation.feature.md --target-quality 4.5

# Different thresholds for standard (3.5) and critical (4.5) components
/implement add-validation.feature.md --target-quality 3.5,4.5

# Lower quality threshold for both (faster convergence)
/implement add-validation.feature.md --target-quality 3.5

# Unlimited iterations (default is 3)
/implement add-validation.feature.md --max-iterations unlimited

# Skip all per-step code-reviewer checks (fast but no quality gates)
/implement add-validation.feature.md --skip-reviews

# Custom lenient threshold for steps marked lenient by qa-engineer
/implement add-validation.feature.md --lenient-threshold 3.0

# Combined: continue with human review
/implement add-validation.feature.md --continue --human-in-the-loop
```

### 示例 1：实现一项功能

```
User: /implement add-validation.feature.md

Phase 0: Task Selection...
Found task in: .specs/tasks/todo/add-validation.feature.md
Moving to in-progress: .specs/tasks/in-progress/add-validation.feature.md

Phase 1: Loading task...
Task: "Add form validation service"
Steps identified: 4 steps

Verification plan (from #### Verification sections):
- Step 1: No verification (directory creation)
- Step 2: Panel of 2 evaluations (ValidationService)
- Step 3: Per-item evaluations (3 validators)
- Step 4: Single evaluation (integration)

Phase 2: Executing...

Step 1: Launching sdd:developer agent...
  Agent: "Implement Step 1: Create Directory Structure..."
  Result: ✅ Directories created
  Verification: Skipped (simple operation)
  Status: ✅ COMPLETE

Step 2: Launching sdd:developer agent...
  Agent: "Implement Step 2: Create ValidationService..."
  Result: Files created, tests passing

  Launching 2 sdd:code-reviewer agents in parallel (Panel of 2)...
  Reviewer 1: combined_score 4.3/5.0
  Reviewer 2: combined_score 4.5/5.0
  Panel median: 4.4/5.0 (threshold 4.5) — issues all Low priority → PASS ✅
  Status: ✅ COMPLETE (Reviewer Confirmed)

[Continue for all steps...]

Phase 3: Definition of Done Verification...
Launching sdd:core-reviewer agent...
  Agent: "Verify all Definition of Done items..."
  Result: 4/4 items PASS ✅

Phase 4: Moving task to done...
  mv .specs/tasks/in-progress/add-validation.feature.md .specs/tasks/done/

Phase 5: Final Report
Implementation complete.
- 4/4 steps completed
- 6 artifacts verified
- All passed first try
- Definition of Done: 4/4 PASS
- Task location: .specs/tasks/done/add-validation.feature.md ✅
```

### 示例 2：处理 DoD 条目失败

```
[All steps complete...]

Phase 3: Definition of Done Verification...
Launching sdd:core-reviewer agent...
  Agent: "Verify all Definition of Done items..."
  Result: 3/4 items PASS, 1 FAIL ❌

Failing item:
- "Code follows ESLint rules": 356 errors found

Should I attempt to fix this issue? [Y/n]

User: Y

Launching sdd:developer agent...
  Agent: "Fix ESLint errors..."
  Result: Fixed 356 errors, 0 warnings ✅

Re-launching sdd:core-reviewer agent...
  Agent: "Re-verify all Definition of Done items..."
  Result: 4/4 items PASS ✅

Phase 4: Moving task to done...
All DoD checkboxes marked complete ✅

Phase 5: Final Report
Task verification complete.
- All DoD items now PASS
- 1 issue fixed (ESLint errors)
- Task location: .specs/tasks/done/ ✅
```

### 示例 3：处理验证失败

```
Step 3 Implementation complete.
Launching 2 sdd:code-reviewer agents in parallel (Panel of 2)...

Reviewer 1: combined_score 3.5/5.0
Reviewer 2: combined_score 3.2/5.0
Panel median: 3.35/5.0 — below threshold 4.5 → FAIL

Issues found (consolidated from spec_compliance + code_quality + waste):
- [High] Spec compliance — Test Coverage criterion scored 2/5
  Evidence: src/decision/decision.service.spec.ts (no edge-case tests)
  Suggestion: Add empty-input and null-input tests
- [High] Code quality — Reuse: custom Result type duplicates existing one
  Evidence: src/decision/types.ts:12 vs src/types/result.ts:5
  Suggestion: Import and use the project-standard Result<T, E>
- [Medium] Waste — Inventory: 3 unused imports in decision.service.ts
  Suggestion: Remove unused imports

Launching sdd:developer agent with consolidated reviewer feedback...
Agent: "Fix Step 3: Address reviewer issues (High → Medium)..."
Result: Issues fixed, tests added, imports cleaned

Re-launching 2 sdd:code-reviewer agents in parallel...
Reviewer 1: combined_score 4.5/5.0
Reviewer 2: combined_score 4.6/5.0
Panel median: 4.55/5.0 ≥ threshold 4.5 → PASS ✅
Status: ✅ COMPLETE (Reviewer Confirmed)
```

### 示例 4：从中断处继续

```
User: /implement add-validation.feature.md --continue

Phase 0: Parsing flags...
Configuration:
- Continue Mode: true
- Target Quality: 4.0/5.0 (default)

Scanning task file for completed steps...
Found: Step 1 [DONE], Step 2 [DONE]
Last completed: Step 2

Verifying Step 2 artifacts...
Launching sdd:code-reviewer for Step 2...
Reviewer: combined_score 4.3/5.0 ≥ threshold 4.0 → PASS ✅
Marking step as complete in task file...

Resuming from Step 3...

Step 3: Launching sdd:developer agent...
[continues normally]
```

### 示例 5：在用户修复后优化

```
# User manually fixed src/validation/validation.service.ts
# (This file was created in Step 2: Create ValidationService)

User: /implement add-validation.feature.md --refine

Phase 0: Parsing flags...
Configuration:
- Refine Mode: true

Detecting changed project files...
Changed files:
- src/validation/validation.service.ts (modified)

Mapping files to implementation steps...
- src/validation/validation.service.ts → Step 2 (Create ValidationService)

Earliest affected step: Step 2
Preserving: Step 1 (unchanged)
Re-verifying from: Step 2 onwards

Step 2: Launching sdd:code-reviewer to verify with user's changes...
Reviewer: combined_score 4.3/5.0 ≥ threshold 4.0 → PASS ✅
Rest of logic is not affected, proceeding...

Step 3: Launching sdd:code-reviewer to verify...
Reviewer: combined_score 2.8/5.0 — issues include "typescript error in file" (High priority) → FAIL
Launching sdd:developer agent with reviewer issues to fix the error and align logic with user's changes...

Re-launching sdd:code-reviewer to verify fixed logic...
Reviewer: combined_score 4.5/5.0 → PASS ✅

[continues verifying remaining steps...]

All steps verified with user's changes incorporated ✅
```

### 示例 6：人在回路审核

```
User: /implement add-validation.feature.md --human-in-the-loop

Configuration:
- Human Checkpoints: All steps

Step 1: Launching sdd:developer agent...
Result: Directories created ✅

---
## 🔍 Human Review Checkpoint - Step 1

**Step:** Create Directory Structure
**Combined Score:** N/A (verification level: None)
**Status:** ✅ COMPLETE

**Artifacts Created:**
- src/validation/
- src/validation/tests/

**Action Required:** Review the above artifacts and provide feedback or continue.

> Continue? [Y/n/feedback]: Y
---

Step 2: Launching sdd:developer agent...
Result: ValidationService created ✅

Launching 2 sdd:code-reviewer agents in parallel (Panel of 2)...
Reviewer 1: combined_score 4.5/5.0
Reviewer 2: combined_score 4.3/5.0
Panel median: 4.4/5.0 ≥ threshold (lenient mode in this example) → PASS ✅

---
## 🔍 Human Review Checkpoint - Step 2

**Step:** Create ValidationService
**Combined Score:** 4.4/5.0 (threshold: 4.0)
**Status:** ✅ PASS

**Artifacts Created:**
- src/validation/validation.service.ts
- src/validation/tests/validation.service.spec.ts

**Reviewer Feedback (issues):**
- [Low] Error messages could be more descriptive (Suggestion-level only)

**Action Required:** Review the above artifacts and provide feedback or continue.

> Continue? [Y/n/feedback]: The error messages could be more descriptive
---

Incorporating feedback: "error messages could be more descriptive"
Re-launching sdd:developer agent with feedback...
[iteration continues]
```

### 示例 7：严格质量阈值

```
User: /implement critical-api.feature.md --target-quality 4.5

Configuration:
- Target Quality: 4.5/5.0

Step 2: Implementing critical API endpoint...
Result: Endpoint created

Launching 2 sdd:code-reviewer agents (Panel of 2)...
Reviewer 1: combined_score 4.2/5.0
Reviewer 2: combined_score 4.3/5.0
Panel median: 4.25/5.0 — below threshold 4.5 → FAIL

Iteration 1: Re-launching developer with consolidated reviewer issues...
[fixes applied]

Re-launching 2 sdd:code-reviewer agents...
Reviewer 1: combined_score 4.4/5.0
Reviewer 2: combined_score 4.5/5.0
Panel median: 4.45/5.0 — below threshold 4.5 → FAIL

Iteration 2: Re-launching developer with reviewer issues...
[more fixes applied]

Re-launching 2 sdd:code-reviewer agents...
Reviewer 1: combined_score 4.6/5.0
Reviewer 2: combined_score 4.5/5.0
Panel median: 4.55/5.0 ≥ threshold 4.5 → PASS ✅

Status: ✅ COMPLETE (passed on iteration 2)
```

---

## 错误处理

### 实现失败

如果 sdd:developer 智能体报告失败：

1. 向用户展示失败详情
2. 提出可能有助于解决问题的澄清问题
3. 携带澄清信息再次启动 sdd:developer 智能体

### 审核者意见不一致（2 人评审组）

如果两份 `sdd:code-reviewer` 报告在 `combined_score` 上存在显著差异（差值 > 2.0），或在任何单项评分标准上存在显著差异（差值 > 2.0）：

1. 展示两位审核者的推理、问题及相关证据
2. 请求用户裁决：“审核者在 [criterion] 上意见不一致。您的决定是？”
3. 根据用户的决定继续（如果用户不作决定，则使用中位数）

### 优化模式：未检测到更改

如果 `--refine` 模式未在项目中发现 git 更改：

1. 报告："自上次提交以来，未检测到项目文件更改。"
2. 建议："请先编辑项目文件，然后再次运行 --refine。"
3. 或者："不使用 --refine 运行，以重新实现所有步骤。"

### 优化模式：更改无法映射到步骤

如果 `--refine` 模式发现了已更改的文件，但没有任何文件可映射到实现步骤：

1. 报告："已更改的文件与任何实现步骤的预期输出都不匹配。"
2. 列出检测到的已更改文件
3. 建议："请手动验证，或不使用 --refine 运行，以重新验证所有步骤。"

---

## 检查清单

完成实现之前：

### 配置处理

- [ ] 已正确解析 `$ARGUMENTS` 中的所有标志
- [ ] 对 `Single Judge` 和 `Per-Item Judges` 步骤使用了 `THRESHOLD_FOR_STANDARD_COMPONENTS`
- [ ] 对 `Panel of 2 Judges` 步骤使用了 `THRESHOLD_FOR_CRITICAL_COMPONENTS`
- [ ] 仅对 qa-engineer 规范中标记为宽松的步骤使用了 `LENIENT_THRESHOLD`
- [ ] 持续迭代，直到满足编排器级别的 PASS 规则（或达到 `MAX_ITERATIONS`，默认为 3）
- [ ] 仅对 `HUMAN_IN_THE_LOOP_STEPS` 中的步骤触发了人工参与检查点
- [ ] 如果 `SKIP_REVIEWS` 为 true：跳过了所有 code-reviewer 调度
- [ ] 如果 `CONTINUE_MODE` 为 true：已验证最后一个步骤（通过 code-reviewer）并正确恢复执行
- [ ] 如果 `REFINE_MODE` 为 true：已检测更改的项目文件，将其映射到步骤，并从最早受影响的步骤开始重新验证

### 上下文保护（关键）

- [ ] 仅阅读了任务文件（`.specs/tasks/in-progress/` 中的 `$TASK_PATH`）——未阅读其他文件
- [ ] 未阅读实现输出、参考文件或工件
- [ ] 使用子代理报告获取状态——未通过读取文件进行“检查”

### 委派

- [ ] 所有实现均由 `sdd:developer` 代理通过 Task 工具完成
- [ ] 所有逐步骤验证均由 `sdd:code-reviewer` 代理通过 Task 工具完成
- [ ] 未自行执行任何验证
- [ ] 未跳过任何验证步骤（除非 `SKIP_REVIEWS` 为 true）

### 阶段跟踪

- [ ] 每个步骤仅在编排器级别判定 PASS 后才标记为完成（如果 `SKIP_REVIEWS`，则立即标记）
- [ ] 每个步骤完成后均更新了任务文件：
  - 步骤标题标记为 `[DONE]`
  - 子任务标记为 `[X]`
- [ ] 每个步骤完成后均更新了待办事项列表

### 执行质量

- [ ] 所有步骤均按依赖顺序执行
- [ ] 可并行步骤同时启动（而非顺序启动）
- [ ] 每个 `sdd:developer` 代理均收到聚焦于具体步骤的提示，其中包含准确的步骤内容
- [ ] 所有验证级别不为 `None` 的步骤均由 `sdd:code-reviewer` 进行审查（除非 `SKIP_REVIEWS`）
- [ ] Panel-of-2 并行使用了 2 名审查者，并基于 `combined_score` 进行中位数投票
- [ ] Per-Item 为每个项目并行使用一名审查者
- [ ] 审查失败后，使用审查者的 `issues` 作为反馈持续迭代，直到编排器级别判定 PASS
- [ ] 已生成包含审查者确认状态的最终报告
- [ ] 已将任何审查者分歧告知用户（Panel 高方差标准）

### 人工参与（如已启用）

- [ ] 在 `HUMAN_IN_THE_LOOP_STEPS` 中的每个步骤后显示检查点
- [ ] 将用户反馈纳入后续迭代/步骤
- [ ] 在用户请求时暂停工作流

### 最终验证与完成

- [ ] 已启动完成定义验证代理
- [ ] 已验证所有 DoD 项（PASS/FAIL/BLOCKED 状态）
- [ ] 已通过 sdd:developer 代理修复未通过的 DoD 项
- [ ] 修复后已执行重新验证
- [ ] 已将任务从 `in-progress/` 文件夹移动到 `done/` 文件夹
- [ ] 已在任务文件中将所有 DoD 复选框标记为 `[X]`
- [ ] 已向用户提供最终验证报告

---

## 附录 A：验证规范参考

本附录说明了如何在任务文件中指定验证要求。在阶段 2（执行步骤）期间，你将参考这些规范，以了解如何验证每个产物。

### 任务文件如何定义验证

任务文件在每个实施步骤的 `#### Verification` 部分中定义验证要求。这些部分规定了：

### 必需元素

1. **级别**：验证复杂度（此标签决定分派多少个 `sdd:code-reviewer` 代理，请参见阶段 2）
   - `None` - 简单操作（mkdir、删除、经模式验证的配置）- 完全跳过代码审查器
   - `Single Judge` - 非关键产物 - 分派 1 个审查器；编排器阈值为 4.0
   - `Panel of 2 Judges` - 关键产物 - 并行分派 2 个审查器，对 `combined_score` 进行中位数投票；编排器阈值为 4.0 或 4.5
   - `Per-Item Judges` - 多个相似项目 - 为每个项目并行分派 1 个审查器；每个项目的编排器阈值为 4.0

2. **产物**：待审查文件的路径
   - 示例：`src/decision/decision.service.ts`、`src/decision/tests/decision.service.spec.ts`

3. **阈值**：最低通过分数
   - 标准质量通常为 4.0/5.0
   - 关键组件有时为 4.5/5.0

4. **参考模式**（可选）：良好实现示例的路径
   - 示例：`src/app.service.ts`，用于 NestJS 服务模式


### 评分标准格式

任务文件中的评分标准使用以下 Markdown 表格格式：

```markdown
| Criterion | Weight | Description |
|-----------|--------|-------------|
| [Name 1]  | 0.XX   | [What to evaluate] |
| [Name 2]  | 0.XX   | [What to evaluate] |
| ...       | ...    | ...         |
```

**要求：**

- 权重之和必须为 1.0
- 每项标准都有清晰、可衡量的描述
- 每个评分标准通常包含 3-6 项标准

**示例：**

```markdown
| Criterion | Weight | Description |
|-----------|--------|-------------|
| Type Correctness | 0.35 | Types match specification exactly |
| API Contract Alignment | 0.25 | Aligns with documented API contract |
| Export Structure | 0.20 | Barrel exports correctly expose all types |
| Code Quality | 0.20 | Follows project TypeScript conventions |
```

### 评分量表

当 `sdd:code-reviewer` 评估产物时，会对每项标准使用以下 5 分制量表

- **1（差）**：不满足要求
  - 缺少必要元素
  - 从根本上误解了要求

- **2（低于平均水平）**：存在多个问题，仅部分满足要求
  - 包含一些正确的元素，但存在重大缺漏
  - 需要进行大量返工

- **3（合格）**：满足基本要求
  - 功能可用，但仅达到最低标准
  - 在质量或完整性方面仍有改进空间

- **4（良好）**：满足所有要求，仅有少量次要问题
  - 实现可靠
  - 稍加打磨即可进一步改进

- **5（优秀）**：超出要求
  - 质量卓越
  - 完成度超出所要求的范围
  - 可作为参考实现

### 在执行期间使用验证规范

**在阶段 2（执行步骤）期间：**

1. 在 `sdd:developer` 代理完成实现后
2. 阅读该步骤的 `#### Verification` 小节
3. 提取：级别、制品路径、阈值
5. 根据级别启动相应数量的 `sdd:code-reviewer` 代理
6. 向每位审查者准确传递 4 个输入（制品、步骤编号、规范路径、CLAUDE_PLUGIN_ROOT）——**绝不传递阈值**
7. 接收审查者的综合报告；进行聚合（评审组取中位数）
8. 在编排器层级针对 `combined_score` 应用阈值门禁
9. 如果未通过，则使用汇总后的审查问题作为反馈启动 `sdd:developer`，然后重新验证

**任务文件中的验证部分示例：**

```markdown
#### Verification

**Level:** Panel of 2 Judges with Aggregated Voting
**Artifact:** `src/decision/decision.service.ts`, `src/decision/tests/decision.service.spec.ts`

**Rubric:**

| Criterion | Weight | Description |
|-----------|--------|-------------|
| Routing Logic | 0.20 | Correctly routes by customerType |
| Drip Feed Implementation | 0.25 | 2% random approval for rejected New customers only |
| Response Formatting | 0.20 | Correct decision outcome, triggeredRules preserved, ISO 8601 timestamp |
| Testability | 0.15 | Injectable randomGenerator enables deterministic testing |
| Test Coverage | 0.20 | Unit tests cover approval, rejection, drip feed, routing, timestamp |

**Reference Pattern:** NestJS service patterns, ZenEngineService API
```

此规范要求你：

- 并行启动 2 个 `sdd:code-reviewer` 代理（2 人评审组 → Pattern B-Panel）
- 向它们传递制品路径（服务文件和测试文件）
- 不要向审查者传递任何阈值——按照设计，它们不知晓阈值
- 接收每位审查者的 `combined_score`；编排器计算 `median(combined_score)`，并在此层应用 `THRESHOLD_FOR_CRITICAL_COMPONENTS`（默认值为 4.5）
- 如果未通过，则将汇总后的审查问题发送给开发者；最多迭代 `MAX_ITERATIONS` 次
- 参考现有的 NestJS 模式进行比较