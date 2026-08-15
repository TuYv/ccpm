# 短视频剪辑流水线 — Skill

## 前置操作（Skill 启动时运行）

```bash
# Version check (silent if up to date)
python3 telemetry/version_check.py 2>/dev/null || true

# Telemetry opt-in (first run only, then remembers your choice)
python3 telemetry/telemetry_init.py 2>/dev/null || true
```

> **隐私：** 此 Skill 会将使用情况记录在本地的 `~/.ai-marketing-skills/analytics/` 中。远程遥测仅在选择加入后启用。绝不会收集代码、文件路径或仓库内容。请参阅 `telemetry/README.md`。

---

从 YouTube 长视频中提取具有病毒式传播潜力的短视频片段（TikTok、Reels、Shorts）。涵盖下载、转录、AI 分段、剪切、竖屏裁剪和字幕烧录。

## 前置条件

- 已安装 `yt-dlp` 和 `ffmpeg`
- 已设置 `ANTHROPIC_API_KEY` 环境变量
- 已安装 `requirements.txt` 中的 Python 依赖项
- 可选：安装 `mediapipe` 和 `opencv-python` 以实现基于人脸检测的智能裁剪

## 快速开始

### 单个视频 → 多个片段

```bash
python3 scripts/shortform_pipeline.py \
  --url "https://www.youtube.com/watch?v=VIDEO_ID" \
  --max-clips 3 \
  --output-dir ./output
```

### 独立剪辑工具（不使用 Claude，采用启发式评分）

```bash
python3 scripts/video_clipper.py --url "https://www.youtube.com/watch?v=VIDEO_ID"
```

## 流水线概览

1. **下载** — yt-dlp 获取视频和自动生成的 VTT 字幕
2. **转录** — Whisper 生成单词级时间戳（失败时回退使用 YouTube 字幕）
3. **分段** — Claude 识别 2–5 个最佳的 30–60 秒片段，开场吸引力评分 ≥7/10
4. **剪切验证** — 由 Claude 进行第二轮检查，确认每个片段都以完整表达结束
5. **剪切** — FFmpeg 从源视频中提取每个片段
6. **竖屏裁剪** — 根据布局将 16:9 转换为 9:16，并支持人脸检测
7. **字幕烧录** — 烧录 TikTok 风格的逐词高亮字幕（ASS 格式）

## 关键文件

| 文件 | 用途 |
|------|---------|
| `scripts/shortform_pipeline.py` | 完整流水线：下载 → 分段 → 剪切 → 裁剪 → 添加字幕 |
| `scripts/video_clipper.py` | 使用启发式评分的独立剪辑工具（无需 Claude） |
| `scripts/clip_sender.py` | 用于片段交付和审核工作流的辅助工具 |

## 布局感知裁剪

流水线会以不同方式处理四种视频布局：

- **`talking_head`** — 使用 MediaPipe 进行基于人脸检测的居中裁剪；失败时回退使用音频声像定位
- **`screen_share_overlay`** — 将屏幕内容置于上方，摄像头画面气泡置于下方
- **`side_by_side`** — 将屏幕画面置于上方，演讲者面部画面置于下方
- **`gallery_view`** — 裁剪至当前发言者所在的象限

Claude 会在分段过程中为每个片段输出一个 `layout_hint`。

## 自定义

### 语音模式
编辑 `video_clipper.py` 中的 `VOICE_PATTERNS`，使其匹配创作者的说话模式。这些模式可以提高听起来真实自然的片段的评分。

### 分段提示词
可以自定义 `shortform_pipeline.py` 中的 Claude 提示词：
- 调整 `hook_strength` 的最低值（默认：7/10）
- 更改目标时长范围（默认：30–60 秒）
- 修改布局提示选项

### 裁剪调优
在 `video_clipper.py` 中：
- `scale_factor` — 单人脸画面的缩放级别（默认值：1.08）
- `desired_face_y` — 人脸在画面中的目标位置（默认值：上方 35%）

## 输出

每个剪辑的输出规格如下：
- **1080×1920** 分辨率（9:16 竖屏）
- **H.264 + AAC** 编码
- 烧录带有**逐词高亮的字幕**
- 可直接上传到 TikTok、Reels 或 Shorts

## 故障排除

- **FFmpeg filter_complex 错误：** 不要将 `-c:v copy` 与 `-filter_complex` 一起使用。只有 `-c:a copy` 是安全的。
- **输出分辨率错误：** 始终先裁剪再缩放。使用 `ffprobe -show_entries stream=width,height` 进行验证。
- **字幕同步问题：** 应对剪辑后的片段运行 Whisper，而不是对源节目运行。
- **TikTok 上传失败：** 确保使用 H.264 + AAC 编码。如有需要，请添加 `-c:v libx264 -c:a aac`。
- **剪辑过长：** Claude 有时会超出时长。流水线会自动将超过 90 秒的剪辑裁剪至 75 秒。