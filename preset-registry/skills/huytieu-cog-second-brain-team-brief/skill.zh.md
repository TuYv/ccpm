---
name: team-brief
description: Generate daily team intelligence brief by cross-referencing GitHub, Linear, Slack, PostHog, meetings, and braindumps with two-way Linear sync-back
---
阅读 `.claude/skills/team-brief/SKILL.md` 并严格按照其中的说明执行——该文件是权威操作手册。然后遵循 `.agents/rules/cog.md`。

Antigravity 替换规则：当操作手册将任务委派给 `.claude/agents/<name>` 工作代理时，改为通过 `invoke_subagent` 调用 `.agents/agents/<name>.md`。