---
name: refactor
description: Executes automated refactoring for specific files, directories, or semantic queries. This skill should be used when the user asks to refactor specific files or directories, simplify recently changed code, clean up dead code in a limited scope, or invokes "/refactor".
argument-hint: "[files-or-directories-or-semantic-query]"
allowed-tools: ["Task", "Read", "Bash(git:*)", "Grep", "Glob"]
user-invocable: true
---
# 重构命令

使用 `refactor:code-simplifier` 代理对 $ARGUMENTS 执行自动重构。

## 操作前检查
**目标**：确保在启动代理前以确定性的方式解析范围。

**操作**：
1. 运行 `git rev-parse --is-inside-work-tree`；当提供了明确路径时，即使结果为 false 也继续执行
2. 通过修剪空白字符并保留带引号的路径片段来规范化参数
3. 将空参数列表视为“最近更改”模式

## 阶段 1：确定目标范围
**目标**：根据参数或会话上下文确定要重构的文件。

**操作**：
1. 如果提供了参数：使用 Glob 验证其是否为文件/目录路径
2. 如果路径存在：直接将其用作重构范围
3. 如果路径不存在：将参数视为语义查询，使用 Grep 搜索代码库
4. 如果没有参数：运行 `git diff --name-only` 以查找最近修改的代码文件
5. 如果未找到最近的更改：通知用户并退出，不执行重构

关键要求：绝不将 `node_modules/`、`.git/`、`dist/`、`build/`、锁文件或编译产物纳入重构范围——使用 Grep `--glob` 排除项强制执行此要求。

有关搜索策略和边界情况，请参阅 `references/scope-determination.md`。

## 阶段 2：启动重构代理
**目标**：启用激进模式执行 `refactor:code-simplifier` 代理。

**操作**：
1. 使用目标范围和激进模式标志启动 `refactor:code-simplifier` 代理
2. 传递范围确定方法（路径、语义查询或会话上下文）
3. 代理会自动加载 `refactor:best-practices` 技能，并应用特定于语言的模式

有关详细的 Task 参数，请参阅 `references/agent-configuration.md`。

## 阶段 3：总结
**目标**：报告全面的更改总结。

**操作**：
1. 报告重构的文件总数，并按改进类型对更改进行分类
2. 列出已应用的最佳实践和已移除的旧代码
3. 建议要运行的测试，并提供针对实际范围定制的回滚命令（例如：`git restore --worktree --staged <files>`）

有关详细的总结格式，请参阅 `references/output-requirements.md`。

## 要求

- 无需用户确认，立即执行
- 当语义搜索返回多个结果时，重构所有匹配的文件
- 对于项目范围的重构，引导用户使用 `/refactor-project`
- 除非用户明确要求更改行为，否则保留原有行为和公共接口