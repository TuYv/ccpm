---
name: consolidate
description: This skill should be used when the user asks to "consolidate memory", "tidy memory", "整理记忆", "rebuild MEMORY.md", or wants to normalize, deduplicate, prune, or rebuild project memory. Consolidates the project's memory as one unlayered store — the private harness memory (~/.claude/projects/<escaped-cwd>/memory) and the repo-local memory (docs/memory/).
user-invocable: true
allowed-tools: ["Read", "Write", "Glob", "Grep"]
---
# 整合记忆

一个命令，不带任何选项。项目的记忆实际存放在两个位置，但它们共同构成一个不分层的存储；由 AI 判断需要执行哪些操作并完成它们。

- **私有运行环境记忆** — `~/.claude/projects/<escaped-cwd>/memory`（`/`→`-`；空格的处理方式不一致，因此需同时探查 `/→-`+` →-` 和 `/→-`+保留空格这两种形式）。索引：`MEMORY.md`。
- **仓库记忆** — 项目 git 根目录中的 `docs/memory/`。文件名为 `<category>_<slug>.md`，frontmatter 包含 `name/category/summary/source/created/updated`，正文包含 `## Fact`/`## Why`/`## How to apply`/`## Related`。每个文件在 `docs/README.md` 中以一行作为索引。

两个入口——手动执行的 `/memory:consolidate` 和 Stop-hook 后台运行——都会对这两个位置执行完整处理流程。

## 红线

- 绝不为提交而执行 `git add`/`commit`/`status`/`diff`。如需提交仓库记忆的更改，请使用 `/git:commit` skill。
- 绝不将凭据（密码、secret、token、api-key 等）写入 `docs/memory/`——仓库文件不得包含秘密信息。文件名或正文表明包含秘密信息的文件保持原样。

## 操作步骤

对于范围内的每个位置：

1. **读取**每个 `*.md`，包括索引（`MEMORY.md`，或 `docs/README.md` 中与 `docs/memory/` 相关的行）。
2. **规范化**——将相对日期转换为绝对日期 `YYYY-MM-DD`（今天：`$(date +%F)`）；补全 frontmatter。
3. **去重与合并**——合并同一位置内以及跨位置的重复内容；保留最详尽的版本。由 AI 判断合并后的事实应归属于哪个位置。
4. **清理**——保留与活跃项目、基础设施、偏好相关的事实，以及具有大量 `[[linked]]` 的事实；清理休眠内容（已超过 6 个月且不包含持久有效的经验）、已过期的时效性笔记（保留可迁移的洞见），以及超过 3 个月的操作快照（为保留项标注日期）。绝不因休眠而清理包含秘密信息的文件。
5. **重建**——如果有任何更改，则重建索引：重写 `MEMORY.md`（每个文件一行，总行数不超过 50 行）；对于仓库记忆，更新 `docs/README.md` 中的行（将 `updated` 更新为今天，刷新 `summary`，删除已移除文件对应的行）。

## 报告

分别说明每个位置的情况：读取的文件、修改的文件（路径 + 一行修改原因）、合并／清理／跳过的事实，以及是否重建索引。如果没有任何更改，请明确说明。