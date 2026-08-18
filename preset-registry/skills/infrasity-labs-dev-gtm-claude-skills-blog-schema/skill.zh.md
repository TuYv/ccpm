---
name: blog-schema
description: >
  Generate complete JSON-LD schema markup for blog posts including BlogPosting,
  Person, Organization, BreadcrumbList, FAQPage, and ImageObject. Validates
  against Google requirements and warns about deprecated types. Use when user
  says "schema", "blog schema", "json-ld", "structured data", "schema markup",
  "generate schema".
user-invokable: true
argument-hint: "<file-path>"
---
# 博客 Schema：JSON-LD 结构化数据生成

使用 @graph 模式为博客文章生成完整且经过验证的 JSON-LD Schema 标记。将多种 Schema 类型合并到单个脚本标签中，并使用稳定的 @id 引用来链接实体。

## 工作流程

### 第 1 步：读取内容

读取博客文章并提取所有与 Schema 相关的数据：
- **标题**（headline）
- **作者**（姓名、职位、社交链接、资历）
- **日期**（datePublished、dateModified / lastUpdated）
- **描述**（元描述）
- **FAQ 部分**（问题和答案对）
- **图片**（封面图片 URL、尺寸、替代文本；内嵌图片）
- **组织信息**（网站名称、URL、徽标）
- **字数**（根据内容长度估算）
- **标签/分类**（用于 BreadcrumbList 分类）
- **Slug**（来自文件名或 frontmatter）

### 第 2 步：生成 BlogPosting Schema

包含所有必需属性和推荐属性的完整 BlogPosting：

```json
{
  "@type": "BlogPosting",
  "@id": "{siteUrl}/blog/{slug}#article",
  "headline": "Post title (max 110 chars)",
  "description": "Meta description (150-160 chars)",
  "datePublished": "YYYY-MM-DD",
  "dateModified": "YYYY-MM-DD",
  "author": { "@id": "{siteUrl}/author/{author-slug}#person" },
  "publisher": { "@id": "{siteUrl}#organization" },
  "image": { "@id": "{siteUrl}/blog/{slug}#primaryimage" },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "{siteUrl}/blog/{slug}"
  },
  "wordCount": 2400,
  "articleBody": "First 200 characters of content as excerpt..."
}
```

必需属性：@type、headline、datePublished、author、publisher、image。
推荐属性：description、dateModified、mainEntityOfPage、wordCount、
articleBody（摘要）。

### 第 3 步：生成 Person Schema

使用稳定的 @id 进行交叉引用的作者 Schema：

```json
{
  "@type": "Person",
  "@id": "{siteUrl}/author/{author-slug}#person",
  "name": "Author Name",
  "jobTitle": "Role or Title",
  "url": "{siteUrl}/author/{author-slug}",
  "sameAs": [
    "https://twitter.com/handle",
    "https://linkedin.com/in/handle",
    "https://github.com/handle"
  ]
}
```

可选属性（可用时包含）：
- `alumniOf` - 教育机构（Organization 类型）
- `worksFor` - 雇主（如果是同一实体，则引用 Organization @id）

### 第 4 步：生成 Organization Schema

博客的上级组织实体：

```json
{
  "@type": "Organization",
  "@id": "{siteUrl}#organization",
  "name": "Organization Name",
  "url": "{siteUrl}",
  "logo": {
    "@type": "ImageObject",
    "url": "{siteUrl}/logo.png",
    "width": 600,
    "height": 60
  },
  "sameAs": [
    "https://twitter.com/org",
    "https://linkedin.com/company/org",
    "https://github.com/org"
  ]
}
```

徽标要求：必须是有效的图片 URL。Google 建议徽标尺寸至少为
112x112px，宽度最大为 600px。对于 BlogPosting 发布者，首选矩形徽标。

### 第 5 步：生成 BreadcrumbList

展示内容层级结构的导航面包屑 Schema：

```json
{
  "@type": "BreadcrumbList",
  "@id": "{siteUrl}/blog/{slug}#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "{siteUrl}"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Category Name",
      "item": "{siteUrl}/blog/category/{category-slug}"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Post Title",
      "item": "{siteUrl}/blog/{slug}"
    }
  ]
}
```

如果没有可用的分类，请使用 "Blog" 作为第二个面包屑项，并将
`{siteUrl}/blog` 作为 URL。

### 步骤 6：生成 FAQPage Schema

从博客文章的 FAQ 部分提取问答对：

```json
{
  "@type": "FAQPage",
  "@id": "{siteUrl}/blog/{slug}#faq",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the question?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The complete answer text (40-60 words with statistic)."
      }
    }
  ]
}
```

重要说明：自 2023 年 8 月起，Google 已将 FAQ 富媒体搜索结果限制在政府和医疗健康
网站。然而，FAQ schema 标记仍然具有价值，
因为：
- AI 系统（ChatGPT、Perplexity、Gemini）会提取 FAQ 数据用于引用
- 它为未来富媒体搜索结果资格的变化提供结构化内容
- 它可以改善内容组织信号

### 步骤 7：生成 VideoObject（如果存在视频）

对于文章中嵌入的每个 YouTube 视频，生成一个 VideoObject schema：

```json
{
  "@type": "VideoObject",
  "@id": "{siteUrl}/blog/{slug}#video-{index}",
  "name": "Video title",
  "description": "Video description excerpt (first 200 chars)",
  "thumbnailUrl": "https://img.youtube.com/vi/{videoId}/hqdefault.jpg",
  "uploadDate": "{ISO 8601 date}",
  "contentUrl": "https://www.youtube.com/watch?v={videoId}",
  "embedUrl": "https://www.youtube.com/embed/{videoId}",
  "duration": "PT{M}M{S}S",
  "interactionStatistic": {
    "@type": "InteractionCounter",
    "interactionType": { "@type": "WatchAction" },
    "userInteractionCount": {viewCount}
  }
}
```

将每个 VideoObject 添加到 @graph 数组中。为
@id 片段使用 `#video-1`、`#video-2` 等。从嵌入内容的 noscript 后备内容中提取视频元数据，或者如果可通过 `blog-google` 使用 YouTube Data API，则从该 API 提取。

### 步骤 7.5：生成 ImageObject

为文章的主图生成封面图片 schema：

```json
{
  "@type": "ImageObject",
  "@id": "{siteUrl}/blog/{slug}#primaryimage",
  "url": "https://cdn.pixabay.com/photo/.../image.jpg",
  "width": 1200,
  "height": 630,
  "caption": "Descriptive caption matching alt text"
}
```

图片要求：
- URL 必须可被抓取并可公开访问
- 宽度和高度应反映图片的实际尺寸
- 标题应与图片的 alt 文本一致或高度相符
- 首选尺寸：1200x630（兼容 OG）或 1920x1080

### 步骤 8：验证并警告

检查已弃用的 schema 类型并应用验证规则：

**切勿使用以下已弃用的类型：**
- **HowTo** - 2023 年 9 月弃用（Google 不再显示富媒体搜索结果）
- **SpecialAnnouncement** - 2025 年 7 月弃用
- **Practice Problem** - 已弃用（教育标记）
- **Dataset** - 已弃用于一般用途
- **Sitelinks Search Box** - 已弃用
- **Q&A** - 2026 年 1 月弃用（与 FAQPage 不同）

**验证检查：**
1. 所有 @id 引用均解析到 @graph 中的实体
2. dateModified 等于或晚于 datePublished
3. headline 不超过 110 个字符
4. description 长度在 50-160 个字符之间
5. 所有 URL 均为绝对地址（而非相对地址）
6. 图片尺寸为正整数
7. BreadcrumbList 的位置从 1 开始连续递增
8. FAQPage 至少包含 2 个问题

**AI 引用优化说明：** 使用 3 种或更多 schema 类型的页面，其被 AI 引用的可能性大约高出 13%。此技能最多可生成 7 种类型（BlogPosting、Person、Organization、BreadcrumbList、FAQPage、ImageObject、VideoObject），以最大限度提升搜索引擎的理解能力和 AI 提取效果。

### 步骤 9：输出

使用 @graph 模式将所有 schema 合并到单个 `<script>` 标签中：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "BlogPosting", ... },
    { "@type": "Person", ... },
    { "@type": "Organization", ... },
    { "@type": "BreadcrumbList", ... },
    { "@type": "FAQPage", ... },
    { "@type": "VideoObject", ... },
    { "@type": "ImageObject", ... }
  ]
}
</script>
```

**@graph 模式的优势：**
- 使用单个脚本标签而不是多个，可使 HTML 更简洁
- 通过稳定的 @id 引用实现实体关联（例如，作者通过 @id 引用 Person）
- Google 和 AI 系统能够正确解析 @graph 数组
- 作为单个代码块，更易于维护和更新

**输出选项：**
- **嵌入式 HTML** - 可直接粘贴到 `<head>` 中或 `</body>` 之前
- **独立 JSON** - 用于 CMS schema 字段或 API 注入
- **MDX 组件** - 如果项目使用 MDX，则将其包装在组件中

根据用户的偏好，将生成的 schema 保存到博客文章文件或单独的 schema 文件中。