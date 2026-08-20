---
name: ln-316-review-refinement-worker
description: "Use when an evaluation run requires bounded iterative refinement with trace and cleanup evidence."
license: MIT
---
> **路径：** 文件路径（`references/`、`../ln-*`）均相对于此技能目录。

**类型：** L3 工作器
**类别：** 3XX 规划

# 审查优化工作器

## 必读内容

**必读：** 加载 `references/evaluation_worker_runtime_contract.md`、`references/evaluation_summary_contract.md`、`references/refinement_trace_contract.md`、`references/cleanup_evidence_contract.md`
**必读：** 加载 `references/agents/prompt_templates/iterative_refinement.md`、`references/agents/prompt_templates/refinement_perspectives.md`
**必读：** 加载 `references/monitor_integration_pattern.md`、`references/agent_review_workflow.md`（步骤：迭代优化）

## 目的

- 合并后，通过 `agent_runner.mjs` 使用非宿主顾问代理运行两阶段优化
- 阶段 1：3 个并行且相互独立的顾问会话（dry_run_executor、new_dev_tester、adversarial_reviewer）
- 阶段 2：合并阶段 1 的结果后，运行 1 个顺序顾问会话（final_sweep）
- 记录每个顾问会话的优化追踪和清理证据

**关键要求：优化阶段从外部启动顾问。此阶段不得使用宿主原生子代理。**

## 运行时

运行时系列：
- `evaluation-worker-runtime`

必需的清单字段：
- `identifier`
- `phase_order`
- `summary_kind=review-refinement`
- `operation=refinement`

推荐的 `phase_order`：
1. `PHASE_0_CONFIG`
2. `PHASE_1_STAGE1_PARALLEL`
3. `PHASE_2_STAGE2_FINAL_SWEEP`
4. `PHASE_3_WRITE_SUMMARY`
5. `PHASE_4_SELF_CHECK`

## 优化状态机

### 关键要求：独立会话

每个视角都必须通过单独调用一次 `node agent_runner.mjs --agent {advisor_agent}` 来处理。
不得将多个视角合并到同一个顾问提示词或会话中。
每个 iter{N}/ 子目录 = 一个拥有独立 PID 的顾问进程。

### 视角分类

| 阶段 | 视角 | 执行方式 | 目的 |
|-------|------------|-----------|---------|
| 1 | `dry_run_executor` | 并行 | 发现无法执行的步骤和顺序错误 |
| 1 | `new_dev_tester` | 并行 | 发现隐性知识缺口和未定义的术语 |
| 1 | `adversarial_reviewer` | 并行 | 发现必然失败和静默损坏问题 |
| 2 | `final_sweep` | 合并后 | 发现阶段 1 修复所引入的回归和偏移 |

所有 4 个视角均为必选。这里不包括 `generic_quality`——它已由阶段 2 的顾问审查（`review_base.md` + 模式模板）覆盖。

### 阶段 1：并行专项审查

1. **构建产物：** 读取被审查产物（故事+任务/计划文件/上下文文档）的当前状态。
2. **并行处理以下 3 个视角中的每一个：**
   a. 从 `refinement_perspectives.md` 加载与视角名称匹配的视角。
   b. 构建提示词：填充 `iterative_refinement.md` 占位符（`{artifact_type}`、`{artifact_content}`、`{project_context}`、`{review_perspective}`、`{iteration_number}`、`{max_iterations}`、`{previous_findings_summary}`）。
   c. 将提示词保存至 `.hex-skills/agent-review/refinement/{identifier}/iter{N}/prompt.md`
      - iter1/ = dry_run_executor
      - iter2/ = new_dev_tester
      - iter3/ = adversarial_reviewer
   d. 启动独立的顾问进程：
      ```
      node references/agents/agent_runner.mjs --agent {advisor_agent} \
        --prompt-file .hex-skills/agent-review/refinement/{identifier}/iter{N}/prompt.md \
        --output-file .hex-skills/agent-review/refinement/{identifier}/iter{N}/result.md \
        --cwd {project_dir}
      ```
3. 通过运行时 `sync-agent` **等待所有 3 个进程**；Claude 宿主可以使用 `Monitor` 实现可观测性（参见下方的等待部分）。
4. **解析结果：** 从每个已完成会话的 `## Structured Data` 部分提取 JSON。
5. **合并发现项：** 按（区域、问题）去重，保留置信度较高的项。
6. **分类：** 高（impact_percent >= 20%）、中（10-19%）、低（< 10%）。
7. 对每项被接受的修复应用**架构门禁**：“这是否直接实现了正确的架构，且未使用向后兼容垫片？”
8. **应用被接受的修复。**
9. **终止所有 3 个进程：** 对每个会话执行 `node agent_runner.mjs --verify-dead {pid}`。在 Windows 上为强制要求。
10. 按照 `cleanup_evidence_contract.md` 为每个会话**记录清理证据**。
11. 为阶段 2 **构建 `{previous_findings_summary}`**。

如果全部 3 个顾问会话都失败 → EXIT(ERROR)，跳过阶段 2。
如果部分失败 → 使用可用结果继续，并记录部分错误。

### 阶段 2：最终检查

1. **构建产物：** 读取阶段 1 修复后的状态。
2. **加载 `final_sweep`**：从 `refinement_perspectives.md` 加载该视角。
3. **构建提示词**：使用阶段 1 中的 `{previous_findings_summary}`。
4. **保存提示词**：保存到 `.hex-skills/agent-review/refinement/{identifier}/iter4/prompt.md`。
5. **启动顾问**（单个独立会话）。
6. **等待**：通过运行时 `sync-agent` 等待；Claude 宿主可使用 `Monitor` 进行可观测性监控。
7. **解析结果，** 应用所有接受的修复（每项都需经过架构门禁）。
8. **终止进程，** 记录清理证据。

### 等待顾问结果（强制）

在解析或执行合并门禁之前，使用当前运行时的 `sync-agent` 命令。`Monitor` 仅用于可选的 Claude Code 可观测性监控。

对于每个已启动的顾问进程：

在 Claude Code 下运行时，可选的可观测性监控：
```
Monitor(command="tail -f {agent_log} | grep --line-buffered -E 'Phase|ERROR|DONE'", timeout_ms=120000, description="advisor refinement {perspective_name}")
```

每次同步/监控周期结束后：
- 检查结果文件中是否存在 `<!-- END_AGENT_REVIEW_RESULT -->` 标记。
- 存在标记 → 解析结果并继续。
- 不存在标记，但日志仍在增长 → 继续执行运行时同步或可选的监控周期。
- 不存在标记，且日志停滞超过 3 分钟 → 执行存活性协议（参见 `agent_review_workflow.md`）。

不要使用 `sleep` 或手动状态轮询作为主要等待机制。

### 进程清理

每次顾问调用后（两个阶段均适用）：
1. 从运行器标准输出或元数据中提取 `pid`。
2. 运行 `node references/agents/agent_runner.mjs --verify-dead {pid}`。
3. 按照 `cleanup_evidence_contract.md` 记录清理证据。
4. 如果未终止，CLI 顾问进程可能会在 Windows 上不断累积。

### 退出状态

| 状态 | 含义 |
|-------|---------|
| `COMPLETED` | 两个阶段均已完成，所有结果均已合并 |
| `PARTIAL_ERROR` | 阶段 1 存在失败，但阶段 2 已完成 |
| `ERROR` | 阶段 1 的所有顾问会话均失败（跳过阶段 2） |
| `SKIPPED` | 健康检查中没有可用的顾问 |

## 摘要

输出 `summary_kind=review-refinement`。

载荷必须包括：
- `worker=ln-316`
- `status`
- `operation=refinement`
- `warnings`

优先包含以下字段：
- `stages_completed`（整数：1 或 2）
- `exit_reason`（枚举：`COMPLETED`、`PARTIAL_ERROR`、`ERROR`、`SKIPPED`）
- `applied`（整数：所有阶段中已应用建议的总数）
- `architecture_gate_rejections`（计数）
- `stage1_perspectives`（已完成视角名称的列表）
- `stage1_failed`（失败视角名称的列表）
- `metadata.refinement_trace`

## 完成定义

- [ ] 阶段 1：全部 3 个顾问会话均已并行启动
- [ ] 阶段 2：在阶段 1 合并后启动 final_sweep
- [ ] 所有顾问均通过 `agent_runner.mjs` 启动（而非宿主原生子代理）
- [ ] 使用运行时 `sync-agent` 等待；Claude Monitor 是可选的可观测性监控
- [ ] 按照 `refinement_trace_contract.md` 记录优化跟踪信息
- [ ] 记录所有已启动进程的清理证据
- [ ] 写入 `review-refinement` 摘要
- [ ] 自检通过

**版本：** 2.0.0
**最后更新：** 2026-04-13