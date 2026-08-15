---
name: go-project-layout
description: >
  Scaffold new Go projects and services: directory structure, cmd/ and internal/
  conventions, when to use a flat layout, module naming, and main package wiring.
  Use when: "new Go project", "scaffold a service", "create project structure",
  "start a Go module", "how do I organize a new service", "set up folder structure".
  Do NOT use for: reviewing an existing architecture (use go-architecture-review),
  dependency injection wiring details (use go-dependency-injection), or
  CI pipeline setup (use go-ci).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 项目布局

结构应随规模而定。Go 中最大的布局错误，是为一个 500 行的工具照搬微服务骨架，或者让一个包含 50 个包的服务在扁平目录中不断增长。应让布局与项目相匹配。

## 1. 根据项目规模选择布局

| 项目 | 布局 |
|---|---|
| 小型工具、单个二进制文件、少于 5 个文件 | 扁平结构：所有内容都放在根目录的 `main` 包中 |
| 供他人导入的库 | 根包以模块命名，辅助代码放在 `internal/` 中 |
| 只有一个二进制文件的服务 | `cmd/<name>/main.go` + `internal/` 包 |
| 多个二进制文件共享代码 | `cmd/<name1>/`、`cmd/<name2>/` + `internal/` |

绝不要为了“以后再用”而先创建空的 `pkg/`、`api/`、`docs/`、`build/` 目录。应在代码确实需要时再添加结构，而不是提前添加。

## 2. 模块命名

```bash
# ✅ Good — repository path, lowercase
go mod init github.com/acme/payment-service

# ❌ Bad — not fetchable, uppercase, or vanity without DNS
go mod init PaymentService
go mod init payment_service
```

路径的最后一个元素应与用户看到的名称一致：对于库，它会成为默认的导入名称。

## 3. 服务布局（API 和工作进程的默认选择）

```text
payment-service/
├── cmd/
│   └── payment-api/
│       └── main.go         # flag/env parsing, wiring, Run() — nothing else
├── internal/
│   ├── domain/             # core types, business rules; zero external deps
│   ├── service/            # use cases orchestrating domain + stores
│   ├── store/              # data access implementations (postgres/, redis/)
│   ├── handler/            # HTTP/gRPC adapters
│   └── config/             # config loading and validation
├── migrations/             # if the service owns a database
├── go.mod
├── Makefile
└── README.md
```

规则：

- 默认使用 `internal/`——编译器会确保模块外部的任何代码都无法导入它。只有在确有需要时，才将其提升为公共包。
- 仅当存在外部使用者，并且模块同时还有私有代码时，才使用 `pkg/`。如果不确定，就不要创建它。
- 依赖关系指向内部：`handler → service → domain ← store`。`domain` 既不导入 `store`，也不导入 `handler`。

## 4. 保持 main 精简，让 Run 可执行

让 `main.go` 只负责组装并进行一次委托调用，从而使应用可测试：

```go
func main() {
    if err := run(context.Background(), os.Args[1:], os.Getenv); err != nil {
        fmt.Fprintln(os.Stderr, err)
        os.Exit(1)
    }
}

func run(ctx context.Context, args []string, getenv func(string) string) error {
    cfg, err := config.Load(getenv)
    if err != nil {
        return fmt.Errorf("load config: %w", err)
    }

    db, err := store.Open(ctx, cfg.DatabaseURL)
    if err != nil {
        return fmt.Errorf("open db: %w", err)
    }
    defer db.Close()

    svc := service.New(store.NewUserRepo(db))
    srv := handler.NewServer(cfg.Addr, svc)
    return srv.ListenAndServe(ctx)
}
```

- `os.Exit` 只出现一次，并且位于 `main` 中。
- `run` 接收其依赖项（`args`、`getenv`），以便测试可以调用它。
- 不要使用 `init()` 函数进行组装——只使用显式的构造顺序。

## 5. 库的布局

```text
retry/
├── retry.go            # package retry — the API, in the root
├── retry_test.go
├── backoff.go          # same package, split by topic
├── internal/
│   └── clock/          # implementation details users must not import
├── examples_test.go    # Example* functions shown in godoc
└── go.mod
```

- 根目录就是包目录。不要使用 `src/`，也不要使用 `lib/`。
- 每个概念对应一个包。避免使用 `util`、`common`、`helpers`——应根据包所提供的功能来命名（`retry`、`clock`、`httpsign`）。

## 6. 目录和包的命名规则

- 包名 == 目录名，名称应简短、全小写且不含下划线：
  使用 `store/postgres`，而不是 `store/postgres_impl`。
- 不要重复命名：使用 `payment.Service`，而不是 `payment.PaymentService`。
- `cmd/` 中的二进制文件名面向用户：可以使用 `cmd/payment-api`
  这样的连字符命名（该目录仅包含 `main` 包）。

## 7. 应放在根目录的文件

- `go.mod`、`go.sum`、`README.md`、`LICENSE`、`Makefile`、
  `.golangci.yml`、`Dockerfile`（单二进制项目）。
- 不要创建：`src/`（不符合惯用方式）、`vendor/`（除非团队
  明确采用依赖 vendoring），以及像 `types/` 或 `models/`
  这样只有一个文件、最终会沦为杂物堆的包。

## 脚手架搭建流程

1. 询问或确定：是工具、库还是服务？有多少个二进制文件？
2. `go mod init <repo-path>`。
3. 只创建第一个功能所需的目录。
4. 按照上面的精简 main 模式编写 `main.go`。
5. 添加 `Makefile` 目标：`build`、`test`、`lint`。
6. 验证：确保骨架项目能够通过 `go build ./...` 和 `go vet ./...`。

## 验证清单

1. 布局与项目规模相匹配——没有空的脚手架目录
2. 模块路径是可拉取的仓库路径
3. 所有非公开包都位于 `internal/` 下
4. `main.go` 保持精简：解析、组装、调用 `run`、退出
5. `os.Exit` 仅在 `main` 中使用；不在 `init()` 中进行组装
6. 依赖向内流动；`domain` 不导入任何基础设施包
7. 不存在 `util`/`common`/`helpers`/`models` 之类的大杂烩包
8. 包名与目录名一致，使用小写且不存在重复命名
9. 新建的骨架项目能够通过 `go build ./...`