---
name: baoyu-translate
description: >-
  This skill should be used when the user asks to "translate", "翻译", "精翻", "translate article",
  "translate to Chinese", "translate to English", "改成中文", "改成英文", "convert to Chinese",
  "localize", "本地化", "refined translation", "精细翻译", "proofread translation", "快速翻译", "快翻",
  "这篇文章翻译一下", or provides a URL/file with translation intent. Supports three modes
  (quick/normal/refined) with custom glossary support.
version: 1.117.3
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-translate
    requires:
      anyBins:
        - bun
        - npx
---
# 翻译器

三种模式的翻译技能：**quick** 用于直接翻译，**normal** 用于基于分析的翻译，**refined** 用于包含审校和润色的完整出版级工作流。

## 用户输入工具

当此技能提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用**当前代理运行时提供的内置用户输入工具——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果没有此类工具，则输出编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量提问**：如果工具支持每次调用提出多个问题，则将所有适用问题合并到一次调用中；如果仅支持单个问题，则按优先级顺序逐一提问。

以下具体的 `AskUserQuestion` 引用仅为示例——在其他运行时中请替换为本地等效工具。

## 脚本目录

脚本位于 `scripts/` 子目录中。`{baseDir}` = 此 SKILL.md 所在的目录路径。解析 `${BUN_X}` 运行时：如果已安装 `bun` → 使用 `bun`；如果有 `npx` → 使用 `npx -y bun`；否则建议安装 bun。将 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| 脚本 | 用途 |
|--------|---------|
| `scripts/main.ts` | CLI 入口点。默认操作将 markdown 拆分为多个块；也支持显式的 `chunk` 子命令 |
| `scripts/chunk.ts` | `main.ts` 使用的 Markdown 分块实现，同时保持可直接调用的兼容性 |

## 偏好设置（EXTEND.md）

按优先级顺序检查 EXTEND.md——使用找到的第一个文件：

| 优先级 | 路径 | 范围 |
|----------|------|----------|
| 1 | `.baoyu-skills/baoyu-translate/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-translate/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-translate/EXTEND.md` | 用户主目录 |

| 结果 | 操作 |
|--------|--------|
| 找到 | 读取、解析并应用。在会话中首次使用时，简要提醒："正在使用 [path] 中的偏好设置。你可以编辑 EXTEND.md 来自定义术语表、受众等。" |
| 未找到 | **必须**运行首次设置（见下文）——不得静默使用默认值 |

**EXTEND.md 支持**：默认目标语言、默认模式、目标受众、自定义术语表（内联或文件路径）、翻译风格、分块设置。

架构：[references/config/extend-schema.md](references/config/extend-schema.md)。

### 首次设置（阻塞）

**重要**：未找到 EXTEND.md 时，**必须**在进行任何翻译之前运行首次设置。这是一个**阻塞**操作。

完整参考：[references/config/first-time-setup.md](references/config/first-time-setup.md)

使用 `AskUserQuestion` 在**一次调用**中提出所有问题（目标语言、模式、受众、风格、保存位置）。用户回答后，在所选位置创建 EXTEND.md，确认 "Preferences saved to [path]"，然后继续。

## 默认值

所有可配置值集中于此处。EXTEND.md 会覆盖这些值；CLI 标志会覆盖 EXTEND.md。

| 设置 | 默认值 | EXTEND.md 键 | CLI 标志 | 描述 |
|---------|---------|---------------|----------|-------------|
| 目标语言 | `zh-CN` | `target_language` | `--to` | 翻译目标语言 |
| 模式 | `normal` | `default_mode` | `--mode` | 翻译模式 |
| 受众 | `general` | `audience` | `--audience` | 目标读者画像 |
| 风格 | `storytelling` | `style` | `--style` | 翻译风格偏好 |
| 分块阈值 | `4000` | `chunk_threshold` | — | 触发分块翻译的字数 |
| 分块最大字数 | `5000` | `chunk_max_words` | — | 每个分块的最大字数 |

## 模式

| 模式 | 标志 | 步骤 | 使用场景 |
|------|------|-------|-------------|
| 快速 | `--mode quick` | 翻译 | 短文本、非正式内容、快速任务 |
| 常规 | `--mode normal`（默认） | 分析 → 翻译 | 文章、博客文章、一般内容 |
| 精修 | `--mode refined` | 分析 → 翻译 → 审校 → 润色 | 出版级质量、重要文档 |

**默认模式**：常规（可通过 EXTEND.md 中的 `default_mode` 设置覆盖）。

**风格预设** — 控制译文的语气和文风（独立于受众）：

| 值 | 描述 | 效果 |
|-------|-------------|--------|
| `storytelling` | 引人入胜的叙事流畅感（默认） | 吸引读者、过渡自然、措辞生动 |
| `formal` | 专业、结构化 | 语气中立、组织清晰、不使用口语表达 |
| `technical` | 精确、文档风格 | 简洁、术语密集、尽量少修饰 |
| `literal` | 接近原文结构 | 尽量少重组，保留源文句式 |
| `academic` | 学术化、严谨 | 正式语体、可使用复杂从句、兼顾引用规范 |
| `business` | 简洁、结果导向 | 面向行动、适合管理人员、注重条目化思维 |
| `humorous` | 保留并调整幽默感 | 机智、俏皮、在目标语言中重现喜剧效果 |
| `conversational` | 随意、口语化 | 友好、平易近人，如同向朋友解释 |
| `elegant` | 文学化、精雕细琢的文风 | 兼具美感与精致度，讲究节奏和用词 |

也接受自定义风格描述，例如 `--style "poetic and lyrical"`。

**自动检测**：
- “快翻”、“quick”、“直接翻译” → 快速模式
- “精翻”、“refined”、“publication quality”、“proofread” → 精修模式
- 否则 → 默认模式（常规）

**升级提示**：常规模式完成后，显示：
> 翻译已保存。如需进一步审校和润色，请回复“继续润色”或“refine”。

如果用户回复，则对现有输出继续执行审校 → 润色步骤（与 refined-workflow.md 中精修模式的步骤 4-6 相同）。

**受众预设**：

| 值 | 描述 | 效果 |
|-------|-------------|--------|
| `general` | 普通读者（默认） | 使用通俗语言，为术语添加更多译者注释 |
| `technical` | 开发者 / 工程师 | 对常见技术术语减少注释 |
| `academic` | 研究人员 / 学者 | 正式语体、术语精确 |
| `business` | 商务专业人士 | 商务友好型语气，解释技术概念 |

也接受自定义受众描述，例如 `--audience "AI感兴趣的普通读者"`。

## 工作流

### 步骤 1：加载偏好设置

1.1 检查 EXTEND.md（参见上方的“偏好设置”部分）

1.2 如果可用，加载该语言对的内置术语表：
- EN→ZH：[references/glossary-en-zh.md](references/glossary-en-zh.md)

1.3 合并术语表：EXTEND.md `glossary`（内联）+ EXTEND.md `glossary_files`（外部文件，路径相对于 EXTEND.md 所在位置）+ 内置术语表 + `--glossary` 文件（CLI 覆盖所有其他设置）

### 第 2 步：实体化源内容并创建输出目录

实体化源内容（文件保持原样，内联文本/URL → 保存至 `translate/{slug}.md`），然后创建输出目录：`{source-dir}/{source-basename}-{target-lang}/`。如果未指定 `--from`，则检测源语言。

完整详情：[references/workflow-mechanics.md](references/workflow-mechanics.md)

**输出目录内容**（所有中间文件和最终文件均存放于此）：

| 文件 | 模式 | 描述 |
|------|------|------|
| `translation.md` | 全部 | 最终译文（始终使用此名称） |
| `01-analysis.md` | Normal、Refined | 内容分析（领域、语气、术语） |
| `02-prompt.md` | Normal、Refined | 组装后的翻译提示词 |
| `03-draft.md` | Refined | 审校前的初始草稿 |
| `04-critique.md` | Refined | 批判性审校结果（仅诊断） |
| `05-revision.md` | Refined | 基于审校意见修订的译文 |
| `chunks/` | Chunked | 源内容分块 + 已翻译分块 |

### 第 3 步：评估内容长度

Quick 模式不分块——无论长度如何，均直接翻译。翻译前，估算字数。如果内容超过分块阈值（默认 4000 词），主动警告：“本文约有 {N} 词。Quick 模式会在不分块的情况下单次翻译——对于长内容，`--mode normal` 可通过保持术语一致性而获得更好的结果。”如果用户未切换模式，则继续执行。

对于 normal 和 refined 模式：

| 内容 | 操作 |
|---------|--------|
| 小于分块阈值 | 作为单个单元翻译 |
| 大于等于分块阈值 | 分块翻译（参见第 3.1 步） |

**3.1 长内容准备**（仅适用于 normal/refined 模式且内容大于等于分块阈值）

翻译分块前：

1. **提取术语**：扫描整个文档，查找专有名词、技术术语和重复出现的短语
2. **构建会话术语表**：将提取的术语与已加载的术语表合并，确定一致的译法
3. **拆分为分块**：使用 `${BUN_X} {baseDir}/scripts/main.ts <file> [--max-words <chunk_max_words>] [--output-dir <output-dir>]`
   - 解析 Markdown 块（标题、段落、列表、代码块、表格等）
   - 在 Markdown 块边界处分割，以保留结构
   - 如果单个块超过阈值，则回退为按行拆分，随后按词拆分
4. **组装翻译提示词**：
   - 主代理读取 `01-analysis.md`（如存在），并使用 [references/subagent-prompt-template.md](references/subagent-prompt-template.md) 的第 1 部分组装共享上下文——内联包含：目标风格、内容背景、合并后的术语表和翻译挑战
   - 将其保存为输出目录中的 `02-prompt.md`（仅共享上下文，不包含任务说明）
5. **通过子代理生成翻译草稿**（如果 Agent 工具可用）：
   - **每个分块**启动一个子代理，并全部并行执行（模板第 2 部分）
   - 每个子代理读取 `02-prompt.md` 以获取共享上下文，接收分块位置信息（共 M 块中的第 N 块 + 其在论述中的位置简介），翻译该分块，并保存至 `chunks/chunk-NN-draft.md`
   - 通过共享的 `02-prompt.md` 保证一致性（包括术语表、比喻语言映射、理解难点、源文本语气，以及分析中提出的翻译挑战）
   - 如果没有分块（内容低于阈值）：为整个源文件启动一个子代理
   - 如果 Agent 工具不可用，则使用 `02-prompt.md` 内联按顺序翻译各分块
6. **合并**：所有子代理完成后，按顺序合并已翻译的分块。如果 `chunks/frontmatter.md` 存在，则将其置于开头。保存为 `03-draft.md`（refined）或 `translation.md`（normal）
7. `chunks/` 中会保留所有中间文件（源内容分块和已翻译分块）。

**分块初稿合并后**，将控制权交回主代理，以进行严格审阅、修订和润色（第 4 步）。

### 第 4 步：翻译与完善

**翻译原则**（适用于所有模式）：

- **重写，而非直译**：将内容改写成自然、引人入胜的目标语言，让它读起来就像是由母语娴熟的作者从头创作的一样。质量检验标准：“这段文字读起来像是原本就用目标语言写成的吗？”
- **准确性优先**：事实、数据和逻辑必须与原文完全一致
- **行文自然流畅**：使用符合目标语言习惯的语序。将源语言中的长句拆分成更短、更自然的句子。根据隐喻和习语 intended meaning（**实际含义**）进行处理，而不是逐字翻译
- **术语**：统一使用标准译法。专业术语首次出现时，在后面括注原文
- **保留格式**：保留所有 Markdown 格式（标题、粗体、斜体、图片、链接、代码块）
- **主动补充解释**：对于目标读者可能缺乏上下文的行话或概念，添加简洁的 **粗体括号说明** `（**解释**）`。注释应尽量少，仅在确实有助于理解时添加
- **Frontmatter**：如果源文档包含 YAML frontmatter，请为带有 `source` 前缀的元数据字段重命名（采用 camelCase：`url`→`sourceUrl`、`title`→`sourceTitle` 等），将翻译后的值作为新的顶级字段添加（如果正文包含 H1，则跳过 `title`），其他字段保持不变

#### 快速模式

直接翻译 → 保存到 `translation.md`。应用上述所有翻译原则。

#### 普通模式

1. **分析** → `01-analysis.md`（领域、语气、术语、翻译难点）
2. **组装提示词** → `02-prompt.md`（包含上下文、术语表和难点的翻译说明）
3. **翻译**（遵循 `02-prompt.md`）→ `translation.md`

完成后，提示用户：“Translation saved. To further review and polish, reply **继续润色** or **refine**.”

如果用户继续操作，则进行严格审阅 → 修订 → 润色（与下方精修模式第 4–6 步相同），将当前的 `translation.md` 重命名为 `03-draft.md`，并保存 `04-critique.md`、`05-revision.md` 以及更新后的 `translation.md`。

#### 精修模式

面向出版质量的完整工作流。有关各步骤的详细指南，请参阅 [references/refined-workflow.md](references/refined-workflow.md)。

如果在第 3.1 步使用子代理，子代理仅负责初始起草。后续所有步骤（严格审阅、修订、润色）均由主代理负责，主代理也可自行决定是否委派给子代理。

步骤及保存的文件（全部位于输出目录中）：
1. **分析** → `01-analysis.md`（领域、语气、术语、翻译难点）
2. **组装提示词** → `02-prompt.md`（内联上下文的翻译说明）
3. **起草** → `03-draft.md`（包含译者注释的初始译文；如果采用分块方式，则由子代理生成）
4. **严格审阅** → `04-critique.md`（仅作诊断：准确性、欧化语言、策略执行情况、表达问题）
5. **修订** → `05-revision.md`（应用所有审阅结果，生成修订后的译文）
6. **润色** → `translation.md`（最终达到出版质量的译文）

每个步骤都会读取上一步骤的文件，并在其基础上继续处理。

### 第 5 步：输出

最终译文始终位于输出目录中的 `translation.md`。

写入最终译文后，进行一次轻量级的图像语言检查：

1. 从译文文章中收集图像引用
2. 识别可能包含大量文字的图像，例如封面、屏幕截图、图表、框架图和信息图
3. 如果某张图像可能包含与译文文章语言不匹配的主要文字语言，主动提醒用户
4. 提醒内容必须仅为列表。除非用户提出要求，否则不要自动本地化这些图像

提醒格式（使用文章已有的图像语法——标准 Markdown 或 wikilink）：
```text
Possible image localization needed:
- ![example cover](attachments/example-cover.png): likely still contains source-language text while the article is now in target language
- ![example diagram](attachments/example-diagram.png): likely text-heavy framework graphic, check whether labels need translation
```

显示摘要：
```
**Translation complete** ({mode} mode)

Source: {source-path}
Languages: {from} → {to}
Output dir: {output-dir}/
Final: {output-dir}/translation.md
Glossary terms applied: {count}
```

如果发现语言不匹配的图像候选项，请在摘要后附上一条简短说明，告知用户某些嵌入图像可能仍需要进行图像文字本地化，然后列出候选项。

## 扩展支持

通过 EXTEND.md 使用自定义配置。路径和支持的选项请参见 **Preferences** 部分。