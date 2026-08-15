---
name: 9router-chat
description: Chat / code generation via 9Router using OpenAI /v1/chat/completions or Anthropic /v1/messages format with streaming + auto-fallback combos. Use when the user wants to ask an LLM, generate code, summarize text, or run prompts through 9Router.
---
# 9Router — 聊天

需要配置 `NINEROUTER_URL`（如果启用了身份验证，还需要配置 `NINEROUTER_KEY`）。设置方法请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

## 端点

- `POST $NINEROUTER_URL/v1/chat/completions` — OpenAI 格式
- `POST $NINEROUTER_URL/v1/messages` — Anthropic 格式

## 发现模型

```bash
curl $NINEROUTER_URL/v1/models | jq '.data[].id'
# Per-model metadata (contextWindow, params)
curl "$NINEROUTER_URL/v1/models/info?id=openai/gpt-4o"
```

组合（例如 `vip`、`mycodex`）会自动在多个提供商之间进行回退。

## OpenAI 格式

```bash
curl -X POST $NINEROUTER_URL/v1/chat/completions \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/gpt-5","messages":[{"role":"user","content":"Hi"}],"stream":false}'
```

JS（OpenAI SDK）：

```js
import OpenAI from "openai";
const client = new OpenAI({ baseURL: `${process.env.NINEROUTER_URL}/v1`, apiKey: process.env.NINEROUTER_KEY });
const res = await client.chat.completions.create({
  model: "openai/gpt-5",
  messages: [{ role: "user", content: "Hi" }],
  stream: true,
});
for await (const chunk of res) process.stdout.write(chunk.choices[0]?.delta?.content || "");
```

## Anthropic 格式

```bash
curl -X POST $NINEROUTER_URL/v1/messages \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"cc/claude-opus-4-7","max_tokens":1024,"messages":[{"role":"user","content":"Hi"}]}'
```

## 响应结构

OpenAI（`/v1/chat/completions`）：
```json
{ "id": "chatcmpl-...", "object": "chat.completion", "model": "openai/gpt-5",
  "choices": [{ "index": 0, "message": { "role": "assistant", "content": "Hello!" }, "finish_reason": "stop" }],
  "usage": { "prompt_tokens": 8, "completion_tokens": 2, "total_tokens": 10 } }
```

流式传输（`stream:true`）会发送 SSE：`data: {choices:[{delta:{content:"..."}}]}\n\n` ... `data: [DONE]\n\n`。

Anthropic（`/v1/messages`）：
```json
{ "id": "msg_...", "type": "message", "role": "assistant", "model": "cc/claude-opus-4-7",
  "content": [{ "type": "text", "text": "Hello!" }],
  "stop_reason": "end_turn", "usage": { "input_tokens": 8, "output_tokens": 2 } }
```