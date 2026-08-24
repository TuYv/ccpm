# Google Scholar

## 概述
学术论文搜索引擎（Google）。搜索论文、探索引用关系图，并查看包含 h-index 和发表历史的研究人员个人资料。

## 工作流程

### 搜索论文并探索引用关系
1. `searchPapers(q)` → 返回包含 `cites` 聚类 ID 的结果
2. `getCitations(cites)` → 引用该论文的论文 → 获取用于进一步跳转的 `cites`

### 研究作者
1. `searchPapers(q)` → 查找论文 → 从作者链接中获取 `user` ID
2. `getAuthorProfile(user)` → 姓名、所属机构、h-index、引用次数、发表成果

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchPapers | 按关键词/作者查找论文 | q | title, authors, citedBy, cites, pdfLink | 每页 10 条结果；cites 字段作为 getCitations 的输入 |
| getCitations | 查找引用指定论文的论文 | cites ← searchPapers | title, authors, citedBy, totalResults | 与搜索使用相同的 DOM |
| getAuthorProfile | 研究人员个人资料 | user（来自作者链接） | name, hIndex, citationsAll, publications[] | 最多 20 篇发表成果 |

## 快速开始

```bash
# Search for papers
openweb google-scholar exec searchPapers '{"q": "transformer attention"}'

# Get citing papers (use cites value from search)
openweb google-scholar exec getCitations '{"cites": "10449950798206616151"}'

# Get author profile (use user ID from author links in search)
openweb google-scholar exec getAuthorProfile '{"user": "KROUdngAAAAJ"}'
```