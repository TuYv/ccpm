---
name: memory-literary-analysis
description: "Analyze a complete literary work into a structured Basic Memory knowledge graph. Covers schema design, entity seeding, chapter-by-chapter processing, cross-referencing, validation, and visualization."
---
# 记忆文学分析

将一部完整的文学作品转化为结构化知识图谱。人物、主题、章节、地点、象征和文学手法将成为相互关联的笔记，可供搜索、验证和可视化。

## 适用场景

- 对小说、戏剧、诗歌或非虚构作品进行端到端分析
- 为文学文本构建教学或学习资源
- 创建读书会配套知识库
- 开展需要结构化细读的研究项目
- 对 Basic Memory 进行大规模压力测试（约 200+ 篇笔记、1000+ 个关系）

## 流程概览

```
Phase 0: Setup         → project, schemas, directory structure
Phase 1: Seed          → stub notes for known major entities
Phase 2: Process       → chapter-by-chapter notes in batches
Phase 3: Cross-ref     → enrich arcs, add parallels, write analysis
Phase 4: Validate      → schema checks, drift detection, consistency
Phase 5: Visualize     → Obsidian canvas files for character webs, timelines
```

## 阶段 0：设置

### 创建项目

```python
create_memory_project(name="<work-name>", path="~/basic-memory/<work-name>")
```

使用作品标题的 kebab-case slug（例如 `great-gatsby`、`hamlet`、`beloved`）。

### 定义模式

将 6 篇模式笔记写入 `schema/`。每个模式定义对应实体类型的字段、观察类别和关系类型。根据作品调整字段——以下模式是起点，而非固定模板。

#### 人物模式

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

根据需要添加作品特有的字段——例如，军事小说中的 `rank`、家族史诗中的 `house`、奇幻作品中的 `species`。

#### 主题模式

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

#### 章节模式

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

#### 地点模式

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

#### 符号模式

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

#### 文学手法模式

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

## 阶段 1：创建实体初始条目

在处理各章节之前，为主要实体创建存根笔记，以便 `[[wiki-links]]` 从一开始就能正确解析。

### 角色（主要）

为每个主要角色创建包含已知元数据的存根：

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

### 初始条目检查清单

在开始阅读之前，先识别作品中的主要实体。以下清单适合作为初始条目参考：

| 类型 | 通常数量 | 应包含的内容 |
|------|--------------|-----------------|
| 角色（主要） | 8-20 | 主角、反派、关键配角 |
| 主题 | 5-12 | 作品探讨的核心问题 |
| 地点 | 4-10 | 主要场景、具有重要象征意义的地点 |
| 象征 | 4-10 | 具有多层含义且反复出现的物件、意象或母题 |

存根无需完整——它们用于提供 `[[wiki-link]]` 目标，并将在章节处理期间逐步充实。

## 阶段 2：章节处理

### 源文本准备

获取完整文本并确定章节/小节的边界。对于公版作品，Project Gutenberg 是一个很好的来源。对于受版权保护的作品，请使用实体副本或获得许可的数字副本。

### 分批策略

每批处理约 10 个章节，以平衡分析深度与处理进度。按叙事弧或主题重点进行分组：

| 批次 | 典型内容 |
|-------|----------------|
| 1 | 开篇：背景设定、角色介绍、世界观构建 |
| 2-3 | 情节发展：冲突确立、关系发展 |
| 4-6 | 中段：复杂局面、转折点、主题深化 |
| 7-8 | 接近高潮：冲突升级、真相揭示、危机 |
| 最终批次 | 高潮、结局、尾声 |

根据章节长度和内容密度调整批次大小。简短且动作情节密集的章节可以按较大的批次处理；较长且哲学内容密集的章节可能需要较小的批次。

### 单章工作流程

对于每个章节：

**1. 仔细阅读章节。** 如果使用源文本文件，请阅读相关部分。

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

**4. 跟踪进度**：使用 memory-tasks skill 创建一个能在上下文压缩后继续保留的处理任务。

### 每章需要捕捉的内容

| 类别 | 需要留意的内容 |
|----------|-----------------|
| `[summary]` | 用 1-2 句话概述本章 |
| `[event]` | 关键情节事件（行动、揭示、人物登场） |
| `[tone]` | 情感与文体氛围 |
| `[technique]` | 叙事创新（视角转换、结构实验、类型融合） |
| `[quote]` | 令人难忘或具有重要主题意义的段落 |
| `[significance]` | 本章对整部作品的重要意义 |
| `[foreshadowing]` | 对未来事件的暗示 |

### 每章的实体丰富

处理每一章时，将观察追加到相关实体：
- **人物**：`[arc]` 时刻、新揭示的 `[trait]`、`[quote]` 的归属
- **主题**：本章中的 `[manifestation]`、`[evolution]` 变化
- **象征**：结合上下文记录 `[appearance]`，以及新的 `[interpretation]` 角度
- **地点**：所描绘的 `[atmosphere]`、在场景中的 `[significance]`
- **文学手法**：本章中的 `[example]`

### 添加论述与阐释

完成结构化观察后，可以考虑为主要实体笔记添加阐释性论述。使用 `edit_note(operation="prepend")` 在 Observations 部分之前添加 2-4 段评论性文章。这些论述应当：

- 提出对人物、主题或象征的解读论点，而不只是描述
- 将实体与作品更宏大的关切以及文学传统联系起来
- 包含明确标示为主观观点的看法（“依我之见……”“我认为……”）
- 以按章节编号引用的文本证据作为论点依据

这些论述能够增添仅靠结构化观察无法捕捉的阐释质感。

## 阶段 3：交叉引用

处理完所有章节后：

### 人物弧光
为每个主要人物撰写一条完整的 `[arc]` 摘要观察，涵盖其贯穿整部作品的发展轨迹。

### 主题演变
为每个主题添加 `[evolution]` 观察，追踪其从引入到收束的发展过程。

### 章节呼应
在结构相似的章节之间添加 `parallels` 和 `contrasts_with` 关系（例如镜像场景、重复出现的地点、主题呼应）。

### 分析笔记
在 `analysis/` 中创建综合性笔记：

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
- **叙事结构** — 整体架构与节奏
- **作品概述** — 对完整作品的综合分析（摘要、主旨、影响）
- **批评界反响** — 历史与当代诠释

### 发现涌现实体
在处理章节的过程中，会出现新的次要人物、地点和象征。为任何出现在 3 个以上章节中或具有主题意义的实体创建笔记。

## 阶段 4：验证

### 模式验证

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

修复发现的问题——常见修复包括：
- 缺少必需的观察类别 → 通过 `edit_note` 添加
- 枚举值超出允许范围 → 更正元数据
- 笔记中存在但模式中未定义的字段 → 如果合理，将其作为可选字段添加到模式中

### 关系一致性
抽查双向关系：如果章节 X `features [[Character]]`，该人物的观察中是否引用了章节 X？修复缺漏。

## 阶段 5：可视化

将 [JSON Canvas](https://jsoncanvas.org/) 文件（`.canvas`）写入项目目录，以便在 Obsidian 中进行可视化探索。先查询图谱（`search_notes`、`build_context`），然后将结果布局为画布节点和边：

```json
{
  "nodes": [
    {"id": "ahab", "type": "file", "file": "characters/captain-ahab.md", "x": 0, "y": 0, "width": 400, "height": 300},
    {"id": "ishmael", "type": "file", "file": "characters/ishmael.md", "x": 500, "y": 0, "width": 400, "height": 300}
  ],
  "edges": [
    {"id": "e1", "fromNode": "ishmael", "toNode": "ahab", "label": "narrates"}
  ]
}
```

实用画布：人物关系网（主角/反派/配角）、主题关联图、包含关键事件的章节时间线。

## 适配其他体裁

此流程适用于任何文学文本。请根据体裁调整模式：

| 体裁 | 模式调整 |
|-------|-------------------|
| **小说** | 基础模式可直接使用；根据需要添加特定体裁的 Character 字段 |
| **戏剧** | 添加 `Act` 和 `Scene` 模式；为 Character 添加 `speaking_lines` 字段 |
| **诗集** | 将 Chapter 替换为 `Poem`；添加 `form`、`meter`、`rhyme_scheme` 字段 |
| **非虚构作品** | 将 Chapter 替换为 `Section`；添加 `Argument`、`Evidence` 模式 |
| **短篇小说集** | 添加包含 `narrator`、`setting`、`word_count` 的 `Story` 模式 |
| **史诗/神话** | 添加 `Deity`、`Prophecy` 模式；为 Location 添加 `mythological_significance` |
| **回忆录** | 为 Character 模式添加 `relationship_to_narrator`；添加 `Memory` 模式 |

### 扩展规模指南

| 作品长度 | 批次大小 | 预计笔记数 |
|-------------|-----------|----------------|
| 中篇小说（约 4 万词） | 5-10 章 | 约 50-80 |
| 小说（约 8 万词） | 8-12 章 | 约 100-150 |
| 长篇小说（约 20 万词以上） | 10-15 章 | 约 200-300 |
| 系列作品（多卷） | 每次 1 卷 | 每卷约 200 篇以上 |

## 相关技能

- **memory-schema** — 模式创建、验证和漂移检测
- **memory-tasks** — 在上下文压缩期间跟踪章节处理进度
- **memory-notes** — 笔记编写模式、观察类别、Wiki 链接
- **memory-ingest** — 将外部输入处理为结构化实体
- **memory-metadata-search** — 按 frontmatter 字段查询笔记
- **memory-lifecycle** — 归档已完成的分析阶段

## 指南

- **先建立种子，再进行处理。** 首先创建实体存根，以便在章节处理期间 Wiki 链接能够立即解析。
- **分批处理以保持条理。** 每次处理约 10 个章节，可以在深度与推进速度之间取得平衡。使用任务笔记跟踪进度。
- **阅读原文。** 不要依赖记忆或摘要。在为每个批次创建笔记之前，阅读（或重新阅读）实际文本。文本证据就是一切。
- **观察是你的索引。** 知识图谱的价值来自分类后的观察。类别要丰富，内容要具体。
- **关系是你的网络。** 每个章节都应链接到人物、主题、地点和手法。每个实体都应反向链接到它出现过的章节。
- **迭代式丰富内容。** 实体笔记会随着每个章节的处理而变得更加丰富。不要试图一开始就写出完美的人物笔记，而应随着处理进度不断追加。
- **添加散文以增加深度。** 结构化数据就位后，为主要笔记添加阐释性文章。散文能够捕捉观察无法表达的内容：论点、细微差别、观点和文风。
- **定期验证。** 每处理完一个批次后运行 `schema_validate`，而不是只在最后运行。及早发现漂移。
- **充分引用。** 文学分析以文本证据为基础。将重要引文作为 `[quote]` 观察加入，并注明所属章节。
- **审查并修订。** 完成所有章节后，从外部视角审查整个图谱。查找内容单薄的笔记、缺失的连接和覆盖空白。第一遍永远不是最后一遍。
- **最后再进行分析。** 应在所有章节处理完毕、掌握全貌后，再编写 `analysis/` 中的综合笔记。