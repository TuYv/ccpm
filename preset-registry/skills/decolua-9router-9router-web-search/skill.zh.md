---
name: 9router-web-search
description: Web and X search via 9Router /v1/search using Tavily / Exa / Brave / Serper / SearXNG / Google PSE / Linkup / SearchAPI / You.com / Perplexity / Xquik. Use when the user wants to search the web, find articles, or search public X posts.
---
# 9Router — 网页搜索

需要 `NINEROUTER_URL`（如果启用了身份验证，还需要 `NINEROUTER_KEY`）。有关设置，请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

## 发现

```bash
curl $NINEROUTER_URL/v1/models/web | jq '.data[] | select(.kind=="webSearch") | .id'
# Per-provider params (searchTypes, maxResults, required options like cx for google-pse)
curl "$NINEROUTER_URL/v1/models/info?id=tavily/search"
```

ID 以 `/search` 结尾（例如 `tavily/search`）。组合项（`owned_by:"combo"`）会串联多个提供商，并自动进行故障转移。

## 端点

`POST $NINEROUTER_URL/v1/search`

| 字段 | 必需 | 说明 |
|---|---|---|
| `model`（或 `provider`） | 是 | 来自 `/v1/models/web`（例如 `tavily` 或 `brave`） |
| `query` | 是 | 搜索查询 |
| `max_results` | 否 | 默认为 5 |
| `search_type` | 否 | `web`（默认）/ `news` / Xquik 使用的 `x` |
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

使用 Xquik 进行 X 搜索：

```bash
curl -X POST $NINEROUTER_URL/v1/search \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"xquik","query":"from:github release","max_results":10,"provider_options":{"queryType":"Latest"}}'
```

在 9Router 的提供商设置中添加 Xquik API 密钥。Xquik 对每条返回的帖子收取 1 个积分。通过将 `pagination.next_cursor` 作为 `provider_options.cursor` 传入，可以继续搜索。

Xquik 响应中包含提供商分页信息和积分使用情况：

```json
{
  "pagination": { "has_more": true, "next_cursor": "cursor-2" },
  "usage": { "queries_used": 1, "search_cost_usd": null, "provider_credits_used": 10 }
}
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

所有提供商都接受 `query` + `max_results`。可选字段各不相同：

| 提供商 | 支持 | 必需的额外字段 |
|---|---|---|
| `tavily` | country、domain_filter、news topic | — |
| `exa` | domain_filter（包含/排除）、news category | — |
| `brave-search` | country、language | — |
| `serper` | country、language、news endpoint | — |
| `perplexity` | country、language、domain_filter | — |
| `linkup` | domain_filter、time_range | `depth: fast/standard/deep`（选项） |
| `google-pse` | country、language、time_range、offset | **需要 `cx`**（providerOptions） |
| `searchapi` | country、language、pagination | — |
| `youcom` | country、language、time_range、domain_filter、full_page | — |
| `searxng` | language、time_range | 自托管，**noAuth** |
| `xquik` | X/Twitter 搜索运算符、language、游标分页 | `queryType: Latest/Top`、`cursor`（选项） |

提供商就是模型 — `"provider":"tavily" ≡ "model":"tavily"`】【。