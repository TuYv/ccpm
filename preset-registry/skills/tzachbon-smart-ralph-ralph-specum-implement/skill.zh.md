---
name: ralph-specum-implement
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-implement`, or explicitly asks Ralph Specum in Codex to run implementation for approved tasks, quick mode, or an explicit continue request.
metadata:
  surface: helper
  action: implement
---
# Ralph Specum Implement

你是**协调者，而非执行者**——将每个任务委派给 `spec-executor` 子智能体。

## 契约

- 通过显式路径、精确名称或 `.current-spec` 解析活动规范
- 必须存在 `tasks.md`
- 执行前从磁盘重新计算任务计数
- 仅合并状态字段
- 派发前核对原型记录，且仅阻塞依赖的工作
- 仅当所有任务均已完成、通过验证且 `activePrototypes` 为空时，才移除 `.ralph-state.json`

## 操作

1. 解析活动规范。如果不存在，则停止。
2. 必须存在 `tasks.md`。读取 `.progress.md`、当前状态以及当前任务标记。
3. 将 `tasks.md` 一次性解析为有序的顶层任务行。仅纳入位于围栏示例块之外、无缩进、且紧随其后的 token 为具体数字任务 ID、`V<number>`、`VE<number>` 或 `VF` 的复选框；排除嵌套复选框、示例复选框、完成标准以及占位符 ID。从这一份列表推导出 `total`、所有行中已完成任务的计数，以及 `next_index`——即第一个未完成行的零基位置；若无剩余未完成行则为 `total`。不要从已完成计数推导 `next_index`；非前缀式完成的情况应从最早的未完成行处恢复。
4. 在合并状态之前，先确定派发任务索引。对于全新执行，使用 `next_index`。对于原型返回，要求提供经验证的非负 `returnTaskIndex`，并验证其标识的是第一个符合条件的未完成任务。按以下内容一次性合并状态：
   - `phase: "execution"`
   - `awaitingApproval: false`
   - `totalTasks: total`
   - taskIndex：全新执行时为 `next_index`，原型返回时为经验证的 `returnTaskIndex`
   - 保留 `taskIteration`、`maxTaskIterations`、`globalIteration`、`maxGlobalIterations`、`commitSpec` 和 `relatedSpecs`
5. 派发之前，只要状态存在就运行 `prototype_records.py reconcile`；只要 `activePrototypes` 非空或存在原型历史就运行 `select-downstream`。为每个声明的当前任务路径请求 `--target execution`、`--target "task:$TASK_INDEX"` 和 `--path`。当活动阻塞项或过期输入指向当前工作，或任何匹配的 `targetDecisions` 条目并非同时满足 `proofAvailable: true` 与 `eligible: true` 时，停止。依赖证明或已批准转移证明缺失时，保守地进行阻塞。报告原型 ID，并通过 `$ralph-specum-prototype --resume <id
