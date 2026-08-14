---
name: lsp-inspect
description: Full code quality audit for a file, package, or directory. Supports batch mode (directory walk with --top ranking), comparison mode (--diff for branch-only issues), severity calibration by blast radius, fix suggestions, and confidence tiers. Applies a check taxonomy (dead symbols, silent failures, error wrapping, coverage gaps, test coverage, doc drift, unrecovered panics, context propagation, concurrency safety) using LSP-first strategies. Concurrency checks cover 25 languages across 4 families (goroutine, thread, async, actor). Produces a severity-tiered findings report. Language-agnostic.
argument-hint: "<file-or-directory> [--checks <type1>,<type2>] [--json] [--top N] [--diff]"
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__open_document mcp__lsp__blast_radius mcp__lsp__find_references mcp__lsp__list_symbols mcp__lsp__inspect_symbol mcp__lsp__get_diagnostics mcp__lsp__find_callers mcp__lsp__go_to_definition mcp__lsp__get_server_capabilities mcp__lsp__get_cross_repo_references Bash
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: documentSymbolProvider referencesProvider
  optional-capabilities: callHierarchyProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-inspect

对文件、包或目录进行全面的代码质量审计。将 LSP 批量分析（`blast_radius`）与针对每个符号的检查及由 LLM 驱动的启发式分析相结合。生成按严重程度分级的发现报告，其中包含置信度等级和修复建议。

## 何时使用

- 在发布或重大重构之前审计包
- 在不熟悉的代码中查找死代码、未经测试的导出项和错误处理缺陷
- 审查外部代码库的代码质量，以寻找贡献机会
- 对一组已更改的文件执行合并前质量门禁检查
- 批量检查整个目录并生成排序后的输出
- 将分支更改与 main 进行比较，以查找新引入的问题

## 输入

```
/lsp-inspect <target> [--checks <type1>,<type2>] [--json] [--top N] [--diff]
```

**目标**可以是：
- 文件路径：`/lsp-inspect src/handlers/auth.go`
- 目录/包：`/lsp-inspect internal/runnables/`
- 多个目标：`/lsp-inspect pkg/a.go pkg/b.go`

**目录检测：**当目标是目录时，递归遍历其中的所有 `.go`、`.ts`、`.py` 文件。生成排序后的报告：“按严重程度、再按影响范围排序的前 N 项发现。”

**标志：**
- `--checks <type1>,<type2>`：仅运行列出的检查类型（默认：所有适用类型）
- `--json`：输出结构化 JSON，而不是 markdown
- `--top N`：要报告的最大问题数（默认 20）。仅适用于目录/批量模式。
- `--diff`：仅检查相对于 main 分支发生更改的文件。将发现筛选至差异范围内的行。输出标题：“此分支引入的新问题。”

## 检查分类

| 检查 | 发现的问题 | LSP 策略 |
|-------|--------------|--------------|
| `dead_symbol` | 引用数为零的导出符号 | 第 1A 层：批量执行 `blast_radius`；第 1B 层：对每个符号执行 `find_references` |
| `test_coverage` | 没有测试调用方的导出符号 | 第 1A 层：`blast_radius` 的 test_callers 字段 |
| `silent_failure` | 错误/异常被抑制，且未重新抛出或记录日志 | 读取代码，识别裸 `except:`、空的 `if err != nil {}`、被吞掉的返回值 |
| `error_wrapping` | 返回/抛出的错误不包含上下文 | 读取代码，识别未使用 `fmt.Errorf` 包装的 `return err`，或未使用 `from` 的 `raise` |
| `coverage_gap` | 未处理的输入、错误路径或代码分支 | 读取代码，识别没有 default 的 switch/match、未经检查的类型断言 |
| `doc_drift` | 与实际签名不匹配的文档字符串/注释 | 将 `inspect_symbol` 悬停文本与源代码进行比较 |
| `panic_not_recovered` | goroutine 或异步上下文中未处理的崩溃 | 读取代码，识别没有 recover 的 `go func()`、未加防护的 `.unwrap()` |
| `context_propagation` | 函数接收 context，但为被调用方创建了新的根 context | 读取代码，识别带有 `ctx` 参数的函数中的 `context.Background()` |
| `unrecovered_concurrent_entry` | 没有恢复机制的并发入口点 | 读取代码，识别没有 try-catch 或 recover 的 goroutine/线程/任务 |
| `unchecked_shared_state` | 对并发数据结构进行未经安全检查的类型断言或类型转换 | 读取代码，识别 sync.Map 上裸用的 `.(*Type)`、ConcurrentHashMap 上未经检查的类型转换 |
| `channel_never_closed` | 创建了 Channel 或队列，但从未在同一个包中关闭 | 读取代码并执行 grep，查找没有对应 close/shutdown 的创建位置 |
| `shared_field_without_sync` | 从并发上下文访问字段，但未进行同步 | `blast_radius`（sync_guarded）+ `find_callers`（cross_concurrent） |

## 执行

### 步骤 0：初始化并验证工作区

```
mcp__lsp__start_lsp(root_dir="<repo_root>")
```

为每个待审计的包打开一个文件：

```
mcp__lsp__open_document(file_path="<target_file>", language_id="<lang>")
```

**预热检查（强制）：** 选择一个你确认正在被使用的符号。
对其调用 `find_references`。如果返回 `[]`，等待 3-5 秒后重试。
在确认一个已知正在使用的符号返回 >= 1 个引用之前，不要继续。

### 步骤 0.5：Diff 模式文件选择

设置 `--diff` 时：
1. 运行 `git diff --name-only main` 获取已更改的文件
2. 运行 `git diff main` 获取行级更改范围
3. 仅使用已更改的文件作为检查目标
4. 完成步骤 3 后，筛选发现的问题：仅保留 File:Line 位于 diff 更改行范围内的问题
5. 在输出前添加：'## New issues introduced by this branch'

### 步骤 1：批量分析（Tier 1A）

对目标中的每个文件调用一次 `blast_radius`：

```
mcp__lsp__blast_radius(changed_files=["/abs/path/file.go"], include_transitive=false)
```

这会返回所有导出符号及以下信息：
- `non_test_callers`：生产代码引用数
- `test_callers`：测试文件引用数

立即分类：
- `non_test_callers == 0 AND test_callers == 0` -> 无效符号候选（置信度：已验证）
- `non_test_callers == 0 AND test_callers > 0` -> 仅用于测试（可能无效，置信度：疑似）
- `non_test_callers > 0 AND test_callers == 0` -> 未测试的导出符号（置信度：已验证）

如果 `blast_radius` 失败或不可用，则回退到 Tier 1B
（逐符号使用 `find_references`）进行 `dead_symbol` 检查。

### 步骤 2：启发式检查（由 LLM 驱动）

读取每个文件的源代码（对于超过 500 行的文件，使用 offset/limit）。
通过阅读和推理代码来执行以下检查：

**silent_failure：** 查找：
- Go：`if err != nil { return }`（不返回错误）、直接使用 `_ = fn()`
- Python：直接使用 `except:` 或 `except Exception: pass`
- TypeScript：空的 `.catch(() => {})`、`try {} catch(e) {}`
- Rust：对本应传播错误的可失败操作使用 `.unwrap_or_default()`

**error_wrapping：** 查找：
- Go：直接使用 `return err`，而未使用 `fmt.Errorf("context: %w", err)`
- Python：使用 `raise ValueError(str(e))`，但未使用 `from e`
- TypeScript：直接使用 `throw e`，而未将其包装在包含上下文的错误中

**coverage_gap：** 查找：
- switch/match 未覆盖所有分支，或缺少 default 分支
- 未检查的类型断言（`v := x.(Type)`，而不是 `v, ok := x.(Type)`）
- 在可失败调用后进行解引用之前，缺少 nil/null 检查

**doc_drift：** 对于导出函数，比较：
- 文档字符串中的参数名称与实际签名
- 文档中描述的返回类型与实际返回值
- 使用 `inspect_symbol` 的悬停文本进行交叉核对

**panic_not_recovered：** 查找：
- Go：`go func() { ... }()` 中未使用 `defer recover()`
- Rust：在非测试、非 main 代码中使用 `.unwrap()` 或 `.expect()`
- Python：直接创建线程而未进行异常处理

**context_propagation：** 查找：
- 接受 `ctx context.Context` 但在内部调用 `context.Background()` 或 `context.TODO()` 的函数

**unrecovered_concurrent_entry:** 检测没有恢复机制的并发入口点。
特定语言的模式（按语言系列检查）：
- Go：`go func() { ... }()`，且函数体中没有 `defer func() { if r := recover()` 模式。权重：库传输代码（错误级别）、具有中间件保护的应用程序代码（信息级别）。
- Java/Kotlin/Scala：`new Thread(...)` 或 `ExecutorService.submit(...)`，但 Runnable 主体没有 try-catch 包装，并且线程上未设置 `UncaughtExceptionHandler`。
- C#：`Task.Run(...)` 或 `new Thread(...)`，但委托主体中没有 try-catch。
- C/C++：`pthread_create` 或 `std::thread`，但线程函数中没有异常处理。
- Rust：`std::thread::spawn`，但闭包中没有 `catch_unwind`。同时标记生成的线程内的 `.unwrap()`（panic 只会终止该线程，但会丢失错误）。
- Swift：`DispatchQueue.async` 或 `Task { }`，但没有 do-catch。
- Python：`threading.Thread(target=...)`，但目标函数中没有 try-except。`asyncio.create_task()`，但没有对被等待的结果进行错误处理。
- TypeScript/JavaScript：`new Worker()`，但没有 `onerror` 或 `error` 事件处理程序。`Promise` 构造函数的调用链上没有 `.catch()`。
- Zig：`try std.Thread.spawn`，但没有对生成的函数进行错误处理。
- Elixir/Erlang/Gleam：跳过（采用带监督器的 Actor 模型；未恢复的进程是设计使然）。
- Lua/Bash/SQL：跳过（没有并发原语）。

**unchecked_shared_state:** 检测并发数据结构上的不安全类型操作：
- Go：对 `sync.Map` 调用 `.Load()`、`.LoadOrStore()` 或 `.LoadAndDelete()` 后，直接使用类型断言 `actual.(*Type)`，而没有使用 `, ok` 模式。安全模式为 `v, ok := actual.(*Type)`。
- Java：对 `ConcurrentHashMap.get()` 的结果进行未经检查的强制类型转换，且没有 `instanceof` 守卫。
- C#：获取 `ConcurrentDictionary` 的值时进行未经检查的强制类型转换。
- 其他语言：跳过（动态类型或类型系统可防止此类错误）。

**channel_never_closed:** 检测已创建但从未关闭的通道或队列：
- Go：`make(chan T)` 或 `make(chan T, N)`，但同一包中没有出现 `close(channelName)`。这可能表示存在 goroutine 泄漏（接收方会永久阻塞在 `range` 上）。
- Python：创建 `queue.Queue()` 时没有哨兵值模式（`queue.put(None)` + `if item is None: break`）。
- Rust：使用 `mpsc::channel()`，但发送端从未被丢弃或显式关闭。
- TypeScript：`new MessageChannel()` 或 `new BroadcastChannel()`，但没有调用 `.close()`。
- Java：创建 `BlockingQueue` 时没有毒丸或关闭模式。
- 其他语言：如果没有通道/队列原语，则跳过。

**shared_field_without_sync:** 检测从多个并发上下文访问且没有同步保护的结构体/类字段。此项检查组合使用两个工具：

1. 对目标文件调用 `blast_radius`。对于 `sync_guarded: false`（或不存在该字段）的每个符号，其类型缺少同步原语。
2. 对每个此类符号调用 `find_callers`，并设置 `cross_concurrent: true`。如果 `concurrent_callers` 非空，则该符号是在没有同步保护的情况下从并发上下文（goroutine、线程、异步任务）调用的。
3. 标记满足以下所有条件的符号：(a) 它会修改状态（写入字段，而非纯只读函数），并且 (b) 它有并发调用方，并且 (c) 它的父类型没有同步保护。

与语言无关：`blast_radius` 提供 `sync_guarded`，`find_callers`
提供 `concurrent_callers`。无论并发边界是 goroutine、线程还是异步任务，
检查逻辑都完全相同。

严重性：
- error：字段由 2 个以上并发上下文写入，且没有同步机制（数据竞争）
- warning：字段由 1 个并发上下文写入（高负载下可能发生竞争）
- info：字段在并发上下文中只读（可能安全，但需标记以供审查）

### 步骤 3：交叉核验并分类

对于每个发现，指定：

**严重性（根据影响范围校准）：**
- `error`：将导致运行时故障、数据丢失或资源泄漏，或者 `non_test_callers >= 10` 的任何发现（较大的影响范围会提高严重性）
- `warning`：可能导致困惑、维护负担或隐蔽的错误，或者 `non_test_callers` 为 3-9 的发现
- `info`：样式问题或改进机会，或者 `non_test_callers <= 2`

使用步骤 1 的 `blast_radius` 结果中的 `non_test_callers` 计数作为
严重性乘数。一个有 50 个调用方的函数中的静默失败属于
error 严重性；同样的模式若只有 2 个调用方，则属于 info。

**跨文件影响评分：** 对于每个发现，从步骤 1 的 blast_radius 结果中查找该符号的
`non_test_callers` 计数。将其用作严重性乘数：如果 non_test_callers >= 10，则将严重性提升一个级别
（info->warning，warning->error）。在发现中记录调用方数量。

**置信度级别：**
- `verified`：经 LSP 确认（Tier 1A/1B）或代码模式明确无歧义（立即处理）
- `suspected`：可能存在误报的启发式匹配（模式匹配，先调查）
- `advisory`：基于 Grep 或不确定的模式匹配（样式问题，可选）

### 步骤 4：输出

生成发现报告：

```markdown
## Inspection Report: <target>

**Files analyzed:** N
**Checks applied:** [list]
**Findings:** E errors, W warnings, I info

### Errors

| # | Check | File:Line | Finding | Confidence | Fix |
|---|-------|-----------|---------|------------|-----|
| 1 | dead_symbol | pkg/foo.go:42 | `UnusedHelper` has 0 references (0 callers) | verified (LSP) | Remove lines 42-55 (function `UnusedHelper`) |

### Warnings

| # | Check | File:Line | Finding | Confidence | Fix |
|---|-------|-----------|---------|------------|-----|
| 1 | error_wrapping | pkg/bar.go:88 | `return err` without context wrapping (5 callers) | verified | Change `return err` to `return fmt.Errorf("funcName: %w", err)` |
| 2 | test_coverage | pkg/foo.go:15 | `ProcessInput` has 0 test callers (8 callers) | verified (LSP) | Add test for `ProcessInput` in foo_test.go |

### Info

| # | Check | File:Line | Finding | Confidence | Fix |
|---|-------|-----------|---------|------------|-----|
| 1 | doc_drift | pkg/foo.go:20 | Docstring mentions `timeout` param, signature has `deadline` (1 caller) | suspected | Update docstring parameter name from timeout to deadline |
```

**各检查类型的修复建议：**
- `dead_symbol`：“删除第 N-M 行（函数 `FuncName`）”
- `error_wrapping`：“将 `return err` 改为 `return fmt.Errorf(\"funcName: %w\", err)`”
- `silent_failure`：“在 if 块之后添加 `return fmt.Errorf(...)`”
- `test_coverage`：“在 file_test.go 中为 `FuncName` 添加测试”
- `coverage_gap`：“在第 N 行的 switch 语句中添加 default 分支”
- `doc_drift`：“将文档字符串中的参数名从 X 更新为 Y”
- `panic_not_recovered`：“在 goroutine 开始处添加 `defer func() { if r := recover()... }()`”
- `context_propagation`：“将 `context.Background()` 替换为 `ctx` 参数”

当传入 `--json` 时，输出包含相同字段的结构化 JSON。

### 步骤 4.5：批量排序

分析多个文件时，按以下顺序对所有发现进行排序：(1) 严重性级别
（error > warning > info），(2) 影响范围（non_test_callers 降序），
(3) 文件路径按字母顺序。仅输出前 N 个发现（默认为 20，
由 --top 标志控制）。追加一行摘要：'Showing N of M total findings.'

### 步骤 5：持久化结果

生成发现报告后，将 JSON 文件写入工作区根目录下的
`.agent-lsp/last-inspection.json`。JSON 模式如下：

```json
{
  "target": "<original target path>",
  "timestamp": "<ISO 8601>",
  "files_analyzed": N,
  "findings": [
    {
      "severity": "error|warning|info",
      "confidence": "verified|suspected|advisory",
      "check": "<check_type>",
      "file": "<path>",
      "line": N,
      "finding": "<description>",
      "fix": "<exact fix text>",
      "blast_radius": N
    }
  ],
  "summary": {"errors": N, "warnings": N, "info": N}
}
```

该文件由 `inspect://last` MCP 资源提供，以便通过编程方式访问。

## 注意事项

1. **重新导出：** `__init__.py`（Python）、`index.ts`（TypeScript）
   或公共 API 接口文件中的符号，在本地可能看似未被使用，但实际上可能被外部使用。
   在分类前，请检查 `__all__`、桶式导出和包级重新导出。

2. **注册模式：** 作为值传递给框架注册器的符号
   （HTTP 处理程序、插件钩子）会显示为零个 LSP 引用。在确认其无用前，
   请先对接线文件执行 Grep 搜索。

3. **库的公共 API：** 如果目标是由外部仓库使用的库，
   零个内部引用并不意味着无用。请使用 `--consumer-repos`，或将其注明为
   "library export, verify externally."

4. **启发式检查仅供参考。** 静默失败和错误包装检查
   依赖 LLM 对意图的推理。出现误报是正常的；在根据发现采取行动前，
   务必进行审查。

5. **大型文件：** 对于超过 500 行的文件，请读取目标片段（使用
   offset/limit）。不要将整个大型文件读入上下文。