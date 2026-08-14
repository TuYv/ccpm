---
name: memory-curate
description: "Curate the Basic Memory knowledge graph: find orphan notes and suggest links, propose typed relations, merge duplicates, audit tags and folders, and build hub notes. Use to organize, connect, and improve a knowledge base as notes accumulate."
---
# 记忆整理

维护一个健康、连接良好的知识图谱。随着笔记不断积累，定期组织、关联和整理知识库很有必要，这样可以让孤立的笔记形成一个相互连接的图谱。

此技能用于整理**知识图谱**——构成知识库的笔记、关系和标签。（如需维护智能体自身的记忆*文件*——拆分臃肿文件、清理过时条目——请参阅 **memory-defrag**。）

## 何时使用

- 被要求组织、清理或改进知识库
- 被要求查找笔记之间的联系，或找出尚未建立链接的内容
- 提到孤立或未链接的笔记
- 被要求处理重复或相似的笔记
- 被要求协助进行文件夹组织或统一标签
- 出现“帮我整理”“查找相关笔记”“哪些内容尚未链接”“清理我的笔记”等表述

## 整理能力

### 1. 查找孤立笔记

孤立笔记与其他笔记之间没有任何关系——它们是图谱中的孤岛。

```python
# List notes, then read each to inspect its Relations section
search_notes(query="*", page_size=50)
read_note(identifier="note-to-check")
# Orphans have an empty (or missing) Relations section
```

**如何处理孤立笔记：**
- 根据内容相似性建议关系
- 询问它们是否应该与现有主题建立连接
- 提议创建中心笔记来汇集相关的孤立笔记（参见能力 6）

### 2. 建议带类型的关系

分析笔记内容，并提出有意义的连接建议。

```python
read_note(identifier="note-to-analyze")
# Pull out key terms, then search for related notes
search_notes(query="key terms from the note")
```

根据共同主题、互补内容（问题/解决方案、问题/答案）、顺序（第 1 部分 → 第 2 部分）或层级（父概念 → 细节）来建议关系。

**关系类型词汇：**
- `relates_to` — 一般性的主题关联
- `extends` — 在其基础上构建或进行详细阐述
- `implements` — 实现某个概念或规范
- `depends_on` — 需要先理解
- `part_of` — 层级或组成关系
- `contrasts_with` — 提出另一种观点
- `inspired_by` — 灵感来源
- `enables` — 使某事成为可能

也可以使用自定义关系类型——使用任何能够准确描述关系的动词即可。

使用 `edit_note` 添加已确认的关系：

```python
edit_note(
    identifier="API Design Decisions",
    operation="append",
    section="Relations",
    content="- depends_on [[Rate Limiter]]",
)
```

### 3. 识别相似/重复笔记

查找可能涵盖相同内容的笔记。

```python
search_notes(query="topic keywords")
# Compare results for: similar titles, overlapping observations,
# shared tags, close-together timestamps
```

**重复笔记的处理方式：**
- **合并**为一篇内容完整的笔记，然后通过关系将被合并的笔记重定向到该笔记
- 当一篇笔记修订了另一篇笔记时，使用 `supersedes` / `updates` 建立链接
- 通过添加上下文来明确每篇笔记各自的侧重点，从而**区分**它们

```python
# Point an older note at the one that replaces it
edit_note(
    identifier="DB Schema v1",
    operation="append",
    section="Relations",
    content="- updates [[DB Schema v2]]",
)
```

### 4. 文件夹组织审查

```python
list_directory(dir_name="/", depth=3)
```

查找内容过多的文件夹、仅含单篇笔记的文件夹、命名不一致的情况，以及本应归入其他位置的笔记。建议将相关笔记归入主题文件夹，为大型类别添加子文件夹，并采用一致的命名规范。使用 `move_note` 移动位置不当的笔记——永久链接会保持稳定，因此 Wiki 链接仍可正常解析。

```python
move_note(
    identifier="API Design Decisions",
    destination_path="architecture/api-design-decisions.md",
)
```

### 5. 标签一致性

```python
search_notes(query="*", page_size=100)
# Inspect tag patterns across results
```

查找：
- **标签变体** — `architecture` 与 `arch`；选择一个并统一使用
- **未使用的标签** — 仅出现在一篇笔记中，已不再具有实际作用
- **过度使用的通用标签** — 范围过于宽泛，无法帮助发现内容
- **缺失的标签** — 相关笔记缺少明显应有的标签

### 6. 创建索引／枢纽笔记

找到一组相关笔记后，构建一个导航枢纽。

```python
write_note(
    title="Architecture Decisions Index",
    directory="indexes",
    tags=["architecture", "index"],
    note_type="index",
    content="""# Architecture Decisions Index

A hub linking architecture-related decisions and patterns.

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
- indexes [[Architecture]]""",
)
```

### 7. 充实内容稀疏的笔记

查找缺乏结构的笔记并补充完善。

```python
read_note(identifier="sparse-note")
```

如果笔记缺少 Observations 部分，请建议可用的类别。如果没有 Relations，请建议相关链接。如果没有标签，请建议相关标签。如果缺乏上下文，请建议添加背景信息。使用 `edit_note` 应用更改。

## 整理工作流

### 快速健康检查

快速了解知识库的状态：

1. 统计笔记总数
2. 确定孤立笔记数量
3. 列出最近修改的笔记（`recent_activity`）
4. 检查明显的重复内容
5. 报告文件夹分布情况

### 深度组织会话

全面审查并改进：

1. **审计** — 为所有笔记编目并找出问题
2. **孤立笔记** — 处理没有链接的笔记
3. **关系** — 建议新的关联
4. **重复内容** — 合并相似笔记或明确其差异
5. **结构** — 必要时重新组织文件夹
6. **索引** — 为主要主题创建枢纽笔记

### 以主题为中心的组织

围绕特定主题进行组织：

1. 查找与该主题相关的所有笔记（`search_notes`）
2. 使用 `build_context(url="memory://...")` 映射现有关系
3. 找出主题图谱中的空白
4. 建议创建新笔记以填补空白
5. 创建主题索引笔记

## 最佳实践

1. **循序渐进。** 不要一次性重新组织所有内容。
2. **更改前确认。** 在移动、合并或编辑笔记之前，始终先征得同意。
3. **保留永久链接。** 移动笔记没有问题；更改其永久链接会破坏入站链接。
4. **解释建议。** 说明某项关联或合并建议*为何*合理。
5. **尊重现有体系。** 改进用户的组织方式——不要强加新的分类体系。
6. **展示图谱。** 使用 `build_context` 帮助用户了解笔记之间如何相互关联。

## 对话示例

**用户：**“帮我整理笔记”

助手：
1. 对知识库运行健康检查
2. 报告：“你有 47 条笔记。我发现了 12 条孤立笔记和 3 组潜在重复笔记。”
3. 询问：“想先关联孤立笔记，还是先审查重复笔记？”

**用户：**“查找应该链接到我的 API 设计笔记的笔记”

助手：
1. 阅读 API 设计笔记
2. 搜索相关内容
3. 建议：“有 5 条笔记可能相关——
   - ‘REST 最佳实践’ → `relates_to`
   - ‘身份验证流程’ → `implements`
   - ‘速率限制决策’ → `extends`
   要添加其中的任何关系吗？”

**用户：**“有没有主题相似的笔记？”

助手：
1. 分析标题和内容并进行聚类
2. 报告：“可能存在内容重叠——
   - ‘身份验证流程’和‘身份验证设计’涵盖了相似的内容
   - ‘数据库架构 v1’和‘数据库架构 v2’可能需要建立 `supersedes` 关系
   想审查其中一组吗？”