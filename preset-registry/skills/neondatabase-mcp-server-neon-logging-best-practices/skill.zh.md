---
name: logging-best-practices
description: Logging best practices focused on wide events (canonical log lines) for powerful debugging and analytics
license: MIT
metadata:
  author: boristane
  version: "1.0.0"
---
# 日志记录最佳实践技能

版本：1.0.0

## 目的

本技能提供了在应用程序中实现有效日志记录的指导原则。它重点介绍**宽事件**（也称为规范日志行）——一种为每个服务中的每个请求仅发出一个上下文丰富事件的模式，从而实现强大的调试和分析能力。

## 适用场景

在以下情况下应用这些指导原则：
- 编写或审查日志记录代码
- 添加 console.log、logger.info 或类似调用
- 为新服务设计日志记录策略
- 搭建日志记录基础设施

## 核心原则

### 1. 宽事件（关键）

为每个服务中的每个请求发出**一个上下文丰富的事件**。不要在处理程序中到处分散记录日志行，而应将所有信息整合到一个结构化事件中，并在请求完成时发出。

```typescript
const wideEvent: Record<string, unknown> = {
  method: 'POST',
  path: '/checkout',
  requestId: c.get('requestId'),
  timestamp: new Date().toISOString(),
};

try {
  const user = await getUser(c.get('userId'));
  wideEvent.user = { id: user.id, subscription: user.subscription };

  const cart = await getCart(user.id);
  wideEvent.cart = { total_cents: cart.total, item_count: cart.items.length };

  wideEvent.status_code = 200;
  wideEvent.outcome = 'success';
  return c.json({ success: true });
} catch (error) {
  wideEvent.status_code = 500;
  wideEvent.outcome = 'error';
  wideEvent.error = { message: error.message, type: error.name };
  throw error;
} finally {
  wideEvent.duration_ms = Date.now() - startTime;
  logger.info(wideEvent);
}
```

### 2. 高基数与高维度（关键）

包含高基数字段（用户 ID、请求 ID——可能有数百万个唯一值）和高维度信息（每个事件包含大量字段）。这样便能按特定用户进行查询，并回答那些你尚未预想到的问题。

### 3. 业务上下文（关键）

始终包含业务上下文：用户订阅等级、购物车价值、功能标志、账户使用时长。目标是了解“某位高级客户无法完成一笔 2,499 美元的购买”，而不只是“结账失败”。

### 4. 环境特征（关键）

在每个事件中包含环境和部署信息：提交哈希、服务版本、区域、实例 ID。这样便能将问题与部署关联起来，并识别特定区域的问题。

### 5. 单一日志记录器（高）

使用一个在启动时配置的日志记录器实例，并在所有位置导入它。这可以确保格式一致，并自动包含环境上下文。

### 6. 中间件模式（高）

使用中间件处理宽事件基础设施（计时、状态、环境、事件发出）。处理程序应只添加业务上下文。

### 7. 结构与一致性（高）

- 始终使用 JSON 格式
- 在各个服务之间保持字段名称一致
- 将日志级别简化为两种：`info` 和 `error`
- 绝不记录非结构化字符串

## 应避免的反模式

1. **分散的日志**：每个请求调用多次 console.log()
2. **多个日志记录器**：不同文件使用不同的日志记录器实例
3. **缺少环境上下文**：没有提交哈希或部署信息
4. **缺少业务上下文**：只记录技术细节，不包含用户或业务数据
5. **非结构化字符串**：使用 `console.log('something happened')`，而不是结构化数据
6. **不一致的模式**：不同服务使用不同的字段名称

## 指南

### 宽事件（`rules/wide-events.md`）
- 每次服务调用发出一个宽事件
- 包含所有相关上下文
- 使用请求 ID 关联事件
- 在请求完成时于 finally 块中发出事件

### 上下文（`rules/context.md`）
- 支持高基数字段（user_id、request_id）
- 包含高维度信息（多个字段）
- 始终包含业务上下文
- 始终包含环境特征（commit_hash、version、region）

### 结构（`rules/structure.md`）
- 在整个代码库中使用单一日志记录器
- 使用中间件确保宽事件的一致性
- 使用 JSON 格式
- 保持 schema 一致
- 将日志级别简化为 info 和 error
- 切勿记录非结构化字符串

### 常见陷阱（`rules/pitfalls.md`）
- 避免为每个请求记录多行日志
- 针对未知的未知进行设计
- 始终在服务之间传递请求 ID

参考资料：
- [日志很糟糕](https://loggingsucks.com)
- [可观测性宽事件 101](https://boristane.com/blog/observability-wide-events-101/)
- [Stripe - 规范日志行](https://stripe.com/blog/canonical-log-lines)