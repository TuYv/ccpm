---
name: ln-301-task-creator
description: "Creates implementation, refactoring, and test tasks from templates. Use when an approved task plan needs tasks created via the configured tracker provider and reflected in kanban."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# 任务创建器

**类型：** L3 Worker
**类别：** 3XX Planning

任务创建的独立优先工作器。它根据已批准的计划创建任务，并返回稳定的摘要契约。

**必须阅读：** 加载 `references/coordinator_summary_contract.md` 和 `references/task_plan_worker_runtime_contract.md`
**必须阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/template_loading_pattern.md`、`references/creation_quality_checklist.md` 和 `references/destructive_operation_safety.md`

## 输入

核心输入：
- `taskType`
- `storyData`
- `idealPlan` — 包含范围、AC 映射、依赖关系和分层分类的任务列表
- `teamId`
- `guideLinks`

协调器上下文（在 ADD/CREATE 模式下传入）：
- `traceabilityTablePath` — 协调器阶段 2 生成的实体化可追溯性表
- `discoveryContext` — 协调器阶段 1 获取的架构、技术栈、关键文件和集成点
- `tasksToCreate` — 要创建的具体任务（ADD 模式）。工作器负责编写包含 7 个部分的文档，不决定是否需要任务。

传输输入：
- 独立模式：省略 `runId` 和 `summaryArtifactPath`
- 托管模式：同时传入 `runId` 和 `summaryArtifactPath`

## 运行时

运行时系列：`task-plan-worker-runtime`

阶段配置：
1. `PHASE_0_CONFIG`
2. `PHASE_1_LOAD_INPUTS`
3. `PHASE_2_LOAD_CONTEXT`
4. `PHASE_3_GENERATE_TASK_DOCS`
5. `PHASE_4_VALIDATE_TASKS`
6. `PHASE_5_CONFIRM_OR_AUTOAPPROVE`
7. `PHASE_6_APPLY_CREATE`
8. `PHASE_7_UPDATE_KANBAN`
9. `PHASE_8_WRITE_SUMMARY`
10. `PHASE_9_SELF_CHECK`

摘要制品规则：
- 输出 `summary_kind=task-plan`
- 独立运行生成自己的 `run_id`，并写入默认的工作器系列制品路径
- 托管运行要求同时提供 `runId` 和 `summaryArtifactPath`，且必须将摘要写入所提供的精确路径
- 在得出最终结果之前，始终写入经过验证的摘要制品

## 输出契约

始终根据以下文档构建结构化的 `task-plan` 摘要信封：
- `references/coordinator_summary_contract.md`
- `references/task_plan_worker_runtime_contract.md`

载荷字段：
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

在得出最终结果之前，始终写入经过验证的摘要。

## 工作流程

1. 解析任务提供程序和模板集。
2. 在适用时运行 DRY 检查和破坏性操作检查。
3. 使用协调器上下文（`discoveryContext`、`traceabilityTablePath`）理解架构。研究代码库中的实现细节（现有模式、相关文件、集成点），以编写高质量的技术方案部分。
4. 选择范围：
   - `ADD`：仅使用 `tasksToCreate`
   - `CREATE`：展开完整的 `idealPlan`
5. 根据选定范围生成任务文档。
6. 验证特定类型的规则。
7. 显示预览，并在需要时获取确认。
8. 通过已配置的跟踪器提供程序创建任务。
9. 更新看板。
10. 返回结构化摘要。

## 关键规则

- 保持可独立运行。
- 不依赖协调器运行时状态。
- 按 `taskType` 分离实现、重构和测试规则。
- 每次都写入机器可读的摘要输出。
- **理想计划具有约束力。** 创建已批准计划中的每个任务。不要重新评估任务是否应该存在。
- **`ADD` 的快速路径：** `tasksToCreate` 是执行范围。当协调器已经选定增量时，不要重新展开完整的理想计划。
- **在调用任务跟踪器的 `createTask` 之前停止：** 验证正文中是否包含全部 7 个部分：上下文、实施计划、技术方法、验收标准、受影响的组件、对现有代码的影响、完成定义。若缺少这些部分，PreToolUse 钩子将阻止创建。

## 完成定义

- [ ] 已加载模板
- [ ] 已生成任务文档
- [ ] 已通过特定类型的验证
- [ ] 已在特定于提供商的存储中创建任务
- [ ] 已更新看板
- [ ] 已返回结构化摘要
- [ ] 已将摘要工件写入托管或独立运行时路径

---
**版本：** 3.0.0
**最后更新：** 2025-12-23