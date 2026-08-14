---
name: genre-creator
description: Create new genre documentation files for the bitwize-music genre library. Use when the user wants to add a genre, says "/genre-creator", "neues Genre erstellen", "Genre hinzufuegen", "add genre", or asks to create genre documentation. Takes a genre name as argument.
model: sonnet
effort: medium
argument-hint: <genre-name e.g. "Math Rock" or "Nu-Metal">
allowed-tools:
  - Read
  - Edit
  - Write
  - Glob
  - WebSearch
---
# 流派创建器

## 你的任务

在 `${CLAUDE_PLUGIN_ROOT}/genres/` 中为 bitwize-music 流派库创建新的流派 README.md。

**输入**：$ARGUMENTS（流派名称，例如“数学摇滚”“新金属”“城市流行”）

## 工作流程

1. **生成 slug**：转换为小写并使用连字符连接（例如，“数学摇滚” → `math-rock`）
2. **检查是否存在**：如果 `genres/{slug}/README.md` 已存在 → 中止并通知用户
3. **检查 INDEX.md**：读取 `genres/INDEX.md`，确认该流派尚未列出
4. **调研**：使用 WebSearch 核实关键事实（起源年份、先驱艺人、里程碑专辑）——不要猜测日期或专辑名称
5. **阅读 1-2 个现有流派文件**，以参考其结构（例如 `genres/hip-hop/README.md`、`genres/phonk/README.md`）
6. **创建目录**：`genres/{slug}/`
7. **编写 README.md**，严格遵循下方模板
8. **更新 INDEX.md**：将流派添加到分类表、按字母排序的列表，以及所有适用的快速参考表（速度、能量、配器、人声、情绪、年代）
9. **更新母带预设**：将新流派添加到以下两个母带预设文件中：
   - `tools/mastering/genre-presets.yaml` —— 添加 YAML 条目，其中包含适合该流派的 `target_lufs`、`cut_highmid`、`cut_highs` 值。将其放入正确的分类区段，或创建新的分类区段。
   - `skills/mastering-engineer/genre-presets.md` —— 在 `## Genre Presets` 下添加新的 `### Genre Name` 区段，其中包括 LUFS 目标值、动态、EQ 重点、MCP 命令和特征。
10. **不要创建** `artists/` 子目录——该目录会在编写艺人深度解析时单独创建

## README.md 模板

文件直接以 `# Genre Name` 开头——不使用 YAML frontmatter。

始终严格使用以下章节顺序：

```
# {Genre Name}

## Genre Overview
[3 paragraphs — see rules below]

## Characteristics
[6 bullet fields — see rules below]

## Lyric Conventions
[6 bullet fields — see rules below]

## Subgenres & Styles
[Table — see rules below]

## Artists
[Table — see rules below]

## Suno Prompt Keywords
[Code block — see rules below]

## Reference Tracks
[List — see rules below]
```

### 章节规则

**## Genre Overview** —— 3 段正文（不使用项目符号）：
- 第 1 段：起源、文化根源、先驱者，并包含具体姓名和年份
- 第 2 段：数十年间的演变、关键时刻、主流突破、地域变体
- 第 3 段：当前状况、对其他流派的影响、现代场景
- 风格：具有百科全书式的严谨，同时保持生动。使用具体姓名、年份和专辑。不要使用含糊的说法。

**## Characteristics** —— 项目符号列表，且必须恰好包含以下 6 个字段：
- **Instrumentation**：典型乐器；在相关情况下列出具体型号或品牌
- **Vocals**：演唱风格、人声处理、表达方式
- **Production**：制作技术、混音美学、声音特征
- **Energy/Mood**：情绪范围、情感跨度
- **Structure**：歌曲形式、典型时长、结构上的特殊之处
- **Tempo**：各子流派的 BPM 范围、节奏感觉（半拍、摇摆、平直等）

**## Lyric Conventions** —— 项目符号列表，且必须恰好包含以下 6 个字段：
- **Default rhyme scheme**：典型押韵格式及其简写（AABB、ABAB、XAXA 等）
- **Rhyme quality**：预期的押韵质量（多音节押韵、近似押韵、行内押韵等）
- **Verse structure**：行数、小节结构
- **Key rule**：该流派歌词最重要的一条规则
- **Avoid**：该流派中不应采用的做法
- **Density/pacing (Suno)**：格式：`Default **X lines/verse** at Y BPM. [Context]. Topics: Z/verse.`

**## 子流派与风格** — Markdown 表格：

| 风格 | 描述 | 参考艺人 |
|-------|-------------|-------------------|

- 6-12 个子流派
- 描述：用 2-3 句话说明具体的音乐特征，而非仅使用形容词
- 参考艺人：每个子流派列出 3-4 位

**## 艺人** — Markdown 表格：

| 艺人 | 重要专辑 | 活跃时期 | 风格重点 |
|--------|-----------|-----|-------------|

- 10-20 位艺人，兼顾先驱者、巅峰时期代表和当代艺人
- 专辑名使用斜体（*Album Name*）
- 如果存在深度解析文件：在「风格重点」中追加一个指向该艺人文件的 `Deep Dive` 链接

**## Suno 提示词关键词** — 使用围栏代码块，其中以逗号分隔关键词，并按主题分行组织：
- 流派/子流派标签
- 乐器关键词
- 制作关键词
- 情绪/氛围关键词
- 人声关键词
- 速度/节奏关键词
- 年代/美学关键词
- 所有关键词均使用英文。仅使用 Suno 确实能够理解的术语。

**## 参考曲目** — 10-15 个条目：
- 格式：`- **Artist - "Track Title"** — [Description]`
- 描述：使用 2-3 句话。说明这首曲目的哪些特征使其成为该流派的参考标杆。指出具体的音乐元素。解释其历史/文化意义。
- 按时间顺序覆盖从奠基曲目到现代代表作的不同阶段

## 重要说明

1. **事实准确性**：所有年份、专辑名称和艺人名称都必须准确无误。宁可省略，也不要猜测。使用 WebSearch 进行核实。
2. **禁止 AI 陈词滥调**：禁用以下短语："tapestry of sound"、"sonic landscape"、"testament to"、"rich tapestry"、"sonic journey"、"pushing boundaries"、"transcends genre"。使用直接、具体的表述。
3. **以 Suno 为重点**：「歌词惯例」和「Suno 关键词」是最重要的部分——它们会直接影响音乐生成质量。
4. **子流派去重**：如果某个子流派已经拥有独立的流派目录（例如 Trap 已作为独立流派存在），则引用该目录，而不是重复内容。
5. **语言**：英文（整个流派系统均使用英文）
6. **不得有空章节**：每个章节都必须包含实质性内容。如果对某个章节不确定，请先进行研究。