---
name: m09-domain
description: "CRITICAL: Use for domain modeling. Triggers: domain model, DDD, domain-driven design, entity, value object, aggregate, repository pattern, business rules, validation, invariant, 领域模型, 领域驱动设计, 业务规则"
user-invocable: false
---
# 领域建模

> **第 2 层：设计选择**

## 核心问题

**这个概念在领域中扮演什么角色？**

在用代码建模之前，需要了解：
- 它是实体（身份很重要），还是值对象（可互换）？
- 必须维护哪些不变量？
- 聚合边界在哪里？

---

## 领域概念 → Rust 模式

| 领域概念 | Rust 模式 | 所有权含义 |
|----------------|--------------|----------------------|
| 实体 | 结构体 + ID | 自有，具有唯一身份 |
| 值对象 | 结构体 + Clone/Copy | 可共享，不可变 |
| 聚合根 | 结构体拥有子项 | 清晰的所有权树 |
| 仓储 | trait | 对持久化进行抽象 |
| 领域事件 | enum | 捕获状态变更 |
| 服务 | impl 块 / 独立函数 | 无状态操作 |

---

## 思考提示

创建领域类型之前：

1. **这个概念的身份是什么？**
   - 需要唯一身份 → 实体（Id 字段）
   - 按值可互换 → 值对象（Clone/Copy）

2. **必须满足哪些不变量？**
   - 始终有效 → 私有字段 + 经过验证的构造函数
   - 状态转换规则 → 类型状态模式

3. **谁拥有这些数据？**
   - 单一所有者（父项）→ 自有字段
   - 共享引用 → Arc/Rc
   - 弱引用 → Weak

---

## 向上追溯 ↑

追溯到领域约束（第 3 层）：

```
"How should I model a Transaction?"
    ↑ Ask: What domain rules govern transactions?
    ↑ Check: domain-fintech (audit, precision requirements)
    ↑ Check: Business stakeholders (what invariants?)
```

| 设计问题 | 追溯到 | 要询问的问题 |
|-----------------|----------|-----|
| 实体与值对象 | domain-* | 什么使两个实例被视为“相同”？ |
| 聚合边界 | domain-* | 哪些内容必须共同保持一致？ |
| 验证规则 | domain-* | 适用哪些业务规则？ |

---

## 向下追溯 ↓

追溯到实现（第 1 层）：

```
"Model as Entity"
    ↓ m01-ownership: Owned, unique
    ↓ m05-type-driven: Newtype for Id

"Model as Value Object"
    ↓ m01-ownership: Clone/Copy OK
    ↓ m05-type-driven: Validate at construction

"Model as Aggregate"
    ↓ m01-ownership: Parent owns children
    ↓ m02-resource: Consider Rc for shared within aggregate
```

---

## 快速参考

| DDD 概念 | Rust 模式 | 示例 |
|-------------|--------------|---------|
| 值对象 | Newtype | `struct Email(String);` |
| 实体 | 结构体 + ID | `struct User { id: UserId, ... }` |
| 聚合 | 模块边界 | `mod order { ... }` |
| 仓储 | Trait | `trait UserRepo { fn find(...) }` |
| 领域事件 | Enum | `enum OrderEvent { Created, ... }` |

## 模式模板

### 值对象

```rust
struct Email(String);

impl Email {
    pub fn new(s: &str) -> Result<Self, ValidationError> {
        validate_email(s)?;
        Ok(Self(s.to_string()))
    }
}
```

### 实体

```rust
struct UserId(Uuid);

struct User {
    id: UserId,
    email: Email,
    // ... other fields
}

impl PartialEq for User {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id  // Identity equality
    }
}
```

### 聚合

```rust
mod order {
    pub struct Order {
        id: OrderId,
        items: Vec<OrderItem>,  // Owned children
        // ...
    }

    impl Order {
        pub fn add_item(&mut self, item: OrderItem) {
            // Enforce aggregate invariants
        }
    }
}
```

---

## 常见错误

| 错误 | 错误原因 | 更好的做法 |
|---------|-----------|--------|
| 基本类型偏执 | 缺乏类型安全 | Newtype 包装器 |
| 包含不变量的公开字段 | 不变量遭到破坏 | 私有字段 + 访问器 |
| 泄露聚合内部结构 | 封装遭到破坏 | 在根实体上定义方法 |
| 使用字符串表示语义类型 | 缺乏验证 | 经过验证的 Newtype |

---

## 相关技能

| 场景 | 参见 |
|------|-----|
| 类型驱动的实现 | m05-type-driven |
| 聚合的所有权 | m01-ownership |
| 领域错误处理 | m13-domain-error |
| 特定领域规则 | domain-* |