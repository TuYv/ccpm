---
name: seo-image-gen
description: "AI image generation for SEO assets: OG/social preview images, blog hero images, schema images, product photography, infographics. Powered by Gemini via nanobanana-mcp. Requires banana extension installed. Use when user says \"generate image\", \"OG image\", \"social preview\", \"hero image\", \"blog image\", \"product photo\", \"infographic\", \"seo image\", \"create visual\", \"image-gen\", \"favicon\", \"schema image\", \"pinterest pin\", \"generate visual\", \"banner\", or \"thumbnail\"."
argument-hint: "[og|hero|product|infographic|custom|batch] <description>"
user-invocable: true
license: MIT
compatibility: "Requires nanobanana MCP server"
metadata:
  author: AgriciDaniel
  version: "2.3.1"
  category: seo
---
# SEO Image Gen：用于 SEO 资产的 AI 图像生成（扩展）

使用 banana Creative Director pipeline 通过 Gemini 的图像生成功能，为 SEO 使用场景生成可用于生产环境的图像。将 SEO 需求映射到经过优化的领域模式、宽高比和分辨率默认值。

## 架构说明

此扩展基于 [Claude Banana](https://github.com/AgriciDaniel/banana-claude)，这是一个面向 Claude Code 的独立 AI 图像生成技能。

此技能由两个职责不同的组件组成：
- **SKILL.md**（本文件）：处理用于生成图像的交互式 `/seo image-gen` 命令
- **Agent**（`agents/seo-image-gen.md`）：在执行 `/seo audit` 时生成的、仅用于审计的分析器，用于评估现有 OG/社交图像并生成图像生成计划（绝不会自动生成图像）

## 前置条件

此技能要求安装 banana 扩展：
```bash
./extensions/banana/install.sh
```

**检查可用性：** 使用任何图像生成工具之前，请通过检查 `gemini_generate_image` 或 `set_aspect_ratio` 工具是否可用，确认 MCP server 已连接。如果工具不可用，请告知用户尚未安装该扩展，并提供安装说明。

## 快速参考

| 命令 | 功能 |
|---------|-------------|
| `/seo image-gen og <description>` | 生成 OG/社交预览图（1200x630 感觉） |
| `/seo image-gen hero <description>` | 生成博客 Hero 图（宽屏、戏剧性） |
| `/seo image-gen product <description>` | 生成产品摄影图（干净、白色背景） |
| `/seo image-gen infographic <description>` | 生成信息图视觉（竖版、数据密集） |
| `/seo image-gen custom <description>` | 使用完整的 Creative Director pipeline 生成自定义图像 |
| `/seo image-gen batch <description> [N]` | 生成 N 个变体（默认为：3） |

## SEO 图像使用场景

每种使用场景都映射到预配置的 banana 参数：

| 使用场景 | 宽高比 | 分辨率 | 领域模式 | 备注 |
|----------|-------------|------------|-------------|-------|
| **OG/社交预览** | `16:9` | `1K` | Product or UI/Web | 干净、专业、适合放置文本 |
| **博客 Hero 图** | `16:9` | `2K` | Cinema or Editorial | 戏剧性、富有氛围感、具备编辑级质量 |
| **Schema 图像** | `4:3` | `1K` | Product | 干净、描述性强，适用于 schema ImageObject |
| **社交方形图** | `1:1` | `1K` | UI/Web | 针对平台优化的方形图 |
| **产品照片** | `4:3` | `2K` | Product | 白色背景、摄影棚灯光 |
| **信息图** | `2:3` | `4K` | Infographic | 数据密集、竖向布局 |
| **Favicon/图标** | `1:1` | `512` | Logo | 极简、可缩放、易于识别 |
| **Pinterest Pin** | `2:3` | `2K` | Editorial | 高而窄的竖向卡片 |

## 生成流程

对于每个生成请求：

1. **识别使用场景**，依据命令或上下文确定（og、hero、product 等）
2. **应用 SEO 默认值**，使用上方使用场景表中的配置
3. **设置宽高比**，通过 `set_aspect_ratio` MCP tool 完成
4. **构建 Reasoning Brief**，使用 banana Creative Director pipeline：
   - 加载 `references/prompt-engineering.md` 以了解 6-component system
   - 应用领域模式的侧重点（Subject 30%、Style 25%、Context 15% 等）
   - 必须具体且有画面感：描述摄像机所看到的内容
5. **生成图像**，通过 `gemini_generate_image` MCP tool 完成
6. **生成后的 SEO 检查清单**（见下文）

### 检查预设

如果用户提及品牌或已配置 SEO 预设：
```bash
# Use the installed Banana MCP/tool configuration to list presets.
```
加载匹配的预设并将其应用为默认值。同时检查 `references/seo-image-presets.md`
中的 SEO 专用预设模板。

## 生成后的 SEO 检查清单

每次成功生成后，指导用户完成以下事项：

1. **替代文本**：为生成的图像编写描述性、包含丰富关键词的替代文本
2. **文件命名**：重命名为 SEO 友好的格式：`keyword-description-widthxheight.webp`
3. **WebP 转换**：转换为 WebP 以优化页面加载速度：
   ```bash
   magick output.png -quality 85 output.webp
   ```
4. **文件大小**：主视觉图像目标小于 200KB，缩略图目标小于 100KB
5. **结构化数据标记**：建议为生成的图像添加 `ImageObject` 结构化数据：
   ```json
   {
     "@type": "ImageObject",
     "url": "https://example.com/images/keyword-description.webp",
     "width": 1200,
     "height": 630,
     "caption": "Descriptive caption with target keyword"
   }
   ```
6. **OG 元标签**：对于社交预览图像，提醒添加：
   ```html
   <meta property="og:image" content="https://example.com/images/og-image.webp" />
   <meta property="og:image:width" content="1200" />
   <meta property="og:image:height" content="630" />
   <meta property="og:image:alt" content="Descriptive alt text" />
   ```

## 成本意识

图像生成需要付费。请保持透明：
- 生成前显示预计成本，尤其是批量生成时
- 在可用时，将每次生成记录到已安装的 Banana MCP/tool ledger 中
- 如果用户询问使用情况，使用已安装的 Banana MCP/tool usage summary

近似成本：
- 在引用价格前，先在已安装的 MCP/tool 配置中核实当前定价

## 模型路由

| 场景 | 模型 | 原因 |
|----------|-------|-----|
| OG 图像、社交预览 | 已安装的 MCP/tool 默认 @ 1K | 快速且经济高效 |
| 主视觉图像、产品照片 | 已安装的 MCP/tool 质量模型 @ 2K | 质量与细节兼顾 |
| 包含文本的信息图 | 已安装的 MCP/tool 文本能力模型 @ 2K，若支持则使用 thinking: high | 文本渲染效果更好 |
| 快速草稿 | 已安装的 MCP/tool 草稿模型 @ 512 | 快速迭代 |

## 错误处理

| 错误 | 解决方案 |
|-----------|-----------|
| MCP 未配置 | 运行 `./extensions/banana/install.sh` |
| API 密钥无效 | 在 https://aistudio.google.com/apikey 获取新密钥 |
| 受到速率限制 (429) | 等待 60 秒后重试。免费层级：约 10 RPM / 约 500 RPD |
| `IMAGE_SAFETY` | 修改提示词措辞 - 请参阅 `references/prompt-engineering.md` 的 Safety 部分 |
| MCP 不可用 | 使用 `./extensions/banana/install.sh` 配置 MCP；claude-seo 不提供本地生成备用脚本 |
| 扩展未安装 | 显示安装说明：`./extensions/banana/install.sh` |

## 跨技能集成

- **seo-images**（分析）为 **seo-image-gen**（生成）提供输入：`/seo images` 的审计结果会识别缺失或低质量的图像；使用这些发现来驱动 `/seo image-gen` 命令
- **seo-audit** 会生成 seo-image-gen **agent**（而非此技能）来分析整个网站中的 OG/社交图像，并生成按优先级排序的生成计划
- **seo-schema** 可以使用生成的图像：生成后，建议添加指向新资源的 `ImageObject` 结构化数据标记

## 参考文档

按需加载。启动时不要全部加载：
- `references/prompt-engineering.md`：6-component system、domain modes、templates
- `references/gemini-models.md`：Model specs、rate limits、capabilities
- `references/mcp-tools.md`：MCP tool parameters and responses
- `references/post-processing.md`：ImageMagick/FFmpeg pipeline recipes
- `references/cost-tracking.md`：Pricing、usage tracking
- `references/presets.md`：Brand preset management
- `references/seo-image-presets.md`：SEO-specific preset templates

## 响应格式

生成后，始终提供：
1. **图片路径**：保存位置
2. **构建的提示词**：展示发送给 API 的内容（便于学习）
3. **设置**：模型、宽高比、分辨率
4. **SEO 检查清单**：alt 文本建议、文件命名、WebP 转换
5. **Schema 代码片段**：适用时提供 `ImageObject` 或 `og:image` 标记