---
name: suede-image
description: "Suede-owned marketing image production for generation prompts, hero and social graphics, product mockups, export sizing, compression, and preview assets. Use when the user needs a general-purpose marketing image or an image-production workflow. NOT FOR: paid-ad creative systems (use suede-ad-creative), video production (use suede-video), or app-store listing strategy (use suede-aso)."
metadata:
  version: 2.0.1
---
# Suede 营销图片制作

Suede 将营销图像制作作为一个注重权利、针对具体投放位置的系统：选择合适的制作方式，保护规范的品牌资产，保留真实的产品信息，并验证导出的结果。使用生成模型和设计工具创建高效的主视觉图、社交媒体图片、产品样机、横幅和预览工作流，但不要伪造界面或来源信息。

## 开始之前

**首先检查产品营销上下文：**  
如果 `.agents/product-marketing.md` 存在（或者 `.claude/product-marketing.md`，或旧版设置中的旧文件名 `product-marketing-context.md`），请在提问前先阅读。使用其中的上下文，仅询问尚未涵盖或与当前任务相关的具体信息。

收集以下上下文（如果未提供则询问）：

### 1. 图片目标
- 需要什么类型的图片？（博客主视觉图、社交媒体图片、产品样机、横幅、品牌资产、OG 图片）
- 用于哪个平台或投放位置？（网站、社交媒体、目录列表、应用商店、电子邮件）
- 需要什么尺寸？

### 2. 制作方式
- 是否有现成的品牌资产？（Logo、颜色、字体、风格指南）
- 需要写实风格还是插画风格？
- 这是一次性制作，还是需要反复使用的模板？

### 3. 技术上下文
- 当前可以调用哪些图像、浏览器、设计或本地转换工具？
- 批准的最高成本和数据处理边界是什么？
- 是否需要针对网页性能优化图片？

不要要求用户将 API 密钥或机密信息粘贴到对话中。

---

## 选择制作方式

首先了解当前可用的制作能力。检查可调用的工具和已连接的账户；不要假定某个指定的模型、提供商、API、插件或设计应用可用。然后从以下方法中选择：

| 方式 | 最适合的用途 | 候选能力 |
|----------|----------|-------------------|
| **生成** | 原创概念和场景 | 可调用的图像生成工具 |
| **编辑** | 对所提供图片进行授权修改 | 支持图像输入的可调用编辑器 |
| **模板设计** | 保持品牌一致性的重复性资产 | 经授权的设计应用或本地模板 |
| **截图 + 叠加** | 真实可信的产品展示 | 可调用的浏览器截图工具加本地布局 |
| **授权媒体** | 现有摄影作品或插画 | 用户自有素材库或经验证的授权来源 |

---

## AI 图像生成

只有在通过当前工具和授权检查后，才能使用生成方式。

### 能力和授权检查

1. 确认当前会话中可以调用生成或编辑工具。
2. 查看其当前官方文档，确认模型可用性、接受的输入、输出尺寸、编辑/参考支持、安全限制、数据保留、商业使用条款和定价。记录来源和检查日期。
3. 确认对每个上传的 Logo、截图、照片、字体和参考图片都拥有相应权利。不要将机密或个人材料上传到未经批准的边界之外。
4. 计算所请求尝试次数的最高成本，并在使用付费账户或超出已批准预算之前获得明确批准。
5. 确认用户的请求授权的是仅生成、编辑所提供的文件、覆盖源文件，还是发布。这些属于彼此独立的授权检查。

提供商名称和模型版本变化很快。OpenAI、Google、
Black Forest Labs、Ideogram、Midjourney、Recraft 以及自托管扩散模型等示例是
研究候选项，并非路由指令或能力声明。

### 选择标准

- 对于文本密集型资产，优先使用确定性叠加层或设计模板；在确定采用任何经过验证的图内文本能力之前，先进行测试。
- 对于重复性的品牌工作，优先使用锁定的模板和已批准的资产，而不是依赖所谓的一致性功能。
- 对于编辑任务，使用当前文档和可调用 schema 均确认支持图像输入及所需编辑模式的工具。
- 对于矢量图，必须要求真正的矢量导出并检查其路径；仅标记为矢量的栅格图像并不够。
- 对于产品 UI，应捕获经过授权的实时界面，而不是生成该界面。
- 对于批量任务，应在小规模测试批次上比较经过验证的成本、速率限制、审核时间和输出质量。

如果没有可调用的合适渲染器或编辑器，请提供可直接用于生产的提示词、布局规范、资产清单、权利检查清单和导出检查清单。明确说明未生成图像；不要仿佛已经执行一样，将用户引导至不可用的工具。使用以下确切标题：

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

高质量的图像提示词遵循：**主体 + 场景 + 风格 + 光照 + 构图 + 技术参数**

```
A laptop on a minimal white desk with an abstract analytics motif,
soft directional lighting from the left, shallow depth of field,
clean commercial photography style, 16:9 aspect ratio, 4K
```

**常见错误：**
- 过于笼统（“一张商业图片”）——添加具体细节
- 忘记宽高比——始终指定尺寸
- 请求复杂文本——对于超出简短标题范围的任何内容，改用叠加层
- 没有风格方向——使用“写实摄影风格”“扁平插画”“3D 渲染”等描述

如需了解各模型的详细提示词指南，请参阅 [references/ai-image-prompting.md](references/ai-image-prompting.md)。

---

## 设计工具

适用于模板化、需要保持品牌一致性的工作，此时 AI 生成可能过度复杂，或结果过于不可预测。

### Canva

可考虑用于基于模板的社交媒体图片、演示文稿、电子邮件
页眉和横幅。将工作交由它处理之前，请核实已连接的账户、当前功能、导出
权限、套餐限制、API 可用性以及可调用的集成能力。对品牌输出保留人工
审核环节。

### Figma

当存在经过授权的设计文件或组件系统时，可以考虑使用。请核实当前账户访问权限，以及可用的集成是能够读取、编辑、导出，还是只能检查。不要仅仅因为存在连接器，就声称拥有写入权限或创建文件的能力。

### 何时使用设计工具，何时使用 AI 生成

| 场景 | 设计工具 | AI 生成 |
|----------|:-:|:-:|
| 必须严格遵循品牌指南 | 是 | 可能（需提供强参考图） |
| 需要为同一设计制作多个尺寸的变体 | 是，前提是已核实当前的调整尺寸/导出能力 | 通常不适合 |
| 为博客文章制作独特的主视觉图片 | 否 | 是 |
| 周期性使用的社交媒体模板 | 是 | 否 |
| 带有真实 UI 的产品样机 | 否（使用截图） | 否（会生成虚构的 UI） |
| 抽象/创意视觉 | 否 | 是 |

---

## 营销图片工作流

### 博客和文章主视觉图片

每篇文章顶部的图片。用于设定基调、提升分享性，也是 OG/社交媒体预览所必需的。

1. **定义概念** — 什么视觉隐喻能够代表主题？
2. **选择已验证的方法** — 可调用的生成器、获批准的媒体，或确定性的本地/设计模板
3. 从实际网站组件和当前社交媒体预览要求中**确认尺寸**
4. 根据经过测量的质量和性能预算进行**优化**

**提示词模式：**
```
[Visual metaphor for topic], clean modern style,
bright natural lighting, shallow depth of field,
professional blog header aesthetic, [verified width]x[verified height]
```

### 社交媒体图片

用于自然发布的、针对不同平台的图片。

以下数值是规划默认值，并不代表当前的平台保证。请在工作日期查阅平台的
官方规格，并使用其当前的安全区域、文件限制和格式规则。

| 平台 | 规划尺寸 | 宽高比 | 备注 |
|----------|-------------|:---:|-------|
| Twitter/X | 1200x675 | 16:9 | 大尺寸图片卡片 |
| LinkedIn | 1200x627 | 1.91:1 | 信息流图片 |
| Instagram Feed | 1080x1080 | 1:1 | 方形；1080x1350 (4:5) 也很适用 |
| Instagram Stories | 1080x1920 | 9:16 | 全屏竖版 |
| Facebook | 1200x630 | 1.91:1 | 链接分享图片 |

**工作流：**
1. 以所需的最高分辨率创建主视觉概念
2. 使用已验证的调整尺寸/导出功能，或手动裁剪，制作各平台的变体
3. 在需要准确文字时，以确定性的方式添加文字叠加层
4. 按平台特定尺寸导出

### 产品样机和截图

在实际使用场景中展示产品 UI。AI 模型会虚构 UI——不要将它们用于此目的。

1. 以 2x 分辨率**截取产品的真实截图**
2. **置于设备样机中** — 使用浏览器框架、笔记本电脑或手机模板
3. **添加上下文** — 标注箭头、经过核实的功能标签、前后对比
4. **以确定性的方式添加注释** — 使用可调用的本地布局工作流或经过授权的设计工具

可能的捕获界面包括浏览器工具或已安装的操作系统捕获实用程序。发现当前可调用的内容，确认实时界面的授权，并省略不可用的工具。

### 个人资料与目录横幅

用于个人资料、目录列表和市场页面的横幅。通常是用户看到的第一印象。

这些尺寸是规划参考，实际情况可能会发生变化。在制作前，验证当前的官方尺寸、
裁剪行为、安全区域、文件限制和格式规则。

| 平台 | 规划尺寸 | 备注 |
|----------|------|-------|
| LinkedIn 个人封面 | 1584x396 | 4:1，中心为安全区域 |
| LinkedIn 公司封面 | 1128x191 | 5.9:1；LinkedIn 建议最大为 4200x700 |
| Twitter/X 页眉 | 1500x500 | 3:1，部分区域会被头像遮挡 |
| Product Hunt 图库 | 1270x760 | 5:3，最多 6 张图片 |
| G2 个人资料 | 1280x720 | 16:9，优先使用产品截图 |
| GitHub 社交预览图 | 1280x640 | 2:1，显示在链接卡片中 |
| App Store 截图 | 因设备而异 | 完整规格请参阅 suede-aso skill |
| Google Play 特色图片 | 1024x500 | 约 2:1，商店列表必需 |

**最佳实践：**
- **尽量少用文字** — 横幅在移动设备上会以较小尺寸显示
- **将关键内容置于中心** — 不同设备的边缘裁剪方式不同
- **如实展示产品** — 如果列表的目的是展示界面，请使用真实的 UI 截图
- **匹配品牌形象** — 使用一致的颜色、字体和 Logo 位置
- **有计划地更新** — 在产品、活动或定位发生变化时进行刷新

**工作流程：**
1. 选择平台并记录确切尺寸
2. 对于目录（Product Hunt、G2）：使用带有少量标注的真实产品截图
3. 对于个人资料（LinkedIn、Twitter）：使用品牌颜色 + 标语 + 可选的产品图
4. 使用经过验证且可调用的模板工作流制作；以确定性方式添加文字
5. 在实际显示尺寸下进行测试 — 缩小查看以检查可读性

### 品牌素材

Logo、图标和插图。AI 生成在这方面存在局限。

| 素材 | AI 生成 | 设计工具 | 备注 |
|-------|:-:|:-:|-------|
| Logo | 较差 — 不一致，且不是矢量格式 | 是 | 始终应自行设计或委托制作 Logo |
| App 图标 | 仅用于概念探索 | 是 | 手动完善并验证商店规则 |
| 插图 | 适合进行风格探索 | 视情况而定 | 使用 AI 生成概念，最终在设计工具中完成 |
| Favicon | 不适用 | 是 | 从 Logo 派生 |
| 社交图标 | 不适用 | 是 | 使用平台提供的素材 |

---

## 图片优化

图片字节数和尺寸可能会影响页面性能。在将搜索或转化结果归因于图片变化之前，
先测量实际页面。

### 格式指南

| 格式 | 最适合 | 压缩 |
|--------|----------|-------------|
| **WebP** | 目标浏览器支持时的照片和图形 | 有损 + 无损 |
| **AVIF** | 目标浏览器支持时的高压缩传输 | 有损 + 无损 |
| **JPEG** | 广泛兼容的照片 | 有损 |
| **PNG** | 透明内容和无损截图 | 无损 |
| **SVG** | 可信的矢量 Logo、图标和插图 | 矢量 |

### 优化检查清单

- [ ] **使用受支持的交付格式**，并针对目标浏览器矩阵制定回退策略
- [ ] **调整为显示尺寸** — 不要在 800px 容器中提供 4000px 的图片
- [ ] **进行压缩** — 根据视觉检查结果和页面测得的字节预算选择质量
- [ ] **延迟加载**首屏以下的图片（`loading="lazy"`）
- [ ] **设置明确的尺寸** — `width` 和 `height` 属性可防止布局偏移（CLS）
- [ ] **在当前技术栈支持的情况下使用经过验证的 CDN 优化**
- [ ] **添加 alt 文本** — 描述性强、与关键词相关，但不要堆砌关键词

### 快速优化命令

```bash
# Run only after confirming the named local utility is installed.
# Convert to WebP (using cwebp)
cwebp -q 80 input.png -o output.webp

# Batch convert with ImageMagick
mogrify -format webp -quality 80 *.png

# Optimize JPEG (using jpegoptim)
jpegoptim --max=80 --strip-all *.jpg
```

要检查页面上的图片引用，请针对经过验证的公共 HTTPS URL，使用主机批准的只读 HTTP
或浏览器工具。拒绝回环地址、链路本地地址或私有网络目标；不要附加环境中的 Cookie 或
身份验证标头；不要发送本地文件、凭据或工作区内容。检查返回的 HTML 中的图片 `src` 值，
并将失败或不安全的获取报告为未验证。

---

## OG 和社交预览图片

当你的 URL 在社交媒体、Slack、Discord 等平台上分享时显示的图片。

### 常见元标签

验证当前的爬虫/平台规范，并使用绝对公共 URL。
以下值是起始模板，并不代表已证明符合平台要求。

```html
<meta property="og:image" content="https://yoursite.com/og/page-name.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://yoursite.com/og/page-name.jpg" />
```

### 动态 OG 图片

仅在验证项目当前框架、已安装的软件包和受支持的运行时之后，才为动态页面以编程方式生成 OG 图片：

- 已安装的框架原生图片路由
- 本地 HTML/SVG 到图片的渲染器
- 已授权且模板和导出能力经过验证的媒体服务

对于重复的页面类型，确定性的模板可以减少手动工作。衡量预览的正确性和生产时间；不要承诺搜索结果。

---

## 常见错误

1. **跳过图片优化** — 过大的图片可能会显著损害页面性能
2. **没有预览图片** — 平台可能会回退到不够有用的预览
3. **品牌视觉不一致** — 使用锁定且经过批准的模板来保持一致性

---

## 停止契约

当可调用工具、成本审批、权利确认或经过批准的品牌资产阻碍所请求的结果时，使用以下确切格式：

```text
HALT — <one-line blocker>
Why it blocks: <specific missing authority or evidence>
Resolve with:
1. <option>
2. <option>
3. <option, when useful>
Waiting for: <the exact item or approval>
```

仅在上方的无工具交接产物仍然有用，且不会暗示已生成图像时，才继续使用它们。

---

## 边界

- 对于 Suede 视觉素材，只能使用 `docs/assets/suede-ai-logo-transparent.png`，其 SHA-256 为 `83a7ee0317e4debe2e7b076c20ba067feb76a587f9e829dc6310ae4be4b44dfa`。
- 不得重绘、描摹、近似还原、重新着色、变形、排版或生成经批准的 Suede S 标志的替代品。如果规范文件缺失或其校验和不符，则省略该标志，说明阻碍，并请求提供经批准的文件。
- 未核实相关来源或输出之前，不得声称图像已获得许可、已完成权利清理、真实、无障碍、经过优化或符合平台要求。
- 未经明确授权且未核实最高成本，不得使用付费提供商、上传受保护材料，或跨越获批准的账户或数据边界。
- 未经明确授权，不得发布、覆盖源素材或替换真实产品截图。
- 不得虚构人物、背书、产品界面、性能结果或来源，也不得替用户决定权利问题或品牌例外。

## 路由

- 使用 `suede-ad-creative` 进行付费广告制作，使用 `suede-video` 处理动态内容。
- 使用 `suede-social` 制定渠道策略，使用 `suede-site-alchemy` 处理转化位置。
- 在此处制作相关资产之前，使用 `suede-instagram-growth` 处理 Instagram 格式契约——Reel 封面、轮播图页数、Story 尺寸。
- 使用 `suede-seo-audit` 进行图片搜索检查，使用 `suede-aso` 处理应用商店截图。
- 使用 `suede-directory-submissions` 规划目录图库。