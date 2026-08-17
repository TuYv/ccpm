---
name: harvest
description: >
  Capture durable session learnings, stage for human promotion to
  05-knowledge/lizard, and propose skill/CLAUDE.md patches. Triggered by
  /harvest, SessionEnd hook staging, or nightly enhance. Never writes
  durable knowledge without your approval.
---
# /harvest — 会话学习成果收集

改编自 dwarves-kit 的 `harvest` 钩子和 vault lizard 流程。防止隐性知识随会话记录一起消失。

## 触发方式

- `/harvest` — 在会话结束时手动触发
- `/harvest promote` — 将暂存内容整理为 lizard 草稿（使用 harvest-curator）
- 由 `stop` 钩子写入暂存文件（`.cursor/hooks/harvest-stager.sh`）

## 阶段 1 — 收集（自动或手动）

扫描当前会话，查找：

1. **你做出的纠正**（“不，实际上是 X”、被否决的交付成果）
2. **新的稳定事实**（ID、URL、决策），且尚未记录在 05-knowledge 中
3. **流程经验**（哪些方法有效、哪些失败、存在什么阻碍）
4. **技能缺口**（某些内容应成为 Verify 步骤或 CLAUDE.md 规则）

追加到 `04-projects/harness/harvest/staging-<YYYY-MM-DD>.md`：

```markdown
## <HH:MM> — <trigger>
- type: correction|fact|process|skill-gap
- source: <file or "session">
- text: <one paragraph max>
- proposed_home: <path or "new lizard note">
```

去重：如果同一事实已存在于当天的暂存内容或 05-knowledge 中，则跳过。

## 阶段 2 — 整理（`/harvest promote`）

启动 `harvest-curator`（Sonnet）。它会写入 `/tmp/harvest-curate-<date>.md`。

主代理（Opus）向用户展示：

- **提升**列表 → 审批哪些内容应写入 `05-knowledge/lizard/YYYY-MM-DD-<slug>.md`
- **合并**列表 → 审批对现有笔记的行内编辑
- **技能补丁** → 审批 CLAUDE.md / SKILL.md 差异

只有在获得批准后，才写入持久化文件。更新 `05-knowledge/lizard/index.md`。

## 阶段 3 — 回顾记录

向 `01-daily/journal/<today>.md` 添加一行：

```
Harvest: <n> staged, <m> promoted, <k> folded
```

## 规则

- Harvest 仅提供**建议**。它绝不会自动写入 05-knowledge。
- 如果与现有知识冲突 → 标记双方，并询问用户。
- 每月配合 `/memory-hygiene` 使用，以处理 `~/.claude/.../memory/` 中依赖环境的事实。

## 夜间增强（可选的 launchd）

```bash
# 04-projects/harness/scripts/nightly-enhance.sh
bash .claude/lib/install-harness.sh --check  # hooks alive
# /memory-hygiene (skill)
# /harvest promote if staging non-empty
# content-factory if scheduled
```