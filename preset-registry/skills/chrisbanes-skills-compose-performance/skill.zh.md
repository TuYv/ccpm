---
name: compose-performance
description: Use when investigating Jetpack Compose recomposition cost, compiler stability reports, skippability, unstable parameters, frame-rate State reads, cross-phase snapshot back-writing, or @ReadOnlyComposable contracts.
---
# Compose 性能

## 核心原则

测量一个用户可见的转换，找出导致相关工作的运行时维度，然后在该维度开始生效的阶段或边界处应用最小幅度的修正。

## 流程

1. 复现一个具体的转换，并捕获可观察的证据：重组次数、编译器报告、分析器数据或清晰的跟踪记录。
2. 对主要维度进行分类：参数稳定性与跳过、State 读取阶段，或写回到更早阶段的快照状态。
3. 检查是否存在误导因素：真实的数据变化、正确性缺陷，或预期会发生重组但内容未变化的惰性列表项。
4. 在提出更改之前，阅读对应的专项参考文档。
5. 每次只更改一个维度，并重新测量同一个转换。
6. 当证据表明观察边界处的情况有所改善，且没有隐藏状态变化、缓存陈旧值，或将工作转移给不太合适的所有者时，即可结束。

## 主题导航

| 信号 | 阅读 |
|---|---|
| 原因未知，或多个维度可能相互影响 | [诊断](references/diagnosis.md) |
| `classes.txt`、`composables.txt`、强跳过、不稳定参数或集合稳定性 | [稳定性](references/stability.md) |
| 以帧率频率发生的滚动、动画、手势、布局或绘制阶段 State 读取；测量得到的状态被反馈回组合阶段 | [延迟读取](references/deferred-reads.md) |
| 一个可组合项只读取组合局部值或访问器式的值 | [组合契约](references/composition-contracts.md) |
| 状态所有权或副作用生命周期是根本原因 | [Compose 状态与副作用](../compose-state-and-effects/SKILL.md) |

## RED/GREEN 智能体场景

1. RED 将焦点转换期间未变化的惰性列表行发生重组归咎于不稳定参数。GREEN 首先检查组合和布局的反向写入。
2. 新颖案例：一个动画值只控制绘制。GREEN 在绘制或布局 lambda 中读取 State，而不是通过组合传播该值。
3. 反例：某个屏幕发生了可见的重组，因为它所显示的模型确实发生了变化。GREEN 不会仅仅为了降低计数而添加稳定性包装器或缓存。