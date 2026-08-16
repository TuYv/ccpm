---
name: refactor-project
description: Executes automated project-wide refactoring with a focus on cross-file optimization. This skill should be used when the user asks for project-wide refactoring, cross-file simplification, consistency standardization across the codebase, duplication reduction, or invokes "/refactor-project".
argument-hint: (no arguments needed)
allowed-tools: ["Task", "Read", "Bash(git:*)", "Grep", "Glob"]
user-invocable: true
---
# 重构项目命令

使用 `refactor:code-simplifier` agent 执行自动化的项目级重构，重点关注跨文件优化。

## 操作前检查
**目标**：确保项目级执行过程明确且可复现。

**操作**：
1. 运行 `git rev-parse --is-inside-work-tree`；如果为 false，则告知用户项目级模式需要 git 工作区
2. 使用 `git rev-parse --short HEAD` 记录当前修订版本，并将其纳入最终摘要，以提供回滚上下文
3. 忽略命令参数，继续执行完整项目发现

## 阶段 1：分析项目范围
**目标**：发现所有代码文件并显示范围摘要。

**操作**：
1. 使用针对常见扩展名的 Glob 模式查找所有代码文件
2. 过滤掉 `node_modules/`、`.git/`、`dist/`、`build/`、`vendor/`、`.venv/`
3. 按语言/扩展名对文件进行分组，并识别主要源代码目录
4. 显示范围摘要（文件数量、语言、目录），然后自动继续

有关排除模式和边缘情况，请参阅 `references/scope-analysis.md`。

## 阶段 2：启动重构 Agent
**目标**：使用项目级范围和跨文件重点执行 `refactor:code-simplifier` agent。

**操作**：
1. 启动 `refactor:code-simplifier` agent，并传入所有已发现的代码文件
2. 传入跨文件优化重点：减少重复、统一模式
3. 传入激进模式标志以移除遗留代码
4. Agent 自动加载 `refactor:best-practices` skill 并应用特定于语言的模式

有关详细的 Task 参数，请参阅 `references/agent-configuration.md`。

## 阶段 3：摘要
**目标**：报告项目级变更的全面摘要。

**操作**：
1. 报告重构的文件总数（数量及占项目的百分比）
2. 按改进类型列出变更，以及所做的跨文件改进
3. 列出已应用的最佳实践和已移除的遗留代码
4. 建议要运行的测试套件，并建议按逻辑分组审查变更
5. 提供与所记录基线关联的更安全回滚命令（例如：`git restore --worktree --staged .`）

有关详细的摘要格式，请参阅 `references/output-requirements.md`。

## 要求

- 显示范围后立即执行（无需确认）
- 对所有已发现的代码文件执行整个项目的重构
- 优先减少跨文件重复并统一模式
- 除非用户明确请求行为变更，否则保留现有行为和公共接口