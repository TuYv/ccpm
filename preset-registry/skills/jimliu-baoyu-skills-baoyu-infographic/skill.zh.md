---
name: baoyu-infographic
description: Generate professional infographics with 21 layout types and 22 visual styles. Analyzes content, recommends layout×style combinations, and generates publication-ready infographics. Use when user asks to create "infographic", "信息图", "visual summary", "可视化", or "高密度信息大图".
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-infographic
---
# 信息图生成器

两个维度：**布局**（信息结构）× **风格**（视觉美学）。可自由组合任意布局与任意风格。

## 用户输入工具

当此技能需要提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用当前代理运行时提供的内置用户输入工具**——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出一条带编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量处理**：如果该工具支持每次调用多个问题，请将所有适用问题合并为一次调用；如果仅支持单个问题，则按照优先级逐个提问。

下文具体的 `AskUserQuestion` 引用仅为示例——在其他运行时中请替换为本地等效工具。

## 图像生成工具

当此技能需要渲染图像时，请按以下顺序确定后端：

1. **当前请求覆盖**——如果用户在当前消息中指定了特定后端，请使用该后端。
2. **已保存的偏好**——如果 `EXTEND.md` 将 `preferred_image_backend` 设置为当前可用的后端，请使用它。
3. **自动选择**（当偏好为 `auto`、未设置，或固定的后端不可用时）：
   - **Codex (`imagegen`)**——首先检查可用技能/工具清单。如果列出了名为 `imagegen` 的技能，则说明你正在 Codex 内运行，并且必须使用它：通过 `Skill` 工具调用，指定 `skill: "imagegen"`，并传入已保存提示词文件的内容（以及根据 Codex `imagegen` 自身参数传入输出路径和宽高比）。除非用户明确固定了不同的 `preferred_image_backend`，否则 Codex `imagegen` 是该运行时中的官方栅格后端，其优先级高于任何非原生技能（例如 `baoyu-image-gen`）。
   - **通过 `codex exec` 的 Codex（`codex-imagegen`）**——如果当前运行时未提供原生 `imagegen` 技能，但 `PATH` 中存在 `codex` CLI 且已启用有效的 `codex login`，则通过 `baoyu-image-gen --provider codex-cli`（首选）进行路由；或者——如果 `baoyu-image-gen` 不可用——直接调用内置包装器。详细信息、参数和运行时发现流程位于 [references/codex-imagegen.md](references/codex-imagegen.md)——仅当选择此分支时加载该文件。
   - **Cursor (`GenerateImage`)**——如果运行时提供原生 `GenerateImage` 工具，则说明你正在 Cursor 内运行；与 Codex `imagegen` 相同，它的优先级高于任何非原生技能。存在两个严格注意事项：(a) 它没有宽高比参数——请在作为 `description` 传入的提示文本中明确说明目标宽高比/尺寸；(b) 它不接受输出目录——会保存至由工具管理的位置，因此生成后请将文件复制/移动到技能预期的输出路径（例如 `outputs/.../NN-xxx.png`）。参考图像应放在 `reference_image_paths` 中。
   - **其他运行时原生工具**——如果运行时提供其他原生图像工具（例如 Hermes `image_generate`），请以相同方式使用。
   - 否则，如果恰好安装了一个非原生后端（例如 `baoyu-image-gen`），请使用它。
   - 否则（存在多个非原生后端且没有运行时原生工具），请向用户询问一次——与其他初始问题一并批量处理。
4. **如果均不可用**，请告知用户，并询问如何继续。

**⛔ 切勿使用 SVG、HTML、canvas 或其他基于代码的渲染方式来替代栅格图像生成。** Codex `imagegen` 自身的描述指出，当输出应为位图资源而非仓库原生代码或矢量图时，应使用它。如果你无法通过第 3 步确定可用的栅格后端，则应进入第 4 步并询问用户——**不要**悄悄输出 SVG、编写内联 `<svg>` 标记，或以 HTML/CSS 艺术作品作为替代。即使文章/章节看起来“类似图表”，此规则同样适用：调用此规则的消费者 skill 已经确定它需要的是栅格图像。

**⛔ 切勿通过在生成的位图上涂画来修复渲染出的文本。** 不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR 脚本或任何其他程序化叠加方式，去覆盖、重写、擦除、描边或替换已生成信息图中的标签、标题、标注、数据值或其他任何文本。如果文本有误或不清晰，请根据修正后的提示词重新生成、改用图内文字更少的布局，或询问用户希望保留哪个不完美的候选方案。

设置 `preferred_image_backend: ask` 会在每次运行时强制执行第 3 步的提示，无论是否存在可用后端。用户可通过下方的 `## Changing Preferences` 部分更改固定后端。

**提示词文件要求（强制）**：在调用任何后端**之前**，将每张图像完整的最终提示词写入 `prompts/` 下的独立文件（命名：`NN-{type}-[slug].md`）。后端接收提示词文件（或其内容）；该文件是可复现性记录，并让你能够在无需重新生成提示词的情况下切换后端。

上文中的具体工具名称（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）仅为示例——请按照相同规则替换为本地的对应工具。

## 参考图像

用户可以提供参考图像，以指导风格、调色板、构图或主体。

**接收**：通过 `--ref <files...>` 接受，或者在用户提供文件路径 / 在对话中粘贴图像时接受。
- 文件路径 → 将其复制到输出目录旁的 `refs/NN-ref-{slug}.{ext}`
- 无路径的粘贴图像 → 根据上述用户输入工具规则，向用户询问路径；或者将风格特征以文字形式提取，作为文本回退方案
- 无参考图像 → 跳过本节

**使用模式**（每个参考图像）：

| 用法 | 效果 |
|-------|--------|
| `direct` | 将文件作为参考图像传递给后端 |
| `style` | 提取风格特征（线条处理、纹理、氛围）并追加到提示词正文 |
| `palette` | 从图像中提取十六进制颜色并追加到提示词正文 |

存在参考图像时，在 `prompts/infographic.md` frontmatter 中**记录**：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

**生成时**：
- 验证每个被引用的文件是否存在于磁盘上
- 如果 `usage: direct` **且**所选后端接受参考图像（例如通过 `--ref` 使用的 `baoyu-image-gen`）→ 通过后端的 ref 参数传递该文件
- 否则 → 在提示词文本中嵌入提取出的 `style`/`palette` 特征

## 确认策略

默认行为：**生成前确认**。

- 将显式技能调用、文件路径、匹配的关键词快捷方式、`EXTEND.md` 默认设置和文档中规定的默认组合，**仅视为推荐输入**。它们都无权授权跳过确认。
- 在用户确认组合/比例/语言/后端选项之前，**不要开始 Step 5 或 Step 6**。
- 仅当当前请求明确要求跳过确认时，才跳过确认，例如：`--no-confirm`、“直接生成”、“不用确认”、“跳过确认”、“按默认出图”或同等措辞。
- 如果明确跳过确认，则在生成前的下一次面向用户的更新中，说明所采用的组合/比例/语言/后端。

## 选项

| 选项 | 值 |
|--------|--------|
| `--layout` | 21 个选项（参见 Layout Gallery），默认：bento-grid |
| `--style` | 22 个选项（参见 Style Gallery），默认：craft-handmade |
| `--aspect` | 命名比例：landscape (16:9)、portrait (9:16)、square (1:1)。自定义：任意 W:H 比例（例如 3:4、4:3、2.35:1） |
| `--lang` | en、zh、ja 等 |
| `--no-confirm` | 仅当用户明确要求直接生成而不确认时跳过 Step 4 |
| `--ref <files...>` | 参考图像（文件路径），用于提供风格/配色/构图/主体方面的参考 |

## Layout Gallery（21 个）

| Layout | 适用场景 |
|----------|----------|
| `linear-progression` | 时间线、流程、教程 |
| `binary-comparison` | A 与 B、前后对比、优缺点 |
| `comparison-matrix` | 多因素比较 |
| `hierarchical-layers` | 金字塔、优先级层级 |
| `tree-branching` | 类别、分类体系 |
| `hub-spoke` | 中心概念及相关项目 |
| `structural-breakdown` | 爆炸图、剖面图 |
| `bento-grid` | 多个主题、概览（默认） |
| `iceberg` | 表面与隐藏层面 |
| `bridge` | 问题与解决方案 |
| `funnel` | 转化、筛选 |
| `isometric-map` | 空间关系 |
| `dashboard` | 指标、KPI |
| `periodic-table` | 分类集合 |
| `comic-strip` | 叙事、序列 |
| `story-mountain` | 情节结构、紧张弧线 |
| `jigsaw` | 相互关联的部分 |
| `venn-diagram` | 重叠概念 |
| `winding-roadmap` | 旅程、里程碑 |
| `circular-flow` | 循环、重复流程 |
| `dense-modules` | 高密度模块、数据丰富的指南 |

完整定义位于 `references/layouts/<layout>.md`。

## Style Gallery（22 个）

| Style | 描述 |
|-------|-------------|
| `craft-handmade` | 手绘、纸艺（默认） |
| `claymation` | 3D 黏土人物、定格动画 |
| `kawaii` | 日式可爱风、柔和粉彩 |
| `storybook-watercolor` | 柔和的绘画风、充满奇趣 |
| `chalkboard` | 黑板上的粉笔画 |
| `cyberpunk-neon` | 霓虹光效、未来主义 |
| `bold-graphic` | 漫画风、半色调 |
| `aged-academia` | 复古科学风、棕褐色调 |
| `corporate-memphis` | 扁平矢量、鲜艳色彩 |
| `technical-schematic` | 蓝图、工程制图 |
| `origami` | 折纸、几何图形 |
| `pixel-art` | 复古 8 位风格 |
| `ui-wireframe` | 灰度界面线框图 |
| `subway-map` | 交通线路图 |
| `ikea-manual` | 极简线稿 |
| `knolling` | 整齐排列的平铺摄影 |
| `lego-brick` | 积木搭建 |
| `pop-laboratory` | 蓝图网格、坐标标记、实验室般的精确感 |
| `morandi-journal` | 手绘涂鸦、温暖的莫兰迪色调 |
| `retro-pop-grid` | 20 世纪 70 年代复古波普艺术、瑞士网格、粗描边 |
| `hand-drawn-edu` | 马卡龙粉彩、手绘抖动感、简笔人物 |
| `retro-popup-pop` | 复古弹窗拼贴、复古 UI、粗描边、扁平波普色彩 |

完整定义见 `references/styles/<style>.md`。

## 推荐组合

| 内容类型 | 布局 + 风格 |
|--------------|----------------|
| 时间线/历史 | `linear-progression` + `craft-handmade` |
| 分步流程 | `linear-progression` + `ikea-manual` |
| A vs B | `binary-comparison` + `corporate-memphis` |
| 层级结构 | `hierarchical-layers` + `craft-handmade` |
| 重叠 | `venn-diagram` + `craft-handmade` |
| 转化 | `funnel` + `corporate-memphis` |
| 循环 | `circular-flow` + `craft-handmade` |
| 技术 | `structural-breakdown` + `technical-schematic` |
| 指标 | `dashboard` + `corporate-memphis` |
| 教育 | `bento-grid` + `chalkboard` |
| 旅程 | `winding-roadmap` + `storybook-watercolor` |
| 分类 | `periodic-table` + `bold-graphic` |
| 产品指南 | `dense-modules` + `morandi-journal` |
| 技术指南 | `dense-modules` + `pop-laboratory` |
| 潮流指南 | `dense-modules` + `retro-pop-grid` |
| 复古流行指南 | `dense-modules` + `retro-popup-pop` |
| 教育图示 | `hub-spoke` + `hand-drawn-edu` |
| 流程教程 | `linear-progression` + `hand-drawn-edu` |

默认组合：`bento-grid` + `craft-handmade`（仅作为后备推荐——根据[确认策略](#confirmation-policy)，默认值绝不会绕过第 4 步）。

## 关键词快捷方式

当用户输入包含这些关键词时，使用映射的布局作为第 3 步的首要推荐，并将列出的风格提升至第 3 步列表的顶部。对于匹配的关键词，跳过基于内容的布局推断。将任何 `Prompt Notes` 附加到第 5 步提示词中。

| 用户关键词 | 布局 | 推荐风格 | 默认比例 | 提示词说明 |
|--------------|--------|--------------------|----------------|--------------|
| 高密度信息大图 / high-density-info | `dense-modules` | `morandi-journal`, `pop-laboratory`, `retro-pop-grid`, `retro-popup-pop` | 纵向 | — |
| 信息图 / infographic | `bento-grid` | `craft-handmade` | 横向 | 极简主义：干净的画布、充足的留白、没有复杂的背景纹理。仅使用简单的卡通元素和图标。 |

## 输出结构

```
infographic/{topic-slug}/
├── source-{slug}.{ext}
├── analysis.md
├── structured-content.md
├── prompts/infographic.md
└── infographic.png
```

Slug：从主题生成 2-4 个词的 kebab-case。冲突时：追加 `-YYYYMMDD-HHMMSS`。

## 核心原则

- 忠实保留源数据——不得总结或改写（但在将其包含到输出前，**移除所有凭据、API 密钥、令牌或机密信息**）
- 在组织内容之前定义学习目标
- 为视觉传达组织内容（标题、标签、视觉元素）

## 工作流程

### 第 1 步：设置与分析

**1.1 加载偏好设置 (EXTEND.md)**

按优先级顺序检查 EXTEND.md——找到的第一个即生效：

| 优先级 | 路径 | 范围 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-infographic/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-infographic/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-infographic/EXTEND.md` | 用户主目录 |

| 结果 | 操作 |
|--------|--------|
| 已找到 | 读取、解析并显示一行摘要 |
| 未找到 | 使用 `AskUserQuestion` 询问用户（参见 `references/config/first-time-setup.md`） |

**EXTEND.md 支持**：首选布局/风格、默认宽高比、语言偏好、首选图像后端、自定义风格定义。

架构：`references/config/preferences-schema.md`

**1.2 分析内容 → `analysis.md`**

1. 保存源内容（文件路径或粘贴内容 → `source.md`）
   - **备份规则**：如果 `source.md` 存在，将其重命名为 `source-backup-YYYYMMDD-HHMMSS.md`
2. 分析：主题、数据类型、复杂度、语气、受众
3. 检测源语言和用户语言
4. 从用户输入中提取设计指令
5. 保存分析结果
   - **备份规则**：如果 `analysis.md` 存在，将其重命名为 `analysis-backup-YYYYMMDD-HHMMSS.md`

详细格式请参见 `references/analysis-framework.md`。

### 第 2 步：生成结构化内容 → `structured-content.md`

将内容转换为信息图结构：
1. 标题和学习目标
2. 包含以下内容的章节：关键概念、内容（逐字保留）、视觉元素、文本标签
3. 数据点（所有统计数据/引文均须逐字复制）
4. 来自用户的设计指令

**规则**：仅使用 Markdown。不添加新信息。如实保留数据。从输出中移除任何凭据或机密信息。

详细格式请参见 `references/structured-content-template.md`。

### 第 3 步：推荐组合

**3.1 首先检查关键词快捷方式**：如果用户输入匹配 **关键词快捷方式** 表中的关键词，请将关联布局作为首要推荐，并优先将关联风格作为首选推荐。跳过基于内容的布局推断。

**3.2 否则**，基于以下因素推荐 3-5 种布局×风格组合：
- 数据结构 → 匹配的布局
- 内容语气 → 匹配的风格
- 受众预期
- 用户设计指令

### 第 4 步：确认选项

**强制关卡**：根据[确认策略](#confirmation-policy)，此步骤为必需步骤——在用户于此处确认之前（或在当前请求中通过 `--no-confirm` / 等效方式明确选择退出），不得开始第 5–6 步。

按照本文件顶部的[用户输入工具](#user-input-tools)规则，要求用户确认以下问题（如果运行时支持多个问题，则将其合并为一次调用；否则按优先级顺序逐一询问）。

| 优先级 | 问题 | 何时 | 选项 |
|----------|----------|------|---------|
| 1 | **组合** | 始终 | 3 种以上布局×风格组合，并附带理由 |
| 2 | **宽高比** | 始终 | 命名预设（横向/纵向/方形）或自定义 W:H 比例（例如 3:4、4:3、2.35:1） |
| 3 | **语言** | 仅当源语言 ≠ 用户语言时 | 文本内容使用的语言 |
| 4 | **图像后端** | 仅当 `## Image Generation Tools` 规则的第 3 步需要询问时（没有运行时原生工具且存在多个非原生后端，或者 `preferred_image_backend: ask`） | 可用后端 |

### 第 5 步：生成提示词 → `prompts/infographic.md`

**备份规则**：如果 `prompts/infographic.md` 存在，将其重命名为 `prompts/infographic-backup-YYYYMMDD-HHMMSS.md`

组合：
1. 来自 `references/layouts/<layout>.md` 的布局定义
2. 来自 `references/styles/<style>.md` 的风格定义
3. 来自 `references/base-prompt.md` 的基础模板
4. 来自步骤 2 的结构化内容
5. 所有已确认语言的文本

`{{ASPECT_RATIO}}` 的**宽高比解析**：
- 命名预设 → 比例字符串：landscape→`16:9`，portrait→`9:16`，square→`1:1`
- 自定义 W:H 比例 → 按原样使用（例如，`3:4`、`4:3`、`2.35:1`）

### 步骤 6：生成图像

1. 根据本文件顶部的 `## Image Generation Tools` 规则解析后端。
2. 在调用后端**之前**，确保完整的最终提示词已持久化保存至 `prompts/infographic.md`（已在步骤 5 中写入）——该文件是可复现性记录。
3. **检查现有文件**：生成前，检查 `infographic.png` 是否存在
   - 如果存在：重命名为 `infographic-backup-YYYYMMDD-HHMMSS.png`
4. 使用提示词文件和输出路径调用选定的后端。
   - **`codex-imagegen` 调用**：当规则解析为 `codex-imagegen` 时，请参阅 [references/codex-imagegen.md](references/codex-imagegen.md) 了解调用契约（首选 `baoyu-image-gen --provider codex-cli` 路径、运行时包装器发现、参数说明、stdout 架构、批处理语义）。
5. 如果失败，自动重试一次

文本修正策略：

- 如果标签、标题、标注、数据值或任何其他渲染文本存在拼写错误、乱码、难以阅读或视觉效果不佳，请勿使用代码修补位图。
- 对于文本修正再生成，请写入新的提示词文件和新的输出路径，以便保留有缺陷的候选结果用于比较。
- 后处理仅限于不改变文本或主体构图的裁剪、调整尺寸、压缩或格式转换。

### 步骤 7：输出摘要

报告：主题、布局、风格、宽高比、语言、图像后端、输出路径、已创建文件。

## 参考资料

- `references/analysis-framework.md` - 分析方法论
- `references/structured-content-template.md` - 内容格式
- `references/base-prompt.md` - 提示词模板
- `references/layouts/<layout>.md` - 21 种布局定义
- `references/styles/<style>.md` - 21 种风格定义

## 更改偏好设置

EXTEND.md 位于步骤 1.1 中第一个匹配的路径。可通过以下三种方式更改：

- **直接编辑** — 打开 EXTEND.md 并更改字段。完整架构：`references/config/preferences-schema.md`。
- **交互式重新配置** — 删除 EXTEND.md（或请求“reconfigure baoyu-infographic preferences” / “重新配置”）。下一次运行将重新触发首次设置。
- **常见单行编辑**：
  - `preferred_image_backend: auto` — 默认值；运行时原生工具优先，如不可用则回退到唯一已安装的后端，仅在存在多个非原生后端时询问。
  - `preferred_image_backend: codex-imagegen` — 固定使用 Codex 内置后端。
  - `preferred_image_backend: baoyu-image-gen` — 固定使用 baoyu-image-gen skill。
  - `preferred_image_backend: ask` — 每次运行时确认后端。
  - `preferred_layout: dense-modules`, `preferred_style: morandi-journal`, `preferred_aspect: portrait`, `language: zh` — 调整步骤 3 的推荐项和步骤 4 的默认值（根据[确认策略](#confirmation-policy)，这些设置绝不会跳过步骤 4）。