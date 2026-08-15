---
name: go-coding-standards
description: >
  Go coding standards and style conventions grounded in Effective Go,
  Go Code Review Comments, and production-proven idioms.
  Use when writing or reviewing Go code, enforcing naming conventions, import ordering,
  variable declarations, struct initialization, or formatting rules.
  Trigger examples: "check Go style", "fix formatting", "review naming", "Go conventions".
  Do NOT use for architecture decisions, concurrency patterns, or performance tuning —
  use go-architecture-review, go-concurrency-review, or go-performance-review instead.
license: MIT
metadata:
  version: "1.1.0"
---
# Go 编码标准

遵循《Effective Go》《Go Code Review Comments》以及经过生产环境验证的惯用写法，采用符合 Go 语言习惯的约定。
所有代码都必须通过 `goimports`、`go vet` 和 `staticcheck`（或 `golangci-lint run`）检查，且不得出现错误。

## 1. 导入顺序

按以下顺序对导入项进行分组，各组之间以空行分隔：

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

绝不使用点导入。仅在解决命名冲突时使用别名。

## 2. 命名约定

### 包
- 使用简短、全小写的单个单词名称。不得使用下划线或 camelCase。
- 名称应描述包所*提供的功能*，而不是包中*包含的内容*。
- 避免使用通用名称：`util`、`common`、`helpers`、`misc`、`base`。

### 函数与方法
- 使用 MixedCaps（导出）或 mixedCaps（未导出）。除测试文件外，不得使用下划线。
- Getter：使用 `Name()`，而不是 `GetName()`。Setter：使用 `SetName()`。
- 构造函数：`NewFoo()` 返回 `*Foo`。如果包中只有一种类型，则使用 `New()`。

### 变量
- 在较小的作用域中使用短名称：`i`、`n`、`err`、`ctx`。
- 在较大的作用域中使用描述性名称：`userCount`、`retryTimeout`。
- 未导出的包级全局变量应以 `_` 为前缀：`var _defaultTimeout = 5 * time.Second`。
- 不要遮蔽内置标识符（`error`、`len`、`cap`、`new`、`make`、`close`）。

### 接口
- 单方法接口：方法名 + `-er` 后缀（`Reader`、`Writer`、`Closer`）。
- 在接口被*使用*的位置定义接口，而不是在接口被*实现*的位置定义。

## 3. 变量声明

### 顶层
顶层声明使用 `var`。当类型与表达式一致时，不要显式指定类型：

```go
// ✅ Good
var _defaultPort = 8080
var _logger = slog.Default()

// ❌ Bad — redundant type
var _defaultPort int = 8080
```

### 局部
- 局部变量优先使用 `:=`。
- 仅当零值初始化是有意为之且具有明确意义时，才使用 `var`。

```go
// ✅ Good — zero value is meaningful
var buf bytes.Buffer

// ✅ Good — short declaration
name := getUserName()
```

## 4. 结构体初始化

始终使用字段名。绝不依赖位置初始化：

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

除非为清晰起见有必要，否则省略零值字段：

```go
// ✅ Good — zero values omitted
user := User{
    Name: "Alice",
}
```

## 5. 减少嵌套

优先处理错误和特殊情况，并尽早返回。减少缩进层级：

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

将相关声明归为一组：

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

文件中的函数顺序：
1. 常量和变量
2. `New()` / 构造函数
3. 导出方法（按重要性排序，而非按字母顺序）
4. 未导出方法
5. 辅助函数

接收者方法应紧跟在类型声明之后。

## 7. 行长度

建议将每行长度限制在 99 个字符以内。拆分过长的函数签名：

```go
func (s *Store) CreateUser(
    ctx context.Context,
    name string,
    email string,
    opts ...CreateOption,
) (*User, error) {
```

## 8. `defer` 的使用

使用 `defer` 进行清理。它能在获取资源的位置清晰地表达意图：

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

枚举从 1 开始（或使用显式哨兵值），以便让零值表示“未设置”：

```go
type Status int

const (
    StatusUnknown Status = iota
    StatusActive
    StatusInactive
)
```

## 10. 正确使用 `time` 包

- 使用 `time.Duration` 表示持续时间，而不是原始整数。
- 使用 `time.Time` 表示时刻。使用 `time.Since(start)`，而不是 `time.Now().Sub(start)`。
- 外部 API：接受 `int` 或 `float64`，并在内部进行转换。

```go
// ✅ Good
func poll(interval time.Duration) { ... }
poll(10 * time.Second)

// ❌ Bad
func poll(intervalSecs int) { ... }
poll(10)
```

## 验证清单

在认为代码已完成之前：
1. `goimports` 运行无误
2. `go vet ./...` 检查通过
3. `golangci-lint run` 检查通过（如果已配置）
4. 不存在遮蔽内置标识符的情况
5. 所有导入均已正确分组和排序
6. 结构体初始化使用字段名
7. 不存在不必要的嵌套或 `else` 代码块