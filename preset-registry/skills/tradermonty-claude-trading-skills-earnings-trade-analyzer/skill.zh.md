---
name: earnings-trade-analyzer
description: Analyze recent post-earnings stocks using a 5-factor scoring system (Gap Size, Pre-Earnings Trend, Volume Trend, MA200 Position, MA50 Position). Scores each stock 0-100 and assigns A/B/C/D grades. Use when user asks about earnings trade analysis, post-earnings momentum screening, earnings gap scoring, or finding best recent earnings reactions.
---
# 财报交易分析器 - 财报后 5 因子评分

使用 5 因子加权评分系统分析近期发布财报的股票，识别最强的财报反应，用于潜在的动量交易。

## 何时使用

- 用户请求财报后交易分析或财报跳空筛选
- 用户想要找出近期最佳的财报反应
- 用户请求财报动量评分或评级
- 用户询问财报后累积日（PEAD）候选标的

## 前提条件

- FMP API 密钥（设置 `FMP_API_KEY` 环境变量或传入 `--api-key`）
- 免费层级（每天 250 次调用）足以完成默认筛选（回看 2 天，前 20 名）
- 如需更大的回看窗口或完整筛选，建议使用付费层级

## 工作流程

### 第 1 步：运行财报交易分析器

执行分析器脚本：

```bash
# Default: last 2 days of earnings, top 20 results
python3 skills/earnings-trade-analyzer/scripts/analyze_earnings_trades.py --output-dir reports/

# Custom lookback and market cap filter
python3 skills/earnings-trade-analyzer/scripts/analyze_earnings_trades.py \
  --lookback-days 5 \
  --min-market-cap 1000000000 \
  --top 30 \
  --output-dir reports/

# With entry quality filter
python3 skills/earnings-trade-analyzer/scripts/analyze_earnings_trades.py \
  --apply-entry-filter \
  --output-dir reports/
```

#### 定时复盘时的端点降级/预算回退

如果分析器在计划内的收盘后/盘前运行中报告 404、返回不合常理的空财报日历，或在生成评分候选标的之前耗尽 API 调用预算，不要立即报告“没有财报反应”。

1. 首先使用更窄的高流动性股票池配置重试一次，让完整的 5 因子评分器有机会完成，例如：

```bash
python3 skills/earnings-trade-analyzer/scripts/analyze_earnings_trades.py \
  --lookback-days 2 \
  --min-market-cap 5000000000 \
  --top 20 \
  --max-api-calls 600 \
  --output-dir reports/<routine-date>
```

2. 如果评分运行仍未返回候选标的或无法完成，请通过兼容性 shim 所使用的 stable 端点验证同一日期范围，并将结果明确标注为未评分的回退结果：

```bash
curl "https://financialmodelingprep.com/stable/earnings-calendar?from=YYYY-MM-DD&to=YYYY-MM-DD&apikey=$FMP_API_KEY"
```

然后，可以选择通过分析器的 stable 优先 FMP 客户端，或按代码逐一调用 `/stable/quote?symbol=<ticker>`，对返回的美股代码进行补充，并按当日 `changesPercentage`、市值和流动性排序。仅在 stable 调用失败后，才将旧版 `/api/v3` 行情调用作为旧版密钥的回退方案。由于 5 因子评分器未运行，请将这些结果呈现为**初步/未评分反应**；不要仅凭回退结果分配 A/B/C/D 评级。

**无候选输出陷阱：** 分析器可能打印 `Candidates after filtering: 0` / `No candidates found matching criteria.` 并成功退出，而不写入任何 `earnings_trade_analyzer_*.json` 文件。在这种情况下，不要尝试从并不存在的候选文件运行 PEAD 模式 B。明确说明未生成经过评分的分析器 JSON；如果该例行流程需要财报部分，则运行上述端点/行情补充回退方案，并将任何股票仅标注为供人工复核。

### 第 2 步：查看结果

1. 阅读生成的 JSON 和 Markdown 报告
2. 加载 `references/scoring_methodology.md` 以获取评分解读所需的背景信息
3. 重点关注 A 级和 B 级股票，以寻找可操作的交易设置

### 第 3 步：呈现分析

对每个头部候选标的，呈现以下内容：
- 综合得分与字母评级（A/B/C/D）
- 财报跳空幅度与方向
- 财报发布前的 20 日趋势
- 成交量比率（20 日 vs 60 日均值）
- 相对 200 日和 50 日移动均线的位置
- 评分组成部分中最弱与最强的部分

### 第 4 步：提供可操作的指导

根据评级：
- **A 级（85+）：** 财报反应强劲且伴随机构吸筹——可以考虑入场
- **B 级（70-84）：** 财报反应良好，值得监控——等待回调或确认
- **C 级（55-69）：** 信号混杂——保持谨慎，需要额外分析
- **D 级（<55）：** 交易设置疲弱——回避或等待更好的条件

## 输出

- `earnings_trade_analyzer_YYYY-MM-DD_HHMMSS.json` - 结构化结果，schema_version 为 "1.0"
- `earnings_trade_analyzer_YYYY-MM-DD_HHMMSS.md` - 带表格的人类可读报告

## 资源

- `references/scoring_methodology.md` - 5 因子评分系统、评级阈值和入场质量过滤规则
