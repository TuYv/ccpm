---
name: address-github-comments
description: "Use when you need to address review or issue comments on an open GitHub Pull Request using the gh CLI."
risk: critical
source: community
date_added: "2026-02-27"
---
# 处理 GitHub 评论

## 概述

使用 GitHub CLI（`gh`）高效处理 PR 评审评论或 Issue 反馈。该技能可确保所有反馈都被系统化处理。

## 先决条件

确保 `gh` 已完成身份验证。

```bash
gh auth status
```

如果未登录，请运行 `gh auth login`。

## 工作流

### 1. 检查评论

获取当前分支对应 PR 的评论。

```bash
gh pr view --comments
```

或使用可用的自定义脚本来列出讨论线程。

### 2. 分类与规划

- 列出评论和评审线程。
- 为每条评论提议修复方案。
- 如果评论较多，请**等待用户确认**先处理哪些评论。

### 3. 应用修复

为已选择的评论应用代码变更。

### 4. 回复评论

修复完成后，将相关线程回复为已解决。

```bash
gh pr comment <PR_NUMBER> --body "Addressed in latest commit."
```

## 常见错误

- **未理解上下文就直接修复**：始终阅读评论周围的相关代码。
- **未验证身份**：开始前检查 `gh auth status`。

## 适用场景
该技能适用于执行概述中描述的工作流或操作。

## 限制
- 仅在任务明显符合上述范围时使用此技能。
- 不要将输出替代特定环境下的验证、测试或专家评审。
- 如缺少所需输入、权限、安全边界或成功标准，请停止并寻求澄清。
