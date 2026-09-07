---
name: prd
license: MIT
description: >-
  Generates a Product Requirements Document from a natural language app description.
  Asks clarifying questions, researches similar apps, defines scope, stack, architecture,
  and produces a structured PRD that Archon can decompose into a campaign.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - prd
  - requirements
  - spec
  - plan an app
  - design an app
effort: high
---
# /prd — 产品需求文档生成器

## 何时使用

**不要使用的情况：** 架构已经定义、只需实现时（先使用 /architect 再使用 /archon）；为现有应用添加小功能时（直接使用 /marshal）。

- 用户描述了要构建的应用或功能（全新项目模式或功能模式）
- 在为新项目或新功能启动任何 Archon 行动之前

## 模式判定

开始之前，先确定模式：

**全新项目模式（greenfield）**：没有现有源代码文件，或用户明确说“全新应用”／“从零开始”。
按下文描述产出完整 PRD。

**功能模式（feature）**：项目已有源代码文件（检查是否存在 `src/`、`app/`、`lib/`、
带依赖的 `package.json` 等）。用户描述的是要添加的功能，而不是整个
应用（“加个登录”、“加个仪表盘”、“加支付处理”）。

在功能模式下：
- 提问之前，先阅读现有文件树和 `package.json` 或同类文件
- 现有技术栈是既定事实——不要推荐替代方案
- “Architecture” 一节描述与现有代码的集成点，而非独立形态
- 结束条件必须包含回归检查：“现有测试仍然通过”、“类型检查无新增错误”
- “Out of Scope” 相对于该功能而言，而非整个应用
- Technical Decisions 只覆盖该功能引入的决策（新依赖、新模式）

下方的 PRD 模板适用于两种模式。功能模式只是把范围收得更窄。

## 协议

### 第 1 步：理解

确定模式（全新项目还是功能）。识别核心功能、目标用户和成功标准（全新项目模式），或集成点和现有技术栈（功能模式）。最多提问 3 个——只问那些会影响架构的问题。全新项目模式下不要询问技术栈；功能模式下技术栈已定。

### 第 2 步：调研（可选）

如果该概念已有知名的实现，运行 /research 以确定 2-3 个参考应用和常见的预期功能。简单概念（落地页、个人工具、CRUD）可跳过。

### 第 3 步：定义

产出结构化的 PRD。写入 `.planning/prd-{slug}.md`：

```markdown
# PRD: {App Name or Feature Name}

> Description: {One sentence}
> Author: {user}
> Date: {ISO date}
> Status: draft
> Mode: {greenfield | feature}

## Problem
{What problem does this solve? Why does the user want it?}

## Users
{Who uses this? One or two user types max.}

## Core Features
{Numbered list. Maximum 5 for v1. Each feature is one sentence.}
1. {Feature}: {what it does}
2. ...

## Out of Scope (v1)
{Things the user might expect but should NOT be built yet.
Being explicit about what's out prevents scope creep.}

## Technical Decisions
- **Frontend**: {recommendation with reasoning}
- **Backend**: {recommendation with reasoning, or "none" for static apps}
- **Database**: {recommendation with reasoning, or "none"}
- **Auth**: {recommendation, or "none" if no user accounts}
- **Deployment**: {recommendation}

{In feature mode, only list decisions the feature introduces.
Existing stack decisions are inherited, not re-evaluated.}

## Architecture
{High-level description. 3-5 sentences max. How the pieces connect.
NOT a file tree. NOT implementation details. Just the shape.}

{In feature mode: describe integration points with existing code.
"The new auth middleware hooks into the existing Express router at
src/routes/index.ts. User model extends the existing Prisma schema."}

## Integration Points (feature mode only)
{Skip this section in greenfield mode.}
- **Existing files modified**: {list of files the feature will touch}
- **New files created**: {list of new files}
- **Dependencies added**: {new packages, if any}
- **Patterns followed**: {existing patterns in the codebase this feature should match}

## End Conditions (Definition of Done)
{Machine-verifiable conditions that mean the feature/app is complete.}
- [ ] {condition 1: e.g., "Landing page renders at localhost:3000"}
- [ ] {condition 2: e.g., "User can create account and log in"}
- [ ] {condition 3: e.g., "Core feature X works end-to-end"}

{In feature mode, ALWAYS include these regression conditions:}
- [ ] Existing tests pass with 0 new failures
- [ ] Typecheck passes with 0 new errors

## Open Questions
{Anything the PRD author couldn't decide. These become questions
for the user before the campaign starts.}
```

### 第 4 步：评审

呈现：核心功能、技术栈决策、范围外内容、结束条件。询问是否符合预期。若批准：PRD 可交给 Archon。若需修改：更新后仅重新呈现有变动的部分。

## 情境门控

**披露：**“正在为 [description] 生成 PRD。将创建 `.planning/prd-{name}.md`。”
**可逆性：** 绿色——仅创建 `.planning/prd-{slug}.md`；删除该文件即可撤销。
**信任门控：**
- 任意：完整 PRD 生成、澄清式提问、评审循环。

## 质量门控

- 每个 Core Feature 为一句话
- 每项技术决策都有理由（“因为”）
- 结束条件可被机器验证
- Out of Scope 至少包含 2 项
- v1 核心功能不超过 5 个

## 边缘情况

**描述含糊**：最多提出 3 个澄清问题。绝不产出含有占位式结束条件的 PRD。

**功能模式但没有现有代码**：与用户确认——确认后切换为全新项目模式。

**用户说“跳过 PRD”**：即使最简 PRD 也是必需的。提供 1 页速览版 PRD（Tier 4 风格）。

**如果 .planning/ 不存在**：写入前先创建它。若无法创建，则内联呈现内容并建议 `/do setup`。

## 退出协议

```
---HANDOFF---
- PRD: {app name}
- Document: .planning/prd-{slug}.md
- Status: {approved | needs-revision}
- Next: Run `/do build {app name}` or `/archon` with the PRD as direction
- Reversibility: green — delete .planning/prd-{slug}.md to undo
---
```

## 技术栈选择原则

给出有主见的推荐并附理由。默认选择：Web 用 Next.js + Tailwind + shadcn/ui；JS 后端用 Node/Express，Python 用 FastAPI；简单场景用 SQLite，多用户场景用 PostgreSQL；认证用该技术栈下最简单的方案。始终说明原因。

部署默认：静态 → Vercel/Netlify；带数据库的全栈 → Railway；仅 API → Railway 或 Fly.io；暂不部署 → 仅本地。平台详情参见 `.planning/_templates/deploy/`。
