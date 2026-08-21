---
name: analyze-issue
description: Analyze a GitHub issue and create a detailed technical specification
argument-hint: Issue number (e.g., 42)
allowed-tools: Bash(gh issue:*), Read, Write, Glob, Grep
---
请分析 GitHub issue #$ARGUMENTS 并创建一份技术规格说明。

请遵循以下步骤：

1. 检查 issue 是否已加载：
   - 在 `./specs/issues/` 文件夹中查找 issue 文件
   - 文件命名格式：`<number-padded-to-3-digits>-<kebab-case-title>.md`
   - 如果未找到，请从 GitHub 获取 issue 详情（参见步骤 2）

2. 获取 issue 详情（如果尚未加载）：
   - 阅读 `.claude/commands/load-issues.md`，了解如何获取 issue 详情
   - 按照 load-issues.md 中的格式保存 issue 文件

3. 全面理解需求
4. 审查相关代码和项目结构
5. 使用以下格式创建技术规格说明

# Issue #$ARGUMENTS 的技术规格说明

## Issue 摘要
- 标题：[来自 GitHub 的 issue 标题]
- 描述：[issue 的简要描述]
- 标签：[issue 的标签]
- 优先级：[根据 issue 内容确定为高/中/低]

## 问题陈述
[用 1-2 个段落说明问题]

## 技术方案
[详细的技术方案]

## 实施计划
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

## 测试计划
1. 单元测试：
   - [测试场景]
2. 组件测试：
   - [测试场景]
3. 集成测试：
   - [测试场景]

## 需要修改的文件
- [文件路径]：[变更内容]

## 需要创建的文件
- [文件路径]：[用途]

## 可复用的现有工具
- [工具名称/路径]：[用途]

## 成功标准
- [ ] [标准 1]
- [ ] [标准 2]

## 范围之外
- [事项 1]
- [事项 2]

请记住遵循我们严格的 TDD 原则、KISS 方法以及文件不超过 300 行的限制。

重要：完成分析后，请将完整的技术规格说明保存至：
`./specs/issues/<number-padded-to-3-digits>-<kebab-case-title>.specs.md`

例如，对于标题为“Make code review trigger on any *.SQL and .sh file changes”的 issue #7，请保存至：
`./specs/issues/007-make-code-review-trigger-on-sql-sh-changes.specs.md`

保存后，请向用户提供简短摘要，确认以下内容：
- 已分析的 issue 编号和标题
- 规格说明的保存文件路径
- 规格说明中的关键要点（2-3 个要点）