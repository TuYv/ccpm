---
name: github
description: GitHub patterns using gh CLI for pull requests, stacked PRs, code review, branching strategies, and repository automation. Use when working with GitHub PRs, merging strategies, or repository management tasks.
license: MIT
metadata:
  author: Callstack
  tags: github, gh-cli, pull-request, stacked-pr, squash, rebase
---
# GitHub 模式

## 工具

所有 GitHub 操作均使用 `gh` CLI。优先使用 CLI，而非 GitHub MCP 服务器，以减少上下文用量。

## 快速命令

```bash
# Create a PR from the current branch
gh pr create --title "feat: add feature" --body "Description"

# Squash-merge a PR
gh pr merge <PR_NUMBER> --squash --title "feat: add feature (#<PR_NUMBER>)"

# View PR status and checks
gh pr status
gh pr checks <PR_NUMBER>
```

## 堆叠 PR 工作流摘要

合并一系列堆叠 PR（每个 PR 都以前一个分支为目标分支）时：

1. 通过 squash merge 将**第一个 PR 合并**到 main
2. **对于后续的每个 PR**：rebase 到 main，将基础分支更新为 main，然后执行 squash merge
3. **发生冲突时**：停止操作，并请用户手动解决

```bash
# Rebase next PR's branch onto main, excluding already-merged commits
git rebase --onto origin/main <old-base-branch> <next-branch>
git push --force-with-lease origin <next-branch>
gh pr edit <N> --base main
gh pr merge <N> --squash --title "<PR title> (#N)"
```

完整的分步详情请参阅 [stacked-pr-workflow.md][stacked-pr-workflow]。

## 快速参考

| 文件 | 说明 |
| --- | --- |
| [stacked-pr-workflow.md][stacked-pr-workflow] | 将堆叠 PR 作为独立的 squash 提交合并到 main |

## 问题 -> 技能映射

| 问题 | 从这里开始 |
| --- | --- |
| 干净地合并堆叠 PR | [stacked-pr-workflow.md][stacked-pr-workflow] |

[stacked-pr-workflow]: references/stacked-pr-workflow.md