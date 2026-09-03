---
name: ralph-specum-switch
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-switch`, or explicitly asks Ralph Specum in Codex to switch the active spec.
metadata:
  surface: helper
  action: switch
---
# Ralph Specum Switch

使用此技能来切换当前活跃的 spec。

通过从 `SKILL.md` 所在目录向上解析两级父目录，从本已加载技能中推导 `RALPH_CODEX_PLUGIN_ROOT`。切勿从项目工作目录推导它。

## 契约

- 存在时读取 `.claude/ralph-specum.local.md`
- 从 frontmatter 中解析 `specs_dirs` 以发现所有 spec 根目录
- 将第一个 `specs_dirs` 条目视为默认根目录
- 默认 spec 根目录为 `./specs`
- `.current-spec` 位于默认 spec 根目录中
- 不要对有歧义的名称进行猜测

## 操作

1. 通过完整路径或确切名称解析所请求的目标。
2. 如果未提供目标，则按根目录分组列出可用的 spec。
3. 如果名称在各根目录之间存在歧义，则停止并要求提供完整路径。
4. 更新 `.current-spec`：
   - 默认根目录使用裸名称
   - 非默认根目录使用完整路径
5. 读取目标 spec 的状态，并总结阶段、进度、审批状态以及现有文件。
6. 报告原型依赖，但不对其进行修改：
   - 将缺失的 `activePrototypes` 字段视为空映射。
   - 当状态存在时，使用所选 spec 解析出的 `basePath` 运行 `"$RALPH_CODEX_PLUGIN_ROOT/scripts/prototype_records.py" select-downstream --base-path "$BASE_PATH" --state "$BASE_PATH/.ralph-state.json"`。
   - 展示 `activeBlockers` 中的每个阻塞项，包括原型 ID、状态、被阻塞的工件或转换、`returnPhase` 和 `returnTaskIndex`。
   - 展示选择结果中的 `staleArtifacts` 和 `staleTaskIndexes`。
   - 不要进行调和、移除活跃条目、编辑记录或更改阻塞项数据。如果不存在覆盖层或过时依赖，则保留现有的切换输出。
