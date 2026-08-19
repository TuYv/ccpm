---
name: baoyu-format-markdown
description: Formats plain text or markdown files with frontmatter, titles, summaries, headings, bold, lists, and code blocks. Use when user asks to "format markdown", "beautify article", "add formatting", or improve article layout. Outputs to {filename}-formatted.md.
version: 1.57.0
metadata:
  openclaw:
    homepage: https://github.com/JimLiu/baoyu-skills#baoyu-format-markdown
    requires:
      anyBins:
        - bun
        - npx
---
# Markdown 格式化器

将纯文本或 Markdown 转换为结构清晰、便于阅读的 Markdown。目标是帮助读者快速掌握要点、亮点和结构——同时不改变任何原始内容。

**核心原则**：仅调整格式并修正明显的拼写错误。绝不新增、删除或改写内容。

## 用户输入工具

当此技能需要提示用户时，请遵循以下工具选择规则（按优先级排序）：

1. **优先使用当前智能体运行时提供的内置用户输入工具**——例如 `AskUserQuestion`、`request_user_input`、`clarify`、`ask_user` 或任何等效工具。
2. **回退方案**：如果不存在此类工具，则输出一条带编号的纯文本消息，并要求用户针对每个问题回复所选编号/答案。
3. **批量处理**：如果该工具支持一次调用多个问题，请将所有适用问题合并到一次调用中；如果仅支持单个问题，则按优先级逐个提问。

下文中具体的 `AskUserQuestion` 引用仅为示例——在其他运行时中请替换为本地等效工具。

## 脚本目录

脚本位于 `scripts/` 子目录中。`{baseDir}` = 此 SKILL.md 的目录路径。解析 `${BUN_X}` 运行时：如果已安装 `bun` → `bun`；如果 `npx` 可用 → `npx -y bun`；否则建议安装 bun。请将 `{baseDir}` 和 `${BUN_X}` 替换为实际值。

| 脚本 | 用途 |
|--------|---------|
| `scripts/main.ts` | 带有 CLI 选项的主入口（使用 remark-cjk-friendly 处理 CJK 强调） |
| `scripts/quotes.ts` | 将 ASCII 引号替换为全角引号 |
| `scripts/autocorrect.ts` | 通过 autocorrect 添加 CJK/英文间距 |

## 偏好设置 (EXTEND.md)

按优先级检查 EXTEND.md——找到的第一个即生效：

| 优先级 | 路径 | 作用域 |
|----------|------|-------|
| 1 | `.baoyu-skills/baoyu-format-markdown/EXTEND.md` | 项目 |
| 2 | `${XDG_CONFIG_HOME:-$HOME/.config}/baoyu-skills/baoyu-format-markdown/EXTEND.md` | XDG |
| 3 | `$HOME/.baoyu-skills/baoyu-format-markdown/EXTEND.md` | 用户主目录 |

如果均未找到，则使用默认设置——此技能无需首次设置。

**EXTEND.md 支持**：

| 设置 | 值 | 默认值 | 描述 |
|---------|--------|---------|-------------|
| `auto_select` | `true`/`false` | `false` | 跳过标题和摘要选择，自动选取最佳项 |
| `auto_select_title` | `true`/`false` | `false` | 仅跳过标题选择 |
| `auto_select_summary` | `true`/`false` | `false` | 仅跳过摘要选择 |
| 其他 | — | — | 默认格式化选项、排版偏好 |

## 用法

工作流分为两个阶段：**分析**（理解内容）和**格式化**（应用格式）。Claude 执行内容分析和格式化（步骤 1-5），然后运行脚本进行排版修正（步骤 6）。

## 工作流

### 步骤 1：读取并检测内容类型

读取用户指定的文件，然后检测内容类型：

| 指示项 | 分类 |
|-----------|----------------|
| 包含 `---` YAML frontmatter | Markdown |
| 包含 `#`、`##`、`###` 标题 | Markdown |
| 包含 `**bold**`、`*italic*`、列表、代码块、引用块 | Markdown |
| 以上均无 | 纯文本 |

**如果检测到 Markdown，请使用 `AskUserQuestion` 询问：**

```
Detected existing markdown formatting. What would you like to do?

1. Optimize formatting (Recommended)
   - Analyze content, improve headings, bold, lists for readability
   - Run typography script (spacing, emphasis fixes)
   - Output: {filename}-formatted.md

2. Keep original formatting
   - Preserve existing markdown structure
   - Run typography script only
   - Output: {filename}-formatted.md

3. Typography fixes only
   - Run typography script on original file in-place
   - No copy created, modifies original file directly
```

**根据用户的选择：**
- **优化**：继续执行步骤 2（完整工作流）
- **保留原格式**：跳转至步骤 5，复制文件，然后执行步骤 6
- **仅进行排版修复**：跳转至步骤 6，直接对原文件执行

### 步骤 2：分析内容（从读者角度出发）

仔细阅读全部内容。站在读者的角度思考：哪些内容有助于他们快速理解并记住关键信息？

生成一份涵盖以下维度的分析：

**2.1 重点与关键洞察**
- 作者提出的核心论点或结论
- 令人意外的事实、数据点或违反直觉的观点
- 令人印象深刻的引语或措辞精炼的句子（金句）

**2.2 结构评估**
- 内容是否具有清晰的逻辑流程？具体是什么？
- 是否存在缺少标题的自然分节？
- 是否有适合通过视觉分隔来改善阅读体验的大段文字？

**2.3 对读者重要的信息**
- 可执行的建议或要点
- 关键概念的定义和解释
- 隐藏在段落中的列表或枚举项
- 哪些比较或对照转换为表格后会更加清晰

**2.4 格式问题**
- 标题层级缺失或不一致
- 一个段落混合了多个主题
- 原本应使用列表呈现的并列项目却以正文形式书写
- 代码、命令或技术术语未标记为代码
- 明显的拼写错误或格式错误

**将分析保存到文件**：`{original-filename}-analysis.md`

分析文件将作为步骤 3 的蓝图。使用以下格式：

```markdown
# Content Analysis: {filename}

## Highlights & Key Insights
- [list findings]

## Structure Assessment
- Current flow: [describe]
- Suggested sections: [list heading candidates with brief rationale]

## Reader-Important Information
- [list actionable items, key concepts, buried lists, potential tables]

## Formatting Issues
- [list specific issues with location references]

## Typos Found
- [list any obvious typos with corrections, or "None found"]
```

### 步骤 3：检查/创建 Frontmatter、标题和摘要

检查是否存在 YAML frontmatter（`---` 块）。如果缺失则创建。

| 字段 | 处理方式 |
|-------|------------|
| `title` | 参见下方的**标题生成** |
| `slug` | 根据文件路径推断，或根据标题生成 |
| `summary` | 一句话的简洁摘要（参见下方的**摘要生成**） |
| `description` | 更长的描述性摘要（参见下方的**摘要生成**） |
| `coverImage` | 检查同一目录下是否存在 `imgs/cover.png`；如果存在，则使用相对路径 |

#### 标题生成

无论是否已经存在标题，除非设置了 `auto_select_title`，否则都要运行标题优化流程。

**准备工作** — 阅读全文并提取：
- 核心论点（一句话：“这篇文章讲的是什么？”）
- 最具影响力的观点或结论
- 读者的痛点或好奇心触发点
- 最令人难忘的比喻或金句

使用 `references/title-formulas.md` 中的公式**生成候选标题**：

1. 根据文章的内容、语气和结构，选择 **2-3 个最匹配的钩子公式**（参见参考文档中的“When to pick each formula”）
2. **生成 1-2 个直白标题**（描述性或陈述性标题，不使用公式——清晰且准确）
3. 如果用户指定了方向（例如“让它更有悬念感”），优先遵循该方向
4. 总数：**4-5 个候选标题**

通过 `AskUserQuestion` 呈现：

```
Pick a title:

1. [Hook title A] — (recommended) [formula name]
2. [Hook title B] — [formula name]
3. [Hook title C] — [formula name]
4. [Straightforward title D] — straightforward
5. [Straightforward title E] — straightforward

Enter number, or type a custom title:
```

将最有力的钩子标题放在首位，并标记为 `(recommended)`。有关原则和禁止使用的模式，请参见 `references/title-formulas.md`。

如果第一行是 H1 标题，则将其提取到 frontmatter 中，并从正文中移除。如果 frontmatter 已经有 `title`，将其作为上下文参考，但仍然要生成新的候选标题——现有标题可能不够好。

**跳过行为**：如果 `auto_select: true` 或 `auto_select_title: true`，跳过用户提示，直接使用排名最前的候选标题。

#### 摘要生成

直接生成两个版本（无需用户选择），并将二者都存储在 frontmatter 中：

| 字段 | 长度 | 用途 |
|-------|--------|---------|
| `summary` | 1 句话，约 50-80 个字符 | 简洁的吸引点——用于信息流、社交分享、SEO 元数据 |
| `description` | 2-3 句话，约 100-200 个字符 | 更丰富的背景——用于文章预览、新闻简报简介 |

**原则**：

- 传达读者能够获得的**核心价值**，而不只是介绍主题
- 相比模糊的描述，优先使用具体细节（数字、结果、具体方法）
- `summary` 应简洁有力且完整自洽；`description` 可以通过补充细节进行展开
- 如果 frontmatter 已经有 `summary` 或 `description`，保留已有字段，只生成缺失的字段

**禁止使用的模式**：

- “This article introduces...”、“This article explores...”
- 只描述主题而不说明价值主张
- 换一种说法重复标题

标题加入 frontmatter 后，正文中**不应包含 H1**（避免重复）。

### 第 4 步：格式化内容

根据第 2 步的分析应用格式。目标是让内容便于快速浏览，并确保关键要点不可能被忽略。

**格式化工具：**

| 元素 | 使用时机 | 格式 |
|---------|-------------|--------|
| 标题 | 自然的主题边界、章节分隔 | `##`、`###` 层级 |
| 加粗 | 关键结论、重要术语、核心要点 | `**bold**` |
| 无序列表 | 并列项目、功能列表、示例 | `- item` |
| 有序列表 | 连续步骤、排序项目、操作流程 | `1. item` |
| 表格 | 对比、结构化数据、选项矩阵 | Markdown 表格 |
| 代码 | 命令、文件路径、技术术语、变量名 | `` `inline` `` 或围栏代码块 |
| 引用块 | 重要引语、重要警告、引用文本 | `> quote` |
| 分隔线 | 主要主题转换 | `---` |

**格式原则——不要做以下事情：**
- 不要添加句子、解释或评论
- 不要删除或缩短任何内容
- 不要改述或重写作者的话
- 不要添加带有编辑倾向的标题（例如“惊人的发现”——应使用中性的描述性标题）
- 不要过度格式化：不是每个句子都需要加粗，也不是每个段落都需要标题

**格式原则——应当做以下事情：**
- 保留作者的声音、语气和每一个字
- **加粗关键结论和核心要点**——即读者会重点标记的句子
- 仅当段落中明确存在相应结构时，才将并列项目提取为列表
- 在主题确实发生变化的地方添加标题——优先使用生动、具体的标题，而不是泛泛的标题（例如“3 天搞定 vs 传统方案”，而不是“方案对比”）
- 对比较内容或散落在正文中的结构化数据使用表格
- 对金句、令人印象深刻的表述或重要警告使用引用块
- 修正明显的拼写错误（依据第 2 步的发现）

### 第 5 步：保存格式化文件

保存为 `{original-filename}-formatted.md`

**备份现有文件：**

```bash
if [ -f "{filename}-formatted.md" ]; then
  mv "{filename}-formatted.md" "{filename}-formatted.backup-$(date +%Y%m%d-%H%M%S).md"
fi
```

### 第 6 步：执行排版脚本

在输出文件上运行格式化脚本：

```bash
${BUN_X} {baseDir}/scripts/main.ts {output-file-path} [options]
```

**脚本选项：**

| 选项 | 简写 | 描述 | 默认值 |
|--------|-------|-------------|---------|
| `--quotes` | `-q` | 将 ASCII 引号替换为全角引号 `"..."` | false |
| `--no-quotes` | | 不替换引号 | |
| `--spacing` | `-s` | 通过 autocorrect 添加中英文间距 | true |
| `--no-spacing` | | 不添加中英文间距 | |
| `--emphasis` | `-e` | 修正中文强调标点问题 | true |
| `--no-emphasis` | | 不修正中文强调问题 | |

**示例：**

```bash
# 默认：启用间距 + 强调修正，禁用引号替换
${BUN_X} {baseDir}/scripts/main.ts article.md

# 启用所有功能，包括引号替换
${BUN_X} {baseDir}/scripts/main.ts article.md --quotes

# 仅修正强调问题，跳过间距处理
${BUN_X} {baseDir}/scripts/main.ts article.md --no-spacing
```

**脚本执行的操作（取决于选项）：**
1. 修正中文强调/加粗标点问题（默认：启用）
2. 通过 autocorrect 添加中英文混排文本间距（默认：启用）
3. 将 ASCII 引号替换为全角引号（默认：禁用）
4. 格式化 frontmatter YAML（始终启用）

### 第 7 步：完成报告

显示一份总结所有已完成更改的报告：

```
**Formatting Complete**

**Files:**
- Analysis: {filename}-analysis.md
- Formatted: {filename}-formatted.md

**Content Analysis Summary:**
- Highlights found: X key insights
- Golden quotes: X memorable sentences
- Formatting issues fixed: X items

**Changes Applied:**
- Frontmatter: [added/updated] (title, slug, summary)
- Headings added: X (##: N, ###: N)
- Bold markers added: X
- Lists created: X (from prose → list conversion)
- Tables created: X
- Code markers added: X
- Blockquotes added: X
- Typos fixed: X [list each: "original" → "corrected"]

**Typography Script:**
- CJK spacing: [applied/skipped]
- Emphasis fixes: [applied/skipped]
- Quote replacement: [applied/skipped]
```

调整报告以反映实际变更——省略未作任何更改的类别。

## 注意事项

- 保持原有的写作风格和语气
- 为代码块指定正确的语言（例如，`python`、`javascript`）
- 遵循中英文间距规范
- 分析文件是工作文档——它有助于保持已识别内容与已格式化内容之间的一致性

## 扩展支持

通过 EXTEND.md 使用自定义配置。路径和支持的选项请参见 **Preferences** 部分。