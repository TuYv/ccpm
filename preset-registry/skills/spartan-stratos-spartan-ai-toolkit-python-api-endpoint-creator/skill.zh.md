---
name: python-api-endpoint-creator
description: "Creates FastAPI endpoints with layered architecture (Router → Service → Repository). Use when creating new API endpoints, CRUD operations, or scaffolding a new domain module in a FastAPI project."
allowed_tools:
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---
# Python API 端点创建器

按照严格的分层架构模式创建完整的 FastAPI 端点。

## 何时使用

- 从零创建新的 REST API 端点
- 为新的领域实体添加 CRUD 操作
- 搭建完整的分层链路：Router → Service → Repository → Tests
- 为新的领域模块生成脚手架

## 流程

1. **Pydantic Schemas** — 在 `schemas.py` 中编写 Create/Update/Response
2. **SQLAlchemy 模型** — 在 `models.py` 中编写带 SoftDeleteMixin 的模型
3. **Repository** — 在 `repository.py` 中编写带软删除的异步 CRUD
4. **Service** — 在 `service.py` 中编写业务逻辑，用 HTTPException 处理错误
5. **依赖项** — 在 `dependencies.py` 中编写 `get_db`、`get_service`
6. **Router** — 在 `router.py` 中编写薄端点，一切依赖均通过 Depends() 注入
7. **测试** — 在 `tests/` 中编写 httpx AsyncClient 测试

> 各文件的完整模板请参见 code-patterns.md。

## 架构

```
Router (APIRouter)  →  Service  →  Repository  →  Database
      ↓                  ↓            ↓
  Depends()        Business logic  SQLAlchemy
  Pydantic schemas HTTPException   AsyncSession
  Status codes     Validation      Soft delete
```

## 硬性规则

- **所有变更操作一律使用 POST** — 读取用 GET，创建/更新/删除用 POST
- **ID 用查询参数传递** — `?id=xxx`，绝不使用路径参数 `/{id}`
- **Router 保持精简** — 只做委托转发，不含业务逻辑
- **Service 抛出 HTTPException** — 用于预期中的错误（404、409、422）
- **Repository 负责软删除** — 在所有查询中过滤 `deleted_at.is_(None)`
- **所有端点使用 `async def`** — CPU 密集型操作除外

## 常见陷阱

- **忘记设置 `response_model` 会让你的 API 泄露内部字段。** 务必在端点上设置 `response_model=YourSchema`。没有它，FastAPI 会对原始返回值进行序列化，其中可能包含 `hashed_password`、`deleted_at` 或 SQLAlchemy 模型中的其他内部字段。

- **`Depends()` 会为每个请求创建一个新实例——而不是单例。** 如果你的 Service 持有状态，这些状态会在请求之间丢失。Service 应当是无状态的。如果需要共享状态，请使用应用状态或缓存。

- **`await db.commit()` 应放在依赖中，而不是 Repository 中。** `get_db` 依赖负责处理提交/回滚。如果你还在 Repository 内部提交，就会出现重复提交的 bug，或在所有操作完成之前过早提交。

- **Pydantic 产生的 422 错误默认信息含糊。** 重写 `RequestValidationError` 处理器以返回字段级错误。默认行为只会提示 "validation error"，没有任何对前端有用的细节。

- **创建端点缺少 `status_code=201`。** FastAPI 默认返回 200。应在 POST 创建路由上显式设置 `status_code=status.HTTP_201_CREATED`，在删除路由上设置 `status_code=status.HTTP_204_NO_CONTENT`。
