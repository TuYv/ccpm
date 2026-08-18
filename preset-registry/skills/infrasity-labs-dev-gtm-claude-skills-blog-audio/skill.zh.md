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
---
# 博客音频：使用 Gemini TTS 为博客文章生成旁白

使用 Google 的 Gemini TTS 为博客内容生成专业音频旁白。
支持三种模式：摘要（200-300 词的口播概览）、全文朗读，
或双人播客对话。提供 30 种声音、支持 80 多种语言，并输出 HTML5 嵌入代码。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/blog audio generate <file>` | 为博客文章生成音频旁白 |
| `/blog audio voices` | 显示可用声音及其特点 |
| `/blog audio setup` | 检查/配置 Gemini TTS 的 API 密钥 |

## 前置条件

- Python 3.11+（venv 由 `run.py` 自动管理）
- `GOOGLE_AI_API_KEY` 环境变量（与 blog-image 使用相同的密钥）
- FFmpeg（用于将 WAV 转换为 MP3；如果缺失，则回退使用 WAV）

## 始终使用 run.py 包装器

```bash
# CORRECT:
python3 scripts/run.py generate_audio.py --text "..." --voice Charon --json

# WRONG:
python3 scripts/generate_audio.py --text "..."  # Fails without venv
```

## API 密钥检查（门控模式）

生成音频之前，检查 API 密钥：

```bash
echo $GOOGLE_AI_API_KEY
```

- 如果已设置：继续生成
- 如果未设置：引导用户：
  “音频生成需要 Google AI API 密钥。可前往 https://aistudio.google.com/apikey 免费获取
   然后进行设置：`export GOOGLE_AI_API_KEY=your-key`
   这与 `/blog image` 使用的是同一个密钥：如果图像生成可以工作，音频生成也可以。”
- **在内部调用时**（由 blog-write 调用）：如果缺少密钥，则静默返回。
  绝不要阻塞写作工作流。

## 设置

对于 `/blog audio setup`：

1. 检查环境中是否已设置 `GOOGLE_AI_API_KEY`
2. 如果已配置 blog-image（检查 `.mcp.json`），则密钥已经可用
3. 如果尚未配置，引导用户前往 https://aistudio.google.com/apikey
4. 通过试运行进行验证：`python3 scripts/run.py generate_audio.py --text "Test" --dry-run --json`

## 声音选择

对于 `/blog audio voices`：

加载 `references/voices.md` 并向用户展示声音目录。

询问用户偏好哪种声音，或根据内容类型进行推荐：
- **文章旁白**：Charon（信息丰富）或 Sadaltager（知识渊博）
- **教程/操作指南**：Achird（友好）或 Sulafat（温暖）
- **新闻/分析**：Rasalgethi（信息丰富）或 Schedar（平稳）
- **生活方式/健康**：Aoede（轻快）或 Vindemiatrix（柔和）
- **对话主持人**：Puck（活泼）或 Laomedeia（活泼）
- **对话专家**：Kore（坚定）或 Charon（信息丰富）

## 生成工作流

对于 `/blog audio generate <file>`：

### 第 1 步：读取博客文章

读取文件并提取：
- 标题（来自 H1 或 frontmatter）
- 完整内容（Markdown 正文）
- 大致字数

### 第 2 步：选择模式

询问用户（如果用户已指定 `--mode`，则自动选择）：

| 模式 | 适用场景 | 输出 |
|------|-------------|--------|
| **摘要** | 快速音频概览（1-2 分钟） | 200-300 词的口播摘要 |
| **全文** | 完整朗读（5-15 分钟） | 将全文以自然口语形式朗读 |
| **对话** | 播客风格（3-8 分钟） | 围绕文章展开的双人对话 |

### 第 3 步：准备文本

**关键要求：** 文本由 Claude 准备。脚本仅负责 TTS。

**摘要模式：**
撰写一篇 200-300 词的文章口语化摘要。规则：
- 使用自然口语，而不是书面语言
- 以文章的关键发现或答案开篇
- 涵盖 3-5 个主要要点
- 以可操作的建议结尾
- 不使用 Markdown，不要出现“In this article...”，不要添加元评论
- 使用自然的对话式过渡语（“Here's what matters...”“The key finding is...”）

**全文模式：**
将 Markdown 内容处理成简洁的口语化文本：
- 将标题转换为自然的过渡语（“Next, let's look at...”）
- 将链接转换为纯文本（删除 URL，保留锚文本）
- 图片和图表：省略或简要描述（“As the data shows...”）
- 代码块：用语言描述（“The code uses a for-loop to...”）
- 列表：转换为自然语句
- 删除 frontmatter、schema markup 和 HTML 标签
- 添加简短介绍：“This is [title], published on [date].”

**对话模式：**
围绕文章编写一份双人对话脚本：
- Speaker1 = 主持人（好奇，善于提出有价值的问题）
- Speaker2 = 专家（知识丰富，回答清晰）
- 每行格式为：`[Speaker1] What's the key takeaway here?`
- 以对话形式涵盖文章的主要观点
- 15-25 轮对话（可生成约 3-8 分钟的音频）
- 表达自然，不要生硬（使用“That's a great point”，而不是“Indeed, as the research indicates”）

### 第 4 步：选择语音

如果用户选择了语音，则使用该语音。否则，根据模式进行推荐：
- 摘要/全文：默认使用 Charon（信息型）
- 对话：默认使用 Puck（主持人）+ Kore（专家）

### 第 5 步：生成音频

将准备好的文本写入临时文件，然后调用：

```bash
# Single voice (summary or full mode)
python3 scripts/run.py generate_audio.py \
  --text-file /tmp/blog_audio_prepared.txt \
  --voice Charon \
  --model flash \
  --output /path/to/audio/post-slug.mp3 \
  --json

# Two voices (dialogue mode)
python3 scripts/run.py generate_audio.py \
  --text-file /tmp/blog_audio_dialogue.txt \
  --voice Puck \
  --voice2 Kore \
  --model pro \
  --output /path/to/audio/post-slug-dialogue.mp3 \
  --json
```

**模型选择：**
- `flash`（默认）：速度快、成本低。适合摘要和标准旁白。
- `pro`：质量更高。用于对话模式或优质内容。

### 第 6 步：交付

向用户呈现结果：
1. **文件路径**：音频的保存位置
2. **时长**：便于阅读的格式（例如“3:42”）
3. **嵌入代码**：可直接粘贴使用的 HTML5 音频标签
4. **成本**：预估 API 成本
5. **放置建议**：在博客文章中插入嵌入代码的位置

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
将音频播放器插入引言之后（第一个 H2 下方），或放在文章的
最顶部，并添加标签：“收听本文”或“音频版本”。

## 内部 API（用于 blog-write）

当由 blog-write 内部调用时：

**输入：**
- `text`：准备好的文本（已由 Claude 清理）
- `voice`：语音名称（默认：Charon）
- `voice2`：用于对话的第二个语音（可选）
- `model`：flash 或 pro
- `output_path`：文件的保存位置

**输出：**
```markdown
### Audio Narration
- **Path:** /path/to/audio/post-slug.mp3
- **Duration:** 3:42
- **Voice:** Charon
- **Embed:** `<audio controls preload="metadata"><source src="audio/post-slug.mp3" type="audio/mpeg"></audio>`
```

**优雅降级：** 如果未设置 `GOOGLE_AI_API_KEY`，则立即返回且不报错。写作工作流将在没有音频的情况下继续。切勿因音频生成不可用而阻塞 blog-write。

## 错误处理

| 错误 | 解决方案 |
|-------|-----------|
| 未设置 GOOGLE_AI_API_KEY | 在 https://aistudio.google.com/apikey 获取密钥 |
| 未找到 FFmpeg | 安装：`sudo apt install ffmpeg`。回退为 WAV 输出。 |
| 受到速率限制 | 等待后重试。在 https://aistudio.google.com/rate-limit 查看限制 |
| 文本过长（>32k tokens） | 拆分为多个部分，分别生成 |
| 未知的语音名称 | 运行 `/blog audio voices` 查看有效选项 |
| API 错误 | 检查密钥有效性和模型可用性（预览模型） |
| 缺少 API 密钥（内部调用） | 静默返回：写作工作流继续 |

## 参考文档

按需加载：不要在启动时全部加载：
- `references/voices.md`：完整的 30 种语音目录、按内容类型提供的建议以及对话语音搭配