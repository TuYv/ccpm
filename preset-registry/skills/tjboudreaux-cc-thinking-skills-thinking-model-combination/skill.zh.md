---
name: thinking-model-combination
description: When one mental model leaves a material blind spot on a multi-domain or high-stakes problem, sequence complementary models with named roles and a conflict rule.
disable-model-invocation: true
---
# 模型组合

**核心规则：** 仅当每个模型回答的是一个不同的、被明确命名的问题时才进行组合。上限为三个，应用前先指明冲突规则，然后综合一次。

## 何时使用

- 已应用一个模型（或已明确以某模型为主）仍留下实质性盲区，而另一机制可覆盖该盲区。
- 问题跨越多个领域（例如风险 + 选择 + 系统结构），且其重要性值得多视角工作。
- 你需要的是独立检验，而非对同一结论的确认。
- 在运行之前，你能为每个模型指定一个明确的角色。

## 何时不使用

- 单个目录技能即可完全回答该未知问题——单独应用该技能即可。
- 常规、局部或完全可逆的工作，多视角的成本超过收益。
- 你无法说明每个额外模型回答了什么独特问题（勾选凑数 / 模型大杂烩）。
- 近乎重复的机制（两个提出同一因果问题的诊断技能）。
- 时间预算无法支持真正的综合——宁用一个诚实的模型，也不要相互矛盾的部分结论。

## 流程

1. **说明未知问题与缺口。** 写下决策问题。如果某个模型已覆盖该问题，就此停止并单独使用该模型。否则，指明具体盲区（例如“失效模式未检视”、“被搁置的替代方案未知”）。
2. **选取 2–3 个角色各不相同的模型。** 为每个模型记录：模型 ID、角色（收窄 / 决策 / 压力测试 / 成本 / ……），以及它所回答的独特问题。舍弃任何只是换种说法复述另一个模型的模型。除非需要进行独立的并发检验，否则优先采用顺序流水线（收窄 → 压力测试 → 决策）而非并行。
3. **在应用前锁定关系与冲突规则。** 选择模式：顺序、并行、嵌套（宏观→中观→微观）或对抗（正方/反方）。预先声明决胜规则（例如可逆性等级、证据强度、毁灭性约束、主要决策负责人）。互不兼容的世界观采用顺序或对抗模式——绝不混合。
4. **仅就其角色完整应用每个模型。** 为每个模型记录一个关键洞见，以及只有该模型才揭示的内容。不要重新运行不会带来新洞见的模型。
5. **综合一次。** 记录收敛点、分歧点、冲突规则如何化解分歧，以及一条附带剩余不确定性的统一综合建议。当建议已可支撑决策，或继续增加模型只会重复确认既有结论时，即停止。

## 输出

```text
problem: <decision question>
gap: <named blind spot justifying combination>
pattern: sequential | parallel | nested | adversarial
models:
  - id: <skill>
    role: <named job>
    unique_question: <what only this answers>
    insight: <key finding>
conflict_rule: <predeclared tiebreaker>
convergence: <where models agree>
divergence: <where they conflict + resolution>
recommendation: <single decision-ready answer>
stop_reason: gap_closed | single_model_suffices | budget
```

## 验证

- **证伪 / 停止：** 仅当移除某模型不会改变建议、支持证据、置信度、剩余风险或缓解措施中的任何一项时，才移除该模型；随后用更少的模型重新综合。若不存在预先声明的冲突规则且各模型意见不一，不要取平均——选定一个主模型，或停止并改换路径。
- **过度应用防护：** 永远不要超过三个模型。永远不要为了表演式的周全而添加模型。如果第一个足够胜任的单一模型已经补上了缺口，那么对该任务而言组合就是错误的。
