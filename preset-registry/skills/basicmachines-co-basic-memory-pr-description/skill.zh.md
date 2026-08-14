---
name: pr-description
description: Use when opening or updating a GitHub PR - writes a detailed PR description that explains what changed, why it changed, how it was implemented, and how it was tested.
license: MIT
---
# PR 描述撰写器

创建并发布高质量的 PR 描述，帮助审阅者理解变更意图、实现细节和验证步骤。

## 使用场景

- 创建新的 PR
- 更新过时或内容过少的 PR 描述
- 记录实现原理，以供日后调试

## 目标

每个 PR 正文都应清晰回答以下问题：

1. 改了什么？
2. 为什么现在要做此变更？
3. 如何实现？
4. 如何测试？
5. 还存在哪些风险或后续事项？

## 工作流程

1. 获取 PR 上下文和变更文件。
2. 从提交和代码变更中提取意图。
3. 起草结构化的 PR 正文。
4. 将正文应用到 PR。
5. 重新打开 PR 视图并确认正文和标签。

## 命令

```bash
# Identify the active PR for current branch
gh pr view --json number,title,url,baseRefName,headRefName

# Inspect changed files and patch summary
gh pr diff --name-only
gh pr diff

# Review commit messages for intent
git log --oneline --decorate -n 10

# Apply updated body
gh pr edit <pr-number> --body-file /tmp/pr-body.md
```

## 正文结构

使用 [references/pr-body-template.md](references/pr-body-template.md) 中的模板。

必需章节：

- `## Why`
- `## What Changed`
- `## Implementation Details`
- `## Testing`
- `## Risks / Follow-ups`

## 质量标准

- 内容要具体：明确指出具体的文件、路由、脚本和命令。
- 不要只描述实现机制，还应解释权衡和约束。
- 测试章节必须包含实际运行的确切命令及其结果。
- 如果某些内容未经测试，请明确说明。

## 可选增强项

- UI 相关工作可添加 `## Screenshots`。
- 当发布顺序很重要时，添加 `## Rollout Notes`。
- 对于大型差异，添加 `## Reviewer Guide`。