---
name: "agent-designer"
description: "Use when the user asks to design a multi-agent system, pick an orchestration pattern (supervisor/swarm/pipeline), generate tool schemas for agents, or evaluate agent execution logs for cost, latency, and failure bottlenecks. Examples: 'design an agent architecture for research automation', 'generate Anthropic tool schemas from these tool descriptions', 'analyze these agent run logs for bottlenecks'. NOT for Claude Code workflow files (use workflow-builder) or single-agent prompt design (use agent-workflow-designer)."
---
# Agent Designer — 多智能体系统架构

使用三个确定性工具设计、生成模式并评估多智能体系统。这些脚本即工作流——当规划器能够根据需求对架构进行评分时，不要凭空设计架构。

## 何时使用

- 根据需求设计新的多智能体系统（模式选择、角色、通信）
- 根据纯文本工具描述生成适用于提供商的工具模式（Anthropic + OpenAI 格式）
- 评估执行日志：成功率、延迟分布、成本、瓶颈

**不应使用的场景：** Claude Code Workflow 工具自动化 → `workflow-builder`；单智能体工作流脚手架 → `agent-workflow-designer`；运行时多智能体扇出 → `agenthub`。

## 模式决策表

| 选择 | 适用场景 | 注意事项 |
|---|---|---|
| 单智能体 | 一个边界明确的任务，工具少于约 5 个 | 不要添加不需要的智能体 |
| 监督者 | 集中式任务分解，专家智能体汇报结果 | 监督者会成为瓶颈 |
| 流水线 | 阶段严格按顺序执行并进行交接 | 顺序僵化；最慢的阶段会限制吞吐量 |
| 分层式 | 多个组织层级，智能体超过约 8 个 | 每个层级都会产生通信开销 |
| 群体式 | 对等智能体并行协作，容错性优先于可预测性 | 难以调试；需要共识规则 |

规划器会以确定性方式应用此评分——请运行规划器，而不是凭感觉选择。

## 工作流

所有路径均相对于此技能文件夹。每一步的 JSON 输出都是下一步的设计输入。

### 1. 设计架构

编写需求 JSON（复制 `assets/sample_system_requirements.json`——键包括：`goal`、`tasks[]`、`constraints{max_response_time, budget_per_task, concurrent_tasks}`、`team_size`）：

```bash
python3 agent_planner.py requirements.json --format json -o arch
```

生成 `arch.json`，其中包含 `architecture_design`（模式、智能体、通信链路）、`mermaid_diagram` 和 `implementation_roadmap`。读取 `architecture_design.pattern` 和每个智能体的角色列表；向用户展示 Mermaid 图。

### 2. 生成工具模式

使用纯 JSON 描述每个智能体的工具（复制 `assets/sample_tool_descriptions.json`），然后运行：

```bash
python3 tool_schema_generator.py tool_descriptions.json --validate -o tools
```

生成 `tools.json`（`tool_schemas`、`validation_summary`），以及特定于提供商的 `tools_anthropic.json` / `tools_openai.json`。**门禁条件：每个工具都必须输出 `✓ Valid`。** 在继续之前修复所有无效模式——绝不要向智能体提供未经验证的模式。

### 3. 评估执行日志

系统开始运行后（或者使用 `assets/sample_execution_logs.json` 进行试运行）：

```bash
python3 agent_evaluator.py execution_logs.json --detailed -o eval
```

生成 `eval.json`，其中包含 `summary`、`agent_metrics`、`bottleneck_analysis`、`error_analysis`、`cost_breakdown`、`sla_compliance` 和 `optimization_recommendations`，以及拆分文件（`eval_errors.json`、`eval_recommendations.json`）。

### 4. 验证循环

在满足以下条件之前，设计尚未完成：

1. `tool_schema_generator.py --validate` 报告 0 个无效模式。
2. 在试运行中，`agent_evaluator.py` 报告 **0 个严重问题**（发现严重问题时，该工具会输出 `CRITICAL: N critical issues`）。如果 N > 0，请应用 `eval_recommendations.json` 中的首要建议，重新运行试点并再次评估。
3. 将输出与 `expected_outputs/` 进行比较，以确认正在使用的模式结构没有发生偏移。

## 参考资料

- `references/agent_architecture_patterns.md` — 深入分析各类模式的权衡
- `references/tool_design_best_practices.md` — 模式定义、幂等性与错误处理规则
- `references/evaluation_methodology.md` — 评估器所实现的指标定义