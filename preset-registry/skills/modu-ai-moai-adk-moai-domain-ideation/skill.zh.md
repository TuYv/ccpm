---
name: moai-domain-ideation
description: >
  Ideation domain specialist: Lean Canvas assembly, SPEC decomposition list extraction,
  and Diverge-Converge pipeline for product proposal generation. Use during /moai brain
  Phase 2 (Diverge), Phase 4 (Converge), and Phase 6 (Proposal).

when_to_use: >
  Use during /moai brain ideation: Lean Canvas assembly, SPEC
  decomposition-list extraction, diverge/converge brainstorming, proposal
  generation, and structured idea exploration.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Write, Edit, Grep, Glob
user-invocable: false
metadata:
  version: "1.0.0"
  category: "domain"
  status: "active"
  updated: "2026-05-04"
  modularized: "false"
  tags: "ideation, lean-canvas, diverge-converge, spec-decomposition, proposal, brain"
  related-skills: "moai-foundation-thinking, moai-domain-design-handoff, moai-domain-research"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
  level1_tokens: 100
  level2_tokens: 5000
---
<!-- 验证：proposal.md 包含具有 2-10 个条目的 SPEC 拆分候选项章节 -->
<!-- 验证：proposal.md 中不存在技术栈假设 -->
<!-- 验证：在构思层强制实施 16 种语言中立性 -->

<!-- @MX:ANCHOR: [AUTO] SPEC 拆分候选项语法 — 规范定义 -->
<!-- @MX:REASON: 由 /moai plan --from-brain 使用（高 fan_in）。语法必须在不同 brain 工作流版本之间保持稳定。 -->

# 构思领域专家

用于发散-收敛构思流水线的轻量级编排器。将创意框架的执行委托给 `moai-foundation-thinking`，并添加特定于 brain 工作流的产物塑形逻辑：精益画布章节组装和 SPEC 拆分列表提取。

## 快速参考

核心职责：
- 阶段 2（发散）：为创意生成 5-15 个发散概念角度
- 阶段 4（收敛）：将精益画布的全部 9 个模块组装到 `ideation.md` 中
- 阶段 6（提案）：生成包含 SPEC 拆分候选项章节的 `proposal.md`

关键不变量：
- [HARD] SPEC 拆分候选项语法：`- SPEC-{DOMAIN}-{NUM}: {scope}`（参见下方锚点）
- [HARD] 任何产物中均不得包含技术栈假设（保持编程语言/框架无关）
- [HARD] 精益画布始终包含全部 9 个模块（缺失的模块使用占位文本）
- [HARD] SPEC ID 使用通用领域标签（例如 `SPEC-API-001`、`SPEC-AUTH-001`）——绝不使用特定于编程语言的标签（例如 `SPEC-FASTAPI-001`）

基础能力复用：
- 发散步骤：委托给 `moai-foundation-thinking` 的 `modules/diverge-converge.md`（发散阶段）
- 收敛步骤：委托给 `moai-foundation-thinking` 的 `modules/diverge-converge.md`（收敛阶段）
- 批判性评估：委托给 `moai-foundation-thinking` 的 `modules/critical-evaluation.md`

---

## 阶段 2：发散

### 输入

- 来自阶段 1 发现环节、已完成清晰度评分的创意
- 来自多轮 AskUserQuestion 的用户上下文

### 流程

调用 `moai-foundation-thinking` 的发散-收敛框架（发散阶段）：

1. 为创意生成 5-15 个发散角度。每个角度从不同视角进行探索：
   - 核心功能集角度（最小可行产品）
   - 目标用户群体角度（细分市场与大众市场）
   - 分发渠道角度（B2C、B2B、市场平台、API）
   - 收益模式角度（订阅、免费增值、按次付费、企业版）
   - 技术差异化角度（AI、实时、离线优先、移动优先）
   - 竞品空白角度（现有工具未能做到什么）
   - 相邻市场角度（相关问题领域）

2. 为每个角度生成一个单句概念标签。

3. 按亲和性对相关角度进行聚类（最多 5 个聚类）。

### 输出

内存中的概念图。此阶段不会持久化到磁盘——阶段 4 的收敛过程将决定写入哪些内容。

### 语言中立性规则

[HARD] 在发散过程中，不得将任何角度锚定到特定的编程语言或框架。描述能力，而非实现方式：
- 正确：“实时协同编辑引擎”
- 错误：“使用 React 前端的 Node.js WebSocket 服务器”

---

## 阶段 4：收敛 — 精益画布组装

### 输入

- 阶段 2 中发散形成的概念图
- 用户的原始想法
- 可选：来自 `.moai/project/brand/brand-voice.md` 的品牌上下文

### 流程

调用 `moai-foundation-thinking` 的发散-收敛框架（收敛阶段），将 5-15 个方向缩减为一个最具合理依据的产品概念。

然后组装精益画布。

### 精益画布 — 9 个模块

针对收敛后的概念填写每个模块。每个模块都必须存在，即使内容很少。空模块使用占位符：`[TBD — to be refined with user research]`。

```
## Lean Canvas

### Problem
[Top 3 problems this product solves for the target customer]

### Customer Segments
[Specific user personas — who has the problem most acutely?]

### Unique Value Proposition
[Single, clear, compelling message — why this over alternatives]

### Solution
[Top 3 features / capabilities that address the problems]

### Channels
[How the product reaches customers: direct, marketplace, viral, partnerships]

### Revenue Streams
[How value is monetized: subscription, freemium, per-use, enterprise license, API]

### Cost Structure
[Main cost drivers: infrastructure, people, acquisition, support]

### Key Metrics
[The numbers that tell you the product is succeeding — leading and lagging indicators]

### Unfair Advantage
[What is genuinely hard for competitors to copy? Network effect, data, brand, IP, team]
```

### 解决方案模块中的语言中立性

[硬性要求] 解决方案模块描述产品做什么，而不是如何构建：
- 正确："每秒处理 10K 个事件的高吞吐量转换引擎"
- 错误："在 Airflow DAGs 上运行的 Python Pandas 管道"

### 输出

将 `ideation.md` 写入 `.moai/brain/IDEA-NNN/`：

```markdown
# Idea: {user's original idea, verbatim}
*Session: {date}*

## Lean Canvas

[9 blocks as specified above]

```

---

## 阶段 5 追加：批判性评估

阶段 5 执行后（由 `moai-foundation-thinking` 的 critical-evaluation.md 管理），将评估报告追加到现有的 `ideation.md`：

```markdown
## Evaluation Report

### Strengths
[Evidence-backed strengths from critical evaluation]

### Weaknesses
[Identified gaps, assumptions, and risks]

### First Principles Validation
[First principles breakdown per moai-foundation-thinking/modules/first-principles.md]

### Verdict
[Proceed / Proceed with caveats / Revisit / Abandon — with rationale]
```

---

## 阶段 6：提案 — SPEC 分解列表

### 输入

- 包含精益画布和评估报告的 `ideation.md`
- 用户确认继续

### 流程

将收敛后的产品概念转换为可执行的 SPEC 候选项。每个候选项代表一个离散且可独立实施的工作单元。

#### SPEC ID 命名约定

[硬性要求] SPEC 领域标签必须使用通用能力术语，绝不能使用技术或语言名称：

| 正确（基于能力） | 错误（基于技术） |
|---------------------------|--------------------------|
| `SPEC-AUTH-001`           | `SPEC-OAUTH2-001`        |
| `SPEC-API-001`            | `SPEC-FASTAPI-001`       |
| `SPEC-PIPELINE-001`       | `SPEC-AIRFLOW-001`       |
| `SPEC-UI-001`             | `SPEC-REACT-001`         |
| `SPEC-DB-001`             | `SPEC-POSTGRES-001`      |
| `SPEC-NOTIFY-001`         | `SPEC-FIREBASE-001`      |
| `SPEC-SEARCH-001`         | `SPEC-ELASTICSEARCH-001` |

#### 拆分启发式原则

建议 2-10 个 SPEC 候选项。每个候选项都应：
1. 代表一个内聚的能力边界（粒度不宜过细，范围也不宜过宽）
2. 可以独立实现，不强依赖同级 SPEC（已声明的依赖项除外）
3. 代表 1-3 周的专注工作量（典型的 SPEC 范围）
4. 对应精益画布中的一个解决方案模块或一项关键基础设施关注点

如果创意非常小（只有单一能力），建议 2-3 个候选项比较合适。
如果创意规模较大，建议 7-10 个候选项，并注明执行顺序很重要。

#### 边界情况：0 个或 1 个候选项

如果创意过于原子化，不适合进行 SPEC 拆分：
- 0 个候选项：添加占位章节：`### SPEC Decomposition Candidates`，并注明“创意范围是原子性的——考虑直接使用 /moai plan，而不是通过 /moai brain 进行拆分”
- 1 个候选项：可以接受，无需特殊处理

### 输出

将 `proposal.md` 写入 `.moai/brain/IDEA-NNN/`：

```markdown
# Proposal: {product name or concept label}
*Generated: {date} | Idea: IDEA-NNN*

## Product Summary

{2-3 sentence summary derived from Lean Canvas UVP + Solution blocks}

## Target User

{From Lean Canvas Customer Segments block}

## Core Problems Solved

{From Lean Canvas Problem block, formatted as numbered list}

## Proposed Solution

{From Lean Canvas Solution block — capabilities only, no tech stack}

## SPEC Decomposition Candidates

{2-10 bullets, each matching the canonical grammar below}

- SPEC-{DOMAIN}-001: {one-line scope description}
- SPEC-{DOMAIN}-002: {one-line scope description}
...

## Recommended Execution Order

{Numbered list of SPEC IDs in dependency order, with brief rationale}

## Out of Scope (v0.1)

{Explicit exclusions deferred to later SPECs or a v0.2 phase}

## Notes

{Any caveats, open questions, or assumptions from the evaluation}

```

### 语法不变量（锚点）

<!-- @MX:ANCHOR: [AUTO] Canonical SPEC Decomposition Candidates bullet grammar -->
<!-- @MX:REASON: Consumed by /moai plan --from-brain parser (high fan_in: all brain-originated plan sessions). Changing this grammar breaks the parser silently. -->

`### SPEC Decomposition Candidates` 章节必须严格遵循以下语法：

```
- SPEC-{DOMAIN}-{NUM}: {scope}
```

其中：
- `{DOMAIN}` 为大写字母数字组合（例如 `AUTH`、`API`、`UI`、`DB`、`NOTIFY`）
- `{NUM}` 为以零补齐的 3 位数字（例如 `001`、`002`、`010`）
- `{scope}` 为一行纯英文描述（不得使用反引号，不得包含嵌套列表）
- 每行一个项目符号，不得包含子项目符号

`/moai plan --from-brain` 解析器使用此正则表达式：`^- SPEC-[A-Z][A-Z0-9]+-[0-9]{3}: .+$`

任何不匹配此模式的项目符号都会被排除在建议列表之外（显示为警告，而非错误）。

---

## 配合使用效果良好

- `moai-foundation-thinking`：发散—收敛、批判性评估、第一性原理模块
- `moai-domain-research`：将 research.md 内容提供给收敛阶段的上下文
- `moai-domain-design-handoff`：使用 proposal.md 的产品摘要填充 prompt.md 的上下文章节
- `moai-workflow-brain`：在第 2、4、5（追加）和 6 阶段编排此技能

---

## 常见的自我辩解

| 自我辩解 | 事实 |
|----------------|---------|
| “用户提到了 Python，所以 SPEC-PYTHON-001 更清晰” | 在 SPEC ID 中使用技术名称会造成语言锁定。应使用 SPEC-API-001——技术选型会在 /moai plan 阶段进行。 |
| “Solution 区块需要包含技术栈才能足够具体” | Solution 描述系统做什么。如何实现则推迟到架构阶段决定。“每秒处理 10K 个事件”已经足够具体，无需指定框架。 |
| “对于一个复杂的想法，5 个 SPEC 候选项太少了” | 从 5-7 个高层候选项开始。如有需要，/moai plan 会进一步分解每个候选项。 |
| “对于简单的想法，我应该跳过精益画布” | 每次调用 brain 都会生成一份精益画布。仅 Customer Segments 区块就值得完成这项练习——它会迫使你明确定义用户。 |

## 验证

- [ ] 阶段 2 的发散过程产生了 5-15 个不同的角度（而不是同一角度的细微变体）
- [ ] 阶段 4 的精益画布包含全部 9 个区块（无遗漏或合并）
- [ ] Solution 区块不包含任何技术/框架名称（仅使用能力描述语言）
- [ ] 阶段 6 的 proposal.md 包含 `### SPEC Decomposition Candidates` 标题
- [ ] 所有 SPEC 候选项均符合以下语法：`- SPEC-{DOMAIN}-{NUM}: {scope}`
- [ ] SPEC 领域标签基于能力命名（不包含技术名称）
- [ ] proposal.md 在“Notes”部分之外不包含任何技术栈假设