---
name: deck-generator
description: Generate professional presentations with AI-generated images. Use when asked to create a deck, presentation, pitch deck, or slides. Supports style presets (whiteboard, corporate, minimalist, etc). Uses Imagen 4.0 API for image generation and Google Slides API for assembly. Produces full decks from markdown content specs in minutes.
---
# 幻灯片生成器

生成完整的演示文稿，其中每张幻灯片都是采用一致视觉风格的 AI 生成图像。

## 快速开始

1. 阅读内容规范（用户提供幻灯片内容或 Markdown 文件）
2. 阅读 `references/styles.md`，选择或自定义视觉风格
3. 使用内容和风格运行 `scripts/generate-deck.py`

## 工作流程

### 第 1 步：内容规范

接受任意格式的幻灯片内容。将每张幻灯片规范化为以下结构：
- **标题**：加粗的大标题
- **正文**：要点、统计数据或叙述
- **视觉提示**：用文字描述图标、图表和布局

如果用户提供了使用 `---` 分隔的 Markdown 文件，则将每个部分解析为一张幻灯片。
如果用户只提供了一个主题，则按照标准演示文稿结构生成 10-14 张幻灯片。

### 第 2 步：风格选择

可用的预设风格：

| 风格 | 描述 |
|-------|-------------|
| `whiteboard` | 白底手绘草图。黑色墨迹，橙色点缀。 |
| `corporate` | 海军蓝/白色/金色。简洁的无衬线字体。专业风格。 |
| `minimalist` | 纯白色，电光蓝点缀。最大化留白。 |
| `dark-tech` | 近黑色背景，霓虹绿色。终端美学。 |
| `playful` | 明亮的柔和色彩，圆润形状。现代初创公司氛围。 |
| `editorial` | 黑白配色，使用红色作为强调色。杂志美学。 |

默认值：`whiteboard`。用户可以指定任意预设风格，也可以描述自定义风格。

### 第 3 步：生成

```bash
# Set your API key
export GEMINI_API_KEY="your-gemini-api-key"

# Run the generator
python3 scripts/generate-deck.py \
  --content slides.json \
  --style whiteboard \
  --title "Deck Title" \
  [--output-dir ./output] \
  [--aspect 16:9]
```

该脚本会：
1. 通过 Imagen 4.0 API 生成每张幻灯片图像
2. 将所有图像保存到输出目录
3. 可选择创建 Google Slides 演示文稿（需要 Google Slides API 凭据）
4. 返回所有已生成图像的路径

### 第 4 步：审阅与迭代

要重新生成单张幻灯片：
```bash
python3 scripts/generate-deck.py \
  --content slides.json \
  --style whiteboard \
  --slides 3,7 \
  --output-dir ./output
```

## 关键详情

- **成本**：每张图像约 4 美分。一份包含 14 张幻灯片的演示文稿所产生的 API 调用费用约为 56 美分。
- **速度**：生成 14 张幻灯片约需 2 分钟。
- **API**：通过 Google Generative Language API 使用 Imagen 4.0
- **身份验证**：设置 `$GEMINI_API_KEY` 环境变量
- **宽高比**：16:9（默认）、1:1、4:3、3:4、9:16
- **图像模型**：`imagen-4.0-generate-001`（质量最佳）、`imagen-4.0-fast-generate-001`（速度更快）

## 内容 JSON 格式

```json
[
  {"name": "01-title", "prompt": "Title slide: 'Your Deck Title' with company logo placeholder"},
  {"name": "02-problem", "prompt": "Problem slide showing frustrated marketer staring at dashboard with declining metrics"},
  {"name": "03-solution", "prompt": "Solution slide: AI agent workflow diagram with 3 connected boxes"}
]
```

## Google Slides 集成（可选）

要自动创建 Google Slides 演示文稿，请设置 Google Slides API 凭据：

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account.json"
python3 scripts/generate-deck.py \
  --content slides.json \
  --style whiteboard \
  --title "My Deck" \
  --google-slides \
  --google-account your-email@example.com
```