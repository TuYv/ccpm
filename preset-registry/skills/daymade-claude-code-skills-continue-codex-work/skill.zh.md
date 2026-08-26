---
name: continue-codex-work
description: >-
  Recover actionable context from a prior Codex CLI session's local rollout files
  and continue interrupted work without running `codex resume`. Use this whenever
  the user wants to pick up Codex (OpenAI Codex CLI / GPT agent) work — they give a
  Codex session id, ask to continue what Codex was doing, say a Codex run was cut
  off mid-task, or want to inspect `~/.codex/sessions` rollout JSONL before
  resuming. This is the Codex counterpart of continue-claude-work: reach for it for
  Codex/`~/.codex` sessions, and for continue-claude-work when the prior session was
  Claude Code (`~/.claude`).
argument-hint: "[session-id]"
---
# 继续 Codex 工作

## 概述

从之前的 **Codex CLI** 会话中恢复可执行上下文，并在当前对话中继续执行。Codex 会将每个会话记录为 `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` 下的 rollout JSONL 文件（以及可选的 `state_*.sqlite` 索引）。如果所选会话继承了父会话的历史记录，提取器会自动沿着完整的声明继承链回溯，并且只读取每个祖先会话中 `history_base` 所记录的精确分叉快照之前的内容。将这些本地文件作为事实来源，然后继续进行具体编辑和检查，而不只是总结。

**为什么不使用 `codex resume`**：重放完整 rollout 会将每一个推理步骤、工具调用和工具输出重新输入上下文窗口。对于较长的会话，这会把上下文窗口浪费在已经解决的轮次和过时的输出上。此技能会**选择性地重建**可执行上下文——包括继承的分叉快照、上一次压缩后保留的请求、最近的用户/助手轮次、调用过的工具和编辑过的文件，以及会话结束时的状态——从而在保留既有知识的基础上重新开始。

这是 `continue-claude-work` 的 Codex 版本。两者之所以有意分开，是因为磁盘上的格式不同：Claude Code 写入 `~/.claude/projects/<encoded>/<session>.jsonl`，而 Codex 写入 `~/.codex/sessions/.../rollout-*.jsonl`，并且使用不同的记录结构。Codex 会话使用**此**技能；Claude Code 会话使用 `continue-claude-work`。

## 文件结构参考

有关 rollout 目录布局、记录/载荷结构以及压缩格式的信息，请参阅 [references/file_structure.md](references/file_structure.md)。

## 工作流程

### 第 1 步：提取上下文（单次脚本调用）

运行捆绑的提取器。它会通过共享的 `_core` 处理会话发现、rollout 解析、噪声过滤和工作区状态，一次调用即可完成：

```bash
# 当前项目（cwd）最新的 Codex 会话
python3 scripts/extract_codex_resume.py

# 按 id 指定会话（完整 id 或无歧义的前缀）
python3 scripts/extract_codex_resume.py --session <SESSION_ID>

# 按标题中的关键词搜索会话
python3 scripts/extract_codex_resume.py --query "skill migrator"

# 列出当前项目最近的会话
python3 scripts/extract_codex_resume.py --list

# 列出所有项目中的会话（不只是当前 cwd）
python3 scripts/extract_codex_resume.py --all-projects --list

# 不截断保留的文本；默认模式已经保留每个用户轮次
python3 scripts/extract_codex_resume.py --session <SESSION_ID> --full
```

**预期输出**：结构化的 Markdown **简报**。你应当看到：

- 一个 `# Codex Resume Context Briefing` 标题，接着是 `## Session Info`（id、项目 cwd、最后活跃时间、标题、Codex 版本）。
- 一行 `**Session end reason**` ——这是最重要的路由信号（参见第 2 步）。
- `## Inherited Session Lineage` ——当所选会话是分叉会话时，列出从最早保留的祖先到所选子会话的每条父级边。每行显示精确继承的字节前缀以及父会话之后是否继续增长。如果子会话唯一的本地提示是 `继续`，会明确指出这一点；该提示是继续执行的信号，而不是任务本身。
- `## Inherited Actionable Context` ——每个祖先会话最近一次保留的压缩摘要，以及按记录序号排列的时间顺序交接时间线、最新计划、工具调用和编辑过的文件，并与所选子会话的本地轮次分开保留。时间线包含每一个保留的用户轮次，以及下一个用户轮次之前的第一个/最新助手状态，因此不会把旧的最终回答显示在后续请求旁边，让人误以为它回答了后续请求。如果子会话唯一的提示是继续执行的信号，即使不使用 `--full`，继承的摘要也会自动展开；让代理手动发现这一跳过截断的方式，会重现最初的问题。
- `## Compact Summary` ——如果会话经过压缩，则显示压缩后保留的用户/助手线程（会去除系统前导内容和重新注入的 `AGENTS.md`）。
- `## Selected Session Timeline` ——所选 rollout 自身按时间顺序排列的交接内容，与继承的祖先会话分开保留。它同样保留每个用户轮次，以及下一个用户轮次之前的第一个/最新助手状态；较长的条目会在截断位置注明 `--full` 选项。如果某个用户轮次显示为 `[skill invoked: <name> — injected body omitted]`，则表示这是一次技能调用（Codex 会将整个技能包作为消息传递；这一事实很重要，但具体字节内容不重要）。
- `## Latest Plan State` ——如果会话使用了 Codex 的 `update_plan` 工具，则显示最近一次计划调用，并渲染为步骤检查清单。对于多步骤任务，这是信号最强的“任务进行到哪个阶段”的记录，即使在非常长的会话中通用工具调用列表已经被移出或截断，它仍然会保留。
- `## Recent Tool Calls`、`## Files Edited in Session`（来自 patch / FileChange 记录）以及 `## Errors Encountered`。
- `## Current Workspace State` ——git 分支、未提交的更改、最近的提交。

如果你看到的是 `No Codex sessions found for <path>`，则当前目录没有 Codex 历史记录——尝试使用 `--all-projects --list` 查找正确的项目，或直接传入 `--session <id>`。

### 第 2 步：根据会话结束原因分支处理

简报中的**会话结束原因**会告诉你上一次运行是如何停止的。根据该原因采取相应处理：

| 结束原因 | 含义 | 策略 |
|-----------|---------------|----------|
| **正常退出** | 代理完成了一轮交互并留下了最后一条消息。 | 阅读上一条已处理的用户请求；从任何未完成的工作继续。 |
| **进行中** | 工具已运行，但代理没有留下结束消息——任务在中途被截断。 | 这是最常见的恢复场景。阅读最近的工具调用和编辑过的文件，确认哪些内容已经落地，并完成代理当时正在进行的这一轮任务。 |
| **已中断** | 工具调用已发出但从未返回，或者这一轮在中途被终止（强制停止 / ctrl-c / esc）。在此分类中，未解决的调用优先于 `task_complete` 错误——因此，如果简报在“未解决的工具调用”之后紧接着还显示一行 `> The last recorded task_complete also carried an error`，那么该错误很可能就是调用未返回的原因（`usage_limit_exceeded` 和 `context_window_exceeded` 正是最可能导致调用在执行中被搁置的错误；在将其视为普通卡死之前，先阅读该行）。 | 重新检查这些操作是否已生效，然后重试或继续下一步。 |
| **已放弃** | 用户消息没有得到响应。 | 将用户的最后一条消息视为当前请求。 |
| **错误级联** | 工具反复失败。 | 不要盲目重试——先诊断根本原因。 |
| **出错** | 上一轮的 `task_complete` 携带错误（例如 `usage_limit_exceeded`、`context_window_exceeded`、`unauthorized`、`cyber_policy`），且没有生成结束消息。简报会内嵌确切的错误信息，因此无需打开原始运行记录。 | 在执行任何操作之前，先阅读具体的 `codex_error_info`——不同错误代码对应的正确后续步骤不同（稍后重试、重新认证、重新表述请求，或开启新线程）。**尤其对于 `usage_limit_exceeded` 和 `internal_server_error`：这些错误通常是暂时性的，会按计划恢复（使用量限制会重置，服务器负载会下降）。**如果原来的 Codex 进程或终端可能仍处于打开状态，请先检查它是否已经自行恢复并完成工作，再开始手动继续——重复执行这些工作纯属浪费。会话也可能显示**带有附带情况的正常退出**：结束消息确实存在，但 `task_complete` 仍携带错误（在 468 个真实案例中约有 4 个）；请阅读附带情况，该轮很可能仍已完成，但被标记的问题可能值得检查。 |

### 第 3 步：核对并继续

进行更改之前：
1. 如果出现 `Inherited Session Lineage`，请从 `Inherited Actionable Context` 中确定实际目标；绝不要将本地的 `继续` / `continue` 提示视为独立的规格说明。
2. 确认当前目录与会话的 `cwd` 相匹配。
3. 如果 git 分支与简报中显示的分支不同，请记录这一点，并决定是否切换分支。
4. 检查**已编辑文件**下列出的文件——确认上一次运行的更改确实已经落地（运行记录只说明某个补丁曾被*尝试应用*；请确认当前文件状态）。
5. 逐字阅读 `Recovery boundary`：精确的字节级祖先关系不会撤销 Codex 压缩，不会恢复被省略的附件内容，也不能证明旧工具声明属实。请核实当前工作区。

然后：
- 执行与最新用户请求一致的下一个具体步骤。
- 运行确定性验证（测试、类型检查、构建）。
- 如果受阻，说明确切的阻塞原因，并提出一个下一步行动。

### 第 4 步：报告

简洁回复：
- **恢复的上下文**：涉及哪个会话，以及简报中的关键发现。
- **已执行的工作**：修改了哪些文件、运行了哪些命令、测试结果。
- **剩余事项**：仍待完成的任务（如有）。

## 脚本的工作原理

### 会话发现复用共享核心

发现过程通过 `_core.codex.collect_codex`（打包在 `scripts/_core/` 中）执行，使用与 `local-conversation-history` skill 相同的、可容忍架构差异的读取器：它优先使用 `state_*.sqlite` 索引；如果数据库缺失或其架构发生漂移，则回退到扫描原始 rollout JSONL。因此，列表、`--query` 和按项目获取最新会话都共用同一套经过测试的实现。

### Rollout 解析

Codex 的 rollout 架构不同于 Claude。解析器读取以下内容：
- **用户 / 助手回合**来自两个可能的流，因为不同 Codex 版本中回合所在的位置会发生变化（根据对约 2,600 个 rollout 的测量，版本范围为 0.142.2–0.149.0）：`event_msg/user_message` / `agent_message` 镜像流（在 0.146.x 及更早版本和 0.147/0.148 alpha 版本中是常态，之后仅有少量残留）以及 `response_item/message` 记录（用户文本为 `input_text`，助手文本为 `output_text`，在本地解码）。这两个流并不总是镜像对应——某些版本只在事件流中保留每个步骤的评论，而在一回合中途排队的用户输入则只出现在消息记录中——因此会收集两个流，并按角色选择信息**更丰富的流**（信息量相同则选择事件流），既不会重复计数，也不会静默丢弃任一角色中更完整的部分。每个选中的回合都会保留其物理记录序号；选中的简报和继承的简报会按序号交错排列这些选定的角色流，而不是打印两个无法确定时间顺序的角色分组。仅包含图像的用户消息会渲染为 `[image-only user message]`，而不是直接消失。仅当选定的流中任何位置都没有该文本时，`task_complete.last_agent_message` 才会作为尾部保护内容插入其原始记录位置；不会仅仅因为后面存在评论就将其移动到末尾。`response_item/agent_message` 记录属于智能体间通信（子智能体路由消息，可以是明文或加密内容），绝不是主线程文本。
- **编辑的文件**来自 `event_msg/patch_apply_end`（不高于 0.146 版本及 alpha 版本中为常规来源；之后仅有少量残留）以及类型为 `FileChange` 的 `event_msg/item_completed` 项（0.147+ 版本中 patch 事件消失后采用的来源）——`changes` 映射的键就是被修改的文件；两个来源都会汇入同一个集合。
- **工具调用**来自 `response_item/function_call` 和 `custom_tool_call`，并通过 `call_id` 与对应的 `*_output` 配对（未配对的调用表示它从未返回）。最近一次 `update_plan` 调用会得到额外处理：其完整解析后的 `plan`（以及存在时的 `explanation`）会被单独跟踪，采用最后一次调用优先，并不受 120 个字符的工具调用预览限制和最近 20 项窗口限制——根据对约 4,000 次真实调用的测量，该行为保持稳定；每次调用始终是一个可解析为 `{"plan": [...]}` 或 `{"explanation": ..., "plan": [...]}` 的 JSON 字符串，其中每个步骤都是 `{"step", "status"}`。
- **压缩**来自 `compacted` 记录——Codex 会使用由消息组成的 `replacement_history`（而不是单个摘要）替换被压缩的窗口，并重新注入系统前导内容；解析器只保留用户/助手回合。

### Fork 继承链与精确快照

Fork 的 `session_meta.history_base` 声明了父级 `thread_id`、`end_byte_offset`，以及（如果存在）`end_ordinal_exclusive`。提取器会递归地沿着该链回溯，先处理根节点，并且只在半开字节范围 `[0, end_byte_offset)` 内解析每个父级。这一点很重要，因为子级 fork 之后，父级 rollout 可能会继续增长；读取父级当前文件尾部会导入子级从未继承的事件，并可能在不知不觉中改变恢复出的任务。

对于选定的 handoff 视图和继承的 handoff 视图，每个保留的用户轮次都会按记录顺序保留，并包含下一次用户轮次之前的第一个和最新的 assistant 状态。这样既保留了对某次更正作出响应时的状态，也保留了下一次更正之前达到的状态，而无需重放每条工具进度消息。默认输出不会因为某个保留的用户轮次而将其丢弃，因为实际目标可能出现在任意位置；它只会截取每条消息。`--full` 会移除字符截取限制；对于仅包含 assistant 历史记录的情况，还会恢复每个保留的 assistant 状态。

继承链恢复采用遇错即停策略。`forked_from_id` / `history_base.thread_id` 不匹配、父级 rollout 缺失、出现循环、偏移量超出范围，或偏移量落在 JSONL 记录中间，都会以确切原因停止提取。如果某个 rollout 仅指定了 `forked_from_id`，却未提供字节边界，则 briefing 会报告这一限制，并且**不会**根据父级当前文件进行猜测。归档的父级和活动中的会话一样都会被解析。

### Session 结束原因检测

结束原因根据 rollout 尾部进行分类：末尾是 `task_complete` 或 `final_answer` 阶段的 assistant 消息，则为**已完成**；存在未配对的工具调用或末尾是 `turn_aborted`，则为**已中断**；工具已运行但没有结束消息，或尾部停留在 `commentary` 阶段的消息（在轮次中途被截断），则为**进行中**；末尾是用户消息，则为**已放弃**；三次或更多工具失败，则为**错误级联**。`task_complete` 还可能携带一个 `error`（`{"message", "codex_error_info"}`）——在对 6,650 个 rollout 中 468 个真实出现记录进行语料扫描时测得，这些记录涵盖 6 个不同的 `codex_error_info` 值。每个 `task_complete` 都会记录这一点（采用 last-wins，因此后续成功完成的轮次可以正确清除之前残留的错误），并将其与结束消息组合处理，而不是视为相互排斥的状态：存在错误**且**没有结束消息（扫描中为 464/468）时，状态为**出错**，并内联确切的 `codex_error_info` 和消息；存在错误**但**仍有实际结束消息（4/468）时，状态仍为**已完成**，同时添加说明该错误的备注，而不是将其隐藏。

### 噪声过滤

Codex 会在压缩后以及轮次之间重新注入大段系统块——权限块、agent 角色消息和项目的 `AGENTS.md`。解析器使用共享的 `is_noise_text`（可识别 `<permissions instructions`、`<system-reminder`、`# AGENTS.md instructions for` 以及类似前缀）来丢弃这些内容，从而让 briefing 展示真实对话，而不是 harness 脚手架。

## 防护措施

- 不要运行 `codex resume` 或 `codex --continue` —— 此 skill 会在当前对话中提供上下文恢复能力。
- 不要将压缩摘要或工具输出视为完整事实 —— 它们是有损的。始终根据当前工作区验证相关声明。
- 不要用父级当前的完整 rollout 替换精确继承的快照。分叉后的父级事件不属于子级。
- 不要覆盖不相关的工作树更改。
- 不要将整个 rollout 文件加载到上下文中 —— 始终使用脚本（rollout 通常有数 MB）。

## 局限

- 无法恢复其 rollout 文件已从 `~/.codex/sessions/` 中删除的会话。
- 无法访问其他机器上的会话（文件仅存储在本地）。
- 较长的 briefing 部分默认会被截断；每个截断点都会打印 `rerun with --full` 提示，而 `--full` 会打印未截断的**保留**文本。所选时间线和继承时间线中的用户回合永远不会受到数量上限限制；用户回合之间的助手进度会缩减为最早/最新状态，同时继承的文件/工具上限仍然适用。工具调用预览会按设计限制为 120 个字符 —— 如需查看完整命令或补丁，请在 rollout 中搜索该调用的 `call_id`。
- 压缩是有损的 —— 即使血缘关系准确并使用了 `--full`，早期对话的详细信息也可能已经丢失。仅包含图像的回合会保留为标记；原始图像/音频字节不会在 briefing 中重建。
- Codex 没有 Claude Code 的 `MEMORY.md` 等价的按会话自动记忆；项目的 `AGENTS.md` 会被有意过滤掉，作为重新注入的噪声，因此如有需要请单独读取它。

## 示例触发短语

- “继续 Codex 会话 `019f66...`”
- “codex 在任务进行到一半时中断了，继续之前的工作”
- “不要运行 `codex resume`，只需读取 rollout 并继续工作”
- “Codex 在我上次于此仓库中的会话里做了什么？”
- “找到我构建 skill migrator 的 Codex 运行记录并继续”

## 相关 Skills

- **`continue-claude-work`** —— Claude Code 会话的相同能力（`~/.claude`）。如果之前的会话是 Claude 而不是 Codex，请改用该 skill。
- **`local-conversation-history`** —— 列出所有配置主目录中的 Claude 和 Codex 对话。当你不确定要使用哪个会话（或哪个提供商）时，先使用它，然后将 Codex 会话 id 提供给此 skill。