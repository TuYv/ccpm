---
name: caveman-commit
description: >
  Ultra-compressed commit message generator. Cuts noise from commit messages while preserving
  intent and reasoning. Conventional Commits format. Subject ≤50 chars, body only when "why"
  isn't obvious. Use when user says "write a commit", "commit message", "generate commit",
  "/commit", or invokes /caveman-commit. Auto-triggers when staging changes.
---
提交信息要简洁且准确。使用 Conventional Commits 格式。强调“为什么”，而不是“做了什么”。

## 规则

**主题行：**
- `<type>(<scope>): <imperative summary>` — `<scope>` 可选
- 类型：`feat`、`fix`、`refactor`、`perf`、`docs`、`test`、`chore`、`build`、`ci`、`style`、`revert`
- 祈使语气：`add`、`fix`、`remove`，而不是 `added`、`adds`、`adding`
- 尽量不超过 50 字符，硬限制 72
- 末尾不加句号
- 按项目约定匹配冒号后的大小写

**正文（仅在需要时）：**
- 当主题行能自解释时可直接跳过
- 仅在以下情况添加正文：非显而易见的*原因*、破坏性变更、迁移说明、关联议题
- 每行 72 字符换行
- 项目符号用 `-` 而不是 `*`
- 在末尾引用议题/PR：`Closes #42`、`Refs #17`

**哪些内容不要写入：**
- “This commit does X”/“I”/“we”/“now”/“currently”——差异已经说明了
- “按要求”——请使用 Co-authored-by trailer
- “Generated with Claude Code” 或任何 AI 署名——除非用户规则要求 `Assisted-by`/AI attribution trailer，否则不写
- Emoji（除非项目约定需要）
- 当 scope 已说明时，不要重复文件名

## 示例

Diff: new endpoint for user profile with body explaining the why
- ❌ `feat: add a new endpoint to get user profile information from the database`
- ✅
  ```
  feat(api): add GET /users/:id/profile

  Mobile client needs profile data without the full user payload
  to reduce LTE bandwidth on cold-launch screens.

  Closes #128
  ```

Diff: breaking API change
- ✅
  ```
  feat(api)!: rename /v1/orders to /v1/checkout

  BREAKING CHANGE: clients on /v1/orders must migrate to /v1/checkout
  before 2026-06-01. Old route returns 410 after that date.
  ```

## 自动清晰化

始终在以下情况包含正文：破坏性变更、安全修复、数据迁移、所有回退先前提交的情况。不要只用主题行压缩这些内容——后续排障需要上下文。

## 边界

仅生成提交信息。不执行 `git commit`，不暂存文件，不进行 amend。将消息输出为可粘贴的代码块。输入 `stop caveman-commit` 或 `normal mode` 可恢复为冗长的提交风格。
