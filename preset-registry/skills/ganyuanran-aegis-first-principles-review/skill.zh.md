---
name: first-principles-review
description: "Use when asked for first-principles or Occam's-razor review, or when high-risk decisions involve competing constraints, fallback growth, duplicate owners, or architecture direction risk. Ordinary bug fixes stay on the fast path."
---
# 第一性原理审查

## 目的

将此审查作为另一个 Aegis 工作流做出方向性选择之前的轻量级决策审查。它是一项组合式技能，而不是独立工作流。

不要替代 `brainstorming`、`systematic-debugging`、`writing-plans`、`requesting-code-review` 或 `verification-before-completion`。使用它来清理这些技能将据此开展工作的决策面。

当这项审查实质性地改变方向时，在自然语言中体现 `Aegis Visibility`：指出改变决策的第一性原理、被舍弃的假设、最小充分路径，或所有者 / 退出触发条件伪证。保持其建议性质并限定于具体任务；不要将这一视角变成审批权，也不要变成通用的技能追踪。

## 使用时机

- 用户要求采用第一性原理、第一性原理思维或奥卡姆剃刀。
- 某个设计、计划或修复存在多条合理路径，但选择标准不明确。
- 任务目标模糊、约束相互竞争，或存在产品 / 架构方向风险。
- 调试逐渐演变为反复修复、不断增加回退、重复所有者、消费者侧修补，或“再加一个分支”的思路。
- 审查发现实现可能在局部上正确，但方向上错误。

## 不要使用

- 简单问答、状态检查、微小的措辞 / 配置编辑，或边界清晰的单一所有者变更。
- 对已批准计划的机械执行，除非出现新的方向性冲突。
- 不要将其作为每项任务、每轮交互或每个 TDD 周期的必经步骤。

## 五行审查

只回答必要的内容，通常用五行简短的话：

```text
First Principle: What irreducible outcome must this satisfy?
Non-negotiables: What constraints cannot be broken?
Assumptions to Drop: What is habit, inherited shape, or unproven preference?
Smallest Sufficient Path: What is the least complex path that satisfies the first principle?
Escalation Signal: What finding would require spec/design/architecture review?
```

当方向取决于一种新机制或一个不熟悉的领域时，在路径与升级之间插入一行可选内容：

```text
Known Prior Art: proven external pattern worth adopting or adapting to project
constraints (cite source), or `unknown` when precedent cannot be verified here
```

对于修复方案，“最小”指的是最小的、足够且稳定的修复，而不是文本差异最小：

```text
Minimality Check:
- Smallest textual diff:
- Correct owner:
- Bug class fixed:
- New branch/fallback added:
- Old path retired or scheduled:
- Verdict: sufficient repair | local patch | needs first-principles review
```

## 决策卫生审查

仅当某个设计、修复或计划需要在写入规范或实现计划之前获得认可时，才使用此升级流程。

当出现以下任一风险信号时，从五行审查升级：

- 存在多条合理路径，但没有明确的选择标准
- 出现新的所有者、重复所有者、回退、适配器或仅用于兼容的承载者
- 某条旧路径可能需要先删除处理或设置退出触发条件
- 提案所依赖的某个假设未经验证
- 用户使用了“更优雅”“长期稳定”“第一性原理”或“奥卡姆”等表述
- 计划可能编码了错误的所有者、抽象、兼容性边界或退出计划
- 某个明确的值、标识符、路径或事件可能在不同目标或作用域中承担不同角色，而提议的修复可能会在废止无效的全局权威时，同时移除一个合理的角色

使用以下紧凑格式：

```text
First-principles invariants:
- Non-negotiable goal:
- Non-negotiable constraints:
- Historical assumptions to delete:

Bounded preservation reminder:
- Evidence-backed behavior that must remain correct:
- Highest-risk counterexample:
- Material unknown / uninspected surface:
- Role-before-value ambiguity, if any:

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

当提案虽然可执行，但可能仍然编码了错误的所有者、抽象、契约边界或退役路径时，使用这一更窄的视角。它是方法包中的建议性输出，在适用时可以嵌入 `Decision Hygiene Review` 中。

如果在选择方案、分解任务、评审或完成风险报告之前出现以下任一情况，则触发此视角：

- 职责可能重叠，或不清楚谁是规范所有者
- 最小差异会新增调用方一侧的回退、保护、适配器或仅用于兼容的载体
- 现有的事实来源或契约可能在更高层级解决这一类问题
- 过时的所有者、回退逻辑或旧路径可能仍在承载实际逻辑
- 工作声称要实现长期稳定性、“更清晰的架构”或更高层级的简化

使用以下紧凑格式：

```text
Architecture Integrity Lens:
- Invariant: What must remain true for the system to be coherent?
- Canonical owner / contract: Which owner, contract, or source-of-truth should carry the behavior?
- Responsibility overlap: What duplicate owner, caller-side patch, fallback, or stale path might still carry real logic?
- Higher-level simplification: Can the problem be solved at the owner / contract / source-of-truth layer instead of by another local branch?
- Retirement / falsifier: What old path retires, or what evidence would disprove this architecture judgment?
- Responsibility / capability boundary: Which invalid authority retires, and
  does the same carrier still serve a separately evidenced legitimate role?
- Verdict: proceed | revise design | split owner | return to baseline | needs ADR/baseline sync
```

`Bounded preservation reminder` 是一种由风险触发的推理辅助工具，不是通用产物，也不是穷尽式的行为清单。检查最小范围内相关的契约、消费者、测试或历史证据；陈述实质性未知项，而不是声称语义完整性。Method Pack 不会构建权威的输入谱系、计算完整的行为覆盖率，也不会发出运行时门禁。

不要为每个低风险任务运行此视角。如果它不会改变决策面，则立即返回当前工作流。

## 组合使用

- 与 `brainstorming` 组合：在选择方案之前运行，适用于请求范围宽泛、存在歧义、可能继承不佳的产品形态，或涉及所有者、退役、回退、适配器风险的情况。当出现这些信号时，在推荐或选择方案之前，使用 `Decision Hygiene Review` 或更窄的 `Architecture Integrity Lens`。
- 与 `systematic-debugging` 组合：当证据显示修复反复出现、回退逻辑不断增加、所有者重复或调用方一侧持续打补丁时运行。
- 与 `writing-plans` 组合：在分解任务之前运行，适用于计划可能编码错误的所有者、抽象、兼容性边界、回退、适配器或退役安排的情况。如果获批的规范尚未涵盖这些内容，则在编写任务之前使用 `Decision Hygiene Review` 或 `Architecture Integrity Lens`。
- 与 `requesting-code-review` 组合：当评审应检查方向和所有者完整性，而不仅是代码质量时运行。
- 与 `verification-before-completion` 组合：仅用于指出残余的方向性风险。它不会授予完成授权。

## 边界

- 优先采用当前项目文件、基线文档、测试、日志和用户需求中的证据。如果缺少证据，将该行标记为未知，而不是臆造原则。
- 保持结果的建议性质。此 skill 可以建议升级处理，但不会创建权威的 `GateDecision`、`PolicySnapshot` 或完成权限。
- 如果五行审查没有改变决策面，请立即返回当前工作流。