---
name: blog-taxonomy
description: >
  Extract, suggest, and sync tags and categories for blog posts across all major
  CMS platforms. Supports WordPress REST API, Shopify GraphQL, Ghost Content API,
  Strapi REST/GraphQL, and Sanity GROQ. Generates tag suggestions from content
  analysis (keyword frequency, heading extraction, semantic grouping), enforces
  minimum post-count thresholds to prevent thin tag archives, and syncs taxonomy
  via authenticated API calls. Use when user says "tags", "categories", "taxonomy",
  "tag suggestions", "sync tags", "WordPress tags", "Shopify tags".
user-invokable: true
argument-hint: "[suggest|sync|audit] [file-or-cms]"
---
# 博客分类体系

跨 CMS 平台管理标签、分类和主题集群。

## 命令

| 命令 | 用途 |
|---------|---------|
| `/blog taxonomy suggest <file>` | 从内容中提取候选标签和分类 |
| `/blog taxonomy sync <cms>` | 通过经过身份验证的 API 将分类体系推送到 CMS |
| `/blog taxonomy audit [directory]` | 检查内容单薄的标签、孤立标签和分类体系膨胀问题 |

## 标签建议工作流

### 第 1 步：解析内容结构

读取目标文件并提取：
- 所有 H2 和 H3 标题（主要主题信号）
- 加粗和斜体短语（强调信号）
- 现有的 frontmatter 标签/分类（如有）

### 第 2 步：频率分析

扫描正文中的高频短语：
- 单字词：至少出现 4 次（不包括停用词）
- 双词短语：至少出现 3 次
- 三词短语：至少出现 2 次

排除不适合作为标签的常见词：冠词、介词、连词、代词。

### 第 3 步：语义分组

将相关候选项归入集群：
- 合并单数/复数变体（保留更常见的形式）
- 合并带连字符和不带连字符的形式
- 将同义词归入频率最高的术语

### 第 4 步：去重和排序

- 对 slug 化名称进行模糊匹配（Levenshtein 距离 <= 2）
- 为每个候选项评分：`(frequency * 2) + (heading_presence * 5) + (emphasis * 1)`
- 返回排名前 5-10 的建议

### 输出格式

```
## Tag Suggestions: [Post Title]

| Rank | Tag | Score | Source |
|------|-----|-------|--------|
| 1 | content-marketing | 18 | H2 + 6 mentions |
| 2 | seo-strategy | 14 | H3 + 4 mentions |
| 3 | keyword-research | 11 | 5 mentions + bold |

### Suggested Categories
- Primary: [best-fit category]
- Secondary: [optional second category]
```

## CMS 适配器

### 适配器概览

| CMS | API 类型 | 身份验证方式 | 标签模型 |
|-----|----------|-------------|------------|
| WordPress | REST | 应用程序密码（base64） | 带有 ID 的一等实体 |
| Shopify | GraphQL（Admin API） | Admin API 访问令牌 | Article 上的字符串数组 |
| Ghost | REST（Admin API） | 使用 JWT 签名的 API 密钥 | 一等实体 |
| Strapi | REST 或 GraphQL | API 令牌（Bearer） | 用户定义的内容类型 |
| Sanity | GROQ / Mutations | 项目令牌（Bearer） | 文档类型 |

### WordPress 适配器

**列出标签**：
```
GET {CMS_URL}/wp-json/wp/v2/tags?per_page=100&search={keyword}
Authorization: Basic {base64(username:app_password)}
```

**创建标签**：
```
POST {CMS_URL}/wp-json/wp/v2/tags
Body: {"name": "Tag Name", "slug": "tag-name", "description": "Optional"}
```

**列出分类**（分层结构，支持 parent 字段）：
```
GET {CMS_URL}/wp-json/wp/v2/categories?per_page=100
```

**创建分类**：
```
POST {CMS_URL}/wp-json/wp/v2/categories
Body: {"name": "Category", "slug": "category", "parent": 0}
```

**为文章分配标签**：
```
POST {CMS_URL}/wp-json/wp/v2/posts/{id}
Body: {"tags": [1, 2, 3], "categories": [4]}
```

分页：按照 `X-WP-TotalPages` 标头获取完整列表。

### Shopify 适配器

Shopify 中的标签是 Article 对象上的字符串数组，而不是一等实体。

**更新文章标签**（GraphQL Admin API）：
```graphql
mutation {
  articleUpdate(id: "gid://shopify/Article/123", article: {
    tags: ["tag-one", "tag-two", "tag-three"]
  }) {
    article { id tags }
    userErrors { field message }
  }
}
```

**列出所有正在使用的标签**（GraphQL）：
```graphql
{
  articles(first: 250) {
    edges {
      node { id title tags }
    }
  }
}
```

身份验证请求头：`X-Shopify-Access-Token: {token}`

注意：REST API 已于 2024 年 10 月被标记为旧版。自 2025 年 4 月起，新应用必须使用 GraphQL。

### Ghost 适配器

**列出标签**：
```
GET {CMS_URL}/ghost/api/admin/tags/?limit=all
Authorization: Ghost {jwt_token}
```

**创建标签**：
```
POST {CMS_URL}/ghost/api/admin/tags/
Body: {"tags": [{"name": "Tag Name", "slug": "tag-name"}]}
```

JWT 生成：使用管理员 API 密钥（id:secret 格式）进行签名，iat = 当前时间，exp = 5 分钟，
audience = `/admin/`。

### Strapi 适配器

端点根据内容类型自动生成。典型设置：

```
GET {CMS_URL}/api/tags?pagination[pageSize]=100
POST {CMS_URL}/api/tags
Body: {"data": {"name": "Tag Name", "slug": "tag-name"}}
Authorization: Bearer {api_token}
```

Strapi v4+ 使用 `data` 包装器。请检查你的内容类型架构以确认字段名称。

### Sanity 适配器

**查询标签**（GROQ）：
```
*[_type == "tag"] { _id, name, slug }
```

**创建标签**（Mutations API）：
```
POST https://{project_id}.api.sanity.io/v2024-01-01/data/mutate/{dataset}
Body: {"mutations": [{"create": {"_type": "tag", "name": "Tag", "slug": {"current": "tag"}}}]}
Authorization: Bearer {token}
```

## 分类体系审计工作流

### 第 1 步：盘点

扫描目标目录中的所有文章（或从 CMS 获取）。构建以下映射：
- tag_name -> [使用此标签的文章文件/ID 列表]
- category_name -> [文章文件/ID 列表]

### 第 2 步：健康检查

| 检查项 | 阈值 | 操作 |
|-------|-----------|--------|
| 内容稀少的标签归档页 | 每个标签 < 5 篇文章 | 建议设置 noindex 或合并 |
| 孤立标签 | 0 篇文章 | 建议删除 |
| 标签膨胀 | 标签总数 > 50 | 建议整合 |
| 分类层级深度 | > 3 层 | 建议扁平化 |
| 未分类文章 | 未分配分类 | 分配至适当的分类 |
| 重复 slug | slug 相同、名称不同 | 合并至规范版本 |

### 第 3 步：建议

按优先级对发现的问题进行分组：
- **严重**：孤立标签会创建空白归档页面（浪费抓取资源）
- **高**：文章数 < 3 的内容稀少标签（用户体验不佳，SEO 信号较弱）
- **中**：标签数量超过 50 个（分类体系被稀释，更难浏览）
- **低**：命名不一致（大小写混用、连字符与空格混用）

### 输出格式

```
## Taxonomy Audit: [Site/Directory]

**Total tags**: [n] | **Total categories**: [n]
**Healthy**: [n] | **Thin**: [n] | **Orphan**: [n]

### Critical Issues
- [orphan tags list]

### Recommendations
1. Merge [tag-a] and [tag-b] (same topic, [n] combined posts)
2. Delete orphan tags: [list]
3. Add noindex to tag archives with < 5 posts
```

## 全站指南

- 每个站点应设置 5-10 个主要分类（宽泛主题）
- 标签至少应有 5 篇文章后再创建归档页面
- 使用一致的 slug 格式：小写字母，以连字符分隔
- 每篇文章必须有且仅有 1 个主分类
- 每篇文章建议使用 3-8 个标签，绝不超过 15 个

## 环境变量

| 变量 | 用途 | 示例 |
|----------|---------|---------|
| CMS_TYPE | 平台标识符 | wordpress, shopify, ghost, strapi, sanity |
| CMS_URL | CMS 的基础 URL | https://example.com |
| CMS_API_KEY | 身份验证凭据 | 应用程序密码、API 令牌或密钥 |

这些变量必须在 shell 环境中设置。切勿将凭据存储在文件中或
提交到版本控制系统。该技能在运行时通过 `$CMS_TYPE`、`$CMS_URL`
和 `$CMS_API_KEY` 读取它们。

## 错误处理

- **缺少环境变量**：如果 CMS_TYPE、CMS_URL 或 CMS_API_KEY 未设置，请报告缺少的变量并提供预期格式
- **凭据无效**：如果 CMS API 返回 401/403，请报告“身份验证失败 - 请检查 CMS_API_KEY”，且不要重试
- **连接超时**：如果 10 秒后仍无法访问 CMS 端点，请报告超时并建议检查 CMS_URL
- **标签 slug 重复**：如果 CMS 中已存在某个标签，请跳过创建并注明“标签已存在：[name]”
- **速率限制**：如果 CMS API 返回 429，请等待并重试一次。如果限制仍然存在，请予以报告
- **不受支持的 CMS**：如果 CMS_TYPE 不是 5 个受支持平台之一，请列出有效选项并退出