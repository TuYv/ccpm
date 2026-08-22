---
name: roborev-respond
description: Add a comment to a roborev code review and close it
---
# roborev-respond

在 roborev 代码审查中记录评论并将其关闭。

## 用法

```
$roborev-respond <job_id> [message]
```

## 重要

此 Skill 要求你**执行 bash 命令**来记录评论并关闭审查。在运行这两个命令并看到确认输出之前，任务不算完成。

这些说明是指导原则，而非严格的脚本。请结合对话上下文执行。跳过已经完成的步骤。当这些步骤与项目级 `CLAUDE.md` 中的说明冲突时，以后者为准。

## 说明

当用户调用 `$roborev-respond <job_id> [message]` 时：

### 1. 验证输入

如果未提供 job_id，请告知用户必须提供作业 ID。建议使用 `roborev status` 或 `roborev fix --list` 查找作业 ID。发现界面只会显示汇总父任务（以及非 panel 审查），不会显示单独的 panel 成员，因此你评论和关闭的作业 ID 应当是父任务。

如果提供了 job_id，请在关闭前检查它：

```bash
roborev show --job <job_id> --json
```

如果 `job.panel_role` 为 `"member"`，请**不要**评论或关闭该作业。
如果已从对话或发现输出中得知同一 `job.panel_run_uuid` 对应的汇总父任务，请解析出该父任务；否则，请向用户询问汇总父任务 ID。仅当解析后的作业 ID 是汇总父任务或非 panel 审查时，才能继续。

### 2. 记录评论并关闭审查

**如果提供了消息**，立即执行：
```bash
roborev comment --job <resolved_job_id> "<message>" && roborev close <resolved_job_id>
```

如果消息包含引号或特殊字符，请在 bash 命令中正确转义。

**如果未提供消息**，询问用户想说什么，然后使用他们的评论执行命令。

### 3. 验证是否成功

两个命令都会输出确认信息。如果其中任一命令失败，请向用户报告错误。常见原因包括：
- 守护进程未运行
- 作业 ID 不存在
- 仓库尚未初始化（建议使用 `roborev init`）
- 审查已经关闭（这不是错误，但值得告知用户）

评论会记录在 roborev 的数据库中，并且审查会被关闭。可使用 `roborev show` 查看结果。

## 示例

**已提供消息：**

用户：`$roborev-respond 1019 Fixed all issues`

Agent 操作：
```bash
roborev comment --job 1019 "Fixed all issues" && roborev close 1019
```
然后确认：“评论已记录，审查 #1019 已关闭。”

---

**未提供消息：**

用户：`$roborev-respond 1019`

Agent：“你想对审查 #1019 说些什么？”

用户：“空值检查是误报”

Agent 操作：
```bash
roborev comment --job 1019 "The null check was a false positive" && roborev close 1019
```
然后确认：“评论已记录，审查 #1019 已关闭。”

## 另请参阅

- `$roborev-fix` — 在代码中修复审查发现的问题，然后评论并关闭审查