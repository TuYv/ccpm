---
name: compose-performance
description: Use when investigating Jetpack Compose recomposition cost, compiler stability reports, skippability, unstable parameters, frame-rate State reads, cross-phase snapshot back-writing, or @ReadOnlyComposable contracts.
---
# Compose 性能

## 核心原则

度量一次用户可见的过渡，确定导致相关工作的运行时维度，然后在该维度开始的阶段或边界应用最小的修正。

## 操作步骤

1. 重现一次具体的过渡，并捕获可观察的证据：
   重组次数、编译器报告、分析器数据或清晰的跟踪记录。
2. 对主要维度进行分类：参数稳定性与跳过、State 读取阶段，或写回较早阶段的快照状态。
3. 检查是否存在误导因素：真实的数据变化、正确性缺陷，或预期会发生重组的未改变的惰性列表项。
4. 在提出修改之前，先阅读对应的专项参考文档。
5. 对于审查工作，将每个发现与有证据支持的最小修复配对。对于错误的稳定性承诺，明确说明应使用不可变数据或可由快照观察的状态替换可变的非快照属性，验证该契约，然后再决定是否仍需要注解。对于阶段问题，指出发生变化的读取或计算应移动到的布局或绘制使用方。不要止步于诊断。
6. 一次只修改一个维度，并重新度量同一个过渡。
7. 当观测边界处的证据有所改善，且没有隐藏状态变化、缓存过期值，或将工作移动到正确性更差的所有者时，即可完成。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 原因未知，或多个维度可能相互作用 | [诊断](references/diagnosis.md) |
| `classes.txt`、`composables.txt`、强跳过、不稳定参数或集合稳定性 | [稳定性](references/stability.md) |
| 以帧速率读取滚动、动画、手势、布局或绘制 State；将度量得到的状态反馈回组合阶段 | [延迟读取](references/deferred-reads.md) |
| 可组合项只读取组合本地值或访问器样式的值 | [组合契约](references/composition-contracts.md) |
| 状态所有权或副作用生命周期是根本原因 | [Compose 状态与副作用](../compose-state-and-effects/SKILL.md) |