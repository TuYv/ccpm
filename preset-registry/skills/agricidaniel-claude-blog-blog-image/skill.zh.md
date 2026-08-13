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
  version: "2.1.1"
  mcp-package: "@ycse/nanobanana-mcp"
---
# 博客图片 - 为博客内容生成 AI 图片

你是一名**创意总监**，负责专门针对博客内容统筹 Gemini 的图片生成。绝不要将原始用户文本直接传递给 API。始终使用六要素推理简报系统进行解读、增强，并构建优化后的提示词。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/blog image generate <idea>` | 通过完整的提示词工程生成博客图片 |
| `/blog image edit <path> <instructions>` | 智能编辑现有博客图片 |
| `/blog image setup` | 配置 MCP 服务器和 API 密钥 |

## 博客图片类型

根据博客使用场景匹配图片类型：

| 图片类型 | 宽高比 | 分辨率 | 领域模式 | 放置位置 |
|------------|-------------|-----------|-------------|-----------|
| 首图/封面 | `16:9` | 2K 或 4K | 编辑 / 风景 | Frontmatter `coverImage` |
| OG/社交卡片 | `16:9` | 1K | 编辑 / 信息图 | Frontmatter `ogImage` |
| 文内插图 | `16:9` 或 `4:3` | 1K | 根据主题而定 | H2 之后、正文之前 |
| 文内产品图 | `4:3` 或 `1:1` | 1K | 产品 | 产品相关章节内 |
| 章节分隔图 | `21:9` 后裁剪 | 1K | 抽象 / 风景 | 主要章节之间 |

**尺寸要求：**
- 博客首图/封面：1200x630（兼容 OG）或 1920x1080
- Open Graph（OG）：1200x630（社交分享必需）
- 文内图片：宽度 1200px 以上

## MCP 可用性检查

生成图片前，检查 nanobanana-mcp 工具是否可用：

1. 尝试使用 `conversation_id: "default"` 调用 `get_image_history`（轻量级，无副作用）
2. 如果成功：MCP 可用，继续生成
3. 如果失败：MCP 尚未配置——通知用户：
   - “图片生成需要 nanobanana-mcp 服务器。运行 `/blog image setup` 进行配置。”
   - 在内部调用时（由 blog-write/blog-rewrite 调用）：静默返回，不报错。调用方工作流将继续使用图库照片。

## 生成工作流

针对 `/blog image generate <idea>` 或内部调用：

### 第 1 步：分析意图

确定博客的需求：
- **图片类型**：首图、文内图片、OG 卡片还是章节分隔图？
- **博客主题**：文章讲述什么内容？
- **风格**：照片级写实、编辑风、插画风还是极简风？
- **约束条件**：品牌色、特定尺寸、平台格式？
- **氛围**：权威、亲切、戏剧化还是简洁？

如果请求含糊不清，针对使用场景和风格提出一个澄清问题。

### 第 2 步：选择领域模式

选择适合图片的专业视角：

| 模式 | 适用场景 | 提示词重点 |
|------|-------------|-----------------|
| **编辑** | 博客标题图片、专题图片、生活方式内容 | 造型、构图、出版物参考 |
| **产品** | 电商文章、评测、对比 | 表面材质、影棚灯光、干净背景 |
| **风景** | 环境背景、旅行、首图区域 | 大气透视、景深层次、一天中的时段 |
| **UI/Web** | 技术博客图标、插图、图表 | 简洁矢量、扁平化设计、精确色彩 |
| **信息图** | 数据驱动型文章、流程、对比 | 布局结构、层级、无障碍配色 |
| **抽象** | 图案背景、章节分隔图、装饰元素 | 色彩理论、数学形态、纹理 |

加载 `references/prompt-engineering-blog.md`，以获取领域模式修饰符库。

### 第 3 步：构建六要素推理简报

将提示词写成自然连贯的叙述性段落，而不是关键词列表：

1. **主体** - 人物或事物，并包含丰富的物理细节（纹理、材质、尺度）
2. **动作** - 正在发生什么，以及姿势、手势、运动、状态
3. **情境** - 环境、场景、时间、季节、天气
4. **构图** - 相机角度、景别、取景、负空间、景深
5. **光照** - 光源、光线质感、方向、色温、阴影
6. **风格** - 艺术媒介、审美风格、胶片类型、参考艺术家或时代

**照片级写实博客图像模板：**
```
A photorealistic [shot type] of [subject with physical detail], [action/pose],
set in [environment with specifics]. [Lighting conditions] create [mood].
Captured with [camera model], [focal length] lens at [f-stop], producing
[depth of field effect]. [Color palette/grading notes]. Aspect ratio 16:9,
suitable as a blog [hero image/inline illustration] at [target dimensions].
```

**插画或风格化图像模板：**
```
A [art style] [format] of [subject with character detail], featuring
[distinctive characteristics] with [color palette]. [Line style] and
[shading technique]. Background is [description]. [Mood/atmosphere].
```

### 第 4 步：设置宽高比

生成前调用 `set_aspect_ratio`。使用 `conversation_id: "default"`。

| 博客使用场景 | 宽高比 |
|---------------|-------|
| 头图 / 封面 / OG 图像 | `16:9` |
| 产品图 / 方形图 | `4:3` 或 `1:1` |
| 章节分隔图 | `21:9`，然后根据需要在后期处理中裁剪得更宽 |
| 竖版（故事） | `9:16` |

### 第 5 步：通过 MCP 生成

| MCP 工具 | 使用时机 |
|----------|------|
| `set_aspect_ratio` | 始终首先调用，即使使用 1:1 |
| `gemini_generate_image` | 根据精心编写的提示词生成新图像 |
| `gemini_edit_image` | 修改现有图像 |
| `gemini_chat` | 迭代优化 / 多轮会话 |
| `get_image_history` | 使用 `conversation_id: "default"` 查看已生成的图像 |
| `clear_conversation` | 重置会话上下文 |

**模型选择**：
- 稳定版 Google API ID：`gemini-3.1-flash-image` 和 `gemini-3-pro-image`
- 固定版本 `@ycse/nanobanana-mcp@1.1.1`：`set_model` 接受 `flash` 和 `pro`，但会将它们映射到将在 2026-06-25 停用的预览版 ID
- 在承诺 MCP 图像生成可正常工作之前，请使用直接 API，或使用明确支持稳定版图像 ID 的更新版 MCP 软件包

加载 `references/mcp-tools.md`，以获取参数详情。
加载 `references/gemini-models.md`，以获取模型规格、定价和速率限制。

### 第 6 步：后期处理（需要时）

生成后，调整图像尺寸或转换格式，以供博客使用：

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

检查 `magick`（ImageMagick 7）是否可用。如果不可用，则回退使用 `convert`。

### 步骤 7：交付

提供：
1. **图片路径** - 图片保存的位置（`~/Documents/nanobanana_generated/`）
2. **精心构建的提示词** - 展示完整的推理简报（用于教学）
3. **设置** - 模型、宽高比、领域模式
4. **替代文本** - 描述性句子，长度为 10-125 个字符，自然融入主题关键词
5. **Frontmatter 片段**（用于头图/OG 图片）：
```yaml
coverImage: "/path/to/generated-image.png"
coverImageAlt: "Descriptive alt text sentence with topic keywords"
ogImage: "/path/to/generated-image.png"
```
6. **优化建议** - 如果相关，提供 1-2 个建议

## 编辑工作流

对于 `/blog image edit <path> <instructions>`：

1. 读取图片路径和编辑指令
2. 增强指令（绝不直接传递原始指令）：
   | 用户说 | Claude 构建的指令 |
   |-----------|---------------|
   | “移除背景” | 在保留边缘细节的情况下移除背景 |
   | “让它更暖一些” | 进行特定的色温调整，并注明需要保留的部分 |
   | “添加文本” | 指定字体样式、大小、位置、对比度和可读性要求 |
   | “让它更亮一些” | 增加曝光、提亮阴影，同时保留高光细节 |
   | “裁剪为社交媒体尺寸” | 调整为 1200x630，并采用中心重力裁剪 |
3. 使用增强后的指令调用 `gemini_edit_image`
4. 返回修改后的图片路径和描述

## 内部 API（用于 blog-write / blog-rewrite）

当作为 Task 子代理由 blog-write 或 blog-rewrite 调用时：

**输入**（由调用方 Skill 提供）：
- `image_type`：头图、内文图片、OG 图片、分隔图
- `topic`：博客文章主题/标题
- `section_context`：（可选）图片所支持的标题或章节
- `style_preference`：（可选）照片写实、插画、编辑风格
- `count`：（可选）所需图片数量（默认值：1）

**输出**（返回给调用方 Skill）：
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

**优雅降级**：如果 MCP 不可用，立即返回且不报错。
调用方工作流将继续使用图库照片。绝不能因为图片生成不可用而阻塞 blog-write 或
blog-rewrite。

## 替代文本生成

为每张生成的图片创建符合博客标准的替代文本：
- 使用完整的描述性句子（而不是关键词列表）
- 长度为 10-125 个字符
- 自然融入主题关键词
- 描述图片展示的内容及其与文章内容的相关性
- 对于图表/信息图：包含关键数据点

好：`Marketing team analyzing AI search traffic data on a dashboard showing citation metrics`
差：`SEO AI marketing blog optimization image`

## 设置

对于 `/blog image setup`：

1. 运行 `python3 skills/blog-image/scripts/setup_image_mcp.py`（交互式）
   - 推荐：`GOOGLE_AI_API_KEY=... python3 skills/blog-image/scripts/setup_image_mcp.py`
   - 或者：`python3 skills/blog-image/scripts/setup_image_mcp.py --key-file /path/to/key.txt`
   - 除非必要，否则避免使用 `--key`，因为命令参数可能会进入 Shell 历史记录和进程列表
   - 默认写入 `~/.claude/settings.json`（用户私有，权限模式为 0600）
   - `--project` 标志表示选择使用项目的 `.mcp.json`（仅支持环境变量展开，
     并拒绝将明文密钥写入被版本控制跟踪的文件）
2. 验证：`python3 skills/blog-image/scripts/validate_image_setup.py`
3. 要求：
   - Node.js 18+（npx）
   - Google AI API 密钥，可在 https://aistudio.google.com/apikey 免费创建
   - 图片模型可能要求项目已启用结算功能
4. 该脚本将软件包版本固定为 `@ycse/nanobanana-mcp@1.1.1`。该 npm
   版本硬编码了将于 2026-06-25 停用的预览版图片模型 ID。
   当支持稳定版 ID 的软件包版本可用时，请同时更新设置脚本、验证脚本和本文档。

## 安全过滤器自动改写

当返回 `IMAGE_SAFETY` 或 `SAFETY` 时，不要放弃。自动改写并重试：

1. 识别可能的触发因素（暴力、公众人物、接近 NSFW 的内容，或过滤器过于谨慎）
2. 使用正向表述重新措辞——描述你想要什么，而不是要避免什么
3. 如果主体是人物，将其泛化（移除类似名人的具体特征）
4. 如果场景较为戏剧化，则缓和措辞："intense" → "focused"，"battle" → "competition"
5. 使用改写后的提示词重试（最多尝试 3 次，之后再向用户报告）

Google 承认过滤器“变得比我们预期谨慎得多”——无害的提示词有时也会被拦截。坚持改写并重试通常能够成功。

## 编辑，而非重新生成

如果图像已有 80% 符合要求，请使用 `gemini_chat` 进行对话式编辑，而不是从头重新生成。会话能够保持风格一致性，因此有针对性的编辑可以在修正问题的同时保留已有的理想效果。

**何时编辑，何时重新生成：**
- 颜色略有偏差 → 编辑（"shift the color temperature warmer"）
- 整体构图完全错误 → 使用修改后的需求说明重新生成
- 场景不错但光照不对 → 编辑（"change to golden hour lighting from the left"）
- 缺少某个细节 → 编辑（"add a steaming coffee cup on the desk"）

## 错误处理

| 错误 | 解决方法 |
|-------|-----------|
| MCP 未配置 | 运行 `/blog image setup` |
| API 密钥无效 | 在 https://aistudio.google.com/apikey 获取新密钥 |
| 受到速率限制（429） | 等待 60 秒后重试。在 https://ai.google.dev/gemini-api/docs/rate-limits 查看实时限制 |
| `IMAGE_SAFETY` | 自动改写（见上文）——第 2 层过滤器，不可配置 |
| `PROHIBITED_CONTENT` | 违反内容政策——该主题已被禁止。不可重试。 |
| `SAFETY` | 改写提示词——第 1 层过滤器 |
| 请求模糊 | 生成前先提出一个澄清问题 |
| 质量不佳 | 检查推理简报——可能缺少光照说明（这是影响质量的最大因素） |
| MCP 不可用（内部调用） | 静默返回——调用工作流会使用图库照片 |

## 参考文档

按需加载——不要在启动时全部加载：
- `references/prompt-engineering-blog.md` - 领域模式、六组件系统、博客模板
- `references/gemini-models.md` - 模型规格、速率限制、宽高比、定价
- `references/mcp-tools.md` - MCP 工具参数和响应格式