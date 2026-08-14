---
name: lsp-test-correlation
description: Find and run the tests that cover a source file. Use after editing a file to discover exactly which test files and test functions need to run — without running the entire test suite.
argument-hint: "[file-path] [optional: run=true]"
user-invocable: true
allowed-tools: mcp__lsp__get_tests_for_file mcp__lsp__find_symbol mcp__lsp__open_document mcp__lsp__run_tests
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  optional-capabilities: workspaceSymbolProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-test-correlation

查找哪些测试覆盖了某个源文件，然后仅运行这些测试。当你修改了一两个文件并希望获得有针对性的反馈时，这比运行完整测试套件更快。

## 何时使用

- 编辑源文件后：“这次更改需要运行哪些测试？”
- 提交前：仅运行覆盖你所修改内容的测试
- 调试失败：查找哪个测试文件对应出现问题的源文件
- 代码审查：在合并前了解某个文件已有的测试覆盖情况

如果你想运行完整测试套件并检查所有三个层面（诊断 + 构建 + 测试），请改用 `/lsp-verify`。如果你希望快速执行限定范围的测试，请使用此技能。

---

## 工作流程

### 第 1 步 — 查找关联的测试文件

对每个已编辑的源文件调用 `get_tests_for_file`：

```
mcp__lsp__get_tests_for_file({ "file_path": "/abs/path/to/source.go" })
```

返回与该源文件对应的测试文件。对于多个已编辑的文件，每个文件调用一次。

**如果未返回任何测试文件：**该源文件可能没有专用测试文件，或者无法解析映射关系（例如，集成测试位于单独的目录中）。请参阅第 2 步了解回退方案。

### 第 2 步 — 枚举测试函数（回退或补充）

如果 `get_tests_for_file` 返回了测试文件，请使用 `find_symbol` 列出这些文件中定义的测试函数：

```
mcp__lsp__find_symbol({ "query": "Test" })
```

将结果筛选为第 1 步中关联的测试文件。这样你就可以获得要运行的具体测试函数名称，而不必运行整个测试文件。

**回退方案（未找到测试文件）：**使用 `find_symbol` 查询名称中包含已更改符号名称的测试函数：

```
mcp__lsp__find_symbol({ "query": "Test<ChangedFunctionName>" })
```

这可以涵盖 `get_tests_for_file` 遗漏间接覆盖关系的情况。

### 第 3 步 — 报告关联映射

运行测试之前，报告找到的内容：

```
## Test correlation for <file>

Source file: internal/tools/analysis.go
Test files:
  → internal/tools/analysis_test.go
     Tests: TestHandleGetCodeActions, TestHandleGetCompletions, TestHandleGetDocumentSymbols

No correlated test files found for: internal/lsp/normalize.go
  → Fallback: TestNormalizeCompletion, TestNormalizeDocumentSymbols (from workspace symbol search)
```

如果用户提供了 `run=true` 或要求运行测试，请继续执行第 4 步。否则在此停止，让用户决定。

### 第 4 步 — 运行关联测试

仅运行关联的测试文件或函数。尽可能严格地限定范围：

**Go — 运行特定包：**
```
mcp__lsp__run_tests({ "workspace_dir": "<root>", "test_filter": "TestHandleGetCodeActions|TestHandleGetCompletions" })
```

如果 `run_tests` 不支持 `test_filter`，请传入包路径而不是工作区根目录，以缩小范围。与运行 `./...` 相比，测试输出会更少，执行速度也会更快。

**输出处理：**如果测试输出很大，请勿完整读取。搜索失败项：
```
grep -E "^(FAIL|--- FAIL)" <output_file>
```

### 步骤 5 — 报告结果

```
## Test Results

Ran 3 tests in internal/tools/analysis_test.go

PASSED (2):
  TestHandleGetCodeActions
  TestHandleGetCompletions

FAILED (1):
  TestHandleGetDocumentSymbols — expected 3 symbols, got 2 (analysis_test.go:87)

Recommendation: Fix TestHandleGetDocumentSymbols before committing.
```

---

## 多文件工作流

对于涉及多个源文件的更改：

1. 为每个已更改的文件并行调用 `get_tests_for_file`。
2. 对返回的测试文件去重（同一个测试文件可能覆盖多个源文件）。
3. 在运行之前报告完整的关联映射。
4. 将去重后的测试集运行一次。

```
## Test correlation for 3 changed files

internal/tools/analysis.go      → internal/tools/analysis_test.go
internal/lsp/client.go          → internal/lsp/client_test.go, internal/lsp/client_completion_test.go
internal/resources/resources.go → (no dedicated test file)

Deduplicated test files to run: 3
```

---

## 决策指南

| 情况 | 操作 |
|-----------|--------|
| `get_tests_for_file` 返回测试文件 | 使用这些文件；通过 `find_symbol` 枚举函数 |
| 未返回测试文件 | 回退到使用已更改的符号名称调用 `find_symbol` |
| 找到测试文件，但没有匹配的测试函数 | 报告覆盖缺口——此源文件可能缺少单元测试覆盖 |
| 返回超过 10 个测试文件 | 不要全部运行；改用 `/lsp-verify` 运行完整测试套件 |
| 测试失败 | 运行 `/lsp-verify` 以获取完整的诊断信息 |

---

## 示例

```
# "I edited internal/tools/symbol_source.go — which tests should I run?"

get_tests_for_file(file_path="/repo/internal/tools/symbol_source.go")
  → internal/tools/symbol_source_test.go

find_symbol(query="TestGetSymbolSource")
  → TestGetSymbolSource_ContainsPosition (line 12)
  → TestGetSymbolSource_FindInnermost (line 34)
  → TestGetSymbolSource_PositionPattern (line 67)

# Report correlation, then run:
run_tests(workspace_dir="/repo", test_filter="TestGetSymbolSource")
  → 3 passed in 0.4s
```