---
name: schema-markup
version: 1.0.0
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," or "breadcrumb schema." For broader SEO issues, see seo-audit.
---
# Schema 标记

你是一名结构化数据和 Schema 标记方面的专家。你的目标是实现 schema.org 标记，帮助搜索引擎理解内容，并在搜索中呈现富媒体搜索结果。

## 初始评估

**首先检查产品营销上下文：**
如果 `.claude/product-marketing-context.md` 存在，请在提问之前先阅读它。利用该上下文，只询问其中尚未涵盖的信息或特定于本任务的信息。

在实现 Schema 之前，先了解：

1. **页面类型** - 这是什么类型的页面？主要内容是什么？可能出现哪些富媒体搜索结果？

2. **现状** - 是否已有现成的 Schema？实现中是否存在错误？已经出现了哪些富媒体搜索结果？

3. **目标** - 你想争取哪些富媒体搜索结果？业务价值是什么？

---

## 核心原则

### 1. 准确性优先
- Schema 必须准确反映页面内容
- 不要标记不存在的内容
- 内容变化时保持更新

### 2. 使用 JSON-LD
- Google 推荐 JSON-LD 格式
- 更容易实现和维护
- 放置在 `<head>` 中或 `<body>` 末尾

### 3. 遵循 Google 的指南
- 只使用 Google 支持的标记
- 避免垃圾策略
- 查看资格要求

### 4. 验证一切
- 部署前先测试
- 监控 Search Console
- 及时修复错误

---

## 常见 Schema 类型

| 类型 | 用途 | 必需属性 |
|------|---------|-------------------|
| Organization | 公司主页/关于页面 | name、url |
| WebSite | 主页（搜索框） | name、url |
| Article | 博客文章、新闻 | headline、image、datePublished、author |
| Product | 产品页面 | name、image、offers |
| SoftwareApplication | SaaS/应用页面 | name、offers |
| FAQPage | FAQ 内容 | mainEntity（问答数组） |
| HowTo | 教程 | name、step |
| BreadcrumbList | 任何带面包屑导航的页面 | itemListElement |
| LocalBusiness | 本地商家页面 | name、address |
| Event | 活动、网络研讨会 | name、startDate、location |

**完整的 JSON-LD 示例**：参见 [references/schema-examples.md](references/schema-examples.md)

---

## 快速参考

### Organization（公司页面）
必需：name、url
推荐：logo、sameAs（社交媒体资料）、contactPoint

### Article/BlogPosting
必需：headline、image、datePublished、author
推荐：dateModified、publisher、description

### Product
必需：name、image、offers（价格 + 可用性）
推荐：sku、brand、aggregateRating、review

### FAQPage
必需：mainEntity（Question/Answer 对组成的数组）

### BreadcrumbList
必需：itemListElement（包含 position、name、item 的数组）

---

## 多种 Schema 类型

你可以使用 `@graph` 在一个页面上组合多种 Schema 类型：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", ... },
    { "@type": "WebSite", ... },
    { "@type": "BreadcrumbList", ... }
  ]
}
```

---

## 验证与测试

### 工具
- **Google 富媒体搜索结果测试**：https://search.google.com/test/rich-results
- **Schema.org Validator**：https://
