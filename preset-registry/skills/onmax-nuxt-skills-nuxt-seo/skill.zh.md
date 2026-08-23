---
name: nuxt-seo
description: Nuxt SEO meta-module with robots, sitemap, og-image, schema-org. Use when configuring SEO, generating sitemaps, creating OG images, or adding structured data.
license: MIT
---
# Nuxt SEO

```bash
npx nuxi module add @nuxtjs/seo
```

## 适用场景

处理以下内容时：

- SEO 配置（站点 URL、名称、可索引性）
- 生成 robots.txt 和 sitemap.xml
- 动态生成 OG 图片
- JSON-LD 结构化数据（schema.org）
- 面包屑和规范 URL

## 加载文件

**请根据你的任务考虑加载以下参考文件：**

- [ ] [references/site-config.md](references/site-config.md) - 配置站点 URL、名称或 SEO 基础设置时
- [ ] [references/crawlability.md](references/crawlability.md) - 设置 robots.txt 或 sitemap.xml 时
- [ ] [references/og-image.md](references/og-image.md) - 生成动态 OG 图片时
- [ ] [references/schema-org.md](references/schema-org.md) - 添加 JSON-LD 结构化数据时
- [ ] [references/utilities.md](references/utilities.md) - 处理面包屑、规范 URL 或链接检查时

**不要一次加载所有文件。** 只加载与当前任务相关的文件。

## 站点配置

所有 SEO 模块的基础。在 `nuxt.config.ts` 中配置 `site`，并通过 `useSiteConfig()` 访问。完整选项请参阅 [references/site-config.md](references/site-config.md)。

## 模块概览

| 模块              | 用途          | 关键 API                      |
| ----------------- | ------------- | ----------------------------- |
| nuxt-site-config  | 共享配置      | `useSiteConfig()`             |
| @nuxtjs/robots    | robots.txt    | `useRobotsRule()`             |
| @nuxtjs/sitemap   | sitemap.xml   | `defineSitemapEventHandler()` |
| nuxt-og-image     | OG 图片       | `defineOgImage()`             |
| nuxt-schema-org   | JSON-LD       | `useSchemaOrg()`              |
| nuxt-seo-utils    | 元数据工具    | `useBreadcrumbItems()`        |
| nuxt-link-checker | 链接验证      | 构建时检查                    |

## Nuxt Content v3

使用 `asSeoCollection()`，根据 frontmatter 自动生成 sitemap、og-image 和 schema-org：

```ts
// content.config.ts
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { asSeoCollection } from '@nuxtjs/seo/content'

export default defineContentConfig({
  collections: {
    posts: defineCollection(asSeoCollection({ type: 'page', source: 'posts/**' }))
  }
})
```

**重要：** 在 modules 数组中，`@nuxtjs/seo` 必须先于 `@nuxt/content` 加载：

```ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/seo', '@nuxt/content']
})
```

Frontmatter 字段：`ogImage`、`sitemap`、`robots`、`schemaOrg`。

## 相关技能

- [nuxt-content](../nuxt-content/SKILL.md) - 用于渲染带有 SEO frontmatter 的 MDC

## 链接

- [文档](https://nuxtseo.com)
- [GitHub](https://github.com/harlan-zw/nuxt-seo)

## Token 效率

主技能：约 250 个 token。每个子文件：约 400-600 个 token。只加载与当前任务相关的文件。