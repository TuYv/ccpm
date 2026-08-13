---
name: claude-md-drift-audit
description: Audit every CLAUDE.md in this project for drift against the last week of git history. Flags sections that reference deleted files, renamed paths, or removed dependencies. Read-only — returns a punch list, never edits.
when_to_use: |
  Use when the user asks "is my CLAUDE.md still accurate?", "audit my docs for staleness",
  "what changed in the last week?", or as part of /sync-claude-md --weekly.
argument-hint: "[days=7]"
context: fork
agent: Explore
allowed-tools:
  - Read
  - Glob
  - Grep
  - "Bash(git log:*)"
  - "Bash(git diff:*)"
  - "Bash(git status:*)"
  - "Bash(find:*)"
disable-model-invocation: false
---
# CLAUDE.md 漂移审计（分叉、只读）

天数窗口：`$ARGUMENTS`（为空时默认为 `7`）。

按顺序执行以下步骤，然后返回一份整改单摘要。不要修改任何文件。

1. **盘点**目录树中的每个 `CLAUDE.md` 和 `*.claude/rules/*.md`，使用 `find . -name "CLAUDE.md" -type f -not -path "*/.git/*" -not -path "*/node_modules/*"`。列出路径和行数。
2. **收集变更信号**，时间范围为指定窗口：
   - `git log --since="$ARGUMENTS days ago" --name-status --no-merges --diff-filter=DR` → 已删除和已重命名的路径。
   - `git diff "@{$ARGUMENTS days ago}" --name-status -- package.json requirements.txt pyproject.toml go.mod Cargo.toml 2>/dev/null` → 清单差异（移除/新增的依赖）。
3. **交叉核对**每个 CLAUDE.md 与这些信号，使用 `grep` / `Read`：
   - 标记任何提及已删除或已重命名路径的行。
   - 标记 Tech Stack / Dependencies 章节中任何提及已移除依赖的行。
   - 标记目标已被删除的任何 `@path/...` 链式导入或 Markdown 链接。
4. **返回**以下精确格式的整改单（Markdown），不要包含其他内容：

```
## Drift Audit (window: <N> days)

Total CLAUDE.md inspected: <count>
Signals examined: <deleted_paths>, <renamed_paths>, <removed_deps>

### Findings
- <path>:<line> — <one-sentence reason> — suggested action
- ... (one bullet per drift; omit section if empty)

### Clean
- <path> (lines unchanged, references valid)
```

5. 如果未发现漂移，则准确返回 `## Drift Audit\n\nNo drift in <N>-day window. <count> files inspected.`。不要填充额外输出。