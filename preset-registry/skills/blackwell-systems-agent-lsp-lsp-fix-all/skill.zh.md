---
name: lsp-fix-all
description: Apply available quick-fix code actions for all current diagnostics in a file, one at a time with re-collection between each fix. Use to bulk-resolve errors and warnings the language server can fix automatically.
argument-hint: "[file-path]"
user-invocable: true
allowed-tools: mcp__lsp__get_diagnostics mcp__lsp__suggest_fixes mcp__lsp__apply_edit mcp__lsp__open_document mcp__lsp__format_document
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: codeActionProvider
  optional-capabilities: documentFormattingProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-fix-all

逐个应用文件中所有当前诊断可用的快速修复代码操作，
每次修复后都重新收集诊断，因为每次应用后行号都会发生
变化。

**与 `/lsp-safe-edit` 的重要区别：** 此 Skill 修复文件中**预先存在的**
诊断——即任何编辑会话开始之前就已存在的错误和警告。`/lsp-safe-edit` 包含一个代码操作步骤（步骤 7），用于修复
**由你刚刚进行的特定编辑所引入的**错误。使用此 Skill 可系统性地
批量修复现有问题，且不依赖任何编辑会话。

## 何时使用/不使用

**在以下情况下使用此 Skill：**
- 文件中积累了你希望自动解决的错误或警告
- 你希望在开始新工作前清理文件
- 你希望批量应用所有可用的语言服务器快速修复

**在以下情况下请勿使用此 Skill：**
- 你刚刚进行了编辑，并希望修复新引入的错误——请使用 `/lsp-safe-edit`
- 你希望应用结构性重构——此 Skill 仅应用快速修复（请参阅下方的筛选规则）
- 文件的诊断数量为零（此 Skill 将报告文件无问题并停止）

## 输入

- **file_path:** 要修复的文件的绝对路径。

---

## 工作流

### 步骤 1 — 打开并收集初始诊断

使用目标文件路径调用 `mcp__lsp__open_document`，以确保文件已加载到
语言服务器中。然后调用 `mcp__lsp__get_diagnostics` 获取所有
当前诊断。

如果返回的诊断数量为零：报告“未发现诊断——文件无问题。”
并停止。无需执行后续步骤。

记录初始的错误和警告数量，以用于汇总输出。

### 步骤 2 — 分类并筛选代码操作

对于每个诊断（逐个处理，不要批量处理）：

1. 在诊断的位置/范围调用 `mcp__lsp__suggest_fixes`。
2. 将返回的操作筛选为仅保留快速修复类型。
3. 跳过任何不存在适用快速修复的诊断——在汇总中注明。

**决策门槛——应应用哪些代码操作：**

| 操作类型 | 是否应用？ |
|---|---|
| `quickfix` | 是 |
| `quickfix.*` | 是 |
| `refactor` | 否——结构性变更 |
| `refactor.extract` | 否——结构性变更 |
| `refactor.inline` | 否——结构性变更 |
| `source.organizeImports` | 是——安全的格式整理 |
| `source.*`（其他） | 否——除 organizeImports 外均跳过 |
| （无类型/为空） | 否——未知，跳过 |

代码操作符合以下任一条件即可：`kind == "quickfix"`，或 `kind` 以 `"quickfix."` 开头，
或 `kind == "source.organizeImports"`。

拒绝类型为 `"refactor"`、以 `"refactor."` 开头，或完全没有
kind 字段的操作。

### 步骤 3 — 应用一个修复并重新收集（核心循环）

这是关键的正确性约束：**每次迭代绝不能应用多个修复。**
每次调用 `apply_edit` 后，文件中的行号都会发生变化。在处理下一个诊断前，
始终重新调用 `get_diagnostics`。

**循环：**

```
iteration = 0
max_iterations = 50

while iteration < max_iterations:
    diagnostics = mcp__lsp__get_diagnostics(file_path)
    if diagnostics is empty: break

    for each diagnostic in diagnostics:
        actions = mcp__lsp__suggest_fixes(diagnostic.range)
        applicable = filter to quickfix / source.organizeImports kinds (see Step 2)
        if applicable is not empty:
            apply the first applicable action via mcp__lsp__apply_edit
            record: (line, message, action title) in "Fixed" list
            iteration += 1
            break  # restart the outer loop — line numbers have shifted

    if no diagnostic in this pass had an applicable quick-fix:
        break  # no progress possible — exit loop
```

在以下情况下退出循环：
- 诊断列表为空，或
- 剩余诊断均没有适用的快速修复操作，或
- 迭代计数器达到 50（安全保护措施，用于防止修复引入新的可修复诊断等边缘情况导致无限循环）

如果 `apply_edit` 返回错误：立即停止循环，并在摘要中报告失败。不要尝试进一步修复。

### 第 4 步 — 验证并格式化

循环退出后：

1. 最后调用一次 `mcp__lsp__get_diagnostics`，以获取修复后的状态。
2. 对于没有适用快速修复的所有剩余诊断，将其列在“Skipped”部分并说明原因。
3. 调用 `mcp__lsp__format_document`，清理由已应用的编辑导致的任何缩进偏移。

### 输出格式

```
## lsp-fix-all Summary

File: /path/to/file.go
Initial diagnostics: N errors, M warnings
Fixes applied: K
Remaining (no auto-fix available): J

### Fixed
- line X: <message> → applied: <action title>

### Skipped (no quick-fix available)
- line Y: <message>
```

如果 `apply_edit` 在循环过程中失败，请追加：

```
### Loop stopped
- apply_edit returned error on line Z: <error message>
- Fixes applied before failure: K
```

---

## 安全规则

- 每次循环迭代不得应用超过一个代码操作
- 每次执行 `apply_edit` 后，必须重新收集诊断，然后才能进行下一次修复
- 切勿应用重构或结构性代码操作——仅允许快速修复和 source.organizeImports
- 如果 `apply_edit` 返回错误，请停止循环并报告失败；不要继续
- 最大迭代次数：50（安全保护措施，用于防止修复引入新的可修复诊断等边缘情况导致无限循环）
- 不要使用 `execute_command`——`apply_edit` 足以完成所有快速修复

---

## 前置条件

目标工作区必须已运行 LSP。如果尚未初始化，请先使用工作区根目录调用 `mcp__lsp__start_lsp`，然后再继续。

自动初始化说明：agent-lsp 支持根据文件路径自动推断工作区。仅在切换工作区根目录时才需要显式调用 `start_lsp`。