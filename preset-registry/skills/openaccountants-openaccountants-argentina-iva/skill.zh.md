---
name: argentina-iva
description: "Use this skill whenever asked to prepare, review, or classify transactions for an Argentina IVA (Impuesto al Valor Agregado) return or advise on Argentine VAT registration, filing, and AFIP compliance. Trigger on phrases like \"prepare IVA return\", \"Argentine VAT\", \"IVA Argentina\", \"AFIP\", \"CUIT\", or any Argentina IVA request. ALWAYS read this skill before touching any Argentina IVA work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AR
  category: international
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/argentina-iva"
  tax_year: 2025
  obligation: CT
---
# 阿根廷 IVA（Impuesto al Valor Agregado）Skill v2.0

> **仅供一般参考。** 本 Skill 是用于 AI 辅助工作流的一般税务/会计参考资料。其内容尚未针对任何特定个人的事实情况、文件、税务选择、截止日期、居民身份、申报身份或当地程序进行审核。在相关司法管辖区的合格专业人士审核之前，请勿依赖本 Skill 进行申报、缴税、修正申报或采取任何税务立场。

---

## 第 1 节 — 快速参考

| 字段 | 值 |
|---|---|
| 国家 | 阿根廷（República Argentina） |
| 税种 | IVA（Impuesto al Valor Agregado） |
| 货币 | ARS（阿根廷比索 — $） |
| 标准税率 | 21% |
| 优惠税率 | 10.5%（药品、某些食品、超过 100 公里的客运服务、医疗服务、书籍、农产品）；2.5%（某些供直接消费的农产品） |
| 零税率 | 0%（货物和服务出口） |
| 加征税率 | 27%（公共事业服务：电力、燃气、供水、电话 — 适用于非住宅用户） |
| 免税 | 金融服务、保险、教育、医疗服务（部分）、住宅租赁、某些书籍、公共客运服务（少于 100 公里） |
| 登记门槛 | Responsable Inscripto 无营业额门槛；小型企业适用 Monotributo 制度（ARS 门槛因类别而异） |
| 税务机关 | AFIP（Administración Federal de Ingresos Públicos） |
| 申报门户 | AFIP 门户 — https://www.afip.gob.ar |
| 申报表 | Declaración Jurada IVA（DJ IVA） |
| 申报频率 | 每月 |
| 截止日期 | 根据 CUIT 末位数字而异（次月 18 日至 23 日之间） |
| 电子发票 | 必须通过 AFIP RCEL / ARCA 门户开具 Factura Electrónica |
| CUIT | Clave Única de Identificación Tributaria — 11 位纳税人识别号 |
| 贡献者 | 开放会计师社区 |
| 验证者 | 待定 — 需要由持有阿根廷执业资格的 CPN（Contador Público Nacional）签字确认 |
| Skill 版本 | 2.0 |

### DJ IVA 关键字段

| 字段 | 含义 |
|---|---|
| Ventas gravadas 21% | 按 21% 税率征税的销售额（净额） |
| Ventas gravadas 10.5% | 按 10.5% 税率征税的销售额（净额） |
| Ventas gravadas 27% | 按 27% 税率征税的公共事业服务销售额（净额） |
| Exportaciones | 出口销售额（0%） |
| Ventas exentas | 免税销售额 |
| IVA débito fiscal | 销项 IVA 总额 |
| Compras gravadas | 应税采购额 |
| IVA crédito fiscal | 进项 IVA 总额 |
| Saldo técnico | IVA 净额状况（débito − crédito） |
| Saldo a pagar | 应缴 IVA（若 débito > crédito） |
| Saldo a favor | 结转至以后期间的超额抵扣额 |

### 保守默认处理

| 模糊情形 | 默认处理 |
|---|---|
| 销售适用税率未知 | 采用 21% 标准税率 |
| 不确定是否适用 10.5% 税率 | 在确认前采用 21% |
| 不确定公共事业服务（电力/燃气）是否适用 27% | 进行确认 — 非住宅用户 = 27%；住宅用户 = 21% |
| 不确定出口文件是否完整 | 按境内销售适用 21% 处理 |
| 业务用途比例未知（车辆、电话、住宅） | 进项税额抵扣比例为 0% |
| 不确定是否已开具 Factura Electrónica | 在确认前不得抵扣进项税额 |
| 境外数字服务（B2B） | 按 21% 反向征税 — 由买方自行计税 |
| Monotributo 供应商 | 不得抵扣 IVA（Monotributistas 不收取 IVA） |

### 红旗阈值

| 阈值 | 数值 |
|---|---|
| HIGH 单笔交易 | ARS 10,000,000 |
| HIGH 单项保守默认处理产生的税额差异 | ARS 2,100,000 |
| MEDIUM 交易对手集中度 | >40% 的销项或进项 |
| MEDIUM 保守默认处理次数 | 每份申报表 >4 次 |
| LOW IVA 绝对净额头寸 | ARS 20,000,000 |

*注意：ARS 金额会迅速贬值——鉴于通货膨胀，请核实这些阈值是否仍然具有实际意义。*

---

## 第 2 节 — 必需输入和拒绝处理目录

### 必需输入

在开始任何阿根廷 IVA 工作之前，请获取：

1. CUIT（11 位纳税人识别号）以及登记为 Responsable Inscripto 的 AFIP 注册信息
2. 以 ARS 计价的月度银行对账单（所有企业账户——Banco Nación、Galicia、Santander 等）
3. 收到的 Facturas Electrónicas（来自 AFIP 门户或会计系统的 XML）
4. 开具的 Facturas Electrónicas（带有 CAE——Código de Autorización Electrónico 的 XML 或 PDF）
5. 上月 DJ IVA（用于结转 saldo a favor）
6. 以 USD 计价的银行账户汇总信息（如果持有美元计价账户——注意外汇处理的复杂性）
7. 出口业务详情及 AFIP 出口申报（e-Declaración de exportación）

### 拒绝处理目录

对于以下事项，应拒绝处理并升级至 CPN：
- 从 Monotributo 转为 Responsable Inscripto——涉及复杂的历史 IVA 补算
- 房地产/建筑业 IVA（alícuota reducida especial）
- IVA retenciones y percepciones（扣缴义务人——AGIP、ARBA 等）
- 出口退税（reintegros de IVA exportación）——复杂的 AFIP 流程
- 金融工具的 IVA（复杂的免税规则）
- IVA agropecuario（农业特殊制度）
- 阿根廷转让定价/公司间 IVA
- 恶性通货膨胀环境下的 IVA——调整指数化（revalúo）

---

## 第 3 节 — 供应商模式库

### 3.1 银行和金融服务

| 供应商 | 典型描述 | IVA 税率 | 进项税额抵扣 |
|---|---|---|---|
| Banco de la Nación Argentina (BNA) | 银行手续费、电汇 | 免税 | 否 |
| Banco Galicia | 账户费用、信贷额度 | 免税 | 否 |
| Santander Argentina | 商业银行服务 | 免税 | 否 |
| BBVA Argentina | 企业银行服务费 | 免税 | 否 |
| Banco Macro | 区域性银行服务 | 免税 | 否 |
| MercadoPago (MercadoLibre) | 支付网关——手续费 | 21% | 是 |
| Prisma (VISA Argentina) | 银行卡支付处理 | 21% | 是 |
| First Data (Fiserv Argentina) | POS 终端费用 | 21% | 是 |
| Naranja X | 数字支付 | 21% | 是 |
| Ualá | 数字钱包费用 | 21% | 是 |

### 3.2 电力、燃气和公用事业

| 供应商 | 典型描述 | IVA 税率 | 进项税额抵扣 |
|---|---|---|---|
| Edenor (Empresa Distribuidora Norte) | 电力——布宜诺斯艾利斯北部 | 27%（非住宅）/ 21%（住宅） | 是（企业用途） |
| Edesur (Empresa Distribuidora Sur) | 电力——布宜诺斯艾利斯南部 | 27%（非住宅） | 是（企业用途） |
| Metrogas | 天然气——布宜诺斯艾利斯 | 27%（非住宅） | 是（企业用途） |
| ECOGAS | 燃气——Cuyo/NEA 地区 | 27%（非住宅） | 是 |
| AySA (Agua y Saneamientos Argentinos) | 供水——布宜诺斯艾利斯 | 27%（非住宅） | 是 |
| AYSA residential | 供水——住宅 | 21% | 是 |

### 3.3 电信

| 供应商 | 典型描述 | IVA 税率 | 进项税抵扣 |
|---|---|---|---|
| Telecom Argentina (Personal/Fibertel) | 移动通信、光纤、固定电话 | 21%（服务）/ 作为公用事业服务计费时为 27% | 是（企业用途） |
| Claro Argentina | 移动通信、宽带 | 21% | 是（企业用途） |
| Movistar Argentina (Telefónica) | 移动通信、ADSL | 21% | 是（企业用途） |
| DirecTV Argentina | 卫星电视 | 21% | 是（如果是企业订阅） |
| Arnet | 互联网服务 | 21% | 是 |

### 3.4 交通与差旅

| 供应商 | 典型描述 | IVA 税率 | 进项税抵扣 |
|---|---|---|---|
| Aerolíneas Argentinas | 国内航班 | 21% | 是 |
| Aerolíneas Argentinas | 国际航班 | 0%（出口） | 无适用进项税 |
| LATAM Argentina | 国内/国际航班 | 21% / 0% | 是（国内航班） |
| Flybondi | 国内廉价航班 | 21% | 是 |
| JetSMART Argentina | 国内航班 | 21% | 是 |
| Trenes Argentinos | 火车票 | 免税（<100km）/ 10.5%（>100km） | 是（>100km） |
| Colectivo / subte Buenos Aires | 公共汽车/地铁（<100km） | 免税 | 否 |
| Uber Argentina | 网约车 | 21% | 是（企业用途） |
| Cabify Argentina | 网约车 | 21% | 是（企业用途） |

### 3.5 物流与快递

| 供应商 | 典型描述 | IVA 税率 | 进项税抵扣 |
|---|---|---|---|
| OCA (Organización Coordinadora Argentina) | 国内快递 | 21% | 是 |
| Andreani | 国内及国际快递 | 21% | 是 |
| Correo Argentino | 国营邮政服务 | 21% | 是 |
| DHL Argentina | 国际快递 | 0%（出口）/ 21%（国内） | 是 |
| FedEx Argentina | 国际快递 | 0% / 21% | 是 |

### 3.6 零售与办公用品

| 供应商 | 典型描述 | IVA 税率 | 进项税抵扣 |
|---|---|---|---|
| Carrefour Argentina | 超市——食品/非食品 | 21%/10.5% 混合税率 | 部分 |
| Disco / Vea (Cencosud) | 超市 | 21%/10.5% 混合税率 | 部分 |
| Rappi Argentina | 配送平台——佣金 | 21% | 是 |
| MercadoLibre (marketplace) | 电子商务 | 21% | 是 |
| 办公用品商店 | 文具 | 21% | 是 |
| Farmacity | 药店——药品 | 10.5%（药品）/ 21%（其他） | 是 |

### 3.7 软件与数字服务

| 供应商 | 典型描述 | IVA 税率 | 进项税抵扣 |
|---|---|---|---|
| Tango Gestión (software) | 阿根廷会计/ERP | 21% | 是 |
| Bejerman | 面向中小企业的 ERP | 21% | 是 |
| Colppy | 云会计 | 21% | 是 |
| Nubox Argentina | 会计软件 | 21% | 是 |
| Microsoft Argentina (Azure, M365) | 云服务——B2B | 21%（反向征税） | 是 |
| Google Argentina (Workspace, Ads) | 数字服务——B2B | 21%（反向征税） | 是 |
| Zoom Argentina | 视频服务——B2B | 21%（反向征税） | 是 |
| AWS Argentina | 云服务——B2B | 21%（反向征税） | 是 |

### 3.8 专业服务

| 供应商 | 典型描述 | IVA 税率 | 进项税抵扣 |
|---|---|---|---|
| CPN (Contador Público Nacional) | 会计、审计、税务 | 21% | 是 |
| Estudio jurídico (law firm) | 法律服务 | 21% | 是 |
| Agencia de publicidad | 广告 | 21% | 是 |
| Consultoría | 管理咨询 | 21% | 是 |
| Escribanía | 公证服务 | 21% | 是 |

### 3.9 保险

| 供应商 | 典型说明 | IVA 税率 | 进项税抵扣 |
|---|---|---|---|
| San Cristóbal Seguros | 财产险、车辆险 | 免税 | 否 |
| Galicia Seguros | 商业保险 | 免税 | 否 |
| Experta ART（劳动风险） | 工伤赔偿保险 | 免税 | 否 |
| Sancor Seguros | 全险种 | 免税 | 否 |
| MAPFRE Argentina | 车辆险、财产险 | 免税 | 否 |

### 3.10 医疗与保健

| 供应商 | 典型说明 | IVA 税率 | 进项税抵扣 |
|---|---|---|---|
| Obra social（医疗基金） | 医疗保健缴费 | 免税 | 否 |
| 私立诊所 / sanatorio | 医疗服务 | 免税（不超过限额） | 否 |
| 药房 — 药品 | 处方药 | 10.5%（非处方药）/ 免税（处方药） | 部分 |
| 医疗设备 | 器械 | 10.5% | 是 |

---

## 第 4 节 — 计算示例

### 示例 1 — 咨询服务的标准 IVA

**场景：** 布宜诺斯艾利斯的一家咨询公司向阿根廷企业开具 Factura A。

**银行对账单条目（Banco Galicia 格式）：**
```
Fecha       : 15/04/2025
Operación   : Acreditación / Transferencia
Descripto   : ACME SA — HONORARIOS CONSULTORÍA — FC A 0001-00004123
Importe     : +$14.520.000,00
```

**计算：**
- Factura A：净额 $12,000,000 + 21% IVA $2,520,000 = $14,520,000
- 申报表条目：Ventas gravadas 21% — $12,000,000 | Débito fiscal: $2,520,000

*注意：ARS 使用句点作为千位分隔符；逗号表示小数点：$14.520.000,00 = ARS 14,520,000.00*

---

### 示例 2 — 税率为 27% 的公用事业账单

**场景：** 办公室使用 Edenor 提供的电力服务 — 非住宅商业账户。

**银行对账单条目（Santander Argentina 格式）：**
```
Fecha       : 25/04/2025
Concepto    : Débito — Edenor SA — Factura 0041-2025-04
Importe     : -$6.350.000,00
```

**计算：**
- Edenor Factura：净额 $5,000,000 + 27% IVA $1,350,000 = $6,350,000
- 进项税抵扣：$1,350,000（营业场所 — 100% 可抵扣）
- 申报表条目：Compras gravadas 27% — $5,000,000; Crédito fiscal: $1,350,000

---

### 示例 3 — 服务出口（0%）

**场景：** 阿根廷科技公司向美国客户出口 SaaS — 以 USD 付款。

**银行对账单条目（BBVA Argentina 格式）：**
```
Fecha       : 20/04/2025
Operación   : Crédito ME / Liquidación FX
Descripción : TECH INC USA — SAAS SUBSCRIPTION Q1 2025
Importe     : +$62.400.000,00 (USD 60.000)
```

**计算：**
- 向外国实体出口服务 — IVA 税率为 0%
- 所需材料：合同、SWIFT 付款证明、AFIP 出口申报
- 申报表条目：Exportaciones — $62,400,000 | IVA: $0

---

### 示例 4 — 境外数字服务的反向征税

**场景：** 公司支付 Microsoft Azure 费用（由 Microsoft Ireland 开具账单）。

**银行对账单条目（Banco Nación 格式）：**
```
Fecha       : 05/04/2025
Movimiento  : Pago Exterior — SWIFT
Descripción : MICROSOFT IRELAND — AZURE CLOUD APR 2025
Importe     : -$5.040.000,00
```

**计算：**
- 向阿根廷 Responsable Inscripto 提供的境外数字服务 — 自行核算 IVA
- 自行核算：$5,040,000 × 21/121 = $875,537 IVA（或净额 $4,164,463 + IVA $875,537）
- 申报为销项税并同时申请进项税抵扣 — 对完全应税企业而言净额为零
- 注意：AFIP RG 4240 规范阿根廷用户进口数字服务的相关事项

---

### 示例 5 — Monotributo 供应商（无 IVA）

**场景：** Monotributo 制度下的自由职业者为设计工作开具收据。

**银行对账单条目（Galicia 格式）：**
```
Fecha       : 12/04/2025
Operación   : Transferencia Emitida
Descripción : MARIA GARCIA — DISEÑO GRAFICO — RECIBO C 0001-00000234
Importe     : -$1.200.000,00
```

**处理过程：**
- Monotributista 开具 Recibo C（而非 Factura A）——不收取 IVA
- 进项税抵扣：$0 —— Monotributistas 未登记为 IVA 纳税人
- 按净费用 $1,200,000 入账，不抵扣 IVA
- 标记：检查供应商是否应转为 Responsable Inscripto（如果超过 Monotributo 年度限额）

---

### 示例 6 — 月度申报汇总

**场景：** 服务公司——2025 年 4 月。

| 项目 | 净额（ARS） | IVA（ARS） |
|---|---|---|
| 适用 21% 税率的国内销售 | 100,000,000 | 21,000,000 |
| 适用 10.5% 优惠税率的销售 | 20,000,000 | 2,100,000 |
| 出口销售（0%） | 30,000,000 | 0 |
| 销项合计 | 150,000,000 | 23,100,000 |
| 适用 21% 税率的本地采购 | 50,000,000 | 10,500,000 |
| 适用 27% 税率的公用事业账单 | 10,000,000 | 2,700,000 |
| 进项合计 | 60,000,000 | 13,200,000 |
| **应缴 IVA 净额** | | **9,900,000** |

---

## 第 5 节 — 第 1 层级规则（精简版）

**税率分配：**
- 21% 标准税率：大多数商品和服务
- 10.5%：药品、部分食品、书籍、医疗服务（私人服务，限额以内）、农产品（初级产品）、超过 100 公里的客运服务
- 27%：向非住宅客户提供的公用事业服务（电力、燃气、供水、电话）；根据 AFIP 决议，也适用于某些其他服务
- 0%：具有 AFIP 出口申报单的货物出口，以及向非居民提供的出口服务
- 免税：金融服务、保险、教育（公立和部分私立）、医疗服务（公共医疗和 obra social）、住宅租赁、100 公里以内的公共交通、某些书籍

**进项税抵扣：**
- 对用于应税活动的采购所支付的所有 IVA，均允许抵扣
- 不得抵扣来自 Monotributistas 的进项税（他们开具 Recibo C，而非 Factura A）
- Factura A：B2B——必须包含买方的 CUIT；允许抵扣进项税
- Factura B：B2C——不单独列示 IVA；买方不能申请抵扣进项税
- Factura C：Monotributo——无 IVA；不得抵扣进项税
- 车辆：适用部分抵扣规则——查看 AFIP RG 以确定可抵扣比例
- 境外数字服务：AFIP RG 4240——买方根据反向征税机制自行核定税额

**申报机制：**
- 每月通过 AFIP 门户提交 DJ IVA；截止日期因 CUIT 末位数字而异（18 日至 23 日）
- 所有销售发票必须具有 AFIP 签发的 CAE（Código de Autorización Electrónico）
- Saldo a favor 可无限期结转；可以申请出口退税，但处理较慢

---

## 第 6 节 — 第 2 层级目录（确实无法从数据中确定的项目）

| 项目 | 无法确定的原因 | 需要询问的内容 |
|---|---|---|
| 公用事业税率（21% 或 27%） | 取决于账户属于住宅账户还是非住宅账户 | “该公用事业账户登记为住宅用途（domicilio）还是商业/工业用途？” |
| 食品税率 | 适用 21% 还是 10.5% 取决于产品类型和加工程度 | “具体是什么产品？它是初级农产品还是加工产品？” |
| 运输税率 | 客运服务根据距离适用免税（少于 100 公里）或 10.5%（超过 100 公里） | “路线距离是多少？这是客运还是货运？” |
| 车辆购置 | AFIP RG 对乘用车的进项税抵扣设有限制 | “车辆类型是什么？商用车还是乘用车？购买价格是多少？” |
| 居家办公 | 经营用途占比未知 | “您的住宅中有多少百分比的面积专用于经营活动？” |
| 供应商税务制度 | Responsable Inscripto（允许抵扣 IVA）与 Monotributista（不得抵扣）不同 | “请确认供应商的 AFIP 税务制度——RI 还是 Monotributo？” |
| 出口资格 | 服务是否确实在阿根廷境外消费 | “客户位于何处？是否有境外消费的证明？” |

---

## 第 7 节 — Excel 工作底稿

**列：** 日期 | 供应商/客户 | CUIT | 发票编号（CAE） | Factura 类型（A/B/C） | 净额（ARS） | IVA 税率 % | IVA（ARS） | 进项/销项 | 是否出口？ | 是否免税？ | 二级标记 | 备注

**工作表结构：**
1. `Output_Sales` — 销售（Facturas A/B）
2. `Input_Purchases` — 采购（仅 Facturas A 可用于抵扣）
3. `ReverseCharge_Digital` — 境外数字服务
4. `IVA_Summary` — 每月 DJ IVA 汇总
5. `Tier2_Items` — 等待客户回复

---

## 第 8 节 — 银行对账单阅读指南

### Banco Galicia 格式
```
Fecha       : 15/04/2025
Operación   : Acreditación / Transferencia
Descripción : COMPANY NAME — FC A 0001-00004123
Importe     : +$14.520.000,00
Saldo       : $64.520.000,00
```

### Banco Nación 格式
```
15/04/2025  |  Crédito  |  COMPANY NAME — HONORARIOS  |  +14.520.000,00  |  Saldo: 64.520.000,00
```

### 关键模式：
- **ARS 数字格式：** 句点表示千位分隔符；逗号表示小数点（$14.520.000,00 = ARS 14,520,000.00）
- **FC A / Factura A：** B2B 发票 — 买方可以申报 IVA 进项税额抵扣
- **Recibo C：** Monotributo 供应商 — 不可抵扣 IVA
- **Débito — AFIP：** AFIP 直接扣款 — 可能包括 IVA 缴款或其他税款
- **Pago Exterior / SWIFT：** 境外付款 — 检查反向征税或出口事项

---

## 第 9 节 — 客户入驻备用方案

当客户无法为所有交易提供 Facturas Electrónicas 时：

1. 将银行对账单金额视为含 IVA 总额并进行反算：
   - 净额 = 总额 ÷ 1.21 | IVA = 总额 − 净额（适用于 21% 税率）
   - 净额 = 总额 ÷ 1.10.5 = 总额 ÷ 1.105（适用于 10.5%）
   - 净额 = 总额 ÷ 1.27（适用于税率为 27% 的公用事业）
2. 保守默认值：销项税率为 21%；没有经 CAE 验证的 Factura A 时，进项税额抵扣为 0%
3. 在 `Tier2_Items` 工作表中标记所有非 A 类发票
4. 针对缺失的 CAE 编号发出数据请求
5. 警告客户：如果没有由 Responsable Inscripto 供应商开具的有效 Factura A，AFIP 可能不允许抵扣进项税额

---

## 第 10 节 — 参考资料

| 资源 | 参考 |
|---|---|
| AFIP 门户（申报、Factura Electrónica） | https://www.afip.gob.ar |
| AFIP RCEL（Régimen de Emisión de Comprobantes） | afip.gob.ar — Factura Electrónica 部分 |
| IVA 法（Ley 23.349 及其修正案） | AFIP 法规库 |
| AFIP RG 4240 — 数字服务 | afip.gob.ar — 一般决议 |
| AFIP RG 4290 — 电子发票适用范围扩展 | 官方公报 |
| IVA 税率（Decreto 280/97 及其更新） | AFIP — 税率表 |

---

## 免责声明

本技能及其输出仅用于提供信息和计算，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或结果承担责任。在申报或据此采取行动之前，所有输出都必须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区内具有同等资格的执业人士）审核并签字批准。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、请求持牌会计师进行专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/argentina-iva) — 面向 AI 的开放式税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据和具名会计师的支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_