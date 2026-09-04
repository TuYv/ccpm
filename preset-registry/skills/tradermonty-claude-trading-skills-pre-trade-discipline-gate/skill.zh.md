---
name: pre-trade-discipline-gate
description: Evaluate a local pre-trade checklist before manual order entry, blocking planless, oversized, revenge-risk, market-regime-blocked, or circuit-breaker-blocked entries while journaling the decision for trader-memory-core review.
---
# 交易前纪律闸门

## 概述

在计划中的手动订单提交到券商之前，评估其是否应该继续执行。该技能会读取本地检查清单，以及可选的市场状态（market-regime）、熔断（circuit-breaker）和 trader-memory-core 工件。它会生成一个 `pre_trade_discipline_decision` 工件，并且可以在不改变论点（thesis）评审日程的前提下，将该工件链接回相关的论点。

该闸门被有意设计为离线运行。它不会下单、撤单、调用券商 API，也不会获取行情数据。

## 何时使用

- 在提交任何手动入场订单之前立即使用
- 当候选对象已通过图表验证和仓位规模测算时
- 在近期出现亏损之后，用于避免冷却窗口期间的报复性交易
- 当工作流中存在上游的 `exposure_decision` 和 `circuit_breaker_decision` 时
- 当你希望检查清单的遵守情况在后续的 trader-memory-core 评审中可见时

## 前置条件

- Python 3.9+
- 一个包含候选级别检查清单答案的本地 JSON 或 YAML 答案文件
- 位于 `state/theses/` 下的可选 trader-memory-core 论点状态
- 来自 market-regime-daily / exposure-coach 的可选 `exposure_decision` JSON
- 来自 drawdown-circuit-breaker 的可选 `circuit_breaker_decision` JSON

## 工作流程

### 第 1 步：准备检查清单

创建一个包含候选答案的 JSON 或 YAML 文件。只有可执行的（actionable）手动订单意图会被闸门检查。观察名单和忽略类意图会被记录为 `NO_ACTIONABLE_ORDERS`。

```json
{
  "candidates": [
    {
      "symbol": "AAPL",
      "thesis_id": "th_aapl_gm_20260703_0001",
      "order_intent": "ENTRY_READY",
      "entry_in_written_plan": true,
      "stop_predefined": true,
      "size_within_plan": true,
      "planned_risk_dollars": 500,
      "actual_risk_dollars": 500,
      "notes": "Entry matches the journaled breakout plan."
    }
  ]
}
```

可执行的意图包括 `ENTRY_READY`、`ACTIONABLE`、`ACTIONABLE_DAY1` 和 `MANUAL_ORDER`。诸如 `WATCHLIST`、`DELAYED_EP_WATCH`、`PEAD_HANDOFF`、`IGNORE` 和 `REJECTED` 之类的不可执行意图会被记录，但不会生成下单许可。

### 第 2 步：运行闸门

```bash
python3 skills/pre-trade-discipline-gate/scripts/check_pre_trade_discipline.py \
  --answers-file state/manual-entry-checklist.json \
  --state-dir state/theses \
  --market-regime-decision reports/exposure_decision_latest.json \
  --circuit-breaker-decision reports/circuit_breaker_decision_latest.json \
  --output-dir reports/pre-trade-discipline \
  --journal-dir state/journal/pre-trade-discipline
```

为进行确定性测试或回填，可设置 `--as-of`：

```bash
python3 skills/pre-trade-discipline-gate/scripts/check_pre_trade_discipline.py \
  --answers-file state/manual-entry-checklist.json \
  --as-of 2026-07-03T12:00:00-04:00
```

### 第 3 步：解读决策

| 决策 | 含义 |
|---|---|
| `GO` | 所有可执行的手动订单候选均通过了检查清单和上游闸门 |
| `REVIEW_REQUIRED` | 输入缺失、无法识别，或日志记录失败；在完成审查之前不要下单 |
| `NO_GO` | 至少一个可执行候选违反了纪律规则 |
| `NO_ACTIONABLE_ORDERS` | 文件中不包含任何可执行的手动订单；不应提交任何订单 |

默认情况下，CLI 对每个有效决策都以 `0` 退出，仅在发生输入或运行时错误时以 `1` 退出。如果希望 shell 管道在任何非 `GO` 决策时返回 `2`，请使用 `--fail-on-non-go`。

## 规则

当出现以下情况时，闸门会拦截一个可执行候选：

- 入场未在书面计划中得到确认
- 止损未预先定义
- 仓位大小未确认为符合计划
- `actual_risk_dollars` 超过 `planned_risk_dollars`
- trader-memory-core 在报复窗口内记录到亏损退出或部分亏损
- exposure-coach 的建议为 `REDUCE_ONLY` 或 `CASH_PRIORITY`
- drawdown-circuit-breaker 的建议为 `COOLDOWN`、`HALTED` 或 `TRADING_HALTED`

缺失或无法读取的 market-regime 或 circuit-breaker 工件会使可执行订单产生 `REVIEW_REQUIRED`。如果不存在任何可执行订单，结果仍为 `NO_ACTIONABLE_ORDERS`。

## 输出

该脚本会写入：

- `pre_trade_discipline_decision_YYYY-MM-DD_HHMMSS.json`
- 一份对应的 markdown 报告，除非设置了 `--json-only`
- 当提供 `--journal-dir` 时，在 `state/journal/pre-trade-discipline/` 下写入一行 JSONL 日志

每个候选结果都包含一个 `checklist_answers` 对象，其中记录了用于决策的书面计划、止损、仓位大小、风险金额和备注答案，以便后续评审可以审计下单时的实际回答内容。

如果某个候选包含 `thesis_id` 并且提供了 `--state-dir`，则 JSON 报告会通过 trader-memory-core 的 `link_report` 链接到该论点的 `linked_reports` 列表中。该技能不会调用 `mark_reviewed`，也不会更改监控评审日期。

## 资源

- `scripts/check_pre_trade_discipline.py` - 主 CLI 和规则引擎
- `references/discipline_gate_framework.md` - 规则定义与集成说明
- `skills/trader-memory-core/schemas/thesis.schema.json` - 论点状态模式

## 关键原则

1. **仅限手动执行** - 输出的是提交券商前的检查清单闸门，而不是订单路由器。
2. **书面计划优先** - 没有书面的入场计划、止损或仓位大小确认，就没有手动入场。
3. **与生产者兼容的状态读取** - 报复性风险检测遵循 trader-memory-core 的时间戳和结果行为。
4. **无评审副作用的日志记录** - 该闸门将报告链接到论点，而不会推进评审日程。
