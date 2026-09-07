---
name: golang-error-handling
description: "Idiomatic Golang error handling — creation, wrapping with %w, errors.Is/As, errors.Join, custom error types, sentinel errors, panic/recover, the single handling rule, structured logging with slog, HTTP request logging middleware, and samber/oops for production errors. Built to make logs usable at scale with log aggregation 3rd-party tools. Apply when creating, wrapping, inspecting, or logging errors in Go code. For samber/oops specifics → See `samber/cc-skills-golang@golang-samber-oops` skill; for slog handler ecosystem → See `samber/cc-skills-golang@golang-samber-slog` skill."
user-invocable: true
license: MIT
compatibility: Designed for Claude Code, Codex or similar harness, and for projects using Golang.
metadata:
  author: samber
  version: "1.3.1"
  openclaw:
    emoji: "⚠"
    homepage: https://github.com/samber/cc-skills-golang
    requires:
      bins:
        - go
    install: []
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(golangci-lint:*) Bash(git:*) Agent
paths:
  - "**/*.go"
---
**角色设定：** 你是一名 Go 可靠性工程师。你将每个错误视为一个必须被处理或携带上下文向上传播的事件——静默失败和重复日志同样不可接受。

**编排模式：** 针对“并行化错误处理审计”一节中描述的五个类别子代理（创建、包装、单一处理规则、panic/recover、结构化日志）进行并行展开，以审计大型代码库中的错误处理，并汇总它们的发现。在 Claude Code 上，使用 `ultracode` 显式选择启用多代理编排。

**模式：**

- **编码模式**——编写新的错误处理代码。按顺序遵循最佳实践；可选择启动一个后台子代理，在不阻塞主实现的情况下 grep 相邻代码中的违规项（被吞掉的错误、先记日志再返回的配对写法）。
- **评审模式**——评审某个 PR 的错误处理变更。聚焦于 diff：检查被吞掉的错误、缺失的包装上下文、先记日志再返回的配对写法，以及 panic 的误用。顺序执行。
- **审计模式**——审计整个代码库中的既有错误处理。最多使用 5 个并行子代理，每个针对一个独立类别（创建、包装、单一处理规则、panic/recover、结构化日志）。

> **社区默认。** 显式取代 `samber/cc-skills-golang@golang-error-handling` 技能的公司技能具有优先权。

# Go 错误处理最佳实践

本技能指导在 Go 应用中构建健壮、符合惯例的错误处理。遵循这些原则，编写可维护、可调试、可直接投入生产的错误处理代码。

## 最佳实践摘要

1. **返回的错误必须始终被检查**——绝不使用 `_` 丢弃
2. **错误必须附带上下文进行包装**，使用 `fmt.Errorf("{context}: %w", err)`
3. **错误字符串必须为小写**，不带尾部标点
4. **内部使用 `%w`，系统边界处使用 `%v`**，以控制错误链的暴露程度
5. **必须使用 `errors.Is` 进行哨兵错误匹配，使用 `errors.As`/`errors.AsType` 进行类型化错误链检查**，而非直接比较或裸类型断言。对于 Go 1.26+，当 `T` 实现了 `error` 时优先使用 `errors.AsType[T](err)`；对于 Go <1.26 或非错误接口的目标，使用 `errors.As(err, &target)`。
6. **应使用 `errors.Join`**（Go 1.20+）来合并相互独立的错误
7. **错误必须要么被记录，要么被返回**，绝不可两者兼有（单一处理规则）
8. **使用哨兵错误**处理预期情况，使用自定义类型承载数据
9. **绝不对预期的错误情况使用 `panic`**——将其保留给真正不可恢复的状态
10. **应使用 `slog`**（Go 1.21+）进行结构化错误日志记录——而不是 `fmt.Println` 或 `log.Printf`
11. **使用 `samber/oops`** 处理需要堆栈跟踪、用户/租户上下文或结构化属性的生产环境错误
12. **记录 HTTP 请求日志**，通过结构化中间件捕获方法、路径、状态码和耗时
13. **使用日志级别**标示错误的严重程度
14. **绝不向用户暴露技术性错误**——将内部错误转换为对用户友好的消息，技术细节则单独记录日志
15. **保持日志分组的低基数**——在日志/APM 边界处，保持消息模板稳定，并将 ID、路径、行号和计数作为结构化属性附加。错误值可以包含有用的运维上下文，但应避免将高基数数据放入用于分组的稳定日志消息中。

## 详细参考

- **[错误创建](./references/error-creation.md)** — 如何创建能讲清来龙去脉的错误：错误消息应小写、不带标点，描述发生了什么而不指定应对动作。涵盖哨兵错误（为性能考虑的一次性预分配）、自定义错误类型（用于承载丰富上下文），以及何时使用何种方式的决策表。

- **[错误包装与检查](./references/error-wrapping.md)** — 为什么 `fmt.Errorf("{context}: %w", err)` 优于 `fmt.Errorf("{context}: %v", err)`（链式保留 vs 简单拼接）。如何使用 `errors.Is`、`errors.As` 以及 Go 1.26+ 的 `errors.AsType` 检查错误链以实现类型安全的错误处理，以及如何使用 `errors.Join` 合并相互独立的错误。

- **[错误处理模式与日志](./references/error-handling.md)** — 单一处理规则：错误要么被记录，要么被返回，绝不同时进行（防止重复日志充斥聚合器）。panic/recover 设计、用于生产环境错误的 `samber/oops`，以及面向 APM 工具的 `slog` 结构化日志集成。

## 并行化错误处理审计

在审计大型代码库的错误处理时，最多使用 5 个并行子代理——每个针对一个独立的错误类别：

- 子代理 1：错误创建——验证 `errors.New`/`fmt.Errorf` 的使用、低基数消息、自定义类型
- 子代理 2：错误包装——审计 `%w` 与 `%v` 的使用，验证 `errors.Is`/`errors.As` 模式
- 子代理 3：单一处理规则——查找先记日志再返回的违规项、被吞掉的错误、被丢弃的错误（`_`）
- 子代理 4：Panic/recover——审计 `panic` 的使用，验证在 goroutine 边界处进行了恢复
- 子代理 5：结构化日志——验证错误发生处的 `slog` 使用情况，检查错误消息中是否含有 PII

## 交叉引用

- → 参见 `samber/cc-skills-golang@golang-samber-oops`，了解完整的 samber/oops API、构建器模式以及日志器集成
- → 参见 `samber/cc-skills-golang@golang-observability`，了解结构化日志配置、日志级别和请求日志中间件
- → 参见 `samber/cc-skills-golang@golang-safety`，了解 nil 接口陷阱与 nil 错误比较的坑
- → 参见 `samber/cc-skills-golang@golang-naming`，了解错误命名约定（ErrNotFound、PathError）
- → 参见 `samber/cc-skills-golang@golang-continuous-integration` 技能，了解在 CI 中基于这些准则的自动化 AI 驱动代码评审

## 参考资料

- [lmittmann/tint](https://github.com/lmittmann/tint)
- [samber/oops](https://github.com/samber/oops)
- [samber/slog-multi](https://github.com/samber/slog-multi)
- [samber/slog-sampling](https://github.com/samber/slog-sampling)
- [samber/slog-formatter](https://github.com/samber/slog-formatter)
- [samber/slog-http](https://github.com/samber/slog-http)
- [samber/slog-sentry](https://github.com/samber/slog-sentry)
- [log/slog 包](https://pkg.go.dev/log/slog)
