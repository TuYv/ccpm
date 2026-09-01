---
name: architecture-review
description: "Validates completeness and consistency of the project architecture against all GDDs. Builds a traceability matrix mapping every GDD technical requirement to ADRs, identifies coverage gaps, detects cross-ADR conflicts, verifies engine compatibility consistency across all decisions, and produces a PASS/CONCERNS/FAIL verdict. The architecture equivalent of /design-review."
argument-hint: "[focus: full | coverage | consistency | engine | single-gdd path/to/gdd.md]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Task, AskUserQuestion
agent: technical-director
model: opus
---
# Architecture Review

架构评审会验证完整的一组架构决策是否覆盖所有游戏设计需求、内部一致，并正确针对项目锁定的引擎版本。它是 Technical Setup 与 Pre-Production 之间的质量关卡。

**参数模式：**
- **无参数 / `full`**：完整评审——所有阶段
- **`coverage`**：仅追踪性——哪些 GDD 需求没有 ADR
- **`consistency`**：仅跨 ADR 冲突检测
- **`engine`**：仅引擎兼容性审计
- **`single-gdd [path]`**：评审单个特定 GDD 的架构覆盖情况
- **`rtm`**：Requirements Traceability Matrix——扩展标准矩阵，使其包含故事文件路径和测试文件路径；输出包含完整 GDD requirement → ADR → Story → Test 链条的 `docs/architecture/requirements-traceability.md`。在生产阶段存在故事和测试时使用。

---

## Phase 1: Load Everything

### Phase 1a — L0: Summary Scan（快速，低 token）

在阅读任何完整文档之前，使用 Grep 从所有 GDD 和 ADR 中提取 `## Summary` 小节：

```
Grep pattern="## Summary" glob="design/gdd/*.md" output_mode="content" -A 4
Grep pattern="## Summary" glob="docs/architecture/adr-*.md" output_mode="content" -A 3
```

对于 `single-gdd [path]` 模式：使用目标 GDD 的摘要识别哪些 ADR 引用了同一系统（用系统名 Grep ADR），然后只完整阅读这些 ADR。完全跳过完整阅读无关 GDD。

对于 `engine` 模式：只完整阅读 ADR——引擎检查不需要 GDD。

对于 `coverage` 或 `full` 模式：继续完整阅读以下所有内容。

### Phase 1b — L1/L2: Full Document Load

阅读适合该模式的所有输入：

### Design Documents
- `design/gdd/` 中所有在范围内的 GDD——完整阅读每个文件
- `design/gdd/systems-index.md`——权威的系统列表

### Architecture Documents
- `docs/architecture/` 中所有在范围内的 ADR——完整阅读每个文件
- `docs/architecture/architecture.md`（如果存在）

### Engine Reference
- `docs/engine-reference/[engine]/VERSION.md`
- `docs/engine-reference/[engine]/breaking-changes.md`
- `docs/engine-reference/[engine]/deprecated-apis.md`
- `docs/engine-reference/[engine]/modules/` 中的所有文件

### Project Standards
- `.claude/docs/technical-preferences.md`

报告数量："Loaded [N] GDDs, [M] ADRs, engine: [name + version]."

**同时阅读 `docs/consistency-failures.md`**（如果存在）。提取 Domain 与受评审系统匹配的条目（Architecture、Engine，或任何被覆盖的 GDD 领域）。在 Phase 4 冲突检测输出的顶部，将反复出现的模式呈现为“已知易冲突区域”说明。

---

## Phase 2: Extract Technical Requirements from Every GDD

### Pre-load the TR Registry

在提取任何需求之前，如果 `docs/architecture/tr-registry.yaml` 存在，先阅读它。按 `id` 以及规范化后的 `requirement` 文本（小写、去除首尾空格）为现有条目建立索引。这样可以防止 TR-ID 在多次评审运行之间被重新编号。

对于你提取的每个需求，匹配规则是：
1. 与同一系统的现有注册表条目**精确/近似匹配** → 原样复用该条目的 TR-ID。仅当 GDD 措辞发生变化（意图相同、表述更清晰）时才更新注册表中的 `requirement` 文本——添加 `revised: [date]` 字段。
2. **无匹配** → 分配新 ID：该系统的下一个可用 `TR-[system]-NNN`，从现有最大序列号 + 1 开始。
3. **模糊**（部分匹配，意图不清晰）→ 询问用户：
   > "Does '[new requirement text]' refer to the same requirement as
   > `TR-[system]-NNN: [existing text]'`, or is it a new requirement?"
   用户回答："Same requirement"（复用 ID）或 "New requirement"（新 ID）。

对于注册表中任何 `status: deprecated` 的需求——跳过。它已被有意从 GDD 中移除。

对于每个 GDD，阅读并提取所有**技术需求**——架构必须提供才能让系统正常运行的内容。技术需求是任何暗示特定架构决策的陈述。

需要提取的类别：

| 类别 | 示例 |
|----------|---------|
| **数据结构** | "Each entity has health, max health, status effects" → 需要组件/数据 schema |
| **性能约束** | "Collision detection must run at 60fps with 200 entities" → 物理预算 ADR |
| **引擎能力** | "Inverse kinematics for character animation" → IK 系统 ADR |
| **跨系统通信** | "Damage system notifies UI and audio simultaneously" → 事件/信号架构 ADR |
| **状态持久化** | "Player progress persists between sessions" → 存档系统 ADR |
| **线程/时序** | "AI decisions happen off the main thread" → 并发 ADR |
| **平台需求** | "Supports keyboard, gamepad, touch" → 输入系统 ADR |

对于每个 GDD，生成一个结构化列表：

```
GDD: [filename]
System: [system name]
Technical Requirements:
  TR-[GDD]-001: [requirement text] → Domain: [Physics/Rendering/etc]
  TR-[GDD]-002: [requirement text] → Domain: [...]
```

这就是 **requirements baseline**——架构必须覆盖的完整集合。

---

## Phase 3: Build the Traceability Matrix

对于在 Phase 2 中提取的每个技术需求，搜索 ADR：

1. 阅读每个 ADR 的 "GDD Requirements Addressed" 小节
2. 检查它是否明确引用了该需求或其 GDD
3. 检查 ADR 的决策文本是否隐式覆盖了该需求
4. 标记覆盖状态：

| 状态 | 含义 |
|--------|---------|
| ✅ **Covered** | 某个 ADR 明确处理了该需求 |
| ⚠️ **Partial** | 某个 ADR 部分覆盖了该需求，或覆盖情况不明确 |
| ❌ **Gap** | 没有 ADR 处理该需求 |

构建完整矩阵：

```
## Traceability Matrix

| Requirement ID | GDD | System | Requirement | ADR Coverage | Status |
|---------------|-----|--------|-------------|--------------|--------|
| TR-combat-001 | combat.md | Combat | Hitbox detection < 1 frame | ADR-0003 | ✅ |
| TR-combat-002 | combat.md | Combat | Combo window timing | — | ❌ GAP |
| TR-inventory-001 | inventory.md | Inventory | Persistent item storage | ADR-0005 | ✅ |
```

统计总数：X covered，Y partial，Z gaps。

---

## Phase 3b: Story and Test Linkage（仅 RTM 模式）

*除非参数为 `rtm`，或为存在故事的 `full`，否则跳过此阶段。*

此阶段扩展 Phase 3 矩阵，使其包含实现每个需求的故事以及验证该需求的测试——生成完整的 Requirements Traceability Matrix（RTM）。

### Step 3b-1 — Load stories

Glob `production/epics/**/*.md`（排除 EPIC.md 索引文件）。对于每个故事文件：
- 从故事的 Context 小节提取 `TR-ID`
- 提取故事文件路径、标题、Status
- 提取 `## Test Evidence` 小节——其中声明的测试文件路径

### Step 3b-2 — Load test files

Glob `tests/unit/**/*_test.*` 和 `tests/integration/**/*_test.*`。
构建索引：system → [test file paths]。

对于来自 Step 3b-1 的每个测试文件路径，通过 Glob 确认该文件是否确实存在。如果声明路径不存在，记录 MISSING。

### Step 3b-3 — Build the extended RTM

对于 Phase 3 矩阵中的每个 TR-ID，添加：
- **Story**：引用该 TR-ID 的故事文件路径（可能有多个）
- **Test File**：故事 Test Evidence 小节中声明的测试文件路径
- **Test Status**：COVERED（测试文件存在）/ MISSING（声明了路径但未找到）/ NONE（未声明测试路径，故事类型可能是 Visual/Feel/UI）/ NO STORY（需求尚无故事——pre-production 缺口）

扩展矩阵格式：

```
## Requirements Traceability Matrix (RTM)

| TR-ID | GDD | Requirement | ADR | Story | Test File | Test Status |
|-------|-----|-------------|-----|-------|-----------|-------------|
| TR-combat-001 | combat.md | Hitbox < 1 frame | ADR-0003 | story-001-hitbox.md | tests/unit/combat/hitbox_test.gd | COVERED |
| TR-combat-002 | combat.md | Combo window | — | story-002-combo.md | — | NONE (Visual/Feel) |
| TR-inventory-001 | inventory.md | Persistent storage | ADR-0005 | — | — | NO STORY |
```

RTM 覆盖概要：
- 已覆盖：[N] — 具有 ADR + story + 通过测试的需求
- 缺失测试：[N] — 存在 story 但未找到测试文件
- 无 story：[N] — 具有 ADR 但尚无 story 的需求
- 无 ADR：[N] — 不具备架构覆盖的需求（来自第 3 阶段的缺口）
- 完整链路完成（已覆盖）：[N/total]（[%]）

---

## 第 4 阶段：跨 ADR 冲突检测

将每个 ADR 与其他所有 ADR 进行比较，以检测矛盾。冲突在以下情况存在：

- **数据所有权冲突**：两个 ADR 声明对同一数据的独占所有权
- **集成契约冲突**：ADR-A 假设系统 X 具有接口 Y，但 ADR-B 用不同接口定义系统 X
- **性能预算冲突**：ADR-A 为物理分配 N ms，ADR-B 为 AI 分配 N ms，二者合计超出总帧预算
- **依赖循环**：ADR-A 表示系统 X 在 Y 之前初始化；ADR-B 表示 Y 在 X 之前初始化
- **架构模式冲突**：ADR-A 对某个子系统使用事件驱动通信；ADR-B 对同一子系统使用直接函数调用
- **状态管理冲突**：两个 ADR 定义对同一游戏状态的权威（例如 Combat ADR 和 Character ADR 都声明拥有生命值）

对于发现的每个冲突：

```
## Conflict: [ADR-NNNN] vs [ADR-MMMM]
Type: [Data ownership / Integration / Performance / Dependency / Pattern / State]
ADR-NNNN claims: [...]
ADR-MMMM claims: [...]
Impact: [What breaks if both are implemented as written]
Resolution options:
  1. [Option A]
  2. [Option B]
```

### ADR 依赖排序

冲突检测完成后，分析所有 ADR 之间的依赖图：

1. **收集所有 `Depends On` 字段**，来源为每个 ADR 的“ADR Dependencies”部分
2. **拓扑排序**：确定正确的实现顺序 — 无依赖的 ADR 排在前面（Foundation），依赖它们的 ADR 排在后面，依此类推
3. **标记未解决的依赖**：如果 ADR-A 的“Depends On”字段引用了仍为 `Proposed` 或不存在的 ADR，则标记它：
   ```
   ⚠️  ADR-0005 depends on ADR-0002 — but ADR-0002 is still Proposed.
       ADR-0005 cannot be safely implemented until ADR-0002 is Accepted.
   ```
4. **循环检测**：如果 ADR-A 依赖 ADR-B，而 ADR-B 依赖 ADR-A（直接或间接），则将其标记为 `DEPENDENCY CYCLE`：
   ```
   🔴 DEPENDENCY CYCLE: ADR-0003 → ADR-0006 → ADR-0003
      This cycle must be broken before either can be implemented.
   ```
5. **输出推荐实现顺序**：
   ```
   ### Recommended ADR Implementation Order (topologically sorted)
   Foundation (no dependencies):
     1. ADR-0001: [title]
     2. ADR-0003: [title]
   Depends on Foundation:
     3. ADR-0002: [title] (requires ADR-0001)
     4. ADR-0005: [title] (requires ADR-0003)
   Feature layer:
     5. ADR-0004: [title] (requires ADR-0002, ADR-0005)
   ```

---

## 第 5 阶段：引擎兼容性交叉检查

在所有 ADR 中检查引擎一致性：

### 版本一致性
- 所有提及引擎版本的 ADR 是否对同一版本达成一致？
- 如果任何 ADR 是针对较旧引擎版本编写的，则将其标记为可能过时

### Post-Cutoff API 一致性
- 从所有 ADR 收集所有“Post-Cutoff APIs Used”字段
- 对每个字段，与相关模块参考文档进行核对
- 检查是否没有任何两个 ADR 对同一 post-cutoff API 作出相互矛盾的假设

### 已弃用 API 检查
- 在所有 ADR 中 grep `deprecated-apis.md` 中列出的 API 名称
- 标记任何引用已弃用 API 的 ADR

### 缺失引擎兼容性部分
- 列出所有完全缺失 Engine Compatibility 部分的 ADR
- 这些是盲区 — 它们的引擎假设未知

输出格式：
```
### Engine Audit Results
Engine: [name + version]
ADRs with Engine Compatibility section: X / Y total

Deprecated API References:
  - ADR-0002: uses [deprecated API] — deprecated since [version]

Stale Version References:
  - ADR-0001: written for [older version] — current project version is [version]

Post-Cutoff API Conflicts:
  - ADR-0004 and ADR-0007 both use [API] with incompatible assumptions
```

---

### 引擎专家咨询

完成上述引擎审计后，通过 Task 生成**主引擎专家**以获取领域专家的第二意见：
- 读取 `.claude/docs/technical-preferences.md` 的 `Engine Specialists` 部分，以获取主专家
- 如果未配置引擎，则跳过此咨询
- 生成 `subagent_type: [primary specialist]`，并提供：所有包含引擎特定决策或“Post-Cutoff APIs Used”字段的 ADR、引擎参考文档以及第 5 阶段审计发现。请他们：
  1. 确认或质疑每个审计发现 — 专家可能知道参考文档未收录的引擎细节
  2. 识别审计可能遗漏的 ADR 中的引擎特定反模式（例如，使用错误的 Godot 节点类型、Unity 组件耦合、Unreal subsystem 误用）
  3. 标记那些对引擎行为的假设与实际固定版本不同的 ADR

将额外发现纳入第 5 阶段输出中的 `### Engine Specialist Findings` 下。这些发现会输入最终判定 — 专家识别的问题与审计识别的问题具有同等权重。

---

## 第 5b 阶段：设计修订标记（架构 → GDD 反馈）

对于第 5 阶段的每个**高风险引擎发现**，检查是否有任何 GDD 作出与已验证引擎现实相矛盾的假设。

需要检查的具体情况：

1. **Post-cutoff API 行为与训练数据假设不同**：如果某个 ADR 记录了与默认 LLM 假设不同的已验证 API 行为，则检查所有引用相关系统的 GDD。寻找围绕旧的（假设的）行为编写的设计规则。

2. **ADR 中的已知引擎限制**：如果某个 ADR 记录了已知引擎限制（例如 “Jolt ignores HingeJoint3D damp”、“D3D12 is now the default backend”），则检查围绕受影响特性设计机制的 GDD。

3. **已弃用 API 冲突**：如果第 5 阶段标记了某个 ADR 中使用的已弃用 API，则检查是否有任何 GDD 包含假设该已弃用 API 行为的机制。

对于发现的每个冲突，将其记录到 GDD Revision Flags 表中：

```
### GDD Revision Flags (Architecture → Design Feedback)
These GDD assumptions conflict with verified engine behaviour or accepted ADRs.
The GDD should be revised before its system enters implementation.

| GDD | Assumption | Reality (from ADR/engine-reference) | Action |
|-----|-----------|--------------------------------------|--------|
| combat.md | "Use HingeJoint3D damp for weapon recoil" | Jolt ignores damp — ADR-0003 | Revise GDD |
```

如果未发现修订标记，则写入：“No GDD revision flags — all GDD assumptions
are consistent with verified engine behaviour.”

在询问之前，内联展示拟议更改 — 为每个被标记的 GDD 并排显示当前 systems-index 行和拟议更新行，让用户准确看到将要更改的内容。

然后使用 `AskUserQuestion`：
- “我发现 [N] 个 GDD 修订标记。可以更新系统索引吗？”
  - [A] 是 — 现在将全部 [N] 项更新应用到系统索引
  - [B] 先展示完整 diff，然后再次询问
  - [C] 否 — 暂时保持系统索引不变

如果为 [A]：应用更新。Status 字段必须精确为 `Needs Revision` — 不得带括号说明
（其他技能会精确匹配该字符串，括号说明会导致匹配失败）。
如果为 [B]：展示完整的拟议 systems-index 部分，然后使用 `AskUserQuestion` 再次询问。

---

## 第 6 阶段：架构文档覆盖

如果 `docs/architecture/architecture.md` 存在，则根据 GDD 验证它：

- `systems-index.md` 中的每个系统是否都出现在架构层中？
- 数据流部分是否覆盖 GDD 中定义的所有跨系统通信？
- API 边界是否支持 GDD 中的所有集成需求？
- 架构文档中是否存在没有对应 GDD 的系统（孤立架构）？

---

---

## 阶段 7：输出评审报告

```
## Architecture Review Report
Date: [date]
Engine: [name + version]
GDDs Reviewed: [N]
ADRs Reviewed: [M]

---

### Traceability Summary
Total requirements: [N]
✅ Covered: [X]
⚠️ Partial: [Y]
❌ Gaps: [Z]

### Coverage Gaps (no ADR exists)
For each gap:
  ❌ TR-[id]: [GDD] → [system] → [requirement]
     Suggested ADR: "/architecture-decision [suggested title]"
     Domain: [Physics/Rendering/etc]
     Engine Risk: [LOW/MEDIUM/HIGH]

### Cross-ADR Conflicts
[List all conflicts from Phase 4]

### ADR Dependency Order
[Topologically sorted implementation order from Phase 4 — dependency ordering section]
[Unresolved dependencies and cycles if any]

### GDD Revision Flags
[GDD assumptions that conflict with verified engine behaviour — from Phase 5b]
[Or: "None — all GDD assumptions consistent with verified engine behaviour"]

### Engine Compatibility Issues
[List all engine issues from Phase 5]

### Architecture Document Coverage
[List missing systems and orphaned architecture from Phase 6]

---

### Verdict: [PASS / CONCERNS / FAIL]

PASS: All requirements covered, no conflicts, engine consistent
CONCERNS: Some gaps or partial coverage, but no blocking conflicts
FAIL: Critical gaps (Foundation/Core layer requirements uncovered),
      or blocking cross-ADR conflicts detected

### Blocking Issues (must resolve before PASS)
[List items that must be resolved — FAIL verdict only]

### Required ADRs
[Prioritised list of ADRs to create, most foundational first]
```

---

## 阶段 8：写入并更新可追溯性索引

使用 `AskUserQuestion` 请求写入批准：
- “评审完成。你想要写入什么？”
  - [A] 写入全部三个文件（评审报告 + 可追溯性索引 + TR 注册表）
  - [B] 仅写入评审报告 — `docs/architecture/architecture-review-[date].md`
  - [C] 暂不写入任何内容 — 我需要先查看这些发现

### RTM 输出（仅 rtm 模式）

对于 `rtm` 模式，使用 `AskUserQuestion`：
- “我可以写入完整的需求追溯矩阵吗？”
  - [A] 可以 — 写入 `docs/architecture/requirements-traceability.md`
  - [B] 暂不 — 先向我展示完整 RTM 数据，然后再询问一次

RTM 文件格式：

```markdown
# Requirements Traceability Matrix (RTM)

> Last Updated: [date]
> Mode: /architecture-review rtm
> Coverage: [N]% full chain complete (GDD → ADR → Story → Test)

## How to read this matrix

| Column | Meaning |
|--------|---------|
| TR-ID | Stable requirement ID from tr-registry.yaml |
| GDD | Source design document |
| ADR | Architectural decision governing implementation |
| Story | Story file that implements this requirement |
| Test File | Automated test file path |
| Test Status | COVERED / MISSING / NONE / NO STORY |

## Full Traceability Matrix

| TR-ID | GDD | Requirement | ADR | Story | Test File | Status |
|-------|-----|-------------|-----|-------|-----------|--------|
[Full matrix rows from Phase 3b]

## Coverage Summary

| Status | Count | % |
|--------|-------|---|
| COVERED — full chain complete | [N] | [%] |
| MISSING test — story exists, no test | [N] | [%] |
| NO STORY — ADR exists, not yet implemented | [N] | [%] |
| NO ADR — architectural gap | [N] | [%] |
| **Total requirements** | **[N]** | **100%** |

## Uncovered Requirements (Priority Fix List)

Requirements where the full chain is broken, prioritised by layer:

### Foundation layer gaps
[list with suggested action per gap]

### Core layer gaps
[list]

### Feature / Presentation layer gaps
[list — lower priority]

## History

| Date | Full Chain % | Notes |
|------|-------------|-------|
| [date] | [%] | Initial RTM |
```

### TR 注册表更新

另外询问：“我可以将本次评审中新的需求 ID 更新到 `docs/architecture/tr-registry.yaml` 吗？”

如果可以：
- **追加** 本次评审之前不在注册表中的任何新 TR-ID
- **更新** 任何 GDD 措辞发生变化条目的 `requirement` 文本和 `revised` 日期（ID 保持不变）
- **标记** 任何 GDD 需求已不存在的注册表条目为 `status: deprecated`（标记为弃用前需与用户确认）
- **绝不** 重新编号或删除现有条目
- 更新顶部的 `last_updated` 和 `version` 字段

这确保所有未来的 story 文件都能引用在后续每次架构评审中都持续存在的稳定 TR-ID。

### Reflexion 日志更新

写入评审报告后，将阶段 4 中发现的所有 🔴 CONFLICT 条目追加到
`docs/consistency-failures.md`（如果该文件存在）：

```markdown
### [YYYY-MM-DD] — /architecture-review — 🔴 CONFLICT
**Domain**: Architecture / [specific domain e.g. State Ownership, Performance]
**Documents involved**: [ADR-NNNN] vs [ADR-MMMM]
**What happened**: [specific conflict — what each ADR claims]
**Resolution**: [how it was or should be resolved]
**Pattern**: [generalised lesson for future ADR authors in this domain]
```

仅追加 CONFLICT 条目 — 不要记录 GAP 条目（在架构完成之前，缺少 ADR 是预期情况）。如果文件缺失，不要创建它 — 仅在文件已存在时追加。

### 会话状态更新

写入所有已批准文件后，静默追加到
`production/session-state/active.md`：

    ## Session Extract — /architecture-review [date]
    - Verdict: [PASS / CONCERNS / FAIL]
    - Requirements: [N] total — [X] covered, [Y] partial, [Z] gaps
    - New TR-IDs registered: [N, or "None"]
    - GDD revision flags: [comma-separated GDD names, or "None"]
    - Top ADR gaps: [top 3 gap titles from the report, or "None"]
    - Report: docs/architecture/architecture-review-[date].md

如果 `active.md` 不存在，则以该块作为初始内容创建它。
在对话中确认：“会话状态已更新。”

可追溯性索引格式：

```markdown
# Architecture Traceability Index
Last Updated: [date]
Engine: [name + version]

## Coverage Summary
- Total requirements: [N]
- Covered: [X] ([%])
- Partial: [Y]
- Gaps: [Z]

## Full Matrix
[Complete traceability matrix from Phase 3]

## Known Gaps
[All ❌ items with suggested ADRs]

## Superseded Requirements
[Requirements whose GDD was changed after the ADR was written]
```

---

## 阶段 9：交接

完成评审并写入已批准文件后，提供：

1. **即时行动**：列出需要创建的前 3 个 ADR（优先处理影响最大的缺口，Foundation 层先于 Feature 层）
2. **预门槛检查清单**：使用 Glob 检查以下内容是否存在，并逐项标记 ✅ 或 ❌：
   - `tests/unit/` 和 `tests/integration/` 目录 — 如果为 ❌：运行 `/test-setup`
   - `.github/workflows/tests.yml` — 如果为 ❌：运行 `/test-setup`
   - `design/accessibility-requirements.md` — 如果为 ❌：运行 `/ux-design`
   - `design/ux/interaction-patterns.md` — 如果为 ❌：运行 `/ux-design`
   将 ❌ 项作为门槛检查前的必需步骤展示。如果任何项为 ❌，不要将 `/gate-check` 作为选项提供 — 而是提供应运行的缺失技能。
3. **重新运行触发条件**：“每写完一个新 ADR 后，重新运行 `/architecture-review`，以验证覆盖率是否提升”

然后使用根据预门槛检查清单状态定制的 `AskUserQuestion` 收尾：
- 如果仍存在 ADR 缺口或任何预门槛项为 ❌：
  - “架构评审完成。你接下来想做什么？”
    - [A] 写入一个缺失的 ADR — 打开一个全新会话并运行 `/architecture-decision [system]`
    - [B] 运行 `/test-setup` — 门槛检查前必需（仅在测试基础设施为 ❌ 时显示）
    - [C] 运行 `/ux-design` — 门槛检查前必需（仅在 UX/无障碍文件为 ❌ 时显示）
    - [D] 在此停止本次会话
- 如果所有预门槛检查清单项均为 ✅ 且没有阻塞性 ADR 缺口：
  - “架构评审完成。所有预门槛项均已确认。你接下来想做什么？”
    - [A] 运行 `/gate-check pre-production`
    - [B] 写入一个缺失的 ADR — 打开一个全新会话并运行 `/architecture-decision [system]`
    - [C] 在此停止本次会话

---

## 错误恢复协议

如果任何生成的代理返回 BLOCKED、错误或未能完成：

1. **立即呈现**：在继续之前报告 “[AgentName]: BLOCKED — [reason]”
2. **评估依赖**：如果被阻塞代理的输出是后续阶段所需的，在没有用户输入的情况下不要越过该阶段继续
3. **通过 AskUserQuestion 提供选项**，包含三个选择：
   - 跳过该代理并在最终报告中记录缺口
   - 以更窄的范围重试（更少的 GDD、聚焦单个系统）
   - 在此停止并先解决阻塞项
4. **始终生成部分报告** — 输出所有已完成的内容，避免工作成果丢失

## 协作协议

1. **静默阅读** — 不要逐个叙述读取的每个文件
2. **展示矩阵** — 在请求任何内容之前，先展示完整的可追溯性矩阵；让用户看到当前状态
3. **不要猜测** — 如果需求存在歧义，请询问：“[X] 是技术要求还是设计偏好？”
4. **批准前先起草** — 始终在请求批准之前，在对话中内联展示将要写入的内容（报告、更新的 ADR 章节、systems-index 行）。绝不要请求写入用户尚未看到的内容。
5. **写入批准使用 `AskUserQuestion`** — 纯文本“可以吗？”是不够的。使用带有 [A]/[B]/[C] 标记选项的结构化工具，让用户可以在“立即写入”、“先展示完整草案”和“暂不写入”之间选择。多文件变更集必须列出每个文件及其变更内容，然后使用分组选项一次性询问 — 而不是每个文件分别进行一次纯文本提问。
6. **非阻塞** — 结论仅供参考；用户可以决定是否在出现 CONCERNS 甚至 FAIL 结果的情况下继续
