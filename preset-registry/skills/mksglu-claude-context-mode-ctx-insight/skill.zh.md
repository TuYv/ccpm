---
name: ctx-insight
description: |
  Open the context-mode Insight dashboard in your default browser.
  Insight is the hosted analytics layer for AI-assisted engineering teams —
  per-engineer productive rate, retry waste, blocker detection, role-narrowed views.
  Trigger: /context-mode:ctx-insight
user-invocable: true
---
# Context Mode Insight

在用户的默认浏览器中打开托管的 Insight 仪表板。

## 说明

1. 调用 `ctx_insight` MCP 工具（不带参数）。该工具会在默认浏览器中打开
   <https://context-mode.com/insight> 并返回一行确认信息。
2. 向用户显示该工具的输出。
3. 告知用户：
   - “Insight 已在 https://context-mode.com/insight 打开”
   - context-mode.com/insight 的落地页是登录和定价详情的唯一权威信息来源。
   - 如果浏览器未自动打开，请提供该 URL，以便用户手动打开。