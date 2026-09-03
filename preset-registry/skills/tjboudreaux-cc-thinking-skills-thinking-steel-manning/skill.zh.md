---
name: thinking-steel-manning
description: Before rejecting a proposal or reflexively agreeing, build the strongest faithful opposing case, state agreement conditions, then update or reaffirm.
disable-model-invocation: true
---
# Steel-Manning

**核心规则：** 与对立观点的最强形式交锋，而不是弱化版本。如果你的立场在交锋后依然成立，就重申；否则，就更新。

## 何时使用

- 即将拒绝某项提案、设计或替代方案时。
- 倾向于认同用户/方案、存在谄媚风险时——先构造*反对*它的最强论证。
- 设计评审、架构辩论，或权衡真实存在的冲突场景。
- 在锁定你自己偏好的决策之前先行验证（最强反例检验）。

## 何时不使用

- 已定事实、安全反模式或被违反的硬性要求——直接纠正；不要为错误的东西编造辩护。
- 你已经基于明确陈述、充分权衡的理由表示同意——不要表演一场虚假辩论。
- 琐碎或完全可逆的选择，此时斟酌成本超过潜在损害。
- 正在发生的紧急事件——先行动；在事后复盘时再做钢人论证。
- 需要澄清定义/假设而非对抗时——使用 socratic。
- 需要为方案分析失败场景时——使用 pre-mortem；需要分析攻击者路径时——使用 red-team。

## 流程

1. **陈述目标主张或决策**，即你即将接受或拒绝的内容，用一句话表达。如果存在真正的替代方案，请点明。
2. **提取对立立场（或针对你偏好路径）背后的核心洞见**：即使所提方案本身有误，其合理关切依然成立。
3. **构造最强且忠实的论证**，即一位充分知情的拥护者会提出的内容：最佳证据、动机激励和失败模式——不嘲讽、不专挑弱化版本、不进行动机攻击。在相关时纳入可能推翻偏好路径的基率或具体替代方案。
4. **陈述同意/推翻条件。** 写出一个会让你接受对立观点（或放弃你偏好路径）的观察或结果，并说明你是否已寻找过它。
5. **与该强版本交锋，然后决策。** 就钢人论证的实质作出回应。输出以下之一：接受对立路径、修订综合结论，或带明确残余风险地重申原观点。只点名反例而不给出 accept/revise/reaffirm 是不完整的。一旦决策被更新或在附带条件下被重申，即停止。

## 输出

```text
claim: <decision or proposal under test>
core_insight: <legitimate concern behind the opposition>
steel_man: <strongest faithful opposing argument>
overturn_if: <concrete observation that would change your mind>
looked_for_overturn: yes | no | partial
response_to_steel_man: <engagement on the merits>
decision: accept_opposing | revise | reaffirm
update: <what changed in belief or plan, or why reaffirm stands>
residual_risks: <what remains even after reaffirm/revise>
```

## 验证

- **证伪/停止：** 如果"钢人"论证比原始立场更弱，或只是在攻击一个漫画化的靶子，请重新构造。如果没有陈述推翻条件，则该检验不完整。如果证据满足推翻条件，你必须更新——此时的重申即为不成立。
- **过度使用防护：** 不要对事实错误或硬性约束做钢人论证。不要为近乎零成本的可逆选择进行完整的对抗性论证分析。不要使用此技能来拖延紧急响应。
