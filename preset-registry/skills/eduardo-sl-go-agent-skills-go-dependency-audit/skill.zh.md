---
name: go-dependency-audit
description: >
  Audit Go module dependencies: detect outdated packages, check for known
  vulnerabilities, review go.mod hygiene, identify unused or redundant deps,
  and evaluate dependency quality. Use when auditing dependencies, checking
  for CVEs, cleaning up go.mod, upgrading modules, or evaluating third-party
  packages. Trigger examples: "check dependencies", "audit deps", "go.mod
  review", "update modules", "vulnerability scan", "govulncheck".
  Not for: code-level security (go-security-audit), architecture review
  (go-architecture-review).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Requires network access to proxy.golang.org. Read-only: this skill reports findings, it does not edit code.
allowed-tools: Read Glob Grep Bash(go:*) Bash(gofmt:*) Bash(govulncheck:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 依赖审计

你添加的每个依赖都是你无法控制、却需要为其负责的代码。
务必严格审计。

## 1. 漏洞扫描

### govulncheck（官方 Go 工具）：

```bash
# Install
go install golang.org/x/vuln/cmd/govulncheck@latest

# Scan project
govulncheck ./...

# Scan binary
govulncheck -mode=binary ./cmd/api-server
```

`govulncheck` 会根据 Go 漏洞数据库进行检查，只报告实际影响你代码路径的漏洞，而不仅仅是那些你从未调用过的传递依赖中的漏洞。

在 CI 中运行此检查。不得有任何例外。

### 其他扫描工具：

```bash
# Nancy (Sonatype OSS Index)
go list -json -deps ./... | nancy sleuth

# Trivy (container + deps)
trivy fs --scanners vuln .
```

## 2. go.mod 规范

### 检查未使用的依赖：

```bash
go mod tidy
git diff go.mod go.sum  # any changes = deps were stale
```

每次提交前都**必须**运行 `go mod tidy`。将其添加到 CI 中：

```bash
go mod tidy
git diff --exit-code go.mod go.sum
```

### 已提交的代码中不得包含 replace 指令：

```go
// ❌ Bad — committed replace directive
replace github.com/foo/bar => ../local-bar

// ✅ Acceptable — in monorepos with workspace
// go.work handles this instead
```

例外：用于修复 bug 的临时 replace，但必须附带注释和关联 issue：

```go
// TODO(#1234): remove after upstream merges fix
replace github.com/foo/bar => github.com/myorg/bar v0.0.0-fix
```

### 验证校验和：

```bash
go mod verify
```

这可以确认下载的模块与其预期校验和相匹配。
验证失败表示供应链可能遭到篡改。

## 3. 依赖评估标准

添加任何依赖之前，都要评估：

| 标准 | 检查项 |
|---|---|
| **维护情况** | 最近一次提交是否在 6 个月以内？是否积极响应 issue？ |
| **流行度** | 仅凭 stars/forks 没有意义。关键在于它是否被生产项目使用。 |
| **许可证** | 是否与你的项目兼容？优先考虑 MIT/Apache/BSD。 |
| **体积** | 是否为了一个函数引入 50 个传递依赖？ |
| **替代方案** | 是否可以用标准库在少于 50 行代码内实现？ |
| **API 稳定性** | 是否为 v1+？是否遵循 semver？是否频繁发生破坏性变更？ |
| **测试覆盖率** | 项目是否拥有有实际意义的测试？ |

### 标准库问题：

Go 的标准库非常优秀。添加依赖之前，先问问：
“我能否使用 `net/http`、`encoding/json`、`database/sql`、
`text/template`、`crypto/*`、`os/exec` 等来解决这个问题？”

如果答案是肯定的，且代码少于 100 行，那就自己实现。

## 4. 模块版本审计

### 列出所有带版本号的依赖：

```bash
go list -m all
```

### 检查可用更新：

```bash
go list -m -u all  # shows available updates
```

### 升级策略：

```bash
# Update specific module
go get github.com/foo/bar@latest

# Update all direct deps (minor/patch only)
go get -u ./...

# Update all deps including major versions (dangerous)
go get -u -t ./...
```

更新后**始终**运行完整的测试套件：

```bash
go get github.com/foo/bar@v1.5.0
go mod tidy
go test -race ./...
```

## 5. 传递依赖分析

```bash
# Why is this module in my dependency tree?
go mod why github.com/some/transitive-dep

# Full dependency graph
go mod graph

# Visual dependency graph (with modgraphviz)
go mod graph | modgraphviz | dot -Tpng -o deps.png
```

注意：
- 🔴 存在已知 CVE 的传递依赖
- 🔴 已被弃用的传递依赖（2 年以上没有提交）
- 🟡 菱形依赖冲突（同一模块存在两个版本）
- 🟡 过于庞大的传递依赖树（一个日志库引入了 gRPC）

## 6. Go 版本管理

```go
// go.mod
module github.com/myorg/myproject

go 1.22  // minimum Go version required
```

规则：
- 将 `go` 指令设置为支持所使用功能的最低版本。
- `toolchain` 指令（Go 1.21+）固定精确的工具链版本。
- 在 CI 中针对多个 Go 版本进行测试（至少包括当前版本和前一个版本）。

## 7. 推荐与避免

### 维护良好、经过生产环境验证的软件包：

| 领域 | 软件包 |
|---|---|
| 日志 | `go.uber.org/zap`、`log/slog`（标准库 1.21+） |
| HTTP 路由器 | `github.com/go-chi/chi`、`net/http`（1.22+ 路由） |
| 配置 | `github.com/caarlos0/env`、`github.com/spf13/viper` |
| 测试 | `github.com/stretchr/testify`、标准库 `testing` |
| 数据库 | `github.com/jackc/pgx`、`github.com/jmoiron/sqlx` |
| 验证 | `github.com/go-playground/validator` |
| UUID | `github.com/google/uuid` |
| 错误 | `go.uber.org/multierr`、标准库 `errors`（1.20+） |

### 应避免的模式：

- ❌ 接管 `main()` 的框架（Go 不是 Java Spring）
- ❌ 隐藏 SQL 的 ORM（优先使用 `sqlx` 或原始 `database/sql`）
- ❌ 你不了解的代码生成器
- ❌ 已经处于 `v0.x` 且持续 3 年以上的软件包

## 审计输出格式

```text
## Dependency Audit Report

**Module:** github.com/myorg/myproject
**Go version:** 1.22
**Direct deps:** N | **Indirect deps:** M

### 🔴 Vulnerabilities
- CVE-XXXX-YYYY in github.com/foo/bar@v1.2.3 — upgrade to v1.2.5

### 🟡 Outdated Dependencies
- github.com/foo/bar v1.2.3 → v1.5.0 available (minor)

### 🟢 Observations
- go.mod is clean, no replace directives
- All deps actively maintained
```