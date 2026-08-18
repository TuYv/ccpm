---
name: go-ci
description: >
  Continuous integration for Go projects: GitHub Actions pipelines, caching,
  golangci-lint setup, test/coverage gates, vulnerability scanning, build
  matrices, and Makefile targets.
  Use when: "set up CI", "GitHub Actions for Go", "add lint to the pipeline",
  "CI is slow", "coverage gate", "build matrix", "write a Makefile",
  "run govulncheck in CI".
  Do NOT use for: commit message conventions (use git-commit), choosing or
  auditing dependencies (use go-dependency-audit), or writing the tests
  themselves (use go-test-quality).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Targets GitHub Actions.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(golangci-lint:*) Bash(git:*)
metadata:
  author: eduardo-sl
  version: "1.1.0"
---
# Go CI

Go 流水线恰好包含四道关卡：构建、vet/lint、使用竞态检测器进行测试、漏洞扫描。其他一切都只是优化。

## 1. 基础 GitHub Actions 工作流

```yaml
name: ci
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version-file: go.mod   # single source of truth
          cache: true               # caches module + build cache
      - run: go build ./...
      - run: go vet ./...
      - run: go test -race -shuffle=on -coverprofile=coverage.out ./...

  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version-file: go.mod
      - uses: golangci/golangci-lint-action@v6
        with:
          version: latest

  vuln:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version-file: go.mod
      - run: go run golang.org/x/vuln/cmd/govulncheck@latest ./...
```

其中内置的关键决策：

- `go-version-file: go.mod` — 切勿在两个地方硬编码 Go 版本。
- setup-go 上的 `cache: true` 会处理模块缓存和构建缓存；不要在其基础上再为 Go 添加手动 `actions/cache` 步骤。
- `-race -shuffle=on` — 让竞态问题和依赖执行顺序的测试在 CI 中失败，而不是在生产环境中失败。
- `permissions: contents: read` — 默认采用最小权限原则。
- 将 lint 放在单独的作业中 — 它可以快速失败，并与测试并行执行。

## 2. golangci-lint 配置

提交一个 `.golangci.yml`；未经配置的 linter 只会产生噪声：

```yaml
linters:
  enable:
    - errcheck      # unchecked errors
    - govet
    - staticcheck
    - errorlint     # %w misuse, == on errors
    - gosec         # security patterns
    - revive        # style, replaces golint
    - misspell
issues:
  exclude-rules:
    - path: _test\.go
      linters: [gosec]  # test code may use weak randomness etc.
```

从这个精简集合开始，有意识地添加 linter。启用所有 linter 会产生数百条无人处理的发现。`nolint` 指令必须给出理由：`//nolint:gosec // G404: jitter, not crypto`。

## 3. 构建矩阵 — 仅针对实际交付的平台

```yaml
strategy:
  matrix:
    go: ['1.23', '1.24']         # only versions you support
    os: [ubuntu-latest, macos-latest, windows-latest]
```

库：测试最新的两个 Go 版本（Go 团队支持两个版本）。部署在 Linux 上的服务：跳过操作系统矩阵——为永远不会交付的平台进行测试会使成本翻倍。交叉编译比模拟更便宜：`GOOS=windows go build ./...` 可以发现大多数可移植性问题。

## 4. 覆盖率门槛

```yaml
- run: go test -race -coverprofile=coverage.out ./...
- name: enforce coverage floor
  run: |
    total=$(go tool cover -func=coverage.out | awk '/^total:/ {sub(/%/,"",$3); print $3}')
    echo "coverage: ${total}%"
    awk -v t="$total" 'BEGIN { exit (t < 70.0) }'
```

应卡在不断提高的门槛上，而不是卡在一个会被钻空子的目标上。通过 `//go:generate`d 文件的构建标签或 grep 过滤器排除生成的代码，而不是降低门槛。

## 5. Makefile — CI 的本地镜像

CI 必须运行开发者运行的内容。一份定义，两个调用方：

```makefile
.PHONY: build lint test vuln ci

build:
	go build ./...

lint:
	golangci-lint run

test:
	go test -race -shuffle=on -coverprofile=coverage.out ./...

vuln:
	go run golang.org/x/vuln/cmd/govulncheck@latest ./...

ci: build lint test vuln
```

如果 CI 执行了 `make ci` 未执行的任何操作，开发者只有在推送之后才会发现失败。务必让二者保持一致。

## 6. 速度规则

- 将 lint / test / vuln 拆分为并行作业（如 §1 所示）。
- `go test ./...` 已经会跨软件包并行执行；不要为小型仓库分片。
- 使用构建标签控制的集成测试应在单独的作业中运行，或按计划运行，而不是每次推送都运行：`go test -tags=integration ./...`。
- 如果构建缓存持续未命中，请检查 `go.sum` 是否是缓存键的输入（setup-go 会执行此操作），并确认作业不会修改它。

## 验证清单

1. 流水线包含全部四个门禁：构建、vet+lint、`-race` 测试、govulncheck
2. Go 版本从 go.mod 获取（`go-version-file`），而不是重复定义
3. 在工作流级别设置 `permissions: contents: read`
4. 测试使用 `-race -shuffle=on` 运行
5. 已提交包含精选 linter 集合的 `.golangci.yml`
6. 每个 `nolint` 都带有 linter 名称和原因
7. 矩阵仅限于实际支持的版本和平台
8. 强制执行覆盖率门槛，并排除生成的代码
9. `make ci` 在本地逐字节复现流水线
10. 集成测试通过标签隔离，不拖慢每次推送