---
name: lsp-edit-symbol
description: "Edit a named symbol without knowing its file or position. Use when you want to change a function, type, or variable by name and don't have exact coordinates. Resolves the symbol to its definition, retrieves its full range, and applies the edit."
argument-hint: "[symbol-name] [new-body-or-signature]"
user-invocable: true
allowed-tools:
  - mcp__lsp__find_symbol
  - mcp__lsp__list_symbols
  - mcp__lsp__apply_edit
  - mcp__lsp__replace_symbol_body
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: workspaceSymbolProvider
---
# lsp-edit-symbol

无需知道确切的文件路径或行/列位置，即可编辑具名符号（函数、类型、变量）。主要路径使用 `replace_symbol_body` 直接替换符号。若服务器无法良好支持文档符号，则回退到 `find_symbol` + `list_symbols` + `apply_edit`。

## 工作流程

### 步骤 1 — 定位文件

```json
{ "tool": "find_symbol", "query": "MyFunc" }
```

返回匹配符号的列表，其中包含文件 URI 和位置。请选择定义（不要选择测试文件或存根）。如果存在多个匹配项，请使用容器名称或文件路径消除歧义。

### 步骤 2 — 替换符号主体（主要路径）

使用 `replace_symbol_body` 按名称替换整个函数/方法/类型主体：

```json
{
  "tool": "replace_symbol_body",
  "file_path": "/path/to/file.go",
  "symbol_path": "MyFunc",
  "new_body": "func MyFunc() error {\n\treturn nil\n}"
}
```

对于方法，请使用点号表示法：`"MyStruct.Method"`。

此操作会在文件中按名称解析符号，找到其完整范围，并以原子方式替换。无需计算位置。

**如果 `replace_symbol_body` 失败**（例如，服务器无法解析此文件的文档符号），请回退到下面的手动路径。

### 回退方案 — 通过文档符号手动解析

**步骤 2b — 获取完整范围：**

```json
{
  "tool": "list_symbols",
  "file_path": "/path/to/file.go",
  "language_id": "go"
}
```

在返回的树中找到 `MyFunc`。`range` 字段覆盖包括主体在内的整个符号；`selectionRange` 仅覆盖名称。

**步骤 3b — 应用编辑：**

选项 A（文本匹配，拥有旧文本时推荐使用）：
```json
{
  "tool": "apply_edit",
  "file_path": "/path/to/file.go",
  "old_text": "func MyFunc() {",
  "new_text": "func MyFunc() error {"
}
```

选项 B（按位置，拥有确切范围时使用）：
```json
{
  "tool": "apply_edit",
  "workspace_edit": {
    "changes": {
      "file:///path/to/file.go": [{
        "range": { "start": {"line": 12, "character": 0}, "end": {"line": 18, "character": 1} },
        "newText": "func MyFunc() error {\n\treturn nil\n}"
      }]
    }
  }
}
```

## 决策指南

| 情况 | 方法 |
|-----------|----------|
| 替换完整主体 | `replace_symbol_body`（主要路径） |
| 仅更改签名 | 步骤 1 + 使用单行 old_text 的 apply_edit |
| 符号名称存在歧义 | 使用 `find_symbol` 查询 + 容器名称筛选 |
| 服务器不支持文档符号 | 回退路径（步骤 2b + 3b） |
| 编辑后 | 运行 `get_diagnostics`，验证是否引入了错误 |

## 注意事项

- `replace_symbol_body` 是替换完整主体的首选路径。它会在内部处理符号解析和范围计算。
- `find_symbol` 返回声明位置，而非所有引用位置。第一个非测试结果通常就是定义。
- `list_symbols` 中的位置采用 **从 1 开始的索引**（相对于 LSP 约定进行了偏移）。`apply_edit` 的 `workspace_edit` 需要使用 **从 0 开始的索引**；使用位置模式（选项 B）时应减去 1。文本匹配模式（选项 A）无需计算位置。
- 对于重命名（而非编辑），请改用 `/lsp-rename`；它会更新所有调用位置。