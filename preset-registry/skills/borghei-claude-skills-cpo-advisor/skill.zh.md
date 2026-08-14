---
name: cpo-advisor
description: >
  Strategic product leadership for scaling companies: product vision, portfolio
  strategy, and PMF measurement. Use when setting product vision, managing a
  product portfolio, measuring PMF, or designing product teams.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: cpo-leadership
  updated: 2026-03-09
  frameworks:
    - pmf-playbook
    - product-strategy
    - product-org-design
    - portfolio-management
    - north-star-framework
    - investment-posture
  triggers:
    - CPO
    - chief product officer
    - product strategy
    - product vision
    - product-market fit
    - PMF
    - portfolio management
    - product organization
    - roadmap strategy
    - product metrics
    - north star metric
    - retention curve
    - product trio
    - team topologies
    - JTBD
    - jobs to be done
    - product-led growth
    - PLG
    - product board reporting
    - invest maintain kill
    - feature prioritization
    - product portfolio
---
# CPO 顾问

战略产品领导力。愿景、产品组合、PMF、组织设计和指标。不处理功能层面的工作——而是关注决定构建什么、为何构建以及由谁构建的决策。

## 关键词

CPO、首席产品官、产品战略、产品愿景、产品市场契合度、PMF、产品组合管理、产品组织、路线图战略、产品指标、北极星指标、留存曲线、产品三人组、团队拓扑、待办任务、JTBD、品类设计、产品定位、面向董事会的产品报告、投资-维持-淘汰、BCG 矩阵、转换成本、网络效应、产品驱动增长、PLG、功能采用率、价值实现时间、激活率

---

## CPO 负责三件事

其他一切都可以授权。

| 职责 | 含义 | 关键问题 |
|-----------|--------------|--------------|
| 产品组合 | 哪些产品应当存在，哪些应获得投资，哪些应被淘汰 | “如果我们的 4 款产品中只能为 2 款提供资金，应该选择哪 2 款？” |
| 愿景 | 产品在未来 3-5 年将走向何方，以及客户为何在意 | “如果我们成功了，世界会是什么样子？” |
| 组织 | 能够执行愿景的团队结构 | “这个组织能否交付未来 12 个月的战略？” |

---

## 产品市场契合度评估

### PMF 评分矩阵

| 维度 | 权重 | 评分 1-3（弱） | 评分 4-6（初步形成） | 评分 7-10（强） |
|-----------|--------|-----------------|---------------------|---------------------|
| 留存 | 30% | D30 < 15%（消费者业务）或 < 40%（B2B） | D30 15-30% / 40-60% | D30 > 30% / > 60% |
| 参与度 | 25% | DAU/MAU < 15% | DAU/MAU 15-35% | DAU/MAU > 35% |
| 满意度 | 25% | Sean Ellis 调查中选择“非常失望”的比例 < 25% | 25-40% | > 40% |
| 增长 | 20% | 无自然增长 | 有一定自然增长，但主要依赖付费增长 | > 50% 为自然增长 |

### PMF 决策树

```
START: "Do we have PMF?"
  |
  v
[Check retention curve shape]
  |
  +-- Declining to zero --> NO PMF. Stop building. Talk to users.
  |
  +-- Declining but flattening --> EMERGING. Find the segment where it's flat.
  |
  +-- Flat or smiling --> [Check Sean Ellis score]
                          |
                          +-- < 25% "very disappointed" --> Weak PMF. Product is nice, not essential.
                          |
                          +-- 25-40% --> Moderate PMF. Find and double down on power users.
                          |
                          +-- > 40% --> [Check organic growth]
                                        |
                                        +-- < 30% organic --> PMF exists but distribution is weak.
                                        +-- > 30% organic --> STRONG PMF. Scale.
```

### 实现 PMF 后的陷阱

| 陷阱 | 描述 | 预防措施 |
|------|-------------|------------|
| 功能蔓延 | 为新细分市场添加功能会稀释核心价值 | 聚焦“待办任务”，而非功能 |
| 过早扩张 | 在留存被证明可持续之前扩大销售和营销规模 | 在扩大支出前，证明至少 3 个用户群组能够保持留存 |
| 虚荣指标 | 庆祝注册量，却忽视留存 | 北极星指标必须是留存或参与度指标 |
| 创始人脱离产品 | 实现 PMF 后，CEO 不再与客户交流 | 每月与客户交流应成为长期固定安排 |
| 过早建设平台 | 在核心产品尚未稳固之前构建平台能力 | 只有在至少 3 款产品需要共享基础设施后，才建设平台 |

---

## 产品组合管理

### 投资姿态框架

每个产品都必须明确采用一种且仅一种姿态。“观望”就是决定失去市场份额。

| 姿态 | 信号 | 资源分配 | 评审频率 |
|---------|--------|-------------------|----------------|
| **投资** | 高增长，留存率强劲或持续改善，PMF 明确 | 完整团队、激进的路线图、专属营销资源 | 每月 |
| **维持** | 收入稳定、增长缓慢、利润率良好 | 修复缺陷、渐进式改进、尽量少开发新功能 | 每季度 |
| **收割** | 增长下滑、仍可盈利、没有复苏路径 | 最低限度投入，最大化现金回收 | 每季度 |
| **终止** | 持续下滑、利润率为负、没有复苏迹象 | 确定停止日期、迁移计划和团队重新分配方案 | 立即 |

### 产品组合健康度记分卡

| 指标 | 健康 | 不健康 |
|--------|---------|-----------|
| 来自“投资”类产品的收入占比 | > 60% | < 40% |
| 投入“终止”候选产品的工程资源占比 | < 10% | > 20% |
| 姿态不明确的产品数量 | 0 | > 1 |
| 产品组合 D30 留存率（加权） | QoQ 改善 | QoQ 下滑 |
| 持续 > 2 个季度的“问题产品”数量 | 0 | > 2 |

### 产品组合评审流程

```
Quarterly Portfolio Review (Half-day workshop)

Step 1: Data Preparation (pre-meeting)
  - Revenue, growth rate, retention, margin per product
  - Engineering investment % per product
  - Customer satisfaction per product

Step 2: BCG Classification
  - Plot each product on Growth Rate (Y) vs Market Share (X)
  - Stars: high growth, high share --> Invest
  - Cash Cows: low growth, high share --> Maintain/Harvest
  - Question Marks: high growth, low share --> Invest or Kill (decide now)
  - Dogs: low growth, low share --> Kill

Step 3: Investment Allocation
  - Align engineering capacity to posture
  - Reallocate from Kill/Harvest to Invest
  - Set clear milestones for Question Marks (90-day decision point)

Step 4: Communication
  - Share portfolio decisions with all product teams
  - Update roadmaps to reflect postures
  - Communicate sunset plans for Kill products
```

---

## 北极星指标框架

### 选择标准

北极星指标必须满足以下所有条件：

| 标准 | 检验问题 |
|-----------|------|
| 衡量客户价值 | 指标改善是否意味着客户获得了更多价值？ |
| 领先指标 | 它能否预测未来收入？ |
| 可执行 | 产品团队能否对其产生影响？ |
| 单一数值 | 能否将其表述为一个指标？ |
| 难以操纵 | 如果没有真正帮助客户，是否很难改善该指标？ |

### 不同商业模式的北极星指标

| 模式 | 北极星指标 | 有效原因 |
|-------|-----------|-------------|
| B2B SaaS | 每周使用核心功能的活跃账户数 | 结合了采用率 + 参与度 + 黏性 |
| 消费者社交产品 | 每日内容创作者数量 | 创作者能够推动消费者参与 |
| 市场平台 | 每周成功交易数量 | 供需双方都活跃 = 健康的市场平台 |
| PLG | 在 14 天内达到激活状态的账户数 | 激活能够预测留存 |
| 数据/分析 | 每位活跃用户每周的查询次数 | 使用强度 = 获得的价值 |
| 金融科技 | 每月活跃交易用户数 | 交易活动 = 核心价值 |
| 电子商务 | 重复购买率（90 天） | 在商业活动中，留存决定一切 |

### 指标层级

```
North Star Metric (1, owned by CPO)
  |
  +-- Leading Indicator 1 (owned by PM Team A)
  |     e.g., Activation rate within 7 days
  |
  +-- Leading Indicator 2 (owned by PM Team B)
  |     e.g., Feature X adoption rate
  |
  +-- Leading Indicator 3 (owned by PM Team C)
  |     e.g., D7 retention rate
  |
  +-- Guard Rail Metrics (owned by CPO)
        e.g., NPS, support ticket volume, revenue per user
```

---

## 产品组织设计

### 团队拓扑选择

| 拓扑 | 适用场景 | 最佳规模 | 沟通方式 |
|----------|------------|-------------|---------------|
| 业务流对齐型 | 默认选择。团队负责端到端的客户旅程。 | 5-9 人 | 跨团队依赖较少 |
| 平台型 | 多个业务流都需要的共享基础设施 | 4-8 人 | API 优先、自助服务 |
| 赋能型 | 临时组建，用于提升业务流团队的能力 | 2-4 人 | 教练模式、有时间限制 |
| 复杂子系统型 | 需要深度专业知识的领域（ML、支付） | 3-6 人 | 为业务流提供服务 |

### 产品团队人员比例

| 公司规模 | PM : 工程师 | PM : 设计师 | 产品团队总人数 |
|-------------|---------------|---------------|-------------------|
| 10-30 | 1:4-6 | 1:1 | 1 名 PM、1 名设计师、4-6 名工程师 |
| 30-80 | 1:5-8 | 1:1-2 | 2-4 名 PM、2-3 名设计师 |
| 80-200 | 1:6-10 | 1:1-2 | 5-10 名 PM、4-6 名设计师 |
| 200+ | 1:8-12 | 1:2 | 10+ 名 PM、8+ 名设计师 |

### 产品三人组

每个产品团队都应采用三人组模式运作：PM + 设计师 + 技术负责人。

| 角色 | 负责 | 决策 |
|------|------|---------|
| PM | 构建什么以及为什么构建 | 优先级、范围 |
| 设计师 | 用户体验与可用性 | 交互模式、研究 |
| 技术负责人 | 如何构建以及技术可行性 | 架构、实现 |

**反模式**：PM 编写规格说明并交给设计团队，设计团队再交给工程团队。这只是贴着敏捷标签的瀑布式开发。

---

## CPO 仪表盘

| 类别 | 指标 | 频率 | 目标 |
|----------|--------|-----------|--------|
| 增长 | 北极星指标 | 每周 | 环比改善 |
| 留存 | 按同期群划分的 D30 / D90 留存率 | 每周 | 趋于平稳或改善 |
| 获客 | 新激活数 | 每周 | 符合计划 |
| 激活 | 首次实现价值所需时间 | 每周 | 持续缩短 |
| 参与度 | DAU/MAU 比率 | 每周 | > 30%（B2B）/ > 20%（消费者） |
| 满意度 | NPS 趋势 | 每月 | > 40 |
| 产品组合 | 各产品收入 | 每月 | 与产品定位一致 |
| 产品组合 | 各产品的工程投入占比 | 每月 | 与产品定位一致 |
| 质量 | 每千名用户的支持工单数 | 每月 | 持续减少 |
| 护城河 | 功能采用深度 | 每月 | 持续增加 |

---

## 危险信号

- 产品连续 2 个以上季度停留在“问题产品”状态而未做出决策 -- 当机立断
- 工程资源分配给了收入最高的产品，而增长最快的产品却人手不足 -- 资源错配
- > 30% 的团队时间投入到收入下滑的产品上 -- 沉没成本谬误
- 留存曲线始终无法趋于平稳 -- 没有实现 PMF，停止构建功能，开始与用户交流
- PM 在不与用户交流的情况下编写规格说明 -- 产品作秀
- 平台团队的工作队列需要等待 6 周 -- 平台应提供自助服务，而不应成为瓶颈
- CPO 已超过 30 天未与客户交流 -- 脱离现实
- 北极星指标呈上升趋势，而留存率呈下降趋势 -- 指标选错了
- 路线图基于销售请求而非用户数据制定 -- 销售驱动型产品是一个陷阱
- 连续 90 天以上未开展用户研究 -- 团队是在猜测，而不是学习

---

## 与高管团队协作

| 当……时 | CPO 与……协作 | 以…… |
|---------|-------------------|-------|
| 确定公司方向 | CEO (`ceo-advisor`) | 将愿景转化为产品押注 |
| 制定路线图预算 | CFO (`cfo-advisor`) | 论证各产品的投资分配 |
| 扩大产品组织规模 | COO + CHRO | 使招聘与产品增长需求保持一致 |
| 评估技术可行性 | CTO (`cto-advisor`) | 共同权衡功能与平台之间的取舍 |
| 确定发布时机 | CMO (`cmo-advisor`) | 使产品发布与需求生成能力保持一致 |
| 处理销售团队要求的功能 | CRO (`cro-advisor`) | 区分对收入至关重要的需求与干扰项 |
| 应对合规期限 | CISO (`ciso-advisor`) | 识别不可妥协的安全事项 |
| 制定产品战略 | 产品团队 (`product-team/`) | 通过产品经理执行战略 |
| 开展用户研究 | 用户体验研究 (`product-team/ux-researcher`) | 用数据验证假设 |

---

## 主动触发条件

- 留存曲线未趋于平稳 -- PMF 面临风险，停止功能开发并展开调查
- 功能请求不断积压，却没有优先级评估框架 -- 建议采用 RICE 评分
- 超过 90 天未开展用户研究 -- 产品团队正在基于假设进行开发
- NPS 环比下降 -- 深入分析贬损者反馈，找出其中的规律
- 产品组合中存在一个所有人都避而不谈的“瘦狗”产品 -- 推动做出终止或投资的决定
- 某款收入占比低于 5% 的产品占用了超过 20% 的工程支出 -- 投资错配
- 新竞争对手以相似定位推出产品 -- 需要制定竞争应对措施

---

## 输出成果

| 请求 | 交付物 |
|---------|-------------|
| “我们是否实现了 PMF？” | 涵盖 4 个维度并包含同期群数据的 PMF 记分卡 |
| “确定路线图的优先级” | 使用相应框架（RICE/ICE）评分并按优先级排序的待办事项列表 |
| “评估我们的产品组合” | BCG 矩阵图，以及针对每款产品的投资/维持/终止建议 |
| “设计我们的产品组织” | 包含组织拓扑、人员比例、汇报关系和转型计划的组织方案 |
| “产品董事会汇报部分” | 董事会幻灯片：北极星指标、留存率、路线图亮点、风险 |
| “设定我们的北极星指标” | 包含指标层级、领先指标和护栏指标的北极星指标方案 |
| “终止一款产品” | 下线计划：时间表、迁移、沟通、团队重新分配 |

---

## 工具参考

### 1. product_portfolio_analyzer.py

使用 BCG 矩阵分类（明星/现金牛/问题/瘦狗）分析产品组合，计算产品组合健康度评分，识别投资错配，并生成再平衡建议。

```bash
python scripts/product_portfolio_analyzer.py --input portfolio.json --json
python scripts/product_portfolio_analyzer.py --input portfolio.json
```

| 标志 | 类型 | 说明 |
|------|------|-------------|
| `--input` | 必需 | 包含产品信息（revenue、growth rate、market share、engineering investment %、retention）的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式而非人类可读文本输出 |

### 2. feature_prioritizer.py

使用 RICE 评分（Reach x Impact x Confidence / Effort）确定功能优先级。支持自定义权重、生成按优先级排序的待办事项列表，并标记评分异常。

```bash
python scripts/feature_prioritizer.py --input features.json --json
python scripts/feature_prioritizer.py --input features.json --method rice
```

| 标志 | 类型 | 描述 |
|------|------|-------------|
| `--input` | 必填 | 包含功能信息（覆盖人数、影响力、信心度、工作量及可选类别）的 JSON 文件路径 |
| `--method` | 可选 | 评分方法：`rice`（默认）、`ice` 或 `weighted` |
| `--json` | 可选 | 以 JSON 格式输出，而非人类可读的文本 |

### 3. product_health_scorer.py

从 5 个维度评估产品健康度：留存率（D30/D90）、参与度（DAU/MAU）、满意度（NPS/Sean Ellis）、增长（自然增长占比）和激活（价值实现时间）。生成 PMF 评估和趋势分析。

```bash
python scripts/product_health_scorer.py --input product_data.json --json
python scripts/product_health_scorer.py --input product_data.json
```

| 标志 | 类型 | 描述 |
|------|------|-------------|
| `--input` | 必填 | 包含留存率、参与度、满意度、增长和激活等产品指标的 JSON 文件路径 |
| `--json` | 可选 | 以 JSON 格式输出，而非人类可读的文本 |

---

## 故障排除

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| 产品连续 2 个以上季度停留在“问题产品”状态 | 缺乏决策框架或领导层回避决策 | 在下一次产品组合评审中强制做出投资或终止决策；设定 90 天里程碑，并配置自动终止触发条件 |
| 工程资源分配给了收入最高的产品，而增长最快的产品却缺乏资源 | 投资策略未与增长潜力保持一致 | 运行产品组合分析器以量化错配情况；使用 BCG 分类重新分配资源 |
| PM 通过夸大覆盖人数或影响力来操纵 RICE 分数 | 缺乏校准流程或统一的评分标准 | 要求为每个评分维度提供证据；每季度在各 PM 团队之间开展校准会议 |
| 北极星指标呈上升趋势，而留存率却呈下降趋势 | 选择了错误的北极星指标，或该指标易被操纵 | 根据 5 项选择标准重新评估北极星指标；将留存率添加为护栏指标 |
| 路线图根据销售请求而非用户数据制定 | 缺乏结构化的需求接收流程，或 CPO 未进行筛选 | 实施功能请求分类处理；要求在将功能纳入路线图之前提供用户研究证据 |
| 平台团队有长达 6 周的队列，阻碍了流式团队 | 平台不支持自助服务；依赖项过多 | 重新设计平台以提供自助式 API；增加赋能团队，为最高优先级的流式团队解除阻碍 |
| 超过 90 天未开展用户研究 | 研究工作未嵌入团队工作流，或人员配备不足 | 将研究人员嵌入产品三人组；设定最低研究频率（每季度至少开展 2 项研究） |

---

## 成功标准

- 每个产品都有明确的投资策略（投资/维持/收割/终止），并按季度进行评审
- “投资”类产品的北极星指标逐月改善
- 所有活跃产品的 D30 留存率趋于稳定或有所改善
- 工程投资比例与产品组合策略保持一致，偏差不超过 10%
- 所有 PM 团队均使用一致的评分框架进行功能优先级排序
- 首次价值实现时间逐季度缩短
- 任何产品被归类为“问题产品”的时间均不超过连续 2 个季度

---

## 范围与限制

**范围内：** 产品市场契合度评估、产品组合管理（BCG 分类、投资策略）、北极星指标框架、产品组织设计（团队拓扑、人员比例、产品三人组）、功能优先级排序（RICE/ICE 评分）、产品健康度评分、CPO 仪表盘指标以及董事会层面的产品报告。

**范围外：** 功能层面的产品管理（使用 product-team/product-strategist）、用户体验设计与研究执行（使用 product-team/ux-researcher）、工程实施规划（使用 engineering/ 技能）、定价策略（使用 cro-advisor 的定价部分）以及客户成功管理。工具用于分析产品指标快照；持续的产品分析需要与分析平台集成。

**限制：** PMF 评分依赖同期群层面的留存数据，而早期阶段的产品可能尚不具备这些数据。BCG 分类需要市场份额估算，而此类估算本身并不精确。RICE 评分具有主观性；其质量取决于校准的严谨程度。产品健康度基准会因商业模式（B2B 与消费级、SaaS 与市场平台）的不同而存在显著差异。

---

## 集成点

- **ceo-advisor** -- 产品战略将 CEO 愿景转化为产品押注；产品组合健康度为董事会报告提供依据
- **cto-advisor** -- 共同负责技术可行性；功能与平台之间的权衡决策需要与 CTO 合作
- **cro-advisor** -- 销售团队提出的功能请求需经 CPO 筛选；扩展收入取决于产品路线图
- **cmo-advisor** -- 发布时机与需求生成能力保持一致；产品定位为营销提供指引
- **cfo-advisor** -- 基于产品组合健康度数据，为各产品的投资分配提供依据
- **product-team/** -- CPO 战略通过产品经理落地执行；研究和优先级排序逐级向下传递