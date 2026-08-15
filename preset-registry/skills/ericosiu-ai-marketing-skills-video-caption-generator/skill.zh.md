---

## Preamble (runs on skill start)

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **Privacy:** This skill logs usage locally to `~/.ai-marketing-skills/analytics/`. Remote telemetry is opt-in only. No code, file paths, or repo content is ever collected. See `telemetry/README.md`.

---
name: video-caption-generator
description: >
  转录 Google Drive 文件夹中的短视频，按内容去重，
  并生成社交媒体文案及 YouTube/Facebook 标题。当新视频
  片段被放入 Drive 文件夹，而你需要为每个唯一片段生成转录文本、文案和
  标题时使用。
  触发短语："处理 Drive 中的视频"、"转录新片段"、
  "为这些视频生成文案"、"为这些片段生成标题"。
---

# 视频文案生成器

处理 Google Drive 文件夹中的新 MP4 文件：转录、去重并生成文案和标题。

## Drive 文件夹设置

首次使用前，请配置 Google Drive 文件夹 ID：

| 文件夹 | 用途 |
|--------|---------|
| 主文件夹 / 待排期 | 新片段会被放在这里等待处理 |
| 已排期 | 已发布或已排期的片段（发布后移至此处） |
| A/B | 用于后续发布的标题变体 |

在 `folder-map.json` 中设置文件夹 ID，或通过 `--folder-id` 直接传入。

## 快速运行

```bash
python3 skills/video-caption-generator/scripts/process_videos.py \
  --folder-id YOUR_FOLDER_ID
```

已处理的视频 ID 会记录到 `processed_ids.json` 中，因此后续运行时会跳过已经处理过的视频。

## A/B 变体处理

转录文本相同但文件名不同的视频（例如 `0411.mp4`、`0411(1).mp4`）属于 A/B 标题变体——音频相同，但画面中的标题不同。脚本会处理所有变体（不会因去重而跳过），并在输出中将它们标记为 A/B 变体。

## 输出格式

对于每个唯一的新片段，输出：

```
*<filename>*
📝 *Transcript:* <raw spoken words>
🎬 *Caption:* <social-friendly 2-4 sentence caption>
📺 *YT/FB Title:* <punchy title under 60 chars>
```

## 文案和标题风格指南

- **文案：** 使用第一人称和对话式语气，不添加话题标签，共 2～4 句话。先用钩子吸引注意，再给出洞见。
- **标题：** 激发好奇心，少于 60 个字符，除非确有充分理由，否则不要使用“How I...”。以冲突点或数字开头。

## 依赖项

- `whisper`（本地安装，模型：turbo）
- 用于列出和下载文件的 Google Drive CLI 或 SDK
- Anthropic API 密钥（通过 `ANTHROPIC_API_KEY` 环境变量设置）

## 配置

1. 在环境中设置 `ANTHROPIC_API_KEY`
2. 更新 `scripts/process_videos.py` 中的 `GWS_GATEWAY`，使其指向你的 Google Drive CLI
3. 如果 Whisper 安装在其他路径，请更新 `WHISPER_BIN`

## 添加新文件夹

通过 `--folder-id <ID>` 传入不同的文件夹。每个文件夹共用同一个 `processed_ids.json` 日志（Drive ID 在全局范围内唯一，因此不会发生冲突）。