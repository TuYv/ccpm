---
name: go-concurrency-review
description: >
  Review and implement safe concurrency patterns in Go: goroutines,
  channels, sync primitives, context propagation, and goroutine lifecycle
  management. Use when writing concurrent code, reviewing async patterns,
  checking thread safety, debugging race conditions, or designing
  producer/consumer pipelines. Trigger examples: "check thread safety",
  "review goroutines", "race condition", "channel patterns", "sync.Mutex",
  "context cancellation", "goroutine leak".
  Not for: general style (go-coding-standards), HTTP handler patterns
  (go-api-design).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Race detection requires cgo (CGO_ENABLED=1).
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.3.0"
---
# Go 并发审查

Go 中的并发功能强大，但很容易在不经意间出错。  
这些模式可以防止 goroutine 泄漏、数据竞争和死锁。

按需加载的详细参考材料：

- `references/channels.md` — 大小、信号传递、生产者关闭。
- `references/mutex-and-atomics.md` — 互斥锁放置位置、锁的作用域、原子操作、
  `sync.Once`。

仅当下面的章节不足以解决问题时，才读取参考文件。

## 操作模式

开始前选择与请求匹配的模式：

- **实现** — 编写新的并发代码。将下面的模式作为构造规则遵循。
- **差异审查**（默认）— 根据每个章节检查变更后的代码，特别关注新增的 `go` 语句和共享状态。
- **泄漏/竞争排查** — 已经观察到某种症状（goroutine 数量持续增长、`-race` 报告、死锁）。从“审计大型代码库”和竞态检测章节开始，以定位问题。

## 审计大型代码库

进行完整的并发审计时，应执行以下相互独立的检查，而不是线性地通读代码：

1. **Goroutine 生命周期：** 查找每个 `go` 语句
   (`grep -rn "go func\|go [a-zA-Z]" --include="*.go"`) 并确认每个语句
   都有终止路径（context、已关闭的 channel、WaitGroup）。
2. **共享状态：** 查找被多个 goroutine 访问的包级变量和结构体字段；确认其受到互斥锁/原子操作保护。
3. **Channel 拓扑：** 梳理每个 channel 对应的生产者/消费者；确认恰好关闭一次，并且不存在向已关闭 channel 发送的路径。
4. **Context 传递：** 确认阻塞调用能够接收并遵守 `context.Context`。

如果你的环境支持将工作委派给并行子代理或任务，则为每项检查分配一个；否则按顺序执行。发现的问题必须注明 `file.go:line`。始终以 `go test -race ./...` 结束。

## 1. Goroutine 生命周期管理

每个 goroutine 都必须有明确的终止路径。禁止即发即忘。

### 使用 `errgroup` 协调 goroutine：

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

### 长时间运行的 goroutine 必须遵守 context：

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

### 在所有者中启动 goroutine，而不是在被调用方中启动：

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

- 大小只能是一个或零。无缓冲 channel 是同步点；容量为 1 的 buffer 用于交接。任何更大的 buffer 都需要注释说明为何使用该数值——随意设置为 `100` 是一个等待生产环境速度低于预发布环境那天才会暴露的 bug。
- 信号 channel 携带 `struct{}`，而 `close(done)` 会同时向所有接收方广播。
- 生产者拥有 channel，并且只有生产者负责关闭它，在生产 goroutine 中使用 `defer close(ch)`。每次发送都必须放在针对 `ctx.Done()` 的 `select` 中，否则消费者离开后，生产者就会泄漏。

`references/channels.md` 中的示例。

## 3. 互斥锁与原子操作

- 零值的 `sync.Mutex` 和 `sync.RWMutex` 可直接使用。`*sync.Mutex` 字段始终是错误的。
- 将互斥锁直接声明在其保护的字段上方，并添加注释说明二者的关系。一个保护“整个结构体”的互斥锁实际上没有明确保护任何内容。
- 将临界区保持在最小范围内——持有一个锁时，绝不要调用外部服务，也不要再获取第二个锁。
- 🔴 绝不要复制包含互斥锁的值（`c2 := *c1`）：副本会携带原始值的锁状态。`go vet` 可以捕获其中大多数问题；应当信任它。
- 对计数器和标志使用 `sync/atomic` 类型，而不是使用互斥锁保护 `int64`。
- 对于必须恰好执行一次的延迟初始化，使用 `sync.Once`。

`references/mutex-and-atomics.md` 中的示例。

## 4. Context 传递

Context 始终是第一个参数，绝不能作为结构体字段，并且每个阻塞操作都要对 `ctx.Done()` 进行选择：

```go
// ✅ Good
select {
case result := <-ch:
    return result, nil
case <-ctx.Done():
    return nil, ctx.Err()
}

// ❌ Bad — blocks forever if the context is cancelled
result := <-ch
```

为每次外部调用派生一个具有独立超时的子 context，并立即执行 `defer cancel()`。完整规则见 `go-context` skill。

## 5. 避免可变全局变量

```go
// ❌ Bad — mutable global, not safe for concurrent access
var db *sql.DB

// ✅ Good — pass as dependency
type Server struct {
    db *sql.DB
}
```

## 竞态检测

在 CI 期间始终使用竞态检测器运行测试：

```bash
go test -race ./...
```

这是不可妥协的要求。不使用 `-race` 通过的测试套件无法证明并发正确性。

## 高风险信号检查清单

- 🔴 启动 goroutine 时没有关闭路径
- 🔴 Channel 从未关闭（可能导致 goroutine 泄漏）
- 🔴 按值复制互斥锁
- 🔴 将 Context 存储在结构体字段中
- 🔴 在已有父 context 可用的情况下使用 `context.Background()`
- 🔴 阻塞操作中的 `select` 没有 `ctx.Done()` 分支
- 🔴 访问共享 map/slice 时没有同步
- 🟡 使用大小任意且过大的带缓冲 channel
- 🟡 使用 `time.Sleep` 进行同步，而不是使用适当的信号传递
- 🟡 在 `init()` 或构造函数中启动 goroutine，却没有生命周期控制