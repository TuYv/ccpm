---
name: 9router-tts
description: Text-to-speech via 9Router /v1/audio/speech using OpenAI / ElevenLabs / Deepgram / Edge TTS / Google TTS / Hyperbolic / Inworld voices. Use when the user wants to convert text to speech, generate audio, voiceover, narrate, or read text aloud.
---
# 9Router — 文本转语音

需要 `NINEROUTER_URL`（如果启用了身份验证，还需要 `NINEROUTER_KEY`）。设置方法请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

## 发现

```bash
# 1) List models
curl $NINEROUTER_URL/v1/models/tts | jq '.data[].id'
# 2) Per-model metadata (params, voicesUrl if voice-by-id)
curl "$NINEROUTER_URL/v1/models/info?id=el/eleven_multilingual_v2"
# 3) List voices (elevenlabs, edge-tts, deepgram, inworld, local-device). Optional ?lang=vi
curl "$NINEROUTER_URL/v1/audio/voices?provider=edge-tts&lang=vi" | jq '.data[].model'
```

`/v1/audio/speech` 中的 `model` 字段 = 直接使用语音 ID（例如 `edge-tts/vi-VN-HoaiMyNeural`、`el/<voice_id>`，或 `openai/tts-1` 模型 + 默认语音）。

## 端点

`POST $NINEROUTER_URL/v1/audio/speech`

| 字段 | 必填 | 说明 |
|---|---|---|
| `model` | 是 | 来自 `/v1/models/tts` 的语音 ID |
| `input` | 是 | 要朗读的文本 |

查询参数可使用 `?response_format=mp3`（默认，原始字节）或 `?response_format=json`（`{audio: base64, format}`）。

## 示例

保存 MP3：

```bash
curl -X POST "$NINEROUTER_URL/v1/audio/speech" \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"openai/tts-1","input":"Hello world"}' \
  --output speech.mp3
```

JS（保存文件）：

```js
import { writeFile } from "node:fs/promises";
const r = await fetch(`${process.env.NINEROUTER_URL}/v1/audio/speech`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ model: "el/eleven_multilingual_v2", input: "Xin chào" }),
});
await writeFile("speech.mp3", Buffer.from(await r.arrayBuffer()));
```

## 响应结构

默认 → 原始音频字节（Content-Type 为 `audio/mp3`）。

`?response_format=json`：
```json
{ "audio": "SUQzBAAAA...", "format": "mp3" }
```

## 提供商特性（模型格式）

| 提供商 | `model` 格式 | 说明 |
|---|---|---|
| `openai` | `tts-1/alloy`（模型/语音）或仅语音 | 默认模型为 `gpt-4o-mini-tts` |
| `elevenlabs` | `<model_id>/<voice_id>` 或 `<voice_id>` | 默认模型为 `eleven_flash_v2_5`；在控制面板中列出语音 |
| `openrouter` | `openai/gpt-4o-mini-tts/alloy` | 通过聊天补全的音频模态进行流式传输 |
| `edge-tts` | 语音 ID，例如 `vi-VN-HoaiMyNeural` | **noAuth**；默认为 `vi-VN-HoaiMyNeural` |
| `google-tts` | 语言代码，例如 `en`、`vi` | **noAuth** |
| `local-device` | 操作系统语音名称（`say -v ?` / SAPI） | **noAuth**；需要 `ffmpeg` |
| `deepgram` | `aura-asteria-en` 等 | 令牌身份验证 |
| `nvidia`, `inworld`, `cartesia`, `playht` | `model/voice` | 提供商特定的身份验证标头 |
| `coqui`, `tortoise` | 说话者/语音 ID | Localhost noAuth |
| `hyperbolic` | 模型 ID | 请求体只能是 `{text}` |