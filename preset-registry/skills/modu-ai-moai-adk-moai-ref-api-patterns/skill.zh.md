---
name: moai-ref-api-patterns
description: >
  REST/GraphQL API design patterns, error handling conventions, and input validation
  reference for backend development. Agent-extending skill that amplifies backend domain
  work (spawned via Agent(general-purpose) with backend instructions) with production-grade
  API patterns. Use when designing APIs, implementing endpoints, or reviewing backend code.
  NOT for: frontend development, DevOps, database schema design, security audits.

when_to_use: >
  Use for REST/GraphQL API design patterns: endpoint and route design,
  handler structure, request/response conventions, error handling, and
  input validation. Amplifies backend domain work (Agent(general-purpose)
  with backend instructions) with production-grade API patterns.

user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-03-30"
  tags: "api, rest, graphql, patterns, backend, reference"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 3000
---
# API 模式参考

## 目标派生

通过带有后端指令的 `Agent(general-purpose)` 派生后端领域工作——将这些模式直接应用于 API 实现和审查。

## RESTful API 设计约定

| 原则 | 约定 | 示例 |
|-----------|-----------|---------|
| 资源命名 | 使用复数名词、小写字母和 kebab-case | `/api/v1/user-profiles` |
| 集合 | GET 返回带分页的数组 | `GET /users?page=1&limit=20` |
| 单个资源 | GET 返回对象 | `GET /users/{id}` |
| 创建 | 向集合发送 POST | `POST /users` |
| 更新（完整） | 向资源发送 PUT | `PUT /users/{id}` |
| 更新（部分） | 向资源发送 PATCH | `PATCH /users/{id}` |
| 删除 | 向资源发送 DELETE | `DELETE /users/{id}` |
| 嵌套资源 | 最多嵌套 2 层 | `/users/{id}/posts` |
| 筛选 | 使用查询参数 | `?status=active&role=admin` |
| 排序 | 使用排序参数 | `?sort=-created_at,name` |
| 版本控制 | 使用 URL 前缀 | `/api/v1/`, `/api/v2/` |

## HTTP 状态码指南

| 类别 | 状态码 | 使用场景 |
|----------|------|-------------|
| 成功 | 200 OK | GET、PUT、PATCH、DELETE 成功 |
| 成功 | 201 Created | POST 成功（资源已创建） |
| 成功 | 204 No Content | DELETE 成功（无响应正文） |
| 客户端错误 | 400 Bad Request | 请求格式错误、验证失败 |
| 客户端错误 | 401 Unauthorized | 缺少身份验证或身份验证无效 |
| 客户端错误 | 403 Forbidden | 已通过身份验证，但没有权限 |
| 客户端错误 | 404 Not Found | 资源不存在 |
| 客户端错误 | 409 Conflict | 资源状态冲突（重复） |
| 客户端错误 | 422 Unprocessable | 语法有效，但存在语义错误 |
| 客户端错误 | 429 Too Many | 超出速率限制 |
| 服务器错误 | 500 Internal | 意外的服务器错误 |
| 服务器错误 | 503 Service Unavailable | 维护或过载 |

## 错误响应格式

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": [
      {"field": "email", "message": "Must be a valid email address"},
      {"field": "age", "message": "Must be between 0 and 150"}
    ],
    "request_id": "req_abc123"
  }
}
```

规则：
- 切勿在生产环境中暴露堆栈跟踪或内部细节
- 始终包含 request_id，以便追踪
- 使用一致的错误代码（ENUM，而不是自由文本）
- 登录失败："Invalid email or password"（切勿透露具体是哪一项错误）

## 分页模式

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false
  }
}
```

对于基于游标的分页（大型数据集）：
```json
{
  "data": [...],
  "cursor": {
    "next": "eyJpZCI6MTAwfQ==",
    "has_more": true
  }
}
```

## 输入验证检查清单

| 验证 | 方法 | 工具 |
|-----------|--------|------|
| 类型验证 | Schema 验证 | Zod, Joi, pydantic, Go validator |
| 长度限制 | 最小值/最大值约束 | Schema min/max |
| 模式匹配 | 正则表达式 | Email, URL, phone patterns |
| 范围验证 | 数字/日期边界 | min/max values |
| 枚举 | 允许的值 | enum types |
| SQL 注入 | 参数化查询 | ORM (Prisma, GORM, SQLAlchemy) |
| XSS | HTML 转义 | Template engines, DOMPurify |
| 路径遍历 | 路径规范化 | filepath.Clean + whitelist |

## 限流策略

| 目标 | 限制 | 键 |
|--------|-------|-----|
| 认证端点 | 5 次请求/分钟 | IP |
| 通用 API | 100 次请求/分钟 | 用户令牌 |
| 文件上传 | 10 次请求/小时 | 用户令牌 |
| 公共 API | 30 次请求/分钟 | IP |

响应头：`X-RateLimit-Limit`、`X-RateLimit-Remaining`、`X-RateLimit-Reset`、`Retry-After`（出现 429 时）。

## API 版本控制策略

| 策略 | 使用场景 | 示例 |
|----------|----------|---------|
| URL 前缀 | 大多数 API | `/api/v1/users` |
| 请求头 | 内部 API | `Accept: application/vnd.api+json; version=2` |
| 查询参数 | 简单 API | `/users?version=2` |

需要提升版本号的破坏性变更：
- 删除或重命名字段
- 更改字段类型
- 删除端点
- 更改认证方式

非破坏性变更（无需提升版本号）：
- 添加新的可选字段
- 添加新端点
- 添加新的查询参数

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “REST 命名约定只是美观问题” | 一致的资源命名方式能让客户端发现并预测端点。不一致会成倍增加文档负担。 |
| “GraphQL 解决了过度获取问题，所以我不需要设计响应结构” | GraphQL 将复杂性转移到了解析器层。设计不佳的 schema 会导致 N+1 查询和授权漏洞。 |
| “错误码是内部细节，客户端只需要错误消息” | 客户端需要机器可读的错误码来进行程序化处理。消息供人阅读，错误码供代码使用。 |
| “PATCH 和 PUT 可以互换” | PATCH 应用部分更新；PUT 替换整个资源。错误使用它们会破坏对幂等性的预期。 |
| “等到有必要时，我再对 API 进行版本控制” | 在发生破坏性变更后才进行版本控制，会迫使团队紧急迁移。应从首次发布开始规划版本控制。 |

**Hyrum 定律**：客户端最终会依赖 API 的每一种可观察行为。未记录的响应字段、错误格式和时序特征都会成为隐式契约。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- API 在不同端点返回不同的错误格式
- 资源名称使用动词而非名词（例如，使用 /getUser 而不是 /users/:id）
- 可能返回无界结果的列表端点没有分页
- 部署破坏性变更时未提升 API 版本号
- GraphQL schema 允许无限深度或不受限制的循环查询

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 所有端点均遵循一致的命名约定（名词、复数、嵌套资源）
- [ ] 错误响应采用包含机器可读错误码的标准格式
- [ ] 列表端点实现了分页，并记录了相关限制
- [ ] 已制定并强制执行 API 版本控制策略（URL 路径、请求头或查询参数）
- [ ] 已记录近期变更的破坏性与非破坏性分类
- [ ] 输入验证返回 400，并提供具体的字段级错误详情

<!-- moai:evolvable-end -->