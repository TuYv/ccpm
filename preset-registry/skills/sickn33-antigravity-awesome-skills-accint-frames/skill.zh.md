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

当你需要通过 acc_act(runtime="continue") 排空 acc 的审议队列——即由 headless 运行检查点保存的、处于 open/waiting 状态的 brain_frames——时，使用此技能。

这只是对两个 MCP 动词的路由语法糖——这里不含任何逻辑。

1. 列出队列：`acc frames`（CLI，只读观察）。
2. 对每个 open/waiting 状态的 frame：读取其 typed hole 和检索到的上下文，进行审议，
   然后通过
   `acc_act(runtime="continue", input={"frame_id": ..., "submit_token": ..., "proposal_text": ...})`
   提交。
3. 在 `proposal_text` 末尾附上 `PREDICT: <0.00-1.00> <why>`；acc 会在 owner 看到该行之前将其剥离，
   并用它对照后续结果来校准 Work Model。
4. 完全相同的重复提交会重放缓存的结果——重新提交是安全的。
5. 呈现每个 resolution 的 `commitment` id 和所引用的 `[ids]`；在承接新工作之前把队列完全
   排空——被检查点保存的 frame 是 headless 运行为你留存的工作。

## 局限性

- 仅当任务与其上游来源和本地项目上下文明确匹配时，才使用此技能。
- 在应用更改之前，先核实命令、生成的代码、依赖项、凭据以及外部服务的行为。
- 不要将示例视为针对特定环境的测试、安全审查或用户对破坏性或高成本操作批准的替代品。
