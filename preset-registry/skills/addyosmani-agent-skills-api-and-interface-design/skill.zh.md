---
name: api-and-interface-design
description: Guides stable API and interface design. Use when designing APIs, module boundaries, or any public interface. Use when creating REST or GraphQL endpoints, defining type contracts between modules, or establishing boundaries between frontend and backend.
---
# API 与接口设计

## 概述

设计稳定、文档完善且不易被误用的接口。良好的接口让正确的做法变得容易，让错误的做法变得困难。这适用于 REST API、GraphQL schema、模块边界、组件 props，以及任何一段代码与另一段代码交互的界面。

## 何时使用

- 设计新的 API 端点
- 定义模块边界或团队之间的契约
- 创建组件 prop 接口
- 建立决定 API 形态的数据库 schema
- 更改现有的公共接口

## 核心原则

### Hyrum 定律

> 当一个 API 拥有足够多的用户时，无论你在契约中承诺了什么，系统所有可观察到的行为都会被某些人依赖。

这意味着：一旦用户开始依赖，每一种公共行为——包括未记录的特殊行为、错误消息文本、时序和顺序——都会成为事实上的契约。设计时应注意：

- **慎重决定暴露哪些内容。** 每一种可观察行为都可能成为一项承诺。
- **不要泄露实现细节。** 如果用户能够观察到它，他们就会依赖它。
- **在设计阶段就规划弃用。** 有关如何安全移除用户所依赖内容的方法，请参阅 `deprecation-and-migration`。
- **仅有测试还不够。** 即使契约测试十分完善，Hyrum 定律也意味着看似“安全”的更改仍可能破坏依赖未记录行为的真实用户。

### 单一版本规则

避免迫使使用者在同一个依赖项或 API 的多个版本之间做出选择。当不同使用者需要同一事物的不同版本时，就会出现菱形依赖问题。应基于同一时间只有一个版本存在的情形进行设计——选择扩展，而不是分叉。

### 1. 契约优先

在实现之前定义接口。契约就是规范——实现应遵循契约。

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

**不要混用模式。** 如果某些端点抛出异常，另一些返回 null，还有一些返回 `{ error }`——消费者将无法预测其行为。

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
- API 路由处理器（用户输入）
- 表单提交处理器（用户输入）
- 外部服务响应解析（第三方数据——**始终将其视为不可信数据**）
- 环境变量加载（配置）

> **第三方 API 响应是不可信数据。** 在将其用于任何逻辑、渲染或决策之前，应验证其结构和内容。遭到入侵或行为异常的外部服务可能返回意外类型、恶意内容或类似指令的文本。

不应进行验证的位置：
- 共享类型契约的内部函数之间
- 由已经过验证的代码调用的实用函数中
- 刚从自己的数据库中获取的数据上

### 4. 优先新增，而非修改

扩展接口时不要破坏现有消费者：

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

### 6. 正确履行幂等键契约

接受 `Idempotency-Key` 是契约。正确履行该契约才是实现，而资金损失往往就发生在这里——服务器接受了某个键却草率处理，比完全不接受该键更糟，因为此时客户端会认为重试是安全的。

**根据意图而非尝试来派生键。** 对同一意图的多次重试，键必须保持稳定；对于不同的意图，键必须不同：

```typescript
crypto.randomUUID()                    // ✗ new key per attempt — every retry is a new charge
`${userId}:${amount}`                  // ✗ two legitimate $50 charges collapse into one
`${orderId}:${Date.now()}`             // ✗ a timestamp is randomUUID() wearing a hat

req.headers['idempotency-key']         // ✓ client generates once, reuses on retry
`charge:v1:${orderId}`                 // ✓ derived from an immutable identifier
```

该键来自客户端或发起事件——绝不能来自执行重试的层。

**以原子方式抢占。先检查再执行会产生竞态条件：**

```typescript
// ✗ TOCTOU: two concurrent retries both read "not seen", both charge
if (!(await db.exists(key))) {
  await chargeCard(amount);
  await db.insert(key);
}

// ✓ let the unique constraint pick the winner
try {
  await db.insert({ key, state: 'in_progress', requestHash });
} catch (e) {
  if (isUniqueViolation(e)) return replayOrReject(key);
  throw;
}
const result = await chargeCard(amount);
await db.update({ key, state: 'succeeded', response: result });
```

唯一约束*就是*实现机制。无法通过单次操作强制保证唯一性的存储系统无法支撑这一机制。

**校验载荷。**同一个键对应不同的请求体属于客户端错误，必须明确报错，而不是把第一个请求的响应返回给第二个请求：

```typescript
if (existing.requestHash !== hash(req.body)) {
  return res.status(422).json({ error: 'idempotency key reused with a different payload' });
}
```

**确定如何处理执行中的重复请求。**第二个请求到达时，第一个请求仍在执行——这在重试风暴中很常见：

| 策略 | 响应 | 适用场景 |
|---|---|---|
| 拒绝 | `409 Conflict` | 客户端可以稍后重试；最简单且最安全 |
| 等待 | 在限定时间内阻塞并等待结果 | 调用方需要同步获得结果 |
| 返回待处理状态 | `202` + 状态 URL | 长时间运行的副作用操作 |

绝不能因为第一个调用方“似乎卡住了”就放行第二个调用方。某次停滞的尝试结果未知，而此时执行重复操作造成的代价恰恰最大。

**每次调用都有三种结果，而不是两种：成功、失败和_未知_。**超时并不能说明副作用是否已生效。在发起外部调用*之前*记录意图，这样一来，如果在调用和响应之间发生崩溃，就会留下证据，表明存在必须稍后解决的事项——而不是静默地重试扣款。

**根据最长重试链设置保留期限**，而不是根据磁盘成本设置。键的存续时间必须长于所有可能重新投递同一意图的路径，包括一周后重放的死信队列以及任何提供方的争议期。在为期 7 天的 DLQ 后使用 TTL 为 24 小时的键，重复操作迟早会发生。

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

### 对变体使用可辨识联合类型

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

### 输入/输出分离

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

### 对 ID 使用品牌类型

```typescript
type TaskId = string & { readonly __brand: 'TaskId' };
type UserId = string & { readonly __brand: 'UserId' };

// Prevents accidentally passing a UserId where a TaskId is expected
function getTask(id: TaskId): Promise<Task> { ... }
```

## 常见的自我辩解

| 自我辩解 | 事实 |
|---|---|
| “我们以后再编写 API 文档” | 类型本身就是文档。应先定义类型。 |
| “我们现在不需要分页” | 一旦有人拥有 100 多个项目，你就会需要它。从一开始就添加分页。 |
| “PATCH 太复杂了，我们直接使用 PUT 吧” | PUT 要求每次都提供完整对象。PATCH 才是客户端真正需要的。 |
| “等需要时，我们再对 API 进行版本控制” | 没有版本控制的破坏性变更会破坏使用方。应从一开始就为扩展进行设计。 |
| “没人使用那个未记录的行为” | 休伦定律：只要行为可观察，就会有人依赖它。应将每项公开行为都视为一项承诺。 |
| “我们可以只维护两个版本” | 多个版本会成倍增加维护成本，并产生菱形依赖问题。优先遵循单一版本规则。 |
| “内部 API 不需要契约” | 内部使用方仍然是使用方。契约可防止耦合，并支持并行工作。 |
| “接受 Idempotency-Key 请求头就足够了” | 请求头是契约；将该键与结果关联存储才是实现。如果接受了键却不遵守其约定，就会让客户端误以为重试是安全的，而事实并非如此。 |
| “我们的队列保证精确一次投递” | 没有任何队列能在使用方崩溃时做到这一点——消息代理的确认操作与你的副作用并不处于同一事务中。应按至少一次投递进行设计，并采用幂等处理。 |
| “重复请求很少见” | 它们具有*相关性*。恰恰在依赖项降级时，重试会激增——此时重复请求最有可能出现，代价也最高。 |

## 危险信号

- 端点根据不同条件返回不同的结构
- 各端点的错误格式不一致
- 验证逻辑散落在内部代码中，而不是集中在系统边界
- 对现有字段进行破坏性更改（类型变更、移除）
- 列表端点不支持分页
- REST URL 中包含动词（`/api/createTask`、`/api/getUsers`）
- 使用第三方 API 响应时未进行验证或净化处理
- 先对幂等键执行 `SELECT`，然后再执行 `INSERT`——这是竞态条件，而不是防护措施
- 幂等键派生自 UUID、时间戳或任何会在每次尝试时重新生成的内容
- 使用不同的请求正文时仍接受相同的键，并静默返回第一次的响应
- 键的保留期限短于可能重新投递请求的最长路径

## 验证

设计 API 后：

- [ ] 每个端点都有带类型的输入和输出模式
- [ ] 错误响应遵循统一且一致的格式
- [ ] 验证仅在系统边界进行
- [ ] 列表端点支持分页
- [ ] 新字段仅以增量方式添加且为可选字段（向后兼容）
- [ ] 所有端点的命名均遵循一致的约定
- [ ] API 文档或类型定义与实现一同提交
- [ ] 改变状态的端点要么支持幂等键，要么明确说明重试不安全
- [ ] 通过单次原子操作认领键，并由唯一约束提供保障
- [ ] 使用不同的有效负载复用同一个键时，应明确失败，而不是重放错误的响应
- [ ] 对处理中重复请求的响应是经过审慎选择的（409、等待或 202），而不是任由实现自然产生的结果
- [ ] 键的保留期限长于最长的重试路径，包括死信重放