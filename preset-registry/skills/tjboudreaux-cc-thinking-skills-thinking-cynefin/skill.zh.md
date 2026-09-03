---
name: thinking-cynefin
description: When the right response mode is unclear, classify the cause-effect domain first; decompose disorder.
disable-model-invocation: true
---
# Cynefin 分类

先按因果关系分类，然后只使用与域匹配的响应模式。用错域的方法即为失败模式。

## 何时使用

- 不确定应该执行 playbook、进行分析、试探还是先稳定局面。
- 某个方法反复失败，且域错配是可能的原因。
- 新颖或混合型问题需要先选定方法路径，再开展解决方案工作。

## 何时不使用

- 域和方法已确定一致——直接执行。
- 任务是找出具体原因，而非选择方法路径。
- 分类已完成；切换到对应域的方法——不要无休止地重新贴标签。
- 纯机械性编辑，不存在方法上的不确定性。

## 流程

1. **明确单元。** 说出该决策、事件或子系统的名称；如果是混合型的，列出可分离的各个部分。
2. **探查因果关系。** 因果链是显而易见、可由专家分析、只能事后回溯，还是在动荡中无法察觉？检查可预测性、紧迫性以及试探的安全性。
3. **为每个单元指定一个域：**
   - **Clear** — 显而易见 → Sense → Categorize → Respond，配合 runbook 执行。
   - **Complicated** — 可由专家分析 → Sense → Analyze → Respond；可能存在多个有效答案。
   - **Complex** — 涌现性 → Probe → Sense → Respond，使用可安全失败的试探；放大/抑制信号。
   - **Chaotic** — 没有安全的感知时间 → Act → Sense → Respond；先求稳定。
   - **Disorder** — 未知 → 拆分并对每一部分分别分类。
4. **错配检查。** 若 runbook 失败则否决 Clear；若分析无法做出预测则否决 Complicated；若试探不安全则否决 Complex；一旦可以进行安全试探则否决 Chaotic。
5. **定案并停止。** 输出域 + 首批行动。仅在出现域已发生转变的证据时才重新分类。

**停止时机** — 每个单元都有一个域、首批行动和一个证伪条件，或者 disorder 已被分解。

## 输出

```text
unit: <decision/incident/part>
domain: clear | complicated | complex | chaotic | disorder
evidence: <cause-effect basis>
response_mode: <Sense-Categorize-Respond | Sense-Analyze-Respond | Probe-Sense-Respond | Act-Sense-Respond | decompose>
first_actions: <1-3 concrete steps>
falsifier: <what forces reclassification>
parts: <only if disorder>
```

## 验证

- **证伪：** 能够可靠预测 → 不是 Complex。没有安全的试探 → Chaotic。runbook 有效 → Clear。
- **停止：** 一旦匹配的行动已明确，就停止分类。
- **防止过度套用：** 不要为了逃避分析而把工作称为 Complex，也不要为了逃避标准修复而把工作称为 Complicated。每个单元只贴一个标签；对跨域工作进行分解。
