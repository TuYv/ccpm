---
name: planning-and-task-breakdown
description: Breaks work into ordered tasks. Use when you have a spec or clear requirements and need to break work into implementable tasks. Use when a task feels too large to start, when you need to estimate scope, or when parallel work is possible.
---
# 规划与任务拆分

## 概述

将工作分解为具有明确验收标准的小型、可验证任务。良好的任务拆分决定了一个智能体是能够可靠地完成工作，还是会产出一团乱麻。每个任务都应足够小，以便在一次专注的工作会话中完成实现、测试和验证。

## 何时使用

- 你已有规范，需要将其拆分为可实现的单元
- 任务过大或过于模糊，难以着手
- 工作需要由多个智能体或多个会话并行完成
- 你需要向人类说明工作范围
- 实现顺序并不明确

**何时不应使用：**范围明确的单文件更改，或规范中已经包含定义清晰的任务。

## 规划流程

### 第 1 步：进入规划模式

在编写任何代码之前，以只读模式开展工作：

- 阅读规范和代码库中的相关部分
- 识别现有模式和约定
- 梳理组件之间的依赖关系
- 记录风险和未知事项

**规划期间不要编写代码。**输出应是一份保存到 `tasks/plan.md` 的规划文档，以及一份记录在任务列表目标中的任务列表（参见“输出文件”；默认为 `tasks/todo.md`），而不是具体实现。

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

### 第 3 步：垂直切分

不要先构建所有数据库部分，再构建所有 API，接着构建所有 UI——而应每次构建一条完整的功能路径：

**错误示例（水平切分）：**
```
Task 1: Build entire database schema
Task 2: Build all API endpoints
Task 3: Build all UI components
Task 4: Connect everything
```

**正确示例（垂直切分）：**
```
Task 1: User can create an account (schema + API + UI for registration)
Task 2: User can log in (auth schema + API + UI for login)
Task 3: User can create a task (task schema + API + UI for creation)
Task 4: User can view task list (query + API + UI for list view)
```

每个垂直切片都应交付可运行、可测试的功能。

### 第 4 步：编写任务

无论任务最终写入 Markdown 任务列表，还是作为条目添加到外部跟踪器中（参见“输出文件”），每个任务都应遵循以下结构：

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

1. 满足依赖关系（先构建基础部分）
2. 每个任务完成后，系统都处于可工作状态
3. 每完成 2-3 个任务设置一个验证检查点
4. 高风险任务优先执行（快速失败）

将明确的检查点添加到任务列表目标中：

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
| **XL** | 8+ | **规模过大——需要进一步拆分** | — |

如果任务规模为 L 或更大，应将其拆分为更小的任务。智能体执行 S 和 M 规模的任务时效果最佳。

**何时需要进一步拆分任务：**
- 需要超过一次专注工作时段才能完成（大约需要智能体工作 2 小时以上）
- 无法用不超过 3 个要点描述验收标准
- 涉及两个或更多相互独立的子系统（例如身份验证和计费）
- 你发现自己在任务标题中使用“和”（这表明它实际上是两个任务）

## 输出文件

- **计划文档：** 将实施计划保存到 `tasks/plan.md`。它始终是一个 Markdown 文件——设计决策、风险和开放问题无法清晰地映射到单独的跟踪器事项中。
- **任务列表：** 将每个任务记录到**任务列表目标**中（定义见下文）。

如果 `tasks/` 目录不存在，请创建它。

**切勿覆盖尚未完成的计划。** 在写入 `tasks/plan.md` 或 `tasks/todo.md` 之前，请检查它们是否已经存在，并且仍包含未勾选的任务：

- 对同一项工作重新规划（用户要求修改或扩展此计划）→ 就地更新现有文件。
- 不同的工作 → **停止并询问。** 这些未勾选的任务可能正由另一个会话执行。不要自行删除、覆盖或重命名现有文件；请说明冲突并让用户决定（先完成旧计划、明确放弃旧计划，或告知你新计划应保存到哪里）。

同样的规则也适用于外部任务列表目标：切勿为了给新计划腾出空间，而批量关闭或删除另一项计划中尚未完成的跟踪器事项。

### 任务列表目标

任务列表目标是记录任务和检查点的位置。它在此处统一定义一次；本技能中的所有其他引用均以此定义为准。

- **默认：位于 `tasks/todo.md` 的清单式 Markdown 文件。** 这是 `/build` 命令和其他下游工具所采用的约定。除非项目另有规定，否则请使用它。
- **外部跟踪器：** 如果项目的智能体规则（`CLAUDE.md`、`AGENTS.md` 等）或用户指定了事项跟踪器（例如 GitHub Issues、Jira、Linear、`bd`/beads），请为每个任务创建一个跟踪器事项，而不是写入 `tasks/todo.md`。将步骤 4 的结构映射到跟踪器字段：在事项正文中填写验收标准和验证步骤，并通过跟踪器的关联机制（`bd dep add`、"blocked by" 等）记录依赖关系。也要将步骤 5 的检查点记录为跟踪器事项；如果跟踪器没有自然对应的形式，则将其作为清单记录在计划文档中。

使用外部跟踪器时，请在 `tasks/plan.md` 中注明（例如 "Tasks tracked in Linear project FOO"），以便下游步骤和未来会话知道去哪里查找；同时，应将计划文档的任务列表部分保留为跟踪器条目 ID 或链接的有序索引，而不是重复的检查清单。

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

当任务位于外部跟踪器中时，请将上述任务列表部分保留为跟踪器条目 ID 或链接的有序索引，而不是重复的检查清单。

## 并行处理机会

当有多个代理或会话可用时：

- **可安全并行处理：** 相互独立的功能切片、已实现功能的测试、文档
- **必须按顺序处理：** 数据库迁移、共享状态变更、依赖链
- **需要协调：** 共享 API 契约的功能（先定义契约，再并行处理）

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| "我会边做边弄明白" | 这只会让你最终陷入混乱并返工。花 10 分钟规划可以节省数小时。 |
| "这些任务显而易见" | 无论如何都要写下来。明确的任务可以暴露隐藏的依赖关系和被遗忘的边界情况。 |
| "规划是额外负担" | 规划本身就是任务。没有计划的实现只是在敲代码。 |
| "我可以把所有内容都记在脑子里" | 上下文窗口是有限的。书面计划可以跨越会话边界和上下文压缩而保留下来。 |
| "旧的 `tasks/plan.md` 已经过时了，我直接替换它就好" | 未勾选的任务可能正在另一个会话中构建。覆盖它们会破坏不存在于其他任何地方的工作状态。停下来询问。 |

## 危险信号

- 在没有书面任务列表的情况下开始实现
- 未经询问，覆盖仍包含其他工作未勾选任务的 `tasks/plan.md` 或 `tasks/todo.md`
- 项目已指定外部跟踪器时仍编写 `tasks/todo.md`（或将任务分散在两者之中）
- 任务只写“实现该功能”，却没有验收标准
- 计划中没有验证步骤
- 所有任务的规模都是 XL
- 任务之间没有检查点
- 未考虑依赖顺序

## 验证

开始实现之前，请确认：

- [ ] 每个任务都有验收标准
- [ ] 每个任务都有验证步骤
- [ ] 已识别任务依赖关系，并按正确顺序排列
- [ ] 任务已记录在任务列表目标中（默认为 `tasks/todo.md`）
- [ ] 未经用户明确确认，没有覆盖任何预先存在且尚未完成的计划
- [ ] 每个任务涉及的文件不超过约 5 个
- [ ] 主要阶段之间设有检查点
- [ ] 人工已审查并批准该计划

## 另请参阅

验收标准针对每项任务，回答“我们是否构建了正确的东西？”。它们建立在项目范围的完成定义之上，这是每项任务在被视为完成之前都必须达到的既定标准。请参阅 `../../references/definition-of-done.md`。