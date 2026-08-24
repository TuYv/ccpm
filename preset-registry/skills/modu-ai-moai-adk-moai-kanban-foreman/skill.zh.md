---
name: moai-kanban-foreman
description: >
  One unattended kanban foreman iteration: watch the backlog queue, dispatch
  the next operator-picked card to an isolated worker, collect completion
  evidence on read (not on claims), and report. This is the body the
  project's loop.md driver invokes each iteration of a bare /loop; it can
  also be invoked directly to test one cycle by hand.

when_to_use: >
  Use when a bare /loop kanban foreman iteration fires (the loop.md driver
  points here), or when the operator asks for a single manual foreman pass
  over the backlog queue.

license: Apache-2.0
compatibility: Designed for Claude Code
allowed-tools: Read, Grep, Glob, Bash(moai todo:*), Bash(git status:*), Bash(git log:*), Bash(git rev-parse:*), Bash(git diff:*), Bash(git show:*)
disallowed-tools: AskUserQuestion
user-invocable: false
metadata:
  version: "1.0.0"
  category: "workflow"
  status: "active"
  tags: "kanban, foreman, loop, backlog, dispatch, unattended"

# MoAI Extension: Progressive Disclosure
progressive_disclosure:
  enabled: true
---
# 看板工头循环迭代

看板工头的一次无人值守运行：查看待办队列，将操作员挑选的下一张卡片调度给隔离的工作器，收集完成证据并报告。队列界面是 `moai todo`；调度协议和卡片类别位于看板调度规则（`.claude/rules/moai/workflow/kanban-dispatch.md`）中。

## 无人值守运行

`AskUserQuestion` 在此技能处于活动状态期间会从工具池中移除——这是确保循环无法停下来提问的机械保障。任何原本需要提问的事项都会变成迭代报告中的一行，而任何确实需要操作员决策的事项，都会按照下面的边界变成一张阻塞卡片。

部署：在项目中启动一个会话，运行裸 `/loop`，然后将该会话置于后台——循环任务会转移到后台会话中，并在没有终端的情况下继续运行。`Esc` 会取消等待中循环的待唤醒状态。循环每七天会在创建后过期；如果看板仍需要工头，则重新启动它。后台监视器不会在会话恢复后继续运行——恢复后的第一次迭代会重新启用队列监视。

会话的权限设置必须已经允许此循环所使用的操作（读取队列、检查 git、派生工作器）。如果无人值守期间出现权限提示，迭代会停滞，直到有人附加到会话；在项目设置中预先批准该权限范围是操作员的设置步骤，而不是此循环可以自行完成的事项。

## 边界（严格）

1. **操作员接纳并挑选工作。** 只有状态已经是 `picked` 的待办项目才可调度。绝不运行 `moai todo add`；绝不运行 `moai todo next <n>`——该变更属于操作员的挑选操作。绝不发明、改写或重新排序卡片。空队列是合法状态：说明这一点并保持空闲。
2. **不得代替操作员回答任何审批关卡。** 当卡片的下一步需要人类决策，而该决策尚未被记录为已作出时（计划执行启动批准、审查严重性判断、范围选择），不要继续。将卡片保持为 `picked`，在报告中将其标记为 blocked-for-operator，并说明它等待的决策，然后继续处理其他卡片。
3. **同一时间只能有一个具备写入能力的工作器。** 当工作器正在运行时，本次迭代只能读取。绝不并发运行两个具备写入能力的代理。
4. **每个工作器都必须在自己的工作树中运行**（派生时使用 `isolation: "worktree"`；提示中的相对路径——工作器的 CWD 是其工作树根目录）。任何内容都不得写入共享检出目录。
5. **不得执行集成操作。** 不得推送、创建拉取请求、合并、删除分支或处置工作树。卡片的分支未推送，其工作树是该工作的唯一实例；两者都必须保留，直到操作员将其集成。报告中要写明分支和工作树路径。
6. **验证仅限于所属通道。** 工作器只运行其自身变更可能影响的检查；完整测试套件交由 CI 负责。绝不派生后台 CPU 负载——下面的队列监视是此循环唯一会启用的长时间运行进程。
7. **完成状态只能读取确认，不能盲目信任。** 卡片只有在本次迭代实际读取到相关证据后才能推进。

## 迭代

1. **队列监视。** 如果当前没有正在运行的 backlog 监视器（首次迭代或恢复后），则在队列文件上启动一个持久化 Monitor：

   - `command`：

     ```sh
     f=.moai/state/kanban/backlog.json
     last=init
     while true; do
       if [ -f "$f" ]; then cur=$(cksum "$f"); else cur=missing; fi
       if [ "$cur" != "$last" ]; then
         [ "$last" != init ] && echo "backlog changed"
         last=$cur
       fi
       sleep 5
     done
     ```

   - `persistent: true`
   - `description: backlog queue watch`

   队列文件在每次变更时都会被原子替换，因此，跟踪单个文件句柄的工具并不适用于此处；校验和轮询每次变更输出一行，每五秒进行一次极小的读取。不要缩短轮询间隔，也不要启动第二个监视器。每一行输出都和每次计划唤醒一样，是运行同一幂等迭代的提示——如果某次迭代没有任何工作可做，就会迅速结束。

2. **读取队列。** `moai todo list --json`（无锁）。队列文件不存在时视为空队列，绝不能视为错误。记录包含 `id`、`text`、`spec_id` 和 `state`（`queued` | `picked` | `dropped`）。

3. **分派前先收集。** 如果之前某次迭代分派的 worker 已返回，先读取其证据文件（第 6 步）。如果某个 worker 仍在运行，则以一行状态信息结束本次迭代。

4. **选择可分派卡片。** 选择最早的、没有正在运行的 worker 且没有已记录阻塞项的 `picked` 项。`queued` 项不由你负责领取。

5. **分派一个 worker**，使用 Agent 工具，并设置 `isolation: "worktree"`。分派内容是一个固定字段的地址块——它是指针而不是副本，最多十行：

   ```
   card: <id>
   spec: <SPEC-ID>            # only when the card carries one
   cmd: <the card's work in one line; the phase command when a SPEC is attached>
   evidence: .moai/reports/<card-id>/evidence.md
   ```

   按照标准委派规则，将任务分派给与卡片工作相匹配的 agent；如果没有匹配的专家，则使用带有领域白名单的通用 spawn。worker 提示中应包含该地址块以及以下固定指令：首先将 worktree 分支重命名为 `WT-<slug>`（使用描述性 slug，绝不能使用卡片 id）；实现卡片要求；在所在工作流中完成验证；将决策、所运行检查的逐字输出尾部、明确列出的缺口以及剩余风险写入证据文件；通过显式 pathspec 提交；绝不推送。

6. **根据证据进行收集。** worker 返回后，读取它指定的证据文件。只有当证据表明工作已完成时，才推进卡片——`moai todo done <t-id>`：其中必须包含逐字记录的通过输出，并列出缺口。证据文件缺失、无法读取或已过时都属于缺口：卡片保持为 `picked`，报告中说明原因，并且本次迭代不重新分派该卡片。没有失败信号不等于通过。

7. **报告。** 以两到六行结束：队列摘要、已分派或已收集的内容、读取了哪些证据、被阻塞的卡片以及它们等待的决策。这份报告是操作员重新连接时阅读的内容——写明你读取了什么，而不是别人告诉了你什么。

## 工厂接缝（保留，尚未实现）

上述单 worker 分发是唯一模式。将卡片分发到编号的工厂 worker 通道——即多通道启动器界面——属于独立工作；当 foreman 扩展这套路由后，它会作为按卡片选择的第二种分发模式落在这里。在此之前，此循环会为每张卡片生成一个 subagent，不读取任何工厂状态，也不会启动任何通道。

## 故障处理

当循环无法执行其工作时，停止循环（使用 `ScheduleWakeup` 并设置 `stop: true`），同时给出一行原因：队列文件反复无法读取、无法建立队列监视，或此 skill 自身的界面已损坏。临时的 worker 故障不属于循环故障——将其记录在卡片上，并让下一次迭代决定是否重新分发。