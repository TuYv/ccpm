---
name: go-documentation
description: >
  Go documentation conventions: godoc comments, package docs, testable
  Example functions, deprecation notices, and doc links.
  Use when: "add godoc", "document this package", "write doc comments",
  "add examples to docs", "deprecate a function", "package documentation",
  "improve the docs".
  Do NOT use for: commit messages (use git-commit), README-level project
  guides (plain writing task), or code style rules (use go-coding-standards).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 文档

Godoc 不是自由形式的散文——它是一套由工具链渲染的约定。
遵循该约定的注释会成为 pkg.go.dev 上可浏览的文档；不遵循约定的注释则会成为噪声。

## 1. 文档注释形式

每个导出的标识符都应有文档注释。注释以该标识符的名称开头，并且是一个完整的句子：

```go
// ✅ Good
// ParseDuration parses a duration string such as "300ms" or "2h45m".
// It returns an error if the string is not a valid duration.
func ParseDuration(s string) (Duration, error) { ... }

// ❌ Bad — doesn't start with the name, fragment, restates signature
// this function parses durations
func ParseDuration(s string) (Duration, error) { ... }
```

- 一组相关的常量/变量可以共用一条位于代码块上方的注释：例如在 `const (...)` 组上方添加 `// Common HTTP methods.`。
- 未导出的标识符：当其用途无法从名称中明显看出时添加注释——形式相同，但不是强制要求。
- 说明调用者需要了解的内容：行为、错误条件、nil/零值处理方式、并发安全性。不要描述实现细节。

## 2. 包文档

每个包应有一条包注释，写在 `package` 子句上。若内容超过几个句子，应将其放在专用的 `doc.go` 中：

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

- 以“Package <name> ...”开头。
- 缩进的行（一个制表符）会渲染为代码块。
- `main` 包：注释应描述命令及其标志——它会成为该命令的文档。

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
- 以 `# ` 开头的行是标题（很少使用；仅用于较长的包文档）。
- 列表：以一个空格和项目符号开头的行。避免列表层级过深。

## 4. 可测试的示例

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

- `// Output:` 注释会使示例成为测试——如果打印的输出不同，`go test` 就会失败。没有该注释的示例会被编译，但不会运行。
- 为每个非简单的导出 API 编写示例。示例会直接渲染在 pkg.go.dev 上对应符号的下方。

## 5. 弃用

```go
// Fetch retrieves the resource.
//
// Deprecated: Use [Client.FetchContext] instead, which honors
// context cancellation.
func (c *Client) Fetch(id string) (*Resource, error)
```

- 该段落必须以 `Deprecated: ` 开头，且完全一致。
- 始终指明替代项。
- 工具（gopls、staticcheck、pkg.go.dev）会自动显示这些信息。

## 6. 不应编写的内容

```go
// ❌ Noise — restates the code
// GetName returns the name.
func (u *User) GetName() string { return u.name }

// ❌ Maintenance history — belongs in git
// Changed 2024-03-01 by alice: added caching.

// ❌ Commented-out code kept "for reference"
```

如果文档注释只能复述签名，请改进名称，直到注释能够表达签名无法表达的内容——或者，为了在完整记录文档的 API 中保持一致，可以接受最简短的注释。

## 可执行验证

```bash
go vet ./...                  # flags some malformed doc comments
gofmt -l .                    # Go 1.19+ gofmt normalizes doc comments
go test ./...                 # runs Example functions with Output
go doc ./mypkg Symbol         # render what users will actually see
```

如需可浏览的预览，如果 pkgsite 可用，请在本地运行：
`go run golang.org/x/pkgsite/cmd/pkgsite@latest`，然后打开该模块。

## 验证清单

1. 每个导出的标识符都有以其名称开头的文档注释
2. 包含包注释（"Package <name> ..."）；如果较长，则放在 doc.go 中
3. 导出的 API 记录了错误条件以及 nil/零值行为
4. 在调用者可能作出错误推断的地方说明并发安全性
5. 在正文中使用 `[Symbol]` 文档链接，而不是不带链接的名称
6. 非简单的导出 API 具有包含 `// Output:` 的 Example 函数
7. 弃用说明使用完全一致的 `Deprecated: ` 格式，并指明替代项
8. 不包含复述签名、记录维护历史或保留无效代码的注释
9. 启用示例时，`go test ./...` 能够通过