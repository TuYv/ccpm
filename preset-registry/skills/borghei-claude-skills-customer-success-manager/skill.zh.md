---
name: customer-success-manager
description: >
  Monitors customer health, predicts churn risk, and identifies expansion
  opportunities using weighted scoring models for SaaS customer success
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: business-growth
  domain: customer-success
  updated: 2026-02-06
  tags: [customer-success, churn, health-score, expansion, saas]
  python-tools: health_score_calculator.py, churn_risk_analyzer.py, expansion_opportunity_scorer.py
  tech-stack: customer-success, saas-metrics, health-scoring
---
# 客户成功经理

生产级客户成功分析，具备多维度健康度评分、客户流失风险预测和扩展机会识别功能。三个 Python CLI 工具仅使用标准库即可提供确定性、可重复的分析——无需外部依赖、API 调用或 ML 模型。

---

## 目录

- [功能](#capabilities)
- [输入要求](#input-requirements)
- [输出格式](#output-formats)
- [使用方法](#how-to-use)
- [脚本](#scripts)
- [参考指南](#reference-guides)
- [模板](#templates)
- [最佳实践](#best-practices)
- [局限性](#limitations)

---

## 功能

- **客户健康度评分**：在使用情况、参与度、支持和关系等维度进行多维加权评分，并采用红色/黄色/绿色分类
- **客户流失风险分析**：检测行为信号，并提供基于风险等级的干预行动手册和距续约时间的紧迫度乘数
- **扩展机会评分**：分析采用深度、绘制空白机会图谱并估算收入机会，同时根据投入与影响进行优先级排序
- **细分感知基准评估**：可为企业、中端市场和中小企业客户细分配置阈值
- **趋势分析**：通过逐周期比较来检测改善或下滑趋势
- **高管报告**：QBR 模板、成功计划和高管业务审查模板

---

## 输入要求

所有脚本都接受一个 JSON 文件作为位置输入参数。完整示例请参阅 `assets/sample_customer_data.json`。

### 健康度评分计算器

```json
{
  "customers": [
    {
      "customer_id": "CUST-001",
      "name": "Acme Corp",
      "segment": "enterprise",
      "arr": 120000,
      "usage": {
        "login_frequency": 85,
        "feature_adoption": 72,
        "dau_mau_ratio": 0.45
      },
      "engagement": {
        "support_ticket_volume": 3,
        "meeting_attendance": 90,
        "nps_score": 8,
        "csat_score": 4.2
      },
      "support": {
        "open_tickets": 2,
        "escalation_rate": 0.05,
        "avg_resolution_hours": 18
      },
      "relationship": {
        "executive_sponsor_engagement": 80,
        "multi_threading_depth": 4,
        "renewal_sentiment": "positive"
      },
      "previous_period": {
        "usage_score": 70,
        "engagement_score": 65,
        "support_score": 75,
        "relationship_score": 60
      }
    }
  ]
}
```

### 客户流失风险分析器

```json
{
  "customers": [
    {
      "customer_id": "CUST-001",
      "name": "Acme Corp",
      "segment": "enterprise",
      "arr": 120000,
      "contract_end_date": "2026-06-30",
      "usage_decline": {
        "login_trend": -15,
        "feature_adoption_change": -10,
        "dau_mau_change": -0.08
      },
      "engagement_drop": {
        "meeting_cancellations": 2,
        "response_time_days": 5,
        "nps_change": -3
      },
      "support_issues": {
        "open_escalations": 1,
        "unresolved_critical": 0,
        "satisfaction_trend": "declining"
      },
      "relationship_signals": {
        "champion_left": false,
        "sponsor_change": false,
        "competitor_mentions": 1
      },
      "commercial_factors": {
        "contract_type": "annual",
        "pricing_complaints": false,
        "budget_cuts_mentioned": false
      }
    }
  ]
}
```

### 扩展机会评分器

```json
{
  "customers": [
    {
      "customer_id": "CUST-001",
      "name": "Acme Corp",
      "segment": "enterprise",
      "arr": 120000,
      "contract": {
        "licensed_seats": 100,
        "active_seats": 95,
        "plan_tier": "professional",
        "available_tiers": ["professional", "enterprise", "enterprise_plus"]
      },
      "product_usage": {
        "core_platform": {"adopted": true, "usage_pct": 85},
        "analytics_module": {"adopted": true, "usage_pct": 60},
        "integrations_module": {"adopted": false, "usage_pct": 0},
        "api_access": {"adopted": true, "usage_pct": 40},
        "advanced_reporting": {"adopted": false, "usage_pct": 0}
      },
      "departments": {
        "current": ["engineering", "product"],
        "potential": ["marketing", "sales", "support"]
      }
    }
  ]
}
```

---

## 输出格式

所有脚本均可通过 `--format` 标志支持两种输出格式：

- **`text`**（默认）：供终端查看的易读格式化输出
- **`json`**：供集成和流水线使用的机器可读 JSON 输出

---

## 先澄清

在运行分析之前，请确认以下输入。如果有任何一项未知或含糊，请询问——不要自行假设：

- [ ] **分析类型**——健康度评分、流失风险或扩展机会（用于选择三个脚本之一及其输入模式）
- [ ] **客户细分**——大型企业 / 中端市场 / 中小企业（针对不同细分的阈值会改变每个红色/黄色/绿色状态和风险等级的临界值）
- [ ] **上一周期数据的可用性**——如果没有这些数据，就无法进行趋势分析（下降还是改善）
- [ ] **续约日期 / 合同结束日期**——决定流失评分中的续约时间紧迫性乘数

停止规则：只询问对输出影响最大的 2-3 项。如果用户说“直接起草”，则继续执行，并在输出顶部列出你的假设。

## 使用方法

### 快速开始

```bash
# Health scoring
python scripts/health_score_calculator.py assets/sample_customer_data.json
python scripts/health_score_calculator.py assets/sample_customer_data.json --format json

# Churn risk analysis
python scripts/churn_risk_analyzer.py assets/sample_customer_data.json
python scripts/churn_risk_analyzer.py assets/sample_customer_data.json --format json

# Expansion opportunity scoring
python scripts/expansion_opportunity_scorer.py assets/sample_customer_data.json
python scripts/expansion_opportunity_scorer.py assets/sample_customer_data.json --format json
```

### 工作流集成

```bash
# 1. Score customer health across portfolio
python scripts/health_score_calculator.py customer_portfolio.json --format json > health_results.json

# 2. Identify at-risk accounts
python scripts/churn_risk_analyzer.py customer_portfolio.json --format json > risk_results.json

# 3. Find expansion opportunities in healthy accounts
python scripts/expansion_opportunity_scorer.py customer_portfolio.json --format json > expansion_results.json

# 4. Prepare QBR using templates
# Reference: assets/qbr_template.md
```

---

## 脚本

### 1. health_score_calculator.py

**用途：** 通过趋势分析和分群感知的基准比较，对客户健康度进行多维评分。

**维度和权重：**
| 维度 | 权重 | 指标 |
|-----------|--------|---------|
| 使用情况 | 30% | 登录频率、功能采用率、DAU/MAU 比率 |
| 参与度 | 25% | 支持工单量、会议出席率、NPS/CSAT |
| 支持 | 20% | 未结工单、升级率、平均解决时间 |
| 客户关系 | 25% | 高管支持者参与度、多线联系人深度、续约意向 |

**分类：**
- 绿色（75-100）：健康 -- 客户正在实现价值
- 黄色（50-74）：需要关注 -- 密切监控
- 红色（0-49）：存在风险 -- 需要立即干预

**用法：**
```bash
python scripts/health_score_calculator.py customer_data.json
python scripts/health_score_calculator.py customer_data.json --format json
```

### 2. churn_risk_analyzer.py

**用途：** 通过检测行为信号来识别存在风险的客户，并基于风险等级提供干预建议。

**风险信号权重：**
| 信号类别 | 权重 | 指标 |
|----------------|--------|------------|
| 使用量下降 | 30% | 登录趋势、功能采用率变化、DAU/MAU 变化 |
| 参与度下降 | 25% | 会议取消、响应时间、NPS 变化 |
| 支持问题 | 20% | 未解决的升级问题、未解决的严重问题、满意度趋势 |
| 关系信号 | 15% | 内部推动者离职、支持者变更、提及竞争对手 |
| 商业因素 | 10% | 合同类型、定价投诉、预算削减 |

**风险等级：**
- 严重（80-100）：立即升级至高管层面
- 高（60-79）：CSM 紧急干预
- 中（40-59）：主动联系
- 低（0-39）：标准监控

**用法：**
```bash
python scripts/churn_risk_analyzer.py customer_data.json
python scripts/churn_risk_analyzer.py customer_data.json --format json
```

### 3. expansion_opportunity_scorer.py

**用途：** 识别向上销售、交叉销售和扩展机会，并进行收入估算和优先级排序。

**扩展类型：**
- **向上销售**：升级到更高级别，或增加现有产品的购买量
- **交叉销售**：添加新的产品模块
- **扩展**：增加席位或部门

**用法：**
```bash
python scripts/expansion_opportunity_scorer.py customer_data.json
python scripts/expansion_opportunity_scorer.py customer_data.json --format json
```

---

## 参考指南

| 参考资料 | 说明 |
|-----------|-------------|
| `references/health-scoring-framework.md` | 完整的健康度评分方法、维度定义、权重设定依据和阈值校准 |
| `references/cs-playbooks.md` | 各风险等级的干预手册，以及客户引导、续约、扩展和升级处理流程 |
| `references/cs-metrics-benchmarks.md` | 按客户分群和行业划分的 NRR、GRR、流失率、健康度评分及扩展率行业基准 |

---

## 模板

| 模板 | 用途 |
|----------|---------|
| `assets/qbr_template.md` | 季度业务回顾演示文稿结构 |
| `assets/success_plan_template.md` | 包含目标、里程碑和指标的客户成功计划 |
| `assets/onboarding_checklist_template.md` | 包含阶段关卡的 90 天客户引导检查清单 |
| `assets/executive_business_review_template.md` | 面向战略客户的高管利益相关者评审 |

---

## 最佳实践

1. **定期评分**：企业客户每周运行一次健康度评分，中端市场客户每两周一次，中小企业客户每月一次
2. **根据趋势而非快照采取行动**：健康度正在下降的绿色客户比状态稳定的黄色客户更紧急
3. **组合信号**：结合使用全部三个脚本，以获得完整的客户画像
4. **校准阈值**：根据你的产品和行业调整细分市场基准
5. **记录干预措施**：跟踪你采取的措施及其结果，以便完善行动手册
6. **用数据做好准备**：在每次 QBR 和高管会议前运行脚本

---

## 局限性

- **无实时数据**：脚本分析的是 JSON 输入文件中某一时间点的数据快照
- **无 CRM 集成**：必须从你的 CRM/CS 平台手动导出数据
- **仅支持确定性分析**：不使用预测性机器学习——评分基于加权信号通过算法计算
- **阈值调优**：默认阈值采用行业标准，但可能需要根据你的业务进行校准
- **收入估算**：扩展收入估算值是根据使用模式得出的近似值

---

---

## 工具参考

### 1. health_score_calculator.py

**用途：** 多维度客户健康度评分，支持趋势分析和基于细分市场的基准比较。

```bash
python scripts/health_score_calculator.py customer_data.json
python scripts/health_score_calculator.py customer_data.json --format json
```

| 标志 | 必需 | 说明 |
|------|----------|-------------|
| `customer_data.json` | 是 | 包含客户健康度数据（使用情况、互动情况、支持情况、关系指标）的 JSON 文件 |
| `--format` | 否 | 输出格式：text（默认）或 json |

**维度和权重：** 使用情况（30%）、互动情况（25%）、支持情况（20%）、关系（25%）

**分类：** 绿色（75-100）、黄色（50-74）、红色（0-49）——阈值会根据细分市场（企业、中端市场、中小企业）进行调整

### 2. churn_risk_analyzer.py

**用途：** 通过检测行为信号来识别有风险的账户，并根据风险等级提供干预建议。

```bash
python scripts/churn_risk_analyzer.py customer_data.json
python scripts/churn_risk_analyzer.py customer_data.json --format json
```

| 标志 | 必需 | 说明 |
|------|----------|-------------|
| `customer_data.json` | 是 | 包含客户流失风险信号（使用量下降、互动减少、支持问题、关系信号、商业因素）的 JSON 文件 |
| `--format` | 否 | 输出格式：text（默认）或 json |

**风险等级：** 严重（80-100）、高（60-79）、中（40-59）、低（0-39）

**信号权重：** 使用量下降（30%）、互动减少（25%）、支持问题（20%）、关系信号（15%）、商业因素（10%）

### 3. expansion_opportunity_scorer.py

**用途：** 识别追加销售、交叉销售和扩展机会，并提供收入估算和优先级排序。

```bash
python scripts/expansion_opportunity_scorer.py customer_data.json
python scripts/expansion_opportunity_scorer.py customer_data.json --format json
```

| 标志 | 必需 | 说明 |
|------|----------|-------------|
| `customer_data.json` | 是 | 包含客户合同、产品使用情况和部门数据的 JSON 文件 |
| `--format` | 否 | 输出格式：text（默认）或 json |

**扩展类型：**追加销售（套餐升级）、交叉销售（新模块）、扩展（席位/部门）

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|----------|
| 健康度评分与实际客户流失情况不相关 | 默认阈值与你的产品不匹配 | 使用历史客户流失数据校准各细分客户群的阈值；比较 90 天留存客户群与流失客户群 |
| 所有账户都显示为黄色 | 阈值过于严格或存在数据质量问题 | 检查输入数据的完整性；根据你所在的行业调整 health_score_calculator.py 常量中的基准值 |
| 客户流失风险评分普遍偏低 | 缺少关键信号（客户内部支持者离职、提及竞争对手） | 确保所有信号类别都有数据；缺失数据默认视为低风险，这会低估实际风险 |
| 扩展评分与实际情况不符 | 产品使用数据不完整或已过时 | 验证 product_usage 字段是否涵盖所有模块；使用从产品分析平台导出的最新数据运行 |
| 脚本处理输入数据时报错 | JSON 格式与预期 schema 不匹配 | 有关准确的 JSON 结构，请参阅“输入要求”部分；运行前验证 JSON |
| 趋势分析未显示变化 | 未提供上一周期的数据 | 在健康度评分输入中包含 previous_period 块，以进行有意义的趋势比较 |
| 干预建议过于笼统 | 未指定客户细分 | 始终包含 segment 字段（enterprise、mid-market、smb），以使用适合相应细分客户群的行动方案 |

---

## 成功标准

- 企业客户每周运行一次健康度评分，中型市场客户每两周运行一次，中小型企业客户每月运行一次
- 客户组合健康度分布：绿色占 60% 以上，红色低于 15%
- 对客户流失风险为严重级别的账户，在 48 小时内上报至高管层
- 生成的扩展销售管道覆盖净留存目标的 20% 以上
- 健康度评分趋势（改善/下降）可在续约窗口到来前推动主动触达
- 每个战略客户的 QBR 准备工作均包括健康度评分、风险评估和扩展机会
- 对所有高风险和严重风险账户执行干预行动方案

---

## 范围与限制

- **范围内：**客户健康度评分、客户流失风险分析、扩展机会识别、细分客户群基准比较、趋势分析、QBR 准备
- **范围外：**CRM 集成、实时监控、预测性 ML 建模、自动触达
- **数据依赖：**脚本分析特定时间点的 JSON 快照；必须从你的 CRM/CS 平台手动导出数据
- **确定性评分：**所有分析均基于加权信号通过算法完成，不使用机器学习预测
- **阈值调整：**默认阈值采用行业标准基准；请针对你的具体产品和客户群进行校准
- **收入估算：**扩展收入估算是基于使用模式得出的近似值，并非具有约束力的预测

---

## 集成点

- **churn-prevention** -- churn_risk_analyzer.py 识别出的高风险账户应触发取消流程优化和挽留优惠审查
- **revenue-operations** -- 扩展机会用于销售管道预测；健康度评分为预测置信度提供参考
- **onboarding-cro** -- 当健康度评分显示客户在生命周期早期使用率较低时，根本原因通常是激活不充分
- **pricing-strategy** -- 当扩展分析发现定价阻碍追加销售时，将相关信息提供给 pricing-strategy，以便审查产品打包方案
- **competitive-teardown** -- 当客户流失风险信号中包含对竞争对手的提及时，使用竞品拆解数据制定反向定位策略

---

**最后更新：** 2026 年 3 月
**工具：** 3 个 Python CLI 工具
**依赖项：** 仅使用 Python 3.7+ 标准库