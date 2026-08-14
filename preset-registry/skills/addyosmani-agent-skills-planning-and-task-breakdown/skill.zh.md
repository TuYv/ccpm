---
name: planning-and-task-breakdown
description: Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
---
# 规划与任务拆分

## 概述

将工作拆分为具有明确验收标准的小型、可验证任务。良好的任务拆分决定了智能体是能够可靠地完成工作，还是会制造出一团乱麻。每项任务都应足够小，以便在一次专注的工作会话中完成实现、测试和验证。

## 适用场景

- 你已有一份规范，需要将其拆分为可实现的单元
- 某项任务过于庞大或模糊，难以着手
- 工作需要在多个智能体或会话之间并行开展
- 你需要向相关人员说明工作范围
- 实现顺序并不明确

**不适用的场景：**范围明确的单文件更改，或者规范中已经包含定义清晰的任务。

## 规划流程

### 第 1 步：进入规划模式

在编写任何代码之前，以只读模式开展工作：

- 阅读规范以及代码库中的相关部分
- 识别现有模式和约定
- 梳理组件之间的依赖关系
- 记录风险和未知事项

**规划期间不要编写代码。**输出内容是一份保存到 `tasks/plan.md` 的规划文档，以及记录在任务列表目标中的任务列表（参见“输出文件”；默认为 `tasks/todo.md`），而不是具体实现。

### 第 2 步：识别依赖关系图

梳理各部分之间的依赖关系：

```
Database schema
    │
    ├── API models/types
    │       │
    │       ├── API endpoints
    │       │       │
    │       │       └── Frontend API client
    │       │               │
    │       │               └── UI components
    │       │
    │       └── Validation logic
    │
    └── Seed data / migrations
```

实现顺序应自底向上遵循依赖关系图：先构建基础部分。

### 第 3 步：纵向切分

不要先构建所有数据库部分，再构建所有 API，接着构建所有 UI——而应每次构建一条完整的功能路径：

**不佳（横向切分）：**
```
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**良好（纵向切分）：**
```
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

每个纵向切片都应交付可运行、可测试的功能。

### 第 4 步：编写任务

无论任务最终记录在 Markdown 任务列表中，还是作为条目添加到外部跟踪器中（参见“输出文件”），每项任务都应遵循以下结构：

```markdown
## Task [N]: [Short descriptive title]

**Description:** One paragraph explaining what this task accomplishes.

**Acceptance criteria:**
- [ ] [Specific, testable condition]
- [ ] [Specific, testable condition]

**Verification:**
- [ ] Tests pass: [the repository's focused-test command]
- [ ] Build succeeds: [the repository's build command]
- [ ] Manual check: [description of what to verify]

**Dependencies:** [Task numbers this depends on, or "None"]

**Files likely touched:**
- `src/path/to/file.ts`
- `tests/path/to/test.ts`

**Estimated scope:** [Small: 1-2 files | Medium: 3-5 files | Large: 5+ files]
```

### 步骤 5：排序与检查点

安排任务时应确保：

1. 满足依赖关系（先构建基础）
2. 每项任务完成后，系统都处于可正常工作的状态
3. 每完成 2-3 项任务后设置一个验证检查点
4. 尽早安排高风险任务（快速失败）

在任务列表目标中添加明确的检查点：

```markdown
## Checkpoint: After Tasks 1-3
- [ ] All tests pass
- [ ] Application builds without errors
- [ ] Core user flow works end-to-end
- [ ] Review with human before proceeding
```

## 任务规模指南

| 规模 | 文件数 | 范围 | 示例 |
|------|-------|-------|---------|
| **XS** | 1 | 单个函数或配置变更 | 添加一条验证规则 |
| **S** | 1-2 | 一个组件或端点 | 添加一个新的 API 端点 |
| **M** | 3-5 | 一个功能切片 | 用户注册流程 |
| **L** | 5-8 | 涉及多个组件的功能 | 支持筛选和分页的搜索 |
| **XL** | 8+ | **规模过大——需要进一步拆分** | — |

如果一项任务的规模为 L 或更大，则应将其拆分为更小的任务。智能体处理 S 和 M 规模的任务时表现最佳。

**何时应进一步拆分任务：**
- 需要超过一个专注工作会话才能完成（约为智能体工作 2 小时以上）
- 无法用 3 个或更少的要点描述验收标准
- 涉及两个或更多相互独立的子系统（例如身份验证和计费）
- 任务标题中出现了“和”（这通常表明它实际上是两项任务）

## 输出文件

- **计划文档：** 将实施计划保存到 `tasks/plan.md`。该文件始终为 markdown 文件——设计决策、风险和开放问题无法清晰地映射到各个跟踪器议题。
- **任务列表：** 将每项任务记录到**任务列表目标**中（定义见下文）。

如果 `tasks/` 目录不存在，请创建该目录。

### 任务列表目标

任务列表目标是记录任务和检查点的位置。它仅在此处定义一次；本技能中其他所有相关引用均以此定义为准。

- **默认：位于 `tasks/todo.md` 的清单式 markdown 文件。** 这是 `/build` 命令和其他下游工具所期望的约定。除非项目另有规定，否则请使用该文件。
- **外部跟踪器：** 如果项目的智能体规则（`CLAUDE.md`、`AGENTS.md` 等）或用户指定了议题跟踪器（例如 GitHub Issues、Jira、Linear、`bd`/beads），则为每项任务创建一个跟踪器条目，而不是写入 `tasks/todo.md`。将步骤 4 的结构映射到跟踪器字段：在条目正文中填写验收标准和验证步骤，并通过跟踪器的关联机制（`bd dep add`、"blocked by" 等）记录依赖关系。还应将步骤 5 的检查点记录为跟踪器条目；如果跟踪器没有合适的对应形式，则将其作为清单记录在计划文档中。

使用外部跟踪器时，请在 `tasks/plan.md` 中注明（例如 "Tasks tracked in Linear project FOO"），以便下游步骤和未来会话知道应在何处查找；同时，将计划文档的任务列表部分保留为按顺序排列的跟踪器条目 ID 或链接索引，而不是重复的清单。

## 计划文档模板

```markdown
# Implementation Plan: [Feature/Project Name]

## Overview
[One paragraph summary of what we're building]

## Architecture Decisions
- [Key decision 1 and rationale]
- [Key decision 2 and rationale]

## Task List

### Phase 1: Foundation
- [ ] Task 1: ...
- [ ] Task 2: ...

### Checkpoint: Foundation
- [ ] Tests pass, builds clean

### Phase 2: Core Features
- [ ] Task 3: ...
- [ ] Task 4: ...

### Checkpoint: Core Features
- [ ] End-to-end flow works

### Phase 3: Polish
- [ ] Task 5: ...
- [ ] Task 6: ...

### Checkpoint: Complete
- [ ] All acceptance criteria met
- [ ] Ready for review

## Risks and Mitigations
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Risk] | [High/Med/Low] | [Strategy] |

## Open Questions
- [Question needing human input]
```

当任务位于外部跟踪器中时，请将上面的任务列表部分保留为跟踪器条目 ID 或链接的有序索引，而不是重复的检查清单。

## 并行化机会

当有多个智能体或会话可用时：

- **可安全并行：** 相互独立的功能切片、已实现功能的测试、文档
- **必须按顺序执行：** 数据库迁移、共享状态变更、依赖链
- **需要协调：** 共享 API 契约的功能（先定义契约，再并行执行）

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我可以边做边想” | 这正是最终陷入混乱并返工的原因。花 10 分钟做规划可以节省数小时。 |
| “这些任务很明显” | 无论如何都要把它们写下来。明确的任务可以暴露隐藏的依赖关系和被遗忘的边界情况。 |
| “规划是一种额外负担” | 规划本身就是任务。没有计划的实现只不过是在敲代码。 |
| “我可以把所有事情都记在脑子里” | 上下文窗口是有限的。书面计划可以跨越会话边界，并在上下文压缩后继续保留。 |

## 危险信号

- 在没有书面任务列表的情况下开始实现
- 项目已指定使用外部跟踪器，却仍编写 `tasks/todo.md`（或将任务分散在两者之中）
- 任务只写着“实现该功能”，却没有验收标准
- 计划中没有验证步骤
- 所有任务的规模都是 XL
- 任务之间没有检查点
- 未考虑依赖顺序

## 验证

在开始实现之前，请确认：

- [ ] 每项任务都有验收标准
- [ ] 每项任务都有验证步骤
- [ ] 已识别任务依赖关系并按正确顺序排列
- [ ] 任务已记录在任务列表目标中（默认为 `tasks/todo.md`）
- [ ] 每项任务涉及的文件不超过约 5 个
- [ ] 各主要阶段之间设有检查点
- [ ] 人类已审查并批准该计划

## 另请参阅

验收标准针对每项任务，并回答“我们构建的是正确的东西吗？”。它建立在项目范围的完成定义之上；完成定义是每项任务在被视为完成之前都必须达到的长期标准。请参阅 `../../references/definition-of-done.md`。