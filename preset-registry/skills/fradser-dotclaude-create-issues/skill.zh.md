---
name: create-issues
allowed-tools: Task, Bash(gh:*), Bash(git:*)
description: Creates GitHub issues following test-driven development principles and proper labeling conventions. This skill should be used when the user asks to "create an issue", "file a bug", or needs to document new requirements, epics, or PR-scoped tasks.
argument-hint: [description]
user-invocable: true
---
# 创建 GitHub Issue

按照 TDD 原则和约定式提交标准，为 $ARGUMENTS 执行自动化 GitHub Issue 创建工作流。

## 上下文

- 当前 git 状态：!`git status`
- 当前分支：!`git branch --show-current`
- 开放的 Issue：!`gh issue list --state open --limit 10`
- GitHub 身份验证：!`gh auth status`

## 要求摘要

遵循 TDD 原则、约定式提交和受保护分支工作流。使用恰当的标签、自动关闭关键字和原子提交。完整标准请参阅 `references/requirements.md`。

## 阶段 1：仓库分析

**目标**：评估仓库状态、检测模板，并确定 Issue 的范围和类型。

**操作**：
1. 根据上下文分析当前分支（main/develop 与 PR 分支）
2. 查看开放的 Issue，以识别重复或相关工作
3. 检查贡献指南（`CONTRIBUTING.md`）并遵循其中的要求
4. 检测 `.github/ISSUE_TEMPLATE/` 目录中的 Issue 模板
5. 如果存在模板：使用 `gh issue create --list` 选择适当的模板
6. 根据 `$ARGUMENTS` 的复杂度确定 Issue 类型（Epic、PR 范围或审查）
7. 应用 `references/decision-logic.md` 中基于分支的决策逻辑

有关模板检测和合规性详情，请参阅 `references/repository-templates.md`。

## 阶段 2：创建 Issue

**目标**：使用恰当的结构、标签和链接创建 GitHub Issue。

**操作**：
1. 创建或验证所需的优先级标签是否存在（命令请参阅 `references/decision-logic.md`）
2. 按照 `references/issue-structure.md` 中的结构要求起草 Issue
3. 使用 `--label` 应用适当的标签（优先级、类型）
   - 使用 `--assignee` 指定负责人
   - 如有要求，使用 `--milestone` 关联里程碑，或使用 `--project` 关联项目
4. 如果是 PR 范围的 Issue，则添加自动关闭关键字（Epic 不得添加）
   - **关键：只有当 PR 合并到仓库的默认分支时，自动关闭关键字才会生效。** 如果解决该 Issue 的 PR 目标是非默认分支，请警告用户该 Issue **不会**自动关闭，必须手动关闭——完整规则和关键字表请参阅 `references/auto-closing-keywords.md`。
5. 如适用，关联相关 Issue 或 Epic

## 阶段 3：文档记录与交接

**目标**：记录决策并传达后续操作。

**操作**：
1. 记录分支策略决策及其理由
2. 向用户报告已创建 Issue 的编号和 URL
3. 如果当前处于 PR 分支且问题具有阻塞性，则向 PR 添加详细评论，而不是创建 Issue
4. 说明后续步骤（创建 PR、分配给团队成员等）

## 参考资料

- **要求**：`references/requirements.md` - 完整的 TDD 和提交标准
- **决策逻辑**：`references/decision-logic.md` - 基于分支的决策和 Issue 类型
- **Issue 结构**：`references/issue-structure.md` - 标题、标签、正文、自动关闭
- **自动关闭关键字**：`references/auto-closing-keywords.md` - 默认分支限制和关键字表
- **仓库模板**：`references/repository-templates.md` - 贡献指南和 Issue 模板
- **示例**：`references/examples.md` - 提交消息示例