---
name: parallel-execution
description: Patterns for parallel subagent execution using Task tool with run_in_background. Use when coordinating multiple independent tasks, spawning dynamic subagents, or implementing features that can be parallelized.
---
# 并行执行模式

### 何时加载

- **触发条件**：多智能体任务、并发操作、生成子智能体、并行处理相互独立的工作
- **跳过条件**：单步骤任务或没有并行化机会的顺序工作流

## 核心概念

并行执行使用 Task 工具并设置 `run_in_background: true`，同时生成多个子智能体。这样可让 N 个任务并发运行，从而大幅缩短总执行时间。

**关键规则**：要实现真正的并行，所有 Task 调用都必须位于同一条 assistant 消息中。如果 Task 调用位于不同消息中，它们将按顺序运行。

## 执行协议

### 步骤 1：识别可并行化的任务

生成子智能体之前，请确认任务彼此独立：

- 任何任务都不依赖其他任务的输出
- 各任务针对不同的文件或关注点
- 可以同时运行且不会产生冲突

### 步骤 2：准备动态子智能体提示词

每个子智能体都会收到一个定义其角色的自定义提示词：

```
You are a [ROLE] specialist for this specific task.

Task: [CLEAR DESCRIPTION]

Context:
[RELEVANT CONTEXT ABOUT THE CODEBASE/PROJECT]

Files to work with:
[SPECIFIC FILES OR PATTERNS]

Output format:
[EXPECTED OUTPUT STRUCTURE]

Focus areas:
- [PRIORITY 1]
- [PRIORITY 2]
```

### 步骤 3：在一条消息中启动所有任务

**关键要求**：在同一条 assistant 消息中进行所有 Task 调用：

```
I'm launching N parallel subagents:

[Task 1]
description: "Subagent A - [brief purpose]"
prompt: "[detailed instructions for subagent A]"
run_in_background: true

[Task 2]
description: "Subagent B - [brief purpose]"
prompt: "[detailed instructions for subagent B]"
run_in_background: true

[Task 3]
description: "Subagent C - [brief purpose]"
prompt: "[detailed instructions for subagent C]"
run_in_background: true
```

### 步骤 4：使用 TaskOutput 获取结果

启动后，获取每项任务的结果：

```
[Wait for completion, then retrieve]

TaskOutput: task_1_id
TaskOutput: task_2_id
TaskOutput: task_3_id
```

### 步骤 5：整合结果

将所有子智能体的输出合并为统一结果：

- 合并相关发现
- 解决建议之间的冲突
- 按严重程度/重要性确定优先级
- 创建可执行的总结

## 动态子智能体模式

### 模式 1：基于任务的并行化

当有 N 个任务需要实现时，生成 N 个子智能体：

```
Plan:
1. Implement auth module
2. Create API endpoints
3. Add database schema
4. Write unit tests
5. Update documentation

Spawn 5 subagents (one per task):
- Subagent 1: Implements auth module
- Subagent 2: Creates API endpoints
- Subagent 3: Adds database schema
- Subagent 4: Writes unit tests
- Subagent 5: Updates documentation
```

### 模式 2：基于目录的并行化

同时分析多个目录：

```
Directories: src/auth, src/api, src/db

Spawn 3 subagents:
- Subagent 1: Analyzes src/auth
- Subagent 2: Analyzes src/api
- Subagent 3: Analyzes src/db
```

### 模式 3：基于视角的并行化

同时从多个角度进行审查：

```
Perspectives: Security, Performance, Testing, Architecture

Spawn 4 subagents:
- Subagent 1: Security review
- Subagent 2: Performance analysis
- Subagent 3: Test coverage review
- Subagent 4: Architecture assessment
```

## TodoWrite 集成

使用并行执行时，TodoWrite 的行为有所不同：

**顺序执行**：同一时间只能有一个任务处于 `in_progress` 状态  
**并行执行**：可以有多个任务同时处于 `in_progress` 状态

```
# Before launching parallel tasks
todos = [
  { content: "Task A", status: "in_progress" },
  { content: "Task B", status: "in_progress" },
  { content: "Task C", status: "in_progress" },
  { content: "Synthesize results", status: "pending" }
]

# After each TaskOutput retrieval, mark as completed
todos = [
  { content: "Task A", status: "completed" },
  { content: "Task B", status: "completed" },
  { content: "Task C", status: "completed" },
  { content: "Synthesize results", status: "in_progress" }
]
```

## 何时使用并行执行

**适合的情况：**

- 多项相互独立的分析（代码审查、安全性、测试）
- 文件彼此独立的多文件处理
- 从不同视角开展的探索性任务
- 使用不同检查方式的验证任务
- 包含独立组件的功能实现

**以下情况应避免并行化：**

- 任务之间存在依赖关系（Task B 需要 Task A 的输出）
- 需要顺序执行的工作流（commit -> push -> PR）
- 多个任务会修改相同文件（存在冲突风险）
- 执行顺序对正确性有影响

## 性能优势

| 方式 | 5 个任务，每个耗时 30 秒 | 总时间 |
| ---------- | --------------------------- | ---------- |
| 顺序执行 | 30s + 30s + 30s + 30s + 30s | ~150s |
| 并行执行 | 5 个任务同时运行 | ~30s |

当独立任务的数量为 N 时，并行执行的速度大约可提升 N 倍。

## 示例：功能实现

**用户请求**：“实现包含登录、注册和密码重置的用户身份验证功能”

**编排器创建计划**：

1. 实现登录端点
2. 实现注册端点
3. 实现密码重置端点
4. 添加身份验证中间件
5. 编写集成测试

**并行执行**：

```
Launching 5 subagents in parallel:

[Task 1] Login endpoint implementation
[Task 2] Registration endpoint implementation
[Task 3] Password reset endpoint implementation
[Task 4] Auth middleware implementation
[Task 5] Integration test writing

All tasks run simultaneously...

[Collect results via TaskOutput]

[Synthesize into cohesive implementation]
```

## 故障排查

**任务在顺序运行？**

- 确认所有 Task 调用都位于同一条消息中
- 检查是否为每个任务设置了 `run_in_background: true`

**无法获取结果？**

- 使用 TaskOutput，并提供正确的任务 ID
- 等待任务完成后再获取结果

**输出存在冲突？**

- 确保任务不会修改相同文件
- 在整合步骤中添加冲突解决机制