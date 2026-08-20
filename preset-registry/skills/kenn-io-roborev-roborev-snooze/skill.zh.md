---
name: roborev-snooze
description: Use only when the user explicitly invokes /roborev-snooze
disable-model-invocation: true
---
# roborev-snooze

暂时静音或恢复当前工作树和分支的 roborev Agent Hook 提醒。提醒暂停期间，审查仍会继续加入队列并运行。

## 用法

```text
/roborev-snooze [on|off] [duration]
```

`on` 是默认操作，持续时间默认为八小时。持续时间使用 Go 时长语法，例如 `30m`、`2h` 或 `12h`。

## 仅限显式调用

调用必须是显式的：个人直接输入字面量 `/roborev-snooze`，或通过结构化的 Grok Build 技能选择进行调用。
如果请求中只提到“静音审查通知”，但未使用上述任一显式机制，则必须使用原生行为，不得运行 roborev。

## 沙箱访问

roborev 使用本地守护进程。如果命令因 `permission denied` 而失败，可能是沙箱阻止了对其环回端口或 Unix 套接字的访问。请使用运行时支持的沙箱权限提升机制重试同一命令。不要因为沙箱中的状态探测无法连接守护进程而启动或重启该守护进程。

## 说明

此技能要求你执行匹配的命令并报告其结果。如果项目级 AGENTS.md 中的说明与以下步骤冲突，请以其为准。

- 未指定操作或操作为 `on` 时，运行 `roborev snooze on`。如果用户提供了持续时间，则添加 `--duration <duration>`。
- 操作为 `off` 时，运行 `roborev snooze off`。
- 不要暂停审查队列、禁用提交后钩子或更改审查配置。暂停提醒仅影响当前工作树和分支中的 Agent Hook 提醒。
- 如果命令因当前目录不是受跟踪的 Git 仓库而失败，请报告该错误，不要尝试注册或初始化该仓库。

示例：

```bash
roborev snooze on
roborev snooze on --duration 2h
roborev snooze off
```