---
name: suede-image
description: "Suede-owned marketing image production for generation prompts, hero and social graphics, product mockups, export sizing, compression, and preview assets. Use when the user needs a general-purpose marketing image or an image-production workflow. NOT FOR: paid-ad creative systems (use suede-ad-creative), video production (use suede-video), or app-store listing strategy (use suede-aso)."
metadata:
  version: 2.0.1
---
# Suede 营销图片制作

Suede 以一种注重权利、针对具体展示位置的系统来制作营销图像：选择合适的制作方式，保护规范的品牌资产，保留真实的产品信息，并验证导出的结果。使用生成模型和设计工具，创建高效的主视觉图、社交媒体图片、产品样机、横幅和预览工作流，同时避免虚构界面或来源信息。

## 开始之前

**先检查产品营销背景：**
如果存在 `.agents/product-marketing.md`（或 `.claude/product-marketing.md`，或者在旧版设置中使用的旧文件名 `product-marketing-context.md`），请先阅读，再提出问题。使用其中的背景信息，只询问尚未涵盖或与当前任务具体相关的信息。

收集以下背景信息（如果未提供则询问）：

### 1. 图片目标
- 需要制作什么类型的图片？（博客主视觉图、社交媒体图片、产品宣传图、横幅、品牌资产、OG 图片）
- 用于哪个平台或展示位置？（网站、社交媒体、目录列表、应用商店、电子邮件）
- 需要什么尺寸？

### 2. 制作方式
- 是否有现成的品牌资产？（Logo、颜色、字体、样式指南）
- 需要照片级真实风格，还是插画风格？
- 是一次性制作，还是需要用于重复制作的模板？

### 3. 技术背景
- 当前可以调用哪些图片、浏览器、设计或本地转换工具？
- 获准的最高成本和数据处理边界是什么？
- 是否需要针对 Web 性能优化图片？

不要要求用户将 API 密钥或机密信息粘贴到对话中。

---

## 选择制作方式

首先了解当前可用的制作能力。检查可调用的工具和已连接的账户；不要假定某个指定的模型、提供商、API、插件或设计应用可用。然后从以下方法中选择：

| 方式 | 最适合 | 候选能力 |
|----------|----------|-----------|
| **生成** | 原创概念和场景 | 可调用的图像生成工具 |
| **编辑** | 对用户提供的图片进行授权修改 | 支持图像输入的可调用编辑器 |
| **模板设计** | 保持品牌一致性的重复性资产 | 已授权的设计应用或本地模板 |
| **截图 + 叠加** | 真实准确的产品展示 | 可调用的浏览器截图工具加本地排版 |
| **授权媒体** | 现有摄影或插画 | 用户拥有的媒体库或经过验证的授权来源 |

---

## AI 图像生成

只有在当前工具和授权检查通过后，才能使用生成方式。

### 能力和授权检查

1. 确认当前会话中可以调用生成或编辑工具。
2. 查阅其当前官方文档，确认模型可用性、接受的输入、输出尺寸、编辑/参考支持、安全限制、数据保留、商业使用条款和定价。记录来源和检查日期。
3. 确认对每个上传的 Logo、截图、照片、字体和参考图像都拥有相应权利。不得将机密或个人材料上传到其获准边界之外。
4. 计算所请求尝试次数的最高成本，并在使用付费账户或超出已批准预算之前获得明确批准。
5. 确认用户的请求授权的范围：仅生成、编辑所提供的文件、覆盖源文件，还是发布。这些属于彼此独立的检查项。

提供商名称和模型版本具有不稳定性。诸如 OpenAI、Google、
Black Forest Labs、Ideogram、Midjourney、Recraft 以及自托管扩散模型等示例，
都是研究候选项，而非路由指令或能力声明。

### 选择标准

- 对于文本较多的资产，优先使用确定性的叠加层或设计模板；在决定使用前，
  先测试任何已验证的图内文本能力。
- 对于重复性的品牌工作，优先使用锁定的模板和已批准的资产，而非某项声称的
  一致性功能。
- 对于编辑，使用其当前文档和可调用 schema 确认支持图像输入及所需编辑模式的工具。
- 对于矢量图，要求真实的矢量导出并检查其路径；仅标注为矢量的栅格图像
  并不足够。
- 对于产品 UI，应捕获实时的已获授权界面，而非生成它。
- 对于批量产出，应在小批量测试中比较已验证的成本、速率限制、审查时间和输出质量。

如果没有合适的渲染器或编辑器可调用，请交付可投入生产的提示词、
布局规范、资产清单、权利核对清单和导出核对清单。明确说明未生成图像；
不要表现得仿佛已执行操作一样，将用户引导至不可用的工具。使用以下确切标题：

```markdown
## Prompt
<Subject + Setting + Style + Lighting + Composition + Technical, one block,
ready to paste; note any text that must be a deterministic overlay instead>

## Layout Spec
Canvas WxH + ratio | safe margins | focal point | text zones with max character
counts | logo placement and clear space | color values

## Asset Manifest
Asset | origin (owned / licensed / captured / to be generated) | rights basis
and holder | attribution or expiry | file path or "to source"

## Rights Checklist
- [ ] Every uploaded or referenced asset has a confirmed rights basis
- [ ] No real person, endorsement, or product interface is fabricated
- [ ] Brand mark is the approved file, unmodified, or omitted
- [ ] Paid-tool cost approved, or no paid tool used

## Export Checklist
Destination | dimensions | format | quality target | file-size budget | alt text
Then apply the Optimization Checklist in "Image Optimization" before delivery.

## Not Done
No image was generated. What would unblock production: <tool, authority, asset>
```

### 提示词基础

强大的图像提示词遵循：**主体 + 场景 + 风格 + 光照 + 构图 + 技术**

```
A laptop on a minimal white desk with an abstract analytics motif,
soft directional lighting from the left, shallow depth of field,
clean commercial photography style, 16:9 aspect ratio, 4K
```

**常见错误：**
- 过于模糊（“一张商业图片”）——添加具体细节
- 忘记宽高比——始终指定尺寸
- 请求复杂文本——对于超过简短标题的文本，改用叠加层
- 没有风格方向——“写实摄影”、“扁平插画”、“3D 渲染”

有关各模型的详细提示词指南，请参阅 [references/ai-image-prompting.md](references/ai-image-prompting.md)。

---

## 设计工具

适用于模板化、品牌一致性要求高，而 AI 生成过度或不可预测的工作。

### Canva

可作为模板驱动的社交媒体图形、演示文稿、电子邮件页眉和横幅的候选工具。在将工作交由其处理之前，请验证已连接的账户、当前功能、导出权限、套餐限制、API 可用性以及可调用的集成。为品牌输出保留人工审核环节。

### Figma

当存在经过授权的设计文件或组件系统时，可将其作为候选工具。验证当前账户访问权限，以及可用集成能够读取、编辑、导出还是只能检查。不要仅因存在连接器就声称拥有写入权限或创建文件。

### 何时使用设计工具与 AI 生成

| 场景 | 设计工具 | AI 生成 |
|----------|:-:|:-:|
| 必须严格遵循品牌指南 | 是 | 也许（需提供强参考图） |
| 需要同一设计的多种尺寸变体 | 是，前提是已验证当前调整尺寸/导出能力 | 通常否 |
| 博客文章的独特主视觉图片 | 否 | 是 |
| 重复使用的社交媒体模板 | 是 | 否 |
| 带有真实 UI 的产品模型图 | 否（使用截图） | 否（会产生虚构 UI） |
| 抽象/创意视觉图 | 否 | 是 |

---

## 营销图片工作流

### 博客和文章主视觉图片

每篇文章顶部的图片。用于奠定基调、提升可分享性，并且是 OG/社交媒体预览所必需的。

1. **定义概念** — 什么视觉隐喻能够代表该主题？
2. **选择已验证的方法** — 可调用的生成器、获批媒体，或确定性的本地/设计模板
3. 根据实际网站组件和当前社交媒体预览要求**确认尺寸**
4. **优化至经过衡量的质量和性能预算**

**提示词模式：**
```
[Visual metaphor for topic], clean modern style,
bright natural lighting, shallow depth of field,
professional blog header aesthetic, [verified width]x[verified height]
```

### 社交媒体图形

用于自然发布内容的平台专属图片。

以下数值是规划默认值，并非当前平台保证。请在工作当天查阅平台的官方规范，并使用其当前的安全区域、文件限制和格式规则。

| 平台 | 规划尺寸 | 宽高比 | 备注 |
|----------|-------------|:---:|-------|
| Twitter/X | 1200x675 | 16:9 | 大图卡片 |
| LinkedIn | 1200x627 | 1.91:1 | 信息流图片 |
| Instagram Feed | 1080x1080 | 1:1 | 方形；1080x1350 (4:5) 也很适合 |
| Instagram Stories | 1080x1920 | 9:16 | 全屏竖版 |
| Facebook | 1200x630 | 1.91:1 | 链接分享图片 |

**工作流：**
1. 以所需的最高分辨率创建主视觉概念
2. 使用已验证的调整尺寸/导出功能，或为各平台变体进行手动裁剪
3. 当需要准确文字时，以确定性方式添加文字叠加层
4. 按平台专属尺寸导出

### 产品模型图和截图

在上下文中展示你的产品 UI。AI 模型会虚构 UI —— 不要将它们用于此用途。

1. **捕获真实截图**，以 2x 分辨率截取你的产品
2. **置于设备模型框中** — 使用浏览器框、笔记本电脑或手机模板
3. **添加上下文** — 标注箭头、已验证的功能标签、前后对比
4. **以确定性方式标注** — 使用可调用的本地布局工作流或经过授权的设计工具

可能的捕获界面包括浏览器工具或已安装的 OS 捕获实用程序。发现当前可调用的内容，确认实时界面的授权，并省略不可用的工具。

### 个人资料与目录横幅

用于个人资料、目录列表和市场页面的横幅。通常是用户看到的第一视觉印象。

这些是规划参考，可能会发生变化。在制作前，核实当前的官方尺寸、
裁剪行为、安全区域、文件限制和格式规则。

| 平台 | 规划尺寸 | 备注 |
|----------|------|-------|
| LinkedIn 个人封面 | 1584x396 | 4:1，中心为安全区域 |
| LinkedIn 公司封面 | 1128x191 | 5.9:1；LinkedIn 建议最大为 4200x700 |
| Twitter/X 页眉 | 1500x500 | 3:1，会被头像部分遮挡 |
| Product Hunt 图库 | 1270x760 | 5:3，最多 6 张图片 |
| G2 个人资料 | 1280x720 | 16:9，优先使用产品截图 |
| GitHub 社交预览图 | 1280x640 | 2:1，显示在链接卡片中 |
| App Store 截图 | 因设备而异 | 完整规格请参阅 suede-aso skill |
| Google Play 特色图片 | 1024x500 | 约 2:1，商店列表必需 |

**最佳实践：**
- **尽量少用文字** — 横幅在移动设备上会以较小尺寸显示
- **将关键内容置于中央** — 不同设备的边缘裁剪方式不同
- **如实展示产品** — 如果列表的目的是展示界面，请使用真实的 UI 截图
- **与品牌保持一致** — 使用统一的颜色、字体和徽标位置
- **有计划地更新** — 在产品、活动或定位发生变化时进行更新

**工作流程：**
1. 选择平台并记录确切尺寸
2. 对于目录（Product Hunt、G2）：使用带有少量标注的真实产品截图
3. 对于个人资料（LinkedIn、Twitter）：使用品牌颜色 + 标语 + 可选的产品截图
4. 使用经过验证且可调用的模板工作流制作；以确定性方式添加文字
5. 在实际显示尺寸下测试 — 缩小查看以检查可读性

### 品牌资产

徽标、图标和插图。AI 生成在这些方面存在局限。

| 资产 | AI 生成 | 设计工具 | 备注 |
|-------|:-:|:-:|-------|
| 徽标 | 较差 — 不一致，且不是矢量格式 | 是 | 始终自行设计或委托设计徽标 |
| 应用图标 | 仅用于概念探索 | 是 | 手动优化并核实商店规则 |
| 插图 | 适合进行风格探索 | 视情况而定 | 使用 AI 生成概念，最后在设计工具中完成 |
| Favicons | 不适用 | 是 | 从徽标派生 |
| 社交图标 | 不适用 | 是 | 使用平台提供的资产 |

---

## 图像优化

图像字节数和尺寸会影响页面性能。在将搜索或转化结果归因于图像变更之前，先测量实际页面。

### 格式指南

| 格式 | 最适用于 | 压缩 |
|--------|----------|-------------|
| **WebP** | 目标浏览器支持时的照片和图形 | 有损 + 无损 |
| **AVIF** | 目标浏览器支持时的高压缩传输 | 有损 + 无损 |
| **JPEG** | 广泛的照片兼容性 | 有损 |
| **PNG** | 透明效果和无损截图 | 无损 |
| **SVG** | 可信的矢量徽标、图标和插图 | 矢量 |

### 优化检查清单

- [ ] **使用受支持的交付格式**，并针对目标浏览器矩阵制定回退策略
- [ ] **调整为显示尺寸** — 不要在 800px 容器中提供 4000px 的图片
- [ ] **压缩** — 根据视觉审核结果和页面测得的字节预算选择质量
- [ ] **延迟加载**首屏以下的图片（`loading="lazy"`）
- [ ] **设置明确的尺寸** — `width` 和 `height` 属性可防止布局偏移（CLS）
- [ ] **使用经过验证的 CDN 优化**，前提是当前技术栈支持该功能
- [ ] **添加替代文本** — 具有描述性、与关键词相关，但不要堆砌关键词

### 快速优化命令

```bash
# Run only after confirming the named local utility is installed.
# Convert to WebP (using cwebp)
cwebp -q 80 input.png -o output.webp

# Batch convert with ImageMagick
mogrify -format webp -quality 80 *.png

# Optimize JPEG (using jpegoptim)
jpegoptim --max=80 --strip-all *.jpg

# Check image sizes on a page
curl -s https://yoursite.com | rg -o 'src="[^"]+\\.(jpg|png|webp)"' | head -20
```

---

## OG 和社交媒体预览图片

当你的 URL 在社交媒体、Slack、Discord 等平台上分享时显示的图片。

### 常见 Meta 标签

验证当前的爬虫/平台规范，并使用绝对公共 URL。
以下值是起始模板，并不能证明符合平台要求。

```html
<meta property="og:image" content="https://yoursite.com/og/page-name.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yoursite.com/og/page-name.jpg" />
```

### 动态 OG 图片

仅在验证项目当前使用的框架、已安装的软件包和受支持的运行时之后，才为动态页面以编程方式生成 OG 图片：

- 已安装的框架原生图片路由
- 本地 HTML/SVG 到图片的渲染器
- 经过授权且已验证模板和导出能力的媒体服务

对于重复的页面类型，确定性的模板可以减少手动工作。衡量预览正确性和生产时间；不要承诺搜索结果。

---

## 常见错误

1. **跳过图片优化** — 过大的图片可能会实质性地损害页面性能
2. **没有预览图片** — 平台可能会回退到不太有用的预览
3. **品牌视觉不一致** — 使用锁定且已批准的模板来保持一致性

---

## 停止契约

当可调用工具、成本审批、权利确认或已批准的品牌素材阻碍所请求的结果时，使用以下确切格式：

```text
HALT — <one-line blocker>
Why it blocks: <specific missing authority or evidence>
Resolve with:
1. <option>
2. <option>
3. <option, when useful>
Waiting for: <the exact item or approval>
```

仅当上文的无工具交接产物仍然有用，且不会暗示已经生成图片时，才继续提供这些产物。

---

## 边界

- 对于 Suede 视觉素材，仅使用 `docs/assets/suede-ai-logo-transparent.png`，其 SHA-256 为 `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`。
- 不要重新绘制、描摹、近似、重新着色、变形、排版或生成已批准的 Suede S 标志的替代品。如果规范文件缺失或其校验和不匹配，则省略该标志，说明阻碍因素，并请求提供已批准的文件。
- 未验证相关来源或输出前，不要声称图片已获得许可、已完成权利清理、真实、无障碍、经过优化或符合平台要求。
- 未经明确授权且未验证最高成本，不要使用付费提供商、上传受保护的素材，或跨越已批准的账户或数据边界。
- 未经明确授权，不要发布、覆盖源素材或替换真实产品截图。
- 不要虚构人物、背书、产品界面、性能结果或来源，也不要替用户决定权利或品牌例外情况。

## 路由

- 使用 `suede-ad-creative` 进行付费广告制作，使用 `suede-video` 处理动态内容。
- 使用 `suede-social` 制定渠道策略，使用 `suede-site-alchemy` 进行转化位置规划。
- 在此处制作相关素材之前，使用 `suede-instagram-growth` 处理 Instagram 格式规范——Reel 封面、轮播图页数、Story 尺寸。
- 使用 `suede-seo-audit` 进行图片搜索检查，使用 `suede-aso` 处理应用商店截图。
- 使用 `suede-directory-submissions` 规划目录图库。