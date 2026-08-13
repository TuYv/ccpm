---
name: vertical-construction
description: Domain knowledge for the construction vertical (contractors, field crews) so architect and pm don't spec construction products naively. Covers the vocabulary (bid vs estimate, takeoff, retainage, change order, AIA G702/G703, lien waiver, draw schedule), the non-obvious money rules that incumbents like Procore price out of reach for small contractors, what a naive build gets wrong (no assemblies, ignored retainage, ungated sub payments), and the entities that must be modelled. Applied by architect when writing ARCH-{slug}.md and by pm when writing PLAN-{slug}.md for any of the four construction products (bid-builder, project-mgmt, subcontractor-portal, field-docs).
when_to_use: |
  Apply when:
  - architect writes ARCH-{slug}.md for a construction product (bid-builder,
    project-mgmt, subcontractor-portal, field-docs)
  - pm decomposes a construction feature into PLAN-{slug}.md tasks
  - design-advisor wireframes a construction screen (estimate, billing, sub payment, daily log)
  - any spec touches money flow (billing, payment, retainage) in the construction vertical
  Do NOT apply to non-construction verticals — the money rules (retainage, lien waivers,
  AIA pay apps) are construction-specific and will mislead elsewhere.
effort: low
allowed-tools: Read, Write, Grep, Glob
paths:
  - "docs/architecture/**"
  - "docs/plans/**"
  - "docs/design/**"
---
# 垂直领域：建筑施工——不要凭直觉编写规格

建筑施工具有其独特的资金运作规律。如果规格把承包商的计费当作 SaaS 发票来处理，
最终交付的产品将没有任何承包商能够使用，因为它忽略的现金流问题（扣留保留金、
按工程价值明细表申请进度款、分包商付款以留置权放弃书为前提）恰恰是承包商试图
管理的核心问题。本技能为 architect 和 pm 提供相关术语和那些不显而易见的规则，
确保这四种建筑施工产品的规格基于领域实际，而非直觉。

四种产品及其现有竞争对手：

| 产品 | 原型 | 切入点所针对的产品 |
|---|---|---|
| bid-builder | marketplace-lite | Excel（小型承包商使用电子表格进行估算） |
| project-mgmt | crud | Buildertrend、Contractor Foreman |
| subcontractor-portal | marketplace-lite | Procore、手动跟踪 COI/付款 |
| field-docs | crud | Procore 现场工具、纸质日报 |

现有竞争对手：**Procore**（企业级，最低约 $375+/月——对小型承包商而言过于昂贵且
复杂；不要与其正面竞争）、**Buildertrend**（专注于住宅领域）、
**Contractor Foreman**、**Autodesk Construction Cloud**（企业级）。市场机会在于
那些因价格和复杂度而无法使用这些产品的小型承包商。

## 领域术语（在规格中准确使用这些术语）

- **Estimate** — 内部成本计算（项目将让承包商付出多少成本）。
  **Bid** — 为赢得项目而提交的报价数字（estimate + markup）。**Proposal** —
  面向客户的文档，其中包含 bid 以及工作范围、条款和排除项。*Estimate →
  bid → proposal* 是三种不同的工件，不是同义词。
- **Takeoff (quantity takeoff)** — 根据图纸清点/测量工程量（例如多少平方英尺的
  石膏板、多少线性英尺的管道），并将其用于 estimate。错误的 takeoff = 错误的 bid。
- **Unit cost + assembly** — estimate 由按单位定价的明细项构成（例如
  $/sq ft）。**assembly** 将多个单位成本项组合为一个整体（一个“门组件” =
  门 + 门框 + 五金 + 人工）。真实的估算使用 assemblies，而不是随手填写数字。
- **Markup vs margin** — markup 是在成本*之上额外添加*的金额（cost × 1.20）。
  Margin 是 bid price 中的占比：(price − cost) / price。20% markup ≠ 20% margin。
  混淆二者会导致项目定价错误。规格必须明确字段表示的是哪一个。
- **Change order (CO)** — bid 签署后，对工作范围/价格进行的合同变更。
  未跟踪的 CO 是利润流失和争议产生的源头。
- **RFI (request for information)** — 就含糊不清的图纸向建筑师/业主提出的正式
  问题；答复可能会改变工作范围（→ change order）。
- **Submittal** — 承包商在安装前送交审批的拟用材料/产品样品。
- **Draw schedule + progress billing** — 付款并非一次性总额支付。承包商会随着
  工程完成情况分多次 **draws** 请款，并以 **schedule of values** 为依据（即把项目
  拆分成多个明细项，每项都有对应的合同价值）；每次计费都按各明细项申报完成百分比。
- **Retainage / retention** — 业主从每笔付款中扣留一部分（通常为 **5–10%**），
  直至项目完工/验收。这是承包商应得但暂时无法动用的款项——它是一个一等概念，
  而不是折扣。
- **Lien / lien waiver** — mechanic's lien 是针对未付款工程向房产提出的法律权利
  主张；**lien waiver** 是分包商/供应商以获得付款为交换，签署文件放弃该权利。
  分为 conditional（以付款到账为条件）和 unconditional（已经付款）。
- **AIA G702/G703** — 行业标准的付款申请表。G702 是汇总表
  （付款申请 + 付款证明）；G703 是续表（schedule of
  values，包含本期 / 累计至今 / retainage 各列）。许多业主要求使用这些确切的
  表格。
- **1099 subcontractor** — 分包商通常是 1099 承包商，而不是雇员；总承包商必须
  收集 W-9，并出具 1099 用于税务申报。
- **COI (certificate of insurance)** — 证明分包商持有所需保险的文件；在分包商
  开工或获得付款前，该证明必须有效（未过期）。
- **Daily log** — 带日期的现场记录（现场班组、已完成工作、天气、交付、
  延误）。它是**法律/争议证据**，而不是状态更新。
- **Punch list** — 项目结束时列出的缺陷/未完工事项清单，必须在最终付款 /
  retainage 释放前修复完成。
- **Schedule of values (SOV)** — 分配到各工作项的合同总金额；
  它是 progress billing 和 G703 的基础。

## 不易察觉的领域规则（容易让简单规范踩坑的部分）

1. **Procore 面向企业且价格昂贵。** 不要试图为小型承包商提供比它更多的功能——
   应以价格和简单易用性取胜。切入点是“足够好、价格低廉、无需实施顾问。”
2. **小型承包商使用 Excel 进行估算。** bid-builder 的切入点是用*真正的*估算数学
   （单位成本 + 组合项 + 加价）取代电子表格。它与收入直接相关且切换成本低——
   是最容易达成的第一笔销售。
3. **保留款是核心机制，而不是边缘情况。** 在完工前扣留 5–10% 会影响所有
   计费数字。没有保留款列的计费模型是错误的。
4. **进度计费通过工程价目表进行。** 应按每个 SOV
   行的完成百分比计费，而不是开具统一金额的发票。先对 SOV 建模，计费自然由此得出。
5. **向分包商付款前必须满足文件要求。** 只有在 COI 仍然有效
   且该期间的留置权豁免书已签署后，才能向分包商付款。未经此门控即付款会给 GC
   带来真实的资金责任风险。
6. **未跟踪的变更单会侵蚀利润并引发争议。** 每份 CO 都必须调整
   合同总额和 SOV，并保留签名轨迹。
7. **每日日志是争议证据。** 照片 + 时间戳 + 天气 + 班组信息能使其经得起质证；
   仅用自由文本注明“我们今天施工了”则不能。

## 简单实现容易出错的地方

- 将估算做成由手动输入金额组成的扁平列表——**没有单位成本、没有组合项，也不区分
  加价与利润率**。结果是：数字既无法自证，也无法复用。
- **计费忽略保留款**——按全额开具发票，导致承包商账目
  与业主实际支付的金额不符。
- **project-mgmt 忽略提款计划/进度计费**——只是一个通用任务看板，
  完全没有关联资金实际如何到账。
- **向分包商付款时没有留置权豁免书/COI 门控**——在缺少相关文件的情况下向分包商付款，
  而这些文件本应保护 GC 免受留置权和无保险施工责任的影响。
- **没有变更单流程**——范围变更停留在电子邮件中；利润流失；发生争议时没有
  书面记录。
- **每日日志缺少照片 + 时间戳 + 天气信息**——当出现工期延误或
  缺陷索赔时，无法作为有效证据。

## 必须建模的实体

将以下实体交给 ARCH 中的数据模型（并应用 [[migration-ready-schema]]——承包商
会从现有系统导入其项目列表和客户列表）。

- **Estimate**——包含 `unit_cost`、数量和**组合项**的明细项；包含
  **加价**（以及派生出的利润率）→ 生成 **Bid**。
- **Bid / Proposal**——已定价的投标文件；引用其来源 Estimate。
- **ChangeOrder**——调整合同总额 + SOV；具有状态 + 签名轨迹；关联到
  Project。
- **Subcontractor**——独立实体（不是内联字段），包含 **COI 状态 + 到期日**、
  **留置权豁免书状态**（付款门控），以及 **1099 / W-9** 信息。
- **Project**——包含**工程价目表**、**提款计划**，以及**保留款**
  百分比/余额。
- **DailyLog**——照片、天气、班组、时间戳；具备足够的仅追加特性，可作为证据。

金额使用整数最小货币单位（`*_cents`）；保留金和 SOV 计算绝不能因浮点运算产生误差。

## 各产品说明

- **bid-builder (marketplace-lite)** — 切入点：作为估算电子表格的低切换成本替代品，直接关联营收。唯一关键的领域能力：**真正的估算计算**——单位成本 + 组合项，以及加价率与利润率之间的区别，从而生成一份经得起推敲的报价。如果这点做错了，它就只是一个更差的 Excel。
- **project-mgmt (crud)** — 切入点：相比笨重的 Buildertrend/Contractor Foreman，提供轻量级项目 + 每日日志工具。唯一关键的领域能力：**基于工程量价目表的请款计划/进度计费**——不要交付一个与计费脱节的通用任务看板。
- **subcontractor-portal (marketplace-lite)** — 切入点：无需 Procore 即可管理分包商、文档和付款。唯一关键的领域能力：**付款前的留置权豁免书 + COI 准入控制**——该门户的全部价值就在于，分包商只有在文档合规无误后才能获得付款。
- **field-docs (crud)** — 切入点：相比纸质记录和 Procore 的现场模块，提供照片/每日报告/检查记录采集。唯一关键的领域能力：**每条记录都包含照片 + 时间戳 + 天气 + 班组信息**，使记录成为足以用于争议处理的证据。

## 合规（轻量处理——标记即可，不要过度完善）

- **留置权法律因州而异**——初步通知的截止期限和留置权豁免书表格因州而异；应将豁免书表格设计为可按州配置，而不是硬编码。
- **保留金法律**——许多州会限制保留金比例，并规定释放时间；将其作为一项设置提供。
- **分包商的 1099 表格**——收集 W-9，跟踪付款，并支持 1099 申报。
- **现行工资标准**——在公共/政府项目（Davis-Bacon）中，工资标准是强制规定的，并且需要提交经认证的工资记录；如果产品面向公共工程，则应对此进行标记。
- **COI 验证**——在分包商开工/付款前，验证其保险保障当前有效（未过期）。
- **OSHA**——与 field-docs 相关（安全检查、事故记录），但保持轻量。

这些功能应与 [[vertical-onboarding]]（导入承包商现有的工程、分包商和客户，以此作为低切换成本的切入点）以及 [[lifecycle-messaging]]（COI 到期提醒、留置权豁免书请求、请款/付款通知——这些是保障资金流转的信息）配合使用。