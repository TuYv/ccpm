---
name: "campaign-analytics"
description: Analyzes campaign performance with multi-touch attribution, funnel conversion analysis, and ROI calculation for marketing optimization. Use when analyzing marketing campaigns, ad performance, attribution models, conversion rates, or calculating marketing ROI, ROAS, CPA, and campaign metrics across channels.
license: MIT
metadata:
  version: 1.0.0
  author: Alireza Rezvani
  category: marketing
  domain: campaign-analytics
  updated: 2026-02-06
  python-tools: attribution_analyzer.py, funnel_analyzer.py, campaign_roi_calculator.py
  tech-stack: marketing-analytics, attribution-modeling
---
# 营销活动分析

生产级营销活动绩效分析，涵盖多触点归因建模、漏斗转化分析和 ROI 计算。三个 Python CLI 工具仅使用标准库，即可提供确定性、可重复的分析——无需外部依赖、API 调用或 ML 模型。

---

## 输入要求

所有脚本都接受一个 JSON 文件作为位置输入参数。完整示例请参阅 `assets/sample_campaign_data.json`。

### 归因分析器

```json
{
  "journeys": [
    {
      "journey_id": "j1",
      "touchpoints": [
        {"channel": "organic_search", "timestamp": "2025-10-01T10:00:00", "interaction": "click"},
        {"channel": "email", "timestamp": "2025-10-05T14:30:00", "interaction": "open"},
        {"channel": "paid_search", "timestamp": "2025-10-08T09:15:00", "interaction": "click"}
      ],
      "converted": true,
      "revenue": 500.00
    }
  ]
}
```

### 漏斗分析器

```json
{
  "funnel": {
    "stages": ["Awareness", "Interest", "Consideration", "Intent", "Purchase"],
    "counts": [10000, 5200, 2800, 1400, 420]
  }
}
```

### 营销活动 ROI 计算器

```json
{
  "campaigns": [
    {
      "name": "Spring Email Campaign",
      "channel": "email",
      "spend": 5000.00,
      "revenue": 25000.00,
      "impressions": 50000,
      "clicks": 2500,
      "leads": 300,
      "customers": 45
    }
  ]
}
```

### 输入验证

运行脚本之前，请验证 JSON 是否有效并符合预期的模式。常见错误包括：

- **缺少必需的键**（例如 `journeys`、`funnel.stages`、`campaigns`）→ 脚本退出并返回描述性 `KeyError`
- 漏斗数据中的**数组长度不匹配**（`stages` 和 `counts` 的长度必须相同）→ 引发 `ValueError`
- ROI 数据中的**非数值型货币值** → 引发 `TypeError`

将 JSON 传递给任何脚本之前，请使用 `python -m json.tool your_file.json` 验证 JSON 语法。

---

## 输出格式

所有脚本都通过 `--format` 标志支持两种输出格式：

- `--format text`（默认）：供审查使用的易读表格和摘要
- `--format json`：供集成和流水线使用的机器可读 JSON

---

## 典型分析工作流

如需完整审查营销活动，请依次运行这三个脚本：

```bash
# Step 1 — Attribution: understand which channels drive conversions
python scripts/attribution_analyzer.py campaign_data.json --model time-decay

# Step 2 — Funnel: identify where prospects drop off on the path to conversion
python scripts/funnel_analyzer.py funnel_data.json

# Step 3 — ROI: calculate profitability and benchmark against industry standards
python scripts/campaign_roi_calculator.py campaign_data.json
```

使用归因结果识别表现最佳的渠道，然后将漏斗分析重点放在这些渠道的细分群体上，最后验证 ROI 指标，以确定预算重新分配的优先级。

---

## 使用方法

### 归因分析

```bash
# Run all 5 attribution models
python scripts/attribution_analyzer.py campaign_data.json

# Run a specific model
python scripts/attribution_analyzer.py campaign_data.json --model time-decay

# JSON output for pipeline integration
python scripts/attribution_analyzer.py campaign_data.json --format json

# Custom time-decay half-life (default: 7 days)
python scripts/attribution_analyzer.py campaign_data.json --model time-decay --half-life 14
```

### 漏斗分析

```bash
# Basic funnel analysis
python scripts/funnel_analyzer.py funnel_data.json

# JSON output
python scripts/funnel_analyzer.py funnel_data.json --format json
```

### 营销活动 ROI 计算

```bash
# Calculate ROI metrics for all campaigns
python scripts/campaign_roi_calculator.py campaign_data.json

# JSON output
python scripts/campaign_roi_calculator.py campaign_data.json --format json
```

---

## 脚本

### 1. attribution_analyzer.py

实现五种行业标准的归因模型，用于在各营销渠道之间分配转化功劳：

| 模型 | 描述 | 最适合 |
|-------|-------------|----------|
| 首次触点 | 将 100% 的功劳归于第一次互动 | 品牌认知营销活动 |
| 最终触点 | 将 100% 的功劳归于最后一次互动 | 直接响应营销活动 |
| 线性 | 将功劳平均分配给所有触点 | 均衡的多渠道评估 |
| 时间衰减 | 越接近转化的触点获得越多功劳 | 较短的销售周期 |
| 基于位置 | 按 40/20/40 的比例分配（首次/中间/最终） | 全漏斗营销 |

### 2. funnel_analyzer.py

分析转化漏斗，以识别瓶颈和优化机会：

- 各阶段之间的转化率和流失百分比
- 自动识别瓶颈（绝对流失和相对流失最大的阶段）
- 整体漏斗转化率
- 提供多个细分群体时进行细分群体比较

### 3. campaign_roi_calculator.py

结合行业基准计算全面的 ROI 指标：

- **ROI**：投资回报率百分比
- **ROAS**：广告支出回报率
- **CPA**：单次获客成本
- **CPL**：单条潜在客户成本
- **CAC**：客户获取成本
- **CTR**：点击率
- **CVR**：转化率（潜在客户转化为客户）
- 根据行业基准标记表现不佳的营销活动

---

## 参考指南

| 指南 | 位置 | 用途 |
|-------|----------|---------|
| 归因模型指南 | `references/attribution-models-guide.md` | 深入介绍 5 种模型，包括公式、优缺点和选择标准 |
| 营销活动指标基准 | `references/campaign-metrics-benchmarks.md` | 按渠道和垂直领域提供 CTR、CPC、CPM、CPA、ROAS 的行业基准 |
| 漏斗优化框架 | `references/funnel-optimization-framework.md` | 分阶段优化策略、常见瓶颈和最佳实践 |

---

## 最佳实践

1. **使用多种归因模型**——至少比较 3 种模型，以交叉验证渠道价值；任何单一模型都无法呈现完整情况。
2. **设置适当的回溯窗口**——使时间衰减半衰期与平均销售周期长度相匹配。
3. **细分漏斗**——比较不同细分群体（渠道、同期群、地理区域），以识别绩效驱动因素。
4. **优先以自身历史数据为基准**——行业基准可提供背景参考，但历史数据才是最相关的比较依据。
5. **定期开展 ROI 分析**——活跃营销活动每周分析一次，战略复盘每月分析一次。
6. **计入所有成本**——除媒体支出外，还应计入创意、工具和人力成本，以准确计算 ROI。
7. **严格记录 A/B 测试**——使用所提供的模板，以确保统计有效性和明确的决策标准。

---

## 局限性

- **不提供统计显著性检验** -- 脚本仅提供描述性指标；p 值计算需要使用外部工具。
- **仅使用标准库** -- 不使用高级统计库。适用于大多数营销活动规模，但未针对超过 10 万条用户旅程的数据集进行优化。
- **离线分析** -- 脚本分析静态 JSON 快照；不支持实时数据连接或 API 集成。
- **仅支持单一货币** -- 假定所有货币金额均采用同一种货币；不支持货币换算。
- **简化的时间衰减** -- 根据可配置的半衰期进行指数衰减；未考虑工作日/周末或季节性模式。
- **不支持跨设备追踪** -- 归因按所提供的用户旅程数据原样进行；跨设备身份解析必须在上游完成。

## 相关技能

- **analytics-tracking**：用于设置追踪。不用于分析数据（那是本技能的用途）。
- **ab-test-setup**：用于设计实验，以检验分析所揭示的结果。
- **marketing-ops**：用于将洞察分派给合适的执行技能。
- **paid-ads**：用于根据分析结果优化广告支出。