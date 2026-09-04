---
name: kpi-dashboard-design
description: Design effective KPI dashboards with metrics selection, visualization best practices, and real-time monitoring patterns. Use this skill when building an executive SaaS metrics dashboard tracking MRR, churn, and LTV/CAC ratios; designing an operations center with live service health and request throughput; creating a cohort retention analysis view for a product team; or debugging a dashboard where metrics contradict each other due to inconsistent calculation methodology.
---
# KPI 仪表盘设计

用于设计能够驱动业务决策的有效关键绩效指标（KPI）仪表盘的综合模式集合。

## 何时使用本技能

- 设计高管级仪表盘
- 选取有意义的 KPI
- 构建实时监控展示屏
- 创建针对特定部门的指标视图
- 改进现有仪表盘布局
- 建立指标治理机制

## 核心概念

### 1. KPI 框架

| 层级             | 关注点            | 更新频率          | 受众       |
| --------------- | ---------------- | ----------------- | ---------- |
| **战略层**      | 长期目标         | 每月/每季度       | 高管       |
| **战术层**      | 部门目标         | 每周/每月         | 经理       |
| **运营层**      | 日常工作         | 实时/每日         | 团队       |

### 2. SMART KPI

```
Specific: Clear definition
Measurable: Quantifiable
Achievable: Realistic targets
Relevant: Aligned to goals
Time-bound: Defined period
```

### 3. 仪表盘层级

```
├── Executive Summary (1 page)
│   ├── 4-6 headline KPIs
│   ├── Trend indicators
│   └── Key alerts
├── Department Views
│   ├── Sales Dashboard
│   ├── Marketing Dashboard
│   ├── Operations Dashboard
│   └── Finance Dashboard
└── Detailed Drilldowns
    ├── Individual metrics
    └── Root cause analysis
```

## 详细的实战示例与模式

详细章节（以 `## Common KPIs by Department` 开头）位于 `references/details.md` 中。当上面的导航摘要不够用时，请阅读该文件。

## 最佳实践

### 应该做的

- **限制在 5-7 个 KPI** - 聚焦于真正重要的事情
- **展示上下文** - 对比、趋势、目标值
- **使用一致的配色** - 红色=差，绿色=好
- **支持下钻** - 从摘要深入到细节
- **合理更新** - 与指标频率相匹配

### 不应该做的

- **不要展示虚荣指标** - 聚焦于可付诸行动的数据
- **不要过度拥挤** - 留白有助于理解
- **不要使用 3D 图表** - 它们会扭曲感知
- **不要隐藏方法论** - 记录计算方法
- **不要忽视移动端** - 确保响应式设计

## 故障排查

### 仪表盘上显示的 MRR 与财务部门的数字不一致

最常见的原因是对年度方案的处理方式不一致。财务部门可能按每日费率折算，而仪表盘则按月度进行标准化。双方应统一采用单一公式，并将其直接记录在仪表盘卡片上：

```sql
-- Explicit formula shown in tooltip / data dictionary
-- Annual plans: divide total contract value by 12
-- Quarterly plans: divide by 3
-- Monthly plans: use as-is
CASE subscription_interval
    WHEN 'monthly'   THEN amount
    WHEN 'quarterly' THEN amount / 3.0
    WHEN 'yearly'    THEN amount / 12.0
END AS normalized_mrr
```

### 仪表盘显示绿色，但产品团队反映用户在抱怨

仪表盘很可能只跟踪了系统正常运行时间（滞后指标），而没有跟踪面向用户的质量指标。请在基础设施指标之外补充客户感知指标：

| 基础设施（绿色） | 用户感知（补充这些） |
|---|---|
| API 正常运行时间 99.9% | P95 页面加载时间 |
| 错误率 0.1% | 任务完成率 |
| 队列深度正常 | 支持工单量 |

### 留存同期群曲线平坦 —— 各同期群之间没有差异

检查同期群查询是否正确按注册月份进行分区。一个常见的 Bug 是使用 `created_at::date` 而非 `DATE_TRUNC('month', created_at)`，前者按天分组，导致同期群规模过小而无法展现趋势：

```sql
-- Wrong: too granular, cohorts are too small
DATE_TRUNC('day', created_at) AS cohort_date

-- Correct: monthly cohorts
DATE_TRUNC('month', created_at) AS cohort_month
```

### 实时仪表盘使数据库不堪重负

一个每 10 秒刷新一次、并带有复杂同期群 SQL 的实时仪表盘会拖累生产环境的查询性能。应通过定时任务将预聚合的指标写入汇总表，从而将 OLAP 工作负载与 OLTP 分离，并让仪表盘从该表读取数据：

```python
# Scheduled every 5 minutes via cron/Celery
def refresh_mrr_summary():
    conn.execute("""
        INSERT INTO kpi_snapshot (metric, value, snapshot_at)
        SELECT 'mrr', SUM(...), NOW()
        FROM subscriptions WHERE status = 'active'
        ON CONFLICT (metric) DO UPDATE SET value = EXCLUDED.value
    """)
```

### 告警频繁触发，团队对其视而不见

一次性设置后再未复核的静态阈值会导致告警疲劳。应使用基于滚动均值的动态阈值，使告警仅在指标显著偏离其自身基线时才触发：

```python
# Alert if current value is > 2 standard deviations from 30-day rolling mean
def is_anomalous(current: float, history: list[float]) -> bool:
    mean = statistics.mean(history)
    stdev = statistics.stdev(history)
    return abs(current - mean) > 2 * stdev
```

## 相关技能

- `data-storytelling` - 将仪表盘中的发现转化为能推动高管决策的叙事
