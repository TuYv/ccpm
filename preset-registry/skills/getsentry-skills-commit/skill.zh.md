---
name: commit
description: Use for every request to commit changes or draft a commit message. Creates Sentry-style conventional commits with issue references.
---
# Sentry 提交消息

## 提交之前

```bash
git branch --show-current
```

如果分支是 `main` 或 `master`，请创建功能分支，除非用户明确要求
直接提交。再次检查分支；如果仍是 `main` 或 `master`，请停止操作。

每次只提交一项连贯且可独立审查的更改。

## 消息规则

使用：

```text
<type>(<scope>): <subject>

<optional body>

<optional footer>
```

- 作用域是可选的。对于破坏性更改，在 `:` 前添加 `!`。
- 主题使用祈使语气和现在时；首字母大写，不要以句号结尾，
  并将其控制在 70 个字符以内。
- 每行长度不得超过 100 个字符。
- 仅在有用时使用正文。说明更改了什么以及为什么更改，并在有帮助时
  包括之前的行为或动机。
- 切勿包含客户或组织名称、用户电子邮件、支持工单
  内容、机密信息或个人身份信息。改为描述技术症状。

允许的类型：`feat`、`fix`、`ref`、`perf`、`docs`、`test`、`build`、
`ci`、`chore`、`style`、`meta`、`license` 和 `revert`。

对于不改变行为的重构使用 `ref`，对于不改变逻辑的格式调整使用 `style`，
对于仓库元数据使用 `meta`。

## 页脚

- `Fixes <issue>` 会在合并时关闭问题。
- `Refs <issue>` 会关联问题但不关闭它。
- 对于破坏性更改，添加 `BREAKING CHANGE: <impact>`。

## 创建提交

对段落和页脚分别使用单独的 `-m` 参数。切勿在提交消息中放入字面量
`\n` 序列，也不要打开交互式编辑器。

```bash
git commit -m "fix(api): Handle null response in user endpoint" \
  -m "Return 404 when the user API finds a deleted account." \
  -m "Fixes SENTRY-5678"
```