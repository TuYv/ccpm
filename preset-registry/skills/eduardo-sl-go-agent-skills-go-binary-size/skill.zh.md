---
name: go-binary-size
description: >
  Reduce the size of compiled Go binaries and container images: linker
  flags, inlining budget, CGO and build tags, embedded assets, dependency
  weight, and measuring what actually costs bytes. Use when a binary or
  image is too large, when shrinking a CLI for distribution, or when
  auditing what a dependency adds to the build. Trigger examples: "binary is
  too big", "shrink the binary", "reduce image size", "strip symbols", "what
  is making my binary large", "ldflags -s -w".
  Not for: runtime speed and allocations (go-performance-review), CI setup
  (go-ci), dependency CVEs (go-dependency-audit).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. upx and go-size-analyzer are optional.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(strip:*) Bash(upx:*) Bash(gsa:*)
metadata:
  author: eduardo-sl
  version: "1.0.1"
---
# Go 二进制大小

一个标准的 Go 二进制文件包含运行时、垃圾回收器、完整的符号表和行号表，以及所有传递可达的包。对于一个小型 CLI，8-15 MiB 是正常的。其中大部分都可以移除，但必须通过测量来决定——猜测哪个依赖最占空间几乎总是错的。

## 操作流程

在没有前后数值对比的情况下，绝不要应用任何标志。

1. 构建基线并记录其大小。
2. 找出字节都占在哪里。
3. 一次只应用一类更改，每次更改后都进行测量。
4. 验证二进制文件仍能运行，并且测试仍然通过。
5. 报告“更改 → 节省的字节数 → 代价”表格。

## 1. 先进行测量

```bash
# Baseline, reproducible
CGO_ENABLED=1 go build -trimpath -o /tmp/base ./cmd/app
ls -l /tmp/base

# Which packages and symbols cost the most
go tool nm -size -sort size /tmp/base | head -40

# Package-level attribution (third-party, more readable)
go install github.com/Zxilly/go-size-analyzer/cmd/gsa@latest
gsa --web /tmp/base
```

`go version -m /tmp/app` 会打印嵌入二进制文件中的模块列表和构建设置——这有助于确认发布版本实际使用了哪些标志。

如果构件会随容器层或发布归档一起分发，还要测量压缩后的大小。经过 gzip 压缩后，剥离符号带来的收益会减少；移除依赖带来的收益则会更大。

```bash
gzip -c /tmp/base | wc -c
```

## 2. 剥离符号和 DWARF —— 单项收益最大

```bash
go build -ldflags="-s -w" -trimpath -o /tmp/stripped ./cmd/app
```

通常可以减少原始大小的 25-35%。

具体代价如下：

- ✅ Panic 消息和 goroutine 堆栈跟踪仍然有效。运行时使用自身的 `pclntab`，而 `-s -w` 不会将其移除。
- ❌ `dlv` 和 `gdb` 将无法再解析源代码行。不要将剥离符号的二进制文件发布到计划附加调试器的环境中。
- ⚠️ 一些依赖外部符号化的性能分析和崩溃报告工具的功能会退化。进程内的 `net/http/pprof` 不受影响。

为每个发布构建保留一份未剥离符号的副本，以便进行事后分析。

当不需要 VCS 印章时，添加 `-buildvcs=false`。它节省的空间很少，但也会从分发构件中移除提交元数据。

## 3. 禁用内联 —— 测量其中的权衡

```bash
go build -ldflags="-s -w" -gcflags=all=-l -o /tmp/noinline ./cmd/app
```

还可以减少 5-10 个百分点，但会牺牲热点路径上的运行时性能。对于启动、完成一件事后退出的 CLI，这是可以接受的。如果没有先对性能回退进行基准测试，则不适合延迟敏感型服务器。

## 4. CGO 和运行时

```bash
CGO_ENABLED=0 go build -tags netgo,osusergo -ldflags="-s -w" -o /tmp/pure ./cmd/app
```

这三项需要配合使用：禁用 cgo 而不添加 `netgo,osusergo`，会使构建依赖 C 解析器存根。

在假设它有帮助之前先检查：

- `go list -deps ./... | xargs go list -f '{{.ImportPath}} {{.CgoFiles}}'` 会显示哪些包实际使用了 cgo。
- 禁用 cgo 可能会**增加**大小，因为 C 绑定的纯 Go 替代实现可能更大。请同时测量两种情况。
- 如果发布配置已经设置了 `CGO_ENABLED=1` 或 `-linkmode=external`，那一定有其原因。在更改之前先找出原因。

当必须保留 cgo 且项目会编译 C 源文件（SQLite 绑定、图像编解码器）时，`CGO_CFLAGS="-Oz"` 会针对体积优化这些 C 代码。

## 5. 构建标签——最常被跳过的一步

重量级的可选功能通常由位于 Go 源代码之外的标签控制。

```bash
grep -rn '//go:build' --include='*.go' . | grep -v _test.go
grep -rnE '\-tags' Makefile Taskfile.y*ml .goreleaser.y*ml Dockerfile .github/workflows/ 2>/dev/null
```

常见的收益包括：移除不使用的驱动、从生产构建中排除管理 UI、构建一个运行时获取资源的 `noembed` 变体。

## 6. 依赖体积

单个导入就可能主导二进制文件的体积。`gsa` 会按模块归因字节数——应从这里开始，而不是凭直觉判断。

常见的问题来源：

- 云服务商 SDK。只导入单独的服务包，绝不要导入聚合根包。
- `github.com/prometheus/client_golang` 为少量计数器引入了很大的代码面。
- 任何大量使用反射的内容：链接器无法通过 `reflect` 消除死代码，因此基于反射的编解码器会让实际上没有调用的类型继续保留。
- 不使用的 proto 对应的生成式 protobuf 包。

用 40 行标准库代码替换一个依赖，是合理的体积优化。用自己编写的密码学代码替换维护良好的依赖，则不是。

## 7. 嵌入资源

`//go:embed` 内容以未压缩形式存储。

```go
//go:embed assets/*
var assets embed.FS
```

按优先顺序，可选方案是：只发布较少的资源；预先压缩资源，并通过 `Content-Encoding: gzip` 提供；将资源完全移出二进制文件，放入容器镜像或 CDN。

## 8. 容器镜像

二进制文件通常只是问题中较小的一半。

```dockerfile
FROM golang:1.25 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -trimpath -ldflags="-s -w" -o /out/app ./cmd/app

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /out/app /app
USER nonroot:nonroot
ENTRYPOINT ["/app"]
```

`scratch` 比 `distroless/static` 更小，但不包含 CA 证书、`/etc/passwd` 和时区数据库。除非你已经确认二进制文件不需要其中任何内容，否则应使用 `distroless/static`。

## 9. UPX——最后手段，通常是错误选择

`upx --best` 大致可以将磁盘上的体积减半，但每次启动都要付出解压缩代价，会破坏基于 `mmap` 的工具，并且很容易触发杀毒软件和 EDR 的启发式检测。不要压缩要交付给最终用户或运行在受监控生产环境中的二进制文件。只有在受体积限制的嵌入式目标中才考虑使用，并在报告中明确说明。

## 验证

每次更改后：

```bash
go build -o /tmp/candidate ./cmd/app && /tmp/candidate --version
go test ./...
ls -l /tmp/base /tmp/candidate
```

一个体积更小但无法启动，或因构建标签而丢失功能的二进制文件，并不算优化成功。

## 验证清单

1. 在更改任何标志之前记录基准体积
2. 每项声称的节省都有前后对比数据，包括原始体积和压缩后体积
3. 已应用 `-s -w`，并保留未剥离符号的构建产物以便调试
4. 在对延迟敏感的代码上对 `-gcflags=all=-l` 进行基准测试，而不是想当然地假设其效果
5. 对 `CGO_ENABLED=0` 分别测量启用和禁用两种情况，而不是盲目应用
6. 检查 Makefile、goreleaser、Dockerfile 和 CI 工作流中的构建标签
7. 使用工具完成依赖归因，而不是凭直觉判断
8. 候选二进制文件可以运行，且测试套件通过
9. 只有在有明确理由的情况下才使用 UPX