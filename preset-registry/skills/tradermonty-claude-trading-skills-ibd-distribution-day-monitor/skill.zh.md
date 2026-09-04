---
name: ibd-distribution-day-monitor
description: Detect IBD-style Distribution Days for QQQ/SPY (close down at least 0.2% on higher volume), track 25-session expiration and 5% invalidation, count d5/d15/d25 clusters, classify market risk (NORMAL/CAUTION/HIGH/SEVERE), and emit TQQQ/QQQ exposure recommendations. Use after market close, before TQQQ exposure changes, or as input to FTD/market-state frameworks. Does not execute trades.
---
# IBD 派发日监控器

## 目的
检测主要市场 ETF（QQQ 作为纳斯达克代理、SPY 作为标普 500 代理）的 IBD 风格派发日（Distribution Day），并生成每日市场恶化信号以及 TQQQ/QQQ 仓位建议。专为盘后复盘而设计。

## 何时使用
在以下情况下调用此技能：
- 每日美股收盘后。
- 在增加 TQQQ 仓位或再平衡杠杆仓位之前。
- 在评估一段上涨趋势是否正变得容易遭遇回调时。
- 作为 FTD（Follow-Through Day，跟随日）检测或其他市场状态框架的上游输入。

切勿使用此技能来：
- 执行交易或修改订单。
- 在 IBD 规则体系之外生成主观的市场预测。

## 输入
- 标的代码（默认：QQQ、SPY）以及回看窗口（默认 80 个交易日）。
- 可选的 `--as-of YYYY-MM-DD`，用于针对某个历史交易日进行回测。
- 策略上下文：标的（TQQQ 或 QQQ）、当前仓位 %、基础追踪止损 %。
- FMP API 密钥，通过 `--api-key`、`config.data.api_key` 或 `FMP_API_KEY` 环境变量提供（按此优先级顺序）。

## 核心规则
当满足以下条件时，判定为一个派发日（Distribution Day）：
1. 今日收盘价低于昨日收盘价至少 0.2%。
2. 今日成交量大于昨日成交量。

当满足以下任一条件时，该派发日将从有效计数中移除：
- 自该 DD 以来已超过 25 个交易日。
- 指数自该 DD 收盘价起已上涨 5%（默认使用 DD 之后的最高价；可配置为以收盘价为数据源）。

当日的 DD 永远不会被立即作废，因为不存在 DD 之后的交易日可用于评估是否达到 5% 的涨幅。

## 计数约定
- `d5_count` / `d15_count` / `d25_count` 统计满足 `age_sessions <= N` 的有效记录。
- 这意味着会检查 **N+1 个交易日**（即 age 0..N，含两端）。因此，报告中表述为 "within N elapsed sessions"（在已过去的 N 个交易日之内），而不是 “直近 N 取引日”，以避免歧义。

## 风险分级
| 风险级别 | 触发条件 |
|------|---------|
| NORMAL | `d25 <= 2` |
| CAUTION | `d25 >= 3` |
| HIGH | `d25 >= 5` OR `d15 >= 3` OR `d5 >= 2` |
| SEVERE | `d25 >= 6` OR `d15 >= 4` OR (`market_below_21ema_or_50ma` AND `d25 >= 5`) |

当同时加载 QQQ 和 SPY 时，适用以 QQQ 为权重的整体评级逻辑（TQQQ 感知）：只要有一个指数为 SEVERE，整体即升级为 SEVERE；QQQ 为 HIGH 时整体升级为 HIGH；QQQ 为 NORMAL + SPY 为 HIGH 时整体仍升级为 HIGH（广泛市场的溢出效应）。

## TQQQ 仓位策略
| 风险级别 | 动作 | 目标仓位 | 追踪止损 |
|------|--------|-----------------|
