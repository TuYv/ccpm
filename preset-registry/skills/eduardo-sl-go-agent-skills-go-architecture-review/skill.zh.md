---
name: go-architecture-review
description: >
  Review Go project architecture: package structure, dependency direction,
  layering, separation of concerns, domain modeling, and module boundaries.
  Use when reviewing architecture, designing package layout, evaluating
  dependency graphs, or refactoring monoliths into modules.
  Trigger examples: "review architecture", "package structure", "project layout",
  "dependency direction", "clean architecture Go", "module boundaries".
  Do NOT use for code-level style (use go-coding-standards) or
  API endpoint design (use go-api-design).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Read-only: this skill reports findings, it does not edit code.
allowed-tools: Read Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.2.0"
---
# Go 架构审查

好的架构能让下一次变更变得容易。糟糕的架构则会让每一次变更都令人担忧。

## 工作模式

开始之前，请选择与请求相匹配的模式：

- **布局审查**（默认）——依据下文各节评估现有代码库，并报告违规问题及其严重程度。
- **重构计划**——执行相同的评估，但交付物是按顺序排列的迁移计划（最小且安全的步骤优先），而不仅仅是问题清单。
- **新服务咨询**——当被问及“我应该如何组织 X”时：
  将第 1～3 节作为规范性指导，而不是审查检查项。

## 审计大型代码库

对于包含许多包的仓库，请先梳理依赖关系，再作判断：

1. 绘制模块结构：使用 `go list ./...` 获取包列表，然后通过 import 语句追踪依赖方向。
2. 分别执行独立检查：(a) 根据第 1 节检查布局，(b) 根据第 2 节检查依赖方向，(c) 根据第 3 节和第 5 节检查装配与配置，(d) 根据第 4 节检查包设计。
3. 如果你的环境支持将工作委派给并行的子代理或任务，请为每项检查分别分配一个；最后再综合结果——依赖关系问题往往能够解释布局问题。
4. 每项发现都要引用包路径和 `file.go:line`。

## 1. 标准项目布局

```text
myproject/
├── cmd/                    # Main applications (one dir per binary)
│   ├── api-server/
│   │   └── main.go
│   └── worker/
│       └── main.go
├── internal/               # Private packages — cannot be imported externally
│   ├── domain/             # Core business types (entities, value objects)
│   │   ├── user.go
│   │   └── order.go
│   ├── service/            # Business logic (use cases)
│   │   ├── user.go
│   │   └── order.go
│   ├── store/              # Data access (repositories)
│   │   ├── postgres/
│   │   │   └── user.go
│   │   └── redis/
│   │       └── cache.go
│   ├── handler/            # HTTP/gRPC handlers (adapters)
│   │   └── user.go
│   └── config/             # Configuration loading
│       └── config.go
├── pkg/                    # Public packages (use sparingly)
│   └── httputil/
│       └── response.go
├── migrations/             # Database migrations
├── api/                    # API definitions (OpenAPI, proto files)
├── go.mod
├── go.sum
└── Makefile
```

### 关键规则：
- `internal/` 在编译器层面强制实施封装。应积极使用它。
- `pkg/` 用于真正可复用的包。如果无法确定，请使用 `internal/`。
- `cmd/` 中的 main 包应保持精简——装配依赖并调用 `Run()`。
- 每个二进制程序使用一个 `main.go`，其中只包含最少量的逻辑。

## 2. 依赖方向

依赖关系必须向内流动。领域核心不应有任何外部依赖：

```text
handlers → services → domain ← stores
    ↓          ↓                  ↓
  (net/http)  (pure Go)     (database/sql)
```

规则：
- `domain/` 不得导入项目中的任何内容。不得导入 `store`、`handler` 或 `config`。
- `service/` 依赖 `domain/` 中的类型和接口，而不是具体的 store 实现。
- `handler/` 依赖 `service/` 中的接口。
- `store/` 实现在 `service/` 或 `domain/` 中定义的接口。
- 循环依赖属于 🔴 阻断性问题。编译器会检测到它们，但在设计层面就应避免它们。

```go
// ✅ Good — service defines the interface it needs
// internal/service/user.go
type UserStore interface {
    GetByID(ctx context.Context, id string) (*domain.User, error)
    Create(ctx context.Context, user *domain.User) error
}

type UserService struct {
    store UserStore // depends on interface, not postgres.Store
}

// internal/store/postgres/user.go
type Store struct { db *sql.DB }

// Implements service.UserStore without importing the service package
func (s *Store) GetByID(ctx context.Context, id string) (*domain.User, error) { ... }
```

## 3. 主包装配

`main.go` 是组合根。在这里装配所有内容：

```go
func main() {
    cfg := config.Load()
    logger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

    db, err := sql.Open("postgres", cfg.DatabaseURL)
    if err != nil {
        logger.Error("connect db", slog.Any("error", err))
        os.Exit(1)
    }
    defer db.Close()

    // Wire dependencies
    userStore := postgres.NewUserStore(db)
    userService := service.NewUserService(userStore)
    userHandler := handler.NewUserHandler(userService, logger)

    // Setup router
    r := chi.NewRouter()
    r.Mount("/api/v1/users", userHandler.Routes())

    // Run server
    srv := &http.Server{Addr: cfg.Addr, Handler: r}
    // ... graceful shutdown
}
```

避免使用依赖注入框架。Go 的显式装配是一项优势。
如果装配变得复杂，可以使用 Google 的 `wire` 在编译时生成依赖注入代码。

## 4. 包设计原则

### 一个包 = 一个用途

```go
// ✅ Good — clear purpose
package orderservice  // business rules for orders
package postgres      // PostgreSQL data access
package httphandler   // HTTP transport layer

// ❌ Bad — grab-bag packages
package utils    // what ISN'T a util?
package common   // everything and nothing
package models   // types without behavior
```

### 避免包名重复

```go
// ❌ Bad — package name repeated in type
package user
type UserService struct{} // user.UserService

// ✅ Good
package user
type Service struct{} // user.Service
```

### 包的内聚性优先于大小

一个包含 20 个相关文件的包，优于 20 个各自只有 1 个文件的包。
应当在职责明确不同时拆分包，而不是在包变大时拆分。

## 5. 配置

```go
type Config struct {
    Addr        string        `env:"ADDR" envDefault:":8080"`
    DatabaseURL string        `env:"DATABASE_URL,required"`
    LogLevel    string        `env:"LOG_LEVEL" envDefault:"info"`
    Timeout     time.Duration `env:"TIMEOUT" envDefault:"30s"`
}
```

规则：
- 所有配置均来自环境变量（十二要素）。
- 在启动时验证，遇到错误立即失败并给出清晰的信息。
- 不要将配置分散在各个包中——统一放在 `internal/config` 中。
- 绝不要硬编码值。即使“只是暂时的”也不行。

## 6. Init 函数

避免使用 `init()`。它会隐式运行，使测试更加困难，并产生隐藏依赖。

```go
// ❌ Bad — hidden side effects
func init() {
    db, _ = sql.Open("postgres", os.Getenv("DB_URL"))
}

// ✅ Good — explicit initialization
func NewStore(dsn string) (*Store, error) {
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, fmt.Errorf("open db: %w", err)
    }
    return &Store{db: db}, nil
}
```

例外：允许在 `init()` 中注册驱动程序或编解码器：
```go
func init() {
    sql.Register("custom", &CustomDriver{})
}
```

## 架构审查清单

- 🔴 包之间不存在循环依赖
- 🔴 领域类型对基础设施零依赖
- 🔴 `cmd/` 的 main 包中不包含业务逻辑
- 🔴 不存在带有副作用（数据库连接、HTTP 调用）的 `init()`
- 🟡 使用 `internal/` 存放项目私有包
- 🟡 接口在使用方而非提供方定义
- 🟡 配置集中管理，并在启动时进行验证
- 🟡 依赖方向向内流动（处理器 → 服务 → 领域）
- 🟢 包名简短、使用单数形式且含义明确
- 🟢 不使用 `utils/`、`common/`、`helpers/` 包
- 🟢 main 包是一个轻量的组合根