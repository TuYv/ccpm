---
name: ralph-specum-status
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-status`, or explicitly asks Ralph Specum in Codex for status or active spec progress.
metadata:
  surface: helper
  action: status
---
# Ralph Specum 状态

使用本技能报告 Ralph 在各已配置 spec 根目录下的状态。

通过从 `SKILL.md` 所在目录向上解析两级父目录，从已加载的本技能推导 `RALPH_CODEX_PLUGIN_ROOT`。绝不要从项目工作目录推导它。

## 契约

- 存在时读取 `.claude/ralph-specum.local.md`
- 默认 specs 根目录为 `./specs`
- `.current-spec` 位于默认 specs 根目录中
- 隐藏目录不计为 specs

## 操作

1. 解析已配置的根目录。
2. 读取 `.current-spec` 以识别当前活动的 spec。
   - 如果 `.current-spec` 缺失或为空，报告当前没有活动的 spec，并继续列出各根目录下的 specs。
3. 存在时读取 `specs/.current-epic` 并总结 epic 状态。
4. 对每个 spec 目录，检查以下内容：
   - `.ralph-state.json`
   - `research.md`
   - `requirements.md`
   - `design.md`
   - `tasks.md`
5. 当状态存在时，使用解析后的 spec 路径作为 `basePath`，运行 `"$RALPH_CODEX_PLUGIN_ROOT/scripts/prototype_records.py" reconcile --base-path "$BASE_PATH" --state "$BASE_PATH/.ralph-state.json"`，然后重新读取状态。解析之后绝不要构造 `specs/<name>`。
6. 按字典序盘点原型记录：
   - 读取 `activePrototypes`，将缺失字段视为空映射。
   - 列出 `prototypes/.*.candidate.md`、不可变的 `prototypes/*.md` 最终版，以及可见的或以点为前缀的 `*.quarantine.md` 文件。
   - 使用 `prototype_records.py parse` 解析候选版和最终版；将 `select-downstream` 与状态结合使用，推导阻塞项和过期依赖。
7. 如果 `tasks.md` 存在，统计已完成与未完成的任务。
8. 按 spec 根目录对结果进行分组。
9. 显示活动的 spec、当前阶段、backlog 状态、审批状态、粒度（若存在），以及存在哪些工件。

## 输出

- 默认根目录中的 specs 可按名称显示。
- 其他根目录中的 specs 应包含根目录后缀以消除歧义。
- 在显而易见时，包含下一个可能的命令。
- 如果存在活动的 epic，包含下一个未被阻塞的 spec。
- 如果审批待定，明确告知用户批准当前工件、请求修改，或继续进入所指明的下一步。
- 当存在原型数据时，报告活动条目、候选版、不可变最终版和隔离项的数量及确定性行。包含原型 ID、生命周期状态或判定结果、阻塞目标、`returnPhase`、`returnTaskIndex`、`sourceDisposition` 或源指针、门禁审批，以及隔离原因。
- 包含推导出的 `activeBlockers`、`staleArtifacts` 和 `staleTaskIndexes`。当所有 overlay 计数均为零时，省略原型部分，以使旧版输出保持不变。
