---
name: ralph-specum-cancel
description: This skill should be used only when the user explicitly asks to use `$ralph-specum-cancel`, or explicitly asks Ralph Specum in Codex to stop execution or remove a spec.
metadata:
  surface: helper
  action: cancel
---
# Ralph Specum Cancel

使用此技能可安全地停止执行，并有选择地移除某个 spec。安全取消会保留该 spec 以及每个原型的源路径。

从本已加载技能中派生 `RALPH_CODEX_PLUGIN_ROOT`：从 `SKILL.md` 所在目录向上解析两级父目录。切勿从项目工作目录派生。

## Contract

- 通过显式路径、精确名称或 `.current-spec` 解析目标
- 将缺失的 `activePrototypes` 字段视为空映射
- 在移除活动状态之前发布经过审查的不可变取消证据
- 在任何删除操作前确认精确的本地目标
- 永不删除远程分支或执行任何其他远程操作
- 对含糊不清的名称不做猜测

## Action

1. 解析目标 spec。如果不存在，报告没有可取消的内容。
2. 读取 `.ralph-state.json`（如果存在），并总结当前阶段和进度。
3. 如果 `activePrototypes` 非空，使用解析出的 `basePath`，在取消之前运行 `"$RALPH_CODEX_PLUGIN_ROOT/scripts/prototype_records.py" reconcile`。在下一个安全工具边界处，按 `created` 字段、再按 ID 的顺序处理活动 ID。
4. 对于每个活动原型：
   - 检查其 `owner`、`leaseToken` 和 `harnessRun.id`。当 `owner` 和 `leaseToken` 均为 null 或缺失时，验证 `harnessRun.id` 也为 null 或缺失且没有关联的 builder，然后跳过中断和释放并继续取消。如果这些字段不一致，将该条目视为 builder 所有权不一致：保留租约和活动条目，并停止处理该 ID。否则，仅通过受限 harness 契约中断其已记录的子 builder。仅在 harness 验证已记录的 builder 及其后代均已停止后，才通过 `locked_state.py release-lease --id <id> --lease-token <leaseToken>` 释放。如果中断不可用或未经验证，或报告了任何失败的终止尝试，则保留租约和活动条目并停止对该 ID 的取消。
   - 保留其问题、阻碍、返回阶段和任务、时间戳、本地分支、隔离指针、部分实现、运行证据、过期元数据以及下游产物。
   - 渲染一个专属的终结候选项，其 `verdict: cancelled`、`gateApproved: false`、`sourceDisposition: retained`。永不覆盖已有的候选或最终字节；发生冲突时分配一个新的发布 ID，并带有 `supersedes: ["<original-id>"]`。
   - 在审查之前，存储确切返回的 `candidateHash`。通过比较并交换的 `transition` 更新已有的原始条目，或通过仅创建的 `locked_state.py upsert-prototype` 预留一个单独的取代 ID，并带上复制的恢复字段和确切的 `candidateHash`。在取代记录接受审查期间，保持原始活动条目不变。预留冲突会同时保留两个条目和候选项，并分配另一个 ID。
   - 将确切的候选字节和源指针发送给审查者。仅在 `REVIEW_PASS` 之后继续，然后使用该发布 ID 和确切的候选哈希调用 `review-candidate` 和 `publish`。
   - 重新读取并解析不可变的最终记录并验证其哈希。发布会移除其自身的活动发布条目。当使用了取代 ID 时，仅在最终验证成功后才移除原始活动条目；在此之前任何失败都会保留该条目。进行 reconcile，然后通过 `locked_state.py` 恢复已记录的主阶段和任务索引，不改动无关状态。
5. 安全取消是默认行为。在每个活动原型都拥有经验证的不可变 `cancelled` 记录之后，仅通过 `locked_state.py delete-state` 删除 `.ralph-state.json`。保留 spec 目录、`.current-spec`、终结记录、原型源码、部分工作、暂存路径、worktree 和本地分支。
6. 如果明确请求完全移除，展示已解析的 spec 目录以及每个原型的隔离路径和分支。在移除之前要求确认中指明确切的 spec 目录。原型路径和本地分支需要单独的精确确认，且永不包含在递归 spec 清理中。永不删除远程分支。
7. 如果不存在状态，报告没有活动循环，且除非确切的完全移除确认已完成，否则不进行任何删除。
8. 保留活动的 epic 文件，除非用户单独请求移除它们。准确报告删除了什么、保留了什么。
