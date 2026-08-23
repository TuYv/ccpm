---
name: banking-sector
description: "> Use this skill whenever a bank, neobank, payment institution, e-money institution, or regulated financial holding company asks about accounting, regulatory capital, or tax issues specific to financial institutions. Trigger on phrases like \"bank tax\", \"bank levy\", \"IRB approach\", \"standardised approach\", \"IFRS 9 ECL\", \"FRTB\", \"Basel III\", \"Basel IV\", \"CRR/CRD\", \"Prudential regulation\", \"PRA\", \"ECB SSM\", \"FED CCAR\", \"OSFI\", \"expected credit loss\", \"ICAAP\", \"ILAAP\", \"stress testing\", \"interchange fee\", \"MREL\", \"TLAC\", \"resolution planning\", \"deposit guarantee scheme contribution\", or any question about bank accounting / tax / regulation. Covers IFRS 9 ECL, capital adequacy interactions with tax (DTA recognition), bank levies (UK, EU), specific tax rules for banks (FTT, securitisation, hedge accounting). Does NOT cover: detailed banking regulation (CRR/CRD specifics, FRTB calibration); audit of banks (see statutory-audit-workflow-base); routine corporate tax (see corporate-income-tax-workflow-base)."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: GLOBAL
  category: vertical
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/banking-sector"
  obligation: VERT
---
# 银行业税务与会计 v0.1

> **仅供一般参考。** 本技能是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的事实情况、文件、税务选择、截止日期、税收居民身份、申报身份或当地程序进行审核。在相关司法管辖区的合格专业人士审核之前，请勿依赖本技能进行申报、缴税、修正申报或采取税务立场。

## 本文件的用途

适用于银行、数字银行、支付机构、电子货币机构和受监管金融控股公司的行业补充模块。与所在国家/地区的企业所得税技能一同加载，用于处理银行业特有事项。

---

## 第 1 节 — 范围

本技能涵盖：

- **IFRS 9 / ASC 326 ECL** 计算及其税务影响
- **银行税费**（英国银行税、欧盟单一处置基金 / 存款担保计划缴款、意大利 IRPS、德国银行税、法国信贷机构缴款）
- **资本充足率与税务的相互影响** — 巴塞尔协议 III 下的 DTA 确认；分阶段实施的审慎过滤规则
- **行业特定税务事项**：
  - 利息收入 / 费用确认（实际利率法）
  - 贷款发起费递延
  - 证券化税务处理（SPV 合并、穿透处理）
  - 资金管理 / 套期会计与税务
  - 交换费和商户服务收入
  - 交易账簿与银行账簿的分类
- **各国特定银行税费**：
  - 英国银行税（Finance Act 2011 Sch 19）— 应税银行资产负债表权益和负债的 0.10%
  - 英国银行公司税附加税 — 对超过 GBP 100m 的银行利润额外征收 3% 的公司税（2023 年 4 月由 8% 降至 3%）
  - 美国 BEAT（税基侵蚀与反滥用税）— 银行适用 BEAT 的收入门槛较低
  - 美国 §163(j) 利息扣除限制补充规则
  - 意大利 IRES + IRAP 银行业规则

本技能不涵盖：

- **巴塞尔协议 III/IV 的详细参数校准**，但高层次关联除外
- **金融服务的日常增值税处理**（请参阅包含银行业例外规定的各国增值税技能）
- **MiFID / 消费者保护合规**
- **反洗钱运营合规**
- **CRD/CRR/PRA 特定报告**

---

## 第 2 节 — 主要行业会计差异（IFRS 9 与 ASC 326）

**[T1] 有关基础差异目录，请参阅 `ifrs-local-gaap-reconciliation.md`。**

具体到银行业：

| 项目 | IFRS 9 | ASC 326 (CECL) |
|---|---|---|
| 损失模型 | 三阶段预期信用损失 | 当前预期信用损失 — 自初始确认起计提整个存续期 ECL |
| 第 1 日损失准备 | 仅计提 12 个月 ECL | 整个存续期 ECL（通常更高） |
| 信用风险显著增加（SICR） | 阈值（通常采用逾期 30 天的可反驳推定，并结合定性因素） | CECL 中不适用，但用于监控 |
| 购入或源生的已发生信用减值（POCI） | 实际利率基于整个存续期预期现金流确定；后续 ECL 变动计入损益 | ASU 2022-02 使 POCI 处理趋于一致 |
| 资产负债表外项目（贷款承诺、财务担保） | 基于阶段划分的 ECL | CECL |

---

## 第 3 节 — 贷款损失准备金的税务处理

**[T1] 按司法管辖区（示例）：**

| 国家 | 处理方式 |
|---|---|
| **美国** | 根据 §585，贷款损失准备金仅允许小型银行（资产 ≤ USD 500m）税前扣除；非储蓄银行采用特定核销法（§166）。ASC 326 CECL 会计处理与税务处理并非一一对应。 |
| **英国** | 一般准备金不得扣除；如果专项准备金与可识别的损失事件相关联并符合 HMRC 商业性测试，则可以扣除。IFRS 9 第 3 阶段准备金通常可以扣除；第 1/2 阶段准备金通常不得扣除 |
| **德国** | Allgemeine Risikovorsorge 受到限制；当 spezifische Wertberichtigungen 属于“客观必要”时可以扣除——税前调整 |
| **法国** | 如果损失很可能发生且可量化，Provisions pour dépréciation 通常可以扣除 |
| **意大利** | 银行业贷款损失准备金按既定时间表扣除（历史上第 1 年可扣除账面金额的 18%；现已改革，以与 IRES 处理方式保持一致） |
| **澳大利亚** | 专项损失准备金可以扣除；一般准备金不得扣除 |
| **加拿大** | 专项准备金可以扣除；一般准备金不得扣除 |
| **印度** | 专项准备金仅可在 RBI 规定的范围内扣除；坏账核销可以扣除 |

**[T1]** 重大的账面与税务差异会使银行产生大量递延所得税资产（DTAs）。根据 IAS 12 / ASC 740 进行的可收回性评估至关重要——第二支柱会产生相互影响，因为 DTAs 可能会根据 5 年规则转回。

---

## 第 4 节 — 银行税和附加税

### 4.1 英国银行税 + 银行附加税

**[T1] 英国银行税**（Finance Act 2011 Schedule 19）：
- 税率：应税资产负债表权益和负债的 **0.10%**（根据 FA 2017，税率分阶段从 0.21% 降至 0.10%）
- 长期融资适用半税率（0.05%）
- 最低豁免门槛：资产负债表规模 GBP 20bn
- 申报：提交 HMRC 银行税申报表，截止日期为期间结束后 9 个月零 1 天

**[T1] 英国银行公司税附加税**（FA 2015 s.17，经 FA 2022 修订）：
- 税率：对超过 GBP 100m 的银行利润征收 **3%**（自 2023 年 4 月 1 日起从 8% 下调）
- 在标准 25% 公司税之外额外征收
- 超过门槛的银行利润适用的实际税率：28%

### 4.2 欧盟单一处置基金（SRF）缴款

**[T1]** 根据 Regulation (EU) 806/2014，每年预先缴款，为银行处置提供资金；缴款额由 Single Resolution Board 根据负债计算。目标水平：在 SRF 到期时（2024 年）达到受保存款的 1%。这与各国存款担保计划（DGS）缴款不同。

### 4.3 欧盟成员国银行税

| 国家 | 税率 | 计税基础 |
|---|---|---|
| **德国** | 每年 EUR 410-1.6bn，在各银行之间分摊 | 风险加权负债——Bankenabgabe |
| **法国** | Contribution sur les établissements de crédit 已改革；并入 SRF + 国家补充机制 | 风险加权敞口 |
| **意大利** | Imposta straordinaria 2023（对特定净利息收益征收 40%）——在 ECB 表示反对后改为可选择计提准备金 | 净利息收入超额部分 |
| **西班牙** | 对净利息 + 佣金征收 4.8%（2023-2025 年特别税；针对“意外之财”的税项） | 超过 EUR 800m 门槛的西班牙来源银行业总收入 |
| **匈牙利** | 银行税——按资产负债表门槛适用 0.15% / 0.20% | 负债 |
| **瑞典** | 银行税——对负债征收 6%；2024 年下调 | 负债总额 |
| **比利时** | 对负债征收银行税 | 负债 |
| **荷兰** | Bankenbelasting——短期负债税率为 0.044% / 长期负债税率为 0.022% | 负债 |
| **波兰** | 银行税为每月 0.0366%（每年 0.44%） | 超过 PLN 4bn 门槛的资产部分 |

### 4.4 存款保证计划（DGS）缴款

**[T1]** 欧盟指令 2014/49/EU。各国 DGS 基金由成员银行的事前和事后缴款提供资金。

---

## 第 5 节 — DTA 与支柱二的相互作用

**[T1]** 银行通常因以下项目持有重大 DTA：
- IFRS 9 ECL（会计确认早于税务确认）
- 养老金义务（会计计提早于税务确认）
- 递延薪酬
- 经营亏损结转
- 证券化损失

**[T1] 巴塞尔协议 III 审慎过滤器**（根据 CRR 第 36(1)(c) 条）：
- 依赖未来盈利能力的 DTA，超过 10% 阈值的部分必须从 CET1 中扣除（与其他扣除项合并计算）
- 因暂时性差异产生且按递延税率 15% 以上计税的 DTA 通常受到的限制较少

**[T2] 支柱二的相互作用：**
- DTA / DTL 按法定税率与 15% 中的较低者重新计量（参见 `pillar-two-globe-minimum-tax.md`）
- 5 年期 DTL 转回规则可能加回贷款损失 DTL 的转回额
- 对于在低税率辖区拥有重大亏损结转的银行，ETR 可能低于 15%

---

## 第 6 节 — 行业特定问题

### 6.1 交易账簿与银行账簿

**[T1]** 交易账簿头寸：
- IFRS 9：通常为 FVPL（持有以供交易）
- 税务：大多数辖区对银行交易账簿的按市值计价收益征税（UK FA 2002 Sch 26；美国 §475 针对交易商的按市值计价选择）

银行账簿头寸：
- IFRS 9：摊余成本或 FVOCI
- 税务：通常采用已实现基础

### 6.2 套期会计与税务

**[T1]** IFRS 9 / ASC 815 套期会计可降低损益波动，但会产生税务时间性差异：
- 现金流量套期：递延计入 OCI，并在确认被套期项目时重分类至损益——税务遵循损益确认时点
- 公允价值套期：立即在损益中抵销——税务通常遵循该处理

### 6.3 证券化

**[T1]** 税务处理取决于合并范围和风险转移：
- 真实出售 + 非合并 SPV：确认出售损益，不再对 SPV 收入征收银行层面的税款
- 合成型 / 风险保留：继续在银行层面对基础贷款征税
- IFRS 10 / ASC 810 可能与监管合并要求不同
- 与美国 §163(j) 利息扣除限制的相互作用

### 6.4 交换费与商户服务

银行卡交换费收入属于服务收入，适用标准 CIT。商户折扣率（MDR）流向处理机构 / 银行。各国针对“金融服务”的特定 VAT 豁免通常涵盖交换费。

### 6.5 信用估值调整（CVA）

税务处理各不相同——部分辖区允许扣除 CVA 损益波动；其他辖区则要求加回因交易对手风险产生的公允价值损失。

---

## 第 7 节 — 自检

- [ ] IFRS 9 ECL 计算已根据各辖区规则与税前可扣除拨备进行核对
- [ ] 如达到辖区规定的阈值，已适用银行税 / 附加税
- [ ] 已根据 IAS 12 / ASC 740，结合银行特定的收益预测评估 DTA 的可收回性
- [ ] 已对 Basel III 审慎过滤器下的 CET1 扣除进行建模
- [ ] 支柱二 ETR 分析已纳入贷款损失 DTA 暂时性差异
- [ ] 已确认交易账簿与银行账簿的分类，以进行税务计价
- [ ] 已识别套期会计的时间性差异
- [ ] 已确认证券化在税务上的真实出售与风险保留状况
- [ ] 已按辖区确认 DGS / SRF 缴款的可扣除性
- [ ] 输出已标记每个 [T2]/[T3] 项目，以供复核人员判断

---

## 第 8 节 — 免责声明

本技能生成供持有资质的银行业专业人士审核的工作底稿。银行会计、监管和税务均具有高度专业性。在进行任何申报或资本报告之前，每项输出都必须由持有资质的专业人士（通常为四大会计师事务所的银行业专家、内部税务主管或审计合伙人）审核并签字批准。

本技能最新且经过验证的版本维护于 [openaccountants.com](https://openaccountants.com)。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/banking-sector) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草稿**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_