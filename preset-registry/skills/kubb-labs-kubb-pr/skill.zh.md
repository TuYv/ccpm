---
name: pr
description: Rules and checklist for preparing PRs, creating changesets, and releasing packages in the monorepo.
---
# PR 技能

此技能用于指导智能体了解 PR 的前置条件、changeset 的用法以及审阅者的期望。

## 何时使用

- 当用户询问如何准备 PR，或合并前需要执行哪些检查时
- 当指导贡献者创建 changeset 或更新变更日志时

## 功能

- 强制执行 PR 检查清单：`format, lint, typecheck, tests`
- 指导如何创建和使用 changeset 进行版本升级
- 说明发布与合并要求以及文档更新要求

## 建议使用的命令

```bash
pnpm format && pnpm lint:fix
pnpm typecheck
pnpm test
pnpm changeset
```

## 检查清单

- [ ] CI 通过（单元测试、代码检查、类型检查）
- [ ] 如果公开行为发生变化，文档已更新
- [ ] PR 中不包含任何密钥
- [ ] 已通过 changeset 进行适当的版本升级

## 相关技能

| 技能                                               | 用途                          |
| -------------------------------------------------- | ----------------------------- |
| **[../changelog/SKILL.md](../changelog/SKILL.md)** | 更新变更日志和 changeset      |