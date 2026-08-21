---
name: moai-meta-harness
description: >
  DEPRECATED — legacy 7-Phase meta-harness. Redirects to the v4 harness Builder
  (/moai:harness <natural-language request>) which replaces the static 7-Phase
  workflow with an orchestrator-direct 4-phase Builder (ANALYZE / PLAN /
  GENERATE / ACTIVATE) + a manifest-driven dynamic-workflow Runner. Retained as
  the redirect source for backward-compat invocation paths; the 7-Phase body
  below is preserved as historical reference, NOT for new harness creation.

when_to_use: >
  Use the v4 Builder instead: issue /moai:harness <natural-language request> to
  enter Context-First Discovery (domain / goal / constraints / scope extraction)
  then the orchestrator-direct Builder. This legacy skill fires ONLY on
  backward-compat invocation paths that still reference the 7-Phase workflow; on
  any such invocation it surfaces a deprecation notice and redirects to v4.

license: Apache-2.0
compatibility: Designed for Claude Code (v2.1.111+)
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
user-invocable: false
metadata:
  version: "0.2.0"
  category: "meta"
  status: "deprecated"
  updated: "2026-06-20"
  modularized: "false"
  tags: "meta-skill, harness, deprecated, v4-redirect, agent-team-architect, apache-2-0-attribution"
  upstream_source: "revfactory/harness"
  generated_by: "moai-adk"
  superseded_by: "/moai:harness v4 Builder"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
# moai-meta-harness（已弃用 — 重定向至 v4）

> **弃用通知** — 这一旧版 7 阶段元编排框架已被
> **v4 编排框架 Builder 取代**（`/moai:harness <natural-language
> request>`）。v4 设计用以下内容替代了静态的 7 阶段工作流：
>
> - 一个**由编排器直接执行的 4 阶段 Builder**（ANALYZE -> PLAN -> GENERATE ->
>   ACTIVATE），它将计划保存在 Claude 的会话上下文中，并可在 PLAN->GENERATE 审批关口调用
>   AskUserQuestion（一级边界）。
> - 一个**由清单驱动的动态工作流 Runner**（`hns-<name>-run.js`），它会
>   读取 `manifest.json`，并根据各专家声明的
>   `primitive`（sub-agent / dynamic-workflow / worktree / /moai goal /
>   adversarial-fan-out）进行分派 — 不再通过启发式方法重新推导。
> - **以子代理为粒度的条件式 worktree 隔离**（不强制使用
>   顶层 worktree；仅在容易发生冲突的并行生成中使用 worktree）。
> - **信号驱动的阶段合成**（而非固定流水线）；评估器是
>   条件式的（对于处于模型单独可靠处理范围内的任务，会跳过评估器）。
>
> **要创建新的编排框架**：执行 `/moai:harness <natural-language request>`
>（例如，`/moai:harness build a harness for my-project's API development`）。编排器
> 会对请求运行上下文优先发现流程，推导出编排框架
> `<name>`，然后进入 Builder。请勿使用下方的 7 阶段工作流
> 创建新的编排框架。
>
> **此处保留的内容**：下方的 7 阶段正文作为
> **重定向源**保留，以实现向后兼容 — 因此，引用旧版工作流的现有调用路径
> 会到达弃用通知和重定向，而不是无效链接。7 阶段内容是历史参考资料，并非
> 活跃工作流。revfactory 的 7 阶段残留 grep 会排除此正文，
> 正是因为它就是重定向源。

<!-- @MX:NOTE: [AUTO] V3R4 契约已被取代 — 原始 V3R4 契约依据编排框架基础策略 §10 的排除项 #10，原样保留了此技能正文（仅文本注释，不改变行为）。该契约现已由 v4 编排框架重新设计明确取代：此正文已转换为 v4 重定向。取代理由：(1) V3R4 契约用于防止行为变更，但 v4 是一次有意的行为变更 — 7 阶段工作流已停用，改用由编排器直接执行的 Builder + 由清单驱动的 Runner；(2) 原样保留正文会留下一个与 v4 设计相矛盾的无效路径 7 阶段工作流；(3) 仅限 AskUserQuestion 的契约（REQ-HRN-FND-015）本身在 v4 下仍被逐字保留 — 在 .claude/agents/harness/ 下生成的任何子代理仍然绝对不得调用 AskUserQuestion（这是再次确认，而非削弱）。此次取代的范围很窄：7 阶段工作流已停用；AskUserQuestion 边界 + 命名空间分离 + Apache-2.0 署名要求均予以保留。交叉引用：配套 harness-builder.md 工作流中的 v4 设计迁移路径（revfactory 7-Phase -> v4 mapping）。 -->

<!-- 署名
原始作品：revfactory/harness (https://github.com/revfactory/harness)
许可证：Apache License 2.0
改编：将七阶段工作流集成到 MoAI 智能体生态系统（manager-*、expert-*、sync-auditor）
声明：此文件包含修改。有关派生历史，请参阅 harness 策略。下方的七阶段工作流已被 v4 Builder 取代；保留该工作流是为了作为向后兼容的重定向源。
-->

> **Apache 2.0 署名**：改编自 [revfactory/harness](https://github.com/revfactory/harness)（Apache License 2.0）。下方的七阶段工作流是 MoAI 对上游六阶段工作流及其演进机制的改编。有关完整的第三方声明和派生历史的 harness 策略，请参阅 `.claude/rules/moai/NOTICE.md`。**作为替代方案的 v4 Builder 记录在 `.claude/skills/moai/workflows/harness-builder.md` 中。**

---

## v4 重定向（当前有效路径）

**新建 harness**：`/moai:harness <natural-language request>`

此命令会路由到 v4 Builder（orchestrator-direct）。Builder 会：

1. 对请求进行**上下文优先发现**（提取领域／目标／约束／范围）。
2. 如果清晰度低于 100%，则进行 **AskUserQuestion 苏格拉底式问答轮次**；根据确认后的意图**推导** harness `<name>`。
3. 设置**显式批准关卡**（AskUserQuestion，PLAN->GENERATE 边界）。
4. 以 orchestrator-direct 阶段执行 **ANALYZE / PLAN / GENERATE / ACTIVATE**。
5. 生成 5 类构件：入口命令、Runner Workflow、专用智能体、配套技能、`manifest.json`。

**Harness 生命周期**（列出／编辑／移除）：`/moai:harness list|edit|remove <name>`。

**Harness 执行**：`/harness:<name>`（自动生成的轻量包装命令 -> 该 harness 的 Runner Workflow）。

有关完整的 Builder 契约，请参阅 `harness-builder.md`（位于 `moai/workflows/` 下的配套工作流）；有关 Runner 的动态工作流原语，请参阅 `.claude/rules/moai/workflow/dynamic-workflows.md`。

---

## 旧版七阶段正文（历史参考资料 — 重定向源，当前未启用）

> 此分隔线下方的内容是原始七阶段工作流，以原样保留，
> 作为重定向源。它并非当前有效的 harness 创建路径。
> 新建 harness 必须使用上方的 `/moai:harness <NL request>`（v4）。
> revfactory 七阶段残留内容的 grep 检查会排除此正文，因为它就是
> 正在被重定向弃用的旧版来源。

一种用于架构设计和生成项目专用智能体团队的元工厂技能。它将 [revfactory/harness](https://github.com/revfactory/harness) 的七阶段工作流适配到 MoAI 的智能体生态系统中，并生成针对各项目领域定制的 `hns-*` 技能和智能体定义。

**上游项目**：revfactory/harness（Apache-2.0）—“一种元技能，用于设计特定领域的智能体团队、定义专用智能体，以及生成这些智能体所使用的技能。”（2905 个 star、420 个 fork，创建于 2026-03-26）

**有效性数据（设计目标）**：平均质量得分提高 60%（49.5 → 79.3），胜率为 15/15，方差降低 32%（n=15，由作者测量的 A/B 测试，第三方复现尚待完成）。来源：Hwang, M.（2026）。《Harness: Structured Pre-Configuration for Enhancing LLM Code Agent Output Quality》。revfactory/claude-code-harness。

---

## 快速参考

### 使用时机

- `/moai project` 运行至 Phase 5+，并检测到 `.moai/harness/main.md` 不存在
- CLAUDE.md 包含 `<!-- moai:harness-start -->` 标记（由项目 Harness 生成策略安装，而非此 Skill）
- 用户明确请求为其项目领域生成 Harness

### 关键输出

| 产物 | 位置 | 所有者 |
|----------|----------|-------|
| Harness 配置 | `.moai/harness/main.md` + 扩展文件 | 此 Skill |
| Agent 定义 | `.claude/agents/harness/*.md` | 此 Skill |
| 领域 Skill | `.claude/skills/hns-*/SKILL.md` | 此 Skill |

所有生成的产物均使用 `hns-*` 前缀——绝不使用 `moai-*`（该前缀由模板管理）。`moai-harness-*` 前缀专门表示由模板管理的 Harness 构建器（`moai-meta-harness`、`moai-harness-learner`），此生成器的输出中不会使用该前缀。

### 6 种架构模式（上游）

流水线、扇出/扇入、专家池、生产者-审查者、监督者、分层委派。

有关模式语义和选择指南，请参阅[阶段流程详解](references/seven-phase-workflow.md)。

---

## 实现指南

### 7 阶段工作流——来源映射

每个 MoAI 阶段都映射到上游 revfactory/harness 阶段（参考：https://github.com/revfactory/harness#workflow）：

| MoAI 阶段 | 上游 Harness 阶段 | 负责 Agent | 输入 | 输出 |
|------------|------------------------|--------------|--------|---------|
| 1. 发现 | Phase 0（审计）+ Phase 1 领域分析（苏格拉底式） | manager-spec | 用户请求 | `answers.yaml` |
| 2. 分析 | Phase 1 领域分析（代码库扫描） | manager-spec | `answers.yaml` + 仓库状态 | 分析报告 |
| 3. 综合 | Phase 2 团队架构设计 | manager-spec | 分析报告 | 包含 EARS 的 SPEC 文档 |
| 4. 骨架 | Phase 3 Agent 定义生成 | meta-harness（此 Skill） | SPEC 文档 | `.moai/harness/main.md` + 扩展文件 |
| 5. 定制 | Phase 4 Skill 生成 | meta-harness（此 Skill） | 骨架 | `.claude/agents/harness/*.md` + `.claude/skills/hns-*/SKILL.md` |
| 6. 评估 | Phase 5 集成 + Phase 6 验证 | sync-auditor | 生成的产物 | Sprint Contract 评分 |
| 7. 迭代 | Harness 演进机制 + Phase 7-5 运维 | LEARNING-001（独立 SPEC） | 评分变化量 | Factory 反馈（超出范围） |

### 阶段摘要

- Phase 1（发现）：`manager-spec` 开展包含 16 个问题的苏格拉底式访谈（由项目 Harness 生成策略负责）。输出：`.moai/harness/answers.yaml`
- Phase 2（分析）：`manager-spec` 扫描仓库（文件结构、现有 Agent/Skill、依赖文件、测试覆盖率）——战略分析已整合至 manager-spec
- Phase 3（综合）：`manager-spec` 生成包含 EARS 需求的 SPEC，从 6 种架构模式中选择一种，并定义 Agent 角色、Skill 类别和验收标准
- Phase 4（骨架）：此 Skill 生成 Harness 骨架——main.md、agents.md、skills.md 扩展文件以及 Agent 定义存根
- Phase 5（定制）：此 Skill 使用领域特定内容填充骨架，其中引用保留的 MoAI Agent（manager-*、builder-harness、sync-auditor），并通过每次生成的 Agent(general-purpose) 领域委派来处理领域特定工作
- Phase 6（评估）：`sync-auditor` 运行 Sprint Contract 协议（设计章程 §11.5）——包含 4 个维度，通过阈值为 0.75（FROZEN 下限为 0.60）
- Phase 7（迭代）：由 Harness 学习策略负责（超出此 Skill 的范围）

有关各阶段的完整活动、输入、输出和交叉引用说明，请参阅[阶段 1-7 详细演练 + 智能体参与情况](references/seven-phase-workflow.md)。

### MoAI 智能体交叉引用

此技能负责编排，但不会取代现有智能体。所有具名智能体均为保留的 MoAI 智能体——不会引入任何新智能体；特定领域的工作通过每次生成的 Agent(general-purpose) 配合领域指令进行委派。类别：规划与策略（manager-spec、plan-auditor）、实现（manager-develop，以及每次生成的 Agent(general-purpose) 领域委派）、构建器（builder-harness，使用 artifact_type=agent|skill|plugin）、工作流管理器（manager-develop、manager-docs、manager-git；质量门禁通过 /moai gate 或 sync-phase-quality-gate.sh Stop hook 实现）、质量（sync-auditor）。

有关各智能体的角色和阶段映射，请参阅[智能体交叉引用完整清单](references/agent-cross-references.md)。

### 生成式 Harness 验证

在阶段 5（定制）生成新的 `hns-*` 技能后，此元 Harness 会使用 Sprint Contract 协议自动移交给 `sync-auditor`（设计宪章 §11.5）。

**四维 Sprint Contract 评估**：

| 维度 | 检查内容 |
|-----------|----------------|
| 功能性 | 智能体定义能够执行其声明的用途；技能具有有效的触发条件 |
| 安全性 | 生成的文件中不包含凭证；工具权限遵循最小权限原则 |
| 工艺 | YAML frontmatter 有效（CSV allowed-tools、带引号的 metadata）；已配置渐进式披露 |
| 一致性 | 与 `answers.yaml` 保持领域一致；命名遵循 `hns-*` 约定 |

**评分**：

- 通过阈值：默认为 0.75（可通过 `design.yaml pass_threshold` 配置）
- FROZEN 下限：0.60（设计宪章 §2，不可变）
- 评分标准：sync-auditor 评分标准锚定（设计宪章 §12，机制 1）

对于阶段 3b——HRN-003 分层评分（当 `harness.yaml` 设置 `evaluator_mode: hierarchical` 时），请参阅 [HRN-003 分层评分详情](references/hrn-003-hierarchical-scoring.md)。

**设计目标参考**：Hwang（2026）提出的 +60% 有效性数据——在一项 15 次运行的 A/B 研究中从 49.5 提升至 79.3（由作者测量，尚待第三方复现）——是此验证 hook 的设计意图。约束性要求明确指出，这并不要求进行运行时测量。

---

## 命名空间隔离

[HARD] Skills + Agents 命名空间明确区分为**“通用分发”**与**“用户生成”**。

### 分发式（由模板管理）

`moai-*` 命名空间（包括所有前缀：`moai-foundation-*`、`moai-workflow-*`、`moai-domain-*`、`moai-ref-*`、`moai-meta-*`、`moai-harness-*`）由 moai-adk 分发。`moai update` 会进行同步（删除后重新安装）。用户直接进行的修改会在下一次 update 时被覆盖。

此命名空间中的 Harness 资产：
- `moai-meta-harness`（此技能——7 阶段生成器）
- `moai-harness-learner`（生命周期管理构建器，与项目无关）

### 用户生成（由此元 Harness 生成）

**`hns-*` 技能命名空间和 `.claude/agents/harness/` 目录**归用户所有。它们由此元 Harness 在 `/moai project` 阶段 5+ 的访谈过程中创建，并针对用户的项目领域进行定制。

用户生成的工件：
- `.claude/skills/harness-<domain>/SKILL.md` — 特定领域的技能（例如 `harness-trading`、`harness-llm-cascade`）
- `.claude/agents/harness/<role>.md` — 代理定义（例如 `.claude/agents/harness/trading-specialist.md`）
- `.moai/harness/main.md` — harness 入口点 + 扩展

### 契约

- [HARD] 此 meta-harness 只能生成带有 `hns-*` 前缀的用户生成技能。在阶段 4 或阶段 5 期间生成带有 `moai-*`（包括 `moai-harness-*`）前缀的文件属于**契约违规**。
- [HARD] `moai update` 不得删除、修改或同步 `hns-*` 技能或 `.claude/agents/harness/*` 文件。更新前必须备份。
- [HARD] 模板（`internal/template/templates/`）不得包含 `hns-*` 技能或 `.claude/agents/harness/*-specialist.md` 文件。泄漏检测会触发清理任务。
- [HARD] `hns-*`（用户所有）与 `moai-harness-*`（模板构建器）的子字符串区分：前缀匹配必须使用精确的 startsWith 比较（禁止使用存在误报风险的 `*harness-*` 子字符串模式）。
- [HARD] 生成器只能生成 `hns-*` 前缀。构建强制机制将 `hns-*` 识别为用户所有，同时在向后兼容的弃用窗口期内保留旧版 `harness-*` 前缀形式。SSOT：harness 命名空间隔离策略。

### 生成代理自激活契约

[HARD] 每个生成的 `.claude/agents/harness/<role>.md` 代理都必须包含以下两个 frontmatter 字段，以便生成的 harness 在代理被委派时自行激活：

- 一个 `skills:` frontmatter 条目，用于预加载代理配套的 `harness-<domain>-*` 技能。这使领域技能能够在代理运行时确定性加载，而不是依赖自动发现；当代理上下文中缺少配套技能时，自动发现会静默失败。
- 一个非空、采用触发器形式的 `description` frontmatter 字段，用于说明领域 + 可观察到的任务形态，以便编排器的 `.moai/harness/main.md` 任务形态路由表能够将任务分派给该代理。

这两个字段都会在运行时由阶段 6 的生成后冒烟门禁强制检查（`moai doctor harness`，参见 `project/meta-harness.md` 工作流的阶段 7）：如果生成的代理具有空的 `description`、悬空的 `skills:` 引用（指向不存在的 `hns-*` 目录），或者完全没有 `skills:` 键，门禁都会失败。缺少 `skills:` 的代理不得静默通过——这正是本契约要消除的自动发现失败模式。完整生成模板 + 示例：`project/meta-harness.md` § 6.4.1。

### 存储根目录

| 命名空间 / 路径 | 位置 | 来源 | `moai update` 行为 |
|------------------|----------|--------|---------------------|
| `moai-*` 技能（包括 `moai-harness-*` 构建器） | `.claude/skills/moai-*/` | 模板 | 删除后全新安装（覆盖） |
| **`hns-*` 技能** | `.claude/skills/hns-*/` | **用户项目（由此 meta-harness 生成——意图声明）** | **绝对禁止删除/修改 + 保留备份** |
| MoAI 代理（保留 7 个，扁平结构） | `.claude/agents/moai/` | 模板 | 删除后全新安装（覆盖） |
| **生成的 harness 代理** | `.claude/agents/harness/` | **用户项目（由此 meta-harness 生成）** | **绝对禁止删除/修改 + 保留备份** |
| Harness 配置 | `.moai/harness/` | 用户项目 | 绝对禁止删除 + 保留备份 |

### 交叉引用

- `.claude/skills/moai-meta-harness/SKILL.md` § 命名空间隔离（本文件——生成器侧命名空间规范的权威定义）
- `.claude/rules/moai/development/skill-authoring.md` § 技能命名空间策略
- `.claude/rules/moai/development/agent-authoring.md` § 智能体目录约定

---

## 触发机制

**自动加载条件**：

1. `/moai project` 运行到阶段 5+，且 `.moai/harness/main.md` 不存在
2. CLAUDE.md 包含 `<!-- moai:harness-start -->` 标记。这些标记由项目初始化期间的项目 Harness 生成策略安装；本技能不会安装它们。

**Frontmatter 触发器**：

当以下任一项匹配时，本技能将加载：

- 关键词：`harness`、`project-init`、`meta-skill`、`agent-team`、`harness-evolve`
- 智能体：`manager-spec`、`sync-auditor`
- 阶段：`plan`、`run`、`sync`

**延迟执行契约**：

本技能提供工作流方案和智能体交叉引用。它不会执行 `/moai project` 阶段 5+ 的逻辑——该调用由项目 Harness 生成策略负责。这种职责分离是有意为之：

- 本技能 = 能力（做什么以及如何做）
- PROJECT-HARNESS-001 = 调用接线（何时执行）

---

## 范围之外

以下能力明确不由本技能实现：

- **5 层集成机制**——由项目 Harness 生成策略负责。与 `/moai project` 各阶段的集成、Hook 安装以及 CLAUDE.md 标记管理均委托给该 SPEC。
- **16 问苏格拉底式访谈**——由项目 Harness 生成策略负责。`manager-spec` 在该 SPEC 的控制下开展访谈。
- **自动演进循环**——由 Harness 学习策略负责。学习反馈机制（阶段 7）和增量捕获属于 Wave A 之外的独立工作项。
- **修改 `.claude/agents/{moai,harness}/` 或静态 `moai-*` 技能**——此元 Harness 仅生成带有 `hns-*` 前缀的工件，无权写入 MoAI 自身的智能体/技能目录。

---

## 配合良好的组件

- `moai-foundation-core`——SPEC-First DDD 和 TRUST 5 质量门禁
- `moai-foundation-cc`——Claude Code 技能/智能体编写标准
- `manager-spec`——执行探索与综合阶段
- `sync-auditor`——在阶段 6 中评估 Sprint Contract
- `builder-harness`（artifact_type=agent|skill|plugin）——工件生成辅助工具

---

*上游：revfactory/harness（Apache-2.0）| MoAI 改编：Harness 策略 | v4 取代项：v4 Harness Builder 重新设计*
*完整的 Apache 2.0 署名信息请参阅 `.claude/rules/moai/NOTICE.md`。*