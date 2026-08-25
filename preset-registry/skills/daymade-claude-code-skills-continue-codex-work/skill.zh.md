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

从之前的 **Codex CLI** 会话中恢复可执行的上下文，并在当前对话中继续执行。Codex 会将每个会话记录为 `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` 下的 rollout JSONL（可选的 `state_*.sqlite` 索引）。使用这些本地文件作为事实来源，然后继续进行具体编辑和检查——而不只是总结。

**之所以存在此功能，而不是使用 `codex resume`**：重放完整 rollout 会将每个推理步骤、工具调用和工具输出重新输入上下文窗口。对于较长的会话，这会浪费上下文窗口来处理已经解决的轮次和过时的输出。此 skill **有选择地重建**可执行上下文——上一次压缩后保留的请求、最近的用户/助手轮次、工具调用和编辑过的文件，以及会话结束的方式——从而在保留已有知识的基础上重新开始。

这是 `continue-claude-work` 的 Codex 兄弟 skill。两者特意分开，因为磁盘上的格式不同：Claude Code 写入 `~/.claude/projects/<encoded>/<session>.jsonl`，Codex 写入具有不同记录 schema 的 `~/.codex/sessions/.../rollout-*.jsonl`。Codex 会话使用**此** skill；Claude Code 会话使用 `continue-claude-work`。

## 文件结构参考

有关 rollout 目录布局、记录/负载 schema 以及压缩格式，请参阅 [references/file_structure.md](references/file_structure.md)。

## 工作流

### 第 1 步：提取上下文（单次脚本调用）

运行随附的提取器。它会通过共享的 `_core` 处理会话发现、rollout 解析、噪声过滤和工作区状态，并在一次调用中完成：

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

# Complete text of long sections (default output truncates and prints this hint itself)
python3 scripts/extract_codex_resume.py --session <SESSION_ID> --full
```

**预期输出**：一份结构化的 Markdown **简报**。你应看到：

- `# Codex Resume Context Briefing` 标题，随后是 `## Session Info`（id、项目 cwd、最后活动时间、标题、Codex 版本）。
- 一行 `**Session end reason**` ——这是最重要的路由信号（参见第 2 步）。
- `## Compact Summary` ——如果会话曾被压缩，则显示保留下来的用户/助手线程（系统前置内容和重新注入的 `AGENTS.md` 会被移除）。
- `## Last User Requests` 和 `## Last Assistant Responses` ——最近的轮次。较长的条目会被截断，并以 `rerun with --full` 提示结尾——该提示表示还有更多内容，并会明确说明如何获取完整内容。显示为 `[skill invoked: <name> — injected body omitted]` 的用户轮次表示一次 skill 调用（Codex 会将整个 bundle 作为消息发送；重要的是这一事实，而不是具体内容）。
- `## Latest Plan State` ——如果会话使用了 Codex 的 `update_plan` 工具，则显示最近一次计划调用，并渲染为步骤清单。对于多步骤任务，这是信号最强的“任务目前处于哪个阶段”记录；即使在非常长的会话中、通用工具调用列表已经被移出或截断，它仍然会保留。
- `## Recent Tool Calls`、`## Files Edited in Session`（来自 patch / FileChange 记录）、`## Errors Encountered`。
- `## Current Workspace State` ——git 分支、未提交的更改、最近的提交。

如果你看到的是 `No Codex sessions found for <path>`，则当前目录没有 Codex 历史记录——尝试使用 `--all-projects --list` 查找正确的项目，或直接传入 `--session <id>`。

### 步骤 2：根据会话结束原因分支处理

简报中的 **Session end reason** 会告诉你上一次运行是如何停止的。根据它采取相应处理方式：

| 结束原因 | 含义 | 策略 |
|-----------|---------------|----------|
| **Clean exit** | 代理完成了最后一个动作（一个已完成的轮次）。 | 阅读最后一个已得到处理的用户请求；从任何待处理工作继续。 |
| **In progress** | 工具已运行，但代理没有留下结束消息——任务在中途被截断。 | 这是最常见的恢复情况。阅读最近的工具调用和已编辑的文件，确认哪些内容已经生效，然后完成代理当时正在进行的轮次。 |
| **Interrupted** | 工具调用已发出但从未返回，或者轮次在中途被中止（强制停止 / ctrl-c / esc）。在此分类中，未解决的调用优先于 `task_complete` 错误——因此，如果简报在“未解决的工具调用”之后紧接着还显示 `> The last recorded task_complete also carried an error`，则该错误很可能就是调用未返回的原因（`usage_limit_exceeded` 和 `context_window_exceeded` 正是最可能导致调用在执行过程中搁置的错误）；在认定只是普通卡住之前，先阅读该行。 | 重新检查这些操作是否已经生效，然后重试或继续进行下一步。 |
| **Abandoned** | 用户消息没有得到响应。 | 将最后一条用户消息视为当前请求。 |
| **Error cascade** | 工具反复失败。 | 不要盲目重试——先诊断根本原因。 |
| **Errored** | 上一个轮次的 `task_complete` 携带错误（例如 `usage_limit_exceeded`、`context_window_exceeded`、`unauthorized`、`cyber_policy`），且没有生成结束消息。简报会直接内嵌确切的错误信息，因此无需打开原始运行记录。 | 在进行任何操作之前，先阅读具体的 `codex_error_info`——不同错误代码对应的正确后续步骤不同（稍后重试、重新进行身份验证、重新措辞，或开始新线程）。**尤其是对于 `usage_limit_exceeded` 和 `internal_server_error`：这些错误通常是暂时性的，会按计划恢复（使用额度会重置，服务器负载会下降）。** 如果原先的 Codex 进程或终端可能仍处于打开状态，请先检查它是否已经自行恢复并完成工作，再开始手动继续——重复执行这些工作纯属浪费。会话也可能显示 **Clean exit with a caveat**：结束消息确实存在，但 `task_complete` 仍携带错误（在 468 个真实案例中约有 4 个属于这种情况）——阅读其中的附注；该轮次很可能仍已完成，但标记出的问题可能值得检查。 |

### 步骤 3：核对并继续

在进行更改之前：
1. 确认当前目录与会话的 `cwd` 一致。
2. 如果 git 分支与简报中显示的分支不同，记录这一点并决定是否切换。
3. 检查 **Files Edited** 下列出的文件——确认上一次运行的更改确实已经生效（运行记录只说明尝试过应用补丁；请确认当前文件状态）。
4. 不要未经检查就假设旧有结论仍然成立——压缩和工具输出可能会丢失信息。

然后：
- 实现与最新用户请求一致的下一项具体步骤。
- 运行确定性验证（测试、类型检查、构建）。
- 如果受阻，说明确切的阻塞原因，并提出一个下一步行动。

### 步骤 4：报告

简洁地回复：
- **已恢复的上下文**：涉及哪个会话，以及简报中的关键发现。
- **已执行的工作**：修改了哪些文件、运行了哪些命令、测试结果。
- **剩余事项**：待处理的任务（如有）。

## 脚本的工作原理

### 会话发现复用共享核心

发现过程通过 `_core.codex.collect_codex`（打包在 `scripts/_core/` 中）进行，该过程使用与 `local-conversation-history` skill 相同的、可容忍 schema 变化的读取器：它优先使用 `state_*.sqlite` 索引；当数据库缺失或其 schema 发生漂移时，则回退到扫描原始 rollout JSONL。因此，列表、`--query` 和按项目获取最新会话都共享同一个经过测试的实现。

### Rollout 解析

Codex 的 rollout schema 与 Claude 的不同。解析器从两个可能的流中读取：
- **用户 / assistant 轮次**来自两个可能的流，因为不同 Codex 版本中轮次所在的位置会发生变化（基于约 2,600 个 rollout 的测量结果，版本范围为 0.142.2–0.149.0）：`event_msg/user_message` / `agent_message` 镜像流（在 0.146.x 之前的版本以及 0.147/0.148 alpha 版本中属于常态，之后仅有少量残留）和 `response_item/message` 记录（用户文本是 `input_text`，assistant 文本是 `output_text`，在本地解码）。这两个流并不总是镜像关系——某些版本只在事件流中保留每一步的 commentary，而在一轮对话中途排队的用户输入则只出现在消息记录中——因此会收集两个流，并按角色选择**内容更丰富的流**（请求和响应显示在不同部分；内容相同时选择事件流），既不会重复计数，也不会静默丢弃任一角色中内容更多的部分。仅包含图像的用户消息会显示为 `[image-only user message]`，而不会消失。`task_complete.last_agent_message` 是一个尾部保护机制，仅当所选流缺少最后的 assistant 文本时才会追加。`response_item/agent_message` 记录属于 agent 之间的通信（子 agent 路由消息，可能是明文或加密内容），绝不是主线程文本。
- **编辑过的文件**来自 `event_msg/patch_apply_end`（通常适用于 ≤0.146 及 alpha 版本；更高版本中仅有少量残留），以及 `event_msg/item_completed` 中类型为 `FileChange` 的条目（0.147+，其中 patch 事件已消失）——`changes` 映射的键就是被修改的文件；两个来源都会汇入同一个集合。
- **工具调用**来自 `response_item/function_call` 和 `custom_tool_call`，并通过 `call_id` 与对应的 `*_output` 配对（未配对的调用表示它从未返回）。最近一次 `update_plan` 调用会得到额外处理：其完整解析后的 `plan`（以及存在时的 `explanation`）会被单独跟踪，采用最后一次调用优先的规则，不受 120 字符工具调用预览和最近 20 项窗口的限制——基于约 4,000 次真实调用的测量结果，该行为稳定；每次调用始终是一个解析为 `{"plan": [...]}` 或 `{"explanation": ..., "plan": [...]}` 的 JSON 字符串，其中每个步骤都是 `{"step", "status"}`。
- **压缩**来自 `compacted` 记录——Codex 会用由消息组成的 `replacement_history` 替换被压缩的窗口（而不是单个摘要），并重新注入系统前导内容；解析器只保留用户 / assistant 轮次。

### 会话结束原因检测

根据 rollout 的末尾进行分类：末尾的 `task_complete` 或 `final_answer` 阶段的 assistant 消息表示**已完成**；未配对的工具调用或末尾为 `turn_aborted` 表示**已中断**；已运行但没有结束消息的工具，或末尾停留在 `commentary` 阶段的消息（在轮次中途被截断），表示**进行中**；末尾为 user 消息表示**已放弃**；三个或更多工具失败表示**错误级联**。`task_complete` 还可以携带错误（`{"message", "codex_error_info"}`）——在对 6,650 次 rollout 中 468 个真实出现记录进行的语料扫描中测得，涵盖 6 个不同的 `codex_error_info` 值。每个 `task_complete` 都会记录此信息（后写入者优先，因此后续正常完成的轮次可以正确清除较早的过期错误），并且该信息会与结束消息组合，而不是与结束消息互斥：存在错误**且**没有结束消息（扫描中为 464/468）时，状态为**出错**，并内联确切的 `codex_error_info` 和消息；存在错误但仍有真正的结束消息（4/468）时，状态仍为**已完成**，同时附带说明该错误，而不是将其隐藏。

### 噪声过滤

Codex 会在压缩后以及轮次之间重新注入大型系统块——权限块、agent 角色消息和项目的 `AGENTS.md`。解析器使用共享的 `is_noise_text` 丢弃这些内容（该函数可识别 `<permissions instructions`、`<system-reminder`、`# AGENTS.md instructions for` 以及类似前缀），从而让简报显示真实的对话，而不是运行框架的脚手架内容。

## 防护措施

- 不要运行 `codex resume` 或 `codex --continue` —— 此 skill 在当前对话中提供上下文恢复功能。
- 不要将压缩摘要或工具输出视为完整事实 —— 它们是有损的。始终根据当前工作区验证相关断言。
- 不要覆盖无关的工作树更改。
- 不要将整个 rollout 文件加载到上下文中 —— 始终使用脚本（rollout 通常有数 MB）。

## 限制

- 无法恢复其 rollout 文件已从 `~/.codex/sessions/` 删除的会话。
- 无法访问其他机器上的会话（文件仅存储在本地）。
- 较长的简报部分（压缩摘要、用户请求、assistant 响应）默认会被截断；每个截断点都会打印 `rerun with --full` 提示，而 `--full` 会打印完整文本（每个部分的数量上限仍然适用）。工具调用预览会有意限制为 120 个字符 —— 如需查看完整命令或补丁，请在 rollout 中 grep 该调用的 `call_id`。
- 压缩是有损的 —— 早期对话的细节可能已经丢失。
- Codex 没有等同于 Claude Code 的 `MEMORY.md` 的每会话自动记忆功能；项目的 `AGENTS.md` 会被有意过滤，因为它会作为重新注入的噪声出现，因此如果需要项目的长期指令，请单独读取它。

## 示例触发短语

- “继续 Codex 会话 `019f66...`”
- “codex 在任务中途被截断了，接着之前的进度继续”
- “不要运行 `codex resume`，只需读取 rollout 并继续”
- “Codex 上一次在这个仓库中做什么？”
- “找到我构建 skill migrator 的 Codex 运行记录并继续”

## 相关技能

- **`continue-claude-work`** — Claude Code 会话中的相同功能（`~/.claude`）。如果之前的会话使用的是 Claude 而不是 Codex，请改用该技能。
- **`local-conversation-history`** — 列出所有配置主目录中的 Claude 和 Codex 会话。当你不确定想要使用哪个会话（或哪个提供商）时，先使用它，然后将 Codex 会话 ID 带到这里。