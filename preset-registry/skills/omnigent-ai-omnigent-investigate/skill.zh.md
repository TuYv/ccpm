---
name: investigate
description: Delegate read-only investigation, debugging, audit, search, or code-understanding tasks to sub-agents; synthesize only from their structured reports.
---
# investigate — 委派只读工作

适用于任何只读任务：调查、调试、审计、搜索、代码理解、架构比较、故障分析，或回答特定于仓库的技术问题。

## 流程
1. 将问题分解为一个或多个范围明确的调查任务。对于有歧义或高风险的问题，优先采用两个独立的分析视角。
2. 将每个任务分派给 `claude_code`、`codex`、`opencode`、`cursor`、`hermes`、`agy` 或 `pi`：
   `sys_session_send(agent="claude_code"|"codex"|"opencode"|"cursor"|"hermes"|"agy"|"pi",
   title="explore-<task_slug>", args={purpose: "explore", input: "<question +
   exact scope + evidence requested>"})`。使用基于任务的标题，例如
   `explore-ci-flake`，绝不要使用原始供应商名称。仅当任务主要是外部/文档搜索时，才使用 `purpose: "search"`。当需要第三种分析视角或非 Claude/GPT 模型时，优先使用 `pi`。任何工作器都接受可选的
   `args.model`（`sys_list_models` 会显示每个工作器可运行的模型；无效的模型/工作器组合会在分派时明确失败，并且 `model` 仅适用于创建会话的那次分派——继续使用现有标题的发送会拒绝它）。
   告知工作器不要编辑任何内容，并返回文件、命令、URL 或行号证据。在同一轮中发出这些 `sys_session_send` 调用——不要在仅仅表示将进行分派后就结束该轮。
3. 在分派工具调用进行中之后结束该轮（绝不能在此之前）。工作器运行期间，不要自行检查文件、日志、终端、文档或连接器输出。
4. 工作器完成后，使用 `sys_read_inbox` 收集其完成结果。仅根据收件箱中收到的报告进行综合。仅在调试空白或不清晰的工作器结果时使用 `sys_session_get_history`；如果报告相互冲突或不完整，应分派一个后续 `explore` 任务，而不是通过自行直接检查来解决冲突。
5. 如果调查发现需要进行代码更改，请切换到 `fanout` / `cross-review`：分派一个 `implement` 工作器，然后使用另一供应商的 `review` 工作器进行验证。

## 注意事项
- 编排器只能使用自己的工具来创建任务包、维护注册表或检查确定性的外部状态。它不得根据自己直接读取的文件、shell 输出、连接器获取内容或终端回滚内容来回答用户的实质性问题。
- 保持任务范围足够狭窄，使每个工作器都能返回一份包含证据的简洁报告。范围较广的调查应拆分为多个并行子任务。