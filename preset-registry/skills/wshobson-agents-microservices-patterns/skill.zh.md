---
name: microservices-patterns
description: Design microservices architectures with service boundaries, event-driven communication, and resilience patterns. Use when building distributed systems, decomposing monoliths, or implementing microservices.
---
# 微服务模式

深入掌握微服务架构模式，包括服务边界、服务间通信、数据管理，以及构建分布式系统所需的弹性模式。

## 何时使用此技能

- 将单体应用拆分为微服务
- 设计服务边界与契约
- 实现服务间通信
- 管理分布式数据与事务
- 构建具备弹性的分布式系统
- 实现服务发现与负载均衡
- 设计事件驱动架构

## 核心概念

### 1. 服务拆分策略

**按业务能力**

- 围绕业务职能组织服务
- 每个服务拥有自己的领域
- 示例：OrderService、PaymentService、InventoryService

**按子域（DDD）**

- 核心域、支撑子域
- 限界上下文映射到服务
- 清晰的所有权与职责

**绞杀者模式（Strangler Fig）**

- 从单体应用中逐步抽离
- 新功能以微服务形式实现
- 由代理将请求路由到旧/新系统

### 2. 通信模式

**同步（请求/响应）**

- REST API
- gRPC
- GraphQL

**异步（事件/消息）**

- 事件流（Kafka）
- 消息队列（RabbitMQ、SQS）
- 发布/订阅模式

### 3. 数据管理

**每个服务一个数据库**

- 每个服务拥有自己的数据
- 不共享数据库
- 松耦合

**Saga 模式**

- 分布式事务
- 补偿操作
- 最终一致性

### 4. 弹性模式

**熔断器（Circuit Breaker）**

- 连续出错时快速失败
- 防止级联故障

**带退避的重试**

- 处理瞬时故障
- 指数退避

**舱壁模式（Bulkhead）**

- 隔离资源
- 限制故障的影响范围

## 详细模式与实战示例

详细的模式文档位于 `references/details.md`。当上方的导航层级内容不够用时，请阅读该文件。
