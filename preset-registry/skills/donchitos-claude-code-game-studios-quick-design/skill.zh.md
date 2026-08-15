---
name: quick-design
description: "Lightweight design spec for small changes — tuning adjustments, minor mechanics, balance tweaks. Skips full GDD authoring when a system GDD already exists or the change is too small to warrant one. Produces a Quick Design Spec that embeds directly into story files."
argument-hint: "[brief description of the change]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Edit, AskUserQuestion
model: sonnet
---
# 快速设计

这是适用于不需要完整 GDD 的改动的**轻量级设计路径**。
通过 `/design-system` 编写完整 GDD 是重量级路径。对于实现工作量约在 4 小时以内的工作，请使用此技能——包括数值调优、
轻微的行为调整、对现有系统的小幅扩展，或规模太小、不值得编写完整文档的
独立功能。

**输出：** `design/quick-specs/[name]-[date].md`

**何时运行：** 当改动规模太小、不适合使用 `/design-system`，但又非常重要，
不能在没有书面依据的情况下直接实现时。

---

## 1. 对改动进行分类

首先，阅读参数并确定此改动属于以下哪个类别：

- **数值调优**——仅更改现有系统中的数值或平衡参数，不涉及任何
  行为变化（最精简的路径）。示例：“将跳跃高度从 5
  个单位提高到 6 个单位”“将敌人的巡逻速度降低 10%”。
- **微调**——对现有系统进行小幅行为改动，但不引入任何
  新状态、分支或系统。示例：“使冲刺在第 1 帧具有无敌效果”、
  “允许连击取消并衔接翻滚”。
- **扩展**——向现有系统添加一个小型机制，可能引入
  1-2 个新状态或交互。示例：“为格挡
  机制添加招架判定窗口”“为普通攻击添加蓄力变体”。
- **小型新系统**——规模足够小的独立功能，没有
  现有 GDD，且实现工作量约在一周以内。
  示例：“成就弹窗系统”“简单的昼夜视觉循环”。

如果改动不符合这些类别——例如，它引入了一个具有
大量跨系统依赖关系的新系统、需要一周以上的
实现时间，或者从根本上改变了现有系统的核心规则——请停止
并改为引导用户使用 `/design-system`。

如果没有参数，请用户描述该改动（纯文本提示），然后使用上述标准对其进行分类。

使用 `AskUserQuestion` 展示推断出的分类：
- 提示：“我已将其分类为**[推断类型]**——[简要原因]。是否正确？”
- 选项：
  - `[A] 是——[推断类型]正确`
  - `[B] 数值调优——仅更改数值或平衡参数`
  - `[C] 微调——对现有系统进行小幅行为改动`
  - `[D] 扩展——向现有系统添加一个小型机制`
  - `[E] 小型新系统——独立功能，工作量在一周以内`
  - `[F] 此改动规模过大——将我引导至 /design-system`

如果选择 [F]：停止。结论：**已重定向**——对此改动使用 `/design-system`。
否则：按照所选类型继续。

---

## 2. 上下文扫描

在起草任何内容之前，阅读相关上下文：

- 在 `design/gdd/` 中搜索与此改动最相关的 GDD。阅读
  会受到此改动影响的章节。
- 检查 `design/gdd/systems-index.md` 是否存在。如果存在，请阅读它以
  了解该系统在依赖关系图中的位置及其所属层级。如果不存在，请注明“未找到系统索引——跳过
  依赖层级检查。”然后继续。
- 检查 `design/quick-specs/` 中是否有之前涉及此
  系统的快速规格说明——避免与它们冲突。
- 如果这是数值调优改动，还要检查 `assets/data/`，查找
  保存相关数值的数据文件。

报告发现的内容：“在 [path] 找到 GDD。相关章节：[section name]。
未发现相互冲突的快速规格。”（如发现冲突，则注明冲突。）

---

## 3. 起草快速设计规格

根据变更类别使用适当的规格格式。

### 对于调优变更

生成一个表格：

```markdown
# Quick Design Spec: [Title]

**Type**: Tuning
**System**: [System name]
**GDD Reference**: `design/gdd/[filename].md` — Tuning Knobs section
**Date**: [today]

## Change

| Parameter | Old Value | New Value | Rationale |
|-----------|-----------|-----------|-----------|
| [param]   | [old]     | [new]     | [why]     |

## Tuning Knob Mapping

Maps to GDD Tuning Knob: [knob name and its documented range].
New value is [within / at the edge of / outside] the documented range.
[If outside: explain why the range should be extended.]

## Acceptance Criteria

- [ ] [Parameter] reads [new value] from `assets/data/[file]`
- [ ] Behavior difference is observable in [specific context]
- [ ] No regression in [related behavior]
```

### 对于微调和新增变更

```markdown
# Quick Design Spec: [Title]

**Type**: [Tweak / Addition]
**System**: [System name]
**GDD Reference**: `design/gdd/[filename].md`
**Date**: [today]

## Change Summary

[1-2 sentences describing what changes and why.]

## Motivation

[Why is this change needed? What player experience problem does it solve?
Reference the relevant MDA aesthetic or player feedback if applicable.]

## Design Delta

Current GDD says (quoting `design/gdd/[filename].md`, [section]):

> [exact quote of the relevant rule or description]

This spec changes that to:

[New rule or description, written with the same precision as a GDD Detailed
Rules section. A programmer should be able to implement from this text alone.]

## New Rules / Values

[Full unambiguous statement of the replacement content. If this introduces
new states, list them. If it introduces new parameters, define their ranges.]

## Affected Systems

| System | Impact | Action Required |
|--------|--------|-----------------|
| [system] | [how it is affected] | [update GDD / update data file / no action] |

## Acceptance Criteria

- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] [Specific, testable criterion 3]
- [ ] No regression: [the original behavior this must not break]

## GDD Update Required?

[Yes / No]
[If yes: which file, which section, and what the update should say.]
```

### 对于新增小型系统变更

使用精简的 GDD 结构。仅包含直接必要的章节——除非系统有明确需要，否则跳过玩家幻想、完整公式和边界情况。

```markdown
# Quick Design Spec: [Title]

**Type**: New Small System
**Scope**: [1-2 sentence description of what this system does and doesn't do]
**Date**: [today]
**Estimated Implementation**: [hours]

## Overview

[One paragraph a new team member could understand. What does this system do,
when does it activate, and what does it produce?]

## Core Rules

[Unambiguous rules for the system. Use numbered lists for sequential behavior
and bullet lists for conditions. Be precise enough that a programmer can
implement without asking questions.]

## Tuning Knobs

| Knob | Default | Range | Category | Rationale |
|------|---------|-------|----------|-----------|
| [name] | [value] | [min–max] | [feel/curve/gate] | [why this default] |

All values must live in `assets/data/[appropriate-file].json`, not hardcoded.

## Acceptance Criteria

- [ ] [Functional criterion: does the right thing]
- [ ] [Functional criterion: handles the edge case]
- [ ] [Experiential criterion: feels right — what a playtest validates]
- [ ] [Regression criterion: does not break adjacent system]

## Systems Index

This system is not currently in `design/gdd/systems-index.md`.
[If it should be added: suggest which layer and priority tier.]
[If it is too small to track: state "This system is below systems-index
tracking threshold — quick spec is sufficient."]
```

---

## 4. 审批与归档

向用户完整展示草稿。然后使用 `AskUserQuestion`：
- 提示语："这是 Quick Design Spec 草稿。你希望如何继续？"
- 选项：
  - `[A] Approve — write it as shown`
  - `[B] Revise — I'll describe what to change`
  - `[C] This grew too large — redirect to /design-system instead`

如果选择 [B]：收集用户要求的更改，修订草稿，然后重新展示此组件。
如果选择 [C]：停止。判定：**已重定向**——针对这项更改使用 `/design-system`。

如果选择 [A]：询问“我可以将此 Quick Design Spec 写入
`design/quick-specs/[kebab-case-title]-[YYYY-MM-DD].md` 吗？”

在文件名中使用今天的日期。标题应是描述此更改的 kebab-case 文本
（例如 `jump-height-tuning-2026-03-10`、
`parry-window-addition-2026-03-10`）。

如果用户同意，则在 `design/quick-specs/` 目录不存在时创建该目录，然后
写入文件。

如果需要更新 GDD（已在规范中标记），请在写入 Quick Spec 后单独询问：

“此规范修改了 [System Name] 中的规则。我可以更新
`design/gdd/[filename].md`——具体来说是 [section name] 章节吗？”

询问前，展示将要更改的确切文本（旧文本与新文本对比）。未经明确批准，不得
编辑 GDD。

---

## 5. 交接

写入文件后，输出：

```
Quick Design Spec written to: design/quick-specs/[filename].md
Type: [Tuning / Tweak / Addition / New Small System]
System: [system name]
GDD update: [Required — pending approval / Applied / Not required]

Next step: This spec is ready for `/story-readiness` validation before
implementation. Reference this spec in the story's GDD Reference field.
```

### 流程说明

判定：**已完成**——Quick Design Spec 已写入并可供实现。

根据设计，Quick Design Spec 会**绕过** `/design-review` 和 `/review-all-gdds`。
它们适用于规模小、风险低、范围明确的更改，在这些情况下，完整审查流程的成本
高于更改本身的风险。

如果以下任一条件成立，则重定向至完整流程：
- 此更改添加了一个应纳入系统索引的新系统
- 此更改显著改变了跨系统行为，或某个系统与其他系统之间的契约
- 此更改引入了会影响游戏 MDA 美学平衡、面向玩家的新机制
- 实现工作可能超过一周

在这些情况下：“此更改已超出 Quick Spec 的范围。我建议使用
`/design-system` 为其编写完整的 GDD。”

---

## 建议的后续步骤

- 运行 `/story-readiness [story-path]`，在实现开始前验证 Story——在 Story 的 GDD Reference 字段中引用此规范
- Story 通过就绪检查后，运行 `/dev-story [story-path]` 进行实现
- 如果更改规模大于预期，则改为运行 `/design-system [system-name]` 编写完整的 GDD