---
name: lsp-edit-export
description: Safe workflow for editing exported symbols or public APIs. Use when changing a function signature, modifying a public type, or altering any symbol used outside its own package — finds all callers first so nothing breaks silently.
argument-hint: "[symbol-name]"
user-invocable: true
allowed-tools: mcp__lsp__go_to_symbol mcp__lsp__open_document mcp__lsp__find_references mcp__lsp__get_diagnostics mcp__lsp__run_build mcp__lsp__replace_symbol_body Edit Write
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: referencesProvider
  optional-capabilities: workspaceSymbolProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-edit-export

用于编辑导出符号的安全工作流。始终先查找所有调用方，再修改任何代码，之后验证变更是否干净。

## 何时使用

每当你打算更改**导出符号**的签名、名称或行为时，都应使用此技能：导出符号是指在其定义所在的包或模块之外可见的符号。

**特定语言中的定义：**

| 语言       | 导出意味着……                                                           |
|------------|------------------------------------------------------------------------|
| Go         | 标识符以大写字母开头（例如 `MyFunc`、`MyType`）                        |
| TypeScript | 带有 `export` 关键字；或是公共类成员（没有 `private`）                 |
| Python     | 不以 `_` 开头；或明确列在 `__all__` 中                                 |
| Java/C#    | 带有 `public` 或 `protected` 可见性修饰符                              |
| Rust       | 带有 `pub` 关键字                                                      |

如果你不确定某个符号是否已导出，请将其视为已导出，并照常运行此工作流。代价只是多调用几次工具；好处是绝不会破坏隐藏的调用方。

即使你认为调用方数量为零，也**不要跳过此工作流**。第 3 步中的确认关卡正是为这种情况设置的。

## 工作流

**如果 LSP 尚未初始化**，请先使用工作区根目录调用 `mcp__lsp__start_lsp`。（agent-lsp 支持根据文件路径自动推断，因此仅在切换工作区或冷启动会话时才需要显式启动。）

### 第 1 步——定位符号

使用 `go_to_symbol` 按名称查找符号的定义，无需预先知道其文件路径或行号：

```
mcp__lsp__go_to_symbol({
  "symbol_path": "PackageName.ExportedFunction",
  "workspace_root": "/abs/path/to/repo"   // optional, narrows scope
})
```

`symbol_path` 使用点号表示法。对于包 `codec` 中的顶层函数 `Encode`，使用 `"codec.Encode"`。对于类型 `Buffer` 上的方法 `Reset`，使用 `"Buffer.Reset"`。最后一个组成部分是叶名称；当前缀用于在多个符号具有相同叶名称时消除歧义。

该工具会返回一个 `FormattedLocation`，其中包含定义所在的文件以及从 1 开始计数的行号/列号。记录此位置——你将在第 2 步中用到它。

### 第 2 步——查找所有调用方

调用 `find_references`，使用 `position_pattern` 字段将光标位置表示为可读的文本模式，而不是原始坐标。`@@` 标记表示光标所在的确切位置（即紧跟在 `@@` 后面的字符）：

```
mcp__lsp__find_references({
  "file_path": "<definition file from step 1>",
  "position_pattern": "func @@ExportedFunction(",
  "include_declaration": false
})
```

`@@` 必须紧接在符号名称的第一个字符之前。示例：

- `"func @@Encode("`——Go 函数声明
- `"type @@Buffer struct"`——Go 类型声明
- `"export function @@parse("`——TypeScript 函数
- `"class @@Parser:"`——Python 类
- `"pub fn @@process("`——Rust 函数

如果你的 MCP 客户端不支持 `position_pattern`，请改用步骤 1 返回的位置中的
`line` 和 `column` 字段。

该工具会返回代码库中引用位置的列表。

### 步骤 3 — 确认关卡（必需 — 绝不可跳过）

在进行任何更改之前，向用户展示影响摘要，并要求其明确确认。
即使调用方数量为零，此关卡也必须执行。

请按以下格式展示该关卡：

```
## Impact Check: <SymbolName>

- Definition: <file>:<line>
- Callers found: N reference(s) in M file(s)

Files with callers:
  - <file1>
  - <file2>
  ...

Proceed with the edit? [y/n]
```

如果用户回答 **n**，则停止。不要进行任何编辑。

如果用户回答 **y**，则继续执行步骤 4。

**即使调用方为 0 也需要此关卡的原因：** LSP 索引可能并不完整
（例如，文件尚未保存、工作区尚未完全加载）。调用方为零只是一个数据点，
而非保证。

### 步骤 4 — 进行编辑

使用 `Edit` 或 `Write` 应用预期更改。替换完整的函数或方法体时，
可选择使用 `replace_symbol_body`，它会按名称解析符号并替换其完整范围，
无需进行位置计算：

```
mcp__lsp__replace_symbol_body({
  "file_path": "<definition file>",
  "symbol_path": "ExportedFunction",
  "new_body": "<new full definition>"
})
```

对于其他编辑（签名更改、局部修改），请使用 `Edit` 或 `Write`。
遵循该语言的标准编辑工作流。如果进行重命名，还要更新步骤 2 中识别出的所有
调用点；不要留下已损坏的调用方。

在编辑**之前**收集诊断信息，以便在步骤 5 中进行基线比较：

```
mcp__lsp__get_diagnostics({
  "file_path": "<definition file>"
})
```

然后应用编辑，并在编辑后再次收集诊断信息。

### 步骤 5 — 检查诊断信息

使用 [references/patterns.md](references/patterns.md) 中的格式比较编辑前后的诊断快照。

如果出现新错误，请先修复再继续。存在已知且尚未解决的诊断错误时，不要运行构建。

### 步骤 6 — 运行构建

```
mcp__lsp__run_build({
  "workspace_root": "/abs/path/to/repo"
})
```

干净的构建结果可确认所有受影响的包中均无编译错误。
如果构建失败，请使用步骤 5 中的错误输出和诊断数据进行排查。
修复后重新运行，直至构建通过。

### 步骤 7 — 报告

输出最终结果块：

```
## Edit Summary
- Symbol: <name> (<kind>)
- Callers found: N in M files
- Diagnostics: net +N/-N
- Build: PASSED / FAILED
```

如果构建结果为 FAILED，请包含最前面的 3–5 行错误信息和简要诊断。

## 示例

```
Goal: rename exported function `ParseConfig` → `LoadConfig` in pkg/config

Step 1 — go_to_symbol: symbol_path="config.ParseConfig"
  → pkg/config/parser.go:42:6

Step 2 — find_references: position_pattern="func @@ParseConfig("
  → 7 references in 4 files

Step 3 — gate:
  ## Impact Check: ParseConfig
  - Definition: pkg/config/parser.go:42
  - Callers found: 7 in 4 files
  Files: cmd/main.go, internal/app.go, internal/loader.go, pkg/config/parser_test.go
  Proceed? [y/n] → y

Step 4 — edit: rename declaration + all 7 call sites

Step 5 — diagnostics: net 0 (no new errors)

Step 6 — build: PASSED

Step 7 — report:
  ## Edit Summary
  - Symbol: LoadConfig (function)
  - Callers found: 7 in 4 files
  - Diagnostics: net 0
  - Build: PASSED
```

## 关于 position_pattern 的说明

带有 `@@` 的 `position_pattern` 是 agent-lsp 扩展。如果你的 MCP 客户端
或服务器不支持该扩展，请改用步骤 1 中 `go_to_symbol` 返回的位置所提供的显式 `line` 和 `column`
参数。