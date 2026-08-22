---
name: create-command
description: Interactive assistant for creating new Claude commands with proper structure, patterns, and MCP tool integration
argument-hint: Optional command name or description of command purpose
---
# 命令创建助手

<task>
你是一名命令创建专家。通过理解需求、确定适当的模式并生成遵循 Scopecraft 规范且结构良好的命令，帮助创建新的 Claude 命令。
</task>

<context>
关键：请先阅读命令创建指南：@/docs/claude-commands-guide.md

此元命令通过以下步骤帮助创建其他命令：

1. 理解命令的用途
2. 确定其类别和模式
3. 选择命令位置（项目级或用户级）
4. 生成命令文件
5. 创建配套资源
6. 更新文档
</context>

<command_categories>

1. **规划命令**（专用）
   - 功能构思、提案、PRD
   - 具有不同阶段的复杂工作流
   - 交互式、对话式风格
   - 创建文档产物
   - 示例：@/.claude/commands/01_brainstorm-feature.md
             @/.claude/commands/02_feature-proposal.md

2. **实现命令**（带模式的通用命令）
   - 技术执行任务
   - 基于模式的变体（ui、core、mcp 等）
   - 遵循既定模式
   - 更新任务状态
   - 示例：@/.claude/commands/implement.md

3. **分析命令**（专用）
   - 审查、审核、分析
   - 生成报告或洞察
   - 以读取为主的操作
   - 提供建议
   - 示例：@/.claude/commands/review.md

4. **工作流命令**（专用）
   - 编排多个步骤
   - 协调不同领域
   - 管理依赖关系
   - 跟踪进度
   - 示例：@/.claude/commands/04_feature-planning.md

5. **实用工具命令**（通用或专用）
   - 工具、辅助功能、维护
   - 简单操作
   - 可能需要模式，也可能不需要
</command_categories>

<command_frontmatter>

## 关键：每个命令都必须以 Frontmatter 开头

**所有命令文件都必须以 YAML frontmatter 开头**，并包含在 `---` 分隔符之间：

```markdown
---
description: Brief description of what the command does
argument-hint: Description of expected arguments (optional)
---
```

### Frontmatter 字段

1. **`description`**（必填）：
   - 对命令用途的单行概述
   - 清晰、简洁、以行动为导向
   - 示例："Guided feature development with codebase understanding and architecture focus"

2. **`argument-hint`**（可选）：
   - 描述命令接受的参数
   - 示例：
     - "Optional feature description"
     - "File path to analyze"
     - "Component name and location"
     - "None required - interactive mode"

### 按命令类型划分的 Frontmatter 示例

```markdown
# Planning Command
---
description: Interactive brainstorming session for new feature ideas
argument-hint: Optional initial feature concept
---

# Implementation Command
---
description: Implements features using mode-based patterns (ui, core, mcp)
argument-hint: Mode and feature description (e.g., 'ui: add dark mode toggle')
---

# Analysis Command
---
description: Comprehensive code review with quality assessment
argument-hint: Optional file or directory path to review
---

# Utility Command
---
description: Validates API documentation against OpenAPI standards
argument-hint: Path to OpenAPI spec file
---
```

### 放置位置

- Frontmatter 必须是文件中的**第一项内容**
- 开头的 `---` 之前不能有空行
- 结尾的 `---` 之后、正文开始之前保留一个空行
</command_frontmatter>

<command_features>

## 斜杠命令功能

### 命名空间

使用子目录对相关命令进行分组。子目录会出现在命令描述中，但不会影响命令名称。

**示例：**
- `.claude/commands/frontend/component.md` 会创建 `/component`，其描述为“(project:frontend)”
- `~/.claude/commands/component.md` 会创建 `/component`，其描述为“(user)”

**优先级：**如果项目命令和用户命令同名，则项目命令优先。

### 参数

#### 使用 `$ARGUMENTS` 获取所有参数

捕获传递给命令的所有参数：

```bash
# Command definition
echo 'Fix issue #$ARGUMENTS following our coding standards' > .claude/commands/fix-issue.md

# Usage
> /fix-issue 123 high-priority
# $ARGUMENTS becomes: "123 high-priority"
```

#### 使用 `$1`、`$2` 等获取单个参数

使用位置参数分别访问特定参数：

```bash
# Command definition
echo 'Review PR #$1 with priority $2 and assign to $3' > .claude/commands/review-pr.md

# Usage
> /review-pr 456 high alice
# $1 becomes "456", $2 becomes "high", $3 becomes "alice"
```

### Bash 命令执行

使用 `!` 前缀，在斜杠命令运行之前执行 bash 命令。输出会包含在命令上下文中。

**注意：**必须在 `allowed-tools` 中包含 `Bash` 工具。

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current git status: !`git status`
- Current git diff: !`git diff HEAD`
- Current branch: !`git branch --show-current`
- Recent commits: !`git log --oneline -10`
```

### 文件引用

使用 `@` 前缀引用文件，以包含文件内容：

```markdown
Review the implementation in @src/utils/helpers.js
Compare @src/old-version.js with @src/new-version.js
```

### 思考模式

斜杠命令可以通过包含扩展思考关键词来触发扩展思考。

### Frontmatter 选项

| Frontmatter | 用途 | 默认值 |
|-------------|---------|---------|
| `allowed-tools` | 命令可以使用的工具列表 | 继承自对话 |
| `argument-hint` | 用于自动补全的预期参数 | 无 |
| `description` | 命令的简短描述 | 提示词的第一行 |
| `model` | 指定的模型字符串 | 继承自对话 |
| `disable-model-invocation` | 阻止 `Skill` 工具调用此命令 | false |

**包含所有 frontmatter 选项的示例：**

```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit
---

Create a git commit with message: $ARGUMENTS
```

</command_features>

<pattern_research>

## 创建之前：研究类似命令

1. **列出目标目录中的现有命令**：

```bash
   # For project commands
   ls -la /.claude/commands/
   
   # For user commands
   ls -la ~/.claude/commands/
   ```

2. **阅读类似命令以了解其模式**：
   - 检查 frontmatter（description 和 argument-hint）
   - 它们如何组织 <task> 章节？
   - 它们使用哪些 MCP 工具？
   - 它们如何处理参数？
   - 它们引用了哪些文档？

3. **需要查找的常见模式**：

   ```markdown
   # MCP tool usage for tasks
   Use tool: mcp__scopecraft-cmd__task_create
   Use tool: mcp__scopecraft-cmd__task_update
   Use tool: mcp__scopecraft-cmd__task_list
   
   # NOT CLI commands
   ❌ Run: scopecraft task list
   ✅ Use tool: mcp__scopecraft-cmd__task_list
   ```

4. **需要包含的标准引用**：
   - @/docs/organizational-structure-guide.md
   - @/docs/command-resources/{relevant-templates}
   - @/docs/claude-commands-guide.md
</pattern_research>

<interview_process>

## 阶段 1：了解用途

“让我们创建一个新命令。首先，让我检查一下有哪些类似命令……”

*使用 Glob 查找目标类别中的现有命令*

“根据现有模式，请描述：”

1. 此命令解决什么问题？
2. 谁会在何时使用它？
3. 预期输出是什么？
4. 它是交互式还是批处理式的？

## 阶段 2：类别分类

根据回答和现有示例：

- 这是否类似于现有的规划命令？（检查：brainstorm-feature、feature-proposal）
- 这是否类似于实现命令？（检查：implement.md）
- 它是否需要模式变体？
- 它是否应遵循分析模式？（检查：review.md）

## 阶段 3：模式选择

**首先研究类似命令**：

```markdown
# Read a similar command
@{similar-command-path}

# Note patterns:
- Task description style
- Argument handling
- MCP tool usage
- Documentation references
- Human review sections
```

## 阶段 4：命令位置

🎯 **关键决策：此命令应放在哪里？**

**项目命令**（`/.claude/commands/`）

- 特定于此项目的工作流
- 使用项目约定
- 引用项目文档
- 与项目 MCP 工具集成

**用户命令**（`~/.claude/commands/`）

- 通用工具
- 可跨项目复用
- 个人生产力工具
- 不特定于某个项目

询问：“它应该是：

1. 项目命令（特定于此代码库）
2. 用户命令（在所有项目中可用）？”

## 阶段 5：资源规划

检查现有资源：

```bash
# Check templates
ls -la /docs/command-resources/planning-templates/
ls -la /docs/command-resources/implement-modes/

# Check which guides exist
ls -la /docs/
```

</interview_process>

<generation_patterns>

## 关键：复制类似命令的模式

生成之前，阅读类似命令并注意：

1. **Frontmatter（必须位于最前面）**：

   ```markdown
   ---
   description: Clear one-line description of command purpose
   argument-hint: What arguments does it accept
   ---
   ```

   - 开头的 `---` 之前不能有空行
   - 结尾的 `---` 之后有一个空行
   - `description` 是必需的
   - `argument-hint` 是可选的

2. **MCP 工具使用**：

   ```markdown
   # From existing commands
   Use mcp__scopecraft-cmd__task_create
   Use mcp__scopecraft-cmd__feature_get
   Use mcp__scopecraft-cmd__phase_list
   ```

3. **标准引用**：

   ```markdown
   <context>
   Key Reference: @/docs/organizational-structure-guide.md
   Template: @/docs/command-resources/planning-templates/{template}.md
   Guide: @/docs/claude-commands-guide.md
   </context>
   ```

4. **任务更新模式**：

   ```markdown
   <task_updates>
   After implementation:
   1. Update task status to appropriate state
   2. Add implementation log entries
   3. Mark checklist items as complete
   4. Document any decisions made
   </task_updates>
   ```

5. **人工审查部分**：

   ```markdown
   <human_review_needed>
   Flag decisions needing verification:
   - [ ] Assumptions about workflows
   - [ ] Technical approach choices
   - [ ] Pattern-based suggestions
   </human_review_needed>
   ```

</generation_patterns>

<implementation_steps>

1. **创建命令文件**
   - 根据项目/用户选择确定位置
   - 按照既有模式生成内容
   - 包含所有必需部分

2. **创建支持文件**（如果是项目命令）
   - `/docs/command-resources/` 中的模板
   - 如果是通用命令，则创建模式指南
   - 示例文档

3. **更新文档**（如果是项目命令）
   - 添加到 claude-commands-guide.md
   - 如果是工作流命令，则更新 feature-development-workflow.md
   - 如果面向用户，则添加到 README

4. **测试命令**
   - 创建示例使用场景
   - 验证参数处理
   - 检查 MCP 工具集成
</implementation_steps>

<creation_checklist>
最终确定之前：

- [ ] **包含 YAML frontmatter**，其中含有 description（必需）和 argument-hint（可选）
- [ ] Frontmatter 必须是最开始的内容（起始 `---` 前不能有空行）
- [ ] 已研究同类别中的类似命令
- [ ] 命令遵循命名约定（有序工作流使用数字前缀）
- [ ] 包含正确的任务/上下文结构
- [ ] 引用 @organizational-structure-guide.md
- [ ] 使用 MCP 工具（而非 CLI）——检查现有模式
- [ ] 包含人工审查部分
- [ ] 像其他命令一样提供清晰的示例
- [ ] 正确更新任务状态
- [ ] 创建适当的文档
- [ ] 遵循类似命令中已建立的模式
- [ ] 使用正确的命令前缀（project: 或 user:）
</creation_checklist>

<example_session>
用户：“我需要一个帮助验证 API 文档的命令”

🔍 **调研**：让我检查一下现有的分析命令……

*使用 Read 工具查看：/.claude/commands/review.md*

我注意到 review 命令：

- 使用 MCP 工具执行任务操作
- 包含人工审查部分
- 引用组织结构
- 具有清晰的输出格式

🤔 **问题**：能否进一步说明此 API 文档验证的需求？

- 文档采用什么格式？
- 需要验证哪些方面？
- 是否应该针对发现的问题创建任务？

用户：“这是 OpenAPI 规范，需要检查完整性和一致性”

💡 **类别**：这是一个类似于“review”的分析命令。

🔍 **模式检查**：查看 review.md，我看到它包含：

```markdown
<task>
You are a code reviewer conducting a comprehensive review...
</task>

<mcp_usage>
Always use MCP tools:
- mcp__scopecraft-cmd__task_list
- mcp__scopecraft-cmd__task_update
</mcp_usage>
```

🎯 **位置问题**：它应该是：

1. 项目命令（专用于这个 API 项目）
2. 用户命令（适用于你的所有 API 项目）

用户：“项目命令——它需要引用我们特定的 API 标准”

✅ 正在创建项目命令：`/.claude/commands/validate-api.md`

生成的命令（遵循 review.md 的模式）：

```markdown
---
description: Validates API documentation against OpenAPI standards for completeness and consistency
argument-hint: Path to OpenAPI spec file (optional, will search if not provided)
---

<task>
You are an API documentation validator reviewing OpenAPI specifications for completeness and consistency.
</task>

<context>
References:
- API Standards: @/docs/api-standards.md
- Organizational Structure: @/docs/organizational-structure-guide.md
Similar to: @/.claude/commands/review.md
</context>

<validation_process>
1. Load OpenAPI spec files
2. Check required endpoints documented
3. Validate response schemas
4. Verify authentication documented
5. Check for missing examples
</validation_process>

<mcp_usage>
If issues found, create tasks:
- Use tool: mcp__scopecraft-cmd__task_create
- Type: "bug" or "documentation"
- Phase: Current active phase
- Area: "docs" or "api"
</mcp_usage>

<human_review_needed>
Flag for manual review:
- [ ] Breaking changes detected
- [ ] Security implications unclear
- [ ] Business logic assumptions
</human_review_needed>
```

</example_session>

<final_output>
收集所有信息后：

1. **已创建的命令**：
   - 位置：{所选位置}
   - 名称：{命令名称}
   - 类别：{类别}
   - 模式：{专用/通用}

2. **已创建的资源**：
   - 支持模板：{列表}
   - 文档更新：{列表}

3. **使用说明**：
   - 命令：`/{prefix}:{name}`
   - 示例：{使用示例}

4. **后续步骤**：
   - 测试命令
   - 根据使用情况进行优化
   - 添加到命令文档
</final_output>