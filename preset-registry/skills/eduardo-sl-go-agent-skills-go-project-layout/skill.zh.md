---
name: go-project-layout
description: >
  Scaffold new Go projects and services: directory structure, cmd/ and
  internal/ conventions, when to use a flat layout, module naming, and main
  package wiring. Use when: "new Go project", "scaffold a service", "create
  project structure", "start a Go module", "how do I organize a new
  service", "set up folder structure".
  Not for: reviewing an existing architecture (go-architecture-review), DI
  wiring (go-dependency-injection), CI setup (go-ci).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Requires git for repository initialisation.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(git:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 项目布局

结构应与规模相匹配。Go 中最大的布局错误，是为一个 500 行的工具复制微服务骨架——或者在一个扁平目录中构建一个包含 50 个包的服务。让布局与项目相匹配。

## 1. 根据项目规模选择布局

| 项目 | 布局 |
|---|---|
| 小型工具、单个二进制文件、少于 5 个文件 | 扁平布局：根目录下所有内容都放在 `main` 包中 |
| 供他人导入的库 | 以模块命名的根包，辅助代码放在 `internal/` 中 |
| 只有一个二进制文件的服务 | `cmd/<name>/main.go` + `internal/` 包 |
| 共享代码的多个二进制文件 | `cmd/<name1>/`、`cmd/<name2>/` + `internal/` |

不要一开始就创建空的 `pkg/`、`api/`、`docs/`、`build/` 目录，声称是“留待以后使用”。在代码确实需要时再增加结构，而不是提前创建。

## 2. 模块命名

```bash
# ✅ Good — repository path, lowercase
go mod init github.com/acme/payment-service

# ❌ Bad — not fetchable, uppercase, or vanity without DNS
go mod init PaymentService
go mod init payment_service
```

最后一个路径元素应与用户将看到的名称相匹配：对于库而言，它会成为默认导入名称。

## 3. 服务布局（API 和 worker 的默认布局）

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

- 默认使用 `internal/` —— 编译器会强制禁止模块外部的任何代码导入它。只有在确有需求时，才将其提升为公共包。
- 仅当存在外部使用者，且模块同时包含私有代码时，才使用 `pkg/`。不确定时，不要创建它。
- 依赖应指向内部：`handler → service → domain ← store`。`domain` 既不导入 `store`，也不导入 `handler`。

## 4. 精简的 main，可运行的 Run

让 `main.go` 只负责组装和委托调用，从而使应用可测试：

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

- `os.Exit` 只出现一次，位于 `main` 中。
- `run` 接收其依赖项（`args`、`getenv`），以便测试可以调用它。
- 不要使用 `init()` 函数进行组装——只能显式控制构造顺序。

## 5. 库布局

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

- 根目录就是包所在目录。不要使用 `src/`，也不要使用 `lib/`。
- 一个概念对应一个包。避免使用 `util`、`common`、`helpers`——根据包提供的内容命名（`retry`、`clock`、`httpsign`）。

## 6. 目录和包的命名规则

- 包名 == 目录名，简短、全小写、不得包含下划线：
  `store/postgres`，而不是 `store/postgres_impl`。
- 不要重复表达：使用 `payment.Service`，而不是 `payment.PaymentService`。
- `cmd/` 中的二进制名称面向用户：`cmd/payment-api`，
  使用连字符没问题（目录中只存放 `main` 包）。

## 7. 应放在根目录的文件

- `go.mod`、`go.sum`、`README.md`、`LICENSE`、`Makefile`、
  `.golangci.yml`、`Dockerfile`（单二进制项目）。
- 不要创建：`src/`（不符合惯用写法）、`vendor/`（除非团队明确要求使用 vendor）、
  以及类似 `types/` 或 `models/` 的单文件包，它们最终会沦为杂物堆。

## 脚手架搭建流程

1. 询问/决定：工具、库，还是服务？需要多少个二进制文件？
2. `go mod init <repo-path>`。
3. 只创建第一个功能所需的目录。
4. 按照上面的 thin-main 模式编写 `main.go`。
5. 添加 `Makefile` 目标：`build`、`test`、`lint`。
6. 验证：在脚手架上通过 `go build ./...` 和 `go vet ./...`。

## 验证清单

1. 布局与项目规模相匹配——不要创建空的脚手架目录
2. 模块路径是可获取的仓库路径
3. 所有非公开包都位于 `internal/` 下
4. `main.go` 保持精简：解析、组装、调用 `run`、退出
5. `os.Exit` 只能出现在 `main` 中；不要在 `init()` 中进行组装
6. 依赖向内流动；`domain` 不导入任何基础设施包
7. 不要创建 `util`/`common`/`helpers`/`models` 杂物堆包
8. 包名与目录名匹配，全小写，不重复表达
9. 在全新脚手架上通过 `go build ./...`