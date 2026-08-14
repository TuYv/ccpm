---
name: revenue-operations
description: >
  Analyzes pipeline coverage, tracks forecast accuracy with MAPE, and calculates
  GTM efficiency metrics for SaaS revenue optimization
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: business-growth
  domain: revenue-ops
  updated: 2026-03-31
  tags: [revops, pipeline, forecast, gtm-efficiency, saas-metrics]
---
# 收入运营

面向 SaaS 收入团队的销售管道分析、预测准确性跟踪和 GTM 效率衡量。

## 目录

- [快速开始](#quick-start)
- [工具概览](#tools-overview)
  - [销售管道分析器](#1-pipeline-analyzer)
  - [预测准确性跟踪器](#2-forecast-accuracy-tracker)
  - [GTM 效率计算器](#3-gtm-efficiency-calculator)
- [收入运营工作流](#revenue-operations-workflows)
  - [每周销售管道审查](#weekly-pipeline-review)
  - [预测准确性审查](#forecast-accuracy-review)
  - [GTM 效率审计](#gtm-efficiency-audit)
  - [季度业务审查](#quarterly-business-review)
- [参考文档](#reference-documentation)
- [模板](#templates)

---

## 首先明确

运行分析之前，请确认以下输入。如果有任何一项未知或含糊不清，请提问——不要自行假设：

- [ ] **分析类型**——销售管道健康状况、预测准确性或 GTM 效率（用于选择脚本及其输入模式）
- [ ] **配额/目标**——用于衡量销售管道覆盖率和 Magic Number 的数值
- [ ] **数据导出就绪情况**——包含阶段/价值/账龄/预计成交日期的交易数据，或预测值与实际值的各期数据（这些工具使用特定的 JSON；预测趋势需要 3 个以上的期间）
- [ ] **公司阶段 + 销售模式**——种子期还是成长期，PLG 还是企业销售（基准会因阶段和模式而存在显著差异）

停止规则：只询问最能影响输出的 2-3 项。如果用户说“直接起草即可”，则继续执行，并在输出顶部列出你的假设。

## 快速开始

```bash
# Analyze pipeline health and coverage
python scripts/pipeline_analyzer.py --input assets/sample_pipeline_data.json --format text

# Track forecast accuracy over multiple periods
python scripts/forecast_accuracy_tracker.py assets/sample_forecast_data.json --format text

# Calculate GTM efficiency metrics
python scripts/gtm_efficiency_calculator.py assets/sample_gtm_data.json --format text
```

---

## 工具概览

### 1. 销售管道分析器

分析销售管道健康状况，包括覆盖率、阶段转化率、交易速度、账龄风险和集中度风险。

**输入：** 包含交易、配额和阶段配置的 JSON 文件  
**输出：** 覆盖率、转化率、速度指标、账龄标记和风险评估

**用法：**

```bash
# Text report (human-readable)
python scripts/pipeline_analyzer.py --input pipeline.json --format text

# JSON output (for dashboards/integrations)
python scripts/pipeline_analyzer.py --input pipeline.json --format json
```

**计算的关键指标：**
- **销售管道覆盖率** -- 销售管道总价值 / 配额目标（健康水平：3-4x）
- **阶段转化率** -- 从一个阶段推进到下一阶段的比率
- **销售速度** --（商机数 x 平均交易规模 x 赢单率）/ 平均销售周期
- **交易账龄** -- 标记在各阶段停留时间超过平均周期 2 倍的交易
- **集中度风险** -- 当单笔交易占销售管道的比例超过 40% 时发出警告
- **覆盖缺口分析** -- 识别销售管道不足的季度

**输入模式：**

```json
{
  "quota": 500000,
  "stages": ["Discovery", "Qualification", "Proposal", "Negotiation", "Closed Won"],
  "average_cycle_days": 45,
  "deals": [
    {
      "id": "D001",
      "name": "Acme Corp",
      "stage": "Proposal",
      "value": 85000,
      "age_days": 32,
      "close_date": "2025-03-15",
      "owner": "rep_1"
    }
  ]
}
```

### 2. 预测准确性跟踪器

使用 MAPE 跟踪预测准确性随时间的变化，检测系统性偏差，分析趋势，并提供类别层面的细分结果。

**输入：** 包含预测周期和可选类别细分数据的 JSON 文件  
**输出：** MAPE 分数、偏差分析、趋势、类别细分、准确性评级

**用法：**

```bash
# Track forecast accuracy
python scripts/forecast_accuracy_tracker.py forecast_data.json --format text

# JSON output for trend analysis
python scripts/forecast_accuracy_tracker.py forecast_data.json --format json
```

**计算的关键指标：**
- **MAPE** -- 平均绝对百分比误差：mean(|actual - forecast| / |actual|) x 100
- **预测偏差** -- 高估（正值）与低估（负值）的倾向
- **加权准确性** -- 按交易金额加权的 MAPE，以反映重要性
- **周期趋势** -- 准确性随时间改善、保持稳定或下降
- **类别细分** -- 按销售代表、产品、细分市场或任意自定义维度划分的准确性

**准确性评级：**
| 评级 | MAPE 范围 | 解读 |
|--------|-----------|----------------|
| 优秀 | <10% | 高度可预测、数据驱动的流程 |
| 良好 | 10-15% | 预测可靠，仅有轻微偏差 |
| 一般 | 15-25% | 需要改进流程 |
| 较差 | >25% | 预测方法存在重大缺陷 |

**输入模式：**

```json
{
  "forecast_periods": [
    {"period": "2025-Q1", "forecast": 480000, "actual": 520000},
    {"period": "2025-Q2", "forecast": 550000, "actual": 510000}
  ],
  "category_breakdowns": {
    "by_rep": [
      {"category": "Rep A", "forecast": 200000, "actual": 210000},
      {"category": "Rep B", "forecast": 280000, "actual": 310000}
    ]
  }
}
```

### 3. GTM 效率计算器

计算核心 SaaS GTM 效率指标，并提供行业基准比较、评级和改进建议。

**输入：** 包含收入、成本和客户指标的 JSON 文件  
**输出：** Magic Number、LTV:CAC、CAC 回收期、Burn Multiple、Rule of 40、NDR 及其评级

**用法：**

```bash
# Calculate all GTM efficiency metrics
python scripts/gtm_efficiency_calculator.py gtm_data.json --format text

# JSON output for dashboards
python scripts/gtm_efficiency_calculator.py gtm_data.json --format json
```

**计算的关键指标：**

| 指标 | 公式 | 目标 |
|--------|---------|--------|
| Magic Number | 净新增 ARR / 上一周期 S&M 支出 | >0.75 |
| LTV:CAC | (ARPA x 毛利率 / 流失率) / CAC | >3:1 |
| CAC 回收期 | CAC / (ARPA x 毛利率)，单位为月 | <18 个月 |
| Burn Multiple | 净消耗 / 净新增 ARR | <2x |
| Rule of 40 | 收入增长率 % + FCF 利润率 % | >40% |
| 净美元留存率 | (期初 ARR + 扩张 - 收缩 - 流失) / 期初 ARR | >110% |

**输入模式：**

```json
{
  "revenue": {
    "current_arr": 5000000,
    "prior_arr": 3800000,
    "net_new_arr": 1200000,
    "arpa_monthly": 2500,
    "revenue_growth_pct": 31.6
  },
  "costs": {
    "sales_marketing_spend": 1800000,
    "cac": 18000,
    "gross_margin_pct": 78,
    "total_operating_expense": 6500000,
    "net_burn": 1500000,
    "fcf_margin_pct": 8.4
  },
  "customers": {
    "beginning_arr": 3800000,
    "expansion_arr": 600000,
    "contraction_arr": 100000,
    "churned_arr": 300000,
    "annual_churn_rate_pct": 8
  }
}
```

---

## 营收运营工作流

### 每周销售管道审查

使用此工作流执行每周销售管道检查。

1. **生成销售管道报告：**
   ```bash
   python scripts/pipeline_analyzer.py --input current_pipeline.json --format text
   ```

2. **审查关键指标：**
   - 销售管道覆盖率（是否高于配额的 3 倍？）
   - 超出时限的老化交易（哪些交易需要干预？）
   - 集中度风险（是否过度依赖少数几笔大额交易？）
   - 阶段分布（销售漏斗形态是否健康？）

3. **使用模板记录：** 使用 `assets/pipeline_review_template.md`

4. **行动项：** 处理老化交易、重新分配销售管道集中度、填补覆盖缺口

### 预测准确性审查

每月或每季度使用此工作流评估并改进预测规范。

1. **生成准确性报告：**
   ```bash
   python scripts/forecast_accuracy_tracker.py forecast_history.json --format text
   ```

2. **分析趋势：**
   - MAPE 是否呈下降趋势（有所改善）？
   - 哪些销售代表或细分市场的错误率最高？
   - 是否存在系统性的高估或低估？

3. **使用模板记录：** 使用 `assets/forecast_report_template.md`

4. **改进行动：** 辅导高偏差销售代表、调整方法、改善数据质量

### GTM 效率审计

每季度或准备董事会材料时，使用此工作流评估市场进入效率。

1. **计算效率指标：**
   ```bash
   python scripts/gtm_efficiency_calculator.py quarterly_data.json --format text
   ```

2. **与目标基准进行比较：**
   - Magic Number 反映 GTM 支出效率
   - LTV:CAC 验证单位经济效益
   - CAC Payback 反映资本效率
   - Rule of 40 平衡增长与盈利能力

3. **使用模板记录：** 使用 `assets/gtm_dashboard_template.md`

4. **战略决策：** 调整支出分配、优化渠道、提高留存率

### 季度业务审查

结合使用全部三个工具，进行全面的 QBR 分析。

1. 运行销售管道分析器，评估前瞻性覆盖情况
2. 运行预测跟踪器，评估回顾性准确度
3. 运行 GTM 计算器，评估效率基准
4. 交叉比对销售管道健康度与预测准确性
5. 使 GTM 效率指标与增长目标保持一致

---

## 参考文档

| 参考资料 | 描述 |
|-----------|-------------|
| [RevOps 指标指南](references/revops-metrics-guide.md) | 完整的指标层级、定义、公式和解读 |
| [销售管道管理框架](references/pipeline-management-framework.md) | 销售管道最佳实践、阶段定义、转化基准 |
| [GTM 效率基准](references/gtm-efficiency-benchmarks.md) | 按阶段划分的 SaaS 基准、行业标准和改进策略 |

---

## 模板

| 模板 | 使用场景 |
|----------|----------|
| [销售管道审查模板](assets/pipeline_review_template.md) | 每周/每月销售管道检查文档 |
| [预测报告模板](assets/forecast_report_template.md) | 预测准确率报告和趋势分析 |
| [GTM 仪表板模板](assets/gtm_dashboard_template.md) | 供管理层审查的 GTM 效率仪表板 |
| [销售管道示例数据](assets/sample_pipeline_data.json) | pipeline_analyzer.py 的输入示例 |
| [预期输出](assets/expected_output.json) | pipeline_analyzer.py 的参考输出 |

---

## 工具参考

### 1. pipeline_analyzer.py

分析销售管道健康状况，包括覆盖率、阶段转化率、销售速度、交易老化风险和集中度风险。

```bash
python scripts/pipeline_analyzer.py --input pipeline.json --format text
python scripts/pipeline_analyzer.py --input pipeline.json --format json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必填 | 包含交易、配额和阶段配置的 JSON 文件路径 |
| `--format` | 可选 | 输出格式：`text`（默认）或 `json` |

### 2. forecast_accuracy_tracker.py

使用 MAPE 跟踪一段时间内的预测准确率，检测系统性偏差、分析趋势，并提供类别级明细。

```bash
python scripts/forecast_accuracy_tracker.py forecast_data.json --format text
python scripts/forecast_accuracy_tracker.py forecast_data.json --format json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `forecast_data.json` | 位置参数 | 包含预测周期及可选类别明细的 JSON 文件路径 |
| `--format` | 可选 | 输出格式：`text`（默认）或 `json` |

### 3. gtm_efficiency_calculator.py

计算核心 SaaS GTM 效率指标，并提供行业基准对比、评级和改进建议。

```bash
python scripts/gtm_efficiency_calculator.py gtm_data.json --format text
python scripts/gtm_efficiency_calculator.py gtm_data.json --format json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `gtm_data.json` | 位置参数 | 包含收入、成本和客户指标的 JSON 文件路径 |
| `--format` | 可选 | 输出格式：`text`（默认）或 `json` |

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| 销售管道覆盖率低于配额的 3 倍 | 漏斗顶端活动不足，或从潜在客户到销售机会的转化率不佳 | 按阶段审查潜在客户来源和转化率；增加表现不佳渠道的外呼活动或营销投入 |
| 预测 MAPE 高于 25% | 交易阶段标准不一致、保守提报或检查不严格 | 统一阶段退出标准；实施每周销售管道审查，重点关注销售速度而不只是活动量；对高偏差销售代表进行单独辅导 |
| Magic Number 低于 0.5 | 相对于新增 ARR，GTM 投入效率低下 | 审查渠道 ROI；减少在低绩效渠道上的投入；在增加人员编制前提高销售代表的生产力 |
| LTV:CAC 低于 3:1 | CAC 过高，或客户流失侵蚀了生命周期价值 | 优先解决客户流失问题（使用客户流失预防 skill）；然后通过转向成本更低的获客渠道来优化 CAC |
| 交易延迟至预测成交日期之后 | 缺乏交易资格审查、没有关键支持者或缺少迫切事件 | 实施 MEDDIC/BANT 资格审查；要求为处于承诺阶段的交易记录迫切事件 |
| 销售管道高度集中在早期阶段 | 阶段推进不畅，表明交易停滞或资格审查宽松 | 设置最长阶段停留时间限制；对在某阶段停留时间超过该阶段平均周期 2 倍的交易实施自动提醒 |
| 净美元留存率低于 100% | 收缩和客户流失超过了扩展收入 | 优先为健康客户实施扩展策略手册；对流失客户进行离网访谈；审查定价层级结构 |

---

## 成功标准

- 销售管道覆盖率稳定在配额的 3-4 倍，且各阶段分布健康
- 预测 MAPE 在两个季度内改善至低于 15%（良好）或低于 10%（优秀）
- Magic Number 超过 0.75，表明 GTM 支出高效
- LTV:CAC 比率超过 3:1，且 CAC 回收期低于 18 个月
- Rule of 40 得分超过 40%（收入增长率 % + FCF 利润率 %）
- 由扩展收入推动，Net Dollar Retention 超过 110%
- 交易延期率降至 30% 以下（相比 2024 年 44% 的行业平均水平有所改善）

---

## 范围与限制

**范围内：** 销售管道健康状况分析（覆盖率、流转速度、老化程度、集中度）、预测准确性衡量（MAPE、偏差、趋势、类别明细）、GTM 效率指标（Magic Number、LTV:CAC、CAC Payback、Burn Multiple、Rule of 40、NDR）、每周/每月/每季度审查工作流，以及结合所有三个分析维度的 QBR 准备工作。

**范围外：** CRM 系统管理或数据提取（工具使用 JSON 导出数据）、交易级销售辅导（工具会标记交易，但不会规定销售策略）、营销归因建模、客户成功健康度评分（使用 customer-success-manager skill），以及实时销售管道监控。工具分析特定时间点的快照；持续监控需要与 CRM/BI 平台集成。

**限制：** 基准基于 SaaS 行业汇总数据，并会因公司阶段（种子轮、A-C 轮、成长期、上市公司）、垂直行业和销售模式（PLG 与企业销售）而异。销售管道分析假设交易数据包含准确的阶段、价值、账龄和成交日期字段。预测准确性至少需要 3 个周期的数据才能进行趋势分析。GTM 指标需要准确的财务数据，而早期阶段的公司可能无法提供这些数据。

---

## 集成点

- **sales-engineer** -- 需要技术验证的销售管道交易将进入 sales-engineer 的 POC 和 RFP 工作流
- **customer-success-manager** -- 成交后交接；NDR 指标取决于客户成功健康度评分和扩展策略
- **pricing-strategy** -- 定价模型会影响销售管道流转速度、交易规模和转化率；定价变更后需要重新预测销售管道
- **churn-prevention** -- 客户流失率直接影响 LTV:CAC 和 NDR 指标；降低流失率可改善所有 GTM 效率指标
- **c-level-advisor** -- GTM 效率指标直接用于董事会层面的报告和战略资源分配决策