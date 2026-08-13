---
name: investigate-first
description: Diagnose ambiguous failures before editing. Use for unknown causes, intermittent behavior, performance regressions, or investigations needing evidence-ranked hypotheses.
---
# 首先进行调查

在修改产品代码之前先收集证据。

- 将已观察到的症状与推断的原因分开。
- 跟踪输入、状态迁移、责任边界和失败输出。
- 按证据和低成本可证伪性对假设进行排序。
- 在出现一个能解释证据的可信机制之前，不要进行编辑。
- 当证据足以明确原因或精确阻断点时停止继续探索。

报告原因和证据。除非任务作者授权实施，否则不要进行修复。
