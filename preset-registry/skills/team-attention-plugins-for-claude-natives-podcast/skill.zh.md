---
name: podcast
description: "Generate Korean podcast episodes from any source (URLs, tweets, articles, PDFs) — analyzes content, writes a script, generates audio via OpenAI TTS, converts to MP4, and auto-uploads to YouTube. Use this skill whenever the user says 'make a podcast', 'convert to podcast', 'podcast', 'create an episode', 'turn this into audio', 'YouTube podcast', 'turn this article into a podcast', 'publish as audio', or provides sources and wants them transformed into a listenable format. Supports partial execution: script-only, TTS-only, or upload-only."
---
# 播客生成器

分析来源，生成韩语播客脚本，通过 OpenAI TTS 生成音频，并自动上传至 YouTube。

## 流水线

```
[Source Collection] → [Analysis/Fusion] → [Script Writing] → [TTS Generation] → [MP4 Conversion] → [YouTube Upload]
```

## 第 1 步：来源收集与分析

收集并分析用户提供的来源。按类型分别处理：

- **URL/文章**：使用 WebFetch 或子代理获取全文
- **推文/X 帖子**：使用 WebFetch 配合 `api.fxtwitter.com`（将 X/Twitter URL 中的域名替换为该域名）
- **PDF**：直接使用 Read 工具
- **GitHub 仓库**：克隆并分析其结构（使用子代理）
- **对话上下文**：复用当前会话中已分析过的内容

当提供 2 个及以上来源时，务必为每个来源**并行启动子代理**。

## 第 2 步：脚本撰写

### 结构（8-12 分钟，3000-5000 字符）

```markdown
# [Episode Title]

> [Duration] podcast script | [Date]
> Sources: [source list]

---

## Opening (1 min)
- Hook: one sentence on why this topic matters
- Introduce sources
- Lead with conclusion (state core message upfront)

## Body Part 1 (3 min)
- Deep analysis of first source/perspective

## Body Part 2 (3 min)
- Deep analysis of second source/perspective

## Fusion/Intersection (3 min)
- Emergent insights from combining sources
- Patterns, commonalities, contrasts
- Generalizable implications

## Closing (30 sec)
- One-sentence summary of core message
- Sign-off
```

### 脚本撰写原则

- **按口语方式书写**：使用口语化的韩语（"~입니다"、"~거죠"、"~인데요"）
- **数字用韩语表述**："267K" → "이십육만"，"$75,000" → "칠만오천 달러"
- **英文人名按韩语发音**："Garry Tan" → "개리 탄"
- **不使用表格或代码块**：TTS 无法读取。需将表格内容转换为句子
- **引用时转换语气**："개리 탄 본인이 이렇게 말합니다."，以制造区分感
- **句子要短**：每句话保持在 50 个字符以内

### 文件布局

```
<output-dir>/
├── script.md       ← Script
├── episode.mp3     ← Audio
├── episode.mp4     ← Video (for YouTube)
└── metadata.json   ← Title, description, tags, YouTube URL
```

输出目录可以是用户指定的任意路径。一个合理的默认值是相对于当前工作目录的 `podcast/YYYY-MM-DD-[slug]/`。

## 第 3 步：TTS 生成

使用 `scripts/generate_tts.py` 将脚本转换为音频：

```bash
python3 <plugin-path>/skills/podcast/scripts/generate_tts.py \
  --input <script.md path> \
  --output <episode.mp3 path> \
  --api-key <OpenAI API key>
```

将 `<plugin-path>` 替换为该插件实际安装的路径（若 `${CLAUDE_PLUGIN_ROOT}` 可用则使用它，否则使用解析出的插件安装路径）。

### OpenAI API 密钥

首先检查 `OPENAI_API_KEY` 环境变量。如果未设置，则询问用户。

### TTS 设置

| 设置 | 值 | 说明 |
|---------|-------|------|
| 模型 | `gpt-4o-mini-tts` | 支持 instructions 的最新模型 |
| 音色 | `marin` | 最适合韩语；`cedar` 可作为备选 |
| 分块大小 | 1500 字符 | 2000 token 上限，韩语约 1.5 字符/token |
| Instructions | 按脚本自动生成 | 默认值见下文 |

默认的 TTS instructions：
> "따뜻하고 친근한 한국어 팟캐스트 호스트. 명확한 발음으로 또박또박 읽되, 자연스러운 억양과 적절한 감정을 담아서. 중요한 포인트에서는 약간 힘을 주고, 인용구에서는 톤을 살짝 바꿔서 구분감을 준다. 전체적으로 지적이면서도 편안한 분위기."

如果用户指定了语气，可通过 `--instructions` 进行自定义。

## 第 4 步：MP4 转换

将 MP3 转换为带有静态标题卡的 MP4：

```bash
python3 <plugin-path>/skills/podcast/scripts/convert_mp4.py \
  --input <episode.mp3 path> \
  --output <episode.mp4 path> \
  --title "Episode Title" \
  --subtitle "Subtitle"
```

生成一个 1920x1080 的视频，带有深色背景（#1a1a2e）和韩语标题/副标题叠加层。

## 第 5 步：上传至 YouTube

```bash
python3 <plugin-path>/skills/podcast/scripts/upload_youtube.py \
  --video <episode.mp4 path> \
  --title "Episode Title" \
  --description "Description" \
  --privacy unlisted
```

### OAuth 配置

- Google OAuth 客户端密钥：自动发现 `~/Downloads/client_secret_*.json` 或 `~/.config/google/client_secret_*.json`
- 令牌：默认存储在视频文件旁边（可通过 `--token-path` 覆盖）
- 首次运行需要通过浏览器进行 Google 身份验证
- 如果有多个 YouTube 账号可用，请询问用户使用哪一个
- 切勿将脚本复制到单集目录中，始终从插件的原始路径运行

### 上传默认值

- 隐私设置：`unlisted`（除非用户另有指定）
- 分类：People & Blogs (22)
- 语言：ko

## 第 6 步：完成报告

上传完成后，向用户报告：

```
Done!
- Script: <path>/script.md
- Audio: <path>/episode.mp3
- Video: <path>/episode.mp4
- YouTube: https://youtu.be/VIDEO_ID (unlisted)
```

使用 `afplay` 播放 `episode.mp3`，让用户可以立即收听。

## 部分执行

用户可能只请求执行流水线的一部分：

- “只写脚本” → 仅执行第 1-2 步
- “根据这个脚本生成 TTS" → 仅执行第 3 步
- “上传到 YouTube" → 仅执行第 5 步（需要已有的 MP4）
- “设为公开" → 通过 API 更新 YouTube 隐私设置

## 依赖项

- **ffmpeg**：音频合并和 MP4 转换所需。在 macOS 上，可能需要 `homebrew-ffmpeg/ffmpeg` tap 以获得完整的编解码器支持
- **OpenAI API 密钥**：用于 TTS 生成（`OPENAI_API_KEY` 环境变量或由用户提供）
- **Google OAuth 客户端密钥**：用于 YouTube 上传（从 Google Cloud Console 下载）
- **macOS 字体**：使用 `/System/Library/Fonts/AppleSDGothicNeo.ttc` 进行韩语文字叠加。在其他平台上，请调整 `convert_mp4.py` 中的 `FONT_PATH`
- **Python 3.10+**：所有脚本仅使用标准库（无需 pip 安装）
