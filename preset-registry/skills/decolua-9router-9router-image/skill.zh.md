---
name: 9router-image
description: Generate images via 9Router /v1/images/generations using OpenAI / Gemini Imagen / DALL-E / FLUX / MiniMax / SDWebUI / ComfyUI / Codex models. Use when the user wants to create, generate, draw, or render an image, picture, or text-to-image (txt2img).
---
# 9Router — 图像生成

需要 `NINEROUTER_URL`（如果已启用身份验证，还需要 `NINEROUTER_KEY`）。有关设置方法，请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

## 发现模型

```bash
curl $NINEROUTER_URL/v1/models/image | jq '.data[].id'
# Per-model params/options (size enum, quality enum, capabilities like edit)
curl "$NINEROUTER_URL/v1/models/info?id=openai/dall-e-3"
```

## 端点

`POST $NINEROUTER_URL/v1/images/generations`

| 字段 | 必填 | 说明 |
|---|---|---|
| `model` | 是 | 来自 `/v1/models/image` |
| `prompt` | 是 | 图像描述 |
| `n` | 否 | 数量（取决于提供商） |
| `size` | 否 | `1024x1024`、`1792x1024`，…… |
| `quality` | 否 | `standard` / `hd`（OpenAI） |
| `response_format` | 否 | `url`（默认）或 `b64_json` |

添加查询参数 `?response_format=binary` 可接收原始图像字节（便于保存文件）。

## 示例

保存到文件（二进制）：

```bash
curl -X POST "$NINEROUTER_URL/v1/images/generations?response_format=binary" \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"gemini/gemini-3-pro-image-preview","prompt":"watercolor mountains at sunrise","size":"1024x1024"}' \
  --output out.png
```

JS（URL 响应）：

```js
const r = await fetch(`${process.env.NINEROUTER_URL}/v1/images/generations`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "gemini/gemini-3-pro-image-preview", prompt: "neon city", size: "1024x1024" }),
});
const { data } = await r.json();
console.log(data[0].url || data[0].b64_json.slice(0, 40));
```

## 响应结构

JSON（默认 `response_format=url`）：
```json
{ "created": 1735000000, "data": [{ "url": "https://..." }] }
```

`response_format=b64_json`：
```json
{ "created": 1735000000, "data": [{ "b64_json": "iVBORw0KGgo..." }] }
```

查询参数 `?response_format=binary` 会返回原始图像字节（Content-Type 为 `image/png` 或 `image/jpeg`）。

## 提供商特性

上述通用字段适用于所有提供商。以下字段会进行补充或覆盖：

| 提供商 | 额外/变更的字段 | 说明 |
|---|---|---|
| `openai`、`minimax`、`openrouter`、`recraft` | `quality`、`style`、`response_format` | 标准 OpenAI 结构 |
| `gemini`（nano-banana） | — | 仅支持 `prompt`；忽略 `size`/`n` |
| `codex`（gpt-5.4-image） | `image`、`images[]`、`image_detail`、`output_format`、`background` | SSE 流；**需要 ChatGPT Plus/Pro** |
| `huggingface` | — | 仅支持 `prompt`；返回单张图像 |
| `nanobanana` | `image`、`images[]`（编辑模式） | `size` → 宽高比；异步轮询 |
| `fal-ai` | `image`（img2img） | `n` → `num_images`；`size` → 宽高比；异步 |
| `stability-ai` | `style`（预设）、`output_format` | `size` → `aspect_ratio` |
| `black-forest-labs`（FLUX） | `image`（参考图） | `size` → 精确的 `width`/`height`；异步 |
| `runwayml` | `image`（参考图） | `size` → 宽高比；异步；存在视频模型 |
| `sdwebui`、`comfyui` | — | 本地主机无需身份验证（`:7860` / `:8188`） |