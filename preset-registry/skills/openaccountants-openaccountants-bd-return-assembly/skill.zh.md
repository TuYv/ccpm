---
name: bd-return-assembly
description: "> Final orchestrator that assembles the complete Bangladesh filing package for a Bangladesh-resident self-employed person. Trigger on phrases like \"assemble my Bangladesh return\", \"what do I file NBR\", \"file my e-Return Bangladesh\", \"Bangladesh freelancer filing\", \"Tax Day Bangladesh\". Consumes outputs from bd-it-freelancer-tax / bangladesh-pit, bangladesh-vat, and bd-social-contributions, and produces the filing checklist, forms, and deadlines. Computes nothing itself."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: BD
  category: orchestrator
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/bd-return-assembly"
  tax_year: 2026
  obligation: ORCH
---
# 孟加拉国申报表汇编 — 编排器 v0.1

> **仅供一般参考。** 本技能是用于 AI 辅助工作流程的一般税务/会计参考材料。尚未针对任何特定个人的事实、文件、税务选择、截止日期、居民身份、申报身份或当地程序进行审查。未经相关司法管辖区的合格专业人士审核，请勿依赖本技能进行申报、缴税、修正申报或采取税务立场。

## 本文件的用途
面向孟加拉国居民自由职业者/独资经营者的最终汇编技能。它按顺序组织上游技能、选择表格，并通过 NBR e-Return 生成一份统一的申报前资料包。它不执行任何计算。

## 第 1 节 — 需要申报的项目
| 项目 | 申报地点 | 时间（需核实） |
|---|---|---|
| 个人所得税申报表（e-Return） | NBR — etaxnbr.gov.bd | **纳税日**之前（个人通常为 11 月 30 日） |
| 最低税额 | 随申报表一并提交 | TIN 持有人超过门槛时（根据所在地为 ৳3,000–৳5,000） |
| VAT 申报表（Mushak-9.1） | NBR（如已注册 VAT） | 每月 |
| 出口现金奖励申请 | 通过银行 | 汇款时 |

## 第 2 节 — 汇编顺序
1. **信息采集**（bd-freelance-intake）→ 确认出口与境内业务、TIN、VAT、居民身份。
2. **计税基础** → bd-it-freelancer-tax（出口收入，自 2024 年 6 月后开始征税）和/或 bangladesh-pit（税率档次、投资退税）。
3. **VAT** → 如已注册，则使用 bangladesh-vat。
4. **社会保障** → bd-social-contributions（自愿参加 Universal Pension；通常没有强制缴费）。
5. **核对**汇款（结汇证明）与申报收入；收集 TDS 证明以抵免税额；应用投资退税。
6. **申报**：在纳税日之前通过 etaxnbr.gov.bd 提交 e-Return。

## 第 3 节 — 申报前检查清单
- [ ] 出口收入已与银行结汇证明匹配
- [ ] 境内收入适用正确的税率档次；费用已有凭证
- [ ] 已申请投资退税
- [ ] 已申请 TDS 抵免；已考虑最低税额
- [ ] 已提交 VAT 申报表（如已注册）
- [ ] 已在纳税日之前提交 e-Return

## 第 10 节 — 禁止事项
- 计算出口收入时，绝不假定已经失效的 IT/ITES 免税政策仍然适用。
- 对于超过门槛的 TIN 持有人，绝不遗漏最低税额。
- 未核实当前 NBR 日历前，绝不将纳税日/门槛表述为最终信息。

## 免责声明
仅供参考；不构成建议。请向 NBR 核实表格和截止日期。所有输出在申报前都必须由合格的孟加拉国税务从业人员审核并签字确认。维护于 [openaccountants.com](https://openaccountants.com)。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/bd-return-assembly) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_