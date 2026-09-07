---
name: saga-orchestration
description: Implement saga patterns for distributed transactions and cross-aggregate workflows. Use this skill when implementing distributed transactions across microservices where 2PC is unavailable, designing compensating actions for failed order workflows that span inventory, payment, and shipping services, building event-driven saga coordinators for travel booking systems that must roll back hotel, flight, and car rental reservations atomically, or debugging stuck saga states in production where compensation steps never complete.
---
# Saga 编排

用于管理分布式事务和长时间运行业务流程的模式，无需两阶段提交。

## 输入与输出

**你需要提供：**
- 服务边界与所有权（哪个服务拥有哪个步骤）
- 事务需求（哪些步骤必须原子完成，哪些可以最终一致）
- 每个步骤的失败模式（瞬时失败与永久失败、重试策略）
- 每个步骤的 SLA 要求（用于确定超时配置）
- 现有的事件/消息基础设施（Kafka、RabbitMQ、SQS 等）

**本技能产出：**
- 包含有序步骤、动作命令和补偿命令的 Saga 定义
- 针对你所选模式的编排器或协同式实现
- 每个参与服务的补偿逻辑（幂等、必定成功）
- 带逐步骤截止时间的步骤超时配置
- 监控设置：状态机指标、Saga 卡滞检测、DLQ 恢复

---

## 何时使用本技能

- 在不使用分布式锁的情况下协调多服务事务
- 为部分失败实现补偿事务
- 管理长时间运行的业务工作流（数分钟到数小时）
- 在需要原子性的分布式系统中处理失败
- 构建订单履约、审批或预订流程
- 用异步补偿替代脆弱的两阶段提交

---

## 详细章节：核心概念

已移至 `references/details.md`。

## 详细章节：模板

已移至 `references/details.md`。

## 最佳实践

### 应该做的

- **让每个步骤都幂等** — 命令可能会在代理重连时被重放
- **精心设计补偿逻辑** — 它们是最关键的代码路径
- **使用关联 ID** — `saga_id` 必须贯穿每个事件和日志
- **实现逐步骤超时** — 永远不要无限期等待参与者回复
- **记录状态转换** — 每次变更时记录 `saga_id`、`step_name`、`old_state → new_state`
- **显式测试补偿路径** — 在集成测试中在每个步骤索引处注入失败

### 不应该做的

- **不要假设即时完成** — Saga 是异步的，可能需要数分钟
- **不要跳过补偿测试** — 回滚路径是最难做对的部分
- **不要直接耦合服务** — 使用异步消息传递，在 Saga 步骤内绝不使用同步调用
- **不要忽略部分失败** — 已部分执行的步骤仍然需要补偿
- **不要使用全局超时** — 每个步骤有不同的延迟特征

---

## 故障排查

### Saga 卡在 COMPENSATING 状态

Saga 进入补偿流程但始终无法到达 FAILED 状态。这说明某个补偿处理器抛出了未处理的异常，导致 `SagaCompensationCompleted` 从未被发布。为补偿消费者添加死信队列（DLQ）处理，并确保每个补偿动作都发布结果事件，即使底层操作已经被回滚。

```python
async def handle_release_reservation(self, command: Dict):
    try:
        await self.release_reservation(command["original_result"]["reservation_id"])
    except ReservationNotFoundError:
        pass  # Already released — treat as success
    # Always publish completion, regardless of outcome
    await self.event_publisher.publish("SagaCompensationCompleted", {
        "saga_id": command["saga_id"],
        "step_name": "reserve_inventory"
    })
```

### 重启后 Saga 重复执行

如果编排器服务在 Saga 执行中途重启，它可能会重放事件并重新执行已完成的步骤。用幂等键保护每个步骤动作——参见上文的**模板 3**。

### 协同式 Saga 丢失事件

在基于协同的 Saga 中，如果下游服务在事件发布时处于离线状态，可能会错过该事件。使用持久化的消息代理（启用副本的 Kafka、启用持久化的 RabbitMQ），并将当前 Saga 状态存储在专门的 `saga_log` 表中，以便从最后一个已知正常步骤开始重放。

### 超时在缓慢但有效的步骤完成之前触发

像 `create_shipment` 这样的步骤在峰值负载下可能需要长达 15 分钟，而你的全局超时是 5 分钟，从而导致误触发补偿。让步骤超时可按步骤类型配置——参见 `references/advanced-patterns.md` 了解 `TimeoutSagaOrchestrator` 实现和 `STEP_TIMEOUTS` 字典模式。

### 补偿顺序与执行顺序不匹配

当两个步骤都在失败被检测到之前已完成时，补偿必须严格按照相反的顺序执行，否则数据将处于不一致状态。验证 `_compensate()` 是从 `current_step - 1` 向下迭代到 `0`，并添加一个在每个步骤索引处故意失败的集成测试，以确认回滚顺序正确。

---

## 高级模式

`references/` 目录包含大多数 Saga 并不需要的生产级实现：

- **`references/advanced-patterns.md`** — 完整的 `SagaOrchestrator` 抽象基类、带逐步骤截止时间的 `TimeoutSagaOrchestrator`、详细的银行转账补偿事务链、Prometheus 监控埋点、Saga 卡滞 PromQL 告警，以及 DLQ 恢复工作器。

---

## 相关技能

- `cqrs-implementation` — 将 Saga 与 CQRS 结合，在每步完成后更新读模型
- `event-store-design` — 将 Saga 事件存储在事件存储中，以获得完整审计追踪和重放能力
- `workflow-orchestration-patterns` — 基于 Saga 概念构建的更高层工作流引擎（Temporal、Conductor）
