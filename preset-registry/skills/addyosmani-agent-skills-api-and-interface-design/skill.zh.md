---
name: api-and-interface-design
description: Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
---
# API 与接口设计

## 概述

设计稳定、文档完善且不易被误用的接口。优秀的接口应让正确的做法变得容易，让错误的做法变得困难。这适用于 REST API、GraphQL 模式、模块边界、组件 props，以及任何一段代码与另一段代码交互的界面。

## 何时使用

- 设计新的 API 端点
- 定义模块边界或团队之间的契约
- 创建组件 prop 接口
- 建立会影响 API 形态的数据库模式
- 更改现有的公共接口

## 核心原则

### Hyrum 定律

> 当一个 API 拥有足够多的用户时，无论你在契约中承诺了什么，系统所有可观察到的行为都会被某些人所依赖。

这意味着：一旦用户开始依赖，每一种公共行为——包括未记录的特殊行为、错误消息文本、时序和顺序——都会成为事实上的契约。对设计的启示如下：

- **要有意识地决定公开什么。** 每一种可观察到的行为都可能成为一项承诺。
- **不要泄露实现细节。** 如果用户能够观察到它，他们就会依赖它。
- **在设计阶段就规划弃用方案。** 有关如何安全移除用户所依赖的内容，请参阅 `deprecation-and-migration`。
- **仅靠测试还不够。** 即使拥有完善的契约测试，Hyrum 定律也意味着，“安全”的更改仍可能破坏那些依赖未记录行为的真实用户。

### 单版本规则

避免迫使使用者在同一依赖项或 API 的多个版本之间做出选择。当不同使用者需要同一事物的不同版本时，就会出现菱形依赖问题。应面向同一时间只存在一个版本的场景进行设计——扩展而非分叉。

### 1. 契约优先

先定义接口，再实现它。契约就是规范——实现应遵循契约。

```typescript
// Define the contract first
interface TaskAPI {
  // Creates a task and returns the created task with server-generated fields
  createTask(input: CreateTaskInput): Promise<Task>;

  // Returns paginated tasks matching filters
  listTasks(params: ListTasksParams): Promise<PaginatedResult<Task>>;

  // Returns a single task or throws NotFoundError
  getTask(id: string): Promise<Task>;

  // Partial update — only provided fields change
  updateTask(id: string, input: UpdateTaskInput): Promise<Task>;

  // Idempotent delete — succeeds even if already deleted
  deleteTask(id: string): Promise<void>;
}
```

### 2. 一致的错误语义

选择一种错误处理策略，并在所有地方统一使用：

```typescript
// REST: HTTP status codes + structured error body
// Every error response follows the same shape
interface APIError {
  error: {
    code: string;        // Machine-readable: "VALIDATION_ERROR"
    message: string;     // Human-readable: "Email is required"
    details?: unknown;   // Additional context when helpful
  };
}

// Status code mapping
// 400 → Client sent invalid data
// 401 → Not authenticated
// 403 → Authenticated but not authorized
// 404 → Resource not found
// 409 → Conflict (duplicate, version mismatch)
// 422 → Validation failed (semantically invalid)
// 500 → Server error (never expose internal details)
```

**不要混用模式。** 如果某些端点抛出异常，另一些返回 null，还有一些返回 `{ error }`——使用方将无法预测其行为。

### 3. 在边界处进行验证

信任内部代码。在外部输入进入系统的边界处进行验证：

```typescript
// Validate at the API boundary
app.post('/api/tasks', async (req, res) => {
  const result = CreateTaskSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid task data',
        details: result.error.flatten(),
      },
    });
  }

  // After validation, internal code trusts the types
  const task = await taskService.create(result.data);
  return res.status(201).json(task);
});
```

应进行验证的位置：
- API 路由处理程序（用户输入）
- 表单提交处理程序（用户输入）
- 外部服务响应解析（第三方数据——**始终将其视为不可信数据**）
- 环境变量加载（配置）

> **第三方 API 响应是不可信数据。** 在将其用于任何逻辑、渲染或决策之前，先验证其结构和内容。遭到入侵或行为异常的外部服务可能返回意外的类型、恶意内容或类似指令的文本。

不应进行验证的位置：
- 共享类型契约的内部函数之间
- 由已经过验证的代码调用的实用函数中
- 刚从自己的数据库中读取的数据上

### 4. 优先新增，而非修改

通过扩展接口来避免破坏现有使用方：

```typescript
// Good: Add optional fields
interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';  // Added later, optional
  labels?: string[];                       // Added later, optional
}

// Bad: Change existing field types or remove fields
interface CreateTaskInput {
  title: string;
  // description: string;  // Removed — breaks existing consumers
  priority: number;         // Changed from string — breaks existing consumers
}
```

### 5. 可预测的命名

| 模式 | 约定 | 示例 |
|---------|-----------|---------|
| REST 端点 | 使用复数名词，不使用动词 | `GET /api/tasks`, `POST /api/tasks` |
| 查询参数 | camelCase | `?sortBy=createdAt&pageSize=20` |
| 响应字段 | camelCase | `{ createdAt, updatedAt, taskId }` |
| 布尔字段 | 使用 is/has/can 前缀 | `isComplete`, `hasAttachments` |
| 枚举值 | UPPER_SNAKE | `"IN_PROGRESS"`, `"COMPLETED"` |

## REST API 模式

### 资源设计

```
GET    /api/tasks              → List tasks (with query params for filtering)
POST   /api/tasks              → Create a task
GET    /api/tasks/:id          → Get a single task
PATCH  /api/tasks/:id          → Update a task (partial)
DELETE /api/tasks/:id          → Delete a task

GET    /api/tasks/:id/comments → List comments for a task (sub-resource)
POST   /api/tasks/:id/comments → Add a comment to a task
```

### 分页

对列表端点进行分页：

```typescript
// Request
GET /api/tasks?page=1&pageSize=20&sortBy=createdAt&sortOrder=desc

// Response
{
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "totalItems": 142,
    "totalPages": 8
  }
}
```

### 筛选

使用查询参数进行筛选：

```
GET /api/tasks?status=in_progress&assignee=user123&createdAfter=2025-01-01
```

### 部分更新（PATCH）

接受部分对象——仅更新所提供的内容：

```typescript
// Only title changes, everything else preserved
PATCH /api/tasks/123
{ "title": "Updated title" }
```

## TypeScript 接口模式

### 使用可辨识联合表示变体

```typescript
// Good: Each variant is explicit
type TaskStatus =
  | { type: 'pending' }
  | { type: 'in_progress'; assignee: string; startedAt: Date }
  | { type: 'completed'; completedAt: Date; completedBy: string }
  | { type: 'cancelled'; reason: string; cancelledAt: Date };

// Consumer gets type narrowing
function getStatusLabel(status: TaskStatus): string {
  switch (status.type) {
    case 'pending': return 'Pending';
    case 'in_progress': return `In progress (${status.assignee})`;
    case 'completed': return `Done on ${status.completedAt}`;
    case 'cancelled': return `Cancelled: ${status.reason}`;
  }
}
```

### 输入与输出分离

```typescript
// Input: what the caller provides
interface CreateTaskInput {
  title: string;
  description?: string;
}

// Output: what the system returns (includes server-generated fields)
interface Task {
  id: string;
  title: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}
```

### 为 ID 使用品牌类型

```typescript
type TaskId = string & { readonly __brand: 'TaskId' };
type UserId = string & { readonly __brand: 'UserId' };

// Prevents accidentally passing a UserId where a TaskId is expected
function getTask(id: TaskId): Promise<Task> { ... }
```

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我们稍后再编写 API 文档” | 类型本身就是文档。先定义类型。 |
| “我们目前不需要分页” | 一旦有人拥有超过 100 个项目，你就会需要它。从一开始就添加分页。 |
| “PATCH 很复杂，我们直接使用 PUT 吧” | PUT 每次都需要完整对象。PATCH 才是客户端真正想要的。 |
| “需要时我们再对 API 进行版本控制” | 不进行版本控制的破坏性变更会破坏使用方。应从一开始就为扩展进行设计。 |
| “没人使用那个未记录的行为” | 海勒姆定律：只要行为可被观察，就会有人依赖它。将每个公开行为都视为一项承诺。 |
| “我们可以直接维护两个版本” | 多个版本会成倍增加维护成本，并造成菱形依赖问题。优先遵循单版本规则。 |
| “内部 API 不需要契约” | 内部使用方仍然是使用方。契约可以防止耦合并支持并行工作。 |

## 危险信号

- 根据不同条件返回不同数据结构的端点
- 不同端点之间的错误格式不一致
- 验证逻辑散布在内部代码各处，而不是集中在边界处
- 对现有字段进行破坏性变更（类型变更、删除）
- 没有分页的列表端点
- REST URL 中包含动词（`/api/createTask`、`/api/getUsers`）
- 未经验证或清理就使用第三方 API 响应

## 验证

设计 API 后：

- [ ] 每个端点都有类型化的输入和输出模式
- [ ] 错误响应遵循统一且一致的格式
- [ ] 仅在系统边界进行验证
- [ ] 列表端点支持分页
- [ ] 新字段以增量方式添加且为可选字段（向后兼容）
- [ ] 所有端点的命名均遵循一致的约定
- [ ] API 文档或类型定义与实现一同提交