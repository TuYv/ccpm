---
name: domain-fintech
description: "Use when building fintech apps. Keywords: fintech, trading, decimal, currency, financial, money, transaction, ledger, payment, exchange rate, precision, rounding, accounting, 金融, 交易系统, 货币, 支付"
user-invocable: false
---
# 金融科技领域

> **第 3 层：领域约束**

## 领域约束 → 设计影响

| 领域规则 | 设计约束 | Rust 影响 |
|-------------|-------------------|------------------|
| 审计跟踪 | 不可变记录 | Arc<T>，禁止修改 |
| 精度 | 禁止使用浮点数 | rust_decimal |
| 一致性 | 事务边界 | 清晰的所有权 |
| 合规性 | 完整日志记录 | 结构化追踪 |
| 可复现性 | 确定性执行 | 无竞态条件 |

---

## 关键约束

### 金融精度

```
RULE: Never use f64 for money
WHY: Floating point loses precision
RUST: Use rust_decimal::Decimal
```

### 审计要求

```
RULE: All transactions must be immutable and traceable
WHY: Regulatory compliance, dispute resolution
RUST: Arc<T> for sharing, event sourcing pattern
```

### 一致性

```
RULE: Money can't disappear or appear
WHY: Double-entry accounting principles
RUST: Transaction types with validated totals
```

---

## 向下追溯 ↓

从约束到设计（第 2 层）：

```
"Need immutable transaction records"
    ↓ m09-domain: Model as Value Objects
    ↓ m01-ownership: Use Arc for shared immutable data

"Need precise decimal math"
    ↓ m05-type-driven: Newtype for Currency/Amount
    ↓ rust_decimal: Use Decimal type

"Need transaction boundaries"
    ↓ m12-lifecycle: RAII for transaction scope
    ↓ m09-domain: Aggregate boundaries
```

---

## 关键 Crate

| 用途 | Crate |
|---------|-------|
| 十进制数学运算 | rust_decimal |
| 日期/时间 | chrono, time |
| UUID | uuid |
| 序列化 | serde |
| 验证 | validator |

## 设计模式

| 模式 | 用途 | 实现 |
|---------|---------|----------------|
| Currency newtype | 类型安全 | `struct Amount(Decimal);` |
| 事务 | 原子操作 | 事件溯源 |
| 审计日志 | 可追溯性 | 使用追踪 ID 的结构化日志记录 |
| 账本 | 复式记账 | 借方/贷方平衡 |

## 代码模式：货币类型

```rust
use rust_decimal::Decimal;

#[derive(Clone, Debug, PartialEq)]
pub struct Amount {
    value: Decimal,
    currency: Currency,
}

impl Amount {
    pub fn new(value: Decimal, currency: Currency) -> Self {
        Self { value, currency }
    }

    pub fn add(&self, other: &Amount) -> Result<Amount, CurrencyMismatch> {
        if self.currency != other.currency {
            return Err(CurrencyMismatch);
        }
        Ok(Amount::new(self.value + other.value, self.currency))
    }
}
```

---

## 常见错误

| 错误 | 违反的领域约束 | 修复方法 |
|---------|-----------------|-----|
| 使用 f64 | 精度损失 | rust_decimal |
| 可变事务 | 审计跟踪中断 | 不可变 + 事件 |
| 使用字符串表示金额 | 缺少验证 | 经过验证的 newtype |
| 静默溢出 | 资金凭空消失 | 检查算术运算 |

---

## 追溯到第 1 层

| 约束 | 第 2 层模式 | 第 1 层实现 |
|------------|-----------------|------------------------|
| 不可变记录 | 事件溯源 | Arc<T>, Clone |
| 事务作用域 | 聚合 | 被拥有的子对象 |
| 精度 | 值对象 | rust_decimal newtype |
| 线程安全共享 | 共享不可变数据 | Arc（而非 Rc） |

---

## 相关技能

| 场景 | 参阅 |
|------|-----|
| 值对象设计 | m09-domain |
| 不可变对象的所有权 | m01-ownership |
| 使用 Arc 共享 | m02-resource |
| 错误处理 | m13-domain-error |