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

从之前的 **Codex CLI** 会话中恢复可执行的上下文，并在当前对话中继续执行。Codex 会将每个会话记录为 `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` 下的 rollout JSONL（可选的 `state_*.sqlite` 索引）。如果选定的会话从父会话继承了历史记录，提取器会自动沿着完整的声明谱系继续追溯，并且只读取每个祖先会话中由 `history_base` 记录的确切分叉快照之前的内容。将这些本地文件作为事实来源，然后继续进行具体的编辑和检查——而不只是总结。

**之所以存在此工具而不是使用 `codex resume`**：重放完整 rollout 会将每个推理步骤、工具调用和工具输出重新输入上下文窗口。对于较长的会话，这会将上下文窗口浪费在已经解决的轮次和过时的输出上。此技能**选择性地重建**可执行上下文——继承的分叉快照、磁盘上仍保留的压缩前原始记录、最近一次压缩后保留的上下文、最近的用户/助手轮次、工具调用和编辑过的文件，以及会话结束的方式——从而在保留既有知识的同时重新开始。

这是 `continue-claude-work` 的 Codex 同类技能。二者有意分开，因为磁盘上的格式不同：Claude Code 将内容写入 `~/.claude/projects/<encoded>/<session>.jsonl`，而 Codex 将内容写入 `~/.codex/sessions/.../rollout-*.jsonl`，且记录模式不同。Codex 会话使用**此**技能；Claude Code 会话使用 `continue-claude-work`。

## 文件结构参考

有关 rollout 目录布局、记录/载荷模式以及压缩格式，请参阅 [references/file_structure.md](references/file_structure.md)。

## 工作流

### 第 1 步：提取上下文（单次脚本调用）

运行随附的提取器。它会通过共享的 `_core` 处理会话发现、rollout 解析、噪声过滤和工作区状态，一次调用即可完成：

```bash
# Latest Codex session for the current project (cwd)
python3 scripts/extract_codex_resume.py

# A specific session by id (full or unambiguous prefix)
python3 scripts/extract_codex_resume.py --session <SESSION_ID>

# Search sessions by a keyword in the title
python3 scripts/extract_codex_resume.py --query "skill migrator"

# List recent sessions for the current project
python3 scripts/extract_codex_resume.py --list

# List across all projects (not just the current cwd)
python3 scripts/extract_codex_resume.py --all-projects --list

# Untruncated retained text; default mode already keeps every user turn
python3 scripts/extract_codex_resume.py --session <SESSION_ID> --full
```

**预期输出**：结构化的 Markdown **简报**。你应该会看到：

- 一个 `# Codex Resume Context Briefing` 标题，随后是 `## Session Info`（id、项目 cwd、最后活跃时间、标题、Codex 版本）。
- 一行 `**Session end reason**`——这是最重要的路由信号（参见第 2 步）。
- `## Inherited Session Lineage`——当选定的会话是分叉会话时，列出从保留时间最早的祖先到选定子会话之间的每条父级边。每行显示确切的继承字节前缀以及父会话之后是否又有新增内容。如果子会话唯一的本地提示是 `继续`，则会明确标注：该提示是继续执行的信号，而不是任务本身。
- `## Inherited Actionable Context`——每个祖先会话最近一次保留的压缩上下文，以及按记录序号排列的时间顺序交接时间线、最新计划、工具调用和编辑过的文件；这些内容与选定子会话的本地轮次分开保留。时间线包含每个保留的用户轮次，以及下一次用户轮次之前的第一条/最新一条助手状态，从而不会将旧的最终回答显示在后续请求旁边，让人误以为它回答了后续请求。如果子会话唯一的提示是继续执行的信号，则即使不使用 `--full`，继承的压缩上下文也会自动展开；让代理手动发现这一逃生路径会重现原先的问题。
- `## Compacted Context`——如果会话经过压缩，则包含最近一次 `message` / `replacement_history` 中保留的完整用户/助手线程；系统前导内容和重新注入的 `AGENTS.md` 会被移除。默认输出会在此部分进行截断，并在截断处明确提示使用 `--full`；解析本身不会预先截断它。
- `## Selected Session Timeline`——选定 rollout 自身的按时间顺序排列的交接记录，与继承的祖先会话分开保留。它同样保留每个用户轮次以及下一次用户轮次之前的第一条/最新一条助手状态；较长的条目会在截断位置提示使用 `--full`。形如 `[skill invoked: <name> — injected body omitted]` 的用户轮次表示一次技能调用（Codex 会将整个技能包作为消息传递；重要的是这一事实，而不是其中的字节内容）。
- `## Latest Plan State`——如果会话使用过 Codex 的 `update_plan` 工具，则显示最近一次计划调用，并将其渲染为步骤检查清单。这是多步骤任务中信号最高的“任务目前处于哪个阶段”记录，即使在非常长的会话中，通用工具调用列表已被移出或截断，它仍然会保留。
- `## Recent Tool Calls`、`## Files Edited in Session`（来自 patch / FileChange 记录）、`## Errors Encountered`。
- `## Current Workspace State`——git 分支、未提交的更改、最近的提交。

如果你看到的是 `No Codex sessions found for <path>`，则当前目录没有 Codex 历史记录——尝试使用 `--all-projects --list` 查找正确的项目，或直接传入 `--session <id>`。

### 第 2 步：根据会话结束原因分支处理

简报中的**会话结束原因**会告诉你上一次运行是如何停止的。根据它进行处理：

| 结束原因 | 含义 | 策略 |
|-----------|---------------|----------|
| **正常退出** | 代理以最后一条消息结束（一个已完成的轮次）。 | 阅读最后一条已处理的用户请求；继续完成任何待处理的工作。 |
| **进行中** | 工具已运行，但代理没有留下结束消息——任务在中途被截断。 | 这是最常见的恢复场景。阅读最近的工具调用和已编辑的文件，确认哪些内容已经落地，然后完成代理当时正在执行的轮次。 |
| **被中断** | 工具调用已被派发但从未返回，或轮次在中途被终止（强制停止 / ctrl-c / esc）。在此分类中，未解决的调用优先于 `task_complete` 错误——因此，如果简报在“未解决的工具调用”之后紧接着还显示了 `> The last recorded task_complete also carried an error`，那么该错误很可能就是调用未返回的原因（`usage_limit_exceeded` 和 `context_window_exceeded` 正是最可能导致调用在执行中被搁置的错误）；在认定只是普通卡住之前，请先阅读该行。 | 重新检查这些操作是否已生效，然后重试或继续后续工作。 |
| **已放弃** | 用户消息没有得到响应。 | 将最后一条用户消息视为当前请求。 |
| **错误级联** | 工具反复失败。 | 不要盲目重试——先诊断根本原因。 |
| **发生错误** | 上一个轮次的 `task_complete` 携带了错误（例如 `usage_limit_exceeded`、`context_window_exceeded`、`unauthorized`、`cyber_policy`），且没有生成结束消息。简报会直接内嵌确切的错误，因此无需打开原始运行记录。 | 在进行任何操作之前，先阅读具体的 `codex_error_info`——不同错误代码对应的正确后续步骤不同（稍后重试、重新认证、改写请求，或启动新线程）。**特别是对于 `usage_limit_exceeded` 和 `internal_server_error`：这些错误通常是暂时性的，会按一定周期恢复（使用量限制会重置，服务器负载也会降低）。**如果原始的 Codex 进程或终端可能仍处于打开状态，请先检查它是否已经自行恢复并完成工作，再开始手动继续——重复这些工作纯属浪费。某个会话也可能显示为**正常退出但带有附带说明**：结束消息确实存在，但 `task_complete` 仍携带了错误（在 468 个真实案例中约有 4 个属于这种情况）——请阅读附带说明，该轮次很可能仍已完成，但其中标记的问题可能值得检查。 |

### 第 3 步：核对并继续

进行更改之前：
1. 如果出现 `Inherited Session Lineage`，请从 `Inherited Actionable Context` 中确定实际目标；绝不要将本地的 `继续` / `continue` 提示视为独立的规范。
2. 确认当前目录与会话的 `cwd` 一致。
3. 如果 git 分支与简报显示的分支不同，请记录这一点，并决定是否切换分支。
4. 检查**已编辑文件**下列出的文件——确认上一次运行的更改确实已经落地（运行记录只表明补丁曾被*尝试应用*；请确认当前文件状态）。
5. 逐字阅读 `Recovery boundary`：提取器能够识别压缩状态，并同时读取磁盘上仍然存在的压缩前原始记录和保留下来的 `replacement_history`。它无法重建两种来源中都不存在的内容，无法恢复被省略的附件字节，也无法证明旧的工具声明。请核实当前工作区。

然后：
- 实现与最新用户请求一致的下一个具体步骤。
- 运行确定性验证（测试、类型检查、构建）。
- 如果受阻，说明确切的阻塞原因，并提出一个下一步行动。

### 步骤 4：报告

简洁地回复：
- **恢复的上下文**：涉及哪个会话，以及简报中的关键发现。
- **已执行的工作**：修改了哪些文件、运行了哪些命令、测试结果。
- **剩余事项**：仍待完成的任务（如有）。

## 脚本的工作原理

### 会话发现复用共享核心

发现过程通过 `_core.codex.collect_codex`（捆绑在 `scripts/_core/` 中）进行，该过程使用与 `local-conversation-history` skill 相同的、可容忍架构变化的读取器：它优先使用 `state_*.sqlite` 索引；如果数据库缺失或其架构发生变化，则回退到扫描原始 rollout JSONL。因此，列表、`--query` 和按项目获取最新会话都共享同一个经过测试的实现。

### Rollout 解析

Codex 的 rollout 架构不同于 Claude。解析器读取以下内容：
- **用户 / 助手轮次**来自两个可能的流，因为不同 Codex 版本中轮次所在的位置会发生变化（根据约 2,600 个 rollout、版本 0.142.2–0.149.0 的测量结果）：`event_msg/user_message` / `agent_message` 镜像流（在 0.146.x 及更早版本和 0.147/0.148 alpha 版本中是常态，之后仅有少量残留）以及 `response_item/message` 记录（用户文本是 `input_text`，助手文本是 `output_text`，在本地解码）。这两个流并不总是镜像关系——某些版本只在事件流中保留每个步骤的评论，而在一轮进行期间排队的用户输入可能只出现在消息记录中——因此会收集两个流，并按角色选择**信息更丰富的流**（如果相同则优先事件流），既不重复计算，也不会静默丢弃任一角色中更完整的部分。每个选中的轮次都会保留其物理记录序号；选中的简报和继承的简报都会按序号交错排列所选的角色流，而不是分别输出两个时间含义不明确的角色分组。纯图片用户消息会渲染为 `[image-only user message]`，而不会直接消失。仅当所选流中的任何位置都没有该文本时，`task_complete.last_agent_message` 才会作为尾部保护机制插入其原始记录位置；不会仅仅因为后续存在评论，就把它移到末尾。`response_item/agent_message` 记录是智能体之间的通信（子智能体路由消息，可以是纯文本或加密文本），绝不是主线程文本。
- **编辑的文件**来自 `event_msg/patch_apply_end`（不超过 0.146 及 alpha 版本中的常规来源，之后版本中仅有少量残留）以及 `event_msg/item_completed` 中类型为 `FileChange` 的项目（0.147+，补丁事件已消失的版本）——`changes` 映射的键就是被修改的文件；两个来源都会汇入同一个集合。
- **工具调用**来自 `response_item/function_call` 和 `custom_tool_call`，并通过 `call_id` 与对应的 `*_output` 配对（未配对的调用表示它从未返回）。最近一次 `update_plan` 调用会获得额外处理：其完整解析后的 `plan`（以及存在时的 `explanation`）会被单独跟踪，采用最后一次调用优先，并且不受 120 字符工具调用预览和最近 20 条窗口的限制——根据约 4,000 个真实调用的测量结果，这一行为稳定，调用始终是可解析为 `{"plan": [...]}` 或 `{"explanation": ..., "plan": [...]}` 的 JSON 字符串，其中每个步骤均为 `{"step", "status"}`。
- **压缩**来自 `compacted` 记录——Codex 会用由消息组成的 `replacement_history` 替换实时模型窗口（而不是单个摘要），并重新注入系统前言。解析器会读取每一条压缩记录，保留其中完整的用户/助手文本，过滤 harness 噪声，同时继续读取 rollout 中更早出现的、压缩前的原始记录。简报只会为所选会话及每个祖先会话渲染最新的压缩上下文，因为这是取代先前压缩窗口的延续状态。默认的简报裁剪只在渲染时发生，因此 `--full` 可以展示最新状态中保留的全部文本。

### Fork lineage and exact snapshots

分叉的 `session_meta.history_base` 声明父级 `thread_id`、`end_byte_offset` 以及（如果存在）`end_ordinal_exclusive`。提取器会递归地沿着该链追溯，先处理根节点，并且仅在半开字节范围 `[0, end_byte_offset)` 内解析每个父级。这一点很重要，因为子级分叉后，父级的 rollout 可能仍会继续增长；读取父级当前的尾部会导入子级从未继承的事件，并可能在不知不觉中改变恢复出的任务。

对于选定的交接视图和继承的交接视图，保留的每个用户回合都会按照记录顺序保留，并包含下一次用户回合之前的第一个和最新的 assistant 状态。这样既保留了对某次更正作出响应时的状态，也保留了下一次更正前达到的状态，而无需重放每条工具进度消息。默认输出不会因为某个保留的用户回合而将其丢弃，因为实际目标可能出现在任何位置；它只会截断每条消息。`--full` 会移除字符截断，并且对于仅包含 assistant 的历史记录，会恢复每个保留的 assistant 状态。

谱系恢复采用快速失败策略。`forked_from_id` / `history_base.thread_id` 不匹配、缺失父级 rollout、出现循环、偏移量越界，或偏移量落在某条 JSONL 记录的中间，都会以确切原因停止提取。如果某个 rollout 只声明了 `forked_from_id`，却未提供字节边界，则简报会报告这一限制，且**不会**根据父级当前文件进行猜测。已归档的父级和实时会话一样都会被解析。

### Session end reason detection

根据 rollout 的尾部进行分类：末尾为 `task_complete` 或 `final_answer` 阶段的 assistant 消息表示**已完成**；未配对的工具调用或末尾为 `turn_aborted` 表示**已中断**；运行过但没有结束消息的工具，或尾部停留在 `commentary` 阶段消息（在回合中途被截断），表示**进行中**；末尾为用户消息表示**已放弃**；三次或更多工具失败表示**错误级联**。`task_complete` 也可能携带 `error`（`{"message", "codex_error_info"}`）——在对 6,650 个 rollout 中 468 个真实出现案例进行的语料扫描中，这些案例涵盖了 6 个不同的 `codex_error_info` 值。该信息会在每个 `task_complete` 上被捕获（后出现的值优先，因此后续正常回合可以正确清除较早的过期错误），并与结束消息组合处理，而不是将两者视为互斥：存在错误**且**没有结束消息（扫描中为 464/468）时，状态为**出错**，并内联确切的 `codex_error_info` 和消息；存在错误**但**仍有真实结束消息（4/468）时，状态仍为**已完成**，同时添加说明错误的备注，而不是将其隐藏。

### Noise filtering

Codex 会在压缩后以及回合之间重新注入大段系统块——权限块、agent 角色消息，以及项目的 `AGENTS.md`。解析器使用共享的 `is_noise_text`（能够识别 `<permissions instructions`、`<system-reminder`、`# AGENTS.md instructions for` 及类似前缀）来丢弃这些内容，因此简报展示的是真实对话，而不是执行框架的脚手架内容。

## 防护措施

- 不要运行 `codex resume` 或 `codex --continue` — 此 skill 在当前对话中提供上下文恢复功能。
- 不要将压缩后的上下文或工具输出视为完整事实 — 压缩会保留延续状态，但不保证逐字一致。始终根据当前工作区验证相关声明。
- 不要用父会话当前的完整执行过程替换精确继承的快照。分叉后父会话中的事件不属于子会话。
- 不要覆盖工作树中无关的更改。
- 不要将整个 rollout 文件加载到上下文中 — 始终使用脚本（rollout 文件通常有数 MB）。

## 限制

- 无法恢复其 rollout 文件已从 `~/.codex/sessions/` 中删除的会话。
- 无法访问其他机器上的会话（文件仅存储在本地）。
- 较长的 briefing 部分默认会被截断；每个截断点都会打印 `rerun with --full` 提示，而 `--full` 会打印未截断的**保留**文本。所选时间线和继承时间线中的用户消息都不会受数量上限限制；助手在用户消息之间的进展内容会缩减为第一个/最新状态，但继承的文件/工具上限仍然适用。工具调用预览会按设计限制为 120 个字符 — 如需获取完整命令或补丁，请在 rollout 中通过调用的 `call_id` 进行 grep。
- 支持压缩，但不支持逆转：rollout 中仍然存在的压缩前原始记录仍可纳入按时间顺序排列的时间线；每条 `compacted` 记录都会被纳入，而 briefing 会针对每个选定的会话或祖先会话，呈现最新保留的 `message` / `replacement_history`。如果某项细节在磁盘上的两个来源中都不存在，则无法重建。`--full` 会移除提取器端对字符的裁剪，但仅限于最新保留的上下文；仅包含图像的消息仍然只是标记，无法重新生成原始图像/音频字节。
- Codex 没有类似 Claude Code `MEMORY.md` 的按会话自动记忆功能；项目的 `AGENTS.md` 会被有意过滤掉，以避免重新注入噪声，因此如有需要请单独读取它。

## 示例触发短语

- “继续 Codex 会话 `019f66...`”
- “Codex 在任务进行到一半时中断了，接着做下去”
- “不要运行 `codex resume`，只需读取 rollout 并继续”
- “Codex 上次在这个仓库的会话中在做什么？”
- “找到我构建 skill migrator 的 Codex 运行记录并继续”

## 相关 Skills

- **`continue-claude-work`** — 针对 Claude Code 会话的相同功能（`~/.claude`）。如果之前的会话是 Claude 而不是 Codex，请改用该 skill。
- **`local-conversation-history`** — 列出所有配置主目录中的 Claude 和 Codex 对话。当你不确定要使用哪个会话（或哪个提供方）时，请先使用它，然后将 Codex 会话 id 传递给此 skill。