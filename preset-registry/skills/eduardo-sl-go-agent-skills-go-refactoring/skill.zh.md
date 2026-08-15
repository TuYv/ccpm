---
name: go-refactoring
description: >
  Safe refactoring workflow for Go: behavior-preserving steps, compiler-checked
  renames, extracting packages, breaking circular dependencies, and strangler
  migrations — always behind green tests.
  Use when: "refactor this", "rename across the codebase", "extract a package",
  "break this circular dependency", "split this god package", "migrate callers",
  "clean up without changing behavior".
  Do NOT use for: deciding the target architecture (use go-architecture-review),
  adopting new language features (use go-modernize), or performance rewrites
  (use go-performance-review).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 重构工作流

重构只改变结构，绝不改变行为。完成标准可以通过机械方式判定：
每一步前后都应通过相同的测试，并且每一步都应足够小，
能够单独回滚。

## 1. 循环

1. **基线：** 在改动任何内容之前，`go build ./... && go test ./...`
   必须通过。如果目标代码周围缺少测试，请先编写特征测试——
   它们用于固定当前行为，即使该行为看起来是错误的。
2. 从下方目录中选择**一项转换**。
3. **验证：** 构建 + 测试 + `go vet ./...`。
4. **提交。** 绝不要在重构提交中混入行为变更——
   审查者可以快速浏览 `refactor:` 提交；对于混合提交，
   他们则必须仔细审查。
5. 重复以上步骤。

如果第 3 步失败，且无法在一分钟内找到显而易见的修复方法，
应回滚该步骤，而不是调试一个只完成了一半的转换。

## 2. 重命名——交给工具完成

```bash
# Preferred: gopls (understands types, interfaces, embedding)
gopls rename -w internal/service/user.go:#offset newName

# Module path or package import path changes:
# update go.mod, then rewrite imports mechanically
find . -name '*.go' -exec sed -i 's|github.com/acme/old|github.com/acme/new|g' {} +
go build ./...   # the compiler is the reviewer
```

对于已发布库中的导出标识符，绝不要在没有经过弃用周期的情况下重命名：
添加新名称，将旧名称标记为
`// Deprecated: use NewName.`，并在下一个主版本中删除。

## 3. 提取包

通过编译器检查的步骤，将代码移出臃肿包：

1. 创建新包；**移动一个类型及其方法**（使用 `gopls`
   或剪切/粘贴），其余所有内容保持不变。
2. 在旧包中添加类型别名，确保不会破坏任何内容：
   `type User = user.User`（使用带 `=` 的别名，而不是类型定义）。
3. 构建。分批将导入方迁移到新路径；每批迁移后都进行构建。
4. 当所有导入方都已迁移后，删除别名。

这样，无论调用方规模多大，每次提交都能保持通过状态。

## 4. 打破循环依赖

包 `a → b` 和 `b → a` 无法通过编译；近似循环通常表现为
臃肿包。以下是三种解决方式，按优先顺序排列：

1. **提取共享核心：** `a` 和 `b` 实际上都依赖某个
   类型——将其移动到不导入任何内容的第三个包 `c` 中。
2. **通过接口反转依赖：** 如果 `store` 会回调 `service`，
   则在 `store` 中（消费方一侧）定义回调接口，并让
   `service` 实现它。依赖箭头会在编译时反转。
3. **合并：** 如果两个包无法脱离彼此来描述，
   那么它们从一开始就应该是同一个包。

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

在单个模块内，如果编译器能够帮你找到所有调用方，应优先采用原子化的签名变更：先进行修改，然后逐一处理构建错误——这些错误就是编译器为你列出的 TODO 清单。

## 6. 子系统的绞杀者迁移

替换一个规模太大、无法通过单个 PR 完成的子系统（旧存储、遗留客户端）：

1. 定义调用方实际需要的消费方接口。
2. 让旧实现满足该接口；将调用方连接到该接口。
3. 在同一接口后构建新实现；使用一套共享的一致性测试套件测试两种实现。
4. 在组合根中切换连接方式（一行代码、一个提交、可轻松回滚）。如果风险足够高，则使用功能标志。
5. 在单独的提交中删除旧实现。

## 7. 哪些不属于重构

- “既然都改到这里了”式的错误修复——应在重构之前或之后通过单独的提交完成。
- 对使用位置字面量的结构体字段重新排序、修改调用方会匹配的导出错误字符串、修改 JSON 标签——这些都是披着重构外衣的行为变更。
- 没有测试的重写。如果你无法先固定现有行为，那你做的就不是重构，而是在赌博。

## 验证清单

1. 首次变更之前，基线构建和测试均通过
2. 在缺少覆盖的地方添加了特征测试
3. 每个提交只包含一种转换；`refactor:` 提交不包含任何行为变更
4. 重命名通过 gopls/编译器完成，而不是对标识符进行查找替换
5. 提取包时使用类型别名，以确保迁移过程中构建始终通过
6. 没有新增依赖循环（可通过 `go build ./...` 证明）
7. 公共 API 变更遵循弃用周期
8. 每个提交都通过 `go vet ./...` 和完整测试套件，而不只是最后一个提交
9. git 日志呈现为一系列安全且可回滚的步骤