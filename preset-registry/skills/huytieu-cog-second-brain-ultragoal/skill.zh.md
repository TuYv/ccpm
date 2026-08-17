---
name: ultragoal
description: Run a large, multi-session goal (e.g. shipping a whole side product) through the full V-model closed loop, one phase at a time, with cross-session state and a final north-star acceptance gate. Ultragoals never downgrade the lane: every phase runs CP-1→CP-6 with adversarial verification. Use via /ultragoal.
---
阅读 `.claude/skills/ultragoal/SKILL.md` 并严格按照其中的说明执行——该文件是权威操作手册。然后遵循 `.agents/rules/cog.md`。

Antigravity 替代规则：当操作手册委派给 `.claude/agents/<name>` 工作代理时，改为通过 `invoke_subagent` 调用 `.agents/agents/<name>.md`。