---
name: ffmpeg
description: Video and audio processing with FFmpeg. Use for format conversion, resizing, compression, audio extraction, and preparing assets for Remotion. Triggers include converting GIF to MP4, resizing video, extracting audio, compressing files, or any media transformation task.
---
# 用于视频制作的 FFmpeg

FFmpeg 是视频/音频处理的必备工具。本技能涵盖 Remotion 视频项目中的常见操作。

## 快速参考

### GIF 转 MP4（兼容 Remotion）

```bash
ffmpeg -i input.gif -movflags faststart -pix_fmt yuv420p \
  -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" output.mp4
```

**使用这些参数的原因：**
- `-movflags faststart` - 将元数据移至文件开头，以支持 Web 流式传输
- `-pix_fmt yuv420p` - 确保与大多数播放器兼容
- `scale=trunc(...)` - 强制使用偶数尺寸（大多数编解码器都要求如此）

### 调整视频尺寸

```bash
# To 1920x1080 (maintain aspect ratio, add black bars)
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2" output.mp4

# To 1920x1080 (crop to fill)
ffmpeg -i input.mp4 -vf "scale=1920:1080:force_original_aspect_ratio=increase,crop=1920:1080" output.mp4

# Scale to width, auto height
ffmpeg -i input.mp4 -vf "scale=1280:-2" output.mp4
```

### 压缩视频

```bash
# Good quality, smaller file (CRF 23 is default, lower = better quality)
ffmpeg -i input.mp4 -c:v libx264 -crf 23 -preset medium -c:a aac -b:a 128k output.mp4

# Aggressive compression for web preview
ffmpeg -i input.mp4 -c:v libx264 -crf 28 -preset fast -c:a aac -b:a 96k output.mp4

# Target file size (e.g., ~10MB for 60s video = ~1.3Mbps)
ffmpeg -i input.mp4 -c:v libx264 -b:v 1300k -c:a aac -b:a 128k output.mp4
```

### 提取音频

```bash
# Extract to MP3
ffmpeg -i input.mp4 -vn -acodec libmp3lame -q:a 2 output.mp3

# Extract to AAC
ffmpeg -i input.mp4 -vn -acodec aac -b:a 192k output.m4a

# Extract to WAV (uncompressed)
ffmpeg -i input.mp4 -vn output.wav
```

### 转换音频格式

```bash
# M4A to MP3 (for ElevenLabs voice samples)
ffmpeg -i input.m4a -codec:a libmp3lame -qscale:a 2 output.mp3

# WAV to MP3
ffmpeg -i input.wav -codec:a libmp3lame -b:a 192k output.mp3

# Adjust volume
ffmpeg -i input.mp3 -filter:a "volume=1.5" output.mp3
```

### 修剪/剪切视频

```bash
# Cut from timestamp to duration (recommended - reliable)
ffmpeg -i input.mp4 -ss 00:00:30 -t 00:00:15 -c:v libx264 -c:a aac output.mp4

# Cut from timestamp to timestamp
ffmpeg -i input.mp4 -ss 00:00:30 -to 00:00:45 -c:v libx264 -c:a aac output.mp4

# Stream copy (faster but may lose frames at cut points)
# Only use when source has frequent keyframes
ffmpeg -i input.mp4 -ss 00:00:30 -t 00:00:15 -c copy output.mp4
```

**注意：** 建议在修剪时重新编码。如果定位点未与关键帧对齐，流复制（`-c copy`）可能会在没有任何提示的情况下丢失视频内容。

### 加速/减速

```bash
# 2x speed (video and audio)
ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]" -map "[v]" -map "[a]" output.mp4

# 0.5x speed (slow motion)
ffmpeg -i input.mp4 -filter_complex "[0:v]setpts=2.0*PTS[v];[0:a]atempo=0.5[a]" -map "[v]" -map "[a]" output.mp4

# Video only (no audio)
ffmpeg -i input.mp4 -filter:v "setpts=0.5*PTS" -an output.mp4
```

### 拼接视频

```bash
# Create file list
echo "file 'clip1.mp4'" > list.txt
echo "file 'clip2.mp4'" >> list.txt
echo "file 'clip3.mp4'" >> list.txt

# Concatenate (same codec/resolution)
ffmpeg -f concat -safe 0 -i list.txt -c copy output.mp4

# Concatenate with re-encoding (different sources)
ffmpeg -f concat -safe 0 -i list.txt -c:v libx264 -c:a aac output.mp4
```

### 添加淡入/淡出

```bash
# Fade in first 1 second, fade out last 1 second (30fps video)
ffmpeg -i input.mp4 -vf "fade=t=in:st=0:d=1,fade=t=out:st=9:d=1" -c:a copy output.mp4

# Audio fade
ffmpeg -i input.mp4 -af "afade=t=in:st=0:d=1,afade=t=out:st=9:d=1" -c:v copy output.mp4
```

### 获取视频信息

```bash
# Duration, resolution, codec info
ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 input.mp4

# Full info
ffprobe -v quiet -print_format json -show_format -show_streams input.mp4
```

## Remotion 专用模式

### 为 Remotion 调整视频速度

**何时使用 FFmpeg，何时使用 Remotion `playbackRate`：**

| 场景 | 使用 FFmpeg | 使用 Remotion |
|----------|------------|--------------|
| 恒定速度（1.5 倍、2 倍） | 两者均可 | ✅ 更简单 |
| 极端速度（>4 倍或 <0.25 倍） | ✅ 更可靠 | 可能会出现问题 |
| 变速（随时间加速） | ✅ 预处理 | 需要复杂的变通方案 |
| 需要完美的音画同步 | ✅ 有保证 | 通常没问题 |
| 演示需要匹配旁白时长 | ✅ 预先计算 | 运行时调整 |

**Remotion 限制：**`playbackRate` 必须是常量。像 `playbackRate={interpolate(frame, [0, 100], [1, 5])}` 这样的动态插值无法正常工作，因为 Remotion 会独立计算每一帧。

```bash
# Speed up demo to fit a scene (e.g., 60s demo into 20s = 3x speed)
ffmpeg -i demo-raw.mp4 \
  -filter_complex "[0:v]setpts=0.333*PTS[v];[0:a]atempo=3.0[a]" \
  -map "[v]" -map "[a]" \
  public/demos/demo-fast.mp4

# Slow motion for emphasis (0.5x speed)
ffmpeg -i action.mp4 \
  -filter_complex "[0:v]setpts=2.0*PTS[v];[0:a]atempo=0.5[a]" \
  -map "[v]" -map "[a]" \
  public/demos/action-slow.mp4

# Speed up without audio (common for screen recordings)
ffmpeg -i demo.mp4 -filter:v "setpts=0.5*PTS" -an public/demos/demo-2x.mp4

# Timelapse effect (10x speed, drop audio)
ffmpeg -i long-demo.mp4 -filter:v "setpts=0.1*PTS" -an public/demos/timelapse.mp4
```

**计算速度系数：**
- 要将 X 秒的视频压缩到 Y 秒的场景中：`speed = X / Y`
- setpts 乘数 = `1 / speed`（例如，3 倍速 = setpts=0.333*PTS）
- atempo 值 = `speed`（例如，3 倍速 = atempo=3.0）

**极端速度（音频 >2 倍速）：**串联 atempo 滤镜（每个滤镜的范围限制为 0.5-2.0）：
```bash
# 4x speed audio
-filter_complex "[0:a]atempo=2.0,atempo=2.0[a]"

# 8x speed audio
-filter_complex "[0:a]atempo=2.0,atempo=2.0,atempo=2.0[a]"
```

### 为 Remotion 准备演示录制视频

```bash
# Standard 1080p, 30fps, Remotion-ready
ffmpeg -i raw-recording.mp4 \
  -vf "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,fps=30" \
  -c:v libx264 -crf 18 -preset slow \
  -c:a aac -b:a 192k \
  -movflags faststart \
  public/demos/demo.mp4
```

### 将屏幕录制转换为 Remotion 素材

```bash
# From iPhone/iPad recording (usually 60fps, variable resolution)
ffmpeg -i iphone-recording.mov \
  -vf "scale=1920:-2,fps=30" \
  -c:v libx264 -crf 20 \
  -an \
  public/demos/mobile-demo.mp4
```

### 批量转换 GIF

```bash
for f in assets/*.gif; do
  ffmpeg -i "$f" -movflags faststart -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" \
    "public/demos/$(basename "$f" .gif).mp4"
done
```

## 常见问题

### “高度不能被 2 整除”
添加缩放滤镜：`-vf "scale=trunc(iw/2)*2:trunc(ih/2)*2"`

### 视频无法在浏览器中播放
使用：`-movflags faststart -pix_fmt yuv420p -c:v libx264`

### 更改速度后音频不同步
使用带有 atempo 的 filter_complex：`-filter_complex "[0:v]setpts=0.5*PTS[v];[0:a]atempo=2.0[a]"`

### 文件过大
提高 CRF（23→28）或降低分辨率

## 质量指南

| 使用场景 | CRF | 预设 | 说明 |
|----------|-----|--------|-------|
| 归档/母版 | 18 | slow | 最佳质量，文件较大 |
| 生产环境 | 20-22 | medium | 良好平衡 |
| Web/预览 | 23-25 | fast | 文件较小 |
| 草稿/快速 | 28+ | veryfast | 编码速度快 |

## 针对不同平台的输出优化

Remotion 渲染视频后（通常输出到 `out/video.mp4`），使用 FFmpeg 针对每个分发平台进行优化。

### 工作流集成

```
Remotion render (master)     FFmpeg optimization      Platform upload
       ↓                            ↓                       ↓
   out/video.mp4  ────────→  out/video-youtube.mp4  ───→  YouTube
                  ────────→  out/video-twitter.mp4  ───→  Twitter/X
                  ────────→  out/video-linkedin.mp4 ───→  LinkedIn
                  ────────→  out/video-web.mp4      ───→  Website embed
```

### YouTube（推荐设置）

YouTube 会对所有内容重新编码，因此请上传高质量视频：

```bash
# YouTube optimized (1080p)
ffmpeg -i out/video.mp4 \
  -c:v libx264 -preset slow -crf 18 \
  -profile:v high -level 4.0 \
  -bf 2 -g 30 \
  -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart \
  out/video-youtube.mp4

# YouTube Shorts (vertical 1080x1920)
ffmpeg -i out/video.mp4 \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2" \
  -c:v libx264 -crf 18 -c:a aac -b:a 192k \
  out/video-shorts.mp4
```

### Twitter/X

Twitter 有严格限制：最长 140 秒、最大 512MB、最高 1920x1200：

```bash
# Twitter optimized (under 15MB target for fast upload)
ffmpeg -i out/video.mp4 \
  -c:v libx264 -preset medium -crf 24 \
  -profile:v main -level 3.1 \
  -vf "scale='min(1280,iw)':'min(720,ih)':force_original_aspect_ratio=decrease" \
  -c:a aac -b:a 128k -ar 44100 \
  -movflags +faststart \
  -fs 15M \
  out/video-twitter.mp4

# Check file size and duration
ffprobe -v error -show_entries format=duration,size -of csv=p=0 out/video-twitter.mp4
```

### LinkedIn

LinkedIn 偏好带有 AAC 音频的 MP4，最长 10 分钟：

```bash
# LinkedIn optimized
ffmpeg -i out/video.mp4 \
  -c:v libx264 -preset medium -crf 22 \
  -profile:v main \
  -vf "scale='min(1920,iw)':'min(1080,ih)':force_original_aspect_ratio=decrease" \
  -c:a aac -b:a 192k -ar 48000 \
  -movflags +faststart \
  out/video-linkedin.mp4
```

### 网站/嵌入（针对快速加载优化）

```bash
# Web-optimized MP4 (small file, progressive loading)
ffmpeg -i out/video.mp4 \
  -c:v libx264 -preset medium -crf 26 \
  -profile:v baseline -level 3.0 \
  -vf "scale=1280:720" \
  -c:a aac -b:a 128k \
  -movflags +faststart \
  out/video-web.mp4

# WebM alternative (better compression, wider browser support)
ffmpeg -i out/video.mp4 \
  -c:v libvpx-vp9 -crf 30 -b:v 0 \
  -vf "scale=1280:720" \
  -c:a libopus -b:a 128k \
  -deadline good \
  out/video-web.webm
```

### GIF（用于预览/缩略图）

```bash
# High-quality GIF (first 5 seconds)
ffmpeg -i out/video.mp4 -t 5 \
  -vf "fps=15,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  out/preview.gif

# Smaller file GIF
ffmpeg -i out/video.mp4 -t 3 \
  -vf "fps=10,scale=320:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" \
  out/preview-small.gif
```

### 平台要求快速参考

| 平台 | 最大分辨率 | 最大文件大小 | 最长时长 | 音频 |
|----------|---------------|----------|--------------|-------|
| YouTube | 8K | 256GB | 12 小时 | AAC 48kHz |
| Twitter/X | 1920x1200 | 512MB | 140 秒 | AAC 44.1kHz |
| LinkedIn | 4096x2304 | 5GB | 10 分钟 | AAC 48kHz |
| Instagram 动态 | 1080x1350 | 4GB | 60 秒 | AAC 48kHz |
| Instagram Reels | 1080x1920 | 4GB | 90 秒 | AAC 48kHz |
| TikTok | 1080x1920 | 287MB | 10 分钟 | AAC |

### 为所有平台批量导出

```bash
#!/bin/bash
# save as: export-all-platforms.sh
INPUT="out/video.mp4"

# YouTube (high quality)
ffmpeg -i "$INPUT" -c:v libx264 -preset slow -crf 18 \
  -c:a aac -b:a 192k -movflags +faststart \
  out/video-youtube.mp4

# Twitter (compressed)
ffmpeg -i "$INPUT" -c:v libx264 -crf 24 \
  -vf "scale='min(1280,iw)':'-2'" \
  -c:a aac -b:a 128k -movflags +faststart \
  out/video-twitter.mp4

# LinkedIn
ffmpeg -i "$INPUT" -c:v libx264 -crf 22 \
  -c:a aac -b:a 192k -movflags +faststart \
  out/video-linkedin.mp4

# Web embed (small)
ffmpeg -i "$INPUT" -c:v libx264 -crf 26 \
  -vf "scale=1280:720" \
  -c:a aac -b:a 128k -movflags +faststart \
  out/video-web.mp4

echo "Exported:"
ls -lh out/video-*.mp4
```

## 错误处理

处理视频时的常见错误及修复方法：

```bash
# Check if FFmpeg succeeded
ffmpeg -i input.mp4 -c:v libx264 output.mp4 && echo "Success" || echo "Failed: check input file"

# Validate output file is playable
ffprobe -v error -select_streams v:0 -show_entries stream=codec_name -of csv=p=0 output.mp4

# Get detailed error info
ffmpeg -v error -i input.mp4 -f null - 2>&1 | head -20
```

### 处理常见故障

| 错误 | 原因 | 修复方法 |
|-------|-------|-----|
| "No such file" | 输入路径错误 | 检查路径，路径包含空格时使用引号 |
| "Invalid data" | 输入文件损坏 | 重新下载或重新录制源文件 |
| "height not divisible by 2" | 尺寸为奇数 | 添加带截断的缩放滤镜 |
| "encoder not found" | 缺少编解码器 | 安装包含完整编解码器的 FFmpeg |
| 输出文件为 0 字节 | 静默失败 | 检查完整的 ffmpeg 输出以查找错误 |

---

## 反馈与贡献

如果此技能缺少信息或可以改进：

- **缺少某个命令？** 描述你的需求
- **发现错误？** 告诉我哪里有问题
- **想要贡献？** 我可以帮助你：
  1. 更新此技能并进行改进
  2. 向 github.com/digitalsamba/claude-code-video-toolkit 创建 PR

只需说“改进此技能”，我就会指导你更新 `.claude/skills/ffmpeg/SKILL.md`。