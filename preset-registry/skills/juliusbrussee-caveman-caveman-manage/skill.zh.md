---
name: caveman-manage
description: >
  Inspect Caveman Cloud's eval-gated experiment lifecycle and block unsafe
  execution. Use when the user asks to start, approve,
  cancel, promote, or roll back a Caveman experiment, or asks what action an
  experiment's evidence supports. Read evidence first; do not execute lifecycle
  mutations until server-authoritative transition and evidence gates ship.
---
# 管理 eval-gated 实验

将每一次生命周期变更都视为生产环境中的控制动作。读取当前状态和结果后，再给出一个支持性的建议或阻断。
当前代理 MCP 有意为只读模式：control-api 尚未强制执行完整的生命周期转换表和证据门禁的原子化。

## 不可协商的门禁

1. 对实验进行审核、检查、解释或建议的请求仅授权读取。
2. 不要批准结果仍在待定、所需安全护栏缺失，或证据报告存在违规的实验。
3. 不要将 experiment lift 转换为 `verified_savings`。只有活跃的真实流量加上 provider-causal、provider-complete 的账本证据才能做到这一点。
4. 不要提供组织 ID。项目与租户范围来源于已登录的 Caveman 身份与服务器 RBAC。
5. 即使在用户批准后，也不要执行生命周期变更。精确的 `<action>:<experiment_id>` 字符串可由代理生成，并不能证明用户的真实意图。
6. 未知状态与服务器错误按关闭处理。需报告准确的 `cave_snake_code`。

## 第 1 步 — 加载项目与实验

优先使用 MCP：

```text
caveman_context {}
caveman_experiment_get {"action":"get","experiment_id":"<id>"}
caveman_experiment_get {"action":"results","experiment_id":"<id>"}
```

当用户未提供 ID 时，使用 `{"action":"list"}`。

CLI 回退：

```bash
caveman cloud experiments list
caveman cloud experiments show <id>
caveman cloud experiments results <id>
```

若登录、项目、实验或结果不可用，请停止。

## 第 2 步 — 评估证据

报告：

- 当前生命周期状态与安全等级；
- 对照组与候选组样本量；
- 质量或 eval 结果；
- 在存在时报告延迟、错误、成本、重试、降级与升级护栏；
- 证据成本；
- 回滚或暂停原因；
- 结果是待定、失败、可提升还是已激活。

缺失不视为通过。如果必需字段缺失，请说明 `evidence incomplete`，并且不要提出批准建议。

## 第 3 步 — 提出单一动作

允许的动作：

- `start` — 仅适用于可启动的草稿或排队状态，且已配置评分器；
- `approve` — 仅在完整且通过的证据及当前角色可批准的安全等级下；
- `cancel` — 停止用户不再需要的非活跃实验；
- `rollback` — 通过服务器关联的策略路径回退已激活或有害变更。当前部署可能会诚实地以 `cave_not_implemented` 拒绝，请勿将该响应描述为回滚。

显示建议与 ID：

```text
Proposed action: approve experiment 7f...
Reason: candidate passed quality and every configured guardrail.
Execution: blocked until server-authoritative lifecycle and evidence gates ship.
```

不要把诸如“manage it”或“do what is best”之类的早期泛化表述当作变更批准处理。

## 第 4 步 — 阻断不安全执行

不要输出或执行可执行的生命周期命令。说明当前服务器尚未实现每个证据/状态转换的原子化强制。CLI 与 MCP 代理界面因此只对实验提供读取能力。

## 第 5 步 — 外部操作员动作后重读

如果操作员声称已执行命令，请再次读取详情与结果。报告服务器观察到的后置状态、审计或结果响应，以及返回的任何策略下发状态。绝不能仅凭操作员意图推断成功。

使用此收尾：

```text
Action: <action> <experiment-id>
Before: <state>
Server response: <status and cave_snake_code if any>
After: <re-read state>
Basis: experiment evidence only. Verified savings unchanged unless the signed
ledger independently records active, provider-causal real-traffic savings.
```
