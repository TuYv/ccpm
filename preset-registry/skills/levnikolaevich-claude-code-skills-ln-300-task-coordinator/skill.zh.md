---
name: ln-300-task-coordinator
description: "Analyzes Story and builds optimal task plan (1-8 tasks), then routes to create or replan. Use when Story needs task breakdown or replanning."
allowed-tools: Read, Grep, Glob, Bash, Skill, mcp__hex-graph__index_project, mcp__hex-graph__analyze_architecture, mcp__hex-graph__find_symbols, mcp__hex-graph__inspect_symbol, mcp__hex-research__verify_index, mcp__hex-research__find_hypotheses, mcp__hex-research__inspect_hypothesis, mcp__hex-research__inspect_goal, mcp__hex-research__audit_orphans, mcp__hex-research__analyze_proposed
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此 Skill 目录。

# 任务协调器

**类型：** L2 领域协调器
**类别：** 3XX 规划

由运行时支持的任务规划协调器。运行时负责就绪状态门控、暂停/恢复以及工作器结果跟踪。

**必须阅读：** 加载 `references/coordinator_runtime_contract.md`、`references/task_planning_runtime_contract.md`、`references/coordinator_summary_contract.md` 和 `references/task_plan_worker_runtime_contract.md`
**必须阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/problem_solving.md` 和 `references/creation_quality_checklist.md`
**必须阅读：** 当触发阶段 3 外部验证时，加载 `references/agent_delegation_pattern.md`
**必须阅读：** 当用户故事引用 H/G/run ID，或实现就绪状态取决于项目假设时，加载 `references/researchgraph_mcp_usage.md`。
工具策略：遵循宿主 AGENTS.md 中的 MCP 偏好；仅当宿主策略缺失或 MCP 行为不明确时，加载 `references/mcp_tool_preferences.md` 和 `references/mcp_integration_patterns.md`。

## 目的

- 一次性解析用户故事上下文
- 在检查现有任务之前构建理想的实现任务计划
- 运行确定性的就绪状态门控
- 检测 `CREATE`、`ADD` 或 `REPLAN`
- 委派给独立工作器

## 输入

| 参数 | 必需 | 描述 |
|-----------|----------|-------------|
| `storyId` | 是 | 要规划的用户故事 |
| `autoApprove` | 否 | 如果为 false，运行时可能暂停以等待就绪状态审批 |

## 运行时

运行时系列：`task-planning-runtime`

标识符：
- `story-{storyId}`

阶段：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_DECOMPOSE`
4. `PHASE_3_READINESS_GATE`
5. `PHASE_4_MODE_DETECTION`
6. `PHASE_5_DELEGATE`
7. `PHASE_6_VERIFY`
8. `PHASE_7_SELF_CHECK`

终止阶段：
- `DONE`
- `PAUSED`

协调器阶段产物：
- 验证后写入 `summary_kind=pipeline-stage`
- `ln-1000` 将此产物用作阶段 0 完成信号

## 阶段映射

### 阶段 1：发现

解析用户故事，并且仅收集任务规划所需的输入：
- 用户故事 AC
- 技术说明
- 上下文
- 项目架构和技术栈
- 任务提供方

不要在此处加载现有任务。仅在阶段 4 加载现有任务。

- 对于修改受支持语言的现有代码的用户故事，构建一次图上下文：
  - `index_project(path=project_root)`
  - `analyze_architecture(path=project_root, verbosity="minimal")`
  - 对用户故事 AC 或技术说明中提及的组件使用 `find_symbols` + `inspect_symbol`，但应尽可能先缩小 `path` 范围；如果符号发现结果被截断，则在据此进行规划之前，将范围细化到 `name + file` 或 `workspace_qualified_name`
- 在分解之前，使用图上下文确认实际受影响的模块和入口点
- 对于引用假设、目标或运行证据的用户故事，运行 `verify_index`，然后仅检查被引用的 `H##`/`G##` ID 或候选提案。
- 使用 `hex-research` 确认假设的实现状态、细化缺口和提案就绪状态；继续将 `hex-graph` 作为代码符号和模块边界的信息源。

检查点载荷：
- `discovery_ready`

### 阶段 2：分解

仅根据 AC 构建理想的任务计划。不要读取或引用现有任务。

操作顺序：

1. 构建 AC 到场景的可追溯性表格，包含以下列：AC | 参与者 | (1) 触发条件 | (2) 入口点 | (3) 发现机制 | (4) 使用上下文 | (5) 结果
2. 扫描入口点、发现机制和使用上下文单元格，识别可构建产物
3. 使用分段边界，按架构层对可构建产物进行分组：
   - **基础层：** 执行工作的内部逻辑、数据模型或服务（入口点调用的内容）
   - **调用层：** 入口点本身——参与者使用的具名机制
   - **知识层：** 使用上下文——参与者正确调用该机制所需了解的内容
   - **装配层：** 发现机制 + 集成——系统如何查找/加载该机制并连接各组件
4. 每个层级分组至少形成一个任务。除非任务非常小，否则单个任务不得跨越多个层级。
5. 存在图上下文时，使用它来：
   - 按实际模块或符号归属拆分任务，而不是按猜测的文件分组
   - 使依赖顺序与实际调用方、框架入口点和公共 API 保持一致
   - 使用图分析返回的真实模块/符号丰富受影响组件
6. 验证基础层优先的顺序以及任务数量为 1-8 个
7. 将可追溯性表格和层级分组保存到 `.hex-skills/task-planning/{identifier}_traceability.md`

规则：
- 仅限实现任务
- 1-8 个任务
- 此处不包含测试或重构任务
- 保持基础层优先的顺序
- 指定有意义的验证意图
- 仅基础设施任务无法满足要求某项内容实际*使用*该基础设施的 AC
- 调用层任务无法满足要求参与者*知道如何*使用该机制的 AC——这属于知识层产物
- 参见 creation_quality_checklist.md 中的 #17b、#17c、#17d

检查点载荷：
- `ideal_plan_summary`
- `traceability_table_path`

### 阶段 3：就绪门禁

在委派之前对计划进行评分。

#### 步骤 1：自评分

评分策略：
- `6-7` -> 继续
- `4-5` -> `PAUSED`，等待批准或改进
- `<4` -> 阻塞，直至计划得到修正

自检：当可追溯性表格的相应分段中包含可构建产物时，验证每个层级（基础层、调用层、知识层、装配层）是否至少有一个任务。

#### 步骤 2：有条件的外部可追溯性验证

仅当至少满足以下一个触发条件时运行此步骤：
- 就绪评分为 `4-5`
- 模式看起来不明确（`ADD` 与 `REPLAN`）
- AC 到任务的覆盖不完整
- 自评分后，任务边界或层级归属仍存在冲突

如果触发：
1. 运行代理健康检查：`node references/agents/agent_runner.mjs --health-check --json`
2. 如果顾问代理可用：
   a. 使用 `references/agents/prompt_templates/traceability_validator.md` 构建验证提示词
   b. 使用阶段 1 的发现结果和阶段 2 的输出填充占位符
   c. 将填充后的提示词保存到 `.hex-skills/task-planning/{identifier}_traceability_prompt.md`
   d. 通过 agent_runner.mjs 启动代理：

```bash
      node references/agents/agent_runner.mjs \
        --agent {advisor_agent} \
        --prompt-file .hex-skills/task-planning/{identifier}_traceability_prompt.md \
        --output-file .hex-skills/task-planning/{identifier}_traceability_result.json \
        --cwd {project_dir}
      ```

   e. 解析结果 JSON 以查找缺口
   f. 对于每个 MISSING 缺口：readiness_score -= 1
   g. 对于每个 BUNDLED 缺口：readiness_score -= 0.5
   h. 如果发现 MISSING 缺口：重新进入阶段 2。最多重新分解 1 次。
3. 如果没有可用的智能体：记录日志，并保留本地评分，但降低置信度。

如果未触发：
- 设置 `traceability_validation = self_check_only`
- 无需外部验证，继续推进

检查点载荷：
- `readiness_score`
- `readiness_findings`
- `traceability_validation` — 取值之一：`agent_validated`、`self_check_only`、`redecomposed`

### 阶段 4：模式检测

检测：
- `CREATE`
- `ADD`
- `REPLAN`

当模式不明确时暂停。

检查点载荷：
- `mode_detection`

### 阶段 5：委派

单次变更交接。仅委派给一个工作器：
- `ln-301-task-creator`
- `ln-302-task-replanner`

托管委派顺序：
1. 计算 `childRunId = {parent_run_id}--{worker}--{storyId}`。
2. 计算 `childSummaryArtifactPath = .hex-skills/runtime-artifacts/runs/{parent_run_id}/task-plan/{worker}--{storyId}.json`。
3. 在 `.hex-skills/task-planning/{worker}--{storyId}_manifest.json` 生成子清单。
4. 使用 `--run-id` 和 `--summary-artifact-path` 启动 `task-plan-worker-runtime`。
5. 在调用工作器之前，为 `child_run` 元数据创建检查点。
6. 通过 Skill 工具调用工作器，并传入两个传输输入。
7. 仅读取最终的 `task-plan` 工件，并通过运行时的 `record-plan` 记录该工件。

要传递给工作器的协调器上下文：

- `idealPlan`：阶段 2 中的完整理想计划
- `traceabilityTablePath`：已生成的可追溯性表路径
- `discoveryContext`：阶段 1 的发现
- 在 ADD 模式下：指定要创建哪些任务

### 阶段 6：验证

仅验证工作器结果及生成的任务集。除非验证证明工作器输出无效，否则不要重新进行分解。

**模板合规性门禁：**通过已配置的跟踪器提供程序获取每个已创建的任务（按照 `references/tracker_provider_contract.md`，使用 `getTask` 操作）。运行 `planning-runtime/lib/template-compliance.mjs` 中的 `validateTemplateCompliance(description, 'task')`。所有任务都必须通过（7 个部分且顺序正确）。在状态中记录 `template_compliance_passed`。如果缺少该记录，守卫将阻止 SELF_CHECK。

检查点载荷：
- `verification_summary`
- `final_result`
- `template_compliance_passed`

验证成功后，写入包含以下内容的阶段 0 协调器工件：
- `stage=0`
- `story_id`
- `status=completed`
- `final_result`
- `story_status`
- `readiness_score`
- `warnings`

### 阶段 7：自检

确认：
- 已覆盖所有阶段
- 已遵循就绪门禁
- 已记录工作器结果
- 已完成验证
- 已记录阶段 0 协调器工件

检查点载荷：
- `pass`
- `final_result`

## 待处理决策

以下情况使用运行时 `PAUSED + pending_decision`：
- `ADD` 与 `REPLAN` 之间存在歧义
- 分数为 `4-5` 时需要就绪审批
- 缺少关键 Story 上下文

## Worker 契约

Worker：
- 不知道 coordinator
- 不读取运行时状态
- 保持独立运行
- 托管运行必须同时提供 `runId` 和 `summaryArtifactPath`
- 返回共享的 `task-plan` 摘要信封，并在终止结果之前写入制品

预期摘要类型：
- `task-plan`

## Worker 调用（强制）

**宿主 Skill 调用：** 必须通过 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按照所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用 Skill 中找到指定 Skill，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该 Skill 工作流，然后携带其结果/制品返回此处。
- 不得内联 Worker 逻辑，也不得在未执行目标 Skill 的情况下将 Worker 标记为完成。

| 阶段 | Worker | 上下文 |
|-------|--------|---------|
| 5 | `ln-301-task-creator` | CREATE 或 ADD 路径 |
| 5 | `ln-302-task-replanner` | REPLAN 路径 |

```text
node references/scripts/task-plan-worker-runtime/cli.mjs start --skill {worker} --story {storyId} --manifest-file .hex-skills/task-planning/{worker}--{storyId}_manifest.json --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}
node references/scripts/task-planning-runtime/cli.mjs checkpoint --story {storyId} --phase PHASE_5_DELEGATE --payload '{"child_run":{"worker":"{worker}","run_id":"{childRunId}","summary_artifact_path":"{childSummaryArtifactPath}"}}'
Skill(skill: "{worker}", args: "{storyId} --ideal-plan {idealPlanJSON} --traceability {tablePath} --discovery {discoveryJSON} --run-id {childRunId} --summary-artifact-path {childSummaryArtifactPath}")
Read {childSummaryArtifactPath}
node references/scripts/task-planning-runtime/cli.mjs record-plan --story {storyId} --payload '{...task-plan summary...}'
```

## TodoWrite 格式（强制）

```text
- Phase 1: Discover Story context (pending)
- Phase 2: Build ideal task plan (pending)
- Phase 3: Run readiness gate (local score first, external validation only if triggered) (pending)
- Phase 4: Detect mode (pending)
- Phase 5: Start child runtime, checkpoint child metadata, and perform the single worker handoff (pending)
- Phase 6: Verify worker result (pending)
- Phase 7: Self-check (pending)
```

## 关键规则

- 在查看现有任务之前构建理想计划。
- 就绪门禁是委派就绪状态的唯一来源。
- 不要在此 Skill 中创建测试或重构任务。
- 不要仅在聊天中保存审批状态。
- 使用 Worker 摘要，而不是 Worker 的自由文本说明。
- 如果 Story 会影响现有代码且 hex-graph 可用，请在分解之前执行一次图发现。
- 使用图输出减少规划歧义；当存在符号或模块证据时，不要臆造受影响的组件。

## 完成定义

- [ ] 已使用 Story 范围的标识符启动运行时
- [ ] 已为发现结果创建检查点
- [ ] 已为理想计划创建检查点
- [ ] 已为就绪门禁创建检查点
- [ ] 已为模式检测创建检查点
- [ ] 已使用确定性的 `runId` 启动子 task-plan 运行时
- [ ] 已在委派前为子运行元数据创建检查点
- [ ] 已记录 task-plan Worker 摘要
- [ ] 已为验证结果创建检查点
- [ ] 所有已创建任务均已通过模板合规检查
- [ ] 已记录最终结果
- [ ] 自检已通过

## 元分析

可选参考：仅当用户要求进行运行后元分析或采用协议格式的运行反思时，加载 `references/meta_analysis_protocol.md`。

技能类型：`planning-coordinator`。收到请求时，在所有阶段完成后运行。使用协议格式输出到聊天中。

---
**版本：** 4.0.0
**最后更新：** 2026-02-03