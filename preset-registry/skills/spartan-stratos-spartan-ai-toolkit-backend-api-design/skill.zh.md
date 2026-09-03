---
name: backend-api-design
description: Design RPC-style APIs with layered architecture (Controller → Manager → Repository). Use when creating new API endpoints, designing API contracts, or reviewing API patterns.
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---
# 后端 API 设计 — 快速参考

## URL 模式

```
GET  /api/v1/employees              # List (plural)
GET  /api/v1/employee               # Get one (?id=xxx)
POST /api/v1/employee               # Create
POST /api/v1/employee/update        # Update (?id=xxx)
POST /api/v1/employee/delete        # Soft delete (?id=xxx)
POST /api/v1/employee/restore       # Restore (?id=xxx)
POST /api/v1/sync/employees         # Action
```

## 硬性规则

- **禁止路径参数** — 始终使用 `@QueryValue`，绝不使用 `@PathVariable`
- **单个资源用单数** — 用 `/employee` 而不是 `/employees/{id}`
- **集合用复数** — `/employees`
- **动作用动词子路径** — `/delete`、`/restore`、`/sync`

## 分层架构

```
Controller  →  thin, just delegates
    ↓
Manager     →  business logic, transactions, Either returns
    ↓
Repository  →  data access only, no business logic
```

### Controller：薄封装
- 解析查询参数并设置默认值
- 委托给 manager
- 用 `.throwOrValue()` 解包 Either
- 不含业务逻辑，不访问 repository

### Manager：业务逻辑
- 返回 `Either<ClientException, T>`
- 将数据库操作包裹在 `transaction(db.primary) { }` 中
- 编排多个 repository
- 校验业务规则

### Repository：数据访问
- 返回实体或 null
- 读操作用 `db.replica`，写操作用 `db.primary`
- 始终检查 `deletedAt.isNull()`

## 快速代码参考

核心的 Controller 委托模式：

```kotlin
@Get("/employee")
suspend fun getEmployee(@QueryValue id: UUID): EmployeeResponse {
  return employeeManager.findById(id).throwOrValue()
}
```

- **响应模型** — 在 `module-client/response/{domain}/` 中定义 `companion object { fun from(entity) }`
- **分页** — 基于 offset，manager 返回 `EmployeeListResponse`，包含 `items`、`total`、`page`、`limit`、`hasMore`
- **错误** — 在 manager 中返回 `ClientError.NOT_FOUND.asException().left()`，绝不抛出异常
- **工厂 bean** — 带 `@Singleton` 方法的 `@Factory` 类，将 repository 和 db 装配进 manager

> 完整的 Controller、响应模型、分页、错误处理和工厂 bean 模板请参见 code-patterns.md。

## 易错点

- **多词 `@QueryValue` 参数必须显式指定 snake_case 名称。** 前端 axios 拦截器发送的是 `project_id`，但 Micronaut 按字面参数名匹配。应写成 `@QueryValue("project_id") projectId: UUID`，而不是裸写 `@QueryValue projectId: UUID`。
- **不要使用 `@Put`、`@Delete` 或 `@Patch`。** 这是 RPC 风格 — 所有变更操作都用 `@Post`。`@Get` 仅用于读取。
- **在 Controller 中注入 repository 是一种代码异味。** 如果你在 Controller 里看到 `private val fooRepository: FooRepository`，把它移到 manager 中。
- **用 `andWhere {}`，不要二次调用 `.where {}`。** 两次调用 `.where {}` 会替换掉第一个条件。请使用 `.andWhere {}` 来串联条件。
- **别忘了 `@ExecuteOn(TaskExecutors.IO)`。** 缺少它时，suspend 函数可能会卡住或运行在错误的线程池上。每个 Controller 都需要它。
