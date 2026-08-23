---
name: ar-vat-return
description: "> Argentine VAT return (IVA -- Impuesto al Valor Agregado) for self-employed individuals under the regimen general. Covers the standard 21% rate, reduced 10.5%, increased 27%, monthly filing via AFIP SIAP/web, debito/credito fiscal computation, and withholding/perception regimes. Primary source: Ley 23.349 (Ley de IVA) and its regulatory decree (Decreto 692/98)."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AR
  category: international
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/ar-vat-return"
  tax_year: 2025
  obligation: CT
---
# 阿根廷增值税申报表（IVA）v1.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流程的一般税务/会计参考资料。其尚未针对任何特定个人的事实情况、文件、选择、截止日期、居民身份、申报状态或当地程序进行审核。未经相关司法管辖区合格专业人士审核，请勿依赖本技能进行申报、缴税、修正申报或采取任何税务立场。

## 本文件说明

**义务类别：** CT（消费税）
**功能角色：** 申报表编制
**状态：** 完整

这是一个第 2 层内容技能，用于为个体经营者（autonomos/从 monotributistas 转为 regimen general 的纳税人）编制阿根廷 IVA（Impuesto al Valor Agregado）月度申报表。阿根廷实行三级增值税税率制度，并设有广泛的预扣和预征机制。

---

## 第 1 节 -- 范围声明

**范围内：**

- 月度 IVA 申报表（DDJJ IVA -- F.2002）
- Responsable Inscripto（一般制度下的登记纳税人）
- 三档增值税税率：21%、10.5%、27%
- Debito fiscal（销项增值税）和 credito fiscal（进项增值税）
- 已承担的预扣税（retenciones）和预征税（percepciones）
- 通过 AFIP Web 服务或 SIAP 申报
- 电子发票（factura electronica）要求

**范围外（拒绝处理）：**

- Monotributo（小规模纳税人简化制度）
- 企业 IVA 申报表
- 超出基本分类范围的进口 IVA（海关增值税）
- 转让定价影响
- 作为代理人的 Percepciones（担任预扣/预征代理人）
- 省级营业总收入税（Ingresos Brutos）

---

## 第 2 节 -- 申报要求

### 必须申报的主体

每一位 Responsable Inscripto 都必须提交月度 IVA 申报表，即使没有经营活动也必须申报（零申报）。年收入超过 Monotributo 门槛后，必须进行登记。**来源：** Ley 23.349, Art. 4.

### 申报时间表

| 项目 | 详情 | 来源 |
|------|--------|--------|
| 申报周期 | 每月 | Ley 23.349, Art. 27 |
| 截止日期 | 根据 CUIT 末位数字确定（AFIP 日历，通常为次月 18 日至 22 日） | RG AFIP 3382/2012 |
| 申报方式 | 通过 AFIP Web 以电子方式申报（F.2002 online） | RG AFIP 3711/2015 |
| 电子发票 | 所有 Responsables Inscriptos 均必须使用 | RG AFIP 4291/2018 |

---

## 第 3 节 -- 税率和门槛

### 增值税税率

| 税率 | 适用于 | 来源 |
|------|-----------|--------|
| 21%（标准税率） | 大多数商品和服务 | Ley 23.349, Art. 28 |
| 10.5%（优惠税率） | 资本货物、某些食品、医疗服务、报纸、住宅建筑及某些运输服务 | Ley 23.349, Art. 28, inc. a) |
| 27%（加征税率） | 非住宅用途的电信、燃气、电力和供水 | Ley 23.349, Art. 28, inc. b) |
| 0%（免税） | 指定的免税供应（教育、符合特定条件的医疗卫生服务、金融服务、书籍、面包/牛奶） | Ley 23.349, Art. 7 |

### 主要门槛

| 项目 | 金额 | 来源 |
|------|--------|--------|
| Monotributo 转出门槛（服务，2025 年） | ARS ~11,916,410/年（定期更新） | Ley 24.977, Annex |
| Credito fiscal 结转 | 不受期限限制（不会到期） | Ley 23.349, Art. 24 |

---

## 第 4 节——计算规则（分步格式）

### 第 1 步：计算销项增值税（debito fiscal）

对于当月的每笔销售/服务：
1. 对交易进行分类：标准税率（21%）、优惠税率（10.5%）、提高税率（27%）或免税。
2. 核实电子发票（factura electronica）是否已通过 AFIP 开具。
3. 销项增值税 = 所有已开具发票中收取的 IVA 之和。

### 第 2 步：计算进项增值税（credito fiscal）

对于当月的每笔采购/费用：
1. 核实供应商的发票是否为有效的电子发票（factura electronica）。
2. 对所收取的 IVA 税率进行分类。
3. 核实该费用与应税活动相关（只有与应税销售相关的采购，其进项增值税才可抵扣）。
4. 进项增值税 = 有效采购发票上的 IVA 之和。

### 第 3 步：混合经营时应用比例分摊规则

如果纳税人同时进行应税销售和免税销售：
- 必须在应税活动和免税活动之间分摊进项增值税。
- 只有归属于应税活动的部分可以抵扣。
- 分摊比例 = 应税销售额 /（应税销售额 + 免税销售额）。
- 可抵扣进项增值税 = 进项增值税总额 x 分摊比例。

**来源：** Ley 23.349，第 13 条。

### 第 4 步：计算 IVA 净额

销项增值税 - 进项增值税 = IVA 净额。

- 如果为正数：应缴税款。
- 如果为负数：作为技术性留抵余额（saldo a favor tecnico）结转。

### 第 5 步：抵扣已承受的预扣税和加征税

从 IVA 净额中扣除当月已承受的 IVA 预扣税（retenciones）和加征税（percepciones）：

- 预扣税：由被指定为预扣代理人的客户扣缴的金额。
- 加征税：由被指定为加征代理人的供应商额外收取的 IVA。

应缴净额 = IVA 净额 - 预扣税 - 加征税。

如果为负数：该余额将成为可自由支配余额（saldo de libre disponibilidad），可用于抵扣其他 AFIP 纳税义务。

### 第 6 步：申报和缴税

- 通过 AFIP 门户网站提交 F.2002。
- 通过授权银行使用 VEP（Volante Electronico de Pago）缴税。

---

## 第 5 节——边缘情况和特殊规则

### E-1：电子发票要求

所有发票（销售和采购）都必须是经 AFIP 授权的电子发票。纸质发票不再可用于抵扣进项增值税。类型：
- Factura A：Responsables Inscriptos 之间使用
- Factura B：由 Responsable Inscripto 向最终消费者或免税主体开具
- Factura C：由 Monotributista 开具

只有 Factura A 和某些进口单据可以产生进项增值税。

### E-2：技术性留抵余额与可自由支配余额

- **技术性留抵余额（Saldo a favor tecnico）：** 当进项增值税超过销项增值税时产生。只能结转用于抵扣未来的销项增值税。
- **可自由支配余额（Saldo de libre disponibilidad）：** 因预扣税/加征税超额而产生。可用于抵扣任何 AFIP 纳税义务（IVA、Ganancias 等），也可申请退税。

### E-3：不可抵扣的进项增值税

以下项目的进项增值税不可抵扣：
- 个人消费用品（食品、个人使用的服装）
- 价值超过规定门槛的汽车
- Monotributistas 开具的发票（Factura C 不单独列示 IVA）
- 从未注册供应商处进行的采购

### E-4：服务出口

服务出口（为境外客户提供并在境外消费）适用零税率，且可抵扣进项税。纳税人可以申请退还相关 credito fiscal。**来源：** Ley 23.349, Art. 43。

### E-5：通货膨胀与货币

所有金额均以阿根廷比索（ARS）计价。鉴于通货膨胀率较高，结转的 credito fiscal 的实际价值会随时间推移而缩水。增值税抵扣额没有通货膨胀调整机制。

### E-6：预扣制度（regimenes de retencion）

大型买方（由 AFIP 指定）必须从向供应商支付的款项中预扣一定比例的 IVA。常见比例为 IVA 的 50% 或 100%。预扣金额可用于抵减供应商的 IVA 应纳税额。**来源：** RG AFIP 2854/2010。

---

## 第 6 节——测试套件

### 测试 1：标准月度申报

- **输入：** 适用 21% 税率的销售额：ARS 1,000,000。适用 21% 税率的采购额：ARS 600,000。
- **预期：** Debito：ARS 210,000。Credito：ARS 126,000。IVA 净额：ARS 84,000。

### 测试 2：混合税率

- **输入：** 适用 21% 税率的销售额：ARS 500,000。适用 10.5% 税率的销售额：ARS 200,000。适用 21% 税率的采购额：ARS 400,000。
- **预期：** Debito：(500,000 x 21%) + (200,000 x 10.5%) = 105,000 + 21,000 = 126,000。Credito：84,000。净额：ARS 42,000。

### 测试 3：预扣税款减少应付金额

- **输入：** IVA 净额：ARS 84,000。已被预扣税款：ARS 30,000。已被预征税款：ARS 10,000。
- **预期：** 应付金额：84,000 - 30,000 - 10,000 = ARS 44,000。

### 测试 4：Saldo a favor

- **输入：** Debito：ARS 50,000。Credito：ARS 80,000。
- **预期：** Saldo a favor tecnico：ARS 30,000。结转至下个月。无需缴款。

### 测试 5：混合经营活动的按比例分摊

- **输入：** 应税销售额：ARS 800,000。免税销售额：ARS 200,000。credito fiscal 总额：ARS 100,000。
- **预期：** 按比例分摊：800,000 / 1,000,000 = 80%。可抵扣 credito：ARS 80,000。

---

## 第 7 节——禁止事项

- **P-1：** 不得申报抵扣 Factura C（Monotributista 发票）中的 credito fiscal。此类发票不单独列示 IVA。
- **P-2：** 不得申报抵扣个人消费项目的 credito fiscal。
- **P-3：** 同时存在应税销售和免税销售时，不得忽略按比例分摊规则。
- **P-4：** 不得混淆 saldo a favor tecnico 与 saldo de libre disponibilidad。二者用途不同。
- **P-5：** 在确认所有发票均为经过适当授权的电子发票之前，不得提交申报。
- **P-6：** 不得就 Monotributo 的资格或转换提供建议。这需要单独分析。

---

## 第 8 节——自检

交付输出前，请确认：

- [ ] 所有销售发票均为经过授权的电子发票（factura electronica）
- [ ] 每笔交易均适用了正确的增值税税率（21%、10.5%、27%、免税）
- [ ] 仅凭有效的 Factura A 或进口单据申报抵扣 credito fiscal
- [ ] 存在应税与免税混合经营活动时，已按比例分摊
- [ ] 已正确扣除预扣税款和预征税款
- [ ] 已正确区分 saldo a favor（tecnico 与 libre disponibilidad）
- [ ] 已根据 CUIT 末位数字，对照 AFIP 日历核实申报截止日期
- [ ] 无经营活动时已提交零申报

---

## 第 9 节——免责声明

本技能及其输出仅供信息参考和计算用途，不构成税务、法律或财务建议。对于因使用本技能而产生的任何错误、遗漏或后果，Open Accountants 及其贡献者概不承担任何责任。在申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区具有同等资质的执业人士）审核并签字批准。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持牌会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/ar-vat-return) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**引用来源的草稿**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_