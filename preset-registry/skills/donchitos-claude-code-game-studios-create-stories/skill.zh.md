---
name: create-stories
description: "Break a single epic into implementable story files. Reads the epic, its GDD, governing ADRs, and control manifest. Each story embeds its GDD requirement TR-ID, ADR guidance, acceptance criteria, story type, and test evidence path. Run after /create-epics for each epic."
argument-hint: "[epic-slug | epic-path] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Task, AskUserQuestion
model: sonnet
agent: lead-programmer
---
# 创建故事

故事是一个可独立实现的行为——规模应足够小，能够在一次专注的工作会话中完成，具备自包含性，并且可以完整追溯到一项 GDD 需求和一个 ADR 决策。故事是开发者实际领取并实施的工作。史诗则由架构师定义。

**请针对每个史诗运行一次此技能**，而不是针对每个层运行。首先为基础层史诗运行，
然后是核心层，依此类推——与依赖顺序保持一致。

**输出：** `production/epics/[epic-slug]/story-NNN-[slug].md` 文件

**上一步：** `/create-epics [system]`
**故事创建完成后的下一步：** `/story-readiness [story-path]`，然后运行 `/dev-story [story-path]`

---

## 1. 解析参数

如果存在 `--review [full|lean|solo]`，则提取它并存储为本次运行的审查模式
覆盖值。如果未提供，则读取 `production/review-mode.txt`
（如果缺失，默认为 `lean`）。解析出的模式适用于此技能中的所有关卡派生——
每次调用关卡之前，都应用 `.claude/docs/director-gates.md` 中的检查模式。

- `/create-stories [epic-slug]`——例如 `/create-stories combat`
- `/create-stories production/epics/combat/EPIC.md`——也接受完整路径
- 无参数——询问：“你想将哪个史诗拆分为故事？”
  对 `production/epics/*/EPIC.md` 执行 Glob，并列出可用的史诗及其状态。

---

## 2. 加载此史诗的全部内容

完整读取：

- `production/epics/[epic-slug]/EPIC.md`——史诗概述、管辖 ADR、GDD 需求表
- 此史诗的 GDD（`design/gdd/[filename].md`）——读取全部 8 个章节，尤其是验收标准、公式和边界情况
- 史诗中列出的所有管辖 ADR——读取决策、实施指南、引擎兼容性和引擎说明章节
- `docs/architecture/control-manifest.md`——提取适用于此史诗所在层的规则；记录文件头中的清单版本日期
- `docs/architecture/tr-registry.yaml`——加载此系统的所有 TR-ID

**ADR 存在性验证**：从史诗中读取管辖 ADR 列表后，确认每个 ADR 文件都存在于磁盘上。如果找不到任何 ADR 文件，请在拆分任何故事之前**立即停止**：

> “史诗引用了 [ADR-NNNN: title]，但未找到 `docs/architecture/[adr-file].md`。
> 请检查史诗的管辖 ADR 列表中的文件名，或运行 `/architecture-decision`
> 来创建该文件。在所有引用的 ADR 文件都存在之前，无法创建故事。”

在确认所有引用的 ADR 文件均存在之前，不要继续执行第 3 步。

报告：“已加载史诗 [name]、GDD [filename]、[N] 个管辖 ADR（均已确认存在）、控制清单 v[date]。”

---

## 3. 按类型对故事进行分类

**故事类型分类**——根据故事的验收标准为每个故事分配一种类型：

| 故事类型 | 当验收标准涉及以下内容时分配…… |
|---|---|
| **逻辑** | 公式、数值阈值、状态转换、AI 决策、计算 |
| **集成** | 两个或更多系统之间的交互、跨边界传递的信号、保存/加载往返过程 |
| **视觉/手感** | 动画行为、VFX、“响应灵敏的感觉”、时序、屏幕震动、音频同步 |
| **UI** | 菜单、HUD 元素、按钮、屏幕、对话框、工具提示 |
| **配置/数据** | 仅涉及平衡性调优值和数据文件变更——不包含新的代码逻辑 |

混合型故事：指定实现风险最高的类型。
该类型决定了在 `/story-done` 可以关闭故事之前需要哪些测试证据。

---

## 4. 将 GDD 分解为故事

对于每一项 GDD 验收标准：

1. 将需要相同核心实现的相关标准分为一组
2. 每组 = 一个故事
3. 故事排序：基础行为优先，边界情况其次，UI 最后

**故事规模规则：** 一个故事 = 一次专注的工作会话（约 2-4 小时）。如果一组标准需要更长时间，请将其拆分为两个故事。

对于每个故事，确定：
- **GDD 要求**：该故事满足哪些验收标准？
- **TR-ID**：在 `tr-registry.yaml` 中查找。使用稳定 ID。如果没有匹配项，则使用 `TR-[system]-???` 并发出警告。
- **主导 ADR**：哪个 ADR 规定了如何实现该故事？
  - `Status: Accepted` → 正常嵌入
  - `Status: Proposed` → 将故事设置为 `Status: Blocked`，并添加说明："BLOCKED: ADR-NNNN 处于 Proposed 状态 — 运行 `/architecture-decision` 以推进其状态"
  - **适用多个 ADR**：在故事的 `Governing ADRs:` 字段中列出所有主导 ADR。将最直接控制实现模式的 ADR 指定为主要 ADR（列在首位）。其他 ADR 列为次要参考。
  - **完全没有适用的 ADR**：在故事的 ADR 字段中写入 `ADR: N/A — [brief reason, e.g. "pure data configuration, no architectural pattern required"]`。不要将该字段留空——ADR 字段为空表示“未检查”，而不是“不适用”。
- **故事类型**：来自步骤 3 的分类
- **引擎风险**：来自 ADR 的 Knowledge Risk 字段

---

## 4b. QA 负责人故事就绪门禁

**审查模式检查**——在生成 QL-STORY-READY 之前应用：
- `solo` → 跳过。注明：“QL-STORY-READY 已跳过——Solo 模式。”继续执行步骤 5（展示故事以供审查）。
- `lean` → 跳过（不是 PHASE-GATE）。注明：“QL-STORY-READY 已跳过——Lean 模式。”继续执行步骤 5（展示故事以供审查）。
- `full` → 正常生成。

在分解完所有故事（步骤 4 完成）之后、展示这些故事以获得写入批准之前，通过 Task 生成 `qa-lead`，并使用门禁 **QL-STORY-READY**（`.claude/docs/director-gates.md`）。

传入：包含验收标准、故事类型和 TR-ID 的完整故事列表；Epic 的 GDD 验收标准，供参考。

展示 QA 负责人的评估。对于每个被标记为 GAPS 或 INADEQUATE 的故事，在继续之前修订其验收标准——具有不可测试标准的故事无法被正确实现。当所有故事均达到 ADEQUATE 后，继续执行。

**生成测试规范之前**：使用 Glob 查找 `production/qa/qa-plan-*.md` 中最近修改的文件。如果找到，请读取该文件，并检查它是否包含此 Epic 中故事的测试用例规范（在计划的 Automated Tests Required 部分中查找故事标题或 slug）。如果存在匹配的规范：
- 使用 `AskUserQuestion`：
  - 提示：“[path] 中存在一份 QA 计划，其中包含部分故事的测试规范。你希望如何继续？”
  - 选项：
    - `使用 QA 计划中的现有规范——将其嵌入故事文件（推荐）`
    - `要求 qa-lead 生成新规范——覆盖 QA 计划`
    - `跳过测试规范生成——我会手动填写 ## QA Test Cases`
- 如果选择“使用现有规范”：从 qa-plan 中提取每个匹配故事的测试用例规范，并将其直接嵌入 `## QA Test Cases` 部分。对于这些故事，无需生成 qa-lead。仅为 qa-plan 中未覆盖的故事生成 qa-lead。
- 如果选择“生成新规范”：按下文所述正常生成 qa-lead。
- 如果选择“跳过”：在 `## QA Test Cases` 中保留占位符：`*Test cases not yet defined — run /qa-plan to generate them.*`

**在 ADEQUATE 之后**（或导入 qa-plan 之后）：对于每个逻辑和集成故事，要求 qa-lead 按以下格式生成具体的测试用例规范——每条验收标准对应一个测试用例：

```
Test: [criterion text]
  Given: [precondition]
  When: [action]
  Then: [expected result / assertion]
  Edge cases: [boundary values or failure states to test]
```

对于视觉/体验和 UI 故事，改为生成手动验证步骤：
```
Manual check: [criterion text]
  Setup: [how to reach the state]
  Verify: [what to look for]
  Pass condition: [unambiguous pass description]
```

这些测试用例规范将直接嵌入每个故事的 `## QA Test Cases` 部分。开发者依据这些用例进行实现。程序员无需从头编写测试——QA 已经定义了“完成”的具体标准。

---

## 5. 提交故事以供审查

在写入任何文件之前，展示完整的故事列表：

```
## Stories for Epic: [name]

Story 001: [title] — Logic — ADR-NNNN
  Covers: TR-[system]-001 ([1-line summary of requirement])
  Test required: tests/unit/[system]/[slug]_test.[ext]

Story 002: [title] — Integration — ADR-MMMM
  Covers: TR-[system]-002, TR-[system]-003
  Test required: tests/integration/[system]/[slug]_test.[ext]

Story 003: [title] — Visual/Feel — ADR-NNNN
  Covers: TR-[system]-004
  Evidence required: production/qa/evidence/[slug]-evidence.md

[N stories total: N Logic, N Integration, N Visual/Feel, N UI, N Config/Data]
```

使用 `AskUserQuestion`：
- 提示："May I write these [N] stories to `production/epics/[epic-slug]/`?"
- 选项：`[A] Yes — write all [N] stories` / `[B] Not yet — I want to review or adjust first`

---

## 6. 写入故事文件

对于每个故事，写入 `production/epics/[epic-slug]/story-[NNN]-[slug].md`：

```markdown
# Story [NNN]: [title]

> **Epic**: [epic name]
> **Status**: Ready
> **Layer**: [Foundation / Core / Feature / Presentation]
> **Type**: [Logic | Integration | Visual/Feel | UI | Config/Data]
> **Estimate**: [hours or t-shirt size — fill before sprint planning]
> **Manifest Version**: [date from control-manifest.md header]
> **Last Updated**: [set by /dev-story when implementation begins]

## Context

**GDD**: `design/gdd/[filename].md`
**Requirement**: `TR-[system]-NNN`
*(Requirement text lives in `docs/architecture/tr-registry.yaml` — read fresh at review time)*

**ADR Governing Implementation**: [ADR-NNNN: title]
**ADR Decision Summary**: [1-2 sentence summary of what the ADR decided]

**Engine**: [name + version] | **Risk**: [LOW / MEDIUM / HIGH]
**Engine Notes**: [from ADR Engine Compatibility section — post-cutoff APIs, verification required]

**Control Manifest Rules (this layer)**:
- Required: [relevant required pattern]
- Forbidden: [relevant forbidden pattern]
- Guardrail: [relevant performance guardrail]

---

## Acceptance Criteria

*From GDD `design/gdd/[filename].md`, scoped to this story:*

- [ ] [criterion 1 — directly from GDD]
- [ ] [criterion 2]
- [ ] [performance criterion if applicable]

---

## Implementation Notes

*Derived from ADR-NNNN Implementation Guidelines:*

[Specific, actionable guidance from the ADR. Do not paraphrase in ways that
change meaning. This is what the programmer reads instead of the ADR.]

---

## Out of Scope

*Handled by neighbouring stories — do not implement here:*

- [Story NNN+1]: [what it handles]

---

## QA Test Cases

*Written by qa-lead at story creation. The developer implements against these — do not invent new test cases during implementation.*

**[For Logic / Integration stories — automated test specs]:**

- **AC-1**: [criterion text]
  - Given: [precondition]
  - When: [action]
  - Then: [assertion]
  - Edge cases: [boundary values / failure states]

**[For Visual/Feel / UI stories — manual verification steps]:**

- **AC-1**: [criterion text]
  - Setup: [how to reach the state]
  - Verify: [what to look for]
  - Pass condition: [unambiguous pass description]

---

## Test Evidence

**Story Type**: [type]
**Required evidence**:
- Logic: `tests/unit/[system]/[story-slug]_test.[ext]` — must exist and pass
- Integration: `tests/integration/[system]/[story-slug]_test.[ext]` OR playtest doc
- Visual/Feel: `production/qa/evidence/[story-slug]-evidence.md` + sign-off
- UI: `production/qa/evidence/[story-slug]-evidence.md` or interaction test
- Config/Data: smoke check pass (`production/qa/smoke-*.md`)

**Status**: [ ] Not yet created

---

## Dependencies

- Depends on: [Story NNN-1 must be DONE, or "None"]
- Unlocks: [Story NNN+1, or "None"]
```

### 同时更新 `production/epics/[epic-slug]/EPIC.md`

将「Stories: Not yet created」这一行替换为已填充的表格：

```markdown
## Stories

| # | Story | Type | Status | ADR |
|---|-------|------|--------|-----|
| 001 | [title] | Logic | Ready | ADR-NNNN |
| 002 | [title] | Integration | Ready | ADR-MMMM |
```

### 同时更新 `production/epics/index.md`

在索引表格中找到与此史诗匹配的行（按史诗名称或 slug）。将其 `Stories` 列从 `Not yet created` 更新为 `[N] stories`（其中 N 是刚刚写入的故事数量）。如果索引文件不存在，则静默跳过。

---

## 7. 写入之后

使用 `AskUserQuestion`，结合上下文提供后续步骤以结束流程：

检查：
- `production/epics/` 中是否还有尚未创建故事的其他史诗？将它们列出。
- 这是最后一个史诗吗？如果是，将 `/sprint-plan` 作为一个选项。

组件：
- 提示："已将 [N] 个故事写入 `production/epics/[epic-slug]/`。下一步做什么？"
- 选项（包括所有适用项）：
  - `[A] 开始实施 — 运行 /story-readiness [first-story-path]`（推荐）
  - `[B] 为 [next-epic-slug] 创建故事 — 运行 /create-stories [slug]`（仅当其他史诗尚未创建故事时）
  - `[C] 规划冲刺 — 运行 /sprint-plan new`（仅当所有史诗都已有故事时）
  - `[D] 在此结束本次会话`

在输出中注明："按顺序处理故事——每个故事的 `Depends on:` 字段会告诉你，在开始该故事之前哪些内容必须处于 DONE 状态。"

---

## 协作协议

1. **先阅读再展示**——在显示故事列表之前，静默加载所有输入
2. **只询问一次**——在一份摘要中展示该史诗的所有故事，而不是逐个展示
3. **对受阻故事发出警告**——写入之前，标记所有包含 Proposed ADR 的故事
4. **写入前先询问**——在写入文件之前，获得对完整故事集的批准
5. **不得虚构**——验收标准来自 GDD，实施说明来自 ADR，规则来自 manifest
6. **绝不开始实施**——此技能止于故事文件层级

写入后（或用户拒绝后）：

- **结论：COMPLETE**——已将 [N] 个故事写入 `production/epics/[epic-slug]/`。运行 `/story-readiness` → `/dev-story` 以开始实施。
- **结论：BLOCKED**——用户已拒绝。未写入任何故事文件。