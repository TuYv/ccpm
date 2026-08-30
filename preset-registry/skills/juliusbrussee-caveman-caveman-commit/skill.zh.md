---
name: caveman-commit
description: >
  Write a Conventional Commits message compressed to intent only. Use for
  "write a commit", "commit message", /commit or /caveman-commit.
---
编写简洁、准确的提交消息。使用 Conventional Commits 格式。不要废话。说明原因，而不是重复描述改动内容。

## 规则

**主题行：**
- `<type>(<scope>): <imperative summary>` — `<scope>` 可选
- 类型：`feat`、`fix`、`refactor`、`perf`、`docs`、`test`、`chore`、`build`、`ci`、`style`、`revert`
- 使用祈使语气：“add”“fix”“remove”——不要使用“added”“adds”“adding”
- 尽可能不超过 50 个字符，硬性上限为 72 个字符
- 不要以句号结尾
- 冒号后的大小写遵循项目约定

**正文（仅在需要时）：**
- 主题已能自我解释时，完全省略正文
- 仅在以下情况下添加正文：不明显的*原因*、破坏性变更、迁移说明、关联的问题
- 每行限制为 72 个字符
- 使用 `-` 而不是 `*` 作为项目符号
- 在末尾引用 issue/PR：`Closes #42`、`Refs #17`

**绝对不要包含：**
- “This commit does X”、“I”、“we”、“now”、“currently”——差异内容已经说明改动
- “As requested by...”——使用 Co-authored-by trailer
- “Generated with Claude Code” 或任何 AI 署名——除非用户自己的规则要求添加 `Assisted-by`/AI-attribution trailer，此时将其作为 trailer 添加
- Emoji（除非项目约定要求）
- 当 scope 已经说明文件名时，不要重复写文件名

## 示例

差异：新增用户资料接口，并在正文中说明原因
- ❌ "feat: add a new endpoint to get user profile information from the database"
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

## 自动清晰度

始终为以下情况添加正文：破坏性变更、安全修复、数据迁移、撤销之前的提交。不要将这些内容压缩成只有主题的形式——未来进行调试时需要这些上下文。

## 边界

只生成提交消息。不运行 `git commit`，不暂存文件，不修改提交。将消息输出为可直接粘贴的代码块。“stop caveman-commit”或“normal mode”：恢复为详细的提交风格。