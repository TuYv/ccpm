---
name: edge-hint-extractor
description: Extract edge hints from daily market observations and news reactions, with optional LLM ideation, and output canonical hints.yaml for downstream concept synthesis and auto detection.
---
# Edge Hint Extractor

## 概述

将原始观测信号（`market_summary`、`anomalies`、`news reactions`）转换为结构化的 edge hint。
该技能是拆分工作流中的第一阶段：`observe -> abstract -> design -> pipeline`。

## 适用场景

- 你希望将每日市场观测转化为可复用的提示对象。
- 你希望 LLM 生成的想法受当前异常/新闻上下文的约束。
- 你需要一份干净的 `hints.yaml` 输入，用于概念合成或自动检测。

## 前置条件

- Python 3.9+
- `PyYAML`
- 来自检测器运行的可选输入：
  - `market_summary.json`
  - `anomalies.json`
  - `news_reactions.csv` 或 `news_reactions.json`

## 输出

- `hints.yaml`，其中包含：
  - `hints` 列表
  - 生成元数据
  - 规则/LLM 提示数量统计

## 工作流

1. 收集观测文件（`market_summary`、`anomalies`、可选的新闻反应）。
2. 运行 `scripts/build_hints.py` 生成确定性提示。
3. 可选择通过以下两种方法之一，用 LLM 想法来增强提示：
   - a. `--llm-ideas-cmd` —— 将数据通过管道传给外部 LLM CLI（子进程）。
   - b. `--llm-ideas-file PATH` —— 从 YAML 文件加载预先编写好的提示（适用于由 Claude 自身生成提示的 Claude Code 工作流）。
4. 将 `hints.yaml` 传入概念合成或自动检测。

注意：`--llm-ideas-cmd` 与 `--llm-ideas-file` 互斥。

## 快速命令

仅基于规则（默认输出到 `reports/edge_hint_extractor/hints.yaml`）：

```bash
python3 skills/edge-hint-extractor/scripts/build_hints.py \
  --market-summary /tmp/edge-auto/market_summary.json \
  --anomalies /tmp/edge-auto/anomalies.json \
  --news-reactions /tmp/news_reactions.csv \
  --as-of 2026-02-20 \
  --output-dir reports/
```

规则 + LLM 增强（外部 CLI）：

```bash
python3 skills/edge-hint-extractor/scripts/build_hints.py \
  --market-summary /tmp/edge-auto/market_summary.json \
  --anomalies /tmp/edge-auto/anomalies.json \
  --llm-ideas-cmd "python3 /path/to/llm_ideas_cli.py" \
  --output-dir reports/
```

规则 + LLM 增强（预先编写的文件，适用于 Claude Code）：

```bash
python3 skills/edge-hint-extractor/scripts/build_hints.py \
  --market-summary /tmp/edge-auto/market_summary.json \
  --anomalies /tmp/edge-auto/anomalies.json \
  --llm-ideas-file /tmp/llm_hints.yaml \
  --output-dir reports/
```

## 资源

- `skills/edge-hint-extractor/scripts/build_hints.py`
- `references/hints_schema.md`
