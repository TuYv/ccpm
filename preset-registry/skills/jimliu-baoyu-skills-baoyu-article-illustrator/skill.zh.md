---
name: baoyu-article-illustrator
description: Analyzes article structure, identifies positions requiring visual aids, generates illustrations with Type × Style × Palette three-dimension approach. Use when user asks to "illustrate article", "add images", "generate images for article", or "为文章配图".
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-article-illustrator
---
# 文章插图生成器

分析文章，识别插图位置，并生成在类型 × 风格 × 配色方面保持一致的图像。

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前代理运行时提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **备用方案**：如果没有此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用包含多个问题，则将所有适用问题合并到一次调用中；如果仅支持单个问题，则按优先级顺序逐个提问。

下面具体的 `AskUserQuestion` 引用仅为示例——在其他运行时中，请替换为本地等效工具。

## 图像生成工具

当此技能需要渲染图像时，请按以下顺序确定后端：

1. **当前请求覆盖设置**——如果用户在当前消息中指定了特定后端，则使用该后端。
2. **已保存的偏好设置**——如果 `EXTEND.md` 将 `preferred_image_backend` 设置为当前可用的后端，则使用该后端。
3. **自动选择**（当偏好设置为 `auto`、未设置，或固定的后端当前不可用时）：
   - **Codex (`imagegen`)**——首先检查可用技能/工具清单。如果列出了名为 `imagegen` 的技能，则表示你运行在 Codex 中，并且**必须**使用它：通过 `Skill` 工具调用，传入 `skill: "imagegen"`，并传入已保存提示词文件的内容（以及根据 Codex `imagegen` 自身参数要求提供的输出路径和宽高比）。Codex `imagegen` 是该运行时中的官方栅格图像后端，其优先级高于任何非原生技能（例如 `baoyu-image-gen`），除非用户明确固定了不同的 `preferred_image_backend`。
   - **通过 `codex exec` 使用 Codex (`codex-imagegen`)**——如果当前运行时没有提供原生 `imagegen` 技能，但 `codex` CLI 位于 `PATH` 中且已处于有效的 `codex login` 状态，则通过 `baoyu-image-gen --provider codex-cli` 路由（优先），或者在 `baoyu-image-gen` 不可用时直接调用内置包装器。详细信息、参数和运行时发现流程位于 [references/codex-imagegen.md](references/codex-imagegen.md)——仅在选择此分支时加载该文件。
   - **Cursor (`GenerateImage`)**——如果运行时提供原生 `GenerateImage` 工具，则表示你运行在 Cursor 中；与 Codex `imagegen` 一样，其优先级高于任何非原生技能。这里有两个硬性注意事项：(a) 它没有宽高比参数——在传给 `description` 的提示文本中明确写出目标宽高比/尺寸；(b) 它不接受输出目录——它会保存到工具管理的位置，因此在生成后将文件复制/移动到技能预期的输出路径（例如 `outputs/.../NN-xxx.png`）。参考图像放入 `reference_image_paths`。
   - **其他运行时原生工具**——如果运行时提供其他原生图像工具（例如 Hermes `image_generate`），请以相同方式使用。
   - 否则，如果恰好安装了一个非原生后端（例如 `baoyu-image-gen`），则使用它。
   - 否则（存在多个非原生后端且没有运行时原生工具），请向用户询问一次——并将其与其他初始问题合并提问。
4. **如果没有任何可用后端**，请告知用户并询问如何继续。

**⛔ 切勿使用 SVG、HTML、canvas 或其他基于代码的渲染来替代光栅图像生成。** Codex `imagegen` 自身的描述说明了：当输出应当是位图素材，而不是仓库原生代码或矢量图时，应使用它。如果无法通过步骤 3 解析出光栅后端，则转到步骤 4 并询问用户 — **不要** 默默输出 SVG、编写内联 `<svg>` 标记，或生成 HTML/CSS 艺术来替代。这一点即使在文章/章节看起来“像图表”时也同样适用：调用此规则的消费者 skill 已经决定它需要的是光栅图像。

**⛔ 切勿通过在生成的位图上覆盖绘制来修复渲染文本。** 不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR 脚本或任何其他程序化叠加方式，去遮盖、重写、擦除、描边或替换已生成插图中的标签、说明文字或任何其他文本。如果文本错误或不清晰，请使用修正后的提示词重新生成，重新绘制为更少或不包含图中文字的版本，或询问用户要保留哪个不完美的候选项。

设置 `preferred_image_backend: ask` 会强制每次运行都执行步骤 3 的提示，无论是否存在可用后端。用户可以通过下方的 `## Changing Preferences` 章节更改固定后端。

**提示词文件要求（强制）**：在调用任何后端之前，必须将每张图片完整、最终的提示词写入 `prompts/` 下的独立文件中（命名格式：`NN-{type}-[slug].md`）。后端接收提示词文件（或其内容）；该文件是可复现记录，并支持在无需重新生成提示词的情况下切换后端。

上面的具体工具名称（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）仅为示例 — 请替换为本地环境中遵循相同规则的对应工具。

## 批量生成策略

本次运行的所有提示词文件保存并验证完成后，默认应分批生成图片。

优先级顺序：

1. 如果所选后端存在原生批量/多任务接口，则使用该接口。每个任务都必须保留各自的提示词文件、输出路径、宽高比和直接引用图片。
2. 如果没有原生批量接口，但运行时可以发起并行工具调用，则每次最多分派 `generation_batch_size` 张图片。默认值为 `4`。当前消息中的明确用户请求（例如 `--batch-size 4` 或“并行4张一起生成”）可以覆盖 EXTEND.md。
3. 如果原生批量接口和并行工具调用均不可用，则按顺序生成。

规则：

- 在该批次的所有提示词文件都存在于磁盘上之前，绝不要启动第一批生成。
- 对失败的项目重试一次，不要重新生成已成功的项目。
- 不要仅为了并行图像渲染而使用子代理。仅在进行独立的提示词迭代或创意探索时使用子代理。

## 确认策略

默认行为：生成前进行确认。

- 将明确的 skill 调用、文件路径、匹配的信号/预设以及 EXTEND.md 默认值仅视为推荐输入。它们都不代表可以跳过确认。
- 在用户完成步骤 3 之前，不要启动步骤 4 或后续步骤。
- 只有当前请求明确要求跳过确认时，才跳过确认，例如：“直接生成”、“不用确认”、“跳过确认”、“按默认出图”或同等表述。
- 如果用户明确跳过确认，则在生成前的下一次面向用户的更新中，说明所采用的类型 / 密度 / 风格 / 配色 / 语言 / 后端。

## 参考图像

用户可以通过 `--ref <files...>` 提供参考图像，也可以在对话中提供文件路径或粘贴图像。参考图像可用于指导特定插图的风格、配色、构图或主体。

完整的检测、存储和处理规则请参阅 [references/workflow.md](references/workflow.md)（步骤 1.0 将文件保存为 `references/NN-ref-{slug}.{ext}`；步骤 5.3 根据每幅插图的使用方式 `direct | style | palette` 进行处理）。当所选后端支持批量输入时，每个提示文件的 `references:` frontmatter 中使用 `direct` 的条目应传递到其批量负载中，以便后端能够继续传递这些参考图像（例如，`baoyu-image-gen` 接受每个任务的 `ref`）。

## 三个维度

| 维度 | 控制内容 | 示例 |
|-----------|----------|----------|
| **类型** | 信息结构 | 信息图、场景、流程图、对比、框架、时间线 |
| **风格** | 渲染方式 | notion、温暖、极简、蓝图、水彩、优雅 |
| **配色** | 配色方案（可选） | 马卡龙、温暖、霓虹——覆盖风格的默认颜色 |

可自由组合：`--type infographic --style vector-illustration --palette macaron`

或者使用预设：`--preset edu-visual` → 通过一个标志同时指定类型 + 风格 + 配色。参见 [风格预设](references/style-presets.md)。

## 类型

| 类型 | 最适合用于 |
|------|----------|
| `infographic` | 数据、指标、技术内容 |
| `scene` | 叙事、情感 |
| `flowchart` | 流程、工作流 |
| `comparison` | 并排展示、选项对比 |
| `framework` | 模型、架构 |
| `timeline` | 历史、演变 |

## 风格

有关核心风格、完整图库以及类型 × 风格兼容性，请参阅 [references/styles.md](references/styles.md)。

## 工作流

```
- [ ] Step 1: Pre-check (EXTEND.md, references, config)
- [ ] Step 2: Analyze content
- [ ] Step 3: Confirm settings (AskUserQuestion)
- [ ] Step 4: Generate outline
- [ ] Step 5: Generate images
- [ ] Step 6: Finalize
```

### 步骤 1：预检查

**1.5 加载偏好设置（EXTEND.md）⛔ 阻塞性要求**

按优先级顺序检查 EXTEND.md——使用第一个找到的文件：

| 优先级 | 路径 | 范围 |
|----------|----------|-------|
| 1 | `.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-article-illustrator/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-article-illustrator/EXTEND.md` | 用户主目录 |

| 结果 | 操作 |
|--------|--------|
| 找到 | 读取、解析并显示摘要 |
| 未找到 | ⛔ 运行 [first-time-setup](references/config/first-time-setup.md) |

完整流程：[references/workflow.md](references/workflow.md#step-1-pre-check)

### 步骤 2：分析

| 分析项 | 输出 |
|----------|--------|
| 内容类型 | 技术 / 教程 / 方法论 / 叙事 |
| 目的 | 信息 / 可视化 / 想象 |
| 核心论点 | 2-5 个主要观点 |
| 位置 | 插图能够增加价值的地方 |

**关键要求**：隐喻 → 将其背后的概念可视化，而不是绘制字面上的图像。

完整流程：[references/workflow.md](references/workflow.md#step-2-setup--analyze)

### 第 3 步：确认设置 ⚠️

**硬性门槛**：根据[确认策略](#confirmation-policy)，此步骤是强制性的——在用户于此处确认（或在当前请求中使用“直接生成”/等效措辞明确选择跳过）之前，无法开始第 4 步及后续步骤。

**一次 `AskUserQuestion`，最多 4 个问题。Q1-Q2 必须提问。除非选择了预设，否则必须提问 Q3。**

| Q | 选项 |
|---|---------|
| **Q1：预设或类型** | [推荐预设]、[备选预设]，或手动选择：信息图、场景、流程图、对比、框架、时间线、混合 |
| **Q2：密度** | minimal (1-2)、balanced (3-5)、per-section（推荐）、rich (6+) |
| **Q3：风格** | [推荐]、minimal-flat、sci-fi、hand-drawn、editorial、scene、poster、Other — **选择预设时跳过** |
| Q4：配色 | Default（风格色彩）、macaron、warm、neon — **预设包含配色或已设置 preferred_palette 时跳过** |
| Q5：语言 | 文章语言 ≠ EXTEND.md 设置时提问 |

完整流程：[references/workflow.md](references/workflow.md#step-3-confirm-settings-)

### 第 4 步：生成大纲

保存带有 frontmatter（type、density、style、palette、image_count）的 `outline.md`，并包含以下条目：

```yaml
## Illustration 1
**Position**: [section/paragraph]
**Purpose**: [why]
**Visual Content**: [what]
**Filename**: 01-infographic-concept-name.png
```

完整模板：[references/workflow.md](references/workflow.md#step-4-generate-outline)

### 第 5 步：生成图像

⛔ **阻塞要求：任何图像生成之前，必须先保存提示词文件。** 无论选择哪种后端，这都是硬性要求——提示词文件是可复现性记录。

1. 根据 [references/prompt-construction.md](references/prompt-construction.md) 为每幅插图创建一个提示词文件
2. 使用 YAML frontmatter 保存至 `prompts/NN-{type}-{slug}.md`
3. 提示词**必须**使用特定类型的模板，并包含结构化分区（ZONES / LABELS / COLORS / STYLE / ASPECT）
4. LABELS **必须**包含文章特定的数据：实际数字、术语、指标、引述
5. **不要**在未先保存提示词文件的情况下，将临时内联提示词传递给 `--prompt`
6. 根据顶部的 `## Image Generation Tools` 规则选择后端：使用任何可用后端；如果有多个可用后端，只询问用户一次。每个会话在首次生成前执行一次。
   - **`codex-imagegen` 调用**：当规则解析为 `codex-imagegen` 时，请参阅 [references/codex-imagegen.md](references/codex-imagegen.md) 了解调用约定（首选 `baoyu-image-gen --provider codex-cli` 路径、运行时包装器发现、参数说明、stdout schema、批处理语义）。
7. **执行策略**：按照 `## Batch Generation Policy` 分批生成：首先使用后端原生批处理，其次使用运行时并行工具调用，最后才使用串行方式作为后备方案。默认批次大小为 4，除非 EXTEND.md 或当前请求另有规定。
8. 根据提示词 frontmatter 处理参考图（`direct`/`style`/`palette`）
9. 如果 EXTEND.md 已启用，则应用水印
10. 根据已保存的提示词文件生成；失败时重试一次

完整流程：[references/workflow.md](references/workflow.md#step-5-generate-images)

### 步骤 6：完成

在段落后插入 `![description]({relative-path}/NN-{type}-{slug}.png)`。根据输出目录设置，计算相对于文章文件的路径。

```
Article Illustration Complete!
Article: [path] | Type: [type] | Density: [level] | Style: [style] | Palette: [palette or default]
Images: X/N generated
```

## 输出目录

输出目录由 EXTEND.md 中的 `default_output_dir` 决定（在首次设置期间配置）：

| `default_output_dir` | 输出路径 | Markdown 插入路径 |
|----------------------|-------------|----------------------|
| `imgs-subdir` (default) | `{article-dir}/imgs/` | `imgs/NN-{type}-{slug}.png` |
| `same-dir` | `{article-dir}/` | `NN-{type}-{slug}.png` |
| `illustrations-subdir` | `{article-dir}/illustrations/` | `illustrations/NN-{type}-{slug}.png` |
| `independent` | `illustrations/{topic-slug}/` | `illustrations/{topic-slug}/NN-{type}-{slug}.png` (relative to cwd) |

所有辅助文件（大纲、提示词）都保存在输出目录中：

```
{output-dir}/
├── outline.md
├── prompts/
│   └── NN-{type}-{slug}.md
└── NN-{type}-{slug}.png
```

当输入为**粘贴的内容**（没有文件路径）时，始终使用 `illustrations/{topic-slug}/`，并将 `source-{slug}.{ext}` 保存在同一目录中。

**Slug**：2-4 个单词，使用 kebab-case。**冲突**：追加 `-YYYYMMDD-HHMMSS`。

## 修改

| 操作 | 步骤 |
|--------|-------|
| 编辑 | 更新提示词 → 重新生成 → 更新引用 |
| 添加 | 确定位置 → 编写提示词 → 生成 → 更新大纲 → 插入 |
| 删除 | 删除文件 → 移除引用 → 更新大纲 |

文本修正政策：

- 如果任何渲染出的文本（标签、标题等）存在拼写错误、乱码、难以阅读或视觉效果较弱的问题，不要使用代码修补位图。
- 对于文本修正重新生成，编写新的提示词文件并使用新的输出路径，以保留有缺陷的候选结果供比较。
- 后处理仅限于裁剪、调整大小、压缩或格式转换，且不得改变文本或主要构图。

## 参考资料

| 文件 | 内容 |
|------|---------|
| [references/workflow.md](references/workflow.md) | 详细流程 |
| [references/usage.md](references/usage.md) | 命令语法 |
| [references/styles.md](references/styles.md) | 风格画廊 + 调色板画廊 |
| [references/style-presets.md](references/style-presets.md) | 预设快捷方式（类型 + 风格 + 调色板） |
| [references/prompt-construction.md](references/prompt-construction.md) | 提示词模板 |
| [references/config/first-time-setup.md](references/config/first-time-setup.md) | 首次设置 |

## 更改偏好设置

EXTEND.md 位于步骤 1.5 中列出的第一个匹配路径。更改方式有三种：

- **直接编辑** — 打开 EXTEND.md 并更改字段。完整架构：`references/config/preferences-schema.md`。
- **交互式重新配置** — 删除 EXTEND.md（或询问“重新配置 baoyu-article-illustrator 偏好设置”）。下一次运行时会重新触发首次设置。
- **常见单行修改**：
  - `preferred_image_backend: auto` — 默认值；优先使用运行时原生工具，若只有一个已安装的后端则回退到该后端，只有存在多个非原生后端时才会询问。
  - `preferred_image_backend: codex-imagegen` — 固定使用 Codex 内置工具。
  - `preferred_image_backend: baoyu-image-gen` — 固定使用 baoyu-image-gen skill。
  - `preferred_image_backend: ask` — 每次运行时确认后端。
  - `generation_batch_size: 4` — 当运行时支持并行生成调用时，并发渲染的默认图片数量。
  - `preferred_type: infographic`、`preferred_style: notion`、`preferred_palette: macaron`、`language: zh`。
  - `default_output_dir: imgs-subdir` — 相对于文章写入生成图片的位置。