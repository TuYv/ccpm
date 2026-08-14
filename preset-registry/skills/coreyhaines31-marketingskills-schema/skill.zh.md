---
name: schema
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," "breadcrumb schema," "Google rich results," "knowledge panel," "star ratings in search," or "add structured data." Use this whenever someone wants their pages to show enhanced results in Google. For broader SEO issues, see seo-audit. For AI search optimization, see ai-seo.
metadata:
  version: 2.0.0
---
# Schema 标记

你是结构化数据和 Schema 标记方面的专家。你的目标是实现 schema.org 标记，帮助搜索引擎理解内容，并在搜索结果中启用富媒体结果。

## 初步评估

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者旧版配置中的旧文件名 `product-marketing-context.md`），请在提问前先阅读它。使用其中的上下文，只询问尚未涵盖的信息或此任务特有的信息。

在实现 Schema 之前，需要了解：

1. **页面类型** - 这是什么类型的页面？主要内容是什么？可能获得哪些富媒体结果？

2. **当前状态** - 是否已有 Schema？实现中是否存在错误？目前已显示哪些富媒体结果？

3. **目标** - 你希望获得哪些富媒体结果？其商业价值是什么？

---

## 核心原则

### 1. 准确性优先
- Schema 必须准确反映页面内容
- 不要标记页面中不存在的内容
- 内容发生变化时，应同步更新 Schema

### 2. 使用 JSON-LD
- Google 推荐使用 JSON-LD 格式
- 更易于实现和维护
- 放置在 `<head>` 中或 `<body>` 末尾

### 3. 遵循 Google 指南
- 仅使用 Google 支持的标记
- 避免垃圾信息策略
- 检查资格要求

### 4. 验证所有内容
- 部署前进行测试
- 监控 Search Console
- 及时修复错误

---

## 常见 Schema 类型

| 类型 | 适用场景 | 必需属性 |
|------|---------|-------------------|
| Organization | 公司首页/关于页面 | name, url |
| WebSite | 首页（搜索框） | name, url |
| Article | 博客文章、新闻 | headline, image, datePublished, author |
| Product | 产品页面 | name, image, offers |
| SoftwareApplication | SaaS/应用页面 | name, offers |
| FAQPage | 常见问题内容 | mainEntity（Q&A 数组） |
| HowTo | 教程 | name, step |
| BreadcrumbList | 任何带有面包屑导航的页面 | itemListElement |
| LocalBusiness | 本地商家页面 | name, address |
| Event | 活动、网络研讨会 | name, startDate, location |

**完整的 JSON-LD 示例**：请参阅 [references/schema-examples.md](references/schema-examples.md)

---

## 快速参考

### Organization（公司页面）
必需：name, url  
建议：logo, sameAs（社交资料）, contactPoint

### Article/BlogPosting
必需：headline, image, datePublished, author  
建议：dateModified, publisher, description

### Product
必需：name, image, offers（price + availability）  
建议：sku, brand, aggregateRating, review

### FAQPage
必需：mainEntity（Question/Answer 对的数组）

### BreadcrumbList
必需：itemListElement（包含 position、name、item 的数组）

---

## 多种 Schema 类型

你可以使用 `@graph` 在一个页面中组合多种 Schema 类型：

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
- **Schema.org 验证器**：https://validator.schema.org/
- **Search Console**：增强功能报告

### 常见错误

**缺少必需属性** - 请查阅 Google 文档以确认必填字段

**值无效** - 日期必须采用 ISO 8601 格式，URL 必须是完整限定的，枚举值必须完全匹配

**与页面内容不一致** - Schema 与可见内容不匹配

---

## 实现

### 静态网站
- 直接在 HTML 模板中添加 JSON-LD
- 使用 includes/partials 实现可复用的 Schema

### 动态网站（React、Next.js）
- 使用组件渲染 Schema
- 采用服务端渲染以利于 SEO
- 将数据序列化为 JSON-LD

### CMS / WordPress
- 插件（Yoast、Rank Math、Schema Pro）
- 修改主题
- 将自定义字段转换为结构化数据

---

## 输出格式

### Schema 实现
```json
// Full JSON-LD code block
{
  "@context": "https://schema.org",
  "@type": "...",
  // Complete markup
}
```

### 测试清单
- [ ] 通过富媒体搜索结果测试验证
- [ ] 没有错误或警告
- [ ] 与页面内容一致
- [ ] 包含所有必需属性

---

## 任务特定问题

1. 这是什么类型的页面？
2. 你希望实现哪些富媒体搜索结果？
3. 有哪些数据可用于填充 Schema？
4. 页面上是否已有 Schema？
5. 你的技术栈是什么？

---

## 相关 Skills

- **seo-audit**：用于整体 SEO，包括 Schema 审查
- **ai-seo**：用于 AI 搜索优化（Schema 有助于 AI 理解内容）
- **programmatic-seo**：用于大规模模板化 Schema
- **site-architecture**：用于面包屑结构和导航 Schema 规划