---
name: m13-domain-error
description: "Use when designing domain error handling. Keywords: domain error, error categorization, recovery strategy, retry, fallback, domain error hierarchy, user-facing vs internal errors, error code design, circuit breaker, graceful degradation, resilience, error context, backoff, retry with backoff, error recovery, transient vs permanent error, 领域错误, 错误分类, 恢复策略, 重试, 熔断器, 优雅降级"
user-invocable: false
---
# 领域错误策略

> **第 2 层：设计选择**

## 核心问题

**谁需要处理此错误，以及他们应该如何恢复？**

在设计错误类型之前：
- 这是面向用户的错误还是内部错误？
- 是否可以恢复？
- 调试需要哪些上下文？

---

## 错误分类

| 错误类型 | 受众 | 恢复方式 | 示例 |
|------------|----------|----------|---------|
| 面向用户 | 最终用户 | 引导操作 | `InvalidEmail`, `NotFound` |
| 内部 | 开发者 | 调试信息 | `DatabaseError`, `ParseError` |
| 系统 | 运维/SRE | 监控/告警 | `ConnectionTimeout`, `RateLimited` |
| 暂时性 | 自动化系统 | 重试 | `NetworkError`, `ServiceUnavailable` |
| 永久性 | 人工处理 | 调查 | `ConfigInvalid`, `DataCorrupted` |

---

## 思考提示

在设计错误类型之前：

1. **谁会看到此错误？**
   - 最终用户 → 友好的消息、可采取行动
   - 开发者 → 详细、可调试
   - 运维 → 结构化、可告警

2. **我们能否恢复？**
   - 暂时性 → 使用退避策略重试
   - 可降级 → 使用回退值
   - 永久性 → 快速失败并告警

3. **需要哪些上下文？**
   - 调用链 → anyhow::Context
   - 请求 ID → 结构化日志
   - 输入数据 → 错误载荷

---

## 向上追溯 ↑

追溯到领域约束（第 3 层）：

```
"How should I handle payment failures?"
    ↑ Ask: What are the business rules for retries?
    ↑ Check: domain-fintech (transaction requirements)
    ↑ Check: SLA (availability requirements)
```

| 问题 | 追溯至 | 询问 |
|----------|----------|-----|
| 重试策略 | domain-* | 可接受的重试延迟是多少？ |
| 用户体验 | domain-* | 用户应该看到什么消息？ |
| 合规性 | domain-* | 必须记录哪些内容以供审计？ |

---

## 向下追溯 ↓

追溯到实现（第 1 层）：

```
"Need typed errors"
    ↓ m06-error-handling: thiserror for library
    ↓ m04-zero-cost: Error enum design

"Need error context"
    ↓ m06-error-handling: anyhow::Context
    ↓ Logging: tracing with fields

"Need retry logic"
    ↓ m07-concurrency: async retry patterns
    ↓ Crates: tokio-retry, backoff
```

---

## 快速参考

| 恢复模式 | 适用场景 | 实现 |
|------------------|------|----------------|
| 重试 | 暂时性故障 | 指数退避 |
| 回退 | 降级模式 | 缓存值/默认值 |
| 熔断器 | 级联故障 | failsafe-rs |
| 超时 | 缓慢操作 | `tokio::time::timeout` |
| 舱壁隔离 | 隔离 | 独立线程池 |

## 错误层次结构

```rust
#[derive(thiserror::Error, Debug)]
pub enum AppError {
    // User-facing
    #[error("Invalid input: {0}")]
    Validation(String),

    // Transient (retryable)
    #[error("Service temporarily unavailable")]
    ServiceUnavailable(#[source] reqwest::Error),

    // Internal (log details, show generic)
    #[error("Internal error")]
    Internal(#[source] anyhow::Error),
}

impl AppError {
    pub fn is_retryable(&self) -> bool {
        matches!(self, Self::ServiceUnavailable(_))
    }
}
```

## 重试模式

```rust
use tokio_retry::{Retry, strategy::ExponentialBackoff};

async fn with_retry<F, T, E>(f: F) -> Result<T, E>
where
    F: Fn() -> impl Future<Output = Result<T, E>>,
    E: std::fmt::Debug,
{
    let strategy = ExponentialBackoff::from_millis(100)
        .max_delay(Duration::from_secs(10))
        .take(5);

    Retry::spawn(strategy, || f()).await
}
```

---

## 常见错误

| 错误 | 错误原因 | 更好的做法 |
|---------|-----------|--------|
| 对所有情况使用相同错误 | 缺乏可操作性 | 按受众分类 |
| 对所有错误都重试 | 浪费资源 | 仅重试暂时性错误 |
| 无限重试 | 对自身造成 DoS | 最大尝试次数 + 退避 |
| 暴露内部错误 | 安全风险 | 使用用户友好的消息 |
| 缺少上下文 | 难以调试 | 在所有位置使用 .context() |

---

## 反模式

| 反模式 | 不良原因 | 更好的做法 |
|--------------|---------|--------|
| 字符串错误 | 缺乏结构 | thiserror 类型 |
| 对可恢复错误使用 panic! | 用户体验差 | 使用包含上下文的 Result |
| 忽略错误 | 静默失败 | 记录日志或向上传播 |
| 到处使用 Box<dyn Error> | 丢失类型信息 | thiserror |
| 在正常路径中处理错误 | 影响性能 | 提前验证 |

---

## 相关技能

| 适用场景 | 参阅 |
|------|-----|
| 错误处理基础 | m06-error-handling |
| 重试实现 | m07-concurrency |
| 领域建模 | m09-domain |
| 面向用户的 API | domain-* |