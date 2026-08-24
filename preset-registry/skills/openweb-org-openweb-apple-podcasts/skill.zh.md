# Apple Podcasts

## 概述
Apple Podcasts 内容平台——通过 AMP API 搜索、浏览播客和单集并获取其详细信息。

## 工作流

### 搜索和探索播客
1. `searchPodcasts(term)` → 返回包含播客 `id` 的结果
2. `getPodcast(id, include=["episodes"])` → 返回完整详细信息及单集列表

### 自动补全搜索
1. `getSearchSuggestions(term)` → 返回包含播客/单集匹配项的建议
2. `searchPodcasts(term)` → 返回完整搜索结果

### 浏览热门排行榜
1. `getTopCharts(name="search-landing")` → 返回包含精选播客的编辑分组

## 操作

| 操作 | 用途 | 关键输入 | 关键输出 | 备注 |
|-----------|--------|-----------|------------|-------|
| searchPodcasts | 按关键词搜索 | term | id, name, artistName, artwork, url | 入口点 |
| getPodcast | 播客详情和单集 | id ← searchPodcasts | name, description, artwork, feedUrl, genreNames, episodes (via include) | 设置 include=episodes 以获取单集列表 |
| getSearchSuggestions | 自动补全 | term | searchTerm, displayTerm, content | 基于前缀的建议 |
| getTopCharts | 浏览排行榜 | name (optional) | editorial groupings, featured podcasts | 使用 name=search-landing 获取主排行榜 |

## 快速开始

```bash
# Search podcasts
openweb apple-podcasts exec searchPodcasts '{"term":"technology"}'

# Get podcast details with episodes
openweb apple-podcasts exec getPodcast '{"id":"917918570","extend":["editorialArtwork","feedUrl","userRating"],"include":["episodes"],"limit[episodes]":10}'

# Autocomplete suggestions
openweb apple-podcasts exec getSearchSuggestions '{"term":"tech"}'

# Top charts
openweb apple-podcasts exec getTopCharts '{"name":"search-landing"}'
```