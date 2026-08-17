---
name: video-processing
description: "Process video files with ffmpeg automation. Use when: compressing videos for upload; extracting audio from video; resizing for social formats; clipping segments; merging multiple videos; generating thumbnails"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# 视频处理

> 使用 FFmpeg 自动执行重复性视频编辑任务——这是为 YouTube、Netflix 和大多数视频平台提供支持的行业标准工具。

## 何时使用此技能

- **社交媒体优化** - 为 Instagram（9:16）、TikTok、LinkedIn 调整视频尺寸
- **上传准备** - 压缩大型视频以满足平台限制
- **音频提取** - 从网络研讨会、访谈中提取音频，用于制作播客
- **内容剪辑** - 提取精彩片段、引言或视频片段
- **批量处理** - 对多个视频应用相同的操作


## Claude 负责什么，以及由你决定什么

| Claude 负责 | 由你决定 |
|-------------|------------|
| 构建制作工作流 | 最终创意方向 |
| 建议技术方案 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 确定最佳实践 | 品牌和表达风格决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 依赖项

```bash
pip install ffmpeg-python moviepy click
# Also requires ffmpeg installed on system
# macOS: brew install ffmpeg
# Ubuntu: sudo apt install ffmpeg
```

## 命令

### 压缩视频
```bash
python scripts/main.py compress video.mp4 --target-mb 10
python scripts/main.py compress video.mp4 --crf 28 --output compressed.mp4
```

### 提取音频
```bash
python scripts/main.py extract-audio video.mp4 --format mp3
python scripts/main.py extract-audio video.mp4 --format wav --output audio.wav
```

### 调整社交媒体视频尺寸
```bash
python scripts/main.py resize video.mp4 --format instagram  # 1080x1920 (9:16)
python scripts/main.py resize video.mp4 --format youtube    # 1920x1080 (16:9)
python scripts/main.py resize video.mp4 --format square     # 1080x1080 (1:1)
python scripts/main.py resize video.mp4 --width 1280 --height 720
```

### 剪辑片段
```bash
python scripts/main.py clip video.mp4 --start 00:30 --end 01:45
python scripts/main.py clip video.mp4 --start 00:30 --duration 60
```

### 合并视频
```bash
python scripts/main.py concat video1.mp4 video2.mp4 --output merged.mp4
python scripts/main.py concat ./clips/ --output compilation.mp4
```

### 生成缩略图
```bash
python scripts/main.py thumbnail video.mp4 --time 00:30
python scripts/main.py thumbnail video.mp4 --best  # Auto-select best frame
```

## 示例

### 示例 1：为 Instagram Reels 准备视频
```bash
# Original: 4K horizontal video, 500MB
python scripts/main.py resize long-video.mp4 --format instagram
python scripts/main.py compress long-video_instagram.mp4 --target-mb 50

# Output: long-video_instagram_compressed.mp4 (1080x1920, <50MB)
```

### 示例 2：从网络研讨会中提取播客音频
```bash
# Extract audio track
python scripts/main.py extract-audio webinar-recording.mp4 --format mp3 --bitrate 192k

# Output: webinar-recording.mp3 (ready for podcast hosting)
```

### 示例 3：创建精彩集锦
```bash
# Extract multiple clips
python scripts/main.py clip interview.mp4 --start 05:30 --end 06:15 --output clip1.mp4
python scripts/main.py clip interview.mp4 --start 12:00 --end 12:45 --output clip2.mp4
python scripts/main.py clip interview.mp4 --start 28:30 --end 29:00 --output clip3.mp4

# Merge into highlight reel
python scripts/main.py concat clip1.mp4 clip2.mp4 clip3.mp4 --output highlights.mp4
```

## 社交媒体格式参考

| 平台 | 格式 | 分辨率 | 最大文件大小 | 最长时长 |
|----------|--------|------------|----------|--------------|
| Instagram Reels | 9:16 | 1080x1920 | 4GB | 90s |
| Instagram Feed | 1:1 | 1080x1080 | 4GB | 60s |
| TikTok | 9:16 | 1080x1920 | 287MB | 10min |
| YouTube Shorts | 9:16 | 1080x1920 | - | 60s |
| YouTube | 16:9 | 1920x1080 | 256GB | 12h |
| LinkedIn | 1:1/16:9 | 1920x1080 | 5GB | 10min |
| Twitter/X | 16:9 | 1920x1080 | 512MB | 2:20 |

## 性能提示

1. **GPU 加速** - FFmpeg 会在可用时使用硬件编码（NVENC、VideoToolbox）
2. **CRF 值** - 值越低，质量越好，文件越大。典型范围为 18-28
3. **预设选择** - 草稿使用 `ultrafast`，最终导出使用 `slow`
4. **两遍编码** - 对于目标码率，可获得更好的质量

## Skill 边界

### 此 Skill 擅长的工作
- 构建音频制作工作流
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此 Skill 无法完成的工作
- 替代音频工程专业知识
- 做出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 相关 Skill

- [whisper-transcription](../whisper-transcription/) - 转录视频音频
- [youtube-downloader](../youtube-downloader/) - 下载待处理的视频
- [image-batch](../image-batch/) - 处理视频缩略图

## Skill 元数据


- **模式**：cyborg
```yaml
category: automation
subcategory: video-processing
dependencies: [ffmpeg-python, moviepy]
difficulty: beginner
time_saved: 5+ hours/week
```