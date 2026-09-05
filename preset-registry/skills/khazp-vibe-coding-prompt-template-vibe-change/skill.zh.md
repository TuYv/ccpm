---
name: vibe-change
description: Add one bounded feature to an existing app while preserving current behavior. Do not restart the full new-project workflow.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---
# Vibe 变更

在提问前检查源代码、仓库说明、当前差异、产品文档和现有检查项。只确认缺失的验收标准、约束和范围。缺少 PRD 或 AGENTS.md 不需要重新开始调研。

使用适当的已批准命令和一个现有用户旅程建立基线。保留当前工作；对于高风险变更，记录一个真实的恢复检查点。确定受影响范围最小的区域，并实现一项功能，不进行无关重写。在能够证明行为的地方添加回归检查，并重新运行受影响的检查项。

使用 `../vibe-verify/SKILL.md` 检查已变更的旅程和相关现有行为。仅在需求发生变化时更新产品决策，并在 MEMORY.md 中记录进展。报告变更内容、已检查项、未检查项、下一项决策和恢复方案。只有在确实涉及架构、安全性、成本或数据迁移决策时，才升级到更深入的规划。