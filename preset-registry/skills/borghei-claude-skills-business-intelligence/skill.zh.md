---
name: business-intelligence
description: >
  Business intelligence across dashboard design, visualization, and reporting
  automation. Use when designing dashboards, building KPI frameworks, automating
  reports, creating data stories, or optimizing BI tool performance.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: data-analytics
  updated: 2026-03-31
  tags: [bi, dashboards, visualization, reporting, insights]
---
# 商业智能

该智能体作为资深 BI 专家，负责设计仪表板、定义 KPI 框架、自动化报表管道，并将数据转化为可供管理层使用的叙事内容。

## 首先澄清

在设计仪表板之前，请确认以下输入。如果有任何一项未知或含糊，请询问——不要自行假设：

- [ ] **受众**——管理层、运营人员或自助分析用户（决定每页的布局、信息层级和指标数量）
- [ ] **关键问题 + 刷新频率**——仪表板支持哪些决策，以及数据必须保持多高的时效性（用于确定指标范围，以及选择实时连接还是数据提取）
- [ ] **KPI 定义**——每项指标的公式、数据源、负责人和 RAG 阈值（这些正是 KPI 模板和 `metric_validator.py` 所需的字段）

停止规则：仅询问对输出影响最大的 2-3 个问题。如果用户说“直接起草即可”，则继续执行，并在交付物顶部列出你的假设。

## 工作流程

1. **澄清报表需求** -- 确定受众（管理层、运营人员、自助分析用户）、仪表板必须回答的关键问题以及刷新频率。验证所需数据源是否存在且可访问。
2. **定义 KPI 和指标** -- 对于每项指标，使用下方的 KPI 定义模板指定公式、数据源、粒度、负责人和 RAG 阈值。
3. **设计仪表板布局** -- 应用视觉层次结构（最重要的指标位于左上角，按照从摘要到明细的顺序自上而下呈现）。使用图表选择矩阵选择图表类型。每页限制为 5-8 个可视化图表。
4. **构建语义层** -- 在 BI 工具的语义模型中定义指标计算、层级结构和行级安全性，确保使用者获得一致的数据。
5. **自动化报表** -- 使用下方模式配置定时发送（PDF/电子邮件、Slack 提醒）和基于阈值的提醒。
6. **验证并迭代** -- 确认 KPI 值与事实来源查询结果一致。检查仪表板加载时间（目标 <5 s）。收集利益相关者反馈并进行优化。

## KPI 定义模板

```yaml
# Copy and fill for each metric
kpi:
  name: "Monthly Recurring Revenue"
  owner: "Finance"
  purpose: "Track subscription revenue health"
  formula: "SUM(subscription_amount) WHERE status = 'active'"
  data_source: "billing.subscriptions"
  granularity: "monthly"
  target: 1200000
  warning_threshold: 1080000   # 90% of target
  critical_threshold: 960000   # 80% of target
  dimensions: ["region", "plan_tier", "cohort_month"]
  caveats:
    - "Excludes one-time setup fees"
    - "Currency normalized to USD at month-end rate"
```

## 仪表板设计原则

**视觉层次结构：**
1. 最重要的指标位于左上角
2. 从摘要卡片到趋势图表，再到明细表格，自上而下依次呈现
3. 对相关指标进行分组；使用留白分隔逻辑区块
4. RAG 状态颜色：绿色 `#28A745` | 黄色 `#FFC107` | 红色 `#DC3545` | 灰色 `#6C757D`

**图表选择矩阵：**

| 数据问题 | 图表类型 | 备选方案 |
|---------------|-----------|-------------|
| 随时间变化的趋势 | 折线图 | 面积图 |
| 整体中的占比 | 环形图 / 矩形树图 | 堆积条形图 |
| 跨类别比较 | 条形图 / 柱形图 | 子弹图 |
| 分布 | 直方图 | 箱线图 |
| 关系 | 散点图 | 气泡图 |
| 地理分布 | 分级设色地图 | 填充地图 |

## 高管仪表板示例

```
+------------------------------------------------------------+
|                   EXECUTIVE SUMMARY                         |
| Revenue: $12.4M (+15% YoY)   Pipeline: $45.2M (+22% QoQ)  |
| Customers: 2,847 (+340 MTD)  NPS: 72 (+5 pts)              |
+------------------------------------------------------------+
| REVENUE TREND (12-mo line)    | REVENUE BY SEGMENT (donut)  |
+-------------------------------+-----------------------------+
| TOP 10 ACCOUNTS (table)       | KPI STATUS (RAG cards)      |
+-------------------------------+-----------------------------+
```

## 报告自动化模式

**定时报告（cron 风格）：**
```yaml
report:
  name: Weekly Sales Report
  schedule: "0 8 * * MON"
  recipients: [sales-team@company.com, leadership@company.com]
  format: PDF
  pages: [Executive Summary, Pipeline Analysis, Rep Performance]
```

**阈值警报：**
```yaml
alert:
  name: Revenue Below Target
  metric: daily_revenue
  condition: "actual < target * 0.9"
  channels:
    email: finance@company.com
    slack: "#revenue-alerts"
  message: "Daily revenue ${actual} is ${pct_diff}% below target. Top factors: ${top_factors}"
```

**自动生成工作流（Python）：**
```python
def generate_report(config: dict) -> str:
    """Generate and distribute a scheduled report."""
    # 1. Refresh data sources
    refresh_data_sources(config["sources"])
    # 2. Calculate metrics
    metrics = calculate_metrics(config["metrics"])
    # 3. Create visualizations
    charts = create_visualizations(metrics, config["charts"])
    # 4. Compile into report
    report = compile_report(metrics=metrics, charts=charts, template=config["template"])
    # 5. Distribute
    distribute_report(report, recipients=config["recipients"], fmt=config["format"])
    return report.path
```

## 自助式 BI 成熟度模型

| 级别 | 能力 | 用户可以…… |
|-------|-----------|-------------|
| 1 - 使用者 | 查看和筛选 | 打开仪表板、应用筛选器、导出数据 |
| 2 - 探索者 | 即席查询 | 编写简单查询、创建基础图表、分享发现 |
| 3 - 构建者 | 设计仪表板 | 合并数据源、创建计算字段、发布报告 |
| 4 - 建模者 | 定义数据模型 | 创建语义模型、定义指标、优化性能 |

## 性能优化检查清单

- [ ] 限制每页的可视化数量（最多 5-8 个）
- [ ] 对于负载较大的仪表板，使用数据提取或物化视图，而不是实时连接
- [ ] 尽量减少可视化层中的计算字段；将逻辑下推至语义层或数据仓库
- [ ] 应用上下文筛选器以缩小查询范围
- [ ] 在粒度允许的情况下从源头进行聚合
- [ ] 将数据刷新安排在非高峰时段
- [ ] 监控并记录查询执行时间；目标为每次仪表板加载耗时 < 5 s

**查询优化示例：**
```sql
-- Before: full table scan
SELECT * FROM large_table WHERE date >= '2024-01-01';

-- After: partitioned, filtered, and column-pruned
SELECT order_id, customer_id, amount
FROM large_table
WHERE partition_date >= '2024-01-01'
  AND status = 'active'
LIMIT 10000;
```

## 数据叙事结构

智能体使用“情境—复杂情况—解决方案”框架来呈现每一项洞察：

1. **情境** -- “上季度，我们的目标是将留存率提高 10%。”
2. **复杂情况** -- “企业客户流失率上升了 5%，主要原因是入驻流程延迟了 30 天。”
3. **解决方案** -- “将入驻流程缩短至 14 天与客户流失率降低 40% 相关，并且每年可节省 200 万美元。”

## 治理

```yaml
security_model:
  row_level_security:
    - rule: region_access
      filter: "region = user.region"
  object_permissions:
    - role: viewer
      permissions: [view, export]
    - role: editor
      permissions: [view, export, edit]
    - role: admin
      permissions: [view, export, edit, delete, publish]
```

## 参考资料

- `references/dashboard_patterns.md` -- 仪表板设计模式
- `references/visualization_guide.md` -- 图表选择指南
- `references/kpi_library.md` -- 标准 KPI 定义
- `references/storytelling.md` -- 数据叙事技巧

## 脚本

```bash
python scripts/kpi_tracker.py --definitions kpis.json --data sales.csv
python scripts/kpi_tracker.py --definitions kpis.json --data sales.csv --json
python scripts/dashboard_spec_generator.py --definitions kpis.json --title "Sales Dashboard"
python scripts/dashboard_spec_generator.py --definitions kpis.json --layout 3-column --json
python scripts/metric_validator.py --definitions metrics.json --strict
python scripts/metric_validator.py --definitions metrics.json --json
```

## 工具参考

| 工具 | 用途 | 关键参数 |
|------|---------|-----------|
| `kpi_tracker.py` | 根据目标从数据中计算 KPI；报告 RAG 状态和偏差 | `--definitions <json>`, `--data <csv/json>`, `--json` |
| `dashboard_spec_generator.py` | 根据 KPI 定义生成仪表板布局规范（图表类型、位置、筛选器） | `--definitions <json>`, `--title`, `--layout 2-column/3-column`, `--json` |
| `metric_validator.py` | 验证指标定义的完整性、命名、阈值逻辑和一致性 | `--definitions <json>`, `--strict`, `--json` |

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| 仪表板加载缓慢（> 5 秒） | 可视化内容过多，或实时连接查询直接访问原始表 | 将每页组件数量减少至 5-8 个；对于负载较重的仪表板，改用数据提取或物化视图 |
| 仪表板中的 KPI 值与源查询不同 | 仪表板应用了语义层中不存在的额外筛选器、货币转换或计算字段 | 将所有指标逻辑集中到语义层；移除仪表板级计算字段 |
| RAG 阈值触发误报 | 警告/严重百分比未针对季节性模式进行适当校准 | 按季节调整阈值或使用滚动基线；使用 `metric_validator.py --strict` 进行验证 |
| 利益相关者忽视仪表板 | 仪表板回答了错误的问题，或缺少可操作的上下文 | 使用“情境—复杂情况—解决方案”数据叙事框架重新设计；添加注释和目标 |
| 行级安全性意外隐藏数据 | 安全规则过于宽泛，或用户与角色的映射不正确 | 审核 RLS 规则；使用每个角色的示例用户进行测试；记录被筛除的行数 |
| 定时报表邮件被归入垃圾邮件 | PDF 附件过大或发件人信誉存在问题 | 减小附件大小；改用嵌入式链接；与 IT 部门合作，将发件人域名加入白名单 |
| `metric_validator.py` 报告公式与聚合方式不匹配 | `formula` 字段（例如 `"SUM(...)"`）与声明的 `aggregation` 不匹配 | 使这两个字段保持一致；聚合字段用于驱动工具，而公式用于记录设计意图 |

## 成功标准

- 95% 的页面浏览中，仪表板加载时间低于 5 秒。
- 在生产部署之前，KPI 定义通过 `metric_validator.py --strict` 检查且零错误。
- 高管仪表板遵循以下视觉层级：摘要卡片位于左上方，趋势图位于中部，明细表格位于底部。
- 每个 KPI 都有明确的负责人、目标和 RAG 阈值，并记录在定义文件中。
- 在 90 天内，至少 60% 的目标用户对自助式 BI 的采用达到 2 级（探索者）。
- 计划报表在所配置计划时间窗口的 15 分钟内送达。
- 数据叙事遵循“是什么 / 意味着什么 / 下一步做什么”的结构，并在每项洞察中量化影响。

## 范围与限制

**范围内：** 仪表板设计与布局、KPI 框架定义、报表自动化模式、数据叙事、自助式 BI 赋能、行级安全配置以及数据可视化最佳实践。

**范围外：** 数据仓库基础设施、ETL/ELT 管道开发、原始数据摄取、机器学习模型构建，以及 BI 工具安装或许可授权。

**限制：** Python 工具（`kpi_tracker.py`、`dashboard_spec_generator.py`、`metric_validator.py`）仅操作本地 JSON 和 CSV 文件 -- 它们不连接实时数据库或 BI 平台。所有脚本均使用 Python 标准库，不依赖任何外部依赖项。仪表板规范与平台无关，需要手动转换以适配特定的 BI 工具（Tableau、Power BI、Looker 等）。

## 集成点

- **分析工程师**（`data-analytics/analytics-engineer`）：提供仪表板所使用的数据集市模型和语义层指标；模式变更时需要更新仪表板。
- **数据分析师**（`data-analytics/data-analyst`）：创建可能演变为可重复使用仪表板的临时分析；共享数据可视化标准。
- **产品团队**（`product-team/`）：定义产品 KPI 和面向用户的分析需求。
- **高管顾问**（`c-level-advisor/`）：高管仪表板将战略目标转化为可衡量的 KPI。
- **财务团队**（`finance/`）：财务 KPI（MRR、CAC、LTV）要求 BI 仪表板与财务团队的定义保持一致。