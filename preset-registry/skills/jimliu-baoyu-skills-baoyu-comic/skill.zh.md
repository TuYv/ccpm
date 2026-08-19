---
name: baoyu-comic
description: Knowledge comic creator supporting multiple art styles and tones. Creates original educational comics with detailed panel layouts and batch-capable image generation. Use when user asks to create "知识漫画", "教育漫画", "biography comic", "tutorial comic", or "Logicomix-style comic".
version: 1.117.4
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-comic
    requires:
      anyBins:
        - bun
        - npx
---
# 知识漫画创作者

创建具有灵活艺术风格 × 语调组合的原创知识漫画。

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前代理运行时所提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **备选方案**：如果没有此类工具，则发送一条带编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用包含多个问题，则将所有适用的问题合并到一次调用中；如果工具一次只支持一个问题，则按优先级顺序逐个提问。

下面具体的 `AskUserQuestion` 引用仅作为示例——在其他运行时中，请替换为本地等效工具。

## 图像生成工具

当此技能需要渲染图像时，请按以下顺序解析后端：

1. **当前请求覆盖设置**——如果用户在当前消息中指定了某个后端，则使用该后端。
2. **已保存的偏好设置**——如果 `EXTEND.md` 将 `preferred_image_backend` 设置为当前可用的某个后端，则使用该后端。
3. **自动选择**（当偏好设置为 `auto`、未设置，或固定的后端当前不可用时）：
   - **Codex (`imagegen`)**——首先检查可用技能/工具清单。如果其中列出了名为 `imagegen` 的技能，则表示你正在 Codex 中运行，**必须**使用它：通过 `Skill` 工具调用，使用 `skill: "imagegen"`，传入已保存提示词文件的内容（以及输出路径和宽高比，具体遵循 Codex `imagegen` 自身的参数）。Codex `imagegen` 是该运行时中的官方栅格图像后端，其优先级高于任何非原生技能（例如 `baoyu-image-gen`），除非用户明确固定了不同的 `preferred_image_backend`。
   - **通过 `codex exec` 使用 Codex (`codex-imagegen`)**——如果当前运行时未提供原生 `imagegen` 技能，但 `codex` CLI 位于 `PATH` 中且已通过 `codex login` 登录，则通过 `baoyu-image-gen --provider codex-cli` 进行路由（优先），或者在 `baoyu-image-gen` 不可用时直接调用捆绑的包装器。详细信息、参数和运行时发现流程位于 [references/codex-imagegen.md](references/codex-imagegen.md) 中——仅当选择此分支时加载该文件。
   - **Cursor (`GenerateImage`)**——如果运行时提供原生 `GenerateImage` 工具，则表示你正在 Cursor 中运行；它与 Codex 的原生 `imagegen` 一样，其优先级高于非原生技能。这里有两个重要注意事项：(a) 它没有宽高比参数——请在作为 `description` 传入的提示文本中明确写出目标宽高比/尺寸；(b) 它不接受输出目录——文件会保存到工具管理的位置，因此生成后请将文件复制/移动到技能所要求的输出路径（例如 `outputs/.../NN-xxx.png`）。参考图像应放入 `reference_image_paths`。
   - **其他运行时原生工具**——如果运行时提供其他原生图像工具（例如 Hermes `image_generate`），请以相同方式使用。
   - 否则，如果恰好安装了一个非原生后端（例如 `baoyu-image-gen`），则使用该后端。
   - 否则（存在多个非原生后端且没有运行时原生工具），请询问用户一次——并将其与其他初始问题合并提问。
4. **如果没有任何可用后端**，请告知用户并询问如何继续。

**⛔ 绝不要用 SVG、HTML、canvas 或其他基于代码的渲染来替代栅格图像生成。** Codex `imagegen` 自身的说明指出，当“输出应为位图资源而非仓库原生代码或矢量图”时，应使用它。如果你无法通过第 3 步找到栅格后端，请转至第 4 步并询问用户——**不要**悄悄输出 SVG、编写内联 `<svg>` 标记，或以 HTML/CSS 艺术图作为替代方案。即使文章/章节看起来“像图表”，此规则同样适用：调用此规则的消费者 skill 已经确定其需要的是栅格图像。

**⛔ 绝不要通过在生成的位图上涂盖来修复已渲染的文本。** 不要使用 ImageMagick、Pillow、Canvas、SVG、HTML/CSS、OCR 脚本或任何其他程序化叠加方式，来覆盖、重写、擦除、描边或替换已经生成的漫画页面内的对话、音效、分镜标签或任何其他文字。如果文字有误或不清晰，请根据修正后的提示词重新生成、以更少或不含图中文字的方式重绘页面，或者询问用户要保留哪个不完美的候选版本。

设置 `preferred_image_backend: ask` 会无论可用后端为何，都在每次运行时强制显示第 3 步提示。用户可通过下方的 `## Changing Preferences` 部分更改固定的后端。

**提示词文件要求（强制）**：在调用任何后端**之前**，将每张图像完整、最终的提示词写入 `prompts/` 下的独立文件中（命名：`NN-{type}-[slug].md`）。后端接收提示词文件（或其内容）；该文件是可复现性记录，并允许你在无需重新生成提示词的情况下切换后端。

上方具体的工具名称（`imagegen`、`GenerateImage`、`image_generate`、`baoyu-image-gen`）只是示例——请按照相同规则替换为本地的等效工具。

## 批量生成策略

在当前生成组的每个提示词文件均已保存并验证后，默认以批量方式生成图像。

优先级顺序：

1. 如果所选后端具有原生批处理 / 多任务接口，请使用它。每个任务都必须保留各自的提示词文件、输出路径、宽高比、会话 ID 和直接引用图像。
2. 如果没有原生批处理接口，但运行时可以发出并行工具调用，则一次最多分派 `generation_batch_size` 张图像。默认值：`4`。当前消息中用户的明确请求，例如 `--batch-size 4` 或“并行4张一起生成”，会覆盖 EXTEND.md。
3. 如果既没有原生批处理接口，也无法并行调用工具，则按顺序生成。

规则：

- 优先遵循工作流依赖关系：先生成 `characters/characters.png`，再生成将其用作参考的页面。
- 在所有选定页面的提示词文件都已写入磁盘之前，绝不要启动第一个页面批次。
- 失败项重试一次，不要重新生成成功项。
- 不要仅为了并行化图像渲染而使用子代理。仅将子代理用于独立的提示词迭代或创意探索。

## 参考图像

用户可以提供参考图像来引导艺术风格、调色板、场景构图或主体。这与自动生成的角色设定表（第 7.1 步）**相互独立**——两者可以共存：用户参考图引导视觉风格，角色设定表则锚定重复出现的角色身份。

**输入**：通过 `--ref <files...>` 接收，或在对话中由用户提供文件路径 / 粘贴图像。
- 文件路径 → 复制到漫画输出目录旁的 `refs/NN-ref-{slug}.{ext}`
- 未提供路径的粘贴图像 → 请求用户提供路径（遵循上方的 User Input Tools 规则），或在文本回退方案中以文字描述方式提取风格特征
- 没有参考图 → 跳过本节

**使用模式**（按参考图划分）：

| 用途 | 效果 |
|-------|--------|
| `direct` | 在每一页（或选定页面）将文件作为参考图传递给后端 |
| `style` | 提取风格特征（线条处理、纹理、氛围），并追加到每一页的提示词正文中 |
| `palette` | 提取十六进制颜色，并追加到每一页的提示词正文中 |

**存在参考图时，记录在每一页的提示词 frontmatter 中**：

```yaml
references:
  - ref_id: 01
    filename: 01-ref-scene.png
    usage: direct
```

**生成时**：
- 验证每个引用的文件确实存在于磁盘中
- 如果 `usage: direct` 且所选后端接受多个参考图 → 将角色设定表（步骤 7.2）和用户参考图通过后端的 ref 参数一并传递；按照步骤 7.1 的指导先压缩图像，以避免 payload 失败
- 如果后端只接受一个参考图 → 对于包含反复出现角色的页面，优先使用角色设定表；改为将用户参考图的特征嵌入提示词正文中
- 对于 `style`/`palette` 用途 → 将提取出的特征嵌入每一页的提示词文本中（无论后端是否具备相应能力，均适用）

## 选项

### 视觉尺寸

| 选项 | 值 | 描述 |
|--------|--------|-------------|
| `--art` | ligne-claire（默认）、manga、realistic、ink-brush、chalk、minimalist | 艺术风格 / 渲染技术 |
| `--tone` | neutral（默认）、warm、dramatic、romantic、energetic、vintage、action | 情绪 / 氛围 |
| `--layout` | standard（默认）、cinematic、dense、splash、mixed、webtoon、four-panel | 分镜排列 |
| `--aspect` | 3:4（默认，纵向）、4:3（横向）、16:9（宽屏） | 页面宽高比 |
| `--lang` | auto（默认）、zh、en、ja 等 | 输出语言 |
| `--ref <files...>` | 文件路径 | 应用于每一页的参考图，用于提供风格 / 调色板 / 场景指导。参见上方的[参考图](#reference-images)。 |
| `--batch-size <n>` | 1-8 | 本次运行的临时页面生成批量大小。默认值：`EXTEND.md` 中的 `generation_batch_size`，否则为 4。 |

### 部分工作流选项

| 选项 | 描述 |
|-------------|-------------|
| `--storyboard-only` | 仅生成分镜脚本，跳过提示词和图像 |
| `--prompts-only` | 生成分镜脚本 + 提示词，跳过图像 |
| `--images-only` | 从现有提示词目录生成图像 |
| `--regenerate N` | 仅重新生成指定页面（例如 `3` 或 `2,5,8`） |

详细信息：[references/partial-workflows.md](references/partial-workflows.md)

### 艺术风格、情绪与预设目录

- **艺术风格**（6 种）：`ligne-claire`、`manga`、`realistic`、`ink-brush`、`chalk`、`minimalist`。完整定义见 `references/art-styles/<style>.md`。
- **情绪**（7 种）：`neutral`、`warm`、`dramatic`、`romantic`、`energetic`、`vintage`、`action`。完整定义见 `references/tones/<tone>.md`。
- **预设**（5 种），包含超出普通艺术风格 + 情绪组合的特殊规则：

| 预设 | 等效组合 | 触发点 |
  |--------|-----------|------|
  | `ohmsha` | manga + neutral | 视觉隐喻、无正面讲话的人物、揭示小工具 |
  | `wuxia` | ink-brush + action | 气效果、战斗画面、氛围感 |
  | `shoujo` | manga + romantic | 装饰元素、眼部细节、浪漫情节 |
  | `concept-story` | manga + warm | 视觉符号系统、成长弧线、对话与动作的平衡 |
  | `four-panel` | minimalist + neutral + four-panel layout | 起承转合结构、黑白 + 重点色、简笔人物 |

  完整规则见 `references/presets/<preset>.md` —— 选定预设后加载该文件。

- **兼容性矩阵**和**内容信号 → 预设**表位于 [references/auto-selection.md](references/auto-selection.md)。在 Step 2 中推荐组合前请先阅读。

## 脚本目录

**重要**：所有脚本都位于此技能的 `scripts/` 子目录中。

**Agent 执行说明**：
1. 将此 SKILL.md 文件所在目录路径确定为 `{baseDir}`
2. 脚本路径 = `{baseDir}/scripts/<script-name>.ts`
3. 将本文档中的所有 `{baseDir}` 替换为实际路径
4. 解析 `${BUN_X}` runtime：如果已安装 `bun` → 使用 `bun`；如果有 `npx` → 使用 `npx -y bun`；否则建议安装 bun

**脚本参考**：
| 脚本 | 用途 |
|--------|---------|
| `scripts/merge-to-pdf.ts` | 将漫画页面合并为 PDF |

## 文件结构

输出目录：`comic/{topic-slug}/`
- Slug：根据主题生成 2-4 个单词的 kebab-case（例如：`alan-turing-bio`）
- 冲突：追加时间戳（例如：`turing-story-20260118-143052`）

**内容**：
| 文件 | 描述 |
|------|-------------|
| `source-{slug}.{ext}` | 源文件 |
| `analysis.md` | 内容分析 |
| `storyboard.md` | 包含分镜拆解的故事板 |
| `characters/characters.md` | 角色定义 |
| `characters/characters.png` | 角色参考图 |
| `prompts/NN-{cover\|page}-[slug].md` | 生成提示词 |
| `NN-{cover\|page}-[slug].png` | 生成的图像 |
| `{topic-slug}.pdf` | 最终合并的 PDF |

## 语言处理

**检测优先级**：
1. `--lang` flag（显式指定）
2. EXTEND.md 中的 `language` setting
3. 用户的对话语言
4. 源内容语言

**规则**：所有交互均使用用户的输入语言或已保存的语言偏好：
- 故事板大纲和场景描述
- 图像生成提示词
- 用户选择选项和确认信息
- 进度更新、问题、错误、摘要

技术术语保持 English。

## 工作流

### 进度检查清单

```
Comic Progress:
- [ ] Step 1: 设置与分析
  - [ ] 1.1 偏好设置（EXTEND.md）⛔ 阻塞
    - [ ] 找到 → 加载偏好设置 → 继续
    - [ ] 未找到 → 运行首次设置 → 必须完成后才能进行其他步骤
  - [ ] 1.2 分析，1.3 检查现有内容
- [ ] Step 2: 确认 - 风格与选项 ⚠️ 必需
- [ ] Step 3: 生成故事板 + 角色
- [ ] Step 4: 审核大纲（条件性）
- [ ] Step 5: 生成提示词
- [ ] Step 6: 审核提示词（条件性）
- [ ] Step 7: 生成图像
  - [ ] 7.1 生成角色图（如需要）→ characters/characters.png
  - [ ] 7.2 生成页面（如果存在角色图则使用 --ref）
- [ ] Step 8: 合并为 PDF
- [ ] Step 9: 完成报告
```

### 流程

```
Input → [Preferences] ─┬─ Found → Continue
                       │
                       └─ Not found → First-Time Setup ⛔ BLOCKING
                                      │
                                      └─ Complete setup → Save EXTEND.md → Continue
                                                                              │
        ┌─────────────────────────────────────────────────────────────────────┘
        ↓
Analyze → [Check Existing?] → [Confirm: Style + Reviews] → Storyboard → [Review?] → Prompts → [Review?] → Images → PDF → Complete
```

### 步骤摘要

| 步骤 | 操作 | 关键输出 |
|------|--------|------------|
| 1.1 | 加载 EXTEND.md 偏好设置，未找到时 ⛔ BLOCKING | 配置已加载 |
| 1.2 | 分析内容 | `analysis.md` |
| 1.3 | 检查现有目录 | 处理冲突 |
| 2 | 确认风格、重点、受众和审阅环节 | 用户偏好 |
| 3 | 生成分镜脚本和角色 | `storyboard.md`、`characters/` |
| 4 | 审阅大纲（如有请求） | 用户批准 |
| 5 | 生成提示词 | `prompts/*.md` |
| 6 | 审阅提示词（如有请求） | 用户批准 |
| 7.1 | 生成角色设定表（如需要） | `characters/characters.png` |
| 7.2 | 生成页面（如有角色参考则使用） | `*.png` 文件 |
| 8 | 合并为 PDF | `{slug}.pdf` |
| 9 | 完成报告 | 摘要 |

### 步骤 7：图像生成

根据顶部的 `## Image Generation Tools` 规则，在每个会话中**选择一次后端**。如果后端是仓库 skill（例如 `baoyu-image-gen`），请阅读其 `SKILL.md`，并使用其中记录的接口，而不是使用其脚本。

**`codex-imagegen` 调用**：当规则解析为 `codex-imagegen` 时，请参阅 [references/codex-imagegen.md](references/codex-imagegen.md) 了解调用约定（首选 `baoyu-image-gen --provider codex-cli` 路径、运行时包装器发现、参数说明、stdout 模式、批处理语义——每次调用 n=1，因此页面批次必须每页调度一次包装器调用）。

**7.1 角色设定表**——当漫画为多页且包含反复出现的角色时生成（保存至 `characters/characters.png`，宽高比为 `4:3`）。对于简单预设（例如四格极简风格）或单页漫画则跳过。使用 `--ref` 前先压缩为 JPEG（macOS 使用 `sips -s format jpeg -s formatOptions 80 …`，其他系统使用 `pngquant --quality=65-80 …`），以避免 payload 失败。调用后端前，`characters/characters.md` 提示词文件必须存在。

**7.2 页面**——调用后端前，每个页面的提示词**必须**已经位于 `prompts/NN-{cover|page}-[slug].md`；该文件是可复现性记录。策略取决于角色设定表：

| 角色设定表 | 后端 `--ref` | 策略 |
|-----------------|-----------------|----------|
| 存在 | 支持 | 在每个页面上将设定表作为 `--ref` 传入 |
| 存在 | 不支持 | 将角色描述添加到每个提示词文件的开头 |
| 跳过 | — | 在提示词中内联所有描述 |

**执行策略**：需要时先生成角色设定表。然后从已保存的提示词文件中构建选定的页面任务列表，并根据 `## Batch Generation Policy` 分批调度页面：首先使用后端原生批处理，其次使用运行时并行工具调用，最后才使用顺序执行作为备用方案。`--regenerate N` 和 `--images-only` 对选定的现有提示词应用相同的批处理规则。

**备份规则**：现有的 `prompts/…md` 和 `…png` 文件 → 在重新生成之前，使用 `-backup-YYYYMMDD-HHMMSS` 后缀重命名。宽高比取自分镜（默认为 `3:4`；预设可能会覆盖该设置）。

**`--ref` 失败恢复**：压缩图集 → 重试 → 仍然失败 → 移除 `--ref`，并将角色描述嵌入提示文本中。

完整的分步工作流（分析、分镜、审核关卡、重新生成变体）：[references/workflow.md](references/workflow.md)。

### EXTEND.md 路径 ⛔ 阻塞性要求

如果未找到 EXTEND.md，首次设置将构成**阻塞性要求**——必须先完成设置，然后才能进行任何内容分析或风格/语气问题。

| 优先级 | 路径 | 范围 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-comic/EXTEND.md` | 项目 |
| 2 | `$HOME/.baoyu-skills/baoyu-comic/EXTEND.md` | 用户主目录 |

| 结果 | 操作 |
|--------|--------|
| 找到 | 读取、解析并显示摘要 → 继续 |
| 未找到 | ⛔ 运行首次设置（[references/config/first-time-setup.md](references/config/first-time-setup.md)）→ 保存 EXTEND.md → 继续 |

**EXTEND.md 支持**：水印、首选艺术风格/语气/布局、自定义风格定义、角色预设、语言偏好、首选图像后端、生成批次大小。架构：[references/config/preferences-schema.md](references/config/preferences-schema.md)。

## 参考资料

**核心模板**：
- [analysis-framework.md](references/analysis-framework.md) - 深度内容分析
- [character-template.md](references/character-template.md) - 角色定义格式
- [storyboard-template.md](references/storyboard-template.md) - 分镜结构
- [ohmsha-guide.md](references/ohmsha-guide.md) - Ohmsha 漫画规范

**风格定义**：
- `references/art-styles/` - 艺术风格（ligne-claire、manga、realistic、ink-brush、chalk、minimalist）
- `references/tones/` - 语气（neutral、warm、dramatic、romantic、energetic、vintage、action）
- `references/presets/` - 具有特殊规则的预设（ohmsha、wuxia、shoujo、concept-story、four-panel）
- `references/layouts/` - 布局（standard、cinematic、dense、splash、mixed、webtoon、four-panel）

**工作流**：
- [workflow.md](references/workflow.md) - 完整工作流详情
- [auto-selection.md](references/auto-selection.md) - 内容信号分析
- [partial-workflows.md](references/partial-workflows.md) - 部分工作流选项

**配置**：
- [config/preferences-schema.md](references/config/preferences-schema.md) - EXTEND.md 架构
- [config/first-time-setup.md](references/config/first-time-setup.md) - 首次设置
- [config/watermark-guide.md](references/config/watermark-guide.md) - 水印配置

## 页面修改

| 操作 | 步骤 |
|-------|-------|
| **编辑** | **首先更新提示文件** → `--regenerate N` → 重新生成 PDF |
| **添加** | 在相应位置创建提示文件 → 使用角色参考图生成 → 对后续页面重新编号 → 更新分镜 → 重新生成 PDF |
| **删除** | 移除文件 → 对后续页面重新编号 → 更新分镜 → 重新生成 PDF |

**重要**：更新页面时，务必**首先**更新提示文件（`prompts/NN-{cover|page}-[slug].md`），然后再重新生成。这样可以确保更改得到记录，并且能够复现。

文本修正策略：

- 如果对话、音效、分镜标签或任何其他渲染文本存在拼写错误、乱码、难以辨认或视觉效果不佳的问题，不要用代码修补位图。
- 对于文本修正重新生成，请编写新的提示词文件并使用新的输出路径，以便保留有问题的候选版本用于比较。
- 后处理仅限于不改变文本或主要构图的裁剪、缩放、压缩或格式转换。

## 注意事项

- 图像生成：每页 10-30 秒
- 生成失败时自动重试一次
- 对敏感公众人物使用风格化替代方案
- 通过会话 ID 保持风格一致性
- **需要确认步骤 2** - 不要跳过
- **步骤 4/6 为条件性步骤** - 仅当用户在步骤 2 中提出请求时执行
- **步骤 7.1 角色设定表** - 推荐用于多页漫画，简单预设时可选
- **步骤 7.2 角色参考图** - 如果设定表存在，使用 `--ref`；失败时进行压缩/转换；回退到仅提示词方案
- 水印/语言在 EXTEND.md 中一次性配置

## 更改偏好设置

EXTEND.md 位于 `.baoyu-skills/baoyu-comic/EXTEND.md`（项目级）或 `~/.baoyu-skills/baoyu-comic/EXTEND.md`（用户级）。有三种更改方式：

- **直接编辑** — 打开 EXTEND.md 并更改字段。完整架构：`references/config/preferences-schema.md`。
- **交互式重新配置** — 删除 EXTEND.md（或请求“重新配置 baoyu-comic 偏好设置”/“重新配置”）。下一次运行将重新触发首次设置。
- **常用单行编辑**：
  - `preferred_image_backend: auto` — 默认值；优先使用运行时原生工具，回退到唯一已安装的后端，仅当存在多个非原生后端时才询问。
  - `preferred_image_backend: codex-imagegen` — 固定使用 Codex 的内置工具。
  - `preferred_image_backend: baoyu-image-gen` — 固定使用 baoyu-image-gen skill。
  - `preferred_image_backend: ask` — 每次运行时确认后端。
  - `generation_batch_size: 4` — 当后端/运行时支持批量或并行生成时，并发渲染的默认页面图像数量。
  - `watermark.enabled: true`、`preferred_art`、`preferred_tone`、`preferred_layout`、`language` — 调整自动选择的默认设置和外观选项。