---
name: edge-strategy-designer
description: Convert abstract edge concepts into strategy draft variants and optional exportable ticket YAMLs for edge-candidate-agent export/validation.
---
# 边际策略设计器

## 概述

将概念层面的假设转化为具体的策略草案规格。
本技能位于概念合成之后、流水线导出校验之前。

## 何时使用

- 你已持有 `edge_concepts.yaml` 并需要策略候选。
- 你希望为每个概念生成多个变体（core/conservative/research-probe）。
- 你希望为接口 v1 系列生成可选的可导出票据文件。

## 前置条件

- Python 3.9+
- `PyYAML`
- 由概念合成的产物 `edge_concepts.yaml`

## 输出

- `strategy_drafts/*.yaml`
- `strategy_drafts/run_manifest.json`
- 可选的 `exportable_tickets/*.yaml`，供下游 `export_candidate.py` 使用

## 工作流程

1. 加载 `edge_concepts.yaml`。
2. 选择风险档位（`conservative`、`balanced`、`aggressive`）。
3. 为每个概念生成变体，并按假设类型进行退出校准。
4. 应用 `HYPOTHESIS_EXIT_OVERRIDES`，按假设类型（breakout、earnings_drift、panic_reversal 等）调整止损、盈亏比、时间止损与追踪止损。
5. 将盈亏比下限钳制在 `RR_FLOOR=1.5`，以防止 C5 评审失败。
6. 在适用时导出 v1 就绪的票据 YAML。
7. 将可导出票据移交给 `skills/edge-candidate-agent/scripts/export_candidate.py`。

## 快速命令

仅生成草案：

```bash
python3 skills/edge-strategy-designer/scripts/design_strategy_drafts.py \
  --concepts /tmp/edge-concepts/edge_concepts.yaml \
  --output-dir /tmp/strategy-drafts \
  --risk-profile balanced
```

生成草案 + 可导出票据：

```bash
python3 skills/edge-strategy-designer/scripts/design_strategy_drafts.py \
  --concepts /tmp/edge-concepts/edge_concepts.yaml \
  --output-dir /tmp/strategy-drafts \
  --exportable-tickets-dir /tmp/exportable-tickets \
  --risk-profile conservative
```

## 资源

- `skills/edge-strategy-designer/scripts/design_strategy_drafts.py`
- `references/strategy_draft_schema.md`
- `skills/edge-candidate-agent/scripts/export_candidate.py`
