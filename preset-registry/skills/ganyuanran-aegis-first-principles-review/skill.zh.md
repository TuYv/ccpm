---
name: first-principles-review
description: "Use when asked for first-principles or Occam's-razor review, or when high-risk decisions involve competing constraints, fallback growth, duplicate owners, or architecture direction risk. Ordinary bug fixes stay on the fast path."
---
# 第一性原理审查

## 目的

在另一个 Aegis 工作流作出方向性选择之前，将其作为轻量级决策审查使用。这是一项组合式技能，而不是独立工作流。

不要替代 `brainstorming`、`systematic-debugging`、`writing-plans`、`requesting-code-review` 或 `verification-before-completion`。使用它来理清这些技能将据此执行的决策面。

当本次审查实质性地改变方向时，在自然语言中体现 `Aegis Visibility`：说明改变决策的第一性原理、被舍弃的假设、最小充分路径，或所有者 / 退役证伪条件。保持建议性质并与任务相关；不要将这一视角变成审批权威或通用的技能追踪。

## 使用时机

- 用户要求采用第一性原理、第一性原理思维或奥卡姆剃刀。
- 设计、计划或修复存在多条合理路径，且选择标准不明确。
- 任务目标模糊、约束相互竞争，或存在产品/架构方向风险。
- 调试逐渐演变为反复修复、不断增加回退逻辑、重复所有者、消费者侧修补，或“再加一个分支”的思路。
- 审查发现实现可能在局部上正确，但方向上错误。

## 不要使用

- 简单问答、状态检查、细小的措辞/配置修改，或边界清晰的单一所有者变更。
- 对已批准计划的机械执行，除非出现新的方向冲突。
- 将其作为每个任务、每轮交互或每个 TDD 周期的必经步骤。

## 五行审查

只回答必要内容，通常用五行简短表述：

```text
First Principle: What irreducible outcome must this satisfy?
Non-negotiables: What constraints cannot be broken?
Assumptions to Drop: What is habit, inherited shape, or unproven preference?
Smallest Sufficient Path: What is the least complex path that satisfies the first principle?
Escalation Signal: What finding would require spec/design/architecture review?
```

当方向依赖于新机制或陌生领域时，在路径和升级信号之间插入一行可选内容：

```text
Known Prior Art: proven external pattern worth adopting or adapting to project
constraints (cite source), or `unknown` when precedent cannot be verified here
```

对于修复选项，“最小”指最小的、足够且稳定的修复，而不是文本改动最少：

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

仅当某个设计、修复或计划在写入规范或实现计划之前需要获得认可时，才使用此次升级。

当出现以下任一风险信号时，从五行审查升级：

- 存在多条合理路径，但没有明确的选择标准
- 新增所有者、重复所有者、回退逻辑、适配器或仅用于兼容的承载者
- 旧路径可能需要先删除，或需要设置退役触发条件
- 提案所依赖的假设未经验证
- 用户使用了“更优雅”“长期稳定”“第一性原理”或“奥卡姆”等措辞
- 计划可能将错误的所有者、抽象、兼容性边界或退役计划写入其中
- 现有对象、行为、职责、契约或关系可能被重新解释、收窄、替换或退役，而提案在移除无效权威的同时，可能丢失某个正当作用或明确引用】【。

使用以下紧凑结构：

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

当提案虽然可执行，但可能仍然包含错误的所有者、抽象、契约边界或退役路径时，使用这一更窄的视角。它是方法包的建议性输出，在 `Decision Hygiene Review` 已足够覆盖时，也可以嵌入其中。

当在方法选择、任务分解、评审或完成风险报告之前出现以下任一情况时触发：

- 职责可能重叠，或不清楚谁是规范所有者
- 最小差异会增加调用方侧的回退、保护、适配器或仅用于兼容的载体
- 现有的真实来源或契约可能在更高层级解决这一类问题
- 过时的所有者、回退方案或旧路径可能仍在承载真实逻辑
- 工作中提出了长期稳定性、“更清晰的架构”或更高层级简化方面的主张

使用以下紧凑结构：

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

`Bounded preservation reminder` 是一种由风险触发的推理辅助工具，不是通用产物，也不是详尽的行为清单。检查最小范围内相关的契约、消费者、测试或历史证据。对每个已知的明确引用进行保留、重新绑定、退役或拒绝；将尚未解决的关系明确标记为未知，而不是重新推断它们或声称语义完整性。Method Pack 不会构建权威关系图，不会证明引用完整性或输入溯源，不会计算完整的行为覆盖率，也不会发出运行时门禁。

不要为每个低风险任务运行这一视角。如果它不会改变决策面，请立即返回当前工作流。

## 组成

- 在 `brainstorming` 下：当请求较宽泛、含糊、可能继承了不良产品形态，或涉及 owner / retirement / fallback / adapter 风险时，在选择方法之前运行。若出现这些信号，在推荐或选择方法之前，使用 `Decision Hygiene Review` 或更窄的 `Architecture Integrity Lens`。
- 在 `systematic-debugging` 下：当证据表明修复反复出现、fallback 增长、owner 重复，或出现 consumer 侧补丁时，在之后运行。
- 在 `writing-plans` 下：当计划可能编码错误的 owner、抽象、兼容边界、fallback、adapter 或 retirement 时间表时，在任务分解之前运行。若已批准的 spec 尚未涵盖这一点，在编写任务之前，使用 `Decision Hygiene Review` 或 `Architecture Integrity Lens`。
- 在 `requesting-code-review` 下：当 review 应检查方向和 owner 完整性，而不仅仅是代码质量时运行。
- 在 `verification-before-completion` 下：仅用于说明残余的方向性风险。它不授予完成权限。

## 边界

- 优先使用当前项目文件、基线文档、测试、日志和用户需求中的证据。如果证据缺失，将该项标记为 unknown，而不是编造原则。
- 保持结果为建议性。此 skill 可以建议升级处理，但它不会创建权威性的 `GateDecision`、`PolicySnapshot` 或完成权限。
- 如果这五行 review 不会改变决策面，则立即返回到当前工作流。