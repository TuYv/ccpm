---
name: ln-400-story-executor
description: "Executes Story tasks in priority order (To Review, To Rework, Todo). Use when Story has planned tasks ready for implementation."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L2 协调器
**类别：** 4XX 执行

# Story 执行编排器

由运行时支持的 Story 执行协调器。负责管理任务顺序、worktree 生命周期、任务/组检查点，以及 Story 最终转换至 `To Review` 状态。

## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `storyId` | 是 | 参数、git 分支、看板、用户 | 要处理的 Story |
| `--rework-focus` | 否 | ln-1000 | 上一次质量门禁失败（FAIL）时以逗号分隔的阻塞类别 |

**解析方式：** Story 解析链。  
**状态筛选器：** Todo、In Progress、To Rework、To Review

## 目的与范围

- 每次循环仅加载一次 Story 和任务元数据
- 按以下顺序执行：`To Review -> To Rework -> Todo`
- 仅当明确标记时才启动 `Todo` 并行组
- 每个执行器/返工步骤完成后，强制立即进行审查
- 将可恢复的运行时状态持久化到 `.hex-skills/story-execution/runtime/`
- 仅将 Story 移至 `To Review`；绝不移至 `Done`

## 运行时契约

**必须阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/input_resolution_pattern.md`
**必须阅读：** 加载 `references/coordinator_runtime_contract.md`、`references/story_execution_runtime_contract.md`、`references/coordinator_summary_contract.md`、`references/loop_health_contract.md`
**必须阅读：** 加载 `references/git_worktree_fallback.md`——使用 Story 执行对应的行

运行时 CLI：

```bash
node references/scripts/story-execution-runtime/cli.mjs start --story {storyId} --manifest-file .hex-skills/story-execution/manifest.json
node references/scripts/story-execution-runtime/cli.mjs status
node references/scripts/story-execution-runtime/cli.mjs checkpoint --phase PHASE_3_SELECT_WORK --payload '{...}'
node references/scripts/story-execution-runtime/cli.mjs record-worker --task-id {taskId} --payload '{...}'
node references/scripts/story-execution-runtime/cli.mjs record-group --group-id {groupId} --payload '{...}'
node references/scripts/story-execution-runtime/cli.mjs record-stage-summary --story {storyId} --payload '{...}'
node references/scripts/story-execution-runtime/cli.mjs record-loop-health --scope task --scope-id {taskId} --payload '{...}'
node references/scripts/story-execution-runtime/cli.mjs advance --to PHASE_4_TASK_EXECUTION
```

## 工作流

### 阶段 0：配置

1. 解析 `storyId`。
2. 从任务管理配置中检测 `task_provider`。
3. 构建执行清单：
   - `story_id`
   - `task_provider`
   - `project_root`
   - 计划使用的 `worktree_dir`
   - 分支名称
   - `parallel_group_policy`
   - `status_transition_policy`
4. 启动运行时并为 `PHASE_0_CONFIG` 创建检查点。

### 阶段 1：发现

1. 解析 Story 标题和当前 Story 状态。
2. 仅加载子任务元数据：
   - 使用已配置的跟踪器提供方的 `listTasksByStory(storyId)` 操作（传输方式参见 `references/provider_file.md, references/provider_github.md, references/provider_linear.md`）。
3. 为以下状态构建 `processable_counts`：
   - `to_review`
   - `to_rework`
   - `todo`
4. 为 `PHASE_1_DISCOVERY` 创建检查点。

### 阶段 2：Worktree 设置

1. 检测当前分支。
2. 如果已经位于 `feature/*` 中，则将当前目录视为活动 worktree。
3. 否则，根据 worktree 回退指南创建 `.hex-skills/worktrees/story-{identifier}`，并为每个 worktree 创建分支 `feature/{identifier}-{slug}`。
4. 使用以下内容为 `PHASE_2_WORKTREE_SETUP` 创建检查点：
   - `worktree_ready`
   - `worktree_dir`
   - `branch`
5. 仅在 `worktree_ready=true` 后继续。

### 阶段 3：选择工作

选择顺序是确定性的：

1. 优先依次处理所有 `To Review` 任务
2. 然后依次处理所有 `To Rework` 任务
3. 最后处理 `Todo` 任务：
   - 带有 `**Parallel Group:** {N}` 的任务可以作为一个组运行
   - 不属于任何组的任务是单任务顺序执行单元

使用以下内容为 `PHASE_3_SELECT_WORK` 创建检查点：
- `current_task_id` 或 `current_group_id`
- 最新的 `processable_counts`

如果所有可处理计数均为零，则跳过执行并前进至 `PHASE_7_STORY_TO_REVIEW`。

当提供 `rework_focus` 时：
- 标题或 AC 关键词与任意 `blocking_categories` 条目匹配的任务，将在同一优先级层级内优先选择。
- 这不会覆盖 To Review > To Rework > Todo 的顺序，而只会调整每个层级内的顺序。

### 阶段 4：任务执行

适用于：
- `To Review` -> `ln-402`
- `To Rework` -> `ln-403`，然后立即执行 `ln-402`
- 单个 `Todo` 测试任务 -> `ln-404`，然后立即执行 `ln-402`
- 单个 `Todo` 实现/重构任务 -> `ln-401`，然后立即执行 `ln-402`

流程：

1. 计算执行器 `childRunId = {parent_run_id}--{worker}--{taskId}`。
2. 计算执行器产物路径 `.hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--{worker}.json`。
3. 在 `.hex-skills/story-execution/{worker}--{taskId}_manifest.json` 生成执行器清单。
4. 启动 `task-worker-runtime`，并在调用前为执行器 `child_run` 元数据创建检查点。
5. 通过 Agent 或 Skill 执行 worker，并使用 `--run-id` 和 `--summary-artifact-path`。
6. 从 `.hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--{worker}.json` 读取执行器摘要产物。
7. 在针对同一任务/worker/错误进行重试之前，记录任务循环健康状况：
   - 操作：将当前 worker 输出与上一次任务循环健康状况进行比较。
   - 要点：仅当存在新产物、新的 `ln-402` 摘要、任务状态变化、`files_changed` 变化或场景改善时才重试。
   - 原因：重复出现完全相同的 worker 故障会造成重试风暴，却不会增加证据。
   - 证据：`record-loop-health --scope task --scope-id {taskId}` 的结果。
   - 例外：如果 `pause.pause=true`，则停止并呈现 `paused_reason`。
   - 自动化/防护：达到相同错误/无进展阈值后，story-execution 运行时会暂停。
8. 需要审查时，对 `ln-402` 重复执行相同的、由运行时支持的序列。
9. 从 `.hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--ln-402.json` 读取同一任务最新的 `ln-402` 审查摘要产物。
10. 使用 `record-worker` 记录 worker 产物。
11. 为 `PHASE_4_TASK_EXECUTION` 创建检查点。
12. 前进至 `PHASE_6_VERIFY_STATUSES`。

### 阶段 5：分组执行

仅用于包含多个任务的 `Todo` 组。

1. 为每个任务计算工作器专属的子 `runId`、制品路径和清单路径。
2. 为每个执行器启动一个 `task-worker-runtime`，并在生成 Agent 之前对所有子任务元数据执行检查点保存。
3. 通过 Agent 工具并行生成所有分组执行器。
4. 等待所有执行器完成。
5. 读取每个执行器的摘要制品。
6. 为每个任务启动一个 `ln-402` 运行时，依次审查每个任务，并读取每个任务的最新审查制品。
7. 使用 `record-worker` 记录每个工作器制品，然后使用 `record-group` 记录分组摘要。
8. 对 `PHASE_5_GROUP_EXECUTION` 执行检查点保存。
9. 前进到 `PHASE_6_VERIFY_STATUSES`。

### 阶段 6：验证状态

1. 从事实来源重新读取任务元数据。
2. 刷新 `processable_counts`。
3. 验证本次运行涉及的每个任务都有最新的 `ln-402` 机器可读摘要。
4. 如果任何工作器留下了意外的状态转换，则暂停运行时。
5. 如果任何任务连续第三次进入 `To Rework`，则暂停运行时并提供升级原因。
6. 对 `PHASE_6_VERIFY_STATUSES` 执行检查点保存。
7. 如果仍有可处理的工作 -> 返回 `PHASE_3_SELECT_WORK`。
8. 如果没有可处理的工作 -> 前进到 `PHASE_6B_SCENARIO_VALIDATION`。

### 场景验证

当所有任务均为 Done 时运行一次。委托外部 Agent 根据已实现的代码对用户场景进行端到端追踪。在引导任务完成实施后，执行器会倾向于认为工作已经完成，而外部 Agent 不会因用户故事是否完成而受到利益影响。

1. 加载用户故事验收标准和可追溯性表（来自 `.hex-skills/task-planning/{identifier}_traceability.md`）。如果缺少可追溯性制品，则根据用户故事验收标准和任务实施计划重建等效的追踪信息——不要仅仅因为规划器制品缺失而判定场景验证失败。
2. 运行 Agent 健康检查。如果有可用的顾问 Agent：
   a. 根据 `references/agents/prompt_templates/scenario_validator.md` 构建验证提示词
   b. 填入：用户故事验收标准、可追溯性表、架构上下文、项目根路径（Agent 直接读取代码）
   c. 将提示词保存到 `.hex-skills/story-execution/{identifier}_scenario_prompt.md`
   d. 启动 Agent：

   ```bash
   node references/agents/agent_runner.mjs \
     --agent {agent} \
     --prompt-file .hex-skills/story-execution/{identifier}_scenario_prompt.md \
     --output-file .hex-skills/story-execution/{identifier}_scenario_result.md \
     --cwd {project_dir}
   ```

   e. 解析结果 JSON，查找中断的环节
3. 如果没有可用的 Agent：运行自检作为后备方案（通过代码检查追踪 5 个环节）。
4. 如果任何环节中断或缺失：
   - 根据可追溯性表的层映射确定负责的任务
   - 在再次设置返工之前，记录以中断环节为键的场景循环健康状态
   - 如果同一中断环节再次出现，且代码/制品没有变化，则暂停，而不是盲目返工
   - 将该任务重新设置为 `To Rework`，并将场景验证发现作为返工上下文
   - 返回 `PHASE_3_SELECT_WORK`
5. 场景验证最多循环 2 次。如果经过 2 个返工周期后仍然失败，则执行 `PAUSE`，交由用户审查。
6. 如果所有环节均通过 -> 前进到 `PHASE_7_STORY_TO_REVIEW`。

使用以下内容为 `PHASE_6B_SCENARIO_VALIDATION` 创建检查点：
- `scenario_pass`: true/false
- `segments_traced`: 数量
- `segments_passed`: 数量
- `rework_tasks`: 被退回的任务 ID 列表（通过时为空）
- `validation_mode`: `agent_validated` 或 `self_check_only`

### 阶段 7：Story 转入评审

1. 验证没有任务仍处于 `Todo`、`To Review` 或 `To Rework` 状态。
2. 将 Story 状态更新为 `To Review`。
3. 将看板更新为 `To Review`。
4. 使用以下内容为 `PHASE_7_STORY_TO_REVIEW` 创建检查点：
   - `story_transition_done=true`
   - `story_final_status="To Review"`
   - `final_result="READY_FOR_GATE"`
5. 写入阶段 2 协调器产物，包含：
   - `summary_kind=pipeline-stage`
   - `stage=2`
   - `story_id`
   - `status=completed`
   - `final_result="READY_FOR_GATE"`
   - `story_status="To Review"`
   - `warnings`

### 阶段 8：自检

根据运行时状态而非记忆生成最终检查清单：

- [ ] 配置检查点存在
- [ ] 发现检查点存在
- [ ] 工作树检查点存在且 `worktree_ready=true`
- [ ] 每个已执行的任务都有最新的 `ln-402` 摘要产物
- [ ] 每个已处理的分组都有记录的运行时结果
- [ ] 返工循环防护未触发
- [ ] Story 已转入 `To Review`
- [ ] 已记录阶段 2 协调器产物

使用 `pass=true|false` 为 `PHASE_8_SELF_CHECK` 创建检查点。
仅在 `pass=true` 后完成运行时。

## Worker 调用（强制）

**宿主 Skill 调用：** 必须通过 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用 Skill 中找到指定 Skill，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该 Skill 工作流，然后携带其结果/产物返回此处。
- 不要内联 Worker 逻辑，也不要在未执行目标 Skill 的情况下将 Worker 标记为完成。

| 状态 | Worker | 调用方式 |
|--------|--------|------------|
| `To Review` | `ln-402-task-reviewer` | 通过 `Skill()` 内联调用 |
| `To Rework` | `ln-403-task-rework` | Agent，随后立即执行 `ln-402` |
| `Todo` 测试 | `ln-404-test-executor` | Agent，随后立即执行 `ln-402` |
| `Todo` 实现/重构 | `ln-401-task-executor` | Agent，随后立即执行 `ln-402` |

Executor 和 Reworker 在隔离环境中运行：

```javascript
node references/scripts/task-worker-runtime/cli.mjs start --skill {worker} --task-id {taskId} --manifest-file .hex-skills/story-execution/{worker}--{taskId}_manifest.json --run-id {childRunId} --summary-artifact-path .hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--{worker}.json
node references/scripts/story-execution-runtime/cli.mjs checkpoint --phase PHASE_4_TASK_EXECUTION --payload '{"child_run":{"worker":"{worker}","task_id":"{taskId}","run_id":"{childRunId}","summary_artifact_path":".hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--{worker}.json"}}'
Agent(
  description: "Execute task {taskId}",
  prompt: "Execute task worker.\n\nStep 1: Invoke worker:\n  Skill(skill: \"{worker}\", args: \"{taskId} --run-id {childRunId} --summary-artifact-path .hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--{worker}.json\")\n\nCONTEXT:\nTask ID: {taskId}",
  subagent_type: "general-purpose"
)
```

审查者以内联方式运行：

```javascript
node references/scripts/task-worker-runtime/cli.mjs start --skill ln-402 --task-id {taskId} --manifest-file .hex-skills/story-execution/ln-402--{taskId}_manifest.json --run-id {reviewRunId} --summary-artifact-path .hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--ln-402.json
node references/scripts/story-execution-runtime/cli.mjs checkpoint --phase PHASE_4_TASK_EXECUTION --payload '{"child_run":{"worker":"ln-402","task_id":"{taskId}","run_id":"{reviewRunId}","summary_artifact_path":".hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--ln-402.json"}}'
Skill(skill: "ln-402-task-reviewer", args: "{taskId} --run-id {reviewRunId} --summary-artifact-path .hex-skills/runtime-artifacts/runs/{parent_run_id}/task-status/{taskId}--ln-402.json")
```

## TodoWrite 格式（必需）

```
- Start ln-400 runtime (pending)
- Load Story/task metadata (pending)
- Setup or detect worktree (pending)
- Select next task/group (pending)
- Start child runtime(s) and checkpoint child metadata (pending)
- Execute task/group with managed transport inputs (pending)
- Review task results immediately (pending)
- Re-read statuses and record checkpoint (pending)
- Validate user scenario end-to-end (pending)
- Move Story to To Review (pending)
- Run runtime self-check and complete (pending)
```

## 关键规则

- 运行时状态是编排的 SSOT；看板是任务状态的 SSOT。
- 绝不批量审查。
- 绝不将 Story 移至 `Done`。
- 每个工作器的结果都必须从摘要 JSON 中读取，而不能仅从聊天中的文字描述读取。
- `record-worker` 是工作器结果的主要运行时摄取路径。
- 在重复执行任务/任务组/场景工作之前，`record-loop-health` 是重试有效性的主要摄取路径。
- 每次托管工作器运行都必须在调用前通过 `task-worker-runtime` 启动。
- `ln-1000` 使用阶段 2 的协调器产物，而不是自由文本形式的阶段输出。
- 即使执行组并行运行，审查仍须按顺序进行。
- `ln-402` 仍是唯一可以将任务接受为 `Done` 的工作器。

## 完成定义

- [ ] 运行时已启动，并已为 `PHASE_0_CONFIG` 创建检查点
- [ ] 已为发现与工作树设置创建检查点
- [ ] 每个已执行的任务/任务组均已记录到运行时中
- [ ] 必要时已确定性地处理返工循环升级（`PAUSED`）
- [ ] 已为最终状态验证创建检查点
- [ ] 场景验证已通过，或已设为 PAUSED 以供用户审查
- [ ] Story 已移至 `To Review`，而非 `Done`
- [ ] 自检已通过，且运行时已完成

## 阶段 9：元分析

可选参考：仅当用户要求进行运行后元分析或采用协议格式的运行反思时，才加载 `references/meta_analysis_protocol.md`。

技能类型：`execution-orchestrator`。收到请求时，在各阶段完成后运行。使用 `execution-orchestrator` 格式输出到聊天中。

## 参考文件

- `references/coordinator_runtime_contract.md`
- `references/story_execution_runtime_contract.md`
- `references/coordinator_summary_contract.md`
- `references/git_worktree_fallback.md`
- `../ln-401-task-executor/SKILL.md`
- `../ln-402-task-reviewer/SKILL.md`
- `../ln-403-task-rework/SKILL.md`
- `../ln-404-test-executor/SKILL.md`

---
**Version:** 4.0.0
**Last Updated:** 2026-01-29