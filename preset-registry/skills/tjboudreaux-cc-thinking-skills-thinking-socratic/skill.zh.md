---
name: thinking-socratic
description: When a request is vague, assumption-laden, or "obvious," ask the few load-bearing questions that expose hidden requirements before building or committing.
disable-model-invocation: true
---
# 苏格拉底式提问

**核心规则：** 在动手构建之前，先暴露出承重的假设或未定义的术语。只问你自己无法解决的问题；当下一步行动已达到可决策状态时就停止。

## 何时使用

- 请求未充分说明（如「让它变快」「加一个仪表盘」「修掉这个 bug」），而贸然猜测会导致做错东西。
- 某个断言建立在未言明的假设之上，而该假设可能才是真正的问题所在。
- 有人把某个前提当作「显而易见」，或在问题尚未定义时就直接跳到解决方案。
- 正在调试一个模糊的症状，需要在展开调查前先落到一个可验证的具体点上。

## 何时不要使用

- 规格已经清晰且可执行——直接干活；不要为了走形式而盘问。
- 歧义可以通过读代码、跑命令或查文档来解决——自己解决。
- 正在执行一个已商定的计划——对每一步都重新发问只会制造摩擦，而非严谨。
- 紧急情况，一条承重事实就足以支撑行动——澄清该事实，然后行动（优先使用 ooda）。
- 你需要的是最强有力的反方论证，而非澄清——使用 steel-manning。
- 你需要针对一个已定义的故障深入挖掘因果链——使用 five-whys-plus 或 scientific-method。

## 步骤

1. **指出缺口。** 说明哪些内容是未定义的、被假设的，或是无法核实的。如果无需用户参与、只靠工具/仓库就能补上这个缺口，那就自己补上并到此为止。
2. **先问承重问题。** 优先只问那个答案最能改变你将要构建内容的问题。类别（仅按缺口所需使用）：
   - 澄清——「X 是什么意思／面向谁／成功是什么样子？」
   - 假设——「什么必须为真？如果它为假会怎样？」
   - 证据——「有什么支持这一点？什么能推翻它？」
   - 视角——「谁会受影响／谁会不同意？」
   - 含义——「如果我们这样做，会引出什么？」
   - 元问题——「这本身是不是正确的问题？」
3. **解决或分支。** 根据答案，要么 (a) 写清已澄清的需求/决策并继续，要么 (b) 最多追问一个仍然卡住工作的问题。不要默认把六个类别全部过一遍。
4. **把假设显式化。** 复述：「本方案假设 X 成立；成功意味着 Y；Z 不在范围内。」仅在复述之后仍有歧义时才进行确认。
5. **在达到可决策的清晰度时停止。** 当下一步行动不再依赖于某个隐藏前提时，结束提问并执行或交接。严格限制抛给用户的问题数量；对真正卡住工作的少数问题，尽量合并成批提出。

## 输出

```text
gap: <what was vague or assumed>
resolved_by: self | user | mixed
questions_asked:
  - <only questions actually needed>
assumptions_made_explicit:
  - <X must be true / success = Y>
clarified_requirement: <decision-ready statement>
next_action: <build | investigate | re-scope | stop>
stop_reason: clear_enough | self_resolved | blocked_on_<fact>
```

## 校验

- **证伪／停止：** 如果答案并没有改变计划，说明你问的不是承重问题——停止盘问。如果「澄清」之后仍只是猜测，就不要构建；指出剩余的阻碍。
- **防过度使用：** 不要对已明确说明的任务进行苏格拉底式盘问。不要把你自己能读出或测出的事实外包给别人。不要把执行的每一步都变成新一轮提问。
