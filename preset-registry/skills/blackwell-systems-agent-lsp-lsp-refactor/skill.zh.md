---
name: lsp-refactor
description: End-to-end safe refactor workflow — blast-radius analysis, speculative preview, apply to disk, verify build, run affected tests. Inlines lsp-impact + lsp-safe-edit + lsp-verify + lsp-test-correlation into one coordinated sequence.
argument-hint: "[symbol-or-file] [intent]"
user-invocable: true
allowed-tools: mcp__lsp__blast_radius mcp__lsp__preview_edit mcp__lsp__simulate_chain mcp__lsp__get_diagnostics mcp__lsp__run_build mcp__lsp__run_tests mcp__lsp__get_tests_for_file mcp__lsp__apply_edit mcp__lsp__replace_symbol_body mcp__lsp__open_document mcp__lsp__format_document Edit Write
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: referencesProvider
  optional-capabilities: documentFormattingProvider
  tool_permissions:
    phases:
      blast_radius:
        description: "Phase 1: analyze impact before any edits"
        allowed:
          - "mcp__lsp__blast_radius"
          - "mcp__lsp__go_to_symbol"
          - "mcp__lsp__find_references"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "mcp__lsp__simulate_*"
          - "Edit"
          - "Write"
      speculative_preview:
        description: "Phase 2: simulate edits in memory, compare diagnostics"
        allowed:
          - "mcp__lsp__open_document"
          - "mcp__lsp__get_diagnostics"
          - "mcp__lsp__preview_edit"
          - "mcp__lsp__simulate_chain"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      apply:
        description: "Phase 3: write changes to disk and format"
        allowed:
          - "mcp__lsp__apply_edit"
          - "mcp__lsp__format_document"
          - "Edit"
          - "Write"
        forbidden:
          - "mcp__lsp__simulate_*"
          - "mcp__lsp__rename_symbol"
      build_verification:
        description: "Phase 4: check diagnostics and run the build"
        allowed:
          - "mcp__lsp__get_diagnostics"
          - "mcp__lsp__run_build"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
      test_execution:
        description: "Phase 5: find and run affected tests"
        allowed:
          - "mcp__lsp__get_tests_for_file"
          - "mcp__lsp__run_tests"
        forbidden:
          - "mcp__lsp__apply_edit"
          - "Edit"
          - "Write"
    global_forbidden:
      - "mcp__lsp__rename_symbol"        # refactor uses edit, not rename
---
> 需要 agent-lsp MCP 服务器。

# lsp-refactor

端到端的安全重构工作流。通过一次协调执行，依次完成影响范围分析、推测性预览、磁盘应用、构建验证和针对性测试执行。

**此技能不能替代 lsp-safe-edit 或 lsp-impact。**
- `lsp-safe-edit` 封装单次编辑，并比较编辑前后的诊断结果——当你需要进行一项有针对性的更改，并仔细对比错误差异时，请使用它。
- `lsp-impact` 是只读的影响范围分析——当你希望先了解影响范围，再决定是否继续时，请使用它。
- `lsp-refactor` 按顺序执行全部四个工作流（lsp-impact → lsp-safe-edit → lsp-verify → lsp-test-correlation）。当你已经明确目标和意图，并希望无需切换技能即可完成整个工作流时，请使用它。

---

## 输入

- **target**：使用点号表示法的符号名称（例如 `"codec.Encode"`、`"Buffer.Reset"`）
  或文件路径（例如 `"internal/lsp/client.go"`）
- **intent**：对要进行的更改的描述（例如 "rename to ParseConfigV2"、
  "add a second parameter `timeout time.Duration`"）
- **workspace_root**：工作区根目录的绝对路径

---

## 阶段 1 — 影响范围分析（内联自 lsp-impact）

**此阶段为必选阶段。即使是“小型”重构，也不要跳过。**

调用 `mcp__lsp__blast_radius`，并将 `changed_files` 设置为包含目标符号的文件。如果用户直接提供了文件路径，则使用该路径。如果用户提供了符号名称，则先解析出对应文件（例如通过 `mcp__lsp__go_to_symbol`）。

```
mcp__lsp__blast_radius({
  "changed_files": ["/abs/path/to/file"],
  "include_transitive": false
})
```

返回：
- `affected_symbols` — 带有引用计数的导出符号
- `test_callers` — 测试文件及其所在测试函数的名称
- `non_test_callers` — 生产代码中的调用位置

**显示：**
- 受影响的符号数量
- 测试调用方（每项均附带其所在测试函数的名称）
- 非测试调用方（每项均附带 file:line）
- 引用总数

**高影响范围关卡：** 如果引用总数超过 20，停止并请求用户确认后再继续：

```
High blast radius: N callers found. Proceed with refactor? [y/n]
```

如果用户回答 "n"，则中止。不要进入阶段 2。

---

## 阶段 2 — 推测性预览（内联自 lsp-safe-edit）

仅当阶段 1 的影响范围可接受时（调用方数量 ≤ 20，或用户已确认）才会进入此阶段。

### 2a — 打开文件并获取基线诊断

```
mcp__lsp__open_document({ "file_path": "/abs/path/to/file", "language_id": "go" })
mcp__lsp__get_diagnostics({ "file_path": "/abs/path/to/file" })
```

将基线诊断存储为 BEFORE。

### 2b — 推测性模拟

对于**单文件更改**：使用 `preview_edit`：

```
mcp__lsp__preview_edit({
  "file_path": "/abs/path/to/file",
  "start_line": <N>,
  "start_column": <col>,
  "end_line": <N>,
  "end_column": <col>,
  "new_text": "<replacement text>"
})
```

对于**多文件更改**（例如重命名并更新调用位置）：使用 `simulate_chain`：

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
    }
    // additional dependent edits ...
  ]
})
```

### 2c — 评估模拟结果

使用 [references/patterns.md](references/patterns.md) 中的诊断差异输出格式显示推测性结果。

**决策：**

| `net_delta` | 操作 |
|-------------|--------|
| ≤ 0 | 安全。继续进入阶段 3。 |
| > 0 | **中止。** 报告引入的错误。不要应用到磁盘。 |

如果 `net_delta > 0`，则停止并显示模拟所引入错误的完整列表。不要继续进入阶段 3。

---

## 阶段 3 — 应用到磁盘

仅当阶段 2 的 `net_delta <= 0` 时才会进入此阶段。

使用 Edit 或 Write 工具应用更改。当编辑目标是完整的函数或方法体时，可以使用 `mcp__lsp__replace_symbol_body` 作为替代方案；它会按名称解析符号并替换其完整范围，无需计算位置：

```
mcp__lsp__replace_symbol_body({
  "file_path": "/abs/path/to/file",
  "symbol_path": "Package.Function",
  "new_body": "func Function() error {\n\treturn nil\n}"
})
```

对于通过模拟计算出的编辑，如果模拟返回了编辑对象，可以直接使用 `mcp__lsp__apply_edit`：

```
Edit(file_path: "/abs/path/to/file", old_string: "...", new_string: "...")
```

对于多文件更改，请先应用每个文件的编辑，然后再进入阶段 4。如果任何一项应用失败，请停止并报告，不要继续应用其余文件。

应用后，格式化已更改的文件：

```
mcp__lsp__format_document({ "file_path": "/abs/path/to/file" })
```

如果返回的 `TextEdit[]` 非空，请通过 `mcp__lsp__apply_edit` 应用。

---

## 阶段 4 — 构建验证（内联自 lsp-verify）

按此顺序运行——先执行 LSP 诊断，再执行编译器构建：

```
mcp__lsp__get_diagnostics({ "file_path": "/abs/path/to/file" })
mcp__lsp__run_build({ "workspace_root": "/abs/path/to/workspace" })
```

**决策：**

| 结果 | 操作 |
|--------|--------|
| 诊断无错误，构建通过 | 继续进入阶段 5。 |
| 诊断显示新错误 | 显示错误并停止。不要继续进入阶段 5。 |
| 构建失败 | 显示构建输出并停止。不要继续进入阶段 5。 |

如果构建失败，请报告完整的构建错误输出并停止。在构建通过之前，跳过测试执行。

---

## 阶段 5 — 运行受影响的测试（内联自 lsp-test-correlation）

对于阶段 3 中更改的每个文件，查找相关联的测试文件：

```
mcp__lsp__get_tests_for_file({ "file_path": "/abs/path/to/changed/file" })
```

如果更改了多个源文件，请对生成的测试文件去重。仅运行相关联的测试文件：

```
mcp__lsp__run_tests({ "workspace_root": "/abs/path/to/workspace", "test_files": [...] })
```

**如果未找到相关联的测试文件：**注明“未找到测试关联——请手动运行完整测试套件以确认。”不要尝试自动运行 `./...`。

---

## 中止条件

以下条件会立即中止工作流。每次中止都会在停止前显示相关输出。

1. **阶段 1：** 爆炸半径 > 20 个调用方，且用户未确认 → 中止
2. **阶段 2：** `net_delta > 0`（模拟引入了错误）→ 中止，并显示错误
3. **阶段 4：** 构建失败 → 中止，并显示构建输出
4. **任意阶段：** LSP 工具返回意外错误 → 中止，并逐字报告工具输出

---

## 输出格式

完成所有阶段后，生成以下结构化报告：

```
## lsp-refactor Complete

### Phase 1 — Blast Radius
Affected symbols: N
Test callers: M  (list each with enclosing test function)
Non-test callers: K

### Phase 2 — Speculative Preview
[Diagnostic Diff Output Format from patterns.md]
net_delta: 0 → safe to apply

### Phase 3 — Applied
Files changed: [list]

### Phase 4 — Build Verification
Diagnostics: N errors (0 new)
Build: PASS

### Phase 5 — Test Results
Test files run: [list]
Result: PASS / FAIL
```

如果工作流在某个阶段中止，则仅报告已完成的阶段和中止原因：

```
## lsp-refactor Aborted at Phase 2

### Phase 1 — Blast Radius
...

### Phase 2 — Speculative Preview
ABORTED: net_delta: +2 (errors introduced)
Errors:
- file.go:34 — undefined: NewType
- file.go:51 — cannot use int as string
```

---

## 示例

```
Goal: rename exported function ParseConfig → ParseConfigV2 in pkg/config

Phase 1 — Blast Radius
  blast_radius(changed_files=["pkg/config/parser.go"])
  → affected_symbols: 1 (ParseConfig)
  → non_test_callers: 3 (cmd/main.go, internal/app.go, internal/loader.go)
  → test_callers: 1 (pkg/config/parser_test.go — TestParseConfig)
  → total references: 4 — within threshold, proceeding

Phase 2 — Speculative Preview
  open_document(file_path="pkg/config/parser.go")
  get_diagnostics → BEFORE: 0 errors
  simulate_chain(edits: [parser.go rename + 3 call-site updates])
  → cumulative_delta: 0 → safe to apply

Phase 3 — Applied
  Edit parser.go: func ParseConfig → func ParseConfigV2
  Edit cmd/main.go, internal/app.go, internal/loader.go: update call sites
  format_document(parser.go)

Phase 4 — Build Verification
  get_diagnostics → 0 errors
  run_build → success

Phase 5 — Test Results
  get_tests_for_file(parser.go) → pkg/config/parser_test.go
  run_tests(test_files=["pkg/config/parser_test.go"]) → PASS

## lsp-refactor Complete
...
```