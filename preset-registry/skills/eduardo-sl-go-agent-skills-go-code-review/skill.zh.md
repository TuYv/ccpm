---
name: go-code-review
description: >
  Comprehensive code review checklist for Go projects. Evaluates code quality,
  idiomatic patterns, error handling, naming, package structure, and test coverage.
  Use when reviewing Go code, PRs, or before merging changes.
  Trigger examples: "review this code", "check this PR", "code review", "review Go file".
  Do NOT use for security-specific audits (use go-security-audit) or
  performance-specific analysis (use go-performance-review).
license: MIT
metadata:
  version: "1.2.0"
---
# Go 代码审查

适用于 Go 的结构化代码审查流程。审查应具有建设性、具体明确，并为每个发现引用相关原则。

## 工作模式

开始前，选择与请求相匹配的模式：

- **差异审查**（默认）——仅审查变更的行，以及足以判断这些变更的必要上下文。适用于 PR 和工作树变更。
- **文件/包审查**——完整审查指定的文件或包，包括其测试。
- **全面审计**——检查整个代码库。使用下文“审计大型代码库”中的策略，并将所有内容汇总到一份报告中。

## 审查流程

按顺序执行以下步骤。对于每个发现，划分严重级别：
- 🔴 **阻断项**——合并前必须修复。涉及正确性、数据丢失或安全问题。
- 🟡 **警告项**——应该修复。涉及可维护性、惯用 Go 写法或清晰度。
- 🟢 **建议项**——考虑改进。涉及风格、命名或文档。

## 0. 首先运行工具链

在手动阅读代码之前，先让工具捕获机械性问题（跳过任何未安装的工具，并在报告中注明）：

```bash
go build ./...          # it must compile
go vet ./...            # suspicious constructs
golangci-lint run       # if the repo has a config
go test -race ./...     # tests pass, no data races
```

将工具发现与手动审查发现一并报告——`go vet` 失败将自动视为 🔴 阻断项。切勿报告工具已经证明不存在的问题。

## 1. 正确性与安全性

### 错误处理
- 检查每个错误。不得使用空白标识符 `_` 静默丢弃错误。
- 使用上下文包装错误：`fmt.Errorf("fetch user %d: %w", id, err)`。
- 使用 `errors.Is()` / `errors.As()` 比较错误值，绝不使用 `==`。
- 除 `init()` 或真正不可恢复的情况外，不得使用 `panic`。
- 错误只处理一次——不得采用先记录日志再返回的模式。

### nil 安全性
- 当 nil 是有效状态时，指针接收者在解引用前须进行检查。
- map 读取须受保护，或使用 comma-ok 惯用法。
- channel 操作须考虑已关闭或为 nil 的 channel。
- slice 操作须在相关情况下检查边界。

### 并发
- 共享的可变状态须由 `sync.Mutex` 或 channel 保护。
- 不得有 goroutine 泄漏——每个 goroutine 都须有明确的终止路径。
- 上下文传播：所有阻塞调用均须接受并遵循 `context.Context`。
- 使用 `sync.WaitGroup` 或 `errgroup.Group` 管理 goroutine 生命周期。

## 2. API 设计

- 导出函数须有以函数名开头的文档注释。
- 接受接口，返回具体类型。
- 对于可选参数，使用函数式选项（`WithTimeout(d)`）而非配置结构体。
- Context 始终作为第一个参数：`func Foo(ctx context.Context, ...)`。
- 将 `error` 作为最后一个返回值。
- 避免使用 `bool` 参数——优先使用命名类型或选项。

## 3. 惯用 Go 写法

- 局部变量使用 `:=`，表达零值意图时使用 `var`。
- 在 return/continue/break 后不使用不必要的 `else`。
- 使用守卫子句和提前返回来减少嵌套。
- 使用 `defer` 进行清理，并在获取资源后立即放置。
- 在适当情况下，使用 `range` 而非手动按索引迭代。
- 结构体字面量使用字段名。
- 接口定义在使用方，而非提供方。

## 4. 包结构

- 包名应简短、小写，并使用单数名词。
- 包之间不存在循环依赖。
- `internal/` 用于非公开包。
- `cmd/` 包含 main 包，每个二进制文件对应一个。
- 关注点明确分离——不存在大而全的包。

## 5. 测试

- 测试函数遵循 `TestXxx` 命名约定。
- 对多种输入/输出组合使用表驱动测试。
- 测试辅助函数使用 `t.Helper()` 以获得清晰的堆栈跟踪。
- `init()` 中不包含测试逻辑——需要时使用 `TestMain`。
- 测试始终一致地使用 `testify/assert` 或 `testify/require`，或者仅使用标准库。
- 覆盖边界情况：空输入、nil、零值、最大值。
- 在安全的情况下使用 `t.Parallel()`。

## 6. 文档

- 所有导出的类型、函数和常量都有文档注释。
- 文档注释以实体名称开头。
- 对于非简单包，在 `doc.go` 中提供包级文档注释。
- 复杂算法或业务逻辑有内联注释说明其*原因*。

## 7. 依赖项

- 已提交代码中的 `go.mod` 不包含 replace 指令（单体仓库除外）。
- 不存在未使用的依赖项。
- 依赖项来自维护良好且信誉可靠的来源。
- 间接依赖项均已了解且可以接受。

## 审查大型代码库

当范围超过约 20 个文件时，不要以单次线性流程阅读所有内容。将审查拆分为相互独立的阶段：

1. 枚举包（`go list ./...`），并按层对其分组
   （处理器、服务、存储、共享库）。
2. 针对第 1-7 节中的每个关注点分别进行一次专项审查（正确性、
   API 设计、惯用写法、结构、测试、文档、依赖项）。
3. 如果你的环境支持将工作委派给并行子代理
   或任务，请为每个审查阶段分配一个——它们在设计上彼此独立。
   否则，按顺序执行，每次处理一个关注点。
4. 要求每项发现都引用 `file.go:line` 并注明严重级别，以便
   最终汇总可以机械化完成：合并、去重并按严重级别排序。

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