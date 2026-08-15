---
name: go-design-patterns
description: >
  Idiomatic Go design patterns: functional options, builder, factory, strategy,
  middleware chain, pub/sub, and other patterns adapted for Go's type system.
  Use when: "design pattern", "functional options", "builder pattern",
  "factory pattern", "strategy pattern", "middleware chain", "option pattern",
  "how to structure this".
  Do NOT use for: interface design principles (use go-interface-design),
  package layout (use go-architecture-review), or
  concurrency patterns (use go-concurrency-review).
license: MIT
metadata:
  version: "1.1.0"
---
# Go 设计模式

Go 推崇组合而非继承，推崇简单而非抽象。
这些模式是符合 Go 惯用法的模式，而不是移植到 Go 的 Java 模式。

详细参考资料可按需加载：

- `references/creation-patterns.md` — 函数式选项（完整示例）、
  选项与配置结构体的对比、构造函数、工厂。
- `references/behavioral-patterns.md` — 策略、中间件/装饰器、
  结果类型、延迟清理、哨兵值与零值的对比。

仅当以下摘要不足以满足需要时，才读取参考文件。

## 模式选择

| 需求 | 模式 | 参考资料 |
|---|---|---|
| 构造函数包含许多可选设置 | 函数式选项 | creation-patterns.md |
| 从文件/环境变量加载配置，且大多数字段为必填项 | 配置结构体 | creation-patterns.md |
| 创建时强制保证不变量 | 返回错误的构造函数 | creation-patterns.md |
| 根据运行时配置选择实现 | 返回接口的工厂 | creation-patterns.md |
| 在运行时替换简单行为 | 通过函数类型实现策略模式 | behavioral-patterns.md |
| 在运行时替换复杂行为 | 通过接口实现策略模式 | behavioral-patterns.md |
| 包装横切关注点（日志、缓存、指标） | 中间件/装饰器 | behavioral-patterns.md |
| 并发流水线中的值或错误 | `Result[T]` 结构体 | behavioral-patterns.md |

## 1. 函数式选项（要点）

```go
type Option func(*Server)

func WithAddr(addr string) Option {
    return func(s *Server) { s.addr = addr }
}

func NewServer(opts ...Option) *Server {
    s := &Server{
        addr:        ":8080", // sensible defaults first
        readTimeout: 5 * time.Second,
        logger:      slog.Default(),
    }
    for _, opt := range opts {
        opt(s)
    }
    return s
}

srv := NewServer(WithAddr(":9090"))
```

适用场景：存在许多具有合理默认值的可选参数，API 会随着
时间推移而演进（新增选项不会破坏调用方），选项需要验证。
如果大多数字段为必填项，或者配置是从文件/环境变量反序列化而来的，
则应改用普通的配置结构体。

## 2. 构造函数规则

- 每个具有不变量的导出类型都需要构造函数。
- 验证必需的依赖项；返回错误，不要触发 panic：

```go
// ✅ Good — constructor enforces invariants
func NewUserService(repo UserRepository, logger *slog.Logger) (*UserService, error) {
    if repo == nil {
        return nil, errors.New("user service: nil repository")
    }
    return &UserService{repo: repo, logger: logger}, nil
}

// ❌ Bad — struct literal with no validation
svc := &UserService{} // nil dependencies → panic at runtime
```

## 3. 工厂

返回接口，而不是具体类型。工厂是唯一
了解具体实现的地方：

```go
func NewStore(cfg Config) (Store, error) {
    switch cfg.StoreType {
    case "redis":
        return newRedisStore(cfg.RedisAddr)
    case "memory":
        return newMemoryStore(), nil
    default:
        return nil, fmt.Errorf("unknown store type: %s", cfg.StoreType)
    }
}
```

## 4. 中间件链

标准的 HTTP 组合模式：

```go
type Middleware func(http.Handler) http.Handler

func Chain(handler http.Handler, middlewares ...Middleware) http.Handler {
    for i := len(middlewares) - 1; i >= 0; i-- {
        handler = middlewares[i](handler)
    }
    return handler
}

handler := Chain(appHandler, Recoverer, RequestID, Logger, Auth)
```

同样的结构适用于任何接口：按如下方式堆叠装饰器：
`cache → logging → metrics → actual repo`
（参见 `references/behavioral-patterns.md`）。

## 5. 零值优先

优先选择零值可直接使用的类型（`sync.Mutex`、`bytes.Buffer`、
nil 切片）。仅当零值作为输入存在歧义时，才使用哨兵包装器或指针
（`nil *float64` = “未配置”）。

## 应避免的反模式

```go
// ❌ God interface — too many methods
type Service interface {
    GetUser(ctx context.Context, id string) (*User, error)
    CreateUser(ctx context.Context, u *User) error
    DeleteUser(ctx context.Context, id string) error
    ListOrders(ctx context.Context, userID string) ([]Order, error)
    // 20 more methods...
}
// → Split into focused interfaces: UserReader, UserWriter, OrderLister

// ❌ Premature abstraction — interface for one implementation
type UserCache interface {
    Get(key string) (*User, bool)
    Set(key string, user *User)
}
// If there's only ever one implementation, use the concrete type.
// Extract an interface when a second consumer or implementation appears.

// ❌ Java-style inheritance simulation
type BaseService struct{ /* ... */ }
type UserService struct{ BaseService } // embedding is NOT inheritance
// → Use composition: UserService has a dependency, not a parent.
```

## 验证清单

1. 对具有可选配置的类型使用函数式选项
2. 构造函数验证必需的依赖项并返回错误
3. 工厂函数返回接口，而不是具体类型
4. 不存在上帝接口——每个接口包含 1-3 个方法
5. 中间件遵循 `func(http.Handler) http.Handler` 签名
6. 装饰器包装接口，而不是具体类型
7. 所有资源清理（文件、连接、锁）均使用 `defer`
8. 零值具有明确意义——不进行不必要的初始化
9. 不进行过早抽象——仅在需要时提取接口
10. 使用组合而不是嵌入来复用代码