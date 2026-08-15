---
name: 9router-web-search
description: Web search via 9Router /v1/search using Tavily / Exa / Brave / Serper / SearXNG / Google PSE / Linkup / SearchAPI / You.com / Perplexity. Use when the user wants to search the web, look up information, find articles, or query a search engine.
---
# 9Router — Web 搜索

需要配置 `NINEROUTER_URL`（如果启用了身份验证，还需要配置 `NINEROUTER_KEY`）。设置方法请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

## 发现

```bash
curl $NINEROUTER_URL/v1/models/web | jq '.data[] | select(.kind=="webSearch") | .id'
# Per-provider params (searchTypes, maxResults, required options like cx for google-pse)
curl "$NINEROUTER_URL/v1/models/info?id=tavily/search"
```

ID 以 `/search` 结尾（例如 `tavily/search`）。组合模型（`owned_by:"combo"`）会串联多个提供商，并支持自动回退。

## 端点

`POST $NINEROUTER_URL/v1/search`

| 字段 | 必需 | 说明 |
|---|---|---|
| `model`（或 `provider`） | 是 | 来自 `/v1/models/web`（例如 `tavily` 或 `brave`） |
| `query` | 是 | 搜索查询 |
| `max_results` | 否 | 默认值为 5 |
| `search_type` | 否 | `web`（默认）/ `news` |
| `country`、`language`、`time_range`、`domain_filter` | 否 | 取决于提供商 |

## 示例

```bash
curl -X POST $NINEROUTER_URL/v1/search \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"tavily","query":"9Router open source","max_results":5}'
```

JS：

```js
const r = await fetch(`${process.env.NINEROUTER_URL}/v1/search`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "search-combo", query: "latest LLM benchmarks", max_results: 10 }),
});
console.log(await r.json());
```

## 响应结构

```json
{
  "provider": "tavily",
  "query": "9Router open source",
  "results": [
    {
      "title": "...", "url": "https://...", "display_url": "github.com/...",
      "snippet": "...", "position": 1, "score": 0.92,
      "published_at": null, "favicon_url": null, "content": null,
      "metadata": { "author": null, "language": null, "source_type": null, "image_url": null },
      "citation": { "provider": "tavily", "retrieved_at": "2026-...", "rank": 1 }
    }
  ],
  "answer": null,
  "usage": { "queries_used": 1, "search_cost_usd": 0.008 },
  "metrics": { "response_time_ms": 850, "upstream_latency_ms": 700, "total_results_available": 12 },
  "errors": []
}
```

## 提供商特性

所有提供商都接受 `query` + `max_results`。可选字段有所不同：

| 提供商 | 支持 | 必需的额外参数 |
|---|---|---|
| `tavily` | 国家/地区、域名过滤、新闻主题 | — |
| `exa` | 域名过滤（包含/排除）、新闻类别 | — |
| `brave-search` | 国家/地区、语言 | — |
| `serper` | 国家/地区、语言、新闻端点 | — |
| `perplexity` | 国家/地区、语言、域名过滤 | — |
| `linkup` | 域名过滤、时间范围 | `depth: fast/standard/deep`（选项） |
| `google-pse` | 国家/地区、语言、时间范围、偏移量 | **必须提供 `cx`**（providerOptions） |
| `searchapi` | 国家/地区、语言、分页 | — |
| `youcom` | 国家/地区、语言、时间范围、域名过滤、完整页面 | — |
| `searxng` | 语言、时间范围 | 自托管，**noAuth** |

提供商就是模型——`"provider":"tavily" ≡ "model":"tavily"`。