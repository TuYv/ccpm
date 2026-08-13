---
name: seo-schema
description: >
  Detect, validate, and generate Schema.org structured data. JSON-LD format
  preferred. Use when user says "schema", "structured data", "rich results",
  "JSON-LD", or "markup".
user-invocable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.4"
  category: seo
---
# Schema 标记分析与生成

## 检测

1. 扫描页面源代码中的 JSON-LD `<script type="application/ld+json">`
2. 检查 Microdata（`itemscope`、`itemprop`）
3. 检查 RDFa（`typeof`、`property`）
4. 始终建议将 JSON-LD 作为主要格式（Google 明确表示的首选格式）

## 验证

- 检查各 Schema 类型的必需属性
- 根据 Google 支持的富媒体搜索结果类型进行验证
- 测试常见错误：
  - 缺少 @context
  - 无效的 @type
  - 错误的数据类型
  - 占位文本
  - 相对 URL（应为绝对 URL）
  - 无效的日期格式
- 标记已弃用的类型（见下文）

## Schema 类型状态（截至 2026 年 6 月）

完整列表请阅读 `../seo/references/schema-types.md`。关键规则：

### 有效（可自由推荐）：
Organization、LocalBusiness、SoftwareApplication、WebApplication、Product（自 2025 年 4 月起包含 Certification 标记）、ProductGroup、Offer、Service、Article、BlogPosting、NewsArticle、Review、AggregateRating、BreadcrumbList、WebSite、WebPage、Person、ProfilePage、ContactPage、VideoObject、ImageObject、Event、JobPosting、Course、DiscussionForumPosting

### 视频和专用类型（可自由推荐）：
BroadcastEvent、Clip、SeekToAction、SoftwareSourceCode

有关这些类型的即用型 JSON-LD 模板，请参阅 `schema/templates.json`。

> **JSON-LD 和 JavaScript 渲染：**根据 Google 2025 年 12 月发布的 JavaScript SEO 指南，通过 JavaScript 注入的结构化数据可能会延迟处理。对于时效性较强的标记（尤其是 Product、Offer），请在初始服务端渲染的 HTML 中包含 JSON-LD。

### 无富媒体搜索结果，但有用时可保留：
- **FAQPage**：Google 已于 2026 年 5 月 7 日停止为所有网站提供 FAQ 富媒体搜索结果（取代 2023 年 8 月针对政府/健康类网站的限制）。它不会带来 Google SERP 富媒体搜索结果收益；应将现有 FAQPage 标记为 Info（而非 Critical），而不是将其移除。对于真正的用户问答页面，请使用 **QAPage**。

### 已弃用（绝不推荐）：
- **HowTo**：富媒体搜索结果已于 2023 年 9 月移除
- **SpecialAnnouncement**：已于 2025 年 7 月 31 日弃用
- **CourseInfo, EstimatedSalary, LearningVideo**：已于 2025 年 6 月停用
- **ClaimReview**：已于 2025 年 6 月从富媒体搜索结果中停用
- **VehicleListing**：已于 2025 年 6 月从富媒体搜索结果中停用
- **Practice Problem**：弃用通知发布于 2025-11-05；Search Console / Rich Results Test 支持已于 2026-01-06 移除
- **Book Actions**：已弃用/从 Google 富媒体搜索结果中移除；不要为了 SERP 功能而推荐它。
- Search Console / Rich Results Test / 外观过滤器对 CourseInfo、EstimatedSalary、LearningVideo、SpecialAnnouncement、VehicleListing 的支持已于 2025-09-09 移除；对 Practice Problem 的支持已于 2026-01-06 移除。

### 仅支持 Dataset Search：
- **Dataset**：未被停用；由 Google Dataset Search 使用，但不会出现在 Google Search 富媒体搜索结果中。不要像对待已被终止的类型那样建议移除它。

### 仍受支持（不要标记）：
- QAPage（评论线程扩展属性于 2026-03-24 发布）、DiscussionForumPosting、教育问答（Quiz / `eduQuestionType=Flashcard`）。对于电子商务，成人产品必须包含 **hasAdultConsideration**（新增于 2026-05-22；值为 `https://schema.org/SexualContentConsideration`）。

## 生成

为页面生成结构化数据时：
1. 通过内容分析识别页面类型
2. 选择适当的结构化数据类型
3. 生成有效的 JSON-LD，并包含所有必需属性和推荐属性
4. 仅包含真实、可验证的数据。使用明确标记的占位符供用户填写
5. 在呈现之前验证输出

## 常用结构化数据模板

### 组织
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "[Company Name]",
  "url": "[Website URL]",
  "logo": "[Logo URL]",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "[Phone]",
    "contactType": "customer service"
  },
  "sameAs": [
    "[Facebook URL]",
    "[LinkedIn URL]",
    "[Twitter URL]"
  ]
}
```

### 本地企业
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "[Business Name]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "[Street]",
    "addressLocality": "[City]",
    "addressRegion": "[State]",
    "postalCode": "[ZIP]",
    "addressCountry": "US"
  },
  "telephone": "[Phone]",
  "openingHours": "Mo-Fr 09:00-17:00",
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[Lat]",
    "longitude": "[Long]"
  }
}
```

### 文章/博客文章
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Title]",
  "author": {
    "@type": "Person",
    "name": "[Author Name]"
  },
  "datePublished": "[YYYY-MM-DD]",
  "dateModified": "[YYYY-MM-DD]",
  "image": "[Image URL]",
  "publisher": {
    "@type": "Organization",
    "name": "[Publisher]",
    "logo": {
      "@type": "ImageObject",
      "url": "[Logo URL]"
    }
  }
}
```

## 输出

- `SCHEMA-REPORT.md`：检测和验证结果
- `generated-schema.json`：可直接使用的 JSON-LD 片段

### 验证结果
| 结构化数据 | 类型 | 状态 | 问题 |
|--------|------|--------|--------|
| ... | ... | ✅/⚠️/❌ | ... |

### 建议
- 缺失的结构化数据机会
- 需要进行的验证修复
- 为实施生成的代码

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问 | 报告连接错误及状态码。建议验证 URL，并检查页面是否需要身份验证。 |
| 未找到结构化数据标记 | 报告未检测到 JSON-LD、Microdata 或 RDFa。根据页面内容分析推荐适当的结构化数据类型。 |
| JSON-LD 语法无效 | 解析并报告具体的语法错误（缺少括号、尾随逗号、键未加引号）。提供修正后的 JSON-LD 输出。 |
| 检测到已弃用的结构化数据类型 | 标记已弃用的类型及其停用日期。推荐当前的替代类型；如果没有替代类型，则建议将其移除。 |