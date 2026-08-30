---
name: caveman-manage
description: >
  Inspect Caveman Cloud's experiment lifecycle and block unsafe execution. Use
  when asked to start, approve, cancel, promote or roll back a Caveman
  experiment.
---
# 管理受评估门控的实验

将每项生命周期变更视为生产控制操作。读取当前状态和结果，然后报告一项受支持的建议，或进行阻止。
当前 agent MCP 特意设置为只读：control-api 尚未以原子方式强制执行完整的生命周期转换表和证据门控。

## 不可协商的门控条件

1. 请求进行审查、检查、解释或提出建议时，仅授权读取操作。
2. 如果实验结果仍在等待、所需的防护措施缺失，或证据报告了违规，绝不批准该实验。
3. 绝不将实验提升幅度转换为 `verified_savings`。只有活跃的真实流量，加上由提供商导致且涵盖完整提供商范围的账本证据，才能完成这一转换。
4. 绝不提供组织 id。项目和租户范围来自已登录的 Caveman 身份以及服务器 RBAC。
5. 即使用户已批准，也绝不执行生命周期变更。精确的 `<action>:<experiment_id>` 字符串可以由 agent 生成，但不能证明这是人的意图。
6. 未知状态和服务器错误均应安全失败。报告确切的 `cave_snake_code`。

## 步骤 1 — 加载项目和实验

优先使用 MCP：

```text
caveman_context {}
caveman_experiment_get {"action":"get","experiment_id":"<id>"}
caveman_experiment_get {"action":"results","experiment_id":"<id>"}
```

当用户未指定 id 时，使用 `{"action":"list"}`。

CLI 备用方案：

```bash
caveman cloud experiments list
caveman cloud experiments show <id>
caveman cloud experiments results <id>
```

如果登录、项目、实验或结果不可用，则停止。

## 步骤 2 — 评估证据

报告：

- 当前生命周期状态和安全等级；
- 对照组和候选组的样本量；
- 质量或评估结果；
- 在存在时，报告延迟、错误、成本、重试、丢弃和升级防护指标；
- 证据成本；
- 回滚或暂缓原因；
- 结果处于等待、失败、可推广还是活跃状态。

缺失不等于通过。如果必需字段缺失，请说明
`evidence incomplete`，并且不要提出批准建议。

## 步骤 3 — 提出一项操作

允许的操作：

- `start` — 仅适用于已配置评估器、且处于可启动草稿或排队状态的实验；
- `approve` — 仅适用于证据完整且通过，并且安全等级在当前角色可批准范围内的实验；
- `cancel` — 停止用户不再需要的非活跃实验；
- `rollback` — 通过服务器关联的策略路径，撤销活跃或有害的变更。当前部署可能会诚实地以 `cave_not_implemented` 拒绝此操作；绝不要将该响应描述为回滚。

显示建议和 id：

```text
Proposed action: approve experiment 7f...
Reason: candidate passed quality and every configured guardrail.
Execution: blocked until server-authoritative lifecycle and evidence gates ship.
```

不要将诸如“管理它”或“做最好的处理”之类更早的笼统表述视为变更批准。

## 步骤 4 — 阻止不安全的执行

不要输出或运行可执行的生命周期命令。说明当前服务器尚未以原子方式强制执行所有证据和状态转换。CLI 和 MCP agent 界面因此仅提供实验读取功能。

## 步骤 5 — 外部操作员执行操作后重新读取

如果操作员表示他们已执行命令，请再次读取详细信息和结果。报告服务器观测到的操作后状态、审计或结果响应，以及返回的任何策略交付状态。绝不要仅凭操作员的意图推断成功。

使用以下结尾：

```text
Action: <action> <experiment-id>
Before: <state>
Server response: <status and cave_snake_code if any>
After: <re-read state>
Basis: experiment evidence only. Verified savings unchanged unless the signed
ledger independently records active, provider-causal real-traffic savings.
```