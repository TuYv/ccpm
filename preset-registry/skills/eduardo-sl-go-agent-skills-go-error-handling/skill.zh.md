---
name: go-error-handling
description: >
  Go error handling patterns, wrapping, sentinel errors, custom error types,
  and the errors package. Grounded in Effective Go, Go Code Review Comments,
  and production-proven idioms. Use when implementing error handling,
  designing error types, debugging error chains, or reviewing error handling
  patterns. Trigger examples: "handle errors", "error wrapping", "custom
  error type", "sentinel errors", "errors.Is", "errors.As".
  Not for: panic/recover in middleware (go-api-design), test assertions
  (go-test-quality).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.2.1"
---
# Go 错误处理

Go 显式的错误处理是一项特性，而不是限制。  
这些模式确保错误信息清晰、可操作，并得到正确传递。

## 1. 错误决策树

创建或返回错误时，请遵循以下决策树：

1. **简单，不需要额外上下文？** → `errors.New("message")`
2. **需要为现有错误添加上下文？** → `fmt.Errorf("doing X: %w", err)`
3. **调用方需要检测此错误？** → Sentinel `var` 或自定义类型
4. **错误携带结构化数据？** → 实现 `error` 的自定义类型
5. **从下游传递错误？** → 使用 `%w` 包装并添加上下文

## 2. Sentinel 错误

对于调用方需要检查的错误，使用包级别的 `var`：

```go
// ✅ Good — exported sentinel error
var (
    ErrNotFound     = errors.New("user: not found")
    ErrUnauthorized = errors.New("user: unauthorized")
)

// Naming convention: Err + Description
// Prefix with package context in the message
```

调用方使用 `errors.Is` 检查：

```go
if errors.Is(err, user.ErrNotFound) {
    // handle not found
}
```

永远不要使用 `==` 比较错误。始终使用 `errors.Is()`。

## 3. 自定义错误类型

当错误需要携带结构化信息时：

```go
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("validation: field %s: %s", e.Field, e.Message)
}

// Callers extract with errors.As:
var valErr *ValidationError
if errors.As(err, &valErr) {
    log.Printf("invalid field: %s", valErr.Field)
}
```

调用方使用 `errors.As` 提取：

```go
var valErr *ValidationError
if errors.As(err, &valErr) {
    log.Printf("invalid field: %s", valErr.Field)
}
```

## 4. 错误包装

从调用栈向上传递错误时，始终添加上下文。  
使用 `%w` 保留错误链：

```go
// ✅ Good — context added, chain preserved
func getUser(id int64) (*User, error) {
    row, err := db.QueryRow(ctx, query, id)
    if err != nil {
        return nil, fmt.Errorf("get user %d: %w", id, err)
    }
    // ...
}

// ❌ Bad — no context
return nil, err

// ❌ Bad — chain broken, callers can't errors.Is/As
return nil, fmt.Errorf("failed: %v", err)
```

### 不使用 `%w` 的情况

当你明确希望**断开**错误链，避免调用方依赖内部实现错误时，使用 `%v` 而不是 `%w`：

```go
// Intentionally hiding internal DB error from public API
return nil, fmt.Errorf("user lookup failed: %v", err)
```

## 5. 只处理错误一次

错误应该被记录或返回，绝不能两者兼有：

```go
// ✅ Good — return the error, let caller decide
func loadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        return nil, fmt.Errorf("load config %s: %w", path, err)
    }
    // ...
}

// ❌ Bad — log AND return (error handled twice)
func loadConfig(path string) (*Config, error) {
    data, err := os.ReadFile(path)
    if err != nil {
        log.Printf("failed to read config: %v", err) // handled once
        return nil, err                                 // handled again
    }
    // ...
}
```

规则是：由决定如何处理错误的组件负责记录日志或指标。其他所有组件都只负责包装并返回错误。

## 6. 错误命名约定

```go
// Sentinel errors: Err prefix
var ErrNotFound = errors.New("not found")

// Error types: Error suffix
type NotFoundError struct { ... }
type ValidationError struct { ... }

// Error messages: lowercase, no punctuation, no "failed to" prefix
// Include context: "package: action: detail"
errors.New("auth: token expired")
fmt.Errorf("user: get by id %d: %w", id, err)
```

## 7. Panic 规则

Panic **不是**错误处理。仅在以下情况下使用 panic：
- 程序初始化失败且无法继续（`template.Must`、标志解析）
- 不应发生的程序员错误（违反不变量）
- 表明存在 bug 而非运行时条件的空指针解引用

在测试中，使用 `t.Fatal` / `t.FailNow`，绝不要使用 `panic`。

在 HTTP 处理程序和中间件中，在边界处从 panic 中恢复，
以防止单个请求导致服务器崩溃。

## 8. 错误检查模式

```go
// Inline error check — preferred for simple cases
if err := doSomething(); err != nil {
    return fmt.Errorf("do something: %w", err)
}

// Multi-return with named result — acceptable for complex functions
func process() (result string, err error) {
    defer func() {
        if err != nil {
            err = fmt.Errorf("process: %w", err)
        }
    }()
    // ...
}

// errors.Join for multiple errors (Go 1.20+)
var errs []error
for _, item := range items {
    if err := validate(item); err != nil {
        errs = append(errs, err)
    }
}
return errors.Join(errs...)
```

## 可执行验证

编写或审查错误处理后，运行能够验证上述规则的 lint 工具（跳过未安装的工具，并注明）：

```bash
go vet ./...                                  # includes printf %w misuse
golangci-lint run --enable errcheck,errorlint # unchecked errors, %v-vs-%w,
                                              # == comparisons on errors
```

## 验证清单

1. 没有使用 `_` 丢弃错误（除非通过注释明确说明理由）
2. 每个用于包装错误的 `fmt.Errorf` 都使用 `%w`（或使用 `%v` 并记录说明理由）
3. Sentinel 错误使用 `var Err...` 命名
4. 自定义错误类型实现 `error` 接口
5. 调用方使用 `errors.Is` / `errors.As`，绝不使用 `==` 或类型断言
6. 不存在记录日志后返回的模式
7. 错误消息使用小写、包含上下文且便于链式处理