---
name: go-ci
description: >
  Continuous integration for Go projects: GitHub Actions pipelines, caching,
  golangci-lint setup, test/coverage gates, vulnerability scanning, build
  matrices, and Makefile targets. Use when: "set up CI", "GitHub Actions for
  Go", "add lint to the pipeline", "CI is slow", "coverage gate", "build
  matrix", "write a Makefile", "run govulncheck in CI".
  Not for: commit conventions (git-commit), choosing or auditing
  dependencies (go-dependency-audit), writing the tests themselves
  (go-test-quality).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Targets GitHub Actions.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(golangci-lint:*) Bash(git:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go CI

Go 流水线恰好有四个门禁：构建、vet/lint、使用竞态检测器进行测试、漏洞扫描。其他一切都只是优化。

## 1. 基准 GitHub Actions 工作流

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

其中固化了以下关键决策：

- `go-version-file: go.mod` — 永远不要在两个地方硬编码 Go 版本。
- setup-go 中的 `cache: true` 会处理模块缓存和构建缓存；不要在此基础上额外添加手动的 `actions/cache` 步骤来缓存 Go。
- `-race -shuffle=on` — 让竞态和依赖顺序的测试在 CI 中失败，而不是在生产环境中失败。
- `permissions: contents: read` — 默认遵循最小权限原则。
- 将 Lint 放在独立的 job 中 — 它可以快速失败，并与测试并行执行。

## 2. golangci-lint 配置

提交一个 `.golangci.yml`；未配置的 linter 只会制造噪声：

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

从这组精简的 linter 开始，并有意识地添加其他 linter。启用全部 linter 会产生数百条发现结果，没有人会对其进行分类处理。`nolint` 指令必须说明原因：`//nolint:gosec // G404: jitter, not crypto`。

## 3. 构建矩阵 — 仅在你确实发布这些版本时使用

```yaml
strategy:
  matrix:
    go: ['1.23', '1.24']         # only versions you support
    os: [ubuntu-latest, macos-latest, windows-latest]
```

库：测试最新的两个 Go 版本（Go 团队支持两个版本）。部署在 Linux 上的服务：跳过 OS 矩阵 — 为你从未发布的平台构建会使成本翻倍。交叉编译比模拟更便宜：`GOOS=windows go build ./...` 可以捕获大多数可移植性问题。

## 4. 覆盖率门禁

```yaml
- run: go test -race -coverprofile=coverage.out ./...
- name: enforce coverage floor
  run: |
    total=$(go tool cover -func=coverage.out | awk '/^total:/ {sub(/%/,"",$3); print $3}')
    echo "coverage: ${total}%"
    awk -v t="$total" 'BEGIN { exit (t < 70.0) }'
```

以不断提高的门槛作为门禁，而不是以一个会被钻空子的目标作为门禁。通过 `//go:generate` 生成文件的构建标签或 grep 过滤器排除生成的代码，
而不是降低门槛。

## 5. Makefile — CI 的本地镜像

CI 必须运行开发者运行的内容。一个定义，两个调用方：

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

如果 CI 执行了任何 `make ci` 未执行的操作，开发者只有在推送之后才会发现失败。保持两者完全一致。

## 6. 速度规则

- 将 lint / test / vuln 拆分为并行作业（如 §1 所示）。
- `go test ./...` 已经会跨包并行化；不要为小型仓库拆分作业。
- 使用构建标签运行的集成测试应放在单独的作业中，或按计划运行，而不是每次推送都运行：`go test -tags=integration ./...`。
- 如果构建缓存总是未命中，请检查 `go.sum` 是否作为缓存键输入（setup-go 会这样做），并确认作业不会修改它。

## 验证清单

1. 流水线包含全部四道门禁：build、vet+lint、test -race、govulncheck
2. Go 版本来源于 go.mod（`go-version-file`），而不是重复定义
3. 在工作流级别设置 `permissions: contents: read`
4. 测试使用 `-race -shuffle=on` 运行
5. 已提交包含精选 linter 集合的 `.golangci.yml`
6. 每个 `nolint` 都带有 linter 名称和原因
7. 矩阵仅限于实际支持的版本/平台
8. 强制执行覆盖率门槛，并排除生成的代码
9. `make ci` 在本地逐字节复现流水线
10. 集成测试通过标签隔离，不拖慢每次推送