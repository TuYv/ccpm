---
name: m05-type-driven
description: "CRITICAL: Use for type-driven design. Triggers: type state, PhantomData, newtype, marker trait, builder pattern, make invalid states unrepresentable, compile-time validation, sealed trait, ZST, 类型状态, 新类型模式, 类型驱动设计"
user-invocable: false
---
# 类型驱动设计

> **第 1 层：语言机制**

## 核心问题

**类型系统如何防止无效状态？**

在诉诸运行时检查之前：
- 编译器能否捕获这个错误？
- 能否让无效状态无法表示？
- 类型能否编码该不变量？

---

## 错误 → 设计问题

| 模式 | 不要只说 | 而应询问 |
|---------|----------------|-------------|
| 基本类型偏执 | “它只是一个字符串” | 这个值表示什么？ |
| 布尔标志 | “添加一个 is_valid 标志” | 状态能否表示为类型？ |
| 到处使用可选值 | “检查 None” | 缺失真的可能发生吗？ |
| 运行时验证 | “如果无效则返回 Err” | 能否在构造时进行验证？ |

---

## 思考提示

在添加运行时验证之前：

1. **类型能否编码该约束？**
   - 数值范围 → 有界类型或新类型
   - 有效状态 → 类型状态模式
   - 语义含义 → 新类型

2. **何时可以进行验证？**
   - 构造时 → 经过验证的新类型
   - 状态转换时 → 类型状态
   - 仅能在运行时 → 带有明确错误的 Result

3. **谁需要了解该不变量？**
   - 编译器 → 类型层级编码
   - API 用户 → 清晰的类型签名
   - 仅运行时 → 文档

---

## 向上追溯 ↑

当类型设计不明确时：

```
"Need to validate email format"
    ↑ Ask: Is this a domain value object?
    ↑ Check: m09-domain (Email as Value Object)
    ↑ Check: domain-* (validation requirements)
```

| 情况 | 追溯至 | 问题 |
|-----------|----------|----------|
| 应创建哪些类型 | m09-domain | 领域模型是什么？ |
| 状态机设计 | m09-domain | 哪些转换是有效的？ |
| 标记 trait 的使用 | m04-zero-cost | 静态分发还是动态分发？ |

---

## 向下追溯 ↓

从设计到实现：

```
"Need type-safe wrapper for primitives"
    ↓ Newtype: struct UserId(u64);

"Need compile-time state validation"
    ↓ Type State: Connection<Connected>

"Need to track phantom type parameters"
    ↓ PhantomData: PhantomData<T>

"Need capability markers"
    ↓ Marker Trait: trait Validated {}

"Need gradual construction"
    ↓ Builder: Builder::new().field(x).build()
```

---

## 快速参考

| 模式 | 用途 | 示例 |
|---------|---------|---------|
| 新类型 | 类型安全 | `struct UserId(u64);` |
| 类型状态 | 状态机 | `Connection<Connected>` |
| PhantomData | 型变/生命周期 | `PhantomData<&'a T>` |
| 标记 Trait | 能力标志 | `trait Validated {}` |
| 构建器 | 渐进式构造 | `Builder::new().name("x").build()` |
| 密封 Trait | 防止外部实现 | `mod private { pub trait Sealed {} }` |

## 模式示例

### 新类型

```rust
struct Email(String);  // Not just any string

impl Email {
    pub fn new(s: &str) -> Result<Self, ValidationError> {
        // Validate once, trust forever
        validate_email(s)?;
        Ok(Self(s.to_string()))
    }
}
```

### 类型状态

```rust
struct Connection<State>(TcpStream, PhantomData<State>);

struct Disconnected;
struct Connected;
struct Authenticated;

impl Connection<Disconnected> {
    fn connect(self) -> Connection<Connected> { ... }
}

impl Connection<Connected> {
    fn authenticate(self) -> Connection<Authenticated> { ... }
}
```

---

## 决策指南

| 需求 | 模式 |
|------|---------|
| 基本类型的类型安全 | Newtype |
| 编译时状态验证 | 类型状态 |
| 生命周期/型变标记 | PhantomData |
| 能力标志 | 标记 Trait |
| 渐进式构造 | Builder |
| 封闭的实现集合 | 密封 Trait |
| 零大小类型标记 | ZST 结构体 |

---

## 反模式

| 反模式 | 缺点 | 更好的方案 |
|--------------|---------|--------|
| 使用布尔标志表示状态 | 运行时错误 | 类型状态 |
| 使用字符串表示语义类型 | 缺乏类型安全 | Newtype |
| 使用 Option 表示未初始化状态 | 不变量不明确 | Builder |
| 包含不变量的公共字段 | 违反不变量 | 私有字段 + 经过验证的 new() |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 领域建模 | m09-domain |
| Trait 设计 | m04-zero-cost |
| 构造函数中的错误处理 | m06-error-handling |
| 反模式 | m15-anti-pattern |