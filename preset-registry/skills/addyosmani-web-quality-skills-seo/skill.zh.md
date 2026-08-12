---
name: seo
description: Optimize for search engine visibility and ranking. Use when asked to "improve SEO", "optimize for search", "fix meta tags", "add structured data", "sitemap optimization", or "search engine optimization".
license: MIT
metadata:
  author: web-quality-skills
  version: "1.0"
---
# SEO 优化

基于 Lighthouse SEO 审核和 Google 搜索指南的搜索引擎优化。重点关注技术 SEO、页面优化和结构化数据。

## SEO 基础

搜索排名因素（大致影响）：

| 因素 | 影响 | 此 Skill |
|--------|-----------|------------|
| 内容质量与相关性 | ~40% | 部分（结构） |
| 反向链接与权威性 | ~25% | ✗ |
| 技术 SEO | ~15% | ✓ |
| 页面体验（Core Web Vitals） | ~10% | 参见 [Core Web Vitals](../core-web-vitals/SKILL.md) |
| 页面 SEO | ~10% | ✓ |

---

## 技术 SEO

### 可抓取性

**robots.txt：**
```text
# /robots.txt
User-agent: *
Allow: /

# Block admin/private areas
Disallow: /admin/
Disallow: /api/
Disallow: /private/

# Don't block resources needed for rendering
# ❌ Disallow: /static/

Sitemap: https://example.com/sitemap.xml
```

**Meta robots：**
```html
<!-- Default: indexable, followable -->
<meta name="robots" content="index, follow">

<!-- Noindex specific pages -->
<meta name="robots" content="noindex, nofollow">

<!-- Indexable but don't follow links -->
<meta name="robots" content="index, nofollow">

<!-- Control snippets -->
<meta name="robots" content="max-snippet:150, max-image-preview:large">
```

**规范 URL：**
```html
<!-- Prevent duplicate content issues -->
<link rel="canonical" href="https://example.com/page">

<!-- Self-referencing canonical (recommended) -->
<link rel="canonical" href="https://example.com/current-page">

<!-- For paginated content -->
<link rel="canonical" href="https://example.com/products">
<!-- Or use rel="prev" / rel="next" for explicit pagination -->
```

### XML 站点地图

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com/</loc>
    <lastmod>2024-01-15</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://example.com/products</loc>
    <lastmod>2024-01-14</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
</urlset>
```

**站点地图最佳实践：**
- 每个站点地图最多包含 50,000 个 URL 或不超过 50MB
- 对于较大的网站，使用站点地图索引
- 仅包含规范且可被索引的 URL
- 内容发生变化时更新 `lastmod`
- 提交到 Google Search Console

### URL 结构

```
✅ Good URLs:
https://example.com/products/blue-widget
https://example.com/blog/how-to-use-widgets

❌ Poor URLs:
https://example.com/p?id=12345
https://example.com/products/item/category/subcategory/blue-widget-2024-sale-discount
```

**URL 指南：**
- 使用连字符，而非下划线
- 仅使用小写字母
- 保持简短（< 75 个字符）
- 自然地包含目标关键词
- 尽可能避免使用参数
- 始终使用 HTTPS

### HTTPS 与安全性

```html
<!-- Ensure all resources use HTTPS -->
<img src="https://example.com/image.jpg">

<!-- Not: -->
<img src="http://example.com/image.jpg">
```

**用于 SEO 信任信号的安全标头：**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
```

---

## 页面 SEO

### 标题标签

```html
<!-- ❌ Missing or generic -->
<title>Page</title>
<title>Home</title>

<!-- ✅ Descriptive with primary keyword -->
<title>Blue Widgets for Sale | Premium Quality | Example Store</title>
```

**标题标签指南：**
- 50-60 个字符（Google 会在约 60 个字符处截断）
- 将主要关键词置于靠近开头的位置
- 每个页面的标题都应唯一
- 品牌名称放在末尾（首页除外）
- 适当时采用行动导向的表述

### 元描述

```html
<!-- ❌ Missing or duplicate -->
<meta name="description" content="">

<!-- ✅ Compelling and unique -->
<meta name="description" content="Shop premium blue widgets with free shipping. 30-day returns. Rated 4.9/5 by 10,000+ customers. Order today and save 20%.">
```

**元描述指南：**
- 150-160 个字符
- 自然地包含主要关键词
- 包含有吸引力的行动号召
- 每个页面的元描述都应唯一
- 与页面内容相符

### 标题结构

```html
<!-- ❌ Poor structure -->
<h2>Welcome to Our Store</h2>
<h4>Products</h4>
<h1>Contact Us</h1>

<!-- ✅ Proper hierarchy -->
<h1>Blue Widgets - Premium Quality</h1>
  <h2>Product Features</h2>
    <h3>Durability</h3>
    <h3>Design</h3>
  <h2>Customer Reviews</h2>
  <h2>Pricing</h2>
```

**标题指南：**
- 每个页面只使用一个 `<h1>`（页面的主要主题）
- 使用合理的层级结构（不要跳过层级）
- 自然地包含关键词
- 使用描述性标题，而非笼统标题

### 图片 SEO

```html
<!-- ❌ Poor image SEO -->
<img src="IMG_12345.jpg">

<!-- ✅ Optimized image -->
<img src="blue-widget-product-photo.webp"
     alt="Blue widget with chrome finish, side view showing control panel"
     width="800"
     height="600"
     loading="lazy">
```

**图片指南：**
- 使用包含关键词的描述性文件名
- Alt 文本应描述图片内容
- 对图片进行压缩并设置适当尺寸
- 使用 WebP/AVIF，并提供后备格式
- 对首屏以下的图片使用延迟加载

### 内部链接

```html
<!-- ❌ Non-descriptive -->
<a href="/products">Click here</a>
<a href="/widgets">Read more</a>

<!-- ✅ Descriptive anchor text -->
<a href="/products/blue-widgets">Browse our blue widget collection</a>
<a href="/guides/widget-maintenance">Learn how to maintain your widgets</a>
```

**链接指南：**
- 使用包含关键词的描述性锚文本
- 链接到相关的内部页面
- 每个页面使用数量合理的链接
- 及时修复失效链接
- 使用面包屑导航体现层级结构

---

## 结构化数据（JSON-LD）

### 组织

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/example",
    "https://linkedin.com/company/example"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-123-4567",
    "contactType": "customer service"
  }
}
</script>
```

### 文章

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Choose the Right Widget",
  "description": "Complete guide to selecting widgets for your needs.",
  "image": "https://example.com/article-image.jpg",
  "author": {
    "@type": "Person",
    "name": "Jane Smith",
    "url": "https://example.com/authors/jane-smith"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Blog",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "datePublished": "2024-01-15",
  "dateModified": "2024-01-20"
}
</script>
```

### 产品

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Blue Widget Pro",
  "image": "https://example.com/blue-widget.jpg",
  "description": "Premium blue widget with advanced features.",
  "brand": {
    "@type": "Brand",
    "name": "WidgetCo"
  },
  "offers": {
    "@type": "Offer",
    "price": "49.99",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://example.com/products/blue-widget"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "1250"
  }
}
</script>
```

### 常见问题

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What colors are available?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Our widgets come in blue, red, and green."
      }
    },
    {
      "@type": "Question",
      "name": "What is the warranty?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All widgets include a 2-year warranty."
      }
    }
  ]
}
</script>
```

### 面包屑导航

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://example.com"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Products",
      "item": "https://example.com/products"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Blue Widgets",
      "item": "https://example.com/products/blue-widgets"
    }
  ]
}
</script>
```

### 验证

在以下工具中测试结构化数据：
- [Google 富媒体搜索结果测试](https://search.google.com/test/rich-results)
- [Schema.org 验证器](https://validator.schema.org/)

---

## AI 搜索可见性（新兴领域）

一类 AI 搜索引擎（ChatGPT 搜索、Perplexity、Gemini Overviews）会引用其训练和检索流程中的网页，而非经典的排名结果。截至 2026 年，这仍是一个不稳定的领域——目前没有已确认的排名信号——但有几项措施成本较低，而且不会产生负面影响：

- **不要一概屏蔽 AI 爬虫。** `OAI-SearchBot`、`PerplexityBot`、`GoogleOther`、`Google-Extended`、`ClaudeBot` 等在 `robots.txt` 中各自拥有独立的用户代理。应逐个爬虫作出决定，而不是一刀切地全部屏蔽——设置 `Disallow` 会使你的网站无法被该爬虫引用。
- **充分利用 schema.org 的 `Article`/`Product`/`FAQPage`。** AI 摘要工具解析结构化数据的可靠性高于解析正文布局。上面的结构化数据示例同样有助于提升这方面的表现。
- **让首段中的回答能够独立成篇。** 精选摘要和 AI 摘要都会提取简短、连贯的段落。相比埋藏在营销文案中的相同内容，前 1-2 句话中的定义或直接回答更容易被提取。

### `llms.txt` — 新兴但未经验证

[`llms.txt`](https://llmstxt.org/) 是一项拟议中的约定（以 Markdown 索引形式列出网站的重要页面，并通过 `/llms.txt` 提供），供 LLM 使用。截至 2026 年年中，其采用率约为网站总数的 0.015%，并且**没有任何主要 AI 供应商确认会读取它**。对于内容型网站，可以将其视为一项耗时 5 分钟的尝试性补充，而不是有实际意义的排名或引用因素，也不要围绕它重新组织内容。

---

## 移动端 SEO

### 响应式设计

```html
<!-- ❌ Not mobile-friendly -->
<meta name="viewport" content="width=1024">

<!-- ✅ Responsive viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 点按目标

```css
/* ❌ Too small for mobile */
.small-link {
  padding: 4px;
  font-size: 12px;
}

/* ✅ Adequate tap target */
.mobile-friendly-link {
  padding: 12px;
  font-size: 16px;
  min-height: 48px;
  min-width: 48px;
}
```

### 字体大小

```css
/* ❌ Too small on mobile */
body {
  font-size: 10px;
}

/* ✅ Readable without zooming */
body {
  font-size: 16px;
  line-height: 1.5;
}
```

---

## 国际 SEO

### Hreflang 标签

```html
<!-- For multi-language sites -->
<link rel="alternate" hreflang="en" href="https://example.com/page">
<link rel="alternate" hreflang="es" href="https://example.com/es/page">
<link rel="alternate" hreflang="fr" href="https://example.com/fr/page">
<link rel="alternate" hreflang="x-default" href="https://example.com/page">
```

### 语言声明

```html
<html lang="en">
<!-- or -->
<html lang="es-MX">
```

---

## SEO 审核清单

### 关键项
- [ ] 已启用 HTTPS
- [ ] robots.txt 允许抓取
- [ ] 重要页面上没有 `noindex`
- [ ] 标题标签存在且唯一
- [ ] 每个页面只有一个 `<h1>`

### 高优先级
- [ ] 存在元描述
- [ ] 已提交站点地图
- [ ] 已设置规范 URL
- [ ] 支持移动端响应式布局
- [ ] Core Web Vitals 达标

### 中优先级
- [ ] 已实施结构化数据
- [ ] 内部链接策略
- [ ] 图片替代文本
- [ ] 描述性 URL
- [ ] 面包屑导航

### 持续事项
- [ ] 修复 Search Console 中的抓取错误
- [ ] 内容发生变化时更新站点地图
- [ ] 监控排名变化
- [ ] 检查失效链接
- [ ] 查看 Search Console 洞察

---

## 工具

| 工具 | 用途 |
|------|-----|
| Google Search Console | 监控索引编制并修复问题 |
| Google PageSpeed Insights | 性能 + Core Web Vitals |
| Rich Results Test | 验证结构化数据 |
| Lighthouse | 完整的 SEO 审核 |
| Screaming Frog | 抓取分析 |

## 参考资料

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Core Web Vitals](../core-web-vitals/SKILL.md)
- [Web Quality Audit](../web-quality-audit/SKILL.md)