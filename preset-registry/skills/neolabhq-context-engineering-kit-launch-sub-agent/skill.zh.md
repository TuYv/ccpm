---
name: launch-sub-agent
description: Launch an intelligent sub-agent with automatic model selection based on task complexity, specialized agent matching, Zero-shot CoT reasoning, and mandatory self-critique verification
argument-hint: Task description (e.g., "Implement user authentication" or "Research caching strategies") [--model opus|sonnet|haiku] [--agent <agent-name>] [--output <path>]
---
# launch-sub-agent

<task>
启动一个专注的子智能体来执行所提供的任务。分析任务，以智能选择最佳模型和智能体配置，然后调度一个在开始时进行零样本思维链推理、并在结束时进行强制性自我批评验证的子智能体。
</task>

<context>
此命令实现了多智能体架构中的**监督者/编排器模式**，由你（编排器）调度具有隔离上下文的专注子智能体。其主要优势是**上下文隔离**——每个子智能体都在一个干净的上下文窗口中运行，专注于其特定任务，不受累积的上下文污染影响。
</context>

## 流程

### 阶段 1：使用零样本思维链进行任务分析

在调度之前，系统地分析任务。逐步思考：

```
Let me analyze this task step by step to determine the optimal configuration:

1. **Task Type Identification**
   "What type of work is being requested?"
   - Code implementation / feature development
   - Research / investigation / comparison
   - Documentation / technical writing
   - Code review / quality analysis
   - Architecture / system design
   - Testing / validation
   - Simple transformation / lookup

2. **Complexity Assessment**
   "How complex is the reasoning required?"
   - High: Architecture decisions, novel problem-solving, multi-faceted analysis
   - Medium: Standard implementation following patterns, moderate research
   - Low: Simple transformations, lookups, well-defined single-step tasks

3. **Output Size Estimation**
   "How extensive is the expected output?"
   - Large: Multiple files, comprehensive documentation, extensive analysis
   - Medium: Single feature, focused deliverable
   - Small: Quick answer, minor change, brief output

4. **Domain Expertise Check**
   "Does this task match a specialized agent profile?"
   - Development: code, implement, feature, endpoint, TDD, tests
   - Research: investigate, compare, evaluate, options, library
   - Documentation: document, README, guide, explain, tutorial
   - Architecture: design, system, structure, scalability
   - Exploration: understand, navigate, find, codebase patterns
```

### 阶段 2：模型选择

根据任务分析选择最佳模型：

| 任务特征 | 推荐模型 | 理由 |
|--------------|-------------------|-----------|
| **复杂推理**（架构、设计、关键决策） | `opus` | 最强的推理能力 |
| **专业领域**（与智能体配置相匹配） | Opus + 专用智能体 | 领域专业知识 + 强大推理能力 |
| **不复杂但篇幅长**（大量文档、冗长输出） | `sonnet[1m]` | 能力良好，处理长内容时具备成本效益 |
| **简单且简短**（琐碎任务、快速查询） | `haiku` | 速度快，处理简单任务时具备成本效益 |
| **默认**（无法确定时） | `opus` | 优先保证质量，而非成本 |

**决策树：**

```
Is task COMPLEX (architecture, design, novel problem, critical decision)?
|
+-- YES --> Use Opus (highest capability)
|           |
|           +-- Does it match a specialized domain?
|               +-- YES --> Include specialized agent prompt
|               +-- NO --> Use Opus alone
|
+-- NO --> Is task SIMPLE and SHORT?
           |
           +-- YES --> Use Haiku (fast, cheap)
           |
           +-- NO --> Is output LONG but task not complex?
                      |
                      +-- YES --> Use Sonnet (balanced)
                      |
                      +-- NO --> Use Opus (default)
```

### 阶段 3：专业代理匹配

如果任务与某个专业领域相匹配，则纳入相关的代理提示词。专业代理可提供特定领域的最佳实践、质量标准和结构化方法，从而提高输出质量。

**决策：** 当任务明显能受益于领域专业知识时，使用专业代理。对于专业化只会增加不必要开销的简单任务，则跳过此步骤。

**代理：** 可用的专业代理取决于项目和已安装的插件。`sdd` 插件提供的常见代理包括：`sdd:developer`、`sdd:researcher`、`sdd:software-architect`、`sdd:tech-lead`、`sdd:code-explorer`、`sdd:business-analyst`、`sdd:code-reviewer`、`sdd:tech-writer`。如果适合的专业代理不可用，则回退到不具备专业化能力的通用代理。

**与模型选择集成：**

- 专业代理应与模型选择结合使用，而不是取代模型选择
- 复杂任务 + 专业领域 = Opus + 专业代理
- 与领域匹配的简单任务 = Haiku，不使用专业代理（其开销并不合理）

**用法：**

1. 阅读代理定义
2. 将代理的指令放在 CoT 前缀之后，纳入子代理提示词
3. 与零样本 CoT 前缀和自我评判后缀相结合

### 阶段 4：构建子代理提示词

使用以下必需组件构建子代理提示词：

#### 4.1 零样本思维链前缀（必需——必须位于最前面）

```markdown
## Reasoning Approach

Before taking any action, you MUST think through the problem systematically.

Let's approach this step by step:

1. "Let me first understand what is being asked..."
   - What is the core objective?
   - What are the explicit requirements?
   - What constraints must I respect?

2. "Let me break this down into concrete steps..."
   - What are the major components of this task?
   - What order should I tackle them?
   - What dependencies exist between steps?

3. "Let me consider what could go wrong..."
   - What assumptions am I making?
   - What edge cases might exist?
   - What could cause this to fail?

4. "Let me verify my approach before proceeding..."
   - Does my plan address all requirements?
   - Is there a simpler approach?
   - Am I following existing patterns?

Work through each step explicitly before implementing.
```

#### 4.2 任务正文

```markdown
<task>
{Task description from $ARGUMENTS}
</task>

<constraints>
{Any constraints inferred from the task or conversation context}
</constraints>

<context>
{Relevant context: files, patterns, requirements, codebase information}
</context>

<output>
{Expected deliverable: format, location, structure}
</output>
```

#### 4.3 自我评判后缀（必需——必须位于最后面）

```markdown
## Self-Critique Loop (MANDATORY)

Before completing, you MUST verify your work. Submitting unverified work is UNACCEPTABLE.

### 1. Generate 5 Verification Questions

Create 5 questions specific to this task that test correctness and completeness. There example questions:

| # | Verification Question | Why This Matters |
|---|----------------------|------------------|
| 1 | Does my solution fully address ALL stated requirements? | Partial solutions = failed task |
| 2 | Have I verified every assumption against available evidence? | Unverified assumptions = potential failures |
| 3 | Are there edge cases or error scenarios I haven't handled? | Edge cases cause production issues |
| 4 | Does my solution follow existing patterns in the codebase? | Pattern violations create maintenance debt |
| 5 | Is my solution clear enough for someone else to understand and use? | Unclear output reduces value |

### 2. Answer Each Question with Evidence

For each question, examine your solution and provide specific evidence:

[Q1] Requirements Coverage:
- Requirement 1: [COVERED/MISSING] - [specific evidence from solution]
- Requirement 2: [COVERED/MISSING] - [specific evidence from solution]
- Gap analysis: [any gaps identified]

[Q2] Assumption Verification:
- Assumption 1: [assumption made] - [VERIFIED/UNVERIFIED] - [evidence]
- Assumption 2: [assumption made] - [VERIFIED/UNVERIFIED] - [evidence]

[Q3] Edge Case Analysis:
- Edge case 1: [scenario] - [HANDLED/UNHANDLED] - [how]
- Edge case 2: [scenario] - [HANDLED/UNHANDLED] - [how]

[Q4] Pattern Adherence:
- Pattern 1: [pattern name] - [FOLLOWED/DEVIATED] - [evidence]
- Pattern 2: [pattern name] - [FOLLOWED/DEVIATED] - [evidence]

[Q5] Clarity Assessment:
- Is the solution well-organized? [YES/NO]
- Are complex parts explained? [YES/NO]
- Could someone else use this immediately? [YES/NO]

### 3. Revise If Needed

If ANY verification question reveals a gap:
1. **STOP** - Do not submit incomplete work
2. **FIX** - Address the specific gap identified
3. **RE-VERIFY** - Confirm the fix resolves the issue
4. **DOCUMENT** - Note what was changed and why

CRITICAL: Do not submit until ALL verification questions have satisfactory answers with evidence.
```

### 阶段 5：分派子代理

使用 Task 工具按所选配置进行分派：

```
Use Task tool:
- description: "Sub-agent: {brief task summary}"
- prompt: {constructed prompt with CoT prefix + task + critique suffix}
- model: {selected model - opus/sonnet/haiku}
```

**上下文隔离提醒：** 仅传递与此特定任务相关的上下文。不要传递完整的对话历史记录。

## 示例

### 示例 1：复杂架构任务（Opus）

**输入：** `/launch-sub-agent Design a caching strategy for our API that handles 10k requests/second`

**分析：**

- 任务类型：架构 / 设计
- 复杂度：高（性能要求、系统设计）
- 输出篇幅：中等（设计文档）
- 领域匹配：sdd:software-architect

**选择：** Opus + sdd:software-architect 代理

**分派：** 使用 Opus 模型、sdd:software-architect 提示词、CoT 前缀和 critique 后缀调用 Task 工具

---

### 示例 2：简单文档更新（Haiku）

**输入：** `/launch-sub-agent Update the README to add --verbose flag to CLI options`

**分析：**

- 任务类型：文档（简单编辑）
- 复杂度：低（单个文件、定义明确）
- 输出篇幅：小（一个章节）
- 领域匹配：无需匹配（任务过于简单）

**选择：** Haiku（快速、经济，足以完成任务）

**分派：** 使用 Haiku 模型、基础 CoT 前缀和基础 critique 后缀调用 Task 工具

---

### 示例 3：中等难度的实现任务（Sonnet + Developer）

**输入：** `/launch-sub-agent Implement pagination for /users endpoint following patterns in /products`

**分析：**

- 任务类型：代码实现
- 复杂度：中等（遵循现有模式）
- 输出篇幅：中等（实现 + 测试）
- 领域匹配：sdd:developer

**选择：** Sonnet + sdd:developer 代理（不复杂，但需要领域专业知识）

**分派：** 使用 Sonnet 模型、sdd:developer 提示词、CoT 前缀和 critique 后缀调用 Task 工具

---

### 示例 4：研究任务（Opus + Researcher）

**输入：** `/launch-sub-agent Research authentication options for mobile app - evaluate OAuth2, SAML, passwordless`

**分析：**

- 任务类型：研究 / 比较
- 复杂度：高（比较分析、建议）
- 输出篇幅：大（综合研究报告）
- 领域匹配：sdd:researcher

**选择：** Opus + sdd:researcher 代理

**分派：** 使用 Opus 模型、sdd:researcher 提示词、CoT 前缀和 critique 后缀调用 Task 工具

## 最佳实践

### 上下文隔离

- 仅传递与特定任务相关的上下文
- 避免传递完整的对话历史记录
- 让子代理通过工具自行发现代码库中的模式
- 使用文件路径和引用，而不是嵌入大量内容

### 模型选择

- 如有疑问，使用 Opus（质量优先于成本）
- 仅将 Haiku 用于真正简单的任务
- 将 Sonnet 用于“繁重工作”——需要能力，但不需要天才般的表现
- 生产代码始终值得使用 Opus

### 专业化代理

- 当领域专业知识能够明显提升质量时使用
- 与 CoT 和 critique 模式结合使用
- 不要强行为通用任务指定专业化代理

### 质量门槛

- 自我批判循环不可协商
- 子代理必须先回答验证问题，然后才能完成任务
- 接受前必须审查子代理的输出