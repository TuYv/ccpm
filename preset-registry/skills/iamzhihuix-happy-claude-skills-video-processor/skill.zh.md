---
name: video-processor
description: Download and process videos from YouTube and other platforms. Supports video download, audio extraction, format conversion (mp4, webm), and Whisper transcription. Use when user mentions YouTube download, video conversion, audio extraction, transcription, mp4, webm, ffmpeg, yt-dlp, or whisper transcription.
metadata:
  author: iamzhihuix
  version: "1.0.0"
---
# 视频处理器

## 使用说明

此技能提供全面的视频处理实用工具，包括使用 yt-dlp、FFmpeg 和 OpenAI 的 Whisper 模型下载 YouTube 视频、提取音频、转换格式以及转录音频。

### 前置条件

**必需工具**（必须安装在你的环境中）：
- **yt-dlp**：适用于 YouTube 及数千个其他网站的视频下载器
  ```bash
  # Install via pip
  pip install -U yt-dlp

  # Verify installation
  yt-dlp --version
  ```

- **FFmpeg**：用于处理视频/音频的多媒体框架
  ```bash
  # macOS
  brew install ffmpeg

  # Ubuntu/Debian
  apt-get install ffmpeg

  # Verify installation
  ffmpeg -version
  ```

- **OpenAI Whisper**：语音转文字转录模型
  ```bash
  # Install via pip
  pip install -U openai-whisper

  # Verify installation
  whisper --help
  ```

**Python 包**（通过 PEP 723 包含在脚本中）：
- click（CLI 框架）
- ffmpeg-python（FFmpeg 的 Python 封装）
- yt-dlp（视频下载器）

### 工作流程

所有视频处理任务均使用 `scripts/video_processor.py` 脚本。该脚本提供了一个简单的 CLI，其中包含以下命令：

#### 0. **从 YouTube 或其他平台下载视频**（新增！）

从 YouTube 及数千个其他受支持的网站下载视频：

```bash
# Download video
uv run .claude/skills/video-processor/scripts/video_processor.py download "https://youtube.com/watch?v=..." output.mp4

# Download audio only (as MP3)
uv run .claude/skills/video-processor/scripts/video_processor.py download "https://youtube.com/watch?v=..." --audio-only

# Show video info without downloading
uv run .claude/skills/video-processor/scripts/video_processor.py download "https://youtube.com/watch?v=..." --info

# Download with subtitles
uv run .claude/skills/video-processor/scripts/video_processor.py download "https://youtube.com/watch?v=..." output.mp4 --subtitle
```

选项：
- `--audio-only`：仅下载音频（提取为 MP3）
- `--subtitle`：下载并嵌入字幕（支持 en、zh-Hans、zh-Hant）
- `--info`：显示视频信息而不下载
- `--format`：指定首选视频格式（默认：最佳质量）

#### 1. **从视频中提取音频**

从视频文件中提取音轨：

```bash
uv run .claude/skills/video-processor/scripts/video_processor.py extract-audio input.mp4 output.wav
```

选项：
- `--format`：输出音频格式（默认：wav）。支持：wav、mp3、aac、flac
- 输出内容适用于转录或作为独立音频使用

#### 2. **将视频转换为 MP4**

将任意视频文件转换为 MP4 格式：

```bash
uv run .claude/skills/video-processor/scripts/video_processor.py to-mp4 input.avi output.mp4
```

选项：
- `--codec`：视频编解码器（默认：libx264）。常用选项：libx264、libx265、h264
- `--preset`：编码速度/质量预设（默认：medium）。选项：ultrafast、fast、medium、slow、veryslow

#### 3. **将视频转换为 WebM**

将任意视频文件转换为 WebM 格式（针对 Web 优化）：

```bash
uv run .claude/skills/video-processor/scripts/video_processor.py to-webm input.mp4 output.webm
```

选项：
- `--codec`：视频编解码器（默认：libvpx-vp9）。可选值：libvpx、libvpx-vp9
- WebM 针对网页播放和流式传输进行了优化

#### 4. **使用 Whisper 转录音频**

使用 OpenAI 的 Whisper 模型将音频或视频文件转录为文本：

```bash
# Transcribe video file (audio will be extracted automatically)
uv run .claude/skills/video-processor/scripts/video_processor.py transcribe input.mp4 transcript.txt

# Transcribe audio file directly
uv run .claude/skills/video-processor/scripts/video_processor.py transcribe audio.wav transcript.txt
```

选项：
- `--model`：Whisper 模型大小（默认：base）。可选值：
  - `tiny`：速度最快，准确率最低（约需 1GB 内存）
  - `base`：速度快，准确率高（约需 1GB 内存）**[默认]**
  - `small`：速度与准确率均衡（约需 2GB 内存）
  - `medium`：准确率高（约需 5GB 内存）
  - `large`：准确率最高，速度最慢（约需 10GB 内存）
- `--language`：语言代码（默认：自动检测）。示例：en、es、fr、de、zh
- `--format`：输出格式（默认：txt）。可选值：txt、srt、vtt、json

**转录工作流程：**
1. 如果输入是视频，FFmpeg 会将音频提取到临时 WAV 文件中
2. Whisper 处理该音频文件
3. 转录结果以请求的格式保存
4. 自动清理临时文件

#### 5. **组合工作流程示例**

端到端处理视频：

```bash
# 1. Extract audio for analysis
uv run .claude/skills/video-processor/scripts/video_processor.py extract-audio lecture.mp4 lecture.wav

# 2. Transcribe to SRT subtitles
uv run .claude/skills/video-processor/scripts/video_processor.py transcribe lecture.mp4 lecture.srt --format srt --model small

# 3. Convert to web format
uv run .claude/skills/video-processor/scripts/video_processor.py to-webm lecture.mp4 lecture.webm
```

### 关键技术细节

**FFmpeg 与 Whisper 集成：**
- FFmpeg 本身不转录音频，而是为外部转录准备音频
- 工作流程为：提取音频（FFmpeg）→ 转录（Whisper）→ 可选：重新与视频整合
- FFmpeg 可以将音频直接通过管道传输给 Whisper 进行实时处理（高级用例）

**用于转录的音频格式：**
- Whisper 对 WAV 或 MP3 格式的处理效果最佳
- 采样率：16kHz 最佳（脚本会自动处理转换）
- 脚本会使用适合 Whisper 的最佳设置提取音频

**输出格式：**
- **txt**：纯文本转录稿
- **srt**：SubRip 字幕格式（包含时间戳）
- **vtt**：WebVTT 字幕格式（Web 标准）
- **json**：包含单词级时间戳的详细 JSON

### 错误处理

该脚本包含全面的错误处理：
- 验证输入文件是否存在
- 检查是否已安装 FFmpeg 和 Whisper
- 针对缺少依赖项的情况提供清晰的错误消息
- 出错时处理临时文件的清理工作

### 性能提示

- 使用 `tiny` 或 `base` 模型快速生成初稿
- 使用 `small` 或 `medium` 模型进行生产级转录
- 仅在需要最高准确率时使用 `large`
- 对于较长的视频，可以考虑先提取音频，然后分段转录
- 使用 VP9 转换为 WebM 所需时间更长，但生成的文件更小

## 示例

### 示例 1：将视频快速转换为 MP4

用户请求：
```
我有一个旧相机拍摄的 AVI 文件。可以帮我把它转换成 MP4 吗？
```

你需要：
1. 使用采用默认设置的 to-mp4 命令：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py to-mp4 old_video.avi output.mp4
   ```
2. 确认转换已成功完成
3. 告知用户输出文件的位置

### 示例 2：提取音频并转录

用户请求：
```
我录制了一段讲座视频，需要一份文字稿。可以帮我提取音频并进行转录吗？
```

你需要：
1. 首先提取音频：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py extract-audio lecture.mp4 lecture.wav
   ```
2. 然后使用 base 模型进行转录（在速度和准确率之间取得良好平衡）：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe lecture.mp4 transcript.txt --model base
   ```
3. 将 transcript.txt 文件分享给用户

### 示例 3：创建带字幕且针对 Web 优化的视频

用户请求：
```
我需要将这个视频放到网站上，并配上字幕。可以帮忙吗？
```

你需要：
1. 转换为 WebM 以针对 Web 进行优化：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py to-webm presentation.mp4 presentation.webm
   ```
2. 生成 SRT 字幕文件：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe presentation.mp4 subtitles.srt --format srt --model small
   ```
3. 告知用户他们现在拥有：
   - presentation.webm（针对 Web 优化的视频）
   - subtitles.srt（用于嵌入的字幕文件）

### 示例 4：指定语言的高质量转录

用户请求：
```
我有一段西班牙语采访视频，需要一份准确的文字稿用于发布。
```

你需要：
1. 使用更大的模型并指定语言，以获得最佳准确率：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe interview.mp4 transcript.txt --model medium --language es
   ```
2. 可以选择创建 SRT 文件以供审核：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe interview.mp4 transcript.srt --format srt --model medium --language es
   ```
3. 与用户一起审核文字稿，并进行任何必要的修正

### 示例 5：批量处理多个视频

用户请求：
```
我有一个存放培训视频的文件夹，其中所有视频都需要转换为 WebM 并进行转录。
```

你需要：
1. 列出目录中的所有视频文件：
   ```bash
   ls training_videos/*.mp4
   ```
2. 对每个视频文件运行转换和转录：
   ```bash
   # For each video: video1.mp4, video2.mp4, etc.
   uv run .claude/skills/video-processor/scripts/video_processor.py to-webm training_videos/video1.mp4 output/video1.webm
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe training_videos/video1.mp4 output/video1.txt --model base

   # Repeat for each file
   ```
3. 确认所有转换和转录均已完成
4. 提供输出文件摘要

## 总结

video-processor 技能为常见的视频处理任务提供了统一接口：
- **音频提取**：提取多种格式的音轨
- **格式转换**：转换为 MP4（通用格式）或 WebM（针对 Web 优化）
- **转录**：将语音转换为文本，支持多种输出格式
- **灵活配置**：可通过 CLI 参数选择模型、语言和输出格式

所有操作均通过一个文档完善的脚本处理，并提供合理的默认设置和全面的错误处理机制。