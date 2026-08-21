---
name: moai-workflow-spec
description: >
  SPEC workflow orchestration with EARS format requirements, acceptance criteria,
  and Plan-Run-Sync integration for MoAI-ADK development. Use when creating SPEC
  documents or defining acceptance criteria.

when_to_use: >
  Use for SPEC workflow orchestration: EARS-format requirements,
  acceptance criteria, user stories, requirements gathering, planning, and
  Plan-Run-Sync integration for MoAI-ADK development.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Bash(git:*), Bash(ls:*), Bash(wc:*), Bash(mkdir:*), Grep, Glob
user-invocable: false
metadata:
  version: "1.2.0"
  category: "workflow"
  status: "active"
  updated: "2026-01-08"
  modularized: "true"
  tags: "workflow, spec, ears, requirements, moai-adk, planning"
  author: "MoAI-ADK Team"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# SPEC 工作流管理

## 快速参考

使用 GEARS 表示法（当前）编排 SPEC 工作流——并由 EARS 旧版向后兼容窗口提供支持——用于系统化定义需求以及集成 Plan-Run-Sync 工作流。

依据 GEARS 迁移策略统一规范 lint 行为。

核心能力：

- GEARS 格式规范（当前）：五种需求模式，使用统一的复合子句 `[Where ...][While ...][When ...] The <subject> shall <behavior>`，并采用泛化的 `<subject>`（可以是任何名词，而不仅限于“the system”）
- EARS 旧版参考：依据 lint 引擎的向后兼容策略保留所有 EARS 模式，以确保 v3 之前的 SPEC（即在 GEARS 成为规范表示法之前编写的 SPEC）仍然可读
- 需求澄清：包含假设分析的四步系统化流程
- SPEC 文档模板：标准化的 3 文件结构（spec.md / plan.md / acceptance.md）
- Plan-Run-Sync 集成：无缝衔接工作流
- 并行开发：基于 Git Worktree 的 SPEC 隔离
- 质量门禁：TRUST 5 框架验证

GEARS 五种模式（当前表示法）：

| 模式 | GEARS 形式（当前） | EARS 形式（旧版） | 说明 |
|---------|----------------------|--------------------|-------|
| 普遍型 | "The <subject> shall <behavior>" | "The system shall <behavior>" | `<subject>` 可以是任何名词：系统、组件、服务、智能体、函数、产物 |
| 事件驱动型 | "**When** <event-detected>, the <subject> shall <behavior>" | "WHEN <event>, the system shall <action>" | 触发语义不变 |
| 状态驱动型 | "**While** <state>, the <subject> shall <behavior>" | "WHILE <state>, the system shall <action>" | 保持不变——提升为一级模式 |
| 能力门控型 | "**Where** <capability / feature flag / static config>, the <subject> shall <behavior>" | "WHERE <feature exists>, the system shall <action>" | 重新定义——表示能力门控、功能标志或静态配置（不再称为“可选型”） |
| 事件检测型（取代 IF/THEN） | "**When** <undesired-condition-detected>, the <subject> shall <response>" | `IF <condition> THEN <action>` **[已弃用——请使用 WHEN <event-detected>]** | `IF/THEN` 模态已被移除；请将相同意图描述为检测到的事件 |

统一复合子句：`**Where** <precondition> **While** <state> **When** <event> the <subject> shall <behavior>`——三个修饰语可以使用任意子集进行串联。

请参阅 [GEARS 表示法参考](https://adk.mo.ai.kr/en/workflow-commands/moai-plan/#gears-notation)。

> **IF/THEN 弃用提示**：此前的编写指南使用 `IF <condition> THEN <action>` 描述以状态为条件的行为。在 GEARS 中，该意图表示为 `When <condition-detected>`（事件检测形式）。对于新 SPEC 中残留的 `IF/THEN`，lint 引擎会发出 `LegacyEARSKeyword` 警告（非严格模式）或错误（`moai spec lint --strict`）。针对旧版 SPEC 的 6 个月向后兼容窗口仍然有效。

泛化主语替换：GEARS 使用 `<subject>` 取代硬编码的“the system”主语；`<subject>` 可以是任何名词。编写新 SPEC 的作者可以使用这种泛化形式。以下是有效的非“the system”主语示例：

- “该技能应将 GEARS 作为主要表示法。”（普遍型，`<subject>` = 技能）
- “该智能体应返回阻塞问题报告，而不是提示用户。”（普遍型，`<subject>` = 智能体）
- “**当** SPEC 作者打开文件时，该组件应显示弃用横幅。”（事件驱动型，`<subject>` = 组件）

v3 之前的 SPEC（即在 GEARS 成为规范之前编写的 SPEC）仍将“系统”作为默认主语，以保持可读性；现有读者无需重新学习规范表述。

EARS 五种模式（旧版——6 个月向后兼容期）：

| 模式 | 格式 | 用途 |
|---------|--------|-----|
| 普遍型 | “系统应始终执行 X” | 始终有效 |
| 事件驱动型 | “当事件发生时，则执行操作” | 触发与响应 |
| 状态驱动型 | “在某状态期间，系统应……” | 条件行为（使用 `WHILE`，而非旧版 `IF/THEN`） |
| 非期望行为型 | “系统不应执行 X” | 禁止行为 |
| 可选型 | “在可能的情况下，提供 X” | 非必需但值得实现 |

旧版 `IF/THEN` 模态已由 GEARS `When <event-detected>` 取代——请参阅上方的提示说明。

适用场景：

- 功能规划和需求定义
- SPEC 文档的创建和维护
- 并行功能开发协调
- 质量保证和验证规划
- 从用户故事叙述中收集需求

快捷命令：

```bash
/moai:1-plan "user authentication system"                   # Create new SPEC
/moai:1-plan "login" "signup"                              # Parallel SPECs
/moai:1-plan "payment processing" --branch                  # New branch
/moai:1-plan SPEC-001 "add OAuth support"                   # Update existing
```

---

## 实施指南

### 核心概念

SPEC 优先开发理念：

- EARS 格式确保需求明确无歧义
- 需求澄清可防止范围蔓延
- 通过测试场景进行系统化验证
- 与 DDD 工作流集成以开展实施
- 质量门禁强制执行完成标准
- 引用章程可确保整个项目的一致性

### 章程参考（SDD 2025 标准）

章程定义了所有 SPEC 都必须遵循的项目基因。在创建任何 SPEC 之前，请验证其是否与 `.moai/project/tech.md` 保持一致。

章程组成部分：技术栈、命名约定、禁用库、架构模式、安全标准、日志记录标准。

章程验证：所有 SPEC 的技术选择均与章程规定的技术栈版本一致，不使用禁用库，遵守命名约定，并保持架构边界不变。

原因：章程可防止架构偏移，并确保可维护性。

### SPEC 工作流阶段

| 阶段 | 活动 |
|-------|----------|
| 1 | 用户输入分析——解析自然语言功能描述 |
| 2 | 需求澄清——执行四步系统化流程 |
| 3 | 应用 EARS 模式——使用五种模式组织需求 |
| 4 | 定义成功标准——确立完成度量指标 |
| 5 | 生成测试场景——创建验证测试用例 |
| 6 | 生成 SPEC 文档——产出标准化 Markdown |

### GEARS 格式（当前）

自 v3.0.0 起，GEARS（Generalized EARS，广义 EARS）成为规范的 SPEC 表示法。它保留了全局型 / `When`（事件驱动型）/ `While`（状态驱动型），并将 `Where` 重新定义为能力门控。旧版 `IF/THEN` 模态被替换为 `When <event-detected>`。

[docs-site GEARS 表示法参考](https://adk.mo.ai.kr/en/workflow-commands/moai-plan/#gears-notation)和规范的 GEARS 迁移策略记录对 GEARS 表示法进行了详尽说明。

复合子句示例（使用非“系统”主语）：

> **Where** 项目已初始化 **While** 严格模式处于活动状态 **When** SPEC 作者运行 `moai spec lint` 时，lint 引擎应针对每个残留的 `IF/THEN` 模态生成一个 `LegacyEARSKeyword` 发现项。

此示例串联了全部三个 GEARS 修饰词（`Where`、`While`、`When`），并使用 `<subject>` = “lint 引擎”，而不是“系统”。

### EARS 格式（旧版——6 个月向后兼容窗口）

五种模式涵盖所有需求类型。每种模式都有特定的使用场景和测试策略。v3 之前的 SPEC（即在 GEARS 成为规范表示法之前编写的 SPEC）继续使用 EARS 表示法，并根据 lint 引擎的向后兼容策略保持有效。

有关全局型、事件驱动型、状态驱动型、非期望型和可选型需求的使用场景、示例及测试策略，请参阅[按模式提供示例的 EARS 深入解析](references/ears-deep-dive.md)。

### 需求澄清流程

系统化的 5 步流程：

- 步骤 0：假设分析（哲学家框架）——揭示技术、业务、团队和集成方面的假设
- 步骤 0.5：根因分析（五个为什么）——针对问题驱动型 SPEC，从表面问题追溯至根本原因
- 步骤 1：范围定义——支持的方法、验证规则、失败处理、会话管理
- 步骤 2：约束提取——性能、安全性、兼容性、可扩展性
- 步骤 3：成功标准——覆盖率目标、响应时间百分位数、功能完成度、质量门禁
- 步骤 4：测试场景创建——正常、错误、边界和安全场景

有关假设记录模板及五个为什么的应用，请参阅[需求澄清详细工作流](references/requirement-clarification.md)。

### [NEEDS CLARIFICATION] 标记约定

**[NEEDS CLARIFICATION: <topic>]** 标记用于标识 plan.md 和 research.md 中尚未解决的问题，这些问题必须在实施启动审批（plan→run HUMAN GATE）之前解决。

**放置位置**：仅限 plan.md 和 research.md（绝不能出现在 spec.md 或 acceptance.md 中）。

**格式**： 
- `[NEEDS CLARIFICATION: <specific topic>]`——用于开放问题的行内标记
- 每个标记都必须能够在进入 run 阶段之前通过编排器的 AskUserQuestion 进行处理
- plan-auditor 会检测未澄清的标记，并将其标记为“澄清门禁”发现项

**三层区分**：
- `[NEEDS CLARIFICATION: <topic>]`——plan/research 工件阻塞项（需要向用户提问）
- `TODO`——代码级实现债务（无需向用户提问）
- `@MX:TODO`——用于未经测试或未完成代码的代码级注解

**处理流程**：
- plan-auditor 在审计期间扫描 `[NEEDS CLARIFICATION]` 标记
- 如果仍有任何标记，plan-auditor 会建议在实施启动审批之前解决
- Orchestrator 运行多轮 AskUserQuestion，以解决每个被标记的主题
- 只有解决所有需要澄清的问题后，才能进行实施启动审批（强制人工关卡）

### Plan-Run-Sync 工作流集成

PLAN (/moai:1-plan)：manager-spec 分析输入 → EARS 需求 → 澄清 → 在 `.moai/specs/` 中创建 SPEC → 可选的 `--branch`。

RUN (/moai:2-run)：manager-develop 加载 SPEC → 根据 `quality.yaml` 中的 `constitution.development_mode` 执行 ANALYZE-PRESERVE-IMPROVE（DDD）或 RED-GREEN-REFACTOR（TDD）→ 参考 moai-workflow-testing → 每次生成 Agent(general-purpose) 时进行领域委派 → quality-gate 验证（Stop hook / /moai gate）。

SYNC (/moai:3-sync)：manager-docs 同步文档 → 根据 SPEC 生成 API 文档 → 更新 README 和架构文档 → CHANGELOG → 版本控制提交。

### 使用 Git Worktree 进行并行开发

Worktree 为每个 SPEC 提供隔离的工作目录，从而无需切换分支即可进行并行开发。优势：并行开发、明确的所有权边界、依赖隔离、降低风险。

有关创建命令和团队协作示例，请参阅 [worktree 工作流模式](references/worktree-workflow.md)。

---

## 资源

### SPEC 文件组织

标准 3 文件格式：

- `.moai/specs/SPEC-{ID}/spec.md` — EARS 格式规范
- `.moai/specs/SPEC-{ID}/plan.md` — 实施计划、里程碑、技术方案
- `.moai/specs/SPEC-{ID}/acceptance.md` — 验收标准、Given-When-Then 场景

[HARD] 每个 SPEC 目录都必须包含全部 3 个文件。缺少文件会导致需求不完整。

状态文件：`.moai/state/last-session-state.json`。生成的文档：`.moai/docs/api-documentation.md`。

### SPEC 元数据 Schema

规范的 12 个必填字段（由 SPEC frontmatter lint 规则强制执行）：id、title、version、status、created、updated、author、priority、phase、module、lifecycle、tags。

状态枚举（8 个值）：draft → in-progress → implemented → completed | superseded | archived | rejected。（`planned` 作为旧版可选值保留在枚举中——不属于当前流程；任何 agent 都不会创建 `draft → planned` 转换。参见 `.claude/rules/moai/development/spec-frontmatter-schema.md` § 状态枚举。）

可选字段：issue_number、depends_on、lint.skip、bc_id、tier（S/M/L LEAN 层级）。

完整 schema 位于 `.claude/rules/moai/development/spec-frontmatter-schema.md`（SSOT）。

### SPEC 生命周期管理

三个生命周期级别：

| 级别 | 描述 | 维护 |
|-------|-------------|-------------|
| spec-first | 实施后丢弃 SPEC | 无 |
| spec-anchored | SPEC 与实施内容同步维护 | 每季度审查 |
| spec-as-source | SPEC 是单一事实来源，仅由人工编辑 SPEC | 变更会重新生成实现 |

转换规则：当涉及生产关键功能时，从 spec-first → spec-anchored；当需要合规性或重新生成工作流时，从 spec-anchored → spec-as-source。降级需要明确的理由。

### 质量指标

SPEC 质量指标：需求清晰度（使用所有 EARS 模式）、测试覆盖率（所有需求均有场景）、约束完整性、成功标准可衡量性。

验证清单：所有 EARS 需求均可测试，无歧义语言（“should”“might”“usually”），记录所有错误情况，量化性能目标，安全需求符合 OWASP 标准。

### Token 管理

| 阶段 | Token 预算 |
|-------|--------------|
| PLAN | ~30% |
| RUN | ~60% |
| SYNC | ~10% |

上下文优化：SPEC 文档持久保存在 `.moai/specs/` 中。会话状态保存在 `.moai/state/` 中。通过引用 SPEC ID 实现最少量的上下文传递。Agent 委派可减少 Token 开销。

---

## SPEC 范围与分类

### 应放入 .moai/specs/ 的内容

`.moai/specs/` 目录仅用于存放定义待实现功能的 SPEC 文档。

有效的 SPEC 内容：采用 EARS 格式的功能需求、包含里程碑的实施计划、采用 Given/When/Then 场景的验收标准、新功能的技术规范、具有明确交付成果的用户故事。

SPEC 特征：面向未来（将要构建什么）、可执行、可测试、结构化（EARS）。

### 不应放入 .moai/specs/ 的内容

| 文档类型 | 不属于 SPEC 的原因 | 正确位置 |
|---------------|--------------|------------------|
| 安全审计 | 分析现有代码 | `.moai/reports/security-audit-{DATE}/` |
| 性能报告 | 记录当前指标 | `.moai/reports/performance-{DATE}/` |
| 依赖项分析 | 审查现有依赖项 | `.moai/reports/dependency-review-{DATE}/` |
| 架构概述 | 记录当前状态 | `.moai/docs/architecture.md` |
| API 参考 | 记录现有 API | `.moai/docs/api-reference.md` |
| 会议记录 | 记录已做出的决策 | `.moai/reports/meeting-{DATE}/` |
| 回顾总结 | 分析过去的工作 | `.moai/reports/retro-{DATE}/` |

### 范围外内容分类规则

这些路由规则用于确定哪些内容不属于 SPEC 文档的范围（以及它们应归入何处）。编写 SPEC 自身的排除项部分时，请将每个排除项表示为带有 `-` 项目符号的 `### Out of Scope — <topic>` H3 子标题，以使该部分通过 `OutOfScopeRule` lint 检查。

[HARD] 报告分析现有内容 → `.moai/reports/`。SPEC 定义将要构建的内容 → `.moai/specs/`。

[HARD] 文档说明如何使用 → `.moai/docs/`。SPEC 定义要构建什么 → `.moai/specs/`。

---

## 可配合使用

- moai-foundation-core：SPEC-First DDD 方法论和 TRUST 5 框架
- moai-workflow-testing：DDD 实施和测试自动化
- moai-workflow-project：项目初始化和配置
- moai-workflow-worktree：用于并行开发的 Git Worktree 管理
- manager-spec：SPEC 创建和需求分析 Agent
- manager-develop：基于 SPEC 需求的 DDD/TDD 实施
- /moai gate skill（或 sync-phase-quality-gate.sh Stop hook）：TRUST 5 质量验证和门禁强制执行（原 manager-quality 角色）

有关迁移场景和验证脚本，请参阅：[references/migration-guide.md](references/migration-guide.md)。

---

版本：1.3.1（技能正文压缩处理）
最后更新：2026-05-23
集成状态：已完成——采用支持 SDD 2025 功能的 Plan-Run-Sync 工作流

<!-- moai:evolvable-start id="rationalizations" -->
## 常见的合理化借口

| 合理化借口 | 事实 |
|---|---|
| “SPEC 很显然，我可以跳过 EARS 格式” | EARS 的存在正是因为看似显然的需求最容易被误解。该格式会强制消除歧义。 |
| “验收标准与需求重复” | 需求描述意图。验收标准描述可观察的证据。两者缺一不可。 |
| “我会在实现过程中完善 SPEC” | 延迟完善意味着实现工作被浪费。SPEC 是改变想法成本最低的阶段。 |
| “研究只是锦上添花，并非阻塞项” | 跳过研究会产生与现有代码冲突的 SPEC。research.md 可防止返工。 |
| “批注循环只会给用户增加麻烦” | 批注能在编写代码之前发现误解。它是流程中成本最低的反馈循环。 |
| “这个 SPEC 很小，我不需要单独的文件” | 每个 SPEC 都是一份持久性契约。消息内的 SPEC 无法被 /moai run SPEC-XXX 引用。 |

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="red-flags" -->
## 危险信号

- 需求使用祈使性散文编写，而不是采用 EARS 格式（WHEN X, SHALL Y）
- 验收标准被表述为主观判断（“感觉很快”“看起来很整洁”）
- 修改现有代码时，SPEC 文档缺少同级的 research.md
- 跳过批注循环，或将其缩减为单轮的“看起来不错”
- 需求在意指“shall”时使用了“should”（可选与强制之间存在歧义）
- SPEC-ID 未在 `.moai/specs/` 目录中注册

<!-- moai:evolvable-end -->

<!-- moai:evolvable-start id="verification" -->
## 验证

- [ ] SPEC 文件位于 `.moai/specs/SPEC-XXX/spec.md`，并具有唯一 ID
- [ ] 每项需求均使用 EARS 关键字（WHEN、WHILE、WHERE、IF、SHALL）
- [ ] 每项验收标准均可观察（测试输出、文件是否存在、指标阈值）
- [ ] 当 SPEC 涉及现有代码时，research.md 存在
- [ ] 批注循环已完成，并包含明确的用户批准标记
- [ ] SPEC 引用了其所依赖或取代的现有 SPEC-ID
- [ ] 存在“范围之外”部分以防止范围蔓延——至少包含一个 `### Out of Scope — <topic>` H3 子标题和一个 `-` 项目符号条目（满足 `OutOfScopeRule` lint）

<!-- moai:evolvable-end -->