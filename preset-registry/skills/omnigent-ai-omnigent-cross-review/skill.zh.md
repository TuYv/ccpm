---
name: cross-review
description: Verify an implementer's diff with an INDEPENDENT, different-vendor sub-agent (diff plus contract only); turn blocking issues into fix-tasks and loop until clean.
---
# cross-review — 独立验证

实现者绝不能批准自己的工作——必须由不同的模型来完成批准，而且评审是一个返回结构化报告的子代理，而不是一份需要任何人逐字阅读的对话记录。

## 流程
1. 获取任务的 diff——`sys_os_shell("gh pr diff <pr>")`（或 `git -C .worktrees/<task_id> diff main...HEAD`）。
2. 首先运行确定性门禁——通过 `sys_os_shell` 运行测试 / lint / 类型检查。如果未通过，先重新派发实现者推动其通过；此时不要让评审者介入。
   如果必须记录或核对 pytest 结果的数量，请针对实现者报告的完全相同的文件集/命令/提交，使用 `python -m pytest --collect-only -q <same files>` 获取事实依据。绝不要使用 `grep -c 'def test_'` 统计 pytest 数量：它统计的是函数，而不是收集到的用例，并且会遗漏参数化展开后的用例。
3. 派发一个与实现者来自不同供应商的子代理作为评审者：从供应商不同于实现者的任意 AVAILABLE worker 中选择——`claude_code`、`codex`、`opencode`、`cursor`、`hermes`、`agy` 或 `pi`（例如，若由 Claude 构建 → 可选择 `codex` / `opencode` / `cursor` / `hermes` / `agy` / `pi` 中的任意一个，其他情况以此类推）。使用基于任务的标题，例如 `review-auth-refactor`，绝不要使用原始供应商名称：
   `sys_session_send(agent="claude_code"|"codex"|"opencode"|"cursor"|"hermes"|"agy"|"pi", title="review-<task_slug>",
   args={purpose: "review", input: "<the diff> + <the acceptance contract>.
   Review ONLY against the contract. Report blocking / non-blocking /
   suggestions. Do not edit code."})`。将 diff 作为文本提供——不要让它指向实现者的 worktree。在决定进行评审的同一轮中获取 diff 并发出 `sys_session_send` 调用——绝不要在仅仅宣布「我将加载 cross-review 并获取 diff」却没有调用工具的情况下结束一轮（这种空耗的轮次会使运行停滞；不会派发任何任务，也不会收到 inbox 唤醒）。评审者派发后，结束当前轮次；待其返回时，使用 `sys_read_inbox` 收集由 inbox 投递的结构化报告。仅在调试空白或不明确的评审结果时使用 `sys_session_get_history`。
4. 评审者负责指出问题；不负责修复问题。
5. 对于每一个**阻塞性**问题：向注册表添加一个限定到同一 worktree 的修复任务，并通过 `sys_session_send` 将具体修复内容发送回同一个实现者会话——复用原实现者的 `agent` + `title`（或通过 `session_id` 指定），并设置 `purpose: "implement"`，这样该 worker 就能保留其 worktree/分支上下文并更新现有 PR。新标题会生成一个全新的 worker，它不具备该任务的记忆。然后循环回到步骤 1。
6. 当门禁均通过且阻塞性问题为零时，PR 即通过评审——在注册表中将其标记为就绪（附上其 PR URL），并留待人工合并。polly 不会合并它。
7. 如果经过几轮循环后仍无法满足契约，请停止并向用户升级问题，同时提供具体情况。

## 注意事项
- 交叉审查要求审查者与实现者来自不同的供应商，
  因此至少需要两名可用的工作进程（根据 polly 的名册预检）。如果
  机器上只有一个工作进程——或者只有一个供应商能够审查该实现者的 PR——
  则无法运行独立的跨供应商审查：
  不要派发无法启动的审查者，要明确说明这一点，并在计划关卡引入
  人工处理。
- 仅向审查者提供差异 + 契约——绝不要提供实现者的
  记录或工作树。跨供应商独立性正是其核心意义所在。
- 审查由编码子代理（`claude_code`/`codex`/`opencode`/`cursor`/`hermes`/`agy`/`pi`）执行，并以
  `purpose: "review"` 派发——其供应商必须与构建该差异的供应商不同。它
  只报告问题，绝不进行编辑；只有实现者会创建 PR，因此审查者意外进行的
  编辑绝不会进入交付成果。
- 非阻塞问题／建议应作为后续事项记录在注册表中；它们
  不会阻塞 PR。