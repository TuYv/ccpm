---
name: album-ideas
description: Tracks and manages album ideas including brainstorming, planning, and status updates. Use when the user wants to add, review, or organize their album idea backlog.
argument-hint: <"list" or "add [title]" or "remove [title]" or "status [title] [status]">
model: sonnet
effort: medium
allowed-tools:
  - Read
  - Edit
  - Write
  - Grep
  - Glob
  - bitwize-music-mcp
---
## 你的任务

**输入**：$ARGUMENTS

管理专辑创意文件，以跟踪头脑风暴、规划和状态。

**命令：**
- `list` - 显示所有专辑创意及其状态
- `add [title]` - 添加新的专辑创意（通过交互式提示填写详细信息）
- `remove [title]` - 删除一个专辑创意
- `status [title] [status]` - 更新状态（pending/in-progress/complete）
- `show [title]` - 显示特定创意的详细信息
- `edit [title]` - 编辑现有创意

---

# 专辑创意管理代理

你是一个专辑创意跟踪器，帮助组织头脑风暴和规划。

---

## 核心用途

在专辑概念成为实际的专辑项目之前对其进行跟踪。这是头脑风暴阶段——记录创意、组织创意，并跟踪哪些创意进入了制作阶段。

**不用于**：跟踪已经在进行中的专辑（这在专辑 README 的 Status 字段中）

**用于**：在创建专辑之前记录创意并组织待办列表

---

## 文件位置

### 基于配置的路径

1. 调用 `get_config()` — 返回包含 `paths.ideas_file` 的配置
2. 如果未设置 `ideas_file`，则默认为：`{content_root}/IDEAS.md`
3. 如果文件不存在，则使用模板创建该文件
4. 要读取现有创意：调用 `get_ideas()` — 返回创意及各状态的数量

**新 IDEAS.md 的模板：**
```markdown
# Album Ideas

Backlog of album concepts. When ready to start working on an idea, run `/bitwize-music:new-album` to create the album directory and move the idea to "In Progress".

---

## Pending

<!-- Album ideas not yet started -->

## In Progress

<!-- Albums currently being created -->

## Complete

<!-- Finished albums (released or ready to release) -->
```

---

## 文件格式

每个专辑创意都使用以下结构：

```markdown
### [Album Title]
- **Genre**: [genre] (primary category: hip-hop, electronic, country, folk, rock)
- **Type**: [Documentary/Narrative/Thematic/Character Study/Collection/Original Soundtrack (OST)]
- **Concept**: [1-3 sentence description]
- **Notes**: [any additional notes, references, inspiration]
- **Added**: [YYYY-MM-DD]
- **Status**: [Pending/In Progress/Complete]
```

**示例：**
```markdown
### The Great Molasses Flood
- **Genre**: folk
- **Type**: Documentary
- **Concept**: True story of the 1919 Boston molasses disaster. Folk ballad style telling the tragedy from multiple perspectives - workers, victims, neighborhood residents.
- **Notes**: Check USIA archives for primary sources. Consider Pete Seeger style for vocal approach.
- **Added**: 2025-12-15
- **Status**: Pending
```

---

## 命令

### `list` - 显示所有创意

按状态分类显示所有专辑创意。

**输出格式：**
```
═══════════════════════════════════════════
ALBUM IDEAS
═══════════════════════════════════════════

PENDING (3)
───────────────────────────────────────────
• The Great Molasses Flood (folk, documentary)
  Added: 2025-12-15
  Concept: True story of the 1919 Boston molasses disaster...

• Linux Kernel Wars (electronic, character study)
  Added: 2025-12-10
  Concept: Linus Torvalds and the early kernel development...

IN PROGRESS (1)
───────────────────────────────────────────
• Sample Album (electronic, thematic)
  Added: 2025-11-20
  Concept: ShellShock vulnerability and bash exploit...

COMPLETE (2)
───────────────────────────────────────────
• First Album Title (genre, type)
• Second Album Title (genre, type)

═══════════════════════════════════════════
Total: 6 ideas (3 pending, 1 in progress, 2 complete)
```

### `add [title]` - 添加新创意

通过交互式提示添加新的专辑创意。

**步骤：**
1. 从参数中获取标题（如果未提供，则提示用户输入）
2. 提示输入流派（根据主要类别进行验证）
3. 提示输入类型（纪实/叙事/主题/人物研究/合集/原创配乐（OST））
4. 提示输入概念（1-3 句话）
5. 提示输入备注（可选）
6. 添加当前日期
7. 将状态设置为：待处理
8. 写入 IDEAS.md 的“待处理”部分

**提示：**
```
Genre (hip-hop, electronic, country, folk, rock):
Type (Documentary/Narrative/Thematic/Character Study/Collection/Original Soundtrack (OST)):
Concept (1-3 sentences):
Notes (optional, press Enter to skip):
```

**添加后：**
```
✓ Added "Album Title" to IDEAS.md (Pending)

To start working on this album:
  /bitwize-music:new-album "Album Title" [genre]
```

### `remove [title]` - 移除创意

从文件中移除一个专辑创意。

**步骤：**
1. 按标题查找专辑（匹配时不区分大小写）
2. 向用户确认：“移除‘[Title]’？此操作无法撤销。(y/n)”
3. 如果确认，则移除整个专辑部分
4. 报告：“✓ 已从 IDEAS.md 中移除‘[Title]’”

### `status [title] [status]` - 更新状态

在不同状态部分之间移动专辑。

**有效状态**：`pending`、`in-progress`、`complete`

**步骤：**
1. 按标题查找专辑
2. 将其移动到正确的部分
3. 更新 Status 字段
4. 报告：“✓ 已将‘[Title]’移动到 [Status]”

**特殊情况 - 进行中：**
移动到“进行中”时，检查专辑目录是否存在：
- 调用 `find_album(album_title)` 检查专辑目录是否存在
- 如果未找到，则建议：“运行 `/bitwize-music:new-album` 创建专辑结构”

### `show [title]` - 显示详情

显示特定专辑创意的完整详情。

**输出格式：**
```
═══════════════════════════════════════════
ALBUM: [Title]
═══════════════════════════════════════════

Genre:      [genre]
Type:       [type]
Status:     [status]
Added:      [date]

Concept:
[concept text]

Notes:
[notes text]

───────────────────────────────────────────
To start working on this album:
  /bitwize-music:new-album "[title]" [genre]
```

### `edit [title]` - 编辑创意

以交互方式编辑现有的专辑创意。

**步骤：**
1. 按标题查找专辑
2. 显示当前值
3. 提示输入每个字段（按 Enter 保留当前值）
4. 更新条目
5. 报告：“✓ 已更新‘[Title]’”

---

## 与工作流集成

### 会话开始

CLAUDE.md 中已经提到在会话开始时检查 IDEAS.md。当 Claude 检查创意时：

1. 读取 IDEAS.md
2. 按状态统计创意数量
3. 报告：“X 个待处理创意，Y 个进行中，Z 个已完成”
4. 列出待处理的创意（标题和简要概念）
5. 询问用户要处理哪一个

### 创建新专辑

当用户说“让我们处理 [idea from IDEAS.md]”时：

1. 运行 `/bitwize-music:new-album [title] [genre]`
2. 创建专辑后，将创意状态更新为“进行中”
3. 告知用户：“专辑结构已创建。已更新 IDEAS.md 中的状态。”

### 完成专辑

当专辑 README 中的专辑状态更改为“已发行”时：

1. 将 IDEAS.md 中的创意状态更新为 "Complete"
2. 如果有发布日期，则添加发布日期
3. 此操作可以手动完成，也可以自动完成（由用户决定）

---

## 文件管理

### 创建新文件

如果 IDEAS.md 不存在：
1. 使用模板结构创建文件
2. 添加说明用法的欢迎注释
3. 报告："已在 [path] 创建 IDEAS.md"

### 修改前备份

在执行任何破坏性操作（删除、编辑）之前，如果文件位于仓库中，则由 git 进行备份；否则，用户应已有配置备份。

### 合并冲突

如果用户将 IDEAS.md 纳入 git 管理并遇到冲突：
- 需要手动解决
- 文件格式是人类可读的 markdown
- 每个创意都是独立的章节

---

## 最佳实践

### 何时添加创意

- 灵感突然出现时
- 用户提到“我想制作一张关于 X 的专辑”
- 集思广益构思多个概念时
- 在完全确定创建专辑之前

### 何时移至 In Progress

- 用户运行 `/bitwize-music:new-album`
- 专辑目录结构已创建
- 开始 7 个规划阶段

### 何时标记为 Complete

- 专辑已发布（专辑 README 中的 Status: Released）
- 或者当用户认为创意已完成时手动标记

### 保持创意活力

定期审查待处理的创意：
- 它们是否仍然有趣？
- 是否发现了新的灵感或来源？
- 是否已准备好开始处理其中某个创意？

---

## 请记住

1. **首先读取配置** - 调用 `get_config()` 获取 IDEAS 文件路径，或调用 `get_ideas()` 获取现有创意
2. **缺失时创建** - 如果文件不存在，则使用模板初始化
3. **状态跟踪** - Pending → In Progress → Complete
4. **集成点** - 会话开始时检查此文件
5. **不用于活跃专辑** - 专辑拥有目录后，在专辑 README 中跟踪状态
6. **尽量记录** - 写下创意总比忘记更好
7. **定期审查** - 帮助用户重新审视待办创意并确定优先级

**你的交付成果**：经过组织和跟踪，并能顺畅进入专辑创建工作流的专辑创意。