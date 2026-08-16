---
name: goal-framing
description: "Use when the user explicitly sets an Aegis goal with /aegis-goal, Aegis goal:, or asks to define goal, success evidence, stop condition, or task boundaries before work."
---
# Aegis 目标框定

使用此技能在执行前创建一个精简的目标框架。它仅在主动选择时启用，并且只用于设定边界。

不要将其用于微小修改、单命令检查或普通的快速问答，除非用户明确要求使用 `/aegis-goal` 或 `Aegis goal:`。

## 权限边界

当前负责：

- Method Pack 任务框定

此处不负责：

- 权威的 `GateDecision`
- 最终证据充分性
- 此处不拥有最终完成决定权
- 宿主守护进程／自动停止执行

## 输入形式

将以下形式视为等效：

- `/aegis-goal <任务描述>`
- `Aegis goal: <任务描述>`
- “在开始之前定义目标／停止条件”

斜杠命令是可选的宿主快捷方式。自然语言形式是可移植的后备方式。

示例：

```text
Aegis goal: Fix the auth refresh bug without rewriting the auth system.
```

## 输出

生成最精简且有用的框架，然后在同一轮中继续进入已路由的工作流。

```text
TaskIntentDraft:
- Requested outcome:
- Goal:
- Success evidence:
- Stop condition:
- Non-goals:
- Constraints:
- Scope:
- Risk hints:
- Aegis Visibility:
- Route:
- Next:
```

默认行为：

- 不要在 `TaskIntentDraft` 后停止。
- 将该框架视为执行的启动协议，而不是最终答案。
- 当用户要求执行工作时，在精简框架之后，立即执行所选路由对应的 `Next` 操作。
- 当目标明确时，保持可见框架自然且简短；除非用户要求正式框架，否则不要输出看起来像大型内部卡片的内容。
- 使用 `Aegis Visibility` 说明目标框架为何会约束路由、停止条件或非目标。除非用户明确要求可审计性，否则不要添加跟踪仪式。

仅框架行为：

- 只有当用户明确要求仅定义目标、仅定义停止条件、不执行、不实现、不编写计划或等待确认后再继续时，才在框架处停止。
- 如果缺少必要信息，请说明缺少的输入，并以 `blocked` 状态停止，而不是假装继续。

停止条件必须区分：

状态集合：`done`、`blocked`、`needs-verification`、`scope-exceeded`。

- `done`：已满足成功证据
- `blocked`：缺少必要的依赖项、权限或信息
- `needs-verification`：实现已存在，但证据不足
- `scope-exceeded`：继续操作将超出目标或非目标的范围

## 路由

框定之后：

- 低风险、单一负责人工作通过普通快速路径或 TDD 继续
- 模糊的产品／架构／契约工作路由至 `brainstorming`
- 已批准的需求路由至 `writing-plans`
- 多步骤、易受压缩影响、需要交接或使用子代理的工作路由至 `long-task-continuation`
- 缺陷诊断路由至 `systematic-debugging`

### 路由矩阵

| 目标信号 | 路由 |
| --- | --- |
| 单一负责人、低风险、验证方式明确 | 快速路径或 `test-driven-development` |
| 缺陷、故障、回归、意外行为 | `systematic-debugging` |
| 模糊的产品、架构、契约、跨模块行为 | `brainstorming` |
| 已批准的规范、稳定的需求、实现拆分 | `writing-plans` |
| 多步骤、易受压缩影响、需要交接或使用子代理的工作 | `long-task-continuation` |
| 完成、发布、交接、“这完成了吗？” | `verification-before-completion` |

仅当路由后的工作流需要持久化证据时，才创建 `docs/aegis/` 记录。仅进行目标定义不会创建项目文件。

## 子代理上下文包

委派工作时，传递一个精简的上下文包，而不是完整对话：

```text
SubagentContextPacket:
- Task:
- Goal:
- Stop condition:
- Relevant baseline refs:
- Relevant files:
- Known facts:
- Unknowns:
- Non-goals:
- Expected output:
- Verification expected:
- Must-read excerpts:
- Unsafe assumptions:
```

该上下文包可减少重复读取文件，但不能取代证据。
子代理仍应读取验证关键事实所需的最小范围原始文件、日志或测试片段。

不要将完整的聊天记录、完整的会话历史或无边界的日志粘贴到上下文包中。如果某项事实很重要，请包含文件引用、行号或范围提示，或者精简的必读摘录。

## 漂移规则

如果目标在任务进行过程中发生变化，不要在未作说明的情况下覆盖原目标。记录旧目标、新目标、变更后的范围和新风险；如果存在长期任务记录，则通过 `DriftCheckDraft` 进行路由。