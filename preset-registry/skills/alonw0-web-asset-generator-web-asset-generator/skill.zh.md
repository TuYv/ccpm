---
name: web-asset-generator
description: Generate web assets including favicons, app icons (PWA), and social media meta images (Open Graph) for Facebook, Twitter, WhatsApp, and LinkedIn. Use when users need icons, favicons, social sharing images, or Open Graph images from logos or text slogans. Handles image resizing, text-to-image generation, and provides proper HTML meta tags.
---
# Web 资源生成器

根据徽标或文字标语生成专业的 Web 资源，包括网站图标、应用图标和社交媒体元图像。

## 快速开始

当用户请求 Web 资源时：

1. **如果需求未明确，请使用 AskUserQuestion 工具进行确认**：
   - 他们需要哪类资源（网站图标、应用图标、社交媒体图像或全部）
   - 他们是否有源素材（徽标图像或文字/标语）
   - 对于基于文字的图像：颜色偏好

2. **检查源素材**：
   - 如果用户上传了图像：将其用作源素材
   - 如果用户提供了文字/标语：生成基于文字的图像

3. **运行相应的脚本**：
   - 网站图标/图标：`scripts/generate_favicons.py`
   - 社交媒体图像：`scripts/generate_og_images.py`

4. **向用户提供生成的资源和 HTML 标签**

## 使用交互式问题

**重要**：始终使用 AskUserQuestion 工具收集需求，而不是使用纯文本提问。这样可以通过可视化选择界面提供更好的用户体验。

### 为什么使用 AskUserQuestion？

✅ **可视化界面**：用户会看到可点击的选项块/标签，无需输入回复
✅ **更快捷**：点击即可选择，无需输入完整答案
✅ **更清晰**：说明文字会解释每个选项的含义
✅ **错误更少**：避免自由文本输入导致的拼写错误或误解
✅ **更专业**：与现代 Claude Code 体验保持一致

### 示例流程

**用户请求**：“我需要 Web 资源”

**Claude 使用 AskUserQuestion**（而不是纯文本）：
```
What type of web assets do you need?                    [Asset type]
○ Favicons only - Browser tab icons (16x16, 32x32, 96x96) and favicon.ico
○ App icons only - PWA icons for iOS/Android (180x180, 192x192, 512x512)
○ Social images only - Open Graph images for Facebook, Twitter, WhatsApp, LinkedIn
● Everything - Complete package: favicons + app icons + social images
```

用户点击 → Claude 立即知道要生成什么

### 问题模式

以下是在各种场景中使用的标准问题模式。复制其结构并根据需要进行调整。

### 问题模式 1：资源类型选择

当用户的请求含糊不清时（例如，“创建 Web 资源”“我需要图标”），使用 AskUserQuestion：

**问题**：“你需要哪类 Web 资源？”
**标题**：“资源类型”
**选项**：
- **“仅网站图标”** - 说明：“浏览器标签页图标（16x16、32x32、96x96）和 favicon.ico”
- **“仅应用图标”** - 说明：“适用于 iOS/Android 的 PWA 图标（180x180、192x192、512x512）”
- **“仅社交媒体图像”** - 说明：“适用于 Facebook、Twitter、WhatsApp、LinkedIn 的 Open Graph 图像”
- **“全部”** - 说明：“完整资源包：网站图标 + 应用图标 + 社交媒体图像”

### 问题模式 2：源素材

当资源类型已确定但源素材不明确时：

**问题**：“你将提供什么源素材？”
**标题**：“来源”
**选项**：
- **“徽标图像”** - 说明：“我已有或将上传徽标/图像文件”
- **“表情符号”** - 说明：“根据表情符号字符生成网站图标”
- **“文字/标语”** - 说明：“仅根据文字创建图像”
- **“徽标 + 文字”** - 说明：“将徽标与文字叠加组合（用于社交媒体图像）”

### 问题模式 3：平台选择（用于社交媒体图片）

当用户请求社交媒体图片但未指定平台时：

**问题**：“你需要为哪些社交媒体平台生成图片？”
**标题**：“平台”
**多选**：true
**选项**：
- **“Facebook/WhatsApp/LinkedIn”** - 描述：“标准的 1200x630 Open Graph 格式”
- **“Twitter”** - 描述：“用于大图卡片的 1200x675（16:9 比例）”
- **“所有平台”** - 描述：“生成所有变体，包括方形格式”

### 问题模式 4：颜色偏好（用于基于文本的图片）

生成基于文本的社交媒体图片时：

**问题**：“你的社交媒体图片应使用哪些颜色？”
**标题**：“颜色”
**选项**：
- **“我会提供颜色”** - 描述：“让我为品牌颜色指定确切的十六进制颜色代码”
- **“默认主题”** - 描述：“使用默认紫色背景（#4F46E5）和白色文本”
- **“从徽标中提取”** - 描述：“从上传的徽标中自动检测品牌颜色”
- **“自定义渐变”** - 描述：“让我选择渐变颜色”

### 问题模式 5：图标类型确认

当用户说“创建图标”或“生成图标”时（含义不明确）：

**问题**：“你需要哪种图标？”
**标题**：“图标类型”
**选项**：
- **“网站 favicon”** - 描述：“浏览器标签页中的小图标”
- **“应用图标（PWA）”** - 描述：“移动设备主屏幕图标”
- **“两者都要”** - 描述：“Favicon + 应用图标”

### 问题模式 6：Emoji 选择

当用户选择“Emoji”作为素材时：

**步骤 1**：询问项目描述（自由文本）：
- “你的网站/应用是关于什么的？”
- 使用此描述生成 Emoji 建议

**步骤 2**：使用 AskUserQuestion 展示建议的 4 个 Emoji：

**问题**：“哪个 Emoji 最能代表你的项目？”
**标题**：“Emoji”
**选项**：（根据项目描述动态生成）
- 示例：**“🚀 火箭”** - 描述：“火箭、发布、初创企业、太空”
- 示例：**“☕ 咖啡”** - 描述：“咖啡、咖啡馆、饮品、饮料”
- 示例：**“💻 笔记本电脑”** - 描述：“计算机、笔记本电脑、代码、开发”
- 示例：**“🎨 艺术”** - 描述：“艺术、设计、创意、绘画”

**实现**：
```bash
# Get suggestions
python scripts/generate_favicons.py --suggest "coffee shop" output/ all

# Then generate with selected emoji
python scripts/generate_favicons.py --emoji "☕" output/ all
```

**可选**：询问应用图标的背景颜色：

**问题**：“你希望应用图标使用背景颜色吗？”
**标题**：“背景”
**选项**：
- **“透明”** - 描述：“无背景（仅适用于 favicon）”
- **“白色”** - 描述：“白色背景（建议用于应用图标）”
- **“自定义颜色”** - 描述：“我会提供一种颜色”

### 问题模式 7：代码集成提议

**使用时机**：生成资源并向用户展示 HTML 标签之后

**问题**：“你希望我将这些 HTML 标签添加到你的代码库中吗？”
**标题**：“集成”
**选项**：
- **“是，自动检测我的设置”** - 描述：“自动查找并更新我的 HTML/框架文件”
- **“是，我会告诉你位置”** - 描述：“我会指定要更新的文件”
- **“不，我会手动操作”** - 描述：“只需向我展示代码，我会自行添加”

**如果用户选择“Yes, auto-detect”：**
1. 搜索框架配置文件（next.config.js、astro.config.mjs 等）
2. 检测框架类型
3. 查找合适的目标文件（layout.tsx、index.html 等）
4. 显示检测到的文件并请求确认
5. 显示拟议更改的差异
6. 如果用户确认，则插入标签

**如果用户选择“Yes, I'll tell you where”：**
1. 询问用户文件路径
2. 验证文件是否存在
3. 显示拟议更改的差异
4. 如果用户确认，则插入标签

**框架检测优先级：**
- Next.js：查找 `next.config.js`，更新 `app/layout.tsx` 或 `pages/_app.tsx`
- Astro：查找 `astro.config.mjs`，更新 `src/layouts/` 中的布局文件
- SvelteKit：查找 `svelte.config.js`，更新 `src/app.html`
- Vue/Nuxt：查找 `nuxt.config.js`，更新 `app.vue` 或 `nuxt.config.ts`
- 纯 HTML：查找 `index.html` 或 `*.html` 文件
- Gatsby：查找 `gatsby-config.js`，更新 `gatsby-ssr.js`

### 问题模式 8：提供测试链接

**使用时机**：代码集成后（或者用户拒绝集成时）

**问题**：“您想现在测试元标签吗？”
**标题**：“测试”
**选项**：
- **“Facebook 调试工具”** - 描述：“在 Facebook 上测试 Open Graph 标签”
- **“Twitter Card 验证工具”** - 描述：“测试 Twitter Card 的显示效果”
- **“LinkedIn 帖子检查工具”** - 描述：“测试 LinkedIn 分享预览”
- **“所有测试工具”** - 描述：“获取所有验证工具的链接”
- **“不，跳过测试”** - 描述：“我稍后会自行测试”

**提供适当的测试 URL：**
- Facebook：https://developers.facebook.com/tools/debug/
- Twitter：https://cards-dev.twitter.com/validator
- LinkedIn：https://www.linkedin.com/post-inspector/
- 通用 OG 验证工具：https://www.opengraph.xyz/

## 工作流

### 从 Logo 生成网站图标和应用图标

当用户有 Logo 图片时：

```bash
python scripts/generate_favicons.py <source_image> <output_dir> [icon_type]
```

参数：
- `source_image`：Logo/图片文件的路径
- `output_dir`：生成的图标保存位置
- `icon_type`：可选——'favicon'、'app' 或 'all'（默认值：'all'）

示例：
```bash
python scripts/generate_favicons.py /mnt/user-data/uploads/logo.png /home/claude/output all
```

生成：
- `favicon-16x16.png`、`favicon-32x32.png`、`favicon-96x96.png`
- `favicon.ico`（多分辨率）
- `apple-touch-icon.png`（180x180）
- `android-chrome-192x192.png`、`android-chrome-512x512.png`

### 从 Emoji 生成网站图标和应用图标

**新功能**：通过智能建议从 Emoji 字符创建网站图标！

#### 第 1 步：获取 Emoji 建议

当用户需要基于 Emoji 的图标时，首先获取建议：

```bash
python scripts/generate_favicons.py --suggest "coffee shop" /home/claude/output all
```

这会根据描述返回 4 个 Emoji 建议：
```
1. ☕  Coffee               - coffee, cafe, beverage
2. 🌐  Globe                - web, website, global
3. 🏪  Store                - shop, store, retail
4. 🛒  Cart                 - shopping, cart, ecommerce
```

#### 第 2 步：根据选定的 Emoji 生成图标

```bash
python scripts/generate_favicons.py --emoji "☕" <output_dir> [icon_type] [--emoji-bg COLOR]
```

参数：
- `--emoji`：要使用的 Emoji 字符
- `output_dir`：生成的图标保存位置
- `icon_type`：可选——'favicon'、'app' 或 'all'（默认值：'all'）
- `--emoji-bg`：可选的背景颜色（默认值：favicon 使用透明背景，应用图标使用白色背景）

示例：
```bash
# Basic emoji favicon (transparent background)
python scripts/generate_favicons.py --emoji "🚀" /home/claude/output favicon

# Emoji with custom background for app icons
python scripts/generate_favicons.py --emoji "☕" --emoji-bg "#F5DEB3" /home/claude/output all

# Complete set with white background
python scripts/generate_favicons.py --emoji "💻" --emoji-bg "white" /home/claude/output all
```

生成与基于 Logo 的生成方式相同的文件：
- 所有标准尺寸的 favicon（16x16、32x32、96x96）
- favicon.ico
- 应用图标尺寸（180x180、192x192、512x512）

**注意**：需要 `pilmoji` 库：`pip install pilmoji`

### 根据 Logo 生成社交媒体元图像

当用户已有 Logo 并需要 Open Graph 图像时：

```bash
python scripts/generate_og_images.py <output_dir> --image <source_image>
```

示例：
```bash
python scripts/generate_og_images.py /home/claude/output --image /mnt/user-data/uploads/logo.png
```

生成：
- `og-image.png`（1200x630——适用于 Facebook、WhatsApp、LinkedIn）
- `twitter-image.png`（1200x675——适用于 Twitter）
- `og-square.png`（1200x1200——方形变体）

### 根据文本生成社交媒体元图像

当用户提供文本形式的宣传语或标语时：

```bash
python scripts/generate_og_images.py <output_dir> --text "Your text here" [options]
```

选项：
- `--logo <path>`：在文本中加入 Logo
- `--bg-color <color>`：背景颜色（十六进制值或颜色名称，默认值：'#4F46E5'）
- `--text-color <color>`：文本颜色（默认值：'white'）

示例：
```bash
python scripts/generate_og_images.py /home/claude/output \
  --text "Transform Your Business with AI" \
  --logo /mnt/user-data/uploads/logo.png \
  --bg-color "#4F46E5"
```

### 生成全部内容

适用于需要完整资源包的用户：

```bash
# Generate favicons and icons
python scripts/generate_favicons.py /mnt/user-data/uploads/logo.png /home/claude/output all

# Generate social media images
python scripts/generate_og_images.py /home/claude/output --image /mnt/user-data/uploads/logo.png
```

或者，对于基于文本的方式：
```bash
# Generate favicons from logo
python scripts/generate_favicons.py /mnt/user-data/uploads/logo.png /home/claude/output all

# Generate social media images with text + logo
python scripts/generate_og_images.py /home/claude/output \
  --text "Your Tagline Here" \
  --logo /mnt/user-data/uploads/logo.png
```

## 向用户交付资源

生成资源后，请遵循以下工作流程：

### 1. 移动到输出目录
```bash
cp /home/claude/output/* /mnt/user-data/outputs/
```

### 2. 显示生成的 HTML 标签

显示脚本自动生成的 HTML 标签。

网站图标的示例输出：
```html
<!-- Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">
<link rel="icon" type="image/png" sizes="512x512" href="/android-chrome-512x512.png">
```

Open Graph 图片的示例输出：
```html
<!-- Open Graph / Facebook -->
<meta property="og:image" content="/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Your description here">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="/twitter-image.png">
<meta name="twitter:image:alt" content="Your description here">
```

### 3. 提供代码集成（使用 AskUserQuestion——模式 7）

**重要**：始终询问用户是否需要帮助将这些标签添加到他们的代码库中。

**问题**：“你希望我将这些 HTML 标签添加到你的代码库中吗？”
**标题**：“集成”
**选项**：
- “是，自动检测我的配置”
- “是，我会告诉你位置”
- “否，我会手动完成”

#### 如果用户选择“是，自动检测我的配置”：

**A. 检测框架：**
```bash
# Search for framework config files
find . -maxdepth 2 -name "next.config.js" -o -name "astro.config.mjs" -o -name "svelte.config.js" -o -name "nuxt.config.js" -o -name "gatsby-config.js"

# Or check package.json
grep -E "next|astro|nuxt|svelte|gatsby" package.json
```

**B. 根据框架查找目标文件：**

- **Next.js（App Router）**：`app/layout.tsx` 或 `app/layout.js`
- **Next.js（Pages Router）**：`pages/_app.tsx` 或 `pages/_document.tsx`
- **Astro**：`src/layouts/*.astro`（通常为 `BaseLayout.astro` 或 `Layout.astro`）
- **SvelteKit**：`src/app.html`
- **Vue/Nuxt**：`app.vue` 或 `nuxt.config.ts`（head 部分）
- **Gatsby**：`gatsby-ssr.js` 或 `src/components/seo.tsx`
- **纯 HTML**：`index.html`、`public/index.html` 或任意 `*.html` 文件

**C. 与用户确认：**

使用 AskUserQuestion 确认检测到的文件：
```
Question: "I found [Framework Name]. Should I update [file_path]?"
Header: "Confirm"
Options:
- "Yes, update this file"
- "No, show me other options"
- "Cancel, I'll do it manually"
```

**D. 显示差异并插入：**

1. 读取目标文件
2. 准备要插入的内容（查找 `<head>` 或适当的部分）
3. 向用户显示差异
4. 如果用户确认，则使用 Edit 工具插入标签

**特定框架的插入示例：**

**对于纯 HTML**（在 `</head>` 之前插入）：
```html
<head>
  <meta charset="UTF-8">
  <!-- INSERT TAGS HERE -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  ...
</head>
```

**对于 Next.js App Router**（添加到 metadata 导出中）：
```typescript
export const metadata = {
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/twitter-image.png'],
  },
}
```

**对于 Astro**（插入布局文件的 `<head>` 中）：
```astro
<head>
  <meta charset="UTF-8">
  <!-- Favicons -->
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  ...
</head>
```

#### 如果用户选择“是，我会告诉你位置”：

1. 向用户询问文件路径
2. 使用 Read 工具验证文件是否存在
3. 展示标签将插入的位置
4. 展示差异
5. 如果用户确认，则执行插入

#### 如果用户选择“不，我会手动操作”：

提供简要说明：
- 将资源文件放入网站的 public/static 目录
- 将 HTML 标签添加到 HTML 的 `<head>` 部分
- 更新占位值（标题、描述、URL、替代文本）

### 4. 提供测试链接（使用 AskUserQuestion——模式 8）

**问题**：“你想现在测试元标签吗？”
**标题**：“测试”
**选项**：
- “Facebook 调试工具”
- “Twitter 卡片验证器”
- “LinkedIn 帖子检查器”
- “所有测试工具”
- “不用，跳过测试”

**提供测试 URL：**

- **Facebook 分享调试工具**：https://developers.facebook.com/tools/debug/
  - 粘贴你的 URL，然后点击“Debug”查看预览
  - 点击“Scrape Again”刷新缓存

- **Twitter 卡片验证器**：https://cards-dev.twitter.com/validator
  - 粘贴你的 URL，查看 Twitter 卡片将如何显示

- **LinkedIn 帖子检查器**：https://www.linkedin.com/post-inspector/
  - 检查链接在 LinkedIn 上分享时的显示效果

- **OpenGraph.xyz**：https://www.opengraph.xyz/
  - 用于快速检查的通用 Open Graph 验证器

### 5. 最终说明

提醒用户：
- ✅ 将资源文件复制到其 public/static 目录
- ✅ 更新元标签中的动态值（og:title、og:description、og:url）
- ✅ 部署后在实际平台上进行测试
- ✅ 更新替代文本，使其具有描述性并符合无障碍要求

**重要说明：**
- OG 图片必须可通过 HTTPS URL 访问（不能是 localhost）
- 元标签中的 URL 应为绝对地址（https://yourdomain.com/og-image.png）
- 部署到生产/预发布环境后再进行测试

## 最佳实践

### 图片要求
- **Logo**：为获得最佳效果，应使用正方形或接近正方形的图片
- **高分辨率**：提供可用的最大尺寸版本（脚本会缩小图片）
- **透明背景**：带透明效果的 PNG 最适合用作 favicon
- **纯色背景**：建议用于应用图标和社交图片

### 文本内容
- **文本长度会自动影响字体大小**：
  - 短文本（≤20 个字符）：144px 字体——醒目且有冲击力
  - 中等文本（21-40 个字符）：120px 字体——标准的易读尺寸
  - 长文本（41-60 个字符）：102px 字体——缩小以适应画面
  - 超长文本（>60 个字符）：84px 字体——最小尺寸
- 保持文本简洁，以获得最大的视觉冲击力
- 社交图片中的文本最多使用 2-3 行
- 避免使用可能无法正确呈现的特殊字符

### 颜色选择
- 确保具有足够的对比度（为保证可读性，最低为 4.5:1）
- 始终一致地使用品牌色
- 同时考虑浅色和深色模式场景

## 验证和质量检查

`generate_og_images.py` 和 `generate_favicons.py` 都支持使用 `--validate` 标志进行自动验证。

### 何时使用验证

**始终建议进行验证**，当：
- 用户正在生成用于生产环境/部署的资源
- 用户询问文件大小或质量
- 用户提到平台要求（Facebook、Twitter 等）
- 用户不熟悉 Web 资源，可能不了解相关要求

**验证是可选的**，当：
- 进行快速原型设计或测试
- 用户明确拒绝验证
- 时间比较紧张

### 验证哪些内容

#### 对于社交媒体图片（OG 图片）

**文件大小验证**：
- Facebook/LinkedIn/WhatsApp：必须小于 8MB
- Twitter：必须小于 5MB
- 当文件大小达到限制的 80% 时发出警告

**尺寸验证**：
- 根据各平台的建议尺寸进行检查：
  - Facebook/LinkedIn：1200x630（1.91:1 宽高比）
  - Twitter：1200x675（16:9 宽高比）
  - 正方形：1200x1200（1:1 宽高比）
- 当宽高比与目标值的偏差超过 10% 时发出警告
- 当尺寸低于最小要求时报告错误

**格式验证**：
- Facebook/LinkedIn：PNG、JPG、JPEG
- Twitter：PNG、JPG、JPEG、WebP
- 当格式不受支持时报告错误

**无障碍性（对比度）**：
- 仅适用于基于文本的图片
- 计算 WCAG 2.0 对比度
- 报告合规级别：
  - WCAG AAA：7.0:1（普通文本）或 4.5:1（大文本）
  - WCAG AA：4.5:1（普通文本）或 3.0:1（大文本）
  - 低于 AA 最低要求时验证失败

#### 对于网站图标和应用图标

**文件大小验证**：
- 网站图标：大于 100KB 时发出警告（为实现快速加载而建议的大小）
- 应用图标：大于 500KB 时发出警告（为移动端而建议的大小）
- 没有硬性限制，但警告有助于优化性能

**尺寸验证**：
- 验证每个图标是否符合预期尺寸（16x16、32x32 等）
- 确保宽高比为正方形

**格式验证**：
- 检查所有文件是否均为 PNG（favicon.ico 则为 ICO）

### 如何使用验证

**在 generate_og_images.py 中**：
```bash
python scripts/generate_og_images.py output/ --text "My Site" --validate
```

**在 generate_favicons.py 中**：
```bash
python scripts/generate_favicons.py logo.png output/ all --validate
```

**输出格式**：
- ✓ 成功（绿色）：所有检查均已通过
- ⚠ 警告（黄色）：需要考虑但不严重的问题
- ❌ 错误（红色）：部署前必须修复

### 验证输出示例

```
======================================================================
Running validation checks...
======================================================================

og-image.png:

Facebook Validation:
======================================================================
  ✓ File size 0.3MB is within Facebook limits
  ✓ Dimensions 1200x630 match Facebook recommended size
  ✓ Format PNG is supported by Facebook

LinkedIn Validation:
======================================================================
  ✓ File size 0.3MB is within LinkedIn limits
  ✓ Dimensions 1200x630 match LinkedIn recommended size
  ✓ Format PNG is supported by LinkedIn

======================================================================
Accessibility Checks:
======================================================================
  ✓ Contrast ratio 8.6:1 meets WCAG AAA standards (4.5:1 required)

======================================================================
Summary: 9/9 checks passed
✓ All validations passed!
```

### 将验证集成到工作流中

**生成资源后**，如果未运行验证：
1. 显示提示消息："💡 提示：使用 --validate 检查文件大小、尺寸和无障碍性"
2. 可选择询问："是否希望我现在对这些文件运行验证？"

**如果已运行验证并发现问题**：
1. 说明所有错误或警告
2. 主动提出修复问题（例如调整尺寸、重新压缩、调整颜色）
3. 如果用户同意，则应用修复后重新运行生成流程

**如果验证通过**：
1. 确认："✅ 所有验证检查均已通过！"
2. 继续进行代码集成并提供测试链接

## 规范和平台详情

有关详细的平台规范、尺寸要求和实施指南，请阅读：
- `references/specifications.md`：所有平台的完整规范

## 处理常见请求

### “为我的网站创建 favicon”

**使用 AskUserQuestion**：
- 问题："你有 logo 图片，还是需要我创建一个基于文本的 favicon？"
- 标题："来源"
- 选项：
  - "Logo 图片" - 描述："我已有/将上传一个 logo 文件"
  - "基于文本" - 描述："根据文本或首字母生成"

**然后询问**：
- 问题："你还需要用于移动设备的 PWA 应用图标吗？"
- 标题："范围"
- 选项：
  - "仅 favicon" - 描述："仅生成浏览器标签页图标（16x16、32x32、96x96）"
  - "包含应用图标" - 描述："添加用于主屏幕的 iOS/Android 图标（180x180、192x192、512x512）"

**生成**：使用 `generate_favicons.py` 并传入适当的参数

### “制作社交分享图片”

**使用 AskUserQuestion**：
- 问题："你需要为哪些社交媒体平台生成图片？"
- 标题："平台"
- 多选：true
- 选项：
  - "Facebook/WhatsApp/LinkedIn" - 描述："标准 1200x630 格式"
  - "Twitter" - 描述："1200x675（16:9 比例）"
  - "所有平台" - 描述："生成所有变体"

**然后询问**：
- 问题："图片中应包含什么内容？"
- 标题："内容"
- 选项：
  - "仅 logo" - 描述："调整我的 logo 尺寸以用于社交分享"
  - "仅文本" - 描述："根据文本/标语创建图片"
  - "Logo + 文本" - 描述："将 logo 与文本叠加层组合"

**生成**：使用 `generate_og_images.py` 并传入适当的参数

### “我的网站需要全套资源”

**使用 AskUserQuestion**：
- 问题："你将提供什么源材料？"
- 标题："来源"
- 选项：
  - "Logo 图片" - 描述："我有一个用于所有资源的 logo"
  - "Logo + 标语" - 描述："图标使用 logo，社交图片使用 logo+文本"
  - "仅文本" - 描述："根据文本/首字母生成所有资源"

**生成**：
- 同时生成 favicon 和 Open Graph 图片，并提供完整的 HTML 实现
- 提供文件放置和测试说明

### 用户同时提供 logo 和标语

**使用 AskUserQuestion**：
- 问题："我应该如何使用你的 logo 和标语？"
- 标题："布局"
- 选项：
  - "Logo 位于文本上方" - 描述："Logo 位于顶部，标语在下方居中显示"
  - "Logo + 文本并排" - 描述："Logo 位于左侧，文本位于右侧"
  - "社交图片仅使用文本" - 描述："图标使用 logo，社交分享图片仅使用文本"
  - "以 logo 为背景并叠加文本" - 描述："使用淡化的 logo 作为背景，并突出显示文本"

**生成**：在 `generate_og_images.py` 中同时使用 `--text` 和 `--logo` 参数

## 依赖项

这些脚本需要：
- Python 3.6+
- Pillow (PIL)：`pip install Pillow --break-system-packages`
- **Pilmoji**（用于支持表情符号）：`pip install pilmoji`（可选，仅基于表情符号生成时需要）
- **emoji**（用于表情符号建议）：`pip install emoji`（可选，仅使用表情符号建议时需要）

如有需要，请在运行脚本前安装。

**如需使用表情符号功能**，请同时安装两者：
```bash
pip install pilmoji emoji --break-system-packages
```