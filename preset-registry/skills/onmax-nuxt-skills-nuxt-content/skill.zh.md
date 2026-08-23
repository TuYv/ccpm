---
name: nuxt-content
description: Build typed, content-driven Nuxt applications with @nuxt/content. Use when working with content.config.ts, collections, queryCollection, Markdown or MDC rendering, content databases, hooks, custom sources, search, or Content v2 migrations.
license: MIT
---
# Nuxt Content

## 工作流程

1. 检查已安装的 `@nuxt/content` 版本、`content.config.ts`、`content/` 下匹配的文件，以及使用这些文件的 Nuxt 接口。当集合、源 glob、schema 和使用方保持一致时，才能准确理解当前分支。
2. 打开下方最匹配且范围最小的指南。仅对由 Nuxt Content 负责的 API 应用 Nuxt Content 指南；其余部分应根据所属包使用 Nuxt、Nuxt Studio、Nuxt UI 或 Vue 指南。
3. 使用类型化集合和基于 payload 的 Nuxt 数据加载进行实现。当集合类型能够正确解析、目标查询返回预期的文档结构，并且渲染后的路由能在目标渲染模式下正常工作时，此项更改才算完成。

## 路由

| 任务                                                                                 | 打开                                     |
| ------------------------------------------------------------------------------------ | ---------------------------------------- |
| 集合类型、schema、索引、本地/远程源或语言区域前缀                                    | [集合](references/collections.md)        |
| 筛选、排序、分页、导航、上下文文档或搜索                                             | [查询](references/querying.md)           |
| Markdown、MDC、`ContentRenderer`、prose 组件或代码高亮                                | [渲染](references/rendering.md)          |
| 数据库适配器、Markdown 处理、渲染器别名或部署存储                                    | [配置](references/config.md)             |
| 钩子、转换器、自定义源、原始内容、调试或 Content v2 迁移                             | [高级用法](references/advanced.md)       |
| 可视化编辑、身份验证、媒体、草稿或 Git 发布                                          | `nuxt-studio` skill                      |
| 编写或重构文档正文                                                                   | `document-writer` skill                  |

## 基线

```ts
// content.config.ts
import { defineCollection, defineContentConfig } from '@nuxt/content'
import { z } from 'zod'

export default defineContentConfig({
  collections: {
    docs: defineCollection({
      type: 'page',
      source: 'docs/**',
      schema: z.object({
        updatedAt: z.date().optional(),
      }),
    }),
  },
})
```

```vue
<script setup lang="ts">
const route = useRoute()
const { data: page } = await useAsyncData(route.path, () => {
  return queryCollection('docs').path(route.path).first()
})
</script>

<template>
  <ContentRenderer v-if="page" :value="page" />
</template>
```

使用 `npx nuxi typecheck` 验证生成的集合类型。当查询结果为空时，请先确认其集合源包含相应文件——尤其是 `.navigation.yml`——然后再更改查询逻辑。