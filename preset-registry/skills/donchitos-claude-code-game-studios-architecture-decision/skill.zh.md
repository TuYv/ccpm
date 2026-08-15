---
name: architecture-decision
description: "Creates an Architecture Decision Record (ADR) documenting a significant technical decision, its context, alternatives considered, and consequences. Every major technical choice should have an ADR."
argument-hint: "[title] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, Task, AskUserQuestion
model: sonnet
---
调用此技能时：

## 0. 解析参数 — 检测改造模式

确定审查模式（仅确定一次，并存储供本次运行中的所有门禁派生项使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该值
2. 否则读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认为 `lean`

完整的检查模式请参阅 `.claude/docs/director-gates.md`。

**如果参数以 `retrofit` 开头，后跟一个文件路径**
（例如，`/architecture-decision retrofit docs/architecture/adr-0001-event-system.md`）：

进入**改造模式**：

1. 完整读取现有的 ADR 文件。
2. 通过扫描标题来识别已存在的模板章节：
   - `## Status` — 如果缺失则为**阻塞性问题**：`/story-readiness` 无法检查 ADR 是否已被接受
   - `## ADR Dependencies` — 如果缺失则为高风险：依赖顺序会失效
   - `## Engine Compatibility` — 如果缺失则为高风险：知识截止日期后的风险未知
   - `## GDD Requirements Addressed` — 如果缺失则为中等风险：会丢失可追溯性
3. 向用户展示：
   ```
   ## Retrofit: [ADR title]
   File: [path]

   Sections already present (will not be touched):
   ✓ Status: [current value, or "MISSING — will add"]
   ✓ [section]

   Missing sections to add:
   ✗ Status — BLOCKING (stories cannot validate ADR acceptance without this)
   ✗ ADR Dependencies — HIGH
   ✗ Engine Compatibility — HIGH
   ```
4. 询问：“是否要我添加缺失的 [N] 个章节？我不会修改任何现有内容。”
5. 如果确认：
   - 对于 **Status**：询问用户——“此决策当前的状态是什么？”
     选项："Proposed"、"Accepted"、"Deprecated"、"Superseded by ADR-XXXX"
   - 对于 **ADR Dependencies**：询问——“此决策是否依赖任何其他 ADR？
     它是否会启用或阻塞任何其他 ADR 或史诗？”每个字段均可接受 "None"。
   - 对于 **Engine Compatibility**：读取引擎参考文档（与下面的步骤 1 相同）
     并请用户确认领域。然后使用经过验证的数据生成表格。
   - 对于 **GDD Requirements Addressed**：询问——“哪些 GDD 系统促成了此决策？
     此 ADR 解决了每个 GDD 中的哪些具体需求？”
   - 使用 Edit 工具将每个缺失的章节追加到 ADR 文件中。
   - **绝不修改任何现有章节。**只能追加或填充缺失的章节。
6. 添加完所有缺失章节后，如果 ADR 的 `## Date` 字段不存在，则更新该字段。
7. 建议：“现在此 ADR 已具备 Status 和 Dependencies 字段，请运行 `/architecture-review` 重新验证覆盖情况。”

如果不是改造模式，则继续执行下面的步骤 1（正常编写 ADR）。

**无参数防护**：如果未提供参数（标题为空），请在运行 Phase 0 之前询问：

> “你正在记录什么技术决策？请提供一个简短标题
> （例如，`event-system-architecture`、`physics-engine-choice`）。”

将用户的回答用作标题，然后继续执行步骤 1。

---

## 1. 加载引擎上下文（始终最先执行）

在执行任何其他操作之前，先确定引擎环境：

1. 读取 `docs/engine-reference/[engine]/VERSION.md` 以获取：
   - 引擎名称和版本
   - LLM 知识截止日期
   - 知识截止日期后版本的风险等级（低 / 中 / 高）

2. 根据标题或用户描述确定此架构决策的**领域**。常见领域包括：Physics、Rendering、UI、Audio、Navigation、
   Animation、Networking、Core、Input、Scripting。

3. 如果存在对应的模块参考文档，请阅读：
   `docs/engine-reference/[engine]/modules/[domain].md`

4. 阅读 `docs/engine-reference/[engine]/breaking-changes.md`——标记相关领域中
   晚于 LLM 训练数据截止时间的所有变更。

5. 阅读 `docs/engine-reference/[engine]/deprecated-apis.md`——标记相关领域中
   不应使用的所有 API。

6. 如果该领域的风险等级为 MEDIUM 或 HIGH，请在继续之前**显示知识缺口警告**：

   ```
   ⚠️  ENGINE KNOWLEDGE GAP WARNING
   Engine: [name + version]
   Domain: [domain]
   Risk Level: HIGH — This version is post-LLM-cutoff.

   Key changes verified from engine-reference docs:
   - [Change 1 relevant to this domain]
   - [Change 2]

   This ADR will be cross-referenced against the engine reference library.
   Proceed with verified information only — do NOT rely solely on training data.
   ```

   如果尚未配置引擎，请提示：“尚未配置引擎。
   请先运行 `/setup-engine`，或告诉我你正在使用哪个引擎。”

---

## 2. 确定下一个 ADR 编号

扫描 `docs/architecture/` 中现有的 ADR，以确定下一个编号。

---

## 3. 收集上下文

阅读相关代码、现有 ADR，以及 `design/gdd/` 中的相关 GDD。

### 3a：架构注册表检查（阻塞门禁）

阅读 `docs/registry/architecture.yaml`。提取与此 ADR 的
领域和决策相关的条目（按系统名称、领域关键字或涉及的状态进行 grep）。

在协作设计开始**之前**，将所有相关立场作为锁定约束呈现给用户：

```
## Existing Architectural Stances (must not contradict)

State Ownership:
  player_health → owned by health-system (ADR-0001)
  Interface: HealthComponent.current_health (read-only float)
  → If this ADR reads or writes player health, it must use this interface.

Interface Contracts:
  damage_delivery → signal pattern (ADR-0003)
  Signal: damage_dealt(amount, target, is_crit)
  → If this ADR delivers or receives damage events, it must use this signal.

Forbidden Patterns:
  ✗ autoload_singleton_coupling (ADR-0001)
  ✗ direct_cross_system_state_write (ADR-0000)
  → The proposed approach must not use these patterns.
```

如果用户提出的决策会与任何已注册立场冲突，请立即指出冲突：

> “⚠️ 冲突：此 ADR 提议 [X]，但 ADR-[NNNN] 已确立 [Y] 是
> 此用途所接受的模式。如果不解决此问题就继续，将产生相互矛盾的 ADR 和不一致的用户故事。
> 可选方案：(1) 与现有立场保持一致，(2) 使用明确的替代方案取代 ADR-[NNNN]，
> (3) 说明为什么此情况属于例外。”

在任何冲突得到解决，或被明确接受为有意设置的例外之前，
不要继续执行第 4 步（协作设计）。

---

## 4. 协作引导决策

在提出任何问题之前，先根据已收集的上下文（已阅读的 GDD、已加载的引擎参考资料、已扫描的现有 ADR）推导出技能认为最合理的判断。然后使用 `AskUserQuestion` 提供一个**确认/调整**提示，而不是开放式问题。

**先推导假设：**
- **问题**：根据标题和 GDD 上下文，推断需要做出什么决策
- **替代方案**：根据引擎参考资料和 GDD 要求，提出 2-3 个具体选项
- **依赖项**：扫描现有 ADR 以查找上游依赖项；如果不明确，则假设为 None
- **GDD 关联**：提取标题直接涉及的 GDD 系统
- **状态**：新 ADR 始终为 `Proposed`——绝不要询问用户状态是什么

**假设选项卡的范围**：假设仅涵盖：问题界定、替代方案、上游依赖项、GDD 关联和状态。模式设计问题（例如，“生成时机应如何运作？”、“数据应该内联还是外置？”）不属于假设——它们是设计决策，应在确认假设后的单独步骤中处理。不要在假设的 AskUserQuestion 组件中包含模式设计问题。

**确认假设后**，如果 ADR 涉及模式或数据设计选择，请使用单独的多选项卡 `AskUserQuestion`，在起草之前分别询问每个设计问题。

**使用 `AskUserQuestion` 展示假设：**

```
Here's what I'm assuming before drafting:

Problem: [one-sentence problem statement derived from context]
Alternatives I'll consider:
  A) [option derived from engine reference]
  B) [option derived from GDD requirements]
  C) [option from common patterns]
GDD systems driving this: [list derived from context]
Dependencies: [upstream ADRs if any, otherwise "None"]
Status: Proposed

[A] Proceed — draft with these assumptions
[B] Change the alternatives list
[C] Adjust the GDD linkage
[D] Add a performance budget constraint
[E] Something else needs changing first
```

在用户确认假设或提供更正之前，不要生成 ADR。

**引擎专家和 TD 的评审返回后**（步骤 5.5/5.6），如果仍有未解决的决策，请将每一项分别作为单独的 `AskUserQuestion` 展示，并提供建议选项以及一个可自由输入文本的备选项：

```
Decision: [specific unresolved point]
[A] [option from specialist review]
[B] [alternative option]
[C] Different approach — I'll describe it
```

**ADR 依赖项**——从现有 ADR 中推导，然后进行确认：
- 此决策是否依赖任何尚未被接受的其他 ADR？
- 它是否会启用或解除对任何其他 ADR 或史诗的阻塞？
- 它是否会阻止任何特定史诗开始实施？

将答案记录在 **ADR Dependencies** 部分。如果没有适用的约束，则每个字段填写 "None"。

---

## 5. 生成 ADR

遵循以下格式：

```markdown
# ADR-[NNNN]: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded by ADR-XXXX]

## Date
[Date of decision]

## Engine Compatibility

| Field | Value |
|-------|-------|
| **Engine** | [e.g. Godot 4.6] |
| **Domain** | [Physics / Rendering / UI / Audio / Navigation / Animation / Networking / Core / Input] |
| **Knowledge Risk** | [LOW / MEDIUM / HIGH — from VERSION.md] |
| **References Consulted** | [List engine-reference docs read, e.g. `docs/engine-reference/godot/modules/physics.md`] |
| **Post-Cutoff APIs Used** | [Any APIs from post-LLM-cutoff versions this decision depends on, or "None"] |
| **Verification Required** | [Specific behaviours to test before shipping, or "None"] |

## ADR Dependencies

| Field | Value |
|-------|-------|
| **Depends On** | [ADR-NNNN (must be Accepted before this can be implemented), or "None"] |
| **Enables** | [ADR-NNNN (this ADR unlocks that decision), or "None"] |
| **Blocks** | [Epic/Story name — cannot start until this ADR is Accepted, or "None"] |
| **Ordering Note** | [Any sequencing constraint that isn't captured above] |

## Context

### Problem Statement
[What problem are we solving? Why does this decision need to be made now?]

### Constraints
- [Technical constraints]
- [Timeline constraints]
- [Resource constraints]
- [Compatibility requirements]

### Requirements
- [Must support X]
- [Must perform within Y budget]
- [Must integrate with Z]

## Decision

[The specific technical decision made, described in enough detail for someone
to implement it.]

### Architecture Diagram
[ASCII diagram or description of the system architecture this creates]

### Key Interfaces
[API contracts or interface definitions this decision creates]

## Alternatives Considered

### Alternative 1: [Name]
- **Description**: [How this would work]
- **Pros**: [Advantages]
- **Cons**: [Disadvantages]
- **Rejection Reason**: [Why this was not chosen]

### Alternative 2: [Name]
- **Description**: [How this would work]
- **Pros**: [Advantages]
- **Cons**: [Disadvantages]
- **Rejection Reason**: [Why this was not chosen]

## Consequences

### Positive
- [Good outcomes of this decision]

### Negative
- [Trade-offs and costs accepted]

### Risks
- [Things that could go wrong]
- [Mitigation for each risk]

## GDD Requirements Addressed

| GDD System | Requirement | How This ADR Addresses It |
|------------|-------------|--------------------------|
| [system-name].md | [specific rule, formula, or performance constraint from that GDD] | [how this decision satisfies it] |

## Performance Implications
- **CPU**: [Expected impact]
- **Memory**: [Expected impact]
- **Load Time**: [Expected impact]
- **Network**: [Expected impact, if applicable]

## Migration Plan
[If this changes existing code, how do we get from here to there?]

## Validation Criteria
[How will we know this decision was correct? What metrics or tests?]

## Related Decisions
- [Links to related ADRs]
- [Links to related design documents]
```

5.5. **引擎专家验证** — 保存前，通过 Task 启动**主要引擎专家**来验证起草的 ADR：
   - 读取 `.claude/docs/technical-preferences.md` 的 `Engine Specialists` 部分，以获取主要专家
   - 如果未配置引擎（`[TO BE CONFIGURED]`），则跳过此步骤
   - 使用 `subagent_type: [primary specialist]` 启动子代理，并向其提供：ADR 的 Engine Compatibility 部分、Decision 部分、Key Interfaces，以及引擎参考文档路径。要求其：
     1. 确认所提方案对于锁定的引擎版本而言符合惯用做法
     2. 标记任何已弃用或在训练数据截止时间之后发生变更的 API 或模式
     3. 找出当前 ADR 草案中尚未涵盖的引擎特定风险或易踩的坑
   - 如果专家发现**阻塞性问题**（错误的 API、已弃用的方案、引擎版本不兼容）：相应修改 Decision 和 Engine Compatibility 部分，然后在继续之前与用户确认这些变更
   - 如果专家只发现**次要注意事项**：将其纳入 ADR 的 Risks 子部分

**审查模式检查** — 在启动 TD-ADR 前应用：
- `solo` → 跳过。注明：“已跳过 TD-ADR — 单人模式。”继续执行步骤 5.7（GDD 同步检查）。
- `lean` → 跳过（不是 PHASE-GATE）。注明：“已跳过 TD-ADR — 精简模式。”继续执行步骤 5.7（GDD 同步检查）。
- `full` → 正常启动。

5.6. **技术总监战略审查** — 引擎专家验证完成后，通过 Task 使用关卡 **TD-ADR**（`.claude/docs/director-gates.md`）启动 `technical-director`：
   - 传入：ADR 文件路径（或草案内容）、引擎版本、领域，以及同一领域中的所有现有 ADR
   - TD 验证架构一致性（此决策是否与整个系统保持一致？）— 这与引擎专家的 API 层面检查不同
   - 如果结果为 CONCERNS 或 REJECT：在继续之前，相应修改 Decision 或 Alternatives 部分

5.7. **GDD 同步检查** — 在展示写入审批之前，扫描“GDD Requirements Addressed”部分中引用的所有 GDD，检查其命名是否与 ADR 的 Key Interfaces 和 Decision 部分不一致（重命名后的信号、API 方法或数据类型）。如果发现任何不一致，请在写入审批之前立即以**醒目的警告块**呈现，而不是作为脚注：

```
⚠️ GDD SYNC REQUIRED
[gdd-filename].md uses names this ADR has renamed:
  [old_name] → [new_name_from_adr]
  [old_name_2] → [new_name_2_from_adr]
The GDD must be updated before or alongside writing this ADR to prevent
developers reading the GDD from implementing the wrong interface.
```

如果没有不一致，则静默跳过此块。

5. **写入审批** — 使用 `AskUserQuestion`：

如果发现 GDD 同步问题：
- “ADR 草案已完成。你希望如何继续？”
  - [A] 在同一次操作中写入 ADR 并更新 GDD
  - [B] 仅写入 ADR — 我会手动更新 GDD
  - [C] 暂不写入 — 我需要进一步审查

如果没有 GDD 同步问题：
- “ADR 草案已完成。可以写入吗？”
  - [A] 将 ADR 写入 `docs/architecture/adr-[NNNN]-[slug].md`
  - [B] 暂不写入 — 我需要进一步审查

如果对任一写入选项选择“是”，则写入文件，并在需要时创建目录。
对于带有 GDD 更新的选项 [A]：还需更新 GDD 文件以使用新名称。

6. **更新架构注册表**

扫描已写入的 ADR，找出应注册的新架构立场：
- 它声明拥有的状态
- 它定义的接口契约（信号签名、方法 API）
- 它声明的性能预算
- 它明确做出的 API 选择
- 它禁止的模式（Consequences → Negative 或明确写有“do not use X”）

展示候选项：
```
Registry candidates from this ADR:
  NEW state ownership:      player_stamina → stamina-system
  NEW interface contract:   stamina_depleted signal
  NEW performance budget:   stamina-system: 0.5ms/frame
  NEW forbidden pattern:    polling stamina each frame (use signal instead)
  EXISTING (referenced_by update only): player_health → already registered ✅
```

**注册表追加逻辑**：写入 `docs/registry/architecture.yaml` 时，不要假定各节为空。该文件可能已经包含本次会话中此前写入的 ADR 条目。每次调用 Edit 前：
1. 读取 `docs/registry/architecture.yaml` 的当前状态
2. 找到正确的节（state_ownership、interfaces、forbidden_patterns、api_decisions）
3. 将新条目追加到该节最后一个现有条目之后——不要尝试替换可能已不存在的 `[]` 占位符
4. 如果该节中已有条目，则使用最后一个条目的结尾内容作为 `old_string` 锚点，并在其后追加新条目

**阻塞要求——未经用户明确批准，不得写入 `docs/registry/architecture.yaml`。**

使用 `AskUserQuestion` 询问：
- “我可以使用这 [N] 个新立场更新 `docs/registry/architecture.yaml` 吗？”
  - 选项：“是——更新注册表”、“暂不——我想查看候选项”、“跳过注册表更新”

仅当用户选择“是”时才继续。如果选择“是”：追加新条目。切勿修改现有条目——如果某个立场发生变化，请将旧条目设置为 `status: superseded_by: ADR-[NNNN]`，并添加新条目。

---

## 6. 后续步骤

写入 ADR（并可选更新注册表）后，使用 `AskUserQuestion` 结束。

生成小组件前：
1. 读取 `docs/registry/architecture.yaml`——检查是否仍有尚未编写的优先 ADR（查找 technical-preferences.md 或 systems-index.md 中标记为前置条件的 ADR）
2. 检查现在是否已编写所有前置 ADR。如果是，则包含“开始编写 GDD”选项。
3. 将所有剩余的优先 ADR 分别列为独立选项——而不仅仅是接下来的一两个。

小组件格式：
```
ADR-[NNNN] written and registry updated. What would you like to do next?
[1] Write [next-priority-adr-name] — [brief description from prerequisites list]
[2] Write [another-priority-adr] — [brief description]  (include ALL remaining ones)
[N] Start writing GDDs — run `/design-system [first-undesigned-system]` (only show if all prerequisite ADRs are written)
[N+1] Stop here for this session
```

如果没有剩余的优先级 ADR，也没有尚未设计的 GDD 系统，则只提供“在此停止”选项，并建议在全新的会话中运行 `/architecture-review`。

**始终在结束输出中包含以下固定通知（不得省略）：**

> 要根据你的 GDD 验证 ADR 的覆盖情况，请打开一个**全新的 Claude Code 会话**
> 并运行 `/architecture-review`。
>
> **切勿在运行 `/architecture-decision` 的同一会话中运行 `/architecture-review`。**
> 审查代理必须独立于编写上下文，才能给出客观的
> 评估。在此处运行会使审查失效。

将所有因等待此 ADR 而处于 `Status: Blocked` 状态的 story 更新为 `Status: Ready`。