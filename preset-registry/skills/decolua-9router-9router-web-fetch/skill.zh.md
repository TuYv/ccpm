---
name: 9router-web-fetch
description: Fetch URL → markdown / text / HTML via 9Router /v1/web/fetch using Ollama Cloud / Firecrawl / Jina Reader / Tavily Extract / Exa Contents. Use when the user wants to scrape a webpage, extract URL content, read article, or convert a URL to markdown.
---
# 9Router — 网页抓取

需要 `NINEROUTER_URL`（如果启用了身份验证，还需要 `NINEROUTER_KEY`）。设置方法请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

## 发现

```bash
curl $NINEROUTER_URL/v1/models/web | jq '.data[] | select(.kind=="webFetch") | .id'
# Per-provider params
curl "$NINEROUTER_URL/v1/models/info?id=firecrawl/fetch"
```

ID 以 `/fetch` 结尾（例如 `firecrawl/fetch`、`jina/fetch`）。`fetch-combo` 会串联多个提供商，并自动进行故障转移。

## 端点

`POST $NINEROUTER_URL/v1/web/fetch`

| 字段 | 必填 | 说明 |
|---|---|---|
| `model`（或 `provider`） | 是 | 来自 `/v1/models/web`（例如 `firecrawl` 或 `jina-reader`） |
| `url` | 是 | 要提取内容的 URL |
| `format` | 否 | `markdown`（默认）/ `text` / `html` |
| `max_characters` | 否 | 截断输出 |

## 示例

### Jina Reader
```bash
curl -X POST $NINEROUTER_URL/v1/web/fetch \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"jina-reader","url":"https://9router.com","format":"markdown"}'
```

### Exa
```bash
curl -X POST $NINEROUTER_URL/v1/web/fetch \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"exa","url":"https://example.com","format":"markdown","max_characters":0}'
```

### Firecrawl
```bash
curl -X POST $NINEROUTER_URL/v1/web/fetch \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"firecrawl","url":"https://example.com","format":"markdown","max_characters":0}'
```

### Tavily
```bash
curl -X POST $NINEROUTER_URL/v1/web/fetch \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"tavily","url":"https://example.com","format":"markdown","max_characters":0}'
```

### Ollama Cloud

使用现有 `ollama` 连接中的 API 密钥。

```bash
curl -X POST $NINEROUTER_URL/v1/web/fetch \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"ollama","url":"https://example.com","format":"markdown"}'
```


JS：

```js
const r = await fetch(`${process.env.NINEROUTER_URL}/v1/web/fetch`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "fetch-combo", url: "https://example.com", format: "markdown", max_characters: 5000 }),
});
const { data } = await r.json();
console.log(data.title, data.content.length);
```

## 响应结构

```json
{
  "provider": "jina-reader",
  "url": "...",
  "title": "...",
  "content": { "format": "markdown", "text": "...", "length": 1234 },
  "links": ["https://example.com/related"],
  "metadata": { "author": null, "published_at": null, "language": null },
  "usage": { "fetch_cost_usd": 0 },
  "metrics": { "response_time_ms": 850, "upstream_latency_ms": 700 }
}
```

当上游提供商返回发现的页面链接时，会包含 `links`（目前为 Ollama Cloud）。

## 提供商特性

| 提供商 | 身份验证 | 最适合 |
|---|---|---|
| `firecrawl` | Bearer | JS 渲染的页面、`format=markdown/html` |
| `jina-reader` | Bearer（可选） | 免费层级（约 100 万字符/月）；最快的纯 markdown |
| `tavily` | Bearer | 批量提取；返回 `raw_content` |
| `exa` | `x-api-key` | 预索引页面；快速文本提取 |
| `ollama` | Bearer | Markdown 以及页面标题和发现的链接；使用 Ollama Cloud 密钥 |