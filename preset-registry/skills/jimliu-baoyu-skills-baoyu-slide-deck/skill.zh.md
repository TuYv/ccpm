---
name: baoyu-slide-deck
description: Generates professional slide deck images from content. Creates outlines with style instructions, then generates individual slide images. Use when user asks to "create slides", "make a presentation", "generate deck", "slide deck", or "PPT".
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-slide-deck
    requires:
      anyBins:
        - bun
        - npx
---
# 幻灯片组生成器

将内容转换为专业的幻灯片组图片。该幻灯片组旨在用于**阅读和分享**（幻灯片需能够自我说明、具有符合逻辑的滚动流程、适合社交媒体），而不是现场演示——以下每一项布局和信息密度决策都基于这一假设。

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前代理运行时提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出一条带编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用提出多个问题，则将所有适用问题合并到一次调用中；如果每次只能提出一个问题，则按优先级顺序逐个提问。

下面具体的 `AskUserQuestion` 引用仅作为示例——在其他运行时中，请替换为本地等效工具。

## 图像生成工具

当此技能需要渲染图像时，请按以下顺序确定后端：

1. **当前请求覆盖设置**——如果用户在当前消息中指定了某个后端，则使用该后端。
2. **已保存的偏好设置**——如果 `EXTEND.md` 将 `preferred_image_backend` 设置为当前可用的后端，则使用该后端。
3. **自动选择**（当偏好设置为 `auto`、未设置，或固定的后端不可用时）：
   - **Codex (`imagegen`)**——首先检查可用技能/工具清单。如果列出了名为 `imagegen` 的技能，则表示你正在 Codex 中运行，**必须**使用该技能：通过 `Skill` 工具调用，并将已保存提示文件的内容传入，另根据 Codex `imagegen` 自身的参数传入输出路径和宽高比。Codex `imagegen` 是该运行时中的官方光栅后端，其优先级高于任何非原生技能（例如 `baoyu-image-gen`），除非用户明确固定了不同的 `preferred_image_backend`。
   - **通过 `codex exec` 使用 Codex (`codex-imagegen`)**——如果当前运行时未提供原生 `imagegen` 技能，但 `codex` CLI 位于 `PATH` 中且已执行有效的 `codex login`，则通过 `baoyu-image-gen --provider codex-cli` 路由（首选）；或者，如果 `baoyu-image-gen` 不可用，则直接调用随附的包装器。详细信息、参数和运行时发现流程位于 [references/codex-imagegen.md](references/codex-imagegen.md)——仅当选择此分支时加载该文件。
   - **Cursor (`GenerateImage`)**——如果运行时提供原生 `GenerateImage` 工具，则表示你正在 Cursor 中运行；它与 Codex 原生 `imagegen` 的优先级相同，高于非原生技能。有两个必须注意的限制：(a) 它没有宽高比参数——请在传递给 `description` 的提示文本中明确写出目标宽高比/尺寸；(b) 它不接受输出目录——文件会保存到工具管理的位置，因此生成后请将文件复制/移动到该技能所需的输出路径（例如 `outputs/.../NN-xxx.png`）。参考图像放入 `reference_image_paths`。
   - **其他运行时原生工具**——如果运行时提供其他原生图像工具（例如 Hermes `image_generate`），请以相同方式使用。
   - 否则，如果恰好安装了一个非原生后端（例如 `baoyu-image-gen`），则使用该后端。
   - 否则（存在多个非原生后端，且没有运行时原生工具），请仅询问用户一次——并将其与其他初始问题合并提问。
4. **如果没有任何可用后端**，请告知用户，并询问如何继续。

**⛔ 永远不要用 SVG、HTML、canvas 或其他基于代码的渲染来替代栅格图像生成。** Codex `imagegen` 自身的描述说明了：当输出应为位图资源，而不是仓库原生代码或矢量图时，应使用它。如果无法通过步骤 3 解析出栅格后端，则转到步骤 4 并询问用户 — **不要**悄悄输出 SVG、编写内联 `<svg>` 标记，或生成 HTML/CSS 艺术图作为替代方案。即使文章/章节看起来“像图表”也是如此：调用此规则的使用者技能已经确定它需要的是栅格图像。

**⛔ 永远不要通过在生成的位图上涂抹来修复渲染出的文本。** 不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR 脚本或任何其他程序化叠加方式，去遮盖、重写、擦除、描边或替换已经生成的幻灯片图像中的标题、项目符号或任何其他文本。如果文本错误或不清晰，请使用修正后的提示重新生成，简化幻灯片图像中的文本，或询问用户要保留哪个不完美的候选版本。

设置 `preferred_image_backend: ask` 会强制每次运行都执行步骤 3 的提示，无论是否存在可用后端。用户可以通过下面的 `## 更改偏好设置` 部分更改固定的后端。

**提示文件要求（硬性要求）**：在调用任何后端之前，必须将每张图像完整、最终的提示写入 `prompts/` 下的独立文件中（命名格式：`NN-slide-[slug].md`）。该文件是可复现性记录，使你能够在不重新生成提示的情况下切换后端。

上面的具体工具名称（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）只是示例 — 请替换为遵循相同规则的本地等效工具。

## 批量生成策略

保存并验证当前生成组的所有提示文件后，默认以批次生成幻灯片图像。

优先级顺序：

1. 如果所选后端存在原生批处理/多任务接口，则使用该接口。每个任务都必须保留各自的提示文件、输出路径、宽高比、会话 ID 和直接引用图像。
2. 如果不存在原生批处理接口，但运行时可以发起并行工具调用，则每次最多分发 `generation_batch_size` 张幻灯片图像。默认值为 `4`。当前消息中的明确用户请求（例如 `--batch-size 4` 或“并行4张一起生成”）会覆盖 EXTEND.md。
3. 如果原生批处理和并行工具调用都不可用，则按顺序生成。

规则：

- 在所有选定的幻灯片提示文件都已存在于磁盘上之前，绝不要启动第一批生成。
- 失败的项目重试一次，成功的项目不要重新生成。
- 不要仅仅为了并行图像渲染而使用子代理。仅在进行单独的提示迭代或创意探索时使用子代理。
- 只有在所有选定的幻灯片图像都生成完毕后，才合并 PPTX/PDF。

## 确认策略

默认行为：生成前确认。

- 将明确的技能调用、文件路径、匹配的信号/预设以及 EXTEND.md 默认值仅视为建议输入。它们都不代表可以跳过确认。
- 在用户完成步骤 2 之前，不要开始步骤 3 或后续步骤。
- 只有当前请求明确表示无需确认时，才跳过确认，例如：“直接生成”、“不用确认”、“跳过确认”、“按默认出幻灯片”或同等措辞。
- 如果用户明确跳过确认，则在生成前的下一次面向用户的更新中，说明所采用的风格 / 受众 / 幻灯片数量 / 语言 / 后端。

## 语言

在问题、进度报告、错误消息和完成摘要中，使用用户所使用的语言进行回复。技术标记（样式名称、文件路径、代码）保持 English。

## 脚本目录

`{baseDir}` = 此 SKILL.md 所在的目录。解析 `${BUN_X}`：优先使用 `bun`；否则使用 `npx -y bun`；否则建议执行 `brew install oven-sh/bun/bun`。

| 脚本 | 用途 |
|--------|---------|
| `scripts/merge-to-pptx.ts` | 将幻灯片合并为 PowerPoint |
| `scripts/merge-to-pdf.ts` | 将幻灯片合并为 PDF |

## 选项

| 选项 | 描述 |
|--------|-------------|
| `--style <name>` | 预设（见下方的 Presets）、`custom` 或自定义样式名称 |
| `--audience <type>` | beginners / intermediate / experts / executives / general |
| `--lang <code>` | 输出语言（en、zh、ja，……） |
| `--slides <N>` | 目标幻灯片数量（建议 8-25，最多 30） |
| `--ref <files...>` | 应用于每张幻灯片的参考图像（样式 / 配色 / 构图 / 主题） |
| `--batch-size <n>` | 本次运行的临时幻灯片图像生成批大小。默认使用 EXTEND.md 中的 `generation_batch_size`，否则为 4。限制在 1-8 之间。 |
| `--outline-only` | 在大纲完成后停止 |
| `--prompts-only` | 在提示词完成后停止（跳过图像生成） |
| `--images-only` | 跳转至步骤 7；需要已有的 `prompts/` |
| `--regenerate <N>` | 重新生成指定幻灯片：`3` 或 `2,5,8` |

## 样式系统

包含 17 个覆盖技术 / 教育 / 生活方式 / 编辑出版等使用场景的预设。每个预设都是四个维度（纹理 / 氛围 / 排版 / 密度）的组合。如果用户在 Round 1 中选择“Custom dimensions”，确认流程的 Round 2 会针对每个维度提出一个问题——选项和逐字文案位于 `references/confirmation.md`。

### 预设（17 个）

| 预设 | 维度 | 最适合 |
|--------|------------|----------|
| `blueprint` (Default) | grid + cool + technical + balanced | 建筑、系统设计 |
| `chalkboard` | organic + warm + handwritten + balanced | 教育、教程 |
| `corporate` | clean + professional + geometric + balanced | 投资人演示文稿、提案 |
| `minimal` | clean + neutral + geometric + minimal | 高管简报 |
| `sketch-notes` | organic + warm + handwritten + balanced | 教育、教程 |
| `hand-drawn-edu` | organic + macaron + handwritten + balanced | 教育图表、流程讲解 |
| `watercolor` | organic + warm + humanist + minimal | 生活方式、健康养生 |
| `dark-atmospheric` | clean + dark + editorial + balanced | 娱乐、游戏 |
| `notion` | clean + neutral + geometric + dense | 产品演示、SaaS |
| `bold-editorial` | clean + vibrant + editorial + balanced | 产品发布、主题演讲 |
| `editorial-infographic` | clean + cool + editorial + dense | 技术讲解、研究 |
| `fantasy-animation` | organic + vibrant + handwritten + minimal | 教育叙事 |
| `intuition-machine` | clean + cool + technical + dense | 技术文档、学术 |
| `pixel-art` | pixel + vibrant + technical + balanced | 游戏、开发者演讲 |
| `scientific` | clean + cool + technical + dense | 生物、化学、医学 |
| `vector-illustration` | clean + vibrant + humanist + balanced | 创意、儿童内容 |
| `vintage` | paper + warm + editorial + balanced | 历史、文化遗产 |

每个预设的规格：`references/styles/<preset>.md`。预设 → 维度映射：`references/dimensions/presets.md`。

### 维度（选择“自定义维度”时）

| 维度 | 选项 | 用途 |
|-----------|---------|---------|
| **纹理** | clean, grid, organic, pixel, paper | 背景处理 |
| **氛围** | professional, warm, cool, vibrant, dark, neutral, macaron | 色彩温度 |
| **字体排版** | geometric, humanist, handwritten, editorial, technical | 标题/正文样式 |
| **密度** | minimal, balanced, dense | 每张幻灯片的信息量 |

每个维度的完整规格：`references/dimensions/*.md`。

### 自动选择

将内容信号与预设匹配。选择信号关键词出现在源文本中的第一行；如果没有匹配项，则回退到 `blueprint`。

| 源文本中的信号 | 预设 |
|-------------------|--------|
| tutorial, learn, education, guide, beginner | `sketch-notes` |
| hand-drawn, infographic, diagram, process, onboarding | `hand-drawn-edu` |
| classroom, teaching, school, chalkboard | `chalkboard` |
| architecture, system, data, analysis, technical | `blueprint` |
| creative, children, kids, cute | `vector-illustration` |
| briefing, academic, research, bilingual | `intuition-machine` |
| executive, minimal, clean, simple | `minimal` |
| saas, product, dashboard, metrics | `notion` |
| investor, quarterly, business, corporate | `corporate` |
| launch, marketing, keynote, magazine | `bold-editorial` |
| entertainment, music, gaming, atmospheric | `dark-atmospheric` |
| explainer, journalism, science communication | `editorial-infographic` |
| story, fantasy, animation, magical | `fantasy-animation` |
| gaming, retro, pixel, developer | `pixel-art` |
| biology, chemistry, medical, scientific | `scientific` |
| history, heritage, vintage, expedition | `vintage` |
| lifestyle, wellness, travel, artistic | `watercolor` |

### 幻灯片数量启发式

| 源文本长度 | 推荐幻灯片数量 |
|---------------|--------------------|
| < 1000 words | 5-10 |
| 1000-3000 words | 10-18 |
| 3000-5000 words | 15-25 |
| > 5000 words | 20-30（考虑拆分） |

## 参考图像

用户可以提供参考图像，以指导样式、配色、布局或主题。

**接收方式**：通过 `--ref <files...>` 接收，或在对话中提供文件路径/粘贴图像。
- 文件路径 → 复制到 `{slide-deck-dir}/refs/NN-ref-{slug}.{ext}`
- 未提供路径的粘贴图像 → 询问路径，或以文字形式提取样式特征作为备用方案

**使用模式**（每个参考图像分别设置）：

| 使用方式 | 效果 |
|-------|--------|
| `direct` | 将文件作为每张幻灯片的参考图像传递给后端 |
| `style` | 提取样式特征（线条处理、纹理、氛围），并追加到每张幻灯片的提示词正文中 |
| `palette` | 提取十六进制颜色，并追加到每张幻灯片的提示词正文中 |

在每张幻灯片的提示词 frontmatter 中记录参考图像：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-brand.png
    usage: direct
```

生成时，验证文件是否存在。如果 `usage: direct` 且后端接受参考图像（例如 `baoyu-image-gen --ref`），则在每张幻灯片中传递该文件。否则，将提取的 `style`/`palette` 特征嵌入提示词文本中。

## 文件布局

```
slide-deck/{topic-slug}/
├── source-{slug}.{ext}
├── outline.md
├── prompts/NN-slide-{slug}.md
├── NN-slide-{slug}.png
├── {topic-slug}.pptx
└── {topic-slug}.pdf
```

**Slug**：2-4 个单词，使用 kebab-case，从主题中提取。"Introduction to Machine Learning" → `intro-machine-learning`。

**备份规则**（适用于所有步骤）：如果即将写入的文件已经存在，请在写入新文件前将其重命名为 `<name>-backup-YYYYMMDD-HHMMSS.<ext>`。这样可以保护用户编辑内容，并支持回滚。

## 工作流

复制此清单，并在完成各项后勾选：

```
- [ ] Step 1: Setup & analyze
- [ ] Step 2: Confirmation ⚠️ REQUIRED (Round 1; Round 2 only if "Custom dimensions")
- [ ] Step 3: Generate outline
- [ ] Step 4: Review outline (conditional)
- [ ] Step 5: Generate prompts
- [ ] Step 6: Review prompts (conditional)
- [ ] Step 7: Generate images
- [ ] Step 8: Merge to PPTX/PDF
- [ ] Step 9: Output summary
```

### 步骤 1：设置与分析

**1.1 加载 EXTEND.md** —— 按以下顺序检查这些路径；以第一个命中的路径为准：

| 路径 | 作用域 |
|------|-------|
| `.baoyu-skills/baoyu-slide-deck/EXTEND.md` | 项目 |
| `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-slide-deck/EXTEND.md` | XDG |
| `$HOME/.baoyu-skills/baoyu-slide-deck/EXTEND.md` | 用户主目录 |

如果找到该文件，请读取、解析并打印摘要（风格 / 受众 / 语言 / 审阅 / 生成批次大小）。如果未找到，则使用默认值继续——首次设置不会阻塞此 skill。Schema：`references/config/preferences-schema.md`。

**1.2 分析内容** —— 遵循 `references/analysis-framework.md`：对内容进行分类，检测语言，记录用于风格选择的信号，根据长度估算幻灯片数量（参见上方风格系统中的 **幻灯片数量启发式规则**），生成主题 slug。将源文件保存为 `source.md`（如果文件已存在，遵循备份规则）。

**1.3 检查现有输出** ⚠️ 在步骤 2 之前必须执行。如果 `slide-deck/{topic-slug}/` 已存在，请询问如何继续——有四个选项（重新生成大纲 / 重新生成图片 / 备份并重新生成 / 退出），具体文本请逐字复制 `references/confirmation.md`。

将分析结果保存到 `analysis.md`：主题、受众、信号、推荐风格和幻灯片数量、语言检测结果。

### 步骤 2：确认 ⚠️ 必须执行

**硬性门槛**：根据[确认政策](#confirmation-policy)，此步骤是必需的——在用户于此处确认之前，步骤 3 及后续步骤都不能开始（除非用户在当前请求中使用“直接生成”或等效措辞明确选择跳过）。

**第 1 轮（始终执行）** —— 在一次 `AskUserQuestion` 调用中批量提出五个问题：风格、受众、幻灯片数量、是否审阅大纲、是否审阅提示词。选项请逐字复制 `references/confirmation.md`。

在问题之前显示以下摘要：
- 内容类型 + 主题
- 检测到的语言
- 推荐风格（基于信号）
- 推荐幻灯片数量（基于长度）

**第 2 轮（仅当第 1 轮选择了 "Custom dimensions" 时执行）** —— 批量提出四个问题：纹理、氛围、字体排版、信息密度。四个答案将替换预设值。

**确认后**：使用最终选择更新 `analysis.md`，并保存 Q4/Q5 中的 `skip_outline_review` / `skip_prompt_review` 标志。

### 步骤 3：生成大纲

解析样式：预设样式 → `references/styles/{preset}.md`；自定义尺寸 → 合并 `references/dimensions/` 中的文件。根据解析后的样式构建 `STYLE_INSTRUCTIONS`，应用已确认的受众、语言和幻灯片数量，遵循 `references/outline-template.md`，并保存为 `outline.md`。

如果指定了 `--outline-only`，则在此停止。如果设置了 `skip_outline_review`，则跳过步骤 4。

### 步骤 4：审核大纲（条件执行）

显示逐页表格（`# | Title | Type | Layout`），以及总页数和解析后的样式。按照 `references/confirmation.md` 中的原文询问：继续 / 先编辑大纲 / 重新生成。

选择“先编辑大纲”时，告知用户编辑 `outline.md`，准备好后再次询问。选择“重新生成大纲”时，返回步骤 3。

### 步骤 5：生成提示词

对于大纲中的每张幻灯片：
1. 读取 `references/base-prompt.md`
2. 从大纲中提取 `STYLE_INSTRUCTIONS`（不要重新读取样式文件）
3. 添加该幻灯片的内容
4. 如果指定了 `Layout:`，则加入 `references/layouts.md` 中的相关指导
5. 保存至 `prompts/NN-slide-{slug}.md`（适用备份规则）

如果指定了 `--prompts-only`，则在此停止。如果设置了 `skip_prompt_review`，则跳过步骤 6。

### 步骤 6：审核提示词（条件执行）

显示提示词索引（`# | Filename | Slide Title`），并按照 `references/confirmation.md` 中的原文询问：继续 / 先编辑提示词 / 重新生成。各分支与步骤 4 相同。

### 步骤 7：生成图像

1. 根据顶部的图像生成工具规则解析图像后端——如果安装了多个后端，只询问一次。
   - **`codex-imagegen` 调用**：当规则解析为 `codex-imagegen` 时，参见 [references/codex-imagegen.md](references/codex-imagegen.md) 中的调用约定（首选 `baoyu-image-gen --provider codex-cli` 路径、运行时包装器发现机制、参数说明、stdout 架构、批处理语义——每次调用 n=1，因此幻灯片批次必须为每张幻灯片调度一次包装器调用）。
2. 确认每个 `prompts/NN-slide-{slug}.md` 都存在（硬性要求；无论使用何种后端，提示词文件都是可复现性记录）。
3. 会话 ID：`slides-{topic-slug}-{timestamp}`——仅在后端支持会话时传递给后端。
4. 为选定的幻灯片构建任务列表，其中包含每张幻灯片的提示词文件、输出 PNG 路径、宽高比、会话 ID 以及已验证的直接引用。
5. 按照 `## Batch Generation Policy` 分批调度幻灯片图像：优先使用后端原生批处理，其次使用运行时并行工具调用，最后才在必要时采用顺序处理。调度前对 PNG 文件应用备份规则。报告进度时使用 `Generated X/N`。每个失败项仅重试一次，然后报告错误。

`--regenerate N` 仅跳转至此步骤处理指定的幻灯片。`--images-only` 使用现有提示词从此处开始。

### 步骤 8：合并

```bash
${BUN_X} {baseDir}/scripts/merge-to-pptx.ts <slide-deck-dir>
${BUN_X} {baseDir}/scripts/merge-to-pdf.ts <slide-deck-dir>
```

### 第 9 步：摘要

```
Slide Deck Complete!
Topic: [topic]
Style: [preset or "custom: texture+mood+typography+density"]
Location: [directory]
Slides: N

- 01-slide-cover.png
- ...
- NN-slide-back-cover.png

Outline: outline.md
PPTX: {topic-slug}.pptx
PDF: {topic-slug}.pdf
```

## 幻灯片修改

| 操作 | 方法 |
|--------|-----|
| 编辑 | **首先**更新 `prompts/NN-slide-{slug}.md`，然后执行 `--regenerate N` |
| 添加 | 在相应位置创建新提示词，生成图像，为后续 `NN` 重新编号（slug 保持不变），更新 `outline.md`，然后重新合并 |
| 删除 | 移除 PNG 和提示词，为后续内容重新编号，更新 `outline.md`，然后重新合并 |

重新生成图像前，始终先更新提示词文件——这样可使提示词目录作为唯一事实来源，并让修改可复现。重新编号时仅 `NN` 会变化；slug 保持稳定，因此引用仍然有效。

文本修正策略：

- 如果幻灯片的标题、要点或任何其他已渲染文本存在拼写错误、乱码、难以阅读或视觉效果不佳，请勿使用代码修补位图。
- 对于文本修正的重新生成，请编写新的提示词文件和新的输出路径，以保留有问题的候选版本供对比。
- 后处理仅限于不改变文本或主要构图的裁剪、缩放、压缩或格式转换。

完整详情请参阅 `references/modification-guide.md`。

## 参考资料

| 文件 | 内容 |
|------|---------|
| `references/confirmation.md` | 每项确认操作的 AskUserQuestion 选项原文 |
| `references/analysis-framework.md` | 内容分析框架 |
| `references/outline-template.md` | 大纲结构 |
| `references/base-prompt.md` | 用于图像生成的基础提示词正文 |
| `references/layouts.md` | 布局选项 |
| `references/design-guidelines.md` | 受众、排版、颜色选择 |
| `references/content-rules.md` | 内容指南 |
| `references/modification-guide.md` | 编辑/添加/删除工作流 |
| `references/styles/<preset>.md` | 各预设的规格说明 |
| `references/dimensions/*.md` | 各维度的规格说明 |
| `references/config/preferences-schema.md` | EXTEND.md 架构 |

## 注意事项

- 每张幻灯片的图像生成耗时约 10-30 秒；请在生成间隙报告进度。
- 对于敏感公众人物，优先使用风格化替代方案，以避免肖像相似性问题。
- 当后端支持时，请通过会话 ID 保持视觉一致性。

## 更改偏好设置

EXTEND.md 位于第 1.1 步所列出的第一个匹配路径中。可通过两种方式进行更改：

- **直接编辑**——打开 EXTEND.md 并修改字段。完整架构参见：`references/config/preferences-schema.md`。
- **常见的单行编辑**：
  - `preferred_image_backend: auto` — 默认值；优先使用运行时原生工具，回退到唯一已安装的后端，只有存在多个非原生后端时才询问。
  - `preferred_image_backend: codex-imagegen` — 固定使用 Codex 内置功能。
  - `preferred_image_backend: baoyu-image-gen` — 固定使用 baoyu-image-gen skill。
  - `preferred_image_backend: ask` — 每次运行时确认后端。
  - `generation_batch_size: 4` — 默认并发渲染的幻灯片图像数量，前提是后端/运行时支持批量或并行生成。
  - `preferred_style: blueprint`, `preferred_audience: experts`, `language: zh`。