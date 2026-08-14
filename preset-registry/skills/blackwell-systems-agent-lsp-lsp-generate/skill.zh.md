---
name: lsp-generate
description: Trigger language server code generation — implement interface stubs, generate test skeletons, add missing methods, generate mock types. Uses suggest_fixes to surface generator options and execute_command to run them.
argument-hint: "[file-path:line:col] [generation-intent]"
user-invocable: true
allowed-tools: mcp__lsp__suggest_fixes mcp__lsp__execute_command mcp__lsp__apply_edit mcp__lsp__format_document mcp__lsp__get_diagnostics mcp__lsp__open_document mcp__lsp__get_server_capabilities mcp__lsp__go_to_symbol
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: codeActionProvider
  optional-capabilities: workspaceSymbolProvider documentFormattingProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-generate

**lsp-generate 用于创建文件中尚不存在的新代码**——存根、模拟、接口实现、测试函数。它不同于用于重构现有代码的 `lsp-extract-function`。当你希望语言服务器编写新内容时，请使用 `lsp-generate`；当你希望重新组织现有代码时，请使用 `lsp-extract-function`。

## 输入

- **`file_path`**：目标文件的绝对路径
- **`line`, `column`**（或 **`position_pattern`**）：触发生成操作的文件位置（例如，包含未实现接口、缺失方法错误或类型声明的行）
- **`intent`**：要生成的内容描述（例如，"implement io.Reader"、"generate test skeleton"、"add missing methods"、"generate mock for Handler"）

## 前置条件

必须已为目标工作区运行 LSP。如果尚未初始化，请先使用工作区根目录调用 `mcp__lsp__start_lsp`。

自动初始化说明：agent-lsp 支持根据文件路径自动推断工作区。仅在切换工作区根目录时才需要显式调用 `start_lsp`。

---

## 工作流程

### 第 1 步——打开文档并定位位置

为目标文件调用 `mcp__lsp__open_document`：

```
mcp__lsp__open_document(file_path: "/abs/path/to/file.go", language_id: "go")
```

如果使用 `position_pattern`，请使用 `references/patterns.md` 中的 @@ 标记约定来确定准确的光标位置。例如：

```
"position_pattern": "var _ io.Reade@@r = (*MyType)(nil)"
```

### 第 2 步——获取目标位置的代码操作

```
mcp__lsp__suggest_fixes({
  "file_path": "...",
  "start_line": N,
  "start_column": C,
  "end_line": N,
  "end_column": C
})
```

筛选生成器操作：
- Kind 为 `"quickfix"`，且标题与意图匹配（例如，"Implement
  interface"、"Generate"、"Add stub"、"Create test"）
- Kind 为 `"source"`，用于源代码级生成

如果未找到匹配的操作，请报告 "No generator action available at this
position for the given intent"，然后继续执行下面的后备方案部分。

### 第 3 步——选择并确认操作

向用户展示可用的生成器操作。如果有多个操作与意图匹配，请列出所有操作并询问要应用哪一个。执行前确认所选操作——存在多个候选项时，**不要**自动选择。

### 第 4 步——执行生成器

一次执行一个生成器。不要批量执行多个 `execute_command` 调用。

- 如果操作包含 `command` 字段：通过 `mcp__lsp__execute_command` 运行
- 如果操作包含 `edit` 字段：通过 `mcp__lsp__apply_edit` 应用
- 如果操作同时包含两者：先应用编辑，再运行命令

### 第 5 步——格式化并验证

```
mcp__lsp__format_document({ "file_path": "..." })
mcp__lsp__get_diagnostics({ "file_path": "..." })
```

报告剩余的诊断信息。存根方法通常会保留 TODO 注释或 `panic("not implemented")` 方法体——这是语言服务器的预期行为。指出所有非预期错误。

---

## 各语言的生成器模式

| 语言 | 生成器 | 触发位置 | 代码操作类型 |
|----------|-----------|-----------------|-----------------|
| Go (gopls) | 实现接口 | 包含 `var _ MyInterface = (*MyType)(nil)` 的行或类型声明 | `quickfix` — “实现接口” |
| Go (gopls) | 生成测试文件 | 任何没有对应 _test.go 文件的 .go 文件 | `source` — “生成单元测试” |
| Go (gopls) | 添加缺失的方法 | 出现 `undefined: method` 错误的行 | `quickfix` |
| TypeScript (typescript-language-server) | 实现接口 | 类声明 | `quickfix` — “实现接口成员” |
| TypeScript (typescript-language-server) | 添加缺失的方法 | 调用了未定义方法的位置 | `quickfix` — “添加缺失的函数声明” |
| Python (pyright) | 添加导入 | 名称未定义 | `quickfix` — “添加导入” |
| Rust (rust-analyzer) | 实现 trait | `impl Trait for Type {}` | `quickfix` — “添加缺失的 impl 成员” |

---

## 没有可用代码操作时的回退方案

如果 `suggest_fixes` 没有返回生成器操作，则此工作区中的语言服务器可能不支持针对此意图的服务端生成。向用户说明这一点，并根据具体意图建议手动处理方案：

- **实现接口：** 首先使用 `mcp__lsp__go_to_symbol` 查找接口定义，以确定所有必需的方法，然后手动实现这些方法。
- **测试骨架：** 检查 `mcp__lsp__get_server_capabilities`，确认服务器是否声明支持代码操作；如果不支持，则按照标准测试包约定手动生成测试骨架。
- **缺失的方法：** 使用 `mcp__lsp__get_diagnostics` 按名称列出缺失的符号，然后逐一实现它们。

---

## 约束

- 不要批量调用 `execute_command`——一次只运行一个生成器
- 当有多个生成器操作可用时，不要跳过用户确认