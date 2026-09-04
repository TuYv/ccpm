---
name: edge-candidate-agent
description: Generate and prioritize US equity long-side edge research tickets from EOD observations, then export pipeline-ready candidate specs for trade-strategy-pipeline Phase I. Use when users ask to turn hypotheses/anomalies into reproducible research tickets, convert validated ideas into `strategy.yaml` + `metadata.json`, or preflight-check interface compatibility (`edge-finder-candidate/v1`) before running pipeline backtests.
---
# Edge Candidate Agent

## 概述

将每日市场观察转化为可复现的研究工单和与 Phase I 兼容的候选规格。
优先保证信号质量和接口兼容性，而非激进地扩张策略数量。
该技能可以独立端到端运行，但在拆分式工作流中，它主要承担最终的导出/验证环节。

## 何时使用

- 将市场观察、异常现象或假设转化为结构化的研究工单。
- 运行每日自动检测，从 EOD OHLCV 和可选提示中发现新的 edge 候选。
- 将已验证的工单导出为 `strategy.yaml` + `metadata.json`，供 `trade-strategy-pipeline` 的 Phase I 使用。
- 在流水线执行之前，为 `edge-finder-candidate/v1` 运行预检兼容性检查。

## 前置条件

- 已安装 `PyYAML` 的 Python 3.9+ 环境。
- 可访问目标 `trade-strategy-pipeline` 仓库，用于 schema/阶段验证。
- 通过 `--pipeline-root` 运行由流水线托管的验证时，需确保 `uv` 可用。

## 输出

- `strategies/<candidate_id>/strategy.yaml`：与 Phase I 兼容的策略规格。
- `strategies/<candidate_id>/metadata.json`：溯源元数据，包含接口版本和工单上下文。
- 来自 `scripts/validate_candidate.py` 的验证状态（通过/失败 + 原因）。
- 每日检测产物：
  - `daily_report.md`
  - `market_summary.json`
  - `anomalies.json`
  - `watchlist.csv`
  - `tickets/exportable/*.yaml`
  - `tickets/research_only/*.yaml`

## 在拆分式工作流中的位置

推荐的拆分式工作流：

1. `skills/edge-hint-extractor`：观察/新闻 -> `hints.yaml`
2. `skills/edge-concept-synthesizer`：工单/提示 -> `edge_concepts.yaml`
3. `skills/edge-strategy-designer`：概念 -> `strategy_drafts` + 可导出工单 YAML
4. `skills/edge-candidate-agent`（本技能）：导出 + 验证，用于向流水线交接

## 工作流

1. 从 EOD OHLCV 运行自动检测：
   - `skills/edge-candidate-agent/scripts/auto_detect_candidates.py`
   - 可选：`--hints`，用于人工构思输入
   - 可选：`--llm-ideas-cmd`，用于外部 LLM 构思循环
2. 加载契约和映射参考文档：
   - `references/pipeline_if_v1.md`
   - `references/signal_mapping.md`
   - `references/research_ticket_schema.md`
   - `references/ideation_loop.md`
3. 使用 `references/research_ticket_schema.md` 构建或更新研究工单。
4. 使用 `skills/edge-candidate-agent/scripts/export_candidate.py` 导出候选产物。
5. 使用 `skills/edge-candidate-agent/scripts/validate_candidate.py` 验证接口和 Phase I 约束。
6. 将候选目录移交给 `trade-strategy-pipeline`，并先运行 dry-run。

## 快速命令

每日自动检测（含可选的导出/验证）：

```bash
python3 skills/edge-candidate-agent/scripts/auto_detect_candidates.py \
  --ohlcv /path/to/ohlcv.parquet \
  --output-dir reports/edge_candidate_auto \
  --top-n 10 \
  --hints path/to/hints.yaml \
  --export-strategies-dir /path/to/trade-strategy-pipeline/strategies \
  --pipeline-root /path/to/trade-strategy-pipeline
```

从工单创建候选目录：

```bash
python3 skills/edge-candidate-agent/scripts/export_candidate.py \
  --ticket path/to/ticket.yaml \
  --strategies-dir /path/to/trade-strategy-pipeline/strategies
```

仅验证接口契约：

```bash
python3 skills/edge-candidate-agent/scripts/validate_candidate.py \
  --strategy /path/to/trade-strategy-pipeline/strategies/my_candidate_v1/strategy.yaml
```

同时验证接口契约和流水线 schema/阶段规则：

```bash
python3 skills/edge-candidate-agent/scripts/validate_candidate.py \
  --strategy /path/to/trade-strategy-pipeline/strategies/my_candidate_v1/strategy.yaml \
  --pipeline-root /path/to/trade-strategy-pipeline \
  --stage phase1
```

## 导出规则

- 保持 `validation.method: full_sample`。
- 保持 `validation.oos_ratio` 为省略或 `null`。
- 对于 v1，仅导出支持的入场族：
  - `pivot_breakout` 配合 `vcp_detection`
  - `gap_up_continuation` 配合 `gap_up_detection`
- 在工单备注中将不支持的假设族标记为仅限研究，而非导出候选。

## 护栏

- 拒绝违反 schema 边界（风险、出场、空条件）的候选。
- 当文件夹名与 `id` 不匹配时拒绝该候选。
- 要求元数据具备确定性，且包含 `interface_version: edge-finder-candidate/v1`。
- 在完整执行之前，在流水线中使用 `--dry-run`。

## 资源

### `skills/edge-candidate-agent/scripts/export_candidate.py`
从研究工单 YAML 生成 `strategies/<candidate_id>/strategy.yaml` 和 `metadata.json`。

### `skills/edge-candidate-agent/scripts/validate_candidate.py`
运行接口检查，并可针对 `trade-strategy-pipeline` 运行可选的 `StrategySpec`/`validate_spec` 检查。

### `skills/edge-candidate-agent/scripts/auto_detect_candidates.py`
从 EOD OHLCV 自动检测 edge 构想，生成可导出/研究用工单，并可选地自动导出/验证。

### `references/pipeline_if_v1.md`
`edge-finder-candidate/v1` 的精简集成契约。

### `references/signal_mapping.md`
将假设族映射到当前可导出的信号族。

### `references/research_ticket_schema.md`
`export_candidate.py` 所使用的工单 schema。

### `references/ideation_loop.md`
提示 schema 和外部 LLM 构思命令契约。
