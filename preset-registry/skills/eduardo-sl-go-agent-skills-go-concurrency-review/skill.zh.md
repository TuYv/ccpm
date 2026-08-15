---
name: go-concurrency-review
description: >
  Review and implement safe concurrency patterns in Go: goroutines, channels,
  sync primitives, context propagation, and goroutine lifecycle management.
  Use when writing concurrent code, reviewing async patterns, checking thread safety,
  debugging race conditions, or designing producer/consumer pipelines.
  Trigger examples: "check thread safety", "review goroutines", "race condition",
  "channel patterns", "sync.Mutex", "context cancellation", "goroutine leak".
  Do NOT use for general code style (use go-coding-standards) or
  HTTP handler patterns (use go-api-design).
license: MIT
metadata:
  version: "1.1.0"
---
# Go 并发审查

Go 的并发功能非常强大，但也很容易在不经意间出错。
以下模式可防止 goroutine 泄漏、数据竞态和死锁。

## 工作模式

开始之前，请选择与请求相匹配的模式：

- **实现** — 编写新的并发代码。遵循下述模式，将其作为构建规则。
- **差异审查**（默认）— 根据每个章节检查变更的代码，尤其关注新增的 `go` 语句和共享状态。
- **泄漏/竞态排查** — 已经观察到相关症状（goroutine 数量不断增长、`-race` 报告、死锁）。从“审计大型代码库”和竞态检测章节开始定位问题。

## 审计大型代码库

对于完整的并发审计，应分别执行以下检查，而不是只进行一次线性阅读：

1. **Goroutine 生命周期：**查找每一条 `go` 语句
   （`grep -rn "go func\|go [a-zA-Z]" --include="*.go"`），并验证每个 goroutine
   都有终止路径（context、已关闭的 channel、WaitGroup）。
2. **共享状态：**查找由多个 goroutine 访问的包级变量和结构体字段；验证是否使用 mutex/atomic 进行保护。
3. **Channel 拓扑：**梳理每个 channel 的生产者/消费者；验证 channel 只关闭一次，并且不存在向已关闭 channel 发送数据的路径。
4. **Context 传播：**验证阻塞调用是否接受并遵循
   `context.Context`。

如果你的环境支持将工作委派给并行子代理或任务，请为每项检查分别分配一个；否则，请按顺序执行。发现的问题必须引用 `file.go:line`。最后必须执行 `go test -race ./...`。

## 1. Goroutine 生命周期管理

每个 goroutine 都必须有明确的终止路径。禁止启动后不管。

### 使用 `errgroup` 协调多个 goroutine：

```go
g, ctx := errgroup.WithContext(ctx)

g.Go(func() error {
    return fetchUsers(ctx)
})

g.Go(func() error {
    return fetchOrders(ctx)
})

if err := g.Wait(); err != nil {
    return fmt.Errorf("fetch data: %w", err)
}
```

### 长时间运行的 goroutine 必须遵循 context：

```go
func (w *Worker) Run(ctx context.Context) error {
    for {
        select {
        case <-ctx.Done():
            return ctx.Err()
        case job := <-w.jobs:
            if err := w.process(job); err != nil {
                w.logger.Error("process job", slog.Any("error", err))
            }
        }
    }
}
```

### 在所有者中启动 goroutine，而不是在被调用者中启动：

```go
// ✅ Good — caller controls lifecycle
go worker.Run(ctx)

// ❌ Bad — function secretly starts goroutine
func NewWorker() *Worker {
    w := &Worker{}
    go w.run() // hidden goroutine — caller has no control
    return w
}
```

## 2. Channel 模式

### Channel 大小只能为 1 或不设置：

```go
// Unbuffered — synchronization point
ch := make(chan Result)

// Buffered with size 1 — single-item handoff
ch := make(chan Result, 1)

// Larger buffers need explicit justification with documented reasoning
ch := make(chan Result, 100) // requires comment explaining why
```

### 信号 channel 使用空结构体：

```go
done := make(chan struct{})
close(done) // broadcast signal to all receivers
```

### 可干净关闭的生产者/消费者模式：

```go
func produce(ctx context.Context) <-chan Item {
    ch := make(chan Item)
    go func() {
        defer close(ch)
        for {
            item, err := fetchNext(ctx)
            if err != nil {
                return
            }
            select {
            case ch <- item:
            case <-ctx.Done():
                return
            }
        }
    }()
    return ch
}
```

## 3. 互斥锁模式

### 互斥锁的零值可直接使用：

```go
// ✅ Good — zero value works
type Cache struct {
    mu    sync.RWMutex
    items map[string]Item
}

// ❌ Bad — unnecessary pointer
type Cache struct {
    mu    *sync.RWMutex // never do this
}
```

### 互斥锁在结构体中的位置：

```go
type SafeMap struct {
    mu sync.RWMutex // mutex guards the fields below
    items map[string]string
    count int
}
```

互斥锁应直接放在其所保护的字段上方，
并通过注释说明二者的关系。

### 锁的作用域应尽可能小：

```go
// ✅ Good — minimal lock scope
func (c *Cache) Get(key string) (Item, bool) {
    c.mu.RLock()
    item, ok := c.items[key]
    c.mu.RUnlock()
    return item, ok
}

// ✅ Also good — defer for methods that return early
func (c *Cache) GetOrCreate(key string) Item {
    c.mu.Lock()
    defer c.mu.Unlock()

    if item, ok := c.items[key]; ok {
        return item
    }
    item := newItem(key)
    c.items[key] = item
    return item
}
```

### 切勿复制互斥锁：

```go
// ❌ BLOCKER — copying a mutex copies its lock state
cache2 := *cache1 // this copies the mutex!
```

## 4. 原子操作

对于简单的计数器和标志，请使用 `sync/atomic` 或 `go.uber.org/atomic`：

```go
// ✅ Good — type-safe atomics
import "go.uber.org/atomic"

type Server struct {
    running atomic.Bool
    reqCount atomic.Int64
}

func (s *Server) HandleRequest() {
    s.reqCount.Inc()
    // ...
}
```

## 5. 上下文传递

### 规则：
- 上下文始终是第一个参数。
- 切勿将上下文存储在结构体字段中。
- 为子操作派生子上下文：

```go
func (s *Service) Process(ctx context.Context, req Request) error {
    // Derive context with timeout for external call
    fetchCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
    defer cancel() // ALWAYS defer cancel

    data, err := s.client.Fetch(fetchCtx, req.ID)
    if err != nil {
        return fmt.Errorf("fetch %s: %w", req.ID, err)
    }
    // ...
}
```

### 在 `select` 中切勿忽略上下文取消：

```go
// ✅ Good
select {
case result := <-ch:
    return result, nil
case <-ctx.Done():
    return nil, ctx.Err()
}

// ❌ Bad — blocks forever if context cancelled
result := <-ch
```

## 6. 避免可变的全局变量

```go
// ❌ Bad — mutable global, not safe for concurrent access
var db *sql.DB

// ✅ Good — pass as dependency
type Server struct {
    db *sql.DB
}
```

## 7. 使用 sync.Once 实现延迟初始化

```go
type Client struct {
    initOnce sync.Once
    conn     *grpc.ClientConn
}

func (c *Client) getConn() *grpc.ClientConn {
    c.initOnce.Do(func() {
        c.conn = dial()
    })
    return c.conn
}
```

## 竞态检测

在 CI 中运行测试时，始终启用竞态检测器：

```bash
go test -race ./...
```

这一点没有商量余地。未使用 `-race` 即能通过的测试套件，并不能证明并发正确性。

## 危险信号检查清单

- 🔴 启动 Goroutine 时未提供关闭路径
- 🔴 通道从未关闭（可能导致 Goroutine 泄漏）
- 🔴 按值复制互斥锁
- 🔴 将上下文存储在结构体字段中
- 🔴 在已有父上下文可用时使用 `context.Background()`
- 🔴 阻塞操作中的 `select` 没有 `ctx.Done()` 分支
- 🔴 未经同步就访问共享 map/slice
- 🟡 使用任意较大容量的缓冲通道
- 🟡 使用 `time.Sleep` 进行同步，而不是使用正确的信号机制
- 🟡 在 `init()` 或构造函数中启动 Goroutine，却没有生命周期控制