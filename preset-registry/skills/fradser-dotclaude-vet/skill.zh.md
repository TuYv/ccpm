---
name: vet
description: This skill should be used when the user invokes /vet to manually surface the current session task and have Claude evaluate whether it is clear and complete.
user-invocable: true
allowed-tools: ["Bash(ls:*)", "Bash(cat:*)", "Read", "AskUserQuestion"]
---
# 审查会话任务

呈现当前会话任务，并评估其清晰度和完成状态。

## 阶段 1：解析任务状态

**目标**：定位并读取会话状态文件。

**操作**：
1. 在 `~/.claude/projects/$(echo "$PWD" | tr '/' '-')/` 中查找最新的 `*.vetted.json` 文件（使用修改时间最近的文件）
2. 如果不存在状态文件，则报告“此会话中没有正在跟踪的任务”并停止
3. 读取该文件并提取 `task`、`updated_at` 和 `modified_files`（如果存在）
4. 向用户清晰展示正在跟踪的任务

## 阶段 2：清晰度检查

**目标**：确定任务是否具有明确无歧义的完成标准。

**操作**：
1. 评估任务是否足够具体，能够定义一份明确的交付检查清单
2. 如果任务含糊或存在歧义，请使用 `AskUserQuestion` 工具要求用户先进行澄清，然后再继续
3. 在任务明确之前，不要继续执行阶段 3

## 阶段 3：完成情况检查

**目标**：根据目前为止的对话评估任务是否完成。

**操作**：
1. 如果已完成：确认完成了哪些内容，并追加 `<verified>Fully Vetted.</verified>`
2. 如果未完成：列出尚未完成的事项并确定下一步（不要标记为已验证）
3. 如果无法确定（仅进行了讨论或规划）：说明这一点并跳过验证