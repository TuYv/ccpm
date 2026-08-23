---
name: australia-financial-statements
description: "> Use this skill when preparing, reviewing, or advising on annual financial statements for an Australian company. Trigger on phrases like \"ASIC financial report\", \"AASB\", \"Australian Accounting Standards\", \"general purpose financial statements\", \"special purpose financial statements\", \"large proprietary company\", \"small proprietary company\", \"directors' report Australia\", \"audit Australia\", \"Form 388\", \"Corporations Act 2001 reporting\", or any question about preparing and filing statutory accounts under the Corporations Act 2001. Covers AASB frameworks, size thresholds (large/small proprietary), required statements, formats, notes, lodgement deadlines, and audit requirements."
license: AGPL-3.0-or-later (code) / OpenAccountants Guide License v1.0 (content)
metadata:
  source: openaccountants
  jurisdiction: AU
  category: financial-statements
  quality: source-cited draft
  openaccountants_url: "https://openaccountants.com/skills/australia-financial-statements"
  obligation: FS
---
# 澳大利亚财务报表 Skill v1.0

> **仅供一般参考。** 本 Skill 是用于 AI 辅助工作流的一般税务/会计参考资料。其内容尚未针对任何特定个人的事实、文件、选择、截止日期、居民身份、申报状态或当地程序进行审查。未经相关司法管辖区的合格专业人士审核，请勿依赖本 Skill 进行申报、缴款、修正申报或采取税务立场。

---

## 第 1 节 -- 快速参考

| 字段 | 值 |
|---|---|
| 国家 | 澳大利亚（澳大利亚联邦） |
| 货币 | AUD |
| 申报主管机构 | 澳大利亚证券和投资委员会（ASIC） |
| 主要法律 | Corporations Act 2001 (Cth)，Chapter 2M |
| 配套法律 | Corporations Regulations 2001；ASIC 监管指南 |
| 会计准则 | 澳大利亚会计准则（AASB）— 实质上等同于 IFRS |
| 财政年度 | 通常为 7 月 1 日至 6 月 30 日；允许采用任意 12 个月期间 |
| 报送截止日期 | 年末后 4 个月（一般情况）；3 个月（披露实体） |
| 逾期报送罚款 | 民事处罚；ASIC 可处以每日最高 AUD 1,110 的罚款 |
| 数字化申报 | ASIC Regulatory Portal（在线报送 Form 388） |

---

## 第 2 节 -- 报告框架

| 实体类型 | 适用准则 |
|---|---|
| 上市实体/披露实体 | 完整 AASB（Tier 1 — 等同于 IFRS） |
| 大型专有公司 | AASB（Tier 1 或 Tier 2 — 简化披露） |
| 小型专有公司（需报告） | AASB（通常为 Tier 2 — 简化披露） |
| 小型专有公司（无需报告） | 通常无公开报告义务 |
| 公众公司 | AASB（Tier 1 或 Tier 2） |
| 非营利组织（大型） | AASB，并适用非营利组织专用条款 |

### AASB 层级体系

- **Tier 1**：完整采用 IFRS 的确认、计量和披露要求（AASB 101–AASB 17）
- **Tier 2 — 简化披露**：确认和计量要求与 Tier 1 相同，但减少披露要求（AASB 1060）

---

## 第 3 节 -- 规模门槛

### 大型专有公司（s.45A Corporations Act）

如果一家专有公司在某个财政年度至少满足以下 **3 项中的 2 项**，则该公司在该财政年度属于**大型**公司：

| 标准 | 门槛（自 2019 年 7 月 1 日起） |
|---|---|
| 合并收入 | ≥ AUD 50,000,000 |
| 合并资产总额（年末） | ≥ AUD 25,000,000 |
| 员工人数（年末） | ≥ 100 |

如果满足的标准少于 2 项 → **小型**专有公司。

### 按实体类型划分的报告义务

| 实体 | 是否必须编制财务报告？ | 是否必须向 ASIC 报送？ | 是否必须审计？ |
|---|---|---|---|
| 大型专有公司 | 是 | 是（Form 388） | 是 |
| 小型专有公司（一般情况） | 否（除非被要求） | 否 | 否 |
| 小型专有公司（受外国控制） | 是 | 是 | 是 |
| 小型专有公司（拥有 CSF 股东） | 是 | 是 | 是（或审阅） |
| 公众公司 | 是 | 是 | 是 |
| 披露实体 | 是 | 是 | 是 |

---

## 第 4 节 -- 必需的财务报表

根据 s.295 和 s.296 Corporations Act 以及 AASB 准则：

| 文件 | 第 1 层级（完整 AASB） | 第 2 层级（简化） |
|---|---|---|
| 财务状况表（资产负债表） | 必需 | 必需 |
| 损益及其他综合收益表 | 必需 | 必需 |
| 权益变动表 | 必需 | 必需 |
| 现金流量表 | 必需 | 必需 |
| 财务报表附注 | 必需（完整 IFRS） | 必需（精简披露 — AASB 1060） |
| 董事报告（s.298–300） | 必需 | 必需 |
| 董事声明（s.295(4)） | 必需 | 必需 |
| 审计报告 | 必需 | 必需 |

---

## 第 5 节——年末调整清单

| # | 调整事项 | 澳大利亚特定说明 |
|---|---|---|
| 1 | 折旧 | AASB 116；系统性分摊；每年复核使用寿命和残值 |
| 2 | 预计负债 | AASB 137；现时义务、很可能导致资源流出、能够可靠估计 |
| 3 | 职工福利 | AASB 119；年假、长期服务假（服务年限不足 7 年的长期服务假采用概率加权法） |
| 4 | 减值 | AASB 136；将账面金额与可收回金额进行比较 |
| 5 | 预期信用损失 | AASB 9；对应收账款采用简化方法（整个存续期 ECL） |
| 6 | 存货 | AASB 102；按成本（FIFO/加权平均法）与 NRV 孰低计量；不得使用 LIFO |
| 7 | 递延所得税 | AASB 112；暂时性差异；公司税率为 25%（基础税率实体）或 30% |
| 8 | 租赁会计 | AASB 16；使用权资产 + 租赁负债（短期/低价值租赁可豁免） |
| 9 | 收入确认 | AASB 15；五步法模型；履约义务 |
| 10 | 金融工具 | AASB 9；分类和计量；套期会计 |
| 11 | 外币 | AASB 121；货币性项目按期末汇率折算 |
| 12 | 政府补助 | AASB 120；在能够合理保证满足相关条件时确认 |

---

## 第 6 节——损益表格式

AASB 101 允许按性质或职能进行分类。按职能分类（企业最常用）：

```
Revenue
Cost of sales
  ─── Gross profit ───
Other income
Distribution expenses
Administrative expenses
Other expenses
  ─── Operating profit ───
Finance income
Finance costs
Share of profit of associates/JVs
  ─── Profit before income tax ───
Income tax expense
  ─── Profit from continuing operations ───
Profit from discontinued operations (net of tax)
  ─── Profit for the year ───

Other comprehensive income:
  Items that will not be reclassified to profit or loss
  Items that may be reclassified to profit or loss
  ─── Total comprehensive income for the year ───
```

---

## 第 7 节——财务状况表格式

AASB 101 — 流动/非流动划分：

```
ASSETS

Current assets
  Cash and cash equivalents
  Trade and other receivables
  Inventories
  Current tax assets
  Other current assets

Non-current assets
  Property, plant and equipment
  Right-of-use assets
  Investment properties
  Intangible assets
  Goodwill
  Investments in associates
  Deferred tax assets
  Other non-current assets

Total assets

─────────────────────────────────────

LIABILITIES

Current liabilities
  Trade and other payables
  Borrowings (current portion)
  Lease liabilities (current)
  Current tax liabilities
  Provisions (current)
  Other current liabilities

Non-current liabilities
  Borrowings
  Lease liabilities
  Deferred tax liabilities
  Provisions (non-current)
  Other non-current liabilities

Total liabilities

─────────────────────────────────────

NET ASSETS

EQUITY
  Issued capital
  Reserves
  Retained earnings
Total equity
```

---

## 第 8 节——财务报表附注

| # | 披露事项 | 第 1 层级（完整） | 第 2 层级（简化） |
|---|---|---|---|
| 1 | 编制基础和会计政策 | 必须（AASB 101） | 必须（AASB 1060） |
| 2 | 收入分解 | 必须（AASB 15） | 简化 |
| 3 | 员工福利 | 必须（AASB 119） | 简化 |
| 4 | 所得税 | 必须（AASB 112） | 简化 |
| 5 | 不动产、厂房和设备 | 必须（AASB 116） | 简化 |
| 6 | 租赁 | 必须（AASB 16） | 简化 |
| 7 | 金融工具 | 必须（AASB 7） | 大幅简化 |
| 8 | 关联方交易 | 必须（AASB 124） | 必须 |
| 9 | 或有事项和承诺 | 必须（AASB 137） | 必须 |
| 10 | 资产负债表日后事项 | 必须（AASB 110） | 必须 |
| 11 | 关键管理人员薪酬 | 必须（AASB 124） | 必须 |
| 12 | 分部信息 | 必须（AASB 8）——仅限上市实体 | 无须披露 |

---

## 第 9 节——申报（提交）要求

| 项目 | 详情 |
|---|---|
| 申报机构 | ASIC |
| 申报表格 | Form 388（财务报表和报告副本） |
| 提交方式 | ASIC Regulatory Portal（在线） |
| 截止日期——披露实体 | 财政年度结束后 3 个月 |
| 截止日期——所有其他实体 | 财政年度结束后 4 个月 |
| 提交的文件 | 财务报告 + 董事报告 + 审计师报告 |
| 费用 | 提交 Form 388 无须缴费 |
| 逾期提交 | 适用民事处罚规定；ASIC 可实施行政处罚 |
| 年度审核费 | 与提交费用分开收取（专有公司为 AUD 310，2024 年） |
| 延期 | 可根据 s.340 向 ASIC 提交申请 |

### 小型专有公司——必须提交的例外情形

- 受外国控制（s.292(2)(b)）
- ASIC 指示（s.294）
- 股东指示（≥5% 表决权，s.293）
- 拥有 CSF 股东（s.292(2)(c)）

---

## 第 10 节——审计要求

| 类别 | 要求 |
|---|---|
| 大型专有公司 | 强制审计 |
| 小型专有公司（一般） | 无须审计 |
| 小型专有公司（受外国控制） | 必须审计（除非获得 ASIC 豁免） |
| 公众公司 | 强制审计 |
| 披露实体 | 强制审计 |
| 注册计划 | 强制审计 |
| 小型专有公司（拥有 CSF 股东） | 审计或审阅（s.292） |

### ASIC 豁免文书

- **ASIC Corporations (Audit Relief) Instrument 2016/784**：如果外国母公司的合并账目已提交，则允许由该外国母公司控制的某些大型专有公司获得审计豁免
- **ASIC Corporations (Foreign-Controlled Company Reports) Instrument 2017/204**：为某些受外国控制的小型专有公司提供豁免

### 审计师资格

根据《公司法》Part 9.2 注册的公司审计师（在 ASIC 注册）。对于披露实体的审计，审计师必须满足 Part 2M.4 Division 3 规定的额外独立性要求。

---

## 免责声明

本技能及其输出仅供信息和计算用途，不构成税务、法律或财务建议。Open Accountants 及其贡献者不对因使用本技能而产生的任何错误、遗漏或后果承担责任。所有输出在提交或据此采取行动之前，都必须由具备资质的专业人士审核并签字批准。

---

_来源：[OpenAccountants](https://openaccountants.com/skills/australia-financial-statements) — 面向 AI 的开放税务指南，由具名的注册会计师（CPA/CA）和注册税务师（EA）审核。质量：**引用来源的草稿**。如需始终保持最新的数据和具名会计师背书，请连接 OpenAccountants MCP 服务器（`openaccountants-mcp`）。_