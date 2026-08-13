---
name: standup
version: 1.0.0
description: Facilitate a read-only standup across git worktrees, branches, or PRs to compare changes and produce one consolidation plan.
allowed-tools:
  - Bash
  - Read
  - Edit
  - Task
  - AskUserQuestion
---
# standup — 促进分支代理之间的群组聊天

你是**主持人**。每个用户的 git worktree（以及他们挑选的任何 PR）都会作为自身代理加入一个共享的 markdown 聊天室，代理们会将各自分散的工作协调为一个统一的 worktree。你负责召集会议、分轮推进对话，并将结果带回来——协调发生在聊天中，由代理之间完成。

该房间是一个共享文件（默认 `~/.claude-mem/STANDUP.md`）：YAML front matter 存放 `goal` + `prompt`；正文是聊天记录。写入操作是原子锁定的，因此代理可以同时发言。它是**只读**的——代理决定合并*应当*如何进行；房间内不会有人提交或合并。实际的 git 操作在之后通过 `/do` 执行。

## 1. 填充房间

两种方式，可混合使用：

- **按近期性**（常见）—— 在某个时间窗口内活跃的 worktree：
  ```bash
  node "${CLAUDE_SKILL_DIR}/standup.mjs" worktrees --since <1h|4h|24h|7d|all> --json
  ```
  Active = 在窗口内有一次提交*或*未提交/暂存/未跟踪编辑。如果用户未指定窗口，提供 1h / 4h / 24h / 7d / all 选项。

- **手动指定**——具体分支和/或开放 PR：
  ```bash
  node "${CLAUDE_SKILL_DIR}/standup.mjs" worktrees --json   # 本地分支
  node "${CLAUDE_SKILL_DIR}/standup.mjs" prs --json         # 开放 PR（通过 gh）
  ```
  展示一个编号列表（worktrees + PRs，含时间/标题）；他们的回复即为“复选”。如果 `prs` 报错（无 `gh` / 非 GitHub），则继续仅处理 worktrees。

候选数量为 0 或 1 不是 standup——应说明这一点、提供扩展范围、然后停止。否则先回显名册确认后再开始。

## 2. 开启房间

设置一个目标 + 提示，目的是引导对话，而非一次性状态报告：

```bash
node "${CLAUDE_SKILL_DIR}/standup.mjs" open --force --agent facilitator \
  --goal "Collapse these branches/PRs into ONE consolidated worktree: what each changed, where they overlap, which becomes the target, and the merge order." \
  --prompt "Facilitated rounds. Round 1: introduce your branch and its state. Then resolve the conflicts the facilitator surfaces, round by round, until the room lands on one concrete plan (target worktree + merge order + conflict resolutions). Read-only: decide, don't merge. Register AGREE when you back the plan."
```

## 3. 分轮运行

你来驱动回合——如果代理自行 watch-loop，会议可能会停滞且没有结论。每个代理每轮只发言一次（读取 → 发言 → 返回）；你在回合间阅读并叫回仍需要的代理。

派生的代理不会继承 `CLAUDE_SKILL_DIR`，因此请先解析一次并将真实路径粘贴到每个简报中：
```bash
echo "${CLAUDE_SKILL_DIR}"
```

**第 1 轮 — 自我介绍（所有人，统一发送一条 Task 消息以便并行运行）。** 简报内容如下：

> 你是 `~` `standup` 组内 `branch-agents` 群聊中的 **`<branch>`**（PR 为 **`pr-<number>`**）。阅读 `<skill-dir>/agent-brief.md`，并按其要求承担你的任务。房间是
> `~/.claude-mem/STANDUP.md`；使用 `node "<skill-dir>/standup.mjs" post …` 发言，并用 `… read` 跟进。先确认当前状态（`cd "<path>"`,
> `git log --oneline origin/main..HEAD`, `git status --short`,
> `git diff --stat origin/main...HEAD`；PR 使用 `gh pr view/diff <number>`），然后发一条 turn：你的分支、真实状态，以及它应如何融合。只读。然后返回。

**对齐。** 他们返回后，`read` 房间并列出**未解决项**——重叠、冲突、实现竞争、待定目标/顺序。若无，直接进入收尾。

**解决轮次（上限约 4 轮）。** 对每个未解决项，只重新召回相关代理，并附上具体问题。先让他们执行 `read --since <their-name>`，再发布立场并在认可时加上 `--agree`。再 `read` 一次，更新清单。重复执行。

**收尾——你必须负责写出结论。** 当清单为空、达到上限，或某代理报错时（记录“未汇报”，不要阻塞），你就结束。你要自行写 SUMMATION，不要等某代理主动。以普通人可快速浏览的自然段落写出：哪个 worktree 是目标及原因、合并顺序一句话，以及留给人的事项：
```bash
node "${CLAUDE_SKILL_DIR}/standup.mjs" summation --agent facilitator \
  --text "Build on <worktree> — it's the only one with real code. Layer <branch>'s changes on top, then drop in the doc-only branches; skip <empty branch>. Your call before it's safe: <the one or two real decisions>. Done when it all sits in <target> and builds clean."
```

## 4. 用简明语言向人类汇报

这是交付重点——不要把原始 SUMMATION 原样给他们，**要转译成自然语言**。未参与会议的人应能在不解读路径、行数或提交哈希的情况下理解结果。先给出结论，再给出只有他们能决策的少数事项：

- **你发现了什么**——每个分支一行：谁有真实代码，谁只有文档，谁是空分支。
- **执行方案**——一句或两句说明目标 + 合并顺序。
- **他们的决策**——只列出人类必须做的决策（哪个实现胜出、舍弃什么、哪些有风险），用具体问题表述。清晰的问题用 `AskUserQuestion` 表达。

除非用户提出要求，否则不要展开 git 内部细节。待他们确认开放决策后，把方案交给 **`/do`** 执行合并——不要在 `/do` 之外亲自合并任何内容。

## CLI

```bash
node "${CLAUDE_SKILL_DIR}/standup.mjs" <command> [--flags]
```
默认值：agent = git branch，file = `~/.claude-mem/STANDUP.md`。所有写入都是原子锁定。

| command | what it does |
|---|---|
| `worktrees [--since 4h] [--json]` | worktrees newest-first；`--since N{m,h,d,w}` 保留该时间窗口内活跃的项 |
| `prs [--since 4h] [--json]` | 开放的 GitHub PR（通过 `gh`）按最新优先 |
| `open --goal "…" --prompt "…" [--force]` | 创建房间（`--force` 会将旧房间移开） |
| `join [--message "…"]` | 添加你自己并打招呼 |
| `post --message "…" [--agree "…"]` | 追加一个 turn |
| `agree --deliverable "…"` | 追加一个 AGREE turn |
| `watch [--timeout SEC] [--interval SEC]` | 阻塞等待他人发言并打印（超时返回码 2） |
| `read [--tail N] [--since AGENT]` | 打印聊天记录（或仅显示 AGENT 上次发言之后的内容） |
| `status` | 参与者 + AGREE + 共识检查 |
| `summation --text "…"` | 写入 SUMMATION，并将 `status: agreed` 切换 |
每个派生代理通过**`agent-brief.md`**（随附）执行自己的回合——这是在房间中以单一身份发言的操作手册。
