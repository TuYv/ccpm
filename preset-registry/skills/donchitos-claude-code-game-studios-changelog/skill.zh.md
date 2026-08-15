---
name: changelog
description: "Auto-generates a changelog from git commits, sprint data, and design documents. Produces both internal and player-facing versions."
argument-hint: "[version|sprint-number]"
user-invocable: true
allowed-tools: Read, Glob, Grep, Bash, Write
context: |
  !git log --oneline -30 2>/dev/null
  !git tag --list --sort=-v:refname 2>/dev/null | head -5
model: haiku
---
## 阶段 1：解析参数

读取目标版本或冲刺编号参数。如果提供的是版本，则使用对应的 git 标签。如果提供的是冲刺编号，则使用该冲刺的日期范围。

验证仓库是否已初始化：运行 `git rev-parse --is-inside-work-tree` 以确认 git 可用。如果不是 git 仓库，请告知用户并妥善中止操作。

---

## 阶段 2：收集变更数据

读取自上一个标签或版本发布以来的 git 日志：

```
git log --oneline [last-tag]..HEAD
```

如果不存在标签，则读取完整日志或合理的近期范围（最近 100 次提交）。

读取相关时间段内 `production/sprints/` 中的冲刺报告，以了解计划工作和变更背后的背景。

读取 `design/gdd/` 中已完成的设计文档，了解此期间实现的所有新功能。

---

## 阶段 3：对变更进行分类

将每项变更归入以下类别之一：

- **新功能**：全新的玩法系统、模式或内容
- **改进**：对现有功能的增强、用户体验改进、性能提升
- **错误修复**：对异常行为的修正
- **平衡性调整**：对玩法数值、难度、经济系统的调优
- **已知问题**：团队已经知晓但尚未解决的问题
- **其他**：不属于上述类别的变更，或因提交消息过于模糊而无法可靠分类的提交

对于每次提交，检查其消息是否包含任务 ID 或用户故事引用
（例如 `[STORY-123]`、`TR-`、`#NNN` 或类似格式）。统计不含任何任务引用的提交数量，
并在阶段 4 的指标部分中按以下格式包含该数量：`Commits without task reference: [N]`。

---

## 阶段 4：生成内部变更日志

```markdown
# Internal Changelog: [Version]
Date: [Date]
Sprint(s): [Sprint numbers covered]
Commits: [Count] ([first-hash]..[last-hash])

## New Features
- [Feature Name] -- [Technical description, affected systems]
  - Commits: [hash1], [hash2]
  - Owner: [who implemented it]
  - Design doc: [link if applicable]

## Improvements
- [Improvement] -- [What changed technically and why]
  - Commits: [hashes]
  - Owner: [who]

## Bug Fixes
- [BUG-ID] [Description of bug and root cause]
  - Fix: [What was changed]
  - Commits: [hashes]
  - Owner: [who]

## Balance Changes
- [What was tuned] -- [Old value -> New value] -- [Design intent]
  - Owner: [who]

## Technical Debt / Refactoring
- [What was cleaned up and why]
  - Commits: [hashes]

## Miscellaneous
- [Change that didn't fit other categories, or vague commit message]
  - Commits: [hashes]

## Known Issues
- [Issue description] -- [Severity] -- [ETA for fix if known]

## Metrics
- Total commits: [N]
- Files changed: [N]
- Lines added: [N]
- Lines removed: [N]
- Commits without task reference: [N]
```

---

## 阶段 5：生成面向玩家的变更日志

```markdown
# What is New in [Version]

## New Features
- **[Feature Name]**: [Player-friendly description of what they can now do
  and why it is exciting. Focus on the experience, not the implementation.]

## Improvements
- **[What improved]**: [How this makes the game better for the player.
  Be specific but avoid jargon.]

## Bug Fixes
- Fixed an issue where [describe what the player experienced, not what was
  wrong in the code]
- Fixed [player-visible symptom]

## Balance Changes
- [What changed in player-understandable terms and the design intent.
  Example: "Healing potions now restore 50 HP (up from 30) -- we felt
  players needed more recovery options in late-game encounters."]

## Known Issues
- We are aware of [issue description in player terms] and are working on a
  fix. [Workaround if one exists.]

---
Thank you for playing! Your feedback helps us make the game better.
Report issues at [link].
```

---

## 阶段 6：输出

向用户输出两份变更日志。内部变更日志是主要工作文档。面向玩家的变更日志经审核后即可发布到社区。

---

## 阶段 7：询问是否写入文件

展示变更日志后，询问用户：

> “是否可以将此变更日志写入 `docs/CHANGELOG.md`？
> [A] 是，追加此条目（如果文件已存在，建议选择此项）
> [B] 是，完全覆盖该文件
> [C] 否——我会手动复制”

- 询问前，检查 `docs/CHANGELOG.md` 是否存在。如果存在，默认建议选择
  **[A] 追加**。
- 如果用户选择 [A]：将新的内部变更日志条目追加到现有文件的顶部
  （最新条目在前）。
- 如果用户选择 [B]：使用新的变更日志覆盖该文件。
- 如果用户选择 [C]：在此停止，不写入文件。

成功写入后：结论：**变更日志已写入**——变更日志已保存至 `docs/CHANGELOG.md`。
如果用户拒绝：结论：**完成**——变更日志已生成。

---

## 阶段 7：后续步骤

- 使用 `/patch-notes [version]` 生成带样式并已保存的公开发布版本。
- 在对外发布变更日志之前使用 `/release-checklist`。

### 指南

- 切勿在面向玩家的变更日志中暴露内部代码引用、文件路径或开发者姓名
- 将相关变更归为一组，而不是逐条列出各个提交
- 如果提交消息含义不明确，请检查相关文件和冲刺数据以了解上下文
- 平衡性变更应始终包含设计理由，而不应只列出数值
- 应如实说明已知问题——玩家欣赏坦诚透明
- 如果 git 历史记录混乱（存在合并提交、还原提交、修正提交），应梳理叙述，而不是逐字列出每个提交