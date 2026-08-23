---
name: ar-income-tax
description: "> Use this skill whenever asked about Argentine income tax (Impuesto a las Ganancias) for self-employed individuals (autónomos / profesionales independientes). Trigger on phrases like \"Ganancias\", \"impuesto a las ganancias\", \"autónomo Argentina\", \"monotributo vs responsable inscripto\", \"cuarta categoría\", \"deducciones personales\", \"ganancia no imponible\", \"bienes personales\", \"DDJJ Ganancias\", \"ARCA\", \"AFIP\", \"CUIT\", \"income tax Argentina\", \"anticipos ganancias\", or any question about filing or computing income tax for a self-employed client in Argentina. This skill covers progressive rates (5-35%), personal deductions (ganancia no imponible, cargas de familia, deducción especial), Bienes Personales interaction, advance payments (anticipos), percepciones as credits, and ARCA filing. ALWAYS read this skill before touching any Argentine income tax work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/ar-income-tax"
  obligation: IT
---
# 阿根廷所得税 — Autónomo / Profesional Independiente (Ganancias) v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。其内容尚未针对任何特定个人的事实、文件、税务选择、截止期限、居民身份、申报身份或当地程序进行审核。未经相关司法管辖区合格专业人士审核，请勿依赖本技能进行申报、缴税、更正申报或采取税务立场。

## 第 1 节 — 快速参考

### 累进税率表 — 2025 年上半年（示例）

警告：阿根廷每半年（1 月和 7 月）根据 IPC（消费者价格指数）调整这些门槛。应用前，你必须向 ARCA 核实当前半年度的门槛。以下金额仅适用于 2025 年上半年。

| 累计应税净所得（ARS） | 税率 | 累计固定金额 |
|---|---|---|
| 0 -- 1,750,026 | 5% | -- |
| 1,750,027 -- 3,500,053 | 9% | 87,501 |
| 3,500,054 -- 5,250,079 | 12% | 245,004 |
| 5,250,080 -- 7,000,106 | 15% | 455,007 |
| 7,000,107 -- 10,500,159 | 19% | 717,511 |
| 10,500,160 -- 14,000,211 | 23% | 1,382,521 |
| 14,000,212 -- 21,000,317 | 27% | 2,187,033 |
| 21,000,318 -- 28,000,423 | 31% | 4,077,062 |
| 28,000,424+ | 35% | 6,247,095 |

公式：税额 = 累计固定金额 +（应税净所得 - 下限）x 税率

### 个人扣除（Deducciones Personales）— 2025 年上半年（示例）

| 扣除项目 | 年度金额（ARS，约） | 说明 |
|---|---|---|
| Ganancia no imponible (GNI) | ~3,916,268 | 最低免税所得额 |
| Deducción especial — autónomos | GNI x 2.5 = ~9,790,671 | 适用于第 53 条规定的 autónomos |
| Deducción especial — empleados | GNI x 3.8 = ~14,881,819 | 不适用于 autónomos |
| Cónyuge | ~3,688,339 | 所得低于 GNI 的配偶 |
| Hijo/a menor de 18 | 每名子女 ~1,860,043 | 每名未满 18 岁的子女 |
| Hijo/a con discapacidad | 每名子女 ~3,720,086 | 无年龄限制 |

### 一般扣除（Deducciones Generales，第 85 条）

| 扣除项目 | 限额 |
|---|---|
| Aportes jubilatorios（退休缴款） | 实际支付金额 |
| Obra social / prepaga（医疗） | ganancia neta 的 5% |
| Seguros de vida / retiro | 年度上限（每半年调整） |
| Servicio doméstico | 最高为 GNI 金额 |
| Alquiler vivienda habitual | 租金的 40%，上限为 GNI |
| Donaciones（向免税实体捐赠） | ganancia neta 的 5% |

### 计算结构

| 步骤 | 说明 |
|---|---|
| A | Ganancia bruta（所有类别的总所得） |
| B | 减：Gastos deducibles（允许扣除的经营费用，第 83-87 条） |
| C | Ganancia neta（A 减 B） |
| D | 减：Deducciones generales（第 85 条） |
| E | 减：Deducciones personales（第 30 条 — GNI + deducción especial + cargas de familia） |
| F | Ganancia neta imponible（C 减 D 再减 E） |
| G | 对 F 适用累进税率表 |
| H | 减：已支付的 Anticipos |
| I | 减：已被扣缴的 Retenciones |
| J | 减：Percepciones（例如，购买外币时产生的款项） |
| K | 应缴税款 /（退税） |

### 保守默认值

| 情形 | 默认假设 |
|---|---|
| 无法确定是 Autónomo 还是 empleado | 停止——倍数不同（2.5 倍与 3.8 倍） |
| 无法确定半年度门槛 | 向 ARCA 核实——绝不使用过期门槛 |
| 无凭证费用 | 不可扣除 + 35% 惩罚性税款（第 38 条） |
| 申报配偶扣除，但其收入情况不确定 | 除非确认低于 GNI，否则不得申报 |
| 美元购买产生的 Percepciones | 作为抵免计入最终 DDJJ |
| Monotributo 与 Responsable Inscripto 不明确 | 停止——两者属于完全不同的税制 |
| Bienes Personales 门槛 | 标记——始终与 Ganancias 一并检查 |

### 红旗门槛

| 标记 | 门槛 |
|---|---|
| 未申报任何 aportes jubilatorios | 核实——autónomos 必须缴纳 |
| 检测到 Gastos sin factura | 不可扣除 + 35% 惩罚性税款 |
| 单一客户占收入的 80% 以上 | 存在被认定为雇佣关系的风险 |
| 申报大额 percepciones 作为抵免 | 核实 ARCA 账户中的证明文件 |
| 可能超过 Bienes Personales 门槛 | 标记为需要同时申报 |

---

## 第 2 节——必需输入 + 拒绝处理目录

### 必需输入

在计算阿根廷 Ganancias 之前，收集：

1. **税务类别**——4ta categoría autónomo（第 53 条）或 relación de dependencia
2. **婚姻/家庭状况**——用于 cargas de familia 扣除
3. **自雇年度总收入**——honorarios / ingresos brutos 总额
4. **经营费用**——有 facturas electrónicas 作为凭证
5. **退休金缴款（jubilación autónomos）**——已缴纳的强制性缴款
6. **Obra social 和 prepaga 缴款**——已支付的医疗保险费用
7. **其他收入来源**——雇佣收入、租金收入（1ra cat.）、金融收入（2da cat.）
8. **Bienes Personales 状态**——资产是否超过门槛
9. **CUIT**——税务识别号码
10. **银行对账单**——12 个月（自然年度）
11. **已被征收的 Percepciones**——来自外币购买、进口
12. **已支付的 Anticipos**——上一份 DDJJ 的预缴款

### 拒绝处理目录

| 代码 | 情形 | 操作 |
|---|---|---|
| R-AR-1 | 客户属于 Monotributo | 停止——Monotributo 是独立的简化税制；使用 ar-monotributo skill |
| R-AR-2 | 税务类别未知（autónomo 或 empleado） | 停止——deducción especial 的倍数不同；必须明确类别 |
| R-AR-3 | 申报 Gastos sin factura（无凭证费用） | 拒绝 + 标记第 38 条规定的 35% 惩罚性税款 |
| R-AR-4 | 涉及税收协定的境外来源收入 | 升级处理——适用全球收入原则，但外国税收抵免需要进行税收协定分析 |
| R-AR-5 | 信托税务或公司重组 | 升级处理——超出范围 |
| R-AR-6 | 未提供 CUIT | 停止——无法确定申报时间表 |

---

## 第 3 节——交易模式库

### 3.1 收入模式

| # | 摘要模式 | 税务项目 | 备注 |
|---|---|---|---|
| I-01 | `TRANSFERENCIA DE [client]` / `TRF CR [client]` | 总收入——Ganancias 4ta cat. | 客户通过标准银行间转账支付 |
| I-02 | `ACREDITACIÓN CVU [client]` / `CVU CRÉDITO` | 总收入——Ganancias 4ta cat. | 客户通过 CVU（金融科技钱包）入账 |
| I-03 | `MERCADOPAGO COBRO` / `MP COBRO [client]` | 总收入——按总额还原 | Mercado Pago 结算款；手续费有 factura 时可扣除 |
| I-04 | `DEBIN RECIBIDO [client]` | 总收入——Ganancias 4ta cat. | 收到 DEBIN（即时扣款请求）付款 |
| I-05 | `PAYPAL RETIRO` / `PAYPAL TRANSFER` | 总收入——境外来源 | PayPal 提现；按 ARCA 汇率换算 |
| I-06 | `STRIPE PAYOUT` / `STRIPE AR` | 总收入——境外来源 | Stripe 付款；按付款方所在国家分类 |
| I-07 | `RAPIPAGO COBRO` / `PAGO FÁCIL COBRO` | 总收入——Ganancias 4ta cat. | 现金收款网络的收款 |
| I-08 | `DEVOLUCIÓN GANANCIAS ARCA` / `REINTEGRO ARCA` | 不属于收入——退税 | 多缴税款的退还 |
| I-09 | `INTERESES PLAZO FIJO` / `RENDIMIENTO FCI` | 2da categoría——金融收入 | 利息/基金收益；单独处理 |
| I-10 | `DIVIDENDOS [company]` | 免税或应税收入 | 股息；核实当前处理方式 |
| I-11 | `ALQUILER COBRADO` / `RENTA INMUEBLE` | 1ra categoría——租金收入 | 单独类别；汇总计入 Ganancias |

### 3.2 费用模式

| # | 摘要模式 | 税务项目 | 备注 |
|---|---|---|---|
| E-01 | `ALQUILER OFICINA` / `LOCACIÓN COMERCIAL` | 租金 — 可全额扣除 | 需要 factura electrónica |
| E-02 | `EDESUR` / `EDENOR` / `EPEC` / `EPE` | 公用事业费 — 可扣除（按商业用途比例） | 电费；需要 factura |
| E-03 | `METROGAS` / `NATURGY` / `CAMUZZI` | 燃气费 — 可扣除（按商业用途比例） | 需要 factura |
| E-04 | `PERSONAL` / `CLARO` / `MOVISTAR` / `TELECOM` | 电话/互联网费用 — 可扣除（按商业用途比例） | 需要 factura |
| E-05 | `ADOBE` / `MICROSOFT 365` / `GOOGLE WORKSPACE` | 软件 — 可全额扣除 | 专业工具 |
| E-06 | `CONTADOR` / `ESTUDIO CONTABLE` / `HONORARIOS CPN` | 会计费用 — 可全额扣除 | 需要 factura |
| E-07 | `AEROLÍNEAS ARGENTINAS` / `FLYBONDI` / `JETSMART` | 航空旅行 — 可扣除（用于商业目的） | 记录用途 |
| E-08 | `HOTEL` / `BOOKING.COM` / `AIRBNB` | 住宿 — 可扣除（商务旅行） | 必须用于商业目的 |
| E-09 | `MONOTRIBUTO APORTES` / `JUBILACIÓN AUTÓNOMOS` | 退休金缴款 — deducción general | 可全额扣除 |
| E-10 | `OBRA SOCIAL` / `PREPAGA` / `OSDE` / `SWISS MEDICAL` | 健康保险 — deducción general（上限为 5%） | 上限为 ganancia neta 的 5% |
| E-11 | `SEGURO PROFESIONAL` / `RC PROFESIONAL` | 职业保险 — 可全额扣除 | |
| E-12 | `COLEGIO PROFESIONAL` / `CPACF` / `MATRÍCULA` | 专业机构会费 — 可全额扣除 | |
| E-13 | `PAGO GANANCIAS ARCA` / `VEP GANANCIAS` | 税款支付 — 不可扣除 | 用于抵扣应纳税额 |
| E-14 | `ANTICIPO GANANCIAS` / `VEP ANTICIPO` | 预缴税款 — 不可扣除 | 用于抵扣年度 DDJJ |
| E-15 | `PERCEPCIÓN RG 4815` / `PERC. DÓLAR` / `IMP. PAÍS` | Percepción — 不可扣除 | 用于抵扣 Ganancias DDJJ |
| E-16 | `MARKETING` / `PUBLICIDAD` / `GOOGLE ADS` | 营销费用 — 可全额扣除 | 需要 factura 或外国发票 |
| E-17 | `PAPELERÍA` / `INSUMOS OFICINA` | 办公用品 — 可全额扣除 | 需要 factura |
| E-18 | `SERVICIO DOMÉSTICO` | 家政人员费用 — deducción general | 上限为 GNI 金额 |
| E-19 | `ALQUILER VIVIENDA` / `INQUILINO` | 住房租金（个人）— deducción general | 租金的 40%，上限为 GNI |

### 3.3 银行费用及金融项目（排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| BANCO NACIÓN, BNA | 排除银行手续费/费用 | 金融服务 |
| BANCO GALICIA, GALICIA | 排除银行手续费/费用 | 金融服务 |
| SANTANDER ARGENTINA | 排除银行手续费/费用 | 金融服务 |
| BBVA ARGENTINA | 排除银行手续费/费用 | 金融服务 |
| MACRO, BANCO MACRO | 排除银行手续费/费用 | 金融服务 |
| BRUBANK, UALA, NARANJA X | 排除金融科技服务费用 | 检查是否存在单独的应税订阅 |
| COMISIÓN BANCARIA, MANTENIMIENTO CTA | 排除 | 银行账户维护费 |
| INTERESES, INTERÉS PRÉSTAMO | 排除 | 贷款利息 — 超出范围 |

### 3.4 政府及法定项目（排除）

| 模式 | 处理方式 | 备注 |
|---|---|---|
| ARCA, AFIP | 排除 | 税款支付 |
| ANSES | 排除 | 社会保障系统缴费 |
| RENTAS [province] | 排除 | 省级税款（Ingresos Brutos——单独处理） |
| ARBA, AGIP, DGIP | 排除 | 省级税务机关缴款 |
| MUNICIPALIDAD | 排除 | 市政费用/税款 |

### 3.5 内部转账与排除项

| 模式 | 处理方式 | 备注 |
|---|---|---|
| TRANSFERENCIA PROPIA, CUENTA PROPIA | 排除 | 内部资金划转 |
| EXTRACCIÓN ATM, RETIRO EFECTIVO | 第 2 级——询问 | 默认排除；询问用途 |
| PRÉSTAMO PERSONAL | 排除 | 贷款本金，不在范围内 |
| CUOTA PRÉSTAMO | 排除 | 贷款还款，不在范围内 |

---

## 第 4 节——完整示例

### 示例 1——Banco Nación（布宜诺斯艾利斯，IT 顾问）

**银行：** Banco de la Nación Argentina 对账单
**客户：** Martín López，IT 顾问，布宜诺斯艾利斯，Responsable Inscripto

```
Fecha;Concepto;Débito;Crédito;Saldo
05/01/2025;TRANSFERENCIA CR EMPRESA TECH SA;;1.200.000;
15/01/2025;COMISIÓN BANCARIA;1.500;;
10/02/2025;TRANSFERENCIA CR STARTUP DIGITAL SRL;;850.000;
28/02/2025;VEP JUBILACIÓN AUTÓNOMOS;180.000;;
15/03/2025;PAYPAL RETIRO;;420.000;
31/03/2025;ANTICIPO GANANCIAS VEP;250.000;;
20/04/2025;MERCADOPAGO COBRO;;380.000;
05/06/2025;TRANSFERENCIA CR GAMMA CONSULTING SA;;1.500.000;
10/07/2025;ESTUDIO CONTABLE PÉREZ;120.000;;
10/10/2025;AEROLÍNEAS ARGENTINAS;95.000;;
```

**第 1 步——收入分类**

| 交易摘要 | 模式 | 金额（ARS） | 备注 |
|---|---|---|---|
| EMPRESA TECH SA | I-01 | 1,200,000 | 境内 PJ——检查 retención |
| STARTUP DIGITAL SRL | I-01 | 850,000 | 境内 PJ——检查 retención |
| PAYPAL RETIRO | I-05 | 420,000 | 境外来源——按 ARCA 汇率换算 |
| MERCADOPAGO COBRO | I-03 | 380,000 | 加回 MP 手续费以还原总额 |
| GAMMA CONSULTING SA | I-01 | 1,500,000 | 境内 PJ——检查 retención |

年化总收入：ARS 28,000,000（示例）

**第 2 步——可扣除费用**

会计费用：ARS 1,440,000；退休缴费：ARS 2,160,000；差旅费：ARS 1,140,000；软件费：ARS 480,000；银行手续费排除。

**第 3 步——计算**

```
Ganancia bruta:              ARS 28,000,000
Less gastos deducibles:      ARS  5,220,000
Ganancia neta:               ARS 22,780,000
Less deducciones generales:  ARS  2,160,000 (jubilación)
Less deducciones personales:
  GNI:                       ARS  3,916,268
  Deducción especial (2.5x): ARS  9,790,671
  Total personal:            ARS 13,706,939
Ganancia neta imponible:     ARS  6,913,061
Tax (apply scale):           ~ARS 1,012,000
Less anticipos + retenciones + percepciones
```

### 示例 2——Banco Galicia（科尔多瓦，建筑师）

**银行：** Banco Galicia 对账单
**客户：** Lucía Fernández，建筑师，科尔多瓦，已婚并育有 2 名子女

总收入：ARS 35,000,000
费用：ARS 8,000,000（员工、办公室租金、软件、材料）
退休缴费：ARS 2,400,000
医疗保险：ARS 600,000（检查 5% 上限）

个人扣除：GNI + DE（2.5 倍）+ 配偶 + 2 名子女 = ARS 13,706,939 + ARS 3,688,339 + ARS 3,720,086 = ARS 21,115,364

应税净收益：ARS 35,000,000 - 8,000,000 - 3,000,000 - 21,115,364 = ARS 2,884,636

税额：适用 1,750,027–3,500,053 档，税率为 9% = ARS 87,501 + (2,884,636 - 1,750,027) x 9% = ARS 87,501 + ARS 102,115 = ARS 189,616

标记：核实配偶收入是否低于 GNI。核实 Bienes Personales。

### 示例 3 — Santander Argentina（CABA，有 Percepciones 的数字内容创作者）

**银行：** Santander Argentina
**客户：** Diego Ruiz，数字内容创作者，接收境外付款，因美元购买产生了大额 percepciones

总收入：ARS 18,000,000（境内与境外收入混合）
美元购买产生的 Percepciones：ARS 3,500,000（RG 4815 + adelanto Ganancias）

扣除费用和个人免税额后，按税率表计算的税额：ARS 1,200,000
减去 percepciones：ARS 3,500,000
结果：Saldo a favor（贷方余额）ARS 2,300,000

标记：Percepciones 超过计算出的税额。客户有 saldo a favor。核实所有 percepción 证明。

### 示例 4 — Brubank（CABA，低收入自由职业开发者）

**银行：** Brubank（数字银行）
**客户：** Ana García，自由职业开发者，单身，无受扶养人

总收入：ARS 15,000,000
费用：ARS 4,000,000
Jubilación：ARS 1,800,000

扣除 GNI + DE（2.5x）= ARS 13,706,939 后：
应税净收益：ARS 15,000,000 - 4,000,000 - 1,800,000 - 13,706,939 = max(0, -4,506,939) = ARS 0

税额：ARS 0。个人扣除额完全覆盖该收入。

### 示例 5 — Banco Macro（Tucumán，有 Gastos sin Factura 的医生）

**银行：** Banco Macro
**客户：** Carlos Méndez 医生，Tucumán

问题：客户申报了 ARS 2,000,000 无 facturas 的费用。

处理：根据第 83 条，不得扣除。此外，Ley 20.628 第 38 条对无凭证费用征收 35% 的惩罚性税款 = ARS 700,000 额外税款。将其从扣除额中移除并标记。

### 示例 6 — BBVA Argentina（Mendoza，有混合收入的顾问）

**银行：** BBVA Argentina
**客户：** Patricia Vega，顾问，Mendoza，另有租金收入

自雇收入：ARS 22,000,000
租金收入（1ra categoría）：ARS 6,000,000
总收益：ARS 28,000,000

合并所有收入类别。按类别应用费用扣除。对合并后的 ganancia neta 应用 GNI + DE + cargas。标记：由于拥有不动产，很可能触发 Bienes Personales。

---

## 第 5 节 — Tier 1 规则（直接应用）

**T1-AR-1 — Autónomos 使用 2.5x 倍数，绝不能使用 3.8x**
3.8x 的 deducción especial 倍数仅适用于 empleados en relación de dependencia。Autónomos 使用 ganancia no imponible 的 2.5x。无需升级处理，直接应用。

**T1-AR-2 — 无凭证费用会触发 35% 的惩罚性税款**
根据 Ley 20.628 第 38 条，Gastos sin factura 不仅不得扣除，还需按无凭证费用总额额外缴纳 35% 的税款。始终予以标记并计算 35% 的罚税。

**T1-AR-3 — Percepciones 是税收抵免，而非扣除项**
已承担的 Percepciones（例如外币购买适用的 RG 4815、进口 percepciones）是用于抵减年度 DDJJ Ganancias 的税收抵免。它们会减少最终应付税款余额。如果 percepciones 超过税额，则会产生 saldo a favor。

**T1-AR-4 — Anticipos 属于税款抵免，而非扣除项**
每两个月缴纳的预缴税款（anticipos）可抵免最终 DDJJ 中确定的税款。它们不属于可扣除费用。

**T1-AR-5 — Cargas de familia：受扶养人的收入必须低于 GNI**
只有当受扶养人本人的收入低于 ganancia no imponible 时，才可适用 cónyuge 和 hijo 扣除。应用前须进行核实。

**T1-AR-6 — 必须进行半年度门槛调整**
阿根廷每 6 个月根据 IPC 调整税率级距门槛和个人扣除额。每个半年度的收入必须采用该半年度适用的门槛。切勿使用基于单一半年度数据的全年表格。

**T1-AR-7 — 必须将 Bienes Personales 与 Ganancias 一并考虑**
Bienes Personales 是一项单独的财富税（累进税率为 0.5% 至 1.75%），申报时间安排与 Ganancias 相同。当客户的资产基数可能超过门槛时，务必予以标记。

---

## 第 6 节 — 第 2 级目录（需要复核人员作出判断）

| 代码 | 情形 | 上报原因 | 建议处理方式 |
|---|---|---|---|
| T2-AR-1 | 选择 Monotributo 还是 Responsable Inscripto | 两者适用完全不同的制度；取决于营业额、费用和客户情况 | 标记并交由 Contador Público 处理；不得按错误的制度计算 |
| T2-AR-2 | 居家办公费用比例 | 需要有文件证明的专用空间，并计算相应比例 | 标记 — 按比例扣除；复核人员必须确认计算方法 |
| T2-AR-3 | 机动车辆的业务使用比例 | 根据 art. 88，扣除受到限制；购置成本和运营成本均设有上限 | 标记 — 必须记录车辆的业务使用比例 |
| T2-AR-4 | 半年度门槛的应用 | 每个半年度的金额可能不同；年度 DDJJ 汇总两个半年度 | 标记 — 确认已应用正确的半年度门槛 |
| T2-AR-5 | Bienes Personales 的相互影响 | 资产超过门槛将触发财富税；与 Ganancias 一并申报 | 标记 — 核实资产基数和门槛；单独计算 |
| T2-AR-6 | 阿根廷居民的境外来源收入 | 全球收入均须缴纳 Ganancias；可能适用外国税收抵免 | 上报 — 需要进行税收协定分析 |

---

## 第 7 节 — Excel 工作底稿模板

```
ARGENTINE GANANCIAS WORKING PAPER (AUTÓNOMO / PROFESIONAL INDEPENDIENTE)
Taxpayer: _______________  CUIT: _______________  FY: 2025 (Calendar Year)

SECTION A — INCOME (GANANCIA BRUTA)
                                        ARS
4ta categoría (honorarios/servicios):  ___________
1ra categoría (rental, if any):        ___________
2da categoría (financial, if any):     ___________
Foreign-source income (converted):     ___________
TOTAL GANANCIA BRUTA                   ___________

SECTION B — GASTOS DEDUCIBLES (Art. 83-87)
Office rent:                           ___________
Utilities (business %):                ___________
Phone/internet (business %):           ___________
Software:                              ___________
Accounting/legal fees:                 ___________
Travel (business purpose):             ___________
Marketing/advertising:                 ___________
Staff salaries + cargas sociales:      ___________
Office supplies:                       ___________
Professional insurance:                ___________
Professional body fees:                ___________
TOTAL GASTOS DEDUCIBLES                ___________

SECTION C — GANANCIA NETA
Ganancia bruta - gastos deducibles     ___________

SECTION D — DEDUCCIONES GENERALES (Art. 85)
Aportes jubilatorios:                  ___________
Obra social / prepaga (5% cap):        ___________
Seguros de vida:                       ___________
Servicio doméstico (GNI cap):          ___________
Alquiler vivienda (40%, GNI cap):      ___________
Donaciones (5% cap):                   ___________
TOTAL DEDUCCIONES GENERALES            ___________

SECTION E — DEDUCCIONES PERSONALES (Art. 30)
Ganancia no imponible (GNI):           ___________
Deducción especial (2.5x GNI):        ___________
Cónyuge:                               ___________
Hijos (x ___):                         ___________
TOTAL DEDUCCIONES PERSONALES           ___________

SECTION F — GANANCIA NETA IMPONIBLE
C - D - E (min 0):                     ___________

SECTION G — IMPUESTO DETERMINADO
Tax per progressive scale:             ___________

SECTION H — CREDITS
Anticipos paid:                        (___________)
Retenciones sufridas:                  (___________)
Percepciones (RG 4815, etc.):          (___________)
TAX DUE / (SALDO A FAVOR)             ___________

SECTION I — REVIEWER FLAGS
[ ] Tax category confirmed (autónomo, not empleado or Monotributo)?
[ ] Semi-annual thresholds verified with ARCA?
[ ] All expenses documented with facturas electrónicas?
[ ] No gastos sin factura included (35% penalty check)?
[ ] Cargas de familia — dependant income below GNI confirmed?
[ ] Percepciones certificates verified?
[ ] Bienes Personales obligation assessed?
[ ] Foreign income converted at ARCA official rate?
```

---

## 第 8 节 — 银行对账单阅读指南

### 阿根廷国家银行（BNA）
- 导出：从 Home Banking BNA 导出 PDF 或 CSV
- 列：`Fecha;Concepto;Débito;Crédito;Saldo`
- 金额格式：句点作为千位分隔符，逗号作为小数分隔符（例如 `1.200.000,00`）
- 日期：DD/MM/YYYY
- 贷方摘要：`TRANSFERENCIA CR [sender]`、`ACREDITACIÓN [sender]`

### 加利西亚银行
- 导出：从 Online Banking Galicia 导出 CSV/Excel
- 列：`Fecha;Descripción;Débito;Crédito;Saldo`
- 标准阿根廷格式；正数表示贷方，负数表示借方
- SPEI/CVU 摘要：`TRF CVU [sender]`、`TRANSFERENCIA [sender]`

### 阿根廷桑坦德银行
- 导出：从 Santander Online 导出 CSV/PDF
- 列：`Fecha;Concepto;Importe;Saldo`
- 正数 = 贷方；负数 = 借方

### 阿根廷 BBVA 银行（原 Francés）
- 导出：从 BBVA Net 导出 CSV/PDF
- 列：`Fecha;Detalle;Débito;Crédito;Saldo`
- 摘要：`TRF RECIBIDA DE [sender]`

### 马克罗银行
- 导出：从 Macro Online 导出 CSV
- 标准格式；`Fecha;Movimiento;Débito;Crédito;Saldo`

### Brubank / Ualá / Naranja X（数字银行）
- 导出：从应用导出 CSV 或 PDF
- 简单格式；贷方/借方使用单列（正数/负数）或分列
- CVU 转账：`Transferencia recibida de [sender]`
- Mercado Pago：`MP COBRO [amount]`

### Mercado Pago
- 本身并非银行对账单；结算款会显示在主要银行账户的对账单中
- 查找：`MERCADOPAGO`、`MP COBRO`、`LIQUIDACIÓN MP`
- 扣除手续费时需要还原为含手续费的总额

### 阿根廷银行业务要点
- 所有金额均以 ARS（阿根廷比索）计价；句点作为千位分隔符，逗号作为小数分隔符
- CVU（Clave Virtual Uniforme）是阿根廷金融科技钱包使用的即时支付标识符
- CBU（Clave Bancaria Uniforme）用于传统银行转账
- CVU 和 CBU 转账均显示为贷方入账，并附有付款人身份信息

---

## 第 9 节 — 入门后备方案

**税务类别确认：**
> “在计算您的 Ganancias 之前，我需要确认您的税务类别。您登记为 autónomo（Responsable Inscripto），还是属于 Monotributo？如果您属于 Monotributo，则需每月支付固定费用（DAS），且无须就这部分收入申报 Ganancias——这适用另一项技能。如果您是 Responsable Inscripto autónomo，则适用本技能。请使用您的 Clave Fiscal 在 www.arca.gob.ar 上查询您的状态。”

**缺少 facturas：**
> “阿根廷税法要求所有可扣除费用均须有 facturas electrónicas 作为凭证。没有 facturas 的费用不仅不可扣除，还会根据 Ley 20.628 第 38 条触发 35% 的惩罚性税款。请确保申报的所有费用均有相应的 facturas。您可以前往 www.arca.gob.ar → ‘Mis Comprobantes’核实您收到的 facturas。”

**Percepciones 核实：**
> “您可能因购买外币或进口而产生了 percepciones（RG 4815 / Impuesto PAÍS）。这些款项可抵扣您的 Ganancias DDJJ。要申领抵扣，我需要相应的 percepción 证明。您可以在 ARCA 账户的‘Mis Retenciones’栏目中下载这些证明，或在银行对账单中查找 percepción 明细项目。”

**Bienes Personales 提醒：**
> “作为年度报税的一部分，我还需要评估您是否负有 Bienes Personales（财富税）的纳税义务。该税适用于超过 ARCA 每年更新之门槛的全球资产。您是否拥有房地产、车辆、投资或银行存款，且其总额可能超过该门槛？Bienes Personales 与 Ganancias 按相同的申报时间表进行申报。”

---

## 第 10 节 — 参考资料

### 主要法律法规
- **Ley 20.628** — 所得税（整合文本）
- **Ley 27.743** — 2024 年财政方案（修改后的税率和门槛）
- **Ley 23.966** — 个人财产税
- **Ley 11.683** — 税务程序（罚款、利息）
- **Decreto Reglamentario** — 实施条例

### 申报日历

| 截止日期 | 事项 |
|---|---|
| 6 月（按 CUIT 最后一位数字确定） | DDJJ Ganancias 年度申报 |
| 6 月（相同时间表） | DDJJ Bienes Personales |
| 自 6 月起每两个月 | Anticipos（分 5 期，每期为上一年度税额的 20%） |

### 处罚

| 违法行为 | 处罚 |
|---|---|
| 逾期申报（遗漏） | 每月按未缴税款的 1% 计收（最高 100%） |
| 重大遗漏（第 45 条） | 漏缴税款的 100% |
| 税务欺诈（第 46 条） | 逃税金额的 200-1000% + 刑事处罚 |
| 无凭证费用（第 38 条） | 按总金额加征 35% 的税款 |
| 逾期付款利息 | ARCA 决议规定的利率（每月约 4-6%） |

### 实用参考资料
- ARCA 门户网站：www.arca.gob.ar
- Clave Fiscal：servicioscf.arca.gob.ar
- IPC 更新：www.indec.gob.ar
- Bienes Personales 门槛：每年查看 ARCA RG

---

## 免责声明

本技能及其输出仅供信息和计算用途，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或后果承担责任。在提交申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区内具有同等资质的执业人士）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、请求持证会计师进行专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/ar-income-tax) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_