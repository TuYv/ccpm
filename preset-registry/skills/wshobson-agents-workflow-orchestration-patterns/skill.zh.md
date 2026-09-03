---
name: workflow-orchestration-patterns
description: Design durable workflows with Temporal for distributed systems. Covers workflow vs activity separation, saga patterns, state management, and determinism constraints. Use when building long-running processes, distributed transactions, or microservice orchestration.
---
# 工作流编排模式

深入掌握基于 Temporal 的工作流编排架构，涵盖基础设计决策、韧性模式以及构建可靠分布式系统的最佳实践。

## 何时使用工作流编排

### 理想使用场景（来源：docs.temporal.io）

- **多步骤流程**，跨越多台机器/服务/数据库
- **分布式事务**，需要全部成功或全部回滚的语义
- **长时间运行的工作流**（数小时到数年），支持自动状态持久化
- **故障恢复**，必须能从最后一个成功步骤处恢复
- **业务流程**：预订、订单、营销活动、审批
- **实体生命周期管理**：库存跟踪、账户管理、购物车流程
- **基础设施自动化**：CI/CD 流水线、环境供应、部署
- **人工参与（Human-in-the-loop）**系统，需要超时和升级机制

### 何时不应使用

- 简单的 CRUD 操作（使用直接 API 调用）
- 纯数据处理流水线（使用 Airflow、批处理）
- 无状态请求/响应（使用标准 API）
- 实时流处理（使用 Kafka、事件处理器）

## 详细模式与完整示例

详细的模式文档位于 `references/details.md`。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

### 工作流设计

1. **保持工作流专注** —— 每个工作流只承担单一职责
2. **小型工作流** —— 使用子工作流来实现可扩展性
3. **清晰的边界** —— 工作流负责编排，活动负责执行
4. **本地测试** —— 使用支持时间跳跃的测试环境

### 活动设计

1. **幂等操作** —— 可安全重试
2. **短生命周期** —— 秒到分钟级，而非小时级
3. **超时配置** —— 始终设置超时
4. **长任务使用心跳** —— 报告进度
5. **错误处理** —— 区分可重试与不可重试的错误

### 常见陷阱

**工作流违规行为**：

- 使用 `datetime.now()` 而非 `workflow.now()`
- 在工作流代码中使用线程或异步操作
- 在工作流中直接调用外部 API
- 工作流中包含非确定性逻辑

**活动设计错误**：

- 非幂等操作（无法处理重试）
- 缺少超时设置（活动永久运行）
- 没有错误分类（重试验证错误）
- 忽略负载大小限制（每个参数 2MB）

### 运维层面的考虑

**监控**：

- 工作流执行时长
- 活动失败率
- 重试次数与退避
- 待处理的工作流数量

**可扩展性**：

- 通过 worker 实现水平扩展
- 任务队列分区
- 子工作流拆分
- 在合适场景下对活动进行批处理

## 补充资源

**官方文档**：

- Temporal 核心概念：docs.temporal.io/workflows
- 工作流模式：docs.temporal.io/evaluate/use-cases-design-patterns
- 最佳实践：docs.temporal.io/develop/best-practices
- Saga 模式：temporal.io/blog/saga-pattern-made-easy

**关键原则**：

1. 工作流 = 编排，活动 = 外部调用
2. 确定性是工作流不可妥协的要求
3. 幂等性对活动至关重要
4. 状态保存是自动完成的
5. 面向故障与恢复进行设计
