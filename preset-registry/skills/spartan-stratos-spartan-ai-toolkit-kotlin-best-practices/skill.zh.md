---
name: kotlin-best-practices
description: Kotlin coding standards including null safety, Either error handling, coroutines, and Exposed ORM patterns. Use when writing Kotlin code, reviewing code quality, or learning project patterns.
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---
# Kotlin 最佳实践 — 快速参考

## 空安全

禁止使用 `!!`。请使用 `?.`、`?:` 或 null 检查以实现智能转换。

> 所有空安全示例请参见 code-patterns.md。

## Either 错误处理

Manager 层返回 `Either<ClientException, T>` —— 绝不抛出异常。Controller 层使用 `.throwOrValue()` 解包。

> Manager 和 Controller 的示例请参见 code-patterns.md。

## 枚举用法

只要存在枚举，就绝不硬编码字符串。在所有地方统一使用 `EnumName.VALUE.value`。

> 枚举定义和使用模式请参见 code-patterns.md。

## Exposed ORM 模式

继承 `UUIDTable`，使用 `text()` 而非 `varchar()`。始终过滤 `deletedAt.isNull()`。通过更新时间戳实现软删除，绝不硬删除。

> 表、查询和软删除的示例请参见 code-patterns.md。

## 事务规则

读操作使用 `db.replica`，写操作使用 `db.primary`。多表写入放在同一个事务块中 —— 要么全部成功，要么全部回滚。

> 事务示例请参见 code-patterns.md。

## 转换模式

将 `companion object { fun from(entity) }` 放在 Response DTO 内部。绝不创建单独的 mapper 文件。

> 完整模式请参见 code-patterns.md。

## 需要避免的做法

- `!!` —— 始终使用 `?.`、`?:` 或 null 检查
- `@Suppress` —— 修复根本原因
- 抛出异常 —— 改为返回 `Either.left()`
- SQL 中的 `VARCHAR` —— 使用 `TEXT`
- 硬编码枚举值的字符串
- `Table` 基类 —— 使用 `UUIDTable`
- 字段注入 —— 使用构造函数注入
