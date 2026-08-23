---
name: bd-freelance-intake
description: "ALWAYS USE THIS SKILL when a user asks for help with their Bangladesh taxes AND mentions freelancing, self-employment, sole proprietorship, IT/ITES exports, or being a business individual in Bangladesh. Trigger on phrases like \"help me with my Bangladesh taxes\", \"I'm a freelancer in Bangladesh\", \"I do IT export from Bangladesh\", \"file my NBR return\", \"I'm self-employed in Bangladesh\". REQUIRED entry point for the Bangladesh self-employed workflow — downstream skills (bd-it-freelancer-tax, bangladesh-pit, bd-social-contributions, bangladesh-vat, bd-return-assembly) depend on it. Upload-first; Bangladesh-resident individuals only."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: BD
  category: orchestrator
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/bd-freelance-intake"
  tax_year: 2026
  obligation: ORCH
---
# 孟加拉国自雇人士信息采集——编排器 v0.1

> **仅供一般参考。** 此技能是用于 AI 辅助工作流的一般税务/会计参考资料。尚未针对任何特定个人的事实、文件、税务选择、截止日期、居民身份、申报状态或当地程序进行审核。在未经相关司法管辖区合格专业人士审核的情况下，请勿依赖此技能进行申报、缴税、修正申报或采取税务立场。

## 此文件的用途
面向孟加拉国居民自雇人士（自由职业者、IT/ITES 出口服务提供者、独资经营者）的信息采集编排器。收集事实、解析文件、进行确认，并移交结构化资料包。不进行任何计算。

## 第 1 步——排除性检查（正确分流）
1. **收入来自外国客户（IT/ITES 出口）还是境内收入？** → bd-it-freelancer-tax 与 bangladesh-pit。
2. **收入是否高于免税门槛（约 ৳350,000）？** → 是否需要提交申报表/缴税（如果你拥有 TIN 且达到相关门槛，仍可能适用最低税额）。
3. **你是否拥有 TIN / 是否提交 e-Return？** → 登记状态。
4. **是否已登记 VAT / 营业额是否超过 VAT 门槛？** → bangladesh-vat。
5. **本年度是否为居民（≥182 天，或 90 天 + 过去 4 年内累计 365 天）？** → 非居民情况需升级处理。

未回答时的默认值：孟加拉国居民独资经营者，假定 IT/ITES 收入目前应税（2024 年 6 月之后），建议申请 TIN 并使用 e-Return。

## 第 2 步——收集
- 完整纳税年度（7 月 1 日至 6 月 30 日）的银行对账单，包括境外汇款。
- 平台对账单（Upwork/Fiverr/直接开具的发票）；汇款证明/现金奖励记录。
- TIN、以往的 e-Return、营业执照。

## 第 3 步——推断并确认
- 将**出口收入**（通过银行渠道汇入的款项 → bd-it-freelancer-tax）与**境内收入**（→ bangladesh-pit）分开。
- 记录汇款所涉及的任何 ICT/ITES **现金奖励**。
- 确认 VAT 纳税义务和最低税额情况。

## 第 4 步——移交
- **IT/自由职业出口服务提供者：** bd-it-freelancer-tax + bangladesh-pit（税率档次）→ bd-return-assembly。
- **境内企业：** bangladesh-pit + bangladesh-vat（如已登记）+ bd-social-contributions（自愿养老金）→ bd-return-assembly。

## 免责声明
仅用于信息采集；不计算任何税款。所有下游输出在申报前都必须由合格的孟加拉国税务专业人士审核并签字批准。由 [openaccountants.com](https://openaccountants.com) 维护。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/bd-freelance-intake)——面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据以及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_