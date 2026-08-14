---
name: lsp-concurrency-audit
description: Concurrency safety audit for a type or file. Maps all fields, traces which are accessed from concurrent contexts (goroutines, threads, async tasks), and flags fields that lack synchronization. Produces a field-level safety report. Language-agnostic across 4 concurrency families.
argument-hint: "<file-path> [--type <TypeName>]"
user-invocable: true
allowed-tools: mcp__lsp__start_lsp mcp__lsp__open_document mcp__lsp__blast_radius mcp__lsp__find_callers mcp__lsp__list_symbols mcp__lsp__get_symbol_source mcp__lsp__find_references
license: MIT
compatibility: Requires the agent-lsp MCP server (github.com/blackwell-systems/agent-lsp)
metadata:
  required-capabilities: documentSymbolProvider referencesProvider
  optional-capabilities: callHierarchyProvider
---
> 需要 agent-lsp MCP 服务器。

# lsp-concurrency-audit

给定一个类型或文件，映射所有字段，识别哪些字段会从多个并发上下文中被访问，并标记缺乏同步保护的字段。生成一份字段级并发安全报告。

## 何时使用

- 在重构由 goroutine/线程访问的类型之前
- 审计代码库中的潜在数据竞争
- 审查向现有类型添加并发访问的 PR
- 了解类型中的哪些字段需要互斥锁保护

## 输入

```
/lsp-concurrency-audit <file-path> [--type <TypeName>]
```

如果提供了 `--type`，则仅审计该类型。否则，审计文件中所有存在并发调用方的类型。

## 第 1 步：发现类型和字段

对目标文件调用 `list_symbols`，以枚举所有类型（结构体、类）：

```
mcp__lsp__list_symbols({ "file_path": "<target>" })
```

对于每个类型（kind=23 结构体，kind=5 类），收集：
- 类型名称
- 所有字段（kind=8 字段或 kind=7 变量的子项）
- 是否有任何字段的名称或详细信息包含同步原语
  ("Mutex", "RWMutex", "Lock", "Semaphore", "atomic", "Atomic", "sync.",
  "pthread_mutex", "std::mutex")

如果指定了 `--type`，则仅保留该类型。

## 第 2 步：影响范围和同步保护状态

对该文件调用 `blast_radius`：

```
mcp__lsp__blast_radius({
  "changed_files": ["<target>"],
  "scope": "all"
})
```

根据结果，对每个目标类型的每个方法：
- 记录响应中的 `sync_guarded: true/false`
- 记录 `non_test_callers` 数量（影响范围）
- 记录 `test_callers` 数量

## 第 3 步：追踪并发边界

对于每个目标类型的每个方法，调用 `find_callers`，并将 `cross_concurrent` 设为 `true`：

```
mcp__lsp__find_callers({
  "file_path": "<target>",
  "line": <method_line>,
  "column": <method_column>,
  "direction": "incoming",
  "cross_concurrent": true
})
```

为每个方法记录：
- `concurrent_callers`：跨越并发边界的调用方列表
- `pattern`：检测到的并发入口模式（例如 "go func("、"Thread.start("）

## 第 4 步：对字段进行分类

对于每个类型中的每个字段，确定其安全状态：

**SAFE：** 类型受同步保护（具有互斥锁/锁字段），并且所有访问该字段的方法都会在访问前获取锁。如果类型具有同步原语，则置信度为已验证；如果依赖外部加锁，则置信度为疑似。

**UNSAFE（潜在数据竞争）：** 字段由具有 `concurrent_callers` 的方法访问，并且类型没有同步原语。这可能会产生数据竞争。

**WRITE-CONCURRENT：** 字段由具有并发调用方的方法写入。严重程度高于并发只读访问。

**READ-ONLY：** 字段在并发上下文中仅被读取（未被写入）。严重程度较低；通常是安全的，但仍值得标记以供审查。

严重程度分配：
- `error`：UNSAFE + WRITE-CONCURRENT（很可能存在数据竞争）
- `warning`：UNSAFE + READ-ONLY（高并发下可能发生数据竞争）
- `info`：SAFE（受同步保护，用于文档记录）

## 步骤 5：输出

```markdown
## Concurrency Audit: <TypeName>

**File:** <file_path>
**Fields:** N total, M sync-guarded
**Concurrent methods:** K (methods called from goroutines/threads/tasks)

### Field Safety Report

| Field | Type | Sync | Concurrent Writers | Concurrent Readers | Status |
|-------|------|------|-------------------|-------------------|--------|
| mu | sync.RWMutex | (is sync) | - | - | SYNC PRIMITIVE |
| sender | NotificationSender | guarded | 2 (SetSender, Send) | 3 | SAFE |
| subscribers | []Subscriber | none | 1 (Subscribe) | 2 | UNSAFE (write-concurrent) |

### Concurrent Call Sites

For each UNSAFE field, list the concurrent callers:

- `subscribers` written by `Subscribe` called from:
  - `setupNotificationHub` via `go func()` at notifications.go:45
  - `handleNewSession` via `go func()` at server.go:312

### Recommendations

- Add `sync.RWMutex` to protect `subscribers` field
- Or: use channel-based access pattern instead of direct field mutation
```

## 注意事项

1. **启发式检测。** 并发边界检测依赖源代码模式匹配，而非运行时分析。当并发入口是间接的（例如，作为回调传递给框架）时，可能会出现漏报。

2. **不验证锁使用规范。** 审计仅检查该类型上是否存在同步原语，而不检查每个方法是否确实在访问字段之前获取了该同步原语。具有互斥锁但加锁方式不一致的类型可能会显示为 SAFE，尽管它实际上可能并不安全。

3. **外部同步不可见。** 如果同步由外部锁提供（例如，调用方在调用方法前持有锁），审计会将该字段标记为 UNSAFE。可添加注释或标注以抑制此警告。

4. **读写检测采用启发式方法。** 判断一个方法是读取还是写入字段需要进行源代码分析。该技能会读取方法体，并查找赋值模式（`field =`、`field.Store()`、`append(field,`）。对于复杂的访问模式，可能会出现误报。