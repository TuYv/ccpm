---
name: 9router-embeddings
description: Generate vector embeddings via 9Router /v1/embeddings using OpenAI / Gemini / Mistral / Voyage / Nvidia / GitHub embedding models for RAG, semantic search, similarity. Use when the user wants embeddings, vectors, RAG, semantic search, or to embed text.
---
# 9Router — 嵌入

需要 `NINEROUTER_URL`（如果启用了身份验证，还需要 `NINEROUTER_KEY`）。设置方法请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

## 发现模型

```bash
curl $NINEROUTER_URL/v1/models/embedding | jq '.data[].id'
# Per-model dimensions
curl "$NINEROUTER_URL/v1/models/info?id=openai/text-embedding-3-small"
```

## 端点

`POST $NINEROUTER_URL/v1/embeddings`

| 字段 | 必需 | 说明 |
|---|---|---|
| `model` | 是 | 来自 `/v1/models/embedding` |
| `input` | 是 | 字符串或字符串数组 |
| `encoding_format` | 否 | `float`（默认）/ `base64` |
| `dimensions` | 否 | 仅限 OpenAI v3 |

## 示例

```bash
curl -X POST $NINEROUTER_URL/v1/embeddings \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/text-embedding-3-small","input":["hello","world"]}'
```

JS：

```js
const r = await fetch(`${process.env.NINEROUTER_URL}/v1/embeddings`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gemini/text-embedding-004", input: "RAG chunk text" }),
});
const { data } = await r.json();
console.log(data[0].embedding.length);  // dimension
```

## 响应结构

```json
{ "object": "list", "model": "openai/text-embedding-3-small",
  "data": [
    { "object": "embedding", "index": 0, "embedding": [0.0123, -0.045, ...] },
    { "object": "embedding", "index": 1, "embedding": [...] }
  ],
  "usage": { "prompt_tokens": 5, "total_tokens": 5 } }
```

## 提供商特性

| 提供商 | 说明 |
|---|---|
| `openai`, `openrouter`, `mistral`, `voyage-ai`, `fireworks`, `together`, `nebius`, `github`, `nvidia`, `jina-ai` | 原生 OpenAI 结构——`dimensions` 仅适用于 OpenAI v3（`text-embedding-3-*`） |
| `gemini`, `google_ai_studio` | 服务器自动转换为 `embedContent`/`batchEmbedContents`——请发送 OpenAI 结构 |
| `openai-compatible-*`, `custom-embedding-*` | 使用凭据中的自定义 `baseUrl` |

批处理（将 `input` 设为数组）速度更快；部分提供商会限制批次大小。