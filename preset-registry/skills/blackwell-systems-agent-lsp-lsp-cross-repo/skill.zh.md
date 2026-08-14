---
name: lsp-cross-repo
description: Cross-repository analysis — find all callers of a library symbol in one or more consumer repos. Use when refactoring a shared library and need to understand how consumers use it.
argument-hint: "[symbol-name] in [library-file:line:col] used by [consumer-root ...]"
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__find_symbol mcp__lsp__get_cross_repo_references mcp__lsp__add_workspace_folder mcp__lsp__list_workspace_folders mcp__lsp__go_to_implementation mcp__lsp__find_callers mcp__lsp__inspect_symbol
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: referencesProvider
  optional-capabilities: implementationProvider callHierarchyProvider workspaceSymbolProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-cross-repo

针对库与使用方工作流的多根目录跨仓库调用方分析。可通过一次调用查找一个或多个使用方代码库中某个库符号的所有用法。

只读——不会修改任何文件。

## 何时使用

- 修改库 API 之前：查找所有使用方中的全部调用者
- 删除符号之前：确认它没有跨仓库依赖方
- 仓库 A 中的更改可能破坏仓库 B 或 C 时
- 审计各服务对内部包的使用方式

对于单仓库的影响范围分析，请改用 `/lsp-impact`。

## 工作流

### 第 1 步——初始化主工作区

如果语言服务器尚未运行，请在库根目录启动它：

```
mcp__lsp__start_lsp({ "root_dir": "/path/to/library" })
```

### 第 2 步——定位库符号

查找符号的定义，以获取 `file_path`、`line` 和 `column`：

```
mcp__lsp__find_symbol({ "query": "<symbol-name>" })
```

选择位于库仓库中的结果（不要选择测试文件）。

### 第 3 步——查找所有跨仓库引用（主要步骤）

使用符号位置和所有使用方仓库根目录调用 `get_cross_repo_references`。此操作会将每个使用方添加为工作区文件夹，等待索引完成，在所有根目录中运行 `find_references`，并返回按仓库划分的结果：

```
mcp__lsp__get_cross_repo_references({
  "symbol_file": "/abs/path/to/library/file.go",
  "line": <line>,
  "column": <column>,
  "consumer_roots": [
    "/abs/path/to/consumer-a",
    "/abs/path/to/consumer-b"
  ]
})
```

返回：
- `library_references`——库自身内部的用法
- `consumer_references`——`consumer-root → [file:line ...]` 映射
- `warnings`——无法建立索引的根目录（请手动检查这些目录）

**第 3 步之后的决策：**

| 结果 | 操作 |
|--------|--------|
| 没有使用方引用 | 可以安全更改——先确认 `warnings` 为空 |
| 发现使用方引用 | 编辑前，对每个调用点运行 `/lsp-impact` |
| `warnings` 非空 | 手动重新添加相应根目录，然后重试第 3 步 |

### 第 4 步——调用者和实现（可选）

如需更深入地了解使用方如何调用该符号：

```
mcp__lsp__find_callers({
  "file_path": "<library-file>",
  "line": <line>,
  "column": <column>,
  "direction": "incoming"
})
```

对于接口——查找使用方的所有实现：

```
mcp__lsp__go_to_implementation({
  "file_path": "<library-file>",
  "line": <line>,
  "column": <column>
})
```

## 输出格式

```
## Library-internal references
- file:line — brief context

## Consumer references

### /path/to/consumer-a
- file:line — brief context

### /path/to/consumer-b
- file:line — brief context
```

## 决策指南

| 情况 | 操作 |
|-----------|--------|
| 没有使用方引用，且警告为空 | 可以安全更改 |
| 发现使用方引用 | 编辑前，对每个调用点运行 `/lsp-impact` |
| `warnings` 列出了使用方根目录 | 该根目录索引失败——检查 LSP 日志 |
| 使用方使用接口而非具体类型 | 使用 `go_to_implementation` 查找所有实现者 |

## 示例

```
# Refactoring ParseConfig in a shared config library used by 3 services

start_lsp(root_dir="/repos/config-lib")
find_symbol(query="ParseConfig")        # find definition → file:42:6
get_cross_repo_references(
  symbol_file="/repos/config-lib/pkg/config/parser.go",
  line=42, column=6,
  consumer_roots=["/repos/api-service", "/repos/worker-service", "/repos/batch-job"]
)
# → library_references: 2
# → consumer_references: {api-service: [main.go:14, app.go:31], worker-service: [runner.go:8]}
# → warnings: []
```