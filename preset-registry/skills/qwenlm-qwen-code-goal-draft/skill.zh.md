---
name: goal-draft
description: Turn a fuzzy intention into a /goal objective the Goal verifier can actually judge - one outcome, numbered binary "Done when" checks that leave evidence in the transcript, guardrails, a budget, and a block protocol. Use when the user wants to set or define a goal, asks whether a goal is good enough, or says "keep going until X". Usage - /goal-draft <what you want done>, or /goal-draft <existing goal> to tighten it. This skill only writes the objective; it never starts the work.
argument-hint: '[intent, or an existing goal to tighten]'
allowedTools:
  - get_goal
  - read_file
  - glob
  - grep_search
---
# /goal-draft — 编写一个验证器能够判定的 Goal

你已经位于已加载的 `goal-draft` skill 中——不要再次调用 `skill` 工具来调用它；从 Step 0 开始。

你正在为 `/goal set` 起草文本。你**不是**在执行 Goal 所描述的工作。不要编辑文件，不要运行检查，不要开始处理任务。唯一需要交付的是目标文本，以及用户可以运行的 `/goal set` 行。

## Goal 如何被判定（为什么下面的格式很重要）

一个处于活动状态的 Goal 会在每一轮重新提供给模型，并由只能看到对话记录证据的独立验证器判断其是否完成：

- 可见的助手输出和工具结果都算作证据。目标本身、用户提示和隐藏推理不算。
- `delivered_output` 证据只能证明文本已被打印出来。它不能证明测试已通过、文件已更改或远程状态已更改——这些需要对话记录中的工具结果（`external_fact`）。
- 声称用户确认、选择或批准了某件事，需要有真实的用户消息作为证据；否则完成提案会被拒绝。
- 模糊、主观或开放式的条件永远无法积累足够的证据；循环随后会一直运行，直到达到限制。

因此，一个好的目标应让代理产生证据：运行指定的检查，并粘贴决定性的输出行。

## Step 0 — 这是否应该成为一个 Goal？

当请求是普通的一次性任务、需要设计或产品判断，或者无法通过代理自身的输出进行检查时，简短地回答“不应该”。提议直接执行，或改为编写计划。无法检查的 Goal 其实是提示词，而不是 Goal。

## Step 1 — 检查活动 Goal

调用 `get_goal`。如果已有活动的 Goal，询问是要编辑它（相同的 Goal，但措辞更严谨 → `/goal edit`），还是替换它（`/goal set`）。绝不要起草第二个并行的 Goal。

## Step 2 — 以工作区为依据起草

在提问之前，使用 `read_file`、`glob` 和 `grep_search` 验证你能够确认的内容：已命名的文件和包是否存在，以及实际的检查命令是什么（`package.json` 脚本、`Makefile`、CI 工作流、测试配置）。在“完成条件”中使用这些确切的命令。绝不要臆造路径、ID 或命令；对于任何无法确认的内容，写入 `<TODO: …>`。

## Step 3 — 最多进行一轮提问

使用 `ask_user_question` 提问，一次调用提出 1–3 个问题，每个问题都提供选项和推荐的默认值。仅当答案会改变检查方式、范围或预算时才提问。典型问题包括：

- 哪项检查定义成功：测试命令、构建、指标阈值、文件或状态断言？
- 使用哪个环境：本地、CI、staging？
- 有哪些限制：哪些文件不可修改，哪些操作不可执行（push、delete、publish）？
- 尝试多长时间后停止并标记为受阻？

提问规则：

- 不要询问你可以通过读取工作区了解到的内容。
- 将问题合并到一次 `ask_user_question` 调用中；不要每轮只问一个。
- 只询问只有用户才能回答的内容：什么算完成、哪些内容不可触碰、尝试多长时间。
- 如果无法找到具体的结果验证方式，**必须**提问，并提供 2–3 个候选检查方式。不要跳过这一步，也不要臆造验证方式。

如果无法提问（无头模式，或客户端不支持提示），请采用推荐的默认值，并在 Context 中标记为 `[ASSUMPTION]`。

## 第 4 步——起草目标

使用以下标签，顺序必须完全一致。交接时让整个目标保持在一行——`/goal` 解析器会用空格连接各行，因此请为各项编号，不要依赖换行。正文使用用户的语言；标签保留英文，以便验证器匹配。

```text
Outcome: <one sentence: what is true when done>
Done when: 1) <command> exits 0 and its output shows <…> (paste that line); 2) <file/state assertion provable via read or grep>; 3) …
Must not: <files not to touch; tests/thresholds not to weaken; irreversible actions not to take>
Budget: stop as blocked after <N> turns (default 20) or <M> minutes without measurable progress
On block: propose blocked with the exact blocker and the decision a human must make; never claim completion without evidence for every Done-when item
Context: <only facts the agent cannot derive: paths, branch, environment, earlier decisions>
```

经验法则：

- 只能有一个 Outcome。多个结果 = 多个目标，或者使用一个清单文件，并设置一个“`<file>` 中的每一项均已勾选”的目标。
- 每个 Done-when 项都必须是二元可判定的，并且至少有一项可以通过工具观察（具有退出码或输出行的命令、存在的文件，或匹配成功的 grep）。
- 相较于开放式重构，优先使用“`<scope>` 中最小且安全的更改”。
- 任何过程中不得更改的内容都放入 Must not——这可以防止循环通过删除失败的测试来“通过”。
- 保持简短：所有代理都能从工作区推导出的内容都不要写入。目标长度尽量控制在约 1200 个字符以内。

### 从弱到强

| 弱 | 强                                                                                                                                                                                                                                                                                                                                                                                           |
| ----------------------------- | ----------------------------- |
| 让 checkout 更快 | Outcome: checkout API p95 is below 250 ms on the documented slow path. Done when: 1) `npm run bench:checkout` exits 0 and prints a p95 below 250 (paste the line); 2) `npm test` exits 0. Must not: change the benchmark, skip tests, touch files outside `src/checkout`. Budget: stop as blocked after 20 turns. On block: report the measured p95 and what blocks it. |
| 继续处理 PR 评论 | Outcome: every unresolved review thread on PR #123 is fixed or answered. Done when: 1) the review-threads query shows zero unresolved threads (paste the count); 2) CI on the head commit is green (paste the check summary). Must not: force-push, resolve a thread without replying to it. Budget: stop as blocked after 30 turns. On block: list the threads that need a maintainer decision. |
| 清理 auth 模块 | Not a goal — "clean" has no check. Ask what would be observable (zero lint warnings in `src/auth`? a file count? a coverage threshold?) or offer a refactor plan instead. |
| 发布版本 | Not a goal as written — publishing is irreversible. Either narrow it to a checkable pre-release state (tag exists, changelog entry present, `npm run release:dry-run` exits 0) and put "do not publish" in Must not, or leave publishing to a human. |

## 第 5 步——自检，然后交接

打印前检查每一行：

1. 存在“完成条件”，其条目已编号，且每项都是二元条件。
2. 至少有一项写明命令、退出代码、文件或 grep 模式，并要求粘贴输出。
3. 不得使用主观形容词作为条件（clean、better、robust、elegant、reasonable，……）。
4. 不得将“在用户确认/批准之后”作为完成条件——这应放在 On 区块中，作为必须由人做出的决定。
5. 存在预算或 On 区块。
6. 恰好有一个 Outcome。
7. Context 中的每个路径和命令都已在工作区中验证，或标记为 `<TODO>`。
8. 少于约 1200 个字符。
9. 不可逆操作（push、delete、publish）已列入 Must not，或用户已明确允许这些操作。

然后仅输出以下内容，不要输出其他内容：

1. 用 fenced code block 包含目标。
2. 一行用户可以直接运行的命令：`/goal set <objective on one line>`（在收紧当前目标时使用 `/goal edit …`）。将其作为纯文本输出，不要添加代码标记，以便可以原样复制。
3. 如果有任何假设（`[ASSUMPTION]` / `<TODO>` 项），用一句话说明你的假设。

不要自行运行 /goal。不要开始执行任务。停下并等待用户。