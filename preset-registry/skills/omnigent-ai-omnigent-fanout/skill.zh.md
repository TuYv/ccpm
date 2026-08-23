---
name: fanout
description: Run independent subtasks in parallel — one git worktree and one implementation sub-agent per task, each opening its own PR — then cross-review every PR. polly never merges; the human does.
---
# fanout — 安全并行执行

仅用于可安全并行的子任务（无共享文件、无顺序依赖）。

## 流程
1. 为每个任务创建一个隔离的 worktree：
   `sys_os_shell("git worktree add .worktrees/<task_id> -b polly/<task_id>")`。
   在注册表（`.polly/registry.json`）中记录 worktree 路径和分支。
2. 为每个任务分派一个实现子代理，并将其作用域限定在对应的 worktree：
   `sys_session_send(agent="claude_code"|"codex"|"opencode"|"cursor"|"hermes"|"agy", title="<task_slug>",
   args={purpose: "implement", input: "<task + acceptance contract +
   worktree path>"})`。使用简短且基于任务的标题，例如 `auth-refactor` 或
   `fix-sse-error`，切勿直接使用原始供应商名称。说明任务作用域，并明确要求其只能在 `.worktrees/<task_id>` 内工作。工作代理负责推进任务直至所有检查通过，并为该分支创建自己的 PR。工作代理编写的每个提交都必须以一个空行和以下完全一致的共同署名尾注作为最后一行结束——`Co-authored-by: omnigent <noreply@omnigent.ai>`。
   对于具有明确完成条件且长时间运行的 `claude_code` 或 `codex` 实现任务，`input` 也可以改为一个独立的
   `/goal <condition>` 命令，其中包含同一个任务、worktree、验收约定、通过门槛和 PR 要求。
   不要对其他工作代理或非实现用途使用子目标模式。
   在注册表中记录每个句柄的 `conversation_id`。
   必须在**本轮**发出 worktree 和 `sys_session_send` 工具调用——绝不能在仅表示将要分派任务后就结束当前轮次；分派调用及其说明必须在同一轮中完成。先分派整个可安全并行的任务集合，**然后（且只能在此之后）结束当前轮次**。不要轮询。
3. 每个子代理自主运行，并在完成时通过收件箱通知你。使用 `sys_read_inbox` 收集其结构化结果，并在注册表中记录 PR URL。如果收件箱结果为空或含义不清，请先使用 `sys_session_get_history` 检查该工作代理的对话，再决定下一步操作。
4. 将每个已完成任务的 PR 交由 `cross-review` 审查。
5. polly **不会**执行合并——PR 即交付物。`cross-review` 通过后，任务即告完成：在注册表中将其标记为就绪并附上 PR URL，留待人工审查和合并。绝不要运行 `git merge` / `gh pr merge`。
6. 仅当已完成任务的 PR 已创建且审查无问题后，才移除其 worktree（`git worktree remove`）——分支保留在远程仓库中，因此 worktree 可以丢弃。不要移除仍有未完成修复任务的 worktree。

## 注意事项
- 遵守每轮分派数量上限（由策略强制执行）。任务数量超过上限 → 分批分派（等待当前运行批次完成后，再分派更多任务）。
- 工作代理运行期间，人工可以在 UI 的 Subagents 面板中打开任意子代理并查看其对话。
- 如果正在运行的工作代理方向错误、失控、已被取代或不再有用，请先调用 `sys_cancel_task`，并将 `task_id` 设置为已记录的 `conversation_id`，然后再分派替代代理。`claude_code` 会被强制停止；在 runner 端实现强制停止功能之前，`codex` 的取消仅为尽力而为。
- 如果子代理返回异常或失败结果：不要循环向它重新发送提示——应在干净的 worktree 中重新分派一个新的实现子代理，或将问题上报给用户。
- 由于 polly 从不执行合并，跨 PR 冲突会在人工合并时暴露，而不是在这里。保持各并行任务的文件作用域互不重叠，可使这种情况保持少见——务必遵守这一点。