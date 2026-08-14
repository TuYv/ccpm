---
name: lsp-docs
description: Three-tier documentation lookup for any symbol — hover → offline toolchain doc → source definition. Use when hover text is absent, insufficient, or the symbol is in an unindexed dependency.
argument-hint: "[symbol-name]"
user-invocable: true
allowed-tools: mcp__lsp__inspect_symbol mcp__lsp__get_symbol_documentation mcp__lsp__go_to_definition mcp__lsp__get_symbol_source
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: hoverProvider
  optional-capabilities: definitionProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-docs

针对任意符号的三级文档查询。适用于语言服务器不可用、悬停返回空结果，或符号位于 gopls 或 pyright 未建立索引的传递依赖项中时。

只读——不会修改任何文件。

**调用方式：** 用户以完全限定形式提供 `symbol_name`（例如
`"fmt.Println"`、`"std::vec::Vec::new"`、`"os.path.join"`）。还可以选择提供同一模块中任意文件的
`file_path`，这有助于改善 Go 包解析。

---

## 决策表

| 情况 | 推荐层级 |
|-----------|-----------------|
| 符号位于当前工作区 | 第 1 层级（悬停） |
| 符号位于直接依赖项中 | 第 2 层级（工具链文档） |
| 符号位于传递依赖项中（未被 LSP 索引） | 第 2 层级 |
| 没有可用的 LSP 服务器 | 第 2 层级 → 第 3 层级 |
| 未安装工具链（例如 Rust 环境中没有 cargo） | 第 3 层级 |

---

## 第 1 层级——LSP 悬停（快速、实时、基于位置）

使用文件路径和光标位置（从 1 开始）调用 `inspect_symbol`。

```
mcp__lsp__inspect_symbol({
  "file_path": "/abs/path/to/file.go",
  "line": 42,
  "column": 8
})
```

如果结果包含非空的 `contents` 字段，且其中有有用的类型和文档信息，**到此为止并将其返回**。悬停是最快的方式，应始终优先尝试。

如果悬停返回空的 `contents`，或语言服务器尚未初始化，
则继续执行第 2 层级。

---

## 第 2 层级——离线工具链文档（权威、基于名称）

使用完全限定的符号名称和
`language_id` 调用 `get_symbol_documentation`。这会从本地工具链（go doc、
pydoc、cargo doc）获取文档，无需 LSP 会话。适用于语言服务器未建立索引的传递
依赖项。

```
mcp__lsp__get_symbol_documentation({
  "symbol": "fmt.Println",
  "language_id": "go",
  "file_path": "/abs/path/to/any/file/in/the/module.go",  // optional, improves Go pkg resolution
  "format": "markdown"   // optional: wraps signature in code fence
})
```

**结果解读：**

- 如果 `source == "toolchain"`：向用户返回 `doc` 和 `signature` 字段。这些内容具有权威性——直接来源于已安装的工具链，已移除 ANSI 转义序列，可以直接显示。
- 如果 `source == "error"`：记录 `error` 字段（工具链失败原因），然后继续执行第 3 层级。

---

## 第 3 层级——源代码定义（最后手段）

调用 `go_to_definition` 导航到符号定义，然后调用
`get_symbol_source` 提取源代码文本。只要符号存在于工作区或模块缓存中，即使没有语言服务器，此方法也始终有效。

```
mcp__lsp__go_to_definition({
  "file_path": "/abs/path/to/caller.go",
  "line": 42,
  "column": 8
})
// → returns definition location

mcp__lsp__get_symbol_source({
  "file_path": "<definition file from above>",
  "line": <definition line from above>
})
// → returns full function/type source text
```

将源代码文本呈现给用户，并注明这是原始源代码，而非渲染后的文档。

---

## `lsp-impact` 集成说明

在对不熟悉的符号运行 `lsp-impact` 之前，请调用
`get_symbol_documentation` 以了解其签名和语义。这可以避免因对
符号功能的错误假设而误读影响报告。

---

## 示例

```
Goal: look up documentation for http.ListenAndServe in a Go project

Tier 1 — inspect_symbol: cursor on "ListenAndServe" in main.go:14:6
  → contents: "" (empty — server not initialized)
  Proceed to Tier 2.

Tier 2 — get_symbol_documentation:
  symbol: "net/http.ListenAndServe"
  language_id: "go"
  file_path: "/Users/you/code/myapp/main.go"
  format: "markdown"

  Result:
  {
    "symbol": "net/http.ListenAndServe",
    "language": "go",
    "source": "toolchain",
    "doc": "func ListenAndServe(addr string, handler http.Handler) error\n\nListenAndServe listens on the TCP network address addr and then calls Serve...",
    "signature": "func ListenAndServe(addr string, handler http.Handler) error",
    "error": ""
  }

  source == "toolchain" → return doc and signature to user. Done.

Tier 3 — skipped (Tier 2 succeeded)
```