---
name: m02-resource
description: "CRITICAL: Use for smart pointers and resource management. Triggers: Box, Rc, Arc, Weak, RefCell, Cell, smart pointer, heap allocation, reference counting, RAII, Drop, should I use Box or Rc, when to use Arc vs Rc, 智能指针, 引用计数, 堆分配"
user-invocable: false
---
# 资源管理

> **第 1 层：语言机制**

## 核心问题

**此资源需要什么样的所有权模式？**

在选择智能指针之前，先弄清楚：
- 所有权是独占的还是共享的？
- 访问是单线程的还是多线程的？
- 是否可能存在循环引用？

---

## 错误 → 设计问题

| 错误 | 不要只是说 | 而应问 |
|-------|----------------|-------------|
| “需要堆分配” | “使用 Box” | 为什么不能将其放在栈上？ |
| Rc 内存泄漏 | “使用 Weak” | 这种循环在设计上是否有必要？ |
| RefCell panic | “使用 try_borrow” | 运行时检查是正确的处理方式吗？ |
| 对 Arc 开销的抱怨 | “接受它” | 真的需要多线程访问吗？ |

---

## 思考提示

在选择智能指针之前：

1. **所有权模型是什么？**
   - 单一所有者 → Box 或拥有所有权的值
   - 共享所有权 → Rc/Arc
   - 弱引用 → Weak

2. **线程上下文是什么？**
   - 单线程 → Rc、Cell、RefCell
   - 多线程 → Arc、Mutex、RwLock

3. **是否存在循环引用？**
   - 是 → 其中一个方向必须使用 Weak
   - 否 → 使用常规的 Rc/Arc 即可

---

## 向上追溯 ↑

当不清楚该选择哪种指针时，向上追溯到设计：

```
"Should I use Arc or Rc?"
    ↑ Ask: Is this data shared across threads?
    ↑ Check: m07-concurrency (thread model)
    ↑ Check: domain-* (performance constraints)
```

| 情况 | 追溯至 | 问题 |
|-----------|----------|----------|
| 不清楚该选 Rc 还是 Arc | m07-concurrency | 并发模型是什么？ |
| RefCell panics | m03-mutability | 内部可变性适合这里吗？ |
| 内存泄漏 | m12-lifecycle | 应该在哪里执行清理？ |

---

## 向下追溯 ↓

从设计到实现：

```
"Need single-owner heap data"
    ↓ Use: Box<T>

"Need shared immutable data (single-thread)"
    ↓ Use: Rc<T>

"Need shared immutable data (multi-thread)"
    ↓ Use: Arc<T>

"Need to break reference cycle"
    ↓ Use: Weak<T>

"Need shared mutable data"
    ↓ Single-thread: Rc<RefCell<T>>
    ↓ Multi-thread: Arc<Mutex<T>> or Arc<RwLock<T>>
```

---

## 快速参考

| 类型 | 所有权 | 线程安全 | 适用场景 |
|------|-----------|-------------|----------|
| `Box<T>` | 独占 | 是 | 堆分配、递归类型 |
| `Rc<T>` | 共享 | 否 | 单线程共享所有权 |
| `Arc<T>` | 共享 | 是 | 多线程共享所有权 |
| `Weak<T>` | 弱引用 | 与 Rc/Arc 相同 | 打破引用循环 |
| `Cell<T>` | 独占 | 否 | 内部可变性（Copy 类型） |
| `RefCell<T>` | 独占 | 否 | 内部可变性（运行时检查） |

## 决策流程图

```
Need heap allocation?
├─ Yes → Single owner?
│        ├─ Yes → Box<T>
│        └─ No → Multi-thread?
│                ├─ Yes → Arc<T>
│                └─ No → Rc<T>
└─ No → Stack allocation (default)

Have reference cycles?
├─ Yes → Use Weak for one direction
└─ No → Regular Rc/Arc

Need interior mutability?
├─ Yes → Thread-safe needed?
│        ├─ Yes → Mutex<T> or RwLock<T>
│        └─ No → T: Copy? → Cell<T> : RefCell<T>
└─ No → Use &mut T
```

---

## 常见错误

| 问题 | 原因 | 修复方法 |
|---------|-------|-----|
| Rc 循环引用泄漏 | 相互持有强引用 | 在一个方向上使用 Weak |
| RefCell panic | 运行时借用冲突 | 使用 try_borrow 或重构代码 |
| Arc 开销 | 热路径中的原子操作 | 如果是单线程，考虑使用 Rc |
| Box 不必要 | 数据可以放入栈中 | 移除 Box |

---

## 反模式

| 反模式 | 弊端 | 更好的做法 |
|--------------|---------|--------|
| 到处使用 Arc | 不必要的原子操作开销 | 单线程场景使用 Rc |
| 到处使用 RefCell | 运行时 panic | 设计清晰的所有权关系 |
| 对小型类型使用 Box | 不必要的分配 | 在栈上分配 |
| 在循环引用中忽略 Weak | 内存泄漏 | 使用 Weak 设计父子关系 |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 所有权错误 | m01-ownership |
| 内部可变性详情 | m03-mutability |
| 多线程上下文 | m07-concurrency |
| 资源生命周期 | m12-lifecycle |