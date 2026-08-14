---
name: lsp-dead-code
description: Enumerate exported symbols in a file and surface those with zero references across the workspace. Use when auditing for dead code, cleaning up APIs, or checking which exports are safe to remove.
argument-hint: "[file-path]"
user-invocable: true
allowed-tools: mcp__lsp__list_symbols mcp__lsp__find_references mcp__lsp__open_document mcp__lsp__safe_delete_symbol
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: documentSymbolProvider referencesProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-dead-code

审核导出符号列表，找出零引用候选项。调用
`list_symbols` 枚举符号，然后使用 `find_references` 检查每个导出
符号以查找调用方。生成一份分类报告。

## 使用场景

当你想要识别文件中的死代码时，可以使用此技能——即已定义但从未在工作区任何位置被调用的导出
符号。常见使用场景：

- 在发布前清理 API
- 识别可以安全移除的旧版导出项
- 审核包中未使用的公共接口范围

**重要：** 此技能找出的是*候选项*。删除任何内容之前，务必
手动检查结果。请参阅下方的注意事项部分。

## 什么算作“已导出”

| 语言   | 已导出意味着……                                                      |
|------------|------------------------------------------------------------------------|
| Go         | 标识符以大写字母开头（例如 `MyFunc`、`MyType`）  |
| TypeScript | 带有 `export` 关键字；或者是公共类成员（没有 `private`）       |
| Python     | 不以 `_` 为前缀；或者显式列在 `__all__` 中               |
| Java/C#    | 带有 `public` 或 `protected` 可见性修饰符                        |
| Rust       | 带有 `pub` 关键字                                                      |

## 前提条件

如果 LSP 尚未初始化，请先使用工作区根目录调用 `mcp__lsp__start_lsp`：

```
mcp__lsp__start_lsp({ "root_dir": "/your/workspace" })
```

agent-lsp 支持根据文件路径自动推断，因此仅在切换工作区或冷启动会话时
才需要显式启动。

## 第 0 步——验证索引已完成（必需）

**不要跳过此步骤。** 索引不完整的工作区会针对实际已被引用的
符号返回 `[]`，从而产生错误的死代码候选项。

选择一个你确定正在被使用的符号（例如主构造函数或被广泛调用的实用函数）。对其调用 `find_references`：

```
mcp__lsp__find_references({
  "file_path": "/abs/path/to/file.go",
  "line": <known-active symbol line>,
  "column": <known-active symbol column>,
  "include_declaration": false
})
```

**如果返回 `[]`：** 工作区尚未完成索引。等待 3–5 秒
后重试。在已知活跃符号返回 ≥1 个引用之前，不要继续。
如果 15 秒后仍未返回结果，请使用
`mcp__lsp__restart_lsp_server` 重启 LSP 服务器，并重新打开目标文件。

## 第 1 步——打开文件并枚举符号

打开文件以便语言服务器对其进行跟踪，然后获取所有符号：

```
mcp__lsp__open_document({ "file_path": "/abs/path/to/file.go" })

mcp__lsp__list_symbols({ "file_path": "/abs/path/to/file.go" })
```

收集完整的符号列表。使用上表中对应语言的规则，仅筛选出**已导出符号**。

**坐标说明：** `list_symbols` 返回从 1 开始的坐标。
将 `selectionRange.start.line` 和 `selectionRange.start.character`
直接传递给 `find_references`——无需转换。

**“no identifier found” 错误：** 这意味着该列指向的是空白字符或关键字，而不是标识符名称。对于接收者前缀将名称向右偏移的方法，会发生这种情况（例如 `func (c *Client) MethodName`——名称从第 21 列开始，而不是第 1 列）。修复方法：使用 grep 在声明行中搜索符号名称，以确定其准确列位置：

```
grep -n "MethodName" file.go
# count characters to find the 1-based column of the name
```

然后使用修正后的列位置重试 `find_references`。

## 第 2 步——检查每个导出符号的引用

对于每个导出符号，调用 `find_references` 并设置 `include_declaration: false`，这样定义位置本身就不会计入引用数量。计数为 0 表示没有调用方，而不是没有出现过。

```
mcp__lsp__find_references({
  "file_path": "/abs/path/to/file.go",
  "line": <selectionRange.start.line>,
  "column": <selectionRange.start.character>,
  "include_declaration": false
})
```

记录每个符号的结果：
```
{ symbol_name, kind, line, reference_count, locations[] }
```

**分批说明：** 对于包含大量导出符号（>20）的文件，请每批处理 5–10 个，以免语言服务器负载过重。

**零引用交叉检查（分类为死代码前的必需步骤）：**
当 `find_references` 对看起来属于基础组件的符号（处理程序、构造函数、用作字段的类型）返回 `[]` 时，不要只相信 LSP。LSP 可能会遗漏通过值传递、接口实现或函数注册模式产生的引用（例如 `server.AddResource(HandleFoo)`）。在将其分类为死代码之前，请在主要的装配文件中运行文本搜索：

```
grep -r "SymbolName" main.go server.go cmd/ internal/
```

如果 grep 在注册或赋值上下文中找到了该名称，则该符号处于活跃状态——只是 LSP 无法解析这种间接引用。请相应更新分类。

## 第 3 步——分类并报告

根据引用数量对每个导出符号进行分类：

- **零引用（LSP + grep）**——已确认的死代码候选项。使用 WARNING 标记。
- **LSP 为零，但 grep 找到**——通过注册/值模式使用的活跃符号。标记为 ACTIVE。
- **1–2 个引用**——手动审查。可能仅在测试中使用。
- **3 个以上引用**——活跃符号。不是死代码。

对于仅测试引用：如果所有位置都位于 `_test.go` 文件（Go）或名为 `*.test.*` / `*.spec.*` 的文件中，请在报告中将该符号标记为“仅测试”，而不是“零引用”。

使用 [references/patterns.md](references/patterns.md) 中的格式生成死代码报告。

## 注意事项

以下情况即使符号在运行时确实被使用，也会产生零个 LSP 引用。未经手动审查，请勿删除任何零引用候选项：

1. **索引不完整。** `find_references` 只会搜索语言服务器已打开或已建立索引的文件。如果工作区仅建立了部分索引，结果可能不完整。第 0 步的预热检查可以发现此问题。

2. **注册模式。** 作为值传递给注册函数的符号（例如 `server.AddTool(HandleFoo)`、`http.HandleFunc("/", handler)`）从*定义位置*查找时会显示为零个 LSP 引用，因为 gopls 跟踪的是对注册函数的调用，而不是处理程序名称。在将零引用处理程序分类为死代码之前，务必使用 grep 搜索装配文件。

3. **反射和动态分派。** 通过反射使用的符号
   （Go 中的 `reflect.TypeOf`、Java 中的 `Class.forName`）或通过动态分派
   使用的符号没有 LSP 可见的静态调用点。

4. **`//go:linkname` 和汇编。** 通过 `//go:linkname` 链接
   或从汇编文件中引用的 Go 符号将显示为零个 LSP 引用。

5. **库的公共 API。** 如果调用导出符号的外部包
   不在工作区中，即使存在使用者，这些符号也会显示为零个引用。

6. **声明不计入引用数。** 定义位置不计入引用数
   （`include_declaration: false`）。计数为 0 表示未找到调用方，
   而不是该符号从未出现在源代码树中。

7. **删除前务必审查。** 零个 LSP 引用只是需要
   进一步调查的信号，并不能保证该符号未被使用。

## 第 4 步——后续步骤

生成报告后：

- **对于每个零引用符号（经 grep 确认）：** 对该符号运行 `lsp-impact`
  进行确认。如果 `lsp-impact` 同样未找到任何引用，
  则可以安全地考虑将其移除。仍需检查上面的“注意事项”部分。

- **对于仅在测试文件中有引用的符号：** 在报告中标记为“仅测试”。
  如果测试本身是冗余的，这些符号可能适合移除，但在审查这些测试
  是否具有文档或契约用途之前，不应将其删除。

- **对于在生产代码中有 1–2 个引用的符号：** 这些符号可能仍在使用，
  只是使用频率较低。在确认它们是否属于已承诺的公共 API 之前，不要移除。

## 第 5 步——使用 `safe_delete_symbol` 进行可选清理

审查死代码报告并与用户确认候选符号后，
你可以提议使用 `safe_delete_symbol` 移除已确认的零引用符号：

```
mcp__lsp__safe_delete_symbol({
  "file_path": "/abs/path/to/file.go",
  "symbol_path": "DeadFunction"
})
```

此工具会在删除前自行执行引用检查。如果存在任何引用
（即使初始扫描遗漏了这些引用），删除操作也会被拒绝。

**使用此步骤前的要求：**

1. 用户已明确确认要移除该符号。
2. 该符号已被归类为确认无效的候选符号（零 LSP 引用 + 零 grep 引用）。
3. 你已审查上面的“注意事项”部分，并告知用户相关风险。

未经用户确认，请勿自动删除符号。应先展示死代码
报告，让用户选择要移除的符号，然后对每个获准移除的符号执行
`safe_delete_symbol`。