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
  version: "2.3.1"
  category: seo
---
# Schema 标记分析与生成

## 检测

1. 扫描页面源代码中的 JSON-LD `<script type="application/ld+json">`
2. 检查 Microdata（`itemscope`、`itemprop`）
3. 检查 RDFa（`typeof`、`property`）
4. 始终建议将 JSON-LD 作为主要格式（Google 明确表示更偏好该格式）

## 验证

- 根据架构类型检查必需属性
- 根据 Google 支持的富媒体搜索结果类型进行验证
- 检查常见错误：
  - 缺少 @context
  - 无效的 @type
  - 数据类型错误
  - 占位文本
  - 相对 URL（应使用绝对 URL）
  - 无效的日期格式
- 标记已弃用的类型（见下文）

## 架构类型状态（截至 2026 年 6 月）

阅读 `../seo/references/schema-types.md` 以获取完整列表。关键规则：

### ACTIVE（可自由推荐）：
Organization、LocalBusiness、SoftwareApplication、WebApplication、Product（自 2025 年 4 月起支持 Certification 标记）、ProductGroup、Offer、Service、Article、BlogPosting、NewsArticle、Review、AggregateRating、BreadcrumbList、WebSite、WebPage、Person、ProfilePage、ContactPage、VideoObject、ImageObject、Event、JobPosting、Course、DiscussionForumPosting

### VIDEO & SPECIALIZED（可自由推荐）：
BroadcastEvent、Clip、SeekToAction、SoftwareSourceCode

参见 `schema/templates.json`，其中包含这些类型的即用型 JSON-LD 模板。

> **JSON-LD 和 JavaScript 渲染：** 根据 Google 2025 年 12 月的 JS SEO 指南，通过 JavaScript 注入的结构化数据可能会延迟处理。对于有时效性的标记（尤其是 Product、Offer），应将 JSON-LD 包含在初始服务器渲染的 HTML 中。

### NO RICH RESULTS, KEEP IF USEFUL：
- **FAQPage**：Google 已于 2026 年 5 月 7 日针对所有网站停用 FAQ 富媒体搜索结果（取代 2023 年 8 月针对政府和健康网站的限制）。它不再带来 Google SERP 富媒体搜索结果的收益；对于现有的 FAQPage，应标记为 Info（而不是 Critical），而不是建议移除。对于真正的用户问答页面，应使用 **QAPage**。

### DEPRECATED（绝不推荐）：
- **HowTo**：富媒体搜索结果已于 2023 年 9 月移除
- **SpecialAnnouncement**：已于 2025 年 7 月 31 日弃用
- **CourseInfo、EstimatedSalary、LearningVideo**：已于 2025 年 6 月停用
- **ClaimReview**：已于 2025 年 6 月退出富媒体搜索结果
- **VehicleListing**：已于 2025 年 6 月退出富媒体搜索结果
- **Practice Problem**：弃用通知日期为 2025-11-05；Search Console / Rich Results Test 支持已于 2026-01-06 移除
- **Book Actions**：已弃用/从 Google 富媒体搜索结果中移除；不要将其推荐为 SERP 功能。
- Search Console / Rich Results Test / appearance-filter 对 CourseInfo、EstimatedSalary、LearningVideo、SpecialAnnouncement、VehicleListing 的支持已于 2025-09-09 移除；对 Practice Problem 的支持已于 2026-01-06 移除。

### 仅支持 Dataset Search：
- **Dataset**：并未停用；由 Google Dataset Search 使用，但没有 Google Search 富媒体搜索结果展示界面。不要像对待已被停用的类型一样建议移除它。

### 仍受支持（不要标记）：
- QAPage（2026-03-24 扩展了评论线程属性）、DiscussionForumPosting、Education Q&A（Quiz / `eduQuestionType=Flashcard`）。对于电子商务，**hasAdultConsideration**（于 2026-05-20 添加；值为 `https://schema.org/SexualContentConsideration`）对于成人产品是必需的。`Product.category` 接受 `Text`、`CategoryCode`，或混合包含两者的数组。

## 生成

为页面生成架构时：
1. 通过内容分析识别页面类型
2. 选择适当的架构类型
3. 使用所有必需属性和推荐属性生成有效的 JSON-LD
4. 仅包含真实且可验证的数据。使用清晰标记的占位符，供用户填写
5. 在呈现之前验证输出
6. 对于评论标记，拒绝虚假评论和未披露的激励性评论。
   激励措施必须在页面上清晰且显著地披露。

## 常见架构模板

### Organization
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

### LocalBusiness
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

### Article/BlogPosting
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
| 架构 | 类型 | 状态 | 问题 |
|--------|------|--------|--------|
| ... | ... | ✅/⚠️/❌ | ... |

### 建议
- 缺失的架构机会
- 需要的验证修复
- 用于实施的生成代码

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问 | 报告带状态码的连接错误。建议验证 URL，并检查页面是否需要身份验证。 |
| 未找到架构标记 | 报告未检测到 JSON-LD、Microdata 或 RDFa。根据页面内容分析，推荐适当的架构类型。 |
| JSON-LD 语法无效 | 解析并报告具体的语法错误（缺少括号、尾随逗号、未加引号的键）。提供修正后的 JSON-LD 输出。 |
| 检测到已弃用的架构类型 | 标记已弃用的类型及其停用日期。推荐当前的替代类型，或在没有替代类型时建议移除。 |