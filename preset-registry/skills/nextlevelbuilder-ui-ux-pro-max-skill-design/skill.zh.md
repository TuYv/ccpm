---
name: design
description: "Comprehensive design skill: brand identity, design tokens, UI styling, logo generation (55 styles, Gemini AI), corporate identity program (50 deliverables, CIP mockups), HTML presentations (Chart.js), banner design (22 styles, social/ads/web/print), icon design (15 styles, SVG, Gemini 3.1 Pro), social photos (HTML→screenshot, multi-platform). Actions: design logo, create CIP, generate mockups, build slides, design banner, generate icon, create social photos, social media images, brand identity, design system. Platforms: Facebook, Twitter, LinkedIn, YouTube, Instagram, Pinterest, TikTok, Threads, Google Ads."
argument-hint: "[design-type] [context]"
license: MIT
metadata:
  author: claudekit
  version: "2.1.0"
---
# 设计

统一设计技能：品牌、tokens、UI、logo、CIP、slides、横幅、社交照片、图标。

## 何时使用

- 品牌识别、语气、素材
- 设计系统 tokens 和规格
- 使用 shadcn/ui + Tailwind 的 UI 样式
- Logo 设计与 AI 生成
- 企业形象识别系统（CIP）交付物
- 演示文稿与路演材料
- 社交媒体、广告、网页、印刷的横幅设计
- Instagram、Facebook、LinkedIn、Twitter、Pinterest、TikTok 的社交照片

## 子技能路由

| 任务 | 子技能 | 详情 |
|------|-----------|---------|
| 品牌识别、语气、素材 | `brand` | 外部技能 |
| Tokens、规格、CSS 变量 | `design-system` | 外部技能 |
| shadcn/ui、Tailwind、代码 | `ui-styling` | 外部技能 |
| Logo 创建、AI 生成 | Logo（内置） | `references/logo-design.md` |
| CIP 样机、交付物 | CIP（内置） | `references/cip-design.md` |
| 演示文稿、路演材料 | Slides（内置） | `references/slides.md` |
| 横幅、封面、页头 | Banner（内置） | `references/banner-sizes-and-styles.md` |
| 社交媒体图片/照片 | Social Photos（内置） | `references/social-photos-design.md` |
| SVG 图标、图标集 | Icon（内置） | `references/icon-design.md` |

## Logo 设计（内置）

55+ 风格，30 套配色，25 个行业指南。Gemini Nano Banana 模型。

### Logo：生成设计简报

```bash
python3 ~/.claude/skills/design/scripts/logo/search.py "tech startup modern" --design-brief -p "BrandName"
```

### Logo：搜索风格/配色/行业

```bash
python3 ~/.claude/skills/design/scripts/logo/search.py "minimalist clean" --domain style
python3 ~/.claude/skills/design/scripts/logo/search.py "tech professional" --domain color
python3 ~/.claude/skills/design/scripts/logo/search.py "healthcare medical" --domain industry
```

### Logo：AI 生成

**始终**以白色背景生成输出 logo 图片。

```bash
python3 ~/.claude/skills/design/scripts/logo/generate.py --brand "TechFlow" --style minimalist --industry tech
python3 ~/.claude/skills/design/scripts/logo/generate.py --prompt "coffee shop vintage badge" --style vintage
```

**重要：** 当脚本失败时，直接尝试修复脚本。

生成后，**始终**通过 `AskUserQuestion` 询问用户是否需要 HTML 预览。若是，则调用 `/ui-ux-pro-max` 进行画廊展示。

## CIP 设计（内置）

50+ 交付物，20 种风格，20 个行业。Gemini Nano Banana（Flash/Pro）。

### CIP：生成简报

```bash
python3 ~/.claude/skills/design/scripts/cip/search.py "tech startup" --cip-brief -b "BrandName"
```

### CIP：搜索域

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

**提示：** 如无 logo，先使用上方 Logo Design 部分。

## Slides（内置）

使用 Chart.js、设计 tokens、文案公式的策略性 HTML 演示文稿。

加载 `references/slides-create.md` 以获取创建工作流。

### Slides：知识库

| 主题 | 文件 |
|-------|------|
| 创建指南 | `references/slides-create.md` |
| 布局模式 | `references/slides-layout-patterns.md` |
| HTML 模板 | `references/slides-html-template.md` |
| 文案 | `references/slides-copywriting-formulas.md` |
| 策略 | `references/slides-strategies.md` |

## Banner 设计（内置）

跨社交、广告、网页、印刷共 22 种美术风格。使用 `frontend-design`、`ai-artist`、`ai-multimodal`、`chrome-devtools` 技能。

加载 `references/banner-sizes-and-styles.md` 获取完整尺寸与风格参考。

### Banner：工作流

1. 通过 `AskUserQuestion` **收集需求**——用途、平台、内容、品牌、风格、数量
2. **研究**——激活 `ui-ux-pro-max`，在 Pinterest 上浏览参考
3. **设计**——使用 `frontend-design` 创建 HTML/CSS 横幅，用 `ai-artist`/`ai-multimodal` 生成视觉
4. **导出**——通过 `chrome-devtools` 截图为精确尺寸 PNG
5. **呈现**——并排展示全部方案，并基于反馈迭代

### Banner：快速尺寸参考

| 平台 | 类型 | 尺寸（px） |
|----------|------|-----------|
| Facebook | 封面 | 820 x 312 |
| Twitter/X | 头图 | 1500 x 500 |
| LinkedIn | 个人主页 | 1584 x 396 |
| YouTube | 频道横幅 | 2560 x 1440 |
| Instagram | Story | 1080 x 1920 |
| Instagram | 帖子 | 1080 x 1080 |
| Google Ads | 大矩形 | 300 x 250 |
| 网站 | Hero | 1920 x 600-1080 |

### Banner：主要美术风格

| 风格 | 适用场景 |
|-------|----------|
| Minimalist | SaaS、科技 |
| Bold Typography | 公告 |
| Gradient | 现代品牌 |
| Photo-Based | 生活方式、电子商务 |
| Geometric | 科技、金融科技 |
| Glassmorphism | SaaS、应用 |
| Neon/Cyberpunk | 游戏、活动 |

### Banner：设计规则

- 安全区域：重要内容位于中心 70%-80%
- 每个横幅仅 1 个 CTA，位于右下角，最小高度 44px
- 最多 2 种字体，正文最小 16px，标题不小于 32px
- 广告文本占比不超过 20%（Meta 会惩罚）
- 打印：300 DPI、CMYK、3-5mm 出血线

## Icon 设计（内置）

15 种风格，12 个类别。Gemini 3.1 Pro Preview 生成 SVG 文本输出。

### Icon：生成单个图标

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "settings gear" --style outlined
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "shopping cart" --style filled --color "#6366F1"
python3 ~/.claude/skills/design/scripts/icon/generate.py --name "dashboard" --category navigation --style duotone
```

### Icon：批量生成变体

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "cloud upload" --batch 4 --output-dir ./icons
```

### Icon：多尺寸导出

```bash
python3 ~/.claude/skills/design/scripts/icon/generate.py --prompt "user profile" --sizes "16,24,32,48" --output-dir ./icons
```

### Icon：主流风格

| 风格 | 适用场景 |
|-------|----------|
| outlined | UI 界面、Web 应用 |
| filled | 移动端应用、导航栏 |
| duotone | 营销、落地页 |
| rounded | 友好型应用、健康领域 |
| sharp | 科技、金融科技、企业 |
| flat | Material Design、Google 风格 |
| gradient | 现代品牌、SaaS |

**模型：** `gemini-3.1-pro-preview`——仅文本输出（SVG 即 XML 文本）。无需图像生成 API。

## 社交照片（内置）

多平台社交图片设计：HTML/CSS → 截图导出。使用 `ui-ux-pro-max`、`brand`、`design-system`、`chrome-devtools` 技能。

加载 `references/social-photos-design.md` 获取尺寸、模板与最佳实践。

### Social Photos：工作流

1. **编排**——用 `project-management` 技能处理 TODO 任务；并行子代理执行独立工作
2. **分析**——解析提示词：主体、平台、风格、品牌背景、内容元素
3. **构思**——产出 3-5 个概念，并通过 `AskUserQuestion` 呈现
4. **设计**——`/ckm:brand` → `/ckm:design-system` → 随机调用 `/ck:ui-ux-pro-max` 或 `/ck:frontend-design`；按方案×尺寸生成 HTML
5. **导出**——使用 `chrome-devtools` 或 Playwright 在精确 px 下截图（2x deviceScaleFactor）
6. **验证**——用 Chrome MCP 或 `chrome-devtools` 技能进行视觉检查；修正布局/样式问题并重新导出
7. **汇报**——将总结写入 `plans/reports/`，包含设计决策
8. **整理**——调用 `assets-organizing` 技能对输出文件与报告进行归类

已命中受管 skill，但当前未加载：`ui-ux-pro-max`。  
请先确认我现在要启用哪个项？  

- 仅启用 `ui-ux-pro-max`（推荐）  
- 启用该 skill 所在的整组 plugin（如有）  
- 暂不启用，直接进行纯文本翻译（不使用受管 skill）
