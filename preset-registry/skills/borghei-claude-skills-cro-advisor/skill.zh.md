---
name: cro-advisor
description: >
  Revenue leadership for B2B SaaS: forecasting, sales model design, pricing, and
  net revenue retention. Use when designing the revenue engine, setting quotas,
  modeling NRR, evaluating pricing, or scaling sales teams.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: cro-leadership
  updated: 2026-03-09
  frameworks:
    - sales-playbook
    - pricing-strategy
    - nrr-playbook
    - pipeline-management
    - capacity-model
    - revenue-forecasting
  triggers:
    - CRO
    - chief revenue officer
    - revenue strategy
    - ARR
    - MRR
    - sales model
    - pipeline
    - revenue forecasting
    - pricing strategy
    - net revenue retention
    - NRR
    - gross revenue retention
    - expansion revenue
    - upsell
    - cross-sell
    - churn
    - sales capacity
    - quota
    - MEDDPICC
    - PLG
    - product-led growth
    - enterprise sales
    - sales cycle
    - CAC payback
    - magic number
    - win rate
    - ICP
    - ideal customer profile
    - territory design
---
# CRO 顾问

用于构建可预测、可扩展收入引擎的框架——覆盖从首笔收入到 1 亿美元 ARR 乃至更高阶段。每一项建议都以销售管道数学为依据，而非寄希望于侥幸。

## 关键词

CRO、首席营收官、收入战略、ARR、MRR、销售模式、销售管道、收入预测、定价战略、净收入留存率、NRR、总收入留存率、GRR、扩展收入、追加销售、交叉销售、客户流失、客户成功、销售产能、配额、爬坡期、销售区域设计、MEDDPICC、PLG、产品驱动增长、销售驱动增长、企业销售、SMB、自助服务、基于价值的定价、基于用量的定价、ICP、理想客户画像、收入董事会汇报、销售周期、CAC 回收期、Magic Number、赢单率、销售管道覆盖率、交易速度

---

## 收入健康度诊断

在应用任何框架之前，先诊断当前状态。

### 收入健康度决策树

```
START: "How healthy is our revenue engine?"
  |
  v
[Check NRR]
  |
  +-- NRR < 90% --> CRISIS. Existing customers are shrinking.
  |                  Stop scaling sales. Fix retention first.
  |
  +-- NRR 90-100% --> WARNING. Churn eating expansion.
  |                    Diagnose: product gap, CS gap, or ICP problem?
  |
  +-- NRR 100-110% --> HEALTHY. Base is stable. Focus on new logo + expansion.
  |
  +-- NRR > 110% --> STRONG. Expansion engine is working.
                      Check: is it sustainable or driven by price increases?
```

### 收入瀑布模型

```
Opening ARR
  + New Logo ARR       (new customers closed this period)
  + Expansion ARR      (upsell, cross-sell, seat adds)
  - Contraction ARR    (downgrades, reduced usage)
  - Churned ARR        (lost customers)
= Closing ARR

NRR = (Opening + Expansion - Contraction - Churn) / Opening x 100
GRR = (Opening - Contraction - Churn) / Opening x 100
```

---

## 收入指标

### 董事会层面指标（月度/季度）

| 指标 | 公式 | 目标 | 危险信号 |
|--------|---------|--------|----------|
| ARR 同比增长率 | (Current ARR / Prior Year ARR) - 1 | 早期阶段达到 2x+，增长率达到 50%+ | 连续 2 个以上季度减速 |
| NRR | 见上方瀑布模型 | > 110% | < 100% |
| GRR | 见上方瀑布模型 | > 85% | < 80% |
| 销售管道覆盖率 | Open pipeline / Quota | > 3x | 季度开始时 < 2x |
| Magic Number | Net New ARR x 4 / Prior Q S&M Spend | > 0.75 | < 0.5 |
| CAC 回收期 | S&M Spend / New ARR x (1/GM%) | < 18 个月 | > 24 个月 |
| 配额达成率 | 达成配额的销售代表百分比 | 60-70% | < 50% |
| 赢单率 | Closed-won / (Closed-won + Closed-lost) | > 25% | < 15% |
| 平均销售周期 | 从商机创建到成交的天数 | 保持稳定或缩短 | 连续 2 个以上季度延长 |

### NRR 基准

| NRR 范围 | 信号 | 战略含义 |
|-----------|--------|----------------------|
| > 130% | 世界一流（Snowflake、Twilio） | 即使没有新增客户也能实现增长 |
| 110-130% | 优秀 | 扩展机制强劲，应投资于新增客户 |
| 100-110% | 健康 | 扩展抵消了客户流失，需监控趋势 |
| 90-100% | 令人担忧 | 客户流失超过扩展，应在规模化之前修复 |
| < 90% | 危急 | 如同漏水的桶，所有新增收入都会流失 |

---

## 销售模式选择

### 模式对比矩阵

| 模式 | ACV 范围 | 销售周期 | 团队 | 最适用场景 |
|-------|-----------|-------------|------|----------|
| 自助式 / PLG | $0-$10K | 数分钟至数天 | 无销售团队 | 高销量、简单产品 |
| SMB 内部销售 | $5K-$50K | 2-6 周 | SDR + AE | 中等销量、中等复杂度 |
| 中端市场 | $25K-$150K | 4-12 周 | SDR + AE + SE | 复杂产品、多个利益相关者 |
| 企业级 | $100K-$1M+ | 3-12 个月 | AE + SE + CSM + 高管支持者 | 大型组织、高接触度 |
| 渠道/合作伙伴 | 不定 | 不定 | 合作伙伴经理 + 赋能 | 市场覆盖、地域拓展 |

### 模式选择决策树

```
START: "Which sales model?"
  |
  v
[What's the average deal size?]
  |
  +-- < $5K ACV --> Self-serve / PLG
  |                  (add sales assist at $2-5K for upsell)
  |
  +-- $5K-$50K --> Inside sales (SMB)
  |                (SDRs + AEs, high velocity)
  |
  +-- $50K-$200K --> Mid-market
  |                  (SDR + AE + SE, consultative)
  |
  +-- > $200K --> Enterprise
                  (Named accounts, multi-threaded, executive selling)

HYBRID: Most companies evolve to serve 2-3 segments.
Route by ACV and buying complexity.
```

---

## 销售管道管理

### 销售管道阶段定义

| 阶段 | 定义 | 退出标准 | 典型转化率 |
|-------|-----------|---------------|-------------------|
| 0：潜在客户 | 入站咨询或出站目标客户 | 经确认符合 ICP | 20-30% 进入阶段 1 |
| 1：需求探索 | 已完成首次会议 | 已确认痛点并识别决策权限人 | 50-60% 进入阶段 2 |
| 2：评估 | 正在积极评估、演示/POC | 已确定内部支持者并设定时间表 | 40-50% 进入阶段 3 |
| 3：提案 | 已提交提案/报价 | 已确认预算，决策标准清晰 | 50-60% 进入阶段 4 |
| 4：谈判 | 正在协商条款 | 法务/采购已参与 | 70-80% 成交 |
| 5：成交 | 已签署合同 | 已确认收入 | -- |
| X：丢单 | 交易失败 | 已记录丢单原因 | -- |

### 销售管道覆盖模型

| 季度节点 | 所需销售管道覆盖倍数 | 低于要求时的行动 |
|-----------------|--------------------------|-----------------|
| Q-1（规划） | 配额的 4 倍 | 增加漏斗顶部活动 |
| 季度初 | 配额的 3 倍 | 加速现有交易，补充销售管道 |
| 季度中 | 配额的 2 倍 | 加速交易，推动高管参与 |
| 季度末 | 配额的 1.5 倍 | 调整预测，促使交易提前成交 |

### 交易资格审查：MEDDPICC

| 要素 | 问题 | 危险信号 |
|---------|----------|----------|
| **M**etrics | 买方衡量什么业务成果？ | 没有量化的价值主张 |
| **E**conomic Buyer | 谁负责签字付款？我们见过对方吗？ | 从未见过决策者 |
| **D**ecision Criteria | 他们将使用什么标准做出决定？ | “看到时自然就会知道” |
| **D**ecision Process | 获得肯定答复需要经过哪些步骤？ | 没有明确的流程或时间表 |
| **P**aper Process | 需要经过哪些法务/采购步骤？ | 采购流程未知 |
| **I**dentify Pain | 他们正在解决什么问题？是否紧迫？ | 痛点停留在理论层面，并不迫切 |
| **C**hampion | 谁会在内部支持我们？ | 尚未确定内部支持者 |
| **C**ompetition | 他们还在评估哪些竞争对手？ | “他们说没有竞争对手”（永远不可信） |

---

## 定价策略

### 定价模型选择

| 模型 | 最适用的情况 | 需要注意 |
|-------|-----------|--------------|
| 按席位收费 | 价值随用户数量增长 | 通过合并席位规避费用 |
| 按使用量收费 | 价值与使用量直接相关 | 收入难以预测 |
| 分层定价 | 不同细分市场之间存在明确的功能差异 | 层级边界显得武断 |
| 统一定价 | 产品简单，使用量较为一致 | 无法从重度用户身上获得更多收入 |
| 基于价值定价 | 可以清晰衡量 ROI | 需要信任和证明 |
| 混合定价 | 产品复杂，具有多个价值维度 | 报价复杂 |

### 定价决策框架

```
START: "How should we price?"
  |
  v
[What is the primary value driver for the customer?]
  |
  +-- Number of users --> Per-seat pricing
  |
  +-- Volume of usage --> Usage-based pricing
  |
  +-- Feature needs differ by segment --> Tiered pricing
  |
  +-- Clear ROI (saves $X) --> Value-based (price at 10-20% of value)
  |
  +-- Multiple value drivers --> Hybrid (base + usage/seats)
```

### 定价健康度指标

| 信号 | 健康 | 不健康 |
|--------|---------|-----------|
| 价格异议率 | 提案的 < 20% | > 40% = 价值传达存在问题 |
| 平均折扣率 | 相比标价优惠 < 15% | > 25% = 定价未以价值为锚点 |
| 距上次涨价的时间 | < 12 个月 | > 24 个月 = 通胀正在侵蚀利润率 |
| 涨价导致的客户流失率 | 增量流失率 < 2% | > 5% = 涨价过于激进 |
| 涨价后的赢单率 | 保持稳定或有所提升 | 下降 > 10 个百分点 = 调整过度 |

---

## 销售团队扩张

### 产能模型

```
Required AEs = Target New ARR / (Quota x Attainment Rate x Ramp Factor)

Example:
  Target: $5M new ARR
  Quota per AE: $1M
  Attainment: 65%
  Ramp factor: 0.85 (accounts for ramp time)

  Required AEs = $5M / ($1M x 0.65 x 0.85) = 9.1 --> Hire 10 AEs
```

### 不同 ARR 阶段的销售团队结构

| ARR | 团队结构 | 关键招聘岗位 |
|-----|---------------|-----------|
| $0-$1M | 创始人主导销售 | 暂不组建销售团队 |
| $1-$3M | 1-2 名 AE | 首位 AE，可能还需首位 SDR |
| $3-$10M | 3-6 名 AE、2-4 名 SDR、1 名销售经理 | 首位销售经理、首位 SE |
| $10-$25M | 销售副总裁、2 个团队、SDR 团队、SE 团队 | 销售副总裁、营收运营、客户成功经理 |
| $25-$50M | CRO、多个细分团队、客户成功组织 | CRO、细分市场负责人、销售赋能 |
| $50M+ | 完整的营收组织 | 高级副总裁、区域负责人、战略团队 |

### 配额设定指南

| 指标 | 指南 |
|--------|-----------|
| 配额与 OTE 之比 | 4-6x（例如，$160K OTE 对应 $800K 配额） |
| 爬坡期 | 3-6 个月，具体取决于销售周期 |
| 爬坡期配额 | 25%（M1-2）、50%（M3-4）、75%（M5-6）、100%（M7+） |
| 配额覆盖率目标 | 按计划的 120-130% 招聘（将人员流失和爬坡期计算在内） |
| 达成配额的团队成员比例 | 目标为 60-70%。< 50% = 配额过高。> 80% = 配额过低。 |

---

## 危险信号

- NRR 连续 2 个季度下降 -- 客户价值主张存在问题
- 季度开始时销售管道覆盖率 < 3x -- 预示目标将无法达成
- 赢单率下降，同时销售周期延长 -- 竞争压力增大或 ICP 发生偏移
- 达成配额的 AE 比例 < 50% -- 薪酬方案、爬坡期或配额校准存在问题
- 平均交易规模下降 -- 在压力下转向更低端市场
- Magic Number < 0.5 -- 销售支出未能转化为收入
- 预测准确率 < 80% -- 销售管道质量不佳或销售代表刻意低报
- 单一客户占 ARR 的比例 > 15% -- 客户集中度风险
- 超过 40% 的丢单记录中出现“太贵” -- 价值展示存在问题，而非价格问题
- 扩展 ARR 占新增 ARR 总额的比例 < 20% -- 缺少追加销售机制
- 没有赢单/丢单分析流程 -- 未能从每一笔交易结果中吸取任何经验
- 销售团队与客户成功团队未就健康度评分达成一致 -- 客户流失将出乎意料

---

## 与高管团队协作

| 当……时 | CRO 与……协作 | 以…… |
|---------|-------------------|-------|
| 定价变更 | CPO + CFO | 统一价值定位，评估对利润率的影响 |
| 产品路线图 | CPO (`cpo-advisor`) | 确保功能支持 ICP 并推动销售管道中的交易成交 |
| 人员编制计划 | CFO + CHRO | 建立包含 ROI 论证的产能模型 |
| NRR 下降 | CPO + COO | 确定根本原因：产品缺口还是客户成功流程失效 |
| 企业客户拓展 | CEO (`ceo-advisor`) | 为关键客户争取高管支持 |
| 收入目标 | CFO (`cfo-advisor`) | 通过自下而上的模型验证自上而下的目标 |
| 销售管道 SLA | CMO (`cmo-advisor`) | MQL 到 SQL 的转化率、各渠道 CAC |
| 安全审查 | CISO (`ciso-advisor`) | 通过安全材料消除企业级交易的阻碍 |
| 销售运营 | COO (`coo-advisor`) | RevOps 人员配置、佣金基础设施 |
| 销售招聘 | CHRO (`chro-advisor`) | 薪酬方案、爬坡期建模、销售区域设计 |
| 竞争性赢单/丢单 | 竞争情报 (`competitive-intel`) | 更新竞争作战卡和市场定位 |

---

## 主动触发条件

- NRR < 100% -- 在扩大获客规模之前，必须先解决留存问题
- 销售管道覆盖率 < 3x -- 预测面临风险，立即向 CEO 发出警示
- 赢单率连续 2 个以上季度下降 -- 销售流程或产品协同存在问题
- 最大客户占 ARR 的比例 > 20% -- 存在集中度风险，立即实现客户多元化
- 超过 12 个月未进行定价审查 -- 很可能错失了收入机会
- 扩展收入占新增 ARR 的比例 < 15% -- 正在错失追加销售/交叉销售机会
- 销售周期延长 -- 存在竞争或产品问题，需要调查
- 交易折扣率 > 30% -- 定价或价值传达存在问题

---

## 输出产物

| 请求 | 交付物 |
|---------|-------------|
| “预测下一季度” | 基于销售管道的预测，包含置信区间和情景分析 |
| “分析我们的客户流失” | 群组分析，包含高风险客户和干预计划 |
| “审查我们的定价” | 定价分析，包含基准、价值框架和建议 |
| “扩大销售团队规模” | 产能模型，包含配额、爬坡期、销售区域和薪酬方案 |
| “董事会材料中的收入部分” | ARR 瀑布分析、NRR、销售管道覆盖率、预测和风险 |
| “设计销售流程” | 阶段定义、资格认定标准、交易审查节奏 |
| “赢单/丢单分析” | 按竞争对手、细分市场和原因汇总分析结果 |

---

## 工具参考

### 1. revenue_waterfall_analyzer.py

分析 ARR 瀑布（新客户、扩展、收缩、流失），以计算 NRR、GRR 和新增净 ARR。检测趋势、标记留存风险，并与 SaaS 行业标准进行基准比较。

```bash
python scripts/revenue_waterfall_analyzer.py --input revenue_data.json --json
python scripts/revenue_waterfall_analyzer.py --input revenue_data.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必需 | 包含各期间 ARR 构成（期初、新增、扩展、收缩、流失）的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式输出，而非人类可读文本 |

### 2. pipeline_coverage_calculator.py

按季度所处阶段计算销售管道覆盖率，分析各阶段分布的健康状况，识别交易老化风险，并生成销售管道充足性评估及行动建议。

```bash
python scripts/pipeline_coverage_calculator.py --input pipeline_data.json --json
python scripts/pipeline_coverage_calculator.py --input pipeline_data.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必填 | 包含交易（阶段、价值、账龄、预计成交日期）、配额和季度日期的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式输出，而非人类可读文本 |

### 3. sales_efficiency_scorer.py

使用 Magic Number、CAC 回收期、配额达成率分布、赢单率和销售周期指标评估销售效率。与 SaaS 标准进行基准比较，并生成改进建议。

```bash
python scripts/sales_efficiency_scorer.py --input sales_data.json --json
python scripts/sales_efficiency_scorer.py --input sales_data.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必填 | 包含收入、S&M 支出、销售代表级别的配额达成率、赢单/丢单数量和销售周期时长的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式输出，而非人类可读文本 |

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| NRR 连续 2 个以上季度下降 | 产品市场契合度减弱、CS 存在缺口或 ICP 发生偏移 | 按客户群组和套餐层级细分 NRR；诊断客户流失是由产品、服务还是契合度问题驱动 |
| 进入季度时销售管道覆盖率低于 3x | 漏斗顶端不足或线索到商机的转化率较低 | 按转化率审核线索来源；增加 SDR 活动；与 CMO 就 MQL 数量达成一致 |
| 赢单率下降，同时销售周期延长 | 竞争压力、产品差距或 ICP 错误 | 按竞争对手和细分市场分析赢单/丢单情况；审查资格认定标准；检查 ICP 一致性 |
| 配额达成的 AE 不足 50% | 配额校准、爬坡或赋能问题 | 对配额与 OTE 比率（4-6x）进行基准比较；审查爬坡计划；评估区域平衡性 |
| Magic Number 低于 0.5 | S&M 支出未能高效转化为收入 | 审查渠道 ROI；减少在低绩效渠道上的支出；在增加人员编制之前提高销售代表的生产效率 |
| 预测准确率低于 80% | 销售管道质量问题、故意保守预测或检查机制薄弱 | 标准化阶段退出标准；实施 MEDDPICC 资格认定；每周开展交易审查 |
| 扩展 ARR 不到新增 ARR 总额的 20% | 缺少追加销售/交叉销售机制或扩展策略手册 | 与 CS 共同设计扩展触发条件；实施基于使用情况的追加销售提醒；创建交叉销售组合 |

---

## 成功标准

- NRR 连续 4 个季度保持在 110% 以上
- 季度开始时，销售管道覆盖率保持在配额的 3-4x，且各阶段分布健康
- 面对排名前三的竞争对手时，赢单率保持稳定或有所提高
- 60-70% 已完成爬坡期的 AE 达成配额
- Magic Number 超过 0.75，表明 S&M 支出高效
- CAC 回收期低于 18 个月，且 LTV:CAC 比率高于 3:1
- 实施后两个季度内，预测准确率超过 85%

---

## 范围与局限性

**范围内：** 收入健康状况诊断（NRR、GRR、ARR 瀑布分析）、销售模式选择与优化、销售管道管理（阶段定义、覆盖率建模、MEDDPICC 资格审查）、定价策略框架、销售团队扩张（产能模型、配额设定、区域设计）、收入预测，以及董事会层面的收入报告。

**范围外：** CRM 系统管理或数据提取（工具使用 JSON 导出数据）、单个交易指导（工具用于标记模式，而非指定策略）、营销归因建模（使用 cmo-advisor）、客户成功健康度评分（使用 customer-success-manager），以及薪酬计划的法律合规性。工具分析特定时间点的收入快照；持续监控需要与 CRM/BI 集成。

**局限性：** 收入基准基于汇总的 B2B SaaS 数据；目标因阶段、ACV 和销售模式（PLG、企业销售或渠道销售）而异。销售管道分析假定 CRM 数据准确，包括阶段、价值、存续时间和预计成交日期。销售效率指标需要准确的财务数据，而早期公司可能并未跟踪这些数据。配额建议仅供方向性参考；最终校准需要进行区域层面的分析。

---

## 集成点

- **cfo-advisor** -- 收入预测和产能模型为财务规划提供输入；定价会影响利润率建模
- **cpo-advisor** -- 产品路线图必须支持 ICP 需求并弥补销售管道缺口；功能请求由 CPO 进行筛选
- **cmo-advisor** -- 销售管道 SLA 和 MQL 到 SQL 的转化由双方共同负责；CAC 优化需要与营销团队协调一致
- **coo-advisor** -- RevOps 人员配置和佣金基础设施取决于运营产能规划
- **competitive-intel** -- 赢单/丢单数据和竞争性赢单率为战斗卡更新及定位提供依据
- **sales-success/** -- 销售效率指标逐级落实到客户经理和销售运营的执行工作