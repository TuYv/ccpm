---
name: agent-self-scheduling
description: "Schedule AI agent runs with cron, loops, or external clocks while avoiding unsafe tight autonomous timers."
category: agent-orchestration
risk: critical
source: community
source_repo: davidondrej/skills
source_type: community
date_added: "2026-07-07"
author: davidondrej
tags: [agents, scheduling, automation, cron]
tools: [claude, codex]
license: "MIT"
license_source: "https://github.com/davidondrej/skills/blob/main/LICENSE"
---
# Agent 自我调度

## 何时使用

- 当用户请求反复执行、定时、心跳或循环式的 agent 工作时使用。
- 当你需要在 cron、外部调度器、hook 或内置 agent 调度之间做选择时使用。

第一个问题：该 agent 是否有内置调度器（Hermes → Camp B），还是由你自己掌控时钟（其余所有情况 → Camp A）？

通用底线：cron 最小粒度为 1 分钟（5 字段表达式，不含秒）——适用于所有 camp。若需亚分钟级，必须使用 `while ...; sleep N; done` 循环、TS 扩展，或事件 hook。切勿把 LLM 放在紧绷的定时器中运行。

## Camp A — 一次性 agent，由你掌控时钟

这些会运行一次后退出（除非恢复，否则是 amnesiac）。请在外部进行调度。

```bash
claude -p "PROMPT" --output-format json --allowedTools "Read,Edit,Bash"  # Claude Code
codex exec --json "PROMPT"                                                # Codex
pi run "PROMPT"                                                           # Pi
```

用时钟包裹：

```bash
# 1. cron (>= 1 min floor)
*/10 * * * * cd /path/to/project && pi run "check X and report" >> ~/agent.log 2>&1
# 2. systemd timer (Linux, survives reboot, better logging) — OnUnitActiveSec=10min
# 3. dumb loop (sub-minute, or no cron available)
while true; do pi run "check X"; sleep 30; done
```

注意事项（每项若忽略都会破坏无人值守运行）：
- **权限会永远挂起。** 传入 `--allowedTools`（Claude）或 sandbox/auto-approve 标志（Codex），否则运行会在提示阶段阻塞。
- **使用 JSON 输出**（`--output-format json` / `--json`），让包装器可确定性解析结果。
- **运行是 amnesiac。** 使用 `resume`（`codex exec resume --last`）恢复，或将状态持久化到下次运行可读取的文件中。

Pi 设计上没有内置的 scheduler/loop/heartbeat——只能依赖外部时钟（或 agent 侧计时用 TS 扩展）。

### cmux — 仅用于编排，非调度器

cmux 没有 timer/watch/cron。循环有三种方式：由 orchestrator 驱动（`send` → `sleep` → `read-screen`，基于你自己的时钟）、一个笨重的 while-sleep 包装，或——更推荐——通过 `cmux notify` + OSC 终端 hook 的事件驱动方式，这比轮询更省成本且响应更快。`read-screen` 是非干扰式的，安全轮询。

如果循环监测另一个 agent，请在每次检查时给用户发送一行状态：agent 当前在做什么、是否在正轨上。（Claude Code 在结束后可能会预填一条预测的下一条用户消息——那是 Claude，不是用户。）

## Camp B — Hermes 内置调度器

Hermes 的网关每 60 秒打点一次，并在全新隔离会话中运行到期作业。先做状态检查：

```bash
hermes gateway install            # user-level ( --system to survive reboot)
hermes cron create "every 1h" "summarize new emails and report" --skill himalaya
hermes cron create "0 9 * * *" "post daily standup"      # cron expr
hermes cron create "30m" "one-shot reminder in 30 min"   # one-shot delay
```

Hermes 独有：**zero-token 模式**（运行脚本并原样输出 stdout——用于 watchdog）、**链式调用**（`context_from` 将一个作业的输出管道到下一个）、**自终止循环**，以及**循环安全性**（计划中的会话不能再创建更多 cron job——不要在已调度作业内部再调度）。每次运行都是一个全新会话：提示词必须携带全部上下文。

## 心跳模式

一个快速的重复 tick 可以统一控制多个更慢的任务检查：该 tick 读取任务列表和每个任务的 `last_run` 时间戳，仅处理到期任务。在 Hermes 中用一个重复作业（当无任务到期时用 zero-token 模式）；在 Camp A 中用 while-sleep 循环。定义 active-hours，并在无任务到期时保持静默——不要输出空噪音。

## 在报告成功前先验证其确实触发

1. Camp A：日志文件在一个周期后增长，或手动运行一次包裹命令——输出干净 JSON，退出码 0。
2. Camp B：`hermes cron list` 显示了作业且 `next_run` 合理；触发一次 run-now 以确认已送达。
3. 确认权限/沙箱标志已就位——第一大无声失败源是权限提示挂起。
4. 心跳：确认无到期任务的 tick 保持静默。

## 限制

- 源于 `davidondrej/skills` 的改编；执行前请先确认本地路径、工具、凭据和 agent 特性。
- 对于命令执行、远程访问、调度、浏览器自动化或文件变更类流程，需取得明确用户授权，并先确认目标环境。
