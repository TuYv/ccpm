---
name: ln-222-story-replanner
description: "Replans Stories by comparing IDEAL vs existing (KEEP/UPDATE/OBSOLETE/CREATE). Use when Epic requirements changed and Stories need realignment."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# Story 重规划器

**类型：** L3 工作器
**类别：** 2XX 规划

以独立运行为优先的 Story 重规划工作器。它将理想的 Story 意图与现有 Story 进行比较，并应用由此产生的操作。

## 必读

执行前加载以下内容：
- `references/planning_worker_runtime_contract.md`
- `references/coordinator_summary_contract.md`
- `references/environment_state_contract.md`
- `references/storage_mode_detection.md`
- `references/template_loading_pattern.md`
- `references/replan_algorithm_stories.md`

## 输入

核心输入：
- `epicData`
- `idealPlan`
- `existingStoryIds`
- `standardsResearch`
- `teamId`
- `autoApprove`

可选传输输入：
- `runId`
- `summaryArtifactPath`

在调用方未提供 `runId` 且没有 `summaryArtifactPath` 的情况下，该工作器仍必须完全可用。在独立模式下，它会在发出摘要信封之前生成自己的 `run_id`。

## 运行时

运行时系列：`planning-worker-runtime`

标识符：
- `epic-{epicId}`

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_RESOLVE_CONTEXT`
3. `PHASE_2_LOAD_EXISTING_STORIES`
4. `PHASE_3_CLASSIFY_REPLAN`
5. `PHASE_4_CONFIRM_OR_AUTOAPPROVE`
6. `PHASE_5_APPLY_REPLAN`
7. `PHASE_6_UPDATE_KANBAN`
8. `PHASE_7_WRITE_SUMMARY`
9. `PHASE_8_SELF_CHECK`

受管子运行模式：
- 调用方使用 `--run-id` 和 `--summary-artifact-path` 启动运行时
- 运行时将最终摘要产物直接写入调用方提供的路径
- 父协调器记录生成的 `story-plan-worker` 产物

独立模式：
- 运行时生成自己的 `run_id`
- 运行时仍返回相同的结构化摘要信封
- 除非提供了 `summaryArtifactPath`，否则写入产物是可选的

## 输出契约

始终构建结构化摘要信封：
- `schema_version`
- `summary_kind=story-plan-worker`
- `run_id`
- `identifier`
- `producer_skill=ln-222`
- `produced_at`
- `payload`

载荷字段：
- `mode`
- `epic_id`
- `stories_planned`
- `stories_created`
- `stories_updated`
- `stories_canceled`
- `story_urls`
- `warnings`
- `kanban_updated`
- `research_path_used`

如果提供了 `summaryArtifactPath`：
- 将相同的 JSON 摘要写入该路径

如果未提供 `summaryArtifactPath`：
- 仅在结构化输出中返回相同的摘要

受管产物路径模式：
- `.hex-skills/runtime-artifacts/runs/{parent_run_id}/story-plan-worker/ln-222--{identifier}.json`

## 工作流

1. 如果尚未提供，则解析 Epic 上下文。
2. 逐个加载现有 Story。
3. 规范化理想 Story 与现有 Story 的结构。
4. 运行重规划算法，将操作分类为 `KEEP`、`UPDATE`、`OBSOLETE`、`CREATE`。
5. 除非 `autoApprove=true`，否则显示操作摘要。
6. 执行特定于提供商的更新。
7. 更新看板。
8. 写入 `story-plan-worker` 摘要。
9. 运行自检并返回经过验证的结构化摘要。

## 关键规则

- 当匹配存在歧义时，优先采用保守更新。
- 当重规划与已完成的 Story 冲突时，保留已完成的工作。
- 保持工作器能够独立运行。
- 绝不要求依赖协调器运行时状态才能运行。
- 返回机器可读的结果，而非仅包含散文描述的结果。
- **在跟踪器执行 createStory/updateBody 之前停止：** 验证正文中是否存在全部 9 个章节：Story、Context、Acceptance Criteria、Implementation Tasks、Test Strategy、Technical Notes、Definition of Done、Dependencies、Assumptions。PreToolUse 钩子会阻止创建缺少这些章节的内容。

## 完成定义

- [ ] 已加载并规范化现有故事
- [ ] 已应用重新规划算法
- [ ] 已执行所需的更新、取消和创建操作
- [ ] 已更新 kanban
- [ ] 已返回结构化摘要
- [ ] 提供 `summaryArtifactPath` 时已写入摘要产物
- [ ] 在最终结果输出前已通过自检

---

**版本：** 3.0.0
**最后更新：** 2025-12-23