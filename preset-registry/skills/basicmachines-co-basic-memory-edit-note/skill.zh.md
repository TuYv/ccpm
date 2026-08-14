---
name: edit-note
description: Interactively edit Basic Memory notes using MCP tools - view, modify, and update notes in a conversational workflow (works with cloud and local)
---
# 编辑笔记

此技能支持使用 MCP 工具以交互方式编辑 Basic Memory 笔记。由于它通过 MCP 接口而不是直接访问文件来操作，因此同时适用于 Basic Memory Cloud 和本地安装。

## 何时使用

在以下情况下使用此技能：
- 用户想要编辑现有笔记
- 用户要求更新、更改或修改笔记内容
- 用户想要完善笔记中的观察或关系
- 用户说出类似“编辑我关于……的笔记”“更新……”“将 X 更改为 Y……”之类的话

## 编辑工作流

### 1. 获取当前笔记

首先，检索笔记，向用户展示现有内容：

```python
mcp__basic-memory__read_note(
    identifier="Note Title or permalink",
    project="main"  # or specified project
)
```

清晰地展示笔记内容，并突出显示：
- 当前标题和元数据
- 主要内容章节
- 观察（包含类别）
- 关系（包含链接目标）

### 2. 理解编辑请求

如有需要，请提出澄清问题：
- 要修改哪个章节？
- 具体要更改什么？
- 添加新内容还是替换现有内容？

### 3. 应用编辑

使用适当的 `edit_note` 操作：

**追加** - 在末尾添加内容：
```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="append",
    content="\n\n## New Section\n\nNew content here...",
    project="main"
)
```

**前置添加** - 在开头添加内容：
```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="prepend",
    content="# Updated Header\n\n",
    project="main"
)
```

**查找并替换** - 替换特定文本：
```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="find_replace",
    find_text="old text to find",
    content="new replacement text",
    project="main"
)
```

**替换章节** - 按标题替换整个章节：
```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="replace_section",
    section="## Section Heading",
    content="## Section Heading\n\nCompletely new section content...",
    project="main"
)
```

### 4. 展示结果

编辑后，获取并显示更新后的笔记：

```python
mcp__basic-memory__read_note(
    identifier="note-title",
    project="main"
)
```

突出显示所做的更改，以便用户验证。

## 编辑操作参考

| 操作 | 使用场景 | 必需参数 |
|-----------|----------|---------------------|
| `append` | 添加到末尾 | `content` |
| `prepend` | 添加到开头 | `content` |
| `find_replace` | 更改特定文本 | `find_text`, `content` |
| `replace_section` | 重写某个章节 | `section`, `content` |

## 常见编辑模式

### 添加新观察

```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="find_replace",
    find_text="## Observations",
    content="## Observations\n\n- [new-category] New observation here #tag",
    project="main"
)
```

或者追加到观察章节：
```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="append",
    content="\n- [insight] Additional insight discovered #tag",
    project="main"
)
```

### 添加新关系

```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="find_replace",
    find_text="## Relations",
    content="## Relations\n\n- relates-to [[New Related Note]]",
    project="main"
)
```

### 更新特定观察记录

```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="find_replace",
    find_text="- [decision] Old decision text",
    content="- [decision] Updated decision with new context #updated",
    project="main"
)
```

### 重写上下文部分

```python
mcp__basic-memory__edit_note(
    identifier="note-title",
    operation="replace_section",
    section="## Context",
    content="## Context\n\nCompletely rewritten context explaining the new situation...",
    project="main"
)
```

## 多步骤编辑会话

对于复杂编辑，请以迭代方式操作：

1. **显示当前状态** → 读取并显示笔记
2. **首次编辑** → 应用一项更改
3. **显示结果** → 显示更新后的笔记
4. **后续编辑** → 根据需要应用另一项更改
5. **确认完成** → 最终显示并确认

这样可以让用户及时了解情况，并允许调整方向。

## 最佳实践

1. **始终显示编辑前后的内容** - 用户应能看到发生了哪些更改
2. **一次只进行一项编辑** - 对于复杂更改，请执行多次操作
3. **保留结构** - 保持笔记的 Markdown 格式
4. **谨慎使用 find_replace** - 确保 find_text 是唯一的
5. **确认破坏性更改** - 替换较大部分之前先询问用户
6. **保持观察记录的格式** - 维持 `[category]` 前缀格式
7. **保持关系的格式** - 维持 `- relation-type [[Target]]` 格式

## 对话示例

**用户：**“编辑我关于异步客户端模式的笔记——添加一条关于测试的观察记录”

**Claude：**
1. 获取“异步客户端模式”笔记
2. 显示当前内容
3. 询问：“你想添加哪一条关于测试的观察记录？”

**用户：**“上下文管理器模式让测试中的模拟变得更容易”

**Claude：**
1. 使用 `edit_note` 和 `append` 添加：
   `- [testing] Context manager pattern simplifies mocking in unit tests #testability`
2. 获取并显示更新后的笔记
3. 确认：“已添加关于测试的观察记录。以下是更新后的笔记……”