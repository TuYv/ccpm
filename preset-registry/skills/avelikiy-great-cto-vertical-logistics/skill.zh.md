---
name: vertical-logistics
description: Domain knowledge for the logistics & supply-chain vertical (SMB shipping & inventory) so architect and pm don't spec naively. Covers the vocabulary (TMS vs WMS, multi-carrier rate shopping, dimensional weight, BOL/ASN, lot/batch, reorder point), the non-obvious rules incumbents get right, what a naive build gets wrong, and the entities each of the four products (shipment-tracking, warehouse-lite, route-optimization, po-mgmt) must model. Applied by architect when writing ARCH-{slug}.md and by pm when writing PLAN-{slug}.md for any logistics product.
when_to_use: |
  Apply when:
  - architect writes ARCH-{slug}.md for shipment-tracking, warehouse-lite, route-optimization, or po-mgmt
  - pm writes PLAN-{slug}.md and needs to scope logistics work without underestimating carrier/inventory complexity
  - any spec touches shipments, carriers, tracking, warehouses, inventory, purchase orders, or routes
  Do NOT apply to non-logistics products (use the matching vertical skill instead).
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 垂直领域：物流与供应链——像真正发运过托盘一样编写规格

中小企业的运输与库存领域有着深厚的专业词汇体系和大量看似可选的规则，
直到真实客户的数据涌入时，才会发现它们不可或缺。现有厂商（ShipHero、CartonCloud、Descartes
ShipRush、GoFreight、AfterShip、FreightPOP）凝聚了数十年的行业经验。草率的规格会把
“货运”建模成一个追踪编号，把“仓库”建模成一个数量列——最终交付的只是个玩具。
本技能提供领域框架，帮助架构师/产品经理避免这种情况。

四类产品及其现有厂商：

| 产品 | 原型 | 切入点 | 最接近的现有厂商 |
|---|---|---|---|
| shipment-tracking | 仪表板 | 面向客户的品牌化物流追踪 | AfterShip（轻量版） |
| warehouse-lite | 增删改查 | 小型仓库 WMS | ShipHero / CartonCloud |
| route-optimization | 预订 | 多站点路线优化 | Descartes / FreightPOP |
| po-mgmt | 增删改查 | 采购订单生命周期 | GoFreight / FreightPOP |

## 1. 领域词汇（在规格中使用这些术语，不要换用其他说法）

- **TMS vs WMS** — 运输管理系统（Transportation Management System，管理地点之间的货物运输：
  承运商、费率、路线、追踪）与仓库管理系统（Warehouse Management System，管理建筑物内部
  静止状态的货物：SKU、库位、拣货/包装/发运）。不要混淆二者；route-optimization +
  shipment-tracking 偏向 TMS，warehouse-lite 属于 WMS，po-mgmt 则横跨两者。
- **Multi-carrier** — 一票货运可以通过 USPS / UPS / FedEx / DHL / 区域承运商运输。
  每家承运商都有自己的 API、面单格式、状态码和 webhook 结构。
- **Rate shopping** — 给定一个包裹，查询多家承运商，并选择满足
  SLA 的最便宜/最快服务。这决定了承运商选择；并且取决于体积重量。
- **Zones** — 承运商的距离区间（始发地→目的地）；费率由区域 × 重量决定。
- **Dimensional weight (DIM)** — 计费重量 = max(实际重量, L×W×H / DIM 除数)。
  又大又轻的箱子会按重货计费。忽略 DIM 会导致所有费率报价过低。
- **BOL (Bill of Lading)** — 货运的承运合同/收据（尤其用于货运运输）。
- **ASN (Advance Ship Notice)** — 供应商对入库货运的预先通知；它会将信息提供给
  收货流程，让仓库在货物到达前就知道将收到什么。
- **SKU + lot/batch** — SKU 标识产品；lot/batch 标识具体的
  生产批次（有效期、召回、FIFO）。同一 SKU 的不同批次不可互换。
- **Pick / pack / ship** — 仓库内部的出库履约顺序。
- **Putaway** — 将已收货的库存放入其存储库位。
- **Cycle count** — 定期进行的局部库存盘点（区别于全面实物盘点）；无需关闭仓库，
  即可确保现有库存数据准确。
- **Reorder point + safety stock + lead time** — 当现有库存 ≤（需求量 ×
  交货周期）+ 安全库存时进行补货。这决定了 PO 的创建时机。
- **3PL** — 第三方物流服务商；代表其他企业运营仓储/运输业务。
- **PO → receiving → put-away** — 入库生命周期：订购货物、对照
  PO 收货、将货物上架到库位。
- **Dropship** — 供应商直接向最终客户发货；库存从不经过你的
  仓库。
- **Last-mile** — 送达客户门口的最后一段运输；大多数配送成本和失败都发生在这里。
- **Proof of delivery (POD)** — 用于确认送达的签名/照片/时间戳。
- **SLA / transit time** — 承诺的交付时间窗口；即费率比较所依据的优化约束。

## 2. 不明显的领域规则（行业老手会正确处理的规则）

- **物流追踪涉及多个承运商，并采用标准化状态。** 每个承运商的 webhook 载荷
  和状态词汇都不相同（“运输中”与“MV”与“已离开发货设施”）。你必须
  将每个承运商的原始事件映射到同一个标准化状态枚举
  （例如 `pending → info_received → in_transit → out_for_delivery → delivered / exception`）。
  标准化时间线才是产品；原始事件则是溯源信息。
- **品牌化物流追踪是面向客户、切换成本低的切入点。** 发货方的客户
  看到的是品牌化追踪页面，而不是承运商的页面。切换成本低，一旦
  采用便会产生黏性——这是 AfterShip-lite 式的切入点。（参见下文的物流追踪。）
- **路线优化是真正的 VRP**（车辆路径问题），而不是“按
  距离对停靠点排序”。容量、时间窗、车辆数量和服务时间使其成为 NP-hard 问题。
  **将算法交由 [[geo-routing-engineer]] 处理**——此技能只界定领域
  和实体结构；不要让规格说明自行编写求解器。
- **体积重量决定成本。** 任何忽略 DIM 的费率比选或报价功能
  都会产生错误价格。为每个包裹记录 L×W×H。
- **仓库需要批次/批号和循环盘点**，而不只是一个数量整数。召回、
  有效期管理（FIFO/FEFO）和如实审计都需要批次粒度及定期盘点。
- **PO 生命周期 = 创建 → 审批 → 收货 → 对账。** PO 并不是一条将状态切换为
  “完成”的记录；它会累积已收货数量（通常是部分收货，并分多次完成），并且需要
  与发票进行核对。跳过收货/对账会让 PO 沦为一张便利贴。

## 3. 简陋实现容易犯的错误

- **单承运商追踪**——硬编码一个承运商；实际发货方会使用多个承运商。
- **未标准化承运商状态**——存储承运商的原始字符串，导致 UI 和任何
  自动化逻辑都无法跨承运商进行判断。在摄取数据时进行标准化。
- **将路线优化当作最近邻问题**——贪心选择最近停靠点会生成糟糕的路线，并忽略
  容量/时间窗。这是 VRP → [[geo-routing-engineer]]。
- **库存缺少批次/批号或循环盘点**——仅有一个 `quantity` 列无法处理
  召回、有效期或审计；现有库存量会逐渐失准，最终无人信任。
- **PO 缺少收货/对账**——不支持部分收货，也不进行发票匹配；PO
  只是装饰品。
- **费率比选时忽略体积重量**——报价会系统性偏低；
  轻抛货会吞噬利润。

## 4. 必须建模的实体（可避免返工的结构）

将这些实体与 [[migration-ready-schema]] 配合使用（在可导入实体上添加 source_ref + import_batch_id；
将承运商/供应商/客户建模为各自独立的表，而不是内联字段）。

- **Shipment**——承运商（FK）+ 一个**标准化状态** + 一条**追踪事件时间线**
  （有序事件，每个事件都包含承运商原始载荷 + 标准化状态 + 时间戳 + 位置）。
  用于 DIM 的包裹尺寸（L×W×H + 重量）。POD 引用。
- **InventoryItem**——SKU（FK）+ **批次/批号** + **位置**（库位/货架，作为独立实体）+
  现有数量 + **循环盘点**记录（盘点数量、差异、时间戳、盘点人员）。
- **PurchaseOrder**——完整生命周期：`create → approve → receive → reconcile`。行项目
  包含订购数量与已收货数量（部分收货 → 一个 Receipt 实体）、供应商（FK），
  以及与发票的对账。
- **Route**——有序的**停靠点** + **约束条件**（车辆容量、时间窗、每个停靠点的服务
  时间）。**将优化算法交给 [[geo-routing-engineer]]**——规格说明负责定义
  实体和约束条件，而不是求解器。

## 5. 各产品说明（切入点 + 一个核心领域要点）

- **shipment-tracking**（仪表盘）— *切入点：* 面向客户的品牌化物流追踪页面
  （轻量版 AfterShip，切换成本低）。*一个核心要点：* 多承运商数据接入与
  **标准化状态映射** — 将每个承运商的 webhook 标准化为同一个枚举。
  承运商/物流追踪数据接入 → [[connector-builder]]。
- **warehouse-lite**（增删改查）— *切入点：* 面向已无法继续使用
  电子表格的小型仓库 WMS。*一个核心要点：* **批次/批号 + 库位 + 循环盘点** — 库存不只是
  一个数量字段。
- **route-optimization**（预订）— *切入点：* 多站点路线优化；**价值最高，
  难度最大。** *一个核心要点：* 它是一个**真正的 VRP** — 在此处对站点和约束进行建模，
  但求解器属于 [[geo-routing-engineer]]。不要交付最近邻算法。
- **po-mgmt**（增删改查）— *切入点：* 采购订单管理。*一个核心要点：* 完整的
  **创建 → 审批 → 收货 → 对账** 生命周期，并支持部分收货，而不是只设置一个状态
  标志。

## 6. 合规（轻量处理 — 标记即可，不要过度构建）

- **承运商 ToS** — 每个承运商 API 都对物流追踪数据的缓存/展示以及
  品牌标识有相应条款。请遵守这些条款；存在 API 时不要抓取网页。
- **危险品** — 运输危险品时，需遵守特殊的标签/申报要求。如果
  在范围内，请进行标记；复杂规则集暂缓处理。
- **海关（跨境）** — 国际包裹涉及商业发票、HS 编码和关税。如果跨境业务在范围内，
  请采集基本信息（申报价值、HS 编码）；
  **复杂海关**报关逻辑暂缓处理。
- **交付证明保留** — POD（签名/照片）是争议处理的证据；应根据
  发货方的政策予以保留，不要提前使其过期。

---

交叉引用：[[geo-routing-engineer]]（路线 VRP 求解器）、[[connector-builder]]（承运商和
物流追踪数据接入）、[[migration-ready-schema]]（可导入实体）。