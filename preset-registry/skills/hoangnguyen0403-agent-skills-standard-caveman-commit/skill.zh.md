---
name: caveman-commit
description: >
  Ultra-compressed commit message generator. Cuts noise from commit messages while preserving
  intent and reasoning. Conventional Commits format. Subject ≤50 chars, body only when "why"
  isn't obvious. Use when user says "write a commit", "commit message", "generate commit",
  "/commit", or invokes /caveman-commit. Auto-triggers when staging changes.
---
提交信息要简短、准确。使用 Conventional Commits 格式。重在说明原因，而非做了什么。

## 规则

**主题行：**
- `<type>(<scope>): <imperative summary>` — `<scope>` 可选
- 类型：`feat`、`fix`、`refactor`、`perf`、`docs`、`test`、`chore`、`build`、`ci`、`style`、`revert`
- 使用祈使语气："add"、"fix"、"remove"——不要使用 "added"、"adds"、"adding"
- 尽可能不超过 50 个字符，硬性上限为 72 个字符
- 结尾不加句号
- 冒号后的大小写应遵循项目惯例

**正文（仅在需要时添加）：**
- 如果主题已经足够清楚，则完全省略正文
- 仅在以下情况添加正文：原因不明显、破坏性变更、迁移说明、关联议题
- 每行不超过 72 个字符
- 项目符号使用 `-`，不要使用 `*`
- 在末尾引用议题/PR：`Closes #42`、`Refs #17`

**绝对不要包含：**
- “此提交做了 X”、“我”、“我们”、“现在”、“当前”——差异内容已经说明做了什么
- “应……的要求”——改用 Co-authored-by 尾注
- “Generated with Claude Code” 或任何 AI 归属声明
- Emoji（除非项目惯例要求）
- 当作用域已经说明文件名时，不要再次复述文件名

## 示例

差异：新增用户资料端点，并在正文中解释原因
- ❌ “feat: 添加一个从数据库获取用户资料信息的新端点”
- ✅
  ```
  feat(api): add GET /users/:id/profile

  Mobile client needs profile data without the full user payload
  to reduce LTE bandwidth on cold-launch screens.

  Closes #128
  ```

差异：破坏性 API 变更
- ✅
  ```
  feat(api)!: rename /v1/orders to /v1/checkout

  BREAKING CHANGE: clients on /v1/orders must migrate to /v1/checkout
  before 2026-06-01. Old route returns 410 after that date.
  ```

## 自动明确化

以下情况始终包含正文：破坏性变更、安全修复、数据迁移、任何撤销先前提交的变更。绝不要将这些内容压缩成仅有主题的形式——未来的调试人员需要这些上下文。

## 边界

仅生成提交信息。不运行 `git commit`，不暂存文件，也不修订提交。将信息作为可直接粘贴的代码块输出。输入 “stop caveman-commit” 或 “normal mode” 时，恢复为详细的提交信息风格。