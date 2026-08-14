---
name: memory-capture
description: "Capture the current state of a working thread or conversation into a single coherent Basic Memory note — synthesize where it landed, don't append a log. On re-capture, rewrite the same note in place instead of duplicating. Use mid-thread or end-of-thread when decisions, insights, or context are worth preserving."
---
# 记忆捕获

将一个工作线程的要点——所做的决策、浮现的洞见以及形成的上下文——捕获到一篇连贯的 Basic Memory 笔记中，以反映该线程最终达成的状态。

## 目的

一个线程有开端、过程和结尾。随着对话推进，事情会发生变化：早期的决策可能被修订，新的信息可能让问题呈现出不同面貌，对权衡取舍的最终处理方式也可能与最初设想不同。调用此技能时，应捕获**当前的理解状态**，而不是记录其演变历史。

如果在同一线程中多次调用此技能，则会**重写同一篇笔记**，使其始终保持连贯，而不是在其后追加内容。最终结果应当从头到尾都像一篇描述线程成果的完整文档；当某项重要变化值得说明时，可以用简短的文字予以交代。

## 何时使用

通常应在**线程进行到中途或接近结束时**使用，此时已经确定了足够多值得保留的内容。

在以下情况下使用此技能：
- 已经做出关键决策，不应在线程关闭后让其消失
- 设计、调试或规划讨论已经产生了具体成果
- 用户明确要求捕获、保存或记住所讨论的内容
- 在会话接近结束时总结成果

随着对话不断发展，在同一线程中多次调用此技能是合理的，也是预期行为。

## 同一线程检测

为了在重新捕获时重写同一篇笔记而不是创建重复内容，请在笔记的 frontmatter 中使用稳定的 `thread_id` 作为标识。

**如果你的智能体提供稳定的会话或线程 ID**，请将其存储为 `thread_id`，以便同一线程内的后续捕获操作能够找到并重写同一篇笔记。任何在线程持续期间保持不变的值都可以使用——例如会话 UUID、对话 ID，或限定当前工作范围的工单编号。

> **示例（使用 JSONL 转录记录的宿主）：**某些智能体会为每个会话写入一份转录记录，其文件名是稳定的会话 UUID。如果你的智能体如此，你可以从最近修改的转录文件中获取该 ID，并将其用作 `thread_id`。这是可选操作——仅当你的宿主确实提供此类转录记录时才这样做。

**如果没有可用的稳定 ID**，则改为按标题/主题匹配现有笔记：搜索涵盖同一线程的笔记（`search_notes(query="<topic>")`），如果找到了该线程先前生成的笔记，就重写它。省略 `thread_id`，并依靠一致的标题进行匹配。

## 决策流程

1. **确定线程键。**如果你的智能体提供稳定的会话/线程 ID，请使用它；否则，准备按标题/主题进行匹配。
2. **在 Basic Memory 中搜索**现有的线程笔记。
   - 如果有线程 ID，请使用 `metadata_filters`（而不是 `query`）——全文查询无法可靠匹配 YAML frontmatter 中的自定义字段：
     ```python
     search_notes(
         metadata_filters={"thread_id": "<thread-id>"},
         project="<project>"
     )
     ```
   - 如果没有线程 ID，则按主题搜索，并识别出此线程先前生成的笔记：
     ```python
     search_notes(query="<thread topic>", project="<project>")
     ```
3. **如果找到匹配项：**
   - 读取现有笔记（使用搜索返回的完整永久链接）
   - 综合生成一个新版本，将对话中最新形成的理解整合进去
   - 通过 `write_note` 并设置 `overwrite=True` 进行覆盖（保持相同标题、相同 `thread_id`〔如果使用〕以及相同目录）
4. **如果未找到匹配项：**
   - 根据对话综合生成笔记
   - 如果有线程 ID，请将 `metadata={"thread_id": "<thread-id>"}` 传给 `write_note`（它会显示为自定义 frontmatter 字段）
   - 保存笔记

## 综合规则

更新现有线程笔记时，**应综合整理，而不是追加内容**：

- 仍然有效的决策 → 保留，并可适当完善
- 已被取代的决策 → 在原位置直接替换（新决策放在旧决策所在的位置）
- 值得解释的重大修订 → 将说明融入相关章节中的一句话，*不要*追加变更日志
- 过时的上下文 → 删除

目标：让笔记从上到下读起来像一篇连贯统一的文档。即使读者从未看过对话，也应能仅通过笔记理解最终结果。底部不设置 `## Changes` 章节；修订内容应体现在与其相关的正文中。

## 例外机制

如果用户明确要求创建单独的笔记（例如，“capture this as a new note, don't merge with the existing thread note”），则跳过同线程查找，并创建一篇不设置 `thread_id` 的新笔记。这种情况很少见；默认行为是更新现有笔记。

## 笔记结构

```markdown
---
title: <descriptive title for the thread>
type: note
thread_id: <thread-id, if your agent exposes one>
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

- relates_to [[Related Concept]]
- implements [[Parent Spec]]
```

## 常用观察类别

- `[decision]` — 已做出的选择
- `[insight]` — 获得的关键认识
- `[pattern]` — 可复用的方法
- `[learning]` — 得到的经验教训
- `[tradeoff]` — 权衡过的选项
- `[problem]` — 识别出的问题
- `[solution]` — 已应用的解决方案

## 标题

标题应反映线程的主题。更新时，如果主题变得更加明确，可以优化标题，但标题仍应描述同一个线程。不要偏移到完全不同的新主题；如果确有需要，请使用例外机制创建新笔记。

## 使用的 MCP 工具

```python
# Find existing thread note by thread id (use metadata_filters, not query)
search_notes(
    metadata_filters={"thread_id": "<thread-id>"},
    project="<project>"
)

# Or, without a thread id, find it by topic
search_notes(query="<thread topic>", project="<project>")

# Read existing thread note (use the full permalink from search results)
read_note(
    identifier="<full-permalink>",
    project="<project>"
)

# Create
write_note(
    title="<title>",
    content="<markdown body — frontmatter is generated from title/tags/metadata>",
    directory="<folder>",
    tags=["..."],
    metadata={"thread_id": "<thread-id>"},  # omit if no stable id
    project="<project>"
)

# Overwrite an existing note (same path)
write_note(
    title="<same title>",
    content="<new content>",
    directory="<same folder>",
    tags=["..."],
    metadata={"thread_id": "<same thread-id>"},  # omit if no stable id
    overwrite=True,
    project="<project>"
)
```

## 示例

### 示例 1 — 品牌设计对话中的首次捕获

**此前的对话：** 用户一直在为一款新产品梳理视觉识别方案。他们确定以深海军蓝（`#2B3651`）为主色，探索了多种强调色方案并选择橙色（`#F26B3A`）来营造温暖感，同时选用 Inter 作为正文字体、Helvetica Neue 作为展示字体。

**用户要求捕获。**

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

- relates_to [[Brand Strategy]]
```

### 示例 2 — 稍后在同一线程中更新捕获

**此前的对话（续）：** 在做出上述初步决定后，对话继续进行。橙色强调色在模型中显得过于强烈，因此我们测试了珊瑚色（`#E89B7A`），它呈现出更温暖、更精致的效果。正文字体也有所调整：Geist 比 Inter 感觉略显紧凑，也更加现代。展示字体仍然使用 Helvetica Neue。

**用户再次要求捕获 — 同一线程。**

**结果 — 重写同一篇笔记（注意 `thread_id` 保持不变）：**

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

- relates_to [[Brand Strategy]]
```

请注意：
- 橙色和 Inter 字体相关的决策**不再是主要内容**——它们仅在正文（“我们最先尝试的方案”“最初选择的橙色”）和权衡取舍类观察中被提及
- 底部**没有“更改”部分**——修订内容已整合到其所属位置
- 该笔记自上而下阅读时，仍是一份连贯统一的文档
- `thread_id` 保持不变，因此该笔记是在原处更新的，而不是创建了副本

## 最佳实践

1. **记录当前状态，而非历史过程。** 笔记代表该线程最终得出的结果。
2. **进行综合整理，而不是简单记录。** 每次调用都应生成一份连贯的文档，而不是不断累积的记录。
3. **用简短正文说明修订。** 在发生变化的部分添加一句话就足够了——不要添加变更日志。
4. **始终执行同线程查找**，然后再决定是创建还是更新。
5. **使用观察作为结构化层。** 将决策、见解和权衡取舍放入 `## Observations`，以便搜索。
6. **广泛链接相关关系。** 链接用户可能希望从当前笔记跳转访问的笔记。