---
name: address-github-comments
description: "Use when you need to address review or issue comments on an open GitHub Pull Request using the gh CLI."
risk: critical
source: community
date_added: "2026-02-27"
---
# 处理 GitHub 评论

## 概览

使用 GitHub CLI（`gh`）高效处理 PR 审查评论或 issue 反馈。该技能可确保所有反馈得到系统化处理。

## 前提条件

确保 `gh` 已完成身份验证。

```bash
gh auth status
```

如果未登录，请运行 `gh auth login`。

## 工作流

### 1. 查看评论

获取当前分支 PR 的评论。

```bash
gh pr view --comments
```

或者在可用时使用自定义脚本列出线程。

### 2. 分类与规划

- 列出评论和审查线程。
- 为每条评论提出修复方案。
- 如果评论较多，**请等待用户确认**先处理哪些评论。

### 3. 应用修复

对选定的评论应用代码更改。

### 4. 回复评论

修复完成后，将线程回复为已解决状态。

```bash
gh pr comment <PR_NUMBER> --body "Addressed in latest commit."
```

## 常见错误

- **在未理解上下文的情况下应用修复**：始终阅读评论周边的代码。
- **未验证身份验证**：开始前检查 `gh auth status`。

## 适用场景
该技能适用于执行概览中描述的工作流或操作。

## 限制
- 仅在任务明确符合上述范围时使用该技能。
- 不要将输出替代特定环境下的验证、测试或专家审核。
- 如果缺少所需输入、权限、安全边界或成功标准，应停止并请求澄清。
