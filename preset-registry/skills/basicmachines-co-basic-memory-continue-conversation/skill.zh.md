---
name: continue-conversation
description: Resume previous work by building context from Basic Memory knowledge graph using memory URLs and recent activity
---
# 继续对话

此技能通过从 Basic Memory 知识图谱中构建上下文，帮助你恢复之前的工作，从而实现跨会话的无缝衔接。

## 何时使用

在以下情况下使用此技能：
- 开始新会话，需要从上次中断的地方继续
- 用户提到之前的工作（“继续……”“回到……”“我们之前在……方面进展到哪里了”）
- 需要了解正在进行的项目或规范的上下文
- 用户询问之前对话中讨论过的内容
- 处理跨多个会话的任务

## 构建上下文

### 1. 确定要继续的内容

如果不清楚，请询问：
- 要恢复哪个主题或项目？
- 要查看哪个时间范围？
- 是否有需要重点关注的具体方面？

### 2. 使用 MCP 工具收集上下文

**选项 A：已知主题——使用 build_context**

```python
# Navigate knowledge graph from a known starting point
mcp__basic-memory__build_context(
    url="memory://topic-or-note-name",
    depth=2,           # How many relation hops to follow
    timeframe="7d",    # Recent changes
    project="main"     # or "specs" for specifications
)
```

Memory URL 格式：
- `memory://note-title` - 单条笔记
- `memory://folder/*` - 文件夹中的所有笔记
- `memory://specs/SPEC-24*` - 模式匹配

**选项 B：近期活动——最近发生了什么？**

```python
# See what's changed recently
mcp__basic-memory__recent_activity(
    timeframe="3d",    # "1d", "1 week", "2 weeks"
    depth=1,
    project="main"
)
```

**选项 C：搜索上下文**

```python
# Find relevant notes
mcp__basic-memory__search_notes(
    query="search terms",
    page_size=10,
    project="main"
)
```

### 3. 阅读关键笔记

确定相关笔记后：

```python
mcp__basic-memory__read_note(
    identifier="note-title-or-permalink",
    project="main"
)
```

### 4. 向用户呈现上下文

总结你找到的内容：
- 工作的当前状态
- 最近的变更或进展
- 待处理事项或后续步骤
- 可能有帮助的相关上下文

## 不同场景下的上下文策略

### 恢复规范实现工作

```python
# 1. Read the spec
mcp__basic-memory__read_note(
    identifier="SPEC-24: Postgres Database Migration",
    project="specs"
)

# 2. Check recent activity on related topics
mcp__basic-memory__build_context(
    url="memory://SPEC-24*",
    timeframe="7d",
    project="specs"
)

# 3. Look at what's been done in the codebase
# (Use regular file tools for this)
```

### 继续常规工作

```python
# 1. Check recent activity across projects
mcp__basic-memory__recent_activity(
    timeframe="3d",
    project="main"
)

# 2. Read any notes from recent sessions
mcp__basic-memory__read_note(
    identifier="relevant-note",
    project="main"
)
```

### 跟进某个主题

```python
# 1. Search for the topic
mcp__basic-memory__search_notes(
    query="topic keywords",
    project="main"
)

# 2. Build context from best match
mcp__basic-memory__build_context(
    url="memory://found-note-permalink",
    depth=2,
    project="main"
)
```

## 时间范围参考

自然语言时间范围：
- `"today"` - 当天
- `"yesterday"` - 前一天
- `"3d"` 或 `"3 days"` - 最近 3 天
- `"1 week"` 或 `"7d"` - 最近一周
- `"2 weeks"` - 最近 2 周
- `"1 month"` - 最近一个月

## 项目参考

项目名称因用户而异。要查看可用的项目：

```python
mcp__basic-memory__list_memory_projects()
```

如果已配置，路由规则（何时使用哪个项目）位于 `~/.basic-memory/basic-memory.md` 的 `## Projects` 中。

## 对话示例

### 用户：“让我们继续进行 Postgres 迁移”

```
1. Read SPEC-24 from specs project
2. Check for related notes about implementation progress
3. Summarize:
   - Spec overview and goals
   - What's been completed (checkmarks)
   - What's pending (checkboxes)
   - Any blockers or decisions needed
```

### 用户：“我昨天在做什么？”

```
1. Get recent activity for last 2 days
2. List modified notes with brief descriptions
3. Ask which topic to dive into
```

### 用户：“回到异步客户端模式”

```
1. Search for "async client pattern"
2. Build context from matching note
3. Include related notes via relations
4. Present the full picture
```

## 最佳实践

1. **先宽泛，再聚焦** - 先获取概览，再查看具体细节
2. **沿着关联探索** - 知识图谱中的连接很有价值
3. **检查多个项目** - 规范可能与实现笔记分属不同项目
4. **逐步呈现** - 边查找边分享发现的内容
5. **确认理解** - 验证上下文是否符合用户需求
6. **随时更新** - 在会话期间将新的进展记录到笔记中

## 与其他 Skill 结合使用

构建上下文后，你可以：
- 使用 **knowledge-capture** 记录新的进展
- 创建链接到所收集上下文的新笔记