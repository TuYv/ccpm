---
name: go-observability
description: >
  Structured logging, distributed tracing, metrics, and health checks for Go
  services. Covers slog, OpenTelemetry, Prometheus, and observability best
  practices. Use when: "add logging", "structured logs", "add tracing",
  "OpenTelemetry", "add metrics", "Prometheus", "observability", "instrument
  this code".
  Not for: pprof profiling (go-performance-review), error handling
  (go-error-handling), health endpoints (go-api-design).
user-invocable: true
license: MIT
compatibility: Designed for Claude Code or similar AI coding agents working on Go projects. Requires the Go toolchain.
allowed-tools: Read Edit Write Glob Grep Bash(go:*) Bash(gofmt:*)
metadata:
  author: eduardo-sl
  version: "1.2.0"
---
# Go 可观测性

对于生产服务而言，可观测性不是可选项。每个服务都必须生成结构化日志、暴露指标，并传递 trace context。使用标准库中的
`log/slog` 记录日志，并使用 OpenTelemetry 进行追踪和指标采集。

按需加载的详细参考资料：

- `references/slog.md` — handler 设置、logger 注入、子 logger。
- `references/tracing.md` — tracer provider、spans、传播、关闭。
- `references/metrics.md` — 指标定义、HTTP instrumentation。

仅当下面的章节不足以解决问题时，才读取参考文件。

## 1. 使用 slog 记录结构化日志

在生产环境中使用 `log/slog`（Go 1.21+）并搭配 JSON handler。每一行都必须是
键值对，绝不能是格式化句子：

```go
// ✅ Good — structured, leveled
logger.Info("user created", slog.String("user_id", user.ID), slog.Duration("latency", elapsed))

// ❌ Bad — unparseable in production
log.Printf("user %s created in %v", user.ID, elapsed)
```

将 logger 作为依赖注入；绝不要使用包级全局变量。使用 `logger.With(...)` 派生子 logger，
这样 component、method 和 request
ID 只需附加一次，而不是在每个调用点重复附加。参见 `references/slog.md`。

### 日志级别 — 保持一致地使用

| 级别 | 用途 |
|---|---|
| `Debug` | 详细的诊断信息，在生产环境中禁用 |
| `Info` | 正常操作：收到请求、任务完成 |
| `Warn` | 可恢复的问题：重试成功、使用了弃用功能 |
| `Error` | 需要关注的故障：DB 宕机、外部调用失败 |

绝不要对预期情况使用 Error 级别记录日志（未找到用户 → 使用 Info 或 Warn）。

### 敏感数据 — 绝不要记录

- 密码、令牌、API keys
- 完整的信用卡号码、SSNs
- 包含 PII 的原始请求体

```go
// ✅ Good — redacted
logger.Info("auth attempt", slog.String("user", email), slog.Bool("success", ok))

// ❌ Bad — leaks credentials
logger.Info("auth attempt", slog.String("password", password))
```

## 2. 使用 OpenTelemetry 进行分布式追踪

对于所有值得在 waterfall 中看到的操作，都要启动一个 span — 入站请求、
DB 调用、出站 HTTP、具有实际意义的业务步骤 — 并始终
`defer span.End()`。

参考示例遵循以下规则：

- 使用操作名称命名 span（`GetUser`、`db.query`），绝不要使用
  完全限定的函数名，也绝不要使用 `doStuff`。
- 失败时调用 `span.RecordError(err)` 和 `span.SetStatus(codes.Error, ...)`，
  否则追踪结果会将失败的请求显示为绿色 span。
- 将 `ctx` 传递到整个调用链中。在调用链中途使用 `context.Background()`
  会悄无声息地启动一条新的 trace，并破坏父链接。

设置和示例见 `references/tracing.md`。

## 3. 使用 OpenTelemetry / Prometheus 采集指标

| 类型 | 用途 | 示例 |
|---|---|---|
| Counter | 单调递增的值 | 请求总数、错误总数 |
| Gauge | 可上升也可下降的值 | 活跃连接数、队列深度 |
| Histogram | 值的分布 | 请求延迟、响应大小 |

命名格式为 `<namespace>_<subsystem>_<name>_<unit>`：

```text
http_request_duration_seconds     ✅（名称中包含单位）
http_requests_total               ✅（带有 `_total` 后缀的计数器）
db_connections_active             ✅（仪表，无需后缀）
user_signups                      ❌（计数器缺少 `_total`）
requestLatency                    ❌（驼峰命名，无单位）
```

保持基数有界。使用路由模式、方法和状态作为标签 —
切勿使用用户 ID、请求 ID 或原始 `r.URL.Path`，因为它们中的每一个都会按值创建新的
时间序列，并最终导致指标后端宕机。

定义和中间件参见 `references/metrics.md`。

## 4. 关联日志、追踪和指标

没有追踪 ID 的日志行无法关联到产生它的请求。在每个处理器或服务方法的开头获取
`trace.SpanContextFromContext(ctx)`，并将 `trace_id` 和
`span_id` 附加到日志记录器。

## 5. 遥测的优雅关闭

批处理 span 处理器会将 span 保存在内存中。退出时使用其自身的超时调用
`tp.Shutdown(ctx)`，否则崩溃前的最后几秒 — 最值得关注的那些 —
永远无法到达收集器。

两个示例均位于 `references/tracing.md`。

## 验证清单

1. 所有日志记录均使用带结构化键值对的 `log/slog`，而非 `fmt.Printf` 或 `log.Printf`
2. 日志记录器作为依赖注入，而不是作为全局变量使用
3. 日志输出中不包含敏感数据（密码、令牌、PII）
4. 追踪上下文通过 `context.Context` 在所有函数调用中传播
5. 为重要操作创建 span（数据库调用、HTTP 请求、业务逻辑）
6. Span 使用 `span.RecordError(err)` 记录错误，并设置错误状态
7. 指标遵循命名约定：`_seconds`、`_total`、`_bytes`
8. 指标中没有高基数标签（用户 ID、请求 ID）
9. 遥测提供程序在服务退出时优雅关闭
10. 日志条目中包含追踪 ID，以便关联