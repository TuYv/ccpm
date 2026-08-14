---
name: promote-idea
description: Converts an album idea from IDEAS.md into an actual album project in one step. Use when the user says "promote [idea title]", "turn idea into album", or "start working on [idea]".
argument-hint: <"idea title"> [album-slug-override]
model: haiku
allowed-tools:
  - Read
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

通过一次调用，将 `IDEAS.md` 中的一个 `Pending` 创意转换为完整的专辑项目。用单一入口取代手动的三步工作流（`get_ideas` → `new-album` → `update_idea`）。

---

# 推进创意 Skill

## 第 1 步：解析参数

支持的格式：

- `"<idea title>"` — 根据标题自动生成 slug
- `"<idea title>" <album-slug>` — 覆盖自动生成的 slug
- `"<idea title>" documentary` — 使用标准 slug，并开启 documentary 标志
- `"<idea title>" <album-slug> documentary` — 显式指定 slug，并开启 documentary

示例：

- `"Kleine Welt"` → 自动生成 slug `kleine-welt`
- `"The Great Molasses Flood" molasses-flood documentary`
- `"Ängstliche Kätzchen"` → slug 为 `angstliche-katzchen`（移除变音符号）

**如果未提供参数，或标题为空**，请先列出可用的待处理创意，并询问要推进哪一个：

```
Which idea should I promote?

Pending ideas:
1. Kleine Welt (electronic, Thematic)
2. The Great Molasses Flood (folk, Documentary)
3. Linux Kernel Wars (electronic, Character Study)

Reply with the exact title.
```

使用 `get_ideas(status_filter="Pending")` 获取列表。

## 第 2 步：确认生成的 Slug

调用 `get_ideas(status_filter="Pending")`（或 `search(query=idea_title, scope="ideas")`）确认该创意存在，并向用户展示即将执行的操作。

在本地计算 slug，仅用于展示（转换为小写、移除变音符号、将非字母数字字符替换为连字符）。如果结果看起来不合适，请提示用户可以覆盖：

```
About to promote:
  Idea:  Kleine Welt
  Slug:  kleine-welt
  Genre: electronic
  Type:  Thematic

Proceed? (Or supply a different slug.)
```

如果用户已经显式提供 slug，则跳过确认步骤——这表明用户已经考虑过 slug。

## 第 3 步：询问 Documentary 标志（如果尚未提供）

`documentary` 标志决定是否创建 `RESEARCH.md` 和 `SOURCES.md`。这**不能**从创意元数据中推导出来——创意的 `Type` 字段可以是 `Documentary`，但那是另一个独立概念（叙事形态）。询问一次：

> 这是一张纪录片/真实故事专辑吗？（将添加研究和来源模板。真实世界事件请回答“yes”，虚构内容请回答“no”。）

如果参数中已包含 `documentary`，则跳过此步骤。

## 第 4 步：通过 MCP 推进

调用 `promote_idea(idea_title, album_slug=<slug or "">, documentary=<bool>)`。

该工具会执行以下所有操作：

1. 在状态中查找该创意（如果缺失或已推进，则报错）
2. 通过 `create_album_structure` 创建专辑目录
3. 将创意概念注入新建的 `README.md`，置于 `## Concept` 章节下
4. 将创意状态从 `Pending` 推进至 `In Progress`
5. 在 `IDEAS.md` 中为该创意添加 `**Promoted To**: <slug>` 反向链接

成功时，该工具返回 `{promoted: true, slug, album_path, files, ...}`；失败时返回 `{error: ...}`。

## 第 5 步：确认并建议下一步

成功后，报告：

```
Promoted "Kleine Welt" → album "kleine-welt"

Location: ~/bitwize-music/artists/bitwize/albums/electronic/kleine-welt/
Files:    README.md, tracks/

Concept block injected into README.md from idea.
Idea status: Pending → In Progress

Next step:
  /bitwize-music:album-conceptualizer

  This walks through the 7 Planning Phases (Vision, Identity, Sonic
  Direction, Structure, Tracks, Content, Approval) to develop the concept
  you just carried over into the album.
```

对于纪实专辑，添加：

```
  Research files also created: RESEARCH.md, SOURCES.md
  Don't forget human source verification before generation.
```

---

## 错误处理

**未找到创意：**

```
Error: Idea "Nonexistent" not found in IDEAS.md.

Check available ideas: /bitwize-music:album-ideas list
```

**创意已升级：**

```
Error: Idea "Already Active" is already promoted (status: In Progress).

If you want to rename or re-scaffold, use /bitwize-music:rename on the
existing album instead.
```

**创意没有流派：**

```
Error: Idea "No Genre" has no **Genre** field in IDEAS.md.

Set the genre first: /bitwize-music:album-ideas edit "No Genre"
```

**无效流派：**

```
Error: Invalid genre "xyz" on idea. Not in genres/.

Fix the genre in IDEAS.md, then retry.
```

**专辑 slug 重复：**

```
Error: Album "kleine-welt" already exists.

Options:
1. Supply a different slug: /bitwize-music:promote-idea "Kleine Welt" kleine-welt-2
2. Resume the existing album: /bitwize-music:resume kleine-welt
```

---

## 示例

### 简单标题

```
/bitwize-music:promote-idea "Kleine Welt"
```

自动派生 slug `kleine-welt`，询问是否为纪实专辑，调用
`promote_idea`，并报告结果。

### 显式覆盖 slug

```
/bitwize-music:promote-idea "The Great Molasses Flood" molasses-1919
```

使用 `molasses-1919`，而不是自动派生的 `the-great-molasses-flood`。

### 纪实专辑

```
/bitwize-music:promote-idea "The Great Molasses Flood" documentary
```

除了标准的 README 和曲目目录外，还会创建 `RESEARCH.md` 和 `SOURCES.md`。

---

## 为什么需要专用 Skill

手动工作流需要依次执行三个步骤：

1. 使用 `get_ideas` 查找创意的流派
2. 执行 `/bitwize-music:new-album <slug> <genre>`，其中 slug 由用户自行构造
3. 执行 `update_idea("<title>", "status", "In Progress")`

此 Skill 解决的问题：

- **概念转移** — 现在会自动将创意的概念文本合并到新专辑的 README 中（过去经常会跳过手动复制粘贴）。
- **状态规范** — 创意开始制作后不再滞留于 `Pending` 状态；状态转换会自动完成，并建立双向关联（`Promoted To` 反向链接）。
- **Slug 派生** — 无需再重新构造 slug；变音符号和标点会以一致的方式进行规范化。
- **单一入口** — 新用户只需学习一条命令，而不是三条。

---

## 请记住

1. **仅限 Pending** — 只有 `Pending` 状态的创意可以升级。`In Progress`
   和 `Complete` 状态的创意会返回错误。
2. **单向操作** — 升级会创建文件并更新状态。不存在“取消升级”操作；如果需要重做，请使用 `/bitwize-music:rename` 或手动清理。
3. **保留概念** — 升级后，创意的概念会保留在两个位置：`IDEAS.md` 中的创意条目（历史记录）和新专辑的 `README.md`（工作文档）。
4. **下一步始终是 album-conceptualizer** — 升级仅创建脚手架；实际规划会在 7 个规划阶段中进行。