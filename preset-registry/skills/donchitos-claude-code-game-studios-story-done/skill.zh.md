---
name: story-done
description: "End-of-story completion review. Reads the story file, verifies each acceptance criterion against the implementation, checks for GDD/ADR deviations, prompts code review, updates story status to Complete, and surfaces the next ready story from the sprint."
argument-hint: "[story-file-path] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write, Edit, AskUserQuestion, Task
model: sonnet
---
# 用户故事完成

此技能用于打通设计与实现之间的闭环。完成任何用户故事的实现后，都应运行此技能。它可确保在将用户故事标记为完成之前验证每一项验收标准，明确记录对 GDD 和 ADR 的偏离，而不是悄然引入偏差，提示进行代码审查以免遗漏，并确保用户故事文件反映实际的完成状态。

**输出：** 更新后的用户故事文件（`Status: Complete`）+ 显示下一个用户故事。

---

## 阶段 1：查找用户故事

确定审查模式（仅确定一次，并存储起来，供本次运行生成的所有关卡使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该模式
2. 否则，读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认使用 `lean`

完整的检查模式参见 `.claude/docs/director-gates.md`。

**如果提供了文件路径**（例如 `/story-done production/epics/core/story-damage-calculator.md`）：
直接读取该文件。

**如果未提供参数：**

1. 检查 `production/session-state/active.md`，查找当前处于活动状态的用户故事。
2. 如果未在其中找到，则读取 `production/sprints/` 中最新的文件，并查找标记为 IN PROGRESS 的用户故事。
3. 如果找到多个进行中的用户故事，则使用 `AskUserQuestion`：
   - “我们要完成哪个用户故事？”
   - 选项：列出进行中的用户故事文件名。
4. 如果找不到任何用户故事，请用户提供路径。

---

## 阶段 2：读取用户故事

读取完整的用户故事文件。提取以下内容并保留在上下文中：

- **用户故事名称和 ID**
- **引用的 GDD 需求 TR-ID**（例如 `TR-combat-001`）
- **清单版本**，即嵌入用户故事头部的版本（例如 `2026-03-10`）
- **ADR 引用**
- **验收标准**——完整列表（每一个复选框项目）
- **实现文件**——“要创建/修改的文件”下列出的文件
- **用户故事类型**——用户故事头部中的 `Type:` 字段（Logic / Integration / Visual/Feel / UI / Config/Data）
- **引擎说明**——注明的任何引擎特定约束
- **完成定义**——用户故事级别的 DoD（如果存在）
- **预估范围与实际范围**——如果记录了预估

还需读取：
- `docs/architecture/tr-registry.yaml`——在其中查找用户故事里的每个 TR-ID。
  从注册表条目中读取*当前的* `requirement` 文本。这是 GDD 需求的事实来源——不要使用用户故事中可能内嵌引用的任何需求文本，因为它可能已经过时。
- 引用的 GDD 章节——仅阅读验收标准和关键规则，不要阅读完整文档。使用这些内容交叉检查注册表文本是否仍然准确。
- 引用的 ADR——仅阅读 Decision 和 Consequences 章节
- `docs/architecture/control-manifest.md` 的头部——提取当前的 `Manifest Version:` 日期（用于阶段 4 的过期检查）

---

## 阶段 3：验证验收标准

针对用户故事中的每一项验收标准，尝试使用以下三种方法之一进行验证：

### 自动验证（无需询问，直接运行）

- **文件存在性检查**：使用 `Glob` 检查用户故事中声明要创建的文件。
- **测试通过检查**：如果提到了测试文件路径，则通过 `Bash` 运行该测试。
- **无硬编码值检查**：使用 `Grep` 检查游戏逻辑代码路径中本应位于配置文件里的数值字面量。
- **无硬编码字符串检查**：使用 `Grep` 检查 `src/` 中本应位于本地化文件里的面向玩家的字符串。
- **依赖项检查**：如果某项标准声明“依赖于 X”，则检查 X 是否存在。

### 通过确认进行手动验证（使用 `AskUserQuestion`）

- 关于主观质量的标准（“响应感觉灵敏”“动画播放正确”）
- 关于游戏玩法行为的标准（“玩家在……时受到伤害”“敌人对……作出响应”）
- 性能标准（“在 Xms 内完成”）——询问是否已进行性能分析，或接受其为假定结果

将最多 4 个手动验证问题合并到一次 `AskUserQuestion` 调用中：

```
question: "Does [criterion]?"
options: "Yes — passes", "No — fails", "Not tested yet"
```

### 无法验证（标记但不阻塞）

- 需要完整游戏构建才能测试的标准（端到端游戏玩法场景）
- 标记为：`DEFERRED — requires playtest session`

### 测试—标准可追溯性

完成上述通过/失败/延后检查后，将每项验收标准映射到覆盖它的测试：

对于故事中的每项验收标准：

1. 询问：是否存在一个单元测试、集成测试或已确认的手动试玩，能够直接验证此标准？
   - **单元测试**：检查 `tests/unit/` 中是否存在与该标准主题匹配的测试文件或函数名称（使用 `Glob` 和 `Grep`）
   - **集成测试**：以同样的方式检查 `tests/integration/`
   - **手动确认**：如果上述标准已通过 `AskUserQuestion` 验证，且回答为“Yes — passes”，则将其计为手动测试

2. 生成可追溯性表格：

```
| Criterion | Test | Status |
|-----------|------|--------|
| AC-1: [criterion text] | tests/unit/test_foo.gd::test_bar | COVERED |
| AC-2: [criterion text] | Manual playtest confirmation | COVERED |
| AC-3: [criterion text] | — | UNTESTED |
```

3. 应用以下升级规则：

   - 如果 **超过 50% 的标准为 UNTESTED**：升级为 **BLOCKING**——测试覆盖率不足，无法确认故事实际上已经完成。除非覆盖率得到改善，否则阶段 6 中的结论不能是 COMPLETE。
   - 如果**部分（≤50%）标准为 UNTESTED**：保持为 ADVISORY——不会阻止完成，但必须出现在完成说明中。
   - 如果**所有标准均为 COVERED**：除在报告中包含该表格外，无需采取其他措施。

4. 对于任何处于 ADVISORY 状态的未测试标准，将以下内容添加到阶段 7 的完成说明中：
   `"Untested criteria: [AC-N list]. Recommend adding tests in a follow-up story."`

### 测试证据要求

根据阶段 2 中提取的故事类型，检查所需证据：

| 故事类型 | 所需证据 | 门禁级别 |
|---|---|---|
| **逻辑** | `tests/unit/[system]/` 中的自动化单元测试——必须存在且通过 | BLOCKING |
| **集成** | `tests/integration/[system]/` 中的集成测试或试玩文档 | BLOCKING |
| **视觉/体验** | `production/qa/evidence/` 中的截图和签字确认 | ADVISORY |
| **UI** | `production/qa/evidence/` 中的手动走查文档或交互测试 | ADVISORY |
| **配置/数据** | `production/qa/smoke-*.md` 中的冒烟检查通过报告 | ADVISORY |

**对于逻辑故事**：首先阅读故事的**测试证据**部分，提取确切的所需文件路径。使用 `Glob` 检查该确切路径。如果未找到确切路径，还应对 `tests/unit/[system]/` 进行广泛搜索（文件可能被放置在略有不同的位置）。如果在任一位置都未找到测试文件：
- 标记为 **BLOCKING**：“逻辑故事没有单元测试文件。故事要求该文件位于
  `[exact-path-from-Test-Evidence-section]`。请先创建并运行测试，然后再将此故事标记为
  Complete。”

**对于集成类故事**：阅读故事的 **Test Evidence** 部分，确定具体的
必需路径。首先使用 `Glob` 检查该确切路径，然后在
`tests/integration/[system]/` 中进行广泛搜索，最后检查 `production/session-logs/` 中是否存在
引用此故事的试玩记录。
如果均未找到：标记为 **阻断项**（规则与逻辑类相同）。

**对于视觉/体验类和 UI 类故事**：在 `production/qa/evidence/` 中使用 glob 查找
引用此故事的文件。
- 如果没有：标记为 **建议项** — “未找到手动测试证据。请使用测试证据模板创建 `production/qa/evidence/[story-slug]-evidence.md`，并在最终关闭前获得签核。”
- 如果找到：读取该文件，并检查签核表中是否有未勾选的复选框。使用 Grep 查找与 `| .* | .* | .* | \[ \] Approved` 匹配的行（即复选框未勾选的签核行）。如果发现任何尚未签核的行：标记为 **建议项** — “已在 `[path]` 找到证据文件，但仍有 [N] 项签核待完成（在签核表中显示为 `[ ] Approved`）。请在最终关闭前获得所需签核。注意：对于独立开发者，所有角色均可由同一人签核。”
- 如果所有签核行均显示 `[x] Approved` 或等效内容：注明“已找到证据文件且所有签核均已完成 — 建议项检查通过。”

**对于配置/数据类故事**：检查是否存在任何 `production/qa/smoke-*.md` 文件。
如果没有：标记为 **建议项** — “未找到冒烟检查报告。请运行 `/smoke-check`。”

**如果未设置 Story Type**：标记为 **建议项** —
“未声明 Story Type。请将 `Type: [Logic|Integration|Visual/Feel|UI|Config/Data]`
添加到故事标头，以便在未来的故事中强制执行测试证据门禁。”

任何阻断性的测试证据缺失都会导致无法在阶段 6 中得出“完成”结论。

---

## 阶段 4：检查偏差

将实现与设计文档进行比较。

自动运行以下检查：

1. **GDD 规则检查**：使用 `tr-registry.yaml` 中的当前需求文本
   （通过故事的 TR-ID 查找），检查实现是否反映了 GDD 当前的实际要求，
   而不是故事编写时的要求。使用 `Grep` 在已实现的文件中查找当前 GDD 章节中
   提及的关键函数名、数据结构或类名。

2. **清单版本过期检查**：将故事标头中嵌入的 `Manifest Version:` 日期
   与当前 `docs/architecture/control-manifest.md` 标头中的
   `Manifest Version:` 日期进行比较。
   - 如果两者匹配 → 静默通过。
   - 如果故事的版本较旧 → 标记为建议项：
     `ADVISORY: Story was written against manifest v[story-date]; current manifest
     is v[current-date]. New rules may apply. Run /story-readiness to check.`
   - 如果 control-manifest.md 不存在 → 跳过此检查。

3. **ADR 约束检查**：读取所引用 ADR 的“决策”部分。检查
   `docs/architecture/control-manifest.md` 中的禁用模式（如果该文件
   存在）。使用 `Grep` 查找 ADR 中明确禁止的模式。

4. **硬编码值检查**：使用 `Grep` 在已实现的文件中查找游戏逻辑中
   本应位于数据文件内的数值字面量。

5. **范围检查**：实现是否改动了故事所述范围之外的文件？
   （未列在“要创建/修改的文件”中的文件）

对于发现的每一项偏差，进行分类：

- **BLOCKING** — 实现与 GDD 或 ADR 相矛盾（必须修复后才能标记为完成）
- **ADVISORY** — 实现与规范略有偏离，但功能上等效（记录下来，由用户决定）
- **OUT OF SCOPE** — 改动了故事所述边界之外的其他文件（标记以供注意——可能合理，也可能属于范围蔓延）

---

## 阶段 4b：QA 覆盖率关卡

**审查模式检查** — 在启动 QL-TEST-COVERAGE 之前执行：
- `solo` → 跳过。注明：“QL-TEST-COVERAGE 已跳过 — 单人模式。”继续进入阶段 5。
- `lean` → 跳过（不是 PHASE-GATE）。注明：“QL-TEST-COVERAGE 已跳过 — 精简模式。”继续进入阶段 5。
- `full` → 正常启动。

完成阶段 4 的偏差检查后，通过 Task 启动 `qa-lead`，使用关卡 **QL-TEST-COVERAGE**（`.claude/docs/director-gates.md`）。

传入：
- 故事文件路径和故事类型
- 阶段 3 中找到的测试文件路径（精确路径，或“未找到”）
- 故事的 `## QA Test Cases` 章节（创建故事时预先编写的测试规范）
- 故事的 `## Acceptance Criteria` 列表

qa-lead 审查测试是否真正覆盖了规范中指定的内容，而不只是检查文件是否存在。

根据裁决执行：
- **ADEQUATE** → 继续进入阶段 5
- **GAPS** → 标记为 **ADVISORY**：“QA 负责人发现覆盖率缺口：[列表]。故事可以完成，但这些缺口应在后续故事中解决。”
- **INADEQUATE** → 标记为 **BLOCKING**：“QA 负责人：关键逻辑未经测试。在覆盖率得到改善之前，裁决不能为 COMPLETE。具体缺口：[列表]。”

对于配置/数据类故事，跳过此阶段（无需代码测试）。

---

## 阶段 5：首席程序员代码审查关卡

**审查模式检查** — 在启动 LP-CODE-REVIEW 之前执行：
- `solo` → 跳过。注明：“LP-CODE-REVIEW 已跳过 — 单人模式。”继续进入阶段 6（完成报告）。
- `lean` → 继续之前使用 `AskUserQuestion`：
  - 提示：“精简模式会跳过代码审查。你是否已对实现文件运行 `/code-review`？”
  - 选项：
    - `是 — /code-review 已通过或已获批准但附有建议`
    - `否 — 此故事跳过代码审查`
    - `否 — 我会在 Sprint 收尾前运行 /code-review`
  - 将回答记录在完成说明中（阶段 7）。所有三个选项均继续进入阶段 6。
- `full` → 正常启动。

通过 Task 启动 `lead-programmer`，使用关卡 **LP-CODE-REVIEW**（`.claude/docs/director-gates.md`）。

传入：实现文件路径、故事文件路径、相关 GDD 章节、适用的 ADR。

向用户展示裁决。如果裁决为 CONCERNS，则通过 `AskUserQuestion` 呈现：
- 选项：`修改标记的问题` / `接受并继续` / `进一步讨论`
如果裁决为 REJECT，在问题解决之前，不要继续执行阶段 6 的裁决。

如果故事尚无实现文件（在编码完成之前运行裁决），则跳过此阶段并注明：“LP-CODE-REVIEW 已跳过 — 未找到实现文件。请在实现完成后运行。”

---

## 阶段 6：提交完成报告

在更新任何文件之前，提交完整报告：

```markdown
## Story Done: [Story Name]
**Story**: [file path]
**Date**: [today]

### Acceptance Criteria: [X/Y passing]
- [x] [Criterion 1] — auto-verified (test passes)
- [x] [Criterion 2] — confirmed
- [ ] [Criterion 3] — FAILS: [reason]
- [?] [Criterion 4] — DEFERRED: requires playtest

### Test-Criterion Traceability
| Criterion | Test | Status |
|-----------|------|--------|
| AC-1: [text] | [test file::test name] | COVERED |
| AC-2: [text] | Manual confirmation | COVERED |
| AC-3: [text] | — | UNTESTED |

### Test Evidence
**Story Type**: [Logic | Integration | Visual/Feel | UI | Config/Data | Not declared]
**Required evidence**: [unit test file | integration test or playtest | screenshot + sign-off | walkthrough doc | smoke check pass]
**Evidence found**: [YES — `[path]` | NO — BLOCKING | NO — ADVISORY]

### Deviations
[NONE] OR:
- BLOCKING: [description] — [GDD/ADR reference]
- ADVISORY: [description] — user accepted / flagged for tech debt

### Scope
[All changes within stated scope] OR:
- Extra files touched: [list] — [note whether valid or scope creep]

### Verdict: COMPLETE / COMPLETE WITH NOTES / BLOCKED
```

**结论定义：**
- **COMPLETE**：所有标准均通过，且不存在阻断性偏差
- **COMPLETE WITH NOTES**：所有标准均通过，并且已记录建议性偏差
- **BLOCKED**：必须先解决未通过的标准或阻断性偏差

如果结论为 **BLOCKED**：不要继续执行阶段 7。列出必须修复的内容。主动提出帮助修复阻断项。

---

## 阶段 7：更新故事状态

在写入任何内容之前使用 `AskUserQuestion`：
- 提示："验证完成。你希望如何继续？"
- 选项：
  - `Close the story — update file, mark Complete, log notes (Recommended)`
  - `Close and log advisory deviations as tech debt in docs/tech-debt-register.md`
  - `There are issues I want to fix first — don't close yet`
  - `Accept deviations as-is and close anyway`

如果选择“关闭”“关闭并记录技术债”或“接受偏差”：编辑故事文件。
如果选择“关闭并记录技术债”：更新故事文件后，还要将建议性偏差追加到 `docs/tech-debt-register.md`（如果该文件不存在，则创建该文件）。
如果选择“先修复”：在此停止，并列出用户标记的问题。不要写入任何文件。

1. 更新状态字段：`Status: Complete`
2. 将故事标题部分中的 `Last Updated:` 字段更新为今天的日期（格式：`YYYY-MM-DD`）。如果该字段不存在，则将其添加到 `Status:` 行之后。
3. 在底部添加 `## Completion Notes` 部分：

```markdown
## Completion Notes
**Completed**: [date]
**Criteria**: [X/Y passing] ([any deferred items listed])
**Deviations**: [None] or [list of advisory deviations]
**Test Evidence**: [Logic: test file at path | Visual/Feel: evidence doc at path | None required (Config/Data)]
**Code Review**: [Pending / Complete / Skipped]
```

4. 如果用户选择了“关闭并记录技术债”：按以下格式将每项建议性偏差追加到 `docs/tech-debt-register.md`：
   ```
   - **[date]** ([story title]): [deviation description] — tracked from [story file path]
   ```
   如果该文件不存在，则创建该文件并添加 `# Tech Debt Register` 标题。

5. **更新 `production/sprint-status.yaml`**（如果存在）：
   - 找到与此故事的文件路径或 ID 匹配的条目
   - 设置 `status: done` 和 `completed: [today's date]`
   - 更新顶层 `updated` 字段
   - 这是静默更新——无需额外批准（已在上一步中批准）

6. **建议 git 提交**：输出一条可直接使用的提交命令，涵盖 dev-story 摘要中的实现文件以及已更新的故事文件：

```
Suggested commit:
git add [src/ and tests/ files changed during implementation] [story-file-path]
git commit -m "feat: [story title] ([TR-ID])"
```

`validate-commit.sh` 钩子将自动验证设计文档引用并检查硬编码值。

### 会话状态更新

更新故事文件后，静默追加以下内容到
`production/session-state/active.md`：

    ## Session Extract — /story-done [date]
    - Verdict: [COMPLETE / COMPLETE WITH NOTES / BLOCKED]
    - Story: [story file path] — [story title]
    - Tech debt logged: [N items, or "None"]
    - Next recommended: [next ready story title and path, or "None identified"]

如果 `active.md` 不存在，则创建该文件，并将此区块作为初始内容。
在对话中确认：“会话状态已更新。”

---

## 阶段 8：展示下一个故事

完成后，帮助开发者保持推进节奏：

1. 从 `production/sprints/` 读取当前冲刺计划。
2. 查找满足以下条件的故事：
   - 状态：READY 或 NOT STARTED
   - 未被其他未完成的故事阻塞
   - 位于 Must Have 或 Should Have 层级

展示：

```
### Next Up
The following stories are ready to pick up:
1. [Story name] — [1-line description] — Est: [X hrs]
2. [Story name] — [1-line description] — Est: [X hrs]

Run `/story-readiness [path]` to confirm a story is implementation-ready
before starting.
```

如果本次冲刺中已没有剩余的 Must Have 故事（均为 Complete 或 Blocked）：

```
### Sprint Close-Out Sequence

All Must Have stories are complete. QA sign-off is required before advancing.
Run these in order:

1. `/smoke-check sprint` — verify the critical path still works end-to-end
2. `/team-qa sprint` — full QA cycle: test case execution, bug triage, sign-off report
3. `/retrospective` — capture what went well, what didn't, and action items for the next sprint
4. `/gate-check` — advance to the next phase once QA approves (only if advancing a phase)
5. `/sprint-plan new` — plan the next sprint, incorporating velocity data and retrospective action items

Do not run `/gate-check` until `/team-qa` returns APPROVED or APPROVED WITH CONDITIONS.
```

如果仍有尚未开始的 Should Have 故事，请将它们与冲刺收尾流程一并展示，以便用户选择：立即结束冲刺，或先纳入更多工作。

如果已没有可开始的故事，但仍有 Must Have 故事处于 In Progress（而非 Complete）：
“已没有可开始的故事——仍有 [N] 个 Must Have 故事正在进行中。请继续实现这些故事，然后再进行冲刺收尾。”

---

## 协作协议

- **未经用户批准，绝不要将故事标记为已完成** — 阶段 7 要求在编辑任何文件之前获得明确的“是”。
- **绝不要自动修复未通过的标准** — 报告这些标准，并询问如何处理。
- **偏差是事实，而非判断** — 以中立方式呈现偏差；由用户决定它们是否可以接受。
- **BLOCKED 判定仅供参考** — 用户可以推翻该判定，仍将故事标记为已完成；如果用户这样做，请明确记录相关风险。
- 使用 `AskUserQuestion` 发起代码审查提示，并批量确认手动标准。

---

## 建议的后续步骤

- 运行 `/story-readiness [next-story-path]`，在开始实现之前验证下一个故事
- 如果所有 Must Have 故事均已完成：运行 `/smoke-check sprint` → `/team-qa sprint` → `/gate-check`
- 如果已记录技术债务：通过 `/tech-debt` 跟踪，以使登记表保持最新