---
name: memory-literary-analysis
description: "Analyze a complete literary work into a structured Basic Memory knowledge graph. Covers schema design, entity seeding, chapter-by-chapter processing, cross-referencing, validation, and graph exploration."
---
# 文学记忆分析

将一部完整的文学作品转化为结构化知识图谱。角色、主题、章节、地点、符号和文学手法都变成彼此关联的笔记——可搜索、可验证、可遍历。

## 何时使用

- 全流程分析一部小说、戏剧、诗歌或非虚构书籍
- 为文学文本构建教学或学习资源
- 创建读书会配套知识库
- 需要结构化细读的研究项目
- 在大规模下对 Basic Memory 进行压力测试（约 200+ 笔记，1000+ 关系）

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

写入始终通过 `write_note` 和 `edit_note` 进行。对于“读取”——在长篇分析中这往往占据大部分工作量——如果可用，优先使用 POSIX 读取动词（为 MCP 工具启用 `enable_posix_tools`；`bm` CLI 动词始终可用）：

| 需求 | 使用 | 替代 |
|------|------|------|
| 长笔记中的某一节 | `cat <note> --section Observations` | 读取整个笔记 |
| 源文本中的行范围 | `cat <source>.txt --lines 4200-4890` | 将整本书拉入上下文 |
| 按 frontmatter 匹配的笔记 | `find --meta status=active` | 为检查字段逐个读取笔记 |
| 多个笔记中的字段 | `find --meta ... --fields pov,setting` | 每个笔记读一次 |
| 某内容所在位置 | `ls`, `tree`, `find --name '*.md'` | 列出全部内容 |

在 100+ 章的运行中，有两条规则最重要：

- **永远不要为了检查某个字段而读取整篇笔记。** 这正是 `--meta` 谓词和 `--fields` 投影的用途——一次调用就能回答原本需要逐个读取的问题。
- **永远不要为了定位某一部分而把整个文件拉入上下文。** `section` 和行范围会切分的是 *输出*：完整笔记仍会被获取，然后在返回前裁剪。它们节省的是上下文，而不是 I/O——长章节或完整源文本消耗的是相关部分的 token，而不是整份文件的 token。

这些规则会相互叠加。在实测运行中，谓词查询用一次调用取代了 28 次扫描；在 138 章的规模下，这种差异就是整次运行。

在编写查询前，有三个需要知道的尖锐边界。前两个会 *静默* 失败——错误答案、退出码 0、没有警告——所以最好现在就了解，而不是在你以为已经审计过的图谱里才发现问题：

- **`--meta` 是区分大小写匹配的，而且存储值始终是 snake_case。** `note_type` 是 frontmatter 中 `type:` 键的别名，按 SQL `=` 比较。`write_note` 在写入前会通过 `to_snake_case` 规范化 `note_type`，所以一个写作 `note_type="Chapter"` 的笔记会被存成 `type: chapter`——你写入时使用的大小写 *不是* 磁盘上的大小写。请查询 snake_case 形式：`--meta 'note_type=chapter'`。大写写法会返回零行并以退出码 0 结束。结果行里显示的值，就是你应该用来查询的值。
- **`find` 会分页，默认页大小是 10。** 任何答案是“全部 N 章”的查询都需要 `--page-size 200`（最大值）——见 [Coverage Checks](#coverage-checks)。
- **`--name` 不能与 `--meta` 组合。** 元数据搜索没有文件名通配。要用位置路径来限定 `--meta` 查询：`find /characters --meta 'note_type=character'`。该路径会在目录边界上与笔记索引所依据的 *文件路径* 匹配——也就是笔记实际所在的位置，而不是它的永久链接；一旦笔记在 frontmatter 中固定了 `permalink:` 或被移动，永久链接就不再镜像文件路径。因此 `/characters` 会覆盖 `characters/` 下的所有内容（包括 `characters/major/`），但不会覆盖 `characters-cut/`。

如果 POSIX 动词不可用，下面的每一步仍可使用 `search_notes`、`read_note` 和 `list_directory` 完成，只是成本更高。

## 阶段 0：设置

### 创建项目

```python
create_memory_project(name="<work-name>", path="~/basic-memory/<work-name>")
```

使用作品标题的 kebab-case slug（例如 `great-gatsby`、`hamlet`、`beloved`）。

### 定义架构

将 6 个架构笔记写入 `schema/`。每个架构定义实体类型的字段、观察类别和关系类型。根据作品进行字段调整，下面的架构是起始模板，并非严格模板。

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

根据需要添加作品特有的字段，例如军事小说中的 `rank`、家族史诗中的 `house`、奇幻作品中的 `species`。

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
  <work>.txt         # 原始文本，逐字保留（见 Phase 2）
  schema/            # 6 个 schema 定义
  chapters/          # 每章/节一个 note + 序章/尾声
  characters/
    major/           # 主角、反派、关键配角
    minor/           # 角色有限的已命名人物
  themes/            # 主题分析 notes
  locations/         # 场景和地点
  symbols/           # 象征元素
  literary-devices/  # 技巧和手法
  analysis/          # 跨切面的综合分析
  tasks/             # 处理跟踪器
```

## Phase 1: Seed Entities

在处理章节之前，先为主要实体创建 stub notes，这样 `[[wiki-links]]` 一开始就能解析。

### 主要角色

对于每个主要角色，创建一个带有已知元数据的 stub：

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

在开始阅读之前，先识别作品中的主要实体。一个好的起始清单如下：

| 类型 | 常见数量 | 应包含内容 |
|------|--------------|----------------|
| Characters (major) | 8-20 | 主人公、反派、关键配角 |
| Themes | 5-12 | 作品探讨的核心问题 |
| Locations | 4-10 | 主要场景、具有象征意义的地点 |
| Symbols | 4-10 | 具有多层含义的反复出现的物件、意象或母题 |

stub 不需要完整——它们用于提供 `[[wiki-link]]` 目标，并会在章节处理过程中得到补充。

## 第 2 阶段：章节处理

### 源文本准备

获取全文并识别章节/分段边界。对于公有领域作品，Project Gutenberg 是一个不错的来源。对于受版权保护的作品，请使用纸质版或授权的数字版。

**把源文本放到项目目录中，作为 `.txt` 文件，并且只索引一次。** `bm cat`
解析的是一个 *note identifier*，不是文件系统路径——它只能访问项目
索引已经识别过的文件。一次性的索引过程会让原始文本获得一个实体行，
之后按行范围切片就可以直接作用于它：

```bash
cp ~/Downloads/moby-dick.txt ~/basic-memory/moby-dick/moby-dick.txt
bm reindex --search -p moby-dick          # one pass; the .txt becomes readable
```

有两个约束使这种方式最合适，而且都值得遵守：

- **保持它为 `.txt`，不要转换成 `.md`。** Basic Memory 会向 markdown 笔记注入
  frontmatter，这会把每一行的行号按该块的高度整体偏移——由原始文件建立的
  offset map 随后就会悄无声息地出错。`.txt` 会按原样存储，因此它的行号与磁盘
  上的文件保持 1:1 对应。
- **把它放在项目内部。** 项目目录之外的源文本不是实体，而
  `bm cat` 会返回 `Error: Entity not found`。如果你必须把它放在外面，就不要
  对源文本使用 BM verbs，改用普通 shell（`sed -n '4200,4890p' <path>`）——笔记仍然
  使用 BM verbs，只有原始源文本改为回退到 shell。

**然后在处理之前构建一次章节偏移映射。** 扫描文本中的章节标题并记录每一章的行范围，然后按范围读取章节，而不是把整本书反复读入上下文：

```bash
grep -n '^CHAPTER ' ~/basic-memory/moby-dick/moby-dick.txt   # heading -> line number
bm cat moby-dick.txt --lines 4200-4890 --plain               # returns one chapter, not the whole text
```

`grep -n` 在这里是 shell 的 `grep`，作用对象是一个文件系统路径（这是制图步骤，并且
它需要这个文件）。`bm cat` 随后接受 *note identifier* —— `moby-dick.txt`，也就是文件在项目中的
路径 —— 并且只返回那一段内容，以及一个 `lines 4200-4890 of N` 页脚。`bm head moby-dick.txt -n 40` 是在
编写 `grep` 模式之前，快速查看标题格式的廉价方法。

把这张地图存到项目里（一个 note 或一个小型 JSON 文件），这样后续批次——以及在上下文压缩后恢复的
运行——就不必重新发现它。在长时间工作中，这是整个流程里最大的上下文节省。

### 分批策略

每批处理大约 10 章，以在深度和进度之间取得平衡。按叙事弧或主题重点分组：

| 批次 | 典型内容 |
|-------|---------|
| 1 | 开篇：背景、人物介绍、世界构建 |
| 2-3 | 上升行动：冲突建立，关系发展 |
| 4-6 | 中段：复杂化、转折点、主题深化 |
| 7-8 | 逼近高潮：升级、揭示、危机 |
| 最终 | 高潮、收束、尾声 |

根据章节长度和密度调整批次大小。短而动作密集的章节可以更大批次处理；较长、哲思更重的章节可能需要更小的批次。

### 每章工作流

对每一章：

**1. 仔细阅读该章。** 读取偏移地图中的章节行范围（`bm cat <source>.txt --lines <start>-<end>`），不要读整份文件。阅读真实文本——
绝不要凭记忆或摘要来处理；文本证据才是关键。

**2. 创建章节 note：**

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

**4. 跟踪进度** 使用 memory-tasks skill 创建一个处理任务，它能在上下文压缩后继续保留。

### 每章需要捕捉的内容

| 类别 | 关注点 |
|------|--------|
| `[summary]` | 1-2 句章节概要 |
| `[event]` | 关键情节事件（行动、揭示、到达） |
| `[tone]` | 情绪与文体氛围 |
| `[technique]` | 叙事创新（视角切换、结构实验、类型混合） |
| `[quote]` | 令人难忘或具有主题意义的段落 |
| `[significance]` | 这一章为何对全书重要 |
| `[foreshadowing]` | 对未来事件的暗示 |

### 按章节进行实体丰富

随着每一章被处理，为相关实体追加观察：
- **角色**：`[arc]` 时刻、新的 `[trait]` 揭示、`[quote]` 归属
- **主题**：本章中的 `[manifestation]`、`[evolution]` 变化
- **象征物**：带有语境的 `[appearance]`、新的 `[interpretation]` 角度
- **地点**：所描写的 `[atmosphere]`、场景中的 `[significance]`
- **文学手法**：本章中的 `[example]`

### 添加散文与阐释

在结构化观察就位之后，考虑为主要实体笔记添加阐释性散文。在 `Observations` 部分之前，使用 `edit_note(operation="prepend")` 预置 2-4 段批评性随笔。此散文应当：

- 为对角色、主题或象征物的某种解读进行论证——而不只是描述
- 将该实体与作品更宏观的关注点以及文学传统联系起来
- 明确标示主观判断（例如：“在我的阅读中……”，“我认为……”）
- 以章节编号为依据，结合文本证据来支撑论点

这些散文为仅有结构化观察时所缺乏的阐释质感提供补充。

## 第 3 阶段：交叉引用

在所有章节处理完毕后：

### 找出需要丰富的内容

不要重新通读每一条笔记来判断哪些内容过于单薄。用查询来完成：

```bash
bm find --meta 'note_type=chapter' --fields chapter_number,pov,setting --page-size 200
bm find --meta 'note_type=character' --fields role,status --page-size 200   # 谁仍然只是一个 stub
bm find --meta 'chapter_number>100' --fields pov --page-size 200           # 后期章节 POV 漂移
```

某个笔记从未设置过的字段，在结果里会显示为空单元格（`--json` 下为 `null`），因此带空白值的行就是待办队列。这样就把“审计图谱”从逐条阅读所有笔记，变成了每个问题一次调用。

注意小写的 `chapter`/`character` — `write_note` 会在写入笔记前把 `note_type` 转成 snake_case，所以落盘后的值就是这个；不论你在 Phase 0 的 schema 里怎么拼写，都要与之精确匹配。大写拼写会返回 0 行且退出码为 0。并且 `--page-size 200` 不是装饰：如果没有它，这些命令只会返回前 10 行，看起来待办队列只有十项。

### 角色弧线

为每个主要角色写一条完整的 `[arc]` 总结观察，覆盖他们在全书中的轨迹。

### 主题演变

为每个主题添加 `[evolution]` 观察，追踪它如何从引入发展到收束。

### 章节平行

为结构上相似的章节添加 `parallels` 和 `contrasts_with` 关系（例如镜像场景、重复出现的地点、主题回响）。

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
- **叙事结构** — 整体架构与节奏
- **作品概览** — 对整部作品的综合梳理（摘要、主旨、遗产）
- **批评接受** — 历史与当代解读

### 发现涌现实体
在章节处理过程中，会出现新的次要角色、地点和符号。为任何在 3+ 章中出现或具有主题分量的实体创建笔记。

## 第 4 阶段：验证

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

修复发现的问题 — 常见修复包括：
- 缺少必需的观察类别 → 通过 `edit_note` 添加
- 枚举值超出允许集合 → 更正元数据
- 笔记中的字段不在模式中 → 如果合理，则将其添加为可选项到模式中

### 覆盖检查

模式验证证明笔记符合其形状。这些检查证明图谱是*完整的*：

```bash
bm find --meta 'note_type=chapter' --fields chapter_number --page-size 200   # every chapter present?
bm find --meta 'note_type=chapter' --fields pov,setting --page-size 200      # missing context?
bm find /characters --meta 'note_type=character' --fields role --page-size 200  # inventory vs. seed list
```

**分页的 `find` 不算覆盖检查。** `bm find` 默认使用
`--page-size 10`，所以第一条查询如果不指定大小，会“证明”一部 138 章的作品只有 10
章。200 是最大 page size；超过这个值，就使用 `--page 2`、`--page 3`，依此类推。
用位置参数路径（`/characters`）来限定 `--meta` 查询，绝不要用 `--name`——这两个
选项互斥，因为元数据搜索没有文件名通配符。位置参数路径按笔记索引所在的*文件路径*进行限定，匹配目录边界：`/characters` 包含 `characters/major/ahab.md`，但绝不包含 `characters-cut/`。这不是永久链接匹配，所以即使某条笔记自己设置了 `permalink:`，它仍然会在其文件所在的位置被找到。

读取页脚里的计数，不要看你能看到的行数。每个 `find` 结果都会报告
`page 1 • total 138`，并在答案被截断时附加 `• more available (--page)` —— 这个后缀一旦出现，就说明检查*失败*了，不管可见行数看起来如何。

对于序列缺口——即单靠计数无法发现的失败——请从 `--json` 中取数字，它包含 `total`、`total_is_exact` 和 `has_more`：

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

循环不是装饰。`--page-size` 上限是 200，所以单次调用无法为超过 200 个章节的 work 建立清单——而且再次运行并指定 `--page 2` 会**替换**这些数字，而不是累加它们，这会在一个完整的语料库上报告章节 1-200 缺失。应当一直遍历到 `has_more` 为 false，并检查并集。

把 work 的**实际**章节总数作为 `$expected` 传入——如果从找到的最大编号推导范围，一个不完整的图谱也能蒙混过关。对于 138 行、编号为 1..137 再加一个重复项的情况，基于最大值的检查会报告 `missing: []`，而实际上有一个章节确实缺失：重复项维持了计数正确，而缺失的尾部把目标线往后推了。检查应在合并后的页面上同时通过 `unnumbered: []`、`missing: []`、`duplicates: []`，**以及** `out_of_range: []`。

`unnumbered` 也不是装饰性的。一个从未获得 `chapter_number` 的 `chapter` note 会以 `null` 返回，直接把它传给 `tonumber` 会使整个流水线中止，并报 `null cannot be parsed as a number` ——这意味着检查会在它本来要找的那种畸形清单上崩溃。先分区能把它变成一行有名字的记录。

`out_of_range` 也不是假设：被标成 `chapter` 的前言或尾声会落在 0 或 `$expected + 1`，如果没有这个键，报告看起来就很干净——每个预期编号都在，没有重复——而清单里却包含了一个编号体系没有覆盖的 note。把前后正文作为自己的 note 类型，或者有意扩大 `$expected`。

批次中间的缺口是最常见的处理失败，也最容易靠眼睛漏掉；重复的章节编号是第二常见的问题，而它会掩盖第一个。

### 关系一致性
抽查双向关系：如果 Chapter X `features [[Character]]`，Character 是否有引用 Chapter X 的 observations？补上缺口。

孤立项是这个检查的另一面——一个没有入边或出边关系的 note，要么是真正孤立的，要么就是从未被重新连接回图中：

```bash
bm orphans          # 图中没有任何关系的实体
```

图谱质量看的是关系 *密度*，不是 note 数量。只增加 note、却留下 orphan 的通过，实际上让图变差了。

## 第 5 阶段：探索图谱

当图谱完整后，沿着它遍历，找出按章节逐个检查无法看到的东西：

```bash
bm tool build-context 'memory://characters/major/*' --depth 2         # 人物关系网
bm find --meta 'note_type=theme' --fields prevalence --page-size 200  # 主题权重
bm grep -F "doubloon" --page-size 100 --project <work>                # 某个符号的每一次出现
```

`build-context` 将 URL 作为位置参数传入——没有 `--url` 选项。

`grep` 默认使用语义排序，并且默认页大小为 10，这能回答“这大概讲什么？”但会悄悄截断“它出现在哪里？”——一个在 40 个章节中出现的符号只会返回 10 条。对于符号追踪，请使用 `-F` 进行字面匹配，并提高 `--page-size`；你在寻找的意义变化通常出现在后面的若干次出现里，而默认设置会把它们丢掉。

`--page-size` 提高上限，但不会移除上限。长篇作品中的某个符号甚至可能超过 100，因此要检查最后一页是否已满，并继续使用 `--page 2`、`--page 3`，直到不再满为止。被截断的符号搜索会像未分页的 `find` 一样以同样静默的方式失败：给出一个看似合理的答案，退出码 0，却没有任何迹象表明尾部内容缺失。

而 `grep` 搜索的是**你的笔记，不是源文本**。`<work>.txt` 会作为一个实体被索引，但它的正文不在可搜索文本中，所以一个你从未写入笔记的出现位置是无法检索到的——已验证：只存在于源文本中的一个词返回 `total: 0`，而同时存在于笔记和源文本中的一个词只返回那条笔记。所以这回答的是“我在哪里写过关于 doubloon 的内容”，而不是“doubloon 在书中的什么地方出现”。后者应当搜索文件本身，并使用 [chapter offset map](#source-text-preparation) 把命中位置转换为章节。

遍历是二阶问题得到答案的地方——哪些角色共享最多章节，哪些主题在最后一幕汇合，某个符号的含义在何处发生转变。把你的发现记录为 `analysis/` 笔记；这些综合判断正是构建图谱的回报。

## 适配其他体裁

这个流程适用于任何文学文本。按体裁调整 schema：

| Genre | Schema Adjustments |
|-------|-------------------|
| **Novel** | Base schemas work as-is; add genre-specific Character fields as needed |
| **Play** | Add `Act` and `Scene` schemas; Character gets `speaking_lines` field |
| **Poetry collection** | Replace Chapter with `Poem`; add `form`, `meter`, `rhyme_scheme` fields |
| **Non-fiction** | Replace Chapter with `Section`; add `Argument`, `Evidence` schemas |
| **Short story collection** | Add `Story` schema with `narrator`, `setting`, `word_count` |
| **Epic/myth** | Add `Deity`, `Prophecy` schemas; Location gets `mythological_significance` |
| **Memoir** | Character schema gets `relationship_to_narrator`; add `Memory` schema |

### 扩展指导

| Work Length | Batch Size | Estimated Notes |
|-------------|-----------|----------------|
| Novella (~40K words) | 5-10 chapters | ~50-80 |
| Novel (~80K words) | 8-12 chapters | ~100-150 |
| Long novel (~200K+ words) | 10-15 chapters | ~200-300 |
| Series (multiple volumes) | 1 volume at a time | ~200+ per volume |

## 相关 Skills

- **memory-schema** — Schema creation, validation, and drift detection
- **memory-tasks** — Track chapter processing progress across context compaction
- **memory-notes** — Note writing patterns, observation categories, wiki-links
- **memory-ingest** — Processing external input into structured entities
- **memory-metadata-search** — Querying notes by frontmatter fields
- **memory-lifecycle** — Archiving completed analysis phases

## Guidelines

- **先播种，后处理。** 先创建实体骨架，这样在章节处理期间 wiki-links 就能立即解析。
- **批量处理，保持可控。** 每次处理大约 10 章，在深度和推进速度之间取得平衡。用 Task note 跟踪进度。
- **阅读源文本。** 不要依赖记忆或摘要。每一批都要先读（或重读）实际文本，再创建笔记。文本证据最重要。
- **窄范围阅读。** 把源文本作为 `.txt` 放在项目中，只索引一次，只构建一次章节偏移映射，然后按行范围读取章节、按 section 读取笔记。在长篇作品中，整文件进入上下文是流程里最主要、也最可避免的成本。
- **查询，不要扫描。** 当你需要知道哪些笔记有某个字段时，使用 `--meta` 谓词和 `--fields` 投影去查询。为了检查 frontmatter 而去逐条阅读笔记，是这个流程在大规模场景下会犯的错误。这个查询有两种会悄悄说谎的方式：`--meta` 会对 schema 作者写入的 frontmatter `type:` 区分大小写，而 `find` 默认只返回 10 行，除非你传入 `--page-size`。
- **Observations 是你的索引。** 知识图谱的价值来自分类后的 observations。类别要充足，内容要具体。
- **Relations 是你的网络。** 每一章都应链接到角色、主题、地点和手法。每个实体都应回链到它出现过的章节。
- **迭代充实。** 实体笔记会随着每章内容不断变得更丰富。不要试图一开始就写出完美的角色笔记——边处理边追加。
- **补充 prose 以增加深度。** 在结构化数据就位后，给主要笔记添加解释性散文。prose 能承载 observations 无法表达的内容：论证、细微差别、观点和风格。
- **定期验证。** 每批之后都运行 `schema_validate`，不要等到最后。尽早发现 drift。
- **多引用原文。** 文学分析依赖文本证据。用带章节归属的 `[quote]` observations 收录重要引文。
- **审阅并修订。** 完成所有章节后，从外部视角审视整个图谱。找出内容薄弱的笔记、缺失的连接和覆盖空白。第一次处理永远不是最后一次。
- **Analysis 放在最后。** `analysis/` 中的综合笔记应在所有章节都处理完之后再写，这时你才拥有完整视角。