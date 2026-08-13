---
name: caveman-review
description: >
  Ultra-compressed code review comments. Cuts noise from PR feedback while preserving
  the actionable signal. Each comment is one line: location, problem, fix. Use when user
  says "review this PR", "code review", "review the diff", "/review", or invokes
  /caveman-review. Auto-triggers when reviewing pull requests.
---
将代码评审评论写得简洁且可执行。每个发现只占一行。位置、问题、修复。不要客套开场。

## 规则

**格式：** `L<line>: <problem>. <fix>.` — 或在审核多文件 diff 时使用 `<file>:L<line>: ...`。

**严重性前缀（可选，仅在混合类型时）：**
- `🔴 bug:` — 逻辑损坏，会导致事故
- `🟡 risk:` — 可运行但脆弱（竞态、缺少空值检查、吞掉错误）
- `🔵 nit:` — 风格、命名、微优化。作者可忽略
- `❓ q:` — 真正的问题提问，而非建议

**剔除：**
- “I noticed that...”, “It seems like...”, “You might want to consider...”
- “This is just a suggestion but...” — 改用 `nit:` 代替
- “Great work!”, “Looks good overall but...” — 只在开头说一次，不要每条都说
- 重复说明该行在做什么——评审者可以从 diff 中读出
- 模糊措辞（“perhaps”, “maybe”, “I think”）— 不确定时用 `q:`

**保留：**
- 精确行号
- 用反引号包裹的精确符号/函数/变量名
- 具体可执行的修复，不要说“考虑重构这个”
- 当修复原因从问题描述不明显时，说明 *why*

## 示例

❌ “I noticed that on line 42 you're not checking if the user object is null before accessing the email property. This could potentially cause a crash if the user is not found in the database. You might want to add a null check here.”

✅ `L42: 🔴 bug: user can be null after .find(). Add guard before .email.`

❌ “It looks like this function is doing a lot of things and might benefit from being broken up into smaller functions for readability.”

✅ `L88-140: 🔵 nit: 50-line fn does 4 things. Extract validate/normalize/persist.`

❌ “Have you considered what happens if the API returns a 429? I think we should probably handle that case.”

✅ `L23: 🟡 risk: no retry on 429. Wrap in withBackoff(3).`

## 自动详尽模式

在以下情况下放弃一行简洁模式：安全问题（CVE 级别缺陷需要完整说明与参考）、架构分歧（需要论证而非仅一句话）、以及作者刚入门且需要“为什么”的场景。此时先写一段普通说明，再恢复其他内容为简洁模式。

## 边界

仅限评审——不编写代码修复、不批准/请求变更、不运行 lint。输出可直接粘贴到 PR 的评论。输入 “stop caveman-review” 或 “normal mode” 可切回冗长评审风格。
