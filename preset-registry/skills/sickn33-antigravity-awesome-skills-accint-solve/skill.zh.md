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
## 使用时机

当你需要通过 `acc_act(runtime="solve")` 将一个目标路由到 acc 的 scored-memory 循环时使用此技能；对任何返回的 brain_frame 进行审慎思考，并通过 continue 提交。


这是针对两个 MCP 动词的路由语法糖——这里不包含任何逻辑。

1. 调用 `acc_act(runtime="solve", input="<the goal>")`。
2. 如果结果是 **final**：展示答案、`commitment` id 以及被引用的 `[ids]`。
3. 如果结果是 **brain_frame**：轮到你进行审慎思考——该 frame 是类型化的（哪个洞、检索到了什么、预测到了什么）。对它进行推理，然后通过
   `acc_act(runtime="continue", input={"frame_id": ..., "submit_token": ..., "proposal_text": ...})` 提交。
4. 在 `proposal_text` 结尾写上 `PREDICT: <0.00-1.00> <why>`；acc 会在 owner 看到之前去掉这一行，并用它根据后续结果校准 Work Model。
5. 永远不要让已接收的 frame 保持未解决状态；永远不要在循环之外单独推导。
6. 稍后使用 `acc_act(runtime="outcome", ...)` 诚实地关闭 commitment。

## 限制

- 仅当任务明显匹配其上游来源和本地项目上下文时才使用此技能。
- 在应用更改之前，验证命令、生成的代码、依赖项、凭据以及外部服务行为。
- 不要把示例当作环境特定测试、安全审查，或破坏性/高成本操作的用户批准的替代品。
