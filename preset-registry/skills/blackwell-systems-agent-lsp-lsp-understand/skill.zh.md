---
name: lsp-understand
description: Deep-dive exploration of unfamiliar code — given a symbol or file, builds a complete Code Map showing type info, implementations, call hierarchy (2-level depth limit), all references, and source. Broader than lsp-explore: accepts files, synthesizes multi-symbol relationships, and produces a navigable dependency map.
argument-hint: "[symbol-name | file-path]"
user-invocable: true
allowed-tools: mcp__lsp__inspect_symbol mcp__lsp__go_to_implementation mcp__lsp__find_callers mcp__lsp__find_references mcp__lsp__get_symbol_source mcp__lsp__list_symbols mcp__lsp__open_document mcp__lsp__go_to_symbol mcp__lsp__get_server_capabilities
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: hoverProvider
  optional-capabilities: implementationProvider callHierarchyProvider referencesProvider documentSymbolProvider workspaceSymbolProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-understand

深入探索不熟悉的代码——给定一个符号或文件，综合悬停信息、实现、调用层次结构（限制为 2 层）、所有引用和源代码，生成结构化的代码地图。

只读——不会修改任何文件。

---

## 与 lsp-explore 的区别

`/lsp-explore` 是针对单个符号的一次性分析：给定一个符号名称，它会执行悬停信息查询、实现查询、调用层次结构查询和引用查询，并生成针对该符号的报告。对于快速回答“这个东西是什么”之类的问题，请使用 lsp-explore。

`/lsp-understand` 在三个方面覆盖范围更广：

1. **接受文件路径作为输入**——将该文件中的所有导出符号作为一个整体进行探索（模式 B），而不要求仅提供一个符号名称。
2. **综合符号之间的关系**——生成依赖关系图，展示入口点之间如何相互调用、共享调用方或实现同一个接口，而不是生成相互独立的逐符号报告。
3. **强制将调用层次结构的深度限制为 2 层**——防止在关联紧密的代码中发生无限递归。

如需了解“这个模块作为一个整体如何工作”，请使用 lsp-understand。

---

## 输入——两种模式

**模式 A（符号）：** 用户以点号表示法提供符号名称（例如 `"codec.Encode"`、`"Handler.ServeHTTP"`）。

**模式 B（文件）：** 用户提供绝对文件路径。文件中的所有导出符号都将成为入口点。

---

## 前置条件

在步骤 2 之前调用 `mcp__lsp__get_server_capabilities`，以确定哪些能力可用。跳过需要缺失能力的步骤：

- `go_to_implementation`：如果 `implementationProvider: false`，则跳过步骤 2b
- `find_callers`：如果 `callHierarchyProvider: false`，则跳过步骤 2c 和 2d；在代码地图输出中注明调用层次结构不可用

---

## 步骤 1——解析入口点

### 模式 A：单个符号

调用 `mcp__lsp__go_to_symbol` 定位符号定义：

```
mcp__lsp__go_to_symbol({
  "symbol_path": "<dot-notation name>",   // e.g. "codec.Encode"
  "workspace_root": "<root>"              // optional
})
→ returns: file_path, line, column (1-indexed)
```

记录 `file_path`、`line` 和 `column`。如果 `go_to_symbol` 未返回任何内容，则报告：

> 未找到符号：`<name>`
> 请检查点号表示法路径（例如 `"Package.Symbol"`），并确保工作区根目录覆盖该文件。

立即停止——不要继续执行步骤 2。

该单个符号将成为唯一入口点。

### 模式 B：文件路径

依次调用 `mcp__lsp__open_document` 和 `mcp__lsp__list_symbols`：

```
mcp__lsp__open_document({ "file_path": "<absolute path>" })

mcp__lsp__list_symbols({ "file_path": "<absolute path>" })
→ returns: list of symbols with kind, line, column
```

筛选导出符号：
- **Go：** 首字母大写
- **TypeScript/JavaScript：** `export` 关键字
- **Rust：** `pub` 可见性

最多保留 **10 个导出符号**。如果找到的符号超过 10 个，优先选择顶层函数和类型；跳过常量和变量。

筛选出的每个符号都将成为一个入口点，并包含其 `file_path`、`line` 和 `column`。

---

## 步骤 2 — 逐符号分析

对每个入口点执行以下子步骤。在可能的情况下，并行执行每个步骤中的调用。

### 2a — 类型信息和文档

使用带有 `@@` 标记的 `position_pattern` 调用 `mcp__lsp__inspect_symbol`（参见 references/patterns.md）：

```
mcp__lsp__inspect_symbol({
  "file_path": "<file>",
  "position_pattern": "<symbol@@name>",
  "line_scope_start": <line - 5>,
  "line_scope_end": <line + 5>
})
→ returns: hover text with type signature and doc comment
```

将结果存储为 `hover_text`。如果调用失败或未返回任何内容，则将 `hover_text` 设置为空字符串。不要停止。

### 2b — 实现（受能力限制）

如果服务器能力中提供了 `implementationProvider`：

```
mcp__lsp__go_to_implementation({
  "file_path": "<file>",
  "line": <line>,
  "column": <column>
})
→ returns: list of concrete implementation locations
```

如果不具备该能力，则跳过。记录 `"not supported by this server"`，而不是停止。

### 2c — 传入调用层次结构（限制为 2 层）

如果提供了 `callHierarchyProvider`：

**第 1 层 — 直接调用方：**

```
mcp__lsp__find_callers({
  "file_path": "<file>",
  "line": <line>,
  "column": <column>,
  "direction": "incoming"
})
→ returns: list of direct caller functions with file and line
```

**第 2 层 — 调用方的调用方：**

对于每个第 1 层调用方，再调用一次 `mcp__lsp__find_callers`：

```
mcp__lsp__find_callers({
  "file_path": "<caller file>",
  "line": <caller line>,
  "column": <caller column>,
  "direction": "incoming"
})
→ returns: Level 2 callers
```

**在第 2 层停止——任何情况下都不要继续递归。**

如果第 2 层调用方数量 > 10：按数量和文件进行汇总，不要逐一列出。

### 2d — 传出调用（仅第 1 层）

如果提供了 `callHierarchyProvider`：

```
mcp__lsp__find_callers({
  "file_path": "<file>",
  "line": <line>,
  "column": <column>,
  "direction": "outgoing"
})
→ returns: list of functions this symbol calls
```

**仅第 1 层——不递归。**

### 2e — 所有引用

```
mcp__lsp__find_references({
  "file_path": "<file>",
  "line": <line>,
  "column": <column>,
  "include_declaration": false
})
→ returns: every usage site across the workspace
```

按文件分组，并统计不同文件的数量。

### 2f — 源代码

```
mcp__lsp__get_symbol_source({
  "file_path": "<file>",
  "line": <line>,
  "column": <column>
})
→ returns: implementation body
```

---

## 步骤 3 — 综合关系

分析完所有入口点后，识别符号之间的关系：

- **内部调用：** 哪些入口点会相互调用？（来自步骤 2d 中的传出调用）
- **共享调用方：** 哪些入口点由相同的第 1 层调用方调用？
- **共享接口：** 哪些入口点实现了相同的接口？（来自步骤 2b）

这个综合步骤是 `/lsp-understand` 与多次运行 `/lsp-explore` 的区别所在。输出应是依赖关系图，而不是彼此孤立的逐符号报告。

---

## 步骤 4 — 输出：代码图谱

生成一份结构化的代码地图，包含以下部分：

```
## Code Map: <target>

### Summary
<2-3 sentence description of what this code does, synthesized from
hover docs and source reading>

### Symbols (<N> analyzed)

#### <SymbolName>
- **Type:** <type signature from hover>
- **Source:** <file:line>
- **Incoming callers (L1):** <list; count only if > 5>
- **Incoming callers (L2):** <summarized; e.g., "called by 3 HTTP handlers">
- **Outgoing calls:** <what this symbol calls>
- **Implements:** <interface name, if applicable>
- **References:** N sites across M files

### Dependency Relationships
<symbols that call each other, as a simple text diagram or list>
e.g.:
  HandlerA → Parse → Validate
  HandlerB → Parse

### Entry Points to This Code
<top-level callers that are NOT in this file — where does outside code
call in?>

### Depth-limit Note
Call hierarchy stopped at 2 levels. <N> additional callers exist beyond
Level 2 — use /lsp-explore on specific symbols to drill deeper.
```

---

## 深度控制规则

以下限制是硬性约束——绝不能超出：

- 传入调用层次结构的递归**在第 2 层停止**
- 传出调用：**仅限第 1 层**，不递归
- 如果第 2 层调用方数量 > 10：**按数量和文件汇总**，不要逐一列出
- 在任何情况下都不要跟踪超出这些限制的调用链

---

## 示例

```
Goal: understand how the file pkg/codec/encoder.go works as a whole

Step 1 — Mode B (file path)
  open_document: pkg/codec/encoder.go
  list_symbols: pkg/codec/encoder.go
  → exported symbols: Encoder (type), Encode (func), Reset (func), NewEncoder (func)
  → 4 exported symbols (under 10 cap)

get_server_capabilities
  → go_to_implementation: supported
  → find_callers: supported

Step 2 — Per-symbol analysis (run in parallel across symbols)

  Symbol: NewEncoder (pkg/codec/encoder.go:12)
    inspect_symbol → "func NewEncoder(w io.Writer) *Encoder"
    go_to_implementation → 0 (concrete function)
    find_callers incoming L1 → 5 callers
    find_callers incoming L2 → 3 callers of those callers
    find_callers outgoing → calls: bufio.NewWriter
    find_references → 5 sites in 3 files
    get_symbol_source → implementation body

  Symbol: Encode (pkg/codec/encoder.go:28)
    inspect_symbol → "func (e *Encoder) Encode(v any) error"
    go_to_implementation → implements codec.Encoder interface
    find_callers incoming L1 → 8 callers (listed)
    find_callers incoming L2 → > 10: "12 additional callers across 5 files"
    find_callers outgoing → calls: NewEncoder, e.w.Flush
    find_references → 8 sites in 5 files
    get_symbol_source → implementation body

  (similar for Encoder type and Reset func...)

Step 3 — Synthesize relationships
  - Encode calls NewEncoder (internal dependency)
  - NewEncoder and Encode share callers in cmd/main.go
  - Encode implements codec.Encoder interface

## Code Map: pkg/codec/encoder.go

### Summary
This file implements a streaming JSON encoder backed by a buffered writer.
NewEncoder constructs an Encoder wrapping any io.Writer; Encode serializes
values and flushes. Reset allows reuse without allocation.

### Symbols (4 analyzed)

#### NewEncoder
- **Type:** func NewEncoder(w io.Writer) *Encoder
- **Source:** pkg/codec/encoder.go:12
- **Incoming callers (L1):** cmd.main, app.Start, loader.Load, test.Setup, bench.Run
- **Incoming callers (L2):** 3 callers across 2 files
- **Outgoing calls:** bufio.NewWriter
- **Implements:** n/a
- **References:** 5 sites across 3 files

#### Encode
- **Type:** func (e *Encoder) Encode(v any) error
- **Source:** pkg/codec/encoder.go:28
- **Incoming callers (L1):** 8 callers (cmd/main.go, internal/app.go, ...)
- **Incoming callers (L2):** 12 additional callers across 5 files (depth limit reached)
- **Outgoing calls:** NewEncoder, e.w.Flush
- **Implements:** codec.Encoder
- **References:** 8 sites across 5 files

...

### Dependency Relationships
  cmd.main → NewEncoder → bufio.NewWriter
  cmd.main → Encode → NewEncoder
  Encode → Reset

### Entry Points to This Code
- cmd.main (cmd/main.go:14)
- app.Start (internal/app.go:31)
- loader.Load (internal/loader.go:55)

### Depth-limit Note
Call hierarchy stopped at 2 levels. 12 additional callers exist beyond
Level 2 for Encode — use /lsp-explore on specific symbols to drill deeper.
```