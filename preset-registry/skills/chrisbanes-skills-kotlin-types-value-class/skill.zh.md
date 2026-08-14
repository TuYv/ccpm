---
name: kotlin-types-value-class
description: Use when writing or reviewing Kotlin type declarations to choose @JvmInline value class over data class where appropriate, including Compose stability implications.
---
# Kotlin value class 与 data class

## 核心原则

对于承载领域含义的单字段类型，优先使用 `@JvmInline value class`。Data class 用于聚合多个字段。

## 审查流程

1. 找出单属性包装类型、以基本类型为主的 API，以及 UI 状态中使用 `@Immutable` 的包装类型。
2. 判断该单一值是否代表真正的领域区分。如果不是，则保留基本类型或使用 typealias。
3. 检查替换类型是否会改变相等性、序列化、Java 互操作性或热点路径中的装箱行为。
4. 仅当领域含义明确且契约变更可接受时才进行转换。
5. 重新运行受影响的编译器检查和测试；对于 Compose 性能优化工作，还要重新检查编译器报告或重组证据。

## 决策流程

| 情况 | 优先选择 |
|---|---|
| 单字段 + 具有领域含义（`UserId`、`EmailAddress`、`Percentage`） | `@JvmInline value class` |
| 单字段 + 无领域含义（仅用于分组） | 类型别名或保留基本类型 |
| 多个字段 | Data class |
| 需要实现不同于被包装值的自定义 `equals`/`hashCode` | Data class（value class 委托给底层类型） |
| 在已确认的热点路径中用作泛型类型参数或可空类型 | Data class 或基本类型 |

```kotlin
// GOOD: domain-meaningful single field
@JvmInline value class UserId(val value: String)
@JvmInline value class EmailAddress(val value: String)
@JvmInline value class Percentage(val value: Float)

// BAD: data class wrapping a single domain field
data class UserId(val value: String)

// BAD: value class with no domain meaning
@JvmInline value class Wrapper(val value: String) // just use the String, or a type alias

// BAD: value class needing custom equality
@JvmInline value class CaseInsensitiveString(val value: String)
// value class equals delegates to String equals, which IS case-sensitive
// Use a data class if you need different equality semantics
```

## Compose 稳定性处理流程

当 Compose 报告指出某个单字段包装类型存在问题时：

1. 确认底层类型是稳定的（`String`、基本类型或其他稳定类型）。
2. 对于唯一作用是区分类型的包装类型，优先使用 value class，而不是添加 `@Immutable`。
3. 不要仅仅为了消除报告而更改公共序列化/API 契约。

```kotlin
// Before: primitive value can be mixed up with other strings
data class UiState(val userId: String)

// After: domain type is stable at the Compose boundary
@JvmInline value class UserId(val value: String)
data class UiState(val userId: UserId)
```

## 重构检查

替换现有包装类型之前，应检查调用方可观察到的契约：

| 检查项 | 操作 |
|---|---|
| JSON/API 格式很重要 | 验证序列化。`@Serializable data class A(val value: String)` 会编码为对象；value class 会编码为被包装的值。 |
| 需要自定义相等性或哈希逻辑 | 保留 data class。Value class 的相等性遵循被包装值。 |
| 调用方使用 `copy()` 或解构 | 保留 data class，或有计划地更新调用方。Value class 不提供 data class 的便捷功能。 |
| Java 或大量使用反射的框架边界 | 验证互操作性。Java 调用方看到的是底层类型；作为泛型或 `Any` 使用时会发生装箱。 |
| 可空类型/泛型/可变参数热点路径 | 转换前进行测量；这些用法会发生装箱。 |
| 构造函数体、`lateinit`、委托属性、后备字段 | 保留 data class 或重新设计；value class 只能存储构造函数中的值。 |

## 仅在有证据后才打包多个值

除非性能分析表明热路径上的分配成本确实存在问题，否则不要用位打包替换结构清晰的多字段数据类。如有需要，Compose 在 `androidx.compose.ui.util` 中提供了 `packFloats`、`packInts` 以及对应的 `unpack*` 函数：

```kotlin
@JvmInline value class Offset(val packedValue: Long)

fun Offset(x: Float, y: Float): Offset = Offset(packFloats(x, y))
val Offset.x: Float get() = unpackFloat1(packedValue)
val Offset.y: Float get() = unpackFloat2(packedValue)
```

## 常见错误

| 错误 | 修复方法 |
|---|---|
| 数据类仅包装一个领域字段 | 替换为 `@JvmInline value class` |
| 值类没有领域含义（只是一个包装器） | 使用类型别名或直接使用原始类型 |
| 值类需要自定义相等性 | 改用数据类 |
| 在热路径中将值类用作泛型类型参数 | 测量装箱成本；如果影响显著，则保留原始类型/数据类 |
| 对本可使用值类的类型添加 `@Immutable` 注解 | 当底层类型稳定时，替换为值类 |
| 忘记添加 `@JvmInline` 注解 | 对于单字段类，始终将 `value class` 与 `@JvmInline` 配对使用 |

## 评审时的危险信号

- 数据类恰好只有一个属性
- 在不同值不应互换的场景中使用 `String`、`Long` 或 `Int`（例如 `fun transfer(from: String, to: String, amount: Long)`）
- 在单字段包装器上添加 `@Immutable` 注解
- 在需要值类语义来区分领域概念时使用类型别名（类型别名会被类型擦除，无法提供运行时保护）

## 不适用的情况

- 类型需要多个字段 → 使用数据类
- 类型需要自定义 `equals`/`hashCode` → 使用数据类
- 类型在性能关键代码中被大量用作可空类型或泛型 → 先测量自动装箱成本
- 项目不需要这种类型安全区分 → 使用类型别名或原始类型即可
- 替换会悄然改变 JSON、Java、反射或框架行为

## 相关内容

- [`compose-stability-diagnostics`](../compose-stability-diagnostics/SKILL.md) — 诊断不稳定的 Compose 参数；值类是解决方法之一