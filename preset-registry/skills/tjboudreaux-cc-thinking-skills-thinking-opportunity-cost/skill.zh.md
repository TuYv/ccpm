---
name: thinking-opportunity-cost
description: Before committing scarce time, people, or money, name the best forgone use of those resources and the value delta of the chosen path versus that alternative.
disable-model-invocation: true
---
# 机会成本

核心规则：每一项承诺都会挤占其最佳替代方案。既要报告被放弃的价值，也要报告净价值差额；依据差额做决策，而不是仅依据所选路径本身。

## 何时使用

- 在相互竞争的选项之间分配稀缺的时间、人力、预算或注意力
- 功能优先级排序、自建还是购买、技术债务与产品工作之间的取舍
- 接受一项会挤占其他工作的大型承诺
- 在时间窗口可能关闭的情况下，比较大胆路径与打磨现状

## 何时不使用

- 琐碎或可低成本逆转的选择，此时分析成本高于资源本身
- 没有真实的替代用途（资源闲置、已被指定用途或不可互换）
- 没有可选替代方案的强制性工作（合规、安全修复、硬依赖）
- 次优选项明显更差时，仅为显得严谨而虚构投机性替代方案

## 流程

1. **陈述承诺。** 说明选择本身、稀缺资源的单位（工程周、美元、日历时间）以及决策时间范围。
2. **列出真实的替代方案，包括什么都不做。** 至少包括：提议选项、相同资源的次优生产性用途，以及维持现状/等待。剔除没有负责人或不可行的幻想选项。
3. **为每条路径估值。** 对每个替代方案，用相同的单位估算直接价值、战略价值、风险和价值实现时间。宁可使用粗略但可比较的量级，也不要虚假的精确。
4. **计算最佳放弃价值和价值差额。** 找出唯一最佳的非选定替代方案（可能是"什么都不做"）。`best_forgone_value` = 该方案的估算价值。`value_delta` = `chosen_value − best_forgone_value`（相同单位）。选择的真实成本 = 选择的直接成本 + `best_forgone_value`。在计入风险后，优先选择价值差额更优（为正）的选项；如果被放弃的替代方案价值更大，仅凭所选路径价值较大且为正是不够的。
5. **未来权衡 / 永久放弃的选项。** 对于重要的替代方案（包括大胆路径）：区分临时可恢复成本与永久损失（时间窗口关闭、被锁定、无法重新进入）。当行动的下行风险可恢复且非灾难性时，优先避免更大的永久损失——即使近期 value_delta 略为负值。在没有证据的情况下，不要为投机性上行收益虚构永久性。
6. **构建最强反方论证并决策。** 全力强化"最佳替代方案或其价值被错误识别"这一质疑（沉没成本锚定、现状被低估，或某个仍然消耗时间的"免费"选项）。在该质疑下重新计算 `value_delta`。然后做出选择：如果差额仍然有利（或永久损失规则适用），则继续；否则切换、等待或拆分。当排序稳定时停止。

## 输出

```text
Choice: …
Resources committed: …
Alternatives:
  A (proposed): value … risk …
  B (next-best): value … risk …
  C (do-nothing / wait): value … risk …
Best forgone alternative: …
Best forgone value: …
Value delta (chosen_value − best_forgone_value): …
Permanent vs temporary losses: …
Decision: proceed | switch | wait | split — because value_delta … (and permanent-loss rule if used)
Countercase checked: …
```

## 验证

- **证伪：** 如果分析从未指出相同资源的一个具体次优用途，或只报告一个同时被标注为"机会成本"和"差额"的数字，则该分析不完整——补充 B，然后分别报告 `best_forgone_value` 和 `value_delta`。
- **停止：** 当一个最佳放弃替代方案和一个带符号的价值差额足以决定选择时，停止枚举较弱的选项。
- **过度应用防范：** 不要对强制性或琐碎的工作进行完整核算。忽略沉没成本；仅从当前状态向前重新估值。
