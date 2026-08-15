---
name: architecture-review
description: "Validates completeness and consistency of the project architecture against all GDDs. Builds a traceability matrix mapping every GDD technical requirement to ADRs, identifies coverage gaps, detects cross-ADR conflicts, verifies engine compatibility consistency across all decisions, and produces a PASS/CONCERNS/FAIL verdict. The architecture equivalent of /design-review."
argument-hint: "[focus: full | coverage | consistency | engine | single-gdd path/to/gdd.md]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Task, AskUserQuestion
agent: technical-director
model: opus
---
# 架构审查

架构审查用于验证完整的架构决策体系是否涵盖所有游戏设计需求、内部是否一致，以及是否正确适配项目锁定的引擎版本。它是技术设置与预制作之间的质量门禁。

**参数模式：**
- **无参数 / `full`**：完整审查——所有阶段
- **`coverage`**：仅检查可追溯性——哪些 GDD 需求没有对应的 ADR
- **`consistency`**：仅检测 ADR 之间的冲突
- **`engine`**：仅进行引擎兼容性审计
- **`single-gdd [path]`**：审查某个特定 GDD 的架构覆盖情况
- **`rtm`**：需求可追溯性矩阵——扩展标准矩阵，以包含故事文件路径和测试文件路径；输出包含完整 GDD 需求 → ADR → 故事 → 测试链路的 `docs/architecture/requirements-traceability.md`。在故事和测试均已存在的制作阶段使用。

---

## 阶段 1：加载所有内容

### 阶段 1a — L0：摘要扫描（快速、低 token 消耗）

在读取任何完整文档之前，使用 Grep 从所有 GDD 和 ADR 中提取 `## Summary` 章节：

```
Grep pattern="## Summary" glob="design/gdd/*.md" output_mode="content" -A 4
Grep pattern="## Summary" glob="docs/architecture/adr-*.md" output_mode="content" -A 3
```

对于 `single-gdd [path]` 模式：使用目标 GDD 的摘要识别引用同一系统的 ADR（在 ADR 中 Grep 系统名称），然后仅完整读取这些 ADR。完全跳过对无关 GDD 的完整读取。

对于 `engine` 模式：仅完整读取 ADR——引擎检查不需要 GDD。

对于 `coverage` 或 `full` 模式：继续完整读取下方所有内容。

### 阶段 1b — L1/L2：加载完整文档

读取与当前模式相符的所有输入：

### 设计文档
- `design/gdd/` 中所有审查范围内的 GDD——完整读取每个文件
- `design/gdd/systems-index.md`——权威的系统列表

### 架构文档
- `docs/architecture/` 中所有审查范围内的 ADR——完整读取每个文件
- `docs/architecture/architecture.md`（如果存在）

### 引擎参考资料
- `docs/engine-reference/[engine]/VERSION.md`
- `docs/engine-reference/[engine]/breaking-changes.md`
- `docs/engine-reference/[engine]/deprecated-apis.md`
- `docs/engine-reference/[engine]/modules/` 中的所有文件

### 项目标准
- `.claude/docs/technical-preferences.md`

报告数量：“已加载 [N] 个 GDD、[M] 个 ADR，引擎：[名称 + 版本]。”

如果 `docs/consistency-failures.md` 存在，**还应读取该文件**。提取 Domain 与正在审查的系统（Architecture、Engine 或所覆盖的任何 GDD 领域）匹配的条目。将反复出现的模式作为“已知的易冲突区域”说明，置于阶段 4 冲突检测输出的顶部。

---

## 阶段 2：从每个 GDD 中提取技术需求

### 预加载 TR 注册表

在提取任何需求之前，读取 `docs/architecture/tr-registry.yaml`（如果存在）。分别按 `id` 和规范化后的 `requirement` 文本（转换为小写并去除首尾空白）为现有条目建立索引。这可以防止在多次审查运行之间重新编号 ID。

对于提取出的每条需求，匹配规则如下：
1. 与同一系统的现有注册表条目**完全匹配/近似匹配** →
   原样复用该条目的 TR-ID。仅当 GDD 的措辞发生变化（意图相同，但表述更清晰）时，
   才更新注册表中的 `requirement` 文本，并添加 `revised: [date]` 字段。
2. **无匹配项** → 分配一个新 ID：使用该系统下一个可用的 `TR-[system]-NNN`，
   从现有最大序号加 1 开始。
3. **存在歧义**（部分匹配、意图不明确）→ 询问用户：
   > “'[new requirement text]' 与
   > `TR-[system]-NNN: [existing text]` 是同一条需求，还是一条新需求？”
   用户回答：“同一条需求”（复用 ID）或“新需求”（分配新 ID）。

对于注册表中任何带有 `status: deprecated` 的需求，请跳过。
它是有意从 GDD 中移除的。

对于每个 GDD，阅读其内容并提取所有**技术需求**——即为了使系统正常工作，
架构必须提供的内容。技术需求是指任何隐含了特定架构决策的陈述。

要提取的类别：

| 类别 | 示例 |
|----------|---------|
| **数据结构** | “每个实体都有生命值、最大生命值和状态效果” → 需要组件/数据模式 |
| **性能约束** | “碰撞检测必须在存在 200 个实体时以 60fps 运行” → 物理预算 ADR |
| **引擎能力** | “用于角色动画的逆向运动学” → IK 系统 ADR |
| **跨系统通信** | “伤害系统同时通知 UI 和音频系统” → 事件/信号架构 ADR |
| **状态持久化** | “玩家进度在不同会话之间持久保留” → 保存系统 ADR |
| **线程/时序** | “AI 决策在主线程之外执行” → 并发 ADR |
| **平台要求** | “支持键盘、游戏手柄和触控” → 输入系统 ADR |

对于每个 GDD，生成一个结构化列表：

```
GDD: [filename]
System: [system name]
Technical Requirements:
  TR-[GDD]-001: [requirement text] → Domain: [Physics/Rendering/etc]
  TR-[GDD]-002: [requirement text] → Domain: [...]
```

这将构成**需求基线**——架构必须覆盖的全部内容集合。

---

## 阶段 3：构建可追溯性矩阵

对于阶段 2 中提取的每条技术需求，搜索 ADR：

1. 阅读每个 ADR 的“GDD Requirements Addressed”部分
2. 检查它是否明确引用了该需求或其 GDD
3. 检查 ADR 的决策文本是否隐式覆盖了该需求
4. 标记覆盖状态：

| 状态 | 含义 |
|--------|---------|
| ✅ **已覆盖** | 某个 ADR 明确处理了该需求 |
| ⚠️ **部分覆盖** | 某个 ADR 部分覆盖了该需求，或覆盖情况存在歧义 |
| ❌ **缺口** | 没有 ADR 处理该需求 |

构建完整矩阵：

```
## Traceability Matrix

| Requirement ID | GDD | System | Requirement | ADR Coverage | Status |
|---------------|-----|--------|-------------|--------------|--------|
| TR-combat-001 | combat.md | Combat | Hitbox detection < 1 frame | ADR-0003 | ✅ |
| TR-combat-002 | combat.md | Combat | Combo window timing | — | ❌ GAP |
| TR-inventory-001 | inventory.md | Inventory | Persistent item storage | ADR-0005 | ✅ |
```

统计总数：X 个已覆盖，Y 个部分覆盖，Z 个缺口。

---

## 阶段 3b：故事与测试关联（仅限 RTM 模式）

*除非参数为 `rtm`，或参数为 `full` 且存在故事，否则跳过此阶段。*

此阶段扩展阶段 3 的矩阵，纳入实现每项需求的故事以及验证该需求的测试，从而生成完整的需求可追溯性矩阵（RTM）。

### 步骤 3b-1 — 加载故事

使用 Glob 匹配 `production/epics/**/*.md`（排除 EPIC.md 索引文件）。对于每个故事文件：
- 从故事的 Context 部分提取 `TR-ID`
- 提取故事文件路径、标题和 Status
- 提取 `## Test Evidence` 部分中声明的测试文件路径

### 步骤 3b-2 — 加载测试文件

使用 Glob 匹配 `tests/unit/**/*_test.*` 和 `tests/integration/**/*_test.*`。
构建索引：系统 → [测试文件路径]。

对于步骤 3b-1 中的每个测试文件路径，通过 Glob 确认文件是否实际存在。如果声明的路径不存在，则标记为 MISSING。

### 步骤 3b-3 — 构建扩展 RTM

对于阶段 3 矩阵中的每个 TR-ID，添加：
- **Story**：引用此 TR-ID 的故事文件路径（可能有多个）
- **Test File**：故事的 Test Evidence 部分中声明的测试文件路径
- **Test Status**：COVERED（测试文件存在）/ MISSING（已声明路径但未找到）/ NONE（未声明测试路径，故事类型可能为 Visual/Feel/UI）/ NO STORY（需求尚无故事——前期制作缺口）

扩展矩阵格式：

```
## Requirements Traceability Matrix (RTM)

| TR-ID | GDD | Requirement | ADR | Story | Test File | Test Status |
|-------|-----|-------------|-----|-------|-----------|-------------|
| TR-combat-001 | combat.md | Hitbox < 1 frame | ADR-0003 | story-001-hitbox.md | tests/unit/combat/hitbox_test.gd | COVERED |
| TR-combat-002 | combat.md | Combo window | — | story-002-combo.md | — | NONE (Visual/Feel) |
| TR-inventory-001 | inventory.md | Persistent storage | ADR-0005 | — | — | NO STORY |
```

RTM 覆盖情况摘要：
- COVERED：[N] — 同时具备 ADR、故事和通过测试的需求
- MISSING test：[N] — 故事存在，但未找到测试文件
- NO STORY：[N] — 具备 ADR 但尚无故事的需求
- NO ADR：[N] — 缺少架构覆盖的需求（来自阶段 3 的缺口）
- 完整链路已完成（COVERED）：[N/总数]（[%]）

---

## 阶段 4：跨 ADR 冲突检测

将每个 ADR 与其他所有 ADR 进行比较，以检测矛盾。在以下情况下存在冲突：

- **数据所有权冲突**：两个 ADR 都声称对同一数据拥有独占所有权
- **集成契约冲突**：ADR-A 假定 System X 具有 interface Y，但 ADR-B 为 System X 定义了不同的接口
- **性能预算冲突**：ADR-A 为物理系统分配 N ms，ADR-B 为 AI 分配 N ms，两者相加超过总帧预算
- **依赖循环**：ADR-A 规定 System X 先于 Y 初始化；ADR-B 则规定 Y 先于 X 初始化
- **架构模式冲突**：ADR-A 对某个子系统使用事件驱动通信；ADR-B 对同一子系统使用直接函数调用
- **状态管理冲突**：两个 ADR 都定义了对同一游戏状态的控制权（例如 Combat ADR 和 Character ADR 都声称拥有 health value）

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

### ADR 依赖关系排序

完成冲突检测后，分析所有 ADR 之间的依赖关系图：

1. **收集所有 `Depends On` 字段**：从每个 ADR 的“ADR Dependencies”部分收集
2. **拓扑排序**：确定正确的实施顺序——没有依赖项的 ADR
   最先实施（基础层），依赖这些 ADR 的随后实施，依此类推。
3. **标记未解决的依赖项**：如果 ADR-A 的 `Depends On` 字段引用的 ADR
   仍处于 `Proposed` 状态或不存在，则标记它：
   ```
   ⚠️  ADR-0005 depends on ADR-0002 — but ADR-0002 is still Proposed.
       ADR-0005 cannot be safely implemented until ADR-0002 is Accepted.
   ```
4. **循环检测**：如果 ADR-A 依赖 ADR-B，而 ADR-B 又直接或
   间接依赖 ADR-A，则将其标记为 `DEPENDENCY CYCLE`：
   ```
   🔴 DEPENDENCY CYCLE: ADR-0003 → ADR-0006 → ADR-0003
      This cycle must be broken before either can be implemented.
   ```
5. **输出建议的实施顺序**：
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

## 阶段 5：引擎兼容性交叉检查

检查所有 ADR 的引擎一致性：

### 版本一致性
- 所有提及引擎版本的 ADR 是否对同一版本达成一致？
- 如果任何 ADR 是针对较旧的引擎版本编写的，请将其标记为可能已过时

### 截止日期后 API 的一致性
- 收集所有 ADR 中的所有“Post-Cutoff APIs Used”字段
- 对于每一项，根据相关模块参考文档进行验证
- 检查是否有两个 ADR 对同一个截止日期后 API 作出了相互矛盾的假设

### 已弃用 API 检查
- 在所有 ADR 中搜索 `deprecated-apis.md` 内列出的 API 名称
- 标记任何引用已弃用 API 的 ADR

### 缺失引擎兼容性部分
- 列出所有完全缺少“Engine Compatibility”部分的 ADR
- 这些是盲区——其引擎相关假设未知

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

### 咨询引擎专家

完成上述引擎审计后，通过 Task 启动**主要引擎专家**，获取领域专家的第二意见：
- 阅读 `.claude/docs/technical-preferences.md` 的 `Engine Specialists` 部分，获取主要专家
- 如果未配置引擎，则跳过此次咨询
- 使用以下内容启动 `subagent_type: [primary specialist]`：所有包含引擎特定决策或 `Post-Cutoff APIs Used` 字段的 ADR、引擎参考文档以及阶段 5 的审计结果。要求其：
  1. 确认或质疑每项审计发现——专家可能了解参考文档中未涵盖的引擎细节
  2. 识别审计可能遗漏的 ADR 中的引擎特定反模式（例如，使用了错误的 Godot 节点类型、Unity 组件耦合、Unreal 子系统误用）
  3. 标记对引擎行为所作假设与实际锁定版本不符的 ADR

将其他发现纳入阶段 5 输出中的 `### Engine Specialist Findings`。这些发现会影响最终结论——专家识别的问题与审计识别的问题权重相同。

---

## 阶段 5b：设计修订标记（架构 → GDD 反馈）

对于阶段 5 中的每一项**高风险引擎发现**，检查是否有任何 GDD 所作的假设与已验证的引擎实际情况相矛盾。

需要检查的具体情况：

1. **截止日期之后的 API 行为与训练数据中的假设不同**：如果某个 ADR 记录了已验证的 API 行为，且该行为与 LLM 的默认假设不同，请检查所有引用相关系统的 GDD。查找围绕旧的（假定的）行为编写的设计规则。

2. **ADR 中记录的已知引擎限制**：如果某个 ADR 记录了已知的引擎限制（例如“Jolt 忽略 HingeJoint3D damp”“D3D12 现在是默认后端”），请检查围绕受影响功能设计机制的 GDD。

3. **已弃用 API 冲突**：如果阶段 5 标记了 ADR 中使用的某个已弃用 API，请检查是否有任何 GDD 包含假定该已弃用 API 行为的机制。

对于发现的每项冲突，将其记录在 GDD 修订标记表中：

```
### GDD Revision Flags (Architecture → Design Feedback)
These GDD assumptions conflict with verified engine behaviour or accepted ADRs.
The GDD should be revised before its system enters implementation.

| GDD | Assumption | Reality (from ADR/engine-reference) | Action |
|-----|-----------|--------------------------------------|--------|
| combat.md | "Use HingeJoint3D damp for weapon recoil" | Jolt ignores damp — ADR-0003 | Revise GDD |
```

如果未发现修订标记，请写入：“未发现 GDD 修订标记——所有 GDD 假设均与已验证的引擎行为一致。”

在询问之前，先以内联方式显示建议的更改——将每个被标记 GDD 当前的 systems-index 行与建议更新后的行并排显示，让用户可以准确看到将发生哪些更改。

然后使用 `AskUserQuestion`：
- “我发现了 [N] 个 GDD 修订标记。是否允许我更新系统索引？”
  - [A] 是——立即将全部 [N] 项更新应用到系统索引
  - [B] 先向我显示完整差异，然后再次询问
  - [C] 否——暂时保持系统索引不变

如果选择 [A]：应用更新。状态字段必须严格为 `Needs Revision`——不得添加括号说明（其他 skill 会匹配这一精确字符串，添加括号会导致匹配失败）。
如果选择 [B]：显示建议的完整 systems-index 章节，然后使用 `AskUserQuestion` 再次询问。

---

## 阶段 6：架构文档覆盖范围

如果 `docs/architecture/architecture.md` 存在，请根据 GDD 对其进行验证：

- `systems-index.md` 中的每个系统是否都出现在架构分层中？
- 数据流章节是否涵盖 GDD 中定义的所有跨系统通信？
- API 边界是否支持 GDD 中的所有集成要求？
- 架构文档中是否存在没有对应 GDD 的系统（孤立架构）？

---

## 阶段 7：输出审查报告

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

## 阶段 8：编写并更新可追溯性索引

使用 `AskUserQuestion` 请求写入批准：
- “审查已完成。你希望写入哪些内容？”
  - [A] 写入全部三个文件（审查报告 + 可追溯性索引 + TR 注册表）
  - [B] 仅写入审查报告 — `docs/architecture/architecture-review-[date].md`
  - [C] 暂不写入任何内容 — 我需要先审阅这些发现

### RTM 输出（仅限 rtm 模式）

对于 `rtm` 模式，使用 `AskUserQuestion`：
- “是否可以写入完整的需求可追溯性矩阵？”
  - [A] 是 — 写入 `docs/architecture/requirements-traceability.md`
  - [B] 暂不写入 — 先向我展示完整的 RTM 数据，然后再次询问

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

另请询问：“我可以使用本次审查中新发现的需求 ID 更新 `docs/architecture/tr-registry.yaml` 吗？”

如果可以：
- **追加**本次审查前注册表中不存在的所有新 TR-ID
- 对于 GDD 措辞发生变化的条目，**更新**其 `requirement` 文本和 `revised` 日期（ID 保持不变）
- 对于其 GDD 需求已不存在的注册表条目，**标记**为 `status: deprecated`（标记为弃用前需与用户确认）
- **绝不**重新编号或删除现有条目
- 更新顶部的 `last_updated` 和 `version` 字段

这可确保未来所有故事文件都能引用稳定的 TR-ID，并使其在此后每次架构审查中持续有效。

### 反思日志更新

写入审查报告后，将阶段 4 中发现的所有 🔴 冲突条目追加到 `docs/consistency-failures.md`（如果该文件存在）：

```markdown
### [YYYY-MM-DD] — /architecture-review — 🔴 CONFLICT
**Domain**: Architecture / [specific domain e.g. State Ownership, Performance]
**Documents involved**: [ADR-NNNN] vs [ADR-MMMM]
**What happened**: [specific conflict — what each ADR claims]
**Resolution**: [how it was or should be resolved]
**Pattern**: [generalised lesson for future ADR authors in this domain]
```

仅追加冲突条目——不要记录缺口条目（在架构完成之前，缺少 ADR 是正常情况）。如果文件不存在，不要创建——仅在文件已经存在时追加。

### 会话状态更新

写入所有已获批准的文件后，静默追加以下内容到 `production/session-state/active.md`：

    ## Session Extract — /architecture-review [date]
    - Verdict: [PASS / CONCERNS / FAIL]
    - Requirements: [N] total — [X] covered, [Y] partial, [Z] gaps
    - New TR-IDs registered: [N, or "None"]
    - GDD revision flags: [comma-separated GDD names, or "None"]
    - Top ADR gaps: [top 3 gap titles from the report, or "None"]
    - Report: docs/architecture/architecture-review-[date].md

如果 `active.md` 不存在，则创建该文件，并将此块作为初始内容。在对话中确认：“会话状态已更新。”

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

完成审查并写入已获批准的文件后，展示：

1. **立即执行的操作**：列出最优先创建的 3 个 ADR（影响最大的缺口优先，基础层先于功能层）
2. **门禁前检查清单**：通过 Glob 检查以下内容是否存在，并将每项标记为 ✅ 或 ❌：
   - `tests/unit/` 和 `tests/integration/` 目录——如果为 ❌：运行 `/test-setup`
   - `.github/workflows/tests.yml`——如果为 ❌：运行 `/test-setup`
   - `design/accessibility-requirements.md`——如果为 ❌：运行 `/ux-design`
   - `design/ux/interaction-patterns.md`——如果为 ❌：运行 `/ux-design`
   将 ❌ 项作为执行门禁检查之前的必需步骤展示。如果任何项目为 ❌，不要将 `/gate-check` 作为选项提供——改为建议运行缺失项对应的技能。
3. **重新运行触发条件**：“每写入一个新 ADR 后，重新运行 `/architecture-review`，以验证覆盖率是否有所提升”

然后，根据前置关卡检查清单的状态，以定制的 `AskUserQuestion` 结束：
- 如果仍存在 ADR 缺口，或任何前置关卡项目为 ❌：
  - “架构审查已完成。接下来你想做什么？”
    - [A] 编写缺失的 ADR — 打开一个新会话并运行 `/architecture-decision [system]`
    - [B] 运行 `/test-setup` — 在关卡检查前必须完成（仅当测试基础设施为 ❌ 时显示）
    - [C] 运行 `/ux-design` — 在关卡检查前必须完成（仅当 UX/无障碍文件为 ❌ 时显示）
    - [D] 在此结束本次会话
- 如果所有前置关卡检查清单项目均为 ✅，且不存在阻塞性的 ADR 缺口：
  - “架构审查已完成。所有前置关卡项目均已确认。接下来你想做什么？”
    - [A] 运行 `/gate-check pre-production`
    - [B] 编写缺失的 ADR — 打开一个新会话并运行 `/architecture-decision [system]`
    - [C] 在此结束本次会话

---

## 错误恢复协议

如果任何生成的代理返回 BLOCKED、出错或未能完成：

1. **立即呈现**：继续之前，报告“[AgentName]: BLOCKED — [reason]”
2. **评估依赖关系**：如果被阻塞代理的输出是后续阶段所必需的，则在未获得用户输入前，不要继续越过该阶段
3. **通过 AskUserQuestion 提供选项**，包含以下三个选择：
   - 跳过此代理，并在最终报告中注明该缺口
   - 使用更小的范围重试（更少的 GDD、聚焦单个系统）
   - 在此停止，先解决阻塞问题
4. **始终生成部分报告** — 输出所有已完成的内容，避免工作成果丢失

---

## 协作协议

1. **静默读取** — 不要逐一叙述读取的每个文件
2. **展示矩阵** — 在询问任何内容之前展示完整的可追溯性矩阵；让用户先了解当前状态
3. **不要猜测** — 如果某项需求含义不明确，请询问：“[X] 是技术需求还是设计偏好？”
4. **批准前先展示草稿** — 在请求批准之前，始终在对话中以内联方式展示将要写入的内容（报告、更新后的 ADR 章节、systems-index 行）。绝不要请求写入用户尚未看过的内容。
5. **使用 `AskUserQuestion` 获取写入批准** — 仅用纯文本询问“可以吗？”并不充分。使用带有 [A]/[B]/[C] 标签选项的结构化工具，让用户可以在“立即写入”“先展示完整草稿”和“暂不写入”之间进行选择。涉及多个文件的变更集必须列出每个文件及其变更内容，然后统一询问一次，并提供分组选项 — 不要针对每个文件分别提出纯文本问题。
6. **非阻塞性** — 判定仅供参考；即使存在 CONCERNS 甚至 FAIL 结果，也由用户决定是否继续