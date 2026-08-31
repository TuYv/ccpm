---
name: loop
description: Create a loop that runs a prompt now and follows up either on a fixed schedule or through self-paced wakeups. Usage - /loop check the build, /loop 5m check the build, /loop check the PR every 30m. /loop list to show jobs, /loop clear to cancel all.
argument-hint: '[interval] [prompt] | list | clear'
allowedTools:
  - cron_create
  - cron_list
  - cron_delete
  - loop_wakeup
---
# /loop — 重复运行提示

## 子命令

如果输入（去除 `/loop` 前缀后）恰好是以下关键词之一，则运行子命令，而不是进行调度：

- **`list`** — 调用 CronList 并显示结果。完成。
- **`clear`** — 调用 CronList，然后对返回的每个任务调用 CronDelete。确认取消了多少个任务。完成。

## 解析

解析去除 `/loop` 前缀后的输入：

1. **空输入**（没有提示，也没有间隔）：**自主路径** — 运行自定节奏的自主循环。参见“自主模式”部分。
2. **开头的间隔标记**：如果第一个以空格分隔的标记匹配 `^\d+[smhd]$`（例如 `5m`、`2h`），则这是固定间隔的重复路径。其余部分是提示。
3. **结尾的 "every" 子句**：否则，如果输入以 `every <N><unit>` 或 `every <N> <unit-word>` 结尾（例如 `every 20m`、`every 5 minutes`、`every 2 hours`），则这是固定间隔的重复路径。提取该间隔，并将其从提示中移除。仅当 "every" 后面跟的是时间表达式时才匹配——`check every PR` 不包含间隔。
4. **仅提示输入**：否则，整个输入都是提示，这是仅提示的自定节奏路径。

如果给定了间隔但提示为空（例如 `/loop 5m`），则这是固定间隔的**自主**循环——参见“自主模式”部分。

示例：

- `5m /babysit-prs` → 固定间隔 `5m`，提示 `/babysit-prs`（开头的间隔标记）
- `check the deploy every 20m` → 固定间隔 `20m`，提示 `check the deploy`（结尾的 "every" 子句）
- `run tests every 5 minutes` → 固定间隔 `5m`，提示 `run tests`（结尾的 "every" 子句）
- `check every PR` → 仅提示的自定节奏路径，提示 `check every PR`（"every" 后面没有跟时间表达式）
- `check the deploy` → 仅提示的自定节奏路径，提示 `check the deploy`
- （空）→ 自定节奏的自主循环（哨兵 `<<autonomous-loop-dynamic>>`）
- `5m` → 固定间隔的自主循环（间隔 `5m`，哨兵 `<<autonomous-loop>>`）

## 仅提示的自定节奏路径

仅当用户提供了提示且未提供间隔时，使用此路径。

1. 不要为此路径调用 CronCreate。
2. 如果此 tick 以 `<task-notification>` 块开头（监视器或后台事件重新调用了你，而不是一次单纯的 `/loop` 唤醒提示），请先处理该事件，然后再重新运行提示。
   - 如果通知表示被监视的条件已满足，而你仍保留任何待处理的回退 LoopWakeup 的 ID，请使用 CronDelete 取消它，然后结束循环。
   - 如果监视器因空闲或最大事件数而自动停止，并且该监视仍然有用，请将其重启一次，重新设置回退唤醒，向用户报告重启次数，并将该次数包含在 LoopWakeup 提示或原因中（例如 `monitor restarted 1/1 time`），使其能够在上下文压缩后继续保留。如果监视器在下一个 tick 再次自动停止，则结束循环，并向用户报告重复的自动停止。
   - 如果信号含义不明确，请重新设置一个更短的后续唤醒，并在下一个 tick 进行调查。如果信号连续三个 tick 仍然含义不明确，则结束循环，并报告该监视无法得出明确结论。
3. 立即运行解析后的提示。
   - 如果这是斜杠命令，则通过 Skill 工具调用它。
   - 否则，直接执行该提示。
4. 在结束此轮之前，决定是否有必要进行另一次检查。
   - 仅当继续跟进有用时，才调用 LoopWakeup。
   - 如果任务已完成，不要调用 LoopWakeup。
   - 如果任务受用户输入或无法在之后检查的外部状态阻塞，不要调用 LoopWakeup。
   - 如果没有有用的下一次检查，不要仅仅为了持续轮询而调用 LoopWakeup。
   - 如果你启动了后台 agent 或 Monitor，它会在退出、失败、取消或监视器自动停止时，通过终端 `<task-notification>` 唤醒你——因此应将 LoopWakeup 设置为较长的回退，而不是较短的轮询。不要因为有某个组件正在监视就省略它：工作可能会卡住，或者 Monitor 可能因空闲或最大事件数而自动停止（由其他 agent 所拥有的 Monitor 会仅将通知路由给该 agent）。仅在以下终止条件下省略 LoopWakeup：已完成、受阻塞，或监视器重复自动停止。
5. 调度后续操作时，使用以下参数调用 LoopWakeup：
   - `delaySeconds`：下一次有用延迟的秒数。运行时会将其限制在 60–3600（1–60 分钟）；请遵循工具自身关于如何选择数值的指导——它会考虑提示缓存窗口，以及后台任务将唤醒你时的回退心跳情况。
   - `prompt`：`/loop ${original prompt}`，以及下一次 tick 必须保留的任何状态，例如 `monitor restarted 1/1 time`。
   - `reason`：为所选延迟提供简短原因。在监视器自动停止后重新设置唤醒时，将监视器重启次数包含在此处。
6. 简要告知用户当前完成了什么。如果已调度唤醒，请说明预计下一次检查的时间。如果由于通知而结束循环且未调度唤醒，请说明是否取消了过期的回退；如果唤醒 ID 已丢失，则在它触发时忽略它，或简短回复该过期唤醒。

## 固定间隔循环路径

仅对带有前置间隔标记或尾部 `"every"` 子句的输入使用此路径。

### 间隔转换为 cron

支持的后缀：`s`（秒，向上取整到最近的分钟，最小为 1）、`m`（分钟）、`h`（小时）、`d`（天）。转换规则如下：

| 间隔模式           | Cron 表达式        | 备注                                     |
| ------------------ | ------------------ | ---------------------------------------- |
| `Nm` where N <= 59 | `*/N * * * *`          | 每 N 分钟                           |
| `Nm` where N >= 60 | `0 */H * * *`          | 按小时取整（H = N/60，必须能整除 24） |
| `Nh` where N <= 23 | `0 */N * * *`          | 每 N 小时                           |
| `Nd`               | `0 0 */N * *`          | 每 N 天，在本地时间午夜执行            |
| `Ns`               | treat as `ceil(N/60)m` | cron 的最小粒度为 1 分钟               |

如果间隔无法整除其单位（例如，`7m` 会导致从 `:56` 到 `:00` 的间隔不均匀，或者 `90m` 是 1.5 小时，cron 无法表示），请选择最接近的整齐间隔，并在安排任务前告知用户取整后的间隔。

### 操作

1. 使用以下参数调用 CronCreate：
   - `cron`：使用上表中的表达式
   - `prompt`：逐字使用上文解析出的提示词（斜杠命令保持不变并直接传递）
   - `recurring`：`true`
   - 如果用户的表述暗示需要持久化（“keep doing this”、“set this up permanently”、“every day even after restart”），则设置 `durable`：`true`。否则省略（默认为仅限当前会话）。
2. 简要确认：安排的任务、cron 表达式、以人类可读形式表示的执行频率、自动过期时间（默认为创建后 7 天——CronCreate 工具描述中说明了配置的限制，该限制可能有所不同或被禁用），以及用户可以通过 CronDelete 提前取消，并附上任务 ID。
3. 然后立即执行当前解析出的提示词。不要等待第一次 cron 触发。
   - 如果是斜杠命令，则通过 Skill 工具调用。
   - 否则，直接执行。

## loop.md 任务文件模式

当用户希望循环处理保存在文件中的任务列表时使用此模式（例如他们说“work through my loop.md”、“loop over the tasks in .qwen/loop.md”，或指向此类文件）。任务位于 `.qwen/loop.md`（项目级）或 `~/.qwen/loop.md`（主目录级；项目级优先）。不要使用自然语言提示词，而是将循环的 `prompt` 设置为一个哨兵值，以便每次触发时重新读取文件：

- 自主推进（无间隔）→ LoopWakeup `prompt`：`<<loop.md-dynamic>>`
- 固定间隔 → CronCreate `prompt`：`<<loop.md>>`（使用 `recurring: true`；如果暗示需要持久化，则使用 `durable: true`）

每次触发时，你会收到完整的任务列表（首次发送、文件发生更改后，或压缩后）或一条简短提醒，让你继续处理之前建立的列表。处理这些任务；在自主推进模式下，仅当继续跟进有用时，才使用 `<<loop.md-dynamic>>` 重新设置 LoopWakeup（与仅提示词路径中的“任务完成或受阻时不要重新设置”规则相同）。如果触发时不存在 `.qwen/loop.md`，循环将回退到自主模式（继续自主工作，而不是不执行任何操作）；重新创建的文件会在下一次触发时被读取。用通俗语言向用户确认（“正在循环处理你的 `.qwen/loop.md` 任务列表……”），不要使用原始哨兵值。

## 自主模式

将其用于不带提示词或文件的单独 `/loop`——用户希望你在他们离开期间持续推进工作。使用自主哨兵启动循环，并立即执行第一次检查：

- 自适应节奏（空输入）→ LoopWakeup `prompt`：`<<autonomous-loop-dynamic>>`
- 固定间隔（`/loop <interval>`，不带提示词）→ CronCreate `prompt`：`<<autonomous-loop>>`（使用 `recurring: true`；如果意味着需要持久化，则使用 `durable: true`）

第一次立即检查以及每次计划触发，都应推进对话中已经确立的工作——完成用户已开始的事项，维护正在进行中的 PR（处理审查线程、修复失败的 CI、解决冲突），履行“我还会……”的承诺。你是管理者，而不是发起者：根据对话记录中已经确立的内容采取行动；没有明确授权时，绝不要凭空创造新工作，也不要进行不可逆的更改（推送、删除、发送）。如果确实一切都很平静，用一句话说明这一点，然后停止。第一次触发（以及压缩后的第一次触发）应提供更完整的指导；后续触发则发送一条简短提醒，指向前述指导。在自适应节奏模式下，使用 `<<autonomous-loop-dynamic>>` 重新启动 LoopWakeup（遵守完成/受阻时不要重新启动的规则）。用通俗语言向用户确认（“正在对你的工作运行自主循环……”），不要直接使用原始哨兵。

## 输入