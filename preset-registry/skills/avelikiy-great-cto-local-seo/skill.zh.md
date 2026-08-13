---
name: local-seo
description: Local-business SEO and structured-data framework for content-platform Product-Builder products that need to be found (storefronts, restaurant online-ordering, real-estate listings, service-business sites). Codifies schema.org structured data (LocalBusiness/Product/Menu/RealEstateListing), Core Web Vitals as a ranking input, local on-page signals (NAP consistency, Google Business Profile alignment), sitemap/robots/canonical hygiene, and listing syndication. Applied by senior-dev when building public pages and checked by cms-reviewer. cms-reviewer reviews SEO; this skill is how you BUILD it right the first time.
when_to_use: |
  Apply when building public, indexable pages for a local or commerce product:
  - storefront / online-ordering / listings / service-business landing pages
  - any page meant to rank in local or product search
  Do NOT apply to authenticated app surfaces or internal dashboards (noindex those).
effort: low
allowed-tools: Read, Write, Grep, Glob, WebFetch
paths:
  - "docs/architecture/**"
  - "docs/design/**"
  - "app/**"
  - "src/**"
---
# 本地 SEO——为被找到而构建，而不只是为通过评审

对于店面、餐厅或信息列表网站，可被发现性本身就是产品。将 SEO 融入初始设计成本很低；后期补做 SEO 则无异于重建。从第一个页面开始就构建这些信号。

## 1. 结构化数据（schema.org）——撬动本地 SEO 的最大杠杆

输出与实体匹配的 JSON-LD，并根据 Google 富媒体搜索结果要求进行验证：

- **LocalBusiness**（加上具体子类型：Restaurant、HomeAndConstructionBusiness、RealEstateAgent）——name、address（PostalAddress）、geo、telephone、openingHours、priceRange、url、sameAs（社交媒体）。这是影响最大的单一本地 SEO 信号。
- **Product** + **Offer**（店面）——name、image、price、availability、aggregateRating。
- **Menu** / **MenuItem**（餐厅在线点餐）。
- **RealEstateListing** / **Residence**（信息列表）——price、address、floorSize、numberOfRooms。
- 每个深层页面都使用 **BreadcrumbList**；存在问答内容时使用 **FAQPage**。

发布前使用富媒体搜索结果测试验证每种类型；无效的 JSON-LD 不会带来任何收益。

## 2. NAP 一致性 + 与 Google 商家资料保持一致

名称 / 地址 / 电话必须在网站、LocalBusiness JSON-LD 和 Google 商家资料中保持**字节级完全一致**。不一致的 NAP 会削弱本地搜索排名。仅定义一次规范 NAP，并在各处复用。

## 3. Core Web Vitals 是排名依据（不只是性能指标）

LCP / INP / CLS 会影响这些页面的搜索排名。与 performance-engineer 协作，但 SEO 所要求的最低标准包括：经过优化的响应式图片（AVIF/WebP + srcset——参见 `media-pipeline-engineer`）、加载时不发生布局偏移（为媒体指定尺寸）、快速的 TTFB。无论内容如何，缓慢的本地页面都会输给快速的竞争对手。

## 4. 抓取 + 索引治理

- 从目录/信息列表自动生成 **sitemap.xml**，包含 `lastmod`；并提交该文件。
- **robots.txt** 允许抓取可索引页面，并屏蔽应用、管理后台和结账内部页面。
- 每个页面都设置 **Canonical**（指向自身或首选变体）——避免因筛选、分页和 UTM 造成的重复内容损失。
- 对需要身份验证的页面以及内容单薄的内部页面明确设置 **noindex**。
- 使用简洁、稳定且与关键词相关的 URL（`/menu/margherita`，而不是 `/p?id=8842`）。

## 5. 页面内 + 内容信号

- 每个页面只使用一个 `<h1>`；每个页面都设置描述性的 `<title>` 和元描述（根据实体生成模板，而不是在全站重复）。
- 每张图片都使用描述性的 `alt` 文本（兼顾无障碍访问和图片搜索）。
- 在相关实体之间建立内部链接（产品↔类别、房源↔社区）。
- 为多地点经营的商家创建地点页面（每个地点对应一个可索引页面，并包含独特内容）。

## 6. 内容分发（产品的分发渠道）

对于会进行内容分发的信息列表/店面（MLS/IDX、Google Shopping、各类市场平台），规范页面位于**我们自己的**网站；分发出去的副本应链接回该页面。定义 feed 格式和更新频率（与 integrations-engineer 协调并确定唯一事实来源）。

## 输出

应用后，在架构/设计文档中添加一个 **SEO** 章节，并提供一份 senior-dev 构建结果必须满足的检查清单：

```
## SEO
- schema.org types: <LocalBusiness subtype + Product/Menu/Listing> · JSON-LD validated
- canonical NAP: <name/address/phone> (identical in JSON-LD + GBP)
- CWV minimums: LCP/INP/CLS targets (with performance-engineer)
- crawl: sitemap.xml (lastmod) · robots.txt · canonical on all · noindex app/admin
- on-page: 1×h1, per-page title/meta, alt text, clean URLs
- syndication (if any): canonical = our page; feed = <format/cadence>
```