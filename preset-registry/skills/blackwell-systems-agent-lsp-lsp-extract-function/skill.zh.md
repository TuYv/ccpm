---
name: lsp-extract-function
description: Extract a selected code block into a named function. Primary path uses the language server's extract-function code action; falls back to manual extraction when no code action is available. Validates captured variables, scope shadowing, and compilation after extraction.
argument-hint: "[file-path] [start-line] [end-line] [new-function-name]"
user-invocable: true
allowed-tools: mcp__lsp__list_symbols mcp__lsp__suggest_fixes mcp__lsp__execute_command mcp__lsp__apply_edit mcp__lsp__get_diagnostics mcp__lsp__open_document mcp__lsp__format_document mcp__lsp__get_server_capabilities
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: codeActionProvider
  optional-capabilities: documentFormattingProvider documentSymbolProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-extract-function：将代码块提取为具名函数

**此 Skill 会重构现有代码**——它会获取已经存在的代码，并将其移入一个新函数中。这与 `/lsp-generate` 不同，后者会创建尚不存在的新代码（桩代码、模拟对象、接口实现）。当代码已经编写完成时，请使用此 Skill；当你需要从头生成代码时，请使用 `/lsp-generate`。

**调用方式：** 用户提供 `file_path`（绝对路径）、`start_line` 和 `end_line`（从 1 开始计数的范围），以及 `new_function_name`（提取后函数的期望名称）。

---

## 前置条件

如果 LSP 尚未初始化，请先使用工作区根目录调用 `mcp__lsp__start_lsp`。提供文件路径时会自动推断，但切换工作区时必须显式启动。

---

## 第 1 步——获取上下文（文档符号）

调用 `mcp__lsp__open_document` 打开文件，然后调用 `mcp__lsp__list_symbols` 以了解所在函数和作用域：

```
mcp__lsp__open_document({ "file_path": "<file_path>" })
mcp__lsp__list_symbols({ "file_path": "<file_path>" })
```

由此可确定：
- 选区位于哪个函数中
- `new_function_name` 是否已存在于文件中（名称冲突检查）

**强制名称冲突检查：** 如果 `new_function_name` 已作为符号存在于文档符号列表中，请报告冲突并立即停止：

> 无法提取：函数 `new_function_name` 已存在于此文件中。
> 请选择其他名称并重试。

---

## 第 2 步——检查服务器功能

调用 `mcp__lsp__get_server_capabilities` 以了解语言服务器支持的功能：

```
mcp__lsp__get_server_capabilities({})
```

检查响应中是否存在 `codeActionProvider`。注意 `execute_command` 是否列在 `executeCommandProvider.commands` 中。这将决定主要路径（第 3 步）是否可用。

---

## 第 3 步——主要路径：LSP 代码操作

使用选区范围调用 `mcp__lsp__suggest_fixes`：

```
mcp__lsp__suggest_fixes({
  "file_path": "<file_path>",
  "start_line": N,
  "start_column": 1,
  "end_line": M,
  "end_column": 999
})
```

筛选返回的操作以查找提取函数操作：包括 `kind` 包含 `"refactor.extract"` 的任何操作，或者 `title` 同时包含 "Extract" 和 "function" 的任何操作（不区分大小写）。

**如果找到提取函数操作：**
- 向用户显示操作标题
- 如果操作建议的名称与 `new_function_name` 不同，请在继续之前请求确认
- 如果操作包含 `command` 字段，则通过 `mcp__lsp__execute_command` 执行：
  ```
  mcp__lsp__execute_command({
    "command": "<action.command.command>",
    "arguments": <action.command.arguments>
  })
  ```
- 或者，如果操作包含 `edit` 字段，则通过 `mcp__lsp__apply_edit` 直接应用：
  ```
  mcp__lsp__apply_edit({ "workspace_edit": <action.edit> })
  ```
- 应用后跳至第 5 步。

**如果未找到提取函数操作：** 转至第 4 步（手动回退方案）。

---

## 第 4 步 — 手动回退

当没有可用的代码操作时，执行手动提取：

### a) 分析选区

读取选中的行（从 `start_line` 到 `end_line`），并识别：
- **参数：** 在选区内使用但在选区外声明的变量
  （从外部作用域捕获——必须成为函数参数）
- **返回值：** 在选区内声明但在选区外使用的变量
  （必须从提取出的函数中返回）
- **提前返回：** 选区内的返回语句（提取出的函数
  必须封装这些语句）

### b) 构造并确认建议的签名

根据捕获变量的分析结果构建提取出的函数签名。
在写入前向用户显示建议的签名：

> 建议的提取：
> ```
> func new_function_name(param1 Type1, param2 Type2) (ReturnType, error) {
>     // selected lines
> }
> ```
> 是否使用此签名继续？[y/n]

等待用户确认后再应用任何编辑。

### c) 应用提取（顺序很重要）

按顺序应用编辑——不要将不同代码行区域的编辑合并到单个 `apply_edit` 调用中：

1. **首先：** 将选中的行替换为对新函数的调用：
   ```
   mcp__lsp__apply_edit({
     "workspace_edit": {
       "changes": {
         "<file_path>": [{
           "range": { "start": { "line": start_line-1, "character": 0 },
                      "end":   { "line": end_line,     "character": 0 } },
           "newText": "    result := new_function_name(args...)\n"
         }]
       }
     }
   })
   ```

2. **其次：** 在包含选区的函数的右花括号之后插入新函数定义：
   ```
   mcp__lsp__apply_edit({
     "workspace_edit": {
       "changes": {
         "<file_path>": [{
           "range": { "start": { "line": insert_line, "character": 0 },
                      "end":   { "line": insert_line, "character": 0 } },
           "newText": "\nfunc new_function_name(params) ReturnType {\n    ...\n}\n"
         }]
       }
     }
   })
   ```

先替换调用点，再插入新函数。此顺序
可在编辑期间保持行号不变：替换调用点不会改变
新函数定义的插入位置。

---

## 第 5 步 — 验证

通过任一路径完成提取后：

### 1. 检查诊断信息

```
mcp__lsp__get_diagnostics({ "file_path": "<file_path>" })
```

如果报告了错误，请将其与下方的常见原因表一同显示。

### 2. 常见的提取后错误

| 错误类型 | 可能的原因 | 修复方法 |
|------------|--------------|-----|
| 未定义变量 | 捕获的变量未作为参数传递 | 添加参数 |
| 类型不匹配 | 返回类型推断错误 | 调整签名中的返回类型 |
| 名称遮蔽外部名称 | 新函数名称与外部作用域中的名称相同 | 选择其他名称 |
| 未使用的变量 | 调用点未接收返回值 | 在调用点添加变量 |

### 3. 格式化文档

```
mcp__lsp__format_document({ "file_path": "<file_path>" })
```

这会清理由提取操作引入的缩进。

---

## 输出格式

完成提取后，显示：

```
## Extraction Summary
- File:           path/to/file.go
- Extracted:      lines N–M
- New function:   new_function_name
- Path used:      LSP code action / Manual fallback
- Post-extraction errors: 0
```

如果错误发生了变化，随后附上诊断摘要（格式见
[references/patterns.md](references/patterns.md)）。

---

## 特定语言说明

- **Go：** gopls 可能会针对选定范围在代码操作中提供 "Extract function"。
  请先检查代码操作；gopls 的支持情况因版本而异。
- **TypeScript/JavaScript：** typescript-language-server 可能会提供 "Extract to function in global scope"
  或 "Extract to inner function"——在第 3 步中按这些标题进行筛选。
- **Python：** pylsp 和 pyright-langserver 通常不提供提取函数的
  代码操作。Python 文件需要使用手动回退方案（第 4 步）。