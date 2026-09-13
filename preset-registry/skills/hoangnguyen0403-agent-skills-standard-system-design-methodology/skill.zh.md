---
name: system-design-methodology
description: "Drives an interactive system design session: classifies depth, elicits scale/SLO/consistency inputs, computes capacity, then reveals components one by one, each justified by a constraint. Use when designing a system or running a design session; diagrams go through `common-architecture-diagramming`."
metadata:
  triggers:
    keywords:
      - system design
      - design a system
      - design session
      - high-level design
      - requirements clarification
      - capacity planning
      - scale this
---
# 系统设计方法论

## **优先级：P0（严重）**

先明确需求，再制定方案。没有数据证明之前，绝不绘制完整架构。

## 阶段 0 - 分类深度（始终首先执行）

- **快速草图**：探索性问题，没有可用的规模数据，需要立即给出答案。采用默认值，并将每项标记为 `ASSUMED`，跳过各个门槛。
- **完整会话**：真实构建、迁移或预算承诺。执行每个阶段门槛。
- 用一行说明深度和模式（新设计 | 评审现有系统 | 面试练习），然后继续。
- 当出现硬性约束或不可逆选择时，将快速模式升级为完整模式。

## 阶段 1 - 需求收集（门槛）

- 解析请求：将动词转换为用例，将名词转换为实体，将形容词转换为约束。
- 每轮最多提出 3 个阻塞性问题，并为每个问题提供推荐默认值。参见 [intake checklist](references/intake-checklist.md)。
- 设计前必须明确：DAU/参与者、排名前 3 的用例、读写比例、延迟 SLO、一致性要求、保留期限、峰值形态、预算、团队规模。
- 冻结范围：列出明确不在范围内的内容。

## 阶段 2 - 估算（门槛）

- 使用 `system-design-estimation` 计算 QPS、存储、带宽和工作集内存。
- 展示这些数据，指出影响设计的一个关键数量，并在绘制任何内容之前进行确认。

## 阶段 3 - 高层设计（渐进式）

- 先评估零方案的成本：什么都不做、购买现成方案，或让现有服务承担它。拒绝零方案时必须说明理由，不能默认跳过。
- 从满足功能需求的最小系统开始：客户端、API、服务、存储。
- 一次增加一个组件。对于每个组件，用一行说明 `约束 -> 组件 -> 成本`。没有命名约束就不添加组件。
- 在优化之前定义 API 接口面（每项功能需求对应一个端点）和数据所有权。
- 只有在组件集合达成一致后才绘制图表，遵循 `common-architecture-diagramming`：绘制一个 `container` 图（技术受众）以及关键路径的 `sequence` 或 `dataflow` 图；每个节点都必须携带其 `约束 -> 组件 -> 成本` 行中的 `metric` 和 `constraint`。各阶段应使用哪些产物，参见：[phase deliverables](references/phase-deliverables.md)。

## 棕地路径（评审现有系统模式）

- 在提出任何方案前先绘制当前状态：组件、负责人、流量、事故。
- 测量，而不是假设：从运行中的系统获取真实 QPS、数据量和 p99。
- 找出绑定约束，即下一步增长时最先发生故障的部分。
- 设计能够推动该约束的最小改动，然后重新测量。只有当当前结构无法满足某项结构性约束时，才进行重写。

## 阶段 4 - 深入分析与权衡

- 由用户选择风险最高的 2-3 个组件；只对这些组件进行深入分析。
- 将每个深入分析任务分派给 `specialist-system-architect`，并提供组件名称、相关数据及其一致性要求；会话门槛仍在本线程中维护。
- 以瓶颈、单点故障、被拒绝的替代方案及拒绝理由、下一步扩展步骤收尾。
- 对结果分阶段：现在构建什么、为下一步提供支持的边界，以及触发下一阶段的指标阈值。
- 每个不可逆决策记录一份 ADR，并为其记录反转触发条件，即哪些情况会促使我们重新审视该决策。使用 `system-design-review` 对结果进行评分。

## 反模式

- **需求之前不得进行架构设计**：在 Phase 1 的问题得到回答或标记默认值之前，不得绘制任何图表。
- **不得添加无依据的组件**：每个框都必须说明其解决的约束。
- **设计不得缺少不采取行动的选项**：在开始构建之前，说明为什么无所作为或购买现成方案会失败。
- **不得隐藏假设**：未知输入必须转化为带标签的 `ASSUMED` 默认值，绝不能成为未声明的猜测。
- **不得一次性展示完整技术栈**：在未逐步达成共识之前，绝不能倾倒出一张完整的架构图。

## 红旗信号

- **如果用户说“直接给我架构”，则暂停**：提供带有 `ASSUMED` 标签的快速草图，不要制造虚假的精确性。
- **如果在 Phase 3 时规模未知，则暂停**：返回 Phase 2，并基于明确声明的假设进行估算。

## 参考资料

- [四阶段流程](references/four-phase-process.md) - 每个阶段的门槛、产出物和升级规则
- [收集清单](references/intake-checklist.md) - 带默认值的问题库
- [阶段交付物](references/phase-deliverables.md) - 访谈阶段与产出物、图表的对应关系