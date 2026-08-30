---
name: system-design-principles
description: "Define module boundaries, dependency direction, data ownership, resilience, and distributed-system trade-offs. Use for architecture, service boundaries, coupling, scalability, or failure-cascade decisions; defer session facilitation to system-design-methodology."
metadata:
  triggers:
    keywords:
      - architecture
      - scalability
      - microservice
      - microservices
      - module boundary
      - coupling
      - bounded context
      - dependency direction
      - clean architecture
      - cap theorem
      - idempotency
---
# 系统设计原则

## **优先级：P0（严重）**

## 工作流：评估新功能的架构

1. 识别限界上下文和模块边界
2. 指明数据所有者，并定义依赖方向（外层依赖内层）
3. 选择通信模式（同步 REST、异步事件或混合模式）和故障行为
4. 仅针对分布式组件验证 CAP 权衡
5. 在 ADR 中记录边界、权衡和回滚方案

对于失败的同步依赖，保持关键路径明确：为该依赖设置超时并启用熔断，在安全的情况下返回定义明确的降级/回退结果，并将非关键通知移至异步事件。

## 架构原则

- **SoC**：按照关注点划分为不同部分。
- **SSOT**：只保留一个事实来源，其他地方引用它。
- **快速失败**：发生错误时显式失败。
- **优雅降级**：即使次要功能失败，核心功能仍可用。

## 模块化与耦合

- **高内聚**：将相关功能放在同一个模块中。
- **松耦合**：使用接口进行通信。
- **DI**：注入依赖，不要硬编码。

参见[实现示例](references/implementation.md)中的依赖流图。

## 常见模式

- **分层**：表示层 -> 逻辑层 -> 数据层。
- **事件驱动**：解耦组件之间进行异步通信。
- **整洁架构/六边形架构**：核心逻辑独立于框架。
- **无状态**：优先采用无状态设计，以便扩展和测试。
- **单体优先**：从模块化单体开始；仅当某个模块需要独立扩展、独立发布节奏或独立所有权时，才将其拆分为独立服务。

## 分布式系统

- **CAP**：在一致性/可用性/分区容错性之间进行权衡。参见 [CAP 与一致性模式](references/distributed-systems.md)。
- **幂等性**：操作可以重复执行而不会产生副作用。参见 [幂等性模式](references/distributed-systems.md#idempotency)。
- **熔断器**：对故障服务快速失败。参见 [弹性模式](references/resilience-patterns.md)。
- **最终一致性**：针对异步数据同步进行设计。参见 [CAP 与一致性模式](references/distributed-systems.md#eventual-consistency)。

## 文档与演进

- **设计文档**：在进行重大实现之前编写规范。
- **版本控制**：对 API/模式进行版本化，以保持向后兼容。
- **可扩展性**：使用 Strategy/Factory 应对未来变化。

## 参考资料

- [分布式系统与 CAP 定理](references/distributed-systems.md)
- [弹性模式（熔断器、隔板、重试）](references/resilience-patterns.md)

## 反模式

- **不要创建上帝类**：遵循单一职责——每个模块只有一个变更原因。
- **不要同步耦合**：跨服务调用优先使用事件或队列。
- **不要过早抽象**：针对当前负载进行设计；在证明确有必要时再进行扩展。