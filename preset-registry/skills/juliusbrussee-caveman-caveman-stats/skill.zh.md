---
name: caveman-stats
description: >
  Show real token usage and estimated savings for the current session.
  Reads directly from the Claude Code session log — no AI estimation.
  Triggers on /caveman-stats. Output is injected by the mode-tracker hook;
  the model itself does not compute the numbers.
---
此技能由 `hooks/caveman-stats.js` 提供（由 `/caveman-stats` 上的 `hooks/caveman-mode-tracker.js` 读取）。该技能触发时，模型无需执行任何操作——钩子返回 `decision: "block"`，并将格式化的统计信息作为原因返回。用户会立刻看到这些数字。

输出还会在存在已知回合数的节省估算时包含 `Est. rule overhead` 和 `Est. net` 行。规则开销是注入的 caveman 规则每回合的预估 INPUT-token 成本（默认 1,250 tokens/turn，可使用 `CAVEMAN_RULE_OVERHEAD_TOKENS` 覆盖）乘以回合数。净值是节省值减去该开销——当该值为负时，输出会直接说明这一点，并建议在该工作负载下关闭 caveman，而不是用毛利节省数字掩盖净值为负的情况（详见 `docs/HONEST-NUMBERS.md`）。
