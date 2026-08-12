---
name: domain-web
description: "Use when building web services. Keywords: web server, HTTP, REST API, GraphQL, WebSocket, axum, actix, warp, rocket, tower, hyper, reqwest, middleware, router, handler, extractor, state management, authentication, authorization, JWT, session, cookie, CORS, rate limiting, web 开发, HTTP 服务, API 设计, 中间件, 路由"
globs: ["**/Cargo.toml"]
user-invocable: false
---
# Web 领域

> **第 3 层：领域约束**

## 领域约束 → 设计影响

| 领域规则 | 设计约束 | Rust 影响 |
|-------------|-------------------|------------------|
| 无状态 HTTP | 不使用请求局部的全局变量 | 状态存放在提取器中 |
| 并发 | 处理大量连接 | 异步、Send + Sync |
| 延迟 SLA | 快速响应 | 高效的所有权管理 |
| 安全性 | 输入验证 | 类型安全的提取器 |
| 可观测性 | 请求追踪 | tracing + tower 层 |

---

## 关键约束

### 默认异步

```
RULE: Web handlers must not block
WHY: Block one task = block many requests
RUST: async/await, spawn_blocking for CPU work
```

### 状态管理

```
RULE: Shared state must be thread-safe
WHY: Handlers run on any thread
RUST: Arc<T>, Arc<RwLock<T>> for mutable
```

### 请求生命周期

```
RULE: Resources live only for request duration
WHY: Memory management, no leaks
RUST: Extractors, proper ownership
```

---

## 向下追溯 ↓

从约束到设计（第 2 层）：

```
"Need shared application state"
    ↓ m07-concurrency: Use Arc for thread-safe sharing
    ↓ m02-resource: Arc<RwLock<T>> for mutable state

"Need request validation"
    ↓ m05-type-driven: Validated extractors
    ↓ m06-error-handling: IntoResponse for errors

"Need middleware stack"
    ↓ m12-lifecycle: Tower layers
    ↓ m04-zero-cost: Trait-based composition
```

---

## 框架比较

| 框架 | 风格 | 最适合 |
|-----------|-------|----------|
| axum | 函数式、tower | 现代 API |
| actix-web | 基于 Actor | 高性能 |
| warp | 过滤器组合 | 可组合的 API |
| rocket | 宏驱动 | 快速开发 |

## 关键 Crate

| 用途 | Crate |
|---------|-------|
| HTTP 服务器 | axum, actix-web |
| HTTP 客户端 | reqwest |
| JSON | serde_json |
| 身份认证/JWT | jsonwebtoken |
| 会话 | tower-sessions |
| 数据库 | sqlx, diesel |
| 中间件 | tower |

## 设计模式

| 模式 | 用途 | 实现 |
|---------|---------|----------------|
| 提取器 | 请求解析 | `State(db)`, `Json(payload)` |
| 错误响应 | 统一错误 | `impl IntoResponse` |
| 中间件 | 横切关注点 | Tower 层 |
| 共享状态 | 应用配置 | `Arc<AppState>` |

## 代码模式：Axum 处理器

```rust
async fn handler(
    State(db): State<Arc<DbPool>>,
    Json(payload): Json<CreateUser>,
) -> Result<Json<User>, AppError> {
    let user = db.create_user(&payload).await?;
    Ok(Json(user))
}

// Error handling
impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, message) = match self {
            Self::NotFound => (StatusCode::NOT_FOUND, "Not found"),
            Self::Internal(_) => (StatusCode::INTERNAL_SERVER_ERROR, "Internal error"),
        };
        (status, Json(json!({"error": message}))).into_response()
    }
}
```

---

## 常见错误

| 错误 | 违反的领域约束 | 修复方法 |
|---------|-----------------|-----|
| 在处理器中执行阻塞操作 | 延迟激增 | spawn_blocking |
| 在状态中使用 Rc | 不满足 Send + Sync | 使用 Arc |
| 未进行验证 | 安全风险 | 类型安全的提取器 |
| 无错误响应 | 用户体验不佳 | IntoResponse 实现 |

---

## 追溯至第 1 层

| 约束 | 第 2 层模式 | 第 1 层实现 |
|------------|-----------------|------------------------|
| 异步处理器 | Async/await | tokio 运行时 |
| 线程安全状态 | 共享状态 | Arc<T>、Arc<RwLock<T>> |
| 请求生命周期 | 提取器 | 通过 From<Request> 实现所有权 |
| 中间件 | Tower 层 | 基于 Trait 的组合 |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 异步模式 | m07-concurrency |
| 状态管理 | m02-resource |
| 错误处理 | m06-error-handling |
| 中间件设计 | m12-lifecycle |