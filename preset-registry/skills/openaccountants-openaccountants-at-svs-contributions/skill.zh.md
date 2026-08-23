---
name: at-svs-contributions
description: "Use this skill whenever asked about Austrian SVS (Sozialversicherungsanstalt der Selbständigen) social insurance contributions for self-employed individuals. Trigger on phrases like \"SVS contributions\", \"Austrian social insurance\", \"GSVG\", \"self-employed Austria contributions\", \"Pensionsversicherung self-employed\", \"SVS Vorschreibung\", or any question about social insurance obligations for a self-employed client in Austria. Covers pension (18.5%), health (6.8%), accident (flat monthly), and Selbständigenvorsorge. ALWAYS read this skill before touching any Austria social contributions work."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: INTL
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/at-svs-contributions"
  obligation: OTHER
---
# 奥地利 SVS 社会保险缴费——自雇人士 Skill v2.0

> **仅供一般参考。** 本 Skill 是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的事实情况、文件、选择、截止日期、税务居民身份、申报状态或当地程序进行审查。在未经相关司法管辖区的合格专业人士审核之前，请勿依赖本 Skill 进行申报、缴费、更正申报或采取任何税务立场。

## 第 1 节——快速参考

| 字段 | 值 |
|---|---|
| 国家 | 奥地利（奥地利共和国） |
| 主管机构 | SVS（Sozialversicherungsanstalt der Selbständigen） |
| 主要法律 | GSVG（Gewerbliches Sozialversicherungsgesetz） |
| 配套法律 | ASVG；FSVG（Freiberuflich）；BSVG（农民）；BMSVG（Selbständigenvorsorge）；EStG |
| 养老保险费率 | 缴费基数的 18.50% |
| 健康保险费率 | 缴费基数的 6.80% |
| 意外伤害保险 | EUR 11.35/月（固定金额） |
| Selbständigenvorsorge | 缴费基数的 1.53%（自 2008 年起，Gewerbetreibende 强制参加；Neue Selbständige 自愿参加） |
| 最低月缴费基数（2025 年） | EUR 539.81 |
| 最高月缴费基数（2025 年） | EUR 7,070.00 |
| 缴费频率 | 按季度（Vorschreibung） |
| 到期日 | 2 月 28 日、5 月 31 日、8 月 31 日、11 月 30 日 |
| 币种 | 仅限 EUR |
| 贡献者 | Open Accountants |
| 验证方 | 待定——需要由奥地利 Steuerberater 或 Wirtschaftsprüfer 验证 |
| 验证日期 | 待定 |

**最低月缴费额（按最低缴费基数 EUR 539.81 计算）：**

| 组成部分 | 每月 |
|---|---|
| 养老保险 | EUR 99.87 |
| 健康保险 | EUR 36.71 |
| 意外伤害保险 | EUR 11.35 |
| 合计（不含 Vorsorge） | EUR 147.93 |

**最高月缴费额（按最高缴费基数 EUR 7,070.00 计算）：**

| 组成部分 | 每月 |
|---|---|
| 养老保险 | EUR 1,307.95 |
| 健康保险 | EUR 480.76 |
| 意外伤害保险 | EUR 11.35 |
| 合计（不含 Vorsorge） | EUR 1,800.06 |

---

## 第 2 节——必需输入和拒绝处理目录

### 必需输入

在计算任何 SVS 金额之前，你必须获取：

1. **登记状态**——客户是否以 Gewerbetreibender 或 Neue Selbständige 身份在 SVS 登记？
2. **收入类型**——经营/商业收入（gewerbliche Einkünfte）还是自由职业收入（freiberufliche Einkünfte）？
3. **预计/上一年度自雇收入**——SVS 使用上一年度税务评定（Einkommensteuerbescheid）确定最终缴费基数
4. **开始年份**——新参保人在最初 3 年内，在税务评定可用之前采用暂定最低缴费基数
5. **是否同时受雇？**——ASVG 雇佣关系可能通过 Differenzvorschreibung 对合并缴费额设定上限
6. **是否选择加入 Selbständigenvorsorge？**——自 2008 年起，Gewerbetreibende 强制参加，Neue Selbständige 自愿参加

**如果登记类型未知，请停止。不要计算。登记类型决定适用哪些规定。**

### 拒绝处理目录

**R-AT-SVS-1——BSVG 农民制度。** 触发条件：客户的活动适用 BSVG（农民/农业）。消息："BSVG 农民社会保险不在本 Skill 的范围内。请咨询具备农业专业知识的合格 Steuerberater。"

**R-AT-SVS-2 -- 伤残养老金的相互影响。** 触发条件：客户在从事个体经营期间正在领取或申请伤残养老金。消息：“伤残养老金与 GSVG 缴费之间的相互影响需要专家审查。请升级至具备资质的 Steuerberater。”

**R-AT-SVS-3 -- 跨境认定。** 触发条件：客户在多个欧盟/欧洲经济区成员国工作。消息：“跨境社会保险认定需要根据欧盟第 883/2004 号条例分析 A1 证明。请升级至具备资质的顾问。”

### 禁止事项

- 在不知道登记类型（Gewerbetreibender 或 Neue Selbständige）的情况下，绝不计算 SVS 缴费
- 绝不忽略最低/最高缴费基数——所有计算都必须限制在这些上下限之内
- 绝不告知新加入者其临时缴费金额是最终金额——之后一定会进行 Nachbemessung
- 绝不要忘记意外保险采用每月固定金额，而不是按百分比计算
- 绝不声称 SVS 缴费不可在税前扣除——它们可以作为 Betriebsausgaben 扣除
- 绝不混淆 Versicherungsgrenze（Neue Selbständige 的参保门槛）与最低缴费基数
- 绝不将 GSVG 规则应用于农民（BSVG）或雇员（ASVG）
- 在实际年度的 Einkommensteuerbescheid 签发之前，绝不将 SVS 金额表述为最终金额

---

## 第 3 节——缴费基数

**法律依据：** GSVG 第 25 条

### 临时基数与最终基数

SVS 采用临时/最终核定制度：

- **临时缴费**以 3 年前的收入（最新可用的 Einkommensteuerbescheid）为基础，并根据通货膨胀进行调整
- **最终缴费**在当年度税务评定结果签发后重新计算（通常在 2 至 3 年后）
- **新加入者（前 3 年）：**临时基数 = 法定最低缴费基数

### 缴费基数公式

```
contribution_base = income_from_self_employment + prescribed_social_contributions
```

该基数为个体经营收入加上社会保险缴费本身（Hinzurechnung），由此形成循环计算，SVS 通过公布的表格解决这一问题。

### Gewerbetreibende 与 Neue Selbständige

| 特征 | Gewerbetreibende | Neue Selbständige |
|---|---|---|
| 登记 | Gewerbeberechtigung（营业许可） | 无营业许可；自由职业者、IT 承包商等 |
| 参保义务 | 登记后自动产生 | 收入超过门槛时触发（无其他保险时为每年 6,221.28 欧元；同时受雇时为 39,005.40 欧元） |
| Selbständigenvorsorge | 自 2008 年起强制参加 | 自愿参加 |
| 意外保险 | 强制参加 | 参保义务触发后强制参加 |

---

## 第 4 节——费率和门槛（2025 年）

**法律依据：** GSVG 第 25 至 27 条；SVS Beitragsgrundlagen 2025

| 项目 | 费率 | 法律依据 |
|---|---|---|
| 养老保险（Pensionsversicherung） | 18.50% | GSVG 第 27 条 |
| 健康保险（Krankenversicherung） | 6.80% | GSVG 第 27a 条 |
| 意外保险（Unfallversicherung） | 每月 11.35 欧元（固定金额） | ASVG 第 74 条 |
| Selbständigenvorsorge | 1.53% | BMSVG 第 52 至 53 条 |

| 阈值 | 月度（2025 年） | 年度（2025 年） |
|---|---|---|
| 最低缴费基数 | EUR 539.81 | EUR 6,477.72 |
| 最高缴费基数 | EUR 7,070.00 | EUR 84,840.00 |

### 自愿选择更高的医疗保险保障（选择加入 Krankengeld）

**法律依据：** GSVG 第 28a 条

| 选项 | 附加费率 |
|---|---|
| 选择加入 Krankengeld（疾病现金津贴） | 缴费基数的额外 2.5% |
| 选择加入后的医疗保险总费率 | 6.80% + 2.50% = 9.30% |

- 选择加入后，自患病第 43 天起可获得每日疾病现金津贴（Krankengeld）
- 必须在上一年度的 12 月 31 日前选择加入
- 提供建议前，应向 SVS 确认当前的等待期和津贴金额

---

## 第 5 节 -- 计算步骤

**法律依据：** GSVG 第 25-27 条

### 步骤 5.1 -- 确定暂定月度缴费基数

```
IF new_entrant (years 1-3):
    provisional_base = minimum_contribution_base (EUR 539.81/month)
ELSE:
    provisional_base = income_from_3_years_ago / 12 (adjusted)
    provisional_base = max(provisional_base, minimum_base)
    provisional_base = min(provisional_base, maximum_base)
```

### 步骤 5.2 -- 计算月度缴费额

```
pension_monthly    = provisional_base x 18.50%
health_monthly     = provisional_base x 6.80%
accident_monthly   = EUR 11.35
vorsorge_monthly   = provisional_base x 1.53% (if applicable)

total_monthly = pension_monthly + health_monthly + accident_monthly + vorsorge_monthly
```

### 步骤 5.3 -- 计算季度缴费额

```
quarterly_payment = total_monthly x 3
```

### 步骤 5.4 -- 最终结算（Nachbemessung）

实际年度的 Einkommensteuerbescheid 可用后：

```
final_base = actual_self_employment_income + actual_social_contributions
final_base_monthly = final_base / 12
final_base_monthly = clamp(minimum_base, final_base_monthly, maximum_base)

final_annual = (final_base_monthly x 18.5% + final_base_monthly x 6.8% + 11.35) x 12
adjustment = final_annual - provisional_annual_paid

IF adjustment > 0: SVS issues Nachforderung (additional payment due)
IF adjustment < 0: SVS issues Gutschrift (credit/refund)
```

---

## 第 6 节 -- 缴费时间表和税前扣除

**法律依据：** GSVG 第 35 条；EStG 第 4(4) 条

### 缴费时间表

| 季度 | 涵盖期间 | 到期日 |
|---|---|---|
| Q1 | 1 月--3 月 | 2 月 28 日 |
| Q2 | 4 月--6 月 | 5 月 31 日 |
| Q3 | 7 月--9 月 | 8 月 31 日 |
| Q4 | 10 月--12 月 | 11 月 30 日 |

- 逾期缴费将产生 Verzugszinsen（逾期利息），当前年利率约为 3.88%
- SVS 会在每个季度前发出 Vorschreibung
- 缴费可作为 Betriebsausgaben（经营费用）在税前扣除

### 税前扣除

| 问题 | 答案 |
|---|---|
| SVS 缴费是否可以从应税收入中扣除？ | 可以 -- 作为 Betriebsausgaben |
| 哪些缴费可以扣除？ | 养老保险、医疗保险、意外保险、Selbständigenvorsorge -- 所有组成部分 |
| 何时可以扣除？ | 在实际支付的年度扣除（缴费采用收付实现制） |
| Nachbemessung 补缴款是否也可以扣除？ | 可以 -- 在实际支付的年度扣除 |

---

## 第 7 节——特殊制度与并行活动

### Kleinstunternehmerregelung（小企业免税制度）

年营业额低于 EUR 35,000（增值税小企业免税）的客户：增值税 Kleinstunternehmerregelung 不影响 SVS 义务。社会保险以收入而非营业额为基础。即使免征增值税，SVS 缴费义务仍然完全适用。

### 同时受雇并参加 ASVG 保险（Differenzvorschreibung）

客户既受雇（ASVG），又从事自雇活动（GSVG）：合并缴费基数不得超过最高基数（EUR 7,070/月）。如果 ASVG 基数已经达到或超过最高基数，GSVG 养老保险缴费将减少或免除。医疗保险：客户可以选择 SVS 或 GKK 保障。意外保险始终需要单独缴纳。

### 退休后继续从事自雇活动

客户在领取 ASVG 养老金的同时继续从事自雇活动：仍须按 18.5% 向 GSVG 缴纳养老保险费，但会累积额外的养老金权益。医疗保险将切换为退休人员费率，或根据保障选择继续由 SVS 承保。在提供建议前，请向 SVS 确认其与养老金之间的相互影响。

---

## 第 8 节——边缘案例登记表

### EC1——前 3 年内的新参保人
**情况：** 客户于 18 个月前开始从事自雇活动，尚无以往的税务评定结果可供参考。
**处理：** 暂定基数 = 最低缴费基数（EUR 539.81/月）。每月缴费总额约为 EUR 147.93。必须提醒客户：一旦实际收入完成评定，将进行 Nachbemessung。如果实际收入较高，则需补缴一笔金额较大的款项。

### EC2——收入低于参保门槛（Neue Selbständige）
**情况：** 自由职业者通过自雇活动赚取了 EUR 4,000，且没有其他受雇工作。
**处理：** 对于没有其他保险保障的人员，该金额低于每年 EUR 6,221.28 的 Versicherungsgrenze。不会触发 GSVG 强制参保义务。但是，客户没有任何医疗或养老保险保障——请对此进行标记。

### EC3——选择提高暂定基数
**情况：** 客户知道本年度收入将远高于 3 年前。
**处理：** 客户可以向 SVS 申请自愿提高暂定缴费基数。这样可以避免日后产生大额 Nachbemessung。告知客户该选项，但应向 SVS 确认具体办理方式。

### EC4——多项活动
**情况：** 客户既持有 Gewerbeberechtigung，又有自由职业（Neue Selbständige）收入。
**处理：** 所有自雇收入均合并计入一个 GSVG 缴费基数。不存在双重参保义务。如果这些活动适用不同的社会保险制度（GSVG 与 FSVG），请进行标记。

### EC5——跨境欧洲经济区工作者
**情况：** 客户居住在奥地利，但在德国工作。
**处理：** 根据欧盟第 883/2004 号条例，通常只在一个成员国缴纳社会保险。如果客户在德国从事相当比例（25% 以上）的工作，则可能适用德国社会保险制度。需要确定 A1 证书的适用情况。提交审核人员处理。

---

## 第 9 节——审核人员升级处理规程

当某种情况需要审核人员作出专业判断时：

```
REVIEWER FLAG
Tier: T2
Client: [name]
Situation: [description]
Issue: [what is ambiguous]
Options: [possible treatments]
Recommended: [most likely correct treatment and why]
Action Required: Qualified Steuerberater must confirm before advising client.
```

当某种情况超出本技能的范围时：

```
ESCALATION REQUIRED
Tier: T3
Client: [name]
Situation: [description]
Issue: [outside skill scope]
Action Required: Do not advise. Refer to qualified Steuerberater. Document gap.
```

---

## 第 10 节——测试套件

### 测试 1——新参保者，最低缴费基数
**输入：** 自雇 Gewerbetreibender，第 1 年，无以往收入数据，35 岁。
**预期输出：** 每月：养老保险 EUR 99.87 + 健康保险 EUR 36.71 + 意外保险 EUR 11.35 + Vorsorge EUR 8.26 = EUR 156.19。每季度：EUR 468.57。

### 测试 2——已有经营记录的自雇人士，中等收入
**输入：** 上一年度收入 EUR 40,000，Gewerbetreibender，42 岁。
**预期输出：** 每月缴费基数 = EUR 40,000 / 12 = EUR 3,333.33。养老保险：EUR 616.67。健康保险：EUR 226.67。意外保险：EUR 11.35。Vorsorge：EUR 51.00。每月合计：EUR 905.69。每季度：EUR 2,717.07。

### 测试 3——高收入，适用最高缴费基数
**输入：** 上一年度收入 EUR 120,000，Gewerbetreibender，50 岁。
**预期输出：** 每月缴费基数上限为 EUR 7,070.00。养老保险：EUR 1,307.95。健康保险：EUR 480.76。意外保险：EUR 11.35。Vorsorge：EUR 108.17。每月合计：EUR 1,908.23。每季度：EUR 5,724.69。

### 测试 4——Neue Selbständige 低于门槛
**输入：** 自由职业收入 EUR 4,000，无其他受雇工作，28 岁。
**预期输出：** 低于 Versicherungsgrenze（EUR 6,221.28）。无 GSVG 参保义务。标记：客户没有社会保险保障。

### 测试 5——同时受雇
**输入：** ASVG 受雇缴费基数 EUR 5,000/月，自雇收入 EUR 30,000/年，38 岁。
**预期输出：** 合计缴费基数 = EUR 5,000 + EUR 2,500 = EUR 7,500，超过最高限额 EUR 7,070。GSVG 养老保险缴费基数降至 EUR 2,070/月（7,070 - 5,000）。养老保险：EUR 382.95。健康保险：按最低缴费基数或 GSVG 缴费基数计算。意外保险：EUR 11.35。

### 测试 6——Nachbemessung 情形
**输入：** 12 个月的暂定缴费基数均为最低缴费基数（EUR 539.81/月）。实际收入最终确定为 EUR 50,000。
**预期输出：** 已缴暂定养老保险费：EUR 99.87 x 12 = EUR 1,198.44。最终养老保险费：（EUR 4,166.67 x 18.5%）x 12 = EUR 9,250.00。仅养老保险的 Nachforderung：EUR 8,051.56。另加健康保险和 Vorsorge 调整额。

### 测试 7——选择加入 Krankengeld
**输入：** 已有经营记录的自雇人士，缴费基数 EUR 3,000/月，选择加入 Krankengeld。
**预期输出：** 健康保险费率 = 9.30%（6.80% + 2.50%）。每月健康保险费 = EUR 279.00（未选择加入时为 EUR 204.00）。额外成本：EUR 75.00/月。

---

## 免责声明

本技能及其输出仅用于提供信息和计算，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或结果承担责任。在申报或据此采取行动之前，所有输出均须由具备资质的专业人士（例如 CPA、EA、税务律师或您所在司法管辖区内具有同等资格的持牌执业人员）审核并签字确认。

此技能最新且经过验证的版本维护在 [openaccountants.com](https://openaccountants.com)。登录后即可访问最新版本、申请持证会计师的专业审核，并随着税法变化跟踪更新。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/at-svs-contributions) — 面向 AI 的开放税务指南，由具名的 CPAs/CAs/EAs 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_