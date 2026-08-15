---
name: go-observability
description: >
  Structured logging, distributed tracing, metrics, and health checks for Go services.
  Covers slog, OpenTelemetry, Prometheus, and observability best practices.
  Use when: "add logging", "structured logs", "add tracing", "OpenTelemetry",
  "add metrics", "Prometheus", "observability", "instrument this code".
  Do NOT use for: performance profiling with pprof (use go-performance-review),
  error handling patterns (use go-error-handling), or health check endpoints (use go-api-design).
license: MIT
metadata:
  version: "1.0.0"
---
# Go 可观测性

可观测性对于生产服务而言并非可选项。每个服务都必须生成
结构化日志、公开指标并传播跟踪上下文。使用标准库
`log/slog` 进行日志记录，并使用 OpenTelemetry 进行跟踪和指标收集。

## 1. 使用 slog 进行结构化日志记录

### 使用 `log/slog`（Go 1.21+）作为标准日志包：

```go
// ✅ Good — structured, leveled logging
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
}))

logger.Info("user created",
    slog.String("user_id", user.ID),
    slog.String("email", user.Email),
    slog.Duration("latency", elapsed),
)
```

```go
// ❌ Bad — unstructured printf-style logging
log.Printf("user %s created with email %s in %v", user.ID, user.Email, elapsed)
```

### 通过上下文或依赖注入传递 logger：

```go
// ✅ Good — logger as dependency
type UserService struct {
    logger *slog.Logger
    store  UserStore
}

func NewUserService(logger *slog.Logger, store UserStore) *UserService {
    return &UserService{
        logger: logger.With(slog.String("component", "user_service")),
        store:  store,
    }
}
```

```go
// ❌ Bad — global logger
var logger = slog.Default()
```

### 创建带有作用域属性的子 logger：

```go
func (s *UserService) CreateUser(ctx context.Context, req CreateUserReq) error {
    log := s.logger.With(
        slog.String("method", "CreateUser"),
        slog.String("request_id", middleware.RequestID(ctx)),
    )

    log.Info("creating user", slog.String("email", req.Email))

    if err := s.store.Insert(ctx, req); err != nil {
        log.Error("failed to create user", slog.Any("error", err))
        return fmt.Errorf("create user: %w", err)
    }

    log.Info("user created successfully")
    return nil
}
```

### 日志级别——请始终如一地使用：

| 级别 | 用途 |
|---|---|
| `Debug` | 详细的诊断信息，在生产环境中禁用 |
| `Info` | 正常操作：收到请求、任务完成 |
| `Warn` | 可恢复的问题：重试成功、使用了已弃用功能 |
| `Error` | 需要关注的故障：数据库宕机、外部调用失败 |

对于预期内的情况，绝不要使用 Error 级别记录日志（例如，未找到用户 → Info 或 Warn）。

### 敏感数据——绝不要记录：

- 密码、令牌、API 密钥
- 完整的信用卡号、社会安全号码
- 包含个人身份信息的原始请求正文

```go
// ✅ Good — redacted
logger.Info("auth attempt", slog.String("user", email), slog.Bool("success", ok))

// ❌ Bad — leaks credentials
logger.Info("auth attempt", slog.String("password", password))
```

## 2. 使用 OpenTelemetry 进行分布式跟踪

### 初始化 tracer provider：

```go
func initTracer(ctx context.Context, serviceName string) (*trace.TracerProvider, error) {
    exporter, err := otlptrace.New(ctx, otlptracehttp.NewClient())
    if err != nil {
        return nil, fmt.Errorf("create exporter: %w", err)
    }

    tp := trace.NewTracerProvider(
        trace.WithBatcher(exporter),
        trace.WithResource(resource.NewWithAttributes(
            semconv.SchemaURL,
            semconv.ServiceNameKey.String(serviceName),
        )),
    )
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.TraceContext{})

    return tp, nil
}
```

### 为重要操作创建 span：

```go
func (s *UserService) GetUser(ctx context.Context, id string) (*User, error) {
    ctx, span := otel.Tracer("user-service").Start(ctx, "GetUser")
    defer span.End()

    span.SetAttributes(attribute.String("user.id", id))

    user, err := s.store.FindByID(ctx, id)
    if err != nil {
        span.RecordError(err)
        span.SetStatus(codes.Error, err.Error())
        return nil, fmt.Errorf("get user %s: %w", id, err)
    }

    return user, nil
}
```

### Span 命名约定：

```go
// ✅ Good — operation name, not function name
ctx, span := tracer.Start(ctx, "GetUser")
ctx, span := tracer.Start(ctx, "db.query")
ctx, span := tracer.Start(ctx, "http.request")

// ❌ Bad — too verbose or too generic
ctx, span := tracer.Start(ctx, "github.com/myorg/myapp/internal/user.(*Service).GetUser")
ctx, span := tracer.Start(ctx, "doStuff")
```

### 始终在调用链中传递上下文：

```go
// ✅ Good — context flows through
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context() // carries trace context from middleware
    user, err := h.service.GetUser(ctx, id)
    // ...
}

// ❌ Bad — trace context lost
func (h *Handler) GetUser(w http.ResponseWriter, r *http.Request) {
    user, err := h.service.GetUser(context.Background(), id) // breaks trace chain
    // ...
}
```

## 3. 使用 OpenTelemetry / Prometheus 采集指标

### 在包级别定义指标：

```go
var (
    requestDuration = promauto.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "Duration of HTTP requests in seconds.",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "path", "status"},
    )

    requestsTotal = promauto.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total number of HTTP requests.",
        },
        []string{"method", "path", "status"},
    )
)
```

### 指标命名约定：

```text
<namespace>_<subsystem>_<name>_<unit>

http_request_duration_seconds     ✅ (unit in name)
http_requests_total               ✅ (counter with _total suffix)
db_connections_active             ✅ (gauge, no suffix needed)
user_signups                      ❌ (missing _total for counter)
requestLatency                    ❌ (camelCase, no unit)
```

### 为 HTTP 中间件添加指标采集：

```go
func MetricsMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        start := time.Now()
        ww := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK}

        next.ServeHTTP(ww, r)

        duration := time.Since(start).Seconds()
        status := strconv.Itoa(ww.statusCode)

        requestDuration.WithLabelValues(r.Method, r.URL.Path, status).Observe(duration)
        requestsTotal.WithLabelValues(r.Method, r.URL.Path, status).Inc()
    })
}
```

### 延迟使用直方图，总数使用计数器，当前状态使用仪表：

| 类型 | 用途 | 示例 |
|---|---|---|
| 计数器 | 单调递增的值 | 请求总数、错误总数 |
| 仪表 | 可增可减的值 | 活跃连接数、队列深度 |
| 直方图 | 值的分布 | 请求延迟、响应大小 |

### 保持低基数——避免使用高基数标签：

```go
// ✅ Good — bounded label values
requestsTotal.WithLabelValues(r.Method, routePattern, status)

// ❌ Bad — unbounded cardinality (user IDs, request IDs)
requestsTotal.WithLabelValues(r.Method, r.URL.Path, userID)
```

## 4. 关联日志、追踪和指标

### 将追踪 ID 注入日志条目：

```go
func LogWithTrace(ctx context.Context, logger *slog.Logger) *slog.Logger {
    spanCtx := trace.SpanContextFromContext(ctx)
    if !spanCtx.IsValid() {
        return logger
    }
    return logger.With(
        slog.String("trace_id", spanCtx.TraceID().String()),
        slog.String("span_id", spanCtx.SpanID().String()),
    )
}

// Usage in handlers/services:
func (s *Service) Process(ctx context.Context) error {
    log := LogWithTrace(ctx, s.logger)
    log.Info("processing started") // log includes trace_id and span_id
    // ...
}
```

## 5. 遥测的优雅关闭

```go
func main() {
    ctx := context.Background()

    tp, err := initTracer(ctx, "my-service")
    if err != nil {
        log.Fatalf("init tracer: %v", err)
    }

    // Ensure all spans are flushed on shutdown
    defer func() {
        shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
        defer cancel()
        if err := tp.Shutdown(shutdownCtx); err != nil {
            log.Printf("tracer shutdown: %v", err)
        }
    }()

    // ... start server
}
```

## 验证清单

1. 所有日志记录均使用带结构化键值对的 `log/slog`，而不是 `fmt.Printf` 或 `log.Printf`
2. 日志记录器通过依赖注入，而不是作为全局变量使用
3. 日志输出中不包含敏感数据（密码、令牌、个人身份信息）
4. 追踪上下文通过 `context.Context` 在所有函数调用中传播
5. 为重要操作（数据库调用、HTTP 请求、业务逻辑）创建 Span
6. Span 使用 `span.RecordError(err)` 记录错误并设置错误状态
7. 指标遵循命名约定：`_seconds`、`_total`、`_bytes`
8. 指标中不使用高基数标签（用户 ID、请求 ID）
9. 服务退出时优雅关闭遥测提供程序
10. 日志条目中包含追踪 ID，以便进行关联