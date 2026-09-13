---
name: vibe-change
description: Add one bounded feature to an existing app while preserving current behavior. Do not restart the full new-project workflow.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, AskUserQuestion
---
# Vibe 变更

检查受影响的源代码、适用的仓库说明、当前差异以及相关检查。在范围或验收标准不明确时，查阅产品文档。仅确认缺失的验收标准、约束和范围。缺少 PRD 或 `AGENTS.md` 并不要求重新开始调研。

使用与变更相适应的检查建立相关基线；当行为受到影响时，使用现有的用户旅程。保留当前工作；对于高风险变更，记录一个实际的恢复检查点。确定受影响范围最小的区域，并实现一个功能，避免无关的重写。在能够体现行为的地方添加回归检查，然后重新运行受影响的检查。

使用 `../vibe-verify/SKILL.md` 检查变更涉及的用户旅程和相关现有行为。仅在需求发生变化时更新产品决策，并在 `MEMORY.md` 中记录进展。报告 Changed、Checked、Not checked、Next decision、Recovery。仅在确实涉及架构、安全性、成本或数据迁移决策时，升级为更深入的规划。