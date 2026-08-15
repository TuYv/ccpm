---
name: Video Processor
description: Process video files with audio extraction, format conversion (mp4, webm), and Whisper transcription. Use when user mentions video conversion, audio extraction, transcription, mp4, webm, ffmpeg, or whisper transcription.
---
# 视频处理器

## 说明

此技能提供视频处理实用工具，包括使用 FFmpeg 和 OpenAI 的 Whisper 模型进行音频提取、格式转换和音频转录。

### 前置条件

**必需工具**（必须安装在你的环境中）：
- **FFmpeg**：用于视频/音频处理的多媒体框架
  ```bash
  # macOS
  brew install ffmpeg

  # Ubuntu/Debian
  apt-get install ffmpeg

  # Verify installation
  ffmpeg -version
  ```

- **OpenAI Whisper**：语音转文本模型
  ```bash
  # Install via pip
  pip install -U openai-whisper

  # Verify installation
  whisper --help
  ```

**Python 软件包**（通过 PEP 723 包含在脚本中）：
- click（CLI 框架）
- ffmpeg-python（FFmpeg 的 Python 封装）

### 工作流程

所有视频处理任务都使用 `scripts/video_processor.py` 脚本。该脚本提供了一个简单的 CLI，其中包含以下命令：

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
- `--codec`：视频编解码器（默认：libvpx-vp9）。选项：libvpx、libvpx-vp9
- WebM 针对 Web 播放和流式传输进行了优化

#### 4. **使用 Whisper 转录音频**

使用 OpenAI 的 Whisper 模型将音频或视频文件转录为文本：

```bash
# Transcribe video file (audio will be extracted automatically)
uv run .claude/skills/video-processor/scripts/video_processor.py transcribe input.mp4 transcript.txt

# Transcribe audio file directly
uv run .claude/skills/video-processor/scripts/video_processor.py transcribe audio.wav transcript.txt
```

选项：
- `--model`：Whisper 模型大小（默认：base）。选项：
  - `tiny`：速度最快，准确率最低（约需 1GB RAM）
  - `base`：速度快，准确率良好（约需 1GB RAM）**[默认]**
  - `small`：较为均衡（约需 2GB RAM）
  - `medium`：准确率高（约需 5GB RAM）
  - `large`：准确率最高，速度最慢（约需 10GB RAM）
- `--language`：语言代码（默认：自动检测）。示例：en、es、fr、de、zh
- `--format`：输出格式（默认：txt）。选项：txt、srt、vtt、json

**转录工作流程：**
1. 如果输入是视频，FFmpeg 会将音频提取到临时 WAV 文件中
2. Whisper 处理该音频文件
3. 转录内容以请求的格式保存
4. 临时文件会自动清理

#### 5. **组合工作流示例**

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
- FFmpeg 本身不转录音频——它负责为外部转录准备音频
- 工作流为：提取音频（FFmpeg）→ 转录（Whisper）→ 可选：重新与视频整合
- FFmpeg 可以将音频直接通过管道传输到 Whisper 进行实时处理（高级用例）

**用于转录的音频格式：**
- Whisper 使用 WAV 或 MP3 格式时效果最佳
- 采样率：16kHz 为最佳设置（脚本会自动处理转换）
- 该脚本会使用适合 Whisper 的最佳设置提取音频

**输出格式：**
- **txt**：纯文本转录稿
- **srt**：SubRip 字幕格式（包含时间戳）
- **vtt**：WebVTT 字幕格式（Web 标准）
- **json**：包含词级时间戳的详细 JSON

### 错误处理

该脚本包含全面的错误处理：
- 验证输入文件是否存在
- 检查是否已安装 FFmpeg 和 Whisper
- 在缺少依赖项时提供清晰的错误消息
- 出错时处理临时文件清理

### 性能提示

- 使用 `tiny` 或 `base` 模型快速生成初稿
- 使用 `small` 或 `medium` 进行生产环境转录
- 仅在需要最高准确率时使用 `large`
- 对于较长的视频，可以考虑先提取音频，然后分段转录
- 使用 VP9 转换为 WebM 所需时间更长，但生成的文件更小

## 示例

### 示例 1：快速将视频转换为 MP4

用户请求：
```
I have an AVI file from my old camera. Can you convert it to MP4?
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
I recorded a lecture video and need a transcript. Can you extract the audio and transcribe it?
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
3. 将 transcript.txt 文件提供给用户

### 示例 3：创建带字幕且针对 Web 优化的视频

用户请求：
```
I need to put this video on my website with subtitles. Can you help?
```

你需要：
1. 转换为 WebM 以便进行 Web 优化：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py to-webm presentation.mp4 presentation.webm
   ```
2. 生成 SRT 字幕文件：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe presentation.mp4 subtitles.srt --format srt --model small
   ```
3. 告知用户他们现在已有：
   - presentation.webm（针对 Web 优化的视频）
   - subtitles.srt（用于嵌入的字幕文件）

### 示例 4：指定语言的高质量转录

用户请求：
```
I have a Spanish interview video that needs an accurate transcript for publication.
```

你需要：
1. 使用更大的模型并指定语言，以获得最佳准确度：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe interview.mp4 transcript.txt --model medium --language es
   ```
2. 可以选择创建 SRT 文件以供审阅：
   ```bash
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe interview.mp4 transcript.srt --format srt --model medium --language es
   ```
3. 与用户一起审阅转录文本，并进行任何必要的修正

### 示例 5：批量处理多个视频

用户请求：
```
I have a folder of training videos that all need to be converted to WebM and transcribed.
```

你需要：
1. 列出目录中的所有视频文件：
   ```bash
   ls training_videos/*.mp4
   ```
2. 对每个视频文件执行转换和转录：
   ```bash
   # For each video: video1.mp4, video2.mp4, etc.
   uv run .claude/skills/video-processor/scripts/video_processor.py to-webm training_videos/video1.mp4 output/video1.webm
   uv run .claude/skills/video-processor/scripts/video_processor.py transcribe training_videos/video1.mp4 output/video1.txt --model base

   # Repeat for each file
   ```
3. 确认所有转换和转录均已完成
4. 提供输出文件的摘要

## 总结

video-processor 技能为常见的视频处理任务提供了统一接口：
- **音频提取**：提取各种格式的音轨
- **格式转换**：转换为 MP4（通用格式）或 WebM（针对 Web 优化）
- **转录**：语音转文本，支持多种输出格式
- **灵活**：通过 CLI 参数选择模型、语言和输出格式

所有操作均通过一个文档完善的脚本完成，该脚本提供合理的默认设置和全面的错误处理。