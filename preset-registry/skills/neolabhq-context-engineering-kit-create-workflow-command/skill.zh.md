---
name: create-workflow-command
description: Create a workflow command that orchestrates multi-step execution through sub-agents with file-based task prompts
argument-hint: "[workflow-name] [description]"
allowed-tools: Read, Write, Glob, Grep, Bash(mkdir:*)
---
# 创建工作流命令

创建一个命令，通过分派子代理并使用存储在单独文件中的任务专用指令，编排多步骤工作流。

## 用户输入

```text
Workflow Name: $1
Description: $2
```

## 架构概述

工作流命令解决了**上下文膨胀问题**：不在主命令中嵌入详细的步骤指令（从而污染编排器上下文），而是将这些指令存储在单独的任务文件中，由子代理按需读取。

```
plugins/<plugin-name>/
├── commands/
│   └── <workflow>.md          # Lean orchestrator (~50-100 tokens per step)
├── agents/                     # Optional: reusable executor agents
│   └── step-executor.md       # Custom agent with specific tools/behavior
└── tasks/                      # All task instructions directly here
    ├── step-1-<name>.md       # Full instructions (~500+ tokens each)
    ├── step-2-<name>.md
    ├── step-3-<name>.md
    └── common-context.md      # Shared context across workflows
```

## 核心原则

### 1. 上下文隔离

每个子代理都有自己独立的上下文窗口。主编排器保持精简，而子代理则从文件中加载详细指令。

| 组件 | 上下文成本 | 用途 |
|-----------|--------------|---------|
| 编排器命令 | 每个步骤约 50-100 个 token | 分派和协调 |
| 任务文件 | 约 500+ 个 token | 详细的步骤指令 |
| 子代理基础开销 | 约 294 个 token | 系统提示词开销 |

### 2. 子代理能力

通过 Task 工具生成的子代理：

| 能力 | 是否可用 | 备注 |
|------------|-----------|-------|
| Read 工具 | ✅ 是 | 可以读取任何文件 |
| Write 工具 | ✅ 是 | 如果未受限制 |
| Grep/Glob | ✅ 是 | 用于代码搜索 |
| Skills 加载 | ❌ 否 | Skills 不会在子代理中自动加载 |
| 生成子代理 | ❌ 否 | 无法嵌套使用 Task 工具 |
| 恢复上下文 | ✅ 是 | 通过 `resume` 参数 |

### 3. 文件引用模式

在插件中使用 `${CLAUDE_PLUGIN_ROOT}` 实现可移植路径：

```markdown
Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-1-workflow-name.md and execute.
```

子代理将使用 Read 工具获取文件内容。

## 实现流程

### 步骤 1：收集需求

询问用户（如果尚未提供）：

1. **工作流名称**：kebab-case 标识符（例如 `feature-implementation`）
2. **描述**：工作流要完成的任务
3. **步骤**：离散步骤的列表，每个步骤包括：
   - 步骤名称
   - 步骤目标
   - 所需工具
   - 预期输出
4. **执行模式**：顺序执行或并行执行步骤
5. **代理类型**：`general-purpose` 或自定义代理

### 步骤 2：创建目录结构

```bash
# Create tasks directory (if it doesn't exist)
mkdir -p ${CLAUDE_PLUGIN_ROOT}/tasks

# Optional: Create agents directory (if using custom agents)
mkdir -p ${CLAUDE_PLUGIN_ROOT}/agents
```

**注意**：所有任务文件（包括工作流专用步骤和共享上下文）都直接放置在 `tasks/` 中，不使用子目录。

### 步骤 3：创建任务文件

为每个步骤创建一个具有以下结构的任务文件：

```markdown
# Step N: <Step Name>

## Context
You are executing step N of the <workflow-name> workflow.

## Goal
<Clear, specific goal for this step>

## Input
<What this step receives from previous steps or user>

## Instructions
1. <Specific action>
2. <Specific action>
3. <Specific action>

## Constraints
- <Limitation or boundary>
- <What NOT to do>

## Expected Output
<What to return to orchestrator>

## Success Criteria
- [ ] <Measurable outcome>
- [ ] <Measurable outcome>
```

### 步骤 4：创建编排器命令

使用以下模式创建主命令文件：

```markdown
---
description: <Workflow description>
argument-hint: <Required arguments>
allowed-tools: Task, Read
model: sonnet
---

# <Workflow Name>

## User Input

\`\`\`text
$ARGUMENTS
\`\`\`

## Workflow Execution

### Step 1: <Step Name>

Launch general-purpose agent:
- **Description**: "<3-5 word summary>"
- **Prompt**:
  \`\`\`
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-1-<workflow>-<name>.md and execute.

  Context:
  - TARGET: $1
  - MODE: $2
  \`\`\`

**Capture**: <What to extract from result>

### Step 2: <Step Name>

Launch general-purpose agent:
- **Description**: "<3-5 word summary>"
- **Prompt**:
  \`\`\`
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-2-<workflow>-<name>.md and execute.

  Context from Step 1:
  - <Key data from previous step>
  \`\`\`

### Step 3: <Step Name>

[Continue pattern...]

## Completion

Summarize workflow results:
1. <What was accomplished>
2. <Key outputs>
3. <Next steps if any>
```

#### Frontmatter 选项

| 字段 | 用途 | 默认值 |
|-------|---------|---------|
| `description` | 工作流用途的简要描述 | 必填 |
| `argument-hint` | 预期参数的描述 | 无 |
| `allowed-tools` | 命令可以使用的工具 | 继承自对话 |
| `model` | 指定的 Claude 模型（sonnet、opus、haiku） | 继承自对话 |

**模型选择**：
- `haiku` - 速度快、效率高，适用于简单工作流
- `sonnet` - 性能均衡（推荐作为默认选择）
- `opus` - 为复杂编排提供最强能力

## 执行模式

### 模式 A：顺序步骤（默认）

每个步骤都依赖前一步骤的输出：

```markdown
### Step 1: Analyze
Launch agent → Get analysis result

### Step 2: Plan (uses Step 1 result)
Launch agent with Step 1 context → Get plan

### Step 3: Execute (uses Step 2 result)
Launch agent with Step 2 context → Complete
```

### 模式 B：并行独立步骤

各步骤可以并发运行：

```markdown
### Analysis Phase (Parallel)

Launch 3 agents simultaneously:
1. Agent 1: Security analysis → Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-1a-security.md
2. Agent 2: Performance analysis → Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-1b-performance.md
3. Agent 3: Code quality analysis → Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-1c-quality.md

**Wait for all**, then consolidate results.

### Synthesis Phase
Launch agent with all analysis results...
```

### 模式 C：有状态多步骤（恢复）

当步骤需要共享上下文时：

```markdown
### Step 1: Initialize
Launch agent, **capture agent_id**

### Step 2: Continue (same context)
Resume agent using agent_id:
- **resume**: <agent_id from Step 1>
- **prompt**: "Proceed to phase 2: <additional instructions>"
```

## 示例：功能实现工作流

### 编排器命令

```markdown
---
description: Execute feature implementation through research, planning, and coding phases
argument-hint: [feature-description]
allowed-tools: Task, Read, TodoWrite
model: sonnet
---

# Implement Feature

## User Input
\`\`\`text
$ARGUMENTS
\`\`\`

Create TodoWrite with workflow steps.

## Phase 1: Research

Launch general-purpose agent:
- **Description**: "Research feature requirements"
- **Prompt**:
  \`\`\`
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-1-feature-impl-research.md

  Feature: $ARGUMENTS
  \`\`\`

**Extract**: Key findings, constraints, existing patterns

## Phase 2: Architecture

Launch general-purpose agent:
- **Description**: "Design feature architecture"
- **Prompt**:
  \`\`\`
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-2-feature-impl-architecture.md

  Feature: $ARGUMENTS
  Research findings: <summary from Phase 1>
  \`\`\`

**Extract**: File structure, components, interfaces

## Phase 3: Implementation

Launch developer agent:
- **Description**: "Implement feature code"
- **Prompt**:
  \`\`\`
  Read ${CLAUDE_PLUGIN_ROOT}/tasks/step-3-feature-impl-implement.md

  Architecture: <summary from Phase 2>
  \`\`\`

## Completion

Mark todos complete. Report:
1. Files created/modified
2. Tests added
3. Remaining work
```

### 任务文件示例（step-1-feature-impl-research.md）

```markdown
# Step 1: Feature Research

## Context
You are the research phase of a feature implementation workflow.

## Goal
Thoroughly understand the feature requirements and existing codebase context before any implementation begins.

## Instructions

1. **Parse Feature Request**
   - Extract core requirements
   - Identify acceptance criteria
   - Note any constraints mentioned

2. **Codebase Analysis**
   - Search for similar existing features
   - Identify relevant patterns and conventions
   - Find reusable components/utilities

3. **Dependency Check**
   - What existing code will this feature interact with?
   - Are there breaking change risks?
   - What tests exist for related functionality?

4. **Gap Analysis**
   - What's missing from the request?
   - What clarifications might be needed?
   - What edge cases should be considered?

## Constraints
- Do NOT write any implementation code
- Do NOT modify any files
- Focus purely on research and analysis

## Expected Output

Return a structured research summary:

\`\`\`markdown
## Feature Understanding
- Core requirement: <summary>
- Acceptance criteria: <list>

## Codebase Context
- Similar features: <list with file paths>
- Patterns to follow: <list>
- Reusable code: <list with file paths>

## Dependencies
- Files affected: <list>
- Tests to consider: <list>

## Open Questions
- <Question 1>
- <Question 2>

## Recommendation
<Brief recommendation for architecture phase>
\`\`\`

## Success Criteria
- [ ] Feature requirements clearly articulated
- [ ] Relevant existing code identified
- [ ] No implementation attempted
- [ ] Clear handoff to architecture phase
```

## 已知限制

| 限制 | 影响 | 解决方法 |
|------------|--------|------------|
| 不支持嵌套子代理 | 子代理无法生成 Task 工具 | 将所有编排逻辑保留在主命令中 |
| 不会自动加载技能 | 子代理不会触发技能 | 传递明确的文件路径或内联上下文 |
| 每个代理都使用全新上下文 | 每次分派都从空上下文开始 | 使用恢复模式，或传递摘要 |
| 文件读取延迟 | 每个步骤需要额外调用一次工具 | 为节省上下文而做出的可接受权衡 |

## 验证清单

在最终确定工作流命令之前：

- [ ] 每个步骤都有清晰、具体的目标
- [ ] 任务文件是自包含的（子代理不需要外部上下文）
- [ ] 文件路径使用 `${CLAUDE_PLUGIN_ROOT}` 以确保可移植性
- [ ] 步骤之间传递的上下文保持最少（使用摘要，而非完整数据）
- [ ] 编排器命令保持精简（每次步骤分派少于 100 个 token）
- [ ] 已定义步骤失败时的错误处理
- [ ] 每个步骤的成功标准都可衡量

## 创建工作流

根据用户输入，创建：

1. **目录**：
   - `${CLAUDE_PLUGIN_ROOT}/tasks/` - 所有任务文件都直接存放在此处
   - `${CLAUDE_PLUGIN_ROOT}/agents/` - （可选）自定义代理定义

2. **任务文件**：在 `tasks/` 目录中创建，命名模式为 `step-N-<workflow>-<name>.md`
   - 示例：`step-1-feature-impl-research.md`
   - 示例：`step-2-feature-impl-architecture.md`
   - 共享上下文：将 `common-context.md` 直接放在 `tasks/` 中

3. **编排器命令**：在 `commands/<workflow-name>.md` 中编写精简的分派逻辑

4. **自定义代理**（可选）：如果工作流需要专门的代理行为，则在 `agents/` 中创建

5. **更新 plugin.json**：如有需要，将命令添加到插件清单中

创建完成后，建议使用 `/customaize-agent:test-prompt` 命令进行测试。