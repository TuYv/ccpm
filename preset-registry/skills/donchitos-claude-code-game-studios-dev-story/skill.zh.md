---
name: dev-story
description: "Read a story file and implement it. Loads the full context (story, GDD requirement, ADR guidelines, control manifest), routes to the right programmer agent for the system and engine, implements the code and test, and confirms each acceptance criterion. The core implementation skill — run after /story-readiness, before /code-review and /story-done."
argument-hint: "[story-path]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Bash, Task, AskUserQuestion
model: sonnet
---
# 开发故事

此技能连接规划与代码。它会完整读取故事文件，汇集程序员所需的全部上下文，将任务分派给正确的专家智能体，并推动实现直至完成——包括编写测试。

**每个故事的工作循环：**
```
/qa-plan sprint           ← define test requirements before sprint begins
/story-readiness [path]   ← validate before starting
/dev-story [path]         ← implement it  (this skill)
/code-review [files]      ← review it
/story-done [path]        ← verify and close it
```

**所有冲刺故事完成后：**运行 `/team-qa sprint`，执行完整的 QA 周期并获得批准结论，然后再推进项目阶段。

**输出：**项目的 `src/` 和 `tests/` 目录中的源代码和测试文件。

---

## 阶段 1：查找故事

**如果提供了路径**：直接读取该文件。

**如果没有参数**：检查 `production/session-state/active.md` 中是否有当前活动的故事。如果找到，请确认：“继续处理 [story title]——对吗？”如果未找到，请询问：“我们要实现哪个故事？”对 `production/epics/**/*.md` 执行 Glob，并列出 Status: Ready 的故事。

---

## 阶段 2：加载完整上下文

**加载任何上下文之前，先验证所需文件是否存在。**从故事的 `ADR Governing Implementation` 字段中提取 ADR 路径，然后检查：

| 文件 | 路径 | 如果缺失 |
|------|------|------------|
| TR 注册表 | `docs/architecture/tr-registry.yaml` | **停止**——“在 `docs/architecture/tr-registry.yaml` 中未找到 TR 注册表。运行 `/architecture-review`，根据 GDD 和 ADR 初始化注册表。” |
| 管理实现的 ADR | 故事 ADR 字段中的路径 | **停止**——“未找到 ADR 文件 [path]。运行 `/architecture-decision` 创建该文件，或更正故事 ADR 字段中的文件名。” |
| 控制清单 | `docs/architecture/control-manifest.md` | **警告并继续**——“未找到控制清单——无法检查分层规则。运行 `/create-control-manifest`。” |

如果 TR 注册表或管理实现的 ADR 缺失，请在会话状态中将故事状态设置为 **BLOCKED**，并且不要启动任何程序员智能体。

同时读取以下所有内容——这些读取操作彼此独立。在加载全部上下文之前，不要开始实现：

### 故事文件
提取并保留：
- **故事标题、ID、层级、类型**（逻辑 / 集成 / 视觉与体验 / UI / 配置与数据）
- **TR-ID**——GDD 需求标识符
- **管理实现的 ADR** 引用
- **清单版本**——嵌入故事标头中的版本
- **验收标准**——逐字保留每个复选框条目
- **实现说明**——故事中的 ADR 指导部分
- **范围之外**的边界
- **测试证据**——所需的测试文件路径
- **依赖项**——此故事开始前必须处于 DONE 状态的内容

### TR 注册表
读取 `docs/architecture/tr-registry.yaml`。查找故事的 TR-ID。
读取当前的 `requirement` 文本——这是 GDD 当前需求的事实依据。不要依赖故事文件中的任何内联文本（它们可能已经过时）。

### 约束性 ADR
读取 `docs/architecture/[adr-file].md`。提取：
- 完整的 Decision 章节
- Implementation Guidelines 章节（程序员需要遵循的内容）
- Engine Compatibility 章节（截止日期之后的 API、已知风险）
- ADR Dependencies 章节

### 控制清单
读取 `docs/architecture/control-manifest.md`。提取适用于此故事所在层级的规则：
- 必需模式
- 禁止模式
- 性能护栏

检查：故事中嵌入的 Manifest Version 是否与当前清单的标题日期一致？
如果二者不同，请在继续之前使用 `AskUserQuestion`：
- 提示："Story was written against manifest v[story-date]. Current manifest is v[current-date]. New rules may apply. How do you want to proceed?"
- 选项：
  - `[A] Update story manifest version and implement with current rules (Recommended)`
  - `[B] Implement with old rules — I accept the risk of non-compliance`
  - `[C] Stop here — I want to review the manifest diff first`

如果选择 [A]：在生成程序员代理之前，将故事文件的 `Manifest Version:` 字段编辑为当前清单日期。然后仔细阅读清单中的新规则。
如果选择 [B]：将故事文件的 `Manifest Version:` 字段编辑为当前清单日期，**并且**在故事标题中添加一行 `Manifest-Note: Proceeded with old manifest rules on [date] — non-compliance risk accepted.`。无论如何都要阅读清单中的新规则。在 Phase 6 摘要的 "Deviations" 下记录该决定。`/story-done` 会将 Manifest-Note 纳入其偏差章节，而不会再次检查是否过时。
如果选择 [C]：停止。不要生成任何代理。让用户审查后重新运行 `/dev-story`。

### 依赖项验证

从故事文件中提取 **Dependencies** 列表后，逐一验证：

1. 使用 Glob `production/epics/**/*.md` 查找每个依赖故事文件。
2. 读取其 `Status:` 字段。
3. 如果任一依赖项的 Status 不是 `Complete` 或 `Done`：
   - 使用 `AskUserQuestion`：
     - 提示："Story '[current story]' depends on '[dependency title]' which is currently [status], not Complete. How do you want to proceed?"
     - 选项：
       - `[A] Proceed anyway — I accept the dependency risk`
       - `[B] Stop — I'll complete the dependency first`
       - `[C] The dependency is done but status wasn't updated — mark it Complete and continue`
   - 如果选择 [B]：在会话状态中将故事状态设置为 **BLOCKED**，然后停止。不要生成任何程序员代理。
   - 如果选择 [C]：在继续之前询问 "May I update [dependency path] Status to Complete?"。
   - 如果选择 [A]：在 Phase 6 摘要的 "Deviations" 下注明："Implemented with incomplete dependency: [dependency title] — [status]."

如果找不到依赖项文件：警告 "Dependency story not found: [path]. Verify the path or create the story file."

---

### 引擎参考
读取 `.claude/docs/technical-preferences.md`：
- `Engine:` 值——决定使用哪些程序员代理
- 命名约定（类名、文件名、信号/事件名称）
- 性能预算（帧预算、内存上限）
- 禁止模式

### 将故事标记为进行中

在生成任何代理之前，静默更新以下两项：

1. **`production/sprint-status.yaml`**（如果存在）：找到与此故事文件路径匹配的条目，并将 `status: in_progress`。将顶层 `updated` 字段更新为今天的日期。如果文件不存在，则静默跳过。

2. **故事文件本身**：将故事头部的 `Last Updated:` 字段修改为今天的日期（格式：`YYYY-MM-DD`）。如果故事头部不存在该字段，则在 `Status:` 行后添加。这样便可对此故事进行冲刺状态过期检测。

---

## 阶段 3：路由至正确的程序员

根据故事的**层级**、**类型**和**系统名称**，确定应通过 Task 生成哪位专家。

**配置/数据故事——完全跳过代理生成：**
如果故事的类型为 `Config/Data`，则不需要程序员代理或引擎专家。直接跳转到阶段 4（配置/数据说明）。实现工作仅涉及编辑数据文件——无需评估路由表，也不需要引擎专家。

### 主要代理路由表

| 故事上下文 | 主要代理 |
|---|---|
| 基础层——任何类型 | `engine-programmer` |
| 任何层级——类型：UI | `ui-programmer` |
| 任何层级——类型：视觉/手感 | `gameplay-programmer`（负责实现） |
| 核心层或功能层——玩法机制 | `gameplay-programmer` |
| 核心层或功能层——AI 行为、寻路 | `ai-programmer` |
| 核心层或功能层——网络、复制 | `network-programmer` |
| 配置/数据——无代码 | 无需代理（参见阶段 4 的配置说明） |

### 引擎专家——对于代码故事，始终作为辅助代理生成

读取 `.claude/docs/technical-preferences.md` 的 `Engine Specialists` 部分，以获取已配置的主要专家。当故事涉及引擎特定的 API、模式，或 ADR 中的引擎风险为 HIGH 时，将其与主要代理一同生成。

| 引擎 | 可用的专家代理 |
|--------|----------------------------|
| Godot 4 | `godot-specialist`、`godot-gdscript-specialist`、`godot-shader-specialist` |
| Unity | `unity-specialist`、`unity-ui-specialist`、`unity-shader-specialist` |
| Unreal Engine | `unreal-specialist`、`ue-gas-specialist`、`ue-blueprint-specialist`、`ue-umg-specialist`、`ue-replication-specialist` |

**当引擎风险为 HIGH 时**（根据 ADR 或 VERSION.md）：始终生成引擎专家，即使故事不直接涉及引擎。高风险意味着 ADR 中记录了有关知识截止日期之后引擎 API 的假设，需要专家进行验证。

---

## 阶段 4：实现

通过 Task 生成选定的程序员代理，并向其提供完整的上下文包：

向代理提供文件路径和有针对性的阅读说明——不要将文档内容序列化到 Task 提示词中。代理会直接读取所需内容：

1. **故事文件**：`[story-path]`——完整阅读
2. **GDD 需求**：在 `docs/architecture/tr-registry.yaml` 中查找 TR-ID `[TR-XXX-NNN]`——以 `requirement` 字段作为事实来源
3. **ADR**：`docs/architecture/[adr-file].md`——仅阅读 **Decision** 和 **Implementation Guidelines** 部分
4. **控制清单**：`docs/architecture/control-manifest.md`——仅阅读 **[layer]** 层的规则
5. **引擎偏好**：`.claude/docs/technical-preferences.md`——阅读命名约定和性能预算
6. **测试文件路径**：`[path from story's Test Evidence section]`——必须在实现过程中创建此文件
7. **测试要求**（仅限逻辑和集成故事）：必须在 `[path from the story's Test Evidence section]` 创建测试文件。测试应与实现一同编写——不得推迟。若此文件不存在，则无法通过 `/story-done` 关闭故事。每项验收标准必须至少有一个测试函数进行覆盖。测试文件命名：`[system]_[feature]_test.[ext]`。函数命名：`test_[scenario]_[expected_outcome]`。不得使用随机种子、依赖时间的断言或外部 I/O。
8. **明确指令**：按照 ADR 指南实现此故事，遵守清单规则，并严格限定在故事的“范围之外”边界内。编写整洁且为公共 API 提供文档注释的代码。

智能体应：
- 按照 ADR 指南在 `src/` 中创建或修改文件
- 遵守控制清单中的所有 Required 和 Forbidden 模式
- 严格遵循故事的 Out of Scope 边界（不要改动无关文件）
- 编写整洁且为公共 API 添加文档注释的代码

### Config/Data 故事（无需智能体）

对于 Type: Config/Data 故事，无需程序员智能体。实现方式是编辑数据文件。阅读故事的验收标准，并直接对数据文件进行指定的更改。记录更改了哪些值，以及这些值更改前后的内容。

### Visual/Feel 故事

启动 `gameplay-programmer` 来实现代码/动画调用。请注意，Visual/Feel 验收标准无法自动验证——“体验是否合适？”检查将在 `/story-done` 中通过人工确认完成。

---

## 阶段 5：测试证据要求

测试要求已包含在阶段 4 的程序员智能体任务说明中（第 7 项）。本阶段汇总了每种故事类型所需的证据——在收集阶段 6 的摘要时使用。

| 故事类型 | 所需证据 | 备注 |
|---|---|---|
| **Logic** | 位于故事 Test Evidence 部分所指定路径的自动化单元测试 | 阻塞项——已包含在阶段 4 的智能体任务说明中 |
| **Integration** | 集成测试或有记录的试玩结果 | 阻塞项——已包含在阶段 4 的智能体任务说明中 |
| **Visual/Feel** | 位于 `production/qa/evidence/[slug]-evidence.md` 的证据文档 | 建议项——在阶段 6 的摘要中注明 |
| **UI** | 人工演练文档或交互测试 | 建议项——在阶段 6 的摘要中注明 |
| **Config/Data** | 无——冒烟检查即作为证据 | 不适用 |

对于 Visual/Feel 和 UI 故事，请在阶段 6 的摘要中包含：“在完全关闭此故事之前，需要在 `production/qa/evidence/[slug]-evidence.md` 提供人工证据。”

---

## 阶段 6：收集并汇总

程序员智能体完成工作后，收集：

- 已创建或修改的文件（包含路径）
- 已创建的测试文件（路径和编写的测试函数数量）
- 任何偏离故事 Out of Scope 边界的情况（标记这些情况）
- 智能体提出的任何问题或阻塞项
- 专家标记的任何引擎特定风险

提供一份简洁的实现摘要：

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

如果 `active.md` 不存在，则创建该文件。确认：“会话状态已更新。”

---

## 错误恢复协议

如果任何生成的代理（通过 Task）返回 BLOCKED、报错或无法完成任务：

1. **立即告知**：在继续执行存在依赖关系的阶段之前，向用户报告“[AgentName]: BLOCKED — [reason]”
2. **评估依赖关系**：检查后续阶段是否需要被阻塞代理的输出。如果需要，则在没有用户输入的情况下，不要越过该依赖点继续执行。
3. **通过 AskUserQuestion 提供选项**：
   - 跳过此代理，并在最终报告中注明这一缺失
   - 缩小范围后重试
   - 在此停止，先解决阻塞问题
4. **始终生成部分报告**——输出所有已完成的内容。绝不能因为某个代理被阻塞而丢弃工作成果。

常见阻塞问题：
- 输入文件缺失（未找到故事、缺少 GDD）→ 转到用于创建该文件的技能
- ADR 状态为 Proposed → 不要实施；先运行 `/architecture-decision`
- 范围过大 → 通过 `/create-stories` 拆分为两个故事
- ADR 与故事之间的指令冲突 → 明确指出冲突，不要猜测
- Manifest 版本不匹配 → 向用户展示差异，并询问是使用旧规则继续，还是先更新故事

## 协作协议

- **委派文件写入**——所有源代码、测试文件和证据文档均由通过 Task 生成的子代理编写。每个子代理都独立执行“May I write to [path]?”协议。此编排器不直接写入文件。
- **实施前先加载上下文**——在加载完所有上下文之前，不要开始编码
  （故事、TR-ID、ADR、manifest、引擎偏好）。上下文不完整会导致代码
  偏离设计。
- **ADR 即准则**——实施必须遵循 ADR 的实施
  指南。如果指南与看起来“更好”的做法冲突，应在
  摘要中指出，而不是悄然偏离。
- **严守范围**——Out of Scope 部分是一项约定。如果实施
  故事需要修改范围之外的文件，请停止并明确指出：
  “实施 [criterion] 需要修改 [file]，但该文件不在范围内。
  我应该继续，还是创建一个单独的故事？”
- **Logic/Integration 的测试并非可选**——在测试文件存在之前，不要将实施
  标记为完成
- **Visual/Feel 验收标准是推迟，而非跳过**——在摘要中将其标记为 DEFERRED；
  它们将在 `/story-done` 中进行人工验证
- **做出重大结构性决策前先询问**——如果故事需要一种
  ADR 未涵盖的架构模式，请在实施前明确提出：
  “ADR 未指定如何处理 [case]。我的计划是 [X]。是否继续？”

---

## 建议的后续步骤

- 运行 `/code-review [file1] [file2]`，在关闭故事之前审查实现
- 运行 `/story-done [story-path]`，验证验收标准并将故事标记为已完成
- 所有 Sprint 故事完成后：运行 `/team-qa sprint`，执行完整的 QA 周期，然后再推进项目阶段