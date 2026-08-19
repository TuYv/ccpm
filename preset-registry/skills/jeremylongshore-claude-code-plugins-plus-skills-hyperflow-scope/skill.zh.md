---
name: hyperflow-scope
description: Hyperflow planning phase. Use when a task is clear enough to decompose into batched steps before writing code — verbs like scope, decompose, "plan out", "break down", "plan this". Read-only with respect to source; writes a task file to .hyperflow/tasks/<slug>.md, then hands off to hyperflow-dispatch.
---
# hyperflow-scope — 分解阶段（Antigravity 单智能体）

进行分解，不要构建。唯一允许写入的是 `.hyperflow/`。遵循 `hyperflow` 规范。

## 步骤

1. **研究**受影响的范围（需要读取/修改/创建的文件、约定、测试模式）。如果请求实际上是一个设计问题，则转到 `hyperflow-spec` 并停止。
2. **生成批次图**。按拓扑顺序排列批次；每个子任务 = 一个可以用单条 conventional-commit subject 命名的连贯变更。**拆分任何**涉及超过 5 个文件、超过 500 行代码、跨越 2 个以上子系统，或审阅者需要超过 10 分钟才能理解的子任务。
3. **编写 `.hyperflow/tasks/<slug>.md`**，包含：状态表（进度、分支、提交节奏）→ 目标 → 原因 → 范围概览表 → 受影响文件（创建/修改）→ 执行计划（批次图）→ 批次（每个子任务包含角色、文件、复杂度、验收标准、提交消息存根）→ 验证计划。
4. **打印**一行摘要：`Plan ready — .hyperflow/tasks/<slug>.md (N batches, M sub-tasks)`。
5. **交接**：调用 `hyperflow-dispatch` 技能，并传入任务 slug。

## 规则

- 不得编写实现代码；不得修改源文件。
- 对于多文件工作，单批次计划是不良模式——请进行分解。
- 始终包含具体的验证计划。