---
name: create-architecture
description: "Guided, section-by-section authoring of the master architecture document for the game. Reads all GDDs, the systems index, existing ADRs, and the engine reference library to produce a complete architecture blueprint before any code is written. Engine-version-aware: flags knowledge gaps and validates decisions against the pinned engine version."
argument-hint: "[focus-area: full | layers | data-flow | api-boundaries | adr-audit] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash, AskUserQuestion, Task
model: sonnet
agent: technical-director
---
# 创建架构

此技能会生成 `docs/architecture/architecture.md`——主架构文档，
将所有已批准的 GDD 转化为具体的技术蓝图。
它处于设计与实现之间，必须在 Sprint 规划开始之前创建。

**不同于 `/architecture-decision`**：ADR 记录单个决策点。
此技能创建全系统蓝图，为 ADR 提供上下文。

确定审查模式（仅确定一次，并存储以供本次运行中的所有关卡生成任务使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该值
2. 否则读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认为 `lean`

完整的检查模式请参阅 `.claude/docs/director-gates.md`。

**参数模式：**
- **无参数 / `full`**：完整的引导式流程——从头到尾涵盖所有章节
- **`layers`**：仅聚焦于系统分层图
- **`data-flow`**：仅聚焦于模块之间的数据流
- **`api-boundaries`**：仅聚焦于 API 边界定义
- **`adr-audit`**：仅审计现有 ADR 中的引擎兼容性缺口

---

## 阶段 0：加载所有上下文

在执行任何其他操作之前，按以下顺序加载完整的项目上下文：

### 0a. 引擎上下文（关键）

完整读取引擎参考资料库：

1. `docs/engine-reference/[engine]/VERSION.md`
   → 提取：引擎名称、版本、LLM 知识截止时间、截止时间之后的风险等级
2. `docs/engine-reference/[engine]/breaking-changes.md`
   → 提取：所有 HIGH 和 MEDIUM 风险的变更
3. `docs/engine-reference/[engine]/deprecated-apis.md`
   → 提取：应避免使用的 API
4. `docs/engine-reference/[engine]/current-best-practices.md`
   → 提取：与训练数据不同且发布于知识截止时间之后的最佳实践
5. `docs/engine-reference/[engine]/modules/` 中的所有文件
   → 提取：每个领域当前的 API 模式

如果尚未配置引擎，则停止并提示：
> “尚未配置引擎。请先运行 `/setup-engine`。如果不知道目标引擎及其版本，
> 就无法编写架构文档。”

### 0b. 设计上下文 + 技术需求提取

读取所有已批准的设计文档，并从每份文档中提取技术需求：

1. `design/gdd/game-concept.md`——游戏支柱、类型、核心循环
2. `design/gdd/systems-index.md`——所有系统、依赖关系、优先级层级
3. `.claude/docs/technical-preferences.md`——命名约定、性能预算、
   允许使用的库、禁止使用的模式
4. **`design/gdd/` 中的每份 GDD**——针对每份文档提取技术需求：
   - 游戏规则所隐含的数据结构
   - 明确说明或隐含的性能约束
   - 系统所需的引擎功能
   - 跨系统通信模式（哪些系统相互通信，以及如何通信）
   - 必须持久化的状态（对保存/加载的影响）
   - 线程或时序需求

构建一份**技术需求基线**——即从所有 GDD 中提取的全部需求的扁平列表，
编号格式为 `TR-[gdd-slug]-[NNN]`。这是架构必须覆盖的完整需求集合。
按以下格式呈现：

```
## Technical Requirements Baseline
Extracted from [N] GDDs | [X] total requirements

| Req ID | GDD | System | Requirement | Domain |
|--------|-----|--------|-------------|--------|
| TR-combat-001 | combat.md | Combat | Hitbox detection per-frame | Physics |
| TR-combat-002 | combat.md | Combat | Combo state machine | Core |
| TR-inventory-001 | inventory.md | Inventory | Item persistence | Save/Load |
```

这一基线将作为后续每个阶段的输入。在本次会话结束前，GDD 中的每项需求都必须有相应的架构决策作为支撑。

### 0c. 现有架构决策

阅读 `docs/architecture/` 中的所有文件，了解已经做出的决策。
列出找到的所有 ADR 及其所属领域。

### 0d. 生成知识缺口清单

继续之前，显示以下结构化摘要：

```
## Engine Knowledge Gap Inventory
Engine: [name + version]
LLM Training Covers: up to approximately [version]
Post-Cutoff Versions: [list]

### HIGH RISK Domains (must verify against engine reference before deciding)
- [Domain]: [Key changes]

### MEDIUM RISK Domains (verify key APIs)
- [Domain]: [Key changes]

### LOW RISK Domains (in training data, likely reliable)
- [Domain]: [no significant post-cutoff changes]

### Systems from GDD that touch HIGH/MEDIUM risk domains:
- [GDD system name] → [domain] → [risk level]
```

使用 `AskUserQuestion`：
- 提示："一个或多个引擎领域属于高风险领域——LLM 在这些领域的知识可能不可靠。在采取行动之前，应将这些领域中的架构建议与引擎文档进行交叉核对。你希望如何继续？"
- 选项：
  - `[A] Proceed — flag HIGH RISK domains throughout the output`
  - `[B] Let me check the engine reference first — pause here`
  - `[C] Show me which domains are HIGH RISK and why`

---

## 阶段 1：系统分层映射

将 `systems-index.md` 中的每个系统映射到一个架构层。标准的游戏架构层如下：

```
┌─────────────────────────────────────────────┐
│  PRESENTATION LAYER                         │  ← UI, HUD, menus, VFX, audio
├─────────────────────────────────────────────┤
│  FEATURE LAYER                              │  ← gameplay systems, AI, quests
├─────────────────────────────────────────────┤
│  CORE LAYER                                 │  ← physics, input, combat, movement
├─────────────────────────────────────────────┤
│  FOUNDATION LAYER                           │  ← engine integration, save/load,
│                                             │    scene management, event bus
├─────────────────────────────────────────────┤
│  PLATFORM LAYER                             │  ← OS, hardware, engine API surface
└─────────────────────────────────────────────┘
```

对于每个 GDD 系统，询问：
- 它属于哪一层？
- 它的模块边界是什么？
- 哪些内容由它独占？（数据、状态、行为）

展示建议的分层分配方案，并在进入下一节之前请求批准。立即将批准后的分层映射写入骨架文件。

**引擎认知检查**：对于分配到核心层和基础层的每个系统，如果它涉及高风险或中风险引擎领域，则进行标记。以内联方式显示相关的引擎参考文档摘录。

---

## 阶段 2：模块所有权映射

对于阶段 1 中定义的每个模块，明确其所有权：

- **拥有**：该模块唯一负责的数据和状态
- **公开**：其他模块可以读取或调用的内容
- **使用**：它从其他模块读取的内容
- **使用的引擎 API**：该模块直接调用的具体引擎类/节点/信号（注明版本和风险等级）

按层以表格形式呈现，然后绘制 ASCII 依赖关系图。

**引擎感知检查**：对于列出的每个引擎 API，都要根据相关模块参考文档进行核实。如果某个 API 是知识截止日期之后发布的，请标记：

```
⚠️  [ClassName.method()] — Godot 4.6 (post-cutoff, HIGH risk)
    Verified against: docs/engine-reference/godot/modules/[domain].md
    Behaviour confirmed: [yes / NEEDS VERIFICATION]
```

在编写前，先让用户批准所有权映射。

---

## 阶段 3：数据流

定义关键游戏场景中数据如何在模块之间流动。至少涵盖：

1. **帧更新路径**：输入 → 核心系统 → 状态 → 渲染
2. **事件/信号路径**：系统如何在不紧密耦合的情况下通信
3. **保存/加载路径**：哪些状态会被序列化，以及哪个模块负责序列化
4. **初始化顺序**：哪些模块必须先于其他模块启动

在有帮助的地方使用 ASCII 时序图。对于每个数据流：
- 指明所传输数据的名称
- 确定生产者和消费者
- 说明它是同步调用、信号/事件还是共享状态
- 标记任何跨越线程边界的数据流

在编写前，针对每个场景获取用户批准。

---

## 阶段 4：API 边界

定义模块之间的公共契约。对于每个边界：

- 模块向系统其余部分公开什么接口？
- 入口点（函数/信号/属性）是什么？
- 调用方必须遵守哪些不变量？
- 模块必须向调用方提供哪些保证？

使用伪代码或项目的实际语言（根据技术偏好）编写。
这些内容将成为程序员实现时所依据的契约。

**引擎感知检查**：如果任何接口使用引擎特定类型（例如 Godot 中的
`Node`、`Resource`、`Signal`），请标记其版本，并确认该类型存在且其签名
在目标引擎版本中未发生变化。

---

## 阶段 5：ADR 审计 + 可追溯性检查

根据阶段 1-4 中构建的架构以及阶段 0b 中的技术需求基线，审查阶段 0c 中的所有现有 ADR。

### ADR 质量检查

对于每个 ADR：
- [ ] 是否包含引擎兼容性部分？
- [ ] 是否记录了引擎版本？
- [ ] 是否标记了知识截止日期之后发布的 API？
- [ ] 是否包含“已处理的 GDD 需求”部分？
- [ ] 是否与本次会话中做出的分层/所有权决策冲突？
- [ ] 对于已固定的引擎版本，它是否仍然有效？

| ADR | 引擎兼容性 | 版本 | GDD 关联 | 冲突 | 有效 |
|-----|--------------|---------|-------------|-----------|-------|
| ADR-0001：[标题] | ✅/❌ | ✅/❌ | ✅/❌ | 无/[冲突] | ✅/⚠️ |

### 可追溯性覆盖检查

将技术需求基线中的每项需求映射到现有 ADR。对于每项需求，检查是否有任何 ADR 的“已处理的 GDD 需求”部分或决策文本涵盖了该需求：

| 需求 ID | 需求 | ADR 覆盖 | 状态 |
|--------|-------------|--------------|--------|
| TR-combat-001 | 每帧进行命中框检测 | ADR-0003 | ✅ |
| TR-combat-002 | 连击状态机 | — | ❌ 缺口 |

数量：已覆盖 X 项，存在 Y 项缺口。每个缺口都将成为一项**必需的新 ADR**。

### 必需的新 ADR

列出本次架构会话（阶段 1-4）中做出的、尚无对应 ADR 的所有决策，以及所有未覆盖的技术需求。按层级分组——基础层优先：

**基础层（必须在开始任何编码之前创建）：**
- `/architecture-decision [title]` → 涵盖：TR-[id]、TR-[id]

**核心层：**
- `/architecture-decision [title]` → 涵盖：TR-[id]

---

## 阶段 6：缺失 ADR 列表

根据完整架构，生成一份应当存在但尚不存在的 ADR 完整列表。按优先级分组：

**必须在编码开始之前具备（基础层和核心层决策）：**
- [例如：“场景管理和场景加载策略”]
- [例如：“事件总线与直接信号架构的选择”]

**应当在构建相关系统之前具备：**
- [例如：“物品栏序列化格式”]

**可以推迟到实现阶段：**
- [例如：“水体使用的具体着色器技术”]

---

## 阶段 7：编写主架构文档

所有章节获得批准后，将完整文档写入
`docs/architecture/architecture.md`。

用一段话概述文档将包含的内容（层级、模块、数据流、ADR 缺口）。然后使用 `AskUserQuestion`：
- “所有章节均已批准。可以编写主架构文档了吗？”
  - [A] 是——立即写入 `docs/architecture/architecture.md`
  - [B] 先在对话中向我展示完整草稿，然后再次询问
  - [C] 暂时不要——我还有更多变更需要讨论

文档结构：

```markdown
# [Game Name] — Master Architecture

## Document Status
- Version: [N]
- Last Updated: [date]
- Engine: [name + version]
- GDDs Covered: [list]
- ADRs Referenced: [list]

## Engine Knowledge Gap Summary
[Condensed from Phase 0d inventory — HIGH/MEDIUM risk domains and their implications]

## System Layer Map
[From Phase 1]

## Module Ownership
[From Phase 2]

## Data Flow
[From Phase 3]

## API Boundaries
[From Phase 4]

## ADR Audit
[From Phase 5]

## Required ADRs
[From Phase 6]

## Architecture Principles
[3-5 key principles that govern all technical decisions for this project,
derived from the game concept, GDDs, and technical preferences]

## Open Questions
[Decisions deferred — must be resolved before the relevant layer is built]
```

---

## 阶段 7b：技术总监签核 + 主程可行性评审

编写主架构文档后，在移交之前执行明确的签核。

**步骤 1——技术总监自审**（此技能以 technical-director 身份运行）：

应用关卡 **TD-ARCHITECTURE**（`.claude/docs/director-gates.md`）进行自审。对照该关卡定义检查已完成文档是否符合全部四项标准。

**评审模式检查**——在生成 LP-FEASIBILITY 之前应用：
- `solo` → 跳过。注明：“已跳过 LP-FEASIBILITY——Solo 模式。”继续进行阶段 8 移交。
- `lean` → 跳过（不是 PHASE-GATE）。注明：“已跳过 LP-FEASIBILITY——Lean 模式。”继续进行阶段 8 移交。
- `full` → 正常生成。

**步骤 2 — 通过 Task 使用门禁 LP-FEASIBILITY（`.claude/docs/director-gates.md`）生成 `lead-programmer`：**

传入：架构文档路径、技术需求基线摘要、ADR 列表。

**步骤 3 — 向用户展示两份评估：**

并列展示技术总监评估和首席程序员结论。

使用 `AskUserQuestion` — “技术总监和首席程序员已审查该架构。你希望如何继续？”
选项：`Accept — proceed to handoff` / `Revise flagged items first` / `Discuss specific concerns`

**步骤 4 — 在架构文档中记录签署结果：**

更新“文档状态”部分：
```
- Technical Director Sign-Off: [date] — APPROVED / APPROVED WITH CONDITIONS
- Lead Programmer Feasibility: FEASIBLE / CONCERNS ACCEPTED / REVISED
```

以内联方式展示拟议的“文档状态”区块，然后使用 `AskUserQuestion`：
- “我可以使用签署结果更新‘文档状态’部分吗？”
  - [A] 是 — 应用到 `docs/architecture/architecture.md`
  - [B] 暂不 — 我想先重新审视这些问题

---

## 阶段 8：交接

**步骤 1 — 更新会话状态**：将摘要写入 `production/session-state/active.md`，涵盖：已编写的产物、TD/LP 签署结论、任何阻碍项、仍需完成的 ADR，以及下一步。

**步骤 2 — 输出交接内容**，严格使用以下模板（不得使用自由形式的散文，不得改写章节标题）：

---

## 架构已完成

`docs/architecture/architecture.md` v1.0 — [TD 结论：已批准 / 有条件批准 / 存在问题]。[用一句话说明该架构涵盖的内容。]

---

## 接下来执行这些 ADR

**1. `/architecture-decision "[Title]"` → ADR-[XXXX]**
[一句话：它定义了什么以及解除了什么阻碍。]

**2. `/architecture-decision "[Title]"` → ADR-[XXXX]**
[一句话。]

**3. `/architecture-decision "[Title]"` → ADR-[XXXX]**
[一句话。]

按优先级顺序列出阶段 6 中优先级最高的 3 项。如果剩余不足 3 项，则仅列出尚未完成的项。

---

## 门禁检查就绪情况

> **执行 `/gate-check [stage]` 前的要求：**
> - [ ] 接受 ADR：[列出必须设为 Accepted 的 Proposed ADR ID]
> - [ ] 编写 ADR：[列出仍须编写的 ADR ID]
> - [ ] 运行 `/test-setup` — 搭建 `tests/unit/`、`tests/integration/`、CI 工作流和一个示例测试文件
> - [ ] 运行 `/ux-design` — 创建 `design/ux/interaction-patterns.md` 和 `design/accessibility-requirements.md`
>
> 选中所有复选框后，运行 `/gate-check [stage]`。

如果没有任何阻碍项，则改为写入：
> 没有阻碍项 — 立即运行 `/gate-check [stage]`。

---

## 需要关注的开放问题

| ID | 摘要 | 优先级 | 解决路径 |
|----|---------|----------|-----------------|
| QQ-XX | [简短描述] | 高 / 中 / 低 | [解决该问题的 ADR 或系统] |

如果没有开放的 QQ，则完全省略此部分。

---

（交接结束。结束分隔线后不要添加附加评论。）

---

## 协作协议

此技能在每个阶段都遵循协作式设计原则：

1. **静默加载上下文** — 不要叙述文件读取过程
2. **呈现发现** — 展示知识缺口清单和分层建议
3. **决策前询问** — 针对每项架构选择提供选项
4. **批准前起草** — 在请求写入批准之前，先以内联方式展示内容。
   切勿请求批准用户尚未看到的章节。
5. **使用 `AskUserQuestion` 请求写入批准** — 仅使用纯文本询问“可以吗？”并不
   足够。使用结构化工具，并提供带标签的选项 [A]/[B]/[C]（立即写入 /
   先展示完整草稿 / 暂不写入）。对于涉及多个文件的变更集，列出每个文件
   及其变更内容，然后统一询问一次 — 不要针对每个文件分别使用纯文本询问。
6. **增量写入** — 立即写入每个已获批准的章节；不要
   累积所有内容并在最后统一写入。这样可避免会话崩溃造成损失。

切勿在未征求用户意见的情况下做出具有约束力的架构决策。如果用户
不确定，请提供 2-4 个选项及其优缺点，然后再请用户决定。

---

## 建议的后续步骤

- 针对阶段 6 中列出的每个必需 ADR 运行 `/architecture-decision [title]` — 优先处理基础层 ADR
- 运行 `/architecture-review` — 根据刚刚编写的 ADR 初始化需求可追溯性矩阵和 TR 注册表。在进入预生产门禁前必须完成。
- 运行 `/test-setup`，以搭建 `tests/unit/`、`tests/integration/`、CI 工作流和示例测试（门禁检查的必需项）
- 运行 `/ux-design`，以初始化 `design/ux/interaction-patterns.md` 和 `design/accessibility-requirements.md`（门禁检查的必需项）
- 编写完必需的 ADR 后，运行 `/create-control-manifest` 以生成分层规则清单
- 当所有必需的 ADR、`/test-setup` 和 `/ux-design` 均已完成后，运行 `/gate-check pre-production`