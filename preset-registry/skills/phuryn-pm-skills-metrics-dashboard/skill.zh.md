---
name: metrics-dashboard
description: "Define and design a product metrics dashboard with key metrics, data sources, visualization types, and alert thresholds. Use when creating a metrics dashboard, defining KPIs, setting up product analytics, or building a data monitoring plan."
---
## 产品指标仪表板

使用正确的指标、可视化方式和告警阈值，设计一个全面的产品指标仪表板。

### 背景

你正在为 **$ARGUMENTS** 设计指标仪表板。

如果用户提供了文件（现有仪表板、分析数据、OKR 或战略文档），请先阅读这些文件。

### 领域背景

**指标 vs KPI vs NSM**：指标 = 所有可衡量的事物。KPI = 在较长时间段内持续跟踪的少数几个关键量化指标。北极星指标 = 以客户为中心的单一 KPI，是业务成功的领先指标。

**优秀指标的 4 个标准**（Ben Yoskovitz，《*精益分析*》）：(1) 易于理解——形成共同语言。(2) 可比较——关注一段时间内的变化，而不是某个快照。(3) 比率或速率——比完整数值更能揭示问题。(4) 能改变行为——黄金法则：“如果一个指标不会改变你的行为，那么它就是一个糟糕的指标。”

**8 种指标类型**：虚荣指标 vs 可行动指标（只有可行动指标才能改变行为）、定性指标 vs 定量指标（WHAT vs WHY——两者都需要；永远不要停止与客户交流）、探索性指标 vs 报告性指标（通过探索数据发现意外洞察）、滞后指标 vs 领先指标（领先指标可以实现更快的学习周期，例如客户投诉可以预测流失）。

**5 个行动步骤**：(1) 根据优秀指标的 4 个标准审查指标。(2) 更新仪表板——确保所有关键指标都是优秀指标。(3) 识别虚荣指标——谨慎使用这些指标。(4) 区分领先指标和滞后指标。(5) 选择一个问题，深入挖掘数据。

如需案例研究和更多细节，请参阅 Ben Yoskovitz 撰写的[你跟踪的是正确的指标吗？](https://www.productcompass.pm/p/are-you-tracking-the-right-metrics)

### 指令

1. **确定指标框架**——将指标组织为多个层级：

   **北极星指标**：最能体现核心价值交付情况的单一指标

   **输入指标**（3-5 个）：推动北极星指标的杠杆因素

   **健康指标**：确保整体产品健康状况的护栏指标

   **业务指标**：收入、成本和单位经济效益

2. **为每个指标定义**：

   | 指标 | 定义 | 数据来源 | 可视化方式 | 目标 | 告警阈值 |
   |---|---|---|---|---|---|
   | [名称] | [精确计算方式：分子/分母、时间窗口] | [数据来源] | [折线图 / 柱状图 / 数值 / 漏斗图] | [目标值] | [触发告警的条件] |

3. **设计仪表板布局**：

   ```
   ┌─────────────────────────────────────────────┐
   │  NORTH STAR: [Metric] — [Current Value]     │
   │  Trend: [↑/↓ X% vs last period]             │
   ├──────────────────┬──────────────────────────┤
   │  Input Metric 1  │  Input Metric 2          │
   │  [Sparkline]     │  [Sparkline]             │
   ├──────────────────┼──────────────────────────┤
   │  Input Metric 3  │  Input Metric 4          │
   │  [Sparkline]     │  [Sparkline]             │
   ├──────────────────┴──────────────────────────┤
   │  HEALTH: [Latency] [Error Rate] [NPS]       │
   ├─────────────────────────────────────────────┤
   │  BUSINESS: [MRR] [CAC] [LTV] [Churn]        │
   └─────────────────────────────────────────────┘
   ```

4. **设定评审频率**：
   - **每日**：运营健康状况（错误、延迟、关键流程）
   - **每周**：输入指标和参与度趋势
   - **每月**：北极星指标、业务指标、OKR 进展
   - **每季度**：战略评审和指标重新校准

5. **定义告警**：
   - 哪些阈值会触发调查？
   - 谁会收到告警，以及通过什么渠道？
   - 预期响应时间是多少？

6. 根据用户的具体情况**推荐工具**：
   - Amplitude、Mixpanel、PostHog 用于产品分析
   - Looker、Metabase、Mode 用于基于 SQL 的仪表板
   - Datadog、Grafana 用于运营健康状况监控

逐步思考。将仪表板规格保存为 Markdown 文档。

---

### 延伸阅读

- [产品指标终极清单](https://www.productcompass.pm/p/the-ultimate-list-of-product-metrics)
- [北极星框架 101](https://www.productcompass.pm/p/the-north-star-framework-101)
- [产品分析实战指南：面向产品经理的 AARRR、HEART、队列分析与漏斗分析](https://www.productcompass.pm/p/the-product-analytics-playbook-aarrr)
- [AARRR（海盗）指标：增长的五阶段框架](https://www.productcompass.pm/p/aarrr-pirate-metrics)
- [Google HEART 框架：以用户为中心的成功度量指南](https://www.productcompass.pm/p/the-google-heart-framework)
- [漏斗分析 101：如何跟踪并优化用户旅程](https://www.productcompass.pm/p/funnel-analysis)
- [你是否在跟踪正确的指标？](https://www.productcompass.pm/p/are-you-tracking-the-right-metrics)
- [持续产品探索大师课（CPDM）](https://www.productcompass.pm/p/cpdm)（视频课程）。