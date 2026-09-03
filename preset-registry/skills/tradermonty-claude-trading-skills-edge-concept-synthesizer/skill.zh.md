---
name: edge-concept-synthesizer
description: Abstract detector tickets and hints into reusable edge concepts with thesis, invalidation signals, and strategy playbooks before strategy design/export.
---
# Edge 概念合成器

## 概述

在检测与策略实现之间创建一个抽象层。
该技能对 ticket 证据进行聚类，总结重复出现的条件，并输出包含明确论点（thesis）与失效（invalidation）逻辑的 `edge_concepts.yaml`。

## 何时使用

- 你有大量原始 ticket，需要机制层面的结构化整理。
- 你想避免从 ticket 直接映射到策略所导致的过拟合。
- 你需要在起草策略之前进行概念层面的评审。

## 前置条件

- Python 3.9+
- `PyYAML`
- 来自检测器输出的 ticket YAML 目录（`tickets/exportable`、`tickets/research_only`）
- 可选的 `hints.yaml`

## 输出

- `edge_concepts.yaml`，其中包含：
  - 概念簇
  - 支持度统计
  - 抽象论点
  - 失效信号
  - 可导出就绪标志

## 工作流程

1. 从自动检测输出中收集 ticket YAML 文件。
2. 可选地提供 `hints.yaml` 用于上下文匹配。
3. 运行 `scripts/synthesize_edge_concepts.py`。
4. 概念去重：合并假设相同且条件存在重叠的概念（包含度 > 阈值）。
5. 评审概念，仅将高支持度的概念提升进入策略起草阶段。

## 快捷命令

```bash
python3 skills/edge-concept-synthesizer/scripts/synthesize_edge_concepts.py \
  --tickets-dir /tmp/edge-auto/tickets \
  --hints /tmp/edge-hints/hints.yaml \
  --output /tmp/edge-concepts/edge_concepts.yaml \
  --min-ticket-support 2

# With hint promotion and synthetic cap
python3 skills/edge-concept-synthesizer/scripts/synthesize_edge_concepts.py \
  --tickets-dir /tmp/edge-auto/tickets \
  --hints /tmp/edge-hints/hints.yaml \
  --output /tmp/edge-concepts/edge_concepts.yaml \
  --promote-hints \
  --max-synthetic-ratio 1.5

# With custom dedup threshold (or disable dedup)
python3 skills/edge-concept-synthesizer/scripts/synthesize_edge_concepts.py \
  --tickets-dir /tmp/edge-auto/tickets \
  --output /tmp/edge-concepts/edge_concepts.yaml \
  --overlap-threshold 0.6

python3 skills/edge-concept-synthesizer/scripts/synthesize_edge_concepts.py \
  --tickets-dir /tmp/edge-auto/tickets \
  --output /tmp/edge-concepts/edge_concepts.yaml \
  --no-dedup
```

## 资源

- `skills/edge-concept-synthesizer/scripts/synthesize_edge_concepts.py`
- `references/concept_schema.md`
