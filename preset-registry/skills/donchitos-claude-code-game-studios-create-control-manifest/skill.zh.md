---
name: create-control-manifest
description: "After architecture is complete, produces a flat actionable rules sheet for programmers — what you must do, what you must never do, per system and per layer. Extracted from all Accepted ADRs, technical preferences, and engine reference docs. More immediately actionable than ADRs (which explain why)."
argument-hint: "[update — regenerate from current ADRs]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Write, Task
model: sonnet
agent: technical-director
---
# 创建控制清单

控制清单是一份面向程序员的扁平化、可执行规则表。它回答“我该做什么？”和“我绝不能做什么？”——按架构层级组织，并从所有已接受的 ADR、技术偏好和引擎参考文档中提取。ADR 解释的是*为什么*，而清单告诉你*做什么*。

**输出：** `docs/architecture/control-manifest.md`

**运行时机：** 在 `/architecture-review` 通过且 ADR 处于 Accepted 状态后运行。每当有新的 ADR 被接受或现有 ADR 被修订时，重新运行。

---

## 1. 加载所有输入

### ADR
- 对 `docs/architecture/adr-*.md` 执行 Glob，并读取每个文件
- 仅筛选已接受的 ADR（Status: Accepted）——跳过 Proposed、Deprecated、Superseded
- 记录每条规则来源的 ADR 编号和标题

### 技术偏好
- 读取 `.claude/docs/technical-preferences.md`
- 提取：命名约定、性能预算、获准使用的库/插件、禁止的模式

### 引擎参考
- 读取 `docs/engine-reference/[engine]/VERSION.md`，获取引擎及其版本
- 读取 `docs/engine-reference/[engine]/deprecated-apis.md`——其中内容将成为禁止使用的 API 条目
- 读取 `docs/engine-reference/[engine]/current-best-practices.md`（如果存在）

报告：“已加载 [N] 个已接受的 ADR，引擎：[name + version]。”

---

## 2. 从每个 ADR 中提取规则

对于每个已接受的 ADR，提取：

### 必需模式（来自“Implementation Guidelines”部分）
- 每一条包含“must”“should”“required to”“always”的陈述
- 每一种明确要求采用的模式或方法

### 禁止的方法（来自“Alternatives Considered”部分）
- 每一种被明确否决的替代方案——其被否决的*原因*将转化为规则（“绝不使用 X，因为 Y”）
- 任何被明确指出的反模式

### 性能护栏（来自“Performance Implications”部分）
- 预算约束：“此系统每帧最多 N ms”
- 内存限制：“此系统不得超过 N MB”

### 引擎 API 约束（来自“Engine Compatibility”部分）
- 截止日期之后、需要验证的 API
- 与 LLM 默认认知不同且经过验证的行为
- 在固定引擎版本中具有不同行为的 API 字段或方法

### 层级分类
根据规则所约束的系统架构层级，对每条规则进行分类：
- **基础层**：场景管理、事件架构、保存/加载、引擎初始化
- **核心层**：核心游戏循环、主要玩家系统、物理/碰撞
- **功能层**：次要系统、次要机制、AI
- **表现层**：渲染、音频、UI、VFX、着色器

如果某个 ADR 涉及多个层级，则将该规则复制到每个相关层级中。

---

## 3. 添加全局规则

合并适用于所有层级的规则：

### 来自 technical-preferences.md：
- 命名约定（类、变量、信号/事件、文件、常量）
- 性能预算（目标帧率、帧预算、绘制调用限制、内存上限）

### 来自 deprecated-apis.md：
- 所有已弃用的 API → 禁止使用的 API 条目

### 来自 current-best-practices.md（如果存在）：
- 引擎推荐的模式 → 必需条目

### 来自 technical-preferences.md 的禁止模式：
- 直接复制所有“Forbidden Patterns”条目

---

## 4. 编写前展示规则摘要

在编写清单之前，向用户展示摘要：

```
## Control Manifest Preview
Engine: [name + version]
ADRs covered: [list ADR numbers]
Total rules extracted:
  - Foundation layer: [N] required, [M] forbidden, [P] guardrails
  - Core layer: [N] required, [M] forbidden, [P] guardrails
  - Feature layer: ...
  - Presentation layer: ...
  - Global: [N] naming conventions, [M] forbidden APIs, [P] approved libraries
```

使用 `AskUserQuestion`：
- 提示：“此规则摘要看起来完整吗？”
- 选项：
  - `[A] Yes — looks good, run the director review and write the manifest`
  - `[B] Add rules — I have additional rules to include before writing`
  - `[C] Remove rules — some extracted rules should be dropped`
  - `[D] Stop here — I need to review the ADRs first`

---

## 4b. 技术总监关卡——技术审查

**审查模式检查**——在启动 TD-MANIFEST 之前应用：
- `solo` → 跳过。注明：“TD-MANIFEST skipped — Solo mode.”继续进入阶段 5。
- `lean` → 跳过。注明：“TD-MANIFEST skipped — Lean mode.”继续进入阶段 5。
- `full` → 正常启动。

通过 Task 启动 `technical-director`，并使用关卡 **TD-MANIFEST**（`.claude/docs/director-gates.md`）。

传入：阶段 4 中的 Control Manifest Preview（各层的规则数量、完整的已提取规则列表）、所涵盖的 ADR 列表、引擎版本，以及源自 technical-preferences.md 或引擎参考文档的所有规则。

technical-director 审查以下事项：
- 是否已涵盖所有强制性 ADR 模式，并且表述准确
- 禁止采用的方法是否完整且来源归属正确
- 是否未添加任何缺少源 ADR 或偏好文档依据的规则
- 性能护栏是否与 ADR 约束一致

根据裁决执行：
- **APPROVE** → 进入阶段 5
- **CONCERNS** → 通过 `AskUserQuestion` 呈现，选项为：`Revise flagged rules` / `Accept and proceed` / `Discuss further`
- **REJECT** → 不编写清单；修复被标记的规则并重新展示摘要

---

## 5. 编写控制清单

使用 `AskUserQuestion`：
- 提示：“可以编写控制清单吗？”
- 选项：
  - `[A] Yes — write to docs/architecture/control-manifest.md`
  - `[B] Show me the full draft first, then ask again`
  - `[C] Not yet — I want to make more changes`

格式：

```markdown
# Control Manifest

> **Engine**: [name + version]
> **Last Updated**: [date]
> **Manifest Version**: [date]
> **ADRs Covered**: [ADR-NNNN, ADR-MMMM, ...]
> **Status**: [Active — regenerate with `/create-control-manifest update` when ADRs change]

`Manifest Version` is the date this manifest was generated. Story files embed
this date when created. `/story-readiness` compares a story's embedded version
to this field to detect stories written against stale rules. Always matches
`Last Updated` — they are the same date, serving different consumers.

This manifest is a programmer's quick-reference extracted from all Accepted ADRs,
technical preferences, and engine reference docs. For the reasoning behind each
rule, see the referenced ADR.

---

## Foundation Layer Rules

*Applies to: scene management, event architecture, save/load, engine initialisation*

### Required Patterns
- **[rule]** — source: [ADR-NNNN]
- **[rule]** — source: [ADR-NNNN]

### Forbidden Approaches
- **Never [anti-pattern]** — [brief reason] — source: [ADR-NNNN]

### Performance Guardrails
- **[system]**: max [N]ms/frame — source: [ADR-NNNN]

---

## Core Layer Rules

*Applies to: core gameplay loop, main player systems, physics, collision*

### Required Patterns
...

### Forbidden Approaches
...

### Performance Guardrails
...

---

## Feature Layer Rules

*Applies to: secondary mechanics, AI systems, secondary features*

### Required Patterns
...

### Forbidden Approaches
...

---

## Presentation Layer Rules

*Applies to: rendering, audio, UI, VFX, shaders, animations*

### Required Patterns
...

### Forbidden Approaches
...

---

## Global Rules (All Layers)

### Naming Conventions
| Element | Convention | Example |
|---------|-----------|---------|
| Classes | [from technical-preferences] | [example] |
| Variables | [from technical-preferences] | [example] |
| Signals/Events | [from technical-preferences] | [example] |
| Files | [from technical-preferences] | [example] |
| Constants | [from technical-preferences] | [example] |

### Performance Budgets
| Target | Value |
|--------|-------|
| Framerate | [from technical-preferences] |
| Frame budget | [from technical-preferences] |
| Draw calls | [from technical-preferences] |
| Memory ceiling | [from technical-preferences] |

### Approved Libraries / Addons
- [library] — approved for [purpose]

### Forbidden APIs ([engine version])
These APIs are deprecated or unverified for [engine + version]:
- `[api name]` — deprecated since [version] / unverified post-cutoff
- Source: `docs/engine-reference/[engine]/deprecated-apis.md`

### Cross-Cutting Constraints
- [constraint that applies everywhere, regardless of layer]
```

---

## 6. 建议后续步骤

写入清单后：

- 如果史诗/故事尚不存在：“运行 `/create-epics layer: foundation`，然后运行 `/create-stories [epic-slug]`——程序员
  现在可以在编写故事实现说明时使用此清单。”
- 如果这是重新生成（清单已存在）：“已更新。建议
  将规则变更通知团队，尤其是所有新增的禁止项。”

---

## 协作协议

1. **静默加载**——在展示任何内容之前读取所有输入
2. **先展示摘要**——让用户在写入前了解范围
3. **写入前询问**——创建或覆盖清单前始终进行确认。写入时：结论：**完整**——控制清单已写入。拒绝时：结论：**受阻**——用户拒绝写入。
4. **每条规则都要注明来源**——绝不添加无法追溯至 ADR、
   技术偏好或引擎参考文档的规则
5. **不得解读**——按 ADR 中的原文提取规则；不要以
   会改变含义的方式进行改写