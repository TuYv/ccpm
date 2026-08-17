---
name: youtube-downloader
description: "Download and process YouTube content for research. Use when: downloading competitor videos for analysis; extracting audio for podcasts; getting transcripts for content repurposing; archiving webinars; research content curation"
license: MIT
metadata:
  author: ClawFu
  version: 1.0.0
  mcp-server: "@clawfu/mcp-skills"
---
# YouTube 下载器

> 使用 yt-dlp 下载 YouTube 视频、提取音频并获取字幕——它是最可靠的 YouTube 内容提取工具。

## 何时使用此技能

- **竞品研究** - 下载并分析竞品视频
- **内容再利用** - 提取音频用于播客，或提取字幕用于博客
- **培训材料** - 归档网络研讨会和教程
- **引语提取** - 获取字幕，以便提取值得引用的片段
- **离线访问** - 保存视频，供旅行途中或演示时使用


## Claude 负责什么，您决定什么

| Claude 负责 | 您决定 |
|-------------|------------|
| 构建制作工作流 | 最终创意方向 |
| 建议技术方案 | 设备和工具选择 |
| 创建模板和检查清单 | 质量标准 |
| 确定最佳实践 | 品牌与表达风格决策 |
| 生成脚本大纲 | 最终脚本审批 |

## 依赖项

```bash
pip install yt-dlp click
# Optional for transcription:
pip install openai-whisper
```

## 命令

### 下载视频
```bash
python scripts/main.py download "https://youtube.com/watch?v=..." --format mp4
python scripts/main.py download "https://youtube.com/watch?v=..." --quality 1080p
```

### 提取音频
```bash
python scripts/main.py audio "https://youtube.com/watch?v=..." --format mp3
python scripts/main.py audio "https://youtube.com/watch?v=..." --format wav
```

### 获取字幕
```bash
python scripts/main.py transcript "https://youtube.com/watch?v=..."
python scripts/main.py transcript "https://youtube.com/watch?v=..." --translate en
```

### 下载播放列表
```bash
python scripts/main.py playlist "https://youtube.com/playlist?list=..." --limit 10
python scripts/main.py playlist "https://youtube.com/playlist?list=..." --audio-only
```

### 获取元数据
```bash
python scripts/main.py info "https://youtube.com/watch?v=..."
python scripts/main.py info "https://youtube.com/watch?v=..." --format json
```

## 示例

### 示例 1：研究竞品内容
```bash
# Get video metadata
python scripts/main.py info "https://youtube.com/watch?v=ABC123"

# Output:
# Title: How We Grew to $1M ARR
# Channel: SaaS Founder
# Duration: 15:32
# Views: 45,230
# Published: 2024-01-15
# Tags: saas, growth, startup

# Download transcript for analysis
python scripts/main.py transcript "https://youtube.com/watch?v=ABC123"
# Output: how-we-grew-to-1m-arr.txt
```

### 示例 2：将网络研讨会制作成播客
```bash
# Download audio only
python scripts/main.py audio "https://youtube.com/watch?v=WEBINAR" --format mp3 --quality best

# Output: webinar-title.mp3 (ready for podcast editing)

# Get transcript for show notes
python scripts/main.py transcript "https://youtube.com/watch?v=WEBINAR"
# Output: webinar-title.txt
```

### 示例 3：归档培训播放列表
```bash
# Download entire playlist
python scripts/main.py playlist "https://youtube.com/playlist?list=TRAINING" \
  --output ./training-videos/ \
  --limit 20

# Output:
# ./training-videos/
# ├── 01-introduction.mp4
# ├── 02-getting-started.mp4
# └── ...
```

## 质量选项

| 选项 | 分辨率 | 文件大小 | 使用场景 |
|--------|------------|-----------|----------|
| `best` | 可用的最高质量 | 最大 | 归档 |
| `1080p` | 1920x1080 | ~1GB/小时 | 标准 |
| `720p` | 1280x720 | ~500MB/小时 | 均衡 |
| `480p` | 854x480 | ~250MB/小时 | 移动设备 |
| `audio` | 不适用 | ~100MB/小时 | 播客 |

## 音频格式

| 格式 | 质量 | 大小 | 兼容性 |
|--------|---------|------|---------------|
| `mp3` | 良好 | 小 | 通用 |
| `m4a` | 更佳 | 中等 | Apple/现代设备 |
| `wav` | 无损 | 大 | 编辑 |
| `opus` | 最佳 | 最小 | 现代应用 |

## 法律注意事项

⚠️ **重要**：仅下载你有权使用的内容。

**通常可以：**
- 你自己的视频
- 知识共享内容
- 用于个人研究/参考的内容
- 明确允许下载的内容

**请先确认：**
- 竞争对手的内容（合理使用分析）
- 用于衍生作品的内容
- 任何用于商业用途的内容

## Skill 边界

### 此 Skill 擅长的事项
- 构建音频制作工作流
- 提供技术指导
- 创建质量检查清单
- 提出创意方法建议

### 此 Skill 无法做到的事项
- 取代音频工程专业知识
- 做出主观的创意决策
- 直接访问或编辑音频文件
- 保证商业成功

## 相关 Skill

- [whisper-transcription](../whisper-transcription/) - 转录已下载的音频
- [video-processing](../video-processing/) - 处理已下载的视频
- [content-repurposer](../content-repurposer/) - 对转录文本进行内容再利用

## Skill 元数据


- **模式**：cyborg
```yaml
category: automation
subcategory: content-extraction
dependencies: [yt-dlp]
difficulty: beginner
time_saved: 4+ hours/week
```