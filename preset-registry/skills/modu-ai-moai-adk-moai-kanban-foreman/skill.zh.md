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
# 看板工长循环迭代

看板工长的一次无人值守执行：监视待办队列，将操作员选取的下一张卡片分派给隔离的工作代理，收集完成证据并报告。队列界面是 `moai todo`；分派协议和卡片类别定义在看板分派规则（`.claude/rules/moai/workflow/kanban-dispatch.md`）中。

## 无人值守运行

此技能处于活动状态时，`AskUserQuestion` 会从工具池中移除——这是确保循环不会停下来提问的机制保障。任何原本会成为问题的内容都会变成迭代报告中的一行，而任何确实需要操作员决定的事项都会按照下方的边界条件成为阻塞卡片。

部署：在项目中启动一个会话，直接运行 `/loop`，然后将会话置于后台——循环任务会转移到后台会话中，并在没有终端的情况下继续运行。`Esc` 会取消等待中循环的待定唤醒。循环任务会在创建七天后到期；如果看板仍然需要工长，请重新启动它。后台监视器不会在会话恢复后继续存在——恢复后的第一次迭代会重新启用队列监视。

会话的权限设置必须已允许此循环使用的操作（读取队列、检查 git、启动工作代理）。无人值守期间出现的权限提示会使迭代停滞，直到有人接入；在项目设置中预先批准这些操作是操作员的设置步骤，并非此循环能够自行完成的事情。

## 边界条件（硬性）

1. **由操作员准入并选取工作。** 只有状态已经是 `picked` 的待办项才能被分派。绝不运行 `moai todo add`；绝不运行 `moai todo next <n>`——该变更是操作员的选取操作。绝不臆造、改写或重新排序卡片。队列为空是一种正常状态：说明这一情况并进入空闲状态。
2. **不得代表操作员通过任何批准关卡。** 当卡片的下一步需要尚未记录为已作出的人为决定时（计划执行的启动批准、审查严重程度判定、范围选择），不要继续。将卡片保持为 `picked`，在报告中将其标明为等待操作员而阻塞，同时注明其正在等待的决定，然后继续处理。
3. **同一时间只能有一个具备写入能力的工作代理。** 工作代理执行期间，迭代只能进行读取。绝不同时运行两个具备写入能力的代理。
4. **每个工作代理都在自己的工作树中运行**（启动时使用 `isolation: "worktree"`；提示词中使用相对路径——工作代理的 CWD 是其工作树根目录）。不得向共享检出目录写入任何内容。
5. **不得执行集成操作。** 不得推送、创建拉取请求、合并、删除分支或处置工作树。卡片的分支尚未推送，其工作树是该工作的唯一实例；两者都必须保留，直到操作员完成集成。报告中需注明分支和工作树路径。
6. **验证仅限当前通道。** 工作代理只运行其自身变更可能影响的检查；完整测试套件由 CI 负责。绝不启动会在后台占用 CPU 的负载——下方的队列监视是此循环唯一会启用的长时间运行进程。
7. **完成状态必须读取验证，绝不直接信任。** 只有本次迭代实际读取到证据后，卡片才能推进。

## 迭代流程

1. **监视队列。** 如果当前没有运行中的积压任务监视器（首次迭代或恢复后），就在队列文件上启动一个持久化 Monitor：

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

   每次变更时，队列文件都会被原子替换，因此持续跟踪单个文件句柄的工具不适合此处；校验和轮询会在每次变更时输出一行，并且每五秒仅产生一次极小的读取开销。不要缩短时间间隔，也不要启动第二个监视器。每个输出行与每次计划唤醒一样，都是运行此幂等迭代的提示——如果一次迭代发现无事可做，就会很快结束。

2. **读取队列。** `moai todo list --json`（无锁）。队列文件缺失表示队列为空，绝不视为错误。记录包含 `id`、`text`、`spec_id` 和 `state`（`queued` | `picked` | `dropped`）。

3. **先收集，再派发。** 如果之前某次迭代派发的工作进程已经返回，请先读取其证据文件（第 6 步）。如果工作进程仍在运行，则以一行状态信息结束本次迭代。

4. **选择可派发的卡片。** 选择最早的、没有正在运行的工作进程且没有已记录阻塞项的 `picked` 条目。`queued` 条目不由你选取。

5. **派发一个工作进程**，使用 Agent 工具并设置 `isolation: "worktree"`。派发内容是一个字段固定的地址块——它是指针，而非副本，最多十行：

   ```
   card: <id>
   spec: <SPEC-ID>            # only when the card carries one
   cmd: <the card's work in one line; the phase command when a SPEC is attached>
   evidence: .moai/reports/<card-id>/evidence.md
   ```

   按照标准委派规则，将派生任务路由给与卡片工作相匹配的代理；如果没有匹配的专家，则派生通用代理并设置领域白名单。工作进程提示词应包含上述地址块以及以下长期指令：首先将工作树分支重命名为 `WT-<card-id>`；实现卡片任务；在当前工作通道内进行验证；编写证据文件，其中包含决策、所运行检查的原样输出末尾、明确列出的缺口以及残余风险；使用明确的路径规范提交；绝不推送。

6. **根据证据收集结果。** 工作进程返回后，读取其指定的证据文件。只有当证据表明工作已经完成时——包含原样的通过输出，并已列明缺口——才推进卡片：`moai todo done <t-id>`。证据文件缺失、不可读或已过期均属于缺口：卡片保持 `picked` 状态，报告中说明原因，并且本次迭代不再重新派发该卡片。没有失败信号并不等同于通过。

7. **报告。** 最后用两到六行收尾：队列摘要、已派发或已收集的内容、读取了哪些证据、被阻塞的卡片及其正在等待的决策。这份报告是操作员重新连接时所阅读的内容——说明你实际读取了什么，而不是别人告诉了你什么。

## 工厂扩展点（预留，尚未实现）

上述单工作器分派是目前唯一的模式。将一张卡片分发到
带编号的工厂工作器通道——即多通道启动器接口——属于
另一项独立工作；当工头扩展该路由能力时，它将作为
按卡片选择的第二种分派模式落在此处。在此之前，此循环会为每张卡片生成一个
子代理，不读取任何工厂状态，也不启动任何通道。

## 故障处理

当循环无法完成其工作时，请停止循环（使用设置了 `stop: true` 的 `ScheduleWakeup`），
并附上一行原因：队列文件反复无法读取、
无法启用队列监视，或此技能自身的接口已损坏。
临时的工作器故障不属于循环故障——将其记录在卡片上，
并让下一次迭代决定是否重新分派。