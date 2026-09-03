---
name: reflect
description: Per-project self-improvement - reads the .harness ledger and feedback memories, then proposes gated rule/threshold/ADR changes so the project stops repeating mistakes. Run periodically.
user_invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
---
# Reflect：项目级自我改进

你正在执行一次反思——把本项目捕获的信号转化为持久的改进。未经开发者批准，任何改动都不会被应用。

## 阶段 1 - 定向（收集信号）

- 在账本上运行统计脚本：
  `~/.claude/hooks/harness-ledger-stats.sh --ledger .harness/ledger.jsonl --min-recurr 3`
  如果该路径不存在，说明 hooks 未安装在 `~/.claude/hooks/`——改从本项目存放它们的位置运行那份副本。如果脚本输出全为零，说明还没有账本（未捕获任何信号）——停止；没有可反思的内容。
- 阅读 `CLAUDE.md` 中的当前项目规则，这样你是在改进它们而不是重复。
- 阅读近期的 `feedback` 类型 memory 文件——这些是开发者的显式纠正，是价值最高的信号。先定位 memory 目录（它与 `MEMORY.md` 在同一目录；不确定时用 `find . -name MEMORY.md`），然后执行 `grep -l 'type: feedback' <memory-dir>/*.md`。
- 阅读最近一份 `.harness/reflections/*.md` 报告（如果有），以回顾上一次的指标快照以及已经做过哪些改动。

## 阶段 2 - 聚类

根据统计输出和反馈 memory，识别反复出现的问题：
- 每一行 `recurring <rule> <prefix> <count>` 都是一个摩擦聚类——同一种检查在同一区域反复触发。
- 将相关的反馈纠正按主题分组。
- 忽略一次性事件；专注于重复出现的内容。

## 阶段 3 - 提议（每个聚类一个候选方案）

为每个聚类起草恰好一项拟议改动，并选择合适的类型：

| 类型 | 适用情形 | 落点 |
|------|------|----------------|
| **项目规则** | 一条约定可以阻止该重复 | 追加到 `CLAUDE.md` 的项目特定小节 |
| **阈值调整** | 某个护栏过严/过松 | 对 `.claude/settings.json` 或该 hook 的 diff——**只展示，绝不自动应用** |
| **Lint 规则** | 该错误可被机械地捕获 | 对 `eslint.config.mjs` / `biome.jsonc` 的 diff |
| **ADR / 知识** | 值得留存的持久“为什么” | 一个新的 memory 文件或 `docs/adr/` 笔记 |

将所有提案一并以编号列表形式呈现，并为每项附上具体改动。

## 阶段 4 - 把关与记录

- 请开发者对每项提案进行批准、修改或拒绝（类似 `/remember`）。
- 只应用获批的提案，然后提交它们（使用 `/commit`）。
- 如有需要，创建 `.harness/reflections/`（`mkdir -p .harness/reflections`），然后向 `.harness/reflections/YYYY-MM-DD.md` 写入一份反思报告，内容包括：
  - 完整的统计输出（即**指标快照**，供下次反思对比），
  - 你发现的聚类，
  - 哪些提案被批准/拒绝以及原因。

报告会被提交；原始的 `.harness/ledger.jsonl` 保持被 gitignore。信号是私有的；智慧是共享的。

## 衡量成效

核心指标是统计输出中的 `recurring_events`。将它与上一份反思报告中的值进行比较。如果你上次推行的规则起了作用，它针对的聚类应该已经缩小。在新报告中明确记录这一趋势。
