---
name: first-principles-review
description: "Use when asked for first-principles or Occam's-razor review, or when high-risk decisions involve competing constraints, fallback growth, duplicate owners, or architecture direction risk. Ordinary bug fixes stay on the fast path."
---
# 第一性原理审查

## 目的

在另一个 Aegis 工作流做出方向性选择之前，将其用作轻量级决策审查。它是一项组合式技能，而非独立工作流。

不要取代 `brainstorming`、`systematic-debugging`、`writing-plans`、
`requesting-code-review` 或 `verification-before-completion`。应使用它来清理这些技能将要处理的决策面。

当此审查实质性地改变方向时，请在自然语言中呈现 `Aegis Visibility`：明确指出改变决策的第一性原理、被舍弃的假设、最小充分路径，或所有者/退役证伪条件。使其保持建议性质并针对具体任务；不要把这种审视方式变成审批权限或通用的技能追踪记录。

## 使用场景

- 用户要求运用第一性原理、第一性原理思维或奥卡姆剃刀。
- 某项设计、计划或修复存在多条合理路径，但选择标准不明确。
- 任务目标含糊、约束相互冲突，或存在产品/架构方向风险。
- 调试正逐渐演变为反复修复、不断增加回退机制、所有者重复、消费者侧补丁，或“再加一个分支就行”的推理方式。
- 审查发现，实现可能在局部上是正确的，但方向上是错误的。

## 不适用场景

- 简单的问答、状态检查、微小的措辞/配置修改，或边界清晰且只有单一所有者的变更。
- 机械执行已获批准的计划，除非出现新的方向性冲突。
- 将其作为每项任务、每轮对话或每个 TDD 周期的必需步骤。

## 五行审查

仅回答必要内容，通常使用五行简短文字：

```text
First Principle: What irreducible outcome must this satisfy?
Non-negotiables: What constraints cannot be broken?
Assumptions to Drop: What is habit, inherited shape, or unproven preference?
Smallest Sufficient Path: What is the least complex path that satisfies the first principle?
Escalation Signal: What finding would require spec/design/architecture review?
```

对于修复方案，“最小”是指最小的充分且稳定的修复，而不是最小的文本差异：

```text
Minimality Check:
- Smallest textual diff:
- Correct owner:
- Bug class fixed:
- New branch/fallback added:
- Old path retired or scheduled:
- Verdict: sufficient repair | local patch | needs first-principles review
```

## 决策规范性审查

仅当设计、修复或计划在写入规范或实施计划之前需要获得认可时，才使用此升级流程。

当出现以下任一风险信号时，从五行审查升级：

- 存在多条合理路径，但没有明确的选择标准
- 出现新的所有者、重复所有者、回退机制、适配器或仅用于兼容性的载体
- 某条旧路径可能需要先删除后处理，或需要设置退役触发条件
- 提案依赖未经验证的假设
- 用户使用了“更优雅”“长期稳定”“第一性原理”或“奥卡姆”等表述
- 计划可能会写入错误的所有者、抽象、兼容性边界或退役时间表

使用以下紧凑格式：

```text
First-principles invariants:
- Non-negotiable goal:
- Non-negotiable constraints:
- Historical assumptions to delete:

Owner / retirement matrix:
- New canonical owner:
- Old owner:
- Compat-only carrier:
- Delete-first / retirement trigger:

Falsification matrix:
- Dependency-removal test:
- Counterexample scenario:
- Must fail / degrade / remain correct cases:

Verdict:
- Adopt / revise / reject / needs evidence:
- Blocking gaps:
- Next evidence:
```

## 架构完整性透镜

当一个提案可以执行，但仍可能采用了错误的所有者、抽象、契约边界或退役路径时，使用这一范围更窄的透镜。它是建议性的方法包输出，并且在足够的情况下，可以嵌入 `Decision Hygiene Review` 中。

在选择方案、分解任务、审查或报告完成风险之前，如果出现以下任一情况，则触发此透镜：

- 职责可能重叠，或规范所有者不明确
- 最小差异引入了调用方侧的回退、守卫、适配器或仅用于兼容的载体
- 现有的事实来源或契约可以在更高层级解决这一类问题
- 过时的所有者、回退机制或旧路径可能继续承载实际逻辑
- 这项工作声称能够实现长期稳定性、“更清晰的架构”或更高层级的简化

使用以下紧凑格式：

```text
Architecture Integrity Lens:
- Invariant: What must remain true for the system to be coherent?
- Canonical owner / contract: Which owner, contract, or source-of-truth should carry the behavior?
- Responsibility overlap: What duplicate owner, caller-side patch, fallback, or stale path might still carry real logic?
- Higher-level simplification: Can the problem be solved at the owner / contract / source-of-truth layer instead of by another local branch?
- Retirement / falsifier: What old path retires, or what evidence would disprove this architecture judgment?
- Verdict: proceed | revise design | split owner | return to baseline | needs ADR/baseline sync
```

不要对每个低风险任务都运行此透镜。如果它不会改变决策面，请立即返回当前工作流。

## 组合使用

- 与 `brainstorming` 配合：当请求宽泛、含糊、可能继承不良的产品形态，或涉及所有者／退役／回退／适配器风险时，在选择方案之前运行。当出现这些信号时，请在推荐或选择方案之前使用 `Decision Hygiene Review` 或范围更窄的 `Architecture Integrity Lens`。
- 与 `systematic-debugging` 配合：在证据表明存在重复修复、回退机制增长、所有者重复或使用方侧打补丁之后运行。
- 与 `writing-plans` 配合：当计划可能固化错误的所有者、抽象、兼容性边界、回退机制、适配器或退役时间表时，在任务分解之前运行。如果已批准的规范尚未涵盖这一点，请在编写任务之前使用 `Decision Hygiene Review` 或 `Architecture Integrity Lens`。
- 与 `requesting-code-review` 配合：当审查不仅应检查代码质量，还应检查方向和所有者完整性时运行。
- 与 `verification-before-completion` 配合：仅用于指出剩余的方向性风险。它不授予完成判定权。

## 边界

- 优先采用当前项目文件、基线文档、测试、日志和
  用户需求中的证据。如果缺少证据，应将该行标记为未知，而不是
  凭空捏造原则。
- 结果应仅作为建议。此技能可以建议升级处理，但不会
  创建具有权威性的 `GateDecision`、`PolicySnapshot` 或完成
  授权。
- 如果五行审查未改变决策面，请立即返回
  当前工作流。