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

从先前的 **Codex CLI** 会话中恢复可执行的上下文，并在当前对话中继续执行。Codex 会将每个会话记录为 `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` 下的 rollout JSONL（以及可选的 `state_*.sqlite` 索引）。以这些本地文件作为事实来源，然后继续进行具体的编辑和检查——而不只是总结。

**为何使用此方式而不是 `codex resume`**：重放完整的 rollout 会将每个推理步骤、工具调用和工具输出重新送入上下文窗口。对于长会话，这会把窗口浪费在已经解决的轮次和过时的输出上。此技能会**选择性地重建**可执行的上下文——上一次压缩后保留下来的请求、最近的用户/助手轮次、工具调用和编辑过的文件，以及会话的结束方式——从而在保留先前知识的基础上重新开始。

这是 `continue-claude-work` 的 Codex 对应版本。两者特意分开，因为磁盘上的格式不同：Claude Code 写入 `~/.claude/projects/<encoded>/<session>.jsonl`，Codex 则使用不同的记录模式写入 `~/.codex/sessions/.../rollout-*.jsonl`。Codex 会话请使用**此**技能；Claude Code 会话请使用 `continue-claude-work`。

## 文件结构参考

有关 rollout 目录布局、记录/payload 模式和压缩格式，请参阅 [references/file_structure.md](references/file_structure.md)。

## 工作流程

### 第 1 步：提取上下文（单次脚本调用）

运行随附的提取器。它会在一次调用中处理会话发现（通过共享的 `_core`）、rollout 解析、噪声过滤和工作区状态：

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

**预期输出**：一份结构化的 Markdown **简报**。你应当看到：

- 一个 `# Codex Resume Context Briefing` 标题，随后是 `## Session Info`（id、项目 cwd、最后活跃时间、标题、Codex 版本）。
- 一行 `**Session end reason**`——这是最重要的单一路由信号（参见第 2 步）。
- `## Compact Summary`——如果会话经过压缩，这里会显示压缩后保留下来的用户/助手对话线程（系统前言和重新注入的 `AGENTS.md` 会被移除）。
- `## Last User Requests` 和 `## Last Assistant Responses`——最近的轮次。较长的条目会被截断，并以 `rerun with --full` 提示结尾——该提示表示仍有更多内容，并会明确指出如何获取。显示为 `[skill invoked: <name> — injected body omitted]` 的用户轮次表示一次技能调用（Codex 会将整个 bundle 作为消息传递；重要的是调用这一事实，而不是具体字节内容）。
- `## Latest Plan State`——如果会话使用了 Codex 的 `update_plan` 工具，这里会以步骤清单的形式呈现最近一次计划调用。对于多步骤任务，这是表明“此任务当前处于哪个阶段”的最高信号产物；即使在非常长的会话中，下方通用工具调用列表中的相关内容已被淘汰或截断，它仍会保留下来。
- `## Recent Tool Calls`、`## Files Edited in Session`（来自 patch / FileChange 记录）、`## Errors Encountered`。
- `## Current Workspace State`——git 分支、未提交的更改、最近的提交。

如果你看到的是 `No Codex sessions found for <path>`，则说明当前目录没有 Codex 历史记录——请尝试使用 `--all-projects --list` 查找正确的项目，或直接传入 `--session <id>`。

### 第 2 步：根据会话结束原因选择处理方式

简报中的**会话结束原因**说明了上一次运行是如何停止的。请据此选择处理方式：

| 结束原因 | 含义 | 策略 |
|-----------|---------------|----------|
| **正常退出** | 智能体发出了最后一条消息（完成了一轮交互）。 | 阅读已处理的最后一个用户请求；从任何尚未完成的工作继续。 |
| **进行中** | 工具已经运行，但智能体没有留下结束消息——任务在执行过程中被中断。 | 这是常见的恢复场景。阅读最近的工具调用和已编辑文件，核实哪些更改已经生效，然后完成智能体当时正在处理的那一轮任务。 |
| **已中断** | 工具调用已发出但从未返回，或者该轮交互在中途被中止（强制停止 / ctrl-c / esc）。在此分类中，未解决的调用优先于 `task_complete` 错误——因此，如果简报在“未解决的工具调用”之后*还*显示一行 `> The last recorded task_complete also carried an error`，该错误很可能正是调用从未返回的原因（`usage_limit_exceeded` 和 `context_window_exceeded` 恰好是最有可能导致调用中途搁置的错误；在断定只是普通卡死之前，请先阅读该行）。 | 重新检查这些操作是否已生效，然后重试或继续下一步。 |
| **已放弃** | 一条用户消息没有得到响应。 | 将最后一条用户消息视为当前请求。 |
| **错误级联** | 工具反复失败。 | 不要盲目重试——先诊断根本原因。 |
| **出错** | 最后一轮交互的 `task_complete` 带有错误（例如 `usage_limit_exceeded`、`context_window_exceeded`、`unauthorized`、`cyber_policy`），且没有生成结束消息。简报会直接嵌入确切错误，因此你无需打开原始运行记录。 | 执行任何操作之前，先阅读具体的 `codex_error_info`——不同代码对应的正确后续步骤各不相同（稍后重试、重新认证、重新表述，或开启新线程）。**尤其是 `usage_limit_exceeded` 和 `internal_server_error`：这些错误通常是暂时性的，并会按一定周期消失（使用限额会重置，服务器负载会下降）。**如果原始 Codex 进程/终端可能仍处于打开状态，请先检查它是否已经自行恢复并完成工作，再开始手动续接——重复这些工作纯属浪费。会话也可能显示**正常退出但附带注意事项**：结束消息确实存在，但 `task_complete` 仍带有错误（在 468 个真实案例中测得约有 2 例）——请阅读该注意事项；该轮交互很可能已经完成，但标记的问题可能仍值得检查。 |

### 第 3 步：核对并继续

进行更改之前：
1. 确认当前目录与会话的 `cwd` 一致。
2. 如果 git 分支与简报中显示的不同，请记录这一点，并决定是否切换。
3. 检查**已编辑文件**下列出的文件——确认上一次运行所做的更改确实已经生效（运行记录只表明曾经*尝试*应用补丁；请确认文件的当前状态）。
4. 不要未经检查就假定之前的说法仍然成立——压缩和工具输出会造成信息损失。

然后：
- 实现与用户最新请求一致的下一个具体步骤。
- 运行确定性验证（测试、类型检查、构建）。
- 如果遇到阻塞，请说明确切的阻塞原因，并提出一个后续行动。

### 步骤 4：报告

简洁回复：
- **已恢复的上下文**：恢复了哪个会话，以及简报中的关键发现。
- **已执行的工作**：修改的文件、运行的命令、测试结果。
- **剩余事项**：尚未完成的任务（如有）。

## 脚本的工作原理

### 会话发现复用共享核心

发现过程通过 `_core.codex.collect_codex`（内置于 `scripts/_core/`）进行，它与 `local-conversation-history` skill 使用的是同一个可容忍模式变化的读取器：优先使用 `state_*.sqlite` 索引；如果数据库缺失或其模式发生偏移，则回退到扫描原始 rollout JSONL。因此，列表查询、`--query` 和获取项目最新会话都共用同一套经过测试的实现。

### Rollout 解析

Codex 的 rollout 模式与 Claude 不同。解析器会读取：
- **用户/助手轮次**来自两个可能的数据流，因为轮次所在位置会随 Codex 版本发生变化（基于约 2,600 个 rollout 的测量，版本范围为 0.142.2–0.149.0）：`event_msg/user_message` / `agent_message` 镜像流（在 0.146.x 及更早版本以及 0.147/0.148 alpha 版本中是常态，之后仍有少量残留）和 `response_item/message` 记录（用户文本为 `input_text`，助手文本为 `output_text`，在本地解码）。这两个流并不总是互为镜像——某些版本只在事件流中保留每一步的评论，而轮次中途排队的用户输入仅出现在消息记录中——因此会同时收集两者，并按角色选择**内容更丰富的数据流**（请求与响应显示在不同部分；若两者相同，则选择事件流），绝不重复计数，也绝不会静默丢弃任一角色内容更多的那一部分。仅包含图像的用户消息会呈现为 `[image-only user message]`，而不会消失。`task_complete.last_agent_message` 是一种尾部保障机制，仅当所选数据流缺少助手的最终文本时才会追加。`response_item/agent_message` 记录属于智能体之间的通信（子智能体路由消息，可能是明文或加密内容），绝不是主线程文本。
- **编辑的文件**来自 `event_msg/patch_apply_end`（常见于 ≤0.146 及 alpha 版本；后续版本中偶有残留）以及类型为 `FileChange` 的 `event_msg/item_completed` 条目（0.147+，此时补丁事件已消失）——`changes` 映射中的键就是被改动的文件；这两个来源会汇入同一个集合。
- **工具调用**来自 `response_item/function_call` 和 `custom_tool_call`，并通过 `call_id` 与对应的 `*_output` 配对（未配对的调用表示它从未返回）。最近一次 `update_plan` 调用会受到额外处理：其完整解析后的 `plan`（以及存在时的 `explanation`）会被单独跟踪，以最后一次调用为准，不受 120 字符工具调用预览和最近 20 条窗口的限制——基于约 4,000 次真实调用的测量，该格式始终稳定为一个可解析成 `{"plan": [...]}` 或 `{"explanation": ..., "plan": [...]}` 的 JSON 字符串，其中每个步骤均为 `{"step", "status"}`。
- **压缩**来自 `compacted` 记录——Codex 会用消息组成的 `replacement_history`（而不是单个摘要）替换已压缩的窗口，并重新注入系统前言；解析器仅保留用户/助手轮次。

### 会话结束原因检测

根据 rollout 的尾部进行分类：末尾为 `task_complete` 或处于 `final_answer` 阶段的 assistant 消息表示**已完成**；未配对的工具调用或末尾的 `turn_aborted` 表示**已中断**；工具已运行但没有结束消息，或者尾部停留在 `commentary` 阶段的消息（在轮次中途被截断），表示**进行中**；末尾为 user 消息表示**已放弃**；三次或更多工具失败表示**错误级联**。`task_complete` 也可以携带 `error`（`{"message", "codex_error_info"}`）——这是通过扫描 6,650 个 rollout 中实际出现的 468 个案例测得的，涵盖 6 种不同的 `codex_error_info` 值。每次 `task_complete` 都会捕获此信息（以后出现的值为准，因此后续无错误的轮次可以正确清除先前残留的错误），并将其与结束消息组合处理，而不是视为互斥状态：存在错误**且**没有结束消息（扫描中的 468 个案例里有 466 个）时，状态为**出错**，并内联原样保留的 `codex_error_info` 和消息；存在错误**但**仍有真实结束消息（468 个案例里有 2 个）时，状态仍为**已完成**，但会附带说明该错误的注意事项，而不是将其隐藏。

### 噪声过滤

Codex 会在压缩后以及轮次之间重新注入大型 system 块——权限块、agent 角色消息以及项目的 `AGENTS.md`。解析器使用共享的 `is_noise_text` 将其丢弃（该函数可识别 `<permissions instructions`、`<system-reminder`、`# AGENTS.md instructions for` 及类似前缀），因此简报展示的是真实对话，而不是运行框架的脚手架内容。

## 防护规则

- 不要运行 `codex resume` 或 `codex --continue`——此 Skill 会在当前对话中恢复上下文。
- 不要将压缩摘要或工具输出视为完整事实——它们是有损的。始终根据当前工作区验证相关说法。
- 不要覆盖工作树中不相关的更改。
- 不要将整个 rollout 文件加载到上下文中——始终使用脚本（rollout 通常有数 MB）。

## 限制

- 无法恢复 rollout 文件已从 `~/.codex/sessions/` 中删除的会话。
- 无法访问其他机器上的会话（文件仅存储在本地）。
- 较长的简报部分（压缩摘要、用户请求、assistant 响应）默认会被截断；每个截断位置都会显示 `rerun with --full` 提示，而 `--full` 会输出完整文本（每个部分的数量上限仍然适用）。工具调用预览按设计仍限制为 120 个字符——如需查看完整命令或补丁，请使用调用的 `call_id` 在 rollout 中执行 grep。
- 压缩是有损的——早期对话中的细节可能已经丢失。
- Codex 没有类似 Claude Code 的 `MEMORY.md` 那样按会话自动维护的记忆机制；项目的 `AGENTS.md` 会被特意过滤为重新注入的噪声，因此如果需要项目的常驻指令，请单独读取该文件。

## 触发短语示例

- “继续 Codex 会话 `019f66...`”
- “Codex 在任务中途被中断了，从中断处继续”
- “不要运行 `codex resume`，只需读取 rollout 并继续”
- “Codex 在此仓库中的上一次会话正在做什么？”
- “找到我构建 Skill 迁移器的那次 Codex 运行并继续”

## 相关技能

- **`continue-claude-work`** — 面向 Claude Code 会话（`~/.claude`）的相同功能。如果上一个会话是 Claude 而不是 Codex，请改用该技能。
- **`local-conversation-history`** — 列出每个配置主目录中的所有 Claude 和 Codex 对话。当你不确定需要哪个会话（或哪个提供商）时，请先使用该技能，然后将 Codex 会话 ID 带到这里。