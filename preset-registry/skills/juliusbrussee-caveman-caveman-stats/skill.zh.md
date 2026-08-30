---
name: caveman-stats
description: >
  Show real token usage and estimated savings for the current session, read
  from the session log. Trigger: /caveman-stats.
---
此技能由 `hooks/caveman-stats.js` 提供（`hooks/caveman-mode-tracker.js` 在 `/caveman-stats` 上读取它）。此技能触发时，模型无需执行任何操作——钩子会返回 `decision: "block"`，并将格式化后的统计数据作为原因。用户会立即看到这些数字。

只要存在具有已知轮次的节省估算，输出还会包含 `Est. rule overhead` 和 `Est. net` 行。规则开销是注入的 caveman 规则每轮 INPUT token 成本的估算值（默认为 1,250 tokens/turn，可通过 `CAVEMAN_RULE_OVERHEAD_TOKENS` 覆盖）乘以轮次数。净值是节省量减去该开销——当结果为负时，输出会明确说明这一点，并建议针对该工作负载关闭 caveman，而不是用总节省量掩盖净值为负的情况（参见 `docs/HONEST-NUMBERS.md`）。