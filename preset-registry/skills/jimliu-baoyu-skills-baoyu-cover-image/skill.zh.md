---
name: baoyu-cover-image
description: Generates article cover images with 5 dimensions (type, palette, rendering, text, mood) combining 11 color palettes and 7 rendering styles. Supports cinematic (2.35:1), widescreen (16:9), and square (1:1) aspects. Use when user asks to "generate cover image", "create article cover", or "make cover".
version: 1.117.5
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-cover-image
---
# 封面图生成器

为文章生成具有 5 个维度自定义选项的精美封面图。

## 用户输入工具

当此 skill 提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前 agent 运行时提供的内置用户输入工具，例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持在一次调用中提出多个问题，请将所有适用的问题合并到一次调用中；如果仅支持单个问题，则按照优先级顺序逐个提问。

下面的 `AskUserQuestion` 具体引用仅作为示例——在其他运行时中，请替换为本地等效工具。

## 图像生成工具

当此 skill 需要渲染图像时，请按以下顺序解析后端：

1. **当前请求覆盖项**——如果用户在当前消息中指定了特定后端，则使用该后端。
2. **已保存的偏好设置**——如果 `EXTEND.md` 将 `preferred_image_backend` 设置为当前可用的后端，则使用该后端。
3. **自动选择**（当偏好设置为 `auto`、未设置，或固定的后端当前不可用时）：
   - **Codex (`imagegen`)**——首先检查可用的 skills / 工具清单。如果列出了名为 `imagegen` 的 skill，则表示你正在 Codex 中运行，**必须**使用它：通过 `Skill` 工具调用，并将已保存的提示词文件内容传入（同时按照 Codex `imagegen` 自身的参数要求传入输出路径和宽高比）。Codex `imagegen` 是该运行时中的官方栅格图像后端，其优先级高于任何非原生 skill（例如 `baoyu-image-gen`），除非用户明确固定了不同的 `preferred_image_backend`。
   - **通过 `codex exec` 使用 Codex (`codex-imagegen`)**——如果当前运行时没有原生 `imagegen` skill，但 `codex` CLI 位于 `PATH` 中且已通过有效的 `codex login` 登录，则通过 `baoyu-image-gen --provider codex-cli` 路由（首选）；或者，如果 `baoyu-image-gen` 不可用，则直接调用捆绑的包装器。详细信息、参数和运行时发现流程位于 [references/codex-imagegen.md](references/codex-imagegen.md) 中——仅当选择此分支时加载该文件。
   - **Cursor (`GenerateImage`)**——如果运行时提供原生 `GenerateImage` 工具，则表示你正在 Cursor 中运行；它与 Codex `imagegen` 一样，优先级高于任何非原生 skill。需要特别注意两点：(a) 它没有宽高比参数——请在作为 `description` 传入的提示词文本中明确写出目标宽高比 / 尺寸；(b) 它不接受输出目录——它会保存到工具管理的位置，因此在生成后将文件复制/移动到该 skill 预期的输出路径（例如 `outputs/.../NN-xxx.png`）。参考图像应放在 `reference_image_paths` 中。
   - **其他运行时原生工具**——如果运行时提供其他原生图像工具（例如 Hermes `image_generate`），请以相同方式使用。
   - 否则，如果恰好安装了一个非原生后端（例如 `baoyu-image-gen`），则使用该后端。
   - 否则（存在多个非原生后端且没有运行时原生工具），请询问用户一次——与其他初始问题合并提问。
4. **如果没有可用工具**，请告知用户，并询问如何继续。

**⛔ 绝不能用 SVG、HTML、canvas 或其他基于代码的渲染来替代光栅图像生成。** Codex `imagegen` 自身的说明指出，当“输出应为位图资源，而不是仓库原生代码或矢量图”时，应使用它。如果无法通过第 3 步解析出光栅后端，则进入第 4 步并询问用户 — **绝不能**悄悄输出 SVG、编写内联 `<svg>` 标记，或生成 HTML/CSS 艺术来替代。这一要求即使在文章/章节看起来“像图表”时也同样适用：调用此规则的 consumer skill 已经决定它需要的是光栅图像。

**⛔ 绝不能通过在生成的位图上涂改来修复渲染出的文字。** 不得使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR 脚本或任何其他程序化叠加方式，覆盖、重写、擦除、描边或替换已经生成的封面图中的标题/副标题文字。如果文字错误或不清晰，请使用修正后的提示词重新生成，切换到文字更少或无标题的变体，或者询问用户要保留哪个不完美的候选结果。

设置 `preferred_image_backend: ask` 会强制每次运行都执行第 3 步提示，无论是否存在可用后端。用户可以通过下面的 `## Changing Preferences` 部分更改固定的后端。

**提示词文件要求（强制）**：在调用任何后端**之前**，将每张图的完整最终提示词写入 `prompts/` 下的独立文件（命名格式：`NN-{type}-[slug].md`）。后端接收提示词文件（或其内容）；该文件是可复现记录，并且支持在不重新生成提示词的情况下切换后端。

上面的具体工具名称（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）仅为示例 — 请替换为本地对应名称，并遵循相同规则。

## 确认策略

默认行为：**生成前确认**。

- 将显式 skill 调用、文件路径、匹配的关键词/预设、`EXTEND.md` 默认值以及任何文档化的自动选择都视为**推荐输入**。它们都不代表可以跳过确认。
- 在用户确认尺寸 / 宽高比 / 语言 / 后端选项之前，**不要**开始第 3 步或第 4 步。
- 只有当前请求明确要求跳过确认时，才跳过确认，例如：`--quick`、“直接生成”、“不用确认”、“跳过确认”、“按默认出图”或等价措辞。`EXTEND.md` 中的 `quick_mode: true` 也算作持续有效的明确选择 — 只有希望每次运行都跳过第 2 步时，才设置它。
- 如果明确跳过了确认，请在生成前的下一条面向用户的更新中说明假定的尺寸 / 宽高比 / 语言 / 后端。

## 选项

| 选项 | 描述 |
|--------|-------------|
| `--type <name>` | hero、conceptual、typography、metaphor、scene、minimal |
| `--palette <name>` | warm、elegant、cool、dark、earth、vivid、pastel、mono、retro、duotone、macaron |
| `--rendering <name>` | flat-vector、hand-drawn、painterly、digital、pixel、chalk、screen-print |
| `--style <name>` | 预设简写（参见 [样式预设](references/style-presets.md)） |
| `--text <level>` | none、title-only、title-subtitle、text-rich |
| `--mood <level>` | subtle、balanced、bold |
| `--font <name>` | clean、handwritten、serif、display |
| `--aspect <ratio>` | 16:9（默认）、2.35:1、4:3、3:2、1:1、3:4 |
| `--lang <code>` | 标题语言（en、zh、ja 等） |
| `--no-title` | `--text none` 的别名 |
| `--quick` | 跳过确认，使用自动选择 |
| `--ref <files...>` | 用于提供风格/构图参考的参考图像 |

## 五个维度

| 维度 | 值 | 默认值 |
|-----------|--------|---------|
| **类型** | hero, conceptual, typography, metaphor, scene, minimal | auto |
| **配色** | warm, elegant, cool, dark, earth, vivid, pastel, mono, retro, duotone, macaron | auto |
| **渲染** | flat-vector, hand-drawn, painterly, digital, pixel, chalk, screen-print | auto |
| **文本** | none, title-only, title-subtitle, text-rich | title-only |
| **氛围** | subtle, balanced, bold | balanced |
| **字体** | clean, handwritten, serif, display | clean |

自动选择规则：[references/auto-selection.md](references/auto-selection.md)

## 图库

**类型**：hero, conceptual, typography, metaphor, scene, minimal  
→ 详细信息：[references/types.md](references/types.md)

**配色**：warm, elegant, cool, dark, earth, vivid, pastel, mono, retro, duotone, macaron  
→ 详细信息：[references/palettes/](references/palettes/)

**渲染方式**：flat-vector, hand-drawn, painterly, digital, pixel, chalk, screen-print  
→ 详细信息：[references/renderings/](references/renderings/)

**文本级别**：none（纯视觉）| title-only（默认）| title-subtitle | text-rich（带标签）  
→ 详细信息：[references/dimensions/text.md](references/dimensions/text.md)

**氛围级别**：subtle（低对比度）| balanced（默认）| bold（高对比度）  
→ 详细信息：[references/dimensions/mood.md](references/dimensions/mood.md)

**字体**：clean（无衬线）| handwritten | serif | display（粗体装饰性）  
→ 详细信息：[references/dimensions/font.md](references/dimensions/font.md)

## 文件结构

根据 `default_output_dir` 偏好设置输出目录：
- `same-dir`：`{article-dir}/`
- `imgs-subdir`：`{article-dir}/imgs/`
- `independent`（默认）：`cover-image/{topic-slug}/`

```
<output-dir>/
├── source-{slug}.{ext}    # Source files
├── refs/                  # Reference images (if provided)
│   ├── ref-01-{slug}.{ext}
│   └── ref-01-{slug}.md   # Description file
├── prompts/cover.md       # Generation prompt
└── cover.png              # Output image
```

**Slug**：2-4 个单词，kebab-case。冲突时：追加 `-YYYYMMDD-HHMMSS`

## 工作流

### 进度检查清单

```
Cover Image Progress:
- [ ] Step 0: Check preferences (EXTEND.md) ⛔ BLOCKING
- [ ] Step 1: Analyze content + save refs + determine output dir
- [ ] Step 2: Confirm options (6 dimensions) ⚠️ unless --quick
- [ ] Step 3: Create prompt
- [ ] Step 4: Generate image
- [ ] Step 5: Completion report
```

### 流程

```
Input → [Step 0: Preferences] ─┬─ Found → Continue
                               └─ Not found → First-Time Setup ⛔ BLOCKING → Save EXTEND.md → Continue
        ↓
Analyze + Save Refs → [Output Dir] → [Confirm: 6 Dimensions] → Prompt → Generate → Complete
                                              ↓
                                     (skip if --quick or all specified)
```

### 步骤 0：加载偏好设置 ⛔ BLOCKING

按优先级顺序检查 EXTEND.md，找到的第一个文件优先：

| 优先级 | 路径 | 范围 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-cover-image/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-cover-image/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-cover-image/EXTEND.md` | 用户主目录 |

| 结果 | 操作 |
|--------|--------|
| 找到 | 加载，显示摘要 → 继续 |
| 未找到 | ⛔ 先运行首次设置（[references/config/first-time-setup.md](references/config/first-time-setup.md)）→ 保存 → 继续 |

**关键**：如果未找到，必须在执行任何其他步骤或提出问题之前完成设置。

### 步骤 1：分析内容

1. **保存参考图像**（如果提供）→ [references/workflow/reference-images.md](references/workflow/reference-images.md)
2. **保存源内容**（如果是粘贴的，则保存到 `source.md`）
3. **分析内容**：主题、语调、关键词、视觉隐喻
4. **深入分析参考资料** ⚠️：提取具体、明确的元素（参见 reference-images.md）
5. **检测语言**：比较源内容、用户输入和 EXTEND.md 偏好
6. **确定输出目录**：遵循文件结构规则

**⚠️ 参考图像中的人物：**

如果参考图像中包含**应出现在封面中的人物**：

- **模型支持 `--ref`**（默认）：将图像复制到 `refs/`，在生成时通过 `--ref` 传入。无需描述文件——模型可以直接看到面部。
- **模型不支持 `--ref`**（Jimeng、Seedream 3.0）：创建 `refs/ref-NN-{slug}.md`，其中包含逐个角色的描述（头发、眼镜、肤色、服装）。将其作为 MUST/REQUIRED 指令嵌入提示文本中。

完整决策表请参见 [reference-images.md](references/workflow/reference-images.md)。

### 步骤 2：确认选项 ⚠️

**硬性门槛**：根据[确认政策](#confirmation-policy)，此步骤是强制性的——在用户于此处确认（或在当前请求中通过 `--quick` / `quick_mode: true` / 等效措辞明确选择跳过）之前，不得开始步骤 3–4。

**必须使用 `AskUserQuestion` 工具**以交互式选择的形式呈现选项——不得使用纯文本表格。一次 `AskUserQuestion` 调用最多呈现 4 个问题（类型、调色板、渲染、字体 + 设置）。每个问题都应先显示推荐选项及其原因，然后显示其他选项。

完整的确认流程和问题格式请参见：[references/workflow/confirm-options.md](references/workflow/confirm-options.md)

| 条件 | 跳过 | 仍需询问 |
|-----------|---------|-------------|
| `--quick` 或 `quick_mode: true` | 6 个维度 | 宽高比（除非指定了 `--aspect`） |
| 已指定全部 6 个维度 + `--aspect` | 全部 | 无 |

### 步骤 3：创建提示

保存到 `prompts/cover.md`。模板：[references/workflow/prompt-template.md](references/workflow/prompt-template.md)

**关键——Frontmatter 中的参考资料**：
- 保存到 `refs/` 的文件 → 添加到 Frontmatter 的 `references` 列表中
- 以文字形式提取的风格（无文件）→ 省略 `references`，在正文中进行描述
- 写入之前 → 验证：`test -f refs/ref-NN-{slug}.{ext}`

正文中的参考元素**必须**详细说明，以 "MUST"/"REQUIRED" 开头，并说明整合方式。

### 步骤 4：生成图像

1. **备份现有的** `cover.png`（如果重新生成）
2. 根据顶部的 `## Image Generation Tools` 规则**选择后端**：使用可用的后端；如果有多个后端，则询问用户一次。每个会话中，在进行任何生成之前执行一次。
3. 在调用后端**之前**，将完整的最终提示写入 `prompts/01-cover-[slug].md`（硬性要求）。
4. 根据提示 Frontmatter 处理参考资料：
   - `direct` 用法 → 通过 `--ref` 传入（使用支持 ref 的后端）
   - `style`/`palette` → 提取特征并追加到提示中
5. **生成**：使用提示文件、输出路径和宽高比调用所选后端。
   - **`codex-imagegen`**：调用约定请参见 [references/codex-imagegen.md](references/codex-imagegen.md)（首选 `baoyu-image-gen --provider codex-cli` 路径、运行时包装器发现、参数说明、stdout schema、批处理语义）。
   - 原生 Codex `imagegen` 或其他运行时原生工具 / `baoyu-image-gen` skill：遵循上方 `## Image Generation Tools` 中的规则。
6. 失败时：自动重试一次

### 第 5 步：完成报告

```
封面已生成！

主题：[topic]
类型：[type] | 调色板：[palette] | 渲染方式：[rendering]
文本：[text] | 氛围：[mood] | 字体：[font] | 宽高比：[ratio]
标题：[title or "visual only"]
语言：[lang] | 水印：[enabled/disabled]
参考图：[N images or "extracted style" or "none"]
位置：[directory path]

文件：
✓ source-{slug}.{ext}
✓ prompts/cover.md
✓ cover.png
```

## 图像修改

| 操作 | 步骤 |
|--------|-------|
| **重新生成** | 备份 → 先更新提示词文件 → 重新生成 |
| **更改尺寸** | 备份 → 确认新值 → 更新提示词 → 重新生成 |

文字更正政策：

- 如果标题/副标题拼写错误、乱码、难以阅读或视觉效果不佳，不要使用代码修补位图。
- 对于文字更正的重新生成，请写入新的提示词文件和新的输出路径，以保留有缺陷的候选图供比较。
- 后处理仅限于不改变文字或主要构图的裁剪、调整大小、压缩或格式转换。

## 构图原则

- **留白**：40-60% 的呼吸空间
- **视觉锚点**：主要元素居中或偏左
- **角色**：简化的剪影；禁止使用写实人物
- **标题**：使用用户/来源中的准确标题；绝不自行编造

## 更改偏好设置

EXTEND.md 位于 **第 0 步** 中注明的路径。可通过以下三种方式更改：

- **直接编辑** — 打开 EXTEND.md 并修改字段。完整 schema：[references/config/preferences-schema.md](references/config/preferences-schema.md)。
- **交互式重新配置** — 删除 EXTEND.md（或要求“reconfigure baoyu-cover-image preferences” / “重新配置”）。下一次运行将重新触发首次设置。
- **常见单行编辑**：
  - `preferred_image_backend: auto` — 默认值；优先使用运行时原生工具，回退到唯一已安装的后端，只有在存在多个非原生后端时才询问。
  - `preferred_image_backend: codex-imagegen` — 固定使用 Codex 内置工具。
  - `preferred_image_backend: baoyu-image-gen` — 固定使用 baoyu-image-gen skill。
  - `preferred_image_backend: ask` — 每次运行时确认后端。
  - `watermark.enabled: true`、`preferred_type`、`preferred_palette`、`preferred_rendering`、`default_aspect`、`quick_mode: true`、`language` — 调整自动选择默认值和确认流程。

## 参考资料

**尺寸**：[text.md](references/dimensions/text.md) | [mood.md](references/dimensions/mood.md) | [font.md](references/dimensions/font.md)
**调色板**：[references/palettes/](references/palettes/)
**渲染方式**：[references/renderings/](references/renderings/)
**类型**：[references/types.md](references/types.md)
**自动选择**：[references/auto-selection.md](references/auto-selection.md)
**风格预设**：[references/style-presets.md](references/style-presets.md)
**兼容性**：[references/compatibility.md](references/compatibility.md)
**视觉元素**：[references/visual-elements.md](references/visual-elements.md)
**工作流**：[confirm-options.md](references/workflow/confirm-options.md) | [prompt-template.md](references/workflow/prompt-template.md) | [reference-images.md](references/workflow/reference-images.md)
**配置**：[preferences-schema.md](references/config/preferences-schema.md) | [first-time-setup.md](references/config/first-time-setup.md) | [watermark-guide.md](references/config/watermark-guide.md)