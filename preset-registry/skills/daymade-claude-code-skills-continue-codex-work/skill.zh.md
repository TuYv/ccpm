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

从之前的 **Codex CLI** 会话中恢复可操作的上下文，并在当前对话中继续执行。Codex 会将每个会话记录为 `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` 下的 rollout JSONL（以及可选的 `state_*.sqlite` 索引）。将这些本地文件作为事实来源，然后继续进行具体的编辑和检查——而不只是总结。

**为什么使用此方式而不是 `codex resume`**：重放完整的 rollout 会将每个推理步骤、工具调用和工具输出重新注入上下文窗口。对于较长的会话，这会将窗口浪费在已经解决的轮次和过时的输出上。此 Skill 会**有选择地重建**仅包含可操作信息的上下文——上次压缩后保留的请求、最近的用户/助手轮次、工具调用和编辑过的文件，以及会话的结束方式——从而在保留先前知识的同时重新开始。

这是 `continue-claude-work` 的 Codex 对应版本。两者被特意分开，因为它们的磁盘存储格式不同：Claude Code 写入 `~/.claude/projects/<encoded>/<session>.jsonl`，Codex 则使用具有不同记录模式的 `~/.codex/sessions/.../rollout-*.jsonl`。Codex 会话请使用**此** Skill；Claude Code 会话请使用 `continue-claude-work`。

## 文件结构参考

有关 rollout 目录布局、记录/负载模式和压缩格式，请参阅 [references/file_structure.md](references/file_structure.md)。

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
```

**预期输出**：结构化的 Markdown **简报**。你应该会看到：

- 一个 `# Codex Resume Context Briefing` 标题，后跟 `## Session Info`（id、项目 cwd、最后活跃时间、标题、Codex 版本）。
- 一行 `**Session end reason**`——最重要的单项路由信号（参见第 2 步）。
- `## Compact Summary`——如果会话经过压缩，则包含保留下来的用户/助手对话线索（系统前言和重新注入的 `AGENTS.md` 会被移除）。
- `## Last User Requests` 和 `## Last Assistant Responses`——最近的轮次。
- `## Recent Tool Calls`、`## Files Edited in Session`（来自 `apply_patch` 结果）、`## Errors Encountered`。
- `## Current Workspace State`——git 分支、未提交的更改、最近的提交。

如果你看到的是 `No Codex sessions found for <path>`，则当前目录没有 Codex 历史记录——请尝试使用 `--all-projects --list` 查找正确的项目，或直接传入 `--session <id>`。

### 第 2 步：根据会话结束原因进行分支处理

简报中的 **Session end reason** 会告诉你上一次运行是如何停止的。根据该原因采取相应处理：

| 结束原因 | 含义 | 策略 |
|-----------|---------------|----------|
| **Clean exit** | 代理说了最后一句话（完成了一个轮次）。 | 阅读已处理的最后一个用户请求；从所有待完成的工作继续。 |
| **In progress** | 工具已运行，但代理未留下结束消息——任务执行到一半时被中断。 | 这是常见的恢复场景。查看最近的工具调用和编辑过的文件，验证实际生效的内容，并完成代理当时正在处理的轮次。 |
| **Interrupted** | 工具调用已发出但从未返回（强制停止 / ctrl-c）。 | 重新检查这些操作是否已生效，然后重试或继续下一步。 |
| **Abandoned** | 用户消息未得到响应。 | 将最后一条用户消息视为当前请求。 |
| **Error cascade** | 工具反复失败。 | 不要盲目重试——先诊断根本原因。 |

### 第 3 步：核对并继续

进行更改之前：
1. 确认当前目录与会话的 `cwd` 一致。
2. 如果 git 分支与简报中显示的不同，请记录这一点并决定是否切换。
3. 检查 **Files Edited** 下列出的文件——验证上一次运行的更改确实已经生效（rollout 只记录补丁曾被*尝试*应用；请确认文件的当前状态）。
4. 不要未经检查就假定旧有结论仍然成立——压缩和工具输出可能会丢失信息。

然后：
- 执行与最新用户请求一致的下一个具体步骤。
- 运行确定性的验证（测试、类型检查、构建）。
- 如果遇到阻塞，请说明确切的阻塞原因，并提出一个后续操作。

### 第 4 步：报告

简洁地回复：
- **Context recovered**：恢复的是哪个会话，以及从简报中获得的关键发现。
- **Work executed**：更改的文件、运行的命令、测试结果。
- **Remaining**：仍待处理的任务（如有）。

## 脚本的工作原理

### 会话发现复用共享核心

发现过程通过 `_core.codex.collect_codex`（捆绑在 `scripts/_core/` 中）执行，它与 `local-conversation-history` skill 使用的是同一个可兼容多种 schema 的读取器：该读取器优先使用 `state_*.sqlite` 索引；当数据库缺失或其 schema 发生变化时，则回退到扫描原始 rollout JSONL。因此，列表、`--query` 和获取项目的最新会话都共用同一个经过测试的实现。

### Rollout 解析

Codex 的 rollout schema 与 Claude 的不同。解析器读取：
- **用户 / 代理轮次**：从事件流（`event_msg/user_message`、`event_msg/agent_message`、`task_complete.last_agent_message`）中读取——这些事件存储纯字符串，并与 `response_item/message` 条目相对应，因此可以避免重复计数，并绕过此处不需要的 `output_text` 内容。
- **编辑的文件**：从 `event_msg/patch_apply_end` 中读取——其 `changes` 映射的键就是 `apply_patch` 修改过的文件。
- **工具调用**：从 `response_item/function_call` 和 `custom_tool_call` 中读取，并通过 `call_id` 与其 `*_output` 配对（未配对的调用意味着它从未返回）。
- **压缩**：从 `compacted` 记录中读取——Codex 会使用消息组成的 `replacement_history`（而非单条摘要）替换被压缩的窗口，并重新注入系统前言；解析器仅保留用户/代理轮次。

### 会话结束原因检测

根据 rollout 的末尾进行分类：末尾的 `task_complete`/`agent_message` 表示**已完成**；未配对的工具调用表示**已中断**；工具已运行但没有结束消息表示**正在进行**；末尾的用户消息表示**已放弃**；三次或更多次工具失败表示**错误级联**。

### 噪声过滤

Codex 会在压缩后以及轮次之间重新注入大型系统块——权限块、智能体角色消息和项目的 `AGENTS.md`。解析器会使用共享的 `is_noise_text` 将这些内容丢弃（该函数可识别 `<permissions instructions`、`<system-reminder`、`# AGENTS.md instructions for` 及类似前缀），因此任务简报会显示真实对话，而不是运行框架的脚手架内容。

## 防护措施

- 不要运行 `codex resume` 或 `codex --continue`——此技能可在当前对话中恢复上下文。
- 不要将压缩摘要或工具输出视为完整事实——它们是有损的。始终根据当前工作区验证相关说法。
- 不要覆盖工作树中无关的更改。
- 不要将整个 rollout 文件加载到上下文中——始终使用脚本（rollout 文件通常有数 MB）。

## 局限性

- 无法恢复 rollout 文件已从 `~/.codex/sessions/` 中删除的会话。
- 无法访问其他机器上的会话（文件仅存储在本地）。
- 工具调用预览会被截断——如需查看完整命令或补丁，请直接读取对应的 rollout 行。
- 压缩是有损的——对话早期的细节可能已经丢失。
- Codex 没有与 Claude Code 的 `MEMORY.md` 对应的按会话自动记忆机制；项目的 `AGENTS.md` 会被有意过滤，因为它属于重新注入的噪声，因此如果需要项目的长期有效指令，请单独读取该文件。

## 触发短语示例

- “继续 Codex 会话 `019f66...`”
- “Codex 在任务中途被切断了，请从中断处继续”
- “不要运行 `codex resume`，只需读取 rollout 并继续”
- “在此仓库中的上一个会话里，Codex 当时正在做什么？”
- “找到我构建技能迁移器时的 Codex 运行记录并继续”

## 相关技能

- **`continue-claude-work`**——为 Claude Code 会话（`~/.claude`）提供相同的功能。如果之前的会话来自 Claude 而不是 Codex，请改用该技能。
- **`local-conversation-history`**——列出每个配置主目录中的所有 Claude 和 Codex 对话。当你不确定需要哪个会话（或哪个提供商）时，请先使用该技能，然后将 Codex 会话 ID 带到这里。