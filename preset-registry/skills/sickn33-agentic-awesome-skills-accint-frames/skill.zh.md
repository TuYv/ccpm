---
name: accint-frames
description: Drain acc's deliberation queue — open/waiting brain_frames checkpointed by headless runs — via acc_act(runtime="continue").
risk: critical
source: https://github.com/maxbaluev/accreted-intelligence/tree/main/plugins/claude/skills/frames
source_repo: maxbaluev/accreted-intelligence
source_type: community
date_added: 2026-07-01
license: Apache-2.0
license_source: https://github.com/maxbaluev/accreted-intelligence/blob/main/LICENSE
---
# frames

## 何时使用

当你需要通过 acc_act(runtime="continue") 清空 acc 的审议队列——即由无头运行以检查点方式保存的、处于 open/waiting 状态的 brain_frames——时，使用此技能。

这是构建在两个 MCP 动词之上的路由语法糖——本身不包含任何逻辑。

1. 列出队列：`acc frames`（CLI，只读观察）。
2. 对每个处于 open/waiting 状态的 frame：读取其类型洞 + 检索到的上下文，进行审议，然后通过 `acc_act(runtime="continue", input={"frame_id": ..., "submit_token": ..., "proposal_text": ...})` 提交。
3. 在 `proposal_text` 末尾附上 `PREDICT: <0.00-1.00> <why>`；acc 会在所有者看到之前剥离这一行，并利用它根据后续结果来校准 Work Model。
4. 内容完全相同的重复提交会重放缓存的结果——重新提交
