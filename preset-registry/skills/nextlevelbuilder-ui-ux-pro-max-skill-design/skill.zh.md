---
name: design
description: "Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini or Atlas Cloud AI), corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design (22 styles, social/ads/web/print), icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML→screenshot, multi-platform). Actions: design logo, create CIP, generate mockups, build slides, design banner, generate icon, create social photos, social media images, brand identity, design system. Platforms: Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads."
argument-hint: "[design-type] [context]"
license: MIT
metadata:
  author: claudekit
  version: "2.1.0"
---
# 设计

统一设计技能：品牌、设计令牌、UI、Logo、CIP、幻灯片、横幅、社交媒体照片、图标。

## 使用时机

- 品牌识别、品牌语调、品牌资产
- 设计系统令牌和规范
- 使用 shadcn/ui + Tailwind 进行 UI 样式设计
- Logo 设计和 AI 生成
- 企业识别系统（CIP）交付物
- 演示文稿和路演材料
- 用于社交媒体、广告、网页、印刷品的横幅设计
- 用于 Instagram、Facebook、LinkedIn、Twitter、Pinterest、TikTok 的社交媒体照片

## 子技能路由

| 任务 | 子技能 | 详情 |
|------|-----------|---------|
| 品牌识别、品牌语调、品牌资产 | `brand` | 外部技能 |
| 令牌、规范、CSS vars | `design-system` | 外部技能 |
| shadcn/ui、Tailwind、代码 | `ui-styling` | 外部技能 |
| Logo 创建、AI 生成 | Logo（内置） | `references/logo-design.md` |
| CIP 模拟图、交付物 | CIP（内置） | `references/cip-design.md` |
| 演示文稿、路演材料 | 幻灯片（内置） | `references/slides.md` |
| 横幅、封面、页眉 | 横幅（内置） | `references/banner-sizes-and-styles.md` |
| 社交媒体图片/照片 | 社交媒体照片（内置） | `references/social-photos-design.md` |
| SVG 图标、图标集 | 图标（内置） | `references/icon-design.md` |

## Logo 设计（内置）

55+ 种风格、30 套配色方案、25 份行业指南。Gemini Nano Banana 模型。

### Logo：生成设计简报

```bash
python3 ~/.claude/skills/design/scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"
```

### Logo：搜索风格/颜色/行业

```bash
python3 ~/.claude/skills/design/scripts/logo/search.py "minimalist clean" --domain style
python3 ~/.claude/skills/design/scripts/logo/search.py "tech professional" --domain color
python3 ~/.claude/skills/design/scripts/logo/search.py "healthcare medical" --domain industry
```

### Logo：使用 AI 生成

**始终**生成白色背景的 Logo 图片。

```bash
python3 ~/.claude/skills/design/scripts/logo/generate.py --brand "TechFlow" --style minimalist --industry tech
python3 ~/.claude/skills/design/scripts/logo/generate.py --prompt "coffee shop vintage badge" --style vintage
python3 ~/.claude/skills/design/scripts/logo/generate.py --brand "TechFlow" --provider atlas
```

**重要：**当脚本失败时，直接尝试修复脚本。

生成后，**始终**通过 `AskUserQuestion` 询问用户是否需要 HTML 预览。如果需要，则调用 `/ui-ux-pro-max` 生成图库。

## CIP 设计（内置）

50+ 种交付物、20 种风格、20 个行业。Gemini Nano Banana（Flash/Pro）。

### CIP：生成简报

```bash
python3 ~/.claude/skills/design/scripts/cip/search.py "tech startup" --cip-brief -b "BrandName"
```

### CIP：搜索领域

```bash
python3 ~/.claude/skills/design/scripts/cip/search.py "business card letterhead" --domain deliverable
python3 ~/.claude/skills/design/scripts/cip/search.py "luxury premium elegant" --domain style
python3 ~/.claude/skills/design/scripts/cip/search.py "hospitality hotel" --domain industry
python3 ~/.claude/skills/design/scripts/cip/search.py "office reception" --domain mockup
```

### CIP：生成样机

```bash
# With logo (RECOMMENDED)
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --deliverable "business card" --industry "consulting"

# Full CIP set
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo /path/to/logo.png --industry "consulting" --set

# Pro model (4K text)
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TopGroup" --logo logo.png --deliverable "business card" --model pro

# Without logo
python3 ~/.claude/skills/design/scripts/cip/generate.py --brand "TechFlow" --deliverable "business card" --no-logo-prompt
```

模型：`flash`（默认，`gemini-2.5-flash-image`）、`pro`（`gemini-3-pro-image-preview`）

### CIP：渲染 HTML 演示文稿

```bash
python3 ~/.claude/skills/design/scripts/cip/render-html.py --brand "TopGroup" --industry "consulting" --images /path/to/cip-output
```

**提示：** 如果不存在 logo，请先使用上方的 Logo Design 部分。

## 幻灯片（内置）

使用 Chart.js、设计令牌和文案公式制作战略型 HTML 演示文稿。

加载 `references/slides-create.md` 以了解创建工作流。

### 幻灯片：知识库

| 主题 | 文件 |
|-------|------|
| 创建指南 | `references/slides-create.md` |
| 布局模式 | `references/slides-layout-patterns.md` |
| HTML 模板 | `references/slides-html-template.md` |
| 文案写作 | `references/slides-copywriting-formulas.md` |
| 策略 | `references/slides-strategies.md` |

## Banner 设计（内置）

涵盖社交媒体、广告、网页和印刷品的 22 种艺术指导风格。使用 `frontend-design`、`ai-artist`、`ai-multimodal`、`chrome-devtools` 技能。

加载 `references/banner-sizes-and-styles.md` 以获取完整的尺寸和风格参考。

### Banner：工作流

1. **收集需求**：通过 `AskUserQuestion` 获取用途、平台、内容、品牌、风格和数量
2. **研究**：激活 `ui-ux-pro-max`，浏览 Pinterest 获取参考
3. **设计**：使用 `frontend-design` 创建 HTML/CSS Banner，使用 `ai-artist`/`ai-multimodal` 生成视觉素材
4. **导出**：通过 `chrome-devtools` 将截图以精确尺寸导出为 PNG
5. **展示**：并排展示所有选项，根据反馈进行迭代

### Banner：快速尺寸参考

| 平台 | 类型 | 尺寸（px） |
|----------|------|-----------|
| Facebook | 封面 | 820 x 312 |
| Twitter/X | 页眉 | 1500 x 500 |
| LinkedIn | 个人主页 | 1584 x 396 |
| YouTube | 频道艺术图 | 2560 x 1440 |
| Instagram | 快拍 | 1080 x 1920 |
| Instagram | 帖子 | 1080 x 1080 |
| Google Ads | 中矩形 | 300 x 250 |
| 网站 | Hero 区域 | 1920 x 600-1080 |

### Banner：主要艺术风格

| 风格 | 最适合的场景 |
|-------|----------|
| 极简主义 | SaaS、科技 |
| 大胆排版 | 公告 |
| 渐变 | 现代品牌 |
| 照片风格 | 生活方式、电商 |
| 几何 | 科技、金融科技 |
| 玻璃拟态 | SaaS、应用 |
| 霓虹/赛博朋克 | 游戏、活动 |

### Banner：设计规则

- 安全区域：关键信息应位于中央 70-80% 的区域内
- 每个 Banner 只设置一个 CTA，位于右下角，最小高度为 44px
- 最多使用 2 种字体，正文最小字号为 16px，标题最小字号为 ≥32px
- 广告文字占比低于 20%（Meta 会因此降低投放效果）
- 印刷：300 DPI、CMYK、3-5mm 出血大小规律

## 图标设计（内置）

15 种样式，12 个类别。Gemini 3.1 Pro Preview 生成 SVG 文本输出。

### 图标：生成单个图标

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "settings gear" --style outlined
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "shopping cart" --style filled --color "#6366F1"
python3 ~/.claude/skills/design/scripts/icon/generate.py --name "dashboard" --category navigation --style duotone
```

### 图标：生成批量变体

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "cloud upload" --batch 4 --output-dir ./icons
```

### 图标：导出多种尺寸

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "user profile" --sizes "16,24,32,48" --output-dir ./icons
```

### 图标：顶级样式

| 样式 | 最适合 |
|-------|----------|
| outlined | UI 界面、Web 应用 |
| filled | 移动应用、导航栏 |
| duotone | 营销、落地页 |
| rounded | 友好型应用、健康领域 |
| sharp | 科技、金融科技、企业 |
| flat | Material Design、Google 风格 |
| gradient | 现代品牌、SaaS |

**模型：** `gemini-3.1-pro-preview` — 仅文本输出（SVG 是 XML 文本）。无需图像生成 API。

## 社交媒体图片（内置）

多平台社交媒体图片设计：HTML/CSS → 截图导出。使用 `ui-ux-pro-max`、`brand`、`design-system`、`chrome-devtools` 技能。

加载 `references/social-photos-design.md` 以获取尺寸、模板和最佳实践。

### 社交媒体图片：工作流

1. **编排** — 使用 `project-management` 技能处理 TODO 任务；对独立工作使用并行子代理
2. **分析** — 解析提示词：主题、平台、风格、品牌背景、内容元素
3. **构思** — 提出 3-5 个概念，通过 `AskUserQuestion` 展示
4. **设计** — `/ckm:brand` → `/ckm:design-system` → 随机调用 `/ck:ui-ux-pro-max` 或 `/ck:frontend-design`；按每个创意 × 每种尺寸生成 HTML
5. **导出** — 使用 `chrome-devtools` 或 Playwright 按精确像素尺寸截图（2x deviceScaleFactor）
6. **验证** — 使用 Chrome MCP 或 `chrome-devtools` 技能对导出的设计进行视觉检查；修复布局/样式问题并重新导出
7. **报告** — 将设计决策摘要保存到 `plans/reports/`
8. **整理** — 调用 `assets-organizing` 技能对输出文件和报告进行分类整理

### 社交媒体图片：关键尺寸

| 平台 | 尺寸 (px) | 平台 | 尺寸 (px) |
|----------|-----------|----------|-----------|
| IG 帖子 | 1080×1080 | FB 帖子 | 1200×630 |
| IG 快拍 | 1080×1920 | X 帖子 | 1200×675 |
| IG 轮播 | 1080×1350 | LinkedIn | 1200×627 |
| YT 缩略图 | 1280×720 | Pinterest | 1000×1500 |

## 工作流

### 完整品牌套件

1. **Logo** → `scripts/logo/generate.py` → 生成 Logo 变体
2. **CIP** → `scripts/cip/generate.py --logo ...` → 创建交付物样机
3. **演示文稿** → 加载 `references/slides-create.md` → 构建路演演示文稿

### 新建设计系统

1. **品牌**（brand 技能）→ 定义颜色、字体排版和语调
2. **Tokens**（design-system 技能）→ 创建语义化令牌层
3. **实现**（ui-styling 技能）→ 配置 Tailwind、shadcn/ui

## 参考资料

| 主题 | 文件 |
|-------|------|
| 设计路由 | `references/design-routing.md` |
| Logo 设计指南 | `references/logo-design.md` |
| Logo 风格 | `references/logo-style-guide.md` |
| Logo 色彩 | `references/logo-color-psychology.md` |
| Logo 提示词 | `references/logo-prompt-engineering.md` |
| CIP 设计指南 | `references/cip-design.md` |
| CIP 交付物 | `references/cip-deliverable-guide.md` |
| CIP 风格 | `references/cip-style-guide.md` |
| CIP 提示词 | `references/cip-prompt-engineering.md` |
| 幻灯片创建 | `references/slides-create.md` |
| 幻灯片布局 | `references/slides-layout-patterns.md` |
| 幻灯片模板 | `references/slides-html-template.md` |
| 幻灯片文案 | `references/slides-copywriting-formulas.md` |
| 幻灯片策略 | `references/slides-strategies.md` |
| 横幅尺寸与风格 | `references/banner-sizes-and-styles.md` |
| 社交媒体图片指南 | `references/social-photos-design.md` |
| 图标设计指南 | `references/icon-design.md` |

## 脚本

| 脚本 | 用途 |
|--------|---------|
| `scripts/logo/search.py` | 搜索 Logo 风格、色彩和行业 |
| `scripts/logo/generate.py` | 使用 Gemini AI 生成 Logo |
| `scripts/logo/core.py` | Logo 数据的 BM25 搜索引擎 |
| `scripts/cip/search.py` | 搜索 CIP 交付物、风格和行业 |
| `scripts/cip/generate.py` | 使用 Gemini 生成 CIP 模拟图 |
| `scripts/cip/render-html.py` | 从 CIP 模拟图渲染 HTML 演示文稿 |
| `scripts/cip/core.py` | CIP 数据的 BM25 搜索引擎 |
| `scripts/icon/generate.py` | 使用 Gemini 3.1 Pro 生成 SVG 图标 |

## 前置条件

**Python：** 此 skill 使用 Python 脚本。在 Windows 上，使用 `python` 代替 `python3`（例如，使用 `python scripts/logo/search.py` 代替 `python3 scripts/logo/search.py`）。

检查是否已安装 Python：
```bash
python3 --version || python --version
```

## 设置

```bash
export GEMINI_API_KEY="your-key"  # https://aistudio.google.com/apikey
pip install google-genai pillow
```

> **Windows 注意事项：** 在需要时，使用 `python` 代替 `pip`（例如，使用 `python -m pip install ...`）。

## 集成

**外部子技能：** brand、design-system、ui-styling
**相关技能：** frontend-design、ui-ux-pro-max、ai-multimodal、chrome-devtools