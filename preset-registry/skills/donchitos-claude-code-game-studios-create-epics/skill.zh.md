---
name: create-epics
description: "Translate approved GDDs + architecture into epics — one epic per architectural module. Defines scope, governing ADRs, engine risk, and untraced requirements. Does NOT break into stories — run /create-stories [epic-slug] after each epic is created."
argument-hint: "[system-name | layer: foundation|core|feature|presentation | all] [--review full|lean|solo]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Task, AskUserQuestion
model: sonnet
agent: technical-director
---
# 创建史诗

史诗是一个有名称、有明确边界的工作单元，对应一个架构模块。
它定义了**需要构建什么**以及**在架构上由谁负责**。它不规定实现步骤——那是故事的职责。

在开发推进到每一层时，**针对该层运行一次此技能**。
在核心层接近完成之前，不要创建功能层史诗——设计仍会发生变化。

**输出：** `production/epics/[epic-slug]/EPIC.md` + `production/epics/index.md`

**每个史诗完成后的下一步：** `/create-stories [epic-slug]`

**运行时机：** 在 `/create-control-manifest` 和 `/architecture-review` 通过后。

---

## 1. 解析参数

确定审查模式（仅确定一次，并存储下来，供本次运行产生的所有关卡使用）：
1. 如果传入了 `--review [full|lean|solo]` → 使用该模式
2. 否则读取 `production/review-mode.txt` → 使用其中的值
3. 否则 → 默认为 `lean`

完整的检查模式请参阅 `.claude/docs/director-gates.md`。

**模式：**
- `/create-epics all` — 按层级顺序处理所有系统
- `/create-epics layer: foundation` — 仅处理基础层
- `/create-epics layer: core` — 仅处理核心层
- `/create-epics layer: feature` — 仅处理功能层
- `/create-epics layer: presentation` — 仅处理表现层
- `/create-epics [system-name]` — 处理一个指定系统
- 无参数 — 询问：“你想为哪个层或系统创建史诗？”

---

## 2. 加载输入

### 步骤 2a — 摘要扫描（快速）

在完整阅读任何内容之前，先从所有 GDD 中检索其 `## Summary` 部分：

```
Grep pattern="## Summary" glob="design/gdd/*.md" output_mode="content" -A 5
```

对于 `layer:` 或 `[system-name]` 模式：根据摘要快速参考，仅筛选范围内的 GDD。跳过对任何范围外内容的完整阅读。

### 步骤 2b — 加载完整文档（仅限范围内的系统）

使用步骤 2a 的检索结果，确定哪些系统在范围内。**仅完整阅读范围内系统**的文档——不要阅读范围外系统或层的 GDD 或 ADR。

针对范围内的系统，阅读：

- `design/gdd/systems-index.md` — 权威的系统列表、层级和优先级
- 仅限范围内的 GDD（状态为已批准或已设计，并根据步骤 2a 的结果进行筛选）
- `docs/architecture/architecture.md` — 模块所有权和 API 边界
- **仅限领域涵盖范围内系统**的已接受 ADR——阅读“已处理的 GDD 需求”“决策”和“引擎兼容性”部分；跳过与当前范围无关领域的 ADR
- `docs/architecture/control-manifest.md` — 标头中的清单版本日期
- `docs/architecture/tr-registry.yaml` — 用于追踪需求的 ADR 覆盖情况
- `docs/engine-reference/[engine]/VERSION.md` — 引擎名称、版本和风险级别

报告：“已加载 [N] 个 GDD、[M] 个 ADR，引擎：[名称 + 版本]。”

---

## 3. 处理顺序

按照依赖安全的层级顺序处理：
1. **基础层**（无依赖）
2. **核心层**（依赖基础层）
3. **功能层**（依赖核心层）
4. **表现层**（依赖功能层和核心层）

在每一层中，使用 `systems-index.md` 中的顺序。

---

## 4. 定义每个 Epic

对于每个系统，将其映射到 `architecture.md` 中的一个架构模块。

根据 TR 注册表检查 ADR 覆盖情况：
- **已追踪的需求**：已有 Accepted ADR 覆盖的 TR-ID
- **未追踪的需求**：没有 ADR 的 TR-ID——继续前发出警告

在写入任何内容之前，向用户展示：

```
## Epic: [System Name]

**Layer**: [Foundation / Core / Feature / Presentation]
**GDD**: design/gdd/[filename].md
**Architecture Module**: [module name from architecture.md]
**Governing ADRs**: [ADR-NNNN, ADR-MMMM]
**Engine Risk**: [LOW / MEDIUM / HIGH — highest risk among governing ADRs]
**GDD Requirements Covered by ADRs**: [N / total]
**Untraced Requirements**: [list TR-IDs with no ADR, or "None"]
```

如果存在未追踪的需求：
> "⚠️ [system] 中有 [N] 项需求没有 ADR。可以创建该 Epic，但
> 这些需求对应的 Story 将被标记为 Blocked，直至 ADR 建立。
> 请先运行 `/architecture-decision`，或使用占位内容继续。"

使用 `AskUserQuestion`：
- 提示："是否创建 Epic：[name]？"
- 选项：
  - `[A] Yes, create it`
  - `[B] Skip this epic`
  - `[C] Pause — I need to write ADRs first`

---

## 4b. 制作人 Epic 结构门禁

**审查模式检查**——在生成 PR-EPIC 之前应用：
- `solo` → 跳过。注明："已跳过 PR-EPIC——Solo 模式。"继续执行步骤 5（写入 Epic 文件）。
- `lean` → 跳过（不是 PHASE-GATE）。注明："已跳过 PR-EPIC——Lean 模式。"继续执行步骤 5（写入 Epic 文件）。
- `full` → 正常生成。

当前层级的所有 Epic 定义完成后（即已针对范围内的所有系统完成步骤 4），并且在写入任何文件之前，通过 Task 使用门禁 **PR-EPIC**（`.claude/docs/director-gates.md`）生成 `producer`。

传入：完整的 Epic 结构摘要（所有 Epic、各自的范围摘要、管辖 ADR 数量）、当前处理的层级、里程碑时间线和团队产能。

展示制作人的评估结果。

如果结果为 UNREALISTIC：提议调整 Epic 边界（拆分范围过大的 Epic 或合并范围过小的 Epic）。修改后，在写入之前重新运行门禁。

如果结果为 CONCERNS，使用 `AskUserQuestion`：
- 提示："制作人对 Epic 结构提出了疑虑。你希望如何继续？"
- 选项：
  - `[A] Proceed as planned — I accept the producer's concerns`
  - `[B] Revise epic boundaries — split or merge as recommended`
  - `[C] Stop — I want to reconsider the scope`

如果选择 [A]：继续执行步骤 5。
如果选择 [B]：修改步骤 4 中的 Epic 定义，并重新运行制作人门禁。
如果选择 [C]：停止。结论：**BLOCKED**——用户希望重新考虑 Epic 范围。

在制作人门禁得出明确结果之前，不要写入 Epic 文件。

---

## 5. 写入 Epic 文件

获得批准后，询问："我可以将 Epic 文件写入 `production/epics/[epic-slug]/EPIC.md` 吗？"

用户确认后，写入：

### `production/epics/[epic-slug]/EPIC.md`

```markdown
# Epic: [System Name]

> **Layer**: [Foundation / Core / Feature / Presentation]
> **GDD**: design/gdd/[filename].md
> **Architecture Module**: [module name]
> **Status**: Ready
> **Stories**: Not yet created — run `/create-stories [epic-slug]`

## Overview

[1 paragraph describing what this epic implements, derived from the GDD Overview
and the architecture module's stated responsibilities]

## Governing ADRs

| ADR | Decision Summary | Engine Risk |
|-----|-----------------|-------------|
| ADR-NNNN: [title] | [1-line summary] | LOW/MEDIUM/HIGH |

## GDD Requirements

| TR-ID | Requirement | ADR Coverage |
|-------|-------------|--------------|
| TR-[system]-001 | [requirement text from registry] | ADR-NNNN ✅ |
| TR-[system]-002 | [requirement text] | ❌ No ADR |

## Definition of Done

This epic is complete when:
- All stories are implemented, reviewed, and closed via `/story-done`
- All acceptance criteria from `design/gdd/[filename].md` are verified
- All Logic and Integration stories have passing test files in `tests/`
- All Visual/Feel and UI stories have evidence docs with sign-off in `production/qa/evidence/`

## Next Step

Run `/create-stories [epic-slug]` to break this epic into implementable stories.
```

### 更新 `production/epics/index.md`

创建或更新主索引：

```markdown
# Epics Index

Last Updated: [date]
Engine: [name + version]

| Epic | Layer | System | GDD | Stories | Status |
|------|-------|--------|-----|---------|--------|
| [name] | Foundation | [system] | [file] | Not yet created | Ready |
```

---

## 6. 门禁检查提醒

为请求范围编写完所有史诗后：

- **基础层 + 核心层已完成**：这些是通过预制作 →
  制作门禁的必要条件。运行 `/gate-check production` 检查就绪状态。
- **提醒**：史诗定义范围。故事定义实施步骤。在开发人员可以开始处理工作之前，请为每个史诗运行
  `/create-stories [epic-slug]`。

---

## 协作协议

1. **一次处理一个史诗** — 在询问是否创建之前，先展示每个史诗的定义
2. **发现缺口时发出警告** — 在继续之前标记无法追溯的需求
3. **写入前先询问** — 写入任何文件之前，逐个获得史诗审批
4. **不得杜撰** — 所有内容均来自 GDD、ADR 和架构文档
5. **绝不创建故事** — 此技能止步于史诗层级

处理完所有请求的史诗后：

- **判定：COMPLETE** — 已写入 [N] 个史诗。为每个史诗运行 `/create-stories [epic-slug]`。
- **判定：BLOCKED** — 用户拒绝了所有史诗，或未找到符合条件的系统。