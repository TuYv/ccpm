---
name: memory-defrag
description: "Defragment and reorganize agent memory files: split bloated files, merge duplicates, remove stale information, and restructure the memory hierarchy. Use when memory files have grown unwieldy, contain redundancies, or need reorganization. Run periodically (weekly) or on demand."
---
# 内存碎片整理

重新组织内存文件，以提高其清晰度、效率和相关性。类似文件系统碎片整理，但处理的是知识。

## 何时运行

- **定期运行**：建议通过 cron 每周或每两周运行一次
- **按需运行**：用户要求清理、重新组织内存或整理内存碎片时
- **达到阈值时**：当 MEMORY.md 超过约 500 行，或每日笔记不断累积却未整合时

## 流程

### 1. 审查当前状态

清点所有内存文件：
```
MEMORY.md           — long-term memory
memory/             — daily notes, tasks, topical files
memory/tasks/       — active and completed tasks
```

对于每个文件，记录：行数、最后修改时间、涵盖的主题以及陈旧程度。

### 2. 识别问题

检查以下常见问题：

| 问题 | 判断信号 | 解决方法 |
|---------|--------|-----|
| **文件臃肿** | 超过 300 行，涵盖多个主题 | 拆分为聚焦于不同主题的文件 |
| **信息重复** | 同一事实出现在多个位置 | 整合至一个位置 |
| **条目陈旧** | 涉及已完成的工作、过时的日期或已解决的问题 | 删除或归档 |
| **孤立文件** | `memory/` 中的文件从未被引用或更新 | 审查、合并或删除 |
| **信息不一致** | 不同文件中的信息相互矛盾 | 依据真实情况解决冲突 |
| **组织不佳** | 相关信息散落在多个文件中 | 按主题重新组织 |
| **递归嵌套** | 存在 `memory/memory/memory/...` 目录 | 删除嵌套目录（索引器错误产生的残留） |

### 3. 规划变更

编辑前，编写一份简短的计划：
```markdown
## Defrag Plan
- [ ] Split MEMORY.md "Key People" section → memory/people.md
- [ ] Remove completed tasks older than 30 days from memory/tasks/
- [ ] Merge memory/bm-marketing-ideas.md into memory/competitive/
- [ ] Update stale project status entries in MEMORY.md
```

### 4. 执行

逐项应用变更：
- **拆分**：从大型文件中提取各个部分，放入聚焦于特定主题的文件
- **合并**：将相关的小文件合并为结构连贯的文档
- **精简**：删除不再相关或不准确的信息
- **重组**：将文件移动到适当的目录，并进行重命名以提高辨识度
- **更新**：修正过时的事实、日期和状态

### 5. 验证并记录

完成变更后：
- 验证没有信息丢失（对比变更前后的内容）
- 更新文件之间的所有交叉引用
- 在当天的每日笔记中记录所做的工作：

```markdown
## Memory Defrag (HH:MM)
- Files reviewed: N
- Split: [list]
- Merged: [list]
- Pruned: [list]
- Net result: X files, Y total lines (was Z lines)
```

## 指南

- **保留原始每日笔记。** 不要删除或修改 `memory/YYYY-MM-DD.md` 文件——它们是审计记录。
- **以 15 至 25 个主题明确的文件为目标。** 文件太少意味着文件会变得臃肿；太多则意味着内容过于分散。应力求达到最佳平衡。
- **文件名应便于快速浏览。** 使用描述性名称：`people.md`、`project-status.md`、`competitive-landscape.md`——不要使用 `notes-2.md`。
- **不要过度组织。** 通常一层目录就足够了。`memory/tasks/` 和 `memory/competitive/` 是合理的；`memory/work/projects/active/basic-memory/notes/` 则不是。
- **已完成的任务**：`status: done` 且完成时间超过 14 天的任务可以删除。相关经验应已通过反思记录在 MEMORY.md 中。
- **执行破坏性变更前先询问。** 如果不确定某条信息是否仍然相关，请保留该信息并添加 `(review needed)` 标签，而不要将其删除。