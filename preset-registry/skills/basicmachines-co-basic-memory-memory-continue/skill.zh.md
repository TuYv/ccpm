---
name: memory-continue
description: "Resume prior work by rebuilding context from the Basic Memory knowledge graph — pick up where you left off using memory:// URLs, recent activity, and search. Use when starting a session or when the user says 'continue with...', 'back to...', or 'where were we?'"
---
# 记忆续接

通过从 Basic Memory 知识图谱中重建上下文来恢复之前的工作，使助手能够跨会话继续推进，而不是每次都从零开始。

## 何时使用

- 开始新会话，并且需要从上次中断的地方继续
- 用户提到之前的工作：“继续……”“回到……”“我们在……方面进展到哪里了？”
- 你需要了解某个进行中的项目或规范的上下文
- 用户询问之前对话中讨论过的内容
- 你正在处理一项跨多个会话的任务

## 构建上下文

### 1. 确定要继续的内容

如果不清楚，请询问：
- 应该恢复哪个主题或项目？
- 需要关注哪个时间范围？
- 是否有需要重点关注的具体方面？

### 2. 使用 MCP 工具收集上下文

**主题已知——使用 `build_context`。** 从一个起点开始浏览图谱，沿关联关系向外查找：

```python
build_context(
    url="memory://topic-or-note-name",
    depth=2,           # how many relation hops to follow
    timeframe="7d",    # bias toward recent changes
)
```

**没有明确的起点——使用 `recent_activity`。** 查看发生了哪些变化，让相关工作脉络自然浮现：

```python
recent_activity(timeframe="3d", depth=1)
```

**查找特定内容——使用 `search_notes`。** 按关键词查找候选笔记：

```python
search_notes(query="async client refactor", page_size=10)
```

### 3. 阅读关键笔记

确定相关笔记后，完整阅读它们：

```python
read_note(identifier="note-title-or-permalink")
```

### 4. 向用户呈现上下文

逐步总结你找到的内容：
- 工作的当前状态
- 最近的变更或进展
- 未完成事项和后续步骤
- 可能有帮助的相关上下文

## Memory URL 参考

`build_context` 和 `read_note` 都接受 `memory://` URL。此类 URL 通过永久链接定位笔记，并支持使用通配符收集笔记组。

```
memory://note-title            # a single note by permalink
memory://folder/*              # all notes in a folder
memory://specs/SPEC-24*        # pattern / prefix match
memory://project/*/requirements # path wildcards
```

使用特定的笔记 URL 锚定一个起点；使用通配符可一次获取整个文件夹或一组相关笔记。

## 时间范围参考

`build_context` 和 `recent_activity` 接受自然语言形式的时间范围：

| 时间范围 | 含义 |
|-----------|---------|
| `"today"` | 当天 |
| `"yesterday"` | 前一天 |
| `"3d"` or `"3 days"` | 最近 3 天 |
| `"1 week"` or `"7d"` | 最近一周 |
| `"2 weeks"` | 最近两周 |
| `"1 month"` | 最近一个月 |

## 场景操作指南

### 恢复规范或项目工作

```python
# 1. Read the spec / project note
read_note(identifier="SPEC-24: Postgres Database Migration")

# 2. Pull in related context and recent changes via the graph
build_context(url="memory://SPEC-24*", timeframe="7d")
```

然后总结：目标、已完成的内容、待完成的内容，以及任何阻碍因素或尚未解决的决策。

### 继续常规工作

```python
# 1. Check recent activity
recent_activity(timeframe="3d")

# 2. Read notes from the recent sessions it surfaces
read_note(identifier="relevant-note")
```

然后列出已修改的笔记及其简短说明，并询问要深入了解哪条工作线索。

### 跟进某个主题

```python
# 1. Find the topic
search_notes(query="topic keywords")

# 2. Build context from the best match, following its relations
build_context(url="memory://found-note-permalink", depth=2)
```

然后呈现完整情况——该笔记及其关联上下文。

## 项目发现

项目名称因用户而异。在限定搜索范围或构造 `memory://` URL 之前，可通过以下方式发现可用项目：

```python
list_memory_projects()
```

在多项目配置中，可在 `memory://` URL 前加上项目名称（例如 `memory://research/papers/crdt`）以限定范围。

## 指南

1. **先宽泛，再收窄。** 使用 `recent_activity` 或通配符 `build_context` 获取概览，然后深入查看具体笔记。
2. **逐步呈现。** 随着查找的进行分享发现，而不是把所有内容留到最后再一次性呈现。
3. **沿关联探索。** 图谱中的连接才是关键——带有 `depth` 的 `build_context` 能呈现仅阅读一篇笔记时无法发现的上下文。
4. **检查多个项目。** 规范可能与实现笔记分开存放；使用 `list_memory_projects` 发现项目。
5. **确认理解。** 在据此采取行动之前，确认重建出的上下文确实是用户所需要的。
6. **记录新进展。** 随着恢复后的工作不断推进，将进展写回图谱（参见 **memory-notes** 技能），以便下次会话也能继续。