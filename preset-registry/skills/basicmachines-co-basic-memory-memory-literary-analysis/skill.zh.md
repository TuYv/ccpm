---
name: memory-literary-analysis
description: "Analyze a complete literary work into a structured Basic Memory knowledge graph. Covers schema design, entity seeding, chapter-by-chapter processing, cross-referencing, validation, and graph exploration."
---
# Memory 文学分析

将一部完整的文学作品转换为结构化知识图谱。人物、主题、章节、地点、象征和文学手法都会成为相互关联的笔记 — 可搜索、可验证、可遍历。

## 使用场景

- 端到端分析小说、戏剧、诗歌或非虚构类书籍
- 为文学文本构建教学或学习资源
- 创建读书会伴读知识库
- 需要结构化细读的研究项目
- 在较大规模下对 Basic Memory 进行压力测试（约 200+ 条笔记，1000+ 条关系）

## 流程概览

```
Phase 0: Setup         → project, schemas, directory structure
Phase 1: Seed          → stub notes for known major entities
Phase 2: Process       → chapter-by-chapter notes in batches
Phase 3: Cross-ref     → enrich arcs, add parallels, write analysis
Phase 4: Validate      → schema checks, drift detection, consistency
Phase 5: Explore       → traverse the graph, write synthesis notes
```

## 工具

写入始终通过 `write_note` 和 `edit_note` 完成。对于*读取* — 这是长篇分析中占据大部分工作的部分 — 在可用时优先使用 POSIX 读取动词（针对 MCP 工具使用 `enable_posix_tools`；`bm` CLI 动词始终可用）：

| 需求 | 使用 | 替代方案 |
|------|-----|-----------|
| 长笔记中的某个章节 | `cat <note> --section Observations` | 读取整篇笔记 |
| 源文本中的某个行范围 | `cat <source>.txt --lines 4200-4890` | 将整本书拉入上下文 |
| 匹配 frontmatter 的笔记 | `find --meta status=active` | 读取笔记来检查字段 |
| 多条笔记中的字段 | `find --meta ... --fields pov,setting` | 每条笔记读取一次 |
| 某项内容所在的位置 | `ls`、`tree`、`find --name '*.md'` | 列出所有内容 |

在包含 100 多个章节的运行中，有两条规则最为重要：

- **绝不要读取笔记来检查字段。** 这正是 `--meta` 谓词和 `--fields`
  投影的用途 — 一次调用即可回答问题，而不必付出逐条读取的成本。
- **绝不要为了获取文件中的某一部分而将整个文件拉入上下文。** 章节和行范围会切分
  *输出*：完整笔记仍会被获取，然后在返回前截取。它们节省的是上下文，而不是 I/O — 长章节或完整源文本消耗的 token 数量取决于相关部分，而不是整个文件。

这两条规则叠加后效果显著。在实际运行中，谓词查询将 28 次调用的扫描替换为单次调用；对于 138 个章节而言，这种差异正是整个运行的关键。

在编写查询之前，需要了解三个容易踩坑的地方。前两个问题会**悄无声息地**失败 — 返回错误答案、退出码为 0、没有任何警告 — 所以应在这里掌握它们，而不是等到你以为已经审计过的图谱出现问题时才了解：

- **`--meta` 匹配区分大小写，且存储值始终为 snake_case。** `note_type`
  是 frontmatter `type:` 键的别名，使用 SQL 的 `=` 进行比较。`write_note` 在写入前会通过
  `to_snake_case` 规范化 `note_type`，因此，以 `note_type="Chapter"` 撰写的笔记会存储为
  `type: chapter` — 你撰写时使用的大小写形式*不会*是磁盘上的大小写形式。查询时使用 snake_case
  形式：`--meta 'note_type=chapter'`。大写形式会返回零行，且退出码为 0。结果行显示的值就是应当用于查询的值。
- **`find` 会分页，默认页面大小为 10。** 任何答案是“所有 N 个章节”的查询都需要使用
  `--page-size 200`（最大值）— 参见[覆盖检查](#coverage-checks)。
- **`--name` 不能与 `--meta` 组合使用。** 元数据搜索不支持文件名 glob。请改用位置路径限定
  `--meta` 查询：`find /characters --meta
  'note_type=character'`。该路径会基于笔记所索引的*文件路径*，在目录边界上进行匹配 — 也就是笔记实际所在的位置，而不是其 permalink；一旦笔记在 frontmatter 中固定了 `permalink:` 或被移动，permalink 就不再跟随文件路径镜像。因此，`/characters` 会匹配所有归档在
  `characters/` 下的内容（包括 `characters/major/`），但绝不会匹配 `characters-cut/`。

如果 POSIX 动词不可用，下面的每个步骤仍可使用 `search_notes`、`read_note` 和 `list_directory` 完成，只是成本更高。

## 阶段 0：设置

### 创建项目

```python
create_memory_project(name="<work-name>", path="~/basic-memory/<work-name>")
```

使用作品标题对应的 kebab-case slug（例如：`great-gatsby`、`hamlet`、`beloved`）。

### 定义架构

将 6 个架构笔记写入 `schema/`。每个架构定义实体类型的字段、观察类别和关系类型。根据作品调整字段，下面的架构是起始模板，而非严格模板。

#### 角色架构

```python
write_note(
  title="Character",
  directory="schema",
  note_type="schema",
  metadata={
    "entity": "Character",
    "version": 1,
    "schema": {
      "role(enum)": "[protagonist, antagonist, supporting, minor], character's narrative role",
      "description": "string, brief character description",
      "first_appearance?": "string, chapter or scene of first appearance",
      "status?(enum)": "[alive, dead, unknown, transformed], character status at end of work"
    },
    "settings": {"validation": "warn"}
  },
  content="""# Character

Schema for character entity notes.

## Observations
- [convention] Major characters in characters/major/, minor in characters/minor/
- [convention] Observation categories: trait, motivation, arc, quote, appearance, relationship, symbolism, fate
- [convention] Relations: appears_in, contrasts_with, allied_with, commands, symbolizes, associated_with"""
)
```

根据需要添加特定于作品的字段，例如军事小说中的 `rank`、家族史诗中的 `house`、奇幻作品中的 `species`。

#### 主题架构

```python
write_note(
  title="Theme",
  directory="schema",
  note_type="schema",
  metadata={
    "entity": "Theme",
    "version": 1,
    "schema": {
      "description": "string, what this theme explores",
      "prevalence(enum)": "[major, minor], how central to the work",
      "first_introduced?": "string, where theme first appears"
    },
    "settings": {"validation": "warn"}
  },
  content="""# Theme

Schema for thematic analysis notes.

## Observations
- [convention] Observation categories: definition, manifestation, evolution, counterpoint, quote, interpretation
- [convention] Relations: embodied_by, contrasts_with, reinforced_by, explored_in, expressed_through"""
)
```

#### 章节架构

```python
write_note(
  title="Chapter",
  directory="schema",
  note_type="schema",
  metadata={
    "entity": "Chapter",
    "version": 1,
    "schema": {
      "chapter_number": "integer, sequential chapter number",
      "pov?": "string, point-of-view character or narrator mode",
      "setting?": "string, primary location",
      "narrative_mode?(enum)": "[dramatic, expository, reflective, epistolary, mixed], chapter's primary mode"
    },
    "settings": {"validation": "warn"}
  },
  content="""# Chapter

Schema for chapter-level analysis notes.

## Observations
- [convention] Chapters stored in chapters/ directory
- [convention] Observation categories: summary, event, tone, technique, quote, significance, foreshadowing
- [convention] Relations: features, set_in, explores, contains, employs, follows, precedes, parallels"""
)
```

#### Location Schema

```python
write_note(
  title="Location",
  directory="schema",
  note_type="schema",
  metadata={
    "entity": "Location",
    "version": 1,
    "schema": {
      "description": "string, what this place is",
      "location_type(enum)": "[city, building, landscape, body_of_water, region, fictional, vehicle], type of place",
      "real_or_fictional(enum)": "[real, fictional, both], whether the place exists"
    },
    "settings": {"validation": "warn"}
  },
  content="""# Location

Schema for location and setting notes.

## Observations
- [convention] Observation categories: description, atmosphere, symbolism, significance, geography
- [convention] Relations: setting_for, associated_with, symbolizes, contains, part_of"""
)
```

#### Symbol Schema

```python
write_note(
  title="Symbol",
  directory="schema",
  note_type="schema",
  metadata={
    "entity": "Symbol",
    "version": 1,
    "schema": {
      "description": "string, what the symbol is literally",
      "symbol_type(enum)": "[object, animal, color, action, natural_phenomenon, body_part], category of symbol",
      "primary_meaning": "string, most common interpretation"
    },
    "settings": {"validation": "warn"}
  },
  content="""# Symbol

Schema for symbolic element notes.

## Observations
- [convention] Observation categories: meaning, appearance, ambiguity, interpretation, quote, evolution
- [convention] Relations: represents, associated_with, appears_in, contrasts_with, located_at"""
)
```

#### LiteraryDevice Schema

```python
write_note(
  title="LiteraryDevice",
  directory="schema",
  note_type="schema",
  metadata={
    "entity": "LiteraryDevice",
    "version": 1,
    "schema": {
      "description": "string, what the device is",
      "device_type(enum)": "[rhetorical, structural, figurative, narrative, dramatic], category",
      "frequency(enum)": "[pervasive, frequent, occasional, rare], how often used"
    },
    "settings": {"validation": "warn"}
  },
  content="""# LiteraryDevice

Schema for literary technique and device notes.

## Observations
- [convention] Observation categories: definition, usage, effect, example, significance
- [convention] Relations: used_in, characterizes, expresses, related_to"""
)
```

### 目录结构

```
<project>/
  <work>.txt         # the source text, verbatim (see Phase 2)
  schema/            # 6 schema definitions
  chapters/          # one note per chapter/section + prologue/epilogue
  characters/
    major/           # protagonist, antagonist, key supporting
    minor/           # named characters with limited roles
  themes/            # thematic analysis notes
  locations/         # settings and places
  symbols/           # symbolic elements
  literary-devices/  # techniques and devices
  analysis/          # cross-cutting synthesis
  tasks/             # processing tracker
```

## 阶段 1：初始化实体

在处理章节之前，为主要实体创建存根笔记，以便 `[[wiki-links]]` 从一开始就能解析。

### 主要角色

为每个主要角色创建一个包含已知元数据的存根：

```python
write_note(
  title="<Character Name>",
  directory="characters/major",
  note_type="Character",
  tags=["character", "major", "<role>"],
  metadata={"role": "<role>", "description": "<brief description>"},
  content="""# <Character Name>

## Observations
- [role] <Character's role in the work>
- [appearance] <Key physical description>

## Relations
- associated_with [[<Related Character>]]
- appears_in [[<Key Location>]]"""
)
```

### 初始清单

在开始阅读之前，先确定作品中的主要实体。一个不错的起始清单：

| 类型 | 典型数量 | 应包含的内容 |
|------|--------------|-----------------|
| 主要角色 | 8-20 | 主角、反派、关键配角 |
| 主题 | 5-12 | 作品探讨的核心议题 |
| 地点 | 4-10 | 主要场景、具有象征意义的地点 |
| 象征物 | 4-10 | 具有多层含义的反复出现的物体、意象或母题 |

存根不需要完整，它们会提供 `[[wiki-link]]` 目标，并在章节处理过程中逐步丰富。

## 阶段 2：章节处理

### 源文本准备

获取完整文本并确定章节/分节边界。对于公版作品，Project Gutenberg 是一个不错的来源。对于受版权保护的作品，应使用实体版或获得授权的数字版本。

**将源文本放在项目目录中，格式为 `.txt`，并只对其建立一次索引。** `bm cat`
解析的是*笔记标识符*，而不是文件系统路径——它只能访问项目索引已经记录过的文件。执行一次索引操作后，原始文本会获得一个实体行，此时按行号范围切片即可：

```bash
cp ~/Downloads/moby-dick.txt ~/basic-memory/moby-dick/moby-dick.txt
bm reindex --search -p moby-dick          # one pass; the .txt becomes readable
```

有两个约束使这种布局成为正确的做法，并且都值得遵守：

- **保留为 `.txt`，不要转换为 `.md`。** Basic Memory 会向 markdown 笔记中注入 frontmatter，这会使每个行号相对于原始文件因该代码块的高度而发生偏移——基于原始文件构建的偏移映射随后会在不知不觉中出错。`.txt` 会原样存储，因此其行号与磁盘上的文件保持 1:1 对应。
- **将文件保留在项目内。** 磁盘其他位置的源文本不是实体，`bm cat` 会返回 `Error: Entity not found`。如果必须将其留在项目外，请对源文本放弃 BM verbs，改用普通 shell（`sed -n '4200,4890p' <path>`）——笔记仍然使用 BM verbs，只有原始源文本回退到 shell。

**然后在处理前构建一次章节偏移映射。** 扫描文本中的章节标题并记录每章的行范围，然后按范围读取章节，而不是将整本书反复读入上下文：

```bash
grep -n '^CHAPTER ' ~/basic-memory/moby-dick/moby-dick.txt   # heading -> line number
bm cat moby-dick/moby-dick.txt --lines 4200-4890 --plain   # one chapter, not the whole text
```

这里的 `grep -n` 是针对文件系统路径运行的 shell grep（这是构建映射的步骤，因此需要该文件）。随后，`bm cat` 接受*笔记标识符*，并准确返回该切片以及 `lines 4200-4890 of N` 页脚。**请将标识符明确写成项目限定形式：**
`<work>/<work>.txt`。直接使用 `moby-dick.txt` 会失败并显示 `names a project, not a note`，因为前缀检查会去掉扩展名，而文件名主体随后会等于项目名称——这种布局必然会触发该问题（#1458）。`bm head moby-dick/moby-dick.txt -n 40` 是快速查看标题格式的方式，之后再编写 grep 模式。

将映射存储在项目中（可以是笔记或小型 JSON 文件），这样后续批次以及上下文压缩后的恢复运行就不必重新发现它。在长时间工作中，这是整个流程中节省上下文最多的单项措施。

### 分批策略

每批处理约 10 个章节，以平衡分析深度与进展速度。按叙事弧或主题重点分组：

| 批次 | 典型内容 |
|-------|----------|
| 1 | 开篇：环境设定、人物介绍、世界构建 |
| 2-3 | 上升行动：冲突确立、关系发展 |
| 4-6 | 中段：复杂化、转折点、主题深化 |
| 7-8 | 接近高潮：升级、揭示、危机 |
| 最终批次 | 高潮、结局、尾声 |

根据章节长度和内容密度调整批次大小。简短且以动作为主的章节可以合并更多；篇幅较长且哲学意味浓厚的章节可能需要更小的批次。

### 每章工作流程

对于每个章节：

**1. 仔细阅读章节。** 根据偏移映射读取章节的行范围（`bm cat <source>.txt --lines <start>-<end>`），不要读取整个文件。阅读实际文本，不要凭记忆或摘要开展工作；文本证据才是全部意义所在。

**2. 创建章节笔记：**

```python
write_note(
  title="Chapter <N> - <Title>",
  directory="chapters",
  note_type="Chapter",
  tags=["chapter", "<arc-phase>"],
  metadata={
    "chapter_number": <N>,
    "pov": "<narrator or POV character>",
    "setting": "<primary location>",
    "narrative_mode": "<mode>"
  },
  content="""# Chapter <N> - <Title>

## Observations
- [summary] <1-2 sentence synopsis>
- [event] <Key plot events>
- [tone] <Emotional and stylistic atmosphere>
- [technique] <Notable narrative techniques>
- [quote] "<Significant passage>"
- [significance] <Why this chapter matters to the whole>
- [foreshadowing] <Hints at future events>

## Relations
- features [[<Character>]]
- set_in [[<Location>]]
- explores [[<Theme>]]
- contains [[<Symbol>]]
- employs [[<Literary Device>]]
- follows [[Chapter <N-1> - <Previous Title>]]
- precedes [[Chapter <N+1> - <Next Title>]]"""
)
```

**3. 丰富相关实体：**

```python
edit_note(
  identifier="characters/major/<character-slug>",
  operation="append",
  heading="Observations",
  content="""- [arc] Ch.<N>: <What happens to this character>
- [quote] "<Attributed quote>" (Ch.<N>)"""
)
```

**3b. 完成第一批后，检查丰富内容落在了哪里。** 在使用此流程构建的 206 笔记图谱中，每个角色使用 `heading="Observations"` 的 `append` 都被放到了 `## Relations` 下，而前置的正文内容则落在 H1 标题上方，因此对每个主要角色执行 `cat <note> --section Observations` 时，返回的都是初始占位内容。只需进行一次检查即可发现问题：

```bash
bm cat characters/major/<slug> --section Observations --project <work>   # the new lines, or the stub?
bm cat characters/major/<slug> --section Relations --project <work>      # the lines that should not be here
```

在第二批之前修正标题层级规范；章节读取的准确性取决于标题是否正确。

**4. 跟踪进度**：使用 memory-tasks 技能创建一个能够在上下文压缩后继续存在的处理任务。

### 每章需要捕捉的内容

| 类别 | 需要查找的内容 |
|----------|-------------|
| `[summary]` | 1-2 句的章节概要 |
| `[event]` | 关键情节事件（行动、揭示、到达） |
| `[tone]` | 情感和文体氛围 |
| `[technique]` | 叙事创新（视角转换、结构实验、类型融合） |
| `[quote]` | 令人难忘或具有重要主题意义的段落 |
| `[significance]` | 本章对全书的重要意义 |
| `[foreshadowing]` | 对未来事件的暗示 |

### 每章的实体丰富

处理每一章时，将观察结果追加到相关实体：
- **人物**：`[arc]` 时刻、新的 `[trait]` 揭示、`[quote]` 归属
- **主题**：本章中的 `[manifestation]`、`[evolution]` 变化
- **象征**：带有上下文的 `[appearance]`、新的 `[interpretation]` 角度
- **地点**：所描述的 `[atmosphere]`、场景中的 `[significance]`
- **文学手法**：本章中的 `[example]`

### 添加散文式解读

完成结构化观察后，考虑向主要实体笔记中添加解读性散文。使用 `edit_note(operation="prepend")`，在 Observations 部分之前插入 2-4 段批评性文章。这些散文应该：

- 为人物、主题或象征提出一种解读，而不仅仅是进行描述
- 将该实体与作品更广泛的关注点以及文学传统联系起来
- 清楚标注主观观点（例如“在我看来……”或“我认为……”）
- 以文本证据为依据，并引用章节编号

散文能够为单纯的结构化观察增添解读层面的质感。

## 第三阶段：交叉引用

处理完所有章节后：

### 查找需要丰富的内容

不要重新阅读每条笔记来判断哪些内容单薄。应通过查询来完成：

```bash
bm find --meta 'note_type=chapter' --fields chapter_number,pov,setting --page-size 200
bm find --meta 'note_type=character' --fields role,status --page-size 200   # who is still a stub
bm find --meta 'chapter_number>100' --fields pov --page-size 200           # late-book POV drift
```

笔记从未设置的字段会以空单元格返回（在 `--json` 下为 `null`），因此包含空值的行就是待处理队列。这样一来，“审计图谱”就从读取每条笔记，变成了针对每个问题执行一次调用。

注意小写的 `chapter`/`character`：`write_note` 会在写入笔记之前将 `note_type` 转换为 snake case，因此无论 Phase 0 schema 如何定义，这才是磁盘上的值。必须精确匹配；使用首字母大写的写法会返回零行并以 0 退出。`--page-size 200` 也不是装饰：如果不加它，这些命令只会返回前 10 行，待处理队列看起来就只有十项。

### 人物弧光

对于每个主要人物，撰写一条完整的 `[arc]` 总结观察，涵盖其贯穿全书的发展轨迹。

### 主题演变

对于每个主题，添加 `[evolution]` 观察，追踪其从引入到解决的发展过程。

### 章节平行关系
在结构相似的章节之间添加 `parallels` 和 `contrasts_with` 关系（例如镜像场景、重复出现的场景、主题回响）。

### 分析笔记
在 `analysis/` 中创建综合笔记：

```python
write_note(
  title="Narrative Structure",
  directory="analysis",
  note_type="note",
  tags=["analysis", "structure"],
  content="""# Narrative Structure

Analysis of the work's narrative architecture.

## Observations
- [structure] <Overall arc description>
- [technique] <Key narrative strategies>
...

## Relations
- analyzes [[<Protagonist>]]
- analyzes [[<Key Character>]]
- explores [[<Central Theme>]]
..."""
)
```

推荐的分析笔记：
- **Narrative Structure** — 整体架构与节奏
- **Work Overview** — 完整作品的综合概述（摘要、论点、影响）
- **Critical Reception** — 历史与当代的解读

### 发现新出现的实体
在处理章节期间，新的次要角色、地点和象征会逐渐出现。为任何出现在 3 个或更多章节中，或具有主题重要性的实体创建笔记。

## 第 4 阶段：验证

### Schema 验证

```python
# Validate each entity type
schema_validate(noteType="Character")
schema_validate(noteType="Theme")
schema_validate(noteType="Chapter")
schema_validate(noteType="Location")
schema_validate(noteType="Symbol")
schema_validate(noteType="LiteraryDevice")
```

### 漂移检测

```python
schema_diff(noteType="Character")
# ... for each type
```

修复发现的问题 — 常见修复方式：
- 缺少必需的观察类别 → 使用 `edit_note` 添加
- 枚举值超出允许范围 → 更正元数据
- 笔记中存在但 schema 中没有的字段 → 如果合理，将其作为可选字段添加到 schema

### 覆盖率检查

Schema 验证可以证明笔记符合其结构。这些检查可以证明图谱是*完整的*：

```bash
bm find --meta 'note_type=chapter' --fields chapter_number --page-size 200   # every chapter present?
bm find --meta 'note_type=chapter' --fields pov,setting --page-size 200      # missing context?
bm find /characters --meta 'note_type=character' --fields role --page-size 200  # inventory vs. seed list
```

**分页查询不是覆盖率检查。** `bm find` 默认为
`--page-size 10`，因此第一条查询的不带大小参数形式会“证明”一部包含 138 章的作品只有 10
章。200 是最大页面大小；超过该值后，使用 `--page 2`、`--page 3`、……进行迭代。
使用位置路径限定 `--meta` 查询（`/characters`），永远不要使用 `--name` — 这两个
选项互斥，因为元数据搜索没有文件名 glob。位置路径会按照索引中的*文件路径*限定范围，并在目录边界上进行匹配：
`/characters` 可以匹配 `characters/major/ahab.md`，但永远不会匹配 `characters-cut/`。
它不是永久链接匹配，因此即使笔记通过自身的 `permalink:` 固定了链接，仍然会在其文件所在位置被找到。

从页脚读取数量，不要根据可见行数读取。在终端中，每个 `find`
结果都会报告 `page 1 • total 138`，并在页面截断答案时追加 `• more available (--page)` — 无论可见行显示什么，该后缀出现都表示检查*失败*。
**页脚是 TTY 功能。** 不带 `--plain` 的管道输出是 JSON，其中包含 `total` 和 `has_more`；`--plain` 只打印行，不打印其他内容（#1457）。代理应从 `--json` 中读取 `has_more`，而不是查找不会出现的页脚。

对于序列缺口这一类单靠计数无法发现的失败，请从携带 `total`、`total_is_exact` 和 `has_more` 的 `--json` 中获取数字：

```bash
expected=138; page=1; rows='[]'
while :; do
  resp=$(bm find --meta 'note_type=chapter' --fields chapter_number \
           --page-size 200 --page $page --project <work> --json)
  rows=$(jq -n --argjson acc "$rows" --argjson r "$resp" \
           '$acc + [$r.results[] | {title, n: .fields.chapter_number}]')
  [ "$(jq -r '.has_more' <<<"$resp")" = "true" ] || break
  page=$((page + 1))
done
jq -n --argjson rows "$rows" --argjson expected "$expected" '
  ([$rows[] | select(.n != null and (.n | tostring | test("^[0-9]+$"))) | .n | tonumber]) as $n
  | { total:        ($rows | length),
      unnumbered:   [$rows[] | select(.n == null or (.n | tostring | test("^[0-9]+$") | not))
                             | .title],
      missing:      ([range(1; $expected + 1)] - $n),
      duplicates:   ($n | group_by(.) | map(select(length > 1) | .[0])),
      out_of_range: ($n | map(select(. < 1 or . > $expected)) | unique) }'
```

这个循环不是形式主义。`--page-size` 的上限是 200，因此单次调用无法清点超过 200 个章节的作品，而再次使用 `--page 2` 运行会*替换*数字，而不是累积数字；对于一个完整的语料库，这会错误地报告章节 1-200 缺失。持续遍历，直到 `has_more` 为 false，然后检查并集。

`--fields` 会将每个值作为字符串返回——`chapter_number: 63` 返回的是 `"63"`（#1456）——而 `--meta` 谓词则进行数值比较。上面的 `tostring | test(...) | tonumber` 处理是关键逻辑，不是防御性处理；删除它后检查就会失效。

将作品的**实际**章节数作为 `$expected` 传入——根据找到的最大编号推导范围，会让不完整的图谱通过检查。对于 138 行中编号为 1..137、另有一个重复编号的情况，基于最大值推导的检查会报告 `missing: []`，但实际上确实缺少一个章节：重复项使计数保持正确，而缺失的末尾章节移动了目标范围。只有在合并后的所有页面中同时满足 `unnumbered: []`、`missing: []`、`duplicates: []` 和 **`out_of_range: []`**，检查才算通过。

`unnumbered` 也不是装饰项。一个从未获得 `chapter_number` 的 `chapter` 笔记会以 `null` 返回，而直接将其传给 `tonumber` 会使整个流水线因 `null cannot be parsed as a number` 而中止——因此检查会在它正要查找的 malformed inventory 上崩溃。先进行分区，就能将其转换为一个有名称的行。

`out_of_range` 并非假设情况：被标记为 `chapter` 的序言或尾声可能落在 0 或 `$expected + 1`，而没有这个键时，报告看起来会很干净——每个预期编号都存在，没有重复编号——但清单中包含一个编号体系未计入的笔记。请将正文前后的附加内容标记为独立的笔记类型，或者有意扩大 `$expected`。

批次处理中最常见、也最容易被肉眼漏掉的失败，是中间出现缺口；第二常见的是章节编号重复，而它会掩盖第一个问题。

### 关系一致性
抽查双向关系：如果 Chapter X `features [[Character]]`，Character 是否有引用 Chapter X 的 observations？修复缺失的关系。

孤立项是这项检查的另一半：一个没有入向或出向关系的笔记，要么确实是独立存在的，要么就是从未被链接回图谱：

```bash
bm orphans          # entities with no relations in the graph
```

`orphans` 会查找没有关系的笔记。它不会查找解析不到任何目标的 `[[target]]`，也就是拼写错误或已重命名的实体名称。在这张图谱中，`[[Moby Dick (White Whale)]]` 在十个章节中都无法解析，而符号笔记实际使用了另一个标题。使用 `bm tool build-context memory://chapters/<slug> --depth 1
--project <work> --json` 检查某个章节的链接，查找 `to_entity_id` 为 `null` 的关系；修正拼写或添加别名，然后重新运行该章节。

图谱质量取决于关系*密度*，而不是笔记数量。添加笔记却留下孤立项的处理，会让图谱变得更差。

## 阶段 5：探索图谱

图谱完整后，遍历它，寻找逐章处理无法发现的内容：

```bash
bm grep -F "features [[" --page-size 200 --project <work> --json   # every chapter's cast, one call
bm find --meta 'note_type=theme' --fields prevalence --page-size 200  # thematic weight
bm grep -F "doubloon" --page-size 100 --project <work>                # every mention of a symbol
```

“哪些角色共同出现在最多章节中”可以先读取第一行，再对每一行的 `content` 就 `features [[...]]` 进行本地解析；在一个包含 138 个章节的图谱中，一次调用就替代了 136 次读取。此处不要使用 `bm tool build-context 'memory://characters/major/*'`：通配符上下文在所有主实体之间最多限制为 100 行相关记录，并且每个索引 observation 只返回一行主实体记录，因此它既不会枚举角色阵容，也不会遍历关系网络。对于下面的另一个问题，针对*单个*笔记使用 `build-context` 才是正确的工具。
`build-context` 将其 URL 作为位置参数传入，不存在 `--url` 选项。

`grep` 默认使用语义排序，并返回 10 条记录，这适合回答“这是什么内容？”却会悄悄截断“它出现在哪里？”这个问题：一个符号出现在 40 个章节中时，返回结果只有 10 个。追踪符号时，传入 `-F` 进行字面匹配，并提高 `--page-size`；你要查找的含义通常位于较后面的匹配项中，而默认设置会将它们丢弃。

关于 `grep` 返回行，还有两个事实需要注意。匹配不区分大小写，并且以笔记为粒度：命中的是一篇笔记，而不是某一行；同时不存在 `-n` 或上下文选项。此外，每一行的 `content` 都是将笔记正文截断至 4000 个字符后的内容，且没有标记（#1455），因此较长笔记的末尾部分会在基于 grep 的扫描中静默缺失；在这张图谱中，缺失的是最后一个章节的 `follows`/`precedes` 关系。当解析依赖笔记末尾内容时，请使用 `cat` 读取该笔记。

`--page-size` 只会提高上限，并不会移除上限。长篇作品中的某个符号可能连 100 条结果都超过，因此请检查最后一页是否已满，并依次遍历 `--page 2`、`--page 3`，直到页面未满为止。被截断的符号搜索与未分页的 `find` 会以同样静默的方式失败：返回一个看似合理的答案，退出码为 0，却没有任何迹象表明末尾内容缺失。

并且，`grep` 搜索的是**你的笔记，而不是源文本**。`<work>.txt` 被索引为一个实体，
但其正文不在可搜索文本中，因此，从未记录进笔记的出现位置无法检索到——已验证：一个仅存在于源文本中的词会返回 `total: 0`，而同时存在于两者中的词只会返回笔记。这回答的是“我在哪里写过关于这枚金币的内容”，而不是“这枚金币在书中出现在哪里”。对于后者，请直接搜索文件本身，并使用[章节偏移映射](#source-text-preparation)将命中位置转换为章节。

遍历是回答二阶问题的方式——哪些角色共同出现的章节最多，哪些主题在终幕汇聚，某个象征的含义在哪里发生转变。将你的发现记录为 `analysis/` 笔记；这些综合分析正是构建图谱带来的回报。

## 适配其他体裁

该流水线适用于任何文学文本。请根据体裁调整模式：

| 体裁 | 模式调整 |
|-------|----------------|
| **小说** | 基础模式可直接使用；按需添加体裁特定的 Character 字段 |
| **戏剧** | 添加 `Act` 和 `Scene` 模式；Character 增加 `speaking_lines` 字段 |
| **诗歌集** | 用 `Poem` 替换 Chapter；添加 `form`、`meter`、`rhyme_scheme` 字段 |
| **非虚构作品** | 用 `Section` 替换 Chapter；添加 `Argument`、`Evidence` 模式 |
| **短篇小说集** | 添加包含 `narrator`、`setting`、`word_count` 的 `Story` 模式 |
| **史诗/神话** | 添加 `Deity`、`Prophecy` 模式；Location 增加 `mythological_significance` |
| **回忆录** | Character 模式增加 `relationship_to_narrator`；添加 `Memory` 模式 |

### 扩展指引

| 作品长度 | 批次大小 | 预计笔记数 |
|-------------|-----------|----------------|
| 中篇小说（约 40K 词） | 5-10 章 | 约 50-80 篇 |
| 小说（约 80K 词） | 8-12 章 | 约 100-150 篇 |
| 长篇小说（约 200K+ 词） | 10-15 章 | 约 200-300 篇 |
| 系列作品（多卷） | 每次处理 1 卷 | 每卷约 200+ 篇 |

## 相关技能

- **memory-schema** — 模式创建、验证与漂移检测
- **memory-tasks** — 跨上下文压缩跟踪章节处理进度
- **memory-notes** — 笔记编写模式、观察分类、wiki-links
- **memory-ingest** — 将外部输入处理为结构化实体
- **memory-metadata-search** — 按前置元数据字段查询笔记
- **memory-lifecycle** — 归档已完成的分析阶段

## 指南

- **处理前先播种。** 先创建实体存根，以便在章节处理期间 wiki-links 能立即解析。
- **分批以保持清醒。** 每次处理约 10 章可兼顾深度与进度。使用 Task 笔记跟踪进度。
- **阅读源文本。** 不要依赖记忆或摘要。在创建笔记前，先阅读（或重读）每个批次的实际文本。文本证据就是一切。
- **缩小阅读范围。** 将源文本以 `.txt` 格式保存在项目中，索引一次，构建一次章节偏移映射，然后按行范围阅读章节、按章节阅读笔记。对于长篇作品，整个文件进入上下文是流水线中最容易避免的最大成本。
- **查询，不要扫描。** 当你需要了解哪些笔记具有某字段时，请使用 `--meta` 谓词和 `--fields` 投影查询。为了检查前置元数据而阅读笔记，正是这条流水线在大规模下要避免的错误。这些查询会悄无声息地产生误导的两种情况：`--meta` 会针对模式所编写的前置元数据 `type:` 区分大小写，并且若不传入 `--page-size`，`find` 只返回 10 行。
- **观察是你的索引。** 知识图谱的价值来自分类观察。请慷慨地使用分类，并让内容保持具体。
- **关系是你的网络。** 每章都应链接到角色、主题、地点和手法。每个实体也都应反向链接到其出现的章节。
- **迭代充实。** 实体笔记会随着每一章变得更丰富。不要试图一开始就写出完美的角色笔记——边处理边追加。
- **添加散文以增加深度。** 在结构化数据就位后，为重要笔记添加解释性文章。散文能够捕捉观察无法表达的内容：论证、细微差别、观点和声音。
- **定期验证。** 每个批次后都运行 `schema_validate`，而不只是最后再运行。及早发现漂移。
- **慷慨引用。** 文学分析依赖文本证据。将重要引文作为带有章节归属的 `[quote]` 观察记录下来。
- **审查并修订。** 完成所有章节后，从外部视角审查完整图谱。寻找内容单薄的笔记、缺失的连接和覆盖范围的空白。第一遍绝不会是最后一遍。
- **分析放在最后。** 在所有章节都处理完毕后，再编写 `analysis/` 中的综合笔记，届时你才能掌握全貌。