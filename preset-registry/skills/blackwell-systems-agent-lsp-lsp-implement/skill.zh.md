---
name: lsp-implement
description: Find all concrete implementations of an interface or abstract type. Use when you need to know what types satisfy an interface, or what subtypes exist before changing a base type.
argument-hint: "[interface-or-type-name]"
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__get_server_capabilities mcp__lsp__go_to_symbol mcp__lsp__go_to_implementation mcp__lsp__type_hierarchy mcp__lsp__open_document
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: implementationProvider
  optional-capabilities: typeHierarchyProvider workspaceSymbolProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-implement

查找实现某个接口的所有具体类型，或某个抽象类型的所有子类型。只读——不会修改任何文件。

在更改接口签名、向接口添加方法或移除基类型方法**之前**使用此技能。它会告诉你必须更新的所有类型。

**调用方式：** 用户提供 `type_name`（例如 `"Handler"`、`"io.Reader"`）。也可以选择提供 `workspace_root`。

---

## 前置条件

检查服务器能力——`go_to_implementation` 和 `type_hierarchy` 是可选功能，并非所有语言服务器都实现了这些功能：

```
mcp__lsp__get_server_capabilities()
```

确认 `supported_tools` 中是否包含 `go_to_implementation` 和 `type_hierarchy`。后续步骤取决于此结果。

如果两者均不受支持，则报告 `"Server does not support implementation
lookup"` 并停止。

---

## 第 1 步——定位接口或类型

```
mcp__lsp__go_to_symbol({
  "symbol_path": "<TypeName>",
  "workspace_root": "/abs/path"   // optional
})
→ returns: file, line, column (1-indexed)
```

打开文件，以便语言服务器跟踪该文件：

```
mcp__lsp__open_document({
  "file_path": "<file from go_to_symbol>"
})
```

记录 `file`、`line`、`column`，供后续步骤使用。

---

## 第 2 步——查找所有实现

仅当 `supported_tools` 中包含 `go_to_implementation` 时执行。

```
mcp__lsp__go_to_implementation({
  "file_path": "<file>",
  "line": <line>,
  "column": <column>
})
```

返回位置列表——每个位置对应一个满足该接口的具体类型。按文件分组。记录类型名称及其位置。

如果不支持 `go_to_implementation`：跳过此步骤，并在报告中注明。

---

## 第 3 步——类型层次结构（子类型和父类型）

仅当 `supported_tools` 中包含 `type_hierarchy` 时执行。

```
mcp__lsp__type_hierarchy({
  "file_path": "<file>",
  "line": <line>,
  "column": <column>,
  "direction": "subtypes"   // use "both" to also see what this type extends
})
```

`subtypes` 返回扩展或嵌入此类型的具体类型。
`supertypes` 返回此类型本身所实现的类型。

与第 2 步的结果进行交叉核对——两者的并集即为完整的实现范围。

如果不支持 `type_hierarchy`：跳过此步骤，并在报告中注明。

---

## 第 4 步——报告

```
## Implementation Report: <TypeName>

### Definition
- File: <file>:<line>
- Kind: interface / abstract type / base struct

### Concrete Implementations (<N> found)
- TypeA — <file>:<line>
- TypeB — <file>:<line>
...

### Type Hierarchy
Supertypes: [list or "none"]
Subtypes: [list or "same as implementations above" or "not supported"]

### Risk Assessment
| N implementations | Recommendation |
|---|---|
| 0 | Interface unused or no external implementors found. May be internal-only. |
| 1–3 | Low risk. All implementors can be updated together. |
| 4–10 | Medium risk. Plan updates package by package. |
| > 10 | High risk. Changing the interface is a breaking API change. |
```

---

## 常见使用场景

**在向接口添加方法之前：**
运行 lsp-implement，找出所有需要添加新方法的类型。每个实现位置都必须更新——这就是你必须完成的变更清单。

**在移除方法之前：**
找出实现该方法的所有类型。检查是否有任何外部（此仓库之外的）包可能受到影响。

**理解陌生代码库中的多态：**
在进行任何更改之前，对主要接口运行 lsp-implement，以查看完整的类型层次结构。

---

## 语言说明

| 语言 | `go_to_implementation` 查找... |
|---|---|
| Go | 方法集匹配的所有类型 |
| TypeScript | 实现该接口的所有类 |
| Java/C# | 实现该接口的所有类/结构体 |
| Rust | 所有包含 `impl Trait for ...` 的结构体 |

对于 Go：对接口运行 `go_to_implementation` 会找出所有满足该接口的类型，即使没有显式的 `implements` 声明。