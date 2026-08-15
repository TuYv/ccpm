---
name: adopt
description: "Brownfield onboarding — audits existing project artifacts for template format compliance (not just existence), classifies gaps by impact, and produces a numbered migration plan. Run this when joining an in-progress project or upgrading from an older template version. Distinct from /project-stage-detect (which checks what exists) — this checks whether what exists will actually work with the template's skills."
argument-hint: "[focus: full | gdds | adrs | stories | infra]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, AskUserQuestion
model: sonnet
agent: technical-director
---
# 采用 — 现有项目模板适配

此技能会审核现有项目的工件是否**符合模板技能流水线的格式要求**，然后生成一份按优先级排序的迁移计划。

**这不是 `/project-stage-detect`。**
`/project-stage-detect` 回答：*存在哪些内容？*
`/adopt` 回答：*现有内容能否真正与模板的技能协同工作？*

一个项目可以拥有 GDD、ADR 和故事——但如果这些工件的内部格式不正确，所有对格式敏感的技能仍会静默失败或产生错误结果。

**输出：** `docs/adoption-plan-[date].md` — 一份持久保存、可检查的迁移计划。

**参数模式：**

**审核模式：** `$ARGUMENTS[0]`（留空 = `full`）

- **无参数 / `full`**：完整审核——涵盖所有工件类型
- **`gdds`**：仅检查 GDD 格式合规性
- **`adrs`**：仅检查 ADR 格式合规性
- **`stories`**：仅检查故事格式合规性
- **`infra`**：仅检查基础设施工件缺失情况（注册表、清单、冲刺状态、stage.txt）

---

## 阶段 1：检测项目状态

读取前先输出一行：`"正在扫描项目工件..."`——这用于确认技能正在静默读取阶段运行。

然后静默读取，之后再呈现其他任何内容。

### 存在性检查
- `production/stage.txt` — 如果存在，则读取它（作为权威阶段信息）
- `design/gdd/game-concept.md` — 概念是否存在？
- `design/gdd/systems-index.md` — 系统索引是否存在？
- 统计 GDD 文件：`design/gdd/*.md`（不包括 game-concept.md 和 systems-index.md）
- 统计 ADR 文件：`docs/architecture/adr-*.md`
- 统计故事文件：`production/epics/**/*.md`（不包括 EPIC.md）
- `.claude/docs/technical-preferences.md` — 是否已配置引擎？
- `docs/engine-reference/` — 是否存在引擎参考文档？
- 使用 Glob 匹配 `docs/adoption-plan-*.md` — 如果存在之前的计划，记录最近一份计划的文件名

### 推断阶段（如果没有 stage.txt）
使用与 `/project-stage-detect` 相同的启发式规则：
- `src/` 中有 10 个以上源文件 → 生产
- `production/epics/` 中有故事 → 前期制作
- 存在 ADR → 技术设置
- 存在 systems-index.md → 系统设计
- 存在 game-concept.md → 概念
- 什么都没有 → 全新项目（不是现有项目——建议使用 `/start`）

如果项目看起来是全新的（完全没有工件），使用 `AskUserQuestion`：
- "这看起来是一个全新项目——未找到任何现有工件。`/adopt` 适用于有工作成果需要迁移的项目。你希望怎么做？"
  - "运行 `/start`——开始首次引导式设置"
  - "我的工件位于非标准位置——帮我找到它们"
  - "取消"

然后停止——无论用户选择哪个选项，都不要继续审核（每个选项都会转至不同的技能或手动调查）。

报告："检测到的阶段：[phase]。找到：[N] 个 GDD、[M] 个 ADR、[P] 个故事。"

---

## 阶段 2：格式审核

对于范围内的每种工件类型（根据参数模式确定），不仅要检查文件是否存在，还要检查它是否包含模板要求的内部结构。

### 2a：GDD 格式审核

对于找到的每个 GDD 文件，通过扫描标题检查是否包含 8 个必需章节：

| 必需章节 | 要查找的标题模式 |
|---|---|
| 概述 | `## Overview` |
| 玩家幻想 | `## Player Fantasy` |
| 详细规则 / 设计 | `## Detailed` 或 `## Core Rules` 或 `## Detailed Design` |
| 公式 | `## Formulas` 或 `## Formula` |
| 边界情况 | `## Edge Cases` |
| 依赖项 | `## Dependencies` 或 `## Depends` |
| 调优参数 | `## Tuning` |
| 验收标准 | `## Acceptance` |

对于每个 GDD，记录：
- 存在哪些章节
- 缺少哪些章节
- 已存在的章节中是否包含任何内容，还是只有占位文本
  （`[To be designed]` 或等效文本）

还要检查：每个 GDD 的头部块中是否都有 `**Status**:` 字段？
有效值：`In Design`、`Designed`、`In Review`、`Approved`、`Needs Revision`。

### 2b：ADR 格式审计

对于找到的每个 ADR 文件，检查以下关键章节：

| 章节 | 缺失时的影响 |
|---|---|
| `## Status` | **阻塞性** — `/story-readiness` 的 ADR 状态检查会悄无声息地让所有内容通过 |
| `## ADR Dependencies` | 高 — `/architecture-review` 中的依赖项排序会失效 |
| `## Engine Compatibility` | 高 — 截止日期之后的 API 风险未知 |
| `## GDD Requirements Addressed` | 中 — 可追溯性矩阵会丢失覆盖范围 |
| `## Performance Implications` | 低 — 对流水线并非关键 |

对于每个 ADR，记录：存在哪些章节、缺少哪些章节，以及在 Status 章节存在时的当前 Status 值。

### 2c：systems-index.md 格式审计

如果 `design/gdd/systems-index.md` 存在：

1. **带括号的状态值** — 使用 Grep 查找任何包含括号的 Status 单元格：
   `"Needs Revision ("`、`"In Progress ("` 等。
   这些值会破坏 `/gate-check`、`/create-stories`
   和 `/architecture-review` 中的精确字符串匹配。**阻塞性。**

2. **有效状态值** — 检查 Status 列的值是否仅来自：
   `Not Started`、`In Progress`、`In Review`、`Designed`、`Approved`、`Needs Revision`
   标记所有无法识别的值。

3. **列结构** — 检查表格是否至少包含：系统名称、
   层级、优先级、Status 列。缺少列会削弱 Skill 的功能。

### 2d：故事格式审计

对于找到的每个故事文件：

- **`Manifest Version:` 字段** — 是否存在于故事头部？（低 — 缺失时自动通过）
- **TR-ID 引用** — 故事是否包含 `TR-[a-z]+-[0-9]+` 模式？（中 — 无法跟踪过时情况）
- **ADR 引用** — 故事是否引用了至少一个 ADR？（检查 `ADR-` 模式）
- **Status 字段** — 是否存在且可读取？
- **验收标准** — 故事是否包含复选框列表（`- [ ]`）？

### 2e：基础设施审计

| 工件 | 路径 | 缺失时的影响 |
|---|---|---|
| TR 注册表 | `docs/architecture/tr-registry.yaml` | 高 — 没有稳定的需求 ID |
| 控制清单 | `docs/architecture/control-manifest.md` | 高 — 故事没有层级规则 |
| 清单版本戳 | 清单头部中的 `Manifest Version:` | 中 — 无法进行过时检查 |
| Sprint 状态 | `production/sprint-status.yaml` | 中 — `/sprint-status` 会回退到 Markdown |
| 阶段文件 | `production/stage.txt` | 中 — 阶段自动检测不可靠 |
| 引擎参考 | `docs/engine-reference/[engine]/VERSION.md` | 高 — ADR 引擎检查失去依据 |
| 架构可追溯性 | `docs/architecture/architecture-traceability.md` | 中 — 没有持久化矩阵 |

### 2f：技术偏好审计

阅读 `.claude/docs/technical-preferences.md`。检查每个字段是否为 `[TO BE CONFIGURED]`：
- Engine、Language、Rendering、Physics → 如果未配置，则为 HIGH（ADR 技能会失败）
- Naming conventions → MEDIUM
- Performance budgets → MEDIUM
- Forbidden Patterns、Allowed Libraries → LOW（按设计初始为空）

---

## 阶段 3：分类并确定缺口优先级

将所有审计中发现的每个缺口划分到以下四个严重级别中：

**BLOCKING** — 会导致模板技能*立即*在无提示的情况下生成错误结果。
示例：ADR 缺少 Status 字段、systems-index 使用括号形式的状态值、
已有 ADR 但尚未配置引擎。

**HIGH** — 会导致生成的故事缺少安全检查，或基础设施引导失败。
示例：ADR 缺少 Engine Compatibility、GDD 缺少 Acceptance Criteria
（无法根据它们生成故事）、缺少 tr-registry.yaml。

**MEDIUM** — 会降低质量和流水线跟踪能力，但不会破坏功能。
示例：GDD 缺少 Tuning Knobs 或 Formulas 章节、故事缺少 TR-ID、
缺少 sprint-status.yaml。

**LOW** — 适合追溯性改进，但并不紧急。
示例：故事缺少 Manifest Version 标记、GDD 缺少 Open Questions 章节。

统计每个级别的总数。如果 BLOCKING 和 HIGH 缺口均为零：报告该项目
与模板兼容，仅剩建议性改进。

---

## 阶段 4：制定迁移计划

编写一份带编号且有序的行动计划。排序规则：
1. BLOCKING 缺口优先（必须先修复，任何流水线技能才能可靠运行）
2. HIGH 缺口其次，基础设施优先于 GDD/ADR 内容（引导过程需要正确的格式）
3. MEDIUM 缺口按以下顺序排列：GDD 缺口先于 ADR 缺口，ADR 缺口先于故事缺口（故事依赖 GDD 和 ADR）
4. LOW 缺口最后

对于每个缺口，生成一个计划条目，其中包含：
- 清晰的问题陈述（一句话，不使用术语）
- 如果某个技能可以处理，则提供用于修复问题的确切命令
- 如果需要直接编辑，则提供手动操作步骤
- 时间估算（粗略：5 分钟 / 30 分钟 / 1 个会话）
- 用于跟踪的复选框 `- [ ]`

**特殊情况 — systems-index 使用括号形式的状态值：**
如果存在此问题，它始终是第一项。显示需要更改的确切值
以及确切的替换文本。在编写计划之前，提议立即修复此问题。

**特殊情况 — ADR 缺少 Status 字段：**
对于每个受影响的 ADR，修复命令为：
`/architecture-decision retrofit docs/architecture/adr-[NNNN]-[slug].md`
将每个 ADR 分别列为一个可勾选的条目。

**特殊情况 — GDD 缺少章节：**
对于每个受影响的 GDD，列出缺少的章节以及修复命令：
`/design-system retrofit design/gdd/[filename].md`

**基础设施引导顺序** — 始终按以下顺序执行：
1. 首先修复 ADR 格式（注册表依赖读取 ADR Status 字段）
2. 运行 `/architecture-review` → 引导创建 `tr-registry.yaml`
3. 运行 `/create-control-manifest` → 创建带有版本标记的清单
4. 运行 `/sprint-plan update` → 创建 `sprint-status.yaml`
5. 运行 `/gate-check [phase]` → 以权威方式写入 `stage.txt`

**现有故事** — 请明确注明：
> “现有故事仍可继续与所有模板技能配合使用——当相应字段不存在时，所有新的格式
> 检查都会自动通过。在重新生成之前，它们无法受益于 TR-ID
> 过时状态跟踪或清单版本检查。这是有意为之：不要重新生成已经在进行中的故事。”

---

## 阶段 5：展示摘要并询问是否写入

写入之前，先展示一份简洁的摘要：

```
## Adoption Audit Summary
Phase detected: [phase]
Engine: [configured / NOT CONFIGURED]
GDDs audited: [N] ([X] fully compliant, [Y] with gaps)
ADRs audited: [N] ([X] fully compliant, [Y] with gaps)
Stories audited: [N]

Gap counts:
  BLOCKING: [N] — template skills will malfunction without these fixes
  HIGH:     [N] — unsafe to run /create-stories or /story-readiness
  MEDIUM:   [N] — quality degradation
  LOW:      [N] — optional improvements

Estimated remediation: [X blocking items × ~Y min each = roughly Z hours]
```

在询问是否写入之前，展示一个**差距预览**：
- 将每个 BLOCKING 差距列为一条单行项目符号，描述实际问题
  （例如 `systems-index.md: 3 rows have parenthetical status values`、
  `adr-0002.md: missing ## Status section`）。不要只显示数量——应展示实际项目。
- HIGH / MEDIUM / LOW 只显示数量（例如 `HIGH: 4, MEDIUM: 2, LOW: 1`）。

这样，用户在决定是否写入文件之前，就能获得足够的上下文来判断工作范围。

如果在阶段 1 中检测到先前的采用计划，请添加说明：
> “先前的计划位于 `docs/adoption-plan-[prior-date].md`。新计划将
> 反映项目的当前状态——它不会与上一次运行的结果进行差异比较。”

使用 `AskUserQuestion`：
- “准备好写入迁移计划了吗？”
  - “是——写入 `docs/adoption-plan-[date].md`”
  - “先向我展示完整的计划预览（暂时不要写入）”
  - “取消——我会手动处理迁移”

如果用户选择“先向我展示完整的计划预览”，请将完整计划输出为一个带围栏的 Markdown 代码块。然后使用相同的三个选项再次询问。

---

## 阶段 6：写入采用计划

如果获得批准，则按照以下结构写入 `docs/adoption-plan-[date].md`：

```markdown
# Adoption Plan

> **Generated**: [date]
> **Project phase**: [phase]
> **Engine**: [name + version, or "Not configured"]
> **Template version**: v1.0+

Work through these steps in order. Check off each item as you complete it.
Re-run `/adopt` anytime to check remaining gaps.

---

## Step 1: Fix Blocking Gaps

[One sub-section per blocking gap with problem, fix command, time estimate, checkbox]

---

## Step 2: Fix High-Priority Gaps

[One sub-section per high gap]

---

## Step 3: Bootstrap Infrastructure

### 3a. Register existing requirements (creates tr-registry.yaml)
Run `/architecture-review` — even if ADRs already exist, this run bootstraps
the TR registry from your existing GDDs and ADRs.
**Time**: 1 session (review can be long for large codebases)
- [ ] tr-registry.yaml created

### 3b. Create control manifest
Run `/create-control-manifest`
**Time**: 30 min
- [ ] docs/architecture/control-manifest.md created

### 3c. Create sprint tracking file
Run `/sprint-plan update`
**Time**: 5 min (if sprint plan already exists as markdown)
- [ ] production/sprint-status.yaml created

### 3d. Set authoritative project stage
Run `/gate-check [current-phase]`
**Time**: 5 min
- [ ] production/stage.txt written

---

## Step 4: Medium-Priority Gaps

[One sub-section per medium gap]

---

## Step 5: Optional Improvements

[One sub-section per low gap]

---

## What to Expect from Existing Stories

Existing stories continue to work with all template skills. New format checks
(TR-ID validation, manifest version staleness) auto-pass when the fields are
absent — so nothing breaks. They won't benefit from staleness tracking until
regenerated. Do not regenerate stories that are in progress or done.

---

## Re-run

Run `/adopt` again after completing Step 3 to verify all blocking and high gaps
are resolved. The new run will reflect the current state of the project.
```

---

## 阶段 6b：设置审查模式

编写采用计划后（或者如果用户取消编写），检查
`production/review-mode.txt` 是否存在。

**如果存在**：读取该文件并注明当前模式——“审查模式已设置为 `[current]`。”——跳过提示。

**如果不存在**：使用 `AskUserQuestion`：

- **提示**：“再完成一个设置步骤：在执行工作流的过程中，你希望进行多少设计审查？”
- **选项**：
  - `Full` — 由总监专家在工作流的每个关键步骤进行审查。最适合团队、正在学习工作流的情况，或希望针对每项决策获得全面反馈时使用。
  - `Lean (recommended)` — 仅在阶段关卡转换（/gate-check）时由总监进行审查。跳过针对每项技能的审查。适合独立开发者和小型团队的平衡之选。
  - `Solo` — 完全不进行总监审查。速度最快。最适合游戏开发马拉松、原型项目，或认为审查会带来额外负担的情况。

选择后立即将对应内容写入 `production/review-mode.txt`——无需另行询问“我可以写入吗？”：
- `Full` → 写入 `full`
- `Lean (recommended)` → 写入 `lean`
- `Solo` → 写入 `solo`

如果 `production/` 目录不存在，则创建该目录。

---

## 阶段 7：提供第一个操作

编写计划后，不要就此停止。选择优先级最高的单个缺口，并使用 `AskUserQuestion` 提议立即处理。选择第一个符合条件的分支：

**如果 systems-index.md 中存在带括号的状态值：**
使用 `AskUserQuestion`：
- “最紧急的修复项是 `systems-index.md`——有 [N] 行包含带括号的状态值
  （例如 `Needs Revision (see notes)`），这会导致 /gate-check、
  /create-stories 和 /architecture-review 目前无法正常工作。我可以直接在原文件中修复这些值。”
  - “立即修复——编辑 systems-index.md”
  - “我会自行修复”
  - “完成——只需给我留下计划”

**如果 ADR 缺少 `## Status`（且不存在带括号状态值的问题）：**
使用 `AskUserQuestion`：
- “最紧急的修复项是为 [N] 个 ADR 添加 `## Status`：[列出文件名]。
  如果缺少该部分，/story-readiness 会在不发出提示的情况下让所有 ADR 检查通过。是否从
  [第一个受影响的文件名] 开始？”
  - “是——立即改造 [第一个受影响的文件名]”
  - “逐个改造全部 [N] 个 ADR”
  - “我会自行处理 ADR”

**如果 GDD 缺少验收标准（且不存在上述阻塞问题）：**
使用 `AskUserQuestion`：
- “最紧急的缺口是 [N] 个 GDD 缺少验收标准：
  [列出文件名]。如果缺少这些标准，/create-stories 将无法生成故事。
  是否从 [优先级最高的 GDD 文件名] 开始？”
  - “是——立即为 [GDD 文件名] 添加验收标准”
  - “逐个处理全部 [N] 个 GDD”
  - “我会自行处理 GDD”

**如果不存在 BLOCKING 或 HIGH 级别的缺口：**
使用 `AskUserQuestion`：
- “没有阻塞性缺口——此项目与模板兼容。接下来做什么？”
  - “引导我完成中等优先级的改进”
  - “运行 /project-stage-detect 以执行更广泛的健康检查”
  - “完成——我会按自己的节奏执行计划”

> **采用计划已保存到 `docs/adoption-plan-[date].md`。** 在完成各项工作后，可随时重新运行 `/adopt` 以重新检查剩余缺口。

---

## 协作协议

1. **静默阅读**——完成全面审计后再展示任何内容
2. **先展示摘要**——在询问是否编写之前，让用户了解范围
3. **编写前询问**——创建采用计划文件之前，始终先征得确认
4. **提供建议，而非强制执行**——计划仅供参考；由用户决定修复哪些内容以及何时修复
5. **一次执行一个操作**——移交计划后，只提供一个明确的后续步骤，
   而不是同时列出六项待办事项
6. **绝不重新生成现有产物**——只填补现有内容中的空缺；
   不要重写已经包含内容的 GDD、ADR 或故事