---
name: baoyu-xhs-images
description: Generates infographic image card series with 12 visual styles, 8 layouts, and 3 color palettes. Breaks content into 1-10 cartoon-style image cards optimized for social media engagement. Use when user mentions "小红书图片", "小红书种草", "小绿书", "微信图文", "微信贴图", "image cards", "图片卡片", baoyu-xhs-images, or wants social media infographic series.
version: 2.0.1
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-xhs-images
---
# 图像卡片系列生成器

将复杂内容拆分为引人注目的图像卡片系列，并提供多种样式选项。

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前代理运行时提供的内置用户输入工具，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果没有此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持在一次调用中提出多个问题，则将所有适用问题合并到一次调用中；如果只支持单个问题，则按优先级顺序逐一提问。

以下具体的 `AskUserQuestion` 引用仅为示例——在其他运行时中，请替换为本地等效工具。

## 图像生成工具

当此技能需要渲染图像时，请按以下顺序确定后端：

1. **当前请求覆盖**——如果用户在当前消息中指定了特定后端，则使用该后端。
2. **已保存的偏好**——如果 `EXTEND.md` 将 `preferred_image_backend` 设置为当前可用的后端，则使用该后端。
3. **自动选择**（当偏好为 `auto`、未设置，或固定的后端不可用时）：
   - **Codex (`imagegen`)**——首先检查可用技能/工具清单。如果列出了名为 `imagegen` 的技能，则表示你正在 Codex 中运行，并且**必须**使用它：通过 `Skill` 工具调用，使用 `skill: "imagegen"`，传入已保存提示文件的内容（以及输出路径和宽高比，具体遵循 Codex `imagegen` 自身的参数）。Codex `imagegen` 是该运行时中的官方栅格后端，其优先级高于任何非原生技能（例如 `baoyu-image-gen`），除非用户明确固定了不同的 `preferred_image_backend`。
   - **通过 `codex exec` 使用 Codex (`codex-imagegen`)**——如果当前运行时未提供原生 `imagegen` 技能，但 `codex` CLI 位于 `PATH` 中且已执行 `codex login`，则通过 `baoyu-image-gen --provider codex-cli` 进行路由（优先），或者在 `baoyu-image-gen` 不可用时直接调用捆绑的包装器。详细信息、参数和运行时发现流程位于 [references/codex-imagegen.md](references/codex-imagegen.md) 中——仅当选择此分支时加载该文件。
   - **Cursor (`GenerateImage`)**——如果运行时提供原生 `GenerateImage` 工具，则表示你正在 Cursor 中运行；与 Codex 原生 `imagegen` 相同，它的优先级高于任何非原生技能。这里有两个重要注意事项：(a) 它没有宽高比参数——请在传递给 `description` 的提示文本中明确写出目标宽高比/尺寸；(b) 它不接受输出目录——文件会保存到工具管理的位置，因此生成后请将文件复制/移动到该技能预期的输出路径（例如 `outputs/.../NN-xxx.png`）。参考图像应放入 `reference_image_paths`。
   - **其他运行时原生工具**——如果运行时提供其他原生图像工具（例如 Hermes `image_generate`），请以相同方式使用。
   - 否则，如果恰好安装了一个非原生后端（例如 `baoyu-image-gen`），则使用该后端。
   - 否则（存在多个非原生后端且没有运行时原生工具），请向用户询问一次——与其他初始问题一并批量提问。
4. **如果没有可用后端**，请告知用户，并询问如何继续。

**⛔ 绝不要用 SVG、HTML、canvas 或其他基于代码的渲染方式替代栅格图像生成。** Codex `imagegen` 自己的说明指出，当“输出应为位图资源而不是仓库原生代码或矢量图”时应使用它。如果你无法通过第 3 步确定栅格后端，请进入第 4 步并询问用户——**不要**悄悄输出 SVG、编写内联 `<svg>` 标记，或制作 HTML/CSS 艺术图作为替代方案。即使文章/章节看起来“像图表”，此规则同样适用：调用此规则的消费方 skill 已经决定它需要的是栅格图像。

**⛔ 绝不要通过在生成的位图上涂绘来修复渲染出的文本。** 不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR 脚本或任何其他程序化叠加方式，来覆盖、重写、擦除、描边或替换已生成图像卡片内的标题、正文、副标题或任何其他文本。如果文本有误或不清晰，请使用修正后的提示词重新生成，切换到卡片内文本更少的布局，或者询问用户要保留哪个不完美的候选图。

设置 `preferred_image_backend: ask` 会在每次运行时强制显示第 3 步的提示，无论是否存在可用后端。用户可通过下方的 `## Changing Preferences` 章节更改固定的后端。

**提示词文件要求（强制）**：在调用任何后端**之前**，将每张图像完整的最终提示词写入 `prompts/` 下的独立文件（命名方式：`NN-{type}-[slug].md`）。该文件是可复现性记录，并且让你能够在不重新生成提示词的情况下切换后端。

上文中的具体工具名称（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）仅为示例——请按照相同规则替换为本地对应工具。

## 批量生成策略

在当前生成组的每个提示词文件都已保存并验证后，默认以批量方式生成图像。

优先级顺序：

1. 如果所选后端存在原生批量 / 多任务接口，请使用它。每个任务必须保留各自的提示词文件、输出路径、宽高比、会话 ID 和直接参考图像。
2. 如果不存在原生批量接口，但运行时可以发出并行工具调用，则一次最多分发 `generation_batch_size` 张图像。默认值：`4`。当前消息中用户的明确请求，例如 `--batch-size 4` 或“并行 4 张一起生成”，会覆盖 EXTEND.md。
3. 如果原生批量和并行工具调用都不可用，则按顺序生成。

规则：

- 遵循图像 1 的锚点链：先生成图像 1，再以图像 1 为参考批量生成图像 2+。
- 在为某一批次选定的每个提示词文件都已存在于磁盘上之前，绝不要启动该批次。
- 对失败项重试一次，不要重新生成成功项。
- 不要仅为了并行化图像渲染而使用子代理。仅将子代理用于独立的提示词迭代或创意探索。

## 确认策略

默认行为：**生成前确认**。

- 将显式 skill 调用、文件路径、匹配的信号/预设以及 `EXTEND.md` 默认值仅视为**推荐输入**。它们均不授权跳过确认。
- 在用户完成第 2 步之前，**不要**启动第 3 步。
- 仅当当前请求明确要求时才跳过确认，例如：`--yes`、“直接生成”、“不用确认”、“跳过确认”、“按默认出图”或等效表述。
- 如果明确跳过确认，请在生成前的下一次面向用户更新中说明所假定的策略 / 风格 / 布局 / 调色板 / 数量 / 后端。

## 语言

在提问、进度、错误和完成摘要中，使用用户的语言进行回应。保留技术标记（样式名称、文件路径、代码）的英文。

## 选项

| 选项 | 描述 |
|--------|-------------|
| `--style <name>` | 视觉样式（见下方“样式”） |
| `--layout <name>` | 信息布局（见下方“布局”） |
| `--palette <name>` | 颜色覆盖：macaron / warm / neon |
| `--preset <name>` | 样式 + 布局 + 可选调色板的简写（见下方“预设”；各预设的提示词片段位于 `references/style-presets.md`） |
| `--ref <files...>` | 应用于图片 1 的参考图片，作为系列锚点 |
| `--batch-size <n>` | 本次运行的临时生成批次大小。默认为 EXTEND.md 中的 `generation_batch_size`，否则为 4。限制在 1-8 之间。 |
| `--yes` | 非交互模式：跳过所有确认，使用 EXTEND.md 或内置默认值，自动确认推荐方案（路径 A） |

## 尺寸

三个相互独立的控制维度可自由组合：

| 维度 | 控制内容 | 选项 |
|-----------|----------|---------|
| **样式** | 视觉美学（线条、装饰、渲染） | 12 种样式（见下方“样式”） |
| **布局** | 信息结构（密度、排列） | 8 种布局（见下方“布局”） |
| **调色板**（可选） | 颜色覆盖，替换样式的默认颜色 | macaron / warm / neon（见下方“调色板”） |

示例：`--style notion --layout dense` 可生成一张知性的知识卡片；添加 `--palette macaron` 可在不改变 notion 渲染规则的情况下柔化颜色。`--preset` 是样式 + 布局（+ 可选调色板）的简写。

**调色板行为**：不使用 `--palette` → 使用样式的内置颜色；使用 `--palette <name>` → 仅覆盖颜色，渲染规则不变。某些样式声明了 `default_palette`（例如，sketch-notes 默认使用 macaron）。

## 样式（12）

| 样式 | 描述 |
|-------|-------------|
| `cute`（默认） | 甜美、可爱、少女感的美学风格 |
| `fresh` | 干净、清新、自然 |
| `warm` | 温馨、友好、平易近人 |
| `bold` | 高冲击力、引人注目 |
| `minimal` | 极简、精致 |
| `retro` | 复古、怀旧、时尚 |
| `pop` | 鲜艳、活力、吸睛 |
| `notion` | 极简手绘线条艺术，知性 |
| `chalkboard` | 黑板上的彩色粉笔，教育风格 |
| `study-notes` | 写实手写照片风格，蓝色笔迹 + 红色批注 + 黄色荧光笔 |
| `screen-print` | 大胆的海报艺术、半调纹理、有限色彩、象征性叙事 |
| `sketch-notes` | 手绘教育信息图，暖奶油底色上的马卡龙粉彩，摇摆线条 |

各样式规格：`references/presets/<style>.md`。

## 布局（8）

| 布局 | 描述 |
|--------|-------------|
| `sparse`（默认） | 1-2 个要点，最大化冲击力 |
| `balanced` | 3-4 个要点，标准布局 |
| `dense` | 5-8 个要点，知识卡片风格 |
| `list` | 枚举 / 排名（4-7 项） |
| `comparison` | 并列对比 |
| `flow` | 流程 / 时间线（3-6 个步骤） |
| `mindmap` | 中心放射式（4-8 个分支） |
| `quadrant` | 四象限 / 环形分区 |

布局规格：`references/elements/canvas.md`。

## 调色板（可选覆盖）

在保持渲染规则（线条处理、纹理）不变的前提下，替换风格的颜色。

| 调色板 | 背景 | 分区颜色 | 强调色 | 感受 |
|---------|------------|-------------|--------|------|
| `macaron` | 暖奶油色 #F5F0E8 | 蓝色 #A8D8EA、薰衣草色 #D5C6E0、薄荷色 #B5E5CF、蜜桃色 #F8D5C4 | 珊瑚色 #E8655A | 柔和、教育感 |
| `warm` | 柔和蜜桃色 #FFECD2 | 橙色 #ED8936、陶土色 #C05621、金色 #F6AD55、玫瑰色 #D4A09A | 赭棕色 #A0522D | 大地色调、温馨 |
| `neon` | 深紫色 #1A1025 | 青色 #00F5FF、洋红色 #FF00FF、绿色 #39FF14、粉色 #FF6EC7 | 黄色 #FFFF00 | 高能量、未来感 |

调色板规格：`references/palettes/<palette>.md`。

## 预设（风格 + 布局快捷方式）

按场景分组的快速入门组合。使用 `--preset <name>`，或在第 2 步中推荐。

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

**冲击力与观点**：

| 预设 | 风格 | 布局 | 最适合 |
|--------|-------|--------|----------|
| `warning` | bold | list | 避坑指南、重要提醒 |
| `versus` | bold | comparison | 正反对比 |
| `clean-quote` | minimal | sparse | 金句、极简封面 |
| `pro-summary` | minimal | balanced | 专业总结、商务内容 |

**潮流与娱乐**：

| 预设 | 风格 | 布局 | 最适合 |
|--------|-------|--------|----------|
| `retro-ranking` | retro | list | 复古排行、经典盘点 |
| `throwback` | retro | balanced | 怀旧分享 |
| `pop-facts` | pop | list | 趣味冷知识 |
| `hype` | pop | sparse | 炸裂封面、惊叹分享 |

**海报与编辑风格**：

| 预设 | 风格 | 布局 | 最适合 |
|--------|-------|--------|----------|
| `poster` | screen-print | sparse | 海报风封面、影评书评 |
| `editorial` | screen-print | balanced | 观点文章、文化评论 |
| `cinematic` | screen-print | comparison | 电影对比、戏剧张力 |

完整的提示词片段定义：`references/style-presets.md`。

## 自动选择

将内容信号匹配到最佳组合。首个包含相应关键词的行优先；若无匹配，则回退至 `cute-share`。

| 源内容中的信号 | 风格 | 布局 | 推荐预设 |
|-------------------|-------|--------|--------------------|
| 美妆、时尚、可爱、女孩、粉色 | `cute` | sparse/balanced | `cute-share`、`girly` |
| 健康、自然、清新、有机 | `fresh` | balanced/flow | `product-review`、`nature-flow` |
| 生活、故事、情感、温暖 | `warm` | balanced | `cozy-story` |
| 警告、重要、必须、关键 | `bold` | list/comparison | `warning`、`versus` |
| 专业、商务、优雅 | `minimal` | sparse/balanced | `clean-quote`、`pro-summary` |
| 经典、复古、传统 | `retro` | balanced | `throwback`、`retro-ranking` |
| 有趣、激动人心、哇、惊艳 | `pop` | sparse/list | `hype`、`pop-facts` |
| 知识、概念、生产力、SaaS | `notion` | dense/list | `knowledge-card`、`checklist` |
| 教育、教程、学习、课堂 | `chalkboard` | balanced/dense | `tutorial`、`classroom` |
| 笔记、手写、学习指南、真实感 | `study-notes` | dense/list/mindmap | `study-guide` |
| 电影、海报、观点、编辑风格、电影感 | `screen-print` | sparse/comparison | `poster`、`editorial`、`cinematic` |
| 手绘、信息图、工作流、手绘，图解 | `sketch-notes` | flow/balanced/dense | `hand-drawn-edu`、`sketch-card`、`sketch-summary` |

## 风格 × 布局矩阵

兼容性评分（✓✓ 强烈推荐，✓ 效果良好，✗ 避免使用）。当用户选择非默认组合，而你希望提示其匹配度不佳时使用。

|              | 稀疏 | 均衡 | 密集 | 列表 | 对比 | 流程 | 思维导图 | 象限 |
|--------------|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| 可爱         | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓  | ✓  | ✓  | ✓  |
| 清新         | ✓✓ | ✓✓ | ✓  | ✓  | ✓  | ✓✓ | ✓  | ✓  |
| 温暖         | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ | ✓  | ✓  | ✓  |
| 大胆         | ✓✓ | ✓  | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ |
| 极简         | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓  | ✓  | ✓  | ✓  |
| 复古         | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓  | ✓  | ✓  | ✓  |
| 流行         | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓  |
| notion       | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓✓ |
| 黑板         | ✓✓ | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  |
| 学习笔记     | ✗  | ✓  | ✓✓ | ✓✓ | ✓  | ✓  | ✓✓ | ✓  |
| 丝网印刷     | ✓✓ | ✓✓ | ✗  | ✓  | ✓✓ | ✓  | ✗  | ✓✓ |
| 手绘笔记     | ✓  | ✓✓ | ✓✓ | ✓✓ | ✓  | ✓✓ | ✓✓ | ✓  |

## 大纲策略

三种差异化方法——每种都会生成结构不同的大纲。工作流会推荐其中一种；路径 C 会生成全部三种并让用户选择。

| 策略 | 概念 | 最适合 | 结构 |
|----------|---------|----------|-----------|
| **A — 故事驱动** | 以个人经历为主线，情感共鸣优先 | 评测、个人分享、转变 | 钩子 → 问题 → 发现 → 体验 → 结论 |
| **B — 信息密集** | 价值优先，高效传递信息 | 教程、对比、清单 | 核心结论 → 信息卡片 → 优缺点 → 推荐 |
| **C — 视觉优先** | 以视觉冲击为核心，文字极简 | 高审美产品、生活方式、氛围内容 | 主视觉 → 细节图 → 生活方式场景 → CTA |

## 参考图片

用户提供的参考图与内部“image-1 作为锚点”的链路（步骤 3）**彼此独立**——二者会叠加生效。

**接收**：通过 `--ref <files...>` 或在对话中粘贴路径。
- 文件路径 → 复制到 `refs/NN-ref-{slug}.{ext}`
- 未附路径直接粘贴 → 要求提供路径，或提取风格特征作为文本后备方案

**使用模式**（每张参考图）：

| 使用方式 | 效果 |
|-------|--------|
| `direct` | 将文件传递给后端（通常仅用于图片 1，以便锚点沿链路传播） |
| `style` | 提取风格特征并追加到每张卡片的提示词正文中 |
| `palette` | 提取十六进制颜色并追加到每张卡片的提示词正文中 |

在每张受影响卡片的提示词前置元数据中记录参考图：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

生成时：验证文件是否存在。图片 1 使用 `usage: direct` 且后端接受参考图时 → 通过后端的参考图参数传递（成为链路锚点）。图片 2+ 继续按照步骤 3 使用 image-1 作为 `--ref`——**不要**再次叠加用户参考图（避免信号冲突）。对于 `style`/`palette`，将提取的特征嵌入每个提示词中。

## 文件布局

```
image-cards/{topic-slug}/
├── source-{slug}.{ext}
├── analysis.md
├── outline-strategy-{a,b,c}.md    # Path C only
├── outline.md
├── prompts/NN-{type}-{slug}.md
├── NN-{type}-{slug}.png
└── refs/                          # only if --ref used
```

**Slug**：2-4 个单词，使用 kebab-case。“AI 工具推荐” → `ai-tools-recommend`。如果发生冲突，追加 `-YYYYMMDD-HHMMSS`。

**备份规则**（全程适用）：覆盖任何文件之前——源文件、大纲、提示词、图片——将现有文件重命名为 `<name>-backup-YYYYMMDD-HHMMSS.<ext>`。这样可以保护用户的编辑内容。

## 工作流

```
- [ ] Step 0: Load EXTEND.md ⛔ BLOCKING (interactive only)
- [ ] Step 1: Analyze content → analysis.md
- [ ] Step 2: Smart Confirm ⚠️ REQUIRED (Path A / B / C)
- [ ] Step 3: Generate images
- [ ] Step 4: Completion report
```

### Step 0：加载 EXTEND.md ⛔ 阻塞性步骤

按以下顺序检查这些路径；以第一个命中的路径为准：

| 路径 | 范围 |
|------|-------|
| `.baoyu-skills/baoyu-xhs-images/EXTEND.md` | 项目 |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-xhs-images/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-xhs-images/EXTEND.md` | 用户主目录 |

- **找到** → 读取、解析并打印摘要（风格 / 布局 / 水印 / 语言），然后继续。
- **未找到 + 交互模式** → 执行首次设置（参见 `references/config/first-time-setup.md`），并在执行其他操作前保存设置。不要在偏好设置存在之前分析内容或询问风格问题——这样可以保持首次运行行为的一致性。
- **未找到 + `--yes`** → 跳过设置，使用内置默认值（无水印，自动选择风格/布局，语言根据内容确定）。不要提示，不要创建 EXTEND.md。

**EXTEND.md 键**：水印、首选风格/布局、自定义风格定义、语言偏好、首选图片后端、生成批次大小。架构：`references/config/preferences-schema.md`。

### Step 1：分析内容 → `analysis.md`

1. 保存源文件（如果存在 `source.md`，则适用备份规则）。
2. 根据 `references/workflows/analysis-framework.md` 执行深度分析：内容类型、钩子潜力、受众、互动信号、视觉机会图、滑动流程。
3. 检测源语言，选择推荐的图片数量（2-10）。
4. 使用上方的**自动选择**表，自动推荐策略 + 风格 + 布局 + 配色。
5. 将所有内容写入 `analysis.md`。

### Step 2：智能确认 ⚠️ 必需

**硬性门槛**：根据[确认策略](#confirmation-policy)，此步骤是必需的——在用户于此处确认（或在当前请求中通过 `--yes` / 等效措辞明确选择退出）之前，不得开始步骤 3。

目标是展示自动推荐的方案，并让用户确认或调整。使用 `--yes` 时完全跳过此步骤——根据分析结果及任何 CLI 覆盖项，继续执行路径 A。

**提问前显示摘要**：

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

然后提出一个问题——三种路径。选项原文：`references/confirmation.md`。

**路径 A — 快速确认**（信任自动推荐）：使用推荐的策略 + 风格生成单个大纲 → 保存至 `outline.md` → 第 3 步。

**路径 B — 自定义**：提出五个问题（策略/风格、布局、配色、数量、可选备注），并预先填入推荐选项——留空则保留推荐值。根据用户的选择生成一个大纲 → `outline.md` → 第 3 步。参见 `references/confirmation.md`。

**路径 C — 详细模式**：包含两个子确认步骤。

- *第 2a 步 — 内容理解*：询问卖点（多选）、受众、风格偏好（真实 / 专业 / 美观 / 自动）、可选背景信息。更新 `analysis.md`。
- *第 2b 步 — 三个大纲变体*：生成 `outline-strategy-a.md`、`outline-strategy-b.md`、`outline-strategy-c.md`。每个文件 MUST 具有不同的结构 AND 不同的推荐风格——在 frontmatter 中包含 `style_reason`。页数启发式：A 约 4-6 页，B 约 3-5 页，C 约 3-4 页。模板：`references/workflows/outline-template.md`；frontmatter 示例见 `references/confirmation.md`。
- *第 2c 步 — 选择*：提出三个问题（大纲 A/B/C/合并、风格、视觉元素）。将选定或合并后的大纲保存至 `outline.md` → 第 3 步。

### 第 3 步：生成图像

使用已确认的大纲 + 风格 + 布局 + 配色：

**视觉一致性——image-1 锚定链**：除非进行锚定，否则角色 / 吉祥物 / 色彩渲染会在多次调用之间发生漂移。先生成图像 1（封面），且不使用 `--ref`，然后将图像 1 作为 `--ref` 传递给后续每一张图像。这是此技能最重要的一致性技巧——即使后端也支持会话 ID，也不要跳过。

生成流程：

1. 将每张图像的完整提示词以用户偏好的语言写入 `prompts/NN-{type}-{slug}.md`（适用备份规则），然后确认所有选定的提示词文件均已存在。
2. 首先生成**图像 1**，且不使用 `--ref`；PNG 文件适用备份规则。这将建立锚点。
3. 使用图像 1 作为 `--ref <path-to-image-01.png>`，为**图像 2+**建立任务列表。
4. 根据 `## Batch Generation Policy` 分批调度图像 2+：优先使用后端原生批处理，其次使用运行时并行工具调用，最后才使用顺序调用作为回退方案。
5. 每完成一张图像后报告进度。失败时，仅使用同一个已保存的提示词文件对失败项目重试一次。

**水印**（如果 EXTEND.md 中已启用）：将以下内容追加到生成提示词中：

```
Include a subtle watermark "[content]" positioned at [position].
The watermark should be legible but not distracting.
```

参见 `references/config/watermark-guide.md`。

**后端选择**：根据顶部的 Image Generation Tools 规则——使用任何可用的后端；如果有多个后端，在任何生成操作之前询问一次。在 `--yes` 模式下，使用 EXTEND.md 中的偏好设置，并回退至第一个可用的后端。调用任何后端之前，提示词文件 MUST 已存在。

**`codex-imagegen` 调用**：当规则解析为 `codex-imagegen` 时，参见 [references/codex-imagegen.md](references/codex-imagegen.md) 了解调用契约（首选 `baoyu-image-gen --provider codex-cli` 路径、运行时包装器发现机制、参数说明、stdout 架构、批处理语义——每次调用 n=1，因此卡片批次必须为每张卡片调度一次包装器调用；该包装器不接受 `--sessionId`，因此一致性链必须通过上述第 3 步中的 `--ref` 实现）。

**会话 ID**（如果后端支持 `--sessionId`）：为每张图片使用 `cards-{topic-slug}-{timestamp}`；结合引用链，这能实现最大程度的一致性。

### 第 4 步：完成报告

```
图片卡片系列已完成！

主题：[topic]
模式：[Quick / Custom / Detailed]
策略：[A/B/C/Combined]
风格：[name]
调色板：[name or "default"]
布局：[name or "varies"]
位置：[directory]
图片：共 N 张

✓ analysis.md
✓ outline.md
✓ outline-strategy-a/b/c.md（仅详细模式）

- 01-cover-[slug].png ✓ 封面（稀疏）
- 02-content-[slug].png ✓ 内容（均衡）
- ...
- NN-ending-[slug].png ✓ 结尾（稀疏）
```

## 内容拆分原则

| 位置 | 目的 | 典型布局 |
|----------|---------|----------------|
| 封面（图片 1） | 吸引注意力 + 视觉冲击 | `sparse` |
| 内容（中间部分） | 每张图片传达核心价值 | `balanced` / `dense` / `list` / `comparison` / `flow` |
| 结尾（最后一张） | CTA / 总结 | `sparse` 或 `balanced` |

有关风格 × 布局兼容性矩阵，请参阅上方的**风格 × 布局矩阵**。

## 图片修改

| 操作 | 方法 |
|--------|-----|
| 编辑 | **先**更新 `prompts/NN-{type}-{slug}.md`，然后使用相同的会话 ID 重新生成 |
| 添加 | 指定位置，创建提示词，生成，将后续文件重命名为 `NN+1`，更新大纲 |
| 删除 | 移除文件，将后续文件重命名为 `NN-1`，更新大纲 |

重新生成前务必更新提示词文件——它是真实来源，并使修改可复现。

文本修正政策：

- 如果卡片的标题、正文文案、标签或任何其他渲染文本存在拼写错误、乱码、难以阅读或视觉效果不佳的问题，请勿使用代码修补位图。
- 对于文本修正后的重新生成，请编写新的提示词文件并使用新的输出路径，以便保留有问题的候选版本供比较。
- 后处理仅限于不改变文本或主要构图的裁剪、调整大小、压缩或格式转换。

## 参考资料

| 文件 | 内容 |
|------|---------|
| `references/confirmation.md` | 每条确认路径的逐字 AskUserQuestion 副本 |
| `references/style-presets.md` | 完整的预设快捷方式定义 |
| `references/presets/<style>.md` | 各风格的元素定义 |
| `references/palettes/<name>.md` | 各调色板的颜色定义 |
| `references/elements/canvas.md` | 宽高比、安全区域、网格布局 |
| `references/elements/image-effects.md` | 抠图、描边、滤镜 |
| `references/elements/typography.md` | 装饰文本、标签、文字方向 |
| `references/elements/decorations.md` | 强调标记、背景、涂鸦、边框 |
| `references/workflows/analysis-framework.md` | 内容分析框架 |
| `references/workflows/outline-template.md` | 带布局指南的大纲模板 |
| `references/workflows/prompt-assembly.md` | 提示词组装指南 |
| `references/config/preferences-schema.md` | EXTEND.md 架构 |
| `references/config/first-time-setup.md` | 首次设置流程 |
| `references/config/watermark-guide.md` | 水印配置 |

## 注意事项

- 生成失败时，报告错误前自动重试一次。
- 对于敏感的公众人物，请使用风格化的卡通替代方案。
- 必须使用智能确认（步骤 2）；详细模式会增加第二次确认（2a + 2c）。

## 更改偏好设置

EXTEND.md 位于步骤 0 中列出的第一个匹配路径。可通过三种方式更改它：

- **直接编辑** — 打开 EXTEND.md 并更改字段。完整架构：`references/config/preferences-schema.md`。
- **交互式重新配置** — 删除 EXTEND.md（或要求“reconfigure baoyu-xhs-images preferences” / “重新配置”）。下一次运行将重新触发首次设置。
- **常见的单行编辑**：
  - `preferred_image_backend: auto` — 默认值；优先使用运行时原生工具，回退到唯一已安装的后端，仅当存在多个非原生后端时才会询问。
  - `preferred_image_backend: codex-imagegen` — 固定使用 Codex 内置功能。
  - `preferred_image_backend: baoyu-image-gen` — 固定使用 baoyu-image-gen skill。
  - `preferred_image_backend: ask` — 每次运行都确认后端。
  - `generation_batch_size: 4` — 默认并发渲染图像数量，适用于后端/运行时支持批量或并行生成的情况。
  - `preferred_style: notion`, `preferred_layout: dense`, `preferred_palette: macaron`, `language: zh`。
  - `watermark.enabled: true` + `watermark.content: "@handle"` — 添加水印。