---
name: lsp-local-symbols
description: Fast file-scoped symbol analysis — find all usages of a symbol within the current file, list all symbols defined in the file, and get type info at a position. Use when you need local-scope analysis without a workspace-wide search.
argument-hint: "[symbol-name] in [file-path]"
user-invocable: true
allowed-tools: mcp__lsp__open_document mcp__lsp__list_symbols mcp__lsp__inspect_symbol mcp__lsp__get_document_highlights
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: documentSymbolProvider
  optional-capabilities: documentHighlightProvider hoverProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-local-symbols

使用语言服务器索引进行文件范围的符号分析。对于单个文件相关的问题，这比工作区范围的搜索更快：此处定义了哪些符号、此符号在文件内的哪些位置被使用，以及它具有什么类型。

只读——不会修改任何文件。

## 使用场景

- “`x` 在此文件中的哪些位置被使用？”——使用 `get_document_highlights`
- “此文件中定义了哪些函数和类型？”——使用 `list_symbols`
- “此符号具有什么类型？”——使用 `inspect_symbol`
- 编辑前审查文件——先获取完整的符号映射
- 确定局部重构范围——在内联符号前，确认它是否仅在一处被使用

需要查找工作区范围的调用方和跨文件引用时，请改用 `/lsp-impact`。审计没有调用方的导出符号时，请使用 `/lsp-dead-code`。

## 不适用的场景

`get_document_highlights` 在设计上仅限文件范围——它只查找打开文件内的用法。如果某个符号在多个文件中使用，此技能将无法找到这些用法。请使用 `find_references`（通过 `/lsp-impact`）进行跨文件分析。

---

## 工作流程

### 第 1 步——打开文件

打开文件，使语言服务器能够跟踪它：

```
mcp__lsp__open_document
  file_path: "/abs/path/to/file.go"
  language_id: "go"              # go, typescript, python, rust, etc.
```

### 第 2 步——列出文件中的所有符号

获取文件的完整符号树：

```
mcp__lsp__list_symbols
  file_path: "/abs/path/to/file.go"
```

这会返回文件中定义的所有函数、类型、变量、常量和方法——包括嵌套符号（类型的方法、结构体中的字段）。

可用它来：
- 在编辑前了解文件结构
- 查找命名符号的准确位置
- 在完整读取文件之前查看文件对外暴露的内容

**读取输出：** 每个符号都有一个 `range`（包括大括号在内的完整主体）和一个 `selectionRange`（仅名称）。坐标从 1 开始。将 `selectionRange.start.line` 和 `selectionRange.start.character` 用作 `get_document_highlights` 和 `inspect_symbol` 的输入。

### 第 3 步——查找文件内的所有用法

在符号所在位置调用 `get_document_highlights`：

```
mcp__lsp__get_document_highlights
  file_path: "/abs/path/to/file.go"
  line: <selectionRange.start.line from Step 2>
  column: <selectionRange.start.character from Step 2>
```

返回该符号在文件中的每次出现，并分类为：
- `read`——此处读取了该符号
- `write`——此处为该符号赋值或修改了该符号
- `text`——文本匹配（无法进行语义分类时的后备方式）

**速度说明：** 对于文件内查询，`get_document_highlights` 明显快于 `find_references`——它不会扫描整个工作区索引。请优先使用它；仅当需要跨文件结果时，才升级为使用 `find_references`。

### 第 4 步——获取类型信息（可选）

对于任何感兴趣的位置，获取其类型签名和文档：

```
mcp__lsp__inspect_symbol
  file_path: "/abs/path/to/file.go"
  line: <line>
  column: <column>
```

返回悬停文本：类型签名、文档和推断类型。
有助于在决定重命名或内联某个符号之前确认它是什么。

---

## 输出格式

分三个部分报告结果（省略没有内容的部分）：

```
## Symbols in <filename>

### Functions / Methods
- `FuncName` — line N–M
- `(Type) MethodName` — line N–M

### Types
- `TypeName` (struct/interface/alias) — line N

### Variables / Constants
- `ConstName` = value — line N

---

## Usages of `<symbol>` in <filename>

N occurrences across M lines:
- line 12 [write] — assignment
- line 34 [read]  — passed as argument
- line 67 [read]  — returned

---

## Type info

`<symbol>`: <type signature from inspect_symbol>
```

---

## 决策指南

| 问题 | 工具 |
|----------|------|
| 此文件中有什么？ | `list_symbols` |
| X 在此文件中的哪些位置被使用？ | `get_document_highlights` |
| X 的类型是什么？ | `inspect_symbol` |
| X 是否可以安全地内联（仅使用一次）？ | `get_document_highlights` — 统计出现次数 |
| X 是否在此文件之外使用？ | 改用 `/lsp-impact` |
| X 是否为死代码（在任何位置都没有调用者）？ | 改用 `/lsp-dead-code` |

---

## 示例

```
# "Where is the `config` variable used in server.go?"

open_document(file_path="/repo/server.go", language_id="go")
list_symbols(file_path="/repo/server.go")
  → finds `config` at selectionRange line 42, col 2

get_document_highlights(file_path="/repo/server.go", line=42, column=2)
  → returns 7 occurrences: 1 write (line 42), 6 reads

inspect_symbol(file_path="/repo/server.go", line=42, column=2)
  → "config *Config — the parsed server configuration"
```