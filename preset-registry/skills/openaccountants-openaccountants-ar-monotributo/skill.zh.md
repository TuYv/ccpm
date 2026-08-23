---
name: ar-monotributo
description: "> Use this skill whenever asked about the Argentine Monotributo simplified tax regime. Trigger on phrases like \"monotributo\", \"regimen simplificado\", \"AFIP\", \"DAS monotributo\", \"categorias monotributo\", \"impuesto integrado\", \"monotributista\", or any question about the unified monthly payment, category thresholds, or obligations for small self-employed individuals in Argentina. Covers the unified monthly payment (impuesto integrado + aportes jubilatorios + obra social), revenue-based categories (A through K), and exclusion rules. ALWAYS read this skill before touching any Argentine Monotributo work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AR
  category: international
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/ar-monotributo"
  tax_year: 2025
  obligation: OTHER
---
# 阿根廷 Monotributo——个体经营者技能 v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。其内容尚未针对任何特定个人的事实情况、文件、选项、截止日期、居留身份、申报状态或当地程序进行审查。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖本技能进行申报、缴款、修正申报或采取任何税务立场。

---

## 第 1 节——快速参考

| 字段 | 值 |
|---|---|
| 国家 | 阿根廷 |
| 税种 | Monotributo 统一缴款（impuesto integrado + SIPA 养老金 + obra social） |
| 货币 | 仅限 ARS |
| 纳税年度 | 日历年度 |
| 主要法律 | Ley 24.977（Monotributo，Regimen Simplificado para Pequenos Contribuyentes），及其修正案 |
| 配套法规 | RG AFIP；Decreto reglamentario |
| 税务机关 | Administracion Federal de Ingresos Publicos（AFIP）/ ARCA |
| 申报门户 | 通过 AFIP 网站（afip.gob.ar）访问 Monotributo 门户 |
| 申报截止日期 | 每月 DAS 于 20 日前缴纳；重新分类截止日期为 1 月 20 日和 7 月 20 日 |
| 贡献者 | Open Accountants Community |
| 验证者 | 待定——需要由阿根廷 contador publico 签字确认 |
| 技能版本 | 2.0 |

### 服务类别（2025 年近似值）

| 类别 | 年收入上限（ARS） | Impuesto Integrado（ARS/月） | Aportes Jubilatorios（ARS/月） | Obra Social（ARS/月） | 每月合计（ARS） |
|---|---|---|---|---|---|
| A | ~2,108,288 | ~1,047 | ~5,540 | ~7,402 | ~13,989 |
| B | ~3,133,941 | ~2,014 | ~6,094 | ~7,402 | ~15,510 |
| C | ~4,387,518 | ~3,441 | ~6,703 | ~7,402 | ~17,546 |
| D | ~5,449,094 | ~5,658 | ~7,374 | ~7,402 | ~20,434 |
| E | ~6,416,528 | ~8,904 | ~8,186 | ~7,402 | ~24,492 |
| F | ~8,020,660 | ~12,776 | ~8,837 | ~7,402 | ~29,015 |
| G | ~9,624,792 | ~17,029 | ~9,520 | ~7,402 | ~33,951 |
| H | ~11,916,410 | ~30,454 | ~10,510 | ~7,402 | ~48,366 |

### 商品类别（门槛更高，另有实物参数要求）

| 类别 | 年收入上限（ARS） |
|---|---|
| I | ~13,337,213 |
| J | ~15,285,088 |
| K | ~16,957,968 |

所有金额均为近似值。AFIP 每半年更新一次。请在 afip.gob.ar 上核实。

### 保守默认值

| 不明确事项 | 默认值 |
|---|---|
| 活动类型未知 | 服务（收入上限较低——最为保守） |
| 类别未知 | 选择收入所适用的最高类别（缴款金额最高） |
| obra social 选择未知 | 已加入 |
| 单价限额未知 | 假定限额适用 |
| 员工人数未知 | 零 |

---

## 第 2 节——必需输入和拒绝目录

### 必需输入

**最低可行要求**——过去 12 个月的总收入、活动类型（服务或商品）以及当前的 Monotributo 类别。

**建议提供**——营业场所面积、用电量、年度已付租金、商品单价、员工人数、obra social 加入状态、以往重新分类记录。

**理想情况**——AFIP 门户数据导出、完整的电子发票登记簿（Factura C）、12 个月滚动期间的银行对账单。

### 拒绝事项目录

**R-AR-1 -- 一般制度。** “收入超过 Monotributo 的最高限额。客户必须适用 Regimen General（IVA + Ganancias）。本技能不涵盖一般制度。”

**R-AR-2 -- 公司。** “公司（SRL、SA、SAS）适用不同的申报制度。本技能仅涵盖个人 Monotributistas。”

**R-AR-3 -- 被排除后的过渡规划。** “从 Monotributo 过渡到 Regimen General 涉及追溯效力和复杂规划。请升级至公共会计师处理。”

**R-AR-4 -- CEPO 下的境外收入。** “影响境外来源收入收取的外汇管制（CEPO）需要专业分析。请升级处理。”

---

## 第 3 节 -- 交易模式库

### 3.1 收入模式（银行对账单上的贷记）

| 模式 | 税务标签 | 处理方式 | 备注 |
|---|---|---|---|
| CLIENT PAYMENT, TRANSFERENCIA | Monotributo 收入 | 计入 12 个月滚动收入 | 核心收入 |
| MERCADO PAGO, MP COBRO | Monotributo 收入 | 计入 | 平台收款 |
| FACTURA C COBRO | Monotributo 收入 | 计入 | 发票收款 |
| EXPORTACION SERVICIOS, FACTURA E | Monotributo 收入（出口） | 计入收入限额 | 必须开具 Factura E |
| TRANSFERENCIA PROPIA, AHORRO | 排除 | 内部转账 | 自有账户之间的转账 |
| DEVOLUCION, REINTEGRO | 检查 | 可能减少收入 | 退款 -- 核实按净额还是总额计算 |
| SUBSIDIO, PLAN SOCIAL | 排除 | 政府转移支付 | 不属于 Monotributo 收入 |
| INTERESES, PLAZO FIJO | 排除 | 金融收入 | 不属于 Monotributo 经营活动收入 |

### 3.2 支出模式（银行对账单上的借记）

Monotributo 不要求跟踪支出（不可抵扣）。不过，以下模式有助于识别 DAS 缴款和业务背景：

| 模式 | 处理方式 | 备注 |
|---|---|---|
| AFIP DAS, MONOTRIBUTO, VEP | 每月统一缴款 | Impuesto integrado + SIPA + obra social |
| PAGO FACIL, RAPIPAGO (AFIP) | 通过支付网络缴纳 DAS | 同上 |
| DEBITO AUTOMATICO AFIP | 自动扣缴 DAS | 同上 |
| INGRESOS BRUTOS, IIBB | 省级营业总收入税 | 单独义务 -- 不在涵盖范围内 |
| PERSONAL, SUPERMERCADO, ALQUILER | 排除 | 个人支出 |

### 3.3 特定平台模式

| 模式 | 处理方式 | 备注 |
|---|---|---|
| MERCADO LIBRE, ML VENTA | 收入 | 通过电商平台销售商品 |
| PEDIDOS YA, RAPPI | 收入 | 配送平台收入 |
| PAYPAL, WISE, PAYONEER | 收入（境外） | 必须开具 Factura E；核实是否符合 CEPO 规定 |
| STRIPE PAYOUT | 收入（境外） | 同上 |

---

## 第 4 节 -- 示例详解

### 示例 1 -- 标准服务类自由职业者，D 类别

**输入：** 自由职业顾问，年收入 ARS 5,000,000，仅提供服务。

**计算：**
- D 类别（收入 <= ~5,449,094）
- 每月缴款：~ARS 20,434（impuesto integrado ~5,658 + aportes ~7,374 + obra social ~7,402）
- 年度成本：~ARS 245,208

### 示例 2 -- 低收入 A 类别

**输入：** 自由职业家教，年收入 ARS 1,500,000。

**计算：**
- A 类（收入 <= 约 2,108,288）
- 每月缴款：约 ARS 13,989
- 年度成本：约 ARS 167,868

### 示例 3 -- 商品销售者，I 类

**输入：** 在线零售商，年收入 ARS 12,000,000，经营场所面积 80 m2，商品单价 ARS 50,000。

**计算：**
- I 类（商品销售，收入 <= 约 13,337,213）
- 必须核实经营场所面积、用电量和租金均未超过限额
- 按 I 类表格确定每月缴款额

### 示例 4 -- 触发排除条件

**输入：** 服务类自由职业者，12 个月收入 ARS 13,000,000。

**分类：**
- 超过服务类 H 类上限（约 11,916,410）
- 被排除在 Monotributo 之外
- 必须注册一般税制（IVA + Ganancias）
- 上报给注册会计师

### 示例 5 -- 需要重新分类

**输入：** 当前为 B 类。过去连续 12 个月收入 = ARS 4,000,000。

**计算：**
- 超过 B 类上限（约 3,133,941），但未超过 C 类上限（约 4,387,518）
- 必须在下一个半年度窗口重新分类为 C 类
- 新的每月缴款额：约 ARS 17,546

---

## 第 5 节 -- 第 1 级规则（数据明确时）

### 5.1 Monotributo 的结构

**法律依据：** Ley 24.977, Art. 6-11

Monotributo 是一种统一的月度缴款制度，以根据类别确定的单一固定月度金额，取代所得税（Ganancias）、增值税（IVA）、养老金缴款（SIPA）和医疗保险（obra social）。

### 5.2 类别确定

**法律依据：** Ley 24.977, Art. 8

类别由以下各项中的最高一项确定：(a) 过去 12 个月的总收入，(b) 商业经营场所面积，(c) 用电量，(d) 已付租金。对于服务类，仅适用收入参数。对于商品销售类，所有参数均适用。

### 5.3 重新分类

**法律依据：** Ley 24.977, Art. 9

每半年重新分类一次（1 月和 7 月）。依据此前 12 个月的收入及各项参数确定。截止日期：1 月 20 日和 7 月 20 日。AFIP 可根据电子发票数据自动重新分类。

### 5.4 Factura C 要求

Monotributo 发票必须为 Factura C（不单列 IVA）。必须包括：开票方的 CUIT、当前类别字母、服务/商品说明、总金额，以及由 AFIP 在线开票系统签发的 CAE。对于出口：使用 Factura E。

### 5.5 实体参数限额（商品销售）

**法律依据：** Ley 24.977, Art. 8

经营场所面积：从 30 m2（A 类）到 200 m2（K 类）。用电量：从 3,330 kW 到 20,000 kW。已付租金：各类别的上限逐级提高。商品单价：每件最高约 ARS 180,589。服务类别不适用实体参数。

### 5.6 缴款与合规

缴款截止日期：每月 20 日。方式：VEP、自动扣款、Pago Facil/Rapipago。必须使用电子发票（Factura C）。部分类别需要提交年度信息申报表。

---

## 第 6 节 -- 第 2 级事项目录（需要审核人员判断）

### 6.1 收入接近类别上限

D 类自由职业者在 11 个月内的收入为 ARS 5,200,000。如果滚动 12 个月收入超过 D 类上限，则必须在下一个半年度窗口重新分类为 E 类。如果超过所有类别的上限，则适用排除规定。标记此情况，以便审核人员进行监控并提供建议。

### 6.2 服务与商品混合经营

AFIP 以主要经营活动为准。如果商品销售属于附带活动，则适用服务类别。如果两者均占较大比重，则可能适用门槛较高的商品类别，但同时还必须满足所有实体参数要求。标记以供审核人员审查。

### 6.3 客户取得境外收入

境外来源收入应计入 Monotributo 收入门槛。客户必须开具 Factura E（服务出口发票）。按官方汇率进行货币换算。标记以供审核人员审查——外汇管制规定（CEPO）可能影响资金收取。

### 6.4 自愿退出 Monotributo

可以自愿放弃 Monotributo，并登记适用 IVA + Ganancias。自放弃后的次月第一日起生效。3 年内不得重新加入 Monotributo。

---

## 第 7 节——Excel 工作底稿模板

```
ARGENTINA MONOTRIBUTO -- Working Paper
Period: [12-month rolling period]

A. REVENUE DETERMINATION
  A1. Gross revenue (last 12 months)              ___________
  A2. Activity type (services / goods / mixed)     ___________
  A3. Premises area (m2) -- goods only             ___________
  A4. Electricity consumption (kW) -- goods only   ___________
  A5. Annual rent paid (ARS) -- goods only         ___________
  A6. Max unit price of goods (ARS)                ___________

B. CATEGORY DETERMINATION
  B1. Revenue-based category                       ___________
  B2. Premises-based category (goods only)         ___________
  B3. Final category (highest of B1, B2)           ___________

C. MONTHLY PAYMENT
  C1. Impuesto integrado                           ___________
  C2. Aportes jubilatorios                         ___________
  C3. Obra social                                  ___________
  C4. TOTAL MONTHLY DAS                            ___________

D. ANNUAL COST
  D1. C4 x 12                                     ___________

REVIEWER FLAGS:
  [ ] Revenue verified against AFIP invoicing data?
  [ ] Recategorization window approaching?
  [ ] Physical parameters within limits (goods)?
  [ ] Foreign income included in revenue?
  [ ] Approaching exclusion threshold?
```

---

## 第 8 节——银行对账单阅读指南

### 阿根廷银行对账单格式

| 银行 | 格式 | 关键字段 |
|---|---|---|
| Banco Nacion, Banco Provincia | PDF, CSV | Fecha, Descripcion, Debito, Credito, Saldo |
| Galicia, BBVA, Santander | CSV, PDF | Fecha, Concepto, Importe, Saldo |
| Brubank, Uala, Naranja X | CSV | Fecha, Descripcion, Monto |
| Mercado Pago | CSV, PDF | Fecha, Detalle, Monto |
| Wise, Payoneer | CSV | Date, Description, Amount, Currency |

### 阿根廷银行业务关键术语

| 术语 | 分类提示 |
|---|---|
| TRANSFERENCIA RECIBIDA | 收到的转账——可能是收入 |
| DEBITO AUTOMATICO | 定期支出——检查是否为 DAS |
| COMPRA CON DEBITO | 销售点借记卡消费 |
| EXTRACCION ATM | ATM 现金取款 |
| PLAZO FIJO | 定期存款利息 |
| MERCADO PAGO | 可能是收入或支出 |
| VEP AFIP | 税款支付 |

---

## 第 9 节——信息收集备用方案

```
ONBOARDING QUESTIONS -- ARGENTINA MONOTRIBUTO
1. What is your CUIT?
2. Are you currently registered as Monotributista?
3. What is your current category?
4. Activity type: services, goods, or both?
5. Gross revenue in the last 12 months?
6. Do you have commercial premises? Area in m2?
7. Do you have employees?
8. Are you enrolled in obra social?
9. Do you invoice foreign clients (Factura E)?
10. Date of last recategorization?
```

---

## 第 10 节——参考资料

### 主要法律法规

| 主题 | 参考依据 |
|---|---|
| Monotributo 的制度结构 | Ley 24.977, Art. 6-11 |
| 类别表 | Ley 24.977, Art. 8 |
| 实体参数 | Ley 24.977, Art. 8 |
| 类别重新评定 | Ley 24.977, Art. 9 |
| 排除规则 | Ley 24.977, Art. 20-21 |
| 缴款截止日期 | Ley 24.977, Art. 31 |
| Factura C 要求 | RG AFIP facturacion electronica |
| Factura E（出口） | RG AFIP exportacion de servicios |

### Monotributo Social

Monotributo Social 是一种面向弱势群体、合作社和社会经济从业者的低成本版本。其适用资格标准有所不同。综合税额较低或为零。请向 AFIP 或社会服务机构核实资格。

### 逾期缴款的后果

未缴金额会产生利息。长期未缴款后，AFIP 可能会暂停 CUIT，客户也将失去 obra social 保障。必须通过 AFIP 的缴款计划系统（Mis Facilidades）恢复合规状态。

---

## 禁止事项

- 绝不允许收入超过最高类别门槛的客户使用 Monotributo——客户必须加入 Regimen General
- 绝不允许 Monotributo 纳税人开具 Factura A 或 B——Monotributo 使用 Factura C（出口业务则使用 E）
- 绝不在 Monotributo 发票上单独列示 IVA——IVA 已包含在统一缴款中
- 绝不忽略商品销售者的实体参数——仅凭收入不足以进行判断
- 绝不将 Monotributo 金额视为永久固定——AFIP 每半年更新一次
- 绝不允许已被排除出 Monotributo 的客户继续缴纳 Monotributo 款项
- 绝不忽略自愿退出 Monotributo 后 3 年内不得重新加入的限制
- 绝不将计算结果表述为最终结论——始终将其标注为估算结果，并引导客户咨询 contador publico

---

## 免责声明

本技能及其输出仅供信息参考和计算之用，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或后果承担责任。在进行申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如阿根廷的 contador publico 或具有同等资质的执业人员）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、请求持证会计师进行专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/ar-monotributo)——面向 AI 的开放式税务指南，由具名的 CPA/CA/EA 审核。质量：**附来源引用的草案**。如需始终保持最新的数据以及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_