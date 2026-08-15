---
name: go-api-design
description: >
  REST and gRPC API design patterns for Go services. Covers HTTP handlers,
  middleware, routing, request/response patterns, versioning, pagination,
  graceful shutdown, and OpenAPI documentation.
  Use when designing APIs, writing HTTP handlers, implementing middleware,
  structuring REST endpoints, or setting up gRPC services.
  Trigger examples: "design API", "REST endpoints", "HTTP handler",
  "middleware pattern", "graceful shutdown", "gRPC service", "API versioning".
  Do NOT use for general architecture (use go-architecture-review) or
  concurrency in handlers (use go-concurrency-review).
license: MIT
metadata:
  version: "1.0.0"
---
# Go API 设计

API 是契约。一旦发布，就意味着承诺。设计 API 时，应假设你将维护它们十年——因为很可能确实如此。

## 1. HTTP 处理器结构

### 使用标准的 `http.Handler` 接口：

```go
// ✅ Good — method on a struct with dependencies
type UserHandler struct {
    store  UserStore
    logger *slog.Logger
}

func (h *UserHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
    switch r.Method {
    case http.MethodGet:
        h.handleGet(w, r)
    case http.MethodPost:
        h.handleCreate(w, r)
    default:
        http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
    }
}
```

### 处理器函数签名模式：

```go
// Handler methods return nothing — they write directly to ResponseWriter.
// Errors are handled inside the handler, not returned.
func (h *UserHandler) handleGet(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()

    id := chi.URLParam(r, "id") // or mux.Vars(r)["id"]
    if id == "" {
        h.respondError(w, http.StatusBadRequest, "missing user id")
        return
    }

    user, err := h.store.GetByID(ctx, id)
    if err != nil {
        if errors.Is(err, ErrNotFound) {
            h.respondError(w, http.StatusNotFound, "user not found")
            return
        }
        h.logger.Error("get user", slog.Any("error", err))
        h.respondError(w, http.StatusInternalServerError, "internal error")
        return
    }

    h.respondJSON(w, http.StatusOK, user)
}
```

### JSON 响应辅助函数：

```go
func (h *UserHandler) respondJSON(w http.ResponseWriter, status int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(status)
    if err := json.NewEncoder(w).Encode(data); err != nil {
        h.logger.Error("encode response", slog.Any("error", err))
    }
}

func (h *UserHandler) respondError(w http.ResponseWriter, status int, msg string) {
    h.respondJSON(w, status, map[string]string{"error": msg})
}
```

## 2. 中间件模式

中间件用于包装处理器。使用标准的 `func(http.Handler) http.Handler` 签名：

```go
func RequestID(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        id := r.Header.Get("X-Request-ID")
        if id == "" {
            id = uuid.New().String()
        }
        ctx := context.WithValue(r.Context(), requestIDKey, id)
        w.Header().Set("X-Request-ID", id)
        next.ServeHTTP(w, r.WithContext(ctx))
    })
}

func Recoverer(logger *slog.Logger) func(http.Handler) http.Handler {
    return func(next http.Handler) http.Handler {
        return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
            defer func() {
                if rec := recover(); rec != nil {
                    logger.Error("panic recovered",
                        slog.Any("panic", rec),
                        slog.String("stack", string(debug.Stack())),
                    )
                    http.Error(w, "internal server error", http.StatusInternalServerError)
                }
            }()
            next.ServeHTTP(w, r)
        })
    }
}
```

### 中间件顺序（从外到内）：

```text
Recoverer → RequestID → Logger → Auth → RateLimit → Handler
```

Recover 必须位于最外层。Auth 必须位于业务逻辑之前。Logger 负责记录耗时。

## 3. 请求验证

### 一步完成解码和验证：

```go
type CreateUserRequest struct {
    Name  string `json:"name"  validate:"required,min=2,max=100"`
    Email string `json:"email" validate:"required,email"`
}

func decodeAndValidate[T any](r *http.Request) (T, error) {
    var req T
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        return req, fmt.Errorf("decode: %w", err)
    }
    if err := validate.Struct(req); err != nil {
        return req, fmt.Errorf("validate: %w", err)
    }
    return req, nil
}
```

### 限制请求体大小：

```go
r.Body = http.MaxBytesReader(w, r.Body, 1<<20) // 1 MB
```

## 4. URL 和命名约定

```text
GET    /api/v1/users          → list users
POST   /api/v1/users          → create user
GET    /api/v1/users/{id}     → get user
PUT    /api/v1/users/{id}     → replace user
PATCH  /api/v1/users/{id}     → partial update
DELETE /api/v1/users/{id}     → delete user

GET    /api/v1/users/{id}/orders → list user orders (nested resource)
```

规则：
- 资源使用复数名词：`/users`，而不是 `/user`
- 多单词路径使用短横线命名法：`/order-items`
- JSON 字段使用驼峰命名法：`"createdAt"`、`"firstName"`
- 在 URL 路径中指定版本：`/api/v1/...`
- URL 中不使用动词：`/users/search?q=alice`，而不是 `/searchUsers`

## 5. 分页

```go
type PageRequest struct {
    Cursor string `json:"cursor"`
    Limit  int    `json:"limit"`
}

type PageResponse[T any] struct {
    Items      []T    `json:"items"`
    NextCursor string `json:"next_cursor,omitempty"`
    HasMore    bool   `json:"has_more"`
}
```

对于大型数据集，优先使用基于游标的分页，而不是 offset/limit。
在并发写入时，偏移量分页会失效。

## 6. 优雅关闭

```go
func main() {
    srv := &http.Server{
        Addr:         ":8080",
        Handler:      router,
        ReadTimeout:  5 * time.Second,
        WriteTimeout: 10 * time.Second,
        IdleTimeout:  120 * time.Second,
    }

    // Start server
    go func() {
        if err := srv.ListenAndServe(); err != http.ErrServerClosed {
            log.Fatalf("server error: %v", err)
        }
    }()

    // Wait for interrupt
    quit := make(chan os.Signal, 1)
    signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
    <-quit

    // Graceful shutdown with timeout
    ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
    defer cancel()

    if err := srv.Shutdown(ctx); err != nil {
        log.Fatalf("shutdown error: %v", err)
    }
    log.Println("server stopped gracefully")
}
```

程序应仅在 `main()` 中退出，并且最好最多退出一次。

## 7. 健康检查端点

```go
// Liveness: is the process alive?
// GET /healthz → 200 OK

// Readiness: can the process serve traffic?
// GET /readyz → 200 OK or 503 Service Unavailable
func (h *HealthHandler) handleReady(w http.ResponseWriter, r *http.Request) {
    if err := h.db.PingContext(r.Context()); err != nil {
        h.respondError(w, http.StatusServiceUnavailable, "database unavailable")
        return
    }
    h.respondJSON(w, http.StatusOK, map[string]string{"status": "ready"})
}
```

## 8. 错误响应格式

在整个 API 中保持一致的错误响应：

```json
{
    "error": {
        "code": "VALIDATION_ERROR",
        "message": "invalid request parameters",
        "details": [
            {"field": "email", "message": "must be a valid email"}
        ]
    }
}
```

在处理程序边界处将内部错误映射到 HTTP 状态码。
内部错误绝不应泄露给客户端。