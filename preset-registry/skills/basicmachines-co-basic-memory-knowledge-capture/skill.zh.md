---
name: knowledge-capture
description: Capture the meaningful context of a Claude Code thread into a single coherent Basic Memory note. On subsequent invocations within the same thread (identified by the JSONL session UUID) the same note is rewritten, not appended.
---
# 知识捕获

将 Claude Code 线程的要点——所做的决策、浮现的见解以及形成的上下文——捕获到一篇连贯的 Basic Memory 笔记中，反映该线程最终形成的结论。

## 目的

一个线程有开端、过程和结尾。随着对话推进，情况会发生变化：早期决策可能被修订；获得新信息后，对问题的看法可能改变；某项权衡最终的处理方式也可能与最初设想不同。调用此技能时，应捕获**当前的理解状态**，而不是记录其演变过程。

如果在同一线程中多次调用此技能，则会重写**同一篇笔记**，使其始终保持连贯，而不是追加内容。最终结果从头到尾应当是一篇描述线程结论的完整文档；如果某项变化值得说明，则用简短的文字加以提及。

## 使用时机

通常应在**线程中段或末尾**使用，此时已经确定了足够多值得保留的内容。

在以下情况下使用此技能：
- 已经做出关键决策，不应在线程关闭后丢失
- 设计、调试或规划讨论已经产生了具体成果
- 用户明确要求捕获、保存或记住所讨论的内容
- 临近会话结束时，用于总结结果

随着对话不断演进，在同一线程中多次调用此技能是正常的，也是符合预期的。

## 同线程检测

每个 Claude Code 会话的转录文件名中都嵌入了一个稳定的 UUID。运行时通过 Bash 获取该 UUID——搜索所有项目目录，并选取最近修改的 jsonl 文件：

```bash
ls -t ~/.claude/projects/*/*.jsonl 2>/dev/null | head -1 | xargs basename | sed 's/\.jsonl$//'
```

活动会话会持续向其 jsonl 文件追加内容，因此它始终能可靠地成为最近修改的文件。文件名（不含扩展名）即为会话 UUID。将其用作笔记前置元数据中的 `thread_id`。

**注意：**此命令的早期版本使用 `pwd` 将范围限定在单个项目目录中，但当 shell 已通过 `cd` 进入 Claude Code 会话项目根目录下的子目录时，这种方式会失效。跨项目的 glob 更加稳健。

**边缘情况：**如果用户同时运行多个 Claude Code 会话，“最近修改”的文件可能会在这些会话之间切换。实践中这种情况很少见。

## 决策流程

1. 使用上述 Bash 命令**获取会话 UUID**。
2. **搜索 Basic Memory**，查找使用该 UUID 标记的现有笔记。使用 `metadata_filters`（而不是 `query`）——全文查询无法可靠匹配 YAML 前置元数据中的自定义字段：
   ```python
   mcp__basic-memory__search_notes(
       metadata_filters={"thread_id": "<session-uuid>"},
       project="<project>"
   )
   ```
3. **如果找到匹配项：**
   - 读取现有笔记（使用搜索返回的完整永久链接，例如 `bmem/development/basic-memory/...`）
   - 综合生成一个新版本，将对话中最新形成的理解整合进去
   - 通过 `write_note` 并设置 `overwrite=true` 进行覆盖（保持相同标题、相同 `thread_id` 和相同目录）
4. **如果未找到匹配项：**
   - 根据对话综合生成笔记
   - 向 `write_note` 传递 `metadata={"thread_id": "<session-uuid>"}`（它会作为自定义前置元数据字段显示）
   - 保存——由 `placement` 技能选择文件夹

## 综合规则

更新现有线程笔记时，**应综合整理，而不是追加内容**：

- 仍然有效的决策 → 保留，必要时加以完善
- 已被取代的决策 → 在原位置直接替换（新决策放在旧决策所在的位置）
- 值得解释的重大修订 → 将说明融入相关章节中的某个句子，*而不是*追加变更日志
- 过时的上下文 → 删除

目标：让笔记从上到下读起来像一份连贯统一的文档。即使读者从未看过对话，也应该能够仅通过笔记理解最终结果。底部不设置 `## Changes` 章节；修订内容应体现在与其相关的正文中。

## 例外处理

如果用户明确要求创建单独的笔记（例如，“capture this as a new note, don't merge with the existing thread note”），则跳过同线程查找，并创建一篇不设置 `thread_id` 的新笔记。这种情况很少见；默认行为是更新现有笔记。

## 笔记结构

```markdown
---
title: <descriptive title — placement skill may adjust naming convention>
type: note
thread_id: <session-uuid>
tags:
- relevant
- tags
---

# <Title>

## Context

What this thread is about — the situation, problem, or topic being explored.

## <One or more topical sections>

The actual content. Could be decisions, a design rationale, an investigation summary, etc.

## Observations

- [decision] What was decided #tag
- [insight] Key understanding gained #tag
- [tradeoff] Option A chosen over B because... #tag

## Relations

- relates-to [[Related Concept]]
- implements [[Parent Spec]]
```

## 常见观察类别

- `[decision]` — 已做出的选择
- `[insight]` — 获得的关键认识
- `[pattern]` — 可复用的方法
- `[learning]` — 吸取的经验
- `[tradeoff]` — 权衡过的选项
- `[problem]` — 发现的问题
- `[solution]` — 已应用的修复方案

## 标题

标题应反映线程的主题。更新时，如果主题已经更加明确，可以优化标题，但标题仍应描述同一个线程。不要偏移到一个全新的主题；如果确实需要这样做，请使用例外处理方式并创建一篇新笔记。

## 使用的 MCP 工具

```python
# Find existing thread note (use metadata_filters, not query)
mcp__basic-memory__search_notes(
    metadata_filters={"thread_id": "<session-uuid>"},
    project="<project>"
)

# Read existing thread note (use the full permalink from search results)
mcp__basic-memory__read_note(
    identifier="<full-permalink>",
    project="<project>",
    include_frontmatter=True
)

# Create
mcp__basic-memory__write_note(
    title="<title>",
    content="<markdown body — frontmatter is generated from title/tags/metadata>",
    directory="<folder>",
    tags=["..."],
    metadata={"thread_id": "<session-uuid>"},
    project="<project>"
)

# Overwrite an existing note (same path)
mcp__basic-memory__write_note(
    title="<same title>",
    content="<new content>",
    directory="<same folder>",
    tags=["..."],
    metadata={"thread_id": "<same session-uuid>"},
    overwrite=True,
    project="<project>"
)
```

`placement` skill 会在写入之前自动运行（通过 PreToolUse hook），以选择文件夹。

## 示例

### 示例 1 — 品牌设计对话中的首次捕获

**此前的对话：** 用户一直在为一款新产品梳理视觉识别方案。他们确定以深海军蓝（`#2B3651`）作为主色，探索了多种强调色方案并选择橙色（`#F26B3A`）来营造温暖感，还选择 Inter 作为正文字体，Helvetica Neue 作为展示字体。

**用户调用：** `/knowledge-capture`

**结果 — 创建笔记：**

```markdown
---
title: Visual identity — initial decisions
type: note
thread_id: 7c1d4a2e-3b5f-4d8a-9e1c-2f6b8a4d7c39
tags:
- branding
- design
---

# Visual identity — initial decisions

## Context

Working through the visual identity for the new product. This thread covers the initial palette and typography pass — a starting point that will likely be refined.

## Color palette

- Primary: deep navy `#2B3651` — calm and professional
- Accent: warm orange `#F26B3A` — energy and warmth as a complement to the navy

## Typography

- Body: Inter — neutral, readable at small sizes
- Display: Helvetica Neue — strong presence for headings without being heavy

## Observations

- [decision] Primary color is navy `#2B3651` #branding
- [decision] Accent color is orange `#F26B3A` #branding
- [decision] Inter for body, Helvetica Neue for display #typography
- [tradeoff] Considered teal as accent; orange tested better for warmth #branding

## Relations

- relates-to [[Brand Strategy]]
```

### 示例 2 — 稍后在同一 thread 中进行更新捕获

**此前的对话（续）：** 在做出上述初步决定后，对话继续进行。橙色强调色在模型图中显得过于强烈，因此我们测试了珊瑚色（`#E89B7A`），它看起来更温暖、更精致。正文字体也发生了变化：Geist 比 Inter 显得稍微更紧凑、更现代。展示字体仍然使用 Helvetica Neue。

**用户再次调用：** `/knowledge-capture` — 同一 thread。

**结果 — 重写同一篇笔记（注意 `thread_id` 相同）：**

```markdown
---
title: Visual identity — initial decisions
type: note
thread_id: 7c1d4a2e-3b5f-4d8a-9e1c-2f6b8a4d7c39
tags:
- branding
- design
---

# Visual identity — initial decisions

## Context

Working through the visual identity for the new product. This thread settled on a navy + coral palette and a Geist/Helvetica typography pairing after a round of refinement.

## Color palette

- Primary: deep navy `#2B3651` — calm and professional
- Accent: coral `#E89B7A` — warm and refined

The accent went through a round of revision: an initial orange (`#F26B3A`) felt too aggressive in mock-ups, so we shifted to a coral that reads warmer and more refined while keeping the energy.

## Typography

- Body: Geist — slightly tighter and more modern than Inter, which we tried first
- Display: Helvetica Neue — strong presence for headings without being heavy

## Observations

- [decision] Primary color is navy `#2B3651` #branding
- [decision] Accent color is coral `#E89B7A` — warmer and more refined than the originally-chosen orange #branding
- [decision] Geist for body, Helvetica Neue for display #typography
- [tradeoff] Inter felt neutral but Geist edged it for spacing and modernity #typography
- [tradeoff] Orange accent rejected as too aggressive; coral preferred #branding

## Relations

- relates-to [[Brand Strategy]]
```

请注意：
- 关于橙色和 Inter 的决策**不再是主要内容**——它们仅在正文（“我们最先尝试了这种方案”“最初选择的橙色”）和对权衡的观察中被提及
- 底部**没有“变更”部分**——修订内容已整合到其所属位置
- 该笔记从上到下读起来仍然是一份连贯统一的文档
- `thread_id` 保持不变，因此该笔记是在原处更新，而不是创建了副本

## 最佳实践

1. **记录当前状态，而非历史过程。** 笔记代表该线程最终达成的状态。
2. **进行综合整理，而不是记录流水账。** 每次调用都会生成一份连贯的文档，而不是不断累积的记录。
3. **用简短正文说明修订。** 在发生变更的部分添加一句话就足够了——不要添加变更日志。
4. **始终执行同线程查找**，然后再决定是创建还是更新。
5. **使用观察项作为结构化层。** 将决策、见解和权衡放在 `## Observations` 中，以便搜索。
6. **充分链接关联关系。** 链接用户可能希望从当前笔记跳转访问的其他笔记。