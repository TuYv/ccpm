---
name: site-architecture
description: Technical SEO - robots.txt, sitemap, meta tags, Core Web Vitals
when-to-use: When setting up site architecture, meta tags, or technical SEO
user-invocable: false
paths: ["**/robots.txt", "**/sitemap*", "**/*.html", "public/**"]
effort: medium
---
# 网站架构技能


用于构建技术网站结构，使其能够被搜索引擎和 AI 爬虫（GPTBot、ClaudeBot、PerplexityBot）发现。

---

## 理念

**内容为王，架构为国。**

优秀的内容如果埋藏在糟糕的架构中，就无法被发现。这项技能涵盖了让以下对象能够找到你的内容所需的技术基础：
- Google、Bing（传统搜索）
- GPTBot（ChatGPT）、ClaudeBot、PerplexityBot（AI 助手）
- 社交平台（Open Graph、Twitter Cards）

---

## robots.txt

### 基础模板

```txt
# robots.txt

# Allow all crawlers by default
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /private/
Disallow: /_next/
Disallow: /cdn-cgi/

# Sitemap location
Sitemap: https://yoursite.com/sitemap.xml

# Crawl delay (optional - be careful, not all bots respect this)
# Crawl-delay: 1
```

### AI 机器人配置

```txt
# robots.txt with AI bot rules

# === SEARCH ENGINES ===
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

# === AI ASSISTANTS (Allow for discovery) ===
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: Claude-Web
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Amazonbot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

# === BLOCK AI TRAINING (Optional - block training, allow chat) ===
# Uncomment these if you want to be cited but not used for training
# User-agent: CCBot
# Disallow: /

# User-agent: GPTBot
# Disallow: /  # Blocks both chat and training

# === BLOCK SCRAPERS ===
User-agent: AhrefsBot
Disallow: /

User-agent: SemrushBot
Disallow: /

User-agent: MJ12bot
Disallow: /

# === DEFAULT ===
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /auth/
Disallow: /private/
Disallow: /*.json$
Disallow: /*?*

Sitemap: https://yoursite.com/sitemap.xml
```

### Next.js robots.txt

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://yoursite.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/', '/private/', '/_next/'],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## Sitemap

### XML Sitemap 模板

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>https://yoursite.com/</loc>
    <lastmod>2025-01-15</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://yoursite.com/pricing</loc>
    <lastmod>2025-01-10</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://yoursite.com/blog/article-slug</loc>
    <lastmod>2025-01-12</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
    <image:image>
      <image:loc>https://yoursite.com/images/article-image.jpg</image:loc>
    </image:image>
  </url>
</urlset>
```

### Next.js 动态站点地图

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://yoursite.com';

  // Static pages
  const staticPages = [
    { url: '/', priority: 1.0, changeFrequency: 'weekly' as const },
    { url: '/pricing', priority: 0.9, changeFrequency: 'monthly' as const },
    { url: '/about', priority: 0.8, changeFrequency: 'monthly' as const },
    { url: '/contact', priority: 0.7, changeFrequency: 'yearly' as const },
  ];

  // Dynamic pages (e.g., blog posts)
  const posts = await getBlogPosts(); // Your data fetching function
  const blogPages = posts.map((post) => ({
    url: `/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [
    ...staticPages.map((page) => ({
      url: `${baseUrl}${page.url}`,
      lastModified: new Date(),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...blogPages.map((page) => ({
      url: `${baseUrl}${page.url}`,
      lastModified: page.lastModified,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
  ];
}
```

### 站点地图索引（大型网站）

```xml
<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>https://yoursite.com/sitemap-pages.xml</loc>
    <lastmod>2025-01-15</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://yoursite.com/sitemap-blog.xml</loc>
    <lastmod>2025-01-14</lastmod>
  </sitemap>
  <sitemap>
    <loc>https://yoursite.com/sitemap-products.xml</loc>
    <lastmod>2025-01-13</lastmod>
  </sitemap>
</sitemapindex>
```

---

## Meta 标签

### 必需的 Meta 标签

```html
<head>
  <!-- Basic -->
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title | Brand Name</title>
  <meta name="description" content="Compelling 150-160 character description with keywords and CTA.">

  <!-- Canonical (prevent duplicate content) -->
  <link rel="canonical" href="https://yoursite.com/current-page">

  <!-- Language -->
  <html lang="en">
  <meta name="language" content="English">

  <!-- Robots -->
  <meta name="robots" content="index, follow">
  <meta name="googlebot" content="index, follow">

  <!-- Author -->
  <meta name="author" content="Author Name">

  <!-- Favicon -->
  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" href="/icon.svg" type="image/svg+xml">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/manifest.webmanifest">
</head>
```

### Open Graph（社交分享）

```html
<!-- Open Graph / Facebook -->
<meta property="og:type" content="website">
<meta property="og:url" content="https://yoursite.com/page">
<meta property="og:title" content="Page Title - Brand">
<meta property="og:description" content="Description for social sharing (can be longer).">
<meta property="og:image" content="https://yoursite.com/og-image.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="Brand Name">
<meta property="og:locale" content="en_US">

<!-- Article-specific (for blog posts) -->
<meta property="og:type" content="article">
<meta property="article:published_time" content="2025-01-15T08:00:00Z">
<meta property="article:modified_time" content="2025-01-20T10:00:00Z">
<meta property="article:author" content="https://yoursite.com/team/author">
<meta property="article:section" content="Technology">
<meta property="article:tag" content="AI, SEO, Content">
```

### Twitter 卡片

```html
<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@yourbrand">
<meta name="twitter:creator" content="@authorhandle">
<meta name="twitter:title" content="Page Title">
<meta name="twitter:description" content="Description for Twitter (max 200 chars).">
<meta name="twitter:image" content="https://yoursite.com/twitter-image.jpg">
```

### Next.js 元数据

```typescript
// app/layout.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL('https://yoursite.com'),
  title: {
    default: 'Brand Name',
    template: '%s | Brand Name',
  },
  description: 'Your default site description.',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  authors: [{ name: 'Brand Name', url: 'https://yoursite.com' }],
  creator: 'Brand Name',
  publisher: 'Brand Name',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://yoursite.com',
    siteName: 'Brand Name',
    title: 'Brand Name',
    description: 'Your site description.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Brand Name',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@yourbrand',
    creator: '@yourbrand',
  },
  verification: {
    google: 'google-verification-code',
    yandex: 'yandex-verification-code',
  },
};

// app/blog/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author.name],
      images: [post.coverImage],
    },
  };
}
```

---

## URL 结构

### 最佳实践

```markdown
✅ GOOD URLs:
/blog/ai-seo-best-practices
/products/pro-plan
/pricing
/about/team

❌ BAD URLs:
/blog?id=123
/p/12345
/index.php?page=about
/Products/Pro_Plan (inconsistent casing)
```

### URL 指南

| 规则 | 示例 |
|------|---------|
| 仅使用小写字母 | `/blog/my-post` 而非 `/Blog/My-Post` |
| 使用连字符而非下划线 | `/my-page` 而非 `/my_page` |
| 不使用尾部斜杠 | `/about` 而非 `/about/` |
| 使用描述性 slug | `/pricing` 而非 `/p` |
| 内容不使用查询参数 | `/blog/post-title` 而非 `/blog?id=123` |
| 最多 3-4 层深度 | `/blog/category/post` |

### 重定向配置

```typescript
// next.config.js
module.exports = {
  async redirects() {
    return [
      // Redirect old URLs to new
      {
        source: '/old-page',
        destination: '/new-page',
        permanent: true, // 301 redirect
      },
      // Redirect with wildcard
      {
        source: '/blog/old/:slug',
        destination: '/articles/:slug',
        permanent: true,
      },
      // Trailing slash redirect
      {
        source: '/:path+/',
        destination: '/:path+',
        permanent: true,
      },
    ];
  },
};
```

---

## 规范 URL

### 实现

```html
<!-- Always include canonical, even for primary URL -->
<link rel="canonical" href="https://yoursite.com/current-page">
```

### 使用时机

```markdown
✅ USE CANONICAL:
- Every page (even if only version exists)
- Paginated content (point to page 1 or use rel=prev/next)
- URL parameters that don't change content (?utm_source=...)
- HTTP vs HTTPS (canonical to HTTPS)
- www vs non-www (pick one, canonical to it)

Example: /products?sort=price should canonical to /products
```

### Next.js 规范 URL

```typescript
// Automatic in metadata
export const metadata: Metadata = {
  alternates: {
    canonical: '/current-page',
  },
};
```

---

## 安全标头

### 必需标头

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## Core Web Vitals

### 目标指标

| 指标 | 良好 | 需要改进 | 较差 |
|--------|------|-------------------|------|
| LCP (最大内容绘制) | ≤2.5s | ≤4.0s | >4.0s |
| INP (交互到下一次绘制) | ≤200ms | ≤500ms | >500ms |
| CLS (累计布局偏移) | ≤0.1 | ≤0.25 | >0.25 |

### 优化检查清单

```markdown
## LCP (Loading)
- [ ] Optimize largest image (WebP, proper sizing)
- [ ] Preload critical assets
- [ ] Use CDN for static assets
- [ ] Enable compression (gzip/brotli)
- [ ] Minimize render-blocking resources

## INP (Interactivity)
- [ ] Minimize JavaScript execution time
- [ ] Break up long tasks
- [ ] Use web workers for heavy computation
- [ ] Optimize event handlers
- [ ] Lazy load non-critical JS

## CLS (Visual Stability)
- [ ] Set dimensions on images/videos
- [ ] Reserve space for dynamic content
- [ ] Avoid inserting content above existing
- [ ] Use transform for animations
- [ ] Preload fonts
```

### Next.js 性能

```typescript
// Image optimization
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={630}
  priority // Preload for LCP
  placeholder="blur"
  blurDataURL={blurDataUrl}
/>

// Font optimization
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap', // Prevent FOIT
});

// Dynamic imports
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Skeleton />,
  ssr: false, // Client-only if needed
});
```

---

## 内部链接

### 结构

```markdown
## Link Architecture

Homepage
├── /pricing (1 click)
├── /features (1 click)
├── /blog (1 click)
│   ├── /blog/category-1 (2 clicks)
│   │   └── /blog/category-1/post (3 clicks)
│   └── /blog/category-2 (2 clicks)
└── /about (1 click)

Rule: Every page within 3 clicks of homepage
```

### 最佳实践

```markdown
✅ DO:
- Use descriptive anchor text
- Link contextually within content
- Create hub pages for topics
- Link to related content at end of posts
- Use breadcrumbs for navigation

❌ AVOID:
- "Click here" as anchor text
- Orphan pages (no internal links)
- Too many links per page (>100)
- Broken internal links
- Redirect chains
```

### 面包屑导航

```typescript
// components/Breadcrumbs.tsx
import Link from 'next/link';

interface BreadcrumbItem {
  name: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `https://yoursite.com${item.href}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav aria-label="Breadcrumb">
        <ol className="flex gap-2">
          {items.map((item, index) => (
            <li key={item.href}>
              {index > 0 && <span>/</span>}
              <Link href={item.href}>{item.name}</Link>
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
```

---

## AI 爬虫处理

### 已知 AI 爬虫

| 爬虫 | User Agent | 用途 |
|-----|------------|---------|
| GPTBot | `GPTBot` | ChatGPT 网页浏览 |
| ChatGPT-User | `ChatGPT-User` | ChatGPT 用户浏览 |
| ClaudeBot | `ClaudeBot` | Claude 网页访问 |
| Claude-Web | `Claude-Web` | Claude 网页功能 |
| PerplexityBot | `PerplexityBot` | Perplexity 搜索 |
| Google-Extended | `Google-Extended` | Gemini/Bard 训练 |
| Amazonbot | `Amazonbot` | Alexa/Amazon AI |
| CCBot | `CCBot` | Common Crawl（AI 训练） |

### 允许 AI 发现，阻止训练（可选）

```txt
# robots.txt

# Allow GPTBot for ChatGPT browsing
User-agent: GPTBot
Allow: /

# Block CCBot (used for training datasets)
User-agent: CCBot
Disallow: /

# Block Google AI training, allow search
User-agent: Google-Extended
Disallow: /
```

### AI 专用元标签

```html
<!-- Block AI training but allow indexing -->
<meta name="robots" content="index, follow, max-image-preview:large">

<!-- Opt out of AI training (proposed standard) -->
<meta name="ai-training" content="disallow">
```

---

## 结构化数据放置位置

### 在哪里添加 Schema

```html
<!-- Option 1: In <head> with JSON-LD (recommended) -->
<head>
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Your Company"
    }
  </script>
</head>

<!-- Option 2: Before closing </body> -->
<body>
  <!-- Page content -->
  <script type="application/ld+json">
    { "@context": "https://schema.org", ... }
  </script>
</body>
```

### 每页多个 Schema

```html
<head>
  <!-- Organization (site-wide) -->
  <script type="application/ld+json">
    { "@context": "https://schema.org", "@type": "Organization", ... }
  </script>

  <!-- BreadcrumbList (navigation) -->
  <script type="application/ld+json">
    { "@context": "https://schema.org", "@type": "BreadcrumbList", ... }
  </script>

  <!-- Article (page-specific) -->
  <script type="application/ld+json">
    { "@context": "https://schema.org", "@type": "Article", ... }
  </script>

  <!-- FAQPage (if FAQ section exists) -->
  <script type="application/ld+json">
    { "@context": "https://schema.org", "@type": "FAQPage", ... }
  </script>
</head>
```

---

## 项目结构

```
project/
├── public/
│   ├── robots.txt              # Or generate dynamically
│   ├── sitemap.xml             # Or generate dynamically
│   ├── favicon.ico
│   ├── icon.svg
│   ├── apple-touch-icon.png
│   ├── og-image.jpg            # Default OG image (1200x630)
│   └── manifest.webmanifest
├── app/
│   ├── layout.tsx              # Global metadata
│   ├── robots.ts               # Dynamic robots.txt
│   ├── sitemap.ts              # Dynamic sitemap
│   └── [page]/
│       └── page.tsx            # Page-specific metadata
├── components/
│   ├── SchemaMarkup.tsx
│   ├── Breadcrumbs.tsx
│   └── MetaTags.tsx
└── lib/
    ├── schema.ts               # Schema generators
    └── seo.ts                  # SEO utilities
```

---

## 验证与提交

### Search Console 设置

```bash
# Verify ownership methods
1. HTML file upload (google*.html to public/)
2. Meta tag (add to <head>)
3. DNS TXT record
4. Google Analytics (if already installed)
```

### 提交 Sitemap

```markdown
1. Google Search Console
   - Sitemaps → Add new sitemap → yoursite.com/sitemap.xml

2. Bing Webmaster Tools
   - Sitemaps → Submit sitemap

3. Yandex Webmaster (if relevant)
   - Indexing → Sitemap files
```

---

## 检查清单

```markdown
## Technical SEO Checklist

### robots.txt
- [ ] Allow search engines
- [ ] Allow AI bots (GPTBot, ClaudeBot, PerplexityBot)
- [ ] Block admin/private areas
- [ ] Include sitemap reference
- [ ] Test with Google's robots.txt tester

### Sitemap
- [ ] Include all indexable pages
- [ ] Exclude noindex pages
- [ ] Include lastmod dates
- [ ] Submit to Search Console
- [ ] Auto-update on content changes

### Meta Tags
- [ ] Unique title per page (50-60 chars)
- [ ] Unique description per page (150-160 chars)
- [ ] Canonical URL on every page
- [ ] Open Graph tags
- [ ] Twitter Card tags

### URL Structure
- [ ] Lowercase, hyphenated
- [ ] Descriptive slugs
- [ ] No query params for content
- [ ] 301 redirects for moved content
- [ ] No broken links

### Performance
- [ ] LCP < 2.5s
- [ ] INP < 200ms
- [ ] CLS < 0.1
- [ ] HTTPS enabled
- [ ] Security headers configured

### Structured Data
- [ ] Organization schema (homepage)
- [ ] BreadcrumbList (all pages)
- [ ] Article schema (blog posts)
- [ ] FAQ schema (FAQ sections)
- [ ] Validate with Rich Results Test
```

---

## 快速参考

### 文件检查清单

```
public/
├── robots.txt          ✓ Required
├── sitemap.xml         ✓ Required
├── favicon.ico         ✓ Required
├── og-image.jpg        ✓ Required (1200x630)
└── manifest.json       ○ Recommended
```

### Meta 标签长度

| 标签 | 长度 |
|-----|--------|
| 标题 | 50-60 个字符 |
| 描述 | 150-160 个字符 |
| OG 标题 | 60-90 个字符 |
| OG 描述 | 200 个字符 |
| Twitter 描述 | 200 个字符 |

### 图片尺寸

| 图片 | 尺寸 |
|-------|------------|
| OG 图片 | 1200 x 630 |
| Twitter 图片 | 1200 x 628 |
| Favicon | 32 x 32 |
| Apple Touch 图标 | 180 x 180 |