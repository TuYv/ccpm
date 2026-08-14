---
name: fix-pr-issues
description: Use when addressing Basic Memory pull request feedback, failed checks, or Codex review blockers, then re-running the latest-head review gate.
---
# 修复 Basic Memory PR 问题

解决 PR 反馈和失败的检查，然后对新的
head SHA 应用 `pr-review-loop`。此技能绝不会合并 PR。

## 收集

1. 确定当前有效的 PR 和最新 head：
   - `gh pr view --json number,url,headRefOid,mergeStateStatus,statusCheckRollup`
2. 收集确切的反馈：
   - PR 评论和审查摘要
   - 行内审查评论和未解决的审查线程
   - 失败的 GitHub Actions 作业和相关日志
   - `pr-review-loop` 所描述的 Codex 反应和最新 head 的审查状态
3. 构建一份简短的问题台账，记录每个条目的来源、具体问题、预期修复
   以及所需的验证。

## 修复

1. 每次处理一个台账条目。
2. 编辑每个文件前，先完整阅读该文件。
3. 保持差异范围尽可能小，并保留不相关的用户更改。
4. 先运行最小但有意义的验证，然后根据需要扩大验证范围。
5. 使用 `git commit -s` 提交更改后的代码或文档。

如果某条评论有误、已过时、被有意排除在范围之外，或不值得为之权衡取舍，
请回复简洁的证据，而不是强行更改代码。

## 推送并重新检查

1. 推送分支。
2. 确认检查正在针对新的 `headRefOid` 运行，并监视检查直至完成。
3. 完整应用 `pr-review-loop`。推送代码后，先前的 Codex 批准即已过时；必须获得
   当前 head 的批准信号，并确保不存在未解决且未过时的 Codex 线程。
4. 如果出现新反馈，请将其添加到台账中并重复此循环。

## 回复

对于每条已处理的评论或阻塞项，请回复修复提交、执行的验证
以及当前的 Codex 门禁状态。只有在发布包含证据的修复或理由后，
才能解决实质性线程。