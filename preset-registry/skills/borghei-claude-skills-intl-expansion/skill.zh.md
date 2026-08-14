---
name: intl-expansion
description: >
  International market expansion strategy for scaling companies. Use when
  expanding to new countries, evaluating international markets, planning
  localization, building regional teams, or assessing regulatory requirements by
  region.
license: MIT + Commons Clause
metadata:
  version: 2.0.0
  author: borghei
  category: c-level
  domain: international-strategy
  updated: 2026-03-09
  frameworks:
    - market-selection
    - entry-mode-evaluation
    - localization-framework
    - regional-compliance
    - gtm-adaptation
    - launch-planning
  triggers:
    - international expansion
    - market entry
    - localization
    - go-to-market
    - GTM
    - regional strategy
    - international markets
    - market selection
    - cross-border
    - global expansion
    - new country
    - new market
    - EMEA
    - APAC
    - LATAM
    - data residency
    - local entity
    - regional team
---
# 国际扩张

用于拓展新市场的框架：市场选择、进入模式、本地化、监管合规、GTM 调整和执行。每一次扩张都是一场押注——本技能旨在构建这一押注，在投入资源之前最大限度地获取有效信号。

## 关键词

国际扩张、市场进入、本地化、市场推广、GTM、区域战略、国际市场、市场选择、跨境、全球扩张、EMEA、APAC、LATAM、数据驻留、本地实体、区域招聘、货币、支付方式、监管合规

---

## 首先明确

在生成内容之前，请确认以下信息。如果有任何一项未知或含糊，请提问——不要自行假设：

- [ ] **需要哪种交付成果**（市场评分、进入模式建议、本地化计划、监管图谱、定价或发布计划）——每种成果都遵循不同的框架
- [ ] **正在考虑的目标市场**——有关区域监管、文化距离和定价的指导因国家而异
- [ ] **在该市场已有的业务牵引力**（主动找上门的需求、当前来自该市场的 ARR）——进入模式的升级路径取决于收入阈值；市场拉动与主动推动会改变进入/不进入的决策
- [ ] **产品类型和本土市场模式**（B2B SaaS 与其他类型；PLG 与销售驱动）——这些框架针对 B2B SaaS 进行了调优，而 GTM 调整取决于当前模式

停止规则：只询问对输出影响最大的 2-3 个问题。如果用户说“直接起草即可”，则继续，并在交付成果顶部列出你的假设。

---

## 决策顺序

```
Market Selection --> Entry Mode --> Regulatory Assessment --> Localization Plan
  --> GTM Strategy --> Team Structure --> Launch --> Scale or Exit
```

---

## 市场选择框架

### 评分矩阵

| 因素 | 权重 | 评估方法 | 评分 1-5 |
|--------|--------|------------------|-----------|
| 市场规模（可触达） | 25% | 目标细分市场的 TAM、支付意愿、增长率 |
| 竞争强度 | 20% | 现有企业实力、替代方案数量、市场空白 |
| 监管复杂度 | 20% | 市场准入壁垒、合规成本、上线时间 |
| 文化距离 | 15% | 语言、商业惯例、购买行为、销售周期 |
| 现有业务牵引力 | 10% | 主动找上门的需求、现有客户、合作信号 |
| 运营复杂度 | 10% | 时区、基础设施、支付系统、人才储备 |

### 市场选择决策树

```
START: Considering a new market
  |
  v
[Is there existing pull from this market?]
  |
  +-- YES (inbound demand, existing customers) --> Strong signal. Score and proceed.
  |
  +-- NO  --> [Is there a strategic reason to enter?]
              |
              +-- YES (competitor pressure, investor expectation) --> Score carefully.
              |    Be honest about push vs. pull.
              |
              +-- NO  --> Do not enter. Focus on existing markets.
```

### 区域速查表

| 区域 | 市场规模 | 监管复杂度 | 文化距离（相对于美国） | 关键考虑因素 |
|--------|------------|----------------------|---------------------------|-------------------|
| 英国/爱尔兰 | 大 | 中 | 低 | 英语市场、强大的科技生态系统、英国脱欧相关事项 |
| DACH（德国/奥地利/瑞士） | 大 | 高 | 中 | 数据隐私要求严格、企业客户为主、需要德语 |
| 北欧 | 中 | 中 | 低至中 | 技术接受度高、英语普及、市场规模较小 |
| 法国 | 大 | 高 | 中 | 需要使用法语、劳动法严格、存在文化差异 |
| 比荷卢 | 中 | 中 | 低至中 | 多语言环境、欧洲业务运营枢纽 |
| 日本 | 非常大 | 非常高 | 高 | 需要本地合作伙伴、销售周期长、重视关系 |
| 新加坡/东南亚 | 中至大 | 中 | 中 | 区域枢纽、英语普及、各子市场差异较大 |
| 澳大利亚/新西兰 | 中 | 低 | 低 | 英语市场、商业文化相似、存在时区挑战 |
| 巴西 | 大 | 非常高 | 高 | 需要使用葡萄牙语、税制复杂、市场机会巨大 |
| 印度 | 非常大 | 高 | 中 | 价格敏感、英语普及、具备巨大的规模潜力 |

---

## 进入模式评估

### 进入模式对比

| 模式 | 投资 | 控制力 | 风险 | 速度 | 最适合 |
|------|-----------|---------|------|-------|----------|
| 远程销售（出口） | 低（$10-50K） | 低 | 低 | 快 | 在投入资源前测试需求 |
| 合作伙伴/经销商 | 中等（$50-200K） | 中等 | 中等 | 中等 | 本地要求较高的市场 |
| 本地招聘（不设实体） | 中等（$100-300K） | 中高 | 中等 | 中等 | 首次在当地部署人员 |
| 完整实体（子公司） | 高（$200K-1M） | 完全 | 高 | 慢 | 需求已得到验证的主要市场 |
| 收购 | 最高（$500K+） | 完全 | 最高 | 快（如果执行得当） | 立即获得市场影响力和客户群 |

### 进入模式决策树

```
START: Market selected, entry mode needed
  |
  v
[Do you have existing customers in this market?]
  |
  +-- NO  --> Start with Remote Sales
  |            Test demand for 3-6 months
  |            If revenue > $200K ARR from market --> Upgrade
  |
  +-- YES --> [Revenue from this market > $500K ARR?]
              |
              +-- NO  --> Remote Sales or Local Hire (EOR)
              |
              +-- YES --> [Does the market require local entity?]
                          |
                          +-- YES (regulatory requirement) --> Full Entity
                          +-- NO  --> [Revenue trajectory?]
                                      |
                                      +-- Growing fast --> Local Hire, plan Entity
                                      +-- Stable --> Partnership or Local Hire
```

### 默认升级路径

```
Stage 1: Remote Sales ($0-200K ARR from market)
  - Sell remotely from HQ
  - No local presence
  - Test messaging, pricing, ICP fit

Stage 2: Local Hire ($200K-500K ARR)
  - 1-2 people via EOR (Employer of Record)
  - Sales + CS representative
  - No legal entity yet

Stage 3: Local Entity ($500K-2M ARR)
  - Establish legal entity
  - Hire local team (3-8 people)
  - Local banking, contracts, compliance

Stage 4: Regional Hub ($2M+ ARR)
  - Full local team (10+ people)
  - Regional leadership
  - Market-specific product features
```

---

## 本地化框架

### 产品本地化

| 层面 | 必须具备 | 最好具备 | 成本影响 |
|-------|----------|-------------|-------------|
| 语言（UI） | 核心产品完整翻译 | 本地语言营销网站 | 初始成本 $20-50K |
| 货币 | 以当地货币显示和收费 | 多币种开票 | 工程成本 $10-30K |
| 支付方式 | 信用卡 + 当地首选支付方式 | 所有当地支付方式 | 每种方式 $5-20K |
| 数据格式 | 日期、时间、数字、地址 | 当地计量单位（km、kg 等） | 工程成本 $5-15K |
| 数据驻留 | 法律要求时 | 客户要求时 | 基础设施成本 $50-200K |
| 文化适配 | 避免文化误区 | 全面文化优化 | 视情况而定 |

### GTM 本地化

| 要素 | 方法 | 常见错误 |
|---------|----------|----------------|
| 信息传达 | 针对当地痛点调整价值主张 | 直接照搬本土市场内容 |
| 渠道策略 | 研究本地渠道（可能存在显著差异） | 假设相同渠道在所有地方都有效 |
| 案例研究 | 本地客户背书至关重要 | 仅展示美国/英国案例研究 |
| 合作伙伴关系 | 本地集成和生态系统 | 忽视本地技术生态系统 |
| 活动 | 地区性会议和线下聚会 | 仅参加全球性活动 |
| 内容/SEO | 本地语言内容、本地域名 | 在非英语市场仅提供英语内容 |

### 运营本地化

| 领域 | 关键考虑因素 |
|------|-------------------|
| 法律实体 | 类型、时间周期、成本、持续合规 |
| 税务合规 | VAT/GST 注册、转让定价、预扣税 |
| 劳动法 | 任意雇佣制与强劳动保障制度、通知期、福利 |
| 客户支持 | 服务时间、语言、渠道 |
| 银行业务 | 本地银行账户、支付处理 |
| 保险 | 对实体和员工的本地要求 |

---

## 各地区监管合规

### 数据隐私要求

| 法规 | 地区 | 关键要求 | 处罚 |
|-----------|--------|------------------|---------|
| GDPR | EU/EEA | 同意、数据最小化、DPO、数据泄露通知 | 最高可达年收入的 4% |
| UK GDPR | UK | 与 GDPR 类似，但需单独注册 | 最高可达年收入的 4% |
| LGPD | 巴西 | 与 GDPR 类似，必须设立 DPO | 最高可达收入的 2%（上限为 R$50M） |
| PIPL | 中国 | 数据本地化、同意、跨境评估 | 最高可达年收入的 5% |
| PIPA | 韩国 | 同意、目的限制、部分数据本地化 | 最高可达相关收入的 3% |
| APPI | 日本 | 同意、明确目的、跨境传输规则 | 可能面临刑事处罚 |
| 《隐私法》 | 澳大利亚 | APPs、数据泄露通知、跨境传输规则 | 处罚力度不断加大 |

### 数据驻留决策树

```
START: Expanding to new region
  |
  v
[Does local law require data residency?]
  |
  +-- YES (e.g., certain China, Russia, some industry regs)
  |     --> Local hosting mandatory. Budget for local infrastructure.
  |
  +-- NO  --> [Do target customers require local data hosting?]
              |
              +-- YES (common in enterprise, government, healthcare)
              |     --> Offer regional hosting as option. Major sales enabler.
              |
              +-- NO  --> Global hosting acceptable. Document your data practices.
```

---

## 国际市场进入策略

### 各市场的定价策略

| 方法 | 适用场景 | 示例 |
|----------|------|---------|
| 全球统一定价 | 产品简单、ICP 全球一致 | 各地价格相同 |
| 按 PPP 调整 | 消费级产品、价格敏感型市场 | 在发展中市场采用较低价格 |
| 特定市场定价 | 不同市场对价值的认知不同 | 在竞争较少的市场采用更高价格 |
| 本地货币、全球统一汇率 | B2B SaaS、企业客户 | 以本地货币定价，等值于 USD |

### 销售模式调整

| 市场特征 | 销售模式调整 |
|----------------------|----------------------|
| 高信任文化（北欧、日本） | 延长关系建立周期，提供更多证明材料 |
| 价格敏感型市场（印度、LATAM） | 灵活定价、提供按使用量计费的选项 |
| 渠道主导型市场（日本、中东） | 由合作伙伴主导销售，需要本地经销商 |
| 企业客户占比较高（DACH、法国） | 提供本地部署选项和合规文档 |
| 适合 PLG 的市场（美国、英国、北欧） | 提供自助服务和本地支付方式 |

---

## 常见错误

| 错误 | 原因 | 预防措施 |
|---------|---------------|------------|
| 同时进入过多市场 | FOMO、董事会压力 | 每年最多进入 1-2 个新市场 |
| 直接照搬本土市场的市场进入策略 | 假设各地买家都相同 | 首先研究本地购买行为 |
| 低估监管成本 | “到时候再想办法” | 在作出承诺之前进行监管评估 |
| 过早招聘本地团队 | 对需求过于乐观 | 首先证明该市场能够产生 $200K+ ARR |
| 定价错误（仅进行货币换算） | 懒惰或想当然 | 研究本地客户的支付意愿 |
| 忽视本地竞争 | 只关注全球竞争对手 | 本地企业往往主导细分市场 |
| 低估文化差异 | “全世界做生意都一样” | 投资本地市场专业知识 |
| 没有退出标准 | 沉没成本谬误 | 明确定义需要在 12 个月内达到的收入里程碑 |

---

## 启动检查清单

### 启动前（T-90 days 至 T-30 days）

| 类别 | 项目 | 状态 |
|----------|------|--------|
| 法务 | 已设立法人实体（如需要） | [ ] |
| 法务 | 当地合同已由当地法律顾问审核 | [ ] |
| 合规 | 已满足数据隐私要求 | [ ] |
| 合规 | 已完成税务登记 | [ ] |
| 产品 | 核心产品已本地化（语言、货币） | [ ] |
| 产品 | 已集成当地支付方式 | [ ] |
| 销售 | 已针对当地市场定义 ICP | [ ] |
| 销售 | 已针对当地市场设定定价 | [ ] |
| 营销 | 已制定本地化信息传达与定位 | [ ] |
| 营销 | 已准备当地案例研究（或邻近市场案例） | [ ] |
| 人员 | 已确定首位当地雇员人选 | [ ] |
| 支持 | 已制定覆盖当地时区的支持计划 | [ ] |

### 启动（T-0 至 T+90 days）

| 周次 | 重点 | 成功指标 |
|------|-------|----------------|
| 1-4 | 建立当地业务存在，开展首轮外联 | 20+ 次高质量沟通 |
| 5-8 | 建立首批销售管道，促成首批交易 | 销售管道中有 5+ 个商机 |
| 9-12 | 赢得首批客户，持续迭代 | 2+ 笔已成交交易，获得产品反馈 |

### 退出标准

如果在 12 个月内未达到以下标准，则评估退出：

| 指标 | 最低阈值 |
|--------|-------------------|
| 产生的销售管道 | $500K+ |
| 已实现收入 | $200K+ ARR |
| 客户满意度 | 当地市场 NPS > 20 |
| 进入成本 | < 首年收入的 3 倍 |

---

## 危险信号

- 仅因某位董事会成员建议而进入市场（没有数据支持）
- 在投入资源前未开展当地市场调研
- 仅按汇率换算定价，而非基于当地价值研究
- 在验证需求前聘请国家经理
- 在当地市场 ARR 达到 $200K 之前设立法人实体
- 忽视当地数据隐私要求
- 沿用与本土市场相同的营销信息
- 进入市场前未定义退出标准

---

## 与高管团队协作

| 角色 | 对扩张的贡献 |
|------|--------------------------|
| CEO (`ceo-advisor`) | 市场选择决策、战略承诺 |
| CFO (`cfo-advisor`) | 投资规模确定、ROI 建模、实体结构、税务 |
| CRO (`cro-advisor`) | 收入目标、销售模式调整、定价 |
| CMO (`cmo-advisor`) | 定位、渠道策略、本地品牌 |
| CPO (`cpo-advisor`) | 本地化路线图、功能优先级 |
| CTO (`cto-advisor`) | 基础设施、数据驻留、规模扩展 |
| CHRO (`chro-advisor`) | 当地招聘、劳动法、薪酬 |
| CISO (`ciso-advisor`) | 数据隐私、监管合规 |
| COO (`coo-advisor`) | 运营体系搭建、流程调整 |

---

## 输出产物

| 请求 | 交付物 |
|---------|-------------|
| “我们是否应该扩张到 [market]？” | 包含建议的市场评分分析 |
| “我们应该如何进入 [market]？” | 包含升级路径的进入模式建议 |
| “[market] 的本地化计划” | 产品 + GTM + 运营本地化检查清单 |
| “[region] 的监管要求” | 包含时间表和成本的合规检查清单 |
| “国际定价策略” | 针对特定市场的定价建议 |
| “[market] 的启动计划” | 包含里程碑和退出标准的 90 天启动计划 |

---

## 故障排查

| 问题 | 可能原因 | 解决方案 |
|---------|-------------|------------|
| 市场评分很高，但销售管道生成量接近于零 | 市场规模测算基于 TAM 而非 SAM；ICP 尚未在当地得到验证 | 使用可服务的可触达市场重新评分；在投入更多资源之前开展 20 次需求探索访谈 |
| 本地招聘人员工作 3 个月后仍未取得成果 | 人员画像不匹配（资历过高或过低）、总部支持不足，或 ICP 错误 | 评估所招聘人员是否同时具备本地市场专业知识和初创企业思维；确保总部提供赋能材料和及时响应的支持 |
| 监管合规所需时间达到计划的 2 倍 | 低估了复杂性；未尽早聘请当地法律顾问 | 在发布前阶段（T-90）聘请当地法律顾问；为所有监管时间安排增加 50% 的缓冲时间 |
| 本地化成本不断攀升并超出预算 | 范围从“最好具备”蔓延至“必须具备”；缺乏分阶段方法 | 严格应用本地化框架的分层：先完成“必须具备”项，仅在收入证明市场可行后再完成“最好具备”项 |
| 新市场中的定价缺乏竞争力 | 直接进行货币换算，未研究当地的支付意愿 | 与当地潜在客户开展 10 次以上的定价访谈；考虑进行 PPP 调整或设置特定于市场的定价层级 |
| 合作伙伴/经销商表现不佳 | 未对合作伙伴提供适当激励，或合作伙伴画像不匹配 | 审查合作伙伴选择标准；确保经济利益一致（利润空间）；设置包含退出条款的 90 天绩效评估 |
| 文化失误损害品牌在新市场中的形象 | 团队缺乏本地市场专业知识；照搬本土市场的方法 | 聘请当地顾问或咨询师进行文化审查；调整传达的信息，而不仅仅是进行翻译 |

---

## 成功标准

- 市场选择评分应生成清晰的排序列表，其中至少包含 3 个候选市场，并针对全部 6 项因素完成评分
- 所选市场进入模式应符合渐进路径：该市场的 ARR 达到 $200K 之前，不设立法律实体
- 在发布前 T-30 天，发布前检查清单应 100% 完成
- 前 90 天内完成 20 次以上有效访谈、形成 5 个以上销售管道机会，并促成 2 笔以上成交
- 在进入市场之前定义退出标准，并明确具体的收入和成本阈值
- 分阶段推进本地化：发布时完成“必须具备”项；“最好具备”项须在达到收入里程碑后方可实施
- 在新市场签署第一份客户合同之前完成监管合规

---

## 范围与限制

- **范围内：** 市场选择评分、进入模式评估、本地化规划（产品、GTM、运营）、按地区进行监管合规梳理、定价策略调整、包含退出标准的发布规划、团队结构决策
- **范围外：** 详细的税务咨询（聘请当地税务顾问）；移民和签证办理（使用专业服务提供商）；转让定价实施（使用具备税务专业知识的 CFO Advisor）；法律实体设立的具体工作（聘请当地法律顾问）
- **限制：** 地区速查数据仅供参考，并会随法规变化；在作出投入承诺之前，务必与当地专家核实
- **限制：** 该框架针对 B2B SaaS 公司进行了优化；B2C、硬件和平台型企业具有不同的扩张动态
- **限制：** 市场评分是一种结构化估算，而非保证；在进行重大投资之前，应通过真实的市场信号（入站需求、试点客户）加以验证

---

## 集成点

| Skill | 集成方式 | 数据流 |
|-------|-------------|-----------|
| `ceo-advisor` | 市场进入是一项 CEO 层面的战略决策 | CEO 战略 → 市场选择优先级 |
| `cfo-advisor` | 投资规模评估、ROI 建模、实体结构 | 扩张预算 → CFO 财务模型 |
| `cro-advisor` | 收入目标和销售模式调整 | 市场 ICP → CRO 销售作战手册调整 |
| `cmo-advisor` | 本地化定位和渠道策略 | 市场调研 → CMO 本地 GTM 计划 |
| `cpo-advisor` | 本地化路线图和功能优先级 | 本地化需求 → CPO 产品路线图 |
| `ciso-advisor` | 数据隐私和法规合规 | 法规图谱 → CISO 合规检查清单 |
| `chro-advisor` | 本地招聘、劳动法、薪酬 | 市场团队计划 → CHRO 本地招聘策略 |

---

## Python 工具

| 工具 | 用途 | 用法 |
|------|---------|-------|
| `scripts/market_readiness_scorer.py` | 使用六因素加权框架对目标市场进行评分和排名 | `python scripts/market_readiness_scorer.py --market "Germany" --market-size 4 --competition 3 --regulatory 2 --cultural-distance 3 --traction 4 --operational 3 --json` |
| `scripts/localization_checklist.py` | 为目标市场生成分阶段的本地化检查清单 | `python scripts/localization_checklist.py --market "Japan" --product-type saas --current-languages en --json` |
| `scripts/regulatory_mapper.py` | 按地区梳理法规要求，包括数据隐私、税务和劳动法 | `python scripts/regulatory_mapper.py --region eu --industry saas --data-processing yes --json` |