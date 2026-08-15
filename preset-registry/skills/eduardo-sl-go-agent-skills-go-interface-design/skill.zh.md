---
name: go-interface-design
description: >
  Go interface design patterns: implicit interfaces, consumer-side definition,
  interface compliance verification, composition, the accept-interfaces-return-structs
  principle, and common pitfalls.
  Use when designing interfaces, decoupling packages, defining contracts,
  reviewing interface usage, or refactoring for testability.
  Trigger examples: "design interface", "accept interfaces return structs",
  "interface compliance", "consumer-side interface", "interface composition".
  Do NOT use for HTTP handler patterns (use go-api-design) or
  general code review (use go-code-review).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 接口设计

Go 接口是隐式实现的。这是该语言最重要的设计特性，而大多数来自 Java 或 C# 的开发者一开始都会理解错。

## 1. 核心原则：在消费方定义接口

行为的消费方负责定义接口，而不是提供方：

```go
// ❌ Wrong — producer defines interface (Java thinking)
// package store
type UserStore interface {      // defined alongside implementation
    GetByID(ctx context.Context, id string) (*User, error)
    Create(ctx context.Context, user *User) error
    // ... 15 more methods
}

type PostgresStore struct { ... }
func (s *PostgresStore) GetByID(...) { ... }
func (s *PostgresStore) Create(...) { ... }

// ✅ Right — consumer defines what it needs
// package service
type UserReader interface {     // only what THIS service needs
    GetByID(ctx context.Context, id string) (*domain.User, error)
}

type UserService struct {
    store UserReader  // depends on narrow interface
}

// package store (no interface defined here)
type PostgresStore struct { db *sql.DB }
func (s *PostgresStore) GetByID(ctx context.Context, id string) (*domain.User, error) { ... }
func (s *PostgresStore) Create(ctx context.Context, user *domain.User) error { ... }

// PostgresStore satisfies service.UserReader implicitly — no declaration needed
```

这很重要，原因如下：
- 消费方只依赖其实际使用的内容（接口隔离原则）。
- 提供方可以添加方法，而不会破坏消费方。
- 测试时只需实现消费方调用的方法。
- 不会产生导入循环：消费方无需导入提供方所在的包。

## 2. 保持接口精简

接口越大，抽象能力越弱。

```go
// ✅ Good — focused, composable
type Reader interface {
    Read(p []byte) (n int, err error)
}

type Writer interface {
    Write(p []byte) (n int, err error)
}

type ReadWriter interface {
    Reader
    Writer
}

// ❌ Bad — kitchen sink interface
type FileManager interface {
    Read(path string) ([]byte, error)
    Write(path string, data []byte) error
    Delete(path string) error
    List(dir string) ([]string, error)
    Move(src, dst string) error
    Copy(src, dst string) error
    Stat(path string) (os.FileInfo, error)
    Watch(path string) (<-chan Event, error)
}
```

准则：接口最好包含 1～3 个方法。如果需要更多方法，请组合多个较小的接口。

## 3. 接受接口，返回结构体

```go
// ✅ Good — accepts interface, returns concrete type
func NewUserService(store UserReader, logger Logger) *UserService {
    return &UserService{store: store, logger: logger}
}

// ❌ Bad — returns interface (hides the concrete type for no reason)
func NewUserService(store UserReader) UserServiceInterface {
    return &UserService{store: store}
}
```

返回具体类型，以便调用方能够完整访问该类型的方法。只有当函数确实会根据输入返回不同的具体类型时（工厂模式），返回接口才有意义。

## 4. 在编译时验证接口实现情况

使用空白标识符赋值尽早发现被破坏的契约：

```go
// Verify *PostgresStore implements service.UserReader at compile time
var _ service.UserReader = (*PostgresStore)(nil)

// Verify LogHandler implements http.Handler
var _ http.Handler = (*LogHandler)(nil)

// For value receivers:
var _ fmt.Stringer = Status(0)
```

将这些赋值紧接着放在类型声明之后。它们在运行时没有任何开销，
并且可以防止契约在不知不觉中被破坏。

## 5. 不要使用指向接口的指针

```go
// ❌ Bad — pointer to interface is almost never correct
func process(r *io.Reader) { ... }

// ✅ Good — interface is already a pointer internally
func process(r io.Reader) { ... }
```

接口值在内部由两个指针组成（类型 + 数据）。
指向接口的指针就是指向指针的指针——这是不必要的间接寻址。

唯一的例外是：当你需要替换接口值本身
（在运行时切换实现）时，但这种情况极为少见。

## 6. 空接口

`interface{}`（或 Go 1.18+ 中的 `any`）意味着你已经放弃了类型安全。
应谨慎使用：

```go
// ✅ Acceptable — generic container before generics / stdlib compatibility
func Marshal(v any) ([]byte, error)

// ✅ Better (Go 1.18+) — use generics instead of any
func Map[T, U any](slice []T, fn func(T) U) []U { ... }

// ❌ Bad — lazy interface design
func Process(data any) any { ... } // what does this even do?
```

## 7. 函数式选项模式

当构造函数需要可选配置时，应使用函数式选项，
而不是使用包含接口的配置结构体：

```go
type Option func(*Server)

func WithTimeout(d time.Duration) Option {
    return func(s *Server) { s.timeout = d }
}

func WithLogger(l Logger) Option {
    return func(s *Server) { s.logger = l }
}

func NewServer(addr string, opts ...Option) *Server {
    s := &Server{
        addr:    addr,
        timeout: 30 * time.Second,  // sensible default
        logger:  slog.Default(),    // default stdlib logger
    }
    for _, opt := range opts {
        opt(s)
    }
    return s
}

// Usage
srv := NewServer(":8080",
    WithTimeout(60 * time.Second),
    WithLogger(logger),
)
```

## 8. 常见的接口反模式

### 过早定义接口：

```go
// ❌ Bad — interface defined before second implementation exists
type Processor interface {
    Process(ctx context.Context, data []byte) error
}

type processor struct { ... }  // only one implementation ever

// ✅ Good — use concrete type until you need the abstraction
type Processor struct { ... }
// Add interface when you have 2+ implementations or need testing seam
```

“不要使用接口进行设计，而要在实践中发现接口。”——Rob Pike

### 接口泛滥：

```go
// ❌ Bad — wrapping every struct in an interface "for testability"
type UserServiceInterface interface { ... }
type OrderServiceInterface interface { ... }
type PaymentServiceInterface interface { ... }
// 50 more interfaces with exactly one implementation each

// ✅ Good — define interfaces where they're consumed
// Each consumer declares only the methods IT needs
```

### 将接口误用作枚举：

```go
// ❌ Bad — interface used as enum/sum type
type Shape interface {
    isShape()
}
type Circle struct{}
func (Circle) isShape() {}

// ✅ Better — sealed interface pattern (if you need it)
// Or just use constants with a type
type ShapeKind int
const (
    ShapeCircle ShapeKind = iota
    ShapeRectangle
)
```

## 决策检查清单

1. **这里需要接口吗？** — 仅当你有 2 个以上的实现、
   需要测试接缝，或正在跨越包边界时才需要。
2. **应该在哪里定义接口？** — 在使用方，而不是提供方。
3. **应该有多少个方法？** — 越少越好。1-3 个最理想。
4. **我是否正在返回接口？** — 很可能不应该。应返回具体类型。
5. **我是否验证了接口实现关系？** — `var _ Interface = (*Type)(nil)`