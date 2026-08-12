---
name: domain-cloud-native
description: "Use when building cloud-native apps. Keywords: kubernetes, k8s, docker, container, grpc, tonic, microservice, service mesh, observability, tracing, metrics, health check, cloud, deployment, 云原生, 微服务, 容器"
user-invocable: false
---
# 云原生领域

> **第 3 层：领域约束**

## 领域约束 → 设计影响

| 领域规则 | 设计约束 | Rust 影响 |
|-------------|-------------------|------------------|
| 十二要素 | 从环境中获取配置 | 基于环境的配置 |
| 可观测性 | 指标 + 追踪 | tracing + opentelemetry |
| 健康检查 | 存活/就绪 | 专用端点 |
| 优雅关闭 | 干净终止 | 信号处理 |
| 水平扩展 | 无状态设计 | 无本地状态 |
| 容器友好 | 小型二进制文件 | 发布版本优化 |

---

## 关键约束

### 无状态设计

```
RULE: No local persistent state
WHY: Pods can be killed/rescheduled anytime
RUST: External state (Redis, DB), no static mut
```

### 优雅关闭

```
RULE: Handle SIGTERM, drain connections
WHY: Zero-downtime deployments
RUST: tokio::signal + graceful shutdown
```

### 可观测性

```
RULE: Every request must be traceable
WHY: Debugging distributed systems
RUST: tracing spans, opentelemetry export
```

---

## 向下追溯 ↓

从约束到设计（第 2 层）：

```
"Need distributed tracing"
    ↓ m12-lifecycle: Span lifecycle
    ↓ tracing + opentelemetry

"Need graceful shutdown"
    ↓ m07-concurrency: Signal handling
    ↓ m12-lifecycle: Connection draining

"Need health checks"
    ↓ domain-web: HTTP endpoints
    ↓ m06-error-handling: Health status
```

---

## 关键 Crate

| 用途 | Crate |
|---------|-------|
| gRPC | tonic |
| Kubernetes | kube, kube-runtime |
| Docker | bollard |
| 追踪 | tracing, opentelemetry |
| 指标 | prometheus, metrics |
| 配置 | config, figment |
| 健康检查 | HTTP 端点 |

## 设计模式

| 模式 | 用途 | 实现 |
|---------|---------|----------------|
| gRPC 服务 | 服务网格 | tonic + tower |
| K8s Operator | 自定义资源 | kube-runtime Controller |
| 可观测性 | 调试 | tracing + OTEL |
| 健康检查 | 编排 | `/health`, `/ready` |
| 配置 | 十二要素 | 环境变量 + 密钥 |

## 代码模式：优雅关闭

```rust
use tokio::signal;

async fn run_server() -> anyhow::Result<()> {
    let app = Router::new()
        .route("/health", get(health))
        .route("/ready", get(ready));

    let addr = SocketAddr::from(([0, 0, 0, 0], 8080));

    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .with_graceful_shutdown(shutdown_signal())
        .await?;

    Ok(())
}

async fn shutdown_signal() {
    signal::ctrl_c().await.expect("failed to listen for ctrl+c");
    tracing::info!("shutdown signal received");
}
```

## 健康检查模式

```rust
async fn health() -> StatusCode {
    StatusCode::OK
}

async fn ready(State(db): State<Arc<DbPool>>) -> StatusCode {
    match db.ping().await {
        Ok(_) => StatusCode::OK,
        Err(_) => StatusCode::SERVICE_UNAVAILABLE,
    }
}
```

---

## 常见错误

| 错误 | 领域约束违反情况 | 修复方式 |
|---------|-----------------|-----|
| 本地文件状态 | 非无状态 | 外部存储 |
| 未处理 SIGTERM | 强制终止 | 优雅关闭 |
| 无追踪 | 无法调试 | tracing span |
| 静态配置 | 不符合十二要素 | 环境变量 |

---

## 追溯到第 1 层

| 约束 | 第 2 层模式 | 第 1 层实现 |
|------------|-----------------|------------------------|
| 无状态 | 外部状态 | 外部使用 Arc<Client> |
| 优雅关闭 | 信号处理 | tokio::signal |
| 链路追踪 | Span 生命周期 | tracing + OTEL |
| 健康检查 | HTTP 端点 | 专用路由 |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 异步模式 | m07-concurrency |
| HTTP 端点 | domain-web |
| 错误处理 | m13-domain-error |
| 资源生命周期 | m12-lifecycle |