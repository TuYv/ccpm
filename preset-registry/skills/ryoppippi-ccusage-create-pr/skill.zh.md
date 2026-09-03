---
name: create-pr
description: Runs the full PR lifecycle. Use when creating a branch, committing, pushing, opening a PR, requesting AI review, replying to review threads, and driving CI to green.
---
# 创建 PR

本技能负责此仓库中所有与 PR 相关的工作：分支设置、开启 PR、发起 AI 审查、回复审查者评论线程、后续推送、CI 检查以及合并。

一个 PR 是一个可审查的职责单元，可以包含多个原子提交。分支并不是 PR 的边界——独立的工作应拆分为单独的 PR，只有存在依赖关系的工作才应堆叠（stack）。

## 工作流程

1. 建分支。推送到 `main` 需要用户明确许可；其余一切改动都走以变更内容命名的功能分支（现有分支遵循 `<type>/<description>` 命名格式）。提交来自 `commit` 技能，因此保持原子化且可独立回退。与任务无关的格式化工具改动、生成的文件以及用户的编辑一律不入暂存区。
2. 推送并开启 PR——见 `references/open-pr.md`。squash 合并会把 PR 标题写入为 `main` 上的提交主题，因此 CI 对标题执行与 `commit` 技能所述相同的 Conventional Commit scope 规则。
3. 发起并处理 AI 审查——见 `references/ai-review.md`；用于回复和查询评论线程状态的 `gh` 调用见 `references/gh-review.md`。
4. 开启 PR 之后以及每次推送之后，用 `gh pr checks` 监控 CI。阅读失败步骤的日志和注解而不是摘要，然后用 `fix-ci` 技能进行修复，如果机器人没有自动重跑，就请它们再审一轮。
5. 仅在用户明确提出要求且满足下列条件时才合并：`gh pr merge <pr> --squash --delete-branch`。Squash 是本仓库的常规流程。

## 就绪（Ready）意味着

- 分支已推送，PR 已存在，其正文描述了变更内容以及已运行的验证。
- CodeRabbit——以及在该 PR 上可用时的 Cubic——已审查最新推送的提交，没有未解决的可行反馈。
- 每一项必需检查都通过。排队中、已取消、失败或缺失的必需检查都意味着未就绪。
- 用户已拿到 PR URL，以及任何残余风险或待处理的外部状态。

当机器人或 CI 系统超出合理的轮询窗口仍无响应时，应准确说明还有什么在等待，而不是宣称已完成，并保留可见的 PR 评论或 CI 状态以便跟进。

## 背景信息

- 审查机器人只在其 handle 被 @ 提及时才会对评论采取行动——包括最初的请求，以及之后每一条要求它们做事的回复。
- 在审查者已阅读 PR 之后进行 amend 或强制推送，需要用户明确提出请求。
