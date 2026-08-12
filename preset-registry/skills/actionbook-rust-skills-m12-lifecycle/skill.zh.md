---
name: m12-lifecycle
description: "Use when designing resource lifecycles. Keywords: RAII, Drop, resource lifecycle, connection pool, lazy initialization, connection pool design, resource cleanup patterns, cleanup, scope, OnceCell, Lazy, once_cell, OnceLock, transaction, session management, when is Drop called, cleanup on error, guard pattern, scope guard, 资源生命周期, 连接池, 惰性初始化, 资源清理, RAII 模式"
user-invocable: false
---
# 资源生命周期

> **第 2 层：设计选择**

## 核心问题

**应当何时创建、使用和清理此资源？**

在实现生命周期之前：
- 资源的作用域是什么？
- 谁负责清理？
- 发生错误时会怎样？

---

## 生命周期模式 → 实现

| 模式 | 适用时机 | 实现 |
|---------|------|----------------|
| RAII | 自动清理 | `Drop` trait |
| 延迟初始化 | 延后创建 | `OnceLock`, `LazyLock` |
| 池 | 复用高成本资源 | `r2d2`, `deadpool` |
| 守卫 | 作用域内访问 | `MutexGuard` 模式 |
| 作用域 | 事务边界 | 自定义结构体 + Drop |

---

## 思考提示

在设计生命周期之前：

1. **资源成本是多少？**
   - 低成本 → 每次使用时创建
   - 高成本 → 使用池或缓存
   - 全局资源 → 延迟初始化的单例

2. **作用域是什么？**
   - 函数局部 → 栈分配
   - 请求级 → 传递或提取
   - 应用级 → static 或 Arc

3. **如何处理错误？**
   - 必须清理 → Drop
   - 清理可选 → 显式关闭
   - 清理可能失败 → 从 close 返回 Result

---

## 向上追溯 ↑

追溯到领域约束（第 3 层）：

```
"How should I manage database connections?"
    ↑ Ask: What's the connection cost?
    ↑ Check: domain-* (latency requirements)
    ↑ Check: Infrastructure (connection limits)
```

| 问题 | 追溯到 | 询问 |
|----------|----------|-----|
| 连接池 | domain-* | 可接受的延迟是多少？ |
| 资源限制 | domain-* | 基础设施约束是什么？ |
| 事务作用域 | domain-* | 哪些操作必须具有原子性？ |

---

## 向下追溯 ↓

追溯到实现（第 1 层）：

```
"Need automatic cleanup"
    ↓ m02-resource: Implement Drop
    ↓ m01-ownership: Clear owner for cleanup

"Need lazy initialization"
    ↓ m03-mutability: OnceLock for thread-safe
    ↓ m07-concurrency: LazyLock for sync

"Need connection pool"
    ↓ m07-concurrency: Thread-safe pool
    ↓ m02-resource: Arc for sharing
```

---

## 快速参考

| 模式 | 类型 | 使用场景 |
|---------|------|----------|
| RAII | `Drop` trait | 退出作用域时自动清理 |
| 延迟初始化 | `OnceLock`, `LazyLock` | 延后初始化 |
| 池 | `r2d2`, `deadpool` | 连接复用 |
| 守卫 | `MutexGuard` | 在作用域结束时释放锁 |
| 作用域 | 自定义结构体 | 事务边界 |

## 生命周期事件

| 事件 | Rust 机制 |
|-------|----------------|
| 创建 | `new()`, `Default` |
| 延迟初始化 | `OnceLock::get_or_init` |
| 使用 | `&self`, `&mut self` |
| 清理 | `Drop::drop()` |

## 模式模板

### RAII 守卫

```rust
struct FileGuard {
    path: PathBuf,
    _handle: File,
}

impl Drop for FileGuard {
    fn drop(&mut self) {
        // Cleanup: remove temp file
        let _ = std::fs::remove_file(&self.path);
    }
}
```

### 延迟初始化的单例

```rust
use std::sync::OnceLock;

static CONFIG: OnceLock<Config> = OnceLock::new();

fn get_config() -> &'static Config {
    CONFIG.get_or_init(|| {
        Config::load().expect("config required")
    })
}
```

---

## 常见错误

| 错误 | 原因 | 修复方法 |
|-------|-------|-----|
| 资源泄漏 | 忘记实现 Drop | 实现 Drop 或使用 RAII 包装器 |
| 重复释放 | 手动管理内存 | 交由 Rust 处理 |
| 释放后使用 | 悬垂引用 | 检查生命周期 |
| E0509 从实现了 Drop 的类型中移出 | 移动拥有所有权的字段 | `Option::take()` |
| 池耗尽 | 资源未归还 | 确保 Drop 会归还资源 |

---

## 反模式

| 反模式 | 不良原因 | 更好的做法 |
|--------------|---------|--------|
| 手动清理 | 容易忘记 | RAII/Drop |
| `lazy_static!` | 外部依赖 | `std::sync::OnceLock` |
| 全局可变状态 | 线程不安全 | `OnceLock` 或适当的同步机制 |
| 忘记关闭 | 资源泄漏 | Drop 实现 |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 智能指针 | m02-resource |
| 线程安全初始化 | m07-concurrency |
| 领域作用域 | m09-domain |
| 清理过程中的错误 | m06-error-handling |