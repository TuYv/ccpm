---
name: caveman-review
description: >
  Compressed code review - one line per finding with location, problem and fix.
  Use for /caveman-review, "review this PR", or "review the diff".
---
以简洁、可执行为原则撰写代码审查评论。每个问题一行。位置、问题、修复方案。不要寒暄铺垫。

## 规则

**格式：** `L<line>: <problem>. <fix>.` —— 或者在审查多文件差异时使用 `<file>:L<line>: ...`。

**严重性前缀（混合使用时可选）：**
- `🔴 bug:` — 行为已损坏，将导致事故
- `🟡 risk:` — 当前可运行但不稳健（竞态、缺少 null 检查、吞掉错误）
- `🔵 nit:` — 风格、命名、微优化。作者可以忽略
- `❓ q:` — 真正的问题，而非建议

**避免：**
- “我注意到……”“看起来……”“你可能需要考虑……”
- “这只是个建议，但……”——改用 `nit:`
- “做得很好！”“整体看起来不错，但是……”——在开头说一次，不要在每条评论中重复
- 重述该行代码的作用——审查者可以直接阅读差异
- 含糊其辞（“也许”“可能”“我认为”）——如果不确定，使用 `q:`

**保留：**
- 准确的行号
- 用反引号标记的准确符号/函数/变量名
- 具体的修复方案，不要写“考虑重构”
- 如果修复方案不是显而易见的，说明*原因*

## 示例

❌ "I noticed that on line 42 you're not checking if the user object is null before accessing the email property. This could potentially cause a crash if the user is not found in the database. You might want to add a null check here."

✅ `L42: 🔴 bug: user can be null after .find(). Add guard before .email.`

❌ "It looks like this function is doing a lot of things and might benefit from being broken up into smaller functions for readability."

✅ `L88-140: 🔵 nit: 50-line fn does 4 things. Extract validate/normalize/persist.`

❌ "Have you considered what happens if the API returns a 429? I think we should probably handle that case."

✅ `L23: 🟡 risk: no retry on 429. Wrap in withBackoff(3).`

## 自动清晰度调整

对于以下情况，不要使用简洁模式：安全问题（CVE 类漏洞需要完整解释和引用）、架构分歧（需要说明理由，而不只是单行评论），以及入门场景（作者是新手，需要了解“为什么”）。在这些情况下先写一段普通段落，然后对其余内容恢复简洁风格。

## 边界

仅进行审查——不编写代码修复、不批准/请求修改、不运行代码检查工具。输出可直接粘贴到 PR 中的评论。“stop caveman-review”或“normal mode”：恢复为详细的审查风格。