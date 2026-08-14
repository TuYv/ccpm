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
> 需要 agent-lsp MCP 服务器。

# lsp-rename：安全地重命名符号

分两个阶段在整个工作区中重命名符号：先预览，只有在获得明确确认后才执行。绝不会在未展示影响范围的情况下进行重命名。

**调用方式：** 用户提供 `old_name`（要重命名的符号）和 `new_name`（替换后的名称）。可选择提供 `workspace_root` 以限定搜索范围。

---

## 前置条件

如果 LSP 尚未初始化，请先使用工作区根目录调用 `mcp__lsp__start_lsp`。提供文件路径时会自动推断，但切换工作区时必须显式启动。

---

## 阶段 1：预览

查找符号、枚举所有引用，并生成试运行预览。**此阶段不要应用任何编辑。**

### 步骤 1 — 定位符号

调用 `mcp__lsp__go_to_symbol`，并将 `symbol_path` 设置为 `old_name`：

```
mcp__lsp__go_to_symbol
  symbol_path: "old_name"        # or "Package.OldName" for qualified paths
  workspace_root: "<root>"       # optional; omit to search entire workspace
```

这会返回定义所在位置（文件、行、列）。如果未找到，请报告错误并停止。

### 步骤 2 — 验证是否可以重命名

在步骤 1 获取的定义位置调用 `mcp__lsp__prepare_rename`：

```
mcp__lsp__prepare_rename
  file_path: "<file from Step 1>"
  line: <line from Step 1>
  column: <column from Step 1>
```

`prepare_rename` 会询问语言服务器在此位置进行重命名是否有效。如果返回错误（例如，该符号是关键字、内置符号，或位于服务器无法重命名的位置），请**立即停止**并报告：

> 无法重命名 `OldName`：<服务器错误消息>
> 常见原因：内置符号或关键字、导入的外部包，或者当前位置不在符号名称上。请尝试直接定位声明位置。

仅当 `prepare_rename` 成功时，才继续执行步骤 3。

### 步骤 3 — 枚举引用

在步骤 1 获取的定义位置调用 `mcp__lsp__find_references`：

```
mcp__lsp__find_references
  file_path: "<file from Step 1>"
  position_pattern: "<symbol>@@"   # @@ immediately after the symbol name
  # fallback: use line/column from Step 1 if position_pattern is unavailable
```

收集返回的所有位置。记录位置总数和不同文件的数量。

### 步骤 4 — 试运行预览

使用 `dry_run=true` 调用 `mcp__lsp__rename_symbol`。**不要调用 `apply_edit`。**

```
mcp__lsp__rename_symbol
  file_path: "<file from Step 1>"
  line: <line from Step 1>
  column: <column from Step 1>
  new_name: "<new_name>"
  dry_run: true
```

响应中包含一个列出所有拟议更改的 `workspace_edit`，以及一个描述范围的 `preview.note`。

### 步骤 5 — 报告影响并强制停止

向用户显示预览摘要：

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

**必需的强制停止点——未经用户明确确认，不得继续：**

> 是否继续重命名？[y/n]

等待用户输入。在用户回答 "y" 或 "yes" 之前，不要应用任何编辑。

---

## 边界情况：0 个引用

如果 `find_references` 返回空列表（符号存在，但没有外部用法），请在停止前警告用户：

> 警告：未找到 `OldName` 的引用。该符号可能未导出、属于死代码，
> 或者 LSP 索引可能已过期。重命名将仅更新声明位置。
> 是否仍要继续？[y/n]

如果用户回答 "n"，则停止。如果回答 "y"，则继续进入阶段 2。

---

## 阶段 2：执行

仅在用户对阶段 1 中的确认提示回答 "y" 或 "yes" 后，才能进入此阶段。

### 步骤 1——捕获重命名前的诊断信息

应用更改前，捕获当前的诊断状态：

```
mcp__lsp__get_diagnostics
  file_path: "<one or more files in the workspace_edit>"
```

将结果存储为 `before_diagnostics`。

### 步骤 2——执行重命名（直接应用）

调用 `mcp__lsp__rename_symbol`，不指定 `dry_run`（或指定 `dry_run=false`）：

```
mcp__lsp__rename_symbol
  file_path: "<file from Phase 1 Step 1>"
  line: <line from Phase 1 Step 1>
  column: <column from Phase 1 Step 1>
  new_name: "<new_name>"
```

如果不指定 `dry_run`，`rename_symbol` 会**自行将编辑应用到磁盘**，并返回摘要（`Renamed to "NewName" across N location(s) in M file(s): ...`）。之后**不要**调用 `apply_edit`，也不要手动重新构造编辑：编辑永远不会以需要你复制回去的数据形式离开服务器，而这种复制正是之前导致文件损坏的原因（范围偏移量转置、`newText` 被截断）。`apply_edit` 仍用于其文本匹配模式（`file_path` + `old_text` + `new_text`），而不是用于提交重命名。

### 步骤 3——检查诊断信息

对受影响的文件调用 `mcp__lsp__get_diagnostics`，并与 `before_diagnostics` 进行比较：

```
mcp__lsp__get_diagnostics
  file_path: "<affected files>"
```

计算新增和已解决的错误，并显示诊断摘要（参见 [references/patterns.md](references/patterns.md)）。

---

## 输出格式

阶段 2 完成后，显示：

```
## Rename Summary
- Old name: OldName
- New name: NewName
- Files changed: M
- Locations updated: N
- Post-rename errors: 0
```

如果有任何错误发生变化，请随后显示诊断摘要（格式见 [references/patterns.md](references/patterns.md)）。

仅显示 N > 0 的诊断摘要章节。净变化为 0 表示此次重命名是安全的。

---

## 语言支持

已使用 `gopls`、`typescript-language-server` 和 `rust-analyzer` 进行测试。大多数符合 LSP 规范的服务器都支持 `textDocument/rename`——agent-lsp 可与 30 多种受支持的语言服务器中的任何一种配合工作，前提是该服务器声明了重命名能力。如果不确定，请通过 `mcp__lsp__get_server_capabilities` 检查服务器的能力列表。