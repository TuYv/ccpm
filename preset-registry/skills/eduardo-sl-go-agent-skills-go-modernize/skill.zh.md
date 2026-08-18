---
name: go-modernize
description: >
  Modernize Go code to use current language features and standard library
  additions. Covers generics, log/slog, errors.Join, slices/maps packages,
  range-over-func, and iterators introduced in Go 1.21-1.23+. Use when:
  "modernize", "update to modern Go", "use generics", "replace interface{}",
  "upgrade Go version", "slog", "errors.Join", "range over func",
  "iterators".
  Not for: general style (go-coding-standards), error philosophy
  (go-error-handling), logging architecture (go-observability).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. gopls is optional, for the modernize analyzer.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(golangci-lint:*) Bash(gopls:*)
metadata:
  author: eduardo-sl
  version: "1.4.1"
---
# Go 现代化

Go 在不断发展。为 Go 1.16 编写的代码，不应与面向 Go 1.25+ 的代码保持相同。逐步进行现代化——先更新 `go.mod`，然后采用新的模式。

绝不要采用高于 `go.mod` 中 `go` 指令版本的功能。应有意提升该指令版本，单独提交，并且只能提升到项目的 CI 和部署镜像实际运行的版本。

详细参考资料按需加载：

- `references/generics.md` — 使用类型参数替换 `interface{}`、约束、泛型容器，以及何时不应使用泛型。
- `references/stdlib-migrations.md` — 关于 slog、errors.Join、slices/maps 辅助函数、range-over-int 和迭代器的迁移前后示例。

只有在下面的摘要不足以解决问题时，才读取参考文件。

## 现代化流程

1. 检查 `go.mod` 中的 `go` 指令——它限制了你可以使用的功能版本。
2. 首先运行官方现代化工具——它们会自动发现并修复机械式迁移：

   ```bash
   # Go 1.26+ — the modernizers now live in go fix
   go fix ./...

   # Go 1.25 and earlier
   go run golang.org/x/tools/gopls/internal/analysis/modernize/cmd/modernize@latest -fix -test ./...
   ```

   两者都会直接改写源代码。运行前先提交，并检查差异。如果两个命令都不可用，则手动应用下表中的迁移。
3. 扫描下表，查找分析器无法覆盖的、需要依据具体情况判断的迁移（泛型、迭代器、日志记录器替换），并逐项应用。
4. 每组更改之后运行 `go build ./...` 和测试套件。

## 按 Go 版本划分的功能表

| Go 版本 | 功能 | 操作 |
|---|---|---|
| 1.13+ | `errors.Is`、`errors.As` | 替换 `==` 错误比较 |
| 1.13+ | `http.NewRequestWithContext` | 替换 `http.NewRequest` |
| 1.16+ | `embed` | 替换 `go-bindata` / `packr` |
| 1.18+ | 泛型 | 替换使用 `interface{}` 的工具函数 |
| 1.20+ | `errors.Join` | 替换手动累积错误 |
| 1.21+ | `log/slog` | 用于结构化日志记录时替换 `log` |
| 1.21+ | `slices`、`maps` | 替换手写的切片/映射工具函数 |
| 1.21+ | `min`、`max` 内置函数 | 替换 `math.Min`/`math.Max`（仅支持 float64） |
| 1.22+ | 遍历 int | 替换 `for i := 0; i < n; i++` |
| 1.23+ | 遍历 func | 替换基于回调的迭代 |
| 1.23+ | `unique.Make` | 替换手写的字符串驻留机制 |
| 1.24+ | `for b.Loop()` | 在基准测试中替换 `for range b.N` |
| 1.24+ | `t.Context()` | 在测试中替换 `context.Background()` |
| 1.24+ | `os.Root` | 替换手动的路径遍历检查 |
| 1.24+ | `go.mod` tool 指令 | 替换 `tools.go` 空白导入文件 |
| 1.24+ | `runtime.AddCleanup` | 替换 `runtime.SetFinalizer` |
| 1.25+ | `testing/synctest` | 在并发测试中替换 `time.Sleep` |
| 1.25+ | `sync.WaitGroup.Go` | 替换 `wg.Add(1)` + `go func(){defer wg.Done()}` |
| 1.26+ | `errors.AsType` | 使用已声明的目标变量替换 `errors.As` |
| 1.26+ | `slog.NewMultiHandler` | 替换手写的扇出处理器 |
| 1.26+ | `new(expr)` | 替换被获取地址的临时变量 |

## 关键迁移一览

### 泛型 — 类型安全的实用工具（Go 1.18+）

```go
// ❌ Before — loses type safety
func Contains(slice []interface{}, target interface{}) bool { /* ... */ }

// ✅ After — type-safe generic
func Contains[T comparable](slice []T, target T) bool { /* ... */ }
```

对容器类型（`Set[T]`、`Result[T]`）和实用工具函数使用泛型。对于单个具体类型即可满足需求的场景，不要使用泛型；也不要将泛型作为运行时多态中接口的替代方案。  
详细信息和约束模式：`references/generics.md`。

### 结构化日志（Go 1.21+）

```go
// ❌ Before
log.Printf("processing order %s for user %s", orderID, userID)

// ✅ After
slog.Info("processing order",
    slog.String("order_id", orderID),
    slog.String("user_id", userID),
)
```

只有在高吞吐日志场景需要其性能时，才保留 zap/zerolog；对于大多数服务，slog 已经足够。

### errors.Join（Go 1.20+）

```go
var errs []error
for _, item := range items {
    if err := validate(item); err != nil {
        errs = append(errs, err)
    }
}
if err := errors.Join(errs...); err != nil {
    return fmt.Errorf("validation: %w", err)
}
```

`errors.Join` 会保留错误链——`errors.Is`/`errors.As` 可作用于每个合并的错误。绝不要手动累积错误字符串。

### slices 和 maps 辅助函数（Go 1.21+）

```go
found := slices.Contains(items, target)          // not a manual loop
slices.SortFunc(users, func(a, b User) int {     // not sort.Slice
    return cmp.Compare(a.Name, b.Name)
})
keys := slices.Collect(maps.Keys(m))             // not a manual key loop
clone := maps.Clone(m)                           // not a manual copy loop
```

### 遍历 int（Go 1.22+）和迭代器（Go 1.23+）

```go
for i := range n { process(i) }                  // not for i := 0; i < n; i++

for i, v := range slices.Backward(items) {       // stdlib iterators
    fmt.Printf("%d: %v\n", i, v)
}
```

自定义 `iter.Seq`/`iter.Seq2` 迭代器可替代基于回调的迭代——完整的示例见 `references/stdlib-migrations.md`。

### 支持 context 的 HTTP 请求（Go 1.13+，经常被遗漏）

```go
// ❌ Before — request without context
req, err := http.NewRequest(http.MethodGet, url, nil)

// ✅ After — context propagated
req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
```

### 并发与测试（Go 1.24-1.25）

```go
// ❌ Before
var wg sync.WaitGroup
for _, job := range jobs {
    wg.Add(1)
    go func() {
        defer wg.Done()
        process(job)
    }()
}
wg.Wait()

// ✅ After — Go 1.25
var wg sync.WaitGroup
for _, job := range jobs {
    wg.Go(func() { process(job) })
}
wg.Wait()
```

`wg.Wait` 返回后不能调用 `wg.Go`，这消除了 `waitgroup` vet 分析器（Go 1.25+）报告的经典“在 Wait 后调用 Add”竞态。

在测试中，`context.Background()` 变为 `t.Context()`，`for range b.N` 变为 `for b.Loop()`，基于 `time.Sleep` 的并发测试变为 `synctest.Test`。→ 请参见 go-test-quality skill。

### 错误检查（Go 1.26）

```go
// ❌ Before — needs a declared target, and the pointer indirection is easy to get wrong
var pathErr *fs.PathError
if errors.As(err, &pathErr) {
    log.Println(pathErr.Path)
}

// ✅ After — Go 1.26
if pathErr, ok := errors.AsType[*fs.PathError](err); ok {
    log.Println(pathErr.Path)
}
```

`errors.Is` 未发生变化。只有 `As` 形式新增了泛型替代方案。

### 值驻留与清理（Go 1.23-1.24）

```go
// ✅ unique.Make deduplicates repeated values; Value() returns the canonical copy
h := unique.Make(hostname)          // unique.Handle[string], comparable, cheap
store[h] = conn                     // one string kept in memory, not one per entry

// ✅ AddCleanup replaces SetFinalizer: multiple cleanups, no resurrection,
//    and it works on objects that are part of a cycle
runtime.AddCleanup(obj, func(fd int) { syscall.Close(fd) }, obj.fd)
```

只有在性能分析显示重复值占据堆内存主要部分时，才应使用 `unique`——例如读取数百万行的配置解析器，而不是请求处理程序。

## 验证清单

1. `go.mod` 版本与代码库中使用的特性相匹配
2. 在使用 `any` 或类型参数会更清晰的地方，不要使用 `interface{}`
3. 对于结构化日志记录，使用 `log/slog` 替代 `log.Printf`
4. 使用 `errors.Join` 替代手动拼接错误字符串
5. 使用 `slices.Contains`、`slices.SortFunc`、`maps.Clone` 替代手写循环
6. 在适用的地方使用整数范围遍历（`for i := range n`）
7. 使用 `http.NewRequestWithContext` 替代 `http.NewRequest`
8. 不要使用 `sort.Slice`——使用带有 `cmp.Compare` 的 `slices.SortFunc`
9. 使用泛型构建类型安全的容器和工具，但不要在简单场景中过度使用
10. 根据近期 Go 版本加入标准库的替代方案，评估第三方依赖
11. 使用 `sync.WaitGroup.Go` 替代手动的 `Add`/`Done` 配对（Go 1.25+）
12. 测试使用 `t.Context()` 和 `for b.Loop()`（Go 1.24+）
13. 使用 `go.mod` 的工具指令替代 `tools.go`（Go 1.24+）