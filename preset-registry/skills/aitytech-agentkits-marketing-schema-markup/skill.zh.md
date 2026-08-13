---
name: schema-markup
version: "1.0.0"
brand: AgentKits Marketing by AityTech
category: seo-growth
difficulty: intermediate
description: When the user wants to add, fix, or optimize schema markup and structured data on their site. Also use when the user mentions "schema markup," "structured data," "JSON-LD," "rich snippets," "schema.org," "FAQ schema," "product schema," "review schema," or "breadcrumb schema." For broader SEO issues, see seo-audit.
triggers:
  - schema
  - structured data
  - JSON-LD
  - rich snippets
  - schema.org
  - FAQ schema
  - product schema
  - review schema
prerequisites:
  - seo-mastery
related_skills:
  - seo-mastery
  - programmatic-seo
agents:
  - seo-specialist
  - attraction-specialist
mcp_integrations:
  optional:
    - google-search-console
success_metrics:
  - rich_snippet_appearance
  - CTR_improvement
---
# Schema 标记

你是结构化数据和 Schema 标记方面的专家。你的目标是实施 schema.org 标记，帮助搜索引擎理解内容，并在搜索结果中启用富媒体搜索结果。

## 初步评估

在实施 Schema 之前，请先了解：

1. **页面类型**
   - 这是什么类型的页面？
   - 主要内容是什么？
   - 可以获得哪些富媒体搜索结果？

2. **当前状态**
   - 是否已有 Schema？
   - 当前实施中是否存在错误？
   - 已经出现了哪些富媒体搜索结果？

3. **目标**
   - 你的目标是获得哪些富媒体搜索结果？
   - 其商业价值是什么？

---

## 核心原则

### 1. 准确性优先
- Schema 必须准确反映页面内容
- 不要标记并不存在的内容
- 内容发生变化时，应及时更新 Schema

### 2. 使用 JSON-LD
- Google 推荐使用 JSON-LD 格式
- 更易于实施和维护
- 将其放置在 `<head>` 中或 `<body>` 末尾

### 3. 遵循 Google 指南
- 仅使用 Google 支持的标记
- 避免垃圾信息操纵手段
- 查看资格要求

### 4. 验证所有内容
- 部署前进行测试
- 监控 Search Console
- 及时修复错误

---

## 常见 Schema 类型

### Organization
**适用于**：公司或品牌主页，或关于页面

**必需属性**：
- name
- url

**推荐属性**：
- logo
- sameAs（社交媒体资料）
- contactPoint

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Company",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": [
    "https://twitter.com/example",
    "https://linkedin.com/company/example",
    "https://facebook.com/example"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-555-5555",
    "contactType": "customer service"
  }
}
```

### WebSite（带 SearchAction）
**适用于**：主页，可启用站点链接搜索框

**必需属性**：
- name
- url

**用于搜索框**：
- 带有 SearchAction 的 potentialAction

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Example",
  "url": "https://example.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://example.com/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}
```

### Article / BlogPosting
**适用于**：博客文章、新闻文章

**必需属性**：
- headline
- image
- datePublished
- author

**推荐属性**：
- dateModified
- publisher
- description
- mainEntityOfPage

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How to Implement Schema Markup",
  "image": "https://example.com/image.jpg",
  "datePublished": "2024-01-15T08:00:00+00:00",
  "dateModified": "2024-01-20T10:00:00+00:00",
  "author": {
    "@type": "Person",
    "name": "Jane Doe",
    "url": "https://example.com/authors/jane"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Company",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  },
  "description": "A complete guide to implementing schema markup...",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/schema-guide"
  }
}
```

### Product
**适用于**：产品页面（电子商务或 SaaS）

**必需属性**：
- name
- image
- offers（包含价格和库存状态）

**推荐属性**：
- description
- sku
- brand
- aggregateRating
- review

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Premium Widget",
  "image": "https://example.com/widget.jpg",
  "description": "Our best-selling widget for professionals",
  "sku": "WIDGET-001",
  "brand": {
    "@type": "Brand",
    "name": "Example Co"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/products/widget",
    "priceCurrency": "USD",
    "price": "99.99",
    "availability": "https://schema.org/InStock",
    "priceValidUntil": "2024-12-31"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "127"
  }
}
```

### SoftwareApplication
**适用于**：SaaS 产品页面、应用落地页

**必需属性**：
- name
- offers（或免费标识）

**推荐属性**：
- applicationCategory
- operatingSystem
- aggregateRating

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "Example App",
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web, iOS, Android",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.6",
    "ratingCount": "1250"
  }
}
```

### FAQPage
**适用于**：包含常见问题的页面

**必需属性**：
- mainEntity（Question/Answer 数组）

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is schema markup?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Schema markup is a structured data vocabulary that helps search engines understand your content..."
      }
    },
    {
      "@type": "Question",
      "name": "How do I implement schema?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The recommended approach is to use JSON-LD format, placing the script in your page's head..."
      }
    }
  ]
}
```

### HowTo
**适用于**：指导性内容、教程

**必需属性**：
- name
- step（HowToStep 数组）

**推荐属性**：
- image
- totalTime
- estimatedCost
- supply/tool

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Add Schema Markup to Your Website",
  "description": "A step-by-step guide to implementing JSON-LD schema",
  "totalTime": "PT15M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Choose your schema type",
      "text": "Identify the appropriate schema type for your page content...",
      "url": "https://example.com/guide#step1"
    },
    {
      "@type": "HowToStep",
      "name": "Write the JSON-LD",
      "text": "Create the JSON-LD markup following schema.org specifications...",
      "url": "https://example.com/guide#step2"
    },
    {
      "@type": "HowToStep",
      "name": "Add to your page",
      "text": "Insert the script tag in your page's head section...",
      "url": "https://example.com/guide#step3"
    }
  ]
}
```

### BreadcrumbList
**适用于**：任何带有面包屑导航的页面

```json
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
      "name": "Blog",
      "item": "https://example.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "SEO Guide",
      "item": "https://example.com/blog/seo-guide"
    }
  ]
}
```

### LocalBusiness
**适用于**：本地商家的地点页面

**必需属性**：
- name
- address
- （因商家类型而异）

```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Example Coffee Shop",
  "image": "https://example.com/shop.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main Street",
    "addressLocality": "San Francisco",
    "addressRegion": "CA",
    "postalCode": "94102",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "37.7749",
    "longitude": "-122.4194"
  },
  "telephone": "+1-555-555-5555",
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  ],
  "priceRange": "$$"
}
```

### Review / AggregateRating
**适用于**：评价页面或带有评价的产品页面

注意：自利性评价（评价自己的产品）违反相关指南。评价必须来自真实客户。

```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Example Product",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.5",
    "bestRating": "5",
    "worstRating": "1",
    "ratingCount": "523"
  },
  "review": [
    {
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": "John Smith"
      },
      "datePublished": "2024-01-10",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5"
      },
      "reviewBody": "Excellent product, exceeded my expectations..."
    }
  ]
}
```

### Event
**适用于**：活动页面、网络研讨会、会议

**必需属性**：
- name
- startDate
- location（在线活动则为 eventAttendanceMode）

```json
{
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "Annual Marketing Conference",
  "startDate": "2024-06-15T09:00:00-07:00",
  "endDate": "2024-06-15T17:00:00-07:00",
  "eventAttendanceMode": "https://schema.org/OnlineEventAttendanceMode",
  "eventStatus": "https://schema.org/EventScheduled",
  "location": {
    "@type": "VirtualLocation",
    "url": "https://example.com/conference"
  },
  "image": "https://example.com/conference.jpg",
  "description": "Join us for our annual marketing conference...",
  "offers": {
    "@type": "Offer",
    "url": "https://example.com/conference/tickets",
    "price": "199",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "validFrom": "2024-01-01"
  },
  "performer": {
    "@type": "Organization",
    "name": "Example Company"
  },
  "organizer": {
    "@type": "Organization",
    "name": "Example Company",
    "url": "https://example.com"
  }
}
```

---

## 一个页面上的多种 Schema 类型

你可以（而且通常应该）使用多种 Schema 类型：

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://example.com/#organization",
      "name": "Example Company",
      "url": "https://example.com"
    },
    {
      "@type": "WebSite",
      "@id": "https://example.com/#website",
      "url": "https://example.com",
      "name": "Example",
      "publisher": {
        "@id": "https://example.com/#organization"
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [...]
    }
  ]
}
```

---

## 验证与测试

### 工具
- **Google 富媒体搜索结果测试**：https://search.google.com/test/rich-results
- **Schema.org 验证工具**：https://validator.schema.org/
- **Search Console**：增强功能报告

### 常见错误

**缺少必需属性**
- 查看 Google 文档以了解必填字段
- 这些字段与 schema.org 的最低要求不同

**无效值**
- 日期必须采用 ISO 8601 格式
- URL 必须是完整限定的 URL
- 枚举必须使用精确值

**与页面内容不匹配**
- Schema 与可见内容不匹配
- 产品没有显示评论，却包含评分
- 价格与显示的价格不一致

---

## 实现模式

### 静态网站
- 直接在 HTML 模板中添加 JSON-LD
- 使用 includes/partials 来复用 Schema

### 动态网站（React、Next.js 等）
- 使用组件渲染 Schema
- 为 SEO 进行服务端渲染
- 将数据序列化为 JSON-LD

```jsx
// Next.js example
export default function ProductPage({ product }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    // ... other properties
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>
      {/* Page content */}
    </>
  );
}
```

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

### 放置说明
在哪里添加代码以及如何添加

### 测试检查清单
- [ ] 通过富媒体搜索结果测试的验证
- [ ] 没有错误或警告
- [ ] 与页面内容匹配
- [ ] 包含所有必需属性

---

## 需要询问的问题

如果你需要更多上下文：
1. 这是什么类型的页面？
2. 你希望获得哪些富媒体搜索结果？
3. 有哪些数据可用于填充 Schema？
4. 页面上是否已有 Schema？
5. 你的实现技术栈是什么？

---

## 相关技能

- **seo-audit**：用于整体 SEO，包括 Schema 审查
- **programmatic-seo**：用于大规模模板化 Schema
- **analytics-tracking**：用于衡量富媒体搜索结果的影响