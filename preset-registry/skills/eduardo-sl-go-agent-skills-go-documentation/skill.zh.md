---
name: go-documentation
description: >
  Go documentation conventions: godoc comments, package docs, testable
  Example functions, deprecation notices, and doc links. Use when: "add
  godoc", "document this package", "write doc comments", "add examples to
  docs", "deprecate a function", "package documentation", "improve the
  docs".
  Not for: commit messages (git-commit), README-level guides (plain writing
  task), code style (go-coding-standards).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 文档

Godoc 不是自由格式的散文——它是一种由工具链呈现的约定。
遵循该约定的注释会成为 pkg.go.dev 上可浏览的文档；不遵循的注释则会变成噪音。

## 1. 文档注释形式

每个导出的标识符都要有文档注释。注释以标识符的名称开头，并且是一个完整的句子：

```go
// ✅ Good
// ParseDuration parses a duration string such as "300ms" or "2h45m".
// It returns an error if the string is not a valid duration.
func ParseDuration(s string) (Duration, error) { ... }

// ❌ Bad — doesn't start with the name, fragment, restates signature
// this function parses durations
func ParseDuration(s string) (Duration, error) { ... }
```

- 相关常量/变量组可以在整个代码块上共用一条注释：在 `const (...)` 组上方写 `// Common HTTP methods.`。
- 未导出的标识符：当其用途无法从名称中明显看出时添加注释——使用相同的形式，但不作强制要求。
- 说明调用者需要了解的内容：行为、错误条件、nil/零值处理、并发安全性。不要说明实现方式。

## 2. 包文档

每个包在 `package` 子句处写一条包注释。超过几句话时，将其放在专用的 `doc.go` 中：

```go
// Package retry implements backoff strategies for retrying failed
// operations.
//
// The zero value of Policy retries three times with exponential
// backoff. Use functional options to customize:
//
//	p := retry.NewPolicy(retry.WithMaxAttempts(5))
//	err := p.Do(ctx, fetchUser)
package retry
```

- 以 "Package <name> ..." 开头。
- 缩进的行（一个制表符）会呈现为代码块。
- `main` 包：注释描述命令及其标志——它会成为命令的文档。

## 3. 文档链接与格式（Go 1.19+）

```go
// Fetch retrieves the resource. It honors the deadline of ctx and
// returns [ErrNotFound] if the resource does not exist.
//
// For batch retrieval use [Client.FetchAll]. See the [net/http]
// package for transport configuration.
func (c *Client) Fetch(ctx context.Context, id string) (*Resource, error)
```

- `[Name]`、`[Type.Method]`、`[pkg/path]` 会在 pkg.go.dev 上变成超链接。
- 以 `# ` 开头的行是标题（少见；仅用于较长的包文档）。
- 列表：以空格和项目符号开头的行。保持浅层级。

## 4. 可测试示例

示例函数是由编译器检查的文档。将它们放在 `<pkg>_test` 包的 `example_test.go` 中：

```go
func ExampleParseDuration() {
    d, _ := ParseDuration("1h30m")
    fmt.Println(d.Minutes())
    // Output: 90
}

// Method example: ExampleType_Method
func ExamplePolicy_Do() { ... }

// Second example for the same symbol: suffix
func ExampleParseDuration_negative() { ... }
```

- `// Output:` 注释会使其成为测试——如果打印的输出不同，`go test` 将失败。不带该注释的示例可以编译，但不会运行。
- 为每个非平凡的导出 API 编写一个示例。它会直接呈现在 pkg.go.dev 上对应符号的下方。

## 5. 弃用

```go
// Fetch retrieves the resource.
//
// Deprecated: Use [Client.FetchContext] instead, which honors
// context cancellation.
func (c *Client) Fetch(id string) (*Resource, error)
```

- 段落必须严格以 `Deprecated: ` 开头。
- 始终注明替代项。
- Tools（gopls、staticcheck、pkg.go.dev）会自动显示这些信息。

## 6. 不要写什么

```go
// ❌ Noise — restates the code
// GetName returns the name.
func (u *User) GetName() string { return u.name }

// ❌ Maintenance history — belongs in git
// Changed 2024-03-01 by alice: added caching.

// ❌ Commented-out code kept "for reference"
```

如果文档注释只能复述签名，请改进名称，直到注释能够表达出签名无法表达的信息——或者在完整记录的 API 中为了保持对称而接受最简注释。

## 可执行验证

```bash
go vet ./...                  # flags some malformed doc comments
gofmt -l .                    # Go 1.19+ gofmt normalizes doc comments
go test ./...                 # runs Example functions with Output
go doc ./mypkg Symbol         # render what users will actually see
```

如需可浏览的预览，请在可用时运行本地 pkgsite：
`go run golang.org/x/pkgsite/cmd/pkgsite@latest`，然后打开该模块。

## 验证清单

1. 每个导出的标识符都有以其名称开头的文档注释
2. 包有包注释（"Package <name> ..."）；如果较长，则放在 doc.go 中
3. 为导出的 API 记录错误条件以及 nil/零值行为
4. 在调用者可能产生错误猜测的地方说明并发安全性
5. 在正文中使用 `[Symbol]` 文档链接，而不是直接使用名称
6. 非平凡的导出 API 都有带 `// Output:` 的 Example 函数
7. 弃用使用准确的 `Deprecated: ` 格式，并注明替代项
8. 没有复述签名、记录维护历史或保留死代码的注释
9. 启用示例后，`go test ./...` 通过