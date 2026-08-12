---
name: documentation-and-adrs
description: Records decisions and documentation. Use when making architectural decisions, changing public APIs, shipping features, or when you need to record context that future engineers and agents will need to understand the codebase.
---
# 文档与 ADR

## 概述

记录决策，而不仅仅是代码。最有价值的文档会捕捉决策背后的*原因*——促成某项决策的背景、约束和权衡。代码展示构建了*什么*；文档则解释*为什么要以这种方式构建*，以及*考虑过哪些替代方案*。对于未来在代码库中工作的人员和智能体而言，这些背景信息至关重要。

## 何时使用

- 做出重大架构决策时
- 在相互竞争的方案之间进行选择时
- 添加或更改公共 API 时
- 发布会改变面向用户行为的功能时
- 帮助新团队成员（或智能体）熟悉项目时
- 当你发现自己在反复解释同一件事时

**不应使用的情况：**不要为显而易见的代码编写文档。不要添加只是复述代码内容的注释。不要为一次性原型编写文档。

## 架构决策记录（ADR）

ADR 用于记录重大技术决策背后的推理过程。它们是你所能编写的最有价值的文档。

### 何时编写 ADR

- 选择框架、库或主要依赖项
- 设计数据模型或数据库模式
- 选择身份验证策略
- 决定 API 架构（REST、GraphQL 或 tRPC）
- 在构建工具、托管平台或基础设施之间进行选择
- 任何撤销成本高昂的决策

### 首先遵循现有约定

创建 ADR 之前，请检查可用的仓库上下文中是否存在既定约定——现有 ADR、项目说明，以及与 ADR 相关的配置或工具（例如 `.adr-dir` 文件）。既定约定优先于下方的默认设置。应匹配：

- **位置和格式**——例如 `docs/adr/*.md`、`Documentation/Decisions/*.rst`、MADR 布局或 `adr-tools` 配置。匹配现有目录、文件扩展名和标记语言（Markdown 或 reStructuredText）。
- **编号和命名**——延续现有的编号顺序和文件名模式（`ADR-004-Title.rst`、`0004-title.md`，……）；不要从 001 重新开始，也不要引入第二套方案。
- **章节标题**——复用项目的标题集合，而不是强行套用此模板中的标题。

如果现有证据相互冲突，应明确指出冲突，而不是悄然引入另一套方案。只有在无法确定任何约定时，才应用下方的默认设置。

### ADR 模板

将 ADR 存储在 `docs/decisions/` 中并使用连续编号（除非项目已使用其他位置——见上文）：

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

### ADR 生命周期

```
PROPOSED → ACCEPTED → (SUPERSEDED or DEPRECATED)
```

- **不要删除旧的 ADR。** 它们记录了历史背景。
- 当决策发生变化时，编写一个新的 ADR，并在其中引用和取代旧的 ADR。

## 行内文档

### 何时添加注释

注释应说明*为什么*，而不是*做什么*：

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

### 何时不应添加注释

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

### 记录已知的注意事项

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

### 与类型一起内联编写（TypeScript 的首选方式）

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

### REST API 使用 OpenAPI / Swagger

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

每个项目都应包含一个涵盖以下内容的 README：

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

## 面向智能体的文档

针对 AI 智能体上下文的特别注意事项：

- **CLAUDE.md / 规则文件** — 记录项目约定，以便智能体遵循
- **规格文件** — 及时更新规格，确保智能体构建正确的功能
- **ADR** — 帮助智能体理解过去做出决策的原因（避免重新决策）
- **内联注意事项** — 防止智能体掉入已知陷阱

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “代码本身就是文档” | 代码展示的是做了什么，却不会说明为什么这样做、否决了哪些替代方案，或存在哪些约束。 |
| “等 API 稳定后我们再写文档” | 编写文档能让 API 更快稳定下来。文档是对设计的第一次检验。 |
| “没人看文档” | 智能体会看。未来的工程师会看。三个月后的你也会看。 |
| “ADR 是额外负担” | 一份花 10 分钟编写的 ADR，可以避免六个月后针对同一决策进行一场耗时 2 小时的争论。 |
| “注释会过时” | 关于*为什么*的注释是稳定的。关于*做了什么*的注释会过时——所以你只应编写前者。 |

## 危险信号

- 架构决策没有书面理由
- 公共 API 没有文档或类型
- README 未说明如何运行项目
- 使用注释掉的代码，而不是将其删除
- TODO 注释已存在数周
- 项目中存在重要的架构选择，却没有 ADR
- 文档只是复述代码，而不是解释意图

## 验证

完成文档编写后：

- [ ] 所有重要的架构决策都有对应的 ADR
- [ ] README 涵盖快速入门、命令和架构概览
- [ ] API 函数具有参数和返回类型文档
- [ ] 已知的注意事项已在相关位置以内联方式记录
- [ ] 不再残留注释掉的代码
- [ ] 规则文件（CLAUDE.md 等）是最新且准确的