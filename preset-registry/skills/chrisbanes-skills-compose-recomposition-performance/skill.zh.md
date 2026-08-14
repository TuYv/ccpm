---
name: compose-recomposition-performance
description: Use when investigating Jetpack Compose recomposition performance, skippable/restartable composables, composables.txt or compiler reports, Layout Inspector recomposition counts, back-writing snapshot state across phases, or frame-rate State reads in composition vs layout/draw, and it is not yet clear whether the cause is parameter stability, deferred reads, or cross-phase back-writing.
---
# Compose 重组性能

仅作路由——深层修复请参阅下方的专项技能。

## 三个维度

1. **参数稳定性 / 跳过**——Compose 能否跳过这个可重启的可组合项；参数是否稳定且可比较？
2. **读取 `State` 的位置**——帧率级更新的 `State` 是在组合阶段读取，还是在布局/绘制阶段读取？
3. **跨阶段回写**——后续阶段是否会写入快照状态，从而使之前的阶段失效？例如：在组合期间修改映射/列表，导致同一次组合再次失效；`onSizeChanged`（布局阶段）写入被同级项在组合阶段读取的状态。

维度 2 和 3 经常重叠（同级项在组合阶段读取测量尺寸，既违反了延迟读取原则，也构成布局 → 组合的回写）。维度 1 相对独立。

## 从此处路由 → 专项技能

| 主要怀疑方向 | 下一项技能 |
|---|---|
| 跳过、参数不稳定、编译器/`composables.txt` 频繁变动 | [`compose-stability-diagnostics`](../compose-stability-diagnostics/SKILL.md) |
| 帧率级更新的 `State` 所处读取阶段（组合与布局/绘制） | [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md) |
| 组合期间执行 `putAll` / 重建映射 / 跨行调用 `height(state)` | [`compose-state-deferred-reads`](../compose-state-deferred-reads/SKILL.md) — § 回写 |
| 可组合项主体中由焦点驱动的附带工作 | [`compose-side-effects`](../compose-side-effects/SKILL.md) — `snapshotFlow` |
| 存在涉及多个维度的证据 | 并行应用对应的技能 |

## 审查顺序

1. 复现一次转换（焦点移动、插入、滚动），并记录哪些可组合项发生了重组。
2. 如果未发生变化的惰性列表项重组次数激增，应先检查回写（组合期间的修改和跨行测量），再归咎于稳定性。
3. 如果滚动/动画期间重组次数逐帧增加，请检查延迟读取。
4. 如果数据稳定但仍无法跳过，请检查参数稳定性和编译器报告。
5. 每次修复后重新测量。

## 误区

以下更改通常**不会**减少重组次数：

| 尝试 | 失败原因 |
|---|---|
| 使用 `remember(index) { isFirstRow(index) }` 代替内联的 `when (index)` | 输入相同；对跳过没有帮助 |
| 为只读派生映射使用基于身份的缓存 | 可能会提供过期的叠加层；`remember(keys)` 已经足够 |
| 在被测量行和同级行上**同时**使用 `mutableIntStateOf` + 布局修饰符 | 除非仅用于测量，否则同级项仍会在组合阶段读取尺寸 |
| 在焦点移动测试中强制两行都达到 `Exactly(1)` | 其中一行正确的重组次数往往是 0 |
| 只进行提升而不稳定 lambda 捕获 | 每帧产生的新 lambda 实例仍会导致无法跳过 |

## 不适用的情况

- 重组反映的是真实数据变化，或者问题在于正确性而非成本。
- 分析器或编译器信号均未表明存在问题。

## 相关内容

- [`compose-state-authoring`](../compose-state-authoring/SKILL.md) — 安全编写 `mutableState*`。