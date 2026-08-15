---
name: 9router-stt
description: Speech-to-text via 9Router /v1/audio/transcriptions using OpenAI Whisper / Groq / Gemini / Deepgram / AssemblyAI / NVIDIA / HuggingFace models. Use when the user wants to transcribe audio, convert speech to text, or get subtitles from audio files.
---
# 9Router — 语音转文本

需要配置 `NINEROUTER_URL`（如果启用了身份验证，还需要配置 `NINEROUTER_KEY`）。设置方法请参阅 https://raw.githubusercontent.com/decolua/9router/refs/heads/master/skills/9router/SKILL.md。

## 发现模型

```bash
curl $NINEROUTER_URL/v1/models/stt | jq '.data[].id'
# Per-model params (language, response_format, prompt, temperature support)
curl "$NINEROUTER_URL/v1/models/info?id=openai/whisper-1"
```

`model` = STT 模型 ID（例如 `openai/whisper-1`、`groq/whisper-large-v3`、`deepgram/nova-3`、`gemini/gemini-2.5-flash`）。

## 端点

`POST $NINEROUTER_URL/v1/audio/transcriptions`（兼容 OpenAI Whisper，`multipart/form-data`）

| 字段 | 必填 | 说明 |
|---|---|---|
| `model` | 是 | 来自 `/v1/models/stt` |
| `file` | 是 | 音频文件（mp3、wav、m4a、webm、ogg、flac） |
| `language` | 否 | ISO-639-1（例如 `en`、`vi`） |
| `prompt` | 否 | 用于引导转录的提示文本 |
| `response_format` | 否 | `json`（默认）/ `text` / `verbose_json` / `srt` / `vtt` |
| `temperature` | 否 | 0–1 |

## 示例

```bash
curl -X POST "$NINEROUTER_URL/v1/audio/transcriptions" \
  -H "Authorization: Bearer $NINEROUTER_KEY" \
  -F "model=openai/whisper-1" \
  -F "file=@audio.mp3" \
  -F "language=vi"
```

JS（Node）：

```js
import { createReadStream } from "node:fs";
const form = new FormData();
form.append("model", "groq/whisper-large-v3-turbo");
form.append("file", new Blob([await (await import("node:fs/promises")).readFile("audio.mp3")]), "audio.mp3");
const r = await fetch(`${process.env.NINEROUTER_URL}/v1/audio/transcriptions`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${process.env.NINEROUTER_KEY}` },
  body: form,
});
const { text } = await r.json();
console.log(text);
```

## 响应结构

默认（`response_format=json`）：
```json
{ "text": "Xin chào, đây là bản ghi âm." }
```

`verbose_json` 会添加 `language`、`duration` 和带时间戳的 `segments[]`。
`srt` / `vtt` 返回字幕文本。

## 提供商特性

| 提供商 | `model` 格式 | 说明 |
|---|---|---|
| `openai` | `whisper-1`, `gpt-4o-transcribe`, `gpt-4o-mini-transcribe` | 原生 OpenAI 格式 |
| `groq` | `whisper-large-v3`, `whisper-large-v3-turbo`, `distil-whisper-large-v3-en` | 速度最快；OpenAI 格式 |
| `gemini` | `gemini-2.5-flash`, `gemini-2.5-pro`, `gemini-2.5-flash-lite` | 服务器将其转换为带内联音频的 `generateContent` |
| `deepgram` | `nova-3`, `nova-2`, `whisper-large` | 令牌身份验证；服务器适配响应 |
| `assemblyai` | `universal-3-pro`, `universal-2` | 异步上传和轮询由服务器端处理 |
| `nvidia` | `nvidia/parakeet-ctc-1.1b-asr` | NIM 端点 |
| `huggingface` | `openai/whisper-large-v3`, `openai/whisper-small` | HF 推理 API |