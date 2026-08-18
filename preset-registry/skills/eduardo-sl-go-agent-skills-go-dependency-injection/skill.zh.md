---
name: go-dependency-injection
description: >
  Dependency injection in Go: constructor injection, wiring in main,
  avoiding global state, and when frameworks (wire, fx, dig) earn their
  complexity. Use when: "dependency injection", "wire up dependencies",
  "inject this", "remove global state", "singleton in Go", "use
  google/wire", "uber fx", "make this testable".
  Not for: interface design (go-interface-design), directory structure
  (go-project-layout), test doubles and mocks (go-test-quality).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. wire and fx are optional.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 依赖注入

Go 中的 DI 是一种模式，而不是一个框架：将依赖传递给
构造函数，在 `main` 中显式完成所有组装。只有在手动组装确实造成明显负担时，
才考虑使用框架。

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

- 对服务会调用的依赖接受接口；构造函数返回具体类型。
- 每个依赖都应在签名中可见——如果列表显得很长，
  那么类型也承担了过多职责（应拆分它），不要为了缩短列表而隐藏依赖。
- 在构造函数中校验必需的依赖并返回错误
  （或接受一个对 nil 安全的默认值，例如 `logger = slog.Default()`）。

## 2. 组合根

所有组装逻辑都集中在一个地方——`main`（或由它调用的
`run` 函数）中。构造顺序就是依赖顺序，并由编译器进行检查：

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

- 没有任何包自行构建依赖；它接收依赖。
- 不使用 `init()` 进行组装，也不使用包级别的 `var DB *sql.DB`。
- 需要不同组装方式的两个二进制程序 = 两个 main，共用同一组组件。

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

遗留代码库的迁移路径：引入该结构体，保留一个已弃用的包级别包装函数，
将调用委托给在 `main` 中构建的一个实例；迁移调用方，然后删除该包装函数。

可接受的包级别状态：纯常量、已编译的正则表达式、
由 `sync.Once` 保护且不持有任何配置的进程级单例。

## 4. 为较小的接缝使用函数依赖

对于一个函数而言，完整接口过于繁重——直接注入函数：

```go
type Service struct {
    now     func() time.Time
    genID   func() string
    publish func(ctx context.Context, e Event) error
}

// Production: Service{now: time.Now, genID: uuid.NewString, publish: bus.Publish}
// Test:       Service{now: fixedTime, genID: constID, publish: capture}
```

## 5. 框架何时值得其复杂性

手动组装所能扩展到的程度超乎预期——100 行的 `run` 函数仍然易于阅读，并且经过编译器检查。当组装过程涉及数百个组件，或多个团队共享同一个二进制文件时，再考虑使用工具。

| 工具 | 模型 | 权衡 |
|---|---|---|
| google/wire | 编译时代码生成 | 组装过程保持为普通 Go 代码并经过编译器检查；但会增加代码生成步骤 |
| uber-go/fx | 运行时容器 + 生命周期 | 由框架管理应用生命周期（启动/停止钩子）；错误在运行时暴露，堆栈跟踪中会出现魔法行为 |
| uber-go/dig | 运行时容器（fx 的核心） | 具有相同的运行时权衡，但没有生命周期层 |

决策规则：优先采用手动组装；如果确实需要代码生成，优先选择 wire（编译时失败优于启动时失败）；只有当你还希望使用其生命周期管理，并且团队能够接受运行时容器时，才采用
fx。

永远不要混用模型：一个组合根，一种机制。

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

`wire` 会生成按顺序调用构造函数的代码；生成的文件会像手写代码一样提交并接受审查。

## 验证清单

1. 每个服务/处理器都通过构造函数参数接收依赖
2. 没有包级可变单例（`var DB`、`var logger`、`Get()` 访问器）
3. 所有组装都集中在 main/run 中——没有 `init()` 构造
4. 依赖以接口（或函数）的形式接收，返回具体类型
5. 构造函数会验证必需的依赖
6. 组件可以通过传入伪实现进行测试——测试中没有进程全局设置
7. 如果使用 DI 工具：只能使用一个，并且只能位于组合根中
8. `go build ./...` 通过——组装错误会在编译时暴露