---
name: blog-schema
description: >
  Generate complete JSON-LD schema markup for blog posts with Article/BlogPosting,
  Person, Organization, BreadcrumbList, ImageObject, and optional FAQPage. Validates
  against Google requirements and warns about deprecated types. Use when user
  says "schema", "blog schema", "json-ld", "structured data", "schema markup",
  "generate schema".
user-invokable: true
argument-hint: "<file-path>"
license: MIT
---
# 博客 Schema：JSON-LD 结构化数据生成

使用 @graph 模式为博客文章生成完整且经过验证的 JSON-LD Schema 标记。将多种 Schema 类型合并到单个脚本标签中，并使用稳定的 @id 引用进行实体关联。

## 工作流程

### 第 1 步：读取内容

读取博客文章并提取所有与 Schema 相关的数据：
- **标题**（headline）
- **作者**（姓名、职位、社交链接、资历）
- **日期**（datePublished、dateModified / lastUpdated）
- **描述**（元描述）
- **FAQ 部分**（问题和答案对）
- **图片**（封面图片 URL、尺寸、替代文本；内嵌图片）
- **组织信息**（站点名称、URL、徽标）
- **字数**（根据内容长度估算）
- **标签/分类**（用于 BreadcrumbList 分类）
- **Slug**（来自文件名或 frontmatter）

### 第 2 步：生成 BlogPosting Schema

在适用时生成包含推荐属性的完整 BlogPosting：

```json
{
  "@type": "BlogPosting",
  "@id": "{siteUrl}/blog/{slug}#article",
  "headline": "Concise post title",
  "description": "Concise page-specific meta description",
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

Google 的 Article 结构化数据文档未定义必需的 Article 属性。在适用时包含 `headline`、`datePublished`、`author`、`publisher` 和 `image`，使用富媒体搜索结果测试进行验证，并将缺失字段视为警告，除非目标展示界面要求这些字段。推荐属性：description、dateModified、mainEntityOfPage、wordCount、articleBody（摘要）。

### 第 3 步：生成 Person Schema

使用稳定的 @id 生成作者 Schema，以便进行交叉引用：

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

徽标要求：使用可被抓取的有效图片 URL，并遵循目标展示界面当前适用的 Organization 和 Article 文档。除非项目或当前文档有要求，否则不要虚构固定的徽标尺寸。

### 步骤 5：生成 BreadcrumbList

展示内容层级结构的导航面包屑架构：

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

如果没有可用的分类，请将第二个面包屑项目设为 "Blog"，并将
`{siteUrl}/blog` 作为 URL。

### 步骤 6：生成 FAQPage 实体架构（可选）

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
        "text": "The complete visible answer text."
      }
    }
  ]
}
```

Google 已于 2026-05-07 停止为所有网站提供 FAQ 富媒体搜索结果。FAQPage 并非
Google 富媒体搜索结果或生成式 AI 优化路径，也不会带来任何 SEO 或
AI 就绪度加分。仅当可见的 FAQ 确实能帮助读者，并且至少包含一个有效的 `Question`
及与之匹配的可见答案时，才输出该架构。不要为了达到目标长度而填充答案，也不要仅为了添加标记而
添加 FAQ。

不要使用 QAPage 替代。Google 支持的 QAPage 适用于聚焦于单个
问题且用户可以提交答案的页面。编辑型 FAQ、支持类 FAQ 和博客
问答部分不符合该模型。

### 步骤 7：生成 VideoObject（如果存在视频）

为文章中嵌入的每个 YouTube 视频生成一个 VideoObject 架构：

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

将每个 VideoObject 添加到 @graph 数组中。使用 `#video-1`、`#video-2` 等作为
@id 片段。从嵌入内容的 noscript 后备内容中提取视频元数据；如果可通过 `blog-google`
使用 YouTube Data API，也可从中提取。

### 步骤 7.5：生成 ImageObject

文章主图的封面图片架构：

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
- URL 必须可被抓取且可公开访问
- 宽度和高度应反映图片的实际尺寸
- 说明文字应与图片的 alt 文本一致或高度对应
- 首选尺寸：1200x630（兼容 OG）或 1920x1080

### 第 8 步：验证并发出警告

在推荐架构类型之前，检查各展示界面的支持情况：

| 类型 | Google 搜索状态 | 有效的实体/上下文用法 |
|------|----------------------|--------------------------|
| HowTo | Google 当前没有对应的富媒体搜索结果体验 | 对于真正的操作指南内容，这是有效的 schema.org 类型 |
| Dataset | 用于 Dataset Search，而非 Google 搜索中的常规富媒体搜索结果 | 仅适用于实际的数据集 |
| QAPage | 支持包含一个问题及用户提交答案的页面 | 不要用于编辑制作的常见问题内容 |
| Course | 课程列表与已停用的 Course Info 体验仍是不同的功能 | 仅当内容符合当前的课程列表文档并与页面上的可见内容一致时使用 |
| ClaimReview, SpecialAnnouncement, Course Info, Estimated Salary, Learning Video, Vehicle Listing | 以前的 Google 搜索体验；现已停止支持 | 这些类型在 schema.org 中可能仍然有效，但绝不要为了获得 Google 展示资格而推荐它们 |
| PracticeProblem | 已从 Google 搜索及其文档中移除 | 不要为了获得 Google 展示资格而推荐 |
| Sitelinks Search Box | Google 搜索中没有专门的可视化元素 | Google 通过算法生成站点链接 |

**验证检查：**
1. 所有 @id 引用都能解析到 @graph 中的实体
2. dateModified 等于或晚于 datePublished
3. headline 简洁明了。当它可能被截断或变得含义不清时发出警告
4. description 简洁、针对具体页面，并且没有在多篇文章中重复
5. 所有 URL 都是绝对地址（而非相对地址）
6. 图片尺寸为正整数
7. BreadcrumbList 的位置从 1 开始连续递增
8. 如果输出 FAQPage，则必须存在可见的问答内容，并且至少包含 1 个有效的 `Question`

**生成式 AI 说明：** Google 生成式 AI 搜索不要求使用结构化数据，
也不存在专用的 AI 架构。应优先使用准确且与可见内容一致的
Article/BlogPosting、Person、Organization 和 BreadcrumbList 实体。
当存在相应资源时，添加 ImageObject 或 VideoObject。
FAQPage 仍是可选的面向读者的标记，并不会带来任何 Google AI 优势。

### 第 9 步：输出

使用 @graph 模式将所有架构合并到单个 `<script>` 标签中：

安全要求：使用真正的 JSON 编码器构建 JSON-LD，绝不要使用字符串
插值。在嵌入 HTML 之前，通过转义闭合脚本序列和字面小于号，使
JSON 文本在脚本中安全。例如，将 `</` 替换为 `<\/`，并将 `<` 替换为
`\u003c`。headline、description、author name、image URL 和
breadcrumb labels 等由用户控制的字段，只能以经过 JSON 编码的值
进入该代码块。

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
- 使用单个脚本标签而不是多个标签——HTML 更简洁
- 通过稳定的 @id 引用链接实体（例如，author 通过 @id 引用 Person）
- Google 和 AI 系统能够正确解析 @graph 数组
- 作为单个代码块更易于维护和更新

**输出选项：**
- **嵌入式 HTML** - 可直接粘贴到 `<head>` 中或 `</body>` 之前
- **独立 JSON** - 用于 CMS 架构字段或 API 注入
- **MDX 组件** - 如果项目使用 MDX，则将其包装在组件中

根据用户的偏好，将生成的架构保存到博客文章文件或单独的架构文件中。

当 JavaScript 生成的 JSON-LD 出现在渲染后的 DOM 中时，Google 可以处理它。对于非 Google 爬虫，服务端渲染的标记仍然具有更好的可移植性，但 Google 并不要求 JSON-LD 必须存在于源代码中。对于动态标记，请验证渲染后的 URL，确认其中的值与可见内容一致，并避免因客户端请求延迟或失败而导致渲染后的 DOM 为空。