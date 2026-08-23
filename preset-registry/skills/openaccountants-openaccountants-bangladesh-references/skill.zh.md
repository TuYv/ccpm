---
name: bangladesh-references
description: Primary source references and related open-source projects for this jurisdiction.
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: BD
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/bangladesh-references"
  obligation: OTHER
---
# 孟加拉国 — 相关开源项目

> **仅供一般参考。** 此技能是面向 AI 辅助工作流的通用税务/会计参考资料。尚未针对任何特定个人的事实、文件、选择、截止日期、居民身份、申报状态或当地程序进行审查。未经相关司法管辖区合格专业人士审核，请勿依赖此资料进行申报、缴税、修正申报或采取税务立场。

OpenAccountants 采用 AGPL-3.0 许可证。MPL-2.0、MIT 和 Apache-2.0 均为可用于参考和集成的兼容许可证。

## bd-income-tax-calculator

- 仓库：[ssi-anik/bd-income-tax-calculator](https://github.com/ssi-anik/bd-income-tax-calculator)
- 许可证：MPL-2.0
- 星标数：87
- 语言：JavaScript (React)
- 范围：孟加拉国个人所得税计算器，实现了 NBR 税率档次、工资组成部分免税规则（住房租金按 50% 免税但设有上限、医疗费用按 10% 免税但设有上限、交通补贴）、投资退税计算（根据收入水平分档采用 15%/12%/10%），以及基于纳税人类别的起征点（男性、女性、65 岁以上人士、残障人士、自由战士）。
- 重要性：GitHub 上星标数最多的孟加拉国专用税务计算器。实现了孟加拉国纳税人实际使用的 NBR 税率档次结构和免税逻辑。
- 集成方式：将税率档次、各纳税人类别的免税门槛、工资组成部分的免税限额以及投资退税逻辑直接纳入 OpenAccountants 技能。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/bangladesh-references) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草案**。如需始终保持最新的数据及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_