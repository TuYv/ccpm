---
name: blog-audio
description: >
  Generate audio narration of blog posts using Google Gemini TTS.
  Supports summary narration, full article read-aloud, and two-speaker
  podcast/dialogue mode with 30 voice options. Outputs MP3 with HTML5
  audio embed code. Works standalone via /blog audio or internally from
  blog-write. Falls back gracefully when API key is not configured.
  Use when user says "blog audio", "narrate blog", "audio version",
  "text to speech", "tts", "podcast mode", "read aloud", "audio narration",
  "voice", "narration", "generate audio".
user-invokable: true
argument-hint: "[generate|voices|setup] [file-or-text] [--mode summary|full|dialogue] [--voice name]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.0"
---
# 博客音频：用于博客文章的 Gemini TTS 旁白

使用 Google 的 Gemini TTS 为博客内容生成专业的音频旁白。  
提供三种模式：摘要（200-300 字的口述概览）、全文朗读，或双人播客对话。支持 30 种声音、80+ 种语言，以及 HTML5 嵌入输出。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/blog audio generate <file>` | 生成博客文章的音频旁白 |
| `/blog audio voices` | 显示可用声音及其特征 |
| `/blog audio setup` | 检查/配置 Gemini TTS 的 API 密钥 |

## 前置条件

- Python 3.11+（由 `run.py` 自动管理 venv）
- `GOOGLE_AI_API_KEY` 环境变量（与 blog-image 使用的密钥相同）
- FFmpeg（用于 WAV-to-MP3 转换；如果缺少则回退到 WAV）

## 始终使用 run.py 包装器

```bash
# CORRECT:
python3 scripts/run.py generate_audio.py --text "..." --voice Charon --json

# WRONG:
python3 scripts/generate_audio.py --text "..."  # Fails without venv
```

## API 密钥检查（Gate 模式）

生成音频前，检查 API 密钥：

```bash
test -n "${GOOGLE_AI_API_KEY:-}" && echo "GOOGLE_AI_API_KEY is set" || echo "GOOGLE_AI_API_KEY is not set"
```

- 如果已设置：继续生成
- 如果未设置：引导用户：
  "Audio generation requires a Google AI API key. Get one free at https://aistudio.google.com/apikey
   Then set it: `export GOOGLE_AI_API_KEY=your-key`
   This can be the same key used by `/blog image`, but it must be exported in the shell."
- **在内部调用时**（来自 blog-write）：如果密钥缺失则静默返回。
  切勿阻塞写作工作流。

## 设置

对于 `/blog audio setup`：

1. 检查环境中是否设置了 `GOOGLE_AI_API_KEY`
2. 如果 blog-image 使用项目 `.mcp.json`，确认其中引用的环境变量已导出
3. 如果未设置，引导用户访问 https://aistudio.google.com/apikey
4. 使用 dry run 验证：`python3 scripts/run.py generate_audio.py --text "Test" --dry-run --json`

## 声音选择

对于 `/blog audio voices`：

加载 `references/voices.md` 并向用户展示声音目录。

询问用户偏好的声音，或根据内容类型进行推荐：
- **文章旁白**：Charon（信息丰富）或 Sadaltager（知识渊博）
- **教程/操作指南**：Achird（友好）或 Sulafat（温暖）
- **新闻/分析**：Rasalgethi（信息丰富）或 Schedar（平和）
- **生活方式/健康**：Aoede（轻快）或 Vindemiatrix（柔和）
- **对话主持人**：Puck（活泼）或 Laomedeia（活泼）
- **对话专家**：Kore（坚定）或 Charon（信息丰富）

## 生成工作流

对于 `/blog audio generate <file>`：

### 第 1 步：阅读博客文章

读取文件并提取：
- 标题（来自 H1 或 frontmatter）
- 完整内容（Markdown 正文）
- 大致字数

### 第 2 步：选择模式

询问用户（或在用户指定 `--mode` 时自动选择）：

| 模式 | 适用场景 | 输出 |
|------|-------------|--------|
| **摘要** | 快速音频概览（1-2 分钟） | 200-300 字的口述摘要 |
| **全文** | 完整朗读（5-15 分钟） | 以自然语音朗读全文 |
| **对话** | 播客风格（3-8 分钟） | 围绕文章内容展开的双人对话 |

### 第 3 步：准备文本

Claude 负责准备文本；脚本仅执行 TTS。

**摘要模式：**
撰写一篇 200-300 字的文章口语摘要。规则：
- 使用自然口语，而不是书面语
- 以文章的关键发现或答案开头
- 涵盖 3-5 个主要要点
- 以可执行的建议结尾
- 不要使用 markdown，不要出现 "In this article..."，不要添加元评论
- 使用口语化的过渡语（"Here's what matters...", "The key finding is..."）

**全文模式：**
将 markdown 内容整理为适合朗读的纯净文本：
- 将标题转换为自然的过渡语（"Next, let's look at..."）
- 将链接转换为纯文本（移除 URL，保留锚文本）
- 图片和图表：省略或简要描述（"As the data shows..."）
- 代码块：用口头方式描述（"The code uses a for-loop to..."）
- 将列表转换为自然的句子
- 移除 frontmatter、schema markup、HTML 标签
- 添加简短介绍："This is [title], published on [date]."

**对话模式：**
围绕文章撰写一段 2 人对话脚本：
- Speaker1 = 主持人（充满好奇，善于提出问题）
- Speaker2 = 专家（知识渊博，给出清晰的回答）
- 每行格式为：`Speaker1: What's the key takeaway here?`
- 以对话方式涵盖文章的主要内容
- 进行 15-25 轮对话（约产生 3-8 分钟的音频）
- 自然流畅，不要生硬（使用 "That's a great point"，而不是 "Indeed, as the research indicates"）

### 第 4 步：选择语音

如果用户选择了语音，则使用用户指定的语音。否则，根据模式进行推荐：
- 摘要/全文：默认使用 Charon（信息型）
- 对话：默认使用 Puck（主持人）+ Kore（专家）

### 第 5 步：生成音频

将准备好的文本写入工作目录下的文件，然后调用：

```bash
# Single voice (summary or full mode)
python3 scripts/run.py generate_audio.py \
  --text-file blog_audio_prepared.txt \
  --voice Charon \
  --model flash \
  --output audio/post-slug.mp3 \
  --json

# Two voices (dialogue mode)
python3 scripts/run.py generate_audio.py \
  --text-file blog_audio_dialogue.txt \
  --voice Puck \
  --voice2 Kore \
  --model pro \
  --output audio/post-slug-dialogue.mp3 \
  --json
```

**模型选择：**
- `flash`（默认）：映射到 `gemini-3.1-flash-tts-preview`，适合摘要和标准旁白。
- `flash31`：`gemini-3.1-flash-tts-preview` 的显式别名。
- `legacy-flash25`：仅为旧版兼容性保留。
- `pro` 或 `legacy-pro25`：映射到 `gemini-2.5-pro-preview-tts`，仅在需要时使用。

### 第 6 步：交付

向用户展示结果：
1. **文件路径**：音频保存的位置
2. **时长**：人类可读的格式（例如 "3:42"）
3. **嵌入代码**：可直接粘贴的 HTML5 音频标签
4. **成本**：预计 API 成本
5. **放置建议**：建议在博客文章中的何处插入嵌入代码

## 嵌入指南

### 标准 HTML（Hugo、Jekyll、静态网站）
```html
<audio controls preload="metadata">
  <source src="audio/post-slug.mp3" type="audio/mpeg">
  Your browser does not support the audio element.
</audio>
```

### MDX（Next.js、Gatsby）
```jsx
<audio controls preload="metadata">
  <source src="/audio/post-slug.mp3" type="audio/mpeg" />
</audio>
```

### WordPress
```
[audio src="audio/post-slug.mp3"]
```

### 放置位置
将音频播放器插入简介之后（第一个 H2 标题下方），或放在文章最顶部，并添加标签："收听本文" 或 "音频版本"。

## 内部 API（用于 blog-write）

从 blog-write 内部调用时：

**输入：**
- `text`：准备好的文本（已由 Claude 清理）
- `voice`：语音名称（默认：Charon）
- `voice2`：对话使用的第二种语音（可选）
- `model`：flash 或 pro
- `output_path`：保存文件的位置

**输出：**
```markdown
### Audio Narration
- **Path:** /path/to/audio/post-slug.mp3
- **Duration:** 3:42
- **Voice:** Charon
- **Embed:** `<audio controls preload="metadata"><source src="audio/post-slug.mp3" type="audio/mpeg"></audio>`
```

**优雅降级：** 如果未设置 `GOOGLE_AI_API_KEY`，立即返回且不报错。写作工作流会在没有音频的情况下继续。音频生成不可用时，绝不阻塞 blog-write。

## 错误处理

| 错误 | 解决方案 |
|-------|-----------|
| 未设置 GOOGLE_AI_API_KEY | 在 https://aistudio.google.com/apikey 获取密钥 |
| 未找到 FFmpeg | 安装：`sudo apt install ffmpeg`。将回退到 WAV 输出。 |
| 受到速率限制 | 等待并重试。在 https://aistudio.google.com/rate-limit 查看限制 |
| 文本过长（>8,192 个输入 token） | 将文本拆分为约 7,800 个 token 的多个部分；脚本会对准备好的文本进行分块并拼接 |
| 未知语音名称 | 运行 `/blog audio voices` 查看有效选项 |
| API 错误 | 检查密钥有效性和模型可用性 |
| API 密钥缺失（内部调用） | 静默返回：写作工作流会继续 |

## 参考文档

按需加载：启动时不要全部加载：
- `references/voices.md`：完整的 30 种语音目录、按内容类型提供的建议以及对话配对方案