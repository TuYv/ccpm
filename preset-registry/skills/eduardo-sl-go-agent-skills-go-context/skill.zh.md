---
name: go-context
description: >
  Correct usage of context.Context in Go: propagation, cancellation,
  timeouts, deadlines, values, and common anti-patterns. Use when: "context
  usage", "context.Context", "context cancellation", "timeout",
  "context.WithTimeout", "context.WithCancel", "context values", "context
  propagation".
  Not for: concurrency beyond context (go-concurrency-review), HTTP
  middleware (go-api-design), error handling (go-error-handling).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.2.0"
---
# Go 上下文

`context.Context` 控制跨 API 边界的取消、截止时间和请求范围值。误用它会导致 goroutine 泄漏、孤立工作以及难以察觉的生产环境 bug。

按需加载的详细参考资料：

- `references/timeout-budgets.md` — 划分父上下文的剩余预算，读取 `ctx.Deadline()`。
- `references/values.md` — 上下文键类型、访问器以及冲突陷阱。
- `references/http-and-testing.md` — 处理程序和中间件中的请求上下文，以及取消测试。

仅当以下部分不足以解决问题时，才读取参考文件。

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

### 永远不要将 context 存储在结构体中：

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

### 永远不要传递 nil context：

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

不调用 cancel 会导致资源（计时器、goroutine）泄漏，直到父 context 被取消。

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

### 在循环中检查 context 取消状态：

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

## 3. 超时与截止时间

### 使用 WithTimeout 实现基于时长的限制：

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

### 使用 WithDeadline 实现绝对时间限制：

```go
// Use when coordinating with external deadlines (SLAs, cron windows)
deadline := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
ctx, cancel := context.WithDeadline(ctx, deadline)
defer cancel()
```

### 超时预算

子级超时会消耗父级的部分预算；它绝不会延长该预算。一个 30 秒请求处理器中的 5 秒数据库调用和 10 秒 API 调用共同构成预算。父级仅剩 5 秒时，设置一个 60 秒的子级会在父级截止时间静默触发，这在凌晨 3 点看来就像一个 bug。

在开始无法中断的工作之前，使用 `ctx.Deadline()` 读取剩余预算；如果时间过短，则快速失败。

示例见 `references/timeout-budgets.md`。

## 4. Context 值

仅存储请求范围的元数据：请求 ID、追踪或 span ID、已认证用户、请求范围的日志记录器。绝不要存储数据库连接、配置，或函数本可将其作为显式参数接收的任何内容。

键必须是未导出的类型，绝不能是字符串——字符串键可能被进程中的任何其他包覆盖。导出访问器函数，使调用方永远不必自行对 `ctx.Value` 进行类型断言。

示例见 `references/values.md`。

## 5. HTTP 处理器和测试中的 Context

处理器接收 `r.Context()` 并将其向下游传递。已取消的请求意味着客户端已断开连接：无需写入响应，直接返回。中间件使用 `r.WithContext(ctx)` 附加值。

测试使用 `context.WithTimeout` 包装被测调用，这样卡住时会使测试失败，而不是阻塞整个测试套件；并断言 `errors.Is(err,
context.Canceled)`，以证明取消操作得到遵守。

示例见 `references/http-and-testing.md`。

## 6. context.Background() 与 context.TODO()

| 函数 | 何时使用 |
|---|---|
| `context.Background()` | 顶层：`main()`、`init()`、测试设置。有意创建的根 context。 |
| `context.TODO()` | 当你尚不清楚该使用哪个 context 时的占位符。表示“这需要修复”。 |

生产代码中的 `context.TODO()` 是一种代码异味——在发布前将其替换。

## 验证清单

1. 所有接受 `context.Context` 的函数均将其作为第一个参数
2. 不在结构体字段中存储 context
3. 在 `WithCancel`、`WithTimeout`、`WithDeadline` 之后立即调用 `defer cancel()`
4. 长循环在每次迭代之间检查 `ctx.Err()`
5. 子级超时不超过父级超时预算
6. Context 值使用带有访问器函数的未导出键类型
7. Context 值中仅存储请求范围的元数据（不包括配置、连接）
8. HTTP 处理器使用 `r.Context()` 并将其向下游传递
9. 不传递 `nil` context——使用 `context.TODO()` 或 `context.Background()`
10. 测试使用 `context.WithTimeout` 防止卡住