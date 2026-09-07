---
name: architect
license: MIT
description: >-
  Given a PRD, produces an implementation architecture: file tree, component
  breakdown, data model, and a phased build plan with end conditions that
  Archon can execute directly. Multi-candidate evaluation for key decisions.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - architect
  - architecture
  - design the system
  - file structure
  - plan the build
effort: high
---
# /architect — 基于 PRD 的实现架构

## 适用场景

**不适用：**当你已经有一份架构并想实现它时（使用 /marshal 或 /archon）；当你需要先产出 PRD 时（在 /architect 之前使用 /prd）。

- 在 /prd 产出一份已获批准的 PRD 之后（全新项目模式或功能模式）
- 当用户有明确方向 + 现有代码库（无需 PRD）时
- 当 /do 转发一个构建请求时
- 当用户有规格说明并想要一份构建计划时

## 输入

以下之一：
1. 一个 PRD 文件路径（来自 /prd）— 首选，包含结构化需求
2. 用户提供的规格说明或描述 + 现有代码库 — 已足够
3. 两者都没有 — 建议先使用 /prd，但不要强制拦截。如果用户有明确方向（“给我的应用加上认证”），那么它 + 现有代码就是输入。

## 模式判定

**全新项目模式（greenfield）**：PRD 存在且带有 `Mode: greenfield`，或不存在现有源文件。从零产出一份完整架构。

**功能模式（feature）**：PRD 存在且带有 `Mode: feature`，或用户描述了一个功能且项目已有源文件。此时架构描述的是对现有代码的改动，而非一个独立系统。

在功能模式下：
- 首先阅读现有文件树 — 在规划改动之前先理解当前架构
- 阅读关键文件（package.json、tsconfig、主入口、既有模式）
- File Tree 一节只展示新增和修改的文件，而不是整个项目
- 各阶段包含一个 Phase 0：“基线”，记录当前 typecheck/test 状态
- 每个阶段的结束条件都包含“无新增 typecheck 错误”和“现有测试通过”
- 风险登记表默认包含“现有功能出现回归”这一风险

## 协议

### 第 1 步：阅读

**如果 PRD 存在**，阅读它。提取：
- 核心功能（编号列表）
- 技术决策（技术栈选择）
- 结束条件（“完成”是什么样子）
- 范围外内容（不构建什么）
- 集成点（功能模式）

**如果没有 PRD**，则改为阅读代码库：
- 扫描文件树以了解结构和约定
- 阅读 package.json / 等价文件以了解依赖和脚本
- 阅读主入口以理解架构
- 将用户的描述作为功能规格说明
- 从描述中推断结束条件（“加认证” → “受保护路由在无 token 时返回 401”）

### 第 2 步：评估选项（针对非平凡决策）

对于存在多种有效方案的决策 — 状态管理、API 结构、认证模式、数据库 schema、路由 — 生成 2-3 个候选方案。从复杂度、风险、可维护性和 LLM 友好度对每个候选进行评估。选出胜出方案并记录原因。以说理方式否决其余备选。

简单决策（文件命名、目录结构、CSS）无需此步 — 直接沿用 PRD 的技术栈选择并继续。

### 第 3 步：产出

写入 `.planning/architecture-{slug}.md`：

```markdown
# Architecture: {App Name}
> PRD: .planning/prd-{slug}.md  |  Date: {ISO date}

## File Tree
{Greenfield: complete file tree for v1, every file listed.
Feature mode: ONLY new (+) and modified (~) files.}

## Component Breakdown
### Feature: {name}
- Files: | Dependencies: | Complexity: {low/medium/high}

## Data Model
### {Entity name}
- Fields: {name: type}  |  Relationships: {connections}
{Omit section if no database.}

## Key Decisions
### {Decision}: {chosen approach}
- **Chosen**: {approach} — {reasoning}
- **Rejected**: {alternative} — {why not}

## Build Phases
### Phase N: {name}
- **Goal**: {one sentence}
- **Files**: | **Dependencies**: {or "none"}
- **End Conditions**: [ ] {machine-verifiable}

## Phase Dependency Graph
{Text format: Phase 1 → Phase 2 → Phase 3 / Phase 3 + 4 → Phase 5}

## Risk Register
1. {risk}: {mitigation}
2. {risk}: {mitigation}
3. {risk}: {mitigation}

## Deployment Strategy
{Skip if "deploy later" or static-only.}
- **Platform**: | **Method**: | **Environment variables**: | **Pre-deploy checks**:
{Final phase is "Deploy" when a platform is specified. A failed deploy does NOT fail the campaign.}
```

### 第 4 步：接入战役

每个构建阶段都成为一个战役阶段；结束条件原样继承；依赖图决定顺序；对并行安全的阶段为 Fleet 打上标记。

向用户呈现摘要（文件数、阶段数、关键决策、预估复杂度）并询问：“准备好开始构建了吗？这将创建一个 Archon 战役。”获批后，写入战役文件。

### 第 5 步：交接

```
---HANDOFF---
- Architecture: {app name}
- Document: .planning/architecture-{slug}.md
- Phases: {count}
- Estimated complexity: {low/medium/high}
- Next: Archon campaign ready to execute
- Reversibility: green — delete .planning/architecture-{slug}.md to undo
---
```

## 情境门槛

**披露：**“正在为 [描述] 生成架构计划。在你批准之前不会修改任何文件。”
**可逆性：**绿色 — 仅创建 `.planning/architecture-{slug}.md`；用 `rm .planning/architecture-{slug}.md` 撤销。
**信任门槛：**
- 任意：生成架构文档、评估选项、接入战役。

## 质量门槛

- 每个阶段至少有一个机器可验证的结束条件
- 每个关键决策都记录了被否决的方案及原因
- 文件树是完整的（不得出现“等”或"..."占位符）
- 阶段依赖是显式的（不得有隐式顺序）
- 风险登记表至少有 2 条记录

## 边缘情况

**没有 PRD：**将用户描述 + 现有代码库视为规格说明；阅读文件树和 package.json；不要求 PRD 即可继续。

**项目已有代码：**使用功能模式；先阅读现有架构；文件树只展示新增/修改的文件；Phase 0 记录基线 typecheck/test 状态。

**描述含糊：**最多提出 2 个澄清问题；不要因追求完全清晰而阻塞。

**`.planning/` 缺失：**创建它；如果无法创建，则内联输出架构并指示用户自行保存。

## 退出协议

```
---HANDOFF---
- Architecture: {app name}
- Document: .planning/architecture-{slug}.md
- Phases: {count}
- Estimated complexity: {low/medium/high}
- Next: Archon campaign ready to execute
- Reversibility: green — delete .planning/architecture-{slug}.md to undo
---
```
