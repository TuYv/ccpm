---
name: dev-story
description: "Read a story file and implement it. Loads the full context (story, GDD requirement, ADR guidelines, control manifest), routes to the right programmer agent for the system and engine, implements the code and test, and confirms each acceptance criterion. The core implementation skill — run after /story-readiness, before /code-review and /story-done."
argument-hint: "[story-path]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash, Task, AskUserQuestion
model: sonnet
---
# Dev Story

这个技能在规划与代码之间搭建桥梁。它会完整读取 story 文件，汇集程序员所需的全部上下文，路由到正确的专家代理，并推动实现直至完成——包括编写测试。

**每个 story 的循环：**
```
/qa-plan sprint           ← define test requirements before sprint begins
/story-readiness [path]   ← validate before starting
/dev-story [path]         ← implement it  (this skill)
/code-review [files]      ← review it
/story-done [path]        ← verify and close it
```

**在 sprint 中的所有 story 都完成后：**运行 `/team-qa sprint` 执行完整 QA 周期，并在推进项目阶段之前获得签核结论。

**输出：**源代码和测试文件，位于项目的 `src/` 与 `tests/` 目录中。

---

## Phase 1: Find the Story

**如果提供了路径**：直接读取该文件。

**如果没有参数**：检查 `production/session-state/active.md` 中的当前 story。如果找到，确认："Continuing work on [story title] — is that correct?" 如果未找到，询问："Which story are we implementing?" Glob `production/epics/**/*.md`，并列出 Status: Ready 的 story。

---

## Phase 2: Load Full Context

**在加载任何上下文之前，先验证必需文件是否存在。**从 story 的 `ADR Governing Implementation` 字段中提取 ADR 路径，然后检查：

| File | Path | If missing |
|------|------|------------|
| TR registry | `docs/architecture/tr-registry.yaml` | **STOP** — "TR registry not found at `docs/architecture/tr-registry.yaml`. Run `/architecture-review` to bootstrap the registry from your GDDs and ADRs." |
| Governing ADR | story ADR 字段中的路径 | **STOP** — "ADR file [path] not found. Run `/architecture-decision` to create it, or correct the filename in the story's ADR field." |
| Control manifest | `docs/architecture/control-manifest.md` | **WARN and continue** — "Control manifest not found — layer rules cannot be checked. Run `/create-control-manifest`." |

如果 TR registry 或治理 ADR 缺失，将 session state 中的 story 状态设为 **BLOCKED**，并且不要生成任何程序员代理。

同时读取以下全部内容——这些是相互独立的读取。在所有上下文加载完成之前，不要开始实现：

### story 文件

提取并保留：
- **Story 标题、ID、层级、类型**（Logic / Integration / Visual/Feel / UI / Config/Data）
- **TR-ID** — GDD 需求标识符
- **治理 ADR** 引用
- story 头部中嵌入的 **Manifest Version**
- **Acceptance Criteria** — 每个 checkbox 项，逐字保留
- **Implementation Notes** — story 中的 ADR 指导部分
- **Out of Scope** 边界
- **Test Evidence** — 必需的测试文件路径
- **Dependencies** — 在此 story 之前必须完成的内容

### TR registry

读取 `docs/architecture/tr-registry.yaml`。查找 story 的 TR-ID。
读取当前的 `requirement` 文本——这是 GDD 当前需求的事实来源。不要依赖 story 文件中的任何内联文本（可能已过期）。

### 治理 ADR

读取 `docs/architecture/[adr-file].md`。提取：
- 完整的 Decision 部分
- Implementation Guidelines 部分（这是程序员要遵循的内容）
- Engine Compatibility 部分（截止日期后的 API、已知风险）
- ADR Dependencies 部分

### control manifest

读取 `docs/architecture/control-manifest.md`。提取此 story 层级的规则：
- Required patterns
- Forbidden patterns
- Performance guardrails

检查：story 中嵌入的 Manifest Version 是否与当前 manifest 头部日期匹配？
如果不同，在继续之前使用 `AskUserQuestion`：
- Prompt："Story was written against manifest v[story-date]. Current manifest is v[current-date]. New rules may apply. How do you want to proceed?"
- Options：
  - `[A] Update story manifest version and implement with current rules (Recommended)`
  - `[B] Implement with old rules — I accept the risk of non-compliance`
  - `[C] Stop here — I want to review the manifest diff first`

如果选择 [A]：在生成程序员之前，将 story 文件的 `Manifest Version:` 字段编辑为当前 manifest 日期。然后仔细阅读 manifest 中的新规则。
如果选择 [B]：将 story 文件的 `Manifest Version:` 字段编辑为当前 manifest 日期，并在 story 头部添加一行 `Manifest-Note: Proceeded with old manifest rules on [date] — non-compliance risk accepted.`。仍然阅读 manifest 中的新规则。在 Phase 6 摘要的 "Deviations" 下记录该决定。`/story-done` 会在其 deviations 部分包含 Manifest-Note，而不会重新检查过期状态。
如果选择 [C]：停止。不要生成任何代理。让用户审查并重新运行 `/dev-story`。

### Dependency validation

从 story 文件中提取 **Dependencies** 列表后，逐项验证：

1. Glob `production/epics/**/*.md`，查找每个依赖 story 文件。
2. 读取其 `Status:` 字段。
3. 如果任何依赖的状态不是 `Complete` 或 `Done`：
   - 使用 `AskUserQuestion`：
     - Prompt："Story '[current story]' depends on '[dependency title]' which is currently [status], not Complete. How do you want to proceed?"
     - Options：
       - `[A] Proceed anyway — I accept the dependency risk`
       - `[B] Stop — I'll complete the dependency first`
       - `[C] The dependency is done but status wasn't updated — mark it Complete and continue`
   - 如果选择 [B]：将 session state 中的 story 状态设为 **BLOCKED** 并停止。不要生成任何程序员代理。
   - 如果选择 [C]：在继续之前询问 "May I update [dependency path] Status to Complete?"
   - 如果选择 [A]：在 Phase 6 摘要的 "Deviations" 下记录："Implemented with incomplete dependency: [dependency title] — [status]."

如果找不到依赖文件：警告 "Dependency story not found: [path]. Verify the path or create the story file."

---

### Engine reference

读取 `.claude/docs/technical-preferences.md`：
- `Engine:` 值——决定使用哪些程序员代理
- 命名约定（类名、文件名、signal/event 名称）
- 性能预算（frame budget、memory ceiling）
- 禁止模式

### Mark Story In Progress

在生成任何代理之前，静默更新两项内容：

1. **`production/sprint-status.yaml`**（如果存在）：找到与此 story 文件路径匹配的条目，并将其设为 `status: in_progress`。将顶层 `updated` 字段更新为今天的日期。如果该文件不存在，静默跳过。

2. **story 文件本身**：将 story 头部中的 `Last Updated:` 字段编辑为今天的日期（格式：`YYYY-MM-DD`）。如果 story 头部中不存在该字段，则在 `Status:` 行之后添加。这会启用此 story 的 sprint-status 过期检测。

---

## Phase 3: Route to the Right Programmer

根据 story 的 **Layer**、**Type** 和 **system name**，确定通过 Task 生成哪个专家。

**Config/Data story——完全跳过代理生成：**
如果 story 的 Type 是 `Config/Data`，则不需要程序员代理或引擎专家。直接跳到 Phase 4（Config/Data note）。实现内容是一次数据文件编辑——不进行路由表评估，也不使用引擎专家。

### Primary agent routing table

| Story context | Primary agent |
|---|---|
| Foundation layer — any type | `engine-programmer` |
| Any layer — Type: UI | `ui-programmer` |
| Any layer — Type: Visual/Feel | `gameplay-programmer`（负责实现） |
| Core or Feature — gameplay mechanics | `gameplay-programmer` |
| Core or Feature — AI behaviour, pathfinding | `ai-programmer` |
| Core or Feature — networking, replication | `network-programmer` |
| Config/Data — no code | No agent needed（见 Phase 4 Config note） |

### Engine specialist — always spawn as secondary for code stories

读取 `.claude/docs/technical-preferences.md` 的 `Engine Specialists` 部分，以获取已配置的主要专家。当 story 涉及引擎专属 API、模式，或 ADR 具有高引擎风险时，将其与主要代理一起生成。

| Engine | Specialist agents available |
|--------|----------------------------|
| Godot 4 | `godot-specialist`, `godot-gdscript-specialist`, `godot-shader-specialist` |
| Unity | `unity-specialist`, `unity-ui-specialist`, `unity-shader-specialist` |
| Unreal Engine | `unreal-specialist`, `ue-gas-specialist`, `ue-blueprint-specialist`, `ue-umg-specialist`, `ue-replication-specialist` |

---

**当引擎风险为 HIGH 时**（来自 ADR 或 VERSION.md）：始终生成引擎专家，即使是非面向引擎的故事。高风险意味着 ADR 记录了关于截止日期之后引擎 API 的假设，需要专家验证。

---

## 阶段 4：实现

通过 Task 生成选定的程序员代理，并附带完整上下文包：

向代理简要说明文件路径和有针对性的阅读指令——不要将文档内容序列化进 Task 提示词。代理会直接阅读它需要的内容：

1. **故事文件**：`[story-path]` — 完整阅读
2. **GDD 需求**：在 `docs/architecture/tr-registry.yaml` 中查找 TR-ID `[TR-XXX-NNN]` — 以 `requirement` 字段作为唯一事实来源
3. **ADR**：`docs/architecture/[adr-file].md` — 仅阅读 **Decision** 和 **Implementation Guidelines** 部分
4. **控制清单**：`docs/architecture/control-manifest.md` — 仅阅读 **[layer]** 层的规则
5. **引擎偏好**：`.claude/docs/technical-preferences.md` — 阅读命名约定和性能预算
6. **测试文件路径**：`[path from story's Test Evidence section]` — 必须作为实现的一部分创建此文件
7. **测试要求**（仅适用于 Logic 和 Integration 故事）：测试文件必须创建在 `[path from the story's Test Evidence section]`。与实现一起编写测试——不要推迟。如果此文件不存在，故事无法通过 `/story-done` 关闭。每个验收标准必须至少有一个测试函数覆盖它。测试文件命名：`[system]_[feature]_test.[ext]`。函数命名：`test_[scenario]_[expected_outcome]`。不允许随机种子、时间相关断言或外部 I/O。
8. **明确指令**：按照 ADR 指南实现这个故事，遵守清单规则，保持在故事的 Out of Scope 边界内。编写干净、带有文档注释的公共 API。

该代理应该：
- 按照 ADR 指南在 `src/` 中创建或修改文件
- 遵守控制清单中的所有 Required 和 Forbidden 模式
- 保持在故事的 Out of Scope 边界内（不要触碰无关文件）
- 编写干净、带有文档注释的公共 API

### Config/Data 故事（不需要代理）

对于 Type: Config/Data 故事，不需要程序员代理。实现就是编辑一个数据文件。阅读故事的验收标准，并直接对数据文件进行指定更改。记录哪些值发生了变化，以及它们从什么变为什���。

### Visual/Feel 故事

生成 `gameplay-programmer` 来实现代码/动画调用。注意，Visual/Feel 验收标准无法自动验证——“感觉是否正确？”的检查将在 `/story-done` 中通过手动确认完成。

---

## 阶段 5：测试证据要求

测试要求已包含在阶段 4 的程序员代理简要说明中（第 7 项）。本阶段总结每种故事类型需要哪些证据——用于收集阶段 6 的摘要。

| 故事类型 | 所需证据 | 说明 |
|---|---|---|
| **Logic** | 位于故事 Test Evidence 部分指定路径的自动化单元测试 | BLOCKING — 已包含在阶段 4 代理简要说明中 |
| **Integration** | 集成测试或已记录的试玩记录 | BLOCKING — 已包含在阶段 4 代理简要说明中 |
| **Visual/Feel** | 位于 `production/qa/evidence/[slug]-evidence.md` 的证据文档 | ADVISORY — 在阶段 6 摘要中注明 |
| **UI** | 手动走查文档或交互测试 | ADVISORY — 在阶段 6 摘要中注明 |
| **Config/Data** | 无 — 冒烟检查作为证据 | N/A |

对于 Visual/Feel 和 UI 故事，在阶段 6 摘要中包含："Manual evidence required at `production/qa/evidence/[slug]-evidence.md` before this story can be fully closed."

---

## 阶段 6：收集并总结

程序员代理完成后，收集：

- 创建或修改的文件（包含路径）
- 创建的测试文件（路径和编写的测试函数数量）
- 偏离故事 Out of Scope 边界的任何情况（标记这些情况）
- 代理提出的任何问题或阻碍
- 专家标记的任何引擎特定风险

呈现简明的实现摘要：

```
## Implementation Complete: [Story Title]

**Files changed**:
- `src/[path]` — created / modified ([brief description])
- `tests/[path]` — test file ([N] test functions)

**Acceptance criteria covered**:
- [x] [criterion] — implemented in [file:function]
- [x] [criterion] — covered by test [test_name]
- [ ] [criterion] — DEFERRED: requires playtest (Visual/Feel)

**Deviations from scope**: [None] or [list files touched outside story boundary]
**Engine risks flagged**: [None] or [specialist finding]
**Blockers**: [None] or [describe]

**Before running `/story-done`:** run your test suite locally and confirm the tests you wrote pass. `/story-done` will re-run them automatically, but a failing test discovered there means returning to implementation context.

Ready for: `/code-review [file1] [file2]` then `/story-done [story-path]`
```

---

## 阶段 7：更新会话状态

静默追加到 `production/session-state/active.md`：

```
## Session Extract — /dev-story [date]
- Story: [story-path] — [story title]
- Files changed: [comma-separated list]
- Test written: [path, or "None — Visual/Feel/Config story"]
- Blockers: [None, or description]
- Next: /code-review [files] then /story-done [story-path]
```

如果 `active.md` 不存在，则创建它。确认："Session state updated."

---

## 错误恢复协议

如果任何生成的代理（通过 Task）返回 BLOCKED、报错或无法完成：

1. **立即呈现**：在继续执行依赖阶段之前，向用户报告 "[AgentName]: BLOCKED — [reason]"
2. **评估依赖关系**：检查被阻塞代理的输出是否为后续阶段所需。如果是，在没有用户输入的情况下不要越过该依赖点继续执行。
3. **通过 AskUserQuestion 提供选项**，选择包括：
   - 跳过此代理，并在最终报告中注明缺口
   - 以更窄的范围重试
   - 停止在这里并先解决阻碍
4. **始终生成部分报告** — 输出已完成的内容。绝不因为一个代理被阻塞而丢弃工作。

常见阻碍：
- 输入文件缺失（找不到故事、GDD 不存在）→ 重定向到创建它的技能
- ADR 状态为 Proposed → 不要实现；先运行 `/architecture-decision`
- 范围过大 → 通过 `/create-stories` 拆分为两个故事
- ADR 与故事之间的指令冲突 → 呈现冲突，不要猜测
- 清单版本不匹配 → 向用户展示差异，询问是使用旧规则继续还是先更新故事

## 协作协议

- **文件写入是委托的** — 所有源代码、测试文件和证据文档都由通过 Task 生成的子代理编写。每个子代理单独执行“May I write to [path]?”协议。此编排器不直接写文件。
- **实现前先加载** — 在所有上下文（故事、TR-ID、ADR、清单、引擎偏好）加载完成之前，不要开始编码。不完整的上下文会产生偏离设计的代码。
- **ADR 就是法律** — 实现必须遵循 ADR 的 Implementation Guidelines。如果这些指南与看似“更好”的做法冲突，请在摘要中标记，而不是静默偏离。
- **保持在范围内** — Out of Scope 部分是一份契约。如果实现这个故事需要触碰范围外的文件，停下来并呈现它："Implementing [criterion] requires modifying [file], which is out of scope. Shall I proceed or create a separate story?"
- **测试对 Logic/Integration 不是可选项** — 如果测试文件不存在，不要标记实现完成
- **Visual/Feel 标准是推迟，而不是跳过** — 在摘要中将其标记为 DEFERRED；它们将在 `/story-done` 中手动验证
- **大型结构性决策前先询问** — 如果故事需要 ADR 未覆盖的架构模式，在实现前呈现它："The ADR doesn't specify how to handle [case]. My plan is [X]. Proceed?"

---

---

## 建议的后续步骤

- 运行 `/code-review [file1] [file2]`，在关闭故事前审查实现
- 运行 `/story-done [story-path]`，验证验收标准并将故事标记为完成
- 所有冲刺故事完成后：运行 `/team-qa sprint`，在推进项目阶段之前执行完整 QA 周期
