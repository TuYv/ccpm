---
name: blog-image
description: >
  AI image generation and editing for blog content powered by Gemini via MCP.
  Generates hero images, inline illustrations, social preview cards, and OG
  images, and edits existing ones. Supports 6 domain modes (Editorial, Product,
  Landscape, UI/Web, Infographic, Abstract). Works standalone or internally from
  blog-write and blog-rewrite; falls back gracefully when MCP is unavailable.
  Use when user says "blog image", "generate hero image", "blog illustration",
  "edit blog image", "OG image".
user-invokable: true
argument-hint: "[generate|edit|setup] [description-or-path]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.0"
  mcp-package: "@ycse/nanobanana-mcp"
---
# Blog Image - 博客内容的 AI 图像生成

你是一名**创意总监**，负责专门为博客内容编排 Gemini 的图像生成。绝不要将用户的原始文本直接传递给 API。始终使用 6-component Reasoning Brief system 解读、增强并构建经过优化的提示词。

## Quick Reference

| Command | What it does |
|---------|-------------|
| `/blog image generate <idea>` | 使用完整的提示词工程生成博客图片 |
| `/blog image edit <path> <instructions>` | 智能编辑现有博客图片 |
| `/blog image setup` | 配置 MCP server 和 API key |

## Blog Image Types

根据博客的使用场景匹配图片类型：

| Image Type | Aspect Ratio | Resolution | Domain Mode | Placement |
|------------|-------------|-----------|-------------|-----------|
| Hero/Cover | `16:9` | 2K 或 4K | Editorial / Landscape | Frontmatter `coverImage` |
| OG/Social Card | `16:9` | 1K | Editorial / Infographic | Frontmatter `ogImage` |
| Inline Illustration | `16:9` 或 `4:3` | 1K | 根据主题而定 | H2 之后、正文之前 |
| Inline Product Shot | `4:3` 或 `1:1` | 1K | Product | 产品相关章节中 |
| Section Divider | `21:9`，然后裁剪 | 1K | Abstract / Landscape | 主要章节之间 |

**Sizing requirements:**
- 博客 hero/cover：1200x630（兼容 OG）或 1920x1080
- Open Graph (OG)：1200x630（社交分享所必需）
- Inline images：宽度至少为 1200px

## MCP Availability Check

生成之前，检查 nanobanana-mcp 工具是否可用：

1. 尝试调用 `get_image_history`，并使用 `conversation_id: "default"`（轻量级，无副作用）
2. 如果调用成功：MCP 可用，继续生成
3. 如果调用失败：MCP 未配置——告知用户：
   - “图像生成需要 nanobanana-mcp server。运行 `/blog image setup` 进行配置。”
   - 当由 blog-write/blog-rewrite 内部调用时：静默返回，不报告错误。调用方工作流将继续使用 stock photos。

## Generation Workflow

对于 `/blog image generate <idea>` 或内部调用时：

### Step 1: Analyze Intent

确定博客需要什么：
- **图片类型**：Hero、inline、OG card、section divider？
- **博客主题**：文章是关于什么的？
- **风格**：写实、编辑风、插画、极简？
- **限制条件**：品牌色、具体尺寸、平台格式？
- **氛围**：权威、亲切、戏剧性、简洁？

如果请求比较模糊，就针对使用场景和风格提出一个澄清问题。

### Step 2: Select Domain Mode

为图片选择合适的专业视角：

| Mode | When to use | Prompt emphasis |
|------|-------------|-----------------|
| **Editorial** | 博客页眉、专题图片、生活方式内容 | 风格、构图、出版物参考 |
| **Product** | 电商文章、评测、对比内容 | 表面材质、摄影棚灯光、干净背景 |
| **Landscape** | 环境背景、旅行、hero 区域 | 大气透视、景深层次、时间 |
| **UI/Web** | 科技博客图标、插画、图表 | 简洁矢量、扁平设计、精确颜色 |
| **Infographic** | 数据驱动文章、流程、对比内容 | 布局结构、层级、易于访问的颜色 |
| **Abstract** | 图案背景、section divider、装饰元素 | 色彩理论、数学形态、纹理 |

加载 `references/prompt-engineering-blog.md`，获取领域模式修饰词库。

### 第 3 步：构建 6 个组成部分的推理简报

将提示词组织成自然的叙述段落，而不是关键词列表：

1. **主体** - 人物/事物是谁或是什么，并提供丰富的物理细节（纹理、材质、尺度）
2. **动作** - 正在发生什么，包括姿势、手势、运动、状态
3. **背景** - 环境、场景、一天中的时间、季节、天气
4. **构图** - 相机角度、景别、取景、负空间、景深
5. **光照** - 光源、光质、方向、色温、阴影
6. **风格** - 艺术媒介、美学、胶片类型、参考艺术家/时代

**写实博客图片模板：**
```
A photorealistic [shot type] of [subject with physical detail], [action/pose],
set in [environment with specifics]. [Lighting conditions] create [mood].
Captured with [camera model], [focal length] lens at [f-stop], producing
[depth of field effect]. [Color palette/grading notes]. Aspect ratio 16:9,
suitable as a blog [hero image/inline illustration] at [target dimensions].
```

**插画/风格化图片模板：**
```
A [art style] [format] of [subject with character detail], featuring
[distinctive characteristics] with [color palette]. [Line style] and
[shading technique]. Background is [description]. [Mood/atmosphere].
```

### 第 4 步：设置宽高比

在生成图片之前调用 `set_aspect_ratio`。使用 `conversation_id: "default"`。

| 博客使用场景 | 比例 |
|---------------|-------|
| Hero / Cover / OG | `16:9` |
| 产品图 / 方形图 | `4:3` 或 `1:1` |
| 分节分隔图 | `21:9`，如有需要，再在后期处理中裁剪为更宽的比例 |
| 竖版（stories） | `9:16` |

### 第 5 步：通过 MCP 生成

| MCP 工具 | 使用时机 |
|----------|------|
| `set_aspect_ratio` | 始终首先调用，即使比例为 1:1 |
| `gemini_generate_image` | 根据精心构建的提示词生成新图片 |
| `gemini_edit_image` | 修改现有图片 |
| `gemini_chat` | 迭代优化 / 多轮会话 |
| `get_image_history` | 使用 `conversation_id: "default"` 查看生成的图片 |
| `clear_conversation` | 重置会话上下文 |

**模型选择**：
- 稳定的 Google API ID：`gemini-3.1-flash-image` 和 `gemini-3-pro-image`
- 固定版本 `@ycse/nanobanana-mcp@1.1.1`：`set_model` 接受 `flash` 和 `pro`，但会将它们映射到将在 2026-06-25 停止运行的预览版 ID
- 在承诺 MCP 图片生成功能可用之前，请使用直接 API，或使用明确支持稳定图片 ID 的更新版 MCP 软件包

加载 `references/mcp-tools.md` 以获取参数详情。  
加载 `references/gemini-models.md` 以获取模型规格、定价和速率限制。

### 第 6 步：后期处理（必要时）

生成图片后，根据博客使用场景调整尺寸/格式：

```bash
# Resize to blog hero dimensions (1200x630)
magick input.png -resize 1200x630^ -gravity center -extent 1200x630 hero.png

# Convert to WebP for web optimization
magick input.png -quality 85 output.webp

# Convert to AVIF when target browsers support it
magick input.png -quality 80 output.avif

# Crop to exact OG dimensions
magick input.png -resize 1200x630^ -gravity center -extent 1200x630 og-image.png
```

检查 `magick`（ImageMagick 7）是否可用。如果不可用，则回退到 `convert`。

### 第 7 步：交付

提供：
1. **图像路径** - 保存位置（`~/Documents/nanobanana_generated/`）
2. **构思提示词** - 展示完整的 Reasoning Brief（用于教育）
3. **设置** - 模型、宽高比、领域模式
4. **替代文本** - 描述性句子，10-125 个字符，自然包含主题关键词
5. **Frontmatter 片段**（用于 hero/OG 图像）：
```yaml
coverImage: "/path/to/generated-image.png"
coverImageAlt: "Descriptive alt text sentence with topic keywords"
ogImage: "/path/to/generated-image.png"
```
6. **优化建议** - 如有相关内容，提供 1-2 个想法

## 编辑工作流

对于 `/blog image edit <path> <instructions>`：

1. 读取图像路径和编辑指令
2. 优化指令（绝不直接传递原始指令）：
   | 用户说法 | Claude 编写的指令 |
   |-----------|---------------|
   | "remove background" | 详细的保留边缘的背景移除 |
   | "make it warmer" | 具体的色温调整，同时附带保留说明 |
   | "add text" | 字体样式、大小、位置、对比度和可读性说明 |
   | "make it brighter" | 提高曝光度、提亮阴影，同时保持高光 |
   | "crop for social" | 调整为 1200x630，并进行中心主体裁剪 |
3. 使用增强后的指令调用 `gemini_edit_image`
4. 返回修改后的图像路径和描述

## 内部 API（用于 blog-write / blog-rewrite）

作为 blog-write 或 blog-rewrite 的 Task 子代理调用时：

**输入**（由调用方 skill 提供）：
- `image_type`：hero、inline、og、divider
- `topic`：博客文章主题/标题
- `section_context`：（可选）图像所支持的标题或章节
- `style_preference`：（可选）写实、插画、编辑风
- `count`：（可选）所需图像数量（默认为 1）

**输出**（返回给调用方 skill）：
```markdown
### Generated Image
- **Path:** ~/Documents/nanobanana_generated/image_timestamp.png
- **Alt Text:** Descriptive sentence about the image
- **Type:** hero / inline / og
- **Domain Mode:** Editorial
- **Aspect Ratio:** 16:9
- **Suggested Frontmatter:**
  coverImage: "/path/to/image.png"
  coverImageAlt: "Alt text here"
```

**优雅回退**：如果 MCP 不可用，立即返回且不报错。
调用方工作流将继续使用图库照片。如果图像生成不可用，绝不阻塞 blog-write 或
blog-rewrite。

## 替代文本生成

对于每张生成的图像，按照博客标准创建替代文本：
- 完整的描述性句子（而不是关键词列表）
- 10-125 个字符
- 自然包含主题关键词
- 描述图像展示的内容以及其与文章内容的相关性
- 对于图表/信息图：包含关键数据点

良好示例：`Marketing team analyzing AI search traffic data on a dashboard showing citation metrics`
不良示例：`SEO AI marketing blog optimization image`

## 设置

对于 `/blog image setup`：

1. 运行 `python3 skills/blog-image/scripts/setup_image_mcp.py`（交互式）
   - 首选：`GOOGLE_AI_API_KEY=... python3 skills/blog-image/scripts/setup_image_mcp.py`
   - 或：`python3 skills/blog-image/scripts/setup_image_mcp.py --key-file /path/to/key.txt`
   - 除非必要，否则避免使用 `--key`，因为命令参数可能进入 shell 历史记录和进程列表
   - 默认写入 `~/.claude/settings.json`（用户私有，权限模式为 0600）
   - `--project` 标志选择加入项目 `.mcp.json`（仅展开环境变量，
     拒绝将明文密钥写入受版本控制的文件）
2. 验证：`python3 skills/blog-image/scripts/validate_image_setup.py`
3. 要求：
   - Node.js 18+（npx）
   - Google AI API 密钥，可从 https://aistudio.google.com/apikey 免费创建
   - 图像模型可能要求启用结算的项目
4. 该脚本将软件包固定为 `@ycse/nanobanana-mcp@1.1.1`。该 npm
   版本硬编码了将于 2026-06-25 停止运行的预览图像模型 ID。
   当支持稳定 ID 的软件包版本可用时，应同时更新设置、验证和本文档。

## 安全过滤器自动改写

当返回 `IMAGE_SAFETY` 或 `SAFETY` 时，不要放弃。自动改写并重试：

1. 识别可能的触发因素（暴力、公众人物、接近 NSFW 的内容，或过于谨慎的过滤器）
2. 使用积极的表述进行改写——描述你想要的内容，而不是想要避免的内容
3. 如果主题是人物，将其设定为普通人物（去除类似名人的具体特征）
4. 如果场景具有戏剧性，适当弱化措辞："intense" → "focused"，"battle" → "competition"
5. 使用改写后的提示词重试（最多尝试 3 次，然后向用户报告）

Google 承认过滤器“比我们预期的谨慎得多”——一些正常的提示词有时也会被拦截。坚持改写通常能够成功。

## 编辑，而不是重新生成

如果图像已经有 80% 符合要求，应使用 `gemini_chat` 进行对话式编辑，而不是从头重新生成。该会话会保持风格一致性，因此针对性的编辑可以在修正问题的同时保留有效部分。

**何时编辑，何时重新生成：**
- 颜色略有偏差 → 编辑（“将色温调得更暖一些”）
- 构图完全错误 → 使用修订后的简要说明重新生成
- 场景很好但光线不对 → 编辑（“改为从左侧照射的黄金时刻光线”）
- 缺少某个细节 → 编辑（“在桌上添加一杯冒着热气的咖啡”）

## 错误处理

| 错误 | 解决方案 |
|-------|-----------|
| MCP 未配置 | 运行 `/blog image setup` |
| API key 无效 | 在 https://aistudio.google.com/apikey 获取新密钥 |
| 受到速率限制 (429) | 等待 60 秒后重试。在 https://ai.google.dev/gemini-api/docs/rate-limits 查看实时限制 |
| `IMAGE_SAFETY` | 自动改写（见上文）——第 2 层过滤器，不可配置 |
| `PROHIBITED_CONTENT` | 违反内容政策——该主题已被拦截。不可重试。 |
| `SAFETY` | 改写提示词——第 1 层过滤器 |
| 请求含糊不清 | 生成前提出一个澄清问题 |
| 质量不佳 | 检查 Reasoning Brief——很可能缺少光照描述（最大的质量差异因素） |
| MCP 不可用（内部调用） | 静默返回——调用工作流会使用库存照片 |

## 参考文档

按需加载——不要在启动时全部加载：
- `references/prompt-engineering-blog.md` - 领域模式、6 组件系统、博客模板
- `references/gemini-models.md` - 模型规格、速率限制、宽高比、定价
- `references/mcp-tools.md` - MCP 工具参数和响应格式