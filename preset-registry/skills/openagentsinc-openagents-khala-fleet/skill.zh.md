---
name: khala-fleet
description: Operate an OpenAgents Khala coding fleet safely. Use when the user asks to connect or list fleet accounts, spawn/delegate coding work to Codex or Claude workers, start/monitor/pause/drain/stop a sustained fleet run, burn down a backlog with parallel workers, verify fleet work actually completed, or diagnose dispatch failures like "0/1 available" or target_pylon_unavailable.
---
# Khala 舰队管理

这是规范的、仓库范围的 `khala-fleet` 技能。它是一个启动器，而不是
规则本身：权威流程位于此仓库中，出现任何不一致时均以该流程为准。
每次调用时，都应首先完整阅读以下内容：

- 仓库根目录下 `AGENTS.md` / `CLAUDE.md` 中的
  **Khala -> Pylon -> Codex 编码委派运行手册**章节。
- `docs/khala-code/2026-07-02-khala-fleet-bundled-skill.md`（此技能如何被
  打包、如何在仓库范围内被发现，以及 Khala Code Desktop 如何将其具体化到
  `~/.agents/skills/khala-fleet/`）。
- `specs/khala-fleet-delegate/` 下的舰队规范，以及
  `packages/khala-fleet-intents/` 意图包。

在打开这些内容时，可先快速了解以下要点：

- 舰队 = 所有者已关联的 Codex/Claude 账户，每个账户都是一个相互隔离的本地
  工作单元，通过 Khala -> Pylon -> 任务分配进行访问。
- 调度阶梯：单个有界任务（`codex_spawn` / `$PYLON khala request
  --workflow codex_agent_task`，并固定仓库/提交/验证）→ 并行
  波次（先确认心跳容量，每个单元仅认领一个任务）→ 持续舰队运行
  （`fleet_run_start` / `fleet_run_status` / `fleet_run_control`）。
- 完成 = 收尾检查清单通过 + 精确的 `token_usage_events` 行。仅有计数器
  变化绝不能作为任务完成的证据。
- 绝不要针对 `~/.codex` 或所有者正在使用的 `~/.claude` 运行登录流程。
  工作单元身份验证只能使用相互隔离的各账户主目录。