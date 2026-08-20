---
name: ln-302-task-replanner
description: "Compares ideal plan vs existing tasks and applies KEEP/UPDATE/OBSOLETE/CREATE changes. Use when Story tasks need re-sync with updated requirements."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 任务重新规划器

**类型：** L3 Worker
**类别：** 3XX 规划

独立运行优先的任务重新规划 Worker。它会比较理想任务计划与现有任务，并执行所需操作。

**必须阅读：** 加载 `references/coordinator_summary_contract.md` 和 `references/task_plan_worker_runtime_contract.md`
**必须阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/template_loading_pattern.md` 和 `references/destructive_operation_safety.md`
**必须阅读：** 加载 `references/replan_algorithm.md`

## 输入

核心输入：
- `storyId`
- `taskType`
- `storyData`
- `existingTaskIds`
- `idealPlan`
- `teamId`

传输输入：
- 独立运行：省略 `runId` 和 `summaryArtifactPath`
- 托管运行：同时传入 `runId` 和 `summaryArtifactPath`

## 运行时

运行时系列：`task-plan-worker-runtime`

阶段配置：
1. `PHASE_0_CONFIG`
2. `PHASE_1_LOAD_INPUTS`
3. `PHASE_2_LOAD_EXISTING_TASKS`
4. `PHASE_3_NORMALIZE_AND_CLASSIFY`
5. `PHASE_4_CONFIRM_OR_AUTOAPPROVE`
6. `PHASE_5_APPLY_REPLAN`
7. `PHASE_6_UPDATE_KANBAN`
8. `PHASE_7_WRITE_SUMMARY`
9. `PHASE_8_SELF_CHECK`

摘要产物规则：
- 输出 `summary_kind=task-plan`
- 独立运行会自行生成 `run_id`，并写入默认的 Worker 系列产物路径
- 托管运行必须同时提供 `runId` 和 `summaryArtifactPath`，并且必须将摘要写入所提供的确切路径
- 在产生终止结果之前，始终先写入通过验证的摘要产物

## 输出契约

始终根据以下文档构建结构化的 `task-plan` 摘要信封：
- `references/coordinator_summary_contract.md`
- `references/task_plan_worker_runtime_contract.md`

有效载荷字段：
- `mode`
- `story_id`
- `task_type`
- `tasks_created`
- `tasks_updated`
- `tasks_canceled`
- `task_urls`
- `kanban_updated`
- `dry_warnings_count`
- `warnings`

在产生终止结果之前，始终先写入通过验证的摘要。

## 工作流程

1. 根据需要解析 Story 上下文。
2. 加载现有任务。
3. 对理想任务结构和现有任务结构进行规范化。
4. 分类为 `KEEP`、`UPDATE`、`OBSOLETE`、`CREATE`。
5. 如果分类结果为空，则输出经过验证的无操作摘要并停止。
6. 如果处于交互模式，则显示摘要。
7. 执行特定于提供方的更新。
8. 仅当提供方发生变更时更新看板。
9. 返回结构化摘要。

## 关键规则

- 保持独立运行能力。
- 不得依赖协调器运行时状态。
- 重新规划后仍须保留特定于类型的规则。
- 每次都返回机器可读的输出。
- **无操作重新规划的快速路径：** 当规范化后没有保留下来的任务变更时，不得变更提供方状态或看板；返回变更数为零的摘要。
- **在调用跟踪器的 createTask/updateBody 之前停止：** 验证正文中是否包含全部 7 个部分：Context、Implementation Plan、Technical Approach、Acceptance Criteria、Affected Components、Existing Code Impact、Definition of Done。缺少这些部分时，PreToolUse hook 将阻止创建。

## 完成定义

- [ ] 已加载并比较现有任务
- [ ] 已对重新规划操作进行分类
- [ ] 已执行更新、取消和创建操作
- [ ] kanban 已更新
- [ ] 已返回结构化摘要
- [ ] 已将摘要产物写入托管或独立运行时路径

---
**版本：** 3.0.0
**最后更新：** 2025-12-23