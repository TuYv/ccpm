---
name: resolve-issues
allowed-tools: Bash(gh:*), Bash(git:*), EnterWorktree, ExitWorktree, Task, Skill
description: Resolves GitHub issues using isolated worktrees and test-driven development, then delegates PR creation to /github:create-pr so the quality gate and the /github:review-pr loop always run. This skill should be used when the user asks to "resolve an issue", "fix issue #123", or needs to implement a solution for a specific GitHub ticket using a structured workflow.
argument-hint: [issue number or description]
user-invocable: true
---
# 解决 GitHub Issue

使用隔离的 worktree、TDD 方法和代理协作来执行 Issue 解决工作流。

## 上下文

- 当前 git 状态：!`git status`
- 当前分支：!`git branch --show-current`
- 现有 worktree：!`git worktree list`
- 待处理的 Issue：!`gh issue list --state open --limit 10`
- GitHub 身份验证：!`gh auth status`

## 要求概述

使用隔离的 worktree，以避免干扰主开发环境。在代理支持下遵循 TDD 循环（红 → 绿 → 重构）。在提交中使用自动关闭关键字引用 Issue。有关受保护的 PR 工作流和提交规范，请参阅 `references/requirements.md`。

## 阶段 1：Issue 选择与 Worktree 设置

**目标**：选择目标 Issue 并准备隔离的开发环境。

**操作**：
1. 查看上下文中的待处理 Issue，并根据优先级和 `$ARGUMENTS` 进行选择
2. 检查现有 worktree，以确定是否可以复用
3. 使用 EnterWorktree 工具并指定一个描述性名称（例如 `fix-456-auth-redirect`），以创建隔离会话
4. 重命名自动生成的分支，使其符合约定：运行 `git branch -m <type>/<issue>-<description>`（命名规范请参阅 `references/workflow-details.md`）
5. 核实 Issue 的验收标准和依赖项

## 阶段 2：TDD 实现

**目标**：使用测试驱动开发和代理协作来实现修复。

**操作**：
1. 规划实现方案并评估架构影响
2. 编写失败的测试，以验证 Issue 已解决（红阶段）
3. 编写最少量的代码使测试通过（绿阶段）
4. 在保持测试通过的同时进行重构（重构阶段）
5. 运行质量验证命令，确保严格遵循 TDD 循环（项目特定的检查请参阅 `references/workflow-details.md`）。`/github:create-pr` 会在阶段 3 中重新运行完整的质量门禁，并作为 PR 前检查的权威依据。

## 阶段 3：创建 PR 与清理

**目标**：将 PR 创建工作交给 `/github:create-pr`，以便运行质量门禁和审查循环。仅在合并后执行清理，而合并可能会在许多轮对话之后发生。

**操作**：
1. 使用 `git push -u origin <branch-name>` 将分支推送到远程
2. **关键：此处不要调用 `gh pr create`。** 调用 `Skill("github:create-pr", "<issue reference>")`——例如 `Skill("github:create-pr", "Closes #456")`。这是该插件创建 PR 的唯一途径，负责质量/安全门禁、自动关闭关键字关联、非默认分支警告，以及强制移交给 `/github:review-pr`。完整契约请参阅 `references/pr-creation-handoff.md`。直接创建 PR 会绕过所有这些流程。
   - 如果修复在审查前仍需要进一步反馈，请在参数后追加 `--draft`
   - 仅当用户明确选择退出审查循环时，才追加 `--no-monitor`
3. **此 Skill 不会从这里继续执行。** `/github:create-pr` 会报告 PR URL，随后 `/github:review-pr` 将在该 PR 的整个生命周期内接管它：包括跨多个对话轮次的持久 Monitor、分类/修复/推送轮次，以及由其请求用户作出的合并决策。不要在当前流程中等待，不要重复报告 URL，也不要推测性地运行阶段 4。

## 阶段 4：合并后清理（后续轮次，回退流程）

**触发条件**：阶段 3 中的 PR 已实际合并——通常发生在后续轮次，即 `/github:review-pr` 完成合并决策之后。**现在由 `/github:review-pr` 的收尾流程负责合并后清理**（通过 `ExitWorktree action:"remove"` 移除工作树、切换到 `main`、与远程仓库同步），因此本阶段仅在该清理流程被跳过时作为**回退流程**运行：用户选择了“不合并”、流程中断导致工作树残留，或者这是一个全新会话，无法通过 `ExitWorktree` 移除先前会话创建的工作树。绝不要假定工作树已被移除——必须先验证。

**操作**：
1. 使用 `gh pr view <PR#> --json state -q .state` 验证合并状态是否返回 `MERGED`；绝不要想当然。
2. 使用 `git worktree list` 检查议题工作树是否仍然存在。如果 `/github:review-pr` 已将其移除，则直接跳到 `git fetch --prune`。
3. 如果工作树仍然存在：在执行 `ExitWorktree action:"remove"` 之前，**关键：确认当前仍在议题分支上**。如果检出状态已漂移到 `main`/`develop`，则停止——移除操作会删除长期存在的分支。远程头分支可能已经不存在；这没有问题。
4. 使用操作为 "remove" 的 ExitWorktree 工具清理工作树和分支。
   - 如果存在未提交的更改，ExitWorktree 会拒绝执行；在设置 `discard_changes: true` 之前，先征得用户确认
5. 执行 `git fetch --prune` 以同步远程跟踪分支。
6. 记录解决结果和所有后续任务

## 参考资料

- **要求**：`references/requirements.md` - 工作树设置、TDD 和提交标准
- **PR 创建交接**：`references/pr-creation-handoff.md` - PR 委托给 /github:create-pr 的原因
- **工作流详情**：`references/workflow-details.md` - 议题选择、TDD 循环、智能体协作
- **质量验证**：`references/quality-validation.md` - Node.js/Python 验证命令（共享）
- **示例**：`references/examples.md` - 提交消息示例