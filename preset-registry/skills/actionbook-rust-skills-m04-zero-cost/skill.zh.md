---
name: m04-zero-cost
description: "CRITICAL: Use for generics, traits, zero-cost abstraction. Triggers: E0277, E0308, E0599, generic, trait, impl, dyn, where, monomorphization, static dispatch, dynamic dispatch, impl Trait, trait bound not satisfied, 泛型, 特征, 零成本抽象, 单态化"
user-invocable: false
---
# 零成本抽象

> **第 1 层：语言机制**

## 核心问题

**我们需要编译时多态还是运行时多态？**

在泛型和 trait 对象之间做出选择之前：
- 类型在编译时是否已知？
- 是否需要异构集合？
- 性能的优先级如何？

---

## 错误 → 设计问题

| 错误 | 不要只说 | 应该问 |
|-------|----------------|-------------|
| E0277 | “添加 trait 约束” | 这一抽象是否处于正确的层级？ |
| E0308 | “修复类型” | 类型应该统一还是保持不同？ |
| E0599 | “导入 trait” | 这个 trait 是否是正确的抽象？ |
| E0038 | “使其满足对象安全” | 我们真的需要动态分发吗？ |

---

## 思考提示

在添加 trait 约束之前：

1. **需要什么抽象？**
   - 相同行为、不同类型 → trait
   - 不同行为、相同类型 → enum
   - 不需要抽象 → 具体类型

2. **类型何时已知？**
   - 编译时 → 泛型（静态分发）
   - 运行时 → trait 对象（动态分发）

3. **权衡时优先考虑什么？**
   - 性能 → 泛型
   - 编译时间 → trait 对象
   - 灵活性 → 视情况而定

---

## 向上追溯 ↑

当类型系统产生阻碍时：

```
E0277 (trait bound not satisfied)
    ↑ Ask: Is the abstraction level correct?
    ↑ Check: m09-domain (what behavior is being abstracted?)
    ↑ Check: m05-type-driven (should use newtype?)
```

| 持续出现的错误 | 追溯至 | 问题 |
|-----------------|----------|----------|
| 复杂的 trait 约束 | m09-domain | 抽象是否正确？ |
| 对象安全问题 | m05-type-driven | 类型状态能否提供帮助？ |
| 类型爆炸 | m10-performance | 能否接受 dyn 开销？ |

---

## 向下追溯 ↓

从设计到实现：

```
"Need to abstract over types with same behavior"
    ↓ Types known at compile time → impl Trait or generics
    ↓ Types determined at runtime → dyn Trait

"Need collection of different types"
    ↓ Closed set → enum
    ↓ Open set → Vec<Box<dyn Trait>>

"Need to return different types"
    ↓ Same type → impl Trait
    ↓ Different types → Box<dyn Trait>
```

---

## 快速参考

| 模式 | 分发 | 代码体积 | 运行时成本 |
|---------|----------|-----------|--------------|
| `fn foo<T: Trait>()` | 静态 | +膨胀 | 零 |
| `fn foo(x: &dyn Trait)` | 动态 | 最小 | vtable 查找 |
| `impl Trait` 返回值 | 静态 | +膨胀 | 零 |
| `Box<dyn Trait>` | 动态 | 最小 | 分配 + vtable |

## 语法对比

```rust
// Static dispatch - type known at compile time
fn process(x: impl Display) { }      // argument position
fn process<T: Display>(x: T) { }     // explicit generic
fn get() -> impl Display { }         // return position

// Dynamic dispatch - type determined at runtime
fn process(x: &dyn Display) { }      // reference
fn process(x: Box<dyn Display>) { }  // owned
```

## 错误代码参考

| 错误 | 原因 | 快速修复 |
|-------|-------|-----------|
| E0277 | 类型未实现 trait | 添加实现或更改约束 |
| E0308 | 类型不匹配 | 检查泛型参数 |
| E0599 | 找不到方法 | 使用 `use` 导入 trait |
| E0038 | trait 不满足对象安全 | 使用泛型或重新设计 |

---

## 决策指南

| 场景 | 选择 | 原因 |
|----------|--------|-----|
| 性能至关重要 | 泛型 | 零运行时开销 |
| 异构集合 | `dyn Trait` | 运行时可包含不同类型 |
| 插件架构 | `dyn Trait` | 编译时类型未知 |
| 缩短编译时间 | `dyn Trait` | 减少单态化 |
| 规模较小的已知类型集合 | `enum` | 无间接访问 |

---

## 对象安全性

如果一个 trait 满足以下条件，则它是对象安全的：
- 没有 `Self: Sized` 约束
- 不返回 `Self`
- 没有泛型方法
- 对非对象安全的方法使用 `where Self: Sized`

---

## 反模式

| 反模式 | 不好的原因 | 更好的做法 |
|--------------|---------|--------|
| 所有内容都过度泛型化 | 增加编译时间和复杂度 | 尽可能使用具体类型 |
| 对已知类型使用 `dyn` | 不必要的间接访问 | 泛型 |
| 复杂的 trait 层次结构 | 难以理解 | 更简单的设计 |
| 忽略对象安全性 | 限制灵活性 | 如有需要，提前为 dyn 做规划 |

---

## 相关技能

| 何时使用 | 参阅 |
|------|-----|
| 类型驱动设计 | m05-type-driven |
| 领域抽象 | m09-domain |
| 性能问题 | m10-performance |
| Send/Sync 约束 | m07-concurrency |