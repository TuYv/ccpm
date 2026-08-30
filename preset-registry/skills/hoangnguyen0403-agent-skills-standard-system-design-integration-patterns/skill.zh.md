---
name: system-design-integration-patterns
description: "Choose distributed integration and evolution patterns by the constraint each removes: outbox, CQRS, event sourcing, saga orchestration or choreography, leader election, sidecar, anti-corruption layer, and strangler-fig migration. Use when services must stay consistent across a boundary."
metadata:
  triggers:
    keywords:
      - cqrs
      - event sourcing
      - saga
      - outbox
      - leader election
      - sidecar
      - strangler fig
      - backends for frontends
      - anti-corruption layer
      - choreography
---
# 集成模式

## **优先级：P1（高）**

每种模式都能换来一项保证，同时增加运维复杂度。应基于证据采用，而不是追逐架构时尚。

## 选择表

| 观察到的约束 | 模式 | 接受的成本 |
| --- | --- | --- |
| 一次写入必须以原子方式更新数据库并发布事件 | 事务型发件箱 | 需要运行和监控一个中继器（轮询器或 CDC） |
| 读模型和写模型已经分化，一个模型无法同时满足两者 | CQRS | 两个模型、同步延迟、测试量翻倍 |
| 变更序列本身就是产品（审计、重放、时间查询） | 事件溯源 | 投影、事件版本管理、无法轻易删除 |
| 一个业务事务跨越多个服务且无法持有锁 | 带补偿的 Saga | 每个步骤都需要补偿操作；不具备隔离性 |
| 一个作业只能由一个实例运行，或一个资源只能由一个实例持有 | 领导者选举（基于租约） | 栅栏令牌；处理脑裂 |
| 每个服务中都重复出现横切关注点 | Sidecar 或 ambassador | 每个 pod 都需要额外运行一个进程 |
| 遗留模型或第三方模型会污染领域模型 | 防腐层 | 需要维护一个转换层 |
| 每个客户端界面都需要不同的聚合形状 | 前端专用后端 | 每个界面对应一个后端，并由相应团队负责 |
| 必须替换单体应用，但不能冻结重写工作 | 绞杀者模式 | 双重路由，以及在最后一个切片迁移完成前持续存在的在线接缝 |

## 边界之间的一致性

- 永远不要双写。写入自己的存储，然后从发件箱或 CDC 流中发布；其他做法都会悄无声息地产生偏差。
- Saga 编排将顺序放在一个协调器中：步骤超过约 4 个时，或需要统一推理补偿操作时，使用编排。
- Saga 协同让每个服务对事件作出反应：对于已经能够发布事件的 2～3 个服务之间的短流程，使用协同。
- 每个 Saga 步骤都必须在实现之前定义好补偿操作。没有补偿操作的步骤，必须移到末尾，或变为可幂等重试的步骤。
- 关联所有内容：使用一个 ID 贯穿整个流程中的日志、事件和补偿操作。

## 演进

- 绞杀者模式：通过门面一次路由一个切片，让新旧实现并行运行；只有在流量和数据都得到验证后，才退役旧路径。
- 服务内部按抽象分支：引入接缝，在其后实现，完成切换，然后删除旧侧。
- 模式和事件的变更遵循扩展-收缩流程，如 `system-design-data-architecture` 中所述。

## 反模式

- **不要默认使用 CQRS**：只有在一个模型被明确证明无法同时满足读写两侧之后，才分离模型。
- **不要为普通 CRUD 使用事件溯源**：审计需求应使用审计日志，而不是重建整个世界。
- **不要双写**：使用发件箱或 CDC，绝不要在数据库写入之后抱着希望发布。
- **不要让协同流程超过 4 个步骤**：没有协调器，就没人能回答“订单 123 在哪里”。
- **不要在关键路径上使用两阶段提交**：协调器是单点故障，锁就是故障源。
- **不要将分布式锁作为正确性机制**：在 GC 暂停期间租约可能过期；应使用栅栏令牌或单一所有权。

## 参考资料

- [集成模式详解](references/integration-patterns.md) - outbox 机制、saga 补偿表、事件版本控制、BFF 所有权、绞杀者模式阶段