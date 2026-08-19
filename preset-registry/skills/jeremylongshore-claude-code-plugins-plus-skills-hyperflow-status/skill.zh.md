---
name: hyperflow-status
description: Hyperflow project status. Use to see current hyperflow state — "what is hyperflow doing", "show task progress", "where are we". Read-only — reports in-flight tasks, memory count, and progress. Never modifies state or runs work.
---
# hyperflow-status — 只读状态（Antigravity 单代理）

在一个屏幕内查看 hyperflow 项目状态。**只读** — 绝不编辑文件或执行工作。遵循 `hyperflow` 准则。

## 步骤

1. 读取 `.hyperflow/tasks/*.md`；针对每个文件，报告状态块（进度条、已完成/总计子任务数、分支）。
2. 统计 `.hyperflow/specs/*.md` 和 `.hyperflow/audits/*.md` 的数量。
3. 统计 `.hyperflow/memory/*` 条目的数量。
4. 输出紧凑摘要：活动任务及其进度、规格/审计数量、记忆大小。若 `.hyperflow/` 不存在，说明该情况并建议使用 `hyperflow-scaffold`。

## 规则

- 绝不修改任何文件。绝不分派工作。输出为单个状态块。