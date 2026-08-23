---
name: schema-markup-generator
argument-hint: "<URL or page type, e.g. 'FAQ page' or 'product page'>"
description: >
  Generate JSON-LD structured data markup for rich results in Google Search.
  Supports FAQ, HowTo, Article, Product, LocalBusiness, and multi-type schemas.
  Validates against Google requirements and provides implementation guidance.
  Use when asked to "add schema markup", "generate structured data", "JSON-LD",
  "rich snippets", "FAQ schema", "product markup", "add structured data to my
  page", "how to get rich snippets", or any structured data task.
---
# Schema 标记生成器

此技能会创建 JSON-LD 格式的 Schema.org 结构化数据标记，帮助搜索引擎理解你的内容，并在 SERP 中启用富媒体搜索结果。

## 必须触发此技能的情况

当对话涉及以下任一情况时，请使用此技能——即使用户没有使用 SEO 术语：

只要任务需要可直接交付的资产或转换结果，并且该结果应直接进入质量审核、部署或监控流程，就应使用此技能。

- 添加 FAQ schema，以扩大在 SERP 中的展示范围
- 为分步内容创建 How-To schema
- 为电子商务页面添加 Product schema
- 为博客文章实施 Article schema
- 为位置页面添加 Local Business schema
- 创建 Review/Rating schema
- 实施 Organization schema，以提升品牌展示
- 任何可通过富媒体搜索结果提高可见度的页面

## 此技能的作用

1. **Schema 类型选择**：推荐合适的 schema 类型
2. **JSON-LD 生成**：创建有效的结构化数据标记
3. **属性映射**：将你的内容映射到 schema 属性
4. **验证指导**：确保 schema 符合要求
5. **嵌套 Schema**：处理复杂的多类型 schema
6. **富媒体搜索结果资格**：确定你可以争取哪些富媒体搜索结果

## 快速开始

从以下任一提示词开始。

### 为内容生成 Schema

```
Generate schema markup for this [content type]: [content/URL]
```

```
Create FAQ schema for these questions and answers: [Q&A list]
```

### 特定 Schema 类型

```
Create Product schema for [product name] with [details]
```

```
Generate LocalBusiness schema for [business name and details]
```

### 审核现有 Schema

```
Review and improve this schema markup: [existing schema]
```

## 数据源

**已连接 ~~网络爬虫时：**
自动抓取并提取页面内容（可见文本、标题、列表、表格）、现有 schema 标记、页面元数据，以及可映射到 schema 属性的结构化内容元素。

**仅使用手动提供的数据时：**
要求用户提供：
1. 页面 URL 或完整的 HTML 内容
2. 页面类型（文章、产品、FAQ、操作指南、本地商家等）
3. schema 所需的特定数据（价格、日期、作者信息、问答对等）
4. 当前的 schema 标记（如果要优化现有标记）

使用所提供的数据执行完整工作流。在输出中注明哪些数据来自自动提取，哪些数据由用户提供。

## 说明

当用户请求 schema 标记时：

1. **识别内容类型和富媒体搜索结果机会**

   参考 CORE-EEAT 基准项目 **O05（Schema 标记）**，进行从内容类型到 schema 的映射：

   ```markdown
   ### CORE-EEAT Schema Mapping (O05)

   | Content Type | Required Schema | Conditional Schema |
   |-------------|----------------|--------------------|
   | Blog (guides) | Article, Breadcrumb | FAQ, HowTo |
   | Blog (tools) | Article, Breadcrumb | FAQ, Review |
   | Blog (insights) | Article, Breadcrumb | FAQ |
   | Alternative | Comparison*, Breadcrumb, FAQ | AggregateRating |
   | Best-of | ItemList, Breadcrumb, FAQ | AggregateRating per tool |
   | Use-case | WebPage, Breadcrumb, FAQ | — |
   | FAQ | FAQPage, Breadcrumb | — |
   | Landing | SoftwareApplication, Breadcrumb, FAQ | WebPage |
   | Testimonial | Review, Breadcrumb | FAQ, Person |

   *Use the mapping above to ensure schema type matches content type (CORE-EEAT O05: Pass criteria).*
   ```

```markdown
   ### Schema Analysis

   **Content Type**: [blog/product/FAQ/how-to/local business/etc.]
   **Page URL**: [URL]

   **Eligible Rich Results**:
   
   | Rich Result Type | Eligibility | Impact |
   |------------------|-------------|--------|
   | FAQ | ✅/❌ | High - Expands SERP presence |
   | How-To | ✅/❌ | Medium - Shows steps in SERP |
   | Product | ✅/❌ | High - Shows price, availability |
   | Review | ✅/❌ | High - Shows star ratings |
   | Article | ✅/❌ | Medium - Shows publish date, author |
   | Breadcrumb | ✅/❌ | Medium - Shows navigation path |
   | Video | ✅/❌ | High - Shows video thumbnail |
   
   **Recommended Schema Types**:
   1. [Primary schema type] - [reason]
   2. [Secondary schema type] - [reason]
   ```

2. **生成 Schema 标记**

   根据识别出的内容类型，生成适当的 JSON-LD schema。支持的类型：FAQPage、HowTo、Article/BlogPosting/NewsArticle、Product、LocalBusiness、Organization、BreadcrumbList、Event、Recipe，以及组合的多类型 schema。

   > **参考**：有关所有 schema 类型的完整、可直接复制的 JSON-LD 模板（包含必需属性和可选属性），请参阅 [references/schema-templates.md](references/schema-templates.md)。

   对于生成的每个 schema，请包含：
   - 所选类型的所有必需属性
   - 展示预期 SERP 外观的富媒体搜索结果预览
   - 关于哪些属性是必需属性、哪些是可选属性的说明

   在一个页面上组合多个 schema 类型时，请将它们封装在单个 `<script type="application/ld+json">` 标签内的 JSON 数组中。

3. **提供实施和验证说明**

    ```markdown
    ## Implementation Guide

    ### Adding Schema to Your Page

    **Option 1: In HTML <head>**
    ```html
    <head>
      <script type="application/ld+json">
        [Your JSON-LD schema here]
      </script>
    </head>
    ```

    **Option 2: Before closing </body>**
    ```html
      <script type="application/ld+json">
        [Your JSON-LD schema here]
      </script>
    </body>
    ```

    ### Validation Steps

    1. **~~schema validator**
       - Test your live URL or paste code
       - Check for errors and warnings

    2. **Schema.org Validator**
       - URL: https://validator.schema.org/
       - Validates against Schema.org spec

    3. **~~search console**
       - Monitor rich results in ~~search console
       - Check Enhancements reports for issues

    ### Validation Checklist

    - [ ] JSON syntax is valid (no trailing commas)
    - [ ] All required properties present
    - [ ] URLs are absolute, not relative
    - [ ] Dates are in ISO 8601 format
    - [ ] Content matches visible page content
    - [ ] No policy violations
    ```

## 验证检查点

### 输入验证
- [ ] 已提供页面 URL 或内容
- [ ] Schema 类型适合内容（博客使用 Article，电子商务使用 Product，等等）
- [ ] 所有必需数据均可用（作者、日期、价格等，具体取决于 schema 类型）
- [ ] 已确认内容符合富媒体搜索结果的资格要求

### 输出验证
- [ ] JSON 语法验证通过（无尾随逗号、引号使用正确）
- [ ] 所选 schema 类型的所有必需属性均已提供
- [ ] URL 为绝对地址，而非相对地址
- [ ] 日期采用 ISO 8601 格式（YYYY-MM-DDTHH:MM:SS+00:00）
- [ ] Schema 内容与页面上的可见内容完全一致
- [ ] 通过 ~~schema 验证器检查且无错误
- [ ] 明确说明每个数据点的来源（~~网络爬虫提取、用户提供或手动录入）

## 示例

**用户**：“为一个包含 3 个问题的 SEO 页面生成 FAQ schema”

**输出**：

```markdown
## FAQ Schema for SEO Page

### Schema Markup

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is SEO?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO (Search Engine Optimization) is the practice of optimizing websites and content to rank higher in search engine results pages (SERPs). It involves technical optimizations, content creation, and link building to increase organic visibility and drive qualified traffic to your website."
      }
    },
    {
      "@type": "Question",
      "name": "How long does SEO take to work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO typically takes 3-6 months to show significant results, though this varies based on competition, domain authority, and effort invested. New websites may take 6-12 months, while established sites with existing authority can see improvements in 1-3 months for less competitive keywords."
      }
    },
    {
      "@type": "Question",
      "name": "Is SEO better than paid advertising?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SEO and paid advertising serve different purposes. SEO provides sustainable, long-term traffic without per-click costs but takes time to build. Paid advertising delivers immediate results but stops when you stop paying. Most successful businesses use both: paid ads for immediate leads and SEO for long-term growth."
      }
    }
  ]
}
```

_Implementation: Wrap the above JSON-LD in `<script type="application/ld+json">...</script>` and place in `<head>` or before `</body>`. Test with ~~schema validator._

### SERP Preview

```
SEO Guide: Complete Beginner's Tutorial
yoursite.com/seo-guide/
Learn SEO from scratch with our comprehensive guide...

▼ What is SEO?
  SEO (Search Engine Optimization) is the practice of optimizing...
▼ How long does SEO take to work?
  SEO typically takes 3-6 months to show significant results...
▼ Is SEO better than paid advertising?
  SEO and paid advertising serve different purposes...
```
```

## Schema 类型快速参考

| 内容类型 | Schema 类型 | 关键属性 |
|--------------|-------------|----------------|
| 博客文章 | BlogPosting/Article | headline, datePublished, author |
| 产品 | Product | name, price, availability |
| 常见问题 | FAQPage | Question, Answer |
| 操作指南 | HowTo | step, totalTime |
| 本地商家 | LocalBusiness | address, geo, openingHours |
| 食谱 | Recipe | ingredients, cookTime |
| 活动 | Event | startDate, location |
| 视频 | VideoObject | uploadDate, duration |
| 课程 | Course | provider, name |
| 评价 | Review | itemReviewed, ratingValue |

## 成功技巧

1. **匹配可见内容** - Schema 必须反映用户实际看到的内容
2. **不要滥用** - 仅为相关内容添加 Schema
3. **保持更新** - 日期和价格发生变化时及时更新
4. **充分测试** - 部署前进行验证
5. **监控 Search Console** - 留意错误和警告

## Schema 类型决策树

> **参考**：完整决策树（内容到 Schema 的映射）、特定行业建议、实施优先级层级（P0-P4）和验证快速参考，请参阅 [references/schema-decision-tree.md](references/schema-decision-tree.md)。


## 参考资料

- [Schema 模板](references/schema-templates.md) - 适用于所有 Schema 类型、可直接复制使用的 JSON-LD 模板
- [验证指南](references/validation-guide.md) - 常见错误、必需属性和测试工作流

## 下一项最佳 Skill

- **首选**：[seo-analysis](../seo-analysis/SKILL.md) — 通过技术 SEO 审计验证实施情况。