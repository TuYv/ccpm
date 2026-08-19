---
name: baoyu-youtube-transcript
description: Downloads YouTube video transcripts/subtitles and cover images by URL or video ID. Supports multiple languages, translation, chapters, and speaker identification. Caches raw data for fast re-formatting. Use when user asks to "get YouTube transcript", "download subtitles", "get captions", "YouTube字幕", "YouTube封面", "视频封面", "video thumbnail", "video cover image", or provides a YouTube URL and wants the transcript/subtitle text or cover image extracted.
version: 1.1.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-youtube-transcript
    requires:
      anyBins:
        - bun
        - npx
---
# YouTube 字幕文本

从 YouTube 视频下载字幕（字幕文本/隐藏式字幕）。同时支持人工创建和自动生成的字幕文本。无需 API 密钥或浏览器——直接使用 YouTube 的 InnerTube API，并在 YouTube 阻止直接 API 路径时自动回退到 `yt-dlp`。

首次运行时获取视频元数据和封面图片，并缓存原始数据以便快速重新格式化。

## 脚本目录

脚本位于 `scripts/` 子目录中。`{baseDir}` = 此 SKILL.md 的目录路径。解析 `${BUN_X}` 运行时：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。将 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| 脚本 | 用途 |
|--------|---------|
| `scripts/main.ts` | 字幕文本下载 CLI |

## 用法

```bash
# Default: markdown with timestamps (English)
${BUN_X} {baseDir}/scripts/main.ts <youtube-url-or-id>

# Specify languages (priority order)
${BUN_X} {baseDir}/scripts/main.ts <url> --languages zh,en,ja

# Without timestamps
${BUN_X} {baseDir}/scripts/main.ts <url> --no-timestamps

# With chapter segmentation
${BUN_X} {baseDir}/scripts/main.ts <url> --chapters

# With speaker identification (requires AI post-processing)
${BUN_X} {baseDir}/scripts/main.ts <url> --speakers

# SRT subtitle file
${BUN_X} {baseDir}/scripts/main.ts <url> --format srt

# Translate transcript
${BUN_X} {baseDir}/scripts/main.ts <url> --translate zh-Hans

# List available transcripts
${BUN_X} {baseDir}/scripts/main.ts <url> --list

# Force re-fetch (ignore cache)
${BUN_X} {baseDir}/scripts/main.ts <url> --refresh
```

## 选项

| 选项 | 描述 | 默认值 |
|--------|-------------|---------|
| `<url-or-id>` | YouTube URL 或视频 ID（允许多个） | 必填 |
| `--languages <codes>` | 语言代码，以逗号分隔，按优先级排序 | `en` |
| `--format <fmt>` | 输出格式：`text`、`srt` | `text` |
| `--translate <code>` | 翻译为指定的语言代码 | |
| `--list` | 列出可用字幕文本，而非获取字幕文本 | |
| `--timestamps` | 在每个段落中包含 `[HH:MM:SS → HH:MM:SS]` 时间戳 | 开启 |
| `--no-timestamps` | 禁用时间戳 | |
| `--chapters` | 根据视频描述进行章节分段 | |
| `--speakers` | 用于说话人识别的带元数据原始字幕文本 | |
| `--exclude-generated` | 跳过自动生成的字幕文本 | |
| `--exclude-manually-created` | 跳过人工创建的字幕文本 | |
| `--refresh` | 强制重新获取，忽略缓存数据 | |
| `-o, --output <path>` | 保存到指定文件路径 | 自动生成 |
| `--output-dir <dir>` | 基础输出目录 | `youtube-transcript` |

## 可选环境变量

| 变量 | 描述 |
|----------|-------------|
| `YOUTUBE_TRANSCRIPT_COOKIES_FROM_BROWSER` | 在回退期间传递给 `yt-dlp --cookies-from-browser`，例如 `chrome`、`safari`、`firefox` 或 `chrome:Profile 1` |

## 输入格式

接受以下任一种作为视频输入：
- 完整 URL：`https://www.youtube.com/watch?v=dQw4w9WgXcQ`
- 短 URL：`https://youtu.be/dQw4w9WgXcQ`
- 嵌入 URL：`https://www.youtube.com/embed/dQw4w9WgXcQ`
- Shorts URL：`https://www.youtube.com/shorts/dQw4w9WgXcQ`
- 视频 ID：`dQw4w9WgXcQ`

## 输出格式

| 格式 | 扩展名 | 描述 |
|--------|-----------|-------------|
| `text` | `.md` | 带 frontmatter（包括 `description`）、标题、摘要的 Markdown，可选目录/封面/时间戳/章节/说话人 |
| `srt` | `.srt` | 视频播放器使用的 SubRip 字幕格式 |

## 输出目录

```
youtube-transcript/
├── .index.json                          # Video ID → directory path mapping (for cache lookup)
└── {channel-slug}/{title-full-slug}/
    ├── meta.json                        # Video metadata (title, channel, description, duration, chapters, etc.)
    ├── transcript-raw.json              # Raw transcript snippets from YouTube API (cached)
    ├── transcript-sentences.json        # Sentence-segmented transcript (split by punctuation, merged across snippets)
    ├── imgs/
    │   └── cover.jpg                    # Video thumbnail
    ├── transcript.md                    # Markdown transcript (generated from sentences)
    └── transcript.srt                   # SRT subtitle (generated from raw snippets, if --format srt)
```

- `{channel-slug}`：采用 kebab-case 的频道名称
- `{title-full-slug}`：采用 kebab-case 的完整视频标题

`--list` 模式仅将输出写入 stdout（不会保存文件）。

## 缓存

首次获取时，脚本会保存：
- `meta.json` — 视频元数据、章节、封面图路径、语言信息
- `transcript-raw.json` — 来自 YouTube API 的原始转录片段（`{ text, start, duration }[]`）
- `transcript-sentences.json` — 按句子分段的转录文本（`{ text, start: "HH:mm:ss", end: "HH:mm:ss" }[]`），按句末标点（`.?!…。？！` 等）切分，依据字符长度按比例分配时间戳，并以 CJK-aware 方式合并文本
- `imgs/cover.jpg` — 视频缩略图

后续对同一视频的运行会使用缓存数据（不会进行网络调用）。使用 `--refresh` 可强制重新获取。如果请求的语言不同，缓存会自动刷新。

当 YouTube 在直接 InnerTube 路径上返回反机器人/被阻止的响应时，脚本会使用备用客户端身份重试；如果可用，随后回退到 `yt-dlp`。如果需要回退但 `yt-dlp` 不可用，代理应决定如何使 `yt-dlp` 可用并继续执行，而不是将安装决策交给用户。

SRT 输出（`--format srt`）根据 `transcript-raw.json` 生成。文本/Markdown 输出使用 `transcript-sentences.json`，以获得自然的句子边界。

## 工作流

当用户提供 YouTube URL 并请求转录文本时：

1. 如果用户未指定语言，先使用 `--list` 运行，以显示可用选项
2. **运行脚本时始终使用单引号包裹 URL** — zsh 会将 `?` 视为 glob 通配符，因此未加引号的 YouTube URL 会导致“no matches found”：使用 `'https://www.youtube.com/watch?v=ID'`
3. 默认使用 `--chapters --speakers` 运行，以获得最丰富的输出（章节 + 说话人识别）
3. 脚本会自动保存缓存数据和输出文件，并打印文件路径
4. 对于 `--speakers` 模式：脚本保存原始文件后，按照下面的说话人识别工作流进行后处理，并添加说话人标签

当用户只需要封面图片或元数据时，使用任意选项运行脚本也会缓存 `meta.json` 和 `imgs/cover.jpg`。

重新格式化同一个视频时（例如先生成文本，之后再生成 SRT），会复用缓存数据——无需重新获取。

## 章节与说话人工作流

### 章节（`--chapters`）

脚本会从视频描述中解析章节时间戳（例如 `0:00 Introduction`），按照章节边界分割转录内容，将片段组合成易读的段落，并以带目录的 `.md` 格式保存。无需进一步处理。

如果描述中不存在章节时间戳，则会将转录内容按分组段落输出，不添加章节标题。

### 说话人识别（`--speakers`）

说话人识别需要 AI 处理。脚本会输出一个原始 `.md` 文件，其中包含：
- 带有视频元数据的 YAML frontmatter（标题、频道、日期、封面、描述、语言）
- 视频描述（用于提取说话人姓名）
- 描述中的章节列表（如果有）
- SRT 格式的原始转录（预先计算起止时间戳，节省 token）

脚本保存原始文件后，启动一个子代理（使用 Sonnet 等更便宜的模型以提高成本效率）来处理说话人识别：

1. 读取已保存的 `.md` 文件
2. 读取 `{baseDir}/prompts/speaker-transcript.md` 中的提示模板
3. 按照提示处理原始转录：
   - 使用视频元数据识别说话人（标题 → 嘉宾，频道 → 主持人，描述 → 姓名）
   - 根据对话流程、问答模式和上下文线索检测说话人切换
   - 划分章节（如果有描述中的章节则使用，否则根据主题变化创建章节）
   - 使用 `**Speaker Name:**` 标签、段落分组（2-4 句话）以及 `[HH:MM:SS → HH:MM:SS]` 时间戳进行格式化
4. 使用处理后的转录覆盖 `.md` 文件（保留 YAML frontmatter）

使用 `--speakers` 时，会隐含启用 `--chapters` ——处理后的输出始终包含章节划分。

## 错误情况

| 错误 | 含义 |
|-------|---------|
| Transcripts disabled | 视频完全没有字幕 |
| No transcript found | 请求的语言不可用 |
| Video unavailable | 视频已删除、设为私有或受到地区限制 |
| IP blocked | 请求过多，请稍后重试 |
| Age restricted | 视频需要登录进行年龄验证 |
| bot detected | 脚本会重试备用客户端，然后使用 `yt-dlp`；如果缺少回退工具，代理应自行解决，否则如果仍然失败，请尝试 `YOUTUBE_TRANSCRIPT_COOKIES_FROM_BROWSER=safari`（或你的浏览器） |