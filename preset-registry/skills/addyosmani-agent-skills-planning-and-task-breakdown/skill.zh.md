---
name: planning-and-task-breakdown
description: Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
---
# 规划与任务拆解

## 概述

将工作拆解为小型、可验证的任务，并为其设定明确的验收标准。良好的任务拆解决定了智能体是能够可靠地完成工作，还是会制造出一团乱麻。每个任务都应足够小，以便在一次专注的工作会话中完成实现、测试和验证。

## 何时使用

- 你已有一份规格说明，需要将其拆解为可实现的工作单元
- 任务规模过大或描述过于模糊，难以着手
- 工作需要由多个智能体或跨多个会话并行完成
- 你需要向相关人员传达工作范围
- 实现顺序并不明确

**何时不应使用：** 范围明确的单文件变更，或规格说明已经包含定义清晰的任务时。

## 规划流程

### 第 1 步：进入规划模式

在编写任何代码之前，以只读模式开展工作：

- 阅读规格说明及代码库中的相关部分
- 识别现有模式和约定
- 梳理组件之间的依赖关系
- 记录风险和未知事项

**规划期间不要编写代码。** 输出应是保存至 `tasks/plan.md` 的规划文档，以及保存至 `tasks/todo.md` 的任务列表，而不是具体实现。

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

不要先构建全部数据库，再构建全部 API，接着构建全部 UI，而应每次构建一条完整的功能路径：

**不好的做法（横向切分）：**
```
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**好的做法（纵向切分）：**
```
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

每个纵向切片都会交付可运行、可测试的功能。

### 第 4 步：编写任务

每个任务都遵循以下结构：

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

### 第 5 步：排序与检查点

安排任务时应确保：

1. 满足依赖关系（先构建基础）
2. 每个任务完成后，系统都处于可工作状态
3. 每完成 2-3 个任务设置一个验证检查点
4. 尽早处理高风险任务（快速失败）

添加明确的检查点：

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
| **L** | 5-8 | 多组件功能 | 带筛选和分页的搜索 |
| **XL** | 8+ | **规模过大 — 需要进一步拆分** | — |

如果任务规模为 L 或更大，应将其拆分为更小的任务。智能体处理 S 和 M 规模的任务时效果最佳。

**何时需要进一步拆分任务：**
- 需要超过一次专注会话才能完成（大约需要智能体工作 2 小时以上）
- 无法用 3 个或更少的要点描述验收标准
- 涉及两个或更多相互独立的子系统（例如身份验证和计费）
- 你发现自己在任务标题中使用“和”（这表明它实际上是两个任务）

## 输出文件

- **计划文档：** 将实施计划保存到 `tasks/plan.md`。
- **任务列表：** 将检查清单形式的任务列表保存到 `tasks/todo.md`。

如果 `tasks/` 目录不存在，请创建它。这些路径是 `/build` 命令和其他下游工具所遵循的约定。

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

## 并行处理机会

当有多个智能体或会话可用时：

- **可安全并行处理：** 相互独立的功能切片、针对已实现功能的测试、文档
- **必须按顺序执行：** 数据库迁移、共享状态变更、依赖链
- **需要协调：** 共享 API 契约的功能（先定义契约，再并行处理）

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我可以边做边想” | 这会让你最终陷入混乱并返工。花 10 分钟做计划可以节省数小时。 |
| “任务很明显” | 无论如何都要把它们写下来。明确的任务可以暴露隐藏的依赖关系和被遗忘的边界情况。 |
| “规划是额外负担” | 规划本身就是任务。没有计划的实施只是在敲代码。 |
| “我可以全都记在脑子里” | 上下文窗口是有限的。书面计划可以跨越会话边界，并在上下文压缩后继续保留。 |

## 危险信号

- 在没有书面任务清单的情况下开始实施
- 任务只写着“实现该功能”，却没有验收标准
- 计划中没有验证步骤
- 所有任务的规模都是 XL
- 任务之间没有检查点
- 未考虑依赖顺序

## 验证

开始实施之前，请确认：

- [ ] 每项任务都有验收标准
- [ ] 每项任务都有验证步骤
- [ ] 已识别任务依赖关系，并按正确顺序排列
- [ ] 每项任务涉及的文件不超过约 5 个
- [ ] 各主要阶段之间设有检查点
- [ ] 人工已审核并批准该计划

## 另请参阅

验收标准针对单项任务，用于回答“我们是否构建了正确的东西？”。它们建立在项目级完成定义之上；完成定义是每项任务在被视为完成之前都必须达到的统一标准。请参阅 `../../references/definition-of-done.md`。