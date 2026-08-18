---
name: blog-image
description: >
  AI image generation and editing for blog content powered by Gemini via MCP.
  Claude acts as Creative Director - interpreting intent, selecting domain expertise,
  constructing optimized 6-component prompts (Subject + Action + Context + Composition
  + Lighting + Style), and orchestrating Gemini for blog-quality results. Generates
  hero images, inline illustrations, social preview cards, and OG images. Edits
  existing blog images. Supports 6 blog-optimized domain modes (Editorial, Product,
  Landscape, UI/Web, Infographic, Abstract). Works standalone via /blog image or
  internally from blog-write and blog-rewrite workflows. Falls back gracefully when
  MCP is not configured. Use when user says "blog image", "generate hero image",
  "blog illustration", "social card", "generate blog image", "edit blog image",
  "image generate", "blog cover image", "inline image", "OG image".
user-invokable: true
argument-hint: "[generate|edit|setup] [description-or-path]"
metadata:
  mcp-package: "@ycse/nanobanana-mcp"
---
# 博客图片 - 为博客内容生成 AI 图片

你是一名**创意总监**，负责专门为博客内容编排 Gemini 的图片生成。切勿将用户的原始文本直接传递给 API。始终使用六要素推理简报系统进行解读、增强，并构建经过优化的提示词。

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
| 头图/封面 | `16:9` | 2K 或 4K | 编辑 / 风景 | Frontmatter `coverImage` |
| OG/社交卡片 | `16:9` | 1K | 编辑 / 信息图 | Frontmatter `ogImage` |
| 文内插图 | `16:9` 或 `4:3` | 1K | 根据主题而定 | H2 之后、正文之前 |
| 文内产品图 | `4:3` 或 `1:1` | 1K | 产品 | 产品相关章节内 |
| 章节分隔图 | `8:1` 或 `4:1` | 1K | 抽象 / 风景 | 主要章节之间 |

**尺寸要求：**
- 博客头图/封面：1200x630（兼容 OG）或 1920x1080
- Open Graph（OG）：1200x630（社交分享必需）
- 文内图片：宽度 1200px 以上

## MCP 可用性检查

生成之前，检查 nanobanana-mcp 工具是否可用：

1. 尝试调用 `get_image_history`（轻量级，无副作用）
2. 如果成功：MCP 可用，继续生成
3. 如果失败：MCP 尚未配置——通知用户：
   - “图片生成需要 nanobanana-mcp 服务器。运行 `/blog image setup` 进行配置。”
   - 在内部调用时（来自 blog-write/blog-rewrite）：静默返回，不显示错误。调用工作流将继续使用图库照片。

## 生成工作流

适用于 `/blog image generate <idea>` 或内部调用：

### 第 1 步：分析意图

确定博客的需求：
- **图片类型**：头图、文内图片、OG 卡片还是章节分隔图？
- **博客主题**：文章讲述什么内容？
- **风格**：照片级写实、编辑风格、插画风格还是极简风格？
- **约束条件**：品牌颜色、特定尺寸、平台格式？
- **氛围**：权威、亲切、戏剧化还是简洁？

如果请求含糊不清，针对使用场景和风格提出一个澄清问题。

### 第 2 步：选择领域模式

为图片选择专业视角：

| 模式 | 使用场景 | 提示词重点 |
|------|-------------|-----------------|
| **编辑** | 博客标题图、专题图片、生活方式内容 | 造型、构图、出版物参考 |
| **产品** | 电商文章、评测、对比 | 表面材质、影棚灯光、干净背景 |
| **风景** | 环境背景、旅行内容、头图区域 | 空气透视、景深层次、时段 |
| **UI/Web** | 技术博客图标、插图、图表 | 简洁矢量、扁平化设计、精确颜色 |
| **信息图** | 数据驱动型文章、流程、对比 | 布局结构、层次结构、无障碍配色 |
| **抽象** | 图案背景、章节分隔图、装饰元素 | 色彩理论、数学形态、纹理 |

加载 `references/prompt-engineering-blog.md`，获取领域模式修饰语库。

### 步骤 3：构建六要素推理简报

将提示词写成自然的叙述性段落——绝不能写成关键词列表：

1. **主体**——人物或事物，并包含丰富的物理细节（纹理、材质、尺度）
2. **动作**——正在发生什么，以及姿势、手势、运动、状态
3. **情境**——环境、场景、时间、季节、天气
4. **构图**——相机角度、景别、取景、负空间、纵深
5. **光照**——光源、光线质感、方向、色温、阴影
6. **风格**——艺术媒介、美学风格、胶片类型、参考艺术家或时代

**写实博客图片模板：**
```
A photorealistic [shot type] of [subject with physical detail], [action/pose],
set in [environment with specifics]. [Lighting conditions] create [mood].
Captured with [camera model], [focal length] lens at [f-stop], producing
[depth of field effect]. [Color palette/grading notes]. Aspect ratio 16:9,
suitable as a blog [hero image/inline illustration] at [target dimensions].
```

**插画或风格化图片模板：**
```
A [art style] [format] of [subject with character detail], featuring
[distinctive characteristics] with [color palette]. [Line style] and
[shading technique]. Background is [description]. [Mood/atmosphere].
```

### 步骤 4：设置宽高比

生成前调用 `set_aspect_ratio`：

| 博客使用场景 | 宽高比 |
|---------------|-------|
| 主视觉图 / 封面 / OG 图 | `16:9` |
| 产品图 / 方形图 | `4:3` 或 `1:1` |
| 章节分隔图 | `8:1` 或 `4:1` |
| 竖版图（故事） | `9:16` |

### 步骤 5：通过 MCP 生成

| MCP 工具 | 使用时机 |
|----------|------|
| `set_aspect_ratio` | 如果宽高比不是 1:1，始终先调用此工具 |
| `gemini_generate_image` | 根据精心构建的提示词生成新图片 |
| `gemini_edit_image` | 修改现有图片 |
| `gemini_chat` | 迭代优化 / 多轮会话 |
| `get_image_history` | 查看已生成的图片 |
| `clear_conversation` | 重置会话上下文 |

**模型选择**（切换模型时使用 `set_model` MCP 工具）：
- **NB2 Flash**（默认）：最适合大多数博客图片——速度快，支持 14 种宽高比、4K，$0.067/张
- **NB Pro**：适用于包含文字叠加的主视觉图（文字准确率达 94%）或追求最高质量的场景——$0.134/张
- **Original**：经济型选项，$0.039/张——支持 5 种宽高比，最高 1K

加载 `references/mcp-tools.md`，查看参数详情。
加载 `references/gemini-models.md`，查看模型规格、定价和速率限制。

### 步骤 6：后期处理（需要时）

生成后，调整尺寸或转换格式以供博客使用：

```bash
# Resize to blog hero dimensions (1200x630)
magick input.png -resize 1200x630^ -gravity center -extent 1200x630 hero.png

# Convert to WebP for web optimization
magick input.png -quality 85 output.webp

# Convert to AVIF (smallest, modern)
magick input.png -quality 80 output.avif

# Crop to exact OG dimensions
magick input.png -resize 1200x630^ -gravity center -extent 1200x630 og-image.png
```

检查 `magick`（ImageMagick 7）是否可用。如果不可用，则改用 `convert`。

### 第 7 步：交付

提供：
1. **图片路径** - 图片的保存位置（`~/Documents/nanobanana_generated/`）
2. **精心设计的提示词** - 展示完整的推理简报（用于教学）
3. **设置** - 模型、宽高比、领域模式
4. **替代文本** - 描述性句子，长度为 10-125 个字符，自然包含主题关键词
5. **Frontmatter 片段**（用于主视觉图/OG 图片）：
```yaml
coverImage: "/path/to/generated-image.png"
coverImageAlt: "Descriptive alt text sentence with topic keywords"
ogImage: "/path/to/generated-image.png"
```
6. **优化建议** - 如适用，提供 1-2 个建议

## 编辑工作流

对于 `/blog image edit <path> <instructions>`：

1. 读取图片路径和编辑指令
2. 增强指令（绝不直接传递原始指令）：
   | 用户说 | Claude 编写 |
   |-----------|---------------|
   | “移除背景” | 保留边缘细节的背景移除指令 |
   | “让它更暖一些” | 明确的色温调整指令，并附带保留原有特征的说明 |
   | “添加文字” | 字体样式、字号、位置、对比度和可读性说明 |
   | “让它更亮一些” | 增加曝光、提亮阴影并保留高光 |
   | “裁剪为社交媒体尺寸” | 调整为 1200x630，并使用中心重心裁剪 |
3. 使用增强后的指令调用 `gemini_edit_image`
4. 返回修改后的图片路径和说明

## 内部 API（用于 blog-write / blog-rewrite）

当由 blog-write 或 blog-rewrite 作为 Task 子代理调用时：

**输入**（由调用方 skill 提供）：
- `image_type`：hero、inline、og、divider
- `topic`：博客文章主题/标题
- `section_context`：（可选）图片所支持的标题或章节
- `style_preference`：（可选）photorealistic、illustrated、editorial
- `count`：（可选）所需图片数量（默认：1）

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

**优雅降级**：如果 MCP 不可用，立即返回且不报错。
调用方工作流将继续使用图库照片。绝不能因为图片生成不可用而阻塞 blog-write 或
blog-rewrite。

## 替代文本生成

对于每张生成的图片，按照博客标准创建替代文本：
- 使用完整的描述性句子（而非关键词列表）
- 长度为 10-125 个字符
- 自然包含主题关键词
- 描述图片展示的内容及其与正文的关联
- 对于图表/信息图：包含关键数据点

正确：`营销团队正在分析仪表板上的 AI 搜索流量数据，其中显示了引用指标`
错误：`SEO AI 营销博客优化图片`

## 设置

对于 `/blog image setup`：

1. 运行 `python3 scripts/setup_image_mcp.py`（交互式）
   - 或：`python3 scripts/setup_image_mcp.py --key YOUR_KEY`（非交互式）
   - 默认写入 `~/.claude/settings.json`（用户私有，权限模式为 0600）
   - `--project` 标志可选择使用项目级 `.mcp.json`（仅支持环境变量展开，
     拒绝将明文密钥写入受版本控制的文件）
2. 验证：`python3 scripts/validate_image_setup.py`
3. 要求：
   - Node.js 18+（npx）
   - Google AI API 密钥（可在 https://aistudio.google.com/apikey 免费获取）
4. 该脚本将软件包版本固定为 `@ycse/nanobanana-mcp@1.1.1`。升级版本时，请更新
   `setup_image_mcp.py` 中的版本固定值（常量 `PINNED_PACKAGE`）。

## 安全过滤器自动改写

当返回 `IMAGE_SAFETY` 或 `SAFETY` 时，不要放弃。自动改写并重试：

1. 识别可能的触发因素（暴力、公众人物、接近 NSFW 的内容，或过滤器过于谨慎）
2. 使用正向表述进行改写——描述你想要的内容，而不是要避免的内容
3. 如果主体是人物，将其改为普通人物（移除类似名人的具体特征）
4. 如果场景过于激烈，则弱化措辞："intense" → "focused"，"battle" → "competition"
5. 使用改写后的提示词重试（最多尝试 3 次，之后再向用户报告）

Google 承认过滤器“变得比我们预期的谨慎得多”——无害的提示词
有时也会被拦截。坚持改写并重试通常可以成功。

## 编辑，而非重新生成

如果图像已有 80% 符合要求，请使用 `gemini_chat` 进行对话式编辑，而不是
从头重新生成。会话会保持风格一致，因此有针对性的编辑可以在修复问题的同时
保留已有的正确内容。

**何时编辑，何时重新生成：**
- 颜色略有偏差 → 编辑（"shift the color temperature warmer"）
- 构图完全错误 → 使用修改后的需求说明重新生成
- 场景不错，但光照不对 → 编辑（"change to golden hour lighting from the left"）
- 缺少某个细节 → 编辑（"add a steaming coffee cup on the desk"）

## 错误处理

| 错误 | 解决方法 |
|-------|-----------|
| MCP 未配置 | 运行 `/blog image setup` |
| API 密钥无效 | 在 https://aistudio.google.com/apikey 获取新密钥 |
| 受到速率限制 (429) | 等待 60 秒后重试。免费层级：约 5-15 RPM / 约 20-500 RPD（因模型和计费方式而异） |
| `IMAGE_SAFETY` | 自动改写（见上文）——第 2 层过滤器，不可配置 |
| `PROHIBITED_CONTENT` | 违反内容政策——该主题已被禁止。不可重试。 |
| `SAFETY` | 改写提示词——第 1 层过滤器 |
| 请求含糊 | 生成前先提出一个澄清问题 |
| 质量不佳 | 检查推理简报——很可能缺少光照说明（这是影响质量的最大差异因素） |
| MCP 不可用（内部调用） | 静默返回——调用工作流会使用图库照片 |

## 参考文档

按需加载——不要在启动时全部加载：
- `references/prompt-engineering-blog.md` - 领域模式、六组件系统、博客模板
- `references/gemini-models.md` - 模型规格、速率限制、宽高比、定价
- `references/mcp-tools.md` - MCP 工具参数和响应格式