---
name: market-environment-analysis
description: Comprehensive market environment analysis and reporting tool. Analyzes global markets including US, European, Asian markets, forex, commodities, and economic indicators. Provides risk-on/risk-off assessment, sector analysis, and technical indicator interpretation. Triggers on keywords like market analysis, market environment, global markets, trading environment, market conditions, investment climate, market sentiment, forex analysis, stock market analysis, 相場環境, 市場分析, マーケット状況, 投資環境.
---
# 市场环境分析

全面分析工具，用于随时了解市场状况并创建专业的市场报告。

## 使用时机

- 需要全面了解全球市场状况时
- 在做出交易或投资决策之前
- 用于每日/每周市场简报
- 评估风险偏好/风险规避情绪时
- 用于理解跨市场关联和板块轮动
- 为客户或个人记录准备市场报告时

## 前置条件

- **WebSearch 访问权限**：获取实时市场数据所需
- **无需 API 密钥**：此技能使用网络搜索来收集数据
- **可选**：用于事件驱动分析的经济日历数据

## 核心工作流程

### 1. 初始数据收集
使用 web_search 工具收集最新市场数据：
1. 主要股票指数（S&P 500、NASDAQ、Dow、Nikkei 225、Shanghai Composite、Hang Seng）
2. 外汇汇率（USD/JPY、EUR/USD、主要货币对）
3. 大宗商品价格（WTI 原油、黄金、白银）
4. 美国国债收益率（2 年期、10 年期、30 年期）
5. VIX 指数（恐慌指数）
6. 市场交易状态（开盘/收盘/当前数值）

### 2. 市场环境评估
从收集到的数据中评估以下内容：
- **趋势方向**：上升趋势/下降趋势/区间震荡
- **风险情绪**：风险偏好/风险规避
- **波动率状态**：基于 VIX 的市场焦虑水平
- **板块轮动**：资金流向何处

### 3. 报告结构

#### 标准报告格式：
```
1. Executive Summary (3-5 key points)
2. Global Market Overview
   - US Markets
   - Asian Markets
   - European Markets
3. Forex & Commodities Trends
4. Key Events & Economic Indicators
5. Risk Factor Analysis
6. Investment Strategy Implications
```

## 脚本使用

### market_utils.py
提供用于报告创建的常用函数：
```bash
# Generate report header
python scripts/market_utils.py

# Available functions:
- format_market_report_header(): Create header
- get_market_session_times(): Check trading hours
- categorize_volatility(vix): Interpret VIX levels
- format_percentage_change(value): Format price changes
```

## 交易所日历与回放

在使用 `scripts/market_utils.py` 之前请先安装 `requirements.txt`。其 `--as-of` 标志需要一个带时区偏移的 ISO-8601 时间戳（或 `Z`）；纯日期会被拒绝，因为东京、伦敦和纽约的市场状态必须对应同一个明确的时刻。交易时段状态会考虑节假日、午间休市、夏令时以及提前收盘。

## 参考文档

### 关键指标解读
在需要以下内容时加载 `references/indicators.md`：
- 各指数的重要点位
- 技术分析要点
- 特定板块的关注领域

### 分析模式
在分析以下内容时加载 `references/analysis_patterns.md`：
- 风险偏好/风险规避判定标准
- 经济指标解读
- 跨市场关联
- 季节性规律与市场异象

## 输出示例

### 快速摘要版本
```
📊 Market Summary [2025/01/15 14:00]
━━━━━━━━━━━━━━━━━━━━━
【US】S&P 500: 5,123.45 (+0.45%)
【JP】Nikkei 225: 38,456.78 (-0.23%)
【FX】USD/JPY: 149.85 (↑0.15)
【VIX】16.2 (Normal range)

⚡ Key Events
- Japan GDP Flash
- US Employment Report

📈 Environment: Risk-On Continues
```

### 详细分析版本
首先给出执行摘要，然后详细分析各个部分。
关键说明：
1. 当前市场阶段（看涨/看跌/中性）
2. 短期方向（1-5 天展望）
3. 需要关注的风险事件
4. 建议的仓位调整

## 重要注意事项

### 时区意识
- 考虑所有主要市场的时区
- 美国市场：晚间至凌晨（亚洲时间）
- 欧洲市场：下午至晚间（亚洲时间）
- 亚洲市场：上午至下午（当地时间）

### 经济日历优先级
按重要性分类：
- ⭐⭐⭐ 关键（FOMC、NFP、CPI 等）
- ⭐⭐ 重要（GDP、零售销售等）
- ⭐ 参考级别

### 数据来源优先级
1. 官方发布（央行、政府统计数据）
2. 主要财经媒体（Bloomberg、Reuters）
3. 券商报告
4. 分析师一致预期

## 故障排除

### 数据收集注意事项
- 检查市场假日（假日日历）
- 注意夏令时变化
- 区分初值数据与最终数据

### 市场波动应对
1. 首先梳理事实
2. 参考历史上的类似事件
3. 通过多个来源进行验证
4. 保持客观分析

## 自定义选项

根据用户的投资风格进行调整：
- **日内交易者**：关注盘中图表、订单流
- **波段交易者**：侧重日线/周线技术面
- **长期投资者**：关注基本面、宏观经济
- **外汇交易者**：货币关联性、利差
- **期权交易者**：波动率分析、希腊字母监控

## 资源

- `references/indicators.md` - 关键市场指标及解读指南
- `references/analysis_patterns.md` - 风险偏好/风险规避判定标准与跨市场关联
- `scripts/market_utils.py` - 用于报告格式化和市场状态的实用函数
