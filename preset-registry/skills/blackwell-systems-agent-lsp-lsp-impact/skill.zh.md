---
name: lsp-impact
description: Blast-radius analysis for a symbol or file — shows all callers, type supertypes/subtypes, and reference count before you change it. Use when refactoring, deleting, or changing the signature of any function, type, or method. Also accepts a file path to surface all exported-symbol impact in one shot.
argument-hint: "[symbol-name | file-path]"
user-invocable: true
allowed-tools: mcp__lsp__go_to_symbol mcp__lsp__find_callers mcp__lsp__type_hierarchy mcp__lsp__find_references mcp__lsp__get_server_capabilities mcp__lsp__blast_radius
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: referencesProvider
  optional-capabilities: callHierarchyProvider typeHierarchyProvider workspaceSymbolProvider
---
> 需要 agent-lsp MCP server。

# lsp-impact

针对任意符号或文件进行影响范围分析。在你修改任何内容之前，发现所有直接引用、调用方（通过调用层次结构）以及类型关系。只读——不会修改任何文件。

请在 lsp-edit-export **之前**运行此技能：impact 会告诉你现有内容及变更影响范围；lsp-edit-export 会告诉你如何安全地执行变更。

**调用方式：**
- **文件路径**（例如 `"internal/lsp/client.go"`）→ 使用文件级入口（步骤 0），一次性呈现所有导出符号的影响。
- **点号表示法的符号名称**（例如 `"codec.Encode"`、`"Buffer.Reset"`）→ 跳过步骤 0；从前置条件开始，然后执行步骤 1。

---

## 步骤 0——文件级入口（当用户提供文件路径时）

当用户要更改或审查整个文件，而非单个符号时，请使用此快捷方式。`blast_radius` 会枚举文件中的所有导出符号、解析其引用，并在一次调用中返回测试调用方（包括所在测试函数的名称）和非测试调用方。

```
mcp__lsp__blast_radius({
  "changed_files": ["/abs/path/to/file.go"],
  "include_transitive": false   // set true to surface second-order callers
})
```

返回：
- `affected_symbols`——每个导出符号及其引用计数
- `test_callers`——测试文件及所在测试函数的名称
- `non_test_callers`——生产代码中的调用位置

**步骤 0 之后的决策：**

| 结果 | 操作 |
|--------|--------|
| 0 个非测试调用方 | 影响范围较小。继续进行变更。 |
| 调用方较少，且文件已知 | 中等风险。更新每个调用位置。 |
| 调用方众多且分布在多个包中 | 高风险。考虑分阶段推出。 |
| 需要符号级详细信息 | 针对任意特定符号继续执行步骤 1–5。 |

如果文件级摘要已经足够，请跳过步骤 1–5。

---

## 前置条件（适用于符号级步骤 1–5）

如果 LSP 尚未初始化，请先使用工作区根目录调用 `mcp__lsp__start_lsp`。

继续之前，请检查服务器支持的功能——`find_callers` 和 `type_hierarchy` 是可选的 LSP 功能，并非所有服务器都实现了这些功能：

```
mcp__lsp__get_server_capabilities()
```

请留意 `supported_tools` 中出现了哪些工具。下面的步骤 3 和步骤 4 依赖此结果。

---

## 步骤 1——定位符号

使用用户提供的符号名称调用 `go_to_symbol`：

```
mcp__lsp__go_to_symbol({
  "symbol_path": "Package.SymbolName",
  "workspace_root": "/abs/path"   // optional, narrows scope
})
→ returns: file, line, column (1-indexed)
```

`symbol_path` 使用点号表示法。对于 `codec` 包中的顶层函数 `Encode`，使用 `"codec.Encode"`。对于类型 `Buffer` 上的方法 `Reset`，使用 `"Buffer.Reset"`。

记录返回的 `file`、`line` 和 `column`——你需要将它们传递给后续每个步骤。

---

## 步骤 2——枚举所有直接引用（始终可用）

调用 `find_references` 并设置 `include_declaration: false`，以查找整个工作区中的每个使用位置：

```
mcp__lsp__find_references({
  "file_path": "<file from Step 1>",
  "position_pattern": "func @@SymbolName(",   // adjust prefix for symbol kind
  "include_declaration": false
})
```

收集所有引用位置。按文件对结果进行分组。记录总数和文件列表——这些信息将用于影响报告。

有关不同语言和符号类型的 `position_pattern` 示例，请参阅 [references/patterns.md](references/patterns.md)。

---

## 第 3 步——调用层级（调用方和被调用方）

仅当第 0 步的 `supported_tools` 中包含 `find_callers` 时执行。

```
mcp__lsp__find_callers({
  "file_path": "<file from Step 1>",
  "line": <line from Step 1>,
  "column": <column from Step 1>,
  "direction": "incoming"   // use "both" if callees are also needed
})
```

如果 `supported_tools` 中**不**包含 `find_callers`，则完全跳过此步骤。
在影响报告中注明 `"call hierarchy not supported by this server"`。

---

## 第 4 步——类型层级（父类型和子类型）

仅当符号是**类型、接口或类**（而不是普通函数或方法）时适用。仅当 `supported_tools` 中包含 `type_hierarchy` 时执行。

```
mcp__lsp__type_hierarchy({
  "file_path": "<file from Step 1>",
  "line": <line from Step 1>,
  "column": <column from Step 1>,
  "direction": "both"
})
```

如果符号是**函数或方法**：跳过此步骤；在报告中注明
`"not applicable (function)"`。

如果 `supported_tools` 中**不**包含 `type_hierarchy`：跳过此步骤；在报告中注明
`"not supported by this server"`。

---

## 第 5 步——报告影响范围

使用 [references/patterns.md](references/patterns.md) 中定义的格式生成影响报告。

包括：

- 符号名称、类型和定义位置
- 引用数量以及包含引用的文件列表
- 来自 `find_callers` 的传入调用方（或跳过说明）
- 来自 `type_hierarchy` 的父类型和子类型（或跳过说明）
- 爆炸半径：受影响的不同文件数量

然后应用以下决策指南：

| 爆炸半径 | 建议 |
|---|---|
| 0 个引用 | 很可能是死代码。删除前使用 lsp-dead-code 确认。 |
| 1–5 个文件 | 风险较低。可以继续。更新所有调用方。 |
| 6–20 个文件 | 中等风险。仔细规划变更。分批进行。 |
| > 20 个文件 | 高风险。考虑采用弃用流程或功能开关。 |

---

## 示例

```
Goal: assess blast radius of exported function `ParseConfig` in pkg/config

Prerequisites — get_server_capabilities:
  → supported_tools: [go_to_symbol, find_references, find_callers, ...]
  → type_hierarchy: not in supported_tools

Step 1 — go_to_symbol: symbol_path="config.ParseConfig"
  → pkg/config/parser.go:42:6

Step 2 — find_references: position_pattern="func @@ParseConfig("
  → 7 references in 4 files
  → cmd/main.go, internal/app.go, internal/loader.go, pkg/config/parser_test.go

Step 3 — find_callers: direction="incoming"
  → callers: cmd.main (cmd/main.go:14), app.Start (internal/app.go:31), ...

Step 4 — type_hierarchy: skipped (function), also not supported by server

Step 5 — Impact Report:
  ## Impact Report: ParseConfig
  - Kind:         function
  - Definition:   pkg/config/parser.go:42:6
  - References:   7 across 4 files
  ...
  - Risk level:   low
```

## 关于 position_pattern 的说明

带有 `@@` 的 `position_pattern` 是 agent-lsp 扩展。如果你的 MCP 客户端不支持它，请改用步骤 1 中 `go_to_symbol` 返回的位置所提供的显式 `line` 和 `column` 参数。