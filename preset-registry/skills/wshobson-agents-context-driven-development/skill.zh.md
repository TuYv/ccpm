---
name: context-driven-development
description: >-
  Creates and maintains project context artifacts (product.md, tech-stack.md, workflow.md, tracks.md)
  in a `conductor/` directory. Scaffolds new projects from scratch, extracts context from existing
  codebases, validates artifact consistency before implementation, and synchronizes documents as the
  project evolves. Use when setting up a project, creating or updating product docs, managing a tech
  stack file, defining development workflows, tracking work units, onboarding to an existing codebase,
  or running project scaffolding.
version: 1.0.0
---
# 上下文驱动开发

指导如何将上下文作为一种与代码并列的受管理工件来实现和维护，通过结构化的项目文档实现一致的 AI 交互和团队协同。

## 何时使用此技能

- 使用 Conductor 搭建新项目
- 理解各上下文工件之间的关系
- 在多次 AI 辅助开发会话之间保持一致性
- 让团队成员上手现有的 Conductor 项目
- 决定何时更新上下文文档
- 管理绿地（greenfield）与棕地（brownfield）项目的上下文

## 详细模式与完整示例

详细的模式文档位于 `references/details.md`。当上方的导航层级信息不足时，请阅读该文件。

## 最佳实践

1. **先读上下文**：在开始工作之前始终先阅读相关工件
2. **小幅更新**：对上下文做增量修改，而非大规模重写
3. **关联决策**：在做出实现选择时引用上下文
4. **版本化上下文**：将上下文变更与代码变更一同提交
5. **审查上下文**：在代码评审中纳入对上下文工件的评审
6. **定期验证**：在开展重大工作之前运行上下文验证清单
7. **沟通变更**：当上下文工件发生显著变化时通知团队
8. **保留历史**：使用 git 跟踪上下文随时间的演变
9. **质疑过期内容**：如果上下文感觉不对，就去调查并更新
10. **保持可操作性**：每个上下文条目都应能指导某个决策或行为
