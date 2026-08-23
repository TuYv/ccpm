---
name: argentina-references
description: Primary source references and related open-source projects for this jurisdiction.
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AR
  category: tax
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/argentina-references"
  obligation: OTHER
---
# 阿根廷 — 相关开源项目

> **仅供一般参考。** 此技能是面向 AI 辅助工作流的通用税务/会计参考资料。它尚未针对任何特定个人的事实、文件、税务选择、截止日期、税务居民身份、申报状态或当地程序进行审核。在相关司法管辖区的合格专业人士审核之前，请勿依赖此资料进行申报、缴税、修正申报或采取任何税务立场。

OpenAccountants 采用 AGPL-3.0 许可证。AGPL-3.0 与 LGPL-3.0 许可证兼容。以下项目可在注明出处的情况下整合使用。

## pyafipws

- 代码仓库：[reingart/pyafipws](https://github.com/reingart/pyafipws)
- 许可证：LGPL-3.0
- Star 数：353
- 语言：Python
- 范围：AFIP 电子发票及其他 Web 服务。面向阿根廷政府 Web 服务的接口、工具和应用程序（SOAP、COM/DLL、PDF、DBF、XML、JSON）。权威的阿根廷开源电子发票库。
- 集成：LGPL-3.0 — 兼容。其 AFIP Web 服务集成模式、电子发票生成逻辑和身份验证流程可直接复用于阿根廷税务合规自动化。

## PyARCA

- 代码仓库：[GeraCollante/PyARCA](https://github.com/GeraCollante/PyARCA)
- 许可证：LGPL-3.0
- Star 数：9
- 语言：Python
- 范围：用于 Monotributo 电子开票的 CLI（ARCA/原 AFIP）。这是 pyafipws 的一个分支，专注于 Monotributo 开票。
- 集成：LGPL-3.0 — 兼容。可作为 Monotributo 特定开票工作流以及 ARCA（原 AFIP）API 交互的参考。有助于验证 Monotributo 合规逻辑。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/argentina-references) — 面向 AI 的开放税务指南，由具名的 CPA/CA/EA 审核。质量：**引用来源的草稿**。如需始终保持最新的数据以及具名会计师的专业支持，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_