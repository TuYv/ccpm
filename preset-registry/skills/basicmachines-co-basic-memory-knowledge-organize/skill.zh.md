---
name: knowledge-organize
description: Help organize, link, and maintain the Basic Memory knowledge graph - find orphan notes, suggest relations, identify duplicates, and improve overall knowledge structure
---
# 知识整理

此技能帮助用户维护一个健康、连接良好的知识图谱。随着笔记不断积累，定期整理、关联和维护知识库会变得很有价值。

## 何时使用

在以下情况下使用此技能：
- 用户要求整理笔记
- 用户希望查找笔记之间的联系
- 用户提到孤立或未关联的笔记
- 用户希望清理或改进知识库
- 用户询问重复或相似的笔记
- 用户希望获得文件夹组织方面的帮助
- 用户要求审查或检查其笔记
- 出现类似“帮我整理”“查找相关笔记”“哪些内容没有关联”“清理我的笔记”等表述

## 整理能力

### 1. 查找孤立笔记

识别与其他笔记没有任何关系的笔记——它们在知识图谱中处于孤立状态。

```python
# Get all notes
mcp__basic-memory__search_notes(
    query="*",
    page_size=50,
    project="main"
)

# For each note, check if it has relations
# Orphans have empty Relations sections
```

**孤立笔记的处理方式：**
- 根据内容相似性建议潜在关系
- 询问是否应将其关联到现有主题
- 建议创建中心笔记来连接相关的孤立笔记

### 2. 建议关系

分析笔记内容并建议有意义的关联。

```python
# Read a note
mcp__basic-memory__read_note(
    identifier="note-to-analyze",
    project="main"
)

# Search for potentially related notes
mcp__basic-memory__search_notes(
    query="key terms from the note",
    project="main"
)

# Suggest relations based on:
# - Shared topics or concepts
# - Complementary content (problem/solution, question/answer)
# - Sequential relationship (part 1, part 2)
# - Hierarchical (parent concept, child detail)
```

**可建议的关系类型：**
- `relates-to` - 一般性的主题关联
- `extends` - 基于某内容进一步构建或扩展
- `implements` - 实现某个概念
- `depends-on` - 需要以理解某内容为前提
- `contradicts` - 提出不同观点
- `learned-from` - 洞见的来源
- `enables` - 使某件事成为可能

### 3. 识别相似/重复笔记

查找可能涵盖相同主题的笔记。

```python
# Search for notes with similar titles or content
mcp__basic-memory__search_notes(
    query="topic keywords",
    project="main"
)

# Compare results for overlap
# Look for:
# - Similar titles
# - Overlapping observations
# - Same tags
# - Related timestamps (created around same time)
```

**重复笔记的处理方式：**
- 合并成一篇全面的笔记
- 使用 `supersedes` 或 `updates` 关系将它们关联起来
- 添加关于各自不同侧重点的上下文，以区分这些笔记

### 4. 文件夹组织审查

分析文件夹结构并提出改进建议。

```python
# List directory structure
mcp__basic-memory__list_directory(
    dir_name="/",
    depth=3,
    project="main"
)

# Identify:
# - Overcrowded folders
# - Single-note folders
# - Inconsistent naming
# - Notes that might belong elsewhere
```

**组织建议：**
- 将相关笔记归入主题文件夹
- 为大型类别创建子文件夹
- 建议采用一致的命名约定
- 移动放置位置不当的笔记

### 5. 标签一致性

检查并规范笔记中的标签。

```python
# Search notes to analyze tag patterns
mcp__basic-memory__search_notes(
    query="*",
    page_size=100,
    project="main"
)

# Look for:
# - Similar tags (architecture vs arch)
# - Unused tags
# - Over-used generic tags
# - Missing tags on relevant notes
```

**标签改进：**
- 建议统一标签（选择一种变体）
- 为常见主题提出新标签
- 找出缺少明显标签的笔记

### 6. 创建索引/枢纽笔记

生成作为相关主题导航枢纽的笔记。

```python
# After identifying a cluster of related notes
mcp__basic-memory__write_note(
    title="Architecture Decisions Index",
    content="""---
title: Architecture Decisions Index
type: index
tags:
- architecture
- index
---

# Architecture Decisions Index

A hub linking all architecture-related decisions and patterns.

## Decisions

- [[Database Selection Decision]]
- [[API Design Patterns]]
- [[Authentication Architecture]]

## Patterns

- [[Repository Pattern]]
- [[Async Client Pattern]]

## Observations

- [index] Central hub for architecture knowledge #navigation

## Relations

- indexes [[Architecture]]
""",
    folder="indexes",
    project="main"
)
```

### 7. 丰富内容稀疏的笔记

查找缺少观察记录或结构的笔记，并提出改进建议。

```python
# Read a sparse note
mcp__basic-memory__read_note(
    identifier="sparse-note",
    project="main"
)

# If missing:
# - Observations section → suggest categories
# - Relations section → suggest links
# - Tags → suggest relevant tags
# - Context → suggest adding background
```

## 整理工作流

### 快速健康检查

快速了解知识库的状态：

1. 统计笔记总数
2. 确定孤立笔记数量
3. 列出最近修改的笔记
4. 检查明显的重复内容
5. 报告文件夹分布情况

### 深度整理会话

全面检查并改进：

1. **审计阶段** - 对所有笔记进行编目并找出问题
2. **孤立笔记阶段** - 处理没有链接的笔记
3. **关系阶段** - 建议新的关联
4. **重复内容阶段** - 合并相似笔记或明确区分它们
5. **结构阶段** - 必要时重新整理文件夹
6. **索引阶段** - 为主要主题创建枢纽笔记

### 聚焦主题的整理

围绕特定主题进行整理：

1. 查找与该主题相关的所有笔记
2. 梳理现有关系
3. 找出主题图谱中的空缺
4. 建议创建新笔记以填补空缺
5. 创建主题索引笔记

## 最佳实践

1. **逐步进行** - 不要一次性重新整理所有内容
2. **更改前确认** - 移动或编辑笔记前始终先询问
3. **保留永久链接** - 可以移动笔记，但更改永久链接会破坏链接
4. **展示图谱** - 帮助用户直观了解各项内容之间的联系
5. **解释建议** - 说明某个关联为何合理
6. **尊重用户的体系** - 改进用户现有的组织方式，而不是强加一套新体系

## 对话示例

**用户：**“帮我整理笔记”

**Claude：**
1. 对知识库运行健康检查
2. 报告：“你有 47 篇笔记。我发现了 12 篇孤立笔记和 3 组可能重复的笔记。”
3. 询问：“你想先为孤立笔记建立关联，还是先检查重复笔记？”

**用户：**“查找应该链接到我的 API 设计笔记的其他笔记”

**Claude：**
1. 阅读该 API 设计笔记
2. 搜索相关内容
3. 建议：“我找到了 5 条可能相关的笔记：
   - ‘REST 最佳实践’ → relates-to
   - ‘身份验证流程’ → implements
   - ‘速率限制决策’ → extends
   你希望我添加其中的任何关系吗？”

**用户：**“有没有主题相似的笔记？”

**Claude：**
1. 分析笔记标题和内容
2. 识别相似笔记的聚类
3. 报告：“我发现了这些可能重叠的内容：
   - ‘身份验证流程’和‘身份验证设计’涵盖了相似的内容
   - ‘数据库架构 v1’和‘数据库架构 v2’之间可能需要添加一个‘supersedes’关系
   你想查看其中的任何一项吗？”