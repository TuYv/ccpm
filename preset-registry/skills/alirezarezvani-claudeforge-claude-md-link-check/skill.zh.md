---
name: claude-md-link-check
description: Verify every @path chain import and every markdown link inside every CLAUDE.md in this project resolves to an existing file. Read-only — returns broken links with file:line refs, never edits.
when_to_use: |
  Use when the user asks "check my CLAUDE.md links", "are the @-imports still valid?",
  "find broken cross-references", or as part of /sync-claude-md --weekly.
argument-hint: "[path-glob]"
context: fork
agent: Explore
allowed-tools:
  - Read
  - Glob
  - Grep
  - "Bash(find:*)"
  - "Bash(test:*)"
  - "Bash(ls:*)"
disable-model-invocation: false
---
# CLAUDE.md 链接检查（分叉，只读）

可选路径 glob：`$ARGUMENTS`（默认为 `.` — 整个目录树）。

按顺序执行以下步骤。不要修改任何文件。

1. **清点。** `find <root> -name "CLAUDE.md" -type f -not -path "*/.git/*" -not -path "*/node_modules/*"`。还需包括 `.claude/rules/*.md`。记录路径。
2. 从每个文件中**提取候选项**：
   - **链式导入** — 匹配 `^@\S+` 的行。`@` 后面的字面值是相对路径。
   - **Markdown 链接** — `[text](target)`，其中 `target` 不是 HTTP(S) URL、不是 `mailto:`，也不是裸锚点 `#section`。
3. 相对于包含候选项的文件**解析每个候选项**（对父文件使用 `Read` 以确认位置，然后执行 `test -e <resolved-path>` 或使用 `Glob`）。
   - 对于 `skill/CLAUDE.md` 中的 `@../CLAUDE.md`，解析后的路径是 `CLAUDE.md`。
   - 对于根目录中的 `[Backend](backend/CLAUDE.md)`，解析后的路径是 `backend/CLAUDE.md`。
4. **返回**严格采用以下格式的报告：

```
## Link Check

Files inspected: <count>
References checked: <chain_imports> @-imports, <md_links> markdown links

### Broken
- <file>:<line> — `<original-target>` → does not resolve (expected `<absolute-path>`)
- ... (omit section if empty)

### Clean
<count> references resolved.
```

5. 如果所有引用都能解析，则只返回 `## Link Check\n\nAll <N> references resolved across <M> files.`。不要添加额外内容。

**硬性规则**：绝不要虚构修复方案。原样报告损坏的目标。是否修复由用户决定（或由 `/sync-claude-md` 处理）。