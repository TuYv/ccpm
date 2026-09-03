---
name: api-design-principles
description: Master REST and GraphQL API design principles to build intuitive, scalable, and maintainable APIs that delight developers. Use when designing new APIs, reviewing API specifications, or establishing API design standards.
---
# API 设计原则

掌握 REST 和 GraphQL API 设计原则，构建直观、可扩展且易于维护的 API，让开发者用得舒心，并经得起时间的考验。

## 何时使用此技能

- 设计新的 REST 或 GraphQL API
- 重构现有 API 以提升易用性
- 为团队制定 API 设计规范
- 在实现之前审查 API 规范
- 在 API 范式之间迁移（如 REST 迁移到 GraphQL）
- 创建对开发者友好的 API 文档
- 针对特定用例（移动端、第三方集成）优化 API

## 核心概念

### 1. RESTful 设计原则

**面向资源的架构**

- 资源是名词（用户、订单、产品），而不是动词
- 使用 HTTP 方法表示操作（GET、POST、PUT、PATCH、DELETE）
- URL 表示资源层级结构
- 一致的命名约定

**HTTP 方法语义：**

- `GET`：获取资源（幂等、安全）
- `POST`：创建新资源
- `PUT`：替换整个资源（幂等）
- `PATCH`：部分更新资源
- `DELETE`：删除资源（幂等）

### 2. GraphQL 设计原则

**Schema 优先开发**

- 类型定义你的领域模型
- Query 用于读取数据
- Mutation 用于修改数据
- Subscription 用于实时更新

**查询结构：**

- 客户端精确请求自己需要的数据
- 单一端点，多种操作
- 强类型 schema
- 内置自省（Introspection）功能

### 3. API 版本控制策略

**URL 版本控制：**

```
/api/v1/users
/api/v2/users
```

**请求头版本控制：**

```
Accept: application/vnd.api+json; version=1
```

**查询参数版本控制：**

```
/api/users?version=1
```

## 详细模式与完整示例

详细的模式文档位于 `references/details.md`。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

### REST API

1. **命名一致**：集合使用复数名词（`/users`，而不是 `/user`）
2. **无状态**：每个请求都包含所有必要信息
3. **正确使用 HTTP 状态码**：2xx 表示成功，4xx 表示客户端错误，5xx 表示服务器错误
4. **为 API 设置版本**：从第一天起就为破坏性变更做好规划
5. **分页**：大型集合始终进行分页
6. **限流**：通过速率限制保护你的 API
7. **文档**：使用 OpenAPI/Swagger 提供交互式文档

### GraphQL API

1. **Schema 优先**：在编写 resolver 之前先设计 schema
2. **避免 N+1 问题**：使用 DataLoader 实现高效的数据获取
3. **输入验证**：在 schema 和 resolver 层级进行验证
4. **错误处理**：在 mutation 载荷中返回结构化的错误
5. **分页**：使用基于游标的分页（Relay 规范）
6. **弃用管理**：使用 `@deprecated` 指令实现渐进式迁移
7. **监控**：跟踪查询复杂度和执行时间

## 常见陷阱

- **过度获取/获取不足（REST）**：在 GraphQL 中已得到解决，但需要使用 DataLoader
- **破坏性变更**：对 API 进行版本控制或采用弃用策略
- **错误格式不一致**：统一错误响应格式
- **缺少速率限制**：没有限制的 API 容易被滥用
- **文档质量差**：缺乏文档的 API 会让开发者感到沮丧
- **忽视 HTTP 语义**：用 POST 执行幂等操作会违背预期
- **紧密耦合**：API 结构不应照搬数据库 schema
