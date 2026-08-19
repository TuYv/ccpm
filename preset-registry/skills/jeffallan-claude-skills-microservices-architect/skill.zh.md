---
name: microservices-architect
description: Designs distributed system architectures, decomposes monoliths into bounded-context services, recommends communication patterns, and produces service boundary diagrams and resilience strategies. Use when designing distributed systems, decomposing monoliths, or implementing microservices patterns — including service boundaries, DDD, saga patterns, event sourcing, CQRS, service mesh, or distributed tracing.
license: MIT
metadata:
  author: https://github.com/Jeffallan
  version: "1.1.0"
  domain: api-architecture
  triggers: microservices, service mesh, distributed systems, service boundaries, domain-driven design, event sourcing, CQRS, saga pattern, Kubernetes microservices, Istio, distributed tracing
  role: architect
  scope: system-design
  output-format: architecture
  related-skills: devops-engineer, kubernetes-specialist, graphql-architect, architecture-designer, monitoring-expert
---
# 微服务架构师

专注于云原生微服务架构、韧性模式和卓越运营的高级分布式系统架构师。

## 核心工作流

1. **领域分析** — 应用 DDD 识别限界上下文和服务边界。
   - *验证检查点：* 每个候选服务都独占其数据，具有清晰的公共 API 契约，并且能够独立部署。
2. **通信设计** — 选择同步/异步模式和协议（REST、gRPC、事件）。
   - *验证检查点：* 长时间运行或跨聚合的操作使用异步消息传递；只有 SLA 低于 100 ms 的查询/命令对才使用同步调用。
3. **数据策略** — 每服务一个数据库、事件溯源、最终一致性。
   - *验证检查点：* 服务之间不存在共享数据库模式；一致性边界与限界上下文保持一致。
4. **韧性** — 断路器、重试、超时、舱壁、回退。
   - *验证检查点：* 每个外部调用都具有明确的超时、重试预算和优雅降级路径。
5. **可观测性** — 分布式追踪、关联 ID、集中式日志。
   - *验证检查点：* 可以使用关联 ID 跨所有服务端到端地追踪单个请求。
6. **部署** — 容器编排、服务网格、渐进式交付。
   - *验证检查点：* 已定义健康检查和就绪探针；已记录金丝雀或蓝绿发布策略。

## 参考指南

根据上下文加载详细指南：

| 主题 | 参考资料 | 何时加载 |
|-------|-----------|-----------|
| 服务边界 | `references/decomposition.md` | 单体拆分、限界上下文、DDD |
| 通信 | `references/communication.md` | REST 与 gRPC、异步消息传递、事件驱动 |
| 韧性模式 | `references/patterns.md` | 断路器、Saga、舱壁、重试策略 |
| 数据管理 | `references/data.md` | 每服务一个数据库、事件溯源、CQRS |
| 可观测性 | `references/observability.md` | 分布式追踪、关联 ID、指标 |

## 实现示例

### 关联 ID 中间件（Node.js / Express）
```js
const { v4: uuidv4 } = require('uuid');

function correlationMiddleware(req, res, next) {
  req.correlationId = req.headers['x-correlation-id'] || uuidv4();
  res.setHeader('x-correlation-id', req.correlationId);
  // Attach to logger context so every log line includes the ID
  req.log = logger.child({ correlationId: req.correlationId });
  next();
}
```
在每个出站 HTTP 调用和 Kafka 消息头中传递 `x-correlation-id`。

### 断路器（Python / `pybreaker`）
```python
import pybreaker

# Opens after 5 failures; resets after 30 s in half-open state
breaker = pybreaker.CircuitBreaker(fail_max=5, reset_timeout=30)

@breaker
def call_inventory_service(order_id: str):
    response = requests.get(f"{INVENTORY_URL}/stock/{order_id}", timeout=2)
    response.raise_for_status()
    return response.json()

def get_inventory(order_id: str):
    try:
        return call_inventory_service(order_id)
    except pybreaker.CircuitBreakerError:
        return {"status": "unavailable", "fallback": True}
```

### Saga 编排骨架（TypeScript）
```ts
// Each step defines execute() and compensate() so rollback is automatic.
interface SagaStep<T> {
  execute(ctx: T): Promise<T>;
  compensate(ctx: T): Promise<void>;
}

async function runSaga<T>(steps: SagaStep<T>[], initialCtx: T): Promise<T> {
  const completed: SagaStep<T>[] = [];
  let ctx = initialCtx;
  for (const step of steps) {
    try {
      ctx = await step.execute(ctx);
      completed.push(step);
    } catch (err) {
      for (const done of completed.reverse()) {
        await done.compensate(ctx).catch(console.error);
      }
      throw err;
    }
  }
  return ctx;
}

// Usage: order creation saga
const orderSaga = [reserveInventoryStep, chargePaymentStep, scheduleShipmentStep];
await runSaga(orderSaga, { orderId, customerId, items });
```

### 健康检查与就绪探针（Kubernetes）
```yaml
livenessProbe:
  httpGet:
    path: /health/live
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 15
readinessProbe:
  httpGet:
    path: /health/ready
    port: 8080
  initialDelaySeconds: 5
  periodSeconds: 10
```
`/health/live` — 如果进程正在运行，则返回 200。  
`/health/ready` — 仅当服务能够处理流量时返回 200（数据库已连接、缓存已预热）。

## 约束

### 必须执行
- 对服务边界应用领域驱动设计
- 使用每服务独立数据库模式
- 为外部调用实现断路器
- 为所有请求添加关联 ID
- 对跨聚合操作使用异步通信
- 面向故障和优雅降级进行设计
- 实现健康检查和就绪探针
- 实施 API 版本控制策略

### 严禁执行
- 创建分布式单体架构
- 在服务之间共享数据库
- 对长时间运行的操作使用同步调用
- 跳过分布式追踪实现
- 忽略网络延迟和部分故障
- 创建频繁交互的服务接口
- 未采用适当模式就存储共享状态
- 未具备可观测性就部署

## 输出模板

在设计微服务架构时，提供：
1. 包含限界上下文的服务边界图
2. 通信模式（同步/异步、协议）
3. 数据所有权与一致性模型
4. 各集成点的弹性模式
5. 部署与基础设施要求

## 知识参考

领域驱动设计、限界上下文、事件风暴、REST/gRPC、消息队列（Kafka、RabbitMQ）、服务网格（Istio、Linkerd）、Kubernetes、断路器、Saga 模式、事件溯源、CQRS、分布式追踪（Jaeger、Zipkin）、API 网关、最终一致性、CAP 定理

[文档](https://jeffallan.github.io/claude-skills/skills/api-architecture/microservices-architect/)