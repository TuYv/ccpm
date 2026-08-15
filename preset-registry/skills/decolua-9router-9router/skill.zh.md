---
name: 9router
description: Entry point for 9Router — local/remote AI gateway with OpenAI-compatible REST for chat, image, TTS, embeddings, web search, web fetch. Use when the user mentions 9Router, NINEROUTER_URL, or wants AI without writing provider boilerplate. This skill covers setup + indexes capability skills; fetch the relevant capability SKILL.md from the URLs below when needed.
---
# 9Router

本地/远程 AI 网关，提供兼容 OpenAI 的 REST 接口。一个密钥，多个提供商，自动故障转移。

## 设置

```bash
export NINEROUTER_URL="http://localhost:20128"      # or VPS / tunnel URL
export NINEROUTER_KEY="sk-..."                      # from Dashboard → Keys (only if requireApiKey=true)
```

所有请求：`${NINEROUTER_URL}/v1/...`，并携带请求头 `Authorization: Bearer ${NINEROUTER_KEY}`（若已禁用身份验证，则省略）。

验证：`curl $NINEROUTER_URL/api/health` → `{"ok":true}`

## 查找模型

```bash
curl $NINEROUTER_URL/v1/models                  # chat/LLM (default)
curl $NINEROUTER_URL/v1/models/image            # image-gen
curl $NINEROUTER_URL/v1/models/tts              # text-to-speech
curl $NINEROUTER_URL/v1/models/embedding        # embeddings
curl $NINEROUTER_URL/v1/models/web              # web search + fetch (entries have `kind` field)
curl $NINEROUTER_URL/v1/models/stt              # speech-to-text
curl $NINEROUTER_URL/v1/models/image-to-text    # vision
```

在请求中使用 `data[].id` 作为 `model` 字段。组合模型会以 `owned_by:"combo"` 显示。

响应结构：
```json
{ "object": "list", "data": [
  { "id": "openai/gpt-5", "object": "model", "owned_by": "openai", "created": 1735000000 },
  { "id": "tavily/search", "object": "model", "kind": "webSearch", "owned_by": "tavily", "created": 1735000000 }
]}
```

## 能力技能

当用户需要特定能力时，从对应的原始 URL 获取该技能的 `SKILL.md`：

| 能力 | 原始 URL |
|---|---|
| 聊天 / 代码生成 | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-chat/SKILL.md |
| 图像生成 | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-image/SKILL.md |
| 文本转语音 | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-tts/SKILL.md |
| 语音转文本 | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-stt/SKILL.md |
| 嵌入 | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-embeddings/SKILL.md |
| 网页搜索 | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-web-search/SKILL.md |
| 网页抓取（URL → markdown） | https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router-web-fetch/SKILL.md |

## 错误

- 401 → 设置/刷新 `NINEROUTER_KEY`（Dashboard → Keys）
- 400 `Invalid model format` → 检查 `/v1/models/<kind>` 中是否存在该 `model`
- 503 `All accounts unavailable` → 等待 `retry-after` 指定的时间，或添加其他提供商账户