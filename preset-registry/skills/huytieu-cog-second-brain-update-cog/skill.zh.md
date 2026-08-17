---
name: update-cog
description: Check for and apply upstream COG framework updates (skills, docs, scripts) without touching personal content
---
阅读 `.claude/skills/update-cog/SKILL.md` 并严格按照其中的说明执行——该文件是权威操作手册。然后遵循 `.agents/rules/cog.md`。

Antigravity 替换规则：当操作手册委派给 `.claude/agents/<name>` 工作代理时，改为通过 `invoke_subagent` 调用 `.agents/agents/<name>.md`。