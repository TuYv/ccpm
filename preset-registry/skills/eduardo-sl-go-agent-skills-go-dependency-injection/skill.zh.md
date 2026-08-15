---
name: go-dependency-injection
description: >
  Dependency injection in Go: constructor injection, wiring in main, avoiding
  global state, and when frameworks (wire, fx, dig) earn their complexity.
  Use when: "dependency injection", "wire up dependencies", "inject this",
  "remove global state", "singleton in Go", "use google/wire", "uber fx",
  "make this testable".
  Do NOT use for: interface design principles (use go-interface-design),
  project directory structure (use go-project-layout), or
  test doubles and mocks (use go-test-quality).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 依赖注入

Go 中的依赖注入是一种模式，而非框架：将依赖项传递给构造函数，并在 `main` 中显式完成所有装配。只有当手动装配造成了可衡量的负担时，才考虑使用框架。

## 1. 构造函数注入——默认方式

```go
// ✅ Good — dependencies are explicit parameters
type OrderService struct {
    repo     OrderRepository
    payments PaymentGateway
    logger   *slog.Logger
}

func NewOrderService(repo OrderRepository, payments PaymentGateway, logger *slog.Logger) *OrderService {
    return &OrderService{repo: repo, payments: payments, logger: logger}
}

// ❌ Bad — hidden dependencies reached through globals
func (s *OrderService) Place(ctx context.Context, o Order) error {
    db := database.Get()        // global singleton
    log.Printf("placing order") // global logger
    // untestable without touching process-wide state
}
```

规则：

- 对服务调用的依赖项使用接口作为入参；构造函数返回具体类型。
- 每个依赖项都应在函数签名中可见——如果参数列表显得很长，说明该类型承担了过多职责（应将其拆分），不要为了缩短列表而隐藏依赖项。
- 在构造函数中校验必需的依赖项并返回错误（或者接受一个可安全处理 nil 的默认值，例如 `logger = slog.Default()`）。

## 2. 组合根

所有装配工作都集中在一处——`main`（或由它调用的 `run` 函数）。构造顺序就是依赖顺序，并由编译器检查：

```go
func run(ctx context.Context, cfg Config) error {
    db, err := store.Open(ctx, cfg.DatabaseURL)
    if err != nil {
        return fmt.Errorf("open db: %w", err)
    }
    defer db.Close()

    orderRepo := store.NewOrderRepo(db)
    payments := stripe.NewGateway(cfg.StripeKey)
    logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

    orders := service.NewOrderService(orderRepo, payments, logger)
    server := handler.NewServer(cfg.Addr, orders)

    return server.ListenAndServe(ctx)
}
```

- 任何包都不应自行构建依赖项；依赖项应由外部传入。
- 不在 `init()` 中进行装配，也不使用包级别的 `var DB *sql.DB`。
- 两个二进制程序需要不同的装配方式 = 两个 main，共享相同的组件。

## 3. 消除全局状态

```go
// ❌ Before — package-level singleton
var defaultClient *api.Client

func Fetch(id string) (*Item, error) {
    return defaultClient.Get(id)
}

// ✅ After — the dependency moves into a struct
type Fetcher struct {
    client *api.Client
}

func NewFetcher(c *api.Client) *Fetcher { return &Fetcher{client: c} }

func (f *Fetcher) Fetch(id string) (*Item, error) {
    return f.client.Get(id)
}
```

遗留代码库的迁移路径：引入该结构体，保留一个已弃用的包级别包装函数，将调用委托给在 `main` 中构建的实例；逐步迁移调用方，然后删除该包装函数。

可接受的包级别状态：纯常量、已编译的正则表达式，以及由 `sync.Once` 保护且不保存任何配置的进程级单例。

## 4. 使用函数依赖处理小型接缝

仅为一个函数定义完整接口有些过度——可以直接注入该函数：

```go
type Service struct {
    now     func() time.Time
    genID   func() string
    publish func(ctx context.Context, e Event) error
}

// Production: Service{now: time.Now, genID: uuid.NewString, publish: bus.Publish}
// Test:       Service{now: fixedTime, genID: constID, publish: capture}
```

## 5. 框架何时值得引入其复杂性

手动装配的扩展能力比预期更强——即使是 100 行的 `run` 函数，仍然易于阅读，并且可由编译器检查。当装配涉及数百个组件，或者多个团队共享同一个二进制文件时，可以考虑使用工具。

| 工具 | 模型 | 权衡 |
|---|---|---|
| google/wire | 编译时代码生成 | 装配代码保持为普通 Go 代码，并由编译器检查；但会增加一个代码生成步骤 |
| uber-go/fx | 运行时容器 + 生命周期 | 负责管理应用生命周期（启动/停止钩子）；错误在运行时暴露，堆栈跟踪中存在隐式行为 |
| uber-go/dig | 运行时容器（fx 的核心） | 具有相同的运行时权衡，但没有生命周期层 |

决策原则：优先选择手动装配；如果必须使用代码生成，则优先选择 wire（编译时失败优于启动时失败）；只有当你还需要其生命周期管理，并且团队能够接受运行时容器时，才采用 fx。

绝不要混用模型：一个组合根，一种机制。

## 6. Wire 示例（选择使用时）

```go
//go:build wireinject

func InitializeServer(cfg Config) (*handler.Server, error) {
    wire.Build(
        store.Open,
        store.NewOrderRepo,
        stripe.NewGateway,
        service.NewOrderService,
        handler.NewServer,
    )
    return nil, nil // replaced by generated code
}
```

`wire` 会生成按顺序调用构造函数的代码；生成的文件应像手写代码一样提交并接受审查。

## 验证清单

1. 每个服务/处理器都通过构造函数参数接收依赖
2. 不存在包级可变单例（`var DB`、`var logger`、`Get()` 访问器）
3. 所有装配都集中在 main/run 中——不在 `init()` 中构造
4. 依赖以接口（或函数）的形式接收，返回具体类型
5. 构造函数会验证必需的依赖
6. 组件可通过传入伪实现进行测试——测试中不需要进程级全局设置
7. 如果使用 DI 工具：只能使用一种，并且仅在组合根处使用
8. `go build ./...` 能够通过——装配错误在编译时暴露