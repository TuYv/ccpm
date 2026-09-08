---
name: parabolic-short-trade-planner
description: Screen US equities for parabolic exhaustion patterns and generate conditional pre-market short plans, then evaluate intraday trigger fires from live 5-min bars. Phase 1 daily 5-factor scorer (MA extension / acceleration / volume climax / range expansion / liquidity), Phase 2 per-candidate plans for ORL break / first-red 5-min / VWAP fail with explicit borrow / SSR / manual-confirmation gating, Phase 3 one-shot intraday FSM that detects trigger fires and resolves concrete share counts. Covers Phase 1 + Phase 2 + Phase 3.
---
## 概述

生成 Qullamaggie 风格的 Parabolic Short（抛物线做空）自选股清单，以及美股的条件化盘前交易计划。该技能绝不发送订单。它输出 JSON + Markdown，由人工对照其券商系统审核后再入场。

三个阶段：

- **阶段 1（`screen_parabolic.py`）**：从 FMP 拉取 EOD K 线和公司资料，应用硬性失效规则（感知模式），对幸存者按 5 个因子打分（权重 30/25/20/15/10），并分配 A/B/C/D 评级。
- **阶段 2（`generate_pre_market_plan.py`）**：接收阶段 1 的 JSON，按 `--tradable-min-grade`（默认 `B`）过滤，检查 Alpaca 做空库存（或 `ManualBrokerAdapter`），根据继承的前一交易日收盘价评估 SEC 规则 201 SSR 状态，并为每个候选标的生成三个触发计划。
- **阶段 3（`monitor_intraday_trigger.py`）**：读取阶段 2 的计划，获取 5 分钟 K 线（Alpaca 实时数据或 fixture），将每个计划的 FSM 向前推进一步，持久化每个计划的状态，并写入包含 `state`、`entry_actual`、`stop_actual` 和 `shares_actual`（触发时）的 `intraday_monitor` JSON。单次执行——交易者通过 `watch` 或 cron 每 1–5 分钟运行一次；可重放确定性保证重复运行结果逐字节一致。

## 何时使用

当用户想要以下操作时调用此技能：

- 基于 S&P 500（或自定义 CSV）构建每日 Parabolic Short 自选股清单。
- 将自选股清单转化为带有明确借券 / SSR / 状态门控的盘前交易计划。
- 在 Alpaca 下单前审计某个候选标的的阻断性与建议性人工确认原因。

不要在以下场景调用：

- 做多动量筛选——请使用 vcp-screener 或 canslim-screener。
- 1 分钟 / 亚分钟日内信号——阶段 3 仅评估 5 分钟 K 线。
- 实时订单路由——该技能在设计上仅做检测；阶段 3 会输出带有具体入场/止损/股数的 `triggered` 状态，但订单由交易者手动发出。

## 工作流程

### 阶段 1 — 每日筛选器

1. 确认已设置 `FMP_API_KEY`（环境变量或 `--api-key`）。
2. 使用默认更安全的模式运行：
   ```bash
   python3 skills/parabolic-short-trade-planner/scripts/screen_parabolic.py \
     --mode safe_largecap --as-of 2026-04-30 --output-dir reports/
   ```
3. 检查 `reports/parabolic_short_<date>.md`——自选股清单按评级分组（A→D）。
4. 将感兴趣的标的推进到阶段 2。

对于小盘股顶部爆发，切换到 `--mode classic_qm`（更宽松的市值和 ADV 下限，更高的 5 日 ROC 阈值）。

若要在不使用 API 的情况下测试，可用 `--dry-run --fixture <path>` 对 JSON fixture 运行（`scripts/tests/fixtures/dry_run_minimal.json` 中附带了一个）。

### 阶段 2 — 盘前计划生成器

1. 可选：设置 `ALPACA_API_KEY` / `ALPACA_SECRET_KEY` 以进行实时借券检查。若不设置，计划器会回退到 `ManualBrokerAdapter`，它将所有候选标的标记为 `borrow_inventory_unavailable` / `plan_status: watch_only`。
2. 运行：
   ```bash
   python3 skills/parabolic-short-trade-planner/scripts/generate_pre_market_plan.py \
     --candidates-json reports/parabolic_short_2026-04-30.json \
     --account-size 100000 --risk-bps 50 --output-dir reports/
   ```
3. 输出：`reports/parabolic_short_plan_<date>.json`。每个计划包含三个入场计划（5 分钟 ORL 跌破、首根 5 分钟阴线、VWAP 失效），并附带 `entry_hint` / `stop_hint` 公式字符串（不含预置股数——交易者在触发时根据 `shares_formula` 计算股数）。

### 阶段 3 — 日内触发监控器

1. 确认已设置 `ALPACA_API_KEY` / `ALPACA_SECRET_KEY`（阶段 3 使用 Alpaca 行情数据；`data.alpaca.markets` 对模拟和实盘账户均可用）。
2. 在美股常规交易时段内，按节奏单次执行——通常是前 30 分钟每 60 秒一次，之后每 5 分钟一次：
   ```bash
   python3 skills/parabolic-short-trade-planner/scripts/monitor_intraday_trigger.py \
     --plans-json reports/parabolic_short_plan_2026-05-05.json \
     --bars-source alpaca \
     --state-dir state/parabolic_short/ \
     --output-dir reports/
   ```
   也可封装进 `watch -n 60 'python3 ...'` / cron。
3. 输出：`reports/parabolic_short_intraday_<date>.json` 列出所有被监控的计划，包含 `state`（`armed` / `triggered` / `invalidated` / FSM 特定状态）、由 K 线推导的状态转移时间戳，以及触发时的 `size_recipe_resolved`（具体的 `shares_actual`）。
4. 若要在不使用 API 的情况下测试，使用 `--bars-source fixture
   --bars-fixture <path>` 对 JSON fixture 运行
   （`scripts/tests/fixtures/intraday_bars/`）。

阶段 3 的触发检测不是下单指令。在进行任何手动做空入场之前，请确认借券/定位券源的可用性、SEC 规则 201 SSR 状态、券商做空卖出管控，以及券商当前的日内保证金或日内交易管控。FINRA 已以日内保证金标准取代原有的典型日内交易者天数统计和 25,000 美元最低净值要求，自 2026-06-04 起生效，允许券商分阶段实施至 2027-10-20。

阶段 3 是**幂等的**：每次运行都会从开盘到 `now_et`（或 `--now-et` 覆盖值）重放整个交易时段的 K 线，因此在同一分钟内重复运行会产生相同的状态。`prior_state` 仅用于差异/通知展示；它绝不推进 FSM。

### 入场前审核计划

阅读每个股票代码的三个顶层字段：

- `plan_status`：`actionable`（人工门控可解除）或 `watch_only`（硬性阻断——借券不可用或 SSR 生效）。
- `blocking_manual_reasons`：在扣动扳机前必须全部解决。
- `advisory_manual_reasons`：仅为提示，例如
  `manual_locate_required`（始终设置）、`warning:too_early_to_short`、
  `warning:recent_earnings_catalyst`（最近一次财报在
  `--earnings-catalyst-window-days` 窗口内，默认 10 个交易日——提示该走势为事件驱动而非纯粹的技术性顶部爆发）。

### 财报感知筛选

阶段 1 每次运行获取一次 FMP 财报日历（单次调用，而非按股票代码逐个调用），并输出两项财报感知检查：

- `--exclude-earnings-within-days`（默认 2 个日历日，向前）——下一次财报落在窗口内时触发硬性失效。与旧版 `earnings_blackout_days` 语义一致。
- `--earnings-catalyst-window-days`（默认 10 个交易日，向后）——上一次财报落在窗口内时发出软性警告 `recent_earnings_catalyst`。作为建议性人工原因传递给阶段 2，而不强制 `trade_allowed_without_manual: false`。

每个候选标的的输出包含 `last_earnings_date`、`next_earnings_date`、`trading_days_since_earnings`（交易日）、`earnings_within_days`（日历日，向前）、`earnings_blackout_days`（配置的阈值）和 `earnings_in_blackout_window`。旧版 `earnings_within_2d` 保留以向后兼容。

顶层日期：`as_of` 是计划日期（阶段 2 契约——绝不修改）；`run_date` 与其保持一致；`market_data_as_of` 是用于技术指标的最新 K 线日期（周末运行时与 `as_of` 不同）。

## 输出格式

阶段 1 JSON：`parabolic_short_<as_of>.json`（schema_version 1.0）。
阶段 2 JSON：`parabolic_short_plan_<as_of>.json`（schema_version 1.0）。
阶段 3 JSON：`parabolic_short_intraday_<as_of>.json`（schema_version 1.0，
phase = `intraday_monitor`）。
该契约由 `tests/test_schema_contract.py` 以及针对阶段 3 的
`tests/test_monitor_intraday_smoke.py` 固定。

## 资源

- `references/parabolic_short_methodology.md` — Qullamaggie 的 3 触发
  框架与衰竭信号。
- `references/short_invalidation_rules.md` — 感知模式的排除规则。
- `references/short_risk_management.md` — 规则 201、ETB 与 HTB、券源定位。
- `references/intraday_trigger_playbook.md` — 每种触发类型的细节、阶段 3 实现的
  FSM 状态转移，以及同 K 线平局裁决语义。
- `references/broker_capability_matrix.md` — 各券商通过其 API 暴露的
  做空库存信息。
