---
name: team-communication-protocols
description: Structured messaging protocols for agent team communication including message type selection, plan approval, shutdown procedures, and anti-patterns to avoid. Use this skill when establishing communication norms for a newly spawned team, when deciding whether to send a direct message or a broadcast, when a team-lead needs to review and approve an implementer's plan before work begins, when orchestrating a graceful team shutdown after all tasks are complete, or when debugging why teammates are not coordinating correctly at integration points.
version: 1.0.2
---
# 团队通信协议

用于智能体队友之间高效沟通的协议，涵盖消息类型选择、计划审批工作流、关停流程，以及应避免的常见反模式。

## 何时使用本技能

- 为新团队建立沟通规范
- 在消息类型之间做选择（message、broadcast、shutdown_request）
- 处理计划审批工作流
- 管理团队的优雅关停
- 发现队友的身份与能力

## 消息类型选择

### `message`（直接消息）—— 默认选择

发送给单个特定队友：

```json
{
  "type": "message",
  "recipient": "implementer-1",
  "content": "Your API endpoint is ready. You can now build the frontend form.",
  "summary": "API endpoint ready for frontend"
}
```

**用于**：任务更新、协调、提问、集成通知。

### `broadcast` —— 谨慎使用

同时发送给所有队友：

```json
{
  "type": "broadcast",
  "content": "Critical: shared types file has been updated. Pull latest before continuing.",
  "summary": "Shared types updated"
}
```

**仅用于**：影响所有人的关键阻塞问题、共享资源的重大变更。

**为什么说要谨慎？**：每次广播会发送 N 条独立消息（每位队友一条），消耗与团队规模成正比的 API 资源。

### `shutdown_request` —— 优雅终止

请求某位队友关停：

```json
{
  "type": "shutdown_request",
  "recipient": "reviewer-1",
  "content": "Review complete, shutting down team."
}
```

该队友会以 `shutdown_response` 回应（批准，或附带原因拒绝）。

## 沟通反模式

| 反模式                                   | 问题                                     | 更好的做法                              |
| --------------------------------------- | ---------------------------------------- | -------------------------------------- |
| 用广播发送例行更新                        | 浪费资源、产生噪音                        | 直接发消息给受影响的队友                 |
| 发送 JSON 状态消息                        | 并非为结构化数据而设计                     | 使用 TaskUpdate 更新任务状态            |
| 在集成节点不沟通                          | 队友基于过时的接口开发                     | 接口就绪时发消息通知                     |
| 通过消息进行微观管理                       | 使队友不堪重负、拖慢工作                   | 在里程碑处同步，而非每一步都同步          |
| 使用 UUID 而非名称                        | 难以阅读、容易出错                        | 始终使用队友名称                        |
| 忽视空闲的队友                            | 浪费产能                                  | 分配新工作或将其关停                    |

## 计划审批工作流

当队友以 `plan_mode_required` 模式创建（spawn）时：

1. 队友使用只读探索工具制定计划
2. 队友调用 `ExitPlanMode`，向负责人（lead）发送一条 `plan_approval_request`
3. 负责人审阅该计划
4. 负责人以 `plan_approval_response` 回应：

**批准**：

```json
{
  "type": "plan_approval_response",
  "request_id": "abc-123",
  "recipient": "implementer-1",
  "approve": true
}
```

**拒绝并给出反馈**：

```json
{
  "type": "plan_approval_response",
  "request_id": "abc-123",
  "recipient": "implementer-1",
  "approve": false,
  "content": "Please add error handling for the API calls"
}
```

## 关停协议

### 优雅关停流程

1. **负责人向每位队友发送 shutdown_request**
2. **队友收到请求**，形式为一条 JSON 消息，`type: "shutdown_request"`
3. **队友以 `shutdown_response` 回应**：
   - `approve: true` —— 队友保存状态并退出
   - `approve: false` + 原因 —— 队友继续工作
4. **负责人处理拒绝** —— 等待队友完成后再重试
5. **所有队友关停后** —— 调用 `TeamDelete` 移除团队资源

### 处理拒绝

如果队友拒绝了关停：

- 查看其拒绝原因（通常是“仍在执行任务中”）
- 等待其当前任务完成
- 重试关停请求
- 如果情况紧急，用户可以强制关停

## 队友发现

通过读取配置文件找到团队成员：

**位置**：`~/.claude/teams/{team-name}/config.json`

**结构**：

```json
{
  "members": [
    {
      "name": "security-reviewer",
      "agentId": "uuid-here",
      "agentType": "team-reviewer"
    },
    {
      "name": "perf-reviewer",
      "agentId": "uuid-here",
      "agentType": "team-reviewer"
    }
  ]
}
```

**务必使用 `name`** 来发送消息和分配任务。切勿直接使用 `agentId`、角色名称或无后缀的别名。如果某队友创建时的名称为 `team-lead-2`，就发送给 `team-lead-2`，而不是 `team-lead`。

## 故障排查

**某位队友不回复消息。**
检查该队友的任务状态。如果处于空闲状态，它可能已完成任务，正在等待分配新工作或被关停。如果仍处于活跃状态，它可能正在执行中，会在当前操作完成后处理消息。

**某位队友说它看不到 SendMessage。**
检查该队友智能体的 `tools:` frontmatter。当智能体使用受限的工具白名单时，必须显式列出 `SendMessage`、`TaskList`、`TaskGet` 和 `TaskUpdate` 等 Agent Teams 沟通工具。

**负责人对每次状态更新都发送广播。**
这是一种常见的反模式。广播开销很大——每次广播都会发送 N 条消息。点对点更新请使用直接消息（`type: "message"`）。广播仅用于关键的共享资源变更，例如接口契约的更新。

**某位队友意外拒绝了关停请求。**
该队友仍在工作中。查看 `shutdown_response` 的 content 字段中的拒绝原因，等其工作完成后再重试。绝不要强制终止有未保存工作的队友。

**收到了 plan_approval_request 但缺少 request_id。**
该队友在缺少必要的请求上下文的情况下调用了 `ExitPlanMode`。让该队友重新进入计划模式，完成探索后再次调用 `ExitPlanMode`。`request_id` 由计划模式系统自动生成。

**两个队友在互相等待，谁都没有进展。**
这是死锁：双方都因等待对方先完成而被阻塞。负责人应向其中一位队友发送直接消息，提供一个桩（stub）或部分结果，使其解除阻塞并继续推进。

## 相关技能

- [team-composition-patterns](../team-composition-patterns/SKILL.md) —— 在建立沟通规范之前选择智能体类型与团队规模
- [parallel-feature-development](../parallel-feature-development/SKILL.md) —— 使用通信协议来协调并行实现者之间的集成交接
