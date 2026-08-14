---
name: designing-apis
description: Designs REST and GraphQL APIs including endpoints, error handling, versioning, and documentation. Use when creating new APIs, designing endpoints, reviewing API contracts, or when asked about REST, GraphQL, or API patterns.
---
# API 设计

### 何时加载

- **触发条件**：设计 REST 或 GraphQL 端点、API 契约、版本控制、请求/响应格式
- **跳过条件**：没有 API 接口的纯内部代码

## API 设计工作流

复制此检查清单并跟踪进度：

```
API Design Progress:
- [ ] Step 1: Define resources and relationships
- [ ] Step 2: Design endpoint structure
- [ ] Step 3: Define request/response formats
- [ ] Step 4: Plan error handling
- [ ] Step 5: Add authentication/authorization
- [ ] Step 6: Document with OpenAPI spec
- [ ] Step 7: Validate design against checklist
```

## REST API 设计

### URL 结构

```
# Resource-based URLs (nouns, not verbs)
GET    /users              # List users
GET    /users/:id          # Get user
POST   /users              # Create user
PUT    /users/:id          # Replace user
PATCH  /users/:id          # Update user
DELETE /users/:id          # Delete user

# Nested resources
GET    /users/:id/orders   # User's orders
POST   /users/:id/orders   # Create order for user

# Query parameters for filtering/pagination
GET    /users?role=admin&status=active
GET    /users?page=2&limit=20&sort=-createdAt
```

### HTTP 状态码

| 代码 | 含义              | 使用场景                    |
| ---- | ----------------- | --------------------------- |
| 200  | 成功              | GET、PUT、PATCH 成功        |
| 201  | 已创建            | POST 成功                   |
| 204  | 无内容            | DELETE 成功                 |
| 400  | 错误请求          | 输入无效                    |
| 401  | 未认证            | 缺少身份认证或认证无效      |
| 403  | 禁止访问          | 身份认证有效，但没有权限    |
| 404  | 未找到            | 资源不存在                  |
| 409  | 冲突              | 数据重复、状态冲突          |
| 422  | 无法处理          | 验证失败                    |
| 429  | 请求过多          | 受到速率限制                |
| 500  | 内部错误          | 服务器错误                  |

### 响应格式

**成功响应：**

```json
{
  "data": {
    "id": "123",
    "type": "user",
    "attributes": {
      "name": "John Doe",
      "email": "john@example.com"
    }
  },
  "meta": {
    "requestId": "abc-123"
  }
}
```

**带分页的列表响应：**

```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  },
  "links": {
    "self": "/users?page=1",
    "next": "/users?page=2",
    "last": "/users?page=5"
  }
}
```

**错误响应：**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address"
      }
    ]
  },
  "meta": {
    "requestId": "abc-123"
  }
}
```

## API 版本控制

**URL 版本控制（推荐）：**

```
/api/v1/users
/api/v2/users
```

**请求头版本控制：**

```
Accept: application/vnd.api+json; version=1
```

## 身份认证模式

**JWT Bearer 令牌：**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

**API 密钥：**

```
X-API-Key: your-api-key
```

## 速率限制响应头

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1609459200
Retry-After: 60
```

## GraphQL 模式

**模式设计：**

```graphql
type Query {
  user(id: ID!): User
  users(filter: UserFilter, pagination: Pagination): UserConnection!
}

type Mutation {
  createUser(input: CreateUserInput!): UserPayload!
  updateUser(id: ID!, input: UpdateUserInput!): UserPayload!
}

type User {
  id: ID!
  name: String!
  email: String!
  orders(first: Int, after: String): OrderConnection!
}

input CreateUserInput {
  name: String!
  email: String!
}

type UserPayload {
  user: User
  errors: [Error!]
}
```

## OpenAPI 规范模板

完整的 OpenAPI 3.0 规范模板请参阅 [OPENAPI-TEMPLATE.md](OPENAPI-TEMPLATE.md)。

## API 设计验证

完成设计后，请根据以下检查清单进行验证：

```
Validation Checklist:
- [ ] All endpoints use nouns, not verbs
- [ ] HTTP methods match operations correctly
- [ ] Consistent response format across endpoints
- [ ] Error responses include actionable details
- [ ] Pagination implemented for list endpoints
- [ ] Authentication defined for protected endpoints
- [ ] Rate limiting headers documented
- [ ] OpenAPI spec is complete and valid
```

如果验证失败，请返回相关设计步骤并解决问题。

## 安全检查清单

- [ ] 仅使用 HTTPS
- [ ] 所有端点均需身份验证
- [ ] 授权检查
- [ ] 输入验证
- [ ] 速率限制
- [ ] 请求大小限制
- [ ] 正确配置 CORS
- [ ] URL 中不包含敏感数据
- [ ] 审计日志