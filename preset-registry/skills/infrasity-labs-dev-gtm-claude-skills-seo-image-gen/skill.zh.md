---
name: seo-image-gen
description: "AI image generation for SEO assets: OG/social preview images, blog hero images, schema images, product photography, infographics. Powered by Gemini via nanobanana-mcp. Requires banana extension installed. Use when user says \"generate image\", \"OG image\", \"social preview\", \"hero image\", \"blog image\", \"product photo\", \"infographic\", \"seo image\", \"create visual\", \"image-gen\", \"favicon\", \"schema image\", \"pinterest pin\", \"generate visual\", \"banner\", or \"thumbnail\"."
argument-hint: "[og|hero|product|infographic|custom|batch] <description>"
user-invokable: true
compatibility: "Requires nanobanana MCP server"
metadata:
  category: seo
---
# SEO 图像生成：用于 SEO 资产的 AI 图像生成（扩展）

通过 banana 创意总监流水线，使用 Gemini 的图像生成功能生成可直接投入生产的 SEO 用图像。将 SEO 需求映射到经过优化的领域模式、宽高比和默认分辨率。

## 架构说明

此扩展基于 Claude Banana 构建，
后者是面向 Claude Code 的独立 AI 图像生成 Skill。

此 Skill 包含两个职责不同的组件：
- **SKILL.md**（本文件）：处理用于生成图像的交互式 `/seo image-gen` 命令
- **Agent**（`agents/seo-image-gen.md`）：在执行 `/seo audit` 期间启动的仅审计分析器，用于评估现有的 OG/社交媒体图像并制定生成计划（绝不会自动生成）

## 前置条件

此 Skill 要求安装 banana 扩展：
```bash
./extensions/banana/install.sh
```

**检查可用性：** 在使用任何图像生成工具之前，请通过检查 `gemini_generate_image` 或 `set_aspect_ratio` 工具是否可用来确认 MCP 服务器已连接。如果工具不可用，请告知用户尚未安装该扩展，并提供安装说明。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/seo image-gen og <description>` | 生成 OG/社交媒体预览图像（呈现 1200x630 的视觉效果） |
| `/seo image-gen hero <description>` | 博客主视觉图像（宽屏、富有戏剧性） |
| `/seo image-gen product <description>` | 产品摄影图像（简洁、白色背景） |
| `/seo image-gen infographic <description>` | 信息图视觉素材（竖版、数据密集） |
| `/seo image-gen custom <description>` | 使用完整的创意总监流水线生成自定义图像 |
| `/seo image-gen batch <description> [N]` | 生成 N 个变体（默认：3） |

## SEO 图像使用场景

每个使用场景都会映射到预配置的 banana 参数：

| 使用场景 | 宽高比 | 分辨率 | 领域模式 | 备注 |
|----------|-------------|------------|-------------|-------|
| **OG/社交媒体预览** | `16:9` | `1K` | 产品或 UI/Web | 简洁、专业、便于添加文字 |
| **博客主视觉** | `16:9` | `2K` | 电影或编辑 | 富有戏剧性和氛围感，具备编辑级品质 |
| **Schema 图像** | `4:3` | `1K` | 产品 | 简洁、描述清晰，用作 schema ImageObject |
| **社交媒体方形图** | `1:1` | `1K` | UI/Web | 针对平台优化的方形图像 |
| **产品照片** | `4:3` | `2K` | 产品 | 白色背景、影棚灯光 |
| **信息图** | `2:3` | `4K` | 信息图 | 数据密集、竖版布局 |
| **网站图标/图标** | `1:1` | `512` | 标志 | 简约、可缩放、易识别 |
| **Pinterest Pin 图** | `2:3` | `2K` | 编辑 | 纵向长卡片 |

## 生成流水线

对于每个生成请求：

1. **识别使用场景**：根据命令或上下文确定（og、hero、product 等）
2. **应用 SEO 默认值**：使用上方使用场景表中的默认值
3. **设置宽高比**：通过 `set_aspect_ratio` MCP 工具设置
4. **构建推理简报**：使用 banana 创意总监流水线：
   - 加载 `references/prompt-engineering.md` 以使用六要素系统
   - 应用领域模式的侧重点（主体 30%、风格 25%、背景 15% 等）
   - 做到具体且有冲击力：描述摄像机实际看到的内容
5. **生成**：通过 `gemini_generate_image` MCP 工具生成
6. **生成后 SEO 检查清单**（见下文）

### 检查预设

如果用户提到了某个品牌或已配置 SEO 预设：
```bash
python3 scripts/presets.py list
```
加载匹配的预设并将其应用为默认值。同时检查 `references/seo-image-presets.md`
中的 SEO 专用预设模板。

## 生成后 SEO 检查清单

每次成功生成后，指导用户完成以下操作：

1. **替代文本**：为生成的图像编写描述性强且包含丰富关键词的替代文本
2. **文件命名**：重命名为有利于 SEO 的格式：`keyword-description-widthxheight.webp`
3. **WebP 转换**：转换为 WebP 以获得最佳页面速度：
   ```bash
   magick output.png -quality 85 output.webp
   ```
4. **文件大小**：主视觉图像应控制在 200KB 以下，缩略图应控制在 100KB 以下
5. **Schema 标记**：为生成的图像建议使用 `ImageObject` schema：
   ```json
   {
     "@type": "ImageObject",
     "url": "https://example.com/images/keyword-description.webp",
     "width": 1200,
     "height": 630,
     "caption": "Descriptive caption with target keyword"
   }
   ```
6. **OG 元标签**：对于社交预览图像，提醒用户添加：
   ```html
   <meta property="og:image" content="https://example.com/images/og-image.webp" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta property="og:image:alt" content="Descriptive alt text" />
   ```

## 成本意识

图像生成需要付费。请保持透明：
- 生成前显示预估成本（尤其是批量生成时）
- 记录每次生成：`python3 scripts/cost_tracker.py log --model MODEL --resolution RES --prompt "brief"`
- 如果用户询问使用情况，运行 `cost_tracker.py summary`

大致成本（gemini-3.1-flash）：
- 512：约 $0.02/张
- 1K 分辨率：约 $0.04/张
- 2K 分辨率：约 $0.08/张
- 4K 分辨率：约 $0.16/张

## 模型路由

| 场景 | 模型 | 原因 |
|----------|-------|-----|
| OG 图像、社交预览图像 | `gemini-3.1-flash-image-preview` @ 1K | 速度快、成本效益高 |
| 主视觉图像、产品照片 | `gemini-3.1-flash-image-preview` @ 2K | 兼顾质量与细节 |
| 包含文本的信息图 | `gemini-3.1-flash-image-preview` @ 2K，thinking: high | 文本渲染效果更好 |
| 快速草稿 | `gemini-2.5-flash-image` @ 512 | 快速迭代 |

## 错误处理

| 错误 | 解决方法 |
|-------|-----------|
| MCP 未配置 | 运行 `./extensions/banana/install.sh` |
| API 密钥无效 | 在 https://aistudio.google.com/apikey 获取新密钥 |
| 受到速率限制（429） | 等待 60 秒后重试。免费层级：约 10 RPM / 约 500 RPD |
| `IMAGE_SAFETY` | 改写提示词——参阅 `references/prompt-engineering.md` 的安全部分 |
| MCP 不可用 | 回退方案：`python3 scripts/generate.py --prompt "..." --aspect-ratio "16:9"` |
| 扩展未安装 | 显示安装说明：`./extensions/banana/install.sh` |

## 跨 Skill 集成

- **seo-images**（分析）将结果提供给 **seo-image-gen**（生成）：来自 `/seo images` 的审计结果会识别缺失或质量较低的图像；使用这些发现来驱动 `/seo image-gen` 命令
- **seo-audit** 会启动 seo-image-gen **代理**（而非此 Skill），以分析整个站点的 OG/社交图像，并生成按优先级排序的生成计划
- **seo-schema** 可以使用生成的图像：生成后，建议添加指向新资源的 `ImageObject` schema 标记

## 参考文档

按需加载。不要在启动时全部加载：
- `references/prompt-engineering.md`：六组件系统、领域模式、模板
- `references/gemini-models.md`：模型规格、速率限制、功能
- `references/mcp-tools.md`：MCP 工具参数和响应
- `references/post-processing.md`：ImageMagick/FFmpeg 流水线方案
- `references/cost-tracking.md`：定价、使用量跟踪
- `references/presets.md`：品牌预设管理
- `references/seo-image-presets.md`：SEO 专用预设模板

## 响应格式

生成后，始终提供：
1. **图片路径**：保存位置
2. **精心设计的提示词**：展示发送给 API 的内容（用于教学）
3. **设置**：模型、宽高比、分辨率
4. **SEO 检查清单**：替代文本建议、文件命名、WebP 转换
5. **Schema 代码片段**：如适用，提供 ImageObject 或 og:image 标记