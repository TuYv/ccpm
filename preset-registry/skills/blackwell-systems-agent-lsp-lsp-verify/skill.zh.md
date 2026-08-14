---
name: lsp-verify
description: Full three-layer verification after any change — LSP diagnostics + compiler build + test suite, ranked by severity. Use after completing any edit, refactor, or feature to confirm nothing is broken before committing.
user-invocable: true
allowed-tools: mcp__lsp__get_diagnostics mcp__lsp__run_build mcp__lsp__run_tests mcp__lsp__get_tests_for_file mcp__lsp__suggest_fixes mcp__lsp__format_document mcp__lsp__apply_edit
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  optional-capabilities: codeActionProvider documentFormattingProvider
  tool_permissions:
    phases:
      test_correlation:
        description: "Pre-step: map changed source files to their test files"
        allowed:
          - "mcp__lsp__get_tests_for_file"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      diagnostics:
        description: "Layer 1: collect LSP diagnostics for changed files"
        allowed:
          - "mcp__lsp__start_lsp"
          - "mcp__lsp__get_diagnostics"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      build:
        description: "Layer 2: run compiler build"
        allowed:
          - "mcp__lsp__run_build"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      tests:
        description: "Layer 3: run test suite"
        allowed:
          - "mcp__lsp__run_tests"
          - "Bash"                         # scoped test commands for large repos
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      fix_and_format:
        description: "Post-verification: apply code action fixes and format"
        allowed:
          - "mcp__lsp__suggest_fixes"
          - "mcp__lsp__apply_edit"
          - "mcp__lsp__format_document"
          - "mcp__lsp__get_diagnostics"    # re-check after fixes
        forbidden:
          - "mcp__lsp__simulate_*"
          - "mcp__lsp__run_build"          # re-run full verify instead
          - "mcp__lsp__run_tests"          # re-run full verify instead
    global_forbidden:
      - "mcp__lsp__simulate_*"             # verify is post-edit, not speculative
      - "mcp__lsp__rename_symbol"          # verify does not make semantic changes
---
> 需要 agent-lsp MCP 服务器。

# lsp-verify：三层验证

## 何时使用

在进行任何重大更改后运行此技能，以在各个层面验证正确性：

- 编辑源文件后（逻辑更改、重构、新增函数）
- 合并或变基分支后
- 更新依赖项或更改配置后
- 提交或推送代码前

## 输入

- `workspace_dir`（必需）：工作区根目录的绝对路径（例如 `/Users/you/code/myproject`）
- `changed_files`（可选）：你编辑过的文件列表——用于定向诊断

## 执行

### 前置步骤：测试关联（当提供 `changed_files` 时）

在运行这三个层次之前，对每个已更改的源文件调用 `get_tests_for_file`，以构建源文件 → 测试文件映射：

```
mcp__lsp__get_tests_for_file({ "file_path": "<changed/source/file>" })
```

该调用会返回与每个源文件对应的测试文件。保存此映射——第 3 层将使用它来聚焦失败分析。如果 `changed_files` 未知，则跳过此步骤。

**并行运行全部三个层次**——它们彼此独立，无需按顺序执行。在同一条消息中发出全部三个调用，以尽量缩短总耗时。

### 第 1 层：LSP 诊断

调用 `mcp__lsp__get_diagnostics`，并将 `file_path` 设置为每个已更改的文件。`get_diagnostics` 接受的是文件路径，而不是工作区目录。

注意：需要先初始化 LSP。如果尚未运行，请先使用工作区根目录调用 `start_lsp`。

```
mcp__lsp__get_diagnostics({ "file_path": "<path/to/changed/file>" })
```

对每个已更改的文件调用一次。如果你不知道哪些文件发生了更改，则对本次会话中涉及的主要文件调用它。按严重程度对结果排序：错误优先，其次是警告。

### 第 2 层：构建

```
mcp__lsp__run_build({ "workspace_dir": "<workspace_dir>" })
```

返回 `{ "success": bool, "errors": [...] }`。构建失败意味着代码无法编译。构建错误会阻止发布——必须在发布前解决。

### 第 3 层：测试

```
mcp__lsp__run_tests({ "workspace_dir": "<workspace_dir>" })
```

不需要 `start_lsp`。返回 `{ "passed": bool, "failures": [...] }`。

**大量输出警告：** 在大型仓库上运行 `run_tests` 可能会返回数十万字符，并超出上下文窗口。如果结果被保存到文件而不是以内联方式返回，请勿尝试读取整个文件。应改为在其中搜索失败项：

```bash
grep -E "^(FAIL|--- FAIL)" <output_file>
```

或者，将测试范围限定为前置步骤中关联的测试文件，以彻底避免输出过大的问题：

```bash
GOWORK=off go test -count=1 -short ./internal/mypackage/... 2>&1 | grep -E "FAIL|ok"
```

**使用测试关联：** 如果前置步骤生成了源文件 → 测试文件映射，请根据该映射交叉核对失败的测试名称。对于每个失败项，请注明它位于关联的测试文件中（直接覆盖已更改的代码），还是位于无关的测试文件中（由共享依赖项引起的连带失败）。这一区分有助于确定应优先调查的位置。

测试失败属于阻塞问题——它们表示存在回归或未满足的契约。

## 输出格式

运行全部三个层级后，生成一份结构化报告：

```
## Verification Report

### Layer 1: LSP Diagnostics
[CLEAN / N errors, M warnings]

<details if N > 0 or M > 0>
Errors:
- file:line - message

Warnings:
- file:line - message
</details>

### Layer 2: Build
[PASSED / FAILED - N errors]

<details if FAILED>
- error message (file:line)
</details>

### Layer 3: Tests
[PASSED / FAILED - N failures]

<details if FAILED>
- test name: message (file:line) [correlated / unrelated]
</details>

<if test correlation map exists>
Test files covering changed source:
  changed/source/file.go → test/source_file_test.go
</if>

### Summary
Overall: CLEAN / NEEDS ATTENTION
Blocking issues: [errors that must be fixed before shipping]
```

- **CLEAN**：所有层级均无错误（警告仅供参考）
- **NEEDS ATTENTION**：发现一个或多个阻塞问题

## 阻塞问题与建议项

| 层级 | 错误 | 警告 |
|-------|--------|----------|
| LSP 诊断 | 阻塞 | 建议 |
| 构建 | 全部阻塞 | 不适用 |
| 测试 | 全部阻塞 | 不适用 |

构建错误和测试失败会阻止发布。LSP 警告和样式建议仅供参考——应记录它们，但不要将其视为阻塞问题，除非它们表明存在逻辑错误。

## 验证通过时：可选格式

如果全部三个层级均为 CLEAN 且 `changed_files` 已知，则在提交前询问是否要格式化已更改的文件：

```
mcp__lsp__format_document({ "file_path": "<changed-file>" })
```

如果返回的 `TextEdit[]` 非空，则通过 `apply_edit` 应用。对每个已更改的文件运行一次。如果用户未请求格式化，则跳过。

---

## 发现错误时：应用代码操作

如果第 1 层返回错误，LSP 可能会提供快速修复。对于每个错误位置，调用 `suggest_fixes` 以显示可用的修复：

```
mcp__lsp__suggest_fixes({
  "file_path": "<file>",
  "line": <error line>,
  "column": <error column>
})
```

返回可用操作的列表（例如“添加缺失的导入”“实现接口方法”“删除未使用的变量”）。选择最合适的操作并应用：

```
mcp__lsp__apply_edit({
  "file_path": "<file>",
  "old_text": "<text to replace>",
  "new_text": "<replacement>"
})
```

或者，如果代码操作返回 `workspace_edit`，则通过 `workspace_edit` 参数将其直接传递给 `apply_edit`。

应用后，在继续下一步之前，**对受影响的文件重新运行第 1 层**，以确认错误已解决。不要在未逐一验证的情况下批量应用多个代码操作——它们之间可能会相互影响。

**适用场景：** 由缺失导入、未实现的接口方法或类型不匹配引起的编译错误通常可以使用一键修复。对于逻辑错误，仍然需要手动分析。