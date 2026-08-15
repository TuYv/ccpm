---
name: continue-claude-work
description: Recover actionable context from local `.claude` session artifacts and continue interrupted work without running `claude --resume`. This skill should be used when the user provides a Claude session ID, asks to continue prior work from local history, or wants to inspect `.claude` files before resuming implementation.
argument-hint: "[session-id]"
---
# 继续 Claude 工作

## 概述

从之前的 Claude Code 会话中恢复可执行的上下文，并在当前对话中继续执行。以本地会话文件作为事实来源，然后继续进行具体的编辑和检查——而不只是总结。

**为什么使用此方式而不是 `claude --resume`**：`claude --resume` 会将完整的会话记录重新加载到上下文窗口中。对于长会话，这会在已解决的问题和过时状态上浪费 token。此 Skill 会**有选择地重建**可执行的上下文——最新的精简摘要、待处理工作、已知错误和当前工作区状态——从而在保留先前知识的同时重新开始。

## 文件结构参考

有关目录布局、JSONL schema 和压缩块格式，请参阅 `references/file_structure.md`。

## 工作流程

### 第 1 步：提取上下文（单次脚本调用）

运行随附的提取脚本。它会通过一次调用完成会话发现、压缩边界解析、噪声过滤和工作区状态获取：

```bash
# Latest session for current project
python3 scripts/extract_resume_context.py

# Specific session by ID
python3 scripts/extract_resume_context.py --session <SESSION_ID>

# Search by topic
python3 scripts/extract_resume_context.py --query "auth feature"

# List recent sessions
python3 scripts/extract_resume_context.py --list
```

该脚本会输出一份结构化的 Markdown **简报**，其中包含：
- 来自 `sessions-index.json` 的**会话元数据**
- **精简摘要**——Claude 在最后一个压缩边界生成的提炼摘要（信息价值最高的上下文）
- **最近的用户请求**——最新的明确要求
- **最近的助手回复**——声称已完成的工作
- **遇到的错误**——工具故障和错误输出
- **未解决的工具调用**——表明会话已中断
- **子代理工作流状态**——哪些子代理已完成、哪些已中断，以及它们的最后输出
- **会话结束原因**——正常退出、中断（ctrl-c）、错误级联或已放弃
- **涉及的文件**——会话期间创建、编辑或读取的文件
- **MEMORY.md**——跨会话持久化备注
- **Git 状态**——当前状态、分支和最近的日志

该脚本会自动跳过当前活动会话（修改时间不足 60 秒），以避免提取自身。

### 第 2 步：根据会话结束原因选择分支

简报中包含**会话结束原因**。使用它来选择正确的继续执行策略：

| 结束原因 | 策略 |
|-----------|----------|
| **正常退出** | 会话已正常完成。阅读已处理的最后一个用户请求。如有待处理工作，则从该处继续。 |
| **中断** | 工具调用已发出，但从未获得结果（可能是 ctrl-c 或超时）。重试中断的工具调用，或评估它们是否仍有必要。 |
| **错误级联** | 多个 API 错误导致会话失败。不要盲目重试——先诊断根本原因。 |
| **已放弃** | 用户发送了消息，但未收到回复。将最后一条用户消息视为当前请求。 |

如果简报中包含 **子代理工作流** 部分，并且有被中断的子代理，请检查每个子代理当时正在执行什么任务，并判断是重试还是跳过。

### 第 3 步：核对并继续

进行更改之前：
1. 确认当前目录与会话的项目一致。
2. 如果 git 分支已不同于会话中的分支，请注明这一点，并决定是否切换。
3. 检查与待处理工作相关的文件——验证之前的判断是否仍然成立。
4. 未经检查，不要假定之前的判断仍然有效。

然后：
- 实施与用户最新请求一致的下一个具体步骤。
- 运行确定性的验证（测试、类型检查、构建）。
- 如果受阻，请说明确切的阻碍因素，并提出一个后续操作。

### 第 4 步：报告

简洁回复：
- **已恢复的上下文**：恢复了哪个会话，以及简报中的关键发现
- **已执行的工作**：更改的文件、运行的命令、测试结果
- **剩余工作**：尚未完成的任务（如有）

## 脚本的工作原理

### 感知压缩边界的提取

脚本会在会话 JSONL 中找到**最后一个**压缩边界，并提取其摘要。这是任何长会话中信号最强的一份上下文——即 Claude 自己对截至该节点的整个对话所提炼的理解。有关压缩格式和 JSONL 模式的详细信息，请参阅 `references/file_structure.md`。

### 根据大小自适应的策略

| 会话大小 | 策略 |
|-------------|----------|
| 存在压缩 | 读取最后一个压缩摘要及压缩后的所有消息 |
| < 500 KB，无压缩 | 读取最后 60% 的消息 |
| 500 KB - 5 MB | 读取最后 30% 的消息 |
| > 5 MB | 读取最后 15% 的消息 |

### 子代理上下文提取

当会话包含子代理目录（`<session-id>/subagents/`）时，脚本会解析每个子代理的 JSONL，以提取代理类型、完成状态以及最后一段文本输出。这样可以恢复多代理工作流——例如，如果一个包含 32 个子代理的评估流水线被中断，简报会显示哪些代理已完成，以及哪些需要重试。

### 会话结束原因检测

脚本会对会话的结束方式进行分类：
- **已完成**——最后一条消息来自助手（正常退出）
- **已中断**——存在未解决的工具调用（ctrl-c 或超时）
- **错误级联**——出现 3 次以上 API 错误
- **已放弃**——用户发送消息后未收到回复

### 噪声过滤

以下消息类型会被跳过（在真实会话中占总行数的 37-53%）：
- `progress`、`queue-operation`、`file-history-snapshot`——操作噪声
- `api_error`、`turn_duration`、`stop_hook_summary`——系统子类型
- `<task-notification>`、`<system-reminder>`——从用户文本提取中过滤掉

## 防护规则

- 不要运行 `claude --resume` 或 `claude --continue`——此技能用于在当前会话内恢复上下文。
- 不要将压缩摘要视为完全准确的事实——它们是有损的。始终根据当前工作区验证其中的判断。
- 不要覆盖工作树中不相关的更改。
- 不要将完整的会话文件加载到上下文中——始终使用该脚本。

## 局限性

- 无法恢复其 `.jsonl` 文件已从 `~/.claude/projects/` 中删除的会话。
- 无法访问其他机器上的会话（文件仅存储在本地）。
- Edit 工具操作显示的是差异，而不是完整文件内容——如需恢复完整文件，请使用 `claude-code-history-files-finder`。
- 压缩摘要会造成信息损失——早期对话的详细信息可能会缺失。
- `sessions-index.json` 可能已过期（其中的条目可能指向已删除的文件）。该脚本会回退到基于文件系统的发现方式。

## 触发短语示例

- “从会话 `abc123-...` 继续工作”
- “不要恢复会话，只需读取 .claude 文件并继续”
- “查看我上一个会话在做什么，然后继续”
- “在我的会话中搜索 PR 审查工作”