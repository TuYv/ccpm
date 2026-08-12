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
  version: "2.1.1"
---
# 博客音频：使用 Gemini TTS 为博客文章生成旁白

使用 Google 的 Gemini TTS 为博客内容生成专业音频旁白。
支持三种模式：摘要（200-300 词的语音概述）、全文朗读，
或双人播客对话。提供 30 种声音、支持 80 多种语言，并输出 HTML5 嵌入代码。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/blog audio generate <file>` | 为博客文章生成音频旁白 |
| `/blog audio voices` | 显示可用声音及其特点 |
| `/blog audio setup` | 检查/配置 Gemini TTS 的 API 密钥 |

## 前置要求

- Python 3.11+（venv 由 `run.py` 自动管理）
- `GOOGLE_AI_API_KEY` 环境变量（与 blog-image 使用的密钥相同）
- FFmpeg（用于将 WAV 转换为 MP3；如果缺失，则回退为 WAV）

## 始终使用 run.py 包装器

```bash
# CORRECT:
python3 scripts/run.py generate_audio.py --text "..." --voice Charon --json

# WRONG:
python3 scripts/generate_audio.py --text "..."  # Fails without venv
```

## API 密钥检查（门控模式）

生成音频前，检查 API 密钥：

```bash
test -n "${GOOGLE_AI_API_KEY:-}" && echo "GOOGLE_AI_API_KEY is set" || echo "GOOGLE_AI_API_KEY is not set"
```

- 如果已设置：继续生成
- 如果未设置：引导用户：
  “音频生成需要 Google AI API 密钥。可在 https://aistudio.google.com/apikey 免费获取
   然后进行设置：`export GOOGLE_AI_API_KEY=your-key`
   这可以与 `/blog image` 使用相同的密钥，但必须在 shell 中导出。”
- **内部调用时**（从 blog-write 调用）：如果缺少密钥，则静默返回。
  切勿阻塞写作工作流。

## 设置

对于 `/blog audio setup`：

1. 检查环境中是否已设置 `GOOGLE_AI_API_KEY`
2. 如果 blog-image 使用项目的 `.mcp.json`，确认其中引用的环境变量已导出
3. 如果未设置，引导用户访问 https://aistudio.google.com/apikey
4. 通过试运行进行验证：`python3 scripts/run.py generate_audio.py --text "Test" --dry-run --json`

## 声音选择

对于 `/blog audio voices`：

加载 `references/voices.md`，并向用户展示声音目录。

询问用户偏好哪种声音，或根据内容类型进行推荐：
- **文章旁白**：Charon（信息丰富）或 Sadaltager（知识渊博）
- **教程/操作指南**：Achird（友好）或 Sulafat（温暖）
- **新闻/分析**：Rasalgethi（信息丰富）或 Schedar（平稳）
- **生活方式/健康**：Aoede（轻快）或 Vindemiatrix（温柔）
- **对话主持人**：Puck（活泼）或 Laomedeia（活泼）
- **对话专家**：Kore（坚定）或 Charon（信息丰富）

## 生成工作流

对于 `/blog audio generate <file>`：

### 第 1 步：读取博客文章

读取文件并提取：
- 标题（来自 H1 或 frontmatter）
- 完整内容（Markdown 正文）
- 估算字数

### 第 2 步：选择模式

询问用户（如果用户指定了 `--mode`，则自动选择）：

| 模式 | 适用场景 | 输出 |
|------|-------------|--------|
| **摘要** | 快速音频概述（1-2 分钟） | 200-300 词的语音摘要 |
| **全文** | 完整朗读（5-15 分钟） | 将全文转换为自然语音 |
| **对话** | 播客风格（3-8 分钟） | 围绕文章展开的双人对话 |

### 步骤 3：准备文本

Claude 负责准备文本；脚本仅执行 TTS。

**摘要模式：**
撰写一篇 200-300 词的文章口语摘要。规则：
- 使用自然口语，而非书面语言
- 以文章的关键发现或答案开篇
- 涵盖 3-5 个主要要点
- 以可操作的建议结尾
- 不使用 Markdown，不说“本文将……”，不添加元评论
- 使用自然的对话式过渡语（“以下是重点……”“关键发现是……”）

**全文模式：**
将 Markdown 内容转换为干净的口语文本：
- 将标题转换为自然的过渡语（“接下来，让我们看看……”）
- 将链接转换为纯文本（移除 URL，保留锚文本）
- 图片和图表：省略或进行简短描述（“正如数据所示……”）
- 代码块：用语言描述（“这段代码使用 for 循环来……”）
- 列表：转换为自然语句
- 移除 frontmatter、schema 标记和 HTML 标签
- 添加简短引言：“这是 [title]，发布于 [date]。”

**对话模式：**
围绕文章编写一份双人对话脚本：
- Speaker1 = 主持人（充满好奇，善于提出好问题）
- Speaker2 = 专家（知识丰富，回答清晰）
- 每行格式为：`Speaker1: What's the key takeaway here?`
- 以对话形式涵盖文章的主要内容
- 15-25 轮对话（生成约 3-8 分钟的内容）
- 表达自然，不要生硬（使用“这个观点很好”，而不是“确实，正如研究所表明的那样”）

### 步骤 4：选择语音

如果用户选择了语音，则使用该语音。否则，根据模式进行推荐：
- 摘要/全文：默认使用 Charon（信息型）
- 对话：默认使用 Puck（主持人）+ Kore（专家）

### 步骤 5：生成音频

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
- `legacy-flash25`：仅为向后兼容而保留。
- `pro` 或 `legacy-pro25`：映射到 `gemini-2.5-pro-preview-tts`，仅在需要时使用。

### 步骤 6：交付

向用户提供结果：
1. **文件路径**：音频的保存位置
2. **时长**：易于阅读的格式（例如“3:42”）
3. **嵌入代码**：可直接粘贴的 HTML5 音频标签
4. **成本**：预估的 API 成本
5. **放置建议**：建议将嵌入代码插入博客文章的哪个位置

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
将音频播放器插入引言之后（第一个 H2 下方），或放在文章最顶部，并添加标签：“收听本文”或“音频版本”。

## 内部 API（用于 blog-write）

当由 blog-write 内部调用时：

**输入：**
- `text`：准备好的文本（已经由 Claude 清理）
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

**优雅降级：** 如果未设置 `GOOGLE_AI_API_KEY`，则立即返回且不报错。写作工作流将在没有音频的情况下继续。绝不能因为音频生成不可用而阻塞 blog-write。

## 错误处理

| 错误 | 解决方法 |
|-------|-----------|
| 未设置 GOOGLE_AI_API_KEY | 在 https://aistudio.google.com/apikey 获取密钥 |
| 未找到 FFmpeg | 安装：`sudo apt install ffmpeg`。回退为 WAV 输出。 |
| 受到速率限制 | 等待后重试。在 https://aistudio.google.com/rate-limit 查看限制 |
| 文本过长（>8,192 个输入 token） | 在约 7,800 个 token 处分割为多个部分；脚本会对准备好的文本进行分块并拼接 |
| 未知的语音名称 | 运行 `/blog audio voices` 查看有效选项 |
| API 错误 | 检查密钥有效性和模型可用性 |
| 缺少 API 密钥（内部调用） | 静默返回：写作工作流继续 |

## 参考文档

按需加载：不要在启动时全部加载：
- `references/voices.md`：完整的 30 种语音目录、按内容类型提供的建议、对话语音搭配