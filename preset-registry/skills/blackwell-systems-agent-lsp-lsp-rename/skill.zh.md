---
name: lsp-rename
description: Two-phase safe rename across the entire workspace. Use when renaming any symbol, function, method, variable, type, or identifier — shows all affected sites before executing atomically via LSP. Never renames without confirmation.
argument-hint: "[old-name] [new-name]"
user-invocable: true
allowed-tools: mcp__lsp__go_to_symbol mcp__lsp__prepare_rename mcp__lsp__find_references mcp__lsp__rename_symbol mcp__lsp__apply_edit mcp__lsp__get_diagnostics
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: referencesProvider renameProvider workspaceSymbolProvider
  tool_permissions:
    phases:
      prerequisites:
        description: Initialize LSP if needed
        allowed: ["mcp__lsp__start_lsp"]
        forbidden: []
      preview:
        description: "Locate symbol, validate rename, enumerate references, dry-run"
        allowed:
          - "mcp__lsp__go_to_symbol"
          - "mcp__lsp__prepare_rename"
          - "mcp__lsp__find_references"
          - "mcp__lsp__rename_symbol"    # dry_run=true only
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      execute:
        description: "Capture pre-rename diagnostics, execute rename (applies directly), verify"
        allowed:
          - "mcp__lsp__get_diagnostics"
          - "mcp__lsp__rename_symbol"    # dry_run=false
          - "mcp__lsp__apply_edit"
        forbidden:
          - "mcp__lsp__simulate_*"
          - "mcp__lsp__run_build"
    global_forbidden:
      - "mcp__lsp__format_document"      # rename does not format
      - "mcp__lsp__run_tests"            # rename does not run tests
---
> 需要 `agent-lsp` MCP 服务器。

# lsp-rename：安全符号重命名

在工作区内分两阶段重命名符号：先预览，再在明确确认后执行。
从不在未展示影响范围的情况下直接重命名。

**调用方式：** 用户提供 `old_name`（要重命名的符号）和 `new_name`（替换名）。
可选地提供 `workspace_root` 以限定搜索范围。

---

## 前置条件

如果 LSP 尚未初始化，请先使用工作区根路径调用 `mcp__lsp__start_lsp`。
当提供文件路径时会自动推断，但在切换工作区时必须显式启动。

---

## 第一阶段：预览

查找符号、枚举所有引用，并生成一次干跑预览。
**此阶段不得应用任何编辑。**

### 第 1 步 — 定位符号

使用 `symbol_path` 设为 `old_name` 调用 `mcp__lsp__go_to_symbol`：

```
mcp__lsp__go_to_symbol
  symbol_path: "old_name"        # or "Package.OldName" for qualified paths
  workspace_root: "<root>"       # optional; omit to search entire workspace
```

这将返回定义位置（文件、行、列）。如果未找到，请报告错误并停止。

### 第 2 步 — 校验可否重命名

在第 1 步的定义位置调用 `mcp__lsp__prepare_rename`：

```
mcp__lsp__prepare_rename
  file_path: "<file from Step 1>"
  line: <line from Step 1>
  column: <column from Step 1>
```

`prepare_rename` 会询问语言服务器该位置是否允许重命名。
若返回错误（例如符号是关键字、内置标识符，或该位置无法重命名），**立即停止**并报告：

> Cannot rename `OldName`: <server error message>
> Common causes: built-in or keyword, imported external package, or position is
> not on the symbol name. Try locating the declaration site directly.

仅当 `prepare_rename` 成功时继续第 3 步。

### 第 3 步 — 枚举引用

在第 1 步的定义位置调用 `mcp__lsp__find_references`：

```
mcp__lsp__find_references
  file_path: "<file from Step 1>"
  position_pattern: "<symbol>@@"   # @@ immediately after the symbol name
  # fallback: use line/column from Step 1 if position_pattern is unavailable
```

收集返回的全部位置。记录总数以及不同的文件数。

### 第 4 步 — 干跑预览

使用 `dry_run=true` 调用 `mcp__lsp__rename_symbol`。**不要调用 `apply_edit`。**

```
mcp__lsp__rename_symbol
  file_path: "<file from Step 1>"
  line: <line from Step 1>
  column: <column from Step 1>
  new_name: "<new_name>"
  dry_run: true
```

响应将包含带有全部拟议更改的 `workspace_edit`，以及描述范围的
`preview.note`。

### 第 5 步 — 报告影响并硬停止

向用户展示预览摘要：

```
Rename preview: OldName -> NewName
  Locations to update: N (from find_references count)
  Files affected:      M (distinct files in workspace_edit)
  Language server:     <gopls | typescript-language-server | rust-analyzer | ...>

Changes:
  path/to/file1.go  lines 12, 45, 78
  path/to/file2.go  line 3
  ...
```

**必须硬停止 — 未经用户明确确认不得继续：**

> Proceed with rename? [y/n]

等待用户输入。在用户回答“y”或“yes”前，不得应用任何编辑。

---

## 边界情况：0 个引用

如果 `find_references` 返回空列表（符号存在但无外部使用），在停止前先警告用户：

> Warning: no references found for `OldName`. The symbol may be unexported,
> dead code, or the LSP index may be stale. Renaming will update only the
> declaration site.
> Proceed anyway? [y/n]

若用户回答“n”，则停止。若为“y”，则继续第二阶段。

---

## 第二阶段：执行

仅在第一阶段确认提示中用户回答“y”或“yes”后，才能进入此阶段。

### 第 1 步 — 捕获重命名前诊断

在应用更改前，采集当前诊断状态：

```
mcp__lsp__get_diagnostics
  file_path: "<one or more files in the workspace_edit>"
```

将结果保存为 `before_diagnostics`。

### 第 2 步 — 执行重命名（直接应用）

调用 `mcp__lsp__rename_symbol` 时不使用 `dry_run`（或使用 `dry_run=false`）：

```
mcp__lsp__rename_symbol
  file_path: "<file from Phase 1 Step 1>"
  line: <line from Phase 1 Step 1>
  column: <column from Phase 1 Step 1>
  new_name: "<new_name>"
```

在不使用 `dry_run` 时，`rename_symbol` **会将编辑直接写入磁盘**并返回摘要（例如
`Renamed to "NewName" across N location(s) in M file(s): ...`）。
之后**不要**再调用 `apply_edit`，也不要手工重建编辑：该编辑不会以可复制回传的数据形式离开服务器，这是此前文件被破坏（范围偏移错位、`newText` 被截断）的原因。
`apply_edit` 仍仅用于其文本匹配模式（`file_path` + `old_text` + `new_text`），不用于提交重命名。

### 第 3 步 — 检查诊断

对受影响文件调用 `mcp__lsp__get_diagnostics`，并与 `before_diagnostics` 对比：

```
mcp__lsp__get_diagnostics
  file_path: "<affected files>"
```

计算新增与已解决的错误，并展示诊断摘要（见
[references/patterns.md](references/patterns.md)）。

---

## 输出格式

第二阶段完成后，显示：

```
## Rename Summary
- Old name: OldName
- New name: NewName
- Files changed: M
- Locations updated: N
- Post-rename errors: 0
```

若有错误变化，请附带诊断摘要（格式见
[references/patterns.md](references/patterns.md)）。

仅在 `N > 0` 时显示诊断摘要部分。净变化为 0 表示重命名安全。

---

## 语言支持

已在 `gopls`、`typescript-language-server` 和 `rust-analyzer` 上测试。
大多数符合 LSP 的服务器都支持 `textDocument/rename`——`agent-lsp` 适配
30+ 个支持重命名能力的语言服务器。
如不确定，请通过 `mcp__lsp__get_server_capabilities` 检查你的服务器能力列表。
