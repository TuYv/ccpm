---
name: agent-team-driven-development
description: Provides guidance on coordinating multiple specialized teammates working in parallel. This skill should be used when the user needs to execute complex implementation plans, resolve cross-cutting concerns, or coordinate independent work streams requiring communication.
user-invocable: false
---
# 由 Agent Team 驱动的计划执行开发

协调多名专业队友并行工作，以执行复杂的实施计划。

## Agent Teams 与 Sub-agents

根据工作者是否需要相互沟通进行选择。

| 维度 | Sub-agents | Agent Teams |
|---|---|---|
| **沟通** | 结果仅返回给调用者 | 队友之间直接发送消息 |
| **协调** | 主代理管理所有工作 | 通过共享任务列表进行自协调 |
| **最适合** | 只关注结果的明确任务 | 需要讨论与协作的复杂工作 |
| **Token 成本** | 较低 | 较高：每名队友都是一个独立实例 |

对于不需要工作者之间沟通的独立任务（研究、验证、文件搜索），使用 **Sub-agents**。当队友必须共享发现、相互质疑，或在 3 个以上并行工作流之间进行自协调时，使用 **Agent Teams**。对于顺序执行或高度相互依赖的任务，使用单个会话。

## 执行工作流

1. **分析计划** -- 识别任务独立性、文件冲突和所需角色（实施者、审查者、架构师）
2. **组建团队** -- 向每名队友提供任务分配、文件路径、约束条件和验证标准。队友**不会**继承对话历史。
3. **协调** -- 通过共享任务列表进行监控，促进队友之间的沟通，并使用委派模式（`Shift+Tab`）让负责人专注于协调
4. **验证并清理** -- 验证集成情况、运行测试、关闭队友，并由负责人清理团队资源

有关详细工作流，请参阅 `./references/initiate-team-workflow.md` 和 `./references/manage-team-workflow.md`。

## 角色

- **实施者**：在分配的文件上执行编码任务，遵循 TDD/BDD。请参阅 `./references/implementer-role.md`。
- **审查者**：验证质量、安全性以及计划合规性。请参阅 `./references/reviewer-role.md`。
- **架构师**：解决横切关注点，维护整个系统的一致性。请参阅 `./references/architect-role.md`。

## 关键实践

- 为每名队友分配不同的文件所有权，以防止编辑冲突
- 为每名队友分配 5-6 个任务，以保持稳定的吞吐量
- 明确记录任务依赖关系，使受阻任务能够自动等待
- 在组建提示中提供完整上下文（文件路径、目标、约束条件）
- 要求在任务完成时提供验证证据（测试结果等）
- 频繁监控；无人看管的团队可能会浪费工作量

有关架构、功能和限制，请参阅 `./references/official-documentation.md`。