---
name: compose-performance
description: Use when investigating Jetpack Compose recomposition cost, compiler stability reports, skippability, unstable parameters, frame-rate State reads, cross-phase snapshot back-writing, or @ReadOnlyComposable contracts.
---
# Compose 性能

## 核心原则

衡量一次用户可见的过渡，找出导致这项工作的运行时轴，然后在该轴开始的阶段或边界应用最小的修正。

## 操作步骤

1. 重现一次具体的过渡，并捕获可观察的证据：
   重组次数、编译器报告、性能分析器数据或清晰的跟踪记录。
2. 对主要轴进行分类：参数稳定性与跳过、State 读取阶段，或写回较早阶段的快照状态。
3. 检查是否存在误导线索：真实的数据变化、正确性缺陷，或预期会发生重组的未改变的懒加载项。
4. 在提出修改之前，阅读相应的专题参考文档。
5. 对于审查工作，将每个发现与有证据支持的最小修复配对。对于错误的稳定性承诺，明确说明应使用不可变数据或可由快照观察的状态替换可变的非快照属性，验证该契约，然后再决定是否仍需要注解。对于阶段问题，指出应将变化中的读取或计算移动到哪个布局或绘制消费者中。不要止步于诊断。
6. 一次只更改一个轴，并重新测量同一次过渡。
7. 当观测边界上的证据得到改善，且没有隐藏状态变化、缓存过期值，或将工作移动到正确性较低的所有者时，即可结束。

## 主题路由

| 信号 | 阅读 |
|---|---|
| 原因未知，或多个轴可能相互作用 | [诊断](references/diagnosis.md) |
| `classes.txt`、`composables.txt`、强跳过、不稳定参数或集合稳定性 | [稳定性](references/stability.md) |
| 以帧率读取滚动、动画、手势、布局或绘制 State；将测量得到的状态反馈到组合中 | [延迟读取](references/deferred-reads.md) |
| 可组合项只读取组合本地值或访问器式值 | [组合契约](references/composition-contracts.md) |
| 状态所有权或副作用生命周期是根本原因 | [Compose 状态与副作用](../compose-state-and-effects/SKILL.md) |

## RED/GREEN 代理场景

1. RED 将焦点过渡期间发生重组的未改变懒加载行归咎于不稳定参数。GREEN 首先检查组合和布局回写。
2. 新颖案例：动画值只控制绘制。RED 识别出组合读取，但止步于诊断。GREEN 将 State 读取及其几何计算移动到绘制或布局消费者中。
3. 反例：某个屏幕因其显示的模型确实发生变化而明显重组。GREEN 不会仅仅为了降低计数而添加稳定性包装器或缓存。