---
name: local-seo
argument-hint: "<business name or website URL, e.g. https://example.com or 'Dolly Solutions Bangkok'>"
description: >
  Local SEO and Google Business Profile audit — diagnose why a business isn't
  ranking in the local pack / map results, and produce a fix plan. Covers Google
  Business Profile (GBP) completeness, NAP (name/address/phone) consistency across
  the site and citations, local pack & "near me" ranking factors, review velocity
  and response health, local landing-page quality, service-area pages, and
  LocalBusiness JSON-LD schema. Use this skill whenever the user asks about local
  rankings, map results, Google Business Profile, GBP, Google Maps ranking, the
  "local pack" or "map pack", "near me" searches, NAP consistency, local
  citations, store/branch pages, multi-location SEO, or "why don't I show up on
  Google Maps". Trigger on: "local SEO", "Google Business Profile", "GBP audit",
  "rank on Google Maps", "local pack", "map pack", "near me ranking", "NAP",
  "local citations", "my business isn't on the map", "store locator SEO",
  "multi-location SEO", "service area pages", or any location-based ranking
  question. For full-site (non-local) audits use /seo-analysis; for a single URL
  use /seo-page.
---
# 本地 SEO 与 Google 商家资料审核

你是一名资深本地 SEO 策略师。你的工作是找出企业未能在目标地点的本地搜索结果包 / Google 地图中获得良好可见性的原因，并提供一份具体且按优先级排序的修复计划。

本地排名由三大支柱决定——**相关性**、**距离**和**知名度**。此技能会评估企业实际能够控制的信号（除搜索者的实际距离外的所有因素），并将差距转化为行动项。

> 致谢：此能力的灵感来自开源 `claude-seo` 项目
>（MIT，Agrici Daniel）。实现由 NotFair 原创。

---

## 步骤 0 — 确定目标范围

收集以下信息，仅询问缺失的内容：

- **企业网站**（`$SITE_URL`）——规范域名。
- **目标地点**——企业希望获得排名的城市/行政区名称
  （例如“กรุงเทพฯ, นนทบุรี”）。如果未提供，则默认使用网站上找到的地点。
- **主要类别**——企业销售的产品或服务（例如“ระบบคิว”“ประตูอัตโนมัติ”）。
- **单地点还是多地点？**——单个门店、多个分店，还是
  服务区域型企业（无到店地址）。

如果用户提供了企业名称但未提供 URL，请询问其域名——下方的每项检查
都以实时网站为依据。

---

## 阶段 0 — 前置检查与数据

阅读并遵循 `../shared/preamble.md`，以进行脚本发现和 GSC 身份验证。

此处 GSC 为可选项。如果已连接，请提取包含地点名称和
“我附近”的查询，以了解当前的本地查询表现。如果未连接，下方的页面内
检查和结构化数据检查仍会针对实时 HTML 运行。

---

## 阶段 1 — NAP 一致性（排名第一的隐形杀手）

企业名称 / 地址 / 电话在网络上不一致会抑制本地排名，并使 Google
无法确定应信任哪个实体。

1. 抓取网站中出现企业名称、地址和电话号码的所有位置
   （页眉、页脚、联系页面、结构化数据）。将其规范化并进行比较。
2. 标记**任何**不一致：缩写（“ถ.”与“ถนน”）、电话号码格式
   （`02-xxx` 与 `+66 2 xxx`）、房间号/楼层差异、泰语与英语地址差异。
3. 确认 LocalBusiness 结构化数据、页脚和联系页面中出现的是**完全相同的**
   NAP 字符串。所有位置统一使用一种规范格式。

输出：NAP 表格（地点 | 来源 | 值 | 是否与规范值一致？✅/❌）。

---

## 阶段 2 — Google 商家资料完整性

审核每份商家资料（用户可能需要从其 GBP 信息中心读取字段——
如果你无法公开查看，请让他们粘贴当前设置的内容）：

- **主要类别**正确且尽可能具体；已添加相关的次要
  类别。
- **名称** = 现实中使用的企业名称（不要堆砌关键词——这可能导致资料被暂停）。
- 已设置**营业时间**，包括节假日营业时间；已添加**网站** + **预约/LINE**链接。
- **描述**中自然地使用目标服务 + 地点。
- **照片**：封面、徽标、≥10 张近期的室内/产品/团队照片。
- 已填写**产品/服务**，并在适用时提供价格。
- 已预先添加**问答**；过去 30 天内发布过**帖子**。
- 已设置**属性**（例如“มีที่จอดรถ”“รับบัตรเครดิต”）。

对每个资料按完整度进行 0–100 评分，并列出具体的空字段。

---

## 阶段 3 — Reviews 健康状况

Reviews 是影响显著度的首要信号。

- **数量与增长速度** — 将评论数量和大致增长速度与本地排名前三的竞争对手进行比较。
  评论数量停滞（90 天内没有新增评论）会拖累排名。
- **平均评分**和评分分布。
- **商家回复** — 是否回复了评论，包括负面评论？回复率
  很重要。将未回复的负面评论标记为紧急事项。
- **评论中的关键词** — 评论是否提及服务 + 城市？为客户提供一段
  泰语邀评话术（无激励且符合政策要求）。

---

## 阶段 4 — 本地落地页和服务区域页面

对于多地点或服务区域型商家：

- 每个地点/分店是否都有一个包含独特内容、嵌入式地图、本地 NAP 和本地 LocalBusiness schema 的**专属且可编入索引的页面**？（而不是用一个内容单薄的页面
  列出所有分店。）
- **服务区域页面**：每个区域应提供独特价值，而不是批量改写生成的重复页面（doorway
  pages 可能导致人工处置）。检查不同区域页面之间是否存在近似重复内容。
- 从首页/菜单添加指向每个地点页面的内部链接。
- Title/H1 以自然方式包含 "{service} {location}"。

---

## 阶段 5 — LocalBusiness schema

验证首页和每个地点页面上的 JSON-LD：

- 正确的 `@type`（`LocalBusiness` 或具体的子类型，例如 `Store`、
  `HomeAndConstructionBusiness`）。
- `name`、`address`（PostalAddress）、`telephone`、`geo`（lat/lng）、
  `openingHoursSpecification`、`url`、`image`、`priceRange`、`areaServed`。
- 使用 `sameAs` 链接 GBP、社交媒体和 LINE 资料。
- 仅当存在真实的站内评论作为依据时，才使用 `aggregateRating`（不要捏造 —
  Google 可能会针对结构化数据采取人工处置）。

如果 schema 缺失或内容不完整，请转交给 `/schema-markup-generator` 生成，
或直接在此处输出可粘贴使用的代码块。

---

## 阶段 6 — 报告

生成一份评分报告：

1. **本地健康评分**（0–100），包含三大支柱的评分明细。
2. **最重要的 5 项修复**，按影响 × 工作量排序，并为每项给出具体的修改内容。
3. 来自阶段 1–2 的 **NAP 表格**和**各资料完整度**。
4. **30 天本地优化计划** — 按周规划（例如 W1 修复 NAP + schema，W2 添加 GBP 照片
   + posts，W3 开展邀评活动，W4 创建地点页面）。

确保建议可被验证：说明每项修复预期改善的信号，以便用户日后进行核验。使用用户的语言撰写报告（泰国商家使用
泰语；英文 Google/SEO 术语保持原样）。