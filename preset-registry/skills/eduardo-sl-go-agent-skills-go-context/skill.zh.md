---
name: go-context
description: >
  Correct usage of context.Context in Go: propagation, cancellation, timeouts,
  deadlines, values, and common anti-patterns.
  Use when: "context usage", "context.Context", "context cancellation", "timeout",
  "context.WithTimeout", "context.WithCancel", "context values", "context propagation".
  Do NOT use for: concurrency patterns beyond context (use go-concurrency-review),
  HTTP middleware context (use go-api-design), or
  error handling (use go-error-handling).
license: MIT
metadata:
  version: "1.0.0"
---
# Go Context

`context.Context` 用于跨 API 边界控制取消、截止时间和请求范围内的值。误用它会导致 goroutine 泄漏、工作任务失去管控，以及难以察觉的生产环境 bug。

## 1. 核心规则

### Context 始终是第一个参数：

```go
// ✅ Good — context is first
func GetUser(ctx context.Context, id string) (*User, error)
func (s *Service) Process(ctx context.Context, req Request) error

// ❌ Bad — context buried in the middle or end
func GetUser(id string, ctx context.Context) (*User, error)
func Process(req Request, ctx context.Context) error
```

### 绝不要将 context 存储在结构体中：

```go
// ❌ Bad — context stored in struct
type Server struct {
    ctx    context.Context // NEVER do this
    cancel context.CancelFunc
}

// ✅ Good — pass context through method parameters
func (s *Server) Shutdown(ctx context.Context) error {
    return s.httpServer.Shutdown(ctx)
}
```

Context 表示单次操作的生命周期，而不是对象的生命周期。

### 绝不要传递 nil context：

```go
// ❌ Bad
doSomething(nil, data)

// ✅ Good — use context.TODO() if unsure which context to use
doSomething(context.TODO(), data)

// ✅ Good — use context.Background() for top-level/main
doSomething(context.Background(), data)
```

## 2. 取消

### 始终 defer cancel：

```go
// ✅ Good — cancel called even if operation succeeds
ctx, cancel := context.WithCancel(parentCtx)
defer cancel()

result, err := longOperation(ctx)
```

如果未调用 cancel，资源（计时器、goroutine）将一直泄漏，直到父 context 被取消。

### 使用 WithCancel 进行手动取消：

```go
func (s *Supervisor) Run(ctx context.Context) error {
    ctx, cancel := context.WithCancel(ctx)
    defer cancel()

    g, ctx := errgroup.WithContext(ctx)

    g.Go(func() error { return s.runWorkerA(ctx) })
    g.Go(func() error { return s.runWorkerB(ctx) })

    // If any worker returns an error, errgroup cancels ctx,
    // which signals all other workers to stop.
    return g.Wait()
}
```

### 在循环中检查 context 是否已取消：

```go
// ✅ Good — respects cancellation
func processItems(ctx context.Context, items []Item) error {
    for _, item := range items {
        if err := ctx.Err(); err != nil {
            return fmt.Errorf("processing cancelled: %w", err)
        }
        if err := process(ctx, item); err != nil {
            return fmt.Errorf("process item %s: %w", item.ID, err)
        }
    }
    return nil
}

// ❌ Bad — runs to completion even if cancelled
func processItems(ctx context.Context, items []Item) error {
    for _, item := range items {
        process(ctx, item) // ignores ctx cancellation between items
    }
    return nil
}
```

## 3. 超时和截止时间

### 使用 WithTimeout 设置基于时长的限制：

```go
func (c *Client) FetchUser(ctx context.Context, id string) (*User, error) {
    ctx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()

    req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.url+"/users/"+id, nil)
    if err != nil {
        return nil, fmt.Errorf("create request: %w", err)
    }

    resp, err := c.httpClient.Do(req)
    if err != nil {
        return nil, fmt.Errorf("fetch user %s: %w", id, err)
    }
    defer resp.Body.Close()

    // ...
}
```

### 使用 WithDeadline 设置绝对时间限制：

```go
// Use when coordinating with external deadlines (SLAs, cron windows)
deadline := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
ctx, cancel := context.WithDeadline(ctx, deadline)
defer cancel()
```

### 超时预算——不要超过父级超时时间：

```go
// ✅ Good — child timeout shorter than parent
func handler(ctx context.Context) error {
    // Parent has 30s timeout (from HTTP server)

    // Give DB query 5s of the 30s budget
    dbCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel()
    data, err := db.QueryContext(dbCtx, query)

    // Give external API 10s of the remaining budget
    apiCtx, cancel := context.WithTimeout(ctx, 10*time.Second)
    defer cancel()
    result, err := client.Call(apiCtx, data)

    return nil
}

// ❌ Bad — child timeout exceeds parent (silently capped anyway)
ctx, cancel := context.WithTimeout(parentCtx, 60*time.Second) // parent has 5s left
// This timeout is 60s but will actually fire at parent's deadline
```

### 检查是否存在截止时间：

```go
if deadline, ok := ctx.Deadline(); ok {
    remaining := time.Until(deadline)
    if remaining < minRequired {
        return fmt.Errorf("insufficient time remaining: %v", remaining)
    }
}
```

## 4. 上下文值

### 谨慎使用——仅用于请求范围的元数据：

```go
// ✅ Appropriate uses:
// - Request ID
// - Trace/span ID
// - Authenticated user info
// - Request-scoped logger

// ❌ Bad uses:
// - Database connections (use dependency injection)
// - Configuration (use struct fields)
// - Function parameters (pass explicitly)
```

### 使用未导出的键类型以防止冲突：

```go
// ✅ Good — unexported type prevents key collisions
type contextKey struct{}

var requestIDKey = contextKey{}

func WithRequestID(ctx context.Context, id string) context.Context {
    return context.WithValue(ctx, requestIDKey, id)
}

func RequestID(ctx context.Context) string {
    id, _ := ctx.Value(requestIDKey).(string)
    return id
}
```

```go
// ❌ Bad — string keys risk collisions across packages
ctx = context.WithValue(ctx, "request_id", id) // any package could overwrite this
```

### 始终提供访问器函数——绝不要暴露键：

```go
// ✅ Good — clean API with accessors
rid := middleware.RequestID(ctx)

// ❌ Bad — exposes internal key type
rid := ctx.Value(requestIDKey).(string) // caller needs key, risks panic on nil
```

## 5. HTTP 处理程序中的上下文

### 使用 r.Context() 获取请求上下文：

```go
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context() // carries cancellation when client disconnects

    user, err := h.service.GetUser(ctx, id)
    if err != nil {
        if errors.Is(err, context.Canceled) {
            return // client disconnected, no point writing response
        }
        // handle error...
    }
    // ...
}
```

### 通过中间件附加值：

```go
func AuthMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        user, err := authenticate(r)
        if err != nil {
            http.Error(w, "unauthorized", http.StatusUnauthorized)
            return
        }
        ctx := WithUser(r.Context(), user)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}
```

## 6. 测试中的 Context

### 在测试中使用带超时的 context，以防止测试挂起：

```go
func TestSlowOperation(t *testing.T) {
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()

    result, err := slowOperation(ctx)
    if err != nil {
        t.Fatalf("unexpected error: %v", err)
    }
    // assert result...
}
```

### 测试取消行为：

```go
func TestCancellation(t *testing.T) {
    ctx, cancel := context.WithCancel(context.Background())
    cancel() // cancel immediately

    _, err := operation(ctx)
    if !errors.Is(err, context.Canceled) {
        t.Errorf("expected context.Canceled, got %v", err)
    }
}
```

## 7. context.Background() 与 context.TODO() 的对比

| 函数 | 使用场景 |
|---|---|
| `context.Background()` | 顶层：`main()`、`init()`、测试设置。作为明确使用的根 context。 |
| `context.TODO()` | 尚不确定应使用哪个 context 时的占位符。表示“此处需要修复”。 |

在生产代码中，`context.TODO()` 是一种代码异味——请在发布前将其替换。

## 验证清单

1. 在所有接受 `context.Context` 的函数中，它都是第一个参数
2. 不在结构体字段中存储 context
3. 在 `WithCancel`、`WithTimeout`、`WithDeadline` 之后立即调用 `defer cancel()`
4. 长循环在迭代之间检查 `ctx.Err()`
5. 子级超时时间不超过父级的超时预算
6. Context 值使用未导出的键类型和访问器函数
7. Context 值中仅存储请求范围内的元数据（而不是配置、连接）
8. HTTP 处理程序使用 `r.Context()` 并将其向下游传递
9. 不传递 `nil` context——使用 `context.TODO()` 或 `context.Background()`
10. 测试使用 `context.WithTimeout` 以防止挂起