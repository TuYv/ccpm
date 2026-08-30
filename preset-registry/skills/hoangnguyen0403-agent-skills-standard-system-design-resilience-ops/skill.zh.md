---
name: system-design-resilience-ops
description: "Make a design survivable and operable: eliminate single points of failure, pick failover topology, set RPO/RTO, define readiness signals and observability, choose a deployment and rollback strategy. Use when reviewing availability, planning DR, or deciding rollout mechanics."
metadata:
  triggers:
    keywords:
      - single point of failure
      - failover
      - disaster recovery
      - rpo
      - rto
      - multi-region
      - autoscaling
      - deployment strategy
      - blue-green
      - canary
---
# 弹性与运维

## **优先级：P1（高）**

在完成故障处理和发布方案设计之前，设计就不算完成。

## 消除单点故障

- 遍历每个组件，询问恰好一个实例宕机时会发生什么，然后再询问整个可用区宕机时会发生什么。
- 任何只有一个实例、一个写入方或一个共享配置平面的组件，都是单点故障。明确指出它，或将其移除。
- 只有在故障模式彼此独立时，冗余才有帮助：共享凭据、共享配置和共享控制平面会抵消冗余带来的收益。
- 爆炸半径：说明每个组件发生故障时会影响哪些用户或流程，并通过单元、隔离舱或按租户配额限制影响范围。

## 故障转移与恢复

| 拓扑 | 恢复时间 | 成本 | 适用场景 |
| --- | --- | --- | --- |
| 单区域、多可用区 | 分钟级，自动 | 低 | 大多数产品 |
| 跨区域主备 | 分钟到数小时，取决于演练 | 中 | 受监管或高价值流程 |
| 跨区域双活 | 秒级 | 高 | 全球低延迟、可容忍冲突的数据 |

- 在选择拓扑之前，以数字形式设定 **RPO**（可容忍的数据丢失量）和 **RTO**（可容忍的停机时间）；是这些数字决定拓扑，而不是反过来。
- 未经测试的故障转移只是一个假设。安排一次演练，并记录实测 RTO 与目标值的对比。
- 备份需要进行恢复测试。从未恢复过的备份不算备份。

## 可观测性

- 为每个服务采集四项信号：流量、错误率、延迟百分位数、饱和度。
- 根据用户可见的症状和错误预算消耗速率进行告警，而不是根据原始 CPU 使用率进行告警。
- 跨越每一跳传递 trace 和 correlation id，包括队列消息。
- 每条告警都需要负责人、runbook 链接和明确的下一步行动；没人会处理的告警就是噪声。

## 发布

| 策略 | 爆炸半径 | 回滚 | 成本 |
| --- | --- | --- | --- |
| 滚动发布 | 在发布过程中扩大 | 向前或向后推进，速度慢 | 低 |
| 蓝绿发布 | 在切换时进行整体切换 | 立即切回 | 双倍容量 |
| 金丝雀发布 | 先面向小范围用户群 | 停止并排空该用户群 | 需要路由和指标 |
| Feature flag | 按用户或租户控制 | 立即生效，无需重新部署 | Feature flag 生命周期负担 |

- Schema 和代码分开部署：扩展、迁移、收缩。绝不要发布只有新代码才能读取的迁移。
- 在部署开始之前，将回滚触发条件定义为指标阈值和时间窗口。

## 反模式

- **不得有未经测试的故障转移**：没有演练日期和实测 RTO，就不能声称具备 DR 能力。
- **不得有无界重试**：重试需要预算、带抖动的退避策略和停止条件，否则会放大故障。
- **不得对依赖设置存活探针**：下游故障不得导致整个实例集群重启。
- **不得在没有回滚方案的情况下部署**：不可逆的发布就是等待糟糕构建出现的故障。
- **不得在没有上下限的情况下自动扩缩容**：无界扩容会把 bug 变成账单。

## 参考资料

- [可靠性运维](references/reliability-operations.md) - 故障演练、健康检查设计、DR runbook 结构、扩缩容策略说明