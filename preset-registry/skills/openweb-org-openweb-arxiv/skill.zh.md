# arXiv

## 概述
用于科学论文的开放访问预印本服务器（arxiv.org）。通过 export.arxiv.org 提供公开的 Atom API，用于搜索和检索元数据，此外还提供 HTML 摘要页面。

## 工作流

### 查找某个主题的论文
1. `searchPapers(search_query)` → 每个条目包含 `id`、`title`、`summary`、`category`
2. `getPaper(id_list)` → 包含 `title`、`authors`、`abstract`、`links`（PDF 链接）的完整元数据

### 获取特定论文的详细信息
1. `getPaper(id_list: "1706.03762")` → `title`、`authors`、`abstract`、`categories`、`links`
2. 从 `<link title="pdf">` 中提取 PDF 链接 → `href`

### 快速查询摘要
1. `getAbstract(arxiv_id: "1706.03762")` → `title`、`authors`、`abstract`

## 操作

| 操作 | 目的 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchPapers | 按关键词/作者/分类查找论文 | search_query（用户提供） | 包含条目（id、title、authors、abstract、categories）的 XML feed | **入口点** — 通过 start/max_results 分页，支持字段前缀（all:、au:、ti:、cat:） |
| getPaper | 按 ID 获取论文元数据 | id_list ← searchPapers `<id>` 或用户提供 | 包含完整元数据和 PDF 链接的 XML 条目 | 可一次获取多篇论文 |
| getAbstract | 按 ID 获取摘要页面 | arxiv_id ← searchPapers `<id>` 或用户提供 | 包含 title、authors、abstract 的 HTML 页面 | 人类可读格式，使用 arxiv.org 主机 |

## 快速开始

```bash
# Search for papers about transformers
openweb arxiv exec searchPapers '{"search_query": "all:transformer", "max_results": 5}'

# Get metadata for "Attention Is All You Need"
openweb arxiv exec getPaper '{"id_list": "1706.03762"}'

# Get abstract page for a paper
openweb arxiv exec getAbstract '{"arxiv_id": "1706.03762"}'
```