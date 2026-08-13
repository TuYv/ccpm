---
name: accint-solve
description: Route a goal through acc's scored-memory loop via acc_act(runtime="solve"); deliberate any returned brain_frame and submit via continue.
risk: critical
source: https://github.com/maxbaluev/accreted-intelligence/tree/main/plugins/claude/skills/solve
source_repo: maxbaluev/accreted-intelligence
source_type: community
date_added: 2026-07-01
license: Apache-2.0
license_source: https://github.com/maxbaluev/accreted-intelligence/blob/main/LICENSE
---
# solve
## 何时使用

当你需要通过 `acc_act(runtime="solve")` 将目标路由到 acc 的 scored-memory 循环时，使用此技能；对返回的 `brain_frame` 进行推理，并通过 `continue` 提交。

这是在两个 MCP 动词之间的路由封装——此处不包含任何逻辑。

1. 调用 `acc_act(runtime="solve", input="<the goal>")`。
2. 如果结果是 **final**：展示答案、`commitment` id 和已引用的 `[ids]`。
3. 如果结果是 **brain_frame**：这是你的推理回合——frame 是带类型的（包含是哪一个 hole、检索了什么、预测了什么）。基于它进行推理，然后通过 `acc_act(runtime="continue", input={"frame_id": ..., "submit_token": ..., "proposal_text": ...})` 提交。
4. 用 `PREDICT: <0.00-1.00> <why>` 结束 `proposal_text`；`acc` 会在 owner 查看前去掉该行，并用它对 Work Model 与后续结果进行校准。
5. 不要让接收到的 frame 未决；不要在循环之外单独推导。
6. 稍后使用 `acc_act(runtime="outcome", ...)` 诚实地关闭 commitment。

## 限制

- 仅在任务与其上游来源及本地项目上下文明确匹配时使用此技能。
- 在应用更改前验证命令、生成的代码、依赖项、凭据和外部服务行为。
- 不要把示例当作替代环境相关测试、安全审查，或对破坏性/高成本操作所需的用户批准。
