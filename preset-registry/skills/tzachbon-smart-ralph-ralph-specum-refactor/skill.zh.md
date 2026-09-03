---
name: ralph-specum-refactor
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-refactor`, or explicitly asks Ralph Specum in Codex to revise spec artifacts after implementation learnings.
metadata:
  surface: helper
  action: refactor
---
# Ralph 规格重构

你是**协调者，而非重构专家**——将规格修订委托给 `refactor-specialist` 子代理。

## 契约

- 通过显式路径、精确名称或 `.current-spec` 解析当前活跃的规格
- 按顺序审查文件：`requirements.md`、`design.md`、`tasks.md`
- 当上游内容发生变化时，级联更新下游内容
- 调和 `activePrototypes` 并保留无关的重构工作

## 行动

1. 解析目标规格。
2. 读取 `.progress.md` 和现有的规格文件。
3. 只要 `.ralph-state.json` 存在就运行 `prototype_records.py reconcile`，包括 `activePrototypes` 为空的情况，然后使用已解析的 `basePath` 运行 `select-downstream --state "$BASE_PATH/.ralph-state.json" --target "$FILE" --path "$FILE"`。当某个文件的 `targetDecisions` 条目不同时满足 `proofAvailable: true` 和 `eligible: true` 时，停止该文件的重构——包括存在活跃阻塞项、过期依赖、已批准转移的重叠或证明不可用等情况。
4. 当重构恢复执行时，在分派前通过 `merge_state.py` 从阻塞条目的 `returnTaskIndex` 恢复 `taskIndex`。
5. 将规格修订**委托**给 `refactor-specialist` 子代理。传入 `.progress.md`、现有规格文件以及实现过程中的经验心得。子代理负责识别哪些内容发生了变化、哪些仍然准确、哪些已经过时。切勿亲自修订规格文件。
6. 在相关情况下，子代理会保留规格中已表达的较新的 Ralph 概念，包括批准检查点、粒度选择、`[P]` 任务、`[VERIFY]` 任务、VE 任务以及 epic 约束。
7. 子代理按以下顺序更新文件：
   - `requirements.md`
   - `design.md`
   - `tasks.md`
8. 如果需求发生了变化，重新审视设计与任务。
9. 如果设计发生了变化，重新审视任务。
10. 在 `.progress.md` 中记录理由与级联决策。

## 响应交接

- 修订规格文件后，指出发生变化的文件，并简要总结更新内容。
- 以恰好一个明确的选项提示结尾：
  - `approve current artifact`
  - `request changes`
  - `continue to implementation`
- 将 `continue to implementation` 视为对更新后规格文件的批准。
