---
name: fal-ai-media
description: Unified media generation via fal.ai MCP — image, video, and audio. Covers text-to-image (Nano Banana), text/image-to-video (Seedance, Kling, Veo 3), text-to-speech (CSM-1B), and video-to-audio (ThinkSound). Use when the user wants to generate images, videos, or audio with AI.
---
# fal.ai 媒体生成

通过 MCP 使用 fal.ai 模型生成图像、视频和音频。

## 何时启用

- 用户希望根据文本提示词生成图像
- 根据文本或图像创建视频
- 生成语音、音乐或音效
- 任何媒体生成任务
- 用户说出“生成图像”“创建视频”“文本转语音”“制作缩略图”或类似表述

## MCP 要求

必须配置 fal.ai MCP 服务器。添加到 `~/.claude.json`：

```json
"fal-ai": {
  "command": "npx",
  "args": ["-y", "fal-ai-mcp-server"],
  "env": { "FAL_KEY": "YOUR_FAL_KEY_HERE" }
}
```

在 [fal.ai](https://fal.ai) 获取 API 密钥。

## MCP 工具

fal.ai MCP 提供以下工具：
- `search` — 按关键词查找可用模型
- `find` — 获取模型详情和参数
- `generate` — 使用参数运行模型
- `result` — 检查异步生成结果状态
- `status` — 检查任务状态
- `cancel` — 取消正在运行的任务
- `estimate_cost` — 估算生成成本
- `models` — 列出热门模型
- `upload` — 上传用作输入的文件

---

## 图像生成

### Nano Banana 2（快速）
最适合：快速迭代、草稿、文本生成图像、图像编辑。

```
generate(
  model_name: "fal-ai/nano-banana-2",
  input: {
    "prompt": "a futuristic cityscape at sunset, cyberpunk style",
    "image_size": "landscape_16_9",
    "num_images": 1,
    "seed": 42
  }
)
```

### Nano Banana Pro（高保真）
最适合：生产级图像、写实效果、文字排版、详细提示词。

```
generate(
  model_name: "fal-ai/nano-banana-pro",
  input: {
    "prompt": "professional product photo of wireless headphones on marble surface, studio lighting",
    "image_size": "square",
    "num_images": 1,
    "guidance_scale": 7.5
  }
)
```

### 常用图像参数

| 参数 | 类型 | 选项 | 说明 |
|-------|------|---------|-------|
| `prompt` | string | 必填 | 描述你想要的内容 |
| `image_size` | string | `square`, `portrait_4_3`, `landscape_16_9`, `portrait_16_9`, `landscape_4_3` | 宽高比 |
| `num_images` | number | 1-4 | 要生成的数量 |
| `seed` | number | 任意整数 | 可复现性 |
| `guidance_scale` | number | 1-20 | 遵循提示词的程度（越高 = 越贴近字面含义） |

### 图像编辑
使用 Nano Banana 2 并提供输入图像，以进行局部重绘、扩图或风格迁移：

```
# First upload the source image
upload(file_path: "/path/to/image.png")

# Then generate with image input
generate(
  model_name: "fal-ai/nano-banana-2",
  input: {
    "prompt": "same scene but in watercolor style",
    "image_url": "<uploaded_url>",
    "image_size": "landscape_16_9"
  }
)
```

---

## 视频生成

### Seedance 1.0 Pro（ByteDance）
最适合：具有高质量动态效果的文本生成视频、图像生成视频。

```
generate(
  model_name: "fal-ai/seedance-1-0-pro",
  input: {
    "prompt": "a drone flyover of a mountain lake at golden hour, cinematic",
    "duration": "5s",
    "aspect_ratio": "16:9",
    "seed": 42
  }
)
```

### Kling Video v3 Pro
最适合：支持原生音频生成的文本/图像生成视频。

```
generate(
  model_name: "fal-ai/kling-video/v3/pro",
  input: {
    "prompt": "ocean waves crashing on a rocky coast, dramatic clouds",
    "duration": "5s",
    "aspect_ratio": "16:9"
  }
)
```

### Veo 3 (Google DeepMind)
最适合：生成带声音且视觉质量高的视频。

```
generate(
  model_name: "fal-ai/veo-3",
  input: {
    "prompt": "a bustling Tokyo street market at night, neon signs, crowd noise",
    "aspect_ratio": "16:9"
  }
)
```

### 图生视频
从现有图像开始：

```
generate(
  model_name: "fal-ai/seedance-1-0-pro",
  input: {
    "prompt": "camera slowly zooms out, gentle wind moves the trees",
    "image_url": "<uploaded_image_url>",
    "duration": "5s"
  }
)
```

### 视频参数

| 参数 | 类型 | 选项 | 说明 |
|-------|------|---------|-------|
| `prompt` | string | 必填 | 描述视频 |
| `duration` | string | `"5s"`, `"10s"` | 视频时长 |
| `aspect_ratio` | string | `"16:9"`, `"9:16"`, `"1:1"` | 画面比例 |
| `seed` | number | 任意整数 | 可复现性 |
| `image_url` | string | URL | 图生视频的源图像 |

---

## 音频生成

### CSM-1B（对话语音）
具有自然对话质感的文本转语音。

```
generate(
  model_name: "fal-ai/csm-1b",
  input: {
    "text": "Hello, welcome to the demo. Let me show you how this works.",
    "speaker_id": 0
  }
)
```

### ThinkSound（视频转音频）
根据视频内容生成匹配的音频。

```
generate(
  model_name: "fal-ai/thinksound",
  input: {
    "video_url": "<video_url>",
    "prompt": "ambient forest sounds with birds chirping"
  }
)
```

### ElevenLabs（通过 API，不使用 MCP）
如需专业语音合成，请直接使用 ElevenLabs：

```python
import os
import requests

resp = requests.post(
    "https://api.elevenlabs.io/v1/text-to-speech/<voice_id>",
    headers={
        "xi-api-key": os.environ["ELEVENLABS_API_KEY"],
        "Content-Type": "application/json"
    },
    json={
        "text": "Your text here",
        "model_id": "eleven_turbo_v2_5",
        "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}
    }
)
with open("output.mp3", "wb") as f:
    f.write(resp.content)
```

### VideoDB 生成式音频
如果已配置 VideoDB，请使用其生成式音频功能：

```python
# Voice generation
audio = coll.generate_voice(text="Your narration here", voice="alloy")

# Music generation
music = coll.generate_music(prompt="upbeat electronic background music", duration=30)

# Sound effects
sfx = coll.generate_sound_effect(prompt="thunder crack followed by rain")
```

---

## 成本估算

生成前，请检查预估成本：

```
estimate_cost(model_name: "fal-ai/nano-banana-pro", input: {...})
```

## 模型发现

查找适用于特定任务的模型：

```
search(query: "text to video")
find(model_name: "fal-ai/seedance-1-0-pro")
models()
```

## 提示

- 迭代提示词时，使用 `seed` 可获得可复现的结果
- 从成本较低的模型（Nano Banana 2）开始迭代提示词，然后切换到 Pro 生成最终结果
- 对于视频，提示词应描述清晰但保持简洁——重点关注运动和场景
- 与纯文本生成视频相比，图生视频可生成更可控的结果
- 在运行成本较高的视频生成任务前，请检查 `estimate_cost`

## 相关技能

- `videodb` — 视频处理、编辑和流式传输
- `video-editing` — AI 驱动的视频编辑工作流
- `content-engine` — 面向社交平台的内容创作