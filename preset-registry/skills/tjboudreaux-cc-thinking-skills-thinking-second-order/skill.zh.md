---
name: thinking-second-order
description: When a change has effects past the immediate fix—incentives, scale, feedback—trace consequence chains with timing and probability before committing.
disable-model-invocation: true
---
# 二阶后果链

不要止步于预期的第一层效果。沿着参与者、时间和反馈追踪接下来会发生什么，直到这条链不再改变决策。

## 何时使用

- 具有持久耦合的战略、政策、激励或架构选择。
- 明显的修复方案显得过于简单，或存在已知的反噬模式。
- 成功或规模化会催生新问题（负载、钻空子、债务）。
- 需要按延迟效应来比较选项，而不只看首日收益。

## 何时不使用

- 无激励或跨组件耦合的局部可逆修改——直接上线并观察即可。
- 目标是完整的系统结构（存量、多重回路、杠杆点排序）——使用 systems。
- 针对已选定方案的失败模式做事前剖析——使用 pre-mortem。
- 没有行为影响的纯机械性改动（重命名、格式化）。

## 操作步骤

1. **陈述决策与一阶效应。** 各用一句话：行动，以及预期的直接结果。
2. **串联“然后呢？”** 一阶之外至少再推两阶。为每个环节记录：效应、谁会做出反应、大致概率（high/med/low）、时点（immediate / next cycle / at scale），以及它是否会反馈回原问题（强化还是抵消）。
3. **扩展受影响方。** 还有谁会做出反应（用户、运维人员、其他团队、攻击者、市场）？这项改动会创造或摧毁哪些激励？
4. **规模化测试。** 追问：如果人人都这么做，或使用量增长 10 倍，会发生什么？标记那些只在规模化或重复之下才出现的路径。
5. **剪枝并决策。** 舍弃不会改变选择的臆测环节。只保留会改变 go/no-go、设计或缓解措施的效果。在二阶危害超过一阶收益之处，修订行动或增加防护措施。

**何时停止：**当后续的“然后呢？”不再改变决策，或剩余链条纯属缺乏机制的臆测时。

## 输出

```text
decision: <action>
first_order: <intended immediate effect>
chain:
  - order: 2
    effect: <what>
    actors: <who>
    p: high|med|low
    when: immediate|next_cycle|at_scale
    feedback: none|reinforce|balance
  - order: 3
    ...
scale_if_universal: <one sentence or n/a>
revised_decision: <same | modified action | no-go>
mitigations: <guards for kept risks>
```

## 验证

- **证伪：** 如果没有任何可信的二阶路径会改变选择，一阶分析就足够了——停止凭空编造连锁反应。如果核心问题在于多回路结构而非单一决策的后续踪迹，请改用 systems。
- **停止：** 在第一个不再影响决策的阶数处收尾；不要硬凑到固定深度。
- **防止过度使用：** 不要出现低概率的科幻式连锁。不要把参数微调当作深度战略。保留的环节必须标注概率与时点；省略没有机制的装饰性内容。
