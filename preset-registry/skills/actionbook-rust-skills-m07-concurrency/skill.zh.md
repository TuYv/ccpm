---
name: m07-concurrency
description: "CRITICAL: Use for concurrency/async. Triggers: E0277 Send Sync, cannot be sent between threads, thread, spawn, channel, mpsc, Mutex, RwLock, Atomic, async, await, Future, tokio, deadlock, race condition, 并发, 线程, 异步, 死锁"
user-invocable: false
---
# 并发

> **第一层：语言机制**

## 核心问题

**这是 CPU 密集型还是 I/O 密集型任务，共享模型是什么？**

在选择并发原语之前：
- 工作负载是什么类型？
- 需要共享哪些数据？
- 线程安全要求是什么？

---

## 错误 → 设计问题

| 错误 | 不要只说 | 而要问 |
|-------|----------------|-------------|
| E0277 Send | “添加 Send 约束” | 这个类型应该跨线程传递吗？ |
| E0277 Sync | “用 Mutex 包装” | 真的需要共享访问吗？ |
| Future not Send | “使用 spawn_local” | async 是正确的选择吗？ |
| 死锁 | “重新排列锁的顺序” | 锁设计是否正确？ |

---

## 思考提示

在添加并发之前：

1. **工作负载是什么？**
   - CPU 密集型 → 线程（std::thread、rayon）
   - I/O 密集型 → async（tokio、async-std）
   - 混合型 → 混合方案

2. **共享模型是什么？**
   - 不共享 → 消息传递（通道）
   - 不可变共享 → Arc<T>
   - 可变共享 → Arc<Mutex<T>> 或 Arc<RwLock<T>>

3. **Send/Sync 要求是什么？**
   - 跨线程所有权转移 → Send
   - 跨线程引用 → Sync
   - 单线程 async → spawn_local

---

## 向上追溯 ↑（强制）

**关键**：不要只修复错误。向上追溯以找出领域约束。

### 领域检测表

| 上下文关键词 | 加载领域 Skill | 关键约束 |
|-----------------|-------------------|----------------|
| Web API、HTTP、axum、actix、handler | **domain-web** | 处理器可能在任意线程上运行 |
| 交易、支付、trading、payment | **domain-fintech** | 审计 + 线程安全 |
| gRPC、kubernetes、microservice | **domain-cloud-native** | 分布式追踪 |
| CLI、terminal、clap | **domain-cli** | 通常使用单线程即可 |

### 示例：Web API + Rc 错误

```
"Rc cannot be sent between threads" in Web API context
    ↑ DETECT: "Web API" → Load domain-web
    ↑ FIND: domain-web says "Shared state must be thread-safe"
    ↑ FIND: domain-web says "Rc in state" is Common Mistake
    ↓ DESIGN: Use Arc<T> with State extractor
    ↓ IMPL: axum::extract::State<Arc<AppConfig>>
```

### 通用追溯

```
"Send not satisfied for my type"
    ↑ Ask: What domain is this? Load domain-* skill
    ↑ Ask: Does this type need to cross thread boundaries?
    ↑ Check: m09-domain (is the data model correct?)
```

| 情况 | 追溯至 | 问题 |
|-----------|----------|----------|
| Web 中的 Send/Sync | **domain-web** | 状态管理模式是什么？ |
| CLI 中的 Send/Sync | **domain-cli** | 真的需要多线程吗？ |
| Mutex 与通道的选择 | m09-domain | 应该使用共享状态还是消息传递？ |
| async 与线程的选择 | m10-performance | 工作负载特征是什么？ |

---

## 向下追溯 ↓

从设计到实现：

```
"Need parallelism for CPU work"
    ↓ Use: std::thread or rayon

"Need concurrency for I/O"
    ↓ Use: async/await with tokio

"Need to share immutable data across threads"
    ↓ Use: Arc<T>

"Need to share mutable data across threads"
    ↓ Use: Arc<Mutex<T>> or Arc<RwLock<T>>
    ↓ Or: channels for message passing

"Need simple atomic operations"
    ↓ Use: AtomicBool, AtomicUsize, etc.
```

---

## Send/Sync 标记

| 标记 | 含义 | 示例 |
|--------|---------|---------|
| `Send` | 可以在线程之间转移所有权 | 大多数类型 |
| `Sync` | 可以在线程之间共享引用 | `Arc<T>` |
| `!Send` | 必须保留在单个线程上 | `Rc<T>` |
| `!Sync` | 不允许跨线程共享引用 | `RefCell<T>` |

## 快速参考

| 模式 | 线程安全 | 阻塞 | 适用场景 |
|---------|-------------|----------|----------|
| `std::thread` | 是 | 是 | CPU 密集型并行计算 |
| `async/await` | 是 | 否 | I/O 密集型并发 |
| `Mutex<T>` | 是 | 是 | 共享可变状态 |
| `RwLock<T>` | 是 | 是 | 以读取为主的共享状态 |
| `mpsc::channel` | 是 | 可选 | 消息传递 |
| `Arc<Mutex<T>>` | 是 | 是 | 跨线程共享可变状态 |

## 决策流程图

```
What type of work?
├─ CPU-bound → std::thread or rayon
├─ I/O-bound → async/await
└─ Mixed → hybrid (spawn_blocking)

Need to share data?
├─ No → message passing (channels)
├─ Immutable → Arc<T>
└─ Mutable →
   ├─ Read-heavy → Arc<RwLock<T>>
   └─ Write-heavy → Arc<Mutex<T>>
   └─ Simple counter → AtomicUsize

Async context?
├─ Type is Send → tokio::spawn
├─ Type is !Send → spawn_local
└─ Blocking code → spawn_blocking
```

---

## 常见错误

| 错误 | 原因 | 修复方法 |
|-------|-------|-----|
| E0277 `Send` not satisfied | 异步代码中存在非 Send 类型 | 使用 Arc 或 spawn_local |
| E0277 `Sync` not satisfied | 共享了非 Sync 类型 | 使用 Mutex 包装 |
| Deadlock | 锁的获取顺序 | 保持一致的锁获取顺序 |
| `future is not Send` | 非 Send 类型跨越 await | 在 await 前将其丢弃 |
| `MutexGuard` across await | 挂起期间仍持有 Guard | 正确限定 Guard 的作用域 |

---

## 反模式

| 反模式 | 不良原因 | 更好的做法 |
|--------------|---------|--------|
| Arc<Mutex<T>> everywhere | 争用、复杂性 | 消息传递 |
| thread::sleep in async | 阻塞执行器 | tokio::time::sleep |
| Holding locks across await | 阻塞其他任务 | 严格限定锁的作用域 |
| Ignoring deadlock risk | 难以调试 | 规定锁顺序、使用 try_lock |

---

## 异步专用模式

### 避免 MutexGuard 跨越 Await

```rust
// Bad: guard held across await
let guard = mutex.lock().await;
do_async().await;  // guard still held!

// Good: scope the lock
{
    let guard = mutex.lock().await;
    // use guard
}  // guard dropped
do_async().await;
```

### 异步代码中的非 Send 类型

```rust
// Rc is !Send, can't cross await in spawned task
// Option 1: use Arc instead
// Option 2: use spawn_local (single-thread runtime)
// Option 3: ensure Rc is dropped before .await
```

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 智能指针选择 | m02-resource |
| 内部可变性 | m03-mutability |
| 性能调优 | m10-performance |
| 特定领域的并发需求 | domain-* |