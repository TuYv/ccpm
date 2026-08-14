---
name: scenario-war-room
description: >
  Cross-functional what-if modeling for compound adversity -- shows how one
  problem cascades into the next. Use when facing complex risk scenarios,
  strategic decisions with major downside, or multi-variable threats.
license: MIT + Commons Clause
metadata:
  version: 1.0.0
  author: borghei
  category: c-level
  domain: strategic-planning
  tier: POWERFUL
  updated: 2026-03-09
  frameworks: cascade-modeling, scenario-planning, pre-mortem, contingency-design
---
# 情景作战室

**层级：** 强大
**类别：** 高管咨询
**标签：** 情景规划、作战室、风险建模、级联效应、应急规划、事前验尸、危机模拟

## 概述

情景作战室对跨越所有业务职能的级联式假设情景进行建模。它并非针对单一假设的压力测试 -- 而是模拟复合逆境，揭示一个问题如何引发下一个问题，以及可以在何处中断级联。每个情景都会产出具体的对冲措施，并明确其成本、负责人和截止日期。

---

## 适用情形

- 某项重大风险的发生概率高于 15%，且影响超过 ARR 的 20%
- 两项或更多威胁可能同时发生
- 某项战略决策一旦出错，将造成重大负面影响
- 董事会或投资者正在问“最坏的情况是什么？”
- 在做出重大承诺（融资、收购、进入市场）前进行事前验尸
- 领导团队开展季度风险审查

## 不适用情形

- 单变量财务敏感性分析（使用 CFO Advisor 压力测试）
- 常规项目风险评估（使用项目管理风险框架）
- 技术故障模式分析（使用工程事故规划）

---

## 首先澄清

生成前，请确认以下输入。如果其中任何一项未知或含糊，请提问 — 不要自行假设：

- [ ] **真正让领导层夜不能寐的变量（最多 3 个）** — 整个模型都围绕这些变量构建；选错变量会产生毫无用处的情景
- [ ] **每个变量的概率、时间线和量化影响** — “收入下降”不具备可操作性；“60 天内有 $420K ARR 面临风险”则具备可操作性，而且严重程度等级取决于这些数据
- [ ] **当前基线**（ARR、以月计的资金可维持时间、员工人数）— 级联和严重程度计算（例如，资金可维持时间从 14→8 个月）需要起始数据
- [ ] **公司阶段** — 常见的情景模式以及何种情况可被视为生存危机，会因公司阶段而异

停止规则：只询问对输出影响最大的 2-3 项。如果用户说“直接起草”，则继续，并在产出物顶部列出你的假设。

---

## 六步级联模型

### 第 1 步：定义情景变量（最多 3 个）

超过 3 个变量会导致分析瘫痪，而非产生洞见。请选择真正让领导层夜不能寐的 3 个变量。

对于每个变量，请说明：

| 字段 | 说明 | 示例 |
|-------|-----------|---------|
| **发生什么变化** | 具体且量化 | “最大客户（占 ARR 的 28%）发出 60 天后终止合同的通知” |
| **概率** | 你的最佳估计 | 15% |
| **时间线** | 可能在何时发生 | 90 天内 |
| **检测信号** | 如何得知它正在发生 | 支持者失联，使用量环比下降 25% |

**变量模板：**
```
Variable A: [Specific change]
  Probability: [X]%  |  Timeline: [When]
  Detection: [Early warning signal]
  First-order impact: [Immediate consequence]

Variable B: [Specific change]
  Probability: [X]%  |  Timeline: [When]
  Detection: [Early warning signal]
  First-order impact: [Immediate consequence]

Variable C: [Specific change]
  Probability: [X]%  |  Timeline: [When]
  Detection: [Early warning signal]
  First-order impact: [Immediate consequence]
```

### 第 2 步：领域影响映射

针对每个变量，评估其对各项业务职能的影响：

| 领域 | 关键问题 | 典型影响范围 |
|--------|-------------|---------------------|
| **财务（CFO）** | 对资金消耗有何影响？现金跑道有何变化？有哪些过桥融资方案？ | 现金、现金跑道、契约条款触发条件 |
| **营收（CRO）** | ARR 缺口有多大？是否会引发客户流失连锁反应？销售管道是否受到影响？ | NRR、扩展收入、新客户风险 |
| **产品（CPO）** | 路线图是否偏离计划？PMF 是否面临风险？客户需求是否发生变化？ | 交付时间线、功能优先级 |
| **工程（CTO）** | 研发速度是否受损？是否存在关键人员风险？对技术债有何影响？ | 产能、架构、招聘 |
| **人力资源（CHRO）** | 是否会引发离职连锁反应？是否会冻结招聘？对士气有何影响？ | 人才留存、文化、人才梯队实力 |
| **运营（COO）** | 产能是否受到影响？流程是否中断？对 OKR 有何影响？ | SLA、效率、规模化 |
| **市场营销（CMO）** | CAC 是否受到影响？竞争风险是否增加？是否存在品牌风险？ | 销售管道生成、市场定位 |
| **法务/合规** | 监管时间线是否存在风险？是否面临合同风险？ | 义务、截止期限、处罚 |

### 第 3 步：连锁反应映射（核心）

这是最有价值的一步。梳理变量 A 如何触发一系列后果，进而放大变量 B。

**连锁反应图：**
```
TRIGGER: Customer churn ($560K ARR)
  │
  ├──▶ CFO: Runway drops 14 → 8 months
  │     │
  │     └──▶ CHRO: Hiring freeze imposed
  │           │
  │           └──▶ CTO: 3 open engineering reqs frozen, roadmap slips 2 months
  │                 │
  │                 └──▶ CPO: Q4 feature launch delayed → 2 more customers at risk
  │                       │
  │                       └──▶ CRO: NRR drops → additional churn risk (DEATH SPIRAL ENTRY)
  │
  └──▶ CRO: Revenue concentration increases (next largest = 22%)
        │
        └──▶ Investors: Concentration risk flagged → Series A terms worsen
```

**明确命名各类连锁反应。** 常见的连锁反应模式：

| 连锁反应模式 | 描述 | 阻断点 |
|----------------|-------------|-------------------|
| 营收到现金跑道的死亡螺旋 | 客户流失 → 现金跑道缩短 → 冻结招聘 → 产品开发放缓 → 更多客户流失 | 紧急实现营收多元化 |
| 关键人员连锁反应 | 明星员工离职 → 团队士气下降 → 追随者离职 → 研发速度崩溃 | 在人员离职前发放留任奖金 |
| 市场挤压 | 竞争对手融资 → 价格战 → 利润率受压 → 无法投资产品 | 实施差异化，而非跟进降价 |
| 信任连锁反应 | 事故 → 客户担忧 → 客户流失 → 媒体报道 → 更多客户流失 | 迅速、透明地沟通 |
| 融资与资金消耗螺旋 | 未达目标 → 融资推迟 → 以不利条款进行过桥融资 → 削减资金消耗 → 团队流失 | 并行推进多条融资路径 |

### 第 4 步：严重程度矩阵

对严重程度逐步升级的三种情景进行建模：

| 情景 | 受影响的变量 | 定义 | 恢复难度 |
|----------|-------------|-----------|-------------------|
| **基础情景** | 3 个中有 1 个 | 单一冲击，其他冲击未发生 | 可通过预先准备的响应措施加以应对 |
| **压力情景** | 3 个中有 2 个 | 复合冲击，连锁反应开始 | 需要进行重大转型，并由董事会参与 |
| **严重情景** | 全部 3 个 | 完整连锁反应，进入生死存亡阶段 | 需要采取紧急行动，可能需要董事会介入 |

针对每个严重程度级别，量化以下内容：

```
BASE SCENARIO (Variable A only):
  Runway impact: [X] months → [Y] months
  ARR impact: -$[X] ([Y]% of total)
  Headcount impact: [freeze / reduction / none]
  Timeline to critical: [X] months
  Recovery plan: [specific actions]

STRESS SCENARIO (Variables A + B):
  Runway impact: [X] months → [Y] months
  ARR impact: -$[X] ([Y]% of total)
  Headcount impact: [specifics]
  Timeline to critical: [X] months
  Recovery plan: [specific actions]

SEVERE SCENARIO (All three):
  Runway impact: [X] months → [Y] months
  ARR impact: -$[X] ([Y]% of total)
  Headcount impact: [specifics]
  Timeline to critical: [X] months
  Existential: [yes/no]
  Emergency plan: [specific actions requiring board approval]
```

### 步骤 5：早期预警信号（触发点）

定义可衡量的信号，让你在场景得到确认之前就能判断其正在发生。这项工作的价值在于及早行动，而不是事后被动应对。

**信号设计标准：**
- 可观察（你确实能够衡量）
- 具有前瞻性（在完整影响显现之前出现）
- 具体（而不只是“感觉不太对劲”）
- 可行动（能够触发具体响应）

| 变量 | 信号 | 阈值 | 响应 |
|----------|--------|-----------|----------|
| 客户流失 | 业务支持人停止回复 | 沉默 > 3 周 | 高管升级处理，请求召开 QBR |
| 客户流失 | 使用量下降 | 环比下降 > 25% | CS 主动联系，开展价值审查 |
| 融资延迟 | 投资意向书 | 流程启动 60 天后仍少于 3 份 | 同步开展过桥融资沟通 |
| 融资延迟 | 投资者请求 | 尽职调查延期 > 30 天 | 降低资金消耗，延长现金跑道 |
| 关键人员离职 | 市场薪酬 | 过去 90 天内需要提供反要约 | 制定留任方案和继任计划 |
| 关键人员离职 | 外部活动 | 工程师在竞争对手主办的会议上发表演讲 | 直接沟通，扩展其职责范围 |

### 步骤 6：对冲策略

针对每个场景：确定现在（场景发生之前）就应采取的行动，以便在场景实际发生时降低影响。对冲是有成本的——目标是以较低成本获得保障，而不是过度多疑。

**对冲评估标准：**

| 标准 | 问题 |
|-----------|----------|
| 成本 | 实施此对冲措施需要多少成本？ |
| 可逆性 | 如果场景没有发生，我们能否撤销该措施？ |
| 前置时间 | 实施需要多长时间？（必须短于从检测到影响发生的时间窗口） |
| 覆盖范围 | 此对冲措施能够防范哪些场景？ |
| 副作用 | 此对冲措施是否会引发其他问题？ |

**对冲表模板：**

| 对冲措施 | 成本 | 防范场景 | 负责人 | 截止时间 | 状态 |
|-------|------|-----------------|-------|----------|--------|
| 建立 $500K 信用额度 | $5K/年 | 现金跑道不足（基础场景 + 压力场景） | CFO | 60 天 | 尚未开始 |
| 为 3 名关键工程师提供 12 个月留任奖金 | $90K | 关键人员离职（所有场景） | CHRO | 30 天 | 进行中 |
| 实现客户多元化，将单个客户的收入占比降至 <20% | 销售投入（6 个月） | 单一客户依赖 | CRO | 2 个季度 | 规划中 |
| 启动并行融资渠道 | CEO 时间（10 小时/周） | 融资延迟（压力场景 + 严重场景） | CEO | 立即 | 尚未开始 |
| 与现有投资者预先协商过桥融资条款 | 2 次董事会沟通 | 现金跑道危机（严重场景） | CFO + CEO | 45 天 | 尚未开始 |
| 编写架构文档以降低巴士因子风险 | 2 个工程周 | 关键人员离职 | CTO | 30 天 | 尚未开始 |

---

## 输出格式

每次作战室会议都会生成以下结构化输出：

```
SCENARIO: [Name]
DATE: [Date of analysis]
PARTICIPANTS: [Who was involved]

VARIABLES:
  A: [Description] — Probability: [X]%, Timeline: [When]
  B: [Description] — Probability: [X]%, Timeline: [When]
  C: [Description] — Probability: [X]%, Timeline: [When]

MOST LIKELY PATH: [Which combination actually plays out, with reasoning]

SEVERITY LEVELS:
  Base (A only):  Runway [X]→[Y]mo, ARR impact -$[X]
    Recovery: [2-3 specific actions]
  Stress (A+B):   Runway [X]→[Y]mo, ARR impact -$[X]
    Recovery: [3-4 specific actions]
  Severe (A+B+C): Runway [X]→[Y]mo, ARR impact -$[X]
    Existential: [yes/no]
    Emergency: [actions requiring board approval]

CASCADE MAP:
  [A] → [domain impact] → [triggers B amplification] → [domain impact] → [end state]
  Interruption points: [where cascade can be broken]

EARLY WARNING SIGNALS:
  1. [Signal] → indicates [scenario], threshold: [specific]
  2. [Signal] → indicates [scenario], threshold: [specific]
  3. [Signal] → indicates [scenario], threshold: [specific]

HEDGES (implement now):
  1. [Action] — cost: $[X] — protects: [scenarios] — owner: [role] — deadline: [date]
  2. [Action] — cost: $[X] — protects: [scenarios] — owner: [role] — deadline: [date]
  3. [Action] — cost: $[X] — protects: [scenarios] — owner: [role] — deadline: [date]

RECOMMENDED DECISION:
  [One paragraph: what to do, in what order, and why]

REVIEW DATE: [When to re-run this analysis — typically 90 days or after any variable shifts]
```

---

## 不同公司阶段的常见情景

### 种子轮阶段
- 联合创始人离职 + 产品错过发布日期
- 现金储备耗尽 + 过桥融资条款极为苛刻
- 关键技术人才招聘失败 + 竞争对手率先发布产品

### A 轮阶段
- 未达成 ARR 目标 + 融资推迟
- 最大客户流失 + 竞争对手完成大额融资
- 关键工程师离职 + 核心功能面临交付期限

### B 轮及以后
- 市场萎缩 + 烧钱倍数飙升至 3 倍以上
- 领投方要求进行战略转型 + 团队抵制
- 监管变化 + 产品需要重新设计架构

---

## 作战室基本规则

1. **每个情景最多包含 3 个变量。**再多就是噪声。只对真正重要的变量建模。
2. **进行量化或估算。**“收入下降”没有用。“未来 60 天内有 42 万美元 ARR 面临风险”才有用。如果不确定，请使用区间。
3. **不要止步于一阶影响。**真正的损害总是发生在连锁反应中。
4. **不仅要对影响建模，也要对恢复路径建模。**每个情景都必须包含一条“我们该怎么做”的路径。
5. **将基准情景与敏感性分析分开。**不要将“最可能发生什么”与“可能发生什么”混为一谈。
6. **每个规划周期设置 3～4 个情景。**更多情景会导致分析瘫痪。
7. **每 90 天复盘一次。**概率和变量会发生变化。过时的情景只会带来虚假的安全感。
8. **营造不评判的氛围。**必须让人们能够放心地说出最糟糕的情景。

---

## 相关技能

| 技能 | 适用场景 |
|-------|----------|
| **ceo-advisor** | 情景分析所支撑的战略决策 |
| **cfo-advisor** | 对情景影响进行财务建模 |
| **coo-advisor** | 制定运营应急计划 |
| **internal-narrative** | 向利益相关者传达情景分析结果 |
| **cs-onboard** | 为情景变量提供公司背景信息 |

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| 场景过于抽象，难以采取行动 | 变量不够具体或未充分量化 | 要求每个变量都包含金额、百分比和时间线；“收入下降”不具备可操作性，而“未来 60 天内有 $420K ARR 面临风险”则具备可操作性 |
| 团队只能提出显而易见、低概率的场景 | 从众偏差；未采用 Shell 场景规划法来挑战思维模型 | 使用逆向思考技术：“什么情况必然会导致我们失败？”；引入外部视角；参考特定行业的历史先例 |
| 级联映射止步于一阶影响 | 引导者没有继续追问即时后果之后的影响 | 要求每个变量至少映射 3 层级联影响；针对每个业务领域的影响，使用“然后会怎样？”进行追问 |
| 已识别对冲措施，但从未实施 | 未指定负责人、截止日期或成本 | 每项对冲措施都必须包含：成本估算、负责人姓名、截止日期和状态跟踪；在每周领导层会议中进行审查 |
| 作战室会议耗时过长（> 4 小时） | 变量过多，或试图对每个场景进行建模 | 强制规定每次会议最多使用 3 个变量和 3-4 个场景；使用严重程度矩阵，聚焦影响最大的组合 |
| 未监控预警信号 | 已分配信号，但未将其整合到现有报告中 | 将信号添加到现有仪表板和每周记分卡中；指定专人监控每个信号 |
| 参与者不愿提出最坏情景 | 担心被视为消极或危言耸听 | 明确制定基本规则；引用 Shell 的经验：“价值在于揭示他人不愿说出的事情”；奖励说出残酷事实的行为 |

---

## 成功标准

- 每次场景会议都应恰好产出 3 个变量、3 个严重程度级别，以及一份标明中断点的级联图
- 预警信号足够具体，能够进行监控：可观察、具有前瞻性、可采取行动，并设有明确阈值
- 对冲措施已核算成本、指定负责人，并设有作战室会议结束后 7 天内的截止日期
- 每个场景至少有一项对冲措施在 30 天内得到实施（而不仅仅是完成规划）
- 每 90 天开展一次场景审查，并根据新信息更新概率
- 当预警信号触发时，在规定的时间线内执行预先规划的响应措施
- 作战室产出足够简洁，可供董事会审阅：每个场景一页摘要

---

## 范围与限制

- **范围内：** 多变量场景构建、涵盖所有业务职能的级联建模、严重程度矩阵分析、预警信号设计、包含成本效益分析的对冲策略、场景审查节奏
- **范围外：** 单变量财务敏感性分析（使用 CFO Advisor 压力测试）；技术故障模式分析（使用工程事故规划）；常规项目风险评估（使用项目管理框架）；保险和风险转移（使用专业经纪商）
- **限制：** 场景概率是主观估计，而非精算结果；其价值在于做好准备，而非预测的准确性
- **限制：** 该框架假设场景相互独立或存在相关性；黑天鹅事件按定义无法建模
- **限制：** 级联映射基于常见的组织模式；独特的公司结构可能具有不同的级联路径
- **限制：** 每个场景最多使用 3 个变量是一项有意设置的约束；更多变量只会造成分析瘫痪，而不会带来更深刻的洞察

---

## 集成点

| 技能 | 集成方式 | 数据流 |
|-------|-------------|-----------|
| `ceo-advisor` | 基于情景分析为战略决策提供依据 | 战情室情景 → CEO 决策输入 |
| `cfo-advisor` | 针对情景影响和对冲成本进行财务建模 | 战情室财务影响 → CFO 压力测试模型 |
| `coo-advisor` | 制定运营应急计划并阻断连锁反应 | 战情室连锁反应图 → COO 应急计划 |
| `executive-mentor` | 将事前验尸分析中的失败模式纳入情景变量 | 导师识别的失败模式 → 战情室变量 |
| `internal-narrative` | 危机情景需要预先制定沟通计划 | 战情室危机情景 → 危机叙事模板 |
| `org-health-diagnostic` | 通过健康维度评分发现情景变量 | 健康状况危险信号 → 战情室候选变量 |
| `strategic-alignment` | 情景结果可能需要进行战略再调整 | 战情室结果 → 重新评估战略一致性 |

---

## Python 工具

| 工具 | 用途 | 用法 |
|------|---------|-------|
| `scripts/scenario_builder.py` | 构建包含变量、概率、检测信号和严重程度等级的结构化情景 | `python scripts/scenario_builder.py --name "Customer Concentration Risk" --variable "Top customer churns" --probability 20 --impact 500000 --timeline 90 --json` |
| `scripts/impact_matrix_calculator.py` | 使用严重程度矩阵和连锁风险评分，计算多个变量产生的复合影响 | `python scripts/impact_matrix_calculator.py --variables "churn:500000:0.2" "fundraise_delay:0:0.3" "key_departure:0:0.15" --arr 2000000 --runway-months 14 --json` |
| `scripts/decision_tree_analyzer.py` | 构建并评估决策树，通过计算期望值分析战略选项 | `python scripts/decision_tree_analyzer.py --decision "Enter Japan market" --option "Direct:0.6:2000000:-500000" --option "Partnership:0.75:1000000:-200000" --option "Wait:1.0:0:0" --json` |