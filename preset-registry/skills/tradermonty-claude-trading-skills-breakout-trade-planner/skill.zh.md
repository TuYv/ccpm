---
name: breakout-trade-planner
description: Generate Minervini-style breakout trade plans from VCP screener output with worst-case risk calculation, portfolio heat management, and Alpaca-compatible order templates (stop-limit bracket for pre-placement, limit bracket for post-confirmation). Use when user has VCP screener results and wants actionable trade plans with entry/stop/target levels and position sizing.
---
# 突破交易规划器

按照 Mark Minervini 的突破方法论，从 VCP 筛选器输出生成交易计划。使用最坏情况入场价计算仓位规模，强制执行投资组合风险限制，并输出与 Alpaca API 兼容的订单模板。

## 何时使用

- 用户持有 VCP 筛选器 JSON 输出并希望生成交易计划
- 用户要求计算突破入场/止损/目标位
- 用户希望为 VCP 突破候选标的获取 Alpaca 订单模板
- 用户需要结合投资组合热度管理的仓位规模计算

## 前提条件

- 带有 `schema_version: "1.0"` 的 VCP 筛选器 JSON 输出
- 无需 API 密钥（使用本地 JSON 文件即可运行）
- 无外部技能依赖（仓位规模计算为内置功能）

## 工作流程

### 步骤 1：生成交易计划

使用 VCP 筛选器输出运行规划器：

```bash
python3 skills/breakout-trade-planner/scripts/plan_breakout_trades.py \
  --input reports/vcp_screener_YYYY-MM-DD.json \
  --account-size 100000 \
  --risk-pct 0.5 \
  --output-dir reports/
```

### 步骤 2：审阅输出

阅读生成的 JSON 和 Markdown 报告，并呈现：

1. **可执行订单** — 附带订单模板的突破前候选标的
2. **重新验证** — 处于突破状态、需要实时确认的候选标的
3. **观察列表** — 需要监控的正在形成的 VCP 候选标的
4. **已拒绝/已推迟/受限** — 被门槛或投资组合限制过滤掉的候选标的
### 步骤 3：解释交易计划

对每个可执行订单，说明以下内容：
- 入场价位（信号价与最坏情况价）及止损位设置
- R 倍数目标与回报风险比
- 两种执行模式：pre_place（止损限价单）与 post_confirm（5 分钟确认后的限价单）
- 投资组合风险贡献与累计热度
- 券商与日内约束：这些模板是规划产物，并非券商许可。如果该计划可能产生当日往返交易或使用保证金，请确认用户券商特有的日内/当日回转交易管控措施。FINRA 已用自 2026-06-04 起生效的日内保证金标准，取代了旧的典型日内交易者天数统计和 25,000 美元最低权益要求，并允许券商在 2027-10-20 之前分阶段实施。

## Minervini 门槛（筛选标准）

候选标的必须满足全部条件：

| 条件 | 突破前 | 突破中 |
|-----------|-------------|----------|
| valid_vcp | True | True |
| rating_band | good/strong/textbook | good/strong/textbook |
| risk_pct_worst | <= 8.0% | <= 8.0% |
| breakout_volume | — | True |
| distance_from_pivot | — | <= max_chase_pct |
| current_price | — | <= worst_entry |

## CLI 参数

| 参数 | 默认值 | 描述 |
|-----------|---------|-------------|
| --account-size | （必填） | 账户权益（美元） |
| --risk-pct | 0.5 | 每笔交易的基础风险百分比 |
| --max-position-pct | 10.0 | 单一持仓最大百分比 |
| --max-sector-pct | 30.0 | 板块最大敞口百分比 |
| --max-portfolio-heat-pct | 6.0 | 最大总未平仓风险百分比 |
| --target-r-multiple | 2.0 | 止盈 R 倍数 |
| --stop-buffer-pct | 1.0 | 收缩低点下方的止损缓冲百分比 |
| --max-chase-pct | 2.0 | 枢轴上方最大追价百分比 |
| --pivot-buffer-pct | 0.1 | 用于触发买入止损单的枢轴缓冲百分比 |
| --current-exposure-json | None | 现有投资组合敞口 |

## 输出

- `breakout_trade_plan_YYYY-MM-DD_HHMMSS.json` — 包含订单模板的结构化计划
- `breakout_trade_plan_YYYY-MM-DD_HHMMSS.md` — 人类可读的报告

## 交易所日历与回放

在运行规划器之前，请先安装 `requirements.txt`。`--as-of` 接受 `YYYY-MM-DD`（00:00 America/New_York）或带时区偏移的 ISO-8601 时间戳。计划的有效性采用当前尚未收盘的 XNYS 交易时段，或收盘、周末或交易所节假日之后的下一个实际交易时段。

## 资源

- `references/minervini_entry_rules.md` — 入场方法论与规则
