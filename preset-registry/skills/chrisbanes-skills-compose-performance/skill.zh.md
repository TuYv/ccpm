---
name: compose-performance
description: Use when investigating Jetpack Compose recomposition cost, compiler stability reports, skippability, unstable parameters, frame-rate State reads, cross-phase snapshot back-writing, or @ReadOnlyComposable contracts.
---
# Compose 性能

## 核心原则

衡量一次用户可见的转换，确定导致工作的运行时轴，然后在该轴开始工作的阶段或边界应用最小的修正。

## 流程

1. 重现一次具体的转换，并捕获可观测证据：
   重组次数、编译器报告、分析器数据或清晰的跟踪记录。
2. 对主要轴进行分类：参数稳定性与跳过、State 读取阶段，或写回较早阶段的快照状态。
3. 检查是否存在误导线索：真实的数据变化、正确性缺陷，或预期会发生重组的未变化懒加载项。
4. 在提出更改之前，阅读对应的聚焦参考文档。
5. 对于审查工作，将每个发现与有证据支持的最小修复配对。对于错误的稳定性承诺，明确说明应将可变的非快照属性替换为不可变数据或可被快照观察的状态，验证该契约，然后再决定是否仍需要注解。对于阶段问题，指出应该将变化中的读取或计算移到哪个布局或绘制消费者中。跨阶段写入证明了失效或额外遍历；除非证据显示值在反复变化，否则不要声称发生了振荡或无限循环。不要止步于诊断。
6. 一次只更改一个轴，并重新衡量同一次转换。
7. 当观测边界上的证据有所改善，同时没有隐藏状态变化、缓存过期值，或将工作移交给正确性更低的所有者时，即可完成。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 原因未知，或多个轴可能相互作用 | [诊断](references/diagnosis.md) |
| `classes.txt`、`composables.txt`、强跳过、不稳定参数或集合稳定性 | [稳定性](references/stability.md) |
| 以帧率读取滚动、动画、手势、布局或绘制 State；将测量到的状态反馈回组合 | [延迟读取](references/deferred-reads.md) |
| 可组合项只读取组合本地值或访问器风格的值 | [组合契约](references/composition-contracts.md) |
| 状态所有权或 effect 生命周期是根本原因 | [Compose 状态与 effect](../compose-state-and-effects/SKILL.md) |