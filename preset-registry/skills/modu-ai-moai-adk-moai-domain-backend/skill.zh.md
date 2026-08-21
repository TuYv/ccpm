---
name: moai-domain-backend
description: >
  Backend development specialist covering API design, database integration,
  microservices architecture, and modern backend patterns. Use when designing
  APIs, implementing server logic, authentication, or authorization.

when_to_use: >
  Use for backend work: API design (REST, GraphQL, gRPC), server logic,
  authentication and authorization, microservices, middleware, caching,
  and frameworks (FastAPI, Express, Django, Flask). Covers serverless,
  PostgreSQL, MongoDB, and Redis integration.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Bash(npm:*), Bash(npx:*), Bash(node:*), Bash(uv:*), Bash(pip:*), Bash(pytest:*), Bash(ruff:*), Bash(docker:*), Bash(curl:*), Bash(go:*), Bash(cargo:*), Grep, Glob
user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-01-11"
  modularized: "false"
  tags: "backend, api, database, microservices, architecture"
  author: "MoAI-ADK Team"
---
# 后端开发专家

## 快速参考

后端开发精通——全面的后端开发模式，涵盖 API 设计、数据库集成、微服务和现代架构模式。

核心能力：

- API 设计：采用 OpenAPI 3.1 的 REST、GraphQL、gRPC
- 数据库集成：PostgreSQL、MongoDB、Redis、缓存策略
- 微服务：服务网格、分布式模式、事件驱动架构
- 安全性：身份认证、授权、OWASP 合规性
- 性能：缓存、优化、监控、扩展

适用场景：

- 后端 API 开发与架构设计
- 数据库设计与优化
- 微服务实现
- 性能优化与扩展
- 后端系统的安全集成

---

## 实现指南

### API 设计模式

RESTful API 架构：

创建一个具有身份认证和响应模型的 FastAPI 应用程序。定义一个包含 id、email 和 name 字段的 Pydantic UserResponse 模型。使用 HTTPBearer 安全依赖项实现 list_users 和 create_user 端点。列表端点返回 UserResponse 对象列表，而创建端点接受 UserCreate 模型并返回单个 UserResponse。

GraphQL 实现：

使用 Strawberry 定义 GraphQL 类型。创建一个包含 id、email 和 name 字段的 User 类型。定义一个 Query 类型，其中包含异步返回 User 对象列表的 users 解析器。通过将 Query 类型传递给 strawberry.Schema 来生成 schema。

### 数据库集成模式

结合 SQLAlchemy 使用 PostgreSQL：

使用 declarative_base 定义 SQLAlchemy 模型。创建一个 User 模型，其中 id 为主键，email 为唯一字符串，name 为字符串列。配置具有连接池参数的 engine，包括值为 20 的 pool_size、值为 30 的 max_overflow，并启用 pool_pre_ping 以进行连接健康检查。

结合 Motor 使用 MongoDB：

创建一个使用 AsyncIOMotorClient 初始化的 UserService 类。在构造函数中设置 database 和 users collection。为 email（唯一）和 created_at 字段创建索引。实现 create_user 方法，该方法插入一个 document，并以字符串形式返回 inserted_id。

### 微服务架构

使用 Consul 进行服务发现：

创建一个连接到 Consul 的 ServiceRegistry 类。实现 register_service 方法，使用 name、id、port 和健康检查端点注册服务。实现 discover_service 方法，该方法查询健康的服务，并返回 address:port 字符串列表。

事件驱动架构：

创建一个使用 aio_pika 进行 AMQP 消息传递的 EventBus 类。实现 connect 方法以建立 connection 和 channel。实现 publish_event 方法，将 event type 和 data 序列化为 JSON，并发布到 default exchange，其中 routing_key 与 event type 匹配。

---

## 高级模式

### 缓存策略

Redis 集成：

创建一个具有 Redis 连接的 CacheManager 类。实现一个接受 ttl 参数的 cache_result 装饰器。该装饰器根据 function name 和 arguments 生成 cache keys，在 Redis 中检查 cached results，在 cache miss 时执行 function，并存储带有 expiration 的 results。使用 json.loads 和 json.dumps 进行序列化。

### 安全实现

JWT 身份验证：

创建一个 SecurityManager 类，使用 CryptContext 进行 bcrypt 密码哈希。使用该上下文实现 hash_password 和 verify_password 方法。实现 create_access_token，使用 HS256 算法对包含过期时间的 JWT 进行编码。如果未指定，默认过期时间为 15 分钟。

### 性能优化

数据库连接池：

使用 QueuePool 创建经过优化的 SQLAlchemy 引擎，将 pool_size 设置为 20、max_overflow 设置为 30、启用 pool_pre_ping，并将 pool_recycle 设置为 3600 秒。为 before_cursor_execute 和 after_cursor_execute 添加事件监听器，以跟踪查询耗时。对于超过 100ms 阈值的查询，记录警告日志。

---

## 配合使用效果良好

- moai-domain-frontend - 全栈开发集成
- moai-domain-database - 高级数据库模式
- moai-foundation-core - 用于后端服务的 MCP 服务器开发模式
- `moai-foundation-quality` + `moai-ref-owasp-checklist` - 安全验证与合规
- moai-foundation-core - 核心架构原则

---

## 技术栈

主要技术：

- 语言：Python 3.13+、Node.js 20+、Go 1.23
- 框架：FastAPI、Django、Express.js、Gin
- 数据库：PostgreSQL 16+、MongoDB 7+、Redis 7+
- 消息队列：RabbitMQ、Apache Kafka、Redis Pub/Sub
- 容器化：Docker、Kubernetes
- 监控：Prometheus、Grafana、OpenTelemetry

集成模式：

- 使用 OpenAPI 3.1 的 RESTful API
- 使用 Apollo Federation 的 GraphQL
- 用于高性能服务的 gRPC
- 使用 CQRS 的事件驱动架构
- API Gateway 模式
- 熔断器与弹性模式

---

状态：生产就绪
维护团队：MoAI-ADK Backend Team

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “输入验证可以在前端完成” | 前端验证关乎用户体验。后端验证关乎安全。两者用途不同，缺一不可。 |
| “这个端点是内部端点，不需要身份验证” | 已遭入侵的服务可以访问内部端点。零信任意味着每个端点都必须验证身份。 |
| “我稍后再添加错误处理” | 未处理的错误会泄露堆栈跟踪、连接字符串和内部状态。错误处理是从第一天起就必须完成的工作。 |
| “ORM 会处理 SQL 注入” | ORM 能保护参数化查询。原始查询、动态过滤器和 ORDER BY 子句仍然需要转义。 |
| “此 API 向后兼容，不需要提升版本号” | 删除可选字段、更改默认值或改变错误格式，对现有调用方而言都是破坏性变更。 |
| “微服务有些小题大做，我只需再添加一个端点” | 端点无限制增长会形成伪装的单体架构。添加端点前应先评估服务边界。 |

**海勒姆定律**：当用户数量足够多时，你的 API 的每一种可观察行为都会被某些人所依赖。任何变更，无论多么微不足道，都可能破坏某些人的使用方式。

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- API 端点接受用户输入，但未进行验证或清理
- 错误响应包含堆栈跟踪或内部路径信息
- 数据库凭据被硬编码在源代码中，而非通过环境变量提供
- 面向公众的端点未配置速率限制
- API 对所有失败情况均返回 200 OK，并在响应正文中包含错误信息
- 使用字符串拼接构建原始 SQL 查询

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] 每个端点在处理前都会验证输入（展示验证中间件或检查逻辑）
- [ ] 错误响应使用不含内部详细信息的标准格式（展示错误响应示例）
- [ ] 凭据来自环境变量，而非配置文件（使用 grep 查找硬编码的密钥）
- [ ] 已在公共端点上配置速率限制（展示中间件注册）
- [ ] API 版本控制策略已记录并强制执行
- [ ] 数据库查询使用参数化语句（不使用字符串拼接来处理用户输入）
- [ ] 所有非公共端点均要求身份验证（展示身份验证中间件）

<!-- moai:evolvable-end -->