---
name: ln-520-test-planner
description: "Orchestrates test planning pipeline: research, manual testing, automated test planning. Use when Story needs comprehensive test coverage planning."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 测试规划编排器

**类型：** L2 Coordinator
**类别：** 5XX Quality

由运行时支持的测试规划协调器。运行时负责跳过/复用门控、工作器摘要跟踪以及确定性恢复。

## 输入

| 输入 | 必需 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `storyId` | 是 | 参数、git 分支、看板、用户 | 要处理的 Story |
| `--simplified` | 否 | 参数 | 跳过调研（ln-521）和手动测试（ln-522）。仅运行自动化测试规划（ln-523）。用于快速通道模式。 |

**解析：** Story 解析链。
**状态筛选器：** To Review

## 目的与范围
- **编排**测试规划：调研 → 手动测试 → 自动化测试规划
- **委派**给工作器：ln-521-test-researcher、ln-522-manual-tester、ln-523-auto-test-planner
- **不直接执行工作**——仅通过 Skill 工具进行协调和委派

## 运行时契约

**必须阅读：** 加载 `references/coordinator_runtime_contract.md`、`references/test_planning_runtime_contract.md`、`references/test_planning_summary_contract.md`、`references/test_planning_worker_runtime_contract.md`、`references/task_plan_worker_runtime_contract.md`

运行时系列：`test-planning-runtime`

标识符：
- Story ID

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_RESEARCH`
4. `PHASE_3_MANUAL_TESTING`
5. `PHASE_4_AUTO_TEST_PLANNING`
6. `PHASE_5_FINALIZE`
7. `PHASE_6_SELF_CHECK`

工作器摘要契约：
- `ln-521`、`ln-522`、`ln-523` 接收确定性的子 `runId` 以及精确的 `summaryArtifactPath`
- 在等待制品之前，为子运行时元数据创建检查点
- 每个工作器在进入终止结果之前写入一个 `test-planning-worker` 摘要信封
- ln-520 使用工作器摘要，而不是工作器的自由文本说明

## 何时使用

此 Skill 应在以下情况下使用：
- Story 已完成实现和回归工作，需要进行完整的测试规划
- Story 中的所有实现任务均为 Done
- 需要完整的测试规划（调研 + 手动 + 自动化）

**前置条件：**
- Story 中所有实现 Task 的状态 = Done
- 回归测试已通过（ln-513）
- 已完成代码质量检查（ln-511）

## 流水线概览

```
ln-520-test-planner (Orchestrator)
    │
    ├─→ ln-521-test-researcher
    │     └─→ Posts "## Test Research: {Feature}" comment
    │
    ├─→ ln-522-manual-tester
    │     └─→ Creates tests/manual/ scripts + "## Manual Testing Results" comment
    │
    └─→ ln-523-auto-test-planner
          └─→ Creates test task via the configured tracker provider via ln-301/ln-302
```

## 工作流

### 阶段 0：解析输入

**必须阅读：** 加载 `references/input_resolution_pattern.md`

1. **解析 storyId：** 按照指南运行 Story 解析链（状态筛选器：[To Review]）。

### 阶段 1：发现

1) 从 `docs/tasks/kanban_board.md` 自动发现 Team ID
2) 验证 Story ID

### 阶段 2：调研委派

> **简化模式门控：**
> - 如果存在 `--simplified` 标志，并且 Story 上已存在调研评论：跳过阶段 2（调研）。继续执行阶段 4。
> - 如果存在 `--simplified` 标志，但没有调研评论：跳过阶段 2。继续执行阶段 4（ln-523 将生成最小化的内联调研）。

1) **检查是否已有研究结果：**
   - 在跟踪器评论中搜索 "## Test Research:" 标题（`listComments`）
   - 如果找到 → 跳至阶段 3

2) **如果没有研究结果：**
   - 为 `ln-521` 计算确定性的子运行输入
   - 启动 `test-planning-worker-runtime`，并在委派前为 `child_run` 创建检查点
   - **通过托管工作器运行调用 `ln-521-test-researcher`**
   - 传入：故事 ID
   - 等待运行完成
   - 仅读取生成的 `test-planning-worker` 工件
   - 验证研究评论已创建

### 阶段 3：手动测试委派

> **简化模式门控：**
> - 如果存在 `--simplified` 标志：跳过阶段 3（手动测试）。继续执行阶段 4。

1) **检查手动测试是否已完成：**
   - 在跟踪器评论中搜索 "## Manual Testing Results" 标题（`listComments`）
   - 如果找到且所有 AC 均已通过 → 跳至阶段 4

2) **如果需要手动测试：**
   - 为 `ln-522` 计算确定性的子运行输入
   - 启动 `test-planning-worker-runtime`，并在委派前为 `child_run` 创建检查点
   - **通过托管工作器运行调用 `ln-522-manual-tester`**
   - 传入：故事 ID
   - 等待运行完成
   - 仅读取生成的 `test-planning-worker` 工件
   - 验证结果评论已创建

3) **如果有任何 AC 失败：**
   - 停止流水线
   - 向 ln-500 报告："Manual testing failed, Story needs fixes"

### 阶段 4：自动测试规划委派

1) **调用自动测试规划器：**
   - 为 `ln-523` 计算确定性的子运行输入
   - 启动 `test-planning-worker-runtime`，并在委派前为 `child_run` 创建检查点
   - **通过托管工作器运行调用 `ln-523-auto-test-planner`**
   - 传入：故事 ID
   - 等待运行完成
   - 仅读取生成的 `test-planning-worker` 工件

2) **验证结果：**
   - 已通过配置的跟踪器提供程序创建测试任务（如果已存在，则已更新）
   - 将任务 URL 返回给 ln-500

### 阶段 5：向调用方报告

1) 向 ln-500 返回摘要：
   - 研究：已完成 / 已跳过（已存在）
   - 手动测试：通过 / 失败
   - 测试任务：已创建 / 已更新 + URL

### 运行时摘要工件

**必须阅读：** 加载 `references/coordinator_summary_contract.md`

完成前写入 `.hex-skills/runtime-artifacts/runs/{run_id}/story-tests/{story_id}.json`。

## 工作器调用（强制）

**宿主 Skill 调用：** 必须使用 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按照所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用 Skill 中找到指定 Skill，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该 Skill 工作流，然后携带其结果/工件返回此处。
- 不得内联工作器逻辑，也不得在未执行目标 Skill 的情况下将工作器标记为已完成。

> **关键要求：** 所有委派均使用带有 `subagent_type: "general-purpose"` 的 Agent 工具进行上下文隔离，但每次托管工作器运行都必须先通过 `test-planning-worker-runtime` 进行准备。

| 阶段 | 工作器 | 用途 |
|-------|--------|---------|
| 2 | ln-521-test-researcher | 由运行时支持的托管 Agent 调用；工件是唯一的完成信号 |
| 3 | ln-522-manual-tester | 由运行时支持的托管 Agent 调用；工件是唯一的完成信号 |
| 4 | ln-523-auto-test-planner | 由运行时支持的托管 Agent 调用；工件是唯一的完成信号 |

**提示词模板：**
```text
Agent(description: "[Phase N] test planning via ln-52X",
     prompt: "Execute test planning worker.

Step 1: Start worker runtime:
  node references/scripts/test-planning-worker-runtime/cli.mjs start --skill {worker} --story {storyId} --manifest-file .hex-skills/test-planning/{worker}--{storyId}_manifest.json --run-id {childRunId} --summary-artifact-path .hex-skills/runtime-artifacts/runs/{parent_run_id}/test-planning-worker/{worker}--{storyId}.json

Step 2: Checkpoint child metadata:
  node references/scripts/test-planning-runtime/cli.mjs checkpoint --story {storyId} --phase PHASE_N --payload '{\"child_run\":{\"worker\":\"{worker}\",\"run_id\":\"{childRunId}\",\"summary_artifact_path\":\".hex-skills/runtime-artifacts/runs/{parent_run_id}/test-planning-worker/{worker}--{storyId}.json\"}}'

Step 3: Invoke worker:
  Skill(skill: \"ln-52X-{worker}\", args: \"{storyId} --run-id {childRunId} --summary-artifact-path .hex-skills/runtime-artifacts/runs/{parent_run_id}/test-planning-worker/{worker}--{storyId}.json\")

CONTEXT:
Story: {storyId}",
     subagent_type: "general-purpose")
```

**反模式：**
- ❌ 未启动子运行时并执行 `child_run` 检查点，就直接调用 Agent
- ❌ 直接运行网页搜索（委托给 ln-521）
- ❌ 直接创建 bash 测试脚本（委托给 ln-522）
- ❌ 直接创建测试任务（委托给 ln-523）
- ❌ 无正当理由跳过任何阶段

## TodoWrite 格式（必需）

```
- Resolve Story and prerequisites (pending)
- Check or reuse research state (pending)
- Start ln-521 child runtime, checkpoint metadata, or skip deterministically (pending)
- Check or reuse manual testing state (pending)
- Start ln-522 child runtime, checkpoint metadata, or skip deterministically (pending)
- Start ln-523 child runtime, checkpoint metadata, and verify test-task result (pending)
- Write story-tests summary artifact (pending)
- Report final planning outcome (pending)
```

## 关键规则

- **禁止直接执行工作：** 编排器只负责委托，绝不自行执行任务
- **顺序执行：** 521 → 522 → 523（每个阶段都依赖前一阶段）
- **快速失败：** 如果手动测试失败，则停止流水线并报告
- **跳过检测：** 调用工作器之前，检查是否存在已有评论
- **单一职责：** 每个工作器只专注做好一件事
- 每个受管理的工作器运行都必须先通过 `test-planning-worker-runtime` 启动，然后 Agent 包装器才能调用该工作器。

## 完成定义

- [ ] Story ID 已验证
- [ ] 调研阶段：已调用 ln-521，或已找到现有评论
- [ ] 手动测试阶段：已调用 ln-522，或已找到现有结果
- [ ] 自动测试规划阶段：已调用 ln-523
- [ ] 每次调用受管理的工作器之前，都已启动子测试规划运行时并执行检查点
- [ ] 已通过配置的跟踪器提供程序创建/更新测试任务
- [ ] 已准备包含各阶段结果和测试任务 URL 的摘要
- [ ] 已将 Story 测试摘要产物写入共享位置

**输出：** 包含各阶段结果和测试任务 URL 的摘要

## 阶段 6：元分析

可选参考：仅当用户要求进行运行后元分析或采用协议格式的运行反思时，加载 `references/meta_analysis_protocol.md`。

技能类型：`planning-coordinator`。收到请求时，在所有阶段完成后运行。使用 `planning-coordinator` 格式输出到聊天中。

## 参考文件

- 执行者：`../ln-521-test-researcher/SKILL.md`、`../ln-522-manual-tester/SKILL.md`、`../ln-523-auto-test-planner/SKILL.md`
- 基于风险的测试：`references/risk_based_testing_guide.md`

---

**版本：** 4.0.0
**最后更新：** 2026-01-15