---
name: background
description: |
  Use when the user wants to see, inspect, cancel, or prune background agents fired during prior chain runs. Read/manage `.hyperflow/background/registry.json` and the per-agent output buffers at `.hyperflow/background/<id>.md`. Standalone — never auto-invoked.
  Trigger with /hyperflow:background, "list background agents", "what's running in background", "cancel background agent", "show background result".
allowed-tools: Read, Write, Edit, Bash(ls:*), Bash(cat:*), Bash(rm:*), Bash(find:*), Glob, Grep
argument-hint: "<list|show|cancel|prune> [id|--all]"
version: 4.7.0
license: MIT
compatibility: Designed for Claude Code
tags: [background, orchestration, lifecycle]
---
# 背景

默认只读的管理界面，用于管理由其他 hyperflow skill 启动的后台代理（调度质量门禁、部署 CI 监控器、脚手架分析刷新、缓存压缩、范围推测性预取）。从 `.hyperflow/background/registry.json` 和各代理的输出缓冲区读取。

完整规范：[background-agents.md](../hyperflow/background-agents.md)。

## 子命令

| 子命令 | 描述 |
|---|---|
| `list` | 打印注册表：进行中 · 已完成未收集 · 已停滞 · 出错 |
| `show <id>` | 打印单个代理的输出缓冲区（`.hyperflow/background/<id>.md`） |
| `cancel <id>` | 取消一个指定的进行中代理 |
| `cancel --all` | 取消所有进行中的代理（关闭会话前使用） |
| `prune` | 删除超过 7 天的已完成 `.hyperflow/background/<id>.md` 文件 |

未提供子命令时的默认子命令：`list`。

## 子命令详情

### `list`

读取 `.hyperflow/background/registry.json`。按状态对条目分组，并打印一个紧凑表格：

```markdown
## In flight (N)

| ID                                | Purpose                              | Fired      | Timeout | Blocks  |
|-----------------------------------|--------------------------------------|------------|---------|---------|
| `bg-1718049600-quality-gates-b2`  | Layer 5 gates Batch 2                | 17:30      | 18:00   | step3   |
| `bg-1718049820-ci-watcher`        | GitHub Actions watch for v4.7.0      | 17:33      | 18:33   | —       |

## Completed (uncollected, N)

| ID                                | Purpose                              | Completed  | Duration | Output |
|-----------------------------------|--------------------------------------|------------|----------|--------|
| `bg-1718045400-scaffold-refresh`  | Refresh .hyperflow/architecture.md   | 16:42      | 2m 18s   | 1.4kb  |

## Stalled / Errored (N)

| ID                                | Purpose                              | Status            | Reason            |
|-----------------------------------|--------------------------------------|-------------------|-------------------|
| `bg-1717980000-cache-compact`     | Compact learnings.md                 | STALLED           | timeout (30m)     |
```

打印一行收尾内容：`<count> in flight · <count> uncollected · <count> needs attention`。如果注册表为空，打印 `No background agents.` 并停止。

### `show <id>`

读取 `.hyperflow/background/<id>.md` 并逐字打印。如果代理仍在运行，先打印注册表条目，然后打印 `Output buffer not yet written.` 并停止。

### `cancel <id>`

1. 读取注册表，找到对应条目。
2. 如果 `status: running`，则通过提供方的机制发送取消信号（Claude Code：针对该子代理 ID 使用运行时的取消 API；如果不可用，则将条目标记为 `status: cancelled`，并让代理自行超时——前台编排器会在收集时丢弃结果）。
3. 更新注册表条目：`status: cancelled`、`cancelled_at: <now>`。
4. 打印 `Cancelled <id> — <purpose>`。

如果代理已完成，打印 `Agent <id> already <status> — nothing to cancel.`

### `cancel --all`

对于每个 `status: running` 的条目，执行 `cancel` 流程。打印汇总：`Cancelled N agents.`

### `prune`

`find .hyperflow/background/ -name "bg-*.md" -mtime +7 -delete`，并从 `registry.json` 中移除其条目（仅清理超过 7 天且 `status: complete | error | stalled | cancelled` 的条目）。打印：`Pruned N output buffers · N registry entries`.

## 流程

1. 从调用中解析子命令（默认为 `list`）。
2. 读取 `.hyperflow/background/registry.json`（若不存在，则视为空）。
3. 执行子命令。
4. 打印结果。

## 概述

`/hyperflow:background` 是面向用户的后台代理读取/管理界面。编排器本身会作为其他技能中 `run_in_background: true` Agent 调度的副作用来维护注册表——此技能绝不*启动*后台代理，只读取/管理注册表。

## 前提条件

- `.hyperflow/background/registry.json` 存在（由任何其他技能首次后台调度时创建——若不存在，所有子命令都会优雅降级）。
- `.hyperflow/` 已初始化（若缺失，请运行 `/hyperflow:scaffold`——尽管此技能即使没有 scaffold 也能工作，因为注册表会按需创建）。

## 说明

参见 [子命令](#subcommands) 和 [子命令详情](#subcommand-details)。摘要：

1. 解析子命令（未提供时默认为 `list`）。
2. 从 `.hyperflow/background/registry.json` 读取注册表。
3. 针对注册表和每个代理的输出缓冲区执行子命令。
4. 打印简洁结果；不要修改任何源代码。

## 输出

- `list` — 正在运行 / 已完成但未收集 / 停滞+出错的表格，以及一行结尾汇总。
- `show <id>` — `.hyperflow/background/<id>.md` 的文件内容。
- `cancel <id>` / `cancel --all` — 每个已取消代理的一行确认信息，以及总数。
- `prune` — 已清理的缓冲区和注册表条目数量。

## 错误处理

| 失败情况 | 行为 |
|---|---|
| 注册表文件缺失 | 视为空——`list` 打印 `No background agents.`；其他子命令打印 `No registry — fire a background agent first.` 并停止。 |
| 注册表 JSON 格式错误 | 打印 `Registry malformed — back up to .hyperflow/background/registry.json.bak and re-create empty.` 移动文件，写入空注册表，然后继续。 |
| 对未知 id 执行 `show <id>` | 按 Levenshtein 距离列出最接近的 3 个 ID。 |
| 对已完成的代理执行 `cancel <id>` | 打印 `Agent <id> already <status> — nothing to cancel.` |
| Provider 取消 API 不可用 | 在注册表中将条目标记为 `status: cancelled`；前台编排器会在收集时丢弃结果。打印 `Marked <id> as cancelled (provider has no live cancellation API — agent will run to completion or timeout, but result will be discarded).` |
| 没有符合条件的条目时调用 Prune | 打印 `Nothing to prune — no completed buffers older than 7 days.` |

## 示例

### 列出正在运行和已完成的后台代理

```
/hyperflow:background list

## In flight (1)
| ID                                | Purpose                              | Fired | Timeout | Blocks |
|-----------------------------------|--------------------------------------|-------|---------|--------|
| `bg-1718049600-quality-gates-b2`  | Layer 5 gates Batch 2                | 17:30 | 18:00   | step3  |

## Completed (uncollected, 1)
| ID                                | Purpose                              | Completed | Duration | Output |
|-----------------------------------|--------------------------------------|-----------|----------|--------|
| `bg-1718045400-scaffold-refresh`  | Refresh .hyperflow/architecture.md   | 16:42     | 2m 18s   | 1.4kb  |

1 in flight · 1 uncollected · 0 needs attention
```

### 显示已完成代理的输出

```
/hyperflow:background show bg-1718045400-scaffold-refresh

# Background Result — Refresh .hyperflow/architecture.md

| Field      | Value                                |
|------------|--------------------------------------|
| Agent ID   | `bg-1718045400-scaffold-refresh`     |
| Fired at   | 2026-05-16T16:40:00Z                 |
| Completed  | 2026-05-16T16:42:18Z (2m 18s)        |
| Status     | complete                             |
| Tokens     | worker 4.2k                          |

## Output
<refreshed architecture.md content fragments + diff summary>
```

### 在关闭会话前取消所有任务

```
/hyperflow:background cancel --all

Cancelled bg-1718049600-quality-gates-b2 — Layer 5 gates Batch 2
Cancelled bg-1718049820-ci-watcher — GitHub Actions watch for v4.7.0
Cancelled 2 agents.
```

## 资源

- [background-agents.md](../hyperflow/background-agents.md) — 完整规范：何时使用、硬性规则、注册表结构、失败模式、反模式。
- [DOCTRINE.md](../hyperflow/DOCTRINE.md) — 规则 8（后台扩展）、规则 9（不使用 AI 归属的后台提交）。
- [output-style.md](../hyperflow/output-style.md) — `list` 输出的表格约定。