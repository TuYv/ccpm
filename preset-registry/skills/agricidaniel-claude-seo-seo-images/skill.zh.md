---
name: seo-images
description: >
  Image optimization analysis for SEO and performance. Checks alt text, file
  sizes, formats, responsive images, lazy loading, CLS prevention, image SERP
  rankings (via DataForSEO), and image file optimization (WebP/AVIF conversion,
  IPTC/XMP metadata injection). Use when user says "image optimization",
  "alt text", "image SEO", "image size", "image audit", "optimize images",
  "image metadata", "image SERP", "convert to webp", or "image file optimize".
user-invocable: true
argument-hint: "[url]"
license: MIT
metadata:
  author: AgriciDaniel
  version: "2.2.5"
  category: seo
---
# 图像优化分析

## 检查项

### 替代文本
- 所有 `<img>` 元素均存在（装饰性图像除外：`role="presentation"`）
- 描述性：描述图像内容，而不是使用 "image.jpg" 或 "photo"
- 在自然的情况下包含相关关键词，避免关键词堆砌
- 长度：10-125 个字符

**良好示例：**
- "修理厨房水槽水龙头的专业水管工"
- "红色 2024 款丰田凯美瑞轿车前视图"
- "现代办公室会议室中的团队会议"

**不良示例：**
- "image.jpg"（文件名，而非描述）
- "plumber plumbing plumber services"（关键词堆砌）
- "Click here"（没有描述性）

### 文件大小

**按图像类别划分的分级阈值：**

| 图像类别 | 目标 | 警告 | 严重 |
|----------------|--------|---------|----------|
| 缩略图 | < 50KB | > 100KB | > 200KB |
| 内容图像 | < 100KB | > 200KB | > 500KB |
| Hero/横幅图像 | < 200KB | > 300KB | > 700KB |

在不损失质量的情况下，尽可能建议压缩至目标阈值。

### 格式
| 格式 | 浏览器支持率 | 使用场景 |
|--------|-----------------|----------|
| WebP | 97%+ | 默认推荐 |
| AVIF | 92%+ | 压缩效果最佳，较新 |
| JPEG | 100% | 照片的后备格式 |
| PNG | 100% | 带透明效果的图形 |
| SVG | 100% | 图标、徽标、插图 |

建议优先使用 WebP/AVIF，而不是 JPEG/PNG。检查是否存在带格式回退的 `<picture>` 元素。

#### 推荐的 `<picture>` 元素模式

采用渐进增强，优先使用效率最高的格式：

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Descriptive alt text" width="800" height="600" loading="lazy" decoding="async">
</picture>
```

浏览器将使用第一个受支持的格式。当前浏览器支持率：AVIF 93.8%，WebP 95.3%。

#### JPEG XL：新兴格式

第三方报告和 Wikipedia 描述称，基于 Rust 的 JPEG XL 解码器已随 Chrome 145 稳定版（2026-02-10）发布，但需要启用 `chrome://flags/#enable-jxl-image-format` 标志，且默认未启用；在事实资料包中未检索到 Google 官方确认。由于默认支持尚未得到确认，目前它还不适合用于生产环境的 Web 交付。继续提供 AVIF/WebP，并以 JPEG 作为回退格式，同时持续关注其发展。

### 响应式图像
- 使用 `srcset` 属性提供多种尺寸
- 使用与布局断点匹配的 `sizes` 属性
- 针对设备像素比提供适当的分辨率

```html
<img
  src="image-800.jpg"
  srcset="image-400.jpg 400w, image-800.jpg 800w, image-1200.jpg 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
  alt="Description"
>
```

### 延迟加载
- 对首屏以下的图像使用 `loading="lazy"`
- 不要对首屏或 Hero 图像使用延迟加载（会损害 LCP）
- 检查使用的是原生延迟加载还是基于 JavaScript 的延迟加载

```html
<!-- Below fold - lazy load -->
<img src="photo.jpg" loading="lazy" alt="Description">

<!-- Above fold - eager load (default) -->
<img src="hero.jpg" alt="Hero image">
```

#### 检测到的延迟加载方法（`lazy_method` 字段）

`claude-seo run parse_html.py` 通过每个图像条目中的
`lazy_method` 字段对图像的延迟加载机制进行分类。共有五个值：

| `lazy_method` | 检测到的信号 | 常见技术栈 |
|---|---|---|
| `native` | `loading="lazy"` HTML 属性 | 现代浏览器、纯 HTML |
| `perfmatters` | `data-perfmatters-src`/`-srcset` 或类 `perfmatters-lazy` | WordPress + Perfmatters 插件 |
| `ewww` | `data-ewww-src` / `data-eio` 或类 `lazyload-eio` | WordPress + EWWW Image Optimizer |
| `js-generic` | `data-src` / `data-lazy-src` / `data-original` / `data-srcset` 或类 `lazyload`/`lazyloaded`/`lazy` | Lazysizes、vanilla-lazyload、jQuery 插件 |
| `none` | 没有属性或类信号 | 页面未对该图像启用延迟加载 |

审核图像 SEO 时，应将 `lazy_method` 与 `loading` 一起报告，以便用户了解其网站是否使用了由 JS 驱动的延迟加载器（在这种情况下，原生的
`loading="lazy"` 属性是有意缺失的，并不代表发生了回归）。

### LCP 图像使用 `fetchpriority="high"`

为 hero/LCP 图像添加 `fetchpriority="high"`，以便在浏览器的网络队列中优先下载该图像：

```html
<img src="hero.webp" fetchpriority="high" alt="Hero image description" width="1200" height="630">
```

**重要：**不要对首屏/LCP 图像进行延迟加载。在 LCP 图像上使用 `loading="lazy"` 会直接损害 LCP 分数。仅对首屏以下的图像使用 `loading="lazy"`。

### 非 LCP 图像使用 `decoding="async"`

为非 LCP 图像添加 `decoding="async"`，以防止图像解码阻塞主线程：

```html
<img src="photo.webp" alt="Description" width="600" height="400" loading="lazy" decoding="async">
```

### CLS 防范
- 为所有 `<img>` 元素设置 `width` 和 `height` 属性
- 使用 `aspect-ratio` CSS 作为替代方案
- 标记未设置尺寸的图像

```html
<!-- Good - dimensions set -->
<img src="photo.jpg" width="800" height="600" alt="Description">

<!-- Good - CSS aspect ratio -->
<img src="photo.jpg" style="aspect-ratio: 4/3" alt="Description">

<!-- Bad - no dimensions -->
<img src="photo.jpg" alt="Description">
```

### 文件名
- 描述性命名：使用 `blue-running-shoes.webp`，而不是 `IMG_1234.jpg`
- 使用连字符和小写字母，不使用特殊字符
- 包含相关关键词

### CDN 使用情况
- 检查图像是否通过 CDN 提供（不同域名、CDN 标头）
- 对图像较多的网站推荐使用 CDN
- 检查边缘缓存标头

## 输出

### 图像审核摘要

| 指标 | 状态 | 数量 |
|--------|--------|-------|
| 图像总数 | - | XX |
| 缺少 Alt 文本 | ❌ | XX |
| 过大（>200KB） | ⚠️ | XX |
| 格式错误 | ⚠️ | XX |
| 未设置尺寸 | ⚠️ | XX |
| 未进行延迟加载 | ⚠️ | XX |

### 优先优化列表

按文件大小影响排序（节省空间最多的优先）：

| 图像 | 当前大小 | 格式 | 问题 | 预计节省 |
|-------|--------------|--------|--------|--------------|
| ... | ... | ... | ... | ... |

### 建议
1. 将 X 个图像转换为 WebP 格式（预计节省 XX KB）
2. 为 X 个图像添加 Alt 文本
3. 为 X 个图像添加尺寸
4. 为 X 个首屏以下图像启用延迟加载
5. 压缩 X 个过大的图像

---

## 图片 SERP 分析

当 DataForSEO MCP 可用时，使用竞争数据增强图片审计。

### `/seo images serp <keyword>`

将页面上的图片与 Google 图片 SERP 排名进行交叉比对。

**工作流程：**
1. 通过 `serp_google_images_live_advanced`（depth=100）获取 Google 图片结果
2. 提取：顶级域名、图片类型、alt 文本模式
3. 输出竞争对手图片 SERP 格局

**输出：**

| 排名 | 域名 | 标题/Alt | 图片 URL | 页面 URL |
|------|--------|-----------|-----------|----------|
| 1 | example.com | "蓝色跑鞋..." | .../shoes.webp | /products/... |

**分析包括：**
- **域名主导地位**：哪些网站拥有最多的图片排名位置（按数量排列的前 10 名）
- **Alt 文本模式**：排名靠前图片中常见的标题/alt 文本模式
- **格式分布**：排名靠前结果中 WebP 与 JPEG、PNG 的分布情况
- **机会评分**：拥有页面排名但没有图片展现的关键词

如果 DataForSEO MCP 不可用，请告知用户并建议安装扩展。

---

## 图片文件优化

针对 SEO 优化图片文件：格式转换、元数据注入、压缩。

### `/seo images optimize <path>`

优化用于 Web 和 SEO 的图片文件。转换为 WebP/AVIF，注入 IPTC
元数据，进行压缩，并生成响应式变体。

**使用的工具（按优先顺序）：**
- `exiftool` -- EXIF/IPTC/XMP 读取/写入（安装：`sudo apt install libimage-exiftool-perl`）
- `cwebp` -- WebP 转换（安装：`sudo apt install webp`）
- ImageMagick `convert` -- 格式转换、调整大小（大多数系统已预安装）
- FFmpeg -- 格式转换备用工具（已预安装）

**运行前：** 使用 `which exiftool cwebp convert ffmpeg` 检查哪些工具可用。

### 格式转换

在保留元数据的同时，将图片转换为现代格式：

```bash
# WebP（推荐默认格式）- 保留元数据
cwebp -q 82 -metadata all input.jpg -o output.webp

# 通过 ImageMagick 使用 WebP（未安装 cwebp 时的备用方案）
convert input.jpg -quality 82 output.webp

# 通过 FFmpeg 使用 AVIF（编码速度较慢，压缩效果最佳）
ffmpeg -i input.jpg -c:v libaom-av1 -crf 30 -still-picture 1 output.avif

# 响应式变体（400w、800w、1200w）
convert input.jpg -resize 400x -quality 82 image-400.webp
convert input.jpg -resize 800x -quality 82 image-800.webp
convert input.jpg -resize 1200x -quality 82 image-1200.webp
```

### 元数据注入（用于 Google 图片展示的 IPTC）

Google 图片会在搜索结果中展示 IPTC Creator、Credit Line 和 Copyright。
这**不是排名因素**，但可以改善 Google 图片中的展示效果和品牌归属标识。

**使用 exiftool（首选）：**
```bash
# 读取所有元数据
exiftool image.jpg

# 注入用于 Google 图片富结果的 IPTC + XMP 元数据
exiftool \
  -IPTC:ObjectName="Product Photo Description" \
  -IPTC:Caption-Abstract="Detailed image description" \
  -IPTC:By-line="Brand Name Photography" \
  -IPTC:Credit="Brand Name" \
  -IPTC:CopyrightNotice="Copyright 2026 Brand Name" \
  -IPTC:Source="brandname.com" \
  -XMP:Title="Product Photo Description" \
  -XMP:Description="Detailed image description" \
  -XMP:Creator="Brand Name Photography" \
  -XMP:Rights="Copyright 2026 Brand Name" \
  image.jpg

# 批量向目录中的所有图片注入元数据
exiftool -overwrite_original \
  -IPTC:By-line="Brand Name" \
  -IPTC:CopyrightNotice="Copyright 2026 Brand Name" \
  *.jpg *.webp *.png
```

**使用 ImageMagick（备用方案）：**
```bash
identify -verbose image.jpg | head -50

convert input.jpg \
  -set comment "Product Photo Description" \
  -set IPTC:2:80 "Brand Name Photography" \
  -set IPTC:2:116 "Copyright 2026 Brand Name" \
  output.jpg
```

注意：WebP 支持 EXIF 和 XMP，但原生不支持 IPTC。对于 WebP 文件，
请使用 XMP 字段而不是 IPTC。exiftool 会自动处理此转换。

### AI 生成的图片：`DigitalSourceType`（Merchant Center 要求）

对于通过生成式 AI 制作的产品图片，**Google Merchant Center 要求**
IPTC `DigitalSourceType: TrainedAlgorithmicMedia` 元数据。这是一项
运营政策要求，而不是排名因素：对于 AI 生成图像，缺少此标签的 feed
可能会被拒绝。

主要来源（Merchant Center AI 生成内容政策）：
https://support.google.com/merchants/answer/14743464
（ai-optimization-guide 未记录 DigitalSourceType/IPTC/Merchant 标记。）

**审计命令：**

```bash
# Audit a directory for the IPTC label (counts: missing, ai, captured, etc.)
claude-seo run iptc_ai_label.py audit ./images/ --json

# Audit a single image
claude-seo run iptc_ai_label.py audit ./hero.webp --json

# Inject the AI label into an image
claude-seo run iptc_ai_label.py inject ./ai-hero.webp \
    --source-type trainedAlgorithmicMedia

# Other vocabulary values:
#   compositeSynthetic               (mix of captured + AI elements)
#   algorithmicMedia                 (created purely by algorithm, NOT from sampled training data)
#   compositeWithTrainedAlgorithmicMedia (e.g. AI inpainting/outpainting over real media)
#   digitalCapture                   (fully captured photograph)
```

**原始 exiftool 等效命令**（用于临时操作）：

```bash
# Inject manually
exiftool \
  -XMP-iptcExt:DigitalSourceType="https://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia" \
  ai-generated-product.jpg

# Audit: find images missing the label across a directory
exiftool -if 'not $XMP-iptcExt:DigitalSourceType' \
  -filename -DigitalSourceType *.jpg *.webp *.png
```

Google 会提取以下 IPTC `DigitalSourceType` 值：
- `trainedAlgorithmicMedia`：完全由 AI 生成（扩散模型产品图像请使用此值）
- `compositeSynthetic`：混合了拍摄元素和 AI 生成元素
- `algorithmicMedia`：完全由算法创建，**不是**基于采样训练数据生成
- `compositeWithTrainedAlgorithmicMedia`：经过训练的算法媒体与其他媒体的合成（例如在真实照片上进行 AI 修复/扩展）
- `digitalCapture`：完全由相机拍摄的照片（注意：`digitalCapture` **不在**
  Google 提取值列表中，但它是有效的 IPTC 值）

> **来源信号（面向消费者）：** **SynthID** 水印和 **C2PA**
> Content Credentials 正逐渐成为识别 AI 媒体的信号。除非已从当前的 Google 官方来源进行验证，否则应将
> 产品界面的覆盖范围视为可能发生变化。
> 这是检测/透明度机制，**不是**除 IPTC DigitalSourceType 之外 Merchant feed 还必须包含的额外字段。

> **可授权图片：**要获得 Licensable 徽章，请提供以下任一项：结构化数据（包含 `license` 属性和用于 “Get this image” 链接的 `acquireLicensePage` 的 `ImageObject`），或嵌入的 IPTC 照片元数据（Licensor URL / Web Statement of Rights）。为 ImageObject 标记交叉链接 `seo-schema`。

> **发现说明：**图片发现现在已扩展到 Lens / AI Mode / Circle to Search 的**视觉搜索分发**（Gemini 多模态场景/对象理解），因此图片会通过场景、对象和材质被发现，而不仅仅依赖 alt 文本。目前尚无新的已发布图片 SEO 优化手段；请继续使用描述性 alt 文本 + 干净的结构化数据。

当运行 `/seo images optimize` 处理 AI 生成的资源时，请提示用户确认来源类型，并自动注入匹配的 IPTC 值。

对于 **AI 生成的产品标题和描述**，Google Merchant Center 还要求在 feed 中单独指定并标注 AI 生成的文本。这项要求在 feed 层执行，而非页面层；请在与 `seo-ecommerce` 的交叉引用中标记这一点。

### 元数据审计

```bash
# Quick audit with exiftool
exiftool -IPTC:all -XMP:all -EXIF:ImageDescription image.jpg

# Batch audit - find images missing IPTC Creator
exiftool -if 'not $IPTC:By-line' -filename *.jpg *.webp *.png
```

### 完整优化流程

要实现最大程度的图片 SEO，请对每张图片运行以下流程：

1. **审计现有元数据**：`exiftool -IPTC:all -XMP:all image.jpg`
2. **注入 IPTC/XMP 元数据**：Creator、Copyright、Description
3. **转换为 WebP**：`cwebp -q 82 -metadata all image.jpg -o image.webp`
4. **生成响应式变体**：400w、800w、1200w
5. **验证元数据已保留**：`exiftool image.webp`
6. **生成 `<picture>` HTML**：AVIF > WebP > JPEG 回退链

### 对 Google 图片搜索重要与不重要的因素

| 因素 | 影响 | 设置位置 |
|--------|--------|--------------|
| Alt 文本 | **关键**（排名） | HTML `<img alt="">` |
| 文件名 | **高**（排名） | 文件系统（描述性、使用连字符） |
| 页面上下文 | **高**（排名） | 周围的 HTML 内容 |
| 文件大小/速度 | **中等**（通过 CWV 间接影响） | 压缩 + 格式转换 |
| IPTC Creator/Copyright | **低**（仅用于显示） | 图片文件元数据 |
| EXIF 相机数据 | 无 | 与 SEO 无关 |
| IPTC Keywords | 无 | Google 会忽略这些 |

---

## 错误处理

| 场景 | 操作 |
|----------|--------|
| URL 无法访问 | 报告包含状态码的连接错误。建议验证 URL，并检查网站是否要求身份验证。 |
| 页面上未找到图片 | 报告未检测到任何 `<img>` 元素。建议检查图片是否通过 JavaScript 或 CSS background-image 加载。 |
| 图片位于 CDN 后或需要身份验证 | 说明无法直接访问图片文件以分析其大小。报告可用的元数据（来自标记的 alt 文本、尺寸、格式），并标记无法访问的资源。 |
| 未安装 exiftool | 使用 ImageMagick 作为元数据处理的回退方案。建议：`sudo apt install libimage-exiftool-perl` |
| 未安装 cwebp | 使用 ImageMagick 或 FFmpeg 作为 WebP 转换的回退方案。建议：`sudo apt install webp` |
| DataForSEO MCP 不可用 | 跳过 Image SERP Analysis 部分。注明扩展未安装。 |