---
name: common-system-design
description: Define module boundaries, dependency direction, data ownership, resilience, and distributed-system trade-offs. Use for architecture, service boundaries, coupling, scalability, or failure-cascade decisions; not generic project setup.
metadata:
  triggers:
    keywords:
      - architecture
      - design
      - system
      - scalability
      - microservice
      - module boundary
      - coupling
---
# 系统设计与架构标准

## **优先级：P0（关键）**

## 工作流：评估新功能的架构

1. 识别限界上下文和模块边界
2. 明确数据所有者，并定义依赖方向（外层依赖内层）
3. 选择通信模式（同步 REST、异步事件或混合模式）及故障处理行为
4. 仅针对分布式组件验证 CAP 权衡
5. 在 ADR 中记录边界、权衡和回滚方案

对于发生故障的同步依赖，应明确关键路径：为该依赖设置超时和断路器，在安全的情况下返回预先定义的降级/回退结果，并将非关键通知转移到异步事件中。

## 架构原则

- **SoC**：按关注点划分为不同部分。
- **SSOT**：确保唯一来源，其他位置仅引用。
- **快速失败**：发生错误时以可见方式快速失败。
- **优雅降级**：即使次要功能失败，核心功能仍可用。

## 模块化与耦合

- **高内聚**：将相关功能集中在同一个模块中。
- **松耦合**：使用接口进行通信。
- **DI**：注入依赖，不要硬编码。

有关依赖流向图，请参阅[实现示例](references/implementation.md)。

## 常见模式

- **分层架构**：表现层 -> 逻辑层 -> 数据层。
- **事件驱动**：解耦组件之间进行异步通信。
- **整洁/六边形架构**：核心逻辑独立于框架。
- **无状态性**：优先采用无状态设计，以便扩展和测试。

## 分布式系统

- **CAP**：在一致性/可用性/分区容错性之间进行权衡。请参阅 [CAP 与一致性模式](references/distributed-systems.md)。
- **幂等性**：操作可重复执行且不会产生副作用。请参阅[幂等性模式](references/distributed-systems.md#idempotency)。
- **断路器**：依赖服务发生故障时快速失败。请参阅[韧性模式](references/resilience-patterns.md)。
- **最终一致性**：针对异步数据同步进行设计。请参阅 [CAP 与一致性模式](references/distributed-systems.md#eventual-consistency)。

## 文档与演进

- **设计文档**：在进行重大实现之前编写规范。
- **版本控制**：对 API/架构进行版本控制，以实现向后兼容。
- **可扩展性**：使用策略模式/工厂模式适应未来变更。

## 参考资料

- [分布式系统与 CAP 定理](references/distributed-systems.md)
- [韧性模式（断路器、舱壁、重试）](references/resilience-patterns.md)

## 反模式

- **禁止上帝类**：遵循单一职责原则——每个模块只有一个变更理由。
- **禁止同步耦合**：跨服务调用应优先使用事件或队列。
- **禁止过早抽象**：针对当前负载进行设计；仅在需求得到验证后再扩展。