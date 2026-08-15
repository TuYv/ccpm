---
name: go-error-handling
description: >
  Go error handling patterns, wrapping, sentinel errors, custom error types,
  and the errors package. Grounded in Effective Go, Go Code Review Comments, and production-proven idioms.
  Use when implementing error handling, designing error types, debugging error chains,
  or reviewing error handling patterns.
  Trigger examples: "handle errors", "error wrapping", "custom error type",
  "sentinel errors", "errors.Is", "errors.As".
  Do NOT use for panic/recover patterns in middleware (use go-api-design)
  or test assertion errors (use go-test-quality).
license: MIT
metadata:
  version: "1.1.0"
---
# Go 错误处理

Go 的显式错误处理是一项特性，而非限制。
这些模式可确保错误信息清晰、可操作，并得到正确传播。

## 1. 错误决策树

创建或返回错误时，请遵循以下决策树：

1. **错误简单，无需额外上下文？** → `errors.New("message")`
2. **需要为现有错误添加上下文？** → `fmt.Errorf("doing X: %w", err)`
3. **调用方需要识别此错误？** → 哨兵 `var` 或自定义类型
4. **错误携带结构化数据？** → 实现 `error` 的自定义类型
5. **从下游传播错误？** → 使用 `%w` 包装并添加上下文

## 2. 哨兵错误

对于调用方需要检查的错误，请使用包级 `var`：

```go
// ✅ Good — exported sentinel error
var (
    ErrNotFound     = errors.New("user: not found")
    ErrUnauthorized = errors.New("user: unauthorized")
)

// Naming convention: Err + Description
// Prefix with package context in the message
```

调用方使用 `errors.Is` 进行检查：

```go
if errors.Is(err, user.ErrNotFound) {
    // handle not found
}
```

绝不要使用 `==` 比较错误。始终使用 `errors.Is()`。

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

## 4. 错误包装

向调用栈上层传播错误时，始终添加上下文。
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

### 何时不应使用 `%w`

当你明确希望**中断**错误链，防止调用方依赖内部实现错误时，请使用 `%v` 而不是 `%w`：

```go
// Intentionally hiding internal DB error from public API
return nil, fmt.Errorf("user lookup failed: %v", err)
```

## 5. 错误只处理一次

一个错误应当要么被记录，要么被返回，绝不能两者同时进行：

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

规则是：由*决定如何处理*错误的组件记录错误或相关指标。其他所有组件只负责包装并返回错误。

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

Panic 不是错误处理。仅在以下情况使用 panic：
- 程序初始化失败且无法继续运行（`template.Must`、flag 解析）
- 绝不应发生的程序员错误（违反不变量）
- 表明存在 bug 而非运行时状况的 nil 解引用

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

编写或审查错误处理后，运行能够验证上述规则的 linter
（跳过任何未安装的 linter，并注明）：

```bash
go vet ./...                                  # includes printf %w misuse
golangci-lint run --enable errcheck,errorlint # unchecked errors, %v-vs-%w,
                                              # == comparisons on errors
```

## 验证清单

1. 不使用 `_` 丢弃错误（除非通过注释明确说明理由）
2. 每个用于包装错误的 `fmt.Errorf` 都使用 `%w`（或使用 `%v`，但需说明理由）
3. 哨兵错误使用 `var Err...` 命名
4. 自定义错误类型实现 `error` 接口
5. 调用方使用 `errors.Is` / `errors.As`，绝不使用 `==` 或类型断言
6. 不使用先记录日志再返回错误的模式
7. 错误消息使用小写、包含上下文，并且便于形成错误链