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
license: MIT
metadata:
  version: "1.0.0"
---
# Go 持续集成

Go 流水线只有四道关卡：构建、vet/lint、使用竞态检测器进行测试、漏洞扫描。其他一切都只是优化。

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
- setup-go 上的 `cache: true` 会处理模块缓存和构建缓存；不要再为 Go 额外添加手动的 `actions/cache` 步骤。
- `-race -shuffle=on` — 让竞态问题和依赖执行顺序的测试在 CI 中失败，而不是在生产环境中失败。
- `permissions: contents: read` — 默认遵循最小权限原则。
- 将 lint 放在单独的作业中 — 它能快速失败，并与测试并行执行。

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

从这一小组开始，并有意识地添加 linter。启用所有 linter 会产生数百个无人分类处理的发现。`nolint` 指令必须说明原因：`//nolint:gosec // G404: jitter, not crypto`。

## 3. 构建矩阵 — 仅针对实际发布的目标

```yaml
strategy:
  matrix:
    go: ['1.23', '1.24']         # only versions you support
    os: [ubuntu-latest, macos-latest, windows-latest]
```

对于库：测试最新的两个 Go 版本（Go 团队支持两个版本）。对于部署在 Linux 上的服务：跳过操作系统矩阵——它会让你从未发布到的平台使成本翻倍。交叉编译比模拟更便宜：`GOOS=windows go build ./...` 可以发现大多数可移植性问题。

## 4. 覆盖率门禁

```yaml
- run: go test -race -coverprofile=coverage.out ./...
- name: enforce coverage floor
  run: |
    total=$(go tool cover -func=coverage.out | awk '/^total:/ {sub(/%/,"",$3); print $3}')
    echo "coverage: ${total}%"
    awk -v t="$total" 'BEGIN { exit (t < 70.0) }'
```

以一个只会逐步提高的下限作为门槛，而不是设定一个可被钻空子的目标。应通过由 `//go:generate` 生成的文件所使用的构建标签或 grep 过滤器排除生成代码，而不是降低下限。

## 5. Makefile — CI 的本地镜像

CI 必须运行开发者所运行的内容。一份定义，两处调用：

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

如果 CI 执行了任何 `make ci` 未执行的操作，开发者就只能在推送后才发现失败。应确保二者完全一致。

## 6. 速度规则

- 将 lint / test / vuln 拆分为并行作业（如第 §1 节所示）。
- `go test ./...` 已经会跨包并行执行；不要对小型仓库进行分片。
- 由构建标签控制的集成测试应在单独的作业中运行或按计划运行，而不是在每次推送时运行：`go test -tags=integration ./...`。
- 如果构建缓存持续未命中，请检查 `go.sum` 是否作为缓存键的输入（setup-go 会这样做），以及各作业是否修改了它。

## 验证检查清单

1. 流水线具备全部四道门禁：build、vet+lint、test -race、govulncheck
2. Go 版本来源于 go.mod（`go-version-file`），而非重复指定
3. 在工作流级别设置了 `permissions: contents: read`
4. 测试使用 `-race -shuffle=on` 运行
5. 已提交 `.golangci.yml`，其中包含精心筛选的 linter 集合
6. 每个 `nolint` 都注明了 linter 名称和原因
7. 矩阵仅限于实际支持的版本/平台
8. 强制执行覆盖率下限，并排除生成代码
9. `make ci` 在本地逐字节复现流水线
10. 集成测试通过标签隔离，不会拖慢每次推送