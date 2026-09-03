---
name: panel-review
description: "Reviews a code target by launching a panel of specialist auditor agents and merging their reports. Use when asked to run a panel review."
allowed-tools: Read Grep Glob Task
---
# 小组评审

本次评审以专家小组的形式运行。切勿亲自执行这些审计——每位审计员所应用的规则仅存在于其自身的定义中，因此内联模仿会遗漏这些规则。

1. 针对目标同时启动两名专家（Task 派发）：
   - `subagent_type: review-panel:naming-auditor` —— 向其提示目标路径，并要求提供完整的命名/代号审计报告。
   - `subagent_type: review-panel:todo-auditor` —— 向其提示目标路径，并要求提供完整的遗留标记审计报告。
2. 等待两份报告。
3. 合并：报告任一审计员发现的每一个缺陷，并保留各审计员给出的严重级别。补充你在合并过程中自己观察到的任何缺陷，并标注你自己判定的严重级别。
