---
name: downtrend-duration-analyzer
description: Analyze historical downtrend durations and generate interactive HTML histograms showing typical correction lengths by sector and market cap.
---
# 下跌趋势持续时间分析器

## 概述

分析历史价格数据以识别下跌趋势时段（从峰值到谷值），并构建回调持续时间的统计分布。生成分行业和市值细分的直方图交互式 HTML 可视化，帮助交易者了解典型的恢复时间范围，并为均值回归策略设定符合实际的预期。

## 适用场景

- 交易者询问某个行业或市值档位的典型回调时长
- 用户希望了解历史回撤的恢复时间
- 构建需要现实持仓周期估计的均值回归或回调买入策略
- 比较不同市场板块之间的回调行为
- 设置止损超时时间或持仓周期上限

## 前置条件

- Python 3.9+
- FMP API 密钥（设置 `FMP_API_KEY` 环境变量或使用 `--api-key`）
- 所需依赖包：`requests`、`pandas`、`numpy`（标准数据分析套件）

## 工作流程

### 步骤 1：获取历史价格数据

运行分析脚本，为一批股票获取 OHLC 数据并识别下跌趋势时段。

```bash
python3 skills/downtrend-duration-analyzer/scripts/analyze_downtrends.py \
  --sector "Technology" \
  --lookback-years 5 \
  --output-dir reports/
```

### 步骤 2：分析下跌趋势持续时间

脚本会自动执行以下操作：
1. 使用滚动窗口分析识别局部峰值和谷值
2. 计算每次下跌趋势的持续时间（交易日）和深度（跌幅百分比）
3. 按行业和市值档位（超大、大盘、中盘、小盘）对结果进行细分
4. 计算汇总统计量（中位数、均值、百分位数）

### 步骤 3：生成交互式 HTML 可视化

```bash
python3 skills/downtrend-duration-analyzer/scripts/generate_histogram_html.py \
  --input reports/downtrend_analysis_*.json \
  --output-dir reports/
```

这会创建一个交互式 HTML 文件，包含：
- 下跌趋势持续时间的直方图
- 行业和市值筛选器
- 带有百分位数信息的悬停提示框
- 汇总统计量表

### 步骤 4：审阅分布洞察

加载生成的 markdown 报告以解读分析结果：
- **短期回调（5-15 天）**：上升趋势中的典型回撤
- **中期回调（15-40 天）**：常规的行业轮动
- **长期回调（40 天以上）**：趋势反转或熊市

## 输出格式

### JSON 报告

```json
{
  "schema_version": "1.0",
  "analysis_date": "2026-03-28T07:00:00Z",
  "parameters": {
    "lookback_years": 5,
    "sector_filter": "Technology",
    "peak_window": 20,
    "trough_window": 20
  },
  "summary": {
    "total_downtrends": 1234,
    "median_duration_days": 18,
    "mean_duration_days": 24.5,
    "p25_duration_days": 10,
    "p75_duration_days": 32,
    "p90_duration_days": 55
  },
  "by_sector": {
    "Technology": {
      "count": 456,
      "median_days": 15,
      "mean_days": 20.3
    }
  },
  "by_market_cap": {
    "Mega": {"count": 200, "median_days": 12},
    "Large": {"count": 300, "median_days": 16},
    "Mid": {"count": 400, "median_days": 22},
    "Small": {"count": 334, "median_days": 28}
  },
  "downtrends": [
    {
      "symbol": "AAPL",
      "sector": "Technology",
      "market_cap_tier": "Mega",
      "peak_date": "2025-01-15",
      "trough_date": "2025-02-10",
      "duration_days": 18,
      "depth_pct": -12.5
    }
  ]
}
```

### Markdown 报告

```markdown
# Downtrend Duration Analysis

**Date**: 2026-03-28
**Lookback**: 5 years
**Sector**: Technology

## Summary Statistics

| Metric | Value |
|--------|-------|
| Total Downtrends | 1,234 |
| Median Duration | 18 days |
| Mean Duration | 24.5 days |
| 25th Percentile | 10 days |
| 75th Percentile | 32 days |
| 90th Percentile | 55 days |

## By Market Cap Tier

| Tier | Count | Median | Mean |
|------|-------|--------|------|
| Mega ($200B+) | 200 | 12 days | 15.2 days |
| Large ($10-200B) | 300 | 16 days | 20.1 days |
| Mid ($2-10B) | 400 | 22 days | 28.4 days |
| Small (<$2B) | 334 | 28 days | 35.6 days |

## Key Insights

1. Larger companies recover faster from corrections
2. Technology sector shows shorter median correction than market average
3. 90% of corrections resolve within 55 trading days
```

### HTML 可视化

交互式直方图保存至 `reports/downtrend_histogram_YYYY-MM-DD.html`，包含：
- 基于 Plotly.js 的交互式图表
- 行业和市值下拉筛选器
- 支持分组控制的持续时间分布图
- 百分位数标记（P25、P50、P75、P90）

报告保存至 `reports/`，文件名如下：
- `downtrend_analysis_YYYY-MM-DD_HHMMSS.json`
- `downtrend_analysis_YYYY-MM-DD_HHMMSS.md`
- `downtrend_histogram_YYYY-MM-DD_HHMMSS.html`

## 资源

- `scripts/analyze_downtrends.py` -- 用于获取数据并计算下跌趋势持续时间的主分析脚本
- `scripts/generate_histogram_html.py` -- 用于生成带交互式直方图的 HTML 可视化生成器
- `references/downtrend_methodology.md` -- 峰值/谷值检测算法和市值档位定义

## 核心原则

1. **统计严谨性**：使用稳健的峰值/谷值检测方法，避免噪声引发的错误信号
2. **细分分析至关重要**：始终按行业和市值进行分析；平均值会掩盖重要的差异
3. **符合实际的预期**：使用百分位数（而不仅是均值）来理解结果的完整分布
