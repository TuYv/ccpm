# 长视频剪辑流水线

## 前置步骤（技能启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：** 此技能会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在选择加入后启用。绝不会收集任何代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

由 AI 驱动的流水线，可将 YouTube 长视频节目转换为独立的精彩片段。下载 → 转录 → AI 分段 → 剪辑 → 上传。一个 60 分钟的节目可在约 15 分钟内转换成 3–5 个片段。

## 适用场景

在以下情况下使用此技能：
- 将 YouTube 长视频内容（播客、访谈、演讲）转换为精彩片段
- 将 YouTube 频道的历史内容批量处理并发布到剪辑频道
- 从视频转录文本中找出最佳的独立片段
- 按照经过验证的句子边界剪辑视频片段
- 运行高产量的剪辑发布业务（每期成本为 0.50–1.00 美元）

## 前提条件

### 系统工具

```bash
brew install yt-dlp ffmpeg        # macOS
# Or: apt install ffmpeg && pip install yt-dlp  # Linux
pip install openai-whisper
```

### 环境变量

- `ANTHROPIC_API_KEY` — Claude API 密钥（分段所必需）
- YouTube Data API 凭据（可选，用于自动上传）

## 工具

### 端到端流水线

| 脚本 | 用途 | 关键命令 |
|--------|---------|-------------|
| `longform_pipeline.py` | 完整流水线：下载 → 转录 → 分段 → 验证 → 剪辑 | `python3 longform_pipeline.py --url URL --max-clips 3` |
| `scored_pipeline.py` | 使用 10 位专家 LLM 进行质量评分的流水线（仅剪辑评分为 90+ 的片段） | `python3 scored_pipeline.py --url URL --min-score 90` |

### 独立步骤

| 脚本 | 用途 | 关键命令 |
|--------|---------|-------------|
| `clip_segmenter.py` | 从 Whisper 转录文本中找出值得剪辑的片段 | `python3 clip_segmenter.py --transcript file.json --output segments.json` |
| `clip_cutter.py` | 使用 FFmpeg 根据片段元数据剪辑视频 | `python3 clip_cutter.py --source video.mp4 --segments segments.json --output-dir clips/` |

## 流水线流程

```
YouTube URL
    │
    ▼
[yt-dlp] Download video + auto-subs (VTT)
    │
    ▼
[Whisper] Local transcription with word-level timestamps
    │
    ▼
[Claude] AI segmentation — finds 3-5 best standalone segments
    │  • Scores hook strength (1-10, minimum 6)
    │  • Ensures complete narrative arcs
    │  • Verifies clean cut boundaries
    │
    ▼
[FFmpeg] Cut clips (landscape 16:9)
    │
    ▼
[Optional] Upload to YouTube / Google Drive
```

## 使用示例

### 完整流水线（最常用）

```bash
# Process a single video
python3 longform_pipeline.py --url "https://www.youtube.com/watch?v=VIDEO_ID" --max-clips 3

# Process from channel knowledge base
python3 longform_pipeline.py --channel my-podcast --max-clips 5

# Custom output directory
python3 longform_pipeline.py --url URL --output-dir ./my-clips/ --max-clips 4
```

### 分步操作（需要精细控制时）

```bash
# 1. Download
yt-dlp -f "bestvideo[ext=mp4]+bestaudio[ext=m4a]/best" -o "downloads/%(title)s.%(ext)s" "URL"

# 2. Transcribe
whisper "downloads/episode.mp4" --model medium --output_format json --output_dir transcripts/

# 3. Segment (finds best clips)
python3 clip_segmenter.py \
  --transcript transcripts/episode.json \
  --output segments/episode_segments.json \
  --episode-title "Episode Title"

# 4. Cut
python3 clip_cutter.py \
  --source downloads/episode.mp4 \
  --segments segments/episode_segments.json \
  --output-dir clips/
```

### 质量评分流水线

```bash
# Only cut clips scoring 90+ from 10-expert panel
python3 scored_pipeline.py --url URL --min-score 90

# Dry run — score candidates without cutting
python3 scored_pipeline.py --url URL --dry-run
```

### 批量处理

```bash
# Transcribe in parallel (4 at a time)
ls downloads/*.mp4 | xargs -P 4 -I {} whisper {} --model medium --output_format json --output_dir transcripts/

# Process multiple URLs
for url in $(cat urls.txt); do
  python3 longform_pipeline.py --url "$url" --max-clips 3
done
```

## 配置

### Whisper 模型选择

| 模型 | 速度（30 分钟视频） | 准确率 | 适用场景 |
|-------|-------------------|----------|----------|
| `base` | 约 3–4 分钟 | 约 95% | 快速测试 |
| `medium` | 约 7–10 分钟 | 约 98% | 生产环境（推荐） |
| `large` | 约 15–20 分钟 | 约 99% | 音频噪声较大 |

### Claude 分段调优

分段提示词支持以下调整：
- **钩子强度阈值** — 默认值为 6。提高到 7 以上可获得更高质量（但剪辑片段更少）
- **最大分段数** — 默认值为 5。降低到 3 可进行更严格的筛选
- **分段时长** — 默认为 5–15 分钟。可在提示词中根据你的格式进行调整

### FFmpeg 剪辑

- 默认使用 `-c copy`（流复制）— 速度极快且无质量损失，但会在关键帧边界处剪切（误差 ±1–2 秒）
- `longform_pipeline.py` 使用重新编码来实现帧级精确剪辑，但会占用更多 CPU 时间
- 向 `clip_cutter.py` 添加 `--buffer-start 2 --buffer-end 2` 以预留缓冲时长

## 数据流

```
YouTube URL → yt-dlp (download) → Whisper (transcribe) → Claude (segment) → FFmpeg (cut) → Clips
                                                              │
                                                              ▼
                                                    Claude (verify cut boundaries)
```

## 成本

- **每集：** $0.50–1.00（仅 Claude API — 其他所有组件均免费或在本地运行）
- **规模化使用（每天 10 个剪辑片段）：** 每月约 $45–90
- **规模化使用（每天 50 个剪辑片段）：** 每月约 $225–450

## 依赖项

- Python 3.9+
- `anthropic` — Claude API 客户端
- `openai-whisper` — 本地转录
- `yt-dlp` — 视频下载（系统二进制文件）
- `ffmpeg` / `ffprobe` — 视频处理（系统二进制文件）
- `requests` — HTTP 客户端（用于可选的上传功能）