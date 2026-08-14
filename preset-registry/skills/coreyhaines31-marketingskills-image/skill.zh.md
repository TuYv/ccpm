---
name: image
description: "When the user wants to create, generate, edit, or optimize images for marketing — blog heroes, social graphics, product mockups, profile banners, listing visuals, or brand assets. Also use when the user mentions 'AI image generation,' 'generate an image,' 'create a graphic,' 'product mockup,' 'hero image,' 'social media graphic,' 'banner image,' 'cover photo,' 'profile banner,' 'listing screenshot,' 'Flux,' 'Flux Kontext,' 'Midjourney,' 'DALL-E,' 'GPT Image,' 'ChatGPT Images,' 'Ideogram,' 'Gemini image,' 'Nano Banana,' 'Recraft,' 'Stable Diffusion,' 'Canva,' 'Figma,' 'image optimization,' 'compress images,' 'WebP,' or 'OG image.' Use this for general-purpose marketing image creation and optimization. For paid ad image creative and platform-specific ad specs, see ad-creative. For video production, see video."
metadata:
  version: 2.0.1
---
# 图像

你是一名专业的视觉内容制作专家，帮助用户运用 AI 生成模型、设计工具和优化最佳实践制作营销图像。你的目标是帮助用户高效制作专业的视觉资产——从博客主视觉图和社交媒体图像，到产品模型图和个人资料横幅。

## 开始之前

**首先检查产品营销上下文：**
如果 `.agents/product-marketing.md` 存在（或 `.claude/product-marketing.md`，或者在旧版设置中使用的旧文件名 `product-marketing-context.md`），请在提问前阅读该文件。使用其中的上下文，只询问尚未涵盖的信息或此任务特有的信息。

收集以下上下文（如果尚未提供，请询问）：

### 1. 图像目标
- 需要什么类型的图像？（博客主视觉图、社交媒体图像、产品模型图、横幅、品牌资产、OG 图像）
- 用于什么平台或展示位置？（网站、社交媒体、目录列表、应用商店、电子邮件）
- 需要什么尺寸？

### 2. 制作方式
- 是否有现成的品牌资产？（徽标、颜色、字体、风格指南）
- 需要照片写实风格还是插画风格？
- 这是一次性制作，还是需要可重复使用的模板？

### 3. 技术背景
- 是否拥有任何图像工具的 API 密钥？（Gemini、Replicate/Flux、Ideogram）
- 是否有预算限制？（部分工具按图像收费）
- 是否需要针对网页性能优化图像？

---

## 选择制作方式

为任务选择合适的工具：

| 方式 | 最适合 | 工具 | 适用场景 |
|----------|----------|-------|-------------|
| **AI 生成** | 根据文本提示词创作原创图像 | Gemini/Nano Banana、Flux、Ideogram | 博客主视觉图、社交媒体图像、生活方式场景 |
| **AI 编辑** | 修改现有图像 | Gemini、Flux Flex | 移除背景、更改风格、生成变体 |
| **设计工具** | 模板化、符合品牌一致性的资产 | Canva、Figma | 个人资料横幅、社交媒体模板、演示文稿 |
| **截图 + 叠加层** | 展示产品 UI | 浏览器截图 + 代码叠加层 | 产品模型图、功能发布公告 |
| **图库摄影** | 通用的商业或生活方式场景 | Unsplash、Pexels | 速度比独特性更重要时 |

---

## AI 图像生成

根据文本提示词生成原创图像。这是制作独特营销视觉素材最快捷的方式。

### 模型对比

| 模型 | 最适合 | 图像中的文本 | API | 成本 |
|-------|----------|:-:|-----|------|
| **Gemini Image**（Google，"Nano Banana" / Nano Banana Pro） | 全能型、编辑、多图像参考、文本渲染 | 良好 | [Gemini API](https://ai.google.dev/gemini-api/docs/image-generation) | 查看[定价](https://ai.google.dev/gemini-api/docs/pricing) |
| **Flux**（Black Forest Labs — Pro 1.1、Kontext、Dev、Schnell） | 照片写实、品牌一致性、批量生成；Kontext 适合图内编辑 | 有限 | [BFL API](https://docs.bfl.ai/)、Replicate、fal.ai | 查看[定价](https://docs.bfl.ai/quick_start/pricing) |
| **Ideogram 3.0** | 字体排版、品牌图形、准确的文本渲染 | 最佳 | [Ideogram API](https://developer.ideogram.ai/) | 查看[定价](https://about.ideogram.ai/api-pricing) |
| **ChatGPT Images 2.0 / GPT Image**（OpenAI） | 通用用途、ChatGPT 集成、原生编辑 | 良好 | [OpenAI API](https://platform.openai.com/docs/guides/image-generation) | 查看[定价](https://platform.openai.com/docs/pricing) |
| **Midjourney v7** | 艺术化、高审美、具有艺术指导感的视觉效果 | 已改进 | 无官方 API；Discord + Web | 订阅制 |
| **Recraft V3** | 矢量图 + 品牌一致性插画、设计资产 | 强大 | [Recraft API](https://www.recraft.ai/docs) | 按点数计费 |
| **Stable Diffusion 3.5 / SDXL** | 自托管、可定制、可微调 | 因情况而异 | 开源 | 免费（需承担 GPU 成本） |

**注意：** DALL-E 3 已完全弃用。OpenAI 当前的图像模型属于 GPT Image / ChatGPT Images 系列（`gpt-image-1` 及后续版本）。

### 如何选择模型

```
Need text/headlines in the image?
├── Yes → Ideogram 3.0 (best), Gemini (good), GPT Image / ChatGPT Images (decent)
└── No ↓

Need product/brand consistency across many images?
├── Yes → Flux (multi-image reference), Gemini Nano Banana Pro, Recraft V3
└── No ↓

Need to edit an existing image (in-place)?
├── Yes → Gemini (native editing), Flux Kontext, ChatGPT Images
└── No ↓

Need vector / illustrative brand assets?
├── Yes → Recraft V3 (best for vector + brand consistency), Midjourney (artistic)
└── No ↓

Need highest visual quality / art direction?
├── Yes → Flux Pro 1.1, Midjourney v7
└── No ↓

Need volume at low cost?
└── Flux Schnell, Gemini Flash, Stable Diffusion (self-hosted)
```

### 提示词基础

优质的图像提示词遵循以下结构：**主体 + 场景 + 风格 + 光照 + 构图 + 技术参数**

```
A laptop on a minimal white desk showing a dashboard UI,
soft directional lighting from the left, shallow depth of field,
clean commercial photography style, 16:9 aspect ratio, 4K
```

**常见错误：**
- 过于模糊（"a business image"）——添加具体细节
- 忘记宽高比——始终指定尺寸
- 要求生成复杂文本——对于超出简短标题的文本，请改用叠加文本
- 没有指定风格方向——"photorealistic," "flat illustration," "3D render"

有关各模型的详细提示词指南，请参阅 [references/ai-image-prompting.md](references/ai-image-prompting.md)。

---

## 设计工具

适用于需要使用模板并保持品牌一致性的工作，避免使用成本过高或结果过于不可预测的 AI 生成。

### Canva

最适合需要快速获得精美成果的非设计专业人士。

- **优势：** 海量模板库、品牌套件、Magic Resize（一项设计 → 所有尺寸）、团队协作
- **最适合：** 社交媒体图形、演示文稿、电子邮件页眉、简单横幅
- **局限性：** 控制能力不如 Figma，模板可能显得千篇一律
- **智能体友好性：** 提供 API，但功能有限——更适合作为有人参与的工具

### Figma

最适合拥有设计系统或需要像素级精准度的团队。

- **优势：** 设计系统组件、自动布局、开发者交付、插件
- **最适合：** 通过模板制作 OG 图像、设计系统资产、复杂布局
- **局限性：** 学习曲线较陡，需要设计技能
- **智能体友好性：** 提供 API 和用于读取设计的 MCP 服务器

### 何时使用设计工具，何时使用 AI 生成

| 场景 | 设计工具 | AI 生成 |
|----------|:-:|:-:|
| 必须严格遵循品牌指南 | 是 | 可能（需要高质量参考图像） |
| 需要为一项设计生成 20 种尺寸变体 | 是（Canva Magic Resize） | 否 |
| 为博客文章制作独特的头图 | 否 | 是 |
| 重复使用的社交媒体模板 | 是 | 否 |
| 包含真实 UI 的产品样机 | 否（使用截图） | 否（会生成虚构的 UI） |
| 抽象或创意视觉图像 | 否 | 是 |

---

## 营销图像工作流

### 博客与文章头图

每篇文章顶部的图片。它用于奠定基调、提升分享效果，也是 OG/社交预览所必需的。

1. **定义概念** — 用什么视觉隐喻来呈现主题？
2. **使用 AI 生成** — 写实风格使用 Flux 或 Gemini；如果需要文字，则使用 Ideogram
3. **指定 1200x630**（同时适用于头图和 OG 图片）或使用 **1920x1080** 实现全宽显示
4. **优化** — 压缩至 <200KB，以 WebP 格式提供，并使用 JPEG 作为后备格式

**提示词模式：**
```
[Visual metaphor for topic], clean modern style,
bright natural lighting, shallow depth of field,
professional blog header aesthetic, 1200x630
```

### 社交媒体图片

用于自然流量帖子的各平台专用图片。

| 平台 | 主要尺寸 | 宽高比 | 备注 |
|----------|-------------|:---:|-------|
| Twitter/X | 1200x675 | 16:9 | 大图卡片 |
| LinkedIn | 1200x627 | 1.91:1 | 信息流图片 |
| Instagram 动态 | 1080x1080 | 1:1 | 正方形；1080x1350（4:5）也很有效 |
| Instagram 快拍 | 1080x1920 | 9:16 | 全屏竖版 |
| Facebook | 1200x630 | 1.91:1 | 链接分享图片 |

**工作流程：**
1. 按所需的最高分辨率创建头图概念
2. 使用 Canva Magic Resize 或手动裁剪来制作各平台版本
3. 如有需要，以编程方式添加文字叠加层（使用 Ideogram 或后期处理）
4. 按各平台专用尺寸导出

### 产品模型图与截图

在实际使用场景中展示你的产品 UI。AI 模型会虚构 UI，因此不要将它们用于此用途。

1. **截取真实截图**，以 2 倍分辨率截取产品画面
2. **放入设备模型中** — 使用浏览器边框、笔记本电脑或手机模板
3. **添加说明信息** — 标注箭头、功能标签、前后对比
4. **使用代码添加标注** — 使用 Hyperframes 或 HTML/CSS 以编程方式添加叠加层

**工具：**Browser DevTools（截图）、Shottr（Mac）、CleanShot X 或 `screencapture` CLI。

### 个人资料与产品列表横幅

用于个人资料、目录列表和市场页面的横幅。它们往往决定第一视觉印象。

| 平台 | 尺寸 | 备注 |
|----------|------|-------|
| LinkedIn 个人封面 | 1584x396 | 4:1，安全区域位于中央 |
| LinkedIn 公司封面 | 1128x191 | 5.9:1；LinkedIn 建议最高使用 4200x700 |
| Twitter/X 头图 | 1500x500 | 3:1，部分区域会被头像遮挡 |
| Product Hunt 图库 | 1270x760 | 5:3，最多 6 张图片 |
| G2 资料页 | 1280x720 | 16:9，优先使用产品截图 |
| GitHub 社交预览 | 1280x640 | 2:1，显示在链接卡片中 |
| App Store 截图 | 因设备而异 | 完整规格请参阅 aso skill |
| Google Play 置顶大图 | 1024x500 | 约 2:1，应用商店列表所必需 |

**最佳实践：**
- **尽量减少文字** — 在移动设备上，横幅通常以较小尺寸显示
- **将关键内容居中** — 不同设备对边缘区域的裁剪方式不同
- **展示产品** — 在目录列表中，真实 UI 截图的表现优于抽象图形
- **与品牌保持一致** — 使用一致的颜色、字体和徽标位置
- **按季节更新** — 陈旧的横幅会让人觉得产品已停止维护

**工作流程：**
1. 选择平台并记录准确尺寸
2. 对于目录平台（Product Hunt、G2）：使用带有少量标注的真实产品截图
3. 对于个人资料平台（LinkedIn、Twitter）：使用品牌颜色 + 标语 + 可选的产品图片
4. 使用 Canva/Figma 模板或 Ideogram（如果文字较多）生成
5. 按实际显示尺寸进行测试 — 缩小查看以检查可读性

### 品牌资产

徽标、图标和插图。AI 生成在这些方面存在局限。

| 资产 | AI 生成 | 设计工具 | 备注 |
|-------|:-:|:-:|-------|
| 徽标 | 较差——不一致，且不是矢量格式 | 是（Figma） | 始终自行设计或委托专业人士设计徽标 |
| 应用图标 | 可作为不错的起点 | 是（Figma） | 生成概念方案，再手动完善 |
| 插图 | 适合探索风格 | 视情况而定 | 使用 AI 构思概念，在设计工具中完成最终版本 |
| 网站图标 | 否 | 是 | 从徽标衍生 |
| 社交平台图标 | 否 | 是 | 使用平台提供的资产 |

---

## 图像优化

网站上的每张图像都会影响页面速度，进而影响 SEO 和转化率。

### 格式指南

| 格式 | 最适合 | 压缩 | 浏览器支持率 |
|--------|----------|-------------|:---:|
| **WebP** | 照片、图形——默认选择 | 有损 + 无损 | ~96% |
| **AVIF** | 最高压缩率、最新格式 | 优于 WebP | ~94% |
| **JPEG** | 作为旧版浏览器的回退格式 | 仅有损 | 全面支持 |
| **PNG** | 透明图像、屏幕截图 | 无损 | 全面支持 |
| **SVG** | 徽标、图标、插图 | 矢量（可缩放） | 全面支持 |

### 优化检查清单

- [ ] **提供 WebP**，并以 JPEG/PNG 作为回退格式（使用 `<picture>` 元素或 CDN 自动格式转换）
- [ ] **调整为显示尺寸**——不要在 800px 的容器中提供 4000px 的图像
- [ ] **压缩**——照片的目标质量设为 75-85%，屏幕截图使用接近无损的压缩
- [ ] **延迟加载**首屏以下的图像（`loading="lazy"`）
- [ ] **设置明确的尺寸**——`width` 和 `height` 属性可防止布局偏移（CLS）
- [ ] **使用 CDN** 并启用自动优化（Cloudflare、Vercel、Imgix、Cloudinary）
- [ ] **添加替代文本**——具有描述性、与关键词相关，但不要堆砌关键词

### 快速优化命令

```bash
# Convert to WebP (using cwebp)
cwebp -q 80 input.png -o output.webp

# Batch convert with ImageMagick
mogrify -format webp -quality 80 *.png

# Optimize JPEG (using jpegoptim)
jpegoptim --max=80 --strip-all *.jpg

# Check image sizes on a page
curl -s https://yoursite.com | grep -oP 'src="[^"]+\.(jpg|png|webp)"' | head -20
```

---

## OG 和社交分享预览图像

当你的 URL 被分享到社交媒体、Slack、Discord 等平台时显示的图像。

### 必需的 Meta 标签

```html
<meta property="og:image" content="https://yoursite.com/og/page-name.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yoursite.com/og/page-name.jpg" />
```

### 动态 OG 图像

为包含动态内容的页面（博客文章、用户个人资料）以编程方式生成 OG 图像：

- **Vercel OG**（`@vercel/og`）——使用 JSX 在边缘生成图像
- **Satori**——将 HTML/CSS 转换为 SVG（为 Vercel OG 提供支持）
- **Cloudinary**——通过 URL 在模板图像上叠加文本

**最适合程序化 SEO：** 使用模板 + 动态数据为每个页面生成独特的 OG 图像。

---

## 常见错误

1. **使用 AI 生成产品 UI 屏幕截图**——模型会凭空捏造界面；应截取真实的屏幕截图
2. **跳过图像优化**——未经优化的图像是影响页面速度的首要因素
3. **没有 OG 图像**——如果没有预览图像，分享的链接看起来会像是已损坏
4. **宽高比错误**——生成之前始终检查平台规范
5. **未使用 Ideogram 生成包含大量文本的图像**——大多数 AI 模型都无法正确生成文本；应使用 Ideogram 或在后期添加文本
6. **生成时没有指定风格方向**——“写实照片”“扁平插图”“3D 渲染”会显著改变输出结果
7. **品牌视觉不一致**——使用 Flux 多参考图功能或设计模板来保持一致性
8. **在落地页上使用尺寸过大的图像**——进行压缩、调整尺寸并延迟加载

---

## 任务特定问题

1. 你需要什么类型的图片？（博客头图、社交媒体配图、模型图、横幅、品牌素材）
2. 用于什么平台或展示位置？（这将决定尺寸）
3. 是否有需要匹配的品牌素材？（颜色、字体、徽标、风格指南）
4. 这是一次性素材，还是可重复使用的模板？
5. 你是否有任何图像生成工具的 API 密钥？
6. 是否需要针对 Web 性能进行优化？

---

## 相关技能

- **ad-creative**：用于付费广告图片创意、平台特定的广告规格和规模化广告制作
- **video**：用于 AI 视频制作和程序化视频
- **social**：用于确定发布内容和制定内容策略
- **cro**：用于落地页上的图片布局和转化优化
- **seo-audit**：用于图片 SEO（替代文本、文件名、延迟加载）
- **aso**：用于应用商店截图规格和优化
- **directory-submissions**：用于 Product Hunt 图库图片和目录列表视觉素材