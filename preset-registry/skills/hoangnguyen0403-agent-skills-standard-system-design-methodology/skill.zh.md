---
name: system-design-methodology
description: "Drives an interactive system design session: classifies depth, elicits scale/SLO/consistency inputs, computes capacity, then reveals components one at a time with a constraint justification each. Use when designing a system or running a design session; defer diagrams to the diagramming skill."
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

## **优先级：P0（关键）**

先明确需求，再制定方案。在数据尚未证明其必要性之前，绝不绘制完整架构。

## 阶段 0 - 判断深度（始终首先执行）

- **快速草图**：探索性请求，没有可用的规模数据，需要立即给出答案。假设默认值，并将每个默认值标记为 `ASSUMED`，跳过各项门槛。
- **完整会话**：真实构建、迁移或预算承诺。执行每个阶段门槛。
- 用一行说明深度和模式（新设计 | 审查现有系统 | 面试练习），然后继续。
- 当出现硬性约束或不可逆选择时，将快速模式升级为完整模式。

## 阶段 1 - 信息收集（门槛）

- 解析请求：将动词转换为用例，将名词转换为实体，将形容词转换为约束。
- 每轮最多提出 3 个阻塞性问题，并为每个问题给出建议默认值。参见 [信息收集清单](references/intake-checklist.md)。
- 设计前必须明确：DAU/参与者、前 3 个用例、读写比例、延迟 SLO、一致性需求、保留期限、峰值形态、预算、团队规模。
- 冻结范围：列出明确不在范围内的内容。

## 阶段 2 - 估算（门槛）

- 使用 `system-design-estimation` 计算 QPS、存储、带宽和工作集内存。
- 展示这些数值，指出影响设计的一个关键数量，并在绘制任何内容之前确认该数量。

## 阶段 3 - 高层设计（增量式）

- 首先评估零方案的成本：什么都不做、购买现成方案，或让现有服务承担该需求。拒绝这些选项时必须说明理由，不能保持沉默。
- 从满足功能需求的最小系统开始：客户端、API、服务、存储。
- 一次只增加一个组件。对于每个组件，用一行说明 `约束 -> 组件 -> 成本`。没有明确约束，就不能增加组件。
- 在进行优化之前，定义 API 面和数据所有权。
- 只有在组件集合达成一致后，才根据 `system-design-diagramming` 绘制图表。

## 棕地路径（审查现有系统模式）

- 在提出任何方案前，先梳理当前状态：组件、所有者、流量、故障事件。
- 进行测量，不要假设：从运行中的系统获取真实 QPS、数据量和 p99。
- 找出绑定约束——即在下一次增长阶段最先失效的那个约束。
- 设计能够推动该约束的最小变更，然后重新测量。只有当现有架构无法满足某项结构性约束时，才需要重写。

## 阶段 4 - 深入分析与权衡

- 由用户选择风险最高的 2-3 个组件；只对这些组件进行深入分析。
- 将每个深入分析任务分派给 `specialist-system-architect`，并提供组件名称、相关数值及其一致性要求；在当前线程中保留各项会话门槛。
- 以瓶颈、单点故障、被拒绝的替代方案及拒绝理由，以及下一步扩展步骤收尾。
- 对结果进行分阶段规划：现在要构建什么、为下一步提供支持的衔接点，以及触发下一步的指标阈值。
- 每个不可逆决策记录一份 ADR，并注明其逆转触发条件——什么情况会促使我们重新考虑该决策。使用 `system-design-review` 对结果进行评分。

## 反模式

- **没有需求就不能进行架构设计**：在阶段 1 的问题得到回答或默认值被标记之前，不得绘制图表。
- **不添加没有依据的组件**：每个方框都必须注明它所解决的约束。
- **没有零方案就不能进行设计**：在开始构建之前，说明为什么什么都不做或购买现成方案不可行。
- **不允许存在未声明的假设**：未知输入必须转化为带有 `ASSUMED` 标记的默认值，绝不能成为隐藏的猜测。
- **不展示完整技术栈**：在未达成增量式共识之前，绝不直接给出完成的架构图。

## 警示信号

- **如果对方说“只给我架构”就停止**：提供一份带有 `ASSUMED` 标签的快速草图，而不是虚假的精确方案。
- **如果在 Phase 3 时规模未知就停止**：返回 Phase 2，并基于明确说明的假设进行估算。

## 参考资料

- [四阶段流程](references/four-phase-process.md) - 各阶段的门槛、输出和升级规则
- [信息收集清单](references/intake-checklist.md) - 带有默认值的问题库