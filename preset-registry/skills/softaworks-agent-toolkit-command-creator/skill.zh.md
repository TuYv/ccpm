---
name: command-creator
description: This skill should be used when creating a Claude Code slash command. Use when users ask to "create a command", "make a slash command", "add a command", or want to document a workflow as a reusable command. Essential for creating optimized, agent-executable slash commands with proper structure and best practices.
---
# 命令创建器

本技能用于指导创建 Claude Code 斜杠命令——即可在 Claude Code 对话中通过 `/command-name` 调用的可复用工作流。

## 关于斜杠命令

斜杠命令是存储在 `.claude/commands/`（项目级）或 `~/.claude/commands/`（全局/用户级）中的 markdown 文件，在调用时会被展开为提示词。它们非常适合：

- 重复性工作流（代码审查、PR 提交、CI 修复）
- 需要一致性的多步骤流程
- Agent 委派模式
- 项目特定的自动化

## 何时使用本技能

在用户有以下需求时调用本技能：

- 要求“创建一个命令”或“做一个斜杠命令”
- 想要自动化某个重复性工作流
- 需要将某个一致的流程记录下来以便复用
- 说“我一直在做 X，能把它做成一个命令吗？”
- 想要创建项目特定或全局的命令

## 附带资源

本技能包含用于详细指导的参考文档：

- **references/patterns.md** - 命令模式（工作流自动化、迭代修复、agent 委派、简单执行）
- **references/examples.md** - 附完整源码的真实命令示例（submit-stack、ensure-ci、create-implementation-plan）
- **references/best-practices.md** - 质量检查清单、常见陷阱、写作规范、模板结构

在创建命令时，可按需加载这些参考资料，以理解模式、查看示例或确保质量。

## 命令结构概述

每个斜杠命令都是一个 markdown 文件，包含：

```markdown
---
description: Brief description shown in /help (required)
argument-hint: <placeholder> (optional, if command takes arguments)
---

# Command Title

[Detailed instructions for the agent to execute autonomously]
```

## 命令创建工作流

### 第 1 步：确定位置

**自动检测合适的位置：**

1. 检查 git 仓库状态：`git rev-parse --is-inside-work-tree 2>/dev/null`
2. 默认位置：
   - 如果在 git 仓库内 → 项目级：`.claude/commands/`
   - 如果不在 git 仓库内 → 全局：`~/.claude/commands/`
3. 允许用户覆盖：
   - 如果用户明确提到“global”或“user-level”→ 使用 `~/.claude/commands/`
   - 如果用户明确提到“project”或“project-level”→ 使用 `.claude/commands/`

在继续之前，将所选位置告知用户。

### 第 2 步：展示命令模式

帮助用户了解不同的命令类型。加载 **references/patterns.md** 以查看可用模式：

- **工作流自动化** - 分析 → 执行 → 报告（例如 submit-stack）
- **迭代修复** - 运行 → 解析 → 修复 → 重复（例如 ensure-ci）
- **Agent 委派** - 提供上下文 → 委派 → 迭代（例如 create-implementation-plan）
- **简单执行** - 带参数运行命令（例如 codex-review）

询问用户：“哪个模式最接近你想创建的内容？”这有助于给对话确立框架。

### 第 3 步：收集命令信息

向用户询问关键信息：

#### A. 命令名称与用途

询问：

- “这个命令应该叫什么？”（用于文件名）
- “这个命令是做什么的？”（用于 description 字段）

规范：

- 命令名称必须为 kebab-case（使用连字符，而非下划线）
  - ✅ 正确：`submit-stack`、`ensure-ci`、`create-from-plan`
  - ❌ 错误：`submit_stack`、`ensure_ci`、`create_from_plan`
- 文件名与命令名一致：`my-command.md` → 以 `/my-command` 调用
- 描述应简洁、以行动为导向（会显示在 `/help` 输出中）

#### B. 参数

询问：

- “这个命令是否接受任何参数？”
- “参数是必需的还是可选的？”
- “参数代表什么？”

如果命令接受参数：

- 在 frontmatter 中添加 `argument-hint: <placeholder>`
- 必需参数使用 `<angle-brackets>`
- 可选参数使用 `[square-brackets]`

#### C. 工作流步骤

询问：

- “这个命令应该遵循哪些具体步骤？”
- “这些步骤应按什么顺序进行？”
- “应该使用哪些工具或命令？”

收集以下细节：

- 需要执行的初始分析或检查
- 要执行的主要操作
- 如何处理结果
- 成功标准
- 错误处理方式

#### D. 工具限制与指导

询问：

- “这个命令应该使用任何特定的 agent 或工具吗？”
- “是否有它应避免使用的工具或操作？”
- “它是否需要读取任何特定文件来获取上下文？”

### 第 4 步：生成优化后的命令

创建包含针对 agent 优化的指令的命令文件。加载 **references/best-practices.md** 以了解：

- 模板结构
- 针对 agent 执行的最佳实践
- 写作风格规范
- 质量检查清单

关键原则：

- 使用祈使/不定式形式（动词开头的指令）
- 明确且具体
- 包含预期结果
- 提供具体示例
- 定义清晰的错误处理

### 第 5 步：创建命令文件

1. 确定完整文件路径：
   - 项目级：`.claude/commands/[command-name].md`
   - 全局：`~/.claude/commands/[command-name].md`

2. 确保目录存在：

   ```bash
   mkdir -p [directory-path]
   ```

3. 使用 Write 工具编写命令文件

4. 与用户确认：
   - 告知文件位置
   - 概述该命令的功能
   - 说明使用方式：`/command-name [arguments]`

### 第 6 步：测试与迭代（可选）

如果用户想测试：

1. 建议测试：`You can test this command by running: /command-name [arguments]`
2. 准备好根据反馈进行迭代
3. 根据需要更新文件以改进

## 快速提示

**如需详细指导，请加载附带的参考资料：**

- 在设计命令工作流时加载 **references/patterns.md**
- 加载 **references/examples.md** 以查看现有命令的结构
- 在最终定稿前加载 **references/best-practices.md** 以确保质量

**需要记住的常见模式：**

- 使用 Bash 工具运行 `pytest`、`pyright`、`ruff`、`prettier`、`make`、`gt` 命令
- 使用 Task 工具调用子 agent 来执行专门任务
- 在继续之前先检查特定文件（例如 `.PLAN.md`）
- 立即逐条标记待办事项为完成，而不是批量标记
- 包含明确的错误处理指令
- 定义清晰的成功标准

## 总结

创建命令时：

1. **检测位置**（项目级还是全局）
2. **展示模式**以确立对话框架
3. **收集信息**（名称、用途、参数、步骤、工具）
4. **生成优化后的命令**，包含可由 agent 执行的指令
5. **在合适的位置创建文件**
6. 根据需要**确认并迭代**

重点在于创建 agent 能够自主执行的命令，具备清晰的步骤、明确的工具使用方式和适当的错误处理。
