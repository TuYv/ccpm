---
name: changelog-automation
description: Automate changelog generation from commits, PRs, and releases following Keep a Changelog format. Use when setting up release workflows, generating release notes, or standardizing commit conventions.
---
# 变更日志自动化

用于按照行业标准自动完成变更日志生成、发布说明和版本管理的模式与工具。

## 何时使用此技能

- 搭建自动化变更日志生成
- 实现 Conventional Commits
- 创建发布说明工作流
- 标准化提交信息格式
- 生成 GitHub/GitLab 发布说明
- 管理语义化版本控制

## 核心概念

### 1. Keep a Changelog 格式

```markdown
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Detailed patterns and worked examples

Detailed pattern documentation lives in `references/details.md`. Read that file when the navigation tier above is insufficient.

## Summary

This release introduces dark mode support and improves checkout performance
by 40%. It also includes important security updates.

## Highlights

### 🌙 Dark Mode

Users can now switch to dark mode from settings. The preference is
automatically saved and synced across devices.

### ⚡ Performance

- Checkout flow is 40% faster
- Reduced bundle size by 15%

## Breaking Changes

None in this release.

## Upgrade Guide

No special steps required. Standard deployment process applies.

## Known Issues

- Dark mode may flicker on initial load (fix scheduled for v2.1.1)

## Dependencies Updated

| Package | From    | To      | Reason                   |
| ------- | ------- | ------- | ------------------------ |
| react   | 18.2.0  | 18.3.0  | Performance improvements |
| lodash  | 4.17.20 | 4.17.21 | Security patch           |
```

## 提交信息示例

```bash
# Feature with scope
feat(auth): add OAuth2 support for Google login

# Bug fix with issue reference
fix(checkout): resolve race condition in payment processing

Closes #123

# Breaking change
feat(api)!: change user endpoint response format

BREAKING CHANGE: The user endpoint now returns `userId` instead of `id`.
Migration guide: Update all API consumers to use the new field name.

# Multiple paragraphs
fix(database): handle connection timeouts gracefully

Previously, connection timeouts would cause the entire request to fail
without retry. This change implements exponential backoff with up to
3 retries before failing.

The timeout threshold has been increased from 5s to 10s based on p99
latency analysis.

Fixes #456
Reviewed-by: @alice
```

## 最佳实践

### 推荐做法

- **遵循 Conventional Commits** - 便于实现自动化
- **编写清晰的信息** - 未来的你会感谢现在的自己
- **引用 issue** - 将提交与工单关联
- **一致地使用 scope** - 定义团队约定
- **自动化发布** - 减少人为错误

### 不推荐做法

- **不要混合变更** - 每次提交只包含一个逻辑变更
- **不要跳过校验** - 使用 commitlint
- **不要手动编辑** - 仅使用自动生成的变更日志
- **不要遗漏破坏性变更** - 用 `!` 或 footer 标记
- **不要忽视 CI** - 在流水线中校验提交
