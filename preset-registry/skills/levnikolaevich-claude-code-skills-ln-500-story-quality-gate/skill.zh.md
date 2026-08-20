---
name: ln-500-story-quality-gate
description: "Story-level quality gate with 4-level verdict (PASS/CONCERNS/FAIL/WAIVED) and Quality Score. Use when Story is ready for quality assessment."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）相对于此 Skill 目录。

**类型：** L2 协调器
**类别：** 5XX 质量

# Story 质量门禁

由运行时支撑的门禁协调器。负责快速通道路由、质量/测试摘要、最终 Story 裁决以及分支收尾。

## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `storyId` | 是 | 参数、git 分支、看板、用户 | 要处理的 Story |

**解析方式：** Story 解析链。  
**状态筛选器：** To Review

## 目的与范围

- 调用 `ln-510-quality-coordinator`
- 在需要时调用 `ln-520-test-planner`
- 以确定性方式等待测试任务就绪
- 计算门禁裁决：`PASS | CONCERNS | FAIL | WAIVED`
- 仅在通过时将 Story 移至 `Done`
- 将可恢复的门禁运行时持久化到 `.hex-skills/story-gate/runtime/`

## 运行时契约

**必须阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/input_resolution_pattern.md`
**必须阅读：** 加载 `references/coordinator_runtime_contract.md`、`references/story_gate_runtime_contract.md`、`references/coordinator_summary_contract.md`、`references/loop_health_contract.md`
**必须阅读：** 加载 `references/git_worktree_fallback.md`
**必须阅读：** 加载 `references/minimum_quality_checks.md`

运行时 CLI：

```bash
node references/scripts/story-gate-runtime/cli.mjs start --story {storyId} --manifest-file .hex-skills/story-gate/manifest.json
node references/scripts/story-gate-runtime/cli.mjs status
node references/scripts/story-gate-runtime/cli.mjs record-quality --payload '{...}'
node references/scripts/story-gate-runtime/cli.mjs record-test-status --payload '{...}'
node references/scripts/story-gate-runtime/cli.mjs record-stage-summary --story {storyId} --payload '{...}'
node references/scripts/story-gate-runtime/cli.mjs checkpoint --phase PHASE_6_VERDICT --payload '{...}'
node references/scripts/story-gate-runtime/cli.mjs advance --to PHASE_7_FINALIZATION
```

## 四级门禁模型

| 裁决 | 含义 | 操作 |
|---------|---------|--------|
| `PASS` | 所有检查均已通过 | Story -> `Done` |
| `CONCERNS` | 存在轻微问题，风险已接受 | Story -> `Done`，并添加评论 |
| `FAIL` | 发现阻塞性问题 | 创建后续任务；Story 不会进入 `Done` |
| `WAIVED` | 用户批准的例外 | Story -> `Done`，并附上豁免证据 |

## 工作流

### 阶段 0：配置

1. 解析 `storyId` 和 `task_provider`。
2. 检查 `.hex-skills/runtime-artifacts/runs/*/story-quality/{storyId}.json` 中是否存在之前的阶段 3 产物：
   - 如果找到且 `verdict=FAIL`，则加载 `payload.metadata.rework_hint` 作为 `previous_cycle` 上下文。
   - 记录 `cycle_number`（从 1 开始，根据之前的产物数量递增）。
3. 构建门禁清单：
   - `story_id`
   - `task_provider`
   - `project_root`
   - `worktree_dir`
   - `branch`
   - `fast_track_policy`
   - `nfr_policy`
   - `test_task_policy`
   - `previous_cycle`（null 或已加载的 rework_hint）
   - `cycle_number`
4. 启动运行时，并为 `PHASE_0_CONFIG` 创建检查点。

### 阶段 1：发现

1. 加载 Story 元数据和子任务元数据。
2. 检测现有测试任务及其当前状态。
3. 如果上游流水线提供了就绪输入，则捕获这些输入。
4. 检查点 `PHASE_1_DISCOVERY`。

### 阶段 2：快速通道

1. 仅当就绪状态明确允许时，才确定 `fast_track=true`。
2. 记录检查点 `PHASE_2_FAST_TRACK`，其中包含：
   - `fast_track`
   - 门禁范围摘要

### 阶段 3：质量检查

1. 计算：
   - `childRunId = {parent_run_id}--ln-510--{storyId}`
   - `childSummaryArtifactPath = .hex-skills/runtime-artifacts/runs/{parent_run_id}/story-quality/{storyId}.json`
2. 具化子清单并启动子协调器运行时：
   - `node references/scripts/quality-runtime/cli.mjs start --story {storyId} --manifest-file .hex-skills/story-gate/ln-510--{storyId}_manifest.json --run-id {childRunId}`
3. 记录检查点 `PHASE_3_QUALITY_CHECKS`，其中包含：
   - `child_run.worker=ln-510`
   - `child_run.run_id={childRunId}`
   - `child_run.summary_artifact_path={childSummaryArtifactPath}`
   - `child_run.phase_context=quality_checks`
4. 使用托管传输输入调用 `ln-510-quality-coordinator`：
   - 完整模式：`Skill(skill: "ln-510-quality-coordinator", args: "{storyId} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")`
   - 快速通道：`Skill(skill: "ln-510-quality-coordinator", args: "{storyId} --fast-track --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")`
   - 包含上一周期的完整模式：当 `previous_cycle` 不为 null 时，追加 `--previous-cycle-focus "{blocking_categories}"`
5. 仅读取子级 `story-quality` 工件，然后执行 `record-quality`。
6. 在进行另一个质量/返工周期之前，将 FAIL 证据与上一周期进行比较：
   - 进展 = 新的质量工件、新的修复任务、代码差异、状态差异或阻塞类别发生变化
   - 相同的 FAIL 且没有新证据 = 记录循环健康状况，并在进行另一个返工周期之前暂停
7. 使用已记录的质量摘要记录检查点 `PHASE_3_QUALITY_CHECKS`。
8. 如果质量摘要已表明硬性 FAIL，可以直接跳转到 `PHASE_6_VERDICT`。

### 阶段 4：测试规划

1. 决定是否需要规划：
   - 没有测试任务 -> 调用 `ln-520`
   - 快速通道 -> 调用简化版 `ln-520`
   - 测试任务已存在且处于终态（`Done | SKIPPED | VERIFIED`）-> 记录为复用的检查点
2. 调用 `ln-520` 时，计算：
   - `childRunId = {parent_run_id}--ln-520--{storyId}`
   - `childSummaryArtifactPath = .hex-skills/runtime-artifacts/runs/{parent_run_id}/story-tests/{storyId}.json`
3. 具化子清单并启动子协调器运行时：
   - `node references/scripts/test-planning-runtime/cli.mjs start --story {storyId} --manifest-file .hex-skills/story-gate/ln-520--{storyId}_manifest.json --run-id {childRunId}`
4. 记录检查点 `PHASE_4_TEST_PLANNING`，其中包含：
   - `child_run.worker=ln-520`
   - `child_run.run_id={childRunId}`
   - `child_run.summary_artifact_path={childSummaryArtifactPath}`
   - `child_run.phase_context=test_planning`
5. 使用托管传输输入调用 `ln-520-test-planner`：
   - 正常模式：`Skill(skill: "ln-520-test-planner", args: "{storyId} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")`
   - 简化模式：`Skill(skill: "ln-520-test-planner", args: "{storyId} --simplified --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")`
6. 仅读取子级 `story-tests` 工件，然后执行 `record-test-status`。
7. 记录检查点 `PHASE_4_TEST_PLANNING`。

### 阶段 5：测试验证

1. 如果测试任务存在但状态不是 `Done`，则暂停运行：
   - `phase = PAUSED`
   - `resume_action = wait for test task completion`
2. 恢复后，验证：
   - 测试任务的终态为 `Done`、`SKIPPED` 或 `VERIFIED`
   - 存在覆盖率摘要
   - 计划场景和 Story AC 覆盖情况是机器可读的
3. 使用以下内容创建检查点 `PHASE_5_TEST_VERIFICATION`：
   - `test_task_status`
   - 验证结果

### 阶段 6：裁决

1. 计算 `quality_score`。
2. 评估 NFR 验证：
   - 完整门禁：安全性、性能、可靠性、可维护性
   - 快速通道：安全性为必选项，其他项可降级为仅关注问题的范围
3. **端到端场景完整性演练：** 对于每个需要参与者（用户、机器人、调度器、处理程序、流水线）调用或使用某种机制的 AC，追踪交互路径的全部 5 个环节：
   - **(1) 参与者触发** — 场景由什么发起（用户发送消息、计时器触发、Webhook 到达、事件进入队列）
   - **(2) 入口点** — 具名机制（MCP 工具、API 端点、CLI 命令、UI 组件、聊天处理程序、配置文件、cron 处理程序）
   - **(3) 发现** — 参与者的系统如何在运行时找到或加载该机制（配置注册、路由挂载、插件加载、系统提示词、环境变量）
   - **(4) 使用上下文** — 参与者的系统正确调用该机制需要什么（指令、提示词、模式、类型提示、文档、参数指导）
   - **(5) 可观察结果** — 可验证的结果（响应消息、状态变更、日志条目、通知）
   如果缺少任何环节，则创建一个以 `AC-` 为前缀的问题。常见故障：基础设施存在但未通过任何方式将其公开（缺少环节 2）、机制存在但参与者的系统无法找到它（缺少环节 3）、机制可被发现但参与者的系统不知道何时或如何使用它（缺少环节 4）。如果发现任何 `AC-` 问题：裁决结果必须为 `FAIL`；为缺失的环节创建修复任务。
4. 确定最终裁决结果。
5. 对于 `FAIL`：
   - 创建后续任务
   - 不要将 Story 移至 `Done`
6. 使用以下内容创建检查点 `PHASE_6_VERDICT`：
   - `final_result`
   - `quality_score`
   - `nfr_validation`
   - `fix_tasks_created`

### 阶段 7：最终处理

对于 `PASS | CONCERNS | WAIVED`：

1. 如有需要，提交并推送已验证的分支。
2. 将 Story 移至 `Done`。
3. 发布门禁评论。
4. 当调用方不拥有工作树时，清理工作树。

对于 `FAIL`：

1. 不要将分支最终确定为已接受。
2. 根据阻塞性问题创建后续任务。
3. 创建检查点 `PHASE_7_FINALIZATION`，其中包含 `status=requires_rework`。
4. 记录最终的 Story 状态和后续任务 ID。

最终处理完成后，写入一个阶段 3 协调器工件，其中包含：
- `summary_kind=pipeline-stage`
- `stage=3`
- `story_id`
- `status=completed`
- `final_result`
- `story_status`
- `verdict`
- `quality_score`
- `warnings`
- `metadata.rework_hint` — 当裁决结果为 FAIL 时，包含：
  - `rework_tasks`：已创建的后续任务 ID 列表
  - `blocking_categories`：导致 FAIL 的问题类别列表（例如 `ac_gap`、`security`、`regression`）
  - `suggested_focus`：简要说明返工周期应优先处理什么的一行描述

### 阶段 8：自检

根据运行时状态构建最终检查清单：

- [ ] 配置、发现和快速通道检查点均存在
- [ ] 已记录来自 `ln-510` 的质量摘要
- [ ] 测试规划和测试验证状态是确定性的
- [ ] 最终裁决检查点存在
- [ ] 已记录 Story 最终状态
- [ ] 已记录分支收尾操作，或根据裁决跳过该操作
- [ ] 已记录阶段 3 协调器产物

为检查点 `PHASE_8_SELF_CHECK` 设置 `pass=true|false`。
仅在 `pass=true` 后完成运行时。

## Worker 调用（强制）

**宿主 Skill 调用：** 必须通过 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用 Skill 中找到指定 Skill，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该 Skill 工作流，然后携带其结果/产物返回此处。
- 不得内联 Worker 逻辑，也不得在未执行目标 Skill 的情况下将 Worker 标记为已完成。

| 阶段 | Worker | 用途 |
|-------|--------|---------|
| 3 | `ln-510-quality-coordinator` | 代码质量、代理审查、回归、日志分析 |
| 4 | `ln-520-test-planner` | 研究/手动/自动测试规划 |

```javascript
childRunId = "{parent_run_id}--ln-510--{storyId}"
childSummaryArtifactPath = ".hex-skills/runtime-artifacts/runs/{parent_run_id}/story-quality/{storyId}.json"
node references/scripts/quality-runtime/cli.mjs start --story {storyId} --manifest-file .hex-skills/story-gate/ln-510--{storyId}_manifest.json --run-id {childRunId}
node references/scripts/story-gate-runtime/cli.mjs checkpoint --phase PHASE_3_QUALITY_CHECKS --payload '{"child_run":{"worker":"ln-510","run_id":"{childRunId}","summary_artifact_path":"{childSummaryArtifactPath}","phase_context":"quality_checks"}}'
Skill(skill: "ln-510-quality-coordinator", args: "{storyId} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")

childRunId = "{parent_run_id}--ln-520--{storyId}"
childSummaryArtifactPath = ".hex-skills/runtime-artifacts/runs/{parent_run_id}/story-tests/{storyId}.json"
node references/scripts/test-planning-runtime/cli.mjs start --story {storyId} --manifest-file .hex-skills/story-gate/ln-520--{storyId}_manifest.json --run-id {childRunId}
node references/scripts/story-gate-runtime/cli.mjs checkpoint --phase PHASE_4_TEST_PLANNING --payload '{"child_run":{"worker":"ln-520","run_id":"{childRunId}","summary_artifact_path":"{childSummaryArtifactPath}","phase_context":"test_planning"}}'
Skill(skill: "ln-520-test-planner", args: "{storyId} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")
```

## TodoWrite 格式（强制）

```
- Start ln-500 runtime (pending)
- Load Story/test-task metadata (pending)
- Decide fast-track mode (pending)
- Start ln-510 child runtime, checkpoint child_run, and record quality summary (pending)
- Start or reuse ln-520 child runtime, checkpoint child_run, and record test-planning summary (pending)
- Verify test task readiness (pending)
- Calculate final verdict (pending)
- Finalize Story/branch state and Stage 3 artifact (pending)
- Run runtime self-check and complete (pending)
```

## 关键规则

- 运行时状态是门禁编排的唯一事实来源（SSOT）。
- `ln-510` 和 `ln-520` 仅通过摘要 JSON 构件使用。
- 子协调器运行时状态仅作为恢复元数据；阶段完成仍取决于已记录的子构件。
- 等待测试任务是一种确定性暂停，而非隐式停止。
- 如果正确记录了后续操作，`FAIL` 是有效的终态门禁结果。
- `ln-1000` 使用 Stage 3 协调器构件，而非自由文本形式的阶段输出。
- Story 仅可在结果为 `PASS`、`CONCERNS` 或 `WAIVED` 时转为 `Done`。

## 完成定义

- [ ] 运行时已启动，且已记录配置/发现检查点
- [ ] 快速通道决策已记录到检查点
- [ ] `ln-510` 摘要已记录到运行时中
- [ ] `ln-520` 摘要已记录，或已按确定性方式复用
- [ ] 测试验证已达到终态或确定性暂停
- [ ] 最终裁决已记录到检查点，并包含质量分数和 NFR 结果
- [ ] 仅在通过结果下将 Story 转为 `Done`，或针对 `FAIL` 创建后续任务
- [ ] 完成前已记录 Stage 3 协调器构件
- [ ] 自检已通过，且运行时已完成

## 阶段 9：元分析

可选参考：仅当用户要求进行运行后元分析或采用协议格式的运行反思时，才加载 `references/meta_analysis_protocol.md`。

Skill 类型：`execution-orchestrator`。收到请求时，在各阶段完成后运行。使用 `execution-orchestrator` 格式输出到聊天中。

## 参考文件

- `references/coordinator_runtime_contract.md`
- `references/story_gate_runtime_contract.md`
- `references/coordinator_summary_contract.md`
- `references/minimum_quality_checks.md`
- `../ln-510-quality-coordinator/SKILL.md`
- `../ln-520-test-planner/SKILL.md`

---
**版本：** 7.0.0
**最后更新：** 2026-02-09