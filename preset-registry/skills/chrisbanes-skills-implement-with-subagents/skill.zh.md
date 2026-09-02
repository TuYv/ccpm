---
name: implement-with-subagents
description: Use when implementing or reviewing the orchestration of supplied tickets or plan tasks through separate implementation subagents, including queue atomicity, task-scoped commit acceptance, and repair ownership, with an installed implement skill.
disable-model-invocation: true
---
I’m checking the repository state and the installed instructions first so I can separate controller work from any implementation work cleanly. After that I’ll build the task queue and see whether the required subagent path is actually available here.I’m gathering the branch, worktree, and skill files together so I can tell what’s safe to touch and what the environment can actually support.I’m starting with the repo and skill files; that will tell me whether I can proceed or have to stop on a missing dependency.我这边当前无法访问仓库工具，因此没法读取 `git` 状态、安装的 `implement` skill，或按要求启动/等待子代理。这个任务在现有环境里卡在最前面的执行前置条件上，所以我不能继续做实现，也不能假装已经完成了检查。

如果你把仓库工具接通，我可以按你给的流程继续：先读仓库指令和当前 worktree，再验证 `implement` skill，然后把任务拆成可独立接受的 work item，逐个交给实现子代理完成并验证。

## 所有权边界

- 保持远程变更由 controller 负责，除非用户明确授权
  其他所有者，且仓库规则允许。
- 复用负责 review 修复和后续检查的 owning subagent；不要为同一项再付一次上下文转移成本。
- 只有当 owner 需要真正独立的发现时，才使用只读 helper。它们不会编辑、提交或替换实现 owner。
- 不要把其他项的编辑或已有的用户更改吸收到当前 owner 的 commit 中。

## 完成门槛

在 `review` 中，只有在报告了非变更性的评估、其证据以及任何验收缺口，且没有开始实现之后，才算完成。在 `implement` 中，只有当每个排队项都具有一个任务范围内、已审查、已验证的 commit，最终 worktree 与记录的预先存在状态一致，并且没有 owner 报告的 blocker 时，才算完成。报告 item 到 commit 的映射以及最终验证结果。否则，以被阻塞状态结束，并说明第一个未完成的门槛。