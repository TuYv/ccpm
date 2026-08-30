---
name: superdelegate
description: How to hand work to another agent, run Autopilot, and work through an issue backlog with safe parallelism. Loaded into every session.
auto: true
---
# 分派工作

## 使用哪个通道

| 工作                                     | 使用                 |
| ---------------------------------------- | ------------------- |
| 一个命令，一个答案                       | `shell`             |
| 对 N 个独立部分执行相同操作              | `delegate`          |
| 从上下文运行 Autopilot / 继续执行        | 下面的 Autopilot    |
| 并行处理一批问题                         | 下面的方法          |

自己运行单个命令。启动一个 agent 来运行 `pwd` 需要花费几分钟和实际的费用，而且返回的答案没有人观察其生成过程。

`delegate` 会启动子 coding agent，让它们并行运行相同的提示词；每个 agent 都有各自的文件和 shell 工具。子 agent 不具备本次对话的上下文，也无法提问，因此提示词必须包含所有信息。每个子 agent 都会收到相同的提示词，并分别获知自己的编号——请面向正在阅读的子 agent 编写，而不是指名某一个。

`delegate` 工具使用为此 Coder 会话配置的子通道。独立的 `openagents delegate` 命令接受 `--lane`；支持的值包括 `openagents`、`gemini`、`opencode/<model>`、`devin`、`claude` 和 `codex`。开始分发任务之前先选择通道。

`devin` 会通过 Devin CLI 运行子 agent，而 `devin:<mode>` 可以选择默认 `dangerous` 以外的权限模式。Devin 子 agent 使用自己的凭据和模型，不会消耗本会话的授权额度。相比之下，最好不要通过 `shell` 自己运行 `devin`：fleet 子 agent 会进行渲染，使用 `ctrl+x` 停止，并且不会阻塞当前轮次；而 shell 子 agent 是一个不透明的调用，会冻结会话直到其结束。

## Autopilot

当用户说 **run Autopilot** 时，启动它。不要在本会话中重新实现这一循环。

```
openagents coder --autopilot
openagents coder --autopilot "work the open issues"
openagents coder --autopilot --dry-run
openagents --autopilot
```

CLI 会评估此工作区、最近的本地 Coder 会话以及未解决的问题，然后持续迭代，直到满足停止条件。`--dry-run` 会打印计划，但不会调用模型。托管通道需要令牌；当 Ollama 返回结果时，`--lane local` 可以在未签名的情况下运行。

Autopilot 是一个无人值守的循环，会自行选择下一个单元。`delegate` 会将相同的提示词分发给 N 个子 agent。不要将 Autopilot 包装在 `delegate` 中。不要为一个你可以在此处完成的指定问题启动 Autopilot。其余内容见 `openagents-cli` skill。

## 处理一批未完成事项

当任务是“处理这些问题”，而不是某个指定事项时，采用以下方法。这种方法有意带有明确倾向：下面的决策正是临时做出决定时最容易出错的地方。

### 1. 在处理看板之前先阅读它

列出该账号能够访问的每个仓库中的未解决问题——至少包括 `OpenAgentsInc/openagents` 和 `OpenAgentsInc/openagents.com`。使用 `openagents` 工具，阅读纯文本输出；只有在需要获取某个字段时才使用 `--json`。

### 2. 可处理意味着未被阻塞

`openagents issue view <n>` 会报告 `Blocked` 和 `Blocked by`。**被阻塞的问题不可处理**，无论它看起来多么准备就绪；启动这样的任务会浪费一个子 agent，并产生无法合并的变更。将被阻塞的问题标记为阻塞状态，说明它们在等待什么，然后搁置它们。

优先选择 `agent-ready`。形态仍是一个问题的 issue，不适合交给无法提问的子 agent。

### 3. 每个表面一个子 agent

两个子 agent 编辑同一组文件，会产生没人要求的合并冲突。按照它们涉及的表面——一个 package、一个目录、一个 module——对可执行的 issue 分组，并确保**每个表面同时只有一个正在执行的子 agent**。涉及不同表面的 issue 可以自由并行执行。

如果两个 issue 必须涉及同一个表面，就按顺序执行，或者为每个子 agent 提供独立的 git worktree，使它们的修改无法相遇。

### 4. 根据思考类型进行分派

- **Devin** 负责直接明了的工程工作：明确命名的修复、要编写的测试、迁移、重命名、形态清晰的文档变更。
- **OpenAgents** 负责设计、架构，以及答案的形态本身仍是问题的工作。

如果无法判断，就归入第二种。

### 5. 找出并发宽度，不要自行设定

**绝不要选一个数字然后寄希望于它。** 从大约四个开始并逐步增加：

1. 运行一轮四个。
2. 在扩大宽度之前，先查看：系统负载和可用内存
   (`uptime`、`vm_stat` 或 `free`)、账户的 `openagents auth status`，以及是否有任何子 agent 返回速率限制、配额拒绝或 provider 错误。
3. 如果这三项都正常，就提高宽度——四个、六个、八个——然后再次运行。
4. 一旦出现**第一个**限制，就停止增加，并保持在上一次正常的宽度。不要为了确认而继续超过它；确认会付出一轮失败子 agent 的代价。

宽度是测量结果，而不是设置值。一台有十六个空闲核心且账户健康的机器，运行的数量应远超四个；一台正在交换的机器则应运行更少。报告你达到的宽度，以及是什么阻止了继续增加。

### 6. 随时报告进展

每轮结束后，说明选中了哪些 issue、跳过了哪些 issue 以及原因、每个子 agent 返回了什么，以及当前宽度是多少。只在最后报告的 backlog 运行，没有人能够对其进行调整。

## 处理并完成 issue

当被分配或要求修复或处理某个 issue 时，要完整交付解决方案：通过测试验证修复，直接推送到 `main`（或工作分支），并关闭 issue，不要设置单独的确认步骤。

注意不要影响其他人并行进行的工作：推送前检查 git 状态和 remotes。某个 agent 声称自己已经完成，并不代表它确实完成了：读取 diff、运行测试，并在关闭 issue 前验证输出。

### 工作单元流程（每次都主动执行，无需提醒）

所有者在 `AGENTS.md` 中的 2026-07-20 mandate 以及 `docs/coder/2026-08-28-local-session-audit.md` 的 unlock 64 中给出的长期指示是：每个实现工作单元都要执行**fresh worktree → land to `main` → clean up**，不应有人还需要特别说明。当对方说“do the issue”时，流程如下：

1. **认领** — 在 issue 上评论说明你正在接手（单行格式：actor、unit、done-when）。tracker 是账本；这能防止另一个 sibling tab 在一小时后实现同一件事。
2. **隔离** — 使用 `worktree start`（受管理的工具，而不是原始的 `git worktree add`）：当 remote 有响应时获取 `main`，在 `~/.openagents/worktrees` 下创建 detached tree，将当前 session 的文件和 shell 工具指向该 worktree，并将 `CARGO_TARGET_DIR` 设置在可丢弃 tree 之外，使构建缓存得以保留。绝不要在 canonical checkout 中实现——那里经常有另一个 agent 正在进行的未提交工作，而混合 reset 已经导致过实际的 landing 丢失。
3. **在那里实现并验证** — 根据修改内容为测试指定 package 和名称（`cargo test -p <pkg> <name>`），绝不要进行试探性的 `--workspace` 运行；pre-push hook 会在推送时运行完整检查。
4. **落地** — 使用说明变更及其证据的提交消息进行 commit（证据应为数字，而不是形容词），推送到 forge remote（`openagents`）的 `main`，并在安全的情况下将 canonical checkout 快进同步。
5. **关闭并清理** — 在关闭评论中写入 landing SHA，然后使用 `worktree finish` 并设置 `landed=true`，以移除 tree 和 branch。同一工作单元的重试或回归测试属于延续工作：复用现有 worktree，而不是新建一个。

如果会话在落地前终止，工作树会保留下来，并如实标明自身状态——
`worktree finish` 会以 `landed=false` 诚实地说明这一点。它绝不能做的是把 WIP 留在共享检出目录中。