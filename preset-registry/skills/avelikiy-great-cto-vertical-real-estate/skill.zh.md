---
name: vertical-real-estate
description: Residential-proptech domain knowledge so architect / pm aren't naive when speccing real-estate products (listings, lead-crm, transaction-coordination, property-mgmt). Codifies MLS/IDX reality, listing status lifecycle + syndication canonical-source, long-cycle lead nurture, transaction-coordination as the high-pain wedge, and the must-model entities. Applied during spec authoring so the architecture reflects how real estate actually works — not a generic CRUD assumption.
when_to_use: |
  Apply when architect or pm is speccing a residential real-estate / proptech product:
  - listings (content) — build once, syndicate to every portal
  - lead-crm (crm) — capture + long-cycle automated nurture
  - transaction-coordination (crud) — tasks / docs / deadlines to close
  - property-mgmt (crud) — rent, maintenance, tenant comms
  Use to seed the domain model + the "what a naive build gets wrong" checklist before tasks are decomposed.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 垂直领域：住宅房地产——不要想当然地编写规格说明

房地产看起来像是通用的 CRUD（房源是一条记录，潜在客户是一个联系人，交易是一份
检查清单）。但事实并非如此。这个领域有一套历经实践检验的复杂结构——MLS 的特殊规则、状态生命周期、
长达数月的销售周期、经纪人与经纪公司之间的数据边界——草率的构建会忽略这些结构，
之后又不得不重新实现。本技能会预先引入这些结构，确保规格说明从一开始就是正确的。

需要了解的现有厂商（及其主导领域）：**Lone Wolf / Propertybase**（经纪公司 CRM + 后台
管理）、**Follow Up Boss**（从潜在客户到成交的 CRM，潜在客户培育领域的黄金标准）、**CINC**（潜在客户开发
+ CRM）、**Top Producer**（传统 CRM）、**kvCORE / BoldTrail**（一体化平台）。它们
价格高昂、覆盖面广，并且切换成本很高——这正是切入点至关重要的原因（参见各产品部分）。

## 1. 领域词汇（在规格说明中使用这些术语）

- **MLS**（多重上市服务，Multiple Listing Service）——区域性的房源数据库；美国约有 500 多个 MLS，
  每个都有自己的系统、登录方式和字段集。不存在单一的全国性 MLS。
- **IDX**（互联网数据交换，Internet Data Exchange）——允许经纪公司在自己的网站上展示*其他*
  经纪公司 MLS 房源的规则与数据馈送。受各 MLS 的展示和再分发规则约束。
- **RESO**——标准制定机构。**RESO Web API**（现代 REST/OData 数据馈送）和 **RESO Data
  Dictionary**（规范字段名称）是行业标准——但不同 MLS 的采用程度和数据整洁度各不相同。
  “符合 RESO 标准”仍然意味着需要处理各 MLS 的特殊情况。
- **房源状态**——它是生命周期，而不是标志位：`active → pending / contingent → closed`
  （此外还有 `coming soon`、`active under contract`、`withdrawn`、`expired`、`sold`）。状态
  决定展示规则和下游自动化流程。
- **买方经纪人与卖方（房源）经纪人**——分别代表交易的相对两方；其数据和
  权限不同。一个联系人可以先是买方潜在客户，之后再成为卖方。
- **经纪公司与经纪人**——经纪公司持有执照，并且（通常）持有数据；经纪人是
  用户。佣金**分成**是指交易佣金如何在经纪公司与经纪人之间分配。
- **托管 / 结算 / 交割**——资金完成交割；**附带条件**（房屋检查、
  融资、估价）是必须先满足的条件，每项都有一个**截止日期**。
- **交易协调员（TC）**——负责推动交易从报价被接受直至
  交割的人：追踪文件、签名和截止日期。目前通常通过 Dotloop / Excel 完成这些工作。
- **CMA**（比较市场分析，Comparative Market Analysis）——经纪人根据可比房源为卖方提供的价格估算。
- **潜在客户到成交漏斗**——获取 → 培育 → 活跃 → 签约中 → 已成交；整个过程长达数月。
- **房源聚合门户**——**Zillow、Realtor.com**、Redfin、Trulia 等；一个房源会被
  推送（分发）到多个门户；我们持有的副本只是众多下游副本之一。

## 2. 不明显的领域规则（会让草率规格说明出问题的因素）

- **不存在统一的 MLS 模式。** 每个 MLS 都有自己的身份验证方式、字段特殊情况、照片处理方式和
  再分发规则。RESO 标准化的是*意图*，但各 MLS 的数据依然杂乱。应为
  **每个 MLS 建立一个集成适配器**，而不是构建一个全局导入器。
- **交易协调是服务不足且痛点突出的切入点。** 这部分工作目前仍在
  Dotloop/Excel 中完成，需要手动追踪截止日期。切换成本低（它不是潜在客户的记录系统）、
  痛点明显、投资回报清晰。如果要选择最先进入的领域，应优先从这里入手。
- **一个房源有一个规范来源和多个分发副本。** MLS 记录（或我们的
  记录）是真实数据源；门户副本由它派生而来。不要把门户副本建模为
  独立房源——应建模为 `source` + `syndication targets`。
- **潜在客户培育是长周期过程。** 一个房地产潜在客户可能保持温热状态长达 **6–18 个月**。CRM 的
  工作*不是*促成本周成交，而是通过自动化滴灌，在数月内持续保持客户认知，
  直到潜在客户准备就绪。短漏斗式的 CRM 设计完全不适合这个领域。

## 3. 简单粗暴的构建方式会犯哪些错误

- ❌ **只有一种 MLS 模式。** 假定只有一种导入格式。实际情况是：每个 MLS 都需要单独的适配器和
  再分发规则；RESO Data Dictionary 是规范化的*目标*，而不是数据源。
- ❌ **房源缺少状态生命周期和联合分发规范模型。** 只有一条扁平的“房源”记录，却没有
  状态机和源/目标模型，既无法驱动展示规则，也无法向房源门户提供数据。
- ❌ **TC 清单缺少截止日期和附带条件跟踪。** 单纯的任务列表没有抓住
  重点：其价值在于强制执行**截止日期**和跟踪**附带条件**的解除，并提供提醒。
- ❌ **潜在客户 CRM 缺少长周期培育。** 阶段 + 下次联系 + 持续数月的滴灌式触达才是核心；
  只有销售管道（几周内成交/流失）的 CRM 并不适用。
- ❌ **忽略经纪人与经纪公司之间的数据边界。** 潜在客户和房源数据究竟归谁所有——
  经纪人还是经纪公司——是切实存在的权限/所有权边界。应将其内置到模型中，而不是
  事后再追加。

## 4. 必须建模的实体

使用以下实体作为领域模型的基础（具体字段可以协商，但其*结构*不可缺少）：

- **房源** — `status`（生命周期状态机，§1）、`source_ref`（MLS id / RESO key——
  规范数据源）、`syndication_targets[]`（Zillow/Realtor.com/…，包含每个目标的状态）、
  价格、地址、卧室数/浴室数、建筑面积、照片、房源经纪人、经纪公司。
- **潜在客户** — `stage`（capture→nurture→active→under-contract→closed）、`last_contact_at`、负责的
  经纪人、来源、买方/卖方意向，以及关联的**长周期培育**（滴灌式营销活动、
  下次联系日期）。与 [[lifecycle-messaging]] 关联。
- **交易** — `checklist[]`（任务）、`deadlines[]`（每项均包含日期 + 负责人 + 提醒）、
  `contingencies[]`（验房/融资/估价，每项均包含解除截止日期 + 状态）、
  `documents[]`（已电子签署）、参与方（买方/卖方/经纪人/TC）、成交日期。
- **房产 / 单元** + **维修请求**（状态、优先级、租户、负责人、照片）、
  租约/租金（金额、到期日期、租户）、租户沟通线程。（property-mgmt。）

## 5. 各产品说明（切入点 + 必须做对的一项领域能力）

- **listings**（内容）— *最重要的一点*：**MLS/IDX 正确性**——为每个 MLS 提供适配器、
  以 `source_ref` 作为规范标识、实现状态生命周期，并按照再分发规则合规展示。与
  [[local-seo]]（房源必须获得搜索排名并进行联合分发；我们的页面是规范页面，门户副本
  反向链接至此）和 [[migration-ready-schema]]（`source_ref` = MLS/RESO key，用于重新导入/去重）配合使用。
- **lead-crm**（CRM）— *最重要的一点*：**长周期培育**——持续数月的自动化滴灌式触达、
  阶段 + 上次联系时间，目标是持续保持品牌认知，而不是立即成交。其竞争对手是 Follow Up Boss；衡量标准是
  培育质量。与 [[lifecycle-messaging]] 配合使用。
- **transaction-coordination**（CRUD）— *最重要的一点*：这**就是切入点**——切换成本低、
  痛点强烈，可替代 Dotloop/Excel。把**截止日期 + 附带条件跟踪**做好（有日期、
  有负责人、有提醒）；仅有清单只是基本要求。建议首先从这里切入。
- **property-mgmt**（CRUD）— *最重要的一点*：将**维修请求 + 租金 + 租户沟通**作为
  一等业务流程；不要将其简化为通用工单列表。不要以简单粗暴的方式持有租户/业主资金
  （参见 §6 escrow/trust）。

## 6. 合规性（简要——标记出来供审核者查看，不要在此处解决）

- **MLS / IDX 再分发与展示规则**——因 MLS 而异；规定可以展示哪些内容、展示
  多长时间，以及采用何种署名方式。集成适配器必须遵守这些规则。
- **《公平住房法》**——房源/广告文案和定向投放不得歧视（受保护
  群体）。这适用于房源描述及任何潜在客户定向自动化。
- **托管 / 信托账户基础**——切勿以简单草率的方式持有或转移客户/租户资金。
  定金和租金应通过信托/托管账户流转，并接受严格核算；应集成合规的
  服务提供商，而不是自行构建钱包。
- **电子签名**——交易文档需要具有法律效力的电子签名（ESIGN/UETA）；应使用正规的电子签名
  服务提供商，并记录审计轨迹。

## 输出

应用后，在架构/设计文档中添加一个 **领域模型** 块：

```
## Domain model (real estate)
- entities: Listing(status lifecycle + source_ref + syndication_targets) · Lead(stage + last_contact + nurture) · Transaction(checklist + deadlines + contingencies + docs) · Property/Unit + MaintenanceRequest
- wedge: <which product lands first + why> (default: transaction-coordination)
- MLS/IDX: per-MLS adapter · RESO Data Dictionary as normalization target · redistribution rules honored
- nurture: long-cycle (6–18mo) drip, not short funnel
- compliance flags: IDX display rules · Fair Housing (copy) · escrow/trust (no naive funds) · e-sign
```