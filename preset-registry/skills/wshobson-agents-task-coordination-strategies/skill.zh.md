---
name: task-coordination-strategies
description: Decompose complex tasks, design dependency graphs, and coordinate multi-agent work with proper task descriptions and workload balancing. Use this skill when breaking down work for agent teams, managing task dependencies, or monitoring team progress.
version: 1.0.2
---
# 任务协调策略

用于将复杂任务分解为可并行执行单元、设计依赖图、编写有效任务描述，以及跨智能体团队监控工作负载的策略。

## 何时使用此技能

- 将复杂任务分解以进行并行执行
- 设计任务依赖关系（blockedBy/blocks）
- 编写带有清晰验收标准的任务描述
- 监控和重新平衡队友之间的工作负载
- 识别多任务工作流中的关键路径

## 任务分解策略

### 按层分解

按架构层拆分工作：

- 前端组件
- 后端 API 端点
- 数据库迁移/模型
- 测试套件

**最适用于**：全栈功能、垂直切片

### 按组件分解

按功能组件拆分工作：

- 身份认证模块
- 用户资料模块
- 通知模块

**最适用于**：微服务、模块化架构

### 按关注点分解

按横切关注点拆分工作：

- 安全审查
- 性能审查
- 架构审查

**最适用于**：代码审查、审计

### 按文件所有权分解

按文件/目录边界拆分工作：

- `src/components/` — 实现者 1
- `src/api/` — 实现者 2
- `src/utils/` — 实现者 3

**最适用于**：并行实现、避免冲突

## 依赖图设计

### 原则

1. **最小化链深度** — 优先使用宽而浅的图，而非深链
2. **识别关键路径** — 最长的链决定了最短完成时间
3. **谨慎使用 blockedBy** — 只添加真正必要的依赖
4. **避免循环依赖** — 任务 A 阻塞 B、B 又阻塞 A 是一种死锁

### 模式

**独立（最佳并行度）**：

```
Task A ─┐
Task B ─┼─→ Integration
Task C ─┘
```

**顺序（必要依赖）**：

```
Task A → Task B → Task C
```

**菱形（混合）**：

```
        ┌→ Task B ─┐
Task A ─┤          ├→ Task D
        └→ Task C ─┘
```

### 使用 blockedBy/blocks

```
TaskCreate: { subject: "Build API endpoints" }         → Task #1
TaskCreate: { subject: "Build frontend components" }    → Task #2
TaskCreate: { subject: "Integration testing" }          → Task #3
TaskUpdate: { taskId: "3", addBlockedBy: ["1", "2"] }  → #3 waits for #1 and #2
```

## 任务描述最佳实践

每个任务都应包含：

1. **目标** — 需要完成什么（1-2 句话）
2. **拥有的文件** — 该队友可以修改的文件/目录的明确清单
3. **需求** — 期望的具体交付物或行为
4. **接口契约** — 这项工作如何与其他队友的工作衔接
5. **验收标准** — 如何验证任务已正确完成
6. **范围边界** — 明确哪些内容不在范围内

### 模板

```
## Objective
Build the user authentication API endpoints.

## Owned Files
- src/api/auth.ts
- src/api/middleware/auth-middleware.ts
- src/types/auth.ts (shared — read only, do not modify)

## Requirements
- POST /api/login — accepts email/password, returns JWT
- POST /api/register — creates new user, returns JWT
- GET /api/me — returns current user profile (requires auth)

## Interface Contract
- Import User type from src/types/auth.ts (owned by implementer-1)
- Export AuthResponse type for frontend consumption

## Acceptance Criteria
- All endpoints return proper HTTP status codes
- JWT tokens expire after 24 hours
- Passwords are hashed with bcrypt

## Out of Scope
- OAuth/social login
- Password reset flow
- Rate limiting
```

## 工作负载监控

### 失衡的指标

| 信号                     | 含义         | 行动                 |
| -------------------------- | ------------ | -------------------- |
| 队友空闲，其他人忙碌       | 分配不均     | 重新分配待处理任务   |
| 队友卡在某个任务上         | 可能存在阻塞 | 主动询问，提供帮助   |
| 所有任务都被阻塞           | 依赖问题     | 优先解决关键路径     |
| 某队友的任务量是其他人的 3 倍 | 过载         | 拆分任务或重新分配   |

### 重新平衡的步骤

1. 调用 `TaskList` 评估当前状态
2. 识别空闲或过载的队友
3. 使用 `TaskUpdate` 重新分配任务
4. 使用 `SendMessage` 通知受影响的队友
5. 监控吞吐量是否改善
