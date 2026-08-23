---
name: first-principles-review
description: "Use when asked for first-principles or Occam's-razor review, or when high-risk decisions involve competing constraints, fallback growth, duplicate owners, or architecture direction risk. Ordinary bug fixes stay on the fast path."
---
# 第一性原理审查

## 目的

在另一个 Aegis 工作流做出方向性选择之前，将其用作轻量级决策审查。它是一项组合式技能，而非独立工作流。

不要取代 `brainstorming`、`systematic-debugging`、`writing-plans`、`requesting-code-review` 或 `verification-before-completion`。使用它来梳理这些技能将要作用的决策面。

当此审查实质性地改变了方向时，应在自然行文中呈现 `Aegis Visibility`：指出改变决策的第一性原理、被舍弃的假设、最小充分路径，或负责人 / 退役证伪条件。保持其建议性和任务针对性；不要把这一视角变成审批权威或通用的技能追踪记录。

## 适用场景

- 用户要求运用第一性原理、第一性原理思维或奥卡姆剃刀。
- 某项设计、计划或修复存在多条合理路径，但选择标准不明确。
- 任务的目标含糊、约束相互冲突，或存在产品/架构方向风险。
- 调试正逐渐演变为反复修复、不断增加回退机制、出现重复负责人、在消费端打补丁，或采用“再加一个分支就好”的推理方式。
- 审查发现，实现可能在局部上是正确的，但方向上是错误的。

## 不适用场景

- 简单问答、状态检查、微小的措辞/配置修改，或边界清晰且只有单一负责人的变更。
- 机械执行已经批准的计划，除非出现新的方向性冲突。
- 不要将其作为每项任务、每轮对话或每个 TDD 周期的必经步骤。

## 五行审查

只回答必要内容，通常使用五个简短行：

```text
First Principle: What irreducible outcome must this satisfy?
Non-negotiables: What constraints cannot be broken?
Assumptions to Drop: What is habit, inherited shape, or unproven preference?
Smallest Sufficient Path: What is the least complex path that satisfies the first principle?
Escalation Signal: What finding would require spec/design/architecture review?
```

当方向取决于新机制或不熟悉的领域时，可在路径和升级之间插入一个可选行：

```text
Known Prior Art: proven external pattern worth adopting or adapting to project
constraints (cite source), or `unknown` when precedent cannot be verified here
```

对于修复方案，“最小”是指最小充分且稳定的修复，而不是文本差异最小：

```text
Minimality Check:
- Smallest textual diff:
- Correct owner:
- Bug class fixed:
- New branch/fallback added:
- Old path retired or scheduled:
- Verdict: sufficient repair | local patch | needs first-principles review
```

## 决策规范审查

仅当某项设计、修复或计划在写入规范或实施计划之前需要获得认可时，才使用此升级机制。

当出现以下任一风险信号时，从五行审查升级：

- 存在多条合理路径，但没有明确的选择标准
- 引入新的负责人、重复负责人、回退机制、适配器或仅用于兼容性的载体
- 某条旧路径可能需要先删除处理或设置退役触发条件
- 提案依赖某个未经验证的假设
- 用户使用“更优雅”“长期稳定”“第一性原理”或“奥卡姆”等表述
- 计划可能会固化错误的负责人、抽象、兼容性边界或退役时间表

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

## 架构完整性视角

当提案虽可执行，但仍可能采用了错误的所有者、抽象、契约边界或退役路径时，使用这一更聚焦的视角。它属于咨询性质的方法包输出，并可在已足够满足需求时嵌入 `Decision Hygiene Review` 中。

在选择方案、分解任务、开展评审或报告完成风险之前，若出现以下任一情况，则触发此视角：

- 职责可能重叠，或规范所有者尚不明确
- 最小差异方案增加了调用方侧的回退、保护逻辑、适配器或仅用于兼容的载体
- 现有的事实来源或契约可以在更高层级解决这一类问题
- 过时的所有者、回退机制或旧路径可能仍在承载实际逻辑
- 该工作声称能够实现长期稳定性、“更整洁的架构”或更高层级的简化

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

不要对每个低风险任务都运行此视角。如果它不会改变决策面，请立即返回当前工作流。

## 组合方式

- 与 `brainstorming` 配合：当请求范围宽泛、存在歧义、可能沿用不佳的产品形态，或涉及所有者／退役／回退／适配器风险时，在选择方案之前运行。当出现这些信号时，应在推荐或选择方案之前使用 `Decision Hygiene Review` 或范围更窄的 `Architecture Integrity Lens`。
- 与 `systematic-debugging` 配合：当证据表明存在反复修复、回退逻辑增长、所有者重复或使用方侧修补时运行。
- 与 `writing-plans` 配合：当计划可能固化错误的所有者、抽象、兼容性边界、回退、适配器或退役时间表时，在分解任务之前运行。如果已批准的规范尚未涵盖这些内容，请在编写任务之前使用 `Decision Hygiene Review` 或 `Architecture Integrity Lens`。
- 与 `requesting-code-review` 配合：当评审不仅需要检查代码质量，还需要检查方向与所有者完整性时运行。
- 与 `verification-before-completion` 配合：仅用于指出残留的方向性风险。它不授予完成判定权。

## 边界

- 优先采用当前项目文件、基线文档、测试、日志和用户需求中的证据。如果缺少证据，将该行标记为未知，而不是臆造原则。
- 结果仅供建议参考。此技能可以建议升级处理，但不会创建权威的 `GateDecision`、`PolicySnapshot` 或完成授权。
- 如果五行审查未改变决策范围，请立即返回当前工作流。