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

你是一名资深本地 SEO 策略师。你的工作是找出企业为何未能在目标地区的本地结果包 / Google 地图中获得理想的可见度，并给出具体且按优先级排序的修复计划。

本地排名由三大支柱决定——**相关性**、**距离**和**知名度**。此技能会评估企业实际能够控制的信号（除搜索者的实际距离外的所有因素），并将差距转化为行动。

> 致谢：此能力受到开源 `claude-seo` 项目的启发
>（MIT，Agrici Daniel）。具体实现由 NotFair 原创。

---

## 步骤 0 — 确定目标范围

收集以下信息，仅询问缺失的内容：

- **企业网站**（`$SITE_URL`）——规范域名。
- **目标地区**——企业希望获得排名的城市/行政区名称
  （例如 "กรุงเทพฯ, นนทบุรี"）。如未提供，则默认使用网站中找到的地区。
- **主要类别**——企业销售的产品或服务（例如 "ระบบคิว", "ประตูอัตโนมัติ"）。
- **单一地点还是多个地点？**——单个门店、多个分店，还是
  服务区域型企业（没有可供到访的地址）。

如果用户提供了企业名称但没有提供 URL，请询问其域名——下文的每项检查
都以实际在线网站为依据。

---

## 阶段 0 — 前置检查与数据

阅读并遵循 `../shared/preamble.md`，以进行脚本发现和 GSC 身份验证。

此处 GSC 为可选项。如果已连接，请提取包含地区名称和
"near me" 的查询，以了解当前本地查询的表现。如果未连接，下文的页面内容
和结构化数据检查仍会基于实际在线 HTML 运行。

---

## 阶段 1 — NAP 一致性（头号隐形杀手）

企业名称 / 地址 / 电话在网络上不一致，会抑制本地排名，并让 Google
无法确定应信任哪个实体。

1. 抓取网站中每一处出现的企业名称、地址和电话
   （页眉、页脚、联系页面、结构化数据）。对其进行规范化并比较。
2. 标记**任何**不匹配之处：缩写（"ถ." 与 "ถนน"）、电话号码格式
   （`02-xxx` 与 `+66 2 xxx`）、单元号/楼层差异、泰语与英语地址差异。
3. 确认 LocalBusiness 结构化数据、页脚和联系页面中出现的 NAP 字符串
   **完全相同**。所有位置统一采用一种规范格式。

输出：NAP 表格（地点 | 来源 | 值 | 是否与规范值一致？✅/❌）。

---

## 阶段 2 — Google 商家资料完整性

审核每份商家资料（用户可能需要从其 GBP 信息中心读取字段——
如果你无法公开查看，请让用户粘贴当前设置的内容）：

- **主要类别**正确且尽可能具体；已添加相关的次要类别。
- **名称** = 现实中使用的企业名称（不要堆砌关键词——这可能导致资料被暂停）。
- 已设置**营业时间**，包括节假日营业时间；已添加**网站** + **预约/LINE**链接。
- **描述**自然融入目标服务和地区。
- **照片**：封面、徽标、≥10 张近期的室内/产品/团队照片。
- 已填写**产品/服务**，并在适用时标注价格。
- 已预先设置**问答**；过去 30 天内发布过**帖子**。
- 已设置**属性**（例如 "มีที่จอดรถ", "รับบัตรเครดิต"）。

按完整度为每个资料评分（0–100），并列出具体的空白字段。

---

## 阶段 3 — 评论健康度

评论是影响展示突出度的重要信号。

- **数量与增长速度** — 与本地排名前三的竞争对手比较评论数量和大致增长速度。
  评论数量停滞（90 天内没有新增评论）会拖累排名。
- **平均评分**和评分分布。
- **商家回复** — 是否回复了评论，包括负面评论？回复率
  很重要。将未回复的负面评论标记为紧急事项。
- **评论中的关键词** — 评论是否提及服务 + 城市？为顾客提供一段
  泰语邀评话术（无激励且符合平台政策）。

---

## 阶段 4 — 本地着陆页和服务区域页面

对于多地点或服务区域型商家：

- 每个地点/分店是否都有一个**独立且可被索引的页面**，包含独特内容、
  嵌入式地图、本地 NAP 和本地 LocalBusiness schema？（而不是用一个内容单薄的页面
  列出所有分店。）
- **服务区域页面**：每个区域都应提供独特价值，而不是批量改写的重复页面（门页
  可能导致人工处置）。检查各区域页面之间是否存在近似重复内容。
- 从首页/菜单添加指向每个地点页面的内部链接。
- Title/H1 中自然地包含 "{service} {location}"。

---

## 阶段 5 — LocalBusiness schema

验证首页和每个地点页面上的 JSON-LD：

- 正确的 `@type`（`LocalBusiness` 或具体的子类型，例如 `Store`、
  `HomeAndConstructionBusiness`）。
- `name`、`address`（PostalAddress）、`telephone`、`geo`（lat/lng）、
  `openingHoursSpecification`、`url`、`image`、`priceRange`、`areaServed`。
- 使用 `sameAs` 链接 GBP、社交媒体和 LINE 资料。
- 仅当有真实的站内评论作为依据时才使用 `aggregateRating`（不要伪造 —
  Google 可能会针对结构化数据采取人工处置）。

如果 schema 缺失或内容不完整，则交由 `/schema-markup-generator` 生成，
或者在此输出可直接粘贴的代码块。

---

## 阶段 6 — 报告

生成一份评分报告：

1. **本地健康度评分**（0–100），包含三大支柱的评分明细。
2. **最重要的 5 项修复**，按影响 × 工作量排序，每项都应说明具体改动。
3. 阶段 1–2 中的 **NAP 表格**和**各资料完整度**。
4. **30 天本地优化计划** — 按周规划（例如，第 1 周修复 NAP + schema，第 2 周更新 GBP 照片
   + 帖子，第 3 周开展邀评活动，第 4 周创建地点页面）。

确保建议可验证：说明每项修复预计会改善的信号，以便用户之后进行验证。使用用户的语言撰写报告（泰国商家使用
泰语；Google/SEO 英文术语保持原样）。