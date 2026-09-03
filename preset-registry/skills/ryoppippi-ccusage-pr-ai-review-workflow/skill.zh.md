---
name: pr-ai-review-workflow
description: Manages PR AI review loops with gh. Use after opening or updating a PR to request review, inspect comments, reply, fix, and re-request review.
---
# PR AI 审查工作流

在创建 PR 或向已打开的 PR 推送提交后使用此技能。审查工具和机器人名称可能会变化；请将 `@coderabbitai` 和 `cubic-dev-ai` 等名称视为当前的示例，而非永久性假设。

## 提交策略

PR 通常以 squash 方式合并。不要为了保持 PR 只有一个提交而默认使用 `git commit --amend` 或强制推送。对于审查修复、生成的技能更新以及讨论结果，优先采用小的、可独立回滚的后续提交。使用 `commit` 技能来获得原子化的提交结构和提交信息。

仅在以下情况下使用 amend：用户明确要求时、修复紧邻的上一个未发布提交时，或在任何审查者查看之前纠正本地错误时。

## 请求审查

创建 PR 或推送有意义的后续提交后，检查审查者是否已在运行。如果没有，添加一条提及所配置审查者的 PR 会话评论。

如果存在仓库本地约定，则优先遵循这些约定。如果仓库已更换审查者，请使用近期 PR 或项目文档中当前的审查者提及方式，而不是上面的示例。

## PR 描述与评论

所有面向仓库的 GitHub 沟通均使用美式英语撰写，包括 PR 描述、issue 评论、分类备注、审查回复以及面向机器人的回复。

创建或编辑多行 PR 描述时，使用 `--body-file -` 并通过 stdin 传入 Markdown。不要在带引号的 `--body` 参数中嵌入 `\n` 转义序列；fish 和 shell 的引号处理可能将它们按字面保留，从而破坏渲染后的 PR 描述。

正确：

```sh
printf "%s\n" \
	"Summary paragraph." \
	"" \
	"Testing:" \
	"- pnpm run format" \
	"- pnpm typecheck" \
	"- pnpm run test" \
	| gh pr edit <pr-number> --body-file -
```

错误：

```sh
gh pr edit <pr-number> --body "Summary\n\nTesting:\n- pnpm run test"
```

## 等待并检查

在宣告 PR 就绪之前，轮询审查和评论。普通回复使用扁平的 REST 评论列表；仅当线程的解决状态很重要时才使用 GraphQL 审查线程。

如果在处理 PR 期间 CI 检查失败，先切换到 `fix-ci` 技能，再请求下一轮审查。

## 回应审查

将每条审查意见分类为：可执行、提问、误报或信息性。不要默默忽略可执行的评论。

对于可执行的反馈：

1. 应用符合仓库约定的最小修复。
2. 运行相关检查。
3. 使用 `commit` 技能创建一个小的后续提交。
4. 使用 `git push` 正常推送。
5. 回复对应的评论，说明改动了什么以及通过了哪些验证。

回复 AI 审查者的行内评论时，在回复正文中显式提及审查机器人，使机器人将该消息视为针对它的回复，而非普通的人类讨论。对 CodeRabbit 的回复使用 `@coderabbitai`。对于 Cubic，使用 PR/检查或近期评论中显示的当前 Cubic 机器人句柄，并在回复开头提及它。

阅读 `references/gh-review-commands.md` 以获取具体的 `gh` 命令，用于请求审查、列出评论、回复行内审查评论、添加顶层 PR 评论、更新自己的评论以及查询审查线程。

不同意某条审查意见时，请结合具体的仓库上下文进行回复，而不是含糊地否定。如果讨论改变了实现，请提交该更改并再次回复结果。

## 再次请求审查

推送修复后，如果审查者没有自动重新运行，则再次请求一轮审查。

不要无限等待。如果在合理的轮询时间窗口后审查者仍未响应，让 PR 保持最新提交已推送的状态，并注明哪些审查仍在等待中。
