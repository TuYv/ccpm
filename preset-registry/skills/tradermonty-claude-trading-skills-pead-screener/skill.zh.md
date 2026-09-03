---
name: pead-screener
description: Screen post-earnings gap-up stocks for PEAD (Post-Earnings Announcement Drift) patterns. Analyzes weekly candle formation to detect red candle pullbacks and breakout signals. Supports two input modes - FMP earnings calendar (Mode A) or earnings-trade-analyzer JSON output (Mode B). Use when user asks about PEAD screening, post-earnings drift, earnings gap follow-through, red candle breakout patterns, or weekly earnings momentum setups.
---
# PEAD 筛选器 - 盈余公告后漂移

使用周K线分析筛选财报后跳空高开股票中的 PEAD（盈余公告后漂移）形态，检测红色K线回调与突破信号。

## 何时使用

- 用户要求进行 PEAD 筛选或盈余公告后漂移分析
- 用户希望寻找具有延续上涨潜力的财报跳空高开股票
- 用户要求查找财报后的红色K线突破形态
- 用户询问基于周线的盈余动量交易形态
- 用户提供 earnings-trade-analyzer JSON 输出以进行进一步筛选

## 前置条件

- FMP API 密钥（设置 `FMP_API_KEY` 环境变量或传入 `--api-key`）
  ```bash
  export FMP_API_KEY=your_api_key_here
  ```
- 免费套餐（每日 250 次调用）足以支持默认筛选
- 模式 B：需要 schema_version 为 "1.0" 的 earnings-trade-analyzer JSON 输出文件

## 工作流程

### 步骤 1：准备并执行筛选

按以下两种模式之一运行 PEAD 筛选器脚本：

**模式 A（FMP 财报日历）：**
```bash
# Default: last 14 days of earnings, 5-week monitoring window
python3 skills/pead-screener/scripts/screen_pead.py --output-dir reports/

# Custom parameters
python3 skills/pead-screener/scripts/screen_pead.py \
  --lookback-days 21 \
  --watch-weeks 6 \
  --min-gap 5.0 \
  --min-market-cap 1000000000 \
  --output-dir reports/
```

**模式 B（earnings-trade-analyzer JSON 输入）：**
```bash
# From earnings-trade-analyzer output
python3 skills/pead-screener/scripts/screen_pead.py \
  --candidates-json reports/earnings_trade_analyzer_YYYY-MM-DD_HHMMSS.json \
  --min-grade B \
  --output-dir reports/
```

**定时美股例行任务的陷阱：** 在运行 `earnings-trade-analyzer` 之后生成盘前 / 美股 cron 简报时，应优先使用模式 B。模式 A 可能会拉取全球 FMP 财报日历，将 API 预算耗费在非美股代码上，并在触及预期的美股观察列表之前就返回力度较弱/不可操作的外国股票。如果仍然使用了模式 A，且脚本报告出现预算削减或非美股代码，请将 PEAD 输出标记为降级，仅将其作为人工复核对象，而非干净的候选来源。

### 步骤 2：查看结果

1. 阅读生成的 JSON 和 Markdown 报告
2. 加载 `references/pead_strategy.md`，了解 PEAD 理论与形态背景
3. 加载 `references/entry_exit_rules.md`，了解交易管理规则

### 步骤 3：呈现分析

针对每个候选标的，呈现以下内容：
- 阶段分类（MONITORING、SIGNAL_READY、BREAKOUT、EXPIRED）
- 周K线形态细节（红色K线位置、突破状态）
- 综合评分与评级
- 交易设置：入场、止损、目标价、风险/回报比
- 流动性指标（ADV20、平均成交量）

### 步骤 4：提供可操作的指导

根据阶段与评级：
- **BREAKOUT + 强势形态（85+）：** 高确信度 PEAD 交易，全额仓位
- **BREAKOUT + 良好形态（70-84）：** 稳健的 PEAD 形态，标准仓位
- **SIGNAL_READY：** 已形成红色K线，为突破红色K线高点设置警报
- **MONITORING：** 财报后阶段，尚未出现红色K线，加入观察列表
- **EXPIRED：** 已超出监控窗口，从观察列表中移除

## 输出

- `pead_screener_YYYY-MM-DD_HHMMSS.json` - 包含阶段分类的结构化结果
- `pead_screener_YYYY-MM-DD_HHMMSS.md` - 按阶段分组的人类可读报告

## 参考资料

- `references/pead_strategy.md` - PEAD 理论与周K线方法
- `references/entry_exit_rules.md` - 入场、出场与仓位规模规则
