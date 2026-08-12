---
name: m03-mutability
description: "CRITICAL: Use for mutability issues. Triggers: E0596, E0499, E0502, cannot borrow as mutable, already borrowed as immutable, mut, &mut, interior mutability, Cell, RefCell, Mutex, RwLock, 可变性, 内部可变性, 借用冲突"
user-invocable: false
---
# 可变性

> **第 1 层：语言机制**

## 核心问题

**为什么这些数据需要改变，谁可以改变它？**

在引入内部可变性之前，先弄清楚：
- 修改是必不可少的，还是意外引入的复杂性？
- 谁应该控制修改？
- 修改模式是否安全？

---

## 错误 → 设计问题

| 错误 | 不要只说 | 而应询问 |
|-------|----------------|-------------|
| E0596 | “添加 mut” | 这真的应该是可变的吗？ |
| E0499 | “拆分借用” | 数据结构设计得合理吗？ |
| E0502 | “分隔作用域” | 为什么两种借用都需要？ |
| RefCell 恐慌 | “使用 try_borrow” | 运行时检查合适吗？ |

---

## 思考提示

在引入可变性之前：

1. **修改是必要的吗？**
   - 也许可以转换 → 返回新值
   - 也许可以使用构建器 → 以不可变方式构造

2. **谁控制修改？**
   - 外部调用者 → `&mut T`
   - 内部逻辑 → 内部可变性
   - 并发访问 → 同步可变性

3. **线程上下文是什么？**
   - 单线程 → Cell/RefCell
   - 多线程 → Mutex/RwLock/Atomic

---

## 向上追溯 ↑

当可变性冲突持续存在时：

```
E0499/E0502 (borrow conflicts)
    ↑ Ask: Is the data structure designed correctly?
    ↑ Check: m09-domain (should data be split?)
    ↑ Check: m07-concurrency (is async involved?)
```

| 持续出现的错误 | 追溯至 | 问题 |
|-----------------|----------|----------|
| 反复出现借用冲突 | m09-domain | 是否应该重构数据？ |
| 在 async 中使用 RefCell | m07-concurrency | 是否需要 Send/Sync？ |
| Mutex 死锁 | m07-concurrency | 锁的设计合理吗？ |

---

## 向下追溯 ↓

从设计到实现：

```
"Need mutable access from &self"
    ↓ T: Copy → Cell<T>
    ↓ T: !Copy → RefCell<T>

"Need thread-safe mutation"
    ↓ Simple counters → AtomicXxx
    ↓ Complex data → Mutex<T> or RwLock<T>

"Need shared mutable state"
    ↓ Single-thread: Rc<RefCell<T>>
    ↓ Multi-thread: Arc<Mutex<T>>
```

---

## 借用规则

```
At any time, you can have EITHER:
├─ Multiple &T (immutable borrows)
└─ OR one &mut T (mutable borrow)

Never both simultaneously.
```

## 快速参考

| 模式 | 线程安全 | 运行时成本 | 适用场景 |
|---------|-------------|--------------|----------|
| `&mut T` | 不适用 | 零 | 独占可变访问 |
| `Cell<T>` | 否 | 零 | Copy 类型，且不需要引用 |
| `RefCell<T>` | 否 | 运行时检查 | 非 Copy 类型，需要运行时借用 |
| `Mutex<T>` | 是 | 锁竞争 | 线程安全的修改 |
| `RwLock<T>` | 是 | 锁竞争 | 读者多、写者少 |
| `Atomic*` | 是 | 极低 | 简单类型（bool、usize） |

## 错误代码参考

| 错误 | 原因 | 快速修复 |
|-------|-------|-----------|
| E0596 | 将不可变对象作为可变对象借用 | 添加 `mut` 或重新设计 |
| E0499 | 存在多个可变借用 | 重构代码流程 |
| E0502 | 存在 & 借用时进行 &mut 借用 | 分隔借用作用域 |

---

## 内部可变性决策

| 场景 | 选择 |
|----------|--------|
| T: Copy，单线程 | `Cell<T>` |
| T: !Copy，单线程 | `RefCell<T>` |
| T: Copy，多线程 | `AtomicXxx` |
| T: !Copy，多线程 | `Mutex<T>` 或 `RwLock<T>` |
| 读取密集型，多线程 | `RwLock<T>` |
| 简单的标志位/计数器 | `AtomicBool`、`AtomicUsize` |

---

## 反模式

| 反模式 | 不良原因 | 更好的做法 |
|--------------|---------|--------|
| 到处使用 RefCell | 运行时发生 panic | 清晰的所有权设计 |
| 在单线程中使用 Mutex | 不必要的开销 | RefCell |
| 忽略 RefCell 的 panic | 难以调试 | 进行处理或重构 |
| 在热点循环内加锁 | 性能杀手 | 批量操作 |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 选择智能指针 | m02-resource |
| 线程安全 | m07-concurrency |
| 数据结构设计 | m09-domain |
| 反模式 | m15-anti-pattern |