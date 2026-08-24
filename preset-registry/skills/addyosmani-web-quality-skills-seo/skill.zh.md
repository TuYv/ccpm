---
name: seo
description: Optimize for search engine visibility and ranking. Use when asked to "improve SEO", "optimize for search", "fix meta tags", "add structured data", "sitemap optimization", or "search engine optimization".
license: MIT
metadata:
  author: web-quality-skills
  version: "2.0"
---
# SEO 优化

基于 Lighthouse SEO 审计和 Google 搜索指南进行搜索引擎优化。重点关注技术 SEO、页面优化和结构化数据。

## 以证据为依据的审计工作流

当有可用的渲染页面时：

1. 在具备相应能力时，运行实时 Lighthouse SEO 和智能体浏览检查；使用 Chrome DevTools MCP 时，使用 `lighthouse_audit`。利用结果定位渲染页面中的问题。
2. 检查 Lighthouse 无法自行确定的信号：响应标头、重定向、`robots.txt`、站点地图覆盖情况、不同页面模板之间的规范网址一致性、结构化数据资格，以及用户提供访问权限时的 Search Console 证据。
3. 将技术性抓取和索引问题与内容质量和权威性问题区分开。不要编造排名因素权重，也不要承诺排名变化。
4. 修复源代码并重新运行相同的检查。对于索引或排名结果，应说明搜索引擎验证仍有待完成。

如果实时工具不可用，请使用特定类别的 Lighthouse CLI 输出，并直接检查源代码和 HTTP。Lighthouse SEO 分数涵盖了一部分有用的技术检查；它并不能预测排名。

| 领域 | 此技能可以验证的内容 |
|------|----------------------------|
| 抓取和索引控制 | 技术配置和一致性 |
| 渲染后的元数据和语义 | 是否存在、有效性以及页面模板问题 |
| 结构化数据 | 语法和资格信号，不保证获得富媒体搜索结果 |
| Core Web Vitals | 关联 Core Web Vitals 技能所提供的实测现场/实验室证据 |
| 内容实用性和权威性 | 审查质量，但不分配人为合成的排名百分比 |

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

**规范网址：**
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

**Sitemap 最佳实践：**
- 每个 sitemap 最多包含 50,000 个 URL 或 50MB
- 对于更大的网站，使用 sitemap index
- 仅包含规范化且可编入索引的 URL
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
- 使用连字符，而不是下划线
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

### Title 标签

```html
<!-- ❌ Missing or generic -->
<title>Page</title>
<title>Home</title>

<!-- ✅ Descriptive with primary keyword -->
<title>Blue Widgets for Sale | Premium Quality | Example Store</title>
```

**Title 标签指南：**
- 仅将 50–60 个字符作为粗略的 lint 检查参考，而不是通过/不通过的限制。Google 会截断 title link 以适应渲染设备的宽度，因此在工具支持时应预览宽度。
- 在开头附近自然地描述页面主题
- 每个页面都应保持唯一
- 在有助于用户区分搜索结果时添加品牌
- 适当时使用行动导向的表述

应将 title-link 重写与截断分开处理。即使 `<title>` 很短，Google 也可能根据可见的页面标题、标题、锚文本和其他来源生成不同的 title link；应调查其准确性和一致性，而不是自动缩短它。请参阅 [Google 的 title-link 指南](https://developers.google.com/search/docs/appearance/title-link)。

### Meta 描述

```html
<!-- ❌ Missing or duplicate -->
<meta name="description" content="">

<!-- ✅ Compelling and unique -->
<meta name="description" content="Shop premium blue widgets with free shipping. 30-day returns. Rated 4.9/5 by 10,000+ customers. Order today and save 20%.">
```

**Meta 描述指南：**
- 仅将大约 150–160 个字符作为 lint 检查参考。摘要取决于查询和设备，Google 可能会选择页面内容，而不是 meta description。
- 自然地描述页面主题
- 使用有吸引力的行动号召
- 每个页面都应保持唯一
- 与页面内容相匹配

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
- 使页面的主标题具有描述性，并确保层级明确；不要仅因为有效的 HTML 包含多个 `<h1>` 就判定页面不合格
- 层级应符合逻辑（不要跳过级别）
- 自然地包含关键词
- 具有描述性，而不是使用泛化的标题

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
- Alt 文本描述图片内容
- 进行压缩并设置适当尺寸
- 使用 WebP/AVIF，并提供回退格式
- 延迟加载首屏以下的图片

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
- 控制每页链接数量在合理范围内
- 及时修复失效链接
- 使用面包屑导航呈现层级关系

---

## 结构化数据（JSON-LD）

当用户请求架构标记，或审计发现结构化数据问题时，请阅读[结构化数据参考](references/STRUCTURED-DATA.md)。其中包含 Organization、Article、Product、FAQ 和 Breadcrumb 示例，以及验证链接。

* **描述可见且准确的内容。** 不要仅为了获得富摘要而添加某种类型或声明。
* **使用适用的最具体类型。** 在不同渲染结果之间保持标识符和绝对 URL 稳定。
* **验证渲染后的输出。** 通过语法验证并不保证符合搜索引擎资格要求或一定会展示。

## 代理式浏览与 AI 可发现性

请将以下概念分开：

* **Lighthouse Agentic Browsing** 衡量帮助助手理解并与渲染页面交互的技术信号。当前检查项目包括面向代理的无障碍树、可选的 `llms.txt`，以及在存在时对 WebMCP 注册信息、架构和表单覆盖情况的检查。
* **搜索索引和排名** 取决于搜索引擎系统，不能从 Agentic Browsing 分数中推断。
* **AI 摄取或引用** 因产品而异。技术上可浏览的页面或有效的 `llms.txt` 文件，并不能证明某个 AI 产品会摄取、排序或引用该页面。

优先采用语义化 HTML、描述性标签、可抓取内容、准确的元数据和清晰的页面结构，因为这些做法同时有益于用户、搜索引擎和代理。只有当应用具有可供公开的实用操作且用户希望进行相关集成时，才添加 WebMCP 工具；使用 Lighthouse 验证工具名称、描述、架构和表单注释。

### 爬虫控制因产品而异

分别审计每个有文档记录的用户代理，不要笼统地应用“AI 机器人”规则：

| 控制项 | 文档记录的用途 | 禁止访问的影响 |
|---------|--------------------|--------------------|
| `OAI-SearchBot` | ChatGPT 搜索发现 | 阻止页面内容被纳入 ChatGPT 摘要和片段；但链接和标题仍可能通过第三方发现机制出现 |
| `PerplexityBot` | Perplexity 搜索索引 | 阻止该爬虫将被禁止访问的内容编入搜索结果索引 |
| `Claude-SearchBot` / `Claude-User` | Claude 搜索索引 / 用户定向检索 | 可能降低搜索可见性 / 阻止响应用户定向请求时的检索 |
| `Google-Extended` | 控制 Google 抓取的内容是否用于某些 Gemini 训练和接地用途 | 不影响 Google 搜索收录或排名 |

诸如 `GPTBot` 和 `ClaudeBot` 之类的训练控制，与搜索和用户抓取控制是不同的。`GoogleOther` 是一种通用爬虫，并不是 AI 搜索可见性开关。请在供应商维护的文档中核实当前名称及其影响：[OpenAI](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)、[Perplexity](https://docs.perplexity.ai/docs/resources/perplexity-crawlers)、[Anthropic](https://privacy.anthropic.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler) 和 [Google](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers)。

### `llms.txt` 是可选的

`llms.txt` 是一项实验性提案，而不是跨供应商的发现标准。Lighthouse 可以验证 `/llms.txt` 的可用性和格式，但这并不能表明目标产品会读取它。只有在用户提出请求或有文档记录的使用方支持它时，才添加该文件；不要将其优先级置于可抓取性、语义化 HTML、准确的元数据和有用内容之上。绝不要将其视为排名或引用因素，也不要重复站点地图，或仅仅为了提高这项审计的结果而重新组织内容。

---

## 移动 SEO

### 响应式设计

```html
<!-- ❌ Not mobile-friendly -->
<meta name="viewport" content="width=1024">

<!-- ✅ Responsive viewport -->
<meta name="viewport" content="width=device-width, initial-scale=1">
```

### 点击目标

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

## SEO 审计清单

### 关键项
- [ ] 已启用 HTTPS
- [ ] robots.txt 允许抓取
- [ ] 重要页面没有 `noindex`
- [ ] 存在标题标签，且各不相同
- [ ] 页面主标题具有描述性，层级结构合理

### 高优先级
- [ ] 存在元描述
- [ ] 已提交站点地图
- [ ] 已设置规范 URL
- [ ] 适配移动设备
- [ ] Core Web Vitals 达标

### 中优先级
- [ ] 已实施结构化数据
- [ ] 内部链接策略
- [ ] 图片 alt 文本
- [ ] 描述性 URL
- [ ] 面包屑导航
- [ ] 在智能体访问很重要时，已检查 Agentic Browsing 失败情况

### 持续进行
- [ ] 在 Search Console 中修复抓取错误
- [ ] 内容发生变化时更新站点地图
- [ ] 监控排名变化
- [ ] 检查失效链接
- [ ] 查看 Search Console 洞察

---

## 工具

| 工具 | 用途 |
|------|-----|
| Google Search Console | 监控索引，修复问题 |
| Google PageSpeed Insights | 性能 + Core Web Vitals |
| Rich Results Test | 验证结构化数据 |
| Live Lighthouse audit (Chrome DevTools MCP: `lighthouse_audit`) | 为代理执行渲染后的 SEO 和 Agentic Browsing 检查 |
| Lighthouse CLI | SEO 审计备用方案 |
| Screaming Frog | 爬取分析 |

## 参考资料

- [Google Search Central](https://developers.google.com/search)
- [Schema.org](https://schema.org/)
- [Core Web Vitals](../core-web-vitals/SKILL.md)
- [Web Quality Audit](../web-quality-audit/SKILL.md)