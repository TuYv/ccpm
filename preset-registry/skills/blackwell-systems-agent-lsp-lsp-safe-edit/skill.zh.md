---
name: lsp-safe-edit
description: Wrap any code edit with before/after diagnostic comparison. Speculatively previews the change first (preview_edit), then applies to disk only if the error delta is acceptable. If post-edit errors appear, surfaces code actions for quick fixes. Handles single and multi-file edits.
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__open_document mcp__lsp__get_diagnostics mcp__lsp__preview_edit mcp__lsp__simulate_chain mcp__lsp__suggest_fixes mcp__lsp__format_document mcp__lsp__apply_edit Edit Write Bash
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  optional-capabilities: codeActionProvider documentFormattingProvider
  tool_permissions:
    phases:
      setup:
        description: "Open files and capture baseline diagnostics"
        allowed:
          - "mcp__lsp__start_lsp"
          - "mcp__lsp__open_document"
          - "mcp__lsp__get_diagnostics"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      speculative_preview:
        description: "Simulate the edit in memory before touching disk"
        allowed:
          - "mcp__lsp__preview_edit"
          - "mcp__lsp__simulate_chain"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      apply:
        description: "Write the change to disk"
        allowed:
          - "Edit"
          - "Write"
          - "mcp__lsp__apply_edit"
        forbidden:
          - "mcp__lsp__simulate_*"
      verify_and_fix:
        description: "Collect post-edit diagnostics, surface code actions, format"
        allowed:
          - "mcp__lsp__get_diagnostics"
          - "mcp__lsp__suggest_fixes"
          - "mcp__lsp__apply_edit"        # for applying code action fixes
          - "mcp__lsp__format_document"
        forbidden:
          - "mcp__lsp__simulate_*"
          - "mcp__lsp__run_build"
          - "mcp__lsp__run_tests"
    global_forbidden:
      - "mcp__lsp__rename_symbol"          # safe-edit uses direct edits
      - "mcp__lsp__blast_radius"      # blast radius is lsp-impact's job
---
> 需要 agent-lsp MCP 服务器。

# lsp-safe-edit

对任何代码编辑执行编辑前后的诊断对比。在写入磁盘之前，先在内存中以推测方式预览更改，然后对比应用更改后新引入与已解决的错误。如果出现错误，则提供可用于修复这些错误的代码操作。

## 前置条件

必须已为目标工作区运行 LSP。如果尚未初始化，请先使用工作区根目录调用 `mcp__lsp__start_lsp`，然后再继续。

自动初始化说明：agent-lsp 支持根据文件路径自动推断工作区。仅在切换工作区根目录时才需要显式调用 `start_lsp`。

## 输入

- **目标文件：** 一个或多个要编辑的文件（绝对路径）。
- **更改说明：** 你打算编辑什么以及原因。

---

## 工作流程

### 第 1 步 — 打开目标文件

对每个将要编辑的文件调用 `mcp__lsp__open_document`：

```
mcp__lsp__open_document(file_path: "/abs/path/to/file.go", language_id: "go")
```

### 第 2 步 — 获取基线诊断（编辑前）

对每个目标文件调用 `mcp__lsp__get_diagnostics`。将结果存储为 BEFORE。
对于多文件编辑，收集所有相关文件的诊断信息。

```
BEFORE = mcp__lsp__get_diagnostics(file_path: "/abs/path/to/file.go")
```

如果服务器在打开文件后立即返回空列表，请稍等片刻并重试——LSP 分析是异步进行的。

### 第 3 步 — 推测性预览（preview_edit）

在写入磁盘之前，调用 `mcp__lsp__preview_edit`，以预览预期更改导致的错误增量：

```
mcp__lsp__preview_edit(
  file_path: "/abs/path/to/file.go",
  start_line: <N>,
  start_column: <col>,
  end_line: <N>,
  end_column: <col>,
  new_text: "<replacement text>"
)
```

返回 `net_delta`（新引入的错误数减去已解决的错误数），且不会写入磁盘。

**决策：**

| `net_delta` | 操作 |
|-------------|--------|
| ≤ 0 | 继续——编辑改善了错误状态或未使其恶化 |
| > 0 | **暂停。** 向用户报告新引入的错误，并询问：“仍要继续吗？[y/n]” |

如果 `net_delta > 0` 且用户回答“n”，则停止。不要应用编辑。

**多文件编辑：** `preview_edit` 每次处理一个文件。对于跨多个文件的编辑，分别为每个文件运行该操作并将增量相加。如果任何文件显示 `net_delta > 0`，请在继续之前暂停。

**何时跳过第 3 步：** 如果预期更改是创建新文件（Write），则没有可供模拟的现有文件。跳至第 4 步。

### 第 3b 步 — 使用 simulate_chain 进行重构预览（重命名和签名更改）

当更改涉及重命名、签名更改，或任何包含依赖性后续编辑的情况（例如，在添加参数后更新所有调用位置）时，使用此步骤**代替第 3 步或在第 3 步之后执行**。

`simulate_chain` 会在内存中应用一系列推测性编辑，并报告累积更改是否安全——不会写入磁盘：

```
mcp__lsp__simulate_chain({
  "workspace_root": "/abs/path/to/workspace",
  "language": "go",
  "edits": [
    {
      "file_path": "/abs/path/to/file.go",
      "start_line": <N>, "start_column": <col>,
      "end_line": <N>,   "end_column": <col>,
      "new_text": "<replacement>"
    },
    // additional dependent edits (e.g. call site updates) ...
  ]
})
```

返回：
- `cumulative_delta` — 所有步骤的错误净变化
- `safe_to_apply_through_step` — 可以安全地依次应用多少个步骤

**决策：**

| `cumulative_delta` | `safe_to_apply_through_step` | 操作 |
|--------------------|------------------------------|--------|
| ≤ 0 | = 总步骤数 | 所有步骤均安全。继续执行步骤 4。 |
| ≤ 0 | < 总步骤数 | 在该步骤之前（含该步骤）是安全的。检查剩余步骤。 |
| > 0 | 任意 | 出现净回归。继续之前向用户报告。 |

**何时使用步骤 3b：**
- 重命名导出的符号并更新其调用点
- 添加/移除参数并更新所有调用方
- 任何编辑顺序存在依赖关系的多文件重构

**何时跳过步骤 3b：**
- 不存在后续依赖编辑的简单原地编辑（步骤 3 已足够）
- 创建新文件（没有可供模拟的现有文本）

### 步骤 4 — 将编辑应用到磁盘

使用 Edit 或 Write 工具应用更改：

- 对现有文件中的定向替换使用 `Edit`。
- 仅在创建新文件或进行完整重写时使用 `Write`。

```
Edit(file_path: "/abs/path/to/file.go", old_string: "...", new_string: "...")
```

对于多文件编辑，请先应用每个文件的更改，再收集编辑后的
诊断信息（步骤 5）。如果任何单项编辑失败，请停止并报告，不要
继续应用剩余文件的编辑。

### 步骤 5 — 捕获编辑后的诊断信息（AFTER）

对每个已编辑的文件再次调用 `mcp__lsp__get_diagnostics`。存储为 AFTER。

```
AFTER = mcp__lsp__get_diagnostics(file_path: "/abs/path/to/file.go")
```

对于多文件编辑，请收集所有文件的诊断信息并合并结果。

### 步骤 6 — 计算诊断差异

比较 BEFORE 和 AFTER：

- **新增** = AFTER 中存在但 BEFORE 中不存在的诊断信息（新问题）。
- **已解决** = BEFORE 中存在但 AFTER 中不存在的诊断信息（已修复的问题）。

使用 `(file, line, message)` 元组进行匹配，以处理行号偏移。分别处理
`error` 和 `warning` 严重级别。

### 步骤 7 — 如果引入了错误，则呈现代码操作

如果出现任何新的 `error` 严重级别诊断，请在每个错误位置调用 `mcp__lsp__suggest_fixes`
以呈现快速修复：

```
mcp__lsp__suggest_fixes(
  file_path: "<file>",
  start_line: <error line>,
  start_column: 1,
  end_line: <error line>,
  end_column: 999
)
```

向用户报告可用的代码操作：

```
Errors introduced (2):
  file.go:34 — undefined: MyType
    → Code action: Import "mypackage" (quickfix)
  file.go:51 — cannot use int as string
    → No code actions available

Apply code actions? [y/n/select]
```

如果用户接受，请通过 `mcp__lsp__apply_edit` 应用代码操作的 `WorkspaceEdit`，
然后重新收集诊断信息并重新计算差异。

### 步骤 8 — 格式化（可选）

如果诊断差异没有问题（净变化 ≤ 0），则提议通过语言服务器格式化已编辑的
文件：

```
mcp__lsp__format_document({ "file_path": "/abs/path/to/file" })
```

返回 `TextEdit[]`。如果非空，请立即应用：

```
mcp__lsp__apply_edit({ "workspace_edit": <TextEdit[]> })
```

如果用户未要求格式化，或者仍有未解决的错误，请跳过此步骤（应先修复错误，再进行格式化）。

### 第 9 步 — 使用 DiagnosticDiffFormat 报告

输出最终摘要：

```
## Edit Summary

Files changed: N
Errors introduced: A  →  Errors resolved: B  (net: A-B)
Warnings introduced: C  →  Warnings resolved: D

### Introduced errors
- file.go:34 — undefined: MyType

### Resolved errors
- file.go:12 — unused variable: x
```

---

## 决策指南

| 净变化 | 操作 |
|------------|--------|
| 0 | 安全。没有新增错误。 |
| 负数 | 净改善——已解决错误。安全。 |
| 正数（执行代码操作后） | **不要提交。** 提议还原。 |

执行代码操作后净变化 > 0 时：

1. 显示所有剩余新增错误的完整列表。
2. 提议在后续 `Edit` 调用中使用原始 `old_string` 进行还原。
3. 等待用户决定后再继续。

净变化 > 0 时，不要提交或暂存文件。

---

## 多文件工作流

对于涉及多个文件的编辑（例如，更改函数签名及其所有调用位置）：

1. 在第 1 步中**打开所有文件**。
2. 收集所有文件的**变更前诊断信息**。
3. 在第 3 步中**分别模拟每个文件**——对 `net_delta` 值求和。
4. 在第 4 步中**逐个文件应用编辑**——首次失败时停止。
5. 收集所有文件的**变更后诊断信息**并合并。
6. 对任何出现新错误的文件检查**代码操作**。

在最终摘要中报告所有文件合并后的诊断差异。