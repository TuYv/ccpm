---
name: australia-references
description: Primary source references and related open-source projects for this jurisdiction.
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AU
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/australia-references"
  obligation: OTHER
---
# 澳大利亚——相关开源项目

> **仅供一般参考。** 此技能是用于 AI 辅助工作流的一般税务/会计参考资料。它尚未针对任何特定个人的事实情况、文件、选择、截止日期、税务居民身份、申报状态或当地程序进行审核。在未经相关司法管辖区的合格专业人士审核的情况下，请勿依赖此资料进行申报、缴税、修正申报或采取税务立场。

OpenAccountants 采用 AGPL-3.0 许可证。采用 MIT、Apache-2.0、GPL-3.0 和 AGPL-3.0 许可证的内容均可在注明出处的情况下纳入。除非另有说明，以下项目的许可证均与之兼容。

## PolicyEngine Australia

- 代码仓库：[PolicyEngine/policyengine-au](https://github.com/PolicyEngine/policyengine-au)
- 许可证：AGPL-3.0
- 语言：英语
- 范围：完整的澳大利亚税收福利微观模拟模型，涵盖个人所得税、Medicare 税、HECS-HELP 还款门槛和养老金规则。
- 重要性：全面且积极维护的微观模拟项目，对澳大利亚税收和转移支付政策进行了详细建模。可作为个人所得税税级、税收抵免和税费计算的可靠验证来源。
- 集成方式：
  - AGPL-3.0 与 OpenAccountants 属于同一许可证系列。可在注明出处的情况下纳入其内容。
  - 将其用作所得税税级、Medicare 附加税门槛、HECS-HELP 还款率和养老金缴款上限的验证参考。

## Aussie Tax Helper

- 代码仓库：[kazimurtaza/aussie-tax-helper](https://github.com/kazimurtaza/aussie-tax-helper)
- 许可证：Apache-2.0
- 星标数：6
- 语言：英语
- 范围：ATO 2024-25 纳税年度税款计算器，包含居家办公扣除方式比较（固定费率法与实际成本法）。
- 重要性：重点关注居家办公扣除方式，这是个人申报者的常见难点。Apache-2.0 许可证与之兼容。
- 集成方式：
  - 可作为居家办公扣除逻辑和 ATO 费率表的参考。
  - Apache-2.0 允许在注明出处的情况下纳入内容。

## Quick Tax Calc

- 代码仓库：[zorfling/quick-tax-calc](https://github.com/zorfling/quick-tax-calc)
- 许可证：复用前请核实
- 语言：英语
- 范围：ATO 个人税率计算器。
- 重要性：可作为澳大利亚个人所得税税率表的轻量级参考。
- 集成方式：
  - 可用于参考税级计算，并依据 ATO 发布的税率表验证税率。
  - 在确认许可证之前，仅将其用作参考。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/australia-references)——面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草稿**。如需始终保持最新的数据和具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_