---
name: ar-social-contributions
description: "Use this skill whenever asked about Argentine self-employed social contributions (aportes autónomos). Trigger on phrases like \"aportes autónomos\", \"categoría autónomos\", \"jubilación autónomos\", \"PAMI autónomos\", \"cuánto pago de autónomo\", \"contribuciones SIPA\", or any question about Argentine social security obligations for self-employed individuals. Covers Categories I-V, retirement (SIPA), PAMI (INSSJP), and obra social contributions, monthly fixed amounts, VEP payment, and edge cases. ALWAYS read this skill before touching any Argentine social contribution work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/ar-social-contributions"
  obligation: SSC
---
# 阿根廷社会保障缴款（Aportes Autónomos）——自雇人士技能 v2.0

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的事实、文件、选择、截止日期、居住地、申报身份或当地程序进行审核。在未经相关司法管辖区的合格专业人士审核的情况下，请勿依赖本技能进行申报、缴款、修正申报或采取税务立场。

## 第 1 节——快速参考

| 字段 | 值 |
|---|---|
| 国家 | 阿根廷 |
| 主管机关 | ARCA（前身为 AFIP） |
| 主要法律 | Ley 24.241（SIPA）、Ley 19.032（INSSJP/PAMI） |
| 配套法律 | Ley 23.660（Obras Sociales）；ARCA 月度决议 |
| 制度 | 5 个类别的每月固定金额制度 |
| 组成部分 | 退休金缴款（SIPA）+ PAMI + 社会医疗保险 |
| 类别 I（2025 年 9 月） | 约 ARS 57,530/月 |
| 类别 V（2025 年 9 月） | 约 ARS 253,129/月 |
| 专业人士最低类别 | 类别 II |
| 雇主最低类别 | 类别 III（1–3 名员工）、IV（4–6 名）、V（7 名及以上） |
| 付款方式 | 通过 ARCA 门户使用 VEP |
| 到期日 | 次月最后一个工作日 |
| 货币 | 仅限 ARS（金额因 movilidad 每月调整） |
| 贡献者 | Open Accountants |
| 验证者 | 待定——需要阿根廷 contador 验证 |
| 验证日期 | 待定 |

**重要：金额会因 movilidad previsional 而每月变化。请始终在 ARCA 网站上核实当前金额。**

---

## 第 2 节——必需输入信息和拒绝处理目录

### 必需输入信息

在计算之前，你必须获取：

1. **活动类型**——profesional（拥有大学学位）还是其他自雇人士？
2. **年度总收入**——用于确定类别
3. **员工人数**——影响最低类别
4. **是否同时受雇（relación de dependencia）？**——双重身份规则
5. **当前月份/期间**——金额每月变化
6. **Monotributista 还是 Autónomo？**——本技能仅涵盖 Autónomos

**如果活动类型未知，请停止。**

### 拒绝处理目录

**R-AR-SOC-1——Moratoria（债务规范化）。** 触发条件：客户有多年未缴的社会保障缴款。提示信息：“Moratoria 的条款由 ARCA 的具体决议规定。请升级给合格的 contador 处理。”

**R-AR-SOC-2——差别制度。** 触发条件：危险/繁重活动。提示信息：“适用带撇号的类别（I'-V'）。请向 ARCA 核实活动资格。标记以供审核人员审查。”

### 禁止事项

- 绝不在未核实当前经 movilidad 调整后的金额时使用之前月份的金额
- 绝不将类别 I 分配给拥有大学学位的专业人士
- 绝不因为收入为零，就告知已登记的 autónomo 无须缴款——其金额是固定的
- 绝不混淆 Monotributo 与 Autónomo——两者是完全不同的制度
- 绝不在未升级处理的情况下就 moratoria 提供建议
- 绝不将当前月份之后的金额表述为确定金额
- 绝不假设具有双重身份的客户可免缴 autónomo 缴款
- 绝不将雇主分配至低于其员工人数所对应最低类别的类别

---

## 第 3 节——类别判定

**法律依据：** Ley 24.241

| 类别 | 适用对象 |
|---|---|
| I | 收入最低、无雇员且无大学学位 |
| II | 中等收入者，或无雇员的专业人士（拥有大学学位） |
| III | 雇员不超过 3 人的专业人士，或收入较高者 |
| IV | 雇员为 4-6 人的雇主，或高收入者 |
| V | 雇员为 7 人以上的雇主，或收入最高者 |

关键规则：
- 拥有大学学位的专业人士：最低为类别 II
- 雇主：类别 III（1-3 人）、IV（4-6 人）、V（7 人以上）为最低类别

---

## 第 4 节——每月金额及组成部分

### 参考金额（2025 年 9 月）

| 类别 | 每月总额（ARS） |
|---|---|
| I | ~57,530 |
| II | ~80,541 |
| III | ~115,059 |
| IV | ~184,094 |
| V | ~253,129 |

### 组成部分

| 组成部分 | 去向 |
|---|---|
| Aporte jubilatorio | SIPA（退休养老金） |
| Aporte PAMI | INSSJP（退休人员医疗保障） |
| Aporte obra social | Obra Social（当前医疗保障） |

### Movilidad（指数化调整）

金额每月根据 Ley 27.609 的 movilidad 公式（CPI + RIPTE）进行调整。ARCA 每月发布更新后的表格。

---

## 第 5 节——缴费和登记

### 生成 VEP

1. 访问 ARCA 门户
2. 选择 "Autónomos" > "Generar VEP"
3. 确认期间和类别
4. 通过已关联的银行账户支付

### 登记

在 30 天内通过 Formulario 885 完成登记。必须拥有 CUIT。同一项活动不能同时采用 Monotributista 和 Autónomo 身份。

---

## 第 6 节——税前扣除和处罚

### 税前扣除

| 问题 | 答案 |
|---|---|
| aportes 是否可以扣除？ | 可以——可从所得税（Ganancias）中扣除 |
| 在何处申报？ | 年度申报表的扣除项目 |
| 计入哪一年？ | 支付年度 |

### 处罚

| 处罚 | 详情 |
|---|---|
| 逾期付款 | 按日计息（tasa resolutoria） |
| 未登记 | 罚款 + 追缴过往缴款 |
| 未缴费 | 相应期间不计入退休年限 |
| ARCA 可采取的措施 | Ejecución fiscal（司法追缴） |

---

## 第 7 节——自愿选择更高类别和双重身份

### 自愿选择更高类别

客户可以选择高于最低要求的类别。这会提高未来的退休待遇。通过 ARCA 提交 recategorización。

### 双重身份（受雇 + 自雇）

必须同时缴纳雇员缴款（代扣）和 autónomo 缴款。不可豁免。Obra social 可以合并。

### 退休后继续工作

仍须缴纳 autónomo 缴款。PAMI 部分可能有所不同。标记并交由审核人员处理。

---

## 第 8 节——边缘案例登记表

### EC1——专业人士选择类别 I
**情况：** 律师尝试登记为类别 I。
**处理：** 拒绝。拥有大学学位的专业人士最低必须为类别 II。

### EC2——零收入月份
**情况：** 没有收入，但仍处于登记状态。
**处理：** 必须缴纳全额月度缴款。无论收入多少，均按固定金额缴纳。

### EC3——与 Monotributo 混淆
**情况：** 客户询问 aportes，但其身份为 Monotributista。
**处理：** 此技能不适用。引导至 Monotributo 技能。

### EC4 -- 雇主降至门槛以下
**情况：** 第 IV 类（5 名员工）解雇 2 人，现有 3 人。
**处理：** 可申请重新分类至第 III 类。不会自动调整。标记并提交审核人员。

### EC5 -- 年中从 Monotributo 转换
**情况：** 6 月之前为 Monotributista，7 月起为 Autónomo。
**处理：** Autónomo 缴款从 7 月开始。类别根据预计收入确定。标记并提交审核人员。

---

## 第 9 节 -- 审核人员升级处理协议

当某种情况需要审核人员判断时：

```
REVIEWER FLAG
Tier: T2
Client: [name]
Situation: [description]
Issue: [what is ambiguous]
Options: [possible treatments]
Recommended: [most likely correct treatment and why]
Action Required: Qualified contador must confirm before advising client.
```

当某种情况超出本技能范围时：

```
ESCALATION REQUIRED
Tier: T3
Client: [name]
Situation: [description]
Issue: [outside skill scope]
Action Required: Do not advise. Refer to qualified contador. Document gap.
```

---

## 第 10 节 -- 测试套件

### 测试 1 -- 标准第 I 类
**输入：** 自由职业设计师，无学位，无员工，2025 年 9 月。
**预期输出：** 第 I 类。约 ARS 57,530。须在 10 月底前通过 VEP 缴纳。

### 测试 2 -- 专业人士最低类别
**输入：** 自雇会计师，无员工，2025 年 9 月。
**预期输出：** 第 II 类。约 ARS 80,541。

### 测试 3 -- 拥有 5 名员工的雇主
**输入：** 小型企业，5 名员工，2025 年 9 月。
**预期输出：** 第 IV 类。约 ARS 184,094。

### 测试 4 -- 双重身份
**输入：** 全职受雇并同时从事自由职业。
**预期输出：** 必须单独缴纳 autónomo。

### 测试 5 -- 零收入月份
**输入：** 第 I 类，2025 年 8 月收入为零。
**预期输出：** 仍须全额缴款。

### 测试 6 -- 专业人士尝试选择第 I 类
**输入：** 律师尝试选择第 I 类。
**预期输出：** 拒绝。最低为第 II 类。

---

## 免责声明

本技能及其输出仅用于提供信息和计算，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或后果承担责任。在进行申报或据此采取行动之前，所有输出都必须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区内具有同等资质的执业人员）审核并签字确认。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。登录后可访问最新版本、申请持证会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/ar-social-contributions) — 面向 AI 的开放税务指南，由具名 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_