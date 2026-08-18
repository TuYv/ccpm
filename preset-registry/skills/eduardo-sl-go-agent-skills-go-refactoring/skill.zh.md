---
name: go-refactoring
description: >
  Safe refactoring workflow for Go: behavior-preserving steps,
  compiler-checked renames, extracting packages, breaking circular
  dependencies, and strangler migrations — always behind green tests. Use
  when: "refactor this", "rename across the codebase", "extract a package",
  "break this circular dependency", "split this god package", "migrate
  callers", "clean up without changing behavior".
  Not for: choosing the target architecture (go-architecture-review),
  adopting new language features (go-modernize), performance rewrites
  (go-performance-review).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain. Requires git. gopls is optional, for semantic rename.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*) Bash(git:*) Bash(gopls:*)
metadata:
  author: eduardo-sl
  version: "1.1.1"
---
# Go 重构工作流

重构会改变结构，但绝不会改变行为。完成的定义是机械性的：每一步之前和之后都必须通过相同的测试，并且每一步都足够小，可以单独还原。

## 1. 循环

1. **基线：**在修改任何内容之前，`go build ./... && go test ./...` 必须通过。如果目标代码周围缺少测试，先编写特征测试——它们会固定当前行为，即使该行为看起来不正确。
2. 从下面的目录中执行**一个变换**。
3. **验证：**构建 + 测试 + `go vet ./...`。
4. **提交。**绝不要将重构提交与行为变更混在一起——审阅者可以快速浏览 `refactor:` 提交；而混合提交则必须仔细审查。
5. 重复以上步骤。

如果第 3 步失败，并且无法在一分钟内明确修复方法，应当还原这一步，而不是调试一个只完成了一半的变换。

## 2. 重命名——让工具完成

```bash
# 首选：gopls（理解类型、接口和嵌入）
gopls rename -w internal/service/user.go:#offset newName

# 模块路径或包导入路径变更：
# 更新 go.mod，然后以机械方式重写导入
find . -name '*.go' -exec sed -i 's|github.com/acme/old|github.com/acme/new|g' {} +
go build ./...   # 编译器就是审阅者
```

如果没有经历弃用周期，绝不要重命名已发布库的导出标识符：添加新名称，将旧名称标记为
`// Deprecated: use NewName.`，并在下一个主版本中删除。

## 3. 提取包

按照编译器检查的步骤，将代码移出一个上帝包：

1. 创建新包；**移动一个类型及其方法**（使用 `gopls` 或剪切/粘贴），其余内容保持不变。
2. 在旧包中添加类型别名，使任何内容都不会中断：
   `type User = user.User`（是别名，即 `=`，而不是定义）。
3. 构建。分批将导入方迁移到新路径；每批都进行构建。
4. 当不再有导入方时，删除别名。

这样可以让每次提交都保持通过，即使调用方数量任意庞大。

## 4. 打破循环依赖

包 `a → b` 和 `b → a` 无法编译；近似的循环通常会表现为上帝包。有三种解决方式，按优先顺序排列：

1. **提取共享核心：**`a` 和 `b` 实际上都依赖某个类型——将其移动到不导入任何包的第三个包 `c` 中。
2. **使用接口反转：**如果 `store` 回调 `service`，就在 `store` **中**定义回调接口（消费方一侧），并让 `service` 实现它。箭头会在编译时翻转。
3. **合并：**如果两个包无法在彼此独立的情况下描述，那么它们本来就是一个包。

## 5. 安全地更改函数签名

对于有许多调用方的导出函数：

```go
// Step 1 — add the new form alongside the old
func (s *Service) ProcessCtx(ctx context.Context, id string) error { ... }

// Step 2 — old form delegates; mark deprecated
// Deprecated: use ProcessCtx.
func (s *Service) Process(id string) error {
    return s.ProcessCtx(context.Background(), id)
}

// Step 3 — migrate callers batch by batch, building each batch
// Step 4 — delete the old form (same module) or keep until next major (library)
```

在单个模块内部，如果编译器能够为你找出所有调用方，优先采用原子式签名变更：修改它，然后逐一处理构建错误——编译器正在为你枚举待办事项。

## 6. 子系统的绞杀者迁移

替换一个对于单个 PR 来说过于庞大的子系统（旧存储、遗留客户端）：

1. 定义调用方实际需要的消费者侧接口。
2. 让 OLD 实现满足该接口；将调用方连接到该接口。
3. 在同一接口之后构建新实现；针对同一套共享契约测试套件测试两种实现。
4. 在组合根中切换连接方式（一行代码，一个提交，能够轻易回滚）。如果风险需要，可为其添加功能开关。
5. 在独立的提交中删除旧实现。

## 7. 什么不是重构

- “既然都做到这里了”式的 bug 修复——在之前或之后使用独立提交。
- 重新排列使用位置字面量的结构体字段、修改调用方会进行匹配的导出错误字符串、修改 JSON 标签——这些都是披着重构外衣的行为变更。
- 没有测试的重写。如果你无法先固定行为，那就不是在重构；你是在赌博。

## 验证清单

1. 第一次变更前，基线构建和测试均通过
2. 在覆盖不足的地方添加特征测试
3. 每个提交只进行一种变换；`refactor:` 提交不包含行为变更
4. 通过 gopls/编译器完成重命名，而不是对标识符执行查找替换
5. 提取包时使用类型别名，以便在迁移过程中保持构建通过
6. 没有新增依赖循环（`go build ./...` 可以证明这一点）
7. 公共 API 变更遵循弃用周期
8. 每个提交都通过 `go vet ./...` 和完整测试套件，而不只是最后一个提交
9. git log 展现为一系列安全、可回滚的步骤