---
name: python-best-practices
description: "Python/FastAPI coding standards including async patterns, Pydantic v2, SQLAlchemy 2.0, and project structure. Use when writing Python code, reviewing FastAPI projects, or learning FastAPI conventions."
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---
# Python + FastAPI 最佳实践 — 快速参考

## 分层架构

Router → Service → Repository → Database。每一层只调用紧邻的下一层。

> 完整的项目结构和各层示例请参阅 code-patterns.md。

## Pydantic v2

将 Create/Update/Response schema 分开定义。使用 `ConfigDict(from_attributes=True)` 进行 ORM 集成。使用 `str | None` 语法（而非 `Optional[str]`）。

> schema 示例请参阅 code-patterns.md。

## 异步模式

I/O 路由使用 `async def`，CPU 密集型操作使用普通 `def`。使用 lifespan 上下文管理器（而非 `on_event`）。外部 HTTP 调用使用 `httpx.AsyncClient`。

> 异步示例请参阅 code-patterns.md。

## 软删除

在 SQLAlchemy 模型上使用 `SoftDeleteMixin`。在所有查询中过滤 `where(Model.deleted_at.is_(None))`。

> mixin 和仓储模式请参阅 code-patterns.md。

## 配置

所有配置均使用 `pydantic-settings`。绝不要硬编码密钥、URL 或魔法数字。

> Settings 类模式请参阅 code-patterns.md。

## 分页

所有列表端点使用泛型 `PaginatedResponse[T]`。始终返回 `total`、`page`、`limit`、`has_more`。

> 该模式请参阅 code-patterns.md。

## 常见陷阱

- **`async def` 与 `def` 的选择会影响性能。** 调用阻塞代码（如 `time.sleep()` 或同步数据库驱动）的 `async def` 路由会阻塞整个事件循环。CPU 密集型工作请使用普通 `def` —— FastAPI 会在线程池中运行它。只有在需要 `await` 某些操作时才使用 `async def`。

- **`datetime.utcnow()` 自 Python 3.12 起已被弃用。** 请改用 `datetime.now(UTC)`。旧函数返回无时区的 naive datetime（不带时区），会导致比较错误。新函数返回带时区信息的 UTC 时间。

- **Pydantic 中的可变默认参数看似安全，实则暗藏陷阱。** `tags: list[str] = []` 在 Pydantic 中可以正常工作（它会复制默认值）。但 `tags: list[str] = Field(default_factory=list)` 更明确，对嵌套模型也更安全。对于简单字段，两种写法都可以。对于复杂的嵌套默认值，始终使用 `default_factory`。

- **`from_attributes=True` 取代了 `orm_mode=True`。** Pydantic v2 更改了配置 API。使用旧的 `orm_mode` 会静默失效——你的 ORM 对象将无法正确序列化。

- **SQLAlchemy 的 `Column()` 是遗留写法。** SQLAlchemy 2.0 应使用 `Mapped[type]` 配合 `mapped_column()`。旧的 `Column(String)` 仍然可用，但会失去类型检查器支持和 IDE 自动补全。
