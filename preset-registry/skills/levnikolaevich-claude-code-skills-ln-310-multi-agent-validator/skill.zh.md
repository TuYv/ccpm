---
name: ln-310-multi-agent-validator
description: "Use when validating Stories, plans, or tasks through the evaluation platform with mandatory research, parallel evidence lanes, sequential merge, and bounded refinement. Modes: story | plan_review."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L2 协调器
**类别：** 3XX 规划

# 多智能体验证器

用于以下模式的评估平台协调器：
- `mode=story`
- `mode=plan_review`

此技能使用评估平台来执行：
- 强制性的官方文档、MCP Ref、Context7 和当前 Web 研究
- 并行只读证据通道
- 顺序执行的文档编制、修复、合并、优化和审批
- 由运行时支持的工作器计划、工作器摘要、智能体同步和清理验证

## 输入

| 输入 | 必需条件 | 来源 | 描述 |
|-------|----------|--------|-------------|
| `storyId` | `mode=story` | 参数、git 分支、看板、用户 | 要验证的 Story |
| `plan {file}` | `mode=plan_review` | 参数或自动检测 | 要验证的计划文件 |

模式检测：
- `plan` 或 `plan {file}` -> `mode=plan_review`
- 否则 -> `mode=story`

## 强制阅读

**强制阅读：** 加载 `references/environment_state_contract.md`、`references/storage_mode_detection.md`、`references/input_resolution_pattern.md`
**强制阅读：** 加载 `references/evaluation_coordinator_runtime_contract.md`、`references/evaluation_summary_contract.md`、`references/evaluation_parallelism_policy.md`、`references/evaluation_research_contract.md`
**强制阅读：** 加载 `references/agent_delegation_pattern.md`
**强制阅读：** 加载 `references/penalty_points.md`
**强制阅读：** 当 researchgraph 文件发生更改，或目标声称假设、目标、基准或提案已就绪时，加载 `references/researchgraph_mcp_usage.md`。
条件性阅读：仅当协调器执行内联标准映射，而不是使用 ln-312 调查结果摘要时，才加载 `references/phase2_research_audit.md`。

智能体审查策略：运行健康检查；当没有可用顾问时，记录跳过原因；合并前验证每一项顾问声明；将传输、身份验证或工具故障视为操作层面的证据，而不是领域调查结果。仅当需要调试评估运行时之外的生命周期或存活状态细节时，才加载 `references/agent_review_workflow.md`。

## 工作器集合

协调器使用以下评估工作器：
- `ln-311-review-research-worker`
- `ln-312-review-findings-worker`
- `ln-313-review-docs-worker`
- `ln-314-review-repair-worker`
- `ln-315-review-merge-worker`
- `ln-316-review-refinement-worker`

## 工作器调用（强制）

**宿主技能调用：** 必须使用 `Skill(skill: "...", args: "...")` 进行委派。
- Claude：严格按所示方式调用 Skill 工具。
- Codex：如果不存在 Skill 工具，则在可用技能中找到指定技能，读取其 `SKILL.md`，将 `args` 视为 `$ARGUMENTS`，执行该技能的工作流，然后携带其结果或产物返回此处。
- 不得内联工作器逻辑，也不得在未执行目标技能的情况下将工作器标记为已完成。

使用 Skill 工具调用委派的工作器。不要在协调器内内联工作器逻辑。

TodoWrite 格式（强制）：
- `Resolve target and build runtime manifest`
- `Load target artifacts and metadata`
- `Launch external agents and verify health`
- `Run research and findings workers in parallel`
- `Generate documentation updates`
- `Apply accepted low-risk repairs`
- `Sync agents and merge all evidence`
- `Run refinement (MANDATORY in ALL modes when advisor available — do NOT skip)`
- `Compute verdict and write review output`
- `Verify runtime cleanup and self-check`

代表性调用：

```text
Skill(skill: "ln-311-review-research-worker", args: "{identifier} research")
Skill(skill: "ln-312-review-findings-worker", args: "{identifier} findings")
Skill(skill: "ln-313-review-docs-worker", args: "{identifier} docs")
Skill(skill: "ln-314-review-repair-worker", args: "{identifier} repair")
Skill(skill: "ln-315-review-merge-worker", args: "{identifier} merge")
Skill(skill: "ln-316-review-refinement-worker", args: "{identifier} refinement")
```

## 运行时契约

**强制阅读：** 加载 `references/loop_health_contract.md`

运行时系列：
- `evaluation-runtime`

标识符：
- 故事模式使用 `story-{storyId}`
- 计划审查使用 `plan-{slug}`

阶段顺序：
1. `PHASE_0_CONFIG`
2. `PHASE_1_DISCOVERY`
3. `PHASE_2_AGENT_LAUNCH`
4. `PHASE_3_EVIDENCE_LANES`
5. `PHASE_4_DOCS`
6. `PHASE_5_REPAIR`
7. `PHASE_6_MERGE`
8. `PHASE_7_REFINEMENT`
9. `PHASE_8_APPROVAL`
10. `PHASE_9_SELF_CHECK`

阶段策略：
- `delegate_phases = [PHASE_3_EVIDENCE_LANES, PHASE_4_DOCS, PHASE_5_REPAIR, PHASE_6_MERGE, PHASE_7_REFINEMENT]`
- `aggregate_phase = PHASE_6_MERGE`
- `report_phase = PHASE_8_APPROVAL`
- `cleanup_phase = PHASE_9_SELF_CHECK`
- `self_check_phase = PHASE_9_SELF_CHECK`
- `agent_resolve_before = [PHASE_6_MERGE]`
- `required_phases_when_advisor_available = [PHASE_7_REFINEMENT]`

## 并行规则

允许重叠执行：
- 外部代理
- `ln-311`
- `ln-312`
- 本地仓库检查和证据收集

仅限顺序执行：
- `ln-313`
- `ln-314`
- `ln-315`
- `ln-316`
- 审批和状态变更

## 工作流

### 阶段 0：配置

1. 解析 `mode`、标识符和存储模式。
2. 解析故事或计划目标。
3. 构建评估运行时清单，其中包含：
   - `expected_agents`
   - `required_research=true`
   - 准确的 `phase_order`
   - `phase_policy`
   - 报告路径
4. 启动运行时：

```bash
node references/scripts/evaluation-runtime/cli.mjs start \
  --skill ln-310 \
  --identifier {identifier} \
  --manifest-file .hex-skills/evaluation/{identifier}_manifest.json
```

5. 为阶段 0 创建检查点。

### 阶段 1：发现

1. 具体化准确的目标工件。
2. 仅加载当前模式所需的元数据。
3. 在 `mode=story` 中，解析故事及其子任务。
4. 在 `mode=plan_review` 中，解析计划文件。
5. 如果 researchgraph 文件发生了更改，或者目标引用了 `H##`、`G##`、运行 ID、基准清单或就绪性声明，则运行只读的 researchgraph 验证/审计，并将结果作为验证证据附加。
6. 使用解析后的引用为阶段 1 创建检查点。

### 阶段 2：代理启动

1. 运行代理健康检查。
2. 排除 `.hex-skills/environment_state.json` 中已禁用的代理。
3. 如果没有可用代理：
   - 记录 `agents_skipped_reason`
   - 为阶段 2 创建检查点
   - 继续
4. 否则：
   - 构建每个代理各自的提示词
   - 启动每个可用代理
   - 注册每个已启动的代理：

```bash
node references/scripts/evaluation-runtime/cli.mjs register-agent \
  --skill ln-310 \
  --identifier {identifier} \
  --agent {name} \
  --prompt-file {promptPath} \
  --result-file {resultPath} \
  --metadata-file {metadataPath}
```

5. 使用 `health_check_done`、`agents_available`、`agents_required` 和可选的 `agents_skipped_reason` 为阶段 2 创建检查点。
6. 在作出领域结论之前，对每个外部代理结果进行分类：
   - `rate_limited`、`tool_missing`、`auth_missing`、`permission_denial` 和 `asked_question` 属于传输/操作状态。
   - 如果制品或发现中没有领域证据，不要将它们转化为 `NO-GO`。
   - 对重复出现的顾问/会话失败记录循环健康状况，并在重试不再有意义时暂停。

### 阶段 3：证据通道

此阶段是强制性的并行证据关卡。

1. 构建 `worker_plan`，其中包含：
   - `ln-311` 通道 `research`（必需）
   - `ln-312` 通道 `findings`（必需）
2. 并行启动所有已规划的工作器。
3. 在这些工作器运行期间，继续检查本地仓库并收集更多证据。
4. 在适当时机同步代理，但在合并之前不要阻塞等待它们。
5. 使用以下命令记录每个工作器的摘要：

```bash
node references/scripts/evaluation-runtime/cli.mjs record-worker-result \
  --skill ln-310 \
  --identifier {identifier} \
  --payload-file {childSummaryArtifactPath}
```

每种模式都必须进行研究：
- 官方文档或标准
- MCP Ref
- 涉及库或框架时使用 Context7
- 当前的 Web 最佳实践研究

对于 `mode=story`，发现仍必须生成扣分点证据和覆盖率分析。

### 阶段 4：文档

1. 在 `mode=story` 中，当需要更改文档时，运行 `ln-313-review-docs-worker`。
2. 在 `mode=plan_review` 中，仅当没有需要创建的文档差异时才跳过。
3. 记录工作器摘要或明确的跳过理由。

### 阶段 5：修复

1. 通过 `ln-314-review-repair-worker` 应用已接受的低风险修复。
2. 不要将修复逻辑合并到研究或发现通道中。
3. 记录摘要以及所有清理证据。

### 阶段 6：合并

前置条件：
- 所有已规划的证据工作器均已处理完毕
- 所有必需的代理均已处理完毕或已明确跳过

步骤：
1. 在合并关卡同步一次代理：

```bash
node references/scripts/evaluation-runtime/cli.mjs sync-agent --skill ln-310 --identifier {identifier}
```

2. 运行 `ln-315-review-merge-worker`。
3. 对以下内容进行去重：
   - 本地发现
   - 工作器发现
   - 代理发现
   - 以往的审查历史
4. 拒绝没有证据支持的断言。
5. 仅应用经过验证且已接受的更改。
6. 使用 `aggregation_summary` 为阶段 6 创建检查点。

### 阶段 7：优化

> **绝不能跳过此阶段。** 阶段 7 适用于所有模式：`story`、`plan_review`。
> 唯一有效的跳过理由是健康检查中没有可用的顾问。
> 模式不是跳过理由。复杂度不是跳过理由。时间不是跳过理由。
> 如果顾问可用，而你即将在未运行 ln-316 的情况下为阶段 7 创建检查点——立即停止。你正在犯错。

| 模式 | 是否必须执行阶段 7？ | 是否允许跳过？ |
|------|-------------------|---------------|
| `story` | 是 | 否（仅当没有可用的顾问时例外） |
| `plan_review` | 是 | 否（仅当没有可用的顾问时例外） |

当顾问可用时，阶段 7 是**强制性的**。如果没有记录来自 ln-316 的 `review-refinement` 工作进程摘要，协调器**不得**为阶段 7 创建检查点。如果健康检查时顾问可用，但不存在优化摘要，运行时 `advance` 命令将拒绝该转换。

运行 `ln-316-review-refinement-worker`。优化采用两阶段状态机：
- 阶段 1：3 个并行顾问会话（dry_run_executor、new_dev_tester、adversarial_reviewer）
- 阶段 2：合并阶段 1 的结果后，运行 1 个串行顾问会话（final_sweep）

规则：
- 所有 4 个视角均为必需
- 阶段 1 并行运行，阶段 2 在合并阶段 1 后运行
- 每个视角 = 通过 `agent_runner.mjs` 启动的独立顾问进程（**不是**宿主原生子代理）
- 每个已启动的进程都必须提供清理证据
- 顾问会话失败使用 `agent_runner.mjs` 中的 `failure_class`、`progress_signals` 和 `session_usable`；分类为传输故障的失败应暂停/推迟，而不是转化为领域问题发现
- 优化跟踪记录为必需
- 通过运行时 `sync-agent` 等待顾问结果；Claude 宿主可使用 `Monitor` 进行可观测性监控

### 阶段 8：批准

Story 模式：
1. 根据合并后和优化后的状态计算最终门禁结果。
2. 最终评估模型：

| 指标 | 之前 | 之后 | 含义 |
|--------|--------|-------|---------|
| 罚分 | 来自 ln-312 | 来自 ln-314 | 0 = 全部已修复 |
| 就绪度评分 | `clamp(1,10,10-floor(before/5))` | `clamp(1,10,10-floor(after/5))` | 质量（1-10） |
| 反幻觉检查 | — | 来自 ln-311 | VERIFIED/FLAGGED |
| AC 覆盖率 | — | N/N | 100% = 通过 |
| 门禁 | — | GO/NO_GO | 最终结论 |

3. 门禁规则：
   - `GO` = `penalty_after=0` 且没有 `FLAGGED` 项，且 `ac_coverage=100%`
   - `NO_GO` = 其他所有情况
   - 覆盖率：80-99% = +3 罚分并强制设为 `NO_GO`
   - 覆盖率：<80% = +5 罚分并强制设为 `NO_GO`
4. 当结果为 `GO` 时：将 Story 状态变更为 `Todo`；将 `kanban_board.md` 更新为 `APPROVED`。
5. 状态转换失败时重试一次；如果仍然失败 → `NO_GO`。
6. 编写面向用户的审查输出，其中包含每项标准在修改前/修改后的罚分明细。

Plan 模式：
- 编写最终审查输出，但不执行工作流变更

编写协调器摘要：

```bash
node references/scripts/evaluation-runtime/cli.mjs record-summary \
  --skill ln-310 \
  --identifier {identifier} \
  --payload '{...evaluation-coordinator summary...}'
```

### 阶段 9：自检

必需检查项：
- [ ] 运行时已启动
- [ ] 发现检查点已存在
- [ ] 代理健康状态已记录
- [ ] 强制研究已完成
- [ ] 所有必需的工作进程摘要均已记录
- [ ] 合并前所有必需的代理均已完成处理
- [ ] 合并摘要已存在
- [ ] 当顾问可用时，优化跟踪记录已存在
- [ ] 后台清理证据已记录
- [ ] 清理已验证
- [ ] 协调器摘要已记录
- [ ] 最终结果已记录

然后：

```bash
node references/scripts/evaluation-runtime/cli.mjs complete --skill ln-310 --identifier {identifier}
```

## 摘要契约

协调器摘要类型：
- `evaluation-coordinator`

推荐的有效载荷字段：
- `status`
- `final_result`
- `report_path`
- `worker_count`
- `agent_count`
- `issues_total`
- `severity_counts`
- `warnings`
- `cleanup_verified`
- `research_completed`
- `penalty_before`
- `penalty_after`
- `readiness_score`
- `ac_coverage`
- `gate`（GO/NO_GO）
- `flagged_items`

## 完成定义

- [ ] 评估运行时已启动
- [ ] 强制研究已完成并记录
- [ ] 只读证据通道已并行执行
- [ ] 文档、修复、合并、优化和审批已按顺序执行
- [ ] 所有必需的工作器摘要均已记录
- [ ] 合并前所有必需的代理均已处理完毕
- [ ] 顾问可用时已执行优化；仅当健康检查中没有可用顾问时才标记为 SKIPPED
- [ ] 清理证据已记录并验证
- [ ] `evaluation-coordinator` 摘要已写入
- [ ] 运行时已成功完成

## 元分析

可选参考：仅当用户要求进行运行后元分析或按协议格式进行运行反思时，才加载 `references/meta_analysis_protocol.md`。

在协调器运行后收到请求时，根据协议第 7 节分析会话，并在最终审查结果中包含按协议格式生成的输出。

## 参考资料

- 运行时：`references/evaluation_coordinator_runtime_contract.md`、`references/evaluation_summary_contract.md`
- 研究：`references/evaluation_research_contract.md`、`references/research_tool_fallback.md`、`references/plan_review_pipeline.md`
- 并行机制：`references/evaluation_parallelism_policy.md`
- 工作器：`../ln-311-review-research-worker/SKILL.md`、`../ln-312-review-findings-worker/SKILL.md`、`../ln-313-review-docs-worker/SKILL.md`、`../ln-314-review-repair-worker/SKILL.md`、`../ln-315-review-merge-worker/SKILL.md`、`../ln-316-review-refinement-worker/SKILL.md`
- 验证标准：`references/phase2_research_audit.md`、`references/penalty_points.md`
- 辅助验证器参考资料：`references/cross_reference_validation.md`、`references/dependency_validation.md`、`references/domain_patterns.md`、`references/templates/mcp_ref_findings_template.md`、`references/premortem_validation.md`、`references/quality_validation.md`、`references/risk_validation.md`、`references/solution_validation.md`、`references/standards_validation.md`、`references/structural_validation.md`、`references/traceability_validation.md`、`references/workflow_validation.md`

---
**版本：** 8.0.0
**最后更新：** 2026-03-22