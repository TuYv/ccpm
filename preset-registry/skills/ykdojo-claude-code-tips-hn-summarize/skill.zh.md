---
name: hn-summarize
description: Fetch and summarize Hacker News / hckrnews.com top stories, articles, and their comment threads. Use when asked to summarize HN front-page stories, a specific HN story plus its discussion, or "the top N from hckrnews".
---
# HN 摘要

`hckrnews.com` 是一个由 JavaScript 渲染的前端——用 curl 抓取它只会得到一个空壳，所以**不要抓取它**。请改用 Hacker News 官方 API（Firebase + Algolia），它们能返回相同的新闻，并附带分数、评论数和完整的评论树。这些 API 返回纯 JSON，因此直接用 `curl` 就可以。

## 1. 当前热门新闻（“前 10 名”）

`topstories.json` 按首页排名顺序返回 500 个新闻 ID。取前 N 个并逐条查询详情。

```bash
curl -sL 'https://hacker-news.firebaseio.com/v0/topstories.json' -o /tmp/top.json
python3 -c "
import json,urllib.request
ids=json.load(open('/tmp/top.json'))[:10]
for i,sid in enumerate(ids,1):
    d=json.load(urllib.request.urlopen(f'https://hacker-news.firebaseio.com/v0/item/{sid}.json'))
    print(f\"{i}. {d.get('title')} | {d.get('score')} pts | {d.get('descendants',0)} comments | id {sid}\")
    print(f\"   {d.get('url','(text post)')}\")
"
```

## 2. 按主题查找特定新闻（Algolia 搜索）

```bash
curl -sL 'https://hn.algolia.com/api/v1/search?query=YOUR+QUERY&tags=story' -o /tmp/s.json
python3 -c "
import json
for h in json.load(open('/tmp/s.json'))['hits'][:8]:
    print(h['objectID'], '|', h.get('points'), 'pts |', h.get('num_comments'), 'comments |', h['title'])
    print('   ', h.get('url'))
"
```

- 添加 `&numericFilters=created_at_i>UNIXTS` 可将结果限制为较新的新闻（避免匹配到同一标题的旧重复帖）。
- `search` 按相关性排序；`search_by_date` 按时间先后排序。
- 选择分数/评论数最高的 `objectID`——那才是首页上正在进行的活跃讨论。

## 3. 获取某条新闻及其评论树

```bash
curl -sL 'https://hn.algolia.com/api/v1/items/OBJECT_ID' -o /tmp/hn.json
```

响应是一个嵌套树结构：顶层的 `children` 是根评论，每条评论又有自己的 `children`。按楼层顺序展开并打印根评论（HN 的默认排名 ≈ 这个顺序）：

```bash
python3 -c "
import json,re
d=json.load(open('/tmp/hn.json'))
def clean(t):
    t=re.sub('<[^>]+>',' ',t)
    for a,b in [('&#x27;',chr(39)),('&gt;','>'),('&lt;','<'),('&amp;','&'),('&quot;','\"')]:
        t=t.replace(a,b)
    return re.sub(' +',' ',t).strip()
for c in d.get('children',[])[:15]:
    if c.get('text'):
        print(f\"{c.get('author')}: {clean(c['text'])[:550]}\")
        print('---')
"
```

注意：Algolia 的单条评论 `points` 字段现在恒为 `null`，因此请按楼层顺序排序（这已大致相当于 HN 的排名），而不是按分数排序。对于更深的楼中楼，请递归进入 `children` 并记录深度。

## 4. 获取新闻所链接的文章

用 `curl -sL <url>` 获取新闻链接的文章，然后用 `sed 's/<[^>]*>//g'` 去除标签以提取可读文本，或者用 grep 搜索关键句子。如果页面大量依赖 JS 或设有付费墙，可以尝试 Wayback Machine 的快照：

```bash
curl -sL 'http://archive.org/wayback/available?url=ARTICLE_URL' -o /tmp/wb.json
python3 -c "import json;print(json.load(open('/tmp/wb.json'))['archived_snapshots'].get('closest',{}).get('url'))"
```

然后以同样的方式获取快照 URL。如果宿主机阻止了出站的 `curl` 请求，可通过你可用的容器或代理来获取。

## 摘要格式

对于每条新闻，给出：标题、分数、评论数、来源、几句话概述文章内容，然后是**评论主题**——将讨论归纳为 3-6 个反复出现的线索（认同、反驳、题外话），而不是逐条列出评论。如果最热门的讨论串是批评性/唱反调的观点，请加以注明，因为这在 HN 上很常见。
