---
name: go-defensive-coding
description: >
  Prevent panics, silent corruption, and subtle runtime bugs in Go:
  typed-nil interfaces, slice aliasing, integer overflow on conversion,
  float comparison, defer in loops, defensive copying at API boundaries, and
  zero-value design. Use when hardening code against crashes, reviewing for
  nil-safety, converting between numeric types, or deciding what to copy at
  a package boundary. Trigger examples: "nil pointer panic", "why is my
  error not nil", "slice aliasing", "integer overflow", "compare floats",
  "defer in a loop", "defensive copy", "make this crash-proof".
  Not for: data races and goroutine lifecycle (go-concurrency-review),
  injection and auth (go-security-audit), a panic that already happened
  (go-troubleshooting).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. golangci-lint and gosec are optional, for enforcing the rules below.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(golangci-lint:*) Bash(gosec:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 防御式编码

Go 没有异常机制，类型系统也不提供 null 安全性。下面的每个陷阱都能顺利编译、通过代码审查，却会在生产环境中失败。

详细的参考材料会按需加载：

- `references/nil-and-aliasing.md` — 完整介绍 typed-nil 规则、切片别名场景以及内存保留。
- `references/numeric-safety.md` — 转换范围检查、溢出检测，以及浮点数和时间比较。

仅当下面的章节不足以解决问题时，才阅读参考文件。

## 操作模式

- **加固** — 你正在编写或修改代码。随时应用每条规则。
- **审查** — 你正在审计现有代码。报告问题时注明严重级别（🔴 panic 或数据损坏，🟡 潜在 bug，🟢 风格），并引用 file:line。

## 1. Typed-Nil 接口陷阱

一个非 nil 接口可以持有 nil 指针。这是 Go 中“看似不可能”的 nil 检查最常见的来源。

```go
type NotFoundError struct{ ID string }

func (e *NotFoundError) Error() string { return "not found: " + e.ID }

// ❌ Bad — returns a non-nil error even on success
func find(id string) error {
    var err *NotFoundError // typed nil
    if id == "" {
        err = &NotFoundError{ID: id}
    }
    return err // interface is (type=*NotFoundError, value=nil) — NOT nil
}

// ✅ Good — return the untyped nil literal
func find(id string) error {
    if id == "" {
        return &NotFoundError{ID: id}
    }
    return nil
}
```

规则：

- 永远不要声明一个具体的 error/pointer 变量，然后将其作为接口返回。在成功路径上显式返回 `nil`。
- 永远不要将可能为 nil 的具体指针存入 `error`、`io.Reader` 或任何接口类型的结构体字段。
- `go vet` 的 `nilness` 分析器可以捕获其中一些问题，但无法捕获全部问题。

## 2. Nil Map、切片和通道的行为

记住这张表——其中一半是安全的，另一半会 panic 或永久阻塞。

| 操作 | nil map | nil slice | nil channel |
|---|---|---|---|
| 读取 / 接收 | 零值 | 索引会 panic | 永久阻塞 |
| 写入 / 发送 | **会 panic** | `append` 可正常工作 | 永久阻塞 |
| `len` / `cap` | `0` | `0` | `0` |
| `range` | 迭代零次 | 迭代零次 | 永久阻塞 |
| `close` | 不适用 | 不适用 | **会 panic** |

```go
// ✅ A nil slice is a valid empty slice — do not guard append
var out []string
out = append(out, "a")

// ❌ A nil map is read-only
var m map[string]int
m["k"] = 1 // panic: assignment to entry in nil map

// ✅ Initialise every map before writing
m := make(map[string]int)
```

返回 nil 切片，而不是 `[]T{}`。对于 `encoding/json`，当字段使用 `omitempty` 时，它们在 JSON 中的编组结果完全相同，并且不会产生分配。只有在文档明确说明调用方会向其中写入时，才返回一个非 nil 的空 map。

## 3. 切片别名

切片是一个视图。只要容量允许，`append` 就会通过该视图写入，从而修改调用方仍然拥有的数据。

```go
a := []int{1, 2, 3, 4}
b := a[:2]
b = append(b, 99) // ❌ overwrites a[2]; a is now [1 2 99 4]
```

```go
// ✅ Full slice expression caps the view — append must reallocate
b := a[:2:2]
b = append(b, 99) // a is untouched
```

每当你将子切片交给无法控制的代码时，以及当结构体字段持有较大缓冲区的子切片时，都应采用这种做法。

子切片还会让整个底层数组保持存活。要释放大型缓冲区，请复制所需内容：`head := slices.Clone(buf[:64])`。

## 4. 在边界处进行防御性复制

切片和映射都是引用类型。不经复制就存储或返回它们，相当于将指向内部状态的可变句柄交给外部。

```go
type Config struct{ hosts []string }

// ❌ Bad — caller can mutate our state, both ways
func NewConfig(hosts []string) *Config { return &Config{hosts: hosts} }
func (c *Config) Hosts() []string      { return c.hosts }

// ✅ Good — copy in, copy out
func NewConfig(hosts []string) *Config {
    return &Config{hosts: slices.Clone(hosts)}
}
func (c *Config) Hosts() []string { return slices.Clone(c.hosts) }
```

映射请使用 `maps.Clone`。两者都是浅复制——`[]*User` 的克隆仍然共享所指向的用户对象。

当值会在调用结束后被保留，或会暴露给调用方时，应进行复制。不要复制只在函数内部读取的切片；那会造成无谓的内存分配。

### 防止意外复制

包含 `sync.Mutex`、`sync.WaitGroup` 或 `atomic.Int64` 的结构体绝不能被复制——副本会获得自己独立的锁，而两个部分都会认为自己已被同步。

```go
// ❌ Bad — the receiver is a copy, so the mutex protects nothing
func (c Counter) Value() int { ... }

// ❌ Bad — passing by value copies the mutex
func report(c Counter) { ... }
```

`go vet` 的 `copylocks` 分析器可以捕获这些问题。对于必须禁止复制、但不持有锁的类型，嵌入一个 `noCopy` 标记，以便 `vet` 也能捕获它们：

```go
type noCopy struct{}

func (*noCopy) Lock()   {}
func (*noCopy) Unlock() {}

type Tracker struct {
    noCopy noCopy
    // ...
}
```

## 5. 数值转换与比较

Go 在进行数值转换时绝不会 panic。它会截断。

```go
// ❌ Silent corruption when the value does not fit
count := int32(int64Total)

// ✅ Range-check before narrowing
if int64Total > math.MaxInt32 || int64Total < math.MinInt32 {
    return fmt.Errorf("total %d out of int32 range", int64Total)
}
count := int32(int64Total)
```

这同样适用于 `int` → `uint`（负数会绕回为极大的值），以及赋值给固定大小类型的 `len()` 结果。`gosec` 会将这些报告为 G115。

绝不要使用 `==` 比较浮点数；也绝不要使用 `==` 比较 `time.Time`。

```go
// ✅ Floats: compare against a tolerance
if math.Abs(got-want) < 1e-9 { ... }

// ✅ Times: Equal compares the instant, == also compares wall clock and location
if t1.Equal(t2) { ... }
```

整数除以零会 panic；浮点数除以零会产生 `±Inf` 或 `NaN`，且 `NaN != NaN`。应当保护来自输入的除数。

## 6. 资源生命周期

`defer` 会在**函数**返回时执行，而不是在代码块结束时执行。

```go
// ❌ Bad — all files stay open until the loop finishes
for _, name := range names {
    f, err := os.Open(name)
    if err != nil {
        return err
    }
    defer f.Close()
    process(f)
}

// ✅ Good — a function scope per iteration
for _, name := range names {
    if err := func() error {
        f, err := os.Open(name)
        if err != nil {
            return err
        }
        defer f.Close()
        return process(f)
    }(); err != nil {
        return err
    }
}
```

同样的规则也适用于循环或长生命周期函数中的 `resp.Body.Close`、`rows.Close`、`mu.Unlock` 和
`tx.Rollback`。

对于任何写入过数据的对象，都要检查延迟执行的 `Close` 所返回的错误——否则关闭时刷新失败会导致静默的数据丢失：

```go
defer func() {
    if cerr := f.Close(); cerr != nil && err == nil {
        err = fmt.Errorf("close %s: %w", name, cerr)
    }
}()
```

## 7. 零值与初始化安全

设计类型时应确保零值可用，这样就不会忘记调用构造函数。

```go
// ✅ Usable zero value — sync.Mutex and the nil map read are both fine
type Counter struct {
    mu sync.Mutex
    n  map[string]int
}

func (c *Counter) Inc(k string) {
    c.mu.Lock()
    defer c.mu.Unlock()
    if c.n == nil { // lazily initialise on first write
        c.n = make(map[string]int)
    }
    c.n[k]++
}
```

当延迟初始化必须恰好执行一次且可能发生竞态时，应使用 `sync.Once`。

避免使用 `init()`。它会在 `main` 之前运行，无法干净地处理失败，无法单独测试，而且其跨文件执行顺序取决于文件名。应使用显式的
`New...` 构造函数并返回错误。

## 使用工具强制执行

运行以下工具；不要仅依赖人工阅读。未安装的工具应跳过并记录。

```bash
go vet ./...                                  # includes the nilness analyzer
golangci-lint run                             # errcheck, bodyclose, makezero, sqlclosecheck
gosec -include=G115,G104,G601 ./...           # integer overflow, unhandled errors
go test -race ./...                           # aliasing bugs often surface as races
```

相关的 golangci-lint 检查器包括：`errcheck`、`bodyclose`、`sqlclosecheck`、
`rowserrcheck`、`makezero`、`nilerr`、`exhaustive`，以及启用了
`nilness` 分析器的 `govet`。

Go 1.22 及更高版本会为每次循环迭代创建独立的变量。不要添加旧式的 `v := v` 变量遮蔽语句；如果模块仍使用
`go 1.21`，则不要删除已有的这行代码。

## 验证清单

1. 没有函数在成功路径上将具体指针类型作为接口返回
2. 每个 map 都会在首次写入前完成初始化
3. 跨包边界传递的子切片使用完整切片表达式 `a[:n:n]`
4. 存储在结构体中或从结构体返回的切片和 map 都会被克隆
5. 不会按值传递或接收任何持有互斥锁或原子类型的类型
6. 每次缩窄数值类型的转换都经过范围检查，或已记录其有界性
7. 不对浮点数或 `time.Time` 使用 `==`
8. 从输入派生的除数都会检查是否为零
9. 循环体内没有不属于外层函数作用域的 `defer`
10. 写入过数据的资源在延迟执行 `Close` 时会报告其错误
11. `go vet`、`golangci-lint` 和 `go test -race` 均通过