---
name: documentation-and-adrs
description: Records decisions and documentation. Use when you need to document an architecture decision (ADR) or the reasoning behind a design choice, when changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
---
# 文档与 ADR

## 概述

记录决策，而不仅仅是代码。最有价值的文档会捕捉 *为什么* —— 促成某个决策的上下文、约束和权衡。代码展示的是 *做了什么*；文档解释的是 *为什么要这样做* 以及 *还考虑过哪些替代方案*。这些上下文对于以后在代码库中工作的人员和代理都至关重要。

## 何时使用

- 做出重大的架构决策
- 在竞争方案之间做选择
- 添加或修改公共 API
- 发布会改变用户可见行为的功能
- 为项目引入新的团队成员（或代理）
- 当你发现自己在反复解释同一件事时

**不要在以下情况下使用：** 不要为显而易见的代码写文档。不要添加重复代码已有内容的注释。不要为一次性原型编写文档。

## 架构决策记录（ADR）

ADR 记录重大技术决策背后的理由。它们是你能写出的价值最高的文档。

### 何时编写 ADR

- 选择框架、库或主要依赖
- 设计数据模型或数据库模式
- 选择认证策略
- 决定 API 架构（REST vs. GraphQL vs. tRPC）
- 在构建工具、托管平台或基础设施之间做选择
- 任何一项变更后会很难回退的决策

### 先匹配现有约定

在创建 ADR 之前，先检查可用的仓库上下文中是否已有既定约定——现有 ADR、项目说明以及与 ADR 相关的配置或工具（例如 `.adr-dir` 文件）。既定约定优先于下面的默认值。请匹配：

- **位置和格式** —— 例如 `docs/adr/*.md`、`Documentation/Decisions/*.rst`、MADR 布局，或 `adr-tools` 方案。匹配现有目录、文件扩展名和标记格式（Markdown vs reStructuredText）。
- **编号和命名** —— 延续现有序列和文件名模式（`ADR-004-Title.rst`、`0004-title.md`，等等）；不要从 001 重新开始，也不要引入第二套方案。
- **章节标题** —— 重用项目已有的标题集合，而不是强行套用这个模板。

如果现有证据相互冲突，应当将冲突明确指出，而不是悄悄引入另一套方案。只有在无法建立任何约定时，才应用下面的默认方案。

### ADR 模板

将 ADR 存放在 `docs/decisions/` 中，采用连续编号（除非项目已经使用了其他位置——见上文）：

```markdown
# ADR-001: Use PostgreSQL for primary database

## Status
Accepted | Superseded by ADR-XXX | Deprecated

## Date
2025-01-15

## Context
We need a primary database for the task management application. Key requirements:
- Relational data model (users, tasks, teams with relationships)
- ACID transactions for task state changes
- Support for full-text search on task content
- Managed hosting available (for small team, limited ops capacity)

## Decision
Use PostgreSQL with Prisma ORM.

## Alternatives Considered

### MongoDB
- Pros: Flexible schema, easy to start with
- Cons: Our data is inherently relational; would need to manage relationships manually
- Rejected: Relational data in a document store leads to complex joins or data duplication

### SQLite
- Pros: Zero configuration, embedded, fast for reads
- Cons: Limited concurrent write support, no managed hosting for production
- Rejected: Not suitable for multi-user web application in production

### MySQL
- Pros: Mature, widely supported
- Cons: PostgreSQL has better JSON support, full-text search, and ecosystem tooling
- Rejected: PostgreSQL is the better fit for our feature requirements

## Consequences
- Prisma provides type-safe database access and migration management
- We can use PostgreSQL's full-text search instead of adding Elasticsearch
- Team needs PostgreSQL knowledge (standard skill, low risk)
- Hosting on managed service (Supabase, Neon, or RDS)
```

## ADR 生命周期

```
PROPOSED → ACCEPTED → (SUPERSEDED or DEPRECATED)
```

- **不要删除旧的 ADR。** 它们保留历史上下文。
- 当决策发生变化时，编写一份新的 ADR，引用并取代旧的 ADR。

## 行内文档

### 何时注释

注释 *为什么*，而不是 *是什么*：

```typescript
// BAD: Restates the code
// Increment counter by 1
counter += 1;

// GOOD: Explains non-obvious intent
// Rate limit uses a sliding window — reset counter at window boundary,
// not on a fixed schedule, to prevent burst attacks at window edges
if (now - windowStart > WINDOW_SIZE_MS) {
  counter = 0;
  windowStart = now;
}
```

### 何时不要注释

```typescript
// Don't comment self-explanatory code
function calculateTotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// Don't leave TODO comments for things you should just do now
// TODO: add error handling  ← Just add it

// Don't leave commented-out code
// const oldImplementation = () => { ... }  ← Delete it, git has history
```

### 记录已知陷阱

```typescript
/**
 * IMPORTANT: This function must be called before the first render.
 * If called after hydration, it causes a flash of unstyled content
 * because the theme context isn't available during SSR.
 *
 * See ADR-003 for the full design rationale.
 */
export function initializeTheme(theme: Theme): void {
  // ...
}
```

## API 文档

对于公共 API（REST、GraphQL、库接口）：

### 与类型内联（TypeScript 首选）

```typescript
/**
 * Creates a new task.
 *
 * @param input - Task creation data (title required, description optional)
 * @returns The created task with server-generated ID and timestamps
 * @throws {ValidationError} If title is empty or exceeds 200 characters
 * @throws {AuthenticationError} If the user is not authenticated
 *
 * @example
 * const task = await createTask({ title: 'Buy groceries' });
 * console.log(task.id); // "task_abc123"
 */
export async function createTask(input: CreateTaskInput): Promise<Task> {
  // ...
}
```

### REST API 的 OpenAPI / Swagger

```yaml
paths:
  /api/tasks:
    post:
      summary: Create a task
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CreateTaskInput'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Task'
        '422':
          description: Validation error
```

## README 结构

每个项目都应该有一个 README，覆盖以下内容：

```markdown
# Project Name

One-paragraph description of what this project does.

## Quick Start
1. Clone the repo
2. Install dependencies: `npm install`
3. Set up environment: `cp .env.example .env`
4. Run the dev server: `npm run dev`

## Commands
| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm test` | Run tests |
| `npm run build` | Production build |
| `npm run lint` | Run linter |

## Architecture
Brief overview of the project structure and key design decisions.
Link to ADRs for details.

## Contributing
How to contribute, coding standards, PR process.
```

## 变更日志维护

对于已发布的功能：

```markdown
# Changelog

## [1.2.0] - 2025-01-20
### Added
- Task sharing: users can share tasks with team members (#123)
- Email notifications for task assignments (#124)

### Fixed
- Duplicate tasks appearing when rapidly clicking create button (#125)

### Changed
- Task list now loads 50 items per page (was 20) for better UX (#126)
```

## 面向 Agent 的文档

针对 AI agent 上下文的特别考虑：

- **CLAUDE.md / 规则文件** — 记录项目约定，以便 agent 遵循
- **规格文件** — 保持规格更新，以便 agent 构建正确的内容
- **ADR** — 帮助 agent 理解过去决策的原因（避免重复决策）
- **内联注意事项** — 防止 agent 陷入已知陷阱

## 常见的合理化说辞

| 合理化说辞 | 现实 |
|---|---|
| “代码是自文档化的” | 代码展示做了什么。它不展示为什么、拒绝了哪些替代方案，或适用哪些约束。 |
| “等 API 稳定后再写文档” | 在记录文档后，API 会更快稳定。文档是设计的第一次测试。 |
| “没人看文档” | Agent 会看。未来的工程师会看。三个月后的你自己也会看。 |
| “ADR 是额外负担” | 一份花 10 分钟写的 ADR，能避免六个月后围绕同一决策进行 2 小时的争论。 |
| “注释会过时” | 关于*为什么*的注释很稳定。关于*做什么*的注释会过时——这就是你只写前者的原因。 |

## 危险信号

- 没有书面理由的架构决策
- 没有文档或类型的公共 API
- 未说明如何运行项目的 README
- 用注释掉的代码代替删除
- 已存在数周的 TODO 注释
- 在有重大架构选择的项目中没有 ADR
- 重述代码而非解释意图的文档

## 验证

完成文档编写后：

- [ ] 所有重大架构决策都有 ADR
- [ ] README 包含快速开始、命令和架构概览
- [ ] API 函数具有参数和返回类型文档
- [ ] 已知注意事项在相关位置以内联方式记录
- [ ] 不再保留注释掉的代码
- [ ] 规则文件（CLAUDE.md 等）保持最新且准确