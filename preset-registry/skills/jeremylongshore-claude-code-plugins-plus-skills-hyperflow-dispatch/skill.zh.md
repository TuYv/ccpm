---
name: hyperflow-dispatch
description: Hyperflow execution phase. Use when a task file exists in .hyperflow/tasks/ and the work needs building — verbs like build, implement, add, refactor, "wire up", "run the plan", "execute the task". Works batches sequentially with self-review and per-task commits. In Antigravity there is no sub-agent fan-out — the single agent does each batch itself.
---
# hyperflow-dispatch — 执行阶段（Antigravity 单代理）

执行来自 `hyperflow-plan` 的任务文件。**在 Antigravity 中不得调度子代理，也不得使用模型层级**——你需要自行完成每个批次，然后在提交前进行自我审查。遵循 `hyperflow` 准则。

## 每个批次

1. **实现**该批次中的每个子任务（按顺序执行；这些子任务已规划为小型、相互独立的单元）。
2. 根据级别检查清单对该批次的变更进行**自我审查**：
   - **L1** 语法/格式/明显错误 · **L2** 规范符合性、命名、边界情况 · **L3** 跨文件集成 + 安全性（机密、注入、验证）。
   - 当变更涉及身份验证、数据或外部输入时，提升至 L3。修复发现的所有问题后再提交。
3. 对受影响的文件运行**质量门禁**：运行项目的 lint、类型检查和测试。修复失败项（绝不能使用 `--no-verify`）。
4. **每个子任务分别提交**——一个子任务对应一个 conventional commit（遵循 commitlint：主题使用小写，使用允许的 scope）。只暂存该子任务涉及的文件；绝不要提交未由你修改的文件。
5. **更新任务文件的状态块**（勾选子任务，提升进度），并将任何持久性经验追加到 `.hyperflow/memory/`。

## 所有批次完成后

6. 对累计变更进行**最终集成自我审查**——发现跨批次矛盾、范围泄漏以及 `any`/类型回归。
7. 通过 AskUserQuestion 执行**结束门禁**：提供运行 `hyperflow-audit`（独立审查）和/或 `hyperflow-deploy` 的选项。两者均为二选一（不添加推荐标记）。绝不自动推送。

## 规则

- 一旦出现 `SECURITY_VIOLATION`，立即停止——不得提交，不得继续。
- 如果工作树中存在由其他人创建的脏文件（并发工作），绝不要暂存这些文件；每次提交前重新检查 `git status`。
- 自动模式会在提供任何总结前完成所有子任务——不得进行部分“留待恢复”的交接。