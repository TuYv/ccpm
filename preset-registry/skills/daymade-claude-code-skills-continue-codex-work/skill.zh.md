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

从之前的 **Codex CLI** 会话中恢复可操作的上下文，并在当前对话中继续执行。Codex 会将每个会话记录为 `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` 下的 rollout JSONL（以及可选的 `state_*.sqlite` 索引）。使用这些本地文件作为事实来源，然后继续进行具体的编辑和检查——而不只是总结。

**为什么使用此方式而不是 `codex resume`**：重放完整 rollout 会将每一个推理步骤、工具调用和工具输出重新送入上下文窗口。对于长会话，这会把窗口浪费在已经解决的轮次和过时的输出上。此技能会**选择性地重建**可操作的上下文——上一次压缩后保留下来的请求、最近的用户/助手轮次、工具调用和已编辑文件，以及会话如何结束——从而在保留先前知识的同时重新开始。

这是 `continue-claude-work` 的 Codex 对应版本。两者被特意拆分，因为磁盘上的格式不同：Claude Code 写入 `~/.claude/projects/<encoded>/<session>.jsonl`，Codex 则使用不同的记录模式写入 `~/.codex/sessions/.../rollout-*.jsonl`。Codex 会话请使用**此**技能；Claude Code 会话请使用 `continue-claude-work`。

## 文件结构参考

有关 rollout 目录布局、记录/有效载荷模式以及压缩格式，请参阅 [references/file_structure.md](references/file_structure.md)。

## 工作流程

### 第 1 步：提取上下文（调用一次脚本）

运行随附的提取器。它会通过共享的 `_core` 完成会话发现，并在一次调用中处理 rollout 解析、噪声过滤和工作区状态：

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

**预期输出**：一份结构化的 Markdown **简报**。你应该会看到：

- 一个 `# Codex Resume Context Briefing` 标题，随后是 `## Session Info`（id、项目 cwd、最后活动时间、标题、Codex 版本）。
- 一行 `**Session end reason**`——最重要的单一流程分流信号（参见第 2 步）。
- `## Compact Summary`——如果会话曾被压缩，这里会显示压缩后保留下来的用户/助手对话线程（系统前言和重新注入的 `AGENTS.md` 会被移除）。
- `## Last User Requests` 和 `## Last Assistant Responses`——最近的轮次。较长的条目会被截断，并以 `rerun with --full` 提示结尾——该提示表示还有更多内容，并会明确指出如何获取。显示为 `[skill invoked: <name> — injected body omitted]` 的用户轮次代表一次技能调用（Codex 会将整个包作为消息传递；重要的是调用这一事实，而不是具体字节内容）。
- `## Recent Tool Calls`、`## Files Edited in Session`（来自补丁 / FileChange 记录）、`## Errors Encountered`。
- `## Current Workspace State`——git 分支、未提交的更改、最近的提交。

如果你看到的是 `No Codex sessions found for <path>`，则表示当前目录没有 Codex 历史记录——请尝试使用 `--all-projects --list` 查找正确的项目，或直接传入 `--session <id>`。

### 第 2 步：根据会话结束原因选择处理路径

简报中的**会话结束原因**会说明上一次运行是如何停止的。请据此选择处理方式：

| 结束原因 | 含义 | 策略 |
|-----------|---------------|----------|
| **正常退出** | 智能体最后发言（已完成一轮交互）。 | 阅读已处理的最后一条用户请求；从任何待完成的工作继续。 |
| **进行中** | 工具已运行，但智能体没有留下结束消息——任务在执行中途被截断。 | 这是常见的恢复场景。阅读最近的工具调用和已编辑文件，核实哪些更改已实际生效，然后完成智能体当时正在处理的这一轮任务。 |
| **已中断** | 工具调用已发出但从未返回，或该轮交互在中途被中止（强制停止 / ctrl-c / esc）。 | 重新检查这些操作是否已生效，然后重试或继续执行后续工作。 |
| **已放弃** | 某条用户消息未得到响应。 | 将最后一条用户消息视为当前请求。 |
| **错误级联** | 工具反复失败。 | 不要盲目重试——先诊断根本原因。 |

### 第 3 步：核对并继续

进行更改之前：
1. 确认当前目录与会话的 `cwd` 一致。
2. 如果 git 分支与简报中显示的不同，请注明这一点，并决定是否切换。
3. 检查**已编辑文件**下列出的文件——验证上一次运行的更改是否确实已生效（rollout 记录的是补丁曾被*尝试*应用；请确认文件当前的实际状态）。
4. 未经检查，不要假定旧有说法仍然成立——压缩和工具输出都可能丢失信息。

然后：
- 执行与最新用户请求一致的下一个具体步骤。
- 运行确定性的验证（测试、类型检查、构建）。
- 如果受阻，请说明确切的阻塞原因，并提出下一项操作建议。

### 第 4 步：报告

简洁回复：
- **已恢复的上下文**：具体会话，以及简报中的关键发现。
- **已执行的工作**：已更改的文件、已运行的命令、测试结果。
- **剩余工作**：尚待完成的任务（如有）。

## 脚本的工作原理

### 会话发现复用共享核心

发现过程通过 `_core.codex.collect_codex`（捆绑在 `scripts/_core/` 中）完成，这与 `local-conversation-history` skill 使用的是同一个兼容多种 schema 的读取器：它优先使用 `state_*.sqlite` 索引；当数据库缺失或其 schema 已发生变化时，则回退到扫描原始 rollout JSONL。因此，列表、`--query` 和按项目查找最新会话都共享同一个经过测试的实现。

### Rollout 解析

Codex 的 rollout schema 与 Claude 的不同。解析器读取：
- **用户 / 助手轮次**来自两个可能的数据流，因为轮次的存储位置会随 Codex 版本而变化（基于约 2,600 个 rollout 的测量，版本范围为 0.142.2–0.149.0）：`event_msg/user_message` / `agent_message` 镜像流（在 0.146.x 及之前的版本和 0.147/0.148 alpha 版中较为常见，在后续版本中仍有少量残留）以及 `response_item/message` 记录（用户文本为 `input_text`，助手文本为 `output_text`，在本地解码）。这两个数据流并不总是相互镜像——某些版本仅在事件流中保留每一步的说明，而轮次中途排队的用户输入仅出现在消息记录中——因此会同时收集二者，并按角色选择**信息更丰富的数据流**（请求和响应显示在不同部分；信息量相同时优先选择事件流），绝不重复计数，也绝不默默丢弃任一角色信息量更大的一半。仅包含图像的用户消息会呈现为 `[image-only user message]`，而不会消失。`task_complete.last_agent_message` 是一种尾部保护措施，仅当所选数据流缺少助手的最终文本时才会追加。`response_item/agent_message` 记录属于智能体之间的通信（子智能体路由消息，可能是明文或密文），绝不是主线程文本。
- **已编辑文件**来自 `event_msg/patch_apply_end`（常见于 ≤0.146 和 alpha 版；在后续版本中仍有少量残留）以及 `event_msg/item_completed` 中类型为 `FileChange` 的项目（0.147+，此时补丁事件已消失）——`changes` 映射的键即为涉及的文件；两个来源都会汇入同一个集合。
- **工具调用**来自 `response_item/function_call` 和 `custom_tool_call`，并通过 `call_id` 与对应的 `*_output` 配对（未配对的调用意味着它从未返回）。
- **压缩内容**来自 `compacted` 记录——Codex 会用由多条消息组成的 `replacement_history`（而不是单条摘要）替换已压缩的窗口，并重新注入系统前置提示；解析器仅保留用户和助手轮次。

### 会话结束原因检测

根据 rollout 的尾部进行分类：末尾为 `task_complete` 或处于 `final_answer` 阶段的助手消息视为**已完成**；未配对的工具调用或末尾为 `turn_aborted` 视为**已中断**；工具已运行但没有结束消息，或尾部停留在 `commentary` 阶段的消息（在轮次中途被截断），视为**进行中**；末尾为用户消息视为**已放弃**；三次或更多工具失败视为**错误级联**。

### 噪声过滤

Codex 会在压缩后和轮次之间重新注入大型系统块——权限块、智能体角色消息以及项目的 `AGENTS.md`。解析器使用共享的 `is_noise_text` 将其丢弃（该函数可识别 `<permissions instructions`、`<system-reminder`、`# AGENTS.md instructions for` 及类似前缀），因此简报会显示真实对话，而不是运行框架的脚手架内容。

## 防护准则

- 不要运行 `codex resume` 或 `codex --continue`——此技能会在当前对话中恢复上下文。
- 不要将压缩摘要或工具输出视为完整事实——它们是有损的。务必根据当前工作区验证相关说法。
- 不要覆盖工作树中无关的更改。
- 不要将整个 rollout 文件加载到上下文中——始终使用脚本（rollout 通常有数 MB）。

## 限制

- 无法恢复 rollout 文件已从 `~/.codex/sessions/` 删除的会话。
- 无法访问其他机器上的会话（文件仅存储在本地）。
- 较长的简报部分（压缩摘要、用户请求、助手响应）默认会被截断；每个截断点都会显示 `rerun with --full` 提示，而 `--full` 会打印完整文本（每个部分的数量上限仍然适用）。工具调用预览按设计仍限制为 120 个字符——如需完整命令或补丁，请使用调用的 `call_id` 在 rollout 中进行 grep 搜索。
- 压缩是有损的——早期对话的细节可能已经丢失。
- Codex 没有类似 Claude Code 的 `MEMORY.md` 那样按会话自动记忆的机制；项目的 `AGENTS.md` 会被有意过滤，因为它属于重新注入的噪声，因此如果需要项目的长期有效指令，请单独读取该文件。

## 触发短语示例

- “继续 Codex 会话 `019f66...`”
- “Codex 在任务中途被截断了，从中断处继续”
- “不要运行 `codex resume`，只需读取 rollout 并继续”
- “Codex 在此仓库的上一次会话中正在做什么？”
- “找到我构建技能迁移器的那次 Codex 运行并继续”

## 相关技能

- **`continue-claude-work`**——为 Claude Code 会话（`~/.claude`）提供相同功能。如果之前的会话来自 Claude 而非 Codex，请改用该技能。
- **`local-conversation-history`**——列出所有配置主目录中的 Claude 和 Codex 对话。如果你不确定需要哪个会话（或哪个提供商），请先使用该技能，然后将 Codex 会话 ID 提供到这里。