---
name: executing-plans
description: Executes written implementation plans efficiently using agent teams or subagents. This skill should be used when the user has a completed plan.md, asks to "execute the plan", or is ready to run batches of independent tasks in parallel following BDD principles.
argument-hint: [plan-folder-path]
user-invocable: true
allowed-tools: ["TaskCreate", "TaskUpdate", "TaskList", "TaskGet", "Read", "Glob", "Grep", "Agent", "Bash(git-agent:*)", "Bash(git:*)", "Bash(${CLAUDE_PLUGIN_ROOT}/scripts/setup-superpower-loop.sh:*)"]
---
# 执行计划

使用 Superpower Loop 高效执行已编写的实施计划，在所有阶段中持续迭代。

## 关键要求：第一步操作——立即启动 Superpower Loop

**解析计划路径并立即启动循环——在此之前，不要读取计划文件、探索代码库或执行任何其他操作。**

1. 解析计划路径：
   - 如果 `$ARGUMENTS` 提供了路径（例如 `docs/plans/YYYY-MM-DD-topic-plan/`），则使用该路径
   - 否则，在 `docs/plans/` 中搜索符合 `YYYY-MM-DD-*-plan/` 格式的最新 `*-plan/` 文件夹
   - 如果在没有显式参数的情况下找到，请向用户确认：“执行此计划：[path]？”
   - 如果未找到或用户拒绝，请向用户询问计划文件夹路径
2. 立即运行：
```bash
"${CLAUDE_PLUGIN_ROOT}/scripts/setup-superpower-loop.sh" "Execute the plan at <resolved-plan-path>. Continue progressing through the superpowers:executing-plans skill phases: Phase 1 (Plan Review) → Phase 2 (Task Creation) → Phase 3-4 loop (Batch Execution + Verification, repeat per batch) → Phase 5 (Git Commit) → Phase 6 (Completion)." --completion-promise "EXECUTION_COMPLETE" --max-iterations 100
```
3. 只有在循环运行后，才能继续执行下方的初始化步骤

**该循环支持在整个执行过程中进行自引用迭代。**

## Superpower Loop 集成

此技能使用 Superpower Loop，以便在整个执行过程中进行自引用迭代。

**关键要求**：在整个过程中，只有满足以下条件时，才可以输出 `<promise>EXECUTION_COMPLETE</promise>`：
- 阶段 1-5（计划审查、任务创建、批量执行、验证、Git 提交）均已完成
- 所有任务均已执行并验证
- 所有任务均已标记为 `completed`（通过 TaskList 验证——不存在状态为 `in_progress` 或 `pending` 的任务）
- 已在阶段 4 获得用户批准
- Git 提交已完成

在所有条件真正满足之前，不要输出该承诺。

**绝对最终输出规则**：该承诺标签必须是你输出的最后一段文本。在承诺标签之前输出所有过渡消息或面向用户的说明。`<promise>EXECUTION_COMPLETE</promise>` 之后不得有任何内容。

## 初始化

（已在上述第一步操作中启动 Superpower Loop 并解析计划路径——不要再次启动循环）

1. **计划检查**：验证该文件夹中包含 `_index.md`，且其中具有“执行计划”章节。
2. **上下文**：完整读取 `_index.md`。这是执行过程的唯一事实来源。

循环将持续完成所有阶段，直到输出 `<promise>EXECUTION_COMPLETE</promise>`。

## 背景知识

**核心原则**：执行前审查、分批验证、明确阻塞因素、以证据为依据。

**强制技能**：无论采用何种执行模式，都必须加载 `superpowers:agent-team-driven-development` 和 `superpowers:behavior-driven-development`。

## 完成定义

这些规则不可协商，并优先于所有其他指导。

**禁止的输出**——如果任务产生以下任何内容，则绝不能将其标记为 `completed`：
- 存根文件：仅包含函数签名、`pass` 或 `...`，而没有任何逻辑的文件
- 占位符实现：`TODO`、`FIXME`、`NotImplemented`、`raise NotImplementedError`，或任何语言中的等效内容
- 空函数体：仅返回硬编码默认值或 `None`/`null`，而不执行实际逻辑的函数
- 仅有骨架的文件：仅包含导入、类型声明或类定义，但没有方法体的文件

**只有同时满足以下所有条件，任务才算“完成”：**
1. 任务文件中的验证命令以代码 0 退出
2. 预期输出与实际输出一致（无测试失败、无断言错误）
3. 任务期间写入的任何文件中均不存在禁止使用的模式

**验证失败时：**
- 任务必须保持为 `in_progress`
- 修复问题并重新运行验证
- 如果重试两次后仍受阻，请按照 `./references/blocker-and-escalation.md` 上报
- 验证失败后，绝不能将任务标记为 `completed`

## 阶段 1：计划审查与理解

1. **阅读计划**：阅读 `_index.md`，了解范围、架构决策，并从“执行计划”部分提取内联 YAML 任务元数据。
2. **了解项目**：探索代码库结构、关键文件以及与计划相关的模式。
3. **检查阻塞项**：查看 `./references/blocker-and-escalation.md`。

## 阶段 2：创建任务（强制）

**关键要求**：在执行任何任务之前，你必须使用 TaskCreate 创建所有任务。必须先完成任务创建，才能开始依赖关系分析或执行。

1. **从 _index.md 提取任务**：仅阅读 `_index.md`。解析“执行计划”部分中的内联 YAML 元数据，提取：
   - `id`：任务标识符（例如，"001"）
   - `subject`：使用祈使形式的简短标题（例如，"Implement login handler"）
   - `slug`：用于文件名的连字符分隔式 slug（例如，"implement-login-handler"）
   - `type`：任务类型（test、impl、setup、config、refactor）
   - `depends-on`：此任务所依赖的任务 ID 数组（例如，["001"]）

2. **先创建任务**：使用 TaskCreate 注册每个任务
   - 根据 YAML `subject` 字段设置 `subject`
   - 将 `description` 设置为："See task file: ./task-{id}-{slug}-{type}.md for full details including BDD scenario and verification steps"
   - 通过将 subject 转换为现在进行时形式来设置 `activeForm`（例如，"Setting up project structure"）
   - 必须先创建所有任务，然后才能进入下一阶段
   - 此阶段不要读取单个任务文件——这些文件将在执行期间按需读取

3. **分析依赖关系**：创建所有任务后，构建依赖关系图
   - 计算依赖层级：第 0 层 = 无依赖项，第 N 层 = 所有 `depends-on` 任务均位于更早的层级
   - 在每个层级内，按类型对任务进行分组，以最大限度提高并行度（例如，将所有“编写测试”任务归为一组，将所有“实现”任务归为一组）
   - **识别红-绿配对**：扫描所有任务文件名，查找匹配的 NNN 前缀（例如，`task-002-auth-test` + `task-002-auth-impl`）。将每个此类配对标记为**红-绿配对**——它们始终作为同一批次中的协调单元进行调度。测试任务保留其第 0 层位置；实现任务紧随其后，在同一批次中执行（而不是单独成批）。
   - **目标**：每个批次应包含 3-6 个任务
   - **规则**：每个批次必须包含 ≥2 个任务，除非它是唯一剩余的批次

4. **设置任务依赖关系**：使用 TaskUpdate 配置任务之间的依赖关系
   - `addBlockedBy`：此任务开始前必须等待的任务 ID 数组
   - `addBlocks`：必须等待此任务完成的任务 ID 数组
   - 示例：`TaskUpdate({ taskId: "2", addBlockedBy: ["1"] })` 表示任务 #2 等待任务 #1

## 阶段 3：批量执行循环

使用 Agent Teams 或 subagents 以并行方式分批执行任务。

**对于每个批次**：

1. **选择执行模式**（决策树）：
   - **红-绿配对**：如果批次包含红-绿配对（具有相同 NNN 前缀，一个为 `test`，另一个为 `impl`），则必须恰好分配两个专属 agents——每个任务一个。test agent 先运行并确认红色状态；之后 impl agent 才开始。多个配对可并行运行。对于任何 test+impl 配对，此要求不可协商。
   - **并行**（所有其他多任务批次的默认模式）：3 个及以上任务使用 Agent Team，恰好 2 个任务则使用普通 subagents。如果 agents 会编辑相互重叠的文件，可在此模式中选择使用 worktree 隔离（`isolation: "worktree"`）——这不是一种独立模式。批次内的文件冲突应尽可能通过进一步拆分批次来解决。
   - **线性**（最后手段）：仅当批次只有单个任务，或存在无法拆分且不可避免的顺序依赖时使用。明确说明原因。

2. **对于批次中的每个任务**：

   a. **将任务标记为进行中**：使用 TaskUpdate 将状态设置为 `in_progress`

   b. **读取任务上下文**：读取任务文件以获取完整上下文（主题、描述、BDD 场景、验证步骤）

   c. **执行任务**：根据执行模式执行：

      **强制提示词内容**——无论采用何种执行模式，每个 agent/teammate 的提示词都必须包含：
      1. 完整的任务文件内容（主题、描述、BDD 场景、验证命令）
      2. 质量要求块："You MUST produce complete, working implementation code — not stubs, skeletons, or placeholders. Every function body must contain real logic. If you cannot implement something completely, stop and report a blocker."
      3. 验证块："After implementation, run the verification commands below and confirm they all pass (exit code 0, no test failures). Report the actual command output. Do NOT report completion until all verification commands pass."

      完整的必需模板请参阅 `./references/batch-execution-playbook.md` 中的“Agent Prompt Template”章节。

      **对于 Agent Team / Worktree 模式**：
      - 如果尚未创建团队，则创建团队
      - 使用上述强制提示词模板将任务分配给可用的 teammate
      - 等待 teammate 完成任务并报告验证输出

      **对于 Subagent 模式**：
      - 使用上述强制提示词模板启动 subagent
      - 等待 subagent 完成任务并报告验证输出

      **对于线性模式**：
      - 在当前会话中直接执行任务
      - 遵循 BDD 场景和验证步骤
      - 运行验证命令并捕获输出

   d. **验证门禁**：运行任务文件中的所有验证命令。捕获实际输出。
      - 对于 test 任务：确认测试因正确原因失败（已确认红色状态）
      - 对于 impl 任务：确认所有测试均通过（已确认绿色状态，退出码为 0）
      - 对于其他任务：确认验证命令以 0 退出，且输出符合预期

**硬性门禁**：如果任意验证步骤失败（非零退出码、测试失败、意外输出）：
      - 任务必须保持为 `in_progress`
      - 修复问题并重新运行验证（最多重试两次）
      - 如果两次重试后仍然失败，请按照 `./references/blocker-and-escalation.md` 进行上报
      - 只要有任何验证失败，绝不能继续执行步骤 2e

   e. **将任务标记为完成**：仅当 2d 中的所有验证步骤均通过后，才使用 TaskUpdate 将状态设置为 `completed`。在更新中注明：运行了哪些验证命令，以及这些命令均已通过。

3. **批次完成**：批次中的所有任务完成后，报告进度并继续处理下一批次

有关详细的执行模式，请参阅 `./references/batch-execution-playbook.md`。

## 阶段 4：验证与反馈

使用结构化证据完成闭环。

1. **发布证据**：针对批次中每个已完成的任务，输出一个结构化证据块：
   ```
   Task [ID]: [subject]
   Verification command: <command run>
   Output: <actual output, truncated to last 20 lines if long>
   Status: PASS / FAIL
   ```
   任何没有 PASS 证据块的任务都不算已验证。在所有任务的状态均为 PASS 之前，不要继续进行确认。

2. **确认**：使用 AskUserQuestion 展示证据摘要并询问：“此批次中的所有任务均已验证。是否继续处理下一批次？”AskUserQuestion 会在当前轮次中暂停，确保用户可以在循环重新注入之前作出响应。继续之前必须获得明确确认。

3. **循环**：重复阶段 3-4，直到所有批次完成。

## 阶段 5：Git 提交

使用 git-agent 提交实现更改（并以 git 作为后备方案）。

**操作**：
1. 运行：`git-agent commit --intent "<feature description>" --co-author "Claude <Model> <Version> <noreply@anthropic.com>"`
2. 如果出现身份验证错误，请添加 `--free` 标志后重试
3. **后备方案**：如果 git-agent 不可用或执行失败，请使用 `git add` 暂存文件，并使用符合约定格式的 `git commit`

有关详细模式、提交消息模板和要求，请参阅 `../../skills/references/git-commit.md`。

**关键要求**：
- 仅在阶段 4 获得用户确认后提交
- 提交应体现已完成的功能，而不是单个任务
- 使用有意义的作用域（例如 `feat(auth):`、`feat(ui):`、`feat(db):`）

## 阶段 6：完成

验证所有任务均已完成，然后将承诺标记作为最后一行输出。

1. **最终任务审计**：使用 TaskList 确认每个任务的状态均为 `completed`。如果任何任务处于 `in_progress` 或 `pending` 状态，请勿继续——返回阶段 3 完成剩余任务。
2. 摘要消息：“计划执行完成。所有 [N] 个任务均已验证并提交。”
3. `<promise>EXECUTION_COMPLETE</promise>`——此后不得有任何内容

**禁止事项**：如果 TaskList 显示存在任何未完成的任务，请勿输出承诺标记。承诺标记后不得输出任何文本。

## 退出条件

所有任务均已执行并验证、证据已记录、没有阻塞项、已获得用户批准、最终验证通过，并且 git 提交已完成。

## 参考资料

- `./references/blocker-and-escalation.md` - 识别和处理阻塞问题的指南
- `./references/batch-execution-playbook.md` - 批量执行模式
- `../../skills/references/git-commit.md` - Git 提交模式和要求（跨 Skill 共享资源）
- `../../skills/references/loop-patterns.md` - 完成承诺设计、提示词模式和安全保障