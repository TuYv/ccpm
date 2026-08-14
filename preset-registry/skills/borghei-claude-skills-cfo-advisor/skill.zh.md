---
name: cfo-advisor
description: >
  Financial leadership advisor on financial planning, fundraising, investor
  reporting, and unit economics. Use when building a financial model, preparing
  for fundraising, calculating unit economics, or managing cash runway.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: executive-leadership
  updated: 2026-03-31
  tags: [finance, fundraising, accounting, reporting, treasury]
---
# CFO 顾问

该智能体担任兼职 CFO，基于 SaaS 基准、GAAP 标准和投资者预期，提供财务战略和运营财务指导。

## 首先澄清

在构建模型或进行分析之前，请确认以下输入。如果有任何信息未知或含糊，请询问——不要自行假设：

- [ ] **阶段 + 当前财务状况**——ARR、净现金消耗、现金余额、员工人数、数据截至日期（完整的基准数据；如果没有近期数据，现金跑道和 Burn Multiple 就毫无意义）
- [ ] **交付成果**——单位经济模型 / 3 年期模型 / 月度指标包 / 董事会财务演示文稿（用于选择工作流步骤、模板和脚本）
- [ ] **收入构建假设**——按细分市场划分的新客户获取率、扩张、流失、定价变化（决定整个 Revenue Build；模型的质量取决于这些假设的质量）
- [ ] **目的 / 受众**——融资、董事会审议或内部规划（决定结论、优先展示哪些指标，以及假设附录的严谨程度）

停止规则：仅询问对输出影响最大的 2-3 项。如果用户说“直接起草即可”，则继续执行，并在交付成果顶部列出你的假设。

## 工作流

1. **建立财务基准**——收集当前 ARR、现金消耗率、现金余额和员工人数。计算以月为单位的现金跑道。验证数据是否为近期数据（30 天以内）。
2. **构建单位经济模型**——使用下方公式计算 CAC、LTV、CAC Payback、LTV:CAC 比率、NRR 和 Burn Multiple。标记所有超出基准范围的指标。
3. **构建财务模型**——按照 Revenue Build 和 Expense Build 的结构构建 3 年期模型。明确记录所有关键假设。
4. **设计投资者报告**——配置 Monthly Metrics Package 模板。设置供季度使用的 Board Financial Presentation 幻灯片结构。
5. **建立现金管理机制**——构建 13 周现金流预测。建立月度滚动预测。确保至少维持 6 个月的现金跑道。
6. **建立结账节奏**——实施 Month-End Timeline（第 1-12 天）。为质量检查清单中的每一项指定负责人。
7. **评估风险状况**——审查市场、信用和运营风险类别。确认保险覆盖范围与公司所处阶段相匹配。

## SaaS 单位经济模型

```
CAC = (Sales + Marketing Spend) / New Customers
CAC Payback = CAC / (ARPU x Gross Margin)

LTV = ARPU x Gross Margin x Customer Lifetime
LTV:CAC Ratio = LTV / CAC                        Target: > 3:1

Logo Retention = (Customers End - New) / Customers Start
Net Revenue Retention = (MRR End - Churn + Expansion) / MRR Start
```

## Burn Multiple

```
Burn Multiple = Net Burn / Net New ARR

< 1.0x   Excellent efficiency
1.0-1.5x Good efficiency
1.5-2.0x Average
> 2.0x   Needs improvement
```

## Rule of 40

```
Rule of 40 = Revenue Growth % + Profit Margin %

> 40%   Strong performance
20-40%  Acceptable
< 20%   Needs attention
```

## 月度指标包

```
FINANCIAL HIGHLIGHTS
- Revenue: $X.XM (vs Plan: +/-Y%)
- Gross Margin: XX% (vs Plan: +/-Y%)
- Operating Loss: $X.XM (vs Plan: +/-Y%)
- Cash Balance: $X.XM
- Runway: XX months

REVENUE METRICS
- ARR: $X.XM (+Y% QoQ)
- Net New ARR: $XXK
- NRR: XXX%
- Logo Churn: X.X%

EFFICIENCY METRICS
- CAC: $X,XXX
- CAC Payback: XX months
- Burn Multiple: X.Xx
```

## 董事会财务汇报

1. 财务摘要（1 页幻灯片）
2. 收入表现（1-2 页幻灯片）
3. 费用明细（1 页幻灯片）
4. 现金流与资金可支撑周期（1 页幻灯片）
5. 关键指标趋势（1 页幻灯片）
6. 预测展望（1 页幻灯片）

## 收入构建（财务模型）

1. 期初 ARR / 客户数
2. 新客户假设（按细分市场）
3. 扩展率
4. 客户流失率
5. 定价变化
6. 细分市场组合

## 费用构建（财务模型）

1. 人员编制计划（按部门）
2. 薪酬和福利
3. 承包商
4. 软件 / 工具
5. 办公场地
6. 营销项目
7. 差旅和活动

## 预算类别

| 类别 | 明细项目 |
|----------|-----------|
| 收入 | 新业务（按细分市场）、扩展、续约、专业服务 |
| 收入成本 | 托管/基础设施、支持、专业服务交付、支付处理 |
| 运营费用 | 销售与营销、研发、一般与行政费用 |

## 月末结账时间表

| 天数 | 活动 |
|------|----------|
| 1-3 | 交易截止 |
| 3-5 | 对账 |
| 5-7 | 应计和调整 |
| 7-10 | 管理层审核 |
| 10-12 | 最终结账 |

**质量检查清单**：银行对账、收入确认、费用计提、预付费用摊销、递延收入、公司间交易抵销、波动分析。

## 收入确认（ASC 606）

1. 识别合同
2. 识别履约义务
3. 确定交易价格
4. 将价格分摊至各项履约义务
5. 在履约义务得到履行时确认收入

**SaaS 注意事项**：订阅收入与使用量收入、实施服务、专业服务、多年期合同、折扣和抵扣。

## 现金管理

**13 周现金流**：按周预测所有已知的现金流入/流出。每周审核。维持最低现金缓冲。

**月度滚动预测**：未来 12 个月的前瞻性预测，涵盖收入回款时间、薪资、供应商付款、债务偿付和资本性支出。

**资金管理原则**：维持 6 个月以上的资金可支撑周期、保护资本、优化闲置现金收益，并遵守投资政策。

**现金保全措施**（延长资金可支撑周期时）：
1. 冻结招聘
2. 与供应商重新谈判
3. 削减可自由支配支出
4. 延长付款期限
5. 加速收入回款
6. 过桥融资

## 尽职调查资料室检查清单

**财务数据**：
- [ ] 过去 3 年的历史财务数据
- [ ] 按细分市场划分的月度损益表
- [ ] 资产负债表和现金流量表
- [ ] ARR/MRR 队列分析
- [ ] 客户单位经济效益
- [ ] 收入确认政策
- [ ] 应收账款账龄
- [ ] 应付账款汇总

**预测**：
- [ ] 3-5 年财务模型
- [ ] 关键假设已记录
- [ ] 敏感性分析
- [ ] 资金用途明细
- [ ] 盈利路径

## 财务风险类别

| 风险类型 | 主要关注事项 |
|-----------|-------------|
| 市场 | 利率风险敞口、外汇风险敞口、客户集中度 |
| 信用 | 客户信用状况、应收账款账龄、坏账准备 |
| 运营 | 内部控制、欺诈防范、系统可靠性 |

## 示例：A 轮 SaaS 公司财务概览

一家正准备进行 B 轮融资的 A 轮公司（ARR 为 300 万美元、35 名员工、已融资 1,200 万美元）：

```
Unit Economics:
  CAC: $22K  |  LTV: $88K  |  LTV:CAC: 4.0x  |  CAC Payback: 16 months
  NRR: 115%  |  Logo Retention: 90%  |  Gross Margin: 78%

Burn:
  Monthly burn: $350K  |  Net new ARR/month: $180K
  Burn Multiple: 1.9x (average -- needs improvement for Series B)
  Cash: $5.2M  |  Runway: 15 months

Rule of 40:
  Revenue growth: 95% YoY  |  Profit margin: -40%
  Score: 55% (strong)

Board recommendation: Raise in 6 months at current trajectory.
  Target metrics for raise: Burn Multiple < 1.5x, NRR > 120%.
```

## 必备保险

董事及高级职员责任险、错误与疏漏险、网络责任险、一般责任险、工伤赔偿保险、关键人物保险。

## 脚本

```bash
# Unit economics calculator
python scripts/unit_economics.py --metrics data.csv

# Cash flow projector
python scripts/cash_forecast.py --actuals Q1.csv --assumptions model.yaml

# Financial model builder
python scripts/fin_model.py --template saas --output model.xlsx

# Investor metrics dashboard
python scripts/investor_metrics.py --period monthly
```

## 参考资料

- `references/financial_modeling.md` -- 模型构建指南
- `references/saas_metrics.md` -- SaaS 指标深度解析
- `references/accounting_policies.md` -- 政策文档
- `references/audit_prep.md` -- 审计准备指南

---

## 工具参考

### financial_health_scorer.py

全面评估 SaaS 财务健康状况：Rule of 40、burn multiple、LTV:CAC、CAC payback、NRR、magic number，以及包含投资就绪度结论的综合评分。

```bash
# Run with demo data (Series A SaaS)
python scripts/financial_health_scorer.py

# Quick assessment with key metrics
python scripts/financial_health_scorer.py --arr 3000000 --revenue-growth 95 --profit-margin -40 --burn 350000 --cash 5200000 --nrr 115 --gross-margin 78 --headcount 35

# From JSON file
python scripts/financial_health_scorer.py --input financials.json

# JSON output
python scripts/financial_health_scorer.py --input financials.json --json
```

### burn_rate_calculator.py

对消耗率及 5 种情景（当前状态、冻结招聘、削减 10%、削减 20%、收入加速）下的现金可支撑时长进行建模，生成 13 周现金流预测，并识别行动触发条件。

```bash
# Run with demo data
python scripts/burn_rate_calculator.py

# Quick calculation
python scripts/burn_rate_calculator.py --cash 5200000 --revenue 250000 --expenses 600000 --headcount 35

# JSON output
python scripts/burn_rate_calculator.py --json
```

### scenario_modeler.py

三情景财务预测引擎，支持概率加权、敏感性分析和决策触发条件。对未来 8 个季度的基准、上行情景和下行情景进行预测。

```bash
# Run with demo data
python scripts/scenario_modeler.py

# Quick model from key inputs
python scripts/scenario_modeler.py --arr 3000000 --expenses 900000 --cash 5200000 --quarters 8

# From JSON with custom scenarios
python scripts/scenario_modeler.py --input scenarios.json

# JSON output
python scripts/scenario_modeler.py --json
```

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|-----|
| 燃烧倍数 > 3.0x | 支出显著超过新增净 ARR | 审查 S&M 效率；考虑冻结招聘；验证销售管道转化率 |
| 40 法则得分低于 20% | 增长已经放缓，但利润率未得到相应改善 | 要么重新加速增长，要么削减成本以提高利润率 -- 不能停留在两者之间 |
| CAC 回收期超过 24 个月 | 销售周期过长、ACV 过低或 S&M 支出过高 | 按渠道细分 CAC；削减表现不佳的渠道；通过定价提高 ACV |
| LTV:CAC 比率低于 2.0x | 客户生命周期过短（流失）或获客成本过高 | 优先解决客户流失问题（ROI 更高）；然后按渠道优化 CAC |
| NRR 低于 100% | 收缩和流失超过扩张收入 | 建立扩张策略手册；对流失客户进行细分；投资客户成功 |
| 董事会质疑财务模型假设 | 假设未记录或不切实际 | 明确记录每一项假设；展示关键变量的敏感性分析 |
| 月末结账耗时 15 天以上 | 手工流程、缺少对账或职责归属不明确 | 实施第 1-12 天结账时间表；为检查清单中的每一项指定负责人 |

---

## 成功标准

- 财务健康综合得分高于 65/100（每季度通过 financial_health_scorer.py 衡量）
- B 轮及以上公司将 40 法则得分保持在 40% 以上
- 燃烧倍数低于 2.0x（为 B 轮融资做好准备时应低于 1.5x）
- CAC 回收期少于 18 个月（达到行业前四分之一水平时应少于 12 个月）
- 在 12 个工作日内完成月末结账，且无重大调整
- 在每次董事会会议前至少 48 小时完成董事会财务演示材料
- 始终将现金续航期维持在 12 个月以上（最好超过 18 个月）

---

## 范围与局限性

**范围内**：SaaS 单位经济效益、燃烧率分析、财务建模、现金管理、投资者报告、月末结账、收入确认（ASC 606）、尽职调查准备、情景建模。

**范围外**：税务规划、法律实体架构设计、审计执行、薪资处理、应付账款/应收账款运营、保险采购、股权资本结构表管理。

**局限性**：财务健康评分器使用行业基准，这些基准可能不适用于非 SaaS 商业模式。燃烧率计算器使用线性/指数近似法 -- 实际现金流会因计费周期和付款时间而异。情景建模器提供方向性指导，而非可审计的财务预测。

---

## 集成点

| 技能 | 集成 |
|-------|-------------|
| `ceo-advisor` | 财务情景为董事会战略讨论提供信息 |
| `board-deck-builder` | 财务更新部分；演示文稿中的所有数字均通过 CFO 工具验证 |
| `cro-advisor` | 收入预测；从销售管道到收入的转化假设 |
| `chro-advisor` | 员工人数预算建模；全负担成本计算 |
| `ciso-advisor` | 根据量化的风险敞口确定合规预算规模 |
| `company-os` | 周度记分卡中的财务指标 |
| `chief-of-staff` | 转交财务问题；综合 CFO + CEO 的观点 |