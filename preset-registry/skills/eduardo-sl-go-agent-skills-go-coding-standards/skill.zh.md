---
name: go-coding-standards
description: >
  Go coding standards and style conventions grounded in Effective Go, Go
  Code Review Comments, and production-proven idioms. Use when writing or
  reviewing Go code, enforcing naming conventions, import ordering, variable
  declarations, struct initialization, or formatting rules. Trigger
  examples: "check Go style", "fix formatting", "review naming", "Go
  conventions".
  Not for: architecture (go-architecture-review), concurrency
  (go-concurrency-review), performance tuning (go-performance-review).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. golangci-lint is optional.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(golangci-lint:*)
metadata:
  author: eduardo-sl
  version: "1.3.1"
---
# Go 编码规范

基于《Effective Go》、Go Code Review Comments 以及生产环境中经过验证的惯用写法的 Go 风格约定。  
所有代码 MUST 通过 `goimports`、`go vet` 和 `staticcheck`（或 `golangci-lint run`），且不得出现错误。

## 1. 导入顺序

按以下顺序分组导入，并使用空行分隔：

```go
import (
    // 1. Standard library
    "context"
    "fmt"
    "net/http"

    // 2. External packages
    "github.com/gorilla/mux"
    "log/slog"

    // 3. Internal/project packages
    "github.com/myorg/myproject/internal/service"
)
```

绝 NEVER 使用点导入。仅在解决命名冲突时使用别名。

## 2. 命名规范

### 包
- 使用简短、小写、单个单词的名称。不要使用下划线或 camelCase。
- 名称应描述包所*提供的内容*，而不是它所*包含的内容*。
- 避免使用通用名称：`util`、`common`、`helpers`、`misc`、`base`。

### 函数和方法
- 导出的名称使用 MixedCaps，未导出的名称使用 mixedCaps。除测试文件外，不要使用下划线。
- Getter：使用 `Name()`，不要使用 `GetName()`。Setter：使用 `SetName()`。
- 构造函数：`NewFoo()` 返回 `*Foo`。如果包中只有一个类型，则使用 `New()`。

### 变量
- 在紧凑作用域中使用简短名称：`i`、`n`、`err`、`ctx`。
- 在更大的作用域中使用描述性名称：`userCount`、`retryTimeout`。
- 为未导出的包级全局变量添加 `_` 前缀：`var _defaultTimeout = 5 * time.Second`。
- 不要遮蔽内置标识符（`error`、`len`、`cap`、`new`、`make`、`close`）。

### 接口
- 单方法接口：使用方法名加 `-er` 后缀（`Reader`、`Writer`、`Closer`）。
- 在接口被*使用的地方*定义接口，而不是在接口被*实现的地方*定义。

## 3. 变量声明

### 顶层
顶层声明使用 `var`。当类型与表达式匹配时，不要显式指定类型：

```go
// ✅ Good
var _defaultPort = 8080
var _logger = slog.Default()

// ❌ Bad — redundant type
var _defaultPort int = 8080
```

### 局部
- 局部变量优先使用 `:=`。
- 仅当有意使用且零值具有明确意义时，才使用 `var`。

```go
// ✅ Good — zero value is meaningful
var buf bytes.Buffer

// ✅ Good — short declaration
name := getUserName()
```

## 4. 结构体初始化

始终使用字段名。绝不要依赖按位置初始化：

```go
// ✅ Good
user := User{
    Name:  "Alice",
    Email: "alice@example.com",
    Age:   30,
}

// ❌ Bad — positional, breaks on field reordering
user := User{"Alice", "alice@example.com", 30}
```

除非为了清晰起见，否则省略零值字段：

```go
// ✅ Good — zero values omitted
user := User{
    Name: "Alice",
}
```

## 5. 减少嵌套

使用提前返回优先处理错误和特殊情况。减少缩进层级：

```go
// ✅ Good — early return
func process(data []Item) error {
    for _, v := range data {
        if !v.IsValid() {
            log.Printf("invalid item: %v", v)
            continue
        }

        if err := v.Process(); err != nil {
            return err
        }

        v.Send()
    }
    return nil
}
```

消除不必要的 `else` 代码块：

```go
// ✅ Good
a := 10
if condition {
    a = 20
}

// ❌ Bad
var a int
if condition {
    a = 20
} else {
    a = 10
}
```

## 6. 分组与排序

将相关声明分组：

```go
const (
    _defaultPort    = 8080
    _defaultTimeout = 30 * time.Second
)

var (
    _validTypes  = map[string]bool{"json": true, "xml": true}
    _defaultUser = User{Name: "guest"}
)
```

文件内的函数排序：
1. 常量和变量
2. `New()` / 构造函数
3. 导出方法（按重要性排序，而不是按字母顺序）
4. 未导出方法
5. 辅助函数

接收器方法应紧跟在类型声明之后。

## 7. 行长度

软限制为 99 个字符。拆分过长的函数签名：

```go
func (s *Store) CreateUser(
    ctx context.Context,
    name string,
    email string,
    opts ...CreateOption,
) (*User, error) {
```

## 8. `defer` 的使用

使用 `defer` 执行清理操作。这样可以在获取资源的位置明确表达意图：

```go
mu.Lock()
defer mu.Unlock()

f, err := os.Open(path)
if err != nil {
    return err
}
defer f.Close()
```

## 9. 枚举

从 1 开始枚举（或使用显式哨兵值），以便让零值表示“未设置”：

```go
type Status int

const (
    StatusUnknown Status = iota
    StatusActive
    StatusInactive
)
```

## 10. 正确使用 `time` 包

- 使用 `time.Duration` 表示持续时间，而不是使用原始整数。
- 使用 `time.Time` 表示时间点。使用 `time.Since(start)`，而不是 `time.Now().Sub(start)`。
- 外部 API：接受 `int` 或 `float64`，并在内部进行转换。

```go
// ✅ Good
func poll(interval time.Duration) { ... }
poll(10 * time.Second)

// ❌ Bad
func poll(intervalSecs int) { ... }
poll(10)
```

## 11. 接收器

为每种类型选择一种接收器类型，并在该类型的所有方法中统一使用。
同时具有值接收器方法和指针接收器方法的类型，其方法集会根据持有方式而变化，这很容易引发问题。

当满足以下任一条件时，使用**指针接收器**——并在所有方法中统一使用指针接收器：

- 方法会修改接收器
- 结构体包含 `sync.Mutex` 或任何其他不得复制的字段
- 结构体足够大，以至于每次调用都复制它的成本可以被测量出来
- 该类型的任何其他方法已经需要使用指针接收器

对于小型不可变类型，使用**值接收器**：类似 `time.Time` 的值对象、枚举，以及其方法只进行读取的类型。

```go
// ✅ Consistent — every method on *Buffer takes a pointer
func (b *Buffer) Write(p []byte) (int, error) { ... }
func (b *Buffer) Len() int                     { ... }

// ❌ Mixed — Len() on a value copies the mutex
func (b *Buffer) Write(p []byte) (int, error) { ... }
func (b Buffer) Len() int                      { ... }
```

将接收器命名为类型名称后的一到两个字母（`s *Server`、`b *Buffer`）。
不要使用 `this` 或 `self`。同一类型的所有方法应保持接收器名称一致。

## 12. 结构体标签

标签是编译器不会检查的字符串。拼写错误不会产生任何提示。

```go
// ✅ Good — backticks, no spaces after commas, explicit names
type User struct {
    ID        string    `json:"id" db:"id"`
    Email     string    `json:"email" db:"email" validate:"required,email"`
    CreatedAt time.Time `json:"created_at" db:"created_at"`
    password  string    `json:"-"` // never serialised
}

// ❌ Bad
type User struct {
    ID    string `json: "id"`        // space after the colon: tag is ignored
    Email string `json:"email,"`     // trailing comma
    Token string                     // no tag: marshals as "Token"
}
```

规则：

- 为跨越序列化边界的类型的每个字段添加标签，包括名称恰好匹配的字段。
- 对于任何绝不能离开进程的内容，使用 `json:"-"`。不要依赖字段未导出这一点——未导出的字段会被 `encoding/json` 静默跳过，这看起来更像是疏忽，而不是明确意图。
- `omitempty` 会省略零值，因此无法区分“缺失”和“显式设为零”。当这种区别具有实际意义时，请使用指针或包装类型。
- `go vet` 包含 `structtag` 检查。运行它——它可以捕获上述格式错误的情况。

## 验证清单

在认为代码完成之前：
1. `goimports` 运行无误
2. `go vet ./...` 通过
3. `golangci-lint run` 通过（如果已配置）
4. 没有遮蔽内置标识符
5. 所有导入均已正确分组和排序
6. 结构体初始化使用字段名
7. 没有不必要的嵌套或 `else` 块
8. 同一类型的所有方法使用一致的接收者类型
9. 每个序列化结构体字段都带有显式标签