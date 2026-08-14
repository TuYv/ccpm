---
name: kotlin-functions
description: Use when choosing Kotlin member, top-level, extension, factory, or service functions for String, primitive, collection, Flow, framework, or third-party receivers.
---
# Kotlin 函数归属

## 核心原则

将函数放在语义上准确且范围最小的所有者上。扩展语法改变的是调用形式，而不是归属关系。

默认拒绝为基本类型、通用类型和库所有的类型创建扩展：它们会造成错误的归属关系、领域污染、嘈杂的代码补全和导入，以及命名冲突。

## 流程

按顺序执行。

### 1. 明确语义所有者

明确该操作及拥有它的概念。如果归属不清晰，请先停下来，不要选择语法形式。

### 2. 尽早排除具有误导性的接收者

对于 `String`、基本类型、集合、`Flow`、框架或第三方接收者，必须满足以下**全部**条件：

- 处于狭窄且内聚的 `private`/`internal` 作用域内。
- 对接收者的每个值都有效。
- 不涉及策略、状态、I/O 或依赖项。
- 接收者语法明显更清晰。
- 不存在更合适的项目自有所有者。

任何一项不满足，都禁止在该接收者上使用扩展；请在第 3 步中选择非扩展形式。`private fun <T> MutableList<T>.swap(...)` 可以通过：它是列表原生操作、不涉及策略，并且仅用于局部算法。

### 3. 选择函数形式

| 含义 | 首选形式 |
|---|---|
| 项目自有的固有行为 | 成员函数 |
| 跨类型的无状态操作 | 顶层函数 |
| 构造或解析 | 目标类型的工厂函数或具名顶层函数 |
| 保留的策略、状态、I/O、时钟、区域设置或依赖项 | 注入的服务/协作者 |
| 类型原生操作，使用接收者更清晰，并且通过第 2 步的所有检查 | 扩展函数 |

仅当行为需要保留策略、状态、I/O、时钟/区域设置或依赖项时，才使用服务/协作者；否则，应在无状态函数上使用显式参数。

### 4. 迁移行为和调用方

移动实现，然后更新调用、导入和函数引用。除非这是明确的破坏性版本发布，否则应保留或弃用公共入口点；仅为具体使用方添加非公共迁移支持。

```kotlin
// Before: String falsely owns UserId construction.
fun String.toUserId(): UserId = UserId(this)

// After: UserId owns construction.
@JvmInline
value class UserId private constructor(val value: String) {
    companion object {
        fun parse(raw: String): UserId = UserId(raw)
    }
}

val id = UserId.parse(raw)
```

### 5. 验证并完成

对于每种形式，都要检查可见性、导入、冲突和兼容性。对于扩展，还要检查可空接收者、泛型以及未来成员函数的优先级。编译并测试；如果失败，则缩小 API 范围或返回第 1 步。

## 常见托词

| “但是……” | 反驳 |
|---|---|
| 流畅的语法 | 可读性并不能创造归属关系。 |
| Kotlin 使用扩展 | 惯用写法仍然要求语义准确。 |
| 它是 `private`/`internal` 的 | 只有通过所有检查时，缩小作用域才有帮助。 |
| 工具对象更糟糕 | 使用顶层函数或目标类型的工厂函数。 |
| 默认策略显而易见 | 时区/区域设置的默认值属于策略；应保持显式。 |
| 已经在 PR 里了 | 现有代码并不能证明归属关系。 |

## 危险信号

- 在 `String`、数字、集合、`Flow` 或供应商类型上承载领域含义。
- 将时钟、区域设置、I/O、策略或依赖项隐藏在扩展中。

## 常见错误

| 错误 | 修正方法 |
|---|---|
| `Long.toDisplayDate()` | 格式化器负责管理时区/区域设置策略。 |
| 扩展隐藏了解析过程 | 使用 `Type.parse(raw)` 或具名解析器。 |
| 为公共库类型添加扩展 | 使用步骤 1-3 对其重新分类。 |

## 相关内容

- [`kotlin-types-value-class`](../kotlin-types-value-class/SKILL.md)