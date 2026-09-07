---
name: golang-context
description: "Idiomatic context.Context usage in Golang — propagation through API boundaries, cancellation, timeouts and deadlines, request-scoped values, context.WithoutCancel for background work outliving requests. Apply when designing context propagation across layers, debugging leaked or unexpired contexts, choosing between context.Background/TODO/WithoutCancel, or storing values in context. Not for code that merely accepts ctx as first parameter."
user-invocable: true
license: MIT
compatibility: Designed for Claude Code, Codex or similar harness, and for projects using Golang.
metadata:
  author: samber
  version: "1.3.1"
  openclaw:
    emoji: "🔗"
    homepage: https://github.com/samber/cc-skills-golang
    requires:
      bins:
        - go
    install: []
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(golangci-lint:*) Bash(git:*) Agent
paths:
  - "**/*.go"
---
> **社区默认。** 明确取代 `samber/cc-skills-golang@golang-context` 技能的公司技能优先。

# Go context.Context 最佳实践

`context.Context` 是 Go 中跨 API 边界和 goroutine 之间传递取消信号、截止时间和请求作用域值的机制。可以把它想象成请求的“会话”——它把属于同一工作单元的所有操作绑定在一起。

## 最佳实践总结

1. 在整个请求生命周期中传递同一个 context：HTTP handler → 服务 → 数据库 → 外部 API——任何另起全新 context 的环节都会在客户端已离开后继续运行。
2. 将 `ctx` 作为第一个参数，命名为 `ctx context.Context`——这个固定位置正是让 context 感知 API 一眼可辨的关键，也是 linter 检查的依据。
3. 通过函数参数传递 context，而不是将其存储在 struct 中——struct 的存活时间会长于填充它的请求，因此后续调用会复用一个已被取消或属于他人的 context。
4. 传递 `context.TODO()` 而不是 `nil` context——`nil` 会在第一次调用 `Done()` 或 `Value()` 时 panic，而此处距离传入它的调用者已经很远。
5. 在 `WithCancel`/`WithTimeout`/`WithDeadline` 的所有控制流路径上调用 `cancel()`，除非 context 和 cancel 函数的所有权被显式返回或转移——未调用的 `cancel()` 会让子 context 一直挂在父 context 上，并在父 context 结束前泄漏其计时器。
6. 仅在顶层入口点（main、init、测试）创建 `context.Background()`。在调用链更深处——尤其是在请求处理过程中——它会使工作脱离调用者的截止时间与取消机制，造成下方所示的传播中断。
7. 当需要 context 但尚不存在时，使用 `context.TODO()` 作为占位符——它将这一缺口标记出来以便日后修复，而不是用一个看似刻意为之的 `Background()` 将问题隐藏起来。
8. 将 context 值的键声明为未导出类型——如果使用普通的 `string` 键，两个包都使用 `"user"` 时会互相静默覆盖。
9. 仅在 context 值中携带请求作用域的元数据，绝不携带本应作为函数参数的内容——通过 `Value()` 取回的值失去了编译期类型，且不会出现在函数签名中。
10. 在启动必须比父请求存活更久的后台工作时使用 `context.WithoutCancel`（Go 1.21+）——否则 handler 一返回，就会取消刚刚开始的审计日志记录或清理工作。

## 创建 Context

| 场景 | 使用 |
| --- | --- |
| 入口点（main、init、测试） | `context.Background()` |
| 函数需要 context 但调用者尚未提供 | `context.TODO()` |
| 在 HTTP handler 内部 | `r.Context()` |
| 需要取消控制 | `context.WithCancel(parentCtx)` |
| 需要截止时间/超时 | `context.WithTimeout(parentCtx, duration)` |

## Context 传播：核心原则

最重要的规则：**在整个调用链中传递同一个 context**。当你正确传播时，取消父 context 会自动取消所有下游工作。

```go
// ✗ Bad — creates a new context, breaking the chain
func (s *OrderService) Create(ctx context.Context, order Order) error {
    return s.db.ExecContext(context.Background(), "INSERT INTO orders ...", order.ID)
}

// ✓ Good — propagates the caller's context
func (s *OrderService) Create(ctx context.Context, order Order) error {
    return s.db.ExecContext(ctx, "INSERT INTO orders ...", order.ID)
}
```

## 深入探讨

- **[取消、超时与截止时间](./references/cancellation.md)**——取消如何传播：`WithCancel` 用于手动取消，`WithTimeout` 用于在一段时长后自动取消，`WithDeadline` 用于绝对时间截止点。并发代码中的监听模式（`<-ctx.Done()`）、`AfterFunc` 回调，以及用于必须比父请求存活更久的操作（例如审计日志）的 `WithoutCancel`。

- **[Context 值与跨服务追踪](./references/values-tracing.md)**——安全的 context 值模式：使用未导出键类型防止命名空间冲突，何时使用 context 值（请求 ID、用户 ID）与何时使用函数参数。追踪 context 传播：OpenTelemetry trace 头、用于日志聚合的关联 ID，以及跨服务边界对 context 进行序列化/反序列化。

- **[HTTP 服务器与服务调用中的 Context](./references/http-services.md)**——HTTP handler context：`r.Context()` 用于请求作用域的取消、中间件集成以及向服务传播。HTTP 客户端模式：`NewRequestWithContext`、客户端超时以及具备 context 感知的重试。数据库操作：始终使用 `*Context` 变体（`QueryContext`、`ExecContext`）以遵守截止时间。

## 交叉引用

- → 参见 `samber/cc-skills-golang@golang-concurrency` 技能，了解使用 context 取消 goroutine 的模式
- → 参见 `samber/cc-skills-golang@golang-database` 技能，了解 context 感知的数据库操作（QueryContext、ExecContext）
- → 参见 `samber/cc-skills-golang@golang-observability` 技能，了解使用 OpenTelemetry 的 trace context 传播
- → 参见 `samber/cc-skills-golang@golang-design-patterns` 技能，了解超时与弹性模式

## 使用 Linter 强制执行

许多 context 陷阱会被 linter 自动捕获：`govet`、`staticcheck`。→ 参见 `samber/cc-skills-golang@golang-lint` 技能，了解配置与用法。
