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
# Agent 自调度

## 何时使用

- 当用户要求重复执行、定期执行、心跳或循环执行的代理任务时使用。
- 当你需要在 cron、外部调度器、钩子，或内置代理调度之间做选择时使用。

第一个问题：该代理是否具备内置调度器（Hermes → Camp B），还是你自己掌控时钟（其他所有情况 → Camp A）？

统一底线：cron 最小间隔为 1 分钟（5 字段表达式，无秒）—所有 camp 通用。若需低于 1 分钟的粒度，必须使用 `while ...; sleep N; done` 循环、TS 扩展，或事件钩子。切勿将 LLM 放进紧凑定时器中。

## Camp A — 一次性代理，时钟由你掌控

这些任务运行一次后退出（未恢复则遗忘记忆）。请使用外部方式调度。

```bash
claude -p "PROMPT" --output-format json --allowedTools "Read,Edit,Bash"  # Claude Code
codex exec --json "PROMPT"                                                # Codex
pi run "PROMPT"                                                           # Pi
```

将其包在时钟机制中：

```bash
# 1. cron (>= 1 min floor)
*/10 * * * * cd /path/to/project && pi run "check X and report" >> ~/agent.log 2>&1
# 2. systemd timer (Linux, survives reboot, better logging) — OnUnitActiveSec=10min
# 3. dumb loop (sub-minute, or no cron available)
while true; do pi run "check X"; sleep 30; done
```

注意事项（每项若被忽略都会中断无人值守运行）：
- **权限可能永远挂起。** 传入 `--allowedTools`（Claude）或 sandbox/auto-approve 标志（Codex），否则运行会在提示符处阻塞。
- **使用 JSON 输出**（`--output-format json` / `--json`），以便 wrapper 能确定性解析结果。
- **运行是遗忘式的。** 使用 `codex exec resume --last` 恢复，或将状态持久化到文件供下次运行读取。

按设计 Pi 不具备内置调度器/循环/心跳功能—只能依赖外部时钟（或在代理端使用 TS 扩展实现定时器）。

### cmux — 仅负责编排，不具备调度器

cmux 没有 timer/watch/cron。循环它有三种方式：在你自己的时钟上由 orchestrator 驱动（`send` → `sleep` → `read-screen`）、一个简单 while-sleep 包装，或——更推荐的——通过 `cmux notify` + OSC terminal hooks 的事件驱动方式，这比轮询更省资源且更及时。`read-screen` 是非打断式的，适合轮询。

如果一个循环在检查其他代理，请在每次检查时给用户发送一行状态：当前代理在做什么、是否在轨。Claude Code 在完成后可能会预填一条预测的下一条用户消息——那是 Claude，不是用户。

## Camp B — Hermes 内置调度器

Hermes 的网关每 60 秒跳一次，并在新建的隔离会话中运行到期任务。先检查状态：

```bash
hermes gateway install            # user-level ( --system to survive reboot)
hermes cron create "every 1h" "summarize new emails and report" --skill himalaya
hermes cron create "0 9 * * *" "post daily standup"      # cron expr
hermes cron create "30m" "one-shot reminder in 30 min"   # one-shot delay
```

Hermes 独有：**零 token 模式**（运行脚本并原样输出 stdout—适用于看门狗）、**链式执行**（`context_from` 将一个任务的输出管道到下一个）、**自终止循环**，以及**循环安全性**（计划中的会话不能再创建更多 cron 任务——不要在已调度任务内再调度）。每次运行都是全新会话：提示词必须携带全部上下文。

## 心跳模式

一个快速的周期性 tick 统一驱动多个更慢的任务级检查：tick 会读取任务列表和各任务的 `last_run` 时间戳，只对到期任务执行操作。在 Hermes 中使用周期任务（无任务到期时使用零 token 模式）；在 Camp A 中使用 while-sleep 循环。定义活跃时间段，并在无任务到期时保持静默—不要输出空噪音。

## 验证其是否触发（在声明成功前）

1. Camp A：日志文件在一个间隔后增长，或手动执行一次包装命令—得到干净的 JSON 且退出码为 0。
2. Camp B：`hermes cron list` 显示任务且 `next_run` 合理；触发一次立即运行以确认投递成功。
3. 确认权限/sandbox 标志已设置——第一大静默失败原因通常是挂起的权限提示。
4. 心跳：确认无任务到期时的 tick 保持静默。

## 限制

- 改编自 `davidondrej/skills`；在执行前请先核验本地路径、工具、凭据和代理能力。
- 对于命令、远程访问、调度、浏览器自动化或会更改文件的工作流，请先获取用户明确许可，并先确认目标环境。
