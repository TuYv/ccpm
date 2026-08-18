---
name: go-performance-review
description: >
  Detect performance anti-patterns and apply optimization techniques in Go.
  Covers allocations, string handling, slice/map preallocation, sync.Pool,
  benchmarking, and profiling with pprof. Use when checking performance,
  finding slow code, reducing allocations, profiling, or reviewing hot
  paths. Trigger examples: "check performance", "find slow code", "reduce
  allocations", "benchmark this", "profile", "optimize Go code".
  Not for: concurrency correctness (go-concurrency-review), general style
  (go-coding-standards).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. benchstat is optional, for comparing benchmark runs.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(benchstat:*)
metadata:
  author: eduardo-sl
  version: "1.2.1"
---
# Go 性能评审

先进行性能分析，再进行优化。没有证明问题存在的基准测试，绝不进行优化。

## 1. 减少分配

### 对于基本类型转换，优先使用 `strconv` 而不是 `fmt`：

```go
// ✅ Good — zero allocations for simple conversions
s := strconv.Itoa(42)
s := strconv.FormatFloat(3.14, 'f', 2, 64)

// ❌ Bad — fmt.Sprintf allocates
s := fmt.Sprintf("%d", 42)
```

### 避免不必要的字符串到字节转换：

```go
// ✅ Good — use strings.Builder for concatenation
var b strings.Builder
for _, s := range parts {
    b.WriteString(s)
}
result := b.String()

// ❌ Bad — repeated concatenation allocates on every +
result := ""
for _, s := range parts {
    result += s
}
```

### 在大小已知时预分配切片和映射：

```go
// ✅ Good — single allocation
users := make([]User, 0, len(ids))
for _, id := range ids {
    users = append(users, getUser(id))
}

// ✅ Good — map with capacity hint
lookup := make(map[string]User, len(users))

// ❌ Bad — repeated growing
var users []User // starts at 0, grows via doubling
```

### 对于频繁分配且生命周期较短的对象，使用 `sync.Pool`：

```go
var bufPool = sync.Pool{
    New: func() interface{} {
        return new(bytes.Buffer)
    },
}

func process(data []byte) string {
    buf := bufPool.Get().(*bytes.Buffer)
    defer func() {
        buf.Reset()
        bufPool.Put(buf)
    }()

    buf.Write(data)
    return buf.String()
}
```

## 2. 热路径优化

### 避免在紧密循环中进行接口转换：

```go
// ✅ Good — concrete type in loop
func sum(vals []int64) int64 {
    var total int64
    for _, v := range vals {
        total += v
    }
    return total
}

// ❌ Bad — interface{} causes boxing/unboxing
func sum(vals []interface{}) int64 { ... }
```

### 避免在性能关键路径中使用 `reflect`：

如果需要在大规模场景下实现类似反射的行为，请使用代码生成
（`go generate`、`stringer`、协议缓冲区）。

### 减少指针追踪：

```go
// ✅ Good — contiguous memory, cache-friendly
type Points struct {
    X []float64
    Y []float64
}

// ❌ Slower — pointer chasing per element
type Points []*Point
```

## 3. 映射性能

```go
// ✅ Use capacity hints
m := make(map[string]int, expectedSize)

// ✅ For read-heavy concurrent access, use sync.Map
// But ONLY when keys are stable — sync.Map has higher overhead
// for writes than a mutex-protected map.

// ✅ For fixed key sets, consider using a slice with index mapping
// instead of a map.
```

## 4. 基准测试

始终在优化前后编写基准测试：

```go
func BenchmarkFoo(b *testing.B) {
    // Setup outside the loop
    input := generateInput()

    b.ResetTimer()
    for i := 0; i < b.N; i++ {
        result = Foo(input) // assign to package-level var to prevent elision
    }
}

// Package-level var prevents compiler from eliminating the call
var result string
```

使用内存分析运行基准测试：

```bash
go test -bench=BenchmarkFoo -benchmem -count=5 ./...
```

使用 `benchstat` 比较优化前后的结果：

```bash
go test -bench=. -count=10 > old.txt
# make changes
go test -bench=. -count=10 > new.txt
benchstat old.txt new.txt
```

## 5. 性能分析

### CPU 性能分析：

```bash
go test -cpuprofile=cpu.prof -bench=BenchmarkFoo .
go tool pprof cpu.prof
```

### 内存性能分析：

```bash
go test -memprofile=mem.prof -bench=BenchmarkFoo .
go tool pprof -alloc_space mem.prof
```

### HTTP 服务器性能分析（导入 net/http/pprof）：

```go
import _ "net/http/pprof"

// Access at http://localhost:6060/debug/pprof/
go func() {
    // Bind to loopback only — never the public listener.
    log.Println(http.ListenAndServe("localhost:6060", nil))
}()
```

导入 `net/http/pprof` 会将其处理器注册到 `http.DefaultServeMux`。
如果服务还通过 `DefaultServeMux` 提供公共流量，性能分析数据、
命令行和 goroutine 堆栈将对全世界可读。始终为 pprof 提供独立的环回或内部网络监听器。

## 6. 高吞吐日志记录

对于大多数服务，`log/slog` 是正确的默认选择。但当基准测试表明
日志记录已成为瓶颈时（高频热点路径、每秒超过 100k 条日志），
可以考虑零分配日志记录器。

### slog 不够用时：

```go
// slog allocates per log call — fine for most services
slog.Info("request handled",
    slog.String("method", method),
    slog.Int("status", status),
)

// In hot paths where benchmarks prove logging is a bottleneck,
// use zap's zero-allocation core:
logger, _ := zap.NewProduction()
logger.Info("request handled",
    zap.String("method", method),
    zap.Int("status", status),
)
// zap avoids allocations by using a field pool and typed fields
```

### 决策树：

| 场景 | 日志记录器 |
|---|---|
| 通用服务日志记录 | `log/slog`（标准库，零依赖） |
| 高频热点路径（每秒超过 100k 条日志） | `go.uber.org/zap`（零分配） |
| 使用 JSON 的极高吞吐量 | `github.com/rs/zerolog`（零分配 JSON） |

### 两全其美——将 zap 用作 slog 后端：

```go
// Use slog API everywhere, backed by zap's performance
zapLogger, _ := zap.NewProduction()
slogHandler := zapslog.NewHandler(zapLogger.Core(), nil)
logger := slog.New(slogHandler)

// Code uses standard slog API — can swap backend without changing callers
logger.Info("request handled",
    slog.String("method", method),
    slog.Int("status", status),
)
```

### 热点路径中的日志记录反模式：

```go
// ❌ Bad — logging inside tight loop
for _, item := range millions {
    slog.Info("processing item", slog.String("id", item.ID))
    process(item)
}

// ✅ Good — sample or batch log
for i, item := range millions {
    process(item)
    if i%10000 == 0 {
        slog.Info("progress", slog.Int("processed", i), slog.Int("total", len(millions)))
    }
}

// ✅ Good — log summary after loop
slog.Info("batch complete", slog.Int("count", len(millions)))
```

除非有基准测试证明确有必要，否则绝不要切换日志记录器。
对于绝大多数 Go 服务来说，`slog` 已经足够快。

## 7. 常见反模式

| 反模式 | 修复方案 |
|---|---|
| 使用 `fmt.Sprintf` 进行简单的 int→string 转换 | `strconv.Itoa` |
| 在循环中进行字符串拼接 | `strings.Builder` |
| 创建切片时不预分配容量 | `make([]T, 0, n)` |
| 创建映射时不提供容量提示 | `make(map[K]V, n)` |
| 在函数内部调用 `regexp.Compile` | 在包级别只编译一次 |
| 在热点路径中调用 `json.Marshal` | 使用代码生成（`easyjson`、`sonic`） |
| 在紧密循环中记录日志 | 批量记录或采样记录 |
| 在非常紧密的内层循环中使用 `defer` | 手动清理（较少见，先进行基准测试） |

## 重要注意事项

大多数 Go 代码并不存在性能关键问题。可读性和正确性**始终**
优先于微优化。仅在满足以下条件时应用这些模式：

1. 基准测试证明该代码路径是瓶颈
2. 优化效果显著（提升 >10%）
3. 优化后的代码仍然易于阅读和维护

过早优化仍然是万恶之源，即使是在 Go 中也是如此。