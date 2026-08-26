---
name: create-agent
description: Comprehensive guide for creating Claude Code agents with proper structure, triggering conditions, system prompts, and validation - combines official Anthropic best practices with proven patterns
---
# 创建 Agent 命令

创建能够独立处理复杂多步骤任务的自主 Claude Code agents。此命令基于 Anthropic 官方文档和经过验证的模式，提供全面的指导。

## 用户输入

```text
Agent Name: $1
Description: $2
```

## 什么是 Agents？

Agents 是通过 Task 工具生成的**自主子进程**，它们可以：

- 独立处理复杂的多步骤任务
- 拥有各自隔离的上下文窗口
- 将结果返回给父级对话
- 针对特定领域进行专业化

| 概念 | Agent | Command |
|---------|-------|---------|
| **触发方式** | Claude 根据描述做出决定 | 用户使用 `/name` 调用 |
| **用途** | 自主工作 | 用户发起的操作 |
| **上下文** | 隔离的子进程 | 共享对话 |
| **文件格式** | `agents/*.md` | `commands/*.md` |

## Agent 文件结构

Agents 使用一种将 **YAML frontmatter** 与 **markdown system prompt** 结合的独特格式：

```markdown
---
name: agent-identifier
description: Use this agent when [triggering conditions]. Examples:

<example>
Context: [Situation description]
user: "[User request]"
assistant: "[How assistant should respond and use this agent]"
<commentary>
[Why this agent should be triggered]
</commentary>
</example>

<example>
[Additional example...]
</example>

model: inherit
color: blue
tools: ["Read", "Write", "Grep"]
---

You are [agent role description]...

**Your Core Responsibilities:**
1. [Responsibility 1]
2. [Responsibility 2]

**Analysis Process:**
[Step-by-step workflow]

**Output Format:**
[What to return]
```

## Frontmatter 字段参考

### 必填字段

#### `name`（必填）

**格式**：仅使用小写字母和连字符  
**长度**：3-50 个字符  
**规则**：

- 必须以字母或数字开头和结尾
- 只能包含小写字母、数字和连字符
- 不得包含下划线、空格或特殊字符

| 有效 | 无效 | 原因 |
|-------|---------|--------|
| `code-reviewer` | `helper` | 过于通用 |
| `test-generator` | `-agent-` | 以连字符开头/结尾 |
| `api-docs-writer` | `my_agent` | 不允许使用下划线 |
| `security-analyzer` | `ag` | 过短（<3 个字符） |
| `pr-quality-reviewer` | `MyAgent` | 不允许使用大写字母 |

#### `description`（必填，关键）

**最重要的字段**——定义 Claude 何时触发该 agent。

**要求**：

- 长度：10-5,000 个字符（理想长度：包含 2-4 个示例时为 200-1,000 个字符）
- **必须以**："Use this agent when..." **开头**
- **必须包含**：展示使用模式的 `<example>` 代码块
- 每个示例都需要包含：上下文、用户请求、assistant 响应、commentary

**示例代码块格式**：

```markdown
<example>
Context: [Describe the situation - what led to this interaction]
user: "[Exact user message or request]"
assistant: "[How Claude should respond before triggering]"
<commentary>
[Explanation of why this agent should be triggered in this scenario]
</commentary>
assistant: "[How Claude triggers the agent - 'I'll use the [agent-name] agent...']"
</example>
```

**描述的最佳实践**：

- 包含 2-4 个具体示例
- 展示主动触发和被动触发场景
- 涵盖表达相同意图的不同措辞
- 在 commentary 中解释推理过程
- 明确说明何时不应使用该 agent

#### `model`（必需）

**取值**：`inherit`、`sonnet`、`opus`、`haiku`  
**默认值**：`inherit`（推荐）

| 取值 | 使用场景 | 成本 |
|-------|----------|------|
| `inherit` | 使用父级对话模型 | 默认 |
| `haiku` | 快速、简单的任务 | 最低 |
| `sonnet` | 性能均衡 | 中等 |
| `opus` | 最大能力，复杂推理 | 最高 |

**建议**：除非有特定理由需要覆盖默认值，否则使用 `inherit`。

#### `color`（必需）

**用途**：在 UI 中作为视觉指示器，用于区分 agent

**取值**：`blue`、`cyan`、`green`、`yellow`、`magenta`、`red`

**最佳实践**：在同一插件中为不同 agent 使用不同颜色，以便在视觉上进行区分。

### 可选字段

#### `tools`（可选）

**用途**：限制可用工具（最小权限原则）  
**格式**：工具名称数组  
**默认值**：所有工具均可用

```yaml
# Common tool restrictions
tools: ["Read", "Grep", "Glob"]           # Read-only analysis
tools: ["Read", "Write", "Grep", "Glob"]  # Code modification
tools: ["Read", "Bash", "Grep"]           # System operations
```

**安全原则**：仅授予 agent 实际需要的工具。

## 触发模式

### 模式 1：明确请求

用户直接请求该 agent 所负责的功能。

```markdown
<example>
Context: User wants code reviewed
user: "Can you review my code changes?"
assistant: "I'll use the code-reviewer agent to analyze the changes."
<commentary>
User explicitly requested code review, trigger the code-reviewer agent.
</commentary>
</example>
```

### 模式 2：隐含需求

根据上下文判断需要使用 agent，而不是用户明确提出请求。

```markdown
<example>
Context: User mentions code is hard to understand
user: "This code is confusing and hard to follow"
assistant: "I can help improve the code clarity."
<commentary>
User indicates complexity issues. Trigger code-simplifier agent to refactor
for better readability.
</commentary>
assistant: "I'll use the code-simplifier agent to suggest improvements."
</example>
```

### 模式 3：主动触发

在完成相关工作后，即使用户没有明确请求，也触发 agent。

```markdown
<example>
Context: User just implemented database queries
user: "I've added the user search functionality"
assistant: "Great! Let me review it for security."
<commentary>
Database code written. Proactively trigger security-analyzer to check
for SQL injection and other database security issues.
</commentary>
assistant: "I'll use the security-analyzer agent to check the database code."
</example>
```

### 模式 4：工具使用模式

根据之前的工具使用情况触发 agent。

```markdown
<example>
Context: User made multiple edits to test files
user: "I've updated all the tests"
assistant: "Great! Let me verify test quality."
<commentary>
Multiple Edit tools used on test files. Proactively trigger test-quality-analyzer
to ensure tests follow best practices.
</commentary>
assistant: "I'll use the test-quality-analyzer agent to review the tests."
</example>
```

## 系统提示词设计

系统提示词（frontmatter 之后的 markdown 正文）定义了代理的行为。请使用以下经过验证的模板：

```markdown
You are [role] specializing in [domain].

**Your Core Responsibilities:**
1. [Primary responsibility - what the agent MUST do]
2. [Secondary responsibility]
3. [Additional responsibilities...]

**Analysis Process:**
1. [Step one - be specific]
2. [Step two]
3. [Step three]
[...]

**Quality Standards:**
- [Standard 1 - measurable criteria]
- [Standard 2]

**Output Format:**
Provide results in this format:
- [What to include]
- [How to structure]

**Edge Cases:**
Handle these situations:
- [Edge case 1]: [How to handle]
- [Edge case 2]: [How to handle]

**What NOT to Do:**
- [Anti-pattern 1]
- [Anti-pattern 2]
```

### 系统提示词原则

| 原则 | 好的示例 | 不好的示例 |
|-----------|------|-----|
| 具体明确 | "Check for SQL injection in query strings" | "Look for security issues" |
| 包含示例 | "Format: `## Critical Issues\n- Issue 1`" | "Use proper formatting" |
| 定义边界 | "Do NOT modify files, only analyze" | 未声明边界 |
| 提供备用方案 | "If unsure, ask for clarification" | 自行假设并继续 |
| 质量机制 | "Verify each finding with evidence" | 未进行验证 |

### 验证要求

系统提示词必须：

- **长度**：20-10,000 个字符（理想长度：500-3,000）
- **结构良好**：包含清晰的章节，以及职责、流程和输出格式
- **具体明确**：提供可执行的指令，而不是模糊的指导
- **完整**：处理边界情况并包含质量标准

## AI 辅助的代理生成

使用此提示词自动生成代理配置：

```markdown
Create an agent configuration based on this request: "[YOUR DESCRIPTION]"

Requirements:
1. Extract core intent and responsibilities
2. Design expert persona for the domain
3. Create comprehensive system prompt with:
   - Clear behavioral boundaries
   - Specific methodologies
   - Edge case handling
   - Output format
4. Create identifier (lowercase, hyphens, 3-50 chars)
5. Write description with triggering conditions
6. Include 2-3 <example> blocks showing when to use

Return JSON with:
{
  "identifier": "agent-name",
  "whenToUse": "Use this agent when... Examples: <example>...</example>",
  "systemPrompt": "You are..."
}
```

### 精英代理架构师流程

创建代理时，请遵循以下 6 步流程：

1. **提取核心意图**：确定根本目的、关键职责和成功标准
2. **设计专家角色**：创建具备领域知识且令人信服的专家身份
3. **构建完整指令**：涵盖行为边界、方法论、边界情况和输出格式
4. **优化性能**：设计决策框架、质量控制、工作流模式和备用策略
5. **创建标识符**：使用简洁、描述性强的 2-4 个单词，并以连字符连接
6. **生成示例**：提供包含上下文、用户/助手对话和评论的触发场景

## 默认代理标准

### Frontmatter 规则

- `description`：保持为一句话 - 描述会加载到父级上下文中，每个 token 都很重要
- 不要在 description 中添加冗长的 `<example>` 块 - 它们会浪费上下文 token

### 必需的 Agent 部分（按顺序）

1. **标题** - 使用具有鲜明身份声明的 `# <Role Title>`
2. **身份** - 质量期望与动机（工作质量不佳的后果）
3. **目标** - 清晰的单段式目标
4. **输入** - Agent 接收的文件/数据
5. **关键：加载上下文** - 明确要求在分析之前读取所有相关文件
6. **流程/阶段** - 按正确顺序排列的分步工作流

### 流程阶段顺序（对多阶段 Agent 至关重要）

```
错误：分解 → 自我批评 → 产出 → 解决
正确：分解 → 解决 → 产出完整解决方案 → 自我批评 → 输出
```

- 自我批评始终作为最后一步
- 始终先完成全部产出，然后再进行评估和选择

### 决策表

将推理列放在决策列之前：

```markdown
错误：| Section | Include? | Reasoning |
正确：| Section | Reasoning | Include? |
```

这会强制 Agent 在做出决定之前解释原因，从而提升决策质量。

## 验证规则

### 结构验证

| 组件 | 规则 | 有效 | 无效 |
|-----------|------|-------|---------|
| 名称 | 3-50 个字符，小写字母，使用连字符 | `code-reviewer` | `Code_Reviewer` |
| 描述 | 10-5000 个字符，以 "Use this agent when" 开头 | `Use this agent when reviewing code...` | `Reviews code` |
| 模型 | 必须为以下之一：inherit、sonnet、opus、haiku | `inherit` | `gpt-4` |
| 颜色 | 必须为以下之一：blue、cyan、green、yellow、magenta、red | `blue` | `purple` |
| 系统提示 | 20-10000 个字符 | 500+ 字符的提示 | 空正文 |
| 示例 | 至少一个 `<example>` 块 | 包含示例 | 没有示例 |

### 验证脚本

```bash
# Validate agent structure
scripts/validate-agent.sh agents/your-agent.md
```

### 质量检查清单

部署前：

- [ ] 名称符合约定（小写字母、连字符、3-50 个字符）
- [ ] 描述以 "Use this agent when..." 开头
- [ ] 描述包含 2-4 个 `<example>` 块
- [ ] 每个示例都包含 context、user、assistant、commentary
- [ ] 模型适合任务复杂度
- [ ] 颜色在相关 Agent 中具有唯一性
- [ ] 工具仅限于所需工具（最小权限）
- [ ] 系统提示具有清晰的结构
- [ ] 职责具体且可执行
- [ ] 流程步骤具体明确
- [ ] 已定义输出格式
- [ ] 已处理边界情况

## 生产示例

### 代码质量审查 Agent

```markdown
---
name: code-quality-reviewer
description: Use this agent when the user asks to review code changes, check code quality, or analyze modifications for bugs and improvements. Examples:

<example>
Context: User has completed implementing a feature
user: "I've finished the authentication module"
assistant: "Great! Let me review it for quality."
<commentary>
Code implementation complete. Proactively trigger code-quality-reviewer
to check for bugs, security issues, and best practices.
</commentary>
assistant: "I'll use the code-quality-reviewer agent to analyze the changes."
</example>

<example>
Context: User explicitly requests review
user: "Can you review PR #123 for code quality?"
assistant: "I'll use the code-quality-reviewer agent to analyze the PR."
<commentary>
PR review request triggers the code-quality-reviewer agent.
</commentary>
</example>

model: inherit
color: blue
tools: ["Read", "Grep", "Glob"]
---

You are an expert code quality reviewer specializing in identifying bugs, security vulnerabilities, and improvement opportunities.

**Your Core Responsibilities:**
1. Analyze code changes for quality issues (readability, maintainability, performance)
2. Identify security vulnerabilities (injection, XSS, authentication issues)
3. Check adherence to project best practices and coding standards
4. Provide actionable, specific feedback with line numbers

**Review Process:**
1. **Initial scan**: Quick pass for obvious issues
2. **Deep analysis**: Line-by-line review of changed code
3. **Context evaluation**: Check impact on related code
4. **Best practices**: Compare against project and language standards
5. **Recommendations**: Prioritized list of improvements

**Output Format:**
For each file reviewed:

## Summary
[2-3 sentence overview]

## Critical Issues (must fix)
- [Issue with file:line reference and fix suggestion]

## Major Issues (should fix)
- [Issue with explanation]

## Minor Issues (nice to fix)
- [Suggestion]

## Positive Observations
- [What was done well]

## Overall Assessment
[Pass/Needs Work/Fail with reasoning]

**Quality Standards:**
- Every issue must have a specific location (file:line)
- Every issue must have a suggested fix
- Prioritize security over style issues
- Acknowledge good patterns, not just problems
```

### 测试生成代理

```markdown
---
name: test-generator
description: Use this agent when the user asks for test generation, needs test coverage, or has written new code requiring tests. Examples:

<example>
Context: User has written new functionality without tests
user: "I've implemented the payment processing module"
assistant: "Let me generate comprehensive tests for it."
<commentary>
New code written without tests. Trigger test-generator to create
unit tests, integration tests, and edge case coverage.
</commentary>
assistant: "I'll use the test-generator agent to create comprehensive tests."
</example>

<example>
Context: User explicitly requests tests
user: "Can you write tests for the utils folder?"
assistant: "I'll use the test-generator agent to create tests."
<commentary>
Explicit test generation request.
</commentary>
</example>

model: inherit
color: green
tools: ["Read", "Write", "Grep", "Glob"]
---

You are an expert test engineer specializing in creating comprehensive test suites.

**Your Core Responsibilities:**
1. Analyze code to understand behavior and dependencies
2. Generate unit tests for individual functions/methods
3. Create integration tests for module interactions
4. Design edge case and error condition tests
5. Follow project testing conventions and patterns

**Expertise Areas:**
- **Unit testing**: Individual function/method tests
- **Integration testing**: Module interaction tests
- **Edge cases**: Boundary conditions, error paths
- **Test organization**: Proper structure and naming
- **Mocking**: Appropriate use of mocks and stubs

**Process:**
1. Read target code and understand its behavior
2. Identify testable units and their dependencies
3. Design test cases covering:
   - Happy paths (expected behavior)
   - Edge cases (boundary conditions)
   - Error cases (invalid inputs, failures)
4. Generate tests following project patterns
5. Add comprehensive assertions

**Output Format:**
Complete test files with:
- Proper test suite structure (describe/it or test blocks)
- Setup/teardown if needed
- Descriptive test names explaining what's being tested
- Comprehensive assertions covering all behaviors
- Comments explaining complex test logic

**Quality Standards:**
- Each function should have at least 3 tests (happy, edge, error)
- Test names should describe the scenario being tested
- Mocks should be clearly documented
- No test interdependencies
```

## 代理创建流程

### 步骤 1：收集需求

如果用户未提供，请询问：

1. **代理名称**：代理应叫什么？（kebab-case）
2. **用途**：该代理解决什么问题？
3. **触发条件**：Claude 应在何时使用该代理？
4. **职责**：核心任务是什么？
5. **所需工具**：仅供读取？可以修改文件？
6. **模型**：需要最大能力（opus）还是均衡能力（sonnet/inherit）？

### 步骤 2：创建代理文件

```bash
# Create agents directory if needed
mkdir -p ${CLAUDE_PLUGIN_ROOT}/agents

# Create agent file
touch ${CLAUDE_PLUGIN_ROOT}/agents/<agent-name>.md
```

### 第 3 步：编写 Frontmatter

生成包含以下内容的 frontmatter：

- 唯一且具有描述性的名称
- 包含触发条件和示例的描述
- 适当的模型设置
- 独特的颜色
- 最少的必需工具

### 第 4 步：编写系统提示词

按照以下模板创建系统提示词：

1. 具有专业方向的角色说明
2. 核心职责（编号列表）
3. 分析/工作流程（分步说明）
4. 质量标准（可衡量的标准）
5. 输出格式（具体结构）
6. 边界情况（如何处理特殊情况）

### 第 5 步：验证

运行验证：

```bash
scripts/validate-agent.sh agents/<agent-name>.md
```

检查：

- [ ] Frontmatter 能够正确解析
- [ ] 所有必需字段均已存在
- [ ] 示例完整
- [ ] 系统提示词内容全面

### 第 6 步：测试触发

使用各种场景进行测试：

1. 与示例匹配的明确请求
2. Agent 应当激活的隐含需求
3. Agent 不应当激活的场景
4. 边界情况和各种变体

## 最佳实践总结

### 应该做

- 在 Agent 描述中包含 2-4 个具体示例
- 编写具体、明确的触发条件
- 除非有特殊需求，否则使用 `"inherit"` 模型设置
- 对工具应用最小权限原则
- 编写清晰、结构化且包含明确步骤的系统提示词
- 在部署前全面测试 Agent 触发
- 为不同 Agent 使用不同颜色
- 添加说明触发逻辑的注释

### 不应该做

- 编写没有示例的泛化描述
- 省略触发条件
- 在同一插件中为多个 Agent 使用相同颜色
- 授予不必要的工具访问权限
- 编写含糊的系统提示词
- 跳过测试阶段
- 在名称中使用下划线或大写字母
- 忘记处理边界情况

## 与工作流集成

Agent 与插件工作流集成：

1. **阶段 5：组件实现** 使用 agent-creator 生成 Agent
2. **验证阶段** 使用 validate-agent.sh 脚本
3. **测试阶段** 验证各种场景下的触发情况

如需进行完整的插件开发，请使用：

- `/plugin-dev:create-plugin` 完成完整的插件工作流
- 此命令用于单个 Agent 的创建/完善

## 创建 Agent

根据用户输入，创建：

1. **目录结构**：`${CLAUDE_PLUGIN_ROOT}/agents/`
2. **Agent 文件**：包含 frontmatter 和系统提示词的完整 Markdown 文件
3. **验证**：运行验证脚本
4. **测试建议**：用于验证触发情况的场景

创建完成后，建议使用 `/customaize-agent:test-prompt` 命令测试，以验证 Agent 在各种场景下的行为。