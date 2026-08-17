---
name: whisper-transcription
description: "Transcribe audio and video files to text using OpenAI Whisper. Use when: converting podcasts to blog posts; creating video subtitles; extracting quotes from interviews; repurposing video content to text; building searchable audio archives"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# Whisper 转录

> 使用 OpenAI 的 Whisper 模型将任何音频或视频转录为文本——这与 ChatGPT 语音功能所采用的技术相同。

## 何时使用此技能

- **播客内容再利用** - 将节目转换为博客文章、节目笔记和社交媒体短内容
- **视频字幕** - 为 YouTube 和社交媒体生成 SRT/VTT 文件
- **访谈内容提取** - 从通话录音中提取引言和洞见
- **内容审计** - 让音频/视频资料库可供搜索
- **翻译** - 转录并翻译外语内容


## Claude 的职责与由你决定的事项

| Claude 的职责 | 由你决定 |
|-------------|------------|
| 构建制作工作流 | 最终创意方向 |
| 提出技术方案建议 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 识别最佳实践 | 品牌/语调决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 依赖项

```bash
pip install openai-whisper torch ffmpeg-python click
# Also requires ffmpeg installed on system
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
```

## 命令

### 转录单个文件
```bash
python scripts/main.py transcribe audio.mp3 --model medium --output transcript.txt
python scripts/main.py transcribe video.mp4 --format srt --output subtitles.srt
```

### 批量转录
```bash
python scripts/main.py batch ./recordings/ --format txt --output ./transcripts/
```

### 转录并翻译
```bash
python scripts/main.py translate foreign-audio.mp3 --to en
```

### 提取时间戳
```bash
python scripts/main.py timestamps podcast.mp3 --format json
```

## 示例

### 示例 1：将播客转换为博客文章
```bash
# Transcribe 1-hour podcast
python scripts/main.py transcribe episode-42.mp3 --model medium

# Output: episode-42.txt (full transcript with timestamps)
# Processing time: ~5 min for 1 hour audio on M1 Mac
```

### 示例 2：YouTube 字幕
```bash
# Generate SRT for video upload
python scripts/main.py transcribe marketing-video.mp4 --format srt

# Output: marketing-video.srt
# Upload directly to YouTube/Vimeo
```

### 示例 3：批量处理访谈资料库
```bash
# Transcribe all recordings in folder
python scripts/main.py batch ./customer-interviews/ --model small --format txt

# Output: ./customer-interviews/*.txt (one per audio file)
```

## 模型选择指南

| 模型 | 速度 | 准确率 | VRAM | 最适合 |
|-------|-------|----------|------|----------|
| `tiny` | 最快 | ~70% | 1GB | 快速草稿、短片段 |
| `base` | 快 | ~80% | 1GB | 社交媒体片段 |
| `small` | 中等 | ~85% | 2GB | 播客、访谈 |
| `medium` | 慢 | ~90% | 5GB | 专业转录稿 |
| `large` | 最慢 | ~95% | 10GB | 对准确率有严格要求的场景 |

**建议：** 对于大多数营销内容，先使用 `small`。面向客户交付时使用 `medium`。

## 输出格式

| 格式 | 扩展名 | 使用场景 |
|--------|-----------|----------|
| `txt` | .txt | 博客文章、分析 |
| `srt` | .srt | 视频字幕（YouTube） |
| `vtt` | .vtt | Web 视频字幕 |
| `json` | .json | 程序化访问 |
| `tsv` | .tsv | 电子表格分析 |

## 性能提示

1. **GPU 加速** - 使用 CUDA GPU 可提升 10 倍速度
2. **音频提取** - 脚本会自动从视频中提取音频
3. **分块处理** - 自动拆分长文件以提高内存使用效率
4. **语言检测** - 自动检测，或使用 `--language` 指定

## 技能边界

### 此技能擅长的方面
- 构建音频制作工作流
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此技能无法做到的方面
- 替代音频工程专业知识
- 做出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 相关技能

- [视频处理](../video-processing/) - 从视频中提取音频
- [YouTube 下载器](../youtube-downloader/) - 下载要转录的视频
- [内容再利用](../content-repurposer/) - 将转录文本转换为内容
- [播客制作](../../audio/podcast-production/) - 创建播客

## 技能元数据


- **模式**：cyborg
```yaml
category: automation
subcategory: audio-processing
dependencies: [openai-whisper, torch, ffmpeg-python]
difficulty: beginner
time_saved: 10+ hours/week
```