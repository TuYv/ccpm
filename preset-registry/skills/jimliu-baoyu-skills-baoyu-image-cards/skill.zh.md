---
name: baoyu-image-cards
description: Generates infographic image card series with 12 visual styles, 8 layouts, and 3 color palettes. Breaks content into 1-10 cartoon-style image cards optimized for social media engagement. Use when user mentions "小红书图片", "小红书种草", "小绿书", "微信图文", "微信贴图", "image cards", "图片卡片", or wants social media infographic series.
version: 1.57.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-image-cards
---
# 图像卡片系列生成器

将复杂内容拆解为吸睛的图像卡片系列，并提供多种风格选项。

## 用户输入工具

当此 skill 提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前 agent 运行时提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果没有此类工具，则输出一条带编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用提出多个问题，则将所有适用的问题合并到一次调用中；如果工具一次只能提出一个问题，则按优先级顺序逐个提问。

下面具体的 `AskUserQuestion` 引用仅作为示例——在其他运行时中，请替换为本地等效工具。

## 图像生成工具

当此 skill 需要渲染图像时，请按以下顺序解析后端：

1. **当前请求覆盖设置**——如果用户在当前消息中指定了某个后端，则使用该后端。
2. **已保存的偏好设置**——如果 `EXTEND.md` 将 `preferred_image_backend` 设置为当前可用的后端，则使用该后端。
3. **自动选择**（当偏好设置为 `auto`、未设置，或固定的后端当前不可用时）：
   - **Codex (`imagegen`)**——首先检查可用的 skills / 工具清单。如果列出了名为 `imagegen` 的 skill，则说明你正在 Codex 中运行，**必须**使用它：通过 `Skill` 工具调用，并将已保存提示文件的内容传入（同时根据 Codex `imagegen` 自身的参数传入输出路径和宽高比）。Codex `imagegen` 是该运行时中的官方栅格后端，其优先级高于任何非原生 skill（例如 `baoyu-imagine`），除非用户明确固定了其他 `preferred_image_backend`。
   - **其他运行时原生工具**——如果运行时提供了其他原生图像工具（例如 Hermes `image_generate`），则以相同方式使用它。
   - 否则，如果只安装了一个非原生后端（例如 `baoyu-imagine`），则使用该后端。
   - 否则（没有运行时原生工具，且存在多个非原生后端），请询问用户一次——与其他初始问题一并提问。
4. **如果没有任何可用后端**，请告知用户，并询问应如何继续。

**⛔ 切勿使用 SVG、HTML、canvas 或其他基于代码的渲染来替代栅格图像生成。** Codex `imagegen` 的自身描述指出，当输出应为位图资源而非仓库原生代码或矢量图时，应使用它。如果无法通过第 3 步解析出栅格后端，则执行第 4 步并询问用户——**不要**默默输出 SVG、编写内联 `<svg>` 标记，或生成 HTML/CSS 图形作为替代方案。即使文章/章节看起来“像是图表”，也同样适用：调用此规则的消费者 skill 已经决定其需要的是栅格图像。

**⛔ 切勿通过在已生成的位图上涂抹来修复渲染出的文字。**不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR 脚本或任何其他程序化叠加方式，去覆盖、重写、擦除、描边或替换已生成图像卡片中的标题、正文、标签或任何其他文字。如果文字错误或不清晰，请使用修正后的提示重新生成，切换到卡片上文字更少的布局，或询问用户应保留哪个不完美的候选项。

将 `preferred_image_backend: ask` 设置为无论可用后端如何，每次运行都强制执行第 3 步提示词。用户可通过下方的 `## Changing Preferences` 部分更改固定的后端。

**提示词文件要求（强制）**：在调用任何后端之前，必须将每张图像完整且最终确定的提示词写入 `prompts/` 下的独立文件中（命名格式：`NN-{type}-[slug].md`）。该文件是可复现性记录，也使你能够在不重新生成提示词的情况下切换后端。

上方的具体工具名称（`imagegen`、`image_generate`、`baoyu-imagine`）仅为示例 — 请在相同规则下替换为本地对应名称。

## 批量生成策略

当前生成组的每个提示词文件都已保存并验证后，默认以批次形式生成图像。

优先级顺序：

1. 如果所选后端存在原生批处理 / 多任务接口，则使用该接口。每个任务都必须保留各自的提示词文件、输出路径、宽高比、会话 ID 和直接引用图像。
2. 如果不存在原生批处理接口，但运行时可以发起并行工具调用，则一次最多调度 `generation_batch_size` 张图像。默认值：`4`。当前消息中的明确用户请求（例如 `--batch-size 4` 或“并行4张一起生成”）会覆盖 EXTEND.md。
3. 如果既没有原生批处理接口，也不支持并行工具调用，则按顺序生成。

规则：

- 遵守 image-1 锚点链：先生成图像 1，然后使用图像 1 作为参考图批量生成图像 2 及后续图像。
- 在该批次中所有选定的提示词文件都已写入磁盘之前，绝不启动批次。
- 失败的项目仅重试一次，不要重新生成已成功的项目。
- 不要仅为了并行渲染图像而使用子代理。仅在进行独立的提示词迭代或创意探索时使用子代理。

## 确认策略

默认行为：**生成前确认**。

- 将显式技能调用、文件路径、匹配的信号 / 预设以及 EXTEND.md 默认值仅视为推荐输入。它们均不授权跳过确认。
- 在用户完成第 2 步之前，不要开始第 3 步。
- 仅当当前请求明确要求跳过确认时才跳过确认，例如：`--yes`、“直接生成”、“不用确认”、“跳过确认”、“按默认出图”或等效表述。
- 如果明确跳过确认，则在生成前的下一条面向用户的更新中说明所采用的策略 / 风格 / 布局 / 配色 / 数量 / 后端。

## 语言

在问题、进度、错误和完成摘要中，使用用户所使用的语言进行回复。保留技术标记（样式名称、文件路径、代码）为英文。

## 选项

| 选项 | 描述 |
|--------|-------------|
| `--style <name>` | 视觉风格（参见下方的 Styles） |
| `--layout <name>` | 信息布局（参见下方的 Layouts） |
| `--palette <name>` | 配色覆盖：macaron / warm / neon |
| `--preset <name>` | 风格 + 布局 + 可选配色的简写（参见下方的 Presets；每个预设的提示词片段见 `references/style-presets.md`） |
| `--ref <files...>` | 应用于图像 1、作为系列锚点的参考图像 |
| `--batch-size <n>` | 本次运行的临时生成批次大小。默认值：EXTEND.md 中的 `generation_batch_size`，否则为 4。限制在 1-8 之间。 |
| `--yes` | 非交互模式：跳过所有确认，使用 EXTEND.md 或内置默认值，自动确认推荐方案（路径 A） |

## 维度

三个相互独立的旋钮可以自由组合：

| 维度 | 控制内容 | 选项 |
|-----------|----------|---------|
| **风格** | 视觉美学（线条、装饰、渲染） | 12 种风格（见下方的 Styles） |
| **布局** | 信息结构（密度、排列） | 8 种布局（见下方的 Layouts） |
| **配色**（可选） | 颜色覆盖，替换风格的默认颜色 | macaron / warm / neon（见下方的 Palettes） |

示例：`--style notion --layout dense` 会生成一张理性风格的知识卡片；添加 `--palette macaron` 可在不改变 notion 渲染规则的情况下柔化颜色。`--preset` 是 style + layout（+ 可选 palette）的简写。

**配色行为**：不使用 `--palette` → 使用风格内置的颜色；`--palette <name>` → 仅覆盖颜色，渲染规则保持不变。某些风格会声明 `default_palette`（例如，sketch-notes 默认使用 macaron）。

## 风格（12 种）

| 风格 | 描述 |
|-------|-------------|
| `cute`（默认） | 甜美、可爱、少女感的美学风格 |
| `fresh` | 简洁、清新、自然 |
| `warm` | 舒适、友好、平易近人 |
| `bold` | 高冲击力、吸引注意 |
| `minimal` | 极简、干净、精致 |
| `retro` | 复古、怀旧、时尚 |
| `pop` | 鲜艳、充满活力、引人注目 |
| `notion` | 极简手绘线稿风格，富有理性气质 |
| `chalkboard` | 黑板上的彩色粉笔画，具有教育属性 |
| `study-notes` | 逼真的手写照片风格，蓝色笔迹 + 红色批注 + 黄色荧光笔 |
| `screen-print` | 大胆的海报艺术风格，半色调纹理、有限配色、象征性叙事 |
| `sketch-notes` | 手绘教育信息图，暖奶油色背景上的马卡龙粉彩与抖动线条 |

各风格的具体规范：`references/presets/<style>.md`。

## 布局（8 种）

| 布局 | 描述 |
|--------|-------------|
| `sparse`（默认） | 1-2 个要点，最大化冲击力 |
| `balanced` | 3-4 个要点，标准布局 |
| `dense` | 5-8 个要点，知识卡片风格 |
| `list` | 枚举 / 排名（4-7 项） |
| `comparison` | 并列对比 |
| `flow` | 流程 / 时间线（3-6 个步骤） |
| `mindmap` | 中心辐射式（4-8 个分支） |
| `quadrant` | 四象限 / 圆形分区 |

布局规范：`references/elements/canvas.md`。

## 配色（可选覆盖）

替换风格的颜色，同时保留渲染规则（线条处理、纹理）不变。

| 配色 | 背景 | 区域颜色 | 强调色 | 感受 |
|---------|------------|-------------|--------|------|
| `macaron` | 暖奶油色 #F5F0E8 | 蓝色 #A8D8EA、薰衣草色 #D5C6E0、薄荷色 #B5E5CF、蜜桃色 #F8D5C4 | 珊瑚色 #E8655A | 柔和、具有教育感 |
| `warm` | 柔和蜜桃色 #FFECD2 | 橙色 #ED8936、陶土色 #C05621、金色 #F6AD55、玫瑰色 #D4A09A | 赭色 #A0522D | 大地色调、舒适 |
| `neon` | 深紫色 #1A1025 | 青色 #00F5FF、洋红色 #FF00FF、绿色 #39FF14、粉色 #FF6EC7 | 黄色 #FFFF00 | 高能量、未来感 |

配色规范：`references/palettes/<palette>.md`。

## 预设（风格 + 布局快捷方式）

按场景分组的快速启动组合。使用 `--preset <name>`，或在 Step 2 中进行推荐。

**知识与学习**：

| 预设 | 风格 | 布局 | 最适合 |
|--------|-------|--------|----------|
| `knowledge-card` | notion | dense | 干货知识卡、概念科普 |
| `checklist` | notion | list | 清单、排行榜 |
| `concept-map` | notion | mindmap | 概念图、知识脉络 |
| `swot` | notion | quadrant | SWOT 分析、四象限 |
| `tutorial` | chalkboard | flow | 教程步骤、操作流程 |
| `classroom` | chalkboard | balanced | 课堂笔记、知识讲解 |
| `study-guide` | study-notes | dense | 学习笔记、考试重点 |
| `hand-drawn-edu` | sketch-notes | flow | 手绘教程、流程图解 |
| `sketch-card` | sketch-notes | dense | 手绘知识卡 |
| `sketch-summary` | sketch-notes | balanced | 手绘总结、图文笔记 |

**生活方式与分享**：

| 预设 | 风格 | 布局 | 最适合 |
|--------|-------|--------|----------|
| `cute-share` | cute | balanced | 少女风分享、日常种草 |
| `girly` | cute | sparse | 甜美封面、氛围感 |
| `cozy-story` | warm | balanced | 生活故事、情感分享 |
| `product-review` | fresh | comparison | 产品对比、测评 |
| `nature-flow` | fresh | flow | 健康流程、自然主题 |

**影响力与观点**：

| 预设 | 风格 | 布局 | 最适合 |
|--------|-------|--------|----------|
| `warning` | bold | list | 避坑指南、重要提醒 |
| `versus` | bold | comparison | 正反对比 |
| `clean-quote` | minimal | sparse | 金句、极简封面 |
| `pro-summary` | minimal | balanced | 专业总结、商务内容 |

**趋势与娱乐**：

| 预设 | 风格 | 布局 | 最适合 |
|--------|-------|--------|----------|
| `retro-ranking` | retro | list | 复古排行、经典盘点 |
| `throwback` | retro | balanced | 怀旧分享 |
| `pop-facts` | pop | list | 趣味冷知识 |
| `hype` | pop | sparse | 炸裂封面、惊叹分享 |

**海报与编辑**：

| 预设 | 风格 | 布局 | 最适合 |
|--------|-------|--------|----------|
| `poster` | screen-print | sparse | 海报风封面、影评书评 |
| `editorial` | screen-print | balanced | 观点文章、文化评论 |
| `cinematic` | screen-print | comparison | 电影对比、戏剧张力 |

完整的提示词片段定义：`references/style-presets.md`。

## 自动选择

将内容信号匹配到最佳组合。关键词出现的第一行优先；如果没有匹配项，则回退到 `cute-share`。

| 来源中的信号 | 风格 | 布局 | 推荐预设 |
|-------------------|-------|--------|--------------------|
| beauty, fashion, cute, girl, pink | `cute` | sparse/balanced | `cute-share`, `girly` |
| health, nature, fresh, organic | `fresh` | balanced/flow | `product-review`, `nature-flow` |
| life, story, emotion, warm | `warm` | balanced | `cozy-story` |
| warning, important, must, critical | `bold` | list/comparison | `warning`, `versus` |
| professional, business, elegant | `minimal` | sparse/balanced | `clean-quote`, `pro-summary` |
| classic, vintage, traditional | `retro` | balanced | `throwback`, `retro-ranking` |
| fun, exciting, wow, amazing | `pop` | sparse/list | `hype`, `pop-facts` |
| knowledge, concept, productivity, SaaS | `notion` | dense/list | `knowledge-card`, `checklist` |
| education, tutorial, learning, classroom | `chalkboard` | balanced/dense | `tutorial`, `classroom` |
| notes, handwritten, study guide, realistic | `study-notes` | dense/list/mindmap | `study-guide` |
| movie, poster, opinion, editorial, cinematic | `screen-print` | sparse/comparison | `poster`, `editorial`, `cinematic` |
| hand-drawn, infographic, workflow, 手绘, 图解 | `sketch-notes` | flow/balanced/dense | `hand-drawn-edu`, `sketch-card`, `sketch-summary` |

## 风格 × 布局矩阵

兼容性评分（✓✓ 强烈推荐，✓ 效果良好，✗ 避免使用）。当用户选择非默认组合，且你想提示组合匹配度较低时使用。

|              | sparse | balanced | dense | list | comparison | flow | mindmap | quadrant |
|--------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| cute         | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓  | ✓  | ✓  | ✓  |
| fresh        | ✓✓ | ✓✓ | ✓  | ✓  | ✓  | ✓✓ | ✓  | ✓  |
| warm         | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ | ✓  | ✓  | ✓  |
| bold         | ✓✓ | ✓  | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ |
| minimal      | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓  | ✓  | ✓  | ✓  |
| retro        | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓  | ✓  | ✓  | ✓  |
| pop          | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓  |
| notion       | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ |
| chalkboard   | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  |
| study-notes  | ✗  | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ | ✓  |
| screen-print | ✓✓ | ✓✓ | ✗  | ✓  | ✓✓ | ✓  | ✗  | ✓✓ |
| sketch-notes | ✓  | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  |

## 大纲策略

三种各具差异的方法——每种都会生成结构不同的大纲。工作流会推荐其中一种；Path C 会生成全部三种大纲，供用户选择。

| 策略 | 概念 | 最适合 | 结构 |
|----------|---------|----------|-----------|
| **A — 故事驱动** | 以个人经历为主线，优先营造情感共鸣 | 评测、个人分享、转变过程 | 吸引点 → 问题 → 发现 → 经历 → 结论 |
| **B — 信息密集** | 价值优先，高效传递信息 | 教程、对比、检查清单 | 核心结论 → 信息卡片 → 优点/缺点 → 推荐 |
| **C — 视觉优先** | 以视觉冲击为核心，尽量减少文字 | 高审美产品、生活方式、氛围类内容 | 主视觉 → 细节镜头 → 生活方式场景 → CTA |

## 参考图片

用户提供的参考图与内部的“以 image-1 为锚点”链（步骤 3）**彼此独立**——用户参考图会叠加在该链之上。

**获取方式**：通过 `--ref <files...>` 或在对话中粘贴路径。
- 文件路径 → 复制到 `refs/NN-ref-{slug}.{ext}`
- 粘贴但未提供路径 → 询问路径，或提取风格特征作为文本备用方案

**使用模式**（每个参考图分别设置）：

| 使用方式 | 效果 |
|-------|--------|
| `direct` | 将文件传递给后端（通常仅用于图片 1，这样锚点会沿链传播） |
| `style` | 提取风格特征，并附加到每张卡片的提示词正文中 |
| `palette` | 提取十六进制颜色，并附加到每张卡片的提示词正文中 |

在每张受影响卡片的提示词 frontmatter 中记录参考图：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

生成时：验证文件是否存在。对于 `usage: direct` 且后端接受参考图的图片 1 → 通过后端的 ref 参数传入（成为链的锚点）。图片 2+ 继续按照步骤 3 使用 image-1 作为 `--ref`——不要再次叠加用户参考图（避免产生冲突信号）。对于 `style`/`palette`，将提取出的特征嵌入每个提示词中。

## 文件布局

```
image-cards/{topic-slug}/
├── source-{slug}.{ext}
├── analysis.md
├── outline-strategy-{a,b,c}.md    # 仅路径 C
├── outline.md
├── prompts/NN-{type}-{slug}.md
├── NN-{type}-{slug}.png
└── refs/                          # 仅在使用 --ref 时
```

**Slug**：2-4 个单词，使用 kebab-case。“AI 工具推荐” → `ai-tools-recommend`。如果发生冲突，则追加 `-YYYYMMDD-HHMMSS`。

**备份规则**（全程适用）：覆盖任何文件之前——源文件、提纲、提示词、图像——将现有文件重命名为 `<name>-backup-YYYYMMDD-HHMMSS.<ext>`。这可以保护用户的编辑内容。

## 工作流

```
- [ ] 步骤 0：加载 EXTEND.md ⛔ 阻塞性步骤（仅交互模式）
- [ ] 步骤 1：分析内容 → analysis.md
- [ ] 步骤 2：智能确认 ⚠️ 必需（路径 A / B / C）
- [ ] 步骤 3：生成图像
- [ ] 步骤 4：完成报告
```

### 步骤 0：加载 EXTEND.md ⛔ 阻塞性步骤

按以下顺序检查这些路径；以第一个命中的路径为准：

| 路径 | 作用域 |
|------|-------|
| `.baoyu-skills/baoyu-image-cards/EXTEND.md` | 项目 |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-image-cards/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-image-cards/EXTEND.md` | 用户主目录 |

- **找到** → 读取、解析并打印摘要（风格 / 布局 / 水印 / 语言），然后继续。
- **未找到 + 交互模式** → 执行首次设置（参见 `references/config/first-time-setup.md`），并在其他操作之前保存设置。不要在偏好设置存在之前分析内容或询问风格问题——这样可以确保首次运行行为可预测。
- **未找到 + `--yes`** → 跳过设置，使用内置默认值（无水印，自动选择风格/布局，语言根据内容确定）。不要提示，不要创建 EXTEND.md。

**EXTEND.md 字段**：水印、首选风格/布局、自定义风格定义、语言偏好、首选图像后端、生成批次大小。架构：`references/config/preferences-schema.md`。

### 步骤 1：分析内容 → `analysis.md`

1. 保存源文件（如果存在 `source.md`，则适用备份规则）。
2. 执行 `references/workflows/analysis-framework.md` 中的深度分析：内容类型、吸引力潜力、受众、互动信号、视觉机会图、滑动流程。
3. 检测源语言，选择建议的图像数量（2-10）。
4. 使用上方的**自动选择**表，自动推荐策略 + 风格 + 布局 + 配色。
5. 将所有内容写入 `analysis.md`。

### 步骤 2：智能确认 ⚠️ 必需

**硬性门槛**：根据[确认策略](#confirmation-policy)，此步骤是强制性的——在用户于此处确认（或在当前请求中使用 `--yes` / 等效措辞明确选择退出）之前，不得开始步骤 3。

目标是展示自动推荐的方案，并让用户确认或调整。使用 `--yes` 时完全跳过此步骤——根据分析结果及任何 CLI 覆盖项继续执行路径 A。

**询问前显示摘要**：

```
📋 内容分析
  主题：[topic] | 类型：[content_type]
  要点：[key points]
  受众：[audience]

🎨 推荐方案（自动匹配）
  策略：[A/B/C] [name]（[reason]）
  风格：[style] · 布局：[layout] · 配色：[palette or 默认] · 预设：[preset]
  图片：[N]张（封面+[N-2]内容+结尾）
  元素：[background] / [decorations] / [emphasis]
```

然后提出一个问题——三条路径。选项原文：`references/confirmation.md`。

**路径 A — 快速确认**（信任自动推荐）：使用推荐的策略 + 风格生成一个大纲 → 保存为 `outline.md` → 第 3 步。

**路径 B — 自定义**：提出五个问题（策略/风格、布局、配色、数量、可选备注），并预先填入推荐选项——留空则保留推荐值。使用用户的选择生成一个大纲 → `outline.md` → 第 3 步。参见 `references/confirmation.md`。

**路径 C — 详细模式**：进行两次子确认。

- *第 2a 步 — 内容理解*：询问卖点（多选）、受众、风格偏好（真实 / 专业 / 美观 / 自动）、可选背景信息。更新 `analysis.md`。
- *第 2b 步 — 三个大纲变体*：生成 `outline-strategy-a.md`、`outline-strategy-b.md`、`outline-strategy-c.md`。每个大纲都**必须**采用不同的结构和不同的推荐风格——在 frontmatter 中加入 `style_reason`。页数启发式规则：A 约 4-6 页，B 约 3-5 页，C 约 3-4 页。模板：`references/workflows/outline-template.md`；frontmatter 示例见 `references/confirmation.md`。
- *第 2c 步 — 选择*：提出三个问题（大纲 A/B/C/合并版、风格、视觉元素）。将选定或合并后的大纲保存为 `outline.md` → 第 3 步。

### 第 3 步：生成图片

确定大纲 + 风格 + 布局 + 配色后：

**视觉一致性——image-1 锚点链**：除非进行锚定，否则角色 / 吉祥物 / 色彩渲染会在多次调用之间发生漂移。首先生成图片 1（封面），**不要**使用 `--ref`，然后将图片 1 作为 `--ref` 传递给后续每一张图片。这是此技能中最重要的一致性技巧——即使后端还支持 session ID，也不要跳过。

生成流程：

1. 将每张图片的完整提示词以用户偏好的语言写入 `prompts/NN-{type}-{slug}.md`（适用备份规则），然后验证所有选定的提示词文件都存在。
2. 首先生成**图片 1**，不使用 `--ref`；PNG 文件适用备份规则。这将建立锚点。
3. 使用图片 1 作为 `--ref <path-to-image-01.png>`，为**图片 2 及后续图片**创建任务列表。
4. 根据 `## Batch Generation Policy` 分批分发图片 2 及后续图片：优先使用后端原生批处理，其次使用运行时并行工具调用，最后才使用顺序处理作为备用方案。
5. 每完成一张图片后报告进度。如果失败，只使用同一个已保存的提示词文件对失败项目重试一次。

**水印**（如果 `EXTEND.md` 中已启用）：将以下内容追加到生成提示词中：

```
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting.
```

参见 `references/config/watermark-guide.md`。

**后端选择**：根据顶部的 Image Generation Tools 规则——使用任何可用的后端；如果有多个后端，在任何生成操作之前询问一次。在 `--yes` 模式下，使用 `EXTEND.md` 中的偏好设置，并在不可用时回退到第一个可用的后端。调用任何后端之前，提示词文件**必须**存在。

**Session ID**（如果后端支持 `--sessionId`）：对每张图片使用 `cards-{topic-slug}-{timestamp}`；结合引用链可实现最大程度的一致性。

### 第 4 步：完成报告

```
Image Card Series Complete!

Topic: [topic]
Mode: [Quick / Custom / Detailed]
Strategy: [A/B/C/Combined]
Style: [name]
Palette: [name or "default"]
Layout: [name or "varies"]
Location: [directory]
Images: N total

✓ analysis.md
✓ outline.md
✓ outline-strategy-a/b/c.md (detailed mode only)

- 01-cover-[slug].png ✓ Cover (sparse)
- 02-content-[slug].png ✓ Content (balanced)
- ...
- NN-ending-[slug].png ✓ Ending (sparse)
```

## 内容拆分原则

| 位置 | 用途 | 典型布局 |
|----------|---------|----------------|
| Cover (image 1) | 吸引注意 + 视觉冲击 | `sparse` |
| Content (middle) | 每张图片的核心价值 | `balanced` / `dense` / `list` / `comparison` / `flow` |
| Ending (last) | CTA / 总结 | `sparse` or `balanced` |

风格 × 布局兼容性矩阵请参见上方的 **Style × Layout Matrix**。

## 图片修改

| 操作 | 方法 |
|-----|-----|
| 编辑 | **先**更新 `prompts/NN-{type}-{slug}.md`，然后使用相同的 session ID 重新生成 |
| 添加 | 指定位置，创建提示词，生成图片，将后续文件重新编号为 `NN+1`，更新大纲 |
| 删除 | 删除文件，将后续文件重新编号为 `NN-1`，更新大纲 |

重新生成前务必先更新提示词文件——它是事实来源，也能确保修改可复现。

文字修正策略：

- 如果卡片的标题、正文文案、标签或任何其他渲染文字存在拼写错误、乱码、难以阅读或视觉效果较弱的问题，请勿使用代码修补位图。
- 对于文字修正重新生成，请编写新的提示词文件并使用新的输出路径，以保留有问题的候选版本供比较。
- 后处理仅限于不改变文字或主体构图的裁剪、缩放、压缩或格式转换。

## 参考资料

| 文件 | 内容 |
|------|---------|
| `references/confirmation.md` | 每条确认路径所使用的 AskUserQuestion 文案原文 |
| `references/style-presets.md` | 完整的预设快捷方式定义 |
| `references/presets/<style>.md` | 各风格的元素定义 |
| `references/palettes/<name>.md` | 各配色的颜色定义 |
| `references/elements/canvas.md` | 宽高比、安全区域、网格布局 |
| `references/elements/image-effects.md` | 抠图、描边、滤镜 |
| `references/elements/typography.md` | 装饰文字、标签、文字方向 |
| `references/elements/decorations.md` | 强调标记、背景、涂鸦、边框 |
| `references/workflows/analysis-framework.md` | 内容分析框架 |
| `references/workflows/outline-template.md` | 包含布局指南的大纲模板 |
| `references/workflows/prompt-assembly.md` | 提示词组装指南 |
| `references/config/preferences-schema.md` | EXTEND.md 架构 |
| `references/config/first-time-setup.md` | 首次设置流程 |
| `references/config/watermark-guide.md` | 水印配置 |

## 注意事项

- 生成失败时自动重试一次，然后再报告错误。
- 对于敏感的公众人物，请使用风格化的卡通替代方案。
- Smart Confirm（第 2 步）是必需的；Detailed 模式会增加第二次确认（2a + 2c）。

## 更改偏好设置

EXTEND.md 位于步骤 0 中列出的第一个匹配路径。可通过三种方式更改它：

- **直接编辑** — 打开 EXTEND.md 并修改字段。完整 schema：`references/config/preferences-schema.md`。
- **交互式重新配置** — 删除 EXTEND.md（或提出“reconfigure baoyu-image-cards preferences” / “重新配置”）。下一次运行将重新触发首次设置。
- **常见的单行编辑**：
  - `preferred_image_backend: auto` — 默认值；优先使用运行时原生工具，回退到唯一已安装的后端，仅当存在多个非原生后端时才询问。
  - `preferred_image_backend: codex-imagegen` — 固定使用 Codex 内置后端。
  - `preferred_image_backend: baoyu-imagine` — 固定使用 baoyu-imagine skill。
  - `preferred_image_backend: ask` — 每次运行都确认后端。
  - `generation_batch_size: 4` — 当后端/运行时支持批量或并行生成时，默认并发渲染的图片数量。
  - `preferred_style: notion`, `preferred_layout: dense`, `preferred_palette: macaron`, `language: zh`。
  - `watermark.enabled: true` + `watermark.content: "@handle"` — 添加水印。