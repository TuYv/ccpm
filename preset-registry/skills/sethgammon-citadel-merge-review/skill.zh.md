---
name: merge-review
license: MIT
description: >-
  Reviews pending fleet worktree merges before they're accepted. Reads the
  merge-check queue, detects file-level conflicts between branches, proposes a
  safe merge order, and surfaces reconciliation plans for overlapping changes.
user-invocable: true
auto-trigger: false
trigger_keywords:
  - merge review
  - check merges
  - any conflicts
  - fleet conflicts
  - pending branches
  - safe to merge
last-updated: 2026-03-26
---
# /merge-review — Fleet 合并仲裁

## 定位

**使用时机：** 在接受待处理的 fleet worktree 合并进入主分支之前对其进行审查。
**不使用时机：** 审查一般代码质量（使用 /review）；合并前检查 CI 状态（使用 /pr-watch）。

## 何时路由到这里

- “check merges”
- “any conflicts”
- “what do the fleet agents want to merge”
- “review the pending branches”
- “is it safe to merge fleet output”
- “arbitrate the worktrees”
- worktree-remove.js 中有已排队的条目且用户想要处理它们

## 调用形式

```
/merge-review              # Process the full queue
/merge-review {branch}     # Review a specific branch only
```

## 协议

### 第 1 步：读取队列

读取 `.planning/telemetry/merge-check-queue.jsonl`。每一行都是一个 JSON 对象：
```json
{"branch": "fleet/task-abc", "worktree": "/path/to/worktree", "queuedAt": "ISO"}
```

如果该文件不存在或为空：
> “没有待处理的合并审查。Fleet agent 最近没有完成任何 worktree。”
到此为止。

如果通过指定分支调用（`/merge-review {branch}`）：仅过滤到该分支。

### 第 2 步：对每个分支——收集 diff 数据

运行 `git diff main..{branch} --name-only`、`--stat` 以及 `git branch --list {branch}`。

如果分支已不存在：标记 `status: "merged"`，注明“可能已被合并。已跳过。”，继续。

### 第 3 步：检测重叠文件

两两比较变更文件集合。对于共享文件的每一对分支，读取双方的 `git diff main..{branch} -- {file}` 并分类：
- **加性（Additive）**：双方都向该文件新增内容（低风险，很可能可自动合并）
- **重叠编辑**：双方修改了同一函数/区段（中风险）
- **矛盾**：一方新增、另一方删除同一段代码（高风险）

### 第 4 步：评估每个分支的风险

对每个分支：
- **low** —— 与其他分支没有重叠文件
- **medium** —— 存在重叠，但变更看起来是加性的，或位于不同区段
- **high** —— 重叠发生在同一函数、类或紧密耦合的区段中

### 第 5 步：提出合并顺序

对分支排序：冲突最少的在前，冲突最多的在后。

如果存在循环依赖（A 与 B 冲突，B 与 C 冲突，C 与 A 冲突）：上报给用户——不要提出一个不可能实现的顺序。

### 第 6 步：输出报告

```
## Merge Review: {N} branch(es) pending

### Branch: {name}
Files changed: {N}
Overlap with other branches: {branch-X} ({file-list}) | none
Risk: low | medium | high
Recommendation: merge | review-first | resolve-conflict

---
[repeat for each branch]
---

### Conflicts Detected

{branch-A} and {branch-B} both modified:
  - {file}: {brief description — e.g., "A adds export, B removes same export"}
Recommended resolution: {which change to keep, or how to combine them}

[repeat for each conflict pair]

### Proposed Merge Order

1. {branch} — no conflicts, safe to merge first
2. {branch} — depends on #1; review {file} after merging #1
3. {branch} — manual conflict resolution needed in {file} before merging

### Summary
Branches ready to merge: {N}
Branches needing review: {N}
Branches with hard conflicts: {N}
```

如果所有分支都无冲突：
```
## Merge Review: {N} branch(es) pending — No conflicts detected

All branches can be merged in any order. Recommended order (by change size, smallest first):
1. {branch} — {N} files
2. {branch} — {N} files
```

### 第 7 步：更新队列

生成报告后，在队列中标记已审查的条目：
- 仍需处理的分支：`status: "reviewed"`，添加 `reviewedAt` 时间戳
- 已不存在的分支：`status: "merged"`（已在第 2 步中处理）

将更新后的队列写回 `.planning/telemetry/merge-check-queue.jsonl`。

### 第 8 步：清理已合并的 worktree

运行 `git worktree list --porcelain`。对每个非主 worktree：检查 `git branch --merged HEAD`。如果已合并且干净：运行 `git worktree remove "{path}" --force` 和 `git branch -d "{branch}"`。无需用户确认。报告数量：“已清理 {N} 个已合并的 worktree：{branch-names}”。

---

## 边缘情况

**队列为空：** 输出“没有待处理的合并审查。”并停止。

**分支已不存在：** 从队列中移除，注明情况，继续。

**分支不在队列中：** 注明“不在合并队列中”，并建议运行 `/merge-review` 查看全部。

**所有分支互相冲突（循环）：** 列出所有冲突；不要提出顺序；上报给用户。

**只有一个分支待处理：** 跳过冲突检测；输出单分支审查（文件、统计、建议）。

**大型 diff（>500 行）：** 概述变更区域；提供 `git diff` 命令以查看详情。

**worktree 路径缺失但分支存在：** 使用分支名进行 git diff；不要求 worktree 存在。

---

## 集成点

- **worktree-remove.js** —— 当某个 fleet worktree 完成时，将条目排入 `.planning/telemetry/merge-check-queue.jsonl`
- **fleet skill** —— 在 fleet agent 完成后、合并到 main 之前，运行 `/merge-review`
- **session-end.js** —— 如果会话结束时合并队列中仍有条目，可能会给出提醒

## 情境门控

**披露：** “正在审查待处理的 fleet worktree 合并。只读——不应用任何更改。”
**可逆性：** 绿色 —— 只读审查；不合并或修改任何文件
**信任门控：**
- 任意：查看合并审查报告与建议

## 质量门控

- 绝不合并分支——只进行分析和建议
- 处理后始终更新队列（标记 reviewed/merged）
- 始终为每个分支给出具体建议（merge / review-first / resolve-conflict）
- 如果分支已被合并，将其从队列中清除而不报错
- 如果所有冲突都是循环的/无法解决的，应清晰上报，而不是提出一个不可能实现的顺序

## 退出协议

/merge-review 不产生 HANDOFF 块。它输出合并报告（第 6 步），然后等待下一条用户命令。

报告之后，根据发现的情况建议后续行动：
- 如果所有分支都安全：“一切正常。按上述顺序合并。”
- 如果存在冲突：“先解决被标记的冲突再合并。解决之后再次运行 `/merge-review`。”
- 如果队列为空：“队列为空。没有可审查的内容。”
