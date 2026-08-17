---
name: godot-api
display_name: Godot API Lookup
short_description: Targeted Godot class and C# API lookup
default_prompt: "Use ${GODOT_API_COMMAND} to answer a specific Godot API or C# Godot syntax question."
allow_implicit_invocation: false
description: |
  Look up Godot engine class APIs, methods, properties, signals, enums, or C# Godot syntax. Use when you need a targeted Godot API answer or a specific engine-class recommendation.
---
# Godot API 查询

此技能是一个范围明确的参考工具。回答应紧扣调用方的问题。

不要列出或枚举 `${GODOT_API_SKILL_DIR}/doc_api/` 或 `${GODOT_API_SKILL_DIR}/doc_source/`。这些目录包含近千个文件，列出它们会浪费上下文。请通过 `_common.md`、`_other.md` 以及实际需要的特定类文件进行查找。

## 如何回答

1. 如果你已经知道具体的类或可能相关的类，请在 `${GODOT_API_SKILL_DIR}/doc_api/_common.md` 和 `_other.md` 中搜索类名，而不是读取完整的索引文件。
2. 如果调用方没有指定类，请使用 `${GODOT_API_SKILL_DIR}/doc_api/_common.md` 和 `_other.md` 确定可能相关的类，然后仅阅读相关文档。
3. 仅阅读相关的 `${GODOT_API_SKILL_DIR}/doc_api/{ClassName}.md` 文件。
4. 只返回调用方所需的内容：
   - **具体问题**（例如，“如何检测碰撞”）-> 返回相关的方法、信号或模式，并附上简短说明
   - **完整 API 请求**（例如，“CharacterBody3D 的完整 API”）-> 返回完整的类文档摘要

**C# 语法参考：** `${GODOT_API_SKILL_DIR}/csharp.md` — C# Godot 语法、模式和示例。当调用方询问 C# Godot 语法、惯用写法或输入处理、补间动画、状态机、信号等常见模式时，请阅读此文件。

如果 `doc_api` 为空，请执行初始化：

```bash
bash ${GODOT_API_SKILL_DIR}/tools/ensure_doc_api.sh
```