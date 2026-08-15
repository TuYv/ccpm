---
name: go-semantic-tools
description: >
  Navigate and analyze Go codebases semantically with the toolchain instead of
  text search: gopls (references, implementations, call hierarchy, rename),
  go list for the dependency graph, and go doc for APIs.
  Use when: "find all callers", "who implements this interface", "where is this
  used", "trace the dependency graph", "explore this codebase", "find usages
  before changing", "map the module".
  Do NOT use for: performing the refactor itself (use go-refactoring),
  judging the architecture found (use go-architecture-review), or
  documentation writing (use go-documentation).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 语义工具

grep 查找字符串；工具链查找语义。方法名会在不同类型中重复，接口是隐式实现的，而点导入会误导文本搜索。在修改共享代码之前，应通过理解类型的工具获取真实情况。

## 1. 选择工具

| 问题 | 命令 |
|---|---|
| 这个符号在哪里被使用？ | `gopls references file.go:LINE:COL` |
| 它在哪里定义？ | `gopls definition file.go:LINE:COL` |
| 谁实现了这个接口？/ 这个类型满足哪些接口？ | `gopls implementation file.go:LINE:COL` |
| 谁调用了这个函数（包括传递调用）？ | `gopls call_hierarchy file.go:LINE:COL` |
| 这个包的 API 中有哪些内容？ | `go doc ./internal/service` / `go doc pkg Symbol` |
| 存在哪些包 / 它们依赖什么？ | `go list ./...`, `go list -deps`, `go list -json` |
| 在整个模块中按名称查找符号 | `gopls workspace_symbol Name` |
| 单个文件中的符号 | `gopls symbols file.go` |

位置格式为 `file.go:line:column`（从 1 开始）。可以从之前的搜索结果或 `gopls symbols` 获取行号和列号。所有 gopls 命令都应在模块内运行，并且需要预热的构建缓存——先运行一次 `go build ./...`。

## 2. 标准调查流程

### 修改函数之前

```bash
gopls references internal/service/user.go:42:6   # every call site, typed
gopls call_hierarchy internal/service/user.go:42:6
```

对 `Process(` 进行文本搜索会找出每个类型的 `Process`；`references` 只返回这个符号的调用位置——包括通过接口和嵌入产生、grep 无法发现的用法。

### 梳理接口

```bash
# On the interface name: all implementations
gopls implementation internal/store/store.go:15:6

# On a method of a concrete type: interfaces it satisfies
gopls implementation internal/store/postgres/user.go:30:18
```

在向接口添加方法之前运行此命令——列出的每个实现都会因此失效。

### 理解依赖关系图

```bash
go list ./...                                    # all packages
go list -f '{{.ImportPath}} -> {{join .Imports " "}}' ./... # direct edges
go list -deps ./cmd/api | grep myorg             # everything a binary pulls in
go list -json ./internal/service | jq .Imports   # machine-readable
```

使用这些命令验证分层方面的断言（“domain 不导入任何内容”），而不是相信目录名称。

### 探索不熟悉的 API

```bash
go doc ./internal/payments            # package overview
go doc ./internal/payments Gateway    # one symbol, with doc comment
go doc -all ./internal/payments       # full API surface
```

相比直接打开文件，应优先使用这种方式：它会展示导出的契约，而不会混入实现细节的干扰。

## 3. 语义重命名

```bash
gopls rename -w internal/service/user.go:42:6 ProcessOrder
```

对该符号的所有引用进行重命名——包括通过接口、嵌入和测试包产生的引用。切勿使用查找替换来重命名标识符；字段 `UserID` 和局部变量 `UserID` 是拼写相同但彼此不同的符号。

## 4. 不使用编辑器进行诊断

```bash
gopls check ./internal/...   # type errors + analyzer findings per file
go vet ./...                 # the vet suite standalone
```

`gopls check` 会显示与 IDE 用户看到的相同诊断信息——审查尚未在编辑器中打开的代码时，请运行它。

## 5. 仍应使用 grep 的情况

- 字符串字面量：日志消息、SQL、配置键、错误文本。
- 注释、TODO、文档。
- 尚无法编译的代码——gopls 需要可进行类型检查的包；grep 可以处理损坏的代码树。
- 快速检查是否存在（“是否有任何地方引用了这个环境变量？”）。

经验法则：标识符 → gopls；字面量和文本 → grep。

## 验证清单

1. 更改任何共享符号之前，使用 `gopls references`（而不是 grep）列出调用点
2. 更改接口之前，先对该接口运行 `gopls implementation`
3. 使用 `gopls rename -w` 执行重命名，绝不使用文本替换
4. 使用 `go list` 的导入数据验证分层假设
5. 阅读实现之前，先通过 `go doc` 探索不熟悉的包
6. 不使用编辑器进行审查时，运行 `gopls check` / `go vet`
7. grep 仅用于字面量、注释和无法编译的代码