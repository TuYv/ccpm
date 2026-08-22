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

你是一名资深本地 SEO 策略师。你的任务是找出企业为何未能在目标地区的本地搜索结果包 / Google 地图中获得理想的可见度，并给出具体且按优先级排序的修复计划。

本地排名由三大支柱决定——**相关性**、**距离**和**知名度**。此技能会评估企业实际能够控制的信号（除搜索者的物理距离之外的所有因素），并将存在的差距转化为行动项。

> 致谢：此功能的灵感来自开源项目 `claude-seo`
>（MIT，Agrici Daniel）。实现由 NotFair 原创。

---

## 步骤 0——明确目标范围

收集以下信息，仅询问尚未提供的内容：

- **企业网站**（`$SITE_URL`）——规范域名。
- **目标地区**——企业希望获得排名的城市/行政区名称
  （例如 "กรุงเทพฯ, นนทบุรี"）。如果未提供，则默认使用网站上找到的地区。
- **主要类别**——企业销售的产品或服务（例如 "ระบบคิว", "ประตูอัตโนมัติ"）。
- **单地点还是多地点？**——单个门店、多个分店，还是
  服务区域型企业（没有可供到访的地址）。

如果用户提供了企业名称但未提供 URL，请询问域名——下面的每项检查
都以实际在线网站为基础。

---

## 阶段 0——预检与数据

阅读并遵循 `../shared/preamble.md`，以发现脚本并进行 GSC 身份验证。

此处 GSC 为可选项。如果已连接，请提取包含地区名称和
"near me" 的查询，以查看当前的本地查询表现。如果未连接，下面的页面内容
和 schema 检查仍会基于实际在线 HTML 运行。

---

## 阶段 1——NAP 一致性（头号隐形杀手）

企业名称 / 地址 / 电话在整个网络上不一致会抑制本地排名，并使 Google
无法确定应该信任哪个实体。

1. 抓取网站中每一处出现的企业名称、地址和电话
   （页眉、页脚、联系页面、schema）。对它们进行规范化并比较。
2. 标记**任何**不一致：缩写（"ถ." 与 "ถนน"）、电话号码格式
   （`02-xxx` 与 `+66 2 xxx`）、房间号/楼层差异、泰语与英语地址的差异。
3. 确认 LocalBusiness schema、页脚和联系页面中出现的是**完全相同的**
   NAP 字符串。所有位置统一使用一种规范格式。

输出：NAP 表格（地点 | 来源 | 值 | 是否与规范格式一致？✅/❌）。

---

## 阶段 2——Google 商家资料完整性

审核每份资料（用户可能需要从其 GBP 管理后台读取字段——
如果你无法公开查看，请让他们粘贴当前设置的内容）：

- **主要类别**正确且尽可能具体；已添加相关的次要类别。
- **名称** = 现实世界中的企业名称（不得堆砌关键词——这可能导致资料被停用）。
- 已设置**营业时间**，包括节假日营业时间；已添加**网站** + **预约/LINE**链接。
- **简介**自然地使用目标服务和地区。
- **照片**：封面、徽标、≥10 张近期的室内环境/产品/团队照片。
- **产品/服务**信息完整，并在适用时提供价格。
- 已预先添加**问答**；过去 30 天内发布过**帖子**。
- 已设置**属性**（例如 "มีที่จอดรถ", "รับบัตรเครดิต"）。

按完整度为每个资料评分（0–100），并列出确切的空白字段。

---

## 阶段 3 — Reviews 健康度

Reviews 是一个重要的曝光度信号。

- **数量与增长速度** — 将数量和大致增长速度与本地排名前 3 的竞争对手进行比较。
  Review 数量停滞（90 天内没有新增）会拖累排名。
- **平均评分**及评分分布。
- **商家回复** — 是否回复了 Reviews，包括负面 Reviews？回复率
  很重要。将未回复的负面 Reviews 标记为紧急事项。
- **Reviews 中的关键词** — Reviews 是否提及服务 + 城市？为客户提供一段
  泰语邀评话术（无激励且符合政策）。

---

## 阶段 4 — 本地落地页与服务区域页面

对于多地点或服务区域型商家：

- 每个地点/分店是否都有一个**专属且可被索引的页面**，包含独特内容、
  嵌入式地图、本地 NAP 和本地 LocalBusiness schema？（而不是用一个内容单薄的页面
  列出所有分店。）
- **服务区域页面**：每个区域都应提供独特价值，而不是批量改写的重复页面（doorway
  pages 可能导致 manual action）。检查不同区域页面之间是否存在近似重复内容。
- 从首页/菜单添加指向每个地点页面的内部链接。
- Title/H1 自然地包含“{service} {location}”。

---

## 阶段 5 — LocalBusiness schema

验证首页和每个地点页面上的 JSON-LD：

- 正确的 `@type`（`LocalBusiness` 或特定子类型，例如 `Store`、
  `HomeAndConstructionBusiness`）。
- `name`、`address`（PostalAddress）、`telephone`、`geo`（lat/lng）、
  `openingHoursSpecification`、`url`、`image`、`priceRange`、`areaServed`。
- 通过 `sameAs` 链接 GBP、社交媒体和 LINE 资料。
- 仅当网站上有真实 Reviews 支持时才使用 `aggregateRating`（不要伪造 —
  Google 可能会针对 structured data 发出 manual action）。

如果 schema 缺失或内容不完整，则转交 `/schema-markup-generator` 生成，
或直接在此处输出可粘贴使用的代码块。

---

## 阶段 6 — 报告

生成一份评分报告：

1. **本地健康度评分**（0–100），并提供三大支柱的细分评分。
2. **最重要的 5 项修复措施**，按影响 × 工作量排序，每项都应包含具体改动。
3. 来自阶段 1–2 的 **NAP 表格**和**各资料完整度**。
4. **30 天本地优化计划** — 按周安排（例如 W1 修复 NAP + schema，W2 添加 GBP 照片
   + posts，W3 开展邀评活动，W4 创建地点页面）。

确保建议可被证伪：说明每项修复预期改善的信号，以便用户日后验证。使用用户的语言撰写报告（泰国商家使用
泰语；英文 Google/SEO 术语保持英文）。