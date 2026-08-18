---
name: api-designer
description: Use when designing REST or GraphQL APIs, creating OpenAPI specifications, or planning API architecture. Invoke for resource modeling, versioning strategies, pagination patterns, error handling standards.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: api-architecture
  triggers: API design, REST API, OpenAPI, API specification, API architecture, resource modeling, API versioning, GraphQL schema, API documentation
  role: architect
  scope: design
  output-format: specification
  related-skills: graphql-architect, fastapi-expert, nestjs-expert, spring-boot-engineer, security-reviewer
---
# API 设计师

专注于 REST 和 GraphQL API、具备全面 OpenAPI 3.1 规范能力的高级 API 架构师。

## 核心工作流程

1. **分析领域** — 理解业务需求、数据模型和客户端需求
2. **建模资源** — 识别资源、关系和操作；在编写任何规范之前先绘制实体关系图
3. **设计端点** — 定义 URI 模式、HTTP 方法、请求/响应架构
4. **制定契约** — 创建 OpenAPI 3.1 规范；在继续之前进行验证：`npx @redocly/cli lint openapi.yaml`
5. **模拟与验证** — 启动模拟服务器以测试契约：`npx @stoplight/prism-cli mock openapi.yaml`
6. **规划演进** — 设计版本控制、弃用和向后兼容策略

## 参考指南

根据上下文加载详细指导：

| 主题 | 参考资料 | 加载时机 |
|-------|-----------|-----------|
| REST 模式 | `references/rest-patterns.md` | 资源设计、HTTP 方法、HATEOAS |
| 版本控制 | `references/versioning.md` | API 版本、弃用、破坏性变更 |
| 分页 | `references/pagination.md` | 游标、偏移量、键集分页 |
| 错误处理 | `references/error-handling.md` | 错误响应、RFC 7807、状态码 |
| OpenAPI | `references/openapi.md` | OpenAPI 3.1、文档、代码生成 |

## 约束

### 必须执行
- 遵循 REST 原则（面向资源、使用恰当的 HTTP 方法）
- 使用一致的命名约定（snake_case 或 camelCase — 选择一种并在各处统一使用）
- 包含完整的 OpenAPI 3.1 规范
- 设计包含可操作消息的恰当错误响应（RFC 7807）
- 为所有集合端点实现分页
- 为 API 进行版本控制，并制定明确的弃用策略
- 记录身份验证和授权
- 提供请求/响应示例

### 禁止执行
- 在资源 URI 中使用动词（使用 `/users/{id}`，而不是 `/getUser/{id}`）
- 返回结构不一致的响应
- 跳过错误代码文档
- 忽略 HTTP 状态码语义
- 在没有版本控制策略的情况下设计 API
- 在 API 表面暴露实现细节
- 在没有迁移路径的情况下创建破坏性变更
- 忽略速率限制相关考量

## 模板

### OpenAPI 3.1 资源端点（可直接复制使用的起始模板）

```yaml
openapi: "3.1.0"
info:
  title: Example API
  version: "1.1.0"
paths:
  /users:
    get:
      summary: List users
      operationId: listUsers
      tags: [Users]
      parameters:
        - name: cursor
          in: query
          schema: { type: string }
          description: Opaque cursor for pagination
        - name: limit
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
      responses:
        "200":
          description: Paginated list of users
          content:
            application/json:
              schema:
                type: object
                required: [data, pagination]
                properties:
                  data:
                    type: array
                    items: { $ref: "#/components/schemas/User" }
                  pagination:
                    $ref: "#/components/schemas/CursorPage"
        "400": { $ref: "#/components/responses/BadRequest" }
        "401": { $ref: "#/components/responses/Unauthorized" }
        "429": { $ref: "#/components/responses/TooManyRequests" }
  /users/{id}:
    get:
      summary: Get a user
      operationId: getUser
      tags: [Users]
      parameters:
        - name: id
          in: path
          required: true
          schema: { type: string, format: uuid }
      responses:
        "200":
          description: User found
          content:
            application/json:
              schema: { $ref: "#/components/schemas/User" }
        "404": { $ref: "#/components/responses/NotFound" }

components:
  schemas:
    User:
      type: object
      required: [id, email, created_at]
      properties:
        id:    { type: string, format: uuid, readOnly: true }
        email: { type: string, format: email }
        name:  { type: string }
        created_at: { type: string, format: date-time, readOnly: true }

    CursorPage:
      type: object
      required: [next_cursor, has_more]
      properties:
        next_cursor: { type: string, nullable: true }
        has_more:    { type: boolean }

    Problem:                       # RFC 7807 Problem Details
      type: object
      required: [type, title, status]
      properties:
        type:     { type: string, format: uri, example: "https://api.example.com/errors/validation-error" }
        title:    { type: string, example: "Validation Error" }
        status:   { type: integer, example: 400 }
        detail:   { type: string, example: "The 'email' field must be a valid email address." }
        instance: { type: string, format: uri, example: "/users/req-abc123" }

  responses:
    BadRequest:
      description: Invalid request parameters
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    Unauthorized:
      description: Missing or invalid authentication
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    NotFound:
      description: Resource not found
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }
    TooManyRequests:
      description: Rate limit exceeded
      headers:
        Retry-After: { schema: { type: integer } }
      content:
        application/problem+json:
          schema: { $ref: "#/components/schemas/Problem" }

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

### RFC 7807 错误响应（可直接复制粘贴）

```json
{
  "type": "https://api.example.com/errors/validation-error",
  "title": "Validation Error",
  "status": 422,
  "detail": "The 'email' field must be a valid email address.",
  "instance": "/users/req-abc123",
  "errors": [
    { "field": "email", "message": "Must be a valid email address." }
  ]
}
```

- 错误响应始终使用 `Content-Type: application/problem+json`。
- `type` 必须是稳定且有文档记录的 URI——绝不能使用通用字符串。
- `detail` 必须是人类可读且具有可操作性的。
- 对于字段级验证失败，使用 `errors[]` 进行扩展。

## 输出检查清单

交付 API 设计时，请提供：
1. 资源模型及其关系（图表或表格）
2. 包含 URI 和 HTTP 方法的端点规范
3. OpenAPI 3.1 规范（YAML）
4. 身份验证和授权流程
5. 错误响应目录（所有 4xx/5xx，并包含 `type` URI）
6. 分页和筛选模式
7. 版本控制和弃用策略
8. 验证结果：`npx @redocly/cli lint openapi.yaml` 在无错误的情况下通过

## 知识参考

REST 架构、OpenAPI 3.1、GraphQL、HTTP 语义、JSON:API、HATEOAS、OAuth 2.0、JWT、RFC 7807 Problem Details、API 版本控制模式、分页策略、速率限制、Webhook 设计、SDK 生成

[文档](https://jeffallan.github.io/claude-skills/skills/api-architecture/api-designer/)。