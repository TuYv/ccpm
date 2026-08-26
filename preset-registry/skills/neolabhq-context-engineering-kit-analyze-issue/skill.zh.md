---
name: analyze-issue
description: Analyze a GitHub issue and create a detailed technical specification
---
请分析 GitHub issue #$ARGUMENTS 并创建技术规格说明。

请按照以下步骤操作：

1. 检查 issue 是否已加载：
   - 在 `./specs/issues/` 文件夹中查找 issue 文件
   - 文件命名格式：`<number-padded-to-3-digits>-<kebab-case-title>.md`
   - 如果未找到，请从 GitHub 获取 issue 详细信息（参见第 2 步）

2. 获取 issue 详细信息（如果尚未加载）：
   - 阅读 `.claude/commands/load-issues.md`，了解如何获取 issue 详细信息
   - 按照 `load-issues.md` 中的格式保存 issue 文件

3. 彻底理解需求
4. 检查相关代码和项目结构
5. 按照以下格式创建技术规格说明

# Issue #$ARGUMENTS 的技术规格说明

## Issue Summary
- 标题：[来自 GitHub 的 issue 标题]
- 描述：[issue 的简要描述]
- 标签：[issue 的标签]
- 优先级：[根据 issue 内容确定为 High/Medium/Low]

## Problem Statement
[用 1-2 段说明问题]

## Technical Approach
[详细的技术方案]

## Implementation Plan
1. [步骤 1]
2. [步骤 2]
3. [步骤 3]

## Test Plan
1. Unit Tests:
   - [测试场景]
2. Component Tests:
   - [测试场景]
3. Integration Tests:
   - [测试场景]

## Files to Modify
- [文件路径]：[修改内容]

## Files to Create
- [文件路径]：[用途]

## Existing Utilities to Leverage
- [工具名称/路径]：[用途]

## Success Criteria
- [ ] [标准 1]
- [ ] [标准 2]

## Out of Scope
- [项目 1]
- [项目 2]

请务必遵循严格的 TDD 原则、KISS 方法以及 300 行文件限制。

IMPORTANT：完成分析后，将完整的技术规格说明保存到：
`./specs/issues/<number-padded-to-3-digits>-<kebab-case-title>.specs.md`

例如，对于标题为 “Make code review trigger on any *.SQL and .sh file changes” 的 issue #7，应保存到：
`./specs/issues/007-make-code-review-trigger-on-sql-sh-changes.specs.md`

保存后，向用户提供简要摘要，确认以下内容：
- 已分析的 issue 编号和标题
- 技术规格说明保存的文件路径
- 技术规格说明中的关键要点（2-3 个项目）