---
name: go-modernize
description: >
  Modernize Go code to use current language features and standard library additions.
  Covers generics, log/slog, errors.Join, slices/maps packages, range-over-func,
  and iterators introduced in Go 1.21-1.23+.
  Use when: "modernize", "update to modern Go", "use generics", "replace interface{}",
  "upgrade Go version", "slog", "errors.Join", "range over func", "iterators".
  Do NOT use for: general code style (use go-coding-standards),
  error handling philosophy (use go-error-handling), or
  logging architecture (use go-observability).
license: MIT
metadata:
  version: "1.2.0"
---
# Go 现代化

Go 在不断演进。为 Go 1.16 编写的代码不应与面向 Go 1.22+ 的代码看起来相同。应逐步实现现代化——先更新 `go.mod`，然后采用新模式。

可按需加载的详细参考资料：

- `references/generics.md` — 使用类型参数替换 `interface{}`、约束、泛型容器，以及何时不应使用泛型。
- `references/stdlib-migrations.md` — slog、errors.Join、slices/maps 辅助函数、整数 range 和迭代器的迁移前后示例。

仅当以下摘要不足以满足需求时，才读取参考文件。

## 现代化流程

1. 检查 `go.mod` 中的 `go` 指令——它限制了你可以使用的功能。
2. 首先运行官方 modernize 分析器——它会自动发现并修复机械式迁移：

   ```bash
   go run golang.org/x/tools/gopls/internal/analysis/modernize/cmd/modernize@latest -fix -test ./...
   ```

   如果该命令在你的环境中不可用，请改为手动应用下表中的迁移。
3. 查看下表中分析器未覆盖、需要判断的迁移（泛型、迭代器、日志记录器替换），并逐项应用。
4. 每完成一组更改后，运行 `go build ./...` 和测试套件。

## 按 Go 版本划分的功能表

| Go 版本 | 功能 | 操作 |
|---|---|---|
| 1.13+ | `errors.Is`, `errors.As` | 替换使用 `==` 的错误比较 |
| 1.13+ | `http.NewRequestWithContext` | 替换 `http.NewRequest` |
| 1.16+ | `embed` | 替换 `go-bindata` / `packr` |
| 1.18+ | 泛型 | 替换使用 `interface{}` 的工具函数 |
| 1.20+ | `errors.Join` | 替换手动错误累积 |
| 1.21+ | `log/slog` | 替换用于结构化日志记录的 `log` |
| 1.21+ | `slices`, `maps` | 替换手写的切片/映射工具 |
| 1.21+ | `min`, `max` 内置函数 | 替换 `math.Min`/`math.Max`（仅限 float64） |
| 1.22+ | 对整数使用 range | 替换 `for i := 0; i < n; i++` |
| 1.23+ | 对函数使用 range | 替换基于回调的迭代 |

## 关键迁移概览

### 泛型——类型安全的工具（Go 1.18+）

```go
// ❌ Before — loses type safety
func Contains(slice []interface{}, target interface{}) bool { /* ... */ }

// ✅ After — type-safe generic
func Contains[T comparable](slice []T, target T) bool { /* ... */ }
```

对容器类型（`Set[T]`、`Result[T]`）和工具函数使用泛型。不要在单一具体类型即可满足需求的地方使用泛型，也不要用泛型代替用于运行时多态的接口。
详细信息和约束模式请参阅：`references/generics.md`。

### 结构化日志记录（Go 1.21+）

```go
// ❌ Before
log.Printf("processing order %s for user %s", orderID, userID)

// ✅ After
slog.Info("processing order",
    slog.String("order_id", orderID),
    slog.String("user_id", userID),
)
```

仅当高吞吐量日志记录需要 zap/zerolog 的性能时才保留它们；对于大多数服务，slog 已经足够。

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

`errors.Join` 会保留错误链——`errors.Is`/`errors.As` 可作用于每个已合并的错误。切勿手动拼接错误字符串。

### slices 和 maps 辅助函数（Go 1.21+）

```go
found := slices.Contains(items, target)          // not a manual loop
slices.SortFunc(users, func(a, b User) int {     // not sort.Slice
    return cmp.Compare(a.Name, b.Name)
})
keys := slices.Collect(maps.Keys(m))             // not a manual key loop
clone := maps.Clone(m)                           // not a manual copy loop
```

### 对整数执行 range（Go 1.22+）和迭代器（Go 1.23+）

```go
for i := range n { process(i) }                  // not for i := 0; i < n; i++

for i, v := range slices.Backward(items) {       // stdlib iterators
    fmt.Printf("%d: %v\n", i, v)
}
```

自定义 `iter.Seq`/`iter.Seq2` 迭代器可取代基于回调的迭代方式——完整示例见 `references/stdlib-migrations.md`。

### 上下文感知的 HTTP 请求（Go 1.13+，经常被忽略）

```go
// ❌ Before — request without context
req, err := http.NewRequest(http.MethodGet, url, nil)

// ✅ After — context propagated
req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
```

## 验证清单

1. `go.mod` 版本与代码库中使用的特性相匹配
2. 在使用 `any` 或类型参数会更清晰的地方，不使用 `interface{}`
3. 使用 `log/slog` 而非 `log.Printf` 进行结构化日志记录
4. 使用 `errors.Join` 而非手动拼接错误字符串
5. 使用 `slices.Contains`、`slices.SortFunc`、`maps.Clone` 取代手写循环
6. 在适用的地方对整数执行 range（`for i := range n`）
7. 使用 `http.NewRequestWithContext` 而非 `http.NewRequest`
8. 不使用 `sort.Slice`——改用搭配 `cmp.Compare` 的 `slices.SortFunc`
9. 将泛型用于类型安全的容器和工具，但不要在简单场景中过度使用
10. 评估第三方依赖时，考虑使用 Go 近期版本中新增的标准库替代方案