---
name: crystallize
description: "Distils repeating patterns from session logs and lessons.md into draft skill files. Run after ≥10 sessions to extract durable knowledge. Output: draft skills/ files + promotion report."
when_to_use: |
  Apply when:
  - CTO says /crystallize, "crystallize", or "extract knowledge"
  - Session count in .great_cto/logs/ reaches a multiple of 10 (auto-suggest)
  - User asks "what have we learned?" or "turn lessons into skills"
effort: high
allowed-tools: Read, Write, Glob, Grep, Bash, Agent
paths:
  - ".great_cto/logs/**"
  - ".great_cto/lessons.md"
  - "~/.great_cto/decisions.md"
  - "skills/**"
---
# Crystallize — 将会话模式提炼为可复用技能

当 CTO 输入 `/crystallize`、"crystallize"、"extract knowledge" 或
"what have we learned?" 时调用。当会话数为 10 的倍数时，也会自动建议调用
（会话结束钩子会检查 `.great_cto/.last-crystallize`）。

`knowledge-extractor` 智能体（Opus）负责主要工作。此技能负责协调工作流
并输出最终报告。

**会话结束提示集成：** 会话结束钩子会检查
`.great_cto/.last-crystallize`，并在会话数超过 `last_sessions + 10` 时建议运行
`/crystallize`。在完成 ≥10 次会话后运行此技能，
以使提取出的技能保持最新。

---

## 步骤 1 — 收集原始材料

```bash
# Count sessions
SESSION_COUNT=$(ls .great_cto/logs/session-*-end.md 2>/dev/null | wc -l | tr -d ' ')
echo "Sessions: $SESSION_COUNT"

# Read lessons
cat .great_cto/lessons.md 2>/dev/null || echo "(no lessons yet)"

# Read cross-project decisions
cat ~/.great_cto/decisions.md 2>/dev/null | head -200 || echo "(none)"

# Find patterns that appear in ≥3 sessions
grep -h "^## pattern:" .great_cto/logs/session-*-end.md 2>/dev/null | sort | uniq -c | sort -rn | head -20

# Recent git log for context
git log --oneline --since="30 days ago" | head -30
```

如果 `SESSION_COUNT` 为 0，告知 CTO："在
`.great_cto/logs/` 中未找到会话日志。请至少运行 10 次会话后再进行提炼。" 然后退出。

如果 `SESSION_COUNT` < 10，告知 CTO："仅找到 `{N}` 次会话。达到 ≥10 次会话后，
模式会更加可靠。仍要继续吗？[yes/no]" 等待确认后再继续。

---

## 步骤 2 — 聚类模式（通过 knowledge-extractor 智能体）

生成 `knowledge-extractor` 智能体，并将收集到的数据作为上下文：

```
Agent: knowledge-extractor
Task: |
  Read .great_cto/lessons.md and all files in .great_cto/logs/.
  Cluster lesson entries by pattern slug.
  For each cluster with ≥3 occurrences, write a draft skill file to
  skills/{domain}/SKILL.md (status: draft in frontmatter).
  If a skill for that domain already exists, append a new ## section instead
  of replacing the file.
  Infer domain from the pattern slug and its archetype tags.
  Return a structured summary: clusters found, drafts written, already-covered.
```

等待智能体完成后，再继续执行步骤 3。

---

## 步骤 3 — 输出晋升报告

智能体完成后，打印：

```
CRYSTALLIZE REPORT
════════════════════════════════════════
Sessions analysed: {SESSION_COUNT}
Lessons found:     {LESSON_COUNT}
Clusters:          {CLUSTER_COUNT}
Draft skills:      {DRAFT_COUNT}  (in skills/{domain}/SKILL.md)
Already covered:   {COVERED_COUNT}  (pattern already in existing skill)
════════════════════════════════════════
Draft files:
  {list of paths and brief description per draft}

Next: review drafts, remove `status: draft` when satisfied.
Run /crystallize again after 10 more sessions.
════════════════════════════════════════
```

---

## 步骤 4 — 写入 .last-crystallize 标记

生成报告后，写入标记文件：

```bash
SESSION_COUNT=$(ls .great_cto/logs/session-*-end.md 2>/dev/null | wc -l | tr -d ' ')
DRAFT_COUNT={P}   # from agent output
mkdir -p .great_cto
node -e "
const fs = require('fs');
fs.writeFileSync('.great_cto/.last-crystallize', JSON.stringify({
  ts: new Date().toISOString(),
  sessions: parseInt('$SESSION_COUNT') || 0,
  drafts: parseInt('$DRAFT_COUNT') || 0
}) + '\n');
"
```

---

## 步骤 5 — 自动运行频率建议

如果 `SESSION_COUNT` 是 10 的倍数（且 > 0），则在报告末尾追加：

```
Auto-suggestion: you've completed {SESSION_COUNT} sessions. Consider running
`/crystallize` every 10 sessions to keep skills current.
```