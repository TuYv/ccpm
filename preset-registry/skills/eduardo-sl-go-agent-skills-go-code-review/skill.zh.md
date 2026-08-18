---
name: go-code-review
description: >
  Comprehensive code review checklist for Go projects. Evaluates code quality,
  idiomatic patterns, error handling, naming, package structure, and test coverage.
  Use when reviewing Go code, PRs, or before merging changes.
  Trigger examples: "review this code", "check this PR", "code review", "review Go file".
  Do NOT use for security-specific audits (use go-security-audit) or
  performance-specific analysis (use go-performance-review).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Read-only: this skill reports findings, it does not edit code.
allowed-tools: Read Glob Grep Bash(go:*) Bash(gofmt:*) Bash(golangci-lint:*)
metadata:
  author: eduardo-sl
  version: "1.3.0"
---
# Go 代码审查

面向 Go 的结构化代码审查流程。审查应具有建设性和针对性，并引用每条发现背后的相关原则。

## 操作模式

开始前选择与请求匹配的模式：

- **差异审查**（默认）——仅审查变更的行，以及足以判断这些变更的周边上下文。用于 PR 和工作区变更。
- **文件/包审查**——完整审查指定的文件或包，包括其测试。
- **全面审计**——扫描整个代码库。使用下方“审计大型代码库”中的策略，并将所有内容汇总为一份报告。

## 审查流程

按顺序执行以下步骤。对每条发现进行严重性分类：
- 🔴 **阻塞项** — 合并前必须修复。正确性、数据丢失、安全性问题。
- 🟡 **警告** — 应当修复。可维护性、符合 Go 惯用法、清晰度问题。
- 🟢 **建议** — 可以考虑改进。风格、命名、文档问题。

## 0. 首先运行工具链

在手动阅读代码之前，先让工具发现机械性问题
（未安装的工具跳过，并在报告中注明）：

```bash
go build ./...          # it must compile
go vet ./...            # suspicious constructs
golangci-lint run       # if the repo has a config
go test -race ./...     # tests pass, no data races
```

将工具发现的问题与手动发现的问题一并报告——失败的 `go vet` 会自动判定为
🔴 **阻塞项**。绝不要报告工具已经证明不存在的问题。

## 1. 正确性与安全性

### 错误处理
- 检查每一个错误。不得使用空白标识符 `_` 静默丢弃错误。
- 使用上下文包装错误：`fmt.Errorf("fetch user %d: %w", id, err)`。
- 使用 `errors.Is()` / `errors.As()` 比较错误值，绝不要使用 `==`。
- 除了 `init()` 或确实无法恢复的情况外，不得使用 `panic`。
- 每个错误只处理一次——不得采用记录日志后返回的模式。

### Nil 安全性
- 当 nil 是有效状态时，解引用前检查指针接收者。
- 保护 map 读取，或使用 comma-ok 惯用法。
- 通道操作要考虑已关闭或 nil 通道。
- 在相关场景下检查切片操作的边界。

### 并发
- 使用 `sync.Mutex` 或通道保护共享可变状态。
- 不得发生 goroutine 泄漏——每个 goroutine 都必须有明确的终止路径。
- 上下文传递：所有阻塞调用都接受并遵循 `context.Context`。
- 使用 `sync.WaitGroup` 或 `errgroup.Group` 管理 goroutine 生命周期。

## 2. API 设计

- 导出的函数必须具有以函数名开头的文档注释。
- 接受接口，返回具体类型。
- 对于可选参数，使用函数选项（`WithTimeout(d)`），而不是配置结构体。
- Context 始终是第一个参数：`func Foo(ctx context.Context, ...)`。
- 将 `error` 作为最后一个返回值。
- 避免使用 `bool` 参数——优先使用命名类型或选项。

## 3. Go 惯用法

- 局部变量使用 `:=`，使用 `var` 表明有意采用零值。
- 在 `return`/`continue`/`break` 之后无需使用多余的 `else`。
- 使用保护性子句和提前返回来减少嵌套。
- 使用 `defer` 执行清理，并在获取资源后立即放置。
- 在适当情况下使用 `range`，而不是手动按索引迭代。
- 结构体字面量使用字段名。
- 在消费者处定义接口，而不是在生产者处定义。

## 4. 包结构

- 包名称应简短、使用小写，并采用单数名词。
- 包之间不得存在循环依赖。
- `internal/` 用于非公开包。
- `cmd/` 包含主包，每个二进制文件对应一个主包。
- 清晰划分关注点——不得存在巨型包。

## 5. 测试

- 测试函数遵循 `TestXxx` 命名约定。
- 对于多组输入/输出组合，使用表驱动测试。
- 测试辅助函数使用 `t.Helper()`，以获得清晰的堆栈跟踪。
- 不得在 `init()` 中编写测试逻辑——需要时使用 `TestMain`。
- 测试统一使用 `testify/assert` 或 `testify/require`，或者仅使用标准库。
- 覆盖边界情况：空输入、nil、零值、最大值。
- 在安全的情况下使用 `t.Parallel()`。

## 6. 文档

- 所有导出的类型、函数和常量都应包含文档注释。
- 文档注释以实体名称开头。
- 对于非简单包，在 `doc.go` 中提供包级文档注释。
- 复杂算法或业务逻辑应使用行内注释解释其*原因*。

## 7. 依赖

- 已提交的代码中，`go.mod` 不得包含 replace 指令（monorepo 除外）。
- 不得存在未使用的依赖。
- 依赖应来自维护良好且信誉可靠的来源。
- 应理解间接依赖，并确认其可接受。

## 审查大型代码库

当范围超过约 20 个文件时，不要一次线性通读所有内容。将审查拆分为相互独立的多个阶段：

1. 枚举包（`go list ./...`），并按层进行分组
   （处理器、服务、存储、共享库）。
2. 针对第 1-7 节中的每个关注点分别进行一次专注审查（正确性、
   API 设计、惯用写法、结构、测试、文档、依赖）。
3. 如果你的环境支持将工作委派给并行子代理
   或任务，则为每个审查阶段分配一个——它们在设计上彼此独立。
   否则按顺序运行，每次处理一个关注点。
4. 要求每个发现都标明 `file.go:line` 和严重级别，以便
   最终汇总可以机械化完成：合并、去重、按严重级别排序。

## 审查输出格式

```text
## Code Review Summary

**Files reviewed:** <list>
**Overall assessment:** APPROVE | REQUEST CHANGES | COMMENT

### Findings

#### 🔴 BLOCKER: <title>
- **File:** `path/to/file.go:42`
- **Issue:** <what is wrong>
- **Why:** <which principle or guideline>
- **Fix:** <concrete suggestion>

#### 🟡 WARNING: <title>
...

#### 🟢 SUGGESTION: <title>
...

### What's Done Well
<genuine positive observations — always include at least one>
```