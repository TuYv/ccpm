---
name: roborev-respond
description: Use only when the user explicitly invokes /roborev-respond
disable-model-invocation: true
---
# roborev-respond

在 roborev 代码审查中记录评论并关闭审查。

## 用法

```
/roborev-respond <job_id> [message]
```

## 仅限显式调用

调用必须是显式的：字面形式的个人 `/roborev-respond`，或结构化的
Grok Build skill 选择。
诸如“回复这次审查”之类的请求，如果没有使用上述某种显式机制，则必须使用
原生行为，不得运行 roborev。

## 沙箱访问

roborev 使用本地守护进程。如果命令因 `permission denied` 失败，可能是沙箱阻止了对其
回环端口或 Unix 套接字的访问。请使用运行时支持的沙箱提升机制重试相同的命令。不要因为
沙箱中的状态探测无法连接守护进程而启动或重启守护进程。

## 重要事项

此 skill 要求你**执行 bash 命令**来记录评论并关闭审查。只有在运行这两个命令并看到确认输出后，任务才算完成。

这些说明是指导原则，而不是僵化的脚本。请结合对话
上下文。若项目级 `AGENTS.md` 中的说明与这些步骤冲突，应遵循项目级说明。

## 说明

当用户调用 `/roborev-respond <job_id> [message]` 时：

### 1. 验证输入

如果未提供 job_id，告知用户需要 job ID。建议使用 `roborev status` 或 `roborev fix --list` 查找 job ID。发现结果会显示合成父任务（以及非面板审查），而不会显示单独的面板成员，因此你要评论并关闭的 job ID 是父任务。

如果提供了 job_id，请在关闭之前检查它：

```bash
roborev show --job <job_id> --json
```

如果 `job.panel_role` 为 `"member"`，则**不要**对该 job 发表评论或关闭该 job。
解析同一个 `job.panel_run_uuid` 对应的合成父任务：如果该任务已在对话或发现输出中得知，则使用该父任务；否则向用户询问合成父任务 ID。只有在解析出的 job ID 是合成父任务或非面板审查后，才能继续。

### 2. 记录评论并关闭审查

**如果提供了消息**，立即执行：
```bash
roborev comment --job <resolved_job_id> "<message>" && roborev close <resolved_job_id>
```

如果消息包含引号或特殊字符，请在 bash 命令中正确转义。

**如果未提供消息**，询问用户想说什么，然后使用其评论执行命令。

### 3. 验证成功

两个命令都会输出确认信息。如果任一命令失败，请向用户报告错误。常见原因包括：
- 守护进程未运行
- job ID 不存在
- 仓库未初始化（建议使用 `roborev init`）
- 审查已经关闭（这不是错误，但值得告知用户）

评论会记录在 roborev 的数据库中，审查也会被关闭。使用 `roborev show` 查看结果。

## 示例

**提供消息时：**

用户：`/roborev-respond 1019 Fixed all issues`

代理操作：
```bash
roborev comment --job 1019 "Fixed all issues" && roborev close 1019
```
然后确认：“评论已记录，审查 #1019 已关闭。”

---

**不带消息：**

用户：`/roborev-respond 1019`

代理："您想对评审 #1019 说些什么？"

用户："这个 null 检查是误报"

代理操作：
```bash
roborev comment --job 1019 "The null check was a false positive" && roborev close 1019
```
然后确认："评论已记录，评审 #1019 已关闭。"

## 另请参阅

- `/roborev-fix` — 修复评审在代码中发现的问题，然后发表评论并关闭评审