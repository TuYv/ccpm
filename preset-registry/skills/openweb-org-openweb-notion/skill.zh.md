# Notion

## 概述
生产力与协作工作空间。企业级典型代表。

## 工作流

### 搜索页面
1. `getSpaces` → 选择工作空间 → `spaceId`
2. `searchPages(query, spaceId)` → 返回包含页面 `id`、`title`、`score` 的结果

### 读取页面
1. `searchPages(query, spaceId)` → 在结果中查找页面 `id`
2. `getPage(pageId)` → 区块位于 `recordMap.block` 中，属性位于根区块的 `value.properties` 中

### 查询数据库
1. `searchPages(query, spaceId)` → 在 `recordMap.block` 中查找 `collection_view_page` 区块 → `collection_id`、`view_ids`
2. `queryDatabase(collectionId, viewId)` → 返回包含属性值的行

**注意：** `collection_id` 位于搜索结果的 `recordMap.block` 内类型为 `collection_view_page` 的区块中。它可能不会出现在系统数据库（“Home views”“My Tasks”）中，而只会出现在用户创建的数据库中。

### 创建页面
1. `getSpaces` → `spaceId`
2. `createPage(title, spaceId)` → 新的 `pageId`
   - 可选择传入 `parentId`，将页面嵌套在现有页面下

### 更新页面
1. `searchPages(query, spaceId)` → 查找页面 → `pageId`
2. `updatePage(pageId, title, spaceId)` → 更新后的页面信息

### 删除页面
1. `searchPages(query, spaceId)` → 查找页面 → `pageId`
2. `deletePage(pageId, spaceId)` → `deleted: true`
   - 将页面移至回收站——可从 Notion UI 中恢复
   - `createPage` 的反向操作

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| getSpaces | 列出工作空间 | — | userId, spaceId | 获取 spaceId 的入口 |
| searchPages | 全文搜索 | query, spaceId | results[].id, score, recordMap | 通过 limit 分页 |
| getPage | 读取页面内容 | pageId | recordMap.block（页面树）、cursor | 通过 chunkNumber 分页 |
| queryDatabase | 筛选/排序数据库行 | collectionId, viewId | blockIds, recordMap.block（行） | 需要从搜索中获取 collectionId |
| createPage | 创建页面 | title, spaceId, parentId? | pageId | 写入操作——基于适配器 |
| deletePage | 删除（移至回收站）页面 | pageId, spaceId | deleted: true | 写入操作——createPage 的反向操作 |
| updatePage | 更新页面标题 | pageId, title, spaceId | updated: true | 写入操作——基于适配器 |

### 写入操作安全性

| 操作 | 级别 | 备注 |
|-----------|-------|-------|
| createPage | 谨慎 | 会在工作空间中创建真实页面——如用于测试，请手动删除 |
| deletePage | 谨慎 | 将页面移至回收站——可从 Notion UI 中恢复 |
| updatePage | 谨慎 | 会覆盖页面标题——可通过再次更新来恢复 |

## 快速开始

```bash
# Get workspace spaceId
openweb notion exec getSpaces '{}'

# Search pages
openweb notion exec searchPages '{"x-notion-space-id":"<spaceId>","type":"BlocksInSpace","query":"meeting","spaceId":"<spaceId>","limit":20,"source":"quick_find","filters":{"isDeletedOnly":false,"excludeTemplates":false,"navigableBlockContentOnly":false,"requireEditPermissions":false,"includePublicPagesWithoutExplicitAccess":false,"ancestors":[],"createdBy":[],"editedBy":[],"lastEditedTime":{},"createdTime":{},"inTeams":[],"excludeSurrogateCollections":false,"excludedParentCollectionIds":[]},"sort":{"field":"relevance"},"peopleBlocksToInclude":"all"}'

# Read a page's content
openweb notion exec getPage '{"x-notion-space-id":"<spaceId>","page":{"id":"<pageId>"},"limit":100,"cursor":{"stack":[]},"chunkNumber":0,"verticalColumns":false}'

# Query a database (requires collectionId and viewId from search results)
openweb notion exec queryDatabase '{"x-notion-space-id":"<spaceId>","collection":{"id":"<collectionId>"},"collectionView":{"id":"<viewId>"},"loader":{"type":"reducer","reducers":{"collection_group_results":{"type":"results","limit":50}},"searchQuery":"","userTimeZone":"America/Los_Angeles"}}'

# Create a new page at workspace top level
openweb notion exec createPage '{"x-notion-space-id":"<spaceId>","title":"My New Page"}'

# Create a subpage under an existing page
openweb notion exec createPage '{"x-notion-space-id":"<spaceId>","title":"Child Page","parentId":"<parentPageId>"}'

# Update a page's title
openweb notion exec updatePage '{"x-notion-space-id":"<spaceId>","pageId":"<pageId>","title":"New Title"}'

# Delete (trash) a page
openweb notion exec deletePage '{"x-notion-space-id":"<spaceId>","pageId":"<pageId>"}'
```