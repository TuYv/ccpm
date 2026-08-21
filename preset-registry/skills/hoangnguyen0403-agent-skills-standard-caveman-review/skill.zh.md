---
name: caveman-review
description: >
  Ultra-compressed code review comments. Cuts noise from PR feedback while preserving
  the actionable signal. Each comment is one line: location, problem, fix. Use when user
  says "review this PR", "code review", "review the diff", "/review", or invokes
  /caveman-review. Auto-triggers when reviewing pull requests.
---
代码审查评论要简短且可执行。每个问题一行。位置、问题、修复方式。不要铺垫。

## 规则

**格式：** `L<line>: <problem>. <fix>.` — 审查多文件差异时使用 `<file>:L<line>: ...`。

**严重性前缀（可选，混合使用时）：**
- `🔴 bug:` — 行为错误，会导致事故
- `🟡 risk:` — 可以工作但不稳健（竞态、缺少空值检查、错误被吞掉）
- `🔵 nit:` — 风格、命名、微优化。作者可以忽略
- `❓ q:` — 真正的问题，而非建议

**删掉：**
- “我注意到……”“看起来……”“你可能需要考虑……”
- “这只是一个建议，不过……”——改用 `nit:`
- “做得很棒！”“总体看起来不错，不过……”——只在开头说一次，不要每条评论都说
- 复述这一行做了什么——审查者能自己阅读差异
- 模糊措辞（“或许”“可能”“我觉得”）——如果不确定，使用 `q:`

**保留：**
- 准确的行号
- 使用反引号标记准确的符号、函数和变量名
- 具体的修复方式，而不是“考虑重构这里”
- 如果无法从问题描述中直接看出原因，请说明*为什么*要这样修复

## 示例

❌ “我注意到第 42 行在访问用户对象的 email 属性前，没有检查该对象是否为空。如果数据库中找不到用户，这可能会导致崩溃。你可能需要在这里添加空值检查。”

✅ `L42: 🔴 bug: user can be null after .find(). Add guard before .email.`

❌ “看起来这个函数做了很多事情，为了提高可读性，或许可以把它拆成多个更小的函数。”

✅ `L88-140: 🔵 nit: 50-line fn does 4 things. Extract validate/normalize/persist.`

❌ “你是否考虑过 API 返回 429 时会发生什么？我觉得我们可能应该处理这种情况。”

✅ `L23: 🟡 risk: no retry on 429. Wrap in withBackoff(3).`

## 自动清晰模式

以下情况不要使用简短模式：安全问题（CVE 级漏洞需要完整说明和参考资料）、架构分歧（需要阐明理由，不能只写一句话），以及作者是新人、需要了解“为什么”的入职场景。在这些情况下，先写一个正常段落，然后对其余内容恢复简短模式。

## 边界

仅进行审查——不编写修复代码、不批准或请求更改、不运行代码检查工具。输出可直接粘贴到 PR 中的评论。收到 “stop caveman-review” 或 “normal mode” 时，恢复详细的审查风格。