---
name: memory-reflect
description: "Sleep-time memory reflection: review recent conversations and daily notes, extract insights, and consolidate into long-term memory. Use when triggered by cron, heartbeat, or explicit request to reflect on recent activity. Runs as background processing to improve memory quality over time."
---
# 记忆反思

回顾近期活动，并将有价值的洞见整合到长期记忆中。

灵感来自睡眠时计算——即记忆最好形成于活跃会话*之间*，而不是会话进行期间。

## 运行时机

- **Cron/heartbeat**：安排为定期后台任务（建议：每天 1-2 次）
- **按需运行**：用户要求反思、整合或回顾近期记忆时
- **压缩后**：上下文窗口压缩事件发生后

## 流程

### 1. 收集近期材料

找出最近发生变化的内容，然后读取相关文件：

```python
# Find recently modified notes — use json format for the complete list
# (text format truncates to ~5 items in the summary)
recent_activity(timeframe="2d", output_format="json")

# Read specific daily notes
read_note(identifier="memory/2026-02-27")
read_note(identifier="memory/2026-02-26")

# Check active tasks
search_notes(note_types=["task"], status="active")
```

### 2. 评估哪些内容重要

对于每条信息，逐一判断：
- 这是会影响未来工作的**决策**吗？→ 保留
- 这是**经验教训**或需要避免的错误吗？→ 保留
- 这是**偏好**或工作方式方面的洞见吗？→ 保留
- 这是**关系**信息（谁负责什么、联系信息）吗？→ 保留
- 这是**临时性**信息（查询过的天气、已运行的 heartbeat、例行任务）吗？→ 跳过
- 这是否**已经记录**在 `MEMORY.md` 或其他长期文件中？→ 跳过

### 3. 更新长期记忆

按照 `MEMORY.md` 现有的结构，将整合后的洞见写入其中：
- 添加新章节或更新现有章节
- 使用简洁、客观的语言
- 包含日期，以提供时间背景
- 删除或更新已被新信息取代的过时条目

### 4. 记录反思

在今天的每日笔记末尾追加一条简短记录：
```markdown
## Reflection (HH:MM)
- Reviewed: [list of files reviewed]
- Added to MEMORY.md: [brief summary of what was consolidated]
- Removed/updated: [anything cleaned up]
```

## 指南

- **有所取舍。** 目标是提炼，而不是重复。`MEMORY.md` 应当是经过整理的智慧结晶，而不是每日笔记的副本。
- **保持表达风格。** 如果代理具有个性或灵魂文件，反思内容应与其风格一致。
- **不要删除每日笔记。** 它们是原始记录。反思是从中提取内容，而不是取代它们。
- **合并，而非追加。** 如果 `MEMORY.md` 中已经有关于某个主题的章节，请在原位置更新，而不是添加重复条目。
- **标记不确定性。** 如果某项内容看起来很重要，但你无法确定，请添加类似“（需要确认）”的说明，而不是完全跳过。
- **随时间推移重构。** 如果 `MEMORY.md` 只是按时间顺序堆积的内容，请在反思过程中将其重构为按主题组织的章节。经过整理的知识 > 原始日志。
- **检查文件系统问题。** 收集材料时，检查是否存在递归嵌套（`memory/memory/memory/...`）、孤立文件或内容膨胀。