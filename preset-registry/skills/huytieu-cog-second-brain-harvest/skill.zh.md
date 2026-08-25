---
name: harvest
description: >
  Capture durable session learnings, stage for human promotion to
  05-knowledge/lizard, and propose skill/CLAUDE.md patches. Triggered by
  /harvest, SessionEnd hook staging, or nightly enhance. Never writes
  durable knowledge without your approval.
---
# /harvest — 会话学习捕获

改编自 dwarves-kit 的 `harvest` hook + vault lizard pipeline。防止隐性知识湮没在 transcript 中。

## 触发方式

- `/harvest` — 手动结束会话
- `/harvest promote` — 整理 staging → lizard 草稿（使用 harvest-curator）
- 由 `stop` hook 写入的 staging 文件（`.cursor/hooks/harvest-stager.sh`）

## 阶段 1 — 收集（自动或手动）

扫描当前会话，查找：

1. **你所做的修正**（“不，实际上是 X”、被拒绝的交付物）
2. **新的稳定事实**（尚未写入 05-knowledge 的 ID、URL、决策）
3. **流程经验**（哪些做法有效、哪些失败、存在何种摩擦）
4. **技能缺口**（某些内容本应成为 Verify 步骤或 CLAUDE.md 规则）

追加到 `04-projects/harness/harvest/staging-<YYYY-MM-DD>.md`：

```markdown
## <HH:MM> — <trigger>
- type: correction|fact|process|skill-gap
- source: <file or "session">
- text: <one paragraph max>
- proposed_home: <path or "new lizard note">
```

去重：如果相同事实已存在于今天的 staging 中或 05-knowledge 中，则跳过。

## 阶段 2 — 整理（`/harvest promote`）

启动 `harvest-curator`（Sonnet）。它会写入 `/tmp/harvest-curate-<date>.md`。

Lead（Opus）向用户展示：

- **Promote** 列表 → 批准哪些内容成为 `05-knowledge/lizard/YYYY-MM-DD-<slug>.md`
- **Fold** 列表 → 批准对现有笔记进行的内联编辑
- **Skill patches** → 批准 CLAUDE.md / SKILL.md diff

只有在获得批准后，才写入持久化文件。更新 `05-knowledge/lizard/index.md`。

## 阶段 3 — Retro 行

向 `01-daily/journal/<today>.md` 写入一行：

```
Harvest: <n> staged, <m> promoted, <k> folded
```

## 规则

- Harvest 是**建议性的**。它绝不会自动写入 05-knowledge。
- 与现有知识相矛盾时 → 标记双方，并询问用户。
- 对于 `~/.claude/.../memory/` 中依赖环境的事实，每月与 `/memory-hygiene` 配对使用。

## 夜间增强（可选）

如果希望 harvest 无人值守地运行，请安排一个按以下顺序调用这些 skills 的任务。无需先安装任何内容，因为 COG 不提供 hooks。

```
/memory-hygiene
/harvest promote     # only if the staging file is non-empty
/content-factory     # only if scheduled
```