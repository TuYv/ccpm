---
name: go-semantic-tools
description: >
  Navigate and analyze Go codebases semantically with the toolchain instead
  of text search: gopls (references, implementations, call hierarchy,
  rename), go list for the dependency graph, and go doc for APIs. Use when:
  "find all callers", "who implements this interface", "where is this used",
  "trace the dependency graph", "explore this codebase", "find usages before
  changing", "map the module".
  Not for: performing the refactor (go-refactoring), judging the
  architecture (go-architecture-review), writing documentation
  (go-documentation).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Requires gopls (go install golang.org/x/tools/gopls@latest).
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(gopls:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 语义工具

grep 查找字符串；工具链寻找语义。方法名会在不同类型之间重复，接口是隐式满足的，而点导入会误导文本搜索。在修改共享代码之前，应从理解类型的工具中获取真实信息。

## 1. 选择工具

| 问题 | 命令 |
|---|---|
| 此符号在哪里被使用？ | `gopls references file.go:LINE:COL` |
| 它在哪里定义？ | `gopls definition file.go:LINE:COL` |
| 谁实现了这个接口？/ 这个类型满足哪些接口？ | `gopls implementation file.go:LINE:COL` |
| 谁调用了这个函数（传递调用）？ | `gopls call_hierarchy file.go:LINE:COL` |
| 这个包的 API 有哪些？ | `go doc ./internal/service` / `go doc pkg Symbol` |
| 存在哪些包 / 依赖关系是什么？ | `go list ./...`、`go list -deps`、`go list -json` |
| 在整个模块中按名称查找符号 | `gopls workspace_symbol Name` |
| 一个文件中的符号 | `gopls symbols file.go` |

位置格式为 `file.go:line:column`（从 1 开始计数）。通过之前的搜索或 `gopls symbols` 获取行号和列号。所有 gopls 命令都必须在模块内部运行，并且需要预热的构建缓存——先运行一次 `go build ./...`。

## 2. 标准调查流程

### 修改函数之前

```bash
gopls references internal/service/user.go:42:6   # every call site, typed
gopls call_hierarchy internal/service/user.go:42:6
```

对 `Process(` 进行文本搜索会显示每个类型的 `Process`；`references` 只返回当前这个符号的调用位置——包括通过接口和嵌入产生的、grep 无法发现的用法。

### 映射接口

```bash
# On the interface name: all implementations
gopls implementation internal/store/store.go:15:6

# On a method of a concrete type: interfaces it satisfies
gopls implementation internal/store/postgres/user.go:30:18
```

在向接口添加方法之前运行此命令——列出的每个实现都会出错。

### 理解依赖图

```bash
go list ./...                                    # all packages
go list -f '{{.ImportPath}} -> {{join .Imports " "}}' ./... # direct edges
go list -deps ./cmd/api | grep myorg             # everything a binary pulls in
go list -json ./internal/service | jq .Imports   # machine-readable
```

使用这些命令验证分层声明（“domain 不导入任何内容”），而不是盲目信任目录名称。

### 探索不熟悉的 API

```bash
go doc ./internal/payments            # package overview
go doc ./internal/payments Gateway    # one symbol, with doc comment
go doc -all ./internal/payments       # full API surface
```

优先使用这些命令，而不是打开文件：它们会展示导出的契约，不会混入实现细节。

## 3. 语义重命名

```bash
gopls rename -w internal/service/user.go:42:6 ProcessOrder
```

在符号的所有引用位置重命名——包括通过接口、嵌入和测试包产生的引用。绝不要使用查找替换来重命名标识符；字段 `UserID` 和局部变量 `UserID` 是拼写相同但不同的符号。

## 4. 不使用编辑器进行诊断

```bash
gopls check ./internal/...   # type errors + analyzer findings per file
go vet ./...                 # the vet suite standalone
```

`gopls check` 会显示 IDE 用户所看到的相同诊断信息——审查尚未在编辑器中打开的代码时运行它。

## 5. 何时仍应使用 grep

- 字符串字面量：日志消息、SQL、配置键、错误文本。
- 注释、TODO、文档。
- 尚未编译通过的代码——gopls 需要可进行类型检查的包；grep 可以处理损坏的代码树。
- 快速检查是否存在（“这个环境变量是否在任何地方被引用？”）。

经验法则：标识符 → gopls；字面量和自然语言文本 → grep。

## 验证清单

1. 在修改任何共享符号之前，使用 `gopls references`（而不是 grep）枚举调用点
2. 修改接口之前，先对该接口运行 `gopls implementation`
3. 使用 `gopls rename -w` 执行重命名，绝不要进行文本替换
4. 使用 `go list` 的导入数据验证分层假设
5. 在阅读实现之前，通过 `go doc` 探索不熟悉的包
6. 在不使用编辑器进行审查时，运行 `gopls check` / `go vet`
7. 将 grep 限用于字面量、注释和无法编译的代码