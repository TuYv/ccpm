---
name: lsp-explore
description: "Tell me about this symbol": hover + implementations + call hierarchy + references in one pass — for navigating unfamiliar code.
argument-hint: "[symbol-name]"
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__go_to_symbol mcp__lsp__inspect_symbol mcp__lsp__go_to_implementation mcp__lsp__find_callers mcp__lsp__find_references mcp__lsp__open_document mcp__lsp__get_server_capabilities
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: hoverProvider
  optional-capabilities: implementationProvider callHierarchyProvider referencesProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-explore

“一次了解此符号的全部信息”——一次性获取悬停信息、实现、调用层次结构和引用。用于浏览不熟悉的代码：无需分别发出四条命令，即可获得类型信息、文档注释、调用方、实现方以及每个引用位置。

只读——不会修改任何文件。

**调用方式：** 用户以点号表示法提供符号名称（例如
`"codec.Encode"`、`"Buffer.Reset"`）。可以选择提供 `workspace_root`
来限定搜索范围。

---

## 前置条件

如果 LSP 尚未初始化，请先使用工作区根目录调用 `mcp__lsp__start_lsp`。
提供文件路径时会自动推断。

---

## 阶段 1——定位符号

调用 `mcp__lsp__go_to_symbol`，并将 `symbol_path` 设置为用户提供的名称：

```
mcp__lsp__go_to_symbol({
  "symbol_path": "Package.SymbolName",   // dot notation; e.g. "codec.Encode"
  "workspace_root": "<root>"             // optional
})
→ returns: file, line, column (1-indexed)
```

记录返回的 `file`、`line` 和 `column`。如果 `go_to_symbol` 未返回任何结果，
请报告：

> 未找到符号：`<name>`
> 请检查点号表示法路径（例如 "Package.Symbol"），并确保工作区
> 根目录覆盖该文件。

立即停止——不要继续进入阶段 2。

然后打开文件，以便语言服务器将其载入视图：

```
mcp__lsp__open_document({
  "file_path": "<file from go_to_symbol>"
})
```

---

## 阶段 2——悬停信息（始终可用）

在定义位置调用 `mcp__lsp__inspect_symbol`：

```
mcp__lsp__inspect_symbol({
  "file_path": "<file from Phase 1>",
  "line": <line from Phase 1>,
  "column": <column from Phase 1>
})
```

将结果存储为 `hover_text`。如果调用失败或未返回任何结果，请将
`hover_text` 设置为空字符串。不要停止。

---

## 阶段 3——实现（受能力限制）

调用 `mcp__lsp__get_server_capabilities`，查看服务器支持的功能：

```
mcp__lsp__get_server_capabilities()
→ returns: supported_tools list
```

如果 `supported_tools` 中包含 `go_to_implementation`，请调用它：

```
mcp__lsp__go_to_implementation({
  "file_path": "<file from Phase 1>",
  "line": <line from Phase 1>,
  "column": <column from Phase 1>
})
→ returns: list of implementation locations (file, line)
```

将位置记录为 `implementations`。如果 `supported_tools` 中**不**
包含 `go_to_implementation`，请记录 `"not supported by this server"`——不要停止。

---

## 阶段 4——调用层次结构和引用（并行运行）

在同一条消息中发出以下两个调用——它们彼此独立：

### 4a——传入调用方

仅当 `supported_tools` 中包含 `find_callers` 时：

```
mcp__lsp__find_callers({
  "file_path": "<file from Phase 1>",
  "line": <line from Phase 1>,
  "column": <column from Phase 1>,
  "direction": "incoming"
})
→ returns: list of caller functions with file and line
```

如果 `supported_tools` 中**不**包含 `find_callers`，请注明
`"not supported by this server"`——不要停止。

### 4b——所有引用位置

```
mcp__lsp__find_references({
  "file_path": "<file from Phase 1>",
  "line": <line from Phase 1>,
  "column": <column from Phase 1>,
  "include_declaration": false
})
→ returns: list of reference locations (file, line)
```

收集所有引用位置。按文件分组，并统计不同文件的数量。

---

## 输出格式 — 探索报告

按以下格式生成报告：

```
## Explore Report: <SymbolName>

### Definition
- File: <file>:<line>
- Hover: <hover_text or "unavailable">

### Implementations (<N> found, or "not supported")
[list of file:line entries, or "none found", or "not supported by this server"]

### Callers (incoming call hierarchy)
[list of caller function names with file:line, or "none", or "not supported"]

### References (<N> total across <M> files)
[list of file:line entries grouped by file, or "none found"]

### Summary
- Symbol kind:      <inferred from hover or "unknown">
- Reference count:  <N>
- Files with refs:  <M distinct files>
- Callers:          <K>
- Implementations:  <P or "not supported">
```

保持报告简洁。目标是“一次看懂这个符号”。

---

## 示例

```
Goal: understand the exported function `ParseConfig` in pkg/config

Phase 1 — go_to_symbol: symbol_path="config.ParseConfig"
  → pkg/config/parser.go:42:6

open_document: pkg/config/parser.go

Phase 2 — inspect_symbol: line=42, column=6
  → hover_text: "func ParseConfig(path string) (*Config, error) — reads and
    validates a config file from path"

Phase 3 — get_server_capabilities
  → go_to_implementation: in supported_tools
  go_to_implementation: line=42, column=6
  → 0 implementations (ParseConfig is a concrete function, not an interface method)

Phase 4 (parallel):
  find_callers direction=incoming
  → 3 callers: cmd.main (cmd/main.go:14), app.Start (internal/app.go:31),
               loader.Load (internal/loader.go:55)

  find_references include_declaration=false
  → 7 references in 4 files

## Explore Report: ParseConfig

### Definition
- File: pkg/config/parser.go:42
- Hover: func ParseConfig(path string) (*Config, error) — reads and validates a
  config file from path

### Implementations (0 found)
none found

### Callers (incoming call hierarchy)
- cmd.main — cmd/main.go:14
- app.Start — internal/app.go:31
- loader.Load — internal/loader.go:55

### References (7 total across 4 files)
cmd/main.go: line 14
internal/app.go: lines 31, 87
internal/loader.go: line 55
pkg/config/parser_test.go: lines 12, 34, 56, 78

### Summary
- Symbol kind:      function
- Reference count:  7
- Files with refs:  4
- Callers:          3
- Implementations:  0
```