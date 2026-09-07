---
name: market-breadth-analyzer
description: Quantifies market breadth health using TraderMonty's public CSV data. Generates a 0-100 composite score across 6 components (100 = healthy). No API key required. Use when user asks about market breadth, participation rate, advance-decline health, whether the rally is broad-based, or general market health assessment.
---
# 市场宽度分析器技能

## 用途

使用数据驱动的 6 组件评分体系（0-100）量化市场宽度的健康程度。利用 TraderMonty 公开提供的 CSV 数据，衡量市场在上涨或下跌行情中的参与广泛程度。

**分数方向：** 100 = 最大健康度（广泛参与），0 = 严重疲弱。

**无需 API 密钥** - 使用 GitHub Pages 上免费提供的 CSV 数据。

## 何时使用本技能

**英文：**
- 用户询问 "Is the market rally broad-based?" 或 "How healthy is market breadth?"
- 用户想要评估市场参与率
- 用户询问涨跌家数指标或宽度推升（breadth thrust）
- 用户想知道市场是否正在收窄（参与个股减少）
- 用户询问基于宽度状况的股票仓位水平

**日文：**
- 「マーケットブレッドスはどうですか？」「市場の参加率は？」
- 「上昇は広がっている？」「一部の銘柄だけの上昇？」
- ブレッドス指標に基づくエクスポージャー判断
- 市場の健康度をデータで確認したい

## 前提条件

- **Python 3.9+** 及 `requests` 库（用于获取 CSV 数据）
- **互联网连接**，能够访问 GitHub Pages URL
- **无需任何 API 密钥** - 使用免费提供的公开 CSV 数据

## 与宽度图表分析师的区别

| 方面 | 市场宽度分析器 | 宽度图表分析师 |
|--------|------------------------|----------------------|
| 数据来源 | CSV（自动化） | 图表图像（手动） |
| 是否需要 API | 无 | 无 |
| 输出 | 量化的 0-100 评分 | 定性的图表分析 |
| 组件 | 6 个评分维度 | 视觉形态识别 |
| 可重复性 | 完全可复现 | 依赖于分析师 |

---

## 执行工作流

### 阶段 1：执行 Python 脚本

运行分析脚本。如果在 cron 定时任务中使用嵌套的或带日期戳的 `--output-dir`，请先创建该目录；历史记录写入器要求目录已存在。

```bash
mkdir -p reports/<routine-or-date>
python3 skills/market-breadth-analyzer/scripts/market_breadth_analyzer.py \
  --detail-url "https://tradermonty.github.io/market-breadth-analysis/market_breadth_data.csv" \
  --summary-url "https://tradermonty.github.io/market-breadth-analysis/market_breadth_summary.csv" \
  --output-dir reports/<routine-or-date>
```

对于简单的临时运行，可省略 `--output-dir` 或使用已存在的目录。在从仓库根目录执行的 cron 定时任务中，优先使用相对于仓库的输出目录（例如 `reports/after-close-YYYY-MM-DD`），而非绝对路径。如果绝对路径形式的嵌套 `--output-dir` 在目录已存在的情况下仍意外地在写入历史记录这一步失败，请先用等效的仓库相对路径重试一次，之后再将宽度分析视为不可用。

脚本将会：
1. 获取明细 CSV（约 2,500 行，2016 年至今）和汇总 CSV（8 项指标）
2. 校验数据新鲜度（若超过 5 天则发出警告）
3. 计算全部 6 个组件得分（任一组件缺少数据时自动重新分配权重）
4. 生成综合评分及区间分类
5. 跟踪评分历史并计算趋势（改善/恶化/稳定）
6. 输出 JSON 和 Markdown 报告

### 阶段 2：呈现结果

向用户呈现生成的 Markdown 报告，重点突出：
- 综合评分及健康区间
- 最强和最弱的组件
- 建议的股票仓位水平
- 需要关注的关键宽度水平
- 任何数据新鲜度警告

---

## 6 组件评分体系

| # | 组件 | 权重 | 关键信号 |
|---|-----------|--------|------------|
| 1 | 宽度水平与趋势 | **25%** | 当前 8MA 水平 + 200MA 趋势方向 + 8MA 方向修正项 |
| 2 | 8MA 与 200MA 交叉 | **20%** | 通过均线差距及方向判断动量 |
| 3 | 峰值/谷值周期 | **20%** | 在宽度周期中所处位置 |
| 4 | 看跌信号 | **15%** | 经回测验证的看跌信号标志 |
| 5 | 历史百分位 | **10%** | 当前值相对全部历史分布的位置 |
| 6 | S&P 500 背离 | **10%** | 多窗口（20 天 + 60 天）价格与宽度的背离 |

**权重重新分配：** 若任一组件缺少足够数据（例如未检测到峰值/谷值标记），该组件将被排除，其权重按比例重新分配给其余组件。报告会同时显示原始权重和实际生效权重。

**评分历史：** 综合评分会跨多次运行持久保存（以数据日期为键）。当存在多条观测记录时，报告会包含趋势摘要（改善/恶化/稳定）。

## 健康区间映射（100 = 健康）

| 评分 | 区间 | 股票仓位 | 行动 |
|-------|------|-----------------|--------|
| 80-100 | 强劲 | 90-100% | 满仓运作，偏重成长/动量风格 |
| 60-79 | 健康 | 75-90% | 正常运作 |
| 40-59 | 中性 | 60-75% | 有选择地布局，收紧止损 |
| 20-39 | 走弱 | 40-60% | 获利了结，提高现金比例 |
| 0-19 | 危急 | 25-40% | 保住本金，留意谷值形成 |

---

## 数据来源

**明细 CSV：** `market_breadth_data.csv`
- 约 2,500 行，涵盖 2016-02 至今
- 列：Date, S&P500_Price, Breadth_Index_Raw, Breadth_Index_200MA, Breadth_Index_8MA, Breadth_200MA_Trend, Bearish_Signal, Is_Peak, Is_Trough, Is_Trough_8MA_Below_04

**汇总 CSV：** `market_breadth_summary.csv`
- 8 项汇总指标（平均峰值、平均谷值、计数、分析期间）

两者均公开托管在 GitHub Pages 上 - 无需身份验证。

## 输出文件

- JSON：`market_breadth_YYYY-MM-DD_HHMMSS.json`
- Markdown：`market_breadth_YYYY-MM-DD_HHMMSS.md`
- 历史：`market_breadth_history.json`（跨运行持久保存，最多 20 条记录）

## 参考文档

### `references/breadth_analysis_methodology.md`
- 完整方法论及各组件评分细节
- 阈值解释与区间定义
- 历史背景与解读指南

### 何时加载参考文档
- **首次使用：** 加载方法论参考文档以理解框架
- **日常执行：** 无需参考文档 - 评分由脚本处理
