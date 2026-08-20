---
name: ln-221-story-creator
description: "Creates Story documents with 9-section structure and INVEST validation via the configured tracker provider. Use when Epic has an IDEAL plan ready for Story generation."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

# Story 创建器

**类型：** L3 工作器
**类别：** 2XX 规划

独立优先的 Story 创建工作器。它既可以被直接调用，也可以作为协调器流程的一部分被调用，但在这两种情况下，其公共契约保持一致。

## 强制阅读

执行前加载以下文件：
- `references/planning_worker_runtime_contract.md`
- `references/coordinator_summary_contract.md`
- `references/environment_state_contract.md`
- `references/storage_mode_detection.md`
- `references/creation_quality_checklist.md`
- `references/template_loading_pattern.md`

## 输入

核心输入：
- `epicData`
- `idealPlan` 或 `appendMode + newStoryDescription`
- `standardsResearch`
- `teamId`
- `autoApprove`

可选传输输入：
- `runId`
- `summaryArtifactPath`

在调用方未提供 `runId` 且未提供 `summaryArtifactPath` 的情况下，该工作器必须仍可完全正常使用。在独立模式下，它会在生成摘要信封前自行生成 `run_id`。

## 运行时

运行时系列：`planning-worker-runtime`

标识符：
- `epic-{epicId}`

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_RESOLVE_CONTEXT`
3. `PHASE_2_LOAD_TEMPLATE`
4. `PHASE_3_GENERATE_STORIES`
5. `PHASE_4_VALIDATE_STORIES`
6. `PHASE_5_CONFIRM_OR_AUTOAPPROVE`
7. `PHASE_6_APPLY_CREATE`
8. `PHASE_7_UPDATE_KANBAN`
9. `PHASE_8_WRITE_SUMMARY`
10. `PHASE_9_SELF_CHECK`

托管子运行模式：
- 调用方使用 `--run-id` 和 `--summary-artifact-path` 启动运行时
- 运行时将最终摘要产物直接写入调用方提供的路径
- 父协调器记录生成的 `story-plan-worker` 产物

独立模式：
- 运行时自行生成 `run_id`
- 运行时仍返回相同的结构化摘要信封
- 除非提供了 `summaryArtifactPath`，否则产物写入是可选的

## 输出契约

始终构建结构化摘要信封：
- `schema_version`
- `summary_kind=story-plan-worker`
- `run_id`
- `identifier`
- `producer_skill=ln-221`
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
- 将同一份 JSON 摘要写入该路径

如果未提供 `summaryArtifactPath`：
- 仅在结构化输出中返回同一份摘要

托管产物路径模式：
- `.hex-skills/runtime-artifacts/runs/{parent_run_id}/story-plan-worker/ln-221--{identifier}.json`

## 工作流程

1. 如果尚未提供任务提供方和 Epic 上下文，则解析它们。
2. 加载 Story 模板。
3. 严格按照模板中的章节生成 Story 文档。
4. 仅将标准研究内容插入技术说明。
5. 创建前验证 INVEST 原则和 AC 数量限制。
6. 除非 `autoApprove=true`，否则显示预览。
7. 通过已配置的跟踪器提供方创建 Story。
8. 更新看板。
9. 写入 `story-plan-worker` 摘要。
10. 返回结构化摘要。

## 关键规则

- 严格保持模板定义的 Story 结构。
- 将标准研究内容写入 Technical Notes，而不是 AC。
- 拒绝不符合 INVEST 原则或超出 AC 数量限制的 Story。
- **在调用跟踪器的 `createStory` 之前停止：**验证正文中是否包含全部 9 个部分：Story、Context、Acceptance Criteria、Implementation Tasks、Test Strategy、Technical Notes、Definition of Done、Dependencies、Assumptions。缺少这些部分时，PreToolUse 钩子将阻止创建。
- 保持独立运行能力。
- 运行时绝不依赖协调器状态。

## 完成定义

- [ ] 已加载并遵循 Story 模板
- [ ] 已生成 Story 文档
- [ ] 已通过 INVEST 验证
- [ ] 已在特定于提供商的存储中创建 Story
- [ ] 已更新看板
- [ ] 已返回结构化摘要
- [ ] 提供 `summaryArtifactPath` 时已写入摘要制品

---

**版本：** 3.0.0
**最后更新：** 2025-12-23