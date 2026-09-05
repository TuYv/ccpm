---
name: first-principles-review
description: "Use when asked for first-principles or Occam's-razor review, or when high-risk decisions involve competing constraints, fallback growth, duplicate owners, or architecture direction risk. Ordinary bug fixes stay on the fast path."
---
# 第一性原理评审

## 目的

将此作为另一个 Aegis 工作流做出方向性决策前的轻量级决策评审。这是一项组合式技能，不是独立工作流。

不要替代 `brainstorming`、`systematic-debugging`、`writing-plans`、`requesting-code-review` 或 `verification-before-completion`。使用它来清理这些技能将要处理的决策面。

当本评审实质性地改变方向时，在自然语言中呈现 `Aegis Visibility`：说明改变决策的第一性原理、被放弃的假设、最小充分路径，或所有者 / 退出验证条件。保持建议性质，并聚焦具体任务；不要将这一视角变成审批权限或泛化的技能调用记录。

## 使用时机

- 用户要求第一性原理、第一性原理思维或奥卡姆剃刀。
- 设计、计划或修复存在多条合理路径，且选择标准不明确。
- 任务目标含糊、约束相互竞争，或存在产品 / 架构方向风险。
- 调试逐渐演变为反复修复、不断增加回退逻辑、重复所有者、消费端修补，或“再加一个分支”的思路。
- 评审发现实现可能在局部上正确，但方向上错误。

## 不使用时机

- 简单问答、状态检查、微小的措辞 / 配置修改，或边界清晰的单一所有者变更。
- 对已批准计划的机械执行，除非出现新的方向冲突。
- 不要将其作为每个任务、每轮交互或每个 TDD 周期的必经步骤。

## 五行评审

只回答必要内容，通常用五行简短表述：

```text
First Principle: What irreducible outcome must this satisfy?
Non-negotiables: What constraints cannot be broken?
Assumptions to Drop: What is habit, inherited shape, or unproven preference?
Smallest Sufficient Path: What is the least complex path that satisfies the first principle?
Escalation Signal: What finding would require spec/design/architecture review?
```

当方向依赖于新机制或不熟悉的领域时，在路径和升级信号之间插入一行可选内容：

```text
Known Prior Art: proven external pattern worth adopting or adapting to project
constraints (cite source), or `unknown` when precedent cannot be verified here
```

对于修复方案而言，“最小”指最小的、足够且稳定的修复，而不是文本改动最少：

```text
Minimality Check:
- Smallest textual diff:
- Correct owner:
- Bug class fixed:
- New branch/fallback added:
- Old path retired or scheduled:
- Verdict: sufficient repair | local patch | needs first-principles review
```

## 决策卫生评审

仅当设计、修复或计划需要在写入规范或实施计划前获得认可时，才使用此升级流程。

当出现以下任一风险信号时，从五行评审升级：

- 存在多条合理路径，但没有明确的选择标准
- 新增所有者、重复所有者、回退逻辑、适配器或仅用于兼容的承载体
- 旧路径可能需要先删除处理或退出触发条件
- 提案依赖某个未经验证的假设
- 用户使用了“更优雅”“长期稳定”“第一性原理”或“奥卡姆”等措辞
- 计划可能会写入错误的所有者、抽象、兼容边界或退出时间表
- 现有对象、行为、职责、契约或关系可能被重新解释、收窄、替换或退出，而提案在移除无效权威的同时，可能丢失其合法作用或明确引用。

Use this compact shape:

```text
First-principles invariants:
- Non-negotiable goal:
- Non-negotiable constraints:
- Historical assumptions to delete:

Bounded preservation reminder:
- Evidence-backed behavior that must remain correct:
- Highest-risk counterexample:
- Material unknown / uninspected surface:
- Known explicit anchors / upstream-downstream refs and disposition:
- Role-before-value ambiguity, if any:

Owner / retirement matrix:
- New canonical owner:
- Old owner:
- Compat-only carrier:
- Delete-first / retirement trigger:

Falsification matrix (evaluate in order; stop at the first failing gate):
- Gate 0 - Premise evidence (stage-graded): design stage accepts spec/logic
  refs; implementation/runtime stage requires log, telemetry, or test
  evidence. No evidence -> park as watch-listed, do not enter value
  evaluation.
- Gate 1 - Decidability: no obtainable evidence to judge it -> park as a
  watched falsifier, do not act.
- Gate 2 - Value (any one): lowers future fix probability / shrinks the
  solution set / exposes a missing actionable acceptance criterion / the same
  broken assumption is reused elsewhere. Passing here still requires
  gates 3-5.
- Gate 3 - Cost match: change cost vs business priority, costed at the
  current stage; a valid but deferred counterexample is recorded in the
  owner doc, never parked orally.
- Gate 4 - Goal regression: the constrained solution still meets the original
  goal; re-read the accepted-constraint list at existing checkpoints (design
  review, plan approval, pre-completion verification).
- Gate 5 - Minimize then classify: boundary-shaped destructive claims must be
  minimized first; premise attacks classify as destructive directly.
  Classes: destructive (refactor/retirement track) | supplementary (boundary
  constraint) | watch-listed (falsifier). Conflicting counterexamples are
  decided by business-goal ranking, never by stacking constraints.
- Gate 6 - Adoption trace: the cheapest checkable form (regression test for
  destructive; contract, assertion, or checklist line for supplementary),
  written into the existing owner doc.

Verdict:
- Adopt / revise / reject / needs evidence:
- Blocking gaps:
- Next evidence:
```

## Architecture Integrity Lens

Use this narrower lens when a proposal is executable but may still encode the
wrong owner, abstraction, contract boundary, or retirement path. It is advisory
method-pack output and may be embedded inside `Decision Hygiene Review` when
that is enough.

Trigger it when any of these appear before approach selection, task
decomposition, review, or completion-risk reporting:

- responsibilities may overlap or a canonical owner is unclear
- the smallest diff adds a caller-side fallback, guard, adapter, or compat-only
  carrier
- an existing source-of-truth or contract could solve the class of problem at a
  higher level
- a stale owner, fallback, or old path may keep carrying real logic
- the work makes a long-term stability, "cleaner architecture", or
  higher-level simplification claim.

架构完整性审视：
- 不变量：系统保持连贯所必须满足的条件是什么？
- 规范所有者 / 契约：哪个所有者、契约或事实来源应承载该行为？
- 职责重叠：哪个重复所有者、调用方补丁、回退逻辑或过时路径可能仍承载实际逻辑？
- 更高层级的简化：能否在所有者 / 契约 / 事实来源层解决问题，而不是再增加一个局部分支？
- 退役 / 证伪条件：哪个旧路径将被退役，或者什么证据会推翻这一架构判断？
- 职责 / 能力边界：哪个无效权限将被退役，并且
  同一个承载者是否仍基于独立证据承担着另一个合法职责？
- 结论：proceed | revise design | split owner | return to baseline | needs ADR/baseline sync

`有界保留提醒` 是一种由风险触发的推理辅助工具，不是通用产物，也不是
穷尽式行为清单。检查最小范围内相关的契约、消费者、测试或历史证据。对每个
已知的明确引用进行保留、重新绑定、退役或拒绝；将未解决的关系声明为未知，
而不是重新推断这些关系或声称语义完整性。Method Pack 不会构建权威关系图，
证明引用完整性或输入沿袭，计算完整的行为覆盖率，也不会发出运行时门禁。

不要对每个低风险任务运行此审视。如果它不会改变决策面，请立即返回当前工作流。

## 组合

- 与 `brainstorming` 结合：当请求范围广泛、含义模糊、很可能继承糟糕的产品形态，
  或涉及所有者 / 退役 / 回退 / 适配器风险时，在选择处理方式之前运行。如果出现
  这些信号，在推荐或选择处理方式之前使用 `Decision Hygiene Review` 或范围更窄的
  `Architecture Integrity Lens`。
- 与 `systematic-debugging` 结合：当证据显示修复反复出现、回退逻辑不断增加、
  存在重复所有者或消费者侧修补时运行。
- 与 `writing-plans` 结合：当计划可能固化错误的所有者、抽象、兼容性边界、回退逻辑、
  适配器或退役计划时，在任务分解之前运行。如果已批准的规范尚未覆盖这些内容，
  请在编写任务之前使用 `Decision Hygiene Review` 或 `Architecture Integrity Lens`。
- 与 `requesting-code-review` 结合：当审查应检查方向和所有者完整性，而不仅是代码质量时运行。
- 与 `verification-before-completion` 结合：仅用于指出残余的方向性风险。它不会授予完成权限。

## 边界

- 优先采用当前项目文件、基线文档、测试、日志和用户需求中的证据。如果缺少证据，
  将该项标记为未知，而不是自行臆造原则。
- 保持结果的建议性质。此技能可以建议升级处理，但不会创建权威的 `GateDecision`、
  `PolicySnapshot` 或完成权限。
- 如果五行审查不会改变决策面，请立即返回当前工作流。