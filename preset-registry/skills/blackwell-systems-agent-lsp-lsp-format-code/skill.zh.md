---
name: lsp-format-code
description: Format a file or selection using the language server's formatter. Use before committing to apply consistent style, or after generating code to clean up indentation and spacing. Supports full-file and range-based formatting.
argument-hint: "[file-path] [optional: start_line-end_line]"
user-invocable: true
allowed-tools: mcp__lsp__open_document mcp__lsp__format_document mcp__lsp__format_range mcp__lsp__apply_edit mcp__lsp__get_diagnostics mcp__lsp__get_server_capabilities
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: documentFormattingProvider
  optional-capabilities: documentRangeFormattingProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-format-code

使用语言服务器的格式化程序格式化文件或选定内容——与你的 IDE 使用的是同一个格式化引擎。它会应用特定于语言的规则（gofmt、prettier、rustfmt、black），而无须这些工具分别位于 PATH 中。

## 使用时机

- 提交前：确保编辑过的文件具有一致的样式
- 生成代码后：清理 AI 生成的缩进和间距
- 在导致缩进层级变化的重构后
- 当 linter 报告可由格式化程序修复的样式违规时

如果你正在进行逻辑更改，并希望在编辑的同时比较更改前后的诊断结果，请改用 `/lsp-safe-edit`。

---

## 工作流程

### 第 1 步——检查是否支持格式化（可选）

如果不确定语言服务器是否支持格式化此文件，请先检查其能力：

```
mcp__lsp__get_server_capabilities({ "file_path": "<file>" })
```

查找 `documentFormattingProvider`（整个文件）和 `documentRangeFormattingProvider`（范围）。如果两者都不存在，则服务器不支持格式化——停止并报告。

如果你已知该语言支持格式化，则跳过此步骤（Go、TypeScript、Rust、Python 均通过各自的标准服务器支持格式化）。

### 第 2 步——打开文件

```
mcp__lsp__open_document({ "file_path": "/abs/path/to/file.go", "language_id": "go" })
```

### 第 3 步——请求格式化编辑

**整个文件：**
```
mcp__lsp__format_document({ "file_path": "/abs/path/to/file.go" })
```

**仅选定内容：**
```
mcp__lsp__format_range({
  "file_path": "/abs/path/to/file.go",
  "start_line": <N>,
  "end_line": <M>
})
```

两者都会返回 `TextEdit[]`——一个需要应用的替换项列表。它们**不会**写入磁盘。如果列表为空，则该文件已经正确格式化。

### 第 4 步——应用编辑

将第 3 步返回的 `TextEdit[]` 传递给 `apply_edit`：

```
mcp__lsp__apply_edit({ "workspace_edit": <TextEdit[] from Step 3> })
```

这会将格式化更改写入磁盘。

### 第 5 步——验证（可选但建议）

调用 `get_diagnostics`，确认格式化没有引入任何错误：

```
mcp__lsp__get_diagnostics({ "file_path": "/abs/path/to/file.go" })
```

格式化绝不应引入错误——如果确实引入了错误，请立即报告且不要提交。

---

## 输出格式

```
## Format result: <filename>

Changes applied: N edits
Lines affected: <range or "whole file">
Formatter: <gopls | typescript-language-server | rust-analyzer | ...>

Status: FORMATTED ✓
```

如果未返回任何编辑：
```
Status: ALREADY FORMATTED — no changes needed
```

如果不支持格式化：
```
Status: NOT SUPPORTED — <server> does not expose documentFormattingProvider
Fallback: run the formatter directly (gofmt, prettier, rustfmt, etc.)
```

---

## 多文件格式化

要格式化多个文件（例如 PR 中更改的所有文件）：

1. 为每个文件调用 `format_document`——这些调用可以并行运行。
2. 收集所有 `TextEdit[]` 响应。
3. 通过 `apply_edit` 依次应用每个文件的编辑。
4. 报告所有文件的编辑总数。

不要在单次 `apply_edit` 调用中应用来自多个文件的编辑——
请按文件分别应用，以确保更改范围明确且可回退。

---

## 决策指南

| 情况 | 操作 |
|-----------|--------|
| 提交前格式化整个文件 | `format_document` → `apply_edit` |
| 仅格式化函数中生成的代码 | 使用 `format_range`，并指定函数的行范围 |
| 返回空的 `TextEdit[]` | 文件已格式化——无需执行任何操作 |
| 服务器不支持格式化 | 报告该情况，并建议直接运行 CLI 格式化工具 |
| 格式化引入诊断问题 | 不要提交——立即报告 |
| 在工作区仓库中格式化 Go 文件 | 如果通过 shell 回退方式运行，请确保设置了 `GOWORK=off` |

---

## 语言说明

| 语言 | 格式化工具 | 服务器 |
|----------|-----------|--------|
| Go | `gofmt`（通过 gopls） | `gopls` |
| TypeScript / JavaScript | `prettier` 或内置格式化工具（通过 typescript-language-server） | `typescript-language-server` |
| Rust | `rustfmt`（通过 rust-analyzer） | `rust-analyzer` |
| Python | `black` 或 `autopep8`（通过 pyright/pylsp） | `pyright-langserver` 或 `pylsp` |
| C / C++ | `clang-format`（通过 clangd） | `clangd` |

语言服务器会将格式化工作委托给该语言的标准格式化工具——结果
与你的 IDE 生成的结果一致。